package fr.atheria.ile;

import net.minecraft.core.Holder;
import net.minecraft.resources.ResourceKey;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.tags.BiomeTags;
import net.minecraft.world.level.biome.Biome;
import net.minecraft.world.level.biome.Climate;
import net.neoforged.neoforge.common.Tags;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** Biomes de chaque région, résolus contre les biomes réellement possibles de la source d'origine. */
public final class TableBiomes {

    static final class RegionBiomes {
        Holder<Biome>[] biomes;
        int[] cumul;
        int total;
        Holder<Biome> montagne;
        int cellule;
        /** au moins un biome enneigé : les plages enneigées y sont permises */
        boolean froide;
    }

    final CarteIle carte;
    final RegionBiomes[] regions;
    final Set<Holder<Biome>> sousTerrainSeulement;
    /** plage normale qui remplace la plage enneigée hors des régions froides (null si absente) */
    final Holder<Biome> plage;
    public final List<String> avertissements = new ArrayList<>();

    @SuppressWarnings("unchecked")
    TableBiomes(CarteIle carte, Set<Holder<Biome>> possibles, Climate.ParameterList<Holder<Biome>> parametres) {
        this.carte = carte;
        Map<ResourceLocation, Holder<Biome>> parId = new HashMap<>();
        for (Holder<Biome> h : possibles) {
            h.unwrapKey().map(ResourceKey::location).ifPresent(id -> parId.put(id, h));
        }
        regions = new RegionBiomes[carte.regions.size()];
        for (int r = 0; r < regions.length; r++) {
            CarteIle.Region def = carte.regions.get(r);
            RegionBiomes rb = new RegionBiomes();
            List<Holder<Biome>> liste = new ArrayList<>();
            List<Integer> poids = new ArrayList<>();
            for (int i = 0; i < def.biomes.size(); i++) {
                Holder<Biome> h = trouver(parId, def.biomes.get(i), def.nom);
                if (h != null) { liste.add(h); poids.add(def.poids.get(i)); }
            }
            rb.biomes = liste.toArray(new Holder[0]);
            rb.cumul = new int[poids.size()];
            int t = 0;
            for (int i = 0; i < poids.size(); i++) { t += poids.get(i); rb.cumul[i] = t; }
            rb.total = t;
            rb.montagne = def.montagne == null ? null : trouver(parId, def.montagne, def.nom);
            rb.cellule = def.cellule;
            for (Holder<Biome> h : rb.biomes) if (h.is(Tags.Biomes.IS_SNOWY)) rb.froide = true;
            if (rb.montagne != null && rb.montagne.is(Tags.Biomes.IS_SNOWY)) rb.froide = true;
            if (rb.biomes.length == 0) avertissements.add("region '" + def.nom + "' : aucun biome valide, la generation d'origine est gardee");
            regions[r] = rb;
        }
        // biomes qui n'existent que sous terre dans la table de climat (grottes)
        Set<Holder<Biome>> enSurface = new HashSet<>(), dessous = new HashSet<>();
        if (parametres != null) {
            for (var p : parametres.values()) {
                Climate.Parameter prof = p.getFirst().depth();
                if (prof.min() > 0 && prof.max() < Climate.quantizeCoord(1.0F)) dessous.add(p.getSecond());
                else enSurface.add(p.getSecond());
            }
        }
        dessous.removeAll(enSurface);
        sousTerrainSeulement = dessous;
        plage = parId.get(ResourceLocation.withDefaultNamespace("beach"));
        for (String a : avertissements) CarteIle.LOG.warn("[atheria_ile] {}", a);
    }

    private Holder<Biome> trouver(Map<ResourceLocation, Holder<Biome>> parId, String id, String region) {
        ResourceLocation rl = ResourceLocation.tryParse(id);
        Holder<Biome> h = rl == null ? null : parId.get(rl);
        if (h == null) avertissements.add("region '" + region + "' : biome '" + id + "' absent du monde, ignore");
        return h;
    }

    /** Garde le biome d'origine pour l'eau, les plages, les rivières et les grottes. */
    boolean garder(Holder<Biome> base) {
        return base.is(BiomeTags.IS_OCEAN) || base.is(BiomeTags.IS_DEEP_OCEAN) || base.is(BiomeTags.IS_RIVER)
                || base.is(BiomeTags.IS_BEACH) || base.is(Tags.Biomes.IS_UNDERGROUND) || base.is(Tags.Biomes.IS_CAVE)
                || sousTerrainSeulement.contains(base);
    }

    public Holder<Biome> choisir(Holder<Biome> base, int bx, int bz) {
        if (garder(base)) {
            // pas de plage enneigée sur une côte tropicale
            if (plage != null && base.is(BiomeTags.IS_BEACH) && base.is(Tags.Biomes.IS_SNOWY)
                    && !regions[carte.region(bx, bz)].froide) return plage;
            return base;
        }
        int r = carte.region(bx, bz);
        RegionBiomes rb = regions[r];
        if (rb.biomes.length == 0) return base;
        if (rb.montagne != null && base.is(BiomeTags.IS_MOUNTAIN)) return rb.montagne;
        if (rb.biomes.length == 1) return rb.biomes[0];
        int t = (int) (carte.tirageCellule(bx, bz, rb.cellule, r) * rb.total);
        for (int i = 0; i < rb.cumul.length; i++) if (t < rb.cumul[i]) return rb.biomes[i];
        return rb.biomes[rb.biomes.length - 1];
    }

    /** Pour le rapport : la région accepte-t-elle ce biome ? */
    public boolean attendu(int region, Holder<Biome> b) {
        RegionBiomes rb = regions[region];
        if (b.equals(rb.montagne)) return true;
        if (b.equals(plage)) return true;
        for (Holder<Biome> h : rb.biomes) if (h.equals(b)) return true;
        return false;
    }
}
