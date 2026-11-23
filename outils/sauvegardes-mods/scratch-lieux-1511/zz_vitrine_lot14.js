
// ================= BOURG FORESTIER : MAISONS, COMMERCES, ECOLE, AUBERGE, SCIERIE =================
function bgCrop() { return choix(['minecraft:carrots[age=7]', 'minecraft:potatoes[age=7]', 'minecraft:wheat[age=7]', 'minecraft:beetroots[age=3]', 'minecraft:wheat[age=5]']) }
function bgParasol(x, z, col) {
  F(x, 0, z, x, 2, z, BGF); F(x - 1, 3, z - 1, x + 1, 3, z + 1, 'minecraft:' + col + '_wool'); ;[[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(c => S(x + c[0], 3, z + c[1], AIR)); S(x, 4, z, 'minecraft:' + col + '_carpet')
  S(x + 1, 0, z, 'mcwfurnitures:spruce_table'); S(x + 2, 0, z, MAT('spruce_chair', 'west')); S(x - 1, 0, z, 'mcwfurnitures:spruce_table'); if (R() < 0.6) S(x - 2, 0, z, MAT('spruce_chair', 'east'))
}

// ================= DEUX MAISONS (maison de bucheron en rondins, maison a etage avec garage) =================
function bgMaisons() {
  BGT = {}
  var SL = 'minecraft:spruce_log', LH = 'minecraft:lantern[hanging=true]', ST = 'minecraft:spruce_stairs'
  bgSol(0, 0, 31, 31)
  // ---- maison de bucheron x2..12 z12..22 : rondins croises, cheminee de pierre, porche ----
  F(2, 0, 12, 12, 0, 22, 'minecraft:cobblestone'); F(3, 0, 13, 11, 0, 21, BGS)
  for (var y = 1; y <= 8; y++) {
    for (var x = 3; x <= 11; x++) { S(x, y, 12, SL + '[axis=x]'); S(x, y, 22, SL + '[axis=x]') }
    for (var z = 13; z <= 21; z++) { S(2, y, z, SL + '[axis=z]'); S(12, y, z, SL + '[axis=z]') }
    ;[[2, 12], [12, 12], [2, 22], [12, 22]].forEach(c => S(c[0], y, c[1], BGL))
    if (y % 2) { S(1, y, 12, SL + '[axis=x]'); S(13, y, 12, SL + '[axis=x]'); S(1, y, 22, SL + '[axis=x]'); S(13, y, 22, SL + '[axis=x]') }
    else { S(2, y, 11, SL + '[axis=z]'); S(12, y, 11, SL + '[axis=z]'); S(2, y, 23, SL + '[axis=z]'); S(12, y, 23, SL + '[axis=z]') }
  }
  F(3, 6, 13, 11, 6, 21, BGS); F(2, 9, 12, 12, 9, 12, BGX); F(2, 9, 22, 12, 9, 22, BGX); F(2, 9, 13, 2, 9, 21, BGZ); F(12, 9, 13, 12, 9, 21, BGZ)
  bgToitZ(11, 23, 2, 12, 9, 'spruce', [12, 22])
  for (var x = 3; x <= 11; x++) for (var y = 7; y < Math.min(8 + x, 22 - x); y++) S(x, y, 15, BGS)
  // cheminee et foyer
  F(2, 1, 16, 2, 8, 18, 'minecraft:cobblestone'); F(0, 0, 16, 1, 16, 18, 'minecraft:cobblestone'); F(0, 17, 17, 1, 17, 17, 'minecraft:cobblestone_wall')
  F(3, 1, 16, 3, 2, 16, 'minecraft:cobblestone'); F(3, 1, 18, 3, 2, 18, 'minecraft:cobblestone'); S(3, 1, 17, 'minecraft:campfire[lit=false,facing=east]'); F(3, 3, 16, 3, 3, 18, 'minecraft:stone_brick_slab[type=top]')
  S(3, 4, 17, 'minecraft:candle[candles=2,lit=false]'); S(3, 4, 16, 'minecraft:potted_fern')
  // sejour, cuisine, coin repas
  F(4, 1, 15, 4, 1, 19, 'minecraft:brown_carpet'); S(5, 1, 16, 'minecraft:brown_carpet'); S(5, 1, 18, 'minecraft:brown_carpet'); S(5, 1, 17, 'mcwfurnitures:spruce_coffee_table'); S(4, 1, 15, MAT('spruce_chair', 'east'))
  F(6, 1, 16, 6, 1, 18, 'mcwfurnitures:brown_couch[facing=west,shape=single]')
  S(11, 1, 14, MAT('spruce_counter', 'west')); S(11, 1, 15, MAT('spruce_counter', 'west')); S(11, 1, 16, 'mcwfurnitures:spruce_kitchen_sink[facing=west,water=false]'); S(11, 1, 17, 'farmersdelight:stove[facing=west,lit=false]'); S(11, 1, 18, MAT('spruce_counter', 'west'))
  S(11, 2, 17, 'farmersdelight:cooking_pot'); S(11, 2, 14, 'farmersdelight:cutting_board[facing=west]'); S(11, 2, 15, 'supplementaries:jar')
  S(11, 3, 14, 'mcwfurnitures:spruce_kitchen_cabinet[facing=west,hinge=left]'); S(11, 3, 15, 'mcwfurnitures:spruce_kitchen_cabinet[facing=west,hinge=right]'); S(11, 3, 18, 'mcwfurnitures:spruce_kitchen_cabinet[facing=west,hinge=left]')
  S(8, 1, 20, 'mcwfurnitures:spruce_table'); S(9, 1, 20, 'mcwfurnitures:spruce_table'); S(8, 1, 21, MAT('spruce_chair', 'north')); S(9, 1, 21, MAT('spruce_chair', 'north')); S(7, 1, 20, MAT('spruce_chair', 'east')); S(10, 1, 20, MAT('spruce_chair', 'west'))
  S(8, 2, 20, 'minecraft:candle[candles=3,lit=false]'); S(9, 2, 20, 'minecraft:potted_dead_bush'); S(8, 5, 20, 'mcwlights:iron_chandelier'); S(5, 5, 17, LH); S(9, 5, 16, LH)
  for (var k = 0; k <= 5; k++) { S(4 + k, 1 + k, 13, ST + '[facing=east,half=bottom,shape=straight]'); if (k > 0) F(4 + k, 1, 13, 4 + k, k, 13, BGS) }
  F(6, 6, 13, 8, 6, 13, AIR); F(6, 7, 14, 8, 7, 14, BGF)
  PORTE(6, 1, 22, BGP, 'south', 'left', 'false')
  // etage sous combles : chambre, palier-bureau
  PORTE(10, 7, 15, BGP, 'south', 'left', 'false')
  LIT(6, 7, 17, 'red', 'north'); LIT(7, 7, 17, 'red', 'north'); S(5, 7, 16, 'mcwfurnitures:spruce_end_table'); S(5, 8, 16, 'minecraft:candle[candles=1,lit=false]'); S(8, 7, 16, 'mcwfurnitures:spruce_end_table'); S(8, 8, 16, 'supplementaries:book_pile')
  S(3, 7, 19, 'mcwfurnitures:spruce_wardrobe[facing=east,connection=base,hinge=left]'); S(6, 7, 18, 'minecraft:chest[facing=south]'); F(5, 7, 19, 8, 7, 20, 'minecraft:white_carpet'); S(7, 14, 18, 'minecraft:chain[axis=y]'); S(7, 13, 18, LH)
  S(11, 7, 21, 'minecraft:barrel[facing=up,open=false]'); S(3, 7, 21, 'minecraft:potted_fern')
  S(4, 7, 14, 'mcwfurnitures:spruce_table'); S(4, 7, 13, MAT('spruce_chair', 'south')); S(4, 8, 14, 'supplementaries:book_pile'); F(3, 7, 13, 3, 8, 13, 'minecraft:bookshelf'); S(11, 7, 13, 'minecraft:chest[facing=west]'); S(9, 12, 14, LH)
  // fenetres
  bgFen(3, 4, 2, 22, 'south', 2, 0); bgFen(8, 9, 2, 22, 'south', 2, 1); bgFen(14, 14, 2, 2, 'west', 2, 0); bgFen(20, 20, 2, 2, 'west', 2, 0); bgFen(16, 16, 2, 12, 'east', 2, 3); bgFen(10, 10, 2, 12, 'north', 2, 0)
  bgFen(18, 18, 7, 2, 'west', 2, 0); bgFen(18, 18, 7, 12, 'east', 2, 1); bgFen(7, 7, 10, 12, 'north', 2, 0); bgFen(6, 8, 10, 22, 'south', 2, 0)
  // porche
  F(1, 0, 23, 13, 0, 25, BGS); ;[1, 5, 9, 13].forEach(x => F(x, 1, 25, x, 4, 25, BGL)); for (var x = 2; x <= 12; x++) if (x != 5 && x != 9 && x != 6 && x != 7) S(x, 1, 25, BGF)
  S(6, 0, 26, ST + '[facing=north,half=bottom,shape=straight]'); S(7, 0, 26, ST + '[facing=north,half=bottom,shape=straight]'); F(1, 5, 23, 13, 5, 25, 'minecraft:spruce_slab[type=bottom]'); S(7, 4, 24, LH)
  S(3, 1, 23, MAT('spruce_chair', 'south')); S(4, 1, 23, MAT('spruce_chair', 'south')); S(10, 1, 23, 'mcwfurnitures:spruce_end_table'); S(10, 2, 23, 'minecraft:candle[candles=1,lit=false]'); S(11, 1, 23, MAT('spruce_chair', 'south'))
  F(1, 1, 23, 1, 2, 24, SL + '[axis=z]')
  // bucher (appentis est), potager, cabane au fond du jardin
  F(15, 0, 14, 15, 3, 14, BGL); F(15, 0, 20, 15, 3, 20, BGL); F(13, 4, 13, 15, 4, 21, 'minecraft:spruce_slab[type=bottom]')
  for (var z = 15; z <= 19; z++) for (var y = 0; y <= 2; y++) for (var x = 13; x <= 14; x++) S(x, y, z, SL + '[axis=x]')
  S(15, 0, 23, SL + '[axis=y]')
  W(3, 3, 11, 9, 0, 0, BGF); S(7, 0, 9, 'minecraft:spruce_fence_gate[facing=south,open=false,in_wall=false]')
  for (var x = 4; x <= 10; x++) for (var z = 4; z <= 8; z++) {
    if (x == 7 && z == 6) { bgDalle(x, z, x, z, 'minecraft:water'); continue }
    if (R() < 0.3) { bgDalle(x, z, x, z, 'minecraft:coarse_dirt'); BGT[x + ',' + z] = 1 } else { bgDalle(x, z, x, z, 'minecraft:farmland[moisture=7]'); S(x, 0, z, bgCrop()) }
  }
  W(1, 1, 3, 3, 0, 2, BGS); bgDalle(2, 2, 2, 2, BGS); PORTE(2, 0, 3, 'minecraft:spruce_door', 'south', 'left', 'false'); S(2, 0, 2, 'minecraft:spruce_trapdoor[facing=north,half=top,open=false]'); S(2, 2, 2, LH); F(0, 3, 0, 4, 3, 4, 'minecraft:spruce_slab[type=bottom]')
  // ---- maison a etage x18..27 z11..21, garage x28..31 ----
  bgCoque(18, 11, 27, 21, 2, true)
  F(23, 1, 12, 23, 5, 20, 'minecraft:stone_bricks'); F(19, 1, 16, 22, 5, 16, 'minecraft:stone_bricks')
  var c = cadre(19, 12, 22, 15, 'west', 0); piece(c, 'cuisine', 1); c.porte(BGP)
  F(19, 1, 17, 22, 2, 17, 'minecraft:bookshelf'); F(20, 1, 18, 21, 1, 20, 'minecraft:green_carpet'); F(19, 1, 18, 19, 1, 19, 'mcwfurnitures:gray_couch[facing=east,shape=single]'); S(20, 1, 19, 'mcwfurnitures:spruce_coffee_table')
  S(22, 1, 18, MAT('spruce_chair', 'west')); S(22, 1, 20, MAT('spruce_drawer', 'west')); S(22, 2, 20, 'minecraft:black_stained_glass_pane'); S(19, 1, 20, 'minecraft:potted_fern'); S(20, 5, 19, 'mcwlights:iron_chandelier')
  PORTE(23, 1, 20, BGP, 'east', 'left', 'false')
  for (var k = 0; k <= 5; k++) { S(25, 1 + k, 20 - k, ST + '[facing=north,half=bottom,shape=straight]'); if (k > 0) F(25, 1, 20 - k, 25, k, 20 - k, BGS) }
  F(25, 6, 16, 25, 6, 18, AIR); F(24, 7, 16, 24, 7, 18, BGF); F(26, 7, 16, 26, 7, 18, BGF)
  PORTE(24, 1, 21, BGP, 'south', 'left', 'false'); S(26, 1, 19, MAT('spruce_drawer', 'west')); S(26, 1, 20, 'minecraft:potted_fern'); S(24, 1, 12, 'minecraft:decorated_pot'); S(26, 1, 12, 'minecraft:chest[facing=west]'); S(26, 1, 13, 'minecraft:barrel[facing=up,open=false]'); S(24, 5, 17, LH); S(24, 5, 13, LH)
  F(23, 7, 12, 23, 11, 20, BGS); F(19, 7, 16, 22, 11, 16, BGS)
  c = cadre(19, 17, 22, 20, 'west', 6); piece(c, 'chambre', 0); c.porte(BGP)
  c = cadre(19, 12, 22, 15, 'west', 6); piece(c, 'sdb', 1); c.porte(BGP)
  F(24, 7, 12, 26, 8, 12, 'minecraft:bookshelf'); S(24, 7, 14, MAT('spruce_chair', 'east')); S(26, 7, 20, 'minecraft:potted_azalea_bush'); S(25, 11, 13, LH); S(25, 11, 19, LH)
  bgToitX(17, 28, 11, 21, 12, 'brown_terracotta', [18, 27])
  bgFen(20, 21, 2, 21, 'south', 2, 3); bgFen(26, 26, 2, 21, 'south', 2, 3); bgFen(13, 14, 2, 18, 'west', 2, 3); bgFen(18, 19, 2, 18, 'west', 2, 2); bgFen(20, 21, 2, 11, 'north', 2, 3)
  bgFen(20, 21, 8, 21, 'south', 2, 0); bgFen(24, 25, 8, 21, 'south', 2, 1); bgFen(20, 21, 8, 11, 'north', 2, 0); bgFen(24, 25, 8, 11, 'north', 2, 0); bgFen(13, 14, 8, 18, 'west', 2, 0); bgFen(17, 18, 8, 18, 'west', 2, 0)
  bgFen(13, 14, 8, 27, 'east', 2, 0); bgFen(17, 18, 8, 27, 'east', 2, 2); bgFen(15, 16, 14, 18, 'west', 2, 3); bgFen(15, 16, 14, 27, 'east', 2, 3)
  F(23, 4, 22, 25, 4, 23, 'minecraft:spruce_slab[type=bottom]'); S(24, 0, 22, 'minecraft:stone_brick_stairs[facing=north,half=bottom,shape=straight]'); S(24, 3, 23, LH)
  bgDalle(28, 14, 30, 20, 'minecraft:smooth_stone'); F(31, 0, 13, 31, 4, 21, BGS); F(28, 0, 13, 30, 4, 13, BGS); F(31, 0, 21, 31, 4, 21, BGL); F(28, 4, 21, 30, 4, 21, BGX); F(28, 3, 21, 30, 3, 21, 'minecraft:spruce_trapdoor[facing=north,half=top,open=false]')
  F(28, 5, 12, 31, 5, 22, 'minecraft:spruce_slab[type=bottom]'); bgVoiture(29, 15, 'z', 'blue', 0, true)
  S(28, 0, 14, 'minecraft:crafting_table'); S(28, 0, 15, 'minecraft:barrel[facing=up,open=false]'); S(28, 0, 16, 'minecraft:smithing_table'); S(28, 0, 17, 'minecraft:chest[facing=east]'); S(28, 0, 19, 'minecraft:anvil[facing=east]'); S(30, 0, 14, 'supplementaries:sack'); S(29, 4, 17, LH)
  bgDalle(28, 22, 30, 31, ['minecraft:gravel', 'minecraft:coarse_dirt', 'minecraft:gravel']); bgVoiture(29, 24, 'z', 'red', 1)
  bgDalle(24, 23, 24, 31, ['minecraft:gravel', 'minecraft:dirt_path']); S(23, 0, 30, BGF); S(23, 1, 30, 'minecraft:barrel[facing=south,open=false]')
  // sauna au fond du jardin, bucher
  W(20, 2, 24, 6, 0, 3, 'minecraft:stripped_spruce_log[axis=y]'); bgDalle(21, 3, 23, 5, BGS); PORTE(22, 0, 6, 'minecraft:spruce_door', 'south', 'left', 'false'); F(19, 4, 1, 25, 4, 7, 'minecraft:spruce_slab[type=bottom]')
  F(21, 0, 3, 23, 0, 3, ST + '[facing=north,half=bottom,shape=straight]'); S(23, 0, 5, 'minecraft:smoker[facing=west,lit=false]'); S(23, 1, 5, 'minecraft:cobblestone_slab[type=bottom]'); S(21, 0, 5, 'minecraft:water_cauldron[level=1]'); S(22, 3, 4, LH); S(20, 1, 4, GP)
  F(25, 0, 2, 25, 1, 5, SL + '[axis=z]')
  for (var z = 1; z <= 30; z++) if (z % 7) S(16, 0, z, BGF)
  bgLierre(19, 2, 1, 6, 'west'); bgLierre(15, 31, 1, 4, 'east')
  sapin(29, 3, 10); sapin(14, 2, 8); sapin(1, 30, 8); sapin(19, 29, 7); sapin(31, 8, 8)
  bgVeg(0, 0, 31, 31, 0.32)
}

// ================= RANGEE DE COMMERCES : EPICERIE, BOULANGERIE, CAFE (logements a l'etage) =================
// Etage d'habitation commun aux trois boutiques (o = decalage en x) : sejour sur rue, cuisine et chambre sur cour
function bgEtage(o, cp, lit, fenAv) {
  var y = 6, LH = 'minecraft:lantern[hanging=true]'
  F(o + 2, y + 1, 8, o + 9, y + 5, 8, BGS); F(o + 6, y + 1, 9, o + 6, y + 5, 13, BGS)
  PORTE(o + 4, y + 1, 8, BGP, 'north', 'left', 'false'); PORTE(o + 8, y + 1, 8, BGP, 'north', 'right', 'false')
  // sejour
  for (var x = o + 3; x <= o + 5; x++) S(x, y + 1, 6, 'mcwfurnitures:' + cp + '_couch[facing=north,shape=single]')
  S(o + 3, y + 1, 5, 'minecraft:brown_carpet'); S(o + 4, y + 1, 5, 'mcwfurnitures:spruce_coffee_table'); S(o + 5, y + 1, 5, 'minecraft:brown_carpet'); S(o + 4, y + 2, 5, 'supplementaries:book_pile')
  S(o + 7, y + 1, 5, 'mcwfurnitures:oak_table'); S(o + 8, y + 1, 5, 'mcwfurnitures:oak_table'); S(o + 7, y + 1, 6, MAT('oak_chair', 'north')); S(o + 8, y + 1, 6, MAT('oak_chair', 'north')); S(o + 7, y + 1, 4, MAT('oak_chair', 'south'))
  S(o + 7, y + 2, 5, 'minecraft:candle[candles=2,lit=false]'); S(o + 9, y + 1, 7, 'minecraft:note_block'); S(o + 2, y + 1, 7, 'minecraft:bookshelf'); S(o + 2, y + 2, 7, 'minecraft:potted_fern'); S(o + 5, y + 5, 5, 'mcwlights:iron_chandelier')
  // cuisine
  S(o + 2, y + 1, 9, MAT('spruce_counter', 'east')); S(o + 2, y + 1, 10, MAT('spruce_counter', 'east')); S(o + 2, y + 1, 11, 'mcwfurnitures:spruce_kitchen_sink[facing=east,water=false]'); S(o + 2, y + 1, 12, 'farmersdelight:stove[facing=east,lit=false]'); S(o + 2, y + 2, 12, 'farmersdelight:cooking_pot')
  ;[9, 10, 11].forEach((z, i) => S(o + 2, y + 3, z, 'mcwfurnitures:spruce_kitchen_cabinet[facing=east,hinge=' + (i % 2 ? 'right' : 'left') + ']')); S(o + 2, y + 2, 9, 'farmersdelight:cutting_board[facing=east]')
  S(o + 5, y + 1, 11, 'mcwfurnitures:spruce_table'); S(o + 5, y + 1, 12, MAT('spruce_chair', 'north')); S(o + 5, y + 1, 10, MAT('spruce_chair', 'south')); S(o + 5, y + 1, 13, 'minecraft:white_concrete'); S(o + 5, y + 2, 13, 'minecraft:white_concrete'); S(o + 3, y + 5, 11, LH)
  // chambre
  LIT(o + 7, y + 1, 12, lit, 'south'); S(o + 8, y + 1, 13, 'mcwfurnitures:spruce_end_table'); S(o + 8, y + 2, 13, 'minecraft:candle[candles=1,lit=false]'); S(o + 9, y + 1, 9, 'mcwfurnitures:spruce_wardrobe[facing=west,connection=base,hinge=left]')
  S(o + 9, y + 1, 13, 'minecraft:chest[facing=west]'); S(o + 8, y + 1, 11, 'minecraft:' + lit + '_carpet'); S(o + 9, y + 1, 11, 'minecraft:' + lit + '_carpet'); S(o + 8, y + 5, 11, LH)
  bgPapiers(o + 2, 4, o + 9, 13, y + 1, 3)
  // ouvertures : fenetres sur rue et sur cour, porte de service et escalier exterieur
  fenAv.forEach(p => bgFen(p[0], p[1], y + 2, 3, 'north', 2, p[2]))
  bgFen(o + 3, o + 3, y + 2, 14, 'south', 2, 0); bgFen(o + 8, o + 8, y + 2, 14, 'south', 2, 0)
  PORTE(o + 4, y + 1, 14, BGP, 'south', 'left', 'false'); S(o + 4, y, 15, BGS); S(o + 3, y + 1, 15, BGF); S(o + 5, y + 1, 15, BGF)
  for (var k = 0; k <= 5; k++) { S(o + 4, k, 21 - k, 'minecraft:spruce_stairs[facing=north,half=bottom,shape=straight]'); if (k > 0) F(o + 4, 0, 21 - k, o + 4, k - 1, 21 - k, BGF) }
}
function bgCommerces() {
  BGT = {}
  var SB = 'minecraft:stone_bricks', LH = 'minecraft:lantern[hanging=true]', DO = 'minecraft:dark_oak_planks'
  bgSol(0, 0, 31, 31)
  bgDalle(0, 0, 31, 2, [SB, 'minecraft:polished_andesite', SB, 'minecraft:cracked_stone_bricks'])
  bgDalle(0, 29, 31, 31, ['minecraft:gravel', 'minecraft:gravel', 'minecraft:coarse_dirt'])
  // ---- epicerie x1..10 ----
  bgCoque(1, 3, 10, 14, 2, false); W(1, 3, 10, 14, 0, 0, SB)
  F(1, 1, 3, 10, 5, 3, DO); F(2, 2, 3, 4, 4, 3, GP); F(7, 2, 3, 9, 4, 3, GP); PORTE(5, 1, 3, BGV, 'north', 'left', 'false'); PORTE(6, 1, 3, BGV, 'north', 'right', 'false'); F(5, 3, 3, 6, 4, 3, GP)
  F(1, 5, 2, 10, 5, 2, 'supplementaries:awning_green[facing=north]'); F(5, 0, 2, 6, 0, 2, 'minecraft:stone_brick_stairs[facing=south,half=bottom,shape=straight]')
  for (var x = 2; x <= 9; x++) for (var z = 4; z <= 13; z++) S(x, 0, z, (x + z) % 2 ? 'minecraft:white_terracotta' : 'minecraft:gray_terracotta')
  S(8, 1, 5, MAT('spruce_counter', 'west')); S(8, 1, 6, MAT('spruce_counter', 'west')); S(8, 2, 5, 'supplementaries:jar'); S(8, 2, 6, 'minecraft:candle[candles=1,lit=false]'); S(9, 1, 6, 'mcwfurnitures:spruce_stool_chair')
  F(2, 1, 7, 2, 2, 12, 'minecraft:chiseled_bookshelf[facing=east]'); F(5, 1, 7, 5, 2, 11, 'minecraft:chiseled_bookshelf[facing=west]'); F(6, 1, 7, 6, 2, 11, 'minecraft:chiseled_bookshelf[facing=east]'); F(9, 1, 8, 9, 2, 12, 'minecraft:chiseled_bookshelf[facing=west]')
  for (var x = 2; x <= 8; x++) S(x, 1, 13, choix(['farmersdelight:carrot_crate', 'farmersdelight:potato_crate', 'farmersdelight:beetroot_crate', 'minecraft:barrel[facing=up,open=false]', 'supplementaries:sack', AIR]))
  F(2, 1, 4, 2, 2, 5, 'minecraft:white_concrete'); S(4, 1, 10, 'minecraft:barrel[facing=up,open=true]'); S(7, 1, 9, 'supplementaries:sack'); bgPapiers(2, 4, 9, 12, 1, 6)
  S(4, 5, 9, LH); S(7, 5, 9, LH); S(5, 5, 5, LH)
  S(8, 0, 1, 'farmersdelight:carrot_crate'); S(9, 0, 1, 'minecraft:barrel[facing=up,open=false]'); S(2, 0, 1, 'minecraft:barrel[facing=up,open=true]')
  bgEtage(0, 'green', 'blue', [[3, 4, 0], [7, 8, 1]])
  bgToitX(0, 10, 3, 14, 12, 'gray', [1, 10])
  bgFen(5, 6, 8, 1, 'west', 2, 0); bgFen(11, 11, 8, 1, 'west', 2, 1)
  // ---- boulangerie x11..20 : rez de pierre, etage a colombages, pignon sur rue ----
  bgCoque(11, 3, 20, 14, 2, true)
  for (var x = 11; x <= 20; x++) for (var y = 7; y <= 11; y++) [3, 14].forEach(z => S(x, y, z, (x - 11) % 3 == 0 ? BGL : y == 9 ? BGX : 'minecraft:white_terracotta'))
  F(13, 2, 3, 15, 4, 3, GP); PORTE(17, 1, 3, BGV, 'north', 'left', 'false'); S(17, 3, 3, GP); S(17, 0, 2, 'minecraft:stone_brick_stairs[facing=south,half=bottom,shape=straight]'); F(13, 5, 3, 15, 5, 3, 'minecraft:chiseled_stone_bricks')
  F(12, 5, 2, 19, 5, 2, 'supplementaries:awning_red[facing=north]')
  F(13, 1, 6, 17, 1, 6, MAT('stripped_spruce_counter', 'north')); S(14, 2, 6, 'minecraft:cake'); S(16, 2, 6, 'minecraft:cake[bites=3]'); S(13, 2, 6, 'supplementaries:jar'); S(17, 2, 6, 'minecraft:decorated_pot')
  F(13, 1, 8, 17, 1, 8, 'minecraft:barrel[facing=north,open=false]'); F(13, 2, 8, 17, 2, 8, 'minecraft:spruce_trapdoor[facing=north,half=bottom,open=true]')
  S(19, 1, 5, 'mcwfurnitures:spruce_table'); S(19, 1, 4, MAT('spruce_chair', 'south')); S(12, 1, 4, 'minecraft:potted_fern'); S(12, 1, 5, 'minecraft:barrel[facing=up,open=false]'); S(12, 2, 5, 'minecraft:decorated_pot'); S(15, 5, 5, LH); S(18, 5, 7, LH)
  F(12, 1, 9, 19, 5, 9, SB); PORTE(18, 1, 9, BGP, 'north', 'left', 'false')
  F(15, 1, 12, 17, 3, 13, 'minecraft:bricks'); S(15, 1, 12, 'minecraft:furnace[facing=north,lit=false]'); S(16, 1, 12, 'minecraft:smoker[facing=north,lit=false]'); S(17, 1, 12, 'minecraft:furnace[facing=north,lit=false]')
  S(13, 1, 11, 'mcwfurnitures:spruce_table'); S(14, 1, 11, 'mcwfurnitures:spruce_table'); S(13, 2, 11, 'farmersdelight:cutting_board[facing=north]'); S(14, 2, 11, 'supplementaries:jar')
  F(19, 1, 10, 19, 1, 12, 'supplementaries:sack'); S(19, 2, 10, 'supplementaries:sack'); S(19, 1, 13, 'minecraft:hay_block[axis=y]'); S(12, 1, 10, 'minecraft:barrel[facing=up,open=true]'); S(14, 5, 12, LH)
  PORTE(12, 1, 14, BGP, 'south', 'left', 'false'); S(12, 0, 15, 'minecraft:stone_brick_stairs[facing=north,half=bottom,shape=straight]'); bgFen(18, 18, 2, 14, 'south', 2, 3); bgPapiers(12, 4, 19, 7, 1, 3)
  bgEtage(10, 'brown', 'yellow', [[12, 13, 3], [15, 16, 3], [18, 19, 3]])
  F(16, 4, 13, 16, 18, 13, 'minecraft:bricks'); S(16, 19, 13, 'minecraft:brick_wall')
  bgToitZ(2, 15, 12, 19, 12, 'spruce', [3, 14]); bgFen(15, 16, 13, 3, 'north', 2, 3); F(16, 16, 13, 16, 18, 13, 'minecraft:bricks')
  // ---- cafe-restaurant x21..30 : bois, grandes baies, terrasse sous pergola ----
  bgCoque(21, 3, 30, 14, 2, false); W(21, 3, 30, 14, 0, 0, SB)
  F(22, 2, 3, 24, 4, 3, GP); bgFen(27, 29, 2, 3, 'north', 3, 2); PORTE(25, 1, 3, BGV, 'north', 'left', 'false'); PORTE(26, 1, 3, BGV, 'north', 'right', 'false'); F(25, 3, 3, 26, 3, 3, GP)
  F(25, 0, 2, 26, 0, 2, 'minecraft:stone_brick_stairs[facing=south,half=bottom,shape=straight]')
  ;[21, 24, 27, 30].forEach(x => { F(x, 0, 0, x, 3, 0, BGF); F(x, 4, 1, x, 4, 2, BGZ) }); F(21, 4, 0, 30, 4, 0, BGX)
  for (var x = 22; x <= 29; x++) if (x != 24 && x != 27 && R() < 0.6) F(x, 2, 0, x, 3, 0, 'minecraft:vine[up=true]'.replace('[up=true]', '[up=true,north=false]'))
  S(22, 0, 1, 'mcwfurnitures:spruce_table'); S(23, 0, 1, MAT('spruce_chair', 'west')); S(28, 0, 1, 'mcwfurnitures:spruce_table'); S(29, 0, 1, MAT('spruce_chair', 'west')); S(27, 0, 1, MAT('spruce_chair', 'east')); S(22, 1, 1, 'minecraft:candle[candles=1,lit=false]')
  F(28, 1, 5, 28, 1, 10, MAT('dark_oak_counter', 'west')); S(28, 2, 6, 'minecraft:brewing_stand'); S(28, 2, 9, 'supplementaries:jar'); ;[6, 8, 10].forEach(z => S(27, 1, z, 'mcwfurnitures:spruce_stool_chair'))
  F(29, 1, 5, 29, 1, 9, 'minecraft:barrel[facing=west,open=false]'); F(29, 2, 5, 29, 3, 9, 'minecraft:chiseled_bookshelf[facing=west]')
  ;[5, 8].forEach(z => { S(22, 1, z, 'mcwfurnitures:red_couch[facing=east,shape=single]'); S(23, 1, z, 'mcwfurnitures:dark_oak_table'); S(24, 1, z, 'mcwfurnitures:red_couch[facing=west,shape=single]'); S(23, 2, z, 'minecraft:candle[candles=1,lit=false]') })
  S(25, 1, 11, 'mcwfurnitures:dark_oak_table'); S(24, 1, 11, MAT('dark_oak_chair', 'east')); S(21, 3, 11, 'minecraft:target'); S(25, 1, 7, 'supplementaries:jar'); S(26, 1, 9, 'supplementaries:jar')
  F(22, 1, 13, 26, 1, 13, MAT('spruce_counter', 'north')); S(23, 1, 13, 'mcwfurnitures:spruce_kitchen_sink[facing=north,water=false]'); S(24, 1, 13, 'farmersdelight:stove[facing=north,lit=false]'); S(24, 2, 13, 'farmersdelight:cooking_pot'); S(22, 2, 13, 'farmersdelight:cutting_board[facing=north]')
  ;[22, 23, 25].forEach((x, i) => S(x, 3, 13, 'mcwfurnitures:spruce_kitchen_cabinet[facing=north,hinge=' + (i % 2 ? 'right' : 'left') + ']')); S(27, 1, 13, 'minecraft:jukebox')
  S(24, 5, 7, 'mcwlights:iron_chandelier'); S(25, 5, 11, LH); S(28, 5, 8, LH); PORTE(29, 1, 14, BGP, 'south', 'left', 'false'); S(29, 0, 15, 'minecraft:stone_brick_stairs[facing=north,half=bottom,shape=straight]'); bgPapiers(22, 4, 27, 12, 1, 5)
  bgEtage(20, 'gray', 'red', [[23, 24, 0], [27, 28, 0]])
  bgToitX(21, 31, 3, 14, 12, 'brown_terracotta', [21, 30])
  bgFen(5, 6, 8, 30, 'east', 2, 0); bgFen(11, 11, 8, 30, 'east', 2, 0); bgFen(8, 9, 2, 30, 'east', 2, 3)
  // cours arriere
  F(10, 0, 16, 10, 0, 28, BGF); F(20, 0, 16, 20, 0, 28, BGF); S(10, 0, 23, AIR); S(20, 0, 25, AIR)
  bgVoiture(6, 24, 'z', 'white', 1); F(1, 0, 17, 2, 1, 18, 'farmersdelight:potato_crate'); S(1, 2, 17, 'farmersdelight:carrot_crate'); S(8, 0, 16, 'minecraft:composter[level=0]'); S(2, 0, 20, 'supplementaries:sack')
  F(16, 0, 17, 19, 1, 18, 'minecraft:spruce_log[axis=x]'); S(12, 0, 17, 'supplementaries:sack'); S(12, 0, 18, 'supplementaries:sack'); S(12, 1, 17, 'supplementaries:sack'); S(17, 0, 22, 'minecraft:hay_block[axis=y]')
  F(27, 0, 17, 29, 0, 17, 'minecraft:barrel[facing=up,open=false]'); S(27, 1, 17, 'supplementaries:jar'); F(30, 0, 20, 30, 1, 20, 'minecraft:white_concrete'); S(26, 0, 20, MAT('spruce_chair', 'south')); S(22, 0, 26, 'minecraft:composter[level=0]')
  bgLierre(8, 1, 1, 11, 'west'); bgLierre(12, 30, 1, 7, 'east'); bgLierre(15, 14, 1, 5, 'south')
  sapin(2, 26, 8); sapin(17, 26, 9); sapin(28, 25, 7)
  bgVeg(0, 0, 31, 31, 0.3)
}

// ================= ECOLE COMMUNALE (pavillon central a clocheton, deux ailes de classe, preau, cour) =================
function bgEcole() {
  BGT = {}
  var SB = 'minecraft:stone_bricks', LH = 'minecraft:lantern[hanging=true]', LU = 'mcwlights:iron_chandelier', DT = 'minecraft:deepslate_tiles', DTS = 'minecraft:deepslate_tile_slab'
  bgSol(0, 0, 31, 31)
  bgCoque(2, 3, 12, 13, 1, false); bgCoque(19, 3, 29, 13, 1, false); bgCoque(12, 2, 19, 14, 2, true)
  F(2, 1, 3, 11, 1, 3, 'minecraft:cobblestone'); F(2, 1, 13, 11, 1, 13, 'minecraft:cobblestone'); F(2, 1, 4, 2, 1, 12, 'minecraft:cobblestone')
  F(20, 1, 3, 29, 1, 3, 'minecraft:cobblestone'); F(20, 1, 13, 29, 1, 13, 'minecraft:cobblestone'); F(29, 1, 4, 29, 1, 12, 'minecraft:cobblestone')
  bgToitX(1, 11, 3, 13, 6, 'gray', [2]); bgToitX(20, 30, 3, 13, 6, 'gray', [29]); bgToitZ(1, 15, 12, 19, 12, 'gray', [2, 14])
  // clocheton
  F(14, 13, 6, 17, 16, 9, BGS); ;[[14, 6], [17, 6], [14, 9], [17, 9]].forEach(p => F(p[0], 13, p[1], p[0], 19, p[1], BGL))
  ;[[15, 6], [16, 6], [15, 9], [16, 9], [14, 7], [14, 8], [17, 7], [17, 8]].forEach(p => S(p[0], 17, p[1], BGF))
  F(14, 20, 6, 17, 20, 9, DT); F(13, 20, 5, 18, 20, 5, DTS + '[type=top]'); F(13, 20, 10, 18, 20, 10, DTS + '[type=top]'); F(13, 20, 6, 13, 20, 9, DTS + '[type=top]'); F(18, 20, 6, 18, 20, 9, DTS + '[type=top]')
  F(14, 21, 6, 17, 21, 9, DTS + '[type=bottom]'); F(15, 21, 7, 16, 21, 8, DT); F(15, 22, 7, 16, 22, 8, DTS + '[type=bottom]'); S(15, 23, 7, 'minecraft:lightning_rod'); S(15, 19, 7, 'minecraft:bell[attachment=ceiling,facing=north]')
  // pavillon : entree, vestiaire, escalier
  PORTE(15, 1, 2, BGP, 'north', 'left', 'false'); PORTE(16, 1, 2, BGP, 'north', 'right', 'false'); S(15, 3, 2, GP); S(16, 3, 2, GP)
  PORTE(12, 1, 8, BGP, 'west', 'left', 'false'); PORTE(19, 1, 8, BGP, 'east', 'right', 'false'); PORTE(15, 1, 14, BGP, 'south', 'left', 'false'); S(15, 0, 15, 'minecraft:stone_brick_stairs[facing=north,half=bottom,shape=straight]')
  for (var k = 0; k <= 5; k++) { S(13 + k, 1 + k, 12, 'minecraft:spruce_stairs[facing=east,half=bottom,shape=straight]'); if (k > 0) F(13 + k, 1, 12, 13 + k, k, 12, BGS) }
  F(15, 6, 12, 17, 6, 12, AIR); F(15, 7, 11, 17, 7, 11, BGF)
  F(13, 0, 0, 18, 0, 1, SB); F(14, 0, 0, 17, 0, 0, 'minecraft:stone_brick_stairs[facing=south,half=bottom,shape=straight]'); F(13, 1, 0, 13, 3, 0, BGF); F(18, 1, 0, 18, 3, 0, BGF); F(13, 4, 0, 18, 4, 1, 'minecraft:spruce_slab[type=bottom]'); S(15, 3, 1, LH)
  ;[14, 17].forEach(x => S(x, 3, 3, 'minecraft:tripwire_hook[facing=south,attached=false,powered=false]'))
  F(13, 1, 5, 13, 1, 6, 'minecraft:spruce_stairs[facing=west,half=bottom,shape=straight]'); F(18, 1, 5, 18, 1, 6, 'minecraft:spruce_stairs[facing=east,half=bottom,shape=straight]')
  S(13, 1, 3, 'minecraft:barrel[facing=up,open=false]'); S(18, 2, 9, 'supplementaries:notice_board[facing=west]'); S(13, 1, 10, 'minecraft:potted_fern'); S(13, 1, 11, 'minecraft:cauldron'); S(15, 5, 7, LU); bgPapiers(13, 3, 18, 11, 1, 5)
  // logement de fonction a l'etage
  F(13, 7, 7, 18, 11, 7, BGS); PORTE(13, 7, 7, BGP, 'north', 'left', 'false')
  var c = cadre(13, 3, 18, 6, 'north', 6); piece(c, 'chambre', 0)
  F(18, 7, 8, 18, 7, 10, MAT('spruce_counter', 'west')); S(18, 7, 9, 'mcwfurnitures:spruce_kitchen_sink[facing=west,water=false]'); S(18, 7, 10, 'farmersdelight:stove[facing=west,lit=false]'); S(18, 8, 10, 'farmersdelight:cooking_pot')
  S(15, 7, 9, 'mcwfurnitures:spruce_table'); S(14, 7, 9, MAT('spruce_chair', 'east')); S(16, 7, 9, MAT('spruce_chair', 'west')); S(15, 8, 9, 'minecraft:candle[candles=2,lit=false]')
  F(13, 7, 10, 13, 7, 11, 'mcwfurnitures:blue_couch[facing=east,shape=single]'); S(13, 7, 13, 'minecraft:bookshelf'); S(15, 11, 10, LH)
  // fenetres
  bgFen(3, 5, 2, 3, 'north', 3, 3); bgFen(7, 9, 2, 3, 'north', 3, 3); bgFen(3, 5, 2, 13, 'south', 3, 3); bgFen(7, 9, 2, 13, 'south', 3, 2)
  bgFen(20, 22, 2, 3, 'north', 3, 3); bgFen(24, 26, 2, 3, 'north', 3, 2); bgFen(28, 28, 2, 3, 'north', 3, 3); bgFen(20, 22, 2, 13, 'south', 3, 3); bgFen(24, 26, 2, 13, 'south', 3, 3); bgFen(28, 28, 2, 13, 'south', 3, 3)
  bgFen(4, 5, 2, 2, 'west', 3, 3); bgFen(12, 12, 2, 2, 'west', 3, 3); bgFen(4, 5, 2, 29, 'east', 3, 3); bgFen(12, 12, 2, 29, 'east', 3, 2)
  bgFen(13, 13, 2, 2, 'north', 3, 3); bgFen(18, 18, 2, 2, 'north', 3, 3); bgFen(13, 13, 2, 14, 'south', 3, 3); bgFen(18, 18, 2, 14, 'south', 3, 3)
  bgFen(14, 14, 8, 2, 'north', 2, 0); bgFen(17, 17, 8, 2, 'north', 2, 0); bgFen(14, 14, 8, 14, 'south', 2, 0); bgFen(17, 17, 8, 14, 'south', 2, 1); bgFen(15, 16, 13, 2, 'north', 2, 3)
  // salles de classe (ouest : tableau a l'ouest ; est : tableau a l'est)
  ;[[3, 1, 'east', 5, 4, [7, 10]], [28, -1, 'west', 26, 27, [24, 21]]].forEach(cl => {
    var xt = cl[0], s = cl[1], ft = cl[2]
    F(xt, 2, 7, xt, 3, 9, 'supplementaries:blackboard[facing=' + ft + ']'); S(xt, 4, 8, 'supplementaries:clock_block[facing=' + ft + ']')
    S(cl[3], 1, 8, 'mcwfurnitures:spruce_table'); S(cl[4], 1, 8, MAT('spruce_chair', ft)); S(cl[3], 2, 8, 'supplementaries:globe')
    cl[5].forEach(x => [5, 6, 10, 11].forEach(z => {
      S(x, 1, z, 'mcwfurnitures:spruce_table'); var r = R()
      S(x + s, 1, z, r < 0.18 ? AIR : r < 0.26 ? 'supplementaries:sack' : MAT('spruce_chair', OPP[ft]))
      if (R() < 0.35) S(x, 2, z, choix(['supplementaries:book_pile', 'minecraft:white_carpet', 'minecraft:candle[candles=1,lit=false]']))
    }))
    var xp = s > 0 ? 11 : 20; S(xp, 1, 4, 'minecraft:furnace[facing=' + OPP[ft] + ',lit=false]'); F(xp, 2, 4, xp, 5, 4, 'minecraft:iron_bars')
    F(s > 0 ? 3 : 26, 1, 12, s > 0 ? 5 : 28, 1, 12, 'minecraft:bookshelf'); S(s > 0 ? 7 : 24, 5, 8, LU); S(s > 0 ? 9 : 22, 5, 5, LH)
  })
  bgPapiers(3, 4, 11, 12, 1, 6); bgPapiers(20, 4, 28, 12, 1, 6)
  // preau
  bgDalle(3, 22, 13, 29, 'minecraft:smooth_stone'); ;[3, 7, 10, 13].forEach(x => [22, 29].forEach(z => F(x, 0, z, x, 4, z, BGL)))
  F(3, 5, 22, 13, 5, 22, BGX); F(3, 5, 29, 13, 5, 29, BGX); F(3, 5, 23, 3, 5, 28, BGZ); F(13, 5, 23, 13, 5, 28, BGZ)
  bgToitX(2, 14, 22, 29, 5, 'gray', [])
  F(4, 0, 29, 6, 2, 29, BGS); F(8, 0, 29, 9, 2, 29, BGS); F(11, 0, 29, 12, 2, 29, BGS); F(4, 0, 28, 12, 0, 28, 'minecraft:spruce_stairs[facing=south,half=bottom,shape=straight]')
  ;[5, 8, 11].forEach(x => S(x, 2, 28, 'minecraft:tripwire_hook[facing=north,attached=false,powered=false]')); S(12, 0, 23, 'supplementaries:sack')
  // cour : bitume fissure, marelle, but, bouleau
  for (var x = 14; x <= 30; x++) for (var z = 16; z <= 30; z++) { var r = R(), b = r < 0.82 ? 'minecraft:gray_concrete' : r < 0.9 ? 'minecraft:andesite' : 'minecraft:coarse_dirt'; bgDalle(x, z, x, z, b); if (b == 'minecraft:coarse_dirt') BGT[x + ',' + z] = 1 }
  ;[18, 19, 21, 22, 23, 25].forEach(z => { S(17, -1, z, 'minecraft:white_concrete'); if (z == 19 || z == 22 || z == 25) S(18, -1, z, 'minecraft:white_concrete') })
  F(30, 0, 21, 30, 2, 21, 'minecraft:iron_bars'); F(30, 0, 25, 30, 2, 25, 'minecraft:iron_bars'); F(30, 3, 21, 30, 3, 25, 'minecraft:iron_bars')
  F(24, 0, 27, 24, 6, 27, 'minecraft:birch_log[axis=y]'); bgDalle(24, 27, 24, 27, 'minecraft:coarse_dirt')
  for (var dx = -2; dx <= 2; dx++) for (var dz = -2; dz <= 2; dz++) for (var y = 5; y <= 8; y++) if (Math.abs(dx) + Math.abs(dz) + Math.abs(y - 6.5) < 3.6 && R() < 0.9) SA(24 + dx, y, 27 + dz, 'minecraft:birch_leaves[persistent=true]')
  bgBanc(22, 29, 'south', 2); bgBanc(26, 29, 'south', 2)
  F(0, 0, 15, 0, 0, 31, BGF); F(31, 0, 15, 31, 0, 31, BGF); F(1, 0, 31, 30, 0, 31, BGF)
  for (var i = 0; i < 14; i++) SA(14 + Math.floor(R() * 17), 0, 16 + Math.floor(R() * 15), choix(['minecraft:birch_leaves[persistent=true]', 'minecraft:white_carpet', 'minecraft:moss_carpet']))
  // abords
  for (var x = 2; x <= 11; x++) if (R() > 0.2) S(x, 0, 0, 'minecraft:spruce_leaves[persistent=true]'); for (var x = 20; x <= 29; x++) if (R() > 0.2) S(x, 0, 0, 'minecraft:spruce_leaves[persistent=true]')
  bgVeg(2, 1, 11, 2, 0.9); bgVeg(20, 1, 29, 2, 0.9)
  bgLierre(8, 2, 1, 6, 'west'); bgLierre(10, 13, 1, 5, 'south'); bgLierre(27, 3, 2, 5, 'north')
  sapin(1, 17, 9); sapin(30, 14, 8); sapin(9, 18, 7)
  bgVeg(0, 0, 31, 31, 0.3)
}

// ================= AUBERGE (R+2 a galeries, taverne, chambres d'hotes, grange, terrasse) =================
function bgAuberge() {
  BGT = {}
  var SB = 'minecraft:stone_bricks', LH = 'minecraft:lantern[hanging=true]', LU = 'mcwlights:iron_chandelier', ST = 'minecraft:spruce_stairs'
  bgSol(0, 0, 31, 31)
  bgDalle(2, 0, 25, 3, [SB, 'minecraft:cobblestone', 'minecraft:mossy_cobblestone'])
  bgCoque(3, 4, 24, 15, 3, true)
  // rez : taverne, bar, cuisine
  F(19, 1, 5, 19, 5, 14, SB)
  var c = cadre(20, 5, 23, 14, 'east', 0); piece(c, 'cuisine', 1); c.porte(BGP)
  F(16, 1, 5, 16, 1, 9, MAT('dark_oak_counter', 'west')); S(16, 2, 6, 'minecraft:brewing_stand'); S(16, 2, 8, 'supplementaries:jar'); ;[5, 7, 9].forEach(z => S(15, 1, z, 'mcwfurnitures:spruce_stool_chair'))
  F(18, 1, 6, 18, 2, 9, 'minecraft:barrel[facing=west,open=false]'); S(17, 5, 7, LH)
  F(4, 1, 8, 4, 3, 8, 'minecraft:cobblestone'); F(4, 1, 11, 4, 3, 11, 'minecraft:cobblestone'); S(4, 1, 9, 'minecraft:campfire[lit=false,facing=east]'); S(4, 1, 10, 'minecraft:campfire[lit=false,facing=east]'); F(4, 4, 8, 4, 4, 11, 'minecraft:stone_brick_slab[type=top]')
  S(4, 5, 9, 'minecraft:candle[candles=3,lit=false]'); S(4, 5, 10, 'minecraft:decorated_pot')
  ;[7, 11].forEach(zt => {
    F(6, 1, zt, 11, 1, zt, 'mcwfurnitures:spruce_table'); F(6, 1, zt - 1, 11, 1, zt - 1, ST + '[facing=north,half=bottom,shape=straight]'); F(6, 1, zt + 1, 11, 1, zt + 1, ST + '[facing=south,half=bottom,shape=straight]')
    for (var x = 6; x <= 11; x++) { if (R() < 0.15) S(x, 1, zt - 1, AIR); if (R() < 0.15) S(x, 1, zt + 1, AIR); if (R() < 0.3) S(x, 2, zt, choix(['minecraft:candle[candles=1,lit=false]', 'supplementaries:jar', 'minecraft:white_carpet'])) }
  })
  S(14, 1, 12, MAT('spruce_counter', 'north')); S(15, 1, 12, 'minecraft:barrel[facing=north,open=false]'); S(15, 2, 12, 'minecraft:bell[attachment=floor,facing=north]'); S(14, 2, 12, 'supplementaries:book_pile')
  S(8, 5, 9, LU); S(13, 5, 8, LU); S(9, 5, 13, LH); bgPapiers(5, 5, 14, 13, 1, 6)
  for (var k = 0; k <= 5; k++) { S(17 - k, 1 + k, 14, ST + '[facing=west,half=bottom,shape=straight]'); if (k > 0) F(17 - k, 1, 14, 17 - k, k, 14, BGS) }
  F(13, 6, 14, 15, 6, 14, AIR)
  PORTE(12, 1, 4, BGP, 'north', 'left', 'false'); PORTE(13, 1, 4, BGP, 'north', 'right', 'false'); F(11, 0, 3, 14, 0, 3, 'minecraft:stone_brick_stairs[facing=south,half=bottom,shape=straight]')
  PORTE(8, 1, 15, BGP, 'south', 'left', 'false'); S(8, 0, 16, 'minecraft:stone_brick_stairs[facing=north,half=bottom,shape=straight]')
  bgFen(5, 6, 2, 4, 'north', 3, 3); bgFen(8, 9, 2, 4, 'north', 3, 3); bgFen(15, 16, 2, 4, 'north', 3, 2); bgFen(21, 22, 2, 4, 'north', 3, 3)
  bgFen(6, 6, 2, 3, 'west', 2, 3); bgFen(13, 13, 2, 3, 'west', 2, 3); bgFen(5, 6, 2, 15, 'south', 2, 3); bgFen(10, 11, 2, 15, 'south', 2, 3); bgFen(8, 9, 2, 24, 'east', 2, 3)
  // etages : couloir, chambres d'hotes, cage d'escalier
  ;[6, 12].forEach((y, f) => {
    F(4, y + 1, 8, 23, y + 5, 8, BGS); F(4, y + 1, 11, 11, y + 5, 11, BGS); F(18, y + 1, 11, 23, y + 5, 11, BGS)
    ;[8, 13, 18].forEach(x => F(x, y + 1, 5, x, y + 5, 7, BGS)); F(11, y + 1, 12, 11, y + 5, 14, BGS); F(18, y + 1, 12, 18, y + 5, 14, BGS)
    ;[[4, 7], [9, 12], [14, 17], [19, 23]].forEach(p => { var cc = cadre(p[0], 5, p[1], 7, 'north', y); piece(cc, 'chambre', R() < 0.3 ? 1 : 0); cc.porte(BGP) })
    var ce = cadre(4, 12, 10, 14, 'south', y); piece(ce, f == 0 ? 'sdb' : 'salle', 0); ce.porte(BGP)
    var cg = cadre(19, 12, 23, 14, 'south', y); piece(cg, 'chambre', 0); cg.porte(BGP)
    for (var x = 4; x <= 23; x++) for (var z = 9; z <= 10; z++) if (R() > 0.12) S(x, y + 1, z, f == 0 ? 'minecraft:red_carpet' : 'minecraft:green_carpet')
    ;[7, 15, 21].forEach(x => S(x, y + 5, 9, LH))
    ;[6, 10, 16, 22].forEach(x => PORTE(x, y + 1, 4, BGV, 'north', 'left', 'false')); ;[5, 9, 14].forEach(x => F(x, y + 2, 4, x, y + 3, 4, GP)); F(20, y + 2, 4, 21, y + 3, 4, GP)
    bgFen(6, 6, y + 2, 3, 'west', 2, f); bgFen(13, 13, y + 2, 3, 'west', 2, 0); bgFen(6, 6, y + 2, 24, 'east', 2, 0); bgFen(13, 13, y + 2, 24, 'east', 2, 2 - f)
    bgFen(5, 6, y + 2, 15, 'south', 2, 0); bgFen(20, 21, y + 2, 15, 'south', 2, f); bgFen(14, 15, y + 3, 15, 'south', 2, 3)
    F(3, y, 2, 24, y, 3, 'minecraft:spruce_slab[type=top]'); F(3, y + 1, 2, 24, y + 1, 2, BGF); S(3, y + 1, 3, BGF); S(24, y + 1, 3, BGF)
  })
  for (var k = 0; k <= 5; k++) { S(12 + k, 7 + k, 13, ST + '[facing=east,half=bottom,shape=straight]'); if (k > 0) F(12 + k, 7, 13, 12 + k, 6 + k, 13, BGS) }
  F(15, 12, 13, 16, 12, 13, AIR)
  for (var k = 0; k <= 5; k++) { S(17 - k, 13 + k, 14, ST + '[facing=west,half=bottom,shape=straight]'); if (k > 0) F(17 - k, 13, 14, 17 - k, 12 + k, 14, BGS) }
  F(13, 18, 14, 14, 18, 14, AIR)
  ;[3, 8, 13, 18, 24].forEach(x => F(x, 0, 2, x, 17, 2, BGL)); F(3, 18, 2, 24, 18, 2, 'minecraft:spruce_slab[type=bottom]')
  S(5, 7, 3, MAT('spruce_chair', 'north')); S(20, 13, 3, MAT('spruce_chair', 'north')); S(11, 7, 3, 'minecraft:potted_dead_bush'); S(16, 13, 3, 'supplementaries:sack')
  // combles : dortoir du personnel, malles, lucarnes vitrees
  bgToitX(2, 25, 4, 15, 18, 'spruce', [3, 24])
  ;[[8, 20, 5], [18, 20, 5], [8, 21, 6], [18, 21, 6], [13, 20, 14], [20, 20, 14]].forEach(p => S(p[0], p[1], p[2], 'minecraft:glass'))
  LIT(6, 19, 10, 'gray', 'north'); LIT(9, 19, 10, 'brown', 'north'); S(5, 19, 6, 'minecraft:chest[facing=south]'); S(7, 19, 6, 'minecraft:barrel[facing=up,open=false]'); S(20, 19, 7, 'minecraft:chest[facing=south]')
  S(22, 19, 12, 'supplementaries:sack'); S(21, 19, 13, 'minecraft:barrel[facing=up,open=true]'); S(12, 23, 9, LH); S(20, 23, 10, LH); bgFen(9, 10, 20, 3, 'west', 2, 3); bgFen(9, 10, 20, 24, 'east', 2, 3)
  F(1, 0, 9, 2, 26, 10, 'minecraft:cobblestone'); F(1, 27, 9, 2, 27, 10, 'minecraft:cobblestone_wall')
  // grange x26..30 z3..19
  bgDalle(26, 3, 30, 19, ['minecraft:coarse_dirt', 'minecraft:packed_mud', 'minecraft:gravel']); W(26, 3, 30, 19, 0, 8, BGS); ;[3, 7, 11, 15, 19].forEach(z => { F(26, 0, z, 26, 8, z, BGL); F(30, 0, z, 30, 8, z, BGL) })
  bgToitZ(2, 20, 26, 30, 8, 'spruce', [3, 19])
  F(27, 0, 3, 29, 4, 3, AIR); F(27, 5, 3, 29, 5, 3, BGX)
  F(27, 5, 12, 29, 5, 18, BGS); F(27, 0, 11, 27, 5, 11, 'minecraft:ladder[facing=east]'); F(28, 6, 12, 29, 6, 12, BGF)
  F(27, 6, 14, 29, 6, 18, 'minecraft:hay_block[axis=y]'); F(27, 7, 14, 29, 7, 15, 'minecraft:hay_block[axis=y]')
  F(28, 0, 6, 29, 0, 6, BGF); F(28, 0, 9, 29, 0, 9, BGF); S(29, 0, 4, 'minecraft:composter[level=0]'); S(29, 0, 5, 'minecraft:hay_block[axis=y]'); S(29, 0, 7, 'minecraft:water_cauldron[level=1]'); S(29, 0, 8, 'minecraft:hay_block[axis=y]')
  S(27, 0, 18, 'minecraft:chest[facing=east]'); S(27, 0, 16, 'minecraft:anvil[facing=north]'); S(29, 0, 17, 'minecraft:barrel[facing=up,open=false]'); S(29, 0, 15, 'supplementaries:sack'); S(28, 4, 14, LH)
  F(30, 3, 9, 30, 4, 9, GP); F(30, 3, 16, 30, 4, 16, GP); S(26, 0, 1, 'minecraft:water_cauldron[level=2]'); S(27, 0, 1, 'minecraft:cauldron')
  // terrasse et jardin
  bgDalle(4, 17, 18, 24, [SB, 'minecraft:cobblestone', 'minecraft:mossy_cobblestone', 'minecraft:gravel'])
  bgParasol(7, 20, 'red'); bgParasol(13, 20, 'white'); bgParasol(16, 23, 'red')
  S(10, 0, 28, 'minecraft:campfire[lit=false]'); F(8, 0, 27, 8, 0, 29, 'minecraft:stripped_spruce_log[axis=z]'); F(12, 0, 27, 12, 0, 29, 'minecraft:stripped_spruce_log[axis=z]')
  bgLierre(12, 3, 1, 16, 'west'); bgLierre(10, 24, 1, 5, 'east')
  sapin(2, 27, 9); sapin(22, 28, 8); sapin(29, 25, 9)
  bgVeg(0, 0, 31, 31, 0.32)
}

// ================= SCIERIE (zone d'activite : halle de sciage, chaufferie, bureau, parc a grumes) =================
function bgScierie() {
  BGT = {}
  var LH = 'minecraft:lantern[hanging=true]'
  for (var x = 0; x <= 31; x++) for (var z = 0; z <= 31; z++) { var r = R(), b = r < 0.3 ? 'minecraft:gravel' : r < 0.55 ? 'minecraft:coarse_dirt' : r < 0.7 ? 'minecraft:packed_mud' : r < 0.8 ? 'minecraft:rooted_dirt' : 'minecraft:grass_block'; S(x, -1, z, b); if (b != 'minecraft:gravel' && b != 'minecraft:packed_mud') BGT[x + ',' + z] = 1 }
  // halle de sciage x2..18 z8..24
  F(2, 0, 8, 18, 0, 24, BGS); F(2, 1, 9, 2, 2, 23, BGS); F(18, 1, 9, 18, 2, 23, BGS); F(3, 1, 24, 17, 6, 24, BGS)
  ;[2, 6, 10, 14, 18].forEach(x => [8, 14, 20, 24].forEach(z => F(x, 1, z, x, 6, z, BGL)))
  F(2, 7, 8, 2, 7, 24, BGZ); F(18, 7, 8, 18, 7, 24, BGZ); ;[8, 14, 20, 24].forEach(z => F(3, 7, z, 17, 7, z, BGX))
  bgToitZ(7, 25, 2, 18, 7, 'spruce', [24])
  for (var z = 9; z <= 23; z++) if (z < 15 || z > 17) S(10, 1, z, 'minecraft:rail[shape=north_south]')
  S(10, 1, 11, 'minecraft:spruce_log[axis=z]'); S(10, 1, 12, 'minecraft:spruce_log[axis=z]'); S(10, 1, 16, 'minecraft:stonecutter[facing=north]'); F(9, 1, 15, 9, 1, 17, 'mcwfurnitures:spruce_table'); F(11, 1, 15, 11, 1, 17, 'mcwfurnitures:spruce_table')
  S(10, 6, 8, 'minecraft:chain[axis=y]'); S(10, 5, 8, 'minecraft:chain[axis=y]'); S(10, 4, 8, 'minecraft:spruce_log[axis=x]')
  F(3, 1, 16, 5, 2, 19, 'minecraft:stripped_spruce_log[axis=x]'); F(15, 1, 16, 17, 3, 19, BGS); F(15, 4, 16, 17, 4, 17, 'minecraft:spruce_slab[type=bottom]')
  S(3, 1, 22, 'minecraft:crafting_table'); S(4, 1, 22, 'minecraft:grindstone[face=floor,facing=north]'); S(5, 1, 23, 'minecraft:anvil[facing=east]'); S(3, 1, 23, 'minecraft:chest[facing=east]')
  S(16, 1, 22, 'minecraft:barrel[facing=up,open=false]'); S(17, 1, 22, 'minecraft:barrel[facing=up,open=false]'); S(17, 1, 23, 'minecraft:barrel[facing=up,open=true]'); S(16, 1, 23, 'supplementaries:sack')
  ;[[8, 14], [12, 14], [8, 20], [12, 20]].forEach(p => S(p[0], 6, p[1], LH))
  for (var i = 0; i < 14; i++) SA(3 + Math.floor(R() * 15), 1, 9 + Math.floor(R() * 15), choix(['minecraft:brown_carpet', 'minecraft:spruce_trapdoor[facing=north,half=bottom,open=false]', 'minecraft:stripped_spruce_log[axis=z]']))
  // parc a grumes et camion grumier
  F(3, 0, 2, 12, 1, 4, 'minecraft:spruce_log[axis=x]'); F(4, 2, 3, 11, 2, 3, 'minecraft:spruce_log[axis=x]'); F(14, 0, 2, 17, 1, 3, 'minecraft:birch_log[axis=x]')
  F(25, 0, 22, 30, 0, 26, 'minecraft:spruce_log[axis=x]'); F(25, 1, 22, 30, 1, 25, 'minecraft:spruce_log[axis=x]'); F(25, 2, 23, 30, 2, 24, 'minecraft:spruce_log[axis=x]'); F(25, 0, 28, 30, 1, 30, 'minecraft:spruce_log[axis=x]')
  for (var v = 0; v <= 1; v++) for (var u = 0; u <= 7; u++) {
    var x = 21 + v, z = 21 + u
    if (u <= 1) { S(x, 0, z, 'minecraft:red_concrete'); S(x, 1, z, u == 0 ? 'minecraft:tinted_glass' : 'minecraft:red_concrete'); S(x, 2, z, 'minecraft:smooth_stone_slab[type=bottom]') }
    else { S(x, 0, z, 'minecraft:gray_concrete'); S(x, 1, z, 'minecraft:spruce_log[axis=z]'); if (u < 7) S(x, 2, z, 'minecraft:spruce_log[axis=z]') }
  }
  ;[0, 3, 6].forEach(u => { S(20, 0, 21 + u, 'minecraft:polished_blackstone_button[face=wall,facing=west]'); S(23, 0, 21 + u, 'minecraft:polished_blackstone_button[face=wall,facing=east]') })
  // bureau x21..29 z2..8
  bgCoque(21, 2, 29, 8, 1, false); bgToitX(20, 30, 2, 8, 6, 'brown_terracotta', [21, 29])
  PORTE(25, 1, 2, BGP, 'north', 'left', 'false'); S(25, 0, 1, 'minecraft:stone_brick_stairs[facing=south,half=bottom,shape=straight]')
  S(22, 1, 3, 'mcwfurnitures:gray_couch[facing=east,shape=single]'); S(22, 1, 4, 'mcwfurnitures:gray_couch[facing=east,shape=single]'); S(24, 1, 6, 'mcwfurnitures:spruce_table'); S(25, 1, 6, 'mcwfurnitures:spruce_table')
  S(24, 1, 7, MAT('spruce_chair', 'north')); S(26, 1, 6, MAT('spruce_chair', 'west')); S(24, 2, 6, 'supplementaries:book_pile'); S(25, 2, 6, 'minecraft:candle[candles=1,lit=false]')
  F(28, 1, 3, 28, 1, 5, MAT('spruce_drawer', 'west')); S(28, 1, 7, 'minecraft:cartography_table'); S(22, 1, 7, 'minecraft:iron_block'); S(23, 1, 7, 'minecraft:bookshelf'); S(25, 5, 5, LH); bgPapiers(22, 3, 28, 7, 1, 5)
  bgFen(22, 23, 2, 2, 'north', 2, 0); bgFen(27, 28, 2, 2, 'north', 2, 1); bgFen(24, 25, 2, 8, 'south', 2, 0); bgFen(5, 5, 2, 21, 'west', 2, 0); bgFen(5, 5, 2, 29, 'east', 2, 2)
  // chaufferie et cheminee
  bgDalle(22, 13, 27, 18, 'minecraft:stone_bricks'); W(21, 12, 28, 19, 0, 7, 'minecraft:bricks'); bgToitX(20, 29, 12, 19, 7, 'gray', [21, 28])
  F(23, 0, 14, 25, 2, 16, 'minecraft:iron_block'); S(23, 0, 15, 'minecraft:blast_furnace[facing=west,lit=false]'); S(22, 1, 14, 'minecraft:lever[face=wall,facing=west,powered=false]'); F(25, 3, 15, 25, 6, 15, 'minecraft:iron_bars')
  F(22, 0, 18, 24, 0, 18, 'minecraft:coal_block'); S(22, 1, 18, 'minecraft:coal_block'); PORTE(21, 0, 17, 'minecraft:iron_door', 'west', 'left', 'false')
  F(26, 0, 15, 27, 20, 16, 'minecraft:bricks'); F(26, 16, 15, 27, 16, 16, 'minecraft:mud_bricks'); F(26, 21, 15, 27, 21, 16, 'minecraft:brick_wall')
  F(18, 4, 15, 21, 4, 15, 'minecraft:iron_bars'); F(28, 3, 14, 28, 4, 14, GP); F(28, 3, 17, 28, 4, 17, GP); F(24, 3, 12, 24, 4, 12, GP)
  F(29, 0, 13, 30, 0, 14, 'minecraft:barrel[facing=up,open=false]'); S(29, 1, 13, 'minecraft:barrel[facing=up,open=false]')
  // cloture et portail
  F(0, 0, 0, 0, 0, 31, BGF); F(31, 0, 0, 31, 0, 31, BGF); F(1, 0, 31, 30, 0, 31, BGF); F(1, 0, 0, 17, 0, 0, BGF); F(21, 0, 0, 30, 0, 0, BGF)
  S(18, 0, 0, 'minecraft:spruce_fence_gate[facing=north,open=true,in_wall=false]'); S(20, 0, 0, 'minecraft:spruce_fence_gate[facing=north,open=true,in_wall=false]')
  bgLierre(12, 21, 1, 5, 'west')
  sapin(1, 27, 9); sapin(30, 10, 8)
  bgVeg(0, 0, 31, 31, 0.35)
}
