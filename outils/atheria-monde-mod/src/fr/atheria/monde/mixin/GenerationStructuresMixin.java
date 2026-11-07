package fr.atheria.monde.mixin;

import fr.atheria.monde.VillesEtStructures;
import net.minecraft.core.RegistryAccess;
import net.minecraft.core.SectionPos;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.StructureManager;
import net.minecraft.world.level.chunk.ChunkAccess;
import net.minecraft.world.level.chunk.ChunkGenerator;
import net.minecraft.world.level.levelgen.RandomState;
import net.minecraft.world.level.levelgen.structure.StructureSet;
import net.minecraft.world.level.levelgen.structure.templatesystem.StructureTemplateManager;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

// Refuse une structure a l'endroit ou la generation allait la placer si elle tombe dans une ville, ou un village pres d'une ville.
@Mixin(ChunkGenerator.class)
public abstract class GenerationStructuresMixin {
    @Inject(method = "tryGenerateStructure", at = @At("HEAD"), cancellable = true)
    private void atheria$eviterVilles(StructureSet.StructureSelectionEntry entree, StructureManager gestionnaire, RegistryAccess registres, RandomState aleatoire, StructureTemplateManager modeles, long graine, ChunkAccess chunk, ChunkPos pos, SectionPos section, CallbackInfoReturnable<Boolean> retour) {
        if (VillesEtStructures.refuser((ChunkGenerator) (Object) this, entree, pos)) retour.setReturnValue(false);
    }

    @Inject(method = "tryGenerateStructure", at = @At("RETURN"))
    private void atheria$noter(StructureSet.StructureSelectionEntry entree, StructureManager gestionnaire, RegistryAccess registres, RandomState aleatoire, StructureTemplateManager modeles, long graine, ChunkAccess chunk, ChunkPos pos, SectionPos section, CallbackInfoReturnable<Boolean> retour) {
        if (retour.getReturnValue()) VillesEtStructures.noter(entree, pos);
    }
}
