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

    private static boolean fondMeuble(BlockState s) {
        return s.is(BlockTags.SAND) || s.is(Blocks.GRAVEL) || s.is(Blocks.DIRT) || s.is(Blocks.CLAY) || s.is(Blocks.MUD) || s.is(Blocks.COARSE_DIRT);
    }

    /**
     * 0.9.4b bancs de sable : sur les marges peu profondes (1 a 3 blocs d'eau) des rivieres, estuaires et lacs,
     * jamais dans le chenal central (le lit reste en eau) ; a fleur d'eau au coeur des taches, sinon haut-fond sous 1 bloc d'eau.
     */
    static boolean bancs(CarteIle c, WorldGenLevel n, int x0, int z0, int mer) {
        if (c.distanceRiviere(x0 + 8, z0 + 8) > 170 && c.distanceLac(x0 + 8, z0 + 8) > 50) return false;
        double seuil = 0.9 - 0.6 * c.rnBancs;
        BlockPos.MutableBlockPos p = new BlockPos.MutableBlockPos();
        boolean pose = false;
        for (int z = z0; z < z0 + 16; z++) for (int x = x0; x < x0 + 16; x++) {
            double dr = c.distanceRiviere(x, z), dl = c.distanceLac(x, z);
            if (dr <= Rivieres.LIT + 4 || (dr > 150 && dl > 30)) continue;
            // anneau de berge des rivieres (Rivieres.poser peut passer apres et remblayer jusqu'a L+1 sur un fond remonte) : jamais de banc
            if (dr > Rivieres.BERGE - 4 && dr <= Rivieres.ANNEAU + 1) continue;
            double q = c.bruit(x / 17.0, z / 17.0, 471) + 0.4 * c.bruit(x / 6.0, z / 6.0, 472);
            if (q < seuil) continue;
            int yf = n.getHeight(Heightmap.Types.OCEAN_FLOOR_WG, x, z), ys = n.getHeight(Heightmap.Types.WORLD_SURFACE_WG, x, z);
            int d = ys - yf;
            if (d < 1 || d > 6) continue;                                               // marges : jusqu'a 6 blocs d'eau (berges raides des estuaires)
            if (!n.getFluidState(p.set(x, ys - 1, z)).isSource() || !n.getBlockState(p).is(Blocks.WATER)) continue;
            if (!fondMeuble(n.getBlockState(p.set(x, yf - 1, z)))) continue;
            // emerge seulement sur la terre de la carte ; en mer (embouchures) le banc reste sous 1 bloc d'eau
            int haut = (q > seuil + 0.2 && d <= 2 && c.distanceBlocs(x, z) > 0) ? ys - 1 : ys - 2;
            for (int y = yf; y <= haut; y++) { n.setBlock(p.set(x, y, z), Blocks.SAND.defaultBlockState(), 2); pose = true; }
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

    private static final net.minecraft.world.level.block.Block[] CORAIL_BLOC = {Blocks.TUBE_CORAL_BLOCK, Blocks.BRAIN_CORAL_BLOCK, Blocks.BUBBLE_CORAL_BLOCK, Blocks.FIRE_CORAL_BLOCK, Blocks.HORN_CORAL_BLOCK};
    private static final net.minecraft.world.level.block.Block[] CORAIL = {Blocks.TUBE_CORAL, Blocks.BRAIN_CORAL, Blocks.BUBBLE_CORAL, Blocks.FIRE_CORAL, Blocks.HORN_CORAL};
    private static final net.minecraft.world.level.block.Block[] EVENTAIL = {Blocks.TUBE_CORAL_FAN, Blocks.BRAIN_CORAL_FAN, Blocks.BUBBLE_CORAL_FAN, Blocks.FIRE_CORAL_FAN, Blocks.HORN_CORAL_FAN};

    /**
     * 0.9.5 lagon vivant : eau remise jusqu'a Y mer-1 sur le fond creuse, patates de blocs de corail (cinq couleurs par tache)
     * couronnees de coraux et d'eventails, sable clair ailleurs avec herbiers en taches et concombres de mer ; aucun varech.
     * Tout est pose sous l'eau (le corail ne meurt pas). Memes bruits que IleChamp.fondLagon.
     */
    static boolean lagon(CarteIle c, WorldGenLevel n, int x0, int z0, int mer) {
        RandomSource r = RandomSource.create(c.graineNature(x0 >> 4, z0 >> 4, 31));
        BlockPos.MutableBlockPos p = new BlockPos.MutableBlockPos();
        boolean pose = false;
        double vie = c.rnLagonVie;
        for (int z = z0; z < z0 + 16; z++) for (int x = x0; x < x0 + 16; x++) {
            int cl = c.classeA(x, z);
            CarteIle.Sculpture sc = c.sculptures.isEmpty() ? null : c.sculptureA(x, z);
            boolean autourIlot = sc != null && sc.ilot;                         // 0.9.6b : coraux et herbiers tout autour des ilots sculptes
            if (!autourIlot && cl != CarteIle.LAGON && cl != CarteIle.RECIF) continue;
            if ((c.distanceCarteBrute(x, z) > -12 && !autourIlot) || c.bordBassin(x, z, 16) || c.bassinA(x, z) != null) continue;   // 0.9.5d : coraux aussi autour des ilots (le fond emerge est saute plus bas)
            int yf = n.getHeight(Heightmap.Types.OCEAN_FLOOR_WG, x, z);       // premier bloc non solide au-dessus du fond
            if (yf >= mer) continue;                                             // fond emerge : rien
            // eau remise sur le fond creuse (jamais de fosse seche sous le niveau de la mer)
            for (int y = yf; y < mer; y++) { p.set(x, y, z); if (n.getBlockState(p).isAir()) { n.setBlock(p, Blocks.WATER.defaultBlockState(), 2); pose = true; } }
            int d = mer - yf;                                                    // blocs d'eau au-dessus du fond
            if (d < 1) continue;
            p.set(x, yf - 1, z);
            BlockState sol = n.getBlockState(p);
            if (!(sol.is(BlockTags.SAND) || sol.is(Blocks.GRAVEL) || sol.is(Blocks.DIRT) || sol.is(Blocks.CLAY) || sol.is(Blocks.STONE) || sol.is(Blocks.SANDSTONE) || sol.is(Blocks.MUD))) continue;
            BlockState dessus = n.getBlockState(p.set(x, yf, z));
            if (!dessus.is(Blocks.WATER) && !dessus.is(Blocks.SEAGRASS) && !dessus.is(Blocks.TALL_SEAGRASS) && !dessus.is(Blocks.KELP) && !dessus.is(Blocks.KELP_PLANT)) continue;
            double q = cl == CarteIle.LAGON ? IleChamp.patate(c, x, z) : (c.bruit(x / 9.0, z / 9.0, 5107) - (0.9 - 0.5 * vie));
            if (q > 0) {
                int k = (int) Math.floor((c.bruit(x / 7.0, z / 7.0, 5105) + 1) * 2.5); k = Math.max(0, Math.min(4, k));
                BlockState bloc = CORAIL_BLOC[k].defaultBlockState();
                for (int y = yf - 1; y >= yf - 2; y--) n.setBlock(p.set(x, y, z), bloc, 2);
                if (d >= 2 && r.nextDouble() < 0.35 + 0.25 * Math.min(1, q * 3)) {
                    int k2 = r.nextInt(5) == 0 ? r.nextInt(5) : k;
                    n.setBlock(p.set(x, yf, z), (r.nextInt(3) == 0 ? EVENTAIL[k2] : CORAIL[k2]).defaultBlockState(), 2);
                } else if (dessus.is(Blocks.KELP) || dessus.is(Blocks.KELP_PLANT)) n.setBlock(p.set(x, yf, z), Blocks.WATER.defaultBlockState(), 2);
                pose = true;
                continue;
            }
            // sable clair
            if (!sol.is(Blocks.SAND)) n.setBlock(p.set(x, yf - 1, z), Blocks.SAND.defaultBlockState(), 2);
            // pas de varech dans un lagon tropical
            for (int y = yf; y < mer; y++) { p.set(x, y, z); BlockState s = n.getBlockState(p); if (s.is(Blocks.KELP) || s.is(Blocks.KELP_PLANT)) n.setBlock(p, Blocks.WATER.defaultBlockState(), 2); }
            double h = c.bruit(x / 13.0, z / 13.0, 5106) + 0.3 * c.bruit(x / 5.0, z / 5.0, 5108);
            double u = r.nextDouble();
            if (h > 0.15 - 0.2 * vie && u < 0.75) {
                if (d >= 3 && u < 0.2) {
                    n.setBlock(p.set(x, yf, z), Blocks.TALL_SEAGRASS.defaultBlockState().setValue(net.minecraft.world.level.block.TallSeagrassBlock.HALF, net.minecraft.world.level.block.state.properties.DoubleBlockHalf.LOWER), 2);
                    n.setBlock(p.set(x, yf + 1, z), Blocks.TALL_SEAGRASS.defaultBlockState().setValue(net.minecraft.world.level.block.TallSeagrassBlock.HALF, net.minecraft.world.level.block.state.properties.DoubleBlockHalf.UPPER), 2);
                } else n.setBlock(p.set(x, yf, z), Blocks.SEAGRASS.defaultBlockState(), 2);
                pose = true;
            } else if (u < 0.02 * vie) {
                n.setBlock(p.set(x, yf, z), Blocks.SEA_PICKLE.defaultBlockState().setValue(net.minecraft.world.level.block.SeaPickleBlock.PICKLES, 1 + r.nextInt(4)), 2);
                pose = true;
            }
        }
        return pose;
    }

    /**
     * 0.9.6f : bancs de poissons du lagon. Le lagon est peu profond (3 a 8 blocs) et plein de coraux et d'herbiers :
     * l'apparition naturelle n'y met presque aucun poisson (0 compte en jeu le 15/11). On pose donc a la generation
     * des bancs de poissons tropicaux (3 a 6, meme motif par banc) et parfois un poisson-globe, persistants pour ne
     * pas disparaitre quand le joueur s'eloigne. Tout reste dans le chunk courant, entre le fond + 1 et la surface - 1.
     */
    static boolean poissons(CarteIle c, WorldGenLevel n, int x0, int z0, int mer) {
        RandomSource r = RandomSource.create(c.graineNature(x0 >> 4, z0 >> 4, 37));
        double dens = c.rnLagonPoissons;
        int bancs = (int) Math.floor(dens) + (r.nextDouble() < dens - Math.floor(dens) ? 1 : 0);
        if (bancs <= 0) return false;
        net.minecraft.server.level.ServerLevel sl = n.getLevel();
        BlockPos.MutableBlockPos p = new BlockPos.MutableBlockPos();
        boolean pose = false;
        for (int b = 0; b < bancs; b++) {
            int x = x0 + 2 + r.nextInt(12), z = z0 + 2 + r.nextInt(12);
            int cl = c.classeA(x, z);
            if (cl != CarteIle.LAGON && cl != CarteIle.RECIF) continue;
            if (c.bassinA(x, z) != null) continue;                              // jamais dans un bassin de port
            int yf = n.getHeight(Heightmap.Types.OCEAN_FLOOR_WG, x, z);
            if (mer - yf < 3) continue;
            boolean globe = r.nextInt(10) == 0;
            net.minecraft.world.entity.EntityType<? extends net.minecraft.world.entity.Mob> type =
                globe ? net.minecraft.world.entity.EntityType.PUFFERFISH : net.minecraft.world.entity.EntityType.TROPICAL_FISH;
            int nb = globe ? 1 : 3 + r.nextInt(4);
            net.minecraft.world.entity.SpawnGroupData groupe = null;
            for (int i = 0; i < nb; i++) {
                int xi = Math.max(x0, Math.min(x0 + 15, x + r.nextInt(3) - 1)), zi = Math.max(z0, Math.min(z0 + 15, z + r.nextInt(3) - 1));
                int yfi = n.getHeight(Heightmap.Types.OCEAN_FLOOR_WG, xi, zi);
                int d = mer - yfi;                                               // blocs d'eau de yfi a mer - 1
                if (d < 2) continue;
                p.set(xi, yfi + 1 + r.nextInt(Math.max(1, d - 2)), zi);
                if (!n.getBlockState(p).is(Blocks.WATER)) { p.set(xi, mer - 1, zi); if (!n.getBlockState(p).is(Blocks.WATER)) continue; }
                net.minecraft.world.entity.Mob m = type.create(sl);
                if (m == null) continue;
                m.moveTo(xi + 0.5, p.getY() + 0.2, zi + 0.5, r.nextFloat() * 360f, 0f);
                groupe = m.finalizeSpawn(n, n.getCurrentDifficultyAt(p), net.minecraft.world.entity.MobSpawnType.CHUNK_GENERATION, groupe);
                m.setPersistenceRequired();
                n.addFreshEntityWithPassengers(m);
                pose = true;
            }
        }
        return pose;
    }

    /** 0.9.5d : cocotiers des lieux sculptes : positions fixes (graine du lieu), sur le dessus sec (Y >= 63), espaces d'au moins 5 blocs */
    static boolean palmiers(CarteIle c, WorldGenLevel n, net.minecraft.world.level.chunk.ChunkGenerator gen, int x0, int z0) {
        boolean pose = false;
        for (CarteIle.Sculpture s : c.sculptures) {
            if (s.palmiers <= 0 || s.x0 > x0 + 15 || s.z0 > z0 + 15 || s.x0 + s.w <= x0 || s.z0 + s.h <= z0) continue;
            var reg = n.registryAccess().registryOrThrow(net.minecraft.core.registries.Registries.CONFIGURED_FEATURE);
            var arbre = reg.getHolder(net.minecraft.resources.ResourceKey.create(net.minecraft.core.registries.Registries.CONFIGURED_FEATURE, net.minecraft.resources.ResourceLocation.parse(s.arbre)));
            if (arbre.isEmpty()) continue;
            RandomSource r = RandomSource.create(s.nom.hashCode() * 31L + 7);
            java.util.List<int[]> pts = new java.util.ArrayList<>();
            for (int essai = 0; essai < 400 && pts.size() < s.palmiers; essai++) {
                int i = r.nextInt(s.w), k = r.nextInt(s.h);
                if (s.haut[k * s.w + i] < 63.3f || s.masque[k * s.w + i] < 0.99f) continue;
                boolean loin = true;
                for (int[] q : pts) if ((q[0] - i) * (q[0] - i) + (q[1] - k) * (q[1] - k) < 25) { loin = false; break; }
                if (loin) pts.add(new int[]{i, k});
            }
            for (int[] q : pts) {
                int x = s.x0 + q[0], z = s.z0 + q[1];
                if (x < x0 || x > x0 + 15 || z < z0 || z > z0 + 15) continue;
                int y = n.getHeight(Heightmap.Types.OCEAN_FLOOR_WG, x, z);
                BlockPos bp = new BlockPos(x, y, z);
                if (!n.getFluidState(bp).isEmpty() || !n.getFluidState(bp.below()).isEmpty()) continue;
                pose |= arbre.get().value().place(n, gen, RandomSource.create(x * 341873128712L + z * 132897987541L), bp);
            }
        }
        return pose;
    }

    /** 0.9.6c : vegetation naturelle dans les marges des lots et les fondus des plateaux (jamais dans un lot) :
     *  herbes, fougeres, buissons morts selon la region, et au plus un arbre du pays par chunk, a 4 blocs au moins du lot. Aucune structure. */
    static boolean vegetationMarges(CarteIle c, WorldGenLevel n, net.minecraft.world.level.chunk.ChunkGenerator gen, int x0, int z0) {
        boolean dedans = false;
        for (int k = 0; k < 16 && !dedans; k += 5) for (int i = 0; i < 16 && !dedans; i += 5) dedans = c.dansMargeOuFondu(x0 + i, z0 + k);
        if (!dedans) return false;
        int mer = gen.getSeaLevel();
        BlockPos.MutableBlockPos p = new BlockPos.MutableBlockPos();
        int type = typeRegion(biome(n, p.set(x0 + 8, mer + 4, z0 + 8)));
        RandomSource r = RandomSource.create(c.graineNature(x0 >> 4, z0 >> 4, 31));
        double k = c.rnVegMarges; boolean pose = false;
        java.util.List<int[]> libres = new java.util.ArrayList<>();
        for (int z = z0; z < z0 + 16; z++) for (int x = x0; x < x0 + 16; x++) {
            if (!c.dansMargeOuFondu(x, z)) continue;
            int y = n.getHeight(Heightmap.Types.OCEAN_FLOOR_WG, x, z) - 1;
            if (y <= mer) continue;
            p.set(x, y, z);
            BlockState s = n.getBlockState(p);
            if (!(s.is(Blocks.GRASS_BLOCK) || s.is(Blocks.DIRT) || s.is(Blocks.COARSE_DIRT) || s.is(Blocks.PODZOL) || s.is(Blocks.ROOTED_DIRT))) continue;
            BlockPos h = p.above();
            if (!n.isEmptyBlock(h) || !n.getFluidState(h).isEmpty()) continue;
            if (!c.dansLot(x - 4, z) && !c.dansLot(x + 4, z) && !c.dansLot(x, z - 4) && !c.dansLot(x, z + 4)) libres.add(new int[]{x, y + 1, z});
            double q = 0.5 + 0.5 * c.bruit(x / 9.0, z / 9.0, 4251);                      // touffes, pas un semis regulier
            if (r.nextDouble() > 0.42 * k * q) continue;
            int t = r.nextInt(100);
            BlockState plante;
            if (type == 0) plante = t < 62 ? Blocks.SHORT_GRASS.defaultBlockState() : t < 80 ? Blocks.TALL_GRASS.defaultBlockState() : t < 94 ? Blocks.DEAD_BUSH.defaultBlockState() : Blocks.DANDELION.defaultBlockState();
            else if (type == 1) plante = t < 45 ? Blocks.SHORT_GRASS.defaultBlockState() : t < 70 ? Blocks.FERN.defaultBlockState() : t < 88 ? Blocks.TALL_GRASS.defaultBlockState() : Blocks.LARGE_FERN.defaultBlockState();
            else if (type == 2) plante = t < 60 ? Blocks.SHORT_GRASS.defaultBlockState() : t < 92 ? Blocks.FERN.defaultBlockState() : Blocks.LARGE_FERN.defaultBlockState();
            else plante = t < 70 ? Blocks.SHORT_GRASS.defaultBlockState() : t < 88 ? Blocks.TALL_GRASS.defaultBlockState() : t < 95 ? Blocks.POPPY.defaultBlockState() : Blocks.DANDELION.defaultBlockState();
            if (s.is(Blocks.COARSE_DIRT) && plante.is(Blocks.SHORT_GRASS)) plante = Blocks.DEAD_BUSH.defaultBlockState();
            if (!plante.canSurvive(n, h)) continue;
            if (plante.getBlock() instanceof net.minecraft.world.level.block.DoublePlantBlock) {
                if (!n.isEmptyBlock(h.above())) continue;
                net.minecraft.world.level.block.DoublePlantBlock.placeAt(n, plante, h, 2);
            } else n.setBlock(h, plante, 2);
            pose = true;
        }
        if (!libres.isEmpty() && r.nextDouble() < 0.4 * k) {                              // un arbre du pays au plus
            String id = type == 0 ? "minecraft:acacia" : type == 1 ? "minecraft:jungle_bush" : type == 2 ? "minecraft:spruce" : "minecraft:oak";
            var reg = n.registryAccess().registryOrThrow(net.minecraft.core.registries.Registries.CONFIGURED_FEATURE);
            var arbre = reg.getHolder(net.minecraft.resources.ResourceKey.create(net.minecraft.core.registries.Registries.CONFIGURED_FEATURE, net.minecraft.resources.ResourceLocation.parse(id)));
            int[] q = libres.get(r.nextInt(libres.size()));
            if (arbre.isPresent()) pose |= arbre.get().value().place(n, gen, RandomSource.create(q[0] * 341873128712L + q[2] * 132897987541L), new BlockPos(q[0], q[1], q[2]));
        }
        return pose;
    }

    /** debris rares : cloture cassee, poteau a un bras, epave rouillee ; au plus un par chunk */
    static boolean debris(CarteIle c, WorldGenLevel n, int x0, int z0, int mer) {
        RandomSource r = RandomSource.create(c.graineNature(x0 >> 4, z0 >> 4, 23));
        if (r.nextDouble() >= c.rnDebris) return false;
        if (c.distanceRiviere(x0 + 8, z0 + 8) < 40 || c.distanceLac(x0 + 8, z0 + 8) < 30 || c.distanceBlocs(x0 + 8, z0 + 8) < 24) return false;
        int t = r.nextInt(100);
        int x = x0 + 4 + r.nextInt(8), z = z0 + 4 + r.nextInt(8);
        boolean g = c.rnDebrisTaille > 0;
        if (t < 40) return cloture(n, r, x, z, mer, g);
        if (t < 72) return poteau(n, r, x, z, mer, g);
        return epave(n, r, x, z, mer, g);
    }

    private static boolean cloture(WorldGenLevel n, RandomSource r, int x, int z, int mer, boolean g) {
        boolean axeX = r.nextBoolean();
        int lg = g ? 6 + r.nextInt(7) : 4 + r.nextInt(5);
        BlockState f = (r.nextBoolean() ? Blocks.SPRUCE_FENCE : Blocks.DARK_OAK_FENCE).defaultBlockState();
        BlockPos.MutableBlockPos p = new BlockPos.MutableBlockPos();
        boolean pose = false;
        int x1 = x - (axeX ? lg / 2 : 0), z1 = z - (axeX ? 0 : lg / 2);
        if (g) {   // 0.9.5 : la cloture tient dans le chunk (plus longue)
            if (axeX) x1 = Math.max(x & ~15, Math.min(x1, (x & ~15) + 16 - lg)); else z1 = Math.max(z & ~15, Math.min(z1, (z & ~15) + 16 - lg));
        }
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

    private static boolean poteau(WorldGenLevel n, RandomSource r, int x, int z, int mer, boolean g) {
        int y = plat(n, x, z, new int[][]{{0, 0}}, mer);
        if (y == Integer.MIN_VALUE) return false;
        BlockPos.MutableBlockPos p = new BlockPos.MutableBlockPos();
        boolean penche = r.nextInt(3) == 0;
        int h = g ? (penche ? 4 + r.nextInt(2) : 6 + r.nextInt(4)) : (penche ? 3 + r.nextInt(2) : 5 + r.nextInt(3));
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

    private static boolean epave(WorldGenLevel n, RandomSource r, int x, int z, int mer, boolean g) {
        boolean axeX = r.nextBoolean();
        int L = g ? 5 + r.nextInt(2) : 4;   // 0.9.5 : epave de 5-6 blocs
        if (g) { if (axeX) x = Math.min(x, (x & ~15) + 16 - L); else z = Math.min(z, (z & ~15) + 16 - L); }
        int[][] cols = new int[2 * L][];
        int i = 0;
        for (int a = 0; a < L; a++) for (int b = 0; b < 2; b++) cols[i++] = axeX ? new int[]{a, b} : new int[]{b, a};
        int y = plat(n, x, z, cols, mer);
        if (y == Integer.MIN_VALUE) return false;
        BlockPos.MutableBlockPos p = new BlockPos.MutableBlockPos();
        for (int[] q : cols) { p.set(x + q[0], y, z + q[1]); if (!libre(n, p)) return false; }
        // sol plus bas d'un bloc sous une partie de l'epave : on le comble (jamais d'epave au-dessus du vide)
        for (int[] q : cols) {
            int h = n.getHeight(Heightmap.Types.OCEAN_FLOOR_WG, x + q[0], z + q[1]);
            for (int yy = h; yy < y; yy++) { p.set(x + q[0], yy, z + q[1]); if (libre(n, p)) n.setBlock(p, Blocks.COARSE_DIRT.defaultBlockState(), 2); }
        }
        BlockState caisse = (r.nextBoolean() ? Blocks.WEATHERED_CUT_COPPER : Blocks.OXIDIZED_CUT_COPPER).defaultBlockState();
        BlockState toit = (r.nextBoolean() ? Blocks.WEATHERED_CUT_COPPER_SLAB : Blocks.EXPOSED_CUT_COPPER_SLAB).defaultBlockState();
        Direction avant = axeX ? Direction.EAST : Direction.SOUTH;
        for (int[] q : cols) {
            int a = axeX ? q[0] : q[1];
            p.set(x + q[0], y, z + q[1]);
            // roues : coins avant et arriere, en charbon (pneus) ; caisse rouillee ; une roue manquante parfois
            boolean roue = (a == 0 || a == L - 1);
            // roue manquante : la caisse repose sur la jante (jamais de bloc au-dessus du vide)
            n.setBlock(p, roue && r.nextInt(4) != 0 ? Blocks.COAL_BLOCK.defaultBlockState() : caisse, 2);
            p.move(0, 1, 0);
            boolean plein = true;
            if (a == L - 1) { n.setBlock(p, Blocks.WEATHERED_CUT_COPPER_STAIRS.defaultBlockState().setValue(StairBlock.FACING, avant.getOpposite()), 2); plein = false; }   // capot
            else if (a == 0) n.setBlock(p, caisse, 2);
            else if (r.nextInt(3) != 0) { n.setBlock(p, toit, 2); plein = false; }     // toit creve
            else p.move(0, -1, 0);                                                       // pas de toit : la mousse va sur la caisse
            // mousse seulement sur un bloc plein (jamais sur une dalle, un escalier ou le vide)
            if (plein && r.nextInt(4) == 0) { p.move(0, 1, 0); if (libre(n, p)) n.setBlock(p, Blocks.MOSS_CARPET.defaultBlockState(), 2); }
        }
        // vegetation qui reprend : herbes hautes autour
        for (int k = 0; k < 4; k++) {
            int bx = x - 1 + r.nextInt(axeX ? L + 2 : 4), bz = z - 1 + r.nextInt(axeX ? 4 : L + 2);
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
