
// ================= BOURG FORESTIER ABANDONNE (exemple de ville complete, architecture bois / taiga) =================
// Rangee nord (z0..31, facades au sud) : mairie, salle communale, place, maisons. Rue z32..47. Rangee sud (z48..79, facades au nord).
var BGS = 'minecraft:spruce_planks', BGL = 'minecraft:spruce_log[axis=y]', BGX = 'minecraft:stripped_spruce_log[axis=x]', BGZ = 'minecraft:stripped_spruce_log[axis=z]'
var BGF = 'minecraft:spruce_fence', BGP = 'mcwdoors:spruce_classic_door', BGV = 'mcwdoors:spruce_glass_door', BGT = {}
function bgPierre() { return choix(['minecraft:cobblestone', 'minecraft:stone_bricks', 'minecraft:mossy_cobblestone', 'minecraft:cobblestone', 'minecraft:andesite']) }
function bgSol(x1, z1, x2, z2) { for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) { var r = R(); S(x, -1, z, r < 0.15 ? 'minecraft:podzol' : r < 0.23 ? 'minecraft:coarse_dirt' : r < 0.26 ? 'minecraft:moss_block' : 'minecraft:grass_block'); BGT[x + ',' + z] = 1 } }
function bgDalle(x1, z1, x2, z2, l) { for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) { S(x, -1, z, typeof l == 'string' ? l : choix(l)); delete BGT[x + ',' + z] } }
function bgVeg(x1, z1, x2, z2, d) {
  for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) {
    if (!BGT[x + ',' + z]) continue
    var r = R()
    if (r < d * 0.45) SA(x, 0, z, 'minecraft:short_grass'); else if (r < d * 0.75) SA(x, 0, z, 'minecraft:fern'); else if (r < d * 0.83) SA(x, 0, z, 'minecraft:sweet_berry_bush[age=1]')
    else if (r < d * 0.93) SA(x, 0, z, choix(['minecraft:poppy', 'minecraft:dandelion', 'minecraft:cornflower', 'minecraft:lily_of_the_valley', 'minecraft:oxeye_daisy'])); else if (r < d) SA(x, 0, z, 'minecraft:dead_bush')
  }
}
function bgPapiers(x1, z1, x2, z2, y, n) { for (var i = 0; i < n; i++) SA(x1 + Math.floor(R() * (x2 - x1 + 1)), y, z1 + Math.floor(R() * (z2 - z1 + 1)), choix(['minecraft:white_carpet', 'minecraft:white_carpet', 'supplementaries:book_pile', 'minecraft:light_gray_carpet'])) }
// Coque : plancher, murs (rez en pierre si demande, etages en planches et poteaux), planchers d'etage et bandeaux
function bgCoque(x1, z1, x2, z2, nb, pierre) {
  F(x1, 0, z1, x2, 0, z2, BGS)
  for (var f = 0; f < nb; f++) {
    var y0 = 6 * f, pi = f == 0 && pierre
    for (var y = y0 + 1; y <= y0 + 5; y++) {
      for (var x = x1; x <= x2; x++) { S(x, y, z1, pi ? bgPierre() : BGS); S(x, y, z2, pi ? bgPierre() : BGS) }
      for (var z = z1 + 1; z < z2; z++) { S(x1, y, z, pi ? bgPierre() : BGS); S(x2, y, z, pi ? bgPierre() : BGS) }
    }
    if (pi) [[x1, z1], [x2, z1], [x1, z2], [x2, z2]].forEach(c => F(c[0], y0 + 1, c[1], c[0], y0 + 5, c[1], 'minecraft:stone_bricks'))
    else {
      for (var x = x1; x <= x2; x++) if ((x - x1) % 4 == 0 || x == x2) { F(x, y0 + 1, z1, x, y0 + 5, z1, BGL); F(x, y0 + 1, z2, x, y0 + 5, z2, BGL) }
      for (var z = z1; z <= z2; z++) if ((z - z1) % 4 == 0 || z == z2) { F(x1, y0 + 1, z, x1, y0 + 5, z, BGL); F(x2, y0 + 1, z, x2, y0 + 5, z, BGL) }
    }
    F(x1 + 1, y0 + 6, z1 + 1, x2 - 1, y0 + 6, z2 - 1, BGS); F(x1, y0 + 6, z1, x2, y0 + 6, z1, BGX); F(x1, y0 + 6, z2, x2, y0 + 6, z2, BGX); F(x1, y0 + 6, z1 + 1, x1, y0 + 6, z2 - 1, BGZ); F(x2, y0 + 6, z1 + 1, x2, y0 + 6, z2 - 1, BGZ)
  }
}
// Toits a deux pans : faitage selon x (pans au nord et au sud) ou selon z ; gab = plans de pignon a remplir
function bgFaite(m) { return m == 'gray' ? 'minecraft:deepslate_tile_slab[type=bottom]' : 'minecraft:spruce_slab[type=bottom]' }
function bgToitX(xa, xb, z1, z2, y0, m, gab) {
  for (var k = 0; ; k++) {
    var y = y0 + k, zn = z1 - 1 + k, zs = z2 + 1 - k
    if (zn > zs) break
    if (zn == zs) { F(xa, y, zn, xb, y, zn, bgFaite(m)); break }
    F(xa, y, zs, xb, y, zs, TOIT('north', m)); F(xa, y, zn, xb, y, zn, TOIT('south', m))
    if (k > 0 && zn + 1 <= zs - 1) (gab || []).forEach(g => F(g, y, zn + 1, g, y, zs - 1, BGS))
  }
}
function bgToitZ(za, zb, x1, x2, y0, m, gab) {
  for (var k = 0; ; k++) {
    var y = y0 + k, xw = x1 - 1 + k, xe = x2 + 1 - k
    if (xw > xe) break
    if (xw == xe) { F(xw, y, za, xw, y, zb, bgFaite(m)); break }
    F(xw, y, za, xw, y, zb, TOIT('east', m)); F(xe, y, za, xe, y, zb, TOIT('west', m))
    if (k > 0 && xw + 1 <= xe - 1) (gab || []).forEach(g => F(xw + 1, y, g, xe - 1, y, g, BGS))
  }
}
// Fenetre : a1..a2 le long du mur, c = coordonnee du mur, f = cote exterieur. etat 0 volets ouverts, 1 volets clos, 2 planches clouees, 3 vitre seule
function bgFen(a1, a2, y, c, f, h, etat) {
  var ns = f == 'north' || f == 'south', d = (f == 'south' || f == 'east') ? 1 : -1
  function P(a, yy, o, b) { if (ns) S(a, yy, c + o, b); else S(c + o, yy, a, b) }
  var vo = 'minecraft:spruce_trapdoor[facing=' + f + ',half=bottom,open=true]', g1 = R() > 0.15, g2 = R() > 0.15
  for (var a = a1; a <= a2; a++) for (var k = 0; k < h; k++) {
    P(a, y + k, 0, etat == 2 ? 'minecraft:oak_trapdoor[facing=' + f + ',half=' + (k % 2 ? 'bottom' : 'top') + ',open=false]' : GP)
    if (etat == 1) P(a, y + k, d, vo)
  }
  if (etat == 0) for (var k = 0; k < h; k++) { if (g1) P(a1 - 1, y + k, d, vo); if (g2) P(a2 + 1, y + k, d, vo) }
}
// Lierre accroche a un mur dont la face exterieure est f
function bgLierre(a, c, y1, y2, f) { var ns = f == 'north' || f == 'south', d = (f == 'south' || f == 'east') ? 1 : -1; for (var y = y1; y <= y2; y++) { if (ns) SA(a, y, c + d, 'minecraft:vine[' + OPP[f] + '=true]'); else SA(c + d, y, a, 'minecraft:vine[' + OPP[f] + '=true]') } }
function bgBanc(x, z, f, n) { // assise en marches, dossier du cote f ; n places le long de l'axe perpendiculaire
  var ns = f == 'north' || f == 'south'
  for (var i = 0; i < n; i++) S(ns ? x + i : x, 0, ns ? z : z + i, 'minecraft:spruce_stairs[facing=' + f + ',half=bottom,shape=straight]')
  if (ns) { S(x - 1, 0, z, 'minecraft:spruce_trapdoor[facing=west,half=bottom,open=true]'); S(x + n, 0, z, 'minecraft:spruce_trapdoor[facing=east,half=bottom,open=true]') }
  else { S(x, 0, z - 1, 'minecraft:spruce_trapdoor[facing=north,half=bottom,open=true]'); S(x, 0, z + n, 'minecraft:spruce_trapdoor[facing=south,half=bottom,open=true]') }
}
function bgLampe(x, z) { S(x, 0, z, 'minecraft:stone_brick_wall'); F(x, 1, z, x, 2, z, BGF); S(x, 3, z, 'minecraft:lantern[hanging=false]') }
// Voiture 2 x 4 ; ax = axe de la longueur ; etat 0 intacte, 1 vitres brisees, 2 brulee ; roues = boutons sur les flancs
function bgVoiture(x, z, ax, c, etat, sansRoues) {
  var corps = etat == 2 ? 'minecraft:black_concrete' : 'minecraft:' + c + '_concrete', vit = etat == 2 ? 'minecraft:coal_block' : 'minecraft:tinted_glass', tc = etat == 2 ? 'minecraft:black_carpet' : 'minecraft:' + c + '_carpet'
  function P(u, v, y, b) { if (ax == 'x') S(x + u, y, z + v, b); else S(x + v, y, z + u, b) }
  for (var u = 0; u < 4; u++) for (var v = 0; v < 2; v++) { P(u, v, 0, corps); P(u, v, 1, u == 0 || u == 3 ? tc : (etat == 1 && u == 1 && v == 0 ? 'minecraft:gray_stained_glass' : vit)) }
  if (etat != 2) for (var v = 0; v < 2; v++) { P(1, v, 2, tc); P(2, v, 2, tc) } else P(1, 0, 2, 'minecraft:cobweb')
  if (!sansRoues) { var cs = ax == 'x' ? ['north', 'south'] : ['west', 'east']; [0, 3].forEach(u => { P(u, -1, 0, 'minecraft:polished_blackstone_button[face=wall,facing=' + cs[0] + ']'); P(u, 2, 0, 'minecraft:polished_blackstone_button[face=wall,facing=' + cs[1] + ']') }) }
}

// ================= MAIRIE (2 x 2 chunks, R+1, avant-corps et campanile) =================
function bgMairie() {
  BGT = {}
  var SB = 'minecraft:stone_bricks', BS = 'minecraft:bookshelf', ST = 'minecraft:spruce_stairs', LH = 'minecraft:lantern[hanging=true]', LU = 'mcwlights:iron_chandelier'
  bgSol(0, 0, 31, 31)
  bgDalle(14, 27, 17, 31, ['minecraft:gravel', 'minecraft:gravel', 'minecraft:dirt_path', 'minecraft:cobblestone'])
  // gros oeuvre : corps x4..27 z10..23, avant-corps x12..19 z23..26
  bgCoque(4, 10, 27, 23, 2, true); bgCoque(12, 23, 19, 26, 2, true)
  W(4, 10, 27, 23, 0, 0, SB); F(12, 0, 23, 19, 0, 26, SB)
  F(13, 1, 23, 18, 5, 23, AIR); F(13, 7, 23, 18, 11, 23, AIR)
  F(13, 0, 11, 18, 0, 25, 'minecraft:dark_oak_planks')
  // cloisons
  F(12, 1, 11, 12, 5, 22, SB); F(19, 1, 11, 19, 5, 22, SB); F(20, 1, 17, 26, 5, 17, SB)
  PORTE(12, 1, 21, BGP, 'west', 'left', 'false'); PORTE(19, 1, 22, BGP, 'east', 'left', 'false'); PORTE(23, 1, 17, BGP, 'north', 'left', 'false')
  F(12, 7, 11, 12, 11, 22, BGS); F(19, 7, 11, 19, 11, 22, BGS)
  PORTE(12, 7, 13, BGP, 'west', 'left', 'false'); PORTE(19, 7, 13, BGP, 'east', 'right', 'false')
  // escalier d'honneur
  for (var k = 0; k <= 5; k++) { S(18, 1 + k, 21 - k, ST + '[facing=north,half=bottom,shape=straight]'); if (k > 0) F(18, 1, 21 - k, 18, k, 21 - k, BGS) }
  F(18, 6, 17, 18, 6, 20, AIR); F(17, 7, 17, 17, 7, 20, BGF)
  // toits : ardoise, avant-corps a pignon, campanile
  bgToitX(3, 28, 10, 23, 12, 'gray', [4, 27])
  F(13, 12, 24, 18, 12, 25, BGS)
  bgToitZ(20, 27, 12, 19, 12, 'gray', [26])
  F(14, 13, 15, 16, 22, 17, BGS); ;[[14, 15], [16, 15], [14, 17], [16, 17]].forEach(c => F(c[0], 13, c[1], c[0], 26, c[1], BGL))
  F(14, 23, 15, 16, 23, 17, BGS); S(15, 21, 17, 'supplementaries:clock_block[facing=south]'); S(15, 21, 15, 'supplementaries:clock_block[facing=north]')
  ;[[15, 15], [15, 17], [14, 16], [16, 16]].forEach(c => S(c[0], 24, c[1], BGF))
  F(13, 27, 14, 17, 27, 18, BGS); S(15, 26, 16, 'minecraft:bell[attachment=ceiling,facing=south]')
  F(14, 28, 15, 16, 28, 17, 'minecraft:deepslate_tile_slab[type=bottom]'); S(15, 28, 16, 'minecraft:deepslate_tiles'); S(15, 29, 16, 'minecraft:lightning_rod')
  // fenetres du rez (pierre) et de l'etage (bois, volets)
  ;[[6, 7], [9, 10], [21, 22], [24, 25]].forEach((p, i) => bgFen(p[0], p[1], 2, 23, 'south', 2, i == 2 ? 2 : 3))
  bgFen(13, 14, 2, 4, 'west', 2, 3); bgFen(18, 19, 2, 4, 'west', 2, 3); bgFen(13, 13, 2, 27, 'east', 2, 3); bgFen(20, 21, 2, 27, 'east', 2, 2)
  bgFen(8, 8, 2, 10, 'north', 2, 3); bgFen(15, 16, 2, 10, 'north', 3, 3); bgFen(22, 22, 3, 10, 'north', 2, 3); bgFen(24, 24, 3, 10, 'north', 2, 3)
  bgFen(13, 13, 2, 26, 'south', 2, 3); bgFen(18, 18, 2, 26, 'south', 2, 3); bgFen(25, 25, 2, 12, 'west', 2, 3); bgFen(25, 25, 2, 19, 'east', 2, 3)
  ;[[6, 7], [9, 10], [21, 22], [25, 26]].forEach((p, i) => bgFen(p[0], p[1], 8, 23, 'south', 2, i == 1 ? 1 : 0))
  ;[13, 16, 20].forEach((z, i) => { bgFen(z, z, 8, 4, 'west', 2, i == 2 ? 1 : 0); bgFen(z, z, 8, 27, 'east', 2, 0) })
  bgFen(7, 7, 8, 10, 'north', 2, 0); bgFen(10, 10, 8, 10, 'north', 2, 0); bgFen(14, 15, 8, 10, 'north', 2, 0); bgFen(22, 22, 8, 10, 'north', 2, 1); bgFen(25, 25, 8, 10, 'north', 2, 0)
  bgFen(13, 13, 8, 26, 'south', 2, 0); bgFen(18, 18, 8, 26, 'south', 2, 0); bgFen(25, 25, 8, 12, 'west', 2, 3); bgFen(25, 25, 8, 19, 'east', 2, 3)
  bgFen(16, 17, 14, 4, 'west', 2, 3); bgFen(16, 17, 14, 27, 'east', 2, 3)
  // entree : double porte, imposte, perron, balcon d'honneur
  PORTE(15, 1, 26, BGP, 'south', 'left', 'false'); PORTE(16, 1, 26, BGP, 'south', 'right', 'false'); S(15, 3, 26, GP); S(16, 3, 26, GP); F(15, 4, 26, 16, 4, 26, 'minecraft:chiseled_stone_bricks')
  F(13, 0, 27, 18, 0, 27, 'minecraft:stone_brick_stairs[facing=north,half=bottom,shape=straight]'); S(12, 0, 27, 'minecraft:stone_brick_wall'); S(19, 0, 27, 'minecraft:stone_brick_wall'); S(12, 1, 27, 'minecraft:lantern[hanging=false]'); S(19, 1, 27, 'minecraft:lantern[hanging=false]')
  PORTE(15, 7, 26, BGV, 'south', 'left', 'false'); PORTE(16, 7, 26, BGV, 'south', 'right', 'false')
  F(13, 6, 27, 18, 6, 28, 'minecraft:spruce_slab[type=top]'); F(13, 7, 28, 18, 7, 28, BGF); S(13, 7, 27, BGF); S(18, 7, 27, BGF)
  S(13, 5, 27, ST + '[facing=north,half=top,shape=straight]'); S(18, 5, 27, ST + '[facing=north,half=top,shape=straight]')
  S(13, 10, 27, 'minecraft:white_wall_banner[facing=south]'); S(18, 10, 27, 'minecraft:light_gray_wall_banner[facing=south]')
  // hall : accueil, banquette, tableau d'affichage, sacs de sable
  F(15, 1, 14, 16, 1, 25, 'minecraft:red_carpet'); for (var z = 14; z <= 25; z++) { if (R() < 0.15) S(15, 1, z, AIR); if (R() < 0.15) S(16, 1, z, AIR) }
  F(13, 1, 13, 16, 1, 13, MAT('spruce_counter', 'south')); S(14, 2, 13, 'supplementaries:book_pile'); S(16, 2, 13, 'minecraft:candle[candles=2,lit=false]')
  S(15, 1, 12, 'mcwfurnitures:spruce_table'); S(16, 1, 12, MAT('spruce_chair', 'west')); F(13, 1, 11, 14, 2, 11, BS); F(17, 1, 11, 17, 2, 11, BS)
  S(13, 2, 16, 'supplementaries:notice_board[facing=east]'); S(13, 1, 18, MAT('spruce_chair', 'east')); S(13, 1, 19, MAT('spruce_chair', 'east'))
  S(13, 1, 22, 'minecraft:potted_fern'); S(17, 1, 22, 'minecraft:potted_dead_bush'); S(15, 1, 19, LU); S(16, 5, 21, LU); S(14, 5, 12, LH); S(15, 5, 24, LH)
  F(13, 1, 24, 13, 2, 24, 'supplementaries:sack'); S(18, 1, 24, 'supplementaries:sack'); S(18, 1, 25, 'supplementaries:sack')
  // salle du conseil
  for (var z = 13; z <= 20; z++) { S(8, 1, z, 'mcwfurnitures:spruce_table'); S(7, 1, z, MAT('spruce_chair', 'east')); S(9, 1, z, MAT('spruce_chair', 'west')) }
  S(8, 1, 12, MAT('spruce_chair', 'south')); S(8, 1, 21, MAT('spruce_chair', 'north')); S(9, 1, 17, 'supplementaries:sack'); S(10, 1, 15, MAT('spruce_chair', 'east'))
  S(8, 2, 14, 'minecraft:candle[candles=3,lit=false]'); S(8, 2, 19, 'minecraft:candle[candles=3,lit=false]'); S(8, 2, 17, 'minecraft:white_carpet'); S(8, 2, 16, 'supplementaries:book_pile')
  F(5, 1, 11, 7, 2, 11, BS); F(9, 1, 11, 11, 2, 11, BS); S(5, 3, 16, 'minecraft:blue_wall_banner[facing=east]'); S(5, 3, 21, 'minecraft:red_wall_banner[facing=east]')
  S(6, 1, 22, 'minecraft:lectern[facing=north]'); S(11, 1, 22, 'minecraft:potted_fern'); S(8, 5, 15, LU); S(8, 5, 19, LU)
  // accueil et etat civil
  F(20, 1, 20, 25, 1, 20, MAT('spruce_counter', 'south')); S(21, 2, 20, 'minecraft:iron_bars'); S(23, 2, 20, 'minecraft:iron_bars'); S(25, 2, 20, 'supplementaries:book_pile')
  F(20, 1, 18, 22, 1, 18, MAT('spruce_drawer', 'south')); S(25, 1, 18, 'mcwfurnitures:spruce_table'); S(24, 1, 18, MAT('spruce_chair', 'east')); S(25, 2, 18, 'minecraft:candle[candles=1,lit=false]'); S(26, 1, 18, 'minecraft:barrel[facing=up,open=false]')
  S(23, 1, 22, MAT('spruce_chair', 'north')); S(24, 1, 22, MAT('spruce_chair', 'north')); S(26, 1, 22, 'minecraft:potted_fern'); S(20, 1, 21, 'minecraft:potted_bamboo'); S(23, 5, 19, LH); S(23, 5, 21, LH)
  // archives
  ;[21, 23, 25].forEach(x => F(x, 1, 12, x, 3, 15, BS)); S(20, 1, 11, 'minecraft:chest[facing=east]'); S(26, 1, 16, 'minecraft:barrel[facing=up,open=true]')
  S(22, 1, 13, 'supplementaries:book_pile'); S(24, 1, 16, 'supplementaries:book_pile'); S(22, 5, 13, LH); S(24, 5, 15, LH); S(26, 5, 12, LH)
  // etage : bureau du maire
  F(6, 7, 15, 10, 7, 20, 'minecraft:red_carpet'); for (var x = 7; x <= 9; x++) S(x, 7, 17, 'mcwfurnitures:spruce_table')
  S(8, 7, 18, MAT('spruce_chair', 'north')); S(7, 7, 16, MAT('spruce_chair', 'south')); S(9, 7, 16, MAT('spruce_chair', 'south'))
  S(7, 8, 17, 'minecraft:candle[candles=2,lit=false]'); S(8, 8, 17, 'supplementaries:book_pile'); S(9, 8, 17, 'supplementaries:globe')
  F(5, 7, 11, 6, 9, 11, BS); F(8, 7, 11, 9, 9, 11, BS); F(11, 7, 11, 11, 9, 11, BS); S(11, 7, 12, 'minecraft:chest[facing=west]')
  S(5, 7, 14, 'mcwfurnitures:brown_couch[facing=east,shape=single]'); S(5, 7, 15, 'mcwfurnitures:brown_couch[facing=east,shape=single]')
  S(5, 7, 21, 'minecraft:potted_azalea_bush'); S(11, 7, 21, 'mcwfurnitures:spruce_end_table'); S(11, 8, 21, 'minecraft:candle[candles=1,lit=false]'); S(5, 9, 18, 'minecraft:white_wall_banner[facing=east]'); S(8, 11, 17, LU)
  // etage : palier
  S(13, 7, 12, 'mcwfurnitures:gray_couch[facing=east,shape=single]'); S(13, 7, 14, 'mcwfurnitures:gray_couch[facing=east,shape=single]'); S(17, 7, 11, 'minecraft:chest[facing=south]'); S(13, 7, 11, 'minecraft:potted_fern')
  S(16, 11, 14, LU); S(17, 7, 22, 'minecraft:barrel[facing=up,open=false]'); S(13, 7, 25, 'minecraft:potted_bamboo'); S(18, 7, 25, 'minecraft:potted_fern')
  // etage : secretariat
  ;[[22, 14], [25, 14], [22, 19], [25, 19]].forEach(p => { S(p[0], 7, p[1], 'mcwfurnitures:spruce_table'); S(p[0], 7, p[1] + 1, MAT('spruce_chair', 'north')) })
  F(20, 7, 11, 21, 8, 11, BS); F(26, 7, 11, 26, 7, 12, 'minecraft:barrel[facing=up,open=false]'); F(26, 7, 16, 26, 7, 18, MAT('spruce_drawer', 'west'))
  S(22, 8, 14, 'supplementaries:book_pile'); S(25, 8, 19, 'minecraft:candle[candles=1,lit=false]'); S(22, 11, 16, LH); S(25, 11, 16, LH)
  bgPapiers(13, 11, 18, 22, 1, 5); bgPapiers(5, 11, 11, 22, 1, 4); bgPapiers(20, 18, 26, 22, 1, 4); bgPapiers(20, 11, 26, 22, 7, 5); bgPapiers(5, 11, 11, 22, 7, 3)
  // cour d'honneur : haies, bancs, lampadaires, massifs
  for (var x = 1; x <= 30; x++) if ((x < 12 || x > 19) && R() > 0.12) S(x, 0, 30, 'minecraft:spruce_leaves[persistent=true]')
  bgLampe(12, 29); bgLampe(19, 29); bgBanc(8, 27, 'north', 2); bgBanc(22, 27, 'north', 2)
  bgVeg(5, 24, 11, 26, 0.9); bgVeg(20, 24, 26, 26, 0.9)
  bgLierre(11, 4, 1, 9, 'west'); bgLierre(21, 4, 1, 7, 'west'); bgLierre(11, 27, 1, 10, 'east')
  // arriere : parking, remise des services techniques, bucher
  bgDalle(16, 1, 30, 8, ['minecraft:gravel', 'minecraft:gravel', 'minecraft:coarse_dirt', 'minecraft:andesite'])
  bgVoiture(19, 3, 'z', 'white', 0); bgVoiture(25, 2, 'z', 'green', 1)
  bgDalle(4, 3, 8, 5, 'minecraft:spruce_planks'); W(3, 2, 9, 6, 0, 3, BGS); ;[[3, 2], [9, 2], [3, 6], [9, 6]].forEach(c => F(c[0], 0, c[1], c[0], 3, c[1], BGL))
  F(2, 4, 1, 10, 4, 7, 'minecraft:spruce_slab[type=bottom]'); PORTE(6, 0, 6, BGP, 'south', 'left', 'true'); S(8, 1, 6, GP)
  S(4, 0, 3, 'minecraft:anvil[facing=north]'); S(8, 0, 3, 'minecraft:chest[facing=south]'); S(4, 0, 5, 'minecraft:barrel[facing=up,open=false]'); S(8, 0, 5, 'minecraft:grindstone[face=floor,facing=north]'); S(5, 0, 3, 'minecraft:composter[level=0]'); S(6, 3, 4, LH)
  F(10, 0, 1, 13, 1, 1, 'minecraft:spruce_log[axis=x]'); S(11, 2, 1, 'minecraft:spruce_log[axis=x]')
  // foret
  sapin(0, 8, 9); sapin(30, 13, 9); sapin(1, 20, 8); sapin(30, 25, 7); sapin(15, 3, 8)
  bgVeg(0, 0, 31, 31, 0.3)
}

// ================= SALLE COMMUNALE EN BOIS (2 x 2 chunks, grande salle, estrade, archives, tour de l'horloge-porche, potager) =================
function bgSalleCommunale() {
  BGT = {}
  var DT = 'minecraft:deepslate_tiles', DO = 'minecraft:dark_oak_planks', SB = 'minecraft:stone_bricks', VIT = ['minecraft:glass_pane', 'minecraft:glass_pane', 'minecraft:white_stained_glass_pane', 'minecraft:light_gray_stained_glass_pane']
  bgSol(0, 0, 31, 31)
  // nef x10..20 z6..24 : soubassement de pierre, bardage, poteaux
  F(10, 0, 6, 20, 0, 24, DO)
  for (var y = 1; y <= 9; y++) for (var x = 10; x <= 20; x++) for (var z = 6; z <= 24; z++) {
    if (x != 10 && x != 20 && z != 6 && z != 24) continue
    S(x, y, z, y <= 2 ? bgPierre() : y == 3 ? (x == 10 || x == 20 ? BGZ : BGX) : BGS)
  }
  ;[6, 10, 14, 18, 22, 24].forEach(z => { F(10, 3, z, 10, 9, z, BGL); F(20, 3, z, 20, 9, z, BGL) }); ;[13, 17].forEach(x => { F(x, 3, 6, x, 9, 6, BGL); F(x, 3, 24, x, 9, 24, BGL) })
  F(10, 10, 6, 20, 10, 6, BGX); F(10, 10, 24, 20, 10, 24, BGX); F(10, 10, 7, 10, 10, 23, BGZ); F(20, 10, 7, 20, 10, 23, BGZ)
  ;[10, 14, 18, 22].forEach(z => F(11, 10, z, 19, 10, z, BGX))
  bgToitZ(5, 25, 10, 20, 10, 'gray', [6, 24])
  S(15, 12, 6, 'minecraft:glass_pane'); S(15, 13, 6, 'minecraft:glass_pane')
  ;[8, 12, 16, 20].forEach(z => { var v = choix(VIT); F(10, 4, z, 10, 7, z, z == 16 ? AIR : v); if (z != 12) F(20, 4, z, 20, 7, z, choix(VIT)) })
  for (var k = 0; k < 4; k++) S(10, 4 + k, 16, 'minecraft:oak_trapdoor[facing=west,half=' + (k % 2 ? 'bottom' : 'top') + ',open=false]')
  // trou dans la toiture (pan ouest) et debris
  F(11, 12, 15, 11, 12, 16, AIR); F(12, 13, 15, 12, 13, 16, AIR); S(11, 1, 15, 'minecraft:spruce_leaves[persistent=true]'); S(11, 1, 16, 'minecraft:spruce_leaves[persistent=true]'); S(11, 1, 17, 'minecraft:moss_carpet')
  // estrade : table du conseil, pupitre
  F(11, 1, 7, 19, 1, 8, BGS); F(11, 1, 9, 19, 1, 9, 'minecraft:spruce_stairs[facing=north,half=bottom,shape=straight]')
  F(13, 2, 7, 17, 2, 7, 'mcwfurnitures:spruce_table'); S(14, 2, 8, MAT('dark_oak_chair', 'north')); S(16, 2, 8, MAT('dark_oak_chair', 'north')); S(15, 3, 7, 'minecraft:lantern[hanging=false]')
  S(18, 2, 8, 'minecraft:lectern[facing=south]'); S(12, 2, 8, MAT('dark_oak_chair', 'south')); S(11, 2, 7, 'minecraft:potted_dead_bush'); S(19, 2, 7, 'minecraft:potted_dead_bush')
  // salle des archives x12..18 z2..6, ouverte sur la salle
  F(12, 0, 2, 18, 0, 5, DO); F(13, 1, 3, 17, 1, 6, BGS)
  for (var y = 1; y <= 8; y++) { for (var z = 2; z <= 5; z++) { S(12, y, z, y <= 2 ? bgPierre() : BGS); S(18, y, z, y <= 2 ? bgPierre() : BGS) } for (var x = 13; x <= 17; x++) S(x, y, 2, y <= 2 ? bgPierre() : BGS) }
  F(12, 3, 2, 12, 8, 2, BGL); F(18, 3, 2, 18, 8, 2, BGL); F(12, 9, 2, 18, 9, 2, BGX); F(12, 9, 3, 12, 9, 5, BGZ); F(18, 9, 3, 18, 9, 5, BGZ)
  F(13, 2, 6, 17, 7, 6, AIR)
  bgToitZ(1, 5, 12, 18, 9, 'gray', [2])
  F(13, 2, 3, 13, 4, 3, 'minecraft:bookshelf'); F(17, 2, 3, 17, 4, 3, 'minecraft:bookshelf')
  S(15, 2, 3, 'minecraft:chest[facing=north]'); S(14, 2, 3, 'minecraft:potted_dead_bush'); S(16, 2, 4, 'minecraft:barrel[facing=up,open=false]')
  F(12, 4, 4, 12, 6, 4, 'minecraft:glass_pane'); F(18, 4, 4, 18, 6, 4, 'minecraft:glass_pane'); F(15, 4, 2, 15, 6, 2, 'minecraft:glass_pane')
  // bancs du public, allee, lustres
  F(15, 1, 10, 15, 1, 23, 'minecraft:red_carpet'); for (var z = 10; z <= 23; z++) if (R() < 0.2) S(15, 1, z, AIR)
  ;[11, 13, 15, 17, 19, 21].forEach(z => { F(12, 1, z, 14, 1, z, 'minecraft:spruce_stairs[facing=south,half=bottom,shape=straight]'); F(16, 1, z, 18, 1, z, 'minecraft:spruce_stairs[facing=south,half=bottom,shape=straight]') })
  S(17, 1, 15, AIR); S(18, 1, 15, 'minecraft:spruce_slab[type=bottom]'); S(13, 1, 19, AIR); F(16, 2, 17, 18, 2, 17, BGX)
  S(11, 1, 10, 'mcwfurnitures:spruce_table'); S(11, 2, 10, 'minecraft:lantern[hanging=false]'); S(19, 1, 10, 'mcwfurnitures:spruce_table'); S(19, 2, 10, 'supplementaries:jar')
  S(13, 1, 23, 'minecraft:barrel[facing=up,open=false]'); S(11, 1, 23, 'supplementaries:notice_board[facing=east]'); S(19, 1, 23, 'minecraft:chest[facing=west]')
  ;[10, 14, 18, 22].forEach(z => S(15, 9, z, 'mcwlights:iron_chandelier')); bgPapiers(11, 10, 19, 23, 1, 6)
  // bureau du secretaire x21..25 z9..13
  F(21, 0, 9, 25, 0, 13, DO)
  for (var y = 1; y <= 5; y++) { for (var x = 21; x <= 25; x++) { S(x, y, 9, y <= 2 ? bgPierre() : BGS); S(x, y, 13, y <= 2 ? bgPierre() : BGS) } for (var z = 10; z <= 12; z++) S(25, y, z, y <= 2 ? bgPierre() : BGS) }
  F(21, 6, 9, 25, 6, 9, BGX); F(21, 6, 13, 25, 6, 13, BGX); F(25, 6, 10, 25, 6, 12, BGZ); F(21, 6, 10, 24, 6, 12, BGS)
  bgToitX(21, 26, 9, 13, 6, 'gray', [25])
  PORTE(20, 1, 11, BGP, 'east', 'left', 'false'); PORTE(25, 1, 11, BGP, 'east', 'left', 'false'); S(26, 0, 11, 'minecraft:stone_brick_stairs[facing=west,half=bottom,shape=straight]')
  S(23, 1, 10, 'mcwfurnitures:spruce_wardrobe[facing=south,connection=base,hinge=left]'); S(22, 1, 10, 'minecraft:chest[facing=south]'); S(24, 1, 12, 'mcwfurnitures:spruce_table'); S(23, 1, 12, MAT('spruce_chair', 'east')); S(24, 2, 12, 'minecraft:lantern[hanging=false]'); S(23, 5, 11, 'minecraft:lantern[hanging=true]')
  F(23, 2, 13, 23, 3, 13, GP); F(23, 2, 9, 23, 3, 9, GP)
  // tour de l'horloge-porche x13..17 z24..28
  F(13, 0, 24, 17, 0, 28, DO)
  for (var y = 1; y <= 20; y++) for (var x = 13; x <= 17; x++) for (var z = 24; z <= 28; z++) {
    var bord = x == 13 || x == 17 || z == 24 || z == 28
    if (!bord) { S(x, y, z, y == 6 || y == 12 ? BGS : AIR); continue }
    var coin = (x == 13 || x == 17) && (z == 24 || z == 28)
    S(x, y, z, y <= 4 ? (coin ? SB : bgPierre()) : coin ? BGL : (y == 6 || y == 12) ? (x == 13 || x == 17 ? BGZ : BGX) : BGS)
  }
  F(14, 1, 24, 16, 3, 24, AIR); S(14, 4, 24, 'minecraft:spruce_stairs[facing=east,half=top,shape=straight]'); S(16, 4, 24, 'minecraft:spruce_stairs[facing=west,half=top,shape=straight]'); S(15, 4, 24, AIR)
  F(16, 1, 27, 16, 19, 27, 'minecraft:ladder[facing=west]')
  PORTE(15, 1, 28, BGP, 'south', 'left', 'false'); S(15, 3, 28, 'minecraft:glass_pane'); S(15, 4, 28, 'minecraft:chiseled_stone_bricks')
  F(14, 0, 29, 16, 0, 29, 'minecraft:stone_brick_stairs[facing=north,half=bottom,shape=straight]'); S(13, 0, 29, 'minecraft:stone_brick_wall'); S(17, 0, 29, 'minecraft:stone_brick_wall'); S(13, 1, 29, 'minecraft:lantern[hanging=false]'); S(17, 1, 29, 'minecraft:lantern[hanging=false]')
  F(15, 8, 28, 15, 9, 28, 'minecraft:glass_pane'); S(13, 8, 26, GP); S(17, 8, 26, GP); S(15, 14, 28, 'supplementaries:clock_block[facing=south]')
  ;[[15, 28], [15, 24], [13, 26], [17, 26]].forEach(c => F(c[0], 17, c[1], c[0], 19, c[1], AIR))
  S(15, 20, 26, 'minecraft:lantern[hanging=true]')
  S(14, 7, 25, 'minecraft:note_block'); S(15, 7, 25, MAT('dark_oak_chair', 'south')); S(14, 7, 27, 'minecraft:barrel[facing=up,open=false]'); S(15, 11, 26, 'minecraft:lantern[hanging=true]'); S(15, 5, 26, 'minecraft:lantern[hanging=true]')
  // toit pyramidal
  for (var k = 0; k < 1; k++) {
    var a = 12 + k, b = 18 - k, c1 = 23 + k, d = 29 - k, y0 = 21 + 3 * k
    F(a, y0, c1, b, y0 + 2, d, DT); F(a, y0 + 2, d, b, y0 + 2, d, TOIT('north')); F(a, y0 + 2, c1, b, y0 + 2, c1, TOIT('south')); F(b, y0 + 2, c1 + 1, b, y0 + 2, d - 1, TOIT('west')); F(a, y0 + 2, c1 + 1, a, y0 + 2, d - 1, TOIT('east'))
  }
  F(15, 24, 26, 15, 26, 26, BGF)
  // potager clos : murets, baies, compost
  for (var x = 0; x <= 8; x++) { S(x, 0, 2, 'minecraft:cobblestone_wall'); S(x, 0, 23, 'minecraft:cobblestone_wall') }
  for (var z = 3; z <= 22; z++) { S(0, 0, z, 'minecraft:cobblestone_wall'); if (z != 19 && z != 20) S(8, 0, z, 'minecraft:cobblestone_wall') }
  S(8, 0, 19, 'minecraft:spruce_fence_gate[facing=east,open=true,in_wall=true]'); S(8, 0, 20, 'minecraft:spruce_fence_gate[facing=east,open=false,in_wall=true]')
  for (var gx = 2; gx <= 6; gx += 2) for (var gz = 4; gz <= 19; gz += 3) {
    if (gx == 4 && gz == 13) continue
    bgDalle(gx, gz, gx, gz, 'minecraft:coarse_dirt'); S(gx, 0, gz, 'minecraft:sweet_berry_bush[age=' + (1 + Math.floor(R() * 2)) + ']')
    bgDalle(gx, gz + 1, gx, gz + 2, 'minecraft:coarse_dirt'); if (R() < 0.5) S(gx, 0, gz + 1, 'minecraft:sweet_berry_bush[age=1]')
  }
  S(4, 0, 13, 'minecraft:composter[level=4]'); bgDalle(4, 14, 4, 15, 'minecraft:mossy_cobblestone'); S(4, 1, 15, 'minecraft:potted_dead_bush')
  // jardin : puits, banc, allees
  bgDalle(14, 30, 16, 31, 'minecraft:gravel'); bgDalle(9, 19, 9, 29, ['minecraft:gravel', 'minecraft:dirt_path']); bgDalle(10, 29, 13, 29, ['minecraft:gravel', 'minecraft:dirt_path']); bgDalle(26, 12, 26, 29, ['minecraft:dirt_path', 'minecraft:gravel', 'minecraft:dirt_path'])
  F(26, 0, 19, 28, 0, 21, 'minecraft:cobblestone'); S(27, 0, 20, 'minecraft:water'); F(26, 1, 20, 26, 2, 20, BGF); F(28, 1, 20, 28, 2, 20, BGF); F(26, 3, 20, 28, 3, 20, BGX); S(27, 2, 20, 'minecraft:chain[axis=y]')
  F(26, 4, 19, 28, 4, 21, 'minecraft:spruce_slab[type=bottom]'); bgBanc(28, 25, 'east', 2)
  bgLampe(12, 30); bgLampe(18, 30)
  bgLierre(19, 20, 1, 6, 'east'); bgLierre(22, 10, 1, 8, 'west'); bgLierre(14, 2, 1, 7, 'north')
  sapin(29, 4, 10); sapin(2, 27, 8); sapin(30, 30, 9); sapin(5, 9, 7)
  bgVeg(0, 0, 31, 31, 0.32)
}

// ================= PLACE DU VILLAGE (2 x 2 chunks : fontaine, kiosque, monument, halle, jeux) =================
function bgPlace() {
  BGT = {}
  var SB = 'minecraft:stone_bricks', LH = 'minecraft:lantern[hanging=true]'
  for (var x = 0; x <= 31; x++) for (var z = 0; z <= 31; z++) {
    var r = R(), b = (x == 0 || x == 31 || z == 0 || z == 31) ? SB : r < 0.5 ? 'minecraft:cobblestone' : r < 0.72 ? SB : r < 0.82 ? 'minecraft:mossy_cobblestone' : r < 0.88 ? 'minecraft:andesite' : r < 0.95 ? 'minecraft:coarse_dirt' : 'minecraft:moss_block'
    S(x, -1, z, b); if (/coarse|moss_block/.test(b)) BGT[x + ',' + z] = 1
  }
  for (var i = 0; i <= 31; i++) { if (i < 9 || i > 22) { S(i, -1, 15, 'minecraft:polished_andesite'); S(i, -1, 16, 'minecraft:polished_andesite'); S(15, -1, i, 'minecraft:polished_andesite'); S(16, -1, i, 'minecraft:polished_andesite'); delete BGT[i + ',15']; delete BGT[i + ',16']; delete BGT['15,' + i]; delete BGT['16,' + i] } }
  // fontaine : bassin a l'eau croupie, nenuphars, vasque a deux etages
  for (var x = 8; x <= 23; x++) for (var z = 8; z <= 23; z++) {
    var d = Math.sqrt((x - 15.5) * (x - 15.5) + (z - 15.5) * (z - 15.5)), k = x + ',' + z
    if (d < 4.6) { S(x, -1, z, 'minecraft:water'); delete BGT[k]; if (R() < 0.14) S(x, 0, z, 'minecraft:lily_pad') }
    else if (d < 5.7) { S(x, -1, z, SB); S(x, 0, z, R() < 0.25 ? 'minecraft:mossy_stone_bricks' : SB); delete BGT[k]; if (R() < 0.12) S(x, 1, z, 'minecraft:moss_carpet') }
    else if (d < 6.7) { S(x, -1, z, 'minecraft:polished_andesite'); delete BGT[k] }
  }
  F(15, -1, 15, 16, 1, 16, SB); F(15, 2, 15, 16, 2, 16, 'minecraft:chiseled_stone_bricks'); F(14, 3, 14, 17, 3, 17, 'minecraft:stone_brick_slab[type=bottom]'); F(15, 4, 15, 16, 4, 16, 'minecraft:stone_brick_wall'); F(15, 5, 15, 16, 5, 16, 'minecraft:stone_brick_slab[type=bottom]')
  bgBanc(14, 8, 'north', 4); bgBanc(14, 23, 'south', 4); bgBanc(8, 14, 'west', 4); bgBanc(23, 14, 'east', 4)
  ;[[10, 10], [21, 10], [10, 21], [21, 21]].forEach(p => { bgLampe(p[0], p[1]); delete BGT[p[0] + ',' + p[1]] })
  // kiosque a musique (centre 6,6)
  for (var x = 2; x <= 10; x++) for (var z = 2; z <= 10; z++) {
    var d = Math.sqrt((x - 6) * (x - 6) + (z - 6) * (z - 6))
    if (d <= 3.6) { S(x, 0, z, d > 2.8 ? SB : BGS); delete BGT[x + ',' + z] }
    if (d > 2.6 && d <= 3.6 && !(x == 6 && z == 9)) S(x, 1, z, BGF)
    if (d <= 4.4) S(x, 5, z, d > 3.4 ? 'minecraft:spruce_slab[type=bottom]' : 'minecraft:dark_oak_planks')
    if (d <= 3.4) S(x, 6, z, d > 2.2 ? 'minecraft:spruce_slab[type=bottom]' : 'minecraft:dark_oak_planks')
    if (d <= 2.2) S(x, 7, z, d > 1.2 ? 'minecraft:spruce_slab[type=bottom]' : 'minecraft:dark_oak_planks')
  }
  ;[[3, 5], [3, 7], [9, 5], [9, 7], [5, 3], [7, 3], [5, 9], [7, 9]].forEach(p => F(p[0], 1, p[1], p[0], 4, p[1], BGF))
  S(6, 8, 6, BGF); S(6, 9, 6, 'minecraft:lightning_rod'); S(6, 0, 10, 'minecraft:spruce_stairs[facing=north,half=bottom,shape=straight]')
  S(6, 1, 5, 'minecraft:jukebox'); S(5, 1, 6, MAT('spruce_chair', 'south')); S(7, 1, 6, MAT('spruce_chair', 'south')); S(4, 1, 5, 'minecraft:note_block'); S(8, 1, 5, 'minecraft:lectern[facing=south]'); S(6, 4, 6, LH); S(5, 1, 8, 'minecraft:spruce_leaves[persistent=true]')
  // monument aux morts (centre 25,6)
  F(23, 0, 4, 27, 0, 8, 'minecraft:polished_andesite'); F(24, 1, 5, 26, 1, 7, SB); F(25, 2, 6, 25, 6, 6, SB); S(25, 4, 6, 'minecraft:chiseled_stone_bricks'); S(25, 7, 6, 'minecraft:stone_brick_wall'); S(25, 8, 6, 'minecraft:lantern[hanging=false]')
  S(24, 2, 7, 'minecraft:potted_poppy'); S(26, 2, 7, 'minecraft:candle[candles=3,lit=false]'); S(24, 2, 5, 'minecraft:candle[candles=1,lit=false]'); S(25, 4, 7, 'minecraft:red_wall_banner[facing=south]')
  ;[[22, 3], [25, 3], [28, 3], [22, 6], [28, 6], [22, 9], [25, 9], [28, 9]].forEach(p => S(p[0], 0, p[1], 'minecraft:stone_brick_wall'))
  ;[3, 9].forEach(z => { F(23, 0, z, 24, 0, z, 'minecraft:chain[axis=x]'); F(26, 0, z, 27, 0, z, 'minecraft:chain[axis=x]') }); ;[22, 28].forEach(x => { F(x, 0, 4, x, 0, 5, 'minecraft:chain[axis=z]'); F(x, 0, 7, x, 0, 8, 'minecraft:chain[axis=z]') })
  for (var x = 21; x <= 29; x++) for (var z = 2; z <= 10; z++) delete BGT[x + ',' + z]
  // halle couverte x18..30 z21..29
  bgDalle(18, 21, 30, 29, ['minecraft:stone_bricks', 'minecraft:polished_andesite', 'minecraft:cobblestone'])
  ;[18, 22, 26, 30].forEach(x => [21, 25, 29].forEach(z => F(x, 0, z, x, 5, z, BGL)))
  ;[21, 25, 29].forEach(z => F(18, 6, z, 30, 6, z, BGX)); ;[18, 22, 26, 30].forEach(x => { F(x, 6, 22, x, 6, 24, BGZ); F(x, 6, 26, x, 6, 28, BGZ) })
  bgToitX(17, 31, 21, 29, 6, 'spruce', [])
  var biens = ['farmersdelight:carrot_crate', 'farmersdelight:potato_crate', 'farmersdelight:beetroot_crate', 'minecraft:barrel[facing=up,open=false]', 'minecraft:hay_block[axis=y]', 'minecraft:pumpkin', 'minecraft:melon', 'supplementaries:sack', 'minecraft:decorated_pot', 'minecraft:air']
  ;[23, 27].forEach(z => [[19, 21], [23, 25], [27, 29]].forEach(p => { F(p[0], 0, z, p[1], 0, z, MAT('spruce_counter', 'north')); for (var x = p[0]; x <= p[1]; x++) if (R() < 0.6) S(x, 1, z, choix(biens)) }))
  ;[20, 24, 28].forEach(x => S(x, 5, 25, LH)); S(25, 0, 26, 'supplementaries:sack'); S(21, 0, 28, 'minecraft:barrel[facing=east,open=true]'); S(29, 0, 22, 'minecraft:composter[level=0]')
  // aire de jeux x1..12 z19..31
  F(0, 0, 19, 12, 0, 19, BGF); F(12, 0, 20, 12, 0, 31, BGF); S(6, 0, 19, AIR); S(12, 0, 25, AIR)
  for (var x = 1; x <= 11; x++) for (var z = 20; z <= 31; z++) { var b = choix(['minecraft:coarse_dirt', 'minecraft:gravel', 'minecraft:coarse_dirt']); bgDalle(x, z, x, z, b); if (b == 'minecraft:coarse_dirt' && R() < 0.6) BGT[x + ',' + z] = 1 }
  F(2, 0, 21, 2, 2, 21, BGS); F(1, 0, 21, 1, 2, 21, 'minecraft:ladder[facing=west]'); S(2, 3, 21, 'minecraft:spruce_slab[type=bottom]')
  S(3, 2, 21, 'minecraft:smooth_quartz_stairs[facing=west,half=bottom,shape=straight]'); S(4, 1, 21, 'minecraft:smooth_quartz_stairs[facing=west,half=bottom,shape=straight]'); S(5, 0, 21, 'minecraft:smooth_quartz_stairs[facing=west,half=bottom,shape=straight]'); F(3, 0, 21, 3, 1, 21, BGF); S(4, 0, 21, BGF)
  F(6, 0, 25, 6, 3, 25, BGF); F(10, 0, 25, 10, 3, 25, BGF); F(6, 4, 25, 10, 4, 25, BGX); F(7, 2, 25, 7, 3, 25, 'minecraft:chain[axis=y]'); S(7, 1, 25, 'minecraft:spruce_slab[type=top]'); S(9, 3, 25, 'minecraft:chain[axis=y]')
  for (var x = 2; x <= 6; x++) for (var z = 26; z <= 30; z++) { if (x == 2 || x == 6 || z == 26 || z == 30) S(x, 0, z, 'minecraft:spruce_slab[type=bottom]'); else bgDalle(x, z, x, z, 'minecraft:sand') }
  bgBanc(9, 30, 'south', 2); S(11, 0, 22, 'minecraft:cauldron')
  // ombrages et vegetation
  sapin(2, 14, 9); sapin(13, 2, 8); sapin(29, 14, 10); sapin(14, 28, 7)
  for (var i = 0; i < 26; i++) SA(Math.floor(R() * 32), 0, Math.floor(R() * 32), choix(['minecraft:spruce_leaves[persistent=true]', 'minecraft:white_carpet', 'minecraft:moss_carpet', 'minecraft:spruce_leaves[persistent=true]']))
  bgVeg(0, 0, 31, 31, 0.55)
}

// ================= RUE PRINCIPALE (z32..47) : chaussee, trottoirs, voitures, abribus, barrage =================
function bgRue() {
  OX = VB.X0; OY = VB.Y0; OZ = VB.Z0; CUT = 999; GRAINE = 707; BGT = {}
  for (var x = -16; x <= 143; x++) {
    for (var z = 32; z <= 47; z++) {
      var r = R(), b
      if (z <= 34 || z >= 45) b = (z == 34 || z == 45) ? 'minecraft:smooth_stone' : r < 0.6 ? 'minecraft:stone_bricks' : r < 0.75 ? 'minecraft:cracked_stone_bricks' : r < 0.85 ? 'minecraft:mossy_stone_bricks' : r < 0.95 ? 'minecraft:polished_andesite' : 'minecraft:coarse_dirt'
      else b = z == 40 && x % 4 < 2 && r > 0.2 ? 'minecraft:white_concrete' : r < 0.82 ? 'minecraft:gray_concrete' : r < 0.88 ? 'minecraft:andesite' : r < 0.92 ? 'minecraft:cobblestone' : r < 0.97 ? 'minecraft:coarse_dirt' : 'minecraft:gravel'
      if (x >= 54 && x <= 61 && z >= 35 && z <= 44) b = x % 2 ? 'minecraft:gray_concrete' : 'minecraft:white_concrete'
      S(x, -1, z, b); if (b == 'minecraft:coarse_dirt') BGT[x + ',' + z] = 1
    }
  }
  ;[[20, 38], [71, 42], [118, 37]].forEach(p => { S(p[0], -1, p[1], 'minecraft:water'); delete BGT[p[0] + ',' + p[1]] })
  // reverberes (bras vers la chaussee)
  function rev(x, z, f, eteint) { var d = { north: -1, south: 1 }[f]; S(x, 0, z, 'minecraft:stone_brick_wall'); F(x, 1, z, x, 4, z, BGF); S(x, 4, z + d, BGF); if (!eteint) S(x, 3, z + d, 'minecraft:lantern[hanging=true]') }
  ;[6, 38, 70, 102, 134].forEach((x, i) => rev(x, 33, 'south', i == 2)); ;[22, 54, 86, 118].forEach((x, i) => rev(x, 46, 'north', i == 3))
  // vehicules abandonnes
  bgVoiture(9, 36, 'x', 'red', 0); bgVoiture(26, 42, 'x', 'blue', 1); bgVoiture(64, 37, 'x', 'white', 2); bgVoiture(79, 36, 'x', 'green', 0); bgVoiture(96, 41, 'x', 'black', 2); bgVoiture(108, 36, 'x', 'light_gray', 1); bgVoiture(130, 42, 'x', 'brown', 0)
  // car de ramassage scolaire devant l'ecole
  for (var u = 0; u <= 8; u++) for (var v = 0; v <= 1; v++) { S(36 + u, 0, 42 + v, 'minecraft:yellow_concrete'); S(36 + u, 1, 42 + v, u == 0 || u == 8 ? 'minecraft:yellow_concrete' : (u == 4 && v == 1 ? 'minecraft:gray_stained_glass' : 'minecraft:light_gray_stained_glass')); S(36 + u, 2, 42 + v, 'minecraft:yellow_concrete') }
  F(36, 3, 42, 44, 3, 43, 'minecraft:yellow_carpet'); ;[1, 7].forEach(u => { S(36 + u, 0, 41, 'minecraft:polished_blackstone_button[face=wall,facing=north]'); S(36 + u, 0, 44, 'minecraft:polished_blackstone_button[face=wall,facing=south]') })
  // abribus devant l'ecole
  F(57, 0, 47, 61, 2, 47, GP); F(56, 0, 46, 56, 2, 47, 'minecraft:iron_bars'); F(62, 0, 46, 62, 2, 47, 'minecraft:iron_bars'); F(56, 3, 46, 62, 3, 47, 'minecraft:smooth_stone_slab[type=bottom]')
  for (var x = 58; x <= 60; x++) S(x, 0, 46, 'minecraft:spruce_stairs[facing=south,half=bottom,shape=straight]')
  // arbre tombe en travers de la chaussee (ouest)
  F(1, 0, 39, 11, 0, 39, 'minecraft:spruce_log[axis=x]'); S(12, 0, 39, 'minecraft:rooted_dirt')
  for (var x = -3; x <= 1; x++) for (var z = 37; z <= 41; z++) for (var y = 0; y <= 1; y++) if (Math.abs(z - 39) + Math.abs(x + 1) + y < 4 && R() < 0.85) SA(x, y, z, 'minecraft:spruce_leaves[persistent=true]')
  // barrage d'evacuation (est) : sacs de sable, barrieres, cones
  F(124, 0, 35, 124, 0, 39, 'supplementaries:sack'); F(124, 1, 35, 124, 1, 37, 'supplementaries:sack'); F(125, 0, 41, 125, 0, 44, BGF); S(123, 0, 40, 'minecraft:orange_terracotta'); S(123, 0, 43, 'minecraft:orange_terracotta')
  S(125, 1, 41, 'minecraft:lantern[hanging=false]')
  // mobilier : poubelles, sacs, papiers, feuilles
  ;[[17, 33], [49, 33], [89, 33], [31, 46], [73, 46], [113, 46]].forEach(p => S(p[0], 0, p[1], choix(['minecraft:composter[level=0]', 'minecraft:cauldron', 'minecraft:barrel[facing=up,open=false]'])))
  for (var i = 0; i < 60; i++) SA(-10 + Math.floor(R() * 148), 0, 32 + Math.floor(R() * 16), choix(['minecraft:white_carpet', 'minecraft:spruce_leaves[persistent=true]', 'minecraft:moss_carpet', 'supplementaries:sack', 'minecraft:spruce_leaves[persistent=true]']))
  bgVeg(-16, 32, 143, 47, 0.8)
}
