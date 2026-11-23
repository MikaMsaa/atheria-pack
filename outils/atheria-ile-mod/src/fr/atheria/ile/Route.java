package fr.atheria.ile;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import net.minecraft.world.level.Level;
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
    /** 0.5.5 : ecart max (blocs) entre une rue Lost Cities et le profil naturel pour que la route s'y cale */
    static final int ECART_RUE_MAX = 6;
    /** cellule de la grille d'index (blocs) */
    private static final int CELLULE = 32;

    public final String nom;
    public final int demiLargeur, basCotes, talus, margeStructures;
    public final double penteMax;
    /** axe : x, z, abscisse curviligne ; drapeau "troncon droit garde" */
    public final float[] ax, az;
    public final float[] abs;
    public final boolean[] droit;
    /** 0.5.4 : echantillon sur le tablier d'un pont sureleve ("ponts"), et Y impose de ce tablier (MIN_VALUE sinon) */
    public final boolean[] tablier;
    private final int[] yTablier;
    /** ponts sureleves : nom, echantillon central, demi-longueur (blocs), Y du tablier */
    final List<Object[]> ponts = new ArrayList<>();
    /** 0.5.6 : ponts automatiques sur les rivieres dessinees (Y calcule avec le profil) : indices dans ponts */
    private final List<Integer> pontsAutoIdx = new ArrayList<>();
    /** traversee : chaussee touchant le lit (axe a moins de 10 + demi-largeur de la ligne de riviere), plus 8 blocs d'abscisse de chaque cote */
    static final double PONT_RIVIERE_D = 10, PONT_MARGE = 8;
    /** bilan des ponts automatiques pour les rapports */
    String bilanPontsAuto = "";
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
        tablier = new boolean[m];
        yTablier = new int[m];
        java.util.Arrays.fill(yTablier, Integer.MIN_VALUE);
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
            // 0.5.4 : ponts sureleves {"nom", "x", "z", "demi_longueur_blocs", "y"} : tablier plat a Y sur +-demi-longueur
            // d'abscisse autour de l'echantillon le plus proche de (x, z) ; rampes a la pente max de chaque cote
            if (o.has("ponts")) for (JsonElement pe : o.getAsJsonArray("ponts")) {
                JsonObject po = pe.getAsJsonObject();
                double px = po.get("x").getAsDouble(), pz = po.get("z").getAsDouble();
                int c = 0; double bd = Double.MAX_VALUE;
                for (int i = 0; i < r.ax.length; i++) { double d = Math.hypot(r.ax[i] - px, r.az[i] - pz); if (d < bd) { bd = d; c = i; } }
                double dl = po.has("demi_longueur_blocs") ? po.get("demi_longueur_blocs").getAsDouble() : 32;
                int y = po.get("y").getAsInt();
                String pn = po.has("nom") ? po.get("nom").getAsString() : "pont " + (r.ponts.size() + 1);
                int n0 = Integer.MAX_VALUE, n1 = -1;
                for (int i = 0; i < r.ax.length; i++) if (Math.abs(r.abs[i] - r.abs[c]) <= dl) { r.tablier[i] = true; r.yTablier[i] = y; n0 = Math.min(n0, i); n1 = Math.max(n1, i); }
                r.ponts.add(new Object[]{pn, c, dl, y, n0, n1});
                CarteIle.LOG.info("[atheria_ile] route '{}' : pont sureleve '{}' a {} blocs de {},{} (axe {},{}), abscisse {}..{}, tablier Y {}",
                        r.nom, pn, String.format("%.1f", bd), (int) px, (int) pz, (int) r.ax[c], (int) r.az[c], (int) r.abs[n0], (int) r.abs[n1], y);
            }
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

    /** Distance (blocs) du centre du bloc a l'axe echantillonne ; grille fine si proche, sinon parcours complet. Sans allocation. */
    public double distance(int bx, int bz) {
        double px = bx + 0.5, pz = bz + 0.5, bd = Double.MAX_VALUE;
        int cx = Math.floorDiv(bx, CELLULE) - gx0, cz = Math.floorDiv(bz, CELLULE) - gz0;
        if (cx >= 0 && cz >= 0 && cx < gn && cz < gm && grille[cz * gn + cx] != null) {
            for (int i : grille[cz * gn + cx]) { double dx = px - ax[i], dz = pz - az[i]; bd = Math.min(bd, dx * dx + dz * dz); }
            if (bd <= (double) portee * portee) return Math.sqrt(bd);
        }
        for (int i = 0; i < ax.length; i++) { double dx = px - ax[i], dz = pz - az[i]; bd = Math.min(bd, dx * dx + dz * dz); }
        return Math.sqrt(bd);
    }

    /** Vrai si le bloc est a moins de (demi-largeur + marge structures) de l'axe, a la cellule pres. */
    public boolean pres(int bx, int bz) {
        int cx = Math.floorDiv(bx, CELLULE) - gx0, cz = Math.floorDiv(bz, CELLULE) - gz0;
        return cx >= 0 && cz >= 0 && cx < gn && cz < gm && proche[cz * gn + cx];
    }

    public boolean profilPret() { return profil != null; }

    /** Y de la chaussee a l'echantillon i (profil calcule a la premiere demande, une seule fois). */
    public int y(int i, ChunkGenerator gen, LevelHeightAccessor h, RandomState rs, int mer, Level niveau) {
        int[] p = profil;
        if (p == null) p = calculerProfil(gen, h, rs, mer, niveau);
        return p[i];
    }

    public int y(int i) { return profil[i]; }

    /**
     * 0.5.6 : la route ne barre jamais une riviere dessinee. Chaque traversee (echantillons a d <= 10 de la ligne de
     * riviere) devient un tablier, etendu de 8 blocs d'abscisse de chaque cote ; les traversees qui se touchent sont
     * fusionnees. Une traversee qui chevauche un pont configure etend ce pont (son Y) ; sinon pont automatique dont
     * le Y est calcule avec le profil (max(mer + 6, sol naturel le plus haut du tablier + 2)).
     */
    void pontsAuto(CarteIle c) {
        if (c.pixelsRiviere == 0) return;
        int m = ax.length;
        List<double[]> iv = new ArrayList<>();
        int i = 0;
        while (i < m) {
            if (c.distanceRiviere((int) Math.floor(ax[i]), (int) Math.floor(az[i])) > PONT_RIVIERE_D + demiLargeur + 0.5) { i++; continue; }
            int a = i;
            while (i < m && c.distanceRiviere((int) Math.floor(ax[i]), (int) Math.floor(az[i])) <= PONT_RIVIERE_D + demiLargeur + 0.5) i++;
            double s0 = abs[a] - PONT_MARGE, s1 = abs[i - 1] + PONT_MARGE;
            if (!iv.isEmpty() && s0 <= iv.get(iv.size() - 1)[1]) iv.get(iv.size() - 1)[1] = s1;
            else iv.add(new double[]{s0, s1});
        }
        int etendus = 0, nouveaux = 0;
        StringBuilder sb = new StringBuilder();
        for (double[] v : iv) {
            int n0 = Integer.MAX_VALUE, n1 = -1;
            for (int j = 0; j < m; j++) if (abs[j] >= v[0] && abs[j] <= v[1]) { n0 = Math.min(n0, j); n1 = Math.max(n1, j); }
            if (n1 < 0) continue;
            Object[] hote = null;
            for (Object[] pt : ponts) if ((Integer) pt[4] <= n1 + 1 && (Integer) pt[5] >= n0 - 1) { hote = pt; break; }
            if (hote != null) {
                int y = (Integer) hote[3];
                int a0 = (Integer) hote[4], a1 = (Integer) hote[5];
                for (int j = n0; j <= n1; j++) { tablier[j] = true; yTablier[j] = y; }
                hote[4] = Math.min(a0, n0); hote[5] = Math.max(a1, n1);
                etendus++;
                sb.append(String.format(" [%s etendu : %d..%d -> %d..%d]", hote[0], (int) abs[a0], (int) abs[a1], (int) abs[(Integer) hote[4]], (int) abs[(Integer) hote[5]]));
            } else {
                int cc = (n0 + n1) / 2;
                String pn = String.format("riviere %d,%d", (int) ax[cc], (int) az[cc]);
                for (int j = n0; j <= n1; j++) { tablier[j] = true; yTablier[j] = Integer.MIN_VALUE; }
                pontsAutoIdx.add(ponts.size());
                ponts.add(new Object[]{pn, cc, (abs[n1] - abs[n0]) / 2, Integer.MIN_VALUE, n0, n1});
                nouveaux++;
                sb.append(String.format(" [%s : abscisse %d..%d, %d blocs]", pn, (int) abs[n0], (int) abs[n1], (int) (abs[n1] - abs[n0])));
            }
        }
        bilanPontsAuto = String.format("%d traversees de rivieres dessinees : %d ponts configures etendus, %d ponts automatiques%s", iv.size(), etendus, nouveaux, sb);
        CarteIle.LOG.info("[atheria_ile] route '{}' : {}", nom, bilanPontsAuto);
    }

    /** niveau : le vrai monde (ServerLevel), pour lire les villes Lost Cities ; null = sans rues */
    private synchronized int[] calculerProfil(ChunkGenerator gen, LevelHeightAccessor h, RandomState rs, int mer, Level niveau) {
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
        // 0.5.6 : Y des ponts automatiques : max(mer + 6, sol naturel le plus haut sous le tablier et un releve autour + 2)
        for (int idx : pontsAutoIdx) {
            Object[] pt = ponts.get(idx);
            int n0 = (Integer) pt[4], n1 = (Integer) pt[5], y = mer + 6;
            for (int k = Math.max(0, n0 / pas - 1); k <= Math.min(nc - 1, n1 / pas + 1); k++) y = Math.max(y, (int) Math.round(brut[k]) + 2);
            pt[3] = y;
            for (int j = n0; j <= n1; j++) yTablier[j] = y;
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
        // 0.5.4 : releves imposes. 1) rues Lost Cities : un releve dans un chunk de ville, ou voisin d'un tel releve,
        // prend le Y du bloc de rue (groundLevel + 6 x niveau de ville), pour que la chaussee raccorde les rues ;
        // 2) tabliers des ponts sureleves (prioritaires sur les rues), etendus d'un releve de chaque cote.
        boolean[] fixe = new boolean[nc];
        double[] vfixe = new double[nc];
        int rues = 0, ruesConflit = 0, ruesMin = Integer.MAX_VALUE, ruesMax = Integer.MIN_VALUE, ruesIgnorees = 0;
        StringBuilder listeIgnorees = new StringBuilder();
        LienLostCities lc = LienLostCities.pour(niveau);
        if (lc != null) {
            int[] rue = new int[nc];
            // les chunks de l'axe (17 blocs) sont exclus des villes par atheria_monde (ExclusionsIle) : on cherche la
            // ville la plus proche en travers de la route (0, +-16, +-32, +-48 blocs), dont les rues touchent la chaussee
            for (int k = 0; k < nc; k++) {
                int i = Math.min(m - 1, k * pas);
                int ia = Math.max(0, i - 1), ib = Math.min(m - 1, i + 1);
                double dx = ax[ib] - ax[ia], dz = az[ib] - az[ia], l = Math.max(1e-6, Math.hypot(dx, dz));
                double nx = -dz / l, nz = dx / l;
                rue[k] = Integer.MIN_VALUE;
                for (int t : new int[]{0, 16, -16, 32, -32, 48, -48}) {
                    int v = lc.rue(Math.floorDiv((int) Math.floor(ax[i] + nx * t), 16), Math.floorDiv((int) Math.floor(az[i] + nz * t), 16));
                    if (v != Integer.MIN_VALUE) { rue[k] = v; break; }
                }
            }
            // 0.5.6 : villes Lost Cities vues le long de l'axe (troncons de releves consecutifs avec une rue), pour verifier
            // que zones_villes ne laisse des villes qu'aux bons endroits
            StringBuilder villes = new StringBuilder();
            int nv = 0;
            for (int k = 0; k < nc; k++) {
                if (rue[k] == Integer.MIN_VALUE) continue;
                int k0v = k, ymin = rue[k], ymax = rue[k];
                while (k + 1 < nc && rue[k + 1] != Integer.MIN_VALUE) { k++; ymin = Math.min(ymin, rue[k]); ymax = Math.max(ymax, rue[k]); }
                int ia = Math.min(m - 1, k0v * pas), ib = Math.min(m - 1, k * pas);
                nv++;
                villes.append(String.format(" [%d,%d -> %d,%d : %d releves, rue Y %d..%d]", (int) ax[ia], (int) az[ia], (int) ax[ib], (int) az[ib], k - k0v + 1, ymin, ymax));
            }
            CarteIle.LOG.info("[atheria_ile] route '{}' : {} troncons longent une ville Lost Cities :{}", nom, nv, villes);
            for (int k = 0; k < nc; k++) {
                int v = rue[k];
                if (v == Integer.MIN_VALUE && k > 0) v = rue[k - 1];
                if (v == Integer.MIN_VALUE && k + 1 < nc) v = rue[k + 1];
                if (v == Integer.MIN_VALUE) continue;
                // regle : la route ne suit une rue que si elle est a +-6 blocs du profil naturel (niveau de ville 0, au
                // plus 1) ; sinon profil naturel garde, le bord de la ville reste a sa hauteur (mur ou deblai en jeu)
                if (Math.abs(v - lis[k]) > ECART_RUE_MAX) {
                    ruesIgnorees++;
                    int ii = Math.min(m - 1, k * pas);
                    if (ruesIgnorees <= 40) listeIgnorees.append(String.format(" %d,%d:rue%d/route%d", (int) ax[ii], (int) az[ii], v, Math.round(lis[k])));
                    continue;
                }
                fixe[k] = true; vfixe[k] = v; rues++;
                ruesMin = Math.min(ruesMin, v); ruesMax = Math.max(ruesMax, v);
            }
        }
        for (int k = 0; k < nc; k++) {
            int yt = Integer.MIN_VALUE;
            for (int j = Math.max(0, (k - 1) * pas); j <= Math.min(m - 1, (k + 1) * pas); j++) if (tablier[j]) { yt = yTablier[j]; break; }
            if (yt == Integer.MIN_VALUE) continue;
            if (fixe[k] && vfixe[k] != yt) ruesConflit++;
            fixe[k] = true; vfixe[k] = yt;
        }
        for (int k = 0; k < nc; k++) if (fixe[k]) lis[k] = vfixe[k];
        // pente max dans les deux sens (deblai et remblai) ; les releves imposes ne bougent pas, les autres
        // s'y raccordent (rampes) ; passes repetees jusqu'a stabilite
        double dmax = penteMax * pas * PAS;
        // 0.5.6 : pente bornee sur l'abscisse reelle entre releves (dans les virages serres, 8 echantillons < 16 blocs)
        double[] dk = new double[nc];
        for (int k = 1; k < nc; k++) dk[k] = penteMax * Math.max(0.5, abs[Math.min(m - 1, k * pas)] - abs[Math.min(m - 1, (k - 1) * pas)]);
        for (int passe = 0; passe < 200; passe++) {
            boolean change = false;
            for (int k = 1; k < nc; k++) {
                if (fixe[k]) continue;
                double v = Math.max(lis[k - 1] - dk[k], Math.min(lis[k - 1] + dk[k], lis[k]));
                if (v != lis[k]) { lis[k] = v; change = true; }
            }
            for (int k = nc - 2; k >= 0; k--) {
                if (fixe[k]) continue;
                double v = Math.max(lis[k + 1] - dk[k + 1], Math.min(lis[k + 1] + dk[k + 1], lis[k]));
                if (v != lis[k]) { lis[k] = v; change = true; }
            }
            if (!change) break;
        }
        int ruptures = 0;
        for (int k = 1; k < nc; k++) if (Math.abs(lis[k] - lis[k - 1]) > dk[k] + 1e-6) ruptures++;
        int[] p = new int[m];
        for (int i = 0; i < m; i++) {
            // 0.5.6 : interpolation sur l'abscisse reelle entre les deux releves
            int k = Math.min(nc - 1, i / pas);
            int ia = Math.min(m - 1, k * pas), ib = Math.min(m - 1, (k + 1) * pas);
            double t = ib > ia ? (abs[i] - abs[ia]) / Math.max(1e-6, abs[ib] - abs[ia]) : 0;
            double v = k + 1 < nc ? lis[k] * (1 - t) + lis[k + 1] * t : lis[k];
            p[i] = tablier[i] ? yTablier[i] : (int) Math.round(v);
        }
        profil = p;
        int mn = Integer.MAX_VALUE, mx = Integer.MIN_VALUE;
        for (int v : p) { mn = Math.min(mn, v); mx = Math.max(mx, v); }
        CarteIle.LOG.info("[atheria_ile] route '{}' : profil en long calcule ({} releves, Y {}..{}, {} ms)", nom, nc, mn, mx, System.currentTimeMillis() - debut);
        if (lc == null) CarteIle.LOG.info("[atheria_ile] route '{}' : pas de Lost Cities sur ce monde, aucun releve cale sur des rues", nom);
        else CarteIle.LOG.info("[atheria_ile] route '{}' : {} releves (16 blocs) cales sur des rues Lost Cities{}, {} en conflit avec un pont (pont garde) ; lien {} , {} erreurs",
                nom, rues, rues > 0 ? " (Y " + ruesMin + ".." + ruesMax + ")" : "", ruesConflit, lc.quoi(), lc.erreurs);
        if (ruesIgnorees > 0) CarteIle.LOG.info("[atheria_ile] route '{}' : {} releves pres d'une ville NON cales (rue a plus de {} blocs du profil naturel) :{}",
                nom, ruesIgnorees, ECART_RUE_MAX, listeIgnorees);
        if (ruptures > 0) CarteIle.LOG.warn("[atheria_ile] route '{}' : {} ruptures de pente entre releves imposes incompatibles (plus de {} blocs sur 16)", nom, ruptures, String.format("%.1f", dmax));
        for (Object[] pt : ponts) {
            int n0 = (Integer) pt[4], n1 = (Integer) pt[5];
            CarteIle.LOG.info("[atheria_ile] route '{}' : pont '{}' tablier Y {} de {},{} a {},{} ({} blocs)", nom, pt[0], pt[3],
                    (int) ax[n0], (int) az[n0], (int) ax[n1], (int) az[n1], (int) (abs[n1] - abs[n0]));
        }
        return p;
    }
}
