package fr.atheria.bestiaire;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.mojang.brigadier.arguments.StringArgumentType;
import com.mojang.brigadier.context.CommandContext;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import net.minecraft.commands.CommandSourceStack;
import net.minecraft.commands.Commands;
import net.minecraft.commands.SharedSuggestionProvider;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Holder;
import net.minecraft.core.HolderLookup;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.nbt.CompoundTag;
import net.minecraft.network.chat.Component;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.server.MinecraftServer;
import net.minecraft.server.level.ServerBossEvent;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.server.level.ServerPlayer;
import net.minecraft.server.packs.resources.ResourceManager;
import net.minecraft.server.packs.resources.SimpleJsonResourceReloadListener;
import net.minecraft.util.RandomSource;
import net.minecraft.util.profiling.ProfilerFiller;
import net.minecraft.world.BossEvent;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.Mob;
import net.minecraft.world.entity.MobSpawnType;
import net.minecraft.world.entity.ai.attributes.Attribute;
import net.minecraft.world.entity.ai.attributes.AttributeInstance;
import net.minecraft.world.entity.ai.attributes.Attributes;
import net.minecraft.world.level.saveddata.SavedData;
import net.minecraft.world.phys.AABB;
import net.minecraft.world.phys.Vec3;
import net.neoforged.neoforge.common.NeoForge;
import net.neoforged.neoforge.event.EventHooks;
import net.neoforged.neoforge.event.RegisterCommandsEvent;
import net.neoforged.neoforge.event.entity.EntityJoinLevelEvent;
import net.neoforged.neoforge.event.entity.EntityLeaveLevelEvent;
import net.neoforged.neoforge.event.entity.living.LivingDeathEvent;
import net.neoforged.neoforge.event.server.ServerStoppedEvent;
import net.neoforged.neoforge.event.tick.LevelTickEvent;

// Les infectes uniques (boss de lieu) : data/<espace>/atheria_uniques/<id>.json
//   { "nom": "La Mère du Nid", "entite": "spore:reconstructor", "couleur": "red",
//     "attributs": { "minecraft:generic.max_health": 400 }, "immobile": true, "sans_gravite": true,
//     "naissances": { "entites": ["spore:volatile"], "toutes_les": 25, "max": 6, "distance_joueur": 28 } }
// /bestiaire unique <id> le fait apparaitre a l'endroit de la commande (a placer sur la carte finale).
// Un seul exemplaire : refuse s'il existe deja ou s'il a ete vaincu (sauf avec "force").
// Nom affiche, ne disparait jamais (le nom le protege aussi du nettoyage de Spore), barre de vie a l'approche.
final class Uniques {
    private static final Gson GSON = new Gson();
    static final String CLE = "atheria_unique";
    private static final String ENFANT = "atheria_enfant";
    private static final double DISTANCE_BARRE = 40;

    record Unique(String id, String nom, EntityType<?> type, BossEvent.BossBarColor couleur, Map<Holder<Attribute>, Double> attributs,
                  boolean immobile, boolean sansGravite, List<EntityType<?>> naissances, int toutesLes, int max, double distanceJoueur) {
    }

    static volatile Map<String, Unique> UNIQUES = Map.of();
    private static final Map<UUID, Mob> CHARGES = new HashMap<>();
    private static final Map<UUID, ServerBossEvent> BARRES = new HashMap<>();
    private static final Map<UUID, Long> PROCHAINE = new HashMap<>();

    private Uniques() {
    }

    static void brancher() {
        NeoForge.EVENT_BUS.addListener(Uniques::commandes);
        NeoForge.EVENT_BUS.addListener(Uniques::arrivee);
        NeoForge.EVENT_BUS.addListener(Uniques::depart);
        NeoForge.EVENT_BUS.addListener(Uniques::mort);
        NeoForge.EVENT_BUS.addListener(Uniques::tick);
        NeoForge.EVENT_BUS.addListener((ServerStoppedEvent e) -> {
            BARRES.values().forEach(ServerBossEvent::removeAllPlayers);
            BARRES.clear();
            CHARGES.clear();
            PROCHAINE.clear();
        });
    }

    static SimpleJsonResourceReloadListener chargeur() {
        return new SimpleJsonResourceReloadListener(GSON, "atheria_uniques") {
            @Override
            protected void apply(Map<ResourceLocation, JsonElement> lus, ResourceManager rm, ProfilerFiller pf) {
                Map<String, Unique> m = new HashMap<>();
                lus.forEach((rl, json) -> {
                    try {
                        Unique u = lire(rl.getPath(), json.getAsJsonObject());
                        if (u != null) m.put(u.id(), u);
                    } catch (Exception ex) {
                        AtheriaBestiaire.LOG.error("Unique {} illisible : {}", rl, ex.toString());
                    }
                });
                UNIQUES = Map.copyOf(m);
                AtheriaBestiaire.LOG.info("{} unique(s) : {}", m.size(), m.keySet());
            }
        };
    }

    private static Unique lire(String id, JsonObject o) {
        EntityType<?> t = BuiltInRegistries.ENTITY_TYPE.getOptional(ResourceLocation.parse(o.get("entite").getAsString())).orElse(null);
        if (t == null) {
            AtheriaBestiaire.LOG.warn("Unique {} : entite inconnue {}", id, o.get("entite").getAsString());
            return null;
        }
        String nom = o.has("nom") ? o.get("nom").getAsString() : id;
        BossEvent.BossBarColor couleur = BossEvent.BossBarColor.byName(o.has("couleur") ? o.get("couleur").getAsString() : "red");
        Map<Holder<Attribute>, Double> attr = new HashMap<>();
        if (o.has("attributs")) for (Map.Entry<String, JsonElement> a : o.getAsJsonObject("attributs").entrySet()) {
            var h = BuiltInRegistries.ATTRIBUTE.getHolder(ResourceLocation.parse(a.getKey()));
            if (h.isPresent()) attr.put(h.get(), a.getValue().getAsDouble());
            else AtheriaBestiaire.LOG.warn("Unique {} : attribut inconnu {}", id, a.getKey());
        }
        List<EntityType<?>> nes = new ArrayList<>();
        int toutesLes = 30, max = 0;
        double dist = 24;
        if (o.has("naissances")) {
            JsonObject n = o.getAsJsonObject("naissances");
            for (JsonElement e : n.getAsJsonArray("entites"))
                BuiltInRegistries.ENTITY_TYPE.getOptional(ResourceLocation.parse(e.getAsString())).ifPresent(nes::add);
            if (n.has("toutes_les")) toutesLes = Math.max(5, n.get("toutes_les").getAsInt());
            max = n.has("max") ? Math.max(0, n.get("max").getAsInt()) : 4;
            if (n.has("distance_joueur")) dist = n.get("distance_joueur").getAsDouble();
        }
        return new Unique(id, nom, t, couleur, Map.copyOf(attr), o.has("immobile") && o.get("immobile").getAsBoolean(),
                o.has("sans_gravite") && o.get("sans_gravite").getAsBoolean(), List.copyOf(nes), toutesLes, max, dist);
    }

    // ---------- etat sauvegarde : qui existe, qui a ete vaincu ----------

    static final class Etat extends SavedData {
        final Map<String, UUID> vivants = new HashMap<>();
        final Map<String, Boolean> vaincus = new HashMap<>();

        @Override
        public CompoundTag save(CompoundTag t, HolderLookup.Provider p) {
            CompoundTag v = new CompoundTag();
            vivants.forEach((k, u) -> v.putUUID(k, u));
            CompoundTag d = new CompoundTag();
            vaincus.forEach(d::putBoolean);
            t.put("vivants", v);
            t.put("vaincus", d);
            return t;
        }

        static Etat charger(CompoundTag t, HolderLookup.Provider p) {
            Etat e = new Etat();
            CompoundTag v = t.getCompound("vivants");
            for (String k : v.getAllKeys()) if (v.hasUUID(k)) e.vivants.put(k, v.getUUID(k));
            CompoundTag d = t.getCompound("vaincus");
            for (String k : d.getAllKeys()) e.vaincus.put(k, d.getBoolean(k));
            return e;
        }
    }

    static Etat etat(MinecraftServer s) {
        return s.overworld().getDataStorage().computeIfAbsent(new SavedData.Factory<>(Etat::new, Etat::charger, null), "atheria_uniques");
    }

    // ---------- commande ----------

    private static void commandes(RegisterCommandsEvent e) {
        e.getDispatcher().register(Commands.literal("bestiaire").requires(s -> s.hasPermission(2))
                .then(Commands.literal("unique")
                        .then(Commands.argument("id", StringArgumentType.word())
                                .suggests((c, b) -> SharedSuggestionProvider.suggest(UNIQUES.keySet(), b))
                                .executes(c -> placer(c, false))
                                .then(Commands.literal("force").executes(c -> placer(c, true)))))
                .then(Commands.literal("uniques").executes(Uniques::lister)));
    }

    private static int placer(CommandContext<CommandSourceStack> c, boolean force) {
        CommandSourceStack s = c.getSource();
        String id = StringArgumentType.getString(c, "id");
        Unique u = UNIQUES.get(id);
        if (u == null) {
            s.sendFailure(Component.literal("Unique inconnu : " + id + " (voir data/atheria/atheria_uniques)"));
            return 0;
        }
        Etat etat = etat(s.getServer());
        UUID ancien = etat.vivants.get(id);
        if (!force) {
            if (ancien != null) {
                s.sendFailure(Component.literal(u.nom() + " existe déjà. Ajoute « force » pour en refaire un (l'ancien disparaît s'il est chargé)."));
                return 0;
            }
            if (Boolean.TRUE.equals(etat.vaincus.get(id))) {
                s.sendFailure(Component.literal(u.nom() + " a déjà été vaincu. Ajoute « force » pour le faire revenir."));
                return 0;
            }
        }
        ServerLevel level = s.getLevel();
        if (ancien != null) {
            for (ServerLevel l : s.getServer().getAllLevels()) {
                Entity en = l.getEntity(ancien);
                if (en != null) en.discard();
            }
        }
        Entity en = u.type().create(level);
        if (!(en instanceof Mob m)) {
            if (en != null) en.discard();
            s.sendFailure(Component.literal(EntityType.getKey(u.type()) + " n'est pas une créature"));
            return 0;
        }
        Vec3 p = s.getPosition();
        m.moveTo(p.x, p.y, p.z, s.getRotation().y, 0f);
        EventHooks.finalizeMobSpawn(m, level, level.getCurrentDifficultyAt(BlockPos.containing(p)), MobSpawnType.COMMAND, null);
        u.attributs().forEach((a, v) -> {
            AttributeInstance i = m.getAttribute(a);
            if (i != null) i.setBaseValue(v);
        });
        if (u.immobile()) {
            AttributeInstance vit = m.getAttribute(Attributes.MOVEMENT_SPEED);
            if (vit != null) vit.setBaseValue(0);
            AttributeInstance recul = m.getAttribute(Attributes.KNOCKBACK_RESISTANCE);
            if (recul != null) recul.setBaseValue(1);
        }
        if (u.sansGravite()) m.setNoGravity(true);
        m.setHealth(m.getMaxHealth());
        m.setCustomName(Component.literal(u.nom()));
        m.setCustomNameVisible(true);
        m.setPersistenceRequired();
        m.getPersistentData().putString(CLE, id);
        // l'etat d'abord : l'arrivee dans le monde verifie que c'est bien l'exemplaire en place
        UUID avant = etat.vivants.put(id, m.getUUID());
        Boolean vaincu = etat.vaincus.remove(id);
        if (!level.tryAddFreshEntityWithPassengers(m)) {
            if (avant != null) etat.vivants.put(id, avant);
            else etat.vivants.remove(id);
            if (vaincu != null) etat.vaincus.put(id, vaincu);
            s.sendFailure(Component.literal(u.nom() + " n'a pas pu apparaître ici."));
            return 0;
        }
        etat.setDirty();
        s.sendSuccess(() -> Component.literal(u.nom() + " est en place."), true);
        return 1;
    }

    private static int lister(CommandContext<CommandSourceStack> c) {
        Etat etat = etat(c.getSource().getServer());
        if (UNIQUES.isEmpty()) {
            c.getSource().sendFailure(Component.literal("Aucun unique défini."));
            return 0;
        }
        for (Unique u : UNIQUES.values()) {
            String st = etat.vivants.containsKey(u.id()) ? "en place" : Boolean.TRUE.equals(etat.vaincus.get(u.id())) ? "vaincu" : "pas encore placé";
            c.getSource().sendSuccess(() -> Component.literal(u.nom() + " (" + u.id() + ") : " + st), false);
        }
        return UNIQUES.size();
    }

    // ---------- suivi en jeu ----------

    private static String id(Entity e) {
        return e instanceof Mob m && m.getPersistentData().contains(CLE) ? m.getPersistentData().getString(CLE) : null;
    }

    private static void arrivee(EntityJoinLevelEvent e) {
        String id = e.getLevel().isClientSide() ? null : id(e.getEntity());
        if (id == null) return;
        // un ancien exemplaire remplace par "force" (ou deja vaincu) qui se recharge : il n'existe plus
        MinecraftServer s = e.getLevel().getServer();
        if (s != null && !e.getEntity().getUUID().equals(etat(s).vivants.get(id))) {
            e.setCanceled(true);
            return;
        }
        CHARGES.put(e.getEntity().getUUID(), (Mob) e.getEntity());
    }

    private static void depart(EntityLeaveLevelEvent e) {
        if (e.getLevel().isClientSide()) return;
        UUID u = e.getEntity().getUUID();
        if (CHARGES.remove(u) == null) return;
        ServerBossEvent b = BARRES.remove(u);
        if (b != null) b.removeAllPlayers();
        PROCHAINE.remove(u);
    }

    private static void mort(LivingDeathEvent e) {
        String id = id(e.getEntity());
        if (id == null || e.getEntity().level().isClientSide()) return;
        Etat etat = etat(e.getEntity().getServer());
        if (e.getEntity().getUUID().equals(etat.vivants.get(id))) {
            etat.vivants.remove(id);
            etat.vaincus.put(id, true);
            etat.setDirty();
        }
    }

    private static void tick(LevelTickEvent.Post e) {
        if (!(e.getLevel() instanceof ServerLevel level) || CHARGES.isEmpty() || level.getGameTime() % 10 != 0) return;
        for (Mob m : new ArrayList<>(CHARGES.values())) {
            if (m.level() != level || !m.isAlive()) continue;
            Unique u = UNIQUES.get(id(m));
            barre(level, m, u);
            if (u != null && !u.naissances().isEmpty() && u.max() > 0) naissances(level, m, u);
        }
    }

    private static void barre(ServerLevel level, Mob m, Unique u) {
        ServerBossEvent b = BARRES.computeIfAbsent(m.getUUID(), k -> new ServerBossEvent(m.getDisplayName(),
                u == null ? BossEvent.BossBarColor.RED : u.couleur(), BossEvent.BossBarOverlay.PROGRESS));
        b.setProgress(Math.max(0f, Math.min(1f, m.getHealth() / m.getMaxHealth())));
        double d2 = DISTANCE_BARRE * DISTANCE_BARRE;
        for (ServerPlayer p : new ArrayList<>(b.getPlayers())) {
            if (p.level() != level || !p.isAlive() || p.distanceToSqr(m) > d2) b.removePlayer(p);
        }
        for (ServerPlayer p : level.players()) {
            if (p.isAlive() && !p.isSpectator() && p.distanceToSqr(m) <= d2) b.addPlayer(p);
        }
    }

    private static void naissances(ServerLevel level, Mob mere, Unique u) {
        long t = level.getGameTime();
        Long prochaine = PROCHAINE.get(mere.getUUID());
        if (prochaine != null && t < prochaine) return;
        PROCHAINE.put(mere.getUUID(), t + u.toutesLes() * 20L);
        if (level.getNearestPlayer(mere.getX(), mere.getY(), mere.getZ(), u.distanceJoueur(), true) == null) return;
        String cle = mere.getUUID().toString();
        int enfants = level.getEntitiesOfClass(Mob.class, new AABB(mere.blockPosition()).inflate(40),
                x -> x.isAlive() && cle.equals(x.getPersistentData().getString(ENFANT))).size();
        if (enfants >= u.max()) return;
        RandomSource r = level.getRandom();
        // la mere peut etre au plafond : on cherche le sol en dessous d'elle
        BlockPos bas = mere.blockPosition();
        for (int i = 0; i < 16 && level.getBlockState(bas.below()).getCollisionShape(level, bas.below()).isEmpty(); i++) bas = bas.below();
        BlockPos p = Dakouane.sol(level, bas.offset(r.nextInt(7) - 3, 0, r.nextInt(7) - 3));
        if (p == null) p = Dakouane.sol(level, bas);
        if (p == null) return;
        EntityType<?> type = u.naissances().get(r.nextInt(u.naissances().size()));
        Entity en = type.create(level);
        if (!(en instanceof Mob m)) {
            if (en != null) en.discard();
            return;
        }
        m.moveTo(p.getX() + 0.5, p.getY(), p.getZ() + 0.5, r.nextFloat() * 360f, 0f);
        if (!level.noCollision(m)) {
            m.discard();
            return;
        }
        EventHooks.finalizeMobSpawn(m, level, level.getCurrentDifficultyAt(p), MobSpawnType.MOB_SUMMONED, null);
        m.getPersistentData().putString(ENFANT, cle);
        LivingEntity cible = mere.getTarget();
        if (cible != null) m.setTarget(cible);
        level.addFreshEntityWithPassengers(m);
    }
}
