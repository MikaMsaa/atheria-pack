package fr.atheria.monde.mixin;

import fr.atheria.monde.guide.Figurant;
import net.minecraft.client.renderer.LightTexture;
import net.minecraft.client.renderer.entity.EntityRenderer;
import net.minecraft.world.entity.Entity;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

// Le figurant vit dans le monde reel : il prenait la lumiere du monde aux memes coordonnees et devenait tout noir sous terre.
@Mixin(value = EntityRenderer.class, remap = false)
public abstract class LumiereFigurantMixin {
    @Inject(method = "getPackedLightCoords", at = @At("HEAD"), cancellable = true)
    private void atheria$pleineLumiere(Entity entite, float image, CallbackInfoReturnable<Integer> cir) {
        if (entite instanceof Figurant) cir.setReturnValue(LightTexture.FULL_BRIGHT);
    }
}
