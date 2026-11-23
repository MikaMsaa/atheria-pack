package fr.atheria.ile;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import net.neoforged.fml.loading.FMLPaths;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Carte de l'île : lit config/atheria_ile/carte.png + regions.json.
 * Fournit (1) la valeur de "continents" qui dessine côtes, lagon et relief,
 * (2) la région (et donc les biomes autorisés) en tout point.
 */
public final class CarteIle {
    public static final Logger LOG = LoggerFactory.getLogger("atheria_ile");

    private static volatile CarteIle active;
    private static volatile boolean tentee;

    /** La carte, seulement si le monde courant utilise la fonction de densité de l'île. */
    public static CarteIle active() { return active; }

    /** Appelée quand le datapack du monde déclare la fonction de densité : charge la carte une fois. */
    public static synchronized CarteIle activer() {
        if (active != null) return active;
        if (tentee) return null;
        tentee = true;
        Path dossier = FMLPaths.CONFIGDIR.get().resolve("atheria_ile");
        String manque = !Files.isDirectory(dossier) ? "le dossier " + dossier + " n'existe pas"
                : !Files.isRegularFile(dossier.resolve("regions.json")) ? "regions.json manque dans " + dossier
                : !Files.isRegularFile(dossier.resolve("carte.png")) ? "carte.png manque dans " + dossier : null;
        if (manque != null) {
            LOG.error("[atheria_ile] carte de l'ile introuvable : {}. Le monde sera genere SANS l'ile (terrain normal). "
                    + "Remettez carte.png, regions.json (et relief.png) dans config/atheria_ile puis redemarrez AVANT d'explorer.", manque);
            return null;
        }
        try {
            active = new CarteIle(dossier);
            LOG.info("[atheria_ile] carte chargee : {}x{} px, {} blocs/px, {} regions", active.w, active.h, active.bpp, active.regions.size());
            Exclusions.ecrire(active);
        } catch (com.google.gson.JsonParseException e) {
            LOG.error("[atheria_ile] regions.json mal forme ({}) : le monde sera genere SANS l'ile. Corrigez le fichier puis redemarrez.", e.getMessage());
        } catch (Exception e) {
            LOG.error("[atheria_ile] carte illisible dans {} ({}) : le monde sera genere SANS l'ile", dossier, e.toString(), e);
        }
        return active;
    }

    /** Vrai si un monde a demande la carte (datapack de l'ile present). */
    public static boolean tentee() { return tentee; }

    /** Remet à zéro entre deux mondes (solo) pour qu'un autre monde ne soit jamais modifié. */
    public static synchronized void desactiver() {
        active = null;
        tentee = false;
    }

    public static final int OCEAN = 0, LAGON = 1, RECIF = 2;
    /** classes temporaires au chargement (remplacées par la région voisine, l'eau douce est gardée à part) */
    private static final int CL_RIVIERE = 126, CL_LAC = 127;
    /** profils de côte : {plancher au bord, plancher à 500 blocs, plafond (9 = aucun)} en continentalité Tectonic (côte ~ -0.155) */
    private static final String[] COTES = {"plage", "falaise", "vase", "roche"};
    private static final float[][] PROFILS = {{-0.148f, -0.04f, 9f}, {-0.03f, 0.03f, 9f}, {-0.152f, -0.125f, -0.112f}, {-0.10f, -0.02f, 9f}};

    static int indexCote(String c) {
        for (int i = 0; i < COTES.length; i++) if (COTES[i].equals(c)) return i;
        return -1;
    }

    public static final class Region {
        public final String nom;
        public final List<String> biomes = new ArrayList<>();
        public final List<Integer> poids = new ArrayList<>();
        public final String montagne;
        public final double relief;
        public final int cellule;
        public final int couleur;
        /** biome de plage de la région ; plageDefinie=false : choix automatique (beach, ou snowy_beach si froide) ; plage=null et plageDefinie : pas de plage */
        public String plage;
        public boolean plageDefinie;
        /** profil de cote : plage, falaise, vase, roche */
        public String cote = "plage";
        /** chenaux et mares de la region (0 = aucun, 1 = mangrove), plus denses pres de la cote */
        public double chenaux;
        /** sous-biomes en taches (au plus 4) : biome, part de la region (0..0.5), taille des taches (blocs) */
        public final List<String> taches = new ArrayList<>();
        public final List<Double> tachesPart = new ArrayList<>();
        public final List<Integer> tachesTaille = new ArrayList<>();
        /** titre affiche a l'ecran (par defaut : le nom sans la parenthese), sous-titre facultatif, repere force (x, z) ou null */
        public String titre, sousTitre;
        public int[] repere;
        /** biomes de grottes de la region (remplacent les biomes de grottes d'origine) */
        public final List<String> grottes = new ArrayList<>();
        public final List<Integer> grottesPoids = new ArrayList<>();
        Region(String nom, String montagne, double relief, int cellule, int couleur) {
            this.nom = nom; this.montagne = montagne; this.relief = relief; this.cellule = Math.max(32, cellule); this.couleur = couleur;
        }
    }

    public final Path dossier;
    public final JsonObject config;
    public final int w, h, bpp;
    public final double origineX, origineZ;
    public final long graine;
    public final double deformation;
    /** fondu des frontieres de regions (blocs, 0 = desactive) et taille de ses taches */
    public final double fondu, tailleFondu;
    public final List<Region> regions = new ArrayList<>();
    /** classe par pixel : 0 océan, 1 lagon, 2 récif, 3+k région k */
    final byte[] classe;
    /** distance signée à la côte en pixels (positive sur terre) */
    final float[] distance;
    /** région de la terre la plus proche, pour chaque pixel */
    final byte[] regionProche;
    /** numero de la terre (ile) la plus proche, pour chaque pixel : le fondu ne traverse jamais la mer */
    final int[] ileProche;
    /** relief des régions, lissé */
    final float[] relief;
    /** relief dessiné (relief.png, 0 plat .. 1 sommet), null si absent */
    final float[] hauteur;
    /** distance (px) aux rivières et aux lacs dessinés ; grande valeur s'il n'y en a pas */
    final float[] dRiviere, dLac;
    /** profil de côte lissé par pixel : plancher au bord, plancher à 500 blocs, plafond (vase) */
    final float[] coteBas, coteHaut, cotePlafond;
    /** intensite des chenaux par pixel (lissee), null si aucune region n'en a */
    final float[] chenauxPx;
    public final double chenauxLargeur, chenauxFond;
    /** biomes de passage entre deux regions voisines : regle la plus proche par pixel (-1 aucune) et distance (px) a l'autre region */
    final byte[] passageRegle;
    final float[] passageDist;
    public final List<String> passageBiome = new ArrayList<>();
    final List<int[]> passagePaire = new ArrayList<>();
    final List<Double> passageLargeur = new ArrayList<>();
    /** lagon vivant : biomes du lagon, du recif et des passes ; passes plus profondes (largeur en blocs, continentalite du fond) */
    public final String lagonBiome, recifBiome, passesBiome;
    /** zones rondes a biome force ("zones_biome") : centre, rayon et bord bruite (blocs), biome, nom */
    public final double[] zoneX, zoneZ, zoneRayon, zoneBord;
    /** zones "forme": "rectangle" : [x1, x2) x [z1, z2) toujours couvert, bord bruite vers l'exterieur (0..bord) */
    public final boolean[] zoneRect;
    public final double[] zoneX1, zoneZ1, zoneX2, zoneZ2;
    public final String[] zoneBiome, zoneNom;
    /** false : la zone remplace aussi la bande de plage (jamais l'eau ni le lagon) */
    public final boolean[] zonePlage;
    /** true : la zone remplace aussi les biomes d'eau des lacs dessines (terre de la carte), jamais la mer ni le lagon */
    public final boolean[] zoneLacs;
    /** 0.7.1 : "zone_ville": true -> la boite de la zone est ajoutee a zones_villes (le port de Longoni l'est toujours) */
    public final boolean[] zoneVille;
    /** routes dessinees ("routes") */
    public final java.util.List<Route> routes;
    /** lots fixes ("lots") : rien n'y est pose par le mod */
    public final java.util.List<Lot> lots;
    /** volumes souterrains reserves ("volumes_souterrains") */
    public final Volumes volumes;
    /** marge des routes pour les chunks exclus (blocs depuis l'axe) et cles triees des chunks exclus */
    public final int margeRoute;
    final long[] chunksExclus;

    /** vrai si le chunk est exclu (route + marge, lots + marge). Sans allocation. */
    public boolean chunkExclu(int cx, int cz) { return java.util.Arrays.binarySearch(chunksExclus, Exclusions.cle(cx, cz)) >= 0; }

    /** vrai si le bloc est dans un lot (sans la marge) */
    public boolean dansLot(int bx, int bz) {
        for (int i = 0, n = lots.size(); i < n; i++) if (lots.get(i).contient(bx, bz)) return true;
        return false;
    }

    /** 0.5.6 : distance (blocs) au lit d'une riviere dessinee ; tres grande s'il n'y en a pas */
    public double distanceRiviere(int bx, int bz) {
        if (pixelsRiviere == 0) return 1e9;
        double fN = (rnMeandre > 0) ? forceNaturel(bx, bz) : 0;
        return riviereBlocs(bx, bz, fN, (bx + 0.5 - origineX) / bpp, (bz + 0.5 - origineZ) / bpp);
    }

    /** distance au lit dessine (blocs), avec meandres (deformation propre au lit) hors des zones protegees */
    double riviereBlocs(double bx, double bz, double fN, double px, double pz) {
        if (fN > 0 && rnMeandre > 0) {
            double k = fN * rnMeandre / bpp;
            px += k * (0.7 * bruit(bx / 190.0, bz / 190.0, 361) + 0.3 * bruit(bx / 64.0, bz / 64.0, 362));
            pz += k * (0.7 * bruit(bx / 190.0, bz / 190.0, 371) + 0.3 * bruit(bx / 64.0, bz / 64.0, 372));
        }
        return bilineaire(dRiviere, px, pz) * bpp;
    }

    /** rayon du lit (blocs), variable le long de la riviere hors des zones protegees */
    double rayonRiviereA(double bx, double bz, double fN) {
        if (fN <= 0 || rnLargeurVar <= 0) return rayonRiviere;
        return rayonRiviere * (1 + fN * rnLargeurVar * bruit(bx / 170.0, bz / 170.0, 381));
    }

    /** 0.5.6 : distance (blocs) a un lac dessine (0 dedans) ; tres grande s'il n'y en a pas */
    public double distanceLac(int bx, int bz) {
        if (pixelsLac == 0) return 1e9;
        return bilineaire(dLac, (bx + 0.5 - origineX) / bpp, (bz + 0.5 - origineZ) / bpp) * bpp;
    }
    public final double passesLargeur, passesFond;
    public final boolean rivieresAleatoires;
    /** pilotage de l'erosion de Tectonic par relief.png : force (0..1) et |e| vise en plaine (0.05 + erosionPlat) */
    public final double erosionForce, erosionPlat;
    public final double valleeRiviere, rayonRiviere;
    /** 0.8.0 relief naturel (bloc "relief_naturel" de regions.json) ; 0 partout = comportement 0.7.x au bit pres */
    public final double rnWarp, rnCote, rnMicro, rnMeandre, rnLargeurVar, rnTransition;
    /** details de surface par chunk (moyenne d'essais), 0 = aucun */
    public final double detailsDensite;
    long graineDetails(int cx, int cz) { return melange(graine * 0x2545F4914F6CDD1DL + cx * 0x9E3779B97F4A7C15L + cz * 0xC2B2AE3D27D4EB4FL + 77); }
    /** distance (blocs) a la zone protegee (routes + marge, lots + marge, zones_villes, zones rectangles, volumes), grille par chunk */
    float[] protegeDist;
    int pgX0, pgZ0, pgW, pgH;
    public final int pixelsRiviere, pixelsLac;

    private CarteIle(Path dossier) throws Exception {
        this.dossier = dossier;
        try (Reader r = Files.newBufferedReader(dossier.resolve("regions.json"), StandardCharsets.UTF_8)) {
            config = JsonParser.parseReader(r).getAsJsonObject();
        }
        BufferedImage img = ImageIO.read(dossier.resolve("carte.png").toFile());
        if (img == null) throw new IllegalStateException("carte.png n'est pas une image");
        w = img.getWidth();
        h = img.getHeight();
        bpp = config.get("blocs_par_pixel").getAsInt();
        if (bpp < 1) throw new IllegalStateException("blocs_par_pixel doit etre >= 1");
        origineX = -w * bpp / 2.0;
        origineZ = -h * bpp / 2.0;
        graine = config.has("graine") ? config.get("graine").getAsLong() : 1L;
        deformation = config.has("deformation_bords_blocs") ? config.get("deformation_bords_blocs").getAsDouble() : 24.0;
        fondu = config.has("fondu_bords_blocs") && !config.get("fondu_bords_blocs").isJsonNull() ? Math.max(0, config.get("fondu_bords_blocs").getAsDouble()) : 0.0;
        tailleFondu = Math.max(24.0, fondu * 0.4);

        // classes déclarées
        Map<Integer, Integer> parCouleur = new HashMap<>();
        List<int[]> palette = new ArrayList<>(); // {rgb, classe}
        JsonObject classes = config.getAsJsonObject("classes");
        for (Map.Entry<String, JsonElement> e : classes.entrySet()) {
            int rgb = Integer.parseInt(e.getKey().substring(1), 16) & 0xFFFFFF;
            JsonObject c = e.getValue().getAsJsonObject();
            String type = c.get("type").getAsString();
            int cl;
            switch (type) {
                case "ocean" -> cl = OCEAN;
                case "lagon" -> cl = LAGON;
                case "recif" -> cl = RECIF;
                case "riviere" -> cl = CL_RIVIERE;
                case "lac" -> cl = CL_LAC;
                case "region" -> {
                    String montagne = c.has("montagne") && !c.get("montagne").isJsonNull() ? c.get("montagne").getAsString() : null;
                    Region reg = new Region(c.get("nom").getAsString(), montagne,
                            c.has("relief") ? c.get("relief").getAsDouble() : 0.0,
                            c.has("cellule") ? c.get("cellule").getAsInt() : 224, rgb);
                    if (c.has("cote") && !c.get("cote").isJsonNull()) {
                        String ct = c.get("cote").getAsString();
                        if (indexCote(ct) < 0) LOG.warn("[atheria_ile] region '{}' : cote '{}' inconnue (plage, falaise, vase, roche), plage utilisee", reg.nom, ct);
                        else reg.cote = ct;
                    }
                    if (c.has("plage")) {
                        reg.plageDefinie = true;
                        reg.plage = c.get("plage").isJsonNull() ? null : c.get("plage").getAsString();
                    }
                    JsonArray bs = c.getAsJsonArray("biomes");
                    for (JsonElement b : bs) {
                        JsonObject o = b.getAsJsonObject();
                        int p = o.has("poids") ? o.get("poids").getAsInt() : 1;
                        if (p <= 0) continue;
                        reg.biomes.add(o.get("biome").getAsString());
                        reg.poids.add(p);
                    }
                    if (reg.biomes.isEmpty()) throw new IllegalStateException("region sans biome : " + reg.nom);
                    reg.titre = c.has("titre") && !c.get("titre").isJsonNull() ? c.get("titre").getAsString() : reg.nom.replaceAll("\\s*\\(.*\\)\\s*$", "");
                    reg.sousTitre = c.has("sous_titre") && !c.get("sous_titre").isJsonNull() ? c.get("sous_titre").getAsString() : null;
                    if (c.has("repere") && c.get("repere").isJsonObject()) {
                        JsonObject o = c.getAsJsonObject("repere");
                        if (o.has("x") && o.has("z")) reg.repere = new int[]{o.get("x").getAsInt(), o.get("z").getAsInt()};
                    }
                    reg.chenaux = c.has("chenaux") && !c.get("chenaux").isJsonNull() ? Math.max(0, Math.min(2, c.get("chenaux").getAsDouble())) : 0.0;
                    if (c.has("taches") && c.get("taches").isJsonArray()) {
                        for (JsonElement b : c.getAsJsonArray("taches")) {
                            JsonObject o = b.getAsJsonObject();
                            if (!o.has("biome") || o.get("biome").isJsonNull()) continue;
                            if (reg.taches.size() >= 4) { LOG.warn("[atheria_ile] region '{}' : plus de 4 taches, les suivantes sont ignorees", reg.nom); break; }
                            double part = o.has("part") ? o.get("part").getAsDouble() : 0.08;
                            if (part <= 0) continue;
                            reg.taches.add(o.get("biome").getAsString());
                            reg.tachesPart.add(Math.min(0.5, part));
                            reg.tachesTaille.add(o.has("taille_blocs") ? Math.max(16, o.get("taille_blocs").getAsInt()) : 64);
                        }
                    }
                    if (c.has("grottes") && c.get("grottes").isJsonArray()) {
                        for (JsonElement b : c.getAsJsonArray("grottes")) {
                            JsonObject o = b.getAsJsonObject();
                            int p = o.has("poids") ? o.get("poids").getAsInt() : 1;
                            if (p <= 0 || !o.has("biome")) continue;
                            reg.grottes.add(o.get("biome").getAsString());
                            reg.grottesPoids.add(p);
                        }
                    }
                    if (regions.size() >= 120) throw new IllegalStateException("trop de regions (max 120)");
                    regions.add(reg);
                    cl = 2 + regions.size();
                }
                default -> throw new IllegalStateException("type de classe inconnu : " + type);
            }
            parCouleur.put(rgb, cl);
            palette.add(new int[]{rgb, cl});
        }
        if (regions.isEmpty()) throw new IllegalStateException("aucune region declaree");

        // pixels -> classes (couleur exacte, sinon la plus proche)
        int n = w * h;
        classe = new byte[n];
        int approx = 0;
        for (int z = 0; z < h; z++) {
            for (int x = 0; x < w; x++) {
                int rgb = img.getRGB(x, z) & 0xFFFFFF;
                Integer cl = parCouleur.get(rgb);
                if (cl == null) {
                    approx++;
                    int best = OCEAN, bd = Integer.MAX_VALUE;
                    for (int[] p : palette) {
                        int dr = ((rgb >> 16) & 255) - ((p[0] >> 16) & 255);
                        int dg = ((rgb >> 8) & 255) - ((p[0] >> 8) & 255);
                        int db = (rgb & 255) - (p[0] & 255);
                        int d = dr * dr + dg * dg + db * db;
                        if (d < bd) { bd = d; best = p[1]; }
                    }
                    cl = best;
                    parCouleur.put(rgb, cl);
                }
                classe[z * w + x] = (byte) (int) cl;
            }
        }
        if (approx > 0) LOG.warn("[atheria_ile] {} pixels avec une couleur non declaree, rattaches a la classe la plus proche", approx);

        // rivières et lacs dessinés : de la terre pour les côtes et les régions (région voisine), de l'eau pour le relief
        boolean[] mRiv = new boolean[n], mLac = new boolean[n];
        int nRiv = 0, nLac = 0;
        {
            ArrayDeque<Integer> f = new ArrayDeque<>();
            for (int i = 0; i < n; i++) {
                int c = classe[i];
                if (c == CL_RIVIERE) { mRiv[i] = true; nRiv++; }
                else if (c == CL_LAC) { mLac[i] = true; nLac++; }
                else if (c >= 3) f.add(i);
            }
            while (!f.isEmpty()) {
                int i = f.poll(), x = i % w, z = i / w;
                int[] voisins = {x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, z > 0 ? i - w : -1, z < h - 1 ? i + w : -1};
                for (int v : voisins) if (v >= 0 && (classe[v] == CL_RIVIERE || classe[v] == CL_LAC)) { classe[v] = classe[i]; f.add(v); }
            }
            int orphelins = 0;
            for (int i = 0; i < n; i++) if (classe[i] == CL_RIVIERE || classe[i] == CL_LAC) { classe[i] = LAGON; orphelins++; }
            if (orphelins > 0) LOG.warn("[atheria_ile] {} pixels de riviere/lac sans terre voisine, traites comme lagon", orphelins);
        }
        pixelsRiviere = nRiv;
        pixelsLac = nLac;
        dRiviere = chanfreinMasque(mRiv);
        dLac = chanfreinMasque(mLac);
        erosionForce = config.has("erosion_force") ? Math.max(0, Math.min(1, config.get("erosion_force").getAsDouble())) : 0.5;
        erosionPlat = config.has("erosion_plat") ? Math.max(0, Math.min(0.9, config.get("erosion_plat").getAsDouble())) : 0.40;
        rivieresAleatoires = config.has("rivieres_aleatoires") && config.get("rivieres_aleatoires").getAsBoolean();
        valleeRiviere = config.has("riviere_vallee_blocs") ? Math.max(16, config.get("riviere_vallee_blocs").getAsDouble()) : 150.0;
        rayonRiviere = config.has("riviere_lit_blocs") ? Math.max(4, config.get("riviere_lit_blocs").getAsDouble()) : 16.0;

        // distance signée (chanfrein 3-4, en pixels)
        float[] dTerre = chanfrein(true);   // distance à la terre, pour les pixels d'eau
        float[] dEau = chanfrein(false);    // distance à l'eau, pour les pixels de terre
        distance = new float[n];
        for (int i = 0; i < n; i++) {
            distance[i] = terre(i) ? dEau[i] - 0.5f : -(dTerre[i] - 0.5f);
        }

        // région de la terre la plus proche (parcours en largeur depuis toutes les terres)
        // + numero de l'ile (composante de terre, 4-voisins) la plus proche
        regionProche = new byte[n];
        ileProche = new int[n];
        java.util.Arrays.fill(ileProche, -1);
        int iles = 0;
        for (int s = 0; s < n; s++) {
            if (!terre(s) || ileProche[s] >= 0) continue;
            ArrayDeque<Integer> f = new ArrayDeque<>();
            f.add(s);
            ileProche[s] = iles;
            while (!f.isEmpty()) {
                int i = f.poll(), x = i % w, z = i / w;
                int[] voisins = {x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, z > 0 ? i - w : -1, z < h - 1 ? i + w : -1};
                for (int v : voisins) if (v >= 0 && terre(v) && ileProche[v] < 0) { ileProche[v] = iles; f.add(v); }
            }
            iles++;
        }
        boolean[] vu = new boolean[n];
        ArrayDeque<Integer> file = new ArrayDeque<>();
        for (int i = 0; i < n; i++) {
            if (terre(i)) { regionProche[i] = (byte) (classe[i] - 3); vu[i] = true; file.add(i); }
        }
        while (!file.isEmpty()) {
            int i = file.poll();
            int x = i % w, z = i / w;
            int[] voisins = {x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, z > 0 ? i - w : -1, z < h - 1 ? i + w : -1};
            for (int v : voisins) {
                if (v >= 0 && !vu[v]) { vu[v] = true; regionProche[v] = regionProche[i]; ileProche[v] = ileProche[i]; file.add(v); }
            }
        }
        LOG.info("[atheria_ile] {} terres separees par la mer ; fondu des frontieres {} blocs", iles, fondu);

        // biomes de passage : pour chaque paire declaree, distance (par la terre) a l'autre region
        byte[] pRegle = null;
        float[] pDist = null;
        if (config.has("passages") && config.get("passages").isJsonArray()) {
            for (JsonElement e : config.getAsJsonArray("passages")) {
                JsonObject o = e.getAsJsonObject();
                if (!o.has("regions") || !o.has("biome") || o.get("biome").isJsonNull()) { LOG.warn("[atheria_ile] passage incomplet ignore : {}", o); continue; }
                JsonArray rs = o.getAsJsonArray("regions");
                int a = rs.size() == 2 ? regionNommee(rs.get(0).getAsString()) : -1, b = rs.size() == 2 ? regionNommee(rs.get(1).getAsString()) : -1;
                if (a < 0 || b < 0 || a == b) { LOG.warn("[atheria_ile] passage {} : regions introuvables ou identiques, ignore", rs); continue; }
                if (passageBiome.size() >= 120) { LOG.warn("[atheria_ile] plus de 120 passages, les suivants sont ignores"); break; }
                double larg = o.has("largeur_blocs") ? Math.max(16, o.get("largeur_blocs").getAsDouble()) : 96.0;
                if (pRegle == null) { pRegle = new byte[n]; pDist = new float[n]; java.util.Arrays.fill(pRegle, (byte) -1); java.util.Arrays.fill(pDist, Float.MAX_VALUE); }
                boolean[] mA = new boolean[n], mB = new boolean[n];
                for (int i = 0; i < n; i++) if (terre(i)) { int rr = classe[i] - 3; if (rr == a) mA[i] = true; else if (rr == b) mB[i] = true; }
                float[] dA = chanfreinTerre(mA), dB = chanfreinTerre(mB);
                int k = passageBiome.size();
                for (int i = 0; i < n; i++) {
                    float dd = mA[i] ? dB[i] - 0.5f : mB[i] ? dA[i] - 0.5f : Float.MAX_VALUE;
                    if (dd * bpp < larg * 1.2 && dd < pDist[i]) { pDist[i] = dd; pRegle[i] = (byte) k; }
                }
                passageBiome.add(o.get("biome").getAsString());
                passagePaire.add(new int[]{a, b});
                passageLargeur.add(larg);
            }
        }
        passageRegle = pRegle;
        passageDist = pDist;
        JsonObject lg = config.has("lagon") && config.get("lagon").isJsonObject() ? config.getAsJsonObject("lagon") : null;
        lagonBiome = texte(lg, "biome");
        recifBiome = texte(lg, "recif");
        passesBiome = texte(lg, "passes");
        passesLargeur = lg != null && lg.has("passes_largeur_blocs") ? Math.max(0, lg.get("passes_largeur_blocs").getAsDouble()) : 0.0;
        passesFond = lg != null && lg.has("passes_continents") ? Math.max(-0.45, Math.min(-0.20, lg.get("passes_continents").getAsDouble())) : -0.30;
        LOG.info("[atheria_ile] {} biomes de passage, lagon {}, passes {} blocs", passageBiome.size(), lagonBiome, passesLargeur);
        routes = Route.lire(config);
        for (Route r : routes) r.pontsAuto(this);
        lots = Lot.lire(config);
        volumes = Volumes.lire(config);
        int mr = 64;
        for (Route r : routes) mr = r.margeStructures;
        margeRoute = mr;
        chunksExclus = Exclusions.calculer(routes, lots, margeRoute);
        LOG.info("[atheria_ile] {} chunks exclus (routes a moins de {} blocs de l'axe, {} lots avec marge)", chunksExclus.length, margeRoute, lots.size());
        List<JsonObject> zl = new ArrayList<>();
        if (config.has("zones_biome") && config.get("zones_biome").isJsonArray())
            for (var e : config.getAsJsonArray("zones_biome")) if (e.isJsonObject() && e.getAsJsonObject().has("biome")) zl.add(e.getAsJsonObject());
        int nz = zl.size();
        zoneX = new double[nz]; zoneZ = new double[nz]; zoneRayon = new double[nz]; zoneBord = new double[nz];
        zoneRect = new boolean[nz]; zoneX1 = new double[nz]; zoneZ1 = new double[nz]; zoneX2 = new double[nz]; zoneZ2 = new double[nz];
        zoneBiome = new String[nz]; zoneNom = new String[nz]; zonePlage = new boolean[nz]; zoneLacs = new boolean[nz]; zoneVille = new boolean[nz];
        for (int i = 0; i < nz; i++) {
            JsonObject o = zl.get(i);
            zoneX[i] = o.has("x") ? o.get("x").getAsDouble() : 0;
            zoneZ[i] = o.has("z") ? o.get("z").getAsDouble() : 0;
            zoneRayon[i] = o.has("rayon_blocs") ? Math.max(0, o.get("rayon_blocs").getAsDouble()) : 0;
            zoneRect[i] = o.has("forme") && "rectangle".equals(o.get("forme").getAsString());
            if (zoneRect[i]) {
                double ax1 = o.get("x1").getAsDouble(), az1 = o.get("z1").getAsDouble(), ax2 = o.get("x2").getAsDouble(), az2 = o.get("z2").getAsDouble();
                zoneX1[i] = Math.min(ax1, ax2); zoneX2[i] = Math.max(ax1, ax2); zoneZ1[i] = Math.min(az1, az2); zoneZ2[i] = Math.max(az1, az2);
                zoneX[i] = (zoneX1[i] + zoneX2[i]) / 2; zoneZ[i] = (zoneZ1[i] + zoneZ2[i]) / 2;
                zoneBord[i] = o.has("bord_blocs") ? Math.max(0, o.get("bord_blocs").getAsDouble()) : 0;
            } else
            zoneBord[i] = o.has("bord_blocs") ? Math.max(0, Math.min(zoneRayon[i], o.get("bord_blocs").getAsDouble())) : 0;
            zoneBiome[i] = o.get("biome").getAsString();
            zoneNom[i] = o.has("nom") ? o.get("nom").getAsString() : "zone " + (i + 1);
            zonePlage[i] = !o.has("plage") || o.get("plage").isJsonNull() || o.get("plage").getAsBoolean();
            zoneLacs[i] = o.has("lacs") && !o.get("lacs").isJsonNull() && o.get("lacs").getAsBoolean();
            zoneVille[i] = o.has("zone_ville") && !o.get("zone_ville").isJsonNull() && o.get("zone_ville").getAsBoolean();
            if (zoneRect[i]) LOG.info("[atheria_ile] zone de biome '{}' : {} sur le rectangle {},{} -> {},{} (bord {} vers l'exterieur, plage gardee {}, lacs {})", zoneNom[i], zoneBiome[i], (long) zoneX1[i], (long) zoneZ1[i], (long) zoneX2[i], (long) zoneZ2[i], (long) zoneBord[i], zonePlage[i], zoneLacs[i]);
            else LOG.info("[atheria_ile] zone de biome '{}' : {} sur {} blocs autour de {}, {} (bord {}, plage gardee {}, lacs {})", zoneNom[i], zoneBiome[i], (long) zoneRayon[i], (long) zoneX[i], (long) zoneZ[i], (long) zoneBord[i], zonePlage[i], zoneLacs[i]);
        }

        // relief des régions lissé (flou boîte séparable, deux passes)
        int rayon = config.has("lissage_relief_pixels") ? Math.max(0, config.get("lissage_relief_pixels").getAsInt()) : 8;
        float[] base = new float[n];
        for (int i = 0; i < n; i++) base[i] = (float) regions.get(regionProche[i] & 0xFF).relief;
        relief = flou(flou(base, rayon), rayon);

        // profils de côte par région, lissés pour que deux côtes voisines se raccordent
        float[] pb = new float[n], ph = new float[n], pp = new float[n];
        for (int i = 0; i < n; i++) {
            float[] pr = PROFILS[indexCote(regions.get(regionProche[i] & 0xFF).cote)];
            pb[i] = pr[0]; ph[i] = pr[1]; pp[i] = pr[2];
        }
        int rc = config.has("lissage_cotes_pixels") ? Math.max(0, config.get("lissage_cotes_pixels").getAsInt()) : 6;
        coteBas = flou(flou(pb, rc), rc);
        coteHaut = flou(flou(ph, rc), rc);
        cotePlafond = flou(flou(pp, rc), rc);
        float[] ch = null;
        for (Region g : regions) if (g.chenaux > 0) { ch = new float[n]; break; }
        if (ch != null) {
            for (int i = 0; i < n; i++) ch[i] = (float) regions.get(regionProche[i] & 0xFF).chenaux;
            ch = flou(flou(ch, rc), rc);
        }
        chenauxPx = ch;
        chenauxLargeur = config.has("chenaux_largeur") ? Math.max(0.005, config.get("chenaux_largeur").getAsDouble()) : 0.05;
        chenauxFond = config.has("chenaux_continents") ? Math.max(-0.30, Math.min(-0.16, config.get("chenaux_continents").getAsDouble())) : -0.18;

        // relief dessiné (facultatif)
        String nomRelief = config.has("relief_image") && !config.get("relief_image").isJsonNull() ? config.get("relief_image").getAsString() : "relief.png";
        float[] ht = null;
        Path fr = dossier.resolve(nomRelief);
        if (Files.isRegularFile(fr)) {
            BufferedImage ri = ImageIO.read(fr.toFile());
            if (ri == null) LOG.warn("[atheria_ile] {} n'est pas une image : relief de Tectonic garde", nomRelief);
            else if (ri.getWidth() != w || ri.getHeight() != h) LOG.warn("[atheria_ile] {} fait {}x{} au lieu de {}x{} : relief de Tectonic garde", nomRelief, ri.getWidth(), ri.getHeight(), w, h);
            else {
                ht = new float[n];
                for (int z = 0; z < h; z++) for (int x = 0; x < w; x++) {
                    int rgb = ri.getRGB(x, z);
                    ht[z * w + x] = (((rgb >> 16) & 255) + ((rgb >> 8) & 255) + (rgb & 255)) / 765f;
                }
            }
        } else LOG.info("[atheria_ile] pas de {} : relief de Tectonic garde (seulement le relief par region)", nomRelief);
        hauteur = ht;
        LOG.info("[atheria_ile] rivieres dessinees {} px, lacs {} px, relief dessine {}, rivieres aleatoires {}", nRiv, nLac, ht != null, rivieresAleatoires);

        JsonObject rn = config.has("relief_naturel") && config.get("relief_naturel").isJsonObject() ? config.getAsJsonObject("relief_naturel") : null;
        boolean rnActif = rn != null && (!rn.has("actif") || rn.get("actif").getAsBoolean());
        rnWarp = rnActif ? nombre(rn, "deformation_cote_blocs", 0) : 0;
        rnCote = rnActif ? nombre(rn, "cote_fractale_blocs", 0) : 0;
        rnMicro = rnActif ? nombre(rn, "micro_relief", 0) : 0;
        rnMeandre = rnActif ? nombre(rn, "meandres_blocs", 0) : 0;
        rnLargeurVar = rnActif ? Math.max(0, Math.min(0.8, nombre(rn, "largeur_riviere_variation", 0))) : 0;
        rnTransition = rnActif ? nombre(rn, "transition_regions_blocs", 0) : 0;
        detailsDensite = rnActif ? Math.max(0, nombre(rn, "details_par_chunk", 0)) : 0;
        villesLcDossier = rn != null && rn.has("villes_lc_dossier") ? rn.get("villes_lc_dossier").getAsString() : "kubejs/data/lostcities/lostcities/predefinedcities";
        villesLcMarge = rn != null ? nombre(rn, "villes_lc_marge_blocs", 32) : 32;
        if (rnActif) construireProtection();
        // 0.9.0 relief v3 : delta d'erosion precalcule (outil ErosionIle), en blocs, ajoute a l'offset de Tectonic par IleChamp "relief"
        String nd = rnActif ? texte(rn, "erosion_delta") : null;
        if (nd != null && config.has("relief_bake")) { LOG.warn("[atheria_ile] relief_bake actif : erosion_delta ignore (le bake mesure le relief de base)"); nd = null; }
        if (nd != null) chargerDelta(dossier.resolve(nd));
        LOG.info("[atheria_ile] relief naturel {} : deformation {} blocs, cote fractale {} blocs, micro-relief {}, meandres {} blocs, largeur rivieres +-{}, transitions {} blocs",
                rnActif ? "ACTIF" : "inactif", rnWarp, rnCote, rnMicro, rnMeandre, rnLargeurVar, rnTransition);
    }

    /** grille du delta d'erosion : origine, pas (blocs), taille ; valeurs en 1/32 de bloc */
    private short[] delta;
    private int dX0, dZ0, dPas, dW, dH;

    private void chargerDelta(Path f) {
        if (!Files.isRegularFile(f)) { LOG.warn("[atheria_ile] delta d'erosion absent ({}) : relief v2", f.getFileName()); return; }
        try (java.io.DataInputStream in = new java.io.DataInputStream(new java.io.BufferedInputStream(Files.newInputStream(f), 1 << 16))) {
            if (in.readInt() != 0x41545244) throw new IllegalStateException("entete");
            int x0 = in.readInt(), z0 = in.readInt(), pas = in.readInt(), ww = in.readInt(), hh = in.readInt();
            short[] t = new short[ww * hh];
            for (int i = 0; i < t.length; i++) t[i] = in.readShort();
            dX0 = x0; dZ0 = z0; dPas = pas; dW = ww; dH = hh; delta = t;
            LOG.info("[atheria_ile] delta d'erosion {} : {}x{} pas {} blocs depuis {},{}", f.getFileName(), ww, hh, pas, x0, z0);
        } catch (Exception e) { LOG.error("[atheria_ile] delta d'erosion illisible {} : {} (relief v2 garde)", f.getFileName(), e.toString()); delta = null; }
    }

    private double dv(int i, int j) {
        i = Math.max(0, Math.min(dW - 1, i)); j = Math.max(0, Math.min(dH - 1, j));
        return delta[j * dW + i];
    }

    private static double cr(double a, double b, double c, double d, double t) {
        return b + 0.5 * t * (c - a + t * (2 * a - 5 * b + 4 * c - d + t * (3 * (b - c) + d - a)));
    }

    /** delta d'erosion (blocs) au bloc, bicubique (Catmull-Rom), multiplie par la force du relief naturel (0 dans les zones protegees) */
    public double deltaRelief(int bx, int bz) {
        if (delta == null) return 0;
        double gx = (bx + 0.5 - dX0) / dPas, gz = (bz + 0.5 - dZ0) / dPas;
        if (gx < -1 || gz < -1 || gx > dW || gz > dH) return 0;
        double fN = forceNaturel(bx, bz);
        if (fN <= 0) return 0;
        int i = (int) Math.floor(gx), j = (int) Math.floor(gz);
        double tx = gx - i, tz = gz - j;
        double[] r = new double[4];
        for (int k = 0; k < 4; k++) r[k] = cr(dv(i - 1, j - 1 + k), dv(i, j - 1 + k), dv(i + 1, j - 1 + k), dv(i + 2, j - 1 + k), tx);
        return fN * cr(r[0], r[1], r[2], r[3], tz) / 32.0;
    }

    public boolean aDelta() { return delta != null; }

    private static double nombre(JsonObject o, String cle, double defaut) {
        return o.has(cle) && !o.get(cle).isJsonNull() ? o.get(cle).getAsDouble() : defaut;
    }

    /** grille par chunk des zones protegees puis distance (chanfrein) en blocs : rien ne bouge a moins de 16 blocs d'elles */
    private String villesLcDossier = null;
    private double villesLcMarge = 32;

    /** villes predefinies de Lost Cities (centre en blocs, rayon) : le cityFactor y est > 0 jusqu'au rayon */
    private List<double[]> villesLc() {
        List<double[]> res = new ArrayList<>();
        if (villesLcDossier == null) return res;
        Path d = FMLPaths.GAMEDIR.get().resolve(villesLcDossier);
        if (!Files.isDirectory(d)) { LOG.warn("[atheria_ile] relief naturel : dossier des villes Lost Cities absent ({})", d); return res; }
        try (var flux = Files.list(d)) {
            for (Path f : (Iterable<Path>) flux::iterator) {
                if (!f.toString().endsWith(".json")) continue;
                try (Reader r = Files.newBufferedReader(f, StandardCharsets.UTF_8)) {
                    JsonObject o = JsonParser.parseReader(r).getAsJsonObject();
                    if (o.has("dimension") && !"minecraft:overworld".equals(o.get("dimension").getAsString())) continue;
                    res.add(new double[]{o.get("chunkx").getAsInt() * 16 + 8, o.get("chunkz").getAsInt() * 16 + 8, o.has("radius") ? o.get("radius").getAsDouble() : 448});
                } catch (Exception e) { LOG.warn("[atheria_ile] ville Lost Cities illisible {} : {}", f.getFileName(), e.toString()); }
            }
        } catch (Exception e) { LOG.warn("[atheria_ile] dossier des villes Lost Cities illisible : {}", e.toString()); }
        return res;
    }

    private void construireProtection() {
        pgX0 = (int) Math.floor(origineX / 16.0) - 2; pgZ0 = (int) Math.floor(origineZ / 16.0) - 2;
        pgW = (int) Math.ceil(w * bpp / 16.0) + 5; pgH = (int) Math.ceil(h * bpp / 16.0) + 5;
        float INF = 1e9f;
        float[] g = new float[pgW * pgH];
        java.util.Arrays.fill(g, INF);
        java.util.List<int[]> boites = Exclusions.zonesVilles(this, new java.util.ArrayList<>());
        for (int i = 0; i < zoneRect.length; i++) if (zoneRect[i])
            boites.add(new int[]{(int) Math.floor(zoneX1[i]), (int) Math.floor(zoneZ1[i]), (int) Math.ceil(zoneX2[i]), (int) Math.ceil(zoneZ2[i])});
        List<double[]> vlc = villesLc();
        int np = 0;
        for (int j = 0; j < pgH; j++) for (int i = 0; i < pgW; i++) {
            int cx = pgX0 + i, cz = pgZ0 + j;
            boolean p = chunkExclu(cx, cz) || (volumes != null && volumes.chunkTouche(cx, cz));
            // villes Lost Cities : tout chunk dont le centre est a moins de rayon + marge d'un centre de ville (cityFactor et cityLevel des voisins)
            for (int k = 0; !p && k < vlc.size(); k++) { double[] v = vlc.get(k); double dx = cx * 16 + 8 - v[0], dz = cz * 16 + 8 - v[1], r = v[2] + villesLcMarge + 12; p = dx * dx + dz * dz <= r * r; }
            for (int k = 0; !p && k < boites.size(); k++) { int[] b = boites.get(k); p = cx * 16 + 15 >= b[0] && cx * 16 < b[2] && cz * 16 + 15 >= b[1] && cz * 16 < b[3]; }
            if (p) { g[j * pgW + i] = 0; np++; }
        }
        float d1 = 16f, d2 = 22.627f;
        for (int j = 0; j < pgH; j++) for (int i = 0; i < pgW; i++) {
            int k = j * pgW + i; float v = g[k];
            if (i > 0) v = Math.min(v, g[k - 1] + d1);
            if (j > 0) { v = Math.min(v, g[k - pgW] + d1); if (i > 0) v = Math.min(v, g[k - pgW - 1] + d2); if (i < pgW - 1) v = Math.min(v, g[k - pgW + 1] + d2); }
            g[k] = v;
        }
        for (int j = pgH - 1; j >= 0; j--) for (int i = pgW - 1; i >= 0; i--) {
            int k = j * pgW + i; float v = g[k];
            if (i < pgW - 1) v = Math.min(v, g[k + 1] + d1);
            if (j < pgH - 1) { v = Math.min(v, g[k + pgW] + d1); if (i < pgW - 1) v = Math.min(v, g[k + pgW + 1] + d2); if (i > 0) v = Math.min(v, g[k + pgW - 1] + d2); }
            g[k] = v;
        }
        protegeDist = g;
        LOG.info("[atheria_ile] relief naturel : {} chunks proteges (routes, lots, villes, zones, volumes, {} villes Lost Cities rayon + {} blocs), {} boites de villes/zones", np, vlc.size(), villesLcMarge, boites.size());
    }

    /** 0..1 : force du relief naturel au bloc (0 dans les zones protegees et jusqu'a 16 blocs autour, 1 au-dela de 96 blocs) */
    double forceNaturel(double bx, double bz) {
        if (protegeDist == null) return 0;
        double gx = bx / 16.0 - pgX0 - 0.5, gz = bz / 16.0 - pgZ0 - 0.5;
        int x0 = (int) Math.floor(gx), z0 = (int) Math.floor(gz);
        if (x0 < 0 || z0 < 0 || x0 >= pgW - 1 || z0 >= pgH - 1) return 1;
        double tx = gx - x0, tz = gz - z0;
        int k = z0 * pgW + x0;
        double d = (protegeDist[k] * (1 - tx) + protegeDist[k + 1] * tx) * (1 - tz) + (protegeDist[k + pgW] * (1 - tx) + protegeDist[k + pgW + 1] * tx) * tz;
        return lisse(16, 96, d);
    }

    /** deformation du domaine (3 octaves) pour lire la carte : canal 0 = x, 1 = z */
    private double deformationDomaine(double bx, double bz, int axe) {
        long c = 300 + 10L * axe;
        return (0.55 * bruit(bx / 230.0, bz / 230.0, c) + 0.30 * bruit(bx / 88.0, bz / 88.0, c + 1) + 0.15 * bruit(bx / 31.0, bz / 31.0, c + 2)) * rnWarp;
    }

    private static String texte(JsonObject o, String cle) {
        return o != null && o.has(cle) && !o.get(cle).isJsonNull() ? o.get(cle).getAsString() : null;
    }

    /** region par nom exact, sinon par debut de nom ; -1 si aucune */
    int regionNommee(String nom) {
        for (int i = 0; i < regions.size(); i++) if (regions.get(i).nom.equals(nom)) return i;
        for (int i = 0; i < regions.size(); i++) if (regions.get(i).nom.startsWith(nom)) return i;
        return -1;
    }

    private volatile int[][] centres;

    /** Pour chaque region : le point (blocs) le plus loin de ses bords, ou le repere force ; null si la region est absente. */
    public int[][] centresRegions() {
        int[][] c = centres;
        if (c != null) return c;
        synchronized (this) {
            if (centres != null) return centres;
            int n = w * h;
            c = new int[regions.size()][];
            for (int r = 0; r < c.length; r++) {
                Region g = regions.get(r);
                if (g.repere != null) { c[r] = g.repere.clone(); continue; }
                boolean[] dehors = new boolean[n];
                for (int i = 0; i < n; i++) dehors[i] = !(terre(i) && classe[i] - 3 == r);
                float[] d = chanfreinMasque(dehors);
                int best = -1; float bd = 0;
                for (int i = 0; i < n; i++) if (!dehors[i] && d[i] > bd) { bd = d[i]; best = i; }
                if (best >= 0) c[r] = new int[]{(int) Math.round(origineX + (best % w + 0.5) * bpp), (int) Math.round(origineZ + (best / w + 0.5) * bpp)};
            }
            centres = c;
            return c;
        }
    }

    /** distance (px) au masque en ne passant que par la terre ; la mer est infranchissable */
    private float[] chanfreinTerre(boolean[] m) {
        int n = w * h;
        float inf = 1e9f;
        float[] d = new float[n];
        for (int i = 0; i < n; i++) d[i] = m[i] ? 0f : inf;
        final float a = 1f, b = 1.4142f;
        for (int z = 0; z < h; z++) for (int x = 0; x < w; x++) {
            int i = z * w + x;
            if (!terre(i)) { d[i] = inf; continue; }
            float v = d[i];
            if (x > 0) v = Math.min(v, d[i - 1] + a);
            if (z > 0) {
                v = Math.min(v, d[i - w] + a);
                if (x > 0) v = Math.min(v, d[i - w - 1] + b);
                if (x < w - 1) v = Math.min(v, d[i - w + 1] + b);
            }
            d[i] = v;
        }
        for (int z = h - 1; z >= 0; z--) for (int x = w - 1; x >= 0; x--) {
            int i = z * w + x;
            if (!terre(i)) continue;
            float v = d[i];
            if (x < w - 1) v = Math.min(v, d[i + 1] + a);
            if (z < h - 1) {
                v = Math.min(v, d[i + w] + a);
                if (x < w - 1) v = Math.min(v, d[i + w + 1] + b);
                if (x > 0) v = Math.min(v, d[i + w - 1] + b);
            }
            d[i] = v;
        }
        return d;
    }

    private float[] chanfreinMasque(boolean[] m) {
        int n = w * h;
        float inf = 1e9f;
        float[] d = new float[n];
        for (int i = 0; i < n; i++) d[i] = m[i] ? 0f : inf;
        final float a = 1f, b = 1.4142f;
        for (int z = 0; z < h; z++) for (int x = 0; x < w; x++) {
            int i = z * w + x; float v = d[i];
            if (x > 0) v = Math.min(v, d[i - 1] + a);
            if (z > 0) {
                v = Math.min(v, d[i - w] + a);
                if (x > 0) v = Math.min(v, d[i - w - 1] + b);
                if (x < w - 1) v = Math.min(v, d[i - w + 1] + b);
            }
            d[i] = v;
        }
        for (int z = h - 1; z >= 0; z--) for (int x = w - 1; x >= 0; x--) {
            int i = z * w + x; float v = d[i];
            if (x < w - 1) v = Math.min(v, d[i + 1] + a);
            if (z < h - 1) {
                v = Math.min(v, d[i + w] + a);
                if (x < w - 1) v = Math.min(v, d[i + w + 1] + b);
                if (x > 0) v = Math.min(v, d[i + w - 1] + b);
            }
            d[i] = v;
        }
        for (int i = 0; i < n; i++) if (d[i] >= inf) d[i] = w + h;
        return d;
    }

    private boolean terre(int i) { return classe[i] >= 3; }

    private float[] chanfrein(boolean versTerre) {
        int n = w * h;
        float inf = 1e9f;
        float[] d = new float[n];
        for (int i = 0; i < n; i++) d[i] = (terre(i) == versTerre) ? 0f : inf;
        final float a = 1f, b = 1.4142f;
        for (int z = 0; z < h; z++) for (int x = 0; x < w; x++) {
            int i = z * w + x; float v = d[i];
            if (x > 0) v = Math.min(v, d[i - 1] + a);
            if (z > 0) {
                v = Math.min(v, d[i - w] + a);
                if (x > 0) v = Math.min(v, d[i - w - 1] + b);
                if (x < w - 1) v = Math.min(v, d[i - w + 1] + b);
            }
            d[i] = v;
        }
        for (int z = h - 1; z >= 0; z--) for (int x = w - 1; x >= 0; x--) {
            int i = z * w + x; float v = d[i];
            if (x < w - 1) v = Math.min(v, d[i + 1] + a);
            if (z < h - 1) {
                v = Math.min(v, d[i + w] + a);
                if (x < w - 1) v = Math.min(v, d[i + w + 1] + b);
                if (x > 0) v = Math.min(v, d[i + w - 1] + b);
            }
            d[i] = v;
        }
        // aucune terre (ou aucune eau) : distance "infinie" bornée
        for (int i = 0; i < n; i++) if (d[i] >= inf) d[i] = w + h;
        return d;
    }

    private float[] flou(float[] src, int r) {
        if (r <= 0) return src;
        float[] tmp = new float[src.length], out = new float[src.length];
        for (int z = 0; z < h; z++) {
            for (int x = 0; x < w; x++) {
                float s = 0; int c = 0;
                for (int k = -r; k <= r; k++) { int xx = x + k; if (xx >= 0 && xx < w) { s += src[z * w + xx]; c++; } }
                tmp[z * w + x] = s / c;
            }
        }
        for (int z = 0; z < h; z++) {
            for (int x = 0; x < w; x++) {
                float s = 0; int c = 0;
                for (int k = -r; k <= r; k++) { int zz = z + k; if (zz >= 0 && zz < h) { s += tmp[zz * w + x]; c++; } }
                out[z * w + x] = s / c;
            }
        }
        return out;
    }

    // ------------------------------------------------------------------ échantillonnage

    private double bilineaire(float[] tab, double px, double pz) {
        double fx = px - 0.5, fz = pz - 0.5;
        int x0 = (int) Math.floor(fx), z0 = (int) Math.floor(fz);
        double tx = fx - x0, tz = fz - z0;
        double a = val(tab, x0, z0), b = val(tab, x0 + 1, z0), c = val(tab, x0, z0 + 1), d = val(tab, x0 + 1, z0 + 1);
        return (a * (1 - tx) + b * tx) * (1 - tz) + (c * (1 - tx) + d * tx) * tz;
    }

    private double val(float[] tab, int x, int z) {
        x = Math.max(0, Math.min(w - 1, x));
        z = Math.max(0, Math.min(h - 1, z));
        return tab[z * w + x];
    }

    /** Distance signée à la côte en blocs (positive sur terre). Hors image : de plus en plus loin en mer. */
    public double distanceBlocs(double bx, double bz) {
        double f = (rnWarp > 0 || rnCote > 0) ? forceNaturel(bx, bz) : 0;
        if (f > 0) {
            double ox = bx, oz = bz;
            bx = ox + f * deformationDomaine(ox, oz, 0); bz = oz + f * deformationDomaine(ox, oz, 1);
            double d0 = distanceBlocsBrute(bx, bz);
            if (rnCote <= 0 || Math.abs(d0) > rnCote * 6) return d0;
            // cote fractale : baies, caps et criques (de 60 a 8 blocs), seulement pres du trait de cote
            double fr = 0.5 * bruit(ox / 61.0, oz / 61.0, 321) + 0.3 * bruit(ox / 23.0, oz / 23.0, 322) + 0.2 * bruit(ox / 8.7, oz / 8.7, 323);
            return d0 + f * rnCote * fr * (1 - lisse(rnCote * 3, rnCote * 6, Math.abs(d0)));
        }
        return distanceBlocsBrute(bx, bz);
    }

    private double distanceBlocsBrute(double bx, double bz) {
        double px = (bx - origineX) / bpp, pz = (bz - origineZ) / bpp;
        double d = bilineaire(distance, px, pz) * bpp;
        double dehorsX = Math.max(0, Math.max(-px, px - w)), dehorsZ = Math.max(0, Math.max(-pz, pz - h));
        double dehors = Math.hypot(dehorsX, dehorsZ) * bpp;
        return dehors > 0 ? Math.min(d, 0) - dehors : d;
    }

    public int classeA(double bx, double bz) {
        if (rnWarp > 0) {
            double f = forceNaturel(bx, bz);
            if (f > 0) { double ox = bx, oz = bz; bx = ox + f * deformationDomaine(ox, oz, 0); bz = oz + f * deformationDomaine(ox, oz, 1); }
        }
        int px = (int) Math.floor((bx - origineX) / bpp), pz = (int) Math.floor((bz - origineZ) / bpp);
        if (px < 0 || pz < 0 || px >= w || pz >= h) return OCEAN;
        return classe[pz * w + px];
    }

    private static final double[] D_PTS = {-1200, -500, -150, -30, 0, 40, 150, 500, 1200, 2500};
    private static final double[] V_PTS = {-0.45, -0.38, -0.25, -0.19, -0.16, -0.12, -0.05, 0.05, 0.20, 0.40};

    private static double courbe(double d) {
        if (d <= D_PTS[0]) return V_PTS[0];
        for (int i = 1; i < D_PTS.length; i++) {
            if (d <= D_PTS[i]) {
                double t = (d - D_PTS[i - 1]) / (D_PTS[i] - D_PTS[i - 1]);
                return V_PTS[i - 1] + t * (V_PTS[i] - V_PTS[i - 1]);
            }
        }
        return V_PTS[V_PTS.length - 1];
    }

    private static double lisse(double a, double b, double x) {
        double t = Math.max(0, Math.min(1, (x - a) / (b - a)));
        return t * t * (3 - 2 * t);
    }

    /** Valeur de tectonic:noise/raw_continents dictée par la carte. o = valeur d'origine (détail). */
    public double continents(int bx, int bz, double o) {
        double d = distanceBlocs(bx, bz);
        double v = courbe(d);
        int cl = classeA(bx, bz);
        if (cl == LAGON) v = Math.max(v, -0.22);
        else if (cl == RECIF) v = Math.max(v, -0.185);
        double fN = (rnWarp > 0 || rnMicro > 0 || rnMeandre > 0) ? forceNaturel(bx, bz) : 0;
        double sx = bx, sz = bz;
        if (fN > 0 && rnWarp > 0) { sx = bx + fN * deformationDomaine(bx, bz, 0); sz = bz + fN * deformationDomaine(bx, bz, 1); }
        double px = (sx - origineX) / bpp, pz = (sz - origineZ) / bpp;
        double terreDedans = lisse(-40, 250, d);
        v += bilineaire(relief, px, pz) * terreDedans;
        if (hauteur != null) v += 0.32 * bilineaire(hauteur, px, pz) * terreDedans;
        // detail d'origine : plein a terre, attenue en mer (sinon des ilots sortent du lagon)
        v += (d > 0 ? 0.06 : 0.02) * Math.max(-1, Math.min(1, o));
        if (cl == LAGON || cl == RECIF) {
            v = Math.min(v, cl == LAGON ? -0.19 : -0.17);   // le lagon reste sous la mer (cote Tectonic -0.155)
            // passes : chenaux plus profonds a travers le lagon et le recif, loin des plages
            double f = passe(bx, bz, d);
            if (f > 0) v = Math.min(v, v + (passesFond - v) * f);
        }
        else if (d > 0) {
            // a terre : profil de cote de la region (plage basse, falaise, vase, roche), sans cuvette marine
            double bas = bilineaire(coteBas, px, pz), haut = bilineaire(coteHaut, px, pz), plafond = bilineaire(cotePlafond, px, pz);
            double plancher = bas + (haut - bas) * lisse(0, 500, d);
            double plaf = plafond + 0.12 * lisse(400, 1400, d);
            double mr = 0;
            if (fN > 0 && rnMicro > 0) {
                mr = 0.45 * bruit(bx / 70.0, bz / 70.0, 341) + 0.30 * bruit(bx / 29.0, bz / 29.0, 342) + 0.15 * bruit(bx / 13.0, bz / 13.0, 343)
                        + 0.10 * Math.abs(bruit(bx / 150.0, bz / 150.0, 344));
                // v2 : le plancher et le plafond suivent le micro-relief (sinon la nappe reste plate sous le plafond de la vase)
                double ondule = fN * rnMicro * mr * lisse(4, 70, d);
                v += ondule; plancher += ondule; plaf += ondule;
            }
            if (fN > 0 && rnMicro > 0) {
                // 0.8.0 : plancher et plafond doux (plus de nappe plate finie en mur), largeur selon le micro-relief
                double k = fN * rnMicro * 0.6;
                v = 0.5 * (v + plancher + Math.sqrt((v - plancher) * (v - plancher) + k * k));
                if (plafond < 1) v = 0.5 * (v + plaf - Math.sqrt((v - plaf) * (v - plaf) + k * k));
            } else {
                v = Math.max(v, plancher);
                if (plafond < 1) v = Math.min(v, plaf);
            }
            // chenaux et mares (mangroves) : reseau d'eau peu profonde, plus dense pres de la cote
            if (chenauxPx != null) {
                double k = bilineaire(chenauxPx, px, pz);
                if (k > 0.01) {
                    double eps = chenauxLargeur * k * (1.0 - 0.6 * lisse(0, 1500, d));
                    double nz = Math.abs(bruit(bx / 260.0, bz / 260.0, 81) + 0.45 * bruit(bx / 80.0, bz / 80.0, 82));
                    double f = nz < eps ? 1 - lisse(0, eps, nz) : 0;
                    double mare = bruit(bx / 110.0, bz / 110.0, 83);
                    double seuilMare = 0.62 - 0.15 * k * (1 - lisse(0, 1500, d));
                    if (mare > seuilMare) f = Math.max(f, Math.min(1, (mare - seuilMare) * 8));
                    if (f > 0) v = Math.min(v, v + (chenauxFond - v) * f * Math.min(1, k));
                }
            }
            // 0.8.0 micro-relief : collines et ravines de quelques blocs, nul au bord de l'eau et dans les zones protegees
            // micro-relief : applique plus haut (v, plancher et plafond ensemble)
            // rivieres dessinees : vallee qui descend au niveau de la mer ; lacs : cuvette sous la mer
            double dr = riviereBlocs(bx, bz, fN, px, pz);
            double rr = rayonRiviereA(bx, bz, fN);
            if (dr < valleeRiviere) v = Math.min(v, -0.125 + (v + 0.125) * lisse(rr, valleeRiviere, dr));
            double dl = bilineaire(dLac, px, pz) * bpp;
            if (dl < 90) v = Math.min(v, -0.20 + (v + 0.20) * lisse(0, 90, dl));
        }
        return v;
    }

    /** Force (0..1) d'une passe du lagon au bloc donne ; d = distance signee a la cote (blocs). 0 hors lagon/recif. */
    double passe(int bx, int bz, double d) {
        if (passesLargeur <= 0 || d > -60) return 0;
        double nz = Math.abs(bruit(bx / 1400.0, bz / 1400.0, 71) + 0.3 * bruit(bx / 380.0, bz / 380.0, 72));
        double eps = passesLargeur / 1400.0;
        if (nz >= eps) return 0;
        return (1 - lisse(0, eps, nz)) * lisse(-60, -180, d);
    }

    /** Passe du lagon (pour le biome) : vrai au coeur d'une passe. */
    public boolean dansPasse(int bx, int bz) {
        int cl = classeA(bx, bz);
        if (cl != LAGON && cl != RECIF) return false;
        return passe(bx, bz, distanceBlocs(bx, bz)) > 0.5;
    }

    /** Erosion de Tectonic dictée par relief.png : |e| petit = montagnes, grand = plat (signe d'origine garde). */
    public double erosion(int bx, int bz, double o) {
        if (hauteur == null) return o;
        double px = (bx - origineX) / bpp, pz = (bz - origineZ) / bpp;
        double d = distanceBlocs(bx, bz);
        if (d < -200) return o;
        double hh = bilineaire(hauteur, px, pz);
        double cible = 0.05 + erosionPlat * (1 - hh);
        double a = Math.abs(o), s = o < 0 ? -1 : 1;
        double force = erosionForce * lisse(-200, 0, d);
        return s * (a + (cible - a) * force);
    }

    /** Crêtes de Tectonic : pas de rivière au hasard (|r| gardé loin de 0), rivière (r = 0) sur les rivières dessinées. */
    public double cretes(int bx, int bz, double o) {
        double px = (bx - origineX) / bpp, pz = (bz - origineZ) / bpp;
        double a = Math.abs(o), s = o < 0 ? -1 : 1;
        double r = rivieresAleatoires ? o : s * (0.15 + 0.85 * a);
        if (pixelsRiviere == 0) return r;
        double fN = (rnMeandre > 0 || rnLargeurVar > 0) ? forceNaturel(bx, bz) : 0;
        double dr = riviereBlocs(bx, bz, fN, px, pz);
        double rr = rayonRiviereA(bx, bz, fN);
        // riviere de Tectonic seulement sur le lit dessine (crete ~0 sur environ 2 fois le lit), pas sur toute la vallee
        if (dr < rr * 4) r *= lisse(rr * 0.5, rr * 4, dr);
        return r;
    }

    // ------------------------------------------------------------------ régions et cellules de biomes

    private static long melange(long z) {
        z = (z ^ (z >>> 33)) * 0xff51afd7ed558ccdL;
        z = (z ^ (z >>> 33)) * 0xc4ceb9fe1a85ec53L;
        return z ^ (z >>> 33);
    }

    private double hash01(long a, long b, long c) {
        long v = melange(graine * 0x9E3779B97F4A7C15L + a * 0x632BE59BD9B4E019L + b * 0x85157AF5L + c);
        return (v >>> 11) * 0x1.0p-53;
    }

    double bruit(double x, double z, long canal) {
        int x0 = (int) Math.floor(x), z0 = (int) Math.floor(z);
        double tx = x - x0, tz = z - z0;
        tx = tx * tx * (3 - 2 * tx);
        tz = tz * tz * (3 - 2 * tz);
        double a = hash01(x0, z0, canal), b = hash01(x0 + 1, z0, canal), c = hash01(x0, z0 + 1, canal), d = hash01(x0 + 1, z0 + 1, canal);
        return ((a * (1 - tx) + b * tx) * (1 - tz) + (c * (1 - tx) + d * tx) * tz) * 2 - 1;
    }

    /** Index de la zone de biome force qui couvre ce bloc (bord bruite), -1 si aucune. Sans allocation. */
    public int zoneBiome(int bx, int bz) {
        for (int i = 0; i < zoneX.length; i++) {
            if (zoneRect[i]) {
                double ex = Math.max(Math.max(zoneX1[i] - bx, 0), bx + 1 - zoneX2[i]), ez = Math.max(Math.max(zoneZ1[i] - bz, 0), bz + 1 - zoneZ2[i]);
                if (ex == 0 && ez == 0) return i;
                if (ex >= zoneBord[i] || ez >= zoneBord[i]) continue;
                double e = Math.sqrt(ex * ex + ez * ez);
                double lim = zoneBord[i] * (0.5 + 0.5 * (0.65 * bruit(bx / 90.0, bz / 90.0, 900 + 2L * i) + 0.35 * bruit(bx / 33.0, bz / 33.0, 901 + 2L * i)));
                if (e < lim) return i;
                continue;
            }
            double dx = bx - zoneX[i], dz = bz - zoneZ[i], max = zoneRayon[i] + zoneBord[i];
            double d2 = dx * dx + dz * dz;
            if (d2 > max * max) continue;
            double lim = zoneRayon[i] + zoneBord[i] * (0.65 * bruit(bx / 90.0, bz / 90.0, 900 + 2L * i) + 0.35 * bruit(bx / 33.0, bz / 33.0, 901 + 2L * i));
            if (d2 < lim * lim) return i;
        }
        return -1;
    }

    /** Index de région (0..n-1) au bloc donné, bords déformés pour éviter les escaliers de pixels. */
    public int region(int bx, int bz) {
        return regionPassage(bx, bz) & 0xFF;
    }

    /** Region (8 bits bas) et regle de passage + 1 (bits 8 a 15, 0 = pas de biome de passage ici). Sans allocation. */
    public int regionPassage(int bx, int bz) {
        double wx = bx + (bruit(bx / 96.0, bz / 96.0, 11) + 0.5 * bruit(bx / 37.0, bz / 37.0, 12)) * deformation;
        double wz = bz + (bruit(bx / 96.0, bz / 96.0, 21) + 0.5 * bruit(bx / 37.0, bz / 37.0, 22)) * deformation;
        if (rnTransition > 0) {
            // 0.8.0 : frontieres de regions ondulees a grande echelle (casse les droites de la carte dessinee)
            double f = forceNaturel(bx, bz);
            if (f > 0) {
                wx += f * rnTransition * (0.7 * bruit(bx / 330.0, bz / 330.0, 391) + 0.3 * bruit(bx / 140.0, bz / 140.0, 392));
                wz += f * rnTransition * (0.7 * bruit(bx / 330.0, bz / 330.0, 393) + 0.3 * bruit(bx / 140.0, bz / 140.0, 394));
            }
        }
        int ici = indexPixel(wx, wz);
        int r = regionMelangee(bx, bz, wx, wz, ici);
        if (passageRegle == null) return r;
        int k = passageRegle[ici];
        if (k < 0) return r;
        int[] paire = passagePaire.get(k);
        if (r != paire[0] && r != paire[1]) return r;
        // largeur ondulee (0.7 a 1.2 fois la largeur declaree) : la bande de passage ne suit pas les pixels
        double lim = passageLargeur.get(k) * (0.95 + 0.25 * bruit(bx / 90.0, bz / 90.0, 61));
        return passageDist[ici] * bpp < lim ? r | ((k + 1) << 8) : r;
    }

    private int regionMelangee(int bx, int bz, double wx, double wz, int ici) {
        int r = regionProche[ici] & 0xFF;
        if (fondu <= 0) return r;
        // fondu : chaque tache (cellule bruitee, deterministe) lit la region d'un point decale d'au plus 'fondu' blocs ;
        // loin d'une frontiere le point decale tombe dans la meme region, pres d'une frontiere les deux s'entremelent
        double fx = wx + bruit(bx / 48.0, bz / 48.0, 51) * tailleFondu * 0.6;
        double fz = wz + bruit(bx / 48.0, bz / 48.0, 52) * tailleFondu * 0.6;
        long cx = (long) Math.floor(fx / tailleFondu), cz = (long) Math.floor(fz / tailleFondu);
        double ox = (hash01(cx, cz, 53) * 2 - 1) * fondu, oz = (hash01(cx, cz, 54) * 2 - 1) * fondu;
        int la = indexPixel(wx + ox, wz + oz);
        if (ileProche[la] != ileProche[ici]) return r; // jamais de melange entre deux terres separees par la mer
        return regionProche[la] & 0xFF;
    }

    private int indexPixel(double bx, double bz) {
        int px = (int) Math.floor((bx - origineX) / bpp), pz = (int) Math.floor((bz - origineZ) / bpp);
        px = Math.max(0, Math.min(w - 1, px));
        pz = Math.max(0, Math.min(h - 1, pz));
        return pz * w + px;
    }

    /** Cellule de Voronoï (taille de la région) qui décide du sous-biome ; renvoie un nombre dans [0,1). */
    public double tirageCellule(int bx, int bz, int taille, int region) {
        double wx = bx + bruit(bx / 64.0, bz / 64.0, 31) * taille * 0.25;
        double wz = bz + bruit(bx / 64.0, bz / 64.0, 32) * taille * 0.25;
        int cx = (int) Math.floor(wx / taille), cz = (int) Math.floor(wz / taille);
        double best = Double.MAX_VALUE;
        long bxC = 0, bzC = 0;
        for (int dx = -1; dx <= 1; dx++) for (int dz = -1; dz <= 1; dz++) {
            long gx = cx + dx, gz = cz + dz;
            double ox = (gx + hash01(gx, gz, 41)) * taille, oz = (gz + hash01(gx, gz, 42)) * taille;
            double dd = (ox - wx) * (ox - wx) + (oz - wz) * (oz - wz);
            if (dd < best) { best = dd; bxC = gx; bzC = gz; }
        }
        return hash01(bxC, bzC, 50 + region);
    }
}
