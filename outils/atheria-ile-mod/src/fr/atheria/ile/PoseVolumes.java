package fr.atheria.ile;

import net.minecraft.resources.ResourceLocation;

/**
 * Levee de la protection des volumes souterrains, par fil d'execution. Un compteur (et non un booleen) pour les
 * appels imbriques : une structure atheria_monde qui pose une feature, une feature qui en pose une autre...
 * Le compteur n'est lu que pour un bloc deja reconnu dans un volume reserve : le chemin chaud (hors volumes)
 * ne touche jamais au ThreadLocal. Un seul int[] par fil, cree une fois : aucune allocation ensuite.
 */
public final class PoseVolumes {
    private PoseVolumes() {}

    private static final ThreadLocal<int[]> PROFONDEUR = ThreadLocal.withInitial(() -> new int[1]);

    /** vrai si la protection est levee sur ce fil (pose autorisee en cours) */
    public static boolean levee() { return PROFONDEUR.get()[0] > 0; }

    public static void entrer() { PROFONDEUR.get()[0]++; }

    public static void sortir() { int[] p = PROFONDEUR.get(); if (p[0] > 0) p[0]--; }

    /** vrai si l'identifiant (structure, feature, modele) a le droit de poser dans les volumes */
    public static boolean autorise(ResourceLocation id) {
        CarteIle c = CarteIle.active();
        return id != null && c != null && c.volumes.autorise(id.getNamespace(), id.getPath());
    }

    /** vrai si un namespace entier est autorise (motif "namespace:*") */
    public static boolean autoriseNamespace(String ns) {
        CarteIle c = CarteIle.active();
        return c != null && c.volumes.autoriseNamespace(ns);
    }
}
