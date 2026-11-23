package fr.atheria.monde;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import net.minecraft.core.BlockPos;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.WorldGenLevel;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.LanternBlock;
import net.minecraft.world.level.block.RailBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.RailShape;
import net.minecraft.world.level.chunk.ChunkAccess;

// Tunnels du tram sous Longoni, creuses a la generation (fin de decoration du chunk, dans la reserve souterraine
// de la carte). Gabarit repris de la station Bancoul validee (lieu station_sous) : 6 de large a l'interieur,
// murs d'un bloc, ballast Y 52, deux voies a Y 53 (rails a +-1,5 de l'axe), interieur Y 53..55, epaules Y 56
// (4 de large), voute Y 57. Ligne abandonnee : rails manquants par troncons, eboulis contre les murs,
// flaques dans le ballast, rares lanternes, mousse et lichen. Tout reste dans le chunk ; tirage deterministe.
public final class Galeries {
    public static final AtomicInteger CHUNKS = new AtomicInteger();
    public static final AtomicInteger BLOCS = new AtomicInteger();

    static final int Y_BALLAST = 52, Y_RAIL = 53, Y_VOUTE = 57;
    // axes sur les bords de blocs (le centre d'un bloc est en +0,5) : comme dans la station, 6 cases entre les murs
    static final double[][][] LIGNES = {
        // ligne principale : portail ouest de Bancoul, bifurcation, puis plein sud vers Majicavo
        // (le portail est reste mure : le bassin du port passe au-dessus)
        { {2496, -3000}, {2484, -3000}, {2484, -2984}, {2456, -2872}, {2456, -2688}, {2520, -2600},
          {2520, -2200}, {2546, -2104}, {2568, -2032}, {2568, -1992} },
        // embranchement jamais ouvert : meme portail, tout droit vers l'ouest -> station des veilleurs (dernier troncon plein ouest, z -2760)
        { {2496, -3000}, {2400, -3000}, {2312, -2916}, {2288, -2916}, {2212, -2816}, {2188, -2816}, {2144, -2760}, {2088, -2760} },
        // (troncons droits de 24 blocs aux petites stations 2 et 3 : quais rectilignes)
    };
    static final Map<Long, RailShape> RAILS = new HashMap<>();
    static int bx1 = Integer.MAX_VALUE, bz1 = Integer.MAX_VALUE, bx2 = Integer.MIN_VALUE, bz2 = Integer.MIN_VALUE;

    static {
        for (double[][] l : LIGNES) {
            for (double[] p : l) {
                bx1 = Math.min(bx1, (int) p[0] - 8); bz1 = Math.min(bz1, (int) p[1] - 8);
                bx2 = Math.max(bx2, (int) p[0] + 8); bz2 = Math.max(bz2, (int) p[1] + 8);
            }
            voie(decaler(l, 1.5));
            voie(decaler(l, -1.5));
        }
    }

    private Galeries() {
    }

    static long cle(int x, int z) { return ((long) x << 32) ^ (z & 0xFFFFFFFFL); }

    // polyligne decalee (onglets aux sommets)
    static double[][] decaler(double[][] l, double d) {
        double[][] r = new double[l.length][2];
        for (int i = 0; i < l.length; i++) {
            double nx = 0, nz = 0;
            for (int k = Math.max(0, i - 1); k < Math.min(l.length - 1, i + 1); k++) {
                double dx = l[k + 1][0] - l[k][0], dz = l[k + 1][1] - l[k][1], n = Math.hypot(dx, dz);
                nx += -dz / n; nz += dx / n;
            }
            double n = Math.hypot(nx, nz); nx /= n; nz /= n;
            double cos = 1;
            if (i > 0 && i < l.length - 1) {
                double dx = l[i][0] - l[i - 1][0], dz = l[i][1] - l[i - 1][1], m = Math.hypot(dx, dz);
                cos = Math.abs(nx * (-dz / m) + nz * (dx / m));
            }
            r[i][0] = l[i][0] + nx * d / cos; r[i][1] = l[i][1] + nz * d / cos;
        }
        return r;
    }

    // voie 4-connexe le long d'une polyligne (rails de Minecraft : droits ou courbes, jamais en diagonale)
    static void voie(double[][] l) {
        List<int[]> cases = new ArrayList<>();
        int cx = (int) Math.floor(l[0][0]), cz = (int) Math.floor(l[0][1]);
        cases.add(new int[] {cx, cz});
        for (int i = 0; i + 1 < l.length; i++) {
            double ax = l[i][0], az = l[i][1], bx = l[i + 1][0], bz = l[i + 1][1];
            int tx = (int) Math.floor(bx), tz = (int) Math.floor(bz);
            double dx = bx - ax, dz = bz - az, n = Math.hypot(dx, dz);
            for (int garde = 0; (cx != tx || cz != tz) && garde < 4000; garde++) {
                int sx = Integer.signum(tx - cx), sz = Integer.signum(tz - cz);
                double ex = sx == 0 ? 1e9 : Math.abs(((cx + sx + 0.5) - ax) * dz - ((cz + 0.5) - az) * dx) / n;
                double ez = sz == 0 ? 1e9 : Math.abs(((cx + 0.5) - ax) * dz - ((cz + sz + 0.5) - az) * dx) / n;
                if (ex <= ez) cx += sx; else cz += sz;
                cases.add(new int[] {cx, cz});
            }
        }
        for (int i = 0; i < cases.size(); i++) {
            int[] c = cases.get(i), a = i > 0 ? cases.get(i - 1) : null, b = i + 1 < cases.size() ? cases.get(i + 1) : null;
            if (a == null) a = new int[] {2 * c[0] - b[0], 2 * c[1] - b[1]};
            if (b == null) b = new int[] {2 * c[0] - a[0], 2 * c[1] - a[1]};
            RAILS.put(cle(c[0], c[1]), forme(c, a, b));
        }
    }

    static RailShape forme(int[] c, int[] a, int[] b) {
        boolean n = a[1] < c[1] || b[1] < c[1], s = a[1] > c[1] || b[1] > c[1];
        boolean w = a[0] < c[0] || b[0] < c[0], e = a[0] > c[0] || b[0] > c[0];
        if ((n || s) && !(e || w)) return RailShape.NORTH_SOUTH;
        if ((e || w) && !(n || s)) return RailShape.EAST_WEST;
        if (n && e) return RailShape.NORTH_EAST;
        if (n && w) return RailShape.NORTH_WEST;
        if (s && e) return RailShape.SOUTH_EAST;
        return RailShape.SOUTH_WEST;
    }

    // distance a l'axe, abscisse curviligne
    static double[] mesure(double px, double pz) {
        double best = 1e18, sBest = 0, ligne = 0, cote = 1, bnx = 0, bnz = 1;
        for (int li = 0; li < LIGNES.length; li++) {
            double[][] l = LIGNES[li];
            double cum = 0;
            for (int i = 0; i + 1 < l.length; i++) {
                double ax = l[i][0], az = l[i][1], dx = l[i + 1][0] - ax, dz = l[i + 1][1] - az, n2 = dx * dx + dz * dz;
                double t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / n2));
                double qx = ax + t * dx - px, qz = az + t * dz - pz, d = Math.hypot(qx, qz);
                if (d < best) {
                    best = d; sBest = cum + t * Math.sqrt(n2); ligne = li;
                    double nn = Math.sqrt(n2); bnx = -dz / nn; bnz = dx / nn;
                    cote = ((px - ax) * bnx + (pz - az) * bnz) >= 0 ? 1 : -1;
                }
                cum += Math.sqrt(n2);
            }
        }
        return new double[] {best, sBest, ligne, cote, bnx, bnz};
    }

    public static void creuser(WorldGenLevel niveau, ChunkAccess chunk) {
        if (niveau.getLevel().dimension() != Level.OVERWORLD) return;
        long graine = niveau.getSeed();
        BlockPos.MutableBlockPos p = new BlockPos.MutableBlockPos();
        int n = tunnel(niveau, chunk, p, graine);
        // apres les colonnes du tunnel (ils ouvrent des murs poses par les stations)
        n += Stations.puits(niveau, chunk, p, graine);
        n += Stations.escalierVeilleurs(niveau, chunk, p, graine);
        n += Nid.creuser(niveau, chunk, p, graine);
        if (n > 0) { CHUNKS.incrementAndGet(); BLOCS.addAndGet(n); }
    }

    static int tunnel(WorldGenLevel niveau, ChunkAccess chunk, BlockPos.MutableBlockPos p, long graine) {
        int x0 = chunk.getPos().getMinBlockX(), z0 = chunk.getPos().getMinBlockZ();
        if (x0 + 15 < bx1 || x0 > bx2 || z0 + 15 < bz1 || z0 > bz2) return 0;
        if (mesure(x0 + 8, z0 + 8)[0] > 23) return 0;
        int n = 0;
        for (int lx = 0; lx < 16; lx++) for (int lz = 0; lz < 16; lz++) {
            int x = x0 + lx, z = z0 + lz;
            double[] m = mesure(x + 0.5, z + 0.5);
            double d = m[0], s = m[1];
            int hs = Stations.colonne(niveau, p, x, z, m, graine);
            if (hs >= 0) { n += hs; continue; }
            if (d >= 4) continue;
            // sortie ouest de Bancoul : l'eboulement de la station deborde sur les premiers blocs du tunnel
            boolean noye = false, digue = s < NOYE;
            // embranchement : cloison de briques jamais demolie, avec une breche de 2 x 2 au milieu
            boolean cloison = m[2] == 1 && s >= CLOISON && s < CLOISON + 1;
            int troncon = (int) Math.floor(s / 24);
            double hT = h01(troncon, 3, graine), hC = h01(x, z, graine), hC2 = h01(x, z + 7919, graine);
            // radier, ballast, murs, voute
            n += pose(niveau, p.set(x, Y_BALLAST - 1, z), roche(hC, false));
            if (d < 3) {
                BlockState ballast = Blocks.GRAVEL.defaultBlockState();
                // flaque dans le ballast entre les deux voies (contenue : le niveau Y 52 reste plein autour)
                if (d < 1 && hT < 0.35 && hC < 0.30 && !noye && !digue) ballast = Blocks.WATER.defaultBlockState();
                else if (hC < 0.08) ballast = Blocks.COARSE_DIRT.defaultBlockState();
                n += pose(niveau, p.set(x, Y_BALLAST, z), ballast);
                for (int y = Y_RAIL; y <= 55; y++) n += pose(niveau, p.set(x, y, z), noye ? Blocks.WATER.defaultBlockState() : Blocks.AIR.defaultBlockState());
                n += pose(niveau, p.set(x, 56, z), d < 2 ? Blocks.AIR.defaultBlockState() : roche(hC2, true));
                // plafonnier halogene (Spore) a la cle de voute, tous les 12 blocs, la plupart casses
                boolean halogene = d < 1 && Math.floor(s) % 12 == 6 && !digue && !noye;
                n += pose(niveau, p.set(x, Y_VOUTE, z), halogene ? Blocs.b(h01((int) Math.floor(s / 12), 9, graine) < 0.15 ? "spore:halogen_light" : "spore:broken_halogen_light", roche(hC2, true)) : roche(hC2, true));
                // rails : manquants sur ~1 troncon sur 5, et ca et la
                RailShape forme = RAILS.get(cle(x, z));
                if (digue) {
                    // gravats sur les voies (rails enfouis dessous), passage d'un bloc en haut, pente qui redescend
                    if (forme != null) n += pose(niveau, p.set(x, Y_RAIL, z), Blocks.RAIL.defaultBlockState().setValue(RailBlock.SHAPE, forme));
                    int haut = s < 2 ? 55 : s < 4 ? 54 : s < 6 ? 53 : 52;
                    for (int y = forme != null ? 54 : Y_RAIL; y <= haut; y++) n += pose(niveau, p.set(x, y, z), eboulis(h01(x, y * 17 + z, graine)));
                    continue;
                }
                if (cloison) {
                    for (int y = Y_RAIL; y <= 56; y++)
                        if (!(d < 1 && y <= 54) && !(y == 56 && d >= 2)) n += pose(niveau, p.set(x, y, z), h01(x, y + z, graine) < 0.3 ? Blocks.MOSSY_STONE_BRICKS.defaultBlockState() : Blocks.BRICKS.defaultBlockState());
                    continue;
                }
                if (noye) {
                    if (forme != null) n += pose(niveau, p.set(x, Y_RAIL, z), Blocks.RAIL.defaultBlockState().setValue(RailBlock.SHAPE, forme).setValue(RailBlock.WATERLOGGED, true));
                    continue;
                }
                if (forme != null && hT >= 0.2 && hC2 >= 0.04)
                    n += pose(niveau, p.set(x, Y_RAIL, z), Blocks.RAIL.defaultBlockState().setValue(RailBlock.SHAPE, forme));
                else if (forme == null && d >= 2) {
                    // bas-cote : eboulis contre le mur, mousse, toiles
                    double e = h01((int) Math.floor(s / 5), x + z > 0 ? 11 : 13, graine);
                    if (e < 0.10) n += pose(niveau, p.set(x, Y_RAIL, z), hC < 0.5 ? Blocks.COBBLESTONE.defaultBlockState() : Blocks.GRAVEL.defaultBlockState());
                    else if (e < 0.16) n += pose(niveau, p.set(x, Y_RAIL, z), Blocks.ANDESITE_SLAB.defaultBlockState());
                    else if (e < 0.20) n += pose(niveau, p.set(x, Y_RAIL, z), Blocs.b("spore:rotten_scraps", Blocks.GRAVEL.defaultBlockState()));
                    else if (e < 0.215 && hC < 0.5) n += pose(niveau, p.set(x, Y_RAIL, z), Blocs.b("supplementaries:sack", Blocks.BARREL.defaultBlockState()));
                    else if (hC < 0.10) n += pose(niveau, p.set(x, Y_RAIL, z), Blocks.MOSS_CARPET.defaultBlockState());
                    if (hC2 > 0.985) n += pose(niveau, p.set(x, 55, z), Blocks.COBWEB.defaultBlockState());
                }
                // lanterne pendue a la cle de voute, une sur trois en etat
                if (d < 1 && Math.floor(s) % 18 == 0 && h01((int) Math.floor(s / 18), 5, graine) < 0.35 && hC2 < 0.5)
                    n += pose(niveau, p.set(x, 56, z), Blocks.LANTERN.defaultBlockState().setValue(LanternBlock.HANGING, true));
                else if (d < 2 && hC < 0.03) n += pose(niveau, p.set(x, 56, z), Blocks.HANGING_ROOTS.defaultBlockState());
            } else {
                for (int y = Y_BALLAST; y <= Y_VOUTE; y++) n += pose(niveau, p.set(x, y, z), roche(h01(x, y * 31 + z, graine), y >= 56));
                // boitiers electriques (Create) et grilles de ventilation (Create Deco) dans les piedroits
                int pas = (int) Math.floor(s);
                if (!digue && !cloison && pas % 30 == 0 && h01(pas, x + z > 0 ? 3 : 7, graine) < 0.6)
                    n += pose(niveau, p.set(x, 55, z), Blocs.b("create:andesite_casing", Blocks.POLISHED_ANDESITE.defaultBlockState()));
                else if (!digue && !cloison && pas % 30 == 15 && h01(pas, x + z > 0 ? 5 : 9, graine) < 0.4)
                    n += pose(niveau, p.set(x, 54, z), Blocs.b("createdeco:industrial_iron_bars", Blocks.IRON_BARS.defaultBlockState()));
            }
        }
        return n;
    }

    static final double NOYE = 7, CLOISON = 24;

    static BlockState eboulis(double h) {
        return h < 0.45 ? Blocks.COBBLESTONE.defaultBlockState() : h < 0.65 ? Blocks.MOSSY_COBBLESTONE.defaultBlockState()
            : h < 0.85 ? Blocks.ANDESITE.defaultBlockState() : Blocks.STONE.defaultBlockState();
    }

    static BlockState roche(double h, boolean voute) {
        if (voute) return h < 0.55 ? Blocks.STONE_BRICKS.defaultBlockState() : h < 0.75 ? Blocks.CRACKED_STONE_BRICKS.defaultBlockState()
            : h < 0.90 ? Blocks.MOSSY_STONE_BRICKS.defaultBlockState() : Blocks.STONE.defaultBlockState();
        return h < 0.55 ? Blocks.STONE.defaultBlockState() : h < 0.72 ? Blocks.COBBLESTONE.defaultBlockState()
            : h < 0.86 ? Blocks.STONE_BRICKS.defaultBlockState() : h < 0.94 ? Blocks.MOSSY_COBBLESTONE.defaultBlockState() : Blocks.ANDESITE.defaultBlockState();
    }

    static int pose(WorldGenLevel niveau, BlockPos p, BlockState b) {
        niveau.setBlock(p, b, 2);
        return 1;
    }

    static double bruit(int x, int z, int pas, long graine) {
        int gx = Math.floorDiv(x, pas), gz = Math.floorDiv(z, pas);
        double fx = (x - gx * pas) / (double) pas, fz = (z - gz * pas) / (double) pas;
        fx = fx * fx * (3 - 2 * fx); fz = fz * fz * (3 - 2 * fz);
        double a = h01(gx, gz, graine), b = h01(gx + 1, gz, graine), c = h01(gx, gz + 1, graine), e = h01(gx + 1, gz + 1, graine);
        return (a + (b - a) * fx) * (1 - fz) + (c + (e - c) * fx) * fz;
    }

    static double h01(int a, int b, long graine) {
        long h = graine ^ (a * 0x9E3779B97F4A7C15L) ^ (b * 0xC2B2AE3D27D4EB4FL) ^ 0x7A11L;
        h ^= h >>> 33; h *= 0xFF51AFD7ED558CCDL; h ^= h >>> 33; h *= 0xC4CEB93FE51B4E2BL; h ^= h >>> 33;
        return (h & 0xFFFF) / 65536.0;
    }
}
