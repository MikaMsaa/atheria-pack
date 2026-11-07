package fr.atheria.monde.mixin;

import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.Gui;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Redirect;

// TAB montre la liste des joueurs connectes meme en solo, ou le jeu de base la cache.
@Mixin(Gui.class)
public abstract class ListeJoueursMixin {
    @Redirect(method = "renderTabList", at = @At(value = "INVOKE", target = "Lnet/minecraft/client/Minecraft;isLocalServer()Z"))
    private boolean atheria$listeEnSolo(Minecraft minecraft) {
        return false;
    }
}
