package fr.atheria.monde;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.Property;

// Blocs du modpack pour la generation souterraine (Spore, Handcrafted, Create, Create Deco, Supplementaries,
// Farmer's Delight), chacun avec un bloc vanilla de secours si le mod manque : la generation ne casse jamais.
final class Blocs {
    private static final Map<String, Optional<Block>> CACHE = new ConcurrentHashMap<>();

    private Blocs() {
    }

    static BlockState b(String id, BlockState secours) {
        Optional<Block> o = CACHE.computeIfAbsent(id, k -> {
            ResourceLocation r = ResourceLocation.tryParse(k);
            if (r == null || !BuiltInRegistries.BLOCK.containsKey(r)) return Optional.empty();
            Block bl = BuiltInRegistries.BLOCK.get(r);
            return bl == Blocks.AIR ? Optional.empty() : Optional.of(bl);
        });
        return o.isPresent() ? o.get().defaultBlockState() : secours;
    }

    // propriete par son nom (sans effet si le bloc n'a pas cette propriete ou cette valeur)
    static BlockState p(BlockState s, String nom, String valeur) {
        Property<?> pr = s.getBlock().getStateDefinition().getProperty(nom);
        return pr == null ? s : regler(s, pr, valeur);
    }

    private static <T extends Comparable<T>> BlockState regler(BlockState s, Property<T> pr, String valeur) {
        Optional<T> v = pr.getValue(valeur);
        return v.isPresent() ? s.setValue(pr, v.get()) : s;
    }
}
