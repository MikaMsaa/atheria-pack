# Lieux et lots (île, seed 20261108) — 10/11

How these numbers were obtained: offline, from the render of the real generator (`resultats-recensement-B/rendu-relief.png` and `rendu-biomes.png`, 1 sample every 32 blocks, bilinear interpolation, checked every 4 blocks) and from the map (`CarteIle`: regions, distance to the coast).
- Y is the ground before the RN1 (±2 blocks).
- "pente" is the largest gradient measured over 4 blocks.
- "eau" counts samples that touch water. A count > 0 means the lot borders the sea or a pond.
- "cote" is the distance from the lot centre to the coast; "RN1" is the distance from the lot centre to the road axis.
- All lots are aligned on chunks (multiples of 16), so their chunk coordinates are given too.
- City biomes, from the Lost Cities worldstyle `atheria.json`: `minecraft:plains`, `biomesoplenty:dryland`, `terralith:hot_shrubland`, `minecraft:sparse_jungle`. The Longoni zone forces `sparse_jungle`.
- To confirm in game: the RN1 validation run can make a 160×160 zoom of each lot.

## 1. Enceinte de Longoni (port disk 2800,-2950, radius 400)

| Item | Coordinates | Chunks | Y mean / min / max | Slope | Water | Region / biome | Coast | RN1 |
|---|---|---|---|---|---|---|---|---|
| **Enceinte** (176 × 128) | x1,z1 = **2448,-3088** / x2,z2 = **2624,-2960** | 153,-193 → 163,-186 | 65.3 / 64 / 71 | 0.26 | 4 (NE corner, the bay) | Friches urbaines / sparse_jungle ×108 (city) | 105 | 167 |
| Corners vs disk centre | NO 378, NE 224, SO 352, SE 176 blocks (all < 400) | | | | | | | |
| **Porte nord (porte de Rayek)** | north wall z = -3088, opening x **2528 → 2544** (lot 2528,-3104 → 2544,-3088) | 158,-194 | 64.1 / 64 / 65 | 0.05 | 0 | sparse_jungle | 50 | 218 |
| **Mur est** | x = **2623**, from z -3088 to -2961 (strip 2608 → 2624 × -3088 → -2960) | 163,-193 → 163,-186 | 65.1 / 64 / 71 | 0.26 | 4 at the north end (the quay) | sparse_jungle | 72 | 111 |
| **Quai** | 2624,-3088 → 2656,-3072 (32 × 16, half over water) | 164,-193 → 165,-193 | 64 | 0.03 | 36 (edge of the bay) | sparse_jungle | 7 | 133 |
| **Grue** | **2640,-3072**, on the quay edge (Y 64) | 165,-192 | 64 | | | sparse_jungle | 14 | 126 |
| **Point haut à l'ouest** | **2200,-2600**, Y ≈ 91 (summit, 541 blocks SW of the enceinte; looks NE over the enceinte and the bay) | 137,-163 | 91 | | | Friches / plains | 331 | 266 |
| Point haut, variant | **1986,-2684**, Y ≈ 109 (higher, 647 blocks WSW) | 124,-168 | 109 | | | Savane sèche / wasteland_steppe | 510 | 442 |

Notes:
- The whole ground west of the enceinte is a flat plain (Y 64-69) as far as x 1890. There is no relief within 300 blocks to the west. If the shot must be close, it needs a built high point, for example a water tower or the top of the wall at the SW corner.
- The east promontory (2700-2900, -3000 → -2880) rises to Y ≈ 82, but it looks west.
- The RN1 currently starts at 2800,-2950 on that promontory and passes 111-167 blocks from the enceinte.
- If the RN1 should leave from the enceinte: replace point 0 with the SE corner 2624,-2960 (one point to change, then the road runs 2624,-2960 → 2680,-2904 → …).

## 2. Majicavo — lamp room (ruins at the RN1 edge, south of Longoni)

| Item | Coordinates | Chunks | Y mean / min / max | Slope | Water | Region / biome | Coast | RN1 |
|---|---|---|---|---|---|---|---|---|
| **Salle à la lampe** (16 × 16 lot, 9 × 9 room inside) | **2544,-2000 → 2560,-1984** | 159,-125 | 63.8 / 64 / 64 | 0.03 | 0 | Friches / dryland (city) | 100 | 30 |
| 32 × 32 variant (ruins around it) | 2544,-2016 → 2576,-1984 | 159,-126 → 160,-125 | 63.9 / 64 / 64 | 0.03 | 0 | dryland ×8, plains ×1 | 90 | 38 |
| Northern alternative | 2544,-2064 → 2560,-2048 | 159,-129 | 64 | 0.00 | 0 | plains | 63 | 28 |

- East side of the road, right at the south end of the trailer straight.
- The lot's near edge is 22 blocks from the axis: past the roadway (7) and the bas-côtés (10), on the talus. The talus changes nothing here because the ground is flat at Y 64.
- The structure mixin keeps generated structures out of a 64-block corridor. A hand-placed build is not affected.

## 3. Mamoudzou, face à Petite-Terre

The Mamoudzou quarter spans x 2660 → 3040 and z -1300 → -780, between the RN1 and the gravel beach of the channel. Petite-Terre's coast is at x ≈ 3320, with a hill at Y 80-140 (2 points measured: 3400,-904 at Y 114).

| Item | Coordinates | Chunks | Y mean / min / max | Slope | Water | Region / biome | Coast | RN1 |
|---|---|---|---|---|---|---|---|---|
| **Rue droite E-O** (112 × 16 lot, 11-wide street on the axis z ≈ -904) | **2896,-912 → 3008,-896** | 181,-57 → 187,-57 | 65.0 / 64 / 66 | 0.05 | 0 | Friches / plains ×16 (city) | 96 | 187 |
| End of the street toward Petite-Terre | 3010,-904 (Y 64, 38 from the beach; Petite-Terre in line of sight to the east) | 188,-57 | 64 | | | plains | 38 | 231 |
| **Ruelle N-S** (3-4 wide, 16 × 48 lot, starts from the south side of the street) | **2944,-896 → 2960,-848** | 184,-56 → 184,-54 | 65.0 / 65 / 66 | 0.05 | 0 | plains ×8 | 96 | 167 |
| **Toit plat ≥ 20 × 20 at ≥ 20 high** (32 × 32 lot, north side of the street; building ≥ 20 high, roof at Y ≥ 85) | **2976,-944 → 3008,-912** | 186,-59 → 187,-58 | 64.2 / 64 / 65 | 0.03 | 0 | plains ×9 | 56 | 233 |
| Roof variant | 2944,-944 → 2976,-912 | 184,-59 → 185,-58 | 65.0 / 64 / 66 | 0.04 | 0 | plains ×9 | 88 | 209 |
| **CHM** (48 × 48, centre of the quarter) | **2864,-1232 → 2912,-1184** | 179,-77 → 181,-75 | 65.0 / 64 / 66 | 0.05 | 0 | plains ×16 | 196 | 246 |
| CHM along the RN1, variant (64 × 48) | 2688,-1264 → 2752,-1216 | 168,-79 → 171,-77 | 65.4 / 65 / 66 | 0.08 | 0 | plains ×20 | 364 | 88 |

- The street runs east-west, so its far end opens onto the channel and Petite-Terre.
- The street lot is 16 wide: an 11-block street plus 2 or 3 pavement blocks on each side. The facades go on the neighbouring chunks.
- The patch of city biome (plains) is narrow here: 2896 → 3008 × -944 → -848. Beyond it lie wasteland or wasteland_steppe, which are outside the Lost Cities list.

## 4. RN1 (Longoni → Majicavo → Mamoudzou → Coconi → foot of the Bénara)

- **Real width:** 14 configured, which gives a 15-block roadway (half-width 7 + axis). Plus 10 blocks of bas-côtés on each side, then 20 blocks of talus.
- **Curves:** Bézier with radius 48. Slope ≤ 1/8, from a profile smoothed over ±64 blocks.
- **Length:** about 11,250 blocks along the sampled axis, 62 points (test copy, 10/11). Y 64 → 136.
- **Hairpin above Coconi (10/11):** the old zigzag 392,-1144 / 328,-1112 / 296,-1144 / 344,-1240 / 312,-1256 / 408,-1336 brought two legs within less than one road width of each other (a step, slope 0.232 at 321,-1251). It is replaced by one wide hairpin: P35 240,-1130, P36 196,-1196, P37 440,-1262.
  - Legs about 70 blocks apart (at least 34 required).
  - 754 blocks for a 46-block drop (Y 112 → 66): mean slope 0.06.
  - No lot or drawn river within 24 blocks.
- **Water:** 0 sea crossings. 2 fresh-water crossings (thin bridge): 1224,-120 and 856,-88.
- **Coast:** closest to the axis is 38 blocks, at 2447,-2713.
- **Trailer straight:** points 6 → 7, **2536,-2408 → 2520,-1944**.
  - 464 blocks between the points; 370 straight blocks kept after the curves (2534,-2360 → about -1990).
  - Natural ground Y 64 → 65 (dénivelé ≤ 1); 0 water on the axis.
  - Region Friches (dryland, plains, gravel_beach toward the sea side).
  - The coast is ≥ 38 blocks away; the bas-côtés (17 from the axis) and the talus (37) stay on land.
- **Stages along the road:**
  - Longoni (P0 2800,-2950)
  - trailer straight (P6-P7)
  - Majicavo (lamp room 2552,-1992, end of the straight)
  - Mamoudzou (P12-P17, x 2600-2860, z -1450 → -536; the quarter lies 90-250 blocks to the east)
  - Marais aux spores (P23-P28)
  - Coconi (P38-P56)
  - Hauts plateaux, foot of the Bénara (P57-P61, end -984,1176, Y ≈ 115)

Points (x,z), as in the test copy's regions.json (10/11, after the hairpin):
2624,-2960 2456,-2808 2424,-2744 2472,-2680 2568,-2648 2600,-2584 **2536,-2408** **2520,-1944** 2616,-1656 2600,-1448 2632,-1384 2632,-1192 2760,-840 2856,-728 2856,-536 2776,-376 2552,-376 2392,-296 2296,-296 2056,-200 1944,-104 1864,-104 1752,-40 1544,-40 1384,-120 1224,-120 1112,-8 984,-8 856,-72 856,-152 744,-344 744,-568 536,-808 424,-1016 440,-1048 240,-1130 196,-1196 440,-1262 264,-1368 184,-1320 104,-1336 -88,-1496 -216,-1720 -440,-1784 -632,-1672 -696,-1576 -856,-1448 -936,-1304 -1096,-1208 -1112,-1064 -1176,-936 -1240,-904 -1320,-792 -1464,-408 -1464,-360 -1384,-248 -1608,8 -1320,440 -1048,680 -1016,744 -1080,936 -984,1176

Watch points:
- Between Coconi and the Marais (P22, P44-P46, P49, P51-P53), the axis passes less than 32 blocks from drawn rivers and ponds. The feature puts a deck there if there is water underneath; the in-game validation will check for holes.
- Lost Cities is not active in the test copy's overworld (`dimensionsWithProfiles` = lostcities:lostcity only). The structure mixin stops vanilla and mod structures on the corridor, but the RN1/Lost Cities conflict still has to be checked in the real pack (towns thread).
