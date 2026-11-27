# Test de l'installateur .mrpack — pack 1.1.8-beta (25/11/2026)

## Résultat en une phrase
L'installation packwiz est **complète et rapide (4 min 16)**. L'erreur du testeur (« sodium is not installed ») **ne vient pas du délai de 20 min** : elle se reproduit à coup sûr au **premier lancement**, parce que Sodium est téléchargé pendant le démarrage, trop tard pour que NeoForge le voie. **Au 2e lancement, le jeu arrive au menu.**

## 1. Installation dans un dossier vide
- Dossier : `outils\test-mrpack-20261125\jeu\` (bootstrap extrait de `mods/atheria-maj.jar` sur GitHub main).
- Commande identique à celle du mod : `java -jar packwiz-installer-bootstrap.jar -s client <pack.toml>` (Java 21 zulu de Modrinth, avec la fenêtre de progression, comme le mod).
- Durée : **256 s (4 min 16)**. Fin du journal : `Finished successfully!`. Aucune ligne d'erreur, aucun 403/404, aucun échec de hash.
- Fichiers : 4 954 dans l'index ; 4 sautés à juste titre « wrong side » (côté serveur : Clumps, Immersive Optimization, Leaves Be Gone, spark).
- `mods\` : **206 jars**, dont `sodium-neoforge-0.8.13+mc1.21.1.jar` ✔.
- Comparaison avec `index.toml` : 202 métafichiers de mods → 198 jars client présents, 4 serveur absents (normal). 4 749 autres fichiers (configs, etc.) : **0 manquant**.

## 2. Lancement (instance Prism « Atheria-test-mrpack », NeoForge 21.1.265, 6144 Mo)
| Essai | Situation | Résultat |
|---|---|---|
| 1 | Tous les fichiers déjà installés avant le lancement | **Menu principal** en 151 s, pas d'« Error loading mods » |
| 2 | Sodium retiré + `atheria-maj.etat` retiré (= premier lancement réel : atheria-maj télécharge Sodium au démarrage) | `atheria-maj.log` : « Mise a jour terminee », Sodium bien re-téléchargé, **mais « Error loading mods » : sodium [MISSING]**, demandé par sodium_extra et enhancedcelestials2shaders — exactement l'écran du testeur |
| 3 | Relance simple | « Le pack est deja a jour », **menu principal** atteint |

Journaux gardés : `latest-lancement1.log`, `latest-lancement2-repro.log`, `latest-lancement3.log`.

## 3. Cause
Le jar Sodium NeoForge n'est pas un mod ordinaire : son manifeste dit `FMLModType: LIBRARY` et il fournit un **localisateur de mods** (`IModFileCandidateLocator`) et un `GraphicsBootstrapper`. Le vrai mod Sodium est caché dedans (jarjar) et n'est trouvé que par ce localisateur. NeoForge charge ces services **avant** d'appeler `atheria-maj` (ITransformationService.initialize). Quand atheria-maj télécharge Sodium pendant ce même démarrage, le jar arrive dans `mods\` mais son localisateur n'est jamais lancé → Sodium absent pour ce démarrage, alors que sodium_extra (mod ordinaire) est vu.
Tout mod du même genre (service/locator/bibliothèque précoce) ajouté par une mise à jour aura le même défaut au premier démarrage qui suit.

## 4. Pistes de correction (non faites, à décider)
1. **Le plus simple** : quand atheria-maj a installé de nouveaux fichiers, afficher un message « Mise à jour installée, relancez le jeu » et quitter proprement (ou au minimum : le dire dans le guide des testeurs : « au tout premier lancement, si erreur Sodium, relancer »).
2. Mettre Sodium (et les autres jars de type service) directement dans le .mrpack, à côté d'atheria-maj.jar, pour qu'ils soient là dès le premier lancement.
3. Combiner 1 et 2 : 2 règle l'installation, 1 règle les futures mises à jour qui ajouteraient un mod de ce type.

## 5. Ce qui n'a pas été testé
- L'import réel du .mrpack dans l'application Modrinth (non demandé).
- Une connexion lente : sur ce PC l'installation prend 4 min ; le délai de 20 min n'est pas en cause ici, mais pourrait l'être sur une connexion très lente.

## 6. Ce qui reste sur le PC
- `outils\test-mrpack-20261125\` (≈1,5 Go : `jeu\`, `telechargement\`, scripts, journaux).
- Instance Prism `instances\Atheria-test-mrpack\` (≈1,5 Go).
Rien d'autre n'a été modifié. Verrou de la file rendu, jeu et Prism fermés.
