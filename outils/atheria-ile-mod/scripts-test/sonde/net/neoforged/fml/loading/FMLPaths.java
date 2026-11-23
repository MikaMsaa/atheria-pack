package net.neoforged.fml.loading;
import java.nio.file.Path;
/** bouchon de la sonde hors jeu : dossier du jeu = propriete "jeu" */
public enum FMLPaths {
    GAMEDIR(""), CONFIGDIR("config");
    private final String s;
    FMLPaths(String s) { this.s = s; }
    public Path get() { return Path.of(System.getProperty("jeu", ".")).resolve(s); }
}
