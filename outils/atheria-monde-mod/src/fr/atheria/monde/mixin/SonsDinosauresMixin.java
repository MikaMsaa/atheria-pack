package fr.atheria.monde.mixin;

import com.mojang.blaze3d.audio.SoundBuffer;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import javax.sound.sampled.AudioFormat;
import net.minecraft.client.sounds.SoundBufferLibrary;
import net.minecraft.resources.ResourceLocation;
import org.lwjgl.BufferUtils;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Unique;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Redirect;

// Un son stereo n'est jamais spatialise par OpenAL : les rugissements de Jurassic Reborn s'entendaient au meme volume a toute distance.
// Passage en mono au chargement, avec un gain plus bas pour les cris et les pas des dinosaures.
@Mixin(SoundBufferLibrary.class)
public abstract class SonsDinosauresMixin {
    @Unique private static final float ATHERIA_GAIN_DINOSAURES = 0.55F;

    @Redirect(method = "lambda$getCompleteBuffer$0", at = @At(value = "NEW", target = "(Ljava/nio/ByteBuffer;Ljavax/sound/sampled/AudioFormat;)Lcom/mojang/blaze3d/audio/SoundBuffer;"))
    private SoundBuffer atheria$sonMono(ByteBuffer donnees, AudioFormat format, ResourceLocation son) {
        if (!"jurassicreborn".equals(son.getNamespace()) || format.getSampleSizeInBits() != 16) return new SoundBuffer(donnees, format);
        String chemin = son.getPath();
        float gain = chemin.contains("/dinosaurs/") || chemin.contains("/stomp_") ? ATHERIA_GAIN_DINOSAURES : 1.0F;
        int canaux = format.getChannels();
        if (canaux == 1 && gain == 1.0F) return new SoundBuffer(donnees, format);
        ByteBuffer source = donnees.duplicate().order(format.isBigEndian() ? ByteOrder.BIG_ENDIAN : ByteOrder.LITTLE_ENDIAN);
        ByteBuffer mono = BufferUtils.createByteBuffer(source.remaining() / canaux).order(ByteOrder.nativeOrder());
        while (source.remaining() >= canaux * 2) {
            int somme = 0;
            for (int i = 0; i < canaux; i++) somme += source.getShort();
            mono.putShort((short) (somme / canaux * gain));
        }
        mono.flip();
        AudioFormat formatMono = new AudioFormat(format.getSampleRate(), 16, 1, true, ByteOrder.nativeOrder() == ByteOrder.BIG_ENDIAN);
        if (canaux > 1 && chemin.contains("_roar")) fr.atheria.monde.ProfilRelance.LOG.info("Son dinosaure en mono : {}", son);
        return new SoundBuffer(mono, formatMono);
    }
}
