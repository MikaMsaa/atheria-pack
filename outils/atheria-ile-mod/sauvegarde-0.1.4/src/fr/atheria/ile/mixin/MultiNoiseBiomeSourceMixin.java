package fr.atheria.ile.mixin;

import com.llamalad7.mixinextras.injector.wrapmethod.WrapMethod;
import com.llamalad7.mixinextras.injector.wrapoperation.Operation;
import fr.atheria.ile.CarteIle;
import fr.atheria.ile.IleSources;
import fr.atheria.ile.TableBiomes;
import net.minecraft.core.Holder;
import net.minecraft.core.QuartPos;
import net.minecraft.world.level.biome.Biome;
import net.minecraft.world.level.biome.Climate;
import net.minecraft.world.level.biome.MultiNoiseBiomeSource;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.spongepowered.asm.mixin.Unique;

/**
 * Enveloppe tout getNoiseBiome (TerraBlender compris) : le biome d'origine décide de l'eau, des plages,
 * des rivières et des grottes ; la carte de l'île décide du biome de surface de chaque région.
 */
@Mixin(MultiNoiseBiomeSource.class)
public abstract class MultiNoiseBiomeSourceMixin {

    /** null = pas encore calculé ; IleSources.AUCUNE = pas l'Overworld ; sinon la TableBiomes */
    @Unique
    private volatile Object atheria_ile$table;
    @Unique
    private volatile CarteIle atheria_ile$carte;

    @Shadow
    private Climate.ParameterList<Holder<Biome>> parameters() {
        throw new AssertionError();
    }

    @WrapMethod(method = "getNoiseBiome(IIILnet/minecraft/world/level/biome/Climate$Sampler;)Lnet/minecraft/core/Holder;")
    private Holder<Biome> atheria_ile$biomeDeLIle(int x, int y, int z, Climate.Sampler sampler, Operation<Holder<Biome>> original) {
        Holder<Biome> base = original.call(x, y, z, sampler);
        CarteIle carte = CarteIle.active();
        if (carte == null) return base;
        Object t = atheria_ile$table;
        if (t == null || atheria_ile$carte != carte) {
            synchronized (this) {
                if (atheria_ile$table == null || atheria_ile$carte != carte) {
                    Climate.ParameterList<Holder<Biome>> params;
                    try {
                        params = parameters();
                    } catch (RuntimeException e) {
                        params = null;
                    }
                    atheria_ile$table = IleSources.construire((MultiNoiseBiomeSource) (Object) this, carte, params);
                    atheria_ile$carte = carte;
                }
                t = atheria_ile$table;
            }
        }
        if (!(t instanceof TableBiomes table)) return base;
        return table.choisir(base, QuartPos.toBlock(x), QuartPos.toBlock(z));
    }
}
