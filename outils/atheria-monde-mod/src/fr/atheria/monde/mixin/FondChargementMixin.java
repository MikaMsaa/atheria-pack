package fr.atheria.monde.mixin;

import net.minecraft.client.gui.GuiGraphics;
import net.minecraft.client.gui.screens.GenericMessageScreen;
import net.minecraft.client.gui.screens.LevelLoadingScreen;
import net.minecraft.client.gui.screens.ProgressScreen;
import net.minecraft.client.gui.screens.ReceivingLevelScreen;
import net.minecraft.client.gui.screens.Screen;
import net.minecraft.resources.ResourceLocation;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

// Hors partie, les ecrans sans fond propre (creation du monde, chargement, sauvegarde) affichent le panorama vanilla : on met le fond du menu.
// Sur les ecrans de chargement, ni flou ni voile sombre : l'image reste nette.
@Mixin(Screen.class)
public abstract class FondChargementMixin {
    private static final ResourceLocation ATHERIA_FOND = ResourceLocation.parse("atheria:textures/gui/fond_menu.png");

    @Shadow public int width;
    @Shadow public int height;

    private boolean atheria$ecranChargement() {
        Object ecran = this;
        return ecran instanceof GenericMessageScreen || ecran instanceof LevelLoadingScreen || ecran instanceof ProgressScreen || ecran instanceof ReceivingLevelScreen;
    }

    @Inject(method = "renderPanorama", at = @At("HEAD"), cancellable = true)
    private void atheria$fond(GuiGraphics graphics, float partialTick, CallbackInfo ci) {
        graphics.blit(ATHERIA_FOND, 0, 0, 0, 0.0F, 0.0F, this.width, this.height, this.width, this.height);
        ci.cancel();
    }

    @Inject(method = "renderBlurredBackground", at = @At("HEAD"), cancellable = true)
    private void atheria$sansFlou(float partialTick, CallbackInfo ci) {
        if (atheria$ecranChargement()) ci.cancel();
    }

    @Inject(method = "renderMenuBackground(Lnet/minecraft/client/gui/GuiGraphics;)V", at = @At("HEAD"), cancellable = true)
    private void atheria$sansVoile(GuiGraphics graphics, CallbackInfo ci) {
        if (atheria$ecranChargement()) ci.cancel();
    }
}