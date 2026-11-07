# Schematics Atheria

17 builds faits pour Atheria, en blocs vanilla uniquement (aucun mod requis). Chaque build existe en deux formats :

- `worldedit/` : fichiers `.schem` pour WorldEdit (serveur Minestrator).
- `create/` : fichiers `.nbt` pour l'outil schematic de Create (monde solo ou serveur, option Print en créatif).
- `apercus/` : aperçus simplifiés, deux angles par build. `00_planche_complete.png` les montre tous.

## Poser avec WorldEdit (recommandé)

1. Envoie les `.schem` dans `config/worldedit/schematics/` du serveur (gestionnaire de fichiers Minestrator).
2. En jeu, en op : `//schem load longoni_checkpoint_nord`
3. Place-toi à l'endroit voulu, debout sur le sol. Le build est centré sur toi, et sa couche de sol remplace le bloc sous tes pieds.
4. `//rotate 90` pour le tourner si besoin, puis `//paste -a` (-a = ne pas effacer ce qui est autour).
5. Raté ? `//undo`.

L'entrée des égouts se pose autrement : debout sur la rue, elle creuse 13 blocs vers le bas.

## Les builds

| Fichier | Lieu / quête | Taille (L×H×P) |
|---|---|---|
| longoni_mur_conteneurs | Mur de Longoni, segment à répéter tous les 24 blocs | 26×11×9 |
| longoni_tour_guet | Tours le long du mur | 9×18×9 |
| longoni_checkpoint_nord | Ch1 « Le checkpoint » (Rakoto), cabine du scanner | 26×12×18 |
| longoni_tentes_quarantaine | Ch1 « Quarantaine » (Dr Ravaka) | 21×5×15 |
| longoni_panneau_executions | Ch1 « Les exemples », le nom de Tahir est sur un panneau | 11×6×5 |
| longoni_entree_egouts | Ch1 « Le vieux Anli », planque d'Anli | 7×14×13 |
| longoni_cellules | Ch2 « Faire sortir Anli » | 13×6×9 |
| corbeaux_peage_autoroute | Ch2 « Péage » (Krak) | 23×8×13 |
| tombe_tahir | Ch2 « Une tombe » | 5×4×5 |
| coconi_portail | Ch2 « Le barrage », entrée du Refuge | 21×11×8 |
| coconi_palissade_segment | Palissade du Refuge, à répéter | 8×8×4 |
| coconi_barrage | Barrage de Coconi, au-dessus d'une rivière | 29×17×12 |
| braises_hopital_campagne | Ch3 camp des Braises (Zaïna) | 19×10×18 |
| enfants_autel_du_gris | Ch4 « Les masques d'écorce » | 13×7×13 |
| nour_rame_metro | Ch4 « La fille aux racines » | 7×7×24 |
| halden_entree_campus | Ch5 « La zone grise » / « L'accueil » | 27×7×16 |
| halden_labo_symbiose | Ch3 « Le labo 7 » ou Ch5, chambre du Sujet 9 | 17×7×13 |

Les coffres sont vides : LootJS et les quêtes les remplissent. Les portes en fer s'ouvrent avec le levier ou le bouton placé à l'intérieur.

`generateur/` contient le script Python qui crée ces fichiers, pour en refaire ou en modifier.
