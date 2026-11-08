package fr.atheria.recit;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import javax.annotation.Nullable;
import net.minecraft.commands.CommandSourceStack;
import net.minecraft.network.chat.Component;
import net.minecraft.server.level.ServerPlayer;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.InteractionResult;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.scores.Objective;
import net.minecraft.world.scores.ReadOnlyScoreInfo;
import net.neoforged.neoforge.common.NeoForge;
import net.neoforged.neoforge.event.entity.player.PlayerInteractEvent;
import net.neoforged.neoforge.event.tick.ServerTickEvent;
import net.neoforged.neoforge.network.PacketDistributor;

// Dialogues des PNJ, entierement decides par le serveur.
// Un PNJ (Easy NPC ou toute autre entite) qui porte le tag "dialogue.<nom>" ouvre ce dialogue au clic droit :
//   /tag @e[type=easy_npc:humanoid,limit=1,sort=nearest] add dialogue.marcel
// ou par commande : /recit dialogue marcel @p <pnj>
// Les membres de l'alliance (Open Parties and Claims) proches voient la meme bulle ; seul celui qui a parle au PNJ choisit.
public final class Dialogues {
    private static final String PREFIXE_TAG = "dialogue.";
    private static final int MAX_SAUTS = 32;
    private static final double DISTANCE_MAX = 10;
    private static final double DISTANCE_ALLIES = 12;
    private static final double DISTANCE_ALLIES_MAX = 18;

    private static final class Session {
        final String nom;
        final JsonObject def;
        final int entite;
        final UUID pnj;
        final UUID meneur;
        final Set<UUID> spectateurs = ConcurrentHashMap.newKeySet();
        String noeud;
        List<JsonObject> choix = List.of();
        String derniereVue;

        Session(String nom, JsonObject def, @Nullable Entity pnj, ServerPlayer meneur) {
            this.nom = nom;
            this.def = def;
            this.entite = pnj == null ? -1 : pnj.getId();
            this.pnj = pnj == null ? null : pnj.getUUID();
            this.meneur = meneur.getUUID();
        }
    }

    private static final Map<UUID, Session> SESSIONS = new ConcurrentHashMap<>();
    // allie qui regarde -> joueur qui mene le dialogue
    private static final Map<UUID, UUID> SPECTATEURS = new ConcurrentHashMap<>();

    private Dialogues() {
    }

    static void brancher() {
        NeoForge.EVENT_BUS.addListener(Dialogues::interaction);
        NeoForge.EVENT_BUS.addListener(Dialogues::tick);
    }

    static boolean occupe(ServerPlayer p) {
        return SESSIONS.containsKey(p.getUUID()) || SPECTATEURS.containsKey(p.getUUID());
    }

    public static boolean ouvrir(ServerPlayer p, String nom, @Nullable Entity pnj) {
        JsonObject def = Donnees.DIALOGUES.get(nom);
        if (def == null) return false;
        quitter(p);
        fermer(p);
        Session s = new Session(nom, def, pnj, p);
        SESSIONS.put(p.getUUID(), s);
        Protection.proteger(p, Protection.DIALOGUE, 20 * 60 * 10);
        // les allies tout proches suivent la conversation (sauf s'ils sont deja occupes ou en danger)
        Entity centre = pnj != null ? pnj : p;
        for (ServerPlayer a : Compat.allies(p)) {
            if (a.level() != p.level() || a.distanceTo(centre) > DISTANCE_ALLIES || a.isSpectator()) continue;
            if (occupe(a) || Protection.protege(a) || Protection.danger(a) != null) continue;
            s.spectateurs.add(a.getUUID());
            SPECTATEURS.put(a.getUUID(), p.getUUID());
            Protection.proteger(a, Protection.DIALOGUE, 20 * 60 * 10);
        }
        aller(p, s, def.has("debut") ? def.get("debut").getAsString() : "debut", 0);
        return true;
    }

    // deconnexion ou filet de securite
    static void oublierSession(ServerPlayer p) {
        Session s = SESSIONS.get(p.getUUID());
        if (s != null) fermer(p);
        SESSIONS.remove(p.getUUID());
        retirerSpectateur(p.getUUID(), p);
    }

    static void fermer(ServerPlayer p) {
        Session s = SESSIONS.remove(p.getUUID());
        if (s == null) return;
        PacketDistributor.sendToPlayer(p, new Reseau.EtapeDialogue(""));
        Protection.liberer(p, Protection.DIALOGUE);
        for (UUID u : s.spectateurs) {
            SPECTATEURS.remove(u);
            ServerPlayer a = p.server.getPlayerList().getPlayer(u);
            if (a == null) continue;
            PacketDistributor.sendToPlayer(a, new Reseau.EtapeDialogue(""));
            Protection.liberer(a, Protection.DIALOGUE);
        }
    }

    // un allie qui regardait s'en va (Echap, trop loin, deconnexion)
    private static void quitter(ServerPlayer a) {
        retirerSpectateur(a.getUUID(), a);
    }

    private static void retirerSpectateur(UUID u, @Nullable ServerPlayer a) {
        UUID m = SPECTATEURS.remove(u);
        if (m == null) return;
        Session s = SESSIONS.get(m);
        if (s != null) s.spectateurs.remove(u);
        if (a != null) {
            PacketDistributor.sendToPlayer(a, new Reseau.EtapeDialogue(""));
            Protection.liberer(a, Protection.DIALOGUE);
        }
    }

    // ---------- deroulement ----------
    private static void aller(ServerPlayer p, Session s, @Nullable String id, int sauts) {
        JsonObject noeuds = s.def.getAsJsonObject("noeuds");
        if (id == null || sauts > MAX_SAUTS || !noeuds.has(id)) {
            if (id != null && !noeuds.has(id)) Donnees.LOG.error("Dialogue {} : noeud \"{}\" introuvable", s.nom, id);
            fermer(p);
            return;
        }
        JsonObject n = noeuds.getAsJsonObject(id);
        s.noeud = id;
        // aiguillage : premier cas dont la condition est remplie
        if (n.has("aiguillage")) {
            for (JsonElement el : n.getAsJsonArray("aiguillage")) {
                JsonObject cas = el.getAsJsonObject();
                if (condition(p, cas)) {
                    aller(p, s, chaine(cas, "aller"), sauts + 1);
                    return;
                }
            }
            fermer(p);
            return;
        }
        if (!actions(p, s, n)) return;
        List<JsonObject> visibles = new ArrayList<>();
        JsonArray choixVus = new JsonArray();
        if (n.has("choix")) {
            for (JsonElement el : n.getAsJsonArray("choix")) {
                JsonObject c = el.getAsJsonObject();
                if (!condition(p, c)) continue;
                visibles.add(c);
                JsonObject cv = new JsonObject();
                cv.addProperty("texte", chaine(c, "texte"));
                // "style": "accepter" ou "refuser" (quetes) : un petit signe vert ou rouge devant le choix
                if (c.has("style")) cv.addProperty("style", chaine(c, "style"));
                choixVus.add(cv);
            }
        }
        s.choix = visibles;
        JsonArray lignes = lignes(n);
        // noeud sans rien a dire : on enchaine directement
        if (lignes.isEmpty() && visibles.isEmpty()) {
            if (n.has("suite")) aller(p, s, n.get("suite").getAsString(), sauts + 1);
            else fermer(p);
            return;
        }
        JsonObject pnjDef = s.def.has("pnj") ? s.def.getAsJsonObject("pnj") : new JsonObject();
        JsonObject vue = new JsonObject();
        Entity pnj = s.entite >= 0 ? p.serverLevel().getEntity(s.entite) : null;
        String nom = n.has("nom") ? chaine(n, "nom") : pnjDef.has("nom") ? chaine(pnjDef, "nom") : pnj != null ? pnj.getDisplayName().getString() : "";
        vue.addProperty("nom", nom);
        copier(pnjDef, n, vue, "portrait");
        copier(pnjDef, n, vue, "son");
        copier(pnjDef, n, vue, "hauteur");
        copier(pnjDef, n, vue, "vitesse");
        // "camera": false dans le dialogue ou le noeud = pas de plans de cinema
        boolean camera = !(s.def.has("camera") && !s.def.get("camera").getAsBoolean()) && !(n.has("camera") && !n.get("camera").getAsBoolean());
        vue.addProperty("camera", camera);
        vue.addProperty("entite", s.entite);
        vue.addProperty("portrait_entite", !n.has("portrait"));
        vue.addProperty("acteur", p.getId());
        vue.addProperty("nom_meneur", p.getGameProfile().getName());
        vue.add("lignes", lignes);
        vue.add("choix", choixVus);
        s.derniereVue = vue.toString();
        envoyer(p, s);
    }

    // le meneur recoit la vue avec la main ; les allies la meme vue, en spectateurs
    private static void envoyer(ServerPlayer p, Session s) {
        JsonObject v = com.google.gson.JsonParser.parseString(s.derniereVue).getAsJsonObject();
        v.addProperty("meneur", true);
        PacketDistributor.sendToPlayer(p, new Reseau.EtapeDialogue(v.toString()));
        if (s.spectateurs.isEmpty()) return;
        v.addProperty("meneur", false);
        String vs = v.toString();
        for (UUID u : s.spectateurs) {
            ServerPlayer a = p.server.getPlayerList().getPlayer(u);
            if (a != null) PacketDistributor.sendToPlayer(a, new Reseau.EtapeDialogue(vs));
        }
    }

    static void reponse(ServerPlayer p, int choix) {
        Session s = SESSIONS.get(p.getUUID());
        if (s == null) {
            // un allie spectateur ne choisit rien ; il peut seulement quitter
            if (choix == -2) quitter(p);
            return;
        }
        if (choix == -2) {
            fermer(p);
            return;
        }
        JsonObject n = s.def.getAsJsonObject("noeuds").getAsJsonObject(s.noeud);
        if (!s.choix.isEmpty()) {
            if (choix < 0 || choix >= s.choix.size()) return;
            JsonObject c = s.choix.get(choix);
            if (!actions(p, s, c)) return;
            if (c.has("aller") && !bool(c, "fin")) aller(p, s, chaine(c, "aller"), 0);
            else fermer(p);
            return;
        }
        if (n.has("suite") && !bool(n, "fin")) aller(p, s, chaine(n, "suite"), 0);
        else fermer(p);
    }

    private static JsonArray lignes(JsonObject n) {
        JsonArray sortie = new JsonArray();
        List<JsonElement> brutes = new ArrayList<>();
        if (n.has("texte")) brutes.add(n.get("texte"));
        if (n.has("lignes")) n.getAsJsonArray("lignes").forEach(brutes::add);
        for (JsonElement el : brutes) {
            JsonObject l = new JsonObject();
            if (el.isJsonObject()) {
                JsonObject o = el.getAsJsonObject();
                l.addProperty("texte", chaine(o, "texte"));
                if (o.has("nom")) l.addProperty("nom", chaine(o, "nom"));
                // replique du joueur : son propre visage en portrait
                if (bool(o, "joueur") || "Toi".equals(chaine(o, "nom"))) l.addProperty("joueur", true);
            } else {
                l.addProperty("texte", el.getAsString());
            }
            sortie.add(l);
        }
        return sortie;
    }

    private static void copier(JsonObject pnjDef, JsonObject noeud, JsonObject vue, String cle) {
        if (noeud.has(cle)) vue.add(cle, noeud.get(cle));
        else if (pnjDef.has(cle)) vue.add(cle, pnjDef.get(cle));
    }

    // ---------- conditions ----------
    // "si": { "tag": "x" ou ["x","y"], "sans_tag": ..., "vue": "intro", "score": {"objectif": "o", "min": 1, "max": 5},
    //         "quete_finie": "1A2B3C4D5E6F7A8B", "quete_pas_finie": ..., "quete_commencee": ... }
    // Quetes : etat FTB Quests de l'equipe du joueur (si FTB Quests est absent, la condition est fausse).
    private static boolean condition(ServerPlayer p, JsonObject o) {
        if (!o.has("si")) return true;
        JsonObject si = o.getAsJsonObject("si");
        for (String t : liste(si, "tag")) if (!p.getTags().contains(t)) return false;
        for (String t : liste(si, "sans_tag")) if (p.getTags().contains(t)) return false;
        for (String v : liste(si, "vue")) if (!Protection.dejaVue(p, v)) return false;
        for (String q : liste(si, "quete_finie")) if (!Boolean.TRUE.equals(Compat.quete(p, q, "finie"))) return false;
        for (String q : liste(si, "quete_pas_finie")) if (!Boolean.FALSE.equals(Compat.quete(p, q, "finie"))) return false;
        for (String q : liste(si, "quete_commencee")) if (!Boolean.TRUE.equals(Compat.quete(p, q, "commencee"))) return false;
        if (si.has("score")) {
            JsonObject sc = si.getAsJsonObject("score");
            Objective obj = p.getScoreboard().getObjective(chaine(sc, "objectif"));
            ReadOnlyScoreInfo info = obj == null ? null : p.getScoreboard().getPlayerScoreInfo(p, obj);
            int val = info == null ? 0 : info.value();
            if (sc.has("min") && val < sc.get("min").getAsInt()) return false;
            if (sc.has("max") && val > sc.get("max").getAsInt()) return false;
        }
        return true;
    }

    // ---------- actions ----------
    // "actions": [ {"commande": "give {joueur} minecraft:bread 2"}, {"tag": "x"}, {"retirer_tag": "x"},
    //              {"message": "..."}, {"cinematique": "nom"},
    //              {"quete": "1A2B3C4D5E6F7A8B", "faire": "terminer" | "reinitialiser"} ]
    // Accepter une quete : un choix "J'accepte" avec "style": "accepter" qui termine la quete d'acceptation
    // (celle dont depend la vraie quete dans FTB Quests). Refuser : "style": "refuser", sans action.
    // Renvoie false si l'action a ferme le dialogue (cinematique lancee).
    private static boolean actions(ServerPlayer p, Session s, JsonObject o) {
        if (!o.has("actions")) return true;
        for (JsonElement el : o.getAsJsonArray("actions")) {
            JsonObject a = el.getAsJsonObject();
            if (a.has("commande")) executer(p, chaine(a, "commande").replace("{pnj}", s.pnj == null ? "@s" : s.pnj.toString()));
            if (a.has("tag")) p.addTag(chaine(a, "tag"));
            if (a.has("retirer_tag")) p.removeTag(chaine(a, "retirer_tag"));
            if (a.has("message")) p.sendSystemMessage(Component.literal(chaine(a, "message")));
            if (a.has("quete")) {
                String q = chaine(a, "quete");
                if (!q.matches("[0-9A-Fa-f]{1,16}")) {
                    Donnees.LOG.error("Dialogue {} : identifiant de quete invalide \"{}\"", s.nom, q);
                } else {
                    String faire = "reinitialiser".equals(chaine(a, "faire")) ? "reset" : "complete";
                    executer(p, "ftbquests change_progress {joueur} " + faire + " " + q);
                }
            }
            if (a.has("cinematique")) {
                fermer(p);
                Protection.lancerCinematique(p, chaine(a, "cinematique"));
                return false;
            }
        }
        return true;
    }

    // Commande lancee au nom du joueur (@s = lui), avec les droits d'un operateur, sans rien afficher
    static void executer(ServerPlayer p, String cmd) {
        String c = cmd.replace("{joueur}", p.getGameProfile().getName());
        if (c.startsWith("/")) c = c.substring(1);
        CommandSourceStack src = p.createCommandSourceStack().withPermission(2).withSuppressedOutput();
        p.server.getCommands().performPrefixedCommand(src, c);
    }

    // ---------- evenements ----------
    private static void interaction(PlayerInteractEvent.EntityInteract ev) {
        if (!(ev.getEntity() instanceof ServerPlayer p)) return;
        String nom = null;
        for (String t : ev.getTarget().getTags()) if (t.startsWith(PREFIXE_TAG)) nom = t.substring(PREFIXE_TAG.length());
        if (nom == null || !Donnees.DIALOGUES.containsKey(nom)) return;
        ev.setCanceled(true);
        ev.setCancellationResult(InteractionResult.SUCCESS);
        if (ev.getHand() != InteractionHand.MAIN_HAND || occupe(p) || Protection.protege(p)) return;
        // pas de dialogue pour echapper a un combat : il rend invulnerable
        String danger = Protection.danger(p);
        if (danger != null) {
            p.displayClientMessage(Component.literal(danger), true);
            return;
        }
        ouvrir(p, nom, ev.getTarget());
    }

    private static void tick(ServerTickEvent.Post ev) {
        if (SESSIONS.isEmpty() || ev.getServer().getTickCount() % 10 != 0) return;
        for (Map.Entry<UUID, Session> en : SESSIONS.entrySet()) {
            ServerPlayer p = ev.getServer().getPlayerList().getPlayer(en.getKey());
            Session s = en.getValue();
            if (p == null) {
                SESSIONS.remove(en.getKey());
                for (UUID u : s.spectateurs) retirerSpectateur(u, ev.getServer().getPlayerList().getPlayer(u));
                continue;
            }
            Entity pnj = s.entite >= 0 ? p.serverLevel().getEntity(s.entite) : null;
            if (s.entite >= 0 && (pnj == null || !pnj.isAlive() || pnj.distanceTo(p) > DISTANCE_MAX)) {
                fermer(p);
                continue;
            }
            Entity centre = pnj != null ? pnj : p;
            for (UUID u : s.spectateurs) {
                ServerPlayer a = ev.getServer().getPlayerList().getPlayer(u);
                if (a == null || a.level() != p.level() || !a.isAlive() || a.distanceTo(centre) > DISTANCE_ALLIES_MAX) retirerSpectateur(u, a);
            }
        }
    }

    // ---------- outils json ----------
    private static String chaine(JsonObject o, String cle) {
        return o.has(cle) ? o.get(cle).getAsString() : null;
    }

    private static boolean bool(JsonObject o, String cle) {
        return o.has(cle) && o.get(cle).getAsBoolean();
    }

    private static List<String> liste(JsonObject o, String cle) {
        if (!o.has(cle)) return List.of();
        JsonElement el = o.get(cle);
        if (!el.isJsonArray()) return List.of(el.getAsString());
        List<String> l = new ArrayList<>();
        el.getAsJsonArray().forEach(x -> l.add(x.getAsString()));
        return l;
    }
}
