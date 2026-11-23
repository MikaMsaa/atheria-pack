// ================= LIEUX DU TRAILER (lot66, 14/11) : centre commercial inonde (C35), camp des Goblini avec cage (C41) =================
// La sortie de Nid (C44) est sur le toit de l'immeuble H du pilote (lot65, hrNid).
// Echelle reelle : sol du lot a y-1, eau de crue y-2..-1 sur un fond a y-3.

var CM_EAU = 'minecraft:water'
function cmEnduit() { var r = R(); return r < 0.6 ? 'minecraft:light_gray_concrete' : r < 0.85 ? 'minecraft:smooth_stone' : r < 0.95 ? 'minecraft:andesite' : 'minecraft:cyan_terracotta' }
// epave de voiture noyee : caisse sous l'eau, toit qui affleure (remplacee par un vehicule MTS a l'integration)
function cmEpave(x, z, ax, c) {
  function P(u, v, y, b) { if (ax == 'x') S(x + u, y, z + v, b); else S(x + v, y, z + u, b) }
  for (var u = 0; u < 5; u++) for (var v = 0; v < 3; v++) P(u, v, -2, R() < 0.2 ? 'minecraft:brown_terracotta' : 'minecraft:' + c + '_concrete')
  for (var u = 1; u < 4; u++) for (var v = 0; v < 3; v++) { P(u, v, -1, v == 1 ? 'minecraft:' + c + '_concrete' : 'minecraft:tinted_glass'); P(u, v, 0, 'minecraft:' + c + '_carpet') }
}
function cmMangrove(x, z, h) {
  for (var dx = -1; dx <= 1; dx++) for (var dz = -1; dz <= 1; dz++) if (dx == 0 || dz == 0 || R() < 0.5) { S(x + dx, -2, z + dz, 'minecraft:mangrove_roots[waterlogged=true]'); if (R() < 0.6) S(x + dx, -1, z + dz, 'minecraft:mangrove_roots[waterlogged=true]') }
  F(x, -1, z, x, h, z, 'minecraft:mangrove_log[axis=y]')
  for (var dx = -3; dx <= 3; dx++) for (var dz = -3; dz <= 3; dz++) for (var dy = -1; dy <= 2; dy++) if (dx * dx + dz * dz + dy * dy * 2 <= 11 && R() < 0.85) SA(x + dx, h + dy, z + dz, 'minecraft:mangrove_leaves[distance=1,persistent=true,waterlogged=false]')
}

function cmCentreInonde() {
  // terrain : remblai, prairie, cuvette inondee (bords dechiquetes)
  F(0, -6, 0, 95, -2, 95, 'minecraft:dirt'); F(0, -1, 0, 95, -1, 95, 'minecraft:grass_block')
  for (var x = 0; x <= 95; x++) for (var z = 0; z <= 95; z++) {
    var e = Math.min(x - 5, 90 - x, z - 5, 90 - z)
    if (e < 0) { if (R() < 0.06) SA(x, 0, z, choix(['minecraft:short_grass', 'minecraft:fern', 'minecraft:tall_grass[half=lower]'])); continue }
    if (e < 2 && R() < 0.5) { S(x, -1, z, choix(['minecraft:mud', 'minecraft:coarse_dirt'])); continue }
    var parking = x >= 10 && x <= 85 && z >= 8 && z <= 27
    S(x, -3, z, parking ? (R() < 0.85 ? 'minecraft:gray_concrete' : 'minecraft:cracked_stone_bricks') : 'minecraft:mud')
    S(x, -2, z, CM_EAU); S(x, -1, z, CM_EAU)
    if (parking && z >= 10 && z <= 25 && (x - 10) % 4 == 0 && z != 17 && z != 18) S(x, -3, z, 'minecraft:white_concrete')
    if (R() < 0.05) S(x, -2, z, 'minecraft:seagrass'); else if (R() < 0.025) SA(x, 0, z, 'minecraft:lily_pad')
  }
  // gros oeuvre : 52 x 40, deux niveaux (fond y-3, mezzanine y4, toit y10), facade au sud (z30)
  var X1 = 22, X2 = 73, Z1 = 30, Z2 = 69
  for (var x = X1; x <= X2; x++) for (var z = Z1; z <= Z2; z++) S(x, -3, z, (x + z) % 2 ? 'minecraft:smooth_quartz' : 'minecraft:light_gray_concrete')
  for (var x = X1; x <= X2; x++) for (var z = Z1; z <= Z2; z++) for (var y = -2; y <= 9; y++) if (x == X1 || x == X2 || z == Z1 || z == Z2) S(x, y, z, cmEnduit())
  F(X1, 10, Z1, X2, 10, Z2, 'minecraft:smooth_stone'); F(X1 + 1, 4, Z1 + 1, X2 - 1, 4, Z2 - 1, 'minecraft:polished_andesite')
  F(X1 + 1, 5, Z1 + 1, X2 - 1, 9, Z2 - 1, AIR); F(X1 + 1, 0, Z1 + 1, X2 - 1, 3, Z2 - 1, AIR)
  F(X1, 4, Z1, X2, 4, Z1, 'minecraft:white_concrete'); F(X1, 10, Z1, X2, 10, Z1, 'minecraft:white_concrete'); F(X1, 11, Z1, X2, 11, Z2, AIR)
  ;[Z1, Z2].forEach(z => F(X1, 11, z, X2, 11, z, 'minecraft:smooth_stone_slab[type=bottom]')); ;[X1, X2].forEach(x => F(x, 11, Z1, x, 11, Z2, 'minecraft:smooth_stone_slab[type=bottom]'))
  // facade sud : poteaux tous les 6, vitrines (beaucoup de verre casse), grande entree vitree double hauteur au centre
  for (var x = X1 + 1; x < X2; x++) {
    var pot = (x - X1) % 6 == 0
    for (var y = -2; y <= 3; y++) S(x, y, Z1, pot ? 'minecraft:white_concrete' : (y <= -1 ? AIR : R() < 0.35 ? AIR : 'minecraft:light_gray_stained_glass_pane'))
    if (x >= 44 && x <= 51) for (var y = -2; y <= 9; y++) S(x, y, Z1, (x == 44 || x == 51) ? 'minecraft:white_concrete' : y == 4 ? 'minecraft:white_concrete' : (R() < 0.4 ? AIR : 'minecraft:light_gray_stained_glass_pane'))
  }
  // marquise au-dessus de l'entree, panneau d'enseigne vide (aucun texte)
  F(42, 5, Z1 - 4, 53, 5, Z1 - 1, 'minecraft:smooth_stone_slab[type=bottom]'); F(42, 0, Z1 - 4, 42, 4, Z1 - 4, 'minecraft:polished_deepslate_wall'); F(53, 0, Z1 - 4, 53, 4, Z1 - 4, 'minecraft:polished_deepslate_wall')
  F(49, 5, Z1 - 3, 53, 5, Z1 - 1, AIR); S(48, 5, Z1 - 3, 'minecraft:smooth_stone_slab[type=top]')
  F(30, 6, Z1, 39, 8, Z1, 'minecraft:red_concrete'); F(31, 7, Z1, 38, 7, Z1, 'minecraft:gray_concrete')
  F(56, 6, Z1, 65, 8, Z1, 'minecraft:red_concrete'); F(57, 7, Z1, 64, 7, Z1, AIR)
  // atrium central ouvert sur les deux niveaux, verriere effondree
  F(39, 4, 41, 56, 4, 58, AIR)
  for (var x = 38; x <= 57; x++) for (var z = 40; z <= 59; z++) {
    if (x == 38 || x == 57 || z == 40 || z == 59) S(x, 5, z, 'minecraft:glass_pane')
    S(x, 10, z, R() < 0.45 ? AIR : 'minecraft:glass')
  }
  for (var i = 0; i < 26; i++) S(39 + Math.floor(R() * 18), -2, 41 + Math.floor(R() * 18), choix(['minecraft:glass', 'minecraft:smooth_stone_slab[type=bottom,waterlogged=true]', 'minecraft:light_gray_concrete']))
  // escaliers mecaniques (arretes) vers la mezzanine
  for (var i = 0; i < 7; i++) { var wl = i < 2 ? 'true' : 'false'; F(41, -2 + i, 47 - i, 42, -2 + i, 47 - i, 'minecraft:smooth_stone_stairs[facing=north,half=bottom,shape=straight,waterlogged=' + wl + ']'); S(40, -1 + i, 47 - i, 'minecraft:iron_bars'); S(43, -1 + i, 47 - i, 'minecraft:iron_bars') }
  for (var i = 0; i < 7; i++) { var wl = i < 2 ? 'true' : 'false'; F(53, -2 + i, 52 + i, 54, -2 + i, 52 + i, 'minecraft:smooth_stone_stairs[facing=south,half=bottom,shape=straight,waterlogged=' + wl + ']'); S(52, -1 + i, 52 + i, 'minecraft:iron_bars'); S(55, -1 + i, 52 + i, 'minecraft:iron_bars') }
  F(41, 5, 40, 42, 5, 40, AIR); F(53, 5, 59, 54, 5, 59, AIR)
  // boutiques le long des murs est et ouest, deux niveaux, devantures vitrees
  ;[[X1 + 1, X1 + 8, X1 + 8], [X2 - 8, X2 - 1, X2 - 8]].forEach(s => {
    for (var z = Z1 + 4; z <= Z2 - 2; z++) if ((z - Z1 - 4) % 9 == 0) for (var y = -2; y <= 9; y++) F(s[0], y, z, s[1], y, z, cmEnduit())
    for (var z = Z1 + 4; z <= Z2 - 2; z++) if ((z - Z1 - 4) % 9 != 0) {
      for (var y = -2; y <= 3; y++) S(s[2], y, z, (z - Z1 - 4) % 9 == 4 && y <= 1 ? AIR : (R() < 0.3 ? AIR : 'minecraft:light_gray_stained_glass_pane'))
      for (var y = 5; y <= 9; y++) S(s[2], y, z, (z - Z1 - 4) % 9 == 4 && y <= 7 ? AIR : (R() < 0.25 ? AIR : 'minecraft:glass_pane'))
      var xi = s[0] == X1 + 1 ? X1 + 2 : X2 - 2
      if (R() < 0.5) S(xi, -2, z, choix(['minecraft:barrel[facing=up,open=false]', 'minecraft:iron_bars', 'supplementaries:sack']))
      if (R() < 0.5) S(xi, 5, z, choix(['minecraft:iron_bars', 'minecraft:barrel[facing=up,open=true]', 'minecraft:chiseled_bookshelf[facing=east,slot_0_occupied=false,slot_1_occupied=false,slot_2_occupied=false,slot_3_occupied=false,slot_4_occupied=false,slot_5_occupied=false]']))
    }
  })
  // effondrement de l'angle sud-est : toit et mur haut tombes dans l'eau
  for (var x = 62; x <= X2; x++) for (var z = Z1; z <= 40; z++) {
    var cut = 4 + Math.max(0, 40 - z) * 0.3 + (x - 62) * 0.5 + R() * 2
    for (var y = 4; y <= 11; y++) if (y >= 11 - cut + 4) S(x, y, z, AIR)
    if (R() < 0.3) S(x, -2, z, choix(['minecraft:light_gray_concrete', 'minecraft:smooth_stone', 'minecraft:white_concrete', 'minecraft:cobblestone']))
  }
  for (var i = 0; i < 18; i++) SA(60 + Math.floor(R() * 18), -1, Z1 - 1 - Math.floor(R() * 4), choix(['minecraft:light_gray_concrete', 'minecraft:smooth_stone_slab[type=bottom,waterlogged=true]']))
  // toit : groupes de ventilation, mousse, arbustes qui ont pris
  ;[[28, 36], [30, 62], [64, 60], [68, 50], [26, 48]].forEach(p => { F(p[0], 11, p[1], p[0] + 2, 12, p[1] + 1, 'create:andesite_casing'); S(p[0] + 1, 13, p[1], 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false,powered=false,waterlogged=false]') })
  for (var x = X1 + 1; x < X2; x++) for (var z = Z1 + 1; z < Z2; z++) if (!(x >= 38 && x <= 57 && z >= 40 && z <= 59) && R() < 0.12) SA(x, 11, z, choix(['minecraft:moss_carpet', 'minecraft:moss_carpet', 'minecraft:short_grass', 'minecraft:azalea']))
  // vegetation : lierre sur la facade, mangroves dans le parking, arbres sur les rives
  for (var x = X1; x <= X2; x++) if (R() < 0.45) { var hv = 3 + Math.floor(R() * 8); for (var y = 9; y >= 10 - hv && y >= -1; y--) SA(x, y, Z1 - 1, 'minecraft:vine[east=false,north=false,south=true,up=false,west=false]') }
  for (var z = Z1; z <= Z2; z++) { if (R() < 0.4) for (var y = 9; y >= 2 + Math.floor(R() * 5); y--) SA(X1 - 1, y, z, 'minecraft:vine[east=true,north=false,south=false,up=false,west=false]'); if (R() < 0.4) for (var y = 9; y >= 2 + Math.floor(R() * 5); y--) SA(X2 + 1, y, z, 'minecraft:vine[east=false,north=false,south=false,up=false,west=true]') }
  ;[[14, 14, 7], [31, 22, 6], [68, 12, 8], [84, 24, 6], [12, 60, 7], [84, 78, 7], [50, 80, 6]].forEach(t => cmMangrove(t[0], t[1], t[2]))
  ;[[2, 40], [93, 30], [3, 88], [92, 92], [40, 93], [70, 2]].forEach(t => hrArbre(t[0], t[1], false))
  // lampadaires du parking, carcasses noyees
  ;[18, 34, 58, 76].forEach(x => { F(x, -2, 17, x, 4, 17, 'minecraft:polished_deepslate_wall'); S(x, 5, 17, 'minecraft:polished_deepslate_slab[type=bottom,waterlogged=false]') })
  cmEpave(12, 11, 'z', 'white'); cmEpave(20, 20, 'z', 'red'); cmEpave(36, 11, 'z', 'black'); cmEpave(48, 21, 'x', 'light_gray'); cmEpave(66, 11, 'z', 'blue'); cmEpave(78, 20, 'z', 'white')
  // chariots et debris flottants
  for (var i = 0; i < 14; i++) SA(10 + Math.floor(R() * 76), 0, 8 + Math.floor(R() * 20), choix(['minecraft:lily_pad', 'minecraft:lily_pad', 'minecraft:oak_trapdoor[facing=north,half=bottom,open=false,powered=false,waterlogged=false]']))
}

// ---------------- camp des Goblini : plates-formes et passerelles dans les grands arbres, cage a dinosaure au sol ----------------
var GB_F = 'minecraft:jungle_leaves[distance=1,persistent=true,waterlogged=false]'
function gbBambou(x, z, h) { for (var y = 0; y < h; y++) SA(x, y, z, 'minecraft:bamboo[age=1,leaves=' + (y >= h - 1 ? 'large' : y >= h - 3 ? 'small' : 'none') + ',stage=0]') }
function gbArbre(x, z, h) {
  F(x, 0, z, x + 1, h, z + 1, 'minecraft:jungle_log[axis=y]')
  ;[[-1, 0], [2, 0], [0, -1], [0, 2], [-1, 1], [2, 1], [1, -1], [1, 2]].forEach(c => { if (R() < 0.7) S(x + c[0], 0, z + c[1], 'minecraft:jungle_log[axis=y]') })
  for (var dx = -6; dx <= 7; dx++) for (var dz = -6; dz <= 7; dz++) for (var dy = -2; dy <= 3; dy++) { var ex = dx - 0.5, ez = dz - 0.5; if (ex * ex + ez * ez + dy * dy * 4 <= 40 && R() < 0.9) SA(x + dx, h + dy, z + dz, GB_F) }
  // lianes le long du tronc
  for (var y = 2; y < h - 2; y++) { if (R() < 0.35) SA(x - 1, y, z, 'minecraft:vine[east=true,north=false,south=false,up=false,west=false]'); if (R() < 0.35) SA(x + 2, y, z + 1, 'minecraft:vine[east=false,north=false,south=false,up=false,west=true]') }
}
function gbPlateforme(x, z, y, r) {
  for (var dx = -r; dx <= r + 1; dx++) for (var dz = -r; dz <= r + 1; dz++) {
    var bord = dx == -r || dx == r + 1 || dz == -r || dz == r + 1
    if ((dx == 0 || dx == 1) && (dz == 0 || dz == 1)) continue
    S(x + dx, y, z + dz, R() < 0.8 ? 'minecraft:bamboo_planks' : 'minecraft:spruce_planks')
    if (bord) S(x + dx, y + 1, z + dz, 'minecraft:bamboo_fence')
  }
  // jambes de force vers le tronc
  ;[[-r, -r], [r + 1, -r], [-r, r + 1], [r + 1, r + 1]].forEach(c => S(x + c[0], y - 1, z + c[1], 'minecraft:stripped_jungle_log[axis=y]'))
}
function gbHutte(x, z, y, w, d, porte) {
  W(x, z, x + w - 1, z + d - 1, y + 1, y + 3, 'minecraft:bamboo_block[axis=y]')
  F(x + 1, y + 1, z + 1, x + w - 2, y + 3, z + d - 2, AIR)
  S(x + porte[0], y + 1, z + porte[1], AIR); S(x + porte[0], y + 2, z + porte[1], AIR)
  for (var dx = -1; dx <= w; dx++) for (var dz = -1; dz <= d; dz++) { S(x + dx, y + 4, z + dz, 'minecraft:bamboo_mosaic_slab[type=bottom,waterlogged=false]'); if (R() < 0.7) SA(x + dx, y + 5, z + dz, R() < 0.6 ? GB_F : 'minecraft:moss_carpet') }
  S(x + 1, y + 1, z + 1, 'minecraft:barrel[facing=up,open=false]'); SA(x + w - 2, y + 1, z + d - 2, 'supplementaries:sack')
  S(x + porte[0], y + 3, z + porte[1], 'minecraft:lantern[hanging=true,waterlogged=false]')
}
function gbPasserelle(x1, z1, x2, z2, y) {
  var n = Math.max(Math.abs(x2 - x1), Math.abs(z2 - z1))
  for (var i = 0; i <= n; i++) {
    var t = i / n, x = Math.round(x1 + (x2 - x1) * t), z = Math.round(z1 + (z2 - z1) * t), s = Math.round(Math.sin(t * Math.PI) * 1.4)
    var lx = Math.abs(x2 - x1) >= Math.abs(z2 - z1)
    for (var k = 0; k <= 1; k++) S(x + (lx ? 0 : k), y - s, z + (lx ? k : 0), 'minecraft:spruce_slab[type=bottom,waterlogged=false]')
    S(x + (lx ? 0 : -1), y - s + 1, z + (lx ? -1 : 0), 'minecraft:bamboo_fence'); S(x + (lx ? 0 : 2), y - s + 1, z + (lx ? 2 : 0), 'minecraft:bamboo_fence')
  }
}
function gbCamp() {
  F(0, -6, 0, 63, -2, 63, 'minecraft:dirt')
  for (var x = 0; x <= 63; x++) for (var z = 0; z <= 63; z++) {
    var r = R(); S(x, -1, z, r < 0.45 ? 'minecraft:podzol[snowy=false]' : r < 0.75 ? 'minecraft:moss_block' : r < 0.9 ? 'minecraft:coarse_dirt' : 'minecraft:rooted_dirt')
  }
  // grands arbres (troncs 2x2, ~26 de haut)
  var T = [[12, 12, 26], [38, 8, 24], [48, 32, 27], [20, 42, 25], [8, 54, 23], [44, 54, 24]]
  T.forEach(t => gbArbre(t[0], t[1], t[2]))
  // plates-formes a y13, huttes camouflees sous les feuilles
  gbPlateforme(12, 12, 13, 4); gbHutte(8, 8, 13, 5, 4, [2, 3])
  gbPlateforme(48, 32, 13, 4); gbHutte(50, 34, 13, 4, 4, [0, 2])
  gbPlateforme(20, 42, 13, 4); gbHutte(16, 43, 13, 4, 4, [1, 0])
  gbPlateforme(38, 8, 13, 3)
  // passerelles entre les arbres
  gbPasserelle(17, 12, 37, 9, 13); gbPasserelle(42, 12, 48, 27, 13); gbPasserelle(43, 33, 25, 41, 13); gbPasserelle(14, 17, 19, 37, 13)
  // echelles sur le tronc nord-ouest et le tronc du sud
  for (var y = 0; y < 13; y++) { S(14, y, 12, 'minecraft:ladder[facing=east,waterlogged=false]'); S(22, y, 43, 'minecraft:ladder[facing=east,waterlogged=false]') }
  F(14, 13, 12, 14, 14, 12, AIR); F(22, 13, 43, 22, 14, 43, AIR)
  // vigie en haut du grand arbre
  F(45, 27, 29, 52, 29, 36, AIR); F(46, 26, 30, 51, 26, 35, 'minecraft:bamboo_planks'); W(46, 30, 51, 35, 27, 27, 'minecraft:bamboo_fence'); for (var y = 14; y < 26; y++) S(50, y, 32, 'minecraft:ladder[facing=east,waterlogged=false]')
  F(48, 26, 32, 49, 27, 33, 'minecraft:jungle_log[axis=y]'); F(50, 26, 32, 50, 27, 32, AIR); S(50, 26, 32, 'minecraft:ladder[facing=east,waterlogged=false]')
  // cage a dinosaure au sol : charpente de rondins, barreaux, porte a deux battants enchainee, foin et os
  var C1 = 26, C2 = 38, D1 = 18, D2 = 30, HC = 7
  for (var x = C1; x <= C2; x++) for (var z = D1; z <= D2; z++) {
    var bx = x == C1 || x == C2, bz = z == D1 || z == D2
    if (bx || bz) for (var y = 0; y < HC; y++) S(x, y, z, ((x - C1) % 4 == 0 && bz) || ((z - D1) % 4 == 0 && bx) ? 'minecraft:stripped_jungle_log[axis=y]' : 'minecraft:iron_bars')
    else { S(x, -1, z, R() < 0.6 ? 'minecraft:coarse_dirt' : 'minecraft:mud'); if (R() < 0.08) SA(x, 0, z, choix(['minecraft:hay_block[axis=y]', 'minecraft:bone_block[axis=x]', 'minecraft:bone_block[axis=z]'])) }
  }
  for (var x = C1; x <= C2; x++) S(x, HC, D1, 'minecraft:stripped_jungle_log[axis=x]'), S(x, HC, D2, 'minecraft:stripped_jungle_log[axis=x]')
  for (var z = D1; z <= D2; z += 2) F(C1, HC, z, C2, HC, z, 'minecraft:stripped_jungle_log[axis=x]')
  // porte cote camp (ouest) : poutres horizontales, chaines
  F(C1, 0, 22, C1, 4, 26, 'minecraft:spruce_planks'); for (var y = 0; y <= 4; y += 2) F(C1, y, 22, C1, y, 26, 'minecraft:stripped_spruce_log[axis=z]')
  F(C1 - 1, 2, 23, C1 - 1, 2, 25, 'minecraft:chain[axis=z]'); S(C1 - 1, 5, 24, 'minecraft:chain[axis=y]')
  S(C2 - 2, 0, D2 - 2, 'minecraft:cauldron'); S(C2 - 3, 0, D2 - 2, 'minecraft:hay_block[axis=y]'); S(C2 - 2, 1, D2 - 2, AIR)
  // camp au sol : foyer eteint (le trailer amene le feu), bancs, caisses, sacs
  for (var a = 0; a < 8; a++) { var px = 14 + Math.round(Math.cos(a * Math.PI / 4) * 2), pz = 30 + Math.round(Math.sin(a * Math.PI / 4) * 2); S(px, -1, pz, 'minecraft:cobblestone') }
  S(14, -1, 30, 'minecraft:coarse_dirt'); S(14, 0, 30, 'minecraft:black_carpet')
  S(10, 0, 28, 'minecraft:stripped_jungle_log[axis=z]'); S(10, 0, 29, 'minecraft:stripped_jungle_log[axis=z]'); S(18, 0, 31, 'minecraft:stripped_jungle_log[axis=z]'); S(18, 0, 32, 'minecraft:stripped_jungle_log[axis=z]')
  ;[[8, 34], [9, 34], [8, 35], [20, 26], [21, 26]].forEach(p => S(p[0], 0, p[1], choix(['minecraft:barrel[facing=up,open=false]', 'supplementaries:sack', 'minecraft:barrel[facing=up,open=true]'])))
  // fourres de bambous autour (le camp est cache), fougeres
  for (var i = 0; i < 260; i++) {
    var x = Math.floor(R() * 64), z = Math.floor(R() * 64), bordure = x < 6 || x > 57 || z < 5 || z > 58
    if (x >= C1 - 2 && x <= C2 + 2 && z >= D1 - 2 && z <= D2 + 2) continue
    if (x >= 6 && x <= 22 && z >= 25 && z <= 37) continue
    if (bordure || R() < 0.25) gbBambou(x, z, 8 + Math.floor(R() * 7)); else SA(x, 0, z, choix(['minecraft:fern', 'minecraft:large_fern[half=lower]', 'minecraft:short_grass', 'minecraft:moss_carpet']))
  }
}

var QFIN_LIEUX = function () {
  HB2 = true; FIN = true; THM = THM_HF
  lot(function () { HM = {}; FIN_VOLET = null; FIN_RID = null; hrPilote(); finAncrage() }, 0, 0, 999, 6501, 128, 44)
  THM = null
  lot(function () { HM = {}; FIN_VOLET = null; FIN_RID = null; cmCentreInonde(); finAncrage() }, 160, 0, 999, 3501, 96, 30)
  lot(function () { HM = {}; FIN_VOLET = null; FIN_RID = null; gbCamp(); finAncrage() }, 288, 0, 999, 4101, 64, 40)
  HB2 = false; FIN = false; THM = null; HM = {}
}
function vuesLieux() {
  vue('n_nid_face', 0, 0, 113.5, 27.6, 71, 113.5, 28, 84)
  vue('n_nid_trois_quarts', 0, 0, 100, 30, 76, 112, 26, 86)
  vue('n_nid_dos', 0, 0, 124, 31, 96, 112, 27, 85)
  vue('c_paysage', 160, 0, -14, 24, -18, 50, 2, 46)
  vue('c_ras_eau', 160, 0, 30, 0.6, 6, 48, 4, 32)
  vue('c_atrium', 160, 0, 47, 6.6, 34, 47, 0, 55)
  vue('c_effondrement', 160, 0, 86, 8, 22, 66, 4, 36)
  vue('g_sol_cage', 288, 0, 4, 1.6, 22, 30, 3, 24)
  vue('g_plateformes', 288, 0, 30, 9, 62, 28, 14, 24)
  vue('g_dessus', 288, 0, 32, 50, -12, 32, 6, 32)
  vue('g_cage', 288, 0, 20, 4, 14, 32, 1, 24)
}
