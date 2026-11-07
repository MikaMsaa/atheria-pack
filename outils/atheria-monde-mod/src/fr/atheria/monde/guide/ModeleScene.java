package fr.atheria.monde.guide;

import com.mojang.blaze3d.platform.NativeImage;
import com.mojang.blaze3d.vertex.PoseStack;
import com.mojang.blaze3d.vertex.VertexConsumer;
import com.mojang.math.Axis;
import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import net.createmod.ponder.api.level.PonderLevel;
import net.createmod.ponder.foundation.PonderScene;
import net.createmod.ponder.foundation.element.AnimatedSceneElementBase;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.GuiGraphics;
import net.minecraft.client.renderer.LightTexture;
import net.minecraft.client.renderer.MultiBufferSource;
import net.minecraft.client.renderer.RenderType;
import net.minecraft.client.renderer.texture.DynamicTexture;
import net.minecraft.client.renderer.texture.OverlayTexture;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.util.Mth;
import net.minecraft.world.phys.Vec3;
import org.joml.Matrix3f;
import org.joml.Matrix4f;

// Vrais modeles d'Immersive Vehicles dans les tutoriels : lus directement dans les jars, avec leurs textures, roues et helices.
public final class ModeleScene extends AnimatedSceneElementBase {
    // Vitres, boue et givre sont poses par le jeu sur d'autres passes de rendu, et les flotteurs sont une option.
    private static final Pattern ECARTES = Pattern.compile("(?i)wlndow|window|translucent|pontoon|interior");
    private static final int CACHEE = 0, HOLO_VERT = 1, HOLO_ROUGE = 2, VISIBLE = 3;
    private static final float RAYON_ROUE = 0.34F;
    private static final Map<String, float[]> MAILLAGES = new HashMap<>();
    private static final Map<String, ResourceLocation> TEXTURES = new HashMap<>();

    private final List<Piece> pieces = new ArrayList<>();
    private final Vec3 depart;
    private final float echelle;
    private final float capDepart;
    private Vec3 pos;
    private Vec3 posAvant;
    private float cap;
    private float capAvant;
    private float tangage;
    private float tangageAvant;
    private float roulis;
    private float roulisAvant;
    private float regime;
    private float rotation;
    private float rotationAvant;
    private float tourRoues;
    private float tourRouesAvant;

    public ModeleScene(Vec3 pos, float cap, float echelle) {
        this.depart = pos;
        this.capDepart = cap;
        this.echelle = echelle;
        reinitialiser();
    }

    private void reinitialiser() {
        pos = posAvant = depart;
        cap = capAvant = capDepart;
        tangage = tangageAvant = roulis = roulisAvant = regime = rotation = rotationAvant = tourRoues = tourRouesAvant = 0.0F;
        for (Piece piece : pieces) {
            piece.etat = piece.etatDepart;
            piece.ouverture = piece.ouvertureAvant = piece.ouvertureVisee = 0.0F;
        }
    }

    public void montrer() {
        reinitialiser();
        setVisible(true);
    }

    public ModeleScene piece(String jar, String chemin, String texture, float x, float y, float z, float ry) {
        pieces.add(new Piece(jar, chemin, texture, x, y, z, ry, 0.0F, 0, VISIBLE));
        return this;
    }

    // Le modele sans ses objets mobiles (capot, portieres), dessines a part quand ils doivent bouger.
    public ModeleScene pieceSans(String jar, String chemin, String texture, float x, float y, float z, String sansObjets) {
        Piece piece = new Piece(jar, chemin, texture, x, y, z, 0.0F, 0.0F, 0, VISIBLE);
        piece.sans = Pattern.compile(sansObjets);
        pieces.add(piece);
        return this;
    }

    // Un seul objet du modele, qui pivote autour d'un axe horizontal : capot ou coffre.
    public int ouvrant(String jar, String chemin, String texture, float x, float y, float z, String objet, float pivotY, float pivotZ) {
        Piece piece = new Piece(jar, chemin, texture, x, y, z, 0.0F, 0.0F, 0, VISIBLE);
        piece.seul = Pattern.compile(objet);
        piece.pivotY = pivotY;
        piece.pivotZ = pivotZ;
        pieces.add(piece);
        return pieces.size() - 1;
    }

    // Une roue visible d'emblee : elle tourne avec les deplacements du vehicule.
    public ModeleScene roue(String jar, String chemin, String texture, float x, float y, float z, float ry) {
        Piece piece = new Piece(jar, chemin, texture, x, y, z, ry, 0.0F, 0, VISIBLE);
        piece.roue = true;
        pieces.add(piece);
        return this;
    }

    // Une piece qui apparait quand on la monte : renvoie son numero pour l'allumer plus tard.
    public int pieceCachee(String jar, String chemin, String texture, float x, float y, float z, float ry) {
        pieces.add(new Piece(jar, chemin, texture, x, y, z, ry, 0.0F, 0, CACHEE));
        return pieces.size() - 1;
    }

    public int pieceCachee(String jar, String chemin, String texture, float x, float y, float z, float ry, float taille) {
        int numero = pieceCachee(jar, chemin, texture, x, y, z, ry);
        pieces.get(numero).taille = taille;
        return numero;
    }

    // Helice ou rotor : tourne autour de son axe (0 = Z, 1 = Y) selon le regime.
    public ModeleScene tournante(String jar, String chemin, String texture, float x, float y, float z, float penche, int axe) {
        pieces.add(new Piece(jar, chemin, texture, x, y, z, 0.0F, penche, axe == 0 ? 1 : 2, VISIBLE));
        return this;
    }

    public void allumer(int piece) {
        pieces.get(piece).etat = VISIBLE;
    }

    // L'hologramme qui montre en jeu ou une piece se pose : vert si elle convient, rouge si la taille n'est pas la bonne.
    public void hologramme(int piece, boolean bon) {
        pieces.get(piece).etat = bon ? HOLO_VERT : HOLO_ROUGE;
    }

    public void cacher(int piece) {
        pieces.get(piece).etat = CACHEE;
    }

    public void ouvrir(int piece, float degres) {
        pieces.get(piece).ouvertureVisee = degres;
    }

    public void placer(Vec3 nouvelle, float nouveauTangage, float nouveauRoulis) {
        tourRoues += (float) ((nouvelle.z - pos.z) / RAYON_ROUE) * Mth.RAD_TO_DEG;
        pos = nouvelle;
        tangage = nouveauTangage;
        roulis = nouveauRoulis;
    }

    public void cap(float nouveau) {
        cap = nouveau;
    }

    public void regime(float degresParTick) {
        regime = degresParTick;
    }

    public Vec3 position() {
        return pos;
    }

    public float tangage() {
        return tangage;
    }

    public float roulis() {
        return roulis;
    }

    @Override
    public void tick(PonderScene scene) {
        super.tick(scene);
        posAvant = pos;
        capAvant = cap;
        tangageAvant = tangage;
        roulisAvant = roulis;
        rotationAvant = rotation;
        rotation += regime;
        tourRouesAvant = tourRoues;
        for (Piece piece : pieces) {
            piece.ouvertureAvant = piece.ouverture;
            piece.ouverture += Mth.clamp(piece.ouvertureVisee - piece.ouverture, -5.0F, 5.0F);
        }
    }

    @Override
    protected void renderLast(PonderLevel monde, MultiBufferSource tampon, GuiGraphics graphiques, float fondu, float image) {
        PoseStack ms = graphiques.pose();
        Vec3 ici = posAvant.lerp(pos, image);
        ms.pushPose();
        ms.translate(ici.x, ici.y, ici.z);
        ms.mulPose(Axis.YP.rotationDegrees(Mth.rotLerp(image, capAvant, cap)));
        ms.mulPose(Axis.XN.rotationDegrees(Mth.lerp(image, tangageAvant, tangage)));
        ms.mulPose(Axis.ZP.rotationDegrees(Mth.lerp(image, roulisAvant, roulis)));
        ms.scale(echelle, echelle, echelle);
        float tour = Mth.lerp(image, rotationAvant, rotation);
        float tourRoue = Mth.lerp(image, tourRouesAvant, tourRoues);
        for (Piece piece : pieces) {
            if (piece.etat == CACHEE) continue;
            float[] sommets = maillage(piece);
            ResourceLocation texture = texture(piece.jar, piece.texture);
            if (sommets == null || texture == null) continue;
            ms.pushPose();
            ms.translate(piece.x, piece.y, piece.z);
            if (piece.ry != 0.0F) ms.mulPose(Axis.YP.rotationDegrees(piece.ry));
            if (piece.penche != 0.0F) ms.mulPose(Axis.XP.rotationDegrees(piece.penche));
            if (piece.axeTour > 0) ms.mulPose(Axis.ZP.rotationDegrees(tour));
            if (piece.roue) ms.mulPose(Axis.XP.rotationDegrees(piece.ry != 0.0F ? -tourRoue : tourRoue));
            float ouverture = Mth.lerp(image, piece.ouvertureAvant, piece.ouverture);
            if (ouverture != 0.0F) {
                ms.translate(0.0F, piece.pivotY, piece.pivotZ);
                ms.mulPose(Axis.XN.rotationDegrees(ouverture));
                ms.translate(0.0F, -piece.pivotY, -piece.pivotZ);
            }
            if (piece.taille != 1.0F) ms.scale(piece.taille, piece.taille, piece.taille);
            if (piece.etat == VISIBLE) dessiner(ms, tampon.getBuffer(RenderType.entityCutoutNoCull(texture)), sommets, 255, 255, 255, 255);
            else if (piece.etat == HOLO_VERT) dessiner(ms, tampon.getBuffer(RenderType.entityTranslucent(texture)), sommets, 70, 255, 90, 165);
            else dessiner(ms, tampon.getBuffer(RenderType.entityTranslucent(texture)), sommets, 255, 60, 60, 165);
            ms.popPose();
        }
        ms.popPose();
    }

    private static void dessiner(PoseStack ms, VertexConsumer sortie, float[] s, int r, int v, int b, int a) {
        PoseStack.Pose pose = ms.last();
        Matrix4f m = pose.pose();
        for (int i = 0; i < s.length; i += 8) {
            sortie.addVertex(m, s[i], s[i + 1], s[i + 2])
                .setColor(r, v, b, a)
                .setUv(s[i + 3], s[i + 4])
                .setOverlay(OverlayTexture.NO_OVERLAY)
                .setLight(LightTexture.FULL_BRIGHT)
                .setNormal(pose, s[i + 5], s[i + 6], s[i + 7]);
        }
    }

    private static float[] maillage(Piece piece) {
        return MAILLAGES.computeIfAbsent(piece.jar + "|" + piece.chemin + "|" + piece.seul + "|" + piece.sans, cle -> {
            try (ZipFile zip = ouvrir(piece.jar)) {
                if (zip == null) return null;
                ZipEntry entree = zip.getEntry(piece.chemin);
                if (entree == null) return null;
                try (InputStream flux = zip.getInputStream(entree)) {
                    return lireObj(flux, piece.seul, piece.sans);
                }
            } catch (IOException e) {
                return null;
            }
        });
    }

    private static ResourceLocation texture(String jar, String chemin) {
        return TEXTURES.computeIfAbsent(jar + "|" + chemin, cle -> {
            try (ZipFile zip = ouvrir(jar)) {
                if (zip == null) return null;
                ZipEntry entree = zip.getEntry(chemin);
                if (entree == null) return null;
                try (InputStream flux = zip.getInputStream(entree)) {
                    ResourceLocation id = ResourceLocation.fromNamespaceAndPath("atheria_monde", "guide_mts/" + chemin.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9_./-]", "_"));
                    Minecraft.getInstance().getTextureManager().register(id, new DynamicTexture(NativeImage.read(flux)));
                    return id;
                }
            } catch (IOException e) {
                return null;
            }
        });
    }

    private static ZipFile ouvrir(String debutNom) throws IOException {
        File[] jars = new File(Minecraft.getInstance().gameDirectory, "mods").listFiles((d, nom) -> nom.startsWith(debutNom) && nom.endsWith(".jar"));
        return jars == null || jars.length == 0 ? null : new ZipFile(jars[0]);
    }

    // Chaque face devient un quad de 4 sommets (x y z u v nx ny nz) ; les objets ecartes sont sautes.
    private static float[] lireObj(InputStream flux, Pattern seul, Pattern sans) throws IOException {
        List<float[]> v = new ArrayList<>(), vt = new ArrayList<>(), vn = new ArrayList<>();
        List<Float> sortie = new ArrayList<>();
        boolean saute = false;
        try (BufferedReader lecteur = new BufferedReader(new InputStreamReader(flux, StandardCharsets.UTF_8))) {
            String ligne;
            while ((ligne = lecteur.readLine()) != null) {
                if (ligne.startsWith("o ") || ligne.startsWith("g ")) {
                    String nom = ligne.substring(2).trim();
                    saute = ECARTES.matcher(nom).find() || (seul != null && !seul.matcher(nom).matches()) || (sans != null && sans.matcher(nom).matches());
                } else if (ligne.startsWith("v ")) {
                    v.add(flottants(ligne));
                } else if (ligne.startsWith("vt ")) {
                    vt.add(flottants(ligne));
                } else if (ligne.startsWith("vn ")) {
                    vn.add(flottants(ligne));
                } else if (ligne.startsWith("f ") && !saute) {
                    String[] coins = ligne.trim().split("\\s+");
                    for (int i = 2; i + 1 < coins.length; i += 2) {
                        String dernier = i + 2 < coins.length ? coins[i + 2] : coins[i + 1];
                        for (String coin : new String[]{coins[1], coins[i], coins[i + 1], dernier}) ajouter(sortie, coin, v, vt, vn);
                    }
                }
            }
        }
        float[] resultat = new float[sortie.size()];
        for (int i = 0; i < resultat.length; i++) resultat[i] = sortie.get(i);
        return resultat;
    }

    private static float[] flottants(String ligne) {
        String[] morceaux = ligne.trim().split("\\s+");
        float[] valeurs = new float[morceaux.length - 1];
        for (int i = 1; i < morceaux.length; i++) valeurs[i - 1] = Float.parseFloat(morceaux[i]);
        return valeurs;
    }

    private static void ajouter(List<Float> sortie, String coin, List<float[]> v, List<float[]> vt, List<float[]> vn) {
        String[] ids = coin.split("/");
        float[] p = v.get(Integer.parseInt(ids[0]) - 1);
        sortie.add(p[0]);
        sortie.add(p[1]);
        sortie.add(p[2]);
        float[] uv = ids.length > 1 && !ids[1].isEmpty() ? vt.get(Integer.parseInt(ids[1]) - 1) : new float[]{0.0F, 0.0F};
        sortie.add(uv[0]);
        sortie.add(1.0F - uv[1]);
        float[] n = ids.length > 2 && !ids[2].isEmpty() ? vn.get(Integer.parseInt(ids[2]) - 1) : new float[]{0.0F, 1.0F, 0.0F};
        sortie.add(n[0]);
        sortie.add(n[1]);
        sortie.add(n[2]);
    }

    private static final class Piece {
        final String jar;
        final String chemin;
        final String texture;
        final float x;
        final float y;
        final float z;
        final float ry;
        final float penche;
        final int axeTour;
        final int etatDepart;
        int etat;
        Pattern seul;
        Pattern sans;
        boolean roue;
        float taille = 1.0F;
        float pivotY;
        float pivotZ;
        float ouverture;
        float ouvertureAvant;
        float ouvertureVisee;

        Piece(String jar, String chemin, String texture, float x, float y, float z, float ry, float penche, int axeTour, int etat) {
            this.jar = jar;
            this.chemin = chemin;
            this.texture = texture;
            this.x = x;
            this.y = y;
            this.z = z;
            this.ry = ry;
            this.penche = penche;
            this.axeTour = axeTour;
            this.etatDepart = etat;
            this.etat = etat;
        }
    }
}
