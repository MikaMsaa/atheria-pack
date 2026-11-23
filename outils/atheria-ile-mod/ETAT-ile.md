# État du mod de l'île : 0.7.3 (10/11/2026, 21 h 30)

## À installer ensemble

- **`outils\atheria-ile-mod\atheria-ile-0.7.3.jar`** (149 540 octets).
  - Sources : `src\`, une seule ligne de code.
  - Commande de construction : `cmd /c "powershell -NoProfile -ExecutionPolicy Bypass -File construire.ps1 atheria-ile-0.7.3.jar"`.
    - Ne pas la lancer avec `2>&1` : la note de javac arrête le script avant le jar.
    - Après chaque construction, vérifier la taille du jar et une chaîne de caractères dans le `.class`.
- **`outils\atheria-ile-mod\atheria_ile_datapack-1.0.zip`**, à mettre dans `<monde>\datapacks\atheria_ile_datapack.zip`.
  - **Le datapack avait lui aussi deux lignes.** La 0.8 (volumes) contenait les 5 enveloppes de densité des volumes : `volumes_caves`, `noodle`, `filons`, `riviere_souterraine` et `tunnel_lave`. La 0.9 (routes) ajoutait le tag des biomes de routes.
  - La 1.0 est la 0.9 plus ces 5 enveloppes. Sans elles, les grottes de bruit et l'aquifère ne sont pas neutralisés dans les volumes : c'était la cause de l'eau dans le Grand Nid.
- **`outils\atheria-monde-mod\atheria-monde.jar`** (114 817 octets, fil des villes), qui lit `zones_villes`.

## Historique de la fusion et des versions

- **0.7.0** : fusion à 3 voies.
  - La base commune est 0.5.1, et non 0.5.3. L'ancienne `src` 0.6.2 est gardée dans `sauvegarde-0.6.2-src`.
  - La branche 0.5.6f (routes, rivières, ponts, finition, `zones_villes`) reçoit exactement les ajouts des volumes 0.6.2.
  - Un seul `exclusions.json`, version 2. Il contient `chunks_exclus`, `chunks_volumes`, `volumes_souterrains` (avec `pose_autorisee` et `marge_dessous_blocs`) et `zones_villes`.
- **0.7.1** :
  - **Marge du dessous des volumes : 12 blocs**, au lieu de 8.
  - **Pente des routes** : mesurée sur l'abscisse réelle, par fenêtres de 8, 16 et 32 blocs, en déduisant l'escalier des Y entiers. Le faux « 0,245 » du lacet disparaît : la valeur lue est 0,124, pour une visée de 0,125.
  - **Zones de biome** : nouvelle clé `"zone_ville": true`. La boîte de la zone est alors ajoutée à `zones_villes`.
  - **Sondes de test** dans `Sondes.java` : `sonde_villes`, `sonde_volumes_chunks` et `sonde_volumes_en_plus`. La sonde des volumes vide aussi la colonne d'un bloc vide.
- **0.7.2 / 0.7.3** :
  - Une structure absente de `pose_autorisee` est **refusée en entier** si sa boîte réelle croise la réserve d'un volume. La distance est calculée vraiment, sans boîte englobante.
  - **`refus_par_chunk`** (par défaut `["subsurface:*"]`) : ces structures sont refusées sur tout chunk de volume. Leurs boîtes sont factices (1 x 7 blocs à Y 313), alors qu'elles creusent tout le chunk.
  - Chaque refus est inscrit dans `rapport-structures-route.txt`, avec la raison « volume souterrain X ».

## Tests hors ligne sur la config de la copie

- TestPose : 20/20.
- TestConflit : 7/7.
- TestExcl : OK.
- TestVolumes : 24/25. Le seul échec est un test écrit pour l'ancienne marge du dessous de 8 blocs : Bancoul à Y 35 est maintenant réservé.
- Les sources sont dans `scratchpad\t070` (ce fil) et dans `tx`/`tx52` (fil précédent).
- Outils de placement : `Souterrain`, `NidRecherche`, `OutilVilles`, `TestBoite` et `TestLigne`.

## Derniers tests (verrou, Xmx 4G, arrêt propre, `valider_volumes` jamais lancé)

| Test | Résultat |
|---|---|
| `resultats-070` (0.7.0) | Lacet sans trou ni marche. À cette époque, Majicavo et Longoni n'avaient aucune ville (Lost Cities tirait les centres au hasard). |
| `resultats-071` (0.7.1, villes prédéfinies) | Villes : Majicavo 109 chunks, Mamoudzou 567, Longoni 262, **tous dans `zones_villes`**. Coconi 0, route du Bénara 0. Aucun fichier `predefinedcities` refusé. |
| `resultats-072` / `073` | Refus de structures sur les volumes : 32, puis 178 refus `subsurface`. Les vides du Grand Nid restaient identiques au bloc près : la structure n'en était pas la cause. |
| **`resultats-074`** (0.7.3 + datapack 1.0) | **Volumes : 0 vide et 0 minerai** dans le Grand Nid, la Ligne principale, l'Embranchement et 4 chunks de marge. Il reste 14 blocs d'air à Y 65-66, sous des feuilles de jungle : la sonde prend le feuillage pour la surface, ce n'est pas un vide. La prison des spores n'est plus refusée. Les villes sont inchangées, la pente vaut 0,124 et il n'y a aucun trou. |

## Réglages de la copie de test (`outils\serveur-ile-test`)

### `config\atheria_ile\regions.json`

- Sauvegardes : `regions-avant-ligne2546`, `-avant-073`, `-avant-majicavo240`, `-avant-lacet`, `-avant-056f`, etc.
- **Lacet de la RN1** : 240,-1130 / 196,-1196 / 440,-1262 (voir `lieux-lots.md`).
- **Ligne principale** : le point 2552,-2104 devient **2546,-2104**.
  - Points : [2520,-2992] [2456,-2872] [2456,-2688] [2520,-2600] [2520,-2200] [2546,-2104] [2568,-2032].
  - Elle passe à 11,8 blocs de la prison.
  - Couverture min 7,8. Sous la RN1, couverture min 9,0.
  - Pas d'eau, et elle rejoint toujours la station de Majicavo.
- `pose_autorisee` = `atheria_monde:*`, `atheria:*`.
- `refus_par_chunk` = `subsurface:*`.
- **Zone Majicavo** : rectangle 2288,-2128 -> 2528,-1888, bord 16, dryland, `zone_ville`.
  - Uniquement sur terre, hors des lots et hors de la prison + 16.
  - Les ruines (2560,-2000) ne peuvent pas y tenir : il y a de l'eau et deux lots autour. Le fil des villes a donc déplacé le centre de Majicavo à 2408,-2008, rayon 120.
- **Grand Nid** : boîte inchangée (2000,-2784 -> 2080,-2720). Elle est sur terre, avec au moins 30 blocs de couverture.
- **Clés de test à retirer** : `valider_routes`, `valider_routes_troncon`, `valider_routes_troncons`, `valider_routes_releves`, `arret_apres_tests`. Les clés `sonde_*` sont déjà retirées.

### Autres fichiers

- `config\atheria_ile\carte.png` : exutoire de Coconi.
- `config\atheria_ile\exclusions.json` : régénéré par le mod.
- `kubejs\data\lostcities` : copie de celui du pack, avec les 6 villes prédéfinies. Majicavo et Mamoudzou haussmann ont été recopiés avec leurs nouveaux centres. Le pack ne contient plus `ath_eglise`. Sauvegarde : `sauvegardes\kubejs-data-lostcities-avant-predefinies`.
- `config\lostcities\profiles\atheria.json` : copie de celui du pack, `cityChance` 0. Sauvegarde : `sauvegardes\atheria-profil-avant-predefinies.json`.
- `ile_test_1\datapacks\atheria_ile_datapack.zip` : version 1.0. Sauvegarde : `sauvegardes\atheria_ile_datapack-avant-1.0.zip`.
- `server.properties` : `max-tick-time=120000`.
- `mods\` : `atheria-ile.jar` = 0.7.3, `atheria-monde.jar` = 114 817 octets.

## Alerte : Chunky + Lost Cities = ticks bloqués (14/11)

**Constat**, dans la copie jetable `outils\serveur-pilote-essai`, sur un monde neuf de même graine :
- La pré-génération Chunky d'un carré de 400 chunks autour du pilote de Mamoudzou (2800..3120 / -1064..-744) bloque le serveur. Ticks de 40, 81, 122 puis 163 s ; 8 à 22 chunks en 5 min.
- Même résultat **avec ou sans le plateau de raccord** (le datapack sans plateau bloque aussi). Le plateau n'est donc pas la cause.
- Pile au blocage :
  - le thread serveur est dans `GlobalTodo.executeAndClearTodo` → `LostCityTerrainFeature.handleTodo` → `Level.getBlockState` → `getChunkBlocking` : génération synchrone d'un chunk voisin ;
  - un seul worker travaille, dans `BuildingInfo` → `isCityRaw` → `City.getCityFactor` (11 verrous imbriqués) ;
  - les autres workers sont inactifs.
- L'essai 2, généré par téléportations du joueur (vue 6), n'a eu **aucun** tick de plus de 40 s.
- Seule différence de jar entre l'essai 2 et les essais bloqués : `IleChamp` (champ « plateau »), inactif sans le datapack plateau. La référence avec le jar 0.7.3 d'origine n'a pas encore été mesurée. À ne faire que si la génération par téléportations bloque aussi.

**Conséquence** : menace sur la pré-génération prévue de la carte finale (~55-60 h) et sur celle du Trailer.

**Contournement retenu pour l'instant** : générer par téléportations du joueur sur une grille (tous les 96 blocs, en attendant que les chunks soient chargés) plutôt qu'avec Chunky. Autre piste : Chunky seulement hors des `zones_villes`, et le joueur pour les villes.

**Mise à jour du 14/11 (mesures sur serveur dédié jetable)** :
- **Causes trouvées** :
  - InfNexus `autospawn` : à 5 min, invocation au spawn, puis `moveWorldSpawn` (`getChunk` synchrone jusqu'à 750 blocs). Gel de plusieurs minutes, une seule fois par monde.
  - Lost Cities `City.getCityFactor` : 57² itérations par chunk à `cityMaxRadius` 448.
  - Client intégré à 4 Go : manque de mémoire.
- **Correctif `FacteurVilleMixin`** (dans `atheria-monde`, géré par le fil des villes) :
  - il ne parcourt que les centres de villes prédéfinis, triés ;
  - résultat identique au bit près : 0 écart sur 327 680 appels en mode `verif` ;
  - modes `rapide` / `verif` / `off` via `config\atheria-facteur.txt`.
- **Mesures** (441 chunks, Xmx 4G, jar d'origine → correctif) :
  - ville : 3,3 → 8,5 chunks/s ;
  - nature : 2,2 → 11,3 chunks/s ;
  - C24 : 12 à 13 chunks/s.
- **Carte entière** (562 500 chunks) : environ 14 à 18 h avec le correctif, contre 47 à 71 h sans.
- **Recommandation** :
  - pré-générer sur serveur dédié, pas sur le client ;
  - pré-générer d'abord le spawn et environ 800 blocs autour, ou couper `autospawn` pendant la pré-génération.
- **Ce qui n'est pas identique au bloc près, même avec le correctif** :
  - éléments de bord de chunk (minerais, arbres) : limite de Minecraft de base ;
  - variantes de palette Lost Cities, environ 0,1 % des blocs de ville ;
  - coffres `atheria_coffres.js` tirés avec `Math.random` ;
  - conversion des coffres par lootr.
- **Défaut `exclusions.json`** : le fichier est réécrit à chaque démarrage, même sans changement. C'est KO pour le critère « réécrit seulement s'il change », à corriger plus tard dans le mod.
- **C24 dans `ile_test_1`** (14/11, 12:46–13:21, jar d'origine sans correctif, rien de modifié) :
  - terminé : 2 565/2 565 chunks à l'état `full` ;
  - deux crashs watchdog en route (ticks de 120 s, gel `handleTodo` → `getChunkBlocking` près de Mamoudzou). Le crash annule la tâche Chunky : il faut la relancer, « continue » ne suffit pas.
- **`arret_apres_tests: true`** arrête le serveur environ 46 s après les tests. Pour une pré-génération Chunky dans `serveur-ile-test`, le passer à `false` le temps du run (C24 : sauvegarde `.bak-c24`, puis restauration).

## Reste à faire

1. Centres des villes : Majicavo 2408,-2008 et Mamoudzou haussmann 2924,-846 sont posés.
   - Longoni rouille (2860,-2960, rayon 300) est en eau à 74,7 %, mais son centre est sur terre. Choix du fil des villes.
   - Longoni bidonville couvre 118 chunks de volumes : pas de caves Lost Cities à ces endroits.
2. Sonde des volumes : ignorer le feuillage pour trouver la surface. C'est cosmétique.
3. **Report dans le vrai pack, seulement avec l'accord de Mika** (rien n'a été touché dans `pack\` ni `serveur\`) :
   - jar 0.7.3, datapack 1.0 et `atheria-monde.jar` (supprimer puis copier, à cause des liens durs) ;
   - `config\atheria_ile\` complet, sans les clés de test ;
   - `max-tick-time` : à décider.
