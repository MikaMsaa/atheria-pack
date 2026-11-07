package fr.atheria.monde.mixin;

import dev.tr7zw.firstperson.LogicHandler;
import fr.atheria.monde.FiguresPov;
import net.minecraft.client.player.LocalPlayer;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.item.ItemStack;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

// First Person Model reaffiche les bras du corps en regardant vers le bas, meme quand la main vanilla est deja la : deux paires de mains.
@Mixin(value = LogicHandler.class, remap = false)
public abstract class MainsDoublesMixin {
    @Inject(method = "lookingDown()Z", at = @At("HEAD"), cancellable = true)
    private void atheria$jamaisDeuxPaires(CallbackInfoReturnable<Boolean> cir) {
        cir.setReturnValue(false);
    }

    // Pendant une figure, les bras du corps s'effacent devant ceux dessines en vue subjective.
    @Inject(method = "hideArmsAndItems(Lnet/minecraft/world/entity/LivingEntity;Lnet/minecraft/world/item/ItemStack;Lnet/minecraft/world/item/ItemStack;)Z", at = @At("HEAD"), cancellable = true)
    private void atheria$brasDuCorps(LivingEntity entite, ItemStack main, ItemStack autre, CallbackInfoReturnable<Boolean> cir) {
        if (entite instanceof LocalPlayer joueur && FiguresPov.active(joueur) != null) cir.setReturnValue(true);
    }
}
