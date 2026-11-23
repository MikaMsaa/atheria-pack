package fr.atheria.ile.mixin;

import fr.atheria.ile.CarteIle;
import net.minecraft.core.BlockPos;
import net.minecraft.util.RandomSource;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.levelgen.feature.OreFeature;
import net.minecraft.world.level.levelgen.feature.configurations.OreConfiguration;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

import java.util.function.Function;

/**
 * Pas de minerai dans un volume souterrain reserve ni sa marge. Les minerais (OreFeature et ScatteredOreFeature)
 * passent tous par canPlaceOre ; OreFeature ecrit directement dans les sections, sans WorldGenRegion.setBlock.
 */
@Mixin(OreFeature.class)
public abstract class MineraisVolumesMixin {
    @Inject(method = "canPlaceOre", at = @At("HEAD"), cancellable = true)
    private static void atheriaIle$pasDeMinerai(BlockState etat, Function<BlockPos, BlockState> lecteur, RandomSource alea, OreConfiguration config,
                                                OreConfiguration.TargetBlockState cible, BlockPos.MutableBlockPos pos, CallbackInfoReturnable<Boolean> retour) {
        CarteIle c = CarteIle.active();
        if (c != null && c.volumes.reserve(pos.getX(), pos.getY(), pos.getZ())) retour.setReturnValue(false);
    }
}
