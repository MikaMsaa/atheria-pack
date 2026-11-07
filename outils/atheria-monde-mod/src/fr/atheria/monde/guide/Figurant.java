package fr.atheria.monde.guide;

import com.mojang.blaze3d.vertex.PoseStack;
import com.mojang.math.Axis;
import net.minecraft.client.Minecraft;
import net.minecraft.client.model.HumanoidModel;
import net.minecraft.client.player.RemotePlayer;
import net.minecraft.util.Mth;
import net.minecraft.world.entity.player.PlayerModelPart;

// Le joueur des tutoriels : il porte le skin du joueur et prend de vraies poses, FA Player reste en pause sur lui.
public final class Figurant extends RemotePlayer {
    public enum Geste { LIBRE, COURSE, GLISSE, RAMPE, MURET, ACCROCHE, HISSE, CHUTE, ROULADE, ASSIS, A_TERRE, VISEE, SOIN }

    private Geste geste = Geste.LIBRE;
    private int debut;
    private int duree = 10;

    public Figurant() {
        super(Minecraft.getInstance().level, Minecraft.getInstance().getGameProfile());
    }

    public void geste(Geste nouveau, int ticks) {
        geste = nouveau;
        debut = tickCount;
        duree = Math.max(1, ticks);
    }

    @Override
    public boolean isModelPartShown(PlayerModelPart partie) {
        return true;
    }

    // Ses pas sont donnes par la scene : le calcul du jeu ne voit aucun deplacement entre deux ticks et couperait les jambes.
    @Override
    public void calculateEntityAnimation(boolean vole) {
    }

    // Il porte l'identifiant du joueur : sans ca, un joueur en spectateur ne verrait que sa tete.
    @Override
    public boolean isSpectator() {
        return false;
    }

    private float avancement(float age) {
        return Mth.clamp((age - debut) / duree, 0.0F, 1.0F);
    }

    // Tout le corps : penche vers l'avant pour un angle positif, autour d'un point a la hauteur donnee.
    public void incliner(PoseStack pose, float image) {
        float p = avancement(tickCount + image);
        switch (geste) {
            case COURSE -> basculer(pose, 12.0F, 0.0F, 0.0F);
            case GLISSE -> basculer(pose, -58.0F, 0.0F, 0.12F);
            case RAMPE -> basculer(pose, 88.0F, 0.0F, 0.22F);
            case A_TERRE -> basculer(pose, 90.0F, 0.0F, 0.16F);
            case MURET -> {
                float c = Mth.sin(p * Mth.PI);
                basculer(pose, 22.0F * c, 0.9F, 0.0F);
                pose.mulPose(Axis.ZP.rotationDegrees(38.0F * c));
            }
            case HISSE -> basculer(pose, 38.0F * Mth.sin(p * Mth.PI), 1.2F, 0.0F);
            case CHUTE -> basculer(pose, -8.0F, 0.9F, 0.0F);
            case ROULADE -> basculer(pose, 360.0F * p, 0.55F, 0.0F);
            default -> {
            }
        }
    }

    private static void basculer(PoseStack pose, float degres, float pivot, float montee) {
        pose.translate(0.0F, pivot + montee, 0.0F);
        pose.mulPose(Axis.XN.rotationDegrees(degres));
        pose.translate(0.0F, -pivot, 0.0F);
    }

    public void poser(HumanoidModel<?> m, float age) {
        float p = avancement(age);
        float temps = age * 0.45F;
        switch (geste) {
            case COURSE -> {
                m.rightArm.zRot = 0.1F;
                m.leftArm.zRot = -0.1F;
            }
            case GLISSE -> {
                m.head.xRot = 0.75F;
                m.rightArm.xRot = 0.5F;
                m.rightArm.zRot = 0.55F;
                m.leftArm.xRot = -1.0F;
                m.leftArm.zRot = -0.25F;
                m.rightLeg.xRot = -1.1F;
                m.rightLeg.zRot = 0.1F;
                m.leftLeg.xRot = -0.25F;
                m.leftLeg.zRot = -0.1F;
            }
            case RAMPE, A_TERRE -> {
                float bouge = geste == Geste.RAMPE ? Mth.sin(temps) : 0.0F;
                m.head.xRot = -1.15F;
                m.rightArm.xRot = -2.5F + bouge * 0.5F;
                m.leftArm.xRot = -2.5F - bouge * 0.5F;
                m.rightArm.zRot = 0.25F;
                m.leftArm.zRot = -0.25F;
                m.rightLeg.xRot = bouge * 0.25F;
                m.leftLeg.xRot = -bouge * 0.25F;
                m.rightLeg.zRot = 0.1F;
                m.leftLeg.zRot = -0.1F;
                if (geste == Geste.A_TERRE) m.leftArm.xRot = -1.9F;
            }
            case MURET -> {
                float c = Mth.sin(p * Mth.PI);
                m.head.xRot = 0.35F * c;
                m.rightArm.xRot = -1.25F * c;
                m.rightArm.zRot = 0.1F;
                m.leftArm.xRot = -0.6F * c;
                m.leftArm.zRot = -1.1F * c;
                m.rightLeg.xRot = -1.3F * c;
                m.leftLeg.xRot = -1.0F * c;
                m.rightLeg.yRot = 0.35F * c;
                m.leftLeg.yRot = 0.35F * c;
            }
            case ACCROCHE -> {
                float prise = Mth.sin(temps * 0.5F) * 0.03F;
                m.head.xRot = -0.55F;
                m.rightArm.xRot = -2.85F + prise;
                m.leftArm.xRot = -2.85F - prise;
                m.rightArm.zRot = 0.08F;
                m.leftArm.zRot = -0.08F;
                m.rightLeg.xRot = 0.08F + prise;
                m.leftLeg.xRot = -0.12F - prise;
            }
            case HISSE -> {
                m.head.xRot = Mth.lerp(p, -0.55F, 0.45F);
                m.rightArm.xRot = Mth.lerp(p, -2.85F, -0.25F);
                m.leftArm.xRot = Mth.lerp(p, -2.85F, -0.25F);
                m.rightLeg.xRot = -1.35F * Mth.sin(p * Mth.PI);
                m.leftLeg.xRot = -0.4F * Mth.sin(p * Mth.PI);
            }
            case CHUTE -> {
                float flotte = Mth.sin(temps * 1.6F) * 0.14F;
                m.head.xRot = 0.4F;
                m.rightArm.xRot = -2.2F + flotte;
                m.leftArm.xRot = -2.2F - flotte;
                m.rightArm.zRot = 0.65F;
                m.leftArm.zRot = -0.65F;
                m.rightLeg.xRot = -0.35F - flotte;
                m.leftLeg.xRot = 0.2F + flotte;
            }
            case ROULADE -> {
                m.head.xRot = 0.7F;
                m.rightArm.xRot = -1.45F;
                m.leftArm.xRot = -1.45F;
                m.rightLeg.xRot = -1.55F;
                m.leftLeg.xRot = -1.55F;
            }
            case ASSIS -> {
                m.rightArm.xRot = -1.0F;
                m.leftArm.xRot = -1.0F;
                m.rightArm.yRot = -0.15F;
                m.leftArm.yRot = 0.15F;
                m.rightLeg.xRot = -1.41F;
                m.leftLeg.xRot = -1.41F;
                m.rightLeg.yRot = 0.14F;
                m.leftLeg.yRot = -0.14F;
            }
            case VISEE -> {
                m.head.xRot = 0.05F;
                m.rightArm.xRot = -1.55F;
                m.rightArm.yRot = -0.1F;
                m.leftArm.xRot = -1.45F;
                m.leftArm.yRot = 0.5F;
            }
            case SOIN -> {
                float geste2 = Mth.sin(temps) * 0.08F;
                m.head.xRot = 0.55F;
                m.rightArm.xRot = -1.0F + geste2;
                m.leftArm.xRot = -0.9F - geste2;
                m.rightArm.yRot = -0.3F;
                m.leftArm.yRot = 0.3F;
            }
            default -> {
            }
        }
    }
}
