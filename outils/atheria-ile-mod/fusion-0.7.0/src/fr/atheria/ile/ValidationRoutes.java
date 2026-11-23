package fr.atheria.ile;

import net.minecraft.core.BlockPos;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.chunk.LevelChunk;
import net.minecraft.world.level.levelgen.Heightmap;
import net.minecraft.world.level.material.MapColor;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Mesures sur les vrais blocs des routes generees, AU FIL DE LA GENERATION : un releve est mesure des que tous les
 * chunks autour de lui (axe +-21 blocs) sont charges, et un chunk est libere des qu'aucun releve en attente n'en a
 * besoin. La memoire reste bornee quelle que soit la longueur de la route (avant : tous les chunks gardes jusqu'a la
 * fin, OutOfMemoryError a 4 Go sur RN1). Les couleurs de surface sont gardees (un int par colonne) pour les zooms.
 * Tout tourne sur le fil du serveur.
 */
final class ValidationRoutes {
    private ValidationRoutes() {}

    /** rayon (blocs) lu autour d'un releve : largeur jusqu'a 20, bas-cotes jusqu'a demi-largeur + bas-cotes */
    private static final int RAYON = 21;

    private static final class Etat {
        final Route r;
        final int m;
        final int[] ym, larg;
        final boolean[] fait, trou;
        final String[] trouTexte;
        final int[] enc, mes;
        /** 0.5.4 : sur un tablier de pont, blocs d'air sous la dalle a l'axe (-1 sinon), et ce qu'il y a dessous */
        final int[] air; final String[] dessous;
        final long[][] chunks;
        Etat(Route r) {
            this.r = r; m = r.ax.length;
            ym = new int[m]; larg = new int[m]; fait = new boolean[m]; trou = new boolean[m]; trouTexte = new String[m];
            enc = new int[m]; mes = new int[m]; chunks = new long[m][];
            air = new int[m]; dessous = new String[m]; java.util.Arrays.fill(air, -1);
            java.util.Arrays.fill(ym, Integer.MIN_VALUE);
            java.util.Arrays.fill(larg, -1);
        }
    }

    private static final List<Etat> ETATS = new ArrayList<>();
    /** pour chaque chunk : nombre de releves en attente qui en ont besoin */
    private static final Map<Long, int[]> BESOIN = new HashMap<>();
    /** couleur de surface (ombree) par colonne, pour les zooms */
    private static final Map<Long, int[]> COULEURS = new HashMap<>();

    /** troncon en cours (1..n) et nombre de troncons ; 0 = route entiere en un seul lancement */
    private static int troncon, troncons;
    private static int releveDebut, releveFin;
    static int troncon() { return troncon; }
    static int troncons() { return troncons; }

    static void init(CarteIle c) {
        ETATS.clear(); BESOIN.clear(); COULEURS.clear();
        troncon = c.config.has("valider_routes_troncon") ? c.config.get("valider_routes_troncon").getAsInt() : 0;
        troncons = c.config.has("valider_routes_troncons") ? c.config.get("valider_routes_troncons").getAsInt() : 0;
        releveDebut = 0; releveFin = Integer.MAX_VALUE;
        if (c.config.has("valider_routes_releves")) {
            com.google.gson.JsonArray a = c.config.getAsJsonArray("valider_routes_releves");
            releveDebut = a.get(0).getAsInt(); releveFin = a.get(1).getAsInt();
        }
        if (troncon > 0) CarteIle.LOG.info("[atheria_ile] validation des routes : troncon {} / {}, releves {} a {}", troncon, troncons, releveDebut, releveFin);
        for (Route r : c.routes) {
            Etat e = new Etat(r);
            for (int i = 0; i < e.m; i++) {
                if (i < releveDebut || i >= releveFin) { e.fait[i] = true; continue; }
                int x = (int) Math.floor(r.ax[i]), z = (int) Math.floor(r.az[i]);
                int cx0 = (x - RAYON) >> 4, cx1 = (x + RAYON) >> 4, cz0 = (z - RAYON) >> 4, cz1 = (z + RAYON) >> 4;
                long[] l = new long[(cx1 - cx0 + 1) * (cz1 - cz0 + 1)];
                int k = 0;
                for (int cz = cz0; cz <= cz1; cz++) for (int cx = cx0; cx <= cx1; cx++) {
                    long cle = ChunkPos.asLong(cx, cz);
                    l[k++] = cle;
                    BESOIN.computeIfAbsent(cle, q -> new int[1])[0]++;
                }
                e.chunks[i] = l;
            }
            ETATS.add(e);
        }
    }

    /** chunks a generer, dans l'ordre des releves (chaque releve a besoin de ses chunks a +-RAYON blocs) */
    static List<Long> ordre() {
        java.util.LinkedHashSet<Long> s = new java.util.LinkedHashSet<>();
        for (Etat e : ETATS) for (long[] l : e.chunks) if (l != null) for (long k : l) s.add(k);
        return new ArrayList<>(s);
    }

    /** vrai si au moins un releve en attente a besoin de ce chunk */
    static boolean utile(long cle) { int[] b = BESOIN.get(cle); return b != null && b[0] > 0; }

    /** a appeler quand un chunk vient d'etre genere : couleurs de surface pour les zooms */
    static void noterChunk(ServerLevel n, LevelChunk ch) {
        int[] col = new int[256];
        BlockPos.MutableBlockPos p = new BlockPos.MutableBlockPos();
        int bx = ch.getPos().getMinBlockX(), bz = ch.getPos().getMinBlockZ();
        for (int dz = 0; dz < 16; dz++) for (int dx = 0; dx < 16; dx++) {
            int y = ch.getHeight(Heightmap.Types.WORLD_SURFACE, dx, dz);
            BlockState s = ch.getBlockState(p.set(bx + dx, y, bz + dz));
            MapColor mc = s.getMapColor(n, p);
            int c = mc == MapColor.NONE ? 0 : mc.col;
            double ombre = 0.7 + 0.3 * Math.max(0, Math.min(1, (y - 60) / 80.0));
            col[dz * 16 + dx] = ((int) (((c >> 16) & 255) * ombre) << 16) | ((int) (((c >> 8) & 255) * ombre) << 8) | (int) ((c & 255) * ombre);
        }
        COULEURS.put(ch.getPos().toLong(), col);
    }

    /**
     * Mesure tous les releves dont les chunks sont charges ; renvoie les chunks devenus inutiles (a liberer).
     */
    static List<Long> releverPrets(ServerLevel n) {
        Finition.traiter(n, 0);   // 0.5.6 : routes finies avant toute mesure
        List<Long> libres = new ArrayList<>();
        BlockPos.MutableBlockPos p = new BlockPos.MutableBlockPos();
        for (Etat e : ETATS) {
            if (!e.r.profilPret()) continue;
            for (int i = 0; i < e.m; i++) {
                if (e.fait[i]) continue;
                boolean prets = true;
                for (long cle : e.chunks[i]) if (n.getChunkSource().getChunkNow(ChunkPos.getX(cle), ChunkPos.getZ(cle)) == null) { prets = false; break; }
                if (!prets) continue;
                mesurer(n, p, e, i);
                e.fait[i] = true;
                for (long cle : e.chunks[i]) { int[] b = BESOIN.get(cle); if (--b[0] == 0) libres.add(cle); }
            }
        }
        return libres;
    }

    private static boolean chaussee(BlockState s) {
        return s.is(Blocks.BLACK_CONCRETE_POWDER) || s.is(Blocks.TUFF) || s.is(Blocks.GRAVEL) || s.is(Blocks.COARSE_DIRT) || s.is(Blocks.LIGHT_GRAY_CONCRETE_POWDER);
    }

    private static LevelChunk chunk(ServerLevel n, int x, int z) {
        return n.getChunkSource().getChunkNow(x >> 4, z >> 4);
    }

    /** Y du bloc de surface (sous l'herbe courte eventuelle), Integer.MIN_VALUE si chunk absent */
    private static int dessus(ServerLevel n, BlockPos.MutableBlockPos p, int x, int z) {
        LevelChunk ch = chunk(n, x, z);
        if (ch == null) return Integer.MIN_VALUE;
        int y = ch.getHeight(Heightmap.Types.WORLD_SURFACE, x & 15, z & 15);
        BlockState s = ch.getBlockState(p.set(x, y, z));
        while (y > n.getMinBuildHeight() && (s.isAir() || s.is(Blocks.SHORT_GRASS) || s.is(Blocks.TALL_GRASS) || s.canBeReplaced())) { y--; s = ch.getBlockState(p.set(x, y, z)); }
        return y;
    }

    private static BlockState etat(ServerLevel n, BlockPos.MutableBlockPos p, int x, int y, int z) {
        LevelChunk ch = chunk(n, x, z);
        return ch == null ? null : ch.getBlockState(p.set(x, y, z));
    }

    private static void mesurer(ServerLevel n, BlockPos.MutableBlockPos p, Etat e, int i) {
        Route r = e.r;
        int m = e.m;
        int x = (int) Math.floor(r.ax[i]), z = (int) Math.floor(r.az[i]);
        int y = dessus(n, p, x, z);
        if (y == Integer.MIN_VALUE) return;
        e.ym[i] = y;
        BlockState s = etat(n, p, x, y, z);
        if (r.tablier[i]) {
            // air sous le tablier : de Y-2 vers le bas tant que c'est de l'air (la dalle est a Y-1)
            int k = 0, yy = y - 2;
            BlockState sd = etat(n, p, x, yy, z);
            while (sd != null && sd.isAir() && yy > n.getMinBuildHeight()) { k++; yy--; sd = etat(n, p, x, yy, z); }
            e.air[i] = k;
            e.dessous[i] = sd == null ? "?" : (sd.getFluidState().isEmpty() ? "" : "eau:") + sd.getBlock().getDescriptionId().replace("block.minecraft.", "") + "@Y" + yy;
        }
        if (!chaussee(s)) { e.trou[i] = true; e.trouTexte[i] = String.format(" %d,%d,Y%d=%s", x, z, y, s.getBlock().getDescriptionId().replace("block.minecraft.", "")); }
        // largeur reelle : perpendiculaire a l'axe, tant que la surface est de la chaussee a +-1 bloc
        if (i % 5 == 0 && i > 0 && i < m - 1) {
            double dx = r.ax[i + 1] - r.ax[i - 1], dz = r.az[i + 1] - r.az[i - 1], l = Math.hypot(dx, dz);
            double nx = -dz / l, nz = dx / l;
            int larg = 1;
            for (int sgn = -1; sgn <= 1; sgn += 2) {
                for (int t = 1; t <= 20; t++) {
                    int xx = (int) Math.floor(r.ax[i] + sgn * nx * t), zz = (int) Math.floor(r.az[i] + sgn * nz * t);
                    int yy = dessus(n, p, xx, zz);
                    if (yy == Integer.MIN_VALUE || Math.abs(yy - y) > 1 || !chaussee(etat(n, p, xx, yy, zz))) break;
                    larg++;
                }
            }
            e.larg[i] = larg;
        }
        // bas-cotes degages : rien de solide ni de feuillage dans les 6 blocs au-dessus, de la chaussee jusqu'a demi-largeur + bas-cotes
        if (r.droit[i] && i % 5 == 0 && i > 0 && i < m - 1) {
            double dx = r.ax[i + 1] - r.ax[i - 1], dz = r.az[i + 1] - r.az[i - 1], l = Math.hypot(dx, dz);
            double nx = -dz / l, nz = dx / l;
            for (int sgn = -1; sgn <= 1; sgn += 2) for (int t = r.demiLargeur + 1; t <= r.demiLargeur + r.basCotes; t++) {
                int xx = (int) Math.floor(r.ax[i] + sgn * nx * t), zz = (int) Math.floor(r.az[i] + sgn * nz * t);
                e.mes[i]++;
                for (int yy = y + 1; yy <= y + 6; yy++) {
                    BlockState s2 = etat(n, p, xx, yy, zz);
                    if (s2 != null && !s2.isAir() && !s2.is(Blocks.SHORT_GRASS) && !s2.is(Blocks.TALL_GRASS)) { e.enc[i]++; break; }
                }
            }
        }
    }

    /** dernier passage (releves restants sur ce qui est charge) puis rapport et zooms */
    static void ecrire(ServerLevel n, CarteIle c) throws Exception {
        releverPrets(n);
        Path rendus = c.dossier.resolve("rendus");
        Files.createDirectories(rendus);
        if (troncon > 0) {
            sauver(rendus, troncon);
            if (troncon < troncons) {
                int faits = 0, total = 0;
                for (Etat e : ETATS) for (int i = Math.max(0, releveDebut); i < Math.min(e.m, releveFin); i++) { total++; if (e.ym[i] != Integer.MIN_VALUE) faits++; }
                Tests.ecrireRapport(c, "rapport-routes-t" + troncon + ".txt", String.format("TRONCON %d / %d : releves %d a %d, %d mesures sur %d ; mesures sauvees, rapport complet au dernier troncon%n", troncon, troncons, releveDebut, releveFin, faits, total));
                CarteIle.LOG.info("[atheria_ile] troncon {} / {} sauve ({} releves mesures sur {})", troncon, troncons, faits, total);
                BESOIN.clear(); COULEURS.clear();
                return;
            }
            for (int k = 1; k < troncons; k++) charger(rendus, k);
        }
        StringBuilder sb = new StringBuilder("VALIDATION DES ROUTES (blocs reels, un releve tous les 2 blocs d'axe, mesure au fil de la generation)\n");
        Path dossier = c.dossier.resolve("rendus");
        Files.createDirectories(dossier);
        for (Etat e : ETATS) {
            Route r = e.r;
            int m = e.m;
            if (!r.profilPret()) { sb.append(r.nom).append(" : ECHEC, la feature n'a jamais tourne (datapack sans biome_modifier ?)\n"); continue; }
            int[] ym = e.ym;
            int absents = 0, trous = 0, ecartProfil = 0, marches = 0, lmin = 999, lmax = 0, encombres = 0, mesuresBas = 0;
            long lsom = 0; int ln = 0;
            double penteMax = 0; int iPente = 0;
            StringBuilder listeTrous = new StringBuilder();
            for (int i = 0; i < m; i++) {
                if (ym[i] == Integer.MIN_VALUE) { absents++; continue; }
                int y = ym[i];
                if (e.trou[i]) { trous++; if (trous <= 15) listeTrous.append(e.trouTexte[i]); }
                if (Math.abs(y - r.y(i)) > 1) ecartProfil++;
                if (i > 0 && ym[i - 1] != Integer.MIN_VALUE && Math.abs(y - ym[i - 1]) > 1) marches++;
                // 0.5.6 : pente sur au moins 8 blocs d'abscisse reelle (dans les virages serres, 4 echantillons < 8 blocs)
                int j8 = Math.max(0, i - 4);
                while (j8 > 0 && r.abs[i] - r.abs[j8] < 8.0) j8--;
                if (i >= 4 && r.abs[i] - r.abs[j8] >= 8.0 && ym[j8] != Integer.MIN_VALUE) {
                    double pe = Math.abs(y - ym[j8]) / (r.abs[i] - r.abs[j8]);
                    if (pe > penteMax) { penteMax = pe; iPente = i; }
                }
                if (e.larg[i] >= 0) { lmin = Math.min(lmin, e.larg[i]); lmax = Math.max(lmax, e.larg[i]); lsom += e.larg[i]; ln++; }
                encombres += e.enc[i]; mesuresBas += e.mes[i];
            }
            sb.append(String.format("%s : %d releves sur %.0f blocs d'axe%n", r.nom, m, r.abs[m - 1]));
            sb.append(String.format("   releves non mesures (chunks jamais charges) : %d%n", absents));
            sb.append(String.format("   trous (surface qui n'est pas de la chaussee sur l'axe) : %d (%.2f %%)%s%n", trous, 100.0 * trous / Math.max(1, m - absents), listeTrous));
            sb.append(String.format("   marches de plus d'un bloc entre deux releves voisins (2 blocs) : %d%n", marches));
            sb.append(String.format("   pente max mesuree sur 8 blocs : %.3f (1 pour %.1f) vers %d, %d ; profil vise %.3f%n", penteMax, penteMax > 0 ? 1 / penteMax : 0, (int) r.ax[iPente], (int) r.az[iPente], r.penteMax));
            sb.append(String.format("   ecart de plus d'un bloc avec le profil calcule : %d releves%n", ecartProfil));
            sb.append(String.format("   largeur reelle de chaussee : min %d, moyenne %.1f, max %d (visee %d)%n", lmin, lsom / (double) Math.max(1, ln), lmax, 2 * r.demiLargeur + 1));
            int i0 = -1;
            for (int i = 0; i <= m; i++) {
                boolean d = i < m && r.droit[i];
                if (d && i0 < 0) i0 = i;
                if (!d && i0 >= 0) {
                    int mn = Integer.MAX_VALUE, mx = Integer.MIN_VALUE;
                    double ecart = 0;
                    double ax0 = r.ax[i0], az0 = r.az[i0], ax1 = r.ax[i - 1], az1 = r.az[i - 1], L = Math.hypot(ax1 - ax0, az1 - az0);
                    for (int j = i0; j < i; j++) {
                        if (ym[j] != Integer.MIN_VALUE) { mn = Math.min(mn, ym[j]); mx = Math.max(mx, ym[j]); }
                        ecart = Math.max(ecart, Math.abs((r.ax[j] - ax0) * (az1 - az0) - (r.az[j] - az0) * (ax1 - ax0)) / L);
                    }
                    sb.append(String.format("   TRONCON DROIT %d,%d -> %d,%d : %.0f blocs, Y %d..%d (denivele %d), ecart a la droite %.2f bloc%n",
                            (int) ax0, (int) az0, (int) ax1, (int) az1, L, mn, mx, mx - mn, ecart));
                    i0 = -1;
                }
            }
            for (Object[] pt : r.ponts) {
                int n0 = (Integer) pt[4], n1 = (Integer) pt[5];
                int amin = Integer.MAX_VALUE, amax = -1, nm = 0, surEau = 0; long asom = 0;
                StringBuilder det = new StringBuilder();
                for (int j = n0; j <= n1; j++) {
                    if (e.air[j] < 0) continue;
                    nm++; amin = Math.min(amin, e.air[j]); amax = Math.max(amax, e.air[j]); asom += e.air[j];
                    if (e.dessous[j] != null && e.dessous[j].startsWith("eau:")) surEau++;
                    if ((j - n0) % 5 == 0) det.append(String.format(" %d,%d:Y%d/air%d/%s", (int) r.ax[j], (int) r.az[j], ym[j], e.air[j], e.dessous[j]));
                }
                sb.append(String.format("   PONT %s (tablier vise Y %s, %d releves) : %d mesures, air sous la dalle a l'axe min %s / moy %.1f / max %d, %d au-dessus de l'eau%n     detail (1 sur 5) :%s%n",
                        pt[0], pt[3], n1 - n0 + 1, nm, nm > 0 ? String.valueOf(amin) : "-", nm > 0 ? asom / (double) nm : 0, amax, surEau, det));
            }
            sb.append(String.format("   bas-cotes des troncons droits encombres (de 1 a 6 blocs au-dessus) : %d / %d colonnes%n", encombres, mesuresBas));
            int milieuDroit = -1;
            for (int i = 0; i < m; i++) if (r.droit[i]) { milieuDroit = i; }
            int premierDroit = -1;
            for (int i = 0; i < m; i++) if (r.droit[i]) { premierDroit = i; break; }
            int[] cibles = {0, premierDroit >= 0 ? (premierDroit + milieuDroit) / 2 : m / 4, iPente, m / 2, m - 1};
            String[] noms = {"debut", "troncon-droit", "pente-max", "milieu", "fin"};
            for (int k = 0; k < cibles.length; k++) {
                int cx = (int) r.ax[cibles[k]], cz = (int) r.az[cibles[k]];
                BufferedImage im = new BufferedImage(160, 160, BufferedImage.TYPE_INT_RGB);
                for (int j = 0; j < 160; j++) for (int i = 0; i < 160; i++) {
                    int x = cx - 80 + i, z = cz - 80 + j;
                    int[] col = COULEURS.get(ChunkPos.asLong(x >> 4, z >> 4));
                    im.setRGB(i, j, col == null ? 0x101010 : col[(z & 15) * 16 + (x & 15)]);
                }
                ImageIO.write(im, "png", dossier.resolve("route-" + r.nom + "-" + noms[k] + ".png").toFile());
                sb.append(String.format("   zoom %s : 160 x 160 blocs autour de %d, %d%n", noms[k], cx, cz));
            }
        }
        sb.append("   ").append(Finition.bilan()).append(" (ce lancement)%n".formatted());
        if (troncon > 0) sb.append(String.format("(assemble a partir de %d troncons, un lancement de serveur chacun)%n", troncons));
        Tests.ecrireRapport(c, "rapport-routes.txt", sb.toString());
        CarteIle.LOG.info("[atheria_ile] validation des routes ecrite : rapport-routes.txt");
        BESOIN.clear(); COULEURS.clear();
    }

    /** mesures et couleurs du troncon k, pour l'assemblage au dernier troncon */
    private static void sauver(Path rendus, int k) throws Exception {
        StringBuilder sb = new StringBuilder();
        for (Etat e : ETATS) for (int i = 0; i < e.m; i++) {
            if (e.ym[i] == Integer.MIN_VALUE) continue;
            sb.append(e.r.nom).append('\t').append(i).append('\t').append(e.ym[i]).append('\t').append(e.larg[i]).append('\t').append(e.enc[i]).append('\t').append(e.mes[i])
              .append('\t').append(e.trou[i] ? 1 : 0).append('\t').append(e.trouTexte[i] == null ? "" : e.trouTexte[i].trim())
              .append('\t').append(e.air[i]).append('\t').append(e.dessous[i] == null ? "" : e.dessous[i]).append('\n');
        }
        Files.writeString(rendus.resolve("releves-t" + k + ".tsv"), sb.toString());
        try (java.io.DataOutputStream o = new java.io.DataOutputStream(new java.io.BufferedOutputStream(Files.newOutputStream(rendus.resolve("couleurs-t" + k + ".bin"))))) {
            o.writeInt(COULEURS.size());
            for (Map.Entry<Long, int[]> en : COULEURS.entrySet()) { o.writeLong(en.getKey()); for (int v : en.getValue()) o.writeInt(v); }
        }
    }

    private static void charger(Path rendus, int k) throws Exception {
        Path f = rendus.resolve("releves-t" + k + ".tsv");
        if (!Files.exists(f)) { CarteIle.LOG.warn("[atheria_ile] troncon {} absent : {}", k, f); return; }
        for (String l : Files.readAllLines(f)) {
            if (l.isBlank()) continue;
            String[] t = l.split("\t", -1);
            for (Etat e : ETATS) if (e.r.nom.equals(t[0])) {
                int i = Integer.parseInt(t[1]);
                if (i < 0 || i >= e.m || e.ym[i] != Integer.MIN_VALUE) continue;
                e.ym[i] = Integer.parseInt(t[2]); e.larg[i] = Integer.parseInt(t[3]); e.enc[i] = Integer.parseInt(t[4]); e.mes[i] = Integer.parseInt(t[5]);
                e.trou[i] = "1".equals(t[6]); e.trouTexte[i] = t[7].isEmpty() ? null : " " + t[7];
                if (t.length > 9) { e.air[i] = Integer.parseInt(t[8]); e.dessous[i] = t[9].isEmpty() ? null : t[9]; }
            }
        }
        Path b = rendus.resolve("couleurs-t" + k + ".bin");
        if (Files.exists(b)) try (java.io.DataInputStream in = new java.io.DataInputStream(new java.io.BufferedInputStream(Files.newInputStream(b)))) {
            int nb = in.readInt();
            for (int q = 0; q < nb; q++) { long cle = in.readLong(); int[] col = new int[256]; for (int j = 0; j < 256; j++) col[j] = in.readInt(); COULEURS.putIfAbsent(cle, col); }
        }
        CarteIle.LOG.info("[atheria_ile] troncon {} recharge pour l'assemblage", k);
    }
}
