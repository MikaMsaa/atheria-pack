package fr.atheria.monde;

import java.util.Random;
import java.util.concurrent.atomic.AtomicInteger;
import mcjty.lostcities.setup.Registration;
import mcjty.lostcities.varia.ChunkCoord;
import mcjty.lostcities.worldgen.IDimensionInfo;
import mcjty.lostcities.worldgen.lost.BuildingInfo;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.world.level.WorldGenLevel;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.LeavesBlock;
import net.minecraft.world.level.block.SlabBlock;
import net.minecraft.world.level.block.VineBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.BooleanProperty;
import net.minecraft.world.level.block.state.properties.SlabType;
import net.minecraft.world.level.chunk.ChunkAccess;

// Envahissement des villes Lost Cities a la generation (fin de decoration du chunk, apres la finition des vitrines) :
// coulees de lianes sur les facades exposees au ciel, herbes, fougeres et mousse dans les fissures des rues,
// quelques arbres pousses dans la chaussee, debris (gravats, dalles cassees, gravier).
// Tout reste dans le chunk (aucune ecriture chez le voisin) ; tirage deterministe par chunk.
public final class Envahissement {
    public static final AtomicInteger CHUNKS = new AtomicInteger();
    public static final AtomicInteger LIANES = new AtomicInteger();
    public static final AtomicInteger PLANTES = new AtomicInteger();
    public static final AtomicInteger ARBRES = new AtomicInteger();

    // reglages (densites)
    static double PART_FACADES = 0.38;   // part des pans de facade (cellules 4 x 4) couverts de lianes
    static double DENSITE_LIANE = 0.75;  // dans un pan couvert, part des colonnes qui ont une coulee
    static double PART_FISSURES = 0.36;  // part des cellules 3 x 3 de rue ou la nature a perce
    static double DENSITE_PLANTE = 0.55; // dans une cellule percee, part des cases plantees
    static double DEBRIS = 0.045;        // debris par case de rue libre
    static double ARBRE_PAR_CHUNK = 0.30;
    static int HAUTEUR_MAX = 40;         // hauteur de facade traitee au-dessus du sol de la ville

    private Envahissement() {
    }

    public static void envahir(WorldGenLevel niveau, ChunkAccess chunk) {
        IDimensionInfo info = Registration.LOSTCITY_FEATURE.get().getDimensionInfo(niveau);
        if (info == null) return;
        int cx = chunk.getPos().x, cz = chunk.getPos().z;
        BuildingInfo bat = BuildingInfo.getBuildingInfo(new ChunkCoord(info.getType(), cx, cz), info);
        if (bat == null || !bat.isCity) return;
        int sol = bat.getCityGroundLevel(), x0 = chunk.getPos().getMinBlockX(), z0 = chunk.getPos().getMinBlockZ();
        Random r = new Random(niveau.getSeed() ^ (cx * 341873128712L) ^ (cz * 132897987541L) ^ 0x5EED_A7E1L);
        BlockPos.MutableBlockPos p = new BlockPos.MutableBlockPos();
        int ymaxTest = Math.min(niveau.getMaxBuildHeight() - 1, sol + HAUTEUR_MAX + 30);
        // plus haut bloc non vide de chaque colonne (les heightmaps sont figees a ce stade de la generation)
        int[] haut = new int[256];
        for (int i = 0; i < 256; i++) {
            int x = x0 + (i & 15), z = z0 + (i >> 4), y = ymaxTest;
            while (y > sol - 8 && niveau.getBlockState(p.set(x, y, z)).isAir()) y--;
            haut[i] = y;
        }
        int lianes = 0, plantes = 0;
        // ---- lianes : cases d'air a ciel ouvert collees a une facade pleine, par pans ----
        for (int i = 0; i < 256; i++) {
            int lx = i & 15, lz = i >> 4, x = x0 + lx, z = z0 + lz;
            for (Direction d : Direction.Plane.HORIZONTAL) {
                int vx = lx + d.getStepX(), vz = lz + d.getStepZ();
                if (vx < 0 || vx > 15 || vz < 0 || vz > 15) continue;
                // pan de facade : cellule 4 x 4 le long du mur, tiree au hasard (stable)
                int wx = x + d.getStepX(), wz = z + d.getStepZ();
                long pan = hash(Math.floorDiv(wx, 4), Math.floorDiv(wz, 4), d.ordinal(), niveau.getSeed());
                long col = hash(wx, wz, d.ordinal() + 11, niveau.getSeed());
                if ((pan & 0xFFFF) / 65536.0 >= PART_FACADES) continue;
                if ((col & 0xFFFF) / 65536.0 >= DENSITE_LIANE) continue;
                // la coulee part du haut du mur et descend : longueur commune au pan, avec un ecart par colonne (bord frange)
                int depart = Math.min(haut[vz * 16 + vx], sol + HAUTEUR_MAX);
                int longueur = 6 + (int) (((pan >>> 32) & 0xFF) / 255.0 * 20) + (int) (((col >>> 16) & 0xFF) / 255.0 * 7) - 3;
                BooleanProperty face = VineBlock.getPropertyForFace(d);
                for (int y = depart, n = 0; y > sol && n < longueur; y--, n++) {
                    if (y <= haut[i]) break; // pas a ciel ouvert : interieur, balcon, auvent
                    if (!niveau.getBlockState(p.set(x, y, z)).isAir()) break;
                    BlockState mur = niveau.getBlockState(p.set(x + d.getStepX(), y, z + d.getStepZ()));
                    if (!mur.isFaceSturdy(niveau, p, d.getOpposite())) break;
                    niveau.setBlock(p.set(x, y, z), Blocks.VINE.defaultBlockState().setValue(face, true), 2);
                    lianes++;
                }
            }
        }
        // ---- rues : fissures envahies, debris ----
        for (int i = 0; i < 256; i++) {
            int lx = i & 15, lz = i >> 4, x = x0 + lx, z = z0 + lz, y = haut[i];
            if (Math.abs(y - (sol - 1)) > 1) continue; // seulement le niveau de la rue (pas les toits)
            BlockState dessous = niveau.getBlockState(p.set(x, y, z));
            if (!dessous.isFaceSturdy(niveau, p, Direction.UP) || !dessous.getFluidState().isEmpty()) continue;
            if (!niveau.getBlockState(p.set(x, y + 1, z)).isAir()) continue;
            // taches organiques (bruit de valeur lisse, maille 5) au lieu de carres 3 x 3
            boolean fissure = bruit(x, z, niveau.getSeed()) < PART_FISSURES;
            String nom = dessous.getBlock().builtInRegistryHolder().key().location().getPath();
            boolean terre = nom.contains("grass_block") || nom.contains("dirt") || nom.contains("podzol") || nom.contains("moss");
            if (fissure && r.nextDouble() < DENSITE_PLANTE) {
                double t = r.nextDouble();
                if (!terre) niveau.setBlock(p.set(x, y, z), (t < 0.45 ? Blocks.GRASS_BLOCK : t < 0.7 ? Blocks.MOSS_BLOCK : t < 0.88 ? Blocks.COARSE_DIRT : Blocks.ROOTED_DIRT).defaultBlockState(), 2);
                BlockState sol2 = niveau.getBlockState(p.set(x, y, z));
                double u = r.nextDouble();
                BlockState plante = u < 0.42 ? Blocks.SHORT_GRASS.defaultBlockState() : u < 0.60 ? Blocks.FERN.defaultBlockState() : u < 0.72 ? Blocks.MOSS_CARPET.defaultBlockState() : u < 0.80 ? Blocks.DEAD_BUSH.defaultBlockState() : u < 0.86 ? Blocks.AZALEA.defaultBlockState() : null;
                if (u >= 0.86 && u < 0.97 && niveau.getBlockState(p.set(x, y + 2, z)).isAir()) {
                    niveau.setBlock(p.set(x, y + 1, z), Blocks.TALL_GRASS.defaultBlockState(), 2);
                    niveau.setBlock(p.set(x, y + 2, z), Blocks.TALL_GRASS.defaultBlockState().setValue(net.minecraft.world.level.block.DoublePlantBlock.HALF, net.minecraft.world.level.block.state.properties.DoubleBlockHalf.UPPER), 2);
                    plantes++;
                } else if (plante != null && plante.canSurvive(niveau, p.set(x, y + 1, z))) {
                    niveau.setBlock(p.set(x, y + 1, z), plante, 2);
                    plantes++;
                }
            } else if (!fissure && r.nextDouble() < DEBRIS) {
                double t = r.nextDouble();
                BlockState d = t < 0.35 ? Blocks.COBBLESTONE_SLAB.defaultBlockState().setValue(SlabBlock.TYPE, SlabType.BOTTOM)
                    : t < 0.55 ? Blocks.ANDESITE_SLAB.defaultBlockState().setValue(SlabBlock.TYPE, SlabType.BOTTOM)
                    : t < 0.70 ? Blocks.MOSSY_COBBLESTONE_SLAB.defaultBlockState().setValue(SlabBlock.TYPE, SlabType.BOTTOM)
                    : t < 0.85 ? Blocks.MOSS_CARPET.defaultBlockState() : null;
                if (d != null) niveau.setBlock(p.set(x, y + 1, z), d, 2);
                else niveau.setBlock(p.set(x, y, z), Blocks.GRAVEL.defaultBlockState(), 2);
                plantes++;
            }
        }
        // ---- un arbre pousse dans la chaussee (loin des bords du chunk, place libre au-dessus) ----
        if (r.nextDouble() < ARBRE_PAR_CHUNK) {
            for (int essai = 0; essai < 6; essai++) {
                int lx = 3 + r.nextInt(10), lz = 3 + r.nextInt(10), x = x0 + lx, z = z0 + lz, y = haut[lz * 16 + lx];
                if (Math.abs(y - (sol - 1)) > 1) continue;
                int h = 4 + r.nextInt(3);
                boolean libre = true;
                for (int dx = -2; dx <= 2 && libre; dx++) for (int dz = -2; dz <= 2 && libre; dz++) for (int dy = 1; dy <= h + 2 && libre; dy++)
                    if (!niveau.getBlockState(p.set(x + dx, y + dy, z + dz)).isAir()) libre = false;
                if (!libre) continue;
                BlockState tronc = (r.nextBoolean() ? Blocks.BIRCH_LOG : Blocks.JUNGLE_LOG).defaultBlockState();
                BlockState feuille = (r.nextBoolean() ? Blocks.OAK_LEAVES : Blocks.JUNGLE_LEAVES).defaultBlockState().setValue(LeavesBlock.PERSISTENT, true);
                niveau.setBlock(p.set(x, y, z), Blocks.ROOTED_DIRT.defaultBlockState(), 2);
                for (int dx = -1; dx <= 1; dx++) for (int dz = -1; dz <= 1; dz++) if ((dx != 0 || dz != 0) && r.nextDouble() < 0.6) niveau.setBlock(p.set(x + dx, y, z + dz), Blocks.COARSE_DIRT.defaultBlockState(), 2);
                for (int dy = 1; dy <= h; dy++) niveau.setBlock(p.set(x, y + dy, z), tronc, 2);
                for (int dx = -2; dx <= 2; dx++) for (int dz = -2; dz <= 2; dz++) for (int dy = h - 1; dy <= h + 2; dy++) {
                    int dd = dx * dx + dz * dz + (dy - h) * (dy - h) * 2;
                    if (dd <= 6 && r.nextDouble() < 0.85 && niveau.getBlockState(p.set(x + dx, y + dy, z + dz)).isAir()) niveau.setBlock(p, feuille, 2);
                }
                ARBRES.incrementAndGet();
                break;
            }
        }
        CHUNKS.incrementAndGet(); LIANES.addAndGet(lianes); PLANTES.addAndGet(plantes);
    }

    private static double h01(int a, int b, long graine) {
        return (hash(a, b, 7, graine) & 0xFFFF) / 65536.0;
    }

    // bruit de valeur bilineaire lisse, maille 5 blocs
    private static double bruit(int x, int z, long graine) {
        int gx = Math.floorDiv(x, 5), gz = Math.floorDiv(z, 5);
        double fx = (x - gx * 5) / 5.0, fz = (z - gz * 5) / 5.0;
        fx = fx * fx * (3 - 2 * fx); fz = fz * fz * (3 - 2 * fz);
        double a = h01(gx, gz, graine), b = h01(gx + 1, gz, graine), c = h01(gx, gz + 1, graine), e = h01(gx + 1, gz + 1, graine);
        return (a + (b - a) * fx) * (1 - fz) + (c + (e - c) * fx) * fz;
    }

    private static long hash(int a, int b, int c, long graine) {
        long h = graine ^ (a * 0x9E3779B97F4A7C15L) ^ (b * 0xC2B2AE3D27D4EB4FL) ^ (c * 0x165667B19E3779F9L);
        h ^= h >>> 33; h *= 0xFF51AFD7ED558CCDL; h ^= h >>> 33; h *= 0xC4CEB93FE51B4E2BL; h ^= h >>> 33;
        return h;
    }
}
