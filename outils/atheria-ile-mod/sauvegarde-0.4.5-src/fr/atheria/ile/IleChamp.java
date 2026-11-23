package fr.atheria.ile;

import com.mojang.serialization.Codec;
import com.mojang.serialization.MapCodec;
import com.mojang.serialization.codecs.RecordCodecBuilder;
import net.minecraft.util.KeyDispatchDataCodec;
import net.minecraft.world.level.levelgen.DensityFunction;

/**
 * Remplace un bruit de Tectonic par celui dicté par la carte : "erosion" (relief.png) ou "cretes" (rivières dessinées).
 * Comme IleContinents : ne s'active que via le datapack du monde ; sans carte active, renvoie le bruit d'origine.
 */
public final class IleChamp implements DensityFunction {

    public static final MapCodec<IleChamp> MAP_CODEC = RecordCodecBuilder.mapCodec(i -> i.group(
            DensityFunction.HOLDER_HELPER_CODEC.fieldOf("argument").forGetter(IleChamp::argument),
            Codec.STRING.fieldOf("champ").forGetter(IleChamp::champ)
    ).apply(i, IleChamp::depuisDatapack));

    public static final KeyDispatchDataCodec<IleChamp> CODEC = KeyDispatchDataCodec.of(MAP_CODEC);

    private static final int EROSION = 0, CRETES = 1;

    private final DensityFunction argument;
    private final String champ;
    private final int code;

    private IleChamp(DensityFunction argument, String champ) {
        this.argument = argument;
        this.champ = champ;
        this.code = "cretes".equals(champ) ? CRETES : "erosion".equals(champ) ? EROSION : -1;
        if (code < 0) CarteIle.LOG.error("[atheria_ile] champ inconnu '{}' (erosion ou cretes) : bruit d'origine garde", champ);
    }

    private static IleChamp depuisDatapack(DensityFunction argument, String champ) {
        CarteIle.activer();
        return new IleChamp(argument, champ);
    }

    public DensityFunction argument() { return argument; }

    public String champ() { return champ; }

    @Override
    public double compute(FunctionContext ctx) {
        double o = argument.compute(ctx);
        CarteIle c = CarteIle.active();
        if (c == null || code < 0) return o;
        return code == EROSION ? c.erosion(ctx.blockX(), ctx.blockZ(), o) : c.cretes(ctx.blockX(), ctx.blockZ(), o);
    }

    @Override
    public void fillArray(double[] tab, ContextProvider p) {
        p.fillAllDirectly(tab, this);
    }

    @Override
    public DensityFunction mapAll(Visitor visitor) {
        return visitor.apply(new IleChamp(argument.mapAll(visitor), champ));
    }

    @Override
    public double minValue() { return Math.min(-1.5, argument.minValue()); }

    @Override
    public double maxValue() { return Math.max(1.5, argument.maxValue()); }

    @Override
    public KeyDispatchDataCodec<? extends DensityFunction> codec() { return CODEC; }
}
