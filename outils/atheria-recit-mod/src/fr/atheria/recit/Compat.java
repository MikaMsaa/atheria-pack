package fr.atheria.recit;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Stream;
import net.minecraft.server.level.ServerPlayer;
import net.neoforged.fml.ModList;

// Liens optionnels avec d'autres mods, par reflexion : si le mod manque ou change, on continue sans lui.
//  - Open Parties and Claims : les membres de l'alliance (party) du joueur
//  - FTB Quests : etat d'une quete pour l'equipe du joueur
final class Compat {
    private Compat() {
    }

    // ---------- Open Parties and Claims ----------
    private static boolean opacEssaye;
    private static Method opacGet, opacManager, opacParty, opacMembres;

    @SuppressWarnings("unchecked")
    static List<ServerPlayer> allies(ServerPlayer p) {
        try {
            if (!opacEssaye) {
                opacEssaye = true;
                if (!ModList.get().isLoaded("openpartiesandclaims")) return List.of();
                Class<?> api = Class.forName("xaero.pac.common.server.api.OpenPACServerAPI");
                opacGet = api.getMethod("get", net.minecraft.server.MinecraftServer.class);
                opacManager = api.getMethod("getPartyManager");
                opacParty = Class.forName("xaero.pac.common.server.parties.party.api.IPartyManagerAPI").getMethod("getPartyByMember", UUID.class);
                opacMembres = Class.forName("xaero.pac.common.server.parties.party.api.IServerPartyAPI").getMethod("getOnlineMemberStream");
            }
            if (opacMembres == null) return List.of();
            Object manager = opacManager.invoke(opacGet.invoke(null, p.server));
            Object party = opacParty.invoke(manager, p.getUUID());
            if (party == null) return List.of();
            return ((Stream<ServerPlayer>) opacMembres.invoke(party)).filter(m -> m != p).toList();
        } catch (Throwable t) {
            if (opacMembres != null) Donnees.LOG.warn("Alliances (Open Parties and Claims) indisponibles : {}", t.toString());
            opacMembres = null;
            return List.of();
        }
    }

    // ---------- FTB Quests ----------
    private static boolean ftbEssaye;
    private static Field ftbInstance;
    private static Method ftbParse, ftbGetBase, ftbTeamData, ftbFinie, ftbCommencee;

    // etat : "finie", "commencee" ; null si FTB Quests absent ou quete inconnue
    static Boolean quete(ServerPlayer p, String id, String etat) {
        try {
            if (!ftbEssaye) {
                ftbEssaye = true;
                if (!ModList.get().isLoaded("ftbquests")) return null;
                Class<?> fichier = Class.forName("dev.ftb.mods.ftbquests.quest.ServerQuestFile");
                Class<?> base = Class.forName("dev.ftb.mods.ftbquests.quest.BaseQuestFile");
                Class<?> objet = Class.forName("dev.ftb.mods.ftbquests.quest.QuestObject");
                Class<?> equipe = Class.forName("dev.ftb.mods.ftbquests.quest.TeamData");
                ftbInstance = fichier.getField("INSTANCE");
                ftbParse = Class.forName("dev.ftb.mods.ftbquests.quest.QuestObjectBase").getMethod("parseCodeString", String.class);
                ftbGetBase = base.getMethod("getBase", long.class);
                ftbTeamData = base.getMethod("getTeamData", net.minecraft.world.entity.player.Player.class);
                ftbFinie = equipe.getMethod("isCompleted", objet);
                ftbCommencee = equipe.getMethod("isStarted", objet);
            }
            if (ftbFinie == null) return null;
            Object f = ftbInstance.get(null);
            if (f == null) return null;
            Object q = ftbGetBase.invoke(f, (long) ftbParse.invoke(null, id));
            if (q == null) {
                Donnees.LOG.warn("Quete FTB inconnue : {}", id);
                return null;
            }
            Optional<?> td = (Optional<?>) ftbTeamData.invoke(f, p);
            if (td.isEmpty()) return false;
            return (Boolean) ("commencee".equals(etat) ? ftbCommencee : ftbFinie).invoke(td.get(), q);
        } catch (Throwable t) {
            if (ftbFinie != null) Donnees.LOG.warn("FTB Quests indisponible : {}", t.toString());
            ftbFinie = null;
            return null;
        }
    }
}
