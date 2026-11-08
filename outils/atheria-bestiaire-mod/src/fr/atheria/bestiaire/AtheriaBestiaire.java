package fr.atheria.bestiaire;

import fr.atheria.bestiaire.client.NomsFamilles;
import net.minecraft.core.registries.Registries;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.tags.TagKey;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.EntityType;
import net.neoforged.api.distmarker.Dist;
import net.neoforged.bus.api.IEventBus;
import net.neoforged.fml.common.Mod;
import net.neoforged.neoforge.common.NeoForge;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// Bestiaire d'Atheria : chaque famille d'infectes a un sens de chasse et un territoire.
//  - Chimiks (Chimiks.java)   : aveugles, ne chassent qu'au son
//  - Dakouane (Dakouane.java) : en groupes de 4 a 10, attires la nuit par la lumiere
//  - Familles (Familles.java) : apparitions par lieu (biomes, structures, quartiers de Lost Cities)
//  - Uniques (Uniques.java)   : boss de lieu, un seul exemplaire chacun
// Qui est quoi se regle par des tags d'entites (data/atheria/tags/entity_type), les lieux et les uniques
// par des fichiers JSON (data/atheria/atheria_familles, data/atheria/atheria_uniques). /reload relit tout.
@Mod(AtheriaBestiaire.MODID)
public final class AtheriaBestiaire {
    public static final String MODID = "atheria_bestiaire";
    static final Logger LOG = LoggerFactory.getLogger("Atheria Bestiaire");

    public static final TagKey<EntityType<?>> DAKOUANE = tag("dakouane");
    public static final TagKey<EntityType<?>> CHIMIKS = tag("chimiks");
    public static final TagKey<EntityType<?>> FAMILLES = tag("familles");

    public AtheriaBestiaire(IEventBus modBus, Dist dist) {
        modBus.addListener(Lieux::imc);
        NeoForge.EVENT_BUS.addListener(Familles::ajouter);
        Familles.brancher();
        Chimiks.brancher();
        Dakouane.brancher();
        Uniques.brancher();
        if (dist.isClient()) NomsFamilles.init();
    }

    private static TagKey<EntityType<?>> tag(String nom) {
        return TagKey.create(Registries.ENTITY_TYPE, ResourceLocation.fromNamespaceAndPath("atheria", nom));
    }

    // Les infectes ne s'entendent pas entre eux : leurs propres pas et cris ne comptent pas comme du bruit.
    static boolean infecte(Entity e) {
        if (e == null) return false;
        EntityType<?> t = e.getType();
        return t.is(DAKOUANE) || "spore".equals(EntityType.getKey(t).getNamespace());
    }
}
