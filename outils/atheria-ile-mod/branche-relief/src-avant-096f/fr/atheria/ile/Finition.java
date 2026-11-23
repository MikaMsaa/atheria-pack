package fr.atheria.ile;

import net.minecraft.server.level.ServerLevel;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.Level;

import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * 0.5.6 : file des chunks NEUFS du couloir des routes a finir (RouteFeature.finir) une fois leurs voisins generes.
 * File bornee (CAPACITE), videe sur le fil du serveur avec un budget de temps par tick ; seuls les chunks
 * de l'overworld proches d'une route y entrent. Un chunk decharge avant son tour est simplement saute.
 */
final class Finition {
    private Finition() {}

    static final int CAPACITE = 8192;
    static final long BUDGET_NS = 3_000_000L;   // 3 ms par tick
    private static final ConcurrentLinkedQueue<Long> FILE = new ConcurrentLinkedQueue<>();
    private static final AtomicInteger TAILLE = new AtomicInteger();
    static final AtomicInteger FINIS = new AtomicInteger(), PERDUS = new AtomicInteger(), DEBORDES = new AtomicInteger();

    /** ChunkEvent.Load d'un chunk neuf (n'importe quel fil) */
    static void nouveau(Level niveau, ChunkPos cp) {
        if (!(niveau instanceof ServerLevel) || niveau.dimension() != Level.OVERWORLD) return;
        CarteIle c = CarteIle.active();
        if (c == null || c.routes.isEmpty()) return;
        int x0 = cp.getMinBlockX(), z0 = cp.getMinBlockZ();
        boolean pres = false;
        for (Route r : c.routes)
            if (r.pres(x0 + 8, z0 + 8) || r.pres(x0, z0) || r.pres(x0 + 15, z0 + 15) || r.pres(x0, z0 + 15) || r.pres(x0 + 15, z0)) { pres = true; break; }
        if (!pres) return;
        if (TAILLE.incrementAndGet() > CAPACITE) { TAILLE.decrementAndGet(); DEBORDES.incrementAndGet(); return; }
        FILE.add(cp.toLong());
    }

    /** a appeler sur le fil du serveur ; budget en ns (<= 0 : tout vider) */
    static void traiter(ServerLevel n, long budgetNs) {
        CarteIle c = CarteIle.active();
        if (c == null || FILE.isEmpty()) return;
        long fin = System.nanoTime() + budgetNs;
        Long k;
        while ((k = FILE.poll()) != null) {
            TAILLE.decrementAndGet();
            int cx = ChunkPos.getX(k), cz = ChunkPos.getZ(k);
            if (n.getChunkSource().getChunkNow(cx, cz) == null) { PERDUS.incrementAndGet(); continue; }
            try { RouteFeature.finir(n, c, cx, cz); FINIS.incrementAndGet(); }
            catch (Throwable t) { CarteIle.LOG.warn("[atheria_ile] finition du chunk {},{} : {}", cx, cz, t.toString()); }
            if (budgetNs > 0 && System.nanoTime() > fin) break;
        }
    }

    static String bilan() { return String.format("finition des routes : %d chunks finis, %d decharges avant leur tour, %d hors capacite, %d en attente", FINIS.get(), PERDUS.get(), DEBORDES.get(), TAILLE.get()); }
}
