package fr.atheria.bestiaire;

import it.unimi.dsi.fastutil.longs.Long2ObjectLinkedOpenHashMap;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import java.util.function.Supplier;
import net.minecraft.resources.ResourceKey;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.Level;
import net.neoforged.fml.InterModComms;
import net.neoforged.fml.ModList;
import net.neoforged.fml.event.lifecycle.InterModEnqueueEvent;

// Ce que Lost Cities a genere a un endroit : un chunk de ville ou non, son style (ath_garnison...)
// et le batiment qui s'y trouve (ath_v_hp_hopital...). Lien par reflexion : sans Lost Cities, aucune ville.
// Le resultat ne depend que du chunk : il est garde en cache (4096 chunks par dimension).
final class Lieux {
    record Ville(boolean ville, String style, String batiment) {
    }

    static final Ville AUCUNE = new Ville(false, "", "");

    private static volatile Object api;
    private static boolean casse;
    private static Method mInfo, mChunk, mVille, mStyle, mBatiment, mNom;
    private static final Map<ResourceKey<Level>, Long2ObjectLinkedOpenHashMap<Ville>> CACHE = new HashMap<>();

    private Lieux() {
    }

    static void imc(InterModEnqueueEvent e) {
        if (!ModList.get().isLoaded("lostcities")) return;
        Supplier<Function<Object, Void>> s = () -> o -> {
            api = o;
            return null;
        };
        InterModComms.sendTo("lostcities", "getLostCities", s);
    }

    static void vider() {
        CACHE.clear();
    }

    static Ville ville(ServerLevel level, int cx, int cz) {
        Object a = api;
        if (a == null || casse) return AUCUNE;
        Long2ObjectLinkedOpenHashMap<Ville> cache = CACHE.computeIfAbsent(level.dimension(), k -> new Long2ObjectLinkedOpenHashMap<>());
        long cle = ChunkPos.asLong(cx, cz);
        Ville v = cache.getAndMoveToFirst(cle);
        if (v != null) return v;
        v = lire(a, level, cx, cz);
        cache.putAndMoveToFirst(cle, v);
        if (cache.size() > 4096) cache.removeLast();
        return v;
    }

    private static Ville lire(Object a, ServerLevel level, int cx, int cz) {
        try {
            if (mInfo == null) {
                ClassLoader cl = a.getClass().getClassLoader();
                mInfo = Class.forName("mcjty.lostcities.api.ILostCities", false, cl).getMethod("getLostInfo", Level.class);
                mChunk = Class.forName("mcjty.lostcities.api.ILostCityInformation", false, cl).getMethod("getChunkInfo", int.class, int.class);
                Class<?> chunk = Class.forName("mcjty.lostcities.api.ILostChunkInfo", false, cl);
                mVille = chunk.getMethod("isCity");
                mStyle = chunk.getMethod("getCityStyle");
                mBatiment = chunk.getMethod("getBuildingId");
                mNom = Class.forName("mcjty.lostcities.api.ILostCityAsset", false, cl).getMethod("getName");
            }
            Object info = mInfo.invoke(a, level);
            if (info == null) return AUCUNE;
            Object c = mChunk.invoke(info, cx, cz);
            if (c == null || !(Boolean) mVille.invoke(c)) return AUCUNE;
            Object style = mStyle.invoke(c);
            Object bat = mBatiment.invoke(c);
            String nomStyle = style == null ? "" : String.valueOf(mNom.invoke(style));
            String nomBat = bat == null ? "" : bat.toString();
            int i = nomBat.indexOf(':');
            if (i >= 0) nomBat = nomBat.substring(i + 1);
            return new Ville(true, nomStyle, nomBat);
        } catch (Throwable t) {
            casse = true;
            AtheriaBestiaire.LOG.warn("Lost Cities illisible, les familles des villes sont coupees : {}", t.toString());
            return AUCUNE;
        }
    }
}
