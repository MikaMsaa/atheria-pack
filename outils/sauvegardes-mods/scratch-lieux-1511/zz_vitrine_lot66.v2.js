// ================= LIEUX DU TRAILER (lot66, 14/11, v2) : centre commercial inonde (C35), camp des Goblini avec cage (C41) =================
// La sortie de Nid (C44) est sur le toit de l'immeuble H du pilote (lot65, hrNid).
// Echelle reelle : sol du lot a y-1, eau de crue y-2..-1 sur un fond a y-3. lbBruit (lot65) donne des taches organiques.

var CM_EAU = 'minecraft:water'
function cmEnduit(x, y, z) { var n = lbBruit(x, y * 2 + z, 3.3), r = R(); return n > 1.1 ? 'minecraft:andesite' : n < -1.2 ? 'minecraft:cyan_terracotta' : r < 0.7 ? 'minecraft:light_gray_concrete' : 'minecraft:smooth_stone' }
// epave noyee : caisse sous l'eau, toit qui affleure (remplacee par un vehicule MTS a l'integration)
function cmEpave(x, z, ax, c) {
  function P(u, v, y, b) { if (ax == 'x') S(x + u, y, z + v, b); else S(x + v, y, z + u, b) }
  for (var u = 0; u < 5; u++) for (var v = 0; v < 3; v++) P(u, v, -2, R() < 0.25 ? 'minecraft:brown_terracotta' : 'minecraft:' + c + '_concrete')
  for (var u = 1; u < 4; u++) for (var v = 0; v < 3; v++) P(u, v, -1, v == 1 ? 'minecraft:' + c + '_terracotta' : 'minecraft:tinted_glass')
}
function cmMangrove(x, z, h) {
  for (var dx = -2; dx <= 2; dx++) for (var dz = -2; dz <= 2; dz++) if (Math.abs(dx) + Math.abs(dz) <= 2 && R() < 0.75) { S(x + dx, -2, z + dz, 'minecraft:mangrove_roots[waterlogged=true]'); if (Math.abs(dx) + Math.abs(dz) <= 1) S(x + dx, -1, z + dz, 'minecraft:mangrove_roots[waterlogged=true]') }
  F(x, 0, z, x, h, z, 'minecraft:mangrove_log[axis=y]')
  for (var dx = -3; dx <= 3; dx++) for (var dz = -3; dz <= 3; dz++) for (var dy = -1; dy <= 2; dy++) if (dx * dx + dz * dz + dy * dy * 2 <= 11 && R() < 0.9) SA(x + dx, h + dy, z + dz, 'minecraft:mangrove_leaves[distance=1,persistent=true,waterlogged=false]')
}

// ---------------- centre commercial inonde : galerie marchande sous verriere, deux grands magasins aux bouts, parking noye ----------------
function cmCentreInonde() {
  var N = 127
  // terrain : remblai, prairie haute, cuvette inondee aux rives naturelles
  F(0, -6, 0, N, -2, N, 'minecraft:dirt'); F(0, -1, 0, N, -1, N, 'minecraft:grass_block[snowy=false]')
  for (var x = 0; x <= N; x++) for (var z = 0; z <= N; z++) {
    var e = Math.min(x, N - x, z, N - z) + lbBruit(x, z, 5.5) * 4 - 8
    if (e < -1) { var r = R(); if (r < 0.25) SA(x, 0, z, choix(['minecraft:short_grass', 'minecraft:short_grass', 'minecraft:fern', 'minecraft:tall_grass[half=lower]'])); continue }
    if (e < 1) { S(x, -1, z, lbBruit(x, z, 9) > 0 ? 'minecraft:mud' : 'minecraft:coarse_dirt'); if (R() < 0.3) { SA(x, 0, z, 'minecraft:sugar_cane[age=0]'); SA(x, 1, z, 'minecraft:sugar_cane[age=0]') } continue }
    var parking = x >= 12 && x <= 115 && z >= 6 && z <= 31
    S(x, -3, z, parking ? (R() < 0.85 ? 'minecraft:gray_concrete' : 'minecraft:cracked_stone_bricks') : 'minecraft:mud')
    S(x, -2, z, CM_EAU); S(x, -1, z, CM_EAU)
    if (parking && z >= 9 && z <= 28 && (x - 12) % 4 == 0 && z != 18 && z != 19) S(x, -3, z, 'minecraft:white_concrete')
    if (lbBruit(x, z, 7) > 1.2 && R() < 0.5) SA(x, 0, z, 'minecraft:lily_pad'); else if (R() < 0.05) S(x, -2, z, 'minecraft:seagrass')
  }
  // gros oeuvre : 92 x 60 ; galerie centrale est-ouest sous verriere en berceau ; deux niveaux (fond y-3, etage y5, toit y11) ; magasins d'angle jusqu'a y17
  var X1 = 18, X2 = 109, Z1 = 36, Z2 = 95, GZ1 = 58, GZ2 = 73
  for (var x = X1; x <= X2; x++) for (var z = Z1; z <= Z2; z++) S(x, -3, z, (x + z) % 2 ? 'minecraft:smooth_quartz' : 'minecraft:light_gray_concrete')
  for (var x = X1; x <= X2; x++) for (var z = Z1; z <= Z2; z++) for (var y = -2; y <= 10; y++) if (x == X1 || x == X2 || z == Z1 || z == Z2) S(x, y, z, cmEnduit(x, y, z))
  F(X1 + 1, 5, Z1 + 1, X2 - 1, 5, Z2 - 1, 'minecraft:polished_andesite'); F(X1, 11, Z1, X2, 11, Z2, 'minecraft:smooth_stone')
  F(X1 + 1, 0, Z1 + 1, X2 - 1, 4, Z2 - 1, AIR); F(X1 + 1, 6, Z1 + 1, X2 - 1, 10, Z2 - 1, AIR)
  F(X1, 5, Z1, X2, 5, Z1, 'minecraft:white_concrete'); F(X1, 11, Z1, X2, 11, Z1, 'minecraft:white_concrete')
  ;[Z1, Z2].forEach(z => F(X1, 12, z, X2, 12, z, 'minecraft:smooth_stone_slab[type=bottom,waterlogged=false]')); ;[X1, X2].forEach(x => F(x, 12, Z1, x, 12, Z2, 'minecraft:smooth_stone_slab[type=bottom,waterlogged=false]'))
  // grands magasins d'angle (x18..37 et x90..109), plus hauts, facade aveugle a bandeaux
  ;[[X1, 37], [90, X2]].forEach(m => {
    for (var x = m[0]; x <= m[1]; x++) for (var z = Z1; z <= Z2; z++) for (var y = 11; y <= 17; y++) if (x == m[0] || x == m[1] || z == Z1 || z == Z2) S(x, y, z, y == 14 ? 'minecraft:white_concrete' : cmEnduit(x, y, z))
    F(m[0], 18, Z1, m[1], 18, Z2, 'minecraft:smooth_stone'); F(m[0] + 1, 11, Z1 + 1, m[1] - 1, 17, Z2 - 1, AIR); F(m[0] + 1, 11, Z1 + 1, m[1] - 1, 11, Z2 - 1, 'minecraft:polished_andesite')
    // panneau d'enseigne vide (aucun texte) : cadre rouge, fond gris
    F(m[0] + 4, 13, Z1, m[1] - 4, 16, Z1, 'minecraft:red_concrete'); F(m[0] + 5, 14, Z1, m[1] - 5, 15, Z1, 'minecraft:gray_concrete')
  })
  // facade sud : poteaux tous les 6, vitrines (verre casse), entree principale double hauteur au droit de la galerie
  for (var x = X1 + 1; x < X2; x++) {
    var pot = (x - X1) % 6 == 0
    for (var y = -2; y <= 4; y++) S(x, y, Z1, pot ? 'minecraft:white_concrete' : (y <= -1 ? AIR : R() < 0.35 ? AIR : 'minecraft:light_gray_stained_glass_pane'))
    for (var y = 6; y <= 9; y++) if (!pot && x > 37 && x < 90 && (x - X1) % 6 >= 2 && (x - X1) % 6 <= 4) S(x, y, Z1, R() < 0.3 ? AIR : 'minecraft:glass_pane')
  }
  // marquise en porte-a-faux sur toute la longueur de la galerie, poteaux
  F(38, 5, Z1 - 4, 89, 5, Z1 - 1, 'minecraft:smooth_stone_slab[type=top,waterlogged=false]')
  for (var x = 38; x <= 89; x += 6) F(x, -2, Z1 - 4, x, 4, Z1 - 4, 'minecraft:polished_deepslate_wall')
  for (var x = 70; x <= 80; x++) if (R() < 0.7) S(x, 5, Z1 - 4 + Math.floor(R() * 2), AIR)
  // galerie : vide sur deux niveaux, garde-corps vitres a l'etage, verriere en berceau (arcs d'acier tous les 4, verre entre les arcs)
  F(38, 5, GZ1 + 2, 89, 5, GZ2 - 2, AIR); F(38, 11, GZ1, 89, 11, GZ2, AIR)
  for (var x = 38; x <= 89; x++) { S(x, 6, GZ1 + 1, 'minecraft:glass_pane'); S(x, 6, GZ2 - 1, 'minecraft:glass_pane') }
  var ARC = [[GZ1, 11], [GZ1 + 1, 12], [GZ1 + 2, 13], [GZ1 + 3, 14], [GZ1 + 4, 15], [GZ1 + 5, 15], [GZ1 + 6, 16], [GZ1 + 7, 16], [GZ1 + 8, 16], [GZ1 + 9, 16], [GZ1 + 10, 15], [GZ1 + 11, 15], [GZ1 + 12, 14], [GZ1 + 13, 13], [GZ1 + 14, 12], [GZ1 + 15, 11]]
  for (var x = 38; x <= 89; x++) {
    var arc = (x - 38) % 4 == 0, effondre = x >= 62 && x <= 77 && !arc
    ARC.forEach((a, i) => {
      if (arc) { S(x, a[1], a[0], 'minecraft:polished_deepslate'); if (i > 0 && ARC[i - 1][1] < a[1] - 0) S(x, a[1] - 1, a[0], 'minecraft:polished_deepslate'); if (i < ARC.length - 1 && ARC[i + 1][1] < a[1]) S(x, a[1] - 1, a[0], 'minecraft:polished_deepslate') }
      else if (!effondre && !(x >= 50 && x <= 53 && i >= 3 && i <= 9)) S(x, a[1], a[0], 'minecraft:light_gray_stained_glass_pane')
    })
    // faitage et cheneaux
    if (!effondre) { S(x, 17, GZ1 + 7, 'minecraft:polished_deepslate_slab[type=bottom,waterlogged=false]'); S(x, 17, GZ1 + 8, 'minecraft:polished_deepslate_slab[type=bottom,waterlogged=false]') }
  }
  // verre tombe dans l'eau sous la partie effondree
  for (var i = 0; i < 40; i++) S(62 + Math.floor(R() * 16), -2, GZ1 + 1 + Math.floor(R() * 14), choix(['minecraft:light_gray_stained_glass', 'minecraft:polished_deepslate_slab[type=bottom,waterlogged=true]', 'minecraft:light_gray_concrete']))
  // escaliers mecaniques arretes, de part et d'autre de la galerie
  ;[[44, GZ1 + 3, 1], [83, GZ2 - 3, -1]].forEach(e => {
    for (var i = 0; i < 8; i++) {
      var wl = i < 2 ? 'true' : 'false', xx = e[0] + i * e[2]
      F(xx, -2 + i, e[1], xx, -2 + i, e[1] + 1, 'minecraft:polished_andesite_stairs[facing=' + (e[2] > 0 ? 'east' : 'west') + ',half=bottom,shape=straight,waterlogged=' + wl + ']')
      F(xx, -2, e[1] - 1, xx, -1 + i, e[1] - 1, 'minecraft:light_gray_concrete'); F(xx, -2, e[1] + 2, xx, -1 + i, e[1] + 2, 'minecraft:light_gray_concrete')
    }
  })
  F(52, 5, GZ1 + 2, 53, 5, GZ1 + 4, 'minecraft:polished_andesite'); F(74, 5, GZ2 - 3, 75, 5, GZ2 - 2, 'minecraft:polished_andesite')
  F(52, 6, GZ1 + 1, 53, 6, GZ1 + 1, AIR); F(74, 6, GZ2 - 1, 75, 6, GZ2 - 1, AIR)
  // boutiques des deux cotes de la galerie : cloisons tous les 8, devantures vitrees, rayonnages
  ;[[Z1 + 1, GZ1 - 2, GZ1 - 1], [GZ2 + 2, Z2 - 1, GZ2 + 1]].forEach(c => {
    for (var x = 38; x <= 89; x++) {
      if ((x - 38) % 8 == 0) { for (var y = -2; y <= 10; y++) if (y != 5) F(x, y, c[0], x, y, c[1], cmEnduit(x, y, c[0])); continue }
      var porte = (x - 38) % 8 == 4
      for (var y = -2; y <= 4; y++) S(x, y, c[2], porte && y <= 2 ? AIR : (R() < 0.3 ? AIR : 'minecraft:light_gray_stained_glass_pane'))
      for (var y = 6; y <= 10; y++) S(x, y, c[2], porte && y <= 8 ? AIR : (R() < 0.25 ? AIR : 'minecraft:glass_pane'))
      var zf = c[2] == GZ1 - 1 ? c[0] + 1 : c[1] - 1
      if ((x - 38) % 2 == 1) { S(x, -2, zf, choix(['minecraft:barrel[facing=up,open=false]', 'minecraft:iron_bars', 'supplementaries:sack'])); S(x, 6, zf, choix(['minecraft:iron_bars', 'minecraft:barrel[facing=up,open=true]', 'minecraft:spruce_slab[type=top,waterlogged=false]'])) }
    }
  })
  // effondrement de l'angle sud-est du grand magasin : toit et murs hauts tombes dans l'eau
  for (var x = 96; x <= X2; x++) for (var z = Z1; z <= 48; z++) {
    var cut = (x - 96) * 0.8 + (48 - z) * 0.6 + lbBruit(x, z, 8) * 2
    for (var y = 6; y <= 18; y++) if (y >= 19 - cut) S(x, y, z, AIR)
    if (cut > 4 && R() < 0.35) S(x, -2, z, choix(['minecraft:light_gray_concrete', 'minecraft:smooth_stone', 'minecraft:white_concrete', 'minecraft:cobblestone']))
  }
  for (var i = 0; i < 22; i++) S(95 + Math.floor(R() * 16), -2, Z1 - 1 - Math.floor(R() * 5), choix(['minecraft:light_gray_concrete', 'minecraft:smooth_stone_slab[type=bottom,waterlogged=true]', 'minecraft:white_concrete']))
  // toits : groupes de ventilation, mousse, arbustes et jeunes arbres qui ont pris dans la terre accumulee
  ;[[44, 42], [56, 88], [80, 44], [84, 86], [26, 50], [100, 80]].forEach(p => { var y0 = p[0] < 38 || p[0] > 89 ? 19 : 12; F(p[0], y0, p[1], p[0] + 2, y0 + 1, p[1] + 1, 'create:andesite_casing') })
  for (var x = X1 + 1; x < X2; x++) for (var z = Z1 + 1; z < Z2; z++) {
    var haut = x < 38 || x > 89, y0 = haut ? 19 : 12; if (!haut && z >= GZ1 && z <= GZ2) continue
    var n = lbBruit(x, z, 6.6)
    if (n > 0.6) { S(x, y0 - 1, z, 'minecraft:moss_block'); if (R() < 0.35) SA(x, y0, z, choix(['minecraft:moss_carpet', 'minecraft:short_grass', 'minecraft:azalea', 'minecraft:fern'])) }
  }
  ;[[28, 46], [100, 88], [60, 84]].forEach(t => { var y0 = t[0] < 38 || t[0] > 89 ? 18 : 11; S(t[0], y0, t[1], 'minecraft:moss_block'); OY += y0 + 1; hrArbre(t[0], t[1], false); OY -= y0 + 1 })
  // lierre sur les facades, mangroves dans le parking, arbres sur les rives
  function lierre(x, z, ytop, f) { var hv = 3 + Math.floor(R() * 10); for (var y = ytop; y >= ytop - hv && y >= 5; y--) SA(x, y, z, 'minecraft:vine[east=' + (f == 'east') + ',north=' + (f == 'north') + ',south=' + (f == 'south') + ',up=false,west=' + (f == 'west') + ']') }
  for (var x = X1; x <= X2; x++) { if (lbBruit(x, 0, 2) > -0.2) lierre(x, Z1 - 1, x < 38 || x > 89 ? 17 : 10, 'south') }
  for (var z = Z1; z <= Z2; z++) { if (lbBruit(0, z, 3) > -0.3) lierre(X1 - 1, z, 17, 'east'); if (lbBruit(9, z, 4) > -0.3) lierre(X2 + 1, z, 17, 'west') }
  ;[[16, 14, 7], [33, 26, 6], [62, 12, 8], [88, 25, 6], [108, 14, 7], [10, 70, 7], [116, 100, 6], [70, 108, 7], [30, 110, 6]].forEach(t => cmMangrove(t[0], t[1], t[2]))
  ;[[3, 50], [124, 40], [4, 120], [122, 122], [60, 124], [90, 3], [5, 5]].forEach(t => hrArbre(t[0], t[1], false))
  // pylone d'enseigne (vide) a l'entree du parking, lampadaires, carcasses noyees
  F(10, -2, 30, 11, 20, 30, 'minecraft:light_gray_concrete'); F(9, 14, 30, 12, 20, 30, 'minecraft:red_concrete'); F(10, 15, 30, 11, 19, 30, 'minecraft:gray_concrete')
  ;[20, 40, 60, 80, 100].forEach(x => { F(x, -2, 19, x, 5, 19, 'minecraft:polished_deepslate_wall'); S(x, 6, 19, 'minecraft:polished_deepslate_slab[type=bottom,waterlogged=false]') })
  cmEpave(14, 10, 'z', 'white'); cmEpave(22, 22, 'z', 'red'); cmEpave(38, 10, 'z', 'black'); cmEpave(50, 24, 'x', 'light_gray'); cmEpave(70, 10, 'z', 'blue'); cmEpave(86, 22, 'z', 'white'); cmEpave(98, 10, 'z', 'gray')
}

// ---------------- camp des Goblini : plates-formes noyees dans la canopee de grands arbres, cage a dinosaure au sol ----------------
var GB_F = 'minecraft:jungle_leaves[distance=1,persistent=true,waterlogged=false]', GB_C = 'minecraft:oak_leaves[distance=1,persistent=true,waterlogged=false]'
function gbBambou(x, z, h) { for (var y = 0; y < h; y++) SA(x, y, z, 'minecraft:bamboo[age=1,leaves=' + (y >= h - 1 ? 'large' : y >= h - 3 ? 'small' : 'none') + ',stage=0]') }
function gbBoule(x, y, z, r, f) { for (var dx = -r; dx <= r; dx++) for (var dz = -r; dz <= r; dz++) for (var dy = -2; dy <= 2; dy++) if (dx * dx + dz * dz + dy * dy * 3 <= r * r + 1 && R() < 0.92) SA(x + dx, y + dy, z + dz, f || GB_F) }
function gbLiane(x, y, z, f, n) { for (var i = 0; i < n; i++) SA(x, y - i, z, 'minecraft:vine[east=' + (f == 'east') + ',north=' + (f == 'north') + ',south=' + (f == 'south') + ',up=false,west=' + (f == 'west') + ']') }
// grand arbre : tronc 2x2, contreforts, branches a mi-hauteur avec couronnes basses (qui cachent les plates-formes), couronne haute large
function gbArbre(x, z, h, branches) {
  F(x, -1, z, x + 1, h, z + 1, 'minecraft:jungle_log[axis=y]')
  ;[[-1, 0, 'x'], [2, 1, 'x'], [0, -1, 'z'], [1, 2, 'z'], [-2, 0, 'x'], [3, 1, 'x']].forEach((c, i) => { var hh = i < 4 ? 2 + Math.floor(R() * 2) : 0; F(x + c[0], 0, z + c[1], x + c[0], hh, z + c[1], 'minecraft:jungle_log[axis=y]') })
  for (var y = 1; y < h - 3; y++) { if (R() < 0.45) SA(x - 1, y, z + 1, 'minecraft:vine[east=true,north=false,south=false,up=false,west=false]'); if (R() < 0.45) SA(x + 2, y, z, 'minecraft:vine[east=false,north=false,south=false,up=false,west=true]'); }
  ;(branches || []).forEach(b => {
    var dx = b[0], dz = b[1], L = b[2], y = b[3]
    for (var i = 1; i <= L; i++) {
      var bx = x + (dx > 0 ? 1 : 0) + dx * i, by = y + Math.floor(i / 3), bz = z + (dz > 0 ? 1 : 0) + dz * i
      S(bx, by, bz, 'minecraft:jungle_log[axis=' + (dx != 0 ? 'x' : 'z') + ']')
      if (i >= 2 && R() < 0.5) { if (dx != 0) gbLiane(bx, by, bz - 1, 'south', 2 + Math.floor(R() * 5)); else gbLiane(bx - 1, by, bz, 'east', 2 + Math.floor(R() * 5)) }
    }
    var ex = x + (dx > 0 ? 1 : 0) + dx * L, ez = z + (dz > 0 ? 1 : 0) + dz * L, ey = y + Math.floor(L / 3)
    gbBoule(ex, ey + 2, ez, 4)
  })
  for (var dx = -8; dx <= 9; dx++) for (var dz = -8; dz <= 9; dz++) for (var dy = -2; dy <= 3; dy++) { var ex = dx - 0.5, ez = dz - 0.5, r2 = ex * ex + ez * ez; if (r2 + dy * dy * 6 <= 70 + lbBruit(x + dx, z + dz, 1) * 10 && R() < 0.93) SA(x + dx, h + dy, z + dz, GB_F) }
}
function gbPlateforme(x, z, y, r) {
  for (var dx = -r; dx <= r + 1; dx++) for (var dz = -r; dz <= r + 1; dz++) {
    var bord = dx == -r || dx == r + 1 || dz == -r || dz == r + 1
    if ((dx == 0 || dx == 1) && (dz == 0 || dz == 1)) continue
    S(x + dx, y, z + dz, lbBruit(x + dx, z + dz, 3) > 0.8 ? 'minecraft:spruce_planks' : 'minecraft:bamboo_planks')
    if (bord) S(x + dx, y + 1, z + dz, 'minecraft:bamboo_fence')
  }
  ;[[-r, -r], [r + 1, -r], [-r, r + 1], [r + 1, r + 1]].forEach(c => F(x + c[0], y - 3, z + c[1], x + c[0], y - 1, z + c[1], 'minecraft:stripped_jungle_log[axis=y]'))
}
function gbHutte(x, z, y, w, d, porte) {
  W(x, z, x + w - 1, z + d - 1, y + 1, y + 3, 'minecraft:bamboo_block[axis=y]')
  F(x + 1, y + 1, z + 1, x + w - 2, y + 3, z + d - 2, AIR)
  S(x + porte[0], y + 1, z + porte[1], AIR); S(x + porte[0], y + 2, z + porte[1], AIR)
  for (var dx = -1; dx <= w; dx++) for (var dz = -1; dz <= d; dz++) { S(x + dx, y + 4, z + dz, 'minecraft:bamboo_mosaic_slab[type=bottom,waterlogged=false]'); if (R() < 0.85) SA(x + dx, y + 5, z + dz, R() < 0.7 ? GB_F : 'minecraft:moss_carpet') }
  S(x + 1, y + 1, z + 1, 'minecraft:barrel[facing=up,open=false]'); SA(x + w - 2, y + 1, z + d - 2, 'supplementaries:sack')
}
function gbPasserelle(x1, z1, x2, z2, y) {
  var n = Math.max(Math.abs(x2 - x1), Math.abs(z2 - z1)), lx = Math.abs(x2 - x1) >= Math.abs(z2 - z1)
  for (var i = 0; i <= n; i++) {
    var t = i / n, x = Math.round(x1 + (x2 - x1) * t), z = Math.round(z1 + (z2 - z1) * t), s = Math.round(Math.sin(t * Math.PI) * 1.4)
    for (var k = 0; k <= 1; k++) S(x + (lx ? 0 : k), y - s, z + (lx ? k : 0), 'minecraft:spruce_slab[type=bottom,waterlogged=false]')
    S(x + (lx ? 0 : -1), y - s + 1, z + (lx ? -1 : 0), 'minecraft:bamboo_fence'); S(x + (lx ? 0 : 2), y - s + 1, z + (lx ? 2 : 0), 'minecraft:bamboo_fence')
  }
}
function gbCamp() {
  var N = 79
  F(0, -6, 0, N, -2, N, 'minecraft:dirt')
  for (var x = 0; x <= N; x++) for (var z = 0; z <= N; z++) { var n = lbBruit(x, z, 2.7); S(x, -1, z, n > 0.9 ? 'minecraft:moss_block' : n < -1.1 ? 'minecraft:coarse_dirt' : n < -0.6 ? 'minecraft:rooted_dirt' : 'minecraft:podzol[snowy=false]') }
  // grands arbres (~30 de haut) ; branches a y17..19 dont les couronnes noient les plates-formes (y14)
  gbArbre(16, 16, 30, [[-1, 0, 6, 16], [0, -1, 5, 19], [1, 0, 5, 18]])
  gbArbre(44, 12, 28, [[0, -1, 5, 17], [1, 0, 6, 16]])
  gbArbre(58, 40, 31, [[1, 0, 6, 17], [0, 1, 5, 16], [0, -1, 4, 19]])
  gbArbre(24, 50, 29, [[-1, 0, 5, 17], [0, 1, 6, 16]])
  gbArbre(10, 68, 27, [[0, 1, 5, 16]])
  gbArbre(52, 66, 28, [[1, 0, 5, 17], [-1, 0, 4, 18]])
  gbArbre(70, 14, 26, [[0, 1, 5, 16]])
  // plates-formes a y14, huttes sous les feuilles
  gbPlateforme(16, 16, 14, 4); gbHutte(12, 12, 14, 5, 4, [2, 3])
  gbPlateforme(58, 40, 14, 4); gbHutte(60, 42, 14, 4, 4, [0, 2])
  gbPlateforme(24, 50, 14, 4); gbHutte(20, 51, 14, 4, 4, [3, 2])
  gbPlateforme(44, 12, 14, 3)
  gbPasserelle(21, 15, 41, 13, 14); gbPasserelle(46, 16, 57, 35, 14); gbPasserelle(53, 42, 29, 49, 14); gbPasserelle(17, 21, 23, 45, 14)
  for (var y = 0; y < 14; y++) { S(18, y, 16, 'minecraft:ladder[facing=east,waterlogged=false]'); S(26, y, 51, 'minecraft:ladder[facing=east,waterlogged=false]') }
  F(18, 14, 16, 18, 15, 16, AIR); F(26, 14, 51, 26, 15, 51, AIR)
  // vigie dans la couronne du grand arbre
  F(55, 28, 37, 62, 30, 44, AIR); F(56, 27, 38, 61, 27, 43, 'minecraft:bamboo_planks'); W(56, 38, 61, 43, 28, 28, 'minecraft:bamboo_fence'); F(58, 27, 40, 59, 29, 41, 'minecraft:jungle_log[axis=y]')
  for (var y = 15; y < 27; y++) S(60, y, 40, 'minecraft:ladder[facing=east,waterlogged=false]'); S(60, 27, 40, 'minecraft:ladder[facing=east,waterlogged=false]')
  // cage a dinosaure au sol, sous une couronne basse : charpente de rondins, barreaux, porte enchainee cote camp, foin et os
  var C1 = 32, C2 = 46, D1 = 24, D2 = 38, HC = 8
  for (var x = C1; x <= C2; x++) for (var z = D1; z <= D2; z++) {
    var bx = x == C1 || x == C2, bz = z == D1 || z == D2
    if (bx || bz) for (var y = 0; y < HC; y++) S(x, y, z, ((x - C1) % 4 == 0 && bz) || ((z - D1) % 4 == 0 && bx) || ((x == C2 || x == C1) && bz) ? 'minecraft:stripped_jungle_log[axis=y]' : 'minecraft:iron_bars')
    else { S(x, -1, z, lbBruit(x, z, 4) > 0 ? 'minecraft:coarse_dirt' : 'minecraft:mud'); if (R() < 0.06) SA(x, 0, z, choix(['minecraft:hay_block[axis=y]', 'minecraft:bone_block[axis=x]', 'minecraft:bone_block[axis=z]'])) }
  }
  for (var x = C1; x <= C2; x++) { S(x, HC, D1, 'minecraft:stripped_jungle_log[axis=x]'); S(x, HC, D2, 'minecraft:stripped_jungle_log[axis=x]') }
  for (var z = D1 + 2; z < D2; z += 2) F(C1, HC, z, C2, HC, z, 'minecraft:stripped_jungle_log[axis=x]')
  F(C1, 0, 29, C1, 5, 33, 'minecraft:spruce_planks'); for (var y = 0; y <= 5; y += 2) F(C1, y, 29, C1, y, 33, 'minecraft:stripped_spruce_log[axis=z]')
  F(C1 - 1, 2, 30, C1 - 1, 2, 32, 'minecraft:chain[axis=z]')
  S(C2 - 2, 0, D2 - 2, 'minecraft:cauldron'); S(C2 - 3, 0, D2 - 2, 'minecraft:hay_block[axis=y]')
  gbArbre(48, 30, 27, [[-1, 0, 7, 12]])
  // camp au sol : foyer eteint (le trailer amene le feu), bancs de rondins, caisses, sacs
  for (var a = 0; a < 8; a++) S(20 + Math.round(Math.cos(a * Math.PI / 4) * 2), -1, 34 + Math.round(Math.sin(a * Math.PI / 4) * 2), 'minecraft:cobblestone')
  S(20, -1, 34, 'minecraft:coarse_dirt'); S(20, 0, 34, 'minecraft:black_carpet')
  F(16, 0, 32, 16, 0, 33, 'minecraft:stripped_jungle_log[axis=z]'); F(24, 0, 35, 24, 0, 36, 'minecraft:stripped_jungle_log[axis=z]')
  ;[[14, 38], [15, 38], [14, 39], [26, 30], [27, 30]].forEach(p => S(p[0], 0, p[1], choix(['minecraft:barrel[facing=up,open=false]', 'supplementaries:sack', 'minecraft:barrel[facing=up,open=true]'])))
  // sous-bois : bosquets de bambous serres, buissons de feuilles, fougeres ; le camp n'est visible que de l'interieur
  function libre(x, z) { return !(x >= C1 - 2 && x <= C2 + 2 && z >= D1 - 2 && z <= D2 + 2) && !(x >= 12 && x <= 28 && z >= 28 && z <= 40) && !(x >= 14 && x <= 19 && z >= 14 && z <= 19) && !(x >= 22 && x <= 27 && z >= 48 && z <= 53) }
  for (var x = 0; x <= N; x++) for (var z = 0; z <= N; z++) {
    if (!libre(x, z)) continue
    var n = lbBruit(x * 1.3, z * 1.3, 0.4), bordure = Math.min(x, N - x, z, N - z) < 9
    if ((n > 0.7 || (bordure && n > -0.2)) && R() < 0.55) gbBambou(x, z, 9 + Math.floor(R() * 8))
    else if (n < -0.9 && R() < 0.5) { SA(x, 0, z, GB_C); if (R() < 0.4) SA(x, 1, z, GB_C) }
    else if (R() < 0.35) SA(x, 0, z, choix(['minecraft:fern', 'minecraft:fern', 'minecraft:short_grass', 'minecraft:moss_carpet']))
  }
}

var QFIN_LIEUX = function () {
  HB2 = true; FIN = true; THM = THM_HF
  lot(function () { HM = {}; FIN_VOLET = null; FIN_RID = null; hrPilote(); finAncrage() }, 0, 0, 999, 6501, 128, 44)
  THM = null
  lot(function () { HM = {}; FIN_VOLET = null; FIN_RID = null; cmCentreInonde(); finAncrage() }, 160, 0, 999, 3502, 128, 30)
  lot(function () { HM = {}; FIN_VOLET = null; FIN_RID = null; gbCamp(); finAncrage() }, 160, 160, 999, 4102, 80, 40)
  HB2 = false; FIN = false; THM = null; HM = {}
}
function vuesLieux() {
  vue('n_nid_face', 0, 0, 117.5, 27.6, 75, 117.5, 28.5, 84)
  vue('n_nid_trois_quarts', 0, 0, 102, 30, 75, 117, 27, 86)
  vue('n_nid_dos', 0, 0, 125, 31, 98, 117, 27, 86)
  vue('c_paysage', 160, 0, -20, 30, -24, 64, 4, 60)
  vue('c_ras_eau', 160, 0, 40, 0.5, 15, 64, 6, 40)
  vue('c_galerie', 160, 0, 40, 7.6, 65.5, 88, 6, 65.5)
  vue('c_effondrement', 160, 0, 122, 10, 24, 100, 8, 42)
  vue('g_sol_cage', 160, 160, 14, 1.6, 31, 38, 3, 31)
  vue('g_plateformes', 160, 160, 38, 10, 70, 30, 15, 30)
  vue('g_lisiere', 160, 160, -10, 6, 40, 30, 10, 38)
  vue('g_dessus', 160, 160, 40, 55, -14, 40, 6, 40)
}
