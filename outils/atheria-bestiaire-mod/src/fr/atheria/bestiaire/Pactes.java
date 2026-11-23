package fr.atheria.bestiaire;

import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.WeakHashMap;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.server.level.ServerPlayer;
import net.minecraft.world.entity.Mob;
import net.minecraft.world.entity.player.Player;
import net.neoforged.bus.api.EventPriority;
import net.neoforged.neoforge.common.NeoForge;
import net.neoforged.neoforge.event.entity.living.LivingChangeTargetEvent;
import net.neoforged.neoforge.event.entity.living.LivingIncomingDamageEvent;
import net.neoforged.neoforge.event.server.ServerStoppedEvent;
import net.neoforged.neoforge.event.tick.LevelTickEvent;

// Pactes de la campagne : des infectes qui ne visent pas un joueur en premier.
//  - Cendre grise (tag de joueur "cendre_grise", pose et retire par le KubeJS de campagne, 10 min) : les Dakouane et les
//    Contamines (tag atheria:ignorent_cendre) ne le visent pas. Pas les Chimiks, les gros infectes (atheria:infectes_forts)
//    ni les uniques. Pas d'invisibilite : les autres joueurs le voient toujours.
//  - Choix « confier Hajar aux Enfants » (tag de joueur "choix_hajar_enfants", Ch4-9b) : un Chimik ne le vise jamais en premier.
// Dans les deux cas, le mob frappe par ce joueur (ou par son equipe FTB) dans les 30 dernieres secondes peut le viser.
final class Pactes {
    static final String CENDRE = "cendre_grise";
    static final String ENFANTS = "choix_hajar_enfants";
    private static final int PROVOCATION = 30 * 20;
    private static final double RAYON = 48;

    // mob -> (joueur qui l'a frappe -> tick du coup) ; les mobs decharges disparaissent seuls
    private static final Map<Mob, Map<UUID, Long>> COUPS = new WeakHashMap<>();

    private Pactes() {
    }

    static void brancher() {
        NeoForge.EVENT_BUS.addListener(EventPriority.LOW, Pactes::cible);
        NeoForge.EVENT_BUS.addListener(EventPriority.LOWEST, Pactes::coup);
        NeoForge.EVENT_BUS.addListener(Pactes::tick);
        NeoForge.EVENT_BUS.addListener((ServerStoppedEvent e) -> {
            COUPS.clear();
        });
    }

    // Le joueur est-il protege de ce mob ?
    static boolean epargne(Mob m, Player p) {
        Set<String> tags = p.getTags();
        if (tags.isEmpty() || p.isCreative() || p.isSpectator()) return false;
        boolean pacte = false;
        if (tags.contains(ENFANTS) && m.getType().is(AtheriaBestiaire.CHIMIKS)) pacte = true;
        else if (tags.contains(CENDRE) && m.getType().is(AtheriaBestiaire.IGNORENT_CENDRE) && !m.getType().is(AtheriaBestiaire.FORTS)
                && !m.getPersistentData().contains(Uniques.CLE)) pacte = true;
        return pacte && !provoque(m, p);
    }

    private static boolean provoque(Mob m, Player p) {
        Map<UUID, Long> c = COUPS.get(m);
        if (c == null || c.isEmpty()) return false;
        long t = m.level().getGameTime();
        for (Iterator<Map.Entry<UUID, Long>> it = c.entrySet().iterator(); it.hasNext(); ) {
            Map.Entry<UUID, Long> en = it.next();
            if (t - en.getValue() > PROVOCATION) {
                it.remove();
                continue;
            }
            if (Equipes.meme(en.getKey(), p.getUUID())) return true;
        }
        return false;
    }

    private static void cible(LivingChangeTargetEvent e) {
        if (!(e.getNewAboutToBeSetTarget() instanceof Player p) || !(e.getEntity() instanceof Mob m) || m.level().isClientSide()) return;
        if (epargne(m, p)) e.setCanceled(true);
    }

    private static void coup(LivingIncomingDamageEvent e) {
        if (!(e.getEntity() instanceof Mob m) || m.level().isClientSide() || !AtheriaBestiaire.infecte(m)) return;
        if (!(e.getSource().getEntity() instanceof Player p)) return;
        COUPS.computeIfAbsent(m, k -> new HashMap<>(2)).put(p.getUUID(), m.level().getGameTime());
    }

    // Un mob qui visait deja le joueur avant le pacte (ou que le coup n'excuse plus) le lache
    private static void tick(LevelTickEvent.Post e) {
        if (!(e.getLevel() instanceof ServerLevel level) || level.getGameTime() % 20 != 3) return;
        for (ServerPlayer p : level.players()) {
            Set<String> tags = p.getTags();
            if (!tags.contains(CENDRE) && !tags.contains(ENFANTS)) continue;
            List<Mob> l = level.getEntitiesOfClass(Mob.class, p.getBoundingBox().inflate(RAYON, 24, RAYON), m -> m.getTarget() == p);
            for (Mob m : l) if (epargne(m, p)) m.setTarget(null);
        }
    }
}
