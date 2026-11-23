package fr.atheria.ile;

import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Chunks exclus pour les structures et pour le mod des villes : chunks dont au moins un bloc est a moins de
 * route_marge_blocs de l'axe d'une route (distance minimale carre du chunk / polyligne de l'axe), plus les chunks
 * touches par un lot et sa marge. Ecrit config/atheria_ile/exclusions.json (seulement si regions.json a change).
 */
public final class Exclusions {
    private Exclusions() {}

    static long cle(int cx, int cz) { return ((long) cx << 32) | (cz & 0xFFFFFFFFL); }

    /** distance minimale entre le segment (ax,az)-(bx,bz) et le carre des centres de blocs du chunk */
    static double distanceSegmentChunk(double ax, double az, double bx, double bz, int cx, int cz) {
        double sx0 = cx * 16 + 0.5, sx1 = cx * 16 + 15.5, sz0 = cz * 16 + 0.5, sz1 = cz * 16 + 15.5;
        double d = Math.min(pointCarre(ax, az, sx0, sz0, sx1, sz1), pointCarre(bx, bz, sx0, sz0, sx1, sz1));
        if (d == 0) return 0;
        d = Math.min(d, pointSegment(sx0, sz0, ax, az, bx, bz));
        d = Math.min(d, pointSegment(sx1, sz0, ax, az, bx, bz));
        d = Math.min(d, pointSegment(sx0, sz1, ax, az, bx, bz));
        d = Math.min(d, pointSegment(sx1, sz1, ax, az, bx, bz));
        return d;
    }

    private static double pointCarre(double px, double pz, double x0, double z0, double x1, double z1) {
        double dx = Math.max(Math.max(x0 - px, 0), px - x1), dz = Math.max(Math.max(z0 - pz, 0), pz - z1);
        return Math.hypot(dx, dz);
    }

    private static double pointSegment(double px, double pz, double ax, double az, double bx, double bz) {
        double dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz;
        double t = l2 == 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / l2));
        return Math.hypot(ax + t * dx - px, az + t * dz - pz);
    }

    /** cles triees des chunks exclus */
    static long[] calculer(List<Route> routes, List<Lot> lots, int margeRoute) {
        Set<Long> s = new HashSet<>();
        for (Route r : routes) {
            int m = r.ax.length;
            for (int i = 0; i + 1 < m || (m == 1 && i == 0); i++) {
                double ax = r.ax[i], az = r.az[i], bx = r.ax[Math.min(m - 1, i + 1)], bz = r.az[Math.min(m - 1, i + 1)];
                int cx0 = (int) Math.floor((Math.min(ax, bx) - margeRoute) / 16), cx1 = (int) Math.floor((Math.max(ax, bx) + margeRoute) / 16);
                int cz0 = (int) Math.floor((Math.min(az, bz) - margeRoute) / 16), cz1 = (int) Math.floor((Math.max(az, bz) + margeRoute) / 16);
                for (int cz = cz0; cz <= cz1; cz++) for (int cx = cx0; cx <= cx1; cx++)
                    if (distanceSegmentChunk(ax, az, bx, bz, cx, cz) < margeRoute) s.add(cle(cx, cz));
                if (m == 1) break;
            }
        }
        for (Lot l : lots) for (int cz = l.cz0(); cz <= l.cz1(); cz++) for (int cx = l.cx0(); cx <= l.cx1(); cx++) s.add(cle(cx, cz));
        long[] t = new long[s.size()];
        int k = 0;
        for (long v : s) t[k++] = v;
        Arrays.sort(t);
        return t;
    }

    static String sha256(Path f) throws Exception {
        byte[] h = MessageDigest.getInstance("SHA-256").digest(Files.readAllBytes(f));
        StringBuilder sb = new StringBuilder();
        for (byte b : h) sb.append(String.format("%02x", b));
        return sb.toString();
    }

    /** ecrit exclusions.json si le hash de regions.json a change (ecriture atomique : tmp puis move) */
    static void ecrire(CarteIle c) {
        try {
            Path src = c.dossier.resolve("regions.json"), dest = c.dossier.resolve("exclusions.json");
            String hash = sha256(src);
            if (Files.isRegularFile(dest)) {
                try (Reader rd = Files.newBufferedReader(dest, StandardCharsets.UTF_8)) {
                    JsonObject o = JsonParser.parseReader(rd).getAsJsonObject();
                    if (o.has("source_sha256") && hash.equals(o.get("source_sha256").getAsString())) {
                        CarteIle.LOG.info("[atheria_ile] exclusions.json a jour ({} chunks exclus)", c.chunksExclus.length);
                        return;
                    }
                } catch (Exception e) {
                    CarteIle.LOG.warn("[atheria_ile] exclusions.json illisible, reecrit : {}", e.toString());
                }
            }
            JsonObject o = new JsonObject();
            o.addProperty("version", 1);
            o.addProperty("convention", "x2,z2 exclus");
            o.addProperty("source_sha256", hash);
            o.addProperty("route_marge_blocs", c.margeRoute);
            JsonArray lots = new JsonArray();
            for (Lot l : c.lots) {
                JsonObject lo = new JsonObject();
                lo.addProperty("nom", l.nom);
                lo.addProperty("x1", l.x1); lo.addProperty("z1", l.z1); lo.addProperty("x2", l.x2); lo.addProperty("z2", l.z2);
                lo.addProperty("marge_blocs", l.marge);
                lots.add(lo);
            }
            o.add("lots", lots);
            List<int[]> ch = new ArrayList<>();
            for (long k : c.chunksExclus) ch.add(new int[]{(int) (k >> 32), (int) k});
            ch.sort((a, b) -> a[0] != b[0] ? Integer.compare(a[0], b[0]) : Integer.compare(a[1], b[1]));
            // chunks_exclus sur une ligne par chunk pour rester lisible et compact
            String tete = new GsonBuilder().setPrettyPrinting().disableHtmlEscaping().create().toJson(o);
            StringBuilder sb = new StringBuilder(tete.substring(0, tete.lastIndexOf('}')).stripTrailing());
            // routes : axe echantillonne tous les 8 blocs, 10 points par ligne
            sb.append(",\n  \"routes\": [");
            for (int ri = 0; ri < c.routes.size(); ri++) {
                Route r = c.routes.get(ri);
                int m = r.ax.length;
                List<int[]> pl = new ArrayList<>();
                for (int i = 0; i < m; i += 4) pl.add(new int[]{Math.round(r.ax[i]), Math.round(r.az[i])});
                if ((m - 1) % 4 != 0) pl.add(new int[]{Math.round(r.ax[m - 1]), Math.round(r.az[m - 1])});
                sb.append(ri == 0 ? "\n    [" : ",\n    [");
                for (int i = 0; i < pl.size(); i++) sb.append(i == 0 ? "" : ",").append(i % 10 == 0 ? "\n      " : " ").append('[').append(pl.get(i)[0]).append(", ").append(pl.get(i)[1]).append(']');
                sb.append("\n    ]");
            }
            sb.append("\n  ]");
            sb.append(",\n  \"chunks_exclus\": [");
            for (int i = 0; i < ch.size(); i++) sb.append(i == 0 ? "\n    " : ",\n    ").append('[').append(ch.get(i)[0]).append(", ").append(ch.get(i)[1]).append(']');
            sb.append("\n  ]\n}\n");
            Path tmp = c.dossier.resolve("exclusions.json.tmp");
            Files.writeString(tmp, sb.toString(), StandardCharsets.UTF_8);
            try {
                Files.move(tmp, dest, StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING);
            } catch (java.nio.file.AtomicMoveNotSupportedException e) {
                Files.move(tmp, dest, StandardCopyOption.REPLACE_EXISTING);
            }
            CarteIle.LOG.info("[atheria_ile] exclusions.json ecrit : {} chunks exclus, {} lots, {} routes", ch.size(), c.lots.size(), c.routes.size());
        } catch (Exception e) {
            CarteIle.LOG.error("[atheria_ile] ECHEC de l'ecriture de exclusions.json", e);
        }
    }

}
