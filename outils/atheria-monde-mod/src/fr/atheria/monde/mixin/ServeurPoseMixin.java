package fr.atheria.monde.mixin;

import fr.atheria.monde.PoseLieux;
import net.minecraft.server.MinecraftServer;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

import java.util.function.BooleanSupplier;

// 15/11 : la pose des lieux ecoute des le premier tick du serveur (avant, seulement apres la decoration d'un chunk neuf :
// un monde deja genere relance ne posait rien).
@Mixin(MinecraftServer.class)
public abstract class ServeurPoseMixin {
    @Inject(method = "tickServer", at = @At("HEAD"))
    private void atheria$ecouterPose(BooleanSupplier temps, CallbackInfo retour) {
        PoseLieux.ecouter();
    }
}
