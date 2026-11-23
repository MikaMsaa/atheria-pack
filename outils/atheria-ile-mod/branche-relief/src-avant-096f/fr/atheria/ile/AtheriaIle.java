package fr.atheria.ile;

import com.mojang.serialization.MapCodec;
import net.minecraft.commands.Commands;
import net.minecraft.core.registries.Registries;
import net.minecraft.network.chat.Component;
import net.minecraft.world.level.levelgen.DensityFunction;
import net.neoforged.bus.api.IEventBus;
import net.neoforged.fml.common.Mod;
import net.neoforged.neoforge.common.NeoForge;
import net.neoforged.neoforge.event.RegisterCommandsEvent;
import net.neoforged.neoforge.event.server.ServerStartedEvent;
import net.neoforged.neoforge.event.server.ServerStoppedEvent;
import net.neoforged.neoforge.event.server.ServerStoppingEvent;
import net.neoforged.neoforge.event.tick.ServerTickEvent;
import net.neoforged.neoforge.event.tick.PlayerTickEvent;
import net.neoforged.neoforge.event.entity.player.PlayerEvent;
import net.minecraft.server.level.ServerPlayer;
import net.neoforged.neoforge.registries.DeferredRegister;

@Mod(AtheriaIle.ID)
public final class AtheriaIle {
    public static final String ID = "atheria_ile";

    private static final DeferredRegister<MapCodec<? extends DensityFunction>> FONCTIONS =
            DeferredRegister.create(Registries.DENSITY_FUNCTION_TYPE, ID);

    private static final DeferredRegister<net.minecraft.world.level.levelgen.feature.Feature<?>> FEATURES =
            DeferredRegister.create(Registries.FEATURE, ID);

    static {
        FEATURES.register("route", () -> new RouteFeature(net.minecraft.world.level.levelgen.feature.configurations.NoneFeatureConfiguration.CODEC));
        FEATURES.register("details", () -> new DetailsFeature(net.minecraft.world.level.levelgen.feature.configurations.NoneFeatureConfiguration.CODEC));
        FONCTIONS.register("ile_continents", () -> IleContinents.MAP_CODEC);
        FONCTIONS.register("ile_champ", () -> IleChamp.MAP_CODEC);
        FONCTIONS.register("volumes", () -> DensiteVolumes.MAP_CODEC);
    }

    public AtheriaIle(IEventBus busDuMod, net.neoforged.fml.ModContainer conteneur, net.neoforged.api.distmarker.Dist dist) {
        FONCTIONS.register(busDuMod);
        // 0.7.4 : titres d'entree affiches par le client (paquet facultatif)
        busDuMod.addListener(ReseauIle::enregistrer);
        if (dist.isClient()) fr.atheria.ile.client.TitresClient.init(busDuMod, conteneur);
        FEATURES.register(busDuMod);
        NeoForge.EVENT_BUS.addListener(ServerStartedEvent.class, e -> {
            Jeu.avertirSiCarteManquante(e.getServer());
            Jeu.bordure(e.getServer());
            Tests.demarrage(e.getServer());
        });
        NeoForge.EVENT_BUS.addListener(PlayerTickEvent.Post.class, e -> {
            if (e.getEntity() instanceof ServerPlayer p) Titres.tick(p);
        });
        NeoForge.EVENT_BUS.addListener(PlayerEvent.PlayerLoggedInEvent.class, e -> {
            if (e.getEntity() instanceof ServerPlayer p) Jeu.avertirOperateur(p);
        });
        NeoForge.EVENT_BUS.addListener(PlayerEvent.PlayerLoggedOutEvent.class, e -> Titres.quitter(e.getEntity().getUUID()));
        NeoForge.EVENT_BUS.addListener(ServerTickEvent.Post.class, e -> Tests.tick(e.getServer()));
        // 0.5.6 : finition des routes sur les chunks neufs, une fois leurs voisins generes (budget par tick)
        NeoForge.EVENT_BUS.addListener(net.neoforged.neoforge.event.level.ChunkEvent.Load.class, e -> {
            if (e.isNewChunk() && e.getLevel() instanceof net.minecraft.world.level.Level l) Finition.nouveau(l, e.getChunk().getPos());
        });
        NeoForge.EVENT_BUS.addListener(ServerTickEvent.Pre.class, e -> Finition.traiter(e.getServer().overworld(), Finition.BUDGET_NS));
        NeoForge.EVENT_BUS.addListener(ServerStoppingEvent.class, e -> Tests.arreter());
        NeoForge.EVENT_BUS.addListener(ServerStoppedEvent.class, e -> {
            Tests.arreter();
            Titres.vider();
            CarteIle.desactiver();
        });
        NeoForge.EVENT_BUS.addListener(RegisterCommandsEvent.class, e -> e.getDispatcher().register(
                Commands.literal("ile")
                        .then(Commands.literal("titre").executes(ctx -> Titres.montrer(ctx.getSource().getPlayerOrException())))
                        .then(Commands.literal("reperes").executes(ctx -> Jeu.reperes(ctx.getSource().getPlayerOrException())))
                        .then(Commands.literal("sonde_relief").requires(s -> s.hasPermission(2))
                                .then(Commands.argument("x", com.mojang.brigadier.arguments.IntegerArgumentType.integer())
                                .then(Commands.argument("z", com.mojang.brigadier.arguments.IntegerArgumentType.integer()).executes(ctx -> {
                                    String t = ReliefBake.sonde(ctx.getSource().getServer(), com.mojang.brigadier.arguments.IntegerArgumentType.getInteger(ctx, "x"), com.mojang.brigadier.arguments.IntegerArgumentType.getInteger(ctx, "z"));
                                    ctx.getSource().sendSuccess(() -> Component.literal(t), false);
                                    return 1;
                                }))))
                        .then(Commands.literal("rendu").requires(s -> s.hasPermission(2)).executes(ctx -> {
                            boolean ok = Tests.lancerRendu(ctx.getSource().getServer(), false);
                            ctx.getSource().sendSuccess(() -> Component.literal(ok
                                    ? "Rendu de l'ile lance : config/atheria_ile/rendus/"
                                    : "Pas d'ile dans ce monde, ou rendu deja en cours"), false);
                            return ok ? 1 : 0;
                        }))));
    }
}
