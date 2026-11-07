package fr.atheria.monde.guide;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.Reader;
import java.util.ArrayList;
import java.util.List;
import net.createmod.catnip.gui.ScreenOpener;
import net.createmod.ponder.foundation.ui.PonderUI;
import net.minecraft.ChatFormatting;
import net.minecraft.client.KeyMapping;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.Font;
import net.minecraft.client.gui.GuiGraphics;
import net.minecraft.client.gui.screens.Screen;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.network.chat.Component;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.util.FormattedCharSequence;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.crafting.Ingredient;
import net.minecraft.world.item.crafting.Recipe;
import net.minecraft.world.item.crafting.RecipeHolder;
import net.minecraft.world.item.crafting.ShapedRecipe;
import org.lwjgl.glfw.GLFW;

// Guide du survivant : une interface propre a Atheria, ouverte depuis le menu pause ou F4, jamais un objet d'inventaire.
// A gauche les chapitres, en haut le resume rapide ou le detail complet, et des boutons qui lancent les tutoriels animes.
public class GuideEcran extends Screen {
    private static final ResourceLocation DONNEES = ResourceLocation.parse("atheria:guide/guide.json");
    private static final ResourceLocation FOND = ResourceLocation.parse("atheria:textures/gui/fond_menu.png");
    private static final int FOND_VOILE = 0xD80C0E0B;
    private static final int PANNEAU = 0xCC151712;
    private static final int PANNEAU_CLAIR = 0x402A2C24;
    private static final int LIGNE = 0xFF3A3B30;
    private static final int AMBRE = 0xFFE09A3B;
    private static final int TEXTE = 0xFFE8E2D0;
    private static final int TEXTE_DOUX = 0xFFA79F8A;
    private static final int LARGEUR_MENU = 132;
    private static final int HAUT_LIGNE_MENU = 22;
    private static final int MARGE = 12;

    private static JsonArray chapitres;
    private static Screen retour;
    private static int dernierChapitre;
    private static boolean dernierDetail;

    private final Screen parent;
    private int chapitre;
    private boolean detail;
    private int defilement;
    private int defilementMenu;
    private int hauteurContenu;
    private final List<Element> contenu = new ArrayList<>();
    private ItemStack infobulle = ItemStack.EMPTY;
    private boolean glisse;

    public GuideEcran(Screen parent, String idChapitre, Boolean voirDetail) {
        super(Component.literal("Guide du survivant"));
        this.parent = parent;
        charger();
        chapitre = dernierChapitre;
        detail = voirDetail != null ? voirDetail : dernierDetail;
        if (idChapitre != null) {
            for (int i = 0; i < chapitres.size(); i++) {
                if (idChapitre.equals(chapitres.get(i).getAsJsonObject().get("id").getAsString())) chapitre = i;
            }
        }
    }

    // A ouvrir depuis les scripts du pack
    public static void ouvrir(String idChapitre, Boolean voirDetail) {
        Minecraft mc = Minecraft.getInstance();
        mc.setScreen(new GuideEcran(mc.screen, idChapitre, voirDetail));
    }

    public static void animer(String objet) {
        Minecraft mc = Minecraft.getInstance();
        if (mc.screen instanceof GuideEcran guide) retour = guide;
        ScreenOpener.transitionTo(PonderUI.of(ResourceLocation.parse(objet)));
    }

    // Le guide a rouvrir a la fermeture d'un tutoriel, s'il y en a un
    public static Screen reprendre() {
        Screen guide = retour;
        retour = null;
        return guide;
    }

    private static void charger() {
        chapitres = new JsonArray();
        try (Reader lecteur = Minecraft.getInstance().getResourceManager().openAsReader(DONNEES)) {
            JsonObject racine = JsonParser.parseReader(lecteur).getAsJsonObject();
            chapitres = racine.getAsJsonArray("chapitres");
        } catch (Exception e) {
            JsonObject vide = new JsonObject();
            vide.addProperty("id", "erreur");
            vide.addProperty("titre", "Guide introuvable");
            vide.add("resume", new JsonArray());
            vide.add("detail", new JsonArray());
            chapitres.add(vide);
        }
    }

    @Override
    protected void init() {
        construire();
    }

    @Override
    public void onClose() {
        dernierChapitre = chapitre;
        dernierDetail = detail;
        Minecraft.getInstance().setScreen(parent);
    }

    @Override
    public boolean isPauseScreen() {
        return true;
    }

    // --- Mise en page ---

    private int xContenu() {
        return MARGE + LARGEUR_MENU + 10;
    }

    private int yContenu() {
        return 58;
    }

    private int largeurContenu() {
        return width - xContenu() - MARGE - 10;
    }

    private int hauteurVisible() {
        return height - yContenu() - MARGE;
    }

    private void construire() {
        contenu.clear();
        JsonObject c = chapitres.get(chapitre).getAsJsonObject();
        JsonArray blocs = c.getAsJsonArray(detail ? "detail" : "resume");
        int y = 0;
        int l = largeurContenu();
        for (JsonElement brut : blocs) {
            Element e = creer(brut.getAsJsonObject(), l);
            if (e == null) continue;
            e.y = y;
            contenu.add(e);
            y += e.hauteur + 6;
        }
        hauteurContenu = y;
        limiter();
    }

    private void limiter() {
        defilement = Math.max(0, Math.min(defilement, Math.max(0, hauteurContenu - hauteurVisible())));
    }

    private Element creer(JsonObject b, int largeur) {
        String t = b.get("t").getAsString();
        return switch (t) {
            case "titre" -> new Titre(b.get("texte").getAsString(), largeur);
            case "p" -> new Paragraphe(b.get("texte").getAsString(), largeur, TEXTE, 0);
            case "astuce" -> new Paragraphe(b.get("texte").getAsString(), largeur, 0xFFE9C98E, 8);
            case "touches" -> new Touches(b.getAsJsonArray("lignes"), largeur);
            case "recette" -> new Fabrication(b.get("item").getAsString());
            case "materiaux" -> new Materiaux(b, largeur);
            case "figure" -> new Figure(b.get("icone").getAsString(), b.get("texte").getAsString(), largeur);
            case "image" -> new Illustration(b, largeur);
            case "animation" -> new BoutonAnimation(b.get("id").getAsString(), b.get("texte").getAsString(), largeur);
            default -> null;
        };
    }

    // --- Rendu ---

    @Override
    public void renderBackground(GuiGraphics g, int mx, int my, float pt) {
        g.blit(FOND, 0, 0, 0, 0.0F, 0.0F, width, height, width, height);
        g.fill(0, 0, width, height, FOND_VOILE);
    }

    @Override
    public void render(GuiGraphics g, int mx, int my, float pt) {
        super.render(g, mx, my, pt);
        infobulle = ItemStack.EMPTY;
        JsonObject c = chapitres.get(chapitre).getAsJsonObject();

        g.drawString(font, Component.literal("GUIDE DU SURVIVANT").withStyle(ChatFormatting.BOLD), MARGE, MARGE, AMBRE, false);
        g.drawString(font, "Échap pour revenir", width - MARGE - font.width("Échap pour revenir"), MARGE, TEXTE_DOUX, false);
        g.fill(MARGE, MARGE + 12, width - MARGE, MARGE + 13, LIGNE);

        dessinerMenu(g, mx, my);

        int x = xContenu();
        g.drawString(font, c.get("titre").getAsString(), x, 32, TEXTE, false);
        dessinerOnglet(g, mx, my, x + largeurContenu() - 170, 28, 80, "Résumé rapide", !detail);
        dessinerOnglet(g, mx, my, x + largeurContenu() - 86, 28, 96, "Tout comprendre", detail);
        g.fill(x, 46, x + largeurContenu() + 10, 47, LIGNE);

        int haut = yContenu();
        int bas = haut + hauteurVisible();
        g.enableScissor(x, haut, x + largeurContenu() + 10, bas);
        for (Element e : contenu) {
            int yy = haut + e.y - defilement;
            if (yy + e.hauteur < haut || yy > bas) continue;
            e.dessiner(g, x, yy, mx, my, my >= haut && my < bas);
        }
        g.disableScissor();

        if (hauteurContenu > hauteurVisible()) {
            int barre = Math.max(18, hauteurVisible() * hauteurVisible() / hauteurContenu);
            int yb = haut + (hauteurVisible() - barre) * defilement / Math.max(1, hauteurContenu - hauteurVisible());
            int xb = x + largeurContenu() + 6;
            g.fill(xb, haut, xb + 3, bas, PANNEAU_CLAIR);
            g.fill(xb, yb, xb + 3, yb + barre, AMBRE);
        }
        if (!infobulle.isEmpty()) g.renderTooltip(font, infobulle, mx, my);
    }

    private void dessinerOnglet(GuiGraphics g, int mx, int my, int x, int y, int l, String texte, boolean actif) {
        boolean survol = mx >= x && mx < x + l && my >= y && my < y + 16;
        g.fill(x, y, x + l, y + 16, actif ? 0x60E09A3B : survol ? 0x40FFFFFF : PANNEAU_CLAIR);
        if (actif) g.fill(x, y + 15, x + l, y + 16, AMBRE);
        g.drawCenteredString(font, texte, x + l / 2, y + 4, actif ? 0xFFFFFFFF : TEXTE_DOUX);
    }

    private void dessinerMenu(GuiGraphics g, int mx, int my) {
        int haut = 28;
        int bas = height - MARGE;
        g.fill(MARGE, haut, MARGE + LARGEUR_MENU, bas, PANNEAU);
        g.enableScissor(MARGE, haut, MARGE + LARGEUR_MENU, bas);
        for (int i = 0; i < chapitres.size(); i++) {
            JsonObject c = chapitres.get(i).getAsJsonObject();
            int y = haut + i * HAUT_LIGNE_MENU - defilementMenu;
            boolean survol = mx >= MARGE && mx < MARGE + LARGEUR_MENU && my >= y && my < y + HAUT_LIGNE_MENU && my >= haut && my < bas;
            if (i == chapitre) {
                g.fill(MARGE, y, MARGE + LARGEUR_MENU, y + HAUT_LIGNE_MENU, 0x50E09A3B);
                g.fill(MARGE, y, MARGE + 2, y + HAUT_LIGNE_MENU, AMBRE);
            } else if (survol) {
                g.fill(MARGE, y, MARGE + LARGEUR_MENU, y + HAUT_LIGNE_MENU, 0x30FFFFFF);
            }
            if (c.has("icone")) g.renderItem(objet(c.get("icone").getAsString()), MARGE + 5, y + 3);
            String titre = font.plainSubstrByWidth(c.get("titre").getAsString(), LARGEUR_MENU - 30);
            g.drawString(font, titre, MARGE + 25, y + 7, i == chapitre ? 0xFFFFFFFF : TEXTE, false);
        }
        g.disableScissor();
    }

    // --- Actions ---

    @Override
    public boolean mouseClicked(double mx, double my, int bouton) {
        if (bouton != 0) return super.mouseClicked(mx, my, bouton);
        if (mx >= MARGE && mx < MARGE + LARGEUR_MENU && my >= 28 && my < height - MARGE) {
            int i = (int) (my - 28 + defilementMenu) / HAUT_LIGNE_MENU;
            if (i >= 0 && i < chapitres.size()) {
                chapitre = i;
                defilement = 0;
                dernierChapitre = i;
                construire();
                clic();
            }
            return true;
        }
        int x = xContenu();
        if (my >= 28 && my < 44) {
            if (mx >= x + largeurContenu() - 170 && mx < x + largeurContenu() - 90) {
                changerOnglet(false);
                return true;
            }
            if (mx >= x + largeurContenu() - 86 && mx < x + largeurContenu() + 10) {
                changerOnglet(true);
                return true;
            }
        }
        if (hauteurContenu > hauteurVisible() && mx >= x + largeurContenu() + 4 && mx < x + largeurContenu() + 12 && my >= yContenu()) {
            glisse = true;
            placerBarre(my);
            return true;
        }
        if (my >= yContenu() && my < yContenu() + hauteurVisible()) {
            for (Element e : contenu) {
                int yy = yContenu() + e.y - defilement;
                if (my >= yy && my < yy + e.hauteur && mx >= x && e.clic((int) mx - x, (int) my - yy)) return true;
            }
        }
        return super.mouseClicked(mx, my, bouton);
    }

    private void changerOnglet(boolean versDetail) {
        if (detail == versDetail) return;
        detail = versDetail;
        dernierDetail = versDetail;
        defilement = 0;
        construire();
        clic();
    }

    private void clic() {
        Minecraft.getInstance().getSoundManager().play(net.minecraft.client.resources.sounds.SimpleSoundInstance.forUI(net.minecraft.sounds.SoundEvents.UI_BUTTON_CLICK, 1.0F));
    }

    private void placerBarre(double my) {
        double part = (my - yContenu()) / Math.max(1, hauteurVisible());
        defilement = (int) (part * (hauteurContenu - hauteurVisible()));
        limiter();
    }

    @Override
    public boolean mouseDragged(double mx, double my, int bouton, double dx, double dy) {
        if (glisse) {
            placerBarre(my);
            return true;
        }
        return super.mouseDragged(mx, my, bouton, dx, dy);
    }

    @Override
    public boolean mouseReleased(double mx, double my, int bouton) {
        glisse = false;
        return super.mouseReleased(mx, my, bouton);
    }

    @Override
    public boolean mouseScrolled(double mx, double my, double sx, double sy) {
        if (mx < MARGE + LARGEUR_MENU) {
            int max = Math.max(0, chapitres.size() * HAUT_LIGNE_MENU - (height - MARGE - 28));
            defilementMenu = Math.max(0, Math.min(max, defilementMenu - (int) (sy * 16)));
        } else {
            defilement -= (int) (sy * 24);
            limiter();
        }
        return true;
    }

    @Override
    public boolean keyPressed(int touche, int scan, int mods) {
        if (touche == GLFW.GLFW_KEY_DOWN || touche == GLFW.GLFW_KEY_PAGE_DOWN) {
            defilement += touche == GLFW.GLFW_KEY_DOWN ? 24 : hauteurVisible() - 24;
            limiter();
            return true;
        }
        if (touche == GLFW.GLFW_KEY_UP || touche == GLFW.GLFW_KEY_PAGE_UP) {
            defilement -= touche == GLFW.GLFW_KEY_UP ? 24 : hauteurVisible() - 24;
            limiter();
            return true;
        }
        if (touche == GLFW.GLFW_KEY_TAB) {
            changerOnglet(!detail);
            return true;
        }
        return super.keyPressed(touche, scan, mods);
    }

    // --- Elements du contenu ---

    private static ItemStack objet(String id) {
        Item item = BuiltInRegistries.ITEM.get(ResourceLocation.parse(id));
        return new ItemStack(item);
    }

    private static String nomTouche(String nom) {
        if (!nom.startsWith("@")) return nom;
        String recherche = nom.substring(1);
        for (KeyMapping k : Minecraft.getInstance().options.keyMappings) {
            if (k.getName().equals(recherche)) return k.isUnbound() ? "non attribuée" : k.getTranslatedKeyMessage().getString().toUpperCase();
        }
        return recherche;
    }

    private void objetEtInfobulle(GuiGraphics g, ItemStack s, int x, int y, int mx, int my, boolean visible) {
        g.fill(x - 1, y - 1, x + 17, y + 17, PANNEAU_CLAIR);
        if (s.isEmpty()) return;
        g.renderItem(s, x, y);
        g.renderItemDecorations(font, s, x, y);
        if (visible && mx >= x - 1 && mx < x + 17 && my >= y - 1 && my < y + 17) infobulle = s;
    }

    private abstract static class Element {
        int y;
        int hauteur;

        abstract void dessiner(GuiGraphics g, int x, int yy, int mx, int my, boolean visible);

        boolean clic(int rx, int ry) {
            return false;
        }
    }

    private class Titre extends Element {
        final List<FormattedCharSequence> lignes;

        Titre(String texte, int largeur) {
            lignes = font.split(Component.literal(texte).withStyle(ChatFormatting.BOLD), largeur);
            hauteur = lignes.size() * 11 + 7;
        }

        @Override
        void dessiner(GuiGraphics g, int x, int yy, int mx, int my, boolean visible) {
            int l = yy + 3;
            for (FormattedCharSequence s : lignes) {
                g.drawString(font, s, x, l, AMBRE, false);
                l += 11;
            }
            g.fill(x, l, x + 40, l + 1, AMBRE);
        }
    }

    private class Paragraphe extends Element {
        final List<FormattedCharSequence> lignes;
        final int couleur;
        final int retrait;

        Paragraphe(String texte, int largeur, int couleur, int retrait) {
            this.couleur = couleur;
            this.retrait = retrait;
            lignes = font.split(Component.literal(texte), largeur - retrait);
            hauteur = lignes.size() * 11;
        }

        @Override
        void dessiner(GuiGraphics g, int x, int yy, int mx, int my, boolean visible) {
            if (retrait > 0) g.fill(x, yy - 1, x + 2, yy + hauteur - 1, AMBRE);
            int l = yy;
            for (FormattedCharSequence s : lignes) {
                g.drawString(font, s, x + retrait, l, couleur, false);
                l += 11;
            }
        }
    }

    private class Touches extends Element {
        final List<String> caps = new ArrayList<>();
        final List<List<FormattedCharSequence>> textes = new ArrayList<>();
        final int largeurCap;

        Touches(JsonArray lignes, int largeur) {
            int max = 0;
            for (JsonElement l : lignes) {
                JsonArray a = l.getAsJsonArray();
                String cap = nomTouche(a.get(0).getAsString());
                caps.add(cap);
                max = Math.max(max, font.width(cap));
            }
            largeurCap = max + 10;
            hauteur = 0;
            for (JsonElement l : lignes) {
                List<FormattedCharSequence> t = font.split(Component.literal(l.getAsJsonArray().get(1).getAsString()), largeur - largeurCap - 8);
                textes.add(t);
                hauteur += Math.max(15, t.size() * 11 + 4);
            }
        }

        @Override
        void dessiner(GuiGraphics g, int x, int yy, int mx, int my, boolean visible) {
            int l = yy;
            for (int i = 0; i < caps.size(); i++) {
                g.fill(x, l, x + largeurCap, l + 13, 0xFF2B2C24);
                g.fill(x, l + 12, x + largeurCap, l + 13, AMBRE);
                g.drawCenteredString(font, caps.get(i), x + largeurCap / 2, l + 2, 0xFFFFFFFF);
                int lt = l + 2;
                for (FormattedCharSequence s : textes.get(i)) {
                    g.drawString(font, s, x + largeurCap + 8, lt, TEXTE, false);
                    lt += 11;
                }
                l += Math.max(15, textes.get(i).size() * 11 + 4);
            }
        }
    }

    // Grille de fabrication lue dans les vraies recettes du jeu : le guide reste juste si une recette change.
    private class Fabrication extends Element {
        final ItemStack sortie;
        final Ingredient[] grille = new Ingredient[9];
        boolean trouvee;

        Fabrication(String id) {
            sortie = objet(id);
            hauteur = 60;
            Minecraft mc = Minecraft.getInstance();
            if (mc.level == null) return;
            for (RecipeHolder<?> h : mc.level.getRecipeManager().getRecipes()) {
                Recipe<?> r = h.value();
                ItemStack res;
                try {
                    res = r.getResultItem(mc.level.registryAccess());
                } catch (Exception e) {
                    continue;
                }
                if (res.getItem() != sortie.getItem()) continue;
                List<Ingredient> ing = r.getIngredients();
                if (ing.isEmpty()) continue;
                int larg = r instanceof ShapedRecipe s ? s.getWidth() : 3;
                for (int i = 0; i < ing.size() && i < 9; i++) {
                    int col = i % larg;
                    int lig = i / larg;
                    grille[lig * 3 + col] = ing.get(i);
                }
                trouvee = true;
                break;
            }
        }

        @Override
        void dessiner(GuiGraphics g, int x, int yy, int mx, int my, boolean visible) {
            int temps = (int) (System.currentTimeMillis() / 1000);
            for (int i = 0; i < 9; i++) {
                int sx = x + 1 + (i % 3) * 19;
                int sy = yy + 1 + (i / 3) * 19;
                ItemStack s = ItemStack.EMPTY;
                if (grille[i] != null && grille[i].getItems().length > 0) s = grille[i].getItems()[temps % grille[i].getItems().length];
                objetEtInfobulle(g, s, sx, sy, mx, my, visible);
            }
            g.drawString(font, "→", x + 64, yy + 22, AMBRE, false);
            objetEtInfobulle(g, sortie, x + 78, yy + 20, mx, my, visible);
            g.drawString(font, sortie.getHoverName(), x + 100, yy + 24, TEXTE, false);
            if (!trouvee) g.drawString(font, "Recette : voir JEI", x + 100, yy + 36, TEXTE_DOUX, false);
        }
    }

    private class Materiaux extends Element {
        final List<ItemStack> objets = new ArrayList<>();
        final String titre;
        final int parLigne;

        Materiaux(JsonObject b, int largeur) {
            titre = b.has("titre") ? b.get("titre").getAsString() : null;
            parLigne = Math.max(1, largeur / 20);
            for (JsonElement e : b.getAsJsonArray("items")) {
                JsonArray a = e.getAsJsonArray();
                ItemStack s = objet(a.get(0).getAsString());
                s.setCount(a.size() > 1 ? a.get(1).getAsInt() : 1);
                objets.add(s);
            }
            int lignes = (objets.size() + parLigne - 1) / parLigne;
            hauteur = lignes * 20 + (titre != null ? 12 : 0);
        }

        @Override
        void dessiner(GuiGraphics g, int x, int yy, int mx, int my, boolean visible) {
            int depart = yy;
            if (titre != null) {
                g.drawString(font, titre, x, yy, TEXTE_DOUX, false);
                depart += 12;
            }
            for (int i = 0; i < objets.size(); i++) {
                objetEtInfobulle(g, objets.get(i), x + 1 + (i % parLigne) * 20, depart + 1 + (i / parLigne) * 20, mx, my, visible);
            }
        }
    }

    // Une figure de parkour : son icone ParCool, son nom en couleur, puis comment la faire.
    private class Figure extends Element {
        final ResourceLocation icone;
        final List<FormattedCharSequence> lignes;

        Figure(String nom, String texte, int largeur) {
            icone = ResourceLocation.parse("parcool:textures/parcool_actions/" + nom + ".png");
            int coupe = texte.indexOf(" : ");
            Component ligne = coupe < 0 ? Component.literal(texte) : Component.empty().append(Component.literal(texte.substring(0, coupe)).withColor(AMBRE & 0xFFFFFF)).append(texte.substring(coupe));
            lignes = font.split(ligne, largeur - 30);
            hauteur = Math.max(24, lignes.size() * 11 + 2);
        }

        @Override
        void dessiner(GuiGraphics g, int x, int yy, int mx, int my, boolean visible) {
            g.fill(x, yy, x + 24, yy + 24, PANNEAU_CLAIR);
            g.blit(icone, x, yy, 24, 24, 0.0F, 0.0F, 32, 32, 32, 32);
            int l = yy + Math.max(1, (24 - lignes.size() * 11) / 2);
            for (FormattedCharSequence s : lignes) {
                g.drawString(font, s, x + 30, l, TEXTE, false);
                l += 11;
            }
        }
    }

    private class Illustration extends Element {
        final ResourceLocation tex;
        final int texL;
        final int texH;
        final int l;
        final int h;
        final List<FormattedCharSequence> legende;

        Illustration(JsonObject b, int largeur) {
            tex = ResourceLocation.parse(b.get("tex").getAsString());
            texL = b.get("l").getAsInt();
            texH = b.get("h").getAsInt();
            int cible = b.has("largeur") ? Math.min(largeur, b.get("largeur").getAsInt()) : Math.min(largeur, 320);
            l = cible;
            h = cible * texH / texL;
            legende = b.has("legende") ? font.split(Component.literal(b.get("legende").getAsString()), largeur) : List.of();
            hauteur = h + 4 + legende.size() * 10;
        }

        @Override
        void dessiner(GuiGraphics g, int x, int yy, int mx, int my, boolean visible) {
            g.fill(x - 1, yy - 1, x + l + 1, yy + h + 1, LIGNE);
            g.blit(tex, x, yy, l, h, 0.0F, 0.0F, texL, texH, texL, texH);
            int ly = yy + h + 3;
            for (FormattedCharSequence s : legende) {
                g.drawString(font, s, x, ly, TEXTE_DOUX, false);
                ly += 10;
            }
        }
    }

    private class BoutonAnimation extends Element {
        final String id;
        final String texte;
        final int l;

        BoutonAnimation(String id, String texte, int largeur) {
            this.id = id;
            this.texte = "▶  " + texte;
            hauteur = 20;
            l = Math.min(largeur, font.width(this.texte) + 16);
        }

        @Override
        void dessiner(GuiGraphics g, int x, int yy, int mx, int my, boolean visible) {
            boolean survol = visible && mx >= x && mx < x + l && my >= yy && my < yy + hauteur;
            g.fill(x, yy, x + l, yy + hauteur, survol ? 0x90E09A3B : 0x60E09A3B);
            g.fill(x, yy + hauteur - 1, x + l, yy + hauteur, AMBRE);
            g.drawString(font, texte, x + 8, yy + 6, 0xFFFFFFFF, false);
        }

        @Override
        boolean clic(int rx, int ry) {
            if (rx >= l) return false;
            if (Minecraft.getInstance().level == null) return false;
            clic();
            dernierChapitre = chapitre;
            dernierDetail = detail;
            animer(id);
            return true;
        }

        private void clic() {
            GuideEcran.this.clic();
        }
    }
}
