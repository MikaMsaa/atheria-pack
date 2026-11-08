package fr.atheria.bestiaire.client;

import fr.atheria.bestiaire.AtheriaBestiaire;
import net.minecraft.client.Minecraft;
import net.minecraft.world.entity.Entity;
import net.neoforged.neoforge.client.event.RenderNameTagEvent;
import net.neoforged.neoforge.common.NeoForge;
import net.neoforged.neoforge.common.util.TriState;

// Nom de la famille au-dessus d'un infecte quand on le regarde (comme un nom de PNJ), jusqu'a 20 blocs.
// Le nom vient des fichiers de langue (kubejs/assets/<mod>/lang) : c'est aussi celui que Jade affiche.
public final class NomsFamilles {
    private static final double DISTANCE2 = 20 * 20;

    private NomsFamilles() {
    }

    public static void init() {
        NeoForge.EVENT_BUS.addListener(NomsFamilles::nom);
    }

    private static void nom(RenderNameTagEvent e) {
        Entity en = e.getEntity();
        if (!en.getType().is(AtheriaBestiaire.FAMILLES)) return;
        Minecraft mc = Minecraft.getInstance();
        if (mc.player == null || mc.crosshairPickEntity != en || !Minecraft.renderNames() || en.isInvisibleTo(mc.player)
                || mc.player.distanceToSqr(en) > DISTANCE2) return;
        e.setCanRender(TriState.TRUE);
    }
}
