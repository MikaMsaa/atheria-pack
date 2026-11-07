# Guide serveur Minestrator : Atheria Zombie Edition

## 1. Choisir l'offre

- Environ 85 fichiers de mods, avec une génération lourde (Lost Cities, Tectonic, Terralith) et beaucoup d'entités (Spore, hordes). Minestrator conseille 6 à 8 Go pour 50 à 200 mods. Avec 10 joueurs et ce type de génération, vise **8 Go minimum, 10 Go si possible**.
- **Java 21** est obligatoire pour la 1.21.1.

## 2. Installer NeoForge

1. Onglet **Versions** : choisis **NeoForge**, version **21.1.x** (la même que dans ton instance Prism), puis **« Réinstaller la version »**.
2. Suis l'installation dans **Console**, puis démarre une fois pour que les dossiers se créent, et arrête.
3. Dans `eula.txt`, passe `eula=false` à `eula=true`.

⚠️ N'utilise **pas** l'onglet **Mods** de Minestrator pour ce pack. Il installe la dernière version de chaque mod, sans les correctifs de dépendances ni la séparation client/serveur. Un mod client sur le serveur, ou une mauvaise version, le fait planter au démarrage.

## 3. Envoyer les mods (SFTP)

1. Récupère tes accès SFTP dans le panel, puis connecte-toi avec **WinSCP** (le même outil que pour la copie des logs).
2. Envoie tout le contenu de `Atheria Zombie Edition\serveur\mods` dans `/mods/` sur le serveur.
3. Ajoute les mods récupérés à la main sur CurseForge : FTB Quests, FTB Library, FTB Teams, AllTheLeaks et Underground Bunkers.
4. N'envoie **jamais** le contenu de `client\mods` : Sodium, Iris et les autres mods client font planter un serveur.
5. Quand les configs seront prêtes, envoie aussi le dossier `config` (et `defaultconfigs` s'il existe) que je préparerai.

## 4. Avant le premier vrai démarrage

L'ordre compte, parce que la génération du monde se fixe à sa création :

1. Envoie le dossier `serveur\config` (il contient déjà le profil `lostcities/profiles/atheria.json`) et `serveur\kubejs`. Dans `config/lostcities-server.toml`, mets `selectedProfile = "atheria"`.
2. Dans `server.properties` :
   - `difficulty=hard`
   - `pvp=true`
   - `max-players=12`
   - `view-distance=8`
   - `simulation-distance=6`
   - `spawn-protection=0` (la protection du spawn passe par Open Parties and Claims)
   - `allow-flight=true` (indispensable : sans ça, les joueurs en avion ou en véhicule Immersive Vehicles sont expulsés pour « vol »)
   - `level-seed=` : à remplir avec la seed du monde test retenu
   - `motd=Atheria - Zombie Edition`
3. Supprime le dossier `world` s'il a été créé lors d'un démarrage de test.
4. Démarre.

## 5. Prégénérer le monde (Chunky)

Ça évite les ralentissements quand dix joueurs explorent en même temps :

```
chunky center 0 0
chunky radius 3000
chunky start
```

Avec Lost Cities et Tectonic, compte plusieurs heures. Lance-le la veille de l'ouverture, serveur fermé aux joueurs (`whitelist on`). `chunky pause` et `chunky continue` permettent de l'interrompre.

**Vue lointaine déjà prête pour les joueurs (Distant Horizons).** À lancer une fois dans la console, serveur fermé aux joueurs :

```
dh pregen start minecraft:overworld 0 0 192
```

`dh pregen status` donne l'avancement et `dh pregen stop` l'arrête. Compte de l'ordre de 6 h pour ces 192 chunks de rayon (environ 7 chunks par seconde mesurés sur un PC, à revoir selon la machine). Les joueurs reçoivent ensuite le paysage lointain du serveur sans le générer eux-mêmes. Cette commande remplit la vue de loin : elle ne remplace pas la prégénération par Chunky pour les chunks où l'on joue.

**Attention : Chunky et Distant Horizons ne peuvent pas tourner ensemble.** Avec les deux, le serveur plante à la création du monde (« Chunky is not loaded »). Chunky n'est donc plus dans les mods du serveur : son jar est rangé dans `serveur\mods-desactives`. Pour prégénérer, sers-toi d'un serveur arrêté : retire le jar de Distant Horizons de `mods`, ajoute Chunky, lance la prégénération, puis remets Distant Horizons et retire Chunky.

## 6. Voice chat

Simple Voice Chat a besoin d'un port **UDP**. Deux solutions :
- **Réutiliser le port du serveur** : dans `config/voicechat/voicechat-server.properties`, mets `port=-1`. C'est le plus simple chez un hébergeur.
- Sinon, ouvre un port supplémentaire dans le panel Minestrator si ton offre le permet, et mets ce numéro.

À vérifier à la première connexion : l'icône du micro ne doit pas être barrée.

## 7. Sauvegardes

- Onglet **Sauvegardes** : fais une sauvegarde **avant chaque mise à jour du pack** et avant chaque changement de config.
- Active **SmartBackup** (sauvegarde automatique), au moins une fois par jour.
- Garde une sauvegarde « propre » juste après la prégénération : si quelque chose casse le monde au début, on repart de là sans refaire des heures de génération.

## 8. Suivi des performances

- `spark tps` : santé du serveur. 20 TPS, c'est parfait, en dessous de 15 on cherche la cause.
- `spark profiler start` puis `spark profiler stop` après une à deux minutes de jeu. Le lien obtenu montre quel mod consomme. Envoie-le-moi, ou il arrivera dans les logs que je récupère.
- Redémarrage quotidien conseillé (aux heures creuses) si le panel propose des tâches planifiées.

## 9. Règles du serveur (validées par Mika)

1. **PvP libre partout.**
2. **Pas de spawn-kill.**
3. **Pas d'exploitation de bugs** (duplication, passage à travers les murs…).
4. **Les corps se pillent hors claim.** Dans un claim, ils sont protégés.
5. **Les bases peuvent être protégées** par un claim.
6. **Alliances et trahisons libres.**
7. **Pendant un event, les règles de Mika priment.**

## 10. Mettre à jour le pack plus tard

1. Sauvegarde.
2. Arrête le serveur.
3. Remplace `/mods/` et `config/` par la nouvelle version.
4. Redémarre et vérifie la console.

Quand les mises à jour automatiques (packwiz) seront en place, le serveur pourra suivre le même pack.


## Mise à jour 1.0.5 : fichiers serveur (01/11/2026)

À faire une fois la 1.0.5 publiée, serveur arrêté et sauvegardé :

- Ajouter dans `mods/` les jars du dossier local `serveur\mods` : Jurassic Reborn et son extension d'apparition naturelle, Citadel, Biomes O' Plenty, Dungeons and Taverns, When Dungeons Arise, Moog's Voyager Structures, Moog's Structure Lib, ATi Structures, YUNG's Better Desert Temples, Ocean Monuments, Jungle Temples, Witch Huts et Nether Fortresses, Ecologics, Critters and Companions, Friends and Foes, Mowzie's Mobs, YACL.
- YACL est obligatoire sur le serveur : sans lui, le démarrage échoue (`ClassNotFound dev.isxander.yacl3`).
- Copier `kubejs/server_scripts/atheria_butin.js`, `atheria_apparition.js`, `atheria_coffres.js` et `atheria_campagne.js`, `kubejs/config/web_server.json`, `config/ftbquests/quests/`, `kubejs/data/atheria/`, les configs Lost Cities (profil `atheria.json`, `lostcities-server.toml`), `sparsestructures.json5` et `jurassicreborn-common.toml`.
- Un monde déjà joué ne bénéficie pas des nouveaux biomes et structures dans les chunks déjà générés, et son point d'apparition ne change pas.

## Mise à jour 1.0.6 : fichiers serveur (02/11/2026)

À faire une fois la 1.0.6 publiée, serveur arrêté et sauvegardé :

- Remplacer `mods/` par le dossier local `serveur\mods` : plusieurs mods de structures sont retirés, et `atheria-monde.jar` est ajouté.
- Copier `kubejs/server_scripts/`, `kubejs/data/`, `config/ftbquests/quests/`, `config/firstaid-server.toml`, `config/sparsestructures.json5` et `config/biomesoplenty/biome_toggles.json`. Ce dernier retire les biomes fantastiques de Biomes O' Plenty.
- Le Nether et l'End sont fermés. Un monde déjà joué garde ses structures existantes, et les nouvelles règles ne s'appliquent qu'aux nouveaux chunks.

## Prochaine mise à jour : fichiers serveur (préparé le 03/11/2026, pas encore publié)

À faire une fois la mise à jour publiée, serveur arrêté et sauvegardé :

- Ajouter dans `mods/` depuis `serveur\mods` : Subsurface, Simple Structures Caves, Collapsing Caves, et remplacer `atheria-monde.jar`. Si Patchouli a été ajouté, le retirer.
- Copier `kubejs/server_scripts/` (dont `atheria_mines.js` et `atheria_vehicules.js`), `kubejs/data/` (dont `subsurface/`, `pv/` et `parcool/`), `kubejs/assets/mts/` et `config/parcool-server.toml`.
- Copier `config/collapsingcaves.conf` et le fichier vide `collapsingcaves_greeted` qui l'accompagne.
- Les nouvelles grottes n'apparaissent que dans les chunks encore jamais générés.


## Prochaine mise à jour : fichiers serveur (03/11/2026)

- Ajouter `mods/nyfsspiders-neoforge-1.21.1-3.0.2.jar` et remplacer `mods/atheria-monde.jar`.
- Copier `config/collapsingcaves.conf` : les effondrements n'agitent plus l'écran.
- Copier `config/spore-startup.toml` et remplacer `kubejs/server_scripts/atheria_spores.js` : la peur de Spore (Madness, Uneasy) est retirée. Retirer `kubejs/server_scripts/atheria_peur.js` s'il est présent.
- Remplacer `kubejs/server_scripts/atheria_bruit.js` : le bruit attire les infectés et les zombies vanilla.

## Prochaine mise à jour : fichiers serveur (05/11/2026, pas encore publié)

- Remplacer `mods/atheria-monde.jar`.
- Copier `config/lostcities/profiles/atheria.json` et `kubejs/data/lostcities/` : nouvelles villes et routes.
- Copier `config/ftbquests/quests/chapters/prologue.snbt` : talkie-walkie dans le kit de départ.
- Ajouter dans `mods/` depuis `serveur\mods` : Double Doors, Collective, Fields, Cinch's Abandoned Houses, Abandoned Watchtowers, Simply Traps, Trapper Pelts, Create Crafts & Additions, Pufferfish Skills.
- Copier dans `kubejs/data/` : `atheria/`, `c/`, `fields/`, `minecraft/`, `puffish_skills/`, `cinchsabandonedhouses/`, `watchtower_building/`.
- Copier `kubejs/startup_scripts/atheria_contenu.js`, `kubejs/server_scripts/atheria_contenu_routes.js`, `kubejs/server_scripts/atheria_air.js`, `kubejs/server_scripts/atheria_campagne.js` et `config/mtsconfig.json`.
- Les nouvelles villes et les nouveaux biomes demandent un monde neuf : sur un monde existant, ils seraient coupés à la frontière des chunks déjà générés. Sauvegarder l'ancien monde avant.
