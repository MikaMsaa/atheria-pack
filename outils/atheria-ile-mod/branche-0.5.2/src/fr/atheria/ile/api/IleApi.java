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

    /** nom du lot qui contient le bloc (sans la marge, x2 et z2 exclus), null sinon */
    public static String lotA(int bx, int bz) {
        CarteIle c = CarteIle.active();
        if (c == null) return null;
        for (int i = 0, n = c.lots.size(); i < n; i++) { Lot l = c.lots.get(i); if (l.contient(bx, bz)) return l.nom; }
        return null;
    }
}
