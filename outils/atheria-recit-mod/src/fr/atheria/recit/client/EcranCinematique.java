package fr.atheria.recit.client;

import com.mojang.blaze3d.platform.InputConstants;
import java.util.List;
import net.minecraft.client.gui.GuiGraphics;
import net.minecraft.client.gui.screens.Screen;
import net.minecraft.network.chat.Component;
import net.minecraft.util.FormattedCharSequence;
import net.minecraft.util.Mth;
import org.lwjgl.glfw.GLFW;

// Ecran transparent pose sur le monde pendant une cinematique : il bloque les commandes du joueur
// et dessine bandes noires, fondus, titres, sous-titres et cartes d'explication.
final class EcranCinematique extends Screen {
    private static final double MAINTIEN_POUR_PASSER = 1.0;
    private static final int OR = 0xE8C27A;
    private static final int ROUILLE = 0xB5482A;
    private long maintienDebut;

    EcranCinematique() {
        super(Component.literal("Cinematique"));
    }

    @Override
    protected void init() {
        GLFW.glfwSetInputMode(minecraft.getWindow().getWindow(), GLFW.GLFW_CURSOR, GLFW.GLFW_CURSOR_HIDDEN);
    }

    @Override
    public boolean isPauseScreen() {
        return false;
    }

    @Override
    public boolean shouldCloseOnEsc() {
        return false;
    }

    @Override
    public void renderBackground(GuiGraphics g, int mx, int my, float pt) {
        // rien : le monde reste visible, sans flou
    }

    @Override
    public void render(GuiGraphics g, int mx, int my, float pt) {
        Cinematique c = ClientRecit.cine;
        if (c == null) return;
        double t = ClientRecit.temps();
        int w = width;
        int h = height;

        // bandes de cinema
        int bande = 0;
        if (c.bandes) {
            double k = t < 0 ? 1 : Mth.clamp(Math.min(t / 1.5 + 1, (c.duree - t) / 1.2), 0, 1);
            bande = (int) Math.round(h * 0.095 * lisse(k));
            g.fill(0, 0, w, bande, 0xFF000000);
            g.fill(0, h - bande, w, h, 0xFF000000);
        }

        // fondu au noir : le dernier fondu commence decide
        double noir = c.debutNoir ? 1 : 0;
        for (Cinematique.Evenement e : c.evenements) {
            if (e.fondu == null || t < e.t) continue;
            double k = Mth.clamp((t - e.t) / Math.max(0.01, e.duree), 0, 1);
            noir = "ouverture".equals(e.fondu) ? 1 - k : k;
        }
        if (t < 0 && c.debutNoir) noir = 1;
        if (noir > 0.003) g.fill(0, 0, w, h, argb(noir, 0x000000));

        for (Cinematique.Evenement e : c.evenements) {
            if (t < e.t || t > e.t + e.duree) continue;
            double a = enveloppe(t - e.t, e.duree, 0.9, 0.9);
            if (a < 0.03) continue;
            if (e.titre != null) titre(g, e, a, w, h);
            if (e.texte != null) sousTitre(g, e, t - e.t, a, w, h, bande);
            if (e.carteTitre != null) carte(g, e, t - e.t, a, w, h, bande);
        }

        passer(g, t, w, h, bande);
    }

    private void titre(GuiGraphics g, Cinematique.Evenement e, double a, int w, int h) {
        float s = Mth.clamp(w / 110f, 2.2f, 4.5f);
        texteCentre(g, e.titre, w / 2f, h * 0.38f, s, argb(a, 0xFFFFFF));
        if (e.sousTitre != null) texteCentre(g, e.sousTitre, w / 2f, h * 0.38f + 9 * s + 8, Math.max(1.2f, s * 0.38f), argb(a * 0.9, OR));
    }

    // degrade sombre en bas de l'image : le texte reste lisible sans encadre
    private static void degrade(GuiGraphics g, double a, int w, int h) {
        g.fillGradient(0, (int) (h * 0.6), w, h, 0x00000000, argb(a * 0.6, 0x000000));
    }

    // y de la ligne de base des textes du bas, juste au-dessus de la bande noire
    private int bas(int h, int bande) {
        return h - Math.max(bande, 14) - 12;
    }

    // machine a ecrire, 38 lettres par seconde
    private static String ecrit(String s, double ecoule) {
        return s.substring(0, (int) Math.min(s.length(), Math.max(0, ecoule) * 38));
    }

    private void sousTitre(GuiGraphics g, Cinematique.Evenement e, double ecoule, double a, int w, int h, int bande) {
        degrade(g, a, w, h);
        int large = (int) Math.min(w * 0.7, 420);
        List<FormattedCharSequence> lignes = font.split(Component.literal(ecrit(e.texte, ecoule)), large);
        int total = font.split(Component.literal(e.texte), large).size();
        int y = bas(h, bande) - total * 11;
        for (int i = 0; i < lignes.size(); i++) {
            FormattedCharSequence l = lignes.get(i);
            g.drawString(font, l, (w - font.width(l)) / 2, y + i * 11, argb(a, 0xF2F2F2), true);
        }
    }

    // une regle : petite icone et titre en accent, puis une ligne courte ecrite lettre par lettre, centres en bas
    private void carte(GuiGraphics g, Cinematique.Evenement e, double ecoule, double a, int w, int h, int bande) {
        degrade(g, a, w, h);
        int large = (int) Math.min(w * 0.7, 420);
        String texte = String.join(" ", e.carteLignes);
        List<FormattedCharSequence> lignes = font.split(Component.literal(ecrit(texte, ecoule - 0.4)), large);
        int total = texte.isEmpty() ? 0 : font.split(Component.literal(texte), large).size();
        int y = bas(h, bande) - total * 11;
        // titre (echelle 1.4) avec l'icone a sa gauche ; il monte de quelques pixels en apparaissant
        float s = 1.4f;
        int titreL = (int) (font.width(e.carteTitre) * s);
        boolean icone = !e.icone.isEmpty();
        int bloc = titreL + (icone ? 20 : 0);
        int x0 = (w - bloc) / 2;
        int ty = y - 22 + (int) ((1 - lisse(a)) * 4);
        if (icone && a > 0.4) g.renderItem(e.icone, x0, ty - 3);
        g.pose().pushPose();
        g.pose().translate(x0 + (icone ? 20 : 0), ty, 0);
        g.pose().scale(s, s, 1);
        if ((argb(a, OR) >>> 24) >= 5) g.drawString(font, e.carteTitre, 0, 0, argb(a, OR), true);
        g.pose().popPose();
        // fin filet rouille sous le titre
        int filet = Math.min(bloc, 60);
        g.fill((w - filet) / 2, ty + 15, (w + filet) / 2, ty + 16, argb(a * 0.8, ROUILLE));
        for (int i = 0; i < lignes.size(); i++) {
            FormattedCharSequence l = lignes.get(i);
            g.drawString(font, l, (w - font.width(l)) / 2, y + i * 11, argb(a, 0xEDEDED), true);
        }
    }

    // derniere touche ou clic : l'indication "Maintenir Espace pour passer" n'apparait qu'a ce moment-la
    private long derniereTouche;

    @Override
    public boolean keyPressed(int key, int scan, int mods) {
        derniereTouche = System.nanoTime();
        return true;
    }

    @Override
    public boolean mouseClicked(double x, double y, int b) {
        derniereTouche = System.nanoTime();
        return true;
    }

    // "Maintenir Espace pour passer", avec une jauge ; visible 3 s apres la derniere touche
    private void passer(GuiGraphics g, double t, int w, int h, int bande) {
        if (!ClientRecit.passable || t < -0.5) return;
        long fen = minecraft.getWindow().getWindow();
        boolean appui = InputConstants.isKeyDown(fen, GLFW.GLFW_KEY_SPACE) || InputConstants.isKeyDown(fen, GLFW.GLFW_KEY_ENTER)
                || InputConstants.isKeyDown(fen, GLFW.GLFW_KEY_ESCAPE);
        long now = System.nanoTime();
        if (appui) derniereTouche = now;
        if (!appui) maintienDebut = 0;
        else if (maintienDebut == 0) maintienDebut = now;
        double prog = maintienDebut == 0 ? 0 : (now - maintienDebut) / 1e9 / MAINTIEN_POUR_PASSER;
        if (prog >= 1) {
            ClientRecit.finir(true);
            return;
        }
        double depuis = derniereTouche == 0 ? 99 : (now - derniereTouche) / 1e9;
        double vis = depuis < 3 ? 1 : Math.max(0, 1 - (depuis - 3) / 0.6);
        if (vis <= 0) return;
        String txt = "Maintenir Espace pour passer";
        int x = w - font.width(txt) - 12;
        int y = bande >= 12 ? h - bande / 2 - 4 : h - 16;
        g.drawString(font, txt, x, y, argb(vis * (appui ? 0.95 : 0.6), 0xFFFFFF), false);
        if (prog > 0) g.fill(x, y + 10, x + (int) (font.width(txt) * Math.min(1, prog)), y + 11, argb(0.9, OR));
    }
    private void texteCentre(GuiGraphics g, String s, float cx, float y, float echelle, int couleur) {
        if ((couleur >>> 24) < 5) return;
        g.pose().pushPose();
        g.pose().translate(cx, y, 0);
        g.pose().scale(echelle, echelle, 1);
        g.drawString(font, s, -font.width(s) / 2, 0, couleur, true);
        g.pose().popPose();
    }

    // apparition et disparition en douceur
    static double enveloppe(double t, double duree, double entree, double sortie) {
        double a = Math.min(1, t / entree);
        double b = Math.min(1, (duree - t) / sortie);
        return lisse(Mth.clamp(Math.min(a, b), 0, 1));
    }

    static double lisse(double k) {
        return k * k * (3 - 2 * k);
    }

    // couleur avec opacite ; en dessous de 5 la police ignore l'alpha, on reste donc au-dessus ou a 0
    static int argb(double alpha, int rgb) {
        int a = (int) Math.round(Mth.clamp(alpha, 0, 1) * 255);
        if (a < 5) a = 0;
        return (a << 24) | (rgb & 0xFFFFFF);
    }
}
