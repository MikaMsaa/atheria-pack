
// ================= GRAND CHALET FORESTIER (2 x 2 chunks) =================
function sapin(x, z, h) {
  F(x, 0, z, x, h, z, 'minecraft:spruce_log[axis=y]'); S(x, -1, z, 'minecraft:podzol')
  for (var y = 2; y <= h + 1; y++) { var r = Math.max(0, Math.floor((h + 1 - y) / 2.6)); if (y % 2 == 1 && r > 0) r-- ; for (var dx = -r; dx <= r; dx++) for (var dz = -r; dz <= r; dz++) if (Math.abs(dx) + Math.abs(dz) <= r && x + dx >= 0 && x + dx <= 31 && z + dz >= 0 && z + dz <= 31) SA(x + dx, y, z + dz, 'minecraft:spruce_leaves[persistent=true]') }
  SA(x, h + 1, z, 'minecraft:spruce_leaves[persistent=true]'); SA(x, h + 2, z, 'minecraft:spruce_leaves[persistent=true]')
}
function chaletGrand() {
  var SP = 'minecraft:spruce_planks', LOG = 'minecraft:spruce_log[axis=y]', SPF = 'minecraft:spruce_fence'
  F(0, -1, 0, 31, -1, 31, 'minecraft:grass_block')
  for (var x = 0; x <= 31; x++) for (var z = 0; z <= 31; z++) { var r = R(); if (r < 0.14) S(x, -1, z, 'minecraft:podzol'); else if (r < 0.2) S(x, -1, z, 'minecraft:coarse_dirt'); else if (r < 0.23) S(x, -1, z, 'minecraft:moss_block') }
  F(2, -1, 18, 2, -1, 31, 'minecraft:gravel'); F(1, -1, 13, 3, -1, 17, 'minecraft:gravel')
  // gros oeuvre : soubassement en pierre, etage en bois
  F(4, 0, 8, 27, 0, 23, SP)
  for (var y = 1; y <= 5; y++) { for (var x = 4; x <= 27; x++) { S(x, y, 8, choix(['minecraft:cobblestone', 'minecraft:stone_bricks', 'minecraft:mossy_cobblestone', 'minecraft:cobblestone'])); S(x, y, 23, choix(['minecraft:cobblestone', 'minecraft:stone_bricks', 'minecraft:mossy_cobblestone', 'minecraft:cobblestone'])) } for (var z = 9; z <= 22; z++) { S(4, y, z, choix(['minecraft:cobblestone', 'minecraft:stone_bricks', 'minecraft:mossy_cobblestone'])); S(27, y, z, choix(['minecraft:cobblestone', 'minecraft:stone_bricks', 'minecraft:mossy_cobblestone'])) } }
  F(4, 6, 8, 27, 6, 8, 'minecraft:stripped_spruce_log[axis=x]'); F(4, 6, 23, 27, 6, 23, 'minecraft:stripped_spruce_log[axis=x]'); F(4, 6, 9, 4, 6, 22, 'minecraft:stripped_spruce_log[axis=z]'); F(27, 6, 9, 27, 6, 22, 'minecraft:stripped_spruce_log[axis=z]')
  F(4, 7, 8, 27, 11, 8, SP); F(4, 7, 23, 27, 11, 23, SP); F(4, 7, 9, 4, 11, 22, SP); F(27, 7, 9, 27, 11, 22, SP)
  ;[4, 9, 14, 22, 27].forEach(x => { F(x, 7, 8, x, 11, 8, LOG); F(x, 7, 23, x, 11, 23, LOG) }); ;[13, 17].forEach(z => { F(4, 7, z, 4, 11, z, LOG); F(27, 7, z, 27, 11, z, LOG) })
  F(5, 6, 9, 26, 6, 22, SP); F(4, 12, 8, 27, 12, 23, SP)
  for (var k = 0; k <= 8; k++) {
    var y = 12 + k, zs = 24 - k, zn = 7 + k
    F(3, y, zs, 28, y, zs, TOIT('north', 'spruce')); F(3, y, zn, 28, y, zn, TOIT('south', 'spruce'))
    if (k > 0 && zn + 1 <= zs - 1) { F(4, y, zn + 1, 4, y, zs - 1, SP); F(27, y, zn + 1, 27, y, zs - 1, SP) }
  }
  F(4, 14, 15, 4, 16, 16, GP); F(27, 14, 15, 27, 16, 16, GP)
  F(28, 0, 9, 29, 21, 11, 'minecraft:cobblestone'); F(28, 22, 9, 29, 22, 11, 'minecraft:cobblestone_slab[type=bottom]'); S(29, 22, 10, 'minecraft:campfire[lit=false,signal_fire=false]')
  // cloisons et couloir (z15), hall d'escalier (x19..26, z9..13)
  for (var y0 = 0; y0 <= 6; y0 += 6) {
    F(5, y0 + 1, 16, 26, y0 + 5, 16, SP); F(5, y0 + 1, 14, 26, y0 + 5, 14, SP)
    ;[14, 22].forEach(x => F(x, y0 + 1, 17, x, y0 + 5, 22, SP)); ;[12, 18].forEach(x => F(x, y0 + 1, 9, x, y0 + 5, 13, SP))
    F(6, y0 + 1, 15, 25, y0 + 1, 15, y0 ? 'minecraft:green_carpet' : 'minecraft:brown_carpet'); ;[8, 14, 20, 25].forEach(x => S(x, y0 + 5, 15, 'minecraft:lantern[hanging=true]'))
    PORTE(22, y0 + 1, 14, 'mcwdoors:spruce_classic_door', 'south', 'left', 'false')
    F(27, y0 + 2, 15, 27, y0 + 4, 15, GP)
  }
  for (var k = 0; k <= 5; k++) { S(19 + k, 1 + k, 9, 'minecraft:spruce_stairs[facing=east,half=bottom,shape=straight]'); if (k > 0) F(19 + k, 1, 9, 19 + k, k, 9, SP) }
  F(19, 6, 9, 23, 6, 9, AIR); F(19, 7, 10, 23, 7, 10, SPF); S(26, 1, 13, 'minecraft:potted_fern'); S(20, 1, 13, 'mcwfurnitures:spruce_end_table'); S(20, 2, 13, 'minecraft:lantern'); S(25, 7, 13, 'minecraft:barrel[facing=up,open=false]')
  ;[[26, 10], [26, 12]].forEach(c => S(c[0], 1, c[1], MAT('spruce_chair', 'west'))); S(23, 5, 11, 'mcwlights:iron_chandelier')
  // pieces
  var c
  c = cadre(5, 17, 13, 22, 'south', 0); piece(c, 'salon', 0); c.porte('mcwdoors:spruce_classic_door')
  c = cadre(15, 17, 21, 22, 'south', 0); piece(c, 'salle', 0); c.porte('mcwdoors:spruce_classic_door')
  c = cadre(23, 17, 26, 22, 'south', 0); piece(c, 'bureau', 0); c.porte('mcwdoors:spruce_classic_door')
  c = cadre(5, 9, 11, 13, 'north', 0); piece(c, 'cuisine', 0); c.porte('mcwdoors:spruce_classic_door')
  c = cadre(13, 9, 17, 13, 'north', 0); piece(c, 'sdb', 0); c.porte('mcwdoors:spruce_classic_door')
  c = cadre(5, 17, 13, 22, 'south', 6); piece(c, 'chambre', 0); c.porte('mcwdoors:spruce_classic_door')
  c = cadre(15, 17, 21, 22, 'south', 6); piece(c, 'chambre', 0); c.porte('mcwdoors:spruce_classic_door')
  c = cadre(23, 17, 26, 22, 'south', 6); piece(c, 'chambre', 0); c.porte('mcwdoors:spruce_classic_door')
  c = cadre(5, 9, 11, 13, 'north', 6); piece(c, 'chambre', 0); c.porte('mcwdoors:spruce_classic_door')
  c = cadre(13, 9, 17, 13, 'north', 6); piece(c, 'sdb', 0); c.porte('mcwdoors:spruce_classic_door')
  // ouvertures
  PORTE(4, 1, 15, 'mcwdoors:spruce_classic_door', 'west', 'left', 'false')
  ;[6, 7, 10, 11, 16, 17, 19, 20, 24, 25].forEach(x => F(x, 2, 23, x, 4, 23, GP))
  ;[6, 7, 12, 16, 20, 24, 25].forEach(x => F(x, 8, 23, x, 10, 23, GP))
  PORTE(10, 7, 23, 'mcwdoors:spruce_glass_door', 'south', 'left', 'false'); PORTE(18, 7, 23, 'mcwdoors:spruce_glass_door', 'south', 'left', 'false')
  ;[7, 8, 15, 21, 24].forEach(x => F(x, 3, 8, x, 4, 8, GP)); ;[7, 11, 15, 21, 24].forEach(x => F(x, 8, 8, x, 10, 8, GP))
  ;[11, 19].forEach(z => { F(4, 2, z, 4, 4, z, GP); F(4, 8, z, 4, 10, z, GP) }); F(27, 8, 12, 27, 10, 12, GP); F(27, 8, 19, 27, 10, 19, GP); F(27, 2, 20, 27, 3, 20, GP); F(27, 2, 12, 27, 3, 12, GP)
  // porche ouest
  F(1, 0, 13, 3, 0, 17, 'minecraft:spruce_slab[type=bottom]'); F(1, 0, 13, 1, 4, 13, LOG); F(1, 0, 17, 1, 4, 17, LOG); F(0, 5, 12, 3, 5, 18, 'minecraft:spruce_slab[type=bottom]'); S(1, 4, 15, 'minecraft:lantern[hanging=true]')
  // balcon filant sud et terrasse
  F(3, -1, 24, 28, -1, 28, SP); F(3, 6, 24, 28, 6, 25, SP); ;[4, 10, 16, 22, 27].forEach(x => F(x, 0, 25, x, 5, 25, LOG))
  F(3, 7, 25, 28, 7, 25, SPF); S(3, 7, 24, SPF); S(28, 7, 24, SPF)
  ;[7, 13, 20].forEach(x => S(x, 7, 24, MAT('spruce_chair', 'south'))); ;[5, 15, 25].forEach(x => S(x, 7, 24, 'minecraft:potted_red_tulip'))
  S(13, 0, 27, 'mcwfurnitures:spruce_table'); S(12, 0, 27, MAT('spruce_chair', 'east')); S(14, 0, 27, MAT('spruce_chair', 'west')); S(13, 1, 27, 'minecraft:candle[candles=3,lit=false]')
  F(19, 0, 27, 20, 0, 27, 'mcwfurnitures:white_couch[facing=south,shape=single]'); S(21, 0, 27, 'minecraft:potted_azalea_bush'); ;[[7, 5, 24], [19, 5, 24]].forEach(c => S(c[0], c[1], c[2], 'minecraft:lantern[hanging=true]'))
  // foyer exterieur, bucher, souche
  S(8, 0, 30, 'minecraft:campfire[lit=true]'); F(7, 0, 29, 9, 0, 29, 'minecraft:stripped_spruce_log[axis=x]'); F(7, 0, 31, 9, 0, 31, 'minecraft:stripped_spruce_log[axis=x]')
  F(5, 0, 6, 12, 1, 6, 'minecraft:spruce_log[axis=x]'); S(5, 2, 6, 'minecraft:spruce_log[axis=x]'); S(14, 0, 5, 'minecraft:stripped_spruce_log[axis=y]'); S(15, 0, 5, 'minecraft:chopping_block'.replace('minecraft:chopping_block', 'minecraft:spruce_log[axis=x]'))
  // foret
  sapin(1, 2, 10); sapin(30, 2, 11); sapin(30, 29, 9); sapin(24, 3, 8); sapin(0, 8, 7)
  for (var x = 0; x <= 31; x++) for (var z = 0; z <= 31; z++) {
    var dans = (x >= 3 && x <= 31 && z >= 7 && z <= 28) || (x <= 3 && z >= 12) || (z >= 29 && x >= 6 && x <= 10) || (z <= 6 && x >= 5 && x <= 15)
    if (dans) continue
    var r = R(); if (r < 0.06) SA(x, 0, z, 'minecraft:fern'); else if (r < 0.09) SA(x, 0, z, 'minecraft:sweet_berry_bush[age=3]'); else if (r < 0.11) SA(x, 0, z, 'minecraft:mossy_cobblestone'); else if (r < 0.15) SA(x, 0, z, 'minecraft:short_grass')
  }
}

// ================= MANOIR NEO-GOTHIQUE (2 x 2 chunks) =================
function manoirGothique() {
  var DB = 'minecraft:deepslate_bricks', DT = 'minecraft:deepslate_tiles', PBB = 'minecraft:polished_blackstone_bricks', CPB = 'minecraft:chiseled_polished_blackstone', WD = 'minecraft:dark_oak_planks', PD = 'mcwdoors:dark_oak_classic_door'
  F(0, -1, 0, 31, -1, 31, 'minecraft:grass_block')
  for (var x = 0; x <= 31; x++) for (var z = 0; z <= 31; z++) { var r = R(); if (r < 0.15) S(x, -1, z, 'minecraft:coarse_dirt'); else if (r < 0.2) S(x, -1, z, 'minecraft:podzol') }
  F(11, -1, 22, 12, -1, 31, 'minecraft:gravel')
  // corps principal x5..24 z10..21, 3 niveaux
  F(5, 0, 10, 24, 0, 21, 'minecraft:polished_deepslate')
  for (var y = 1; y <= 17; y++) for (var x = 5; x <= 24; x++) for (var z = 10; z <= 21; z++) if (x == 5 || x == 24 || z == 10 || z == 21) S(x, y, z, (x == 5 || x == 24) && (z == 10 || z == 21) ? PBB : R() < 0.12 ? 'minecraft:cracked_deepslate_bricks' : DB)
  ;[6, 12].forEach(y => { F(6, y, 11, 23, y, 20, WD); F(5, y, 10, 24, y, 10, PBB); F(5, y, 21, 24, y, 21, PBB); F(5, y, 10, 5, y, 21, PBB); F(24, y, 10, 24, y, 21, PBB) })
  F(5, 18, 10, 24, 18, 21, DB)
  for (var k = 0; k <= 6; k++) {
    var y = 18 + k, zs = 22 - k, zn = 9 + k
    F(4, y, zs, 25, y, zs, TOIT('north')); F(4, y, zn, 25, y, zn, TOIT('south'))
    if (k > 0 && zn + 1 <= zs - 1) { F(5, y, zn + 1, 5, y, zs - 1, DB); F(24, y, zn + 1, 24, y, zs - 1, DB) }
  }
  ;[5, 24].forEach(x => { F(x, 25, 15, x, 26, 16, PBB); S(x, 27, 15, 'minecraft:end_rod[facing=up]') })
  F(8, 19, 15, 8, 27, 16, DB); S(8, 28, 15, 'minecraft:decorated_pot'); S(8, 28, 16, 'minecraft:decorated_pot')
  // escalier (hall x6..13 z11..13) : volee 1 vers l'est, volee 2 vers l'ouest
  for (var k = 0; k <= 5; k++) { S(6 + k, 1 + k, 11, 'minecraft:dark_oak_stairs[facing=east,half=bottom,shape=straight]'); if (k > 0) F(6 + k, 1, 11, 6 + k, k, 11, WD) }
  F(6, 6, 11, 10, 6, 11, AIR)
  for (var k = 0; k <= 5; k++) { S(12 - k, 7 + k, 13, 'minecraft:dark_oak_stairs[facing=west,half=bottom,shape=straight]'); if (k > 0) F(12 - k, 7, 13, 12 - k, 6 + k, 13, WD) }
  F(8, 12, 13, 12, 12, 13, AIR); F(8, 13, 12, 12, 13, 12, 'mcwfences:ornate_metal_fence'); F(7, 7, 12, 10, 7, 12, 'mcwfences:ornate_metal_fence')
  // cloisons et couloir z15
  for (var f = 0; f < 3; f++) {
    var y = 6 * f
    F(6, y + 1, 14, 23, y + 5, 14, DB); F(6, y + 1, 16, 19, y + 5, 16, DB); F(14, y + 1, 11, 14, y + 5, 13, DB); F(10, y + 1, 17, 10, y + 5, 20, DB); F(13, y + 1, 17, 13, y + 5, 20, DB)
    F(7, y + 1, 15, 22, y + 1, 15, 'minecraft:purple_carpet'); ;[8, 14, 20].forEach(x => S(x, y + 5, 15, 'minecraft:soul_lantern[hanging=true]'))
    F(24, y + 2, 15, 24, y + 4, 15, GP)
  }
  F(11, 1, 16, 12, 3, 16, AIR); PORTE(9, 1, 14, PD, 'south', 'left', 'false'); PORTE(13, 7, 14, PD, 'south', 'left', 'false'); PORTE(6, 13, 14, PD, 'south', 'left', 'false')
  var c
  c = cadre(6, 17, 9, 20, 'south', 0); piece(c, 'bureau', 0); c.porte(PD)
  c = cadre(14, 17, 19, 20, 'south', 0); piece(c, 'salon', 0); c.porte(PD)
  c = cadre(15, 11, 23, 13, 'north', 0); piece(c, 'cuisine', 0); c.porte(PD)
  c = cadre(6, 17, 9, 20, 'south', 6); piece(c, 'chambre', 0); c.porte(PD)
  c = cadre(14, 17, 19, 20, 'south', 6); piece(c, 'chambre', 0); c.porte(PD)
  c = cadre(15, 11, 23, 13, 'north', 6); piece(c, 'sdb', 0); c.porte(PD)
  c = cadre(6, 17, 9, 20, 'south', 12); piece(c, 'chambre', 1); c.porte(PD)
  c = cadre(14, 17, 19, 20, 'south', 12); piece(c, 'bureau', 0); c.porte(PD)
  c = cadre(15, 11, 23, 13, 'north', 12); piece(c, 'chambre', 0); c.porte(PD)
  // vestibule (x11..12) : dallage, armures factices, double porte d'entree
  for (var z = 17; z <= 20; z++) { S(11, 0, z, z % 2 ? 'minecraft:polished_blackstone' : 'minecraft:smooth_quartz'); S(12, 0, z, z % 2 ? 'minecraft:smooth_quartz' : 'minecraft:polished_blackstone') }
  S(11, 5, 18, 'mcwlights:iron_chandelier'); F(11, 7, 18, 12, 7, 20, 'minecraft:red_carpet'); F(11, 7, 17, 11, 9, 17, 'minecraft:bookshelf'); S(11, 7, 19, MAT('dark_oak_chair', 'east')); S(12, 11, 18, 'minecraft:soul_lantern[hanging=true]')
  F(11, 13, 17, 11, 14, 17, 'minecraft:bookshelf'); S(11, 13, 19, 'minecraft:chest[facing=east]'); S(12, 13, 20, 'minecraft:skeleton_skull[rotation=8]'); S(12, 17, 18, 'minecraft:soul_lantern[hanging=true]')
  PORTE(12, 7, 16, PD, 'south', 'left', 'false'); PORTE(12, 13, 16, PD, 'south', 'left', 'false')
  PORTE(11, 1, 21, PD, 'south', 'left', 'false'); PORTE(12, 1, 21, PD, 'south', 'right', 'false'); F(11, 3, 21, 12, 4, 21, 'minecraft:purple_stained_glass_pane')
  // fenetres en lancette
  function lancette(x, y, z, h) { F(x, y, z, x, y + h - 1, z, 'minecraft:gray_stained_glass_pane'); S(x, y + h, z, CPB) }
  ;[0, 6, 12].forEach(y => { ;[7, 8, 15, 16, 18].forEach(x => { lancette(x, y + 2, 21, 3); lancette(x, y + 2, 10, 3) }); lancette(12, y + 2, 10, 3); ;[12, 19].forEach(z => lancette(5, y + 2, z, 3)); lancette(24, y + 2, 12, 3) })
  ;[11, 12].forEach(x => lancette(x, 8, 21, 3)); ;[11, 12].forEach(x => lancette(x, 14, 21, 3))
  ;[6, 15].forEach(x0 => { F(x0, 19, 19, x0 + 2, 21, 21, DB); lancette(x0 + 1, 19, 21, 2); F(x0, 22, 19, x0, 22, 21, TOIT('east')); F(x0 + 2, 22, 19, x0 + 2, 22, 21, TOIT('west')); F(x0 + 1, 22, 19, x0 + 1, 22, 21, DB); F(x0 + 1, 23, 19, x0 + 1, 23, 21, 'minecraft:deepslate_tile_slab[type=bottom]') })
  // porche a pignon
  F(10, 0, 22, 13, 0, 24, PBB); F(10, 0, 25, 13, 0, 25, 'minecraft:polished_blackstone_brick_stairs[facing=north,half=bottom,shape=straight]'); F(9, 0, 24, 9, 4, 24, PBB); F(14, 0, 24, 14, 4, 24, PBB); F(9, 0, 22, 9, 4, 22, PBB); F(14, 0, 22, 14, 4, 22, PBB)
  for (var k = 0; k <= 2; k++) { F(9 + k, 5 + k, 22, 9 + k, 5 + k, 25, TOIT('east')); F(14 - k, 5 + k, 22, 14 - k, 5 + k, 25, TOIT('west')) }
  F(10, 5, 22, 13, 5, 25, DB); F(11, 6, 22, 12, 6, 25, DB); S(11, 4, 23, 'minecraft:soul_lantern[hanging=true]')
  // tour d'angle x20..25 z16..23, beffroi et fleche
  F(21, 18, 17, 24, 29, 22, AIR)
  for (var y = 0; y <= 30; y++) for (var x = 20; x <= 25; x++) for (var z = 16; z <= 23; z++) { var bord = x == 20 || x == 25 || z == 16 || z == 23; if (bord) S(x, y, z, (x == 20 || x == 25) && (z == 16 || z == 23) ? PBB : y % 6 == 0 ? PBB : DB); else if (y % 6 == 0) S(x, y, z, y == 30 ? DT : WD); else S(x, y, z, AIR) }
  for (var yy = 6; yy <= 24; yy += 6) S(24, yy, 17, AIR); F(24, 1, 17, 24, 24, 17, 'minecraft:ladder[facing=south]')
  for (var f = 0; f < 3; f++) PORTE(22, 6 * f + 1, 16, PD, 'north', 'left', 'false')
  ;[2, 8, 14, 20].forEach(y => { lancette(22, y, 23, 3); lancette(23, y, 23, 3); lancette(25, y, 19, 3); lancette(25, y, 20, 3) })
  ;[[22, 23], [23, 23]].forEach(c => F(c[0], 26, c[1], c[0], 28, c[1], AIR)); F(25, 26, 19, 25, 28, 20, AIR); F(20, 26, 19, 20, 28, 20, AIR)
  S(22, 29, 19, 'minecraft:bell[attachment=ceiling,facing=north]')
  F(21, 1, 22, 21, 3, 22, 'minecraft:bookshelf'); F(24, 1, 21, 24, 3, 22, 'minecraft:bookshelf'); F(21, 1, 18, 21, 3, 21, 'minecraft:bookshelf'); S(23, 1, 19, MAT('dark_oak_chair', 'south')); S(22, 5, 19, 'minecraft:soul_lantern[hanging=true]')
  S(22, 7, 21, 'mcwfurnitures:dark_oak_table'); S(22, 7, 20, MAT('dark_oak_chair', 'south')); S(22, 8, 21, 'minecraft:candle[candles=4,lit=false]'); S(21, 7, 22, 'minecraft:skeleton_skull[rotation=8]'); S(22, 11, 19, 'minecraft:soul_lantern[hanging=true]')
  S(22, 13, 20, 'supplementaries:globe_sepia'); S(23, 13, 22, 'minecraft:lectern[facing=north]'); S(21, 13, 18, 'minecraft:chest[facing=east]'); S(22, 17, 19, 'minecraft:soul_lantern[hanging=true]')
  S(22, 19, 20, 'minecraft:cauldron'); F(21, 19, 22, 21, 20, 22, 'minecraft:cobweb')
  for (var k = 0; k < 4; k++) {
    var y0 = 31 + 2 * k, a = 20 + k, b = 25 - k, c1 = 16 + k, d = 23 - k
    if (b < a) break
    F(a, y0, c1, b, y0 + 1, d, DT); F(a, y0 + 1, d, b, y0 + 1, d, TOIT('north')); F(a, y0 + 1, c1, b, y0 + 1, c1, TOIT('south')); if (d - c1 > 1) { F(b, y0 + 1, c1 + 1, b, y0 + 1, d - 1, TOIT('west')); F(a, y0 + 1, c1 + 1, a, y0 + 1, d - 1, TOIT('east')) }
  }
  F(22, 37, 19, 22, 38, 19, 'minecraft:lightning_rod'.replace('lightning_rod', 'polished_blackstone_wall')); S(22, 39, 19, 'minecraft:lightning_rod')
  // parc : grille, portail, arbres morts, petit cimetiere, mausolee
  F(0, 0, 31, 31, 0, 31, PBB); F(0, 1, 31, 31, 2, 31, 'mcwfences:ornate_metal_fence'); F(0, 0, 0, 0, 2, 30, 'mcwfences:ornate_metal_fence'); F(31, 0, 0, 31, 2, 30, 'mcwfences:ornate_metal_fence'); F(1, 0, 0, 30, 2, 0, 'mcwfences:ornate_metal_fence')
  F(11, 0, 31, 12, 2, 31, AIR); F(10, 0, 31, 10, 3, 31, PBB); F(13, 0, 31, 13, 3, 31, PBB); S(10, 4, 31, 'minecraft:soul_lantern'); S(13, 4, 31, 'minecraft:soul_lantern'); S(11, 0, 31, 'minecraft:dark_oak_fence_gate[facing=south,open=true,in_wall=false]'); S(12, 0, 31, 'minecraft:dark_oak_fence_gate[facing=south,open=true,in_wall=false]')
  function arbreMort(x, z, h) { F(x, 0, z, x, h, z, 'minecraft:dark_oak_log[axis=y]'); F(x + 1, h - 1, z, x + 2, h - 1, z, 'minecraft:dark_oak_log[axis=x]'); S(x + 2, h, z, 'minecraft:dark_oak_log[axis=y]'); F(x, h - 2, z - 2, x, h - 2, z - 1, 'minecraft:dark_oak_log[axis=z]'); S(x, h - 1, z - 2, 'minecraft:dark_oak_log[axis=y]') }
  arbreMort(3, 26, 6); arbreMort(18, 28, 5); arbreMort(2, 6, 7)
  for (var gx = 26; gx <= 30; gx += 2) for (var gz = 24; gz <= 29; gz += 3) { S(gx, -1, gz, 'minecraft:coarse_dirt'); S(gx, -1, gz + 1, 'minecraft:coarse_dirt'); S(gx, 0, gz - 1, choix(['minecraft:stone_brick_wall', 'minecraft:mossy_stone_brick_wall', 'minecraft:cobblestone_wall'])); if (R() < 0.5) S(gx, 1, gz - 1, 'minecraft:candle[candles=1,lit=false]') }
  F(26, -1, 2, 30, -1, 7, 'minecraft:polished_deepslate'); W(26, 2, 30, 6, 0, 3, DB); F(26, 4, 2, 30, 4, 6, 'minecraft:deepslate_tile_slab[type=bottom]'); F(28, 0, 6, 28, 1, 6, 'minecraft:iron_bars'); S(28, 2, 6, CPB); S(28, 0, 4, 'minecraft:polished_blackstone_slab[type=top]'.replace('[type=top]', '[type=bottom]')); S(28, 3, 4, 'minecraft:soul_lantern[hanging=true]')
  for (var x = 0; x <= 31; x++) for (var z = 0; z <= 31; z++) { var dans = (x >= 4 && x <= 25 && z >= 9 && z <= 25) || (x >= 25 && z >= 1 && z <= 7) || (x >= 10 && x <= 13 && z >= 22) || x == 0 || x == 31 || z == 0 || z == 31 || (x >= 25 && z >= 22); if (dans) continue; var r = R(); if (r < 0.05) SA(x, 0, z, 'minecraft:dead_bush'.replace('dead_bush', 'short_grass')); else if (r < 0.08) SA(x, 0, z, 'minecraft:fern') }
}
