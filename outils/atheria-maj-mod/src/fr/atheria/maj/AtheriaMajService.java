package fr.atheria.maj;

import cpw.mods.modlauncher.api.IEnvironment;
import cpw.mods.modlauncher.api.ITransformationService;
import cpw.mods.modlauncher.api.ITransformer;
import java.nio.file.Path;
import java.util.List;
import java.util.Set;

/**
 * Point d'entree : ModLauncher appelle initialize avant que NeoForge scanne le dossier mods.
 * Windows ne verrouille donc pas encore les jars, et la mise a jour s'applique des ce lancement.
 */
public class AtheriaMajService implements ITransformationService {
    @Override
    public String name() {
        return "atheria_maj";
    }

    @Override
    public void initialize(IEnvironment environment) {
        try {
            String cible = environment.getProperty(IEnvironment.Keys.LAUNCHTARGET.get()).orElse("");
            if (!cible.toLowerCase().contains("client")) {
                return;
            }
            Path dossier = environment.getProperty(IEnvironment.Keys.GAMEDIR.get()).orElse(Path.of(""));
            AtheriaMaj.lancer(dossier.toAbsolutePath(), AtheriaMaj.PACK_URL);
        } catch (Throwable ignored) {
            // La mise a jour ne doit jamais empecher le jeu de demarrer
        }
    }

    @Override
    public void onLoad(IEnvironment environment, Set<String> autresServices) {}

    @Override
    public List<? extends ITransformer<?>> transformers() {
        return List.of();
    }
}
