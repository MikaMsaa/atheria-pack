package fr.atheria.monde.mixin;

import ichttt.mods.firstaid.api.damagesystem.AbstractPlayerDamageModel;
import ichttt.mods.firstaid.client.util.PlayerModelRenderer;
import net.minecraft.client.gui.GuiGraphics;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

// Reduit la figure de sante de First Aid en gardant son ancrage sur le bord droit de l'ecran.
@Mixin(value = PlayerModelRenderer.class, remap = false)
public abstract class FigureSanteMixin {
    private static final float ATHERIA_ECHELLE = 0.6f;

    @Inject(method = "renderPlayerHealth", at = @At("HEAD"))
    private static void atheria$reduire(int x, int y, AbstractPlayerDamageModel modele, boolean quatreCouleurs, GuiGraphics gui, boolean clignote, float alpha, float partiel, CallbackInfo info) {
        gui.pose().pushPose();
        gui.pose().translate(gui.guiWidth() * (1 - ATHERIA_ECHELLE), y * (1 - ATHERIA_ECHELLE), 0);
        gui.pose().scale(ATHERIA_ECHELLE, ATHERIA_ECHELLE, 1);
    }

    @Inject(method = "renderPlayerHealth", at = @At("RETURN"))
    private static void atheria$retablir(int x, int y, AbstractPlayerDamageModel modele, boolean quatreCouleurs, GuiGraphics gui, boolean clignote, float alpha, float partiel, CallbackInfo info) {
        gui.pose().popPose();
    }
}
