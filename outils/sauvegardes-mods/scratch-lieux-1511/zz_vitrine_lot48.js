
// ================= MAMOUDZOU : HAUSSMANNIEN SERIE 3 (immeuble a rotonde, hotel particulier, cinema, piscine, lycee, ateliers d'artistes, conservatoire, palais de justice) =================
var HMIB = 'minecraft:iron_bars[east=false,north=true,south=true,waterlogged=false,west=false]', HMIBX = 'minecraft:iron_bars[east=true,north=false,south=false,waterlogged=false,west=true]'
function hmCoupole(cx, cz, y, rs, m) { rs.forEach((r2, i) => { for (var a = -5; a <= 5; a++) for (var b = -5; b <= 5; b++) if (a * a + b * b <= r2) S(cx + a, y + i, cz + b, m) }) }
function hmGradins(x1, x2, z, y, f) { F(x1, y, z, x2, y, z, 'minecraft:red_nether_brick_stairs[facing=' + f + ',half=bottom,shape=straight]') }

// ================= IMMEUBLE D'ANGLE A ROTONDE (R+5, rotonde coiffee d'un dome, cafe au rez) =================
function hmAngle() {
  hmTrottoir(30, 31); for (var x = 0; x <= 8; x++) S(x, -1, 29, 'minecraft:smooth_stone'); for (var z = 12; z <= 29; z++) S(0, -1, z, 'minecraft:smooth_stone')
  for (var x = 1; x <= 30; x++) for (var z = 1; z <= 11; z++) { var r = R(); S(x, -1, z, r < 0.65 ? 'minecraft:cobblestone' : r < 0.85 ? 'minecraft:stone_bricks' : 'minecraft:gravel') }
  var B = [[2, 3], [6, 7], [11, 12], [16, 17]]
  hmPlanchers(9, 12, 30, 29, 6); hmPignons(9, 30, 12, 29, 6); hmArr(9, 30, 12, 6, [[3, 4], [10, 11], [16, 17]])
  hmFac(9, 30, 29, 1, 6, B, [12, 30])
  B.forEach(p => F(9 + p[0], 1, 29, 9 + p[1], 4, 29, GP)); PORTE(19, 1, 29, HMV, 'south', 'left', 'false'); PORTE(29, 1, 29, HPO, 'south', 'left', 'false')
  // rotonde (centre 5,24) : anneau de pierre, baies sur les trois faces exterieures, planchers ronds
  var cx = 5, cz = 24, r2 = 20
  function dans(a, b) { return a * a + b * b <= r2 }
  for (var a = -4; a <= 4; a++) for (var b = -4; b <= 4; b++) {
    if (!dans(a, b)) continue
    var bord = !dans(a + 1, b) || !dans(a - 1, b) || !dans(a, b + 1) || !dans(a, b - 1)
    if (!bord) { S(cx + a, 0, cz + b, (a + b) % 2 ? 'minecraft:white_concrete' : 'minecraft:black_concrete'); for (var n = 1; n < 6; n++) S(cx + a, n * 6, cz + b, 'minecraft:spruce_planks'); continue }
    var baie = (Math.abs(b) <= 1 && a < 0) || (Math.abs(a) <= 1 && b != 0)
    for (var y = 0; y < 36; y++) { var k = y % 6; S(cx + a, y, cz + b, baie && k >= 1 && k <= 4 && (y >= 6 || b > 0 || a < 0) ? GP : (k == 0 ? HC : hbM(HS))) }
    S(cx + a, 35, cz + b, HC)
  }
  hmCoupole(cx, cz, 36, [20, 13, 8, 2], 'minecraft:oxidized_cut_copper'); S(cx, 40, cz, 'minecraft:oxidized_cut_copper_slab[type=bottom]')
  for (var y = 0; y < 36; y += 6) PORTE(9, y + 1, 24, HPO, 'west', 'left', y == 0 ? 'true' : 'false')
  // cafe dans la rotonde, tailleur dans l'aile
  ;[[3, 22], [7, 22], [3, 26], [7, 26]].forEach(t => { S(t[0], 1, t[1], 'mcwfurnitures:dark_oak_table'); S(t[0], 1, t[1] - 1, MAT('dark_oak_chair', 'south')); SA(t[0], 2, t[1], choix(VAISS).replace('{I}', 'north')) }); F(4, 1, 21, 6, 1, 21, MAT('dark_oak_counter', 'south')); hmLustre(5, 5, 24)
  for (var x = 10; x <= 25; x++) for (var z = 20; z <= 28; z++) S(x, 0, z, (x + z) % 2 ? 'minecraft:smooth_quartz' : 'minecraft:light_gray_concrete')
  F(11, 1, 20, 18, 1, 20, MAT('dark_oak_counter', 'south')); ;[11, 13, 15, 17].forEach(x => SA(x, 2, 20, choix(['minecraft:white_wool', 'minecraft:gray_wool', 'minecraft:black_wool', 'minecraft:brown_wool'])))
  F(10, 1, 13, 25, 3, 13, 'minecraft:chiseled_bookshelf[facing=south]'); F(22, 1, 20, 22, 3, 20, 'minecraft:glass'); F(10, 1, 19, 25, 5, 19, HMPL); PORTE(18, 1, 19, HPO, 'south', 'left', 'false'); hmLustre(16, 5, 24)
  // escalier et logements
  hmEsc(27, 13, 6)
  ;[0, 6, 12, 18, 24, 30].forEach((y, n) => {
    F(26, y + 1, 13, 26, y + 5, 19, HMPL); F(27, y + 1, 19, 29, y + 5, 19, HMPL); PORTE(28, y + 1, 19, HPO, 'south', 'left', 'false')
    if (n == 0) return
    F(10, y + 1, 19, 25, y + 5, 19, HMPL); PORTE(18, y + 1, 19, HPO, 'south', 'left', 'false'); F(18, y + 1, 20, 18, y + 5, 28, HMPL); PORTE(18, y + 1, 21, HPO, 'west', 'left', 'false')
    piece(cadre(10, 20, 17, 28, 'south', y, 5), choix(['salon', 'salle']), R() < 0.5 ? 1 : 0); piece(cadre(19, 20, 29, 28, 'south', y, 5), choix(['chambre', 'salon']), R() < 0.5 ? 1 : 0)
    piece(cadre(10, 13, 25, 18, 'north', y, 5), choix(['chambre', 'cuisine', 'sdb']), R() < 0.5 ? 1 : 0)
    S(cx, y + 1, cz, 'mcwfurnitures:dark_oak_table'); S(cx - 1, y + 1, cz, MAT('dark_oak_chair', 'east')); SA(cx, y + 2, cz, choix(['supplementaries:book_pile', 'handcrafted:stackable_book', 'minecraft:candle[candles=2,lit=false]'])); S(cx, y + 5, cz, HLH)
    if (R() < 0.6) SA(cx + 2, y + 1, cz + 2, choix(POTS))
  })
  hbMansarde(9, 12, 30, 29, 36); hbCheminee(12, 15, 40, 2); hbCheminee(27, 26, 40, 2)
  hmSills(9, 30, 29, 1, 6)
  // cour : appentis a velos, poubelles, linge
  PORTE(20, 1, 12, HPO, 'north', 'left', 'false'); F(2, 0, 2, 10, 2, 2, 'minecraft:spruce_planks'); F(2, 3, 2, 10, 3, 4, 'minecraft:spruce_slab[type=bottom]'); ;[2, 10].forEach(x => F(x, 0, 4, x, 2, 4, 'minecraft:spruce_fence'))
  ;[4, 6, 8].forEach(x => { S(x, 0, 3, 'minecraft:iron_bars'); S(x, 1, 3, 'minecraft:iron_bars') }); F(14, 0, 1, 15, 0, 1, 'minecraft:green_terracotta'); F(14, 1, 1, 15, 1, 1, 'minecraft:iron_trapdoor[facing=south,half=bottom,open=false,powered=false,waterlogged=false]')
  hbMur(0, 0, 0, 31, 2, 0, HSB); hbMur(31, 0, 1, 31, 2, 11, HSB); hbMur(0, 0, 1, 0, 2, 11, HSB); hbPlatane(24, 6, 6)
}

// ================= HOTEL PARTICULIER (grille sur rue, cour d'honneur, corps de logis R+1, communs, jardin) =================
function hmHotelParticulier() {
  hmTrottoir(30, 31)
  // mur de cloture et grille d'honneur
  hbMur(1, 0, 29, 30, 3, 29, HS); F(1, 4, 29, 30, 4, 29, 'minecraft:smooth_sandstone_slab[type=bottom]'); F(13, 0, 29, 18, 4, 29, HMIBX)
  ;[12, 19].forEach(x => { F(x, 0, 29, x, 5, 29, HC); S(x, 6, 29, 'minecraft:decorated_pot') })
  for (var x = 1; x <= 30; x++) for (var z = 18; z <= 28; z++) S(x, -1, z, R() < 0.85 ? 'minecraft:gravel' : 'minecraft:coarse_dirt')
  W(13, 21, 18, 26, 0, 0, 'minecraft:smooth_sandstone'); F(14, 0, 22, 17, 0, 25, 'minecraft:water'); F(14, -1, 22, 17, -1, 25, 'minecraft:smooth_sandstone'); F(15, 0, 23, 16, 1, 24, 'minecraft:smooth_sandstone'); S(15, 2, 23, 'minecraft:decorated_pot')
  // corps de logis x4..27 z6..17, facade sur la cour en z17
  var B = [[1, 2], [5, 6], [9, 10], [13, 14], [17, 18], [21, 22]]
  hmPlanchers(4, 6, 27, 17, 2); hmPignons(4, 27, 6, 17, 2); hmArr(4, 27, 6, 2, [[1, 2], [5, 6], [17, 18], [21, 22]])
  hmFac(4, 27, 17, 1, 2, B, []); B.forEach(p => F(4 + p[0], 1, 17, 4 + p[1], 4, 17, GP))
  F(15, 1, 17, 16, 4, 17, GP); PORTE(15, 1, 17, HMV, 'south', 'left', 'false'); PORTE(16, 1, 17, HMV, 'south', 'right', 'true'); F(13, 0, 18, 18, 0, 18, 'minecraft:smooth_sandstone_slab[type=bottom]')
  F(13, 6, 18, 18, 6, 18, 'minecraft:smooth_sandstone_slab[type=top]'); F(13, 7, 18, 18, 7, 18, HF)
  // vestibule, escalier, grand salon, salle a manger
  for (var x = 13; x <= 18; x++) for (var z = 7; z <= 16; z++) S(x, 0, z, (x + z) % 2 ? 'minecraft:smooth_quartz' : 'minecraft:polished_deepslate')
  hmEsc(14, 7, 2)
  ;[0, 6].forEach((y, n) => {
    F(12, y + 1, 7, 12, y + 5, 16, HMPL); F(19, y + 1, 7, 19, y + 5, 16, HMPL); PORTE(12, y + 1, 14, HPO, 'west', 'left', 'false'); PORTE(19, y + 1, 14, HPO, 'east', 'right', 'false')
    hmLustre(16, y + 5, 13)
    if (n == 0) { piece(cadre(5, 7, 11, 16, 'south', y, 5), 'salon', 1); piece(cadre(20, 7, 26, 16, 'south', y, 5), 'salle', 1) }
    else { piece(cadre(5, 7, 11, 16, 'south', y, 5), 'chambre', 1); piece(cadre(20, 7, 26, 16, 'south', y, 5), choix(['chambre', 'bureau']), 0) }
  })
  F(5, 1, 7, 11, 1, 7, 'minecraft:bookshelf'); S(8, 1, 12, 'minecraft:note_block'); S(8, 2, 12, 'minecraft:dark_oak_pressure_plate')
  hbMansarde(4, 6, 27, 17, 12); hbCheminee(6, 9, 16, 1); hbCheminee(25, 9, 16, 1)
  hmSills(4, 27, 17, 1, 2)
  // communs : remise a voiture et ecurie de part et d'autre de la cour
  ;[[1, 7], [24, 30]].forEach((c, i) => {
    hbMur(c[0], 0, 19, c[1], 4, 27, HS); F(c[0] + 1, 1, 20, c[1] - 1, 4, 26, AIR); F(c[0] + 1, 0, 20, c[1] - 1, 0, 26, 'minecraft:polished_andesite')
    var xo = i ? c[0] : c[1]; F(xo, 1, 21, xo, 3, 25, AIR)
    F(c[0], 5, 19, c[1], 5, 27, 'minecraft:deepslate_tile_slab[type=bottom]')
    if (i == 0) { bgVoiture(3, 21, 'z', 'black', 1); S(2, 1, 26, 'minecraft:barrel[facing=up,open=false]') }
    else { F(26, 1, 21, 26, 1, 25, 'minecraft:spruce_fence'); ;[22, 24].forEach(z => { S(28, 1, z, 'minecraft:hay_block'); S(29, 1, z, 'minecraft:composter[level=0]') }); S(27, 4, 23, HLH) }
  })
  // jardin a la francaise derriere
  hbSol(1, 1, 30, 5); for (var x = 2; x <= 29; x++) { if (x % 4 == 0) S(x, 0, 2, 'minecraft:azalea_leaves[persistent=true]'); delete HV[x + ',2'] } PORTE(15, 1, 6, HMV, 'north', 'left', 'false')
  hbPlatane(5, 3, 5); hbPlatane(26, 3, 5); gtBanc(15, 1, 'south', 3)
  hbMur(0, 0, 0, 31, 2, 0, HSB); hbMur(0, 0, 1, 0, 2, 28, HSB); hbMur(31, 0, 1, 31, 2, 28, HSB); hbVeg(1, 1, 30, 5, 0.6)
}

// ================= CINEMA (facade art deco, marquise, guichet, salle en gradins, balcon, cabine de projection) =================
function hmCinema() {
  hmTrottoir(30, 31)
  hbMur(2, 0, 6, 2, 14, 28, HS); hbMur(29, 0, 6, 29, 14, 28, HS); hbMur(2, 0, 6, 29, 14, 6, HS)
  // facade z29 : quartz, pilastres, attique a gradins
  for (var x = 2; x <= 29; x++) for (var y = 0; y <= 15; y++) S(x, y, 29, (x % 5 == 2) ? 'minecraft:quartz_pillar[axis=y]' : y % 5 == 0 ? 'minecraft:quartz_bricks' : 'minecraft:smooth_quartz')
  F(8, 16, 29, 23, 17, 29, 'minecraft:smooth_quartz'); F(12, 18, 29, 19, 19, 29, 'minecraft:quartz_bricks'); F(14, 20, 29, 17, 20, 29, 'minecraft:chiseled_quartz_block')
  F(5, 7, 29, 26, 12, 29, GP); ;[7, 12, 17, 22].forEach(x => F(x, 7, 29, x, 12, 29, 'minecraft:quartz_pillar[axis=y]')); F(5, 6, 29, 26, 6, 29, 'minecraft:quartz_bricks')
  F(9, 1, 29, 22, 4, 29, GP); ;[11, 14, 17, 20].forEach(x => PORTE(x, 1, 29, HMV, 'south', 'left', R() < 0.4 ? 'true' : 'false'))
  // marquise lumineuse (eteinte) et affiches sans texte
  F(6, 5, 30, 25, 5, 31, 'minecraft:smooth_quartz_slab[type=top]'); for (var x = 7; x <= 24; x += 3) S(x, 4, 31, HLH); F(6, 6, 30, 25, 6, 30, 'minecraft:red_concrete')
  ;[[3, 6], [26, 28]].forEach(c => { F(c[0], 1, 30, c[1] - 1, 3, 30, 'minecraft:dark_oak_planks'); F(c[0], 2, 30, c[1] - 1, 2, 30, choix(['minecraft:yellow_terracotta', 'minecraft:red_terracotta', 'minecraft:blue_terracotta'])) })
  // foyer : guichet vitre, comptoir a confiseries
  for (var x = 3; x <= 28; x++) for (var z = 23; z <= 28; z++) S(x, 0, z, (x + z) % 2 ? 'minecraft:red_terracotta' : 'minecraft:black_concrete')
  F(4, 1, 25, 7, 1, 25, MAT('dark_oak_counter', 'south')); F(4, 2, 25, 7, 3, 25, GP); F(4, 1, 23, 7, 4, 24, 'minecraft:dark_oak_planks'); F(5, 1, 24, 6, 3, 24, AIR); F(4, 4, 25, 7, 4, 25, 'minecraft:dark_oak_planks')
  F(22, 1, 24, 27, 1, 24, MAT('dark_oak_counter', 'south')); ;[23, 25, 27].forEach(x => SA(x, 2, 24, choix(['supplementaries:jar', 'createfood:apple_juice_bottle_block', 'supplementaries:jar'])))
  F(3, 1, 22, 28, 13, 22, HS); ;[10, 21].forEach(x => { F(x, 1, 22, x + 1, 3, 22, AIR); S(x, 4, 22, 'minecraft:red_wool'); S(x + 1, 4, 22, 'minecraft:red_wool') }); F(3, 6, 23, 28, 6, 28, 'minecraft:spruce_planks'); hmLustre(15, 5, 26)
  // salle : ecran, scene, gradins de fauteuils rouges sur plancher incline
  F(6, 3, 7, 25, 11, 7, 'minecraft:white_concrete'); F(5, 2, 7, 26, 2, 7, 'minecraft:red_wool'); F(5, 12, 7, 26, 12, 7, 'minecraft:red_wool'); F(5, 3, 7, 5, 11, 7, 'minecraft:red_wool'); F(26, 3, 7, 26, 11, 7, 'minecraft:red_wool')
  F(3, 0, 7, 28, 1, 10, 'minecraft:dark_oak_planks'); F(3, 0, 11, 28, 0, 21, 'minecraft:red_wool')
  for (var i = 0; i < 5; i++) { var z = 12 + i * 2; if (i) F(3, 1, z, 28, i, z + 1, 'minecraft:red_wool'); hmGradins(4, 13, z, i + 1, 'south'); hmGradins(18, 27, z, i + 1, 'south') }
  for (var i = 1; i < 5; i++) F(15, i, 12 + i * 2, 16, i, 13 + i * 2, 'minecraft:red_wool')
  // balcon et cabine de projection
  F(3, 7, 17, 28, 7, 21, 'minecraft:dark_oak_planks'); F(3, 8, 17, 28, 8, 17, 'minecraft:dark_oak_slab[type=bottom]'); hmGradins(4, 27, 18, 8, 'south'); hmGradins(4, 27, 20, 9, 'south'); F(3, 8, 20, 28, 8, 21, 'minecraft:dark_oak_planks')
  F(12, 10, 21, 19, 13, 21, HS); F(14, 11, 21, 17, 11, 21, GP); S(15, 10, 22, 'minecraft:dispenser[facing=north,triggered=false]'); S(16, 10, 22, 'minecraft:barrel[facing=up,open=false]')
  ;[[8, 13, 12], [23, 13, 12]].forEach(p => hmLustre(p[0], p[1], p[2])); ;[[15, 13, 10], [5, 13, 9], [26, 13, 9], [15, 13, 15]].forEach(p => S(p[0], p[1], p[2], HLH)); ;[8, 15, 23].forEach(x => S(x, 6, 19, HLH))
  // mezzanine du foyer : salon d'attente derriere les grandes baies
  ;[[6, 26], [12, 26], [19, 26], [25, 26]].forEach(p => { S(p[0], 7, p[1], 'mcwfurnitures:dark_oak_table'); S(p[0] - 1, 7, p[1], MAT('dark_oak_chair', 'east')); S(p[0] + 1, 7, p[1], MAT('dark_oak_chair', 'west')); SA(p[0], 8, p[1], choix(VAISS).replace('{I}', 'north')) })
  ;[4, 27].forEach(x => SA(x, 7, 24, choix(POTS))); F(9, 7, 23, 22, 7, 23, 'minecraft:red_carpet'); S(15, 14, 26, HLH); S(8, 14, 26, HLH); S(23, 14, 26, HLH)
  F(2, 15, 6, 29, 15, 28, 'minecraft:smooth_stone_slab[type=bottom]'); F(3, 14, 7, 28, 14, 21, 'minecraft:dark_oak_planks')
  // ruelle arriere
  for (var x = 1; x <= 30; x++) for (var z = 1; z <= 5; z++) S(x, -1, z, R() < 0.7 ? 'minecraft:cobblestone' : 'minecraft:gravel')
  PORTE(28, 1, 6, 'minecraft:iron_door', 'north', 'left', 'false'); ;[[5, 3], [6, 3], [20, 2]].forEach(p => S(p[0], 0, p[1], 'minecraft:barrel[facing=up,open=false]')); F(10, 0, 4, 11, 0, 4, 'minecraft:green_terracotta')
}

// ================= PISCINE MUNICIPALE (bassin sous verriere, cabines, galerie, plongeoir) =================
function hmPiscine() {
  hmTrottoir(30, 31)
  // enveloppe de brique, bandeaux blancs
  for (var x = 2; x <= 29; x++) for (var y = 0; y <= 13; y++) { S(x, y, 29, y % 6 == 0 ? 'minecraft:white_concrete' : HBR); S(x, y, 4, y % 6 == 0 ? 'minecraft:white_concrete' : HBR) }
  for (var z = 5; z <= 28; z++) for (var y = 0; y <= 13; y++) { var w = y >= 7 && y <= 10 && z % 4 == 1; S(2, y, z, w ? GP : HBR); S(29, y, z, w ? GP : HBR) }
  ;[[5, 8], [12, 13], [18, 19], [23, 26]].forEach(p => F(p[0], 7, 29, p[1], 11, 29, GP)); F(13, 1, 29, 18, 4, 29, GP); PORTE(15, 1, 29, HMV, 'south', 'left', 'false'); PORTE(16, 1, 29, HMV, 'south', 'right', 'false')
  F(12, 14, 29, 19, 16, 29, HBR); F(14, 15, 30, 17, 15, 30, 'minecraft:light_blue_terracotta'); F(12, 5, 30, 19, 5, 30, 'minecraft:white_concrete')
  // foyer : caisse, tourniquets
  for (var x = 3; x <= 28; x++) for (var z = 24; z <= 28; z++) S(x, 0, z, (x + z) % 2 ? 'minecraft:white_concrete' : 'minecraft:light_blue_concrete')
  F(3, 1, 23, 28, 5, 23, 'minecraft:white_concrete'); F(14, 1, 23, 17, 3, 23, AIR); F(14, 1, 24, 17, 1, 24, HMIBX); S(15, 1, 24, AIR); S(16, 1, 24, AIR)
  F(5, 1, 26, 9, 1, 26, MAT('oak_counter', 'south')); F(5, 2, 26, 9, 3, 26, GP); S(7, 2, 26, AIR); F(3, 6, 24, 28, 6, 28, 'minecraft:spruce_planks'); hmLustre(15, 5, 26)
  // halle : plages carrelees, bassin, echelles
  for (var x = 3; x <= 28; x++) for (var z = 5; z <= 22; z++) S(x, 0, z, (x + z) % 2 ? 'minecraft:white_concrete' : 'minecraft:light_blue_concrete')
  F(9, -1, 8, 22, -1, 20, 'minecraft:dark_prismarine'); F(9, 0, 8, 22, 0, 20, 'minecraft:water'); F(8, 0, 7, 23, 0, 7, 'minecraft:light_blue_terracotta'); F(8, 0, 21, 23, 0, 21, 'minecraft:light_blue_terracotta'); F(8, 0, 8, 8, 0, 20, 'minecraft:light_blue_terracotta'); F(23, 0, 8, 23, 0, 20, 'minecraft:light_blue_terracotta')
  ;[11, 20].forEach(x => S(x, 0, 21, 'minecraft:ladder[facing=north,waterlogged=true]'))
  for (var z = 9; z <= 19; z += 2) S(15, 0, z, 'minecraft:water'); F(9, 1, 14, 22, 1, 14, 'minecraft:white_carpet'.replace('white_carpet', 'chain[axis=x]'))
  // plongeoir au fond
  F(15, 1, 5, 16, 5, 5, 'minecraft:smooth_quartz'); F(15, 5, 6, 16, 5, 11, 'minecraft:smooth_quartz_slab[type=bottom]'); F(13, 1, 5, 13, 5, 5, 'minecraft:ladder[facing=west,waterlogged=false]'); F(14, 1, 5, 14, 5, 5, 'minecraft:smooth_quartz')
  // cabines sur deux cotes, galerie a l'etage
  ;[[3, 6, 'east'], [25, 28, 'west']].forEach(c => {
    var xi = c[2] == 'east' ? c[1] : c[0]
    for (var z = 5; z <= 21; z += 3) { F(c[0], 1, z, c[1], 4, z, 'minecraft:white_concrete'); F(xi, 1, z + 2, xi, 4, z + 2, 'minecraft:white_concrete'); F(xi, 3, z + 1, xi, 4, z + 1, 'minecraft:white_concrete'); PORTE(xi, 1, z + 1, 'mcwdoors:spruce_classic_door', c[2], 'left', R() < 0.3 ? 'true' : 'false'); S(c[2] == 'east' ? c[0] : c[1], 1, z + 1, hbE('minecraft:spruce', c[2] == 'east' ? 'west' : 'east')) }
    F(c[0], 1, 22, c[1], 4, 22, 'minecraft:white_concrete'); F(c[0], 5, 5, c[1], 5, 22, 'minecraft:white_concrete'); F(xi, 6, 5, xi, 6, 22, HMIB)
    for (var z = 7; z <= 21; z += 6) { S(c[0] == 3 ? 4 : 27, 6, z, hbE('minecraft:spruce', c[2] == 'east' ? 'west' : 'east')) }
  })
  F(3, 1, 5, 3, 5, 5, 'minecraft:white_concrete'); for (var i = 0; i < 4; i++) S(7, 1 + i, 22 - i, hbE('minecraft:quartz', 'north')); F(7, 1, 18, 7, 4, 18, 'minecraft:smooth_quartz')
  // chaise de maitre-nageur, bouee
  F(25, 1, 13, 25, 2, 13, 'minecraft:white_concrete'); S(25, 3, 13, hbE('minecraft:spruce', 'east')); S(24, 1, 16, 'minecraft:red_carpet')
  // verriere en berceau sur fermes de fer
  for (var z = 5; z <= 28; z++) {
    F(2, 14, z, 29, 14, z, z % 4 == 0 ? 'minecraft:iron_block' : 'minecraft:glass'); if (z <= 22 && z % 4 == 0) { F(6, 15, z, 25, 15, z, 'minecraft:iron_block') }
    if (z <= 22) F(7, 15, z, 24, 15, z, z % 4 == 0 ? 'minecraft:iron_block' : 'minecraft:glass'); if (z <= 22) F(11, 16, z, 20, 16, z, z % 4 == 0 ? 'minecraft:iron_block' : 'minecraft:glass')
    if (z % 4 == 2 && z <= 22) S(15, 13, z, HLH)
  }
  F(3, 14, 23, 28, 14, 28, 'minecraft:smooth_stone_slab[type=bottom]')
  // cour arriere
  for (var x = 1; x <= 30; x++) for (var z = 1; z <= 3; z++) S(x, -1, z, 'minecraft:gravel'); S(5, 0, 2, 'minecraft:barrel[facing=up,open=false]'); S(25, 0, 2, 'minecraft:chest[facing=south]')
}

// ================= LYCEE (rangee sud : aile sur rue R+2, deux ailes laterales, cour a arcades, terrain de sport) =================
function hmLycee() {
  hmTrottoir(0, 1)
  var B = [[1, 2], [5, 6], [9, 10], [17, 18], [21, 22], [25, 26]]
  hmPlanchers(2, 2, 29, 9, 3); hmPignons(2, 29, 2, 24, 3); hmFac(2, 29, 2, -1, 3, B, [12])
  B.forEach(p => F(2 + p[0], 2, 2, 2 + p[1], 4, 2, GP)); F(14, 1, 2, 17, 4, 2, GP); PORTE(15, 1, 2, HPO, 'north', 'left', 'false'); PORTE(16, 1, 2, HPO, 'north', 'right', 'false')
  F(13, 0, 1, 18, 0, 1, 'minecraft:smooth_stone_slab[type=bottom]'); S(15, 8, 1, 'minecraft:blue_wall_banner[facing=north]'); S(16, 8, 1, 'minecraft:red_wall_banner[facing=north]')
  // ailes laterales x2..8 et x23..29, facade sur cour en x8 / x23, arcades au rez
  ;[[2, 8, 8, 'east'], [23, 29, 23, 'west']].forEach(c => {
    F(c[0] + 1, 0, 10, c[1] - 1, 0, 24, 'minecraft:polished_andesite'); for (var n = 1; n < 3; n++) F(c[0] + 1, n * 6, 10, c[1] - 1, n * 6, 24, 'minecraft:spruce_planks')
    for (var z = 10; z <= 24; z++) for (var y = 0; y <= 17; y++) { var k = y % 6, w = y >= 6 && k >= 2 && k <= 4 && z % 3 == 1; S(c[2], y, z, w ? GP : (k == 0 ? HC : hbM(HS))) }
    for (var z = 11; z <= 23; z += 3) F(c[2], 1, z, c[2], 3, z + 1, AIR)
    hbMur(c[0], 0, 24, c[1], 17, 24, HS)
  })
  hmArr(9, 22, 9, 3, [[1, 2], [5, 6], [9, 10]]); F(14, 1, 9, 17, 3, 9, AIR)
  // cour : marronnier, bancs, mat
  for (var x = 9; x <= 22; x++) for (var z = 10; z <= 23; z++) S(x, -1, z, R() < 0.8 ? 'minecraft:gravel' : 'minecraft:coarse_dirt')
  hbPlatane(15, 17, 6); gtBanc(11, 21, 'north', 3); gtBanc(19, 12, 'south', 3)
  // escalier, classes, laboratoire, bibliotheque
  hmEsc(14, 3, 3)
  ;[0, 6, 12].forEach((y, n) => {
    F(13, y + 1, 3, 13, y + 5, 8, HMPL); F(17, y + 1, 3, 17, y + 5, 8, HMPL); PORTE(13, y + 1, 7, HPO, 'west', 'left', 'false'); PORTE(17, y + 1, 7, HPO, 'east', 'right', 'false')
    ;[[3, 12, 1], [18, 28, -1]].forEach(c => {
      var xb = c[2] > 0 ? c[0] : c[1], f = c[2] > 0 ? 'west' : 'east'
      F(xb, y + 2, 4, xb, y + 3, 8, 'minecraft:black_concrete'); S(xb + c[2] * 2, y + 1, 6, 'mcwfurnitures:dark_oak_table')
      for (var k = 4; k <= 8; k += 2) for (var z = 4; z <= 8; z += 2) { var x = xb + c[2] * k; S(x, y + 1, z, 'mcwfurnitures:oak_table'); S(x + c[2], y + 1, z, MAT('oak_chair', f)) }
      S(xb + c[2] * 5, y + 5, 6, HLH)
    })
    if (n == 0) return
    // laboratoire (aile est) et bibliotheque (aile ouest)
    for (var z = 11; z <= 22; z += 3) { S(26, y + 1, z, MAT('oak_counter', 'west')); S(26, y + 2, z, choix(['minecraft:brewing_stand', 'supplementaries:jar', 'minecraft:cauldron'])) }
    for (var z = 11; z <= 23; z += 2) F(3, y + 1, z, 3, y + 3, z, 'minecraft:bookshelf'); S(5, y + 1, 17, 'mcwfurnitures:oak_table'); S(5, y + 2, 17, 'supplementaries:book_pile'); S(5, y + 5, 17, HLH); S(26, y + 5, 17, HLH)
  })
  hbMansarde(2, 2, 29, 9, 18); hbMansarde(2, 10, 8, 24, 18); hbMansarde(23, 10, 29, 24, 18); hbCheminee(5, 5, 22, 1); hbCheminee(26, 5, 22, 1)
  hmSills(2, 29, 2, -1, 3)
  // terrain de sport derriere
  for (var x = 1; x <= 30; x++) for (var z = 25; z <= 30; z++) S(x, -1, z, 'minecraft:coarse_dirt'); for (var x = 3; x <= 28; x++) S(x, -1, 27, 'minecraft:white_concrete')
  ;[3, 28].forEach(x => { F(x, 0, 29, x, 2, 29, 'minecraft:white_concrete') }); F(3, 3, 29, 28, 3, 29, 'minecraft:white_concrete')
  hbMur(0, 0, 25, 0, 2, 31, HSB); hbMur(31, 0, 25, 31, 2, 31, HSB); hbMur(1, 0, 31, 30, 2, 31, HSB)
}

// ================= ATELIERS D'ARTISTES (rangee sud, brique, grandes verrieres au nord, toit en sheds) =================
function hmAteliers() {
  hmTrottoir(0, 1)
  hmPlanchers(2, 2, 29, 15, 4); hbMur(2, 0, 2, 2, 23, 15, HBR); hbMur(29, 0, 2, 29, 23, 15, HBR); hmArr(2, 29, 15, 4, [[3, 4], [10, 11], [18, 19], [24, 25]])
  // facade de brique : baies du rez et des etages, verrieres pleine hauteur au dernier niveau
  for (var x = 2; x <= 29; x++) for (var y = 0; y <= 23; y++) {
    var k = y % 6, rx = (x - 2) % 7, b = k == 0 ? 'minecraft:stone_bricks' : HBR
    if (y >= 18 && k >= 1 && rx >= 1 && rx <= 5) b = GP
    else if (y >= 6 && y < 18 && k >= 2 && k <= 4 && (rx == 2 || rx == 3 || rx == 5)) b = GP
    else if (y < 6 && k >= 1 && k <= 4 && rx >= 1 && rx <= 5) b = GP
    S(x, y, 2, b)
  }
  ;[[9, 'left'], [23, 'left']].forEach(p => PORTE(p[0], 1, 2, HPO, 'north', p[1], 'false'))
  // fonderie d'art au rez
  for (var x = 3; x <= 28; x++) for (var z = 3; z <= 14; z++) S(x, 0, z, R() < 0.7 ? 'minecraft:polished_andesite' : 'minecraft:gravel')
  S(5, 1, 13, 'minecraft:blast_furnace[facing=south,lit=false]'); S(6, 1, 13, 'minecraft:blast_furnace[facing=south,lit=false]'); S(8, 1, 12, 'minecraft:cauldron'); S(10, 1, 12, 'minecraft:anvil[facing=east]'); S(12, 1, 13, 'minecraft:grindstone[face=floor,facing=south]')
  ;[[18, 8], [22, 10], [25, 6]].forEach(p => { S(p[0], 1, p[1], 'minecraft:chiseled_stone_bricks'); S(p[0], 2, p[1], choix(['minecraft:polished_andesite', 'minecraft:calcite', 'minecraft:smooth_basalt'])) })
  F(14, 1, 3, 14, 5, 14, HBR); PORTE(14, 1, 8, HPO, 'west', 'left', 'true'); S(8, 5, 8, HLH); S(22, 5, 8, HLH)
  // escalier
  hmEsc(26, 9, 4); F(25, 1, 9, 25, 23, 14, HBR); PORTE(25, 1, 11, HPO, 'west', 'left', 'false')
  // logements aux 1er et 2e, ateliers au 3e
  ;[6, 12].forEach(y => { PORTE(25, y + 1, 11, HPO, 'west', 'left', 'false'); F(14, y + 1, 3, 14, y + 5, 14, HMPL); PORTE(14, y + 1, 12, HPO, 'west', 'left', 'false'); piece(cadre(3, 3, 13, 14, 'north', y, 5), choix(['salon', 'chambre']), R() < 0.5 ? 1 : 0); piece(cadre(15, 3, 24, 14, 'north', y, 5), choix(['cuisine', 'chambre', 'salle']), R() < 0.5 ? 1 : 0) })
  PORTE(25, 19, 11, HPO, 'west', 'left', 'true')
  // grand atelier : chevalets (toiles = blocs blancs sur barrieres), sellettes de sculpteur, tables
  for (var x = 4; x <= 22; x += 6) { S(x, 19, 6, 'minecraft:spruce_fence'); S(x, 20, 6, 'minecraft:white_concrete'); S(x, 21, 6, 'minecraft:spruce_fence'); S(x + 2, 19, 8, MAT('oak_chair', 'north')) }
  ;[[6, 11], [18, 11]].forEach(p => { S(p[0], 19, p[1], 'mcwfurnitures:oak_table'); SA(p[0], 20, p[1], choix(['supplementaries:jar', 'minecraft:flower_pot', 'minecraft:candle[candles=3,lit=false]'])) })
  S(12, 19, 12, 'minecraft:loom[facing=north]'); S(10, 19, 13, 'minecraft:cartography_table'); F(3, 19, 14, 9, 19, 14, 'minecraft:white_carpet'); S(20, 19, 13, 'minecraft:chiseled_stone_bricks'); S(20, 20, 13, 'minecraft:calcite')
  LIT(22, 19, 13, 'light_gray', 'east'); hbBazar(3, 9, 24, 13, 19, 6)
  // toit en sheds vitres au nord
  for (var z0 = 2; z0 <= 13; z0 += 4) {
    F(2, 24, z0, 29, 26, z0, 'minecraft:glass'); ;[2, 9, 16, 23, 29].forEach(x => F(x, 24, z0, x, 26, z0, 'minecraft:iron_block'))
    F(2, 26, z0 + 1, 29, 26, z0 + 1, btSt('deepslate_tile', 'north')); F(2, 25, z0 + 2, 29, 25, z0 + 2, btSt('deepslate_tile', 'north')); F(2, 24, z0 + 3, 29, 24, z0 + 3, btSt('deepslate_tile', 'north'))
  }
  F(2, 24, 14, 29, 24, 15, 'minecraft:deepslate_tile_slab[type=bottom]')
  // cour : blocs de pierre, sculpture, tilleul
  for (var x = 1; x <= 30; x++) for (var z = 16; z <= 30; z++) S(x, -1, z, R() < 0.6 ? 'minecraft:gravel' : 'minecraft:cobblestone')
  PORTE(20, 1, 15, HPO, 'south', 'left', 'false'); ;[[6, 20], [7, 20], [6, 21]].forEach(p => S(p[0], 0, p[1], 'minecraft:smooth_stone')); S(6, 1, 20, 'minecraft:smooth_stone')
  F(18, 0, 24, 18, 2, 24, 'minecraft:calcite'); S(18, 3, 24, 'minecraft:skeleton_skull[rotation=8]'); hbPlatane(26, 25, 6)
  hbMur(0, 0, 16, 0, 2, 31, HBR); hbMur(31, 0, 16, 31, 2, 31, HBR); hbMur(1, 0, 31, 30, 2, 31, HBR)
}

// ================= CONSERVATOIRE (rangee sud, salles de travail sur rue, auditorium a orgue derriere) =================
function hmConservatoire() {
  hmTrottoir(0, 1)
  var B = [[1, 2], [5, 6], [9, 10], [17, 18], [21, 22], [25, 26]]
  hmPlanchers(2, 2, 29, 12, 2); hmPignons(2, 29, 2, 12, 2); hmFac(2, 29, 2, -1, 2, B, [])
  B.forEach(p => F(2 + p[0], 2, 2, 2 + p[1], 4, 2, GP)); F(14, 1, 2, 17, 4, 2, GP); PORTE(15, 1, 2, HMV, 'north', 'left', 'false'); PORTE(16, 1, 2, HMV, 'north', 'right', 'false')
  F(13, 5, 1, 18, 5, 1, 'minecraft:smooth_sandstone_slab[type=bottom]'); F(12, 6, 1, 19, 6, 1, 'minecraft:smooth_sandstone_slab[type=top]'); F(12, 7, 1, 19, 7, 1, HF)
  // couloir, salles de travail (pianos = blocs musicaux et juke-box, pupitres)
  hmEsc(14, 3, 2)
  ;[0, 6].forEach((y, n) => {
    F(13, y + 1, 3, 13, y + 5, 11, HMPL); F(17, y + 1, 3, 17, y + 5, 11, HMPL)
    ;[[3, 12, 13, 'west'], [18, 28, 17, 'east']].forEach(c => {
      F(c[0], y + 1, 7, c[1], y + 5, 7, HMPL); PORTE(c[2], y + 1, 5, HPO, c[3], 'left', 'false'); PORTE(c[2], y + 1, 9, HPO, c[3], 'left', R() < 0.3 ? 'true' : 'false')
      ;[4, 9].forEach(z => { var xm = Math.floor((c[0] + c[1]) / 2); S(xm, y + 1, z, R() < 0.5 ? 'minecraft:note_block' : 'minecraft:jukebox'); S(xm + 1, y + 1, z, MAT('oak_chair', 'west')); S(xm - 2, y + 1, z, 'minecraft:iron_bars'); S(xm - 2, y + 2, z, 'minecraft:spruce_trapdoor[facing=north,half=top,open=false,powered=false,waterlogged=false]'); S(xm, y + 5, z, HLH) })
    })
  })
  hbMansarde(2, 2, 29, 12, 12); hbCheminee(5, 6, 16, 1)
  hmSills(2, 29, 2, -1, 2)
  // auditorium x4..27 z13..28 : gradins vers la scene, orgue
  hbMur(4, 0, 13, 4, 12, 28, HS); hbMur(27, 0, 13, 27, 12, 28, HS); hbMur(4, 0, 28, 27, 12, 28, HS)
  for (var z = 15; z <= 26; z += 3) { F(4, 4, z, 4, 9, z, GP); F(27, 4, z, 27, 9, z, GP) }
  F(5, 0, 13, 26, 0, 27, 'minecraft:dark_oak_planks'); F(14, 1, 12, 17, 3, 12, AIR); F(14, 1, 13, 17, 3, 13, AIR)
  for (var i = 0; i < 4; i++) { var z = 20 - i * 2; F(5, 0, z, 26, i, z + 1, 'minecraft:dark_oak_planks'); F(6, i + 1, z, 13, i + 1, z, 'minecraft:red_nether_brick_stairs[facing=north,half=bottom,shape=straight]'); F(18, i + 1, z, 25, i + 1, z, 'minecraft:red_nether_brick_stairs[facing=north,half=bottom,shape=straight]') }
  for (var i = 0; i < 4; i++) { var z = 20 - i * 2; F(14, i + 1, z, 17, i + 1, z + 1, AIR); for (var j = 0; j <= i; j++) F(14, j, z, 17, j, z + 1, 'minecraft:dark_oak_planks') }
  F(5, 1, 23, 26, 2, 27, 'minecraft:dark_oak_planks'); F(5, 3, 23, 26, 3, 23, 'minecraft:dark_oak_slab[type=bottom]'); F(14, 3, 23, 17, 3, 23, AIR)
  ;[[10, 25], [15, 25], [20, 25]].forEach(p => { S(p[0], 3, p[1], MAT('oak_chair', 'south')); S(p[0], 3, p[1] - 1, 'minecraft:iron_bars') }); S(16, 3, 25, 'minecraft:note_block')
  // tuyaux d'orgue de cuivre contre le mur du fond
  F(7, 3, 27, 24, 5, 27, 'minecraft:dark_oak_planks'); F(7, 6, 27, 24, 6, 27, 'minecraft:dark_oak_slab[type=bottom]'); F(13, 3, 26, 18, 3, 26, MAT('dark_oak_counter', 'north'))
  for (var x = 8; x <= 23; x++) { if (x % 2) continue; var h = 1 + Math.max(0, Math.round(3 - Math.abs(x - 15.5) * 0.4)); F(x, 6, 27, x, 6 + h, 27, 'minecraft:waxed_copper_block'); S(x, 7 + h, 27, 'minecraft:waxed_cut_copper_slab[type=bottom,waterlogged=false]') }
  ;[[10, 18], [21, 18]].forEach(p => hmLustre(p[0], 11, p[1])); ;[[15, 11, 14], [15, 11, 19], [15, 11, 24], [7, 11, 24], [24, 11, 24]].forEach(p => S(p[0], p[1], p[2], HLH))
  ruToit(4, 27, 13, 28, 13, 'deepslate_tile', HS); F(5, 12, 14, 26, 12, 27, 'minecraft:dark_oak_planks')
  // jardin lateral
  hbSol(0, 13, 3, 30); hbSol(28, 13, 31, 30); hbSol(4, 29, 27, 30); hbPlatane(1, 20, 5); hbPlatane(30, 25, 5); hbVeg(0, 13, 31, 30, 0.6)
  hbMur(0, 0, 31, 31, 1, 31, HSB)
}

// ================= PALAIS DE JUSTICE (rangee sud, emmarchement, colonnade, salle des pas perdus, salle d'audience) =================
function hmTribunal() {
  hmTrottoir(0, 1)
  // emmarchement et palier (soubassement plein jusqu'a y2)
  for (var k = 0; k < 3; k++) { F(5, k, 1 + k, 26, k, 1 + k, 'minecraft:smooth_quartz_stairs[facing=south,half=bottom,shape=straight]'.replace('facing=south', 'facing=north')); if (k) F(5, 0, 1 + k, 26, k - 1, 1 + k, 'minecraft:smooth_quartz') }
  F(4, 0, 4, 27, 2, 5, 'minecraft:smooth_quartz'); F(4, 2, 4, 27, 2, 5, 'minecraft:smooth_quartz_slab[type=top]')
  // colonnade de six colonnes, entablement, attique
  ;[6, 10, 14, 17, 21, 25].forEach(x => { F(x, 3, 4, x, 13, 4, 'minecraft:quartz_pillar[axis=y]'); S(x, 14, 4, 'minecraft:chiseled_quartz_block') })
  F(4, 15, 4, 27, 15, 5, 'minecraft:smooth_quartz'); F(4, 16, 4, 27, 17, 4, 'minecraft:quartz_bricks'); F(14, 18, 4, 17, 19, 4, 'minecraft:quartz_bricks'); F(15, 20, 4, 16, 20, 4, 'minecraft:chiseled_quartz_block')
  // corps du batiment x4..27 z6..28
  for (var x = 4; x <= 27; x++) for (var y = 0; y <= 17; y++) S(x, y, 6, y <= 2 ? 'chipped:stacked_sandstone_bricks' : hbM(HS))
  hbMur(4, 0, 7, 4, 17, 28, HS); hbMur(27, 0, 7, 27, 17, 28, HS); hbMur(5, 0, 28, 26, 17, 28, HS)
  for (var z = 9; z <= 26; z += 4) { F(4, 6, z, 4, 13, z + 1, GP); F(27, 6, z, 27, 13, z + 1, GP) }
  ;[[8, 8], [12, 12], [19, 19], [23, 23]].forEach(p => F(p[0], 6, 6, p[1], 13, 6, GP)); ;[[6, 7], [24, 25]].forEach(p => F(p[0], 6, 28, p[1], 13, 28, GP)); F(14, 3, 6, 17, 8, 6, AIR); PORTE(15, 3, 6, HPO, 'north', 'left', 'true'); PORTE(16, 3, 6, HPO, 'north', 'right', 'false'); F(14, 5, 6, 17, 8, 6, GP)
  F(5, 0, 7, 26, 2, 27, 'minecraft:stone_bricks')
  // salle des pas perdus z7..13 (sol a y3)
  for (var x = 5; x <= 26; x++) for (var z = 7; z <= 13; z++) S(x, 2, z, (x + z) % 2 ? 'minecraft:smooth_quartz' : 'minecraft:polished_blackstone')
  F(5, 3, 14, 26, 16, 14, HS); F(14, 3, 14, 17, 7, 14, AIR); PORTE(14, 3, 14, HPO, 'south', 'left', 'false'); PORTE(17, 3, 14, HPO, 'south', 'right', 'false'); F(15, 3, 14, 16, 7, 14, HS); F(15, 3, 14, 16, 4, 14, AIR)
  ;[[7, 10], [24, 10]].forEach(p => gtBanc(p[0], p[1], p[0] < 15 ? 'east' : 'west', 3))
  ;[[10, 9], [21, 9]].forEach(p => { F(p[0], 3, p[1], p[0], 16, p[1], 'minecraft:quartz_pillar[axis=y]') }); hmLustre(15, 16, 10)
  // salle d'audience z15..27 : tribune des juges, barre, box des accuses, jures, public
  F(5, 2, 15, 26, 2, 27, 'minecraft:dark_oak_planks'); F(8, 3, 24, 23, 3, 27, 'minecraft:dark_oak_planks'); F(9, 4, 24, 22, 4, 24, MAT('dark_oak_counter', 'north')); ;[12, 15, 18].forEach(x => S(x, 4, 26, 'mcwfurnitures:dark_oak_chair[facing=north]'.replace('mcwfurnitures:dark_oak_chair[facing=north]', MAT('dark_oak_chair', 'north'))))
  F(10, 4, 27, 21, 9, 27, 'minecraft:red_wool'); F(15, 6, 27, 16, 7, 27, 'minecraft:gold_block')
  F(6, 3, 18, 8, 3, 22, 'minecraft:dark_oak_slab[type=bottom]'); F(6, 4, 18, 6, 4, 22, HMIB); F(6, 4, 18, 8, 4, 18, HMIBX); F(6, 4, 22, 8, 4, 22, HMIBX); S(8, 3, 20, MAT('dark_oak_chair', 'east'))
  for (var z = 18; z <= 22; z += 2) { S(24, 3, z, MAT('dark_oak_chair', 'west')); S(25, 3, z, MAT('dark_oak_chair', 'west')) } F(23, 3, 17, 23, 3, 23, MAT('dark_oak_counter', 'west'))
  F(14, 3, 21, 17, 3, 21, MAT('dark_oak_counter', 'north'))
  for (var z = 16; z <= 19; z++) { if (z == 18) continue; F(9, 3, z, 13, 3, z, hbE('minecraft:dark_oak', 'north')); F(18, 3, z, 22, 3, z, hbE('minecraft:dark_oak', 'north')) }
  ;[[10, 21], [21, 21]].forEach(p => { S(p[0], 17, p[1], 'minecraft:chain[axis=y]'); hmLustre(p[0], 16, p[1]) })
  // toit plat, coupole vitree sur la salle d'audience
  F(4, 18, 6, 27, 18, 28, 'minecraft:smooth_stone_slab[type=bottom]'); F(5, 17, 7, 26, 17, 27, 'minecraft:spruce_planks')
  F(12, 17, 18, 19, 17, 24, AIR); for (var x = 12; x <= 19; x++) for (var z = 18; z <= 24; z++) S(x, 18, z, (x == 12 || x == 19 || z == 18 || z == 24) ? 'minecraft:oxidized_cut_copper' : 'minecraft:glass')
  F(13, 19, 19, 18, 19, 23, 'minecraft:oxidized_cut_copper_slab[type=bottom]'); F(14, 19, 20, 17, 19, 22, 'minecraft:glass'); S(15, 20, 21, 'minecraft:oxidized_cut_copper_slab[type=bottom]')
  // abords
  hbSol(0, 6, 3, 30); hbSol(28, 6, 31, 30); hbSol(4, 29, 27, 30); hbPlatane(1, 12, 6); hbPlatane(30, 22, 6); hbVeg(0, 6, 31, 30, 0.6); hbMur(0, 0, 31, 31, 1, 31, HSB)
}

var QFIN_MH3 = function () {
  HB2 = true; FIN = true; THM = THM_HF
  var vh = 'mcwwindows:iron_shutter', rh = ['white', 'light_gray', 'red']
  OX = VB.X0; OY = VB.Y0; OZ = VB.Z0; CUT = 999; GRAINE = 4401; HM = {}; hbRue(); finAncrage()
  lot(QF(hmAngle, vh, rh), 0, 0, 999, 4411, 32, 42); lot(QF(hmHotelParticulier, vh, rh), 32, 0, 999, 4421, 32, 18); lot(QF(hmCinema, null, null), 64, 0, 999, 4431, 32, 22); lot(QF(hmPiscine, null, null), 96, 0, 999, 4441, 32, 18)
  lot(QF(hmLycee, vh, ['white']), 0, 48, 999, 4451, 32, 24); lot(QF(hmAteliers, null, ['white', 'brown']), 32, 48, 999, 4461, 32, 28); lot(QF(hmConservatoire, vh, rh), 64, 48, 999, 4471, 32, 24); lot(QF(hmTribunal, null, null), 96, 48, 999, 4481, 32, 22)
  vlog('FIN volets ' + FIN_NV + ' rideaux ' + FIN_NR + ' paves ' + PAVE_NB + ' retraits ancrage ' + ANC_NB)
  HB2 = false; FIN = false; THM = null; HM = {}
}
function vuesMamoudzouH3() {
  vue('mh3_ensemble_sud', 0, 0, 64, 46, 120, 64, 8, 36, 3000)
  vue('mh3_angle', 0, 0, -10, 12, 48, 10, 16, 22)
  vue('mh3_angle_cafe', 0, 0, 5.5, 2.6, 26.5, 5, 1.6, 21)
  vue('mh3_hotel_particulier', 32, 0, 16, 9, 44, 16, 4, 14)
  vue('mh3_hotel_cour', 32, 0, 22, 4, 26, 12, 4, 16)
  vue('mh3_cinema', 64, 0, 16, 9, 44, 16, 9, 24)
  vue('mh3_cinema_salle', 64, 0, 15.5, 9.5, 16.5, 15.5, 5, 7)
  vue('mh3_piscine', 96, 0, 16, 8, 44, 16, 8, 24)
  vue('mh3_piscine_bassin', 96, 0, 15.5, 8, 22, 15.5, 1, 8)
  vue('mh3_lycee', 0, 48, 16, 10, -12, 16, 8, 8)
  vue('mh3_lycee_cour', 0, 48, 15.5, 14, 26, 15.5, 2, 12)
  vue('mh3_ateliers', 32, 48, 16, 12, -12, 16, 12, 8)
  vue('mh3_ateliers_verriere', 32, 48, 21, 21, 4, 6, 19.5, 12)
  vue('mh3_conservatoire', 64, 48, 16, 9, -12, 16, 7, 8)
  vue('mh3_conservatoire_salle', 64, 48, 15.5, 6, 15, 15.5, 5, 27)
  vue('mh3_tribunal', 96, 48, 16, 9, -14, 16, 9, 8)
  vue('mh3_tribunal_audience', 96, 48, 15.5, 7, 16, 15.5, 4, 26)
}
