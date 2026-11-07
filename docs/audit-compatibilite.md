# Audit de compatibilité : Atheria Zombie Edition

Minecraft 1.21.1, NeoForge. Pack au 27/10/2026 : 72 mods par le script, 10 à la main sur CurseForge, plus 3 packs de ressources et shaders. Environ 100 fichiers une fois les dépendances ajoutées.

Légende :
- 🔴 Bloquant : à corriger avant de jouer.
- 🟠 Doublon ou conflit : à régler en config.
- 🟡 À vérifier dans le monde test.
- 🟢 Vérifié, rien à faire.

## 🔴 Bloquants (déjà corrigés)

| Problème | Correctif |
|---|---|
| The Hordes a téléchargé **Atlas Lib en version 1.12.2**. La fiche de The Hordes pointe vers une ancienne version, et le jeu aurait planté au démarrage. | J'ai corrigé le script : il refuse une dépendance qui n'est pas en 1.21.1 NeoForge et prend la bonne (Atlas Lib 1.21-1.1.14). Au prochain lancement, il supprime aussi les fichiers téléchargés la fois précédente, ce qui retire le mauvais Atlas Lib. |
| FTB Quests n'est pas sur Modrinth en 1.21.1. | Il est dans la liste « à la main », avec FTB Library et FTB Teams. Architectury est déjà fourni par le script. |

## 🟠 Doublons et conflits à régler en config

| Mods | Conflit | Correctif |
|---|---|---|
| **Spore** + **The Hordes** | Les deux ont leur propre infection : le zombie The Hordes infecte, la morsure Spore infecte aussi. Deux barres d'infection différentes, deux remèdes, ça casse l'ambiance. | **Couper l'infection de The Hordes** et garder celle de Spore, cohérente avec le champignon de The Last of Us. The Hordes ne garde que les nuits de horde. |
| **The Hordes** + **Enhanced Celestials** | Nuits de horde d'un côté, lune de sang (plus de monstres) de l'autre. Les deux le même soir, c'est injouable. | Hordes à jour fixe (tous les 7 jours). Lune de sang rare et aléatoire (environ 1 nuit sur 12), désactivée les 10 premiers jours. Les deux événements s'annoncent par un message. |
| **Spore** + **The Hordes** + monstres vanilla | Trop d'ennemis à l'écran, donc chute des performances et jeu frustrant. | Réduire les zombies vanilla (The Hordes les remplace pendant les hordes) et plafonner les apparitions de Spore. Détails dans le plan des configs. |
| **Better Combat** + **Emotecraft** | Ils utilisent tous les deux une librairie d'animation du joueur. Emotecraft embarque la sienne, Better Combat demande `player-animation-lib`. Selon les versions, les animations peuvent se bloquer mutuellement. | 🟡 À tester en premier. Si ça plante ou si les coups ne s'animent plus, on retire Emotecraft (Better Combat compte plus pour le jeu). |
| **Carry On** + **Lootr** / **Sophisticated Storage** | Carry On permet de porter un coffre Lootr : le butin individuel saute et peut être dupliqué. Même risque de duplication avec certains stockages. | Mettre les coffres Lootr, les blocs Sophisticated Storage et les spawners sur la liste noire de Carry On. |
| **Create: Fallout** | Il ajoute une monnaie en capsules alors qu'on a dit « pas d'économie pour l'instant ». | On garde le mod (structures, nourriture, ambiance Fallout) et on traite les capsules comme un objet de décor ou d'échange libre. On pourra les brancher plus tard sur des PNJ marchands Easy NPC. |
| **Immersive Vehicles** | Ses packs de contenu peuvent ajouter leurs propres armes, en doublon avec TaCZ. | Choisir un pack de véhicules **sans armes**. |
| **Xaero's Minimap** | Le radar d'entités montre les infectés et les joueurs à travers les murs, ce qui tue la tension et le PvP. | Désactiver le radar d'entités et le mode grotte côté serveur (mode « fair-play » de Xaero). On garde la carte du terrain. |
| **Jade** | Il affiche la vie des monstres et le contenu des coffres. | Garder l'info de bloc, cacher la vie des entités et le contenu des conteneurs. |
| **Explorer's Compass** | Il trouve n'importe quelle structure en un clic, ce qui casse l'exploration. | Recette retirée. On ne l'obtient que comme récompense de quête au chapitre 4, avec une liste noire des structures clés de l'histoire. |
| **Improved Mobs** + **Spore** / **The Hordes** | Improved Mobs rend tous les monstres plus malins (casser des blocs, viser, porter de l'équipement). Appliqué aux infectés de Spore, qui ont déjà leur propre IA, ça peut faire double emploi ou casser leur comportement. | Limiter Improved Mobs aux **monstres vanilla** (liste blanche) et exclure Spore et The Hordes. Les infectés gardent l'IA de Spore. |
| **Truly Dark** + shaders | Truly Dark rend les nuits et les intérieurs vraiment noirs. Combiné à un shader sombre, on ne voit plus rien. | Régler la noirceur pour que la lampe torche (En-V Flashlight) devienne indispensable, sans rendre le jeu impossible. À calibrer avec Complementary et Hysteria. |
| **En-V Flashlight** + **Sodium Dynamic Lights** | Deux sources de lumière dynamique : la lampe torche et la torche tenue en main. | 🟡 Vérifier que les deux s'affichent sans scintillement. Si conflit, on garde la lampe torche, plus TLOU. |
| **Sparse Structures** + l'objectif « monde rempli de choses » | Il espace toutes les structures, à l'opposé de ce que tu veux. | Facteur bas (environ 1,3) pour éviter juste les chevauchements, pas pour vider le monde. Les villes Lost Cities ne sont pas concernées. |

## 🟡 À vérifier dans le monde test (sur le serveur)

1. **Lost Cities + Terralith + Tectonic** : les villes doivent rester lisibles sur les reliefs plus forts. Lost Cities dit gérer les mods de terrain, mais avec Tectonic les montagnes peuvent couper des quartiers.
2. **Grottes de Terralith + YUNG's Cave Biomes** : deux sources de biomes souterrains. Vérifier qu'ils cohabitent et que l'un n'efface pas l'autre.
3. **Geophilic + Terralith** : Geophilic retouche les biomes vanilla, que Terralith remplace en partie. Peu de risque, mais l'effet de Geophilic sera moins visible.
4. **Structures dans les villes** : Repurposed Structures, YUNG's, Structory, Explorify, Abandoned City Buildings et Create: Fallout peuvent apparaître au milieu d'une ville Lost Cities. À regarder sur la carte du monde test.
5. **Shoulder Surfing + TaCZ** : la visée en vue épaule doit rester alignée avec le viseur des armes.
6. **Immersive Vehicles 24.0.0** : c'est la seule version 1.21.1 NeoForge disponible. À surveiller dans les logs.
7. **Iris + Create** : les machines Create avec un shader (Flywheel). Normalement compatibles, à confirmer avec le shader choisi.

## 🟢 Vérifié, rien à faire

- **Sodium 0.8.13 + Iris 1.8.14** : Iris demande exactement cette version de Sodium.
- **Optimisation** : ModernFix, FerriteCore, Lithium, ImmediatelyFast, Entity Culling, More Culling et BadOptimizations sont compatibles entre eux et avec Sodium.
- **Lootr + Lost Cities / structures** : Lootr convertit les coffres à butin des structures, donc chaque joueur a son propre butin.
- **Simple Voice Chat + Sound Physics Remastered** : Sound Physics gère la voix (écho, étouffement derrière les murs). C'est parfait pour l'ambiance.
- **Serene Seasons + Farmer's Delight** : les cultures de Farmer's Delight suivent les saisons.
- **Corpse + First Aid** : aucun conflit. Le corps garde l'inventaire à la mort.
- **Easy NPC + Guard Villagers** : aucun conflit.
- **Terralith + Tectonic** : Tectonic est prévu pour fonctionner avec Terralith.
- **Walkie-Talkie Plus + Simple Voice Chat** : le talkie-walkie s'appuie sur Simple Voice Chat, déjà présent.
- **Fresh Animations** : il a besoin d'Entity Model Features et d'Entity Texture Features, ajoutés tous les deux.
- **KubeJS** : il servira à écrire les recettes verrouillées, le butin et les ajustements du pack en scripts, sans mod en plus.

## Ajout

- **Controlling** (client) : recherche de touches et affichage des conflits dans le menu des contrôles. Il est ajouté au script.
