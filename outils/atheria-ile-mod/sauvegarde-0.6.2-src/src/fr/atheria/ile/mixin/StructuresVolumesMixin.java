package fr.atheria.ile.mixin;

import fr.atheria.ile.CarteIle;
import fr.atheria.ile.PoseVolumes;
import net.minecraft.core.registries.Registries;
import net.minecraft.util.RandomSource;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.StructureManager;
import net.minecraft.world.level.WorldGenLevel;
import net.minecraft.world.level.chunk.ChunkGenerator;
import net.minecraft.world.level.levelgen.structure.BoundingBox;
import net.minecraft.world.level.levelgen.structure.StructureStart;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

/**
 * Exception a la reserve souterraine : une structure dont l'identifiant est dans pose_autorisee (par defaut
 * atheria_monde:* et atheria:*) pose ses morceaux dans les volumes. Le test est refait a la sortie (il est
 * deterministe) : aucun etat partage entre fils, une meme structure etant posee dans plusieurs chunks a la fois.
 */
@Mixin(StructureStart.class)
public abstract class StructuresVolumesMixin {
    private static boolean atheriaIle$autorisee(StructureStart s, WorldGenLevel niveau, ChunkPos pos) {
        CarteIle c = CarteIle.active();
        if (c == null || c.volumes.vide() || !c.volumes.chunkTouche(pos.x, pos.z)) return false;
        return PoseVolumes.autorise(niveau.registryAccess().registryOrThrow(Registries.STRUCTURE).getKey(s.getStructure()));
    }

    @Inject(method = "placeInChunk", at = @At("HEAD"))
    private void atheriaIle$leverReserve(WorldGenLevel niveau, StructureManager gestionnaire, ChunkGenerator generateur, RandomSource alea, BoundingBox boite, ChunkPos pos, CallbackInfo retour) {
        if (atheriaIle$autorisee((StructureStart) (Object) this, niveau, pos)) PoseVolumes.entrer();
    }

    @Inject(method = "placeInChunk", at = @At("RETURN"))
    private void atheriaIle$retablirReserve(WorldGenLevel niveau, StructureManager gestionnaire, ChunkGenerator generateur, RandomSource alea, BoundingBox boite, ChunkPos pos, CallbackInfo retour) {
        if (atheriaIle$autorisee((StructureStart) (Object) this, niveau, pos)) PoseVolumes.sortir();
    }
}
