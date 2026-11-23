package fr.atheria.monde;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import mcjty.lostcities.config.LostCityProfile;
import mcjty.lostcities.varia.ChunkCoord;
import mcjty.lostcities.worldgen.IDimensionInfo;

// Une ville = un niveau. Lost Cities choisissait la hauteur de chaque chunk de ville par paliers de 6 blocs selon
// le terrain : sur un relief, chaque batiment se retrouvait sur son propre plateau a murs droits.
// Ici toute la ville prend le niveau du terrain a son centre. Un chunk dont le terrain s'ecarte trop de ce niveau
// n'est plus un chunk de ville : la ville s'arrete au pied des pentes et laisse les collines intactes.
public final class NiveauVilles {
    // Lus par les tests automatiques
    public static final AtomicInteger NIVEAUX = new AtomicInteger();
    public static final AtomicInteger EXCLUS = new AtomicInteger();
    public static final AtomicInteger ERREURS = new AtomicInteger();

    private static final int HAUTEUR_ETAGE = 6;
    private static final int NIVEAU_MAX = 7;
    private static final int ECART_MAX = 8;   // blocs entre le terrain du chunk et le sol de la ville
    private static final int MAX_CACHE = 4096;
    private static final ThreadLocal<Boolean> EN_COURS = ThreadLocal.withInitial(() -> Boolean.FALSE);
    private record Cle(long graine, Object dimension, long centre) {
    }

    // graine, dimension, centre -> niveau de la ville
    private static final Map<Cle, Integer> CACHE = new ConcurrentHashMap<>();

    private NiveauVilles() {
    }

    private static int hauteur(IDimensionInfo info, int cx, int cz) {
        return info.getHeightmap(new ChunkCoord(info.getType(), cx, cz)).getHeight();
    }

    private static Integer niveauDuCentre(float[] centre, IDimensionInfo info, LostCityProfile profil) {
        int x = (int) centre[0], z = (int) centre[1];
        Cle cle = new Cle(info.getSeed(), info.getType(), ((long) x << 32) | (z & 0xFFFFFFFFL));
        Integer n = CACHE.get(cle);
        if (n != null) return n;
        // moyenne du centre et de ses quatre voisins a deux chunks : un creux ou une bosse isoles ne decident pas pour la ville
        int somme = hauteur(info, x, z) + hauteur(info, x - 2, z) + hauteur(info, x + 2, z) + hauteur(info, x, z - 2) + hauteur(info, x, z + 2);
        int niveau = Math.round((somme / 5f - profil.GROUNDLEVEL) / HAUTEUR_ETAGE);
        n = Math.max(0, Math.min(NIVEAU_MAX, niveau));
        if (CACHE.size() > MAX_CACHE) CACHE.clear();
        CACHE.put(cle, n);
        return n;
    }

    // Niveau impose au chunk, ou null pour laisser Lost Cities decider
    public static Integer niveau(ChunkCoord coord, IDimensionInfo info) {
        if (EN_COURS.get()) return null;
        EN_COURS.set(Boolean.TRUE);
        try {
            LostCityProfile profil = info.getProfile();
            if (coord == null || profil == null || profil.CITY_CHANCE < 0) return null;
            float[] centre = StyleVilles.centreProche(coord, info);
            if (centre == null) return null;
            Integer n = niveauDuCentre(centre, info, profil);
            if (n != null) NIVEAUX.incrementAndGet();
            return n;
        } catch (Throwable t) {
            ERREURS.incrementAndGet();
            return null;
        } finally {
            EN_COURS.set(Boolean.FALSE);
        }
    }

    // Vrai si ce chunk, que Lost Cities voulait en ville, doit rester du terrain naturel
    public static boolean horsVille(ChunkCoord coord, IDimensionInfo info, LostCityProfile profil) {
        if (EN_COURS.get()) return false;
        EN_COURS.set(Boolean.TRUE);
        try {
            if (coord == null || info == null || profil == null || profil.CITY_CHANCE < 0) return false;
            float[] centre = StyleVilles.centreProche(coord, info);
            if (centre == null) return false;
            Integer n = niveauDuCentre(centre, info, profil);
            if (n == null) return false;
            int sol = profil.GROUNDLEVEL + n * HAUTEUR_ETAGE;
            int h = hauteur(info, coord.chunkX(), coord.chunkZ());
            if (Math.abs(h - sol) <= ECART_MAX) return false;
            EXCLUS.incrementAndGet();
            return true;
        } catch (Throwable t) {
            ERREURS.incrementAndGet();
            return false;
        } finally {
            EN_COURS.set(Boolean.FALSE);
        }
    }
}
