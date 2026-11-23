
// ================= CASERNE / GARNISON (2 x 2 chunks) =================
function caserne() {
  var BE = 'minecraft:light_gray_concrete', BA = 'minecraft:stone_bricks', VT = 'minecraft:green_terracotta', SAC = 'supplementaries:sack'
  for (var x = 0; x <= 31; x++) for (var z = 0; z <= 31; z++) S(x, -1, z, choix(['minecraft:gravel', 'minecraft:coarse_dirt', 'minecraft:gravel', 'minecraft:andesite']))
  for (var x = 2; x <= 20; x++) for (var z = 15; z <= 24; z++) S(x, -1, z, (x + z) % 3 ? 'minecraft:smooth_stone' : 'minecraft:polished_andesite')
  // enceinte, barbeles, portail
  W(0, 0, 31, 31, 0, 2, 'minecraft:gray_concrete'); W(0, 0, 31, 31, 3, 3, 'minecraft:iron_bars')
  F(13, 0, 31, 18, 3, 31, AIR); F(12, 0, 31, 12, 4, 31, 'minecraft:polished_andesite'); F(19, 0, 31, 19, 4, 31, 'minecraft:polished_andesite')
  for (var x = 13; x <= 18; x++) S(x, 1, 31, x % 2 ? 'minecraft:red_concrete' : 'minecraft:white_concrete'); S(12, 5, 31, 'minecraft:lantern'); S(19, 5, 31, 'minecraft:lantern')
  // batiment principal x2..19 z2..13, R+1
  F(2, 0, 2, 19, 0, 13, 'minecraft:polished_andesite')
  for (var y = 1; y <= 11; y++) for (var x = 2; x <= 19; x++) for (var z = 2; z <= 13; z++) if (x == 2 || x == 19 || z == 2 || z == 13) S(x, y, z, (x == 2 || x == 19) && (z == 2 || z == 13) ? 'minecraft:polished_andesite' : y <= 2 ? BA : BE)
  F(3, 6, 3, 18, 6, 12, 'minecraft:spruce_planks'); W(2, 2, 19, 13, 6, 6, VT); F(2, 12, 2, 19, 12, 13, 'minecraft:gray_concrete'); W(2, 2, 19, 13, 12, 12, VT); W(2, 2, 19, 13, 13, 13, 'minecraft:stone_brick_wall')
  tour(17, 3, 1, BE)
  ;[4, 7, 10, 13].forEach(x => { F(x, 3, 2, x, 4, 2, 'minecraft:glass_pane'); F(x, 3, 13, x, 4, 13, 'minecraft:glass_pane') }); ;[5, 11].forEach(z => F(2, 3, z, 2, 4, z, 'minecraft:glass_pane')); ;[10, 12].forEach(z => F(19, 3, z, 19, 4, z, 'minecraft:glass_pane'))
  ;[3, 5, 7, 9, 11, 13, 15].forEach(x => F(x, 9, 2, x, 10, 2, 'minecraft:glass_pane')); ;[3, 5, 7, 9, 11, 13, 15, 17].forEach(x => F(x, 9, 13, x, 10, 13, 'minecraft:glass_pane')); ;[6, 9].forEach(z => F(2, 9, z, 2, 10, z, 'minecraft:glass_pane'))
  // rez : couloir z8, armurerie, bureau, refectoire, cuisine
  F(3, 1, 7, 15, 5, 7, BE); F(9, 1, 3, 9, 5, 6, BE); F(12, 1, 9, 12, 5, 12, BE); F(13, 1, 9, 18, 5, 9, BE)
  PORTE(6, 1, 7, 'minecraft:iron_door', 'south', 'left', 'false'); PORTE(12, 1, 7, 'minecraft:spruce_door', 'south', 'left', 'false'); PORTE(14, 1, 9, 'minecraft:spruce_door', 'north', 'left', 'false')
  PORTE(6, 1, 13, 'minecraft:spruce_door', 'south', 'left', 'false'); PORTE(7, 1, 13, 'minecraft:spruce_door', 'south', 'right', 'false'); PORTE(2, 1, 8, 'minecraft:spruce_door', 'west', 'left', 'false')
  F(3, 1, 8, 16, 1, 8, 'minecraft:green_carpet'); ;[5, 10, 15].forEach(x => S(x, 5, 8, 'minecraft:lantern[hanging=true]'))
  F(3, 1, 3, 8, 1, 3, 'minecraft:chest[facing=south]'); F(3, 2, 3, 8, 3, 3, 'minecraft:spruce_trapdoor[facing=south,half=bottom,open=true]'); F(3, 1, 4, 3, 2, 6, 'minecraft:barrel[facing=east,open=false]')
  S(5, 1, 5, 'minecraft:anvil[facing=east]'); S(7, 1, 5, 'minecraft:smithing_table'); S(8, 1, 6, 'minecraft:grindstone[face=floor,facing=west]'); S(6, 5, 5, 'minecraft:lantern[hanging=true]')
  S(10, 1, 3, 'minecraft:cartography_table'); S(11, 1, 3, 'supplementaries:globe'); F(15, 1, 3, 15, 2, 4, 'minecraft:bookshelf'); S(15, 1, 6, 'minecraft:jukebox'); S(13, 3, 3, 'minecraft:green_wall_banner[facing=south]')
  S(12, 1, 4, 'mcwfurnitures:dark_oak_table'); S(13, 1, 4, 'mcwfurnitures:dark_oak_table'); S(12, 1, 5, MAT('dark_oak_chair', 'north')); S(13, 1, 5, MAT('dark_oak_chair', 'north')); S(12, 1, 3, MAT('dark_oak_chair', 'south'))
  S(12, 2, 4, 'supplementaries:book_pile'); S(13, 2, 4, 'minecraft:heavy_weighted_pressure_plate'); S(12, 5, 5, 'mcwlights:iron_chandelier')
  for (var x = 4; x <= 10; x++) { S(x, 1, 10, 'mcwfurnitures:spruce_table'); S(x, 1, 9, MAT('spruce_chair', 'south')); S(x, 1, 11, MAT('spruce_chair', 'north')); if (R() < 0.5) S(x, 2, 10, choix(['minecraft:candle[candles=1,lit=false]', 'supplementaries:jar', 'minecraft:potted_dead_bush', 'minecraft:bowl'.replace('minecraft:bowl', 'minecraft:candle[candles=2,lit=false]')])) }
  S(3, 1, 12, 'minecraft:barrel[facing=up,open=false]'); S(11, 1, 12, 'minecraft:barrel[facing=up,open=false]'); ;[5, 9].forEach(x => S(x, 5, 10, 'minecraft:lantern[hanging=true]'))
  for (var x = 13; x <= 18; x++) { S(x, 1, 12, x == 15 ? 'farmersdelight:stove[facing=north,lit=false]' : x == 16 ? 'mcwfurnitures:spruce_kitchen_sink[facing=north,water=false]' : MAT('spruce_counter', 'north')); if (x != 15) S(x, 3, 12, 'mcwfurnitures:spruce_kitchen_cabinet[facing=north,hinge=' + (x % 2 ? 'left' : 'right') + ']') }
  S(15, 2, 12, 'farmersdelight:cooking_pot'); S(13, 2, 12, 'farmersdelight:cutting_board[facing=north]'); S(18, 1, 10, 'minecraft:barrel[facing=west,open=false]'); S(18, 1, 11, 'minecraft:barrel[facing=west,open=false]'); S(16, 1, 10, 'mcwfurnitures:spruce_table'); S(16, 2, 10, 'farmersdelight:cabbage_crate'.replace('farmersdelight:cabbage_crate', 'supplementaries:jar')); S(15, 5, 11, 'minecraft:lantern[hanging=true]')
  // etage : dortoir, lits superposes
  for (var x = 4; x <= 14; x += 2) { S(x, 7, 3, 'minecraft:green_bed[facing=north,part=head]'); S(x, 7, 4, 'minecraft:green_bed[facing=north,part=foot]'); F(x, 8, 3, x, 8, 4, 'minecraft:spruce_slab[type=top]'); S(x, 9, 3, 'minecraft:green_bed[facing=north,part=head]'); S(x, 9, 4, 'minecraft:green_bed[facing=north,part=foot]'); S(x, 7, 5, 'minecraft:chest[facing=south]') }
  for (var x = 4; x <= 18; x += 2) { S(x, 7, 12, 'minecraft:green_bed[facing=south,part=head]'); S(x, 7, 11, 'minecraft:green_bed[facing=south,part=foot]'); F(x, 8, 11, x, 8, 12, 'minecraft:spruce_slab[type=top]'); S(x, 9, 12, 'minecraft:green_bed[facing=south,part=head]'); S(x, 9, 11, 'minecraft:green_bed[facing=south,part=foot]'); if (x != 18) S(x, 7, 10, 'minecraft:chest[facing=north]') }
  for (var x = 3; x <= 15; x += 2) F(x, 7, 3, x, 8, 3, 'minecraft:barrel[facing=south,open=false]'); for (var x = 3; x <= 17; x += 2) F(x, 7, 12, x, 8, 12, 'minecraft:barrel[facing=north,open=false]')
  S(9, 7, 7, 'mcwfurnitures:spruce_table'); S(8, 7, 7, MAT('spruce_chair', 'east')); S(10, 7, 7, MAT('spruce_chair', 'west')); S(9, 8, 7, 'minecraft:candle[candles=3,lit=false]'); ;[5, 9, 13].forEach(x => S(x, 11, 7, 'minecraft:lantern[hanging=true]')); S(17, 11, 10, 'minecraft:lantern[hanging=true]')
  // toit : nid de sacs, antenne, citerne
  ;[[15, 3], [16, 3], [17, 3], [18, 3], [18, 4], [18, 5], [14, 3]].forEach(c => S(c[0], 13, c[1], SAC)); F(4, 13, 4, 4, 18, 4, 'minecraft:iron_bars'); S(4, 19, 4, 'minecraft:lightning_rod[facing=up,powered=false,waterlogged=false]')
  F(8, 13, 9, 9, 14, 10, 'minecraft:barrel[facing=up,open=false]'); S(16, 13, 5, 'minecraft:end_rod[facing=up]')
  // parc auto (hangar x22..30 z2..12)
  F(22, -1, 2, 30, -1, 12, 'minecraft:gray_concrete'); F(22, 0, 2, 30, 5, 2, 'minecraft:gray_concrete'); ;[22, 26, 30].forEach(x => F(x, 0, 12, x, 5, 12, 'minecraft:polished_basalt[axis=y]')); F(22, 0, 3, 22, 5, 11, 'minecraft:gray_concrete'); F(30, 0, 3, 30, 5, 11, 'minecraft:gray_concrete')
  F(21, 6, 1, 31, 6, 13, 'minecraft:waxed_weathered_cut_copper_slab[type=bottom]'); F(22, 6, 2, 30, 6, 12, 'minecraft:waxed_weathered_cut_copper'); ;[4, 8].forEach(z => F(22, 3, z, 22, 4, z + 2, 'minecraft:glass_pane'))
  F(24, 0, 5, 26, 0, 9, 'minecraft:green_concrete'); ;[[24, 5], [26, 5], [24, 9], [26, 9]].forEach(c => S(c[0], 0, c[1], 'minecraft:black_concrete')); F(24, 1, 8, 26, 1, 9, 'minecraft:green_concrete'); F(24, 2, 7, 26, 2, 7, 'minecraft:glass_pane'); S(24, 1, 6, 'minecraft:black_carpet'); S(26, 1, 6, 'minecraft:black_carpet'); S(25, 1, 5, 'minecraft:green_concrete')
  F(28, 0, 3, 29, 0, 11, 'minecraft:gray_concrete'); F(28, 1, 3, 29, 3, 8, 'minecraft:green_wool'); F(28, 1, 9, 29, 2, 10, 'minecraft:green_concrete'); F(28, 2, 10, 29, 2, 10, 'minecraft:glass_pane'.replace('glass_pane', 'black_stained_glass')); ;[4, 7, 10].forEach(z => { S(28, 0, z, 'minecraft:black_concrete'); S(29, 0, z, 'minecraft:black_concrete') })
  F(23, 0, 3, 23, 1, 4, 'minecraft:barrel[facing=up,open=false]'); S(25, 0, 3, 'minecraft:smithing_table'); S(26, 0, 3, 'minecraft:anvil[facing=north]'); S(27, 0, 3, 'minecraft:chest[facing=south]'); F(25, 5, 10, 25, 5, 10, 'minecraft:chain[axis=y]'); S(25, 4, 10, 'minecraft:lightning_rod[facing=down,powered=false,waterlogged=false]')
  // place d'armes : mat, tentes, champ de tir, mirador, guerite
  F(11, 0, 19, 11, 9, 19, 'minecraft:iron_bars'); S(11, 10, 19, 'minecraft:green_banner[rotation=4]'); S(10, 0, 19, 'minecraft:stone_brick_wall'); S(12, 0, 19, 'minecraft:stone_brick_wall')
  function tente(x1, z0, laine, lits) {
    F(x1, 1, z0, x1 + 5, 1, z0, laine); F(x1, 1, z0 + 4, x1 + 5, 1, z0 + 4, laine); F(x1, 2, z0 + 1, x1 + 5, 2, z0 + 1, laine); F(x1, 2, z0 + 3, x1 + 5, 2, z0 + 3, laine); F(x1, 3, z0 + 2, x1 + 5, 3, z0 + 2, laine)
    F(x1, 1, z0 + 1, x1, 1, z0 + 3, laine); S(x1, 2, z0 + 2, laine); F(x1 + 5, 1, z0 + 1, x1 + 5, 1, z0 + 1, laine); S(x1 + 5, 1, z0 + 3, laine)
    F(x1, 0, z0, x1 + 5, 0, z0 + 4, 'minecraft:spruce_planks'); S(x1 + 4, 2, z0 + 2, 'minecraft:lantern[hanging=true]')
    S(x1 + 1, 1, z0 + 1, lits + '_bed[facing=west,part=head]'); S(x1 + 2, 1, z0 + 1, lits + '_bed[facing=west,part=foot]'); S(x1 + 1, 1, z0 + 3, lits + '_bed[facing=west,part=head]'); S(x1 + 2, 1, z0 + 3, lits + '_bed[facing=west,part=foot]')
    S(x1 + 4, 1, z0 + 1, 'minecraft:chest[facing=north]'); S(x1 + 4, 1, z0 + 3, 'minecraft:barrel[facing=up,open=false]')
  }
  tente(2, 25, 'minecraft:white_wool', 'minecraft:white'); F(2, 1, 27, 2, 1, 27, 'minecraft:red_wool'); S(2, 2, 27, 'minecraft:red_wool'); S(3, 1, 27, 'minecraft:brewing_stand'); S(5, 1, 27, 'minecraft:cauldron')
  tente(8, 24, 'minecraft:green_wool', 'minecraft:green')
  ;[15, 17, 19].forEach(z => { S(30, 0, z, 'minecraft:hay_block[axis=y]'); S(30, 1, z, 'minecraft:target') }); for (var z = 15; z <= 20; z++) S(23, 0, z, SAC); S(23, 1, 16, SAC); S(23, 1, 18, SAC)
  ;[[26, 24], [29, 24], [26, 27], [29, 27]].forEach(c => F(c[0], 0, c[1], c[0], 13, c[1], 'minecraft:spruce_log[axis=y]')); F(26, 10, 24, 29, 10, 27, 'minecraft:spruce_planks'); S(27, 10, 24, AIR); F(27, 1, 24, 27, 10, 24, 'minecraft:ladder[facing=east]')
  F(26, 11, 25, 26, 11, 26, 'minecraft:spruce_fence'); F(29, 11, 25, 29, 11, 26, 'minecraft:spruce_fence'); F(27, 11, 27, 28, 11, 27, 'minecraft:spruce_fence'); S(28, 11, 24, 'minecraft:spruce_fence')
  F(25, 14, 23, 30, 14, 28, 'minecraft:spruce_slab[type=bottom]'); S(28, 11, 26, SAC); S(27, 11, 26, 'minecraft:sea_lantern'); S(28, 13, 25, 'minecraft:lantern[hanging=true]')
  W(20, 26, 23, 29, 1, 3, 'minecraft:white_concrete'); F(20, 0, 26, 23, 0, 29, 'minecraft:polished_andesite'); F(20, 4, 26, 23, 4, 29, 'minecraft:smooth_stone_slab[type=bottom]'); PORTE(20, 1, 27, 'minecraft:spruce_door', 'west', 'left', 'false')
  F(23, 2, 27, 23, 2, 28, 'minecraft:glass_pane'); F(21, 2, 29, 22, 2, 29, 'minecraft:glass_pane'); F(21, 2, 26, 22, 2, 26, 'minecraft:glass_pane'); S(22, 1, 28, 'mcwfurnitures:spruce_table'); S(21, 1, 28, MAT('spruce_chair', 'east')); S(22, 2, 28, 'minecraft:jukebox'.replace('minecraft:jukebox', 'minecraft:candle[candles=1,lit=false]')); S(22, 3, 27, 'minecraft:lantern[hanging=true]')
  ;[13, 14, 17, 18].forEach(x => S(x, 0, 30, SAC)); S(13, 1, 30, SAC); S(18, 1, 30, SAC)
  ;[[1, 15], [1, 22], [24, 14]].forEach(c => S(c[0], 0, c[1], 'minecraft:barrel[facing=up,open=false]')); S(21, 0, 14, 'minecraft:chest[facing=south]'); S(21, 0, 15, 'minecraft:barrel[facing=up,open=false]')
}
