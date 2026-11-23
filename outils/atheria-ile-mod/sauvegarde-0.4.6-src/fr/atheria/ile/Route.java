package fr.atheria.ile;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import net.minecraft.world.level.LevelHeightAccessor;
import net.minecraft.world.level.chunk.ChunkGenerator;
import net.minecraft.world.level.levelgen.Heightmap;
import net.minecraft.world.level.levelgen.RandomState;

import java.util.ArrayList;
import java.util.List;

/**
 * Route dessinee ("routes" dans regions.json) : polyligne de points (x, z), virages arrondis,
 * troncons droits gardes tels quels, axe echantillonne tous les 2 blocs, profil en long lisse (pente max).
 * Toutes les requetes par colonne sont sans allocation (grille d'index precalculee).
 */
public final class Route {
    public static final double PAS = 2.0;
    /** cellule de la grille d'index (blocs) */
    private static final int CELLULE = 32;

    public final String nom;
    public final int demiLargeur, basCotes, talus, margeStructures;
    public final double penteMax;
    /** axe : x, z, abscisse curviligne ; drapeau "troncon droit garde" */
    public final float[] ax, az;
    public final float[] abs;
    public final boolean[] droit;
    /** profil en long (Y de la chaussee) par echantillon, calcule a la premiere generation */
    private volatile int[] profil;

    private final int gx0, gz0, gn, gm;
    private final int[][] grille;
    private final boolean[] proche;

    /** portee de la grille fine : chaussee + bas-cotes + talus */
    public final int portee;

    private Route(String nom, List<double[]> pts, boolean[] aretesDroites, int demiLargeur, int basCotes, int talus, int rayonVirage,
                  double penteMax, int margeStructures) {
        this.nom = nom;
        this.demiLargeur = demiLargeur;
        this.basCotes = basCotes;
        this.talus = talus;
        this.penteMax = penteMax;
        this.margeStructures = margeStructures;
        // --- virages arrondis : a chaque sommet interieur, on coupe r blocs de chaque cote et on pose une courbe de Bezier
        List<double[]> axe = new ArrayList<>();
        List<Boolean> estDroit = new ArrayList<>();
        int n = pts.size();
        double[] coupeAvant = new double[n], coupeApres = new double[n];
        for (int i = 1; i < n - 1; i++) {
            double l1 = dist(pts.get(i - 1), pts.get(i)), l2 = dist(pts.get(i), pts.get(i + 1));
            double r = Math.min(rayonVirage, Math.min(l1, l2) / 2.5);
            coupeAvant[i] = r;
            coupeApres[i] = r;
        }
        for (int i = 0; i < n - 1; i++) {
            double[] a = pts.get(i), b = pts.get(i + 1);
            double l = dist(a, b);
            double ux = (b[0] - a[0]) / l, uz = (b[1] - a[1]) / l;
            double s0 = coupeApres[i], s1 = l - coupeAvant[i + 1];
            // troncon droit
            for (double s = s0; s < s1; s += PAS) { axe.add(new double[]{a[0] + ux * s, a[1] + uz * s}); estDroit.add(aretesDroites[i]); }
            // virage vers l'arete suivante
            if (i + 1 < n - 1) {
                double[] c = pts.get(i + 2);
                double l2 = dist(b, c);
                double vx = (c[0] - b[0]) / l2, vz = (c[1] - b[1]) / l2;
                double[] p0 = {b[0] - ux * coupeAvant[i + 1], b[1] - uz * coupeAvant[i + 1]};
                double[] p2 = {b[0] + vx * coupeApres[i + 1], b[1] + vz * coupeApres[i + 1]};
                double longueur = coupeAvant[i + 1] + coupeApres[i + 1];
                int k = Math.max(1, (int) Math.ceil(longueur / PAS));
                for (int j = 0; j < k; j++) {
                    double t = j / (double) k;
                    double x = (1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * b[0] + t * t * p2[0];
                    double z = (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * b[1] + t * t * p2[1];
                    axe.add(new double[]{x, z});
                    estDroit.add(false);
                }
            }
        }
        double[] fin = pts.get(n - 1);
        axe.add(new double[]{fin[0], fin[1]});
        estDroit.add(aretesDroites[n - 2]);
        int m = axe.size();
        ax = new float[m]; az = new float[m]; abs = new float[m]; droit = new boolean[m];
        double cum = 0;
        for (int i = 0; i < m; i++) {
            if (i > 0) cum += dist(axe.get(i - 1), axe.get(i));
            ax[i] = (float) axe.get(i)[0];
            az[i] = (float) axe.get(i)[1];
            abs[i] = (float) cum;
            droit[i] = estDroit.get(i);
        }
        // --- grille d'index : pour chaque cellule, les echantillons a moins de "portee" blocs
        portee = demiLargeur + basCotes + talus + 2;
        float minX = Float.MAX_VALUE, minZ = Float.MAX_VALUE, maxX = -Float.MAX_VALUE, maxZ = -Float.MAX_VALUE;
        for (int i = 0; i < m; i++) { minX = Math.min(minX, ax[i]); maxX = Math.max(maxX, ax[i]); minZ = Math.min(minZ, az[i]); maxZ = Math.max(maxZ, az[i]); }
        int large = Math.max(portee, margeStructures) + CELLULE;
        gx0 = (int) Math.floor((minX - large) / CELLULE);
        gz0 = (int) Math.floor((minZ - large) / CELLULE);
        gn = (int) Math.floor((maxX + large) / CELLULE) - gx0 + 1;
        gm = (int) Math.floor((maxZ + large) / CELLULE) - gz0 + 1;
        int[] compte = new int[gn * gm];
        proche = new boolean[gn * gm];
        for (int pass = 0; pass < 2; pass++) {
            int[][] g = pass == 1 ? new int[gn * gm][] : null;
            if (g != null) for (int i = 0; i < g.length; i++) if (compte[i] > 0) g[i] = new int[compte[i]];
            int[] rempli = new int[gn * gm];
            for (int i = 0; i < m; i++) {
                int cx0 = (int) Math.floor((ax[i] - portee) / CELLULE) - gx0, cx1 = (int) Math.floor((ax[i] + portee) / CELLULE) - gx0;
                int cz0 = (int) Math.floor((az[i] - portee) / CELLULE) - gz0, cz1 = (int) Math.floor((az[i] + portee) / CELLULE) - gz0;
                for (int cz = cz0; cz <= cz1; cz++) for (int cx = cx0; cx <= cx1; cx++) {
                    int k = cz * gn + cx;
                    if (g == null) compte[k]++; else g[k][rempli[k]++] = i;
                }
                if (pass == 0) {
                    int mr = margeStructures + demiLargeur;
                    int px0 = (int) Math.floor((ax[i] - mr) / CELLULE) - gx0, px1 = (int) Math.floor((ax[i] + mr) / CELLULE) - gx0;
                    int pz0 = (int) Math.floor((az[i] - mr) / CELLULE) - gz0, pz1 = (int) Math.floor((az[i] + mr) / CELLULE) - gz0;
                    for (int cz = pz0; cz <= pz1; cz++) for (int cx = px0; cx <= px1; cx++) proche[cz * gn + cx] = true;
                }
            }
            if (g != null) { grilleTmp = g; }
        }
        grille = grilleTmp;
        grilleTmp = null;
    }

    private int[][] grilleTmp;

    private static double dist(double[] a, double[] b) { return Math.hypot(b[0] - a[0], b[1] - a[1]); }

    static List<Route> lire(JsonObject config) {
        List<Route> l = new ArrayList<>();
        if (!config.has("routes") || !config.get("routes").isJsonArray()) return l;
        for (JsonElement e : config.getAsJsonArray("routes")) {
            JsonObject o = e.getAsJsonObject();
            List<double[]> pts = new ArrayList<>();
            for (JsonElement p : o.getAsJsonArray("points")) { JsonArray a = p.getAsJsonArray(); pts.add(new double[]{a.get(0).getAsDouble(), a.get(1).getAsDouble()}); }
            if (pts.size() < 2) continue;
            boolean[] droites = new boolean[pts.size() - 1];
            if (o.has("troncons_droits")) for (JsonElement d : o.getAsJsonArray("troncons_droits")) {
                JsonArray a = d.getAsJsonArray();
                for (int i = a.get(0).getAsInt(); i < a.get(1).getAsInt() && i < droites.length; i++) droites[i] = true;
            }
            int largeur = o.has("largeur_blocs") ? o.get("largeur_blocs").getAsInt() : 14;
            Route r = new Route(o.has("nom") ? o.get("nom").getAsString() : "route", pts, droites,
                    Math.max(2, largeur / 2), o.has("bas_cotes_blocs") ? o.get("bas_cotes_blocs").getAsInt() : 10,
                    o.has("talus_blocs") ? o.get("talus_blocs").getAsInt() : 20,
                    o.has("rayon_virage_blocs") ? o.get("rayon_virage_blocs").getAsInt() : 48,
                    o.has("pente_max") ? o.get("pente_max").getAsDouble() : 0.125,
                    o.has("marge_structures_blocs") ? o.get("marge_structures_blocs").getAsInt() : 64);
            CarteIle.LOG.info("[atheria_ile] route '{}' : {} points, {} blocs d'axe, chaussee {} blocs, bas-cotes {}, talus {}",
                    r.nom, pts.size(), (int) r.abs[r.abs.length - 1], 2 * r.demiLargeur, r.basCotes, r.talus);
            l.add(r);
        }
        return l;
    }

    /**
     * Echantillon d'axe le plus proche du bloc (dans la portee), -1 sinon. d2 : distance au carre ecrite dans out[0].
     * Sans allocation.
     */
    public int proche(int bx, int bz, double[] out) {
        int cx = Math.floorDiv(bx, CELLULE) - gx0, cz = Math.floorDiv(bz, CELLULE) - gz0;
        if (cx < 0 || cz < 0 || cx >= gn || cz >= gm) return -1;
        int[] l = grille[cz * gn + cx];
        if (l == null) return -1;
        int best = -1;
        double bd = (double) portee * portee;
        for (int i : l) {
            double dx = bx + 0.5 - ax[i], dz = bz + 0.5 - az[i];
            double d2 = dx * dx + dz * dz;
            if (d2 < bd) { bd = d2; best = i; }
        }
        out[0] = bd;
        return best;
    }

    /** Vrai si le bloc est a moins de (demi-largeur + marge structures) de l'axe, a la cellule pres. */
    public boolean pres(int bx, int bz) {
        int cx = Math.floorDiv(bx, CELLULE) - gx0, cz = Math.floorDiv(bz, CELLULE) - gz0;
        return cx >= 0 && cz >= 0 && cx < gn && cz < gm && proche[cz * gn + cx];
    }

    public boolean profilPret() { return profil != null; }

    /** Y de la chaussee a l'echantillon i (profil calcule a la premiere demande, une seule fois). */
    public int y(int i, ChunkGenerator gen, LevelHeightAccessor h, RandomState rs, int mer) {
        int[] p = profil;
        if (p == null) p = calculerProfil(gen, h, rs, mer);
        return p[i];
    }

    public int y(int i) { return profil[i]; }

    private synchronized int[] calculerProfil(ChunkGenerator gen, LevelHeightAccessor h, RandomState rs, int mer) {
        if (profil != null) return profil;
        long debut = System.currentTimeMillis();
        int m = ax.length;
        int pas = 8; // un releve tous les 8 echantillons = 16 blocs
        int nc = (m - 1) / pas + 1;
        double[] brut = new double[nc];
        for (int k = 0; k < nc; k++) {
            int i = Math.min(m - 1, k * pas);
            int y = gen.getBaseHeight((int) ax[i], (int) az[i], Heightmap.Types.OCEAN_FLOOR_WG, h, rs);
            brut[k] = Math.max(mer + 2, y);   // jamais sous l'eau : pont ou remblai au-dessus des rivieres
        }
        // lissage (moyenne glissante sur +-64 blocs), troncons droits a plat (moyenne du troncon)
        double[] lis = new double[nc];
        for (int k = 0; k < nc; k++) {
            double s = 0; int c = 0;
            for (int j = Math.max(0, k - 4); j <= Math.min(nc - 1, k + 4); j++) { s += brut[j]; c++; }
            lis[k] = s / c;
        }
        int k0 = -1;
        for (int k = 0; k <= nc; k++) {
            boolean d = k < nc && droit[Math.min(m - 1, k * pas)];
            if (d && k0 < 0) k0 = k;
            if (!d && k0 >= 0) {
                double s = 0;
                for (int j = k0; j < k; j++) s += lis[j];
                double moy = Math.round(s / (k - k0));
                for (int j = k0; j < k; j++) lis[j] = moy;
                k0 = -1;
            }
        }
        // pente max dans les deux sens (deblai et remblai)
        double dmax = penteMax * pas * PAS;
        for (int k = 1; k < nc; k++) lis[k] = Math.max(lis[k - 1] - dmax, Math.min(lis[k - 1] + dmax, lis[k]));
        for (int k = nc - 2; k >= 0; k--) lis[k] = Math.max(lis[k + 1] - dmax, Math.min(lis[k + 1] + dmax, lis[k]));
        int[] p = new int[m];
        for (int i = 0; i < m; i++) {
            double f = i / (double) pas;
            int k = Math.min(nc - 1, (int) f);
            double t = f - k;
            double v = k + 1 < nc ? lis[k] * (1 - t) + lis[k + 1] * t : lis[k];
            p[i] = (int) Math.round(v);
        }
        profil = p;
        int mn = Integer.MAX_VALUE, mx = Integer.MIN_VALUE;
        for (int v : p) { mn = Math.min(mn, v); mx = Math.max(mx, v); }
        CarteIle.LOG.info("[atheria_ile] route '{}' : profil en long calcule ({} releves, Y {}..{}, {} ms)", nom, nc, mn, mx, System.currentTimeMillis() - debut);
        return p;
    }
}
