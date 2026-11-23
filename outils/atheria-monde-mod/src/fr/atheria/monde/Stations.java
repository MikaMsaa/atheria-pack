package fr.atheria.monde;

import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.tags.BlockTags;
import net.minecraft.world.level.WorldGenLevel;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.CandleBlock;
import net.minecraft.world.level.block.WallBannerBlock;
import net.minecraft.world.level.block.LadderBlock;
import net.minecraft.world.level.block.LanternBlock;
import net.minecraft.world.level.block.RailBlock;
import net.minecraft.world.level.block.StairBlock;
import net.minecraft.world.level.block.VineBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.RailShape;
import net.minecraft.world.level.chunk.ChunkAccess;

// Stations du tram creusees a la generation, dans les volumes reserves de la carte (Y 48..58).
// Meme gabarit de voie que les tunnels ; la salle monte a Y 57 (voute Y 58). Quais a Y 53 (on marche a Y 54),
// carrelage blanc a frise de couleur comme Bancoul, piliers, bancs, plafonniers morts, gravats, toiles.
// Majicavo : terminus a deux quais avec l'escalier du puits jusqu'a la surface. Petites stations de l'embranchement
// (jamais ouvert) : un ou deux quais, l'escalier vers la surface est effondre (bouchon d'eboulis dans le mur).
final class Stations {
    // ligne, debut et fin de salle (abscisse), largeur de quai cote + et cote -, frise, sortie (abscisse ou -1), terminus
    record Station(int ligne, double s1, double s2, int qp, int qm, Block frise, double sortie, boolean terminus, int genre) {}
    // genre : 0 petite station, 1 Majicavo (puits), 2 veilleurs (mur des visages gris, campement, rame de Hajar, escalier vers la bouche)

    static final Station[] LISTE;
    static final int MX1 = 2577, MX2 = 2580, MZ_PALIER = -2016, MZ_ESC = -2012;   // puits de Majicavo
    static final int VX0 = 2141, VX1 = 2172, VZ1 = -2755, VZ2 = -2752;              // escalier des veilleurs (vers la bouche, plein est)
    static final int RX1 = 2100, RX2 = 2119;                                         // rame de Hajar

    static {
        double[] lg = new double[Galeries.LIGNES.length];
        double avant = 0;
        for (int li = 0; li < Galeries.LIGNES.length; li++) {
            double[][] l = Galeries.LIGNES[li];
            for (int i = 0; i + 1 < l.length; i++) {
                double t = Math.hypot(l[i + 1][0] - l[i][0], l[i + 1][1] - l[i][1]);
                if (li == 0 && i + 2 == l.length) avant = lg[li];
                lg[li] += t;
            }
        }
        // embranchement : abscisse de chaque sommet (troncons droits des petites stations 2 et 3, puis veilleurs)
        double[][] l1 = Galeries.LIGNES[1];
        double[] cum = new double[l1.length];
        for (int i = 1; i < l1.length; i++) cum[i] = cum[i - 1] + Math.hypot(l1[i][0] - l1[i - 1][0], l1[i][1] - l1[i - 1][1]);
        LISTE = new Station[] {
            // Majicavo : dernier troncon plein sud (z -2032 -> -1992) ; quai est (cote -) large vers le puits, quai ouest etroit
            new Station(0, avant + 4, lg[0] - 3, 4, 5, Blocks.RED_TERRACOTTA, -1, true, 1),
            new Station(1, 84, 108, 5, 0, Blocks.YELLOW_TERRACOTTA, 96, false, 0),
            new Station(1, cum[2] + 0.5, cum[3] - 0.5, 4, 4, Blocks.LIME_TERRACOTTA, (cum[2] + cum[3]) / 2, false, 0),
            new Station(1, cum[4] + 0.5, cum[5] - 0.5, 0, 5, Blocks.LIGHT_BLUE_TERRACOTTA, (cum[4] + cum[5]) / 2, false, 0),
            // veilleurs : dernier troncon plein ouest (z -2760, x 2144 -> 2088) ; quai nord (+) = mur des visages, quai sud (-) = campement
            new Station(1, cum[6] + 4, lg[1] - 4, 6, 6, Blocks.GRAY_TERRACOTTA, -1, true, 2),
        };
    }

    private Stations() {
    }

    // -1 : colonne hors station (le tunnel normal s'en charge) ; sinon nombre de blocs poses
    static int colonne(WorldGenLevel niv, BlockPos.MutableBlockPos p, int x, int z, double[] m, long g) {
        double d = m[0], s = m[1], cote = m[3];
        int li = (int) m[2];
        Station st = null;
        for (Station c : LISTE) if (c.ligne == li && s >= c.s1 - 1 && (c.terminus || s < c.s2 + 1)) { st = c; break; }
        if (st == null) return -1;
        int W = cote > 0 ? st.qp : st.qm;
        if (d >= 4 + W) return 0;
        boolean salle = s >= st.s1 && s < st.s2;
        int n = 0;
        double hC = Galeries.h01(x, z, g), hC2 = Galeries.h01(x, z + 7919, g), hC3 = Galeries.h01(x * 3 + 1, z - 4111, g);
        // murs de bout de salle (et fond du terminus, voie comprise)
        if (!salle) {
            boolean fond = st.terminus && s >= st.s2;
            if (d < 3 && !fond) return -1;
            if (st.genre == 2 && x == VX0 - 1 && z >= VZ1 && z <= VZ2) {
                n += pose(niv, p.set(x, 52, z), Blocks.STONE.defaultBlockState());
                n += pose(niv, p.set(x, 53, z), Blocks.POLISHED_ANDESITE.defaultBlockState());
                for (int y = 54; y <= 56; y++) n += pose(niv, p.set(x, y, z), Blocks.AIR.defaultBlockState());
                return n + pose(niv, p.set(x, 57, z), Blocks.SMOOTH_STONE.defaultBlockState());
            }
            for (int y = 51; y <= 58; y++) n += pose(niv, p.set(x, y, z), y >= 54 && y <= 57 ? carreau(x, y, z, st, g) : Galeries.roche(Galeries.h01(x, y * 31 + z, g), y == 58));
            return n;
        }
        n += pose(niv, p.set(x, 51, z), Galeries.roche(hC, false));
        n += pose(niv, p.set(x, 58, z), plafond(hC3, d, s, st.genre == 2 && hC2 < 0.35));
        if (d < 3) {
            // voie : ballast, rails (quelques-uns arraches), heurtoir au bout du terminus
            n += pose(niv, p.set(x, 52, z), hC < 0.08 ? Blocks.COARSE_DIRT.defaultBlockState() : Blocks.GRAVEL.defaultBlockState());
            for (int y = 53; y <= 57; y++) n += pose(niv, p.set(x, y, z), Blocks.AIR.defaultBlockState());
            RailShape forme = Galeries.RAILS.get(Galeries.cle(x, z));
            if (st.terminus && s >= st.s2 - 1.5) {
                if (forme != null) { n += pose(niv, p.set(x, 53, z), Blocks.POLISHED_ANDESITE.defaultBlockState()); n += pose(niv, p.set(x, 54, z), Blocks.RED_CONCRETE.defaultBlockState()); }
            } else if (forme != null && hC2 >= 0.03) {
                n += pose(niv, p.set(x, 53, z), Blocks.RAIL.defaultBlockState().setValue(RailBlock.SHAPE, forme));
            }
            if (st.genre == 2 && x >= RX1 && x <= RX2) return n + rame(niv, p, x, z, g);
            if (d < 1 && Math.floor(s) % 8 == 4 && Galeries.h01((int) Math.floor(s / 8), 21 + li, g) < 0.4)
                n += pose(niv, p.set(x, 57, z), Blocks.LANTERN.defaultBlockState().setValue(LanternBlock.HANGING, true));
            return n;
        }
        if (d < 3 + W) {
            // quai
            n += pose(niv, p.set(x, 52, z), Blocks.STONE.defaultBlockState());
            BlockState sol = d < 4 ? Blocks.SMOOTH_STONE.defaultBlockState() : hC2 < 0.07 ? Blocks.ANDESITE.defaultBlockState()
                : hC2 < 0.10 ? Blocks.COBBLESTONE.defaultBlockState() : Blocks.POLISHED_ANDESITE.defaultBlockState();
            n += pose(niv, p.set(x, 53, z), sol);
            for (int y = 54; y <= 57; y++) n += pose(niv, p.set(x, y, z), Blocks.AIR.defaultBlockState());
            double mil = 3 + W / 2.0, sm8 = ((s % 8) + 8) % 8;
            boolean pilier = W >= 5 && Math.abs(d - mil) < 0.5 && sm8 < 1;
            boolean adosse = d >= 3 + W - 1;
            if (pilier) {
                for (int y = 54; y <= 56; y++) n += pose(niv, p.set(x, y, z), Blocks.POLISHED_ANDESITE.defaultBlockState());
                n += pose(niv, p.set(x, 57, z), Blocks.CHISELED_STONE_BRICKS.defaultBlockState());
                return n;
            }
            if (st.genre == 2) return n + quaiVeilleurs(niv, p, x, z, d, W, cote, m, g);
            // eboulis devant l'escalier effondre
            if (st.sortie >= 0 && Math.abs(s - st.sortie) < 2.5 && d >= 3 + W - 2.2 && cote == sortieCote(st)) {
                int h = Math.abs(s - st.sortie) < 1.2 && adosse ? 2 : 1;
                for (int y = 54; y < 54 + h; y++) n += pose(niv, p.set(x, y, z), Galeries.eboulis(Galeries.h01(x, y * 13 + z, g)));
                return n;
            }
            if (adosse && sm8 >= 4 && sm8 < 6 && !(st.genre == 1 && enPalier(x, z))) {
                Direction vers = dominant(cote * m[4], cote * m[5]);
                n += pose(niv, p.set(x, 54, z), Blocs.p(Blocs.b("handcrafted:spruce_bench", Blocks.SPRUCE_STAIRS.defaultBlockState()), "facing", vers.getOpposite().getSerializedName()));
            } else if (adosse && sm8 >= 1.5 && sm8 < 2.5 && hC3 < 0.5 && st.genre != 2) {
                // distributeur mort : boitier Create et vitre noire (comme a la station des Enfants)
                n += pose(niv, p.set(x, 54, z), Blocs.b("create:andesite_casing", Blocks.POLISHED_ANDESITE.defaultBlockState()));
                n += pose(niv, p.set(x, 55, z), Blocs.b("create:andesite_casing", Blocks.POLISHED_ANDESITE.defaultBlockState()));
                n += pose(niv, p.set(x, 56, z), Blocks.BLACK_STAINED_GLASS.defaultBlockState());
            } else if (hC < 0.035) {
                n += pose(niv, p.set(x, 54, z), hC3 < 0.5 ? Blocks.COBBLESTONE.defaultBlockState() : Blocks.GRAVEL.defaultBlockState());
            } else if (hC < 0.06) {
                n += pose(niv, p.set(x, 54, z), Blocks.ANDESITE_SLAB.defaultBlockState());
            } else if (hC < 0.075) {
                n += pose(niv, p.set(x, 54, z), Blocs.b("spore:rotten_scraps", Blocks.MOSS_CARPET.defaultBlockState()));
            } else if (hC < 0.10) {
                n += pose(niv, p.set(x, 54, z), Blocks.MOSS_CARPET.defaultBlockState());
            } else if (adosse && hC < 0.12) {
                n += pose(niv, p.set(x, 54, z), Blocs.b("supplementaries:sack", Blocks.BARREL.defaultBlockState()));
            } else if (adosse && hC2 > 0.985) {
                n += pose(niv, p.set(x, 54, z), Blocks.LANTERN.defaultBlockState());
            }
            if (adosse && hC2 > 0.93) n += pose(niv, p.set(x, 57, z), Blocks.COBWEB.defaultBlockState());
            return n;
        }
        // mur carrele du quai (ou mur de voie quand il n'y a pas de quai de ce cote)
        for (int y = 52; y <= 53; y++) n += pose(niv, p.set(x, y, z), Galeries.roche(Galeries.h01(x, y * 31 + z, g), false));
        boolean breche = st.sortie >= 0 && Math.abs(s - st.sortie) < 1.5 && cote == sortieCote(st);
        boolean porte = st.genre == 1 && x == MX1 - 1 && z >= MZ_PALIER && z < MZ_PALIER + 4;
        for (int y = 54; y <= 57; y++) {
            BlockState b;
            if (porte && y <= 56) b = Blocks.AIR.defaultBlockState();
            else if (porte) b = Blocks.SMOOTH_STONE.defaultBlockState();
            else if (breche && y <= 56) b = Galeries.eboulis(Galeries.h01(x, y * 7 + z, g));
            else if (breche) b = Blocks.CRACKED_STONE_BRICKS.defaultBlockState();
            else if (st.genre == 2 && cote > 0 && y <= 56 && x >= 2094 && x <= 2138) b = cendre(x, y, z, st, g);
            else b = carreau(x, y, z, st, g);
            n += pose(niv, p.set(x, y, z), b);
        }
        return n;
    }

    // mur des visages gris : noms ecrits a la cendre (taches grises et noires, rien de lisible)
    static BlockState cendre(int x, int y, int z, Station st, long g) {
        double h = Galeries.h01(x * 5 + y, z * 3 - y, g), b = Galeries.bruit(x, y * 13 + z, 2, g);
        if (b < 0.45 || h < 0.25) {
            if (h < 0.30) return Blocks.GRAY_CONCRETE.defaultBlockState();
            if (h < 0.50) return Blocks.GRAY_CONCRETE_POWDER.defaultBlockState();
            if (h < 0.68) return Blocks.LIGHT_GRAY_CONCRETE.defaultBlockState();
            if (h < 0.80) return Blocks.BLACK_CONCRETE.defaultBlockState();
        }
        return carreau(x, y, z, st, g);
    }

    // quais des veilleurs : bougies et releves (bannieres blanches) au pied du mur des visages, campement en face
    static int quaiVeilleurs(WorldGenLevel niv, BlockPos.MutableBlockPos p, int x, int z, double d, int W, double cote, double[] m, long g) {
        int n = 0;
        double h = Galeries.h01(x * 11, z * 7 + 3, g), h2 = Galeries.h01(x + 401, z * 13, g);
        boolean adosse = d >= 3 + W - 1, second = !adosse && d >= 3 + W - 2;
        Direction versVoie = dominant(-cote * m[4], -cote * m[5]);
        if (cote > 0) {
            if (x < 2094 || x > 2138) return 0;
            if ((adosse && h < 0.45) || (second && h < 0.12)) {
                Block c = h2 < 0.4 ? Blocks.WHITE_CANDLE : h2 < 0.7 ? Blocks.GRAY_CANDLE : h2 < 0.85 ? Blocks.LIGHT_GRAY_CANDLE : Blocks.BLACK_CANDLE;
                BlockState bougie = c.defaultBlockState().setValue(CandleBlock.CANDLES, 1 + (int) (h2 * 37) % 4).setValue(CandleBlock.LIT, h2 > 0.2);
                if (h < 0.18) {
                    BlockState bg = Blocs.b(h2 < 0.5 ? "supplementaries:candle_holder_white" : "supplementaries:candle_holder_gray", bougie);
                    bougie = Blocs.p(Blocs.p(Blocs.p(Blocs.p(bg, "face", "floor"), "candles", String.valueOf(1 + (int) (h2 * 37) % 4)), "lit", h2 > 0.2 ? "true" : "false"), "facing", versVoie.getSerializedName());
                }
                n += pose(niv, p.set(x, 54, z), bougie);
            }
            if (adosse && h2 > 0.62 && h2 < 0.80) n += pose(niv, p.set(x, 56, z), Blocks.WHITE_WALL_BANNER.defaultBlockState().setValue(WallBannerBlock.FACING, versVoie));
            return n;
        }
        int k = Math.floorMod(x, 12);
        if (adosse) {
            if (k == 0) n += pose(niv, p.set(x, 54, z), Blocks.BARREL.defaultBlockState());
            else if (k == 1) n += pose(niv, p.set(x, 54, z), Blocs.b("supplementaries:sack", Blocks.BARREL.defaultBlockState()));
            else if (k == 2 && h < 0.5) n += pose(niv, p.set(x, 55, z), Blocks.BARREL.defaultBlockState()) + pose(niv, p.set(x, 54, z), Blocks.BARREL.defaultBlockState());
            else if (k == 6) n += pose(niv, p.set(x, 54, z), Blocks.LANTERN.defaultBlockState());
            else if (k == 3 || k == 4 || k == 8 || k == 9) n += pose(niv, p.set(x, 54, z), matelas(x, g));
        } else if (second) {
            if (k == 3 || k == 4 || k == 8 || k == 9) n += pose(niv, p.set(x, 54, z), matelas(x, g));
        } else if (Math.abs(d - (3 + W / 2.0)) < 0.5 && Math.floorMod(x, 24) == 12) {
            n += pose(niv, p.set(x, 54, z), Blocks.CAMPFIRE.defaultBlockState());
        } else if (Math.abs(d - (3 + W / 2.0)) < 0.5 && Math.floorMod(x, 24) == 13) {
            n += pose(niv, p.set(x, 54, z), Blocs.p(Blocs.p(Blocs.b("farmersdelight:cooking_pot", Blocks.CAULDRON.defaultBlockState()), "support", "tray"), "facing", versVoie.getSerializedName()));
        } else if (Math.abs(d - (3 + W / 2.0)) < 0.5 && Math.floorMod(x, 24) == 11) {
            n += pose(niv, p.set(x, 54, z), Blocs.b("farmersdelight:cutting_board", Blocks.SPRUCE_SLAB.defaultBlockState()));
        } else if (h < 0.04) {
            n += pose(niv, p.set(x, 54, z), Blocks.SPRUCE_SLAB.defaultBlockState());
        }
        return n;
    }

    static BlockState matelas(int x, long g) {
        double h = Galeries.h01(Math.floorDiv(x, 5), 77, g);
        if (h < 0.3) return Blocs.b("farmersdelight:canvas_rug", Blocks.WHITE_CARPET.defaultBlockState());
        return (h < 0.5 ? Blocks.RED_CARPET : h < 0.75 ? Blocks.BLUE_CARPET : Blocks.GREEN_CARPET).defaultBlockState();
    }

    // rame de Hajar : voiture hors service sur la voie, couverte de dessins d'enfant (taches de couleur, sans texte)
    static int rame(WorldGenLevel niv, BlockPos.MutableBlockPos p, int x, int z, long g) {
        if (z < -2762 || z > -2759) return 0;
        int n = 0;
        boolean flanc = z == -2762 || z == -2759, bout = x == RX1 || x == RX2;
        if (x == RX1 + 1 || x == RX1 + 2 || x == RX2 - 1 || x == RX2 - 2) n += pose(niv, p.set(x, 53, z), Blocks.GRAY_CONCRETE.defaultBlockState());
        n += pose(niv, p.set(x, 54, z), Blocks.SPRUCE_PLANKS.defaultBlockState());
        n += pose(niv, p.set(x, 57, z), Blocks.GRAY_CONCRETE.defaultBlockState());
        for (int y = 55; y <= 56; y++) {
            BlockState b;
            if (flanc) {
                boolean porte = z == -2759 && (x == 2106 || x == 2107 || x == 2112 || x == 2113);
                boolean fenetre = y == 56 && !bout && Math.floorMod(x - RX1, 4) != 0;
                if (porte) b = Blocks.AIR.defaultBlockState();
                else if (fenetre) b = Galeries.h01(x, z * 3, g) < 0.55 ? Blocks.AIR.defaultBlockState() : Blocks.GRAY_STAINED_GLASS_PANE.defaultBlockState();
                else b = dessin(x, y, z, g);
            } else if (bout) b = Blocks.BLACK_STAINED_GLASS.defaultBlockState();
            else b = Blocks.AIR.defaultBlockState();
            n += pose(niv, p.set(x, y, z), b);
        }
        if (!flanc && x >= 2114 && x <= 2116) n += pose(niv, p.set(x, 55, z), Blocks.PINK_CARPET.defaultBlockState());
        if (!flanc && x == 2117 && z == -2761) n += pose(niv, p.set(x, 55, z), Blocks.LANTERN.defaultBlockState());
        if (!flanc && x == 2117 && z == -2760) n += pose(niv, p.set(x, 55, z), Blocs.p(Blocs.b("handcrafted:spruce_chair", Blocks.SPRUCE_STAIRS.defaultBlockState()), "facing", "west"));
        return n;
    }

    static BlockState dessin(int x, int y, int z, long g) {
        double b = Galeries.bruit(x * 2, y * 2 + z * 31, 3, g);
        if (b < 0.42) {
            double c = Galeries.h01(Math.floorDiv(x, 3), y + z * 5, g);
            return (c < 0.18 ? Blocks.YELLOW_TERRACOTTA : c < 0.34 ? Blocks.LIME_TERRACOTTA : c < 0.50 ? Blocks.LIGHT_BLUE_TERRACOTTA
                : c < 0.64 ? Blocks.PINK_TERRACOTTA : c < 0.78 ? Blocks.ORANGE_TERRACOTTA : c < 0.90 ? Blocks.RED_TERRACOTTA : Blocks.GREEN_TERRACOTTA).defaultBlockState();
        }
        return y == 55 ? Blocks.CYAN_CONCRETE.defaultBlockState() : Blocks.WHITE_CONCRETE.defaultBlockState();
    }

    // escalier des veilleurs : de l'extremite est du quai sud jusqu'au sol, plein est (bouche reservee x 2144..2172, z -2760)
    static int escalierVeilleurs(WorldGenLevel niv, ChunkAccess chunk, BlockPos.MutableBlockPos p, long g) {
        int x0 = chunk.getPos().getMinBlockX(), z0 = chunk.getPos().getMinBlockZ();
        if (x0 + 15 < VX0 || x0 > VX1 || z0 + 15 < VZ1 - 1 || z0 > VZ2 + 1) return 0;
        int n = 0;
        BlockState air = Blocks.AIR.defaultBlockState();
        for (int x = Math.max(x0, VX0); x <= Math.min(x0 + 15, VX1); x++) for (int z = Math.max(z0, VZ1 - 1); z <= Math.min(z0 + 15, VZ2 + 1); z++) {
            int fy = 54 + (x - VX0), ysc = sol(chunk, p, x, z);
            if (ysc < 0 || fy > ysc) continue;
            boolean ciel = fy + 4 > ysc, mur = z < VZ1 || z > VZ2;
            for (int y = 53; y < fy; y++) n += pose(niv, p.set(x, y, z), Blocks.STONE_BRICKS.defaultBlockState());
            if (mur) {
                int top = ciel ? ysc : fy + 3;
                for (int y = fy; y <= top; y++) n += pose(niv, p.set(x, y, z), y >= ysc - 1 && ciel ? Blocks.LIGHT_GRAY_CONCRETE.defaultBlockState() : carreau(x, y, z, LISTE[4], g));
                if (!ciel) n += pose(niv, p.set(x, fy + 4, z), Blocks.SMOOTH_STONE.defaultBlockState());
                else {
                    n += pose(niv, p.set(x, ysc + 1, z), Blocs.b("createdeco:industrial_iron_bars", Blocks.IRON_BARS.defaultBlockState()));
                    for (int y = ysc + 2; y <= ysc + 3; y++) n += pose(niv, p.set(x, y, z), air);
                }
                continue;
            }
            n += pose(niv, p.set(x, fy, z), Blocks.STONE_BRICK_STAIRS.defaultBlockState().setValue(StairBlock.FACING, Direction.EAST));
            for (int y = fy + 1; y <= (ciel ? ysc + 3 : fy + 3); y++) n += pose(niv, p.set(x, y, z), air);
            if (!ciel) n += pose(niv, p.set(x, fy + 4, z), Blocks.SMOOTH_STONE.defaultBlockState());
            else if ((z == VZ1 || z == VZ2) && Galeries.h01(x, z + 17, g) < 0.5)
                for (int y = ysc; y > Math.max(fy, ysc - 3); y--)
                    n += pose(niv, p.set(x, y, z), Blocks.VINE.defaultBlockState().setValue(z == VZ1 ? VineBlock.NORTH : VineBlock.SOUTH, true));
        }
        return n;
    }

    // sol naturel d'une colonne du chunk (premier bloc plein, feuillage et troncs exclus)
    static int sol(ChunkAccess chunk, BlockPos.MutableBlockPos p, int x, int z) {
        for (int y = 140; y > 45; y--) {
            BlockState b = chunk.getBlockState(p.set(x, y, z));
            if (b.blocksMotion() && !b.is(BlockTags.LEAVES) && !b.is(BlockTags.LOGS)) return y;
        }
        return -1;
    }

    static double sortieCote(Station st) { return st.qp > 0 ? 1 : -1; }

    static boolean enPalier(int x, int z) { return x >= MX1 - 2 && z >= MZ_PALIER - 1 && z < MZ_PALIER + 5; }

    static Direction dominant(double vx, double vz) {
        if (Math.abs(vx) > Math.abs(vz)) return vx > 0 ? Direction.EAST : Direction.WEST;
        return vz > 0 ? Direction.SOUTH : Direction.NORTH;
    }

    static BlockState carreau(int x, int y, int z, Station st, long g) {
        double h = Galeries.h01(x * 7 + y, z * 5 - y, g);
        if (h < 0.06) return Blocks.STONE.defaultBlockState();                 // carreaux tombes
        if (h < 0.14) return Blocks.LIGHT_GRAY_CONCRETE.defaultBlockState();   // carreaux sales
        if (y == 56) return h > 0.95 ? Blocks.WHITE_CONCRETE.defaultBlockState() : st.frise.defaultBlockState();
        if (y == 54 && h < 0.30) return Blocks.LIGHT_GRAY_CONCRETE.defaultBlockState();
        return Blocks.WHITE_CONCRETE.defaultBlockState();
    }

    static BlockState plafond(double h, double d, double s, boolean allume) {
        // plafonniers au-dessus des quais, tous les 6 blocs : halogenes casses (Spore), allumes chez les veilleurs
        if (d >= 4 && d < 5 && ((s % 6) + 6) % 6 < 1)
            return allume ? Blocs.b("spore:halogen_light_on", Blocks.SEA_LANTERN.defaultBlockState()) : Blocs.b("spore:broken_halogen_light", Blocks.REDSTONE_LAMP.defaultBlockState());
        if (h < 0.10) return Blocks.CRACKED_STONE_BRICKS.defaultBlockState();
        if (h < 0.16) return Blocks.MOSSY_STONE_BRICKS.defaultBlockState();
        return Blocks.SMOOTH_STONE.defaultBlockState();
    }

    // escalier du puits de Majicavo : palier a Y 54 contre le quai est, marches vers le sud jusqu'au sol, tranchee a ciel ouvert
    static int puits(WorldGenLevel niv, ChunkAccess chunk, BlockPos.MutableBlockPos p, long g) {
        int x0 = chunk.getPos().getMinBlockX(), z0 = chunk.getPos().getMinBlockZ();
        if (x0 != 2576 || z0 != -2016) return 0;
        int ys = -999;
        for (int x = MX1; x <= MX2; x++) for (int z = -2003; z <= -2001; z++) {
            for (int y = 140; y > 54; y--) {
                BlockState b = chunk.getBlockState(p.set(x, y, z));
                if (b.blocksMotion() && !b.is(BlockTags.LEAVES) && !b.is(BlockTags.LOGS)) { ys = Math.max(ys, y); break; }
            }
        }
        if (ys < 58 || ys > 100) { org.apache.logging.log4j.LogManager.getLogger().warn("[Atheria] Puits de Majicavo : sol introuvable (" + ys + ")"); return 0; }
        int n = 0;
        BlockState air = Blocks.AIR.defaultBlockState();
        // palier
        for (int x = MX1; x <= MX2 + 1; x++) for (int z = MZ_PALIER; z < MZ_ESC; z++) {
            boolean mur = x > MX2;
            n += pose(niv, p.set(x, 52, z), Blocks.STONE.defaultBlockState());
            n += pose(niv, p.set(x, 53, z), mur ? Blocks.STONE.defaultBlockState() : Galeries.h01(x, z, g) < 0.1 ? Blocks.ANDESITE.defaultBlockState() : Blocks.POLISHED_ANDESITE.defaultBlockState());
            for (int y = 54; y <= 57; y++) n += pose(niv, p.set(x, y, z), mur ? carreau(x, y, z, LISTE[0], g) : air);
            n += pose(niv, p.set(x, 58, z), Blocks.SMOOTH_STONE.defaultBlockState());
        }
        // marches : une par bloc ; si le sol est trop haut, echelle au bout
        int N = ys - 53, pas = Math.min(N, -2001 - MZ_ESC);
        for (int i = 0; i < pas; i++) {
            int z = MZ_ESC + i, fy = 54 + i;
            boolean dernier = i == pas - 1;
            boolean echelle = dernier && N > pas;
            boolean ciel = fy + 4 > ys || echelle;
            int haut = ciel ? ys + 4 : fy + 3;
            for (int x = MX1 - 1; x <= MX2 + 1; x++) {
                boolean mur = x < MX1 || x > MX2;
                for (int y = 53; y < fy; y++) n += pose(niv, p.set(x, y, z), Blocks.STONE_BRICKS.defaultBlockState());
                if (mur) {
                    int top = ciel ? ys : fy + 3;
                    for (int y = fy; y <= top; y++) n += pose(niv, p.set(x, y, z), y >= ys - 1 ? Blocks.LIGHT_GRAY_CONCRETE.defaultBlockState() : carreau(x, y, z, LISTE[0], g));
                    if (!ciel) n += pose(niv, p.set(x, fy + 4, z), Blocks.SMOOTH_STONE.defaultBlockState());
                    else {
                        n += pose(niv, p.set(x, ys + 1, z), Blocs.b("createdeco:industrial_iron_bars", Blocks.IRON_BARS.defaultBlockState()));
                        for (int y = ys + 2; y <= ys + 4; y++) n += pose(niv, p.set(x, y, z), air);
                    }
                    continue;
                }
                n += pose(niv, p.set(x, fy, z), Galeries.h01(x, z * 3, g) < 0.08 ? Blocks.STONE_BRICKS.defaultBlockState()
                    : Blocks.STONE_BRICK_STAIRS.defaultBlockState().setValue(StairBlock.FACING, Direction.SOUTH));
                for (int y = fy + 1; y <= haut; y++) n += pose(niv, p.set(x, y, z), air);
                if (!ciel) n += pose(niv, p.set(x, fy + 4, z), Blocks.SMOOTH_STONE.defaultBlockState());
                // lianes qui descendent des bords de la tranchee, mousse sur les marches
                if (ciel && (x == MX1 || x == MX2) && Galeries.h01(x, z + 17, g) < 0.5)
                    for (int y = ys; y > Math.max(fy, ys - 3); y--)
                        n += pose(niv, p.set(x, y, z), Blocks.VINE.defaultBlockState().setValue(x == MX1 ? VineBlock.WEST : VineBlock.EAST, true));
                else if (Galeries.h01(x, z + 29, g) < 0.12) n += pose(niv, p.set(x, fy + 1, z), Blocks.MOSS_CARPET.defaultBlockState());
            }
            // linteau de beton au droit de l'entree du tunnel
            if (!ciel && fy + 5 > ys) for (int x = MX1 - 1; x <= MX2 + 1; x++) n += pose(niv, p.set(x, ys + 1, z), Blocks.IRON_BARS.defaultBlockState());
            // sol trop haut : la derniere case devient un puits a echelles (accrochees a la roche du chunk voisin, au sud)
            if (echelle) for (int y = fy + 1; y <= ys; y++) for (int x = MX1 + 1; x <= MX1 + 2; x++)
                n += pose(niv, p.set(x, y, z), Blocks.LADDER.defaultBlockState().setValue(LadderBlock.FACING, Direction.NORTH));
        }
        // poteaux de l'ancienne entree aux quatre coins de la tranchee
        int zH = MZ_ESC + Math.max(0, ys - 57), zB = MZ_ESC + pas - 1;
        for (int[] c : new int[][] {{MX1 - 1, zH}, {MX2 + 1, zH}, {MX1 - 1, zB}, {MX2 + 1, zB}})
            if (c[1] >= z0 && c[1] < z0 + 16) for (int y = ys + 1; y <= ys + 2; y++) n += pose(niv, p.set(c[0], y, c[1]), Blocks.LIGHT_GRAY_CONCRETE.defaultBlockState());
        org.apache.logging.log4j.LogManager.getLogger().info("[Atheria] Puits de Majicavo : sol Y " + ys + ", " + pas + " marches" + (N > pas ? ", echelle" : ""));
        return n;
    }

    static int pose(WorldGenLevel niv, BlockPos p, BlockState b) { return Galeries.pose(niv, p, b); }
}
