# Lieux du lore : coordonnées proposées (île, seed 20261108) — 10/11

Calculé hors jeu, sans rien poser dans le monde, sans toucher à `regions.json`. Sources :
- la carte v4 (`esquisses/v4/carte-v4.png`, qui est aussi la `carte.png` de la copie de test) et `relief.png` ;
- `regions.json` (régions, rivières et lacs dessinés, axe réel de la RN1 échantillonné tous les 2 blocs, lots et volumes souterrains) ;
- le rendu réel du générateur (`resultats-reprise-C`, 1 échantillon tous les 32 blocs, interpolé) pour le sol, l'eau et les biomes.

**Lecture des colonnes**
- **Lot** : `x1,z1 → x2,z2`, avec x2 et z2 exclus, aligné sur les chunks (multiples de 16).
- **Y** : sol moyen / min / max sur le lot (±2 blocs).
- **Pente** : plus forte pente mesurée sur 4 blocs.
- **RN1** : distance du bord du lot à l'axe de la route, puis entre parenthèses l'abscisse `s` le long de la route depuis Longoni.
- Biomes : les 2 ou 3 plus fréquents sur le lot (1 relevé par chunk).

**Règles vérifiées sur chaque proposition**
- Aucun élément religieux.
- Aucun lot hors-route à moins de 17 blocs de l'axe : seuls la station Total, le péage, le pont et les barrages de Majicavo sont sur la route.
- Pas d'eau dans le lot, sauf les quais, signalés.
- Pas de chevauchement avec les lots déjà fixés.
- Le disque de la lune de sang de Coconi (rayon 240) ne contient aucun autre lieu.
- Les lieux de faction font au moins 48 × 48, ce qui laisse de la place pour plusieurs alliances et plusieurs entrées. Les villes font 128 × 128.

**Zones Lost Cities** : les régions Friches et Petite-Terre. Un lot du mod de l'île n'empêche pas Lost Cities d'y bâtir dans les biomes de ville (plains, dryland, hot_shrubland, sparse_jungle). Les lieux concernés sont marqués **LC**. Les 5 villes mortes, Choungui, Vahibé et Handrema sont toutes **hors des zones LC** : ce seront donc des lots construits à la main.

Le sol sous un lot n'est connu qu'à ±2 blocs, avec un rendu à 32 blocs. La passe en jeu fera un zoom 160 × 160 de chaque lot avant toute construction.

## Tableau

| N° | Lieu | X, Z (centre) | Y moy / min / max | Pente | Biome réel | Région | Lot (x1,z1 → x2,z2) | RN1 | Remarques et alternatives |
|---|---|---|---|---|---|---|---|---|---|
| 1a | Majicavo, ruines (déjà fixé) | 2560,-2000 | 63.9 / 64 / 65 | 0.03 | dryland (ville) | Friches **LC** | salle à la lampe 2544,-2016 → 2576,-1984 ; bouche du tram 2576,-2016 → 2592,-2000 | 22 | Zone de biome forcée 2528,-2032 → 2592,-1968. Inchangé. |
| 1b | Prison des Coupeurs = prison Spore | 2584,-2136 | 64 (bord de mer) | — | dune_beach, plains | Friches **LC** | boîte réelle 2561,-2159 → 2608,-2112 (Y 35-82) | 33 (s 993) | Cohérent : la prison est générée par Spore, sur la terre au test C2 (le rendu à 32 blocs la met sur la ligne de côte). 34 blocs de l'axe, donc gardée par la règle des 17 blocs ; 130 blocs au nord des ruines. À garder telle quelle. |
| 1c | Barrage nord de Majicavo | 2530,-2230 | 64 | 0.00 | dune_beach | Friches **LC** | sur la chaussée : 2512,-2240 → 2544,-2224 | 0 (s 899) | Au nord de la prison, au début de la ligne droite du trailer. Construit en jeu sur la route générée, pas en lot (un lot couperait la RN1). |
| 1d | Barrage sud de Majicavo | 2556,-1836 | 64.6 / 64 / 65 | 0.03 | dead_forest | Friches **LC** | sur la chaussée : 2544,-1840 → 2576,-1824 | 0 (s 1304) | 150 blocs au sud des ruines. Même remarque. |
| 2 | Mamoudzou + CHM (déjà fixés, vérifiés) | rue 2952,-904 ; CHM 2888,-1208 | rue 65.0 / 64 / 66 ; CHM 65.0 / 64 / 66 | 0.05 | plains (ville) | Friches **LC** | rue 2896,-912 → 3008,-896 ; CHM 2864,-1232 → 2912,-1184 | rue 140, CHM 215 | Valeurs identiques à `lieux-lots.md`. Au sud de Majicavo (le CHM est à s 2030, Majicavo à s 1130). Rien à changer. |
| 3 | Station Total | 2792,-552 | 66.5 / 66 / 68 | 0.05 | wasteland (hors ville) | Friches **LC** | 2768,-576 → 2816,-528 (48 × 48), côté ouest | 31 (s 2664) | Après Mamoudzou, 490 blocs avant le péage. Ni eau, ni biome de ville, donc Lost Cities n'y bâtit pas. Alternative côté est : 2880,-528 → 2928,-480 (Y 66, 31 blocs), mais en biome plains (ville LC). |
| 4 | Péage de Bacar B. | 2468,-334 | 65.8 (axe) ; guérites 66.1 et 65.2 | 0.04 | dead_forest 50 % à ±150 | Friches **LC** (limite du Marais) | guérites : nord 2432,-400 → 2464,-368 ; sud 2480,-304 → 2512,-272 (32 × 32) | guérites 32 (s 3150) | Sur la RN1 entre Mamoudzou et Coconi. Forêt (morte) des deux côtés, donc le contournement du ch2-5c passe par le bois au nord ou au sud. Les barrières se posent en jeu sur la chaussée. Alternative 100 blocs avant (s 3100, 2513,-356) : forêt 47 %. Entre Mamoudzou et Coconi, aucune forêt vivante ne borde la route. |
| 5 | Pont de Kamel | 2060,-198 | eau 63, tablier ~65 | — | dead_forest / rivière | Friches **LC** / Marais | sur la route : traversée 2075,-206 → 2046,-189 (s 3567 → 3601) | 0 | C'est le seul pont de la RN1 sur la **rivière dessinée**, et le plus proche de Longoni (3,6 km de route, hors de l'enceinte). Les 2 autres traversées d'eau douce sont des chenaux du Marais : 1216,-106 (s 4491) et 856,-96 (s 4916). **Place pour un PNJ dessous : non en l'état** (tablier « mince » à mer+2, soit environ 1 bloc d'air). À faire : relever le tablier à Y 68-69 avec des rampes en jeu, ou creuser la berge sur 3 blocs sous le tablier côté amont. Pas de lot : il couperait la route. |
| 6 | Coconi (Refuge, barrage, champs, granges, marché) | -1040,-848 | 70.9 / 69 / 73 | 0.08 | terres_agricoles, field, pasture | Plaines agricoles | 128 × 128 : -1104,-912 → -976,-784 | 76 (s 8623) | Près de la RN1 et sur terre sèche : les plaines au bord de la route sont trempées sur s 6600 → 8400 (40-70 % d'eau au rendu). **Barrage** au bord sud du lac dessiné (-950,-1068), à 160 blocs au nord du lot : Coconi est en aval, « derrière » le barrage. Le lac (-1032 → -852, -1236 → -1068) sert de retenue. **Écart à signaler** : aucune rivière dessinée ne traverse les plaines de Coconi. La seule rivière stable proche naît à -1092,732, au pied du Bénara, dans les Hauts plateaux (63 blocs de la RN1, s 10655), hors des plaines. Pour une rivière avec courant, il faut soit ajouter à la carte un exutoire dessiné du lac vers l'est (décision de Mika), soit placer le barrage sur la rivière des Hauts plateaux et faire venir l'eau par un canal. Disque de la lune de sang (centre -1040,-848, rayon 240) : la RN1 le traverse, aucun autre lieu dedans. Alternatives : -1552,-672 → -1424,-544 (Y 70, à 10 blocs de l'axe : trop près, à décaler de 16 vers l'ouest) ; -1472,-1024 → -1344,-896 (Y 76, 80 blocs). |
| 7 | Camp caché des Goblini | -2128,-112 | 112.0 / 111 / 113 | 0.05 | bamboo_jungle (100 %) | Jungle de l'Ouest | 64 × 64 : -2160,-144 → -2096,-80 | 510 | Forêt dense en hauteur, invisible depuis la route. À 1 230 blocs de Coconi, mais aucune forêt vivante n'existe plus près : les plaines n'en ont pas. Alternative plus proche : -1840,-128 → -1776,-64 (lush_valley et bambous, dans un vallon, 195 blocs de la RN1, Y 69-83, pente 0.55). |
| 8 | Station radio + tombe de Rayade | -1048,1208 | 114.5 / 114 / 115 | 0.04 | coniferous_forest | Hauts plateaux | radio 48 × 48 : -1072,1184 → -1024,1232 ; tombe 16 × 16 : -1056,1232 → -1040,1248 | 40 (bout de la RN1, -984,1176) | Au terminus de la route du Bénara. Plat, en forêt de conifères. Alternative : -1120,864 → -1072,912 (Y 106-111), mais seulement 2 blocs du bord de l'axe : à décaler. |
| 9 | Mont Bénara (émetteur, antennes, sommet gelé) | 224,1440 | ≥ 217 (plafond du rendu ; le point le plus haut de la génération est à 244) | 0.55 | frozen_cliffs | Sommet gelé du Bénara | 64 × 64 : 192,1408 → 256,1472 | 1 199 | Centre de la zone du rendu à Y ≥ 216, le point le plus « intérieur », à 64 blocs du bord de la zone : c'est le plus haut de Grande-Terre. Visible du ciel : massif blanc de 1,1 × 1,6 km. Le vrai Y sera mesuré en jeu. Le point le plus haut du dessin (220,1704) ne fait que Y 191 au rendu, donc il n'est pas retenu. L'île du volcan monte aussi au-delà de 216 (-2848,4581), mais c'est une autre île. |
| 10 | Champs de mines (cols du Bénara) | O -672,1424 ; S 256,2512 ; SE 784,2144 | 164.8 / 160 / 170 ; 165.9 / 154 / 176 ; 120.2 / 113 / 133 | 0.23 ; 0.44 ; 0.47 | forested/temperate_highlands ; frozen_cliffs, snowy_shield ; snowy_shield | Hauts plateaux ; Sommet ; Sommet | O -704,1392 → -640,1456 ; S 224,2480 → 288,2544 ; SE 752,2112 → 816,2176 (64 × 64) | 354 ; 1 778 ; 1 972 | Points bas d'anneaux de 700 et 950 blocs autour du sommet, donc des cols. Le col ouest est sur le chemin naturel depuis le bout de la RN1. Autre col : -892,1275 (Y 134), mais à 135 blocs de la route, trop exposé. |
| 11a | Labo 7 (terminal 1-0-4-7), site A | -1808,-5104 | 103.2 / 103 / 104 | 0.03 | rocky_shrubland, white_cliffs, crag | Côte calcaire (Grande-Terre) | 96 × 96 : -1856,-5152 → -1760,-5056 | 3 534 | Plateau isolé au nord, à 365 blocs de la falaise. Recommandé : le plus à l'écart. |
| 11b | Labo 7, site B | -3056,640 | 139.2 / 139 / 140 | 0.04 | rainforest | Jungle de l'Ouest | 96 × 96 : -3104,592 → -3008,688 | 1 525 | Replat de jungle en hauteur, caché sous la canopée. |
| 12 | Bunker PAF (journal de l'opérateur) | 488,-4824 | 108.3 / 106 / 111 | 0.13 | savanna | Savane sèche (Grande-Terre) | 80 × 80 : 448,-4864 → 528,-4784 | 2 762 | Butte dominante à 300 blocs de la côte nord, facile à garder avec une seule approche en pente. Alternative : 240,-5104 → 320,-5024 (Y 100-123, sur la falaise). |
| 13a | Relais ch3 : tour Structory (Kaizen) | -2040,1320 | 182.8 / 176 / 190 | 0.36 | forested_highlands, fir_clearing | Hauts plateaux | 48 × 48 : -2064,1296 → -2016,1344 | 1 004 | Sommet local à Y 190 (≥ 120 demandé). Point le plus haut hors du Bénara et du volcan. |
| 13b | Relais ch3 : mine | -1024,2592 | 111.0 / 111 / 111 | 0.03 | eroded_badlands | Canyons de latérite rouge | 64 × 64 : -1056,2560 → -992,2624 | 1 384 | Plat au pied des canyons, entrée de mine dans la falaise voisine. 1 180 blocs de Vahibé. |
| 13c | Relais ch3 : bunker | -3712,1056 | 68.0 / 68 / 68 | 0.05 | tropical_jungle | Jungle de l'Ouest | 64 × 64 : -3744,1024 → -3680,1088 | 2 314 | Les 3 relais sont dans 3 régions différentes. |
| 14 | Choungui (station de ski fantôme, bois) | -288,1520 | 176.1 / 175 / 178 | 0.10 | alpine_grove (sapins, donc du bois), wintry_forest | Sommet gelé du Bénara | 96 × 64 : -336,1488 → -240,1552 | 719 | Versant ouest, à 560 blocs du sommet : la pente sous le lot fait une piste naturelle. Alternative : 560,2624 → 656,2688 (Y 150, versant sud, basalt_cliffs, sans arbres). |
| 15 | Vahibé (ville minière, terre cuite) | -2032,2064 | 143.9 / 143 / 145 | 0.04 | savanna_badlands, bryce_canyon | Canyons de latérite rouge | 128 × 128 : -2096,2000 → -1968,2128 | 1 283 | Mesa plate au milieu des canyons rouges. Alternative : -3104,2528 → -2976,2656 (Y 140, badlands et bryce, plus près de la côte ouest). |
| 16 | Handrema (cité des cendres) | 1504,2736 | 70.5 / 70 / 71 | 0.05 | plaine_cendres, gravel_desert | Plaine de cendres | 128 × 128 : 1440,2672 → 1568,2800 | 2 705 | Au cœur de la plaine. Alternative : 3616,2720 → 3744,2848 (foret_calcinee, près de la côte est). |
| 17a | Mtsamboro (ville morte) | -3088,-5248 | 65.6 / 65 / 67 | 0.08 | grassland | Côte calcaire | -3152,-5312 → -3024,-5184 | 4 252 | Pointe nord, comme la vraie. Hors LC, donc lot fait main. 700 blocs du phare. |
| 17b | Kawéni (ville morte) | 1504,-2368 | 103.8 / 103 / 105 | 0.05 | wasteland_steppe | Savane sèche | 1440,-2432 → 1568,-2304 | 917 | Plateau à l'ouest de la ligne Longoni-Majicavo. Hors LC, lot fait main. |
| 17c | Sada (ville morte) | -3936,512 | 67.4 / 66 / 68 | 0.05 | bamboo_jungle | Jungle de l'Ouest | -4000,448 → -3872,576 | 2 319 | Côte ouest, comme la vraie, à 526 blocs de la mer. Hors LC, lot fait main. |
| 17d | Dembéni (ville morte) | 2048,256 | 65.9 / 66 / 66 | 0.03 | zone_contaminee | Marais aux spores | 1984,192 → 2112,320 | 303 | Centre-est. Hors LC, lot fait main. |
| 17e | Chirongui (ville morte) | 800,3776 | 65.8 / 66 / 66 | 0.03 | mangrove_swamp | Mangroves du Sud | 736,3712 → 864,3840 | 3 064 | Sud. Hors LC, lot fait main. Les 5 villes mortes sont dans 5 régions sans autre ville. |
| 18 | Barge : quai Grande-Terre | 3072,-688 | 64 | 0.08 | dryland, dune_beach | Friches **LC** | 64 × 32 : 3040,-704 → 3104,-672 (moitié sur l'eau : quai) | 184 | Traversée la plus courte entre GT et PT : **134 blocs**, de 3128,-672 à 3256,-712, en face de la rue de Mamoudzou. Un quai de 64 blocs laisse place à 3 ou 4 barges (une par alliance). |
| 18 | Barge : quai Petite-Terre | 3296,-704 | 77.2 / 64 / 91 | 0.55 | dune_beach, volcanic_crater | Petite-Terre **LC** | 64 × 32 : 3264,-720 → 3328,-688 | 408 | La plage est étroite au pied du flanc du cratère : il faut un quai sur pilotis plus un escalier. Alternative de traversée (175 blocs) : PT 3264,-992 ↔ GT 3104,-1064, en face du CHM. |
| 19 | Village des pêcheurs du Sud (Jeffrey) | 2480,5072 | 63.8 / 64 / 64 | 0.00 | mangrove_swamp, dune_beach | Mangroves du Sud | 64 × 64 : 2448,5040 → 2512,5104 | 5 132 | Plat, au ras de l'eau, à 119 blocs de la côte : pirogues dans les chenaux. Alternative : -1344,5280 → -1280,5344 (dune_beach, sud-ouest). |
| 20 | Crique des contrebandiers (kwassa) | 3096,-120 | 63.8 / 64 / 64 | 0.00 | dead_forest, dune_beach | Friches **LC** | 48 × 48 : 3072,-144 → 3120,-96 (12 % d'eau : la crique) | 385 | Côte de Grande-Terre face à la pointe sud de Petite-Terre, cachée par la forêt morte, à 520 blocs de la barge. Alternative : 3024,-1344 → 3072,-1296 (dune_beach, à 670 blocs de la barge). |
| 21 | Phare (cache un Puff) | -2640,-5744 | 65.9 / 66 / 66 | 0.03 | dune_beach | Côte calcaire | 32 × 32 : -2656,-5760 → -2624,-5728 | 4 510 | Cap le plus marqué de l'île : 99 % de mer dans un rayon de 250. Pointe nord, 19 blocs de la côte. Alternative : cap ouest -5152,-688 → -5120,-656 (98 % de mer, Jungle). |
| 22 | Parc de Zamani (enclos en ruine) | -1920,3536 | 67.4 / 66 / 69 | 0.10 | volcanic_plains | Île du volcan | 128 × 128 : -1984,3472 → -1856,3600 | 2 456 | Sur l'île du volcan, à plus de 2 km de toute ville. Alternative : -1408,4544 → -1280,4672 (Y 107). |
| 23 | Îlot de la ICE (base militaire) | 4496,4672 | 68.3 / 68 / 69 | 0.03 | tropics | Îlot de la ICE (sud-est) | 96 × 96 : 4448,4624 → 4544,4720 | 5 283 | Centre de l'îlot, à 468 blocs de toute côte. Alternative : 4144,4448 → 4240,4544. |
| 24a | Souterrain : bouche visible (trailer) | 2160,-2768 | 68.6 / 66 / 74 | 0.36 | wasteland_steppe | Friches **LC** | 32 × 32 : 2144,-2784 → 2176,-2752 | 255 | Voir le détail ci-dessous. |
| 24b | Passage des Passeurs | 2520,-3016 → Bancoul | — | — | — | sous Longoni | à ajouter aux volumes | — | Voir le détail ci-dessous. |

## 24. Souterrain de Longoni : cohérence et propositions

Le tracé validé (`docs/vitrine-batiments/souterrain-trace-final-map.md`), c'est-à-dire Bancoul à Y 44-58 et la ligne principale vers Majicavo, est repris tel quel sur la carte, en pointillés.

**Bouche visible depuis l'extérieur (trailer)**
- La colline du Grand Nid monte à Y 98-106 au-dessus de la station des veilleurs (2080 → 2144, -2784 → -2720, Y 44-60).
- Son flanc est descend à Y 66-72 vers x 2150-2180, au-dessus de la plaine. C'est le seul endroit près des galeries où une bouche horizontale sort d'un versant : partout ailleurs, le sol est plat à Y 64-69 et l'entrée serait un simple trou.
- Proposition, « bouche des veilleurs » : un couloir de 7 blocs de large qui part du mur est de la station des veilleurs (x 2144) vers l'est jusqu'à x 2172, sur z -2760, de Y 56 jusqu'à la surface. Le porche est dans le lot 2144,-2784 → 2176,-2752.
- Il se voit depuis la plaine et depuis la RN1, qui passe à 270 blocs à l'est (2424,-2744). C'est un bon plan de trailer : le porche noir dans le flanc de la colline.
- **À ajouter aux volumes** (proposition, rien n'est modifié) :
  `{"nom": "Bouche des veilleurs", "forme": "couloir", "points": [[2144,-2760],[2172,-2760]], "largeur_blocs": 9, "y_min": 56, "y_max": "surface"}`

**Passage des Passeurs (ch4_1k)**
- Constat : le puits des Passeurs actuel (2518,-3018 → 2523,-3013) tombe **à l'intérieur de l'emprise de Bancoul** (2480 → 2560, -3040 → -2992). Il débouche donc directement dans la salle, ce qui n'en fait pas un passage secret.
- L'accès connu de la PAF reste la ligne principale (depuis Majicavo) et le quai.
- Proposition : le puits descend sous le plancher de Bancoul jusqu'à Y 38. De là, une galerie basse et étroite (3 de large, Y 38-42) longe le dessous de la salle vers le nord, puis vers l'est. Elle remonte par une trappe cachée dans l'angle nord-est de Bancoul, au sol de la station (Y 44).
- Tracé : `[[2520,-3016],[2520,-3034],[2550,-3034]]` en Y 38-42, puis une trappe 2548,-3036 → 2553,-3031 en Y 38-44.
- **À ajouter aux volumes** (sinon, sous Y 44, des grottes naturelles peuvent le couper) :
  - `Puits des Passeurs` : y_min de 44 à 38 ;
  - `{"nom": "Passage des Passeurs", "forme": "couloir", "points": [[2520,-3016],[2520,-3034],[2550,-3034]], "largeur_blocs": 3, "y_min": 38, "y_max": 42}` ;
  - `{"nom": "Trappe des Passeurs", "forme": "boite", "x1": 2548, "z1": -3036, "x2": 2553, "z2": -3031, "y_min": 38, "y_max": 44}`.
- Le sol de Bancoul est à Y 65.5. La couverture au-dessus de la galerie est donc de 23 blocs, et toute la galerie reste sous l'enceinte : rien ne dépasse du lot.

## Points à trancher par Mika
1. **Coconi** : les plaines n'ont pas de rivière dessinée. Choisir entre :
   - le barrage sur le lac dessiné, comme proposé (le lac sert de retenue) ;
   - un exutoire du lac ajouté sur la carte ;
   - le barrage sur la rivière des Hauts plateaux (-1092,732), avec Coconi alors à 1,5 km de son barrage.
2. **Pont de Kamel** : relever le tablier de la RN1 sur la rivière, ou poser un pont bâti à côté.
3. **Barrages de Majicavo et péage** : ils se construisent en jeu sur la route générée. Des lots ne peuvent pas couvrir la chaussée sans couper la RN1.
4. **Souterrain** : ajouter aux volumes les 3 éléments ci-dessus (puits, passage, trappe), plus la bouche des veilleurs.

Fichiers : `carte-lieux.png`, même dossier. Outils hors jeu : `Q.java` (requêtes) et `Carte.java` (dessin), dans le scratchpad de la session.
