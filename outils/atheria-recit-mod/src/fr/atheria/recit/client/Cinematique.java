package fr.atheria.recit.client;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import java.util.ArrayList;
import java.util.List;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.util.Mth;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.Items;
import net.minecraft.world.phys.Vec3;

// Scenario d'une cinematique, lu depuis le JSON envoye par le serveur.
// Chaque plan est un trajet lisse (Catmull-Rom) parcouru a vitesse constante ; entre deux plans, c'est une coupe.
// La camera regarde soit les angles des points, soit un point fixe ("regard"), soit devant elle.
final class Cinematique {
    static final class Point {
        Vec3 pos;
        float lacet = Float.NaN;
        float tangage = Float.NaN;
        float roulis;
        double fov = Double.NaN;
    }

    static final class Plan {
        final List<Point> points = new ArrayList<>();
        double debut;
        double duree;
        Vec3 regard;
        boolean doux = true;
        double[] noeuds; // abscisse curviligne normalisee de chaque point
    }

    static final class Evenement {
        double t;
        double duree;
        String fondu;
        String titre;
        String sousTitre;
        String texte;
        String carteTitre;
        List<String> carteLignes = List.of();
        ItemStack icone = ItemStack.EMPTY;
        String son;
        float volume = 1;
        float hauteur = 1;
        boolean joue;
    }

    final List<Plan> plans = new ArrayList<>();
    final List<Evenement> evenements = new ArrayList<>();
    double duree;
    double attente = 2;
    boolean bandes = true;
    boolean debutNoir = true;
    boolean eviterSol = true;
    String musique;
    float volumeMusique = 1;

    // etat de la camera a l'instant t : x, y, z, lacet, tangage, roulis, fov (NaN = celui du joueur)
    final double[] etat = new double[7];

    static Cinematique lire(JsonObject o, Vec3 origine) {
        Cinematique c = new Cinematique();
        if (o.has("attente")) c.attente = o.get("attente").getAsDouble();
        if (o.has("bandes")) c.bandes = o.get("bandes").getAsBoolean();
        if (o.has("debut_noir")) c.debutNoir = o.get("debut_noir").getAsBoolean();
        if (o.has("eviter_sol")) c.eviterSol = o.get("eviter_sol").getAsBoolean();
        if (o.has("musique")) {
            JsonElement m = o.get("musique");
            if (m.isJsonObject()) {
                c.musique = m.getAsJsonObject().get("son").getAsString();
                if (m.getAsJsonObject().has("volume")) c.volumeMusique = m.getAsJsonObject().get("volume").getAsFloat();
            } else {
                c.musique = m.getAsString();
            }
        }
        double t = 0;
        if (o.has("plans")) {
            for (JsonElement el : o.getAsJsonArray("plans")) {
                JsonObject po = el.getAsJsonObject();
                Plan p = new Plan();
                p.debut = t;
                p.duree = Math.max(0.05, po.get("duree").getAsDouble());
                if (po.has("doux")) p.doux = po.get("doux").getAsBoolean();
                if (po.has("regard")) p.regard = vec(po.getAsJsonArray("regard")).add(origine);
                for (JsonElement pe : po.getAsJsonArray("points")) {
                    JsonObject q = pe.getAsJsonObject();
                    Point pt = new Point();
                    pt.pos = vec(q.getAsJsonArray("pos")).add(origine);
                    if (q.has("lacet")) pt.lacet = q.get("lacet").getAsFloat();
                    if (q.has("tangage")) pt.tangage = q.get("tangage").getAsFloat();
                    if (q.has("roulis")) pt.roulis = q.get("roulis").getAsFloat();
                    if (q.has("fov")) pt.fov = q.get("fov").getAsDouble();
                    p.points.add(pt);
                }
                if (p.points.isEmpty()) continue;
                deroulerLacets(p.points);
                longueurs(p);
                c.plans.add(p);
                t += p.duree;
            }
        }
        c.duree = o.has("duree") ? o.get("duree").getAsDouble() : t;
        if (o.has("evenements")) {
            for (JsonElement el : o.getAsJsonArray("evenements")) {
                JsonObject e = el.getAsJsonObject();
                Evenement ev = new Evenement();
                ev.t = e.has("t") ? e.get("t").getAsDouble() : 0;
                ev.duree = e.has("duree") ? e.get("duree").getAsDouble() : 4;
                if (e.has("fondu")) ev.fondu = e.get("fondu").getAsString();
                if (e.has("titre")) ev.titre = e.get("titre").getAsString();
                if (e.has("sous_titre")) ev.sousTitre = e.get("sous_titre").getAsString();
                if (e.has("texte")) ev.texte = e.get("texte").getAsString();
                if (e.has("carte")) {
                    JsonObject k = e.getAsJsonObject("carte");
                    ev.carteTitre = k.has("titre") ? k.get("titre").getAsString() : "";
                    List<String> l = new ArrayList<>();
                    if (k.has("lignes")) k.getAsJsonArray("lignes").forEach(x -> l.add(x.getAsString()));
                    ev.carteLignes = l;
                    if (k.has("icone")) ev.icone = objet(k.get("icone").getAsString());
                }
                if (e.has("son")) ev.son = e.get("son").getAsString();
                if (e.has("volume")) ev.volume = e.get("volume").getAsFloat();
                if (e.has("hauteur")) ev.hauteur = e.get("hauteur").getAsFloat();
                c.evenements.add(ev);
            }
        }
        c.evenements.sort((a, b) -> Double.compare(a.t, b.t));
        return c;
    }

    private static ItemStack objet(String id) {
        ResourceLocation rl = ResourceLocation.tryParse(id);
        if (rl == null) return ItemStack.EMPTY;
        Item it = BuiltInRegistries.ITEM.get(rl);
        return it == Items.AIR ? ItemStack.EMPTY : new ItemStack(it);
    }

    private static Vec3 vec(JsonArray a) {
        return new Vec3(a.get(0).getAsDouble(), a.get(1).getAsDouble(), a.get(2).getAsDouble());
    }

    // les lacets sont rendus continus pour toujours tourner par le chemin le plus court
    private static void deroulerLacets(List<Point> pts) {
        float prec = Float.NaN;
        for (Point p : pts) {
            if (Float.isNaN(p.lacet)) continue;
            if (!Float.isNaN(prec)) p.lacet = prec + Mth.wrapDegrees(p.lacet - prec);
            prec = p.lacet;
        }
    }

    private static void longueurs(Plan p) {
        int n = p.points.size();
        p.noeuds = new double[n];
        double total = 0;
        for (int i = 1; i < n; i++) {
            total += p.points.get(i).pos.distanceTo(p.points.get(i - 1).pos);
            p.noeuds[i] = total;
        }
        for (int i = 1; i < n; i++) p.noeuds[i] = total > 1e-6 ? p.noeuds[i] / total : (double) i / (n - 1);
    }

    // ---------- evaluation ----------
    double[] calculer(double t) {
        Plan p = plans.get(plans.size() - 1);
        for (Plan q : plans) {
            if (t < q.debut + q.duree) {
                p = q;
                break;
            }
        }
        double u = Mth.clamp((t - p.debut) / p.duree, 0, 1);
        if (p.doux) u = u * u * (3 - 2 * u);
        Vec3 pos = position(p, u);
        float lacet;
        float tangage;
        if (p.regard != null) {
            double[] a = angles(p.regard.subtract(pos));
            lacet = (float) a[0];
            tangage = (float) a[1];
        } else if (!Float.isNaN(p.points.get(0).lacet)) {
            lacet = (float) angle(p, u, true);
            tangage = (float) angle(p, u, false);
        } else {
            Vec3 devant = position(p, Math.min(1, u + 0.01)).subtract(position(p, Math.max(0, u - 0.01)));
            double[] a = devant.lengthSqr() < 1e-8 ? new double[] {0, 0} : angles(devant);
            lacet = (float) a[0];
            tangage = (float) a[1] * 0.6f;
        }
        int seg = segment(p, u);
        double s = local(p, seg, u);
        Point a = p.points.get(seg);
        Point b = p.points.get(Math.min(seg + 1, p.points.size() - 1));
        etat[0] = pos.x;
        etat[1] = pos.y;
        etat[2] = pos.z;
        etat[3] = lacet;
        etat[4] = tangage;
        etat[5] = Mth.lerp(s, a.roulis, b.roulis);
        etat[6] = Double.isNaN(a.fov) || Double.isNaN(b.fov) ? (Double.isNaN(a.fov) ? b.fov : a.fov) : Mth.lerp(s, a.fov, b.fov);
        return etat;
    }

    private static int segment(Plan p, double u) {
        int n = p.points.size();
        for (int i = 0; i < n - 1; i++) if (u <= p.noeuds[i + 1]) return i;
        return Math.max(0, n - 2);
    }

    private static double local(Plan p, int seg, double u) {
        if (p.points.size() < 2) return 0;
        double a = p.noeuds[seg];
        double b = p.noeuds[seg + 1];
        return b - a < 1e-9 ? 0 : Mth.clamp((u - a) / (b - a), 0, 1);
    }

    private static Vec3 position(Plan p, double u) {
        List<Point> pts = p.points;
        int n = pts.size();
        if (n == 1) return pts.get(0).pos;
        int i = segment(p, u);
        double s = local(p, i, u);
        Vec3 p0 = pts.get(Math.max(0, i - 1)).pos;
        Vec3 p1 = pts.get(i).pos;
        Vec3 p2 = pts.get(i + 1).pos;
        Vec3 p3 = pts.get(Math.min(n - 1, i + 2)).pos;
        return new Vec3(cr(p0.x, p1.x, p2.x, p3.x, s), cr(p0.y, p1.y, p2.y, p3.y, s), cr(p0.z, p1.z, p2.z, p3.z, s));
    }

    private static double angle(Plan p, double u, boolean lacet) {
        List<Point> pts = p.points;
        int n = pts.size();
        if (n == 1) return lacet ? pts.get(0).lacet : pts.get(0).tangage;
        int i = segment(p, u);
        double s = local(p, i, u);
        return cr(val(pts, i - 1, lacet), val(pts, i, lacet), val(pts, i + 1, lacet), val(pts, i + 2, lacet), s);
    }

    private static double val(List<Point> pts, int i, boolean lacet) {
        Point p = pts.get(Mth.clamp(i, 0, pts.size() - 1));
        float v = lacet ? p.lacet : p.tangage;
        return Float.isNaN(v) ? 0 : v;
    }

    private static double cr(double p0, double p1, double p2, double p3, double s) {
        double s2 = s * s;
        double s3 = s2 * s;
        return 0.5 * (2 * p1 + (-p0 + p2) * s + (2 * p0 - 5 * p1 + 4 * p2 - p3) * s2 + (-p0 + 3 * p1 - 3 * p2 + p3) * s3);
    }

    // direction -> angles Minecraft (lacet 0 = sud, tangage positif = vers le bas)
    static double[] angles(Vec3 d) {
        double h = Math.sqrt(d.x * d.x + d.z * d.z);
        double lacet = Math.toDegrees(Math.atan2(d.z, d.x)) - 90;
        double tangage = -Math.toDegrees(Math.atan2(d.y, h));
        return new double[] {lacet, tangage};
    }
}
