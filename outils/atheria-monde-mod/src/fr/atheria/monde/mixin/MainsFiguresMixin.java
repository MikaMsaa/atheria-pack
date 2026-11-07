package fr.atheria.monde.mixin;

import com.mojang.blaze3d.vertex.PoseStack;
import fr.atheria.monde.FiguresPov;
import net.minecraft.client.player.LocalPlayer;
import net.minecraft.client.renderer.ItemInHandRenderer;
import net.minecraft.client.renderer.MultiBufferSource;
import net.minecraft.util.Mth;
import net.minecraft.world.entity.HumanoidArm;
import org.joml.Quaternionf;
import org.joml.Vector3f;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.spongepowered.asm.mixin.Unique;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

// Pendant une figure, les deux bras prennent la place de la main vanilla : chaque pose donne l'epaule et la main dans l'espace de la camera.
@Mixin(value = ItemInHandRenderer.class, remap = false)
public abstract class MainsFiguresMixin {
    @Unique private static final float ATHERIA$LONGUEUR = 0.75F;

    @Shadow protected abstract void renderPlayerArm(PoseStack pose, MultiBufferSource tampon, int lumiere, float equipement, float balancement, HumanoidArm bras);

    @Inject(method = "renderHandsWithItems", at = @At("HEAD"), cancellable = true)
    private void atheria$brasDeFigure(float image, PoseStack pose, MultiBufferSource.BufferSource tampon, LocalPlayer joueur, int lumiere, CallbackInfo info) {
        float poids = FiguresPov.avancer(joueur);
        if (poids <= 0.0F) return;
        float entree = poids * poids * (3.0F - 2.0F * poids);
        atheria$bras(pose, tampon, lumiere, HumanoidArm.RIGHT, entree);
        atheria$bras(pose, tampon, lumiere, HumanoidArm.LEFT, entree);
        tampon.endBatch();
        info.cancel();
    }

    @Unique
    private void atheria$bras(PoseStack pose, MultiBufferSource tampon, int lumiere, HumanoidArm bras, float entree) {
        float cote = bras == HumanoidArm.RIGHT ? 1.0F : -1.0F;
        float t = FiguresPov.temps();
        Vector3f epaule;
        Vector3f main;
        switch (FiguresPov.figure()) {
            case BARRE -> {
                float prise = Mth.sin(t * 2.0F + cote) * 0.012F;
                epaule = new Vector3f(0.5F, -0.6F, -0.7F);
                main = new Vector3f(0.28F, 0.42F + prise, -1.2F);
            }
            case HISSE -> {
                float p = Mth.clamp(t / 0.5F, 0.0F, 1.0F);
                epaule = new Vector3f(0.55F, Mth.lerp(p, -0.62F, -0.85F), -0.75F);
                main = new Vector3f(Mth.lerp(p, 0.4F, 0.42F), Mth.lerp(p, 0.3F, -0.22F), Mth.lerp(p, -1.2F, -1.1F));
            }
            case MURET -> {
                float appui = Mth.sin(Mth.clamp(t / 0.45F, 0.0F, 1.0F) * Mth.PI) * 0.12F;
                float retrait = cote > 0.0F ? 0.0F : 0.22F;
                epaule = new Vector3f(0.5F, -0.7F - appui - retrait, -0.8F);
                main = new Vector3f(0.3F, -0.38F - appui - retrait, -1.3F);
            }
            case POTEAU -> {
                float montee = Mth.sin(t * 7.0F) * cote * 0.15F;
                epaule = new Vector3f(0.42F, -0.7F + montee, -0.75F);
                main = new Vector3f(0.16F, 0.05F + montee, -1.25F);
            }
            default -> {
                float prise = Mth.sin(t * 2.2F + cote) * 0.012F;
                epaule = new Vector3f(0.55F, -0.62F, -0.75F);
                main = new Vector3f(0.4F, 0.3F + prise, -1.2F);
            }
        }
        float sortie = (1.0F - entree) * 1.1F;
        epaule.mul(cote, 1.0F, 1.0F).sub(0.0F, sortie, 0.0F);
        main.mul(cote, 1.0F, 1.0F).sub(0.0F, sortie, 0.0F);
        Vector3f direction = main.sub(epaule);
        float allonge = direction.length() / ATHERIA$LONGUEUR;
        direction.normalize();
        // L'ecran est trop haut pour un bras de taille reelle tendu vers le haut : on l'etire le long de son axe, l'epaule reste hors champ.
        Quaternionf axe = new Quaternionf().rotationTo(new Vector3f(0.0F, 1.0F, 0.0F), direction);
        pose.pushPose();
        pose.translate(epaule.x, epaule.y, epaule.z);
        pose.mulPose(axe);
        pose.scale(1.0F, allonge, 1.0F);
        pose.mulPose(new Quaternionf(axe).conjugate());
        // Epaule et axe du bras vanilla au repos, calcules depuis les transformations de renderPlayerArm
        pose.mulPose(new Quaternionf().rotationTo(new Vector3f(cote * 0.25F, 0.352F, -0.613F).normalize(), direction));
        pose.translate(-cote * 0.485F, 0.832F, 0.526F);
        renderPlayerArm(pose, tampon, lumiere, 0.0F, 0.0F, bras);
        pose.popPose();
    }
}
