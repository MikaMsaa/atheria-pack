
// ================= GRANDE VILLA MODERNE (3 x 3 chunks) =================
function villaModerne() {
  var WC = 'minecraft:white_concrete', BK = 'minecraft:black_concrete', GL = 'minecraft:glass', SQ = 'minecraft:smooth_quartz', SP = 'minecraft:stripped_spruce_log[axis=y]', DK = 'minecraft:polished_deepslate', PB = 'minecraft:polished_blackstone'
  var TS = 'minecraft:smooth_stone_slab[type=top]', BS = 'minecraft:smooth_stone_slab[type=bottom]', LT = 'mcwlights:white_ceiling_light', HAIE = 'minecraft:azalea_leaves[persistent=true]', VP = 'minecraft:glass_pane'
  function arbre(x, z, tronc, feuille, h) { F(x, 0, z, x, h, z, tronc); for (var dx = -2; dx <= 2; dx++) for (var dz = -2; dz <= 2; dz++) for (var y = h - 1; y <= h + 2; y++) if (Math.abs(dx) + Math.abs(dz) + Math.abs(y - h - 0.5) < 3.6) SA(x + dx, y, z + dz, feuille) }
  function parasol(x, z) { F(x, 0, z, x, 2, z, 'minecraft:spruce_fence'); F(x - 1, 3, z - 1, x + 1, 3, z + 1, 'minecraft:white_wool'); ;[[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(c => S(x + c[0], 3, z + c[1], AIR)); S(x, 4, z, 'minecraft:white_carpet') }
  F(0, -1, 0, 47, -1, 47, 'minecraft:grass_block')
  // ---------- enceinte, portail, portillon, haies ----------
  W(0, 0, 47, 47, 0, 1, WC); W(0, 0, 47, 47, 2, 2, BS)
  for (var i = 0; i <= 47; i += 8) { F(i, 0, 47, i, 2, 47, BK); F(i, 0, 0, i, 2, 0, BK); F(0, 0, i, 0, 2, i, BK); F(47, 0, i, 47, 2, i, BK) }
  F(47, 0, 47, 47, 2, 47, BK)
  F(3, 0, 47, 10, 2, 47, AIR); F(3, 0, 47, 3, 3, 47, BK); F(10, 0, 47, 10, 3, 47, BK); S(3, 4, 47, 'mcwlights:garden_light'); S(10, 4, 47, 'mcwlights:garden_light'); F(4, 0, 47, 9, 1, 47, 'mcwfences:panelled_metal_fence'); F(4, 2, 47, 9, 2, 47, BS)
  F(13, 0, 47, 13, 1, 47, AIR); PORTE(13, 0, 47, 'minecraft:iron_door', 'south', 'left', 'false')
  F(1, 0, 1, 1, 1, 46, HAIE); F(1, 0, 1, 13, 1, 1, HAIE); F(46, 0, 1, 46, 1, 46, HAIE); F(14, 0, 46, 46, 1, 46, HAIE); F(1, 0, 1, 46, 1, 1, HAIE)
  // ---------- allee, garage double, avant-cour ----------
  F(3, -1, 22, 10, -1, 46, 'minecraft:polished_andesite'); F(2, -1, 22, 2, -1, 46, 'minecraft:smooth_stone'); F(11, -1, 22, 11, -1, 46, 'minecraft:smooth_stone'); F(12, -1, 20, 13, -1, 25, 'minecraft:polished_andesite')
  for (var z = 27; z <= 45; z += 2) S(13, -1, z, 'minecraft:smooth_stone')
  ;[26, 32, 38, 44].forEach(z => { SA(2, 0, z, 'mcwlights:garden_light'); SA(12, 0, z, 'mcwlights:garden_light') })
  F(2, 0, 10, 11, 0, 21, 'minecraft:smooth_stone'); W(2, 10, 11, 21, 1, 4, WC); F(1, 5, 9, 12, 5, 22, TS); F(2, 5, 10, 11, 5, 21, 'minecraft:moss_block')
  F(3, 1, 21, 5, 3, 21, AIR); F(8, 1, 21, 10, 3, 21, AIR); F(3, 1, 22, 5, 3, 22, 'minecraft:iron_trapdoor[facing=south,half=bottom,open=true]'); F(8, 1, 22, 10, 3, 22, 'minecraft:iron_trapdoor[facing=south,half=bottom,open=true]'); F(6, 1, 21, 7, 4, 21, BK)
  function auto(x, z, c) { F(x, 1, z, x + 1, 1, z + 3, 'minecraft:' + c + '_concrete'); F(x, 2, z + 1, x + 1, 2, z + 2, 'minecraft:tinted_glass'); S(x, 2, z, 'minecraft:' + c + '_carpet'); S(x + 1, 2, z, 'minecraft:' + c + '_carpet'); S(x, 2, z + 3, 'minecraft:' + c + '_carpet'); S(x + 1, 2, z + 3, 'minecraft:' + c + '_carpet') }
  auto(3, 13, 'red'); auto(8, 13, 'black'); F(3, 1, 11, 10, 1, 11, MAT('spruce_counter', 'south')); S(4, 2, 11, 'minecraft:anvil[facing=east]'); F(6, 2, 11, 8, 3, 11, 'minecraft:spruce_trapdoor[facing=south,half=bottom,open=true]'); S(10, 1, 19, 'minecraft:barrel[facing=up,open=false]'); S(3, 4, 16, LT); S(9, 4, 16, LT)
  F(12, 5, 20, 13, 5, 25, 'minecraft:polished_blackstone_slab[type=top]'); S(13, 4, 22, 'minecraft:end_rod[facing=down]'); S(13, 4, 24, 'minecraft:end_rod[facing=down]'); S(12, 0, 21, 'supplementaries:planter'); S(12, 1, 21, 'minecraft:flowering_azalea'); S(12, 0, 25, 'supplementaries:planter'); S(12, 1, 25, 'minecraft:flowering_azalea')
  // ---------- volume A : rez-de-chaussee vitre (x14..37, z10..25) ----------
  F(13, 0, 9, 38, 0, 26, DK); F(14, 0, 10, 37, 0, 25, SQ)
  F(14, 1, 10, 37, 5, 10, WC); F(14, 1, 10, 14, 5, 25, WC); F(14, 1, 25, 37, 5, 25, GL); F(37, 1, 10, 37, 5, 25, GL)
  ;[14, 18, 22, 26, 30, 34, 37].forEach(x => F(x, 1, 25, x, 5, 25, BK)); ;[10, 14, 18, 22, 25].forEach(z => F(37, 1, z, 37, 5, z, BK))
  F(24, 3, 10, 36, 4, 10, GL); F(28, 3, 10, 28, 4, 10, BK); F(32, 3, 10, 32, 4, 10, BK)
  F(13, 6, 9, 38, 6, 26, TS); F(14, 6, 10, 37, 6, 25, 'minecraft:smooth_stone')
  F(14, 1, 21, 14, 4, 24, GL); PORTE(14, 1, 22, 'mcwdoors:dark_oak_glass_door', 'west', 'left', 'false'); PORTE(14, 1, 23, 'mcwdoors:dark_oak_glass_door', 'west', 'right', 'false')
  PORTE(23, 1, 25, 'mcwdoors:dark_oak_glass_door', 'south', 'left', 'false'); PORTE(24, 1, 25, 'mcwdoors:dark_oak_glass_door', 'south', 'right', 'false'); PORTE(31, 1, 25, 'mcwdoors:dark_oak_glass_door', 'south', 'left', 'false'); PORTE(32, 1, 25, 'mcwdoors:dark_oak_glass_door', 'south', 'right', 'false')
  PORTE(37, 1, 16, 'mcwdoors:dark_oak_glass_door', 'east', 'left', 'false'); PORTE(37, 1, 17, 'mcwdoors:dark_oak_glass_door', 'east', 'right', 'false')
  // salle de cinema
  F(21, 1, 11, 21, 5, 18, WC); F(15, 1, 18, 20, 5, 18, WC); F(15, 1, 11, 20, 1, 17, 'minecraft:black_carpet'); PORTE(21, 1, 16, 'minecraft:dark_oak_door', 'east', 'left', 'false')
  F(16, 2, 11, 19, 4, 11, 'minecraft:white_wool'); F(15, 1, 11, 15, 2, 11, 'minecraft:note_block'); F(20, 1, 11, 20, 2, 11, 'minecraft:note_block')
  F(16, 1, 14, 19, 1, 14, 'mcwfurnitures:black_couch[facing=north,shape=single]'); F(16, 1, 16, 19, 1, 16, 'mcwfurnitures:black_couch[facing=north,shape=single]'); S(15, 1, 16, 'minecraft:barrel[facing=up,open=false]'); S(17, 5, 15, 'mcwlights:black_ceiling_light')
  // hall d'entree
  F(16, 1, 21, 19, 1, 23, 'minecraft:light_gray_carpet'); S(15, 1, 19, MAT('stripped_dark_oak_drawer', 'east')); S(15, 2, 19, 'minecraft:potted_white_tulip'); S(15, 1, 24, 'minecraft:potted_bamboo'); S(20, 1, 19, 'minecraft:decorated_pot'); S(18, 5, 22, LT); S(15, 1, 22, MAT('oak_modern_chair', 'east'))
  // escalier flottant vers l'etage
  for (var i = 0; i < 6; i++) F(22, 1 + i, 24 - i, 23, 1 + i, 24 - i, 'minecraft:smooth_quartz_stairs[facing=north,half=bottom,shape=straight]')
  F(24, 1, 19, 24, 5, 24, GL)
  // cuisine
  F(27, 1, 11, 35, 1, 11, MAT('stripped_oak_counter', 'south')); S(31, 1, 11, 'mcwfurnitures:stripped_oak_kitchen_sink[facing=south,water=false]'); S(29, 1, 11, 'farmersdelight:stove[facing=south,lit=false]'); S(29, 2, 11, 'farmersdelight:cooking_pot')
  S(27, 2, 11, 'farmersdelight:cutting_board[facing=south]'); S(34, 2, 11, 'supplementaries:jar'); F(36, 1, 11, 36, 3, 12, 'minecraft:iron_block'); F(26, 1, 11, 26, 1, 11, 'mcwfurnitures:stripped_oak_wardrobe[facing=south,connection=base,hinge=left]')
  F(28, 1, 14, 33, 1, 14, MAT('stripped_oak_counter', 'south')); S(29, 2, 14, 'minecraft:decorated_pot'); S(32, 2, 14, 'minecraft:potted_white_tulip'); ;[28, 30, 32].forEach(x => S(x + 1, 1, 15, 'mcwfurnitures:stripped_oak_stool_chair'))
  S(29, 5, 14, LT); S(32, 5, 14, LT); S(31, 5, 12, LT)
  // salle a manger
  F(26, 1, 17, 26, 1, 22, 'mcwfurnitures:stripped_oak_table'); for (var z = 17; z <= 22; z++) { S(25, 1, z, MAT('stripped_oak_modern_chair', 'east')); S(27, 1, z, MAT('stripped_oak_modern_chair', 'west')) } S(26, 1, 16, MAT('stripped_oak_modern_chair', 'south')); S(26, 1, 23, MAT('stripped_oak_modern_chair', 'north'))
  S(26, 2, 19, 'minecraft:candle[candles=3,lit=false]'); S(26, 2, 21, 'minecraft:potted_white_tulip'); S(26, 5, 18, LT); S(26, 5, 21, LT)
  // salon : cheminee, ecran, canape d'angle
  F(28, 1, 17, 34, 4, 17, PB); S(31, 1, 17, 'minecraft:campfire[lit=true,facing=south]'); S(31, 2, 17, AIR); F(30, 3, 18, 32, 4, 18, 'minecraft:black_stained_glass_pane')
  F(29, 1, 19, 33, 1, 22, 'minecraft:white_carpet'); F(29, 1, 23, 33, 1, 23, 'mcwfurnitures:light_gray_couch[facing=north,shape=single]'); F(28, 1, 20, 28, 1, 22, 'mcwfurnitures:light_gray_couch[facing=east,shape=single]'); F(34, 1, 20, 34, 1, 22, 'mcwfurnitures:light_gray_couch[facing=west,shape=single]')
  S(28, 1, 23, 'mcwfurnitures:stripped_oak_end_table'); S(34, 1, 23, 'mcwfurnitures:stripped_oak_end_table'); S(28, 2, 23, 'minecraft:candle[candles=2,lit=false]'); S(34, 2, 23, 'minecraft:potted_azalea_bush'); F(30, 1, 21, 32, 1, 21, 'mcwfurnitures:stripped_oak_coffee_table')
  S(36, 1, 19, 'minecraft:potted_bamboo'); S(36, 1, 24, 'minecraft:potted_fern'); S(35, 1, 24, 'minecraft:jukebox'); S(31, 5, 20, LT); S(31, 5, 23, LT); S(35, 5, 21, LT)
  // ---------- volume B : etage en porte-a-faux (x20..45, z6..21) ----------
  F(20, 6, 6, 45, 6, 21, 'minecraft:smooth_stone'); F(21, 6, 7, 44, 6, 20, 'minecraft:birch_planks'); F(20, 6, 6, 45, 6, 6, BK); F(45, 6, 6, 45, 6, 21, BK)
  F(20, 7, 6, 45, 11, 6, SP); F(20, 7, 6, 20, 11, 21, SP); F(45, 7, 6, 45, 11, 21, GL); F(20, 7, 21, 45, 11, 21, GL)
  ;[20, 26, 32, 38, 45].forEach(x => F(x, 7, 21, x, 11, 21, BK)); ;[6, 12, 21].forEach(z => F(45, 7, z, 45, 11, z, BK))
  F(22, 8, 6, 25, 10, 6, GL); F(29, 8, 6, 32, 10, 6, GL); F(35, 8, 6, 37, 10, 6, GL)
  F(19, 12, 5, 46, 12, 22, TS); F(20, 12, 6, 45, 12, 21, 'minecraft:smooth_stone')
  F(45, 0, 6, 45, 5, 6, BK); F(45, 0, 21, 45, 5, 21, BK)
  F(22, 6, 20, 23, 6, 21, AIR); F(22, 6, 19, 23, 6, 19, 'minecraft:smooth_quartz_stairs[facing=north,half=bottom,shape=straight]'); F(21, 7, 20, 21, 7, 21, VP); F(24, 7, 20, 24, 7, 21, VP)
  F(21, 7, 18, 44, 11, 18, WC); F(25, 7, 19, 40, 7, 20, 'minecraft:gray_carpet'); S(21, 7, 19, 'minecraft:potted_bamboo'); S(44, 7, 20, 'minecraft:potted_fern'); S(44, 7, 19, 'minecraft:decorated_pot'); ;[28, 35, 42].forEach(x => S(x, 11, 19, LT))
  // bureau-bibliotheque et escalier vers le belvedere
  PORTE(24, 7, 18, 'minecraft:birch_door', 'south', 'left', 'false'); F(28, 7, 7, 28, 11, 17, WC)
  F(21, 7, 7, 21, 9, 17, 'minecraft:bookshelf'); F(21, 10, 7, 21, 10, 17, 'minecraft:chiseled_bookshelf[facing=east]'); S(22, 7, 7, 'minecraft:potted_fern'); S(25, 7, 7, 'minecraft:potted_bamboo')
  S(23, 7, 10, 'mcwfurnitures:dark_oak_desk[facing=north,connection=single]'); S(24, 7, 10, 'mcwfurnitures:dark_oak_desk[facing=north,connection=single]'); S(23, 7, 11, MAT('dark_oak_modern_chair', 'north')); S(23, 8, 10, 'minecraft:lantern'); S(24, 8, 10, 'supplementaries:book_pile')
  F(22, 7, 14, 22, 7, 15, 'mcwfurnitures:brown_couch[facing=east,shape=single]'); S(22, 7, 13, 'mcwfurnitures:dark_oak_end_table'); S(22, 8, 13, 'supplementaries:globe'); F(23, 7, 13, 25, 7, 16, 'minecraft:brown_carpet'); S(24, 11, 12, LT)
  for (var i = 0; i < 6; i++) F(26, 7 + i, 16 - i, 27, 7 + i, 16 - i, 'minecraft:smooth_quartz_stairs[facing=north,half=bottom,shape=straight]')
  F(25, 7, 11, 25, 11, 17, GL)
  // chambre d'amis
  PORTE(31, 7, 18, 'minecraft:birch_door', 'south', 'left', 'false'); F(34, 7, 7, 34, 11, 17, WC)
  LIT(31, 7, 8, 'light_gray', 'north'); S(30, 7, 7, 'mcwfurnitures:birch_end_table'); S(32, 7, 7, 'mcwfurnitures:birch_end_table'); S(30, 8, 7, 'minecraft:candle[candles=1,lit=false]'); S(32, 8, 7, 'minecraft:potted_white_tulip')
  F(33, 7, 12, 33, 7, 13, 'mcwfurnitures:birch_wardrobe[facing=west,connection=base,hinge=left]'); S(29, 7, 15, 'mcwfurnitures:birch_desk[facing=north,connection=single]'); S(29, 7, 16, MAT('birch_modern_chair', 'north')); F(30, 7, 10, 32, 7, 12, 'minecraft:light_blue_carpet'); S(31, 11, 11, LT); S(33, 7, 16, 'minecraft:potted_fern')
  // suite parentale : dressing, salle de bain, chambre vitree
  F(38, 7, 7, 38, 11, 17, WC); F(35, 7, 12, 37, 11, 12, WC); F(38, 7, 9, 38, 8, 9, AIR); PORTE(38, 7, 15, 'minecraft:birch_door', 'east', 'left', 'false'); PORTE(41, 7, 18, 'minecraft:birch_door', 'south', 'left', 'false')
  F(35, 7, 7, 35, 7, 11, 'mcwfurnitures:stripped_birch_wardrobe[facing=east,connection=base,hinge=left]'); F(37, 7, 7, 37, 7, 8, 'mcwfurnitures:stripped_birch_wardrobe[facing=west,connection=base,hinge=left]'); S(36, 7, 10, 'mcwfurnitures:white_chaise'); S(36, 11, 9, LT)
  F(35, 6, 13, 37, 6, 17, SQ); S(36, 7, 14, 'minecraft:water_cauldron[level=3]'); S(36, 7, 15, 'minecraft:water_cauldron[level=3]'); F(35, 7, 16, 35, 7, 17, 'mcwfurnitures:stripped_birch_kitchen_sink[facing=east,water=false]'); S(37, 7, 13, 'minecraft:quartz_stairs[facing=west,half=bottom,shape=straight]'); F(37, 7, 16, 37, 9, 16, GL); S(37, 10, 17, 'minecraft:end_rod[facing=down]'); S(36, 11, 16, LT)
  F(39, 7, 11, 44, 7, 16, 'minecraft:light_gray_carpet'); LIT(42, 7, 8, 'white', 'north'); LIT(43, 7, 8, 'white', 'north'); S(41, 7, 7, 'mcwfurnitures:stripped_birch_end_table'); S(44, 7, 7, 'mcwfurnitures:stripped_birch_end_table'); S(41, 8, 7, 'minecraft:candle[candles=2,lit=false]'); S(44, 8, 7, 'minecraft:candle[candles=2,lit=false]')
  F(42, 7, 10, 43, 7, 10, 'mcwfurnitures:white_chaise'); F(44, 7, 13, 44, 7, 14, 'mcwfurnitures:white_couch[facing=east,shape=single]'); S(44, 7, 15, 'minecraft:potted_bamboo'); S(39, 7, 16, 'minecraft:potted_azalea_bush'); S(42, 11, 9, LT); S(41, 11, 14, LT)
  // ---------- volume C : belvedere vitre et toit-terrasse ----------
  F(25, 12, 10, 32, 12, 16, DK); F(26, 12, 12, 27, 12, 13, AIR); F(26, 12, 11, 27, 12, 11, 'minecraft:smooth_quartz_stairs[facing=north,half=bottom,shape=straight]')
  W(24, 9, 33, 17, 13, 16, GL); ;[[24, 9], [33, 9], [24, 17], [33, 17]].forEach(c => F(c[0], 13, c[1], c[0], 16, c[1], BK)); F(23, 17, 8, 34, 17, 18, TS); F(24, 17, 9, 33, 17, 17, 'minecraft:smooth_stone')
  PORTE(28, 13, 17, 'mcwdoors:dark_oak_glass_door', 'south', 'left', 'false'); PORTE(29, 13, 17, 'mcwdoors:dark_oak_glass_door', 'south', 'right', 'false')
  F(25, 13, 12, 25, 13, 14, VP); F(28, 13, 12, 28, 13, 14, VP); F(26, 13, 14, 27, 13, 14, VP)
  F(30, 13, 10, 32, 13, 10, MAT('stripped_dark_oak_counter', 'south')); S(30, 14, 10, 'supplementaries:jar'); S(32, 14, 10, 'minecraft:potted_white_tulip'); S(30, 13, 11, 'mcwfurnitures:stripped_dark_oak_stool_chair'); S(32, 13, 11, 'mcwfurnitures:stripped_dark_oak_stool_chair')
  F(30, 13, 14, 32, 13, 14, 'mcwfurnitures:black_couch[facing=south,shape=single]'); S(31, 13, 15, 'mcwfurnitures:stripped_dark_oak_coffee_table'); S(25, 13, 16, 'minecraft:lightning_rod'); S(32, 13, 16, 'minecraft:potted_bamboo'); S(28, 16, 13, LT); S(31, 16, 12, LT)
  for (var x = 25; x <= 32; x += 2) S(x, 18, 13, 'minecraft:daylight_detector')
  W(20, 6, 45, 21, 13, 13, VP); F(35, 12, 7, 44, 12, 20, 'minecraft:spruce_planks')
  F(38, 13, 12, 42, 13, 16, SQ); F(39, 13, 13, 41, 13, 15, 'minecraft:water'); ;[36, 38, 40].forEach(x => S(x, 13, 8, 'mcwfurnitures:white_chaise')); F(42, 13, 19, 42, 15, 19, 'minecraft:spruce_fence'); F(41, 16, 18, 43, 16, 20, 'minecraft:white_wool')
  ;[[21, 7], [44, 7], [21, 16], [44, 20]].forEach(c => { S(c[0], 13, c[1], 'supplementaries:planter'); S(c[0], 14, c[1], 'minecraft:flowering_azalea') })
  F(21, 13, 19, 21, 13, 20, 'mcwfurnitures:white_couch[facing=east,shape=single]'); S(22, 13, 19, 'mcwfurnitures:spruce_coffee_table')
  // toit vegetal du rez-de-chaussee
  F(15, 6, 11, 19, 6, 24, 'minecraft:moss_block'); F(20, 6, 22, 36, 6, 24, 'minecraft:moss_block'); F(22, 6, 22, 23, 6, 24, 'minecraft:smooth_stone')
  for (var x = 15; x <= 36; x++) for (var z = 11; z <= 24; z++) if ((x < 20 || z > 21) && R() < 0.12) SA(x, 7, z, choix(['minecraft:azalea', 'minecraft:short_grass', 'minecraft:fern']))
  // ---------- cuisine d'ete sous le porte-a-faux ----------
  F(38, -1, 6, 44, -1, 21, 'minecraft:spruce_planks'); F(44, 0, 9, 44, 0, 14, MAT('stripped_dark_oak_counter', 'west')); S(44, 0, 11, 'farmersdelight:stove[facing=west,lit=false]'); S(44, 1, 11, 'farmersdelight:cooking_pot'); S(44, 0, 13, 'mcwfurnitures:stripped_dark_oak_kitchen_sink[facing=west,water=false]'); S(44, 1, 9, 'minecraft:potted_bamboo')
  F(40, 0, 15, 41, 0, 18, 'mcwfurnitures:spruce_table'); for (var z = 15; z <= 18; z++) { S(39, 0, z, MAT('spruce_modern_chair', 'east')); S(42, 0, z, MAT('spruce_modern_chair', 'west')) } S(40, 0, 14, MAT('spruce_modern_chair', 'south')); S(41, 0, 19, MAT('spruce_modern_chair', 'north'))
  S(40, 1, 16, 'minecraft:candle[candles=3,lit=false]'); ;[[40, 10], [41, 17], [42, 13]].forEach(c => S(c[0], 5, c[1], LT))
  // ---------- piscine, plage, salon exterieur ----------
  F(14, -1, 26, 46, -1, 45, 'minecraft:smooth_stone'); F(16, -1, 28, 44, -1, 39, 'minecraft:spruce_planks')
  F(17, -5, 30, 43, -1, 37, 'minecraft:light_blue_terracotta'); F(18, -4, 31, 42, -1, 36, 'minecraft:water'); W(17, 30, 43, 37, -1, -1, SQ)
  ;[33, 34].forEach(z => { S(17, -3, z, 'minecraft:sea_lantern'); S(43, -3, z, 'minecraft:sea_lantern') }); for (var x = 21; x <= 39; x += 6) { S(x, -3, 30, 'minecraft:sea_lantern'); S(x, -3, 37, 'minecraft:sea_lantern') }
  ;[19, 21, 23, 31, 33, 35].forEach(x => S(x, 0, 28, 'mcwfurnitures:white_chaise')); parasol(27, 28); parasol(39, 28); S(25, 0, 28, 'minecraft:potted_bamboo'); S(29, 0, 28, 'minecraft:potted_bamboo')
  F(31, -1, 40, 41, -1, 45, DK); S(36, 0, 42, 'minecraft:campfire[lit=true,facing=south]'); S(36, 0, 43, 'minecraft:polished_blackstone_slab[type=bottom]'); S(35, 0, 42, 'minecraft:polished_blackstone_slab[type=bottom]'); S(37, 0, 42, 'minecraft:polished_blackstone_slab[type=bottom]'); S(36, 0, 41, 'minecraft:polished_blackstone_slab[type=bottom]')
  F(33, 0, 45, 39, 0, 45, 'mcwfurnitures:white_couch[facing=north,shape=single]'); F(32, 0, 41, 32, 0, 44, 'mcwfurnitures:white_couch[facing=east,shape=single]'); F(40, 0, 41, 40, 0, 44, 'mcwfurnitures:white_couch[facing=west,shape=single]')
  ;[[32, 45], [40, 45]].forEach(c => { S(c[0], 0, c[1], 'mcwfurnitures:spruce_end_table'); S(c[0], 1, c[1], 'minecraft:lantern') })
  arbre(45, 30, 'minecraft:birch_log[axis=y]', 'minecraft:birch_leaves[persistent=true]', 5); arbre(45, 38, 'minecraft:birch_log[axis=y]', 'minecraft:birch_leaves[persistent=true]', 6); arbre(16, 42, 'minecraft:cherry_log[axis=y]', 'minecraft:cherry_leaves[persistent=true]', 4); arbre(26, 43, 'minecraft:birch_log[axis=y]', 'minecraft:birch_leaves[persistent=true]', 5)
  ;[[15, 27], [44, 27], [15, 40], [44, 40], [30, 46]].forEach(c => SA(c[0], 0, c[1], 'mcwlights:garden_light'))
  // ---------- jardin zen au nord ----------
  F(14, -1, 1, 46, -1, 8, 'minecraft:gravel'); for (var x = 14; x <= 46; x++) if (x % 3 == 0) F(x, -1, 2, x, -1, 7, 'minecraft:light_gray_concrete_powder')
  F(30, -2, 1, 38, -2, 4, 'minecraft:moss_block'); F(30, -1, 1, 38, -1, 4, 'minecraft:water'); SA(31, 0, 2, 'minecraft:lily_pad'); SA(36, 0, 3, 'minecraft:lily_pad'); F(34, -1, 1, 34, -1, 4, 'minecraft:smooth_stone')
  for (var x = 15; x <= 17; x++) for (var z = 2; z <= 4; z++) if (R() < 0.8) F(x, 0, z, x, 3 + Math.floor(R() * 3), z, 'minecraft:bamboo[age=0,leaves=large,stage=0]')
  ;[[24, 3], [42, 4]].forEach(c => { S(c[0], 0, c[1], 'minecraft:stone_brick_wall'); S(c[0], 1, c[1], 'minecraft:lantern') }); F(20, 0, 5, 21, 0, 5, 'minecraft:mossy_cobblestone'); S(20, 1, 5, 'minecraft:mossy_cobblestone'); S(27, 0, 4, 'minecraft:mossy_cobblestone')
  arbre(40, 7, 'minecraft:cherry_log[axis=y]', 'minecraft:cherry_leaves[persistent=true]', 4)
}

// Banc d'essai des orientations de meubles (tout est ecrit pour regarder vers le sud)
function testOrient() {
  var L = ['mcwfurnitures:oak_chair[facing=south]', 'mcwfurnitures:gray_couch[facing=south,shape=single]', 'mcwfurnitures:oak_counter[facing=south]', 'mcwfurnitures:oak_kitchen_sink[facing=south,water=false]', 'mcwfurnitures:oak_drawer[facing=south]', 'mcwfurnitures:oak_wardrobe[facing=south,connection=base,hinge=left]', 'mcwfurnitures:oak_kitchen_cabinet[facing=south,hinge=left]', 'mcwfurnitures:oak_bookshelf[facing=south,connection=base]', 'mcwfurnitures:oak_modern_chair[facing=south]', 'mcwfurnitures:oak_desk[facing=north,connection=single]', 'mcwfurnitures:oak_end_table', 'minecraft:quartz_stairs[facing=south,half=bottom,shape=straight]']
  F(0, -1, 0, 24, -1, 3, 'minecraft:smooth_stone'); F(0, 0, 0, 24, 2, 0, 'minecraft:white_concrete')
  L.forEach((b, i) => S(i * 2, b.indexOf('cabinet') > 0 ? 1 : 0, 1, b))
}
