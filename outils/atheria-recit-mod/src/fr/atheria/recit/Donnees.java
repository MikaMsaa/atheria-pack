package fr.atheria.recit;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.server.packs.resources.ResourceManager;
import net.minecraft.server.packs.resources.SimpleJsonResourceReloadListener;
import net.minecraft.util.profiling.ProfilerFiller;
import net.neoforged.neoforge.event.AddReloadListenerEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// Scenarios lus dans les datapacks (donc aussi pack/kubejs/data) :
//   data/<espace>/atheria_cinematiques/<nom>.json
//   data/<espace>/atheria_dialogues/<nom>.json
// Le nom sert d'identifiant (sans l'espace) ; /reload les relit.
public final class Donnees {
    static final Logger LOG = LoggerFactory.getLogger("Atheria Recit");
    private static final Gson GSON = new Gson();

    public record Cinematique(String json, double duree, String passable, JsonObject def) {
    }

    public static final Map<String, Cinematique> CINEMATIQUES = new ConcurrentHashMap<>();
    public static final Map<String, JsonObject> DIALOGUES = new ConcurrentHashMap<>();

    private Donnees() {
    }

    static String nom(ResourceLocation rl) {
        return rl.getPath().replace('/', '.');
    }

    static void ajouter(AddReloadListenerEvent e) {
        e.addListener(new SimpleJsonResourceReloadListener(GSON, "atheria_cinematiques") {
            @Override
            protected void apply(Map<ResourceLocation, JsonElement> lus, ResourceManager rm, ProfilerFiller pf) {
                CINEMATIQUES.clear();
                lus.forEach((rl, json) -> {
                    try {
                        JsonObject o = json.getAsJsonObject();
                        double duree = o.has("duree") ? o.get("duree").getAsDouble() : 0;
                        if (duree <= 0 && o.has("plans")) {
                            for (JsonElement p : o.getAsJsonArray("plans")) duree += p.getAsJsonObject().get("duree").getAsDouble();
                        }
                        String passable = o.has("passable") ? o.get("passable").getAsString() : "toujours";
                        CINEMATIQUES.put(nom(rl), new Cinematique(GSON.toJson(o), duree, passable, o));
                    } catch (Exception ex) {
                        LOG.error("Cinematique {} illisible : {}", rl, ex.toString());
                    }
                });
                LOG.info("{} cinematique(s) : {}", CINEMATIQUES.size(), CINEMATIQUES.keySet());
            }
        });
        e.addListener(new SimpleJsonResourceReloadListener(GSON, "atheria_dialogues") {
            @Override
            protected void apply(Map<ResourceLocation, JsonElement> lus, ResourceManager rm, ProfilerFiller pf) {
                DIALOGUES.clear();
                lus.forEach((rl, json) -> {
                    try {
                        JsonObject o = json.getAsJsonObject();
                        if (!o.has("noeuds")) throw new IllegalArgumentException("pas de \"noeuds\"");
                        DIALOGUES.put(nom(rl), o);
                    } catch (Exception ex) {
                        LOG.error("Dialogue {} illisible : {}", rl, ex.toString());
                    }
                });
                LOG.info("{} dialogue(s) : {}", DIALOGUES.size(), DIALOGUES.keySet());
            }
        });
    }
}
