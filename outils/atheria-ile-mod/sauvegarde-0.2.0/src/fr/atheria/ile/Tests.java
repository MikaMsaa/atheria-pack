package fr.atheria.ile;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Holder;
import net.minecraft.core.QuartPos;
import net.minecraft.resources.ResourceKey;
import net.minecraft.server.MinecraftServer;
import net.minecraft.server.level.ServerChunkCache;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.server.level.TicketType;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.biome.Biome;
import net.minecraft.world.level.biome.BiomeSource;
import net.minecraft.world.level.biome.Climate;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.chunk.ChunkGenerator;
import net.minecraft.world.level.levelgen.Heightmap;
import net.minecraft.world.level.levelgen.RandomState;
import net.minecraft.world.level.material.MapColor;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Contrôles automatiques : rendu de toute l'île sans générer de chunk (relief + biomes),
 * puis génération réelle d'une petite zone et vue du dessus, puis arrêt du serveur si demandé.
 */
public final class Tests {
    private static final AtomicBoolean RENDU_EN_COURS = new AtomicBoolean(false);
    private static volatile boolean renduFini;
    private static volatile boolean arretDemande;
    private static ArrayDeque<ChunkPos> aGenerer;
    private static int zoneTotal, zoneX, zoneZ, zoneRayon;
    private static long zoneDebut;
    private static int zoneFaits;
    /** chunks demandes en meme temps (generation sur les fils du serveur, pas sur le thread principal) */
    private static final int EN_VOL_MAX = 24;
    private static final long ZONE_DELAI_MS = 30 * 60_000L;
    private static final TicketType<ChunkPos> TICKET = TicketType.create("atheria_ile_test", Comparator.comparingLong(ChunkPos::toLong));
    private static final List<ChunkPos> enVol = new ArrayList<>();
    private static final List<ChunkPos> tenus = new ArrayList<>();
    private static volatile MinecraftServer serveur;
    /** Passe à true à l'arrêt du serveur : tout calcul en cours s'interrompt. */
    private static volatile boolean annule;

    private Tests() {}

    static void demarrage(MinecraftServer server) {
        if (!server.isRunning()) return;
        annule = false;
        serveur = server;
        renduFini = false;
        aGenerer = null;
        CarteIle c = CarteIle.active();
        if (c == null) {
            CarteIle.LOG.info("[atheria_ile] aucune ile dans ce monde (datapack absent) : le mod ne fait rien");
            return;
        }
        arretDemande = bool(c.config, "arret_apres_tests");
        boolean rendu = bool(c.config, "rendu_au_demarrage");
        JsonElement zone = c.config.get("zone_reelle");
        if (zone != null && zone.isJsonObject()) {
            JsonObject z = zone.getAsJsonObject();
            zoneX = z.get("x").getAsInt();
            zoneZ = z.get("z").getAsInt();
            zoneRayon = Math.max(1, Math.min(48, z.get("rayon_chunks").getAsInt()));
        } else {
            zoneRayon = 0;
        }
        if (rendu) lancerRendu(server, true);
        else renduFini = true;
    }

    static void arreter() {
        annule = true;
        serveur = null;
        aGenerer = null;
    }

    private static boolean bool(JsonObject o, String k) {
        return o.has(k) && !o.get(k).isJsonNull() && o.get(k).getAsBoolean();
    }

    static boolean lancerRendu(MinecraftServer server, boolean auto) {
        CarteIle c = CarteIle.active();
        if (c == null || annule || !server.isRunning() || !RENDU_EN_COURS.compareAndSet(false, true)) return false;
        Thread t = new Thread(() -> {
            try {
                rendu(server, c);
            } catch (Throwable e) {
                CarteIle.LOG.error("[atheria_ile] ECHEC du rendu", e);
                ecrire(c, "rapport.txt", "ECHEC du rendu :\n" + pile(e));
            } finally {
                RENDU_EN_COURS.set(false);
                if (auto) renduFini = true;
            }
        }, "atheria_ile-rendu");
        t.setDaemon(true);
        t.start();
        return true;
    }

    // ------------------------------------------------------------------ rendu analytique (sans chunk)

    private static void rendu(MinecraftServer server, CarteIle c) throws Exception {
        long debut = System.currentTimeMillis();
        ServerLevel niveau = server.overworld();
        ChunkGenerator gen = niveau.getChunkSource().getGenerator();
        RandomState rs = niveau.getChunkSource().randomState();
        BiomeSource source = gen.getBiomeSource();
        Climate.Sampler sampler = rs.sampler();
        int mer = gen.getSeaLevel();
        int pas = c.config.has("rendu_pas_blocs") ? Math.max(4, c.config.get("rendu_pas_blocs").getAsInt()) : 32;
        int largeurBlocs = c.w * c.bpp, hauteurBlocs = c.h * c.bpp;
        int nx = largeurBlocs / pas, nz = hauteurBlocs / pas;
        int[] hauteur = new int[nx * nz];
        @SuppressWarnings("unchecked") Holder<Biome>[] biome = new Holder[nx * nz];

        int fils = Math.max(1, Math.min(4, Runtime.getRuntime().availableProcessors() - 1));
        ExecutorService pool = Executors.newFixedThreadPool(fils, r -> {
            Thread t = new Thread(r, "atheria_ile-rendu-calcul");
            t.setDaemon(true);
            return t;
        });
        List<Future<?>> taches = new ArrayList<>();
        for (int j0 = 0; j0 < nz; j0++) {
            final int j = j0;
            taches.add(pool.submit(() -> {
                if (annule || !server.isRunning()) return;
                for (int i = 0; i < nx; i++) {
                    if (annule) return;
                    int x = (int) c.origineX + i * pas + pas / 2, z = (int) c.origineZ + j * pas + pas / 2;
                    int hh = gen.getBaseHeight(x, z, Heightmap.Types.OCEAN_FLOOR_WG, niveau, rs);
                    hauteur[j * nx + i] = hh;
                    int y = Math.max(hh, mer);
                    biome[j * nx + i] = source.getNoiseBiome(QuartPos.fromBlock(x), QuartPos.fromBlock(y), QuartPos.fromBlock(z), sampler);
                }
            }));
        }
        try {
            int fait = 0;
            for (Future<?> f : taches) {
                if (annule || !server.isRunning()) {
                    CarteIle.LOG.info("[atheria_ile] rendu annule : le serveur s'arrete");
                    return;
                }
                f.get();
                if (++fait % 75 == 0) CarteIle.LOG.info("[atheria_ile] rendu : {} / {} lignes", fait, nz);
            }
        } finally {
            pool.shutdownNow();
        }
        if (annule) return;

        TableBiomes table = IleSources.derniere;
        BufferedImage imgBiomes = new BufferedImage(nx, nz, BufferedImage.TYPE_INT_RGB);
        BufferedImage imgRelief = new BufferedImage(nx, nz, BufferedImage.TYPE_INT_RGB);
        BufferedImage imgEcarts = new BufferedImage(nx, nz, BufferedImage.TYPE_INT_RGB);
        Map<String, Integer> couleurs = new HashMap<>();
        int francsEauDouce = 0, francsVase = 0, francsMerDansTerre = 0, francsTerreDansMer = 0, rivDessEau = 0, rivDess = 0;
        int terreImage = 0, terreReelle = 0, ecartsFrancs = 0, ecartsCote = 0, echantillonsTerre = 0, etrangers = 0, ecartsRiviere = 0, plagesNeigeTropicales = 0;
        int hMin = Integer.MAX_VALUE, hMax = Integer.MIN_VALUE;
        Map<String, Map<String, Integer>> parRegion = new TreeMap<>();
        Map<String, Integer> etrangersParBiome = new TreeMap<>();
        for (int j = 0; j < nz; j++) {
            for (int i = 0; i < nx; i++) {
                int k = j * nx + i;
                int x = (int) c.origineX + i * pas + pas / 2, z = (int) c.origineZ + j * pas + pas / 2;
                int hh = hauteur[k];
                hMin = Math.min(hMin, hh);
                hMax = Math.max(hMax, hh);
                boolean terreR = hh > mer;
                boolean terreI = c.classeA(x, z) >= 3;
                if (terreI) terreImage++;
                if (terreR) terreReelle++;
                double d = c.distanceBlocs(x, z);
                boolean riviere = !terreR && terreI && biome[k].is(net.minecraft.tags.BiomeTags.IS_RIVER);
                if (riviere) ecartsRiviere++;
                else if (terreR != terreI) {
                    if (Math.abs(d) > 96) {
                        ecartsFrancs++;
                        double pxx = (x - c.origineX) / c.bpp, pzz = (z - c.origineZ) / c.bpp;
                        int ip = Math.max(0, Math.min(c.h - 1, (int) pzz)) * c.w + Math.max(0, Math.min(c.w - 1, (int) pxx));
                        double dEauDouce = Math.min(c.dRiviere[ip], c.dLac[ip]) * c.bpp;
                        if (dEauDouce < c.valleeRiviere) francsEauDouce++;
                        else if ("vase".equals(c.regions.get(c.region(x, z)).cote)) francsVase++;
                        else if (terreI) francsMerDansTerre++;
                        else francsTerreDansMer++;
                    }
                    else ecartsCote++;
                }
                {
                    double pxx = (x - c.origineX) / c.bpp, pzz = (z - c.origineZ) / c.bpp;
                    int ip = Math.max(0, Math.min(c.h - 1, (int) pzz)) * c.w + Math.max(0, Math.min(c.w - 1, (int) pxx));
                    if (c.dRiviere[ip] < 0.5f || c.dLac[ip] < 0.5f) { rivDess++; if (!terreR) rivDessEau++; }
                }
                if (terreR && biome[k].is(net.minecraft.tags.BiomeTags.IS_BEACH) && biome[k].is(net.neoforged.neoforge.common.Tags.Biomes.IS_SNOWY)
                        && table != null && !table.regions[c.region(x, z)].froide) plagesNeigeTropicales++;
                String id = nom(biome[k]);
                int coul = couleurs.computeIfAbsent(id, Tests::couleurBiome);
                double ombre = terreR ? 0.75 + 0.25 * Math.min(1.0, (hh - mer) / 120.0) : 0.55;
                imgBiomes.setRGB(i, j, assombrir(coul, ombre));
                imgRelief.setRGB(i, j, terreR ? gris(hh, mer) : eau(hh, mer));
                int ec = 0x202020;
                if (riviere) ec = 0x3060FF;
                else if (terreR != terreI) ec = Math.abs(d) > 96 ? 0xFF2020 : 0xFFA040;
                if (terreR && table != null) {
                    echantillonsTerre++;
                    int r = c.region(x, z);
                    String nomR = c.regions.get(r).nom;
                    parRegion.computeIfAbsent(nomR, n -> new TreeMap<>()).merge(id, 1, Integer::sum);
                    if (!table.garder(biome[k]) && !table.attendu(r, biome[k])) {
                        etrangers++;
                        etrangersParBiome.merge(id, 1, Integer::sum);
                        ec = 0xFFFF00;
                    } else if (ec == 0x202020) {
                        ec = 0x2E6B3A;
                    }
                }
                imgEcarts.setRGB(i, j, ec);
            }
        }
        Path dossier = c.dossier.resolve("rendus");
        Files.createDirectories(dossier);
        ImageIO.write(imgBiomes, "png", dossier.resolve("rendu-biomes.png").toFile());
        ImageIO.write(imgRelief, "png", dossier.resolve("rendu-relief.png").toFile());
        ImageIO.write(imgEcarts, "png", dossier.resolve("rendu-ecarts.png").toFile());

        StringBuilder sb = new StringBuilder();
        long ms = System.currentTimeMillis() - debut;
        int total = nx * nz;
        sb.append("RENDU DE L'ILE (sans generer de chunk)\n");
        sb.append(String.format("echantillons : %d x %d (1 tous les %d blocs), duree %.1f s%n", nx, nz, pas, ms / 1000.0));
        sb.append(String.format("hauteur du fond : min %d, max %d, niveau de la mer %d%n", hMin, hMax, mer));
        sb.append(String.format("terre sur l'image : %.1f %%, terre generee : %.1f %%%n", 100.0 * terreImage / total, 100.0 * terreReelle / total));
        sb.append(String.format("ecarts terre/mer pres des cotes (< 96 blocs) : %d (%.2f %%)%n", ecartsCote, 100.0 * ecartsCote / total));
        sb.append(String.format("rivieres dans les terres (normal, en bleu) : %d (%.2f %%)%n", ecartsRiviere, 100.0 * ecartsRiviere / total));
        sb.append(String.format("ecarts terre/mer FRANCS hors rivieres (> 96 blocs de la cote) : %d (%.2f %%)%n", ecartsFrancs, 100.0 * ecartsFrancs / total));
        sb.append(String.format("   dont pres d'une riviere/lac dessine (voulu) : %d, regions a cote de vase (voulu) : %d, eau dans les terres : %d, terre en mer : %d%n",
                francsEauDouce, francsVase, francsMerDansTerre, francsTerreDansMer));
        sb.append(String.format("   ecarts francs hors voulus : %d (%.2f %%)%n", francsMerDansTerre + francsTerreDansMer, 100.0 * (francsMerDansTerre + francsTerreDansMer) / total));
        sb.append(String.format("rivieres et lacs dessines : %d echantillons, %d en eau (%.0f %%)%n", rivDess, rivDessEau, rivDess == 0 ? 0 : 100.0 * rivDessEau / rivDess));
        sb.append(String.format("plages enneigees dans une region non froide : %d (attendu 0)%n", plagesNeigeTropicales));
        sb.append(String.format("biomes de surface hors liste de leur region : %d sur %d echantillons de terre (%.2f %%)%n",
                etrangers, echantillonsTerre, echantillonsTerre == 0 ? 0 : 100.0 * etrangers / echantillonsTerre));
        etrangersParBiome.forEach((b, n) -> sb.append("   hors liste : ").append(b).append(" x").append(n).append('\n'));
        if (table != null) for (String a : table.avertissements) sb.append("AVERTISSEMENT : ").append(a).append('\n');
        else sb.append("AVERTISSEMENT : aucune table de biomes construite (la source de biomes n'a pas ete reconnue)\n");
        sb.append("\nBIOMES PAR REGION (echantillons de terre)\n");
        parRegion.forEach((r, m) -> {
            int t = m.values().stream().mapToInt(Integer::intValue).sum();
            sb.append(r).append(" (").append(t).append(")\n");
            m.entrySet().stream().sorted((a, b) -> b.getValue() - a.getValue())
                    .forEach(e -> sb.append(String.format("   %5.1f %%  %s%n", 100.0 * e.getValue() / t, e.getKey())));
        });
        sb.append("\nLEGENDE rendu-biomes.png\n");
        new TreeMap<>(couleurs).forEach((b, col) -> sb.append(String.format("   #%06x  %s%n", col, b)));
        ecrire(c, "rapport.txt", sb.toString());
        CarteIle.LOG.info("[atheria_ile] rendu termine en {} s : ecarts francs {} / {}, rivieres {}, biomes hors liste {}, plages enneigees tropicales {}", ms / 1000, ecartsFrancs, total, ecartsRiviere, etrangers, plagesNeigeTropicales);
    }

    private static String nom(Holder<Biome> h) {
        return h.unwrapKey().map(ResourceKey::location).map(Object::toString).orElse("?");
    }

    private static int couleurBiome(String id) {
        long v = id.hashCode() * 0x9E3779B97F4A7C15L;
        float teinte = ((v >>> 40) & 0xFFFF) / 65535f;
        float sat = 0.45f + ((v >>> 20) & 0xFF) / 255f * 0.4f;
        float lum = 0.65f + ((v >>> 8) & 0xFF) / 255f * 0.3f;
        if (id.contains("ocean")) return 0x1E3F8A;
        if (id.contains("river")) return 0x3F76E4;
        if (id.contains("beach")) return 0xE8DCA0;
        return java.awt.Color.HSBtoRGB(teinte, sat, lum) & 0xFFFFFF;
    }

    private static int assombrir(int c, double f) {
        int r = (int) (((c >> 16) & 255) * f), g = (int) (((c >> 8) & 255) * f), b = (int) ((c & 255) * f);
        return (r << 16) | (g << 8) | b;
    }

    private static int gris(int h, int mer) {
        int v = (int) Math.max(40, Math.min(255, 70 + (h - mer) * 1.2));
        return (v << 16) | (v << 8) | v;
    }

    private static int eau(int h, int mer) {
        int prof = Math.max(0, mer - h);
        int b = Math.max(60, 230 - prof * 4);
        return (20 << 16) | ((b / 2) << 8) | b;
    }

    // ------------------------------------------------------------------ zone réelle (chunks générés)

    static void tick(MinecraftServer server) {
        if (serveur != server || !renduFini || annule || !server.isRunning()) return;
        CarteIle c = CarteIle.active();
        if (c == null) return;
        if (aGenerer == null) {
            aGenerer = new ArrayDeque<>();
            enVol.clear();
            tenus.clear();
            zoneFaits = 0;
            if (zoneRayon > 0) {
                int cx = zoneX >> 4, cz = zoneZ >> 4;
                for (int dz = -zoneRayon; dz <= zoneRayon; dz++)
                    for (int dx = -zoneRayon; dx <= zoneRayon; dx++) aGenerer.add(new ChunkPos(cx + dx, cz + dz));
                zoneTotal = aGenerer.size();
                zoneDebut = System.currentTimeMillis();
                CarteIle.LOG.info("[atheria_ile] generation reelle de {} chunks autour de {} {}", zoneTotal, zoneX, zoneZ);
            } else {
                zoneTotal = 0;
            }
        }
        ServerLevel niveau = server.overworld();
        ServerChunkCache cache = niveau.getChunkSource();
        // demandes par tickets : le thread serveur ne bloque jamais sur la generation
        while (enVol.size() < EN_VOL_MAX && !aGenerer.isEmpty()) {
            ChunkPos p = aGenerer.poll();
            // le ticket suffit : le serveur genere le chunk sur ses fils, pendant ses ticks normaux
            cache.addRegionTicket(TICKET, p, 0, p);
            tenus.add(p);
            enVol.add(p);
        }
        int avant = zoneFaits;
        enVol.removeIf(p -> {
            if (cache.getChunkNow(p.x, p.z) == null) return false; // non bloquant
            zoneFaits++;
            return true;
        });
        if (zoneFaits / 50 != avant / 50) {
            CarteIle.LOG.info("[atheria_ile] zone reelle : {} / {} chunks ({} s)", zoneFaits, zoneTotal, (System.currentTimeMillis() - zoneDebut) / 1000);
        }
        if (zoneTotal > 0 && zoneFaits < zoneTotal) {
            if (System.currentTimeMillis() - zoneDebut > ZONE_DELAI_MS) {
                CarteIle.LOG.error("[atheria_ile] zone reelle abandonnee : {} / {} chunks en {} min", zoneFaits, zoneTotal, ZONE_DELAI_MS / 60000);
                ecrire(c, "rapport-zone.txt", "ECHEC : generation trop lente, " + zoneFaits + " / " + zoneTotal + " chunks\n");
                libererTickets(cache);
                fin(server);
            }
            return;
        }
        if (zoneTotal > 0) {
            try {
                vueDuDessus(niveau, c);
            } catch (Throwable e) {
                CarteIle.LOG.error("[atheria_ile] ECHEC de la vue du dessus", e);
                ecrire(c, "rapport-zone.txt", "ECHEC :\n" + pile(e));
            }
            libererTickets(cache);
        }
        fin(server);
    }

    private static void libererTickets(ServerChunkCache cache) {
        for (ChunkPos p : tenus) cache.removeRegionTicket(TICKET, p, 0, p);
        tenus.clear();
        enVol.clear();
    }

    private static void fin(MinecraftServer server) {
        renduFini = false; // une seule fois par démarrage
        if (arretDemande) {
            CarteIle.LOG.info("[atheria_ile] tests termines, arret du serveur demande par la config");
            server.halt(false);
        }
    }

    private static void vueDuDessus(ServerLevel niveau, CarteIle c) {
        int cx = zoneX >> 4, cz = zoneZ >> 4;
        int x0 = (cx - zoneRayon) << 4, z0 = (cz - zoneRayon) << 4;
        int taille = (2 * zoneRayon + 1) << 4;
        BufferedImage img = new BufferedImage(taille, taille, BufferedImage.TYPE_INT_RGB);
        BlockPos.MutableBlockPos pos = new BlockPos.MutableBlockPos();
        int mer = niveau.getSeaLevel();
        int terre = 0, eau = 0, hMax = Integer.MIN_VALUE;
        Map<String, Integer> biomes = new TreeMap<>();
        for (int z = 0; z < taille; z++) {
            for (int x = 0; x < taille; x++) {
                int bx = x0 + x, bz = z0 + z;
                int y = niveau.getHeight(Heightmap.Types.WORLD_SURFACE, bx, bz) - 1;
                pos.set(bx, y, bz);
                BlockState st = niveau.getBlockState(pos);
                MapColor mc = st.getMapColor(niveau, pos);
                int col = mc == MapColor.NONE ? 0 : mc.col;
                double f = 0.8 + Math.max(-0.25, Math.min(0.2, (y - mer) / 160.0));
                img.setRGB(x, z, assombrir(col, f));
                if (st.getFluidState().isEmpty()) terre++; else eau++;
                hMax = Math.max(hMax, y);
                if ((x & 7) == 0 && (z & 7) == 0) {
                    biomes.merge(nom(niveau.getBiome(pos)), 1, Integer::sum);
                }
            }
        }
        try {
            Path dossier = c.dossier.resolve("rendus");
            Files.createDirectories(dossier);
            ImageIO.write(img, "png", dossier.resolve("zone-reelle.png").toFile());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("ZONE REELLE : %d chunks autour de x=%d z=%d (%d x %d blocs), %.0f s%n",
                zoneTotal, zoneX, zoneZ, taille, taille, (System.currentTimeMillis() - zoneDebut) / 1000.0));
        sb.append(String.format("colonnes terre : %d, eau : %d, point le plus haut : %d%n", terre, eau, hMax));
        sb.append("biomes rencontres (1 colonne sur 64) :\n");
        biomes.forEach((b, n) -> sb.append("   ").append(b).append(" x").append(n).append('\n'));
        ecrire(c, "rapport-zone.txt", sb.toString());
        CarteIle.LOG.info("[atheria_ile] vue du dessus ecrite ({} x {} blocs)", taille, taille);
    }

    // ------------------------------------------------------------------ utilitaires

    private static void ecrire(CarteIle c, String nom, String texte) {
        try {
            Path dossier = c.dossier.resolve("rendus");
            Files.createDirectories(dossier);
            Files.writeString(dossier.resolve(nom), texte, StandardCharsets.UTF_8);
        } catch (IOException e) {
            CarteIle.LOG.error("[atheria_ile] ecriture impossible : {}", nom, e);
        }
    }

    private static String pile(Throwable e) {
        StringWriter sw = new StringWriter();
        e.printStackTrace(new PrintWriter(sw));
        return sw.toString();
    }
}
