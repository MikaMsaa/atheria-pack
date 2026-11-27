# Test PC atheria_reglages 1.0.0 — 23/11/2026

Instance de test : `instances\Atheria-test-reglages` (copie d'Atheria sans saves, DH serveur, captures, logs, xaero). Monde : copie de ZZ Vehicules 5 (« ZZ Test Reglages 2 ») ; lieux_11 refusé (datapack de l'île). Instance Atheria normale non touchée, rien supprimé. Laissée à MaxMemAlloc=5632.

| Point | État | Preuve |
|---|---|---|
| Détection matériel | OK | RTX 3060 Laptop, 6144 Mo VRAM, Ryzen 7 5800H 8c/16t, RAM 14188 Mo, 2560x1440 144 Hz, portable |
| Profil de départ | OK | palier 2 (note 24) « RAM juste » ; shaders actifs (Complementary Unbound), DH actif 192, rendu 8 |
| Détection du manque de RAM (3072) | OK | « il en faut 4096 : relance automatique » |
| Relance automatique | **KO** | le jeu relancé meurt aussitôt (2 essais), essai1\jeu-relance.log |
| Bouton OPTIMISER | **KO visuel** | posé sur QUITTER, textes superposés (captures\01b) |
| Écran d'aide mémoire | non vu | aideMemoireVue=false |
| Jeu à 4096 Mo | **KO (OOM)** | bloqué à 100 %, tas plein, OutOfMemoryError (essai4-blocage) |
| Jeu à 5632 Mo + calibrage | OK | 9 pas, de 84 à 145 FPS, « calibrage terminé » en 2 min 20 s, pas d'exception du mod |
| Détection des réglages « à la main » | **faux positif** | NUAGES et SHADER_QUALITE marqués manuels sans qu'on les touche |
| Cohérence des niveaux | douteux | DH_DISTANCE : « baisse 4 -> 3 » alors que plafond = 2 ; instantané DH reste 192 |
| Encodage du json | défaut mineur | « Ã©cran », « calibrÃ© » |

## Calibrage (fenêtre 854x480, pas maximisée)
Pas 1 : 84 FPS -> OMBRES_ENTITES 1->0 ; 2 : 100 -> PARTICULES 2->1 ; 3 : 111 -> MELANGE_BIOMES 2->1 ; 4 : 108 -> DH_QUALITE 2->1 ; 5 : 125 -> DH_DISTANCE 4->3 ; 6 : 135 -> PARTICULES 1->0 ; 7 : 107 -> MELANGE_BIOMES 1->0 ; 8 : 130 -> DISTANCE_ENTITES 2->1 ; 9 : 145 -> terminé.
Remarques : la cible est 144 (fréquence de l'écran), donc le mod baisse encore à 135 FPS ; calibrage fait à 854x480, les FPS seront plus bas en plein écran 1440p. F3 après calibrage : 119 FPS / 150, mémoire 92 % 5197/5632 Mo, GPU 39 %.

## Relance automatique : cause
Prism lance `-cp NewLaunch.jar;… org.prismlauncher.EntryPoint` ; le vrai point d'entrée est `org.prismlauncher.launch.mainclass=io.github.zekerzhayard.forgewrapper.installer.Main` (ForgeWrapper monte modules et ouvertures). Le mod rejoue `cpw.mods.bootstraplauncher.BootstrapLauncher` sans ForgeWrapper, ignoreList, libraryDirectory. Aucune propriété jdk.module.* n'existe. Détail : prism-commande.txt.

## Prism et instance.cfg
- Prism ouvert, pas encore lancé : modif à 5120 puis `--launch` -> -Xmx5120m (pris).
- Jeu en cours sous Prism, modif à 5632 -> à la fermeture du jeu, Prism **réécrit** MaxMemAlloc=5120 (modif perdue). Vu aussi en fermant un Prism ouvert depuis longtemps (5632 -> 4096).
- Prism fermé, modif à 5632 puis `--launch` -> -Xmx5632m, conservé après fermeture.
Conséquence pour le mod : écrire instance.cfg pendant que le jeu tourne ne sert à rien ; il faut l'écrire après la sortie de Prism (relanceur qui attend la fin du processus prismlauncher), puis `prismlauncher --launch <instance>`. Lancé par `--launch`, Prism se ferme tout seul après le jeu.

Fichiers : essai1\, essai3-menu\, essai4-blocage\, essai5-calibrage\ (latest.log, json), prism-commande.txt, cmdlines.txt (jetons masqués), captures\ (PNG + JPG).

# Versions 1.0.1 et 1.0.2 — 23/11/2026 après-midi

| Point | 1.0.1 | 1.0.2 |
|---|---|---|
| Relance auto au démarrage | OK à 4608, puis le jeu meurt de faim de mémoire au chargement (Old 99,9 %, 484 GC complets) | OK à 5632, menu atteint, monde chargé |
| Chemin de relance | ForgeWrapper direct | **encore ForgeWrapper direct** (« lanceur Prism : relance directe de … ForgeWrapper »), pas EntryPoint + entrée standard |
| Jeton dans la ligne de commande | oui (--accessToken eyJ…) | **oui, encore** |
| Aide Mémoire au menu | non vérifiable (quickPlay) | OK, une fois (aideMemoireVue=true) ; dit 6144 Mo |
| OPTIMISER / QUITTER | — | **toujours superposés** (captures\21-v102-solo.png) |
| « changé à la main » | 0 (shaders coupés par le pack) | 1 : NUAGES FANCY -> OFF (les shaders coupent les nuages) |
| Nouveau calibrage après F11 | OK | OK (3 686 400 px au lieu de 409 920) |
| Calibrage plein écran 1440p | 76 FPS (essai de hausse) | 72 FPS (1 % bas 37) ; F3 68 FPS, GPU 73 % |
| Mémoire en jeu à 5632 | — | F3 95 % 5352/5632 ; jstat Old 97-99 %, 7 GC complets ; le mod recommande 6144 |
| Accents du json (UTF-8) | OK | OK (« écran », « calibré ») |
| Secours relanceRatee=true | **pas de raté** : relance réussie | **pas de raté** : relance réussie (l'argument est bien sur les 2 JVM) |

Notes : le joueur meurt en restant immobile dans ce monde (« décomposition »), il faut cliquer Ressusciter ; le calibrage attend qu'aucun écran ne soit ouvert. Le plein écran exclusif donne une capture GDI noire : captures prises avec F2 (captures\26-27-v102-plein-ecran-F2.png). Logs : essai6 à essai10. Modrinth App est installée (%LOCALAPPDATA%\Modrinth App, exe du 22/10, données dans %APPDATA%\ModrinthApp).
État final : copie à MaxMemAlloc=5632, sans argument JVM, jar 1.0.2 ; anciens jars, options et logs dans ancien\.

# Version 1.0.4 et analyse du modpack — 23/11/2026 fin d'après-midi

## Mod 1.0.4
| Point | État | Preuve |
|---|---|---|
| Ligne Prism (A) | OK | 12 670 car., -cp, org.prismlauncher.EntryPoint, script sur l'entrée standard, pas de jeton |
| Relance à 4096 (B) | OK | relance.log « script Prism sur l'entrée standard », jcmd -Xmx6144m, EntryPoint, pas d'--accessToken |
| Aide Mémoire au menu | OK | dit 6144 (captures\30, 33) |
| OPTIMISER / QUITTER | OK | séparés |
| Secours relanceRatee (C) | OK | « arrêtée en erreur (code 1) » puis Prism relance à 4096, une seule relance, relance-echec-lu.txt, WARN au menu (essaiC-secours-104\) |
| MULTIJOUEUR caché (G) | voulu | remplacé par REJOINDRE ; le script du 22/11 et les sprites manquaient dans la copie ET l'instance normale ; copiés depuis origin/main dans la copie seulement, menu OK (captures\34) |
| « choix du joueur gardé » | artefact | options du test pas remises à zéro ; DH_ACTIF « changé à la main » après mes essais sur DistantHorizons.toml |

## Mémoire vivante (histogrammes après GC complet, même monde, plein écran, 3 min)
| Essai | Menu | En jeu | JVM -> menu |
|---|---|---|---|
| D pack actuel | 2,80 Go | 5,37 Go | 105 s |
| E ModernFix dynamic_resources | 2,02 Go | 4,56 Go | 92 s |
| F sans WorldEdit | 2,79 Go | 3,70 Go | 100 s |
| I1 E + F + liste améthyste vide | 2,02 Go | 2,93 Go | 91 s |
| I2 I1 + DH generatorPlan DISABLED | — | 2,65 Go | — |
| I1 à 4608 (-Datheria.relance=true) | — | 3,07 Go, 0 GC complet en 3 min, 63 FPS, terrain OK | 90 s |

WorldEdit client : Guava (SingletonImmutableBiMap, ImmutableMapEntry, RegularImmutableMap) 1,08 Go -> 20 Mo. Le working set reste à 6,9-7,5 Go : la JVM occupe tout -Xmx.

## JFR (attention : écarter le 1er échantillon d'allocation de chaque fil, il porte le cumul depuis le début du fil)
- D, 120 s : allocation réelle 27,5 Go ; MC world 26 %, DH 19 %, Lost Cities 16 %. Ticker améthyste Subtle Effects 1,2 % (pas 20 %).
- I1 / I2 (60 s) : 19,1 Go -> 8,8 Go ; échantillons CPU des fils DH 6 961 -> 2 714 ; DH-World Gen 3 457 -> 0 ; Render thread 633 -> 762.
- DH-World Gen = génération lointaine uniquement (dh-fils-D.txt).

## Subtle Effects
Ligne 175 de ModBlockTickers = prédicat améthyste testé sur chaque bloc animé (conditional + stream.allMatch de fzzy_config). Liste vide -> ticker non enregistré, fichier non réécrit, 0 échantillon. 1.15.3 : même code ; corrige geyser/biome (1.15.2) et un accès serveur aux classes client.

## Contrôle visuel ModernFix
Chipped, Handcrafted, Macaw, Create, AKM TaCZ, FT-17 MTS : rendus OK (captures\41-45). Disques jurassicreborn : même icône avec et sans l'option (captures\50b, 52b). Log : 205 erreurs de modèle contre 70, dont 155 storage_disc jurassicreborn (3 sans l'option, déjà cassés).

État final de la copie : MaxMemAlloc=6144, sans argument JVM, jar 1.0.4, ModernFix / blocks.toml / DistantHorizons.toml d'origine, WorldEdit remis ; atheria_menu.js et sprites REJOINDRE de main gardés. Fichiers : analyse\ (histo-*, groupe-*, jfr-groupe-*, alloc-corrige-*, dh-fils-*, latest-*.log), anciens fichiers dans ancien\.

## Série finale sous Modrinth App 0.23.4 (23/11, 1.0.5 puis 1.0.6)
Profil Modrinth « Atheria test réglages » importé depuis la copie Prism (Ajouter un chemin launcher, le chemin Prism par défaut échoue). La mémoire globale de Modrinth sur ce PC vaut 8192 et n'a pas été changée ; le profil seul a été réglé à 2048.
- 1.0.5 : relance KO. La ligne Modrinth contient -javaagent et -cp vers %TEMP%\.tmpXXXX\theseus.jar, effacé à la fermeture du jeu. Classe principale com.modrinth.theseus.MinecraftLaunch : socket IPC obligatoire, puis attente du message « launch ». Relance et secours meurent (code 1). À 2 Go : OOM et blocage sur l'écran Mojang. Ligne : analyse\ligne-modrinth.txt.
- PC normal (Discord, Spotify en lecture, Chrome 5 onglets avec YouTube) à 5632, monde zz-monde-603b001d : calibrage 10 pas, 46 → 57 FPS, GPU 100 %, tout baissé sauf les shaders. Windows libre 454-1651 Mo, mémoire engagée 31,3/35,7 Go, fichier d'échange ≤ 2,7 Go. Jeu ≤ 5,9 Go, Chrome 1,2 Go, Discord 0,5, Spotify 0,4. Old 93-95 %, 0 GC complet (analyse\mesure-pc-modrinth.csv). Pas de « mémoire tendue » pendant ce run. Alt-Tab 30 s : CPU du jeu 3 cœurs → 1, GPU 3D 1 % ; au retour, menu pause et 62 FPS, aucun réglage changé. Piège : en plein écran, le jeu reste réduit au retour, il faut le restaurer.
- 1.0.6 à 2048 : relance auto à -Xmx5120m, sans theseus ni modrinth.internal, java_command BootstrapLauncher. relance.log : « relance réussie » après 120 s. Aide Mémoire au menu : 5120 Mo, texte Modrinth. Le « ⋮ » ne s'affiche pas dans la police et le chemin indiqué est faux (voir libellés). Le jeu relancé démarre réduit (plein écran). Modrinth affiche « Aucune instance en cours d'exécution » et « Jouer » reste actif.
- 1.0.6 « mémoire tendue (PC libre 413 Mo) : DH_DISTANCE 2 -> 1 » avec le message du chat, dans le run relancé où Chrome, Spotify et Discord étaient ouverts.
- 5 : l'écran Réglages auto propose « Optimiser » (pas « Optimiser et relancer ») alors qu'il affiche « 5,0 Go pour le jeu, 5,5 Go conseillés ». Clic : « Réglages refaits pour ton PC », pas de relance.
- 4 : avec relanceRatee, la relance meurt (ChargeurInexistant), le secours tourne à -Xmx2048M sans theseus, puis la fenêtre « Atheria : mémoire du jeu » apparaît (captures\112). Elle n'est pas au premier plan, elle reste derrière la fenêtre du jeu. Coquille : « besoin d au moins ». OK → le jeu se ferme proprement, pas de boucle. Argument retiré ensuite.
- Libellés réels de Modrinth App (FR) : page de l'instance → bouton engrenage (infobulle « Paramètres d'instance ») → Paramètres → JEU › « Java et mémoire » → « Memory allocation » (en anglais, curseur et case du nombre en Mo), sans case à cocher. Le ⋮ de l'instance contient seulement Ouvrir le dossier / Exporter le modpack / Créer un raccourci. Le clic droit sur le profil contient Jouer, Ajouter aux favoris, Ajouter du contenu, Voir l'instance, Dupliquer l'instance, Ouvrir le dossier, Copier le chemin, Éditer l'icône, Supprimer ; aucun « Modifier ».
- 1.0.5 rangé dans ancien\avant-1.0.6-modrinth\. Le profil Modrinth de test reste en place (1.0.6, 2048, sans argument).

## Retest 1.0.7 (23/11, 17:45-18:08, Modrinth puis Prism)
1.0.7 (MD5 0381c03d…) installée dans le profil Modrinth et dans la copie Prism. 1.0.6 rangée dans ancien\avant-1.0.7-modrinth\, 1.0.5 de la copie Prism dans ancien\avant-1.0.7-prism\.
- 1. Modrinth à 2048, en plein écran : relance auto à 5120 (relance réussie à 120 s). jeu-relance.log : « jeu relancé au premier plan ». La fenêtre reste au premier plan, non réduite. Aide au menu avec le bon chemin, sans « : > » (captures\121-aide-107-1920.png). La dernière ligne du texte chevauche un peu le haut de l'illustration.
- 2. Second « Jouer » pendant le jeu : fenêtre « Atheria déjà ouvert » au premier plan, environ 35 s après le clic (pendant le chargement des mods). OK → le second jeu s'arrête, le premier n'est pas touché (captures\123-deja-ouvert-*.png). Effet de bord : le second lancement a déjà réécrit logs\latest.log (l'en-tête du second jeu, puis le premier qui continue d'y écrire).
- 4. En jeu à 5120, le bouton s'affiche « Optimiser et relancer avec 5,5 Go » (captures\124-optimiser-relancer-1920.png). Clic : monde sauvé (level.dat à 17:51:47), relance à -Xmx5632m, premier plan, menu.
- 3. relanceRatee à 2048 : la relance meurt, le secours tourne à 2048, puis « Atheria : mémoire du jeu » s'ouvre au premier plan. La fenêtre du jeu est masquée (invisible) et le texte a les apostrophes et le bon chemin (captures\127-memoire-jeu-*.png). OK → arrêt propre. Argument retiré.
- 5. Prism, copie Atheria-test-reglages (6144) : lancement normal, menu. Un second `prismlauncher --launch` pendant que le jeu tourne : Prism ne relance pas l'instance, il ouvre seulement sa fenêtre console. Le verrou du mod n'est donc pas atteint sous Prism (refus par Prism lui-même).
- Fermé : Modrinth App, Prism, les jeux. Verrou rendu. Le profil Modrinth de test reste en 1.0.7, 2048, sans argument.


# Banc 1.0.9 — 23/11/2026 soir (19:00-20:10, Modrinth, PC normal)

Conditions : profil Modrinth « Atheria test réglages » mis à jour par packwiz sur claude/project-thread-f64uwu (1.1.4-beta + atheria_reglages 1.0.9, MD5 abf5395f… vérifié, 1.0.7 rangée dans ancien\avant-1.0.9-modrinth\). Mémoire 5632, plein écran 2560x1440, -Datheria.reglages.banc.auto=true -Datheria.reglages.banc.quitter=true. Discord, Spotify en lecture, Chrome 5 onglets sans vidéo. Monde « Banc Mamoudzou » = copie de mondes-cloud\carte-gelee-20261122\monde (original intact). Hook de MAJ : atheria-maj.desactive déjà présent dans le profil (aucun hook Modrinth) ; laissé tel quel. RTX 3060 Laptop.

## Préparation et incidents
| Point | État | Preuve |
|---|---|---|
| Base DH « joueurs » de la carte | absente sur le PC | recherche C: et D: ; la plus proche copiée : instances\Atheria\...\Distant_Horizons_server_data\Serveur+Minecraft\...overworld\DistantHorizons.sqlite (321 Mo, relevé Xaero du 23/11, MD5 identique) |
| Essai 1 | KO | écran datapack_load_failure : la carte exige atheria-ile (atheria_ile:volumes) ; atheria-ile.jar du serveur (minestrator\envoi\mods) ajouté au profil de test |
| Essai 2 | KO | plantage du rendu à la phase COMBAT : `mobs hordes:zombie_player` → Atlas-Lib PlayerTextureRenderer.getSkinType, fetchProfile null, jeu figé (analyse\latest-banc109-essai2-crash.log). Mobs passés à minecraft:zombie |
| Départ dans la rue | OK | 1re capture : Avenue de la Préfecture, au sol, PNJ devant ; avenue non changée |
| « génération lointaine DH : non » | NON appliquée | `[Banc] génération lointaine de Distant Horizons non réglable : NoSuchMethodException DhApiWorldGenerationConfig#enableDistantGeneration/0` (début et fin) |
| Entités | OK | ville 23-30 entités à 64 blocs, combat 67-86, trajet 42-58 : PNJ et zombies présents partout |
| Phase COMBAT | effet de bord | tue les villageois du monde, et la partie est sauvée : monde recopié avant chaque essai |

## Essai 3 (8 combinaisons, 19:41-19:54) — FPS moyen / 1 % bas / saccades
| Combinaison | Ville | Combat | Trajet |
|---|---|---|---|
| reference-sans-shaders (rendu 10, DH 256) | 66 / 18 / 24 | 49 / 12 / 75 | 69 / 18 / 16 |
| shaders-low-dh192 | 73 / 28 / 6 | 43 / 13 / 59 | 83 / 34 / 5 |
| shaders-medium-dh192 | 91 / 39 / 5 | 47 / 17 / 24 | 67 / 33 / 4 |
| shaders-medium-dh128-basse | 71 / 29 / 6 | 48 / 16 / 23 | 62 / 31 / 5 |
| shaders-high-dh160-basse | 70 / 31 / 6 | 37 / 13 / 21 | 58 / 31 / 4 |
| shaders-high-dh192 | 68 / 33 / 5 | 37 / 15 / 13 | 56 / 32 / 4 |
| shaders-medium-dh256-rendu10 | 72 / 36 / 3 | 43 / 16 / 25 | 59 / 23 / 9 |
| shaders-high-dh256-rendu10 | 66 / 33 / 4 | 36 / 15 / 14 | 54 / 22 / 5 |

Biais vu sur les captures : sur les 3 premières combinaisons, la ville lointaine (DH) n'était pas encore affichée, et la 1re porte le démarrage du monde (saccades, PC libre 258 Mo). Ces 3 lignes sont trop optimistes ou bruitées.

## Contre-essai (19:59-20:06), monde recopié, 1re combinaison d'échauffement jetée
| Combinaison | Ville | Combat | Trajet |
|---|---|---|---|
| echauffement-medium-dh192 (jetée) | 56 / 16 / 37 | 33 / 10 / 36 | 66 / 25 / 8 |
| shaders-medium-dh192 | 69 / 33 / 8 | 47 / 16 / 33 | 64 / 31 / 5 |
| shaders-medium-dh160 | 69 / 27 / 8 | 46 / 16 / 29 | 62 / 29 / 4 |
| shaders-high-dh192-bis | 65 / 32 / 6 | 40 / 15 / 22 | 58 / 33 / 5 |
Répétabilité : high-dh192 essai 3 contre bis : écart ≤ 3 FPS. La ville lointaine est affichée sur ces captures.

## Relevé PC toutes les 2 s (mesure-banc.ps1, analyse\resume-*.txt)
- Avec shaders, GPU à 83-96 % en ville et en trajet, 74-88 % en combat. Température GPU 86-88 °C, 77-96 W, VRAM 2,9-3,5 Go.
- CPU total 26-39 % avec shaders (jeu 22-34 %). Sans shaders : 52-55 %, GPU 35 %.
- Combat : le GPU baisse et le CPU monte. FPS 36-49 et 1 % bas 12-17 dans toutes les combinaisons. La limite en combat vient surtout des 40 zombies (IA, rendu des entités), pas des shaders.
- RAM libre du PC : 41-1874 Mo (souvent 250-500). Jeu 6,1-7,2 Go réels. Old 86-94 %, 0 GC complet pendant les mesures (2 GC au chargement).
- Températures CPU : non lisibles sans droits admin.

## Recommandation
Shaders MEDIUM, distance de rendu 8, Distant Horizons 192 tronçons en qualité moyenne (shaders-medium-dh192).
- Résultats : ville 69 / 33, combat 47 / 16, trajet 64 / 31.
- HIGH coûte 7 à 10 FPS en combat (37-40) pour un gain visuel faible.
- DH 128 en qualité basse ou DH 160 ne gagnent rien en combat.
- Rendu 10 fait tomber le 1 % bas en trajet de 31 à 23, ce qui donne plus de saccades en mouvement.
- Limite : le banc ne fait pas de rotations de caméra rapides. Le 1 % bas en combat (~16) est le vrai point faible : à traiter côté entités (nombre de mobs, culling), pas côté shaders.

## Fichiers
analyse\banc-20261123-1941.csv, banc-20261123-1959.csv, latest-banc109*.log, mesure-banc-109-essai3.csv, mesure-banc-109-essai4.csv, resume-*.txt ; captures\banc\ (8 JPEG 1920x1080) et captures\banc\contre-essai\ (4). Mondes des essais : profil\banc-essais-mondes\ (rien supprimé).

État final : profil Modrinth de test à 2048, sans argument (blob identique à l'avant), options.txt d'avant remis, 1.0.9 + atheria-ile.jar dans mods, config\atheria_reglages_banc.txt avec minecraft:zombie. Applis fermées, verrou rendu.
