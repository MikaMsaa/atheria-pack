package fr.atheria.ile;

import com.mojang.serialization.Codec;
import net.minecraft.core.BlockPos;
import net.minecraft.server.level.WorldGenRegion;
import net.minecraft.tags.BlockTags;
import net.minecraft.world.level.WorldGenLevel;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.chunk.ChunkGenerator;
import net.minecraft.world.level.levelgen.Heightmap;
import net.minecraft.world.level.levelgen.RandomState;
import net.minecraft.world.level.levelgen.feature.Feature;
import net.minecraft.world.level.levelgen.feature.FeaturePlaceContext;
import net.minecraft.world.level.levelgen.feature.configurations.NoneFeatureConfiguration;

/**
 * Pose les routes dessinees (etape top_layer_modification, apres les arbres) :
 * chaussee d'asphalte use a la hauteur du profil en long, bas-cotes degages, talus raccordes au terrain,
 * pont mince au-dessus de l'eau douce. Les colonnes du chunk sont remodelees ; dans une marge de 12 blocs
 * sur les chunks voisins, seule la vegetation qui deborde sur la route est retiree.
 * Sans allocation par colonne.
 */
public final class RouteFeature extends Feature<NoneFeatureConfiguration> {
    private static final int MARGE = 12;
    private static final int DEBLAI_MAX = 48, REMBLAI_MAX = 40;

    private static final BlockState AIR = Blocks.AIR.defaultBlockState();
    private static final BlockState ASPHALTE = Blocks.BLACK_CONCRETE_POWDER.defaultBlockState();
    private static final BlockState TUF = Blocks.TUFF.defaultBlockState();
    private static final BlockState GRAVIER = Blocks.GRAVEL.defaultBlockState();
    private static final BlockState TERRE_GROSSIERE = Blocks.COARSE_DIRT.defaultBlockState();
    private static final BlockState LIGNE = Blocks.LIGHT_GRAY_CONCRETE_POWDER.defaultBlockState();
    private static final BlockState HERBE_BLOC = Blocks.GRASS_BLOCK.defaultBlockState();
    private static final BlockState TERRE = Blocks.DIRT.defaultBlockState();
    private static final BlockState PIERRE = Blocks.STONE.defaultBlockState();
    private static final BlockState PONT = Blocks.POLISHED_ANDESITE.defaultBlockState();
    private static final BlockState HERBE = Blocks.SHORT_GRASS.defaultBlockState();
    private static final BlockState TERRE_RACINES = Blocks.ROOTED_DIRT.defaultBlockState();

    public RouteFeature(Codec<NoneFeatureConfiguration> codec) { super(codec); }

    @Override
    public boolean place(FeaturePlaceContext<NoneFeatureConfiguration> ctx) {
        CarteIle c = CarteIle.active();
        if (c == null || c.routes.isEmpty()) return false;
        WorldGenLevel niveau = ctx.level();
        BlockPos o = ctx.origin();
        int x0 = o.getX() & ~15, z0 = o.getZ() & ~15;
        ChunkGenerator gen = ctx.chunkGenerator();
        RandomState rs = niveau instanceof WorldGenRegion wgr ? wgr.getLevel().getChunkSource().randomState() : null;
        if (rs == null) return false;
        int mer = gen.getSeaLevel();
        boolean pose = false;
        double[] d2 = new double[1];
        BlockPos.MutableBlockPos pos = new BlockPos.MutableBlockPos();
        for (Route r : c.routes) {
            if (!r.pres(x0 + 8, z0 + 8) && !r.pres(x0, z0) && !r.pres(x0 + 15, z0 + 15) && !r.pres(x0, z0 + 15) && !r.pres(x0 + 15, z0)) continue;
            for (int bz = z0 - MARGE; bz < z0 + 16 + MARGE; bz++) {
                for (int bx = x0 - MARGE; bx < x0 + 16 + MARGE; bx++) {
                    int i = r.proche(bx, bz, d2);
                    if (i < 0) continue;
                    if (c.dansLot(bx, bz)) continue; // rien n'est pose dans un lot fixe
                    double d = Math.sqrt(d2[0]);
                    boolean ici = bx >= x0 && bx < x0 + 16 && bz >= z0 && bz < z0 + 16;
                    int y = r.y(i, gen, niveau, rs, mer);
                    if (!ici) {
                        if (d <= r.demiLargeur + r.basCotes) degager(niveau, pos, bx, bz, y);
                        continue;
                    }
                    pose |= colonne(niveau, c, r, pos, bx, bz, i, d, y);
                }
            }
        }
        return pose;
    }

    private static boolean vegetal(BlockState s) {
        return s.isAir() || s.is(BlockTags.LEAVES) || s.is(BlockTags.LOGS) || s.canBeReplaced() || s.is(Blocks.SNOW)
                || s.is(BlockTags.FLOWERS) || s.is(Blocks.BAMBOO) || s.is(Blocks.VINE) || s.is(Blocks.CACTUS) || s.is(Blocks.SUGAR_CANE)
                || s.is(BlockTags.SAPLINGS) || s.is(Blocks.MUSHROOM_STEM) || s.is(Blocks.BROWN_MUSHROOM_BLOCK) || s.is(Blocks.RED_MUSHROOM_BLOCK);
    }

    /** dessus du sol naturel (premier bloc ni vegetal ni fluide), et vrai dans eau[0] s'il y a de l'eau au-dessus */
    private static int sol(WorldGenLevel n, BlockPos.MutableBlockPos p, int bx, int bz, int haut, boolean[] eau) {
        int bas = n.getMinBuildHeight();
        eau[0] = false;
        for (int y = haut; y > bas; y--) {
            BlockState s = n.getBlockState(p.set(bx, y, bz));
            if (!s.getFluidState().isEmpty()) { eau[0] = true; continue; }
            if (!vegetal(s)) return y;
        }
        return bas;
    }

    private static final ThreadLocal<boolean[]> EAU = ThreadLocal.withInitial(() -> new boolean[1]);

    /** retire arbres et plantes au-dessus de la route (chunks voisins : la vegetation qui deborde) */
    private static void degager(WorldGenLevel n, BlockPos.MutableBlockPos p, int bx, int bz, int y) {
        int haut = n.getHeight(Heightmap.Types.WORLD_SURFACE_WG, bx, bz);
        for (int yy = Math.min(haut, y + 40); yy > y; yy--) {
            BlockState s = n.getBlockState(p.set(bx, yy, bz));
            if (!s.isAir() && s.getFluidState().isEmpty() && (s.is(BlockTags.LEAVES) || s.is(BlockTags.LOGS) || s.canBeReplaced()))
                n.setBlock(p, AIR, 2);
        }
    }

    private boolean colonne(WorldGenLevel n, CarteIle c, Route r, BlockPos.MutableBlockPos p, int bx, int bz, int i, double d, int y) {
        int haut = n.getHeight(Heightmap.Types.WORLD_SURFACE_WG, bx, bz);
        boolean[] eau = EAU.get();
        int g = sol(n, p, bx, bz, Math.max(haut, y + 2), eau);
        double plat = r.demiLargeur + r.basCotes;
        if (d > plat) {
            // talus : raccord progressif entre la route et le terrain naturel
            double t = Math.min(1, (d - plat) / r.talus);
            t = t * t * (3 - 2 * t);
            int cible = (int) Math.round(y + (g - y) * t);
            if (eau[0] || cible == g) return false;
            if (cible > g) {
                if (cible - g > REMBLAI_MAX) return false;
                for (int yy = g + 1; yy < cible; yy++) n.setBlock(p.set(bx, yy, bz), TERRE, 2);
                n.setBlock(p.set(bx, cible, bz), HERBE_BLOC, 2);
            } else {
                if (g - cible > DEBLAI_MAX) return false;
                for (int yy = Math.max(haut, g); yy > cible; yy--) n.setBlock(p.set(bx, yy, bz), AIR, 2);
                BlockState dessous = n.getBlockState(p.set(bx, cible, bz));
                if (dessous.is(BlockTags.DIRT) || dessous.is(Blocks.SAND) || dessous.is(Blocks.GRAVEL)) n.setBlock(p, HERBE_BLOC, 2);
            }
            return true;
        }
        // chaussee et bas-cotes : tout degager au-dessus, poser la surface, remblayer dessous
        for (int yy = Math.min(Math.max(haut, g), y + DEBLAI_MAX); yy > y; yy--) {
            BlockState s = n.getBlockState(p.set(bx, yy, bz));
            if (!s.isAir()) n.setBlock(p, AIR, 2);
        }
        boolean chaussee = d <= r.demiLargeur;
        n.setBlock(p.set(bx, y, bz), chaussee ? surface(c, bx, bz, d, r.abs[i]) : basCote(c, bx, bz), 2);
        // sous la surface : fondation, puis remblai jusqu'au sol (pont mince si de l'eau douce est dessous)
        boolean surEau = false;
        for (int yy = y - 1; yy >= y - REMBLAI_MAX && yy > n.getMinBuildHeight(); yy--) {
            BlockState s = n.getBlockState(p.set(bx, yy, bz));
            if (!s.getFluidState().isEmpty()) { surEau = true; break; }
            if (!vegetal(s) && yy < y - 2) break;
            n.setBlock(p, yy >= y - 2 ? (chaussee ? PIERRE : TERRE) : (chaussee ? PIERRE : TERRE), 2);
        }
        if (surEau) n.setBlock(p.set(bx, y - 1, bz), PONT, 2);
        // herbe dans les joints et sur les bas-cotes (jamais d'arbre)
        double h = c.bruit(bx * 1.37, bz * 1.37, 517);
        BlockState top = n.getBlockState(p.set(bx, y, bz));
        if ((top.is(Blocks.GRASS_BLOCK) && h > 0.55) || (top.is(Blocks.COARSE_DIRT) && chaussee && h > 0.75))
            n.setBlock(p.set(bx, y + 1, bz), HERBE, 2);
        return true;
    }

    /** asphalte use : enrobe noir, tuf, gravier, terre ; fissures ; ligne centrale effacee */
    private static BlockState surface(CarteIle c, int bx, int bz, double d, float s) {
        double fissure = Math.abs(c.bruit(bx / 9.0, bz / 9.0, 511) + 0.5 * c.bruit(bx / 3.5, bz / 3.5, 512));
        if (fissure < 0.035) return GRAVIER;
        double u = c.bruit(bx / 6.0, bz / 6.0, 513) * 0.6 + c.bruit(bx * 0.9, bz * 0.9, 514) * 0.4;
        if (d < 0.8 && (((int) (s / 4)) % 3 == 0) && c.bruit(bx * 0.7, bz * 0.7, 515) > 0.1) return LIGNE;
        if (u > 0.55) return TERRE_GROSSIERE;
        if (u > 0.35) return GRAVIER;
        if (u < -0.45) return TUF;
        return ASPHALTE;
    }

    private static BlockState basCote(CarteIle c, int bx, int bz) {
        // bas-cotes : herbe et terre (jamais les blocs de la chaussee, pour que sa largeur reste mesurable)
        double u = c.bruit(bx / 5.0, bz / 5.0, 516);
        if (u > 0.5) return TERRE_RACINES;
        if (u > 0.3) return TERRE;
        return HERBE_BLOC;
    }
}
