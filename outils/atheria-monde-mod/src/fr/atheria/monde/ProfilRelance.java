package fr.atheria.monde;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

// Reglages de la relance du profil Mojang, et commande de test depuis les scripts.
public final class ProfilRelance {
    public static final Logger LOG = LogManager.getLogger("Atheria");
    public static final int ESSAIS = 12;
    public static final int ATTENTE = 100;
    public static volatile boolean simulerEchec;

    private ProfilRelance() {
    }
}
