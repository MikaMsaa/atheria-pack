package fr.atheria.ile;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.mojang.datafixers.util.Pair;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Holder;
import net.minecraft.core.HolderSet;
import net.minecraft.core.Registry;
import net.minecraft.core.registries.Registries;
import net.minecraft.resources.ResourceKey;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.server.MinecraftServer;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.tags.TagKey;
import net.minecraft.world.level.chunk.ChunkGenerator;
import net.minecraft.world.level.levelgen.Heightmap;
import net.minecraft.world.level.levelgen.RandomState;
import net.minecraft.world.level.levelgen.structure.Structure;
import net.minecraft.world.level.levelgen.structure.placement.RandomSpreadStructurePlacement;
import net.minecraft.world.level.levelgen.structure.placement.StructurePlacement;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Recensement des structures (equivalent de /locate structure) depuis le centre de chaque region,
 * hors du thread principal, sans generer de chunk. Config : "recensement": {"rayon_blocs": 3000, "structures": ["id", "#tag", ...]}.
 */
final class Recensement {
    private Recensement() {}

    static boolean demande(CarteIle c) {
        return c.config.has("recensement") && c.config.get("recensement").isJsonObject();
    }

    static void executer(MinecraftServer server, CarteIle c) {
        long debut = System.currentTimeMillis();
        JsonObject cfg = c.config.getAsJsonObject("recensement");
        int rayon = cfg.has("rayon_blocs") ? cfg.get("rayon_blocs").getAsInt() : 3000;
        ServerLevel niveau = server.overworld();
        ChunkGenerator gen = niveau.getChunkSource().getGenerator();
        RandomState rs = niveau.getChunkSource().randomState();
        Registry<Structure> reg = niveau.registryAccess().registryOrThrow(Registries.STRUCTURE);

        // tags de biome utilises par le mod : vides ou non, dans le registre et dans la source de l'Overworld
        Registry<net.minecraft.world.level.biome.Biome> rb = niveau.registryAccess().registryOrThrow(Registries.BIOME);
        java.util.Set<Holder<net.minecraft.world.level.biome.Biome>> possibles = gen.getBiomeSource().possibleBiomes();
        StringBuilder tg = new StringBuilder("TAGS DE BIOME UTILISES PAR atheria_ile (registre / source de l'Overworld)\n");
        String[] tags = {"c:is_snowy", "c:is_underground", "c:is_cave", "minecraft:is_ocean", "minecraft:is_deep_ocean", "minecraft:is_river", "minecraft:is_beach", "minecraft:is_mountain"};
        if (cfg.has("tags_biomes")) { List<String> l = new ArrayList<>(); for (JsonElement e : cfg.getAsJsonArray("tags_biomes")) l.add(e.getAsString()); tags = l.toArray(new String[0]); }
        for (String t : tags) {
            var opt = rb.getTag(TagKey.create(Registries.BIOME, ResourceLocation.parse(t)));
            int n = 0, ns = 0; StringBuilder m = new StringBuilder();
            if (opt.isPresent()) for (var h : opt.get()) { n++; if (possibles.contains(h)) { ns++; m.append(' ').append(h.unwrapKey().map(k -> k.location().toString()).orElse("?")); } }
            tg.append(String.format("#%s : %s, %d biomes, dont %d dans la source :%s%n", t, opt.isPresent() ? "present" : "ABSENT", n, ns, m));
        }
        Tests.ecrireRapport(c, "rapport-tags.txt", tg.toString());
        CarteIle.LOG.info("[atheria_ile] tags de biome verifies : rapport-tags.txt");

        // cibles : chaque id, et chaque tag developpe en ses membres (le tag garde le nom du groupe)
        Map<String, List<Holder<Structure>>> groupes = new LinkedHashMap<>();
        StringBuilder sb = new StringBuilder("RECENSEMENT DES STRUCTURES (rayon de recherche " + rayon + " blocs, Y = surface du terrain au point trouve)\n");
        if (cfg.has("structures")) for (JsonElement e : cfg.getAsJsonArray("structures")) {
            String s = e.getAsString();
            List<Holder<Structure>> l = new ArrayList<>();
            if (s.startsWith("#")) {
                ResourceLocation rl = ResourceLocation.tryParse(s.substring(1));
                reg.getTag(TagKey.create(Registries.STRUCTURE, rl)).ifPresent(t -> { for (Holder<Structure> h : t) l.add(h); });
            } else {
                ResourceLocation rl = ResourceLocation.tryParse(s);
                reg.getHolder(ResourceKey.create(Registries.STRUCTURE, rl)).ifPresent(l::add);
            }
            if (l.isEmpty()) sb.append("ABSENT DU REGISTRE (mod absent ou id faux) : ").append(s).append('\n');
            else groupes.put(s, l);
        }
        int[][] centres = c.centresRegions();
        List<int[]> points = new ArrayList<>();
        List<String> noms = new ArrayList<>();
        for (int r = 0; r < centres.length; r++) if (centres[r] != null) { points.add(centres[r]); noms.add(c.regions.get(r).nom); }
        sb.append("points de depart (centre de chaque region) :\n");
        for (int i = 0; i < points.size(); i++) sb.append(String.format("   P%d %s : %d, %d%n", i + 1, noms.get(i), points.get(i)[0], points.get(i)[1]));

        Map<String, String> resume = new LinkedHashMap<>();
        Set<String> deja = new LinkedHashSet<>();
        for (var g : groupes.entrySet()) {
            for (Holder<Structure> h : g.getValue()) {
                String id = h.unwrapKey().map(k -> k.location().toString()).orElse("?");
                if (!deja.add(id)) continue;
                if (!server.isRunning()) return;
                int espacement = 1;
                for (StructurePlacement p : niveau.getChunkSource().getGeneratorState().getPlacementsForStructure(h))
                    if (p instanceof RandomSpreadStructurePlacement rsp) espacement = Math.max(espacement, rsp.spacing());
                int rr = Math.max(2, (int) Math.ceil(rayon / (16.0 * espacement)) + 1);
                sb.append(id).append(" (espacement ").append(espacement).append(" chunks) :\n");
                Set<String> trouves = new LinkedHashSet<>();
                int proches = 0, hauts = 0;
                for (int i = 0; i < points.size(); i++) {
                    int[] p = points.get(i);
                    Pair<BlockPos, Holder<Structure>> res;
                    try {
                        res = gen.findNearestMapStructure(niveau, HolderSet.direct(h), new BlockPos(p[0], 64, p[1]), rr, false);
                    } catch (Throwable t) {
                        sb.append("   P").append(i + 1).append(" : ERREUR ").append(t).append('\n');
                        continue;
                    }
                    if (res == null) { sb.append("   P").append(i + 1).append(" : rien\n"); continue; }
                    BlockPos b = res.getFirst();
                    int d = (int) Math.round(Math.hypot(b.getX() - p[0], b.getZ() - p[1]));
                    String cle = b.getX() + "," + b.getZ();
                    if (d <= rayon) proches++;
                    if (trouves.add(cle)) {
                        int y = gen.getBaseHeight(b.getX(), b.getZ(), Heightmap.Types.WORLD_SURFACE_WG, niveau, rs);
                        if (y >= 120) hauts++;
                        String rg = c.distanceBlocs(b.getX(), b.getZ()) < 0 ? "en mer" : c.regions.get(c.region(b.getX(), b.getZ())).nom;
                        sb.append(String.format("   P%d : %d blocs -> %d, %d  Y %d  %s%n", i + 1, d, b.getX(), b.getZ(), y, rg));
                    } else sb.append(String.format("   P%d : %d blocs -> %s (meme que plus haut)%n", i + 1, d, cle));
                }
                String r = proches == 0 ? "INTROUVABLE a moins de " + rayon + " blocs de tous les points"
                        : proches + "/" + points.size() + " points a moins de " + rayon + " blocs, " + trouves.size() + " exemplaires distincts, " + hauts + " a Y >= 120";
                sb.append("   => ").append(r).append('\n');
                resume.put(g.getKey() + "  " + id, r);
                CarteIle.LOG.info("[atheria_ile] recensement {} : {}", id, r);
            }
        }
        sb.append("\nRESUME\n");
        resume.forEach((k, v) -> sb.append(k).append(" : ").append(v).append('\n'));
        sb.append(String.format("duree %.0f s%n", (System.currentTimeMillis() - debut) / 1000.0));
        Tests.ecrireRapport(c, "rapport-recensement.txt", sb.toString());
    }
}
