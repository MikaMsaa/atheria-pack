
// ================= OPERA (cage de scene, salle a l'italienne, fosse, loges, grand escalier, loggia) =================
// Scene z1..10, salle z10..21, foyer z22..28, loggia z28..29 a l'etage ; x3..28.
function hbTheatre() {
  for (var x = 0; x <= 31; x++) { S(x, -1, 30, R() < 0.8 ? 'minecraft:smooth_stone' : 'minecraft:polished_andesite'); S(x, -1, 31, R() < 0.8 ? 'minecraft:smooth_stone' : 'minecraft:andesite') }
  hbSol(0, 0, 31, 0); hbSol(0, 1, 2, 29); hbSol(29, 1, 31, 29)
  F(3, -1, 1, 28, -1, 29, 'minecraft:stone')
  // ---- enveloppe ----
  for (var z = 1; z <= 29; z++) for (var y = 0; y <= 25; y++) {
    var h = z <= 10 ? 25 : z <= 21 ? 18 : 18; if (y > h) continue
    ;[3, 28].forEach(x => S(x, y, z, z % 3 == 0 || y % 6 == 0 ? HC : hbM(HS)))
  }
  for (var x = 4; x <= 27; x++) for (var y = 0; y <= 25; y++) { S(x, y, 1, x % 4 == 0 ? HC : hbM(HS)); S(x, y, 10, y >= 4 && y <= 13 && x >= 8 && x <= 23 ? AIR : HS) }
  for (var x = 4; x <= 27; x++) for (var y = 0; y <= 18; y++) S(x, y, 21, HS)
  F(4, 0, 2, 27, 0, 28, 'minecraft:polished_andesite')
  // ---- cage de scene ----
  F(4, 1, 2, 27, 2, 9, 'minecraft:stone'); F(4, 3, 2, 27, 3, 10, 'minecraft:spruce_planks'); F(8, 0, 10, 23, 2, 10, HS)
  for (var x = 6; x <= 25; x++) for (var y = 4; y <= 14; y++) S(x, y, 2, y >= 9 ? 'minecraft:light_blue_wool' : y >= 6 ? (x % 7 < 3 ? 'minecraft:green_wool' : 'minecraft:lime_wool') : 'minecraft:green_wool')
  F(9, 10, 2, 11, 12, 2, 'minecraft:white_wool'); F(20, 11, 2, 21, 11, 2, 'minecraft:white_wool'); S(14, 6, 2, 'minecraft:brown_wool'); F(14, 7, 2, 14, 9, 2, 'minecraft:brown_wool'); F(13, 9, 2, 15, 11, 2, 'minecraft:green_wool')
  // decor : facade de maison en carton, table et chaises, projecteur tombe
  F(18, 4, 6, 22, 7, 6, 'minecraft:birch_planks'); F(19, 5, 6, 19, 6, 6, GP); F(21, 5, 6, 21, 6, 6, GP); F(18, 8, 6, 22, 8, 6, hbE('minecraft:spruce', 'south'))
  S(12, 4, 6, 'mcwfurnitures:oak_table'); S(11, 4, 6, MAT('oak_chair', 'east')); S(13, 4, 6, MAT('oak_chair', 'west')); S(12, 5, 6, 'minecraft:candle[candles=3,lit=false]'); S(9, 4, 8, 'minecraft:redstone_lamp'); S(15, 4, 9, 'minecraft:red_carpet')
  // rideau rouge, lambrequin
  F(8, 4, 9, 10, 13, 9, 'minecraft:red_wool'); F(21, 4, 9, 23, 13, 9, 'minecraft:red_wool'); F(11, 12, 9, 20, 13, 9, 'minecraft:red_wool'); F(11, 11, 9, 20, 11, 9, 'minecraft:red_carpet'.replace('carpet', 'wool'))
  F(7, 4, 10, 7, 14, 10, HCH); F(24, 4, 10, 24, 14, 10, HCH); F(7, 14, 10, 24, 14, 10, 'minecraft:gold_block')
  // passerelles et cintres
  F(4, 16, 2, 5, 16, 9, 'minecraft:spruce_slab[type=top]'); F(26, 16, 2, 27, 16, 9, 'minecraft:spruce_slab[type=top]'); F(5, 17, 2, 5, 17, 9, HF); F(26, 17, 2, 26, 17, 9, HF)
  F(4, 25, 2, 27, 25, 9, 'minecraft:spruce_slab[type=top]')
  ;[4, 7].forEach(z => { F(8, 16, z, 8, 24, z, 'minecraft:chain[axis=y]'); F(23, 16, z, 23, 24, z, 'minecraft:chain[axis=y]'); F(8, 15, z, 23, 15, z, 'minecraft:stripped_spruce_log[axis=x]') })
  F(4, 4, 9, 4, 15, 9, 'minecraft:ladder[facing=east]')
  gtToitX(3, 28, 1, 10, 26, 'minecraft:oxidized_cut_copper'); gtPignonX(3, 1, 10, 26, HS); gtPignonX(28, 1, 10, 26, HS)
  // ---- fosse d'orchestre z11..12 ----
  F(8, -3, 11, 23, -3, 12, 'minecraft:dark_oak_planks'); F(8, -2, 11, 23, 0, 12, AIR); F(7, -2, 11, 7, 0, 12, 'minecraft:dark_oak_planks'); F(24, -2, 11, 24, 0, 12, 'minecraft:dark_oak_planks'); F(8, -2, 13, 23, 0, 13, 'minecraft:dark_oak_planks')
  F(8, 1, 13, 23, 1, 13, HF)
  for (var x = 9; x <= 22; x += 2) { S(x, -2, 12, MAT('dark_oak_chair', 'north')); if (R() < 0.6) S(x, -2, 11, choix(['minecraft:note_block', 'minecraft:lectern[facing=south]', 'minecraft:jukebox'])) }
  S(15, -2, 11, 'minecraft:lectern[facing=south]')
  // ---- parterre en gradins, allee centrale ----
  function g(z) { return Math.floor((z - 14) / 3) }
  for (var z = 14; z <= 20; z++) for (var x = 4; x <= 27; x++) {
    if (x == 4 || x == 27) continue
    var f = g(z); if (f > 0) F(x, 1, z, x, f, z, 'minecraft:dark_oak_planks')
    if (x == 15 || x == 16) { S(x, f + 1, z, 'minecraft:red_carpet'); continue }
    S(x, f + 1, z, R() < 0.06 ? 'minecraft:red_carpet' : hbE('minecraft:mangrove', 'south'))
  }
  PORTE(4, 1, 21, HPO, 'south', 'left', 'false'); PORTE(27, 1, 21, HPO, 'south', 'right', 'true')
  // ---- balcons lateraux et de fond (y6, y11), loges ----
  ;[6, 11].forEach(y => {
    F(4, y, 12, 6, y, 20, 'minecraft:dark_oak_planks'); F(25, y, 12, 27, y, 20, 'minecraft:dark_oak_planks'); F(7, y, 18, 24, y, 20, 'minecraft:dark_oak_planks')
    var PAR = 'minecraft:smooth_quartz_slab[type=bottom]'
    F(6, y + 1, 12, 6, y + 1, 17, PAR); F(25, y + 1, 12, 25, y + 1, 17, PAR); F(6, y + 1, 18, 25, y + 1, 18, PAR); F(6, y, 12, 6, y, 18, 'minecraft:yellow_terracotta'); F(25, y, 12, 25, y, 18, 'minecraft:yellow_terracotta'); F(7, y, 18, 24, y, 18, 'minecraft:yellow_terracotta')
    F(6, y - 1, 12, 6, y - 1, 17, hbE('minecraft:smooth_quartz', 'west', 'top')); F(25, y - 1, 12, 25, y - 1, 17, hbE('minecraft:smooth_quartz', 'east', 'top')); F(7, y - 1, 18, 24, y - 1, 18, hbE('minecraft:smooth_quartz', 'south', 'top'))
    ;[12, 15].forEach(z => { F(4, y + 1, z, 5, y + 3, z, 'minecraft:red_wool'); F(26, y + 1, z, 27, y + 3, z, 'minecraft:red_wool') })
    ;[13, 14, 16, 17].forEach(z => { if (R() < 0.85) S(5, y + 1, z, MAT('dark_oak_chair', 'east')); if (R() < 0.85) S(26, y + 1, z, MAT('dark_oak_chair', 'west')) })
    for (var x = 8; x <= 23; x += 2) if (R() < 0.8) S(x, y + 1, 19, MAT('dark_oak_chair', 'north'))
    if (y == 6) { S(5, 10, 14, HLH); S(26, 10, 14, HLH) }
  })
  F(4, 7, 20, 4, 11, 20, 'minecraft:ladder[facing=north]')
  // ---- plafond peint, lustre a couronne doree ----
  for (var x = 4; x <= 27; x++) for (var z = 11; z <= 20; z++) { var d = Math.max(Math.abs(x - 15.5), Math.abs(z - 15.5) * 1.6); S(x, 18, z, d < 3 ? 'minecraft:gold_block' : d < 5 ? 'minecraft:light_blue_terracotta' : d < 8 ? 'minecraft:yellow_terracotta' : d < 10 ? 'minecraft:red_terracotta' : 'minecraft:white_terracotta') }
  ;[[14, 13], [17, 13], [14, 18], [17, 18]].forEach(c => F(c[0], 14, c[1], c[0], 17, c[1], 'minecraft:chain[axis=y]'))
  F(14, 13, 13, 17, 13, 13, 'minecraft:gold_block'); F(14, 13, 18, 17, 13, 18, 'minecraft:gold_block'); F(13, 13, 14, 13, 13, 17, 'minecraft:gold_block'); F(18, 13, 14, 18, 13, 17, 'minecraft:gold_block')
  ;[[15, 13], [16, 18], [13, 15], [18, 16]].forEach(c => S(c[0], 12, c[1], HLH))
  ;[[13, 13], [18, 18]].forEach(c => S(c[0], 13, c[1], 'minecraft:gold_block'))
  PORTE(3, 1, 16, HPO, 'west', 'left', 'false'); PORTE(28, 1, 16, HPO, 'east', 'left', 'true')
  for (var i = 0; i < 14; i++) { var x = 5 + Math.floor(R() * 22), z = 14 + Math.floor(R() * 7); SA(x, g(z) + 1, z, choix(['minecraft:white_carpet', 'supplementaries:book_pile', 'minecraft:light_gray_carpet'])) }
  // ---- foyer, grand escalier vers le balcon ----
  for (var x = 4; x <= 27; x++) for (var z = 22; z <= 28; z++) S(x, 0, z, (x + z) % 2 ? 'minecraft:smooth_quartz' : 'minecraft:polished_deepslate')
  for (var i = 0; i < 6; i++) for (var x = 13; x <= 18; x++) { if (i) F(x, 1, 27 - i, x, i, 27 - i, 'minecraft:smooth_quartz'); S(x, 1 + i, 27 - i, hbE('minecraft:quartz', 'north')) }
  for (var i = 0; i < 6; i++) { F(12, 1, 27 - i, 12, 2 + i, 27 - i, 'minecraft:smooth_quartz'); F(19, 1, 27 - i, 19, 2 + i, 27 - i, 'minecraft:smooth_quartz') }
  F(13, 1, 28, 18, 1, 28, 'minecraft:red_carpet'); F(13, 7, 21, 18, 9, 21, AIR); F(13, 6, 21, 18, 6, 21, 'minecraft:dark_oak_planks')
  ;[6, 10, 21, 25].forEach(x => [23, 26].forEach(z => F(x, 1, z, x, 12, z, 'minecraft:quartz_pillar')))
  F(4, 13, 22, 27, 13, 28, 'minecraft:smooth_stone'); S(8, 12, 24, 'mcwlights:iron_chandelier'); S(23, 12, 24, 'mcwlights:iron_chandelier')
  for (var z = 23; z <= 27; z++) { S(4, 3, z, 'minecraft:white_stained_glass_pane'); S(27, 3, z, 'minecraft:white_stained_glass_pane') }
  F(5, 1, 27, 8, 1, 27, MAT('dark_oak_counter', 'north')); S(6, 2, 27, 'supplementaries:book_pile'); S(5, 1, 28, 'minecraft:brown_shulker_box')
  ;[[9, 24], [22, 25], [20, 23], [11, 27]].forEach(q => SA(q[0], 1, q[1], choix(['minecraft:white_carpet', 'supplementaries:book_pile', 'minecraft:red_carpet'])))
  // ---- facade : arcades, loggia a colonnes jumelees, attique, statues dorees ----
  for (var x = 3; x <= 28; x++) for (var y = 0; y <= 5; y++) S(x, y, 29, y % 2 ? HC : HS)
  ;[7, 11, 15, 19, 23].forEach(x => { PORTE(x, 1, 29, HPV, 'south', 'left', 'false'); PORTE(x + 1, 1, 29, HPV, 'south', 'right', R() < 0.5 ? 'true' : 'false'); F(x, 3, 29, x + 1, 4, 29, GP); S(x, 5, 29, HCH); S(x + 1, 5, 29, HCH); F(x - 1, 0, 30, x + 2, 0, 30, hbE('minecraft:smooth_sandstone', 'north')) })
  F(3, 6, 27, 28, 6, 29, HS); F(3, 6, 30, 28, 6, 30, 'minecraft:smooth_sandstone_slab[type=bottom]')
  for (var x = 4; x <= 27; x++) for (var y = 7; y <= 12; y++) S(x, y, 27, x % 3 == 1 && y >= 8 && y <= 11 ? GP : HS)
  F(3, 7, 28, 3, 12, 29, HS); F(28, 7, 28, 28, 12, 29, HS)
  ;[5, 6, 9, 10, 14, 17, 21, 22, 25, 26].forEach(x => F(x, 7, 29, x, 12, 29, 'minecraft:quartz_pillar'))
  for (var x = 4; x <= 27; x++) if ([5, 6, 9, 10, 14, 17, 21, 22, 25, 26].indexOf(x) < 0) S(x, 7, 29, HF)
  F(3, 13, 27, 28, 13, 29, HC); F(3, 13, 30, 28, 13, 30, hbE('minecraft:smooth_sandstone', 'north', 'top'))
  for (var x = 3; x <= 28; x++) for (var y = 14; y <= 18; y++) S(x, y, 29, (y == 16 && x % 4 == 1) ? HCH : y == 18 ? HC : hbM(HS))
  F(3, 14, 22, 28, 14, 28, 'minecraft:smooth_stone')
  ;[4, 27].forEach(x => { S(x, 19, 29, 'minecraft:gold_block'); S(x, 20, 29, 'minecraft:lightning_rod[facing=up]') })
  F(14, 19, 29, 17, 19, 29, 'minecraft:chiseled_quartz_block'); S(15, 20, 29, 'minecraft:gold_block'); S(16, 20, 29, 'minecraft:gold_block'); S(15, 21, 29, 'minecraft:lightning_rod[facing=up]')
  ;[8, 13, 20].forEach(x => S(x, 7, 28, 'minecraft:potted_dead_bush'))
  // ---- toiture de la salle et coupole basse de cuivre ----
  F(3, 19, 10, 28, 19, 21, 'minecraft:smooth_stone')
  for (var x = 4; x <= 27; x++) for (var z = 11; z <= 20; z++) { var a = (x - 15.5) / 9, b = (z - 15.5) / 5.5, d = a * a + b * b; if (d <= 1) { var hh = Math.floor(4 * Math.sqrt(1 - d)); F(x, 20, z, x, 19 + hh, z, 'minecraft:oxidized_cut_copper'); if (hh > 0) S(x, 19 + hh, z, 'minecraft:oxidized_cut_copper') } }
  S(15, 24, 15, 'minecraft:oxidized_copper'); S(15, 25, 15, 'minecraft:lightning_rod[facing=up]')
}
