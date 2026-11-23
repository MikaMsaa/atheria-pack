package fr.atheria.bestiaire;

import java.util.List;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.server.level.ServerPlayer;
import net.minecraft.world.entity.Mob;
import net.minecraft.world.phys.AABB;
import net.neoforged.neoforge.common.NeoForge;
import net.neoforged.neoforge.event.tick.LevelTickEvent;

// Les Rodeurs (tag atheria:flaireurs, spore:stalker) chassent a l'odeur du sang :
// un joueur a moitie de sa vie ou moins est senti a 32 blocs (ils marchent vers lui), et vise de pres (10 blocs).
// Se soigner fait disparaitre la piste. Verifie toutes les 2 secondes.
final class Odeur {
    private static final double PORTEE = 32;
    private static final double PRES2 = 10 * 10;

    private Odeur() {
    }

    static void brancher() {
        NeoForge.EVENT_BUS.addListener(Odeur::tick);
    }

    private static void tick(LevelTickEvent.Post e) {
        if (!(e.getLevel() instanceof ServerLevel level) || level.getGameTime() % 40 != 7) return;
        for (ServerPlayer p : level.players()) {
            if (p.isSpectator() || p.isCreative() || !p.isAlive() || p.getHealth() > p.getMaxHealth() * 0.5f) continue;
            List<Mob> mobs = level.getEntitiesOfClass(Mob.class, p.getBoundingBox().inflate(PORTEE, 16, PORTEE),
                    m -> m.getType().is(AtheriaBestiaire.FLAIREURS) && m.isAlive() && m.getTarget() == null && !m.isNoAi());
            int n = 0;
            for (Mob m : mobs) {
                if (n++ >= 12) break;
                if (m.distanceToSqr(p) <= PRES2) m.setTarget(p);
                else m.getNavigation().moveTo(p.getX(), p.getY(), p.getZ(), 1.1);
            }
        }
    }
}
