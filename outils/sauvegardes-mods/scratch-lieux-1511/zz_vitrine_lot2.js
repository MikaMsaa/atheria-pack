
// ================= BARRE HLM (beton) =================
function hlm() {
  var LG = 'minecraft:light_gray_concrete', WC = 'minecraft:white_concrete', GC = 'minecraft:gray_concrete', VP = 'minecraft:gray_stained_glass_pane', RL = 'mcwfences:panelled_metal_fence'
  F(0, -1, 0, 15, -1, 15, 'minecraft:grass_block'); F(0, -1, 13, 15, -1, 15, 'minecraft:smooth_stone'); F(0, -1, 0, 15, -1, 2, 'minecraft:gray_concrete_powder')
  F(1, 0, 3, 14, 0, 12, GC)
  W(1, 3, 14, 12, 1, 24, WC)
  for (var f = 1; f <= 4; f++) { var y = 6 * f; F(2, y, 4, 13, y, 11, 'minecraft:smooth_stone'); F(1, y, 3, 14, y, 3, GC); F(1, y, 12, 14, y, 12, GC); F(1, y, 3, 1, y, 12, GC); F(14, y, 3, 14, y, 12, GC) }
  ;[1, 14].forEach(x => { F(x, 1, 3, x, 24, 3, LG); F(x, 1, 12, x, 24, 12, LG) })
  // rez-de-chaussee : tabac-presse a gauche, hall vitre a droite
  F(2, 1, 12, 7, 4, 12, AIR); F(2, 1, 12, 7, 1, 12, 'minecraft:black_concrete'); F(2, 2, 12, 7, 3, 12, VP); F(2, 4, 12, 7, 4, 12, 'minecraft:iron_trapdoor[facing=south,half=top,open=false]')
  F(2, 5, 13, 7, 5, 13, 'minecraft:red_concrete'); S(4, 5, 14, 'minecraft:oak_wall_sign[facing=south]{front_text:{has_glowing_text:1b,color:"white",messages:[\'""\',\'"TABAC"\',\'"PRESSE"\',\'""\']}}')
  S(8, 1, 12, LG); F(9, 1, 12, 12, 4, 12, 'minecraft:light_gray_stained_glass_pane'); PORTE(10, 1, 12, 'mcwdoors:metal_door', 'north', 'left', 'false'); PORTE(11, 1, 12, 'mcwdoors:metal_door', 'north', 'right', 'false')
  F(9, 5, 13, 12, 5, 13, 'mcwroofs:light_gray_concrete_roof[facing=north,half=bottom,shape=straight]')
  // tags et graffitis
  ;[[1, 1, 13, 'minecraft:magenta_concrete'], [1, 2, 13, 'minecraft:lime_concrete'], [14, 1, 13, 'minecraft:black_concrete'], [8, 2, 13, 'minecraft:cyan_concrete'], [13, 1, 13, 'minecraft:yellow_concrete']].forEach(g => S(g[0], g[1], g[2], 'minecraft:' + g[3].split(':')[1].replace('concrete', 'carpet')))
  ;[[2, 1, 2], [3, 1, 2], [12, 1, 2], [13, 2, 2]].forEach(g => S(g[0], g[1], g[2], 'minecraft:' + ['magenta', 'lime', 'black', 'orange'][g[0] % 4] + '_concrete'))
  // etages : loggias en retrait, panneaux colores, fenetres en bande, cage d'escalier vitree
  var coul = ['cyan_terracotta', 'orange_terracotta', 'yellow_terracotta', 'cyan_terracotta']
  for (var f = 1; f <= 3; f++) {
    var yb = 6 * f
    ;[[2, 5], [8, 11]].forEach((l, i) => {
      F(l[0], yb + 1, 12, l[1], yb + 5, 12, AIR); F(l[0], yb + 1, 11, l[1], yb + 4, 11, WC); F(l[0] + 1, yb + 1, 11, l[0] + 2, yb + 3, 11, VP)
      PORTE(l[1], yb + 1, 11, 'mcwdoors:metal_door', 'south', 'left', 'false')
      F(l[0], yb + 1, 12, l[1], yb + 1, 12, RL); S(l[0], yb + 1, 12, 'minecraft:' + coul[(f + i) % 4]); S(l[0], yb + 2, 12, 'minecraft:' + coul[(f + i) % 4])
      if (R() < 0.6) S(l[0] + 1 + Math.floor(R() * 2), yb + 1, 11 + 1, 'minecraft:' + ['red', 'blue', 'white', 'yellow'][Math.floor(R() * 4)] + '_wall_banner[facing=south]')
      if (R() < 0.5) S(l[1] - 1, yb + 2, 11, 'minecraft:potted_fern')
    })
    F(6, yb + 2, 12, 7, yb + 3, 12, VP)
    F(12, yb + 1, 12, 13, yb + 5, 12, 'minecraft:light_gray_stained_glass'); S(13, yb + 3, 13, 'minecraft:iron_trapdoor[facing=south,half=bottom,open=true]')
    // arriere : fenetres et climatiseurs
    ;[3, 6, 9].forEach(x => F(x, yb + 2, 3, x + 1, yb + 3, 3, VP)); if (f != 2) { S(5, yb + 2, 2, 'minecraft:smooth_stone'); S(5, yb + 3, 2, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false]') }
    S(13, yb + 4, 2, 'minecraft:lightning_rod[facing=north]')
  }
  // toit terrasse : acrotere, local technique, antennes
  F(1, 25, 3, 14, 25, 12, 'minecraft:smooth_stone_slab[type=bottom]'); W(1, 3, 14, 12, 25, 25, 'minecraft:light_gray_concrete')
  F(10, 26, 5, 13, 28, 9, LG); PORTE(10, 26, 7, 'mcwdoors:metal_door', 'west', 'left', 'false'); F(10, 29, 5, 13, 29, 9, 'minecraft:smooth_stone_slab[type=bottom]')
  F(3, 26, 6, 3, 29, 6, 'minecraft:iron_bars'); S(3, 30, 6, 'minecraft:lightning_rod'); S(5, 26, 9, 'minecraft:iron_block'); S(5, 27, 9, 'minecraft:daylight_detector')
  F(6, 26, 4, 7, 26, 4, 'minecraft:iron_trapdoor[facing=south,half=bottom,open=false]'); S(12, 30, 7, 'minecraft:lightning_rod')
  // interieurs : tabac au rez-de-chaussee, appartement au 1er
  F(2, 1, 4, 7, 5, 4, WC); F(8, 1, 4, 8, 5, 11, WC); F(2, 0, 5, 7, 0, 11, 'minecraft:light_gray_terracotta')
  F(3, 1, 8, 6, 1, 8, MAT('stripped_spruce_counter', 'south')); S(5, 2, 8, 'supplementaries:jar'); S(3, 2, 8, 'supplementaries:book_pile')
  F(2, 1, 5, 7, 2, 5, 'mcwfurnitures:spruce_bookshelf[facing=south,connection=base]'); S(2, 1, 10, 'minecraft:barrel[facing=up,open=false]'); S(7, 1, 10, 'supplementaries:book_pile')
  S(5, 5, 7, 'mcwlights:tavern_lantern[hanging=true]'); F(9, 0, 4, 13, 0, 11, 'minecraft:polished_andesite')
  F(9, 2, 4, 11, 2, 4, 'minecraft:spruce_trapdoor[facing=south,half=bottom,open=true]'); S(12, 1, 5, 'minecraft:dark_oak_stairs[facing=north,half=bottom,shape=straight]')
  F(2, 7, 7, 13, 11, 7, WC); PORTE(5, 7, 7, 'mcwdoors:spruce_classic_door', 'south', 'left', 'true'); PORTE(10, 7, 7, 'mcwdoors:spruce_classic_door', 'south', 'left', 'false')
  F(2, 7, 8, 7, 7, 10, 'minecraft:light_gray_carpet'); F(3, 7, 9, 3, 7, 10, 'mcwfurnitures:brown_couch[facing=east,shape=single]'); S(5, 7, 9, 'mcwfurnitures:spruce_drawer[facing=west]')
  S(5, 8, 9, 'minecraft:black_concrete'); S(4, 7, 10, 'mcwfurnitures:spruce_coffee_table'); S(7, 7, 10, 'minecraft:potted_bamboo')
  F(9, 7, 8, 13, 7, 8, MAT('spruce_counter', 'south')); S(11, 7, 8, 'mcwfurnitures:spruce_kitchen_sink[facing=south,water=false]'); S(10, 7, 9, 'mcwfurnitures:spruce_table'); S(10, 7, 10, MAT('spruce_chair', 'north'))
  LIT(3, 7, 5, 'blue', 'west'); LIT(3, 8, 5, 'blue', 'west'); S(2, 9, 4, 'minecraft:air'); S(6, 7, 4, 'mcwfurnitures:spruce_wardrobe[facing=south,connection=base,hinge=left]'); S(12, 7, 5, 'minecraft:chest[facing=west]')
  // pied d'immeuble : arceaux, conteneurs, voiture brulee
  F(0, 0, 14, 3, 0, 14, 'minecraft:iron_bars'); S(13, 0, 14, 'minecraft:green_shulker_box'); S(14, 0, 14, 'minecraft:gray_shulker_box'); S(12, 0, 14, 'supplementaries:sack')
  F(4, 0, 0, 8, 0, 1, 'minecraft:black_concrete'); F(5, 1, 0, 7, 1, 1, 'minecraft:coal_block'); S(4, 1, 0, 'minecraft:tinted_glass'); S(8, 0, 1, 'minecraft:air')
}

// ================= CHALET FORESTIER (bois) =================
function chalet() {
  var SL = 'minecraft:spruce_log', SPL = 'minecraft:spruce_planks', CB = 'minecraft:cobblestone', MC = 'minecraft:mossy_cobblestone'
  F(0, -1, 0, 15, -1, 15, 'minecraft:grass_block'); F(2, 0, 2, 13, 0, 11, CB); F(3, 0, 3, 12, 0, 10, SPL)
  // murs en rondins, angles a encoches
  for (var y = 1; y <= 9; y++) {
    F(2, y, 2, 13, y, 2, SL + '[axis=x]'); F(2, y, 11, 13, y, 11, SL + '[axis=x]'); F(2, y, 3, 2, y, 10, SL + '[axis=z]'); F(13, y, 3, 13, y, 10, SL + '[axis=z]')
    if (y % 2) { S(1, y, 2, SL + '[axis=x]'); S(14, y, 2, SL + '[axis=x]'); S(1, y, 11, SL + '[axis=x]'); S(14, y, 11, SL + '[axis=x]') }
    else { S(2, y, 1, SL + '[axis=z]'); S(13, y, 1, SL + '[axis=z]'); S(2, y, 12, SL + '[axis=z]'); S(13, y, 12, SL + '[axis=z]') }
  }
  for (var x = 3; x <= 12; x++) { var top = 9 + (x <= 7 ? x - 1 : 14 - x) - 1; F(x, 10, 2, x, top, 2, SPL); F(x, 10, 11, x, top, 11, SPL) }
  F(3, 6, 3, 12, 6, 7, SPL); F(3, 7, 8, 12, 7, 8, 'minecraft:spruce_fence')
  // toit en bardeaux, fort debord
  for (var k = 0; k <= 6; k++) { F(1 + k, 9 + k, 0, 1 + k, 9 + k, 13, TOIT('east', 'spruce')); F(14 - k, 9 + k, 0, 14 - k, 9 + k, 13, TOIT('west', 'spruce')) }
  // pignon sur rue : grande baie triangulaire
  F(6, 2, 11, 9, 4, 11, GP); F(5, 7, 11, 10, 10, 11, GP); F(6, 11, 11, 9, 12, 11, GP); S(7, 13, 11, GP); S(8, 13, 11, GP)
  F(5, 7, 11, 5, 10, 11, SL + '[axis=y]'); F(10, 7, 11, 10, 10, 11, SL + '[axis=y]')
  PORTE(4, 1, 11, 'mcwdoors:spruce_classic_door', 'north', 'left', 'false')
  ;[[2, 5], [2, 8], [13, 5], [13, 8]].forEach(c => F(c[0], 2, c[1], c[0], 3, c[1], GP))
  F(3, 3, 2, 3, 3, 2, GP); F(10, 2, 2, 11, 3, 2, GP)
  // veranda couverte
  F(1, 0, 12, 14, 0, 14, SPL); ;[1, 5, 10, 14].forEach(x => F(x, 1, 14, x, 3, 14, 'minecraft:stripped_spruce_log[axis=y]'))
  F(2, 1, 14, 4, 1, 14, 'minecraft:spruce_fence'); F(11, 1, 14, 13, 1, 14, 'minecraft:spruce_fence'); F(1, 1, 12, 1, 1, 13, 'minecraft:spruce_fence'); F(14, 1, 12, 14, 1, 13, 'minecraft:spruce_fence')
  F(0, 4, 14, 15, 4, 14, TOIT('north', 'spruce')); F(0, 5, 13, 15, 5, 13, TOIT('north', 'spruce')); F(0, 6, 12, 15, 6, 12, TOIT('north', 'spruce'))
  F(6, 0, 15, 9, 0, 15, 'minecraft:spruce_stairs[facing=north,half=bottom,shape=straight]')
  S(3, 1, 13, MAT('spruce_chair', 'south')); S(11, 1, 13, 'minecraft:barrel[facing=up,open=false]'); S(12, 1, 13, 'mcwfurnitures:spruce_stool_chair'); S(2, 3, 12, 'mcwlights:wall_lantern[facing=south]'); S(13, 3, 12, 'mcwlights:wall_lantern[facing=south]')
  // cheminee de pierre exterieure
  F(0, 0, 5, 1, 1, 7, CB); F(1, 2, 5, 1, 17, 7, CB); F(1, 2, 6, 1, 17, 6, MC); F(0, 2, 5, 0, 4, 7, MC); F(1, 18, 6, 1, 18, 6, 'minecraft:campfire[lit=false,facing=east]')
  // appentis et bucher
  F(14, 0, 4, 15, 0, 9, 'minecraft:coarse_dirt'); F(15, 1, 4, 15, 3, 4, 'minecraft:spruce_fence'); F(15, 1, 9, 15, 3, 9, 'minecraft:spruce_fence')
  F(14, 4, 4, 14, 4, 9, TOIT('west', 'spruce')); F(15, 3, 3, 15, 3, 10, 'minecraft:spruce_slab[type=top]')
  F(14, 1, 5, 15, 2, 8, SL + '[axis=x]'); S(15, 3, 6, 'minecraft:spruce_slab[type=bottom]'); S(14, 1, 9, 'minecraft:chopping_block'.replace('chopping_block', 'barrel[facing=up,open=false]'))
  // interieur : sejour avec cheminee, cuisine, mezzanine
  F(3, 1, 5, 3, 4, 7, CB); S(3, 1, 6, 'minecraft:campfire[lit=false,facing=east]'); F(4, 3, 5, 4, 3, 7, 'minecraft:spruce_slab[type=top]'); S(4, 4, 6, 'minecraft:skeleton_skull[rotation=4]')
  F(5, 1, 5, 6, 1, 7, 'minecraft:brown_carpet'); F(7, 1, 5, 7, 1, 7, 'mcwfurnitures:brown_couch[facing=west,shape=single]'); S(5, 1, 9, 'minecraft:white_carpet')
  F(11, 1, 3, 12, 1, 3, MAT('spruce_counter', 'south')); F(12, 1, 4, 12, 1, 5, MAT('spruce_counter', 'west')); S(12, 2, 4, 'farmersdelight:cooking_pot'); S(11, 2, 3, 'supplementaries:jar')
  F(9, 1, 8, 10, 1, 9, 'mcwfurnitures:spruce_table'); S(8, 1, 8, 'minecraft:spruce_stairs[facing=west,half=bottom,shape=straight]'); S(8, 1, 9, 'minecraft:spruce_stairs[facing=west,half=bottom,shape=straight]'); S(11, 1, 8, 'minecraft:spruce_stairs[facing=east,half=bottom,shape=straight]'); S(11, 1, 9, 'minecraft:spruce_stairs[facing=east,half=bottom,shape=straight]')
  F(12, 1, 7, 12, 6, 7, 'minecraft:ladder[facing=west]'); S(12, 6, 7, 'minecraft:ladder[facing=west]')
  S(9, 5, 5, 'mcwlights:iron_chandelier'); S(10, 5, 9, 'minecraft:lantern[hanging=true]'); F(3, 1, 10, 4, 2, 10, 'minecraft:barrel[facing=up,open=false]')
  LIT(4, 7, 4, 'brown', 'north'); LIT(5, 7, 4, 'brown', 'north'); S(3, 7, 3, 'minecraft:chest[facing=east]'); S(9, 7, 4, MAT('spruce_chair', 'south')); S(9, 7, 3, 'mcwfurnitures:spruce_desk[facing=south,connection=single]'); S(9, 8, 3, 'supplementaries:globe_sepia')
  F(6, 7, 5, 8, 7, 6, 'minecraft:red_carpet'); S(7, 11, 5, 'minecraft:lantern[hanging=true]')
  // abords : souches, foret
  ;[[0, 1], [15, 13], [0, 15]].forEach(c => S(c[0], 0, c[1], SL + '[axis=y]'))
  for (var x = 0; x <= 15; x++) for (var z = 0; z <= 15; z++) if ((x < 1 || x > 14 || z < 1) && R() < 0.35) SA(x, 0, z, ['minecraft:fern', 'minecraft:short_grass', 'minecraft:sweet_berry_bush[age=3]', 'minecraft:large_fern'.replace('large_fern', 'fern')][Math.floor(R() * 4)])
}

// ================= VILLA MEDITERRANEENNE (terracotta) =================
function villa() {
  var WT = 'minecraft:white_terracotta', SS = 'minecraft:smooth_sandstone', TT = 'minecraft:terracotta', VO = 'minecraft:warped_trapdoor'
  function TU(f) { return TOIT(f, 'orange_terracotta') }
  F(0, -1, 0, 15, -1, 15, 'minecraft:grass_block')
  for (var x = 1; x <= 15; x++) for (var z = 1; z <= 14; z++) S(x, -1, z, (x + z) % 3 ? TT : 'minecraft:smooth_sandstone')
  // corps principal R+1
  F(1, 0, 1, 9, 0, 10, SS); W(1, 1, 9, 10, 1, 11, WT); F(1, 6, 1, 9, 6, 10, 'minecraft:smooth_sandstone_slab[type=top]'); F(2, 6, 2, 8, 6, 9, 'minecraft:spruce_planks')
  F(1, 6, 1, 9, 6, 1, SS); F(1, 6, 10, 9, 6, 10, SS); F(1, 6, 1, 1, 6, 10, SS); F(9, 6, 1, 9, 6, 10, SS)
  F(1, 11, 0, 9, 11, 0, 'minecraft:smooth_sandstone_stairs[facing=south,half=top,shape=straight]'); F(1, 11, 11, 9, 11, 11, 'minecraft:smooth_sandstone_stairs[facing=north,half=top,shape=straight]')
  // toit en croupe, tuiles canal
  for (var k = 0; k <= 4; k++) {
    var x1 = 0 + k, x2 = 10 - k, z1 = 0 + k, z2 = 11 - k, y = 12 + k
    if (x2 - x1 < 2) { F(x1, y, z1, x2, y, z2, 'minecraft:granite_slab[type=bottom]'); break }
    F(x1, y, z1, x2, y, z1, TU('south')); F(x1, y, z2, x2, y, z2, TU('north')); F(x1, y, z1 + 1, x1, y, z2 - 1, TU('east')); F(x2, y, z1 + 1, x2, y, z2 - 1, TU('west'))
    if (k == 4) F(x1 + 1, y, z1 + 1, x2 - 1, y, z2 - 1, 'minecraft:granite_slab[type=bottom]')
  }
  // loggia a arcades au rez-de-chaussee
  F(1, 1, 11, 9, 5, 12, AIR); F(1, 0, 11, 9, 0, 12, 'minecraft:smooth_sandstone'); ;[1, 4, 6, 9].forEach(x => F(x, 1, 12, x, 4, 12, 'minecraft:quartz_pillar'))
  F(1, 5, 11, 9, 5, 12, SS); ;[[2, 3], [7, 8]].forEach(a => { S(a[0], 4, 12, 'minecraft:smooth_sandstone_stairs[facing=west,half=top,shape=straight]'); S(a[1], 4, 12, 'minecraft:smooth_sandstone_stairs[facing=east,half=top,shape=straight]') })
  S(5, 4, 12, 'minecraft:smooth_sandstone_slab[type=top]'); F(1, 6, 11, 9, 6, 12, 'minecraft:smooth_sandstone_slab[type=bottom]'); F(1, 7, 12, 9, 7, 12, 'mcwfences:curved_metal_fence')
  PORTE(3, 1, 10, 'mcwdoors:jungle_glass_door'.replace('jungle', 'dark_oak'), 'north', 'left', 'false'); F(6, 2, 10, 7, 3, 10, GP)
  // etage : portes-fenetres sur la terrasse, volets provencaux
  ;[3, 7].forEach(x => { PORTE(x, 7, 10, 'mcwdoors:spruce_glass_door', 'north', 'left', 'false'); S(x - 1, 7, 11, VO + '[facing=south,half=bottom,open=true]'); S(x - 1, 8, 11, VO + '[facing=south,half=bottom,open=true]'); S(x + 1, 7, 11, VO + '[facing=south,half=bottom,open=true]'); S(x + 1, 8, 11, VO + '[facing=south,half=bottom,open=true]') })
  ;[3, 7].forEach(z => { F(1, 8, z, 1, 9, z, GP); S(1, 8, z - 1, 'minecraft:air'); F(9, 8, z, 9, 9, z, GP) }); F(4, 8, 1, 6, 9, 1, GP); F(3, 2, 1, 3, 3, 1, GP); F(7, 2, 1, 7, 3, 1, GP)
  ;[[1, 3], [1, 7]].forEach(c => { S(0, 8, c[1] - 1, VO + '[facing=west,half=bottom,open=true]'); S(0, 8, c[1] + 1, VO + '[facing=west,half=bottom,open=true]') })
  // aile basse avec toit-terrasse et pergola
  F(10, 0, 1, 14, 0, 7, SS); W(10, 1, 14, 7, 1, 5, WT); F(10, 6, 1, 14, 6, 7, 'minecraft:smooth_sandstone'); F(11, 2, 7, 13, 3, 7, GP); F(14, 2, 3, 14, 3, 5, GP)
  F(10, 7, 1, 14, 7, 7, 'minecraft:sandstone_wall'); F(10, 7, 2, 10, 7, 6, AIR); PORTE(9, 7, 4, 'mcwdoors:spruce_glass_door', 'east', 'left', 'false')
  ;[[11, 2], [14, 2], [11, 6], [14, 6]].forEach(c => F(c[0], 8, c[1], c[0], 9, c[1], 'minecraft:stripped_oak_log[axis=y]'))
  for (var x = 11; x <= 14; x++) S(x, 10, 2, 'minecraft:oak_fence'), S(x, 10, 6, 'minecraft:oak_fence'); for (var z = 3; z <= 5; z++) for (var x = 11; x <= 14; x += 1) if (R() < 0.7) S(x, 10, z, R() < 0.5 ? 'minecraft:flowering_azalea_leaves[persistent=true]' : 'minecraft:oak_fence')
  F(12, 7, 3, 12, 7, 4, MAT('stripped_oak_chair'.replace('stripped_oak_chair', 'spruce_chair'), 'east')); S(13, 7, 4, 'mcwfurnitures:spruce_glass_table'); S(14, 8, 4, 'minecraft:decorated_pot')
  // patio : fontaine, pots, bougainvillier, cypres
  F(10, 0, 9, 14, 0, 13, 'minecraft:smooth_sandstone'); F(11, 0, 10, 13, 0, 12, 'minecraft:smooth_sandstone_slab[type=bottom]'); S(12, 0, 11, 'minecraft:water'); S(12, -1, 11, 'minecraft:smooth_sandstone')
  F(15, 0, 8, 15, 1, 14, 'minecraft:sandstone_wall'); F(0, 0, 14, 15, 0, 14, 'minecraft:sandstone_wall'); F(5, 0, 14, 6, 0, 14, AIR); F(0, 1, 14, 3, 1, 14, 'minecraft:flowering_azalea_leaves[persistent=true]')
  ;[[10, 8], [14, 8], [10, 13], [9, 13]].forEach(c => S(c[0], 1, c[1], 'minecraft:decorated_pot')); S(14, 1, 13, 'minecraft:potted_cactus')
  F(9, 2, 11, 9, 9, 11, 'minecraft:vine[west=true]'.replace('west', 'east')); for (var y = 6; y <= 10; y++) if (R() < 0.8) SA(10, y, 8, 'minecraft:cherry_leaves[persistent=true]')
  ;[[0, 12], [15, 0], [0, 1]].forEach(c => { F(c[0], 0, c[1], c[0], 6, c[1], 'minecraft:spruce_log[axis=y]'); for (var y = 1; y <= 8; y++) { var r = y < 7 ? 1 : 0; for (var dx = -r; dx <= r; dx++) for (var dz = -r; dz <= r; dz++) if (Math.abs(dx) + Math.abs(dz) == 1 || (dx == 0 && dz == 0 && y > 6)) SA(c[0] + dx, y, c[1] + dz, 'minecraft:spruce_leaves[persistent=true]') } })
  // interieur
  for (var x = 2; x <= 8; x++) for (var z = 2; z <= 9; z++) S(x, 0, z, (x + z) % 2 ? 'minecraft:terracotta' : 'minecraft:white_glazed_terracotta'.replace('white_glazed_terracotta', 'smooth_sandstone'))
  F(5, 1, 2, 5, 5, 6, WT); PORTE(5, 1, 4, 'mcwdoors:spruce_classic_door', 'east', 'left', 'true')
  F(2, 1, 2, 4, 1, 2, MAT('stripped_spruce_counter'.replace('spruce', 'spruce'), 'south')); S(3, 1, 2, 'mcwfurnitures:stripped_spruce_kitchen_sink[facing=south,water=false]'); S(2, 2, 2, 'minecraft:decorated_pot')
  F(2, 1, 5, 3, 1, 6, 'mcwfurnitures:stripped_spruce_table'); S(4, 1, 5, MAT('stripped_spruce_chair', 'west')); S(4, 1, 6, MAT('stripped_spruce_chair', 'west')); S(3, 5, 5, 'mcwlights:iron_chandelier')
  F(6, 1, 7, 8, 1, 7, 'mcwfurnitures:white_couch[facing=south,shape=single]'); S(7, 1, 8, 'mcwfurnitures:stripped_spruce_coffee_table'); F(6, 1, 8, 8, 1, 9, 'minecraft:orange_carpet'.replace('orange', 'yellow')); S(7, 1, 8, 'mcwfurnitures:stripped_spruce_coffee_table')
  F(11, 0, 2, 13, 0, 6, 'minecraft:terracotta'); LIT(12, 1, 3, 'white', 'north'); LIT(13, 1, 3, 'white', 'north'); S(11, 1, 2, 'mcwfurnitures:stripped_spruce_end_table'); S(11, 2, 2, 'minecraft:candle[candles=2,lit=false]')
  LIT(3, 7, 3, 'orange', 'north'); S(7, 7, 3, 'mcwfurnitures:stripped_spruce_wardrobe[facing=south,connection=base,hinge=left]'); S(6, 7, 8, 'minecraft:water_cauldron[level=3]'); S(3, 11, 5, 'minecraft:lantern[hanging=true]')
}

// ================= VILLA CONTEMPORAINE (moderne) =================
function moderne() {
  var WC = 'minecraft:white_concrete', BK = 'minecraft:black_concrete', GL = 'minecraft:glass', SQ = 'minecraft:smooth_quartz', SLAT = 'minecraft:stripped_dark_oak_log[axis=y]'
  F(0, -1, 0, 15, -1, 15, 'minecraft:grass_block')
  // volume bas vitre
  F(1, 0, 4, 10, 0, 12, SQ); W(1, 4, 10, 12, 1, 5, WC); F(2, 1, 12, 9, 4, 12, GL); F(10, 1, 6, 10, 4, 11, GL); F(1, 2, 6, 1, 2, 10, GL)
  F(1, 6, 4, 10, 6, 12, WC); F(1, 5, 12, 10, 5, 12, BK); F(1, 1, 12, 1, 5, 12, BK); F(10, 1, 12, 10, 5, 12, BK)
  PORTE(10, 1, 5, 'mcwdoors:metal_door', 'east', 'left', 'false')
  // volume haut en porte-a-faux, bardage a claire-voie
  F(5, 6, 1, 14, 6, 9, WC); W(5, 1, 14, 9, 7, 11, WC); F(5, 12, 1, 14, 12, 9, WC)
  for (var x = 6; x <= 13; x++) F(x, 7, 9, x, 11, 9, x % 2 ? SLAT : GL); F(14, 7, 2, 14, 11, 8, GL); F(14, 7, 2, 14, 7, 8, BK); F(6, 8, 1, 9, 10, 1, GL)
  F(5, 11, 1, 14, 11, 1, BK); F(5, 12, 9, 14, 12, 9, BK)
  ;[[14, 1], [14, 9]].forEach(c => F(c[0], 0, c[1], c[0], 5, c[1], 'minecraft:light_gray_concrete')); F(11, 0, 1, 14, 0, 9, 'minecraft:polished_andesite')
  // toiture vegetalisee et panneaux solaires
  F(1, 6, 10, 10, 6, 12, 'minecraft:moss_block'); F(1, 6, 4, 4, 6, 9, 'minecraft:moss_block'); F(1, 7, 12, 10, 7, 12, 'minecraft:glass_pane'); F(1, 7, 4, 1, 7, 12, 'minecraft:glass_pane')
  for (var x = 2; x <= 9; x++) for (var z = 5; z <= 11; z++) if ((x < 5 || z > 9) && R() < 0.35) SA(x, 7, z, ['minecraft:short_grass', 'minecraft:azalea', 'minecraft:fern'][Math.floor(R() * 3)])
  PORTE(5, 7, 10, 'mcwdoors:metal_door', 'west', 'left', 'false'); F(6, 6, 10, 9, 6, 11, 'minecraft:stripped_oak_wood'.replace('oak_wood', 'oak_log[axis=x]')); S(7, 7, 11, MAT('stripped_spruce_chair', 'south')); S(8, 7, 11, MAT('stripped_spruce_chair', 'south'))
  for (var x = 6; x <= 13; x += 2) for (var z = 2; z <= 8; z += 3) S(x, 13, z, 'minecraft:daylight_detector'); F(5, 13, 1, 14, 13, 1, 'minecraft:smooth_quartz_slab[type=bottom]')
  // piscine abandonnee et terrasse en bois
  F(1, -1, 13, 9, -1, 15, 'minecraft:stripped_oak_log[axis=x]'); F(11, -3, 11, 14, -1, 14, 'minecraft:light_blue_terracotta'); F(12, -2, 12, 13, -1, 13, 'minecraft:water')
  S(12, -1, 12, 'minecraft:lily_pad'.replace('lily_pad', 'water')); SA(12, 0, 13, 'minecraft:lily_pad'); S(13, -2, 12, 'minecraft:seagrass'); F(11, 0, 10, 14, 0, 10, 'minecraft:glass_pane'); S(11, -1, 15, 'minecraft:stripped_oak_log[axis=x]')
  S(4, 0, 14, 'mcwfurnitures:white_couch[facing=north,shape=single]'.replace('white_couch', 'white_chaise')); S(6, 0, 14, 'mcwfurnitures:white_chaise[facing=north]')
  // interieur epure
  F(2, 1, 5, 4, 1, 5, MAT('stripped_dark_oak_counter', 'south')); S(3, 1, 5, 'mcwfurnitures:stripped_dark_oak_kitchen_sink[facing=south,water=false]'); F(3, 1, 7, 4, 1, 7, 'minecraft:polished_deepslate')
  S(3, 1, 8, MAT('stripped_dark_oak_stool_chair', 'north')); F(6, 1, 10, 8, 1, 10, 'mcwfurnitures:black_couch[facing=north,shape=single]'); S(7, 1, 9, 'mcwfurnitures:stripped_dark_oak_glass_table'); F(5, 1, 8, 9, 1, 11, 'minecraft:light_gray_carpet'); F(6, 1, 10, 8, 1, 10, 'mcwfurnitures:black_couch[facing=north,shape=single]'); S(7, 1, 9, 'mcwfurnitures:stripped_dark_oak_glass_table')
  for (var i = 0; i < 5; i++) S(9, 1 + i, 9 - i, 'minecraft:quartz_stairs[facing=north,half=bottom,shape=straight]'); F(9, 6, 5, 9, 6, 7, AIR)
  S(5, 5, 9, 'mcwlights:white_ceiling_light'); S(3, 5, 6, 'mcwlights:white_ceiling_light'); S(2, 1, 11, 'minecraft:potted_bamboo')
  F(6, 7, 2, 13, 7, 2, 'minecraft:light_gray_carpet'); LIT(12, 7, 3, 'black', 'north'); LIT(13, 7, 3, 'black', 'north'); S(11, 7, 2, 'mcwfurnitures:stripped_dark_oak_end_table'); S(6, 7, 4, 'mcwfurnitures:stripped_dark_oak_desk[facing=south,connection=single]')
  S(10, 11, 5, 'mcwlights:white_ceiling_light'); F(5, 7, 6, 13, 11, 6, WC); PORTE(11, 7, 6, 'mcwdoors:metal_door', 'south', 'left', 'true')
  // jardin : graviers, bambous, allee
  F(0, -1, 0, 4, -1, 3, 'minecraft:gravel'); ;[[1, 1], [2, 2], [3, 1]].forEach(c => F(c[0], 0, c[1], c[0], 2 + Math.floor(R() * 3), c[1], 'minecraft:bamboo[age=0,leaves=large,stage=0]'))
  F(10, -1, 13, 10, -1, 15, 'minecraft:smooth_stone'); S(0, 0, 13, 'mcwlights:garden_light'); S(9, 0, 15, 'mcwlights:garden_light')
}
