package fr.atheria.ile;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

import java.util.ArrayList;
import java.util.List;

/**
 * Lot fixe ("lots" dans regions.json) : rectangle [x1, x2) x [z1, z2) (x2 et z2 exclus) reserve a un batiment fait main.
 * Le mod de l'ile n'y pose rien : aucune structure ne demarre sur le lot et sa marge, la route n'y est pas posee.
 */
public final class Lot {
    public final String nom;
    public final int x1, z1, x2, z2, marge;

    Lot(String nom, int x1, int z1, int x2, int z2, int marge) {
        this.nom = nom;
        this.x1 = Math.min(x1, x2); this.x2 = Math.max(x1, x2);
        this.z1 = Math.min(z1, z2); this.z2 = Math.max(z1, z2);
        this.marge = marge;
    }

    /** vrai si le bloc est dans le lot (sans la marge) */
    public boolean contient(int bx, int bz) { return bx >= x1 && bx < x2 && bz >= z1 && bz < z2; }

    /** premier et dernier chunk (inclus) touches par le lot et sa marge */
    public int cx0() { return Math.floorDiv(x1 - marge, 16); }
    public int cx1() { return Math.floorDiv(x2 + marge - 1, 16); }
    public int cz0() { return Math.floorDiv(z1 - marge, 16); }
    public int cz1() { return Math.floorDiv(z2 + marge - 1, 16); }

    static List<Lot> lire(JsonObject config) {
        List<Lot> l = new ArrayList<>();
        if (!config.has("lots") || !config.get("lots").isJsonArray()) return l;
        for (JsonElement e : config.getAsJsonArray("lots")) {
            if (!e.isJsonObject()) continue;
            JsonObject o = e.getAsJsonObject();
            Lot lot = new Lot(o.has("nom") ? o.get("nom").getAsString() : "lot " + (l.size() + 1),
                    o.get("x1").getAsInt(), o.get("z1").getAsInt(), o.get("x2").getAsInt(), o.get("z2").getAsInt(),
                    o.has("marge_blocs") ? Math.max(0, o.get("marge_blocs").getAsInt()) : 16);
            CarteIle.LOG.info("[atheria_ile] lot '{}' : {},{} -> {},{} (x2,z2 exclus), marge {}", lot.nom, lot.x1, lot.z1, lot.x2, lot.z2, lot.marge);
            l.add(lot);
        }
        return l;
    }
}
