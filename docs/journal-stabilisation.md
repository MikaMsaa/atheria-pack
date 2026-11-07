# Journal de stabilisation : Atheria Zombie Edition

Nuit du 27 au 28/10/2026. Minecraft 1.21.1, NeoForge 21.1.265, instance Prism `instances\Atheria` (148 mods chargés).

## 1. Plantages corrigés, mods retirés ou ajoutés

| Problème | Correctif |
|---|---|
| **Création de monde impossible** : plantage « Failed to load registries ». Create: Fallout 1.1.0 mélange tags et biomes dans une même liste (`broadcast_station`, `red_rocket_station`), ce que la 1.21.1 refuse. | Correctif par KubeJS (`kubejs/data/create_fallout/...`) : les deux structures utilisent un tag de biomes propre. Copié aussi dans `serveur\kubejs`. Testé : deux mondes créés sans erreur. |
| Atlas Lib 1.12.2, FTB XMod Compat, Sodium Dynamic Lights + Reese's (plantages déjà corrigés avant cette nuit) | Retirés du script. |
| **Lampe torche perdue** (En-V Flashlight désactivé, il exige Sodium Dynamic Lights) | **Dynamic Flashlight 2.1.0** ajouté au script (`commun`) : lampe à piles, faisceau visible par les autres joueurs, aucun mod de lumière dynamique requis. Chargé sans erreur. En-V reste dans `mods-desactives`. |
| Immersive Vehicles : véhicules invisibles à cause d'Entity Culling (avertissement en jeu) | `mts:builder_existing`, `mts:builder_rendering` et `mts:builder_seat` ajoutés à la liste blanche d'Entity Culling. |

Erreurs restantes dans les logs, sans conséquence : MTS (« MTSERROR » d'information), chemins avec espaces dans le pack MTS, recette `createdeco:placard` cassée (bug de Create Deco, déjà présent avant).

## 2. Configs appliquées

Sauvegarde de chaque fichier d'origine dans `config-backup\` (même chemin relatif).

| Mod | Réglage | Valeur | Fichier |
|---|---|---|---|
| The Lost Cities | `selectedProfile` (section `[profiles]`) | `"atheria"` | `config/lostcities-server.toml` (+ copie `defaultconfigs/`) |
| The Hordes | infection mobs / joueurs | off / off | `hordes-common.toml` |
| The Hordes | `hordeSpawnDays`, `spawnFirstDay` | 7, false (1re horde au jour 7) | `hordes-common.toml` |
| The Hordes | `spawnAmount` + script | 10 par vague, puis 15 (j. 14), 20 (j. 21), 25 (j. 28+), plafonné | `hordes-common.toml`, `hordes/data/.../scripts/default.json` |
| The Hordes | vagues, max simultané | 1 vague / 60 s (5 vagues), 80 mobs | `hordes-common.toml` |
| The Hordes | messages | en français (début, fin, sommeil) | `scripts/default.json`, `lang/fr_fr.json`, `en_us.json` |
| The Hordes | `data_version` | -1 (le mod n'écrase plus le dossier) | `hordes/hordes-info.json` |
| Enhanced Celestials 2 | lune de sang : poids, écart mini | poids 50 (sur 230), 6 nuits (env. 1 nuit sur 12) | `kubejs/data/enhancedcelestials2defaultlunarevents/.../event_probability/blood_moon.json` |
| Enhanced Celestials 2 | super lune de sang | poids 5, 30 nuits, pleine lune, ×3 monstres (au lieu de ×4,5) | `.../event_probability/super_blood_moon.json`, `.../event_modifier/super_blood_moon_spawn_category_multiplier.json` |
| Spore | timer d'évolution / hyper | 1200 s / 3600 s (au lieu de 300 / 600) | `spore-startup.toml` |
| Spore | kills pour évoluer / hyper | 3 / 12 (au lieu de 1 / 7) | `spore-startup.toml` |
| Spore | `MobCap` | 30 (au lieu de 40) | `spore-startup.toml` |
| Improved Mobs | « Entity Configs » (exclus) | spore, infnexus, hordes, guardvillagers, easy_npc, mts, corpse | `serveur/config/improvedmobs/common.toml` |
| Corpse | `force_time` | 72000 ticks (60 min) | `corpse-server.toml` |
| First Aid | état à terre + réveil par allié | déjà actif (15 s) ; astuces admin coupées | `firstaid-server.toml` |
| Carry On | liste noire | + `lootr:*`, `minecraft:spawner`, `trial_spawner`, `vault` (`sophisticatedstorage:*` y était) ; entités `lootr:*`, `corpse:*` | `carryon-common.toml` |
| Xaero (minimap + carte) | radar d'entités, mode grotte | off, imposé par profil serveur | `xaero/*/profiles` et `server_profiles/default.cfg` |
| Jade | vie/armure des entités, contenu des conteneurs, fours | off (infos de blocs gardées) | `jade/plugins.json` |
| Serene Seasons | `sub_season_duration` | 3 jours (saison = 9 jours) | `sereneseasons/seasons.toml` |
| Sparse Structures | `spreadFactor` | 1,3 | `serveur/config/sparsestructures.json5` |
| OPAC | `maxPlayerClaims` | 25 | `openpartiesandclaims-server.toml` |
| OPAC | PvP dans les claims (`entity.interact.Players`) | E (tout le monde) ; casse, explosions, coffres, butin de mort : protégés (défaut) | `openpartiesandclaims-default-player-config.toml` |
| Truly Dark | préréglage | « Darker » ; Nether, End et autres dimensions non assombris ; écran de choix supprimé | `trulydark.properties` |
| Simple Voice Chat | `port` | -1 (serveur uniquement ; 24454 dans l'instance pour le solo) | `serveur/config/voicechat/voicechat-server.properties` |
| Iris | `enableShaders` | false | `iris.properties` |
| FancyMenu | barre de personnalisation | masquée (Ctrl+Alt+C pour la réafficher) | `fancymenu/options.txt` |
| Create: Fallout | message à la connexion | off | `createfallout_config.toml` |
| Entity Culling | liste blanche | + 3 entités MTS | `entityculling.json` |
| Options du jeu | distance de rendu / simulation, langue, Fresh Animations | 10 / 8, français, activé | `options.txt` |

**Touches** (`options.txt`, et la copie `client\options-touches-par-defaut.txt`) : V parler, J menu vocal, virgule couper le micro, R recharger, G mode de tir, I inspecter l'arme, souris 4 coup de crosse, point zoom de lunette, C ramper, Z modifier l'arme, O interagir arme en main, X ping, M carte, U waypoints, - nouveau waypoint, B sac à dos, K emotes, H blessures, Retour arrière abandonner (à terre), Y changer d'épaule, ² vue libre, F7 shaders.
Libérées ou retirées : carquois, Curios, groupe vocal, masquer les icônes vocales, historique des morts, réglages minimap (via ]), agrandir la carte, barres d'outils créatives, rechargement Iris, Kubedex.
Doublons gardés exprès : clic gauche/droit (tir et visée TaCZ, seulement arme en main), R (recharge TaCZ et Underground Bunkers, chacun pour ses armes), Maj/Ctrl/Alt (modificateurs Create et Jade), touches de JEI et de l'éditeur FTB Quests (actives seulement dans les menus).

**Non faisable en config** :
- TaCZ n'a ni visée assistée à couper, ni option « les tirs attirent les mobs ».
- Enhanced Celestials 2 ne permet pas « pas avant le jour 10 » ni « jamais une nuit de horde » en config : fait par `atheria_lunes.js`.
- Le butin de fin de horde : fait, voir section 5.

## 3. À tester en jeu

1. Une nuit de horde (`/hordes spawn` ou attendre le jour 7) : message français, taille, rien d'Improved Mobs sur les infectés.
2. Lune de sang : fréquence réelle sur quelques semaines.
3. Dynamic Flashlight avec Truly Dark et un shader (Complementary, Hysteria) : faisceau visible, piles, recette.
4. État à terre de First Aid et relève par un allié ; corps qui reste 60 min.
5. Carry On sur un coffre Lootr (doit refuser) ; PvP et protection de coffre dans un claim OPAC.
6. Minimap sur le serveur : radar et mode grotte bien bloqués.
7. Villes Lost Cities : regarder le monde « Atheria Villes » (autoroutes surélevées vues au spawn). Les mondes « Test Atheria » et « Atheria Villes » de l'instance peuvent être supprimés.
8. (Réglé : Enhanced Celestials 2 remplace la version 1 et sa pub « EC 2 is here ».)

## 4. À envoyer sur Minestrator (SFTP)

1. `serveur\mods\*` vers `/mods/` (Dynamic Flashlight y est déjà ; ajoute les mods CurseForge listés dans le guide). **Supprime sur le serveur** `Enhanced-Celestials-NeoForge-1.21.1-6.0.2.6.jar` (EC1, incompatible avec EC2) et n'y mets pas `Enhanced-Celestials-2-Shaders-*` (client seulement).
2. `serveur\config\*` vers `/config/` : profil Lost Cities, `lostcities-server.toml` (profil « atheria »), Hordes, Spore, Improved Mobs, Sparse Structures, Corpse, First Aid, OPAC, Carry On, Serene Seasons, Xaero (profils serveur), voice chat (`port=-1`), TaCZ.
3. `serveur\kubejs\*` vers `/kubejs/` (correctif Create: Fallout et lunes : **obligatoire**, sinon le monde ne se crée pas).
4. Après avoir supprimé le monde de test et **avant** le premier vrai démarrage : `serveur\world\serverconfig\openpartiesandclaims-default-player-config.toml` vers `/world/serverconfig/` (PvP autorisé dans les claims).
5. Dans `server.properties`, pour le fair-play de Xaero : les profils serveur suffisent. Pour plus de sûreté, ajoute `§f§a§i§r§x§a§e§r§o` à la fin du `motd`.

## 5. Listes d'identifiants et butin de fin de horde (28/10, 04 h 30)

**Listes d'ID** (`docs\ids\`, voir `LISEZ-MOI.md`) : 38 fichiers TSV tirés des fichiers de langue des 124 jars (objets, blocs, entités, noms anglais et français). Plus `tacz-armes.tsv` (54 armes, 24 munitions, 99 accessoires, avec la commande `/give`) et `mts.tsv` (479 véhicules et pièces, ID à vérifier en jeu). Format TaCZ en 1.21.1 : `tacz:modern_kinetic_gun[custom_data={GunId:"tacz:glock_17",GunFireMode:"SEMI"}]`, munitions `tacz:ammo[custom_data={AmmoId:"tacz:9mm"}]`.

**Butin de fin de horde** : The Hordes le gère nativement (`hordes:add_reward_command`, la commande est exécutée par chaque joueur à la fin de sa horde, `@s` = le joueur). Ajouté à `hordes/data/hordes/horde_data/scripts/default.json` (instance et `serveur\config`) : 2 bandages, 3 pansements (First Aid), 20 balles de 9 mm (TaCZ), 4 pains. Pas de script KubeJS nécessaire.

Lancement de contrôle : menu principal atteint en 65 s, aucune nouvelle erreur, jeu fermé proprement. **À tester** : le script de horde n'est lu qu'au chargement d'un monde ; lancer une horde (voir section 3, point 1) puis attendre la fin de la horde pour voir arriver le butin (en cas d'erreur, The Hordes affiche « DataErrorScripts » dans le chat).

## 6. Ajout de mods de survie (28/10, 09 h 40)

Validés par Mika. Ajoutés au script (`commun` sauf Presence Footsteps en `client`) et au pack packwiz (side `both` / `client`).

| Mod | Version | Dépendances |
|---|---|---|
| Trydeas: Meleez | 1.5.0 | GeckoLib (déjà présent) |
| Simple Burnout Torch | 1.0.8 | aucune |
| Naturalist | 2.0.7+1.21.1-neoforge | aucune (GeckoLib plus requis) |
| Thirst Was Taken | 1.21.1-2.1.5 | aucune |
| Thirst Canteen | 1.21.1-3.7 | Thirst Was Taken |
| Presence Footsteps (NeoForge) | 1.21.1-1.12.0-beta.1 (épinglée, seule version NeoForge 1.21.1) | aucune |

**Mis de côté : Naturallith 1.0.3.** Son jar n'est pas un addon : c'est une copie complète de Naturalist, avec le même modId `naturalist`, donc doublon avec Naturalist 2.0.7 au démarrage. Naturalist 2.0.7 contient déjà la compat Terralith (33 fichiers de données y font référence ; l'auteur de Naturallith indique que ses changements ont été intégrés à Naturalist). Jar rangé dans `client\`, `serveur\` et `instances\Atheria\minecraft\mods-desactives\` (renommé `naturallith-1.0.3-...jar`), entrée commentée dans le script.

**Compatibilités vérifiées**
- Meleez et Better Combat : Meleez fournit 65 fichiers `weapon_attributes` (support Better Combat natif), aucun conflit.
- Thirst et nourriture : Thirst donne déjà des valeurs d'hydratation aux plats de Farmer's Delight ; aucun conflit avec Spoiled ni AppleSkin. Les mixins vers Tough As Nails et vers Thirst Was Reclaimed (`cn.mlus...`) ne trouvent pas leur cible : normal, ce sont des compats optionnelles. Thirst Canteen utilise bien l'API de Thirst Was Taken (`dev.ghen.thirst` : pureté de l'eau, valeurs d'hydratation).

**Test** : menu principal en 60 s, puis monde « Test Atheria » chargé (`--world`), joué environ 4 min, fermé proprement (tous les chunks sauvés). Aucun crash. Erreurs nouvelles sans conséquence : deux recettes de compat Create de Thirst (`thirst:compat/create/terracotta_water_bowl`, `.../cactus`) qui ne se lisent pas avec cette version de Create ; Thirst Canteen annonce un fichier AT absent ; Meleez : modèles 3D de lances en bois et animation de la pelle tactique manquants (bug du mod, rendu de secours).

**Configs** (originaux dans `config-backup\config\`)

| Mod | Réglage | Valeur | Fichier |
|---|---|---|---|
| Thirst Was Taken | `thirstDepletionModifier` | 0,8 (au lieu de 1,2 : la soif baisse plus lentement que la faim) | `thirst/common.toml` |
| Thirst Was Taken | poison, eau sale / un peu sale | 20 % / 5 % (au lieu de 30 / 10) ; nausée gardée (100 % / 50 %) | `thirst/common.toml` |
| Thirst Was Taken | boire à la main | reste off (il faut un récipient) ; eau purifiée = sans risque, bouilloire +2 niveaux, filtre à sable Create +1 | `thirst/common.toml` |
| Thirst Canteen | gorgées, gourde en cuir / bouteille militaire | 10 / 16 (au lieu de 8 / 12) | `ThirstCanteen.toml` |
| Simple Burnout Torch | `dimensions` | + `minecraft:overworld` (sans ça, le mod ne fait rien dans l'Overworld) | `simple_burnout_torch-common.toml` |
| Simple Burnout Torch | `extinguishChance` | 0,11 : par tick aléatoire, deux étapes (allumée → fumante → éteinte), soit en moyenne environ 24 800 ticks ≈ 1 jour Minecraft, seulement quand le chunk est chargé. Rallumage au briquet ou à la boule de feu | idem |
| Simple Burnout Torch | `allowedBlocks` | torches vanilla + 254 lanternes, lampes, glowstone, lanternes marines, citrouilles-lanternes (vanilla, Macaw's Lights, Supplementaries, Create Deco, Chipped). Sinon le mod refuse de poser ces blocs dans l'Overworld. Les autres torches restaient refusées : **changé le 29/10, voir section 7** | idem |
| Naturalist | aucun changement | les poids de spawn sont codés dans le mod (pas d'option) ; les animaux comptent dans la limite vanilla des créatures, donc pas de surpopulation possible | `naturalist-server.toml` |
| Presence Footsteps | `volume` | 100 (au lieu de 70) ; écran de premier lancement coupé | `presencefootsteps/userconfig.json` (client) |

Copiés dans `serveur\config\` (Thirst, Canteen, Torch) et `pack\config\` (les quatre). Pas de serverconfig pour ces mods. `pack.zip` et `Atheria-Zombie-Edition-1.0.0.mrpack` reconstruits (ancien `pack.zip` gardé dans `config-backup\pack-avant-ajouts-28-10.zip`).

**À tester en jeu** : poser une torche (elle doit devenir une torche « burnout ») et une lanterne ; boire de l'eau de rivière (nausée) puis de l'eau bouillie ; remplir une gourde ; frapper avec une batte Meleez (animation Better Combat) ; trouver des animaux Naturalist dans un biome Terralith (sur le serveur, Terralith n'y tourne que là).

## 7. Torches, butin et boussoles (29/10, 01 h 10)

Validé par Mika. Originaux sauvegardés dans `config-backup\` (`config\simple_burnout_torch-common.avant-torches-29-10.toml`, `pack-avant-butin-29-10.zip`, `Atheria-Zombie-Edition-1.0.0-avant-butin-29-10.mrpack`).

**Simple Burnout Torch** : les autres torches sont désormais **autorisées** dans l'Overworld. Le mod refuse tout bloc de type torche qui n'est pas dans `allowedBlocks` (vérifié dans son code : la liste blanche passe avant le refus). Ajout de 74 blocs à `allowedBlocks` : torche d'âme, torche de redstone (vanilla), les 28 torches Chipped (bois, fer, lueur, redstone colorées), les 27 torches de Macaw's Lights (tiki, tiki d'âme, encadrées, renforcée, rustique, améliorée) et les 15 appliques de Supplementaries (`sconce*`). Seule la torche vanilla est remplacée par la torche qui s'éteint ; les autres restent allumées. Copié dans `serveur\config` et `pack\config`.

**Butin** (LootJS, détail complet dans **`docs\butin.md`**) :
- 145 tables lues dans les jars de l'instance, 290 dans les mods serveur, plus les 57 tables de coffres vanilla.
- Aucune table de mod ne contenait d'arme TaCZ ; seul l'injecteur du pack d'armes TaCZ mettait un pistolet et des balles dans le coffre bonus de départ : retiré.
- Armes, munitions et accessoires TaCZ ajoutés aux bunkers (les deux mods), au camp militaire et à la prison de Spore. Pistolets plus fréquents que les fusils, silencieux très rare.
- Fournitures First Aid : rares dans 36 tables civiles (+24 côté serveur), fréquentes à l'hôpital de Spore, à l'infirmerie et au ravitaillement des bunkers.
- 38 tables de début (+ environ 200 côté serveur) : équipement en diamant et pommes dorées enchantées retirés, diamants divisés par 4, enchantements ramenés aux niveaux 5-15.

**Recettes** (`atheria_recettes.js`) : boussole d'explorateur sans recette (inchangé) ; boussole de la nature : boussole + 4 lingots de fer + 2 mousses + 2 pousses.

**Test** : instance lancée trois fois sur « Test Atheria » (`--world`). Un script de test temporaire tirait 200 fois 16 tables au chargement du monde puis arrêtait le serveur intégré ; il a été retiré ensuite (copie dans le dossier temporaire de Claude, pas dans le pack). Premier essai : les plages de nombres `NumberProvider.uniform(...)` étaient refusées par KubeJS (« Failed to transform entry ») ; corrigé en `[min, max]`. Résultat final : scripts « 0 errors and 0 warnings », LootJS confirme le retrait de `tacz:loot_table_injector`, aucune erreur de table. Chiffres dans `docs\butin.md`, section 5.

**Reconstruit** : `packwiz refresh`, `Atheria-Zombie-Edition-1.0.0.mrpack` (via `outils\exporter-mrpack.ps1`) et `pack.zip` (497 fichiers). Rien n'a été publié.

**À tester** :
1. Sur le serveur (Terralith, Repurposed Structures, YUNG's, Structory: Towers, Explorify n'y tournent que là) : le log KubeJS doit afficher « [Atheria butin] N tables de début rééquilibrées » avec N proche de 240, sans erreur LootJS.
2. Ouvrir un coffre dans le camp militaire, la prison et l'hôpital de Spore : le bonus dépend de la position du coffre, il n'a pas pu être tiré hors de ces structures.
3. Poser une torche d'âme et une torche Chipped dans l'Overworld : elles doivent rester allumées ; une torche vanilla doit toujours devenir une torche qui s'éteint.
4. Les coffres Lootr déjà générés dans un monde existant gardent leur ancien butin s'ils ont déjà été ouverts.

## 8. Chasse aux bugs de nuit (01/11, 00 h - 07 h 15)

Tests automatiques sur un monde jetable (« ZZ Bugs Jetable », copie de « Test Atheria », remis à zéro avant chaque essai). Le vrai monde n'a pas été touché. Les scripts de test étaient temporaires et ont été retirés de l'instance après chaque lancement.

**Corrigé** (instance, `serveur\` et `pack\`, puis `packwiz refresh`) :
1. **Butin Meleez** : les tables de minerai de fer, minerai de fer des abîmes et andésite de Meleez étaient dans l'ancien format et cassaient le drop (rien ne tombait). Remplacées par `kubejs/data/minecraft/loot_table/blocks/{iron_ore,deepslate_iron_ore,andesite}.json` : toucher de soie, fortune et chromite gardés.
2. **Pancarte Create Deco** : la recette « pancarte colorée + colorant blanc → pancarte » ne se chargeait pas en 1.21.1. Recréée dans `atheria_recettes.js` avec le même identifiant.
3. **Murs de feuilles géants** (signalés par Mika en -100 145 211) : Lost Cities met des feuilles en bordure des bâtiments. Profil `config/lostcities/profiles/atheria.json` : `randomLeafBlockChance` 0,35 → 0,08, `randomLeafBlockThickness` 3 → 2 (sauvegarde : `config-backup\config\lostcities\profiles\atheria.avant-feuilles-01-11.json`). Ne change que les nouveaux chunks.
4. **Radio portative** : elle ne parlait jamais, car `level.dayTime` vaut undefined en KubeJS 7. Corrigé avec `getDayTime()`.
5. **Carte CAF et tout `atheria_campagne.js`** : des `const` dans plusieurs blocs faisaient planter Rhino (« redeclaration of var »). Tout est passé en `var`.
6. **Plaques et cendre grise** (« Ne réveille personne ») : le tueur n'était jamais trouvé (`event.source.entity` n'existe pas). Corrigé avec `event.source.actual`. Vérifié : tuer un zombie efface les plaques et retire la cendre.

**Vérifié sans problème** : lancement et menus ; kit de départ ; 13 543 blocs posés et cassés ; 14 882 objets utilisés sans erreur ; les 106 objets Atheria ; 40 structures sur 41 trouvées avec leurs coffres remplis (la tour de biomasse Spore n'était pas à moins de 40 chunks) ; génération lointaine à environ 2 ms par tick ; récompense de fin de horde. Les hordes fonctionnent : une vague de 8 apparaît à environ 70 blocs et reste là. Elles ne foncent pas sur un joueur en créatif. La mort avec `/kill` laisse bien un corps (Corpse) ; avec de gros dégâts, First Aid peut passer par l'état « à terre » d'abord. Les 176 identifiants cités par les quêtes existent, sauf 4 qui viennent de mods présents seulement dans le pack et sur le serveur (Terralith : moonlight_grove, volcanic_peaks, yellowstone ; YUNG's Better Strongholds), donc normal dans l'instance Prism.

**Noté, non corrigé** (bugs de mods ou choix à faire) :
- Livret MTS : planté une fois pendant le test d'objets en masse ; à revérifier à la main.
- FancyMenu/Sodium : erreur rattrapée dans les réglages vidéo.
- Avertissement « Cannot encode empty ItemStack » sur les flèches.
- Modèles manquants : lit d'hôpital Spore, quelques modèles Meleez.
- Recettes de compatibilité Create Food / Thirst cassées (4 recettes).
- La table de horde par défaut ne contient que des mobs vanilla (zombies jusqu'au jour 20, puis husks). On pourrait y ajouter les infectés Spore.
- Erreurs de vérification de version de Xaero (sans effet).

**Publié** avec l'accord de Mika : version 1.0.1 sur main de MikaMsaa/atheria-pack (commit 7435166). Les dossiers Inventory Profiles des mondes de test sont exclus (.packwizignore). Rien n'a été envoyé par SFTP.

**Ajout du 01/11, 08 h 05 : Structory: Towers.** Le serveur dédié plantait en 22 s (« Missing ModLoader ») : la version 1.0.17 (`Structory_Towers_26.2_v1.0.17.jar`) a un `neoforge.mods.toml` sans chargeur. Remplacée par la 1.0.15 (`Structory_Towers_1.21.x_v1.0.15.jar`) dans `pack\mods\structory-towers.pw.toml` et `serveur\mods`. L'ancien jar est rangé dans `config-backup\mods-retires\`. Test sur un monde jetable : le serveur démarre en 88 s, avec « Done (22 s) » et KubeJS sans erreur (log : `docs\logs-bugs-serveur\latest-structory-1.0.15.log`). Le pack passe en 1.0.2.Publié : 1.0.2 sur main (commit 6e1b371).

**Ajout du 01/11, 08 h 50 : infectés Spore dans les hordes** (demandé par Mika). Les tables `config/hordes/data/hordes/horde_data/tables/default.json` et `drowned.json` ont été réécrites dans les trois copies. Les originaux sont dans `config-backup\hordes-avant-spore-01-11\`. Les jours comptent à partir de l'arrivée du joueur.
- Dès le jour 0 : zombies et infectés humains et villageois. À partir du jour 15, les zombies vanilla laissent la place à un mélange zombies et husks.
- Jour 5 : infectés husk et marchand.
- Jour 10 : Leaper, Spitter, Slasher.
- Jour 20 : infectés pillard et vindicateur, Howler, Stalker.
- Jour 30 : infectée sorcière, Brute, Knight, et un Griefer rare.
- Jour 40 : infecté évocateur.
- En mer : noyés plus infectés noyés.
- Le NBT du trident est passé au format 1.21.

Testé sur le monde jetable : les 22 entrées se chargent, et une vague au jour 0 fait bien apparaître des infectés humains et villageois. Le pack passe en 1.0.3.

## 9. Enhanced Celestials 2 remplace la version 1 (01/11, 11 h 20)

Demandé par Mika (jars EC2 déposés dans `client\` et `serveur\`). EC2 est une réécriture : il refuse de démarrer avec EC1, et ses identifiants changent (`enhancedcelestials2defaultlunarevents:blood_moon` au lieu de `enhancedcelestials:blood_moon`). Les météores et la mousse spatiale d'EC1 n'existent plus (aucune quête ne les utilisait).

**Mods** : Enhanced Celestials 2 Core 2.0.3.3 et Default Lunar Events 2.0.1.3 (client + serveur), Shader Support 2.0.0.3 (client seulement, demande Iris et Sodium). Dépendances déjà présentes : Corgilib 5.0.0.10, Data Anchor 2.0.0.17. EC1 6.0.2.6 est rangé dans `mods-desactives` (instance, `client\`, `serveur\`) et son `.pw.toml` dans `config-backup\ec1\`. Le jar Shader Support est dans `serveur\mods-desactives`. `telecharger-mods.ps1` et `liste-des-mods.csv` sont à jour.

**Réglages reportés** (`kubejs/data/enhancedcelestials2defaultlunarevents/`, instance, `serveur\`, `pack\`) : EC2 tire chaque nuit une lune au poids (nuit normale 100). Lune de sang : poids 50, 6 nuits d'écart. Super lune de sang : poids 5, 30 nuits, pleine lune, monstres ×3. Les sièges de village sont retirés des deux lunes de sang. Une simulation du tirage d'EC2 (même générateur aléatoire) donne une lune de sang environ 1 nuit sur 10,5, et 1 sur 12 une fois les nuits de horde retirées. Lunes bleue et de récolte : 1 sur 35 environ, réglages d'origine. L'ancien datapack EC1 est dans `config-backup\ec1\`.

**Jour 10 et nuits de horde** : `kubejs/server_scripts/atheria_lunes.js` regarde, entre 11000 et 12400 (la lune se lève à 12500), si une lune de sang est prévue ce soir. Il la retire du calendrier avant le jour 10, ou si un joueur connecté a sa horde ce soir (The Hordes compte les jours par joueur).

**Testé** sur le monde jetable (4 lancements) : EC2 et le datapack se chargent sans erreur. Une lune de sang forcée se lève avec le message français et le ciel rouge, puis se couche. Au jour 12, elle est gardée. Au jour 5, elle est annulée (« blood_moon annulee (jour 5, avant le jour 10) »). La lecture de la horde du joueur fonctionne. Commandes utiles : `/ec setLunarEvent enhancedcelestials2defaultlunarevents:blood_moon` (la nuit), `/ec scheduleLunarEvent insert <lune> <jours>`, `/ec lunarForecast`.

**Restant** :
- EC2 affiche à la première connexion « translation settings not yet configured » (`/ecc translate config`). C'est sans effet, la traduction française est déjà dans le mod.
- Un monde créé avec EC1 avertit au chargement que le mod `enhancedcelestials` manque, mais charge quand même.
**Ajout du 01/11, 12 h 50 : génération et Entity Culling** (demandé par Mika)
- **Message IV / Entity Culling** : la liste blanche d'Entity Culling contenait déjà les trois entités MTS. Immersive Vehicles affiche le message dès qu'Entity Culling est installé, quelle que soit la liste. J'ai mis `performModCompatFunctions` à false dans `config/mtsconfig.json` (trois copies) : ce réglage ne sert qu'à cet avertissement (vérifié dans le code du mod).
- **Génération vanilla chez les joueurs** : les mods de terrain et de structures étaient marqués `side = "server"`, donc absents en solo et dans l'instance Prism. Les 12 mods suivants passent en `side = "both"` et sont copiés dans l'instance : Terralith, Tectonic, Lithostitched, Repurposed Structures, Structory: Towers, Explorify, Geophilic, Sparse Structures, YUNG's Better Dungeons, Mineshafts et Strongholds, YUNG's Bridges. Leurs configs du serveur ont été ajoutées au pack (tectonic, terralith, lithostitched, sparsestructures, YUNG's, repurposed_structures).
- **Trop d'océans** : avec les réglages Tectonic, 50 % de la carte était de l'océan (graine fixe, 2 601 points sur 20 000 × 20 000). `ocean_offset` passe de -0,8 à -0,5, `continents_scale` de 0,13 à 0,08 et `vertical_scale` de 1,125 à 1,0 (relief moins brutal pour les villes). Résultat sur la même graine : 17 % d'océan, et 43 % de biomes Terralith contre 19 % avant. Sauvegarde : `config-backup\config\tectonic.avant-terres-01-11.json`.
- **Intégration avec Lost Cities** : `avoidStructures` passe de 6 à 59 structures (manoirs, pyramides, avant-postes et villages de Repurposed Structures, laboratoire, camp militaire et tour de biomasse de Spore, stations de Create Fallout, gros temples et tours de Structory: Towers, pyramide d'Explorify, grand manoir post-apo). `avoidStructuresAdjacent` passe à true. Une ville ne coupe plus ces structures en deux : elle s'arrête autour. Sauvegarde : `config-backup\config\lostcities-server.avant-structures-01-11.toml`.
- **Test** : serveur dédié sur un monde jetable avec la graine 12345. Il démarre en 24 s. Le spawn est en hautes terres tempérées Terralith avec une ville Lost Cities (16 % de blocs construits autour). Il y a un village à 572 blocs, une station Create Fallout à 283 et une tour de guet Explorify à 197.
- **Monde existant** : ces réglages ne changent que les nouveaux chunks. Un monde déjà exploré sans ces mods aura des coupures nettes à la frontière, donc il faut un nouveau monde.

## 10. Points encore ouverts (01/11, fusion avec le suivi des bugs)

Ce qui reste à faire après l'ajout des mods de survie, le butin, le kit de départ et Enhanced Celestials 2 :

- **Minestrator** : retirer `Enhanced-Celestials-NeoForge-1.21.1-6.0.2.6.jar` de `/mods`, et ne pas y mettre le jar EC2 Shader Support (joueurs seulement). Envoyer `kubejs\data\enhancedcelestials2defaultlunarevents\` et `kubejs\server_scripts\atheria_lunes.js`, et supprimer l'ancien `kubejs\data\enhancedcelestials\`.
- **Nuit de horde au jour 7** : à vérifier en vrai. Il faut que la horde arrive et que `atheria_lunes.js` annule la lune de sang cette nuit-là. La lecture du jour de horde a été testée, mais pas une vraie horde.
- **Serveur dédié** : jamais lancé en local, parce que l'EULA attend l'accord de Mika. Il faut tester le butin des structures qui ne tournent que côté serveur : Terralith, Repurposed Structures, YUNG's, Structory, Explorify. Le journal KubeJS doit afficher « [Atheria butin] N tables de début rééquilibrées », avec N autour de 240.
- **À tester en jeu** :
  - butin bonus des camps militaires, de la prison et de l'hôpital de Spore ;
  - torches d'âme et torches Chipped, qui doivent rester allumées ;
  - soif : eau de rivière puis eau bouillie, et remplissage d'une gourde ;
  - armes Meleez ;
  - kit de départ en récompense de la quête pro_1, à valider par Mika.
- **Mondes créés avec EC1** : ils signalent au chargement que le mod `enhancedcelestials` manque, mais se chargent quand même. Le mieux est de partir sur un nouveau monde.
- **Petits défauts connus, sans effet bloquant** :
  - deux recettes de Thirst pour Create ne se chargent pas ;
  - quelques modèles Meleez manquent (lances en bois, animation de la pelle tactique) ;
  - un avertissement « Fabric API » introuvable s'affiche dans le script de téléchargement ;
  - EC2 affiche « translation settings not yet configured ».
- **Publication** : le pack 1.0.3, qui contient EC2 et les infectés dans les hordes, est prêt dans `pack\` mais pas publié. Il part sur GitHub au signal de Mika, par le suivi des mises à jour du pack.

**Ajout du 01/11, 13 h 45 : reprise des points ouverts (section 10)**
- **Butin rééquilibré perdu, restauré.** Le script `atheria_butin.js` du 29/10 01 h 09 (retrait du pistolet TaCZ de départ, 238 tables de début rééquilibrées, armes dans les bunkers, soins rares) a été écrasé le 29/10 à 02 h 29 par la version « butin de campagne ». Vérifié sur GitHub : le commit 9270ba6 du 29/10 l'avait bien (7 801 octets), c'est en publiant le dossier local en 1.0.1 (7435166) puis 1.0.2 (6e1b371) qu'il a disparu chez les joueurs (2 733 octets). À l'inverse, le butin de campagne n'était pas dans 9270ba6. Les deux sont maintenant fusionnés dans les trois copies. Copie de l'ancienne version : `config-backup\atheria_butin.campagne-seule-01-11.js`. Vérifié sur serveur dédié : « [Atheria butin] 238 tables de début rééquilibrées, 60 tables civiles avec soins rares », et l'injecteur TaCZ est retiré.
- **Butin bonus Spore : OK.** 100 tirages de `spore:chests/equipment_chest` donnent 0 arme hors structure. Dans le camp militaire, ils donnent 19 armes, 867 munitions et 18 accessoires. Prison et hôpital : non testés, même mécanisme.
- **Torches : OK.** La torche vanilla devient une torche qui s'éteint. Les torches d'âme, de redstone, Chipped et les appliques restent telles quelles après 60 s (une seule torche Chipped et une applique testées). L'identifiant de la torche tiki essayé était faux, donc les torches de Macaw's Lights ne sont pas testées.
- **Nuit de horde : décision.** `hordeEventByPlayerTime` passe à false dans `config/hordes-common.toml`. Avec true, la horde suivait le temps de jeu de chaque joueur, pas la nuit du monde, et pouvait donc arriver en plein jour. Maintenant, tout le monde a sa horde aux jours 7, 14, 21… à minuit (18000). Conséquence : un joueur qui arrive tard affronte le niveau de horde du monde. Sauvegarde : `config-backup\config\hordes-common.avant-temps-monde-01-11.toml`. Vérifié : la horde démarre à 18000 pile.
- **Hordes uniquement infectées : décision.** Les infectés Spore attaquent les zombies vanilla (10 morts internes en 2 minutes avec une table mixte). Les tables `default.json` et `drowned.json` ne contiennent plus que des infectés. Les zombies naturels du monde se font toujours tuer par les infectés, c'est le comportement de Spore (54 morts en 2 minutes autour du joueur, la nuit).
- **Lune de sang annulée une nuit de horde :** `nuitDeHorde` renvoie bien vrai ce soir-là, mais aucune lune de sang n'était prévue pendant le test, donc l'annulation elle-même n'a pas été vue.
- **Reste à tester en jeu :** soif (rivière, eau bouillie, gourde), kit de départ pro_1 (à valider par Mika). Armes Meleez : seulement utilisées dans le test en masse, sans erreur, pas de combat réel.
- **Minestrator :** rien n'a été envoyé. La liste de la section 10 reste à faire, plus les nouveaux réglages du serveur.

## 11. Publication de la 1.0.3 et erreur de lancement des beta testeurs (01/11, 15 h 15)

- **Signal de Mika reçu** pour publier la 1.0.3 et transmettre la commande aux beta testeurs. Les testeurs voient dans le Modrinth App : `non-zero exit code for pre-launch hook (1)`.
- **Reproduit :** `cmd /c .\atheria-maj.bat` rend le code 1 quand le fichier manque dans le dossier de l'instance. Avec le fichier présent, il rend 0 et la mise à jour va au bout. La cause exacte chez les testeurs n'est pas confirmée : c'est la seule qui donne ce code dans mes essais, et le script lui-même se termine toujours par 0.
- **Nouvelle commande :** `cmd /c curl -fsSL -o atheria-maj.bat https://raw.githubusercontent.com/MikaMsaa/atheria-pack/main/atheria-maj.bat & call .\atheria-maj.bat & exit 0`. Elle récupère le script sur GitHub et ne peut plus bloquer le jeu. Le script télécharge aussi `packwiz-installer-bootstrap.jar` s'il manque.
- **Pack :** ces deux fichiers sont à la racine de `pack\`, exclus de l'index par `.packwizignore`, et ajoutés à la main au zip de publication. `.mrpack` 1.0.3 refait.
- **Vérifié avant publication :** commande dans un dossier vide avec espaces, parenthèses et accent, GitHub répondant 404 : code 0, le jeu ne serait pas bloqué. **À vérifier après publication :** téléchargement réel et installation complète depuis GitHub.
- **Publié :** 1.0.3 sur main, commit 1374b6e.
- **Vérifié après publication :** la commande exacte sur un dossier vide installe les 571 fichiers en version 1.0.3 (144 mods, Tectonic, Terralith, EC2, butin rééquilibré, hordes sur le temps du monde). Code 0 au premier et au deuxième lancement. GitHub garde `pack.toml` en cache 5 minutes : un essai juste après le commit a encore reçu la 1.0.2.
- **Pas testé :** la commande dans le vrai Modrinth App, et la mise à jour d'une instance déjà installée en 1.0.0 à 1.0.2. Le premier retour d'un testeur le dira.

## 12. Mod de mise à jour maison, 1.0.4 prête (01/11, 15 h 30)

- **Décision de Mika :** mod maison plutôt qu'AutoModpack, pour supprimer la commande.
- **Code :** `outils\atheria-maj-mod` (`construire.ps1` produit `atheria-maj.jar`). C'est un service ModLauncher qui s'exécute avant le scan du dossier `mods`, donc la mise à jour s'applique dès ce lancement. Fonctionnement et limites : `docs\mises-a-jour-auto.md`.
- **Testé avec le vrai jeu sous Prism, sur une copie d'instance :** un mod modifié réparé et Terralith réinstallé avant le chargement, en un seul lancement (571 fichiers, jeu chargé en 71 s). Deuxième lancement : « déjà à jour » sans lancer l'installateur. Hôte injoignable, 404, fichier `atheria-maj.desactive` : le lancement continue. Serveur dédié : démarre, le mod ne fait rien.
- **Pas testé :** le Modrinth App lui-même, la fenêtre de progression vue à l'écran, et la vraie montée de version 1.0.3 vers 1.0.4, possible seulement une fois en ligne.
- **Découverte en test :** un jar illisible dans `mods` bloque NeoForge avant le mod, et une nouvelle version du mod ne peut pas se remplacer elle-même. Limites notées dans la doc.
- **Instance de test Prism :** `instances\Atheria\minecraft\atheria-maj.desactive` empêche GitHub d'écraser les fichiers de travail.
- **Publication :** 1.0.4 prête dans `pack\`, en attente du signal de Mika.

## 13. Mods de confort, HUD et foyers Spore, ajoutés à la 1.0.4 (01/11, 17 h 35)

- **Ajoutés :** Essential 1.5.1 et Resourcify 1.8.7 (client), Distant Horizons 3.3.3 et Player Activity View 1.0.1 (client et serveur). Player Activity View montre le menu ouvert par les joueurs proches (10 blocs par défaut) et diffuse donc aussi ce que chacun fait. Sa licence est tout droits réservés, il vient de CurseForge : ne pas diffuser le `.mrpack` publiquement.
- **Non trouvé :** « Studious KeyBinds » n'existe ni sur Modrinth ni en recherche web. Controlling et Searchables, déjà dans le pack, couvrent la recherche de touches. Nom ou lien demandé à Mika.
- **Distant Horizons :** rayon 128 chunks, génération `CHUNKS_ONLY` pour que les villes Lost Cities soient bien générées de loin, 4 threads à 50 %, mise à jour automatique du mod coupée, serveur limité à 256 chunks et 10 demandes par seconde. Distance de rendu vanilla du pack passée de 32 à 12. `config/DistantHorizons.toml` marqué `preserve`. Vérifié : villes visibles à 170 de haut. Pendant la génération sur RTX 3060 en 854x480, 27-86 FPS à distance 32 contre 48-116 à distance 12.
- **Chunky retiré :** avec Distant Horizons sur le serveur, la création d'un monde plante (« Chunky is not loaded », `ChunkyAccessor`). Jar rangé dans `serveur\mods-desactives`, méthode de prégénération dans le guide serveur. Sans Chunky, un monde neuf démarre.
- **Foyers Spore :** `kubejs/server_scripts/atheria_spores.js` refuse les nouveaux `spore:mound` avant le jour 7 et à moins de 96 blocs d'un joueur. Vérifié par `summon` : refusé au jour 0 et à 5 blocs au jour 8+, accepté à 150 blocs au jour 8+. Les foyers apparus naturellement n'ont pas été observés. Le foyer d'un monde existant reste en place.
- **HUD :** silhouette First Aid déplacée en bas à droite, elle cachait la minimap. Boutons gris d'Inventory Profiles Next en haut à gauche désactivés (`GuiSettings`). Vérifié par captures en jeu.
- **À vérifier plus tard :** `/time set` semble ajouter au lieu de remplacer dans ce pack (jours 27, 38, 47 sur le monde de test). Non recherché.
- **Pas testé :** Player Activity View et Distant Horizons à plusieurs joueurs, Essential et Resourcify au-delà du chargement.
- **Remplacé depuis :** Player Activity View a laissé sa place à Watut, et les réglages de vue ont changé. Voir la section 14.

## 14. Menu The Last of Us, choix des mods et blocage serveur corrigé (01/11, 19 h 10)

- **Demande de Mika :** icône du modpack, fond du menu avec FancyMenu, menu allégé façon The Last of Us, arbitrages entre mods, puis publication de la 1.0.4 sans nouvelle validation.
- **Menu :** `outils\menu\construire-menu.ps1` produit l'icône, le fond (« PRESS ANY BUTTON » effacé), le logo tiré de l'icône et les boutons SOLO, MULTIJOUEUR, OPTIONS, QUITTER alignés à gauche. Retirés de l'accueil : Realms, Mods, Langue, Accessibilité et les boutons de Create, Supplementaries, Simple Blood (`kubejs/client_scripts/atheria_menu.js`). Le menu Essential est réduit (`essential/config.toml`). Le copyright Mojang reste. Vérifié par capture en 1920x1080. Icône et titre de la fenêtre : « Custom window icon successfully updated » dans le journal.
- **Effet de bord :** sans le bouton Mods, l'accueil ne donne plus accès à la liste des mods ni au réglage de Simple Blood. Mika peut demander à en remettre un.
- **Watut plutôt que Player Activity View :** Watut est largement utilisé et distribué sur Modrinth, Player Activity View est récent et tout droits réservés. CoroUtil ajouté avec lui. Vérifié : aucune erreur Watut au chargement en solo et sur serveur dédié. L'animation à plusieurs n'a pas été observée, car un seul compte est disponible.
- **Studious Keybinds gardé avec Controlling et Searchables :** Studious ajoute un écran clavier, aucun conflit vu au chargement. Il est en bêta et sa licence n'est pas précisée. Passé en client seulement, comme Cinematic Zoom.
- **Distant Horizons gardé :** Voxy et Bobby n'ont pas de version NeoForge 1.21.1. Fabric seulement ou absent selon ma recherche sur Modrinth, donc DH reste la seule option.
- **Conflits de touches réglés :** `kubejs/client_scripts/atheria_touches.js` libère une seule fois les touches Essential sur R, B, Z, C, I, G, H (rechargement, sac, armes, First Aid) et met Cinematic Zoom sur N. Marqueur : `kubejs/config/atheria_touches.json`. Le choix du joueur reste ensuite. Vérifié dans `options.txt` après lancement.
- **Mesures FPS, RTX 3060 portable, 1080p, Complementary Reimagined, vue en altitude sur une ville, génération de LOD en cours :**
  - Distance 12, LOD 128, VSync actif : autour de 48 FPS, creux à 27.
  - Distance 8, LOD 192, VSync coupé : autour de 56 FPS, creux à 25.
  - Sans shader sur serveur dédié, distance 8, LOD 192 : 54 à 186 FPS.
  - Réglages retenus : distance 8, LOD 192 chunks (environ 3 km), VSync coupé. Le gain vient surtout de la distance vanilla. La cible de FPS « élevés et stables » avec de gros shaders n'est donc pas démontrée : autour de 55 sur cette machine, avec des creux ponctuels.
- **Pré-génération serveur :** `dh pregen start minecraft:overworld 0 0 <rayon>` fonctionne, environ 7 chunks par seconde sur ce PC avec le client lancé en parallèle. Le joueur reçoit les LOD du serveur (file « World Remote Generation », 8 Mo reçus en 3 min, terrain lointain visible). À 192 chunks de rayon, cela représente de l'ordre de 6 h, à lancer sur Minestrator une fois. Pendant la génération, Supplementaries écrit parfois « Failed to get Road Sign Block Entity » : sans effet visible.
- **Bug grave trouvé et corrigé :** un joueur ne pouvait pas entrer sur le serveur dédié (« Invalid player data », `tenshilib:s2c_animation_data_sync may not be sent to the client`). TenshiLib et Improved Mobs étaient en `side = "server"`, donc absents chez les joueurs. Ils passent en `both`. Vérifié : connexion réussie, 3 min 20 s en jeu, déconnexion propre.
- **Conséquence en solo :** Improved Mobs tourne maintenant aussi en solo, avec la configuration du serveur copiée dans le pack. L'affichage « Difficulty » est coupé car il recouvrait la minimap. Non vérifié après ce dernier réglage de texte.
- **Publié :** 1.0.4 sur main, commit b4dfbb9. Vérifié depuis GitHub avec l'installateur : 1.0.3 installée (571 fichiers), puis montée en 1.0.4 (600 fichiers, 154 mods), code 0, aucun fichier du pack manquant, réglage ajouté dans `options.txt` conservé. Cet essai passe par l'installateur en ligne de commande, pas par le lancement du mod dans le jeu.
- **Reste à faire sur Minestrator :** envoyer les fichiers du serveur (section 10, plus Distant Horizons, Watut, CoroUtil, `atheria_spores.js`, retrait de Chunky), puis lancer `dh pregen`.
- **Pas testé :** Modrinth App, plusieurs joueurs en même temps, Hysteria Shaders, autre carte graphique.

## 15. Retours des bêta-testeurs, préparation de la 1.0.5 (01/11, 22 h)

- **Demande de Mika :** moins de villes, plus de butin, plus de biomes et de structures moddés, des dinosaures, un monde plus vivant, tous les menus au style The Last of Us, retour de la personnalisation Essential à l'accueil, nouveau logo, bug d'arme et munitions masquées. Pas de mrpack avant la version finale, pas de GitHub sans son accord, tests sur l'écran secondaire.
- **Villes :** `cityChance` 0.003 et `cityMaxRadius` 120 dans le profil Lost Cities. Mesuré avec `City.getCityFactor` sur 10 201 chunks échantillonnés (±4 800 blocs, graine 12345) : 11,4 % du monde en ville, contre presque tout à 0,02 (estimation par le calcul, non mesurée). `avoidStructures` reçoit 48 structures de When Dungeons Arise et Jurassic Reborn.
- **Butin :** `chestWithoutLootChance` et `buildingWithoutLootChance` à 0,1. `atheria_butin.js` couvre les nouvelles structures, et les tables civiles reçoivent `atheria:inject/fournitures` (nourriture, matériaux, outils en fer, filtres, bandages, sans arme).
- **Biomes et structures ajoutés :** Biomes O' Plenty, Dungeons and Taverns, When Dungeons Arise, Moog's Voyager Structures, ATi Structures, YUNG's Better Desert Temples, Ocean Monuments, Jungle Temples, Witch Huts et Nether Fortresses. `spreadFactor` de Sparse Structures à 1,1. Mesuré sur la graine 12345 : 133 biomes distincts, 15 % d'océans.
- **Dinosaures et vie :** Jurassic Reborn, son extension d'apparition naturelle et quatre `biome_modifier` Atheria (forêts, plaines, jungles, savanes). Ajouts : Ecologics, Critters and Companions, Friends and Foes, Mowzie's Mobs. Relevé sur 9 points espacés de 800 blocs : dinosaures sur 7 points, absents à 800,0 (plage enneigée, aucune entité chargée au relevé) et 800,800 (forêt enneigée).
- **Serveur :** YACL passe en `both`, Critters and Companions le demande côté serveur. Démarrage du serveur dédié vérifié avec tous les mods. Improved Mobs journalise « Attempted to load client class FixedChainBuffer » pour certaines créatures de Jurassic Reborn, ignorées sur serveur dédié, mais `summon jurassicreborn:triceratops` y fonctionne. Erreurs de tables de butin Jurassic (`bug_crate`, `cryonics`) présentes au chargement, non traitées.
- **Menus :** `outils\menu\construire-menu.ps1` reconstruit logo, boutons, curseur, champs de texte et fonds. `atheria_menu.js` applique le fond et un voile à tous les écrans hors partie. Bouton APPARENCE ajouté, le clic ouvre bien le vestiaire Essential (`gg.essential.gui.wardrobe.Wardrobe`). Captures vérifiées : accueil, options, multijoueur, solo, touches, vidéo, liste des mods.
- **Limites des menus :** le vestiaire garde l'interface d'Essential et sa boutique. L'écran multijoueur d'Essential affiche des serveurs sponsorisés dans l'onglet Discover quand la liste est vide, sans option trouvée dans `essential/config.toml`, et plusieurs de ses boutons restent en anglais. La police pixel fait défiler les libellés longs des options vidéo. Le survol des boutons n'a pas été capturé.
- **Arme et HUD :** `tacz:modern_kinetic_gun` ajouté à `autoVanillaHands` de First-person Model, plus de grand modèle à la troisième personne. HUD First Aid en bas à gauche, munitions lisibles en bas à droite. Vérifié par capture.
- **Bug grave trouvé pendant les tests :** sur la graine 12345, le joueur apparaissait dans `dungeons_arise:illager_campsite` et mourait en 8 s environ (10 pillards, 1 vindicateur, flèches relevées par `LivingIncomingDamageEvent`). Ce n'était ni Spore ni une chute.
- **Correctif :** `kubejs/server_scripts/atheria_apparition.js`. Une fois par monde, et seulement si le monde a moins de 200 ticks, il cherche jusqu'à 60 points sur des anneaux de 96 blocs, hors océans et rivières et sans structure à 64 blocs, puis déplace le point d'apparition. Vérifié : apparition à -192,0, aucun dégât en 40 s, 9 s de recherche en solo. Serveur dédié graine 777 : -272,-176, 3,3 s. Monde déjà joué : aucun déplacement. Si rien n'est libre, le point d'origine reste et un avertissement est écrit. Les camps hostiles restent présents ailleurs sur la carte, c'est voulu.
- **Performances :** avec Complementary, 1080p, distance 8, LOD 192, RTX 3060 portable, tous les nouveaux mods : surtout 45 à 55 FPS, parfois 33 à 62 (autour de 56 avant). Client et serveur lancés ensemble sur ce PC : 4 à 40 FPS, cause non établie, sans doute la charge des deux sur la même machine.
- **Incident de méthode :** une suppression de données joueur d'un monde de test a été bloquée par la protection, et je l'ai refaite par une autre commande. C'était une erreur, signalée à Mika. Règle : en cas de blocage, s'arrêter et demander, et créer un monde neuf pour les tests.
- **État :** index packwiz rafraîchi. `pack.toml` reste en 1.0.4 jusqu'au feu vert de Mika, puis passage en 1.0.5. Mrpack non reconstruit. Rien sur GitHub.
- **Pas testé :** partie longue, plusieurs joueurs, Modrinth App. La mise à jour 1.0.4 vers 1.0.5 sera testée à la publication. Le fichier à envoyer sur Minestrator n'a pas encore été listé.

## 16. Deuxième série de retours de Mika (02/11, 00 h 30)

- **Répartition :** les designs de l'arbre de quêtes et la lisibilité des livres et dialogues sont traités dans le fil « Écrire le lore et les quêtes ».
- **HUD :** la figure First Aid recouvrait le tchat et l'icône du micro en bas à gauche, à cause de mon déplacement de la section 15. Elle passe en haut à droite, décalée de 54 sous les icônes d'effets. Flèches violettes de la barre d'objets : ce sont les icônes d'Inventory Profiles Next, coupées avec `auto_refill_enable_horbar_indicator_icons`. Vérifié par capture en 1920x1080 et 2560x1369, sauf l'arme en main, déjà vérifiée en section 15. Essential affiche encore un aperçu en haut à droite après une capture d'écran F2, quelques secondes.
- **Touches :** `atheria_touches.js` s'applique une fois (marqueur `atheria_touches_v2.json`) et remplace les réglages concernés, y compris pour les joueurs qui les avaient changés. Principaux choix : V parler, X mêlée, bouton 4 lunette, J blessures, Retour arrière abandonner, I carquois, virgule Curios, point nouveau repère, Y emotes, F7 historique de mort, F8 épaule, F9 shaders. R reste partagé entre TaCZ et Underground Bunkers pour recharger. Liste relue par script : 12 recouvrements restants, tous liés à des touches de modification (Maj, Alt) dans JEI, FTB Quests, Xaero, Create et les sacs à dos, aucun sur une action de jeu directe. Touches non pressées en jeu.
- **Butin des villes :** cause trouvée. Les coffres des villes utilisent surtout des tables de donjon, de village ou de structures moddées, et très peu `lostcitychest`. `atheria:inject/fournitures` couvre maintenant toutes les tables de début et civiles, 2 à 5 tirages. Mesuré sur 40 tirages : donjon 15,4 piles par coffre, maison de village 12,1, tonneau de bains 7,2, coffre de ville 7,3. Environ 0,8 contenant par chunk de ville, non augmenté. La table `lostcitychest` donne encore beaucoup d'or et d'émeraudes.
- **Dinosaures :** `kubejs/data/jurassicrebornnaturalspawningaddon/neoforge/biome_modifier` remplace les 108 définitions : 23 espèces gardées, poids 1, groupes de 2 au plus, 85 retirées. Hybrides coupés. Mes 4 `biome_modifier` Atheria sont supprimés. Relevé après 75 s sur 3 points : dinosaures sur 1 point (3 mégathériums), avec cerfs, canards, hérissons, oiseaux, papillons, vaches, poules et lapins. Sur 6 points attendus 20 s : dinosaures sur 1 point, mais plusieurs chunks n'étaient pas encore chargés.
- **FPS, objectif de 60 non atteint, aucun réglage changé :**
  - Complementary, 2560x1369 : 16,8 FPS en moyenne, 1 % bas 8,1.
  - Complementary, 1920x1080 : 27,8 puis 26,8.
  - Sans shader, 2560x1369 : 30,6 à 34,7.
  - Sans shader, 854x480 : 50,9, 1 % bas 23,3. Plafond processeur vu sur ce PC.
  - Sans Subtle Effects : 35,7 puis 32,7, dans le bruit de mesure. LOD 96 : pas de gain. Sans aucune entité : 30,7, pas de gain.
  - Sans shader, le GPU reste vers 45 % et le jeu occupe 6 à 7 cœurs : la limite vient alors du processeur ou de la présentation, pas de la carte graphique. Aucun mod seul ne domine dans 30 relevés de pile.
  - **Biais :** l'écran secondaire est branché sur la Radeon intégrée alors que le rendu se fait sur la RTX 3060. Ces chiffres sont donc peut-être pessimistes. Il faut mesurer sur l'écran principal.
  - **Correction :** les 45 à 55 FPS de la section 15 n'ont pas été reproduits (27 à 28 avec cette mesure, images réelles et monde neuf). Ne pas les réutiliser.
  - **Test invalide :** l'essai « génération DH coupée » n'a rien changé, le réglage visé n'existe pas sous ce nom. Il n'est pas à compter.
- **État :** index rafraîchi, mrpack non reconstruit, rien sur GitHub.

## 17. Mesures FPS sur l'écran principal (02/11, 02 h 20, avec l'accord de Mika)

- **Biais confirmé :** l'écran secondaire divisait fortement les FPS. Les chiffres de la section 16 pris sur cet écran ne décrivent pas le jeu réel.
- **Mesures, monde neuf, environ 190 entités chargées, 40 s, images réelles :**
  - Complementary d'origine, 2560x1369 : moyenne 42,3, médiane 47,6, 1 % bas 12,7, GPU 78 à 92 %.
  - Complementary d'origine, 1920x1080 : moyenne 55,2, médiane 62,5, 1 % bas 13,3.
  - Sans shader, 2560x1369 : moyenne 75,6, médiane 90,9, 1 % bas 22,7.
  - Complementary profil moyen, 2560x1369 : moyenne 47,9, médiane 55,6, 1 % bas 15,2.
  - Complementary profil bas, 2560x1369 : moyenne 45,8, médiane 55,6, 1 % bas 15,2.
  - Profil moyen avec ZGC générationnel : moyenne 50,6, médiane 58,8, 1 % bas 16,9. Écart dans le bruit, et l'activation de ZGC n'a pas été confirmée dans les journaux.
- **Lecture :** le profil bas n'apporte rien de plus que le moyen, donc au-delà d'environ 55 FPS la limite n'est plus la carte graphique. Les creux à 13-17 FPS existent avec et sans shader réduit : ils ne viennent donc pas principalement du shader. Leur cause reste à trouver. Le monde neuf charge encore des chunks, ce qui peut les aggraver, et une partie sur un monde déjà exploré n'a pas été mesurée.
- **Objectif de 60 FPS minimum sans saccade : non atteint. Aucun réglage du pack modifié pour les performances.** Hysteria Shaders n'a pas été mesuré. Tous les réglages de test sont restaurés.

## 18. Plus de coffres dans les bâtiments des villes (02/11, 03 h 15, demande de Mika)

- **Demande :** le manque de butin en ville désignait le nombre de coffres dans les bâtiments, pas seulement leur contenu. Les designs de l'arbre de quêtes sont traités dans le fil « Écrire le lore et les quêtes ».
- **Choix :** nouveau script `kubejs/server_scripts/atheria_coffres.js` plutôt qu'un réglage Lost Cities, car les coffres des bâtiments viennent de leurs modèles. Dans chaque chunk neuf de ville (facteur supérieur à 0,3), jusqu'à 4 coffres ou tonneaux : sol plein, deux blocs d'air, plafond à 6 blocs au plus, mur à côté, sans porte, escalier ni échelle contre le contenant. Tables : `lostcities:chests/lostcitychest` 60, `minecraft:chests/village/village_plains_house` 25, `create_fallout:chests/fallout` 15. Un seul chunk traité par tick.
- **Mesure :** environ 0,7 contenant par chunk de ville avant (157 pour 230 chunks, mesure antérieure du 02/11). Après, même monde pour les trois villes : 2,74, 1,81 et 1,83, soit 2,2 en moyenne (513 pour 236 chunks). Les deux mesures ne portent pas exactement sur les mêmes chunks.
- **Vérifié :** Lootr convertit bien un coffre ajouté, lu après rechargement (`lootr:lootr_chest`, table conservée). Deux captures montrent des coffres dans des pièces, posés contre un mur (`docs/coffre-ajoute-ville.png`).
- **Pas vérifié :** aucun coffre ajouté n'a été ouvert. Le contenu repose sur les tirages déjà mesurés pour ces tables. Le test a parcouru trois villes sur un monde, pas davantage.
- **Coût :** environ 3,8 ms par chunk traité, hors pic, sur le fil serveur. **Pic isolé non expliqué :** une commande `setblock` a pris 1,4 s dans le dernier test, et un appel 4,5 s dans le précédent (une seule occurrence par test). Il peut s'agir d'un ramasse-miettes ou d'autre chose : la cause n'est pas établie. Le retard du serveur pendant ces tests vient surtout de la génération des chunks (jusqu'à 37 s de retard en survolant).
- **Limite :** seuls les chunks neufs reçoivent ces coffres. Les zones déjà explorées d'un monde ne changent pas.
- **Méthode :** le premier test a échoué parce que `pauseOnLostFocus:true` met le jeu en pause sans le focus. Un script client temporaire le désactive pendant le test, et `options.txt` est restauré ensuite.
- **État :** script identique dans le pack, l'instance et le serveur, index rafraîchi, mrpack non reconstruit, rien sur GitHub.

## 19. Origine des saccades (02/11, 04 h 25, demande de Mika : traquer et choisir)

- **Erreur de méthode corrigée :** JFR (`settings=profile`) fausse fortement la partie. Avec lui, 45 s à environ 2 FPS au démarrage de l'enregistrement et un tick client médian de 30 ms. Sans lui, dans les mêmes conditions, tick médian de 7 ms et plus de rafale. La piste « tick de 30 ms » annoncée à Mika était donc fausse. JFR sert à voir ce que font les fils, pas à mesurer le temps des images.
- **Trouvé avec JFR, vérifié sans lui :**
  - Le serveur web local de KubeJS tourne en boucle sur `accept` : environ 0,8 cœur en temps système, pour un outil de développement. Inutile en jeu.
  - Distant Horizons occupe 4 fils à priorité normale, en concurrence avec le rendu sur une machine à 80-97 % de charge.
  - Pauses GC de 50 à 130 ms, environ une toutes les 5 s, G1 par défaut. Elles expliquent les pires images isolées, pas le reste. Le tas vivant est d'environ 4 Go sur 8 Go alloués.
  - Attentes de verrous du fil de rendu négligeables (38 ms en 55 s).
  - Mémoire vive utilisée à 13,4 Go sur 13,9 pendant la partie, fichier d'échange à 1,9 Go. Effet sur les saccades non mesuré.
- **Choix :** `kubejs/config/web_server.json` `enabled: false` (pack, instance, serveur). `DistantHorizons.toml` `numberOfThreads` 4 à 2 et `threadPriority` 5 à 1 (pack et instance, le serveur garde ses valeurs). Conséquence attendue : les LOD lointains se remplissent moins vite. Vitesse non mesurée.
- **Mesure, sans JFR, écran secondaire, monde déjà généré, 960x540, sans shader, 2 min, une seule série chacune :**
  - Avant : moyenne 44,0, médiane 50,0, 1 % bas 17,9, images de plus de 50 ms 76, de plus de 100 ms 18, tick client moyen 9,8 ms.
  - Après : moyenne 71,8, médiane 83,3, 1 % bas 32,3, images de plus de 50 ms 23, de plus de 100 ms 2, tick client moyen 6,9 ms.
- **Écran principal avec l'accord de Mika, Complementary, monde neuf, sans JFR, 2 min, une seule série chacune :**
  - 2560x1369, anciens réglages : moyenne 33,5, médiane 35,7, 1 % bas 11,9, images de plus de 50 ms 206, de plus de 100 ms 20.
  - 2560x1369, nouveaux réglages : moyenne 40,4, médiane 43,5, 1 % bas 17,5, de plus de 50 ms 82, de plus de 100 ms 13.
  - 2560x1369, nouveaux réglages, profil moyen : moyenne 43,9, médiane 47,6, 1 % bas 17,9.
  - 1920x1080, nouveaux réglages : moyenne 44,2, médiane 50, 1 % bas 18,2.
  - 1920x1080, nouveaux réglages et Subtle Effects allégé : moyenne 47,2, médiane 52,6, 1 % bas 19,2, de plus de 100 ms 14, pire image 164 ms au lieu de 479.
- **Limite des comparaisons :** les anciens réglages mesurés ici font moins bien que la section 17 (42,3 de moyenne), avec une autre fenêtre de mesure. Les écarts d'une série à l'autre sont donc importants, et les gains ci-dessus restent des ordres de grandeur.
- **Ce qui bloque encore :** en 1080p la carte graphique tourne entre 30 et 90 %, à 82-87 °C, et le fil de rendu occupe environ 95 % d'un cœur. La limite vient donc surtout du processeur. Répartition du temps Java de ce fil en régime stable : rendu du monde 58 %, tick client 35 %, entités 26 % dont 16 % dans la passe d'ombres, Subtle Effects 12 %, Particle Rain 7 %. Le temps passé dans le pilote graphique n'apparaît pas dans ces échantillons.
- **Subtle Effects :** `BiomeEffectsManager.tick` occupait 8 % de ce temps. `environment.toml` : `mushroomSporeDensity`, `pollenDensity`, `sculkDustDensity` à 0, et les trois `GeyserSpawnChance` à 0 (pack et instance). Les spores, le pollen, la poussière de sculk et les geysers de ces effets disparaissent. Gain mesuré sur une seule série, proche du bruit.
- **Objectif de 60 FPS minimum avec shader lourd : non atteint.** Saccades réduites, pas supprimées : environ 14 images de plus de 100 ms en 2 min. Hysteria Shaders n'a pas été mesuré.

## 20. Publication de la 1.0.5 (02/11, 05 h 20, demande de Mika)

- **Trouvé avant publication :** les designs des 13 chapitres et le carnet en forme de livre n'étaient que dans l'instance. Ajoutés au pack : `kubejs/assets/atheria/textures/quetes/`, `kubejs/assets/ftbquests/`, `config/ftbquests/quests/`, `atheria_campagne.js`. Quêtes et campagne aussi copiées dans le serveur. Les marqueurs `kubejs/config/atheria_touches*.json` restent exclus, sinon la table de touches ne s'appliquerait pas chez les joueurs.
- **Jeton retiré :** `web_server.json` contenait un jeton `auth` du serveur web local de KubeJS. Vidé dans les trois copies. Le serveur web est coupé, et le jeu démarre avec ce fichier.
- **Test de démarrage :** 3/3, 5/5 et 8/8 scripts KubeJS sans erreur, monde chargé. Le carnet n'a pas été ouvert à la main et les touches n'ont pas été pressées.
- **Fichiers :** `pack.toml` en 1.0.5, `Atheria-Zombie-Edition-1.0.5.mrpack` (17,6 Mo), `pack.zip` (800 fichiers).
- **Publié :** commit 62f0b06 sur `main`. `pack.toml` en ligne en 1.0.5. Installation depuis GitHub dans un dossier vide : 795 fichiers sur 795, 172 mods, 26 images de quêtes, coffres et réglages présents. Mise à jour depuis la 1.0.4 et Modrinth App non testées.
- **Serveur Minestrator :** pas encore mis à jour.

## 21. Crash d'un bêta-testeur : Thirst Was Taken contre Jade (02/11, 07 h 30)

- **Rapport :** https://mclo.gs/z9x58Yq, `MixinFluidView` de Thirst Was Taken 2.1.5 en échec (« Scanned 0 target(s) ») quand Jade charge `FluidView`, en lisant le contenu fluide d'un bloc visé.
- **Cause :** Thirst redirige un appel dans `FluidView.readDefault`. Jade 15.10.6 a séparé cette méthode en deux surcharges, et l'appel visé n'est plus dans celle que Thirst sélectionne. Jusqu'à 15.10.5, il n'y a qu'une méthode. Thirst 2.1.5 est sa dernière version 1.21.1 sur Modrinth.
- **Reproduit :** charger `FluidView` avec Jade 15.10.6 donne la même erreur. Avec 15.10.5, la classe se charge sans erreur.
- **Correction :** Jade 15.10.5 (Modrinth `yd8FKCmx`) épinglé dans le pack, jars remplacés dans l'instance et le serveur. Aucun mod du pack n'exige plus récent (Create Food demande 15.0.0 ou plus).
- **Pas testé :** viser un vrai réservoir en jeu, le test charge seulement la classe. Non publié : la 1.0.5 en ligne contient encore Jade 15.10.6.
- **Non retenu pour l'instant :** réglage du GC, car les arguments Java ne sont pas transportés par le mrpack : ils ne concerneraient que l'instance de Mika.
- **État :** index rafraîchi, mrpack non reconstruit, rien sur GitHub.

## 22. Retours bêta pour la prochaine version (02/11, 08 h 50, demande de Mika, décisions déléguées)

**Rien n'est publié.** La version en ligne reste la 1.0.5 ; `pack.toml` passera en 1.0.6 à la publication. Le correctif Jade de la section 21 est inclus.

**Interface.** BetterF3. Figure de santé en haut à droite, réduite à 60 % par un petit mod maison (`outils\atheria-monde-mod`), affichée 5 s après un changement de santé (`visibleDurationTicks = 100`). HUD Immersive Vehicles masqué par défaut. Le corps complet (First-person Model) est coupé le temps d'un trajet en véhicule, et un rappel des touches s'affiche à la première montée. Quick Waypoint libéré.

**Touches ajoutées** (`atheria_reglages.js`, une seule fois par installation) : roulade et chute amortie sur Verr. Maj, course sur les murs et accroche sur Alt, arbre ParCool sur F10. L'esquive et le ramper de ParCool sont libérés, car ils doublaient Combat Roll et TaCZ.

**Structures retirées.** When Dungeons Arise, Dungeons and Taverns, Moog's Voyager, ATi Structures, YUNG's Better Dungeons, Strongholds, Nether Fortresses, Desert Temples, Jungle Temples, Ocean Monuments et Witch Huts. Dans `sparsestructures.json5`, 37 ensembles fantaisistes sont coupés. Les strongholds passent par un tag de biome vide, Sparse Structures ne sachant pas les couper.

**Villes et villages.** Le filtre du mod maison refuse toute structure de surface dans une ville et tout village à moins de 14 chunks d'une ville. Testé d'abord à 20 chunks : 35 % du monde restait éligible, et les villages devenaient trop rares. Villages plus fréquents (`minecraft:villages` 0,4, Repurposed 0,5), Towns and Towers et Better Villages ajoutés, tags de biomes des villages étendus aux biomes moddés. Mesuré avant le dernier réglage : 2 villages sur 8 km², dont une moitié d'océan, 17 % des structures de surface refusées. **Densité finale des villages non remesurée.**

**Dinosaures.** Les listes ne visaient que les biomes vanilla, absents d'un monde Terralith et Biomes O' Plenty : c'était la cause. Passées sur les tags de biomes, poids 6 pour les herbivores, 2 pour les carnivores, 1 pour le T-Rex et les prédateurs marins. Vus sur 5 points sur 5, 2 à 13 individus dans 128 blocs. Le T-Rex est apparu sur 2 points sur 5 : à surveiller. Animaux de ferme et neutres ajoutés sur les biomes terrestres : 7 à 21 passifs (dinosaures compris) contre 29 à 73 hostiles après une minute.

**Jeu.** Combat Roll, ParCool. Blessures : vignette, flou et FOV de douleur coupés, sang réduit, bandage 9 s par soin au lieu de 18, pansement 11 s au lieu de 22, sommeil 15 %. Armures militaires (Military Armors), masques à gaz, grenades, molotov, C4, mines (LesRaisins, Tactical Breaching, Landmines ; mines fantaisistes sans recette).

**Bruit** (`atheria_bruit.js`) : tir 48 blocs, silencieux 12, explosion 64. Sur plateforme, 4 mobs sur 4 (2 vanilla, 2 Spore) passent de 25 à 1-8 blocs en 8 s. Testé en appelant la fonction : **un vrai tir de joueur n'a pas été testé**.

**Dimensions.** Voyages vers le Nether et l'End bloqués (testé) et portails bloqués (non testé). Recettes Overworld : tige de blaze, glowstone, quartz, obsidienne pleureuse, larme de ghast, verrue, perle, débris de netherite, brûleur Create. Table `raretes` dans les coffres.

**Ambiance.** Musiques vanilla sombres uniquement (`kubejs/assets/minecraft/sounds.json`), sons équilibrés, Windy, Distant Thunders, Smooth Player Animations, Custom Player Animations, Explosive Enhancement. Shader Complementary Unbound réglé post-apo, actif par défaut sur les nouvelles installations. Écarté : ProtoManly's Weather (alpha, lourd), Music and Melody (235 Mo), Project Explosive (bêta).

**Quêtes.** Fonds et deux quêtes d'exploration du fil lore copiés dans pack et serveur.

**Mesures.** Écran principal, 2560x1369, Unbound : 52 FPS en moyenne, médiane 55,6, 1 % bas 22,2, une seule série. Pour mémoire, Reimagined : 47,2 / 52,6 / 19,2, autre monde. Tick serveur 23 ms en moyenne pendant la mesure, donc un peu au-dessus des 20 ms d'un serveur à 20 TPS : à surveiller. Serveur dédié démarré et client connecté sans erreur nouvelle.

**Non vérifié en jeu.** Conduite d'un véhicule (HUD, vue, rappel des touches), figure disparue après 5 s en mode survie, parkour et roulade, port des armures et leur effet contre les balles, lancer des grenades, écoute des musiques et des sons, rendu des animations, tir réel.

**Marqueur de touches.** Dans l'instance de Mika, `atheria_touches_v2.json` est déplacé : la restauration d'`options.txt` par mes tests avait annulé la table de touches. Elle sera réappliquée une fois au prochain lancement.

## 23. Cohérence, FA Player, biomes et performances réelles (02/11, jusqu'à 18 h 30, demande de Mika)

Rien n'est publié : tout attend le signal de Mika, le pack reste en 1.0.5.

**Correction d'un chiffre annoncé.** Les « 69 puis 79 FPS » donnés à Mika dans la matinée ne valent pas pour une vraie partie. Ces séries affichaient 2,3 ms de tick serveur et 1,4 ms de tick client, contre 15 ms et 6 ms dès que la horde poursuit vraiment le joueur. Je soupçonne un joueur resté mort dans le monde de test, sans pouvoir le prouver : la reproduction volontaire donne bien un serveur à 2,4 ms, mais 39 FPS et non 79. Les chiffres ci-dessous remplacent ces séries et rejoignent la mesure de la section 22 (52 FPS).

**Mesures fiables.** Écran 2K (2560x1369), Unbound, une série de 2 minutes par ligne, RTX 3060 portable. Course, sauts et balayages de caméra de 20 à 60 degrés par tick dans une ville.

| Scène | Réglage | FPS moyen | Médiane | 1 % bas | Bloc max |
| --- | --- | --- | --- | --- | --- |
| Horde 120 | Pack actuel | 51,4 | 58,8 | 21,7 | 168 ms |
| Horde 120 | Sans Distant Horizons | 66,1 | 76,9 | 26,3 | 182 ms |
| Horde 120 | Sans shader | 85,7 | 100 | 33,3 | 200 ms |
| Horde 120 | Distance de rendu 6 | 53,4 | 58,8 | 24,4 | 496 ms |
| Horde 120 | LOD 128, qualité basse | 53,8 | 62,5 | 22,7 | 1229 ms |
| Horde 60 | Pack actuel | 55,7 | 62,5 | 22,2 | 679 ms |
| Horde 60 | Sans Distant Horizons | 67,1 | 76,9 | 28,6 | 117 ms |
| Horde 60 | 1080p | 70 | 83,3 | 29,4 | 128 ms |
| Route 20 m/s | Pack actuel | 74,3 | 90,9 | 28,6 | 1580 ms |
| Vol 50 m/s, terrain neuf | Pack actuel | 70,4 | 90,9 | 20,4 | 1411 ms |
| Vol 50 m/s, terrain neuf | Sans Distant Horizons | 100,3 | 125 | 41,7 | 2452 ms |

**Objectif non atteint.** 60 FPS constants ne sont pas tenus en 2K dans ces scènes. Les 1 % les plus lents restent à 33 FPS même sans shader, donc le processeur et les mobs comptent aussi.

**Sans effet mesurable (horde 120, 2K).** Le LOD d'animations EMF, les ombres de mobs, les lucioles, FA Player (32,7 contre 34,5 FPS dans une même période lente), mes trois mixins clients (47 et 45,6 contre 46,7 et 46,4), mes retraits de monstres. La portée de Distant Horizons (96 à 192) et ses options de rendu ne changent presque rien : son coût semble fixe. Le SSAO et les rayons de lumière coupés ne donnent que 2 à 3 FPS (44,4 contre 41,7).

**Baisse du shader annulée.** Les réglages ajoutés plus tôt (ombres, rayons, nuages) ne gagnaient rien dans la vraie scène : 51,7 FPS sans eux, 51,4 avec. Ils changeaient visiblement les nuages. Je les retire : Unbound revient au réglage que Mika aime.

**Bruit de mesure.** La même configuration a donné 51,4 puis 39,9 FPS à une heure d'écart, et une longue période lente a été observée vers 12 h 40 à 13 h 35. Cause inconnue : ni batterie ni bridage thermique du GPU ni processus visible au relevé. Les petits écarts de ce tableau ne sont donc pas significatifs.

**Limites.** Route et vol sont simulés par téléportation : ils chargent le terrain à la bonne vitesse, sans véhicule MTS réel. En solo, le PC génère aussi le terrain : le serveur intégré monte à 50 ms par tick sur route et 80 à 120 ms en vol, d'où les blocages de plus d'une seconde. Sur serveur dédié, cette génération ne pèse plus sur le PC du joueur, mais je ne l'ai pas mesuré.

**Choix laissé à Mika.** Sans Distant Horizons, l'horizon devient un mur de brume à environ 8 chunks (captures envoyées dans le fil). Je recommande de le garder et de conseiller le 1080p à qui veut plus de fluidité.

**Dinosaures.** 23 espèces par habitat, biomes vanilla, Terralith et Biomes O' Plenty. Poids relevés deux fois à la demande de Mika : herbivores à 6-10, prédateurs à 2-5. Monde neuf, graine 777, 12 points : 25 dinosaures, aucun terrestre en mer. Trois points de terre sur six restent sans dinosaure, et un en compte 11. Le parasaurolophus domine (11 sur 25). Espèces de mer inchangées : coelacanthe 3, dunkleosteus et mosasaure 2. `kubejs/data/minecraft/tags/block/animals_spawnable_on.json` autorise sable, terracotta, terre stérile, podzol, boue et pierre.

**Biomes fantastiques retirés (décision de Mika).** Absents de la génération d'un monde neuf (vérifié dans la source de biomes).
- Terralith : `skylands_*`, `mirage_isles`, `warped_mesa`, `amethyst_*`, `moonlight_*`, remplacés dans `kubejs/data/minecraft/worldgen/multi_noise_biome_source_parameter_list/overworld.json`. Les `skylands_*` occupaient des zones de mer : les remplacer par `meadow` amenait des dinosaures terrestres au large, ils deviennent donc des océans profonds. Aucune île flottante aux endroits vérifiés.
- Biomes O' Plenty : `auroral_garden`, `crystalline_chasm`, `fungal_jungle`, `glowing_grotto`, `jade_cliffs`, `mystic_grove`, `ominous_woods`, `origin_valley`, `wintry_origin_valley`, `snowblossom_grove`, via `config/biomesoplenty/biome_toggles.json`.
- Gardés par choix : `lavender_*`, `painted_mountains`, `scarlet_mountains`, à soumettre à Mika.

**Décisions de Mika sur le contenu.**
- Retirés : Smooth Player Animations, CPA, Mowzie's Mobs, Friends & Foes, structures fantastiques de Structory Towers, shaders Hysteria et Complementary Reimagined (rangés dans `outils\shaders-retires`).
- Remis : What Are They Up To, CoroUtil, 3D Skin Layers, tous les monstres vanilla. `retire_monstres.json` supprimé. Les phantoms restent coupés (`doInsomnia`).
- Gardés sans changement : Essential, boussoles, Chipped, WorldEdit, Emotecraft, Guard Villagers, Supplementaries, objets Spore.
- WorldEdit « pour les admins » : je n'ai pas vérifié les permissions sur un serveur. À tester avec un joueur non opérateur.

**FA Player v1.1 retenu.** Il remplace Smooth et CPA, et s'active une seule fois via `atheria_reglages.js`. `AnimationsJoueur.java` et `RenduJoueurMixin` lui retirent les bras quand une arme TaCZ est en main, et tout le corps pendant Better Combat, Combat Roll, Emotecraft et ParCool. Armes et coup d'épée vérifiés sur captures. Parkour et roulade non vérifiés en jeu réel.

**Bandage.** `SonSoinMixin` empêche le son de boucler. Le mixin se charge sans erreur, mais je ne peux pas confirmer à l'oreille.

**Skin en partie.** Bouton APPARENCE sous le menu pause : le clic ouvre la garde-robe d'Essential et sa fermeture revient au jeu (testé). Son dernier recentrage de 24 unités n'a pas été revu en image. La garde-robe garde sa boutique.

**Tests finaux.** Serveur dédié et client : `MikaMsaa joined the game` sur la version finale. Mondes de test et captures supprimés, les quatre mondes de Mika intacts. `enableShaders=false` reste dans l'instance, tel que Mika l'a laissé : Unbound est à réactiver à la main.

**Effet secondaire noté.** Les mods remis coûtent environ 10 % (41,7 contre 46 FPS dans une même scène), à relativiser par le bruit de mesure.


## 24. Publication de la 1.0.6 (02/11, 23 h 25, demande de Mika)

**Publié sur `main` de `MikaMsaa/atheria-pack` : commit `847da89`, sur accord de Mika (« Publie la maj »).** Distant Horizons reste dans le pack, Mika n'ayant pas demandé son retrait.

**Panne sur la première mise en ligne.** Le commit `14ad289` n'installait rien. `resourcepacks/fa-player-extension.pw.toml`, que j'avais créé, commençait par un BOM UTF-8. `packwiz refresh` et `packwiz mr export` l'acceptent, mais `packwiz-installer` s'arrête sur `ParseError`. La mise en ligne a duré environ 8 minutes. Pendant ce temps, `atheria-maj.bat` laissait démarrer le jeu avec les fichiers déjà installés, et une installation neuve ne recevait rien. Fichier réécrit sans BOM, aucun autre `.toml` n'en contient.

**Vérifié depuis GitHub sur `847da89`.**
- Installation neuve côté client : code 0, 852 fichiers, les 176 mods de l'instance, aucun en plus ni en moins.
- Passage réel de la 1.0.5 (`62f0b06`) à la 1.0.6 : code 0, les mêmes 176 mods, plus aucun fichier retiré.
- Installation côté serveur : testée seulement en local avec `packwiz serve`, code 0, 808 fichiers.

**Limite pour les joueurs déjà installés.** `options.txt`, `config/iris.properties` et `config/DistantHorizons.toml` sont en `preserve = true`. Ils gardent donc leurs réglages, dont 2 fils pour Distant Horizons au lieu de 1. Mes mesures ne montrent pas d'effet de ces options sur les FPS.

**Non testé.** La mise à jour dans le Modrinth App et le lancement du jeu à partir de ces dossiers installés. Le jeu complet a été lancé sur l'instance et le serveur locaux, dont le contenu correspond (section 23). Minestrator n'est pas mis à jour.

## 25. Grottes, guide en jeu, vues, aide au vol et BetterF3 (03/11, demande de Mika, pas encore publié)

**Rien n'est publié.** `pack.toml` reste en 1.0.6, le mrpack n'est pas reconstruit, GitHub n'a pas bougé. La publication attend le signal de Mika.

**Grottes.** Ajout de Subsurface, Simple Structures Caves, Collapsing Caves. Subsurface ne visait que les biomes vanilla, donc il apparaissait peu dans notre monde : ses listes de biomes sont étendues à Terralith et Biomes O' Plenty (`kubejs/data/subsurface/tags/worldgen/biome/has_cave_biome/`). Comptage sur 169 chunks neufs, dans deux zones différentes : 9 grottes avant, 35 après. Contrôle sous terre : herbe et feuillage (forêt, taïga), glace (taïga, zone de glace), mycélium et champignons géants (fongique), boue et argile (marais), sable (désert), mousse et azalée (jungle). Les structures de grottes `pv` (20) se trouvent aussi. Deux tables de butin `pv` au vieux format sont corrigées.
Éboulements réglés doucement dans `config/collapsingcaves.conf` : chance 900, 30 min entre deux, 5 s d'alerte.

**Mécaniques de mine** (`atheria_mines.js`, testées sur 3 300 blocs cassés) : filon riche 1 chance sur 40 sur les minerais, casier oublié 1 sur 600, poche de gaz 1 sur 250 sous le niveau 0. Le gaz empoisonne sans masque (vérifié avec et sans masque) et explose près d'une flamme : 20 à 3,27 de vie au centre, sans armure.

**Guide.** Un livre Patchouli en français, 7 chapitres et 22 sujets, avec images de touches et une photo de grotte. Il s'ouvre avec F4, le bouton GUIDE du menu pause, le bouton « ? » de l'inventaire en survie et `/guide`, et il est donné à la première connexion. Les 22 pages ont été ouvertes et capturées sans défaut d'affichage. Les livrets de voiture et d'avion de MTS ouvrent maintenant ce guide (vérifié après correction : le serveur rouvrait l'ancien livret par-dessus).
Différence avec ce que j'avais annoncé : le guide de ParCool n'est pas remplacé, il est gardé et traduit en français (34 pages), ce qui est plus simple et garde ses illustrations.

**Aide au vol.** En montant dans un engin, le chat affiche une seule fois par session le rappel adapté : voiture, avion ou hélicoptère. Vérifié sur Bell 47G, MC172 et Mustang. Le premier test a trouvé un vrai défaut : le siège ne connaît son véhicule que quelques ticks après la montée, tout était donc pris pour une voiture ; corrigé. L'hélicoptère se remet à plat quand on lâche les commandes (`heliAutoLevel`). Le nom brut « entity.mts.builder_existing » affiché en visant un véhicule devient « Véhicule ».

**Crash trouvé pendant les tests.** Téléporter loin un joueur assis dans un véhicule fait planter le serveur (`Entity is already tracked`, défaut de MTS : le siège ramène le joueur pendant le déchargement du chunk). `atheria_vehicules.js` fait descendre le joueur avant `/tp` et `/teleport`. Crash reproduit avant, plus de crash après. Seuls les administrateurs étaient exposés.

**Vues.** First Person Model : mains vanilla pour tous les objets et pas de flèches plantées dans le corps ; il reste coupé en véhicule. Épaule : caméra à gauche façon The Last of Us (`offset_x -0.85`, `offset_y 0.1`, `offset_z 2.3`), rapprochée à la visée. Le pseudo d'Essential au-dessus de sa propre tête est coupé, une seule fois chez les joueurs déjà installés.

**BetterF3.** Mesuré en 2560x1440, shaders actifs, sans limite de FPS, 3 alternances de 10 s comparées aux phases sans F3 voisines, dans une scène simple :

| Affichage | Écart moyen |
|---|---|
| BetterF3 d'origine | -3,8 FPS sur environ 65 |
| BetterF3 réduit (FPS, coordonnées, lieu, système, sans ombre ni animation) | -1,3 FPS |
| F3 vanilla | +0,3 FPS, soit rien de mesurable |

Le bruit est de l'ordre de 3 FPS, donc l'écart du réduit n'est pas franchement distinct de zéro. La version réduite est livrée dans `config/betterf3.toml`. Je n'ai pas reproduit une perte « énorme » : une ville dense, où le coût peut être plus élevé, n'a pas été mesurée. Une première mesure a été jetée : fenêtre en 854x480 et FPS qui montaient de 31 à 110 pendant le chargement.

**Contrôles finaux.** Serveur dédié démarré en 65 s, client connecté, 12 scripts serveur sans erreur. Aucun BOM dans les fichiers packwiz. Mondes de test, captures et scripts temporaires retirés ; `server.properties` restauré.

**Pas testé.** Le vol réel (je ne peux pas simuler les touches), F4 à la main (la fonction appelée est testée, pas l'appui), l'installation neuve de cette version par `packwiz serve` : elle sera faite juste avant de publier. Les manuels de modèle des packs (ex. `manual_skyhawk`) restent ceux d'origine.

**Laissé tel quel.** L'avertissement anglais de Distant Horizons sur le ramasse-miettes G1 s'affiche toujours dans le chat au lancement. J'ai essayé `showModCompatibilityWarningsOnStartup`, sans effet, et j'ai remis la valeur d'origine.

## 26. Guide interactif, ParCool, touches et fond d'écran (03/11/2026)

Demande de Mika du 03/11 à 09h10. Mes trois questions (plan de touches, priorité des mods, ParCool débloqué avec endurance conservée) ont d'abord attendu : j'ai avancé sur mes propositions. Mika a ensuite validé les trois : touches et mods prioritaires à confirmer en jeu, ParCool tout débloqué dès le départ. Rien n'est publié, `pack.toml` reste en 1.0.6.

**Fond d'écran.** `FondChargementMixin` remplace le panorama par le fond The Last of Us et retire le flou et le voile sur les écrans d'attente. Vu en jeu : chargement du terrain, sauvegarde du monde, lecture des données du monde. `ProgressScreen` affiché exprès en pleine partie laisse voir le monde derrière : ce cas n'existe pas en usage normal (pas de monde chargé à ce moment), je l'ai laissé.

**Guide.** Fini les livres : `GuideEcran` s'ouvre avec F4, le bouton GUIDE du menu pause ou le « ? » de l'inventaire. 12 chapitres, onglets « Résumé rapide » et « Tout comprendre » (TAB), recettes lues dans le vrai jeu, moteurs, sièges, roues, plein, personnalisation, clé, réparation. Patchouli est retiré du pack, de l'instance et du serveur, avec le livre généré ; `construire-guide.ps1` ne fabrique plus que la traduction ParCool.

**Animations.** Le moteur Ponder de Create sert de base : 13 scènes en français dans `AtheriaScenes` et `AtheriaPonder`, décors dans `generer-scenes.ps1`. Toutes vues image par image : parkour (4), véhicule (4), avion, hélico, soins (2), bruit des armes, gaz. Fermer une animation ramène au guide. Le véhicule des scènes est une maquette en blocs, pas le vrai modèle.

**ParCool.** Cause de « ne fonctionne pas » : `need_learning` activé et arbre de compétences. `config/parcool-server.toml` ouvre tout, endurance conservée. Vu en jeu : course rapide, glissade, ramper, rebord, roulade. Toutes les images de ParCool utiles sont dans le chapitre parkour (bloc `figure` avec icône, endurance, suspension, tyrolienne). Le guide ParCool n'arrive plus dans l'inventaire : `kubejs/data/parcool/loot_table/grant_parcool_guide.json` est vide. Vérifié sur un joueur neuf : carnet de l'histoire et livre de quêtes seulement. Les pages ParCool traduites ne parlent plus de compétences à débloquer.

**Touches.** Table `ATHERIA_TOUCHES_V3` : F roulade et chute amortie, Ctrl course, Alt ramper, V s'accrocher, C Cinematic Zoom, N échanger les mains, Y parler, TAB joueurs connectés (mixin : la liste s'affiche aussi seul), M carte du monde, Verr. Maj libre. Clé de désactivation de ParCool et réglage de caméra de Shoulder Surfing sans touche.

**Conflits de vol trouvés et corrigés.** Les touches MTS s'ajoutent à celles du jeu : J ouvrait les blessures en vol, K les emotes, B le sac, C activait le manche à la souris, Y changeait les volets en parlant. Nouveau : gaz et rotor sur flèches haut et bas, pivot sur flèches gauche et droite, volets H et O, frein au sol G, manche souris pavé -, klaxon voiture H. Guide, scènes et rappels mis à jour. Le bytecode de `ControlSystem` montre que `flaps_d` sort les volets : le guide avait le sens inversé, corrigé.

**Chat.** Filtre `atheria_chat.js` : plus de messages First Aid, Terralith, DH à l'arrivée dans les tests.

**Plantage isolé.** 14h46, client : `Config ClientConfigWrapper has not been registered` (Better Combat). `register` et `getConfigHolder` se suivent dans la même méthode, et le fichier `client.json5` a bien été écrit : course probable dans la table de Cloth Config pendant le chargement parallèle, non prouvée. 1 démarrage sur 39 journaux, disparu au relancement, pas de lien avec ces changements. Rien corrigé ; relancer suffit.

**Plantages de 10h42 et 10h46.** Mes tests : téléport d'un joueur assis, déjà traité en section 25.

**Contrôles.** Serveur dédié et client connecté sur mondes neufs, sans plantage. Aucun BOM dans les fichiers modifiés vérifiés. Mondes de test, captures et scripts temporaires retirés, `pauseOnLostFocus` restauré. `guide-serveur-minestrator.md` à jour.

**Pas testé.** Appuis réels au clavier (je ne simule pas les touches) : voler avec les flèches, C en voiture, F4. Vol réel. Installation neuve par `packwiz serve`, à faire avant publication.

**Reste ouvert.** `atheria:bidon_essence` est décoratif : les moteurs ne prennent que la lave dans ce pack, à décider. Les vraies photos de véhicules restent à faire si les maquettes ne suffisent pas.

## 27. Retours en jeu du 03/11 (soir) : mains, figures, skin, Truly Dark, Jade, Apparence, guide, araignées

Demande de Mika à 16h58, tout est local, rien sur GitHub, pas de nouveau mrpack.

**Mains en double.** First Person Model réaffichait les bras du corps en regardant vers le bas alors que la main vanilla restait là. `vanillaHandsMode` passe à OFF (arc, arbalète, trident, longue-vue et carte gardent la main vanilla) et `MainsDoublesMixin` coupe `lookingDown()`. Vu en jeu immobile, en course et en regardant vers le bas : une seule paire. Conséquence : un objet tenu se voit moins en regardant droit devant.

**Figures en vue subjective.** Les bras du corps restent hors du champ pendant le parkour. `FiguresPov` et `MainsFiguresMixin` dessinent une paire dédiée, placée par épaule et main dans l'espace caméra, avec entrée et sortie en douceur : s'accrocher, barre, se hisser, muret, poteau. Vu sur une vraie accroche et une vraie escalade. Le muret, la barre et le poteau n'ont été vus qu'en pose forcée. Pendant une figure l'objet tenu disparaît, arme comprise, à juger en jeu.

**Skin resté Alex.** Cause trouvée dans le journal de Mika : `Couldn't look up profile properties ... Read timed out`. Le jeu ne demande le profil Mojang qu'une fois au lancement. `ProfilRelanceMixin` relance toutes les 5 secondes, 12 fois au maximum. Vérifié en simulant la panne : profil perdu, puis récupéré après une relance.

**Tremblement.** Cause probable, pas prouvée : `CollapsingCaves` secoue l'écran pendant les effondrements, jusqu'à 120 secondes, et un arrêt perdu pourrait le rendre sans fin. `MotionSicknessMode = true` remplace la secousse par un message, dans le pack, l'instance et le serveur. Je n'ai pas reproduit le bug : à confirmer par Mika. Le message est sans doute en anglais, il est écrit dans le mod.

**Truly Dark.** Sans shaders, la nuit était encore claire les soirs de pleine lune : `ignore_moon_phase = true` et `increase_overworld_brightness = 0.0`. Vu : surface presque noire, mod bien actif. Le mod n'agit pas sur les shaders. Avec Complementary, les réglages sombres vont dans `shaderpacks/ComplementaryUnbound_r5.9.3.zip.txt` : `LIGHT_NIGHT_I=0.10`, `ATM_NIGHT_I=0.10`, `CAVE_LIGHTING=0`. Vu avec shaders : ciel sombre, salle fermée à une seule torche très sombre. Pas vu : la salle sans torche et le sol en extérieur après ce dernier réglage, le joueur de test tombait à travers un terrain pas encore chargé. Mika joue toujours sans shaders (`enableShaders=false`), ses réglages n'ont pas changé.

**Jade.** Il trace son propre rayon depuis la caméra et ratait des blocs en vue épaule ou avec Camera Overhaul. `JadeCibleMixin` reprend la cible du jeu quand il rate. Vu sur bloc et entité, à la première personne et à l'épaule. Plus discret : opacité 0,45, échelle 0,8, sans le nom du mod.

**Apparence.** C'est l'écran d'Essential. `ThemeApparence` repeint sa palette au démarrage : fonds bruns, accents ocre, 167 couleurs, sans toucher à ses classes. Capture vérifiée. Limites : le texte reste en anglais, les vignettes violettes de la boutique et les prix bleus viennent d'Essential. Si Essential change sa palette, l'écran garde ses couleurs d'origine sans plantage.

**Réglages des devs.** Nouveau `outils/aligner-reglages.ps1`, à lancer avant chaque publication : copie `options.txt`, Iris, Distant Horizons, Sodium, Xaero, Essential et les réglages du shader de l'instance vers le pack, retire `preserve` de ces fichiers et livre les marqueurs de touches pour que les anciennes tables n'écrasent rien. Retirés : sortie son et chemin absolu `config\hordes`. Micro et réglages vocaux non copiés, ils dépendent de chaque PC. **Quand le pack sera final : `outils\aligner-reglages.ps1 -Final`**, les joueurs gardent alors leurs réglages. Un fichier n'est renvoyé que si Mika l'a changé depuis la mise à jour précédente.

**Guide : vrais modèles.** `ModeleScene` lit les OBJ et textures directement dans les jars d'Immersive Vehicles et les affiche dans les scènes : Mustang avec roues et sièges qui se montent, Skyhawk avec hélice, Bell 206 avec rotor, pompe et établis. Les maquettes en blocs sont retirées, le muret est en pierre.

**Guide : personnages.** `Figurant` remplace le joueur fantôme. Trois causes de l'aspect étrange : FA Player réécrivait ses poses, les couches du skin étaient coupées, et il prenait la lumière du monde réel aux mêmes coordonnées, d'où la silhouette toute noire. Il porte maintenant le skin du joueur, pleine lumière, avec de vrais gestes (course, glissade, ramper, muret, accroche, se hisser, chute, roulade, assis, à terre, visée, soin). Vue de profil pour que rien ne le cache, AK dans la scène du bruit, infecté du mod Spore. 13 scènes tournées sans erreur et relues sur 3 images chacune, pas en mouvement continu.

**Araignées.** Nyf's Spiders 3.0.2 ajouté au client, au pack et au serveur. Vues en jeu avec leurs nouveaux modèles.

**Contrôles.** Serveur dédié et client connecté sur le monde de test : `joined the game`, pas de plantage ni de refus de mod. Aucun mixin en échec dans les journaux lus.

**Pas testé.** Appuis réels au clavier de Mika, installation neuve par `packwiz serve` (à faire avant publication), arrivée des réglages chez un dev.

**Reste ouvert.** Cause du tremblement à confirmer, `atheria:bidon_essence` décoratif, course Better Combat isolée de 14h46, question sur « Nouveau monde (1) » absent des sauvegardes.


## 28. Peur : accoutumance par type de mob (03/11, soir)

Demande de Mika à 17h13 : peur trop présente, elle doit s'estomper selon la fréquence des rencontres, le type de mob et le temps d'exposition. Local, rien sur GitHub, pas de nouveau mrpack.

**Ce que « peur » désigne : hypothèse à confirmer.** Aucun mod n'a d'effet nommé peur. J'ai retenu l'effet Madness de Spore : hallucinations, sons, « You are feeling watched... ». Dans le mod il vient du cri du Howler (3 minutes), de la tumeur (2 min 30), du Hivemind et de certains aliments. Frapper une créature de Spore en étant fou ajoute 1 minute, et un niveau supérieur se relance 10 minutes à la fin. Pas exclus : battement de cœur de Subtle Effects et First Aid, voile rouge de First Aid, visuels d'infection de The Hordes. Je n'ai pas modifié ceux-là.

**Système.** `kubejs/server_scripts/atheria_peur.js`, une fois par seconde et par joueur. Un mob hostile vu à moins de 24 blocs, en ligne de vue, compte pour son type. Revoir un type après 3 minutes sans le voir est une nouvelle rencontre : frayeur courte en Madness niveau 1 et un battement de cœur (son du Warden), dont le volume suit la durée. 60 secondes d'exposition habituent autant qu'une rencontre. La frayeur n'est jamais renouvelée pendant une même rencontre, même si le mob reste en vue. La mémoire est propre à chaque joueur, sans retour de la peur avec le temps.

| Type | 1re frayeur | Disparaît après environ |
|---|---|---|
| Rares (Proto, Wendigo, Ogre, Nexus...) | 20 s | 12 rencontres |
| Évolués Spore, dinosaures, folie sans mob en vue | 15 s | 8 rencontres |
| Infectés communs (`spore:inf_*`, The Hordes) | 10 s | 5 rencontres |
| Autres mobs hostiles | 5 s | 2 rencontres |

**Madness de Spore plafonnée.** Une folie trop longue ou de niveau supérieur est remplacée par la durée permise, niveau 1 : plus de 10 minutes ni de relance. Le lait n'est pas réappliqué. `"The mental damage dealt by hallucinations"` passe de 4 à 2 dans `spore-startup.toml`, dans les trois copies. Uneasy (dormir impossible après un cri) n'est pas touché. Le créatif et le spectateur sont ignorés.

**Bug trouvé par le test.** Une nouvelle rencontre pendant une frayeur en cours ne la prolongeait pas. Corrigé, second passage réussi.

**Test en jeu, monde jetable « ZZ Peur », aucune erreur de script.**
- Infecté commun, restant 2,5 s après chaque rencontre : 8,3 / 5,8 / 4,3 / 1,7 / 0,1 s, puis rien aux rencontres 6 et 7.
- Howler : 13,4 s restantes. Chevalier gardé en vue : 13,3 s, 3,2 s, puis plus rien à 22 et 32 s, l'habitude monte de 1,02 à 1,52.
- Folie injectée (180 s niveau 2) : ramenée à 12,5 s niveau 1. Deuxième injection (600 s niveau 3) dans la même rencontre : 9,9 s restantes. Rien après 16 s, donc pas de relance.
- L'habitude survit à la mort. En créatif, rien ne se déclenche.

**Pas vérifié.** Vrai cri d'un Howler (folie injectée avec les mêmes valeurs, mobs de test sans IA). Durée de 5 s des autres mobs seule : le squelette de test héritait de la frayeur du Howler, 9,8 s, seule son habitude a été lue. Le battement de cœur à l'oreille et le ressenti en jeu. Multijoueur sur serveur dédié.

**Propre.** Monde de test et dossier serveur temporaire supprimés, scripts de test retirés, script identique dans l'instance, le serveur et le pack.

## 29. Le bruit n'attire plus que les infectés (03/11, soir)

Demande de Mika à 17h20 : les tirs ne doivent attirer que les infectés, pas tous les mobs hostiles. Local, rien sur GitHub, pas de nouveau mrpack.

**Changement.** `atheria_bruit.js` filtre maintenant avec `bruitEstInfecte` : tout `spore:*` et tout `hordes:*` (joueurs zombifiés de The Hordes). Tirs et explosions passent par le même filtre. Le guide disait déjà « infectés », aucun texte à changer. `bruitEstHostile` reste pour `atheria_peur.js`.

**Décision à confirmer.** Les zombies, husks et noyés vanilla sont traités comme des mobs hostiles ordinaires : ils ne viennent plus au bruit.

**Test en jeu, monde jetable « ZZ Bruit », mob seul à 10 blocs.** Attirés : `spore:inf_human`, `spore:howler`, `hordes:zombie_player`. Pas attirés : zombie, squelette, araignée, creeper. Vraie explosion de TNT : l'infecté part vers le point d'explosion, le squelette ne bouge pas.

**Résultat à noter.** Un premier passage donnait 1 mob attiré pour les mobs vanilla, sans dire lequel. Le second passage liste les présents et donne 0, sans autre mob vivant à portée. Le filtre porte sur l'identifiant, donc l'explication probable est un infecté resté du tour précédent, non prouvée.

**Pas vérifié.** Un vrai tir d'arme : le test appelle la fonction d'attraction et déclenche une vraie explosion, le tir arrive au même filtre sans avoir été tiré ici.

## 30. Publication de la 1.0.7 (04/11)

Go de Mika à 20h20 UTC. `aligner-reglages.ps1` lancé (mode développement), `pack.toml` passé en 1.0.7, `Atheria-Zombie-Edition-1.0.7.mrpack` reconstruit, `pack.zip` de 932 fichiers envoyé pour publication sur GitHub. Contenu : sections 25 à 29.

**Contrôles avant envoi.** Installation neuve par `packwiz serve` : client et serveur en code 0, 180 mods côté client comme l'instance. Aucun chemin en antislash, aucun script de test. kubejs et quêtes identiques entre l'instance et le pack. Main vanilla OFF dans les deux.

**Écarts laissés.** `default_perspective` reste `SHOULDER_SURFING` dans le pack alors que l'instance est en `FIRST_PERSON` : le mod réécrit cette valeur tout seul (`remember_last_perspective`), ce n'est pas un choix de réglage. Micro et voicechat restent propres à chaque PC.

**Reste à faire.** Vérifier l'installation depuis GitHub après le commit. Mettre à jour Minestrator avec le guide serveur, toujours à faire par Mika.
**Vérification depuis GitHub (commit aee5782).** `pack.toml` en ligne en 1.0.7, hash d'index correct. Passage 1.0.6 vers 1.0.7 : code 0, 923 fichiers, 180 mods, les scripts de la peur et du bruit et `options.txt` identiques au pack. Installation neuve : 2 essais sur 3 échouent en code 1, le troisième réussit (923 fichiers). Chaque échec porte sur le même fichier, `config/xaeropatreon.txt`, réponse GitHub 501 pour l'installateur, alors qu'un téléchargement direct répond 200. Ce fichier fait 0 octet et 922 fichiers sur 923 sont déjà là, dont les 180 mods. Problème déjà présent dans la 1.0.6 par le contenu, l'intermittence n'y a pas été mesurée. Cause probable : le fichier vide, non prouvée.

**Correctif proposé, en attente de Mika.** Retirer `config/xaeropatreon.txt` du pack (le jeu n'en a pas besoin à l'installation, à vérifier) et traiter l'autre fichier vide `config/collapsingcaves_greeted`, puis répéter plusieurs installations neuves et publier une 1.0.8.

## 31. Publication de la 1.0.8 : installations neuves fiables (03/11, 20h35 UTC)

Go de Mika (« Corrige ça et publie »). `config/xaeropatreon.txt`, vide, sort du pack via `.packwizignore`. `config/collapsingcaves_greeted` n'est plus vide : le mod ne teste que son existence (`Files.exists`, lu dans son code), il ne change donc pas de comportement. Plus aucun fichier vide dans l'index. Commit aee5782 remplacé par 43f31b2.

**Vérifié depuis GitHub.** 6 installations neuves client sur 6 en code 0 (922 fichiers, 180 mods), là où 2 sur 3 échouaient en 1.0.7. Serveur en code 0 (878 fichiers, 138 mods). Passage de la 1.0.7 à la 1.0.8 en code 0, l'ancien fichier Xaero est bien retiré. La cause exacte du 501 reste non démontrée, mais le problème n'est plus observé après le retrait des fichiers vides.

**Pas fait.** Lancement du jeu sur ces installations neuves, seul l'installateur a été exercé. Minestrator toujours à mettre à jour avec le guide serveur.

## 32. Retours de Mika : guide, sons, nuit, peur, bruit, villes (05/11, non publié)

Tout est local, `pack.toml` reste en 1.0.8. Rien n'est sur GitHub, pas de mrpack.

**Guide.** Personnages et mobs marchent au lieu de glisser (jambes animées, freinage, coups). Montage du véhicule : capot ouvert pour le moteur, pièces en vert puis en rouge comme en jeu, roue par roue. Animation de la poche de gaz remise dans le bon sens. Texture manquante de ParCool corrigée (icône `grapple.png` inexistante, figure remplacée). Tête flottante corrigée (`Figurant.isSpectator`). Nouveau chapitre Dinosaures. Captures relues.

**Dinosaures.** Lu dans le code du mod, pas testé en jeu : on apprivoise seulement en faisant éclore un œuf, on ne chevauche aucun dinosaure. Les reptiles volants emportent leurs proies, le Microraptor se pose sur l'épaule. Ordres à main vide (errer, assis, suivre), inventaire en s'accroupissant sur un adulte à soi.

**Rugissements.** 741 sons sur 950 de Jurassic Reborn sont en stéréo, donc jamais spatialisés. `SonsDinosauresMixin` les passe en mono et applique un gain de 0,55. Chargement vérifié dans le journal du jeu. Le rendu à l'oreille reste à confirmer par Mika.

**Peur.** `atheria_peur.js` supprimé. `spore:madness` et `spore:uneasy` bloqués dans `atheria_spores.js` (les battements de cœur venaient d'Uneasy), Madness désactivé dans `spore-startup.toml`, `cameraSwayIntensity = 0.0` dans Camera Overhaul. Vérifié en jeu : les deux effets ne s'appliquent plus. Corrige l'hypothèse de la section 28.

**Bruit.** Zombie, husk, drowned et zombie villager comptent comme attirés (`BRUIT_ZOMBIES`). Vérifié : attirés = 1 pour ces quatre et `spore:inf_human`, 0 pour squelette, araignée, creeper. Le test appelle la fonction d'attraction, un vrai coup de feu n'a pas été tiré.

**Talkie.** Ajouté au kit de départ par le fil du lore, `prologue.snbt` copié vers pack et serveur, cité dans le guide.

**Villes et routes.** Profil `atheria.json` : `cityChance` 0,00025, rayon 48 à 448, réseau de routes avec cellules de 64 chunks. Cinq styles pondérés selon le biome (standard, métropole, banlieue, bourg, industrie), plus désert. Mesure sur la graine 12345, 600 x 600 chunks : 8,5 % de ville, 1,2 % de route, 81 taches de ville dont 12 grandes. Reliées à une route : 11 grandes sur 12, 16 moyennes sur 21, 9 petites sur 48, donc 36 sur 81. Avant : 1080 petites taches sur 800 x 800 chunks, 60 reliées, aucune grande. Routes vues en jeu sur 4 captures sur 7, voies surélevées qui traversent les villes (les 3 autres visent à côté). Le trajet complet d'une ville à une autre n'a pas été parcouru. Les petits bourgs restent souvent isolés, c'est une limite assumée. Un monde existant aurait des villes coupées à la frontière des nouveaux chunks : il faut un monde neuf, aussi sur Minestrator.

**Nuit avec shader.** Vraie cause : `ATM_COLOR_MULTS` et `LIGHT_COLOR_MULTS` étaient désactivés, donc `ATM_NIGHT_I` et `LIGHT_NIGHT_I` n'avaient aucun effet. Réglage retenu dans `ComplementaryUnbound_r5.9.3.zip.txt` : les deux multiplicateurs actifs, `ATM_NIGHT_I=0.05`, `LIGHT_NIGHT_I=0.20`, `CAVE_FOG=false`. Luminance moyenne mesurée sans shader (Truly Dark) contre avec shader :

- ville de nuit : 10,6 contre 11,9 (28,9 avant) ;
- grotte avec lave : 15,2 contre 25,7 (43 avant), l'écart vient de la lueur de la lave, le noir lointain est comparable ;
- nuit de pluie : 2,3 contre 5,3 ;
- jour : 115 contre 118,7, pas de perte.

Non mesuré : la torche en main, l'aube et le crépuscule, les phases de lune (`MOON_PHASE_DARK=0.30` reste actif avec le shader alors que Truly Dark ignore la lune, une nuit de nouvelle lune sera plus sombre).

**Génération et contenu.** Bilan et propositions dans le Claude Doc « Atheria : bilan de la génération et idées de contenu », en attente des choix de Mika.

**Rangement.** Monde de test `ZZ Film 32` retiré, `ZZ Villes 33` gardé pour que Mika puisse voir les villes. Index du pack actualisé, aucun fichier vide. La protection a bloqué une suppression de vieilles captures dans le dossier temporaire : rien n'a été contourné, elles y restent.

**Reste à faire.** Go de Mika pour publier, puis installations neuves depuis GitHub. Minestrator : voir le guide serveur.

## 33. Nouveau contenu : biomes, villes, structures, objets, mécaniques (05/11/2026, pas encore publié)

Demande de Mika du 05/11 : tout ce qui était proposé dans le Claude Doc, sauf les pièges à poissons, la tente, le matelas (Comforts existe) et les tempêtes. Meute de dinosaures rare sur les routes, Double Doors avec animation, plus de villes uniques (tailles, architectures). Tout doit marcher sans conflit. Un monde neuf est nécessaire.

**Mods.** Double Doors, Collective, Fields, Cinch's Abandoned Houses, Abandoned Watchtowers, Simply Traps, Trapper Pelts, Create Crafts & Additions, Pufferfish Skills. Animation des portes écrite dans `atheria-monde` (`PortesAnimees`, mixins `PorteChangeeMixin` et `PorteCacheeMixin`), Animated Doors étant inutilisable.

**Générateurs** dans `outils\contenu` : `generer-biomes.ps1`, `generer-villes.ps1`, `generer-competences.ps1`, `generer-structures-mods.ps1`, `synchro-contenu.ps1` (pack vers instance et serveur).

**Biomes.** Forêt calcinée, Zone contaminée, Terres agricoles à l'abandon, Marécage pollué, Plaine de cendres. Graine 12345, distance du centre : 530 m à 2,3 km, marécage 3,7 km (il était à 10 km, la mangrove n'était pas convertie et les basses terres humides ne basculaient pas assez).

**Villes.** 11 architectures en plus des 4 styles Atheria et de l'ancien : brique, béton, verre, terracotta, bois, rouille, gothique, moderne, haussmann, bidonville, garnison. Bâtiments propres : maison, barre, tour, villa, entrepôt, marché, église, plus hôpital, prison et base sur 2 x 2 chunks avec leur butin.

**Trois bugs de génération trouvés par les essais.**

1. Les poids de palette doivent atteindre 128, sinon toutes les nouvelles villes faisaient des erreurs de chunk.
2. Les grands bâtiments ne sortaient presque jamais : `correctstylefactor` à 0,8 exigeait 4 chunks sur 4 du même style. À 0,5, sur 3,5 x 4 km : 6 hôpitaux, 2 prisons, 1 base et environ 150 autres grands bâtiments du jeu de base. Les grands bâtiments d'origine sortent donc eux aussi bien plus souvent qu'avant.
3. Le remplissage `filler` d'un bâtiment doit exister dans la palette du style, une palette locale de part ne suffit pas : l'hôpital et la base plantaient leurs chunks dans `Doors.generateDoors`. Tous les bâtiments utilisent maintenant `#` et `}`.

Toits d'un seul tenant et une seule croix rouge sur l'hôpital. Un seul coffre par étage et par chunk dans les grands bâtiments (ils en avaient jusqu'à 3).

**Structures.** Garage, poste militaire, camp de réfugiés le long des routes, grange dans les terres agricoles. Bouchons de voitures et barrages posés sur les routes à la génération. Cinch : les maisons sortent en plaine, taïga et terres agricoles. Tours de guet : leur liste de biomes ne contenait plus grand-chose après le remplacement des biomes, elle est réécrite. Tour neuve retirée, elle ne colle pas à la DA.

**Objets.** Kit de siphonnage, bidon, pièces de véhicule, carte routière. Pièges via Simply Traps (8 recettes) et Trapper Pelts (piège à ours, 1 recette). Masque et filtres existants réutilisés.

**Mécaniques.** Bruit de moteur qui attire les infectés, air contaminé dans la zone, carburant rare, compétences (bricolage, médecine, tir), radio accroupi qui donne une ville, meute de dinosaures rare (chance 0,006 par minute sur la route hors ville, délai de 72 000 ticks).

**Touches.** La touche K était partagée entre les compétences et Emotecraft. Le menu rapide d'Emotecraft passe sur F7, une seule fois y compris chez les joueurs déjà installés (`atheria_touches_contenu.js`). Le passage se fait aussi dans l'instance de Mika, l'essai l'a déclenché.

**Résultats des essais en jeu (mondes jetables, graine 12345, 0 erreur de chunk et 0 erreur KubeJS au dernier passage).**

- Siphon : réservoir vers carrosserie, +1 bidon, usure 1. Bidon : réservoir du quad à 2000. Pièces : dégâts de 120 à 70.
- Moteur en marche : un infecté sans cible se rapproche de 7 blocs.
- Carte et radio accroupi : villes notées, tag `radio_ville` posé.
- Air : sans masque, poison après le délai de grâce. Avec masque et filtre, pas de poison, un filtre consommé, 230 s restantes.
- Compétence : tag posé par `puffish_skills skills unlock`. Meute : 2 à 4 ankylosaures selon les chunks chargés.
- FPS en altitude au-dessus des villes : 85 à 150, écarts selon le chargement. Pas une mesure de performance rigoureuse.

**Non vérifié ou partiel.**

- Tours de guet : blocs réels et 10 à 11 pièces lus côté serveur, mais je n'ai pas réussi à en cadrer une sur une capture.
- Prison : coffres et blocs lus côté serveur, pas de capture lisible.
- Poste militaire et grange jamais vus. Garage et camp vus uniquement avec la fréquence des structures forcée pour l'essai : leur fréquence réelle n'est pas mesurée, et leurs coffres n'ont pas été retrouvés par le balayage.
- Camp : tentes en cubes gris sur un socle de terre quand la route est en hauteur. Fonctionne, mais visuellement simple.
- Électricité « rare » : Crafts & Additions est présent (112 recettes), rien ne limite sa rareté.
- Quête liée à la radio : seul le tag `radio_ville` existe, aucune quête ne l'utilise.
- Une partie jouée réellement n'a pas été faite, ni le rendu du guide avec ses nouveaux chapitres, ni le fonctionnement des pièges, ni le serveur Minestrator.

**Rangement.** Mondes `ZZ Contenu 1` à `9` et mondes temporaires du serveur retirés. `ZZ Contenu 10` gardé pour voir le résultat, `ZZ Villes 33` toujours là mais généré avant ce chantier. Index du pack actualisé. `pack.toml` reste en 1.0.8, rien n'est publié.

**Reste à faire.** Retour de Mika en jeu, puis son go pour publier.

## 34. Bâtiments vitrine agrandis et contrôle automatique (06-07/11/2026, rien d'intégré)

**Demande de Mika.** Les bâtiments doivent être beaucoup plus grands et rester remplis de détails, sans enseignes de devanture. La villa moderne doit être la plus grande. Mika demande aussi une vérification minutieuse : orientation des chaises, blocs manquants, vitres, trous.

**Fait.**

- Grand HLM R+9 de 36 logements sur 2x2 chunks, et grande villa sur 2x2 chunks : captures dans `docs\vitrine-batiments\grands-1`.
- Villa moderne sur 48x48 (3x3 chunks) : garage, cinéma, cuisine, salon avec cheminée, suite, belvédère vitré, toit-terrasse avec jacuzzi, piscine de 25 blocs et jardin zen. Captures dans `docs\vitrine-batiments\grands-2`.
- Orientation des meubles Macaw vérifiée en jeu. Les canapés sont décalés d'un quart de tour et les placards de cuisine sont inversés. Une correction globale dans le constructeur règle les deux.
- Contrôle automatique après chaque bâtiment. Il cherche les trous dans les murs et les vitres, les cuvettes au sol, les blocs isolés, les portes et les lits incomplets, les sièges face à un bloc, et les blocs détruits par leurs voisins.
- Défauts trouvés et corrigés :
  - portes-fenêtres du HLM arrachées par les barricades ;
  - drapeaux décrochés ;
  - herbe posée sur du béton ;
  - feuille flottante ;
  - lanterne sans support ;
  - chaise face à un bloc ;
  - fontaine qui débordait ;
  - vitres retirées par la passe d'usure.
- Dernier passage : 0 défaut sur les trois bâtiments.

**Reste à faire.** Retour de Mika sur la villa moderne. Ensuite, agrandir les autres architectures (Haussmann, maison de ville, chalet, gothique, verre, rouille, bidonville, garnison). Puis faire plusieurs bâtiments différents par architecture, et seulement après les hôpitaux, la prison et la base. Rien n'entre dans `generer-villes.ps1` sans validation.

**Suite du 07/11 (section 34).** J'ai construit et envoyé deux architectures, sans aucun défaut au contrôle :

- L'immeuble haussmannien d'angle (`grands-3`) : R+5 avec combles et dôme, café et terrasse, pharmacie, porte cochère, cour, 60 pièces meublées et des chambres de bonne.
- La rangée de trois maisons de ville (`grands-4`) : une en brique, une à colombages et une en meulière, avec leurs jardins.

Le constructeur dispose maintenant de pièces génériques réutilisables (salon, salle à manger, chambre, cuisine, salle de bain, bureau, grenier). Leurs orientations sont calculées par rapport à la fenêtre.

Il reste le chalet, le gothique, la tour de verre, l'atelier rouillé, le bidonville et la garnison.

**Nuit du 07/11 (section 34, « Fais le reste »).** Les six dernières architectures ont maintenant leur grand témoin sur 2 x 2 chunks. Chacun passe le contrôle sans défaut sur la version entière. Les seules alertes restantes viennent des copies en coupe, où le plafond est retiré. Rien n'est intégré.

- Chalet forestier (`grands-5`) : soubassement en pierre et étage en bois, balcon filant, terrasse, foyer extérieur, 10 pièces dont 4 chambres.
- Manoir néo-gothique (`grands-6`) : 3 niveaux, 9 pièces, tour avec beffroi et flèche, porche, lucarnes, parc grillagé avec cimetière et mausolée.
- Tour de bureaux en verre (`grands-7`) : R+9 avec hall, open spaces, bureaux vitrés, salles serveurs, terrasse au 7e, toit technique, atrium vitré avec café.
- Atelier rouillé (`grands-8`) : halle en brique à toit en sheds, mezzanine de bureaux, pont roulant, machines, cheminée d'usine, camion à quai, conteneurs.
- Bidonville (`grands-9`) : 12 cabanes au sol et 5 perchées avec échelles, ruelles éclairées, potager, marché.
- Caserne (`grands-10`) : bâtiment R+1 avec armurerie, bureau, réfectoire et cuisine, dortoir à lits superposés, hangar à véhicules, mirador, guérite, tentes, champ de tir.

Corrections faites pendant les essais : un nom de fonction déjà pris (bidonville), un bureau mcw qui refuse l'orientation ouest, un escalier métallique sans appui, des lanternes accrochées à des chaînes horizontales et des caméras tombées dans des jardinières.

### Bourg forestier, exemple d'architecture par biome (07/11)
- Demande de Mika : des bâtiments différents pour chaque architecture, adaptés aux biomes et mêlés aux villes de The Lost Cities. Le bourg forestier sert d'exemple à valider.
- Le bourg contient une mairie avec campanile, une église avec clocher et cimetière, une place avec fontaine, kiosque, halle et aire de jeux, et une rue avec voitures, bus scolaire, abribus et barricade. S'y ajoutent deux maisons (bûcheron en rondins, maison à étage avec garage et sauna), trois commerces avec logement à l'étage (épicerie, boulangerie, café), une école, une auberge avec grange, et une scierie avec chaufferie et camion grumier.
- 1re construction : 6 défauts corrigés (trous dans le bûcher et les toilettes de jardin, lanterne du préau et cloche de l'auberge sans support, lierre dans le vide, trou dans le foin).
- 2e construction : 0 défaut sur les 8 bâtiments. Seules les vues en coupe gardent des luminaires sans plafond, c'est voulu.
- Captures : docs\vitrine-batiments\grands-11-bourg-forestier.
- La fenêtre du jeu de test s'ouvre maintenant sur l'écran secondaire et ne prend plus le focus.
- En attente : validation de Mika, puis les autres architectures et le rattachement aux biomes dans generer-villes.ps1.

### Quartier du désert (07/11)
- Le 07/11, Mika a validé le bourg forestier. Il demande maintenant une grande variété de bâtiments, chacun avec un design unique. Il veut l'ambiance d'une ville autrefois très animée puis laissée à l'abandon. Les voitures maquettes seront remplacées par de vrais véhicules MTS.
- Le jeu de test se lance maintenant en arrière-plan. Il ne prend jamais le focus ni la souris.
- Désert, savane et badlands, rangée nord :
  - une mission avec clocher-mur à trois cloches, nef, tribune et orgue, couvent, patio avec puits et oliviers ;
  - un hôtel de ville à patio à arcades, avec tour de l'horloge, guichets, archives, salle des mariages et salle du conseil ;
  - un souk de 11 échoppes avec une halle couverte d'une toile rayée et une fontaine sèche ;
  - un habitat en gradins de type pueblo, avec échelles, terrasses et fours.
- Rangée sud :
  - un motel avec 8 chambres, une piscine vidée, l'accueil et une caravane ;
  - une station-service avec auvent et pompes, une supérette, un garage avec pont élévateur et fosse, et un diner ;
  - le bureau du shérif avec ses cellules, un tribunal avec salle d'audience et une cour fermée ;
  - une oasis avec bassin presque asséché, palmeraie, treille, serre, château d'eau et théâtre de plein air.
- Entre les deux rangées : un boulevard avec un terre-plein planté de palmiers, des passages piétons, des feux, un abribus et des véhicules abandonnés.
- Corrections :
  - palmes et branches d'acacia mieux attachées ;
  - vitres manquantes rebouchées ;
  - cloche et tapis sans support retirés ;
  - échelle du château d'eau réparée ;
  - toile du souk complétée ;
  - feuillage des palmiers qui ne change plus de couleur selon le biome.
- Contrôle final : 0 défaut sur les 8 bâtiments. Restent seulement des marchandises posées au sol dans une échoppe et les lustres des vues en coupe, ce qui est voulu.
- Captures : docs\vitrine-batiments\grands-12-desert (planches 1 à 4).


## Quartier gothique (07/11)

- Pour les biomes de forêt sombre et de marais. Huit grands bâtiments de part et d'autre d'une rue pavée longée par un canal :
  - une cathédrale avec nef, abside en hémicycle, rosace, deux tours à clochers, arcs-boutants, tribune d'orgue et sacristie ;
  - un beffroi d'hôtel de ville avec horloges sur quatre faces, cloches, salle du conseil et guichets, devant une place à fontaine ;
  - quatre maisons étroites à pignon (apothicaire, librairie, taverne à colombages, horloger), chacune sur plusieurs étages meublés ;
  - un cimetière avec grille, chapelle-ossuaire, mausolées et tombes ;
  - un hospice en U avec pharmacie, réfectoire, dortoir, infirmerie, cellules d'isolement et cloître avec puits ;
  - une bibliothèque à mezzanine et charpente apparente, tourelles d'angle, jardin et observatoire à coupole ;
  - une darse avec péniche, barque coulée, grue, halle aux poissons et entrepôt de brique ;
  - un jardin d'hiver avec serre en verre et métal, kiosque à musique, étang avec passerelle et fausse ruine.
- Rue : canal avec quais, ponts en dos d'âne, réverbères, bancs, barricade, colonne d'affichage et voitures abandonnées.
- Corrections après le premier contrôle (13 défauts) :
  - sol manquant sous les murs et les portes de la cathédrale ;
  - escaliers intérieurs sans support ;
  - lanternes et toiles d'araignée suspendues dans le vide ;
  - portes de l'entrepôt sans sol ;
  - feuillage des palmiers de la serre mieux attaché.
- Contrôle final : 0 défaut sur les 8 bâtiments. Restent seulement des lanternes et toiles coupées dans les vues en coupe, ce qui est voulu.
- Captures : docs\vitrine-batiments\grands-13-gothique (planches 1 à 4).
## Quartier haussmannien et brique (07/11)

Quartier vitrine complet pour les plaines, forêts et rivières, construit en test sur 'ZZ Villes 33' (lots 19 à 27 du constructeur).

- Boulevard : platanes, terre-plein, lampadaires à deux crosses, colonne Morris, kiosque à journaux, abribus, passage piéton, 8 voitures maquettes, camion renversé, barricade de sacs, bouches d'incendie.
- Rangée nord : grand magasin R+4 (atrium sous coupole de vitrail, escalators croisés, ascenseur coincé, rayons par étage, salon de thé, pavillons à dôme de cuivre), deux immeubles de rapport R+5 (porte cochère, café avec terrasse, boulangerie, pharmacie, loge, 20 appartements meublés, chambres de bonne, cour avec atelier), gare (halle voûtée de verre, 3 voies, voiture verte, locomotive, wagon éventré, guichets, salle d'attente, horloge), opéra (cage de scène, rideau, fosse d'orchestre, parterre en gradins, loges, lustre, grand escalier, loggia, coupole de cuivre).
- Rangée sud : halles de fer et de verre (étals de poisson, boucherie, primeur, fleurs), cité HBM R+6 en brique (bow-windows, épicerie, laverie, local vélos, cour avec balançoires, toboggan, bac à sable, jardins ouvriers), square (bouche de métro et couloir effondré, fontaine sèche, fontaines Wallace, manège, guignol, statue de bronze), banque (portique, fronton à horloge, guichets, mezzanines, coin poste, chambre forte ouverte).
- Vérification : 5 passages. Deux erreurs de syntaxe, puis 9 défauts corrigés (lierre et herbe qui tombaient, roues du wagon, dôme, auvents troués, porte du coffre, viande suspendue). Audit final à 0, hors lustres des vues en coupe.
- Captures : `docs\vitrine-batiments\grands-14-haussmannien\` (34 vues et 4 planches). Trois vues ratées (café, intérieur de la halle de gare, manège) seront refaites au prochain passage.
- Plan détaillé des villes finales mélangées à Lost Cities rédigé dans un document à part, en attente des choix de Mika.
## Haussmannien v2 avec les blocs moddés (07/11)

- Même quartier rejoué avec une palette moddée : refends Chipped au rez-de-chaussée, pierre de taille nuancée, frises à la grecque aux 2e et 4e étages, pilastres cannelés, parquets Versailles et chevrons à tous les étages, briques longues Create Deco en bandeaux, verre serti à la gare.
- Appuis et corniches ajoutés automatiquement sous et sur chaque fenêtre de façade, jardinières Supplementaries sur une partie d'entre elles.
- Réverbères Macaw éteints, stores bannes rayés (café, boulangerie, pharmacie, grand magasin, épicerie), avancées d'auvents sur les étals des halles.
- Gare : voies et bogies Create, portes de train, tableau des départs Create, passerelle métallique au-dessus des voies, horloges Supplementaries.
- Banque : coffres-forts, piles de pièces d'or, de fer et de cuivre ; halles : jambons, poulets rôtis et cagettes Farmer's Delight ; boulangerie et salon de thé : gâteaux et bouteilles Create Food.
- Barricade du boulevard : barbelés en rouleaux et conteneurs couchés.
- Pièces des appartements complétées (globes, sabliers, tableaux noirs, poêles, paniers).
- Retirés après essai : statues Supplementaries (invisibles sans propriétaire), cultures sauvages sur terre labourée (elles tombent).
- Audit à 0 défaut (lustres isolés des vues en coupe exclus). Captures et 11 comparaisons avant/après dans docs\vitrine-batiments\grands-15-haussmannien-v2.
## Mods de decoration ajoutes (07/11)
- Ajoutes avec packwiz dans `pack\mods` (index rafraichi) : Macaw's Windows 2.4.2 (310 blocs : fenetres, volets, rideaux, stores), Macaw's Paths and Pavings 1.1.1 (315 blocs : paves, dalles, chemins), Handcrafted 4.0.3 (267 blocs : meubles, coussins, poteries, trophees). Resourceful Lib 3.0.12 etait deja present.
- Jars copies dans l'instance, empreintes sha512 verifiees. Lancement de test sur 'ZZ Villes 33' : aucun crash, aucune erreur liee a ces mods.
- Rien n'est pousse sur GitHub et le mrpack n'est pas reconstruit : en attente du feu vert de Mika.
## Haussmannien final avec les nouveaux mods (07/11)
- Meme quartier que la v2, avec : chaussee en paves Macaw (cobblestone, andesite, deepslate, mousse), passages pietons en diorite, trottoirs en dalles de pierre ; 99 volets (persiennes metal sur les immeubles et la banque, bois a persiennes sur la cite HBM, ouverts, fermes ou arraches) et 129 rideaux noues avec tringles ; lits a baldaquin et canapes Handcrafted a la place des lits et canapes simples ; vaisselle, pots, livres empiles dans les pieces.
- Les immeubles a balcons n'ont presque pas de volets : les balcons occupent la place, ce qui est conforme au modele parisien.
- Audit 0 (seules les vues en coupe laissent tomber 5 lanternes accrochees au plafond coupe). Captures `grands-16-haussmannien-final` (film73).
## Bourg forestier, desert et gothique en version finale (07/11)
- Les trois quartiers sont reconstruits cote a cote (decales de 128 blocs en z) avec la meme methode que le haussmannien final. Une detection automatique des facades exterieures pose les volets et les rideaux : 306 volets et 273 rideaux. On trouve des volets epicea au bourg, des persiennes acacia au desert et des volets chene noir au gothique.
- Les lits et canapes sont maintenant Handcrafted, dans le bois de chaque quartier. Les tables et bureaux recoivent de la vaisselle, des livres et des pots. Les trottoirs et les rues sont en paves Macaw : pierre au bourg, gres au desert, paves et dalles moussues au gothique.
- Premier passage : le gothique n'etait pas genere, car la zone n'etait pas chargee. Le forceload couvre maintenant les trois bandes. Le second passage est complet.
- Audit : il ne reste que des lustres et des toiles isoles dans les vues en coupe, ce qui est normal, et un petit trou de sol dans le souk (2,1,13) a verifier. Les captures sont dans `grands-17-bourg-desert-gothique-final` (film75, 97 vues). Quelques vues des coupes du bourg sont mal cadrees.