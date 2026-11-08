package fr.atheria.recit.client;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import fr.atheria.recit.Reseau;
import java.util.ArrayList;
import java.util.List;
import net.minecraft.client.gui.GuiGraphics;
import net.minecraft.client.gui.screens.Screen;
import net.minecraft.client.gui.screens.inventory.InventoryScreen;
import net.minecraft.commands.arguments.EntityAnchorArgument;
import net.minecraft.network.chat.Component;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.sounds.SoundSource;
import net.minecraft.util.FormattedCharSequence;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.LivingEntity;
import net.neoforged.neoforge.network.PacketDistributor;
import org.lwjgl.glfw.GLFW;

// Boite de dialogue en bas de l'ecran, sans menu ni flou : nom, portrait, texte lettre par lettre
// avec un petit son, puis les choix. Espace ou clic : finir la ligne / ligne suivante / valider.
final class EcranDialogue extends Screen {
    private static final int OR = 0xE8C27A;
    private static final int ROUILLE = 0xB5482A;
    private static final int PORTRAIT = 58;

    private record Ligne(String nom, String texte, boolean joueur) {
    }

    private record Choix(String texte, String style) {
    }

    private String nomPnj = "";
    private ResourceLocation portrait;
    private int entite = -1;
    private String son = "minecraft:block.note_block.hat";
    private float hauteur = 1.0f;
    private double vitesse = 40; // lettres par seconde
    private final List<Ligne> lignes = new ArrayList<>();
    private final List<Choix> choix = new ArrayList<>();
    // joueur qui parle au PNJ ; les allies a cote voient la meme bulle sans pouvoir choisir
    int acteur = -1;
    boolean meneur = true;
    String nomMeneur = "";
    boolean camera = true;
    private boolean portraitEntite = true;
    private int ligne;
    private long debutLigne;
    private int lettresJouees;
    private int selection;
    private boolean enAttenteServeur;
    private boolean fermeParServeur;
    // zones cliquables des choix : x1, y1, x2, y2
    private final List<int[]> zones = new ArrayList<>();

    EcranDialogue(JsonObject vue) {
        super(Component.literal("Dialogue"));
        ClientRecit.masquerHud();
        charger(vue);
        regarderPnj();
        ClientRecit.debutDialogue(this);
    }

    void charger(JsonObject v) {
        nomPnj = v.has("nom") ? v.get("nom").getAsString() : "";
        portrait = v.has("portrait") ? ResourceLocation.tryParse(v.get("portrait").getAsString()) : null;
        entite = v.has("entite") ? v.get("entite").getAsInt() : -1;
        portraitEntite = !v.has("portrait_entite") || v.get("portrait_entite").getAsBoolean();
        acteur = v.has("acteur") ? v.get("acteur").getAsInt() : -1;
        meneur = !v.has("meneur") || v.get("meneur").getAsBoolean();
        nomMeneur = v.has("nom_meneur") ? v.get("nom_meneur").getAsString() : "";
        camera = !v.has("camera") || v.get("camera").getAsBoolean();
        if (v.has("son")) son = v.get("son").getAsString();
        if (v.has("hauteur")) hauteur = v.get("hauteur").getAsFloat();
        if (v.has("vitesse")) vitesse = Math.max(5, v.get("vitesse").getAsDouble());
        lignes.clear();
        for (JsonElement el : v.getAsJsonArray("lignes")) {
            JsonObject l = el.getAsJsonObject();
            boolean j = l.has("joueur") && l.get("joueur").getAsBoolean();
            String nom = l.has("nom") ? l.get("nom").getAsString() : j ? "Toi" : null;
            // chez un allie spectateur, "Toi" designe celui qui mene la conversation
            if (j && !meneur && "Toi".equals(nom)) nom = nomMeneur;
            lignes.add(new Ligne(nom, l.get("texte").getAsString(), j));
        }
        choix.clear();
        for (JsonElement el : v.getAsJsonArray("choix")) {
            if (el.isJsonObject()) {
                JsonObject c = el.getAsJsonObject();
                choix.add(new Choix(c.get("texte").getAsString(), c.has("style") ? c.get("style").getAsString() : null));
            } else {
                choix.add(new Choix(el.getAsString(), null));
            }
        }
        ligne = 0;
        selection = 0;
        enAttenteServeur = false;
        nouvelleLigne();
    }

    void fermeParServeur() {
        fermeParServeur = true;
        onClose();
    }

    private void regarderPnj() {
        var mc = net.minecraft.client.Minecraft.getInstance();
        Entity e = pnj();
        if (e != null && mc.player != null && meneur) mc.player.lookAt(EntityAnchorArgument.Anchor.EYES, e.getEyePosition());
    }

    // la ligne en cours est-elle dite par le joueur (contrechamp de la camera) ?
    boolean ligneJoueur() {
        return !lignes.isEmpty() && lignes.get(Math.min(ligne, lignes.size() - 1)).joueur();
    }

    Entity acteur() {
        var mc = net.minecraft.client.Minecraft.getInstance();
        Entity a = acteur >= 0 && mc.level != null ? mc.level.getEntity(acteur) : null;
        return a != null ? a : mc.player;
    }

    Entity pnj() {
        var mc = net.minecraft.client.Minecraft.getInstance();
        return entite >= 0 && mc.level != null ? mc.level.getEntity(entite) : null;
    }

    private void nouvelleLigne() {
        debutLigne = System.nanoTime();
        lettresJouees = 0;
    }

    private String texte() {
        return lignes.isEmpty() ? "" : lignes.get(Math.min(ligne, lignes.size() - 1)).texte();
    }

    private int lettresVisibles() {
        return (int) Math.min(texte().length(), (System.nanoTime() - debutLigne) / 1e9 * vitesse);
    }

    private boolean ligneFinie() {
        return lettresVisibles() >= texte().length();
    }

    private boolean choixVisibles() {
        return !choix.isEmpty() && ligne >= lignes.size() - 1 && ligneFinie() && !enAttenteServeur;
    }

    // l'allie spectateur a tout lu : il attend le choix du meneur
    private boolean attenteMeneur() {
        return !meneur && ligne >= lignes.size() - 1 && ligneFinie();
    }

    // ---------- commandes ----------
    private void avancer() {
        if (enAttenteServeur) return;
        if (!ligneFinie()) {
            debutLigne = System.nanoTime() - (long) (texte().length() / vitesse * 1e9) - 1;
            return;
        }
        if (ligne < lignes.size() - 1) {
            ligne++;
            nouvelleLigne();
            return;
        }
        if (!meneur) return;
        repondre(choix.isEmpty() ? -1 : selection);
    }

    private void repondre(int i) {
        if (!meneur) return;
        enAttenteServeur = true;
        PacketDistributor.sendToServer(new Reseau.ReponseDialogue(i));
    }

    @Override
    public boolean keyPressed(int touche, int scan, int mod) {
        switch (touche) {
            case GLFW.GLFW_KEY_ESCAPE -> {
                onClose();
                return true;
            }
            case GLFW.GLFW_KEY_SPACE, GLFW.GLFW_KEY_ENTER, GLFW.GLFW_KEY_KP_ENTER, GLFW.GLFW_KEY_E -> {
                avancer();
                return true;
            }
            case GLFW.GLFW_KEY_UP, GLFW.GLFW_KEY_W -> {
                if (choixVisibles() && meneur) selection = (selection + choix.size() - 1) % choix.size();
                return true;
            }
            case GLFW.GLFW_KEY_DOWN, GLFW.GLFW_KEY_S -> {
                if (choixVisibles() && meneur) selection = (selection + 1) % choix.size();
                return true;
            }
            default -> {
                int n = touche - GLFW.GLFW_KEY_1;
                if (choixVisibles() && meneur && n >= 0 && n < choix.size()) {
                    selection = n;
                    repondre(n);
                    return true;
                }
                return super.keyPressed(touche, scan, mod);
            }
        }
    }

    @Override
    public boolean mouseClicked(double mx, double my, int bouton) {
        if (choixVisibles() && meneur) {
            for (int i = 0; i < zones.size(); i++) {
                int[] z = zones.get(i);
                if (mx >= z[0] && mx < z[2] && my >= z[1] && my < z[3]) {
                    selection = i;
                    repondre(i);
                    return true;
                }
            }
        }
        avancer();
        return true;
    }

    @Override
    public void mouseMoved(double mx, double my) {
        if (!choixVisibles() || !meneur) return;
        for (int i = 0; i < zones.size(); i++) {
            int[] z = zones.get(i);
            if (mx >= z[0] && mx < z[2] && my >= z[1] && my < z[3]) selection = i;
        }
    }

    // fermee par Echap ou par un autre ecran : le serveur est prevenu pour lever la protection
    @Override
    public void removed() {
        if (!fermeParServeur && !enAttenteServeur) PacketDistributor.sendToServer(new Reseau.ReponseDialogue(-2));
        fermeParServeur = true;
        ClientRecit.rendreHud();
        ClientRecit.finDialogue(this);
    }

    @Override
    public boolean isPauseScreen() {
        return false;
    }

    @Override
    public void renderBackground(GuiGraphics g, int mx, int my, float pt) {
        // un degrade discret sous la boite, le monde reste net
        g.fillGradient(0, height - 130, width, height, 0x00000000, 0x90000000);
    }

    // ---------- dessin ----------
    @Override
    public void render(GuiGraphics g, int mx, int my, float pt) {
        renderBackground(g, mx, my, pt);
        int bw = Math.min(width - 24, 460);
        int bh = PORTRAIT + 18;
        int bx = (width - bw) / 2;
        int by = height - bh - 12;

        // cadre
        g.fill(bx, by, bx + bw, by + bh, 0xE6101010);
        cadre(g, bx, by, bw, bh, 0xFF5A4A3A);
        g.fill(bx, by, bx + bw, by + 2, 0xFF000000 | ROUILLE);

        // portrait : le PNJ lui-meme en buste, ou une image
        int px = bx + 9;
        int py = by + 9;
        int tx = bx + 12;
        Ligne courante = lignes.isEmpty() ? null : lignes.get(Math.min(ligne, lignes.size() - 1));
        boolean joueur = courante != null && courante.joueur();
        Entity e = joueur ? acteur() : portraitEntite ? pnj() : null;
        if (e instanceof LivingEntity || portrait != null) {
            g.fill(px - 1, py - 1, px + PORTRAIT + 1, py + PORTRAIT + 1, 0xFF3A3028);
            // fond clair et chaud : un personnage en tenue sombre reste bien lisible
            g.fillGradient(px, py, px + PORTRAIT, py + PORTRAIT, 0xFF8C7A63, 0xFF4E4236);
            if (portrait != null && !joueur) {
                g.blit(portrait, px, py, 0, 0, PORTRAIT, PORTRAIT, PORTRAIT, PORTRAIT);
            } else {
                LivingEntity vivant = (LivingEntity) e;
                // buste : la tete et les epaules remplissent le cadre, quelle que soit la taille de l'entite
                float echelle = PORTRAIT * 1.05f / Math.max(0.6f, vivant.getBbHeight() * 0.45f);
                // le joueur est rendu invisible pendant le dialogue (protection) : on le montre le temps du portrait
                boolean cache = vivant.isInvisible();
                vivant.setInvisible(false);
                InventoryScreen.renderEntityInInventoryFollowsMouse(g, px, py, px + PORTRAIT, py + PORTRAIT, (int) echelle,
                        vivant.getBbHeight() * 0.36f, px + PORTRAIT * 0.62f, py + PORTRAIT * 0.30f, vivant);
                vivant.setInvisible(cache);
            }
            tx = px + PORTRAIT + 12;
        }

        // nom (celui de la ligne s'il est donne, sinon celui du PNJ)
        Ligne l = lignes.isEmpty() ? null : lignes.get(Math.min(ligne, lignes.size() - 1));
        String nom = l != null && l.nom() != null ? l.nom() : nomPnj;
        if (!nom.isEmpty()) {
            int nw = font.width(nom) + 14;
            g.fill(tx - 4, by - 8, tx - 4 + nw, by + 6, 0xF0181410);
            cadre(g, tx - 4, by - 8, nw, 14, 0xFF000000 | ROUILLE);
            g.drawString(font, nom, tx + 3, by - 5, 0xFF000000 | OR, true);
        }

        // texte, lettre par lettre
        int vis = lettresVisibles();
        sonLettres(vis);
        int largeurTexte = bx + bw - 12 - tx;
        List<FormattedCharSequence> rangs = font.split(Component.literal(texte().substring(0, vis)), largeurTexte);
        for (int i = 0; i < rangs.size() && i < 5; i++) g.drawString(font, rangs.get(i), tx, by + 12 + i * 11, 0xFFF0EDE6, false);

        // suite
        boolean clignote = (System.currentTimeMillis() / 400) % 2 == 0;
        if (attenteMeneur() && choix.isEmpty()) g.drawString(font, nomMeneur + "...", bx + bw - 14 - font.width(nomMeneur + "..."), by + bh - 13, 0xFF8A847A, false);
        else if (ligneFinie() && !enAttenteServeur && !choixVisibles() && clignote) g.drawString(font, "▼", bx + bw - 14, by + bh - 13, 0xFF000000 | OR, false);

        // choix, dans une petite boite au-dessus a droite
        zones.clear();
        if (choixVisibles()) {
            int cw = 0;
            for (Choix c : choix) cw = Math.max(cw, font.width(c.texte()) + (c.style() != null ? 10 : 0));
            if (!meneur) cw = Math.max(cw, font.width(nomMeneur + " choisit...") - 10);
            cw = Math.min(cw + 28, bw - 40);
            int ch = choix.size() * 14 + 8 + (meneur ? 0 : 12);
            int cx = bx + bw - cw;
            int cy = by - ch - 12;
            g.fill(cx, cy, cx + cw, cy + ch, 0xE6101010);
            cadre(g, cx, cy, cw, ch, 0xFF5A4A3A);
            for (int i = 0; i < choix.size(); i++) {
                int ry = cy + 5 + i * 14;
                boolean sel = meneur && i == selection;
                if (sel) g.fill(cx + 2, ry - 2, cx + cw - 2, ry + 11, 0x40000000 | ROUILLE);
                g.drawString(font, sel ? "▶" : " ", cx + 6, ry, 0xFF000000 | OR, false);
                Choix c = choix.get(i);
                int tx2 = cx + 18;
                if ("accepter".equals(c.style())) {
                    g.drawString(font, "✔", tx2, ry, 0xFF6BC46B, false);
                    tx2 += 10;
                } else if ("refuser".equals(c.style())) {
                    g.drawString(font, "✖", tx2, ry, 0xFFD0605A, false);
                    tx2 += 10;
                }
                g.drawString(font, font.plainSubstrByWidth(c.texte(), cx + cw - 6 - tx2), tx2, ry, sel ? 0xFFFFFFFF : meneur ? 0xFFBDB6AA : 0xFF8A847A, false);
                zones.add(new int[] {cx, ry - 2, cx + cw, ry + 12});
            }
            if (!meneur) g.drawString(font, nomMeneur + " choisit...", cx + 8, cy + ch - 12, 0xFF000000 | OR, false);
        }
    }

    private void sonLettres(int vis) {
        if (vis <= lettresJouees) return;
        String t = texte();
        for (int i = lettresJouees; i < vis; i++) {
            char c = t.charAt(i);
            if (i % 2 == 0 && !Character.isWhitespace(c) && Character.isLetterOrDigit(c)) {
                ClientRecit.son(son, SoundSource.MASTER, 0.22f, hauteur * (0.94f + (float) Math.random() * 0.12f));
                break;
            }
        }
        lettresJouees = vis;
    }

    private static void cadre(GuiGraphics g, int x, int y, int w, int h, int c) {
        g.fill(x, y, x + w, y + 1, c);
        g.fill(x, y + h - 1, x + w, y + h, c);
        g.fill(x, y, x + 1, y + h, c);
        g.fill(x + w - 1, y, x + w, y + h, c);
    }
}
