package fr.atheria.ile;

import com.mojang.serialization.Codec;
import com.mojang.serialization.MapCodec;
import com.mojang.serialization.codecs.RecordCodecBuilder;
import net.minecraft.util.KeyDispatchDataCodec;
import net.minecraft.world.level.levelgen.DensityFunction;

/**
 * Enveloppe une fonction de densite de grottes (Tectonic : caves, cave/noodle, underground_river/total,
 * lava_tunnel/total ; vanilla : vein_toggle) : dans un volume souterrain reserve et sa marge, elle rend "valeur",
 * la valeur neutre (pas de grotte, pas de riviere, pas de filon). Le terrain de base n'est pas touche : la surface
 * reste la meme, la roche reste pleine autour du volume, et l'aquifere (qui ne remplit que les vides) n'y met rien.
 * S'utilise via un modificateur Lithostitched (wrap_density_function) du datapack du monde.
 */
public final class DensiteVolumes implements DensityFunction {
    public static final MapCodec<DensiteVolumes> MAP_CODEC = RecordCodecBuilder.mapCodec(i -> i.group(
            DensityFunction.HOLDER_HELPER_CODEC.fieldOf("argument").forGetter(DensiteVolumes::argument),
            Codec.DOUBLE.fieldOf("valeur").forGetter(DensiteVolumes::valeur)
    ).apply(i, DensiteVolumes::new));

    public static final KeyDispatchDataCodec<DensiteVolumes> CODEC = KeyDispatchDataCodec.of(MAP_CODEC);

    private final DensityFunction argument;
    private final double valeur;

    private DensiteVolumes(DensityFunction argument, double valeur) {
        this.argument = argument;
        this.valeur = valeur;
    }

    public DensityFunction argument() { return argument; }
    public double valeur() { return valeur; }

    @Override
    public double compute(FunctionContext ctx) {
        CarteIle c = CarteIle.active();
        if (c != null && c.volumes.densite(ctx.blockX(), ctx.blockY(), ctx.blockZ())) return valeur;
        return argument.compute(ctx);
    }

    @Override
    public void fillArray(double[] tab, ContextProvider p) {
        p.fillAllDirectly(tab, this);
    }

    @Override
    public DensityFunction mapAll(Visitor visitor) {
        return visitor.apply(new DensiteVolumes(argument.mapAll(visitor), valeur));
    }

    @Override
    public double minValue() { return Math.min(valeur, argument.minValue()); }

    @Override
    public double maxValue() { return Math.max(valeur, argument.maxValue()); }

    @Override
    public KeyDispatchDataCodec<? extends DensityFunction> codec() { return CODEC; }
}
