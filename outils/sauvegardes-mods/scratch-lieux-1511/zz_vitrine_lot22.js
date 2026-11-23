
// ================= GARE (batiment voyageurs en brique, halle voutee de verre, trois voies, train abandonne) =================
// Voies (est-ouest) : A rail z2, B rail z10, C rail z18 ; quais P1 z4..7, P2 z13..16, P3 z20..21 ; batiment voyageurs z22..29.
function hbGare() {
  function p(z) { return 16 - Math.floor((z - 10.5) * (z - 10.5) / 17) }
  for (var x = 0; x <= 31; x++) { S(x, -1, 30, R() < 0.8 ? 'minecraft:smooth_stone' : 'minecraft:polished_andesite'); S(x, -1, 31, R() < 0.8 ? 'minecraft:smooth_stone' : 'minecraft:andesite') }
  // ---- voies, ballast, traverses ----
  ;[2, 10, 18].forEach(zr => {
    var z1 = zr == 10 ? 8 : zr - 1, z2 = zr == 10 ? 12 : zr + 1
    for (var x = 0; x <= 31; x++) for (var z = z1; z <= z2; z++) {
      var r = R(); S(x, -1, z, x % 2 == 0 && Math.abs(z - zr) <= 1 ? 'minecraft:stripped_spruce_log[axis=z]' : r < 0.9 ? 'minecraft:gravel' : 'minecraft:coarse_dirt')
      if (r >= 0.9 && Math.abs(z - zr) > 1) S(x, 0, z, 'minecraft:short_grass')
    }
    F(0, -1, zr, 31, -1, zr, 'minecraft:stripped_spruce_log[axis=x]'); F(0, 0, zr, 31, 0, zr, 'minecraft:rail[shape=east_west]')
  })
  // ---- quais ----
  ;[[4, 7], [13, 16], [20, 21]].forEach(q => {
    for (var x = 0; x <= 31; x++) for (var z = q[0]; z <= q[1]; z++) S(x, 0, z, z == q[0] || z == q[1] ? 'minecraft:polished_andesite' : (R() < 0.85 ? 'minecraft:smooth_stone' : 'minecraft:stone'))
    F(0, -1, q[0], 31, -1, q[1], 'minecraft:stone')
    if (q[0] != 20) { F(0, 1, q[0], 31, 1, q[0], 'minecraft:yellow_carpet'); F(0, 1, q[1], 31, 1, q[1], 'minecraft:yellow_carpet') } else F(0, 1, 20, 31, 1, 20, 'minecraft:yellow_carpet')
  })
  // ---- mur nord, halle voutee : verre, fermes de fonte tous les 6, colonnes sur les quais ----
  for (var x = 1; x <= 30; x++) for (var y = 0; y <= 9; y++) S(x, y, 0, x % 6 == 0 ? HC : (x % 6 == 3 && y >= 3 && y <= 6) ? GP : hbM(HBR))
  for (var x = 1; x <= 30; x++) for (var z = 0; z <= 21; z++) {
    var lo = p(z); if (z > 0) lo = Math.min(lo, p(z - 1) + 1); if (z < 21) lo = Math.min(lo, p(z + 1) + 1)
    for (var y = lo; y <= p(z); y++) S(x, y, z, x % 6 == 0 ? 'minecraft:polished_blackstone' : (R() < 0.15 ? 'minecraft:gray_stained_glass' : 'minecraft:glass'))
  }
  // tympans vitres aux deux bouts, la partie basse reste ouverte au passage des trains
  ;[1, 30].forEach(x => { for (var z = 0; z <= 21; z++) { S(x, 7, z, 'minecraft:polished_blackstone'); for (var y = 8; y < p(z); y++) S(x, y, z, z % 4 == 1 ? 'minecraft:iron_bars' : GP) } })
  for (var x = 3; x <= 27; x += 6) [6, 14].forEach(z => { F(x, 1, z, x, p(z) - 2, z, 'minecraft:polished_deepslate_wall'); S(x, p(z) - 1, z, 'minecraft:polished_deepslate') })
  // suspensions sous les fermes
  ;[6, 18].forEach(x => [5, 15].forEach(z => { F(x, 7, z, x, p(z) - 1, z, 'minecraft:chain[axis=y]'); S(x, 6, z, HLH) }))
  // ---- materiel roulant ----
  // voiture voyageurs verte x4..18 z8..12
  var VG = 'minecraft:green_concrete'
  ;[5, 6, 16, 17].forEach(x => { for (var z = 8; z <= 12; z++) if (z != 10) S(x, 0, z, 'minecraft:polished_blackstone') })
  F(4, 1, 8, 18, 1, 12, 'minecraft:black_concrete'); F(5, 1, 9, 17, 1, 11, 'minecraft:spruce_planks')
  for (var x = 4; x <= 18; x++) for (var y = 2; y <= 4; y++) { var b = y == 3 && x > 4 && x < 18 ? GP : VG; S(x, y, 8, b); S(x, y, 12, b) }
  F(4, 2, 9, 4, 4, 11, VG); F(18, 2, 9, 18, 4, 11, VG); S(4, 3, 10, GP); S(18, 3, 10, GP)
  ;[5, 17].forEach(x => { F(x, 2, 8, x, 3, 8, AIR); F(x, 2, 12, x, 3, 12, AIR) })
  F(4, 5, 8, 18, 5, 8, 'minecraft:smooth_stone_slab[type=bottom]'); F(4, 5, 12, 18, 5, 12, 'minecraft:smooth_stone_slab[type=bottom]'); F(4, 5, 9, 18, 5, 11, 'minecraft:light_gray_concrete')
  for (var x = 7; x <= 14; x += 3) [9, 11].forEach(z => { S(x, 2, z, hbE('minecraft:spruce', 'west')); S(x + 1, 2, z, 'mcwfurnitures:oak_end_table'); S(x + 2, 2, z, hbE('minecraft:spruce', 'east')) })
  S(9, 4, 10, HLH); S(13, 4, 10, HLH); S(8, 3, 9, 'minecraft:brown_shulker_box'); S(12, 2, 10, 'minecraft:white_carpet'); S(15, 2, 10, 'supplementaries:book_pile')
  // locomotive diesel rouge x22..30 z9..11
  ;[23, 29].forEach(x => { S(x, 0, 9, 'minecraft:polished_blackstone'); S(x, 0, 11, 'minecraft:polished_blackstone') })
  F(22, 1, 9, 30, 1, 11, 'minecraft:black_concrete')
  W(22, 9, 24, 11, 2, 4, 'minecraft:red_concrete'); F(23, 2, 10, 23, 4, 10, AIR); S(22, 3, 10, GP); S(23, 3, 9, GP); S(23, 3, 11, GP); F(22, 5, 9, 24, 5, 11, 'minecraft:red_concrete')
  S(23, 2, 10, hbE('minecraft:spruce', 'west')); S(23, 4, 10, HLH)
  F(25, 2, 9, 30, 3, 11, 'minecraft:red_concrete'); for (var x = 25; x <= 30; x += 2) { S(x, 2, 9, 'minecraft:yellow_concrete'); S(x, 2, 11, 'minecraft:yellow_concrete') }
  F(26, 4, 10, 29, 4, 10, 'minecraft:iron_bars'); S(30, 3, 10, 'minecraft:redstone_lamp'); S(31, 1, 9, 'minecraft:polished_blackstone_wall'); S(31, 1, 11, 'minecraft:polished_blackstone_wall')
  // wagon couvert eventre sur la voie C, caisses repandues sur le quai
  ;[9, 14].forEach(x => { S(x, 0, 17, 'minecraft:polished_blackstone'); S(x, 0, 19, 'minecraft:polished_blackstone') })
  F(8, 1, 17, 15, 1, 19, 'minecraft:spruce_planks'); W(8, 17, 15, 19, 2, 4, 'minecraft:stripped_spruce_wood'); F(8, 5, 17, 15, 5, 19, 'minecraft:spruce_slab[type=bottom]')
  F(11, 2, 17, 12, 4, 17, AIR); S(9, 2, 18, 'minecraft:barrel[facing=up,open=false]'); S(13, 2, 18, 'supplementaries:sack'); S(14, 2, 18, 'minecraft:barrel[facing=up,open=false]'); S(10, 2, 18, 'minecraft:chest[facing=north]')
  ;[[11, 16], [12, 15], [10, 14], [13, 16]].forEach(q => S(q[0], 1, q[1], choix(['minecraft:barrel[facing=up,open=false]', 'supplementaries:sack', 'minecraft:barrel[facing=north,open=true]'])))
  // heurtoirs, signal, valises, bancs de quai
  ;[2, 18].forEach(z => { S(0, 0, z, 'minecraft:red_concrete'); S(0, 0, z - 1, 'minecraft:polished_blackstone_wall'); S(0, 0, z + 1, 'minecraft:polished_blackstone_wall'); S(0, 1, z, 'minecraft:polished_blackstone_slab[type=bottom]') })
  F(29, 1, 5, 29, 4, 5, 'minecraft:polished_blackstone_wall'); S(29, 5, 5, 'minecraft:redstone_lamp'); S(29, 6, 5, 'minecraft:polished_blackstone_slab[type=bottom]')
  ;[[7, 5], [20, 6], [24, 14], [2, 15], [15, 21]].forEach(q => S(q[0], 1, q[1], choix(['minecraft:brown_shulker_box', 'minecraft:black_shulker_box', 'minecraft:red_shulker_box', 'supplementaries:sack'])))
  ;[[10, 5], [22, 5], [8, 15], [20, 15]].forEach(b => { F(b[0], 1, b[1], b[0] + 2, 1, b[1], hbE('minecraft:spruce', b[1] == 5 ? 'north' : 'south')); S(b[0] - 1, 1, b[1], 'minecraft:spruce_trapdoor[facing=west,half=bottom,open=true]'); S(b[0] + 3, 1, b[1], 'minecraft:spruce_trapdoor[facing=east,half=bottom,open=true]') })
  for (var i = 0; i < 18; i++) { var x = Math.floor(R() * 32), z = choix([5, 6, 14, 15, 21]); SA(x, 1, z, choix(['minecraft:white_carpet', 'minecraft:light_gray_carpet', 'supplementaries:book_pile'])) }
  // ===== batiment voyageurs x3..28 z22..29 =====
  F(3, -1, 22, 28, -1, 29, 'minecraft:stone'); F(4, 0, 23, 27, 0, 28, 'minecraft:polished_andesite')
  for (var x = 13; x <= 18; x++) for (var z = 23; z <= 28; z++) S(x, 0, z, (x + z) % 2 ? 'minecraft:smooth_quartz' : 'minecraft:polished_deepslate')
  // ailes R+1 (x3..11 et x20..28), pavillon central (x12..19) haut de 19
  // aile x1..x2, pignon exterieur en xg
  function aile(x1, x2, xg) {
    for (var x = x1; x <= x2; x++) for (var y = 0; y <= 11; y++) {
      var coin = x == x1 || x == x2, fen = !coin && (x - x1) % 3 == 2 && ((y >= 2 && y <= 4) || (y >= 7 && y <= 10))
      S(x, y, 29, coin ? (y % 2 ? HC : HSB) : y == 5 || y == 11 ? HC : fen ? GP : hbM(HBR)); S(x, y, 22, coin ? (y % 2 ? HC : HSB) : y == 5 || y == 11 ? HC : fen && y > 5 ? GP : hbM(HBR))
    }
    for (var z = 23; z <= 28; z++) for (var y = 0; y <= 11; y++) S(xg, y, z, y == 5 || y == 11 ? HC : (z == 25 || z == 26) && y >= 7 && y <= 10 ? GP : hbM(HBR))
    var xa = Math.min(x1, x2) + (xg == x1 ? 1 : 0), xb = Math.max(x1, x2) - (xg == x2 ? 1 : 0)
    F(xa, 6, 23, xb, 6, 28, 'minecraft:spruce_planks'); F(xa, 12, 23, xb, 12, 28, 'minecraft:spruce_planks')
    gtToitX(x1, x2, 22, 29, 12, HZ); gtPignonX(xg, 22, 29, 12, HBR)
  }
  aile(3, 11, 3); aile(20, 28, 28)
  // pavillon
  for (var x = 12; x <= 19; x++) for (var y = 0; y <= 19; y++) { var c = x == 12 || x == 19; S(x, y, 29, c ? (y % 2 ? HC : HSB) : y == 19 ? HC : hbM(HBR)); S(x, y, 22, c ? (y % 2 ? HC : HSB) : y == 19 || y == 5 ? HC : hbM(HBR)) }
  for (var z = 23; z <= 28; z++) for (var y = 12; y <= 19; y++) { S(12, y, z, hbM(HBR)); S(19, y, z, hbM(HBR)) }
  F(12, 1, 23, 12, 11, 28, HBR); F(19, 1, 23, 19, 11, 28, HBR); F(13, 20, 23, 18, 20, 28, 'minecraft:spruce_planks')
  // grande baie en plein cintre, portes, horloge
  PORTE(14, 1, 29, HPV, 'south', 'left', 'true'); PORTE(15, 1, 29, HPV, 'south', 'right', 'false'); PORTE(16, 1, 29, HPV, 'south', 'left', 'false'); PORTE(17, 1, 29, HPV, 'south', 'right', 'true')
  F(13, 1, 29, 13, 4, 29, HC); F(18, 1, 29, 18, 4, 29, HC); F(14, 3, 29, 17, 4, 29, GP); F(13, 5, 29, 18, 5, 29, HC)
  F(13, 6, 29, 18, 11, 29, GP); F(14, 12, 29, 17, 12, 29, GP); F(15, 13, 29, 16, 13, 29, GP); S(13, 12, 29, HC); S(18, 12, 29, HC); S(14, 13, 29, HC); S(17, 13, 29, HC); F(15, 14, 29, 16, 14, 29, HCH)
  for (var y = 6; y <= 11; y++) S(15, y, 29, 'minecraft:iron_bars')
  F(14, 15, 29, 17, 18, 29, 'minecraft:white_concrete'); S(14, 15, 29, HC); S(17, 15, 29, HC); S(14, 18, 29, HC); S(17, 18, 29, HC)
  S(15, 17, 29, 'minecraft:gold_block'); S(15, 18, 29, 'minecraft:black_concrete'); S(16, 16, 29, 'minecraft:black_concrete'); F(14, 15, 30, 17, 15, 30, 'minecraft:smooth_sandstone_slab[type=top]')
  hbMansarde(12, 22, 19, 29, 20); F(15, 24, 25, 16, 24, 26, HZB); F(15, 25, 25, 16, 25, 26, HF)
  // marquise
  F(11, 5, 30, 20, 5, 31, 'minecraft:white_stained_glass'); S(11, 4, 31, 'minecraft:iron_bars'); S(20, 4, 31, 'minecraft:iron_bars')
  F(14, 0, 30, 17, 0, 30, hbE('minecraft:smooth_sandstone', 'north'))
  // portes vers le quai P3
  PORTE(14, 1, 22, HPV, 'north', 'left', 'false'); PORTE(15, 1, 22, HPV, 'north', 'right', 'true'); PORTE(16, 1, 22, HPV, 'north', 'left', 'false'); PORTE(17, 1, 22, HPV, 'north', 'right', 'false')
  F(14, 3, 22, 17, 4, 22, GP); PORTE(24, 1, 22, HPO, 'north', 'left', 'false'); PORTE(7, 1, 22, HPO, 'north', 'left', 'false')
  // hall : tableau des departs a palettes, bancs, lustre
  for (var x = 13; x <= 18; x++) for (var y = 7; y <= 10; y++) S(x, y, 23, R() < 0.3 ? choix(['minecraft:yellow_concrete', 'minecraft:white_concrete']) : 'minecraft:black_concrete')
  F(13, 6, 23, 18, 6, 23, 'minecraft:polished_blackstone_slab[type=top]')
  F(14, 1, 26, 17, 1, 26, hbE('minecraft:dark_oak', 'south')); F(14, 1, 27, 17, 1, 27, hbE('minecraft:dark_oak', 'north'))
  F(15, 12, 25, 15, 19, 25, 'minecraft:chain[axis=y]'); S(15, 11, 25, 'mcwlights:iron_chandelier'); S(16, 1, 24, 'minecraft:brown_shulker_box'); S(13, 1, 23, 'minecraft:potted_dead_bush'); S(18, 1, 23, 'minecraft:potted_dead_bush')
  // guichets (aile ouest) : hygiaphones dans le mur du hall
  ;[24, 26].forEach(z => { S(12, 2, z, 'minecraft:iron_bars'); S(11, 1, z, MAT('oak_counter', 'east')); S(10, 1, z, MAT('oak_chair', 'east')); S(13, 1, z, 'minecraft:white_carpet') })
  PORTE(12, 1, 28, HPO, 'east', 'left', 'false')
  S(7, 1, 26, 'mcwfurnitures:oak_table'); S(6, 1, 26, MAT('oak_chair', 'east')); S(7, 2, 26, 'supplementaries:book_pile'); F(8, 1, 23, 10, 1, 23, MAT('oak_drawer', 'south')); S(8, 2, 23, 'supplementaries:jar')
  S(10, 1, 28, 'minecraft:iron_block'); S(9, 1, 28, 'minecraft:chest[facing=north]'); S(8, 5, 25, HLH); for (var i = 0; i < 6; i++) SA(5 + Math.floor(R() * 6), 1, 24 + Math.floor(R() * 4), 'minecraft:white_carpet')
  // salle d'attente (aile est)
  PORTE(19, 1, 25, HPO, 'west', 'left', 'true')
  ;[24, 26].forEach(z => F(21, 1, z, 25, 1, z, hbE('minecraft:dark_oak', 'north'))); S(26, 1, 28, 'farmersdelight:stove[facing=north,lit=false]'); S(22, 1, 28, 'minecraft:potted_dead_bush'); S(23, 5, 25, HLH)
  ;[[21, 27], [24, 28], [25, 25]].forEach(q => SA(q[0], 1, q[1], choix(['minecraft:white_carpet', 'supplementaries:book_pile', 'minecraft:red_shulker_box'])))
  // escaliers vers l'etage (le long des murs pignons) et logement du chef de gare / bureaux
  ;[4, 27].forEach(xs => { for (var i = 0; i < 6; i++) { S(xs, 1 + i, 28 - i, hbE('minecraft:spruce', 'north')); if (i) S(xs, i, 28 - i, hbE('minecraft:spruce', 'south', 'top')) } F(xs, 6, 24, xs, 6, 28, AIR) })
  piece(cadreInv(5, 23, 11, 28, 'south', 6, 5), 'salon', 1)
  piece(cadre(20, 23, 26, 28, 'south', 6, 5), 'bureau', 1)
  hbBazar(5, 23, 10, 28, 13, 3); hbBazar(21, 23, 26, 28, 13, 3)
}
