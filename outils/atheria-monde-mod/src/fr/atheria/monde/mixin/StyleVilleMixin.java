package fr.atheria.monde.mixin;

import fr.atheria.monde.StyleVilles;
import mcjty.lostcities.config.LostCityProfile;
import mcjty.lostcities.varia.ChunkCoord;
import mcjty.lostcities.worldgen.IDimensionInfo;
import mcjty.lostcities.worldgen.lost.City;
import mcjty.lostcities.worldgen.lost.cityassets.CityStyle;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

// Le style d'un chunk vient de la ville la plus "au coeur", plus d'un tirage entre villes qui se chevauchent.
@Mixin(value = City.class, remap = false)
public abstract class StyleVilleMixin {
    @Inject(method = "getCityStyleInt", at = @At("HEAD"), cancellable = true, remap = false)
    private static void atheria$styleUnique(ChunkCoord coord, IDimensionInfo info, LostCityProfile profil, CallbackInfoReturnable<CityStyle> retour) {
        CityStyle style = StyleVilles.choisir(coord, info, profil);
        if (style != null) retour.setReturnValue(style);
    }
}
