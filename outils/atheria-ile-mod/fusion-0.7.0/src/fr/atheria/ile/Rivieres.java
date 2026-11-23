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

    /** pose l'eau dans les colonnes du chunk x0,z0 ; vrai si quelque chose a ete pose */
    static boolean poser(WorldGenLevel n, CarteIle c, int x0, int z0, ChunkGenerator gen, RandomState rs, int mer) {
        if (c.pixelsRiviere == 0 && c.pixelsLac == 0) return false;
        double proche = Math.min(c.distanceRiviere(x0 + 8, z0 + 8), c.distanceLac(x0 + 8, z0 + 8));
        if (proche > ANNEAU + 12) return false;
        boolean pose = false;
        BlockPos.MutableBlockPos p = new BlockPos.MutableBlockPos();
        int bas = n.getMinBuildHeight();
        for (int bz = z0; bz < z0 + 16; bz++) for (int bx = x0; bx < x0 + 16; bx++) {
            double dr = c.distanceRiviere(bx, bz), dl = c.distanceLac(bx, bz);
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
            int cible;
            if (lac) cible = Math.min(top, L - 1);            // lac : on ne creuse que ce qui depasse
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
                n.setBlock(p.set(bx, cible, bz), cible < L ? (dr <= LIT ? GRAVIER : SABLE) : HERBE, 2);
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
