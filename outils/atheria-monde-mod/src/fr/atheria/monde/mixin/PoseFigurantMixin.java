package fr.atheria.monde.mixin;

import fr.atheria.monde.guide.Figurant;
import net.minecraft.client.model.PlayerModel;
import net.minecraft.world.entity.LivingEntity;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Mixin(value = PlayerModel.class, remap = false)
public abstract class PoseFigurantMixin {
    @Inject(method = "setupAnim(Lnet/minecraft/world/entity/LivingEntity;FFFFF)V", at = @At("TAIL"))
    private void atheria$poser(LivingEntity entite, float marche, float vitesse, float age, float tete, float regard, CallbackInfo info) {
        if (!(entite instanceof Figurant figurant)) return;
        PlayerModel<?> modele = (PlayerModel<?>) (Object) this;
        figurant.poser(modele, age);
        modele.hat.copyFrom(modele.head);
        modele.leftSleeve.copyFrom(modele.leftArm);
        modele.rightSleeve.copyFrom(modele.rightArm);
        modele.leftPants.copyFrom(modele.leftLeg);
        modele.rightPants.copyFrom(modele.rightLeg);
        modele.jacket.copyFrom(modele.body);
    }
}
