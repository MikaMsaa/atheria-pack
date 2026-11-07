package fr.atheria.monde.mixin;

import com.Harbinger.Spore.Client.Layers.CustomArmorLayer;
import com.mojang.blaze3d.vertex.PoseStack;
import net.minecraft.client.renderer.MultiBufferSource;
import net.minecraft.world.entity.EquipmentSlot;
import net.minecraft.world.entity.LivingEntity;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

// Spore anime toutes ses pieces d'armure sur chaque mob, meme sans armure : couteux dans une horde.
@Mixin(value = CustomArmorLayer.class, remap = false)
public abstract class CoucheArmureSporeMixin {
    @Inject(method = "render(Lcom/mojang/blaze3d/vertex/PoseStack;Lnet/minecraft/client/renderer/MultiBufferSource;ILnet/minecraft/world/entity/LivingEntity;FFFFFF)V", at = @At("HEAD"), cancellable = true)
    private void atheria$sansArmure(PoseStack pose, MultiBufferSource tampon, int lumiere, LivingEntity entite, float a, float b, float c, float d, float e, float f, CallbackInfo info) {
        if (entite.getItemBySlot(EquipmentSlot.HEAD).isEmpty() && entite.getItemBySlot(EquipmentSlot.CHEST).isEmpty()
                && entite.getItemBySlot(EquipmentSlot.LEGS).isEmpty() && entite.getItemBySlot(EquipmentSlot.FEET).isEmpty()) {
            info.cancel();
        }
    }
}