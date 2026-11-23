package fr.atheria.monde;

import mcjty.lostcities.varia.ChunkCoord;

import java.util.Map;

// Cache du FacteurVilleMixin : la carte des villes predefinies vue et ses centres tries, dans un seul objet immuable
// (un autre thread de generation ne voit jamais l'un sans l'autre). Hors du paquet mixin, que Mixin interdit de charger.
public record CentresVilles(Map<ChunkCoord, ?> carte, ChunkCoord[] centres) {
    public static final CentresVilles VIDE = new CentresVilles(null, new ChunkCoord[0]);
}
