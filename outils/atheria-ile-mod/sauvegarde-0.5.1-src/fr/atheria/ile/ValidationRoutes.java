package fr.atheria.ile;

import net.minecraft.core.BlockPos;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.chunk.LevelChunk;
import net.minecraft.world.level.levelgen.Heightmap;
import net.minecraft.world.level.material.MapColor;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.nio.file.Files;
import java.nio.file.Path;

/** Mesures sur les vrais blocs des routes generees (chunks deja charges, jamais de chargement bloquant). */
final class ValidationRoutes {
    private ValidationRoutes() {}

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

    static void mesurer(ServerLevel n, CarteIle c) throws Exception {
        StringBuilder sb = new StringBuilder("VALIDATION DES ROUTES (blocs reels, un releve tous les 2 blocs d'axe)\n");
        BlockPos.MutableBlockPos p = new BlockPos.MutableBlockPos();
        Path dossier = c.dossier.resolve("rendus");
        Files.createDirectories(dossier);
        for (Route r : c.routes) {
            int m = r.ax.length;
            if (!r.profilPret()) { sb.append(r.nom).append(" : ECHEC, la feature n'a jamais tourne (datapack sans biome_modifier ?)\n"); continue; }
            int[] ym = new int[m];
            int absents = 0, trous = 0, ecartProfil = 0, marches = 0, lmin = 999, lmax = 0, encombres = 0, mesuresBas = 0;
            long lsom = 0; int ln = 0;
            double penteMax = 0; int iPente = 0;
            StringBuilder listeTrous = new StringBuilder();
            for (int i = 0; i < m; i++) {
                int x = (int) Math.floor(r.ax[i]), z = (int) Math.floor(r.az[i]);
                int y = dessus(n, p, x, z);
                if (y == Integer.MIN_VALUE) { absents++; ym[i] = Integer.MIN_VALUE; continue; }
                ym[i] = y;
                BlockState s = etat(n, p, x, y, z);
                if (!chaussee(s)) { trous++; if (trous <= 15) listeTrous.append(String.format(" %d,%d,Y%d=%s", x, z, y, s.getBlock().getDescriptionId().replace("block.minecraft.", ""))); }
                if (Math.abs(y - r.y(i)) > 1) ecartProfil++;
                if (i > 0 && ym[i - 1] != Integer.MIN_VALUE && Math.abs(y - ym[i - 1]) > 1) marches++;
                if (i >= 4 && ym[i - 4] != Integer.MIN_VALUE) {
                    double pe = Math.abs(y - ym[i - 4]) / (r.abs[i] - r.abs[i - 4]);
                    if (pe > penteMax) { penteMax = pe; iPente = i; }
                }
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
                    lmin = Math.min(lmin, larg); lmax = Math.max(lmax, larg); lsom += larg; ln++;
                }
                // bas-cotes degages : rien de solide ni de feuillage dans les 6 blocs au-dessus, de la chaussee jusqu'a demi-largeur + bas-cotes
                if (r.droit[i] && i % 5 == 0 && i > 0 && i < m - 1) {
                    double dx = r.ax[i + 1] - r.ax[i - 1], dz = r.az[i + 1] - r.az[i - 1], l = Math.hypot(dx, dz);
                    double nx = -dz / l, nz = dx / l;
                    for (int sgn = -1; sgn <= 1; sgn += 2) for (int t = r.demiLargeur + 1; t <= r.demiLargeur + r.basCotes; t++) {
                        int xx = (int) Math.floor(r.ax[i] + sgn * nx * t), zz = (int) Math.floor(r.az[i] + sgn * nz * t);
                        mesuresBas++;
                        for (int yy = y + 1; yy <= y + 6; yy++) {
                            BlockState s2 = etat(n, p, xx, yy, zz);
                            if (s2 != null && !s2.isAir() && !s2.is(Blocks.SHORT_GRASS) && !s2.is(Blocks.TALL_GRASS)) { encombres++; break; }
                        }
                    }
                }
            }
            sb.append(String.format("%s : %d releves sur %.0f blocs d'axe%n", r.nom, m, r.abs[m - 1]));
            sb.append(String.format("   chunks non charges : %d releves%n", absents));
            sb.append(String.format("   trous (surface qui n'est pas de la chaussee sur l'axe) : %d (%.2f %%)%s%n", trous, 100.0 * trous / Math.max(1, m - absents), listeTrous));
            sb.append(String.format("   marches de plus d'un bloc entre deux releves voisins (2 blocs) : %d%n", marches));
            sb.append(String.format("   pente max mesuree sur 8 blocs : %.3f (1 pour %.1f) vers %d, %d ; profil vise %.3f%n", penteMax, penteMax > 0 ? 1 / penteMax : 0, (int) r.ax[iPente], (int) r.az[iPente], r.penteMax));
            sb.append(String.format("   ecart de plus d'un bloc avec le profil calcule : %d releves%n", ecartProfil));
            sb.append(String.format("   largeur reelle de chaussee : min %d, moyenne %.1f, max %d (visee %d)%n", lmin, lsom / (double) Math.max(1, ln), lmax, 2 * r.demiLargeur + 1));
            // troncons droits
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
            sb.append(String.format("   bas-cotes des troncons droits encombres (de 1 a 6 blocs au-dessus) : %d / %d colonnes%n", encombres, mesuresBas));
            // zooms : debut, milieu du troncon droit, pente max, fin
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
                    LevelChunk ch = chunk(n, x, z);
                    if (ch == null) { im.setRGB(i, j, 0x101010); continue; }
                    int y = ch.getHeight(Heightmap.Types.WORLD_SURFACE, x & 15, z & 15);
                    BlockState s = ch.getBlockState(p.set(x, y, z));
                    MapColor mc = s.getMapColor(n, p);
                    int col = mc == MapColor.NONE ? 0 : mc.col;
                    double ombre = 0.7 + 0.3 * Math.max(0, Math.min(1, (y - 60) / 80.0));
                    int rr = (int) (((col >> 16) & 255) * ombre), gg = (int) (((col >> 8) & 255) * ombre), bb = (int) ((col & 255) * ombre);
                    im.setRGB(i, j, (rr << 16) | (gg << 8) | bb);
                }
                ImageIO.write(im, "png", dossier.resolve("route-" + r.nom + "-" + noms[k] + ".png").toFile());
                sb.append(String.format("   zoom %s : 160 x 160 blocs autour de %d, %d%n", noms[k], cx, cz));
            }
        }
        Tests.ecrireRapport(c, "rapport-routes.txt", sb.toString());
        CarteIle.LOG.info("[atheria_ile] validation des routes ecrite : rapport-routes.txt");
    }
}
