
// ================= QUARTIER DU DESERT (adobe, terre cuite, acacia : desert, savane, badlands) =================
// Rangee nord (z0..31, facades au sud) : mission, hotel de ville, souk, habitat en gradins. Boulevard z32..47. Rangee sud (z48..79).
var DSA = 'minecraft:acacia_planks', DSL = 'minecraft:acacia_log[axis=y]', DSX = 'minecraft:stripped_acacia_log[axis=x]', DSZ = 'minecraft:stripped_acacia_log[axis=z]'
var DSF = 'minecraft:acacia_fence', DSP = 'mcwdoors:acacia_classic_door', DSV = 'mcwdoors:acacia_glass_door', DST = {}
var DSAB = 'minecraft:white_terracotta', DSJ = 'minecraft:smooth_sandstone', DSLH = 'minecraft:lantern[hanging=true]'
function dsM(b) { var r = R(); return r < 0.84 ? b : r < 0.93 ? 'minecraft:terracotta' : 'minecraft:packed_mud' }
function dsSol(x1, z1, x2, z2) {
  for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) {
    var r = R(), b = r < 0.36 ? 'minecraft:sand' : r < 0.42 ? 'minecraft:red_sand' : r < 0.56 ? 'minecraft:coarse_dirt' : r < 0.62 ? 'minecraft:packed_mud' : 'minecraft:grass_block'
    S(x, -1, z, b); var k = x + ',' + z
    if (b == 'minecraft:packed_mud') delete DST[k]; else DST[k] = (b == 'minecraft:grass_block' || b == 'minecraft:coarse_dirt') ? 'h' : 's'
  }
}
function dsDalle(x1, z1, x2, z2, l) { for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) { S(x, -1, z, typeof l == 'string' ? l : choix(l)); delete DST[x + ',' + z] } }
function dsVeg(x1, z1, x2, z2, d) {
  for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) {
    var t = DST[x + ',' + z]; if (!t) continue
    var r = R()
    if (t == 'h') { if (r < d * 0.5) SA(x, 0, z, 'minecraft:short_grass'); else if (r < d * 0.8) SA(x, 0, z, 'minecraft:dead_bush'); else if (r < d * 0.88) SA(x, 0, z, choix(['minecraft:orange_tulip', 'minecraft:dandelion', 'minecraft:allium'])) }
    else if (r < d * 0.35) SA(x, 0, z, 'minecraft:dead_bush')
  }
}
function dsPapiers(x1, z1, x2, z2, y, n) { for (var i = 0; i < n; i++) SA(x1 + Math.floor(R() * (x2 - x1 + 1)), y, z1 + Math.floor(R() * (z2 - z1 + 1)), choix(['minecraft:white_carpet', 'minecraft:white_carpet', 'supplementaries:book_pile', 'minecraft:light_gray_carpet', 'minecraft:yellow_carpet'])) }
function dsLibre(x, z) { for (var a = -1; a <= 1; a++) for (var b = -1; b <= 1; b++) delete DST[(x + a) + ',' + (z + b)] }
function dsCactus(x, z, h) { S(x, -1, z, 'minecraft:sand'); F(x, 0, z, x, h - 1, z, 'minecraft:cactus'); dsLibre(x, z) }
// Palmier (y0 = pied du tronc) ; mort : tronc sans palmes
function dsPalmier(x, z, h, mort, y0) {
  y0 = y0 || 0; var T = y0 + h, L = 'minecraft:azalea_leaves[persistent=true]'
  F(x, y0, z, x, T - 1, z, 'minecraft:jungle_log[axis=y]'); dsLibre(x, z)
  if (mort) { S(x, T, z, 'minecraft:stripped_jungle_log[axis=y]'); return }
  S(x, T, z, L); S(x, T + 1, z, L)
  ;[[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(d => { S(x + d[0], T, z + d[1], L); S(x + 2 * d[0], T, z + 2 * d[1], L); S(x + 3 * d[0], T, z + 3 * d[1], L); S(x + 3 * d[0], T - 1, z + 3 * d[1], L) })
  ;[[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(d => { S(x + d[0], T, z + d[1], L); S(x + d[0], T - 1, z + d[1], L) })
  S(x + 1, T - 1, z, 'minecraft:cocoa[age=2,facing=west]'); S(x, T - 1, z - 1, 'minecraft:cocoa[age=1,facing=south]')
}
function dsAcacia(x, z) {
  var L = 'minecraft:acacia_leaves[persistent=true]'
  F(x, 0, z, x, 3, z, DSL); S(x + 1, 3, z, DSL); S(x + 1, 4, z, DSL); S(x + 2, 4, z, DSL); S(x - 1, 3, z, DSL); dsLibre(x, z)
  for (var a = -2; a <= 2; a++) for (var b = -2; b <= 2; b++) if (Math.abs(a) + Math.abs(b) < 4) S(x + 2 + a, 5, z + b, L)
  for (var a = -1; a <= 1; a++) for (var b = -1; b <= 1; b++) S(x + 2 + a, 6, z + b, L)
  for (var a = -1; a <= 1; a++) for (var b = -1; b <= 1; b++) if (Math.abs(a) + Math.abs(b) < 2) S(x - 1 + a, 4, z + b, L)
}
// Olivier sec (feuillage gris-vert clairseme)
function dsOlivier(x, z) {
  var L = 'minecraft:azalea_leaves[persistent=true]'
  F(x, 0, z, x, 1, z, 'minecraft:stripped_acacia_log[axis=y]'); S(x, 2, z, DSL); dsLibre(x, z)
  for (var a = -1; a <= 1; a++) for (var b = -1; b <= 1; b++) for (var y = 2; y <= 3; y++) if ((a || b || y == 3) && R() < 0.7) S(x + a, y, z + b, L)
}
// Volume d'adobe : murs y0+1..y0+6, plafond a poutres (vigas) en y0+6, acrotere en y0+7 et vigas en saillie si o.toit
function dsBloc(x1, z1, x2, z2, y0, b, o) {
  o = o || {}; var sans = o.sans || []
  if (y0 == 0) F(x1, 0, z1, x2, 0, z2, DSA)
  for (var y = y0 + 1; y <= y0 + 6; y++) {
    for (var x = x1; x <= x2; x++) { S(x, y, z1, dsM(b)); S(x, y, z2, dsM(b)) }
    for (var z = z1 + 1; z < z2; z++) { S(x1, y, z, dsM(b)); S(x2, y, z, dsM(b)) }
  }
  var ax = (x2 - x1) <= (z2 - z1) ? 'x' : 'z'
  for (var x = x1 + 1; x < x2; x++) for (var z = z1 + 1; z < z2; z++) S(x, y0 + 6, z, ((ax == 'x' ? z : x) % 2) ? (ax == 'x' ? DSX : DSZ) : DSA)
  if (o.toit) {
    for (var x = x1; x <= x2; x++) { S(x, y0 + 7, z1, dsM(b)); S(x, y0 + 7, z2, dsM(b)) }
    for (var z = z1 + 1; z < z2; z++) { S(x1, y0 + 7, z, dsM(b)); S(x2, y0 + 7, z, dsM(b)) }
    if (ax == 'x') { for (var z = z1 + 1; z < z2; z++) if (z % 2) { if (sans.indexOf('west') < 0) S(x1 - 1, y0 + 5, z, DSX); if (sans.indexOf('east') < 0) S(x2 + 1, y0 + 5, z, DSX) } }
    else { for (var x = x1 + 1; x < x2; x++) if (x % 2) { if (sans.indexOf('north') < 0) S(x, y0 + 5, z1 - 1, DSZ); if (sans.indexOf('south') < 0) S(x, y0 + 5, z2 + 1, DSZ) } }
    // gargouilles (canales) en bois
    if (sans.indexOf('south') < 0) S(Math.floor((x1 + x2) / 2), y0 + 7, z2 + 1, 'minecraft:acacia_trapdoor[facing=south,half=bottom,open=false]')
    if (sans.indexOf('north') < 0) S(Math.floor((x1 + x2) / 2) + 1, y0 + 7, z1 - 1, 'minecraft:acacia_trapdoor[facing=north,half=bottom,open=false]')
  }
}
// Fenetre : etat 0 vitre + volets ouverts, 1 grille en fer (reja), 2 planches clouees, 3 vitre seule ; linteau en bois, appui en saillie
function dsFen(a1, a2, y, c, f, h, etat) {
  var ns = f == 'north' || f == 'south', d = (f == 'south' || f == 'east') ? 1 : -1
  function P(a, yy, o, b) { if (ns) S(a, yy, c + o, b); else S(c + o, yy, a, b) }
  var vo = 'minecraft:acacia_trapdoor[facing=' + f + ',half=bottom,open=true]'
  for (var a = a1; a <= a2; a++) {
    for (var k = 0; k < h; k++) P(a, y + k, 0, etat == 1 ? 'minecraft:iron_bars' : etat == 2 ? 'minecraft:acacia_trapdoor[facing=' + f + ',half=' + (k % 2 ? 'bottom' : 'top') + ',open=false]' : GP)
    P(a, y - 1, d, 'minecraft:smooth_sandstone_slab[type=top]')
  }
  for (var a = a1 - 1; a <= a2 + 1; a++) P(a, y + h, 0, ns ? DSX : DSZ)
  if (etat == 0) for (var k = 0; k < h; k++) { if (R() > 0.2) P(a1 - 1, y + k, d, vo); if (R() > 0.2) P(a2 + 1, y + k, d, vo) }
}
// Arcade : piliers tous les 3, arcs en marches renversees, poutre au-dessus (ns : arcade le long de x sur la ligne z = c)
function dsArcade(a1, a2, c, y0, ns, mat, st) {
  function P(a, y, b) { if (ns) S(a, y, c, b); else S(c, y, a, b) }
  for (var a = a1; a <= a2; a++) {
    if ((a - a1) % 3 == 0 || a == a2) { for (var y = y0 + 1; y <= y0 + 4; y++) P(a, y, mat) }
    else { var g = (a - a1) % 3 == 1; P(a, y0 + 4, st + '[facing=' + (ns ? (g ? 'west' : 'east') : (g ? 'north' : 'south')) + ',half=top,shape=straight]') }
    P(a, y0 + 5, mat)
  }
}
function dsLampadaire(x, z, d) { // d = decalage du bras vers la chaussee (+1 / -1 en z)
  F(x, 0, z, x, 4, z, 'minecraft:polished_blackstone_wall'); S(x, 5, z, 'minecraft:polished_blackstone_slab[type=bottom]'); S(x, 5, z + d, 'minecraft:polished_blackstone_slab[type=bottom]'); S(x, 4, z + d, DSLH)
}
function dsPickup(x, z, c) { // pick-up le long de x : cabine x..x+1, plateau x+2..x+4
  var k = 'minecraft:' + c + '_concrete'
  for (var u = 0; u < 5; u++) for (var v = 0; v < 2; v++) S(x + u, 0, z + v, k)
  S(x, 1, z, 'minecraft:tinted_glass'); S(x, 1, z + 1, 'minecraft:tinted_glass'); S(x + 1, 1, z, k); S(x + 1, 1, z + 1, k); S(x, 2, z, 'minecraft:' + c + '_carpet'); S(x + 1, 2, z, 'minecraft:' + c + '_carpet'); S(x, 2, z + 1, 'minecraft:' + c + '_carpet'); S(x + 1, 2, z + 1, 'minecraft:' + c + '_carpet')
  for (var u = 2; u < 5; u++) { S(x + u, 1, z, 'minecraft:' + c + '_carpet'); S(x + u, 1, z + 1, 'minecraft:' + c + '_carpet') }
  S(x + 3, 1, z, 'minecraft:barrel[facing=up,open=false]'); S(x + 4, 1, z + 1, 'supplementaries:sack')
  ;[0, 3].forEach(u => { S(x + u, 0, z - 1, 'minecraft:polished_blackstone_button[face=wall,facing=north]'); S(x + u, 0, z + 2, 'minecraft:polished_blackstone_button[face=wall,facing=south]') })
}

// ================= BOULEVARD (coordonnees du quartier, x -16..143, z 32..47) : terre-plein a palmiers, sable qui envahit =================
function dsRue() {
  DST = {}
  for (var x = -16; x <= 143; x++) for (var z = 32; z <= 47; z++) {
    var b
    if (z <= 34 || z >= 45) b = (z == 34 || z == 45) ? 'minecraft:smooth_stone' : ((x + z) % 3 ? DSJ : 'minecraft:cut_sandstone')
    else if (z == 39 || z == 40) b = 'minecraft:cut_sandstone'
    else { var r = R(); b = r < 0.8 ? 'minecraft:gray_concrete' : r < 0.88 ? 'minecraft:light_gray_concrete' : r < 0.94 ? 'minecraft:sand' : 'minecraft:andesite' }
    S(x, -1, z, b)
  }
  for (var x = -16; x <= 143; x++) {
    if (((x % 6) + 6) % 6 < 3) { S(x, -1, 37, 'minecraft:white_concrete'); S(x, -1, 42, 'minecraft:white_concrete') }
    var p = ((x - 4) % 14 + 14) % 14
    if (p < 2) { S(x, 0, 39, 'minecraft:coarse_dirt'); S(x, 0, 40, 'minecraft:coarse_dirt') }
    else { S(x, 0, 39, 'minecraft:smooth_sandstone_slab[type=bottom]'); S(x, 0, 40, 'minecraft:smooth_sandstone_slab[type=bottom]') }
  }
  for (var x = -10; x <= 140; x += 14) { if (x >= 54 && x <= 61) continue; var m = R() < 0.25; dsPalmier(x, 39, 7 + Math.floor(R() * 3), m, 1); SA(x + 1, 1, 40, 'minecraft:dead_bush') }
  // passage pieton
  for (var x = 54; x <= 61; x++) if (x % 2 == 0) for (var z = 35; z <= 44; z++) if (z != 39 && z != 40) S(x, -1, z, 'minecraft:white_concrete')
  for (var x = 54; x <= 61; x++) { S(x, 0, 39, AIR); S(x, 0, 40, AIR); S(x, -1, 39, 'minecraft:cut_sandstone'); S(x, -1, 40, 'minecraft:cut_sandstone') }
  // feux tricolores
  ;[[53, 33, 1], [62, 46, -1]].forEach(t => { F(t[0], 0, t[1], t[0], 5, t[1], 'minecraft:polished_blackstone_wall'); var zz = t[1] + t[2]; S(t[0], 5, zz, 'minecraft:black_concrete'); S(t[0], 4, zz, 'minecraft:red_stained_glass'); S(t[0], 3, zz, 'minecraft:yellow_stained_glass'); S(t[0], 2, zz, 'minecraft:black_concrete') })
  // lampadaires
  for (var x = -8; x <= 140; x += 16) { dsLampadaire(x, 33, 1); if (R() < 0.85) dsLampadaire(x + 8, 46, -1) }
  // dunes de sable qui recouvrent la chaussee
  ;[[-4, 43, 7, 3], [30, 36, 6, 2], [84, 43, 8, 3], [118, 35, 5, 2], [136, 41, 6, 4]].forEach(d => {
    for (var x = d[0] - d[2]; x <= d[0] + d[2]; x++) for (var z = d[1] - d[3]; z <= d[1] + d[3]; z++) {
      var e = Math.pow((x - d[0]) / d[2], 2) + Math.pow((z - d[1]) / d[3], 2); if (e > 1 || z < 32 || z > 47) continue
      if (z == 39 || z == 40) continue
      S(x, -1, z, 'minecraft:sand'); if (e < 0.35) S(x, 0, z, 'minecraft:sand'); if (e > 0.6 && R() < 0.12) SA(x, 0, z, 'minecraft:dead_bush')
    }
  })
  // vehicules abandonnes (emplacements des futurs vehicules MTS)
  bgVoiture(2, 36, 'x', 'white', 1); bgVoiture(20, 42, 'x', 'light_blue', 0); bgVoiture(45, 36, 'x', 'orange', 2); bgVoiture(68, 42, 'x', 'yellow', 1)
  bgVoiture(96, 36, 'x', 'red', 1); bgVoiture(124, 42, 'x', 'brown', 0); bgVoiture(82, 42, 'x', 'white', 1, true); dsPickup(108, 36, 'brown'); dsPickup(14, 36, 'light_gray')
  // palmier tombe en travers du trottoir
  F(10, 0, 32, 10, 0, 37, 'minecraft:jungle_log[axis=z]'); ;[[9, 38], [11, 38], [10, 38], [10, 39 - 1]].forEach(p => SA(p[0], 0, p[1], 'minecraft:jungle_leaves[persistent=true]'))
  // debris, barrieres de chantier, abribus
  for (var i = 0; i < 40; i++) SA(-16 + Math.floor(R() * 160), 0, 32 + Math.floor(R() * 16), choix(['minecraft:dead_bush', 'minecraft:light_gray_carpet', 'minecraft:white_carpet', 'minecraft:sand', 'minecraft:dead_bush', 'supplementaries:sack']))
  ;[70, 71, 72].forEach(x => { S(x, 0, 36, 'minecraft:orange_concrete'); S(x, 1, 36, 'minecraft:white_concrete') })
  F(36, 0, 46, 42, 0, 47, 'minecraft:smooth_stone'); ;[36, 42].forEach(x => F(x, 1, 47, x, 3, 47, 'minecraft:iron_bars')); F(36, 4, 46, 42, 4, 47, 'minecraft:smooth_stone_slab[type=bottom]'); F(37, 1, 47, 41, 3, 47, 'minecraft:light_blue_stained_glass_pane'); S(39, 2, 47, AIR)
  F(37, 1, 46, 41, 1, 46, 'minecraft:smooth_stone_slab[type=bottom]')
}

// ================= RELAIS DE DILIGENCE (grande salle d'adobe a fronton, logis, patio, parvis a abreuvoir) =================
function dsRelais() {
  DST = {}
  var B = DSAB, MB = 'minecraft:mud_bricks', MBS = 'minecraft:mud_brick_stairs', MBL = 'minecraft:mud_brick_slab'
  dsSol(0, 0, 31, 31)
  // ---- nef x9..19 z5..24 ----
  F(9, 0, 5, 19, 0, 24, DSA)
  for (var x = 10; x <= 18; x++) for (var z = 6; z <= 23; z++) S(x, 0, z, (x + z) % 2 ? 'minecraft:terracotta' : 'minecraft:brown_terracotta')
  for (var y = 1; y <= 11; y++) { for (var x = 9; x <= 19; x++) { S(x, y, 5, dsM(B)); S(x, y, 24, dsM(B)) } for (var z = 6; z <= 23; z++) { S(9, y, z, dsM(B)); S(19, y, z, dsM(B)) } }
  for (var x = 10; x <= 18; x++) for (var z = 6; z <= 23; z++) S(x, 11, z, z % 2 ? DSX : DSA)
  F(10, 12, 6, 18, 12, 23, 'minecraft:packed_mud')
  for (var z = 5; z <= 23; z++) { S(9, 12, z, dsM(B)); S(19, 12, z, dsM(B)) } for (var x = 10; x <= 18; x++) S(x, 12, 5, dsM(B))
  for (var z = 7; z <= 23; z += 2) { S(8, 10, z, DSX); if (z > 15) S(20, 10, z, DSX) }
  // fronton a gradins perce de trois baies
  ;[[12, 9, 19], [13, 10, 18], [14, 11, 17], [15, 12, 16], [16, 13, 15], [17, 14, 14]].forEach(p => F(p[1], p[0], 24, p[2], p[0], 24, B))
  F(12, 13, 24, 12, 14, 24, AIR); F(16, 13, 24, 16, 14, 24, AIR); F(14, 15, 24, 14, 16, 24, AIR)
  S(12, 14, 24, 'minecraft:lantern[hanging=true]'); S(16, 14, 24, 'minecraft:lantern[hanging=true]')
  ;[[9, 12], [19, 12], [10, 13], [18, 13], [11, 14], [17, 14], [12, 15], [16, 15], [13, 16], [15, 16]].forEach(p => S(p[0], p[1] + 1, 24, MBL + '[type=bottom]'))
  F(14, 18, 24, 14, 19, 24, 'minecraft:acacia_fence')
  // portail
  F(12, 0, 25, 16, 0, 25, MB); F(13, 1, 25, 15, 5, 25, MB); F(14, 1, 25, 14, 3, 25, AIR); S(13, 3, 25, MBS + '[facing=west,half=top,shape=straight]'); S(15, 3, 25, MBS + '[facing=east,half=top,shape=straight]')
  F(12, 1, 25, 12, 5, 25, 'minecraft:mud_brick_wall'); F(16, 1, 25, 16, 5, 25, 'minecraft:mud_brick_wall'); F(12, 6, 25, 16, 6, 25, MBL + '[type=bottom]')
  F(12, 0, 26, 16, 0, 26, MBS + '[facing=north,half=bottom,shape=straight]')
  PORTE(14, 1, 24, DSP, 'south', 'left', 'false')
  S(14, 7, 24, GP); S(14, 8, 24, GP); S(13, 8, 24, GP); S(15, 8, 24, GP); S(14, 9, 24, GP)
  // contreforts
  ;[8, 14, 20].forEach(z => { F(8, 0, z, 8, 7, z, B); S(8, 8, z, MBS + '[facing=east,half=bottom,shape=straight]'); if (z > 15) { F(20, 0, z, 20, 7, z, B); S(20, 8, z, MBS + '[facing=west,half=bottom,shape=straight]') } })
  ;[9, 19].forEach(x => { F(x, 0, 25, x, 9, 25, B); S(x, 10, 25, MBS + '[facing=north,half=bottom,shape=straight]') })
  dsFen(11, 11, 5, 9, 'west', 3, 3); dsFen(17, 17, 5, 9, 'west', 3, 2); dsFen(22, 22, 6, 9, 'west', 2, 1); dsFen(18, 18, 5, 19, 'east', 3, 3); dsFen(22, 22, 6, 19, 'east', 2, 3)
  // estrade du fond, mur de carreaux, buffet
  F(10, 1, 6, 18, 1, 9, 'minecraft:smooth_red_sandstone'); F(10, 1, 10, 18, 1, 10, 'minecraft:smooth_red_sandstone_stairs[facing=north,half=bottom,shape=straight]')
  for (var x = 11; x <= 17; x++) for (var y = 2; y <= 9; y++) S(x, y, 6, (x == 11 || x == 17) ? 'minecraft:cut_red_sandstone' : y == 9 ? 'minecraft:chiseled_red_sandstone' : y % 3 == 2 ? 'minecraft:chiseled_sandstone' : ((x + y) % 2 ? 'minecraft:orange_glazed_terracotta[facing=south]' : 'minecraft:yellow_glazed_terracotta[facing=south]'))
  S(14, 10, 6, 'minecraft:chiseled_red_sandstone')
  F(12, 2, 8, 16, 2, 8, MAT('acacia_counter', 'south')); S(12, 3, 8, 'supplementaries:jar'); S(14, 3, 8, 'minecraft:decorated_pot'); S(16, 3, 8, 'supplementaries:jar')
  ;[10, 18].forEach(x => { S(x, 2, 7, 'minecraft:mud_brick_wall'); S(x, 3, 7, 'minecraft:lantern[hanging=false]') })
  // tables de la salle, allee, mezzanine des musiciens
  for (var z = 13; z <= 19; z += 3) for (var x = 11; x <= 17; x += 6) { S(x, 1, z, 'mcwfurnitures:acacia_table'); if (R() > 0.2) S(x - 1, 1, z, MAT('acacia_chair', 'east')); if (R() > 0.2) S(x + 1, 1, z, MAT('acacia_chair', 'west')) }
  for (var z = 11; z <= 23; z++) if (R() > 0.2) S(14, 1, z, 'minecraft:red_carpet')
  S(11, 1, 23, 'minecraft:barrel[facing=up,open=false]'); S(17, 1, 23, 'minecraft:decorated_pot')
  F(10, 5, 21, 18, 5, 23, DSA); F(10, 6, 21, 17, 6, 21, DSF); F(10, 1, 21, 10, 4, 21, DSL); F(17, 1, 21, 17, 4, 21, DSL)
  F(18, 1, 22, 18, 5, 22, 'minecraft:ladder[facing=west]')
  S(11, 6, 23, 'minecraft:note_block'); S(15, 6, 23, 'minecraft:jukebox'); S(13, 6, 22, 'mcwfurnitures:acacia_stool_chair')
  S(14, 10, 13, 'mcwlights:iron_chandelier'); S(14, 10, 18, 'mcwlights:iron_chandelier')
  // toit perce, gravats
  F(12, 11, 15, 13, 12, 16, AIR); S(13, 1, 15, 'minecraft:packed_mud'); S(12, 1, 15, MBL + '[type=bottom]'); S(13, 2, 15, 'minecraft:dead_bush')
  PORTE(9, 1, 19, DSP, 'west', 'left', 'false'); S(8, 0, 19, MBS + '[facing=east,half=bottom,shape=straight]')
  // ---- logis x19..28 z6..15 : reserve, chambre du relayeur, cuisine a cheminee d'angle ----
  dsBloc(19, 6, 28, 15, 0, B, { toit: true, sans: ['west'] })
  for (var y = 1; y <= 7; y++) for (var z = 6; z <= 15; z++) S(19, y, z, dsM(B))
  F(23, 1, 7, 23, 5, 14, B); PORTE(23, 1, 10, DSP, 'east', 'left', 'false'); F(24, 1, 11, 27, 5, 11, B); PORTE(25, 1, 11, DSP, 'south', 'left', 'false')
  PORTE(19, 1, 11, DSP, 'east', 'left', 'false')
  S(20, 1, 7, 'mcwfurnitures:acacia_wardrobe[facing=east,connection=base,hinge=left]'); S(20, 1, 9, 'minecraft:chest[facing=east]'); F(20, 1, 13, 20, 2, 14, 'minecraft:bookshelf'); S(22, 1, 14, 'mcwfurnitures:acacia_table'); S(22, 1, 13, MAT('acacia_chair', 'south')); S(22, 2, 14, 'minecraft:brewing_stand'); S(22, 1, 7, 'minecraft:barrel[facing=up,open=false]'); S(21, 5, 10, DSLH)
  LIT(26, 1, 9, 'brown', 'north'); S(24, 1, 7, 'mcwfurnitures:acacia_table'); S(24, 1, 8, MAT('acacia_chair', 'north')); S(24, 2, 7, 'supplementaries:book_pile'); S(27, 1, 7, 'minecraft:chest[facing=west]'); S(27, 1, 10, 'minecraft:potted_dead_bush'); S(25, 5, 9, DSLH)
  S(27, 1, 14, 'minecraft:campfire[lit=false,facing=west]'); S(26, 1, 14, MB); S(27, 1, 13, MB); S(26, 2, 14, MB); S(27, 2, 13, MB); S(26, 3, 14, MBL + '[type=bottom]'); S(27, 3, 13, MBL + '[type=bottom]'); F(27, 3, 14, 27, 8, 14, MB); S(27, 9, 14, 'minecraft:mud_brick_wall')
  S(25, 1, 13, 'mcwfurnitures:acacia_table'); S(24, 1, 13, MAT('acacia_chair', 'east')); S(25, 1, 12, MAT('acacia_chair', 'south')); S(25, 2, 13, 'minecraft:decorated_pot'); S(24, 1, 14, MAT('acacia_counter', 'north')); S(24, 2, 14, 'supplementaries:jar'); S(26, 1, 12, 'minecraft:decorated_pot'); S(25, 5, 13, DSLH)
  dsPapiers(20, 7, 27, 14, 1, 5)
  PORTE(21, 1, 15, DSP, 'south', 'left', 'false'); PORTE(25, 1, 15, DSP, 'south', 'right', 'false')
  dsFen(21, 21, 2, 6, 'north', 2, 0); dsFen(26, 26, 2, 6, 'north', 2, 1); dsFen(8, 9, 2, 28, 'east', 2, 1); dsFen(13, 13, 2, 28, 'east', 2, 2); dsFen(27, 27, 2, 15, 'south', 2, 3)
  // portique (portal) z16..17
  F(19, 0, 16, 28, 0, 17, 'minecraft:mud_bricks')
  ;[20, 23, 26].forEach(x => { F(x, 1, 17, x, 4, 17, DSL); S(x - 1, 4, 17, DSX); S(x + 1, 4, 17, DSX) }); F(28, 1, 17, 28, 4, 17, DSL)
  F(19, 5, 16, 28, 5, 17, DSA); for (var x = 20; x <= 27; x += 2) S(x, 5, 18, DSZ)
  S(21, 4, 16, DSLH); S(25, 4, 16, DSLH); F(23, 1, 16, 24, 1, 16, 'minecraft:acacia_stairs[facing=north,half=bottom,shape=straight]')
  // patio : puits, oliviers secs, jarres ; murs et portail sur le boulevard
  dsDalle(24, 18, 25, 25, ['minecraft:mud_bricks', 'minecraft:packed_mud', 'minecraft:mud_bricks'])
  F(21, 0, 21, 23, 0, 23, MB); S(22, 0, 22, 'minecraft:water'); dsDalle(22, 22, 22, 22, MB); dsLibre(22, 22)
  F(21, 1, 22, 21, 2, 22, DSF); F(23, 1, 22, 23, 2, 22, DSF); F(21, 3, 22, 23, 3, 22, DSX); S(22, 2, 22, 'minecraft:chain[axis=y]')
  dsOlivier(27, 19); dsOlivier(26, 23)
  S(28, 0, 19, 'minecraft:decorated_pot'); S(28, 0, 22, 'minecraft:decorated_pot'); S(20, 0, 18, 'minecraft:decorated_pot'); F(20, 0, 25, 20, 0, 25, MBS + '[facing=west,half=bottom,shape=straight]')
  F(29, 0, 5, 29, 1, 26, B); F(19, 0, 26, 29, 1, 26, B); F(19, 0, 25, 19, 1, 25, B); F(20, 2, 26, 29, 2, 26, MBL + '[type=bottom]'); F(29, 2, 5, 29, 2, 25, MBL + '[type=bottom]')
  F(24, 1, 26, 25, 1, 26, AIR); F(24, 2, 26, 25, 2, 26, AIR); S(24, 0, 26, 'minecraft:acacia_fence_gate[facing=south,open=true,in_wall=false]'); S(25, 0, 26, 'minecraft:acacia_fence_gate[facing=south,open=false,in_wall=false]'); F(23, 3, 26, 26, 3, 26, DSX)
  // parvis : abreuvoir, poteau d'attache
  dsDalle(1, 26, 18, 31, [DSJ, 'minecraft:packed_mud', 'minecraft:sand', 'minecraft:mud_bricks', DSJ])
  S(14, 0, 29, MB); S(14, 1, 29, 'minecraft:water_cauldron[level=2]')
  S(13, 0, 29, MBS + '[facing=east,half=bottom,shape=straight]'); S(15, 0, 29, MBS + '[facing=west,half=bottom,shape=straight]'); S(14, 0, 28, MBS + '[facing=south,half=bottom,shape=straight]'); S(14, 0, 30, MBS + '[facing=north,half=bottom,shape=straight]')
  S(4, 0, 28, 'minecraft:hay_block[axis=y]'); S(5, 0, 27, MBL + '[type=bottom]'); S(3, 0, 29, 'minecraft:packed_mud')
  F(2, 0, 30, 2, 1, 30, DSF); F(7, 0, 30, 7, 1, 30, DSF); F(3, 1, 30, 6, 1, 30, DSF)
  // cote ouest : four a pain (horno), bucher, cactus
  F(2, 0, 9, 4, 1, 11, 'minecraft:packed_mud'); S(3, 1, 10, AIR); S(4, 1, 10, AIR); S(3, 2, 10, MBL + '[type=bottom]'); S(2, 2, 10, MBL + '[type=bottom]'); S(3, 2, 9, MBL + '[type=bottom]'); S(3, 2, 11, MBL + '[type=bottom]'); S(3, 0, 10, 'minecraft:campfire[lit=false,facing=east]')
  dsLibre(3, 10); F(5, 0, 12, 6, 1, 13, 'minecraft:acacia_log[axis=x]'); dsLibre(5, 12); dsLibre(6, 13)
  S(6, 0, 4, 'minecraft:water_cauldron[level=1]'); dsLibre(6, 4)
  dsCactus(2, 3, 3); dsCactus(6, 17, 2); dsCactus(1, 21, 3); dsCactus(25, 2, 2); dsCactus(30, 29, 3)
  dsPalmier(4, 23, 8); dsPalmier(27, 29, 7); dsAcacia(2, 14)
  dsVeg(0, 0, 31, 31, 0.3)
}

// ================= HOTEL DE VILLE (palais municipal a patio, arcades sur rue, tour de l'horloge) =================
function dsMairie() {
  DST = {}
  var B = DSJ, C = 'minecraft:cut_sandstone', CH = 'minecraft:chiseled_sandstone', SS = 'minecraft:smooth_sandstone_stairs', SW = 'minecraft:sandstone_wall'
  dsSol(0, 0, 31, 31)
  dsBloc(3, 3, 28, 21, 0, B, {}); dsBloc(3, 3, 28, 21, 6, B, { toit: true, sans: ['south'] })
  ;[[3, 3], [28, 3], [3, 21], [28, 21]].forEach(p => F(p[0], 1, p[1], p[0], 13, p[1], C))
  for (var x = 3; x <= 28; x++) { S(x, 6, 3, C); S(x, 6, 21, C) } for (var z = 4; z <= 20; z++) { S(3, 6, z, C); S(28, 6, z, C) }
  // cloitre a deux niveaux autour du patio (anneau x9..22 z9..15, ciel ouvert x11..20 z11..13)
  F(8, 1, 8, 23, 11, 8, B); F(8, 1, 16, 23, 11, 16, B); F(8, 1, 9, 8, 11, 15, B); F(23, 1, 9, 23, 11, 15, B)
  F(11, 6, 11, 20, 13, 13, AIR)
  ;[0, 6].forEach(y0 => { dsArcade(10, 21, 10, y0, true, C, SS); dsArcade(10, 21, 14, y0, true, C, SS); dsArcade(10, 14, 10, y0, false, C, SS); dsArcade(10, 14, 21, y0, false, C, SS) })
  for (var x = 11; x <= 20; x++) [10, 14].forEach(z => { if ((x - 10) % 3) S(x, 7, z, SW) }); ;[11, 12].forEach(z => { S(10, 7, z, SW); S(21, 7, z, SW) })
  for (var x = 11; x <= 20; x++) for (var z = 11; z <= 13; z++) S(x, 0, z, (x + z) % 2 ? 'minecraft:terracotta' : DSJ)
  F(14, 1, 11, 17, 1, 13, C); F(15, 1, 12, 16, 1, 12, AIR); S(15, 0, 12, 'minecraft:cyan_glazed_terracotta[facing=north]'); S(16, 0, 12, 'minecraft:cyan_glazed_terracotta[facing=south]'); S(15, 1, 12, SW); S(15, 2, 12, SW); S(15, 3, 12, 'minecraft:smooth_sandstone_slab[type=bottom]')
  ;[[11, 11], [20, 11], [11, 13], [20, 13]].forEach(p => S(p[0], 1, p[1], 'minecraft:potted_dead_bush'))
  ;[[12, 9], [19, 9], [12, 15], [19, 15], [9, 12], [22, 12]].forEach(p => S(p[0], 5, p[1], DSLH))
  // rez : hall d'entree (sud), guichets (nord), archives et escalier (ouest), salle des mariages (est)
  PORTE(15, 1, 21, DSP, 'south', 'left', 'false'); PORTE(16, 1, 21, DSP, 'south', 'right', 'false'); F(15, 3, 21, 16, 3, 21, GP)
  F(15, 1, 16, 16, 3, 16, AIR); S(14, 2, 17, 'supplementaries:notice_board[facing=south]'); S(17, 2, 17, 'supplementaries:notice_board[facing=south]')
  F(10, 1, 19, 11, 1, 19, 'minecraft:acacia_stairs[facing=south,half=bottom,shape=straight]'); F(20, 1, 19, 21, 1, 19, 'minecraft:acacia_stairs[facing=south,half=bottom,shape=straight]'); S(9, 1, 17, 'minecraft:potted_dead_bush'); S(22, 1, 17, 'minecraft:decorated_pot'); S(15, 5, 19, 'mcwlights:iron_chandelier'); dsPapiers(9, 17, 22, 20, 1, 7)
  F(9, 1, 6, 22, 1, 6, MAT('acacia_counter', 'south')); for (var x = 9; x <= 22; x++) if (x % 4) F(x, 2, 6, x, 3, 6, 'minecraft:iron_bars')
  ;[10, 14, 18, 21].forEach(x => { S(x, 1, 4, 'mcwfurnitures:acacia_table'); S(x, 1, 5, MAT('acacia_chair', 'north')) }); S(10, 2, 4, 'supplementaries:book_pile'); S(18, 2, 4, 'minecraft:candle[candles=1,lit=false]')
  S(12, 1, 4, MAT('acacia_drawer', 'south')); S(16, 1, 4, MAT('acacia_drawer', 'south')); S(22, 1, 4, 'minecraft:iron_block'); S(20, 1, 4, 'minecraft:chest[facing=south]'); F(14, 1, 7, 17, 1, 7, 'minecraft:acacia_stairs[facing=south,half=bottom,shape=straight]'); S(15, 5, 5, DSLH); S(20, 5, 5, DSLH)
  PORTE(12, 1, 8, DSP, 'north', 'left', 'false'); PORTE(19, 1, 8, DSP, 'north', 'right', 'false'); dsPapiers(9, 4, 22, 7, 1, 6)
  for (var k = 0; k <= 5; k++) { S(5, 1 + k, 19 - k, 'minecraft:acacia_stairs[facing=north,half=bottom,shape=straight]'); S(6, 1 + k, 19 - k, 'minecraft:acacia_stairs[facing=north,half=bottom,shape=straight]'); if (k > 0) F(5, 1, 19 - k, 6, k, 19 - k, DSA) }
  F(5, 6, 15, 6, 6, 19, AIR); F(7, 7, 15, 7, 7, 19, DSF); F(5, 7, 20, 6, 7, 20, DSF); PORTE(8, 1, 20, DSP, 'west', 'left', 'false')
  F(4, 1, 13, 7, 5, 13, B); PORTE(4, 1, 13, DSP, 'south', 'left', 'false'); PORTE(8, 1, 10, DSP, 'west', 'left', 'false')
  for (var z = 4; z <= 11; z++) { if (z != 10) { F(4, 1, z, 4, 3, z, 'minecraft:bookshelf'); F(7, 1, z, 7, 3, z, R() < 0.8 ? 'minecraft:bookshelf' : 'minecraft:chiseled_bookshelf[facing=west]') } }
  S(5, 1, 6, 'supplementaries:sack'); S(6, 1, 9, 'minecraft:barrel[facing=up,open=true]'); S(5, 5, 8, DSLH); dsPapiers(5, 4, 6, 12, 1, 4)
  F(24, 1, 11, 27, 5, 11, B); PORTE(23, 1, 9, DSP, 'east', 'left', 'false'); PORTE(23, 1, 13, DSP, 'east', 'left', 'false')
  F(25, 1, 12, 25, 1, 20, 'minecraft:red_carpet'); for (var z = 14; z <= 19; z += 2) { S(24, 1, z, MAT('acacia_chair', 'east')); S(26, 1, z, MAT('acacia_chair', 'west')); S(27, 1, z, MAT('acacia_chair', 'west')) }
  F(24, 1, 20, 27, 1, 20, 'minecraft:smooth_sandstone_slab[type=bottom]'); S(25, 2, 20, 'mcwfurnitures:acacia_table'); S(25, 3, 20, 'minecraft:candle[candles=3,lit=false]'); S(24, 2, 20, 'minecraft:potted_azalea_bush'); S(27, 2, 20, 'minecraft:potted_dead_bush'); S(25, 5, 16, 'mcwlights:iron_chandelier')
  S(24, 1, 4, 'mcwfurnitures:acacia_table'); S(25, 1, 4, MAT('acacia_chair', 'west')); S(27, 1, 4, 'minecraft:bookshelf'); S(27, 1, 7, 'minecraft:chest[facing=west]'); S(24, 2, 4, 'supplementaries:book_pile'); S(26, 5, 7, DSLH)
  // etage : salle du conseil (sud), bureaux (nord), archives (ouest), cabinet du maire (est)
  F(14, 7, 18, 17, 7, 19, 'mcwfurnitures:acacia_table'); for (var x = 13; x <= 18; x++) { if (x > 13 && x < 18) S(x, 7, 20, MAT('acacia_chair', 'north')) }
  ;[18, 19].forEach(z => { S(13, 7, z, MAT('acacia_chair', 'east')); S(18, 7, z, MAT('acacia_chair', 'west')) }); S(15, 8, 18, 'supplementaries:book_pile'); S(16, 8, 19, 'minecraft:candle[candles=2,lit=false]')
  S(10, 7, 18, 'minecraft:red_banner'); S(21, 7, 18, 'minecraft:yellow_banner'); F(9, 7, 20, 11, 7, 20, 'minecraft:bookshelf'); F(20, 7, 20, 22, 7, 20, 'minecraft:bookshelf'); S(15, 11, 18, 'mcwlights:iron_chandelier'); dsPapiers(9, 17, 22, 20, 7, 5)
  PORTE(15, 7, 16, DSP, 'north', 'left', 'false'); PORTE(12, 7, 21, DSV, 'south', 'left', 'false'); PORTE(19, 7, 21, DSV, 'south', 'right', 'false')
  var c = cadre(9, 4, 14, 7, 'north', 6); piece(c, 'bureau', 1); c.porte(DSP); F(15, 7, 4, 15, 11, 7, B)
  c = cadre(16, 4, 22, 7, 'north', 6); piece(c, 'bureau', 0); c.porte(DSP)
  F(4, 7, 13, 7, 11, 13, B); c = cadre(4, 4, 7, 12, 'west', 6); piece(c, 'grenier', 1); c.porte(DSP)
  for (var z = 5; z <= 11; z += 2) S(7, 7, z, 'minecraft:bookshelf')
  PORTE(8, 7, 14, DSP, 'west', 'left', 'false')
  F(24, 7, 13, 27, 11, 13, B); c = cadre(24, 14, 27, 20, 'east', 6); piece(c, 'bureau', 0); c.porte(DSP); S(27, 7, 14, 'minecraft:iron_block'); S(24, 7, 20, 'minecraft:red_banner')
  c = cadre(24, 4, 27, 12, 'east', 6); piece(c, 'salle', 1)
  PORTE(23, 7, 10, DSP, 'east', 'left', 'false')
  // fenetres
  ;[[5, 6], [9, 10], [20, 21], [24, 25]].forEach(p => { dsFen(p[0], p[1], 2, 21, 'south', 2, 3); dsFen(p[0], p[1], 8, 21, 'south', 2, p[0] < 10 ? 0 : 1) })
  ;[[5, 6], [10, 11], [15, 16], [20, 21], [25, 26]].forEach((p, i) => { dsFen(p[0], p[1], 2, 3, 'north', 2, 1); dsFen(p[0], p[1], 8, 3, 'north', 2, i % 2 ? 0 : 3) })
  ;[[6, 7], [11, 12], [17, 18]].forEach(p => { dsFen(p[0], p[1], 2, 3, 'west', 2, 1); dsFen(p[0], p[1], 8, 3, 'west', 2, 0); dsFen(p[0], p[1], 2, 28, 'east', 2, 1); dsFen(p[0], p[1], 8, 28, 'east', 2, p[0] == 11 ? 2 : 0) })
  // arcades sur rue, balcon
  F(3, 0, 22, 28, 0, 24, C); dsArcade(3, 28, 24, 0, true, C, SS); F(3, 1, 22, 3, 5, 23, B); F(28, 1, 22, 28, 5, 23, B)
  for (var x = 3; x <= 28; x++) for (var z = 22; z <= 24; z++) S(x, 6, z, z == 24 ? C : (x % 2 ? DSX : DSA))
  for (var x = 4; x <= 27; x++) S(x, 7, 24, (x - 3) % 3 ? SW : C); F(3, 7, 22, 3, 7, 24, C); F(28, 7, 22, 28, 7, 24, C)
  F(3, 0, 25, 28, 0, 25, SS + '[facing=north,half=bottom,shape=straight]')
  ;[5, 11, 20, 26].forEach(x => S(x, 5, 23, DSLH)); ;[5, 9, 21, 25].forEach(x => F(x, 1, 22, x + 1, 1, 22, 'minecraft:smooth_sandstone_stairs[facing=north,half=bottom,shape=straight]'))
  S(13, 4, 22, 'minecraft:red_wall_banner[facing=south]'); S(18, 4, 22, 'minecraft:yellow_wall_banner[facing=south]')
  S(8, 7, 22, 'minecraft:potted_dead_bush'); S(23, 7, 23, 'minecraft:decorated_pot'); S(14, 7, 23, MAT('acacia_chair', 'south'))
  // tour de l'horloge (angle sud-ouest, au-dessus du toit)
  W(3, 17, 7, 21, 13, 19, B); ;[[3, 17], [7, 17], [3, 21], [7, 21]].forEach(p => F(p[0], 13, p[1], p[0], 19, p[1], C))
  ;[[5, 17], [5, 21], [3, 19], [7, 19]].forEach(p => F(p[0], 17, p[1], p[0], 18, p[1], AIR))
  F(4, 19, 18, 6, 19, 20, B); S(5, 18, 19, 'minecraft:bell[attachment=ceiling,facing=south]')
  S(5, 15, 21, 'supplementaries:clock_block[facing=south]'); S(5, 15, 17, 'supplementaries:clock_block[facing=north]'); S(3, 15, 19, 'supplementaries:clock_block[facing=west]'); S(7, 15, 19, 'supplementaries:clock_block[facing=east]')
  F(3, 20, 17, 7, 20, 21, 'minecraft:smooth_sandstone_slab[type=bottom]'); F(4, 20, 18, 6, 20, 20, C); S(5, 21, 19, CH); S(5, 22, 19, 'minecraft:lightning_rod')
  ;[[3, 17], [7, 17], [3, 21], [7, 21]].forEach(p => S(p[0], 20, p[1], SW))
  // toit : reservoir, mat de drapeau, antenne
  F(24, 13, 6, 25, 14, 7, 'minecraft:barrel[facing=up,open=false]'); S(20, 13, 5, 'minecraft:lightning_rod'); F(16, 13, 4, 16, 18, 4, DSF); F(17, 17, 4, 18, 18, 4, 'minecraft:red_wool'); S(18, 17, 4, AIR)
  S(12, 13, 18, 'minecraft:cauldron'); F(9, 13, 6, 10, 13, 6, 'minecraft:smooth_sandstone_slab[type=bottom]')
  // abords
  dsDalle(0, 26, 31, 31, [DSJ, 'minecraft:cut_sandstone', 'minecraft:sand', DSJ])
  dsPalmier(1, 27, 8); dsPalmier(30, 27, 7, true); dsCactus(30, 8, 2)
  S(8, 0, 28, 'minecraft:decorated_pot'); S(23, 0, 28, 'minecraft:decorated_pot'); bgBanc(13, 29, 'south', 2); bgBanc(17, 29, 'south', 2)
  dsCactus(1, 1, 2); dsCactus(30, 1, 3); dsCactus(30, 16, 2)
  dsVeg(0, 0, 31, 31, 0.3)
}

// ================= SOUK (marche couvert : echoppes peintes, velums, fontaine seche, porte monumentale) =================
function dsSouk() {
  DST = {}
  var C = 'minecraft:cut_sandstone', SS = 'minecraft:smooth_sandstone_stairs'
  dsSol(0, 0, 31, 31)
  dsDalle(1, 1, 30, 27, ['minecraft:packed_mud', DSJ, 'minecraft:sand', 'minecraft:packed_mud', 'minecraft:mud_bricks'])
  var murs = [DSAB, DSJ, 'minecraft:terracotta', 'minecraft:light_blue_terracotta', 'minecraft:orange_terracotta', DSAB, 'minecraft:white_terracotta', DSJ, 'minecraft:light_blue_terracotta', 'minecraft:terracotta', DSAB]
  var toiles = ['red', 'orange', 'yellow', 'white', 'green', 'red', 'blue', 'orange', 'yellow', 'white', 'red']
  // echoppe : (x1,z1,x2,z2) ouverte du cote f, marchandise selon t
  function echoppe(x1, z1, x2, z2, f, t, i) {
    var m = murs[i % murs.length]
    F(x1, 0, z1, x2, 0, z2, DSA)
    for (var y = 1; y <= 5; y++) for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) {
      var bord = x == x1 || x == x2 || z == z1 || z == z2; if (!bord) continue
      var ouvert = (f == 'south' && z == z2) || (f == 'north' && z == z1) || (f == 'east' && x == x2) || (f == 'west' && x == x1)
      if (ouvert && y <= 3 && !((x == x1 || x == x2) && (f == 'south' || f == 'north')) && !((z == z1 || z == z2) && (f == 'east' || f == 'west'))) continue
      S(x, y, z, dsM(m))
    }
    F(x1, 6, z1, x2, 6, z2, 'minecraft:packed_mud'); for (var x = x1; x <= x2; x++) { S(x, 7, z1, dsM(m)); S(x, 7, z2, dsM(m)) } for (var z = z1; z <= z2; z++) { S(x1, 7, z, dsM(m)); S(x2, 7, z, dsM(m)) }
    var aw = 'supplementaries:awning_' + toiles[i % toiles.length] + '[facing=' + f + ']'
    if (f == 'south') F(x1, 4, z2 + 1, x2, 4, z2 + 1, aw); else if (f == 'north') F(x1, 4, z1 - 1, x2, 4, z1 - 1, aw); else if (f == 'east') F(x2 + 1, 4, z1, x2 + 1, 4, z2, aw); else F(x1 - 1, 4, z1, x1 - 1, 4, z2, aw)
    // comptoir sur le devant, marchandise au fond
    var ix1 = x1 + 1, ix2 = x2 - 1, iz1 = z1 + 1, iz2 = z2 - 1
    function fond(b, n) { for (var k = 0; k < n; k++) { var x = ix1 + Math.floor(R() * (ix2 - ix1 + 1)), z = iz1 + Math.floor(R() * (iz2 - iz1 + 1)); var av = (f == 'south' && z == iz2) || (f == 'north' && z == iz1) || (f == 'east' && x == ix2) || (f == 'west' && x == ix1); if (!av) SA(x, 1, z, typeof b == 'string' ? b : choix(b)) } }
    if (f == 'south' || f == 'north') { var zc = f == 'south' ? iz2 : iz1; for (var x = ix1; x <= ix2; x++) if (R() > 0.25) S(x, 1, zc, 'minecraft:acacia_slab[type=top]') }
    else { var xc = f == 'east' ? ix2 : ix1; for (var z = iz1; z <= iz2; z++) if (R() > 0.25) S(xc, 1, z, 'minecraft:acacia_slab[type=top]') }
    if (t == 'poterie') fond(['minecraft:decorated_pot', 'minecraft:decorated_pot', 'minecraft:flower_pot', 'minecraft:potted_dead_bush'], 10)
    else if (t == 'epices') fond(['supplementaries:jar', 'supplementaries:sack', 'minecraft:barrel[facing=up,open=true]', 'minecraft:potted_red_mushroom'], 9)
    else if (t == 'tapis') { fond(['minecraft:red_wool', 'minecraft:orange_wool', 'minecraft:yellow_wool', 'minecraft:blue_wool'], 6); fond(['minecraft:red_carpet', 'minecraft:orange_carpet', 'minecraft:magenta_carpet'], 5) }
    else if (t == 'lampes') { fond(['minecraft:lantern[hanging=false]', 'minecraft:soul_lantern[hanging=false]', 'minecraft:chain[axis=y]'], 8) }
    else if (t == 'metal') fond(['minecraft:cauldron', 'minecraft:anvil[facing=north]', 'minecraft:chain[axis=x]', 'minecraft:iron_bars', 'minecraft:grindstone[face=floor,facing=north]'], 7)
    else if (t == 'vivres') fond(['farmersdelight:carrot_crate', 'farmersdelight:potato_crate', 'minecraft:melon', 'minecraft:pumpkin', 'minecraft:hay_block[axis=y]'], 8)
    else if (t == 'tissus') fond(['minecraft:white_wool', 'minecraft:light_blue_wool', 'minecraft:cyan_wool', 'minecraft:white_carpet'], 9)
    else fond(['supplementaries:sack', 'minecraft:chest[facing=north]', 'minecraft:barrel[facing=up,open=false]'], 6)
    S(Math.floor((x1 + x2) / 2), 5, Math.floor((z1 + z2) / 2), DSLH)
  }
  // rangee du fond (5 echoppes) et rangees laterales (3 + 3)
  var types = ['poterie', 'epices', 'tapis', 'lampes', 'metal', 'vivres', 'tissus', 'bazar', 'epices', 'poterie', 'tapis']
  ;[[1, 6], [7, 12], [13, 18], [19, 24], [25, 30]].forEach((p, i) => echoppe(p[0], 1, p[1], 7, 'south', types[i], i))
  ;[[10, 14], [15, 19], [20, 24]].forEach((p, i) => { echoppe(1, p[0], 6, p[1], 'east', types[5 + i], 5 + i); echoppe(25, p[0], 30, p[1], 'west', types[(8 + i) % 11], 8 + i) })
  // halle centrale : poteaux, velum raye dechire
  ;[9, 13, 18, 22].forEach(x => [10, 16, 22].forEach(z => F(x, 0, z, x, 5, z, DSL)))
  ;[10, 16, 22].forEach(z => F(9, 6, z, 22, 6, z, DSX)); ;[9, 13, 18, 22].forEach(x => { F(x, 6, 11, x, 6, 15, DSZ); F(x, 6, 17, x, 6, 21, DSZ) })
  var bandes = ['red', 'white', 'orange', 'white']
  for (var x = 9; x <= 22; x++) for (var z = 10; z <= 22; z++) { SA(x, 6, z, 'minecraft:' + bandes[Math.floor(x / 2) % 4] + '_wool') }
  ;[[11, 13], [20, 13], [11, 19], [20, 19]].forEach(p => { S(p[0], 5, p[1], DSLH); S(p[0], 6, p[1], 'minecraft:chain[axis=y]') })
  // fontaine seche octogonale
  F(14, 0, 14, 17, 0, 18, C); F(15, 0, 13, 16, 0, 19, C); F(13, 0, 15, 18, 0, 17, C)
  F(15, 0, 15, 16, 0, 17, 'minecraft:cyan_glazed_terracotta[facing=north]'); S(15, 1, 16, 'minecraft:sandstone_wall'); S(16, 1, 16, 'minecraft:sandstone_wall'); S(15, 2, 16, 'minecraft:smooth_sandstone_slab[type=bottom]'); S(16, 2, 16, 'minecraft:smooth_sandstone_slab[type=bottom]')
  ;[[14, 14], [17, 14], [14, 18], [17, 18], [13, 15], [18, 15], [13, 17], [18, 17], [15, 13], [16, 13], [15, 19], [16, 19], [13, 16], [18, 16]].forEach(p => S(p[0], 1, p[1], 'minecraft:smooth_sandstone_slab[type=bottom]'))
  S(16, 1, 15, 'minecraft:azalea_leaves[persistent=true]'); S(15, 1, 17, 'minecraft:light_gray_carpet')
  // etals libres, tapis au sol, charrette renversee
  ;[[10, 12], [20, 12], [10, 20], [16, 21]].forEach((p, i) => { S(p[0], 0, p[1], 'mcwfurnitures:acacia_table'); S(p[0] + 1, 0, p[1], 'mcwfurnitures:acacia_table'); S(p[0], 1, p[1], choix(['minecraft:decorated_pot', 'supplementaries:jar', 'minecraft:melon'])); S(p[0] + 1, 1, p[1], choix(['supplementaries:sack', 'minecraft:candle[candles=3,lit=false]', 'minecraft:flower_pot'])) })
  F(11, 0, 17, 12, 0, 19, 'minecraft:red_carpet'); F(19, 0, 16, 21, 0, 17, 'minecraft:orange_carpet'); S(11, 0, 18, 'minecraft:yellow_carpet')
  F(19, 0, 20, 21, 0, 21, 'minecraft:acacia_slab[type=bottom]'); S(19, 1, 20, 'minecraft:acacia_trapdoor[facing=west,half=bottom,open=true]'); S(22, 0, 19, 'supplementaries:sack'); S(21, 0, 19, 'minecraft:pumpkin')
  for (var i = 0; i < 18; i++) SA(8 + Math.floor(R() * 16), 0, 9 + Math.floor(R() * 15), choix(['minecraft:white_carpet', 'supplementaries:sack', 'minecraft:decorated_pot', 'minecraft:dead_bush', 'minecraft:light_gray_carpet']))
  // porte monumentale sur le boulevard (bab) : deux tours et arc
  ;[[8, 10], [21, 23]].forEach(t => { F(t[0], 0, 25, t[1], 9, 27, DSJ); F(t[0], 10, 25, t[1], 10, 27, C); ;[t[0], t[1]].forEach(x => [25, 27].forEach(z => S(x, 11, z, 'minecraft:sandstone_wall'))) })
  F(11, 6, 25, 20, 9, 27, DSJ); F(11, 10, 25, 20, 10, 27, C); for (var x = 12; x <= 19; x += 2) S(x, 11, 25, 'minecraft:sandstone_wall')
  ;[25, 26, 27].forEach(z => { S(11, 5, z, SS + '[facing=west,half=top,shape=straight]'); S(20, 5, z, SS + '[facing=east,half=top,shape=straight]'); S(12, 6, z, SS + '[facing=west,half=top,shape=straight]'); S(19, 6, z, SS + '[facing=east,half=top,shape=straight]') })
  F(13, 6, 25, 18, 6, 27, AIR)
  for (var x = 12; x <= 19; x++) [25, 27].forEach(z => S(x, 8, z, (x % 2) ? 'minecraft:light_blue_glazed_terracotta[facing=south]' : 'minecraft:white_glazed_terracotta[facing=south]'))
  ;[[9, 4], [22, 4]].forEach(p => { S(p[0], p[1] + 2, 27, GP); S(p[0], p[1] + 3, 27, GP) })
  S(15, 6, 26, DSLH); S(16, 6, 26, DSLH)
  // parvis : charrette, jarres, palmiers
  dsDalle(0, 28, 31, 31, [DSJ, 'minecraft:sand', 'minecraft:cut_sandstone'])
  F(3, 0, 29, 5, 0, 30, 'minecraft:acacia_slab[type=top]'); S(3, 1, 29, 'minecraft:hay_block[axis=y]'); S(4, 1, 30, 'supplementaries:sack'); S(2, 0, 29, 'minecraft:acacia_trapdoor[facing=west,half=bottom,open=true]'); S(6, 0, 30, 'minecraft:acacia_trapdoor[facing=east,half=bottom,open=true]')
  ;[25, 26, 28].forEach(x => S(x, 0, 30, 'minecraft:decorated_pot')); S(27, 0, 29, 'minecraft:flower_pot')
  dsPalmier(7, 30, 7); dsPalmier(24, 30, 8, true)
  dsCactus(31, 3, 2); dsCactus(0, 26, 3)
  dsVeg(0, 0, 31, 31, 0.25)
}

// ================= HABITAT EN GRADINS (pueblo : 4 maisons empilees en terrasses, echelles, toits-terrasses) =================
function dsPueblo() {
  DST = {}
  var B = DSAB, lits = ['red', 'orange', 'yellow', 'brown'], murs = [DSAB, 'minecraft:smooth_sandstone', DSAB, 'minecraft:terracotta']
  dsSol(0, 0, 31, 31)
  ;[2, 9, 16, 23].forEach((o, i) => {
    var m = murs[i]
    dsBloc(o, 6, o + 7, 25, 0, m, { toit: true, sans: ['north', 'east', 'west'] })
    dsBloc(o, 6, o + 7, 20, 6, m, { toit: true, sans: ['north', 'east', 'west'] })
    dsBloc(o, 6, o + 7, 14, 12, m, { toit: true, sans: ['north', 'east', 'west'] })
    if (i == 2) { dsBloc(o, 6, o + 7, 10, 18, m, { toit: true, sans: ['north', 'east', 'west'] }); PORTE(o + 1, 19, 10, DSP, 'south', 'left', 'false'); var c3 = cadre(o + 1, 7, o + 6, 9, 'north', 18); piece(c3, 'grenier', 1); dsFen(o + 4, o + 5, 20, 10, 'south', 2, 0) }
    // niveau 0 : sejour, cuisine, chambre
    F(o + 1, 1, 20, o + 6, 5, 20, m); F(o + 1, 1, 14, o + 6, 5, 14, m)
    var c = cadre(o + 1, 21, o + 6, 24, 'south', 0); piece(c, i % 2 ? 'salle' : 'salon', i == 1 ? 1 : 0); c.porte(DSP)
    c = cadre(o + 1, 15, o + 6, 19, 'south', 0); piece(c, 'cuisine', i % 2); c.porte(DSP)
    c = cadre(o + 1, 7, o + 6, 13, 'north', 0); piece(c, 'chambre', 0); S(o + 6, 1, 13, AIR)
    PORTE(o + 3, 1, 25, DSP, 'south', i % 2 ? 'right' : 'left', 'false'); S(o + 3, 0, 26, 'minecraft:mud_brick_stairs[facing=north,half=bottom,shape=straight]')
    dsFen(o + 5, o + 6, 2, 25, 'south', 2, i == 3 ? 2 : 0); dsFen(o + 1, o + 1, 2, 25, 'south', 2, 1)
    // niveau 1 : sejour et chambre
    F(o + 1, 7, 15, o + 6, 11, 15, m)
    c = cadre(o + 1, 16, o + 6, 19, 'south', 6); piece(c, 'salon', 1); c.porte(DSP)
    c = cadre(o + 1, 7, o + 6, 14, 'north', 6); piece(c, 'chambre', i % 2); S(o + 6, 7, 14, AIR)
    PORTE(o + 2, 7, 20, DSP, 'south', 'left', 'false'); dsFen(o + 4, o + 4, 8, 20, 'south', 2, i == 0 ? 1 : 3)
    // niveau 2
    c = cadre(o + 1, 7, o + 6, 13, 'north', 12); piece(c, i == 3 ? 'bureau' : 'salle', 0)
    PORTE(o + 1, 13, 14, DSP, 'south', 'left', 'false'); dsFen(o + 4, o + 4, 14, 14, 'south', 2, i == 1 ? 2 : 3)
    // echelles de pueblo entre terrasses (vers le niveau superieur)
    F(o + 5, 7, 21, o + 5, 12, 21, 'minecraft:ladder[facing=south]'); S(o + 5, 13, 20, AIR)
    F(o + 6, 13, 15, o + 6, 18, 15, 'minecraft:ladder[facing=south]'); S(o + 6, 19, 14, AIR)
    // terrasses : mobilier, jarres, linge, reservoirs
    S(o + 2, 7, 23, MAT('acacia_chair', 'south')); S(o + 3, 7, 23, 'mcwfurnitures:acacia_table'); S(o + 3, 8, 23, choix(['minecraft:candle[candles=2,lit=false]', 'minecraft:potted_dead_bush', 'supplementaries:jar']))
    S(o + 6, 7, 24, 'minecraft:decorated_pot'); S(o + 1, 7, 21, 'minecraft:potted_cactus')
    F(o + 1, 13, 17, o + 1, 14, 17, DSF); F(o + 4, 13, 17, o + 4, 14, 17, DSF); F(o + 2, 14, 17, o + 3, 14, 17, 'minecraft:chain[axis=x]'); S(o + 2, 13, 18, 'minecraft:white_carpet'); if (R() < 0.6) S(o + 3, 13, 19, 'minecraft:light_blue_carpet')
    S(o + 2, 19, 12, 'minecraft:barrel[facing=up,open=false]'); S(o + 2, 20, 12, 'minecraft:barrel[facing=up,open=false]'); S(o + 5, 19, 8, 'minecraft:lightning_rod')
    // four exterieur et petite cour fermee devant chaque maison
    F(o, 0, 27, o, 1, 31, m); F(o + 7, 0, 27, o + 7, 1, 31, m); F(o + 1, 0, 31, o + 6, 1, 31, m); F(o + 3, 0, 31, o + 4, 1, 31, AIR); S(o + 3, 0, 31, 'minecraft:acacia_fence_gate[facing=south,open=' + (i % 2 ? 'true' : 'false') + ',in_wall=false]')
    if (i % 2 == 0) { F(o + 5, 0, 28, o + 6, 1, 29, 'minecraft:packed_mud'); S(o + 5, 1, 28, AIR); S(o + 5, 0, 28, 'minecraft:campfire[lit=false,facing=west]'); S(o + 5, 2, 29, 'minecraft:mud_brick_slab[type=bottom]'); S(o + 6, 2, 28, 'minecraft:mud_brick_slab[type=bottom]'); dsLibre(o + 5, 28); dsLibre(o + 6, 29) }
    else { S(o + 1, 0, 28, 'minecraft:water_cauldron[level=1]'); S(o + 6, 0, 28, 'minecraft:decorated_pot'); S(o + 6, 0, 30, 'supplementaries:sack'); dsLibre(o + 1, 28); dsLibre(o + 6, 29) }
    dsPapiers(o + 1, 7, o + 6, 24, 1, 3)
  })
  // details : ristras (piments) et pots, antennes, linge entre maisons, voiture dans la cour
  S(19, 4, 26, 'minecraft:red_wall_banner[facing=south]'); S(5, 10, 21, 'minecraft:orange_wall_banner[facing=south]')
  bgVoiture(26, 28, 'x', 'light_blue', 1, true)
  dsLibre(26, 28); dsLibre(29, 29)
  dsPalmier(1, 2, 8); dsPalmier(30, 1, 7); dsOlivier(15, 2); dsAcacia(6, 1)
  dsCactus(0, 5, 2); dsCactus(0, 16, 2)
  dsVeg(0, 0, 31, 31, 0.3)
}
