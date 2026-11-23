package fr.atheria.ile;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import net.minecraft.ChatFormatting;
import net.minecraft.network.chat.Component;
import net.minecraft.network.protocol.game.ClientboundSetSubtitleTextPacket;
import net.minecraft.network.protocol.game.ClientboundSetTitleTextPacket;
import net.minecraft.network.protocol.game.ClientboundSetTitlesAnimationPacket;
import net.minecraft.server.MinecraftServer;
import net.minecraft.server.level.ServerPlayer;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.border.WorldBorder;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Ce que le joueur voit de l'ile : titre de region a l'ecran (envoye par le serveur, rien a installer),
 * bord du monde, reperes partages pour Xaero's Minimap.
 */
final class Jeu {
    private Jeu() {}

    // ------------------------------------------------------------------ titres de region

    private static final class Etat {
        int candidat = -1, stable, affiche = -1;
        long dernier = Long.MIN_VALUE / 2;
        long[] vu;
    }

    private static final Map<UUID, Etat> ETATS = new HashMap<>();
    private static CarteIle carteConf;
    private static boolean titresActifs;
    private static int intervalle, stabilite;
    private static long delaiMin, oubli;
    private static Component[] titres, sousTitres;

    private static void lireConfig(CarteIle c) {
        carteConf = c;
        JsonObject t = c.config.has("titres_regions") && c.config.get("titres_regions").isJsonObject() ? c.config.getAsJsonObject("titres_regions") : new JsonObject();
        titresActifs = !t.has("actif") || t.get("actif").getAsBoolean();
        intervalle = Math.max(5, entier(t, "intervalle_ticks", 20));
        stabilite = Math.max(1, entier(t, "stabilite_controles", 3));
        delaiMin = 20L * Math.max(0, entier(t, "delai_min_secondes", 20));
        oubli = 20L * Math.max(0, entier(t, "oubli_secondes", 300));
        int n = c.regions.size();
        titres = new Component[n];
        sousTitres = new Component[n];
        for (int r = 0; r < n; r++) {
            CarteIle.Region g = c.regions.get(r);
            titres[r] = Component.literal(g.titre).withStyle(ChatFormatting.GOLD);
            sousTitres[r] = g.sousTitre == null ? Component.empty() : Component.literal(g.sousTitre).withStyle(ChatFormatting.GRAY);
        }
        ETATS.clear();
    }

    private static int entier(JsonObject o, String cle, int defaut) {
        return o.has(cle) && !o.get(cle).isJsonNull() ? o.get(cle).getAsInt() : defaut;
    }

    /** Appele a chaque tick de joueur : ne travaille qu'une fois par intervalle, sans allocation hors arrivee du joueur. */
    static void tickJoueur(ServerPlayer p) {
        CarteIle c = CarteIle.active();
        if (c == null) return;
        if (c != carteConf) lireConfig(c);
        if (!titresActifs || p.tickCount % intervalle != 0 || p.level().dimension() != Level.OVERWORLD) return;
        Etat e = ETATS.get(p.getUUID());
        if (e == null || e.vu.length != titres.length) {
            e = new Etat();
            e.vu = new long[titres.length];
            Arrays.fill(e.vu, Long.MIN_VALUE / 2);
            ETATS.put(p.getUUID(), e);
        }
        long now = p.getServer() == null ? p.tickCount : p.getServer().getTickCount();
        int bx = p.getBlockX(), bz = p.getBlockZ();
        // en mer (lagon, ocean) : pas de titre, la region affichee reste memorisee
        if (c.distanceBlocs(bx, bz) < 0) { e.candidat = -1; e.stable = 0; return; }
        int r = c.region(bx, bz);
        if (r == e.affiche) { e.candidat = -1; e.stable = 0; e.vu[r] = now; return; }
        if (r != e.candidat) { e.candidat = r; e.stable = 1; return; }
        if (++e.stable < stabilite) return;
        if (now - e.dernier < delaiMin) return;          // anti-spam : le titre attend, il s'affichera si le joueur reste
        boolean recent = now - e.vu[r] < oubli;           // hysteresis : retour dans une region vue il y a peu = pas de titre
        e.affiche = r;
        e.vu[r] = now;
        e.candidat = -1;
        e.stable = 0;
        if (recent) return;
        e.dernier = now;
        p.connection.send(new ClientboundSetTitlesAnimationPacket(10, 70, 20));
        p.connection.send(new ClientboundSetSubtitleTextPacket(sousTitres[r]));
        p.connection.send(new ClientboundSetTitleTextPacket(titres[r]));
    }

    static void quitter(UUID id) { ETATS.remove(id); }

    static void vider() { ETATS.clear(); carteConf = null; }

    // ------------------------------------------------------------------ bord du monde

    /** Bord du monde centre sur l'ile ("bordure_monde_blocs", 0 = ne rien toucher). Jamais si un admin l'a deja regle. */
    static void bordure(MinecraftServer s) {
        CarteIle c = CarteIle.active();
        if (c == null) return;
        double taille = c.config.has("bordure_monde_blocs") && !c.config.get("bordure_monde_blocs").isJsonNull() ? c.config.get("bordure_monde_blocs").getAsDouble() : 0;
        if (taille <= 0) return;
        WorldBorder wb = s.overworld().getWorldBorder();
        if (wb.getSize() < 5.9e7) {
            CarteIle.LOG.info("[atheria_ile] bord du monde deja regle ({} blocs) : garde tel quel", (long) wb.getSize());
            return;
        }
        wb.setCenter(0, 0);
        wb.setSize(taille);
        CarteIle.LOG.info("[atheria_ile] bord du monde pose : {} blocs centre sur 0,0 (la carte fait {} blocs)", (long) taille, c.w * c.bpp);
    }

    // ------------------------------------------------------------------ reperes Xaero

    /** Lignes de chat "xaero-waypoint:..." : Xaero's Minimap propose de les ajouter d'un clic. */
    static int reperes(ServerPlayer p) {
        CarteIle c = CarteIle.active();
        if (c == null) { p.sendSystemMessage(Component.literal("Pas d'ile dans ce monde.").withStyle(ChatFormatting.RED)); return 0; }
        int[][] centres = c.centresRegions();
        int n = 0;
        p.sendSystemMessage(Component.literal("Reperes de l'ile (Xaero's Minimap : cliquez pour ajouter)").withStyle(ChatFormatting.GOLD));
        for (int r = 0; r < centres.length; r++) {
            if (centres[r] == null) continue;
            CarteIle.Region g = c.regions.get(r);
            p.sendSystemMessage(Component.literal(ligne(g.titre, centres[r][0], centres[r][1], couleurXaero(g.couleur))));
            n++;
        }
        if (c.config.has("reperes") && c.config.get("reperes").isJsonArray()) {
            for (JsonElement el : (JsonArray) c.config.get("reperes")) {
                JsonObject o = el.getAsJsonObject();
                if (!o.has("nom") || !o.has("x") || !o.has("z")) continue;
                p.sendSystemMessage(Component.literal(ligne(o.get("nom").getAsString(), o.get("x").getAsInt(), o.get("z").getAsInt(),
                        o.has("couleur") ? o.get("couleur").getAsInt() : 14)));
                n++;
            }
        }
        return n;
    }

    private static String ligne(String nom, int x, int z, int couleur) {
        String propre = nom.replace(':', ' ').trim();
        StringBuilder ini = new StringBuilder();
        for (String m : propre.split("[ '\\-]+")) if (!m.isEmpty() && Character.isLetter(m.charAt(0)) && ini.length() < 2 && m.length() > 2) ini.append(Character.toUpperCase(m.charAt(0)));
        if (ini.length() == 0) ini.append('?');
        return "xaero-waypoint:" + propre + ":" + ini + ":" + x + ":~:" + z + ":" + couleur + ":false:0:Internal-overworld-waypoints";
    }

    /** couleur Xaero (0..15) la plus proche de la couleur de la region sur la carte */
    private static int couleurXaero(int rgb) {
        int[] pal = {0x000000, 0x0000AA, 0x00AA00, 0x00AAAA, 0xAA0000, 0xAA00AA, 0xFFAA00, 0xAAAAAA, 0x555555, 0x5555FF, 0x55FF55, 0x55FFFF, 0xFF5555, 0xFF55FF, 0xFFFF55, 0xFFFFFF};
        int best = 14, bd = Integer.MAX_VALUE;
        for (int i = 1; i < pal.length; i++) {
            int dr = ((rgb >> 16) & 255) - ((pal[i] >> 16) & 255), dg = ((rgb >> 8) & 255) - ((pal[i] >> 8) & 255), db = (rgb & 255) - (pal[i] & 255);
            int d = dr * dr + dg * dg + db * db;
            if (d < bd) { bd = d; best = i; }
        }
        return best;
    }

    // ------------------------------------------------------------------ messages clairs

    /** Le datapack de l'ile est dans le monde mais la carte n'a pas pu etre chargee : on le dit clairement. */
    static void avertirSiCarteManquante(MinecraftServer s) {
        if (CarteIle.tentee() && CarteIle.active() == null) {
            CarteIle.LOG.error("[atheria_ile] ==================================================================");
            CarteIle.LOG.error("[atheria_ile] ATTENTION : le datapack de l'ile est dans ce monde mais la carte n'a pas pu etre chargee.");
            CarteIle.LOG.error("[atheria_ile] Les nouveaux chunks sont generes SANS l'ile (terrain normal). Voir le message plus haut.");
            CarteIle.LOG.error("[atheria_ile] ==================================================================");
        }
    }

    static void avertirOperateur(ServerPlayer p) {
        if (CarteIle.tentee() && CarteIle.active() == null && p.hasPermissions(2)) {
            p.sendSystemMessage(Component.literal("[Atheria ile] Carte de l'ile introuvable ou illisible : les nouveaux chunks sont generes sans l'ile. Voir les logs du serveur.").withStyle(ChatFormatting.RED));
        }
    }
}
