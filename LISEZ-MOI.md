# Atheria Zombie Edition : mods

Minecraft **1.21.1**, **NeoForge** (21.1.235 ou plus récent conseillé), **Java 21**.

## Pour les joueurs : Modrinth App

Les joueurs installent le pack avec le **Modrinth App** : double-clic sur `Atheria-Zombie-Edition-1.0.4.mrpack`, et c'est tout : le mod `atheria-maj.jar` installe les mises à jour à chaque lancement, sans réglage. **Aucun mod à installer à la main** : le `.mrpack` contient tout, y compris les mods CurseForge. Détails dans `docs\mises-a-jour-auto.md`.

## Télécharger les mods (préparation, pour Mika)

Double-clique sur **Telecharger les mods.bat**. Le script :
- récupère la dernière version 1.21.1 NeoForge de chaque mod sur Modrinth, avec ses dépendances obligatoires ;
- retire d'abord les fichiers qu'il avait téléchargés au passage précédent (anciennes versions, mods retirés), sans toucher aux mods ajoutés à la main ;
- range tout ainsi :
  - `client\mods` : mods communs + mods client (dossier `mods` de l'instance des joueurs)
  - `client\resourcepacks` et `client\shaderpacks` : packs de ressources et shaders des joueurs
  - `serveur\mods` : mods communs + mods serveur (dossier `mods` du serveur)
- écrit `liste-des-mods.csv` et affiche les mods introuvables, s'il y en a.

## Jouer avec Prism Launcher

Le script prépare aussi une instance **prête à jouer** : `instances\Atheria` (Minecraft 1.21.1, NeoForge 21.1.265, 8 Go de RAM, mods, packs de ressources et shaders déjà en place).

1. Dans Prism : **Paramètres → Launcher → Dossiers → Instances**, choisis le dossier `instances` de `Atheria Zombie Edition`.
2. L'instance « Atheria Zombie Edition » apparaît. Lance-la une fois jusqu'au menu principal, puis quitte : c'est ce qui crée les fichiers de config que je dois régler.
3. Ajoute les mods CurseForge (liste plus bas) dans `client\mods`, puis relance le script : il les recopie dans l'instance.

8 Go de RAM conviennent si ton PC en a au moins 16. Sinon, baisse à 6 Go dans les réglages de l'instance.

Les schematics des lieux sont rangés dans `instances\Atheria\minecraft\schematics` (.nbt, pour Create) et `serveur\config\worldedit\schematics` (.schem, pour WorldEdit). Le script n'y touche pas.

Les docs détaillées sont dans le dossier `docs` : audit de compatibilité, plan des configs, guide serveur Minestrator, journal de stabilisation et **butin** (`docs\butin.md` : où trouver armes, munitions et soins, et ce qui a été retiré des coffres).

## Butin et recettes du pack (KubeJS)

- `kubejs/server_scripts/atheria_butin.js` + `kubejs/data/atheria/loot_table/inject/` : armes et munitions TaCZ seulement dans les bunkers, le camp militaire et la prison de Spore ; soins First Aid rares partout, fréquents à l'hôpital et dans les infirmeries ; moins de diamants et d'enchantements forts dans les coffres de début.
- `kubejs/server_scripts/atheria_recettes.js` : boussole d'explorateur sans recette (récompense de quête), boussole de la nature plus chère (boussole, 4 lingots de fer, mousse, pousses).
- Ces fichiers sont aussi dans `serveur\kubejs` : à envoyer sur le serveur avec le reste du dossier `kubejs`.

## Mods inclus par le script (105)

**Client + serveur (58)**
- *Infectés et événements* : Fungal Infection: Spore, The Hordes, Enhanced Celestials 2 (Core, Default Lunar Events ; Shader Support côté joueurs)
- *Ambiance* : Subtle Effects
- *Monde* : The Lost Cities, Abandoned City Buildings, Create: Fallout, YUNG's Cave Biomes, Structory
- *Combat et survie* : TaCZ (portage 1.21.1), Better Combat, First Aid New, Corpse, AppleSkin, Serene Seasons, Farmer's Delight, Spoiled (nourriture périssable), Trydeas: Meleez (armes de mêlée improvisées, compatibles Better Combat), Thirst Was Taken + Thirst Canteen (soif, eau à purifier, gourdes), Simple Burnout Torch (les torches vanilla s'éteignent, rallumables au briquet ; torches d'âme, Chipped, Macaw's et appliques Supplementaries autorisées et permanentes)
- *Faune* : Naturalist (animaux sauvages, compat Terralith intégrée)
- *Construction et technique* : Create, Supplementaries, Macaw's Doors, Macaw's Furniture, Immersive Vehicles
- *PNJ* : Easy NPC, Guard Villagers
- *Rangement* : Sophisticated Backpacks, Sophisticated Storage, Carry On, Lootr, Curios
- *Outils* : JEI, Jade, Explorer's Compass, Nature's Compass, Open Parties and Claims, Simple Voice Chat, Emotecraft, KubeJS, LootJS
- *Optimisation* : ModernFix, FerriteCore, Lithium
- *Construction et déco* : WorldEdit, Create Deco, Macaw's Roofs, Macaw's Lights and Lamps, Macaw's Fences and Walls, Chipped
- *Confort* : Comforts (sacs de couchage), Polymorph, Ping Wheel, FastWorkbench, Pick Up Notifier, Xaero's World Map

**Client uniquement (30)** : True Darkness Biomes, Presence Footsteps (bruits de pas, version bêta 1.12.0-beta.1), Sodium, Sodium Extra, Iris, ImmediatelyFast, Entity Culling, More Culling, BadOptimizations, Dynamic FPS, Sodium Dynamic Lights, Shoulder Surfing Reloaded, Sound Physics Remastered, Xaero's Minimap, AmbientSounds, FancyMenu, Inventory Profiles Next, Controlling, Particle Rain, Entity Model Features, Entity Texture Features, Camera Overhaul, Not Enough Animations, First-person Model, 3D Skin Layers, ItemPhysic Lite, Drippy Loading Screen, Sounds, Mouse Tweaks, Chat Heads

**Serveur uniquement (17)** : Spark, Chunky, Immersive Optimization, Improved Mobs, Terralith, Tectonic, Geophilic, YUNG's Better Dungeons, YUNG's Better Mineshafts, YUNG's Bridges, YUNG's Better Strongholds, Explorify, Repurposed Structures, Structory: Towers, Sparse Structures, Clumps, Leaves Be Gone

**Packs de ressources et shaders** : Fresh Animations (`resourcepacks`), Complementary Reimagined et Hysteria (`shaderpacks`)

⚠️ Les mods de génération (Terralith, Tectonic, Geophilic, tous les YUNG's, Explorify, Repurposed Structures, Structory et Structory: Towers, Sparse Structures, Abandoned City Buildings, Create: Fallout, Underground Bunkers, The Lost Cities) doivent tous être en place **avant de créer le monde**. Les ajouter plus tard ne touche que les nouvelles zones explorées.

## Mods CurseForge (hors script)

Le script ne les prend pas (il ne passe que par Modrinth), mais packwiz et le `.mrpack` les installent tout seuls : les joueurs n'ont rien à faire. Cette liste ne sert qu'à remplir les dossiers `client\mods` et `serveur\mods` du script. Tous en version **1.21.1 NeoForge**.

**Dans les deux dossiers `mods` (client et serveur) :**
- **FTB Quests** + **FTB Library** + **FTB Teams** : https://www.curseforge.com/minecraft/mc-mods/ftb-quests-forge (Architectury est déjà fourni par le script)
- **Underground Bunkers & Nuclear Weapons**, avant de créer le monde
- **MTS Official Pack** (le pack de véhicules d'Immersive Vehicles), fichier `MTS Official Pack-1.21.1-V29.jar`
- **En-V Flashlight**
- **Walkie-Talkie Plus**
- **AllTheLeaks** : https://www.curseforge.com/minecraft/mc-mods/alltheleaks
- **Addon Infnexus de Spore** (optionnel) : https://www.curseforge.com/minecraft/mc-mods/fungal-infection-spore-infnexus/files/8332648

**Dans `client\mods` seulement :**
- **Simple Blood** : prendre la dernière version NeoForge 1.21.1 (1.2.1) : https://www.curseforge.com/minecraft/mc-mods/simple-blood/files/all?version=1.21.1

## Laissés de côté

- **ZombieApocalypseAddon** : The Hordes a été choisi pour les hordes.
- **Lightman's Currency** : pas d'économie pour l'instant.
- **Ultimate Car Mod** : remplacé par Immersive Vehicles.
- **Tough As Nails et Cold Sweat** : pas de mod de température. La soif est gérée par Thirst Was Taken.
- **Hardcore Revival** : First Aid New est gardé pour l'état à terre.
- **Wasteland NewLife** : écarté.
- **FTB XMod Compat** : retiré, FTB Library refuse de démarrer avec la seule version 1.21.1 disponible (21.1.14). Le script le supprime s'il le trouve.
- **Rotwire** : doublon avec Spore, TaCZ et FTB Quests.
- **Truly Dark** et **Food Spoilage** : CurseForge bloque leur téléchargement automatique. Remplacés par True Darkness Biomes et Spoiled (Modrinth). Le script retire les anciens jars s'il les trouve.
- **Naturallith** : son jar est une copie complète de Naturalist (même identifiant `naturalist`), donc doublon au démarrage ; la compat Terralith est déjà dans Naturalist 2.0.7. Jar rangé dans `mods-desactives`.
- **En test avant décision** : Spore Inquisition, pack de textures Jicklus.

## À tester au premier lancement

- Better Combat et Emotecraft utilisent tous les deux des animations du joueur. Si les coups ne s'animent plus, on retire Emotecraft.
- Sodium 0.8.13 et Iris 1.8.14 vont bien ensemble (vérifié).
- True Darkness Biomes rend les nuits noires (un peu moins par pleine lune) : à vérifier avec les shaders pour que ce soit sombre mais jouable.
- The Hordes et Enhanced Celestials 2 : les nuits de horde et les lunes de sang ne tombent pas le même soir, et pas de lune de sang avant le jour 10 (script `kubejs/server_scripts/atheria_lunes.js`). Enhanced Celestials 1 est retiré (incompatible) : à supprimer aussi du serveur.
- The Lost Cities avec Terralith et Tectonic : générer un monde test **sur le serveur**, puisque ces mods n'y tournent que là.
- Simple Voice Chat a besoin d'un port UDP (voir le guide serveur : `port=-1` réutilise le port du jeu).
