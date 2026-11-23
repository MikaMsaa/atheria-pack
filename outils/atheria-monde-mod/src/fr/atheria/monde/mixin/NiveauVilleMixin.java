package fr.atheria.monde.mixin;

import fr.atheria.monde.NiveauVilles;
import mcjty.lostcities.config.LostCityProfile;
import mcjty.lostcities.varia.ChunkCoord;
import mcjty.lostcities.worldgen.IDimensionInfo;
import mcjty.lostcities.worldgen.lost.BuildingInfo;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

// Une ville = un niveau : plus de batiments perches chacun sur son plateau (voir NiveauVilles).
@Mixin(value = BuildingInfo.class, remap = false)
public abstract class NiveauVilleMixin {
    @Inject(method = "computeCityLevel", at = @At("HEAD"), cancellable = true, remap = false)
    private static void atheria$niveauUnique(ChunkCoord coord, IDimensionInfo info, CallbackInfoReturnable<Integer> retour) {
        Integer n = NiveauVilles.niveau(coord, info);
        if (n != null) retour.setReturnValue(n);
    }

    @Inject(method = "isCityRaw", at = @At("RETURN"), cancellable = true, remap = false)
    private static void atheria$pasDeVilleSurLesPentes(ChunkCoord coord, IDimensionInfo info, LostCityProfile profil, CallbackInfoReturnable<Boolean> retour) {
        if (!retour.getReturnValue()) return;
        // la RN1 et les lieux nommes de l'ile (overworld seulement), puis les pentes
        if (coord.dimension() == net.minecraft.world.level.Level.OVERWORLD && fr.atheria.monde.ExclusionsIle.estExclu(coord.chunkX(), coord.chunkZ())) { retour.setReturnValue(false); return; }
        if (NiveauVilles.horsVille(coord, info, profil)) retour.setReturnValue(false);
    }
}
