package fr.atheria.ile.mixin;

import fr.atheria.ile.PoseVolumes;
import net.minecraft.world.level.WorldGenLevel;
import net.minecraft.world.level.chunk.ChunkAccess;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Pseudo;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

/**
 * Exception a la reserve souterraine pour la finition des batiments vitrine du mod atheria_monde
 * (FinitionVitrines.finir, en fin de decoration du chunk, qui pose via WorldGenRegion.setBlock). Dependance
 * souple : sans atheria_monde, ce mixin est ignore. Actif seulement si atheria_monde:* est dans pose_autorisee.
 */
@Pseudo
@Mixin(targets = "fr.atheria.monde.FinitionVitrines", remap = false)
public abstract class VitrinesVolumesMixin {
    @Inject(method = "finir", at = @At("HEAD"), require = 0)
    private static void atheriaIle$leverReserve(WorldGenLevel niveau, ChunkAccess chunk, CallbackInfo retour) {
        if (PoseVolumes.autoriseNamespace("atheria_monde")) PoseVolumes.entrer();
    }

    @Inject(method = "finir", at = @At("RETURN"), require = 0)
    private static void atheriaIle$retablirReserve(WorldGenLevel niveau, ChunkAccess chunk, CallbackInfo retour) {
        if (PoseVolumes.autoriseNamespace("atheria_monde")) PoseVolumes.sortir();
    }
}
