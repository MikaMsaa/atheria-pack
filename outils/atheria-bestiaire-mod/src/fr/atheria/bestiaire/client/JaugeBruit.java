package fr.atheria.bestiaire.client;

import fr.atheria.bestiaire.AtheriaBestiaire;
import fr.atheria.bestiaire.Bruit;
import net.minecraft.Util;
import net.minecraft.client.DeltaTracker;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.GuiGraphics;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.util.Mth;
import net.neoforged.bus.api.IEventBus;
import net.neoforged.neoforge.client.event.RegisterGuiLayersEvent;
import net.neoforged.neoforge.client.gui.VanillaGuiLayers;

// Jauge de bruit, style "ondes" : trois arcs fins sous le viseur. Ils ne s'allument que quand on fait du bruit,
// puis s'effacent en moins de 2 secondes. Un arc par palier de portee (jusqu'ou un Chimik t'entend) :
//   1 arc  : pas, gestes, tir avec silencieux (jusqu'a ~10 blocs)
//   2 arcs : course, porte, bloc casse, chute (12 a 29 blocs)
//   3 arcs : tir, vehicule rapide, explosion, instrument (30 blocs et plus), le dernier en ambre
// Rien n'est affiche au calme, en creatif ou en spectateur (le serveur n'envoie rien), ni avec F1.
public final class JaugeBruit {
    private static final int[] SEUILS = {1, 12, 30};
    private static final long TENUE_MS = 250, FONDU_MS = 1400;
    private static final int[] COULEURS = {0xE8E2D6, 0xE8E2D6, 0xE6A85A};
    private static final float ALPHA_MAX = 0.7f;
    private static final long[] ALLUME = {Long.MIN_VALUE / 2, Long.MIN_VALUE / 2, Long.MIN_VALUE / 2};

    private JaugeBruit() {
    }

    public static void init(IEventBus modBus) {
        Bruit.CLIENT = JaugeBruit::recu;
        modBus.addListener((RegisterGuiLayersEvent e) -> e.registerAbove(VanillaGuiLayers.CROSSHAIR,
                ResourceLocation.fromNamespaceAndPath(AtheriaBestiaire.MODID, "jauge_bruit"), JaugeBruit::dessiner));
    }

    // fil reseau ou fil principal : on ne fait qu'ecrire des horodatages
    private static void recu(int portee) {
        long t = Util.getMillis();
        for (int i = 0; i < SEUILS.length; i++) if (portee >= SEUILS[i]) ALLUME[i] = t;
    }

    private static void dessiner(GuiGraphics g, DeltaTracker delta) {
        Minecraft mc = Minecraft.getInstance();
        if (mc.player == null || mc.player.isSpectator() || mc.options.hideGui) return;
        long t = Util.getMillis();
        int cx = g.guiWidth() / 2, cy = g.guiHeight() / 2;
        for (int i = 0; i < SEUILS.length; i++) {
            long age = t - ALLUME[i];
            if (age < 0 || age > TENUE_MS + FONDU_MS) continue;
            float a = age <= TENUE_MS ? 1f : 1f - (float) (age - TENUE_MS) / FONDU_MS;
            a = a * a * (3 - 2 * a); // fondu adouci
            int alpha = Mth.clamp((int) (a * ALPHA_MAX * 255), 0, 255);
            if (alpha < 4) continue;
            // ombre d'un pixel en dessous, comme le texte du jeu : l'arc reste lisible sur le ciel ou la neige
            arc(g, cx, cy + 10 + 4 * i, 5 + 4 * i, ((alpha * 2 / 5) << 24));
            arc(g, cx, cy + 9 + 4 * i, 5 + 4 * i, (alpha << 24) | COULEURS[i]);
        }
    }

    // arc d'un pixel d'epaisseur, creux vers le haut, sans trou sur les bords
    private static void arc(GuiGraphics g, int cx, int y0, int demi, int couleur) {
        int avant = Integer.MIN_VALUE;
        for (int dx = -demi; dx <= demi; dx++) {
            float u = (float) dx / demi;
            int y = y0 + Math.round(3f * (1 - u * u));
            int haut = avant == Integer.MIN_VALUE ? y : Math.min(y, avant + 1);
            int bas = avant == Integer.MIN_VALUE ? y : Math.max(y, avant - 1);
            g.fill(cx + dx, haut, cx + dx + 1, bas + 1, couleur);
            avant = y;
        }
    }
}
