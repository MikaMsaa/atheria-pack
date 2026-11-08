package fr.atheria.bestiaire;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.IdentityHashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Consumer;
import net.minecraft.core.Holder;
import net.minecraft.resources.ResourceKey;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.server.level.ServerPlayer;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.Mob;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.gameevent.GameEvent;
import net.minecraft.world.phys.Vec3;
import net.neoforged.bus.api.Event;
import net.neoforged.bus.api.EventPriority;
import net.neoforged.fml.ModList;
import net.neoforged.neoforge.common.NeoForge;
import net.neoforged.neoforge.event.VanillaGameEvent;
import net.neoforged.neoforge.event.entity.EntityJoinLevelEvent;
import net.neoforged.neoforge.event.entity.EntityLeaveLevelEvent;
import net.neoforged.neoforge.event.entity.living.LivingChangeTargetEvent;
import net.neoforged.neoforge.event.entity.living.LivingIncomingDamageEvent;
import net.neoforged.neoforge.event.server.ServerStoppedEvent;
import net.neoforged.neoforge.event.tick.LevelTickEvent;

// Les Chimiks (tag atheria:chimiks, spore:braiomil) sont aveugles et chassent au son, facon Warden.
//  - Un bruit (pas en courant, saut, porte, coffre, bloc casse, tir, moteur, explosion...) a une portee.
//    Un Chimik a portee retient d'ou il vient : s'il est loin il y marche, s'il est proche il attaque celui qui l'a fait.
//  - Il ne peut viser que ce qu'il a entendu dans les 5 dernieres secondes (ou ce qui le touche, au contact).
//  - Sans nouveau bruit pendant 8 secondes, il lache sa cible et va voir le dernier endroit entendu.
//  Accroupi, on ne fait pas de bruit en marchant ; immobile et silencieux, on n'existe pas pour lui.
final class Chimiks {
    private record Ouie(UUID source, Vec3 pos, long tick) {
    }

    private static final int MEMOIRE_VISEE = 5 * 20;
    private static final int MEMOIRE_TRAQUE = 8 * 20;
    private static final double CONTACT2 = 1.6 * 1.6;
    private static final double VITESSE = 1.15;

    // Chimiks charges par dimension : on ne parcourt qu'eux a chaque bruit (en general une poignee).
    private static final Map<ResourceKey<Level>, Map<Mob, Ouie>> ACTIFS = new HashMap<>();
    private static final Map<UUID, Vec3> VEHICULES = new HashMap<>();
    private static Map<GameEvent, Integer> PORTEES;

    private Chimiks() {
    }

    static void brancher() {
        NeoForge.EVENT_BUS.addListener(Chimiks::arrivee);
        NeoForge.EVENT_BUS.addListener(Chimiks::depart);
        NeoForge.EVENT_BUS.addListener(EventPriority.LOWEST, Chimiks::son);
        NeoForge.EVENT_BUS.addListener(EventPriority.LOW, Chimiks::cible);
        NeoForge.EVENT_BUS.addListener(EventPriority.LOWEST, Chimiks::douleur);
        NeoForge.EVENT_BUS.addListener(Chimiks::tick);
        NeoForge.EVENT_BUS.addListener((ServerStoppedEvent e) -> {
            ACTIFS.clear();
            VEHICULES.clear();
        });
        brancherTacz();
    }

    private static void arrivee(EntityJoinLevelEvent e) {
        if (e.getLevel().isClientSide() || !(e.getEntity() instanceof Mob m) || !m.getType().is(AtheriaBestiaire.CHIMIKS)) return;
        ACTIFS.computeIfAbsent(e.getLevel().dimension(), k -> new IdentityHashMap<>()).put(m, null);
    }

    private static void depart(EntityLeaveLevelEvent e) {
        if (e.getLevel().isClientSide() || !(e.getEntity() instanceof Mob m)) return;
        Map<Mob, Ouie> l = ACTIFS.get(e.getLevel().dimension());
        if (l != null) l.remove(m);
    }

    private static Map<GameEvent, Integer> portees() {
        if (PORTEES == null) {
            Map<GameEvent, Integer> p = new IdentityHashMap<>();
            p.put(GameEvent.HIT_GROUND.value(), 10);
            p.put(GameEvent.SPLASH.value(), 10);
            p.put(GameEvent.SWIM.value(), 6);
            p.put(GameEvent.BLOCK_OPEN.value(), 14);
            p.put(GameEvent.BLOCK_CLOSE.value(), 14);
            p.put(GameEvent.CONTAINER_OPEN.value(), 10);
            p.put(GameEvent.CONTAINER_CLOSE.value(), 10);
            p.put(GameEvent.BLOCK_ACTIVATE.value(), 8);
            p.put(GameEvent.BLOCK_DEACTIVATE.value(), 8);
            p.put(GameEvent.BLOCK_DESTROY.value(), 12);
            p.put(GameEvent.BLOCK_PLACE.value(), 8);
            p.put(GameEvent.PROJECTILE_SHOOT.value(), 12);
            p.put(GameEvent.PRIME_FUSE.value(), 10);
            p.put(GameEvent.EXPLODE.value(), 48);
            p.put(GameEvent.ENTITY_DAMAGE.value(), 10);
            p.put(GameEvent.EAT.value(), 4);
            p.put(GameEvent.DRINK.value(), 4);
            p.put(GameEvent.INSTRUMENT_PLAY.value(), 48);
            p.put(GameEvent.NOTE_BLOCK_PLAY.value(), 16);
            p.put(GameEvent.JUKEBOX_PLAY.value(), 24);
            p.put(GameEvent.ELYTRA_GLIDE.value(), 8);
            p.put(GameEvent.SHEAR.value(), 6);
            PORTEES = p;
        }
        return PORTEES;
    }

    private static void son(VanillaGameEvent e) {
        if (!(e.getLevel() instanceof ServerLevel level)) return;
        Map<Mob, Ouie> chimiks = ACTIFS.get(level.dimension());
        if (chimiks == null || chimiks.isEmpty()) return;
        Entity cause = e.getCause();
        if (AtheriaBestiaire.infecte(cause)) return;
        Holder<GameEvent> h = e.getVanillaEvent();
        int portee;
        if (h.value() == GameEvent.STEP.value()) {
            // marcher s'entend de pres, courir de loin ; accroupi, les pas ne declenchent meme pas l'evenement
            portee = cause instanceof LivingEntity le && le.isSprinting() ? 14 : 4;
        } else {
            Integer p = portees().get(h.value());
            if (p == null) return;
            portee = p;
        }
        entendre(level, chimiks, e.getEventPosition(), cause, portee);
    }

    static void entendre(ServerLevel level, Map<Mob, Ouie> chimiks, Vec3 pos, Entity cause, int portee) {
        if (cause instanceof Player p && (p.isSpectator() || p.isCreative())) return;
        double r2 = (double) portee * portee;
        long t = level.getGameTime();
        LivingEntity source = cause instanceof LivingEntity le && le.isAlive() ? le : null;
        ArrayList<Mob> proches = null;
        for (Map.Entry<Mob, Ouie> en : chimiks.entrySet()) {
            Mob m = en.getKey();
            if (m == source || !m.isAlive() || m.distanceToSqr(pos) > r2) continue;
            en.setValue(new Ouie(source == null ? null : source.getUUID(), pos, t));
            if (proches == null) proches = new ArrayList<>();
            proches.add(m);
        }
        if (proches == null) return;
        // apres la boucle : setTarget declenche des evenements, on ne touche pas la table pendant qu'on la parcourt
        for (Mob m : proches) {
            LivingEntity cur = m.getTarget();
            if (cur != null && cur != source && cur.isAlive()) continue;
            boolean attaque = source instanceof Player && m.distanceToSqr(source) <= Math.max(64, r2 * 0.36);
            if (attaque) {
                if (cur == null) m.setTarget(source);
            } else if (cur == null) {
                m.getNavigation().moveTo(pos.x, pos.y, pos.z, VITESSE);
            }
        }
    }

    private static Ouie ouie(Mob m) {
        Map<Mob, Ouie> l = ACTIFS.get(m.level().dimension());
        return l == null ? null : l.get(m);
    }

    private static boolean entendu(Mob m, LivingEntity t, int memoire) {
        if (m.distanceToSqr(t) < CONTACT2) return true;
        Ouie o = ouie(m);
        return o != null && o.source() != null && o.source().equals(t.getUUID()) && m.level().getGameTime() - o.tick() <= memoire;
    }

    // Toutes les facons de donner une cible a un Chimik passent par la : vue, alerte des autres infectes, riposte...
    private static void cible(LivingChangeTargetEvent e) {
        if (!(e.getEntity() instanceof Mob m) || m.level().isClientSide() || !m.getType().is(AtheriaBestiaire.CHIMIKS)) return;
        LivingEntity t = e.getNewAboutToBeSetTarget();
        if (t == null || entendu(m, t, MEMOIRE_VISEE)) return;
        e.setCanceled(true);
    }

    // Etre touche localise l'agresseur (coup au corps a corps, fleche, balle).
    private static void douleur(LivingIncomingDamageEvent e) {
        if (!(e.getEntity() instanceof Mob m) || m.level().isClientSide() || !m.getType().is(AtheriaBestiaire.CHIMIKS)) return;
        if (!(e.getSource().getEntity() instanceof LivingEntity a) || AtheriaBestiaire.infecte(a)) return;
        Map<Mob, Ouie> l = ACTIFS.get(m.level().dimension());
        if (l != null && l.containsKey(m)) l.put(m, new Ouie(a.getUUID(), a.position(), m.level().getGameTime()));
    }

    private static void tick(LevelTickEvent.Post e) {
        if (!(e.getLevel() instanceof ServerLevel level) || level.getGameTime() % 10 != 0) return;
        if (level.dimension() == Level.OVERWORLD && level.getGameTime() % 20 == 0) moteurs(level);
        Map<Mob, Ouie> chimiks = ACTIFS.get(level.dimension());
        if (chimiks == null || chimiks.isEmpty()) return;
        long t = level.getGameTime();
        ArrayList<Mob> lacher = null;
        for (Map.Entry<Mob, Ouie> en : chimiks.entrySet()) {
            Mob m = en.getKey();
            LivingEntity cible = m.getTarget();
            if (cible != null && !entendu(m, cible, MEMOIRE_TRAQUE)) {
                if (lacher == null) lacher = new ArrayList<>();
                lacher.add(m);
            }
            Ouie o = en.getValue();
            if (o != null && cible == null && t - o.tick() > 30 * 20) en.setValue(null);
        }
        if (lacher == null) return;
        for (Mob m : lacher) {
            m.setTarget(null);
            Ouie o = ouie(m);
            if (o != null) m.getNavigation().moveTo(o.pos().x, o.pos().y, o.pos().z, VITESSE);
        }
    }

    // Moteurs et galops : un joueur monte sur quelque chose qui avance vite fait du bruit (vehicules, chevaux).
    private static void moteurs(ServerLevel level) {
        Map<Mob, Ouie> chimiks = ACTIFS.get(level.dimension());
        for (ServerPlayer p : level.players()) {
            Entity v = p.getVehicle();
            if (v == null) {
                VEHICULES.remove(p.getUUID());
                continue;
            }
            Vec3 avant = VEHICULES.put(p.getUUID(), p.position());
            if (avant == null || chimiks == null || chimiks.isEmpty()) continue;
            double d2 = avant.distanceToSqr(p.position());
            if (d2 > 2.5 * 2.5 && d2 < 80 * 80) entendre(level, chimiks, p.position(), p, d2 > 8 * 8 ? 32 : 20);
        }
    }

    // Tirs TACZ (si le mod est la) : 40 blocs, 10 avec un silencieux.
    @SuppressWarnings("unchecked")
    private static void brancherTacz() {
        if (!ModList.get().isLoaded("tacz")) return;
        try {
            Class<? extends Event> c = (Class<? extends Event>) Class.forName("com.tacz.guns.api.event.common.GunFireEvent");
            Method tireur = c.getMethod("getShooter");
            Method arme = c.getMethod("getGunItemStack");
            Consumer<Event> ecoute = ev -> {
                try {
                    if (!(tireur.invoke(ev) instanceof LivingEntity le) || !(le.level() instanceof ServerLevel level)) return;
                    Map<Mob, Ouie> chimiks = ACTIFS.get(level.dimension());
                    if (chimiks == null || chimiks.isEmpty()) return;
                    boolean silencieux = String.valueOf(((ItemStack) arme.invoke(ev)).getComponentsPatch()).contains("silencer");
                    entendre(level, chimiks, le.position(), le, silencieux ? 10 : 40);
                } catch (Throwable t) {
                    AtheriaBestiaire.LOG.debug("Tir TACZ ignore : {}", t.toString());
                }
            };
            NeoForge.EVENT_BUS.addListener(EventPriority.LOWEST, false, (Class<Event>) c, ecoute);
        } catch (Throwable t) {
            AtheriaBestiaire.LOG.warn("Tirs TACZ non branches sur l'ouie des Chimiks : {}", t.toString());
        }
    }
}
