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
        if (code == RELIEF) { int d = decalage(CarteIle.active(), ctx.blockX(), ctx.blockZ()); return argument.compute(d == 0 ? ctx : new SinglePointContext(ctx.blockX(), ctx.blockY() - d, ctx.blockZ())); }
        double o = argument.compute(ctx);
        if (code == PLATEAU) return plateau3d(ctx.blockX(), ctx.blockY(), ctx.blockZ(), o);
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
            if (code == PLATEAU) tab[i] = plateau3d(f.blockX(), f.blockY(), f.blockZ(), tab[i]);
            else { int d = decalage(c, f.blockX(), f.blockZ()); if (d != 0) tab[i] = argument.compute(new SinglePointContext(f.blockX(), f.blockY() - d, f.blockZ())); }
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

    private static double plateau3d(int x, int y, int z, double o) {
        double[][] ps = plateaux();
        if (x < BX1 || x > BX2 || z < BZ1 || z > BZ2) return o;
        for (double[] p : ps) {
            double d = distRect(p, x, z);
            if (d >= p[5]) continue;
            double t = 1 - d / p[5];
            double w = t * t * (3 - 2 * t);
            double plat = Math.max(-1.5, Math.min(1.5, (p[4] + 0.5 - y) * PENTE));
            return o * (1 - w) + plat * w;
        }
        return o;
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
            if (d >= largeur) continue;
            double t = 1 - d / largeur;
            double w = t * t * (3 - 2 * t);
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
