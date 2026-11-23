
// ================= CITE HBM EN BRIQUE (barre R+6, bow-windows, cage vitree, cour avec jeux, jardins et sechoirs) =================
// Barre x1..30 z2..10, facade au nord (z2). Cage x9..16 : volees en z8 (etages pairs) et z9 (impairs), palier z7, hall z3..6.
function hbHBM() {
  var NIV = [0, 6, 12, 18, 24, 30, 36]
  for (var x = 0; x <= 31; x++) { S(x, -1, 0, R() < 0.8 ? 'minecraft:smooth_stone' : 'minecraft:polished_andesite'); S(x, -1, 1, R() < 0.8 ? 'minecraft:smooth_stone' : 'minecraft:andesite') }
  F(1, -1, 2, 30, -1, 10, 'minecraft:stone')
  // ---- planchers, murs ----
  NIV.forEach(L => F(2, L, 3, 29, L, 9, L == 0 ? 'minecraft:polished_andesite' : 'minecraft:spruce_planks'))
  F(1, 42, 2, 30, 42, 10, 'minecraft:smooth_stone')
  var BAIES = [[2, 2], [8, 8], [18, 20], [29, 29]], BOW = [[4, 6], [25, 27]]
  for (var x = 1; x <= 30; x++) for (var y = 0; y <= 41; y++) {
    var k = y % 6, b = k == 0 ? HS : hbM(HBR)
    if (x == 1 || x == 30) b = y % 2 ? HSB : HBR
    else if (x >= 11 && x <= 14 && y >= 1) b = k == 0 ? HS : GP
    else if (y >= 6 && k >= 2 && k <= 4 && BAIES.some(p => x >= p[0] && x <= p[1])) b = GP
    S(x, y, 2, b)
    var kr = k >= 2 && k <= 4 && [3, 4, 6, 7, 18, 19, 21, 22, 25, 26, 28, 29].indexOf(x) >= 0
    S(x, y, 10, k == 0 ? HS : (x == 12 || x == 13) && (k == 3 || k == 4) ? GP : kr ? GP : (x == 1 || x == 30 ? (y % 2 ? HSB : HBR) : hbM(HBR)))
  }
  for (var z = 3; z <= 9; z++) for (var y = 0; y <= 41; y++) { var k = y % 6; S(1, y, z, k == 0 ? HS : (z == 5 || z == 6) && k >= 2 && k <= 4 && y > 5 ? GP : hbM(HBR)); S(30, y, z, k == 0 ? HS : (z == 5 || z == 6) && k >= 2 && k <= 4 && y > 5 ? GP : hbM(HBR)) }
  // bow-windows superposes (x4..6 et x25..27) du 1er au 6e
  BOW.forEach(p => { for (var y = 6; y <= 41; y++) { var k = y % 6; for (var x = p[0]; x <= p[1]; x++) { S(x, y, 1, k == 0 ? HS : k >= 2 && k <= 4 ? GP : HBR); if (k >= 2 && k <= 4) S(x, y, 2, AIR) } } F(p[0], 42, 1, p[1], 42, 1, 'minecraft:smooth_stone_slab[type=bottom]') })
  // toit terrasse : acrotere, souches, chateau d'eau, antenne
  for (var x = 1; x <= 30; x++) { S(x, 43, 2, HBR); S(x, 43, 10, HBR) } for (var z = 3; z <= 9; z++) { S(1, 43, z, HBR); S(30, 43, z, HBR) }
  hbCheminee(5, 6, 43, 2); hbCheminee(20, 6, 43, 2); hbCheminee(26, 6, 43, 1)
  ;[[11, 4], [14, 4], [11, 7], [14, 7]].forEach(p => F(p[0], 43, p[1], p[0], 45, p[1], 'minecraft:iron_bars'))
  F(11, 46, 4, 14, 48, 7, 'minecraft:light_gray_concrete'); F(12, 49, 5, 13, 49, 6, 'minecraft:light_gray_concrete')
  F(24, 43, 8, 24, 47, 8, 'minecraft:iron_bars'); S(24, 48, 8, 'minecraft:lightning_rod[facing=up]'); S(23, 46, 8, 'minecraft:iron_bars'); S(25, 46, 8, 'minecraft:iron_bars')
  // ---- cage d'escalier, hall, appartements ----
  NIV.forEach((L, n) => {
    F(9, L + 1, 3, 9, L + 5, 9, HBR); F(16, L + 1, 3, 16, L + 5, 9, HBR)
    F(23, L + 1, 3, 23, L + 5, 9, HBR)
    F(10, L, 3, 15, L, 7, 'minecraft:polished_andesite')
    PORTE(9, L + 1, 4, HPO, 'west', 'left', R() < 0.3 ? 'true' : 'false'); PORTE(16, L + 1, 4, HPO, 'east', 'right', 'false'); PORTE(23, L + 1, 8, HPO, 'east', 'left', 'false')
    S(12, L + 5, 5, HLH); S(10, L + 1, 3, n == 0 ? 'minecraft:chiseled_bookshelf[facing=east]' : 'minecraft:potted_dead_bush')
    if (n < 6) {
      var pair = n % 2 == 0
      for (var i = 0; i < 6; i++) {
        if (pair) { S(10 + i, L + 1 + i, 8, hbE('minecraft:stone_brick', 'east')); if (i) S(10 + i, L + i, 8, hbE('minecraft:stone_brick', 'west', 'top')) }
        else { S(15 - i, L + 1 + i, 9, hbE('minecraft:stone_brick', 'west')); if (i) S(15 - i, L + i, 9, hbE('minecraft:stone_brick', 'east', 'top')) }
      }
      if (pair) F(10, L + 6, 8, 14, L + 6, 8, AIR); else F(11, L + 6, 9, 15, L + 6, 9, AIR)
    }
    if (n == 0) return
    var et = R() < 0.55 ? 1 : 0
    piece(cadre(2, 3, 8, 9, 'north', L, 5), choix(['salon', 'salle', 'chambre']), et)
    piece(cadre(17, 3, 22, 9, 'north', L, 5), choix(['chambre', 'salon']), et)
    piece(cadre(24, 3, 29, 9, 'north', L, 5), choix(['cuisine', 'chambre', 'salle']), et)
    if (R() < 0.5) SA(3 + Math.floor(R() * 4), L + 5, 4, 'minecraft:cobweb')
    // balcons sur cour, linge et pots oublies
    F(18, L, 11, 21, L, 11, 'minecraft:smooth_stone_slab[type=top]'); F(18, L + 1, 11, 21, L + 1, 11, HF)
    if (R() < 0.5) S(18 + Math.floor(R() * 4), L + 1, 11, choix(['minecraft:white_wool', 'minecraft:light_blue_wool', 'minecraft:potted_dead_bush']))
  })
  // ---- rez-de-chaussee : entree, epicerie, local velos, laverie ----
  PORTE(12, 1, 2, HPV, 'north', 'left', 'false'); PORTE(13, 1, 2, HPV, 'north', 'right', 'true'); F(11, 5, 0, 14, 5, 1, 'minecraft:smooth_stone_slab[type=bottom]')
  F(12, 0, 1, 13, 0, 1, hbE('minecraft:stone_brick', 'south'))
  PORTE(12, 1, 10, HPO, 'south', 'left', 'false'); F(12, 3, 10, 12, 4, 10, GP)
  for (var x = 2; x <= 8; x++) for (var z = 3; z <= 9; z++) S(x, 0, z, (x + z) % 2 ? 'minecraft:white_terracotta' : 'minecraft:gray_terracotta')
  F(3, 1, 2, 4, 3, 2, GP); F(6, 1, 2, 7, 3, 2, GP); PORTE(5, 1, 2, HPV, 'north', 'left', 'true'); F(2, 4, 1, 8, 4, 1, 'minecraft:green_wool'); S(5, 4, 1, AIR)
  for (var z = 4; z <= 9; z++) { S(2, 1, z, choix(['farmersdelight:carrot_crate', 'farmersdelight:potato_crate', 'minecraft:barrel[facing=east,open=false]', 'supplementaries:sack'])); S(2, 2, z, choix(['supplementaries:jar', 'minecraft:air', 'minecraft:flower_pot'])) }
  for (var x = 4; x <= 7; x++) S(x, 1, 7, MAT('oak_counter', 'north')); S(5, 2, 7, 'supplementaries:jar'); S(5, 5, 5, HLH); S(7, 1, 9, 'minecraft:barrel[facing=up,open=true]')
  for (var x = 18; x <= 22; x += 2) for (var z = 4; z <= 8; z += 2) S(x, 1, z, 'minecraft:iron_bars'); S(19, 1, 5, 'minecraft:spruce_trapdoor[facing=north,half=bottom,open=true]'); S(20, 5, 6, HLH)
  for (var x = 25; x <= 29; x++) { S(x, 1, 9, 'minecraft:blast_furnace[facing=north,lit=false]'); if (x % 2) S(x, 2, 9, 'minecraft:white_carpet') }
  S(25, 1, 5, 'minecraft:water_cauldron[level=2]'); S(26, 1, 5, 'minecraft:cauldron'); F(27, 1, 4, 28, 1, 4, hbE('minecraft:oak', 'south')); S(27, 5, 6, HLH)
  // ---- cour : sechoirs, balancoires, toboggan, bac a sable, abri velos, jardins ouvriers, parking ----
  hbSol(0, 11, 31, 31)
  for (var x = 2; x <= 29; x++) { S(x, -1, 12, 'minecraft:gravel'); delete HV[x + ',12'] } for (var z = 13; z <= 31; z++) { S(15, -1, z, 'minecraft:gravel'); S(16, -1, z, 'minecraft:gravel'); delete HV['15,' + z]; delete HV['16,' + z] }
  ;[[3, 15], [3, 19]].forEach(p => { F(p[0], 0, p[1], p[0], 3, p[1], 'minecraft:spruce_fence'); F(p[0] + 8, 0, p[1], p[0] + 8, 3, p[1], 'minecraft:spruce_fence'); F(p[0] + 1, 3, p[1], p[0] + 7, 3, p[1], 'minecraft:chain[axis=x]'); for (var x = p[0] + 1; x <= p[0] + 7; x++) if (R() < 0.6) S(x, 2, p[1], choix(['minecraft:white_wool', 'minecraft:light_blue_wool', 'minecraft:pink_wool', 'minecraft:yellow_wool'])); hbLibre(p[0], p[1]); hbLibre(p[0] + 8, p[1]) })
  // balancoires
  F(19, 0, 15, 19, 3, 15, 'minecraft:spruce_fence'); F(23, 0, 15, 23, 3, 15, 'minecraft:spruce_fence'); F(19, 4, 15, 23, 4, 15, 'minecraft:spruce_planks')
  ;[20, 22].forEach(x => { F(x, 2, 15, x, 3, 15, 'minecraft:chain[axis=y]'); S(x, 1, 15, 'minecraft:spruce_slab[type=bottom]') }); F(21, 3, 15, 21, 3, 15, 'minecraft:chain[axis=y]'); hbLibre(21, 15)
  // toboggan
  F(26, 0, 15, 26, 3, 15, 'minecraft:yellow_concrete'); F(26, 0, 14, 26, 3, 14, 'minecraft:ladder[facing=north]'); S(26, 4, 15, 'minecraft:yellow_concrete_powder'.replace('_powder', ''))
  for (var i = 0; i < 3; i++) { S(26, 2 - i, 16 + i, hbE('minecraft:smooth_quartz', 'north')); if (i < 2) S(26, 1 - i, 16 + i, hbE('minecraft:smooth_quartz', 'south', 'top')) } hbLibre(26, 16)
  // bac a sable
  F(19, -1, 20, 22, -1, 23, 'minecraft:sand'); for (var x = 18; x <= 23; x++) { S(x, 0, 19, 'minecraft:stripped_spruce_log[axis=x]'); S(x, 0, 24, 'minecraft:stripped_spruce_log[axis=x]') } F(18, 0, 20, 18, 0, 23, 'minecraft:stripped_spruce_log[axis=z]'); F(23, 0, 20, 23, 0, 23, 'minecraft:stripped_spruce_log[axis=z]')
  S(20, 0, 21, 'minecraft:decorated_pot'); S(22, 0, 22, 'minecraft:red_carpet'); for (var x = 18; x <= 23; x++) for (var z = 19; z <= 24; z++) delete HV[x + ',' + z]
  // abri a velos
  F(2, 0, 24, 2, 2, 24, 'minecraft:spruce_fence'); F(9, 0, 24, 9, 2, 24, 'minecraft:spruce_fence'); F(2, 0, 28, 2, 2, 28, 'minecraft:spruce_fence'); F(9, 0, 28, 9, 2, 28, 'minecraft:spruce_fence'); F(2, 3, 24, 9, 3, 28, 'minecraft:smooth_stone_slab[type=bottom]')
  for (var x = 3; x <= 8; x += 2) { S(x, 0, 26, 'minecraft:iron_bars'); S(x, 0, 27, 'minecraft:iron_bars') } for (var x = 2; x <= 9; x++) for (var z = 24; z <= 28; z++) delete HV[x + ',' + z]
  // jardins ouvriers
  for (var x = 19; x <= 29; x++) for (var z = 26; z <= 30; z++) { delete HV[x + ',' + z]; if (x == 24 && z == 28) { S(x, -1, z, 'minecraft:water'); continue } S(x, -1, z, 'minecraft:farmland[moisture=7]'); var r = R(); SA(x, 0, z, r < 0.35 ? 'minecraft:wheat[age=' + Math.floor(R() * 8) + ']' : r < 0.55 ? 'minecraft:carrots[age=' + Math.floor(R() * 8) + ']' : r < 0.7 ? 'minecraft:potatoes[age=7]' : r < 0.8 ? 'minecraft:short_grass'.replace('short_grass', 'beetroots[age=3]') : AIR) }
  for (var x = 18; x <= 30; x++) { S(x, 0, 25, 'minecraft:spruce_fence'); S(x, 0, 31, 'minecraft:spruce_fence') } for (var z = 26; z <= 30; z++) { S(18, 0, z, 'minecraft:spruce_fence'); S(30, 0, z, 'minecraft:spruce_fence') } S(24, 0, 25, 'minecraft:spruce_fence_gate[facing=north,open=true]')
  S(29, 0, 26, 'minecraft:composter[level=4]'); S(19, 0, 30, 'minecraft:barrel[facing=up,open=false]')
  hbPlatane(6, 32 - 1 - 0, 6); hbPlatane(28, 18, 6); gtBanc(11, 14, 'south', 3); gtBanc(11, 21, 'north', 3)
  hbVeg(0, 11, 31, 31, 0.5)
}
