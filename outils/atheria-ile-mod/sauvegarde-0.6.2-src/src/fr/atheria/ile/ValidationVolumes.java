package fr.atheria.ile;

import net.minecraft.core.BlockPos;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.tags.BlockTags;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.chunk.LevelChunk;
import net.minecraft.world.level.levelgen.Heightmap;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;

/**
 * Mesures sur les vrais blocs des volumes souterrains reserves (chunks deja charges seulement) : dans le volume et
 * sa marge, sous la surface - 2, compte des vides (air, eau, lave), des fluides et des minerais ; couverture reelle
 * (surface - y_max) sur l'emprise.
 */
final class ValidationVolumes {
    private ValidationVolumes() {}

    /** chunks a generer : ceux qui touchent un volume ou sa marge */
    static List<Long> chunks(CarteIle c) {
        LinkedHashSet<Long> s = new LinkedHashSet<>();
        Volumes v = c.volumes;
        for (int i = 0; i < v.elements(); i++) {
            double[] b = v.boite(i);
            for (int cz = (int) Math.floor((b[1] - v.marge) / 16); cz <= (int) Math.floor((b[3] + v.marge) / 16); cz++)
                for (int cx = (int) Math.floor((b[0] - v.marge) / 16); cx <= (int) Math.floor((b[2] + v.marge) / 16); cx++)
                    if (v.chunkTouche(cx, cz)) s.add(net.minecraft.world.level.ChunkPos.asLong(cx, cz));
        }
        return new ArrayList<>(s);
    }

    static void mesurer(ServerLevel n, CarteIle c) throws Exception {
        Volumes v = c.volumes;
        StringBuilder sb = new StringBuilder("VALIDATION DES VOLUMES SOUTERRAINS (blocs reels ; volume + marge " + v.marge + ", sous la surface - 2)\n");
        BlockPos.MutableBlockPos p = new BlockPos.MutableBlockPos();
        int ne = v.noms.length;
        long[] blocs = new long[ne], vides = new long[ne], fluides = new long[ne], minerais = new long[ne], absents = new long[ne];
        int[] couvMin = new int[ne];
        int[] couvX = new int[ne], couvZ = new int[ne], yHaut = new int[ne];
        java.util.Arrays.fill(couvMin, Integer.MAX_VALUE);
        StringBuilder[] ex = new StringBuilder[ne];
        for (int k = 0; k < ne; k++) ex[k] = new StringBuilder();
        for (int i = 0; i < v.elements(); i++) {
            int e = v.nomElement(i);
            yHaut[e] = Math.max(yHaut[e], v.yMax(i));
            double[] b = v.boite(i);
            int x0 = (int) Math.floor(b[0]) - v.marge, x1 = (int) Math.ceil(b[2]) + v.marge, z0 = (int) Math.floor(b[1]) - v.marge, z1 = (int) Math.ceil(b[3]) + v.marge;
            int y0 = v.yMin(i) - v.marge, y1 = Math.min(n.getMaxBuildHeight() - 1, v.yMax(i) + v.marge);
            for (int z = z0; z <= z1; z++) for (int x = x0; x <= x1; x++) {
                LevelChunk ch = n.getChunkSource().getChunkNow(x >> 4, z >> 4);
                if (ch == null) { absents[e]++; continue; }
                int surf = ch.getHeight(Heightmap.Types.OCEAN_FLOOR, x & 15, z & 15);
                // couverture reelle sur l'emprise (pas pour les puits, qui montent a la surface)
                if (v.yMax(i) < 400 && v.dansEmprise(i, x, z)) {
                    int cv = surf - v.yMax(i);
                    if (cv < couvMin[e]) { couvMin[e] = cv; couvX[e] = x; couvZ[e] = z; }
                }
                for (int y = y0; y <= Math.min(y1, surf - 3); y++) {
                    if (!v.reserve(x, y, z)) continue;
                    BlockState s = ch.getBlockState(p.set(x, y, z));
                    blocs[e]++;
                    boolean fl = !s.getFluidState().isEmpty();
                    if (s.isAir() || fl) {
                        vides[e]++;
                        if (fl) fluides[e]++;
                        if (ex[e].length() < 200) ex[e].append(String.format(" %d,%d,%d=%s", x, y, z, s.getBlock().getDescriptionId().replace("block.minecraft.", "")));
                    } else if (s.is(net.neoforged.neoforge.common.Tags.Blocks.ORES) || s.is(BlockTags.COAL_ORES) || s.is(BlockTags.IRON_ORES) || s.is(BlockTags.COPPER_ORES)) {
                        minerais[e]++;
                    }
                }
            }
        }
        for (int e = 0; e < ne; e++) {
            sb.append(String.format("%s : %d blocs mesures, colonnes non chargees %d%n", v.noms[e], blocs[e], absents[e]));
            sb.append(String.format("   vides (air, eau, lave) : %d dont fluides %d%s%n", vides[e], fluides[e], ex[e].length() > 0 ? " (" + ex[e].toString().trim() + ")" : ""));
            sb.append(String.format("   minerais : %d%n", minerais[e]));
            if (couvMin[e] != Integer.MAX_VALUE) sb.append(String.format("   couverture reelle min (surface - y_max) : %d a %d, %d (visee >= 5)%n", couvMin[e], couvX[e], couvZ[e]));
            else sb.append("   couverture : puits vers la surface (non mesuree)\n");
        }
        Tests.ecrireRapport(c, "rapport-volumes.txt", sb.toString());
        CarteIle.LOG.info("[atheria_ile] validation des volumes souterrains ecrite : rapport-volumes.txt");
    }
}
