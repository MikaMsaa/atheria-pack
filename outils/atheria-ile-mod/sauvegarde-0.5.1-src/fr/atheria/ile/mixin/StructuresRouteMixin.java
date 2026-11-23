package fr.atheria.ile.mixin;

import fr.atheria.ile.CarteIle;
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

/** Aucune structure ne demarre sur un chunk exclu : couloir d'une route (marge_structures_blocs depuis l'axe) ou lot fixe et sa marge. */
@Mixin(ChunkGenerator.class)
public abstract class StructuresRouteMixin {
    @Inject(method = "tryGenerateStructure", at = @At("HEAD"), cancellable = true)
    private void atheriaIle$pasSurLaRoute(StructureSet.StructureSelectionEntry entree, StructureManager gestionnaire, RegistryAccess registres, RandomState aleatoire,
                                          StructureTemplateManager modeles, long graine, ChunkAccess chunk, ChunkPos pos, SectionPos section,
                                          CallbackInfoReturnable<Boolean> retour) {
        CarteIle c = CarteIle.active();
        if (c != null && c.chunkExclu(pos.x, pos.z)) retour.setReturnValue(false);
    }
}
