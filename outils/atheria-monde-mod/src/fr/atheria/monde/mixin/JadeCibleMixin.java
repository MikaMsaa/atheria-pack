package fr.atheria.monde.mixin;

import net.minecraft.client.Minecraft;
import net.minecraft.world.phys.HitResult;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;
import snownee.jade.overlay.RayTracing;

// Jade trace son propre rayon depuis la camera, reculee en vue epaule et inclinee par Camera Overhaul : il rate des blocs que le jeu vise bien.
@Mixin(value = RayTracing.class, remap = false)
public abstract class JadeCibleMixin {
    @Shadow private HitResult target;

    @Inject(method = "fire", at = @At("TAIL"))
    private void atheria$cibleDuJeu(CallbackInfo ci) {
        HitResult jeu = Minecraft.getInstance().hitResult;
        if (jeu != null && jeu.getType() != HitResult.Type.MISS && (target == null || target.getType() == HitResult.Type.MISS)) target = jeu;
    }
}
