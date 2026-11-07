# Mises a jour automatiques (mod atheria-maj + packwiz)

Le pack est publie sur GitHub : https://github.com/MikaMsaa/atheria-pack
A chaque lancement, le mod `atheria-maj.jar` compare l'instance au pack en ligne et
telecharge seulement ce qui a change (mods, configs, scripts KubeJS, schematics).

Les joueurs utilisent le **Modrinth App**. Tous les mods s'installent tout seuls :
il n'y a plus aucun mod a telecharger a la main, et plus aucune commande a regler.

## Pour les joueurs : installer le pack (Modrinth App)

1. Installer le Modrinth App et se connecter avec son compte Minecraft.
2. Double-cliquer sur `Atheria-Zombie-Edition-1.0.4.mrpack` fourni par Mika (ou, dans
   l'app : **+** > **Importer depuis un fichier**). L'app cree l'instance, installe
   Minecraft 1.21.1, NeoForge et tous les mods.
3. Lancer le jeu.

Si une mise a jour est disponible, une fenetre de progression s'ouvre avant le jeu, puis
le jeu demarre directement avec les nouveaux fichiers.

## Comment ca marche

- `outils\atheria-maj-mod` contient le code du mod. `construire.ps1` compile
  `atheria-maj.jar`, a copier dans `pack\mods`.
- Le mod est un service ModLauncher (`ITransformationService`), pas un mod classique. Il
  s'execute avant que NeoForge scanne le dossier `mods` : Windows ne verrouille donc pas
  encore les jars, et la mise a jour s'applique des ce lancement.
- Il lit `pack.toml` en ligne et le compare a `atheria-maj.etat`. S'ils sont identiques,
  rien n'est lance. Sinon, il lance `packwiz-installer-bootstrap.jar` (inclus dans le mod)
  avec le Java du jeu.
- Il ne bloque jamais le jeu : sans internet, si GitHub ne repond pas, si l'installation
  echoue ou dure plus de 20 minutes, le jeu demarre avec les fichiers actuels. Le detail
  est dans `atheria-maj.log` et `atheria-maj-installation.log` (dossier de l'instance).
- Il ne fait rien sur un serveur dedie. Il n'a donc pas besoin d'y etre installe.
- Un fichier `atheria-maj.desactive` dans le dossier de l'instance coupe la mise a jour.
  Il est present dans `instances\Atheria\minecraft` : sans lui, GitHub ecraserait les
  fichiers de travail a chaque test.

Limites connues :

- `atheria-maj.jar` lui-meme est verrouille pendant qu'il tourne, et une nouvelle version
  du mod ne peut donc pas se remplacer toute seule. Eviter de le changer ; si c'est
  indispensable, le prevoir et le tester a part.
- GitHub garde `pack.toml` en cache 5 minutes : une publication toute recente peut
  n'arriver qu'au lancement suivant.
- Un mod avec un jar illisible dans `mods` fait echouer NeoForge avant que le mod de mise
  a jour s'execute.

## Anciennes commandes

La commande de pre-lancement n'est plus necessaire. Elle reste inoffensive :
`atheria-maj.bat` et `packwiz-installer-bootstrap.jar` restent a la racine du depot GitHub
(hors de l'index) pour les instances qui l'ont encore. Ils y sont necessaires tant que des
joueurs l'utilisent, et c'est aussi elle qui apporte le mod aux instances deja installees.

## Tes reglages sont conserves

Les mises a jour n'ecrasent pas les fichiers que chaque joueur regle a son gout :

- `options.txt` (touches, volume, FOV, langue, etc.) ;
- les reglages Iris et Sodium (shaders, graphismes) ;
- les reglages des minimap et carte du monde Xaero ;
- les reglages client du chat vocal (micro, volume) ;
- les reglages de Shoulder Surfing (camera).

Ces fichiers sont installes une seule fois, a la premiere installation. Ensuite, ils
restent tels que le joueur les a modifies.

## Plus de mods a installer a la main

Truly Dark et Food Spoilage, dont CurseForge bloquait le telechargement automatique, sont
remplaces par des mods Modrinth equivalents : **True Darkness Biomes** (client) et
**Spoiled** (client et serveur). Les anciens jars sont ranges dans les dossiers
`mods-desactives`.

Les 7 mods qui n'existent que sur CurseForge (FTB Library, FTB Quests, FTB Teams,
AllTheLeaks, Underground Bunkers & Nuclear Weapons, Infnexus, Walkie-Talkie Plus)
autorisent le telechargement automatique : packwiz les installe comme les autres, et le
`.mrpack` les contient directement (dans `overrides/mods`), car un pack Modrinth ne peut
telecharger que depuis Modrinth ou GitHub.

## Pour Mika : publier une mise a jour

Tout se fait dans le dossier `pack`, avec `outils\packwiz.exe` :

1. Faire les changements :
   - ajouter un mod Modrinth : `..\outils\packwiz.exe mr add <slug>` (puis regler `side`
     dans le `.pw.toml` : `client`, `server` ou `both`) ;
   - mettre a jour un mod : `..\outils\packwiz.exe update <nom>` (ou `update --all`) ;
   - retirer un mod : `..\outils\packwiz.exe remove <nom>` ;
   - modifier une config : copier le fichier depuis `instances\Atheria\minecraft\config`
     vers `pack\config`.
2. Augmenter `version` dans `pack.toml` (ex. 1.0.0 -> 1.0.1).
3. Lancer `..\outils\packwiz.exe refresh`.
4. Envoyer le contenu du dossier `pack` sur GitHub (branche `main`), y compris
   `atheria-maj.bat` et `packwiz-installer-bootstrap.jar` (a la racine du depot et hors de
   l'index), sans toucher a leurs fins de ligne.
5. Pour les nouveaux joueurs seulement : refaire le `.mrpack` avec
   `outils\exporter-mrpack.ps1`. Les joueurs deja installes n'en ont pas besoin.

Au prochain lancement, chaque joueur recoit la nouvelle version. Cote serveur, recopier
les memes mods et configs dans le serveur (les mods `server` et `both`).
