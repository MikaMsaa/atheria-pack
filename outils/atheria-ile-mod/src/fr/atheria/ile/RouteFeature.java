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
        if (c == null) return false;
        WorldGenLevel niveau = ctx.level();
        BlockPos o = ctx.origin();
        int x0 = o.getX() & ~15, z0 = o.getZ() & ~15;
        ChunkGenerator gen = ctx.chunkGenerator();
        RandomState rs = niveau instanceof WorldGenRegion wgr ? wgr.getLevel().getChunkSource().randomState() : null;
        if (rs == null) return false;
        net.minecraft.world.level.Level monde = ((WorldGenRegion) niveau).getLevel();
        int mer = gen.getSeaLevel();
        // 0.5.6 : eau des rivieres et lacs dessines d'abord, pour que la route voie l'eau (ponts)
        boolean pose = Rivieres.poser(niveau, c, x0, z0, gen, rs, mer);
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
                    int y = r.y(i, gen, niveau, rs, mer, monde);
                    if (!ici) {
                        if (d <= r.demiLargeur + 0.5 + (r.tablier[i] ? 1 : r.basCotes)) degager(niveau, pos, bx, bz, y);
                        continue;
                    }
                    pose |= r.tablier[i] ? tablier(niveau, c, r, pos, bx, bz, i, d, y, Heightmap.Types.WORLD_SURFACE_WG) : colonne(niveau, c, r, pos, bx, bz, i, d, y, Heightmap.Types.WORLD_SURFACE_WG);
                }
            }
        }
        return pose;
    }

    private static boolean vegetal(BlockState s) {
        return s.isAir() || s.is(BlockTags.LEAVES) || s.is(BlockTags.LOGS) || s.canBeReplaced() || s.is(Blocks.SNOW)
                || s.is(BlockTags.FLOWERS) || s.is(Blocks.BAMBOO) || s.is(Blocks.VINE) || s.is(Blocks.CACTUS) || s.is(Blocks.SUGAR_CANE)
                || s.is(BlockTags.SAPLINGS) || s.getBlock() instanceof net.minecraft.world.level.block.BushBlock || s.is(Blocks.MUSHROOM_STEM) || s.is(Blocks.BROWN_MUSHROOM_BLOCK) || s.is(Blocks.RED_MUSHROOM_BLOCK);
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

    /**
     * Vrai dessus de la colonne (premier bloc non-air en descendant depuis y + plafond), sans heightmap.
     * 0.5.3 : WORLD_SURFACE_WG n'est plus tenu a jour pendant l'etape features (statuts CARVERS/FEATURES :
     * heightmaps finales seulement), et Lost Cities ecrit ses blocs directement dans les sections a
     * raw_generation : la heightmap WG restait au terrain de bruit, donc les arbres, la canopee et les
     * rues/batiments Lost Cities au-dessus de la route n'etaient pas degages.
     */
    private static int dessus(WorldGenLevel n, BlockPos.MutableBlockPos p, int bx, int bz, int y, int plafond) {
        int top = Math.min(y + plafond, n.getMaxBuildHeight() - 1);
        for (int yy = top; yy > y; yy--) if (!n.getBlockState(p.set(bx, yy, bz)).isAir()) return yy;
        return y;
    }

    /** 0.5.6 : client + forme connue (pas de mise a jour des voisins), pour la generation */
    static final int FL = 2 | 16;
    /** 0.5.6 : chunk en cours de finition (fil du serveur). En finition, Level.setBlock passe par markAndNotifyBlock, ou
     *  d'autres mods (Lithium : entonnoirs) lisent les voisins et chargent en bloquant un chunk absent (watchdog) :
     *  on ecrit donc directement dans le LevelChunk, puis on previent les clients et la lumiere. */
    private static final ThreadLocal<net.minecraft.world.level.chunk.LevelChunk> DIRECT = new ThreadLocal<>();

    private static void pose(WorldGenLevel n, BlockPos p, BlockState s, int fl) {
        net.minecraft.world.level.chunk.LevelChunk ch = DIRECT.get();
        if (ch != null && n instanceof net.minecraft.server.level.ServerLevel sl) {
            if ((p.getX() >> 4) != ch.getPos().x || (p.getZ() >> 4) != ch.getPos().z) return; // jamais hors du chunk
            BlockPos q = p.immutable();
            // entite de bloc de l'ancien bloc retiree d'abord (pas de coffre ou panneau orphelin, pas de contenu jete)
            if (ch.getBlockEntity(q) != null) ch.removeBlockEntity(q);
            // setBlockState met a jour les heightmaps ; setUnsaved explicite pour la sauvegarde
            if (ch.setBlockState(q, s, false) != null) {
                ch.setUnsaved(true);
                sl.getChunkSource().blockChanged(q);
                sl.getChunkSource().getLightEngine().checkBlock(q);
            }
            return;
        }
        n.setBlock(p, s, fl);
    }

    /** retire arbres et plantes au-dessus de la route (chunks voisins : la vegetation qui deborde) */
    private static void degager(WorldGenLevel n, BlockPos.MutableBlockPos p, int bx, int bz, int y) {
        int haut = dessus(n, p, bx, bz, y, REMBLAI_MAX);
        for (int yy = haut; yy > y; yy--) {
            BlockState s = n.getBlockState(p.set(bx, yy, bz));
            if (!s.isAir() && s.getFluidState().isEmpty() && vegetal(s))
                pose(n, p, AIR, FL);
        }
    }

    private static boolean colonne(WorldGenLevel n, CarteIle c, Route r, BlockPos.MutableBlockPos p, int bx, int bz, int i, double d, int y, Heightmap.Types hm) {
        // 0.5.6 : les bas-cotes ne recouvrent jamais le lit d'une riviere dessinee (d <= 10) : l'eau reste
        if (d > r.demiLargeur + 0.5 && c.distanceRiviere(bx, bz) <= Route.PONT_RIVIERE_D) return false;
        int haut = Math.max(n.getHeight(hm, bx, bz), dessus(n, p, bx, bz, y, DEBLAI_MAX));
        boolean[] eau = EAU.get();
        int g = sol(n, p, bx, bz, Math.max(haut, y + 2), eau);
        // 0.5.3 : +0.5 bloc, car la distance est prise du centre du bloc a l'echantillon d'axe le plus proche
        // (pas de 2) : au seuil 7.0 la largeur mesuree n'etait que de 14 en moyenne, 15 a 7.5
        double plat = r.demiLargeur + 0.5 + r.basCotes;
        if (d > plat) {
            // talus : raccord progressif entre la route et le terrain naturel
            double t = Math.min(1, (d - plat) / r.talus);
            t = t * t * (3 - 2 * t);
            int cible = (int) Math.round(y + (g - y) * t);
            if (eau[0] || cible == g) return false;
            if (cible > g) {
                if (cible - g > REMBLAI_MAX) return false;
                for (int yy = g + 1; yy < cible; yy++) pose(n, p.set(bx, yy, bz), TERRE, FL);
                pose(n, p.set(bx, cible, bz), HERBE_BLOC, FL);
            } else {
                if (g - cible > DEBLAI_MAX) return false;
                for (int yy = Math.max(haut, g); yy > cible; yy--) pose(n, p.set(bx, yy, bz), AIR, FL);
                BlockState dessous = n.getBlockState(p.set(bx, cible, bz));
                if (dessous.is(BlockTags.DIRT) || dessous.is(Blocks.SAND) || dessous.is(Blocks.GRAVEL)) pose(n, p, HERBE_BLOC, FL);
            }
            return true;
        }
        // chaussee et bas-cotes : tout degager au-dessus, poser la surface, remblayer dessous
        for (int yy = Math.min(Math.max(haut, g), y + DEBLAI_MAX); yy > y; yy--) {
            BlockState s = n.getBlockState(p.set(bx, yy, bz));
            if (!s.isAir()) pose(n, p, AIR, FL);
        }
        boolean chaussee = d <= r.demiLargeur + 0.5;
        pose(n, p.set(bx, y, bz), chaussee ? surface(c, bx, bz, d, r.abs[i]) : basCote(c, bx, bz), FL);
        // sous la surface : fondation, puis remblai jusqu'au sol (pont mince si de l'eau douce est dessous)
        boolean surEau = false;
        for (int yy = y - 1; yy >= y - REMBLAI_MAX && yy > n.getMinBuildHeight(); yy--) {
            BlockState s = n.getBlockState(p.set(bx, yy, bz));
            if (!s.getFluidState().isEmpty()) { surEau = true; break; }
            if (!vegetal(s) && yy < y - 2) break;
            pose(n, p, yy >= y - 2 ? (chaussee ? PIERRE : TERRE) : (chaussee ? PIERRE : TERRE), FL);
        }
        if (surEau) pose(n, p.set(bx, y - 1, bz), PONT, FL);
        // herbe dans les joints et sur les bas-cotes (jamais d'arbre)
        double h = c.bruit(bx * 1.37, bz * 1.37, 517);
        BlockState top = n.getBlockState(p.set(bx, y, bz));
        if ((top.is(Blocks.GRASS_BLOCK) && h > 0.55) || (top.is(Blocks.COARSE_DIRT) && chaussee && h > 0.75))
            pose(n, p.set(bx, y + 1, bz), HERBE, FL);
        return true;
    }

    private static final BlockState PARAPET = Blocks.ANDESITE_WALL.defaultBlockState();

    /**
     * 0.5.4 : tablier d'un pont sureleve. Chaussee a Y sur une dalle d'andesite (Y-1), bordure d'un bloc avec un
     * parapet ; AUCUN remblai dessous (l'air sous le tablier reste libre : berges et eau naturelles) et pas de talus
     * au-dela de la bordure. Au-dessus, tout est degage comme sur la route.
     */
    private static boolean tablier(WorldGenLevel n, CarteIle c, Route r, BlockPos.MutableBlockPos p, int bx, int bz, int i, double d, int y, Heightmap.Types hm) {
        double bord = r.demiLargeur + 0.5;
        if (d > bord + 1) return false;
        int haut = Math.max(n.getHeight(hm, bx, bz), dessus(n, p, bx, bz, y, DEBLAI_MAX));
        for (int yy = Math.min(haut, y + DEBLAI_MAX); yy > y; yy--) {
            BlockState s = n.getBlockState(p.set(bx, yy, bz));
            if (!s.isAir()) pose(n, p, AIR, FL);
        }
        if (d <= bord) {
            pose(n, p.set(bx, y, bz), surface(c, bx, bz, d, r.abs[i]), FL);
        } else {
            pose(n, p.set(bx, y, bz), PONT, FL);
            pose(n, p.set(bx, y + 1, bz), PARAPET, FL);
        }
        pose(n, p.set(bx, y - 1, bz), PONT, FL);
        // 0.5.6 : au moins 3 blocs d'air sous la dalle (Y-2 a Y-4) : troncs, plantes et berge trop haute retires,
        // l'eau de la riviere est gardee (un PNJ doit passer dessous)
        for (int yy = y - 2; yy >= y - 4; yy--) {
            BlockState s = n.getBlockState(p.set(bx, yy, bz));
            if (!s.isAir() && s.getFluidState().isEmpty()) pose(n, p, AIR, FL);
            else if (!s.isAir() && !s.getFluidState().isSource()) pose(n, p, AIR, FL);
        }
        return true;
    }

    /**
     * 0.5.6 : finition d'un chunk neuf du couloir, quand ses voisins ont fini leurs features (mares, filons, plantes
     * des chunks voisins posees APRES la route). Repose seulement la chaussee, les bas-cotes et le tablier
     * (jamais le talus, jamais dans un lot) ; idempotent. Fil du serveur.
     */
    static int finir(net.minecraft.server.level.ServerLevel n, CarteIle c, int cx, int cz) {
        net.minecraft.world.level.chunk.LevelChunk ch = n.getChunkSource().getChunkNow(cx, cz);
        if (ch == null) return 0;
        DIRECT.set(ch);
        try { return finirDans(n, c, cx, cz); } finally { DIRECT.remove(); }
    }

    private static int finirDans(net.minecraft.server.level.ServerLevel n, CarteIle c, int cx, int cz) {
        int x0 = cx << 4, z0 = cz << 4, poses = 0;
        double[] d2 = new double[1];
        BlockPos.MutableBlockPos pos = new BlockPos.MutableBlockPos();
        for (Route r : c.routes) {
            if (!r.profilPret()) continue;
            if (!r.pres(x0 + 8, z0 + 8) && !r.pres(x0, z0) && !r.pres(x0 + 15, z0 + 15) && !r.pres(x0, z0 + 15) && !r.pres(x0 + 15, z0)) continue;
            for (int bz = z0; bz < z0 + 16; bz++) for (int bx = x0; bx < x0 + 16; bx++) {
                int i = r.proche(bx, bz, d2);
                if (i < 0 || c.dansLot(bx, bz)) continue;
                double d = Math.sqrt(d2[0]);
                int y = r.y(i);
                if (r.tablier[i]) { if (tablier(n, c, r, pos, bx, bz, i, d, y, Heightmap.Types.WORLD_SURFACE)) poses++; }
                else if (d <= r.demiLargeur + 0.5 + r.basCotes) { if (colonne(n, c, r, pos, bx, bz, i, d, y, Heightmap.Types.WORLD_SURFACE)) poses++; }
            }
        }
        return poses;
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
