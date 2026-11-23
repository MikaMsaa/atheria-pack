package fr.atheria.monde;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.Reader;
import java.util.HashMap;
import java.util.Optional;
import java.util.Map;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicInteger;
import mcjty.lostcities.setup.Registration;
import mcjty.lostcities.varia.ChunkCoord;
import mcjty.lostcities.worldgen.IDimensionInfo;
import mcjty.lostcities.worldgen.lost.BuildingInfo;
import mcjty.lostcities.worldgen.lost.cityassets.BuildingPart;
import mcjty.lostcities.worldgen.lost.cityassets.Palette;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.server.packs.resources.Resource;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.Items;
import net.minecraft.world.item.context.UseOnContext;
import net.minecraft.world.phys.BlockHitResult;
import net.minecraft.world.phys.Vec3;
import net.neoforged.neoforge.common.util.FakePlayer;
import net.neoforged.neoforge.common.util.FakePlayerFactory;
import net.minecraft.resources.ResourceKey;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.server.level.WorldGenRegion;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.WorldGenLevel;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.chunk.ChunkAccess;
import net.minecraft.world.level.chunk.LevelChunk;
import net.neoforged.neoforge.common.NeoForge;
import net.neoforged.neoforge.event.level.ChunkEvent;
import net.neoforged.neoforge.event.tick.ServerTickEvent;

// Finition des batiments vitrine (ath_v_*).
// Lost Cities ne pose pas l'air de ses modeles et d'autres generateurs passent apres lui (arbres, plantes, grottes,
// lave) : le terrain se melait aux batiments et des blocs poses manquaient.
// Passe 1, en toute fin de decoration du chunk : chaque bloc du volume est remis comme le modele, et ce qui depasse
// au-dessus du toit est retire.
// Passe 2, quand le chunk neuf est charge (ses voisins sont alors decores) : ce que les chunks voisins ont fait
// deborder dans le batiment (troncs, lacs, minerais) est corrige a son tour.
// La vegetation basse qui pousse sur les sols libres (herbes, fleurs) est laissee : elle fait partie de l'abandon.
// Toujours en passe 2, les vehicules MTS (pack atheriavh) sont poses la ou les constructeurs avaient mis des maquettes
// en blocs : liste kubejs/data/atheria_monde/vehicules_vitrines.json, ecrite par convertir-vitrines.py.
public final class FinitionVitrines {
    // Lus par les tests automatiques
    public static final AtomicInteger CHUNKS = new AtomicInteger();
    public static final AtomicInteger BLOCS = new AtomicInteger();
    public static final AtomicInteger CHUNKS2 = new AtomicInteger();
    public static final AtomicInteger BLOCS2 = new AtomicInteger();
    public static final AtomicInteger ERREURS = new AtomicInteger();
    public static final AtomicInteger VEHICULES = new AtomicInteger();
    public static final AtomicInteger VEHICULES_RATES = new AtomicInteger();
    private static volatile Map<String, JsonArray> listeVehicules;

    private static final int HAUTEUR_ETAGE = 6;
    private static final int MARGE_DESSUS = 48; // passe 1 : nettoyage au-dessus du toit (terrain en surplomb, lave)
    private static final int PAR_TICK = 12;     // passe 2 : batiments traites par tick
    private static final int LUS_PAR_TICK = 256; // passe 2 : chunks neufs examines par tick (la plupart ne sont pas des batiments)
    private static final int FILE_MAX = 8192;
    private static final BlockState AIR = Blocks.AIR.defaultBlockState();

    private record Attente(ResourceKey<Level> dimension, int x, int z) {
    }

    private static final ConcurrentLinkedQueue<Attente> FILE = new ConcurrentLinkedQueue<>();
    private static final AtomicInteger TAILLE = new AtomicInteger();
    private static volatile boolean ecoute;

    private FinitionVitrines() {
    }

    private static void ecouter() {
        if (ecoute) return;
        synchronized (FinitionVitrines.class) {
            if (ecoute) return;
            NeoForge.EVENT_BUS.addListener(FinitionVitrines::chunkCharge);
            NeoForge.EVENT_BUS.addListener(FinitionVitrines::finDeTick);
            PoseLieux.ecouter();
            ecoute = true;
        }
    }

    // Passe 1 : appelee par le mixin a la fin de ChunkGenerator.applyBiomeDecoration
    public static void finir(WorldGenLevel niveau, ChunkAccess chunk) {
        try {
            ecouter();
            if (!(niveau instanceof WorldGenRegion)) return;
            int n = traiter(niveau, chunk, true);
            if (n >= 0) { CHUNKS.incrementAndGet(); BLOCS.addAndGet(n); }
            try { Envahissement.envahir(niveau, chunk); } catch (Throwable t2) { ERREURS.incrementAndGet(); }
            try { Galeries.creuser(niveau, chunk); } catch (Throwable t3) { ERREURS.incrementAndGet(); }
        } catch (Throwable t) {
            ERREURS.incrementAndGet(); // jamais d'echec de generation a cause de la finition
        }
    }

    private static void chunkCharge(ChunkEvent.Load evenement) {
        try {
            if (!evenement.isNewChunk() || !(evenement.getLevel() instanceof ServerLevel niveau)) return;
            if (!(evenement.getChunk() instanceof LevelChunk)) return;
            if (TAILLE.get() >= FILE_MAX) return;
            ChunkPos p = evenement.getChunk().getPos();
            FILE.add(new Attente(niveau.dimension(), p.x, p.z));
            TAILLE.incrementAndGet();
        } catch (Throwable t) {
            ERREURS.incrementAndGet();
        }
    }

    private static void finDeTick(ServerTickEvent.Post evenement) {
        int faits = 0;
        for (int i = 0; i < LUS_PAR_TICK && faits < PAR_TICK; i++) {
            Attente a = FILE.poll();
            if (a == null) return;
            TAILLE.decrementAndGet();
            try {
                ServerLevel niveau = evenement.getServer().getLevel(a.dimension());
                if (niveau == null || !niveau.hasChunk(a.x(), a.z())) continue;
                int n = traiter(niveau, niveau.getChunk(a.x(), a.z()), false);
                if (n >= 0) { faits++; CHUNKS2.incrementAndGet(); BLOCS2.addAndGet(n); vehicules(niveau, a.x(), a.z()); }
            } catch (Throwable t) {
                ERREURS.incrementAndGet();
            }
        }
    }

    // Renvoie le nombre de blocs remis, ou -1 si le chunk n'est pas un batiment vitrine
    private static int traiter(WorldGenLevel niveau, ChunkAccess chunk, boolean generation) {
        IDimensionInfo info = Registration.LOSTCITY_FEATURE.get().getDimensionInfo(niveau);
        if (info == null) return -1;
        ChunkPos cp = chunk.getPos();
        BuildingInfo bat = BuildingInfo.getBuildingInfo(new ChunkCoord(info.getType(), cp.x, cp.z), info);
        if (bat == null || !bat.hasBuilding || bat.getBuilding() == null) return -1;
        if (!bat.getBuilding().getId().getPath().startsWith("ath_v_")) return -1;
        BuildingPart[] parts = bat.floorTypes;
        if (parts == null) return -1;
        // passe 1 : 2 = pas de mise a jour des voisins ; passe 2 : en plus 16 = formes connues (clotures, vitres telles qu'exportees)
        int drapeaux = generation ? 2 : 2 | 16;
        int sol = bat.getCityGroundLevel(), x0 = cp.getMinBlockX(), z0 = cp.getMinBlockZ();
        int ymin = niveau.getMinBuildHeight(), ymax = niveau.getMaxBuildHeight() - 1;
        BlockPos.MutableBlockPos pos = new BlockPos.MutableBlockPos();
        int poses = 0, haut = Integer.MIN_VALUE;
        for (int i = 0; i < parts.length; i++) {
            BuildingPart part = parts[i];
            if (part == null || part.getXSize() != 16 || part.getZSize() != 16) continue;
            Map<Character, BlockState> palette = palette(part, niveau);
            if (palette == null) continue;
            int y0 = sol + (i - bat.cellars) * HAUTEUR_ETAGE, n = part.getSliceCount();
            for (int k = 0; k < n; k++) {
                int y = y0 + k;
                if (y < ymin || y > ymax) continue;
                for (int x = 0; x < 16; x++) {
                    for (int z = 0; z < 16; z++) {
                        Character c = part.getC(x, k, z);
                        BlockState attendu = c == null || c == ' ' ? AIR : palette.get(c);
                        if (attendu == null) continue; // caractere herite du style : on laisse Lost Cities decider
                        pos.set(x0 + x, y, z0 + z);
                        BlockState vu = niveau.getBlockState(pos);
                        if (vu.getBlock() == attendu.getBlock()) continue;
                        // passe 2 : la vegetation basse venue pousser sur un sol libre reste (jamais un liquide)
                        if (!generation && attendu.isAir() && vu.canBeReplaced() && vu.getFluidState().isEmpty()) continue;
                        if (vu.hasBlockEntity()) {
                            if (generation) chunk.removeBlockEntity(pos);
                            else if (niveau instanceof ServerLevel sl) sl.removeBlockEntity(pos);
                        }
                        niveau.setBlock(pos, attendu, drapeaux);
                        poses++;
                    }
                }
            }
            haut = Math.max(haut, y0 + n);
        }
        if (generation && haut != Integer.MIN_VALUE) {
            int fin = Math.min(ymax, haut + MARGE_DESSUS);
            for (int y = haut; y <= fin; y++) {
                for (int x = 0; x < 16; x++) {
                    for (int z = 0; z < 16; z++) {
                        pos.set(x0 + x, y, z0 + z);
                        if (!niveau.getBlockState(pos).isAir()) { niveau.setBlock(pos, AIR, 2); poses++; }
                    }
                }
            }
        }
        return poses;
    }

    private static Map<String, JsonArray> liste(ServerLevel niveau) {
        Map<String, JsonArray> m = listeVehicules;
        if (m != null) return m;
        m = new HashMap<>();
        try {
            Optional<Resource> r = niveau.getServer().getResourceManager().getResource(ResourceLocation.fromNamespaceAndPath("atheria_monde", "vehicules_vitrines.json"));
            if (r.isPresent()) {
                try (Reader lecteur = r.get().openAsReader()) {
                    JsonObject o = JsonParser.parseReader(lecteur).getAsJsonObject();
                    for (Map.Entry<String, JsonElement> e : o.entrySet()) m.put(e.getKey(), e.getValue().getAsJsonArray());
                }
            }
        } catch (Throwable t) {
            ERREURS.incrementAndGet();
        }
        listeVehicules = m;
        return m;
    }

    // Pose les vehicules MTS du batiment vitrine de ce chunk, comme un joueur qui utilise l'objet vehicule sur le sol
    private static void vehicules(ServerLevel niveau, int cx, int cz) {
        IDimensionInfo info = Registration.LOSTCITY_FEATURE.get().getDimensionInfo(niveau);
        if (info == null) return;
        BuildingInfo bat = BuildingInfo.getBuildingInfo(new ChunkCoord(info.getType(), cx, cz), info);
        if (bat == null || bat.getBuilding() == null) return;
        poser(niveau, bat.getBuilding().getId().getPath(), cx, cz, bat.getCityGroundLevel());
    }

    // Public pour les essais automatiques : pose les vehicules prevus pour le batiment (chunk) nom, dont le sol est a y=sol
    public static int poser(ServerLevel niveau, String nom, int cx, int cz, int sol) {
        JsonArray l = liste(niveau).get(nom);
        if (l == null) return 0;
        FakePlayer fp = FakePlayerFactory.getMinecraft(niveau);
        int avant = VEHICULES.get();
        for (JsonElement e : l) {
            try {
                JsonObject v = e.getAsJsonObject();
                ItemStack objet = new ItemStack(BuiltInRegistries.ITEM.get(ResourceLocation.parse("mts:" + v.get("id").getAsString())));
                if (objet.isEmpty() || objet.is(Items.AIR)) { VEHICULES_RATES.incrementAndGet(); continue; }
                double x = cx * 16 + v.get("x").getAsDouble(), z = cz * 16 + v.get("z").getAsDouble();
                int y = sol + v.get("y").getAsInt();
                // l'objet MTS oriente le vehicule d'apres le regard du joueur : regard = cap + 90 degres
                fp.absMoveTo(x, y, z, v.get("cap").getAsFloat() + 90f, 0f);
                fp.setItemInHand(InteractionHand.MAIN_HAND, objet);
                BlockHitResult visee = new BlockHitResult(new Vec3(x, y, z), Direction.UP, BlockPos.containing(x, y - 1, z), false);
                if (objet.useOn(new UseOnContext(fp, InteractionHand.MAIN_HAND, visee)).consumesAction()) VEHICULES.incrementAndGet();
                else VEHICULES_RATES.incrementAndGet();
            } catch (Throwable t) {
                VEHICULES_RATES.incrementAndGet();
            }
        }
        fp.setItemInHand(InteractionHand.MAIN_HAND, ItemStack.EMPTY);
        return VEHICULES.get() - avant;
    }

    // null si une entree de la palette n'est pas un bloc simple (on ne touche alors pas a cette partie)
    private static Map<Character, BlockState> palette(BuildingPart part, WorldGenLevel niveau) {
        Palette locale = part.getLocalPalette(niveau);
        if (locale == null) return null;
        Map<Character, BlockState> m = new HashMap<>();
        for (Map.Entry<Character, Palette.PE> e : locale.getPalette().entrySet()) {
            Object b = e.getValue().blocks();
            if (!(b instanceof BlockState etat)) return null;
            m.put(e.getKey(), etat);
        }
        return m;
    }
}
