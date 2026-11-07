# Butin : Atheria Zombie Edition

Rééquilibrage du 29/10/2026, d'après le plan des configs (sections 4 et 6). Rien n'est deviné : les tables listées ici ont été lues dans les jars de l'instance (`instances\Atheria\minecraft\mods`), dans ceux de `serveur\mods` pour les mods serveur, et dans le jar Minecraft 1.21.1 pour la vanilla.

## Comment c'est fait

| Fichier | Rôle |
|---|---|
| `kubejs/server_scripts/atheria_butin.js` | Script LootJS : modifie les tables existantes au chargement (les coffres Lootr et `/loot` voient donc le même butin). |
| `kubejs/data/atheria/loot_table/inject/*.json` | 15 tables vanilla écrites à la main (armes, munitions, accessoires, soins). Le script les ajoute aux tables d'origine par une référence. |

Copiés à l'identique dans l'instance, `serveur\kubejs` et `pack\kubejs`. Les tables d'origine des mods ne sont jamais remplacées : on ajoute ou on retire des entrées, le reste du butin des mods est gardé.

Pour tester une table en jeu : `/loot give @s loot atheria:inject/pistolet` (ou n'importe quelle table de ce document).

## 1. Armes TaCZ hors des coffres courants

- **Aucune table de mod ne contenait d'arme TaCZ.** La seule source était l'injecteur du pack d'armes TaCZ (`tacz_default_gun/data/tacz/tacz_loot_injectors/spawn_bonus_chest_taurus943.json`) : un Taurus 943 et 38 à 45 balles de .22 WMR dans le coffre bonus de départ. Il passe par le modificateur global `tacz:loot_table_injector`, **retiré** par LootJS (confirmé dans le log : « Removed 1 global loot modifiers: tacz:loot_table_injector »).
- Par sécurité, `tacz:modern_kinetic_gun` et `tacz:ammo` sont aussi retirés de toutes les tables « de début » (section 4), au cas où un futur pack d'armes en ajouterait.
- Le M16 du mod Underground Bunkers & Nuclear Weapons (`bunkers:m16`, ses munitions et chargeurs) n'est pas une arme TaCZ : il reste dans l'armurerie et le coffre-fort de ses bunkers militaires.

## 2. Armes et munitions dans les structures militaires et de police

### Tables ajoutées (`atheria:inject/...`)

| Table | Contenu (poids) |
|---|---|
| `munitions_pistolet` | 9 mm ×4-12 (6), .45 ACP ×3-10 (3) |
| `munitions_militaires` | 9 mm ×8-20 (5), .45 ACP ×6-14 (3), calibre 12 ×4-10 (3), 5,56 ×10-24 (2), 7,62×39 ×10-20 (2), .308 ×5-10 (1), 7,92×57 ×5-10 (1) |
| `pistolet` | Glock 17 (5), M9A4 (4), M1911 (4), P320 (3), Mk23 (2), CZ75 auto (1). Tous en semi-auto sauf la CZ75. |
| `arme_longue` | M870 (4), double canon court (3), SKS (3), Kar98 (2), MP5 (2), Uzi (2), AK-47 (1), M16A4 (1), M4A1 (1). En semi-auto, sauf l'Uzi. |
| `accessoire` | viseur RMR (4), viseur T1 (3), laser compact (3), chargeur léger allongé (3), chargeur allongé (3), poignée verticale (2), crosse légère (2), lunette Elcan 4× (1), **silencieux** Phantom S1 (1, récompense rare) |

Les armes sortent **vides** (pas de munitions dans le chargeur).

### Paquets par type de lieu (chaque ligne = un tirage indépendant)

| Paquet | Contenu |
|---|---|
| `police` | 50 % munitions de pistolet, 12 % pistolet, soins rares |
| `militaire` | 60 % munitions de pistolet, 30 % munitions militaires, 12 % pistolet, 4 % arme longue, 15 % accessoire |
| `armurerie` | 2-3 lots de munitions militaires, 35 % pistolet, 15 % arme longue, 30 % accessoire |
| `depot_munitions` | 2-4 lots de munitions militaires, 50 % munitions de pistolet |
| `tresor_militaire` | 2 lots de munitions militaires, 50 % pistolet, 30 % arme longue, 50 % accessoire, 15 % défibrillateur |

Les pistolets et leurs munitions sortent toujours plus souvent que les fusils.

### Où ils sont ajoutés

| Structure (mod) | Table d'origine | Ajout |
|---|---|---|
| Bunkers militaires (Underground Bunkers & Nuclear Weapons, `bunkers`) : armurerie | `bunkers:chests/armory` | `armurerie` |
| idem : dépôt de munitions | `bunkers:chests/ammo_storage` | `depot_munitions` |
| idem : stockage militaire | `bunkers:chests/military_storage` | `militaire` |
| idem : dortoir | `bunkers:chests/barracks` | `militaire` + `soins_rares` |
| idem : coffre-fort | `bunkers:chests/vault` | `tresor_militaire` |
| Underground Bunkers (`underground_bunkers`) : coffres normaux | `.../underground_bunker_normal` | `militaire` |
| idem : ravitaillement | `.../underground_bunker_supply` | `depot_munitions` + `hopital` |
| idem : trésor | `.../underground_bunker_treasure` | `tresor_militaire` |
| Spore : camp militaire (`spore:military_camp`) | `spore:chests/equipment_chest`, `food_chest` | `militaire` (seulement dans le camp) |
| Spore : prison (`spore:prison`) | `spore:chests/food_chest`, `equipment_chest`, `minecraft:chests/simple_dungeon` | `police` (seulement dans la prison) |

Spore réutilise ses tables (`equipment_chest` sert aussi dans la cathédrale, l'église, les mines...). Le bonus passe donc par `atheria:inject/spore_structures`, qui teste la structure où se trouve le coffre (`minecraft:location_check`) : ailleurs, il ne donne rien.

Les bunkers du mod `bunkers` choisissent leurs tables dans leur code (pas de fichier de structure), vérifié dans les classes du jar.

**Pas de poste de police dans Lost Cities** : ses bâtiments utilisent tous les mêmes tables (`lostcities:chests/lostcitychest` au-dessus du sol et en sous-sol, `raildungeonchest` dans les tunnels, plus quelques tables vanilla), d'après `data/lostcities/lostcities/conditions/chestloot.json`. Impossible d'y distinguer un commissariat. Si on veut des commissariats, il faudra un bâtiment Lost Cities personnalisé avec sa propre table.

## 3. Fournitures médicales (First Aid)

| Table | Contenu |
|---|---|
| `soins_rares` | 12 % de chance : bandage ×1-2 (6), pansement ×1-3 (6), antidouleurs (2), morphine (1) |
| `soins` | 1 à 3 tirages : bandage ×1-3 (5), pansement ×2-4 (5), antidouleurs ×1-2 (3), morphine (2), injecteur de morphine (1), injecteur d'adrénaline (1) |
| `hopital` | 45 % de chance : un lot `soins` |
| `infirmerie` | 2 lots `soins`, 5 % défibrillateur |

| Lieu | Ajout |
|---|---|
| Hôpital Spore (`spore:hospital`, 48 coffres de documents, 8 de nourriture, 6 d'équipement) | `hopital` sur chaque coffre Spore de l'hôpital |
| Infirmerie des bunkers (`bunkers:chests/infirmary`) | `infirmerie` |
| Ravitaillement Underground Bunkers | `hopital` |
| Coffres civils : 16 tables de village vanilla, `lostcities:chests/lostcitychest`, Abandoned City Buildings (`postapocalypse_structures:chests/food` et `trash`), station-service Create: Fallout (`create_fallout:chests/fallout`), Structory (`outcast/settlement`, `outcast/low`, `harvest/old_manor/common`, les 13 `mood/*`) | `soins_rares` |
| Serveur seulement : maisons de village Repurposed Structures (12), maisons, greniers, réserves et taverne des villages Terralith (10), Explorify (`dark_forest_settlement`, `supply_cache`) | `soins_rares` |

Pas de pharmacie identifiable dans les mods présents.

## 4. Coffres de début : moins de diamants, enchantements plafonnés

Sur ces tables, le script :
- retire la pomme dorée enchantée, les outils, armes et armures en diamant, l'armure de cheval en diamant ;
- divise par 4 le poids des diamants (au moins 1) et ramène leur nombre à 1-2 par entrée ;
- remplace les enchantements (`enchant_with_levels` 20-39, `enchant_randomly` à niveau quelconque) par un enchantement de niveau 5 à 15.

**Tables visées (instance et serveur, 38) :**
- vanilla : `simple_dungeon`, `abandoned_mineshaft`, `desert_pyramid`, `jungle_temple`, `buried_treasure`, `shipwreck_treasure`, `shipwreck_supply`, `ruined_portal`, `pillager_outpost`, `underwater_ruin_big`, `underwater_ruin_small`, `igloo_chest`, `spawn_bonus_chest`, `woodland_mansion`, `village/village_toolsmith`, `village/village_weaponsmith`
- Lost Cities : `lostcitychest`, `raildungeonchest`
- Structory : `harvest/graveyard`, `graveyard2`, `manor2/loot`, `manor2/treasure`, `old_manor/treasure`, `library/high`, `junk`, `low`, `outcast/boat/loot`, `outcast/generic/bandit`, `generic/miner`, `outcast/mine/loot`, `outcast/ruin/ruin`, `ruin/ruin`, `ruin/swamp/loot`, `ruin/taiga/illager_high`, `illager_treasure`, `ruin/taiga/loot`
- Underground Bunkers : `underground_bunker_normal`, `underground_bunker_supply`

**Serveur seulement (par motif d'identifiant, environ 200 tables)** : toutes les tables de coffres de Repurposed Structures (93), YUNG's Better Dungeons (7), Explorify (3), Structory: Towers (44) et Terralith (53), **sauf** celles dont le nom contient nether, end, crimson, warped, basalt, soul, bastion, ancient_cit ou stronghold.

**Laissés intacts (fin de progression)** : forteresses (vanilla, YUNG's Better Strongholds, Repurposed), cités antiques, Nether, End, bastions, chambres d'épreuves, trésor des Underground Bunkers, coffre-fort des bunkers militaires.

## 5. Résultat du test (29/10/2026)

Monde « Test Atheria », 200 tirages par table avec un script de test temporaire (retiré ensuite) :

| Table | Avant | Après |
|---|---|---|
| `lostcities:chests/lostcitychest` | env. 530 diamants, épées en diamant | 62 à 94 diamants, plus d'épée ; soins rares présents |
| `minecraft:chests/simple_dungeon` | livres enchantés à niveau quelconque | livres enchantés, niveau max 2 |
| `minecraft:chests/jungle_temple` | enchantements niveau 30 | niveau max 2-3 |
| `minecraft:chests/spawn_bonus_chest` | Taurus 943 + 38-45 balles | plus aucune arme ni munition |
| `bunkers:chests/armory` | M16 seulement | + 68 pistolets TaCZ, 27 armes longues, environ 6 000 munitions TaCZ, 70 accessoires (sur 200 coffres) |
| `bunkers:chests/infirmary` | sucre, papier, pommes dorées | + bandages, pansements, morphine, défibrillateur rare |

Script chargé « 0 errors and 0 warnings », aucune erreur LootJS ni de table. Les ajouts propres aux structures Spore (test de position) et les tables des mods serveur n'ont pas pu être tirés dans l'instance : à vérifier sur le serveur (voir le journal).


## 6. Ajouts de la 1.0.5 (01/11/2026)

- `atheria_butin.js` couvre aussi When Dungeons Arise, Moog's Voyager Structures, ATi Structures, Nova Structures et les temples, monuments et huttes YUNG.
- Les tables civiles reçoivent `atheria:inject/fournitures` : 1 à 3 tirages de nourriture, matériaux, outils en fer, filtres et bandages, sans arme.
- Lost Cities : `chestWithoutLootChance` et `buildingWithoutLootChance` à 0,1.
- Test : 8 coffres de ville ouverts, contenu plus fourni à l'œil. Pas de mesure chiffrée.
- `atheria_coffres.js` (02/11/2026) ajoute jusqu'à 4 coffres ou tonneaux par chunk neuf de ville, à l'intérieur des bâtiments : `lostcities:chests/lostcitychest` 60, `minecraft:chests/village/village_plains_house` 25, `create_fallout:chests/fallout` 15. Densité mesurée : environ 0,7 contenant par chunk de ville avant, 2,2 après. Détails dans le journal, section 18.