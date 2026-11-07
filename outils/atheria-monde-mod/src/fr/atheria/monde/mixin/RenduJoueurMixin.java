package fr.atheria.monde.mixin;

import com.mojang.blaze3d.vertex.PoseStack;
import fr.atheria.monde.AnimationsJoueur;
import fr.atheria.monde.guide.Figurant;
import net.minecraft.client.model.PlayerModel;
import net.minecraft.client.player.AbstractClientPlayer;
import net.minecraft.client.renderer.MultiBufferSource;
import net.minecraft.client.renderer.entity.player.PlayerRenderer;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Mixin(value = PlayerRenderer.class, remap = false)
public abstract class RenduJoueurMixin {
    @Inject(method = "render(Lnet/minecraft/client/player/AbstractClientPlayer;FFLcom/mojang/blaze3d/vertex/PoseStack;Lnet/minecraft/client/renderer/MultiBufferSource;I)V", at = @At("HEAD"))
    private void atheria$animations(AbstractClientPlayer joueur, float a, float b, PoseStack pose, MultiBufferSource tampon, int lumiere, CallbackInfo info) {
        PlayerModel<?> modele = ((PlayerRenderer) (Object) this).getModel();
        AnimationsJoueur.avantRendu(joueur, modele);
    }

    @Inject(method = "setupRotations(Lnet/minecraft/client/player/AbstractClientPlayer;Lcom/mojang/blaze3d/vertex/PoseStack;FFFF)V", at = @At("TAIL"))
    private void atheria$figurant(AbstractClientPlayer joueur, PoseStack pose, float balance, float corps, float image, float echelle, CallbackInfo info) {
        if (joueur instanceof Figurant figurant) figurant.incliner(pose, image);
    }
}