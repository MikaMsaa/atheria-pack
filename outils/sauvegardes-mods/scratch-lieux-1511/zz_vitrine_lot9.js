
// ================= TOUR DE BUREAUX EN VERRE (2 x 2 chunks, R+9) =================
function tourBureaux() {
  var VE = 'minecraft:cyan_stained_glass', MU = 'minecraft:light_gray_concrete', BA = 'minecraft:smooth_quartz', SOL = 'minecraft:polished_andesite'
  var VP = 'minecraft:light_gray_stained_glass_pane', PV = 'mcwdoors:birch_glass_door', BW = ['oak', 'birch', 'dark_oak', 'spruce']
  function rideau(x1, z1, x2, z2, y, sans) {
    for (var yy = y + 1; yy <= y + 5; yy++) {
      for (var x = x1; x <= x2; x++) [z1, z2].forEach(z => { if (sans && z == sans) return; S(x, yy, z, x == x1 || x == x2 || yy == y + 5 || (x - x1) % 3 == 0 ? MU : VE) })
      for (var z = z1 + 1; z < z2; z++) [x1, x2].forEach(x => S(x, yy, z, yy == y + 5 || (z - z1) % 3 == 0 ? MU : VE))
    }
  }
  function bac(x, y, z, p) { S(x, y, z, 'minecraft:moss_block'); S(x, y + 1, z, p || choix(['minecraft:flowering_azalea', 'minecraft:azalea', 'minecraft:fern'])) }
  // sol du terrain
  F(0, -1, 0, 31, -1, 31, 'minecraft:gray_concrete'); F(0, -1, 0, 31, -1, 3, 'minecraft:grass_block')
  for (var x = 0; x <= 31; x++) for (var z = 29; z <= 31; z++) S(x, -1, z, (x + z) % 2 ? 'minecraft:smooth_stone' : 'minecraft:polished_andesite')
  ;[6, 9, 12, 15, 18].forEach(z => F(0, -1, z, 4, -1, z, 'minecraft:white_concrete'))
  // etages
  for (var k = 0; k <= 9; k++) {
    var y = 6 * k, zS = k >= 7 ? 17 : 22, zD = k >= 8 ? 17 : 22
    F(7, y, 5, 24, y, zD, SOL); W(7, 5, 24, zD, y, y, BA)
    rideau(7, 5, 24, zS, y)
  }
  F(7, 60, 5, 24, 60, 17, SOL); W(7, 5, 24, 17, 60, 61, BA)
  tour(15, 7, 9, MU)
  for (var k = 0; k <= 9; k++) {
    var y = 6 * k, zS = k >= 7 ? 17 : 22, w = choix(BW), w2 = choix(BW), etat = k == 5 ? 1 : 0
    // noyau : cage d'escalier, ascenseur, sanitaires
    F(14, y + 1, 12, 17, y + 5, 12, MU); F(15, y + 1, 12, 16, y + 3, 12, AIR)
    F(18, y + 1, 6, 20, y + 5, 12, MU); PORTE(19, y + 1, 12, 'minecraft:iron_door', 'south', 'left', 'false'); S(20, y + 2, 13, 'minecraft:stone_button[face=wall,facing=south,powered=false]')
    F(21, y + 1, 12, 23, y + 5, 12, MU); PORTE(22, y + 1, 12, 'minecraft:birch_door', 'south', 'left', 'false')
    for (var x = 21; x <= 23; x++) for (var z = 6; z <= 11; z++) S(x, y, z, (x + z) % 2 ? 'minecraft:smooth_quartz' : 'minecraft:polished_diorite')
    S(21, y + 1, 6, 'minecraft:quartz_stairs[facing=north,half=bottom,shape=straight]'); S(23, y + 1, 6, 'minecraft:quartz_stairs[facing=north,half=bottom,shape=straight]'); F(22, y + 1, 6, 22, y + 3, 7, 'minecraft:white_concrete')
    S(23, y + 1, 9, 'mcwfurnitures:birch_kitchen_sink[facing=west,water=false]'); S(23, y + 1, 10, 'mcwfurnitures:birch_kitchen_sink[facing=west,water=false]'); S(21, y + 1, 11, 'minecraft:potted_bamboo')
    // zone ouest (x8..13 z6..11) derriere une cloison vitree
    F(8, y + 1, 12, 13, y + 5, 12, VP); PORTE(12, y + 1, 12, PV, 'south', 'left', 'false')
    if (k == 0) {
      F(9, 1, 7, 11, 1, 7, 'mcwfurnitures:dark_oak_desk[facing=north,connection=single]'); F(9, 2, 7, 11, 2, 7, 'minecraft:black_stained_glass_pane'); S(9, 1, 8, MAT('oak_modern_chair', 'north')); S(11, 1, 8, MAT('oak_modern_chair', 'north'))
      F(8, 1, 10, 8, 2, 11, 'minecraft:barrel[facing=east,open=false]'); S(13, 1, 6, 'minecraft:chest[facing=west]'); S(8, 1, 6, 'minecraft:potted_fern')
    } else if (k % 3 == 1) {
      F(9, y + 1, 8, 12, y + 1, 9, 'mcwfurnitures:' + w + '_glass_table'); for (var x = 9; x <= 12; x++) { S(x, y + 1, 7, MAT(w2 + '_modern_chair', 'south')); S(x, y + 1, 10, MAT(w2 + '_modern_chair', 'north')) }
      S(8, y + 1, 8, MAT(w2 + '_modern_chair', 'east')); S(13, y + 1, 9, MAT(w2 + '_modern_chair', 'west')); S(8, y + 1, 6, 'minecraft:potted_bamboo'); S(13, y + 1, 6, 'minecraft:potted_azalea_bush'); S(10, y + 2, 8, 'minecraft:heavy_weighted_pressure_plate'); S(11, y + 2, 9, 'supplementaries:book_pile')
    } else if (k % 3 == 2) {
      ;[7, 9].forEach(z => F(8, y + 1, z, 11, y + 3, z, 'minecraft:bookshelf')); F(8, y + 1, 11, 10, y + 1, 11, 'minecraft:barrel[facing=up,open=false]'); S(13, y + 1, 6, 'minecraft:chest[facing=west]'); S(13, y + 1, 8, 'minecraft:ladder[facing=west]'.replace('minecraft:ladder[facing=west]', 'minecraft:decorated_pot'))
      if (etat) { S(9, y + 1, 8, 'supplementaries:sack'); S(11, y + 1, 10, 'minecraft:white_carpet') }
    } else {
      S(9, y + 1, 8, 'mcwfurnitures:' + w + '_table'); S(10, y + 1, 8, 'mcwfurnitures:' + w + '_table'); S(9, y + 1, 7, MAT(w + '_chair', 'south')); S(9, y + 1, 9, MAT(w2 + '_modern_chair', 'north')); S(10, y + 1, 9, MAT(w2 + '_modern_chair', 'north'))
      S(9, y + 2, 8, 'minecraft:heavy_weighted_pressure_plate'); S(10, y + 2, 8, 'supplementaries:book_pile'); F(13, y + 1, 7, 13, y + 1, 9, 'mcwfurnitures:' + choix(CANAPES) + '_couch[facing=west,shape=single]'); S(12, y + 1, 8, 'mcwfurnitures:' + w + '_coffee_table')
      F(8, y + 1, 6, 8, y + 2, 8, 'minecraft:bookshelf'); S(8, y + 1, 11, 'minecraft:potted_azalea_bush'); S(11, y + 1, 6, 'supplementaries:globe')
    }
    // plateau principal (z13..zS-1)
    if (k == 0) {
      for (var x = 8; x <= 23; x++) for (var z = 13; z <= 21; z++) S(x, 0, z, (x + z) % 2 ? 'minecraft:smooth_quartz' : 'minecraft:polished_diorite')
      F(9, 1, 16, 13, 1, 16, 'minecraft:smooth_quartz_slab[type=top]'); S(13, 1, 15, 'minecraft:smooth_quartz_slab[type=top]'); S(11, 1, 15, MAT('dark_oak_modern_chair', 'south')); S(10, 2, 16, 'minecraft:heavy_weighted_pressure_plate'); S(12, 2, 16, 'minecraft:potted_white_tulip')
      F(18, 1, 20, 20, 1, 20, 'mcwfurnitures:black_couch[facing=north,shape=single]'); S(19, 1, 19, 'mcwfurnitures:dark_oak_coffee_table'); S(17, 1, 19, MAT('dark_oak_modern_chair', 'east')); S(21, 1, 19, MAT('dark_oak_modern_chair', 'west')); S(19, 2, 19, 'supplementaries:book_pile')
      bac(8, 1, 21); bac(23, 1, 21); bac(13, 1, 21); bac(18, 1, 21); bac(8, 1, 14); bac(23, 1, 14)
      PORTE(15, 1, 22, PV, 'south', 'left', 'false'); PORTE(16, 1, 22, PV, 'south', 'right', 'false'); PORTE(24, 1, 19, 'minecraft:iron_door', 'east', 'left', 'false')
    } else if (k % 3 == 1) {
      var rangs = zS == 22 ? [14, 18] : [14]
      F(8, y + 1, 13, 23, y + 1, zS - 1, 'minecraft:gray_carpet')
      rangs.forEach(r => { for (var x = 8; x <= 21; x++) if ((x - 8) % 5 < 4) { S(x, y + 1, r, 'mcwfurnitures:' + w + '_desk[facing=north,connection=single]'); var p = R(); if (p < 0.55) S(x, y + 2, r, 'minecraft:heavy_weighted_pressure_plate'); else if (p < 0.75) S(x, y + 2, r, 'supplementaries:book_pile'); else if (p < 0.85) S(x, y + 2, r, 'minecraft:potted_cactus'); S(x, y + 1, r + 1, MAT(w2 + '_modern_chair', 'north')) } })
      S(23, y + 1, 13, 'minecraft:dropper[facing=up,triggered=false]'); S(23, y + 1, 15, 'minecraft:water_cauldron[level=3]'); S(22, y + 1, 16, 'minecraft:potted_bamboo')
      if (zS == 22) { F(9, y + 1, 21, 11, y + 1, 21, 'mcwfurnitures:' + choix(CANAPES) + '_couch[facing=north,shape=single]'); S(10, y + 1, 20, 'mcwfurnitures:' + w + '_coffee_table'); bac(13, y + 1, 21); bac(23, y + 1, 21); S(17, y + 1, 21, 'minecraft:potted_azalea_bush'); S(20, y + 1, 21, 'minecraft:potted_fern') }
    } else if (k % 3 == 2) {
      F(9, y + 1, 14, 13, y + 1, 14, 'mcwfurnitures:' + w + '_glass_table'); for (var x = 9; x <= 13; x++) { S(x, y + 1, 15, MAT(w2 + '_modern_chair', 'north')); if (x <= 11) S(x, y + 1, 13, MAT(w2 + '_modern_chair', 'south')) }
      S(8, y + 1, 14, MAT(w2 + '_modern_chair', 'east')); S(14, y + 1, 14, MAT(w2 + '_modern_chair', 'west')); S(11, y + 2, 14, 'minecraft:potted_white_tulip')
      S(23, y + 1, 13, 'minecraft:dropper[facing=up,triggered=false]'); S(23, y + 1, 14, 'minecraft:barrel[facing=up,open=false]'); S(23, y + 1, 16, 'minecraft:potted_bamboo')
      if (zS == 22) {
        F(8, y + 1, 17, 23, y + 5, 17, VP); F(12, y + 1, 18, 12, y + 5, 21, VP); F(17, y + 1, 18, 17, y + 5, 21, VP)
        ;[11, 16, 18].forEach(x => PORTE(x, y + 1, 17, PV, 'north', 'left', 'false'))
        ;[[8, 9], [13, 14]].forEach(c => { var a = c[0]; S(a + 1, y + 1, 19, 'mcwfurnitures:' + w + '_desk[facing=north,connection=single]'); S(a + 1, y + 2, 19, 'minecraft:heavy_weighted_pressure_plate'); S(a + 1, y + 1, 20, MAT(w2 + '_modern_chair', 'north')); S(a + 1, y + 1, 18, MAT(w + '_chair', 'south')); F(a, y + 1, 21, a, y + 2, 21, 'minecraft:bookshelf'); S(a + 3, y + 1, 21, 'minecraft:potted_fern'); S(a + 3, y + 1, 19, 'minecraft:barrel[facing=up,open=false]') })
        S(20, y + 1, 19, 'mcwfurnitures:dark_oak_desk[facing=north,connection=single]'); S(21, y + 1, 19, 'mcwfurnitures:dark_oak_desk[facing=north,connection=single]'); S(20, y + 2, 19, 'minecraft:heavy_weighted_pressure_plate'); S(21, y + 2, 19, 'supplementaries:globe_sepia'); S(20, y + 1, 20, MAT('dark_oak_modern_chair', 'north'))
        F(23, y + 1, 18, 23, y + 1, 20, 'mcwfurnitures:brown_couch[facing=west,shape=single]'); F(18, y + 1, 21, 19, y + 3, 21, 'minecraft:bookshelf'); S(23, y + 1, 21, 'minecraft:potted_azalea_bush'); F(18, y, 18, 23, y, 21, 'minecraft:dark_oak_planks')
      } else { F(18, y + 1, 16, 20, y + 1, 16, 'mcwfurnitures:gray_couch[facing=north,shape=single]'); S(19, y + 1, 15, 'mcwfurnitures:' + w + '_coffee_table'); bac(22, y + 1, 16) }
      if (etat) { for (var i = 0; i < 6; i++) S(8 + Math.floor(R() * 15), y + 1, 16, choix(['supplementaries:sack', 'minecraft:white_carpet', 'minecraft:white_carpet'])) }
    } else {
      if (zS == 22) {
        for (var x = 8; x <= 16; x++) for (var z = 18; z <= 21; z++) S(x, y, z, (x + z) % 2 ? 'minecraft:white_concrete' : 'minecraft:light_gray_concrete')
        for (var x = 8; x <= 13; x++) S(x, y + 1, 21, x == 9 ? 'mcwfurnitures:' + w + '_kitchen_sink[facing=north,water=false]' : MAT(w + '_counter', 'north'))
        S(8, y + 2, 21, 'farmersdelight:cutting_board[facing=north]'); S(11, y + 2, 21, 'farmersdelight:cooking_pot'); S(13, y + 2, 21, 'supplementaries:jar'); S(14, y + 1, 21, 'minecraft:barrel[facing=north,open=false]'); S(15, y + 1, 21, 'minecraft:potted_bamboo')
        ;[10, 15].forEach(x => { S(x, y + 1, 19, 'mcwfurnitures:' + w2 + '_table'); S(x - 1, y + 1, 19, MAT(w2 + '_chair', 'east')); S(x + 1, y + 1, 19, MAT(w2 + '_chair', 'west')); S(x, y + 2, 19, 'minecraft:candle[candles=1,lit=false]') })
        F(17, y + 1, 17, 23, y + 5, 17, VP); F(17, y + 1, 18, 17, y + 5, 21, VP); PORTE(18, y + 1, 17, PV, 'north', 'left', 'false')
        for (var x = 19; x <= 23; x++) { F(x, y + 1, 19, x, y + 3, 19, x % 2 ? 'minecraft:observer[facing=north,powered=false]' : 'minecraft:polished_basalt[axis=y]'); F(x, y + 1, 21, x, y + 2, 21, 'minecraft:black_concrete') }
        S(18, y + 1, 21, 'minecraft:iron_block'); S(18, y + 2, 21, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false,powered=false,waterlogged=false]')
        F(9, y + 1, 16, 11, y + 1, 16, 'mcwfurnitures:' + choix(CANAPES) + '_couch[facing=north,shape=single]'); S(10, y + 1, 15, 'mcwfurnitures:' + w + '_coffee_table'); bac(13, y + 1, 16); S(23, y + 1, 14, 'minecraft:potted_fern'); S(22, y + 1, 16, 'minecraft:jukebox')
      } else {
        F(8, y + 1, 13, 11, y + 1, 13, MAT(w + '_counter', 'south')); S(9, y + 2, 13, 'supplementaries:jar'); S(10, y + 2, 13, 'minecraft:potted_white_tulip')
        F(8, y + 1, 15, 11, y + 1, 15, 'minecraft:smooth_quartz_slab[type=top]'); F(8, y + 1, 16, 11, y + 1, 16, 'mcwfurnitures:' + w2 + '_stool_chair')
        F(18, y + 1, 16, 21, y + 1, 16, 'mcwfurnitures:white_couch[facing=north,shape=single]'); S(19, y + 1, 14, 'mcwfurnitures:' + w + '_coffee_table'); S(20, y + 1, 14, 'mcwfurnitures:' + w + '_coffee_table'); S(23, y + 1, 15, MAT(w2 + '_modern_chair', 'west')); bac(23, y + 1, 13); bac(13, y + 1, 16)
      }
    }
  }
  // eclairage encastre
  for (var k = 0; k <= 9; k++) {
    var y = 6 * k, zS = k >= 7 ? 17 : 22
    ;[9, 13, 17, 21].forEach(x => { S(x, y + 6, 14, 'minecraft:sea_lantern'); if (zS == 22) { if (k == 6) S(x, y + 5, 19, 'minecraft:lantern[hanging=true]'); else S(x, y + 6, 19, 'minecraft:sea_lantern') } })
    S(10, y + 6, 9, 'minecraft:sea_lantern'); S(22, y + 6, 9, 'minecraft:sea_lantern')
  }
  // terrasse du 7e (z18..22)
  F(8, 42, 18, 23, 42, 21, 'minecraft:spruce_planks'); F(7, 43, 22, 24, 43, 22, VP); F(7, 43, 18, 7, 43, 21, VP); F(24, 43, 18, 24, 43, 21, VP)
  for (var x = 8; x <= 23; x++) if (x < 18 || x > 20) bac(x, 43, 21)
  PORTE(12, 43, 17, PV, 'south', 'left', 'false'); PORTE(20, 43, 17, PV, 'south', 'left', 'false')
  ;[9, 10, 14, 15].forEach(x => S(x, 43, 19, 'mcwfurnitures:white_couch[facing=south,shape=single]'))
  S(17, 43, 19, 'mcwfurnitures:birch_table'); S(16, 43, 19, MAT('birch_chair', 'east')); S(18, 43, 19, MAT('birch_chair', 'west')); S(17, 44, 19, 'minecraft:candle[candles=3,lit=false]')
  F(22, 43, 19, 22, 46, 19, 'minecraft:birch_log[axis=y]'); for (var dx = -1; dx <= 1; dx++) for (var dz = -1; dz <= 1; dz++) { SA(22 + dx, 46, 19 + dz, 'minecraft:birch_leaves[persistent=true]'); if (Math.abs(dx) + Math.abs(dz) <= 1) SA(22 + dx, 47, 19 + dz, 'minecraft:birch_leaves[persistent=true]') }
  // toit technique
  F(14, 61, 6, 20, 64, 12, MU); PORTE(15, 61, 12, 'minecraft:iron_door', 'south', 'left', 'false'); F(14, 65, 6, 20, 65, 12, BA)
  F(9, 61, 7, 11, 62, 9, 'minecraft:iron_block'); F(9, 63, 7, 11, 63, 9, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false,powered=false,waterlogged=false]')
  F(22, 61, 7, 23, 62, 8, 'minecraft:iron_block'); F(22, 63, 7, 23, 63, 8, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false,powered=false,waterlogged=false]')
  for (var x = 9; x <= 22; x++) for (var z = 14; z <= 16; z++) if (x != 15 && x != 16) S(x, 61, z, 'minecraft:daylight_detector[inverted=false,power=0]')
  F(18, 66, 9, 18, 72, 9, 'minecraft:iron_bars'); S(18, 73, 9, 'minecraft:lightning_rod[facing=up,powered=false,waterlogged=false]'); S(19, 66, 9, 'minecraft:iron_bars'); S(17, 66, 9, 'minecraft:iron_bars')
  // atrium vitre devant la tour (x3..28 z23..28)
  F(3, 0, 23, 28, 0, 28, 'minecraft:polished_diorite'); for (var x = 4; x <= 27; x++) if (x % 4 == 1) F(x, 0, 23, x, 0, 27, 'minecraft:smooth_quartz')
  F(3, 0, 22, 6, 0, 22, 'minecraft:polished_diorite'); F(25, 0, 22, 28, 0, 22, 'minecraft:polished_diorite')
  rideau(3, 22, 28, 28, 0, 22); F(3, 1, 22, 6, 5, 22, MU); F(25, 1, 22, 28, 5, 22, MU)
  for (var x = 3; x <= 28; x++) for (var z = 22; z <= 28; z++) { if (z == 22 && x >= 7 && x <= 24) continue; S(x, 6, z, x == 3 || x == 28 || z == 28 || z == 22 || x % 4 == 3 ? BA : 'minecraft:light_blue_stained_glass') }
  PORTE(15, 1, 28, PV, 'south', 'left', 'false'); PORTE(16, 1, 28, PV, 'south', 'right', 'false'); F(13, 5, 29, 18, 5, 30, 'minecraft:smooth_quartz_slab[type=top]')
  for (var x = 21; x <= 26; x++) S(x, 1, 24, x == 23 ? 'mcwfurnitures:birch_kitchen_sink[facing=south,water=false]' : MAT('birch_counter', 'south'))
  S(21, 2, 24, 'farmersdelight:cooking_pot'); S(25, 2, 24, 'supplementaries:jar'); S(26, 2, 24, 'minecraft:potted_white_tulip'); F(21, 1, 23, 26, 1, 23, 'minecraft:barrel[facing=south,open=false]'); F(21, 2, 23, 26, 2, 23, 'mcwfurnitures:birch_kitchen_cabinet[facing=south,hinge=left]')
  F(21, 1, 25, 26, 1, 25, 'mcwfurnitures:birch_stool_chair'); ;[22, 25].forEach(x => { S(x, 1, 27, 'mcwfurnitures:birch_table'); S(x - 1, 1, 27, MAT('birch_chair', 'east')); S(x + 1, 1, 27, MAT('birch_chair', 'west')); S(x, 2, 27, 'minecraft:candle[candles=1,lit=false]') })
  F(4, 1, 24, 4, 1, 26, 'mcwfurnitures:gray_couch[facing=east,shape=single]'); S(5, 1, 25, 'mcwfurnitures:birch_coffee_table'); S(5, 2, 25, 'supplementaries:book_pile'); S(6, 1, 27, MAT('birch_modern_chair', 'north'))
  ;[[10, 24], [10, 27], [19, 24], [19, 27], [4, 27], [27, 27]].forEach(c => bac(c[0], 1, c[1])); ;[[11, 25], [18, 25]].forEach(c => { S(c[0], 1, c[1], 'minecraft:moss_block'); S(c[0], 2, c[1], 'minecraft:birch_log[axis=y]'); S(c[0], 3, c[1], 'minecraft:birch_leaves[persistent=true]') })
  // parvis, parking, cour de service
  ;[2, 12, 19, 29].forEach(x => { F(x, 0, 30, x, 3, 30, 'minecraft:polished_blackstone_wall'); S(x, 4, 30, 'minecraft:lantern') })
  ;[24, 25, 26, 27].forEach(x => S(x, 0, 30, 'minecraft:iron_bars')); ;[7, 9, 22].forEach(x => S(x, 0, 29, 'minecraft:stone_brick_wall'))
  ;[[1, 8], [2, 13], [1, 19]].forEach(c => { F(c[0], 0, c[1], c[0] + 2, 0, c[1] + 1, 'minecraft:' + choix(['red', 'white', 'blue', 'black']) + '_concrete'); F(c[0], 1, c[1], c[0] + 1, 1, c[1] + 1, 'minecraft:black_stained_glass') })
  F(27, 0, 8, 29, 1, 10, 'minecraft:iron_block'); S(28, 2, 9, 'minecraft:iron_bars'); S(28, 3, 9, 'minecraft:iron_bars'); F(27, 0, 14, 28, 0, 15, 'minecraft:green_terracotta'); F(27, 0, 17, 29, 0, 17, 'minecraft:barrel[facing=up,open=false]'); S(28, 1, 17, 'minecraft:barrel[facing=up,open=false]')
  ;[[3, 1], [28, 2]].forEach(c => { F(c[0], 0, c[1], c[0], 3, c[1], 'minecraft:birch_log[axis=y]'); for (var dx = -1; dx <= 1; dx++) for (var dz = -1; dz <= 1; dz++) { SA(c[0] + dx, 3, c[1] + dz, 'minecraft:birch_leaves[persistent=true]'); SA(c[0] + dx, 4, c[1] + dz, 'minecraft:birch_leaves[persistent=true]') } SA(c[0], 5, c[1], 'minecraft:birch_leaves[persistent=true]') })
}
