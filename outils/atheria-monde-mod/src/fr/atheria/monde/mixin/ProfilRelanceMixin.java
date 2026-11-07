package fr.atheria.monde.mixin;

import com.mojang.authlib.minecraft.MinecraftSessionService;
import com.mojang.authlib.yggdrasil.ProfileResult;
import fr.atheria.monde.ProfilRelance;
import fr.atheria.monde.ThemeApparence;
import java.util.concurrent.CompletableFuture;
import net.minecraft.Util;
import net.minecraft.client.Minecraft;
import net.minecraft.client.User;
import org.spongepowered.asm.mixin.Final;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Mutable;
import org.spongepowered.asm.mixin.Shadow;
import org.spongepowered.asm.mixin.Unique;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

// Le profil Mojang n'est demande qu'une fois au lancement : un simple delai depasse laisse le skin par defaut toute la session.
@Mixin(Minecraft.class)
public abstract class ProfilRelanceMixin {
    @Shadow @Final @Mutable private CompletableFuture<ProfileResult> profileFuture;
    @Shadow public abstract MinecraftSessionService getMinecraftSessionService();
    @Shadow public abstract User getUser();

    @Unique private int atheria$attente;
    @Unique private int atheria$essais;
    @Unique private boolean atheria$relance;

    @Inject(method = "tick", at = @At("HEAD"))
    private void atheria$relancerProfil(CallbackInfo ci) {
        ThemeApparence.appliquer();
        if (ProfilRelance.simulerEchec) {
            ProfilRelance.simulerEchec = false;
            profileFuture = CompletableFuture.completedFuture(null);
            atheria$essais = 0;
        }
        if (!profileFuture.isDone()) return;
        ProfileResult resultat = profileFuture.getNow(null);
        if (resultat != null) {
            if (atheria$relance) ProfilRelance.LOG.info("Profil Mojang recupere apres {} relance(s)", atheria$essais);
            atheria$relance = false;
            return;
        }
        if (atheria$essais >= ProfilRelance.ESSAIS || ++atheria$attente < ProfilRelance.ATTENTE) return;
        atheria$attente = 0;
        atheria$essais++;
        atheria$relance = true;
        MinecraftSessionService service = getMinecraftSessionService();
        User joueur = getUser();
        profileFuture = CompletableFuture.supplyAsync(() -> service.fetchProfile(joueur.getProfileId(), true), Util.nonCriticalIoPool());
    }
}
