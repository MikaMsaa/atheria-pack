package fr.atheria.ile;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import net.minecraft.core.BlockPos;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.tags.BlockTags;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.chunk.LevelChunk;
import net.minecraft.world.level.levelgen.Heightmap;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;

/**
 * 0.7.0 : sondes de test legeres (cles de test, absentes du vrai regions.json).
 * - "sonde_villes" : [{"nom", "x1", "z1", "x2", "z2"}] : getChunkInfo de Lost Cities sur chaque chunk de chaque boite
 *   (calcul sans generer de chunk) ; compte les chunks de ville et ceux qui tombent dans zones_villes.
 * - "sonde_volumes_chunks" : N : N chunks de chunks_volumes generes et gardes jusqu'a la fin, puis vides et minerais
 *   comptes dans la reserve (sans valider_volumes).
 */
final class Sondes {
    private Sondes() {}

    static final LinkedHashSet<Long> VOLUMES = new LinkedHashSet<>();

    /** choisit N chunks de volumes repartis sur la liste (reinitialise a chaque demarrage) */
    static List<Long> choisirVolumes(CarteIle c) {
        VOLUMES.clear();
        if (!c.config.has("sonde_volumes_chunks") || c.volumes.vide()) return new ArrayList<>();
        int n = c.config.get("sonde_volumes_chunks").getAsInt();
        List<Long> tous = ValidationVolumes.chunks(c);
        if (n <= 0 || tous.isEmpty()) return new ArrayList<>();
        for (int k = 0; k < n; k++) VOLUMES.add(tous.get((int) ((k + 0.5) * tous.size() / n)));
        // chunks imposes en plus : [[cx, cz], ...]
        if (c.config.has("sonde_volumes_en_plus"))
            for (JsonElement e : c.config.getAsJsonArray("sonde_volumes_en_plus"))
                VOLUMES.add(ChunkPos.asLong(e.getAsJsonArray().get(0).getAsInt(), e.getAsJsonArray().get(1).getAsInt()));
        return new ArrayList<>(VOLUMES);
    }

    static boolean garder(int cx, int cz) { return VOLUMES.contains(ChunkPos.asLong(cx, cz)); }

    static void volumes(ServerLevel n, CarteIle c) {
        if (VOLUMES.isEmpty()) return;
        Volumes v = c.volumes;
        StringBuilder sb = new StringBuilder("SONDE DES VOLUMES (" + VOLUMES.size() + " chunks de chunks_volumes ; reserve = volume + marge " + v.marge + ", sous la surface - 2)\n");
        BlockPos.MutableBlockPos p = new BlockPos.MutableBlockPos();
        long tb = 0, tv = 0, tf = 0, tm = 0;
        for (long cle : VOLUMES) {
            int cx = ChunkPos.getX(cle), cz = ChunkPos.getZ(cle);
            LevelChunk ch = n.getChunkSource().getChunkNow(cx, cz);
            if (ch == null) { sb.append(String.format("chunk %d,%d : NON CHARGE%n", cx, cz)); continue; }
            long b = 0, vi = 0, fl = 0, mi = 0;
            StringBuilder ex = new StringBuilder();
            java.util.TreeSet<String> noms = new java.util.TreeSet<>();
            for (int dz = 0; dz < 16; dz++) for (int dx = 0; dx < 16; dx++) {
                int x = cx * 16 + dx, z = cz * 16 + dz;
                int surf = ch.getHeight(Heightmap.Types.OCEAN_FLOOR, dx, dz);
                for (int y = n.getMinBuildHeight(); y <= surf - 3; y++) {
                    if (!v.reserve(x, y, z)) continue;
                    String nom = v.nomA(x, y, z);
                    if (nom != null) noms.add(nom);
                    BlockState s = ch.getBlockState(p.set(x, y, z));
                    b++;
                    boolean f = !s.getFluidState().isEmpty();
                    if (s.isAir() || f) {
                        vi++; if (f) fl++;
                        if (ex.length() < 160) ex.append(String.format(" %d,%d,%d=%s", x, y, z, s.getBlock().getDescriptionId().replace("block.minecraft.", "")));
                    } else if (s.is(net.neoforged.neoforge.common.Tags.Blocks.ORES) || s.is(BlockTags.COAL_ORES) || s.is(BlockTags.IRON_ORES) || s.is(BlockTags.COPPER_ORES)) {
                        mi++;
                        if (ex.length() < 160) ex.append(String.format(" %d,%d,%d=%s", x, y, z, s.getBlock().getDescriptionId().replace("block.minecraft.", "")));
                    }
                }
            }
            sb.append(String.format("chunk %d,%d (%s) : %d blocs de reserve, vides %d (fluides %d), minerais %d%s%n", cx, cz,
                    noms.isEmpty() ? "marge seule" : String.join(", ", noms), b, vi, fl, mi, ex.length() > 0 ? " :" + ex : ""));
            // 0.7.0 : colonne complete (du fond de la marge au ciel) sur le premier vide, par suites de blocs identiques,
            // avec les heightmaps : pour savoir d'ou vient un vide (aquifere, grotte, eau ouverte, structure)
            if (vi > 0) {
                int[] q = premierVide(n, ch, v, p);
                if (q != null) {
                    int x = q[0], z = q[1], dx = x & 15, dz = z & 15;
                    StringBuilder col = new StringBuilder();
                    String prec = null; int y0 = 0;
                    int haut = ch.getHeight(Heightmap.Types.WORLD_SURFACE, dx, dz) + 1;
                    for (int y = 20; y <= haut + 1; y++) {
                        String nomB = ch.getBlockState(p.set(x, y, z)).getBlock().getDescriptionId().replaceAll("^block\\.[a-z_]+\\.", "");
                        if (!nomB.equals(prec)) { if (prec != null) col.append(String.format(" [%d..%d %s]", y0, y - 1, prec)); prec = nomB; y0 = y; }
                    }
                    col.append(String.format(" [%d.. %s]", y0, prec));
                    sb.append(String.format("   colonne %d,%d : OCEAN_FLOOR %d, WORLD_SURFACE %d, MOTION_BLOCKING %d, biome %s ;%s%n", x, z,
                            ch.getHeight(Heightmap.Types.OCEAN_FLOOR, dx, dz), ch.getHeight(Heightmap.Types.WORLD_SURFACE, dx, dz),
                            ch.getHeight(Heightmap.Types.MOTION_BLOCKING, dx, dz),
                            n.getBiome(p.set(x, 50, z)).unwrapKey().map(k -> k.location().toString()).orElse("?"), col));
                    if (ch.getAllStarts() != null && !ch.getAllStarts().isEmpty()) sb.append("   departs de structures dans le chunk : ").append(ch.getAllStarts().keySet().size()).append('\n');
                    if (!ch.getAllReferences().isEmpty()) {
                        StringBuilder rf = new StringBuilder();
                        for (var e : ch.getAllReferences().entrySet()) if (!e.getValue().isEmpty())
                            rf.append(' ').append(n.registryAccess().registryOrThrow(net.minecraft.core.registries.Registries.STRUCTURE).getKey(e.getKey()));
                        if (rf.length() > 0) sb.append("   structures qui touchent le chunk :").append(rf).append('\n');
                    }
                }
            }
            tb += b; tv += vi; tf += fl; tm += mi;
        }
        sb.append(String.format("TOTAL : %d blocs, vides %d (fluides %d), minerais %d -> %s%n", tb, tv, tf, tm, tb > 0 && tv == 0 && tm == 0 ? "OK" : "A VOIR"));
        Tests.ecrireRapport(c, "rapport-sonde-volumes.txt", sb.toString());
        CarteIle.LOG.info("[atheria_ile] sonde des volumes : {} blocs, {} vides, {} minerais", tb, tv, tm);
    }

    private static int[] premierVide(ServerLevel n, LevelChunk ch, Volumes v, BlockPos.MutableBlockPos p) {
        int cx = ch.getPos().x, cz = ch.getPos().z;
        for (int dz = 0; dz < 16; dz++) for (int dx = 0; dx < 16; dx++) {
            int x = cx * 16 + dx, z = cz * 16 + dz, surf = ch.getHeight(Heightmap.Types.OCEAN_FLOOR, dx, dz);
            for (int y = n.getMinBuildHeight(); y <= surf - 3; y++) {
                if (!v.reserve(x, y, z)) continue;
                BlockState s = ch.getBlockState(p.set(x, y, z));
                if (s.isAir() || !s.getFluidState().isEmpty()) return new int[]{x, z};
            }
        }
        return null;
    }

    static void villes(ServerLevel n, CarteIle c) {
        if (!c.config.has("sonde_villes")) return;
        LienLostCities lc = LienLostCities.pour(n);
        StringBuilder sb = new StringBuilder("SONDE DES VILLES LOST CITIES (getChunkInfo sur chaque chunk des boites, sans generation)\n");
        if (lc == null) { sb.append("Lost Cities absent ou ne gere pas ce monde\n"); Tests.ecrireRapport(c, "rapport-sonde-villes.txt", sb.toString()); return; }
        List<int[]> zv = Exclusions.zonesVilles(c, new ArrayList<>());
        sb.append(zv.size()).append(" zones_villes\n");
        for (JsonElement e : c.config.getAsJsonArray("sonde_villes")) {
            JsonObject o = e.getAsJsonObject();
            int x1 = o.get("x1").getAsInt(), z1 = o.get("z1").getAsInt(), x2 = o.get("x2").getAsInt(), z2 = o.get("z2").getAsInt();
            int tot = 0, villes = 0, dedans = 0, horsZone = 0;
            StringBuilder hz = new StringBuilder();
            java.util.TreeMap<Integer, Integer> rues = new java.util.TreeMap<>();
            for (int cz = Math.floorDiv(z1, 16); cz <= Math.floorDiv(z2 - 1, 16); cz++)
                for (int cx = Math.floorDiv(x1, 16); cx <= Math.floorDiv(x2 - 1, 16); cx++) {
                    tot++;
                    int y = lc.rue(cx, cz);
                    if (y == Integer.MIN_VALUE) continue;
                    villes++;
                    rues.merge(y, 1, Integer::sum);
                    boolean in = false;
                    int bx = cx * 16, bz = cz * 16;
                    for (int[] b : zv) if (bx >= b[0] && bx < b[2] && bz >= b[1] && bz < b[3]) { in = true; break; }
                    if (in) dedans++; else { horsZone++; if (hz.length() < 200) hz.append(' ').append(bx).append(',').append(bz); }
                }
            sb.append(String.format("%s (%d,%d -> %d,%d) : %d chunks sondes, %d chunks de ville (%d dans zones_villes, %d hors zone%s), Y de rue %s%n",
                    o.has("nom") ? o.get("nom").getAsString() : "?", x1, z1, x2, z2, tot, villes, dedans, horsZone,
                    hz.length() > 0 ? " :" + hz : "", rues));
        }
        if (lc.erreurs > 0) sb.append("erreurs getChunkInfo : ").append(lc.erreurs).append('\n');
        Tests.ecrireRapport(c, "rapport-sonde-villes.txt", sb.toString());
        CarteIle.LOG.info("[atheria_ile] sonde des villes ecrite : rapport-sonde-villes.txt");
    }
}
