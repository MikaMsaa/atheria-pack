package fr.atheria.monde;

import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import mcjty.lostcities.config.LostCityProfile;
import mcjty.lostcities.setup.Registration;
import mcjty.lostcities.varia.ChunkCoord;
import mcjty.lostcities.worldgen.IDimensionInfo;
import mcjty.lostcities.worldgen.lost.City;
import net.minecraft.server.MinecraftServer;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.tags.StructureTags;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.chunk.ChunkGenerator;
import net.minecraft.world.level.levelgen.GenerationStep;
import net.minecraft.world.level.levelgen.structure.Structure;
import net.minecraft.world.level.levelgen.structure.StructureSet;
import net.neoforged.neoforge.server.ServerLifecycleHooks;

// Regles de placement : pas de structure de surface dans une ville, pas de village a moins de 14 chunks d'une ville.
public final class VillesEtStructures {
    private static final float SEUIL_VILLE = 0.2f;
    private static final int RAYON_VILLAGE = 14;
    private static final int PAS_VILLAGE = 4;
    private static final int RAYON_SURFACE = 2;

    // Lus par les tests automatiques
    public static final AtomicInteger VILLAGES_ACCEPTES = new AtomicInteger();
    public static final AtomicInteger VILLAGES_REFUSES = new AtomicInteger();
    public static final AtomicInteger SURFACE_ACCEPTEES = new AtomicInteger();
    public static final AtomicInteger SURFACE_REFUSEES = new AtomicInteger();
    private static final Map<String, AtomicInteger> POSEES = new ConcurrentHashMap<>();
    private static final Set<String> VILLAGES_POSES = ConcurrentHashMap.newKeySet();

    private static volatile MinecraftServer serveurConnu;
    private static volatile IDimensionInfo infoConnue;

    private VillesEtStructures() {
    }

    public static boolean refuser(ChunkGenerator generateur, StructureSet.StructureSelectionEntry entree, ChunkPos pos) {
        try {
            MinecraftServer serveur = ServerLifecycleHooks.getCurrentServer();
            if (serveur == null) return false;
            ServerLevel monde = serveur.overworld();
            // Seul l'Overworld a des villes
            if (monde == null || monde.getChunkSource().getGenerator() != generateur) return false;
            Structure structure = entree.structure().value();
            boolean village = estVillage(entree);
            if (!village && structure.step() != GenerationStep.Decoration.SURFACE_STRUCTURES) return false;
            IDimensionInfo info = infoOverworld(serveur, monde);
            if (info == null) return false;
            LostCityProfile profil = info.getProfile();
            if (village) {
                boolean proche = villeDansRayon(pos, info, profil, RAYON_VILLAGE, PAS_VILLAGE);
                (proche ? VILLAGES_REFUSES : VILLAGES_ACCEPTES).incrementAndGet();
                return proche;
            }
            boolean dansVille = villeDansRayon(pos, info, profil, RAYON_SURFACE, RAYON_SURFACE);
            (dansVille ? SURFACE_REFUSEES : SURFACE_ACCEPTEES).incrementAndGet();
            return dansVille;
        } catch (RuntimeException | LinkageError e) {
            // La generation du monde ne doit jamais casser a cause de ce filtre
            return false;
        }
    }

    // Bilan lu par les tests automatiques : structures reellement posees, par mod et par sorte
    public static void noter(StructureSet.StructureSelectionEntry entree, ChunkPos pos) {
        String id = entree.structure().unwrapKey().map(cle -> cle.location().toString()).orElse("?");
        POSEES.computeIfAbsent(id, k -> new AtomicInteger()).incrementAndGet();
        if (estVillage(entree)) VILLAGES_POSES.add(pos.x + "," + pos.z);
    }

    public static String bilan() {
        return VILLAGES_POSES.size() + " villages " + VILLAGES_POSES + " | " + new TreeMap<>(POSEES);
    }

    private static boolean estVillage(StructureSet.StructureSelectionEntry entree) {
        if (entree.structure().is(StructureTags.VILLAGE)) return true;
        return entree.structure().unwrapKey().map(cle -> cle.location().getPath().contains("village")).orElse(false);
    }

    private static boolean villeDansRayon(ChunkPos pos, IDimensionInfo info, LostCityProfile profil, int rayon, int pas) {
        for (int dx = -rayon; dx <= rayon; dx += pas) {
            for (int dz = -rayon; dz <= rayon; dz += pas) {
                if (dx * dx + dz * dz > rayon * rayon) continue;
                ChunkCoord point = new ChunkCoord(Level.OVERWORLD, pos.x + dx, pos.z + dz);
                if (City.getCityFactor(point, info, profil) > SEUIL_VILLE) return true;
            }
        }
        return false;
    }

    private static IDimensionInfo infoOverworld(MinecraftServer serveur, ServerLevel monde) {
        if (serveur != serveurConnu || infoConnue == null) {
            infoConnue = Registration.LOSTCITY_FEATURE.get().getDimensionInfo(monde);
            serveurConnu = serveur;
        }
        return infoConnue;
    }
}
