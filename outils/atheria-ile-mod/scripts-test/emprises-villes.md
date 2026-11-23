# Emprises proposées à Villes — 15/11, ~08:40 (hors ligne, `emprises.py`)

Source du terrain : `relief_base.bin` (b70618b3, pas 4). Contre les mondes de test pilote-v3-audit3 et pilote-v3-colline2, hors villes Lost Cities et hors lots : écart médian 1 bloc, 90e centile 1 bloc. Ce sont des hauteurs de terrain naturel, sans les bâtiments Lost Cities.
Contraintes appliquées :
- au moins 54 blocs de l'axe de la RN1 ;
- aucun chevauchement avec les lots (marges comprises), les plateaux avec leur fondu, les volumes souterrains (marge 8), les sculptures, la zone de relief libre ni la zone de forme de C24.

## 1. Rue haussmannienne 128 × 112, à Y 67
| | Emprise | Y moy / min / max | Pente | Terrassement à Y 67 | RN1 (axe) | Biome | Remarques |
|---|---|---|---|---|---|---|---|
| **A (proposée)** | x 2912..3024, z -768..-640 (112 en x, 128 en z) | 65,6 / 64 / 68 | 3,3 % vers l'ouest | remblai moyen 1,4 ; déblai max 1 | 56 | plains | dans le rayon haussmann, à 72 blocs du centre (2920,-840) ; hors zone_biome Mamoudzou (z > -780) ; rien d'autre |
| B | x 2928..3040, z -856..-728 | 64,6 / 64 / 68 | 1,9 % | remblai 2,4 | 72 | plains | **chevauche l'ancien pilote** sur z -856..-849 ; touche le centre haussmann |

A est à 56 blocs de l'axe : la RN1 longe le bord ouest. B est plus loin de la route, mais il faudrait rogner 8 blocs au nord.

## 2. Centre commercial inondé 128 × 128
| | Emprise | Y moy / min / max | Pente | Sous Y 63 | RN1 | Biomes | Remarques |
|---|---|---|---|---|---|---|---|
| **1 (proposé)** | x 2968..3096, z -1252..-1124 | 63,0 / 48 / 68 | 7,2 % vers l'ouest | 10 % (bord de mer à l'est) | 292 | plains, beach, warm_ocean | dans le rayon mamoudzou_verre (à 84 blocs du centre) ; zone_biome Mamoudzou |
| 2 | x 2960..3088, z -1404..-1276 | 63,0 / 48 / 68 | 8,0 % | 9 % | 328 | plains, warm_ocean, beach | aucun rayon Lost Cities ; zone_biome Mamoudzou sur le bord |
| 4 (sec) | x 2832..2960, z -1420..-1292 | 65,0 / 64 / 68 | 1,4 % | 0 % | 200 | plains, wasteland | il faudrait creuser pour l'inonder ; rayon béton à 123 |

Les sites 1 et 2 touchent l'eau à l'est, d'où le minimum à Y 48 : l'inondation y serait naturelle.

## 3. Camp des Goblini 80 × 80
- Emprise : x -2168..-2088, z -152..-72, centrée sur le lot actuel (-2160..-2096 × -144..-80, marge 16).
- Pas de conflit en dehors de son propre lot (à agrandir) ; RN1 à 486 blocs.
- **Terrain NON mesuré avec le relief actuel** :
  - relief_base n'a été cuit que sur 2 % de l'île, et aucun monde de test ne couvre r.-5.-1 / r.-5.0 ;
  - seule valeur disponible : l'ancien `base-test.bin` (île entière), qui donne Y 99..105, moyenne 101, pente 5,6 % ;
  - mais cet ancien relief s'écarte du relief actuel de 29 blocs en médiane à Mamoudzou : la valeur est indicative seulement.
  - Pour une vraie mesure, il faudrait un relief_bake de cette zone, ou une petite génération : environ 3 min de java, sous verrou.

## À signaler
- L'ancien pilote (x 2896..3023, z -960..-849) chevauche toujours lot68.
- Les emprises A et 1 ne sont pas encore des lots dans regions : à ajouter, avec une marge, une fois Villes d'accord.
- Biomes lus dans pilote-v3-colline2. Rue A n'y a que 16 chunks générés : l'extension 3, bande sud z -760..200, la couvrira.
