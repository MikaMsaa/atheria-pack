
// ================= QUARTIER DU DESERT, RANGEE SUD (facades au nord, sur le boulevard) =================
function dsBanc(x, z, f, n) { // assise en marches d'acacia, dossier du cote f
  var ns = f == 'north' || f == 'south'
  for (var i = 0; i < n; i++) S(ns ? x + i : x, 0, ns ? z : z + i, 'minecraft:acacia_stairs[facing=' + f + ',half=bottom,shape=straight]')
  if (ns) { S(x - 1, 0, z, 'minecraft:acacia_trapdoor[facing=west,half=bottom,open=true]'); S(x + n, 0, z, 'minecraft:acacia_trapdoor[facing=east,half=bottom,open=true]') }
  else { S(x, 0, z - 1, 'minecraft:acacia_trapdoor[facing=north,half=bottom,open=true]'); S(x, 0, z + n, 'minecraft:acacia_trapdoor[facing=south,half=bottom,open=true]') }
}
function dsParasol(x, z, col) { F(x, 0, z, x, 2, z, DSF); F(x - 1, 3, z - 1, x + 1, 3, z + 1, 'minecraft:' + col + '_wool'); ;[[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(c => S(x + c[0], 3, z + c[1], AIR)); S(x, 4, z, 'minecraft:' + col + '_carpet') }
function dsBitume(x1, z1, x2, z2) { for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) { var r = R(); dsDalle(x, z, x, z, r < 0.84 ? 'minecraft:gray_concrete' : r < 0.9 ? 'minecraft:light_gray_concrete' : r < 0.95 ? 'minecraft:black_concrete' : 'minecraft:sand') } }
// Volume bas a toit plat (murs y1..h, plafond y h+1, couvertine en y h+2)
function dsBas(x1, z1, x2, z2, h, mur, bande, sol) {
  F(x1, 0, z1, x2, 0, z2, sol || 'minecraft:smooth_stone')
  for (var y = 1; y <= h + 1; y++) {
    var b = y == h + 1 ? bande : y == h && bande ? bande : mur
    for (var x = x1; x <= x2; x++) { S(x, y, z1, b); S(x, y, z2, b) }
    for (var z = z1 + 1; z < z2; z++) { S(x1, y, z, b); S(x2, y, z, b) }
  }
  F(x1 + 1, h + 1, z1 + 1, x2 - 1, h + 1, z2 - 1, 'minecraft:smooth_stone')
  for (var x = x1; x <= x2; x++) { S(x, h + 2, z1, 'minecraft:smooth_stone_slab[type=bottom]'); S(x, h + 2, z2, 'minecraft:smooth_stone_slab[type=bottom]') }
  for (var z = z1 + 1; z < z2; z++) { S(x1, h + 2, z, 'minecraft:smooth_stone_slab[type=bottom]'); S(x2, h + 2, z, 'minecraft:smooth_stone_slab[type=bottom]') }
}

// ================= MOTEL DE BORD DE ROUTE (deux ailes de chambres, coursive, piscine videe, accueil, caravane) =================
function dsMotel() {
  DST = {}
  var B = DSAB, T = 'minecraft:light_blue_terracotta', cols = ['white', 'light_blue', 'yellow', 'red', 'orange', 'cyan', 'pink', 'lime']
  dsSol(0, 0, 31, 31)
  dsBitume(9, 0, 31, 18)
  // aile ouest x2..8 z6..27 : 4 chambres, portes a l'est
  dsBas(2, 6, 8, 27, 4, B, T); ;[11, 16, 21].forEach(z => F(3, 1, z, 7, 4, z, B))
  ;[7, 12, 17, 22].forEach((za, i) => {
    var col = cols[i]
    for (var x = 3; x <= 7; x++) for (var z = za; z <= za + 3; z++) S(x, 0, z, (x + z) % 2 ? T : 'minecraft:white_terracotta')
    LIT(4, 1, za + 1, col, 'west'); LIT(4, 1, za + 2, col, 'west')
    S(3, 1, za, 'mcwfurnitures:acacia_end_table'); S(3, 2, za, 'minecraft:candle[candles=1,lit=false]'); S(3, 1, za + 3, 'mcwfurnitures:acacia_end_table'); S(3, 2, za + 3, 'minecraft:potted_dead_bush')
    S(7, 1, za + 1, MAT('acacia_drawer', 'west')); S(7, 2, za + 1, 'minecraft:black_stained_glass_pane')
    S(7, 1, za + 3, 'mcwfurnitures:acacia_kitchen_sink[facing=west,water=false]'); S(6, 1, za + 3, 'minecraft:water_cauldron[level=' + (i % 2 ? 1 : 0 + 1) + ']')
    if (i == 3) { S(5, 1, 26, 'minecraft:chest[facing=north]'); S(7, 1, 26, 'supplementaries:sack') }
    PORTE(8, 1, za, DSP, 'east', 'left', i == 1 ? 'true' : 'false'); dsFen(za + 1, za + 2, 2, 2, 'west', 2, i == 2 ? 2 : 3)
    S(5, 4, za + 1, DSLH); dsPapiers(3, za, 7, za + 3, 1, 2)
  })
  // aile du fond x9..29 z21..27 : 4 chambres, portes au nord
  dsBas(9, 21, 29, 27, 4, B, T); ;[14, 19, 24].forEach(x => F(x, 1, 22, x, 4, 26, B))
  ;[10, 15, 20, 25].forEach((xa, i) => {
    var col = cols[4 + i]
    for (var x = xa; x <= xa + 3; x++) for (var z = 22; z <= 26; z++) S(x, 0, z, (x + z) % 2 ? T : 'minecraft:white_terracotta')
    LIT(xa + 1, 1, 25, col, 'south'); LIT(xa + 2, 1, 25, col, 'south')
    S(xa, 1, 26, 'mcwfurnitures:acacia_end_table'); S(xa, 2, 26, 'minecraft:candle[candles=2,lit=false]'); S(xa + 3, 1, 26, 'mcwfurnitures:acacia_end_table')
    S(xa + 1, 1, 22, MAT('acacia_drawer', 'south')); S(xa + 1, 2, 22, 'minecraft:black_stained_glass_pane')
    S(xa + 3, 1, 22, 'mcwfurnitures:acacia_kitchen_sink[facing=south,water=false]'); S(xa + 3, 1, 23, 'minecraft:water_cauldron[level=1]')
    PORTE(xa, 1, 21, DSP, 'north', 'left', 'false'); dsFen(xa + 1, xa + 2, 2, 27, 'south', 2, i == 1 ? 1 : 3)
    S(xa + 1, 4, 24, DSLH); dsPapiers(xa, 22, xa + 3, 26, 1, 2)
  })
  // coursives couvertes
  F(9, 0, 6, 10, 0, 20, 'minecraft:smooth_stone'); F(9, 0, 19, 29, 0, 20, 'minecraft:smooth_stone')
  ;[6, 10, 14, 18].forEach(z => F(10, 1, z, 10, 4, z, 'minecraft:polished_blackstone_wall')); ;[12, 17, 22, 27].forEach(x => F(x, 1, 19, x, 4, 19, 'minecraft:polished_blackstone_wall'))
  F(9, 5, 6, 10, 5, 20, 'minecraft:smooth_stone'); F(11, 5, 19, 29, 5, 20, 'minecraft:smooth_stone'); for (var z = 6; z <= 18; z++) S(10, 6, z, 'minecraft:smooth_stone_slab[type=bottom]'); for (var x = 11; x <= 29; x++) S(x, 6, 19, 'minecraft:smooth_stone_slab[type=bottom]')
  ;[8, 16].forEach(z => S(9, 4, z, DSLH)); ;[13, 23].forEach(x => S(x, 4, 20, DSLH))
  S(9, 1, 20, 'minecraft:red_concrete'); S(9, 2, 20, 'minecraft:red_stained_glass'); S(11, 1, 20, 'minecraft:white_concrete'); S(11, 2, 20, 'minecraft:packed_ice'); S(10, 1, 13, MAT('acacia_chair', 'east'))
  // places de parking
  for (var z = 6; z <= 18; z += 3) F(11, -1, z, 14, -1, z, 'minecraft:white_concrete'); for (var x = 16; x <= 28; x += 3) F(x, -1, 15, x, -1, 18, 'minecraft:white_concrete')
  bgVoiture(11, 7, 'x', 'white', 1); bgVoiture(20, 15, 'z', 'red', 0); bgVoiture(26, 15, 'z', 'light_blue', 2)
  // piscine videe (bassin x18..25 z7..12), plage et cloture
  dsDalle(15, 4, 28, 14, DSJ)
  for (var x = 17; x <= 26; x++) for (var z = 6; z <= 13; z++) {
    var bord = x == 17 || x == 26 || z == 6 || z == 13, fond = x <= 20 ? -3 : -4
    if (bord) { S(x, -1, z, 'minecraft:smooth_stone'); F(x, -4, z, x, -2, z, 'minecraft:white_concrete') }
    else { F(x, fond + 1, z, x, -1, z, AIR); S(x, fond, z, 'minecraft:light_blue_concrete') }
  }
  F(24, -3, 7, 24, -1, 7, 'minecraft:ladder[facing=south]'); S(26, 0, 10, 'minecraft:smooth_stone'); S(25, 0, 10, 'minecraft:smooth_stone_slab[type=bottom]'); S(24, 0, 10, 'minecraft:smooth_stone_slab[type=bottom]')
  S(22, -3, 10, 'minecraft:sand'); S(23, -3, 10, 'minecraft:sand'); S(23, -3, 11, 'minecraft:sand'); S(22, -3, 8, 'minecraft:azalea_leaves[persistent=true]'); S(25, -3, 12, 'minecraft:moss_carpet'); S(24, -3, 12, 'minecraft:green_carpet'); S(19, -2, 9, 'minecraft:smooth_quartz_slab[type=bottom]'); S(21, -3, 11, 'minecraft:light_gray_carpet')
  for (var x = 15; x <= 28; x++) { S(x, 0, 4, 'minecraft:iron_bars'); S(x, 0, 14, 'minecraft:iron_bars') } for (var z = 5; z <= 13; z++) { S(15, 0, z, 'minecraft:iron_bars'); S(28, 0, z, 'minecraft:iron_bars') }
  S(15, 0, 9, AIR); S(15, 0, 10, AIR); S(21, 0, 4, AIR)
  ;[18, 20, 22].forEach(x => { S(x, 0, 5, 'minecraft:quartz_stairs[facing=north,half=bottom,shape=straight]') }); S(23, 0, 5, 'minecraft:smooth_quartz_slab[type=bottom]'); S(27, 0, 8, 'minecraft:white_carpet'); S(27, 0, 11, 'minecraft:white_carpet'); S(16, 0, 12, 'minecraft:decorated_pot'); S(27, 0, 13, 'supplementaries:sack')
  // accueil x1..8 z0..5 : baie vitree sur rue, comptoir, porte-cles, salon
  dsBas(1, 0, 8, 5, 4, B, T, 'minecraft:white_terracotta'); F(2, 1, 0, 7, 3, 0, GP); PORTE(8, 1, 3, DSV, 'east', 'left', 'false')
  F(5, 1, 1, 5, 1, 3, MAT('acacia_counter', 'east')); S(5, 2, 2, 'minecraft:black_stained_glass_pane'); S(5, 2, 1, 'supplementaries:jar'); ;[1, 2, 3].forEach(z => S(2, 3, z, 'minecraft:tripwire_hook[facing=east,attached=false,powered=false]'))
  S(3, 1, 2, MAT('acacia_chair', 'east')); S(2, 1, 4, 'minecraft:chiseled_bookshelf[facing=east]'); S(3, 1, 4, 'minecraft:chest[facing=north]'); F(6, 1, 4, 7, 1, 4, 'mcwfurnitures:red_couch[facing=north,shape=single]'); S(7, 1, 1, 'minecraft:potted_cactus'); S(6, 1, 2, 'mcwfurnitures:acacia_coffee_table')
  S(4, 4, 2, DSLH); dsPapiers(2, 1, 7, 4, 1, 4)
  // caravane abandonnee
  for (var u = 0; u < 8; u++) for (var v = 0; v < 3; v++) {
    var x = 22 + u, z = 0 + v; S(x, 0, z, 'minecraft:white_concrete')
    var bord = u == 0 || u == 7 || v == 0 || v == 2
    if (bord) { S(x, 1, z, (u == 2 || u == 5) && v != 1 ? 'minecraft:glass' : 'minecraft:light_blue_concrete'); S(x, 2, z, 'minecraft:white_concrete') }
    S(x, 3, z, 'minecraft:smooth_quartz_slab[type=bottom]')
  }
  PORTE(25, 1, 2, 'minecraft:iron_door', 'south', 'left', 'true'); LIT(27, 1, 1, 'white', 'east'); S(23, 1, 1, 'mcwfurnitures:acacia_table'); S(24, 1, 1, 'minecraft:smoker[facing=west,lit=false]')
  ;[24, 27].forEach(x => { S(x, 0, 3, 'minecraft:polished_blackstone_button[face=wall,facing=south]') }); S(21, 0, 1, 'minecraft:chain[axis=x]'); F(23, 2, 3, 27, 2, 3, 'minecraft:smooth_quartz_slab[type=top]')
  // arriere : benne, climatiseurs, linge
  F(12, 0, 29, 13, 1, 30, 'minecraft:green_terracotta'); F(12, 2, 29, 13, 2, 30, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false]'); dsLibre(12, 29); dsLibre(13, 30)
  ;[17, 22, 27].forEach(x => { S(x, 0, 28, 'minecraft:smooth_stone'); S(x, 1, 28, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false]'); dsLibre(x, 28) })
  F(4, 0, 29, 4, 2, 29, DSF); F(9, 0, 29, 9, 2, 29, DSF); F(5, 2, 29, 8, 2, 29, 'minecraft:chain[axis=x]'); dsLibre(4, 29); dsLibre(9, 29)
  S(30, 0, 25, 'minecraft:barrel[facing=up,open=false]')
  dsPalmier(10, 2, 8); dsPalmier(20, 2, 7, true); dsPalmier(30, 21, 8); dsPalmier(0, 30, 7)
  dsCactus(31, 29, 2); dsCactus(16, 30, 3)
  dsVeg(0, 0, 31, 31, 0.3)
}

// ================= STATION-SERVICE (auvent et pompes, superette, garage a deux baies, diner) =================
function dsStation() {
  DST = {}
  var WC = 'minecraft:white_concrete', RC = 'minecraft:red_concrete', LG = 'minecraft:light_gray_concrete'
  dsSol(0, 0, 31, 31)
  dsBitume(0, 0, 31, 13); dsBitume(18, 13, 18, 31)
  // auvent x3..16 z3..10
  ;[[4, 4], [15, 4], [4, 9], [15, 9]].forEach(p => F(p[0], 0, p[1], p[0], 4, p[1], WC))
  F(3, 5, 3, 16, 5, 10, WC); for (var x = 3; x <= 16; x++) { S(x, 5, 3, RC); S(x, 5, 10, RC); S(x, 6, 3, RC); S(x, 6, 10, RC) } for (var z = 4; z <= 9; z++) { S(3, 5, z, RC); S(16, 5, z, RC); S(3, 6, z, RC); S(16, 6, z, RC) }
  F(4, 6, 4, 15, 6, 9, 'minecraft:smooth_stone_slab[type=bottom]')
  ;[[6, 5], [9, 5], [12, 5], [6, 8], [9, 8], [12, 8]].forEach(p => S(p[0], 5, p[1], 'minecraft:white_stained_glass')); S(13, 5, 7, AIR); S(13, 6, 7, AIR); S(14, 5, 7, AIR)
  // ilot et pompes
  F(6, 0, 6, 13, 0, 7, 'minecraft:smooth_stone'); S(6, 1, 6, 'minecraft:yellow_concrete'); S(13, 1, 7, 'minecraft:yellow_concrete')
  ;[8, 11].forEach(px => { S(px, 1, 6, RC); S(px, 2, 6, WC); S(px, 3, 6, RC); S(px, 1, 7, RC); S(px, 2, 7, 'minecraft:black_concrete'); S(px + 1, 2, 6, 'minecraft:tripwire_hook[facing=east,attached=false,powered=false]') })
  S(11, 3, 6, AIR); S(12, 1, 7, 'minecraft:chain[axis=x]')
  bgVoiture(8, 8, 'x', 'light_blue', 1); bgVoiture(1, 11, 'x', 'white', 2)
  F(1, 0, 1, 1, 2, 1, 'minecraft:polished_blackstone_wall'); S(1, 3, 1, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false]'); S(2, 1, 1, 'minecraft:chain[axis=x]')
  // superette x19..30 z2..12
  dsBas(19, 2, 30, 12, 4, WC, RC)
  for (var x = 20; x <= 29; x++) for (var z = 3; z <= 11; z++) S(x, 0, z, (x + z) % 2 ? WC : LG)
  F(20, 1, 2, 29, 3, 2, GP); PORTE(24, 1, 2, DSV, 'north', 'left', 'true'); PORTE(25, 1, 2, DSV, 'north', 'right', 'false'); F(24, 3, 2, 25, 3, 2, GP)
  F(19, 1, 4, 19, 3, 7, GP)
  F(22, 1, 5, 22, 2, 9, 'minecraft:chiseled_bookshelf[facing=west]'); F(23, 1, 5, 23, 2, 9, 'minecraft:chiseled_bookshelf[facing=east]'); F(26, 1, 5, 26, 2, 9, 'minecraft:chiseled_bookshelf[facing=west]'); F(27, 1, 6, 27, 2, 9, 'minecraft:chiseled_bookshelf[facing=east]')
  S(27, 1, 5, 'minecraft:chiseled_bookshelf[facing=east]'); S(27, 2, 5, AIR); S(28, 1, 6, 'minecraft:chiseled_bookshelf[facing=north]')
  F(20, 1, 11, 29, 2, 11, 'minecraft:light_blue_stained_glass'); F(20, 3, 11, 29, 3, 11, WC); PORTE(24, 1, 11, DSP, 'south', 'left', 'true')
  F(28, 1, 3, 29, 1, 3, MAT('acacia_counter', 'south')); S(28, 2, 3, 'minecraft:black_stained_glass_pane'); S(29, 1, 4, MAT('acacia_counter', 'west')); S(29, 2, 4, 'supplementaries:jar')
  S(20, 1, 3, 'minecraft:brewing_stand'); S(21, 1, 3, 'minecraft:blue_stained_glass'); S(20, 1, 9, 'minecraft:iron_block'); S(20, 2, 9, 'minecraft:stone_button[face=wall,facing=east]'.replace('face=wall,facing=east', 'face=floor,facing=east'))
  ;[[24, 7], [21, 7], [25, 4], [28, 9]].forEach(p => S(p[0], 1, p[1], choix(['supplementaries:sack', 'minecraft:light_gray_carpet', 'minecraft:white_carpet'])))
  ;[[22, 4], [26, 4], [22, 10], [26, 10]].forEach(p => S(p[0], 5, p[1], 'minecraft:white_stained_glass'))
  F(22, 6, 5, 23, 6, 6, 'minecraft:smooth_stone'); F(22, 7, 5, 23, 7, 6, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false]'); S(27, 6, 9, 'minecraft:lightning_rod'); dsPapiers(20, 3, 29, 10, 1, 6)
  // garage x3..17 z14..27 : baie ouverte (pont elevateur), baie fermee (fosse), etabli
  dsBas(3, 14, 17, 27, 6, DSJ, 'minecraft:cut_sandstone')
  for (var x = 4; x <= 16; x++) for (var z = 15; z <= 26; z++) if (R() < 0.08) S(x, 0, z, 'minecraft:black_concrete')
  F(5, 1, 14, 8, 4, 14, AIR); F(11, 1, 14, 14, 4, 14, 'minecraft:iron_trapdoor[facing=south,half=bottom,open=true]'); S(12, 3, 14, AIR); S(12, 4, 14, AIR)
  ;[[5, 17], [8, 17], [5, 20], [8, 20]].forEach(p => F(p[0], 1, p[1], p[0], 2, p[1], 'minecraft:yellow_concrete')); F(6, 2, 17, 7, 2, 20, 'minecraft:iron_trapdoor[facing=north,half=top,open=false]')
  OY += 2; bgVoiture(6, 17, 'z', 'orange', 1, true); OY -= 2
  F(12, -2, 17, 13, -1, 22, AIR); F(11, -2, 17, 11, -1, 22, 'minecraft:smooth_stone'); F(14, -2, 17, 14, -1, 22, 'minecraft:smooth_stone'); F(12, -3, 17, 13, -3, 22, 'minecraft:smooth_stone'); F(12, -2, 16, 13, -1, 16, 'minecraft:smooth_stone'); F(12, -2, 23, 13, -1, 23, 'minecraft:smooth_stone')
  F(12, -2, 22, 12, -1, 22, 'minecraft:ladder[facing=north]')
  F(13, 3, 24, 13, 6, 24, 'minecraft:chain[axis=y]'); S(13, 2, 24, 'minecraft:iron_block'); S(13, 1, 24, 'minecraft:piston[facing=up,extended=false]')
  S(4, 1, 26, 'minecraft:smithing_table'); S(5, 1, 26, 'minecraft:grindstone[face=floor,facing=north]'); S(6, 1, 26, 'minecraft:anvil[facing=east]'); S(7, 1, 26, 'minecraft:crafting_table'); S(8, 1, 26, 'minecraft:chest[facing=north]'); S(9, 1, 26, 'minecraft:stonecutter[facing=north]')
  F(4, 3, 26, 9, 4, 26, 'minecraft:iron_bars'); S(10, 1, 26, 'minecraft:barrel[facing=up,open=false]'); S(16, 1, 15, 'minecraft:black_concrete'); S(16, 2, 15, 'minecraft:black_concrete'); S(16, 3, 15, 'minecraft:black_concrete'); S(16, 1, 16, 'minecraft:black_concrete'); S(16, 2, 16, 'minecraft:black_concrete')
  S(16, 1, 18, RC); S(16, 2, 18, RC); S(16, 1, 19, 'minecraft:blue_concrete'); S(15, 1, 19, RC); S(16, 1, 21, 'minecraft:cauldron')
  S(15, 1, 25, 'mcwfurnitures:acacia_table'); S(15, 1, 24, MAT('acacia_chair', 'south')); S(15, 2, 25, 'supplementaries:book_pile'); S(16, 1, 26, 'minecraft:chest[facing=west]')
  ;[[6, 22], [12, 19]].forEach(p => S(p[0], 6, p[1], DSLH)); dsFen(17, 18, 3, 17, 'east', 2, 3); dsFen(20, 21, 3, 17, 'east', 2, 2); dsFen(6, 8, 3, 27, 'south', 2, 1)
  PORTE(16, 1, 27, 'minecraft:iron_door', 'south', 'left', 'false')
  // diner x19..30 z15..28
  dsBas(19, 15, 30, 28, 4, LG, RC)
  for (var x = 20; x <= 29; x++) for (var z = 16; z <= 27; z++) S(x, 0, z, (x + z) % 2 ? WC : 'minecraft:black_concrete')
  for (var z = 16; z <= 27; z++) { S(19, 2, z, GP); S(19, 3, z, GP) } for (var x = 20; x <= 29; x++) { S(x, 2, 15, GP); S(x, 3, 15, GP) }
  ;[17, 21, 25].forEach(z => { S(19, 2, z, LG); S(19, 3, z, LG) }); 
  PORTE(23, 1, 15, DSV, 'north', 'left', 'false'); S(23, 3, 15, GP)
  ;[16, 20, 24].forEach(zb => [20, 21].forEach(x => { S(x, 1, zb, 'mcwfurnitures:red_couch[facing=south,shape=single]'); S(x, 1, zb + 1, 'mcwfurnitures:acacia_table'); S(x, 1, zb + 2, 'mcwfurnitures:red_couch[facing=north,shape=single]') }))
  S(20, 2, 17, 'minecraft:candle[candles=1,lit=false]'); S(21, 2, 21, 'supplementaries:jar'); S(20, 2, 25, 'minecraft:white_carpet')
  F(26, 1, 17, 26, 1, 25, MAT('acacia_counter', 'west')); ;[17, 19, 21, 23, 25].forEach(z => S(25, 1, z, 'mcwfurnitures:acacia_stool_chair'))
  S(26, 2, 18, 'minecraft:cake[bites=2]'); S(26, 2, 20, 'minecraft:brewing_stand'); S(26, 2, 23, 'minecraft:cake'); S(26, 2, 25, 'minecraft:white_carpet')
  F(29, 1, 17, 29, 1, 19, 'farmersdelight:stove[facing=west,lit=false]'); S(29, 2, 17, 'farmersdelight:cooking_pot'); S(29, 1, 20, 'minecraft:smoker[facing=west,lit=false]'); S(29, 1, 21, 'mcwfurnitures:acacia_kitchen_sink[facing=west,water=false]'); F(29, 1, 22, 29, 2, 23, WC); S(29, 1, 24, MAT('acacia_counter', 'west')); S(29, 2, 24, 'farmersdelight:cutting_board[facing=west]')
  F(27, 1, 26, 29, 4, 26, LG); PORTE(28, 1, 26, DSP, 'north', 'left', 'false'); S(28, 1, 27, 'minecraft:water_cauldron[level=1]'); S(23, 1, 27, 'minecraft:jukebox'); S(22, 1, 27, 'minecraft:potted_cactus')
  ;[[21, 19], [21, 23], [24, 21], [28, 20]].forEach(p => S(p[0], 4, p[1], DSLH)); dsPapiers(22, 16, 25, 27, 1, 5)
  // abords : pneus, bidons, bornes, palmiers
  S(18, 0, 14, 'minecraft:black_concrete'); S(18, 1, 14, 'minecraft:black_concrete'); S(1, 0, 13, 'minecraft:barrel[facing=up,open=false]'); S(2, 0, 13, RC)
  F(1, 0, 15, 1, 0, 26, 'minecraft:yellow_concrete'); dsLibre(1, 20)
  dsPalmier(1, 29, 8); dsPalmier(31, 30, 7, true); dsCactus(10, 30, 2); dsCactus(0, 6, 3)
  dsVeg(0, 0, 31, 31, 0.3)
}

// ================= BUREAU DU SHERIF ET TRIBUNAL (porche a trottoir de planches, cellules, salle d'audience, cour fermee) =================
function dsSherif() {
  DST = {}
  var B = DSAB, DO = 'minecraft:dark_oak_planks', C = 'minecraft:cut_sandstone', CH = 'minecraft:chiseled_sandstone', SS = 'minecraft:smooth_sandstone_stairs'
  dsSol(0, 0, 31, 31)
  // ---- bureau du sherif x2..14 z4..20 ----
  dsBloc(2, 4, 14, 20, 0, B, { toit: true, sans: ['north'] })
  F(2, 8, 4, 14, 8, 4, B); F(4, 9, 4, 12, 9, 4, B); F(6, 10, 4, 10, 10, 4, B); S(8, 11, 4, B)
  ;[[2, 9], [14, 9], [4, 10], [12, 10], [6, 11], [10, 11], [8, 12]].forEach(p => S(p[0], p[1], 4, 'minecraft:mud_brick_slab[type=bottom]'))
  S(8, 9, 3, 'minecraft:gold_block'); S(7, 9, 3, 'minecraft:yellow_terracotta'); S(9, 9, 3, 'minecraft:yellow_terracotta'); S(8, 10, 3, 'minecraft:yellow_terracotta'); S(8, 8, 3, 'minecraft:yellow_terracotta')
  F(1, 0, 1, 15, 0, 3, DSA); ;[1, 5, 11, 15].forEach(x => F(x, 1, 1, x, 4, 1, DSL)); F(1, 5, 0, 15, 5, 3, 'minecraft:acacia_slab[type=bottom]')
  F(2, 1, 1, 4, 1, 1, DSF); F(12, 1, 1, 14, 1, 1, DSF); F(6, 0, 0, 10, 0, 0, 'minecraft:acacia_stairs[facing=south,half=bottom,shape=straight]'); S(4, 4, 2, DSLH); S(12, 4, 2, DSLH)
  S(3, 1, 3, 'minecraft:acacia_stairs[facing=north,half=bottom,shape=straight]'); S(13, 1, 3, 'minecraft:barrel[facing=up,open=false]'); S(13, 1, 2, 'minecraft:water_cauldron[level=1]')
  PORTE(8, 1, 4, DSP, 'north', 'left', 'false'); dsFen(4, 5, 2, 4, 'north', 2, 1); dsFen(11, 12, 2, 4, 'north', 2, 1)
  // bureau
  S(4, 1, 7, 'mcwfurnitures:acacia_table'); S(4, 1, 8, MAT('acacia_chair', 'north')); S(4, 2, 7, 'supplementaries:book_pile'); S(11, 1, 8, 'mcwfurnitures:acacia_table'); S(12, 1, 8, MAT('acacia_chair', 'west')); S(11, 2, 8, 'minecraft:candle[candles=1,lit=false]')
  S(3, 2, 10, 'supplementaries:notice_board[facing=east]'); S(3, 2, 11, 'supplementaries:notice_board[facing=east]'); F(13, 1, 5, 13, 3, 6, 'minecraft:iron_bars'); S(13, 1, 10, 'minecraft:iron_block'); S(13, 1, 11, 'minecraft:chest[facing=west]')
  S(7, 1, 10, 'minecraft:blast_furnace[facing=north,lit=false]'); F(7, 2, 10, 7, 7, 10, 'minecraft:iron_bars'); S(9, 1, 6, MAT('acacia_chair', 'north')); S(6, 1, 6, 'minecraft:barrel[facing=up,open=true]')
  S(8, 5, 8, DSLH); dsPapiers(3, 5, 13, 11, 1, 8)
  // cellules
  F(3, 1, 12, 13, 5, 12, B); PORTE(8, 1, 12, 'minecraft:iron_door', 'south', 'left', 'false')
  F(3, 1, 15, 13, 4, 15, 'minecraft:iron_bars'); F(7, 1, 16, 7, 4, 19, 'minecraft:iron_bars'); F(11, 1, 16, 11, 4, 19, 'minecraft:iron_bars')
  PORTE(5, 1, 15, 'minecraft:iron_door', 'north', 'left', 'true'); PORTE(9, 1, 15, 'minecraft:iron_door', 'north', 'left', 'false'); PORTE(12, 1, 15, 'minecraft:iron_door', 'north', 'right', 'false')
  LIT(3, 1, 18, 'gray', 'north'); LIT(8, 1, 18, 'gray', 'north'); LIT(13, 1, 18, 'gray', 'north'); S(6, 1, 19, 'minecraft:cauldron'); S(10, 1, 19, 'minecraft:cauldron'); S(12, 1, 19, 'supplementaries:sack')
  dsFen(4, 4, 3, 20, 'south', 1, 1); dsFen(12, 12, 3, 20, 'south', 1, 1); F(9, 1, 20, 9, 2, 20, AIR); S(9, 0, 21, 'minecraft:mud_brick_slab[type=bottom]'); S(10, 0, 22, 'minecraft:packed_mud')
  S(5, 1, 13, 'minecraft:barrel[facing=up,open=false]'); S(10, 1, 14, MAT('acacia_chair', 'south')); S(8, 4, 13, DSLH); S(5, 4, 17, DSLH)
  // ---- tribunal x17..30 z3..26 : portique a 5 colonnes, fronton, salle d'audience ----
  F(17, 0, 3, 30, 0, 26, DSJ); F(17, 1, 4, 30, 1, 26, DSJ); F(18, 0, 2, 29, 0, 2, SS + '[facing=south,half=bottom,shape=straight]'); F(18, 1, 3, 29, 1, 3, SS + '[facing=south,half=bottom,shape=straight]')
  for (var y = 2; y <= 11; y++) { for (var x = 17; x <= 30; x++) { S(x, y, 8, dsM(DSJ)); S(x, y, 26, dsM(DSJ)) } for (var z = 9; z <= 25; z++) { S(17, y, z, dsM(DSJ)); S(30, y, z, dsM(DSJ)) } }
  ;[[17, 8], [30, 8], [17, 26], [30, 26]].forEach(p => F(p[0], 2, p[1], p[0], 12, p[1], C))
  F(18, 12, 9, 29, 12, 25, 'minecraft:smooth_stone'); for (var x = 17; x <= 30; x++) { S(x, 12, 8, C); S(x, 12, 26, C); S(x, 13, 26, 'minecraft:smooth_sandstone_slab[type=bottom]') } for (var z = 9; z <= 25; z++) { S(17, 12, z, C); S(30, 12, z, C); S(17, 13, z, 'minecraft:smooth_sandstone_slab[type=bottom]'); S(30, 13, z, 'minecraft:smooth_sandstone_slab[type=bottom]') }
  ;[18, 21, 24, 27, 30].forEach((x, i) => { var xx = i == 4 ? 29 : x; S(xx, 2, 5, CH); F(xx, 3, 5, xx, 8, 5, 'minecraft:quartz_pillar[axis=y]'); S(xx, 9, 5, CH) })
  F(17, 10, 4, 30, 10, 7, DSJ); F(17, 11, 4, 30, 11, 4, C); F(18, 4, 4, 18, 9, 4, AIR)
  ;[[11, 17, 30], [12, 19, 28], [13, 21, 26], [14, 23, 24]].forEach(p => F(p[1], p[0], 4, p[2], p[0], 4, p[0] == 11 ? C : DSJ)); S(23, 15, 4, 'minecraft:smooth_sandstone_slab[type=bottom]'); S(24, 15, 4, 'minecraft:smooth_sandstone_slab[type=bottom]'); S(24, 12, 3, 'supplementaries:clock_block[facing=north]'.replace('clock_block[facing=north]', 'clock_block[facing=north]'))
  F(17, 11, 5, 30, 11, 7, 'minecraft:smooth_stone'); F(18, 2, 4, 29, 2, 4, AIR)
  PORTE(23, 2, 8, DO.replace('minecraft:dark_oak_planks', 'mcwdoors:dark_oak_classic_door'), 'north', 'left', 'false'); PORTE(24, 2, 8, 'mcwdoors:dark_oak_classic_door', 'north', 'right', 'false'); F(23, 4, 8, 24, 4, 8, GP)
  ;[11, 15, 19, 23].forEach(z => { dsFen(z, z, 4, 17, 'west', 4, z == 15 ? 2 : 3); dsFen(z, z, 4, 30, 'east', 4, z == 19 ? 2 : 3) })
  // salle d'audience
  for (var x = 18; x <= 29; x++) for (var z = 9; z <= 25; z++) S(x, 1, z, (x + z) % 2 ? DO : 'minecraft:spruce_planks')
  F(19, 2, 22, 28, 2, 25, DO); F(21, 3, 22, 27, 3, 22, DO); F(23, 3, 23, 25, 3, 23, 'mcwfurnitures:dark_oak_table'); S(24, 3, 24, MAT('dark_oak_chair', 'north')); S(24, 4, 23, 'supplementaries:book_pile'); S(23, 4, 23, 'minecraft:bell[attachment=floor,facing=north]')
  S(21, 3, 25, 'minecraft:red_banner'); S(27, 3, 25, 'minecraft:blue_banner'); S(24, 7, 26, 'supplementaries:clock_block[facing=north]')
  F(19, 3, 20, 20, 3, 21, 'minecraft:dark_oak_fence'); S(19, 2, 20, DO); S(20, 2, 20, DO); S(19, 2, 21, DO); S(20, 2, 21, DO); S(19, 3, 21, AIR); S(20, 3, 21, AIR); S(19, 3, 21, MAT('dark_oak_chair', 'east'))
  F(18, 2, 11, 18, 2, 18, DO); for (var z = 11; z <= 18; z++) { if (R() > 0.12) S(18, 3, z, MAT('dark_oak_chair', 'east')); if (R() > 0.12) S(19, 2, z, MAT('dark_oak_chair', 'east')) } F(20, 2, 11, 20, 2, 18, 'minecraft:dark_oak_fence')
  F(22, 2, 18, 23, 2, 18, 'mcwfurnitures:dark_oak_table'); F(22, 2, 17, 23, 2, 17, MAT('dark_oak_chair', 'south')); F(26, 2, 18, 27, 2, 18, 'mcwfurnitures:dark_oak_table'); F(26, 2, 17, 27, 2, 17, MAT('dark_oak_chair', 'south')); S(22, 3, 18, 'supplementaries:book_pile'); S(27, 3, 18, 'supplementaries:book_pile')
  for (var x = 21; x <= 28; x++) if (x != 24) S(x, 2, 16, 'minecraft:dark_oak_fence')
  ;[10, 12, 14].forEach(z => { for (var x = 21; x <= 28; x++) if (x != 24 && R() > 0.1) S(x, 2, z, 'minecraft:dark_oak_stairs[facing=north,half=bottom,shape=straight]') })
  S(24, 11, 13, 'mcwlights:iron_chandelier'); S(24, 11, 20, 'mcwlights:iron_chandelier'); dsPapiers(18, 9, 29, 21, 2, 9)
  // cour fermee arriere (vehicule de patrouille, groupe electrogene, fil barbele)
  W(1, 22, 15, 31, 0, 2, 'minecraft:mud_bricks'); for (var x = 1; x <= 15; x++) S(x, 3, 31, 'minecraft:cobweb'); for (var z = 23; z <= 30; z++) { S(1, 3, z, 'minecraft:cobweb'); S(15, 3, z, 'minecraft:cobweb') }
  F(7, 0, 31, 9, 2, 31, AIR); S(7, 0, 31, 'minecraft:iron_bars'); S(9, 0, 31, 'minecraft:iron_bars'); dsBitume(2, 23, 14, 30); S(7, 0, 22, AIR); S(8, 0, 22, AIR)
  bgVoiture(4, 24, 'z', 'black', 1); S(12, 0, 24, 'minecraft:iron_block'); S(12, 1, 24, 'minecraft:lever[face=floor,facing=north,powered=false]'); S(13, 0, 24, 'minecraft:barrel[facing=up,open=false]'); S(13, 0, 28, 'minecraft:water_cauldron[level=1]'); S(10, 0, 29, 'supplementaries:sack')
  // abords
  dsDalle(16, 0, 16, 31, ['minecraft:packed_mud', 'minecraft:sand']); F(31, 0, 0, 31, 0, 31, AIR)
  dsPalmier(16, 1, 7, true); dsCactus(0, 3, 2); dsCactus(31, 28, 3); dsCactus(0, 21, 2)
  dsVeg(0, 0, 31, 31, 0.3)
}

// ================= OASIS (bassin presque asseche, palmeraie, treille, chateau d'eau, theatre de plein air, serre aux cactus) =================
function dsOasis() {
  DST = {}
  var WCu = 'minecraft:waxed_weathered_cut_copper', OCu = 'minecraft:waxed_oxidized_cut_copper'
  dsSol(0, 0, 31, 31)
  // bassin x6..19 z8..21
  var cx = 12.5, cz = 14.5, eau = {}
  for (var x = 6; x <= 19; x++) for (var z = 8; z <= 21; z++) {
    var e = Math.pow((x - cx) / 6.6, 2) + Math.pow((z - cz) / 6.6, 2); if (e > 1) continue
    if (e > 0.72) { S(x, -1, z, R() < 0.7 ? 'minecraft:mud' : 'minecraft:packed_mud'); delete DST[x + ',' + z]; if (R() < 0.15) S(x, 0, z, 'minecraft:dead_bush') }
    else if (e > 0.3) { S(x, -1, z, AIR); S(x, -2, z, R() < 0.6 ? 'minecraft:mud' : 'minecraft:clay'); delete DST[x + ',' + z] }
    else { S(x, -1, z, AIR); S(x, -2, z, 'minecraft:water'); S(x, -3, z, 'minecraft:clay'); eau[x + ',' + z] = 1; delete DST[x + ',' + z]; if (R() < 0.2) S(x, -1, z, 'minecraft:lily_pad') }
  }
  for (var x = 6; x <= 19; x++) for (var z = 8; z <= 21; z++) {
    if (eau[x + ',' + z]) continue
    var e = Math.pow((x - cx) / 6.6, 2) + Math.pow((z - cz) / 6.6, 2); if (e > 0.72 || e <= 0.3) continue
    if ((eau[(x + 1) + ',' + z] || eau[(x - 1) + ',' + z] || eau[x + ',' + (z + 1)] || eau[x + ',' + (z - 1)]) && R() < 0.55) { S(x, -2, z, 'minecraft:mud'); S(x, -1, z, 'minecraft:sugar_cane'); if (R() < 0.6) S(x, 0, z, 'minecraft:sugar_cane') }
  }
  // allees
  dsDalle(10, 0, 11, 6, ['minecraft:mud_bricks', 'minecraft:packed_mud']); dsDalle(4, 7, 4, 22, ['minecraft:mud_bricks', 'minecraft:packed_mud']); dsDalle(5, 22, 20, 23, ['minecraft:mud_bricks', 'minecraft:packed_mud']); dsDalle(20, 7, 21, 22, ['minecraft:mud_bricks', 'minecraft:packed_mud']); dsDalle(5, 6, 21, 7, ['minecraft:mud_bricks', 'minecraft:packed_mud'])
  dsBanc(8, 7, 'north', 3); dsBanc(14, 7, 'north', 3); dsBanc(20, 12, 'east', 3); dsBanc(9, 23, 'south', 3)
  ;[[5, 6], [21, 6], [5, 23], [21, 23]].forEach(p => { S(p[0], 0, p[1], 'minecraft:mud_brick_wall'); F(p[0], 1, p[1], p[0], 2, p[1], DSF); S(p[0], 3, p[1], 'minecraft:lantern[hanging=false]') })
  // palmeraie
  dsPalmier(3, 3, 9); dsPalmier(17, 3, 8); dsPalmier(1, 12, 7, true); dsPalmier(23, 9, 8); dsPalmier(19, 20, 8); dsPalmier(7, 19, 7)
  // treille x23..29 z0..6 : poteaux, chevrons, vigne sechee, table
  ;[23, 26, 29].forEach(x => [0, 3, 6].forEach(z => F(x, 0, z, x, 3, z, DSL))); ;[0, 3, 6].forEach(z => F(23, 4, z, 29, 4, z, DSX)); ;[24, 26, 28].forEach(x => F(x, 5, 0, x, 5, 6, DSZ))
  for (var x = 24; x <= 28; x += 2) for (var z = 1; z <= 5; z++) if (z != 3 && R() < 0.5) S(x, 4, z, 'minecraft:vine[up=true]')
  S(25, 0, 2, 'mcwfurnitures:acacia_table'); S(27, 0, 2, 'mcwfurnitures:acacia_table'); S(25, 0, 1, MAT('acacia_chair', 'south')); S(27, 0, 4, MAT('acacia_chair', 'north')); S(28, 0, 2, MAT('acacia_chair', 'west')); S(25, 1, 2, 'minecraft:decorated_pot'); S(27, 1, 2, 'minecraft:candle[candles=2,lit=false]')
  dsDalle(23, 0, 29, 6, ['minecraft:mud_bricks', DSJ, 'minecraft:packed_mud'])
  // serre aux cactus en ruine x23..30 z11..16
  F(23, 0, 11, 30, 0, 16, 'minecraft:smooth_stone')
  for (var y = 1; y <= 3; y++) { for (var x = 23; x <= 30; x++) { S(x, y, 11, GP); S(x, y, 16, GP) } for (var z = 12; z <= 15; z++) { S(23, y, z, GP); S(30, y, z, GP) } }
  ;[[23, 11], [30, 11], [23, 16], [30, 16], [26, 11], [27, 16]].forEach(p => F(p[0], 1, p[1], p[0], 3, p[1], 'minecraft:polished_blackstone_wall'))
  F(23, 4, 11, 30, 4, 16, 'minecraft:glass'); PORTE(23, 1, 13, DSV, 'west', 'left', 'true')
  F(25, 0, 14, 28, 0, 14, 'minecraft:sand'); S(25, 1, 14, 'minecraft:cactus'); S(25, 2, 14, 'minecraft:cactus'); S(28, 1, 14, 'minecraft:cactus'); S(26, 1, 14, 'minecraft:dead_bush'); S(27, 1, 14, 'minecraft:dead_bush')
  ;[24, 27, 29].forEach(x => S(x, 1, 12, choix(['minecraft:potted_cactus', 'minecraft:potted_dead_bush', 'minecraft:flower_pot']))); ;[24, 26, 29].forEach(x => S(x, 1, 15, choix(['minecraft:potted_cactus', 'minecraft:potted_dead_bush'])))
  // chateau d'eau x23..29 z18..24
  ;[[24, 19], [28, 19], [24, 23], [28, 23]].forEach(p => F(p[0], 0, p[1], p[0], 13, p[1], DSL))
  ;[5, 10].forEach(y => { F(25, y, 19, 27, y, 19, DSF); F(25, y, 23, 27, y, 23, DSF); F(24, y, 20, 24, y, 22, DSF); F(28, y, 20, 28, y, 22, DSF) })
  F(23, 14, 18, 29, 14, 24, 'minecraft:acacia_slab[type=top]'); for (var x = 23; x <= 29; x++) { S(x, 15, 18, DSF); S(x, 15, 24, DSF) } for (var z = 19; z <= 23; z++) { S(23, 15, z, DSF); S(29, 15, z, DSF) }
  for (var y = 15; y <= 21; y++) for (var dx = -3; dx <= 3; dx++) for (var dz = -3; dz <= 3; dz++) {
    var d2 = dx * dx + dz * dz; if (d2 > 7.5) continue
    if (y == 15 || d2 >= 3.5) S(26 + dx, y, 21 + dz, (y == 15 || y == 18 || y == 21) ? OCu : WCu)
  }
  for (var dx = -3; dx <= 3; dx++) for (var dz = -3; dz <= 3; dz++) { var d2 = dx * dx + dz * dz; if (d2 <= 7.5) S(26 + dx, 22, 21 + dz, d2 <= 3.5 ? WCu : 'minecraft:waxed_weathered_cut_copper_slab[type=bottom]'); if (d2 <= 1.5) S(26 + dx, 23, 21 + dz, d2 == 0 ? WCu : 'minecraft:waxed_weathered_cut_copper_slab[type=bottom]') }
  S(26, 24, 21, 'minecraft:lightning_rod'); F(26, 0, 21, 26, 13, 21, 'minecraft:waxed_weathered_copper'); S(27, 0, 22, 'minecraft:water_cauldron[level=1]')
  S(24, 14, 19, DSA); F(23, 0, 19, 23, 14, 19, 'minecraft:ladder[facing=west]'); S(23, 15, 19, AIR)
  dsDalle(22, 17, 30, 25, ['minecraft:packed_mud', 'minecraft:coarse_dirt', 'minecraft:sand'])
  // theatre de plein air x1..18 z24..31 : scene a l'ouest, gradins vers l'est
  F(2, 0, 25, 6, 0, 30, DSA); F(1, 0, 24, 1, 6, 31, 'minecraft:mud_bricks'); for (var z = 25; z <= 30; z++) for (var y = 1; y <= 5; y++) if (z % 2 && R() < 0.75) S(2, y, z, 'minecraft:red_wool')
  F(6, 1, 24, 6, 5, 24, DSL); F(6, 1, 31, 6, 5, 31, DSL); F(6, 6, 24, 6, 6, 31, DSX); F(2, 6, 24, 5, 6, 24, DSX); F(2, 6, 31, 5, 6, 31, DSX)
  S(3, 1, 25, 'minecraft:note_block'); S(3, 2, 25, 'minecraft:note_block'); S(3, 1, 30, 'minecraft:note_block'); S(5, 1, 27, 'minecraft:lightning_rod'); S(4, 1, 28, 'minecraft:lectern[facing=east]'); S(4, 1, 26, MAT('acacia_chair', 'east')); S(5, 1, 29, 'minecraft:light_gray_carpet')
  for (var k = 0; k <= 4; k++) { F(8 + 2 * k, 0, 25, 9 + 2 * k, k, 30, DSJ); F(8 + 2 * k, k + 1, 25, 8 + 2 * k, k + 1, 30, 'minecraft:smooth_sandstone_stairs[facing=east,half=bottom,shape=straight]'); dsDalle(8 + 2 * k, 25, 9 + 2 * k, 30, DSJ) }
  for (var z = 25; z <= 30; z++) if (R() < 0.15) S(8 + 2 * Math.floor(R() * 5), 1 + Math.floor(R() * 3), z, AIR)
  dsDalle(2, 24, 18, 24, ['minecraft:mud_bricks', 'minecraft:packed_mud']); dsDalle(2, 31, 18, 31, ['minecraft:mud_bricks', 'minecraft:packed_mud'])
  dsCactus(31, 1, 3); dsCactus(21, 27, 2); dsCactus(0, 8, 2)
  dsVeg(0, 0, 31, 31, 0.32)
}
