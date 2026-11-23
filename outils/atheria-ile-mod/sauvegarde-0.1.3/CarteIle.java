package fr.atheria.ile;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import net.neoforged.fml.loading.FMLPaths;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Carte de l'île : lit config/atheria_ile/carte.png + regions.json.
 * Fournit (1) la valeur de "continents" qui dessine côtes, lagon et relief,
 * (2) la région (et donc les biomes autorisés) en tout point.
 */
public final class CarteIle {
    public static final Logger LOG = LoggerFactory.getLogger("atheria_ile");

    private static volatile CarteIle active;
    private static volatile boolean tentee;

    /** La carte, seulement si le monde courant utilise la fonction de densité de l'île. */
    public static CarteIle active() { return active; }

    /** Appelée quand le datapack du monde déclare la fonction de densité : charge la carte une fois. */
    public static synchronized CarteIle activer() {
        if (active != null) return active;
        if (tentee) return null;
        tentee = true;
        Path dossier = FMLPaths.CONFIGDIR.get().resolve("atheria_ile");
        try {
            active = new CarteIle(dossier);
            LOG.info("[atheria_ile] carte chargee : {}x{} px, {} blocs/px, {} regions", active.w, active.h, active.bpp, active.regions.size());
        } catch (Exception e) {
            LOG.error("[atheria_ile] carte illisible dans {} : le monde sera genere sans l'ile", dossier, e);
        }
        return active;
    }

    /** Remet à zéro entre deux mondes (solo) pour qu'un autre monde ne soit jamais modifié. */
    public static synchronized void desactiver() {
        active = null;
        tentee = false;
    }

    public static final int OCEAN = 0, LAGON = 1, RECIF = 2;

    public static final class Region {
        public final String nom;
        public final List<String> biomes = new ArrayList<>();
        public final List<Integer> poids = new ArrayList<>();
        public final String montagne;
        public final double relief;
        public final int cellule;
        public final int couleur;
        Region(String nom, String montagne, double relief, int cellule, int couleur) {
            this.nom = nom; this.montagne = montagne; this.relief = relief; this.cellule = Math.max(32, cellule); this.couleur = couleur;
        }
    }

    public final Path dossier;
    public final JsonObject config;
    public final int w, h, bpp;
    public final double origineX, origineZ;
    public final long graine;
    public final double deformation;
    public final List<Region> regions = new ArrayList<>();
    /** classe par pixel : 0 océan, 1 lagon, 2 récif, 3+k région k */
    final byte[] classe;
    /** distance signée à la côte en pixels (positive sur terre) */
    final float[] distance;
    /** région de la terre la plus proche, pour chaque pixel */
    final byte[] regionProche;
    /** relief des régions, lissé */
    final float[] relief;

    private CarteIle(Path dossier) throws Exception {
        this.dossier = dossier;
        try (Reader r = Files.newBufferedReader(dossier.resolve("regions.json"), StandardCharsets.UTF_8)) {
            config = JsonParser.parseReader(r).getAsJsonObject();
        }
        BufferedImage img = ImageIO.read(dossier.resolve("carte.png").toFile());
        if (img == null) throw new IllegalStateException("carte.png n'est pas une image");
        w = img.getWidth();
        h = img.getHeight();
        bpp = config.get("blocs_par_pixel").getAsInt();
        if (bpp < 1) throw new IllegalStateException("blocs_par_pixel doit etre >= 1");
        origineX = -w * bpp / 2.0;
        origineZ = -h * bpp / 2.0;
        graine = config.has("graine") ? config.get("graine").getAsLong() : 1L;
        deformation = config.has("deformation_bords_blocs") ? config.get("deformation_bords_blocs").getAsDouble() : 24.0;

        // classes déclarées
        Map<Integer, Integer> parCouleur = new HashMap<>();
        List<int[]> palette = new ArrayList<>(); // {rgb, classe}
        JsonObject classes = config.getAsJsonObject("classes");
        for (Map.Entry<String, JsonElement> e : classes.entrySet()) {
            int rgb = Integer.parseInt(e.getKey().substring(1), 16) & 0xFFFFFF;
            JsonObject c = e.getValue().getAsJsonObject();
            String type = c.get("type").getAsString();
            int cl;
            switch (type) {
                case "ocean" -> cl = OCEAN;
                case "lagon" -> cl = LAGON;
                case "recif" -> cl = RECIF;
                case "region" -> {
                    String montagne = c.has("montagne") && !c.get("montagne").isJsonNull() ? c.get("montagne").getAsString() : null;
                    Region reg = new Region(c.get("nom").getAsString(), montagne,
                            c.has("relief") ? c.get("relief").getAsDouble() : 0.0,
                            c.has("cellule") ? c.get("cellule").getAsInt() : 224, rgb);
                    JsonArray bs = c.getAsJsonArray("biomes");
                    for (JsonElement b : bs) {
                        JsonObject o = b.getAsJsonObject();
                        int p = o.has("poids") ? o.get("poids").getAsInt() : 1;
                        if (p <= 0) continue;
                        reg.biomes.add(o.get("biome").getAsString());
                        reg.poids.add(p);
                    }
                    if (reg.biomes.isEmpty()) throw new IllegalStateException("region sans biome : " + reg.nom);
                    if (regions.size() >= 120) throw new IllegalStateException("trop de regions (max 120)");
                    regions.add(reg);
                    cl = 2 + regions.size();
                }
                default -> throw new IllegalStateException("type de classe inconnu : " + type);
            }
            parCouleur.put(rgb, cl);
            palette.add(new int[]{rgb, cl});
        }
        if (regions.isEmpty()) throw new IllegalStateException("aucune region declaree");

        // pixels -> classes (couleur exacte, sinon la plus proche)
        int n = w * h;
        classe = new byte[n];
        int approx = 0;
        for (int z = 0; z < h; z++) {
            for (int x = 0; x < w; x++) {
                int rgb = img.getRGB(x, z) & 0xFFFFFF;
                Integer cl = parCouleur.get(rgb);
                if (cl == null) {
                    approx++;
                    int best = OCEAN, bd = Integer.MAX_VALUE;
                    for (int[] p : palette) {
                        int dr = ((rgb >> 16) & 255) - ((p[0] >> 16) & 255);
                        int dg = ((rgb >> 8) & 255) - ((p[0] >> 8) & 255);
                        int db = (rgb & 255) - (p[0] & 255);
                        int d = dr * dr + dg * dg + db * db;
                        if (d < bd) { bd = d; best = p[1]; }
                    }
                    cl = best;
                    parCouleur.put(rgb, cl);
                }
                classe[z * w + x] = (byte) (int) cl;
            }
        }
        if (approx > 0) LOG.warn("[atheria_ile] {} pixels avec une couleur non declaree, rattaches a la classe la plus proche", approx);

        // distance signée (chanfrein 3-4, en pixels)
        float[] dTerre = chanfrein(true);   // distance à la terre, pour les pixels d'eau
        float[] dEau = chanfrein(false);    // distance à l'eau, pour les pixels de terre
        distance = new float[n];
        for (int i = 0; i < n; i++) {
            distance[i] = terre(i) ? dEau[i] - 0.5f : -(dTerre[i] - 0.5f);
        }

        // région de la terre la plus proche (parcours en largeur depuis toutes les terres)
        regionProche = new byte[n];
        boolean[] vu = new boolean[n];
        ArrayDeque<Integer> file = new ArrayDeque<>();
        for (int i = 0; i < n; i++) {
            if (terre(i)) { regionProche[i] = (byte) (classe[i] - 3); vu[i] = true; file.add(i); }
        }
        while (!file.isEmpty()) {
            int i = file.poll();
            int x = i % w, z = i / w;
            int[] voisins = {x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, z > 0 ? i - w : -1, z < h - 1 ? i + w : -1};
            for (int v : voisins) {
                if (v >= 0 && !vu[v]) { vu[v] = true; regionProche[v] = regionProche[i]; file.add(v); }
            }
        }

        // relief des régions lissé (flou boîte séparable, deux passes)
        int rayon = config.has("lissage_relief_pixels") ? Math.max(0, config.get("lissage_relief_pixels").getAsInt()) : 8;
        float[] base = new float[n];
        for (int i = 0; i < n; i++) base[i] = (float) regions.get(regionProche[i] & 0xFF).relief;
        relief = flou(flou(base, rayon), rayon);
    }

    private boolean terre(int i) { return classe[i] >= 3; }

    private float[] chanfrein(boolean versTerre) {
        int n = w * h;
        float inf = 1e9f;
        float[] d = new float[n];
        for (int i = 0; i < n; i++) d[i] = (terre(i) == versTerre) ? 0f : inf;
        final float a = 1f, b = 1.4142f;
        for (int z = 0; z < h; z++) for (int x = 0; x < w; x++) {
            int i = z * w + x; float v = d[i];
            if (x > 0) v = Math.min(v, d[i - 1] + a);
            if (z > 0) {
                v = Math.min(v, d[i - w] + a);
                if (x > 0) v = Math.min(v, d[i - w - 1] + b);
                if (x < w - 1) v = Math.min(v, d[i - w + 1] + b);
            }
            d[i] = v;
        }
        for (int z = h - 1; z >= 0; z--) for (int x = w - 1; x >= 0; x--) {
            int i = z * w + x; float v = d[i];
            if (x < w - 1) v = Math.min(v, d[i + 1] + a);
            if (z < h - 1) {
                v = Math.min(v, d[i + w] + a);
                if (x < w - 1) v = Math.min(v, d[i + w + 1] + b);
                if (x > 0) v = Math.min(v, d[i + w - 1] + b);
            }
            d[i] = v;
        }
        // aucune terre (ou aucune eau) : distance "infinie" bornée
        for (int i = 0; i < n; i++) if (d[i] >= inf) d[i] = w + h;
        return d;
    }

    private float[] flou(float[] src, int r) {
        if (r <= 0) return src;
        float[] tmp = new float[src.length], out = new float[src.length];
        for (int z = 0; z < h; z++) {
            for (int x = 0; x < w; x++) {
                float s = 0; int c = 0;
                for (int k = -r; k <= r; k++) { int xx = x + k; if (xx >= 0 && xx < w) { s += src[z * w + xx]; c++; } }
                tmp[z * w + x] = s / c;
            }
        }
        for (int z = 0; z < h; z++) {
            for (int x = 0; x < w; x++) {
                float s = 0; int c = 0;
                for (int k = -r; k <= r; k++) { int zz = z + k; if (zz >= 0 && zz < h) { s += tmp[zz * w + x]; c++; } }
                out[z * w + x] = s / c;
            }
        }
        return out;
    }

    // ------------------------------------------------------------------ échantillonnage

    private double bilineaire(float[] tab, double px, double pz) {
        double fx = px - 0.5, fz = pz - 0.5;
        int x0 = (int) Math.floor(fx), z0 = (int) Math.floor(fz);
        double tx = fx - x0, tz = fz - z0;
        double a = val(tab, x0, z0), b = val(tab, x0 + 1, z0), c = val(tab, x0, z0 + 1), d = val(tab, x0 + 1, z0 + 1);
        return (a * (1 - tx) + b * tx) * (1 - tz) + (c * (1 - tx) + d * tx) * tz;
    }

    private double val(float[] tab, int x, int z) {
        x = Math.max(0, Math.min(w - 1, x));
        z = Math.max(0, Math.min(h - 1, z));
        return tab[z * w + x];
    }

    /** Distance signée à la côte en blocs (positive sur terre). Hors image : de plus en plus loin en mer. */
    public double distanceBlocs(double bx, double bz) {
        double px = (bx - origineX) / bpp, pz = (bz - origineZ) / bpp;
        double d = bilineaire(distance, px, pz) * bpp;
        double dehorsX = Math.max(0, Math.max(-px, px - w)), dehorsZ = Math.max(0, Math.max(-pz, pz - h));
        double dehors = Math.hypot(dehorsX, dehorsZ) * bpp;
        return dehors > 0 ? Math.min(d, 0) - dehors : d;
    }

    public int classeA(double bx, double bz) {
        int px = (int) Math.floor((bx - origineX) / bpp), pz = (int) Math.floor((bz - origineZ) / bpp);
        if (px < 0 || pz < 0 || px >= w || pz >= h) return OCEAN;
        return classe[pz * w + px];
    }

    private static final double[] D_PTS = {-1200, -500, -150, -30, 0, 40, 150, 500, 1200, 2500};
    private static final double[] V_PTS = {-0.45, -0.38, -0.25, -0.19, -0.16, -0.12, -0.05, 0.05, 0.20, 0.40};

    private static double courbe(double d) {
        if (d <= D_PTS[0]) return V_PTS[0];
        for (int i = 1; i < D_PTS.length; i++) {
            if (d <= D_PTS[i]) {
                double t = (d - D_PTS[i - 1]) / (D_PTS[i] - D_PTS[i - 1]);
                return V_PTS[i - 1] + t * (V_PTS[i] - V_PTS[i - 1]);
            }
        }
        return V_PTS[V_PTS.length - 1];
    }

    private static double lisse(double a, double b, double x) {
        double t = Math.max(0, Math.min(1, (x - a) / (b - a)));
        return t * t * (3 - 2 * t);
    }

    /** Valeur de tectonic:noise/raw_continents dictée par la carte. o = valeur d'origine (détail). */
    public double continents(int bx, int bz, double o) {
        double d = distanceBlocs(bx, bz);
        double v = courbe(d);
        int cl = classeA(bx, bz);
        if (cl == LAGON) v = Math.max(v, -0.22);
        else if (cl == RECIF) v = Math.max(v, -0.185);
        double px = (bx - origineX) / bpp, pz = (bz - origineZ) / bpp;
        v += bilineaire(relief, px, pz) * lisse(-40, 250, d);
        // detail d'origine : plein a terre, attenue en mer (sinon des ilots sortent du lagon)
        v += (d > 0 ? 0.06 : 0.02) * Math.max(-1, Math.min(1, o));
        if (cl == LAGON) v = Math.min(v, -0.19);          // le lagon reste sous la mer (cote Tectonic -0.155)
        else if (cl == RECIF) v = Math.min(v, -0.17);
        else if (d > 0) v = Math.max(v, -0.10 + 0.08 * lisse(0, 300, d)); // pas de cuvette marine dans les terres
        return v;
    }

    // ------------------------------------------------------------------ régions et cellules de biomes

    private static long melange(long z) {
        z = (z ^ (z >>> 33)) * 0xff51afd7ed558ccdL;
        z = (z ^ (z >>> 33)) * 0xc4ceb9fe1a85ec53L;
        return z ^ (z >>> 33);
    }

    private double hash01(long a, long b, long c) {
        long v = melange(graine * 0x9E3779B97F4A7C15L + a * 0x632BE59BD9B4E019L + b * 0x85157AF5L + c);
        return (v >>> 11) * 0x1.0p-53;
    }

    private double bruit(double x, double z, long canal) {
        int x0 = (int) Math.floor(x), z0 = (int) Math.floor(z);
        double tx = x - x0, tz = z - z0;
        tx = tx * tx * (3 - 2 * tx);
        tz = tz * tz * (3 - 2 * tz);
        double a = hash01(x0, z0, canal), b = hash01(x0 + 1, z0, canal), c = hash01(x0, z0 + 1, canal), d = hash01(x0 + 1, z0 + 1, canal);
        return ((a * (1 - tx) + b * tx) * (1 - tz) + (c * (1 - tx) + d * tx) * tz) * 2 - 1;
    }

    /** Index de région (0..n-1) au bloc donné, bords déformés pour éviter les escaliers de pixels. */
    public int region(int bx, int bz) {
        double wx = bx + (bruit(bx / 96.0, bz / 96.0, 11) + 0.5 * bruit(bx / 37.0, bz / 37.0, 12)) * deformation;
        double wz = bz + (bruit(bx / 96.0, bz / 96.0, 21) + 0.5 * bruit(bx / 37.0, bz / 37.0, 22)) * deformation;
        int px = (int) Math.floor((wx - origineX) / bpp), pz = (int) Math.floor((wz - origineZ) / bpp);
        px = Math.max(0, Math.min(w - 1, px));
        pz = Math.max(0, Math.min(h - 1, pz));
        return regionProche[pz * w + px] & 0xFF;
    }

    /** Cellule de Voronoï (taille de la région) qui décide du sous-biome ; renvoie un nombre dans [0,1). */
    public double tirageCellule(int bx, int bz, int taille, int region) {
        double wx = bx + bruit(bx / 64.0, bz / 64.0, 31) * taille * 0.25;
        double wz = bz + bruit(bx / 64.0, bz / 64.0, 32) * taille * 0.25;
        int cx = (int) Math.floor(wx / taille), cz = (int) Math.floor(wz / taille);
        double best = Double.MAX_VALUE;
        long bxC = 0, bzC = 0;
        for (int dx = -1; dx <= 1; dx++) for (int dz = -1; dz <= 1; dz++) {
            long gx = cx + dx, gz = cz + dz;
            double ox = (gx + hash01(gx, gz, 41)) * taille, oz = (gz + hash01(gx, gz, 42)) * taille;
            double dd = (ox - wx) * (ox - wx) + (oz - wz) * (oz - wz);
            if (dd < best) { best = dd; bxC = gx; bzC = gz; }
        }
        return hash01(bxC, bzC, 50 + region);
    }
}
