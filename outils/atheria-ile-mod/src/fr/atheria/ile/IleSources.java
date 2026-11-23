package fr.atheria.ile;

import net.minecraft.core.Holder;
import net.minecraft.resources.ResourceKey;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.world.level.biome.Biome;
import net.minecraft.world.level.biome.Climate;
import net.minecraft.world.level.biome.MultiNoiseBiomeSource;

import java.util.Set;

/** Décide si une source de biomes est celle de l'Overworld et construit sa table. */
public final class IleSources {
    public static final Object AUCUNE = new Object();
    public static volatile TableBiomes derniere;

    private IleSources() {}

    public static Object construire(MultiNoiseBiomeSource source, CarteIle carte, Climate.ParameterList<Holder<Biome>> params) {
        Set<Holder<Biome>> possibles = source.possibleBiomes();
        boolean plaines = false, nether = false;
        for (Holder<Biome> h : possibles) {
            ResourceLocation id = h.unwrapKey().map(ResourceKey::location).orElse(null);
            if (id == null) continue;
            if (id.toString().equals("minecraft:plains")) plaines = true;
            if (id.toString().equals("minecraft:nether_wastes")) nether = true;
        }
        if (!plaines || nether) return AUCUNE;
        TableBiomes t = new TableBiomes(carte, possibles, params);
        derniere = t;
        CarteIle.LOG.info("[atheria_ile] biomes de l'ile actifs sur une source de {} biomes ({} avertissements)", possibles.size(), t.avertissements.size());
        return t;
    }
}
