package fr.atheria.monde.mixin;

import fr.atheria.monde.PortesAnimees;
import net.minecraft.client.multiplayer.ClientLevel;
import net.minecraft.core.BlockPos;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.state.BlockState;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

// Repere le changement d'etat d'une porte cote client, avant la reconstruction du chunk.
@Mixin(value = Level.class, remap = false)
public abstract class PorteChangeeMixin {
    @Inject(method = "setBlock(Lnet/minecraft/core/BlockPos;Lnet/minecraft/world/level/block/state/BlockState;II)Z", at = @At("HEAD"))
    private void atheria$porte(BlockPos pos, BlockState etat, int options, int recursion, CallbackInfoReturnable<Boolean> cir) {
        Object moi = this;
        if (moi instanceof ClientLevel niveau) PortesAnimees.changement(niveau, pos, niveau.getBlockState(pos), etat);
    }
}
