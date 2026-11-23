package fr.atheria.ile;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

import java.util.ArrayList;
import java.util.List;

/**
 * Volumes souterrains reserves ("volumes_souterrains" dans regions.json) : boites [x1,x2) x [z1,z2) et couloirs
 * (polyligne + largeur), entre y_min et y_max inclus ("surface" = jusqu'en haut). Le mod n'y creuse rien :
 * pas de grottes de bruit, de carvers, d'aquifere, de lave, de filons, de minerais, de features ni de morceaux de
 * structures, dans le volume et sur marge_blocs autour. Le build y creuse ensuite tunnels et stations.
 * Toutes les requetes sont sans allocation (grille par chunk).
 */
public final class Volumes {
    /** marge reservee (blocs) ; pour la densite on ajoute une cellule de bruit (4 blocs en x/z, 8 en y) */
    public final int marge, margeDensiteH, margeDensiteV;
    /** la marge du dessous vaut marge + 4 (12 blocs pour une marge de 8) */
    static final int MARGE_BAS_EN_PLUS = 4;
    public final String[] noms;
    /** par element (une boite, ou un segment de couloir) : forme 0 boite / 1 segment, coordonnees, demi-largeur, Y, nom */
    private final byte[] forme;
    private final double[] ax, az, bx, bz, demi;
    private final int[] ymin, ymax, nom;
    private final int gx0, gz0, gn, gm;
    private final int[][] grille;
    /** description pour exclusions.json */
    final List<JsonObject> sources = new ArrayList<>();
    /** motifs "namespace:*" ou identifiants exacts autorises a poser dans les volumes pendant la generation */
    public static final String[] POSE_AUTORISEE_DEFAUT = {"atheria_monde:*", "atheria:*"};
    String[] poseAutorisee = POSE_AUTORISEE_DEFAUT;

    public String[] poseAutorisee() { return poseAutorisee.clone(); }

    boolean autoriseNamespace(String ns) {
        for (String m : poseAutorisee) if (m.endsWith(":*") && m.regionMatches(0, ns, 0, ns.length()) && m.length() == ns.length() + 2) return true;
        return false;
    }

    boolean autorise(String ns, String chemin) {
        for (String m : poseAutorisee) {
            int i = m.indexOf(':');
            if (i != ns.length() || !m.startsWith(ns)) continue;
            if (m.endsWith(":*") && m.length() == ns.length() + 2) return true;
            if (m.length() == ns.length() + 1 + chemin.length() && m.endsWith(chemin)) return true;
        }
        return false;
    }

    private Volumes(int marge, List<String> noms, List<double[]> el, List<int[]> ys, List<Byte> formes) {
        this.marge = marge;
        this.margeDensiteH = marge + 4;
        this.margeDensiteV = marge + 8;
        this.noms = noms.toArray(new String[0]);
        int n = el.size();
        forme = new byte[n]; ax = new double[n]; az = new double[n]; bx = new double[n]; bz = new double[n]; demi = new double[n];
        ymin = new int[n]; ymax = new int[n]; nom = new int[n];
        double minX = Double.MAX_VALUE, minZ = Double.MAX_VALUE, maxX = -Double.MAX_VALUE, maxZ = -Double.MAX_VALUE;
        for (int i = 0; i < n; i++) {
            double[] e = el.get(i);
            forme[i] = formes.get(i); ax[i] = e[0]; az[i] = e[1]; bx[i] = e[2]; bz[i] = e[3]; demi[i] = e[4];
            ymin[i] = ys.get(i)[0]; ymax[i] = ys.get(i)[1]; nom[i] = ys.get(i)[2];
            double r = demi[i] + margeDensiteH + 1;
            minX = Math.min(minX, Math.min(ax[i], bx[i]) - r); maxX = Math.max(maxX, Math.max(ax[i], bx[i]) + r);
            minZ = Math.min(minZ, Math.min(az[i], bz[i]) - r); maxZ = Math.max(maxZ, Math.max(az[i], bz[i]) + r);
        }
        if (n == 0) { gx0 = gz0 = 0; gn = gm = 0; grille = new int[0][]; return; }
        gx0 = (int) Math.floor(minX / 16); gz0 = (int) Math.floor(minZ / 16);
        gn = (int) Math.floor(maxX / 16) - gx0 + 1; gm = (int) Math.floor(maxZ / 16) - gz0 + 1;
        List<List<Integer>> tmp = new ArrayList<>(gn * gm);
        for (int i = 0; i < gn * gm; i++) tmp.add(null);
        for (int i = 0; i < n; i++) {
            double r = demi[i] + margeDensiteH + 1;
            int cx0 = (int) Math.floor((Math.min(ax[i], bx[i]) - r) / 16) - gx0, cx1 = (int) Math.floor((Math.max(ax[i], bx[i]) + r) / 16) - gx0;
            int cz0 = (int) Math.floor((Math.min(az[i], bz[i]) - r) / 16) - gz0, cz1 = (int) Math.floor((Math.max(az[i], bz[i]) + r) / 16) - gz0;
            for (int cz = cz0; cz <= cz1; cz++) for (int cx = cx0; cx <= cx1; cx++) {
                // garder seulement les chunks vraiment touches (distance carre du chunk / element <= marge densite)
                if (distanceChunk(i, cx + gx0, cz + gz0) > margeDensiteH) continue;
                int k = cz * gn + cx;
                if (tmp.get(k) == null) tmp.set(k, new ArrayList<>());
                tmp.get(k).add(i);
            }
        }
        grille = new int[gn * gm][];
        for (int k = 0; k < gn * gm; k++) if (tmp.get(k) != null) grille[k] = tmp.get(k).stream().mapToInt(Integer::intValue).toArray();
    }

    public boolean vide() { return grille.length == 0; }

    /** distance horizontale du centre du bloc (px, pz) a l'element (0 dedans) */
    private double distance(int i, double px, double pz) {
        if (forme[i] == 0) {
            double dx = Math.max(Math.max(ax[i] - px, 0), px - bx[i]), dz = Math.max(Math.max(az[i] - pz, 0), pz - bz[i]);
            return Math.sqrt(dx * dx + dz * dz);
        }
        double dx = bx[i] - ax[i], dz = bz[i] - az[i], l2 = dx * dx + dz * dz;
        double t = l2 == 0 ? 0 : Math.max(0, Math.min(1, ((px - ax[i]) * dx + (pz - az[i]) * dz) / l2));
        double ex = ax[i] + t * dx - px, ez = az[i] + t * dz - pz;
        return Math.max(0, Math.sqrt(ex * ex + ez * ez) - demi[i]);
    }

    /** distance minimale entre les centres de blocs du chunk et l'element */
    private double distanceChunk(int i, int cx, int cz) {
        double best = Double.MAX_VALUE;
        // les 4 bords du carre suffisent pour une boite ou un segment hors du carre ; centre pour le cas "dedans"
        for (int k = 0; k <= 15; k += 15) for (int j = 0; j <= 15; j++) {
            best = Math.min(best, distance(i, cx * 16 + j + 0.5, cz * 16 + k + 0.5));
            best = Math.min(best, distance(i, cx * 16 + k + 0.5, cz * 16 + j + 0.5));
        }
        // element entierement dans le chunk
        double mx = forme[i] == 0 ? (ax[i] + bx[i]) / 2 : ax[i], mz = forme[i] == 0 ? (az[i] + bz[i]) / 2 : az[i];
        if (mx >= cx * 16 && mx < cx * 16 + 16 && mz >= cz * 16 && mz < cz * 16 + 16) best = 0;
        return best;
    }

    /** index de l'element (volume + marge mh horizontale / mv verticale) qui contient le bloc, -1 sinon */
    private int trouver(int x, int y, int z, int mh, int mv) {
        int cx = (x >> 4) - gx0, cz = (z >> 4) - gz0;
        if (cx < 0 || cz < 0 || cx >= gn || cz >= gm) return -1;
        int[] l = grille[cz * gn + cx];
        if (l == null) return -1;
        double px = x + 0.5, pz = z + 0.5;
        for (int i : l) {
            // 0.7.0 : face du dessous elargie de MARGE_BAS_EN_PLUS (grottes qui affleuraient par le bas) ; volume seul inchange
            if (y < ymin[i] - mv - (mv > 0 ? MARGE_BAS_EN_PLUS : 0) || y > ymax[i] + mv) continue;
            if (distance(i, px, pz) <= mh) return i;
        }
        return -1;
    }

    /** dans un volume ou sa marge (carvers, minerais, features, structures) */
    public boolean reserve(int x, int y, int z) { return trouver(x, y, z, marge, marge) >= 0; }

    /** dans un volume, sa marge et une cellule de bruit de plus (fonctions de densite) */
    public boolean densite(int x, int y, int z) { return trouver(x, y, z, margeDensiteH, margeDensiteV) >= 0; }

    /** nom du volume qui contient le bloc (sans marge), null sinon */
    public String nomA(int x, int y, int z) { int i = trouver(x, y, z, 0, 0); return i < 0 ? null : noms[nom[i]]; }

    /** vrai si le chunk touche un volume ou sa marge, a n'importe quel Y */
    public boolean chunkTouche(int cx, int cz) {
        int gx = cx - gx0, gz = cz - gz0;
        if (gx < 0 || gz < 0 || gx >= gn || gz >= gm) return false;
        int[] l = grille[gz * gn + gx];
        if (l == null) return false;
        for (int i : l) if (distanceChunk(i, cx, cz) <= marge) return true;
        return false;
    }

    /**
     * 0.7.1 : nom du volume dont la reserve (marge comprise, dessous a marge + 4) coupe la boite 3D (bornes incluses),
     * null sinon. Approximation par la boite englobante de chaque element (un segment de couloir = sa boite).
     */
    public String boiteTouche(int x0, int y0, int z0, int x1, int y1, int z1) {
        for (int i = 0; i < forme.length; i++) {
            if (y1 < ymin[i] - marge - MARGE_BAS_EN_PLUS || y0 > ymax[i] + marge) continue;
            if (distanceRect(i, x0, z0, x1 + 1, z1 + 1) > marge) continue;
            return noms[nom[i]];
        }
        return null;
    }

    /** distance horizontale reelle de l'emprise de l'element i au rectangle [x0,x1] x [z0,z1] (0 s'ils se touchent) */
    private double distanceRect(int i, double x0, double z0, double x1, double z1) {
        if (forme[i] == 0) {
            double dx = Math.max(0, Math.max(ax[i] - x1, x0 - bx[i])), dz = Math.max(0, Math.max(az[i] - z1, z0 - bz[i]));
            return Math.hypot(dx, dz);
        }
        return Math.max(0, StructuresRoute.segmentRectangle(ax[i], az[i], bx[i], bz[i], x0, z0, x1, z1) - demi[i]);
    }

    /** 0.7.1 : structures refusees sur tout chunk qui touche un volume, quelle que soit leur boite (grottes a boite factice) */
    public static final String[] REFUS_PAR_CHUNK_DEFAUT = {"subsurface:*"};
    String[] refusParChunk = REFUS_PAR_CHUNK_DEFAUT;

    public boolean refuseParChunk(String ns, String chemin) {
        for (String m : refusParChunk) {
            int i = m.indexOf(':');
            if (i != ns.length() || !m.startsWith(ns)) continue;
            if (m.endsWith(":*") && m.length() == ns.length() + 2) return true;
            if (m.length() == ns.length() + 1 + chemin.length() && m.endsWith(chemin)) return true;
        }
        return false;
    }

    int elements() { return forme.length; }
    int yMin(int i) { return ymin[i]; }
    int yMax(int i) { return ymax[i]; }
    int nomElement(int i) { return nom[i]; }
    /** echantillons de l'emprise (sans marge) de l'element i, tous les pas blocs : x, z dans out (renvoie le nombre) */
    boolean dansEmprise(int i, int x, int z) { return distance(i, x + 0.5, z + 0.5) <= 0; }
    double[] boite(int i) {
        double r = demi[i];
        return new double[]{Math.min(ax[i], bx[i]) - r, Math.min(az[i], bz[i]) - r, Math.max(ax[i], bx[i]) + r, Math.max(az[i], bz[i]) + r};
    }

    static Volumes lire(JsonObject config) {
        List<String> noms = new ArrayList<>();
        List<double[]> el = new ArrayList<>();
        List<int[]> ys = new ArrayList<>();
        List<Byte> formes = new ArrayList<>();
        int marge = 8;
        List<JsonObject> src = new ArrayList<>();
        String[] pose = POSE_AUTORISEE_DEFAUT;
        String[] refus = REFUS_PAR_CHUNK_DEFAUT;
        if (config.has("volumes_souterrains") && config.get("volumes_souterrains").isJsonObject()) {
            JsonObject v = config.getAsJsonObject("volumes_souterrains");
            if (v.has("marge_blocs")) marge = Math.max(0, v.get("marge_blocs").getAsInt());
            if (v.has("refus_par_chunk") && v.get("refus_par_chunk").isJsonArray()) {
                List<String> l = new ArrayList<>();
                for (JsonElement e : v.getAsJsonArray("refus_par_chunk")) { String s = e.getAsString().trim(); if (s.indexOf(':') > 0) l.add(s); }
                refus = l.toArray(new String[0]);
            }
            if (v.has("pose_autorisee") && v.get("pose_autorisee").isJsonArray()) {
                List<String> l = new ArrayList<>();
                for (JsonElement e : v.getAsJsonArray("pose_autorisee")) { String s = e.getAsString().trim(); if (s.indexOf(':') > 0) l.add(s); }
                pose = l.toArray(new String[0]);
            }
            if (v.has("elements")) for (JsonElement e : v.getAsJsonArray("elements")) {
                JsonObject o = e.getAsJsonObject();
                src.add(o);
                String n = o.has("nom") ? o.get("nom").getAsString() : "volume " + (noms.size() + 1);
                int in = noms.size();
                noms.add(n);
                int y0 = o.get("y_min").getAsInt();
                int y1 = o.get("y_max").isJsonPrimitive() && o.get("y_max").getAsJsonPrimitive().isString() ? 512 : o.get("y_max").getAsInt();
                String f = o.has("forme") ? o.get("forme").getAsString() : "boite";
                if (f.equals("couloir")) {
                    JsonArray p = o.getAsJsonArray("points");
                    double d = (o.has("largeur_blocs") ? o.get("largeur_blocs").getAsDouble() : 9) / 2.0;
                    for (int i = 0; i + 1 < p.size(); i++) {
                        JsonArray a = p.get(i).getAsJsonArray(), b = p.get(i + 1).getAsJsonArray();
                        el.add(new double[]{a.get(0).getAsDouble(), a.get(1).getAsDouble(), b.get(0).getAsDouble(), b.get(1).getAsDouble(), d});
                        ys.add(new int[]{y0, y1, in}); formes.add((byte) 1);
                    }
                } else {
                    double x1 = o.get("x1").getAsDouble(), z1 = o.get("z1").getAsDouble(), x2 = o.get("x2").getAsDouble(), z2 = o.get("z2").getAsDouble();
                    el.add(new double[]{Math.min(x1, x2), Math.min(z1, z2), Math.max(x1, x2), Math.max(z1, z2), 0});
                    ys.add(new int[]{y0, y1, in}); formes.add((byte) 0);
                }
                CarteIle.LOG.info("[atheria_ile] volume souterrain '{}' : {} , Y {} a {}", n, f, y0, y1 >= 512 ? "surface" : y1);
            }
        }
        Volumes vol = new Volumes(marge, noms, el, ys, formes);
        vol.sources.addAll(src);
        vol.poseAutorisee = pose;
        vol.refusParChunk = refus;
        if (!el.isEmpty()) CarteIle.LOG.info("[atheria_ile] pose autorisee dans les volumes pendant la generation : {}", String.join(", ", pose));
        return vol;
    }
}
