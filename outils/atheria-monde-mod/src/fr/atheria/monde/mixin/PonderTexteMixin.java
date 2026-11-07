package fr.atheria.monde.mixin;

import fr.atheria.monde.guide.AtheriaPonder;
import java.util.Map;
import net.createmod.ponder.foundation.registration.PonderLocalization;
import net.minecraft.resources.ResourceLocation;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

// Les tutoriels d'Atheria sont ecrits directement en francais dans les scenes : pas de fichier de langue a tenir a jour.
@Mixin(value = PonderLocalization.class, remap = false)
public abstract class PonderTexteMixin {
    @Inject(method = "getSpecific(Lnet/minecraft/resources/ResourceLocation;Ljava/lang/String;)Ljava/lang/String;", at = @At("HEAD"), cancellable = true)
    private void atheria$texte(ResourceLocation scene, String cle, CallbackInfoReturnable<String> cir) {
        if (!AtheriaPonder.MOD.equals(scene.getNamespace())) return;
        Map<String, String> textes = ((PonderLocalization) (Object) this).specific.get(scene);
        if (textes != null && textes.containsKey(cle)) cir.setReturnValue(textes.get(cle));
    }
}
