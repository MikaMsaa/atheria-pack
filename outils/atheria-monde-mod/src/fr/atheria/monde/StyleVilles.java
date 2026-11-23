package fr.atheria.monde;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import mcjty.lostcities.config.LostCityProfile;
import mcjty.lostcities.varia.ChunkCoord;
import mcjty.lostcities.worldgen.IDimensionInfo;
import mcjty.lostcities.worldgen.lost.City;
import mcjty.lostcities.worldgen.lost.cityassets.AssetRegistries;
import mcjty.lostcities.worldgen.lost.cityassets.CityStyle;

// Une ville = une architecture : Lost Cities tirait le style chunk par chunk (entre villes qui se chevauchent,
// et au hasard pour les chunks de ville hors de tout rayon). Ici le centre de ville le plus "proche" (distance
// rapportee au rayon) impose son style a tout chunk de ville, dans un rayon de recherche large.
public final class StyleVilles {
    // Lus par les tests automatiques
    public static final AtomicInteger CHOIX = new AtomicInteger();
    public static final AtomicInteger REPLIS = new AtomicInteger();

    private static final int CELLULE = 16;      // centres indexes par cellules de 16 x 16 chunks
    private static final int PORTEE_CELLULES = 6; // recherche jusqu'a ~96 chunks (1536 blocs)
    private static final int MAX_CELLULES = 8192;
    private static final int MAX_CHUNKS = 65536;
    // cle sans chaine de caracteres (ces recherches sont faites des milliers de fois par chunk genere)
    private record Cle(long graine, Object dimension, long position) {
    }

    private static final float[] AUCUN = new float[0];
    // graine du monde, dimension, cellule -> centres {x, z, rayon en blocs}
    private static final Map<Cle, List<float[]>> CENTRES = new ConcurrentHashMap<>();
    // graine du monde, dimension, chunk -> centre retenu pour ce chunk (AUCUN s'il n'y en a pas)
    private static final Map<Cle, float[]> PROCHES = new ConcurrentHashMap<>();

    private static long paire(int a, int b) {
        return ((long) a << 32) | (b & 0xFFFFFFFFL);
    }

    private StyleVilles() {
    }

    private static List<float[]> centres(IDimensionInfo info, int cx, int cz) {
        Cle cle = new Cle(info.getSeed(), info.getType(), paire(cx, cz));
        List<float[]> l = CENTRES.get(cle);
        if (l != null) return l;
        l = new ArrayList<>();
        for (int x = cx * CELLULE; x < (cx + 1) * CELLULE; x++) {
            for (int z = cz * CELLULE; z < (cz + 1) * CELLULE; z++) {
                ChunkCoord c = new ChunkCoord(info.getType(), x, z);
                if (City.isCityCenter(c, info)) l.add(new float[] { x, z, City.getCityRadius(c, info) });
            }
        }
        if (CENTRES.size() > MAX_CELLULES) CENTRES.clear();
        CENTRES.put(cle, l);
        return l;
    }

    // Centre de ville le plus "au coeur" pour ce chunk : {x, z, rayon en blocs, facteur}, ou null s'il n'y en a aucun a portee
    public static float[] centreProche(ChunkCoord coord, IDimensionInfo info) {
        Cle cle = new Cle(info.getSeed(), info.getType(), paire(coord.chunkX(), coord.chunkZ()));
        float[] connu = PROCHES.get(cle);
        if (connu != null) return connu == AUCUN ? null : connu;
        float[] trouve = chercherCentre(coord, info);
        if (PROCHES.size() > MAX_CHUNKS) PROCHES.clear();
        PROCHES.put(cle, trouve == null ? AUCUN : trouve);
        return trouve;
    }

    private static float[] chercherCentre(ChunkCoord coord, IDimensionInfo info) {
        int x0 = coord.chunkX(), z0 = coord.chunkZ();
        int c0x = Math.floorDiv(x0, CELLULE), c0z = Math.floorDiv(z0, CELLULE);
        float[] meilleur = null;
        float meilleurFacteur = -Float.MAX_VALUE;
        for (int r = 0; r <= PORTEE_CELLULES; r++) {
            // anneau r : on s'arrete des qu'un centre englobe le chunk et que l'anneau suivant ne peut pas faire mieux
            for (int cx = c0x - r; cx <= c0x + r; cx++) {
                for (int cz = c0z - r; cz <= c0z + r; cz++) {
                    if (Math.max(Math.abs(cx - c0x), Math.abs(cz - c0z)) != r) continue;
                    for (float[] c : centres(info, cx, cz)) {
                        float dx = (c[0] - x0) * 16f, dz = (c[1] - z0) * 16f, rayon = Math.max(1f, c[2]);
                        float facteur = (rayon - (float) Math.sqrt(dx * dx + dz * dz)) / rayon;
                        // egalite : ordre de parcours fixe, donc resultat identique a chaque chargement
                        if (facteur > meilleurFacteur) {
                            meilleurFacteur = facteur;
                            meilleur = c;
                        }
                    }
                }
            }
            if (meilleur != null && meilleurFacteur >= 0 && r * CELLULE * 16 > 448 + 16) break;
        }
        return meilleur == null ? null : new float[] { meilleur[0], meilleur[1], meilleur[2], meilleurFacteur };
    }

    // null = laisser Lost Cities decider (mode Perlin, aucune ville autour, ou erreur)
    public static CityStyle choisir(ChunkCoord coord, IDimensionInfo info, LostCityProfile profil) {
        try {
            if (coord == null || info == null || profil == null || profil.CITY_CHANCE < 0) return null;
            float[] meilleur = centreProche(coord, info);
            float meilleurFacteur = meilleur == null ? 0f : meilleur[3];
            if (meilleur == null) return null;
            ChunkCoord centre = new ChunkCoord(info.getType(), (int) meilleur[0], (int) meilleur[1]);
            String nom = (meilleurFacteur >= 0 && meilleurFacteur < profil.CITY_STYLE_THRESHOLD) ? profil.CITY_STYLE_ALTERNATIVE : City.getCityStyleForCityCenter(centre, info);
            if (nom == null || nom.isEmpty()) return null;
            Object style = AssetRegistries.CITYSTYLES.get(info.getWorld(), nom);
            if (!(style instanceof CityStyle)) {
                REPLIS.incrementAndGet();
                return null;
            }
            CHOIX.incrementAndGet();
            return (CityStyle) style;
        } catch (Throwable t) {
            REPLIS.incrementAndGet();
            return null;
        }
    }
}
