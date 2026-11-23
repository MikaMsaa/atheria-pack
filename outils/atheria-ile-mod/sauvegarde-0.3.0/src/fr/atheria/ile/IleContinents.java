package fr.atheria.ile;

import com.mojang.serialization.MapCodec;
import com.mojang.serialization.codecs.RecordCodecBuilder;
import net.minecraft.util.KeyDispatchDataCodec;
import net.minecraft.world.level.levelgen.DensityFunction;

/**
 * Remplace la "continentalité" de Tectonic par celle dessinée sur la carte de l'île.
 * "argument" = la fonction d'origine, gardée pour le petit détail naturel des côtes.
 * S'utilise via un modificateur Lithostitched (wrap_density_function) placé dans le datapack du monde :
 * sans ce datapack, le mod ne change rien.
 */
public final class IleContinents implements DensityFunction {

    /** Seul le décodage depuis le datapack active la carte ; les copies internes (mapAll) ne la rechargent jamais. */
    public static final MapCodec<IleContinents> MAP_CODEC = RecordCodecBuilder.mapCodec(i -> i.group(
            DensityFunction.HOLDER_HELPER_CODEC.fieldOf("argument").forGetter(IleContinents::argument)
    ).apply(i, IleContinents::depuisDatapack));

    public static final KeyDispatchDataCodec<IleContinents> CODEC = KeyDispatchDataCodec.of(MAP_CODEC);

    private final DensityFunction argument;

    private IleContinents(DensityFunction argument) {
        this.argument = argument;
    }

    private static IleContinents depuisDatapack(DensityFunction argument) {
        CarteIle.activer();
        return new IleContinents(argument);
    }

    public DensityFunction argument() {
        return argument;
    }

    @Override
    public double compute(FunctionContext ctx) {
        double o = argument.compute(ctx);
        CarteIle c = CarteIle.active();
        return c == null ? o : c.continents(ctx.blockX(), ctx.blockZ(), o);
    }

    @Override
    public void fillArray(double[] tab, ContextProvider p) {
        p.fillAllDirectly(tab, this);
    }

    @Override
    public DensityFunction mapAll(Visitor visitor) {
        return visitor.apply(new IleContinents(argument.mapAll(visitor)));
    }

    @Override
    public double minValue() {
        return Math.min(-1.2, argument.minValue());
    }

    @Override
    public double maxValue() {
        return Math.max(2.0, argument.maxValue());
    }

    @Override
    public KeyDispatchDataCodec<? extends DensityFunction> codec() {
        return CODEC;
    }
}
