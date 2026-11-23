package fr.atheria.ile;

import com.google.gson.JsonObject;
import net.minecraft.server.MinecraftServer;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.world.level.chunk.ChunkGenerator;
import net.minecraft.world.level.levelgen.Heightmap;
import net.minecraft.world.level.levelgen.RandomState;

import java.io.DataOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * 0.9.0 : mesure du relief de base de toute l'ile (cle de test "relief_bake" de regions.json, absente du vrai fichier).
 * {"relief_bake": {"pas": 8, "threads": 2, "sortie": "relief_base.bin", "mer_blocs": 160}}
 * Hauteur de surface (OCEAN_FLOOR_WG, sans generer de chunk) tous les "pas" blocs, sur la carte entiere, sauf en mer
 * a plus de "mer_blocs" de la cote (valeur -32768). Threads de priorite minimale. Fichier : entete "ATRB", x0, z0, pas, w, h, short[].
 * Fin signalee par la ligne "[RELIEF_BAKE] fin".
 */
final class ReliefBake {
    private ReliefBake() {}

    static volatile boolean arret;

    static void demarrage(MinecraftServer server, CarteIle c) {
        if (!c.config.has("relief_bake") || !c.config.get("relief_bake").isJsonObject()) return;
        JsonObject b = c.config.getAsJsonObject("relief_bake");
        int pas = b.has("pas") ? Math.max(2, b.get("pas").getAsInt()) : 8;
        int nt = b.has("threads") ? Math.max(1, Math.min(8, b.get("threads").getAsInt())) : 2;
        double mer = b.has("mer_blocs") ? b.get("mer_blocs").getAsDouble() : 160;
        Path sortie = c.dossier.resolve(b.has("sortie") ? b.get("sortie").getAsString() : "relief_base.bin");
        ServerLevel n = server.overworld();
        // sonde des villes Lost Cities (getChunkInfo, sans generation) avant le bake : verifie la colline d'appui
        if (c.config.has("sonde_villes")) try { Sondes.villes(n, c); } catch (Throwable e) { CarteIle.LOG.error("[RELIEF_BAKE] sonde des villes en echec", e); }
        ChunkGenerator g = n.getChunkSource().getGenerator();
        RandomState rs = n.getChunkSource().randomState();
        int x0 = (int) Math.floor(c.origineX), z0 = (int) Math.floor(c.origineZ);
        int w = (int) Math.ceil(c.w * c.bpp / (double) pas) + 1, h = (int) Math.ceil(c.h * c.bpp / (double) pas) + 1;
        short[] t = new short[w * h];
        // zones locales facultatives : [[x1, z1, x2, z2], ...] ; hors zones = -32767 (non mesure)
        final java.util.List<int[]> zones = new java.util.ArrayList<>();
        if (b.has("zones")) for (var e : b.getAsJsonArray("zones")) { var q = e.getAsJsonArray(); zones.add(new int[]{q.get(0).getAsInt(), q.get(1).getAsInt(), q.get(2).getAsInt(), q.get(3).getAsInt()}); }
        AtomicInteger ligne = new AtomicInteger(), faites = new AtomicInteger();
        arret = false;
        long t0 = System.nanoTime();
        CarteIle.LOG.info("[RELIEF_BAKE] debut : {}x{} points, pas {}, {} threads -> {}", w, h, pas, nt, sortie);
        Thread[] th = new Thread[nt];
        for (int k = 0; k < nt; k++) {
            th[k] = new Thread(() -> {
                int j;
                while (!arret && server.isRunning() && (j = ligne.getAndIncrement()) < h) {
                    int z = z0 + j * pas;
                    for (int i = 0; i < w; i++) {
                        int x = x0 + i * pas;
                        if (!zones.isEmpty()) { boolean in = false; for (int[] q : zones) if (x >= q[0] && x <= q[2] && z >= q[1] && z <= q[3]) { in = true; break; } if (!in) { t[j * w + i] = -32767; continue; } }
                        if (c.distanceBlocs(x, z) < -mer) { t[j * w + i] = Short.MIN_VALUE; continue; }
                        t[j * w + i] = (short) g.getBaseHeight(x, z, Heightmap.Types.OCEAN_FLOOR_WG, n, rs);
                    }
                    int f = faites.incrementAndGet();
                    if (f % Math.max(1, h / 20) == 0)
                        CarteIle.LOG.info("[RELIEF_BAKE] {} % ({} s)", 100 * f / h, (System.nanoTime() - t0) / 1_000_000_000L);
                }
            }, "atheria-relief-bake-" + k);
            th[k].setPriority(Thread.MIN_PRIORITY);
            th[k].setDaemon(true);
        }
        Thread chef = new Thread(() -> {
            try {
                for (Thread x : th) x.start();
                for (Thread x : th) x.join();
                if (faites.get() < h) { CarteIle.LOG.warn("[RELIEF_BAKE] interrompu ({} lignes sur {})", faites.get(), h); return; }
                Path tmp = sortie.resolveSibling(sortie.getFileName() + ".tmp");
                try (DataOutputStream o = new DataOutputStream(new java.io.BufferedOutputStream(Files.newOutputStream(tmp), 1 << 16))) {
                    o.writeInt(0x41545242); o.writeInt(x0); o.writeInt(z0); o.writeInt(pas); o.writeInt(w); o.writeInt(h);
                    for (short v : t) o.writeShort(v);
                }
                Files.move(tmp, sortie, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                CarteIle.LOG.info("[RELIEF_BAKE] fin : {} points en {} s -> {}", (long) w * h, (System.nanoTime() - t0) / 1_000_000_000L, sortie);
            } catch (Exception e) { CarteIle.LOG.error("[RELIEF_BAKE] echec : {}", e.toString()); }
        }, "atheria-relief-bake");
        chef.setDaemon(true);
        chef.start();
    }

    /** diagnostic : delta, force naturelle, depth du router et hauteur de base a la colonne (sans generer) */
    private static boolean villesSondees = false;

    static String sonde(MinecraftServer server, int x, int z) {
        CarteIle c = CarteIle.active();
        if (c == null) return "pas d'ile";
        ServerLevel n = server.overworld();
        RandomState rs = n.getChunkSource().randomState();
        var r = rs.router();
        if (!villesSondees && c.config.has("sonde_villes")) { villesSondees = true; try { Sondes.villes(n, c); } catch (Throwable e) { CarteIle.LOG.error("[SONDE_RELIEF] sonde des villes en echec", e); } }
        StringBuilder sb = new StringBuilder("[SONDE_RELIEF] " + x + "," + z);
        sb.append(" delta=").append(String.format("%.2f", c.deltaRelief(x, z))).append(" aDelta=").append(c.aDelta());
        sb.append(" fN=").append(String.format("%.3f", c.forceNaturel(x, z))).append(" fD=").append(String.format("%.3f", c.forceDelta(x, z)));
        for (int y : new int[]{64, 96, 128}) {
            var p = new net.minecraft.world.level.levelgen.DensityFunction.SinglePointContext(x, y, z);
            sb.append(String.format(" depth(y%d)=%.4f final(y%d)=%.4f", y, r.depth().compute(p), y, r.finalDensity().compute(p)));
        }
        sb.append(" decalage=").append(IleChamp.decalage(c, x, z));
        sb.append(" hauteur=").append(n.getChunkSource().getGenerator().getBaseHeight(x, z, net.minecraft.world.level.levelgen.Heightmap.Types.OCEAN_FLOOR_WG, n, rs));
        CarteIle.LOG.info(sb.toString());
        return sb.toString();
    }
}
