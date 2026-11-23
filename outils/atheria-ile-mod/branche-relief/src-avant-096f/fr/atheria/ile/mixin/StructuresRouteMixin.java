package fr.atheria.ile.mixin;

import fr.atheria.ile.CarteIle;
import fr.atheria.ile.StructuresRoute;
import net.minecraft.core.RegistryAccess;
import net.minecraft.core.SectionPos;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.StructureManager;
import net.minecraft.world.level.chunk.ChunkAccess;
import net.minecraft.world.level.chunk.ChunkGenerator;
import net.minecraft.world.level.levelgen.Heightmap;
import net.minecraft.world.level.levelgen.RandomState;
import net.minecraft.world.level.levelgen.structure.BoundingBox;
import net.minecraft.world.level.levelgen.structure.Structure;
import net.minecraft.world.level.levelgen.structure.StructureSet;
import net.minecraft.world.level.levelgen.structure.StructureStart;
import net.minecraft.world.level.levelgen.structure.templatesystem.StructureTemplateManager;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

/**
 * Une structure dont la boite (tous ses morceaux, pas seulement le chunk de depart) passe a moins de
 * route_marge_blocs de l'axe d'une route, ou entre dans un lot et sa marge, est refusee et notee pour
 * rapport-structures-route.txt.
 */
@Mixin(ChunkGenerator.class)
public abstract class StructuresRouteMixin {
    @Inject(method = "tryGenerateStructure", at = @At("RETURN"), cancellable = true)
    private void atheriaIle$pasSurLaRoute(StructureSet.StructureSelectionEntry entree, StructureManager gestionnaire, RegistryAccess registres, RandomState aleatoire,
                                          StructureTemplateManager modeles, long graine, ChunkAccess chunk, ChunkPos pos, SectionPos section,
                                          CallbackInfoReturnable<Boolean> retour) {
        if (!retour.getReturnValue()) return;
        CarteIle c = CarteIle.active();
        if (c == null) return;
        Structure s = entree.structure().value();
        StructureStart depart = chunk.getStartForStructure(s);
        if (depart == null || !depart.isValid()) return;
        BoundingBox b = depart.getBoundingBox();
        String id = entree.structure().unwrapKey().map(k -> k.location().toString()).orElse("?");
        // 0.7.1 : une structure hors pose_autorisee dont la boite coupe la reserve d'un volume souterrain est refusee
        // en entier (certaines, comme subsurface:underground_forest, ecrivent sans passer par le filtre bloc par bloc)
        if (!c.volumes.vide()) {
            String vol = c.volumes.boiteTouche(b.minX(), b.minY(), b.minZ(), b.maxX(), b.maxY(), b.maxZ());
            // grottes a boite factice (subsurface : 1 x 7 blocs a Y 313 mais creusent tout le chunk) : refus sur tout chunk de volume
            net.minecraft.resources.ResourceLocation rl = entree.structure().unwrapKey().map(k -> k.location()).orElse(null);
            if (vol == null && rl != null && c.volumes.refuseParChunk(rl.getNamespace(), rl.getPath())
                    && (c.volumes.chunkTouche(pos.x, pos.z) || c.volumes.chunkTouche(b.minX() >> 4, b.minZ() >> 4))) vol = "(chunk de volume, refus_par_chunk)";
            if (vol != null && !fr.atheria.ile.PoseVolumes.autorise(entree.structure().unwrapKey().map(k -> k.location()).orElse(null))) {
                StructuresRoute.noter(id, pos.x, pos.z, b.minX(), b.minY(), b.minZ(), b.maxX(), b.maxY(), b.maxZ(), "volume souterrain " + vol);
                chunk.setStartForStructure(s, StructureStart.INVALID_START);
                retour.setReturnValue(false);
                return;
            }
        }
        String raison = StructuresRoute.conflit(c, b.minX(), b.minZ(), b.maxX(), b.maxZ());
        if (raison == null) return;
        if (raison.startsWith("route")) {
            // structure souterraine : gardee si le haut de sa boite reste loin sous le sol, la route ne l'atteint pas
            int[] a = StructuresRoute.axeProche(c, b.minX(), b.minZ(), b.maxX(), b.maxZ());
            int sol = ((ChunkGenerator) (Object) this).getBaseHeight(a[0], a[1], Heightmap.Types.WORLD_SURFACE_WG, chunk, aleatoire);
            if (b.maxY() < sol - StructuresRoute.PROFONDEUR_MIN) {
                StructuresRoute.noterGardee(id, pos.x, pos.z, b.minX(), b.minY(), b.minZ(), b.maxX(), b.maxY(), b.maxZ(), raison, sol);
                return;
            }
        }
        StructuresRoute.noter(id, pos.x, pos.z, b.minX(), b.minY(), b.minZ(), b.maxX(), b.maxY(), b.maxZ(), raison);
        chunk.setStartForStructure(s, StructureStart.INVALID_START);
        retour.setReturnValue(false);
    }
}
