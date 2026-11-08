package fr.atheria.recit;

import fr.atheria.recit.client.ClientRecit;
import net.neoforged.api.distmarker.Dist;
import net.neoforged.bus.api.IEventBus;
import net.neoforged.fml.common.Mod;
import net.neoforged.neoforge.common.NeoForge;

// Cinematiques et dialogues d'Atheria.
// Le serveur decide de tout (qui voit quoi, protection du joueur, choix et actions de quete) ;
// le client ne fait qu'afficher et renvoyer la fin d'une cinematique ou le choix d'un dialogue.
@Mod(AtheriaRecit.MODID)
public final class AtheriaRecit {
    public static final String MODID = "atheria_recit";

    public AtheriaRecit(IEventBus modBus, Dist dist) {
        modBus.addListener(Reseau::enregistrer);
        NeoForge.EVENT_BUS.addListener(Donnees::ajouter);
        NeoForge.EVENT_BUS.addListener(Commandes::enregistrer);
        Protection.brancher();
        Dialogues.brancher();
        if (dist.isClient()) ClientRecit.init();
    }
}
