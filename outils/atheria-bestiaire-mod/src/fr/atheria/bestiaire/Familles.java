package fr.atheria.bestiaire;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Holder;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.core.registries.Registries;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.server.packs.resources.ResourceManager;
import net.minecraft.server.packs.resources.SimpleJsonResourceReloadListener;
import net.minecraft.tags.TagKey;
import net.minecraft.util.profiling.ProfilerFiller;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.MobCategory;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.biome.Biome;
import net.minecraft.world.level.biome.MobSpawnSettings;
import net.minecraft.world.level.levelgen.structure.Structure;
import net.neoforged.neoforge.common.NeoForge;
import net.neoforged.neoforge.event.AddReloadListenerEvent;
import net.neoforged.neoforge.event.level.LevelEvent;
import net.neoforged.neoforge.event.server.ServerStoppedEvent;

// Apparitions par famille : data/<espace>/atheria_familles/<famille>.json
//   { "nom": "Les Sirènes",
//     "ou": [ { "ville": true, "styles": ["ath_garnison"], "batiments": "hopital|clinique",
//               "biomes": ["#minecraft:is_ocean", "atheria:plaine_cendres"], "structures": ["#atheria:bunkers", "spore:lab"],
//               "couvert": true } ],
//     "apparitions": [ { "entite": "spore:howler", "poids": 15, "min": 1, "max": 1 } ],
//     "froid": false }
// Une zone de "ou" correspond quand TOUS ses criteres sont vrais ; la famille apparait si UNE zone correspond.
// Les apparitions s'ajoutent a la liste normale du lieu (elles ne la remplacent pas), dans la categorie de l'entite
// (les infectes de Spore gardent donc leur propre plafond et leurs regles : nuit, lumiere, sol).
// Le froid protege : sauf "froid": true, rien n'est ajoute dans les biomes #c:is_cold ni le deep dark.
final class Familles {
    private static final Gson GSON = new Gson();
    private static final TagKey<Biome> FROID = TagKey.create(Registries.BIOME, ResourceLocation.fromNamespaceAndPath("c", "is_cold"));
    private static final ResourceLocation DEEP_DARK = ResourceLocation.withDefaultNamespace("deep_dark");

    record Zone(Boolean ville, Set<String> styles, Pattern batiments, List<TagKey<Biome>> biomeTags, Set<ResourceLocation> biomes,
                List<TagKey<Structure>> structureTags, List<ResourceLocation> structures, Boolean couvert) {
    }

    record Famille(String id, String nom, List<Zone> zones, List<MobSpawnSettings.SpawnerData> apparitions, Set<MobCategory> categories,
                   boolean froid) {
    }

    static volatile List<Famille> FAMILLES = List.of();

    private Familles() {
    }

    static void brancher() {
        NeoForge.EVENT_BUS.addListener(Familles::apparitions);
        NeoForge.EVENT_BUS.addListener((ServerStoppedEvent e) -> Lieux.vider());
    }

    static void ajouter(AddReloadListenerEvent e) {
        e.addListener(new SimpleJsonResourceReloadListener(GSON, "atheria_familles") {
            @Override
            protected void apply(Map<ResourceLocation, JsonElement> lus, ResourceManager rm, ProfilerFiller pf) {
                List<Famille> liste = new ArrayList<>();
                lus.forEach((rl, json) -> {
                    try {
                        Famille f = lire(rl.getPath(), json.getAsJsonObject());
                        if (f != null) liste.add(f);
                    } catch (Exception ex) {
                        AtheriaBestiaire.LOG.error("Famille {} illisible : {}", rl, ex.toString());
                    }
                });
                FAMILLES = List.copyOf(liste);
                Lieux.vider();
                AtheriaBestiaire.LOG.info("{} famille(s) d'infectes : {}", liste.size(), liste.stream().map(Famille::id).toList());
            }
        });
        e.addListener(Uniques.chargeur());
    }

    private static Famille lire(String id, JsonObject o) {
        String nom = o.has("nom") ? o.get("nom").getAsString() : id;
        List<MobSpawnSettings.SpawnerData> app = new ArrayList<>();
        Set<MobCategory> cats = new HashSet<>();
        for (JsonElement el : o.getAsJsonArray("apparitions")) {
            JsonObject a = el.getAsJsonObject();
            ResourceLocation rl = ResourceLocation.parse(a.get("entite").getAsString());
            EntityType<?> t = BuiltInRegistries.ENTITY_TYPE.getOptional(rl).orElse(null);
            if (t == null) {
                AtheriaBestiaire.LOG.warn("Famille {} : entite inconnue {} (ignoree)", id, rl);
                continue;
            }
            if (t.getCategory() == MobCategory.MISC) {
                AtheriaBestiaire.LOG.warn("Famille {} : {} n'est pas une creature qui apparait seule (ignoree)", id, rl);
                continue;
            }
            int poids = Math.max(1, a.has("poids") ? a.get("poids").getAsInt() : 10);
            int min = Math.max(1, a.has("min") ? a.get("min").getAsInt() : 1);
            int max = Math.max(min, a.has("max") ? a.get("max").getAsInt() : min);
            app.add(new MobSpawnSettings.SpawnerData(t, poids, min, max));
            cats.add(t.getCategory());
        }
        if (app.isEmpty()) {
            AtheriaBestiaire.LOG.warn("Famille {} : aucune apparition valable", id);
            return null;
        }
        List<Zone> zones = new ArrayList<>();
        JsonArray ou = o.getAsJsonArray("ou");
        if (ou != null) for (JsonElement el : ou) zones.add(zone(el.getAsJsonObject()));
        if (zones.isEmpty()) {
            AtheriaBestiaire.LOG.warn("Famille {} : pas de zone \"ou\", elle n'apparaitra nulle part", id);
            return null;
        }
        boolean froid = o.has("froid") && o.get("froid").getAsBoolean();
        return new Famille(id, nom, List.copyOf(zones), List.copyOf(app), Set.copyOf(cats), froid);
    }

    private static Zone zone(JsonObject z) {
        Boolean ville = z.has("ville") ? z.get("ville").getAsBoolean() : null;
        Set<String> styles = new HashSet<>();
        if (z.has("styles")) for (JsonElement s : z.getAsJsonArray("styles")) styles.add(s.getAsString());
        Pattern bat = z.has("batiments") ? Pattern.compile(z.get("batiments").getAsString()) : null;
        List<TagKey<Biome>> bTags = new ArrayList<>();
        Set<ResourceLocation> bIds = new HashSet<>();
        if (z.has("biomes")) for (JsonElement s : z.getAsJsonArray("biomes")) {
            String v = s.getAsString();
            if (v.startsWith("#")) bTags.add(TagKey.create(Registries.BIOME, ResourceLocation.parse(v.substring(1))));
            else bIds.add(ResourceLocation.parse(v));
        }
        List<TagKey<Structure>> sTags = new ArrayList<>();
        List<ResourceLocation> sIds = new ArrayList<>();
        if (z.has("structures")) for (JsonElement s : z.getAsJsonArray("structures")) {
            String v = s.getAsString();
            if (v.startsWith("#")) sTags.add(TagKey.create(Registries.STRUCTURE, ResourceLocation.parse(v.substring(1))));
            else sIds.add(ResourceLocation.parse(v));
        }
        Boolean couvert = z.has("couvert") ? z.get("couvert").getAsBoolean() : null;
        return new Zone(ville, Set.copyOf(styles), bat, List.copyOf(bTags), Set.copyOf(bIds), List.copyOf(sTags), List.copyOf(sIds), couvert);
    }

    // Appele par le spawner naturel pour chaque essai d'apparition ; il rappelle la meme position pour verifier :
    // la reponse ne depend que de la position (pas de hasard ici), sinon les apparitions seraient refusees.
    private static void apparitions(LevelEvent.PotentialSpawns e) {
        List<Famille> familles = FAMILLES;
        if (familles.isEmpty() || !(e.getLevel() instanceof ServerLevel level) || level.dimension() != Level.OVERWORLD) return;
        MobCategory cat = e.getMobCategory();
        BlockPos pos = e.getPos();
        Contexte c = null;
        for (Famille f : familles) {
            if (!f.categories().contains(cat)) continue;
            if (c == null) c = new Contexte(level, pos);
            if (!f.froid() && c.froid()) continue;
            boolean ok = false;
            for (Zone z : f.zones()) if (c.correspond(z)) {
                ok = true;
                break;
            }
            if (!ok) continue;
            for (MobSpawnSettings.SpawnerData d : f.apparitions()) if (d.type.getCategory() == cat) e.addSpawnerData(d);
        }
    }

    // Ce qu'on sait d'une position, calcule seulement si une zone le demande.
    private static final class Contexte {
        final ServerLevel level;
        final BlockPos pos;
        Holder<Biome> biome;
        Lieux.Ville ville;
        Boolean couvert;

        Contexte(ServerLevel level, BlockPos pos) {
            this.level = level;
            this.pos = pos;
        }

        Holder<Biome> biome() {
            if (biome == null) biome = level.getBiome(pos);
            return biome;
        }

        boolean froid() {
            Holder<Biome> b = biome();
            return b.is(FROID) || b.is(DEEP_DARK);
        }

        Lieux.Ville ville() {
            if (ville == null) ville = Lieux.ville(level, pos.getX() >> 4, pos.getZ() >> 4);
            return ville;
        }

        boolean correspond(Zone z) {
            if (z.ville() != null && ville().ville() != z.ville()) return false;
            if (!z.styles().isEmpty() && !z.styles().contains(ville().style())) return false;
            if (z.batiments() != null && !z.batiments().matcher(ville().batiment()).find()) return false;
            if (!z.biomeTags().isEmpty() || !z.biomes().isEmpty()) {
                Holder<Biome> b = biome();
                boolean ok = false;
                for (TagKey<Biome> t : z.biomeTags()) if (b.is(t)) {
                    ok = true;
                    break;
                }
                if (!ok) ok = b.unwrapKey().map(k -> z.biomes().contains(k.location())).orElse(false);
                if (!ok) return false;
            }
            if (!z.structureTags().isEmpty() || !z.structures().isEmpty()) {
                boolean ok = false;
                for (TagKey<Structure> t : z.structureTags()) if (level.structureManager().getStructureWithPieceAt(pos, t).isValid()) {
                    ok = true;
                    break;
                }
                if (!ok) {
                    var reg = level.registryAccess().registryOrThrow(Registries.STRUCTURE);
                    for (ResourceLocation id : z.structures()) {
                        Structure s = reg.get(id);
                        if (s != null && level.structureManager().getStructureWithPieceAt(pos, s).isValid()) {
                            ok = true;
                            break;
                        }
                    }
                }
                if (!ok) return false;
            }
            if (z.couvert() != null) {
                if (couvert == null) couvert = !level.canSeeSky(pos);
                if (couvert != z.couvert()) return false;
            }
            return true;
        }
    }
}
