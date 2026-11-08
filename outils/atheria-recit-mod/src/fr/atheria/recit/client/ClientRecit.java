package fr.atheria.recit.client;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import fr.atheria.recit.Reseau;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.GuiGraphics;
import net.minecraft.client.gui.screens.LevelLoadingScreen;
import net.minecraft.client.gui.screens.ReceivingLevelScreen;
import net.minecraft.client.resources.sounds.SimpleSoundInstance;
import net.minecraft.client.resources.sounds.SoundInstance;
import net.minecraft.core.BlockPos;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.sounds.SoundSource;
import net.minecraft.util.RandomSource;
import net.minecraft.world.phys.Vec3;
import net.neoforged.bus.api.EventPriority;
import net.neoforged.neoforge.client.event.ClientPlayerNetworkEvent;
import net.neoforged.neoforge.client.event.ClientTickEvent;
import net.neoforged.neoforge.client.event.RenderGuiEvent;
import net.neoforged.neoforge.client.event.RenderPlayerEvent;
import net.neoforged.neoforge.client.event.ViewportEvent;
import net.neoforged.neoforge.common.NeoForge;
import net.neoforged.neoforge.network.PacketDistributor;

public final class ClientRecit implements Reseau.Client {
    // cinematique en cours
    static Cinematique cine;
    static String nom;
    static boolean passable;
    private static long debutNs;
    private static boolean musiqueLancee;
    private static SoundInstance musique;
    private static Reseau.JouerCinematique enAttente;
    private static int attenteTicks;
    // retour au jeu : le noir s'efface en une seconde
    private static long sortieNs;
    private static double relevement;
    private static long dernierNs;
    // monde ou la cinematique a commence : un changement de dimension (portail, teleportation) l'arrete
    private static net.minecraft.client.multiplayer.ClientLevel niveau;

    // HUD masque pendant une cinematique ou un dialogue (F1 force, puis rendu tel qu'il etait)
    private static int masques;
    private static boolean hudAvant;

    static final Set<UUID> CACHES = ConcurrentHashMap.newKeySet();
    private static final RandomSource HASARD = RandomSource.create();

    private ClientRecit() {
    }

    public static void init() {
        Reseau.CLIENT = new ClientRecit();
        var bus = NeoForge.EVENT_BUS;
        bus.addListener(ClientRecit::tick);
        bus.addListener(EventPriority.LOWEST, ClientRecit::angles);
        bus.addListener(EventPriority.LOWEST, ClientRecit::fov);
        bus.addListener(ClientRecit::rendreJoueur);
        bus.addListener(ClientRecit::deconnexion);
        bus.addListener(ClientRecit::fonduSortie);
    }

    // ---------- paquets ----------
    @Override
    public void cinematique(Reseau.JouerCinematique p) {
        enAttente = p;
        attenteTicks = 0;
    }

    @Override
    public void dialogue(String vue) {
        Minecraft mc = Minecraft.getInstance();
        if (vue.isEmpty()) {
            if (mc.screen instanceof EcranDialogue d) d.fermeParServeur();
            return;
        }
        JsonObject o = JsonParser.parseString(vue).getAsJsonObject();
        if (mc.screen instanceof EcranDialogue d) d.charger(o);
        else mc.setScreen(new EcranDialogue(o));
    }

    @Override
    public void cache(UUID joueur, boolean cache) {
        if (cache) CACHES.add(joueur);
        else CACHES.remove(joueur);
    }

    // ---------- HUD ----------
    static void masquerHud() {
        Minecraft mc = Minecraft.getInstance();
        if (masques++ == 0) {
            hudAvant = mc.options.hideGui;
            mc.options.hideGui = true;
        }
    }

    static void rendreHud() {
        if (masques == 0) return;
        if (--masques == 0) Minecraft.getInstance().options.hideGui = hudAvant;
    }

    // ---------- cinematique ----------
    public static boolean cameraActive() {
        return cine != null || CameraDialogue.active();
    }

    static void debutDialogue(EcranDialogue d) {
        CameraDialogue.commencer(d);
    }

    static void finDialogue(EcranDialogue d) {
        CameraDialogue.arreter(d);
    }

    // etat de camera du dernier calcul (cinematique ou dialogue), lu par les evenements d'angles et de champ
    private static double[] dernier;

    // temps du scenario en secondes (negatif pendant l'ecran noir d'attente)
    static double temps() {
        return cine == null ? 0 : (System.nanoTime() - debutNs) / 1e9 - cine.attente;
    }

    public static double[] camera() {
        dernier = cameraCalcul();
        return dernier;
    }

    private static double[] cameraCalcul() {
        if (cine == null) return CameraDialogue.calculer();
        if (cine.plans.isEmpty()) return null;
        double[] e = cine.calculer(Math.max(0, temps()));
        // jamais dans le decor : la camera passe au-dessus du sol et des arbres, en douceur
        Minecraft mc = Minecraft.getInstance();
        if (cine.eviterSol && mc.level != null) {
            int sol = mc.level.getHeight(net.minecraft.world.level.levelgen.Heightmap.Types.MOTION_BLOCKING, net.minecraft.util.Mth.floor(e[0]), net.minecraft.util.Mth.floor(e[2]));
            double cible = Math.max(0, sol + 2.5 - e[1]);
            long maintenant = System.nanoTime();
            double dt = dernierNs == 0 ? 0 : Math.min(0.1, (maintenant - dernierNs) / 1e9);
            dernierNs = maintenant;
            relevement += (cible - relevement) * Math.min(1, dt * (cible > relevement ? 6 : 1.5));
            e[1] += relevement;
        }
        return e;
    }

    private static void demarrer(Reseau.JouerCinematique p) {
        Minecraft mc = Minecraft.getInstance();
        if (cine != null) arreter();
        JsonObject o = JsonParser.parseString(p.scenario()).getAsJsonObject();
        Vec3 origine = Vec3.ZERO;
        String mode = o.has("origine") && o.get("origine").isJsonPrimitive() ? o.get("origine").getAsString() : "spawn";
        if (o.has("origine") && o.get("origine").isJsonArray()) {
            JsonArray a = o.getAsJsonArray("origine");
            origine = new Vec3(a.get(0).getAsDouble(), a.get(1).getAsDouble(), a.get(2).getAsDouble());
        } else if ("joueur".equals(mode)) {
            origine = mc.player.position();
        } else if ("spawn".equals(mode)) {
            BlockPos sp = mc.level.getLevelData().getSpawnPos();
            origine = new Vec3(sp.getX(), sp.getY(), sp.getZ());
        }
        cine = Cinematique.lire(o, origine);
        niveau = mc.level;
        relevement = 0;
        dernierNs = 0;
        nom = p.nom();
        passable = p.passable();
        debutNs = System.nanoTime();
        musiqueLancee = false;
        masquerHud();
        mc.getMusicManager().stopPlaying();
        mc.setScreen(new EcranCinematique());
    }

    static void finir(boolean passee) {
        if (cine == null) return;
        String n = nom;
        arreter();
        sortieNs = System.nanoTime();
        PacketDistributor.sendToServer(new Reseau.FinCinematique(n, passee));
    }

    private static void arreter() {
        Minecraft mc = Minecraft.getInstance();
        cine = null;
        if (musique != null) mc.getSoundManager().stop(musique);
        musique = null;
        rendreHud();
        if (mc.screen instanceof EcranCinematique) mc.setScreen(null);
    }

    static void son(String id, SoundSource source, float volume, float hauteur) {
        ResourceLocation rl = ResourceLocation.tryParse(id);
        if (rl == null) return;
        SoundInstance s = new SimpleSoundInstance(rl, source, volume, hauteur, HASARD, false, 0, SoundInstance.Attenuation.NONE, 0, 0, 0, true);
        Minecraft.getInstance().getSoundManager().play(s);
        if (source == SoundSource.MUSIC) musique = s;
    }

    // ---------- evenements ----------
    private static void tick(ClientTickEvent.Post ev) {
        Minecraft mc = Minecraft.getInstance();
        if (enAttente != null) {
            boolean chargement = mc.screen instanceof ReceivingLevelScreen || mc.screen instanceof LevelLoadingScreen;
            boolean pret = mc.player != null && mc.level != null && !chargement;
            // un autre ecran ouvert (fenetre d'un mod) : on le laisse 3 s, puis la cinematique passe devant
            if (pret && (mc.screen == null || mc.screen instanceof EcranCinematique || attenteTicks++ > 60)) {
                Reseau.JouerCinematique p = enAttente;
                enAttente = null;
                demarrer(p);
            }
        }
        if (cine == null) return;
        if (mc.player == null) {
            arreter();
            return;
        }
        // mort (vide, /kill) ou changement de monde : la cinematique s'arrete, le serveur leve la protection
        if (mc.player.isDeadOrDying() || mc.level != niveau) {
            finir(true);
            return;
        }
        if (mc.screen == null) mc.setScreen(new EcranCinematique());
        double t = temps();
        if (t >= 0 && !musiqueLancee) {
            musiqueLancee = true;
            if (cine.musique != null) son(cine.musique, SoundSource.MUSIC, cine.volumeMusique, 1);
        }
        for (Cinematique.Evenement e : cine.evenements) {
            if (e.joue || e.son == null || t < e.t) continue;
            e.joue = true;
            son(e.son, SoundSource.AMBIENT, e.volume, e.hauteur);
        }
        if (t >= cine.duree) finir(false);
    }

    private static void angles(ViewportEvent.ComputeCameraAngles ev) {
        double[] e = dernier;
        if (e == null || !cameraActive()) return;
        ev.setYaw((float) e[3]);
        ev.setPitch((float) e[4]);
        ev.setRoll((float) e[5]);
    }

    private static void fov(ViewportEvent.ComputeFov ev) {
        double[] e = dernier;
        if (e == null || !cameraActive() || Double.isNaN(e[6]) || e[6] <= 0) return;
        ev.setFOV(e[6]);
    }

    private static void rendreJoueur(RenderPlayerEvent.Pre ev) {
        Minecraft mc = Minecraft.getInstance();
        boolean moi = ev.getEntity() == mc.player;
        if (moi ? cine != null : CACHES.contains(ev.getEntity().getUUID())) ev.setCanceled(true);
    }

    private static void fonduSortie(RenderGuiEvent.Post ev) {
        if (sortieNs == 0) return;
        double k = (System.nanoTime() - sortieNs) / 1e9;
        if (k >= 1) {
            sortieNs = 0;
            return;
        }
        GuiGraphics g = ev.getGuiGraphics();
        g.fill(0, 0, g.guiWidth(), g.guiHeight(), EcranCinematique.argb(1 - EcranCinematique.lisse(k), 0));
    }

    private static void deconnexion(ClientPlayerNetworkEvent.LoggingOut ev) {
        enAttente = null;
        cine = null;
        CameraDialogue.arreter(null);
        musique = null;
        CACHES.clear();
        if (masques > 0) {
            masques = 1;
            rendreHud();
        }
    }
}
