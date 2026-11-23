package fr.atheria.ile.mixin;

import fr.atheria.ile.CarteIle;
import fr.atheria.ile.PoseVolumes;
import net.minecraft.core.BlockPos;
import net.minecraft.server.level.WorldGenRegion;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.levelgen.Heightmap;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

/**
 * Pendant la generation (features, morceaux de structures : mineshafts, bunkers, donjons, geodes, sources, lacs de
 * lave, decors des biomes de grottes...), aucun bloc n'est pose dans un volume souterrain reserve ni sa marge,
 * tant qu'on est a plus de 2 blocs sous la surface : la vegetation, les routes et les batiments de surface ne sont
 * jamais touches.
 */
@Mixin(WorldGenRegion.class)
public abstract class RegionVolumesMixin {
    @Inject(method = "setBlock(Lnet/minecraft/core/BlockPos;Lnet/minecraft/world/level/block/state/BlockState;II)Z", at = @At("HEAD"), cancellable = true)
    private void atheriaIle$pasDansLesVolumes(BlockPos pos, BlockState etat, int drapeaux, int recursion, CallbackInfoReturnable<Boolean> retour) {
        CarteIle c = CarteIle.active();
        if (c == null || c.volumes.vide()) return;
        int x = pos.getX(), y = pos.getY(), z = pos.getZ();
        if (!c.volumes.reserve(x, y, z)) return;
        // pose autorisee en cours (structure ou feature de pose_autorisee, IleApi.poserDansVolume) : on laisse faire
        if (PoseVolumes.levee()) return;
        int surface = ((WorldGenRegion) (Object) this).getHeight(Heightmap.Types.OCEAN_FLOOR_WG, x, z);
        if (y < surface - 2) retour.setReturnValue(false);
    }
}
