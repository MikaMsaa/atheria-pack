
// ================= QUARTIER GOTHIQUE (pierre sombre, ardoise, chene noir : foret sombre, marais) =================
// Rangee nord (facades au sud) : halle aux draps, beffroi, maisons a pignons, square clos. Rue pavee et canal z32..47. Rangee sud (facades au nord) : hospice, bibliotheque, darse, jardin d'hiver.
var GTP = 'minecraft:deepslate_bricks', GTT = 'minecraft:deepslate_tiles', GTS = 'minecraft:stone_bricks', GTD = 'minecraft:dark_oak_planks'
var GTPD = 'minecraft:polished_deepslate', GTCD = 'minecraft:chiseled_deepslate', GTW = 'minecraft:deepslate_brick_wall', GTSW = 'minecraft:stone_brick_wall'
var GTL = 'minecraft:dark_oak_log[axis=y]', GTLX = 'minecraft:dark_oak_log[axis=x]', GTLZ = 'minecraft:dark_oak_log[axis=z]', GTF = 'minecraft:dark_oak_fence'
var GTPO = 'mcwdoors:dark_oak_classic_door', GTPS = 'mcwdoors:spruce_classic_door', GTPV = 'mcwdoors:dark_oak_glass_door'
var GTLH = 'minecraft:lantern[hanging=true]', GTSL = 'minecraft:soul_lantern[hanging=true]', GTV = {}
var GTTS = 'minecraft:deepslate_tile', GTBS = 'minecraft:deepslate_brick', GTSB = 'minecraft:stone_brick', GTDO = 'minecraft:dark_oak'
function gtE(m, f, h) { return m + '_stairs[facing=' + f + ',half=' + (h || 'bottom') + ',shape=straight]' }
function gtM(b) {
  var r = R()
  if (b == GTS) return r < 0.14 ? 'minecraft:mossy_stone_bricks' : r < 0.22 ? 'minecraft:cracked_stone_bricks' : b
  if (b == GTP) return r < 0.12 ? 'minecraft:cracked_deepslate_bricks' : b
  if (b == 'minecraft:bricks') return r < 0.06 ? 'createdeco:cracked_red_bricks' : b
  if (b == 'minecraft:tuff_bricks') return r < 0.1 ? 'minecraft:tuff' : r < 0.16 ? 'minecraft:polished_tuff' : b
  return b
}
function gtVit() { return 'minecraft:' + choix(['red', 'blue', 'purple', 'yellow', 'cyan', 'magenta', 'light_blue']) + '_stained_glass_pane' }
function gtSol(x1, z1, x2, z2) {
  for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) {
    var r = R(), b = r < 0.38 ? 'minecraft:grass_block' : r < 0.58 ? 'minecraft:podzol' : r < 0.7 ? 'minecraft:coarse_dirt' : r < 0.85 ? 'minecraft:moss_block' : r < 0.94 ? 'minecraft:mud' : 'minecraft:rooted_dirt'
    S(x, -1, z, b); GTV[x + ',' + z] = b == 'minecraft:podzol' ? 'p' : 'h'
  }
}
function gtDalle(x1, z1, x2, z2, l) { for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) { S(x, -1, z, typeof l == 'string' ? l : choix(l)); delete GTV[x + ',' + z] } }
function gtLibre(x, z) { for (var a = -1; a <= 1; a++) for (var b = -1; b <= 1; b++) delete GTV[(x + a) + ',' + (z + b)] }
function gtVeg(x1, z1, x2, z2, d) {
  for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) {
    var t = GTV[x + ',' + z]; if (!t) continue
    var r = R()
    if (r < d * 0.4) SA(x, 0, z, 'minecraft:short_grass'); else if (r < d * 0.68) SA(x, 0, z, 'minecraft:fern')
    else if (r < d * 0.76) SA(x, 0, z, t == 'p' ? choix(['minecraft:brown_mushroom', 'minecraft:red_mushroom']) : 'minecraft:dead_bush')
    else if (r < d * 0.8) SA(x, 0, z, 'minecraft:wither_rose'); else if (r < d * 0.84) SA(x, 0, z, 'minecraft:lily_of_the_valley')
  }
}
function gtPapiers(x1, z1, x2, z2, y, n) { for (var i = 0; i < n; i++) SA(x1 + Math.floor(R() * (x2 - x1 + 1)), y, z1 + Math.floor(R() * (z2 - z1 + 1)), choix(['minecraft:white_carpet', 'minecraft:light_gray_carpet', 'supplementaries:book_pile', 'minecraft:cobweb', 'minecraft:gray_carpet'])) }
// Arbre mort : tronc de chene noir, branches nues, quelques touffes d'epicea si f
function gtArbreMort(x, z, h, f) {
  F(x, 0, z, x, h, z, GTL); gtLibre(x, z)
  S(x + 1, h - 2, z, GTLX); S(x + 2, h - 2, z, GTLX); S(x + 2, h - 1, z, GTL)
  S(x - 1, h - 3, z, GTLX); S(x - 1, h - 2, z, GTL)
  S(x, h - 1, z + 1, GTLZ); S(x, h, z + 1, GTL); S(x, h - 4, z - 1, GTLZ); S(x, h - 3, z - 1, GTL)
  if (f) { var L = 'minecraft:spruce_leaves[persistent=true]'; S(x + 2, h, z, L); S(x + 3, h - 1, z, L); S(x - 1, h - 1, z, L); S(x, h + 1, z + 1, L); S(x, h + 1, z, L); S(x, h - 2, z - 1, L) }
}
// If (conifere sombre en cone)
function gtIf(x, z, h) {
  var L = 'minecraft:spruce_leaves[persistent=true]'
  for (var y = 2; y <= h + 1; y++) { var r = Math.min(2, Math.round((h + 1 - y) * 0.6)); for (var a = -r; a <= r; a++) for (var b = -r; b <= r; b++) if (Math.abs(a) + Math.abs(b) <= r && (a || b || y >= h)) S(x + a, y, z + b, L) }
  F(x, 0, z, x, h - 1, z, 'minecraft:spruce_log[axis=y]'); gtLibre(x, z)
}
// Saule (feuillage d'azalee et lianes pendantes)
function gtSaule(x, z) {
  var L = 'minecraft:azalea_leaves[persistent=true]'
  for (var a = -2; a <= 2; a++) for (var b = -2; b <= 2; b++) { if (Math.abs(a) == 2 && Math.abs(b) == 2) continue; S(x + a, 5, z + b, L); if (Math.abs(a) + Math.abs(b) <= 2) S(x + a, 6, z + b, L); if ((Math.abs(a) == 2 || Math.abs(b) == 2) && R() < 0.6) S(x + a, 4, z + b, 'minecraft:vine[up=true]') }
  F(x, 0, z, x, 4, z, GTL); gtLibre(x, z)
}
function gtReverbere(x, z, dx, dz) { F(x, 0, z, x, 4, z, 'minecraft:polished_blackstone_wall'); S(x + dx, 4, z + dz, 'minecraft:polished_blackstone_wall'); S(x + dx, 3, z + dz, R() < 0.3 ? GTSL : GTLH); S(x, 5, z, 'minecraft:polished_blackstone_slab[type=bottom]'); gtLibre(x, z) }
function gtBanc(x, z, f, n) {
  var ns = f == 'north' || f == 'south'
  for (var i = 0; i < n; i++) S(ns ? x + i : x, 0, ns ? z : z + i, gtE(GTDO, f))
  if (ns) { S(x - 1, 0, z, 'minecraft:dark_oak_trapdoor[facing=west,half=bottom,open=true]'); S(x + n, 0, z, 'minecraft:dark_oak_trapdoor[facing=east,half=bottom,open=true]') }
  else { S(x, 0, z - 1, 'minecraft:dark_oak_trapdoor[facing=north,half=bottom,open=true]'); S(x, 0, z + n, 'minecraft:dark_oak_trapdoor[facing=south,half=bottom,open=true]') }
}
// Toits a deux pans : faitage selon x (gtToitX) ou selon z (gtToitZ) ; pignons pleins
function gtToitX(x1, x2, z1, z2, y, m) { var n = Math.floor((z2 - z1 + 1) / 2); for (var k = 0; k < n; k++) { F(x1, y + k, z1 + k, x2, y + k, z1 + k, gtE(m, 'south')); F(x1, y + k, z2 - k, x2, y + k, z2 - k, gtE(m, 'north')) } if ((z2 - z1) % 2 == 0) F(x1, y + n, z1 + n, x2, y + n, z1 + n, m + '_slab[type=bottom]') }
function gtToitZ(x1, x2, z1, z2, y, m) { var n = Math.floor((x2 - x1 + 1) / 2); for (var k = 0; k < n; k++) { F(x1 + k, y + k, z1, x1 + k, y + k, z2, gtE(m, 'east')); F(x2 - k, y + k, z1, x2 - k, y + k, z2, gtE(m, 'west')) } if ((x2 - x1) % 2 == 0) F(x1 + n, y + n, z1, x1 + n, y + n, z2, m + '_slab[type=bottom]') }
function gtPignonX(x, z1, z2, y, b) { var n = Math.floor((z2 - z1 + 1) / 2); for (var k = 0; k < n; k++) if (z1 + k + 1 <= z2 - k - 1) F(x, y + k, z1 + k + 1, x, y + k, z2 - k - 1, b) }
function gtPignonZ(z, x1, x2, y, b) { var n = Math.floor((x2 - x1 + 1) / 2); for (var k = 0; k < n; k++) if (x1 + k + 1 <= x2 - k - 1) F(x1 + k + 1, y + k, z, x2 - k - 1, y + k, z, b) }
// Tombe (plus utilisee depuis le retrait des elements religieux)
function gtTombe(x, z) {
  var t = Math.floor(R() * 5)
  S(x, -1, z, 'minecraft:podzol'); S(x, -1, z + 1, choix(['minecraft:podzol', 'minecraft:coarse_dirt', 'minecraft:rooted_dirt'])); S(x, -1, z + 2, 'minecraft:coarse_dirt')
  for (var i = 0; i < 3; i++) delete GTV[x + ',' + (z + i)]
  if (t == 0) { F(x, 0, z, x, 2, z, GTSW); S(x - 1, 1, z, GTSW); S(x + 1, 1, z, GTSW) }
  else if (t == 1) { S(x, 0, z, 'minecraft:chiseled_stone_bricks'); S(x, 1, z, 'minecraft:stone_brick_slab[type=bottom]') }
  else if (t == 2) S(x, 0, z, gtE('minecraft:mossy_stone_brick', 'north'))
  else if (t == 3) { S(x, 0, z, 'minecraft:cobblestone_wall'); F(x, 0, z + 1, x, 0, z + 2, 'minecraft:smooth_stone_slab[type=bottom]') }
  else { S(x, 0, z, 'minecraft:polished_andesite'); S(x, 1, z, 'minecraft:polished_andesite_slab[type=bottom]') }
  if (t != 3) { var r = R(); if (r < 0.3) S(x, 0, z + 1, 'minecraft:candle[candles=' + (1 + Math.floor(R() * 3)) + ',lit=false]'); else if (r < 0.5) S(x, 0, z + 1, 'minecraft:wither_rose'); else if (r < 0.65) S(x, 0, z + 1, 'minecraft:flower_pot'); else if (r < 0.8) S(x, 0, z + 2, 'minecraft:dead_bush') }
}
// Mausolee 5x5, porte au sud
function gtMausolee(x1, z1, m, porte) {
  var x2 = x1 + 4, z2 = z1 + 4, cx = x1 + 2
  F(x1, 0, z1, x2, 0, z2, m); F(x1 + 1, 0, z1 + 1, x2 - 1, 0, z2 - 1, 'minecraft:polished_andesite')
  for (var y = 1; y <= 4; y++) for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) if (x == x1 || x == x2 || z == z1 || z == z2) S(x, y, z, gtM(m))
  PORTE(cx, 1, z2, porte, 'south', 'left', 'false'); S(cx, 3, z2, 'minecraft:chiseled_stone_bricks')
  F(x1 + 1, 1, z2 + 1, x1 + 1, 3, z2 + 1, GTSW); F(x2 - 1, 1, z2 + 1, x2 - 1, 3, z2 + 1, GTSW); F(x1 + 1, 4, z2 + 1, x2 - 1, 4, z2 + 1, gtE(GTSB, 'north', 'top'))
  for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) S(x, 5, z, x == x1 || x == x2 || z == z1 || z == z2 ? 'minecraft:stone_brick_slab[type=bottom]' : m)
  S(cx, 6, z1 + 2, 'minecraft:chiseled_stone_bricks'); ;[[x1 + 1, z1 + 1], [x2 - 1, z1 + 1], [x1 + 1, z2 - 1], [x2 - 1, z2 - 1]].forEach(c => S(c[0], 6, c[1], 'minecraft:decorated_pot'))
  F(cx, 7, z1 + 2, cx, 9, z1 + 2, GTSW); S(cx - 1, 8, z1 + 2, GTSW); S(cx + 1, 8, z1 + 2, GTSW)
  F(x1 + 1, 1, z1 + 1, x2 - 1, 1, z1 + 1, 'minecraft:polished_andesite'); F(x1 + 1, 2, z1 + 1, x2 - 1, 2, z1 + 1, 'minecraft:polished_andesite_slab[type=bottom]')
  S(x1 + 1, 1, z1 + 3, 'minecraft:candle[candles=3,lit=false]'); S(x2 - 1, 1, z1 + 3, 'minecraft:candle[candles=2,lit=false]'); S(cx, 3, z1 + 1, 'minecraft:cobweb')
  F(cx, 2, z1, cx, 3, z1, 'minecraft:purple_stained_glass_pane')
}

// ================= RUE PAVEE ET CANAL (z32..47) =================
function gtRue() {
  GTV = {}
  for (var x = 0; x <= 127; x++) {
    for (var z = 32; z <= 33; z++) S(x, -1, z, R() < 0.75 ? 'minecraft:polished_andesite' : choix(['minecraft:andesite', GTS, 'minecraft:mossy_stone_bricks', 'minecraft:cracked_stone_bricks']))
    for (var z = 34; z <= 38; z++) { var r = R(); S(x, -1, z, r < 0.55 ? 'minecraft:cobblestone' : r < 0.75 ? 'minecraft:mossy_cobblestone' : r < 0.87 ? 'minecraft:andesite' : r < 0.94 ? 'minecraft:gravel' : 'minecraft:moss_block'); if (r > 0.96) S(x, 0, z, 'minecraft:short_grass') }
    S(x, -1, 39, 'minecraft:smooth_stone'); F(x, -4, 39, x, -2, 39, GTS); S(x, -1, 44, 'minecraft:smooth_stone'); F(x, -4, 44, x, -2, 44, GTS)
    F(x, -4, 40, x, -4, 43, 'minecraft:mud'); F(x, -3, 40, x, -2, 43, 'minecraft:water'); F(x, -1, 40, x, -1, 43, AIR)
    if (R() < 0.12) S(x, -1, 40 + Math.floor(R() * 4), 'minecraft:lily_pad'); if (R() < 0.15) S(x, -3, 40 + Math.floor(R() * 4), 'minecraft:seagrass')
    for (var z = 45; z <= 47; z++) S(x, -1, z, R() < 0.7 ? GTS : choix(['minecraft:mossy_stone_bricks', 'minecraft:cobblestone', 'minecraft:polished_andesite']))
  }
  // chenal vers la darse (x74..85) couvert d'une passerelle
  for (var x = 74; x <= 85; x++) { F(x, -4, 44, x, -4, 47, 'minecraft:mud'); F(x, -3, 44, x, -2, 47, 'minecraft:water'); F(x, -1, 44, x, -1, 47, GTD) }
  for (var z = 44; z <= 47; z++) { F(73, -4, z, 73, -2, z, GTS); F(86, -4, z, 86, -2, z, GTS) }
  F(74, 0, 47, 85, 0, 47, GTF)
  // garde-corps du canal
  for (var x = 0; x <= 127; x++) {
    if ((x >= 22 && x <= 26) || (x >= 100 && x <= 104)) continue
    var b = x % 8 == 0 ? 'minecraft:polished_blackstone_wall' : 'minecraft:iron_bars'
    if (x != 12) S(x, 0, 39, b); if (x < 74 || x > 85) S(x, 0, 44, b)
  }
  F(12, -2, 40, 12, -1, 40, 'minecraft:ladder[facing=south]'); F(115, -2, 43, 115, -1, 43, 'minecraft:ladder[facing=north]'); S(115, 0, 44, AIR)
  // ponts en dos d'ane
  ;[22, 100].forEach(x1 => {
    for (var x = x1; x <= x1 + 4; x++) {
      F(x, 0, 39, x, 0, 44, GTS); S(x, 0, 38, 'minecraft:stone_brick_slab[type=bottom]'); S(x, 0, 45, 'minecraft:stone_brick_slab[type=bottom]')
      S(x, -1, 40, gtE(GTSB, 'north', 'top')); S(x, -1, 43, gtE(GTSB, 'south', 'top'))
    }
    F(x1, 1, 39, x1, 1, 44, GTSW); F(x1 + 4, 1, 39, x1 + 4, 1, 44, GTSW)
    ;[[x1, 39], [x1, 44], [x1 + 4, 39], [x1 + 4, 44]].forEach(c => { S(c[0], 2, c[1], GTSW); S(c[0], 3, c[1], 'minecraft:lantern[hanging=false]') })
  })
  // reverberes, arbres, bancs
  ;[6, 30, 54, 78, 102, 126].forEach(x => gtReverbere(x, 33, 0, 1))
  ;[14, 46, 62, 110].forEach(x => gtReverbere(x, 46, 0, -1))
  ;[6, 38, 94, 118].forEach((x, i) => { S(x, -1, 46, 'minecraft:podzol'); gtArbreMort(x, 46, 7, i % 2 == 0) })
  S(54, -1, 46, 'minecraft:podzol'); gtIf(54, 46, 6)
  gtBanc(32, 45, 'south', 3); gtBanc(66, 45, 'south', 3); gtBanc(112, 45, 'south', 3)
  // vehicules abandonnes, barrage, mobilier
  bgVoiture(8, 35, 'x', 'black', 1); bgVoiture(44, 36, 'x', 'gray', 2); bgVoiture(88, 35, 'x', 'white', 1); bgVoiture(62, 34, 'z', 'red', 2); bgVoiture(120, 36, 'x', 'brown', 0)
  F(70, 0, 34, 70, 1, 38, 'minecraft:spruce_fence'); S(71, 0, 35, 'minecraft:barrel[facing=up,open=false]'); S(71, 0, 37, 'minecraft:barrel[facing=up,open=false]'); S(69, 0, 36, 'minecraft:cobblestone_wall'); S(71, 1, 35, 'minecraft:lantern[hanging=false]')
  F(40, 0, 32, 40, 3, 32, 'minecraft:green_terracotta'); S(40, 4, 32, 'minecraft:polished_blackstone_slab[type=bottom]')
  S(20, 0, 33, 'minecraft:red_nether_brick_wall'); S(84, 0, 33, 'minecraft:red_nether_brick_wall')
  ;[16, 58, 96].forEach(x => S(x, 0, 38, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false]'))
  for (var i = 0; i < 40; i++) SA(Math.floor(R() * 128), 0, 32 + Math.floor(R() * 7), choix(['minecraft:white_carpet', 'minecraft:light_gray_carpet', 'supplementaries:book_pile', 'minecraft:gray_carpet']))
}

// ================= HALLE AUX DRAPS (grande halle a bas-cotes, deux tours de guet, rosace, hemicycle des echevins, galerie des marchands, comptoir des changeurs) =================
function gtHalleDraps() {
  GTV = {}
  var P = GTP, T = GTT, PD = GTPD
  function dA(x, z) { return Math.sqrt((x - 15.5) * (x - 15.5) + (z - 6) * (z - 6)) }
  gtSol(0, 0, 31, 31)
  gtDalle(3, 28, 28, 31, [GTS, GTS, 'minecraft:mossy_stone_bricks', 'minecraft:cobblestone', 'minecraft:andesite'])
  gtDalle(7, 0, 24, 27, PD); F(8, 0, 6, 23, 0, 27, PD)
  // sol en damier noir et blanc
  for (var x = 9; x <= 22; x++) for (var z = 7; z <= 26; z++) S(x, 0, z, (x + z) % 2 ? PD : 'minecraft:calcite')
  // murs des bas-cotes et mur nord
  for (var y = 1; y <= 10; y++) { for (var z = 6; z <= 27; z++) { S(8, y, z, gtM(P)); S(23, y, z, gtM(P)) } ;[9, 10, 21, 22].forEach(x => S(x, y, 6, gtM(P))) }
  F(11, 1, 6, 11, 10, 6, PD); F(20, 1, 6, 20, 10, 6, PD); F(11, 11, 6, 20, 18, 6, P)
  // abside en hemicycle
  for (var x = 6; x <= 25; x++) for (var z = 0; z <= 5; z++) {
    var d = dA(x, z)
    if (d < 5.3) { S(x, 0, z, PD); S(x, 1, z, (x + z) % 2 ? PD : 'minecraft:polished_blackstone') }
    else if (d < 6.8) { S(x, 0, z, P); for (var y = 1; y <= 12; y++) S(x, y, z, gtM(P)); if (z >= 1 && z <= 4 && Math.abs(x - 15.5) >= 2 && (x + z) % 3 == 0) F(x, 3, z, x, 10, z, gtVit()) }
  }
  ;[[13, 6.8], [14, 5.5], [15, 4.2], [16, 2.8], [17, 1.6]].forEach(c => { for (var x = 6; x <= 25; x++) for (var z = 0; z <= 5; z++) if (dA(x, z) < c[1]) S(x, c[0], z, T) })
  F(12, 1, 6, 19, 1, 6, PD); F(13, 1, 7, 18, 1, 7, gtE(GTBS, 'north'))
  // hemicycle : table des echevins, sieges
  F(15, 4, 0, 16, 10, 0, P); F(13, 8, 0, 18, 8, 0, P)
  F(14, 2, 2, 17, 2, 2, 'mcwfurnitures:dark_oak_table'); S(14, 3, 2, 'supplementaries:book_pile'); S(17, 3, 2, 'minecraft:lantern[hanging=false]'); S(15, 2, 1, gtE(GTDO, 'south')); S(16, 2, 1, gtE(GTDO, 'south'))
  S(11, 2, 4, gtE(GTDO, 'west')); S(11, 2, 5, gtE(GTDO, 'west')); S(20, 2, 4, gtE(GTDO, 'east')); S(20, 2, 5, gtE(GTDO, 'east'))
  S(13, 2, 6, 'minecraft:lectern[facing=south]'); S(18, 2, 6, 'minecraft:polished_blackstone_wall'); S(18, 3, 6, 'minecraft:lantern[hanging=false]')
  // grandes arcades, piliers, fenetres hautes
  ;[11, 20].forEach(x => {
    ;[10, 14, 18, 22].forEach(z => { F(x, 1, z, x, 9, z, PD); S(x, 1, z, GTCD); S(x, 9, z, GTCD) })
    ;[[7, 9], [11, 13], [15, 17], [19, 21], [23, 26]].forEach(g => { S(x, 9, g[0], gtE(GTBS, 'north', 'top')); S(x, 9, g[1], gtE(GTBS, 'south', 'top')) })
    for (var z = 7; z <= 26; z++) for (var y = 10; y <= 17; y++) S(x, y, z, gtM(P))
    ;[8, 12, 16, 20].forEach(z => F(x, 12, z, x, 15, z, gtVit()))
  })
  // voutes et toitures
  F(9, 10, 7, 10, 10, 26, T); F(21, 10, 7, 22, 10, 26, T)
  F(8, 11, 6, 8, 11, 26, gtE(GTTS, 'east')); F(9, 11, 6, 10, 11, 26, T); F(9, 12, 6, 9, 12, 26, gtE(GTTS, 'east')); F(10, 12, 6, 10, 12, 26, T); F(10, 13, 6, 10, 13, 26, gtE(GTTS, 'east'))
  F(23, 11, 6, 23, 11, 26, gtE(GTTS, 'west')); F(21, 11, 6, 22, 11, 26, T); F(22, 12, 6, 22, 12, 26, gtE(GTTS, 'west')); F(21, 12, 6, 21, 12, 26, T); F(21, 13, 6, 21, 13, 26, gtE(GTTS, 'west'))
  F(12, 18, 7, 19, 18, 26, T); F(12, 17, 7, 12, 17, 26, gtE(GTBS, 'west', 'top')); F(19, 17, 7, 19, 17, 26, gtE(GTBS, 'east', 'top'))
  ;[10, 14, 18, 22].forEach(z => F(13, 17, z, 18, 17, z, 'minecraft:deepslate_brick_slab[type=top]'))
  for (var k = 0; k < 5; k++) { F(11 + k, 19 + k, 5, 11 + k, 19 + k, 28, gtE(GTTS, 'east')); F(20 - k, 19 + k, 5, 20 - k, 19 + k, 28, gtE(GTTS, 'west')) }
  F(15, 24, 5, 16, 24, 28, 'minecraft:deepslate_tile_slab[type=bottom]')
  for (var k = 0; k < 4; k++) { F(12 + k, 19 + k, 6, 19 - k, 19 + k, 6, P); F(12 + k, 19 + k, 27, 19 - k, 19 + k, 27, P) }
  // facade : portails, tympan, rosace, lancettes, fleuron de pignon
  for (var x = 9; x <= 22; x++) for (var y = 1; y <= 18; y++) S(x, y, 27, gtM(P))
  for (var x = 11; x <= 20; x++) for (var y = 9; y <= 17; y++) { var d2 = (x - 15.5) * (x - 15.5) + (y - 13) * (y - 13); if (d2 <= 9.5) S(x, y, 27, d2 < 4.6 ? 'minecraft:glass_pane' : 'minecraft:light_gray_stained_glass_pane'); else if (d2 <= 14) S(x, y, 27, PD) }
  PORTE(15, 1, 27, GTPO, 'north', 'left', 'false'); PORTE(16, 1, 27, GTPO, 'north', 'right', 'false'); F(14, 3, 27, 17, 4, 27, GTCD); S(15, 4, 27, 'minecraft:gilded_blackstone'); S(16, 4, 27, 'minecraft:gilded_blackstone')
  PORTE(10, 1, 27, GTPO, 'north', 'left', 'false'); PORTE(21, 1, 27, GTPO, 'north', 'right', 'false')
  F(10, 6, 27, 10, 10, 27, 'minecraft:light_gray_stained_glass_pane'); F(21, 6, 27, 21, 10, 27, 'minecraft:light_gray_stained_glass_pane')
  F(15, 25, 27, 15, 26, 27, GTW)
  // porche
  F(12, 0, 28, 19, 0, 29, PD); F(12, 1, 28, 12, 6, 29, P); F(19, 1, 28, 19, 6, 29, P)
  ;[28, 29].forEach(z => { S(13, 6, z, gtE(GTBS, 'west', 'top')); S(18, 6, z, gtE(GTBS, 'east', 'top')) })
  F(12, 7, 28, 19, 8, 29, P); F(13, 9, 28, 18, 9, 29, P); F(14, 10, 28, 17, 10, 29, P); F(15, 11, 28, 16, 11, 29, P)
  ;[28, 29].forEach(z => { S(13, 9, z, gtE(GTBS, 'east')); S(18, 9, z, gtE(GTBS, 'west')); S(14, 10, z, gtE(GTBS, 'east')); S(17, 10, z, gtE(GTBS, 'west')); S(15, 11, z, gtE(GTBS, 'east')); S(16, 11, z, gtE(GTBS, 'west')) })
  F(12, 9, 28, 12, 10, 28, GTW); F(19, 9, 28, 19, 10, 28, GTW)
  F(12, 0, 30, 19, 0, 30, gtE(GTSB, 'north'))
  // tours de guet a fleches
  function tour(x1, ouest) {
    var x2 = x1 + 4, xc = x1 + 2, xi = ouest ? x1 + 1 : x2 - 1, xp = ouest ? x2 : x1
    for (var y = 0; y <= 26; y++) for (var x = x1; x <= x2; x++) for (var z = 25; z <= 29; z++) if (y == 0 || x == x1 || x == x2 || z == 25 || z == 29) S(x, y, z, y == 0 ? PD : gtM(P))
    ;[6, 12, 19, 24].forEach(y => F(x1 + 1, y, 26, x2 - 1, y, 28, GTD))
    F(xi, 1, 28, xi, 23, 28, 'minecraft:ladder[facing=' + (ouest ? 'east' : 'west') + ']')
    PORTE(xc, 1, 29, GTPO, 'south', 'left', 'false')
    F(xp, 1, 26, xp, 2, 26, AIR); F(xp, 7, 26, xp, 8, 26, AIR)
    ;[9, 15].forEach(y => { F(xc, y, 29, xc, y + 2, 29, 'minecraft:light_gray_stained_glass_pane'); F(ouest ? x1 : x2, y, 27, ouest ? x1 : x2, y + 2, 27, 'minecraft:light_gray_stained_glass_pane') })
    for (var y = 20; y <= 22; y++) { S(xc, y, 29, 'minecraft:dark_oak_trapdoor[facing=north,half=bottom,open=true]'); S(xc, y, 25, 'minecraft:dark_oak_trapdoor[facing=south,half=bottom,open=true]'); S(x1, y, 27, 'minecraft:dark_oak_trapdoor[facing=east,half=bottom,open=true]'); S(x2, y, 27, 'minecraft:dark_oak_trapdoor[facing=west,half=bottom,open=true]') }
    S(xc, 23, 27, 'minecraft:lantern[hanging=true]')
    for (var x = x1; x <= x2; x++) for (var z = 25; z <= 29; z++) {
      var bx = x == x1 || x == x2, bz = z == 25 || z == 29
      if (bx || bz) { S(x, 27, z, gtM(P)); if ((x + z) % 2 == 0) S(x, 28, z, gtM(P)) } else S(x, 27, z, T)
    }
    S(xc, 28, 27, 'minecraft:lantern[hanging=false]')
    // tour de guet : terrasse crenelee, sans fleche
    S(x1, 25, 30, 'minecraft:wither_skeleton_wall_skull[facing=south]'); S(x2, 25, 30, 'minecraft:wither_skeleton_wall_skull[facing=south]')
    var xb = ouest ? x1 - 1 : x2 + 1, xs = ouest ? x1 : x2
    F(xb, 0, 29, xb, 14, 29, P); F(xs, 0, 30, xs, 14, 30, P); S(xb, 15, 29, gtE(GTBS, ouest ? 'east' : 'west')); S(xs, 15, 30, gtE(GTBS, 'north'))
  }
  tour(4, true); tour(23, false)
  // contreforts et arcs-boutants
  ;[10, 14, 18, 22].forEach(z => {
    F(7, 0, z, 7, 10, z, P); F(7, 11, z, 7, 12, z, GTW); F(24, 0, z, 24, 10, z, P); F(24, 11, z, 24, 12, z, GTW)
    S(8, 12, z, gtE(GTBS, 'west', 'top')); S(9, 13, z, gtE(GTBS, 'west', 'top')); S(10, 14, z, gtE(GTBS, 'west', 'top'))
    S(23, 12, z, gtE(GTBS, 'east', 'top')); S(22, 13, z, gtE(GTBS, 'east', 'top')); S(21, 14, z, gtE(GTBS, 'east', 'top'))
  })
  ;[8, 12, 16, 20].forEach(z => F(8, 3, z, 8, 8, z, gtVit())); ;[8, 16, 20].forEach(z => F(23, 3, z, 23, 8, z, gtVit()))
  // galerie des marchands : balles de drap
  F(9, 6, 24, 22, 6, 26, GTD); for (var x = 9; x <= 22; x++) S(x, 7, 24, GTF)
  F(13, 1, 24, 13, 5, 24, GTL); F(18, 1, 24, 18, 5, 24, GTL)
  F(12, 7, 26, 19, 7, 26, GTD); for (var x = 12; x <= 19; x++) if (x % 2 == 0) F(x, 8, 26, x, 8 + (x % 3 == 0 ? 1 : 0), 26, choix(['minecraft:white_wool', 'minecraft:red_wool', 'minecraft:blue_wool', 'minecraft:brown_wool']))
  S(15, 7, 25, 'minecraft:dark_oak_slab[type=top]'); S(16, 7, 25, 'minecraft:note_block'); S(15, 7, 24, gtE(GTDO, 'north')); S(16, 7, 24, gtE(GTDO, 'north'))
  // etals des drapiers, tapis, lustres, flambeaux, loge du peseur
  for (var z = 9; z <= 21; z += 4) [12, 18].forEach(x => { F(x, 1, z, x + 1, 1, z, 'mcwfurnitures:dark_oak_table'); if (R() > 0.2) S(x, 2, z, choix(['minecraft:white_carpet', 'minecraft:red_carpet', 'minecraft:blue_carpet', 'minecraft:brown_carpet'])); if (R() > 0.4) S(x + 1, 2, z, 'minecraft:white_carpet') })
  F(15, 1, 8, 16, 1, 26, 'minecraft:red_carpet')
  S(15, 16, 14, 'mcwlights:iron_chandelier'); S(16, 16, 18, 'mcwlights:iron_chandelier'); S(15, 16, 22, 'mcwlights:iron_chandelier')
  ;[12, 16, 20].forEach(z => { S(9, 9, z, GTSL); S(22, 9, z, GTSL) })
  ;[[9, 9], [9, 13], [9, 17], [22, 9], [22, 13], [22, 21]].forEach(c => { S(c[0], 1, c[1], 'minecraft:polished_blackstone_wall'); S(c[0], 2, c[1], 'minecraft:lantern[hanging=false]') })
  F(21, 1, 17, 22, 3, 19, GTD); F(21, 4, 17, 22, 4, 19, 'minecraft:dark_oak_slab[type=bottom]'); F(22, 1, 18, 22, 2, 18, AIR); S(22, 1, 18, gtE(GTDO, 'east')); PORTE(21, 1, 18, GTPO, 'west', 'left', 'false')
  S(21, 2, 17, 'minecraft:dark_oak_trapdoor[facing=west,half=bottom,open=true]'.replace('open=true', 'open=false'))
  ;[[9, 9, 7], [22, 9, 7], [12, 16, 7], [19, 16, 26], [10, 9, 26]].forEach(c => S(c[0], c[1], c[2], 'minecraft:cobweb'))
  gtPapiers(12, 8, 19, 22, 1, 10)
  for (var i = 0; i < 14; i++) SA(9 + Math.floor(R() * 14), 1, 7 + Math.floor(R() * 20), choix(['minecraft:moss_carpet', 'minecraft:moss_carpet', 'minecraft:deepslate_brick_slab[type=bottom]', 'minecraft:cobblestone_slab[type=bottom]']))
  // comptoir des changeurs et passage couvert
  F(25, 0, 8, 30, 0, 17, GTS); F(26, 0, 9, 29, 0, 16, GTD)
  for (var y = 1; y <= 5; y++) for (var x = 25; x <= 30; x++) for (var z = 8; z <= 17; z++) if (x == 25 || x == 30 || z == 8 || z == 17) S(x, y, z, gtM(GTS))
  gtToitZ(25, 30, 7, 18, 6, GTTS); gtPignonZ(8, 25, 30, 6, GTS); gtPignonZ(17, 25, 30, 6, GTS)
  F(24, 0, 11, 24, 0, 13, GTS); F(24, 1, 11, 24, 3, 11, GTS); F(24, 1, 13, 24, 3, 13, GTS); S(24, 3, 12, GTS); F(24, 4, 11, 24, 4, 13, 'minecraft:deepslate_tile_slab[type=bottom]')
  F(23, 1, 12, 23, 2, 12, AIR); F(25, 1, 12, 25, 2, 12, AIR); PORTE(24, 1, 12, GTPO, 'east', 'left', 'false')
  S(29, 1, 10, 'minecraft:chest[facing=west]'); S(29, 1, 11, 'minecraft:barrel[facing=west,open=false]'); S(29, 1, 14, 'minecraft:purple_banner'); S(29, 1, 15, 'minecraft:black_banner')
  F(26, 1, 15, 27, 1, 15, 'mcwfurnitures:dark_oak_table'); S(26, 1, 14, MAT('dark_oak_chair', 'south')); S(27, 2, 15, 'supplementaries:book_pile'); S(26, 2, 15, 'minecraft:lantern[hanging=false]')
  S(28, 1, 9, 'minecraft:water_cauldron[level=2]'); S(26, 1, 9, 'minecraft:chiseled_bookshelf[facing=south]'); S(27, 7, 12, GTLH)
  F(30, 2, 11, 30, 3, 11, 'minecraft:light_gray_stained_glass_pane'); F(30, 2, 14, 30, 3, 14, 'minecraft:light_gray_stained_glass_pane'); F(27, 2, 17, 28, 3, 17, 'minecraft:light_gray_stained_glass_pane')
  // cour des charrettes a l'ouest : tonneaux et balles de foin
  ;[2, 5].forEach(x => [8, 12, 16, 20].forEach(z => S(x, 0, z, choix(['minecraft:barrel[facing=up,open=false]', 'minecraft:hay_block[axis=y]', 'minecraft:hay_block[axis=x]']))))
  gtIf(2, 3, 7); gtArbreMort(28, 22, 6, true)
  gtReverbere(2, 29, 1, 0); gtReverbere(29, 29, -1, 0); gtBanc(25, 30, 'south', 3)
  gtVeg(0, 0, 31, 31, 0.35)
}

// ================= BEFFROI ET HOTEL DE VILLE (halle a arcades, pignons a gradins, salle du conseil, beffroi a cadrans) =================
function gtBeffroi() {
  GTV = {}
  var M = GTS
  gtSol(0, 0, 31, 31)
  for (var x = 0; x <= 31; x++) for (var z = 19; z <= 31; z++) { var r = R(); S(x, -1, z, r < 0.5 ? 'minecraft:cobblestone' : r < 0.75 ? GTS : r < 0.88 ? 'minecraft:andesite' : r < 0.95 ? 'minecraft:mossy_cobblestone' : 'minecraft:moss_block'); delete GTV[x + ',' + z] }
  // gros oeuvre x2..29 z4..18, galerie a arcades z16..17
  F(2, 0, 4, 29, 0, 18, GTPD)
  for (var x = 3; x <= 28; x++) for (var z = 5; z <= 17; z++) S(x, 0, z, (x + z) % 2 ? GTPD : 'minecraft:polished_andesite')
  for (var y = 1; y <= 13; y++) {
    for (var z = 4; z <= 18; z++) { S(2, y, z, y == 7 ? GTPD : gtM(M)); S(29, y, z, y == 7 ? GTPD : gtM(M)) }
    for (var x = 3; x <= 28; x++) { S(x, y, 4, y == 7 ? GTPD : gtM(M)); if (y >= 7) S(x, y, 18, y == 7 ? GTPD : gtM(M)) }
  }
  for (var x = 3; x <= 28; x++) for (var y = 1; y <= 6; y++) S(x, y, 15, gtM(M))
  for (var x = 2; x <= 29; x += 3) F(x, 1, 18, x, 6, 18, GTPD)
  for (var x = 3; x <= 27; x += 3) { S(x, 5, 18, gtE(GTSB, 'west', 'top')); S(x + 1, 5, 18, gtE(GTSB, 'east', 'top')); F(x, 6, 18, x + 1, 6, 18, M) }
  F(3, 7, 5, 28, 7, 17, GTD); F(3, 14, 5, 28, 14, 17, GTD)
  // toiture d'ardoise et pignons a gradins
  gtToitX(3, 28, 3, 19, 15, GTTS)
  ;[2, 29].forEach(x => {
    for (var k = 0; k < 8; k++) { F(x, 15 + k, 4 + k, x, 15 + k, 18 - k, M); if (k % 2 == 0) { S(x, 16 + k, 4 + k, 'minecraft:stone_brick_slab[type=bottom]'); S(x, 16 + k, 18 - k, 'minecraft:stone_brick_slab[type=bottom]') } }
    F(x, 23, 11, x, 24, 11, M); S(x, 25, 11, GTSW)
  })
  // beffroi x13..18 z7..12
  F(14, 15, 8, 17, 33, 11, AIR)
  for (var y = 15; y <= 33; y++) for (var x = 13; x <= 18; x++) for (var z = 7; z <= 12; z++) if (x == 13 || x == 18 || z == 7 || z == 12) S(x, y, z, gtM(M))
  ;[[13, 7], [18, 7], [13, 12], [18, 12]].forEach(c => F(c[0], 15, c[1], c[0], 33, c[1], GTPD))
  var QZ = 'minecraft:smooth_quartz'
  F(14, 23, 12, 17, 26, 12, QZ); S(15, 25, 12, 'supplementaries:clock_block[facing=south]'); S(14, 26, 12, 'minecraft:gold_block'); S(17, 26, 12, 'minecraft:gold_block'); S(14, 23, 12, 'minecraft:gold_block'); S(17, 23, 12, 'minecraft:gold_block')
  F(14, 23, 7, 17, 26, 7, QZ); S(16, 25, 7, 'supplementaries:clock_block[facing=north]')
  F(13, 23, 8, 13, 26, 11, QZ); S(13, 25, 10, 'supplementaries:clock_block[facing=west]')
  F(18, 23, 8, 18, 26, 11, QZ); S(18, 25, 9, 'supplementaries:clock_block[facing=east]')
  F(15, 28, 12, 16, 31, 12, 'minecraft:dark_oak_trapdoor[facing=north,half=bottom,open=true]'); F(15, 28, 7, 16, 31, 7, 'minecraft:dark_oak_trapdoor[facing=south,half=bottom,open=true]')
  F(13, 28, 9, 13, 31, 10, 'minecraft:dark_oak_trapdoor[facing=east,half=bottom,open=true]'); F(18, 28, 9, 18, 31, 10, 'minecraft:dark_oak_trapdoor[facing=west,half=bottom,open=true]')
  F(14, 32, 9, 17, 32, 10, GTLX); S(15, 31, 9, 'minecraft:bell[attachment=ceiling,facing=south]'); S(16, 31, 10, 'minecraft:bell[attachment=ceiling,facing=east]')
  F(14, 8, 5, 14, 13, 5, 'minecraft:ladder[facing=south]'); S(14, 14, 5, AIR); F(16, 15, 7, 16, 16, 7, AIR); F(14, 15, 8, 14, 30, 8, 'minecraft:ladder[facing=south]')
  F(14, 33, 8, 17, 33, 11, M)
  for (var x = 13; x <= 18; x++) for (var z = 7; z <= 12; z++) if (x == 13 || x == 18 || z == 7 || z == 12) S(x, 34, z, GTSW)
  ;[[13, 7], [18, 7], [13, 12], [18, 12]].forEach(c => { S(c[0], 35, c[1], GTSW); S(c[0], 36, c[1], GTSW) })
  ;[[14, 8], [17, 8], [14, 11], [17, 11]].forEach(c => F(c[0], 34, c[1], c[0], 37, c[1], GTPD))
  S(15, 37, 9, 'minecraft:bell[attachment=ceiling,facing=south]')
  for (var x = 14; x <= 17; x++) for (var z = 8; z <= 11; z++) { var bx = x == 14 || x == 17, bz = z == 8 || z == 11; S(x, 38, z, bx && bz ? 'minecraft:deepslate_tile_slab[type=bottom]' : bx || bz ? gtE(GTTS, x == 14 ? 'east' : x == 17 ? 'west' : z == 8 ? 'south' : 'north') : GTT) }
  F(15, 39, 9, 16, 40, 10, GTT); S(15, 41, 9, 'minecraft:gold_block'); S(15, 42, 9, GTSW)
  // rez-de-chaussee : salle des guichets (ouest), escalier et archives (est)
  F(15, 1, 5, 15, 6, 14, M); PORTE(15, 1, 10, GTPO, 'east', 'left', 'false')
  F(4, 1, 11, 13, 1, 11, MAT('dark_oak_counter', 'south')); F(4, 3, 11, 13, 3, 11, 'minecraft:iron_bars'); for (var x = 4; x <= 13; x++) if (x % 3 != 0) S(x, 2, 11, 'minecraft:iron_bars')
  ;[5, 9, 13].forEach(x => { S(x, 1, 9, 'mcwfurnitures:dark_oak_table'); S(x, 1, 8, MAT('dark_oak_chair', 'south')); S(x, 2, 9, choix(['supplementaries:book_pile', 'minecraft:candle[candles=1,lit=false]', 'minecraft:white_carpet'])) })
  for (var x = 3; x <= 14; x++) S(x, 1, 5, x % 3 == 0 ? 'minecraft:chest[facing=south]' : 'minecraft:barrel[facing=south,open=false]'); for (var x = 3; x <= 14; x++) if (x % 2) S(x, 2, 5, 'minecraft:barrel[facing=south,open=false]')
  S(3, 1, 13, 'supplementaries:notice_board[facing=east]'); S(3, 1, 12, 'minecraft:flower_pot')
  ;[4, 5, 6, 10, 11, 12, 13].forEach(x => S(x, 1, 14, gtE(GTDO, 'south')))
  PORTE(8, 1, 15, GTPO, 'south', 'left', 'false'); PORTE(22, 1, 15, GTPO, 'south', 'left', 'false')
  for (var i = 0; i < 6; i++) { S(21 - i, 1 + i, 5, gtE(GTDO, 'west')); S(21 - i, 1 + i, 6, gtE(GTDO, 'west')) }
  F(16, 7, 5, 21, 7, 6, AIR); F(16, 8, 7, 21, 8, 7, GTF); F(22, 8, 5, 22, 8, 6, GTF)
  F(24, 1, 8, 24, 4, 13, 'minecraft:bookshelf'); F(27, 1, 8, 27, 4, 13, 'minecraft:bookshelf'); F(28, 1, 8, 28, 2, 13, 'minecraft:barrel[facing=west,open=false]')
  F(19, 1, 11, 20, 1, 11, 'mcwfurnitures:dark_oak_table'); S(19, 1, 12, MAT('dark_oak_chair', 'north')); S(20, 2, 11, 'supplementaries:book_pile'); S(25, 1, 14, 'minecraft:lectern[facing=north]')
  ;[[8, 6, 12], [22, 6, 10], [26, 6, 11]].forEach(c => S(c[0], c[1], c[2], GTLH))
  gtPapiers(16, 8, 28, 14, 1, 8); gtPapiers(3, 6, 14, 14, 1, 7)
  // etage : salle du conseil et bureau du maire
  F(23, 8, 5, 23, 13, 17, M); PORTE(23, 8, 13, GTPO, 'east', 'left', 'false')
  F(8, 8, 10, 17, 8, 12, 'mcwfurnitures:dark_oak_table')
  for (var x = 8; x <= 17; x++) { if (R() > 0.12) S(x, 8, 9, MAT('dark_oak_chair', 'south')); if (R() > 0.12) S(x, 8, 13, MAT('dark_oak_chair', 'north')) }
  S(7, 8, 11, MAT('dark_oak_chair', 'east')); S(18, 8, 11, MAT('dark_oak_chair', 'west'))
  for (var i = 0; i < 8; i++) SA(8 + Math.floor(R() * 10), 9, 10 + Math.floor(R() * 3), choix(['supplementaries:book_pile', 'minecraft:white_carpet', 'minecraft:candle[candles=1,lit=false]']))
  F(3, 8, 9, 4, 12, 13, 'minecraft:polished_blackstone_bricks'); F(4, 8, 10, 4, 9, 12, AIR); S(4, 8, 11, 'minecraft:campfire[lit=false,facing=east]'); F(5, 10, 9, 5, 10, 13, 'minecraft:dark_oak_slab[type=top]'); S(5, 11, 9, 'minecraft:candle[candles=3,lit=false]'); S(5, 11, 13, 'minecraft:candle[candles=2,lit=false]')
  F(3, 13, 11, 3, 25, 11, 'minecraft:polished_blackstone_bricks')
  ;[7, 11, 17, 21].forEach(x => S(x, 11, 5, 'minecraft:black_wall_banner[facing=south]'))
  S(10, 13, 11, 'mcwlights:iron_chandelier'); S(15, 13, 11, 'mcwlights:iron_chandelier'); S(20, 13, 15, GTLH)
  F(9, 8, 15, 16, 8, 16, 'minecraft:red_carpet'); S(20, 8, 16, 'minecraft:potted_dead_bush'); S(3, 8, 16, 'minecraft:chiseled_bookshelf[facing=east]'); S(3, 8, 6, 'minecraft:chiseled_bookshelf[facing=east]')
  S(26, 8, 12, 'mcwfurnitures:dark_oak_table'); S(26, 8, 11, MAT('dark_oak_chair', 'south')); S(26, 9, 12, 'supplementaries:book_pile'); S(25, 8, 14, MAT('dark_oak_chair', 'north'))
  F(28, 8, 6, 28, 10, 9, 'minecraft:bookshelf'); S(28, 8, 15, 'minecraft:chest[facing=west]'); S(28, 8, 16, 'minecraft:iron_block'); S(28, 9, 16, 'minecraft:candle[candles=1,lit=false]'); F(25, 8, 10, 27, 8, 13, 'minecraft:red_carpet'.replace('red', 'black')); S(26, 13, 9, GTLH); S(27, 13, 16, 'minecraft:cobweb')
  // fenetres
  ;[5, 9, 13, 19, 25].forEach(x => F(x, 2, 4, x, 4, 4, GP)); ;[5, 9, 13, 19, 25, 27].forEach(x => F(x, 9, 4, x, 12, 4, GP))
  ;[4, 7, 10, 13, 19, 22, 25, 27].forEach(x => F(x, 9, 18, x, 12, 18, GP))
  ;[2, 29].forEach(x => { F(x, 2, 8, x, 4, 8, GP); F(x, 2, 13, x, 4, 13, GP); F(x, 9, 14, x, 12, 14, GP); if (x == 29) F(x, 9, 8, x, 12, 8, GP) })
  // balcon central et banieres de facade
  PORTE(15, 8, 18, GTPV, 'south', 'left', 'false'); PORTE(16, 8, 18, GTPV, 'south', 'right', 'false'); F(15, 10, 18, 16, 11, 18, GP)
  F(13, 7, 19, 18, 7, 19, GTPD); F(13, 8, 19, 18, 8, 19, GTSW); F(13, 6, 19, 18, 6, 19, gtE(GTSB, 'north', 'top'))
  S(9, 10, 19, 'minecraft:black_wall_banner[facing=south]'); S(21, 10, 19, 'minecraft:gray_wall_banner[facing=south]')
  // galerie : lanternes, bancs, affiches
  ;[6, 12, 18, 24].forEach(x => S(x, 6, 17, GTLH)); ;[4, 5, 6, 25, 26, 27].forEach(x => S(x, 1, 16, gtE(GTDO, 'north'))); S(11, 1, 16, 'supplementaries:notice_board[facing=south]'); S(19, 1, 16, 'supplementaries:notice_board[facing=south]')
  // place : fontaine gothique, borne-lanterne du marche, arbres, reverberes
  for (var x = 13; x <= 18; x++) for (var z = 23; z <= 28; z++) {
    var bord = x == 13 || x == 18 || z == 23 || z == 28, coin = (x == 13 || x == 18) && (z == 23 || z == 28)
    if (coin) continue
    if (bord) { S(x, -1, z, GTS); S(x, 0, z, 'minecraft:stone_brick_slab[type=bottom]') }
    else { S(x, -2, z, 'minecraft:mud'); S(x, -1, z, (x == 15 || x == 16) && (z == 25 || z == 26) ? GTS : 'minecraft:water') }
  }
  F(15, 0, 25, 16, 2, 26, GTS); F(15, 3, 25, 16, 3, 26, 'minecraft:chiseled_stone_bricks'); F(15, 4, 25, 16, 5, 26, GTSW); F(15, 6, 25, 16, 6, 26, 'minecraft:stone_brick_slab[type=bottom]'); S(14, 0, 24, 'minecraft:lily_pad'); S(17, 0, 27, 'minecraft:lily_pad')
  F(5, 0, 24, 7, 0, 26, 'minecraft:stone_brick_slab[type=bottom]'); S(6, 0, 25, GTS); F(6, 1, 25, 6, 5, 25, GTSW); S(6, 6, 25, 'minecraft:lantern[hanging=false]')
  ;[[25, 24], [25, 29], [6, 29]].forEach(c => { S(c[0], -1, c[1], 'minecraft:podzol'); gtArbreMort(c[0], c[1], 6, false) })
  gtReverbere(1, 21, 1, 0); gtReverbere(30, 21, -1, 0); gtReverbere(1, 30, 1, 0); gtReverbere(30, 30, -1, 0)
  gtBanc(9, 29, 'south', 3); gtBanc(20, 29, 'south', 3)
  bgVoiture(20, 21, 'x', 'gray', 2); S(3, 0, 27, 'minecraft:barrel[facing=up,open=false]'); S(4, 0, 27, 'supplementaries:sack'); S(3, 0, 28, 'minecraft:barrel[facing=north,open=true]')
  for (var i = 0; i < 16; i++) SA(Math.floor(R() * 32), 0, 19 + Math.floor(R() * 13), choix(['minecraft:white_carpet', 'minecraft:light_gray_carpet', 'supplementaries:book_pile']))
  // arriere : cour, tas de charbon, arbres morts
  gtArbreMort(6, 1, 6, true); gtArbreMort(25, 1, 7, true); F(15, 0, 1, 17, 0, 2, 'minecraft:coal_block'); S(16, 1, 1, 'minecraft:coal_block'); S(20, 0, 2, 'minecraft:barrel[facing=up,open=false]')
  gtVeg(0, 0, 31, 31, 0.3)
}
