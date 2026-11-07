package fr.atheria.monde;

import com.alrex.parcool.api.action.Action;
import com.alrex.parcool.api.action.ContinuableAction;
import com.alrex.parcool.common.Parkourability;
import com.alrex.parcool.common.action.impl.ClimbUp;
import com.alrex.parcool.common.action.impl.HangDown;
import com.alrex.parcool.common.action.impl.HangOn;
import com.alrex.parcool.common.action.impl.PoleClimb;
import com.alrex.parcool.common.action.impl.Vault;
import net.minecraft.world.entity.player.Player;

// Les figures ParCool vues de ses propres yeux : le corps de First Person Model garde ses bras hors du champ, on dessine donc une paire dediee.
public final class FiguresPov {
    public enum Figure { ACCROCHE, BARRE, HISSE, MURET, POTEAU }

    private static final float VITESSE = 7.0F;
    public static volatile String forcer = "";

    private static Figure derniere = Figure.ACCROCHE;
    private static float poids;
    private static float temps;
    private static long horloge;

    private FiguresPov() {
    }

    public static Figure active(Player joueur) {
        if (!forcer.isEmpty()) return Figure.valueOf(forcer);
        Parkourability parkour = Parkourability.get(joueur);
        if (parkour == null) return null;
        for (Action action : parkour.getActions()) {
            if (!(action instanceof ContinuableAction continue_) || !continue_.isDoing()) continue;
            if (action instanceof ClimbUp) return Figure.HISSE;
            if (action instanceof Vault) return Figure.MURET;
            if (action instanceof HangOn) return Figure.ACCROCHE;
            if (action instanceof HangDown) return Figure.BARRE;
            if (action instanceof PoleClimb) return Figure.POTEAU;
        }
        return null;
    }

    // Fait entrer et sortir les bras en douceur, a la meme vitesse quel que soit le nombre d'images par seconde.
    public static float avancer(Player joueur) {
        long maintenant = System.nanoTime();
        float ecart = horloge == 0L ? 0.0F : Math.min(0.1F, (maintenant - horloge) / 1.0E9F);
        horloge = maintenant;
        Figure figure = active(joueur);
        if (figure != null) {
            if (figure != derniere || poids <= 0.0F) temps = 0.0F;
            derniere = figure;
            poids = Math.min(1.0F, poids + ecart * VITESSE);
        } else {
            poids = Math.max(0.0F, poids - ecart * VITESSE);
        }
        temps += ecart;
        return poids;
    }

    public static Figure figure() {
        return derniere;
    }

    public static float temps() {
        return temps;
    }
}
