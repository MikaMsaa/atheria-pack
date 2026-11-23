package fr.atheria.ile.mixin;

import fr.atheria.ile.CarteIle;
import fr.atheria.ile.Route;
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

/** Aucune structure ne demarre sur le couloir d'une route dessinee (chaussee + marge_structures_blocs). */
@Mixin(ChunkGenerator.class)
public abstract class StructuresRouteMixin {
    @Inject(method = "tryGenerateStructure", at = @At("HEAD"), cancellable = true)
    private void atheriaIle$pasSurLaRoute(StructureSet.StructureSelectionEntry entree, StructureManager gestionnaire, RegistryAccess registres, RandomState aleatoire,
                                          StructureTemplateManager modeles, long graine, ChunkAccess chunk, ChunkPos pos, SectionPos section,
                                          CallbackInfoReturnable<Boolean> retour) {
        CarteIle c = CarteIle.active();
        if (c == null || c.routes.isEmpty()) return;
        int bx = pos.getMiddleBlockX(), bz = pos.getMiddleBlockZ();
        for (Route r : c.routes) if (r.pres(bx, bz)) { retour.setReturnValue(false); return; }
    }
}
