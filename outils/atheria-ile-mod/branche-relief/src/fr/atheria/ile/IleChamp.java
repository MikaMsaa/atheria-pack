package fr.atheria.ile;

import com.mojang.serialization.Codec;
import com.mojang.serialization.MapCodec;
import com.mojang.serialization.codecs.RecordCodecBuilder;
import net.minecraft.util.KeyDispatchDataCodec;
import net.minecraft.world.level.levelgen.DensityFunction;

/**
 * Remplace un bruit de Tectonic par celui dicté par la carte :
 * - "erosion" (relief.png), "cretes" (rivières dessinées) : comme avant ;
 * - "plateau" (sur tectonic:base_terrain) : plateau de raccord 3D de plateaux.json (dans le rectangle) ;
 * - "relief" (sur tectonic:terrain_spline/offset/final, 0.9.0) : delta d'érosion précalculé + fondu adaptatif des plateaux.
 *   L'offset de Tectonic vaut 1/128 par bloc (depth = 1 - y/128 + offset) : +d/128 monte la surface de d blocs.
 * Comme IleContinents : ne s'active que via le datapack du monde ; sans carte active, renvoie le bruit d'origine.
 */
public final class IleChamp implements DensityFunction {

    public static final MapCodec<IleChamp> MAP_CODEC = RecordCodecBuilder.mapCodec(i -> i.group(
            DensityFunction.HOLDER_HELPER_CODEC.fieldOf("argument").forGetter(IleChamp::argument),
            Codec.STRING.fieldOf("champ").forGetter(IleChamp::champ)
    ).apply(i, IleChamp::depuisDatapack));

    public static final KeyDispatchDataCodec<IleChamp> CODEC = KeyDispatchDataCodec.of(MAP_CODEC);

    private static final int EROSION = 0, CRETES = 1, PLATEAU = 2, RELIEF = 3;

    private final DensityFunction argument;
    private final String champ;
    private final int code;

    private IleChamp(DensityFunction argument, String champ) {
        this.argument = argument;
        this.champ = champ;
        this.code = "cretes".equals(champ) ? CRETES : "erosion".equals(champ) ? EROSION : "plateau".equals(champ) ? PLATEAU : "relief".equals(champ) ? RELIEF : -1;
        if (code < 0) CarteIle.LOG.error("[atheria_ile] champ inconnu '{}' (erosion, cretes, plateau ou relief) : bruit d'origine garde", champ);
    }

    private static IleChamp depuisDatapack(DensityFunction argument, String champ) {
        CarteIle.activer();
        return new IleChamp(argument, champ);
    }

    public DensityFunction argument() { return argument; }

    public String champ() { return champ; }

    @Override
    public double compute(FunctionContext ctx) {
        if (code == RELIEF) return relief3d(CarteIle.active(), ctx.blockX(), ctx.blockY(), ctx.blockZ(), Double.NaN);
        if (code == PLATEAU) {
            int s = decalagePlateau(ctx.blockX(), ctx.blockZ());
            double o = argument.compute(s == 0 ? ctx : new SinglePointContext(ctx.blockX(), ctx.blockY() - s, ctx.blockZ()));
            return plateau3d(ctx.blockX(), ctx.blockY(), ctx.blockZ(), o);
        }
        double o = argument.compute(ctx);
        CarteIle c = CarteIle.active();
        if (c == null || code < 0) return o;
        return code == EROSION ? c.erosion(ctx.blockX(), ctx.blockZ(), o) : c.cretes(ctx.blockX(), ctx.blockZ(), o);
    }

    @Override
    public void fillArray(double[] tab, ContextProvider p) {
        if (code != PLATEAU && code != RELIEF) { p.fillAllDirectly(tab, this); return; }
        argument.fillArray(tab, p);
        if (code == PLATEAU && plateaux().length == 0) return;
        CarteIle c = CarteIle.active();
        for (int i = 0; i < tab.length; i++) {
            FunctionContext f = p.forIndex(i);
            if (code == PLATEAU) {
                int sp = decalagePlateau(f.blockX(), f.blockZ());
                if (sp != 0) tab[i] = argument.compute(new SinglePointContext(f.blockX(), f.blockY() - sp, f.blockZ()));
                tab[i] = plateau3d(f.blockX(), f.blockY(), f.blockZ(), tab[i]);
            }
            else tab[i] = relief3d(c, f.blockX(), f.blockY(), f.blockZ(), tab[i]);
        }
    }

    @Override
    public DensityFunction mapAll(Visitor visitor) {
        return visitor.apply(new IleChamp(argument.mapAll(visitor), champ));
    }

    // ---- relief v3 : offset + delta (blocs) / 128, memo 2D par thread (la fonction est appelee pour chaque Y d'une colonne)
    private static final ThreadLocal<double[]> MEMO = ThreadLocal.withInitial(() -> new double[]{Double.NaN, Double.NaN, 0, 0});

    /** 0.9.0 (branche base_terrain) : decalage vertical entier (blocs) de la colonne = delta d'erosion x force naturelle ; memo par thread */
    private static final ThreadLocal<int[]> MEMO_D = ThreadLocal.withInitial(() -> new int[]{Integer.MIN_VALUE, Integer.MIN_VALUE, 0});

    /** memo par colonne : decalage, poids de forme, hauteur cible */
    private static final ThreadLocal<double[]> MEMO_F = ThreadLocal.withInitial(() -> new double[]{Double.NaN, Double.NaN, 0, 0, 0});

    private double relief3d(CarteIle c, int x, int y, int z, double deja) {
        double r = relief3dBase(c, x, y, z, deja);
        if (c == null) return r;
        if (c.rnFalaise3d > 0) r = cote3d(c, x, y, z, r);
        if (c.rnRecifPlafond > 0) r = plafondMer(c, x, y, z, r);
        if (c.rnLagonVie > 0) r = lagonFond(c, x, y, z, r);
        if (!c.sculptures.isEmpty()) r = sculpture(c, x, y, z, r);
        if (!c.bassins.isEmpty()) r = bassin(c, x, y, z, r);
        return r;
    }

    // ---- 0.9.5 : fond du lagon vivant : 54..60 (3 a 8 blocs d'eau), patates de corail jusqu'a Y 59-60, hors passes, bassins et ilots
    private static final ThreadLocal<double[]> MEMO_L = ThreadLocal.withInitial(() -> new double[]{Double.NaN, Double.NaN, 0, 0});

    /** Y du fond vise (entier) ; NaN hors du lagon vivant. Partage avec Nature.lagon (memes bruits). */
    static double fondLagon(CarteIle c, int x, int z) {
        if (c.classeA(x, z) != CarteIle.LAGON) return Double.NaN;
        if (c.dansPasse(x, z) || c.dansIlotSable(x, z) || c.bordBassin(x, z, 16) || c.bassinA(x, z) != null) return Double.NaN;
        double base = 57 + 2.2 * c.bruit(x / 53.0, z / 53.0, 5101) + 1.2 * c.bruit(x / 17.0, z / 17.0, 5102);
        double f = Math.max(54, Math.min(60, Math.round(base)));
        double q = patate(c, x, z);
        if (q > 0) f = Math.max(f, Math.min(60, f + 2 + Math.round(q * 10)));
        return f;
    }
    /** > 0 dans une patate de corail (force croissante vers le centre) */
    static double patate(CarteIle c, int x, int z) {
        double seuil = 0.75 - 0.4 * c.rnLagonVie;
        return c.bruit(x / 11.0, z / 11.0, 5103) + 0.45 * c.bruit(x / 4.5, z / 4.5, 5104) - seuil;
    }
    static double lagonFond(CarteIle c, int x, int y, int z, double r) {
        if (y > 62 || y < 46) return r;
        double[] m = MEMO_L.get();
        if (m[0] != x || m[1] != z) {
            m[0] = x; m[1] = z; m[2] = 0;
            double f = fondLagon(c, x, z);
            if (!Double.isNaN(f)) { m[2] = lisseC(-20, -60, c.distanceCarteBrute(x, z)); m[3] = f; }
        }
        double w = m[2];
        if (w <= 0 || y < m[3] - 6) return r;
        double v = (m[3] + 0.5 - y) * 0.5;
        return r + (v - r) * w;
    }

    // ---- 0.9.5d : lieu sculpte : surface au bloc pres de la carte de hauteur, en fondu par le masque
    static double sculpture(CarteIle c, int x, int y, int z, double r) {
        CarteIle.Sculpture s = c.sculptureA(x, z);
        if (s == null) return r;
        int i = (z - s.z0) * s.w + (x - s.x0);
        double hy = Math.round(s.haut[i]), m = s.masque[i];
        if (y > hy + 12 || y < hy - 12) return r;
        double v = (hy + 0.5 - y) * 0.5;
        return r + (v - r) * m;
    }

    // ---- 0.9.4h : bassin de mer du port : fond exact (air au-dessus, 4 blocs pleins dessous)
    static double bassin(CarteIle c, int x, int y, int z, double r) {
        if (y < 40 || y > 90) return r;
        double[] b = c.bassinA(x, z);
        if (b != null) {
            int f = CarteIle.fondBassin(b, x, z);
            double v = (f + 0.5 - y) * 0.5;
            if (y > f) return Math.min(r, v);
            if (y >= f - 3) return Math.max(r, v);
            return r;
        }
        return r; // 0.9.4i : pas de rebord plein (digues) ; l'anneau est mis en eau par RouteFeature.bassins
    }

    // ---- 0.9.3 : plafond du recif et du lagon : aucun bloc plein au-dessus de Y plafond (eau >= 1 bloc), fondu sur 8 blocs depuis le trait de cote
    private static final ThreadLocal<double[]> MEMO_R = ThreadLocal.withInitial(() -> new double[]{Double.NaN, Double.NaN, 0});

    static double plafondMer(CarteIle c, int x, int y, int z, double r) {
        double cap = c.rnRecifPlafond;
        if (y < cap - 6) return r;
        double[] m = MEMO_R.get();
        if (m[0] != x || m[1] != z) {
            m[0] = x; m[1] = z; m[2] = 0;
            int cl = c.classeA(x, z);
            if (cl == CarteIle.RECIF || cl == CarteIle.LAGON) {
                m[2] = lisseC(-2, -10, c.distanceBlocs(x, z));
                // 0.9.5 plafond strict : loin de la terre de la carte (48 blocs sans deformation), aucun ilot hors des ilots gardes
                if (c.rnLagonStrict > 0 && c.distanceCarteBrute(x, z) < -48 && !c.dansIlotSable(x, z)) m[2] = 1;
            }
        }
        double w = m[2];
        if (w <= 0) return r;
        double capv = (cap + 0.5 - y) * 0.5;
        if (capv >= r) return r;
        return r + (capv - r) * w;
    }

    // ---- 0.9.1 : falaises et aiguilles de la Cote calcaire en 3D (max avec la densite : n'ajoute que de la roche)
    // memo par colonne : x, z, mode (0 rien, 1 falaise, 2 aiguille), sommet T, distance a la cote d, force a
    private static final ThreadLocal<double[]> MEMO_C = ThreadLocal.withInitial(() -> new double[]{Double.NaN, Double.NaN, 0, 0, 0, 0});

    private static double lisseC(double a, double b, double x) {
        double t = Math.max(0, Math.min(1, (x - a) / (b - a)));
        return t * t * (3 - 2 * t);
    }

    static double cote3d(CarteIle c, int x, int y, int z, double o) {
        double[] m = MEMO_C.get();
        if (m[0] != x || m[1] != z) {
            m[0] = x; m[1] = z; m[2] = 0;
            double d = c.distanceBlocs(x, z);
            if (d > -45 && d < 95) {
                double f = c.forceNaturel(x, z);
                if (f > 0 && c.estCalcaire(x, z)) {
                    double hc = c.rnFalHMin + (c.rnFalHMax - c.rnFalHMin) * (0.5 + 0.5 * c.bruit(x / 170.0, z / 170.0, 431));
                    if (d >= -8) { m[2] = 1; m[3] = c.niveauMer + f * c.rnFalaise3d * hc * (1 - lisseC(35, 95, d)); m[4] = d; }
                    else {
                        double n = c.bruit(x / 9.0, z / 9.0, 432) + 0.3 * c.bruit(x / 3.5, z / 3.5, 433);
                        double a = Math.max(0, (n - 0.80) / 0.20) * lisseC(-45, -14, d) * (1 - lisseC(-14, -10, d));
                        if (a > 0) { m[2] = 2; m[3] = c.niveauMer + f * c.rnFalaise3d * hc * (0.55 + 0.45 * Math.sqrt(a)); m[5] = a; }
                    }
                }
            }
        }
        if (m[2] == 0) return o;
        double T = m[3];
        if (y > T + 1) return o;
        double haut = (T - 0.5 - y) * 0.25;
        double dens;
        if (m[2] == 1) {
            // face a 2,5 blocs du trait de cote ; eboulis au pied (le bas avance vers la mer), leger surplomb en haut, face irreguliere
            double face = 2.5 - 6.0 * (1 - lisseC(c.niveauMer - 4, c.niveauMer + 6, y)) - 1.2 * lisseC(T - 7, T - 1, y)
                    + 1.4 * c.bruit(x / 6.0 + y / 9.0, z / 6.0 - y / 13.0, 434);
            dens = Math.min((m[4] - face) * 0.5, haut);
        } else dens = Math.min((m[5] - 0.12) * 3.0, haut);
        if (dens > 1.5) dens = 1.5;
        return dens > o ? dens : o;
    }

    private double relief3dBase(CarteIle c, int x, int y, int z, double deja) {
        if (c == null || !c.aDelta()) return Double.isNaN(deja) ? argument.compute(new SinglePointContext(x, y, z)) : deja;
        double[] m = MEMO_F.get();
        if (m[0] != x || m[1] != z) {
            m[0] = x; m[1] = z; m[2] = decalage(c, x, z);
            double w = c.poidsForme(x, z), t = Double.NaN;
            if (w > 0) { t = c.hauteurCible(x, z); if (Double.isNaN(t)) w = 0; }
            m[3] = w; m[4] = t;
        }
        int d = (int) m[2]; double w = m[3];
        double o = w >= 1 ? 0 : (d == 0 && !Double.isNaN(deja)) ? deja : argument.compute(new SinglePointContext(x, y - d, z));
        if (w <= 0) return o;
        // plat de la cible : densite > 0 sous le sommet (t - 1), meme pente que les plateaux
        double plat = Math.max(-1.5, Math.min(1.5, (m[4] - 0.5 - y) * PENTE));
        return o * (1 - w) + plat * w;
    }

    static int decalage(CarteIle c, int x, int z) {
        if (c == null || !c.aDelta()) return 0;
        int[] m = MEMO_D.get();
        if (m[0] == x && m[1] == z) return m[2];
        int d = (int) Math.round(c.deltaRelief(x, z));
        m[0] = x; m[1] = z; m[2] = d;
        return d;
    }

    private static double relief(CarteIle c, int x, int z, double o) {
        if (c == null) return o;
        double[] m = MEMO.get();
        double dBlocs;
        if (m[0] == x && m[1] == z && m[3] == o) dBlocs = m[2];
        else {
            dBlocs = c.deltaRelief(x, z);
            double off = o + dBlocs / 128.0;
            double off2 = fonduAdaptatif(c, x, z, off);
            dBlocs = (off2 - o) * 128.0;
            m[0] = x; m[1] = z; m[2] = dBlocs; m[3] = o;
        }
        return o + dBlocs / 128.0;
    }

    // ---- plateau de raccord : config/atheria_ile/plateaux.json
    // {"plateaux":[{"nom":..,"x1":..,"z1":..,"x2":..,"z2":..,"y":66,"fondu":32,
    //   "fondu_adaptatif":true,"pente_blocs":4,"fondu_min":32,"fondu_max":96,"fondu_3d":8,"bruit":0.12}]} (x2, z2 exclus)
    // dans le rectangle : terrain plein jusqu'a y. Fondu fixe (ancien) : melange 3D lineaire sur "fondu" blocs.
    // Fondu adaptatif (0.9.0) : la surface (offset) rejoint y sur une largeur pente x ecart (bornee min..max, bruitee),
    // en smoothstep ; le 3D ne garde qu'une bande de "fondu_3d" blocs pour absorber le bruit de Tectonic.
    private static volatile double[][] PLATEAUX;
    /** boite englobante de tous les plateaux + fondu (sortie immediate, cout nul hors zone) */
    private static double BX1 = 1, BX2 = -1, BZ1 = 1, BZ2 = -1;
    private static final double PENTE = 1.0 / 32.0;
    // indices : 0..3 rect, 4 y, 5 fondu 3D, 6 adaptatif (0/1), 7 pente, 8 min, 9 max, 10 bruit
    /** 0.9.6 : vrai si (x, z) est dans un plateau, son fondu (fondu_max si adaptatif) et une marge en plus */
    public static boolean dansPlateauFondu(int x, int z, int marge) {
        for (double[] q : plateaux()) {
            double f = (q[6] > 0 ? q[9] : q[5]) + marge;
            if (x >= q[0] - f && x < q[2] + f && z >= q[1] - f && z < q[3] + f) return true;
        }
        return false;
    }
    private static double[][] plateaux() {
        double[][] p = PLATEAUX;
        if (p != null) return p;
        synchronized (IleChamp.class) {
            if (PLATEAUX != null) return PLATEAUX;
            java.util.List<double[]> l = new java.util.ArrayList<>();
            java.nio.file.Path f = java.nio.file.Path.of("config", "atheria_ile", "plateaux.json");
            try {
                if (java.nio.file.Files.exists(f)) {
                    com.google.gson.JsonObject o = com.google.gson.JsonParser.parseString(java.nio.file.Files.readString(f)).getAsJsonObject();
                    for (com.google.gson.JsonElement e : o.getAsJsonArray("plateaux")) {
                        com.google.gson.JsonObject q = e.getAsJsonObject();
                        boolean ad = q.has("fondu_adaptatif") && q.get("fondu_adaptatif").getAsBoolean();
                        double f3 = ad ? (q.has("fondu_3d") ? q.get("fondu_3d").getAsDouble() : 8) : (q.has("fondu") ? q.get("fondu").getAsDouble() : 32);
                        l.add(new double[]{q.get("x1").getAsDouble(), q.get("z1").getAsDouble(), q.get("x2").getAsDouble(), q.get("z2").getAsDouble(),
                                q.get("y").getAsDouble(), f3, ad ? 1 : 0,
                                q.has("pente_blocs") ? q.get("pente_blocs").getAsDouble() : 4,
                                q.has("fondu_min") ? q.get("fondu_min").getAsDouble() : 32,
                                q.has("fondu_max") ? q.get("fondu_max").getAsDouble() : 96,
                                q.has("bruit") ? q.get("bruit").getAsDouble() : 0.12});
                        CarteIle.LOG.info("[atheria_ile] plateau de raccord '{}' (fondu {}) : {}", q.has("nom") ? q.get("nom").getAsString() : "?", ad ? "adaptatif" : "fixe", q);
                    }
                }
            } catch (Exception ex) { CarteIle.LOG.error("[atheria_ile] plateaux.json illisible : {}", ex.toString()); }
            if (!l.isEmpty()) {
                BX1 = Double.MAX_VALUE; BZ1 = Double.MAX_VALUE; BX2 = -Double.MAX_VALUE; BZ2 = -Double.MAX_VALUE;
                for (double[] q : l) {
                    double m = Math.max(q[5], q[6] > 0 ? q[9] * (1 + q[10]) + 2 : 0);
                    BX1 = Math.min(BX1, q[0] - m); BZ1 = Math.min(BZ1, q[1] - m); BX2 = Math.max(BX2, q[2] + m); BZ2 = Math.max(BZ2, q[3] + m);
                }
            }
            PLATEAUX = l.toArray(new double[0][]);
            return PLATEAUX;
        }
    }

    private static double distRect(double[] p, int x, int z) {
        double dx = Math.max(Math.max(p[0] - (x + 0.5), (x + 0.5) - p[2]), 0);
        double dz = Math.max(Math.max(p[1] - (z + 0.5), (z + 0.5) - p[3]), 0);
        return Math.sqrt(dx * dx + dz * dz);
    }

    /** 0.9.6c fondu_doux : distance au lot pour le fondu ; les 6 premiers blocs hors du lot sont au Y exact du plateau (pas de marche),
     *  puis la distance est deformee par un bruit (plus de lignes droites paralleles au lot). 0 = distance d'origine (bit-exact). */
    private static double dDoux(double d, int x, int z) {
        CarteIle c = CarteIle.active();
        if (c == null || c.rnFonduDoux <= 0 || d <= 0) return d;
        double k = c.rnFonduDoux;
        return Math.max(0, d - 6 * k) * Math.max(0.3, 1 + 0.45 * k * c.bruit(x / 23.0, z / 23.0, 4243));
    }
    /** poids du fondu : smoothstep, smootherstep (plus doux aux deux bouts) avec fondu_doux */
    private static double poids(double t) {
        CarteIle c = CarteIle.active();
        if (c != null && c.rnFonduDoux > 0) return t * t * t * (t * (6 * t - 15) + 10);
        return t * t * (3 - 2 * t);
    }

    private static double plateau3d(int x, int y, int z, double o) {
        double[][] ps = plateaux();
        if (x < BX1 || x > BX2 || z < BZ1 || z > BZ2) return o;
        for (double[] p : ps) {
            double d = dDoux(distRect(p, x, z), x, z);
            if (d >= p[5]) continue;
            double t = 1 - d / p[5];
            double w = poids(t);
            double plat = Math.max(-1.5, Math.min(1.5, (p[4] + 0.5 - y) * PENTE));
            return o * (1 - w) + plat * w;
        }
        return o;
    }

    // ---- 0.9.0 fondu adaptatif (branche base_terrain) : la colonne est decalee verticalement vers le Y du plateau,
    // poids smoothstep sur une largeur = pente x ecart (bornee, bruitee) ; ecart mesure sur la hauteur naturelle du bake
    // (config/atheria_ile/relief_base.bin, ATRB, getBaseHeight = sommet + 1). Hors bake : pas de fondu adaptatif (3D seul).
    private static volatile short[] BAKE; private static int bkX0, bkZ0, bkP, bkW, bkH; private static boolean bakeLu;
    private static final ThreadLocal<int[]> MEMO_P = ThreadLocal.withInitial(() -> new int[]{Integer.MIN_VALUE, Integer.MIN_VALUE, 0});

    private static synchronized void lireBake() {
        if (bakeLu) return;
        bakeLu = true;
        java.nio.file.Path f = java.nio.file.Path.of("config", "atheria_ile", "relief_base.bin");
        if (!java.nio.file.Files.isRegularFile(f)) { CarteIle.LOG.warn("[atheria_ile] fondu adaptatif : relief_base.bin absent, fondu 3D seul"); return; }
        try (java.io.DataInputStream in = new java.io.DataInputStream(new java.io.BufferedInputStream(java.nio.file.Files.newInputStream(f), 1 << 16))) {
            if (in.readInt() != 0x41545242) throw new IllegalStateException("entete");
            int x0 = in.readInt(), z0 = in.readInt(), p = in.readInt(), w = in.readInt(), h = in.readInt();
            short[] t = new short[w * h];
            for (int i = 0; i < t.length; i++) t[i] = in.readShort();
            bkX0 = x0; bkZ0 = z0; bkP = p; bkW = w; bkH = h; BAKE = t;
            CarteIle.LOG.info("[atheria_ile] fondu adaptatif : hauteur naturelle {}x{} pas {}", w, h, p);
        } catch (Exception e) { CarteIle.LOG.error("[atheria_ile] relief_base.bin illisible : {}", e.toString()); }
    }

    private static double crb(double a, double b, double c, double d, double t) {
        return b + 0.5 * t * (c - a + t * (2 * a - 5 * b + 4 * c - d + t * (3 * (b - c) + d - a)));
    }

    /** hauteur naturelle bicubique (Catmull-Rom) ; NaN si une des 16 cellules n'est pas mesuree */
    static double hauteurNaturelleBicubique(int x, int z) {
        if (!bakeLu) lireBake();
        short[] t = BAKE;
        if (t == null) return Double.NaN;
        double gx = (x + 0.5 - bkX0) / bkP, gz = (z + 0.5 - bkZ0) / bkP;
        int i = (int) Math.floor(gx), j = (int) Math.floor(gz);
        if (i < 1 || j < 1 || i >= bkW - 2 || j >= bkH - 2) return Double.NaN;
        double tx = gx - i, tz = gz - j;
        double[] r = new double[4];
        for (int k = 0; k < 4; k++) {
            double[] v = new double[4];
            for (int l = 0; l < 4; l++) { short q = t[(j - 1 + k) * bkW + i - 1 + l]; if (q <= -32767) return Double.NaN; v[l] = q; }
            r[k] = crb(v[0], v[1], v[2], v[3], tx);
        }
        return crb(r[0], r[1], r[2], r[3], tz);
    }

    /** hauteur naturelle (getBaseHeight) bilineaire ; NaN si non mesuree */
    static double hauteurNaturelle(int x, int z) {
        if (!bakeLu) lireBake();
        short[] t = BAKE;
        if (t == null) return Double.NaN;
        double gx = (x + 0.5 - bkX0) / bkP, gz = (z + 0.5 - bkZ0) / bkP;
        int i = (int) Math.floor(gx), j = (int) Math.floor(gz);
        if (i < 0 || j < 0 || i >= bkW - 1 || j >= bkH - 1) return Double.NaN;
        double tx = gx - i, tz = gz - j, r = 0;
        int[][] c = {{i, j}, {i + 1, j}, {i, j + 1}, {i + 1, j + 1}};
        double[] wt = {(1 - tx) * (1 - tz), tx * (1 - tz), (1 - tx) * tz, tx * tz};
        for (int k = 0; k < 4; k++) { short v = t[c[k][1] * bkW + c[k][0]]; if (v <= -32767) return Double.NaN; r += v * wt[k]; }
        return r;
    }

    static int decalagePlateau(int x, int z) {
        double[][] ps = plateaux();
        if (ps.length == 0 || x < BX1 || x > BX2 || z < BZ1 || z > BZ2) return 0;
        int[] m = MEMO_P.get();
        if (m[0] == x && m[1] == z) return m[2];
        int s = 0;
        for (double[] p : ps) {
            if (p[6] == 0) continue;
            double d = distRect(p, x, z);
            if (d <= 0) break;
            double hn = hauteurNaturelle(x, z);
            if (Double.isNaN(hn)) break;
            double ecart = p[4] + 1 - hn;
            double largeur = Math.max(p[8], Math.min(p[9], p[7] * Math.abs(ecart)));
            CarteIle c = CarteIle.active();
            if (c != null) largeur *= 1 + p[10] * c.bruit(x / 41.0, z / 41.0, 977);
            d = dDoux(d, x, z);
            if (d >= largeur) continue;
            double t = 1 - d / largeur;
            s = (int) Math.round(ecart * poids(t));
            break;
        }
        m[0] = x; m[1] = z; m[2] = s;
        return s;
    }

    /** offset (deja avec le delta) ramene vers le Y du plateau sur une largeur qui depend de l'ecart de hauteur */
    private static double fonduAdaptatif(CarteIle c, int x, int z, double off) {
        double[][] ps = plateaux();
        if (ps.length == 0 || x < BX1 || x > BX2 || z < BZ1 || z > BZ2) return off;
        for (double[] p : ps) {
            if (p[6] == 0) continue;
            double d = distRect(p, x, z);
            double cible = (p[4] + 0.5) / 128.0 - 1.0;
            double ecart = Math.abs((off - cible) * 128.0);
            double largeur = Math.max(p[8], Math.min(p[9], p[7] * ecart));
            largeur *= 1 + p[10] * c.bruit(x / 41.0, z / 41.0, 977);
            d = dDoux(d, x, z);
            if (d >= largeur) continue;
            double t = 1 - d / largeur;
            double w = poids(t);
            return off * (1 - w) + cible * w;
        }
        return off;
    }

    @Override
    public double minValue() { return Math.min(-1.5, argument.minValue()) - (code == RELIEF ? 2 : 0); }

    @Override
    public double maxValue() { return Math.max(1.5, argument.maxValue()) + (code == RELIEF ? 2 : 0); }

    @Override
    public KeyDispatchDataCodec<? extends DensityFunction> codec() { return CODEC; }
}
