package fr.atheria.monde.mixin;

import fr.atheria.monde.PortesAnimees;
import net.minecraft.client.resources.model.BakedModel;
import net.minecraft.core.BlockPos;
import net.minecraft.world.level.block.state.BlockState;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Pseudo;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

// Pendant son animation, la porte n'est pas construite dans le chunk par Sodium.
@Pseudo
@Mixin(targets = "net.caffeinemc.mods.sodium.client.render.chunk.compile.pipeline.BlockRenderer", remap = false)
public abstract class PorteCacheeMixin {
    @Inject(method = "renderModel", at = @At("HEAD"), cancellable = true)
    private void atheria$cacher(BakedModel modele, BlockState etat, BlockPos pos, BlockPos origine, CallbackInfo ci) {
        if (PortesAnimees.cachee(pos)) ci.cancel();
    }
}
