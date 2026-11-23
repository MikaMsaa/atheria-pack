# Lots des lieux nommés et tracé de la RN1 (mod de l'île 0.5.0, carte v4) : version du 10/11

Calcul hors jeu sur le rendu réel : 1 point tous les 32 blocs, interpolé, Y à ±2.
Les lots sont alignés sur les chunks.
Biomes ville d'après le worldstyle Lost Cities : plains, dryland, hot_shrubland, sparse_jungle (port de Longoni).
Mesures du trailer : /mnt/project-files/trailer/lieux-tournage.md

## 1. Enceinte de Longoni (disque du port : centre 2800,-2950, rayon 400, biome sparse_jungle)
- Enceinte 176×128 : 2448,-3088 → 2624,-2960 (chunks 153,-193 → 163,-186).
  - Y moyen 65, de 64 à 71, pente max 0,26.
  - 4 échantillons d'eau dans l'angle NE, contre la baie.
  - À 105 blocs de la côte.
- Porte nord (porte de Rayek) : sur le mur nord z = -3088, ouverture de x 2528 à 2544 (chunk 158,-194). Y 64-65.
- Porte sud ou côté route (départ de la RN1) : angle SE, 2624,-2960.
- Mur est : x = 2623, de z -3088 à -2961.
- Quai : 2624,-3088 → 2656,-3072, Y 64.
- Grue : 2640,-3072 (chunk 165,-192), au bord du quai.
- Point haut pour le panorama vers l'est :
  - 2200,-2600 (Y ≈ 91), à 541 blocs au SO ;
  - variante : 1986,-2684 (Y ≈ 109).
  - Aucun relief à moins de 300 blocs à l'ouest. Pour un plan plus proche, il faut un point haut construit (château d'eau, ou tour d'angle SO).

## 2. Majicavo, salle à la lampe (ruines au bord de la RN1, au bout de la ligne droite)
- Lot 16×16 : 2544,-2000 → 2560,-1984 (chunk 159,-125).
  - Y 64, pente 0,03, biome dryland.
  - À 100 blocs de la côte. Bord du lot à 22 blocs de l'axe de la RN1.
- Variante 32×32 avec les ruines autour : 2544,-2016 → 2576,-1984.
- Autre choix : 2544,-2064 → 2560,-2048 (plains).

## 3. Mamoudzou, face à Petite-Terre (quartier x 2660 → 3040, z -1300 → -780)
- Rue droite est-ouest, lot 112×16, rue de 11 blocs dans l'axe z ≈ -904 : 2896,-912 → 3008,-896.
  - Y 64-66, biome plains.
  - Au bout de la rue, Petite-Terre est dans l'axe.
- Ruelle nord-sud de 3 ou 4 blocs, côté sud de la rue : 2944,-896 → 2960,-848.
- Toit plat ≥ 20×20 à ≥ 20 de haut, côté nord de la rue : lot 32×32 2976,-944 → 3008,-912 (Y 64-65, toit à Y ≥ 85).
  - Variante : 2944,-944 → 2976,-912.
- CHM, lot 48×48 : 2864,-1232 → 2912,-1184 (Y 64-66, plains).
  - Variante en bord de RN1, 64×48 : 2688,-1264 → 2752,-1216.
- ATTENTION : à cet endroit, la zone de biome ville (plains) est étroite : 2896 → 3008 × -944 → -848. Autour, c'est du wasteland et du wasteland_steppe, hors de la liste Lost Cities. Il faudra élargir les biomes ville de Mamoudzou ou poser une zone de biome forcé (je peux l'ajouter au mod).

## 4. RN1
- Chaussée de 15 blocs, 10 blocs de bas-côtés de chaque côté, puis 20 de talus. Pente ≤ 1/8.
- Aucune structure à moins de 64 blocs de l'axe.
- Longueur 11 338 blocs, Y 64 → 136, aucune traversée de mer, 2 ponts sur l'eau douce.
- Ligne droite du trailer : 2536,-2408 → 2520,-1944 (464 blocs, dont 370 droits ; dénivelé ≤ 1).
- Étapes le long de la route :
  - Longoni : porte SE 2624,-2960 ;
  - ligne droite du trailer ;
  - Majicavo ;
  - Mamoudzou : x 2600-2860, z -1450 → -536 ;
  - Marais aux spores ;
  - Coconi ;
  - pied du Bénara : fin à -984,1176 (Y ≈ 115).
- Points (x,z), après le départ :
  2744,-2984 2712,-2968 2680,-2904 2456,-2808 2424,-2744 2472,-2680 2568,-2648 2600,-2584 [2536,-2408 2520,-1944] 2616,-1656 2600,-1448 2632,-1384 2632,-1192 2760,-840 2856,-728 2856,-536 2776,-376 2552,-376 2392,-296 2296,-296 2056,-200 1944,-104 1864,-104 1752,-40 1544,-40 1384,-120 1224,-120 1112,-8 984,-8 856,-72 856,-152 744,-344 744,-568 536,-808 424,-1016 440,-1048 392,-1144 328,-1112 296,-1144 344,-1240 312,-1256 408,-1336 264,-1368 184,-1320 104,-1336 -88,-1496 -216,-1720 -440,-1784 -632,-1672 -696,-1576 -856,-1448 -936,-1304 -1096,-1208 -1112,-1064 -1176,-936 -1240,-904 -1320,-792 -1464,-408 -1464,-360 -1384,-248 -1608,8 -1320,440 -1048,680 -1016,744 -1080,936 -984,1176
- Dans la copie de test de l'île, Lost Cities n'est pas actif dans l'overworld. Le conflit entre la RN1 et Lost Cities est donc à vérifier dans le vrai pack (fil des villes).
