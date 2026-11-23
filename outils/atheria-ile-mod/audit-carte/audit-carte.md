# Audit qualité de la carte (serveur-ile-test), 13/11/2026

Brouillon en cours : la session 2 (captures restantes et génération des villes) n'est pas encore faite. Les sections « Défauts », « Bords de villes », « Traits de côte rectilignes » et la grille de contrôle qualité seront complétées à la fin.

## Constats déjà établis (hors jeu, lecture des .mca, rien modifié)

- **Lave en surface** : une seule zone dans les 23 683 chunks générés, Petite-Terre.
  - Environ 6 600 colonnes autour de 3365,-1228, à Y 62-91, en 16 amas.
  - Biome terralith:volcanic_crater.
  - Des coulées atteignent le biome minecraft:beach à Y 63-64, vers 3351,-1356, 3315,-1277 et 3280,-1205.
  - Sources : terralith:volcano/lava_lakes et terralith:volcano/lava_flow (features du biome volcanic_crater), et minecraft:lake_lava_surface (vanilla, présent dans tous les biomes, rare).
  - Le biome volcanic_crater vient de regions.json : région Petite-Terre, poids 2 et « montagne ».
- **Point 010** : la flaque orange de la capture est introuvable dans le monde sauvegardé (aucune lave ni magma à moins d'environ 250 blocs). Elle sera revérifiée en session 2 par une sonde dans le jeu (point 010b).
- **Point 003** : îlot dessiné d'environ 120 blocs, à plat, en sable. Accepté par le fil conformité, ce n'est pas un défaut. La vraie côte nord est contrôlée par les points 003b et 003c.
- **Point 005** : la vase descend doucement (Y 67 à 62 sur environ 100 blocs), sans vraie marche. Les marches de l'image viennent de la limite des chunks chargés. Le trait de côte est presque rectiligne sur environ 70 blocs (x ≈ 3417-3432, z 456-528).

## Corrections à appliquer (lot unique après revue)

Rien n'est appliqué. Tout sera appliqué en un seul lot, après la revue complète et l'accord de Mika.

### C1. Petite-Terre : AUCUNE lave (décision de Mika du 14/11, remplace celle du 13/11)

Objectif : zéro bloc de lave en surface sur toute la région Petite-Terre (classe `#c4b278`), cratère compris, et aucune coulée vers la côte.

Pourquoi ces choix :
- `terralith:volcanic_crater` porte en propre `volcano/lava_lakes`, `volcano/lava_flow`, `volcano/crater_fixer`, `volcano/magma_barrier` et `top_secret_do_not_touch` (lus dans le jar Terralith 2.6.2). Le garder sans lave est donc risqué : on le retire de la région.
- `terralith:hot_shrubland` porte encore `minecraft:lake_lava_surface`, `lake_lava_underground` et `spring_lava`. Ce biome n'est utilisé que par Petite-Terre dans regions.json (vérifié), donc on peut lui retirer ces features sans toucher au reste de l'île.
- La tache `biomesoplenty:shrubland` de Petite-Terre sert aussi ailleurs (3 emplois). Pour ne pas modifier les autres régions, on la retire de Petite-Terre au lieu de la filtrer.

Changements, préparés et non appliqués. Les fichiers sont dans `audit-carte/c1-sans-lave/` :
1. `config/atheria_ile/regions.json`, classe `#c4b278` :
   - `biomes` : `[{"biome": "terralith:hot_shrubland", "poids": 1}]`, c'est-à-dire volcanic_crater retiré ;
   - `montagne` : `"terralith:hot_shrubland"` au lieu de `"terralith:volcanic_crater"` ;
   - `taches` : `[]` (retrait de la tache `biomesoplenty:shrubland`) ;
   - rien d'autre ne change. La zone « fond du cratère » prévue le 13/11 est **abandonnée**.
2. Datapack de l'île, trois fichiers ajoutés :
   - `data/atheria_ile/neoforge/biome_modifier/petite_terre_sans_lave.json` : `neoforge:remove_features` sur `terralith:hot_shrubland`, qui retire `minecraft:lake_lava_surface`, `minecraft:lake_lava_underground` et `minecraft:spring_lava` (étapes `lakes` et `fluid_springs`) ;
   - `data/terralith/worldgen/placed_feature/volcano/lava_flow.json` et `lava_lakes.json` : copie de Terralith 2.6.2 avec le premier `count` à 0. C'est une sécurité : ces features ne servent qu'à volcanic_crater, qui n'est plus utilisé nulle part. `volcanic_peaks` (Île du volcan) ne les utilise pas, il n'est donc pas touché.
3. Ce qui n'est pas couvert, à noter :
   - la lave des grottes (`terralith:cave/thermal_caves`) reste sous terre ; le critère porte sur la surface ;
   - les aquifères de lave profonds (vanilla) ne bougent pas.

Validation, sur une copie jetable de serveur-ile-test, sous verrou :
- appliquer 1 et 2 dans la copie ;
- supprimer les régions de Petite-Terre dans la copie seulement, puis régénérer ;
- scanner la lave en lisant les .mca.

Critères :
- **0 bloc de lave ni de magma en surface** (colonne exposée au ciel, ou à 8 blocs au plus sous la surface) sur toute la classe `#c4b278` ;
- 0 lave sur un biome beach ;
- captures sol + hauteur de l'ancien cratère (3365,-1228), publiées sur la page d'audit.

Contrôle de non-régression : le biome doit rester IDENTIQUE avant et après C1 en trois points. Aucun n'est encore généré dans serveur-ile-test (vérifié le 13/11). Le « avant » sera relevé dans la copie jetable avant d'appliquer C1, puis le « après » dans une seconde copie avec C1.

| Point | Coordonnées | Biome avant | Biome après | OK/KO |
|---|---|---|---|---|
| Campus Somaco, zone contaminée (lac vert) | 4224,-640 | atheria:zone_contaminee (81) | identique (81/81) | OK (14/11) |
| Quais de la barge | 3296,-704 | beach 44, terralith:volcanic_crater 37 | beach 44 identiques ; les 37 cellules de cratère deviennent terralith:hot_shrubland | voulu par C1 (le cratère est retiré) ; plage OK (14/11) |
| Crique des contrebandiers (kwassa), en face | 3096,-120 (lieux-lore/lieux-coordonnees.md, n° 20) | dead_forest 59, beach 22 | identique (81/81) | OK (14/11) |

Chaque point est relevé sur un carré de 9 × 9 blocs, à Y surface et à Y 64. Le contrôle est OK si les biomes sont identiques sur les 81 colonnes.

Sauvegarde et retour arrière :
- `regions.json` → `regions.json.bak-c1` ; retour : recopier le .bak.
- Datapack : supprimer les trois fichiers ajoutés.
- Les chunks déjà générés gardent l'ancienne lave : seuls les nouveaux chunks suivent la correction. La carte finale, générée à neuf, sera donc sans lave sur Petite-Terre. Le monde de jeu réel n'est pas concerné tant que Mika ne l'a pas validé.

Fil concerné : île (regions.json et datapack de l'île).

**Validation C1 du 14/11 (copie jetable serveur-pilote-essai)** : 0 bloc de lave ou de magma en surface sur #c4b278, sur 1 963 chunks, dont 1 600 autour du cratère. Avant, à graine égale : 1 003 blocs de lave et 401 de magma. Vues de dessus avant et après sur la page d'audit (section « Validation C1 »).

### C1b. Aucune lave de surface hors de l'Île du volcan (décision de Mika du 14/11 : « Oui, sauf l'Île du volcan »)

Constat : la validation C1 a trouvé de la lave de surface ailleurs que sur Petite-Terre. Par exemple, 144 blocs près de 330,-1306, dans les régions #7aa048 et #a0988e (lacs ou sources de lave des biomes de ces régions). Ces blocs sont identiques avec et sans C1.

Correction (même lot que C1, d'abord sur la copie de test, **pas encore appliquée**) :
- datapack de l'île : biome_modifier `neoforge:remove_features` (étapes `lakes` et `fluid_springs` : `minecraft:lake_lava_surface`, `minecraft:spring_lava` et les équivalents des mods de biomes) pour **tous les biomes de l'île sauf ceux de la région Île du volcan** ;
- la liste exacte des biomes et des features concernés sera tirée de regions.json et des features présentes dans le pack, puis relue avant application ;
- la lave souterraine (grottes, `lake_lava_underground`) et le volume « tunnel de lave » ne sont pas visés, sauf décision contraire.

Vérification : une sonde de lave sur toute la carte de la copie de test, dans les 12 blocs sous la surface : **0 bloc de lave hors de l'Île du volcan** ; l'Île du volcan garde sa lave. Non-régression : biomes identiques sur 9 × 9 colonnes en trois points hors volcan.

Retour arrière : supprimer le fichier de biome_modifier ajouté.

### C2. Datapack final : crochet des plateaux de raccord (constat du 15/11)

Le datapack de l'île 1.3 (relief v3) ne contient plus `data/atheria_ile/lithostitched/worldgen_modifier/plateau_raccord.json`, qui enveloppe `tectonic:base_terrain` avec `atheria_ile:ile_champ` (champ `plateau`). Sans ce fichier, `config/atheria_ile/plateaux.json` est ignoré : aucun plateau n'est posé (test c18 : lot70 à Y 63, 0,7 % à Y 65 ; aucune ligne « plateau de raccord » dans le journal).

À appliquer : le datapack final doit contenir ce fichier, en plus de `relief_ile.json`. Il est copié du monde pilote `pilote-v3-fondu2`, où le plateau fonctionne. Version de test : `branche-relief/atheria_ile_datapack-1.4-relief-v3-plateau.zip` (1.3 plus ce seul fichier).

Retour arrière : retirer le fichier ; les plateaux redeviennent inactifs.
