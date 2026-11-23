package fr.atheria.monde;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;
import net.minecraft.world.level.ChunkPos;

// Chunks ou Lost Cities ne doit rien construire : la RN1 (couloir decide par le mod de l'ile, lu dans le fichier, jamais en dur ici) et les emprises des lieux
// nommes poses a coordonnees fixes. Le mod de l'ile ecrit config/atheria_ile/exclusions.json au chargement :
// {"version":1, "chunks_exclus":[[cx,cz],...], "lots":[...], "routes":[...], "zones_villes":[{"nom","x1","z1","x2","z2"},...]}.
// Sans ce fichier (monde sans l'ile), rien n'est exclu.
public final class ExclusionsIle {
    // Lus par les tests automatiques
    public static final AtomicInteger CHARGES = new AtomicInteger();
    public static final AtomicInteger REFUS = new AtomicInteger();
    public static final AtomicInteger ERREURS = new AtomicInteger();

    private static final long INTERVALLE_MS = 5000; // on ne regarde pas le fichier plus d'une fois toutes les 5 s
    private static volatile Set<Long> exclus = Set.of();
    // zones ou les villes sont permises, en blocs {x1, z1, x2, z2} avec x2 et z2 exclus ; vide = pas de filtre par zone
    private static volatile int[][] zones = new int[0][];
    public static final AtomicInteger HORS_ZONE = new AtomicInteger();
    private static volatile long dernierControle;
    private static volatile long dateFichier = -1;

    private ExclusionsIle() {
    }

    private static Path fichier() {
        // dossier du jeu ou du serveur = dossier de travail
        return Path.of("config", "atheria_ile", "exclusions.json");
    }

    private static void rafraichir() {
        long maintenant = System.currentTimeMillis();
        if (maintenant - dernierControle < INTERVALLE_MS) return;
        synchronized (ExclusionsIle.class) {
            if (maintenant - dernierControle < INTERVALLE_MS) return;
            dernierControle = maintenant;
            try {
                Path f = fichier();
                if (!Files.isRegularFile(f)) {
                    if (dateFichier != -1) { exclus = Set.of(); zones = new int[0][]; dateFichier = -1; }
                    return;
                }
                long date = Files.getLastModifiedTime(f).toMillis();
                if (date == dateFichier) return;
                JsonObject racine = JsonParser.parseString(Files.readString(f, StandardCharsets.UTF_8)).getAsJsonObject();
                Set<Long> s = new HashSet<>();
                // chunks_exclus : RN1 et lots de surface. Les chunks_volumes (au-dessus des galeries du tram) restent
                // constructibles en surface : les batiments vitrine n'ont pas de cave et le metro Lost Cities est coupe
                // dans le profil (railwaysEnabled false), donc rien ne descend dans le souterrain.
                for (String cle : new String[] { "chunks_exclus" }) {
                    JsonArray chunks = racine.getAsJsonArray(cle);
                    if (chunks == null) continue;
                    for (JsonElement e : chunks) {
                        JsonArray c = e.getAsJsonArray();
                        s.add(ChunkPos.asLong(c.get(0).getAsInt(), c.get(1).getAsInt()));
                    }
                }
                // zones_villes (facultatif) : filtre par region de l'ile, en plus du filtre par biome de Lost Cities.
                // Un meme biome peut exister dans plusieurs regions ; seules les zones listees recoivent des villes.
                java.util.List<int[]> z = new java.util.ArrayList<>();
                JsonArray zv = racine.getAsJsonArray("zones_villes");
                if (zv != null) {
                    for (JsonElement e : zv) {
                        JsonObject o = e.getAsJsonObject();
                        z.add(new int[] { o.get("x1").getAsInt(), o.get("z1").getAsInt(), o.get("x2").getAsInt(), o.get("z2").getAsInt() });
                    }
                }
                zones = z.toArray(new int[0][]);
                exclus = s;
                dateFichier = date;
                CHARGES.set(s.size());
            } catch (Throwable t) {
                // fichier illisible : on garde la liste precedente plutot que de construire sur la route
                ERREURS.incrementAndGet();
            }
        }
    }

    public static boolean estExclu(int chunkX, int chunkZ) {
        rafraichir();
        Set<Long> s = exclus;
        if (!s.isEmpty() && s.contains(ChunkPos.asLong(chunkX, chunkZ))) {
            REFUS.incrementAndGet();
            return true;
        }
        int[][] z = zones;
        if (z.length == 0) return false;
        int bx = chunkX * 16 + 8, bz = chunkZ * 16 + 8; // centre du chunk
        for (int[] b : z) {
            if (bx >= b[0] && bx < b[2] && bz >= b[1] && bz < b[3]) return false;
        }
        HORS_ZONE.incrementAndGet();
        return true;
    }
}
