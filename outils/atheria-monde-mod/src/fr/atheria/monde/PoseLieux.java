package fr.atheria.monde;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.Reader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import net.minecraft.core.BlockPos;
import net.minecraft.core.HolderLookup;
import net.minecraft.core.Vec3i;
import net.minecraft.nbt.CompoundTag;
import net.minecraft.nbt.ListTag;
import net.minecraft.nbt.StringTag;
import net.minecraft.nbt.Tag;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.server.MinecraftServer;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.server.packs.resources.Resource;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.levelgen.structure.templatesystem.StructurePlaceSettings;
import net.minecraft.world.level.levelgen.structure.templatesystem.StructureTemplate;
import net.minecraft.world.level.saveddata.SavedData;
import net.neoforged.neoforge.common.NeoForge;
import net.neoforged.neoforge.event.level.ChunkEvent;
import net.neoforged.neoforge.event.tick.ServerTickEvent;

// Pose des lieux faits main (lieux du trailer) a coordonnees fixes, une seule fois par monde.
// Liste : data/atheria_monde/lieux.json -> {"lieux":[{"nom","modele","x","y","z","souterrain","apres"}]} (x,y,z = coin bas nord-ouest du modele).
// Modeles : data/atheria_monde/structure/<nom>.nbt, exportes du banc apres usure et audit (ce que Mika a valide).
// Quand un chunk de l'emprise se charge, tous les chunks de l'emprise sont forces ; des qu'ils sont tous FULL,
// le modele est pose d'un bloc (sans mise a jour des voisins), la pose est notee dans le monde, puis les chunks sont liberes.
// Le mod de l'ile masque ces emprises (ni relief ni nature) ; pour un volume souterrain reserve, la pose passe par
// IleApi.poserDansVolume(Runnable) si la classe est presente.
public final class PoseLieux {
    // origine = coin bas nord-ouest de l'emprise APRES rotation ; rotation 0, 90, 180 ou 270 (sens horaire vu du dessus)
    record Lieu(String nom, ResourceLocation modele, BlockPos origine, boolean souterrain, String apres, int rotation) {}

    private static final class Etat {
        StructureTemplate modele;
        int cx1, cz1, cx2, cz2;
        boolean force;
        long debut;
    }

    // lu par les tests
    public static volatile String DERNIER = "";

    private static volatile boolean ecoute;
    private static List<Lieu> lieux;
    private static final Map<String, Etat> ETATS = new java.util.concurrent.ConcurrentHashMap<>();
    private static final Set<String> A_FORCER = java.util.concurrent.ConcurrentHashMap.newKeySet();
    private static long tick;

    private PoseLieux() {
    }

    public static void ecouter() {
        if (ecoute) return;
        synchronized (PoseLieux.class) {
            if (ecoute) return;
            NeoForge.EVENT_BUS.addListener(PoseLieux::chunkCharge);
            NeoForge.EVENT_BUS.addListener(PoseLieux::finDeTick);
            ecoute = true;
        }
    }

    // ---------------- etat sauvegarde : lieux deja poses ----------------
    public static final class Poses extends SavedData {
        final Set<String> faits = new HashSet<>();

        static Poses lire(CompoundTag tag, HolderLookup.Provider p) {
            Poses s = new Poses();
            ListTag l = tag.getList("faits", Tag.TAG_STRING);
            for (int i = 0; i < l.size(); i++) s.faits.add(l.getString(i));
            return s;
        }

        @Override
        public CompoundTag save(CompoundTag tag, HolderLookup.Provider p) {
            ListTag l = new ListTag();
            for (String n : faits) l.add(StringTag.valueOf(n));
            tag.put("faits", l);
            return tag;
        }
    }

    private static Poses poses(ServerLevel niveau) {
        return niveau.getDataStorage().computeIfAbsent(new SavedData.Factory<>(Poses::new, Poses::lire, null), "atheria_lieux_poses");
    }

    // ---------------- liste des lieux ----------------
    private static synchronized List<Lieu> lieux(MinecraftServer serveur) {
        if (lieux != null) return lieux;
        List<Lieu> l = new ArrayList<>();
        try {
            Optional<Resource> r = serveur.getResourceManager().getResource(ResourceLocation.fromNamespaceAndPath("atheria_monde", "lieux.json"));
            if (r.isPresent()) {
                try (Reader rd = r.get().openAsReader()) {
                    JsonArray a = JsonParser.parseReader(rd).getAsJsonObject().getAsJsonArray("lieux");
                    for (JsonElement e : a) {
                        JsonObject o = e.getAsJsonObject();
                        l.add(new Lieu(o.get("nom").getAsString(), ResourceLocation.parse(o.get("modele").getAsString()),
                            new BlockPos(o.get("x").getAsInt(), o.get("y").getAsInt(), o.get("z").getAsInt()),
                            o.has("souterrain") && o.get("souterrain").getAsBoolean(), o.has("apres") ? o.get("apres").getAsString() : null, o.has("rotation") ? o.get("rotation").getAsInt() : 0));
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("[Atheria] PoseLieux : lieux.json illisible : " + e);
        }
        lieux = l;
        System.out.println("[Atheria] PoseLieux : " + l.size() + " lieu(x) a poser");
        return l;
    }

    private static net.minecraft.world.level.block.Rotation rotation(Lieu li) {
        return switch (((li.rotation() % 360) + 360) % 360) {
            case 90 -> net.minecraft.world.level.block.Rotation.CLOCKWISE_90;
            case 180 -> net.minecraft.world.level.block.Rotation.CLOCKWISE_180;
            case 270 -> net.minecraft.world.level.block.Rotation.COUNTERCLOCKWISE_90;
            default -> net.minecraft.world.level.block.Rotation.NONE;
        };
    }

    private static Etat etat(ServerLevel niveau, Lieu li) {
        Etat e = ETATS.get(li.nom());
        if (e != null) return e;
        Optional<StructureTemplate> t = niveau.getStructureManager().get(li.modele());
        if (t.isEmpty()) { System.err.println("[Atheria] PoseLieux : modele introuvable " + li.modele()); return null; }
        e = new Etat();
        e.modele = t.get();
        Vec3i s = e.modele.getSize(rotation(li));
        BlockPos o = li.origine();
        // emprise + 1 chunk de marge : les blocs du bord lisent leurs voisins a la pose (sinon chargement bloquant sur le fil serveur)
        e.cx1 = (o.getX() >> 4) - 1; e.cz1 = (o.getZ() >> 4) - 1;
        e.cx2 = ((o.getX() + s.getX() - 1) >> 4) + 1; e.cz2 = ((o.getZ() + s.getZ() - 1) >> 4) + 1;
        ETATS.put(li.nom(), e);
        return e;
    }

    // ---------------- un chunk de l'emprise se charge : on force toute l'emprise ----------------
    private static void chunkCharge(ChunkEvent.Load ev) {
        if (!(ev.getLevel() instanceof ServerLevel niveau) || niveau.dimension() != Level.OVERWORLD) return;
        ChunkPos c = ev.getChunk().getPos();
        try {
            Poses p = null;
            for (Lieu li : lieux(niveau.getServer())) {
                Etat e = ETATS.get(li.nom());
                if ((e != null && e.force) || A_FORCER.contains(li.nom())) continue;
                // filtre rapide sur la boite large avant de lire le modele
                BlockPos o = li.origine();
                if (c.x < (o.getX() >> 4) - 1 || c.z < (o.getZ() >> 4) - 1 || c.x > (o.getX() >> 4) + 16 || c.z > (o.getZ() >> 4) + 16) continue;
                if (p == null) p = poses(niveau);
                if (p.faits.contains(li.nom())) continue;
                e = etat(niveau, li);
                if (e == null || c.x < e.cx1 || c.x > e.cx2 || c.z < e.cz1 || c.z > e.cz2) continue;
                A_FORCER.add(li.nom());   // force au tick suivant, pas pendant le chargement
            }
        } catch (Exception x) {
            System.err.println("[Atheria] PoseLieux : " + x);
        }
    }

    // ---------------- en fin de tick : poser ce qui est pret ----------------
    private static void finDeTick(ServerTickEvent.Post ev) {
        tick++;
        if (tick % 2400 == 0) System.out.println("[Atheria] Generation : envahissement " + Envahissement.CHUNKS.get() + " chunks, " + Envahissement.LIANES.get() + " lianes, " + Envahissement.PLANTES.get() + " plantes, " + Envahissement.ARBRES.get() + " arbres ; galeries " + Galeries.CHUNKS.get() + " chunks, " + Galeries.BLOCS.get() + " blocs ; erreurs " + FinitionVitrines.ERREURS.get());
        if (tick % 100 == 50) chercherOublies(ev.getServer().overworld());
        if (tick % 20 != 0 || ETATS.isEmpty()) return;
        ServerLevel niveau = ev.getServer().overworld();
        for (String n : A_FORCER) {
            Etat e = ETATS.get(n);
            if (e == null || e.force) continue;
            for (int x = e.cx1; x <= e.cx2; x++) for (int z = e.cz1; z <= e.cz2; z++) niveau.setChunkForced(x, z, true);
            e.force = true;
            e.debut = tick;
            DERNIER = n + " : emprise forcee";
            System.out.println("[Atheria] PoseLieux : " + n + " emprise forcee (" + ((e.cx2 - e.cx1 + 1) * (e.cz2 - e.cz1 + 1)) + " chunks)");
        }
        A_FORCER.clear();
        for (Lieu li : lieux(ev.getServer())) {
            Etat e = ETATS.get(li.nom());
            if (e == null || !e.force) continue;
            boolean pret = true;
            for (int x = e.cx1; x <= e.cx2 && pret; x++) for (int z = e.cz1; z <= e.cz2 && pret; z++) if (niveau.getChunkSource().getChunkNow(x, z) == null) pret = false;
            // un lieu qui se superpose a un autre (station sous le port) attend que celui-ci soit pose
            if (pret && li.apres() != null && !poses(niveau).faits.contains(li.apres())) pret = false;
            if (!pret) {
                if (tick - e.debut > 20 * 600) System.err.println("[Atheria] PoseLieux : " + li.nom() + " attend ses chunks depuis 10 min");
                continue;
            }
            Runnable pose = () -> {
                StructurePlaceSettings r = new StructurePlaceSettings().setIgnoreEntities(true).setRotation(rotation(li));
                // la rotation tourne autour du coin d'origine : on recale pour que l'emprise commence a l'origine voulue
                net.minecraft.world.level.levelgen.structure.BoundingBox bb = e.modele.getBoundingBox(r, BlockPos.ZERO);
                BlockPos pos = li.origine().offset(-bb.minX(), 0, -bb.minZ());
                e.modele.placeInWorld(niveau, pos, pos, r, niveau.getRandom(), Block.UPDATE_CLIENTS | Block.UPDATE_KNOWN_SHAPE);
            };
            try {
                if (!(li.souterrain() && dansVolume(pose))) pose.run();
                Poses p = poses(niveau);
                p.faits.add(li.nom());
                p.setDirty();
                DERNIER = li.nom() + " : pose";
                System.out.println("[Atheria] PoseLieux : " + li.nom() + " pose en " + li.origine().toShortString() + " (" + e.modele.getSize(rotation(li)).toShortString() + ", rotation " + li.rotation() + ")");
            } catch (Exception x) {
                System.err.println("[Atheria] PoseLieux : echec de pose " + li.nom() + " : " + x);
            }
            for (int x = e.cx1; x <= e.cx2; x++) for (int z = e.cz1; z <= e.cz2; z++) niveau.setChunkForced(x, z, false);
            e.force = false;
            ETATS.remove(li.nom());
            // un lieu chaine (station sous le port) partage des chunks avec celui qui vient d'etre pose : on les reforce
            for (Etat o : ETATS.values()) if (o.force) for (int x = o.cx1; x <= o.cx2; x++) for (int z = o.cz1; z <= o.cz2; z++) niveau.setChunkForced(x, z, true);
        }
    }

    // 15/11 : un lieu dont l'emprise est deja chargee sans qu'un evenement de chargement ait ete vu (monde relance,
    // chunks charges avant l'ecoute, lieu chaine) est repere toutes les 5 s et mis a forcer.
    private static void chercherOublies(ServerLevel niveau) {
        try {
            Poses p = null;
            for (Lieu li : lieux(niveau.getServer())) {
                Etat e = ETATS.get(li.nom());
                if ((e != null && e.force) || A_FORCER.contains(li.nom())) continue;
                if (p == null) p = poses(niveau);
                if (p.faits.contains(li.nom())) continue;
                int ox = li.origine().getX() >> 4, oz = li.origine().getZ() >> 4;
                boolean charge = false;
                for (int x = ox; x <= ox + 8 && !charge; x++) for (int z = oz; z <= oz + 8 && !charge; z++) if (niveau.getChunkSource().getChunkNow(x, z) != null) charge = true;
                if (!charge) continue;
                e = etat(niveau, li);
                if (e == null) continue;
                charge = false;
                for (int x = e.cx1 + 1; x <= e.cx2 - 1 && !charge; x++) for (int z = e.cz1 + 1; z <= e.cz2 - 1 && !charge; z++) if (niveau.getChunkSource().getChunkNow(x, z) != null) charge = true;
                if (charge) A_FORCER.add(li.nom());
            }
        } catch (Exception x) {
            System.err.println("[Atheria] PoseLieux : " + x);
        }
    }

    // pose dans un volume reserve par le mod de l'ile (classe optionnelle, appel par reflexion)
    private static boolean dansVolume(Runnable r) {
        for (String nom : new String[] { "fr.atheria.ile.IleApi", "fr.atheria.ile.api.IleApi" }) {
            try {
                Class<?> c = Class.forName(nom);
                c.getMethod("poserDansVolume", Runnable.class).invoke(null, r);
                return true;
            } catch (ClassNotFoundException e) {
                // essayer le nom suivant
            } catch (Exception e) {
                System.err.println("[Atheria] PoseLieux : IleApi.poserDansVolume a echoue : " + e);
                return false;
            }
        }
        return false;
    }
}
