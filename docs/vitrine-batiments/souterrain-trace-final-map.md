# Souterrain de Longoni : tracé final (carte v4, mod de l'île), version du 10/11

Vérification hors jeu sur le relief réel du dernier rendu : interpolé tous les 2 blocs, sol à ±2.
Couverture = Y du sol − haut du volume. Règle : au moins 5 sous terre, au moins 6 sous l'eau.
Volume réservé = emprise + marge de 8 blocs. Dans ce volume, le mod garantit : pas de grottes, pas de carvers, pas d'aquifère, pas de lave, pas de minerais, pas de structures souterraines.
Le build (fil des villes) pose les parois, les voûtes, les radiers et l'eau.

| Élément | Emprise (x2/z2 exclus) | Y | Couverture min |
|---|---|---|---|
| Puits des Passeurs | 2518,-3018 → 2523,-3013 (5×5) | 44 → surface | puits (sol Y 66) |
| Bancoul (station) | 2480,-3040 → 2560,-2992 | 44 → 58 | 5,8 |
| Ligne principale (larg. 9) | 2520,-2992 → 2456,-2872 → 2456,-2688 → 2520,-2600 → 2520,-2200 → 2552,-2104 → 2568,-2032 | 44 → 56 | 7,8 |
| Station de Majicavo | 2560,-2032 → 2608,-1984 | 44 → 58 | 5,8 |
| Puits de Majicavo | 2576,-2016 → 2592,-2000 | 44 → surface | puits |
| Embranchement (larg. 9) | 2480,-3016 → 2400,-3016 → 2300,-2916 → 2200,-2816 → 2136,-2752 | 44 → 56 | 8,7 |
| Petite station 1 | 2384,-3028 → 2416,-3004 | 44 → 58 | 6,7 |
| Petite station 2 | 2284,-2928 → 2316,-2904 | 44 → 58 | 6,7 |
| Petite station 3 | 2184,-2828 → 2216,-2804 | 44 → 58 | 8,0 |
| Station des veilleurs | 2080,-2784 → 2144,-2720 | 44 → 60 | 8,0 |
| Grand Nid | 2000,-2784 → 2080,-2720 | 44 → 60 | 38 (sous une colline : on peut monter jusqu'à Y ~93) |

Corrections par rapport au tracé proposé :
- La ligne principale contourne l'anse au nord de la ligne droite, à 2509-2529,-2770 : elle passait sous l'eau.
- Le dernier coude est décalé vers l'ouest : il était trop près de la plage.
- Plafond à Y 58 pour Bancoul, Majicavo et les petites stations (sol à Y 64). Le quai à Y 48-50 tient toujours.

Points vérifiés :
- Aucun élément ne coupe la mer, le lagon, une rivière ou un lac.
- La ligne principale passe sous la RN1 sur environ 350 blocs, avec au moins 9 blocs de couverture sous la chaussée.
- La passe en jeu mesurera le vrai sol au-dessus de chaque volume.
