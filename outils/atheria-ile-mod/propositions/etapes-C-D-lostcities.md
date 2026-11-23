# Étapes C et D, et réglages Lost Cities proposés (rien n'est appliqué)

## Étape C (mod 0.4.0)
- Titre de région : envoyé par le serveur avec les paquets de titre vanilla, il n'y a rien à installer côté joueur.
  - Contrôle une fois par seconde, uniquement à terre.
  - Il faut 3 contrôles de suite dans la nouvelle région, au moins 20 s depuis le dernier titre, et la région n'est pas réaffichée si elle a été vue dans les 5 dernières minutes.
  - Clés : `titres_regions.actif`, `intervalle_ticks`, `stabilite_controles`, `delai_min_secondes`, `oubli_secondes`.
  - Par région, on peut ajouter `titre` (par défaut, le nom sans la parenthèse) et `sous_titre`, laissé vide pour le lore.
  - Simulation hors jeu, un trajet ouest-est : 28 changements de région bruts donnent 7 titres affichés.
- Bord du monde : `bordure_monde_blocs` à 12000, centré sur 0,0, ce qui correspond exactement à la carte. Au-delà de la côte, il y a au moins 480 blocs d'océan profond avant le bord. Le mod ne touche pas un bord déjà réglé par un admin.
- Repères Xaero : commande `/ile reperes`, ouverte à tous. Pour chaque région, elle envoie une ligne `xaero-waypoint:` placée au point le plus à l'intérieur de la région (14 sur 14 vérifiés hors jeu). Xaero's Minimap propose de les ajouter d'un clic.
  - Les lieux du lore validés se mettent dans `reperes: [{nom, x, z, couleur}]`, vide pour l'instant.
  - Le format des lignes est à vérifier sur un vrai client.

## Étape D
- Messages clairs :
  - Dossier, `regions.json` ou `carte.png` manquant : le log donne le chemin exact et indique que le monde est généré SANS l'île.
  - JSON mal formé : message dédié.
  - Au démarrage, si le datapack est présent mais la carte n'a pas pu être chargée : bandeau d'erreur dans le log et message rouge aux opérateurs à la connexion.
- Saisons (Serene Seasons 10.1.0.9) : en hiver, `biome_temp_adjustment` vaut -0,8. Cela fait neiger tous les biomes qui ne sont pas dans `sereneseasons:tropical_biomes`, c'est-à-dire presque toute l'île (rainforest, tropical_jungle, white_cliffs, les biomes atheria…).
  - Proposition : `propositions/tropical_biomes.json` (60 biomes, `replace: false`, `required: false`), à mettre dans le datapack de l'île. Seuls le Bénara et les Hauts plateaux gardent un hiver.
  - Plan de test : `/season set early_winter`, puis `mid_winter`, sur la copie de test ; rendu de neige et de glace sur 500 blocs autour de la Jungle, de la Savane, du Bénara et du lagon ; zéro neige attendue hors Bénara et Hauts plateaux. Je recommence après avoir posé le tag.
- Chunky : il n'est PAS installé, ni dans la copie de test ni dans le serveur. Il faut l'accord de Mika pour télécharger Chunky NeoForge 1.21.1 depuis Modrinth dans la copie de test seulement.
  - Script prêt : `test-chunky.ps1`, dans le dossier scratchpad de la session. Il suit les mêmes règles que le test 10 : lock, 4,5 Go libres au départ, arrêt sous 300 Mo avec `chunky pause` puis `stop`.
  - Il lance un carré de 2000 × 2000 centré sur -4640 / -3000, journalise vitesse et RAM toutes les 15 s, s'arrête à « Task finished » et met tout en pause et à l'arrêt propre au bout de 50 min.

## Lost Cities : proposition (fichiers du fil des villes, NON modifiés)
Clés vérifiées dans `config/lostcities/profiles/default.json` (8.4.6) et dans le style de monde `kubejs/data/lostcities/lostcities/worldstyles/atheria.json`.

1. Villes seulement dans les Friches et à Petite-Terre/Somaco. Dans `worldstyles/atheria.json`, remplacer `citybiomemultipliers` par :
   ```json
   "citybiomemultipliers": [
     {"multiplier": 0.0, "biomes": {"excluding": [
       "minecraft:plains", "biomesoplenty:wasteland", "biomesoplenty:dryland",
       "biomesoplenty:wasteland_steppe", "biomesoplenty:dead_forest",
       "terralith:volcanic_crater", "terralith:hot_shrubland", "biomesoplenty:shrubland"]}}
   ]
   ```
   Il faut aussi retirer `minecraft:plains` de la Côte calcaire (mettre `biomesoplenty:grassland` à la place, dans la config de l'île) pour que plains reste propre aux Friches. `biomesoplenty:shrubland` et `dead_forest` servent aussi de passages au bord des Friches, ce qui est voulu : les villes peuvent déborder un peu.
2. Rien sur le lagon ni l'océan : la règle ci-dessus met déjà à 0 tous les océans et toutes les rivières. Dans le profil `atheria.json`, en plus : `"lostcity.avoidWater": true` et `"cities.oceanCorrectionBorder": 4`. Cette seconde valeur est déjà la valeur par défaut ; elle est notée pour mémoire.
3. Pas d'autoroute au-dessus de l'eau. Dans le profil `atheria.json` :
   - `"lostcity.bridgeChance": 0.0`
   - `"lostcity.plannedPrimaryBridgeChance": 0.0`
   - `"lostcity.plannedPrimaryBridgeMaxLength": 1` (min 1, max 64 : 0 fait planter Lost Cities 8.4.6)
   - `"lostcity.highwayRequiresTwoCities": true` (valeur par défaut)
4. À vérifier ensuite en jeu : que `cityChance` (0.00025) donne encore assez de villes une fois les biomes restreints. Les Friches et Petite-Terre font environ 11 % de la terre.
