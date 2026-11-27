# Conversion Xaero complète + essais Distant Horizons (fil « Corriger la World Map et Distant Horizons », 23/11/2026)

Racine PC : `C:\Users\El-Afdal\Desktop\Atheria Zombie Edition` (ci-dessous `R\`).
Règles : verrou `R\outils\pause-file.lock` (création atomique avec NOTRE PID, attendre s'il est pris, ne supprimer que le nôtre),
un seul Minecraft à la fois, ne jamais toucher au monde de référence (on le COPIE), ni à `serveur\server.properties`, ni à « ZZ Villes 33 »,
ni à l'instance `Atheria` de Mika, ni à `AtheriaAudit`. Rien n'est supprimé : on déplace dans un dossier `retires\`.
Rien sur GitHub, rien sur le serveur Minestrator.

## 0. Instance de travail
1. Copier `R\instances\Atheria-test-reglages` vers `R\instances\AtheriaXaeroDH` (vraie copie, pas de liens durs ; `robocopy /E /COPY:DAT`),
   puis dans `instance.cfg` mettre `name=AtheriaXaeroDH`. Prism doit être fermé pendant la modification.
2. Mettre l'instance au niveau de GitHub main (1.1.4-beta) : dans `AtheriaXaeroDH\minecraft`,
   `java -jar ..\packwiz-installer-bootstrap.jar -g https://raw.githubusercontent.com/MikaMsaa/atheria-pack/main/pack.toml`
   (ou le hook de pré-lancement de l'instance). Vérifier que `mods\` contient bien `atheria_reglages-1.0.8.jar`, `DistantHorizons-3.3.3`,
   `iris-neoforge-1.8.14-beta.1`, `xaeroworldmap-neoforge-1.21.1-1.47.0`.
3. Ajouter le mod d'île (génération, côté serveur seulement dans le pack, mais le monde ne s'ouvre pas sans) :
   `R\outils\mondes-cloud\carte-gelee-20261120\outils\xaero\ile\atheria-ile.jar` -> `mods\atheria-ile.jar`, et le contenu du dossier `config\`
   posé à côté de ce jar (il contient `atheria_ile`) dans `config\` de l'instance (même source que l'envoi serveur du 22/11, voir `R\outils\minestrator\journal-envoi-20261122.md`).
4. Monde : copier `R\outils\mondes-cloud\carte-gelee-20261122\monde` vers `AtheriaXaeroDH\minecraft\saves\AtheriaXaero` (robocopy, ~8,5 Go).
   Supprimer de la COPIE rien du tout ; si `session.lock` gêne, le laisser, Minecraft le recrée.
5. `options.txt` de l'instance : `pauseOnLostFocus:false`, `renderDistance:4`, `simulationDistance:4`, fenêtre 1920x1080 (instance.cfg
   `WindowWidth=1920`, `WindowHeight=1080`, `LaunchMaximized=false`). Mémoire de l'instance : 5120 Mo (passe 1), 5632 Mo (passe 2).

## 1. Passe 1 : conversion Xaero (« Convert All Regions », fonction intégrée de Xaero)
1. Mettre de côté (déplacer dans `AtheriaXaeroDH\minecraft\retires\`) : `DistantHorizons-*.jar`, `dynamic-fps-*.jar` (sinon la carte
   ne travaille plus quand la fenêtre n'a pas le focus), `atheria_reglages-*.jar` (sinon il relance le jeu).
   Mettre de côté aussi tout `kubejs\client_scripts\zz_*.js` déjà présent.
2. Copier `zz_xaero_conversion.js` (ce dossier) dans `kubejs\client_scripts\`.
3. Lancer directement dans le monde : `prismlauncher.exe --launch AtheriaXaeroDH --world AtheriaXaero`.
4. Suivi : `kubejs\config\xaero_conversion_etat.json` (`en_cours` -> `conversion_finie` -> `fini`) et `logs\kubejs\client.log`
   (lignes `[XAERO-CONV]`). Compter toutes les 10 min les `.zip` dans `xaero\world-map\*\null\cm$converted\`.
   Le script ouvre la carte dézoomée, fait 2 captures `screenshots\xaero-conversion-vue-*.png`, puis quitte le jeu tout seul.
   Budget : 4 h. Si la RAM libre du PC passe sous 400 Mo ou si le jeu plante, noter l'heure, relancer UNE fois (la conversion reprend
   depuis le début mais les régions déjà écrites sont réutilisées).
5. Livraison dans `R\outils\xaero-conversion-20261123\` :
   - `cm-converted\` = copie complète de `xaero\world-map\<monde>\null\cm$converted\` (zips + éventuels `cache_*`) ;
   - `autres-caches\` = tout autre dossier `cache_*` créé sous `xaero\world-map\<monde>\` (chemins relatifs gardés) ;
   - `liste.txt` = arborescence + taille de chaque fichier ; `md5.txt` ;
   - les 2 captures et `logs\latest.log` + `logs\kubejs\client.log` ;
   - puis découper le tout en archives `xaero-conversion-partNN.zip` de 400 Mo max (+ `.md5`), pour envoi vers le cloud.
6. Remettre l'instance : `zz_xaero_conversion.js` déplacé dans `retires\`, jars remis dans `mods\`.

## 2. Passe 2 : essais Distant Horizons + Iris (même instance, même copie du monde)
1. Jars en place : DistantHorizons OUI, dynamic-fps OUI, `atheria_reglages` NON (on teste DH/Iris seuls ; il reste dans `retires\`).
2. `config\iris.properties` : `shaderPack=ComplementaryUnbound_r5.9.3.zip`, `enableShaders=false` (le script les allume lui-même).
3. Copier `zz_dh_essais.js` dans `kubejs\client_scripts\`. Lancer `--launch AtheriaXaeroDH --world AtheriaXaero`.
4. Le script fait tout seul (~22 min) : passage en spectateur, tp dans la grotte de la capture bêta (4246, -51, -784), captures
   `screenshots\dh-A..H-*.png`, reproduction de l'erreur shader puis contournement. Fin : `kubejs\config\dh_essais_etat.json` = `fini`.
   Fermer alors le jeu proprement.
5. Rapport : copier les captures dans `R\captures\dh-essais-20261123\` et relever dans `logs\latest.log` toutes les lignes
   contenant `dhProjection`, `C1503`, `Failed to`, `shader`, `[DH-ESSAI]` (avec l'heure), dans `R\outils\xaero-conversion-20261123\rapport-dh.txt`.
6. Remettre l'instance (script dans `retires\`, `atheria_reglages` remis). Rendre le verrou.

## Ce qu'il faut dire au fil cloud à la fin
Durée de la conversion, nombre de zips, taille totale, chemins des archives et des captures, lignes du rapport DH, incidents.
