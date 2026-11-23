
// ================= SQUARE (bouche de metro, fontaine seche, fontaines Wallace, manege, guignol, statue de bronze) =================
function hbSquare() {
  for (var x = 0; x <= 31; x++) { S(x, -1, 0, R() < 0.8 ? 'minecraft:smooth_stone' : 'minecraft:polished_andesite'); S(x, -1, 1, R() < 0.8 ? 'minecraft:smooth_stone' : 'minecraft:andesite') }
  hbSol(0, 2, 31, 31)
  function allee(x, z) { S(x, -1, z, R() < 0.85 ? 'minecraft:gravel' : 'minecraft:coarse_dirt'); delete HV[x + ',' + z] }
  for (var i = 2; i <= 31; i++) { allee(15, i); allee(16, i); allee(i, 15); allee(i, 16) }
  for (var x = 4; x <= 27; x++) for (var z = 4; z <= 27; z++) { var d = Math.sqrt((x - 15.5) * (x - 15.5) + (z - 15.5) * (z - 15.5)); if (d >= 6 && d < 7.5) allee(x, z) }
  // grille basse du square, ouvertures
  for (var i = 0; i <= 31; i++) { if (!((i >= 13 && i <= 18) || (i >= 3 && i <= 7))) S(i, 0, 2, HF); if (i < 13 || i > 18) S(i, 0, 31, HF) }
  for (var z = 3; z <= 30; z++) { if (z < 14 || z > 17) { S(0, 0, z, HF); S(31, 0, z, HF) } }
  // ---- bouche de metro Guimard et couloir effondre ----
  for (var x = 3; x <= 7; x++) for (var z = 3; z <= 14; z++) { delete HV[x + ',' + z] }
  F(3, -5, 4, 7, -2, 13, 'minecraft:white_concrete'); F(4, -5, 4, 6, -5, 13, 'minecraft:gray_terracotta'); F(4, -4, 4, 6, -2, 13, AIR); F(4, -1, 5, 6, -1, 7, AIR)
  for (var k = 0; k < 4; k++) for (var x = 4; x <= 6; x++) { S(x, -1 - k, 4 + k, hbE('minecraft:stone_brick', 'north')); if (k < 3) F(x, -4, 4 + k, x, -2 - k, 4 + k, 'minecraft:stone_bricks') }
  for (var z = 8; z <= 13; z++) { S(3, -3, z, z % 2 ? 'minecraft:light_blue_terracotta' : 'minecraft:white_concrete'); S(7, -3, z, z % 2 ? 'minecraft:light_blue_terracotta' : 'minecraft:white_concrete') }
  F(4, -4, 12, 6, -3, 13, 'minecraft:cobblestone'); S(5, -2, 13, 'minecraft:andesite'); S(4, -2, 12, 'minecraft:gravel'.replace('gravel', 'tuff')); S(6, -4, 11, 'minecraft:cobblestone_slab[type=bottom]'); S(5, -4, 10, 'minecraft:white_carpet')
  S(5, -2, 9, HLH)
  for (var z = 4; z <= 8; z++) { S(3, 0, z, 'minecraft:warped_fence'); S(7, 0, z, 'minecraft:warped_fence') } F(4, 0, 8, 6, 0, 8, 'minecraft:warped_fence')
  F(3, 1, 3, 3, 3, 3, 'minecraft:warped_fence'); F(7, 1, 3, 7, 3, 3, 'minecraft:warped_fence'); S(3, 0, 3, 'minecraft:warped_fence'); S(7, 0, 3, 'minecraft:warped_fence')
  S(3, 4, 3, 'minecraft:shroomlight'); S(7, 4, 3, 'minecraft:shroomlight'); F(4, 4, 3, 6, 4, 3, 'minecraft:warped_fence'); S(5, 5, 3, 'minecraft:warped_fence')
  // ---- fontaine seche ----
  for (var x = 9; x <= 22; x++) for (var z = 9; z <= 22; z++) {
    var d = Math.sqrt((x - 15.5) * (x - 15.5) + (z - 15.5) * (z - 15.5)); if (d >= 6) continue
    delete HV[x + ',' + z]
    if (d >= 4.8) { S(x, -1, z, HSB); S(x, 0, z, 'minecraft:smooth_stone') }
    else { S(x, -1, z, choix(['minecraft:mossy_stone_bricks', 'minecraft:coarse_dirt', 'minecraft:mud', 'minecraft:stone_bricks'])); if (R() < 0.25) S(x, 0, z, choix(['minecraft:moss_carpet', 'minecraft:dead_bush'.replace('dead_bush', 'moss_carpet'), 'minecraft:white_carpet'])) }
  }
  F(15, 0, 15, 16, 3, 16, HSB); for (var x = 13; x <= 18; x++) for (var z = 13; z <= 18; z++) { var d = Math.max(Math.abs(x - 15.5), Math.abs(z - 15.5)); if (d > 1 && d < 3) S(x, 3, z, 'minecraft:stone_brick_slab[type=top]') }
  F(15, 4, 15, 16, 4, 16, 'minecraft:chiseled_stone_bricks'); S(15, 5, 15, 'minecraft:decorated_pot'); S(16, 5, 16, 'minecraft:stone_brick_wall')
  // ---- fontaines Wallace ----
  ;[[11, 4], [27, 11]].forEach(p => { S(p[0], 0, p[1], 'minecraft:dark_prismarine'); F(p[0], 1, p[1], p[0], 2, p[1], 'minecraft:prismarine_wall'); S(p[0], 3, p[1], 'minecraft:dark_prismarine_slab[type=bottom]'); delete HV[p[0] + ',' + p[1]] })
  // ---- manege ----
  var MX = 24, MZ = 24
  for (var x = MX - 5; x <= MX + 5; x++) for (var z = MZ - 5; z <= MZ + 5; z++) {
    var d = Math.sqrt((x - MX) * (x - MX) + (z - MZ) * (z - MZ)), a = Math.floor((Math.atan2(z - MZ, x - MX) + Math.PI) / (Math.PI / 4)), c = a % 2 ? 'red' : 'white'
    if (d <= 4) { S(x, 0, z, (x + z) % 2 ? 'minecraft:spruce_planks' : 'minecraft:birch_planks'); delete HV[x + ',' + z] }
    if (d <= 4.6) SA(x, 5, z, 'minecraft:' + c + '_wool'); if (d <= 3) S(x, 6, z, 'minecraft:' + c + '_wool'); if (d <= 1.5) S(x, 7, z, 'minecraft:' + c + '_wool')
  }
  F(MX, 1, MZ, MX, 7, MZ, 'minecraft:stripped_spruce_log[axis=y]'); S(MX, 8, MZ, 'minecraft:gold_block'); S(MX, 9, MZ, 'minecraft:lightning_rod[facing=up]')
  ;[[3, 0], [-3, 0], [0, 3], [0, -3], [2, 2], [-2, -2]].forEach((o, i) => { var x = MX + o[0], z = MZ + o[1]; F(x, 2, z, x, 4, z, 'minecraft:chain[axis=y]'); S(x, 1, z, i % 3 == 0 ? 'minecraft:brown_wool' : 'minecraft:white_wool') })
  S(MX - 3, 1, MZ + 2, 'minecraft:white_carpet'); S(MX + 1, 1, MZ - 1, 'minecraft:red_carpet')
  // ---- theatre de guignol ----
  F(26, 0, 4, 29, 4, 6, 'minecraft:spruce_planks'); F(27, 1, 5, 28, 4, 5, AIR); F(27, 2, 6, 28, 3, 6, AIR); S(26, 2, 6, 'minecraft:red_wool'); S(29, 2, 6, 'minecraft:red_wool'); F(26, 3, 6, 29, 3, 6, 'minecraft:red_wool')
  F(27, 2, 6, 28, 2, 6, AIR); for (var x = 25; x <= 30; x++) S(x, 5, 5, x % 2 ? 'minecraft:yellow_wool' : 'minecraft:red_wool'); S(27, 1, 6, 'minecraft:spruce_slab[type=top]'); S(28, 1, 6, 'minecraft:spruce_slab[type=top]')
  S(27, 2, 5, 'minecraft:carved_pumpkin[facing=south]'); for (var x = 25; x <= 30; x++) for (var z = 4; z <= 10; z++) delete HV[x + ',' + z]
  gtBanc(26, 9, 'south', 3)
  // ---- statue de bronze ----
  F(7, 0, 23, 9, 1, 25, HSB); S(8, 2, 24, 'minecraft:chiseled_stone_bricks'); F(8, 3, 24, 8, 5, 24, 'minecraft:oxidized_copper'); S(8, 6, 24, 'minecraft:oxidized_cut_copper'); S(7, 5, 24, 'minecraft:oxidized_cut_copper_stairs[facing=east,half=top,shape=straight]'); S(9, 5, 24, 'minecraft:lightning_rod[facing=east]')
  for (var x = 6; x <= 10; x++) for (var z = 22; z <= 26; z++) delete HV[x + ',' + z]
  // ---- platanes, bancs, reverberes ----
  ;[[4, 28], [11, 29], [27, 18], [20, 29], [10, 20], [21, 10]].forEach(p => hbPlatane(p[0], p[1], 6))
  ;[[12, 7, 'south'], [18, 25, 'north'], [3, 19, 'south'], [12, 25, 'north']].forEach(b => gtBanc(b[0], b[1], b[2], 3))
  ;[[14, 3], [17, 30], [2, 14], [29, 17]].forEach(p => hbLampe(p[0], p[1], 0, 1))
  hbVeg(1, 3, 30, 30, 0.75)
  for (var i = 0; i < 16; i++) SA(1 + Math.floor(R() * 30), 0, 3 + Math.floor(R() * 28), choix(['minecraft:white_carpet', 'minecraft:light_gray_carpet', 'supplementaries:book_pile']))
}

// ================= BANQUE (portique a colonnes, fronton a horloge, salle des guichets, mezzanines, chambre forte) =================
function hbBanque() {
  var Q = 'minecraft:smooth_quartz', QP = 'minecraft:quartz_pillar'
  for (var x = 0; x <= 31; x++) S(x, -1, 0, 'minecraft:smooth_stone')
  hbSol(0, 29, 31, 31); hbSol(0, 1, 2, 28); hbSol(29, 1, 31, 28)
  // emmarchement et podium
  F(3, 0, 0, 28, 0, 0, hbE('minecraft:quartz', 'south')); F(3, 0, 1, 28, 0, 1, Q); F(3, 1, 1, 28, 1, 1, hbE('minecraft:quartz', 'south'))
  F(3, 0, 2, 28, 0, 28, 'minecraft:stone'); F(3, 1, 2, 28, 1, 4, Q)
  // portique et fronton
  ;[4, 6, 10, 14, 17, 21, 25, 27].forEach(x => F(x, 2, 2, x, 10, 2, QP))
  F(3, 11, 2, 28, 11, 4, Q); F(3, 11, 1, 28, 11, 1, hbE('minecraft:quartz', 'north', 'top'))
  for (var k = 0; k <= 4; k++) F(4 + k * 3, 12 + k, 2, 27 - k * 3, 12 + k, 2, Q)
  F(4, 12, 3, 27, 12, 4, Q); S(15, 14, 2, 'minecraft:white_concrete'); S(16, 14, 2, 'minecraft:white_concrete'); S(15, 13, 2, HCH); S(16, 13, 2, HCH); S(15, 15, 2, 'minecraft:gold_block'); S(16, 15, 2, 'minecraft:gold_block')
  F(15, 14, 1, 16, 14, 1, 'minecraft:black_concrete'.replace('black_concrete', 'polished_blackstone_button[face=wall,facing=north]'))
  // ---- enveloppe ----
  for (var x = 3; x <= 28; x++) for (var y = 1; y <= 12; y++) { S(x, y, 5, y % 4 == 0 ? HC : hbM(HS)); S(x, y, 28, y % 4 == 0 ? HC : hbM(HS)) }
  for (var z = 6; z <= 27; z++) for (var y = 1; y <= 12; y++) { var fen = z % 4 == 2 && y >= 3 && y <= 8; S(3, y, z, fen ? GP : y % 4 == 0 ? HC : hbM(HS)); S(28, y, z, fen ? GP : y % 4 == 0 ? HC : hbM(HS)) }
  F(4, 1, 6, 27, 1, 27, 'minecraft:polished_andesite')
  for (var x = 4; x <= 27; x++) for (var z = 6; z <= 17; z++) S(x, 1, z, (x + z) % 2 ? Q : 'minecraft:polished_deepslate')
  // portes de bronze et imposte
  PORTE(14, 2, 5, HPV, 'north', 'left', 'false'); PORTE(15, 2, 5, HPV, 'north', 'right', 'true'); PORTE(16, 2, 5, HPV, 'north', 'left', 'true'); PORTE(17, 2, 5, HPV, 'north', 'right', 'false')
  F(14, 4, 5, 17, 7, 5, GP); F(13, 2, 5, 13, 8, 5, HC); F(18, 2, 5, 18, 8, 5, HC); F(13, 8, 5, 18, 8, 5, HCH)
  // toiture, verriere
  F(3, 13, 5, 28, 13, 28, 'minecraft:smooth_stone'); for (var x = 8; x <= 23; x++) for (var z = 7; z <= 16; z++) S(x, 13, z, (x % 4 == 0 || z % 4 == 0) ? 'minecraft:polished_blackstone' : 'minecraft:glass')
  for (var x = 3; x <= 28; x++) { S(x, 14, 5, HF); S(x, 14, 28, HF) } for (var z = 6; z <= 27; z++) { S(3, 14, z, HF); S(28, 14, z, HF) }
  ;[[10, 9], [21, 9], [10, 14], [21, 14]].forEach(c => S(c[0], 12, c[1], 'mcwlights:iron_chandelier'))
  // ---- salle des guichets : comptoir, grilles, bureaux ----
  for (var x = 7; x <= 24; x++) { S(x, 2, 13, MAT('dark_oak_counter', 'north')); if (x % 3 != 1) S(x, 3, 13, 'minecraft:iron_bars'); else S(x, 3, 13, 'supplementaries:book_pile') }
  F(7, 4, 13, 24, 4, 13, 'minecraft:dark_oak_slab[type=bottom]')
  for (var x = 8; x <= 23; x += 3) { S(x, 2, 14, MAT('dark_oak_chair', 'north')); S(x, 2, 16, 'mcwfurnitures:dark_oak_table'); S(x, 3, 16, choix(['supplementaries:book_pile', 'minecraft:candle[candles=2,lit=false]', 'minecraft:air'])); S(x, 2, 17, MAT('dark_oak_chair', 'north')) }
  for (var i = 0; i < 18; i++) SA(5 + Math.floor(R() * 22), 2, 6 + Math.floor(R() * 12), choix(['minecraft:white_carpet', 'minecraft:light_gray_carpet', 'minecraft:white_carpet', 'supplementaries:book_pile']))
  // coin poste : casiers et colis
  for (var z = 14; z <= 17; z++) for (var y = 2; y <= 4; y++) S(27, y, z, 'minecraft:chiseled_bookshelf[facing=west]')
  ;[[25, 15], [26, 17], [25, 16]].forEach(p => S(p[0], 2, p[1], choix(['minecraft:brown_shulker_box', 'minecraft:barrel[facing=up,open=false]', 'supplementaries:sack'])))
  // mezzanines sur colonnes, grand escalier ouest
  F(4, 7, 6, 6, 7, 17, 'minecraft:dark_oak_planks'); F(25, 7, 6, 27, 7, 17, 'minecraft:dark_oak_planks')
  for (var z = 7; z <= 17; z += 5) { F(6, 2, z, 6, 6, z, QP); F(25, 2, z, 25, 6, z, QP) }
  F(6, 8, 6, 6, 8, 17, HF); F(25, 8, 6, 25, 8, 17, HF)
  for (var i = 0; i < 6; i++) for (var x = 4; x <= 5; x++) { if (i) F(x, 2, 7 + i, x, 1 + i, 7 + i, Q); S(x, 2 + i, 7 + i, hbE('minecraft:quartz', 'south')) }
  F(4, 7, 6, 5, 7, 11, AIR); F(6, 8, 7, 6, 8, 11, HF)
  for (var z = 13; z <= 17; z += 2) { S(4, 8, z, 'minecraft:chiseled_bookshelf[facing=east]'); S(26, 8, z, MAT('dark_oak_desk'.replace('desk', 'drawer'), 'west')) }
  S(27, 8, 10, 'minecraft:barrel[facing=up,open=false]')
  // ---- antichambre, cloison, chambre forte ----
  F(4, 2, 18, 27, 12, 18, HS); PORTE(15, 2, 18, HPO, 'south', 'left', 'true'); F(4, 12, 18, 27, 12, 18, HC)
  F(11, 1, 22, 20, 7, 28, 'minecraft:polished_deepslate'); F(12, 2, 23, 19, 6, 27, AIR); F(12, 1, 23, 19, 1, 27, 'minecraft:iron_block')
  F(15, 2, 22, 17, 4, 22, AIR); S(15, 2, 22, 'minecraft:polished_deepslate'); S(17, 2, 22, 'minecraft:polished_deepslate'); S(15, 4, 22, 'minecraft:polished_deepslate'); S(17, 4, 22, 'minecraft:polished_deepslate')
  F(16, 2, 22, 16, 4, 22, AIR); F(15, 3, 22, 17, 3, 22, AIR)
  F(14, 2, 19, 14, 4, 21, 'minecraft:iron_block'); S(14, 3, 20, 'minecraft:chiseled_deepslate'); S(13, 3, 20, 'minecraft:lever[face=wall,facing=west,powered=false]')
  for (var y = 2; y <= 5; y++) { for (var z = 23; z <= 27; z++) { S(12, y, z, 'minecraft:iron_trapdoor[facing=east,half=bottom,open=true]'); S(19, y, z, 'minecraft:iron_trapdoor[facing=west,half=bottom,open=true]') } for (var x = 13; x <= 18; x++) S(x, y, 27, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=true]') }
  ;[[13, 24], [13, 26], [18, 24]].forEach(p => S(p[0], 3, p[1], AIR))
  S(15, 2, 25, 'minecraft:gold_block'); S(16, 2, 25, 'minecraft:gold_block'); S(15, 3, 25, 'minecraft:gold_block'); S(16, 2, 26, 'minecraft:chest[facing=north]'); S(14, 2, 26, 'minecraft:chest[facing=north]'); S(17, 2, 24, 'minecraft:barrel[facing=up,open=true]'); S(16, 6, 24, HLH)
  ;[[13, 23], [18, 26], [15, 24]].forEach(p => SA(p[0], 2, p[1], choix(['minecraft:white_carpet', 'supplementaries:sack'])))
  // bureaux du directeur et archives (arriere)
  F(4, 1, 19, 10, 1, 27, 'minecraft:spruce_planks'); F(21, 1, 19, 27, 1, 27, 'minecraft:spruce_planks')
  F(10, 2, 19, 10, 12, 27, HS); F(21, 2, 19, 21, 12, 27, HS); PORTE(10, 2, 20, HPO, 'east', 'left', 'false'); PORTE(21, 2, 20, HPO, 'west', 'right', 'false')
  piece(cadre(4, 22, 9, 27, 'south', 1, 5), 'bureau', 1); piece(cadreInv(22, 22, 27, 27, 'south', 1, 5), 'bureau', 1)
  for (var z = 19; z <= 21; z++) for (var y = 2; y <= 3; y++) { S(4, y, z, 'minecraft:chiseled_bookshelf[facing=east]'); S(27, y, z, 'minecraft:chiseled_bookshelf[facing=west]') }
  F(4, 7, 19, 27, 7, 27, 'minecraft:spruce_planks'); F(11, 7, 22, 20, 7, 28, 'minecraft:polished_deepslate'); hbBazar(4, 19, 27, 27, 8, 14)
}
