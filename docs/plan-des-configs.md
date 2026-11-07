# Plan des configs : Atheria Zombie Edition

Objectif : une aventure d'**au moins un mois**, tendue mais juste, dans l'esprit de The Last of Us. Les munitions sont rares, l'infiltration vaut mieux que le combat, la nature a repris les villes, et la difficulté monte par paliers.

Je m'inspire de packs zombie et survie qui ont fait leurs preuves : **Afterfall** (même version, même base TaCZ), **DeceasedCraft** (rareté et progression lente), **RLCraft** (on garde l'idée d'un monde hostile, sans la punition gratuite) et **Prominence / Craftoria** (le rythme des chapitres).

> Comment je l'applique : les noms exacts des options changent d'une version à l'autre, et beaucoup de fichiers ne sont créés qu'au premier lancement. Dès que ton instance Prism aura été lancée une fois dans `Atheria Zombie Edition\instances`, je lirai les fichiers générés et j'y mettrai les valeurs ci-dessous. Je ne devine aucun nom d'option.

## 1. Courbe de difficulté sur un mois

| Semaine | Ce que vit le joueur | Leviers de config |
|---|---|---|
| **1. Survivre** | Corps à corps et arc. Fouille des maisons, premiers infectés lents. Pas d'arme à feu craftable. | Spore : formes de base seulement. Aucune arme TaCZ dans le butin courant, juste quelques pièces détachées. Hordes à partir du jour 7. |
| **2. S'organiser** | Premier pistolet, gros des munitions encore rares. Bases, alliances, premières hordes. | Établi à armes débloqué par une quête du chapitre 2. Butin : munitions de pistolet rares. Lunes de sang possibles à partir du jour 10. |
| **3. Reconquérir** | Fusils, Create remis en marche, véhicules. Les infectés évoluent (claqueurs, formes lourdes). | Spore : évolutions intermédiaires. Recettes de véhicules débloquées par quête. Hordes plus grosses. |
| **4. Affronter** | Zones infestées, formes avancées de Spore, histoire finale. | Spore : formes avancées, foyers de propagation. Boussole d'explorateur en récompense. Événements de Mika. |

## 2. Monde et génération

**The Lost Cities** : profil personnalisé **`atheria.json`, déjà écrit** (dans `config/lostcities/profiles/`), choisi par `selectedProfile = "atheria"` dans `lostcities-server.toml` avant de créer le monde.
- Deux fois plus de villes que par défaut (`cityChance` 0,02), un peu plus grandes (rayon 60 à 160), avec de la campagne entre elles.
- Beaucoup plus de ruines (`ruinChance` 0,35, contre 0,05 par défaut), de lianes (0,06 contre 0,009) et de feuillage qui envahit les rues (0,35 contre 0,1).
- Deux fois plus d'explosions et de petits cratères.
- Pas de générateurs de monstres vanilla dans les bâtiments : les infectés de Spore occupent le terrain.
- Plus de coffres et de bâtiments vides (35 % et 30 %) : le pillage doit se mériter.
- Routes et voies ferrées gardées pour les véhicules.
- À valider sur le monde test.

**Sparse Structures** : facteur environ 1,3. Il évite les chevauchements sans vider le monde.

**Explorer's Compass** : recette retirée (fait, `kubejs/server_scripts/atheria_recettes.js`), obtenu en récompense de quête uniquement. Liste noire des structures liées à l'histoire : à faire.
**Nature's Compass** : craftable, mais coûteux (fait) : boussole au centre, 4 lingots de fer aux coins, 2 blocs de mousse, 2 pousses d'arbre (environ 8 fer en tout, fin de semaine 1).

**Prégénération** : rayon de 3 000 blocs avec Chunky avant d'ouvrir le serveur (voir le guide serveur).

## 3. Les infectés

**Spore (infection principale)**
- Garder la morsure et la transformation des cadavres en infectés.
- Ralentir l'évolution pour que les formes avancées n'arrivent qu'en semaine 3. Spore fait évoluer les infectés quand ils consomment de la biomasse, donc on joue sur la vitesse d'évolution et le plafond d'apparition.
- Plafonner le nombre d'infectés autour de chaque joueur, pour les performances avec 10 joueurs.
- Garder les hordes et la hiérarchie des infectés de Spore : c'est son intérêt.

**The Hordes (nuits de horde)**
- **Infection désactivée** (Spore s'en occupe).
- Une horde tous les **7 jours**, la première au **jour 7**.
- Taille de départ modeste (environ 10 zombies par joueur), qui augmente d'une semaine à l'autre jusqu'à environ 25, puis plafonne.
- Butin de fin de horde : quelques munitions et des fournitures médicales, pour que survivre rapporte quelque chose.

**Enhanced Celestials 2** (Core + Default Lunar Events, + Shader Support côté joueurs)
- **Lune de sang** : environ 1 nuit sur 12, jamais avant le jour 10, jamais la même nuit qu'une horde. Monstres ×2,25 en surface, sommeil bloqué, pas de siège de village (pas de zombies qui apparaissent derrière les murs).
- **Super lune de sang** : rare (pleine lune, 30 nuits d'écart au moins), monstres ×3.
- Réglages : kubejs/data/enhancedcelestials2defaultlunarevents/ (poids et écarts) et kubejs/server_scripts/atheria_lunes.js (jour 10 et nuits de horde).
- **Lune de récolte** : gardée, c'est un bonus agricole bienvenu en survie.
- **Lune bleue** : gardée, c'est une nuit plus calme qui donne un moment de répit.

**Monstres vanilla** : apparitions de zombies et squelettes réduites d'environ moitié, creepers rares. Les vrais ennemis sont les infectés. Araignées et creepers restent pour la variété.

**Guard Villagers** : les gardes défendent les villages contre les infectés, ce qui fait des villages des refuges fragiles, très TLOU.

## 4. Combat et armes

**TaCZ**
- Dégâts des armes inchangés, mais munitions rares : c'est la rareté qui crée la tension, pas des armes faibles.
- Armes et munitions retirées des coffres courants. On les trouve dans les bases militaires, la prison et les bunkers (fait, voir `docs\butin.md`), et on les fabrique à l'établi à partir du chapitre 2.
- Bruit : idéalement, les tirs attirent les infectés. Je vérifierai quelle option de TaCZ ou de Spore le permet. On garde le silencieux comme récompense rare.
- Pas de visée automatique ni d'assistance.

**Better Combat** : armes de mêlée avec de vraies attaques en arc. Le corps à corps devient une vraie option, comme le tuyau ou la batte de TLOU.

**First Aid New**
- Dégâts par zone du corps.
- Inconscience activée au lieu de la mort directe, avec un délai court pour être relevé par un allié. Ça pousse les alliances.
- Kits de soin et bandages rares dans le butin (fait, voir `docs\butin.md`), plus une recette de bandage simple (à faire).

**Corpse** : à la mort, l'inventaire reste dans le corps pendant **60 minutes**. Les autres joueurs peuvent le piller (c'est le principe du PvP libre), mais pas dans un claim.

## 5. Survie

**AppleSkin** : affichage de la faim uniquement, sans rien changer d'autre.
**Serene Seasons** : saisons d'environ 8 jours Minecraft chacune. Hiver sans pousse, ce qui oblige à stocker.
**Farmer's Delight + Create: Food + Create: Fallout** : la nourriture variée nourrit mieux. On garde la vanilla simple pour pousser à cuisiner.
**Tough As Nails** : en attente de ta réponse (garder seulement la soif ?).

## 6. Butin (Lootr)

- Chaque coffre de structure est individuel : chaque joueur a son propre butin.
- Rééquilibrage **fait le 29/10** avec LootJS (`kubejs/server_scripts/atheria_butin.js` + tables `kubejs/data/atheria/loot_table/inject/`). Détail complet et correspondance structure → table : **`docs\butin.md`**.
  - **Maisons et villes** : butin d'origine des mods gardé, plus de rares bandages, pansements, antidouleurs (12 % par coffre).
  - **Police et militaire** : munitions, accessoires, rares armes complètes (pistolets bien plus fréquents que les fusils) dans les bunkers, le camp militaire et la prison de Spore. Lost Cities n'a pas de commissariat identifiable.
  - **Hôpitaux** : fournitures médicales dans l'hôpital de Spore, l'infirmerie des bunkers et le ravitaillement des Underground Bunkers.
  - **Bunkers (Underground Bunkers)** : le meilleur butin (coffres « trésor » et coffre-fort).
  - Plus aucune arme ni munition TaCZ dans les coffres courants (l'injecteur du coffre de départ est retiré).
- Butin trop fort de début retiré (fait) : pomme dorée enchantée et équipement en diamant enlevés, diamants 4 fois plus rares, enchantements ramenés aux niveaux 5 à 15.

## 7. Bases, claims et PvP

**Open Parties and Claims**
- Environ 25 chunks claimables par joueur, mis en commun dans une alliance (party).
- Dans un claim : pas de destruction, pas de vol de coffres, pas d'explosion. Le PvP reste possible, ce qui permet les embuscades mais pas le saccage des bases.
- PvP libre partout, spawn compris (seul le spawn-kill est interdit, par règle).
- Règles validées par Mika : voir le guide serveur et la page « Présentation & règles ».

**Carry On** : liste noire des coffres Lootr, des blocs Sophisticated Storage et des spawners.

**Sophisticated Backpacks / Storage** : améliorations les plus fortes (aimant, alimentation automatique) en fin de progression.

## 8. Interface et confort

- **Xaero's Minimap** : radar d'entités et mode grotte désactivés (fair-play).
- **Jade** : blocs oui, vie des entités et contenu des conteneurs non.
- **JEI** : recettes visibles. Les recettes verrouillées par quête restent marquées.
- **Inventory Profiles Next** : tri activé, sans glisser-déposer automatique qui fausse le PvP.
- **FancyMenu** : menu principal aux couleurs d'Atheria (fond, logo, boutons). Il faudra des images.
- **Controlling** + **touches par défaut** : un jeu de touches sans conflit, appliqué au premier lancement puis jamais écrasé.

## 9. Performances (10 joueurs)

- Distance de vue serveur 8, distance de simulation 6.
- Plafond d'entités par joueur (Spore + The Hordes) et Immersive Optimization pour ralentir les entités lointaines.
- Spark installé sur le serveur pour mesurer si ça rame.
- Côté joueurs : Sodium + options Sodium Extra raisonnables par défaut. Shaders désactivés au premier lancement, chacun active selon sa machine.
