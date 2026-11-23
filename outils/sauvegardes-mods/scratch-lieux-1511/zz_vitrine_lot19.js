
// ================= QUARTIER HAUSSMANNIEN / BRIQUE (plaines, forets, rivieres) =================
// Rangee nord (facades au sud, z29) : grand magasin, immeubles, gare, opera. Boulevard z32..47. Rangee sud (facades au nord, z2) : halles, cite HBM, square, banque.
var HS = 'minecraft:smooth_sandstone', HC = 'minecraft:cut_sandstone', HCH = 'minecraft:chiseled_sandstone', HZ = 'minecraft:deepslate_tile', HZB = 'minecraft:deepslate_tiles'
var HF = 'mcwfences:ornate_metal_fence', HPO = 'mcwdoors:spruce_classic_door', HPV = 'mcwdoors:dark_oak_glass_door', HBR = 'minecraft:bricks', HSB = 'minecraft:stone_bricks'
var HLH = 'minecraft:lantern[hanging=true]', HV = {}
function hbE(m, f, h) { return m + '_stairs[facing=' + f + ',half=' + (h || 'bottom') + ',shape=straight]' }
function hbM(b) {
  var r = R()
  if (b == HS) return r < 0.07 ? 'minecraft:sandstone' : r < 0.11 ? 'chipped:sanded_sandstone' : b
  if (b == HBR) return r < 0.07 ? 'createdeco:cracked_red_bricks' : b
  if (b == HSB) return r < 0.1 ? 'minecraft:mossy_stone_bricks' : r < 0.18 ? 'minecraft:cracked_stone_bricks' : b
  return b
}
// mur vieilli : remplissage puis quelques blocs uses
function hbMur(x1, y1, z1, x2, y2, z2, b) {
  F(x1, y1, z1, x2, y2, z2, b)
  for (var x = x1; x <= x2; x++) for (var y = y1; y <= y2; y++) for (var z = z1; z <= z2; z++) { var m = hbM(b); if (m != b) S(x, y, z, m) }
}
function hbSol(x1, z1, x2, z2) {
  for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) {
    var r = R(), b = r < 0.7 ? 'minecraft:grass_block' : r < 0.85 ? 'minecraft:coarse_dirt' : r < 0.95 ? 'minecraft:podzol' : 'minecraft:rooted_dirt'
    S(x, -1, z, b); HV[x + ',' + z] = 1
  }
}
function hbLibre(x, z) { for (var a = -1; a <= 1; a++) for (var b = -1; b <= 1; b++) delete HV[(x + a) + ',' + (z + b)] }
function hbVeg(x1, z1, x2, z2, d) {
  for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) {
    if (!HV[x + ',' + z]) continue
    var r = R()
    if (r < d * 0.45) SA(x, 0, z, 'minecraft:short_grass')
    else if (r < d * 0.6) SA(x, 0, z, choix(['minecraft:dandelion', 'minecraft:poppy', 'minecraft:oxeye_daisy', 'minecraft:cornflower', 'minecraft:azure_bluet']))
    else if (r < d * 0.66) SA(x, 0, z, 'minecraft:fern')
  }
}
// platane : tronc tachete, houppier arrondi
function hbPlatane(x, z, h) {
  var L1 = 'minecraft:birch_leaves[persistent=true]', L2 = 'minecraft:azalea_leaves[persistent=true]'
  for (var a = -3; a <= 3; a++) for (var b = -3; b <= 3; b++) for (var y = h - 2; y <= h + 2; y++) {
    var d = a * a + b * b + (y - h) * (y - h) * 2
    if (d <= 10 && !(d >= 8 && R() < 0.35)) SA(x + a, y, z + b, R() < 0.65 ? L1 : L2)
  }
  F(x, 0, z, x, h, z, 'minecraft:birch_log[axis=y]'); S(x + 1, h - 1, z, 'minecraft:birch_log[axis=x]'); S(x, h - 1, z - 1, 'minecraft:birch_log[axis=z]')
  S(x, -1, z, 'minecraft:rooted_dirt'); hbLibre(x, z)
}
// lampadaire : fut de fonte, une ou deux crosses (dx,dz), lanternes parfois cassees
function hbLampe(x, z, dx, dz, double) {
  if (HB2) return hb2Lampe(x, z, dx, dz, double)
  F(x, 0, z, x, 5, z, 'minecraft:polished_blackstone_wall'); S(x, 6, z, 'minecraft:polished_blackstone_slab[type=bottom]')
  var bras = double ? [1, -1] : [1]
  bras.forEach(k => { S(x + dx * k, 5, z + dz * k, 'minecraft:polished_blackstone_wall'); if (R() < 0.78) S(x + dx * k, 4, z + dz * k, HLH) })
  hbLibre(x, z)
}
// cheminees de toit en brique avec mitres
function hbCheminee(x, z, y, n) { for (var i = 0; i < n; i++) { F(x + i, y, z, x + i, y + 2, z, HBR); S(x + i, y + 3, z, 'minecraft:decorated_pot') } }
// toit mansarde : brisis (ardoise et lucarnes) puis terrasson en zinc ; trou = zone laissee libre (atrium, dome)
function hbMansarde(x1, z1, x2, z2, y, trou) {
  for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) {
    if (trou && x >= trou[0] && x <= trou[2] && z >= trou[1] && z <= trou[3]) continue
    var dn = z - z1, ds = z2 - z, dw = x - x1, de = x2 - x, d = Math.min(dn, ds, dw, de)
    var f = d == dn ? 'south' : d == ds ? 'north' : d == dw ? 'east' : 'west'
    var le = (f == 'south' || f == 'north') ? x : z
    if (d == 0) S(x, y, z, hbE(HZ, f))
    else if (d == 1) {
      S(x, y, z, HZB); S(x, y + 2, z, HZB)
      S(x, y + 1, z, le % 3 == 1 && Math.min(dw, de, dn, ds) == 1 && !((dw <= 1 || de <= 1) && (dn <= 1 || ds <= 1)) ? GP : HZB)
      S(x, y + 3, z, hbE(HZ, f))
    } else { S(x, y, z, 'minecraft:spruce_planks'); S(x, y + 3, z, HZ + '_slab[type=bottom]') }
  }
}
// bric-a-brac de grenier ou de pieces abandonnees
function hbBazar(x1, z1, x2, z2, y, n) { for (var i = 0; i < n; i++) SA(x1 + Math.floor(R() * (x2 - x1 + 1)), y, z1 + Math.floor(R() * (z2 - z1 + 1)), choix(['minecraft:white_carpet', 'minecraft:light_gray_carpet', 'supplementaries:book_pile', 'supplementaries:sack', 'minecraft:barrel[facing=up,open=false]', 'minecraft:gray_carpet', 'minecraft:decorated_pot'])) }

// ================= BOULEVARD (z32..47) =================
function hbRue() {
  HV = {}
  for (var x = 0; x <= 127; x++) {
    ;[32, 33, 46, 47].forEach(z => S(x, -1, z, R() < 0.72 ? 'minecraft:smooth_stone' : choix(['minecraft:polished_andesite', 'minecraft:andesite', 'minecraft:stone', 'minecraft:gravel'])))
    S(x, -1, 34, 'minecraft:polished_andesite'); S(x, -1, 45, 'minecraft:polished_andesite')
    ;[35, 36, 37, 38, 41, 42, 43, 44].forEach(z => {
      var r = R(); S(x, -1, z, r < 0.7 ? 'minecraft:gray_concrete' : r < 0.86 ? 'minecraft:black_concrete' : r < 0.93 ? 'minecraft:cobblestone' : r < 0.97 ? 'minecraft:gray_concrete_powder' : 'minecraft:gravel')
      if (r > 0.985) S(x, 0, z, 'minecraft:short_grass')
    })
    if (x % 6 < 3) { S(x, -1, 37, 'minecraft:white_concrete'); S(x, -1, 42, 'minecraft:white_concrete') }
  }
  // terre-plein central : gazon, haies basses, massifs
  hbSol(0, 39, 127, 40)
  for (var x = 0; x <= 127; x++) { if (x % 16 == 8) continue; if (x % 4 == 1) { S(x, 0, 39, 'minecraft:azalea_leaves[persistent=true]'); delete HV[x + ',39'] } }
  // passage pieton
  for (var x = 62; x <= 65; x++) for (var z = 35; z <= 44; z++) if (z != 39 && z != 40) S(x, -1, z, z % 2 ? 'minecraft:white_concrete' : 'minecraft:gray_concrete')
  for (var x = 62; x <= 65; x++) { S(x, -1, 39, 'minecraft:smooth_stone'); S(x, -1, 40, 'minecraft:smooth_stone'); delete HV[x + ',39']; delete HV[x + ',40'] }
  // platanes des trottoirs, lampadaires, bancs
  for (var x = 8; x <= 120; x += 16) { hbPlatane(x, 33, 6); hbPlatane(x, 46, 6); hbLampe(x, 39, 0, 1, true) }
  for (var x = 0; x <= 112; x += 16) { if (x == 64) continue; if (x != 96) hbLampe(x + 1, 34, 0, 1); if (x != 16) hbLampe(x + 1, 45, 0, -1) }
  ;[[12, 32, 'north'], [52, 32, 'north'], [84, 47, 'south'], [116, 47, 'south'], [28, 47, 'south']].forEach(b => gtBanc(b[0], b[1], b[2], 3))
  // colonne Morris
  ;[[44, 33], [43, 33], [45, 33], [44, 32], [44, 34]].forEach(p => F(p[0], 0, p[1], p[0], 3, p[1], 'minecraft:green_terracotta'))
  ;[[43, 1, 33, 'minecraft:white_terracotta'], [45, 2, 33, 'minecraft:yellow_terracotta'], [44, 1, 34, 'minecraft:orange_terracotta'], [44, 2, 32, 'minecraft:light_gray_terracotta'], [43, 2, 33, 'minecraft:red_terracotta']].forEach(p => S(p[0], p[1], p[2], p[3]))
  ;[[44, 33], [43, 33], [45, 33], [44, 32], [44, 34]].forEach(p => S(p[0], 4, p[1], 'minecraft:oxidized_cut_copper_slab[type=bottom]'))
  S(44, 4, 33, 'minecraft:oxidized_cut_copper'); S(44, 5, 33, 'minecraft:oxidized_cut_copper_slab[type=bottom]')
  // kiosque a journaux (trottoir sud)
  W(18, 45, 21, 47, 0, 2, 'minecraft:green_terracotta'); F(19, 1, 45, 20, 2, 45, AIR); F(19, 1, 45, 20, 1, 45, 'minecraft:spruce_slab[type=top]')
  S(19, 2, 45, 'supplementaries:book_pile'); S(19, 0, 46, 'minecraft:barrel[facing=up,open=false]'); S(20, 0, 46, 'minecraft:white_carpet'); S(19, 1, 46, AIR)
  F(17, 3, 44, 22, 3, 48, 'minecraft:oxidized_cut_copper_slab[type=bottom]'); F(18, 3, 45, 21, 3, 47, 'minecraft:oxidized_cut_copper'); F(19, 4, 46, 20, 4, 46, 'minecraft:oxidized_cut_copper_slab[type=bottom]')
  S(17, 3, 48, AIR); S(22, 3, 48, AIR); S(17, 3, 44, AIR); S(22, 3, 44, AIR)
  PORTE(21, 0, 46, 'mcwdoors:spruce_classic_door', 'east', 'left', 'true')
  ;[[16, 0, 45], [23, 0, 47], [17, 0, 46], [24, 0, 33]].forEach(p => SA(p[0], p[1], p[2], choix(['minecraft:white_carpet', 'minecraft:light_gray_carpet'])))
  // abribus (trottoir nord)
  F(96, 0, 32, 99, 2, 32, GP); F(96, 0, 33, 96, 2, 33, GP); F(99, 0, 33, 99, 2, 33, 'minecraft:gray_stained_glass_pane')
  F(95, 3, 32, 100, 3, 34, 'minecraft:smooth_stone_slab[type=bottom]'); F(100, 0, 34, 100, 2, 34, 'minecraft:iron_bars'); F(95, 0, 34, 95, 2, 34, 'minecraft:iron_bars')
  F(97, 0, 33, 98, 0, 33, hbE('minecraft:spruce', 'north'))
  S(97, 1, 33, 'minecraft:white_carpet'); S(96, 1, 32, 'minecraft:light_gray_stained_glass_pane')
  // voitures abandonnees, une barricade de sacs, un camion de livraison renverse sur le flanc
  bgVoiture(10, 36, 'x', 'red', 0); bgVoiture(29, 42, 'x', 'blue', 1); bgVoiture(48, 35, 'x', 'white', 2); bgVoiture(74, 43, 'x', 'gray', 0)
  bgVoiture(88, 36, 'x', 'yellow', 1); bgVoiture(108, 41, 'x', 'green', 0); bgVoiture(56, 41, 'z', 'black', 1); bgVoiture(122, 35, 'x', 'light_blue', 2)
  // camion : caisse 6x3 couchee, cabine
  F(34, 0, 35, 39, 2, 37, 'minecraft:white_concrete'); F(35, 1, 35, 38, 1, 35, 'minecraft:light_gray_concrete'); F(40, 0, 35, 41, 1, 37, 'minecraft:red_concrete'); F(41, 1, 36, 41, 1, 36, 'minecraft:tinted_glass')
  F(33, 0, 36, 33, 1, 36, AIR); S(33, 0, 35, 'minecraft:barrel[facing=west,open=true]'); S(32, 0, 36, 'supplementaries:sack'); S(31, 0, 37, 'minecraft:white_carpet'); S(33, 0, 37, 'supplementaries:sack')
  for (var z = 41; z <= 44; z++) { S(120, 0, z, 'supplementaries:sack'); if (z != 43) S(120, 1, z, 'supplementaries:sack') }
  F(119, 0, 35, 119, 0, 38, 'minecraft:spruce_fence'); S(119, 1, 36, 'supplementaries:sack')
  // detritus
  for (var i = 0; i < 46; i++) { var x = Math.floor(R() * 128), z = 32 + Math.floor(R() * 16); if (z == 39 || z == 40) continue; SA(x, 0, z, choix(['minecraft:white_carpet', 'minecraft:light_gray_carpet', 'minecraft:gray_carpet', 'minecraft:brown_carpet', 'supplementaries:book_pile'])) }
  hbVeg(0, 39, 127, 40, 0.8)
  // bouches d'incendie
  ;[[30, 34], [70, 45], [104, 34]].forEach(p => { S(p[0], 0, p[1], 'minecraft:red_nether_brick_wall'); S(p[0], 1, p[1], 'minecraft:red_nether_brick_slab[type=bottom]') })
}
