package fr.atheria.ile.api;

import fr.atheria.ile.CarteIle;
import fr.atheria.ile.Lot;
import fr.atheria.ile.Route;

/**
 * API publique facultative du mod de l'ile (aucune dependance dure requise : le fichier
 * config/atheria_ile/exclusions.json donne les memes informations). Methodes statiques, sans allocation.
 */
public final class IleApi {
    private IleApi() {}

    /** vrai si la carte de l'ile est chargee pour le monde courant */
    public static boolean carteChargee() { return CarteIle.active() != null; }

    /** vrai si le chunk est a moins de route_marge_blocs d'une route ou touche un lot (marge comprise) */
    public static boolean estChunkExclu(int cx, int cz) {
        CarteIle c = CarteIle.active();
        return c != null && c.chunkExclu(cx, cz);
    }

    /** distance (blocs) du centre du bloc a l'axe de la route la plus proche ; Double.POSITIVE_INFINITY sans route */
    public static double distanceRoute(int bx, int bz) {
        CarteIle c = CarteIle.active();
        if (c == null) return Double.POSITIVE_INFINITY;
        double d = Double.POSITIVE_INFINITY;
        for (int i = 0, n = c.routes.size(); i < n; i++) d = Math.min(d, c.routes.get(i).distance(bx, bz));
        return d;
    }

    /** nom du volume souterrain reserve qui contient le bloc (sans la marge), null sinon */
    public static String volumeA(int bx, int by, int bz) {
        CarteIle c = CarteIle.active();
        return c == null ? null : c.volumes.nomA(bx, by, bz);
    }

    /** vrai si le bloc est dans un volume souterrain reserve ou sa marge (le monde n'y genere rien) */
    public static boolean dansReserveSouterraine(int bx, int by, int bz) {
        CarteIle c = CarteIle.active();
        return c != null && c.volumes.reserve(bx, by, bz);
    }

    /**
     * Leve la protection des volumes souterrains le temps de l'appel, sur ce fil seulement (pour un mod qui pose
     * Bancoul, les tunnels ou les stations pendant la generation). Imbrication permise ; la protection revient
     * meme si l'action leve une exception. Inutile apres la generation : commandes, WorldEdit et construction a
     * la main ne passent pas par WorldGenRegion et ne sont jamais bloques.
     */
    public static void poserDansVolume(Runnable action) {
        fr.atheria.ile.PoseVolumes.entrer();
        try { action.run(); } finally { fr.atheria.ile.PoseVolumes.sortir(); }
    }

    /** nom du lot qui contient le bloc (sans la marge, x2 et z2 exclus), null sinon */
    public static String lotA(int bx, int bz) {
        CarteIle c = CarteIle.active();
        if (c == null) return null;
        for (int i = 0, n = c.lots.size(); i < n; i++) { Lot l = c.lots.get(i); if (l.contient(bx, bz)) return l.nom; }
        return null;
    }
}
