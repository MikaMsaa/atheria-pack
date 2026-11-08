package fr.atheria.recit.client;

import net.minecraft.client.Minecraft;
import net.minecraft.util.Mth;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.level.ClipContext;
import net.minecraft.world.phys.HitResult;
import net.minecraft.world.phys.Vec3;

// Camera de dialogue facon jeu d'aventure : champ / contrechamp par-dessus l'epaule.
// Quand le PNJ parle, on filme derriere le joueur (son epaule et le PNJ de face) ; quand le joueur repond,
// on passe derriere le PNJ. Le joueur reste visible, le monde continue de vivre autour.
// Les passages d'un plan a l'autre sont adoucis ; la camera ne traverse jamais un mur.
final class CameraDialogue {
    private static EcranDialogue ecran;
    private static Vec3 pos;
    private static float lacet;
    private static float tangage;
    private static long dernierNs;
    private static final double[] ETAT = new double[7];

    private CameraDialogue() {
    }

    static void commencer(EcranDialogue d) {
        ecran = d;
        pos = null;
        dernierNs = 0;
    }

    static void arreter(EcranDialogue d) {
        if (d == null || d == ecran) ecran = null;
    }

    static boolean active() {
        return ecran != null && ecran.camera && calculer() != null;
    }

    static double[] calculer() {
        EcranDialogue d = ecran;
        Minecraft mc = Minecraft.getInstance();
        if (d == null || !d.camera || mc.level == null || mc.player == null || mc.screen != d) return null;
        Entity joueur = d.acteur();
        Entity pnj = d.pnj();
        if (joueur == null || pnj == null || !pnj.isAlive() || joueur.level() != pnj.level()) return null;
        float pt = mc.getTimer().getGameTimeDeltaPartialTick(true);
        boolean joueurParle = d.ligneJoueur();
        Entity parle = joueurParle ? joueur : pnj;
        Entity ecoute = joueurParle ? pnj : joueur;
        Vec3 yeuxP = parle.getEyePosition(pt);
        Vec3 yeuxE = ecoute.getEyePosition(pt);
        Vec3 h = new Vec3(yeuxP.x - yeuxE.x, 0, yeuxP.z - yeuxE.z);
        if (h.lengthSqr() < 1e-4) h = Vec3.directionFromRotation(0, ecoute.getYRot());
        h = h.normalize();
        Vec3 cote = new Vec3(-h.z, 0, h.x);
        // de trois-quarts, derriere l'epaule droite de celui qui ecoute : il reste a gauche de l'image, celui qui parle bien degage
        double ecart = Math.max(1.2, Math.min(2.2, Math.sqrt(yeuxP.subtract(yeuxE).horizontalDistanceSqr()) * 0.5));
        Vec3 cible = yeuxE.subtract(h.scale(1.3)).add(cote.scale(ecart)).add(0, 0.45, 0);
        // jamais dans un mur : on rapproche la camera de l'epaule si un bloc gene
        HitResult hit = mc.level.clip(new ClipContext(yeuxE.add(0, 0.2, 0), cible, ClipContext.Block.VISUAL, ClipContext.Fluid.NONE, mc.player));
        if (hit.getType() != HitResult.Type.MISS) {
            Vec3 dir = cible.subtract(yeuxE).normalize();
            cible = hit.getLocation().subtract(dir.scale(0.25));
        }
        // on vise un peu sous le visage de celui qui parle : les visages restent au-dessus de la boite de dialogue
        Vec3 vise = yeuxP.scale(0.7).add(yeuxE.scale(0.3)).add(0, -0.2, 0);
        double[] a = Cinematique.angles(vise.subtract(cible));
        float lacetCible = (float) a[0];
        float tangageCible = (float) a[1];

        long maintenant = System.nanoTime();
        double dt = dernierNs == 0 ? 0 : Math.min(0.1, (maintenant - dernierNs) / 1e9);
        dernierNs = maintenant;
        if (pos == null) {
            // depart : depuis les yeux du joueur, pour glisser en douceur vers le premier plan
            pos = mc.player.getEyePosition(pt);
            lacet = mc.player.getViewYRot(pt);
            tangage = mc.player.getViewXRot(pt);
        }
        double k = 1 - Math.exp(-dt * 5.5);
        pos = pos.add(cible.subtract(pos).scale(k));
        lacet += Mth.wrapDegrees(lacetCible - lacet) * (float) k;
        tangage += (tangageCible - tangage) * (float) k;
        ETAT[0] = pos.x;
        ETAT[1] = pos.y;
        ETAT[2] = pos.z;
        ETAT[3] = lacet;
        ETAT[4] = tangage;
        ETAT[5] = 0;
        ETAT[6] = Double.NaN;
        return ETAT;
    }
}
