package fr.atheria.recit;

import com.google.gson.JsonElement;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import net.minecraft.nbt.CompoundTag;
import net.minecraft.nbt.ListTag;
import net.minecraft.nbt.StringTag;
import net.minecraft.nbt.Tag;
import net.minecraft.server.MinecraftServer;
import net.minecraft.server.level.ServerPlayer;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.Mob;
import net.neoforged.neoforge.common.NeoForge;
import net.neoforged.neoforge.event.entity.living.LivingChangeTargetEvent;
import net.neoforged.neoforge.event.entity.living.LivingIncomingDamageEvent;
import net.neoforged.neoforge.event.entity.living.LivingKnockBackEvent;
import net.neoforged.neoforge.event.entity.player.AttackEntityEvent;
import net.neoforged.neoforge.event.entity.player.PlayerEvent;
import net.neoforged.neoforge.event.tick.ServerTickEvent;
import net.neoforged.neoforge.network.PacketDistributor;

// Pendant une cinematique ou un dialogue, le joueur ne voit plus autour de lui :
// il devient invulnerable, invisible pour les autres joueurs, ignore des monstres, et ne peut frapper personne.
public final class Protection {
    public static final String CINEMATIQUE = "cinematique";
    public static final String DIALOGUE = "dialogue";
    private static final String CLE = "atheria_recit";

    private static final class Etat {
        final Map<String, Long> raisons = new HashMap<>(); // raison -> tick limite (filet de securite)
        boolean cache;
        String cinematique;
    }

    private static final Map<UUID, Etat> ETATS = new ConcurrentHashMap<>();
    // dernier tick ou le joueur a recu ou donne un coup (pour refuser /recit intro en plein combat)
    private static final Map<UUID, Long> DERNIER_COMBAT = new ConcurrentHashMap<>();
    private static final int COMBAT_TICKS = 15 * 20;
    private static final int RELANCE_TICKS = 60 * 20;
    private static final Map<UUID, Long> DERNIERE_INTRO = new ConcurrentHashMap<>();

    private Protection() {
    }

    static void brancher() {
        var bus = NeoForge.EVENT_BUS;
        bus.addListener(Protection::connexion);
        bus.addListener(Protection::deconnexion);
        bus.addListener(Protection::copieMort);
        bus.addListener(Protection::tick);
        bus.addListener(Protection::degats);
        bus.addListener(Protection::cible);
        bus.addListener(Protection::attaque);
        bus.addListener(Protection::recul);
    }

    public static boolean protege(Entity e) {
        return e instanceof ServerPlayer && ETATS.containsKey(e.getUUID());
    }

    // ---------- donnees du joueur (gardees a la mort) ----------
    static CompoundTag donnees(ServerPlayer p) {
        CompoundTag racine = p.getPersistentData();
        if (!racine.contains(CLE, Tag.TAG_COMPOUND)) racine.put(CLE, new CompoundTag());
        return racine.getCompound(CLE);
    }

    static boolean dejaVue(ServerPlayer p, String nom) {
        ListTag vues = donnees(p).getList("vues", Tag.TAG_STRING);
        for (int i = 0; i < vues.size(); i++) if (vues.getString(i).equals(nom)) return true;
        return false;
    }

    static void marquerVue(ServerPlayer p, String nom) {
        if (dejaVue(p, nom)) return;
        CompoundTag d = donnees(p);
        ListTag vues = d.getList("vues", Tag.TAG_STRING);
        vues.add(StringTag.valueOf(nom));
        d.put("vues", vues);
    }

    static void oublier(ServerPlayer p) {
        p.getPersistentData().remove(CLE);
    }

    // ---------- proteger / liberer ----------
    static void proteger(ServerPlayer p, String raison, int ticksMax) {
        Etat e = ETATS.get(p.getUUID());
        boolean nouveau = e == null;
        if (nouveau) e = new Etat();
        e.raisons.put(raison, (long) p.server.getTickCount() + ticksMax);
        if (nouveau) {
            ETATS.put(p.getUUID(), e);
            // les monstres qui le visaient deja le lachent
            for (Mob m : p.serverLevel().getEntitiesOfClass(Mob.class, p.getBoundingBox().inflate(64), m -> m.getTarget() == p)) m.setTarget(null);
        }
        visibilite(p, e);
    }

    // invisible et cache aux autres seulement pendant une cinematique ; en dialogue il reste visible
    private static void visibilite(ServerPlayer p, Etat e) {
        boolean cacher = e != null && e.raisons.containsKey(CINEMATIQUE);
        if (cacher) {
            if (!p.isInvisible()) p.setInvisible(true);
        } else if (p.isInvisible() && !p.hasEffect(net.minecraft.world.effect.MobEffects.INVISIBILITY) && !p.isSpectator()) {
            p.setInvisible(false);
        }
        if (e != null && e.cache != cacher) {
            e.cache = cacher;
            PacketDistributor.sendToAllPlayers(new Reseau.JoueurCache(p.getUUID(), cacher));
        }
    }

    static void liberer(ServerPlayer p, String raison) {
        Etat e = ETATS.get(p.getUUID());
        if (e == null) return;
        e.raisons.remove(raison);
        if (e.raisons.isEmpty()) ETATS.remove(p.getUUID());
        visibilite(p, e);
    }

    // raison du refus, ou null si le joueur peut revoir l'intro maintenant
    static String refusIntro(ServerPlayer p) {
        if (protege(p)) return "Une cinematique ou un dialogue est deja en cours.";
        String d = danger(p);
        if (d != null) return d;
        if (!p.getAbilities().instabuild && !p.onGround() && !p.isInWater() && !p.getAbilities().flying) return "Pose-toi d'abord au sol.";
        if (p.getHealth() < p.getMaxHealth() * 0.5f) return "Soigne-toi d'abord.";
        long now = p.server.getTickCount();
        Long derniere = DERNIERE_INTRO.get(p.getUUID());
        if (derniere != null && now - derniere < RELANCE_TICKS) return "Patiente une minute avant de la revoir.";
        DERNIERE_INTRO.put(p.getUUID(), now);
        return null;
    }

    // raison pour laquelle le joueur ne peut pas se mettre a l'abri d'une cinematique ou d'un dialogue, ou null
    static String danger(ServerPlayer p) {
        long now = p.server.getTickCount();
        Long combat = DERNIER_COMBAT.get(p.getUUID());
        if (combat != null && now - combat < COMBAT_TICKS) return "Impossible pendant un combat : attends quelques secondes a l'abri.";
        if (p.isOnFire() || p.isInLava()) return "Mets-toi d'abord en securite.";
        if (!p.getAbilities().instabuild && !p.getAbilities().flying && !p.onGround() && !p.isInWater() && p.fallDistance > 3) return "Pose-toi d'abord au sol.";
        boolean menace = !p.serverLevel().getEntitiesOfClass(Mob.class, p.getBoundingBox().inflate(24), m -> m.getTarget() == p && m.isAlive()).isEmpty();
        if (menace) return "Quelque chose te traque : mets-toi d'abord a l'abri.";
        return null;
    }

    // ---------- cinematiques ----------
    public static boolean lancerCinematique(ServerPlayer p, String nom) {
        Donnees.Cinematique c = Donnees.CINEMATIQUES.get(nom);
        if (c == null) return false;
        boolean vue = dejaVue(p, nom);
        boolean passable = switch (c.passable()) {
            case "jamais" -> false;
            case "deja_vue" -> vue;
            default -> true;
        };
        Etat e = ETATS.get(p.getUUID());
        if (e != null) e.cinematique = null;
        // filet de securite : duree + 2 minutes (chargement du monde, lenteurs)
        proteger(p, CINEMATIQUE, (int) ((c.duree() + 120) * 20));
        ETATS.get(p.getUUID()).cinematique = nom;
        PacketDistributor.sendToPlayer(p, new Reseau.JouerCinematique(nom, c.json(), passable));
        return true;
    }

    static void finCinematique(ServerPlayer p, String nom, boolean passee) {
        Etat e = ETATS.get(p.getUUID());
        if (e != null && nom.equals(e.cinematique)) {
            e.cinematique = null;
            liberer(p, CINEMATIQUE);
        }
        boolean premiere = !dejaVue(p, nom);
        marquerVue(p, nom);
        Donnees.Cinematique c = Donnees.CINEMATIQUES.get(nom);
        Donnees.LOG.info("Cinematique {} finie par {} ({})", nom, p.getGameProfile().getName(), passee ? "passee" : "vue en entier");
        if (c == null) return;
        // commandes lancees a la fin : la premiere fois seulement, ou a chaque fois
        if (premiere) commandes(p, c, "commandes_fin");
        commandes(p, c, "commandes_chaque_fois");
    }

    private static void commandes(ServerPlayer p, Donnees.Cinematique c, String cle) {
        if (!c.def().has(cle)) return;
        for (JsonElement cmd : c.def().getAsJsonArray(cle)) Dialogues.executer(p, cmd.getAsString());
    }

    // ---------- evenements ----------
    private static void connexion(PlayerEvent.PlayerLoggedInEvent ev) {
        if (!(ev.getEntity() instanceof ServerPlayer p)) return;
        // reste d'une protection interrompue (crash, arret brutal) : il redevient visible
        if (p.isInvisible() && !p.hasEffect(net.minecraft.world.effect.MobEffects.INVISIBILITY) && !p.isSpectator()) p.setInvisible(false);
        // le nouveau venu apprend qui est cache en ce moment
        ETATS.forEach((u, e) -> { if (e.cache) PacketDistributor.sendToPlayer(p, new Reseau.JoueurCache(u, true)); });
        // premiere connexion : l'intro part tout de suite, le client attend la fin du chargement sous un ecran noir
        // config/atheria_recit_sans_intro.txt present : pas d'intro automatique (mondes de test, captures)
        boolean sansIntro = java.nio.file.Files.exists(net.neoforged.fml.loading.FMLPaths.CONFIGDIR.get().resolve("atheria_recit_sans_intro.txt"));
        if (!sansIntro && !dejaVue(p, "intro") && Donnees.CINEMATIQUES.containsKey("intro")) lancerCinematique(p, "intro");
    }

    private static void deconnexion(PlayerEvent.PlayerLoggedOutEvent ev) {
        if (!(ev.getEntity() instanceof ServerPlayer p)) return;
        Dialogues.oublierSession(p);
        DERNIER_COMBAT.remove(p.getUUID());
        DERNIERE_INTRO.remove(p.getUUID());
        Etat e = ETATS.remove(p.getUUID());
        if (e == null) return;
        e.raisons.clear();
        visibilite(p, e);
    }

    private static void copieMort(PlayerEvent.Clone ev) {
        CompoundTag ancien = ev.getOriginal().getPersistentData();
        if (ancien.contains(CLE, Tag.TAG_COMPOUND)) ev.getEntity().getPersistentData().put(CLE, ancien.getCompound(CLE).copy());
    }

    private static void tick(ServerTickEvent.Post ev) {
        MinecraftServer s = ev.getServer();
        if (ETATS.isEmpty() || s.getTickCount() % 20 != 0) return;
        long maintenant = s.getTickCount();
        for (Map.Entry<UUID, Etat> en : ETATS.entrySet()) {
            ServerPlayer p = s.getPlayerList().getPlayer(en.getKey());
            if (p == null) {
                ETATS.remove(en.getKey());
                continue;
            }
            // un changement d'effet (potion, mod de soif ou de blessures) remet la visibilite du jeu de base : on la reimpose
            visibilite(p, en.getValue());
            for (Map.Entry<String, Long> r : Map.copyOf(en.getValue().raisons).entrySet()) {
                if (r.getValue() > maintenant) continue;
                Donnees.LOG.warn("Protection {} de {} levee par le filet de securite", r.getKey(), p.getGameProfile().getName());
                if (DIALOGUE.equals(r.getKey())) Dialogues.oublierSession(p);
                liberer(p, r.getKey());
            }
        }
    }

    private static void degats(LivingIncomingDamageEvent ev) {
        // le vide et /kill passent quand meme : sinon un joueur tombe sans fin sous le monde
        if (ev.getSource().is(net.minecraft.tags.DamageTypeTags.BYPASSES_INVULNERABILITY)) return;
        if (protege(ev.getEntity()) || protege(ev.getSource().getEntity())) {
            ev.setCanceled(true);
            return;
        }
        long now = ev.getEntity().getServer() == null ? 0 : ev.getEntity().getServer().getTickCount();
        if (ev.getEntity() instanceof ServerPlayer p) DERNIER_COMBAT.put(p.getUUID(), now);
        if (ev.getSource().getEntity() instanceof ServerPlayer p) DERNIER_COMBAT.put(p.getUUID(), now);
    }

    private static void cible(LivingChangeTargetEvent ev) {
        if (protege(ev.getNewAboutToBeSetTarget())) ev.setCanceled(true);
    }

    private static void attaque(AttackEntityEvent ev) {
        if (protege(ev.getEntity())) ev.setCanceled(true);
    }

    private static void recul(LivingKnockBackEvent ev) {
        if (protege(ev.getEntity())) ev.setCanceled(true);
    }
}
