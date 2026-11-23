package fr.atheria.recit;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.mojang.brigadier.context.CommandContext;
import com.mojang.brigadier.exceptions.CommandSyntaxException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import net.minecraft.commands.CommandSourceStack;
import net.minecraft.core.particles.DustParticleOptions;
import net.minecraft.network.chat.Component;
import net.minecraft.resources.ResourceKey;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.core.registries.Registries;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.server.level.ServerPlayer;
import net.minecraft.sounds.SoundEvents;
import net.minecraft.sounds.SoundSource;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.levelgen.Heightmap;
import net.minecraft.world.phys.AABB;
import net.minecraft.world.phys.Vec3;
import net.neoforged.neoforge.common.NeoForge;
import net.neoforged.neoforge.event.entity.EntityTeleportEvent;
import net.neoforged.neoforge.event.entity.player.PlayerEvent;
import net.neoforged.neoforge.event.server.ServerStoppedEvent;
import net.neoforged.neoforge.event.tick.PlayerTickEvent;
import org.joml.Vector3f;

// Zones fermees jusqu'a un stade de la campagne : data/<espace>/atheria_zones/<id>.json
//   { "nom": "Campus Somaco", "dimension": "minecraft:overworld",
//     "boites": [ { "de": [x1, y1, z1], "a": [x2, y2, z2] }, { "de": [x1, z1], "a": [x2, z2] } ],   (2 nombres = toute la hauteur)
//     "ouverte_si": { "quete_finie": "1A2B..." },       (memes conditions que les dialogues : tag, sans_tag, vue, score, quete_*)
//     "message": "Le campus est bouclé.", "bordure": true, "active": true }
// Un joueur pour qui la zone est fermee est ramene a sa derniere position sure dehors (en descendant d'un vehicule),
// ses perles de l'End et fruits de chorus vers l'interieur sont annules, et il voit la bordure a l'approche.
// Creatif, spectateur et joueur en cinematique ou en dialogue ne sont pas concernes. Condition reverifiee chaque seconde.
final class Zones {
    record Zone(String id, String nom, ResourceKey<Level> dimension, List<AABB> boites, JsonObject si, String message, boolean bordure) {
        boolean contient(AABB b) {
            for (AABB x : boites) if (x.intersects(b)) return true;
            return false;
        }

        boolean contient(Vec3 v) {
            for (AABB x : boites) if (x.contains(v)) return true;
            return false;
        }

        double distance2(Vec3 v) {
            double best = Double.MAX_VALUE;
            for (AABB x : boites) {
                double dx = Math.max(0, Math.max(x.minX - v.x, v.x - x.maxX));
                double dy = Math.max(0, Math.max(x.minY - v.y, v.y - x.maxY));
                double dz = Math.max(0, Math.max(x.minZ - v.z, v.z - x.maxZ));
                best = Math.min(best, dx * dx + dy * dy + dz * dz);
            }
            return best;
        }
    }

    private record Sur(ResourceKey<Level> dim, Vec3 pos, float lacet, float tangage) {
    }

    private record Acces(boolean ouvert, long tick) {
    }

    static volatile List<Zone> ZONES = List.of();
    private static final Map<UUID, Sur> SURS = new HashMap<>();
    private static final Map<UUID, Map<String, Acces>> ACCES = new HashMap<>();
    private static final Map<UUID, Long> DERNIER_MESSAGE = new HashMap<>();
    private static final double APPROCHE = 6;
    private static final DustParticleOptions POUSSIERE = new DustParticleOptions(new Vector3f(0.75f, 0.2f, 0.15f), 1.2f);

    private Zones() {
    }

    static void brancher() {
        NeoForge.EVENT_BUS.addListener(Zones::tick);
        NeoForge.EVENT_BUS.addListener(Zones::teleportation);
        NeoForge.EVENT_BUS.addListener((PlayerEvent.PlayerLoggedOutEvent e) -> oublier(e.getEntity().getUUID()));
        NeoForge.EVENT_BUS.addListener((PlayerEvent.PlayerChangedDimensionEvent e) -> SURS.remove(e.getEntity().getUUID()));
        NeoForge.EVENT_BUS.addListener((ServerStoppedEvent e) -> {
            SURS.clear();
            ACCES.clear();
            DERNIER_MESSAGE.clear();
        });
    }

    private static void oublier(UUID u) {
        SURS.remove(u);
        ACCES.remove(u);
        DERNIER_MESSAGE.remove(u);
    }

    static void charger(Map<ResourceLocation, JsonElement> lus) {
        List<Zone> zones = new ArrayList<>();
        lus.forEach((rl, json) -> {
            try {
                JsonObject o = json.getAsJsonObject();
                if (o.has("active") && !o.get("active").getAsBoolean()) return;
                String id = Donnees.nom(rl);
                ResourceKey<Level> dim = ResourceKey.create(Registries.DIMENSION,
                        ResourceLocation.parse(o.has("dimension") ? o.get("dimension").getAsString() : "minecraft:overworld"));
                List<AABB> boites = new ArrayList<>();
                for (JsonElement el : o.getAsJsonArray("boites")) {
                    JsonObject b = el.getAsJsonObject();
                    boites.add(boite(b.getAsJsonArray("de"), b.getAsJsonArray("a")));
                }
                if (boites.isEmpty()) throw new IllegalArgumentException("pas de \"boites\"");
                JsonObject si = o.has("ouverte_si") ? o.getAsJsonObject("ouverte_si") : new JsonObject();
                JsonObject cond = new JsonObject();
                cond.add("si", si);
                String nom = o.has("nom") ? o.get("nom").getAsString() : id;
                String msg = o.has("message") ? o.get("message").getAsString() : nom + " : tu ne peux pas encore entrer ici.";
                boolean bord = !o.has("bordure") || o.get("bordure").getAsBoolean();
                zones.add(new Zone(id, nom, dim, List.copyOf(boites), cond, msg, bord));
            } catch (Exception ex) {
                Donnees.LOG.error("Zone {} illisible : {}", rl, ex.toString());
            }
        });
        ZONES = List.copyOf(zones);
        ACCES.clear();
        Donnees.LOG.info("{} zone(s) fermee(s) : {}", zones.size(), zones.stream().map(Zone::id).toList());
    }

    // les deux coins sont inclus ; 2 nombres [x, z] = du fond du monde au plafond
    private static AABB boite(JsonArray de, JsonArray a) {
        boolean plat = de.size() == 2;
        double x1 = de.get(0).getAsDouble(), x2 = a.get(0).getAsDouble();
        double z1 = de.get(plat ? 1 : 2).getAsDouble(), z2 = a.get(plat ? 1 : 2).getAsDouble();
        double y1 = plat ? -2048 : de.get(1).getAsDouble(), y2 = plat ? 2048 : a.get(1).getAsDouble();
        return new AABB(Math.min(x1, x2), Math.min(y1, y2), Math.min(z1, z2), Math.max(x1, x2) + 1, Math.max(y1, y2) + 1, Math.max(z1, z2) + 1);
    }

    private static boolean concerne(ServerPlayer p) {
        return !p.isCreative() && !p.isSpectator() && p.isAlive() && !Protection.protege(p);
    }

    static boolean ouverte(ServerPlayer p, Zone z) {
        Map<String, Acces> m = ACCES.computeIfAbsent(p.getUUID(), k -> new HashMap<>());
        long t = p.serverLevel().getGameTime();
        Acces a = m.get(z.id());
        if (a == null || t - a.tick() >= 20 || t < a.tick()) {
            a = new Acces(Dialogues.condition(p, z.si()), t);
            m.put(z.id(), a);
        }
        return a.ouvert();
    }

    private static void tick(PlayerTickEvent.Post e) {
        if (!(e.getEntity() instanceof ServerPlayer p)) return;
        List<Zone> zones = ZONES;
        if (zones.isEmpty() || !concerne(p)) return;
        ResourceKey<Level> dim = p.level().dimension();
        AABB corps = p.getBoundingBox();
        Vec3 pos = p.position();
        for (Zone z : zones) {
            if (z.dimension() != dim) continue;
            if (z.contient(corps)) {
                if (ouverte(p, z)) continue;
                repousser(p, z);
                return;
            }
            if (z.bordure() && p.tickCount % 10 == 0 && z.distance2(pos) < APPROCHE * APPROCHE && !ouverte(p, z)) bordure(p, z);
        }
        // derniere position sure : dehors de toute zone fermee pour lui, au sol, pas en train de tomber
        if (p.tickCount % 10 == 0 && (p.onGround() || p.isPassenger()) && p.fallDistance < 1) {
            SURS.put(p.getUUID(), new Sur(dim, pos, p.getYRot(), p.getXRot()));
        }
    }

    private static void repousser(ServerPlayer p, Zone z) {
        ServerLevel level = p.serverLevel();
        if (p.isPassenger()) p.stopRiding();
        Sur s = SURS.get(p.getUUID());
        Vec3 cible = null;
        float lacet = p.getYRot(), tangage = p.getXRot();
        if (s != null && s.dim() == level.dimension() && s.pos().distanceToSqr(p.position()) < 96 * 96
                && !fermee(p, p.getBoundingBox().move(s.pos().subtract(p.position())))) {
            cible = s.pos();
        }
        if (cible == null) cible = sortie(level, p, z);
        // dernier recours si la sortie tombe dans une autre zone fermee : le point d'apparition du monde
        if (fermee(p, p.getBoundingBox().move(cible.subtract(p.position())))) cible = Vec3.atBottomCenterOf(level.getSharedSpawnPos());
        p.teleportTo(level, cible.x, cible.y, cible.z, lacet, tangage);
        p.setDeltaMovement(Vec3.ZERO);
        p.hurtMarked = true;
        p.fallDistance = 0;
        long t = level.getGameTime();
        Long dernier = DERNIER_MESSAGE.get(p.getUUID());
        if (dernier == null || t - dernier > 60 || t < dernier) {
            DERNIER_MESSAGE.put(p.getUUID(), t);
            p.displayClientMessage(Component.literal(z.message()), true);
            level.playSound(null, p.getX(), p.getY(), p.getZ(), SoundEvents.VILLAGER_NO, SoundSource.PLAYERS, 0.4f, 0.8f);
        }
    }

    private static boolean fermee(ServerPlayer p, AABB corps) {
        for (Zone z : ZONES) if (z.dimension() == p.level().dimension() && z.contient(corps) && !ouverte(p, z)) return true;
        return false;
    }

    // pas de position sure connue (connexion ou reapparition a l'interieur) : sortie par le bord le plus proche, au sol
    private static Vec3 sortie(ServerLevel level, ServerPlayer p, Zone z) {
        Vec3 v = p.position();
        Vec3 best = null;
        double bestD = Double.MAX_VALUE;
        for (AABB b : z.boites()) {
            if (!b.contains(v) && !b.intersects(p.getBoundingBox())) continue;
            double[][] c = {
                    {b.minX - 1.5, v.z}, {b.maxX + 1.5, v.z}, {v.x, b.minZ - 1.5}, {v.x, b.maxZ + 1.5}};
            for (double[] xz : c) {
                double d = (xz[0] - v.x) * (xz[0] - v.x) + (xz[1] - v.z) * (xz[1] - v.z);
                if (d < bestD) {
                    bestD = d;
                    best = new Vec3(xz[0], v.y, xz[1]);
                }
            }
        }
        if (best == null) best = v;
        int y = level.getHeight(Heightmap.Types.MOTION_BLOCKING_NO_LEAVES, (int) Math.floor(best.x), (int) Math.floor(best.z));
        Vec3 sol = new Vec3(best.x, y, best.z);
        // si le sol trouve tombe dans une autre boite fermee de la meme zone, on garde la hauteur actuelle
        return z.contient(sol) ? best : sol;
    }

    private static void bordure(ServerPlayer p, Zone z) {
        ServerLevel level = p.serverLevel();
        Vec3 v = p.position();
        for (AABB b : z.boites()) {
            double cx = Math.max(b.minX, Math.min(b.maxX, v.x));
            double cy = Math.max(b.minY, Math.min(b.maxY, v.y + 1));
            double cz = Math.max(b.minZ, Math.min(b.maxZ, v.z));
            if (v.distanceToSqr(cx, cy, cz) > APPROCHE * APPROCHE) continue;
            // un petit mur de poussiere rouge sur la face la plus proche, visible du seul joueur concerne
            boolean faceX = Math.abs(cx - v.x) >= Math.abs(cz - v.z);
            for (int i = -2; i <= 2; i++) {
                for (int j = 0; j <= 2; j++) {
                    double px = faceX ? cx : cx + i * 0.8;
                    double pz = faceX ? cz + i * 0.8 : cz;
                    level.sendParticles(p, POUSSIERE, false, px, cy - 1 + j * 0.8, pz, 1, 0.05, 0.05, 0.05, 0);
                }
            }
        }
    }

    // perle de l'End, fruit de chorus : on n'atterrit pas dans une zone fermee
    private static void teleportation(EntityTeleportEvent e) {
        if (!(e instanceof EntityTeleportEvent.EnderPearl) && !(e instanceof EntityTeleportEvent.ChorusFruit)) return;
        if (!(e.getEntity() instanceof ServerPlayer p) || !concerne(p)) return;
        Vec3 arrivee = new Vec3(e.getTargetX(), e.getTargetY(), e.getTargetZ());
        AABB corps = p.getBoundingBox().move(arrivee.subtract(p.position()));
        for (Zone z : ZONES) {
            if (z.dimension() == p.level().dimension() && z.contient(corps) && !ouverte(p, z)) {
                e.setCanceled(true);
                p.displayClientMessage(Component.literal(z.message()), true);
                return;
            }
        }
    }

    static int lister(CommandContext<CommandSourceStack> c) throws CommandSyntaxException {
        ServerPlayer p = c.getSource().getPlayerOrException();
        List<Zone> zones = ZONES;
        if (zones.isEmpty()) {
            c.getSource().sendSuccess(() -> Component.literal("Aucune zone fermée."), false);
            return 0;
        }
        for (Zone z : zones) {
            boolean o = Dialogues.condition(p, z.si());
            c.getSource().sendSuccess(() -> Component.literal(z.nom() + " (" + z.id() + ") : " + (o ? "ouverte" : "fermée") + " pour toi"), false);
        }
        return zones.size();
    }
}
