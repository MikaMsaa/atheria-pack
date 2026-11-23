
// ================= MAISON DE MAITRE NEO-GOTHIQUE =================
function gothique() {
  var DB = 'minecraft:deepslate_bricks', PB = 'minecraft:polished_blackstone_bricks', PD = 'minecraft:polished_deepslate', VG = 'minecraft:purple_stained_glass_pane', BL = 'blackstone'
  function OGIVE(x, y, z, f1, f2, h) { F(x, y, z, x + 1, y + h - 1, z, VG); S(x, y + h, z, 'minecraft:polished_blackstone_brick_stairs[facing=' + f1 + ',half=top,shape=straight]'); S(x + 1, y + h, z, 'minecraft:polished_blackstone_brick_stairs[facing=' + f2 + ',half=top,shape=straight]') }
  F(0, -1, 0, 15, -1, 15, 'minecraft:podzol'); F(0, -1, 12, 15, -1, 15, 'minecraft:grass_block')
  F(1, 0, 2, 11, 0, 10, PD); W(1, 2, 11, 10, 1, 11, DB); F(2, 6, 3, 10, 6, 9, 'minecraft:dark_oak_planks'); F(2, 12, 3, 10, 12, 9, 'minecraft:dark_oak_planks')
  ;[0, 6, 12].forEach(y => { F(1, y, 2, 11, y, 2, PB); F(1, y, 10, 11, y, 10, PB); F(1, y, 2, 1, y, 10, PB); F(11, y, 2, 11, y, 10, PB) })
  ;[1, 4, 8, 11].forEach(x => { F(x, 1, 11, x, 11, 11, PB); S(x, 12, 11, 'minecraft:polished_blackstone_brick_wall') })
  // fenetres en ogive
  OGIVE(2, 1, 10, 'west', 'east', 3); OGIVE(9, 1, 10, 'west', 'east', 3); OGIVE(2, 7, 10, 'west', 'east', 3); OGIVE(5, 7, 10, 'west', 'east', 3); OGIVE(9, 7, 10, 'west', 'east', 3)
  ;[3, 7].forEach(z => { F(1, 2, z, 1, 4, z, VG); F(1, 8, z, 1, 10, z, VG) }); ;[4, 8].forEach(x => { F(x, 2, 2, x, 4, 2, VG); F(x, 8, 2, x, 10, 2, VG) })
  // portail : porte mystique sous arc brise, perron
  F(5, 1, 10, 7, 5, 10, PB); PORTE(6, 1, 10, 'mcwdoors:dark_oak_mystic_door', 'north', 'left', 'false'); S(5, 1, 10, AIR); F(5, 1, 10, 5, 2, 10, PB); S(7, 1, 10, PB)
  S(6, 3, 10, VG); S(5, 3, 10, 'minecraft:polished_blackstone_brick_stairs[facing=west,half=top,shape=straight]'); S(7, 3, 10, 'minecraft:polished_blackstone_brick_stairs[facing=east,half=top,shape=straight]'); S(6, 4, 10, 'minecraft:chiseled_polished_blackstone')
  F(5, 0, 11, 7, 0, 12, 'minecraft:polished_blackstone_brick_stairs[facing=north,half=bottom,shape=straight]'); S(5, 1, 12, 'minecraft:soul_lantern[hanging=false]'.replace('[hanging=false]', '')); S(7, 1, 12, 'minecraft:soul_lantern')
  // toit tres pentu en ardoise noire, pignon sur rue avec lucarne
  for (var k = 0; k < 7; k++) { F(0, 12 + k, 1 + k, 12, 12 + k, 1 + k, TOIT('south', BL)); F(0, 12 + k, 11 - k, 12, 12 + k, 11 - k, TOIT('north', BL)) }
  for (var z = 2; z <= 10; z++) { var h = 12 + Math.min(z - 1, 11 - z) - 1; F(1, 13, z, 1, h, z, DB); F(11, 13, z, 11, h, z, DB) }
  F(1, 15, 5, 1, 16, 7, VG); F(5, 13, 11, 7, 14, 11, DB); S(6, 13, 11, VG); S(6, 14, 11, VG); S(5, 15, 11, TOIT('east', BL)); S(7, 15, 11, TOIT('west', BL)); S(6, 15, 11, 'mcwroofs:blackstone_roof_block'.replace('blackstone_roof_block', 'black_roof_block')); S(6, 16, 11, 'minecraft:lightning_rod')
  F(3, 19, 6, 9, 19, 6, 'minecraft:polished_blackstone_wall'); S(2, 19, 6, 'minecraft:end_rod'); S(10, 19, 6, 'minecraft:end_rod')
  // tourelle d'angle a toit en poivriere
  F(11, 0, 8, 14, 0, 11, PD); W(11, 8, 14, 11, 1, 17, DB); F(12, 6, 9, 13, 6, 10, 'minecraft:dark_oak_planks'); F(12, 12, 9, 13, 12, 10, 'minecraft:dark_oak_planks')
  ;[[14, 9], [14, 10]].forEach(c => { F(c[0], 2, c[1], c[0], 4, c[1], VG); F(c[0], 8, c[1], c[0], 10, c[1], VG); F(c[0], 14, c[1], c[0], 16, c[1], VG) }); F(12, 14, 11, 13, 16, 11, VG)
  F(11, 18, 8, 14, 18, 11, PB); F(10, 18, 7, 15, 18, 12, 'minecraft:polished_blackstone_brick_slab[type=top]')
  F(11, 19, 8, 14, 19, 8, TOIT('south', BL)); F(11, 19, 11, 14, 19, 11, TOIT('north', BL)); F(11, 19, 9, 11, 19, 10, TOIT('east', BL)); F(14, 19, 9, 14, 19, 10, TOIT('west', BL))
  F(12, 20, 9, 13, 20, 9, TOIT('south', BL)); F(12, 20, 10, 13, 20, 10, TOIT('north', BL)); F(12, 21, 9, 13, 22, 10, 'minecraft:polished_blackstone_wall'); S(12, 23, 9, 'minecraft:lightning_rod')
  // grille en fer forge, jardin mort, statue
  F(0, 0, 15, 15, 0, 15, 'mcwfences:gothic_metal_fence'); F(5, 0, 15, 7, 0, 15, AIR); F(0, 0, 12, 0, 0, 14, 'mcwfences:gothic_metal_fence'); F(15, 0, 12, 15, 0, 14, 'mcwfences:gothic_metal_fence')
  F(6, -1, 13, 6, -1, 15, 'minecraft:gravel'); S(2, 0, 13, 'minecraft:polished_blackstone'); S(2, 1, 13, 'minecraft:polished_blackstone_wall'); S(2, 2, 13, 'minecraft:wither_skeleton_skull[rotation=0]')
  ;[[11, 13], [13, 14], [1, 1], [14, 3]].forEach(c => { F(c[0], 0, c[1], c[0], 3, c[1], 'minecraft:dark_oak_log[axis=y]'); S(c[0] + 1, 2, c[1], 'minecraft:dark_oak_fence'); S(c[0], 4, c[1], 'minecraft:dark_oak_fence') })
  for (var x = 0; x <= 15; x++) for (var z = 11; z <= 14; z++) if (R() < 0.3) SA(x, 0, z, R() < 0.5 ? 'minecraft:dead_bush' : 'minecraft:wither_rose')
  // interieur : bibliotheque et salon
  F(2, 1, 3, 2, 4, 9, 'minecraft:bookshelf'); F(4, 1, 3, 9, 1, 3, 'mcwfurnitures:dark_oak_bookshelf[facing=south,connection=base]'); F(3, 1, 5, 4, 1, 7, 'minecraft:red_carpet')
  S(5, 1, 6, 'mcwfurnitures:red_couch[facing=west,shape=single]'.replace('red_couch', 'black_couch')); S(3, 1, 6, 'mcwfurnitures:dark_oak_desk[facing=north,connection=single]'); S(3, 2, 6, 'minecraft:candle[candles=4,lit=false]')
  S(6, 5, 6, 'mcwlights:iron_chandelier'); F(8, 1, 6, 9, 1, 7, 'mcwfurnitures:dark_oak_table'); S(10, 1, 6, MAT('dark_oak_chair', 'west')); S(10, 1, 7, MAT('dark_oak_chair', 'west'))
  for (var i = 0; i < 5; i++) S(13, 1 + i, 9 + (i % 2), 'minecraft:dark_oak_stairs[facing=' + (i % 2 ? 'north' : 'south') + ',half=bottom,shape=straight]')
  LIT(4, 7, 4, 'black', 'north'); LIT(5, 7, 4, 'black', 'north'); S(3, 7, 3, 'mcwfurnitures:dark_oak_end_table'); S(3, 8, 3, 'minecraft:candle[candles=2,lit=false]'); F(8, 7, 3, 9, 8, 3, 'mcwfurnitures:dark_oak_wardrobe[facing=south,connection=base,hinge=left]')
}

// ================= TOUR DE BUREAUX (verre) =================
function verre() {
  var GC = 'minecraft:light_blue_stained_glass', AL = 'minecraft:light_gray_concrete', IR = 'minecraft:iron_block'
  F(0, -1, 0, 15, -1, 15, 'minecraft:smooth_stone'); F(1, 0, 1, 14, 0, 14, 'minecraft:polished_diorite')
  // socle double hauteur, angle coupe, auvent
  for (var f = 0; f < 7; f++) {
    var yb = f == 0 ? 0 : 6 + (f - 1) * 5, h = f == 0 ? 6 : 5
    W(2, 2, 13, 13, yb + 1, yb + h - 1, GC); if (f > 0) F(2, yb, 2, 13, yb, 13, AL)
    F(2, yb, 2, 13, yb, 2, IR); F(2, yb, 13, 13, yb, 13, IR); F(2, yb, 2, 2, yb, 13, IR); F(13, yb, 2, 13, yb, 13, IR)
    ;[2, 6, 9, 13].forEach(p => { F(p, yb + 1, 2, p, yb + h - 1, 2, AL); F(p, yb + 1, 13, p, yb + h - 1, 13, AL); F(2, yb + 1, p, 2, yb + h - 1, p, AL); F(13, yb + 1, p, 13, yb + h - 1, p, AL) })
  }
  for (var y = 1; y <= 35; y++) { S(13, y, 13, AIR); S(12, y, 13, GC); S(13, y, 12, GC) }
  F(4, 1, 13, 11, 5, 13, 'minecraft:glass_pane'); PORTE(7, 1, 13, 'mcwdoors:metal_door', 'north', 'left', 'false'); PORTE(8, 1, 13, 'mcwdoors:metal_door', 'north', 'right', 'false')
  F(3, 6, 14, 12, 6, 15, 'minecraft:smooth_stone_slab[type=top]'); F(3, 5, 15, 3, 1, 15, IR); F(12, 5, 15, 12, 1, 15, IR)
  F(4, 6, 15, 11, 6, 15, 'minecraft:light_gray_concrete'); ;['A', 'T', 'H', 'E', 'R', 'I', 'A'].forEach((c, i) => 0)
  S(7, 7, 15, 'minecraft:oak_wall_sign[facing=south]{front_text:{has_glowing_text:1b,color:"white",messages:[\'""\',\'"ATHERIA"\',\'"CORP."\',\'""\']}}'.replace('oak_wall_sign[facing=south]', 'dark_oak_sign[rotation=0]'))
  // toit : heliport, edicule, antenne
  F(2, 36, 2, 13, 36, 13, AL); W(2, 2, 13, 13, 37, 37, 'minecraft:iron_bars')
  F(4, 36, 4, 11, 36, 11, 'minecraft:gray_concrete'); F(6, 36, 6, 6, 36, 9, 'minecraft:yellow_concrete'); F(9, 36, 6, 9, 36, 9, 'minecraft:yellow_concrete'); F(7, 36, 7, 8, 36, 8, 'minecraft:yellow_concrete'); F(7, 36, 8, 8, 36, 8, 'minecraft:gray_concrete')
  F(10, 37, 2, 12, 39, 4, AL); F(3, 37, 11, 3, 44, 11, 'minecraft:iron_bars'); S(3, 45, 11, 'minecraft:lightning_rod'); S(3, 46, 11, 'minecraft:redstone_lamp[lit=true]')
  // hall : banque d'accueil, plantes, ascenseurs
  F(5, 1, 6, 10, 1, 6, MAT('stripped_dark_oak_counter', 'south')); S(7, 2, 6, 'minecraft:daylight_detector'); S(9, 2, 6, 'supplementaries:book_pile')
  F(4, 1, 3, 11, 5, 3, 'minecraft:polished_andesite'); F(6, 1, 3, 7, 3, 3, 'minecraft:iron_block'); F(9, 1, 3, 10, 3, 3, 'minecraft:iron_block'); S(8, 4, 3, 'minecraft:redstone_lamp[lit=true]')
  ;[[3, 12], [12, 4], [3, 4]].forEach(c => { S(c[0], 1, c[1], 'minecraft:decorated_pot'); S(c[0], 2, c[1], 'minecraft:azalea_leaves[persistent=true]') })
  F(4, 1, 9, 6, 1, 9, 'mcwfurnitures:black_couch[facing=south,shape=single]'); S(5, 1, 10, 'mcwfurnitures:stripped_dark_oak_glass_table'); S(8, 5, 9, 'mcwlights:white_ceiling_light')
  // bureaux du 1er : plateau ouvert
  for (var x = 4; x <= 11; x += 3) for (var z = 5; z <= 10; z += 3) { S(x, 7, z, 'mcwfurnitures:stripped_dark_oak_desk[facing=north,connection=single]'); S(x, 7, z + 1, MAT('stripped_dark_oak_chair', 'north')); S(x, 8, z, 'minecraft:black_stained_glass_pane') }
  S(4, 7, 12, 'minecraft:barrel[facing=up,open=false]'); S(11, 7, 12, 'minecraft:water_cauldron[level=1]')
  // pied de tour : bancs, papiers, voiture de police
  F(1, 0, 14, 1, 0, 15, 'mcwfurnitures:white_couch[facing=east,shape=single]'.replace('white_couch', 'gray_couch')); S(14, 0, 14, 'supplementaries:sack')
  F(0, 0, 0, 3, 0, 0, 'minecraft:white_concrete'); F(0, 1, 0, 2, 1, 0, 'minecraft:black_concrete'); S(1, 2, 0, 'minecraft:blue_stained_glass'); S(2, 2, 0, 'minecraft:red_stained_glass')
}

// ================= ATELIER INDUSTRIEL (rouille) =================
function rouille() {
  var BR = 'minecraft:bricks', CU = 'minecraft:weathered_cut_copper', CO = 'minecraft:oxidized_cut_copper', IR = 'minecraft:iron_block'
  F(0, -1, 0, 15, -1, 15, 'minecraft:gravel'); F(1, 0, 1, 12, 0, 14, 'minecraft:smooth_stone')
  W(1, 1, 12, 14, 1, 3, BR); W(1, 1, 12, 14, 4, 9, CU)
  for (var y = 4; y <= 9; y++) for (var z = 1; z <= 14; z++) if ((y + z) % 5 == 0) { S(1, y, z, CO); S(12, y, z, CO) }
  F(2, 10, 1, 11, 10, 1, CU); F(2, 10, 14, 11, 10, 14, CU)
  // sheds : toiture en dents de scie, verrieres au nord
  for (var s = 0; s < 3; s++) { var z0 = 2 + s * 4; F(1, 10, z0, 12, 10, z0, 'minecraft:glass'); F(1, 11, z0, 12, 11, z0, 'minecraft:glass'); F(1, 10, z0 + 1, 12, 10, z0 + 1, 'minecraft:weathered_cut_copper_stairs[facing=north,half=bottom,shape=straight]'.replace('north', 'south')); F(1, 11, z0 + 1, 12, 11, z0 + 1, 'minecraft:weathered_cut_copper_slab[type=bottom]'); F(1, 10, z0 + 2, 12, 10, z0 + 3, 'minecraft:weathered_cut_copper_slab[type=top]') }
  F(1, 10, 14, 12, 10, 14, CU)
  // facade : grande porte roulante, quai, enseigne
  F(4, 1, 14, 9, 6, 14, AIR); F(4, 4, 14, 9, 6, 14, 'minecraft:iron_trapdoor[facing=south,half=top,open=false]'); F(4, 3, 15, 9, 3, 15, 'minecraft:iron_trapdoor[facing=south,half=top,open=false]'.replace('open=false', 'open=false'))
  F(3, 1, 14, 3, 7, 14, IR); F(10, 1, 14, 10, 7, 14, IR); F(3, 7, 14, 10, 7, 14, 'minecraft:iron_block')
  S(6, 8, 15, 'minecraft:spruce_wall_sign[facing=south]{front_text:{color:"white",messages:[\'""\',\'"METALLURGIE"\',\'"DUVAL & FILS"\',\'""\']}}'); F(2, 2, 14, 2, 3, 14, 'minecraft:iron_bars'); F(11, 2, 14, 11, 3, 14, 'minecraft:iron_bars')
  ;[3, 7, 11].forEach(z => { F(12, 5, z, 12, 7, z + 1, 'minecraft:glass_pane'); F(1, 5, z, 1, 7, z + 1, 'minecraft:glass_pane') })
  // haute cheminee de briques
  F(13, 0, 2, 15, 0, 4, BR); F(13, 1, 2, 15, 22, 4, BR); F(14, 1, 3, 14, 23, 3, AIR); ;[8, 14, 20].forEach(y => F(13, y, 2, 15, y, 4, 'minecraft:mud_bricks')); F(13, 23, 2, 15, 23, 4, 'minecraft:brick_wall')
  F(13, 6, 1, 13, 22, 1, 'minecraft:ladder[facing=north]'.replace('north', 'north'))
  // passerelle, cuve et tuyauterie
  F(13, 6, 6, 15, 6, 12, 'createdeco:andesite_catwalk'); F(15, 7, 6, 15, 7, 12, 'createdeco:andesite_catwalk_railing'.replace('andesite_catwalk_railing', 'zinc_catwalk_railing')); F(14, 0, 9, 15, 5, 11, 'minecraft:oxidized_copper'); S(14, 6, 10, 'minecraft:iron_trapdoor[facing=south,half=bottom,open=false]')
  F(12, 8, 8, 14, 8, 8, 'create:fluid_pipe'.replace('create:fluid_pipe', 'minecraft:copper_block')); F(15, 0, 7, 15, 5, 7, 'createdeco:industrial_iron_support'.replace('createdeco:industrial_iron_support', 'minecraft:chain[axis=y]'))
  // interieur : machines, etablis, pont roulant
  F(3, 1, 3, 4, 2, 4, 'minecraft:blast_furnace[facing=south,lit=false]'.replace('[facing=south,lit=false]', '')); S(3, 1, 3, 'minecraft:blast_furnace[facing=south,lit=false]'); S(4, 1, 3, 'minecraft:smithing_table'); S(3, 1, 4, 'minecraft:anvil[facing=east]'); S(4, 1, 4, 'minecraft:grindstone[face=floor,facing=north]')
  F(9, 1, 3, 11, 1, 3, 'minecraft:barrel[facing=up,open=false]'); F(10, 1, 4, 11, 2, 4, 'minecraft:iron_block'); S(11, 3, 4, 'minecraft:hopper')
  F(2, 9, 6, 11, 9, 6, 'minecraft:iron_bars'); F(6, 6, 6, 6, 8, 6, 'minecraft:chain[axis=y]'); S(6, 5, 6, 'minecraft:anvil[facing=north]'.replace('anvil', 'chipped_anvil'))
  F(3, 1, 9, 5, 1, 10, 'minecraft:black_concrete'); F(4, 2, 9, 4, 2, 10, 'minecraft:tinted_glass'); S(3, 1, 11, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=true]')
  ;[[8, 9], [9, 11], [10, 10], [8, 12]].forEach(c => S(c[0], 1, c[1], 'minecraft:barrel[facing=' + (R() < 0.5 ? 'up' : 'east') + ',open=false]')); S(2, 1, 12, 'minecraft:crafting_table')
  // cour : palettes, ferraille, flaques d'huile
  F(13, 0, 13, 15, 0, 15, 'minecraft:spruce_slab[type=bottom]'); S(14, 1, 14, 'minecraft:barrel[facing=up,open=false]'); S(0, 0, 3, 'minecraft:iron_bars'); S(0, 0, 4, 'minecraft:chain[axis=x]')
  ;[[2, 15], [0, 10], [11, 15]].forEach(c => S(c[0], -1, c[1], 'minecraft:black_concrete_powder')); F(0, 0, 6, 0, 1, 8, 'minecraft:oxidized_cut_copper')
}

// ================= BIDONVILLE =================
function bidonville() {
  var mats = ['minecraft:weathered_copper', 'minecraft:spruce_planks', 'minecraft:blue_terracotta', 'minecraft:oak_planks', 'minecraft:yellow_terracotta', 'minecraft:oxidized_cut_copper', 'atheria:carrosserie']
  function M() { return mats[Math.floor(R() * mats.length)] }
  function cabane(x1, y1, z1, x2, z2, h, porte) {
    F(x1, y1, z1, x2, y1, z2, 'minecraft:spruce_planks')
    for (var y = y1 + 1; y <= y1 + h; y++) for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) if (x == x1 || x == x2 || z == z1 || z == z2) S(x, y, z, M())
    F(x1 + 1, y1 + 1, z1 + 1, x2 - 1, y1 + h, z2 - 1, AIR)
    F(x1 - 1, y1 + h + 1, z1 - 1, x2 + 1, y1 + h + 1, z2 + 1, R() < 0.5 ? 'minecraft:weathered_cut_copper_slab[type=bottom]' : 'minecraft:oxidized_cut_copper_slab[type=bottom]')
    S(porte[0], y1 + 1, porte[1], AIR); S(porte[0], y1 + 2, porte[1], AIR); S(porte[0], y1 + 1, porte[1], 'minecraft:spruce_door[facing=' + porte[2] + ',half=lower,hinge=left,open=true]'); S(porte[0], y1 + 2, porte[1], 'minecraft:spruce_door[facing=' + porte[2] + ',half=upper,hinge=left,open=true]')
  }
  F(0, -1, 0, 15, -1, 15, 'minecraft:coarse_dirt'); for (var x = 0; x <= 15; x++) for (var z = 0; z <= 15; z++) if (R() < 0.25) S(x, -1, z, 'minecraft:mud')
  cabane(1, 0, 1, 6, 6, 3, [4, 6, 'south']); cabane(9, 0, 2, 14, 7, 4, [11, 7, 'south']); cabane(2, 4, 2, 5, 5, 2, [5, 4, 'east']); cabane(10, 5, 3, 13, 6, 3, [10, 5, 'west'])
  cabane(3, 0, 9, 7, 13, 3, [7, 11, 'east'])
  // passerelles, echelles, cordes
  F(6, 4, 4, 9, 4, 4, 'minecraft:spruce_slab[type=top]'); F(6, 5, 4, 9, 5, 4, 'minecraft:spruce_fence'.replace('spruce_fence', 'air')); S(7, 5, 3, 'minecraft:spruce_fence'); S(8, 5, 3, 'minecraft:spruce_fence')
  F(6, 1, 3, 6, 4, 3, 'minecraft:ladder[facing=west]'.replace('west', 'east')); F(14, 1, 8, 14, 5, 8, 'minecraft:ladder[facing=south]')
  F(1, 5, 7, 7, 5, 7, 'minecraft:chain[axis=x]'); ;[2, 4, 6].forEach(x => S(x, 4, 7, 'minecraft:' + ['red', 'blue', 'yellow'][x % 3] + '_wall_banner[facing=south]'.replace('_wall_banner[facing=south]', '_carpet').replace('carpet', 'banner[rotation=0]')))
  // bache, bidons de recuperation d'eau, potager
  F(8, 3, 9, 14, 3, 13, 'minecraft:blue_carpet'.replace('blue_carpet', 'air')); for (var x = 9; x <= 14; x++) S(x, 3, 9 + (x % 2), 'minecraft:blue_wool'.replace('wool', 'carpet'))
  ;[[9, 10], [14, 10], [9, 13], [14, 13]].forEach(c => F(c[0], 0, c[1], c[0], 2, c[1], 'minecraft:spruce_fence')); F(9, 3, 10, 14, 3, 13, 'minecraft:blue_carpet'.replace('carpet', 'wool')); F(10, 3, 11, 13, 3, 12, 'minecraft:light_blue_carpet'.replace('light_blue_carpet', 'blue_wool'))
  F(10, 0, 11, 11, 0, 12, 'minecraft:farmland[moisture=7]'.replace('farmland[moisture=7]', 'composter[level=4]')); S(12, 0, 11, 'minecraft:water_cauldron[level=3]'); S(13, 0, 12, 'minecraft:barrel[facing=up,open=true]')
  ;[[0, 9], [1, 14], [15, 1]].forEach(c => S(c[0], 0, c[1], 'minecraft:water_cauldron[level=' + (1 + Math.floor(R() * 3)) + ']'))
  F(13, 8, 4, 13, 9, 4, 'minecraft:spruce_fence'); S(13, 10, 4, 'minecraft:lightning_rod'); S(4, 9, 3, 'minecraft:iron_trapdoor[facing=south,half=bottom,open=true]')
  // interieurs sommaires
  LIT(2, 1, 2, 'brown', 'west'); S(5, 1, 2, 'minecraft:crafting_table'); S(5, 1, 5, 'supplementaries:sack'); S(2, 1, 5, 'minecraft:campfire[lit=false,facing=north]'.replace('campfire', 'cauldron').replace('[lit=false,facing=north]', ''))
  S(10, 1, 3, 'minecraft:chest[facing=east]'); LIT(13, 1, 4, 'gray', 'north'); S(12, 1, 6, 'minecraft:candle[candles=3,lit=false]'); S(4, 1, 10, 'minecraft:barrel[facing=up,open=false]'); LIT(5, 1, 12, 'red', 'south'.replace('south', 'west'))
  S(3, 5, 3, 'supplementaries:sack'); S(11, 6, 4, 'minecraft:chest[facing=south]')
  for (var x = 0; x <= 15; x++) for (var z = 0; z <= 15; z++) if (R() < 0.12) SA(x, 0, z, ['minecraft:short_grass', 'minecraft:dead_bush', 'supplementaries:sack'][Math.floor(R() * 3)])
}

// ================= CASERNE (garnison) =================
function garnison() {
  var CC = 'minecraft:gray_concrete', OL = 'minecraft:green_terracotta', SAC = 'supplementaries:sack'
  F(0, -1, 0, 15, -1, 15, 'minecraft:gravel'); F(1, -1, 1, 14, -1, 9, 'minecraft:packed_mud')
  // baraquement en beton peint
  F(2, 0, 2, 13, 0, 8, CC); W(2, 2, 13, 8, 1, 4, OL); F(2, 1, 2, 13, 1, 8, CC); F(3, 1, 3, 12, 1, 7, 'minecraft:air'); F(3, 0, 3, 12, 0, 7, 'minecraft:polished_andesite')
  F(1, 5, 1, 14, 5, 9, 'minecraft:smooth_stone_slab[type=bottom]'); F(2, 5, 2, 13, 5, 8, CC)
  ;[4, 7, 10].forEach(x => F(x, 2, 8, x + 1, 3, 8, 'minecraft:iron_bars')); PORTE(12, 1, 8, 'mcwdoors:metal_door', 'north', 'left', 'false'); F(2, 2, 4, 2, 3, 6, 'minecraft:iron_bars')
  S(7, 4, 9, 'minecraft:spruce_wall_sign[facing=south]{front_text:{color:"white",messages:[\'""\',\'"CAMP ATHERIA"\',\'"ZONE MILITAIRE"\',\'""\']}}'); F(3, 4, 8, 11, 4, 8, 'minecraft:yellow_terracotta'.replace('yellow', 'black'))
  // filet de camouflage, toit sac de sable
  for (var x = 2; x <= 13; x++) for (var z = 2; z <= 8; z++) if (R() < 0.45) S(x, 6, z, R() < 0.5 ? 'minecraft:moss_carpet' : 'minecraft:green_carpet')
  F(3, 6, 2, 5, 6, 3, SAC); F(3, 7, 2, 4, 7, 2, SAC); F(10, 6, 3, 10, 7, 3, 'minecraft:iron_bars'); S(10, 8, 3, 'minecraft:lightning_rod')
  // mirador
  ;[[11, 11], [14, 11], [11, 14], [14, 14]].forEach(c => F(c[0], 0, c[1], c[0], 7, c[1], 'minecraft:spruce_log[axis=y]'))
  F(11, 8, 11, 14, 8, 14, 'minecraft:spruce_planks'); W(11, 11, 14, 14, 9, 9, SAC); F(11, 10, 11, 11, 10, 11, 'minecraft:spruce_fence'); F(14, 10, 14, 14, 10, 14, 'minecraft:spruce_fence'); F(11, 10, 14, 11, 10, 14, 'minecraft:spruce_fence'); F(14, 10, 11, 14, 10, 11, 'minecraft:spruce_fence')
  F(10, 11, 10, 15, 11, 15, 'minecraft:spruce_slab[type=bottom]'); F(12, 1, 11, 12, 8, 11, 'minecraft:ladder[facing=south]'); S(13, 10, 13, 'minecraft:redstone_lamp[lit=false]'.replace('redstone_lamp[lit=false]', 'lantern[hanging=false]'))
  // barbeles, chicane de sacs de sable, barriere levante
  F(0, 0, 15, 9, 0, 15, 'mcwfences:iron_cheval_de_frise'); F(0, 0, 0, 0, 0, 14, 'mcwfences:iron_cheval_de_frise'); F(0, 0, 0, 15, 0, 0, 'mcwfences:iron_cheval_de_frise'); F(15, 0, 1, 15, 0, 10, 'mcwfences:iron_cheval_de_frise')
  F(2, 0, 12, 6, 0, 12, SAC); F(3, 1, 12, 5, 1, 12, SAC); F(6, 0, 13, 6, 1, 13, SAC); S(9, 0, 15, 'minecraft:yellow_concrete'); F(9, 1, 15, 9, 1, 15, 'minecraft:yellow_concrete'); F(10, 2, 15, 14, 2, 15, 'minecraft:spruce_fence'.replace('spruce', 'dark_oak'))
  // mat et drapeau, caisses de munitions, jerricans
  F(1, 0, 10, 1, 9, 10, 'minecraft:iron_bars'); S(2, 8, 10, 'minecraft:green_wall_banner[facing=east]'.replace('green_wall_banner', 'white_wall_banner'))
  ;[[7, 10], [8, 10], [7, 11], [8, 13]].forEach(c => S(c[0], 0, c[1], 'minecraft:barrel[facing=' + (R() < 0.5 ? 'up' : 'north') + ',open=false]')); S(8, 1, 10, 'minecraft:chest[facing=south]'); F(3, 0, 10, 4, 0, 10, 'minecraft:green_shulker_box')
  // interieur : lits superposes, armurerie
  for (var x = 3; x <= 9; x += 3) { LIT(x, 1, 4, 'green', 'north'); S(x, 3, 3, 'minecraft:spruce_trapdoor[facing=north,half=top,open=false]'); S(x, 2, 4, 'minecraft:spruce_trapdoor[facing=north,half=bottom,open=false]') }
  F(12, 1, 3, 12, 3, 3, 'minecraft:chiseled_bookshelf'.replace('chiseled_bookshelf', 'barrel[facing=west,open=false]')); S(11, 1, 3, 'minecraft:chest[facing=south]'); S(12, 1, 6, 'minecraft:smithing_table'); S(8, 4, 5, 'minecraft:lantern[hanging=true]')
  F(4, 1, 7, 6, 1, 7, MAT('spruce_counter', 'north')); S(5, 2, 7, 'supplementaries:book_pile'); S(9, 1, 7, 'minecraft:cartography_table')
}
