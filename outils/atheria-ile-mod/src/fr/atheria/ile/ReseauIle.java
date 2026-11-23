package fr.atheria.ile;

import io.netty.buffer.ByteBuf;
import net.minecraft.network.codec.ByteBufCodecs;
import net.minecraft.network.codec.StreamCodec;
import net.minecraft.network.protocol.common.custom.CustomPacketPayload;
import net.minecraft.resources.ResourceLocation;
import net.neoforged.neoforge.network.event.RegisterPayloadHandlersEvent;
import net.neoforged.neoforge.network.registration.PayloadRegistrar;

/**
 * 0.7.4 : un seul paquet serveur -> client, "titre de lieu" (region, ville ou lieu nomme) affiche par le client
 * en surimpression discrete. Canal facultatif : un client sans le mod recoit l'ancien titre vanilla.
 */
public final class ReseauIle {
    private ReseauIle() {}

    public static final int REGION = 0, VILLE = 1, LIEU = 2;

    /** styles : 0 = celui de la config client, sinon STYLE_CENTRE_TRAITS, STYLE_BAS_GAUCHE, STYLE_CENTRE_SOULIGNE */
    public static final int STYLE_DEFAUT = 0, STYLE_CENTRE_TRAITS = 1, STYLE_BAS_GAUCHE = 2, STYLE_CENTRE_SOULIGNE = 3;
    /** couleur -1 = couleur par defaut du client */
    public static final int COULEUR_DEFAUT = -1;

    /**
     * Titre d'un endroit, avec son identite propre (titre, sous-titre, style, couleurs, ornement).
     * Chaque champ absent de la config garde la valeur par defaut (style 0, couleurs -1, ornement "").
     */
    public record TitreLieu(String titre, String sousTitre, int genre, int style, int couleurTitre, int couleurTraits, String ornement) implements CustomPacketPayload {
        public static final Type<TitreLieu> TYPE = new Type<>(ResourceLocation.fromNamespaceAndPath(AtheriaIle.ID, "titre_lieu"));
        public static final StreamCodec<ByteBuf, TitreLieu> CODEC = StreamCodec.of(
                (b, t) -> {
                    ByteBufCodecs.STRING_UTF8.encode(b, t.titre());
                    ByteBufCodecs.STRING_UTF8.encode(b, t.sousTitre());
                    ByteBufCodecs.VAR_INT.encode(b, t.genre());
                    ByteBufCodecs.VAR_INT.encode(b, t.style());
                    ByteBufCodecs.INT.encode(b, t.couleurTitre());
                    ByteBufCodecs.INT.encode(b, t.couleurTraits());
                    ByteBufCodecs.STRING_UTF8.encode(b, t.ornement());
                },
                b -> new TitreLieu(ByteBufCodecs.STRING_UTF8.decode(b), ByteBufCodecs.STRING_UTF8.decode(b), ByteBufCodecs.VAR_INT.decode(b),
                        ByteBufCodecs.VAR_INT.decode(b), ByteBufCodecs.INT.decode(b), ByteBufCodecs.INT.decode(b), ByteBufCodecs.STRING_UTF8.decode(b)));

        @Override
        public Type<? extends CustomPacketPayload> type() { return TYPE; }
    }

    /** le client s'inscrit ici : le serveur dedie ne charge aucune classe d'affichage */
    public interface Client { void titre(TitreLieu t); }

    public static volatile Client CLIENT;

    static void enregistrer(RegisterPayloadHandlersEvent e) {
        PayloadRegistrar r = e.registrar("2").optional();
        r.playToClient(TitreLieu.TYPE, TitreLieu.CODEC, (p, ctx) -> {
            Client c = CLIENT;
            if (c != null) c.titre(p);
        });
    }
}
