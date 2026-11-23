# Volumes souterrains réservés : guide pour le fil des villes (atheria_ile 0.6.2)

## Ce que le mod de l'île réserve

Le mod de l'île réserve les 11 volumes de `volumes_souterrains` : Bancoul, la ligne principale, les stations, les puits et le Grand Nid. Une marge de 8 blocs les entoure. Dans ces volumes, le monde ne génère rien :

- ni grottes de bruit, ni nouilles, ni rivières souterraines, ni tunnels de lave, ni filons ;
- ni carvers, ni minerais ;
- ni features, ni morceaux de structures, mais seulement à plus de 2 blocs sous la surface.

La surface ne change pas. Le volume reste de la roche pleine et sèche, prête à être creusée.

## Qui a le droit de poser dans les volumes pendant la génération

La liste vient de `volumes_souterrains.pose_autorisee` (dans regions.json, recopiée dans exclusions.json). Par défaut, elle vaut `["atheria_monde:*", "atheria:*"]`.

1. **Structures.** Une structure dont l'identifiant correspond à la liste pose tous ses morceaux, par exemple `atheria_monde:bancoul`.
2. **Features.** Une feature dont le type correspond à la liste. Les features qu'elle pose à son tour passent aussi.
3. **Modèles .nbt.** Un morceau tiré d'un modèle dont l'identifiant correspond à la liste, par exemple `atheria_monde:stations/majicavo`. Ça vaut même s'il est posé par la structure d'un autre mod.
4. **Finition des vitrines.** La passe 1 de `FinitionVitrines.finir` (atheria_monde) est autorisée tant que `atheria_monde:*` est dans la liste. La dépendance est souple : sans atheria_monde, rien ne change.
5. **Ton propre code de génération.**
   ```java
   fr.atheria.ile.api.IleApi.poserDansVolume(() -> { /* poses */ });
   ```
   La protection est levée sur ce fil seulement, le temps de l'appel. L'imbrication est permise, et la protection revient même si une exception est levée.

Un motif s'écrit `namespace:*` pour tout le namespace, ou `namespace:chemin` pour un identifiant exact.

## Après la génération : rien n'est bloqué

Les commandes (`/setblock`, `/fill`, `/place`), WorldEdit et la construction à la main passent par le monde chargé (`ServerLevel`, `LevelChunk`) et jamais par `WorldGenRegion`. Elles ne sont donc jamais bloquées.

Une seule exception : `/place feature` d'un minerai ne pose pas de minerai dans un volume, parce que le filtre des minerais s'applique toujours.

## Lost Cities

Lost Cities écrit la plupart de ses blocs directement dans les sections du chunk : ces poses ne sont ni bloquées ni vues par la réserve. Il en fait aussi quelques-unes via `setBlock`, et celles-là sont bloquées. Une cave ou un métro Lost Cities qui descend dans un volume serait donc **à moitié posé**.

Deux solutions :

- **Recommandée :** éviter les caves profondes et les métros Lost Cities sur les chunks de `chunks_volumes` (381 chunks, dans exclusions.json). Ces chunks ne sont pas dans `chunks_exclus`, donc on peut bâtir en surface.
- Sinon, ajouter `"lostcities:*"` à `pose_autorisee`, mais Lost Cities pourra alors entrer dans Bancoul.

## Données lisibles sans dépendance (config/atheria_ile/exclusions.json)

- `volumes_souterrains` contient :
  - `marge_blocs` ;
  - `convention` : les boîtes excluent x2 et z2, les couloirs font largeur_blocs centrée sur la polyligne, y_min et y_max sont inclus ;
  - `elements` ;
  - `pose_autorisee`.
- `chunks_volumes` : les chunks situés au-dessus d'un volume ou de sa marge.

## Zones des villes : `zones_villes` (exclusions.json version 2, atheria_ile 0.5.6f)

- Format : `[{"nom", "x1", "z1", "x2", "z2"}]`, en blocs.
  - x2 et z2 sont exclus.
  - Les boîtes sont alignées sur les chunks (multiples de 16).
- Contenu : une union de rectangles qui suit la région **Friches urbaines (Majicavo, Mamoudzou)** de carte.png.
  - Une cellule est retenue si elle contient au moins un pixel des Friches et **aucun pixel d'une autre région**. L'océan, le lagon, les rivières et les lacs sont neutres. Une cellule ne touche donc jamais Petite-Terre ni une autre région.
  - On prend la plus petite cellule (1, 2, 4, 8 puis 16 chunks) qui donne au plus 64 rectangles avec au plus 5 % de débord.
  - Carte v4 : 50 rectangles en cellules de 4 chunks, 3,2 % de débord, 95,3 % des Friches couvertes.
  - S'y ajoute la boîte du disque du **Port de Longoni** (`zones_biome`) : 2400,-3360 -> 3200,-2544.
- Le fichier est écrit par le mod de l'île de façon atomique (fichier temporaire puis déplacement).
  - `source_sha256` est le hash de regions.json **puis** carte.png : changer la carte régénère les zones.
  - Le détail de chaque taille de cellule essayée est dans le journal, à la ligne `zones_villes :`.
- atheria-monde (`ExclusionsIle`) ne laisse Lost Cities poser de villes que dans ces boîtes, en plus de son propre filtre par biome.

## API

| Méthode | Ce qu'elle fait |
|---|---|
| `IleApi.volumeA(x, y, z)` | Nom du volume (marge non comprise), ou `null`. |
| `IleApi.dansReserveSouterraine(x, y, z)` | Vrai si le bloc est dans un volume ou dans sa marge. |
| `IleApi.poserDansVolume(Runnable)` | Voir plus haut. |

## Routes et structures (0.5.2 / 0.6.2)

- `route_marge_blocs` vaut maintenant **17** (chaussée 7 + bas-côtés 10 de part et d'autre de l'axe), au lieu de 64.
  - `chunks_exclus` ne contient donc plus que les chunks réellement touchés par la chaussée et les bas-côtés, plus les lots avec leur marge.
  - Pour RN1, ça fait 2563 chunks au lieu de 6643.
- Les talus (jusqu'à 37 blocs de l'axe) restent constructibles. Le terrain y est seulement adouci.
- Une structure est refusée si sa **boîte entière** (tous ses morceaux, et pas seulement le chunk de départ) passe à moins de 17 blocs de l'axe, ou si elle entre dans un lot ou sa marge.
- Chaque structure refusée est listée dans `config/atheria_ile/rendus/rapport-structures-route.txt`, avec son identifiant, sa boîte et la raison du refus.
