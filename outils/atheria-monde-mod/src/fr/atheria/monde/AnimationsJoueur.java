package fr.atheria.monde;

import com.alrex.parcool.client.animation.system.BlendingModelTransform;
import com.alrex.parcool.client.animation.system.IPlayerAnimatorHolder;
import com.alrex.parcool.client.animation.system.PlayerAnimator;
import com.tacz.guns.api.item.IGun;
import dev.kosmx.playerAnim.impl.IAnimatedPlayer;
import fr.atheria.monde.guide.Figurant;
import net.minecraft.client.model.PlayerModel;
import net.minecraft.client.model.geom.ModelPart;
import net.minecraft.client.player.AbstractClientPlayer;
import net.minecraft.world.entity.Entity;
import traben.entity_model_features.EMFAnimationApi;
import traben.entity_model_features.utils.EMFAnimationPauseHandler;
import traben.entity_model_features.utils.EMFEntity;

// FA Player reecrit la pose du joueur a chaque image : on lui retire la main quand un autre mod anime le corps ou les bras.
public final class AnimationsJoueur {
    private static boolean enregistre;

    private AnimationsJoueur() {
    }

    public static void avantRendu(AbstractClientPlayer joueur, PlayerModel<?> modele) {
        if (!enregistre) {
            enregistre = true;
            try {
                EMFAnimationApi.registerPauseCondition(AnimationsJoueur::corpsAnimeAilleurs);
            } catch (Exception e) {
                throw new IllegalStateException(e);
            }
        }
        EMFEntity entite = EMFAnimationApi.emfEntityOf(joueur);
        if (entite == null) return;
        // TaCZ pose les bras de l'arme tenue, le reste du corps garde les animations de FA Player
        if (IGun.getIGunOrNull(joueur.getMainHandItem()) != null) {
            ModelPart[] bras = {modele.rightArm, modele.leftArm, modele.rightSleeve, modele.leftSleeve};
            EMFAnimationApi.pauseCustomAnimationsForThesePartsOfEntity(entite, bras);
        } else {
            EMFAnimationPauseHandler.entitiesPausedParts.remove(joueur.getUUID());
        }
    }

    private static Boolean corpsAnimeAilleurs(EMFEntity entite) {
        if (!(entite instanceof Entity e) || !(e instanceof AbstractClientPlayer joueur)) return false;
        if (joueur instanceof Figurant) return true;
        // Better Combat, Combat Roll, Emotecraft
        if (joueur instanceof IAnimatedPlayer anime && anime.getAnimationStack().isActive()) return true;
        // ParCool : roulades, glissades, escalade
        if (joueur instanceof IPlayerAnimatorHolder porteur) {
            PlayerAnimator animateur = porteur.getParCoolPlayerAnimator();
            if (animateur != null) {
                BlendingModelTransform courant = animateur.getCurrentTransformation();
                if (courant != null && courant.blendFactor() > 0f) return true;
            }
        }
        return false;
    }
}