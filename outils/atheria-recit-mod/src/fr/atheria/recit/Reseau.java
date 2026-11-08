package fr.atheria.recit;

import io.netty.buffer.ByteBuf;
import java.util.UUID;
import net.minecraft.core.UUIDUtil;
import net.minecraft.network.codec.ByteBufCodecs;
import net.minecraft.network.codec.StreamCodec;
import net.minecraft.network.protocol.common.custom.CustomPacketPayload;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.server.level.ServerPlayer;
import net.neoforged.neoforge.network.event.RegisterPayloadHandlersEvent;
import net.neoforged.neoforge.network.registration.PayloadRegistrar;

public final class Reseau {
    public static final String VERSION = "1";
    private static final StreamCodec<ByteBuf, String> LONG_TEXTE = ByteBufCodecs.stringUtf8(1 << 20);

    private Reseau() {
    }

    static ResourceLocation rl(String chemin) {
        return ResourceLocation.fromNamespaceAndPath(AtheriaRecit.MODID, chemin);
    }

    // Serveur -> client : jouer une cinematique (le scenario voyage avec le paquet, le client n'a besoin d'aucun fichier)
    public record JouerCinematique(String nom, String scenario, boolean passable) implements CustomPacketPayload {
        public static final Type<JouerCinematique> TYPE = new Type<>(rl("jouer_cinematique"));
        public static final StreamCodec<ByteBuf, JouerCinematique> CODEC = StreamCodec.composite(
                ByteBufCodecs.STRING_UTF8, JouerCinematique::nom,
                LONG_TEXTE, JouerCinematique::scenario,
                ByteBufCodecs.BOOL, JouerCinematique::passable,
                JouerCinematique::new);

        @Override
        public Type<? extends CustomPacketPayload> type() {
            return TYPE;
        }
    }

    // Client -> serveur : la cinematique est finie (passee = le joueur l'a sautee)
    public record FinCinematique(String nom, boolean passee) implements CustomPacketPayload {
        public static final Type<FinCinematique> TYPE = new Type<>(rl("fin_cinematique"));
        public static final StreamCodec<ByteBuf, FinCinematique> CODEC = StreamCodec.composite(
                ByteBufCodecs.STRING_UTF8, FinCinematique::nom,
                ByteBufCodecs.BOOL, FinCinematique::passee,
                FinCinematique::new);

        @Override
        public Type<? extends CustomPacketPayload> type() {
            return TYPE;
        }
    }

    // Serveur -> client : une etape de dialogue a afficher ; texte vide = fermer la boite
    public record EtapeDialogue(String vue) implements CustomPacketPayload {
        public static final Type<EtapeDialogue> TYPE = new Type<>(rl("etape_dialogue"));
        public static final StreamCodec<ByteBuf, EtapeDialogue> CODEC = StreamCodec.composite(
                LONG_TEXTE, EtapeDialogue::vue, EtapeDialogue::new);

        @Override
        public Type<? extends CustomPacketPayload> type() {
            return TYPE;
        }
    }

    // Client -> serveur : choix fait (0..n), -1 = continuer, -2 = fermer
    public record ReponseDialogue(int choix) implements CustomPacketPayload {
        public static final Type<ReponseDialogue> TYPE = new Type<>(rl("reponse_dialogue"));
        public static final StreamCodec<ByteBuf, ReponseDialogue> CODEC = StreamCodec.composite(
                ByteBufCodecs.VAR_INT, ReponseDialogue::choix, ReponseDialogue::new);

        @Override
        public Type<? extends CustomPacketPayload> type() {
            return TYPE;
        }
    }

    // Serveur -> clients : ce joueur est cache (cinematique ou dialogue en cours) ou de nouveau visible
    public record JoueurCache(UUID joueur, boolean cache) implements CustomPacketPayload {
        public static final Type<JoueurCache> TYPE = new Type<>(rl("joueur_cache"));
        public static final StreamCodec<ByteBuf, JoueurCache> CODEC = StreamCodec.composite(
                UUIDUtil.STREAM_CODEC, JoueurCache::joueur,
                ByteBufCodecs.BOOL, JoueurCache::cache,
                JoueurCache::new);

        @Override
        public Type<? extends CustomPacketPayload> type() {
            return TYPE;
        }
    }

    // Le client s'inscrit ici : le serveur dedie ne charge ainsi aucune classe d'affichage
    public interface Client {
        void cinematique(JouerCinematique p);

        void dialogue(String vue);

        void cache(UUID joueur, boolean cache);
    }

    public static volatile Client CLIENT;

    static void enregistrer(RegisterPayloadHandlersEvent e) {
        PayloadRegistrar r = e.registrar(VERSION);
        r.playToClient(JouerCinematique.TYPE, JouerCinematique.CODEC, (p, ctx) -> {
            if (CLIENT != null) CLIENT.cinematique(p);
        });
        r.playToClient(EtapeDialogue.TYPE, EtapeDialogue.CODEC, (p, ctx) -> {
            if (CLIENT != null) CLIENT.dialogue(p.vue());
        });
        r.playToClient(JoueurCache.TYPE, JoueurCache.CODEC, (p, ctx) -> {
            if (CLIENT != null) CLIENT.cache(p.joueur(), p.cache());
        });
        r.playToServer(FinCinematique.TYPE, FinCinematique.CODEC, (p, ctx) -> {
            if (ctx.player() instanceof ServerPlayer sp) Protection.finCinematique(sp, p.nom(), p.passee());
        });
        r.playToServer(ReponseDialogue.TYPE, ReponseDialogue.CODEC, (p, ctx) -> {
            if (ctx.player() instanceof ServerPlayer sp) Dialogues.reponse(sp, p.choix());
        });
    }
}
