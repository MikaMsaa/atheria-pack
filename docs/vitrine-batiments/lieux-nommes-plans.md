# Lieux nommés : lots dédiés à coordonnées fixes (plans, 10/11)

Principe validé par Mika le 10/11 : les lieux nommés du lore, des quêtes et du trailer sont des lots construits aux mesures et posés à coordonnées fixes. Le reste de chaque ville reste généré par Lost Cities avec les bâtiments vitrine. Tant que cela respecte la volonté initiale : qualité des builds, cohérence avec le lore, zéro défaut.

Source des mesures : `/mnt/project-files/trailer/lieux-tournage.md` (fil du trailer). Règles communes : aucun texte lisible, rien de religieux, emprises en multiples de 16 blocs, étages de 6 blocs, contrôle bloc par bloc après la pose.

Rien de ce qui suit n'est construit. Les coordonnées de pose viennent du fil de la map : `lieux-lots-coordonnees-map.md`.

## 1. Enceinte de Longoni (panorama d'ouverture, quête Puff)
- Architecture : rouille et bidonville. Site : autour de X 2800, Z -2950, sol à Y 64-83 (moyenne 67).
- Mur de conteneurs empilés sur 2 ou 3 (5 à 8 blocs de haut), continu, avec une porte nord (porte de Rayek) et une porte sud vers la RN1.
- Grue de quai (grue de la quête Puff), visible par-dessus le mur.
- Point de vue haut à l'ouest, regard vers l'est (soleil levant dans le champ), champ d'environ 150 blocs de large sans obstacle.
- Emprise prévue : segments de mur de 16 blocs répétables + 2 lots de porte 32 x 32 + lot de la grue 32 x 32.

## 2. Rue du jour 1 à Mamoudzou
- Architecture : haussmann (béton et verre en fond). Build en ruine ; le trailer le « répare » dans Blender.
- Rue droite de 64 blocs ou plus, chaussée et trottoirs de 9 à 13 blocs, façades continues des deux côtés.
- Une ruelle latérale de 3 à 4 blocs de large.
- 4 blocs libres le long d'un trottoir (emplacement du taxi), place pour une foule de 30 personnes et un pick-up.
- Emprise prévue : 2 rangées de 2 lots 32 x 32 de part et d'autre d'une bande de rue de 16 blocs (64 x 80).

## 3. Toits du parkour à Longoni
- À l'intérieur des murs. Le parcours file vers la porte qui donne sur la RN1 vers le sud. Sur la carte, la RN1 part de l'angle sud-est (2624,-2960) et la porte de Rayek est sur le mur nord (x 2528-2544) : le fil du lore doit dire laquelle des deux est la bonne.
- 4 à 5 toits plats ou peu pentus sur un parcours d'environ 40 blocs, hauteur 8 à 14 blocs.
- Écarts de 2 à 3 blocs, un seul écart de 4 blocs ; dénivelé de 3 blocs vers le bas au plus, 1 bloc vers le haut au plus.
- Zone libre de 3 x 3 sur chaque toit ; descente finale par un palier de 3 à 4 blocs (auvent, conteneur ou échafaudage).
- Emprise prévue : 48 x 32.

## 4. Pièce de la lampe à Majicavo
- Majicavo est dans les Friches, au sud de Longoni, sur la RN1 : béton en ruine.
- Pièce intérieure de 9 x 9 blocs ou plus, 4 blocs sous plafond, une seule porte de 1 à 2 blocs, fenêtres murées, aucune source de lumière.
- Place pour 8 à 10 personnes debout.
- Emprise prévue : dans un lot béton 32 x 32 (réserve au rez-de-chaussée).

## 5. Toit en ruine de Mamoudzou (mise à jour du 10/11 : plus d'hélicoptère)
- Ni le CHM ni un lieu de quête. Deux immeubles béton en ruine côte à côte.
- Toit plat de 20 x 20 ou plus, à 20 blocs de haut ou plus, atteint par une planche depuis l'immeuble voisin : vide de 3 à 4 blocs entre les deux toits, même hauteur à 1 bloc près.
- Local technique ou cage d'escalier avec un mur plein de 5 blocs de large sur 4 de haut. C'est une sortie de Nid : mycélium, air gris.
- Zone de combat libre de 15 x 15 entre ce mur et l'arrivée de la planche, sans antenne ni câble ; muret de 1 bloc tout autour.
- Emprise : lot du toit 2976,-944 -> 3008,-912 et immeuble voisin sur la variante 2944,-944 -> 2976,-912 (64 x 32 en tout), toits à Y sol + 24.

## 6. Autres lieux à construire (relevés par le fil de la map)
- Antennes du Bénara (visibles en survol, 80 à 150 blocs au-dessus du sol).
- CHM au centre de Mamoudzou, vu seulement de l'extérieur et de haut (lot 2864,-1232 -> 2912,-1184).
- Bouche des galeries sous Longoni, 3 x 3 blocs ou plus, où plonge la caméra du survol.
- Cône de l'Île du volcan : relief, côté fil de la map.
- Liste complète des écarts avec le lore : https://claude.ai/artifact/MPHxtALucKgQLVKo145eTB (à lire avant de construire).

## Méthode de pose (à choisir avec le fil de la map)
- Ville prédéfinie Lost Cities (bâtiments à des chunks fixes), ou pose par le mod de l'île.
- Dans les deux cas : la finition du mod maison (`FinitionVitrines`) doit couvrir ces lots, et le contrôle `outils\contenu\controle-villes` doit les vérifier bloc par bloc.

## 7. Souterrain : galeries du tram, Bancoul et station des veilleurs (proposition de tracé du 10/11, à valider par le fil de la map)
Répartition : je construis tunnels, stations, rames et eau du build ; le mod de l'île réserve le volume avec 8 blocs de marge (ni grottes, ni aquifère, ni minerai, ni structure).
Lore (ch4) : Bancoul est le terminus, sous Longoni, sous la bouche des Passeurs. « Une corde ou seize échelles » : quai à environ 16 blocs sous la surface. Aucun texte lisible. Galeries inondées par endroits.

Gabarit des tunnels : 7 blocs de large à l'intérieur (voie + banquette), 6 de haut, soit Y 45 à 50 à l'intérieur ; enveloppe d'un bloc, donc volume Y 44 à 51 et 9 de large.

| Segment | Points (x, z) | Largeur du volume | Y min / max |
|---|---|---|---|
| Puits des Passeurs | 2520,-3016 (dans le lot 2512,-3024 -> 2528,-3008) | 5 x 5 | 44 / surface |
| Terminus de Bancoul (station) | emprise 2480,-3040 -> 2560,-2992 | 80 x 48 | 42 / 56 |
| Ligne principale | 2520,-2992 -> 2520,-2200 -> 2584,-2072 -> 2584,-2016 | 9 | 44 / 51 |
| Station de Majicavo et sa bouche | emprise 2560,-2032 -> 2608,-1984 ; puits dans le lot 2576,-2016 -> 2592,-2000 | 48 x 48 | 42 / surface |
| Embranchement jamais ouvert | 2480,-3016 -> 2400,-3016 -> 2300,-2916 -> 2200,-2816 -> 2136,-2752 | 9 | 44 / 51 |
| 3 petites stations (quête de discrétion) | centrées en 2400,-3016 ; 2300,-2916 ; 2200,-2816 | 32 x 24 chacune | 42 / 54 |
| Station des veilleurs (mur des visages gris, campement, rame de Hajar) | emprise 2080,-2784 -> 2144,-2720 | 64 x 64 | 38 / 56 |
| Grand Nid de Bancoul | emprise 2000,-2784 -> 2080,-2720, couloir de traversée de 56 blocs d'est en ouest | 80 x 64 | 34 / 60 |

Points à vérifier par le fil de la map : que tout le tracé reste sous la terre ferme ou à 6 blocs au moins sous le fond de l'eau ; sinon déplacer les points ou descendre le segment. La ligne principale fait environ 1 000 blocs.
