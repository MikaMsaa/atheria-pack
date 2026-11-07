# Guide de mise en place : quêtes et PNJ d'Atheria (saison 1)

Ce guide accompagne les fichiers générés depuis le script final « La Grande Chiasse ». Tout est déjà dans le pack : il reste à **poser les PNJ et quelques objets dans le monde**, puis à piloter les actes pendant la saison.

## Ce qui a été ajouté

| Dossier | Contenu |
|---|---|
| `config/ftbquests/quests/` | 13 chapitres, 200 quêtes, textes en français (`lang/fr_fr.snbt`, copie en `en_us`) |
| `kubejs/startup_scripts/atheria_objets.js` | 106 objets `atheria:*` (carnet, bons CAF, archives, Puffs, rations…) |
| `kubejs/server_scripts/atheria_campagne.js` | kit de départ, radio, boîtier d'écoute, carte CAF, cendre grise, lecture des archives, recettes, `/titres` |
| `kubejs/server_scripts/atheria_butin.js` | bons CAF, pièces du dossier CAF, essence, archives « libres » dans les coffres ; échantillons de spores sur les infectés |
| `kubejs/startup_scripts/atheria_archives_textes.js` | textes des 40 archives (clic droit pour lire) et noms des titres |
| `kubejs/client_scripts/atheria_infobulles.js` | info-bulles des objets |
| `kubejs/data/atheria/function/` | boucle toutes les 2 s : aura → paliers, actes, annonces de titres |
| `kubejs/data/atheria/tags/` | tags « infectés », « infectés forts » et familles de structures |
| `kubejs/data/atheria/easy_npc/preset/humanoid/` et `config/easy_npc/preset/humanoid/` | 20 PNJ avec leurs dialogues |

## Comment ça marche

- **Étapes de quête = tags joueur.** Un PNJ ajoute un tag (`q_ch1_kamel`…) quand on clique son bouton ; FTB Quests le lit comme un « stage » et valide la tâche. Pas besoin de FTB XMod Compat.
- **Aura = scores.** Les récompenses font `scoreboard players add <joueur> aura_paf 2` (factions : `paf`, `passeurs`, `goblini`, `coconi`, `enfants`, `sud`). La boucle pose les tags `rep_paf_1` à `rep_paf_3` (1, 2, 3 points ou plus).
- **Titres.** Une récompense pose `titre_<clé>` ; le serveur l'annonce à tout le monde une seule fois. `/titres` liste ses titres.
- **Choix exclusifs.** Les quêtes « losange » ne laissent valider qu'une seule branche (ch1 PAF/Passeurs, péage, Hajar, camp du final).

## Piloter la saison (commandes équipe)

| Moment | Commande |
|---|---|
| Ouvrir l'Acte II (jour 6 environ) | `/scoreboard players set #acte atheria 2` |
| Ouvrir l'Acte III | `/scoreboard players set #acte atheria 3` |
| Ouvrir l'Acte IV | `/scoreboard players set #acte atheria 4` |
| Ouvrir le final (CHM) | `/scoreboard players set #acte atheria 5` |
| Clore la nuit du CHM | `/scoreboard players set #final atheria 1` |
| Donner de l'aura à la main | `/scoreboard players add <joueur> aura_coconi 1` |
| Valider l'exploit « Léon Marchand » | `/tag <joueur> add exploit_leon` |
| Voir l'aura d'un joueur | `/scoreboard players list <joueur>` |

Rejouer une étape : `/tag <joueur> remove q_ch1_kamel` puis `/ftbquests change_progress <joueur> reset <id de quête>`.

## Poser les PNJ

Être **opérateur**, en créatif, avec un œuf de PNJ Easy NPC (ou `/easy_npc` → assistant de création). Dans l'assistant, onglet des **presets** (« Custom » ou « Data »), choisir le preset Atheria, puis régler le skin et la pose. Si les commandes des boutons ont été retirées à l'import, importer en étant op (Easy NPC limite le niveau de commande au niveau de celui qui importe).

| PNJ | Où le poser | Rôle |
|---|---|---|
| Brigadier Rayek | porte nord de Longoni | checkpoint, fiche de quarantaine |
| Docteure Saouda | infirmerie de Longoni | signe la fiche, laissez-passer |
| Eniy | boutique, Longoni | jeton, colis à livrer, rachat des Puffs |
| Kamel | entrée des galeries, puis sur la route (Acte II) | clé des galeries, cassette, mort au ch2 |
| Brigadière Kayssi | QG PAF ; à Petite-Terre à l'Acte IV | choix du ch1, dialogue pivot du ch5 |
| Bacar B. | péage de la RN1 | choix du péage |
| Vinicius | barrage du péage (**tuable**) | cible de la branche « attaquer » |
| Zaid | Refuge de Coconi | arrivée à Coconi |
| Iwania | Coconi | photo de famille (quête cachée) |
| Angellow | Coconi | quête secrète « 67 » |
| Chef Moula, K2 | Coconi | ambiance, contrats |
| Skipoutchou | camp caché des Goblini | rejoindre les Goblini |
| Routouba | devant le barrage de Coconi (Acte III) | ambiance |
| Le Fundi Flat | station-temple des galeries | dialogue à choix |
| Hajar | rame aux dessins, galeries | carnet de Hajar |
| Mama Sarambavi | côte sud | contrats des Pêcheurs |
| Terminal du labo 7 | labo 7 (bunker) | code 1047 : dossier SYMBIOSE + archive 14 ; mauvais code = infectés |
| Coffre-fort de Salto | bureau de Salto, campus | code 0-9-104 : cassettes + archive 31 |
| Émetteur du Bénara | station radio du Bénara | diffuse la vraie voix (avec les cassettes) |

Les objets-PNJ (terminal, coffre-fort, émetteur) peuvent être rendus discrets : pose « assise », taille réduite, ou modèle bloc dans l'assistant.

## Objets à placer dans le monde

Le plus simple : un **coffre Lootr** (chaque joueur a sa copie) avec l'objet dedans, ou un PNJ. Les objets marqués « butin » apparaissent aussi au hasard dans les coffres.

| Objet | Quête | Où |
|---|---|---|
| `atheria:photo_identite`, `justificatif`, `rib` | Ch1 Dossier CAF | maisons de Longoni (aussi en butin) |
| `atheria:plaque_identite` ×3 | Ch1 Patrouille | Majicavo |
| `atheria:caisse_medocs` | Ch1 Contrebande | entrepôt PAF |
| `atheria:archive_02`, `04`, `05`, `06` | Ch1 | quai, bureau de Pax, galeries, boutique d'Eniy |
| `atheria:batterie`, `bidon_essence` | Ch2 | Red Rocket, garages (aussi en butin) |
| `atheria:photo_famille` | Ch2 | un taxi de la RN1 |
| `atheria:carnet_rayade_fin`, `archive_03` | Ch2 | station radio, près du corps de Rayade |
| `atheria:cle_cellule` | Ch2 | poste PAF (si Kamel a été livré) |
| `atheria:fusible_somaco`, `journal_operateur` | Ch3 | carrière (mine) ; bunker du relais (le boîtier d'écoute est donné par la quête 1) |
| `atheria:plaque_station` ×3+ | Ch4 | stations du tram (disparaissent si on tue un infecté) |
| `atheria:archive_20`, `archive_21` | Ch4 | station Mtsapéré, autel |
| `atheria:decoction_fundi` | Ch4 | à fabriquer (recette) ou offerte par les Enfants |
| `atheria:badge_somaco`, `archive_30` | Ch5 | lisière du campus |
| `atheria:dossier_remede`, `archive_32` | Ch5 | laboratoire central, gardé par un gros infecté |
| `atheria:archive_33` | Ch5 | bureau de Pax (bunker de commandement) |
| `atheria:poisson_seche`, `filet` | Ch5 | recettes (fumoir, ficelle) |
| `atheria:puff_1` à `_10` | Puffs | grue de Longoni, Nid majeur, toit du CHM, bureau de Pax, Red Rocket, rame de tram, bunker, phare, toit de Coconi, cache finale |
| Autres archives | Archives | voir la liste « Emplacement » du script ; 7, 8, 10, 11, 23 à 28 et 33 à 36 tombent aussi au hasard |

## Recettes ajoutées

Antifongique (champignon brun + rouge + bouteille + sucre), masque artisanal (laine, charbon, ficelle), filtres ×2 (charbon ×2 + papier), radio portative (paratonnerre, cuivre, redstone, fer), kit d'analyse (alambic, 3 fioles, 1 échantillon, redstone), fusées éclairantes ×4, trousse de soins (2 bandages + pansement + bouteille), décoction du Fundi, filet, poisson séché (fumoir), cendre grise.

## Limites connues, à vérifier au premier test

- **Taxi (ch2) :** la récompense est une `atheria:cle_taxi` à échanger contre un véhicule Immersive Vehicles, car les IDs des véhicules MTS n'ont pas pu être vérifiés.
- **Cendre grise :** donne 10 minutes d'invisibilité (les infectés détectent beaucoup moins) ; elle s'arrête si on tue un infecté.
- **Lune de sang, escortes, observation des Chimiks :** cases à cocher (honneur des joueurs) faute de détection fiable.
- **Exploration :** jalons à 4, 8 et 13 quêtes d'exploration (au lieu de 10/20/30 structures, non comptables).
- **Titres :** annoncés et listés par `/titres`, pas encore affichés dans le chat.
- Après une modification des quêtes en jeu (mode édition FTB), FTB réécrit les fichiers : c'est normal.
