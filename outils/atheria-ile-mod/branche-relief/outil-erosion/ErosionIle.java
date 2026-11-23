import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.file.*;
import java.util.*;

/**
 * Relief v3 de l'ile : erosion precalculee (hors jeu, sans dependance Minecraft).
 * Entree : relief_base.bin (bake du mod, hauteurs de surface tous les P blocs).
 * Sortie : relief_delta.bin (delta en 1/32 de bloc, tous les 4 blocs) + rendus « mini-carte » avant / apres.
 *
 * Usage : java ErosionIle base.bin delta.bin dossierRendus [cle=valeur ...]
 *   gouttes=1.0 (gouttes par cellule de terre), threads=2, graine=1234,
 *   colline=x,z,azimut,amplitude,longueur,largeur (soulevement avant erosion, ex. 2330,-1398,160,44,560,150),
 *   sommet=y (replat vise), zooms=x1,z1,x2,z2;x1,z1,x2,z2
 * Contraintes : la terre (base >= 64) ne descend jamais sous Y 64 (pas d'eau nouvelle), la mer n'est pas touchee,
 * |delta| <= 24 blocs hors colline, pas de pic isole (filtre median 3x3 du delta).
 */
public final class ErosionIle {
    static int W, H, X0, Z0;
    static final int P = 4;
    static float[] B, Hh, U;
    static boolean[] mer, inconnu;
    static float[] fondu;
    static Map<String, String> arg = new HashMap<>();

    public static void main(String[] a) throws Exception {
        for (int i = 3; i < a.length; i++) { int k = a[i].indexOf('='); arg.put(a[i].substring(0, k), a[i].substring(k + 1)); }
        long t0 = System.currentTimeMillis();
        lireBase(Path.of(a[0]));
        System.out.printf("base %dx%d pas %d, %d s%n", W, H, P, (System.currentTimeMillis() - t0) / 1000);
        calculerFondu(Double.parseDouble(arg.getOrDefault("marge", "256")));
        Hh = B.clone();
        U = new float[W * H];
        if (arg.containsKey("colline")) colline(arg.get("colline"));
        for (int i = 0; i < Hh.length; i++) Hh[i] += U[i];
        float[] avantErosion = Hh.clone();
        int terre = 0; for (int k = 0; k < mer.length; k++) if (!mer[k] && !inconnu[k] && fondu[k] > 0.05f) terre++;
        double gpc = Double.parseDouble(arg.getOrDefault("gouttes", "1.0"));
        int nt = Integer.parseInt(arg.getOrDefault("threads", "2"));
        long graine = Long.parseLong(arg.getOrDefault("graine", "1234"));
        hydraulique((long) (terre * gpc), nt, graine);
        System.out.printf("hydraulique %d gouttes, %d s%n", (long) (terre * gpc), (System.currentTimeMillis() - t0) / 1000);
        thermique(Integer.parseInt(arg.getOrDefault("thermique", "25")), Float.parseFloat(arg.getOrDefault("talus", "5.0")));
        contraintes(avantErosion);
        if (arg.containsKey("sommet") && arg.containsKey("colline")) replat(arg.get("colline"), Integer.parseInt(arg.get("sommet")));
        ecrireDelta(Path.of(a[1]));
        Path rd = Path.of(a[2]); Files.createDirectories(rd);
        rendu(B, rd.resolve("ile_avant.png"), 0, 0, W, H, 2);
        rendu(Hh, rd.resolve("ile_apres.png"), 0, 0, W, H, 2);
        if (arg.containsKey("zooms")) {
            int n = 0;
            for (String z : arg.get("zooms").split(";")) {
                String[] v = z.split(",");
                int i1 = (Integer.parseInt(v[0]) - X0) / P, j1 = (Integer.parseInt(v[1]) - Z0) / P, i2 = (Integer.parseInt(v[2]) - X0) / P, j2 = (Integer.parseInt(v[3]) - Z0) / P;
                n++;
                rendu(B, rd.resolve("zoom" + n + "_avant.png"), i1, j1, i2, j2, 1);
                rendu(Hh, rd.resolve("zoom" + n + "_apres.png"), i1, j1, i2, j2, 1);
            }
        }
        stats();
        System.out.printf("fini en %d s%n", (System.currentTimeMillis() - t0) / 1000);
    }

    // ---------------------------------------------------------------- lecture et reechantillonnage
    static void lireBase(Path f) throws IOException {
        try (DataInputStream in = new DataInputStream(new BufferedInputStream(Files.newInputStream(f), 1 << 16))) {
            if (in.readInt() != 0x41545242) throw new IOException("entete");
            int x0 = in.readInt(), z0 = in.readInt(), pas = in.readInt(), w = in.readInt(), h = in.readInt();
            float[] s = new float[w * h]; boolean[] sm = new boolean[w * h], su = new boolean[w * h];
            for (int i = 0; i < s.length; i++) { short v = in.readShort(); sm[i] = v == Short.MIN_VALUE; su[i] = v == -32767; s[i] = sm[i] || su[i] ? 30 : v; }
            X0 = x0; Z0 = z0;
            W = (w - 1) * pas / P + 1; H = (h - 1) * pas / P + 1;
            B = new float[W * H]; mer = new boolean[W * H]; inconnu = new boolean[W * H];
            for (int j = 0; j < H; j++) for (int i = 0; i < W; i++) {
                double gx = i * (double) P / pas, gz = j * (double) P / pas;
                int a = (int) gx, b = (int) gz; double tx = gx - a, tz = gz - b;
                double[] r = new double[4];
                for (int k = 0; k < 4; k++) r[k] = cr(at(s, w, h, a - 1, b - 1 + k), at(s, w, h, a, b - 1 + k), at(s, w, h, a + 1, b - 1 + k), at(s, w, h, a + 2, b - 1 + k), tx);
                float v = (float) cr(r[0], r[1], r[2], r[3], tz);
                int ia = Math.min(w - 1, (int) Math.round(gx)), ib = Math.min(h - 1, (int) Math.round(gz));
                B[j * W + i] = v;
                inconnu[j * W + i] = su[ib * w + ia];
                mer[j * W + i] = !inconnu[j * W + i] && (sm[ib * w + ia] || v < 63.5f);
            }
        }
    }

    /** fondu 0..1 : distance (blocs) aux cellules non mesurees, smoothstep sur la marge ; 1 partout si tout est mesure */
    static void calculerFondu(double marge) {
        float INF = 1e9f; float[] g = new float[W * H]; int nu = 0;
        for (int k = 0; k < g.length; k++) { g[k] = inconnu[k] ? 0 : INF; if (inconnu[k]) nu++; }
        float a = P, b = (float) (P * 1.41421);
        for (int j = 0; j < H; j++) for (int i = 0; i < W; i++) { int k = j * W + i; float v = g[k];
            if (i > 0) v = Math.min(v, g[k - 1] + a);
            if (j > 0) { v = Math.min(v, g[k - W] + a); if (i > 0) v = Math.min(v, g[k - W - 1] + b); if (i < W - 1) v = Math.min(v, g[k - W + 1] + b); } g[k] = v; }
        for (int j = H - 1; j >= 0; j--) for (int i = W - 1; i >= 0; i--) { int k = j * W + i; float v = g[k];
            if (i < W - 1) v = Math.min(v, g[k + 1] + a);
            if (j < H - 1) { v = Math.min(v, g[k + W] + a); if (i < W - 1) v = Math.min(v, g[k + W + 1] + b); if (i > 0) v = Math.min(v, g[k + W - 1] + b); } g[k] = v; }
        fondu = new float[W * H];
        for (int k = 0; k < g.length; k++) { double t = Math.max(0, Math.min(1, g[k] / marge)); fondu[k] = nu == 0 ? 1 : (float) (t * t * (3 - 2 * t)); }
        System.out.printf("cellules non mesurees %d sur %d, marge de fondu %.0f blocs%n", nu, W * H, marge);
    }

    static double at(float[] s, int w, int h, int i, int j) { i = Math.max(0, Math.min(w - 1, i)); j = Math.max(0, Math.min(h - 1, j)); return s[j * w + i]; }

    static double cr(double a, double b, double c, double d, double t) { return b + 0.5 * t * (c - a + t * (2 * a - 5 * b + 4 * c - d + t * (3 * (b - c) + d - a))); }

    // ---------------------------------------------------------------- bruit
    static long mel(long z) { z = (z ^ (z >>> 33)) * 0xff51afd7ed558ccdL; z = (z ^ (z >>> 33)) * 0xc4ceb9fe1a85ec53L; return z ^ (z >>> 33); }
    static double h01(long a, long b, long c) { return (mel(a * 0x632BE59BD9B4E019L + b * 0x85157AF5L + c * 0x9E3779B97F4A7C15L) >>> 11) * 0x1.0p-53; }
    static double bruit(double x, double z, long c) {
        int x0 = (int) Math.floor(x), z0 = (int) Math.floor(z); double tx = x - x0, tz = z - z0;
        tx = tx * tx * (3 - 2 * tx); tz = tz * tz * (3 - 2 * tz);
        double a = h01(x0, z0, c), b = h01(x0 + 1, z0, c), d = h01(x0, z0 + 1, c), e = h01(x0 + 1, z0 + 1, c);
        return ((a * (1 - tx) + b * tx) * (1 - tz) + (d * (1 - tx) + e * tx) * tz) * 2 - 1;
    }

    // ---------------------------------------------------------------- colline d'appui (soulevement allonge avec epaulements, avant erosion)
    static void colline(String s) {
        String[] v = s.split(",");
        double cx = Double.parseDouble(v[0]), cz = Double.parseDouble(v[1]), az = Math.toRadians(Double.parseDouble(v[2]));
        double amp = Double.parseDouble(v[3]), L = Double.parseDouble(v[4]), lw = Double.parseDouble(v[5]);
        double ux = Math.sin(az), uz = -Math.cos(az);           // axe de la crete (azimut depuis le nord, z negatif = nord)
        double vx = -uz, vz = ux;                                  // perpendiculaire
        int n = 0;
        for (int j = 0; j < H; j++) for (int i = 0; i < W; i++) {
            double x = X0 + i * P, z = Z0 + j * P;
            double dx = x - cx, dz = z - cz;
            if (Math.abs(dx) > L + lw * 2 || Math.abs(dz) > L + lw * 2) continue;
            // axe courbe (crete pas rectiligne) et largeur variable
            double s1 = dx * ux + dz * uz;
            double t1 = dx * vx + dz * vz + 40 * bruit(s1 / 260.0, 0.5, 501);
            double larg = lw * (1 + 0.25 * bruit(s1 / 180.0, 3.5, 502));
            double ga = Math.exp(-Math.pow(s1 / (L * 0.5), 4));          // crete allongee, bouts arrondis
            double gt = Math.exp(-Math.pow(t1 / larg, 2) * (t1 > 0 ? 1.0 : 1.6)); // versant est (t>0) plus long, ouest plus raide
            // epaulements : deux bosses secondaires le long de l'axe, cote est
            double ep = 0.55 * Math.exp(-(Math.pow((s1 - L * 0.28) / 70, 2) + Math.pow((t1 - larg * 0.7) / 60, 2)))
                      + 0.45 * Math.exp(-(Math.pow((s1 + L * 0.30) / 80, 2) + Math.pow((t1 - larg * 0.5) / 70, 2)));
            double f = ga * gt + ep * ga;
            f *= 1 + 0.12 * bruit(x / 90.0, z / 90.0, 503) + 0.06 * bruit(x / 33.0, z / 33.0, 504);
            if (f < 0.002) continue;
            int k = j * W + i;
            if (mer[k]) continue;
            U[k] = (float) (amp * f); n++;
        }
        System.out.printf("colline : %d cellules soulevees, max %.1f blocs%n", n, amp);
    }

    static void replat(String s, int y) {
        String[] v = s.split(",");
        int ci = (int) Math.round((Double.parseDouble(v[0]) - X0) / P), cj = (int) Math.round((Double.parseDouble(v[1]) - Z0) / P);
        // point le plus haut a moins de 100 blocs du centre demande
        int best = -1; float bh = -1e9f;
        for (int j = cj - 25; j <= cj + 25; j++) for (int i = ci - 25; i <= ci + 25; i++) { int k = j * W + i; if (Hh[k] > bh) { bh = Hh[k]; best = k; } }
        int bi = best % W, bj = best / W;
        if (arg.containsKey("sommet_xz")) { String[] q = arg.get("sommet_xz").split(","); bi = (int) Math.round((Double.parseDouble(q[0]) - X0) / P); bj = (int) Math.round((Double.parseDouble(q[1]) - Z0) / P); bh = Hh[bj * W + bi]; }
        // ecart au Y vise : dome large (gaussienne de 72 blocs) pour que le sommet y arrive sans former de marche
        double ecart = y - bh;
        for (int j = bj - 45; j <= bj + 45; j++) for (int i = bi - 45; i <= bi + 45; i++) {
            int k = j * W + i; if (mer[k] || inconnu[k]) continue;
            double r2 = (double) (i - bi) * (i - bi) + (double) (j - bj) * (j - bj);
            Hh[k] += (float) (ecart * Math.exp(-r2 / (18.0 * 18.0)) * fondu[k]);
        }
        // replat de 3x3 cellules (12x12 blocs) a y, raccord doux sur 4 cellules
        for (int j = bj - 7; j <= bj + 7; j++) for (int i = bi - 7; i <= bi + 7; i++) {
            double d = Math.max(0, Math.max(Math.abs(i - bi), Math.abs(j - bj)) - 1.0);
            double w = d >= 6 ? 0 : 1 - (d / 6) * (d / 6) * (3 - 2 * d / 6);
            int k = j * W + i;
            Hh[k] = (float) (Hh[k] * (1 - w) + y * w);
        }
        System.out.printf("SOMMET x=%d z=%d y=%d (avant replat %.1f)%n", X0 + bi * P, Z0 + bj * P, y, bh);
    }

    // ---------------------------------------------------------------- erosion hydraulique (gouttes)
    static void hydraulique(long n, int nt, long graine) throws InterruptedException {
        final int R = 2;                         // rayon d'erosion (cellules)
        final double inertie = 0.08, capacite = 6, minPente = 0.02, depot = 0.25, erode = 0.35, evap = 0.025, grav = 4;
        final int vie = 70;
        // poids du pinceau
        List<int[]> off = new ArrayList<>(); List<Double> pw = new ArrayList<>(); double sw = 0;
        for (int dj = -R; dj <= R; dj++) for (int di = -R; di <= R; di++) { double d = Math.sqrt(di * di + dj * dj); if (d <= R) { off.add(new int[]{di, dj}); pw.add(R - d + 0.5); sw += R - d + 0.5; } }
        final int[][] O = off.toArray(new int[0][]); final double[] PW = new double[pw.size()];
        for (int i = 0; i < PW.length; i++) PW[i] = pw.get(i) / sw;
        // cellules de terre (departs)
        int[] terre = new int[W * H]; int nTerre = 0;
        for (int k = 0; k < W * H; k++) if (!mer[k] && !inconnu[k] && fondu[k] > 0.05f && B[k] > 66) terre[nTerre++] = k;
        final int NT = nTerre; final int[] T = terre;
        Thread[] th = new Thread[nt];
        for (int q = 0; q < nt; q++) {
            final int id = q;
            th[q] = new Thread(() -> {
                SplittableRandom rnd = new SplittableRandom(graine + id * 7919L);
                for (long g = id; g < n; g += nt) {
                    int k0 = T[rnd.nextInt(NT)];
                    double x = k0 % W + rnd.nextDouble(), z = k0 / W + rnd.nextDouble();
                    double dx = 0, dz = 0, v = 1, eau = 1, sed = 0;
                    for (int s = 0; s < vie; s++) {
                        int ix = (int) x, iz = (int) z;
                        if (ix < 1 || iz < 1 || ix >= W - 2 || iz >= H - 2) break;
                        double fx = x - ix, fz = z - iz;
                        int k = iz * W + ix;
                        double h00 = Hh[k], h10 = Hh[k + 1], h01 = Hh[k + W], h11 = Hh[k + W + 1];
                        double gx = (h10 - h00) * (1 - fz) + (h11 - h01) * fz, gz = (h01 - h00) * (1 - fx) + (h11 - h10) * fx;
                        double hc = h00 * (1 - fx) * (1 - fz) + h10 * fx * (1 - fz) + h01 * (1 - fx) * fz + h11 * fx * fz;
                        dx = dx * inertie - gx * (1 - inertie); dz = dz * inertie - gz * (1 - inertie);
                        double l = Math.sqrt(dx * dx + dz * dz); if (l < 1e-9) break;
                        dx /= l; dz /= l;
                        double nx = x + dx, nz = z + dz;
                        int jx = (int) nx, jz = (int) nz;
                        if (jx < 1 || jz < 1 || jx >= W - 2 || jz >= H - 2) break;
                        if (inconnu[jz * W + jx]) break;
                        if (mer[jz * W + jx]) { // arrivee a la mer : depose tout sur place (pas de comblement du lagon : rien)
                            break;
                        }
                        double gfx = nx - jx, gfz = nz - jz; int kn = jz * W + jx;
                        double hn = Hh[kn] * (1 - gfx) * (1 - gfz) + Hh[kn + 1] * gfx * (1 - gfz) + Hh[kn + W] * (1 - gfx) * gfz + Hh[kn + W + 1] * gfx * gfz;
                        double dh = hn - hc;
                        double cap = Math.max(-dh, minPente) * v * eau * capacite;
                        if (sed > cap || dh > 0) {
                            double dep = dh > 0 ? Math.min(dh, sed) : (sed - cap) * depot;
                            sed -= dep;
                            synchronized (Hh) {
                                Hh[k] += dep * (1 - fx) * (1 - fz); Hh[k + 1] += dep * fx * (1 - fz); Hh[k + W] += dep * (1 - fx) * fz; Hh[k + W + 1] += dep * fx * fz;
                            }
                        } else {
                            double er = Math.min((cap - sed) * erode, -dh);
                            synchronized (Hh) {
                                for (int p = 0; p < O.length; p++) {
                                    int kk = (iz + O[p][1]) * W + ix + O[p][0];
                                    if (kk < 0 || kk >= Hh.length || mer[kk] || inconnu[kk]) continue;
                                    double e = er * PW[p];
                                    Hh[kk] -= e; sed += e;
                                }
                            }
                        }
                        v = Math.sqrt(Math.max(0, v * v - dh * grav));
                        eau *= 1 - evap;
                        x = nx; z = nz;
                    }
                }
            }, "erosion-" + q);
            th[q].setPriority(Thread.MIN_PRIORITY);
            th[q].start();
        }
        for (Thread t : th) t.join();
    }

    // ---------------------------------------------------------------- erosion thermique (eboulis : pente > talus par cellule)
    static void thermique(int it, float talus) {
        float[] d = new float[W * H];
        int[] di = {1, -1, 0, 0, 1, 1, -1, -1}, dj = {0, 0, 1, -1, 1, -1, 1, -1};
        double[] dist = {1, 1, 1, 1, 1.414, 1.414, 1.414, 1.414};
        for (int n = 0; n < it; n++) {
            Arrays.fill(d, 0);
            for (int j = 1; j < H - 1; j++) for (int i = 1; i < W - 1; i++) {
                int k = j * W + i; if (mer[k] || inconnu[k]) continue;
                float h = Hh[k]; double tot = 0, mx = 0; double[] ex = new double[8];
                for (int q = 0; q < 8; q++) { double e = (h - Hh[k + dj[q] * W + di[q]]) - talus * dist[q]; if (e > 0) { ex[q] = e; tot += e; mx = Math.max(mx, e); } }
                if (tot <= 0) continue;
                double mv = 0.4 * mx;
                d[k] -= mv;
                for (int q = 0; q < 8; q++) if (ex[q] > 0) d[k + dj[q] * W + di[q]] += mv * ex[q] / tot;
            }
            for (int k = 0; k < d.length; k++) if (!mer[k] && !inconnu[k]) Hh[k] += d[k];
        }
    }

    // ---------------------------------------------------------------- contraintes
    static void contraintes(float[] avant) {
        int nan = 0;
        float[] dl = new float[W * H];
        for (int k = 0; k < dl.length; k++) {
            if (mer[k] || inconnu[k]) { dl[k] = 0; continue; }
            double d = Hh[k] - avant[k];
            if (Double.isNaN(d) || Double.isInfinite(d)) { nan++; d = 0; }
            // plafond adaptatif : 24 blocs en pente douce, 12 sur les reliefs raides (pente de la base > 1)
            int i = k % W, j = k / W;
            double pente = 0;
            if (i > 0 && j > 0 && i < W - 1 && j < H - 1) { double sx = (B[k + 1] - B[k - 1]) / (2.0 * P), sz = (B[k + W] - B[k - W]) / (2.0 * P); pente = Math.sqrt(sx * sx + sz * sz); }
            double t = Math.max(0, Math.min(1, (pente - 0.3) / 0.7)); t = t * t * (3 - 2 * t);
            double cap = U[k] > 1 ? 24 - 12 * t : 12 - 4 * t;
            d = Math.max(-cap, Math.min(cap, d));
            dl[k] = (float) ((d + U[k]) * fondu[k]);
        }
        // median 3x3 (pas de pic ni de trou isole)
        float[] m = dl.clone(); float[] w9 = new float[9];
        for (int j = 1; j < H - 1; j++) for (int i = 1; i < W - 1; i++) {
            int k = j * W + i; if (mer[k]) continue; int c = 0;
            for (int b = -1; b <= 1; b++) for (int a = -1; a <= 1; a++) w9[c++] = dl[k + b * W + a];
            Arrays.sort(w9); m[k] = w9[4];
        }
        System.out.println("NAN corriges : " + nan);
        for (int k = 0; k < m.length; k++) {
            if (mer[k] || inconnu[k]) { Hh[k] = B[k]; continue; }
            float h = B[k] + m[k];
            if (B[k] >= 64 && h < 64) h = 64;       // la terre ne passe jamais sous la mer
            // fondu pres de la cote (2 cellules) : le trait de cote ne bouge pas
            Hh[k] = h;
        }
    }

    static void ecrireDelta(Path f) throws IOException {
        try (DataOutputStream o = new DataOutputStream(new BufferedOutputStream(Files.newOutputStream(f), 1 << 16))) {
            o.writeInt(0x41545244); o.writeInt(X0); o.writeInt(Z0); o.writeInt(P); o.writeInt(W); o.writeInt(H);
            for (int k = 0; k < W * H; k++) {
                double d = mer[k] || inconnu[k] ? 0 : (Hh[k] - B[k]) * 32;
                o.writeShort((short) Math.max(-32000, Math.min(32000, Math.round(d))));
            }
        }
        System.out.println("delta ecrit " + f);
    }

    static void stats() {
        double s = 0, smax = 0; int n = 0, ng = 0;
        for (int k = 0; k < W * H; k++) if (!mer[k] && !inconnu[k]) { double d = Hh[k] - B[k]; s += Math.abs(d); smax = Math.max(smax, Math.abs(d)); n++; if (Math.abs(d) > 4) ng++; }
        System.out.printf("STATS terre %d cellules, |delta| moyen %.2f blocs, max %.1f, >4 blocs %.1f %%%n", n, s / n, smax, 100.0 * ng / n);
    }

    // ---------------------------------------------------------------- rendu « mini-carte » : teintes hypsometriques + ombrage
    static void rendu(float[] h, Path f, int i1, int j1, int i2, int j2, int red) throws IOException {
        int w = (i2 - i1) / red, hh = (j2 - j1) / red;
        BufferedImage im = new BufferedImage(w, hh, BufferedImage.TYPE_INT_RGB);
        for (int y = 0; y < hh; y++) for (int x = 0; x < w; x++) {
            int i = i1 + x * red, j = j1 + y * red;
            if (i < 1 || j < 1 || i >= W - 1 || j >= H - 1) continue;
            int k = j * W + i;
            float v = h[k];
            int rgb;
            double sx = (h[k + 1] - h[k - 1]) / (2.0 * P), sz = (h[k + W] - h[k - W]) / (2.0 * P);
            double nl = Math.sqrt(sx * sx + sz * sz + 1);
            double lum = (-sx * -0.6 + -sz * -0.6 + 0.55) / nl; // lumiere du nord-ouest
            lum = Math.max(0.25, Math.min(1.25, 0.35 + lum));
            if (inconnu[k]) { rgb = 0x707070; lum = 1; }
            else if (mer[k]) {
                double p = Math.max(0, Math.min(1, (63 - v) / 30));
                rgb = mix(new int[]{88, 190, 200}, new int[]{20, 60, 120}, p);
                lum = 1;
            } else {
                double[] st = {63, 66, 72, 85, 100, 120, 150, 200};
                int[][] co = {{220, 205, 150}, {120, 160, 80}, {90, 140, 60}, {110, 130, 60}, {140, 125, 80}, {130, 110, 90}, {150, 145, 140}, {235, 235, 235}};
                int q = 0; while (q < st.length - 2 && v > st[q + 1]) q++;
                double t = Math.max(0, Math.min(1, (v - st[q]) / (st[q + 1] - st[q])));
                rgb = mix(co[q], co[q + 1], t);
            }
            int r = (int) Math.min(255, ((rgb >> 16) & 255) * lum), g = (int) Math.min(255, ((rgb >> 8) & 255) * lum), b = (int) Math.min(255, (rgb & 255) * lum);
            im.setRGB(x, y, (r << 16) | (g << 8) | b);
        }
        ImageIO.write(im, "png", f.toFile());
    }

    static int mix(int[] a, int[] b, double t) {
        return ((int) (a[0] + (b[0] - a[0]) * t) << 16) | ((int) (a[1] + (b[1] - a[1]) * t) << 8) | (int) (a[2] + (b[2] - a[2]) * t);
    }
}
