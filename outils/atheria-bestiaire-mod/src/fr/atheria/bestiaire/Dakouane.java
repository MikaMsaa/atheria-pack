package fr.atheria.bestiaire;

import java.lang.reflect.Method;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import net.minecraft.core.BlockPos;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.server.level.ServerPlayer;
import net.minecraft.util.RandomSource;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.Mob;
import net.minecraft.world.entity.MobSpawnType;
import net.minecraft.world.entity.SpawnPlacements;
import net.minecraft.world.item.BlockItem;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.LightLayer;
import net.minecraft.world.phys.AABB;
import net.minecraft.world.phys.Vec3;
import net.neoforged.fml.ModList;
import net.neoforged.neoforge.common.NeoForge;
import net.neoforged.neoforge.event.EventHooks;
import net.neoforged.neoforge.event.entity.living.FinalizeSpawnEvent;
import net.neoforged.neoforge.event.server.ServerStoppedEvent;
import net.neoforged.neoforge.event.tick.LevelTickEvent;

// Les Dakouane (tag atheria:dakouane : zombies vanilla, y compris ceux des hordes de The Hordes).
//  - En groupes : quand un zombie apparait naturellement, le groupe est complete au tick suivant jusqu'a 4 a 10,
//    sauf s'il y en a deja beaucoup autour (pas d'accumulation) ou si un groupe vient de naitre tout pres.
//  - Attires la nuit par la lumiere : lampe torche allumee (40 blocs), objet lumineux en main (24 blocs),
//    joueur dans un endroit eclaire, torches et lampes autour (20 blocs). Les Dakouane sans cible marchent vers lui.
final class Dakouane {
    private record Groupe(ServerLevel level, EntityType<?> type, BlockPos pos, long tick) {
    }

    private static final ArrayDeque<Groupe> A_COMPLETER = new ArrayDeque<>();
    private static final List<Groupe> RECENTS = new ArrayList<>();
    private static boolean enGroupe;

    private static boolean lampeEssayee;
    private static Class<?> lampe;
    private static Method allumee;

    private Dakouane() {
    }

    static void brancher() {
        NeoForge.EVENT_BUS.addListener(Dakouane::apparition);
        NeoForge.EVENT_BUS.addListener(Dakouane::tick);
        NeoForge.EVENT_BUS.addListener((ServerStoppedEvent e) -> {
            A_COMPLETER.clear();
            RECENTS.clear();
        });
    }

    // ---------- groupes ----------

    private static void apparition(FinalizeSpawnEvent e) {
        if (enGroupe || e.isSpawnCancelled() || e.getSpawnType() != MobSpawnType.NATURAL) return;
        Mob m = e.getEntity();
        if (!m.getType().is(AtheriaBestiaire.DAKOUANE) || !(e.getLevel().getLevel() instanceof ServerLevel level)) return;
        if (level.dimension() != Level.OVERWORLD) return;
        BlockPos pos = BlockPos.containing(e.getX(), e.getY(), e.getZ());
        long t = level.getGameTime();
        RECENTS.removeIf(g -> t - g.tick() > 60 * 20);
        for (Groupe g : RECENTS) if (g.level() == level && g.pos().distSqr(pos) < 24 * 24) return;
        Groupe g = new Groupe(level, m.getType(), pos, t);
        RECENTS.add(g);
        if (A_COMPLETER.size() < 64) A_COMPLETER.add(g);
    }

    private static void completer(Groupe g) {
        ServerLevel level = g.level();
        BlockPos c = g.pos();
        if (!level.isLoaded(c)) return;
        RandomSource r = level.getRandom();
        int voulu = 4 + r.nextInt(7);
        AABB proche = new AABB(c).inflate(10, 6, 10);
        int deja = level.getEntitiesOfClass(Mob.class, proche, x -> x.getType().is(AtheriaBestiaire.DAKOUANE) && x.isAlive()).size();
        int alentour = level.getEntitiesOfClass(Mob.class, new AABB(c).inflate(40, 20, 40), x -> x.getType().is(AtheriaBestiaire.DAKOUANE)).size();
        int manque = Math.min(voulu - deja, 18 - alentour);
        if (manque <= 0) return;
        @SuppressWarnings("unchecked")
        EntityType<Mob> type = (EntityType<Mob>) g.type();
        int essais = manque * 5;
        enGroupe = true;
        try {
            while (manque > 0 && essais-- > 0) {
                BlockPos p = sol(level, c.offset(r.nextInt(11) - 5, 0, r.nextInt(11) - 5));
                if (p == null || !SpawnPlacements.isSpawnPositionOk(type, level, p)
                        || !SpawnPlacements.checkSpawnRules(type, level, MobSpawnType.NATURAL, p, r)
                        || !level.noCollision(type.getSpawnAABB(p.getX() + 0.5, p.getY(), p.getZ() + 0.5))
                        || level.getNearestPlayer(p.getX() + 0.5, p.getY(), p.getZ() + 0.5, 24, false) != null) continue;
                Mob m = type.create(level);
                if (m == null) break;
                m.moveTo(p.getX() + 0.5, p.getY(), p.getZ() + 0.5, r.nextFloat() * 360f, 0f);
                EventHooks.finalizeMobSpawn(m, level, level.getCurrentDifficultyAt(p), MobSpawnType.NATURAL, null);
                if (m.isRemoved()) continue;
                level.addFreshEntityWithPassengers(m);
                manque--;
            }
        } finally {
            enGroupe = false;
        }
    }

    // un sol a moins de 3 blocs au-dessus ou en dessous, avec deux blocs libres pour se tenir
    static BlockPos sol(ServerLevel level, BlockPos p) {
        for (int dy = 2; dy >= -3; dy--) {
            BlockPos q = p.above(dy);
            if (!level.isLoaded(q)) return null;
            if (level.getBlockState(q.below()).isFaceSturdy(level, q.below(), net.minecraft.core.Direction.UP)
                    && level.getBlockState(q).getCollisionShape(level, q).isEmpty()
                    && level.getBlockState(q.above()).getCollisionShape(level, q.above()).isEmpty()
                    && level.getFluidState(q).isEmpty()) return q;
        }
        return null;
    }

    // ---------- lumiere ----------

    private static void tick(LevelTickEvent.Post e) {
        if (!(e.getLevel() instanceof ServerLevel level) || level.dimension() != Level.OVERWORLD) return;
        if (!A_COMPLETER.isEmpty()) {
            Groupe g;
            int n = 0;
            while (n++ < 4 && (g = A_COMPLETER.poll()) != null) completer(g);
        }
        if (level.getGameTime() % 40 != 0 || !nuit(level)) return;
        for (ServerPlayer p : level.players()) {
            if (p.isSpectator() || p.isCreative() || !p.isAlive()) continue;
            int portee = lumiere(level, p);
            if (portee > 0) attirer(level, p, portee);
        }
    }

    private static boolean nuit(ServerLevel level) {
        long t = level.getDayTime() % 24000L;
        return t >= 12600 && t <= 23400;
    }

    private static int lumiere(ServerLevel level, ServerPlayer p) {
        if (lampeAllumee(p.getMainHandItem()) || lampeAllumee(p.getOffhandItem())) return 40;
        if (lumineux(p.getMainHandItem()) || lumineux(p.getOffhandItem())) return 24;
        BlockPos pos = BlockPos.containing(p.getEyePosition());
        return level.getBrightness(LightLayer.BLOCK, pos) >= 11 ? 20 : 0;
    }

    private static boolean lumineux(ItemStack s) {
        return !s.isEmpty() && s.getItem() instanceof BlockItem b && b.getBlock().defaultBlockState().getLightEmission() >= 10;
    }

    private static boolean lampeAllumee(ItemStack s) {
        if (s.isEmpty()) return false;
        if (!lampeEssayee) {
            lampeEssayee = true;
            if (ModList.get().isLoaded("flashlight")) {
                try {
                    lampe = Class.forName("com.redking.flashlight.item.FlashlightItem");
                    allumee = lampe.getMethod("isOn", ItemStack.class);
                } catch (Throwable t) {
                    AtheriaBestiaire.LOG.warn("Lampe torche non reconnue, les Dakouane ignoreront son etat : {}", t.toString());
                }
            }
        }
        if (allumee == null || !lampe.isInstance(s.getItem())) return false;
        try {
            return (Boolean) allumee.invoke(null, s);
        } catch (Throwable t) {
            allumee = null;
            return false;
        }
    }

    private static void attirer(ServerLevel level, ServerPlayer p, int portee) {
        AABB zone = p.getBoundingBox().inflate(portee, 12, portee);
        List<Mob> mobs = level.getEntitiesOfClass(Mob.class, zone,
                m -> m.getType().is(AtheriaBestiaire.DAKOUANE) && m.isAlive() && m.getTarget() == null && !m.isNoAi());
        if (mobs.isEmpty()) return;
        if (mobs.size() > 20) {
            mobs = new ArrayList<>(mobs);
            mobs.sort((a, b) -> Double.compare(a.distanceToSqr(p), b.distanceToSqr(p)));
            mobs = mobs.subList(0, 20);
        }
        Vec3 c = p.position();
        for (Iterator<Mob> it = mobs.iterator(); it.hasNext(); ) {
            Mob m = it.next();
            if (m.distanceToSqr(p) < 4) continue;
            m.getNavigation().moveTo(c.x, c.y, c.z, 1.0);
        }
    }
}
