package fr.atheria.ile.mixin;

import fr.atheria.ile.CarteIle;
import net.minecraft.core.BlockPos;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.tags.FluidTags;
import net.minecraft.util.RandomSource;
import net.minecraft.world.level.WorldGenLevel;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.chunk.ChunkGenerator;
import net.minecraft.world.level.levelgen.Heightmap;
import net.minecraft.world.level.levelgen.feature.ConfiguredFeature;
import net.minecraft.world.level.levelgen.feature.LakeFeature;
import net.minecraft.world.level.levelgen.feature.SpringFeature;
import net.minecraft.world.level.levelgen.feature.configurations.SpringConfiguration;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

/**
 * 0.9.6 : lacs et sources.
 * - lacs_hors_lots : aucun lac (eau ou lave) ni source dans un lot, sa marge et le fondu de son plateau (+16 blocs pour l'etendue du lac) ;
 * - lave_hors_volcan (C1b) : aucun lac ni source de lave dans les 12 blocs sous la surface hors de la region Ile du volcan.
 * Les deux reglages valent 0 par defaut : aucun effet.
 */
@Mixin(ConfiguredFeature.class)
public abstract class LacsMixin {
    @Inject(method = "place", at = @At("HEAD"), cancellable = true)
    private void atheriaIle$lacs(WorldGenLevel niveau, ChunkGenerator generateur, RandomSource alea, BlockPos pos, CallbackInfoReturnable<Boolean> retour) {
        CarteIle c = CarteIle.active();
        if (c == null || (c.rnLacsHorsLots <= 0 && c.rnLaveHorsVolcan <= 0)) return;
        ConfiguredFeature<?, ?> f = (ConfiguredFeature<?, ?>) (Object) this;
        Object type = f.feature();
        ResourceLocation cle = BuiltInRegistries.FEATURE.getKey(f.feature());
        String nom = cle == null ? "" : cle.getPath();
        boolean lac = type instanceof LakeFeature || nom.contains("lake") || nom.contains("pond");
        boolean source = type instanceof SpringFeature || nom.contains("spring");
        if (!lac && !source) return;
        int x = pos.getX(), z = pos.getZ();
        if (c.rnLacsHorsLots > 0 && c.zoneSansLac(x, z)) { retour.setReturnValue(false); return; }
        if (c.rnLaveHorsVolcan > 0 && !c.dansVolcan(x, z)) {
            boolean lave = nom.contains("lava");
            try {
                if (f.config() instanceof LakeFeature.Configuration lc) lave |= lc.fluid().getState(RandomSource.create(0), pos).is(Blocks.LAVA);
                if (f.config() instanceof SpringConfiguration sc) lave |= sc.state.is(FluidTags.LAVA);
            } catch (Exception ignore) { }
            if (lave && pos.getY() >= niveau.getHeight(Heightmap.Types.WORLD_SURFACE_WG, x, z) - 12) retour.setReturnValue(false);
        }
    }
}
