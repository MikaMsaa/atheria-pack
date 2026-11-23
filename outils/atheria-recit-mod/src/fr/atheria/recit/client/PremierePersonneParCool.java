package fr.atheria.recit.client;

import com.alrex.parcool.api.action.Action;
import com.alrex.parcool.api.action.ActionEntry;
import com.alrex.parcool.api.action.ContinuableAction;
import com.alrex.parcool.common.Parkourability;
import com.alrex.parcool.common.action.ParCoolActions;
import dev.tr7zw.firstperson.api.ActivationHandler;
import dev.tr7zw.firstperson.api.FirstPersonAPI;
import net.minecraft.client.Minecraft;
import net.minecraft.client.player.LocalPlayer;

// First Person Model + ParCool : pendant les figures qui font basculer tout le corps (Cat Leap, flips, plongeon,
// roulade, esquives, sauts d'obstacle, chute libre, glissade), la camera de la vue a la premiere personne entre
// dans le corps et l'ecran devient noir (vu en jeu le 11/11 : ~0,65 s au Cat Leap).
// Pendant ces figures, on laisse la place a la vue normale (mains seules), puis le corps revient.
// N'est charge que si les deux mods sont presents (voir ClientRecit.init).
final class PremierePersonneParCool implements ActivationHandler {
    // figures instantanees : duree de l'animation de ParCool + fondu de sortie, en ticks
    private static final int CAT_LEAP = 36, FLIP = 20, ROULADE = 16;
    // figures continues : quelques ticks apres la fin pour le fondu de sortie
    private static final int APRES = 6;
    private static boolean panne;

    private PremierePersonneParCool() {
    }

    static void brancher() {
        FirstPersonAPI.registerPlayerHandler(new PremierePersonneParCool());
    }

    @Override
    public boolean preventFirstperson() {
        if (panne) return false;
        LocalPlayer p = Minecraft.getInstance().player;
        if (p == null) return false;
        try {
            Parkourability pk = Parkourability.get(p);
            if (pk == null) return false;
            return recent(pk, ParCoolActions.LONG_JUMP, CAT_LEAP)
                    || recent(pk, ParCoolActions.TRICK_JUMP, FLIP)
                    || recent(pk, ParCoolActions.BREAKFALL, ROULADE)
                    || enCours(pk, ParCoolActions.DIVE)
                    || enCours(pk, ParCoolActions.DODGE)
                    || enCours(pk, ParCoolActions.VAULT)
                    || enCours(pk, ParCoolActions.CASTAWAY)
                    || enCours(pk, ParCoolActions.SKYDIVE)
                    || enCours(pk, ParCoolActions.SLIDE);
        } catch (Throwable t) {
            // une mise a jour de ParCool a change son API : on n'empeche plus rien, et on le dit une seule fois
            panne = true;
            org.slf4j.LoggerFactory.getLogger("Atheria Recit").warn("Compat First Person Model / ParCool desactivee : {}", t.toString());
            return false;
        }
    }

    private static boolean recent(Parkourability pk, ActionEntry<? extends Action> e, int duree) {
        Action a = pk.get(e);
        return a != null && a.getTickSinceStarted() >= 0 && a.getTickSinceStarted() < duree;
    }

    private static boolean enCours(Parkourability pk, ActionEntry<? extends ContinuableAction> e) {
        ContinuableAction a = pk.get(e);
        return a != null && (a.isDoing() || a.getNotDoingTick() < APRES);
    }
}
