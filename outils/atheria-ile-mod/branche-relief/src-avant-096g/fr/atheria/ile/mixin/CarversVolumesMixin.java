package fr.atheria.ile.mixin;

import fr.atheria.ile.CarteIle;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Holder;
import net.minecraft.world.level.biome.Biome;
import net.minecraft.world.level.chunk.CarvingMask;
import net.minecraft.world.level.chunk.ChunkAccess;
import net.minecraft.world.level.levelgen.Aquifer;
import net.minecraft.world.level.levelgen.carver.CarverConfiguration;
import net.minecraft.world.level.levelgen.carver.CarvingContext;
import net.minecraft.world.level.levelgen.carver.WorldCarver;
import org.apache.commons.lang3.mutable.MutableBoolean;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

import java.util.function.Function;

/** Aucun carver (grottes, canyons, y compris ceux des mods) ne creuse un volume souterrain reserve ni sa marge. */
@Mixin(WorldCarver.class)
public abstract class CarversVolumesMixin {
    @Inject(method = "carveBlock", at = @At("HEAD"), cancellable = true)
    private void atheriaIle$pasDansLesVolumes(CarvingContext ctx, CarverConfiguration config, ChunkAccess chunk, Function<BlockPos, Holder<Biome>> biomes,
                                              CarvingMask masque, BlockPos.MutableBlockPos pos, BlockPos.MutableBlockPos test, Aquifer aquifere,
                                              MutableBoolean surface, CallbackInfoReturnable<Boolean> retour) {
        CarteIle c = CarteIle.active();
        if (c != null && c.volumes.reserve(pos.getX(), pos.getY(), pos.getZ())) retour.setReturnValue(false);
    }
}
