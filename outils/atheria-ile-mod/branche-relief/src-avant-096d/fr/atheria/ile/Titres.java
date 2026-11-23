package fr.atheria.ile;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import net.minecraft.ChatFormatting;
import net.minecraft.network.chat.Component;
import net.minecraft.network.protocol.game.ClientboundSetSubtitleTextPacket;
import net.minecraft.network.protocol.game.ClientboundSetTitleTextPacket;
import net.minecraft.network.protocol.game.ClientboundSetTitlesAnimationPacket;
import net.minecraft.server.level.ServerPlayer;
import net.minecraft.world.level.Level;
import net.neoforged.neoforge.network.PacketDistributor;

import java.text.Normalizer;
import java.util.*;

/**
 * 0.7.4 : titres d'entree (lieu nomme > ville > region), decides par le serveur, affiches par le client (TitresClient).
 * Remplace les titres vanilla de la 0.4 ; un client sans le canal recoit encore l'ancien titre vanilla.
 * Anti-spam : rester ~5 s dans le lieu, pas deux fois le meme titre en 5 min, rien en combat ou en deplacement rapide.
 */
final class Titres {
    private Titres() {}

    /** un titre possible : rectangles (lieux, villes) ou region entiere */
    private static final class Entree {
        final int genre; String titre, sousTitre;
        int style = ReseauIle.STYLE_DEFAUT, couleurTitre = ReseauIle.COULEUR_DEFAUT, couleurTraits = ReseauIle.COULEUR_DEFAUT;
        String ornement = "";
        boolean masque;
        final List<int[]> rects = new ArrayList<>();     // x1, z1, x2, z2 (marge comprise, x2/z2 exclus)
        final List<double[]> disques = new ArrayList<>(); // x, z, rayon
        Entree(int genre, String titre, String sousTitre) { this.genre = genre; this.titre = titre; this.sousTitre = sousTitre; }
        boolean contient(int x, int z) {
            for (int i = 0; i < rects.size(); i++) { int[] r = rects.get(i); if (x >= r[0] && x < r[2] && z >= r[1] && z < r[3]) return true; }
            for (int i = 0; i < disques.size(); i++) { double[] d = disques.get(i); double dx = x - d[0], dz = z - d[1]; if (dx * dx + dz * dz <= d[2] * d[2]) return true; }
            return false;
        }
    }

    private static final class Etat {
        int candidat = -1, affiche = -1;
        long depuis, dernier = Long.MIN_VALUE / 2, coup = Long.MIN_VALUE / 2;
        double px = Double.NaN, pz;
        long[] vu;
    }

    /** noms de zones de biome qui sont des villes, et leur titre */
    private static final Map<String, String> VILLES_DEFAUT = Map.of("Mamoudzou", "Mamoudzou", "Majicavo", "Majicavo", "Port de Longoni", "Longoni");
    /** accents des noms de regions.json (ecrits sans accents) */
    private static final Map<String, String> ACCENTS = new HashMap<>();
    static {
        String[][] a = {{"Benara", "Bénara"}, {"marche", "marché"}, {"cite", "cité"}, {"cache", "caché"}, {"Ilot", "Îlot"}, {"emetteur", "émetteur"},
                {"fantome", "fantôme"}, {"miniere", "minière"}, {"pecheurs", "pêcheurs"}, {"a", "à"}, {"facade", "façade"}, {"Barrage", "Barrage"},
                {"Pecheurs", "Pêcheurs"}, {"Village", "Village"}, {"Fundi", "Fundi"},
                {"Emetteur", "Émetteur"}, {"Cite", "Cité"}, {"Vahibe", "Vahibé"}, {"Kaweni", "Kawéni"}, {"Dembeni", "Dembéni"}};
        for (String[] p : a) ACCENTS.put(p[0], p[1]);
    }
    /** lots techniques (reperes de construction) : jamais de titre ; la config peut en ajouter ("exclus") */
    // decision de Mika (13/11) : seulement les lieux-dits importants ; ni lieux secrets ni petits lieux
    private static final Set<String> EXCLUS_DEFAUT = Set.of(
            // reperes techniques
            "Enceinte de Longoni", "Point haut SO de l'enceinte", "Mamoudzou immeuble voisin du toit",
            // lieux secrets
            "Camp caché des Goblini", "Champ de mines", "Labo 7", "Crique des contrebandiers", "Bunker PAF", "Bouche des veilleurs", "Relais ch3",
            // trop petits ou secondaires (la region ou la ville voisine suffit)
            "Tombe de Rayade", "Station radio du Bénara", "Phare", "Barge", "Îlot de la ICE");
    /** renommages par defaut (liste validee le 13/11) : titre d'origine -> {titre, sous-titre} ; la config "personnalises" passe avant */
    private static final Map<String, String[]> RENOMMAGES = Map.of("Îlot de la ICE", new String[]{"Base de la ICE", ""}, "Parc de Zamani", new String[]{"Parc de Zamani", ""});
    private static final Map<String, Integer> STYLES = Map.of("centre_traits", ReseauIle.STYLE_CENTRE_TRAITS, "bas_gauche", ReseauIle.STYLE_BAS_GAUCHE, "centre_souligne", ReseauIle.STYLE_CENTRE_SOULIGNE);
    private static final Set<String> ORNEMENTS = Set.of("✦", "◆", "⚓", "✕");
    /** jamais de noms religieux dans les titres */
    private static final String[] INTERDITS = {"eglise", "mosquee", "chapelle", "temple", "cathedrale", "mausolee", "saint", "sainte", "dieu", "allah"};

    private static final Map<UUID, Etat> ETATS = new HashMap<>();
    private static CarteIle carteConf;
    private static boolean actifs;
    private static int intervalle;
    private static long stabilite, oubli, delaiMin, combat;
    private static double vitesseMax;
    private static Entree[] entrees;      // [0, nRegions) regions, puis villes, puis lieux
    private static int nRegions, debutVilles, debutLieux;
    private static ReseauIle.TitreLieu[] paquets;
    private static Component[] vTitres, vSous;

    static String accents(String s) {
        StringBuilder b = new StringBuilder(s.length() + 4);
        int i = 0;
        while (i < s.length()) {
            int j = i;
            while (j < s.length() && Character.isLetter(s.charAt(j))) j++;
            if (j > i) { String m = s.substring(i, j); b.append(ACCENTS.getOrDefault(m, m)); i = j; }
            else { b.append(s.charAt(i)); i++; }
        }
        return b.toString();
    }

    private static boolean interdit(String s) {
        String n = Normalizer.normalize(s, Normalizer.Form.NFD).replaceAll("\\p{M}", "").toLowerCase(Locale.ROOT);
        for (String m : n.split("[^a-z]+")) for (String x : INTERDITS) if (m.equals(x)) return true;
        return false;
    }

    /** "Coconi (Refuge, champs)" -> {"Coconi", "Refuge, champs"} ; "Mtsamboro, ville morte" -> {"Mtsamboro", "ville morte"} */
    static String[] decouper(String nom) {
        String t = nom.trim(), s = "";
        int p = t.indexOf('('), v = t.indexOf(',');
        if (p > 0 && (v < 0 || p < v)) { int q = t.indexOf(')', p); s = t.substring(p + 1, q > p ? q : t.length()).trim(); t = t.substring(0, p).trim(); }
        else if (v > 0) { s = t.substring(v + 1).trim(); t = t.substring(0, v).trim(); }
        if (!s.isEmpty()) s = Character.toUpperCase(s.charAt(0)) + s.substring(1);
        return new String[]{accents(t), accents(s)};
    }

    private static void lireConfig(CarteIle c) {
        carteConf = c;
        JsonObject t = c.config.has("titres_regions") && c.config.get("titres_regions").isJsonObject() ? c.config.getAsJsonObject("titres_regions") : new JsonObject();
        actifs = !t.has("actif") || t.get("actif").getAsBoolean();
        intervalle = 5;
        stabilite = 20L * Math.max(1, entier(t, "stabilite_secondes", 5));
        oubli = 20L * Math.max(0, entier(t, "oubli_secondes", 300));
        delaiMin = 20L * Math.max(0, entier(t, "delai_min_secondes", 8));
        combat = 20L * Math.max(0, entier(t, "combat_secondes", 5));
        vitesseMax = t.has("vitesse_max_blocs_s") ? t.get("vitesse_max_blocs_s").getAsDouble() : 14.0;
        int marge = Math.max(0, entier(t, "marge_lieux_blocs", 24));
        Set<String> exclus = new HashSet<>(EXCLUS_DEFAUT);
        if (t.has("exclus") && t.get("exclus").isJsonArray()) for (JsonElement x : t.getAsJsonArray("exclus")) exclus.add(x.getAsString());
        Map<String, String> villes = new LinkedHashMap<>(VILLES_DEFAUT);
        if (t.has("villes") && t.get("villes").isJsonObject()) for (Map.Entry<String, JsonElement> e : t.getAsJsonObject("villes").entrySet()) villes.put(e.getKey(), e.getValue().getAsString());

        List<Entree> l = new ArrayList<>();
        nRegions = c.regions.size();
        for (int r = 0; r < nRegions; r++) {
            CarteIle.Region g = c.regions.get(r);
            l.add(new Entree(ReseauIle.REGION, accents(g.titre), g.sousTitre == null ? "" : g.sousTitre));
        }
        // villes : zones de biome nommees comme une ville
        debutVilles = l.size();
        Map<String, Entree> parTitre = new HashMap<>();
        int nz = c.zoneNom == null ? 0 : c.zoneNom.length;
        for (int i = 0; i < nz; i++) {
            String titre = villes.get(c.zoneNom[i]);
            if (titre == null) continue;
            Entree e = parTitre.get(titre);
            if (e == null) { e = new Entree(ReseauIle.VILLE, accents(titre), ""); parTitre.put(titre, e); l.add(e); }
            ajouterZone(c, i, e, 0);
        }
        // lieux : lots nommes (titre avant la virgule ou la parenthese) et zones nommees qui ne sont pas des villes
        debutLieux = l.size();
        for (Lot lot : c.lots) {
            String[] ts = decouper(lot.nom);
            if (ts[0].length() < 3 || interdit(ts[0] + " " + ts[1]) || exclus.contains(ts[0]) || exclus.contains(lot.nom)) continue;
            Entree v = parTitre.get(ts[0]);
            if (v != null && v.genre == ReseauIle.VILLE) continue; // un lot de la ville : c'est le titre de la ville
            Entree e = parTitre.get(ts[0]);
            if (e == null) { e = new Entree(ReseauIle.LIEU, ts[0], ts[1]); parTitre.put(ts[0], e); l.add(e); }
            e.rects.add(new int[]{lot.x1 - marge, lot.z1 - marge, lot.x2 + marge, lot.z2 + marge});
        }
        for (int i = 0; i < nz; i++) {
            if (villes.containsKey(c.zoneNom[i]) || interdit(c.zoneNom[i])) continue;
            String[] ts = decouper(c.zoneNom[i]);
            if (exclus.contains(ts[0]) || exclus.contains(c.zoneNom[i])) continue;
            Entree e = parTitre.get(ts[0]);
            if (e == null) { e = new Entree(ReseauIle.LIEU, ts[0], ts[1]); parTitre.put(ts[0], e); l.add(e); }
            ajouterZone(c, i, e, 0);
        }
        // identite propre de chaque endroit : renommages par defaut, puis "personnalises" de la config (cle = titre par defaut)
        JsonObject perso = t.has("personnalises") && t.get("personnalises").isJsonObject() ? t.getAsJsonObject("personnalises") : new JsonObject();
        for (Entree e : l) {
            String origine = e.titre;
            String[] rn = e.genre == ReseauIle.LIEU ? RENOMMAGES.get(origine) : null;
            if (rn != null) { e.titre = rn[0]; e.sousTitre = rn[1]; }
            JsonObject o = null;
            if (perso.has(origine) && perso.get(origine).isJsonObject()) o = perso.getAsJsonObject(origine);
            else if (perso.has(e.titre) && perso.get(e.titre).isJsonObject()) o = perso.getAsJsonObject(e.titre);
            if (o != null) personnaliser(e, o);
        }
        entrees = l.toArray(new Entree[0]);
        paquets = new ReseauIle.TitreLieu[entrees.length];
        vTitres = new Component[entrees.length];
        vSous = new Component[entrees.length];
        for (int i = 0; i < entrees.length; i++) {
            Entree e = entrees[i];
            paquets[i] = new ReseauIle.TitreLieu(e.titre, e.sousTitre, e.genre, e.style, e.couleurTitre, e.couleurTraits, e.ornement);
            vTitres[i] = Component.literal(entrees[i].titre).withStyle(ChatFormatting.GOLD);
            vSous[i] = entrees[i].sousTitre.isEmpty() ? Component.empty() : Component.literal(entrees[i].sousTitre).withStyle(ChatFormatting.GRAY);
        }
        ETATS.clear();
        CarteIle.LOG.info("[atheria_ile] titres d'entree : {} regions, {} villes, {} lieux", nRegions, debutLieux - debutVilles, entrees.length - debutLieux);
    }

    /** champs facultatifs : titre, sous_titre, style, couleur_titre, couleur_traits, ornement, masque ; tout champ absent garde sa valeur */
    private static void personnaliser(Entree e, JsonObject o) {
        if (o.has("titre") && !o.get("titre").isJsonNull()) {
            String v = o.get("titre").getAsString().trim();
            if (v.isEmpty() || interdit(v)) CarteIle.LOG.warn("[atheria_ile] titre '{}' : titre personnalise vide ou interdit, ignore", e.titre);
            else e.titre = v;
        }
        if (o.has("sous_titre") && !o.get("sous_titre").isJsonNull()) {
            String v = o.get("sous_titre").getAsString().trim();
            if (interdit(v)) CarteIle.LOG.warn("[atheria_ile] titre '{}' : sous-titre interdit, ignore", e.titre); else e.sousTitre = v;
        }
        if (o.has("style") && !o.get("style").isJsonNull()) {
            Integer st = STYLES.get(o.get("style").getAsString().trim());
            if (st == null) CarteIle.LOG.warn("[atheria_ile] titre '{}' : style '{}' inconnu (centre_traits, bas_gauche, centre_souligne)", e.titre, o.get("style").getAsString());
            else e.style = st;
        }
        e.couleurTitre = couleur(o, "couleur_titre", e.couleurTitre, e.titre);
        e.couleurTraits = couleur(o, "couleur_traits", e.couleurTraits, e.titre);
        if (o.has("ornement") && !o.get("ornement").isJsonNull()) {
            String v = o.get("ornement").getAsString().trim();
            if (v.isEmpty() || v.equals("aucun")) e.ornement = "";
            else if (ORNEMENTS.contains(v)) e.ornement = v;
            else CarteIle.LOG.warn("[atheria_ile] titre '{}' : ornement '{}' inconnu (✦ ◆ ⚓ ✕ ou aucun)", e.titre, v);
        }
        if (o.has("masque") && !o.get("masque").isJsonNull()) e.masque = o.get("masque").getAsBoolean();
    }

    /** "#RRGGBB" -> 0xRRGGBB ; absent ou invalide : valeur gardee */
    private static int couleur(JsonObject o, String cle, int defaut, String titre) {
        if (!o.has(cle) || o.get(cle).isJsonNull()) return defaut;
        String v = o.get(cle).getAsString().trim();
        if (v.startsWith("#")) v = v.substring(1);
        if (v.length() == 6) try { return Integer.parseInt(v, 16); } catch (NumberFormatException ignore) { }
        CarteIle.LOG.warn("[atheria_ile] titre '{}' : {} '{}' invalide (format #RRGGBB)", titre, cle, o.get(cle).getAsString());
        return defaut;
    }

    private static void ajouterZone(CarteIle c, int i, Entree e, int marge) {
        if (c.zoneRect[i]) e.rects.add(new int[]{(int) c.zoneX1[i] - marge, (int) c.zoneZ1[i] - marge, (int) c.zoneX2[i] + marge, (int) c.zoneZ2[i] + marge});
        else e.disques.add(new double[]{c.zoneX[i], c.zoneZ[i], c.zoneRayon[i] + marge});
    }

    private static int entier(JsonObject o, String cle, int defaut) {
        return o.has(cle) && !o.get(cle).isJsonNull() ? o.get(cle).getAsInt() : defaut;
    }

    /** cle du titre a cet endroit : lieu > ville > region ; -1 en mer */
    private static int cle(CarteIle c, int x, int z) {
        for (int i = debutLieux; i < entrees.length; i++) if (entrees[i].contient(x, z)) return i;
        if (c.distanceBlocs(x, z) < 0) return -1;
        for (int i = debutVilles; i < debutLieux; i++) if (entrees[i].contient(x, z)) return i;
        int r = c.region(x, z);
        return r >= 0 && r < nRegions ? r : -1;
    }

    static void tick(ServerPlayer p) {
        CarteIle c = CarteIle.active();
        if (c == null) return;
        if (c != carteConf) lireConfig(c);
        if (!actifs || p.tickCount % intervalle != 0 || p.level().dimension() != Level.OVERWORLD) return;
        Etat e = ETATS.get(p.getUUID());
        if (e == null || e.vu.length != entrees.length) {
            e = new Etat();
            e.vu = new long[entrees.length];
            Arrays.fill(e.vu, Long.MIN_VALUE / 2);
            ETATS.put(p.getUUID(), e);
        }
        long now = p.getServer() == null ? p.tickCount : p.getServer().getTickCount();
        if (p.hurtTime > 0) e.coup = now;
        double vitesse = Double.isNaN(e.px) ? 0 : Math.hypot(p.getX() - e.px, p.getZ() - e.pz) * 20.0 / intervalle;
        e.px = p.getX(); e.pz = p.getZ();
        int k = cle(c, p.getBlockX(), p.getBlockZ());
        if (k < 0) { e.candidat = -1; return; }
        if (k == e.affiche) { e.candidat = -1; e.vu[k] = now; return; }
        if (k != e.candidat) { e.candidat = k; e.depuis = now; return; }
        if (now - e.depuis < stabilite) return;
        // reporte (le candidat reste) : combat, vol rapide ou vehicule rapide
        if (now - e.coup < combat || p.isFallFlying() || vitesse > vitesseMax) return;
        if (now - e.dernier < delaiMin) return;
        boolean recent = now - e.vu[k] < oubli;
        e.affiche = k;
        e.vu[k] = now;
        e.candidat = -1;
        if (recent || entrees[k].masque) return;
        e.dernier = now;
        if (p.connection.hasChannel(ReseauIle.TitreLieu.TYPE)) {
            PacketDistributor.sendToPlayer(p, paquets[k]);
        } else {
            p.connection.send(new ClientboundSetTitlesAnimationPacket(10, 70, 20));
            p.connection.send(new ClientboundSetSubtitleTextPacket(vSous[k]));
            p.connection.send(new ClientboundSetTitleTextPacket(vTitres[k]));
        }
    }

    static void quitter(UUID id) { ETATS.remove(id); }

    static void vider() { ETATS.clear(); carteConf = null; }

    /** pour les maquettes et les tests : envoie tout de suite le titre de l'endroit du joueur (sans anti-spam) */
    static int montrer(ServerPlayer p) {
        CarteIle c = CarteIle.active();
        if (c == null) return 0;
        if (c != carteConf) lireConfig(c);
        int k = cle(c, p.getBlockX(), p.getBlockZ());
        if (k < 0 || entrees[k].masque) return 0;
        if (p.connection.hasChannel(ReseauIle.TitreLieu.TYPE)) PacketDistributor.sendToPlayer(p, paquets[k]);
        return 1;
    }
}
