package fr.atheria.ile.mixin;

import fr.atheria.ile.CarteIle;
import fr.atheria.ile.PoseVolumes;
import net.minecraft.core.BlockPos;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.util.RandomSource;
import net.minecraft.world.level.WorldGenLevel;
import net.minecraft.world.level.chunk.ChunkGenerator;
import net.minecraft.world.level.levelgen.feature.ConfiguredFeature;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

/** Exception a la reserve souterraine pour les features dont le type est dans pose_autorisee. */
@Mixin(ConfiguredFeature.class)
public abstract class FeaturesVolumesMixin {
    private static boolean atheriaIle$autorisee(ConfiguredFeature<?, ?> f) {
        CarteIle c = CarteIle.active();
        return c != null && !c.volumes.vide() && PoseVolumes.autorise(BuiltInRegistries.FEATURE.getKey(f.feature()));
    }

    @Inject(method = "place", at = @At("HEAD"))
    private void atheriaIle$leverReserve(WorldGenLevel niveau, ChunkGenerator generateur, RandomSource alea, BlockPos pos, CallbackInfoReturnable<Boolean> retour) {
        if (atheriaIle$autorisee((ConfiguredFeature<?, ?>) (Object) this)) PoseVolumes.entrer();
    }

    @Inject(method = "place", at = @At("RETURN"))
    private void atheriaIle$retablirReserve(WorldGenLevel niveau, ChunkGenerator generateur, RandomSource alea, BlockPos pos, CallbackInfoReturnable<Boolean> retour) {
        if (atheriaIle$autorisee((ConfiguredFeature<?, ?>) (Object) this)) PoseVolumes.sortir();
    }
}
