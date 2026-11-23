package fr.atheria.ile.client;

import fr.atheria.ile.AtheriaIle;
import fr.atheria.ile.ReseauIle;
import net.minecraft.client.DeltaTracker;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.Font;
import net.minecraft.client.gui.GuiGraphics;
import net.minecraft.resources.ResourceLocation;
import net.neoforged.bus.api.IEventBus;
import net.neoforged.fml.ModContainer;
import net.neoforged.fml.config.ModConfig;
import net.neoforged.neoforge.client.event.ClientPlayerNetworkEvent;
import net.neoforged.neoforge.client.event.ClientTickEvent;
import net.neoforged.neoforge.client.event.RegisterGuiLayersEvent;
import net.neoforged.neoforge.client.gui.VanillaGuiLayers;
import net.neoforged.neoforge.common.ModConfigSpec;
import net.neoforged.neoforge.common.NeoForge;
import org.joml.Matrix4f;

import java.util.Locale;

/**
 * 0.7.4 : titre d'entree discret (lieu, ville, region) en surimpression, sans son.
 * Ligne principale en petites capitales espacees, deux traits fins qui se deploient, sous-titre gris plus petit,
 * ombre, fondu lent. Aucune allocation par image : tout est prepare a l'arrivee du titre.
 */
public final class TitresClient implements ReseauIle.Client {
    private TitresClient() {}

    // ---------------------------------------------------------------- configuration client (config/atheria_ile-client.toml)
    private static final ModConfigSpec SPEC;
    private static final ModConfigSpec.BooleanValue ACTIF;
    private static final ModConfigSpec.DoubleValue ECHELLE, HAUTEUR, DUREE;
    private static final ModConfigSpec.IntValue STYLE;
    static {
        ModConfigSpec.Builder b = new ModConfigSpec.Builder();
        b.comment("Titres d'entree de l'ile (lieu nomme, ville, region)").push("titres");
        ACTIF = b.comment("Afficher les titres d'entree").define("actif", true);
        ECHELLE = b.comment("Taille du texte (1 = normal)").defineInRange("echelle", 1.0, 0.5, 2.0);
        HAUTEUR = b.comment("Position verticale du titre (0 = haut de l'ecran, 1 = bas)").defineInRange("position_verticale", 0.24, 0.05, 0.9);
        DUREE = b.comment("Duree d'affichage plein, en secondes (hors fondus)").defineInRange("duree_secondes", 3.0, 1.0, 10.0);
        STYLE = b.comment("1 = centre avec deux traits, 2 = en bas a gauche, 3 = centre souligne").defineInRange("style", 1, 1, 3);
        b.pop();
        SPEC = b.build();
    }

    // ---------------------------------------------------------------- etat
    private static final int MAX = 48;
    private static final long ENTREE = 800, SORTIE = 1200, TRAITS = 1000;
    private static final String[] G = new String[MAX];
    private static final float[] T = new float[MAX], L = new float[MAX];
    private static final String[] GS = new String[MAX];
    private static final float[] LS = new float[MAX];
    private static int n, ns;
    private static float largeur, largeurSous;
    private static long debut;
    private static boolean affiche;
    private static String courant = "";
    private static volatile ReseauIle.TitreLieu enAttente;
    // configuration lue au debut de chaque titre (jamais par image)
    private static float echelle = 1f, hauteur = 0.24f;
    private static long tenue = 3000;
    private static int style = 1;
    // identite de l'endroit (paquet) : couleurs et ornement, -1 / "" = defaut
    private static int coulTitre = 0xF2EEE6, coulTraits = 0xFFFFFF;
    private static String ornement = "";
    private static float largeurOrn;
    private static final Matrix4f SAUVE = new Matrix4f();

    public static void init(IEventBus busDuMod, ModContainer conteneur) {
        conteneur.registerConfig(ModConfig.Type.CLIENT, SPEC, "atheria_ile-client.toml");
        ReseauIle.CLIENT = new TitresClient();
        busDuMod.addListener(RegisterGuiLayersEvent.class, e -> e.registerAbove(VanillaGuiLayers.TITLE,
                ResourceLocation.fromNamespaceAndPath(AtheriaIle.ID, "titre_lieu"), TitresClient::rendre));
        NeoForge.EVENT_BUS.addListener(ClientTickEvent.Post.class, e -> tick());
        NeoForge.EVENT_BUS.addListener(ClientPlayerNetworkEvent.LoggingOut.class, e -> { enAttente = null; affiche = false; courant = ""; });
    }

    @Override
    public void titre(ReseauIle.TitreLieu t) {
        if (affiche && courant.equals(t.titre())) return;
        enAttente = t; // file de 1 : le plus recent remplace l'attente
    }

    /** reporte tant qu'un ecran (dialogue, cinematique d'atheria-recit, menu) est ouvert ou l'interface masquee */
    private static void tick() {
        ReseauIle.TitreLieu t = enAttente;
        if (t == null || affiche) return;
        Minecraft mc = Minecraft.getInstance();
        if (mc.player == null || mc.screen != null || mc.options.hideGui) return;
        enAttente = null;
        if (!ACTIF.get()) return;
        demarrer(mc.font, t);
    }

    private static void demarrer(Font f, ReseauIle.TitreLieu t) {
        echelle = ECHELLE.get().floatValue();
        hauteur = HAUTEUR.get().floatValue();
        tenue = Math.round(DUREE.get() * 1000);
        style = t.style() > 0 ? t.style() : STYLE.get();
        coulTitre = t.couleurTitre() >= 0 ? t.couleurTitre() & 0xFFFFFF : 0xF2EEE6;
        coulTraits = t.couleurTraits() >= 0 ? t.couleurTraits() & 0xFFFFFF : 0xFFFFFF;
        ornement = t.ornement() == null ? "" : t.ornement();
        largeurOrn = ornement.isEmpty() ? 0f : f.width(ornement);
        // petites capitales : minuscule -> capitale reduite ; espacement large
        String s = t.titre();
        n = 0; largeur = 0;
        float esp = 2.2f;
        for (int i = 0; i < s.length() && n < MAX; i++) {
            char ch = s.charAt(i);
            boolean petite = Character.isLowerCase(ch);
            G[n] = String.valueOf(Character.toUpperCase(ch)).toUpperCase(Locale.ROOT);
            T[n] = petite ? 0.78f : 1f;
            L[n] = f.width(G[n]) * T[n] + (ch == ' ' ? esp * 1.5f : esp);
            largeur += L[n];
            n++;
        }
        if (n > 0) largeur -= esp;
        String so = t.sousTitre();
        ns = 0; largeurSous = 0;
        for (int i = 0; i < so.length() && ns < MAX; i++) {
            GS[ns] = String.valueOf(so.charAt(i));
            LS[ns] = f.width(GS[ns]) + 0.8f;
            largeurSous += LS[ns];
            ns++;
        }
        courant = s;
        debut = System.nanoTime();
        affiche = true;
    }

    private static float doux(float x) { x = Math.max(0f, Math.min(1f, x)); return x * x * (3f - 2f * x); }

    private static int argb(float a, int rgb) { return ((int) (a * 255f) << 24) | rgb; }

    private static void rendre(GuiGraphics gg, DeltaTracker dt) {
        if (!affiche) return;
        long t = (System.nanoTime() - debut) / 1_000_000L;
        if (t >= ENTREE + tenue + SORTIE) { affiche = false; courant = ""; return; }
        Minecraft mc = Minecraft.getInstance();
        if (mc.options.hideGui) return;
        float a = t < ENTREE ? doux(t / (float) ENTREE) : t < ENTREE + tenue ? 1f : 1f - doux((t - ENTREE - tenue) / (float) SORTIE);
        if (a * 255f < 8f) return; // la police rend opaque un alpha < 4
        float u = doux(t / (float) TRAITS);
        float monte = (1f - doux(Math.min(1f, t / (float) ENTREE))) * 5f;
        Font f = mc.font;
        int W = gg.guiWidth(), H = gg.guiHeight();
        Matrix4f m = gg.pose().last().pose();
        if (style == 2) {
            float S = 1.15f * echelle, S2 = 0.75f * echelle;
            float x0 = 22f + (1f - u) * -8f, y0 = H * 0.70f;
            // barre verticale fine a gauche
            trait(gg, m, x0 - 7f, y0 - 1f, 0.5f, 9f * S + 4f + 9f * S2, argb(a * 0.8f, coulTraits));
            if (!ornement.isEmpty()) { orn(gg, m, f, x0, y0 + 1f, S * 0.8f, argb(a * 0.9f, coulTraits)); x0 += (largeurOrn + 4f) * S * 0.8f; }
            glyphes(gg, m, f, x0, y0, S, argb(a, coulTitre), 0);
            sous(gg, m, f, x0, y0 + 9f * S + 3f, S2, argb(a * 0.85f, 0xB8B8B8));
            return;
        }
        float S = (style == 3 ? 1.55f : 1.35f) * echelle, S2 = 0.8f * echelle;
        float lw = largeur * S;
        float x0 = (W - lw) / 2f, y0 = H * hauteur + monte;
        glyphes(gg, m, f, x0, y0, S, argb(a, coulTitre), 0);
        int ct = argb(a * 0.7f, coulTraits);
        // ornement : petit signe centre au-dessus du titre
        if (!ornement.isEmpty()) { float so = 0.9f * echelle; orn(gg, m, f, (W - largeurOrn * so) / 2f, y0 - 10f * so - 2f, so, argb(a * 0.85f, coulTraits)); }
        float ySous;
        if (style == 3) {
            float lt = lw * u, yl = y0 + 8f * S + 3f;
            trait(gg, m, W / 2f - lt / 2f, yl, lt, 0.5f, ct);
            ySous = yl + 4f;
        } else {
            float lt = 34f * echelle * u, gap = 9f * echelle, yl = y0 + 3.5f * S;
            trait(gg, m, x0 - gap - lt, yl, lt, 0.5f, ct);
            trait(gg, m, x0 + lw + gap, yl, lt, 0.5f, ct);
            ySous = y0 + 9f * S + 4f;
        }
        sous(gg, m, f, (W - largeurSous * S2) / 2f, ySous, S2, argb(a * 0.85f, 0xB8B8B8));
    }

    /** ligne principale : glyphe par glyphe, matrice modifiee en place puis restauree (pas de pushPose) */
    private static void glyphes(GuiGraphics gg, Matrix4f m, Font f, float x, float y, float S, int coul, int inutilise) {
        for (int i = 0; i < n; i++) {
            float s = S * T[i];
            SAUVE.set(m);
            m.translate(x, y + (1f - T[i]) * 7f * S, 0f).scale(s, s, 1f);
            gg.drawString(f, G[i], 0, 0, coul, true);
            m.set(SAUVE);
            x += L[i] * S;
        }
    }

    private static void orn(GuiGraphics gg, Matrix4f m, Font f, float x, float y, float S, int coul) {
        SAUVE.set(m);
        m.translate(x, y, 0f).scale(S, S, 1f);
        gg.drawString(f, ornement, 0, 0, coul, true);
        m.set(SAUVE);
    }

    private static void sous(GuiGraphics gg, Matrix4f m, Font f, float x, float y, float S, int coul) {
        for (int i = 0; i < ns; i++) {
            SAUVE.set(m);
            m.translate(x, y, 0f).scale(S, S, 1f);
            gg.drawString(f, GS[i], 0, 0, coul, true);
            m.set(SAUVE);
            x += LS[i] * S;
        }
    }

    /** rectangle fin (demi-pixel d'interface possible) */
    private static void trait(GuiGraphics gg, Matrix4f m, float x, float y, float w, float h, int coul) {
        if (w <= 0.05f || h <= 0.05f) return;
        SAUVE.set(m);
        m.translate(x, y, 0f).scale(0.25f, 0.25f, 1f);
        gg.fill(0, 0, Math.max(1, Math.round(w * 4f)), Math.max(1, Math.round(h * 4f)), coul);
        m.set(SAUVE);
    }
}
