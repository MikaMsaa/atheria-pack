package fr.atheria.recit.mixin;

import fr.atheria.recit.client.ClientRecit;
import net.minecraft.client.Camera;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.level.BlockGetter;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.ModifyVariable;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

// Pendant une cinematique, la camera quitte le joueur et suit le trajet calcule par ClientRecit.
// Camera detachee : pas de main a l'ecran, le corps du joueur est masque a part (RenderPlayerEvent).
@Mixin(Camera.class)
public abstract class CameraMixin {
    @Shadow
    protected abstract void setPosition(double x, double y, double z);

    @Shadow
    protected abstract void setRotation(float yRot, float xRot);

    @ModifyVariable(method = "setup", at = @At("HEAD"), argsOnly = true, ordinal = 0)
    private boolean atheriaRecit$detacher(boolean detache) {
        return detache || ClientRecit.cameraActive();
    }

    @Inject(method = "setup", at = @At("TAIL"))
    private void atheriaRecit$placer(BlockGetter level, Entity entite, boolean detache, boolean miroir, float partiel, CallbackInfo ci) {
        double[] c = ClientRecit.camera();
        if (c == null) return;
        setRotation((float) c[3], (float) c[4]);
        setPosition(c[0], c[1], c[2]);
    }
}
