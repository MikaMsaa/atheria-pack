package fr.atheria.monde;

import net.minecraft.core.BlockPos;
import net.minecraft.world.level.WorldGenLevel;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.chunk.ChunkAccess;

// Grand Nid de Bancoul (chapitre 4) : caverne organique a l'ouest de la station des veilleurs (volume reserve
// x 2000..2079, z -2784..-2721). On y entre par une breche dans le fond de la station (z -2760). Deux corniches
// (on marche a Y 54) separees par une fosse de 12 blocs (fond Y 41) : le pont de roche est casse au milieu,
// d'ou « une corde ou seize echelles ». Chair fongique (verrues, champignons, sculk), tiges qui relient sol et
// voute, lianes pourpres, rares lueurs. La Mere du Nid se pose a la main au plafond (/bestiaire unique mere_du_nid).
final class Nid {
    static final int X1 = 2000, X2 = 2079, Z1 = -2784, Z2 = -2721, CX = 2040, CZ = -2752, AXE = -2760;
    static final int PASSAGE_X2 = 2092;

    private Nid() {
    }

    static int creuser(WorldGenLevel niv, ChunkAccess chunk, BlockPos.MutableBlockPos p, long g) {
        int x0 = chunk.getPos().getMinBlockX(), z0 = chunk.getPos().getMinBlockZ();
        if (x0 + 15 < X1 || x0 > PASSAGE_X2 || z0 + 15 < Z1 || z0 > Z2) return 0;
        int n = 0;
        for (int x = x0; x < x0 + 16; x++) for (int z = z0; z < z0 + 16; z++) {
            if (x > X2 - 4 && x <= PASSAGE_X2) n += passage(niv, p, x, z, g);
            if (x >= X1 && x <= X2 && z >= Z1 && z <= Z2) n += colonne(niv, p, x, z, g);
        }
        if (n > 0) org.apache.logging.log4j.LogManager.getLogger().debug("[Atheria] Nid : chunk " + x0 + "," + z0 + " " + n);
        return n;
    }

    // breche dans le fond de la station, couloir brut jusqu'a la corniche est
    static int passage(WorldGenLevel niv, BlockPos.MutableBlockPos p, int x, int z, long g) {
        double demi = 2.4 + (Galeries.bruit(x, 7, 3, g) - 0.5) * 1.2;
        if (Math.abs(z + 0.5 - AXE) >= demi) return 0;
        int n = 0;
        n += pose(niv, p.set(x, 53, z), Galeries.h01(x, z, g) < 0.3 ? Blocks.GRAVEL.defaultBlockState() : Blocks.STONE.defaultBlockState());
        int haut = 56 + (Galeries.h01(x, z + 3, g) < 0.5 ? 1 : 0);
        for (int y = 54; y <= haut; y++) n += pose(niv, p.set(x, y, z), Blocks.AIR.defaultBlockState());
        // eboulis de la breche, au pied du fond de la station
        if (x >= 2086 && Galeries.h01(x, z * 7, g) < 0.45) n += pose(niv, p.set(x, 54, z), Galeries.eboulis(Galeries.h01(x, z + 11, g)));
        else if (x < 2086 && Galeries.h01(x, z * 5, g) < 0.10) n += pose(niv, p.set(x, 54, z), Blocs.b("spore:growths_small", Blocks.NETHER_WART_BLOCK.defaultBlockState()));
        return n;
    }

    static int colonne(WorldGenLevel niv, BlockPos.MutableBlockPos p, int x, int z, long g) {
        double n1 = Galeries.bruit(x, z, 7, g), n2 = Galeries.bruit(x + 500, z, 5, g), n3 = Galeries.bruit(x, z + 900, 9, g);
        double u = (x + 0.5 - CX) / 38.0, v = (z + 0.5 - CZ) / 29.0;
        double r = Math.sqrt(u * u + v * v) + (n1 - 0.5) * 0.3;
        if (r >= 1) return 0;
        double dome = Math.sqrt(Math.max(0, 1 - r * r));
        int ciel = (int) Math.round(55 + 7 * dome + (n2 - 0.5) * 3);
        ciel = Math.max(56, Math.min(63, ciel));
        double ax = Math.abs(x + 0.5 - CX);
        boolean chemin = Math.abs(z + 0.5 - AXE) < 2.5;
        boolean fosse = ax < 8 + (n3 - 0.5) * 6 && r < 0.9;
        boolean pont = fosse && Math.abs(z + 0.5 - AXE) < 1.6 && ax > 2.6;
        int sol;
        if (fosse) sol = 41 + (int) Math.round(n1 * 2);
        else {
            sol = 53 + (n2 > 0.72 ? 1 : 0) - (n2 < 0.2 ? 1 : 0);
            if (r > 0.85) sol = Math.max(sol, 53 + (int) Math.round((r - 0.85) * 20));
            if (chemin) sol = 53;
        }
        if (ciel - sol < 3) return 0;
        int n = 0;
        double h = Galeries.h01(x, z, g), h2 = Galeries.h01(x, z + 7919, g), h3 = Galeries.h01(x * 3 + 7, z - 31, g), h4 = Galeries.h01(x - 91, z * 3, g);
        n += pose(niv, p.set(x, sol - 1, z), Blocks.STONE.defaultBlockState());
        n += pose(niv, p.set(x, sol, z), solNid(fosse, h));
        for (int y = sol + 1; y < ciel; y++) n += pose(niv, p.set(x, y, z), Blocks.AIR.defaultBlockState());
        n += pose(niv, p.set(x, ciel, z), voute(h4));
        if (pont) {
            // pont de roche casse au milieu : tablier Y 50..53 au-dessus de la fosse
            for (int y = 50; y <= 53; y++) n += pose(niv, p.set(x, y, z), y == 53 && Galeries.h01(x, z + 5, g) < 0.4 ? Blocks.MOSSY_COBBLESTONE.defaultBlockState() : Galeries.roche(Galeries.h01(x, y + z, g), false));
            if (Galeries.h01(x, z + 9, g) < 0.06) n += pose(niv, p.set(x, 54, z), Blocks.COBWEB.defaultBlockState());
            sol = 53;
        }
        // tiges qui relient sol et voute (hors du chemin)
        if (h3 < 0.012 && !chemin) {
            for (int y = sol + 1; y < ciel; y++) n += pose(niv, p.set(x, y, z), Galeries.h01(x, y * 7 + z, g) < 0.15 ? Blocs.b("spore:biomass_bulb", Blocks.NETHER_WART_BLOCK.defaultBlockState())
                : Blocs.b("spore:fungal_stem", Blocks.MUSHROOM_STEM.defaultBlockState()));
            return n;
        }
        // monticules de chair au fond de la fosse
        if (fosse && !pont && Galeries.bruit(x * 2, z * 2 + 77, 4, g) < 0.22) {
            n += pose(niv, p.set(x, sol + 1, z), Blocs.b("spore:biomass_block", Blocks.NETHER_WART_BLOCK.defaultBlockState()));
            if (h2 < 0.4) n += pose(niv, p.set(x, sol + 2, z), h2 < 0.1 ? Blocks.SHROOMLIGHT.defaultBlockState() : Blocs.b("spore:growths_big", Blocks.RED_MUSHROOM_BLOCK.defaultBlockState()));
        } else if (h2 < 0.05) n += pose(niv, p.set(x, sol + 1, z), h2 < 0.025 ? Blocs.b("spore:growths_big", Blocks.RED_MUSHROOM.defaultBlockState()) : Blocs.b("spore:growths_small", Blocks.BROWN_MUSHROOM.defaultBlockState()));
        else if (h2 < 0.065) n += pose(niv, p.set(x, sol + 1, z), Blocs.b("spore:rotten_scraps", Blocks.BONE_BLOCK.defaultBlockState()));
        else if (h2 < 0.08) n += pose(niv, p.set(x, sol + 1, z), Blocks.BONE_BLOCK.defaultBlockState());
        else if (h2 > 0.88 && h2 <= 0.93 && !chemin) n += pose(niv, p.set(x, sol + 1, z), Blocs.b("spore:fungal_roots", Blocks.CRIMSON_ROOTS.defaultBlockState()));
        else if (h2 < 0.11 && !chemin) n += pose(niv, p.set(x, sol + 1, z), Blocks.COBWEB.defaultBlockState());
        else if (h2 > 0.93) n += pose(niv, p.set(x, sol + 1, z), Blocks.MOSS_CARPET.defaultBlockState());
        // lianes pourpres qui pendent de la voute (pas au-dessus du chemin des corniches)
        if (h4 > 0.90 && !(chemin && !fosse)) {
            int lg = 1 + (int) (Galeries.h01(x, z + 13, g) * (fosse ? 9 : 3));
            int bas = Math.max(sol + 2, ciel - lg);
            for (int y = ciel - 1; y >= bas; y--)
                n += pose(niv, p.set(x, y, z), y == bas ? Blocks.WEEPING_VINES.defaultBlockState() : Blocks.WEEPING_VINES_PLANT.defaultBlockState());
        } else if (h4 > 0.84 && h4 <= 0.90 && !(chemin && !fosse)) {
            n += pose(niv, p.set(x, ciel - 1, z), Blocs.b("spore:hanging_fungal_stem", Blocks.WEEPING_VINES.defaultBlockState()));
        }
        return n;
    }

    static BlockState solNid(boolean fosse, double h) {
        if (fosse) {
            if (h < 0.30) return Blocs.b("spore:biomass_block", Blocks.SCULK.defaultBlockState());
            if (h < 0.45) return Blocs.b("spore:rooted_biomass", Blocks.NETHER_WART_BLOCK.defaultBlockState());
            if (h < 0.58) return Blocs.b("spore:sicken_biomass_block", Blocks.NETHER_WART_BLOCK.defaultBlockState());
            if (h < 0.68) return Blocks.SCULK.defaultBlockState();
            if (h < 0.75) return Blocs.b("spore:calcified_biomass_block", Blocks.BONE_BLOCK.defaultBlockState());
            return Blocs.b("spore:mycelium_block", Blocks.MYCELIUM.defaultBlockState());
        }
        if (h < 0.22) return Blocs.b("spore:rooted_mycelium", Blocks.PODZOL.defaultBlockState());
        if (h < 0.40) return Blocs.b("spore:mycelium_block", Blocks.MYCELIUM.defaultBlockState());
        if (h < 0.52) return Blocks.MOSS_BLOCK.defaultBlockState();
        if (h < 0.62) return Blocs.b("spore:biomass_block", Blocks.NETHER_WART_BLOCK.defaultBlockState());
        return (h < 0.80 ? Blocks.COARSE_DIRT : Blocks.STONE).defaultBlockState();
    }

    static BlockState voute(double h) {
        if (h < 0.03) return Blocks.SHROOMLIGHT.defaultBlockState();
        if (h < 0.20) return Blocs.b("spore:membrane_block", Blocks.NETHER_WART_BLOCK.defaultBlockState());
        if (h < 0.33) return Blocs.b("spore:biomass_block", Blocks.NETHER_WART_BLOCK.defaultBlockState());
        if (h < 0.43) return Blocs.b("spore:mycelium_block", Blocks.RED_MUSHROOM_BLOCK.defaultBlockState());
        if (h < 0.50) return Blocks.SCULK.defaultBlockState();
        return Blocks.STONE.defaultBlockState();
    }

    static int pose(WorldGenLevel niv, BlockPos p, BlockState b) { return Galeries.pose(niv, p, b); }
}
