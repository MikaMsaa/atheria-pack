package fr.atheria.maj;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.nio.file.StandardOpenOption;
import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;

/**
 * Met le pack a jour avant que NeoForge ouvre les mods. Ne bloque jamais le jeu :
 * toute erreur est ecrite dans atheria-maj.log et le jeu demarre avec les fichiers actuels.
 */
public final class AtheriaMaj {
    static final String PACK_URL = "https://raw.githubusercontent.com/MikaMsaa/atheria-pack/main/pack.toml";
    private static final String DESACTIVE = "atheria-maj.desactive";
    private static final String ETAT = "atheria-maj.etat";
    private static final String LOG = "atheria-maj.log";
    private static final String BOOTSTRAP = "packwiz-installer-bootstrap.jar";
    private static final int TIMEOUT_INSTALLATION_MIN = 20;

    private AtheriaMaj() {}

    /** Renvoie vrai si le pack en ligne est maintenant installe. */
    public static boolean lancer(Path dossier, String url) {
        Path log = dossier.resolve(LOG);
        try {
            Files.writeString(log, "[" + LocalDateTime.now() + "] Mise a jour Atheria" + System.lineSeparator(), StandardCharsets.UTF_8);
            if (Files.exists(dossier.resolve(DESACTIVE))) {
                ecrire(log, DESACTIVE + " present : mise a jour ignoree.");
                return false;
            }
            String enLigne = lire(url);
            Path etat = dossier.resolve(ETAT);
            if (Files.exists(etat) && Files.readString(etat, StandardCharsets.UTF_8).equals(enLigne)) {
                ecrire(log, "Le pack est deja a jour.");
                return true;
            }
            extraireBootstrap(dossier);
            Path journal = dossier.resolve("atheria-maj-installation.log");
            Process process = new ProcessBuilder(java(), "-jar", BOOTSTRAP, "-s", "client", url)
                    .directory(dossier.toFile())
                    .redirectErrorStream(true)
                    .redirectOutput(journal.toFile())
                    .start();
            if (!process.waitFor(TIMEOUT_INSTALLATION_MIN, TimeUnit.MINUTES)) {
                process.destroyForcibly();
                ecrire(log, "Installation trop longue, arretee : le jeu demarre avec les fichiers actuels.");
                return false;
            }
            if (process.exitValue() != 0) {
                ecrire(log, "Echec de l'installation (code " + process.exitValue() + "), voir atheria-maj-installation.log.");
                return false;
            }
            Files.writeString(etat, enLigne, StandardCharsets.UTF_8);
            ecrire(log, "Mise a jour terminee.");
            return true;
        } catch (Throwable t) {
            ecrire(log, "Mise a jour ignoree : " + t);
            return false;
        }
    }

    private static String lire(String url) throws IOException {
        HttpURLConnection connexion = (HttpURLConnection) URI.create(url).toURL().openConnection();
        connexion.setConnectTimeout(5000);
        connexion.setReadTimeout(10000);
        if (connexion.getResponseCode() != 200) {
            throw new IOException("reponse " + connexion.getResponseCode());
        }
        try (InputStream in = connexion.getInputStream()) {
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    private static void extraireBootstrap(Path dossier) throws IOException {
        Path cible = dossier.resolve(BOOTSTRAP);
        if (Files.exists(cible)) {
            return;
        }
        try (InputStream in = AtheriaMaj.class.getResourceAsStream("/" + BOOTSTRAP)) {
            Files.copy(in, cible, StandardCopyOption.REPLACE_EXISTING);
        }
    }

    /** Le Java qui lance le jeu, en version sans console si elle existe. */
    private static String java() {
        String commande = ProcessHandle.current().info().command().orElse("java");
        Path sansConsole = Path.of(commande).resolveSibling("javaw.exe");
        return Files.exists(sansConsole) ? sansConsole.toString() : commande;
    }

    private static void ecrire(Path log, String message) {
        try {
            Files.writeString(log, message + System.lineSeparator(), StandardCharsets.UTF_8, StandardOpenOption.CREATE, StandardOpenOption.APPEND);
        } catch (IOException ignored) {
            // Le journal ne doit jamais empecher le jeu de demarrer
        }
    }
}
