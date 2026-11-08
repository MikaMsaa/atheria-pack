package fr.atheria.recit;

import com.mojang.brigadier.CommandDispatcher;
import com.mojang.brigadier.arguments.StringArgumentType;
import com.mojang.brigadier.context.CommandContext;
import com.mojang.brigadier.exceptions.CommandSyntaxException;
import com.mojang.brigadier.suggestion.SuggestionProvider;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.Collection;
import java.util.List;
import java.util.Locale;
import net.minecraft.ChatFormatting;
import net.minecraft.commands.CommandSourceStack;
import net.minecraft.commands.Commands;
import net.minecraft.commands.SharedSuggestionProvider;
import net.minecraft.commands.arguments.EntityArgument;
import net.minecraft.core.BlockPos;
import net.minecraft.network.chat.ClickEvent;
import net.minecraft.network.chat.Component;
import net.minecraft.network.chat.HoverEvent;
import net.minecraft.network.chat.Style;
import net.minecraft.server.level.ServerPlayer;
import net.minecraft.world.entity.Entity;
import net.neoforged.fml.loading.FMLPaths;
import net.neoforged.neoforge.event.RegisterCommandsEvent;

// /recit intro                                    revoir l'intro (tout joueur)
// /recit cinematique <nom> [joueurs]              jouer une cinematique (op)
// /recit dialogue <nom> [joueurs] [pnj]           ouvrir un dialogue (op ; utile depuis Easy NPC ou une quete)
// /recit reinitialiser <joueurs>                  oublier les cinematiques vues (l'intro repartira a la connexion)
// /recit point                                    note la position de la camera pour ecrire un trajet
public final class Commandes {
    private static final SuggestionProvider<CommandSourceStack> CINES =
            (ctx, b) -> SharedSuggestionProvider.suggest(Donnees.CINEMATIQUES.keySet(), b);
    private static final SuggestionProvider<CommandSourceStack> DIALS =
            (ctx, b) -> SharedSuggestionProvider.suggest(Donnees.DIALOGUES.keySet(), b);

    private Commandes() {
    }

    static void enregistrer(RegisterCommandsEvent e) {
        CommandDispatcher<CommandSourceStack> d = e.getDispatcher();
        d.register(Commands.literal("recit")
                .then(Commands.literal("intro").executes(Commandes::revoirIntro))
                .then(Commands.literal("cinematique").requires(s -> s.hasPermission(2))
                        .then(Commands.argument("nom", StringArgumentType.string()).suggests(CINES)
                                .executes(c -> cine(c, nom(c), List.of(c.getSource().getPlayerOrException())))
                                .then(Commands.argument("joueurs", EntityArgument.players())
                                        .executes(c -> cine(c, nom(c), EntityArgument.getPlayers(c, "joueurs"))))))
                .then(Commands.literal("dialogue").requires(s -> s.hasPermission(2))
                        .then(Commands.argument("nom", StringArgumentType.string()).suggests(DIALS)
                                .executes(c -> dialogue(c, List.of(c.getSource().getPlayerOrException()), null))
                                .then(Commands.argument("joueurs", EntityArgument.players())
                                        .executes(c -> dialogue(c, EntityArgument.getPlayers(c, "joueurs"), null))
                                        .then(Commands.argument("pnj", EntityArgument.entity())
                                                .executes(c -> dialogue(c, EntityArgument.getPlayers(c, "joueurs"), EntityArgument.getEntity(c, "pnj")))))))
                .then(Commands.literal("reinitialiser").requires(s -> s.hasPermission(2))
                        .then(Commands.argument("joueurs", EntityArgument.players()).executes(c -> {
                            Collection<ServerPlayer> js = EntityArgument.getPlayers(c, "joueurs");
                            js.forEach(Protection::oublier);
                            c.getSource().sendSuccess(() -> Component.literal(js.size() + " joueur(s) remis a zero : l'intro repartira a la prochaine connexion."), true);
                            return js.size();
                        })))
                .then(Commands.literal("point").requires(s -> s.hasPermission(2)).executes(Commandes::point)));
    }

    // tout joueur peut revoir l'intro, mais pas pour fuir un danger : la cinematique rend invulnerable
    private static int revoirIntro(CommandContext<CommandSourceStack> c) throws com.mojang.brigadier.exceptions.CommandSyntaxException {
        ServerPlayer p = c.getSource().getPlayerOrException();
        String refus = Protection.refusIntro(p);
        if (refus != null) {
            c.getSource().sendFailure(Component.literal(refus));
            return 0;
        }
        return cine(c, "intro", List.of(p));
    }

    private static String nom(CommandContext<CommandSourceStack> c) {
        return StringArgumentType.getString(c, "nom");
    }

    private static int cine(CommandContext<CommandSourceStack> c, String nom, Collection<ServerPlayer> js) {
        if (!Donnees.CINEMATIQUES.containsKey(nom)) {
            c.getSource().sendFailure(Component.literal("Cinematique inconnue : " + nom));
            return 0;
        }
        js.forEach(p -> Protection.lancerCinematique(p, nom));
        return js.size();
    }

    private static int dialogue(CommandContext<CommandSourceStack> c, Collection<ServerPlayer> js, Entity pnj) {
        String nom = nom(c);
        if (!Donnees.DIALOGUES.containsKey(nom)) {
            c.getSource().sendFailure(Component.literal("Dialogue inconnu : " + nom));
            return 0;
        }
        js.forEach(p -> Dialogues.ouvrir(p, nom, pnj));
        return js.size();
    }

    // Position des yeux par rapport au point d'apparition du monde, au format d'un point de trajet
    private static int point(CommandContext<CommandSourceStack> c) throws CommandSyntaxException {
        ServerPlayer p = c.getSource().getPlayerOrException();
        BlockPos sp = p.serverLevel().getSharedSpawnPos();
        String ligne = String.format(Locale.ROOT, "{\"pos\": [%.1f, %.1f, %.1f], \"lacet\": %.1f, \"tangage\": %.1f}",
                p.getX() - sp.getX(), p.getEyeY() - sp.getY(), p.getZ() - sp.getZ(), p.getYRot(), p.getXRot());
        try {
            Path f = FMLPaths.CONFIGDIR.get().resolve("atheria_recit_points.txt");
            Files.writeString(f, ligne + System.lineSeparator(), StandardCharsets.UTF_8, StandardOpenOption.CREATE, StandardOpenOption.APPEND);
        } catch (IOException ex) {
            Donnees.LOG.warn("Point non ecrit : {}", ex.toString());
        }
        c.getSource().sendSuccess(() -> Component.literal(ligne).withStyle(Style.EMPTY.withColor(ChatFormatting.YELLOW)
                .withClickEvent(new ClickEvent(ClickEvent.Action.COPY_TO_CLIPBOARD, ligne))
                .withHoverEvent(new HoverEvent(HoverEvent.Action.SHOW_TEXT, Component.literal("Cliquer pour copier (aussi dans config/atheria_recit_points.txt)")))), false);
        return 1;
    }
}
