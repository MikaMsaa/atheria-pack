package fr.atheria.ile;

import net.minecraft.core.Holder;
import net.minecraft.resources.ResourceKey;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.tags.BiomeTags;
import net.minecraft.world.level.biome.Biome;
import net.minecraft.world.level.biome.Climate;
import net.neoforged.neoforge.common.Tags;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** Biomes de chaque région, résolus contre les biomes réellement possibles de la source d'origine. */
public final class TableBiomes {

    static final class RegionBiomes {
        Holder<Biome>[] biomes;
        int[] cumul;
        int total;
        Holder<Biome> montagne;
        int cellule;
        /** au moins un biome enneigé : les plages enneigées y sont permises */
        boolean froide;
        /** biome posé sur la bande de plage (null : pas de plage dans cette région) */
        Holder<Biome> plage;
        /** sous-biomes en taches : biome, taille (blocs), seuil du bruit, canal */
        Holder<Biome>[] taches;
        double[] tacheTaille, tacheSeuil;
        long[] tacheCanal;
        /** biomes de grottes */
        Holder<Biome>[] grottes;
        int[] cumulGrottes;
        int totalGrottes;
    }

    /** taille des cellules qui choisissent le biome de grotte (blocs) */
    static final int CELLULE_GROTTE = 160;

    /** bande de plage : côté terre (blocs), côté mer (blocs), hauteur max au-dessus de la mer */
    final int plageLargeur, plageMer, plageHauteur, mer;

    final CarteIle carte;
    final RegionBiomes[] regions;
    final Set<Holder<Biome>> sousTerrainSeulement;
    /** biomes de grottes jamais remplaces (deep_dark : cites anciennes) */
    final Set<Holder<Biome>> grottesGardees = new HashSet<>();
    /** biome de chaque regle de passage (null si absent du monde) */
    final Holder<Biome>[] passages;
    /** lagon vivant (null : biome d'origine garde) */
    final Holder<Biome> lagon, recif, passes;
    /** biome de chaque zone de biome force (null si absent du monde : la zone est ignoree) */
    final Holder<Biome>[] zones;
    /** plage normale qui remplace la plage enneigée hors des régions froides (null si absente) */
    final Holder<Biome> plage;
    final java.util.Map<CarteIle.Sculpture, Holder<Biome>> bioSculpt = new java.util.HashMap<>();
    public final List<String> avertissements = new ArrayList<>();

    @SuppressWarnings("unchecked")
    TableBiomes(CarteIle carte, Set<Holder<Biome>> possibles, Climate.ParameterList<Holder<Biome>> parametres) {
        this.carte = carte;
        Map<ResourceLocation, Holder<Biome>> parId = new HashMap<>();
        for (Holder<Biome> h : possibles) {
            h.unwrapKey().map(ResourceKey::location).ifPresent(id -> parId.put(id, h));
        }
        regions = new RegionBiomes[carte.regions.size()];
        for (int r = 0; r < regions.length; r++) {
            CarteIle.Region def = carte.regions.get(r);
            RegionBiomes rb = new RegionBiomes();
            List<Holder<Biome>> liste = new ArrayList<>();
            List<Integer> poids = new ArrayList<>();
            for (int i = 0; i < def.biomes.size(); i++) {
                Holder<Biome> h = trouver(parId, def.biomes.get(i), def.nom);
                if (h != null) { liste.add(h); poids.add(def.poids.get(i)); }
            }
            rb.biomes = liste.toArray(new Holder[0]);
            rb.cumul = new int[poids.size()];
            int t = 0;
            for (int i = 0; i < poids.size(); i++) { t += poids.get(i); rb.cumul[i] = t; }
            rb.total = t;
            rb.montagne = def.montagne == null ? null : trouver(parId, def.montagne, def.nom);
            rb.cellule = def.cellule;
            for (Holder<Biome> h : rb.biomes) if (h.is(Tags.Biomes.IS_SNOWY)) rb.froide = true;
            if (rb.montagne != null && rb.montagne.is(Tags.Biomes.IS_SNOWY)) rb.froide = true;
            if (rb.biomes.length == 0) avertissements.add("region '" + def.nom + "' : aucun biome valide, la generation d'origine est gardee");
            // taches : seuil du bruit pour que la part demandee soit couverte (quantile mesure une fois ici)
            List<Holder<Biome>> tl = new ArrayList<>();
            List<double[]> tv = new ArrayList<>();
            for (int i = 0; i < def.taches.size(); i++) {
                Holder<Biome> h = trouver(parId, def.taches.get(i), def.nom);
                if (h == null) continue;
                long canal = 300L + r * 8L + i;
                tl.add(h);
                tv.add(new double[]{def.tachesTaille.get(i), seuil(carte, canal, def.tachesPart.get(i)), canal});
            }
            rb.taches = tl.toArray(new Holder[0]);
            rb.tacheTaille = new double[tv.size()];
            rb.tacheSeuil = new double[tv.size()];
            rb.tacheCanal = new long[tv.size()];
            for (int i = 0; i < tv.size(); i++) { rb.tacheTaille[i] = tv.get(i)[0]; rb.tacheSeuil[i] = tv.get(i)[1]; rb.tacheCanal[i] = (long) tv.get(i)[2]; }
            List<Holder<Biome>> gl = new ArrayList<>();
            List<Integer> gp = new ArrayList<>();
            for (int i = 0; i < def.grottes.size(); i++) {
                Holder<Biome> h = trouver(parId, def.grottes.get(i), def.nom);
                if (h != null) { gl.add(h); gp.add(def.grottesPoids.get(i)); }
            }
            rb.grottes = gl.toArray(new Holder[0]);
            rb.cumulGrottes = new int[gp.size()];
            int tg = 0;
            for (int i = 0; i < gp.size(); i++) { tg += gp.get(i); rb.cumulGrottes[i] = tg; }
            rb.totalGrottes = tg;
            regions[r] = rb;
        }
        // biomes qui n'existent que sous terre dans la table de climat (grottes)
        Set<Holder<Biome>> enSurface = new HashSet<>(), dessous = new HashSet<>();
        if (parametres != null) {
            for (var p : parametres.values()) {
                Climate.Parameter prof = p.getFirst().depth();
                if (prof.min() > 0 && prof.max() < Climate.quantizeCoord(1.0F)) dessous.add(p.getSecond());
                else enSurface.add(p.getSecond());
            }
        }
        dessous.removeAll(enSurface);
        sousTerrainSeulement = dessous;
        Holder<Biome> dd = parId.get(ResourceLocation.withDefaultNamespace("deep_dark"));
        if (dd != null) grottesGardees.add(dd);
        passages = new Holder[carte.passageBiome.size()];
        for (int k = 0; k < passages.length; k++) {
            int[] pr = carte.passagePaire.get(k);
            passages[k] = trouver(parId, carte.passageBiome.get(k), "passage " + carte.regions.get(pr[0]).nom + " / " + carte.regions.get(pr[1]).nom);
        }
        lagon = carte.lagonBiome == null ? null : trouver(parId, carte.lagonBiome, "lagon");
        recif = carte.recifBiome == null ? null : trouver(parId, carte.recifBiome, "recif");
        passes = carte.passesBiome == null ? null : trouver(parId, carte.passesBiome, "passes du lagon");
        zones = new Holder[carte.zoneBiome.length];
        for (int i = 0; i < zones.length; i++) zones[i] = trouver(parId, carte.zoneBiome[i], "zone " + carte.zoneNom[i]);
        plage = parId.get(ResourceLocation.withDefaultNamespace("beach"));
        for (CarteIle.Sculpture s : carte.sculptures) if (s.biomeTerre != null) { Holder<Biome> h = trouver(parId, s.biomeTerre, s.nom); if (h != null) bioSculpt.put(s, h); }
        Holder<Biome> plageNeige = parId.get(ResourceLocation.withDefaultNamespace("snowy_beach"));
        plageLargeur = entier(carte, "plage_largeur_blocs", 24);
        plageMer = entier(carte, "plage_cote_mer_blocs", 8);
        plageHauteur = entier(carte, "plage_hauteur_max_blocs", 5);
        mer = entier(carte, "niveau_mer", 63);
        for (int r = 0; r < regions.length; r++) {
            CarteIle.Region def = carte.regions.get(r);
            RegionBiomes rb = regions[r];
            if (def.plageDefinie) rb.plage = def.plage == null ? null : trouver(parId, def.plage, def.nom);
            else rb.plage = rb.froide && plageNeige != null ? plageNeige : plage;
        }
        for (String a : avertissements) CarteIle.LOG.warn("[atheria_ile] {}", a);
    }

    /** seuil du bruit de taches au-dessus duquel tombe la part demandee des points (4096 echantillons) */
    private static double seuil(CarteIle carte, long canal, double part) {
        int n = 4096;
        double[] v = new double[n];
        for (int i = 0; i < n; i++) v[i] = carte.bruit(i * 0.6180339887 * 7.3, (i % 64) * 1.4142135623 + i * 0.0137, canal);
        java.util.Arrays.sort(v);
        int k = (int) Math.min(n - 1, Math.max(0, Math.round((1 - part) * n)));
        return v[k];
    }

    private static int entier(CarteIle carte, String cle, int defaut) {
        return carte.config.has(cle) && !carte.config.get(cle).isJsonNull() ? carte.config.get(cle).getAsInt() : defaut;
    }

    /** Le point (bloc) est-il sur la bande de plage : près de la côte de la carte et presque au niveau de la mer ? */
    boolean surPlage(int bx, int by, int bz) {
        if (plageLargeur <= 0 || by < mer - 3 || by > mer + plageHauteur) return false;
        double d = carte.distanceBlocs(bx, bz);
        return d > -plageMer && d < plageLargeur;
    }

    private Holder<Biome> trouver(Map<ResourceLocation, Holder<Biome>> parId, String id, String region) {
        ResourceLocation rl = ResourceLocation.tryParse(id);
        Holder<Biome> h = rl == null ? null : parId.get(rl);
        if (h == null) avertissements.add("region '" + region + "' : biome '" + id + "' absent du monde, ignore");
        return h;
    }

    /** Garde le biome d'origine pour l'eau, les plages, les rivières et les grottes. */
    boolean garder(Holder<Biome> base) {
        return base.is(BiomeTags.IS_OCEAN) || base.is(BiomeTags.IS_DEEP_OCEAN) || base.is(BiomeTags.IS_RIVER)
                || base.is(BiomeTags.IS_BEACH) || grotte(base);
    }

    boolean grotte(Holder<Biome> base) {
        return base.is(Tags.Biomes.IS_UNDERGROUND) || base.is(Tags.Biomes.IS_CAVE) || sousTerrainSeulement.contains(base);
    }

    private static Holder<Biome> tirer(Holder<Biome>[] bs, int[] cumul, int total, double u) {
        int t = (int) (u * total);
        for (int i = 0; i < cumul.length; i++) if (t < cumul[i]) return bs[i];
        return bs[bs.length - 1];
    }

    /** 0.9.6g : le controle 0.9.6e (lieu sculpte cotier sans biome froid) est refait sur le biome FINAL : la table de la region
     *  peut tirer un biome froid apres coup (terralith:gravel_desert, glace a Y 62 dans la zone humide, c23 du 15/11). */
    public Holder<Biome> choisir(Holder<Biome> base, int bx, int by, int bz) {
        Holder<Biome> r = choisir0(base, bx, by, bz);
        if (carte.rnSculpturesChaudes && r != lagon && r != plage && !carte.sculptures.isEmpty() && !grotte(r)
                && r.value().getBaseTemperature() < 0.15f) {
            CarteIle.Sculpture s = carte.sculptureA(bx, bz);
            if (s != null && !s.ilot) {
                double hy = s.haut[(bz - s.z0) * s.w + (bx - s.x0)];
                if (hy < 62.5) { if (lagon != null) return lagon; }
                else if (hy < 66 && plage != null) return plage;
            }
        }
        return r;
    }

    private Holder<Biome> choisir0(Holder<Biome> base, int bx, int by, int bz) {
        // zone sans plage ("plage": false, port de Longoni) : le biome de la zone va jusqu'a l'eau,
        // sur la terre de la carte seulement, jamais sur l'eau, le lagon, les rivieres ni les grottes
        if (zones.length > 0) {
            int z = carte.zoneBiome(bx, bz);
            if (z >= 0 && zones[z] != null && !grotte(base)) {
                if (!carte.zonePlage[z] && !base.is(BiomeTags.IS_OCEAN) && !base.is(BiomeTags.IS_DEEP_OCEAN)
                        && !base.is(BiomeTags.IS_RIVER) && carte.distanceBlocs(bx, bz) >= 0) return zones[z];
                // "lacs": true (lac vert de Somaco) : l'eau des lacs dessines prend le biome de la zone ;
                // seulement sur une classe de region de la carte (>= 3), donc jamais la mer, le lagon ni le recif
                if (carte.zoneLacs[z] && (base.is(BiomeTags.IS_OCEAN) || base.is(BiomeTags.IS_DEEP_OCEAN) || base.is(BiomeTags.IS_RIVER))
                        && carte.classeA(bx, bz) >= 3) return zones[z];
            }
        }
        // 0.9.5d : lieu sculpte en mer (ilot) : plage sur la terre sculptee, lagon sous l'eau (jamais de biome froid ni de glace)
        if (!carte.sculptures.isEmpty() && !grotte(base)) {
            CarteIle.Sculpture s = carte.sculptureA(bx, bz);
            if (s != null && s.ilot) {                                        // 0.9.6b : quelle que soit la classe (le bord de l'ilot A etait en classe terre : glace)
                double hy = s.haut[(bz - s.z0) * s.w + (bx - s.x0)];
                if (hy >= 62.5) { Holder<Biome> bt = hy >= 64.5 ? bioSculpt.get(s) : null; if (bt != null) return bt; if (plage != null) return plage; }   // biome_terre au-dessus de 64 (criques basses en sable)
                if (lagon != null) return lagon;
            }
            // 0.9.6e : lieu sculpte cotier : biome garde, sauf s'il est froid (< 0.15 : neige, glace) -> plage sur la terre, lagon sur l'eau
            //         seulement au bord de mer (carte < 66) : la neige voulue des sommets (z009, z013) reste
            if (s != null && !s.ilot && carte.rnSculpturesChaudes && base.value().getBaseTemperature() < 0.15f) {
                double hy = s.haut[(bz - s.z0) * s.w + (bx - s.x0)];
                if (hy < 62.5) { if (lagon != null) return lagon; }
                else if (hy < 66 && plage != null) return plage;
            }
        }
        // 0.9.6d : ilots de sable (+ anneau) : jamais de biome froid (glace a Y 62 sur l'ilot A, neige sur les palmiers du Phare, c21 du 15/11)
        if (carte.rnIlotsChauds > 0 && !grotte(base) && carte.dansIlotSable(bx, bz, carte.rnIlotsChauds)) {
            if (base.is(BiomeTags.IS_OCEAN) || base.is(BiomeTags.IS_DEEP_OCEAN)) { if (lagon != null) return lagon; }
            else if (plage != null) return plage;
        }
        // 0.9.5 : lagon et recif de la carte, loin de la terre de la carte (48 blocs, sans deformation) : biome du lagon force,
        // meme si le terrain de base y emerge (sinon un biome de terre froid gele l'eau : ile parasite blanche du 15/11)
        if (carte.rnLagonBiome > 0 && (lagon != null || recif != null) && !grotte(base) && !base.is(BiomeTags.IS_RIVER)) {
            int cl = carte.classeA(bx, bz);
            if ((cl == CarteIle.LAGON || cl == CarteIle.RECIF) && carte.distanceCarteBrute(bx, bz) < -48 && !carte.dansIlotSable(bx, bz)) {
                Holder<Biome> b = cl == CarteIle.LAGON ? lagon : recif;
                if (b != null) return passes != null && carte.dansPasse(bx, bz) ? passes : b;
            }
        }
        // plages : la carte remet du sable sur toute côte basse (sauf rivières, grands fonds et grottes)
        // (test de hauteur et de distance d'abord : le moins cher ; aucune allocation, les holders sont resolus au constructeur)
        if (surPlage(bx, by, bz) && !base.is(BiomeTags.IS_RIVER) && !base.is(BiomeTags.IS_DEEP_OCEAN)
                && !base.is(Tags.Biomes.IS_UNDERGROUND) && !base.is(Tags.Biomes.IS_CAVE) && !sousTerrainSeulement.contains(base)) {
            Holder<Biome> p = regions[carte.region(bx, bz)].plage;
            if (p != null) return p;
        }
        if (garder(base)) {
            // grottes : biome de grotte de la region (sauf deep_dark, garde pour les cites anciennes)
            if (grotte(base)) {
                if (grottesGardees.contains(base)) return base;
                int r = carte.region(bx, bz);
                RegionBiomes rb = regions[r];
                if (rb.grottes.length == 0) return base;
                return tirer(rb.grottes, rb.cumulGrottes, rb.totalGrottes, carte.tirageCellule(bx, bz, CELLULE_GROTTE, r + 100));
            }
            // lagon vivant : fond de sable, coraux et herbiers (ocean chaud), passes plus profondes
            if ((lagon != null || recif != null) && base.is(BiomeTags.IS_OCEAN) && !base.is(BiomeTags.IS_RIVER)) {
                int cl = carte.classeA(bx, bz);
                Holder<Biome> b = cl == CarteIle.LAGON ? lagon : cl == CarteIle.RECIF ? recif : null;
                if (b != null) return passes != null && carte.dansPasse(bx, bz) ? passes : b;
            }
            // pas de plage enneigée sur une côte tropicale
            if (plage != null && base.is(BiomeTags.IS_BEACH) && base.is(Tags.Biomes.IS_SNOWY)
                    && !regions[carte.region(bx, bz)].froide) return plage;
            return base;
        }
        // zone de biome force (port de Longoni...) : surface seulement, l'eau, les plages et les grottes sont gardees plus haut
        if (zones.length > 0) {
            int z = carte.zoneBiome(bx, bz);
            if (z >= 0 && zones[z] != null) return zones[z];
        }
        int rp = carte.regionPassage(bx, bz);
        int r = rp & 0xFF;
        RegionBiomes rb = regions[r];
        if (rb.biomes.length == 0) return base;
        if (rb.montagne != null && base.is(BiomeTags.IS_MOUNTAIN)) return rb.montagne;
        // bande de passage entre deux regions voisines
        int k = (rp >> 8) - 1;
        if (k >= 0 && passages[k] != null) return passages[k];
        // sous-biomes en taches
        for (int i = 0; i < rb.taches.length; i++) {
            double tt = rb.tacheTaille[i];
            if (carte.bruit(bx / tt, bz / tt, rb.tacheCanal[i]) > rb.tacheSeuil[i]) return rb.taches[i];
        }
        if (rb.biomes.length == 1) return rb.biomes[0];
        return tirer(rb.biomes, rb.cumul, rb.total, carte.tirageCellule(bx, bz, rb.cellule, r));
    }

    /** Pour le rapport : biome attendu a ce bloc (region, ou zone de biome force qui le couvre) ? */
    public boolean attendu(int region, Holder<Biome> b, int bx, int bz) {
        if (attendu(region, b)) return true;
        int z = zones.length == 0 ? -1 : carte.zoneBiome(bx, bz);
        return z >= 0 && b.equals(zones[z]);
    }

    /** Pour le rapport : la région accepte-t-elle ce biome ? */
    public boolean attendu(int region, Holder<Biome> b) {
        RegionBiomes rb = regions[region];
        if (b.equals(rb.montagne)) return true;
        if (b.equals(plage) || b.equals(rb.plage)) return true;
        for (Holder<Biome> h : rb.biomes) if (h.equals(b)) return true;
        for (Holder<Biome> h : rb.taches) if (h.equals(b)) return true;
        for (Holder<Biome> h : rb.grottes) if (h.equals(b)) return true;
        for (int k = 0; k < passages.length; k++) {
            int[] p = carte.passagePaire.get(k);
            if ((p[0] == region || p[1] == region) && b.equals(passages[k])) return true;
        }
        return false;
    }
}
