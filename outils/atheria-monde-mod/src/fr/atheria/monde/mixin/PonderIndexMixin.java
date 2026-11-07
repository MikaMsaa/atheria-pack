package fr.atheria.monde.mixin;

import fr.atheria.monde.guide.AtheriaPonder;
import net.createmod.ponder.foundation.PonderIndex;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

// Ce mod n'a pas de classe principale : les tutoriels s'ajoutent juste avant l'enregistrement des scenes de Create.
@Mixin(value = PonderIndex.class, remap = false)
public abstract class PonderIndexMixin {
    private static boolean atheria$ajoute;

    @Inject(method = "registerAll", at = @At("HEAD"))
    private static void atheria$scenes(CallbackInfo ci) {
        if (atheria$ajoute) return;
        atheria$ajoute = true;
        PonderIndex.addPlugin(AtheriaPonder.INSTANCE);
    }
}
