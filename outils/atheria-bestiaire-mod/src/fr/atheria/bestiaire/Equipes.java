package fr.atheria.bestiaire;

import java.lang.reflect.Method;
import java.util.Optional;
import java.util.UUID;
import net.neoforged.fml.ModList;
import net.neoforged.neoforge.common.NeoForge;
import net.neoforged.neoforge.event.server.ServerStoppedEvent;

// Alliances = equipes FTB Teams, lues par reflexion (le mod marche sans elles : chaque joueur est alors sa propre alliance).
final class Equipes {
    private static boolean essaye;
    private static Object gestionnaire;
    private static Method memeEquipe, equipeDe, idEquipe;

    private Equipes() {
    }

    static void brancher() {
        NeoForge.EVENT_BUS.addListener((ServerStoppedEvent e) -> {
            essaye = false;
            gestionnaire = null;
            memeEquipe = equipeDe = idEquipe = null;
        });
    }

    private static boolean pret() {
        if (!essaye) {
            essaye = true;
            if (ModList.get().isLoaded("ftbteams")) {
                try {
                    Object api = Class.forName("dev.ftb.mods.ftbteams.api.FTBTeamsAPI").getMethod("api").invoke(null);
                    Class<?> ia = Class.forName("dev.ftb.mods.ftbteams.api.FTBTeamsAPI$API");
                    if ((Boolean) ia.getMethod("isManagerLoaded").invoke(api)) {
                        Class<?> tm = Class.forName("dev.ftb.mods.ftbteams.api.TeamManager");
                        gestionnaire = ia.getMethod("getManager").invoke(api);
                        memeEquipe = tm.getMethod("arePlayersInSameTeam", UUID.class, UUID.class);
                        equipeDe = tm.getMethod("getTeamForPlayerID", UUID.class);
                        idEquipe = Class.forName("dev.ftb.mods.ftbteams.api.Team").getMethod("getId");
                    } else {
                        essaye = false; // gestionnaire pas encore pret : on reessaiera
                    }
                } catch (Throwable t) {
                    gestionnaire = null;
                    AtheriaBestiaire.LOG.warn("Equipes FTB non lues, chaque joueur compte comme sa propre alliance : {}", t.toString());
                }
            }
        }
        return gestionnaire != null;
    }

    static boolean meme(UUID a, UUID b) {
        if (a.equals(b)) return true;
        if (!pret() || memeEquipe == null) return false;
        try {
            return (Boolean) memeEquipe.invoke(gestionnaire, a, b);
        } catch (Throwable t) {
            return false;
        }
    }

    // Identifiant de l'alliance du joueur (son equipe FTB, ou lui-meme)
    static UUID alliance(UUID joueur) {
        if (pret() && equipeDe != null) {
            try {
                Optional<?> t = (Optional<?>) equipeDe.invoke(gestionnaire, joueur);
                if (t.isPresent()) return (UUID) idEquipe.invoke(t.get());
            } catch (Throwable ignore) {
                // on retombe sur le joueur seul
            }
        }
        return joueur;
    }
}
