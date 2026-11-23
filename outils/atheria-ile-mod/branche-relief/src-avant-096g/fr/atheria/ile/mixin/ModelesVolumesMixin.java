package fr.atheria.ile.mixin;

import fr.atheria.ile.CarteIle;
import fr.atheria.ile.PoseVolumes;
import net.minecraft.core.BlockPos;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.util.RandomSource;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.StructureManager;
import net.minecraft.world.level.WorldGenLevel;
import net.minecraft.world.level.chunk.ChunkGenerator;
import net.minecraft.world.level.levelgen.structure.BoundingBox;
import net.minecraft.world.level.levelgen.structure.TemplateStructurePiece;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

/**
 * Exception a la reserve souterraine pour un morceau de structure tire d'un modele (.nbt) dont l'identifiant est
 * dans pose_autorisee, meme si la structure qui l'utilise appartient a un autre mod.
 */
@Mixin(TemplateStructurePiece.class)
public abstract class ModelesVolumesMixin {
    @Shadow protected abstract ResourceLocation makeTemplateLocation();

    private boolean atheriaIle$autorise(ChunkPos pos) {
        CarteIle c = CarteIle.active();
        if (c == null || c.volumes.vide() || !c.volumes.chunkTouche(pos.x, pos.z)) return false;
        return PoseVolumes.autorise(makeTemplateLocation());
    }

    @Inject(method = "postProcess", at = @At("HEAD"))
    private void atheriaIle$leverReserve(WorldGenLevel niveau, StructureManager gestionnaire, ChunkGenerator generateur, RandomSource alea, BoundingBox boite, ChunkPos pos, BlockPos pivot, CallbackInfo retour) {
        if (atheriaIle$autorise(pos)) PoseVolumes.entrer();
    }

    @Inject(method = "postProcess", at = @At("RETURN"))
    private void atheriaIle$retablirReserve(WorldGenLevel niveau, StructureManager gestionnaire, ChunkGenerator generateur, RandomSource alea, BoundingBox boite, ChunkPos pos, BlockPos pivot, CallbackInfo retour) {
        if (atheriaIle$autorise(pos)) PoseVolumes.sortir();
    }
}
