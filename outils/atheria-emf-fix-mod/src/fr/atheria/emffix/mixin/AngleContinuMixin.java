package fr.atheria.emffix.mixin;

import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

/**
 * EMF Compat: Core melange la pose du pack (FA+Player) et celle d'un mod (ParCool) angle par angle
 * "par le plus court chemin" (difference ramenee dans [-pi, pi]). Quand la difference passe pres de
 * 180 degres, ce chemin change de sens d'une image a l'autre : un bras ou une jambe saute ou clignote.
 * Ici on interpole lineairement : si les deux poses bougent continument, le melange est continu aussi.
 * Si EMF Compat n'est pas installe, la classe cible n'existe pas et ce mixin ne fait rien.
 */
@Mixin(targets = "strm.emfcompat.core.PoseSnapshot", remap = false)
public abstract class AngleContinuMixin {
    @Inject(method = "lerpAngle(FFF)F", at = @At("HEAD"), cancellable = true, remap = false, require = 0)
    private static void atheria$lerpContinu(float depart, float arrivee, float poids, CallbackInfoReturnable<Float> cir) {
        cir.setReturnValue(depart + (arrivee - depart) * poids);
    }
}
