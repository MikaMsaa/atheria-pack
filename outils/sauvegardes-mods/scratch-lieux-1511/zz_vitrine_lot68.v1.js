// ================= RUE DE MAMOUDZOU AU JOUR 1 (lot68, 14/11) : lieu 2 du trailer =================
// Fiche : rue droite de 60 blocs ou plus, 9 a 13 de large, ruelle de 3 a 4 qui y debouche, 4 blocs libres le long d'un trottoir (berline), ~30 figurants.
// Ici : rue nord-sud de 96 blocs ; facades a x37 (ouest) et x49 (est) = 11 blocs entre facades (trottoirs 2 + chaussee 7 + trottoirs 2).
// Ruelle de 4 blocs cote est (z42..45) qui file vers l'arriere-cour (bangas en tole, bananiers, manguier). Jour 1 : tout est intact et habite.
// Style mahorais : beton peint (couleurs passees), rez-de-chaussee commercants a auvent, grilles aux fenetres, balcons a garde-corps,
// toits-terrasses avec poteaux en attente (fers a beton), cuves d'eau noires, climatiseurs, poteaux electriques en beton et fils.
var RM_PEINT = [
  ['minecraft:white_concrete', 'minecraft:cyan_concrete'], ['minecraft:yellow_terracotta', 'minecraft:white_concrete'], ['minecraft:light_blue_terracotta', 'minecraft:white_concrete'],
  ['minecraft:pink_terracotta', 'minecraft:white_concrete'], ['minecraft:lime_terracotta', 'minecraft:white_concrete'], ['minecraft:white_terracotta', 'minecraft:brown_concrete'],
  ['minecraft:orange_terracotta', 'minecraft:white_concrete'], ['minecraft:light_gray_concrete', 'minecraft:red_concrete'], ['minecraft:white_concrete', 'minecraft:green_concrete']]
var RM_TOILE = ['red', 'blue', 'green', 'yellow', 'orange', 'cyan', 'white', 'lime']
var RM_CAISSES = ['farmersdelight:tomato_crate', 'farmersdelight:potato_crate', 'farmersdelight:carrot_crate', 'farmersdelight:cabbage_crate', 'farmersdelight:onion_crate', 'farmersdelight:beetroot_crate']
var RM_OPP = { east: 'west', west: 'east', north: 'south', south: 'north' }

// immeuble mahorais. s = -1 rangee ouest (facade a xf, profondeur vers -x), +1 rangee est. z1..z1+w-1, profondeur D, n niveaux (R+n-1).
// type du rez-de-chaussee : 'vitrine' (boutique vitree), 'ouvert' (etal ouvert, marchandises), 'maison' (porte + fenetres a grille)
function rmBat(s, xf, z1, w, D, n, pal, type, opts) {
  opts = opts || {}
  var fr = s < 0 ? 'east' : 'west', dos = RM_OPP[fr], z2 = z1 + w - 1, P = pal[0], A = pal[1]
  function X(d) { return xf + s * d }                     // d = 0 facade, d > 0 vers l'interieur, d < 0 vers la rue
  function B(d, y, z, b) { S(X(d), y, z, b) }
  function BF(d1, y1, za, d2, y2, zb, b) { F(Math.min(X(d1), X(d2)), y1, za, Math.max(X(d1), X(d2)), y2, zb, b) }
  var yR = 4 + 3 * (n - 1)
  // gros oeuvre : murs peints, soubassement gris, nez de dalle blancs en facade, dalles pleines
  for (var d = 0; d < D; d++) for (var z = z1; z <= z2; z++) for (var y = 0; y < yR; y++) {
    if (!(d == 0 || d == D - 1 || z == z1 || z == z2)) continue
    var dalle = y == 4 || (y > 4 && (y - 4) % 3 == 0)
    B(d, y, z, y == 0 ? 'minecraft:light_gray_concrete' : dalle && d == 0 ? 'minecraft:white_concrete' : P)
  }
  BF(1, 0, z1 + 1, D - 2, yR - 1, z2 - 1, AIR); BF(0, -1, z1, D - 1, -1, z2, 'minecraft:smooth_stone')
  for (var k = 1; k < n; k++) BF(1, 4 + 3 * (k - 1), z1 + 1, D - 2, 4 + 3 * (k - 1), z2 - 1, 'minecraft:smooth_stone')
  BF(0, yR, z1, D - 1, yR, z2, 'minecraft:smooth_stone')
  // trames de fenetres sur facade et arriere, une travee sur 4 ; grilles (fers forges) ou vitrage selon l'etage
  var trav = []; for (var z = z1 + 2; z + 1 <= z2 - 1; z += 4) trav.push(z)
  for (var k = 1; k < n; k++) {
    var yb = 5 + 3 * (k - 1), grille = (k + z1) % 2 == 0, balcon = opts.balcons && k == 1 + (z1 % (n > 2 ? 2 : 1))
    trav.forEach((z, i) => {
      var porteB = balcon && i == Math.floor(trav.length / 2)
      if (porteB) { B(0, yb, z, AIR); B(0, yb + 1, z, AIR); PORTE(X(0), yb, z, 'mcwdoors:spruce_glass_door', fr, 'left', 'false'); B(0, yb, z + 1, 'minecraft:glass_pane'); B(0, yb + 1, z + 1, 'minecraft:glass_pane') }
      else for (var y = yb; y <= yb + 1; y++) { B(0, y, z, grille ? 'minecraft:iron_bars' : 'minecraft:glass_pane'); B(0, y, z + 1, grille ? 'minecraft:iron_bars' : 'minecraft:glass_pane') }
      // derriere une grille, un rideau clair (vitre opaque) ; appui saillant ; climatiseur une fenetre sur deux
      if (grille && !porteB) { B(1, yb, z, 'minecraft:white_stained_glass_pane'); B(1, yb, z + 1, 'minecraft:white_stained_glass_pane'); B(1, yb + 1, z, 'minecraft:white_stained_glass_pane'); B(1, yb + 1, z + 1, 'minecraft:white_stained_glass_pane') }
      B(-1, yb - 1, z, 'minecraft:smooth_stone_slab[type=top,waterlogged=false]'); B(-1, yb - 1, z + 1, 'minecraft:smooth_stone_slab[type=top,waterlogged=false]')
      if (!porteB && (i + k) % 2 == 0 && z + 2 <= z2 - 1) B(-1, yb + 1, z + 2, 'create:encased_fan[facing=' + fr + ']')
      // arriere : petites fenetres a grille
      B(D - 1, yb + 1, z, 'minecraft:iron_bars'); B(D - 1, yb + 1, z + 1, 'minecraft:iron_bars')
    })
    if (balcon) { BF(-1, yb - 1, z1 + 1, -1, yb - 1, z2 - 1, 'minecraft:smooth_stone_slab[type=top,waterlogged=false]'); BF(-1, yb, z1 + 1, -1, yb, z2 - 1, 'mcwfences:ornate_metal_fence'); B(-1, yb, z1 + 1, 'minecraft:light_gray_concrete'); B(-1, yb, z2 - 1, 'minecraft:light_gray_concrete') }
    // fenetres sur les pignons libres (ruelle, bout de rangee)
    ;(opts.pignons || []).forEach(zp => { for (var d = 3; d + 1 <= D - 3; d += 4) { B(d, yb + 1, zp, 'minecraft:iron_bars'); B(d + 1, yb + 1, zp, 'minecraft:iron_bars') } })
  }
  // rez-de-chaussee
  var a = z1 + 1, b = z2 - 1, zm = Math.floor((z1 + z2) / 2)
  if (type == 'vitrine') {
    BF(0, 1, a, 0, 2, b, 'minecraft:glass_pane'); B(0, 0, zm, AIR); B(0, 1, zm, AIR); PORTE(X(0), 0, zm, 'mcwdoors:dark_oak_glass_door', fr, 'left', 'false')
    for (var z = a; z <= b; z++) if (z != zm) B(0, 0, z, A)
    for (var z = a; z <= b; z += 2) if (z != zm) S(X(1), 0, z, MAT('oak_counter', fr))
    BF(D - 3, 0, a, D - 3, 2, b, 'handcrafted:oak_shelf[facing=' + fr + ']')
    for (var z = a; z <= b; z++) if (R() < 0.6) SA(X(D - 3), 3, z, R() < 0.5 ? 'supplementaries:jar' : 'handcrafted:terracotta_wide_pot')
  } else if (type == 'ouvert') {
    BF(0, 0, a, 0, 2, b, AIR)
    // etal : cagettes en rang sur des treteaux, sacs de riz, comptoir au fond
    for (var z = a; z <= b; z++) { S(X(1), 0, z, 'minecraft:spruce_slab[type=top,waterlogged=false]'); if (z % 2 == 0 || z == a) S(X(2), 0, z, choix(RM_CAISSES)) }
    for (var z = a; z <= b; z++) SA(X(1), 1, z, z % 3 == 0 ? 'farmersdelight:rice_bag' : choix(RM_CAISSES))
    BF(D - 3, 0, a + 1, D - 3, 0, b - 1, 'handcrafted:oak_counter[facing=' + fr + ']'); SA(X(D - 3), 1, a + 1, 'supplementaries:jar')
  } else {
    // maison : porte metallique, deux fenetres a grille, marche
    B(0, 0, zm, AIR); B(0, 1, zm, AIR); PORTE(X(0), 0, zm, 'mcwdoors:metal_door', fr, 'left', 'false')
    ;[zm - 3, zm + 2].forEach(z => { if (z >= a && z + 1 <= b) { B(0, 1, z, 'minecraft:iron_bars'); B(0, 2, z, 'minecraft:iron_bars'); B(0, 1, z + 1, 'minecraft:iron_bars'); B(0, 2, z + 1, 'minecraft:iron_bars') } })
  }
  // bandeau d'enseigne vierge et auvent de toile ; climatiseur au-dessus de l'auvent
  if (type != 'maison') { BF(0, 3, a, 0, 3, b, A); BF(-1, 3, a, -1, 3, b, 'supplementaries:awning_' + choix(RM_TOILE) + '[facing=' + fr + ']') }
  // porte et compteur a l'arriere
  B(D - 1, 0, z1 + 2, AIR); B(D - 1, 1, z1 + 2, AIR); PORTE(X(D - 1), 0, z1 + 2, 'mcwdoors:metal_door', dos, 'left', 'false')
  // toit-terrasse : acrotere bas en dalles, poteaux en attente (fers), cuve noire, antenne, linge sur fil
  for (var d = 0; d < D; d++) for (var z = z1; z <= z2; z++) if (d == 0 || d == D - 1 || z == z1 || z == z2) B(d, yR + 1, z, 'minecraft:smooth_stone_slab[type=bottom,waterlogged=false]')
  if (opts.attente) {
    for (var d = 0; d < D; d += Math.max(3, D - 1)) for (var z = z1; z <= z2; z += Math.max(3, w - 1)) { B(d, yR + 1, z, P); B(d, yR + 2, z, 'minecraft:iron_bars'); B(d, yR + 3, z, 'minecraft:iron_bars') }
  }
  var dc = D - 3, zc = z2 - 2
  BF(dc - 1, yR + 1, zc - 1, dc, yR + 2, zc, 'minecraft:black_concrete'); BF(dc - 1, yR + 3, zc - 1, dc, yR + 3, zc, 'minecraft:black_carpet')
  B(dc - 2, yR + 1, zc, 'create:fluid_pipe'); B(dc - 3, yR + 1, zc, 'create:fluid_pipe')
  B(2, yR + 1, z1 + 2, 'minecraft:iron_bars'); B(2, yR + 2, z1 + 2, 'minecraft:iron_bars'); B(2, yR + 3, z1 + 2, 'minecraft:lightning_rod[facing=up,powered=false,waterlogged=false]')
  if (opts.linge) { var z0 = z1 + 2, zz = z2 - 3; B(3, yR + 1, z0, 'minecraft:spruce_fence'); B(3, yR + 2, z0, 'minecraft:spruce_fence'); B(3, yR + 1, zz, 'minecraft:spruce_fence'); B(3, yR + 2, zz, 'minecraft:spruce_fence'); for (var z = z0 + 1; z < zz; z++) { B(3, yR + 2, z, 'minecraft:chain[axis=z,waterlogged=false]'); if (z % 2 == 0) B(3, yR + 1, z, 'minecraft:' + choix(['white', 'yellow', 'red', 'light_blue', 'orange']) + '_wool') } }
}

// banga : case en tole et parpaings de l'arriere-cour, toit a une pente en toles
function rmBanga(x1, z1, x2, z2, porteZ) {
  W(x1, z1, x2, z2, 0, 0, 'minecraft:light_gray_concrete'); W(x1, z1, x2, z2, 1, 2, 'createdeco:iron_sheet_metal'); F(x1 + 1, 0, z1 + 1, x2 - 1, 2, z2 - 1, AIR)
  F(x1 - 1, 3, z1 - 1, x2 + 1, 3, z2 + 1, 'createdeco:zinc_sheet_metal'); F(x1, -1, z1, x2, -1, z2, 'minecraft:packed_mud')
  S(x1, 0, porteZ, AIR); S(x1, 1, porteZ, AIR); S(x1 - 1, 2, porteZ, 'minecraft:white_wool')
  S(x1, 1, porteZ + 2, 'minecraft:iron_bars'); S(x1 + 1, 0, z2 - 1, 'minecraft:barrel[facing=up,open=false]')
}
// bananier : stipe vert, grandes feuilles en croix (feuilles de jungle), regime
function rmBananier(x, z, h) {
  F(x, 0, z, x, h, z, 'minecraft:jungle_log[axis=y]')
  ;[[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(o => { S(x + o[0], h, z + o[1], 'minecraft:jungle_leaves[distance=1,persistent=true,waterlogged=false]'); S(x + 2 * o[0], h - 1, z + 2 * o[1], 'minecraft:jungle_leaves[distance=2,persistent=true,waterlogged=false]'); S(x + o[0], h + 1, z + o[1], 'minecraft:jungle_leaves[distance=1,persistent=true,waterlogged=false]') })
  S(x, h + 1, z, 'minecraft:jungle_leaves[distance=1,persistent=true,waterlogged=false]'); S(x + 1, h - 1, z, 'minecraft:cocoa[age=2,facing=west]')
}
// manguier : tronc court, houppier large et dense
function rmManguier(x, z) {
  F(x, 0, z, x, 4, z, 'minecraft:jungle_log[axis=y]'); S(x + 1, 3, z, 'minecraft:jungle_log[axis=x]'); S(x - 1, 4, z, 'minecraft:jungle_log[axis=x]')
  for (var dx = -4; dx <= 4; dx++) for (var dz = -4; dz <= 4; dz++) for (var dy = 4; dy <= 8; dy++) { var r = dx * dx + dz * dz + (dy - 6) * (dy - 6) * 2.2; if (r <= 18 + lbBruit(x + dx, z + dz, 2) * 3 && R() < 0.95) SA(x + dx, dy, z + dz, 'minecraft:jungle_leaves[distance=1,persistent=true,waterlogged=false]') }
}
// poteau electrique en beton, traverse, isolateurs
function rmPoteau(x, z, f) {
  F(x, 0, z, x, 8, z, 'minecraft:stone_brick_wall'); S(x, 9, z, 'minecraft:smooth_stone_slab[type=bottom,waterlogged=false]')
  var o = f == 'x' ? [1, 0] : [0, 1]; S(x + o[0], 8, z + o[1], 'minecraft:iron_bars'); S(x - o[0], 8, z - o[1], 'minecraft:iron_bars')
}

function rmRue() {
  var N = 95
  // sol : chaussee x40..46, caniveaux, trottoirs a bordure x38..39 / x47..48
  for (var x = 0; x <= 100; x++) for (var z = 0; z <= N; z++) {
    var b
    if (x >= 41 && x <= 45) { var n = lbBruit(Math.floor(x / 3), Math.floor(z / 3), 5.1), m = lbBruit(x, z, 7.7); b = m > 1.6 ? 'minecraft:cyan_terracotta' : n > 1.05 ? 'minecraft:black_concrete' : n < -1.25 ? 'minecraft:light_gray_concrete' : 'minecraft:gray_concrete' }
    else if (x == 40 || x == 46) b = 'minecraft:stone'
    else if (x >= 38 && x <= 48) b = 'minecraft:smooth_stone'
    else b = R() < 0.6 ? 'minecraft:packed_mud' : lbBruit(x, z, 3) > 0.5 ? 'minecraft:grass_block[snowy=false]' : 'minecraft:coarse_dirt'
    S(x, -1, z, b)
  }
  for (var z = 0; z <= N; z++) { S(39, 0, z, 'minecraft:polished_andesite_slab[type=bottom,waterlogged=false]'); S(38, 0, z, 'minecraft:smooth_stone_slab[type=bottom,waterlogged=false]'); S(47, 0, z, 'minecraft:polished_andesite_slab[type=bottom,waterlogged=false]'); S(48, 0, z, 'minecraft:smooth_stone_slab[type=bottom,waterlogged=false]') }
  for (var z = 0; z <= N; z++) if (z % 6 < 3) S(43, -1, z, 'minecraft:white_concrete')
  // passage pieton (bandes paralleles a la rue) et rampes de trottoir
  for (var z = 60; z <= 63; z++) { [41, 43, 45].forEach(x => S(x, -1, z, 'minecraft:white_concrete')); [39, 47].forEach(x => S(x, 0, z, AIR)); [38, 48].forEach(x => S(x, 0, z, AIR)) }
  // rangee ouest (facades x37, vers l'est)
  var P = RM_PEINT
  rmBat(-1, 37, 2, 10, 14, 3, P[0], 'vitrine', { balcons: true, attente: false, pignons: [2] })
  rmBat(-1, 37, 12, 8, 13, 2, P[1], 'ouvert', { attente: true })
  rmBat(-1, 37, 20, 12, 15, 4, P[2], 'vitrine', { balcons: true, linge: true })
  rmBat(-1, 37, 32, 8, 12, 1, P[3], 'maison', { attente: true })
  rmBat(-1, 37, 40, 12, 14, 3, P[4], 'ouvert', { balcons: true })
  rmBat(-1, 37, 52, 8, 13, 2, P[5], 'maison', { linge: true })
  rmBat(-1, 37, 60, 12, 15, 3, P[6], 'vitrine', { attente: true })
  rmBat(-1, 37, 72, 10, 13, 2, P[7], 'ouvert', { balcons: true })
  rmBat(-1, 37, 82, 12, 14, 3, P[8], 'maison', { attente: true, pignons: [93] })
  // rangee est (facades x49, vers l'ouest) ; ruelle z42..45
  rmBat(1, 49, 2, 12, 14, 3, P[3], 'ouvert', { balcons: true, pignons: [2] })
  rmBat(1, 49, 14, 8, 13, 2, P[6], 'maison', { attente: true })
  rmBat(1, 49, 22, 12, 15, 2, P[0], 'vitrine', { linge: true })
  rmBat(1, 49, 34, 8, 13, 3, P[2], 'ouvert', { attente: true, pignons: [41] })
  rmBat(1, 49, 46, 10, 14, 2, P[8], 'vitrine', { balcons: true, pignons: [46] })
  rmBat(1, 49, 56, 12, 15, 4, P[1], 'maison', { balcons: true, attente: true })
  rmBat(1, 49, 68, 8, 12, 1, P[5], 'ouvert', { linge: true })
  rmBat(1, 49, 76, 12, 14, 3, P[4], 'vitrine', { balcons: true })
  rmBat(1, 49, 88, 6, 12, 2, P[7], 'maison', { attente: true, pignons: [93] })
  // ruelle : beton use, caniveau central, marches, fils, compteurs ; elle mene a l'arriere-cour
  for (var x = 49; x <= 66; x++) for (var z = 42; z <= 45; z++) S(x, -1, z, z == 43 || z == 44 ? (x % 5 == 0 ? 'minecraft:iron_bars' : 'minecraft:stone') : R() < 0.85 ? 'minecraft:light_gray_concrete' : 'minecraft:cracked_stone_bricks')
  for (var x = 49; x <= 66; x++) { [43, 44].forEach(z => { if (x % 5 == 0) S(x, -1, z, 'minecraft:stone') }) }
  F(52, 6, 42, 52, 6, 45, 'minecraft:chain[axis=z,waterlogged=false]'); F(60, 5, 42, 60, 5, 45, 'minecraft:chain[axis=z,waterlogged=false]')
  F(55, 0, 42, 55, 1, 42, 'create:andesite_casing'); F(58, 0, 45, 58, 1, 45, 'create:andesite_casing'); SA(50, 0, 42, 'minecraft:green_terracotta'); SA(50, 0, 45, 'handcrafted:terracotta_wide_pot')
  // arriere-cour : murets de parpaings, bangas en tole, bananiers, manguier, linge, citerne
  W(64, 20, 99, 90, 0, 1, 'minecraft:light_gray_concrete'); F(64, 0, 42, 64, 1, 45, AIR)
  rmBanga(72, 30, 78, 36, 32); rmBanga(84, 50, 91, 56, 52); rmBanga(74, 66, 80, 72, 68)
  rmManguier(82, 40)
  ;[[69, 50], [70, 58], [88, 30], [94, 64], [68, 78], [86, 80]].forEach((p, i) => rmBananier(p[0], p[1], 4 + (i % 2)))
  F(76, 0, 46, 76, 2, 46, 'minecraft:spruce_fence'); F(76, 0, 54, 76, 2, 54, 'minecraft:spruce_fence'); F(76, 2, 47, 76, 2, 53, 'minecraft:chain[axis=z,waterlogged=false]'); [48, 50, 52].forEach(z => S(76, 1, z, 'minecraft:' + choix(['white', 'yellow', 'pink', 'light_blue']) + '_wool'))
  // potager : buttes de terre labouree (manioc et brèdes figures par carottes et pommes de terre), cloture de bambous, herbes hautes
  for (var x = 66; x <= 74; x++) for (var z = 22; z <= 28; z++) { if (x % 3 == 2) { S(x, -1, z, 'minecraft:water'); continue } S(x, -1, z, 'minecraft:farmland[moisture=7]'); S(x, 0, z, x % 2 ? 'minecraft:carrots[age=7]' : 'minecraft:potatoes[age=7]') }
  F(65, 0, 21, 75, 0, 21, 'minecraft:bamboo_fence'); F(65, 0, 29, 75, 0, 29, 'minecraft:bamboo_fence'); F(75, 0, 22, 75, 0, 28, 'minecraft:bamboo_fence')
  for (var i = 0; i < 220; i++) { var x = 65 + Math.floor(R() * 34), z = 21 + Math.floor(R() * 69); if (libreH(x, 0, z) && /(mud|dirt|grass)/.test(HM[hk(x, -1, z)] || "") && R() < 0.8) { S(x, -1, z, 'minecraft:grass_block[snowy=false]'); SA(x, 0, z, R() < 0.7 ? 'minecraft:short_grass' : 'minecraft:fern') } }
  F(90, 0, 72, 92, 2, 74, 'minecraft:black_concrete'); F(90, 3, 72, 92, 3, 74, 'minecraft:black_carpet')
  // poteaux et fils le long du trottoir ouest, lampadaires cote est
  for (var z = 4; z <= N; z += 16) rmPoteau(39, z, 'x')
  for (var z = 4; z + 16 <= N; z += 16) { F(38, 8, z + 1, 38, 8, z + 15, 'minecraft:chain[axis=z,waterlogged=false]'); F(40, 8, z + 1, 40, 8, z + 15, 'minecraft:chain[axis=z,waterlogged=false]') }
  for (var z = 12; z <= N; z += 20) btLampe(48, z, 'west')
  // vie du trottoir (hors chaussee et hors des 4 blocs reserves a la berline, z 24..31 cote ouest)
  ;[[38, 14], [48, 30], [38, 50], [48, 70], [38, 86]].forEach(p => SA(p[0], 1, p[1], 'handcrafted:terracotta_wide_pot'))
  ;[[48, 7], [38, 44], [48, 80]].forEach(p => { SA(p[0], 1, p[1], 'minecraft:green_terracotta') })
  lxNettoyer(/(pane|_bars|fence|chain|_slab|leaves|carpet|_wool|lantern|cocoa)/)
}

var QFIN_RUE = function () {
  HB2 = true; FIN = true; THM = null
  lot(function () { HM = {}; FIN_VOLET = null; FIN_RID = null; rmRue(); finAncrage() }, 0, 0, 999, 6801, 128, 30)
  HB2 = false; FIN = false; THM = null; HM = {}
}
function vuesRue() {
  vue('r_rue', 0, 0, 43, 1.6, 1, 43, 3, 90)
  vue('r_rue_haut', 0, 0, 43, 15, 96, 43, 2, 20)
  vue('r_trottoir', 0, 0, 38.5, 2.2, 22, 39, 3, 70)
  vue('r_facades_est', 0, 0, 41.5, 1.7, 70, 56, 6, 62)
  vue('r_facades_ouest', 0, 0, 47, 2.2, 30, 30, 7, 26)
  vue('r_ruelle', 0, 0, 47, 1.7, 43.5, 78, 2, 44)
  vue('r_arriere', 0, 0, 95, 4, 85, 70, 3, 50)
  vue('r_toits', 0, 0, 26, 17, 40, 60, 9, 62)
  vue('r_dessus', 0, 0, 10, 55, -24, 55, 0, 50)
}
