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

    /** 0.5.6 : zones ou le mod des villes (atheria-monde) laisse Lost Cities poser des villes */
    static final String REGION_VILLES = "Friches";
    static final String ZONE_PORT = "Port de Longoni";
    static final int ZONES_MAX = 64;
    static final double DEBORD_MAX = 0.05;
    /** bilan de la derniere construction, pour le journal et volumes-pour-les-villes.md */
    static String bilanZones = "";

    /**
     * zones_villes : union de rectangles alignes sur les chunks (x2,z2 exclus) qui couvre la region des Friches de
     * carte.png. Une cellule (S x S chunks) est retenue si elle contient au moins un pixel des Friches et AUCUN pixel
     * d'une autre region (l'ocean, le lagon, les rivieres et les lacs sont neutres) : jamais sur Petite-Terre ni
     * ailleurs. Les cellules sont fusionnees en rectangles (bandes par ligne puis fusion verticale) ; S est la plus
     * petite taille (1, 2, 4, 8 chunks) qui donne au plus 64 rectangles avec au plus 5 % de debord hors des Friches.
     * Plus la boite (alignee sur les chunks) du disque du port de Longoni (zones_biome).
     */
    static List<int[]> zonesVilles(CarteIle c, List<String> noms) {
        List<int[]> res = new ArrayList<>();
        int R = c.regionNommee(REGION_VILLES);
        if (R < 0) { bilanZones = "region '" + REGION_VILLES + "' absente de regions.json : pas de zones_villes"; return res; }
        int pxMin = Integer.MAX_VALUE, pxMax = -1, pzMin = Integer.MAX_VALUE, pzMax = -1, nR = 0;
        for (int pz = 0; pz < c.h; pz++) for (int px = 0; px < c.w; px++) if ((c.classe[pz * c.w + px] & 0xFF) == 3 + R) {
            pxMin = Math.min(pxMin, px); pxMax = Math.max(pxMax, px); pzMin = Math.min(pzMin, pz); pzMax = Math.max(pzMax, pz); nR++;
        }
        String detail = "";
        if (nR > 0) {
            int bx0 = (int) Math.floor(c.origineX + pxMin * c.bpp), bx1 = (int) Math.ceil(c.origineX + (pxMax + 1) * c.bpp);
            int bz0 = (int) Math.floor(c.origineZ + pzMin * c.bpp), bz1 = (int) Math.ceil(c.origineZ + (pzMax + 1) * c.bpp);
            List<int[]> meilleur = null;
            double debordMeilleur = 0, couvMeilleur = 0;
            int sMeilleur = 0;
            for (int S : new int[]{1, 2, 4, 8, 16}) {
                int t = 16 * S;
                int gx0 = Math.floorDiv(bx0, t), gx1 = Math.floorDiv(bx1 - 1, t), gz0 = Math.floorDiv(bz0, t), gz1 = Math.floorDiv(bz1 - 1, t);
                int gw = gx1 - gx0 + 1, gh = gz1 - gz0 + 1;
                boolean[] ok = new boolean[gw * gh];
                for (int gz = 0; gz < gh; gz++) for (int gx = 0; gx < gw; gx++) {
                    int x0 = (gx0 + gx) * t, z0 = (gz0 + gz) * t;
                    int qx0 = (int) Math.floor((x0 - c.origineX) / c.bpp), qx1 = (int) Math.floor((x0 + t - 1 - c.origineX) / c.bpp);
                    int qz0 = (int) Math.floor((z0 - c.origineZ) / c.bpp), qz1 = (int) Math.floor((z0 + t - 1 - c.origineZ) / c.bpp);
                    boolean a = false, autre = false;
                    for (int qz = qz0; qz <= qz1 && !autre; qz++) for (int qx = qx0; qx <= qx1; qx++) {
                        if (qx < 0 || qz < 0 || qx >= c.w || qz >= c.h) continue;
                        int k = c.classe[qz * c.w + qx] & 0xFF;
                        if (k == 3 + R) a = true;
                        else if (k >= 3 && k < 126) { autre = true; break; }
                    }
                    ok[gz * gw + gx] = a && !autre;
                }
                // bandes par ligne, fusion verticale des bandes identiques
                List<int[]> rects = new ArrayList<>();          // {gxa, gxb (incl), gza, gzb (incl)}
                java.util.Map<Long, int[]> ouverts = new java.util.HashMap<>();
                for (int gz = 0; gz <= gh; gz++) {
                    java.util.Map<Long, int[]> suivants = new java.util.HashMap<>();
                    if (gz < gh) {
                        int gx = 0;
                        while (gx < gw) {
                            if (!ok[gz * gw + gx]) { gx++; continue; }
                            int a = gx;
                            while (gx < gw && ok[gz * gw + gx]) gx++;
                            long cle = ((long) a << 32) | (gx - 1);
                            int[] o = ouverts.remove(cle);
                            if (o != null) { o[3] = gz; suivants.put(cle, o); }
                            else suivants.put(cle, new int[]{a, gx - 1, gz, gz});
                        }
                    }
                    rects.addAll(ouverts.values());
                    ouverts = suivants;
                }
                // debord : pixels hors Friches (neutres) dans les rectangles ; couverture des pixels des Friches
                long dedans = 0, horsR = 0;
                boolean[] couvert = new boolean[c.w * c.h];
                List<int[]> blocs = new ArrayList<>();
                for (int[] q : rects) {
                    int x1 = (gx0 + q[0]) * t, x2 = (gx0 + q[1] + 1) * t, z1 = (gz0 + q[2]) * t, z2 = (gz0 + q[3] + 1) * t;
                    blocs.add(new int[]{x1, z1, x2, z2});
                    for (int bz = z1; bz < z2; bz += 4) for (int bx = x1; bx < x2; bx += 4) {
                        int qx = (int) Math.floor((bx + 2 - c.origineX) / c.bpp), qz = (int) Math.floor((bz + 2 - c.origineZ) / c.bpp);
                        if (qx < 0 || qz < 0 || qx >= c.w || qz >= c.h) { horsR++; continue; }
                        if ((c.classe[qz * c.w + qx] & 0xFF) == 3 + R) { dedans++; couvert[qz * c.w + qx] = true; } else horsR++;
                    }
                }
                int nc = 0;
                for (boolean b : couvert) if (b) nc++;
                double debord = (dedans + horsR) == 0 ? 0 : horsR / (double) (dedans + horsR);
                double couv = nc / (double) nR;
                detail += String.format(" [cellule %d chunks : %d rectangles, debord %.1f %%, %.1f %% des Friches couvertes]", S, blocs.size(), 100 * debord, 100 * couv);
                if (blocs.size() <= ZONES_MAX && debord <= DEBORD_MAX) { meilleur = blocs; debordMeilleur = debord; couvMeilleur = couv; sMeilleur = S; break; }
            }
            if (meilleur != null) {
                meilleur.sort((a, b) -> a[1] != b[1] ? Integer.compare(a[1], b[1]) : Integer.compare(a[0], b[0]));
                for (int i = 0; i < meilleur.size(); i++) { res.add(meilleur.get(i)); noms.add(REGION_VILLES + " " + (i + 1)); }
                detail = String.format("Friches : %d rectangles (cellule %d chunks), debord %.1f %%, %.1f %% des Friches couvertes ;", meilleur.size(), sMeilleur, 100 * debordMeilleur, 100 * couvMeilleur) + detail;
            } else detail = "Friches : AUCUNE taille de cellule ne tient en " + ZONES_MAX + " rectangles a 5 % de debord ;" + detail;
        }
        // disque du port de Longoni (zones_biome) : sa boite alignee sur les chunks
        String port = " port : absent";
        for (int i = 0; c.zoneNom != null && i < c.zoneNom.length; i++) {
            if (c.zoneNom[i] == null || !c.zoneNom[i].startsWith(ZONE_PORT)) continue;
            double x1, z1, x2, z2;
            if (c.zoneRect[i]) { x1 = c.zoneX1[i]; z1 = c.zoneZ1[i]; x2 = c.zoneX2[i]; z2 = c.zoneZ2[i]; }
            else { x1 = c.zoneX[i] - c.zoneRayon[i]; x2 = c.zoneX[i] + c.zoneRayon[i]; z1 = c.zoneZ[i] - c.zoneRayon[i]; z2 = c.zoneZ[i] + c.zoneRayon[i]; }
            int[] b = {Math.floorDiv((int) Math.floor(x1), 16) * 16, Math.floorDiv((int) Math.floor(z1), 16) * 16,
                    (Math.floorDiv((int) Math.ceil(x2) - 1, 16) + 1) * 16, (Math.floorDiv((int) Math.ceil(z2) - 1, 16) + 1) * 16};
            res.add(b); noms.add(c.zoneNom[i]);
            port = String.format(" port : '%s' %d,%d -> %d,%d", c.zoneNom[i], b[0], b[1], b[2], b[3]);
            break;
        }
        bilanZones = detail + port;
        return res;
    }

    /** hash de regions.json puis carte.png (une carte modifiee change aussi zones_villes) */
    static String sha256(Path regions, Path carte) throws Exception {
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        md.update(Files.readAllBytes(regions));
        if (Files.isRegularFile(carte)) md.update(Files.readAllBytes(carte));
        StringBuilder sb = new StringBuilder();
        for (byte b : md.digest()) sb.append(String.format("%02x", b));
        return sb.toString();
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
            // 0.5.6 : version 2 (zones_villes), hash de regions.json ET carte.png : l'ancien fichier (version 1) est reecrit
            String hash = sha256(src, c.dossier.resolve("carte.png"));
            if (Files.isRegularFile(dest)) {
                try (Reader rd = Files.newBufferedReader(dest, StandardCharsets.UTF_8)) {
                    JsonObject o = JsonParser.parseReader(rd).getAsJsonObject();
                    if (o.has("source_sha256") && hash.equals(o.get("source_sha256").getAsString()) && o.has("zones_villes")) {
                        CarteIle.LOG.info("[atheria_ile] exclusions.json a jour ({} chunks exclus, {} zones de villes)", c.chunksExclus.length, o.getAsJsonArray("zones_villes").size());
                        return;
                    }
                } catch (Exception e) {
                    CarteIle.LOG.warn("[atheria_ile] exclusions.json illisible, reecrit : {}", e.toString());
                }
            }
            JsonObject o = new JsonObject();
            o.addProperty("version", 2);
            o.addProperty("convention", "x2,z2 exclus");
            o.addProperty("source_sha256", hash);
            o.addProperty("route_marge_blocs", c.margeRoute);
            o.addProperty("regle_structures", "une structure dont la boite passe a moins de route_marge_blocs de l'axe (chaussee + bas-cotes) ou entre dans un lot et sa marge est refusee ; les chunks_exclus servent de pre-filtre et au mod des villes");
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
            // 0.5.6 : zones_villes (blocs, x2,z2 exclus, alignes sur les chunks), une boite par ligne
            List<String> nomsZ = new ArrayList<>();
            List<int[]> zv = zonesVilles(c, nomsZ);
            sb.append(",\n  \"zones_villes_aide\": \"rectangles ou atheria-monde laisse Lost Cities poser des villes : region des Friches de carte.png (aucune autre region, debord <= 5 %) et boite du port de Longoni\"");
            sb.append(",\n  \"zones_villes\": [");
            for (int i = 0; i < zv.size(); i++) {
                int[] b = zv.get(i);
                sb.append(i == 0 ? "\n    " : ",\n    ").append(String.format("{\"nom\": \"%s\", \"x1\": %d, \"z1\": %d, \"x2\": %d, \"z2\": %d}",
                        nomsZ.get(i).replace("\"", "'"), b[0], b[1], b[2], b[3]));
            }
            sb.append("\n  ]");
            CarteIle.LOG.info("[atheria_ile] zones_villes : {}", bilanZones);
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
