
// ================= ATELIER INDUSTRIEL ROUILLE (2 x 2 chunks) =================
function atelierRouille() {
  var BR = 'minecraft:bricks', GR = 'minecraft:waxed_weathered_copper_grate', CU = 'minecraft:waxed_weathered_cut_copper', CE = 'minecraft:waxed_exposed_cut_copper'
  var ST = 'minecraft:waxed_weathered_cut_copper_stairs', GL = 'minecraft:light_gray_stained_glass', PC = 'minecraft:waxed_exposed_copper_door'
  // sol de la cour
  for (var x = 0; x <= 31; x++) for (var z = 0; z <= 31; z++) S(x, -1, z, choix(['minecraft:gravel', 'minecraft:gravel', 'minecraft:coarse_dirt', 'minecraft:andesite', 'minecraft:cobblestone']))
  F(15, -1, 23, 19, -1, 31, 'minecraft:gray_concrete')
  // halle : murs x3..26 z5..22
  F(3, 0, 5, 26, 0, 22, 'minecraft:smooth_stone')
  for (var y = 1; y <= 11; y++) {
    for (var x = 3; x <= 26; x++) [5, 22].forEach(z => S(x, y, z, y >= 10 ? CU : y >= 4 && y <= 8 && (x - 3) % 4 != 0 ? GR : BR))
    for (var z = 6; z <= 21; z++) [3, 26].forEach(x => S(x, y, z, y >= 10 ? CU : y >= 4 && y <= 8 && (z - 5) % 4 != 0 ? GR : BR))
  }
  ;[3, 7, 11, 15, 19, 23, 26].forEach(x => { F(x, 0, 4, x, 11, 4, BR); F(x, 0, 23, x, 11, 23, BR); S(x, 12, 4, 'minecraft:brick_slab[type=bottom]'); S(x, 12, 23, 'minecraft:brick_slab[type=bottom]') })
  ;[9, 13, 17, 21].forEach(z => { F(2, 0, z, 2, 11, z, BR); F(27, 0, z, 27, 11, z, BR); S(2, 12, z, 'minecraft:brick_slab[type=bottom]'); S(27, 12, z, 'minecraft:brick_slab[type=bottom]') })
  // toit en sheds (verrieres au nord)
  ;[5, 9, 13, 17].forEach(zt => {
    F(3, 12, zt, 26, 14, zt, GL)
    F(3, 14, zt + 1, 26, 14, zt + 1, ST + '[facing=north,half=bottom,shape=straight]'); F(3, 13, zt + 2, 26, 13, zt + 2, ST + '[facing=north,half=bottom,shape=straight]'); F(3, 12, zt + 3, 26, 12, zt + 3, ST + '[facing=north,half=bottom,shape=straight]')
    ;[3, 26].forEach(x => { F(x, 12, zt + 1, x, 13, zt + 1, BR); S(x, 12, zt + 2, BR) })
  })
  F(3, 12, 21, 26, 12, 22, 'minecraft:waxed_weathered_cut_copper_slab[type=bottom]'); F(3, 13, 22, 26, 13, 22, 'minecraft:brick_wall')
  // charpente, poteaux, pont roulant, suspensions
  ;[9, 13, 17].forEach(z => { F(4, 11, z, 25, 11, z, CE); ;[11, 19].forEach(x => F(x, 1, z, x, 10, z, 'minecraft:polished_basalt[axis=y]')) ; [13, 22].forEach(x => { S(x, 10, z, 'minecraft:chain[axis=y]'); S(x, 9, z, 'minecraft:waxed_copper_bulb[lit=true,powered=false]') }) })
  F(10, 9, 6, 25, 9, 6, 'minecraft:waxed_weathered_cut_copper_slab[type=top]'); F(10, 9, 21, 25, 9, 21, 'minecraft:waxed_weathered_cut_copper_slab[type=top]')
  F(15, 9, 6, 15, 9, 21, 'minecraft:yellow_concrete'); F(15, 5, 12, 15, 8, 12, 'minecraft:chain[axis=y]'); S(15, 4, 12, 'minecraft:lightning_rod[facing=down,powered=false,waterlogged=false]')
  // marquages au sol, taches
  F(10, 0, 11, 25, 0, 11, 'minecraft:yellow_concrete'); F(10, 0, 18, 25, 0, 18, 'minecraft:yellow_concrete')
  for (var i = 0; i < 14; i++) { var x = 10 + Math.floor(R() * 16), z = 6 + Math.floor(R() * 16); if (z != 11 && z != 18) S(x, 0, z, choix(['minecraft:gray_concrete', 'minecraft:coal_block', 'minecraft:smooth_basalt'])) }
  // ouvertures
  F(16, 1, 22, 18, 4, 22, AIR); F(16, 5, 22, 18, 6, 22, CU); PORTE(13, 1, 22, PC, 'south', 'left', 'false'); PORTE(3, 1, 19, PC, 'west', 'left', 'false')
  // machines
  F(13, 1, 8, 17, 1, 9, 'minecraft:polished_deepslate'); S(13, 2, 8, 'minecraft:iron_block'); F(14, 2, 8, 16, 2, 8, 'minecraft:polished_basalt[axis=x]'); S(17, 2, 8, 'minecraft:lodestone'); S(13, 2, 9, 'minecraft:lever[face=floor,facing=north,powered=false]'); S(15, 1, 10, 'mcwfurnitures:oak_stool_chair')
  F(21, 1, 7, 23, 1, 8, 'minecraft:polished_deepslate'); F(21, 2, 7, 21, 5, 7, 'minecraft:polished_basalt[axis=y]'); F(23, 2, 7, 23, 5, 7, 'minecraft:polished_basalt[axis=y]'); F(21, 6, 7, 23, 6, 8, 'minecraft:iron_block'); S(22, 5, 7, 'minecraft:piston[facing=down,extended=false]'); S(22, 2, 8, 'minecraft:anvil[facing=north]')
  S(11, 1, 20, 'minecraft:grindstone[face=floor,facing=north]'); S(12, 1, 20, 'minecraft:stonecutter[facing=north]'); S(14, 1, 20, 'minecraft:smithing_table'); S(15, 1, 20, 'minecraft:anvil[facing=east]'); S(18, 1, 20, 'minecraft:blast_furnace[facing=north,lit=false]'); S(19, 1, 20, 'minecraft:blast_furnace[facing=north,lit=false]')
  S(12, 1, 19, 'mcwfurnitures:spruce_stool_chair'); S(14, 1, 19, 'mcwfurnitures:spruce_stool_chair'); S(20, 1, 21, 'minecraft:cauldron'); S(21, 1, 21, 'minecraft:water_cauldron[level=2]')
  F(12, 1, 15, 18, 1, 15, 'minecraft:polished_blackstone_slab[type=top]'); S(13, 2, 15, 'minecraft:barrel[facing=up,open=false]'); S(16, 2, 15, 'minecraft:chest[facing=south]'); S(11, 1, 15, 'minecraft:dropper[facing=east,triggered=false]')
  F(22, 1, 16, 22, 1, 17, 'minecraft:yellow_concrete'); S(22, 2, 16, 'minecraft:yellow_concrete'); S(22, 2, 17, 'minecraft:black_carpet'); F(22, 1, 15, 22, 3, 15, 'minecraft:iron_bars'); S(22, 1, 14, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false,powered=false,waterlogged=false]')
  F(24, 3, 12, 25, 3, 19, 'minecraft:spruce_slab[type=top]'); F(24, 6, 13, 25, 6, 18, 'minecraft:spruce_slab[type=top]'); ;[12, 19].forEach(z => F(24, 1, z, 24, 6, z, 'minecraft:stripped_spruce_log[axis=y]'))
  for (var z = 13; z <= 18; z++) { if (R() < 0.7) S(25, 1, z, choix(['minecraft:barrel[facing=up,open=false]', 'minecraft:chest[facing=west]', 'minecraft:hay_block[axis=y]'])); if (R() < 0.7) S(25, 4, z, choix(['minecraft:barrel[facing=up,open=false]', 'minecraft:decorated_pot', 'minecraft:chest[facing=west]'])) }
  ;[[10, 6], [10, 7], [12, 6]].forEach(c => S(c[0], 1, c[1], 'minecraft:barrel[facing=up,open=false]'))
  // rez sous mezzanine : sanitaires, vestiaires, refectoire
  F(4, 1, 10, 9, 5, 10, 'minecraft:white_concrete'); F(9, 1, 6, 9, 5, 9, 'minecraft:white_concrete'); PORTE(9, 1, 8, 'minecraft:birch_door', 'east', 'left', 'false')
  for (var x = 4; x <= 8; x++) for (var z = 6; z <= 9; z++) S(x, 0, z, (x + z) % 2 ? 'minecraft:smooth_quartz' : 'minecraft:polished_diorite')
  S(4, 1, 6, 'minecraft:quartz_stairs[facing=west,half=bottom,shape=straight]'); F(4, 1, 7, 5, 2, 7, 'minecraft:white_concrete'); S(4, 1, 8, 'minecraft:quartz_stairs[facing=west,half=bottom,shape=straight]'); S(6, 1, 9, 'mcwfurnitures:oak_kitchen_sink[facing=north,water=false]'); S(7, 1, 9, 'mcwfurnitures:oak_kitchen_sink[facing=north,water=false]'); S(8, 5, 7, 'minecraft:lantern[hanging=true]')
  F(4, 1, 11, 4, 2, 14, 'minecraft:barrel[facing=east,open=false]'); F(6, 1, 12, 6, 1, 13, 'minecraft:spruce_slab[type=bottom]'); F(9, 1, 13, 9, 5, 13, 'minecraft:polished_basalt[axis=y]')
  S(6, 1, 18, 'mcwfurnitures:spruce_table'); S(5, 1, 18, MAT('spruce_chair', 'east')); S(7, 1, 18, MAT('spruce_chair', 'west')); S(6, 2, 18, 'minecraft:candle[candles=2,lit=false]')
  F(4, 1, 20, 4, 1, 21, MAT('spruce_counter', 'east')); S(4, 2, 20, 'minecraft:brewing_stand'); S(4, 2, 21, 'supplementaries:jar'); F(8, 1, 21, 8, 2, 21, 'minecraft:white_concrete'); S(5, 5, 15, 'minecraft:lantern[hanging=true]'); S(6, 5, 19, 'minecraft:lantern[hanging=true]')
  // mezzanine (y6) : bureau du contremaitre, planches a dessin, stockage
  F(4, 6, 6, 9, 6, 15, 'minecraft:spruce_planks'); F(4, 6, 16, 8, 6, 21, 'minecraft:spruce_planks')
  for (var k = 0; k <= 5; k++) { S(9, 1 + k, 21 - k, ST + '[facing=north,half=bottom,shape=straight]'); if (k > 0) F(9, 1, 21 - k, 9, k, 21 - k, CU) }
  F(9, 7, 12, 9, 7, 14, 'minecraft:iron_bars'); F(8, 7, 17, 8, 7, 21, 'minecraft:iron_bars')
  F(4, 7, 11, 9, 10, 11, 'minecraft:white_concrete'); F(9, 7, 6, 9, 10, 10, 'minecraft:white_concrete'); F(4, 11, 6, 9, 11, 11, 'minecraft:white_concrete')
  F(5, 8, 11, 7, 9, 11, 'minecraft:glass_pane'); F(9, 8, 7, 9, 9, 9, 'minecraft:glass_pane'); PORTE(8, 7, 11, 'minecraft:spruce_door', 'south', 'left', 'false')
  S(6, 7, 7, 'mcwfurnitures:dark_oak_desk[facing=north,connection=single]'); S(6, 7, 8, MAT('dark_oak_chair', 'north')); S(6, 8, 7, 'supplementaries:book_pile'); S(7, 8, 7, 'minecraft:lantern')
  S(7, 7, 7, 'mcwfurnitures:dark_oak_desk[facing=north,connection=single]'); F(4, 7, 6, 4, 8, 7, 'minecraft:barrel[facing=east,open=false]'); S(8, 7, 6, 'minecraft:iron_block'); S(4, 7, 9, 'minecraft:cartography_table'); S(8, 7, 9, 'minecraft:potted_fern'); S(6, 10, 9, 'minecraft:lantern[hanging=true]')
  ;[13, 14].forEach(z => { S(5, 7, z, 'mcwfurnitures:spruce_table'); S(6, 7, z, MAT('spruce_chair', 'west')); S(5, 8, z, 'supplementaries:book_pile') }); S(4, 7, 15, 'minecraft:lantern'); S(8, 7, 13, 'minecraft:barrel[facing=up,open=false]')
  F(4, 7, 17, 4, 9, 21, 'minecraft:barrel[facing=east,open=false]'); F(6, 7, 18, 6, 8, 20, 'minecraft:barrel[facing=up,open=false]'); S(7, 7, 16, 'minecraft:lantern')
  // cheminee d'usine
  F(27, 0, 7, 31, 1, 11, 'minecraft:stone_bricks'); F(28, 2, 8, 30, 29, 10, BR); ;[10, 20].forEach(y => F(28, y, 8, 30, y, 10, CE)); F(27, 8, 9, 27, 8, 9, BR)
  F(28, 30, 8, 30, 30, 10, 'minecraft:brick_wall'); S(29, 30, 9, 'minecraft:campfire[lit=true,signal_fire=true]'); F(31, 2, 9, 31, 28, 9, 'minecraft:ladder[facing=east]')
  // conteneurs et ferraille au nord
  F(4, 0, 0, 10, 2, 2, 'minecraft:red_terracotta'); F(6, 3, 0, 12, 5, 2, 'minecraft:blue_terracotta'); F(15, 0, 1, 21, 2, 3, 'minecraft:green_terracotta')
  ;[4, 10].forEach(x => F(x, 0, 1, x, 1, 1, 'minecraft:iron_bars')); F(12, 3, 1, 12, 4, 1, 'minecraft:iron_bars'); F(21, 0, 2, 21, 1, 2, 'minecraft:iron_bars')
  for (var x = 22; x <= 26; x++) for (var z = 0; z <= 2; z++) if (R() < 0.6) S(x, 0, z, choix(['minecraft:cobblestone', 'minecraft:iron_bars', 'minecraft:damaged_anvil[facing=north]', 'minecraft:coal_block', 'minecraft:chain[axis=x]', 'minecraft:barrel[facing=up,open=false]']))
  // cour sud : camion a quai, palettes, ferraille, cloture
  F(16, 1, 23, 18, 3, 28, 'minecraft:white_concrete'); F(16, 0, 23, 18, 0, 28, 'minecraft:gray_concrete'); ;[24, 27].forEach(z => { S(16, 0, z, 'minecraft:black_concrete'); S(18, 0, z, 'minecraft:black_concrete') })
  F(16, 0, 29, 18, 2, 30, 'minecraft:red_concrete'); F(16, 2, 30, 18, 2, 30, 'minecraft:black_stained_glass'); S(16, 0, 30, 'minecraft:black_concrete'); S(18, 0, 30, 'minecraft:black_concrete'); F(16, 0, 31, 18, 0, 31, 'minecraft:iron_block'); S(17, 3, 29, 'minecraft:iron_trapdoor[facing=south,half=bottom,open=false,powered=false,waterlogged=false]')
  ;[[5, 25], [8, 25], [5, 28]].forEach(c => { F(c[0], 0, c[1], c[0] + 1, 0, c[1] + 1, 'minecraft:spruce_slab[type=bottom]') }); S(8, 0, 28, 'minecraft:barrel[facing=up,open=false]'); S(9, 0, 28, 'minecraft:barrel[facing=up,open=false]'); S(8, 1, 28, 'minecraft:barrel[facing=up,open=false]')
  S(3, 0, 26, 'minecraft:damaged_anvil[facing=east]'); S(11, 0, 26, 'minecraft:cauldron'); S(12, 0, 27, 'minecraft:composter[level=0]'); F(23, 0, 25, 25, 0, 25, 'minecraft:chain[axis=x]'); S(25, 0, 27, 'minecraft:coal_block'); S(26, 0, 27, 'minecraft:iron_bars')
  for (var x = 0; x <= 31; x++) if (x < 15 || x > 19) S(x, 0, 31, x % 4 == 0 ? 'minecraft:polished_basalt[axis=y]' : 'minecraft:iron_bars')
  ;[1, 2].forEach(z => {}); S(0, 0, 8, 'minecraft:barrel[facing=up,open=false]'); S(1, 0, 8, 'minecraft:barrel[facing=up,open=false]'); S(0, 1, 8, 'minecraft:barrel[facing=up,open=false]'); S(1, 0, 14, 'minecraft:composter[level=0]')
  for (var x = 0; x <= 31; x++) for (var z = 0; z <= 30; z++) { var dans = (x >= 2 && x <= 27 && z >= 3 && z <= 24) || (x >= 27 && z >= 7 && z <= 11) || (x >= 15 && x <= 19 && z >= 23) || (z <= 3 && x >= 4 && x <= 21); if (dans) continue; if (R() < 0.06) { S(x, -1, z, 'minecraft:coarse_dirt'); SA(x, 0, z, 'minecraft:short_grass') } }
}
