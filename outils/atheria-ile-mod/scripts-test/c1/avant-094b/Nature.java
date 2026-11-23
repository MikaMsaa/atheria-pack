package fr.atheria.ile;

import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.core.Holder;
import net.minecraft.tags.BlockTags;
import net.minecraft.util.RandomSource;
import net.minecraft.world.level.WorldGenLevel;
import net.minecraft.world.level.biome.Biome;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.FenceBlock;
import net.minecraft.world.level.block.RotatedPillarBlock;
import net.minecraft.world.level.block.SlabBlock;
import net.minecraft.world.level.block.StairBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.SlabType;
import net.minecraft.world.level.levelgen.Heightmap;

/**
 * 0.9.4 : sols en taches par type de region et debris post-apo rares, en pleine nature seulement
 * (appele par DetailsFeature, donc jamais dans un chunk exclu ni a moins de 96 blocs d'une zone protegee : RN1, lots, villes, volumes).
 * Tout reste dans le chunk courant. Graines separees de celles des details. Rien de religieux (poteaux a un seul bras).
 */
final class Nature {
    private Nature() {}

    private static String biome(WorldGenLevel n, BlockPos p) {
        Holder<Biome> b = n.getBiome(p);
        return b.unwrapKey().map(k -> k.location().getPath()).orElse("");
    }

    /** 0 sec (savane, brousse, desert, badlands), 1 humide (jungle, marais, mangrove, foret), 2 montagne (pins, plateaux, hauts), 3 autre */
    private static int typeRegion(String id) {
        if (id.contains("savanna") || id.contains("shrub") || id.contains("desert") || id.contains("dry") || id.contains("badlands") || id.contains("arid") || id.contains("steppe") || id.contains("ash")) return 0;
        if (id.contains("jungle") || id.contains("swamp") || id.contains("marsh") || id.contains("mangrove") || id.contains("bayou") || id.contains("rainforest") || id.contains("forest") || id.contains("moss")) return 1;
        if (id.contains("pine") || id.contains("taiga") || id.contains("highland") || id.contains("plateau") || id.contains("peak") || id.contains("mountain") || id.contains("alpine") || id.contains("slope")) return 2;
        return 3;
    }

    private static boolean solMeuble(BlockState s) {
        return s.is(Blocks.GRASS_BLOCK) || s.is(Blocks.DIRT) || s.is(Blocks.COARSE_DIRT) || s.is(Blocks.PODZOL) || s.is(Blocks.ROOTED_DIRT);
    }

    /** taches de sol coherentes d'un chunk a l'autre (bruit), matiere selon le type de region et un second bruit */
    static boolean sols(CarteIle c, WorldGenLevel n, int x0, int z0, int mer) {
        BlockPos.MutableBlockPos p = new BlockPos.MutableBlockPos();
        int type = typeRegion(biome(n, p.set(x0 + 8, mer + 4, z0 + 8)));
        double seuil = 1.05 - 0.55 * c.rnSols;
        boolean pose = false;
        RandomSource r = RandomSource.create(c.graineNature(x0 >> 4, z0 >> 4, 11));
        for (int z = z0; z < z0 + 16; z++) for (int x = x0; x < x0 + 16; x++) {
            double q = c.bruit(x / 19.0, z / 19.0, 461) + 0.45 * c.bruit(x / 7.0, z / 7.0, 462) + 0.12 * c.bruit(x / 2.5, z / 2.5, 463);
            if (q < seuil) continue;
            int y = n.getHeight(Heightmap.Types.OCEAN_FLOOR_WG, x, z) - 1;
            if (y <= mer) continue;
            p.set(x, y, z);
            BlockState s = n.getBlockState(p);
            if (!solMeuble(s) || !n.getFluidState(p.above()).isEmpty()) continue;
            double m = c.bruit(x / 13.0, z / 13.0, 464);
            BlockState b;
            switch (type) {
                case 0 -> b = m < -0.2 ? Blocks.COARSE_DIRT.defaultBlockState() : m < 0.35 ? Blocks.ROOTED_DIRT.defaultBlockState() : Blocks.GRAVEL.defaultBlockState();
                case 1 -> b = m < -0.15 ? Blocks.MOSS_BLOCK.defaultBlockState() : m < 0.4 ? Blocks.PODZOL.defaultBlockState() : Blocks.COARSE_DIRT.defaultBlockState();
                case 2 -> b = m < -0.1 ? Blocks.GRAVEL.defaultBlockState() : m < 0.45 ? Blocks.PODZOL.defaultBlockState() : Blocks.COARSE_DIRT.defaultBlockState();
                default -> b = m < -0.25 ? Blocks.COARSE_DIRT.defaultBlockState() : m < 0.3 ? Blocks.PODZOL.defaultBlockState() : Blocks.MOSS_BLOCK.defaultBlockState();
            }
            n.setBlock(p, b, 2);
            pose = true;
            BlockPos h = p.above();
            BlockState hs = n.getBlockState(h);
            if (b.is(Blocks.GRAVEL)) { if (!hs.isAir() && hs.canBeReplaced() && n.getFluidState(h).isEmpty()) n.setBlock(h, Blocks.AIR.defaultBlockState(), 2); }
            else if (type == 0 && hs.isAir() && r.nextInt(9) == 0) n.setBlock(h, Blocks.DEAD_BUSH.defaultBlockState(), 2);   // herbe seche
        }
        return pose;
    }

    private static boolean libre(WorldGenLevel n, BlockPos q) {
        BlockState s = n.getBlockState(q);
        return (s.isAir() || s.canBeReplaced()) && n.getFluidState(q).isEmpty();
    }

    /** sol a plat (meme Y, sol meuble ou pierre, pas d'eau) sur les colonnes donnees ; Y du dessus du sol ou MIN_VALUE */
    private static int plat(WorldGenLevel n, int x0, int z0, int[][] cols, int mer) {
        int y0 = Integer.MIN_VALUE;
        for (int[] q : cols) {
            int x = x0 + q[0], z = z0 + q[1];
            if ((x >> 4) != (x0 >> 4) || (z >> 4) != (z0 >> 4)) return Integer.MIN_VALUE;
            int y = n.getHeight(Heightmap.Types.OCEAN_FLOOR_WG, x, z);
            if (y <= mer + 1) return Integer.MIN_VALUE;
            if (!n.getFluidState(new BlockPos(x, y, z)).isEmpty()) return Integer.MIN_VALUE;
            if (y0 == Integer.MIN_VALUE) y0 = y; else if (Math.abs(y - y0) > 1) return Integer.MIN_VALUE;
        }
        return y0;
    }

    /** debris rares : cloture cassee, poteau a un bras, epave rouillee ; au plus un par chunk */
    static boolean debris(CarteIle c, WorldGenLevel n, int x0, int z0, int mer) {
        RandomSource r = RandomSource.create(c.graineNature(x0 >> 4, z0 >> 4, 23));
        if (r.nextDouble() >= c.rnDebris) return false;
        if (c.distanceRiviere(x0 + 8, z0 + 8) < 40 || c.distanceLac(x0 + 8, z0 + 8) < 30 || c.distanceBlocs(x0 + 8, z0 + 8) < 24) return false;
        int t = r.nextInt(100);
        int x = x0 + 4 + r.nextInt(8), z = z0 + 4 + r.nextInt(8);
        if (t < 40) return cloture(n, r, x, z, mer);
        if (t < 72) return poteau(n, r, x, z, mer);
        return epave(n, r, x, z, mer);
    }

    private static boolean cloture(WorldGenLevel n, RandomSource r, int x, int z, int mer) {
        boolean axeX = r.nextBoolean();
        int lg = 4 + r.nextInt(5);
        BlockState f = (r.nextBoolean() ? Blocks.SPRUCE_FENCE : Blocks.DARK_OAK_FENCE).defaultBlockState();
        BlockPos.MutableBlockPos p = new BlockPos.MutableBlockPos();
        boolean pose = false;
        int x1 = x - (axeX ? lg / 2 : 0), z1 = z - (axeX ? 0 : lg / 2);
        BlockState prec = null;
        for (int i = 0; i < lg; i++) {
            int bx = x1 + (axeX ? i : 0), bz = z1 + (axeX ? 0 : i);
            if ((bx >> 4) != (x >> 4) || (bz >> 4) != (z >> 4)) break;
            if (r.nextInt(4) == 0) { prec = null; continue; }            // trou dans la cloture
            int y = n.getHeight(Heightmap.Types.OCEAN_FLOOR_WG, bx, bz);
            if (y <= mer + 1) { prec = null; continue; }
            p.set(bx, y, bz);
            if (!libre(n, p)) { prec = null; continue; }
            BlockState s = f;
            if (prec != null) s = s.setValue(axeX ? FenceBlock.WEST : FenceBlock.NORTH, true);
            if (i + 1 < lg) s = s.setValue(axeX ? FenceBlock.EAST : FenceBlock.SOUTH, true);
            n.setBlock(p, s, 2); pose = true;
            if (r.nextInt(3) == 0) { p.move(0, 1, 0); if (libre(n, p)) n.setBlock(p, f, 2); }   // piquet plus haut
            prec = s;
        }
        // planche tombee a cote
        if (pose && r.nextBoolean()) {
            int bx = x + (axeX ? 0 : 1), bz = z + (axeX ? 1 : 0);
            if ((bx >> 4) == (x >> 4) && (bz >> 4) == (z >> 4)) {
                int y = n.getHeight(Heightmap.Types.OCEAN_FLOOR_WG, bx, bz);
                p.set(bx, y, bz);
                if (y > mer + 1 && libre(n, p)) n.setBlock(p, Blocks.SPRUCE_SLAB.defaultBlockState().setValue(SlabBlock.TYPE, SlabType.BOTTOM), 2);
            }
        }
        return pose;
    }

    private static boolean poteau(WorldGenLevel n, RandomSource r, int x, int z, int mer) {
        int y = plat(n, x, z, new int[][]{{0, 0}}, mer);
        if (y == Integer.MIN_VALUE) return false;
        BlockPos.MutableBlockPos p = new BlockPos.MutableBlockPos();
        boolean penche = r.nextInt(3) == 0;
        int h = penche ? 3 + r.nextInt(2) : 5 + r.nextInt(3);
        BlockState bois = Blocks.STRIPPED_SPRUCE_LOG.defaultBlockState();
        for (int k = 0; k < h; k++) { p.set(x, y + k, z); if (!libre(n, p)) return k > 0; n.setBlock(p, bois, 2); }
        // un seul bras, d'un seul cote (jamais en croix), cable pendant
        Direction d = Direction.Plane.HORIZONTAL.getRandomDirection(r);
        p.set(x + d.getStepX(), y + h - 1, z + d.getStepZ());
        if (!penche && (p.getX() >> 4) == (x >> 4) && (p.getZ() >> 4) == (z >> 4) && libre(n, p)) {
            n.setBlock(p, Blocks.STRIPPED_SPRUCE_LOG.defaultBlockState().setValue(RotatedPillarBlock.AXIS, d.getAxis()), 2);
            p.move(0, -1, 0);
            if (libre(n, p)) n.setBlock(p, Blocks.CHAIN.defaultBlockState(), 2);
        }
        if (penche) {
            // poteau casse : le haut tombe au sol a cote
            p.set(x + d.getStepX(), n.getHeight(Heightmap.Types.OCEAN_FLOOR_WG, x + d.getStepX(), z + d.getStepZ()), z + d.getStepZ());
            for (int k = 0; k < 3; k++) {
                if ((p.getX() >> 4) != (x >> 4) || (p.getZ() >> 4) != (z >> 4) || !libre(n, p)) break;
                n.setBlock(p, bois.setValue(RotatedPillarBlock.AXIS, d.getAxis()), 2);
                p.move(d);
                p.setY(n.getHeight(Heightmap.Types.OCEAN_FLOOR_WG, p.getX(), p.getZ()));
            }
        }
        return true;
    }

    private static boolean epave(WorldGenLevel n, RandomSource r, int x, int z, int mer) {
        boolean axeX = r.nextBoolean();
        int[][] cols = new int[8][];
        int i = 0;
        for (int a = 0; a < 4; a++) for (int b = 0; b < 2; b++) cols[i++] = axeX ? new int[]{a, b} : new int[]{b, a};
        int y = plat(n, x, z, cols, mer);
        if (y == Integer.MIN_VALUE) return false;
        BlockPos.MutableBlockPos p = new BlockPos.MutableBlockPos();
        for (int[] q : cols) { p.set(x + q[0], y, z + q[1]); if (!libre(n, p)) return false; }
        BlockState caisse = (r.nextBoolean() ? Blocks.WEATHERED_CUT_COPPER : Blocks.OXIDIZED_CUT_COPPER).defaultBlockState();
        BlockState toit = (r.nextBoolean() ? Blocks.WEATHERED_CUT_COPPER_SLAB : Blocks.EXPOSED_CUT_COPPER_SLAB).defaultBlockState();
        Direction avant = axeX ? Direction.EAST : Direction.SOUTH;
        for (int[] q : cols) {
            int a = axeX ? q[0] : q[1];
            p.set(x + q[0], y, z + q[1]);
            // roues : coins avant et arriere, en charbon (pneus) ; caisse rouillee ; une roue manquante parfois
            boolean roue = (a == 0 || a == 3);
            if (roue) { if (r.nextInt(4) != 0) n.setBlock(p, Blocks.COAL_BLOCK.defaultBlockState(), 2); }
            else n.setBlock(p, caisse, 2);
            p.move(0, 1, 0);
            if (a == 3) n.setBlock(p, Blocks.WEATHERED_CUT_COPPER_STAIRS.defaultBlockState().setValue(StairBlock.FACING, avant.getOpposite()), 2);   // capot
            else if (a == 0) n.setBlock(p, caisse, 2);
            else if (r.nextInt(3) != 0) n.setBlock(p, toit, 2);                        // toit creve
            if (r.nextInt(4) == 0) { p.move(0, 1, 0); if (libre(n, p)) n.setBlock(p, Blocks.MOSS_CARPET.defaultBlockState(), 2); }
        }
        // vegetation qui reprend : herbes hautes autour
        for (int k = 0; k < 4; k++) {
            int bx = x - 1 + r.nextInt(axeX ? 6 : 4), bz = z - 1 + r.nextInt(axeX ? 4 : 6);
            if ((bx >> 4) != (x >> 4) || (bz >> 4) != (z >> 4)) continue;
            int yy = n.getHeight(Heightmap.Types.OCEAN_FLOOR_WG, bx, bz);
            p.set(bx, yy - 1, bz);
            if (!n.getBlockState(p).is(Blocks.GRASS_BLOCK)) continue;
            p.move(0, 1, 0);
            if (libre(n, p)) n.setBlock(p, Blocks.SHORT_GRASS.defaultBlockState(), 2);
        }
        return true;
    }
}
