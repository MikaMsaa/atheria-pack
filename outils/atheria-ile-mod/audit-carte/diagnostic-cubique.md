# Diagnostic : pourquoi la génération de l'île paraît « cubique » (14/11)

Demande de Mika : « pas réaliste, pas assez professionnel, cubique, pas assez custom ni beau, améliore tout, rajoute des détails ».

Ce diagnostic a été fait sans verrou, à partir de trois sources :
- le code `CarteIle.java` ;
- `regions.json` (`blocs_par_pixel` = **12**, `lissage_relief_pixels` 8, `lissage_cotes_pixels` 6, `deformation_bords_blocs` 28) ;
- les cartes de hauteur lues dans les .mca du monde d'audit.

| # | Source du « cubique » | Où dans le code | Exemple mesuré |
|---|---|---|---|
| 1 | **Côtes en segments droits et angles droits** : la côte vient d'une interpolation bilinéaire du champ de distance calculé par pixel de 12 blocs. Entre deux pixels, la ligne est droite, et il n'y a aucune déformation de la côte elle-même (la déformation de 28 blocs ne s'applique qu'aux régions). | `distanceBlocs` → `bilineaire(distance)` | Point 005 (3408,480) : trait de côte vertical sur environ 200 blocs (x ≈ 3418-3430), avec des crans de 12 blocs. Point 003 : côte en L. |
| 2 | **Lagon, récif et classes au pixel près** (plus proche voisin, pas de déformation) : marches de 12 blocs sur les bords du lagon et du récif. | `classeA` | bords du lagon visibles en escalier sur les captures 003 et 005 |
| 3 | **Plateaux plats et murs verticaux** : le profil de côte impose un plancher (`max(v, bas…)`) et, pour la vase, un plafond (`min(v, plafond…)`). Le terrain est écrêté en une nappe plate qui finit en mur sur la mer. | `continents`, lignes 734-736 | 005 : **75 % des colonnes de terre à Y 64 exactement**. 003 : 85 % à Y 66-67. 001 (Petite-Terre) : 61 % à Y 64. |
| 4 | **Peu de micro-relief** : le détail d'origine de Tectonic est réduit à 0,06 et il n'y a aucun bruit fin ajouté. Les grandes zones restent planes au bloc près. | `continents`, ligne 725 | idem 3 |
| 5 | **Rivières en segments droits, largeur constante, berges régulières** : même interpolation bilinéaire du champ de distance par pixel ; lit et vallée à rayon fixe (10 et 100 blocs). | `dRiviere`, `cretes`, `continents` ligne 751 | captures de rivières de l'audit, rivière de Kamel |
| 6 | **Frontières de régions encore géométriques à grande échelle** : la déformation (28 blocs, 2 octaves, 96 et 37 blocs) casse les crans, mais pas les grandes lignes droites de la carte dessinée. Le fondu de 128 blocs mélange par taches carrées (cellules). | `regionPassage`, `regionMelangee` | transitions 009-013 |
| 7 | **Terrasses régulières** dans les Canyons de latérite : paliers tous les 4 blocs (Y 104, 108, 112). C'est en partie voulu (canyon), mais trop régulier. | relief Tectonic + profil | point 004 (-3216,3264) |
| 8 | **Plages uniformes** : même profil partout (`plage_largeur_blocs` 32, hauteur max 10). Pas de dunes ni de galets, largeur constante. | profils de côte | 001, 002, 003 |
| 9 | **Aucun détail de surface propre à l'île** : pas de rochers, d'affleurements, de troncs couchés ni de taches pierreuses. Il n'y a que les features des biomes. | datapack (aucune feature ajoutée) | toutes les captures |
| 10 | **Talus de la RN1 trop réguliers** : la pente est constante sur 20 blocs, tout le long. | `Route.java` (talus) | à mesurer au prochain banc |

## Corrections proposées (copie jetable seulement, rien dans pack ni serveur)

Contrainte : RN1, lots, villes et volumes ne bougent pas au bloc près. Les corrections sont donc masquées dans `zones_villes`, dans le couloir de la RN1 (emprise + 17 blocs), dans les lots (avec leur marge) et dans les volumes.

1. **Déformation du domaine** (« domain warping » multi-octave, amplitude 24 à 48 blocs) sur la lecture de la carte : côte, classes, lagon, régions, rivières. Plus de lignes droites de pixel.
2. **Côte fractale** : bruit multi-échelle (de 200 à 8 blocs) ajouté à la distance de côte, pour créer baies, caps et criques. Intensité selon le type de côte : forte sur roche et falaise, douce sur plage.
3. **Plus de nappes plates** : plancher et plafond adoucis (transition douce au lieu de min/max dur), plus un micro-relief de 1 à 4 blocs (collines, ravines). Vraies falaises sur la Côte calcaire.
4. **Rivières** : méandres (déformation le long du lit), largeur variable (de 0,6 à 1,6 fois), berges en pente avec gravier, argile et roseaux.
5. **Transitions** de régions mêlées au bruit, au lieu de taches carrées.
6. **Plages variables** : largeur de 12 à 48 blocs, dunes basses, bandes de galets.
7. **Détails de surface par région** dans le datapack, sans nouveau mod :
   - rochers et affleurements (pierre, andésite, tuf selon la région) ;
   - troncs couchés, buissons et touffes ;
   - taches pierreuses.

**Performance** : tout est en O(1) par échantillon, avec des bruits peu coûteux et le cache 2D existant. Critère : pas plus de 10 % de chunks/s en moins.

**Contrôle avant/après**, sur les mêmes points d'audit (001, 005, 010, rivière, Coconi, Bénara, Canyons, Marais) :
- captures publiées sur la page d'audit ;
- RN1 et lots identiques au bloc près (outil `comparer_categories.py`) ;
- 0 eau dans les villes ;
- aucun crash.
