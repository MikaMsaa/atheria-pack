package fr.atheria.monde.mixin;

import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Overwrite;

// First Aid declare le son d'application en boucle : il se repetait tant que le client croyait l'objet en cours d'utilisation.
@Mixin(targets = "ichttt.mods.firstaid.client.HealingSoundController$ItemUseSound", remap = false)
public abstract class SonSoinMixin {
    /**
     * @author Atheria
     * @reason un soin ne joue son bruitage qu'une fois
     */
    @Overwrite
    public boolean isLooping() {
        return false;
    }
}