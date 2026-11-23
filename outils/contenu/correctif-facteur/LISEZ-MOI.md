# Correctif FacteurVille (Lost Cities `City.getCityFactor`)

Fil île, 14/11/2026. Mika a accepté l'installation dans pack, serveur et instance. **C'est le fil Mods qui installe** (il est propriétaire d'`atheria-monde`). Ce dossier est seulement une livraison : rien n'a été posé dans `pack\` ni `serveur\`.

## Cible

- Mod `atheria-monde` (mixin sur Lost Cities **1.21-8.4.6**, classe `mcjty.lostcities.worldgen.lost.City`).
- Le correctif doit être présent **sur le serveur** (génération) et dans l'instance solo. Côté client multijoueur, il ne sert à rien mais ne gêne pas.

## Principe

`City.getCityFactor(coord, info, profil)` est appelée pour chaque chunk, et plusieurs fois par chunk. Avec `CITY_CHANCE` ≤ 0, comme dans le profil `atheria`, il n'y a que des villes prédéfinies. La méthode d'origine parcourt pourtant tous les chunks dans un rayon de `(cityMaxRadius + 15) / 16`, soit 57² itérations à 448, en appelant `getProfile` et `isCityCenter` à chaque fois. C'est le principal coût de la génération, et la cause des ticks bloqués (verrous imbriqués, `getChunkBlocking`).

Le mixin (`src\fr\atheria\monde\mixin\FacteurVilleMixin.java`) :

1. **Quand il s'applique** : seulement si le profil a `CITY_CHANCE` ≤ 0 et que le profil du chunk n'est ni space ni spheres. Sinon le code d'origine tourne, inchangé.
2. **Ce qu'il change** : un `@Redirect` sur la lecture de `CITY_MAXRADIUS` renvoie -32, ce qui fait zéro tour de boucle.
3. **Le calcul de remplacement** : un `@ModifyVariable` remplace le facteur par `atheria$calcul`. Celui-ci ne parcourt que les **centres prédéfinis** (`predefinedCityMap`), triés par (x, z), avec mise en cache par identité de la carte. Il garde la même fenêtre, la même dimension, le même test `getProfile == profil && isCityCenter`, et le même calcul `int sqdist` puis `(radius - dist) / radius`, dans le même ordre d'addition.
4. **Le reste** n'est pas touché : hauteurs min/max, multiplicateur worldstyle, distance au spawn, bornage [0, 1].

Le résultat est donc **identique au bit près** au code d'origine.

## Modes

Le mode se lit dans la propriété JVM `-Datheria.facteur=...`, sinon dans le fichier `config\atheria-facteur.txt` (une ligne). Par défaut : `rapide`. Le log affiche au démarrage `[ATHERIA-FACTEUR] mode=...`.

| mode | effet |
|---|---|
| `rapide` | calcul par les centres seulement (mode de production) |
| `verif` | la boucle d'origine tourne aussi ; on compare les bits des deux flottants, on compte les écarts et on les affiche toutes les 65 536 invocations : `verif appels=N ecarts=E` |
| `off` | comportement d'origine strict |

## Contenu du dossier

- `src\...\FacteurVilleMixin.java` : la version testée ici (fil île).
  - **Attention** : le fil des villes a sa propre version, dans `outils\atheria-monde-mod\src\...\FacteurVilleMixin.java`. Elle a la même logique, plus un logger log4j et un cache `fr.atheria.monde.CentresVilles`. Elle est déjà dans `outils\atheria-monde-mod\atheria-monde.jar` (09d3875e…, 14/11 08:41, avec en plus `StyleVilleMixin` et `NiveauVilleMixin`).
  - **Je n'ai mesuré que ma version.** Si c'est celle des villes qu'on installe, refaire au moins le test `verif` ci-dessous.
- `jars\atheria-monde-facteur.jar` (007fd400…) : jar du pack (c0bb8b84…) avec seulement `FacteurVilleMixin.class` en plus et `atheria_monde.mixins.json` modifié (vérifié par `verifier_jars.py`).
- `jars\atheria-monde-ile-test-facteur.jar` (08a6ea75…) : même chose sur la base de `serveur-ile-test` (d0a97a79…).
- `outils-de-test\` :
  - `construire-facteur.ps1 [-Base jar] [-Sortie nom]` : compilation javac et ajout au jar ;
  - `verifier_jars.py` : seules différences admises, le `.class` et le `mixins.json` ;
  - `preparer-run.ps1` et `lancer-serveur.ps1` : mesure sur serveur dédié jetable (`outils\serveur-pilote-essai`), avec le verrou ;
  - `lancer-c24-boucle.ps1` : pré-génération avec relances ;
  - `comparer_blocs.py` et `comparer_categories.py` : comparaison bloc à bloc de deux mondes de même graine ;
  - `cat-ville-origine-vs-rapide.md` : un exemple de résultat.

## Procédure de test (avant d'installer)

1. Poser le jar et écrire `verif` dans `config\atheria-facteur.txt`, sur un monde neuf et jetable.
2. Pré-générer une zone de ville, par exemple Chunky `center 2960 -904` `radius 160`.
   - Attendu dans le log : `ATHERIA-FACTEUR ... ecarts=0`.
   - Obtenu le 14/11 : **0 écart sur 327 680 appels**.
3. Passer en `rapide` et mesurer la même zone sur un monde neuf. Facultatif : comparer les deux mondes avec `comparer_categories.py` (voir plus bas).

## Mesures (14/11, serveur dédié, Xmx 4G, 441 chunks, `cityMaxRadius` 448)

| zone | jar d'origine | correctif `rapide` | gain |
|---|---|---|---|
| ville (2960 -904) | 2 min 13 s, 3,3 chunks/s | 52 s, 8,5 chunks/s | × 2,6 |
| nature (488 -4824) | 3 min 22 s, 2,2 chunks/s | 39 s, 11,3 chunks/s | × 5,2 |
| C24 (`ile_test_1`) | 2 crashs watchdog (ticks de 120 s) près de Mamoudzou | 12 à 13 chunks/s, aucun tick long | — |

**Carte entière** (562 500 chunks) : environ 14 à 18 h avec le correctif, contre 47 à 71 h sans (extrapolation).

**Recommandations pour la pré-génération finale** :
- serveur dédié, pas client intégré ;
- pré-générer d'abord le spawn et environ 800 blocs autour, ou couper `infnexus autospawn` pendant la pré-génération.

## Identité des mondes

Le correctif ne change pas les valeurs : le mode `verif` le prouve. Deux générations restent malgré tout différentes par endroits, avec ou sans correctif, parce que l'**ordre de génération** n'est jamais le même. Voici ce que `comparer_categories.py` montre entre deux mondes de même graine :

- filons et poches souterraines, arbres et plantes en bord de chunk : limite de Minecraft de base ;
- variantes de palette Lost Cities (`nextPaletteIndex`) : mousse, fer ou béton, andésite polie, couleurs de verre ; environ 0,1 % des blocs de ville ;
- coffres aléatoires `atheria_coffres.js` (`Math.random`) et conversion par lootr ;
- états de connexion des vitres en bord de chunk.

## Retour arrière

- Remettre le jar d'origine : **supprimer puis copier**, à cause des liens durs entre `serveur\mods` et les instances. Le jar du pack d'origine est c0bb8b84…
- Ou bien, sans toucher au jar : écrire `off` dans `config\atheria-facteur.txt`, ou ajouter `-Datheria.facteur=off`. Comportement d'origine exact.
