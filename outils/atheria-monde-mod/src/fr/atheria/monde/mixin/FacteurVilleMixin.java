package fr.atheria.monde.mixin;

import mcjty.lostcities.config.LostCityProfile;
import mcjty.lostcities.varia.ChunkCoord;
import mcjty.lostcities.worldgen.IDimensionInfo;
import mcjty.lostcities.worldgen.lost.BuildingInfo;
import mcjty.lostcities.worldgen.lost.City;
import mcjty.lostcities.worldgen.lost.cityassets.PredefinedCity;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.ModifyVariable;
import org.spongepowered.asm.mixin.injection.Redirect;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

import java.util.ArrayList;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

// City.getCityFactor boucle sur tous les chunks a +-cityMaxRadius pour trouver les centres de ville
// (57x57 appels par chunk avec 448). Quand seules les villes predefinies peuvent etre des centres
// (cityChance <= 0, ni space ni spheres), on ne visite que ces centres, dans le meme ordre (x puis z)
// et avec les memes operations : resultat identique au bit pres.
// -Datheria.facteur=verif : la boucle d'origine tourne, on compare et on compte les ecarts.
// -Datheria.facteur=off : comportement d'origine.
// Regle a garder : rayon d'une ville predefinie <= cityMaxRadius du profil (sinon l'origine l'ignorerait aussi).
// require=1 (defaultRequire) : si une injection ne s'applique plus (mise a jour de LC), le jeu refuse de demarrer
// plutot que de retirer toutes les villes en silence.
@Mixin(value = City.class, remap = false)
public abstract class FacteurVilleMixin {
    @Shadow(remap = false) private static volatile Map<ChunkCoord, PredefinedCity> predefinedCityMap;

    private static final Logger atheria$LOG = LogManager.getLogger("atheria_monde");
    private static final String atheria$MODE = atheria$lireMode();

    private static String atheria$lireMode() {
        String m = System.getProperty("atheria.facteur");
        if (m == null) {
            try { java.nio.file.Path f = java.nio.file.Paths.get("config", "atheria-facteur.txt"); if (java.nio.file.Files.exists(f)) m = java.nio.file.Files.readString(f).trim(); } catch (Exception e) { m = null; }
        }
        if (m == null || m.isEmpty()) m = "rapide";
        atheria$LOG.info("[ATHERIA-FACTEUR] mode={}", m);
        return m;
    }
    private static final ThreadLocal<Boolean> atheria$rapide = ThreadLocal.withInitial(() -> Boolean.FALSE);
    private static volatile fr.atheria.monde.CentresVilles atheria$cache = fr.atheria.monde.CentresVilles.VIDE;
    private static final AtomicLong atheria$appels = new AtomicLong(), atheria$ecarts = new AtomicLong();

    private static boolean atheria$applicable(IDimensionInfo info, LostCityProfile profil) {
        if ("off".equals(atheria$MODE)) return false;
        if (profil.CITY_CHANCE < 0) return false;            // chemin carte de rarete, pas de boucle
        LostCityProfile p = info.getProfile();
        if (p == null || p.isSpace() || p.isSpheres()) return false;
        return p.CITY_CHANCE <= 0;                           // nextDouble() < chance impossible : seuls les predefinis sont centres
    }

    @Inject(method = "getCityFactor", at = @At("HEAD"), remap = false)
    private static void atheria$debut(ChunkCoord coord, IDimensionInfo info, LostCityProfile profil, CallbackInfoReturnable<Float> retour) {
        atheria$rapide.set(atheria$applicable(info, profil));
    }

    @Redirect(method = "getCityFactor", at = @At(value = "FIELD", target = "Lmcjty/lostcities/config/LostCityProfile;CITY_MAXRADIUS:I", opcode = 180 /* GETFIELD */), remap = false)
    private static int atheria$rayon(LostCityProfile profil) {
        // -32 : offset = (-32+15)/16 = -1, la boucle d'origine ne fait aucun tour
        if (atheria$rapide.get() && !"verif".equals(atheria$MODE)) return -32;
        return profil.CITY_MAXRADIUS;
    }

    @ModifyVariable(method = "getCityFactor", at = @At(value = "LOAD", ordinal = 1), index = 8, remap = false)
    private static float atheria$somme(float facteur, ChunkCoord coord, IDimensionInfo info, LostCityProfile profil) {
        if (!atheria$rapide.get()) return facteur;
        atheria$rapide.set(Boolean.FALSE);
        float s = atheria$calcul(coord, info, profil);
        if ("verif".equals(atheria$MODE)) {
            long n = atheria$appels.incrementAndGet();
            if (Float.floatToRawIntBits(s) != Float.floatToRawIntBits(facteur)) {
                long e = atheria$ecarts.incrementAndGet();
                if (e <= 20) atheria$LOG.warn("[ATHERIA-FACTEUR] ECART {} origine={} rapide={}", coord, facteur, s);
            }
            if ((n & 0xFFFF) == 0) atheria$LOG.info("[ATHERIA-FACTEUR] verif appels={} ecarts={}", n, atheria$ecarts.get());
            return facteur;
        }
        return s;
    }

    private static ChunkCoord[] atheria$listeCentres(IDimensionInfo info, ChunkCoord coord) {
        City.getPredefinedCity(info.getWorld(), coord);       // charge la carte comme le ferait isCityCenter
        Map<ChunkCoord, PredefinedCity> carte = predefinedCityMap;
        fr.atheria.monde.CentresVilles c0 = atheria$cache;
        if (carte == c0.carte()) return c0.centres();
        ArrayList<ChunkCoord> l = new ArrayList<>();
        if (carte != null) l.addAll(carte.keySet());
        l.sort((a, b) -> a.chunkX() != b.chunkX() ? Integer.compare(a.chunkX(), b.chunkX()) : Integer.compare(a.chunkZ(), b.chunkZ()));
        ChunkCoord[] t = l.toArray(new ChunkCoord[0]);
        atheria$cache = new fr.atheria.monde.CentresVilles(carte, t);
        return t;
    }

    // Meme calcul que la boucle d'origine (City.java l.335-350 de LC 8.4.6), restreint aux centres predefinis.
    private static float atheria$calcul(ChunkCoord coord, IDimensionInfo info, LostCityProfile profil) {
        int chunkX = coord.chunkX(), chunkZ = coord.chunkZ();
        int offset = (profil.CITY_MAXRADIUS + 15) / 16;
        net.minecraft.resources.ResourceKey<net.minecraft.world.level.Level> type = info.getType();
        float factor = 0.0f;
        for (ChunkCoord k : atheria$listeCentres(info, coord)) {
            int cx = k.chunkX(), cz = k.chunkZ();
            if (cx < chunkX - offset || cx > chunkX + offset || cz < chunkZ - offset || cz > chunkZ + offset) continue;
            if (!type.equals(k.dimension())) continue;
            ChunkCoord c = new ChunkCoord(type, cx, cz);
            LostCityProfile pro = BuildingInfo.getProfile(c, info);
            if (pro != profil) continue;
            if (!City.isCityCenter(c, info)) continue;
            float radius = City.getCityRadius(c, info);
            float sqdist = (float) ((cx * 16 - (chunkX << 4)) * (cx * 16 - (chunkX << 4)) + (cz * 16 - (chunkZ << 4)) * (cz * 16 - (chunkZ << 4)));
            if (sqdist < radius * radius) {
                float dist = (float) Math.sqrt(sqdist);
                factor += (radius - dist) / radius;
            }
        }
        return factor;
    }
}
