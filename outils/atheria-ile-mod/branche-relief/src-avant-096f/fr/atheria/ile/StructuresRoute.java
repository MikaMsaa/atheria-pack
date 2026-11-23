package fr.atheria.ile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Structures et routes : une structure dont la BOITE (tous ses morceaux) passe a moins de route_marge_blocs de l'axe
 * d'une route (chaussee + bas-cotes) ou entre dans un lot (marge comprise) est refusee, et notee pour le rapport
 * rapport-structures-route.txt (identifiant, boite, raison). Le test exact (rectangle / polyligne) ne tourne que si
 * la boite touche au moins un chunk de chunks_exclus.
 */
public final class StructuresRoute {
    private StructuresRoute() {}

    private static final Map<String, String> NOTES = new ConcurrentHashMap<>();
    private static final Map<String, String> GARDEES = new ConcurrentHashMap<>();

    /**
     * Une structure qui croise le couloir d'une route mais dont le haut de la boite reste au moins PROFONDEUR_MIN
     * blocs sous le sol (au point de l'axe le plus proche) est gardee : la route ne l'atteint pas.
     */
    public static final int PROFONDEUR_MIN = 12;

    /** point de l'axe (x, z) le plus proche du rectangle, pour la route la plus proche */
    public static int[] axeProche(CarteIle c, int x0, int z0, int x1, int z1) {
        double mn = Double.MAX_VALUE; int bx = x0, bz = z0;
        for (Route r : c.routes) for (int i = 0; i < r.ax.length; i++) {
            double d = pointRectStatic(r.ax[i], r.az[i], x0 + 0.5, z0 + 0.5, x1 + 0.5, z1 + 0.5);
            if (d < mn) { mn = d; bx = (int) Math.floor(r.ax[i]); bz = (int) Math.floor(r.az[i]); }
        }
        return new int[]{bx, bz};
    }

    private static double pointRectStatic(double px, double pz, double x0, double z0, double x1, double z1) {
        double dx = Math.max(Math.max(x0 - px, 0), px - x1), dz = Math.max(Math.max(z0 - pz, 0), pz - z1);
        return Math.hypot(dx, dz);
    }

    public static void noterGardee(String id, int cx, int cz, int x0, int y0, int z0, int x1, int y1, int z1, String raison, int sol) {
        GARDEES.putIfAbsent(id + " @" + cx + "," + cz,
                String.format(java.util.Locale.ROOT, "%s : depart chunk %d,%d, boite %d,%d,%d -> %d,%d,%d : gardee, souterraine (%s, haut Y %d, sol Y %d)", id, cx, cz, x0, y0, z0, x1, y1, z1, raison, y1, sol));
    }

    /** raison du refus ("route RN1 a 12,3 blocs", "lot X"), ou null si la boite est libre */
    public static String conflit(CarteIle c, int x0, int z0, int x1, int z1) {
        boolean touche = false;
        for (int cz = Math.floorDiv(z0, 16); cz <= Math.floorDiv(z1, 16) && !touche; cz++)
            for (int cx = Math.floorDiv(x0, 16); cx <= Math.floorDiv(x1, 16); cx++)
                if (c.chunkExclu(cx, cz)) { touche = true; break; }
        if (!touche) return null;
        for (Lot l : c.lots)
            if (x0 < l.x2 + l.marge && x1 >= l.x1 - l.marge && z0 < l.z2 + l.marge && z1 >= l.z1 - l.marge) return "lot '" + l.nom + "'";
        for (Route r : c.routes) {
            double d = distanceRoute(r, x0 + 0.5, z0 + 0.5, x1 + 0.5, z1 + 0.5);
            if (d < c.margeRoute) return String.format(java.util.Locale.ROOT, "route %s a %.1f blocs de l'axe", r.nom, d);
        }
        return null;
    }

    /** distance minimale entre un rectangle (centres des blocs) et l'axe echantillonne d'une route */
    static double distanceRoute(Route r, double x0, double z0, double x1, double z1) {
        double mn = Double.MAX_VALUE;
        for (int i = 0; i + 1 < r.ax.length; i++) {
            double ax = r.ax[i], az = r.az[i], bx = r.ax[i + 1], bz = r.az[i + 1];
            if (Math.min(ax, bx) > x1 + mn || Math.max(ax, bx) < x0 - mn || Math.min(az, bz) > z1 + mn || Math.max(az, bz) < z0 - mn) continue;
            mn = Math.min(mn, segmentRectangle(ax, az, bx, bz, x0, z0, x1, z1));
            if (mn == 0) return 0;
        }
        return mn;
    }

    /** distance exacte segment / rectangle plein (0 si le segment le traverse) */
    static double segmentRectangle(double ax, double az, double bx, double bz, double x0, double z0, double x1, double z1) {
        if (dedans(ax, az, x0, z0, x1, z1) || dedans(bx, bz, x0, z0, x1, z1)) return 0;
        if (coupe(ax, az, bx, bz, x0, z0, x1, z0) || coupe(ax, az, bx, bz, x1, z0, x1, z1)
                || coupe(ax, az, bx, bz, x1, z1, x0, z1) || coupe(ax, az, bx, bz, x0, z1, x0, z0)) return 0;
        double d = Math.min(pointRect(ax, az, x0, z0, x1, z1), pointRect(bx, bz, x0, z0, x1, z1));
        d = Math.min(d, pointSegment(x0, z0, ax, az, bx, bz));
        d = Math.min(d, pointSegment(x1, z0, ax, az, bx, bz));
        d = Math.min(d, pointSegment(x0, z1, ax, az, bx, bz));
        d = Math.min(d, pointSegment(x1, z1, ax, az, bx, bz));
        return d;
    }

    private static boolean dedans(double px, double pz, double x0, double z0, double x1, double z1) {
        return px >= x0 && px <= x1 && pz >= z0 && pz <= z1;
    }

    private static double pointRect(double px, double pz, double x0, double z0, double x1, double z1) {
        double dx = Math.max(Math.max(x0 - px, 0), px - x1), dz = Math.max(Math.max(z0 - pz, 0), pz - z1);
        return Math.hypot(dx, dz);
    }

    private static double pointSegment(double px, double pz, double ax, double az, double bx, double bz) {
        double dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz;
        double u = l2 == 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / l2));
        return Math.hypot(ax + u * dx - px, az + u * dz - pz);
    }

    private static double vect(double ax, double az, double bx, double bz, double cx, double cz) {
        return (bx - ax) * (cz - az) - (bz - az) * (cx - ax);
    }

    private static boolean coupe(double ax, double az, double bx, double bz, double cx, double cz, double dx, double dz) {
        double d1 = vect(cx, cz, dx, dz, ax, az), d2 = vect(cx, cz, dx, dz, bx, bz), d3 = vect(ax, az, bx, bz, cx, cz), d4 = vect(ax, az, bx, bz, dx, dz);
        return ((d1 > 0) != (d2 > 0)) && ((d3 > 0) != (d4 > 0));
    }

    public static void noter(String id, int cx, int cz, int x0, int y0, int z0, int x1, int y1, int z1, String raison) {
        NOTES.putIfAbsent(id + " @" + cx + "," + cz,
                String.format(java.util.Locale.ROOT, "%s : depart chunk %d,%d, boite %d,%d,%d -> %d,%d,%d : REFUSEE (%s)", id, cx, cz, x0, y0, z0, x1, y1, z1, raison));
        CarteIle.LOG.info("[atheria_ile] structure refusee {} chunk {},{} : {}", id, cx, cz, raison);
    }

    static void ecrire(CarteIle c) {
        int t = ValidationRoutes.troncon(), n = ValidationRoutes.troncons();
        if (t > 0) {
            try {
                java.nio.file.Path rendus = c.dossier.resolve("rendus");
                java.nio.file.Files.createDirectories(rendus);
                StringBuilder o = new StringBuilder();
                for (Map.Entry<String, String> e : NOTES.entrySet()) o.append("R\t").append(e.getKey()).append('\t').append(e.getValue()).append('\n');
                for (Map.Entry<String, String> e : GARDEES.entrySet()) o.append("G\t").append(e.getKey()).append('\t').append(e.getValue()).append('\n');
                java.nio.file.Files.writeString(rendus.resolve("structures-t" + t + ".tsv"), o.toString());
                if (t < n) { CarteIle.LOG.info("[atheria_ile] structures du troncon {} sauvees : {} refusee(s)", t, NOTES.size()); return; }
                for (int k = 1; k < n; k++) {
                    java.nio.file.Path f = rendus.resolve("structures-t" + k + ".tsv");
                    if (!java.nio.file.Files.exists(f)) continue;
                    for (String ligne : java.nio.file.Files.readAllLines(f)) {
                        String[] x = ligne.split("\t", 3);
                        if (x.length < 3) continue;
                        (x[0].equals("R") ? NOTES : GARDEES).putIfAbsent(x[1], x[2]);
                    }
                }
            } catch (Exception ex) { CarteIle.LOG.warn("[atheria_ile] structures par troncon : {}", ex.toString()); }
        }
        List<String> l = new ArrayList<>(NOTES.values());
        l.sort(null);
        StringBuilder sb = new StringBuilder("STRUCTURES REFUSEES PRES DES ROUTES ET DANS LES LOTS (chunks generes pendant cette session)\n");
        sb.append("regle : boite de la structure a moins de ").append(c.margeRoute)
          .append(" blocs de l'axe d'une route (chaussee + bas-cotes), ou dans un lot et sa marge -> refusee\n");
        sb.append(l.size()).append(" structure(s) refusee(s)\n");
        for (String s : l) sb.append("   ").append(s).append('\n');
        List<String> g = new ArrayList<>(GARDEES.values());
        g.sort(null);
        sb.append('\n').append(g.size()).append(" structure(s) souterraine(s) gardee(s) sous le couloir (haut de la boite a ").append(PROFONDEUR_MIN).append(" blocs ou plus sous le sol)\n");
        for (String s : g) sb.append("   ").append(s).append('\n');
        Tests.ecrireRapport(c, "rapport-structures-route.txt", sb.toString());
        CarteIle.LOG.info("[atheria_ile] rapport-structures-route.txt ecrit : {} structure(s) refusee(s)", l.size());
    }
}
