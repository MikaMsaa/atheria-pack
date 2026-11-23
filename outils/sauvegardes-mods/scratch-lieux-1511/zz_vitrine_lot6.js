
// ================= GRAND IMMEUBLE HAUSSMANNIEN D'ANGLE (2 x 2 chunks, R+5 + combles, dome d'angle) =================
// Rue au sud (z29), facade laterale a l'est (x31), cour interieure au nord-ouest.
// Une piece est decrite dans un repere local : u le long de la facade, v depuis la fenetre (v=0) vers le mur interieur.
// Orientations locales : {W} vers la fenetre, {I} vers le couloir, {P} vers +u, {M} vers -u. Porte de la piece en (L-1, D).
var CCW = { south: 'east', east: 'north', north: 'west', west: 'south' }
function cadre(x1, z1, x2, z2, fac, y, h) {
  var c = { fac: fac, y: y, h: h || 5 }, pu = CCW[fac]
  var T = { '{W}': fac, '{I}': OPP[fac], '{P}': pu, '{M}': OPP[pu] }
  if (fac == 'south') { c.L = x2 - x1 + 1; c.D = z2 - z1 + 1; c.pos = (u, v) => [x1 + u, z2 - v] }
  else if (fac == 'north') { c.L = x2 - x1 + 1; c.D = z2 - z1 + 1; c.pos = (u, v) => [x2 - u, z1 + v] }
  else if (fac == 'east') { c.L = z2 - z1 + 1; c.D = x2 - x1 + 1; c.pos = (u, v) => [x2 - v, z2 - u] }
  else { c.L = z2 - z1 + 1; c.D = x2 - x1 + 1; c.pos = (u, v) => [x1 + v, z1 + u] }
  c.f = b => ('' + b).replace(/\{[WIPM]\}/g, k => T[k])
  c.S = (u, v, dy, b) => { var p = c.pos(u, v); S(p[0], y + dy, p[1], c.f(b)) }
  c.porte = (id) => { var p = c.pos(c.L - 1, c.D); PORTE(p[0], y + 1, p[1], id, OPP[fac], 'left', 'false') }
  return c
}
function piece(c, type, etat) {
  var L = c.L, D = c.D, w = choix(BOIS), H = c.h
  for (var u = 0; u < L; u++) for (var v = 0; v < D; v++) c.S(u, v, 0, type == 'sdb' ? ((u + v) % 2 ? 'minecraft:smooth_quartz' : 'minecraft:polished_diorite') : type == 'cuisine' ? ((u + v) % 2 ? 'minecraft:polished_deepslate' : 'minecraft:smooth_quartz') : type == 'grenier' ? 'minecraft:spruce_planks' : ((u + v) % 4 < 2 ? 'minecraft:oak_planks' : 'minecraft:spruce_planks'))
  if (type == 'salon') {
    var c0 = Math.floor((L - 2) / 2), cp = choix(CANAPES), tapis = choix(['red', 'brown', 'blue', 'green', 'gray'])
    for (var u = c0 - 2; u <= c0 + 2; u++) for (var v = 1; v <= 3; v++) c.S(u, v, 1, 'minecraft:' + tapis + '_carpet')
    c.S(c0 - 1, D - 1, 1, 'minecraft:quartz_pillar'); c.S(c0 + 1, D - 1, 1, 'minecraft:quartz_pillar'); c.S(c0, D - 1, 1, 'minecraft:campfire[lit=' + (etat ? 'false' : 'true') + ',facing={W}]')
    for (var u = c0 - 1; u <= c0 + 1; u++) c.S(u, D - 1, 2, 'minecraft:quartz_slab[type=top]')
    c.S(c0 - 1, D - 1, 3, 'minecraft:candle[candles=3,lit=false]'); c.S(c0 + 1, D - 1, 3, 'minecraft:candle[candles=2,lit=false]'); c.S(c0, D - 1, 3, 'minecraft:decorated_pot')
    for (var u = 0; u <= L - 2; u++) if (u < c0 - 1 || u > c0 + 1) { c.S(u, D - 1, 1, 'minecraft:bookshelf'); c.S(u, D - 1, 2, 'minecraft:bookshelf') }
    for (var u = c0 - 1; u <= c0 + 1; u++) c.S(u, 1, 1, 'mcwfurnitures:' + cp + '_couch[facing={I},shape=single]')
    c.S(c0, 2, 1, 'mcwfurnitures:' + w + '_coffee_table'); c.S(c0, 2, 2, 'supplementaries:book_pile')
    c.S(c0 - 2, 2, 1, MAT(w + '_chair', '{P}')); c.S(c0 + 2, 2, 1, MAT(w + '_chair', '{M}'))
    c.S(0, 0, 1, 'minecraft:potted_fern'); c.S(L - 1, 0, 1, choix(['minecraft:potted_azalea_bush', 'minecraft:potted_bamboo', 'minecraft:decorated_pot']))
    c.S(c0, 2, H, 'mcwlights:iron_chandelier')
  } else if (type == 'salle') {
    var c0 = Math.floor((L - 1) / 2)
    for (var u = c0 - 1; u <= c0 + 1; u++) { c.S(u, 2, 1, 'mcwfurnitures:' + w + '_table'); c.S(u, 1, 1, MAT(w + '_chair', '{I}')); c.S(u, 3, 1, MAT(w + '_chair', '{W}')) }
    c.S(c0 - 2, 2, 1, MAT(w + '_chair', '{P}')); c.S(c0 + 2, 2, 1, MAT(w + '_chair', '{M}'))
    c.S(c0, 2, 2, 'minecraft:candle[candles=4,lit=false]'); c.S(c0 - 1, 2, 2, 'minecraft:potted_white_tulip'); c.S(c0 + 1, 2, 2, etat ? 'minecraft:air' : 'supplementaries:jar')
    for (var u = c0 - 1; u <= c0 + 1; u++) c.S(u, D - 1, 1, MAT(w + '_drawer', '{W}'))
    c.S(c0 - 1, D - 1, 2, 'minecraft:candle[candles=2,lit=false]'); c.S(c0 + 1, D - 1, 2, 'minecraft:decorated_pot')
    c.S(0, 0, 1, 'minecraft:potted_fern'); c.S(L - 1, 0, 1, 'minecraft:potted_azalea_bush'); c.S(0, D - 1, 1, 'minecraft:bookshelf')
    c.S(c0, 2, H, 'mcwlights:iron_chandelier')
  } else if (type == 'chambre') {
    var c0 = Math.floor((L - 2) / 2), col = choix(COULS)
    c.S(c0, D - 2, 1, 'minecraft:' + col + '_bed[facing={I},part=foot]'); c.S(c0, D - 1, 1, 'minecraft:' + col + '_bed[facing={I},part=head]')
    if (c0 >= 1) { c.S(c0 - 1, D - 1, 1, 'mcwfurnitures:' + w + '_end_table'); c.S(c0 - 1, D - 1, 2, 'minecraft:candle[candles=1,lit=false]') }
    if (c0 + 1 <= L - 2) { c.S(c0 + 1, D - 1, 1, 'mcwfurnitures:' + w + '_end_table'); c.S(c0 + 1, D - 1, 2, choix(['minecraft:candle[candles=2,lit=false]', 'supplementaries:book_pile', 'minecraft:potted_white_tulip'])) }
    if (c0 >= 2) c.S(c0 - 2, D - 1, 1, 'mcwfurnitures:' + w + '_wardrobe[facing={W},connection=base,hinge=left]')
    if (D >= 3) c.S(c0, D - 3, 1, 'minecraft:' + col + '_carpet')
    if (c0 >= 1 && D >= 4) c.S(0, 0, 1, 'minecraft:chest[facing={P}]')
    c.S(L - 1, 0, 1, choix(['minecraft:potted_fern', 'minecraft:potted_poppy', 'minecraft:barrel[facing=up,open=false]']))
    if (L >= 6 && D >= 4) { c.S(L - 2, 0, 1, MAT(w + '_drawer', '{I}')); c.S(L - 2, 0, 2, 'minecraft:candle[candles=1,lit=false]') }
    c.S(c0, Math.max(0, D - 3), H, 'minecraft:lantern[hanging=true]')
  } else if (type == 'cuisine') {
    for (var u = 0; u <= L - 2; u++) {
      c.S(u, D - 1, 1, u == 1 ? 'mcwfurnitures:' + w + '_kitchen_sink[facing={W},water=false]' : u == 2 ? 'farmersdelight:stove[facing={W},lit=false]' : MAT(w + '_counter', '{W}'))
      if (u != 2) c.S(u, D - 1, 3, 'mcwfurnitures:' + w + '_kitchen_cabinet[facing={W},hinge=' + (u % 2 ? 'right' : 'left') + ']')
    }
    c.S(0, D - 1, 2, 'farmersdelight:cutting_board[facing={W}]'); c.S(2, D - 1, 2, 'farmersdelight:cooking_pot'); if (L >= 5) c.S(3, D - 1, 2, 'supplementaries:jar')
    var c0 = Math.floor((L - 1) / 2), vt = D >= 4 ? 1 : 0
    c.S(c0, vt, 1, 'mcwfurnitures:' + w + '_table'); c.S(c0 - 1, vt, 1, MAT(w + '_chair', '{P}')); c.S(c0 + 1, vt, 1, MAT(w + '_chair', '{M}')); c.S(c0, vt, 2, 'minecraft:potted_red_tulip')
    c.S(c0, 1, H, 'minecraft:lantern[hanging=true]')
  } else if (type == 'sdb') {
    c.S(0, D - 1, 1, 'minecraft:water_cauldron[level=3]'); c.S(1, D - 1, 1, 'minecraft:water_cauldron[level=' + (etat ? 1 : 3) + ']')
    c.S(3, D - 1, 1, 'mcwfurnitures:' + w + '_kitchen_sink[facing={W},water=false]')
    c.S(L - 2, 0, 1, 'minecraft:quartz_stairs[facing={W},half=bottom,shape=straight]'); c.S(0, 0, 1, 'minecraft:potted_bamboo'); c.S(2, 0, 1, 'minecraft:white_carpet')
    c.S(1, 1, H, 'minecraft:end_rod[facing=down]')
  } else if (type == 'bureau') {
    for (var u = 0; u <= L - 2; u++) for (var dy = 1; dy <= 3; dy++) c.S(u, D - 1, dy, 'minecraft:bookshelf')
    var c0 = Math.floor((L - 1) / 2)
    for (var u = c0 - 1; u <= c0 + 1; u++) c.S(u, 2, 1, 'minecraft:brown_carpet')
    c.S(c0, 1, 1, 'mcwfurnitures:' + w + '_table'); c.S(c0, 2, 1, MAT(w + '_chair', '{W}')); c.S(c0, 1, 2, 'supplementaries:book_pile')
    c.S(0, 0, 1, 'supplementaries:globe'); c.S(L - 1, 0, 1, 'minecraft:potted_fern'); c.S(c0 + 1, 1, 1, 'minecraft:lectern[facing={I}]')
    c.S(c0, 2, H, 'mcwlights:iron_chandelier')
  } else if (type == 'grenier') {
    for (var u = 0; u <= L - 2; u++) if (R() < 0.65) c.S(u, D - 1, 1, choix(['supplementaries:sack', 'minecraft:barrel[facing=up,open=false]', 'minecraft:chest[facing={W}]', 'minecraft:decorated_pot', 'minecraft:spruce_planks']))
    c.S(1, 0, H, 'minecraft:lantern[hanging=true]')
  }
  if (etat == 1) { c.S(Math.floor(R() * (L - 1)), 0, 1, 'supplementaries:sack'); c.S(Math.floor(R() * (L - 1)), 0, 1, 'minecraft:white_carpet') }
}

function hauss() {
  var ST = 'minecraft:smooth_sandstone', CS = 'minecraft:cut_sandstone', CH = 'minecraft:chiseled_sandstone', WT = 'minecraft:white_terracotta'
  var ARD = 'mcwroofs:gray_roof_block', RAIL = 'mcwfences:ornate_metal_fence', SLt = 'minecraft:smooth_sandstone_slab[type=top]', SLb = 'minecraft:smooth_sandstone_slab[type=bottom]'
  var PB = 'mcwdoors:spruce_classic_door', NB = 6
  function SST(f, h) { return 'minecraft:smooth_sandstone_stairs[facing=' + f + ',half=' + h + ',shape=straight]' }
  var sB = [2, 5, 9, 12, 17, 20, 25, 28], eB = [2, 5, 9, 12, 16, 19, 26]
  // ---- sol, trottoir, cour ----
  F(0, -1, 0, 31, -1, 31, 'minecraft:grass_block'); F(0, -1, 30, 31, -1, 31, 'minecraft:smooth_stone')
  for (var x = 0; x <= 31; x += 4) S(x, -1, 31, 'minecraft:polished_andesite')
  F(1, -1, 1, 18, -1, 16, 'minecraft:stone_bricks')
  for (var x = 1; x <= 18; x++) for (var z = 1; z <= 16; z++) { var r = R(); if (r < 0.12) S(x, -1, z, 'minecraft:mossy_stone_bricks'); else if (r < 0.2) S(x, -1, z, 'minecraft:cobblestone'); else if (r < 0.24) S(x, -1, z, 'minecraft:cracked_stone_bricks') }
  // ---- gros oeuvre : facades, pignons, planchers ----
  F(0, 0, 17, 31, 0, 29, 'minecraft:polished_andesite'); F(19, 0, 0, 31, 0, 16, 'minecraft:polished_andesite')
  F(0, 1, 29, 31, 35, 29, ST); F(31, 1, 0, 31, 35, 29, ST); F(0, 1, 17, 18, 35, 17, ST); F(19, 1, 0, 19, 35, 16, ST); F(0, 1, 18, 0, 35, 28, ST); F(20, 1, 0, 30, 35, 0, ST)
  for (var y = 1; y <= 5; y += 2) { F(0, y, 29, 31, y, 29, CS); F(31, y, 0, 31, y, 29, CS) }
  for (var y = 7; y <= 35; y++) if (y % 2 == 0) { S(0, y, 29, CS); S(31, y, 29, CS); S(31, y, 0, CS) }
  for (var f = 1; f < NB; f++) { var y = 6 * f; F(1, y, 18, 30, y, 28, 'minecraft:spruce_planks'); F(20, y, 1, 30, y, 17, 'minecraft:spruce_planks'); F(0, y, 29, 31, y, 29, CS); F(31, y, 0, 31, y, 29, CS) }
  F(0, 36, 17, 31, 36, 29, CS); F(19, 36, 0, 31, 36, 16, CS); F(1, 36, 18, 30, 36, 28, 'minecraft:spruce_planks'); F(20, 36, 1, 30, 36, 17, 'minecraft:spruce_planks')
  // ---- etages : baies sur rue, balcons, fenetres sur cour ----
  for (var f = 1; f < NB; f++) {
    var y = 6 * f, filant = f == 2 || f == 5
    sB.forEach(x => {
      F(x, y + 1, 29, x, y + 3, 29, GP); S(x, y + 4, 29, CH); S(x - 1, y + 4, 29, CS); S(x + 1, y + 4, 29, CS)
      if (filant) S(x, y - 1, 30, SST('north', 'top'))
      else { S(x, y, 30, SLt); S(x, y + 1, 30, RAIL); S(x, y - 1, 30, SST('north', 'top')) }
      if (f == 1) { S(x - 1, y + 5, 29, CS); S(x + 1, y + 5, 29, CS); S(x, y + 5, 30, SLb) }
    })
    if (filant) { F(0, y, 30, 31, y, 30, SLt); F(0, y + 1, 30, 31, y + 1, 30, RAIL) }
    eB.forEach(z => { S(31, y + 1, z, RAIL); F(31, y + 2, z, 31, y + 3, z, GP); S(31, y + 4, z, CH); S(31, y + 4, z - 1, CS); S(31, y + 4, z + 1, CS) })
    F(31, y + 2, 22, 31, y + 3, 22, GP); F(24, y + 2, 0, 24, y + 3, 0, GP)
    ;[3, 9, 15].forEach(x => { S(x, y + 1, 17, CS); F(x, y + 2, 17, x, y + 3, 17, GP) })
    ;[3, 11].forEach(z => { S(19, y + 1, z, CS); F(19, y + 2, z, 19, y + 3, z, GP) })
  }
  // ---- etages : cloisons, couloirs, pieces ----
  for (var f = 1; f < NB; f++) {
    var y = 6 * f, etat = R() < 0.3 ? 1 : 0
    F(1, y + 1, 23, 30, y + 5, 23, WT); F(1, y + 1, 21, 23, y + 5, 21, WT); F(25, y + 1, 21, 30, y + 5, 21, WT); F(23, y + 1, 1, 23, y + 5, 20, WT); F(25, y + 1, 1, 25, y + 5, 20, WT)
    ;[7, 15, 23].forEach(x => F(x, y + 1, 24, x, y + 5, 28, WT)); ;[6, 12].forEach(x => F(x, y + 1, 18, x, y + 5, 20, WT))
    F(26, y + 1, 7, 30, y + 5, 7, WT); F(26, y + 1, 14, 30, y + 5, 14, WT); F(20, y + 1, 7, 22, y + 5, 7, WT)
    for (var x = 1; x <= 30; x++) S(x, y, 22, (x % 4 < 2) ? 'minecraft:oak_planks' : 'minecraft:spruce_planks')
    F(2, y + 1, 22, 29, y + 1, 22, 'minecraft:red_carpet'); F(24, y + 1, 2, 24, y + 1, 21, 'minecraft:red_carpet')
    ;[4, 10, 16, 28].forEach(x => S(x, y + 5, 22, 'minecraft:lantern[hanging=true]')); ;[4, 10, 16].forEach(z => S(24, y + 5, z, 'minecraft:lantern[hanging=true]'))
    var rs = [[1, 6, choix(['chambre', 'bureau', 'salon'])], [8, 14, choix(['salle', 'salon'])], [16, 22, choix(['salon', 'chambre', 'salle'])], [24, 30, choix(['salon', 'salle', 'bureau'])]]
    rs.forEach(r => { var c = cadre(r[0], 24, r[1], 28, 'south', y); piece(c, r[2], etat); c.porte(PB) })
    var cr = ['cuisine', 'sdb', 'chambre']; if (R() < 0.5) cr = ['chambre', 'cuisine', 'sdb']
    ;[[1, 5], [7, 11], [13, 18]].forEach((r, i) => { var c = cadre(r[0], 18, r[1], 20, 'north', y); piece(c, cr[i], etat); c.porte(PB) })
    ;[[1, 6], [8, 13], [15, 20]].forEach(r => { var c = cadre(26, r[0], 30, r[1], 'east', y); piece(c, choix(['salon', 'chambre', 'bureau', 'chambre']), etat); c.porte(PB) })
    var ce = R() < 0.5 ? ['cuisine', 'sdb'] : ['sdb', 'cuisine']
    ;[[1, 6], [8, 14]].forEach((r, i) => { var c = cadre(20, r[0], 22, r[1], 'west', y); piece(c, ce[i], etat); c.porte(PB) })
    PORTE(20, y + 1, 21, PB, 'north', 'left', 'false')
  }
  // ---- combles : chambres de bonne et greniers ----
  var Y = 36
  F(1, Y + 1, 23, 29, Y + 4, 23, WT); F(1, Y + 1, 21, 23, Y + 4, 21, WT); F(25, Y + 1, 21, 29, Y + 4, 21, WT); F(23, Y + 1, 1, 23, Y + 4, 20, WT); F(25, Y + 1, 1, 25, Y + 4, 20, WT)
  ;[7, 15, 23].forEach(x => F(x, Y + 1, 24, x, Y + 4, 27, WT)); ;[6, 12].forEach(x => F(x, Y + 1, 19, x, Y + 4, 20, WT)); F(26, Y + 1, 7, 29, Y + 4, 7, WT); F(26, Y + 1, 14, 29, Y + 4, 14, WT); F(21, Y + 1, 7, 22, Y + 4, 7, WT)
  F(2, Y + 1, 22, 29, Y + 1, 22, 'minecraft:brown_carpet'); ;[4, 12, 20, 28].forEach(x => S(x, Y + 4, 22, 'minecraft:lantern[hanging=true]')); ;[5, 13].forEach(z => S(24, Y + 4, z, 'minecraft:lantern[hanging=true]'))
  ;[[1, 6], [8, 14], [16, 22], [24, 29]].forEach(r => { var c = cadre(r[0], 24, r[1], 27, 'south', Y, 4); piece(c, 'chambre', R() < 0.4 ? 1 : 0); c.porte(PB) })
  ;[[1, 6], [8, 13], [15, 20]].forEach(r => { var c = cadre(26, r[0], 29, r[1], 'east', Y, 4); piece(c, 'chambre', R() < 0.4 ? 1 : 0); c.porte(PB) })
  ;[[1, 5], [7, 11], [13, 18]].forEach(r => { var c = cadre(r[0], 19, r[1], 20, 'north', Y, 4); piece(c, 'grenier', 0); c.porte(PB) })
  ;[[1, 6], [8, 14]].forEach(r => { var c = cadre(21, r[0], 22, r[1], 'west', Y, 4); piece(c, 'grenier', 0); c.porte(PB) })
  PORTE(20, Y + 1, 21, PB, 'north', 'left', 'false')
  // ---- toit mansarde : brisis en ardoise, lucarnes a fronton, terrasson, souches ----
  F(1, 37, 28, 30, 40, 28, ARD); F(30, 37, 1, 30, 40, 27, ARD); F(1, 37, 18, 19, 40, 18, ARD); F(20, 37, 1, 20, 40, 17, ARD)
  F(0, 37, 17, 0, 41, 29, ST); F(20, 37, 0, 31, 41, 0, ST)
  F(1, 41, 19, 29, 41, 27, 'mcwroofs:gray_roof_slab[type=bottom]'); F(21, 41, 1, 29, 41, 18, 'mcwroofs:gray_roof_slab[type=bottom]')
  F(1, 41, 28, 30, 41, 28, TOIT('north')); F(30, 41, 1, 30, 41, 27, TOIT('west')); F(1, 41, 18, 19, 41, 18, TOIT('south')); F(20, 41, 1, 20, 41, 17, TOIT('east'))
  F(0, 35, 30, 31, 35, 30, SST('north', 'top')); F(0, 36, 30, 31, 36, 30, SLb)
  sB.forEach(x => { F(x, 37, 28, x, 38, 28, AIR); F(x, 37, 29, x, 38, 29, GP); F(x - 1, 37, 29, x - 1, 38, 29, CS); F(x + 1, 37, 29, x + 1, 38, 29, CS); S(x - 1, 39, 29, SST('east', 'bottom')); S(x + 1, 39, 29, SST('west', 'bottom')); S(x, 39, 29, CH); S(x, 40, 29, SLb) })
  eB.forEach(z => { F(30, 37, z, 30, 38, z, AIR); F(31, 37, z, 31, 38, z, GP); F(31, 37, z - 1, 31, 38, z - 1, CS); F(31, 37, z + 1, 31, 38, z + 1, CS); S(31, 39, z - 1, SST('south', 'bottom')); S(31, 39, z + 1, SST('north', 'bottom')); S(31, 39, z, CH); S(31, 40, z, SLb) })
  ;[3, 9, 15].forEach(x => S(x, 38, 18, GP)); ;[3, 11].forEach(z => S(20, 38, z, GP))
  ;[7, 15].forEach(x => { F(x, 42, 21, x, 44, 23, 'minecraft:bricks'); S(x, 45, 21, 'minecraft:decorated_pot'); S(x, 45, 23, 'minecraft:decorated_pot'); S(x, 45, 22, 'minecraft:flower_pot') })
  ;[7, 14].forEach(z => { F(23, 42, z, 25, 44, z, 'minecraft:bricks'); S(23, 45, z, 'minecraft:decorated_pot'); S(25, 45, z, 'minecraft:decorated_pot') })
  // dome d'angle en ardoise et paratonnerre
  for (var k = 0; k < 4; k++) {
    var y = 42 + k, a = 24 + k, b = 30 - k, c1 = 22 + k, d = 28 - k
    if (a == b) { S(a, y, c1, ARD); break }
    F(a, y, c1, b, y, d, ARD); F(a, y, d, b, y, d, TOIT('north')); F(a, y, c1, b, y, c1, TOIT('south')); F(b, y, c1 + 1, b, y, d - 1, TOIT('west')); F(a, y, c1 + 1, a, y, d - 1, TOIT('east'))
  }
  S(27, 46, 25, 'minecraft:lightning_rod'); S(27, 42, 28, 'minecraft:glass'); S(30, 42, 25, 'minecraft:glass')
  // ---- cage d'escalier ----
  tour(20, 16, NB, ST); F(19, 1, 17, 19, 35, 18, ST); F(22, 1, 17, 22, 35, 18, ST); F(20, 1, 15, 21, 35, 15, ST)
  // ---- RDC : porte cochere et passage ----
  F(16, 0, 17, 18, 0, 29, 'minecraft:stone_bricks'); F(15, 1, 18, 15, 5, 28, ST); F(19, 1, 21, 19, 5, 28, ST)
  F(16, 1, 29, 18, 4, 29, AIR); PORTE(16, 1, 29, 'minecraft:dark_oak_door', 'south', 'left', 'true'); PORTE(18, 1, 29, 'minecraft:dark_oak_door', 'south', 'right', 'true')
  F(16, 3, 29, 18, 3, 29, 'minecraft:iron_bars'); S(17, 4, 29, 'minecraft:iron_bars'); S(16, 4, 29, SST('west', 'top')); S(18, 4, 29, SST('east', 'top')); S(17, 5, 29, CH)
  F(16, 1, 17, 18, 3, 17, AIR); S(16, 4, 17, SST('west', 'top')); S(18, 4, 17, SST('east', 'top')); S(17, 4, 17, 'minecraft:iron_bars'); S(17, 5, 17, CH)
  F(16, 2, 21, 16, 3, 23, 'minecraft:iron_trapdoor[facing=east,half=bottom,open=true]'); S(17, 5, 20, 'minecraft:lantern[hanging=true]'); S(17, 5, 26, 'minecraft:lantern[hanging=true]'); S(18, 1, 26, 'minecraft:potted_fern')
  PORTE(19, 1, 20, PB, 'west', 'left', 'false')
  // ---- RDC : cafe-brasserie ----
  for (var x = 1; x <= 14; x++) for (var z = 18; z <= 28; z++) S(x, 0, z, (x + z) % 2 ? 'minecraft:polished_blackstone' : 'minecraft:smooth_quartz')
  F(1, 1, 29, 14, 5, 29, AIR); F(1, 1, 29, 14, 1, 29, 'minecraft:dark_oak_planks'); F(1, 2, 29, 14, 4, 29, GP); F(1, 5, 29, 14, 5, 29, 'minecraft:dark_oak_planks'); ;[4, 11].forEach(x => F(x, 2, 29, x, 4, 29, 'minecraft:dark_oak_fence'))
  PORTE(7, 1, 29, 'mcwdoors:dark_oak_glass_door', 'north', 'left', 'false'); PORTE(8, 1, 29, 'mcwdoors:dark_oak_glass_door', 'north', 'right', 'false')
  F(1, 5, 30, 14, 5, 30, 'supplementaries:awning_red[facing=south]')
  F(2, 1, 20, 9, 1, 20, MAT('stripped_dark_oak_counter', 'south')); S(3, 2, 20, 'supplementaries:jar'); S(5, 2, 20, 'minecraft:candle[candles=3,lit=false]'); S(8, 2, 20, 'minecraft:brewing_stand')
  F(2, 1, 18, 9, 1, 18, MAT('stripped_dark_oak_counter', 'south')); for (var x = 2; x <= 9; x += 2) S(x, 2, 18, 'supplementaries:jar'); F(2, 3, 18, 9, 3, 18, 'mcwfurnitures:spruce_glass_kitchen_cabinet[facing=south]')
  ;[3, 5, 7, 9].forEach(x => S(x, 1, 21, 'mcwfurnitures:stripped_oak_stool_chair'))
  ;[[3, 23], [3, 26], [11, 23], [11, 26], [7, 23]].forEach(t => { S(t[0], 1, t[1], 'mcwfurnitures:dark_oak_table'); S(t[0] - 1, 1, t[1], MAT('dark_oak_chair', 'east')); S(t[0] + 1, 1, t[1], MAT('dark_oak_chair', 'west')); S(t[0], 2, t[1], 'minecraft:candle[candles=1,lit=false]') })
  ;[[4, 22], [10, 22], [7, 26]].forEach(c => S(c[0], 5, c[1], 'mcwlights:iron_chandelier')); S(14, 1, 19, 'minecraft:jukebox'); S(1, 1, 28, 'minecraft:potted_bamboo'); S(14, 1, 28, 'minecraft:potted_fern'); S(1, 1, 18, 'minecraft:barrel[facing=up,open=false]')
  PORTE(13, 1, 17, 'mcwdoors:dark_oak_classic_door', 'north', 'left', 'false'); ;[3, 9].forEach(x => F(x, 2, 17, x, 3, 17, GP))
  ;[3, 12].forEach(x => { S(x, 0, 31, 'mcwfurnitures:dark_oak_table'); S(x - 1, 0, 31, MAT('dark_oak_chair', 'east')); S(x + 1, 0, 31, MAT('dark_oak_chair', 'west')); S(x, 1, 31, 'minecraft:candle[candles=1,lit=false]') })
  // ---- RDC : pharmacie d'angle ----
  for (var x = 20; x <= 30; x++) for (var z = 22; z <= 28; z++) S(x, 0, z, (x + z) % 2 ? 'minecraft:smooth_quartz' : 'minecraft:polished_deepslate')
  F(19, 1, 21, 30, 5, 21, ST)
  F(20, 1, 29, 30, 5, 29, AIR); F(20, 1, 29, 30, 1, 29, 'minecraft:green_terracotta'); F(20, 2, 29, 30, 4, 29, GP); F(20, 5, 29, 30, 5, 29, 'minecraft:green_terracotta'); ;[22, 27].forEach(x => F(x, 2, 29, x, 4, 29, 'minecraft:dark_oak_fence'))
  PORTE(24, 1, 29, 'mcwdoors:dark_oak_glass_door', 'north', 'left', 'false'); PORTE(25, 1, 29, 'mcwdoors:dark_oak_glass_door', 'north', 'right', 'false')
  F(31, 2, 23, 31, 4, 27, GP); S(31, 1, 25, 'minecraft:green_terracotta')
  ;[[30, 4], [30, 3], [30, 5], [29, 4], [31, 4]].forEach(c => S(c[0], c[1], 30, 'minecraft:lime_stained_glass'))
  F(21, 1, 25, 28, 1, 25, MAT('stripped_spruce_counter', 'south')); S(22, 2, 25, 'minecraft:brewing_stand'); S(24, 2, 25, 'supplementaries:jar'); S(26, 2, 25, 'supplementaries:book_pile')
  for (var x = 20; x <= 30; x++) if (x != 27) { S(x, 1, 22, 'mcwfurnitures:spruce_double_drawer[facing=south,connection=single]'); S(x, 3, 22, 'mcwfurnitures:spruce_glass_kitchen_cabinet[facing=south]'); if (x % 2 == 0) S(x, 2, 22, 'supplementaries:jar') }
  F(20, 1, 27, 22, 1, 27, 'mcwfurnitures:spruce_bookshelf[facing=south,connection=base]'); F(28, 1, 27, 30, 1, 27, 'mcwfurnitures:spruce_bookshelf[facing=south,connection=base]')
  ;[[22, 24], [28, 24], [25, 27]].forEach(c => S(c[0], 5, c[1], 'mcwlights:tavern_lantern[hanging=true]')); S(29, 1, 26, 'minecraft:white_carpet'); S(23, 1, 28, 'minecraft:potted_cactus')
  PORTE(27, 1, 21, PB, 'north', 'left', 'false')
  // ---- RDC : reserve et remise sur cour ----
  F(20, 1, 14, 30, 5, 14, ST); F(23, 0, 15, 30, 0, 20, 'minecraft:stone')
  F(30, 1, 15, 30, 2, 20, 'minecraft:barrel[facing=up,open=false]'); S(26, 1, 15, 'minecraft:chest[facing=south]'); S(27, 1, 15, 'minecraft:chest[facing=south]'); F(23, 1, 15, 24, 1, 16, 'supplementaries:sack'); S(26, 5, 18, 'minecraft:lantern[hanging=true]')
  ;[17].forEach(z => F(31, 3, z, 31, 4, z, GP)); ;[3, 9].forEach(z => F(31, 3, z, 31, 4, z, GP))
  for (var x = 20; x <= 30; x++) for (var z = 1; z <= 13; z++) S(x, 0, z, R() < 0.15 ? 'minecraft:coarse_dirt' : 'minecraft:stone')
  F(19, 1, 6, 19, 3, 6, AIR); PORTE(19, 1, 5, 'minecraft:spruce_door', 'west', 'left', 'true'); PORTE(19, 1, 7, 'minecraft:spruce_door', 'west', 'right', 'true'); S(19, 3, 5, CS); S(19, 3, 7, CS)
  F(25, 1, 3, 26, 1, 6, 'minecraft:red_concrete'); F(25, 2, 4, 26, 2, 5, 'minecraft:tinted_glass'); ;[[25, 3], [26, 3], [25, 6], [26, 6]].forEach(c => S(c[0], 2, c[1], 'minecraft:smooth_stone_slab[type=bottom]'))
  S(30, 1, 3, 'minecraft:crafting_table'); S(30, 1, 5, 'minecraft:anvil[facing=north]'); S(30, 1, 7, 'minecraft:grindstone[face=floor,facing=north]'); F(30, 1, 9, 30, 1, 12, 'minecraft:barrel[facing=up,open=false]'); S(29, 1, 12, 'minecraft:chest[facing=west]')
  F(21, 1, 11, 22, 2, 12, 'minecraft:spruce_log[axis=z]'); S(27, 5, 10, 'minecraft:chain[axis=y]'); S(27, 4, 10, 'minecraft:lantern[hanging=true]'); S(22, 5, 4, 'minecraft:lantern[hanging=true]')
  // ---- cour : platane, bancs, massif, poubelles, vigne vierge ----
  F(0, 0, 0, 0, 4, 16, 'minecraft:bricks'); F(1, 0, 0, 18, 4, 0, 'minecraft:bricks'); F(0, 5, 0, 0, 5, 16, 'minecraft:stone_brick_slab[type=bottom]'); F(1, 5, 0, 18, 5, 0, 'minecraft:stone_brick_slab[type=bottom]')
  for (var z = 1; z <= 15; z++) if (R() < 0.6) { var hv = 1 + Math.floor(R() * 4); F(1, 5 - hv, z, 1, 4, z, 'minecraft:vine[west=true]') }
  F(1, -1, 6, 2, -1, 12, 'minecraft:grass_block'); for (var z = 6; z <= 12; z++) S(2, 0, z, choix(['minecraft:poppy', 'minecraft:oxeye_daisy', 'minecraft:azure_bluet', 'minecraft:cornflower', 'minecraft:short_grass']))
  S(9, -1, 8, 'minecraft:coarse_dirt'); F(9, 0, 8, 9, 6, 8, 'minecraft:oak_log[axis=y]')
  for (var dx = -3; dx <= 3; dx++) for (var dz = -3; dz <= 3; dz++) for (var y = 5; y <= 9; y++) { var dd = Math.abs(dx) + Math.abs(dz) + Math.abs(y - 7); if (dd < 4.5 && (Math.abs(dx) + Math.abs(dz) <= 3 || R() < 0.85)) SA(9 + dx, y, 8 + dz, 'minecraft:oak_leaves[persistent=true]') }
  S(6, 0, 8, MAT('oak_chair', 'east')); S(6, 0, 9, MAT('oak_chair', 'east')); S(12, 0, 8, MAT('oak_chair', 'west')); S(12, 0, 7, MAT('oak_chair', 'west'))
  S(2, 0, 1, 'minecraft:green_shulker_box'); S(3, 0, 1, 'minecraft:green_shulker_box'); S(4, 0, 1, 'minecraft:gray_shulker_box'); S(16, 0, 15, 'mcwlights:garden_light'); S(14, -1, 3, 'minecraft:spruce_trapdoor[facing=north,half=top,open=false]'); S(5, 0, 15, 'supplementaries:sack')
  // ---- trottoir : platane d'alignement, reverbere ----
  S(21, -1, 31, 'minecraft:podzol'); F(21, 0, 31, 21, 4, 31, 'minecraft:oak_log[axis=y]')
  for (var dx = -2; dx <= 2; dx++) for (var dz = -1; dz <= 0; dz++) for (var y = 4; y <= 7; y++) if (Math.abs(dx) + Math.abs(y - 5.5) < 3 && (Math.abs(dx) <= 1 || R() < 0.8)) SA(21 + dx, y, 31 + dz, 'minecraft:oak_leaves[persistent=true]')
  F(15, 0, 31, 15, 3, 31, 'minecraft:dark_oak_fence'); S(15, 4, 31, 'minecraft:lantern'); S(18, 0, 31, 'minecraft:cauldron')
}
