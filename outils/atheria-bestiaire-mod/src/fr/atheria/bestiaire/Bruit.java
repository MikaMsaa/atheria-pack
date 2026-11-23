package fr.atheria.bestiaire;

import io.netty.buffer.ByteBuf;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.IntConsumer;
import net.minecraft.network.codec.ByteBufCodecs;
import net.minecraft.network.codec.StreamCodec;
import net.minecraft.network.protocol.common.custom.CustomPacketPayload;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.server.level.ServerPlayer;
import net.minecraft.world.entity.Entity;
import net.neoforged.bus.api.IEventBus;
import net.neoforged.neoforge.common.NeoForge;
import net.neoforged.neoforge.event.entity.player.PlayerEvent;
import net.neoforged.neoforge.event.server.ServerStoppedEvent;
import net.neoforged.neoforge.network.PacketDistributor;
import net.neoforged.neoforge.network.event.RegisterPayloadHandlersEvent;

// Jauge de bruit : chaque bruit fait par un joueur (meme portee que l'ouie des Chimiks, voir Chimiks.java) lui est envoye,
// pour que la jauge discrete de son ecran (client/JaugeBruit.java) montre jusqu'ou on l'entend.
// Economie : au plus un paquet tous les 5 ticks par joueur, sauf si le nouveau bruit porte plus loin que le precedent.
public final class Bruit {
    private static final int INTERVALLE = 5;
    private static final Map<UUID, long[]> ENVOIS = new HashMap<>(); // {tick du dernier envoi, portee envoyee}
    // cote client : recoit la portee (en blocs). Reste nul sur un serveur dedie.
    public static volatile IntConsumer CLIENT;

    private Bruit() {
    }

    public record Paquet(int portee) implements CustomPacketPayload {
        public static final Type<Paquet> TYPE = new Type<>(ResourceLocation.fromNamespaceAndPath(AtheriaBestiaire.MODID, "bruit"));
        public static final StreamCodec<ByteBuf, Paquet> CODEC = StreamCodec.composite(ByteBufCodecs.VAR_INT, Paquet::portee, Paquet::new);

        @Override
        public Type<? extends CustomPacketPayload> type() {
            return TYPE;
        }
    }

    static void brancher(IEventBus modBus) {
        modBus.addListener(Bruit::enregistrer);
        NeoForge.EVENT_BUS.addListener((PlayerEvent.PlayerLoggedOutEvent e) -> ENVOIS.remove(e.getEntity().getUUID()));
        NeoForge.EVENT_BUS.addListener((ServerStoppedEvent e) -> ENVOIS.clear());
    }

    private static void enregistrer(RegisterPayloadHandlersEvent e) {
        // facultatif : un client sans le mod peut quand meme se connecter, il n'a simplement pas de jauge
        e.registrar("1").optional().playToClient(Paquet.TYPE, Paquet.CODEC, (p, ctx) -> {
            IntConsumer c = CLIENT;
            if (c != null) c.accept(p.portee());
        });
    }

    static void signaler(Entity cause, int portee) {
        if (!(cause instanceof ServerPlayer p) || portee <= 0 || p.isSpectator() || p.isCreative() || p.hasDisconnected()) return;
        long t = p.serverLevel().getGameTime();
        long[] d = ENVOIS.computeIfAbsent(p.getUUID(), k -> new long[]{Long.MIN_VALUE / 2, 0});
        if (t - d[0] < INTERVALLE && portee <= d[1]) return;
        d[0] = t;
        d[1] = portee;
        if (p.connection != null && p.connection.hasChannel(Paquet.TYPE)) PacketDistributor.sendToPlayer(p, new Paquet(portee));
    }
}
