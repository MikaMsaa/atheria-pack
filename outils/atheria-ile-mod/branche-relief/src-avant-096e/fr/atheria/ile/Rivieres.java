package fr.atheria.ile;

import net.minecraft.core.BlockPos;
import net.minecraft.tags.BlockTags;
import net.minecraft.world.level.LevelHeightAccessor;
import net.minecraft.world.level.WorldGenLevel;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.chunk.ChunkGenerator;
import net.minecraft.world.level.levelgen.Heightmap;
import net.minecraft.world.level.levelgen.RandomState;

/**
 * 0.5.6 : eau des rivieres et lacs dessines, posee dans le chunk (debut de la feature de l'ile, avant les routes).
 * Le relief seul laissait le lit a Y 62-63, sec (l'aquifere des terres ne le remplit pas).
 * Niveau d'eau local L par pixel de riviere/lac : max(mer, sol naturel le plus bas des pixels d'eau voisins) ;
 * il ne depend que de la grille de la carte (meme resultat quel que soit le chunk). Lit a L-3 au coeur
 * (|d| <= 6 blocs), berges en pente douce jusqu'a L+2, anneau de berge remonte a L+1 si le sol est plus bas
 * (au plus 4 blocs), sources d'eau jusqu'a L. Entre deux pixels de niveaux differents : petite cascade.
 * Cache borne : un short par pixel de la carte, alloue une fois.
 */
final class Rivieres {
    private Rivieres() {}

    static final int LIT = 6, BERGE = 18, ANNEAU = 24, CREUSE_MAX = 12, REMBLAI_MAX = 4;
    private static final short INCONNU = Short.MIN_VALUE;
    private static volatile short[] solPixel;
    private static volatile CarteIle carteCache;

    private static final BlockState AIR = Blocks.AIR.defaultBlockState();
    private static final BlockState EAU = Blocks.WATER.defaultBlockState();
    private static final BlockState GRAVIER = Blocks.GRAVEL.defaultBlockState();
    private static final BlockState SABLE = Blocks.SAND.defaultBlockState();
    private static final BlockState TERRE = Blocks.DIRT.defaultBlockState();
    private static final BlockState HERBE = Blocks.GRASS_BLOCK.defaultBlockState();

    private static boolean eauPx(CarteIle c, int ip) { return c.dRiviere[ip] < 0.5f || c.dLac[ip] < 0.5f; }

    /** sol naturel (Y du dessus du sol) au centre du pixel, calcule une fois */
    private static int sol(CarteIle c, int ip, ChunkGenerator gen, LevelHeightAccessor h, RandomState rs) {
        short[] t = solPixel;
        if (t == null || carteCache != c) {
            synchronized (Rivieres.class) {
                if (solPixel == null || carteCache != c) { short[] n = new short[c.w * c.h]; java.util.Arrays.fill(n, INCONNU); solPixel = n; carteCache = c; }
                t = solPixel;
            }
        }
        short v = t[ip];
        if (v == INCONNU) {
            int px = ip % c.w, pz = ip / c.w;
            int bx = (int) Math.floor(c.origineX + (px + 0.5) * c.bpp), bz = (int) Math.floor(c.origineZ + (pz + 0.5) * c.bpp);
            v = (short) (gen.getBaseHeight(bx, bz, Heightmap.Types.OCEAN_FLOOR_WG, h, rs) - 1);
            t[ip] = v;
        }
        return v;
    }

    /** niveau d'eau du pixel d'eau ip : mer, ou le sol le plus bas des pixels d'eau du voisinage 3 x 3 */
    private static int niveau(CarteIle c, int ip, int mer, ChunkGenerator gen, LevelHeightAccessor h, RandomState rs) {
        int px = ip % c.w, pz = ip / c.w, m = Integer.MAX_VALUE;
        for (int dz = -1; dz <= 1; dz++) for (int dx = -1; dx <= 1; dx++) {
            int x = px + dx, z = pz + dz;
            if (x < 0 || z < 0 || x >= c.w || z >= c.h) continue;
            int j = z * c.w + x;
            if (eauPx(c, j)) m = Math.min(m, sol(c, j, gen, h, rs));
        }
        return Math.max(mer, m);
    }

    private static boolean vegetal(BlockState s) {
        return s.isAir() || s.is(BlockTags.LEAVES) || s.is(BlockTags.LOGS) || s.canBeReplaced() || s.is(BlockTags.FLOWERS)
                || s.is(BlockTags.SAPLINGS) || s.getBlock() instanceof net.minecraft.world.level.block.BushBlock || s.is(Blocks.SNOW);
    }

    private static boolean fondMeuble(BlockState s) {
        return s.is(BlockTags.SAND) || s.is(Blocks.GRAVEL) || s.is(Blocks.DIRT) || s.is(Blocks.CLAY) || s.is(Blocks.MUD) || s.is(Blocks.COARSE_DIRT);
    }

    /**
     * 0.9.4f berges douces (nature seulement, poids forceNaturel). Avant la pose de l'eau, colonne par colonne, sans lire
     * les colonnes voisines (meme resultat quel que soit l'ordre des chunks). La hauteur au-dessus du niveau local L sert
     * d'estimation de la distance au bord (berges d'origine ~1 bloc par bloc) : sur les W premiers blocs (3..rnBerges,
     * bruit a part) le terrain est ramene a 0,35 de sa hauteur, puis rejoint le terrain d'origine en 5 blocs. Sous l'eau,
     * meme profil sur la profondeur : marge peu profonde ou les bancs de sable affleurent. Jamais d'emersion (profondeur
     * >= 1), jamais d'inondation (hauteur >= 1), chenal intact (|d| <= LIT + 6), colonnes a tronc d'arbre laissees.
     */
    private static boolean berge(WorldGenLevel n, CarteIle c, int bx, int bz, ChunkGenerator gen, RandomState rs, int mer, BlockPos.MutableBlockPos p, int bas) {
        double dr = c.distanceRiviere(bx, bz), dl = c.distanceLac(bx, bz);
        double wR = dr > LIT + 6 ? CarteIle.lisse(ANNEAU + 12, ANNEAU + 2, dr) * CarteIle.lisse(LIT + 6, LIT + 10, dr) : 0;
        double wL = CarteIle.lisse(16, 8, dl);
        double w = Math.max(wR, wL);
        if (w <= 0) return false;
        w *= c.forceNaturel(bx, bz);
        if (w < 0.02) return false;
        // pixel d'eau le plus proche (fenetre +-4 px) -> niveau local, comme la pose de l'eau
        double fpx = (bx + 0.5 - c.origineX) / c.bpp, fpz = (bz + 0.5 - c.origineZ) / c.bpp;
        int cpx = (int) Math.floor(fpx), cpz = (int) Math.floor(fpz), best = -1;
        double bd = Double.MAX_VALUE;
        for (int dz = -4; dz <= 4; dz++) for (int dx = -4; dx <= 4; dx++) {
            int x = cpx + dx, z = cpz + dz;
            if (x < 0 || z < 0 || x >= c.w || z >= c.h) continue;
            int j = z * c.w + x;
            if (!eauPx(c, j)) continue;
            double ex = x + 0.5 - fpx, ez = z + 0.5 - fpz, d2 = ex * ex + ez * ez;
            if (d2 < bd) { bd = d2; best = j; }
        }
        if (best < 0) return false;
        int L = niveau(c, best, mer, gen, n, rs);
        int haut = Math.min(n.getMaxBuildHeight() - 1, n.getHeight(Heightmap.Types.WORLD_SURFACE_WG, bx, bz) + 1);
        int top = bas;
        boolean tronc = false;
        int eauHaut = bas;
        for (int y = haut; y > bas; y--) {
            BlockState s = n.getBlockState(p.set(bx, y, bz));
            if (s.is(BlockTags.LOGS)) tronc = true;
            if (eauHaut == bas && s.getFluidState().isSource() && s.getFluidState().is(net.minecraft.tags.FluidTags.WATER)) eauHaut = y;
            if (!s.getFluidState().isEmpty() || vegetal(s)) continue;
            top = y; break;
        }
        if (top <= bas) return false;
        double W = 3 + (c.rnBerges - 3) * (0.5 + 0.5 * c.bruit(bx / 23.0, bz / 23.0, 4901));
        // sous l'eau : profondeur mesuree sous la vraie surface (la mer s'arrete a Y mer - 1, pas a L)
        int base = top < L && eauHaut > top ? Math.min(L, eauHaut) : L;
        int e = top - base;                                // > 0 : hauteur au-dessus de l'eau ; < 0 : profondeur
        int a = Math.abs(e);
        if (a < 1 || a >= W + 5) return false;
        double cible = a <= W ? 0.35 * a : 0.35 * W + (a - W) * (W + 5 - 0.35 * W) / 5.0;
        int na = Math.max(1, (int) Math.round(a - w * (a - cible)));
        // anneau de berge de la pose de l'eau : un fond a moins de 4 blocs de L+1 y serait remblaye jusqu'a L+1 (terre emergee)
        if (e < 0 && dr > BERGE - 3 && dr <= ANNEAU + 0.5) na = Math.max(na, base - (L - REMBLAI_MAX));
        if (na >= a) return false;
        if (e < 0 && c.distanceBlocs(bx, bz) <= 0) return false;      // sous l'eau : terre de la carte seulement (pas la mer)
        if (e > 0) {
            if (tronc || n.getBlockState(p.set(bx, top + 1, bz)).is(BlockTags.LEAVES)) return false;
            int nt = L + na;
            BlockState dessus = n.getBlockState(p.set(bx, top, bz));
            BlockState v1 = n.getBlockState(p.set(bx, top + 1, bz)), v2 = n.getBlockState(p.set(bx, top + 2, bz));
            boolean plante = !v1.isAir() && v1.getFluidState().isEmpty() && vegetal(v1) && !v1.is(BlockTags.LEAVES) && !v1.is(Blocks.SNOW);
            for (int y = top + 2; y > nt; y--) {
                BlockState s = n.getBlockState(p.set(bx, y, bz));
                if (y > top && (s.is(BlockTags.LEAVES) || !vegetal(s))) continue;
                if (!s.isAir()) n.setBlock(p, AIR, 2);
            }
            n.setBlock(p.set(bx, nt, bz), dessus, 2);
            if (plante) {
                n.setBlock(p.set(bx, nt + 1, bz), v1, 2);
                if (!v2.isAir() && vegetal(v2) && !v2.is(BlockTags.LEAVES)) n.setBlock(p.set(bx, nt + 2, bz), v2, 2);
            }
        } else {
            int nf = base - na;
            BlockState fond = n.getBlockState(p.set(bx, top, bz));
            BlockState mat = fond.is(Blocks.GRASS_BLOCK) || fond.is(Blocks.PODZOL) || fond.is(Blocks.MYCELIUM) ? TERRE : fondMeuble(fond) ? fond : GRAVIER;
            if (mat != fond) n.setBlock(p, mat, 2);
            for (int y = top + 1; y <= nf; y++) n.setBlock(p.set(bx, y, bz), mat, 2);
            for (int y = nf + 1; y <= base; y++) {
                BlockState s = n.getBlockState(p.set(bx, y, bz));
                if (s.is(Blocks.TALL_SEAGRASS) || s.is(Blocks.KELP) || s.is(Blocks.KELP_PLANT)) n.setBlock(p, EAU, 2);
            }
        }
        return true;
    }

    /** pose l'eau dans les colonnes du chunk x0,z0 ; vrai si quelque chose a ete pose */
    static boolean poser(WorldGenLevel n, CarteIle c, int x0, int z0, ChunkGenerator gen, RandomState rs, int mer) {
        if (c.pixelsRiviere == 0 && c.pixelsLac == 0) return false;
        double proche = Math.min(c.distanceRiviere(x0 + 8, z0 + 8), c.distanceLac(x0 + 8, z0 + 8));
        if (proche > Math.max(c.rnDelta > 0 ? ANNEAU * 2.5 : ANNEAU, c.rnBerges > 0 ? ANNEAU + 12 : 0) + 12) return false;
        boolean pose = false;
        BlockPos.MutableBlockPos p = new BlockPos.MutableBlockPos();
        int bas = n.getMinBuildHeight();
        if (c.rnBerges > 0) for (int bz = z0; bz < z0 + 16; bz++) for (int bx = x0; bx < x0 + 16; bx++) pose |= berge(n, c, bx, bz, gen, rs, mer, p, bas);
        for (int bz = z0; bz < z0 + 16; bz++) for (int bx = x0; bx < x0 + 16; bx++) {
            double dr = c.distanceRiviere(bx, bz), dl = c.distanceLac(bx, bz);
            double fN = (c.rnDelta > 0 || c.rnBancs > 0) && dr <= ANNEAU * 2.5 ? c.forceNaturel(bx, bz) : 0;
            double ouv = 0;
            if (fN > 0 && c.rnDelta > 0) {
                // 0.9.4 delta : le lit s'elargit (jusqu'a x2,5) en approchant de la mer
                double dc = c.distanceBlocs(bx, bz);
                if (dc < c.rnDelta) { ouv = fN * CarteIle.lisse(c.rnDelta, 0, dc); dr /= 1 + 1.5 * ouv; }
            }
            if (dr > ANNEAU && dl > 3) continue;
            // pixel d'eau le plus proche (fenetre +-2 px) -> niveau local
            double fpx = (bx + 0.5 - c.origineX) / c.bpp, fpz = (bz + 0.5 - c.origineZ) / c.bpp;
            int cpx = (int) Math.floor(fpx), cpz = (int) Math.floor(fpz), best = -1;
            double bd = Double.MAX_VALUE;
            for (int dz = -2; dz <= 2; dz++) for (int dx = -2; dx <= 2; dx++) {
                int x = cpx + dx, z = cpz + dz;
                if (x < 0 || z < 0 || x >= c.w || z >= c.h) continue;
                int j = z * c.w + x;
                if (!eauPx(c, j)) continue;
                double ex = x + 0.5 - fpx, ez = z + 0.5 - fpz, d2 = ex * ex + ez * ez;
                if (d2 < bd) { bd = d2; best = j; }
            }
            if (best < 0) continue;
            boolean lac = c.dLac[best] < 0.5f && !(c.dRiviere[best] < 0.5f);
            int L = niveau(c, best, mer, gen, n, rs);
            // dessus du sol reel (sans vegetation ni fluide)
            int haut = Math.min(n.getMaxBuildHeight() - 1, n.getHeight(Heightmap.Types.WORLD_SURFACE_WG, bx, bz) + 1);
            int top = bas;
            for (int y = haut; y > bas; y--) {
                BlockState s = n.getBlockState(p.set(bx, y, bz));
                if (!s.getFluidState().isEmpty() || vegetal(s)) continue;
                top = y; break;
            }
            if (top <= bas) continue;
            // 0.9.4b : les bancs de sable ne sont plus poses dans le lit (Nature.bancs, sur les marges peu profondes)
            final boolean banc = false;
            int cible;
            if (banc) cible = L;
            else if (lac) cible = Math.min(top, L - 1);            // lac : on ne creuse que ce qui depasse
            else if (dr <= LIT) cible = L - 3;
            else if (dr <= BERGE) cible = L - 3 + (int) Math.round(5.0 * (dr - LIT) / (BERGE - LIT));
            else cible = L + 1;
            int nouveau = top;
            if (top > cible && top - cible <= CREUSE_MAX && (lac || dr <= BERGE)) {
                for (int y = Math.min(haut, top + 24); y > cible; y--) {
                    BlockState s = n.getBlockState(p.set(bx, y, bz));
                    if (!s.isAir()) n.setBlock(p, AIR, 2);
                }
                nouveau = cible;
                n.setBlock(p.set(bx, cible, bz), banc ? SABLE : cible < L ? (dr <= LIT ? GRAVIER : SABLE) : HERBE, 2);
                pose = true;
            } else if (banc && top < L && L - top <= REMBLAI_MAX) {
                for (int y = top + 1; y <= L; y++) n.setBlock(p.set(bx, y, bz), SABLE, 2);
                nouveau = L;
                pose = true;
            } else if (!lac && dr > BERGE - 3 && top < L + 1 && L + 1 - top <= REMBLAI_MAX) {
                // anneau de berge : retient l'eau
                for (int y = top + 1; y <= L + 1; y++) n.setBlock(p.set(bx, y, bz), y == L + 1 ? HERBE : TERRE, 2);
                nouveau = L + 1;
                pose = true;
            }
            if (nouveau < L) {
                BlockState fond = n.getBlockState(p.set(bx, nouveau, bz));
                if (fond.is(Blocks.GRASS_BLOCK) || fond.is(Blocks.PODZOL) || fond.is(Blocks.MYCELIUM)) n.setBlock(p, TERRE, 2);
                for (int y = nouveau + 1; y <= L; y++) {
                    BlockState s = n.getBlockState(p.set(bx, y, bz));
                    if (s.getFluidState().isEmpty() || !s.getFluidState().isSource()) n.setBlock(p, EAU, 2);
                }
                for (int y = L + 1; y <= L + 2; y++) {
                    BlockState s = n.getBlockState(p.set(bx, y, bz));
                    if (!s.isAir() && vegetal(s)) n.setBlock(p, AIR, 2);
                }
                pose = true;
            }
        }
        return pose;
    }
}
