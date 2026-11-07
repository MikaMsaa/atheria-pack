package fr.atheria.monde.mixin;

import fr.atheria.monde.guide.GuideEcran;
import net.createmod.catnip.gui.NavigatableSimiScreen;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.screens.Screen;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.ModifyVariable;

// Fermer un tutoriel lance depuis le guide ramene au guide, pas en jeu.
@Mixin(Minecraft.class)
public abstract class RetourGuideMixin {
    @Shadow public Screen screen;

    @ModifyVariable(method = "setScreen", at = @At("HEAD"), argsOnly = true)
    private Screen atheria$retour(Screen suivant) {
        if (suivant == null && this.screen instanceof NavigatableSimiScreen) return GuideEcran.reprendre();
        return suivant;
    }
}
