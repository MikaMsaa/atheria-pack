package fr.atheria.ile;

import com.mojang.serialization.Codec;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Holder;
import net.minecraft.tags.BlockTags;
import net.minecraft.util.RandomSource;
import net.minecraft.world.level.WorldGenLevel;
import net.minecraft.world.level.biome.Biome;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.RotatedPillarBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.core.Direction;
import net.minecraft.world.level.levelgen.Heightmap;
import net.minecraft.world.level.levelgen.feature.Feature;
import net.minecraft.world.level.levelgen.feature.FeaturePlaceContext;
import net.minecraft.world.level.levelgen.feature.configurations.NoneFeatureConfiguration;

/**
 * 0.8.0 : details de surface de l'ile (rochers, affleurements, troncs couches, taches pierreuses, galets de plage).
 * Jamais dans les zones protegees (routes + marge, lots + marge, zones_villes, zones rectangles, volumes) ni a moins
 * de 96 blocs d'elles (forceNaturel < 1). Tout reste dans le chunk courant (x, z de 2 a 13). Matieres choisies
 * selon le sol trouve, donc coherentes avec chaque region.
 */
public final class DetailsFeature extends Feature<NoneFeatureConfiguration> {
    public DetailsFeature(Codec<NoneFeatureConfiguration> codec) { super(codec); }

    @Override
    public boolean place(FeaturePlaceContext<NoneFeatureConfiguration> ctx) {
        CarteIle c = CarteIle.active();
        if (c == null || (c.detailsDensite <= 0 && c.rnSols <= 0 && c.rnDebris <= 0 && c.rnBancs <= 0 && c.rnLagonVie <= 0 && c.sculptures.isEmpty() && c.rnVegMarges <= 0)) return false;
        WorldGenLevel n = ctx.level();
        BlockPos o = ctx.origin();
        int x0 = o.getX() & ~15, z0 = o.getZ() & ~15;
        boolean vm = c.rnVegMarges > 0 && Nature.vegetationMarges(c, n, ctx.chunkGenerator(), x0, z0);   // 0.9.6c : marges et fondus, meme dans un chunk exclu
        if (c.chunkExclu(x0 >> 4, z0 >> 4)) return vm;
        if (c.forceNaturel(x0 + 8, z0 + 8) < 0.999) return vm;
        boolean pose = vm;
        if (!c.sculptures.isEmpty()) pose |= Nature.palmiers(c, ctx.level(), ctx.chunkGenerator(), x0, z0);
        if (c.rnLagonVie > 0) pose |= Nature.lagon(c, ctx.level(), x0, z0, ctx.chunkGenerator().getSeaLevel());
        if (c.rnBancs > 0) pose |= Nature.bancs(c, ctx.level(), x0, z0, ctx.chunkGenerator().getSeaLevel());
        if (c.rnSols > 0) pose |= Nature.sols(c, ctx.level(), x0, z0, ctx.chunkGenerator().getSeaLevel());
        if (c.rnDebris > 0) pose |= Nature.debris(c, ctx.level(), x0, z0, ctx.chunkGenerator().getSeaLevel());
        if (c.detailsDensite <= 0) return pose;
        RandomSource r = RandomSource.create(c.graineDetails(x0 >> 4, z0 >> 4));
        BlockPos.MutableBlockPos p = new BlockPos.MutableBlockPos();
        int essais = (int) Math.floor(c.detailsDensite) + (r.nextDouble() < c.detailsDensite - Math.floor(c.detailsDensite) ? 1 : 0);
        for (int k = 0; k < essais; k++) {
            int x = x0 + 2 + r.nextInt(12), z = z0 + 2 + r.nextInt(12);
            int y = n.getHeight(Heightmap.Types.OCEAN_FLOOR_WG, x, z) - 1;
            p.set(x, y, z);
            BlockState sol = n.getBlockState(p);
            if (!n.getFluidState(p.above()).isEmpty()) {
                // bord de mer peu profond : galets
                if (c.distanceBlocs(x, z) > -14 && y >= ctx.chunkGenerator().getSeaLevel() - 3 && (sol.is(Blocks.SAND) || sol.is(Blocks.GRAVEL)))
                    pose |= tache(n, r, p, x, y, z, Blocks.GRAVEL.defaultBlockState(), 2 + r.nextInt(2));
                continue;
            }
            if (!n.isEmptyBlock(p.above()) && !n.getBlockState(p.above()).canBeReplaced()) continue;
            int choix = r.nextInt(100);
            BlockState roche = roche(sol, r);
            if (roche == null) continue;
            if (choix < 38) pose |= rocher(n, r, p, x, y, z, roche, sol);
            else if (choix < 58) pose |= tache(n, r, p, x, y, z, tacheSol(sol, r), 2 + r.nextInt(3));
            else if (choix < 74) pose |= affleurement(n, r, p, x, y, z, roche);
            else {
                BlockState tronc = tronc(n.getBiome(p));
                if (tronc != null && (sol.is(BlockTags.DIRT) || sol.is(Blocks.GRASS_BLOCK) || sol.is(Blocks.PODZOL))) pose |= troncCouche(n, r, p, x, y, z, tronc);
            }
        }
        return pose;
    }

    /** roche des rochers selon le sol de surface (null : pas de detail sur ce sol) */
    private static BlockState roche(BlockState sol, RandomSource r) {
        if (sol.is(Blocks.SAND) || sol.is(Blocks.SANDSTONE)) return r.nextBoolean() ? Blocks.SANDSTONE.defaultBlockState() : Blocks.SMOOTH_SANDSTONE.defaultBlockState();
        if (sol.is(Blocks.RED_SAND) || sol.is(BlockTags.TERRACOTTA)) return r.nextBoolean() ? Blocks.TERRACOTTA.defaultBlockState() : Blocks.RED_SANDSTONE.defaultBlockState();
        if (sol.is(Blocks.SNOW_BLOCK) || sol.is(Blocks.POWDER_SNOW) || sol.is(Blocks.PACKED_ICE)) return r.nextBoolean() ? Blocks.STONE.defaultBlockState() : Blocks.ANDESITE.defaultBlockState();
        if (sol.is(Blocks.BASALT) || sol.is(Blocks.SMOOTH_BASALT) || sol.is(Blocks.BLACKSTONE) || sol.is(Blocks.TUFF))
            return r.nextInt(3) == 0 ? Blocks.TUFF.defaultBlockState() : Blocks.SMOOTH_BASALT.defaultBlockState();
        if (sol.is(Blocks.MUD) || sol.is(Blocks.MUDDY_MANGROVE_ROOTS)) return r.nextInt(4) == 0 ? Blocks.MOSSY_COBBLESTONE.defaultBlockState() : null;
        if (sol.is(Blocks.STONE) || sol.is(Blocks.ANDESITE) || sol.is(Blocks.CALCITE) || sol.is(Blocks.DIORITE) || sol.is(Blocks.GRANITE))
            return sol.getBlock().defaultBlockState();
        if (sol.is(Blocks.GRASS_BLOCK) || sol.is(BlockTags.DIRT) || sol.is(Blocks.PODZOL) || sol.is(Blocks.MOSS_BLOCK)) {
            int t = r.nextInt(10);
            return t < 4 ? Blocks.MOSSY_COBBLESTONE.defaultBlockState() : t < 7 ? Blocks.STONE.defaultBlockState() : t < 9 ? Blocks.ANDESITE.defaultBlockState() : Blocks.COBBLESTONE.defaultBlockState();
        }
        if (sol.is(Blocks.GRAVEL)) return Blocks.STONE.defaultBlockState();
        return null;
    }

    private static BlockState tacheSol(BlockState sol, RandomSource r) {
        if (sol.is(Blocks.SAND)) return r.nextBoolean() ? Blocks.GRAVEL.defaultBlockState() : Blocks.SANDSTONE.defaultBlockState();
        if (sol.is(Blocks.GRASS_BLOCK)) { int t = r.nextInt(3); return t == 0 ? Blocks.COARSE_DIRT.defaultBlockState() : t == 1 ? Blocks.GRAVEL.defaultBlockState() : Blocks.PODZOL.defaultBlockState(); }
        if (sol.is(BlockTags.DIRT)) return r.nextBoolean() ? Blocks.GRAVEL.defaultBlockState() : Blocks.STONE.defaultBlockState();
        if (sol.is(BlockTags.TERRACOTTA) || sol.is(Blocks.RED_SAND)) return Blocks.COARSE_DIRT.defaultBlockState();
        return Blocks.GRAVEL.defaultBlockState();
    }

    private static BlockState tronc(Holder<Biome> b) {
        String id = b.unwrapKey().map(k -> k.location().toString()).orElse("");
        if (id.contains("desert") || id.contains("cendre") || id.contains("ash") || id.contains("volcan") || id.contains("snow") || id.contains("frozen") || id.contains("gel") || id.contains("beach") || id.contains("ocean")) return null;
        if (id.contains("jungle")) return Blocks.JUNGLE_LOG.defaultBlockState();
        if (id.contains("savanna") || id.contains("baobab") || id.contains("dry") || id.contains("shrub")) return Blocks.ACACIA_LOG.defaultBlockState();
        if (id.contains("pine") || id.contains("spruce") || id.contains("taiga") || id.contains("conifer") || id.contains("plateau") || id.contains("highland")) return Blocks.SPRUCE_LOG.defaultBlockState();
        if (id.contains("mangrove") || id.contains("swamp") || id.contains("marais") || id.contains("bayou") || id.contains("marecage")) return Blocks.MANGROVE_LOG.defaultBlockState();
        if (id.contains("birch")) return Blocks.BIRCH_LOG.defaultBlockState();
        return Blocks.OAK_LOG.defaultBlockState();
    }

    private static boolean libre(WorldGenLevel n, BlockPos q) {
        BlockState s = n.getBlockState(q);
        return (s.isAir() || s.canBeReplaced()) && n.getFluidState(q).isEmpty();
    }

    /** rocher irregulier de 2 a 4 blocs de large, en partie enfonce */
    private static boolean rocher(WorldGenLevel n, RandomSource r, BlockPos.MutableBlockPos p, int x, int y, int z, BlockState roche, BlockState sol) {
        double rx = 1.0 + r.nextDouble() * 1.4, rz = 1.0 + r.nextDouble() * 1.4, ry = 0.9 + r.nextDouble() * 1.2;
        int ix = (int) Math.ceil(rx), iz = (int) Math.ceil(rz), iy = (int) Math.ceil(ry);
        boolean pose = false;
        for (int dy = -1; dy <= iy; dy++) for (int dx = -ix; dx <= ix; dx++) for (int dz = -iz; dz <= iz; dz++) {
            double e = (dx * dx) / (rx * rx) + (dz * dz) / (rz * rz) + ((dy + 0.3) * (dy + 0.3)) / (ry * ry);
            if (e > 1.0 + r.nextDouble() * 0.25) continue;
            int bx = x + dx, bz = z + dz;
            if ((bx >> 4) != (x >> 4) || (bz >> 4) != (z >> 4)) continue;
            p.set(bx, y + dy, bz);
            if (dy <= 0 || libre(n, p)) { n.setBlock(p, r.nextInt(5) == 0 && roche.is(Blocks.STONE) ? Blocks.ANDESITE.defaultBlockState() : roche, 2); pose = true; }
        }
        return pose;
    }

    /** affleurement : quelques colonnes de roche qui sortent du sol (1 a 3 blocs) */
    private static boolean affleurement(WorldGenLevel n, RandomSource r, BlockPos.MutableBlockPos p, int x, int y, int z, BlockState roche) {
        int nb = 3 + r.nextInt(5);
        boolean pose = false;
        for (int i = 0; i < nb; i++) {
            int bx = x + r.nextInt(5) - 2, bz = z + r.nextInt(5) - 2;
            if ((bx >> 4) != (x >> 4) || (bz >> 4) != (z >> 4)) continue;
            int sy = n.getHeight(Heightmap.Types.OCEAN_FLOOR_WG, bx, bz);
            if (Math.abs(sy - 1 - y) > 2) continue;
            int hgt = 1 + r.nextInt(i == 0 ? 3 : 2);
            for (int k = 0; k < hgt; k++) { p.set(bx, sy + k, bz); if (!libre(n, p)) break; n.setBlock(p, roche, 2); pose = true; }
        }
        return pose;
    }

    /** tache de sol (gravier, terre grossiere, podzol...) en disque irregulier, a la surface */
    private static boolean tache(WorldGenLevel n, RandomSource r, BlockPos.MutableBlockPos p, int x, int y, int z, BlockState bloc, int rayon) {
        boolean pose = false;
        for (int dx = -rayon; dx <= rayon; dx++) for (int dz = -rayon; dz <= rayon; dz++) {
            if (dx * dx + dz * dz > rayon * rayon + r.nextInt(3) - 1) continue;
            int bx = x + dx, bz = z + dz;
            if ((bx >> 4) != (x >> 4) || (bz >> 4) != (z >> 4)) continue;
            int sy = n.getHeight(Heightmap.Types.OCEAN_FLOOR_WG, bx, bz) - 1;
            if (Math.abs(sy - y) > 1) continue;
            p.set(bx, sy, bz);
            BlockState s = n.getBlockState(p);
            if (s.is(Blocks.GRASS_BLOCK) || s.is(BlockTags.DIRT) || s.is(Blocks.SAND) || s.is(Blocks.PODZOL) || s.is(BlockTags.TERRACOTTA) || s.is(Blocks.RED_SAND)) {
                n.setBlock(p, bloc, 2); pose = true;
                p.set(bx, sy + 1, bz);
                BlockState h = n.getBlockState(p);
                if (!h.isAir() && h.canBeReplaced() && n.getFluidState(p).isEmpty() && !bloc.is(Blocks.PODZOL) && !bloc.is(Blocks.COARSE_DIRT)) n.setBlock(p, Blocks.AIR.defaultBlockState(), 2);
            }
        }
        return pose;
    }

    /** tronc couche de 3 a 6 blocs, pose a plat sur le sol */
    private static boolean troncCouche(WorldGenLevel n, RandomSource r, BlockPos.MutableBlockPos p, int x, int y, int z, BlockState tronc) {
        boolean axeX = r.nextBoolean();
        int lg = 3 + r.nextInt(4);
        int dx = axeX ? 1 : 0, dz = axeX ? 0 : 1;
        int sx = x - (axeX ? lg / 2 : 0), sz = z - (axeX ? 0 : lg / 2);
        for (int i = 0; i < lg; i++) {
            int bx = sx + dx * i, bz = sz + dz * i;
            if ((bx >> 4) != (x >> 4) || (bz >> 4) != (z >> 4)) return false;
            int sy = n.getHeight(Heightmap.Types.OCEAN_FLOOR_WG, bx, bz);
            if (sy != y + 1) return false;
            p.set(bx, sy, bz);
            if (!libre(n, p)) return false;
        }
        BlockState t = tronc.setValue(RotatedPillarBlock.AXIS, axeX ? Direction.Axis.X : Direction.Axis.Z);
        for (int i = 0; i < lg; i++) {
            p.set(sx + dx * i, y + 1, sz + dz * i);
            n.setBlock(p, t, 2);
            if (r.nextInt(3) == 0) { p.move(0, 1, 0); if (libre(n, p)) n.setBlock(p, Blocks.MOSS_CARPET.defaultBlockState(), 2); }
        }
        return true;
    }
}
