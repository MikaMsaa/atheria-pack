
// ================= VERSIONS FINALES : bourg forestier, desert, gothique (trois quartiers cote a cote en z) =================
// Chaque batiment v1 est rejoue sous HB2 (memoire HM) avec une palette THM propre au quartier, puis finAuto() :
// detection des facades exterieures, volets et rideaux (finFacade), vaisselle et livres sur les tables et bureaux.

function finDehors(x, y, z, dx, dz, w) {
  for (var k = 1; k <= 14; k++) { var cx = x + dx * k, cz = z + dz * k; if (cx < -1 || cx > w || cz < -1 || cz > w) return true; if (!libreH(cx, y, cz)) return false }
  return true
}
function finAuto(w) {
  var vit = [], tab = []
  for (var k in HM) {
    var b = HM[k], p = k.split(','), x = p[0] - OX, y = p[1] - OY, z = p[2] - OZ
    if (y >= 1 && estVerre(b)) vit.push([x, y, z])
    else if (/^mcwfurnitures:.*(_table|_desk)$/.test(idDe(b))) tab.push([x, y, z])
  }
  var G = {}, nInv = 0, nPerdu = 0, nNouv = 0
  FIN_OK = {}
  // 08/11 : l'exterieur est le cote ouvert sur le ciel (3 blocs devant), l'interieur a un plafond (2 blocs derriere)
  function ciel(x, y, z) { for (var k = 1; k <= 30; k++) if (!libreH(x, y + k, z)) return false; return true }
  function ext(v, dd) { return libreH(v[0] + dd[0], v[1], v[2] + dd[1]) && ciel(v[0] + 3 * dd[0], v[1], v[2] + 3 * dd[1]) && !ciel(v[0] - 2 * dd[0], v[1], v[2] - 2 * dd[1]) }
  vit.forEach(v => {
    ;[[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(dd => {
      var vieux = finDehors(v[0], v[1], v[2], dd[0], dd[1], w) && !finDehors(v[0], v[1], v[2], -dd[0], -dd[1], w), neuf = ext(v, dd)
      if (vieux && !neuf) { if (ext(v, [-dd[0], -dd[1]])) nInv++; else nPerdu++ }
      if (neuf && !vieux) nNouv++
      if (!neuf) return
      FIN_OK[v[0] + ',' + v[1] + ',' + v[2] + '|' + (dd[0] || dd[1])] = 1
      var axe = dd[0] ? 'z' : 'x', pl = dd[0] ? v[0] : v[2], d = dd[0] || dd[1], a = dd[0] ? v[2] : v[0], key = axe + '|' + pl + '|' + d
      var g = G[key] || (G[key] = { axe: axe, p: pl, d: d, a1: a, a2: a, y1: v[1], y2: v[1] })
      g.a1 = Math.min(g.a1, a); g.a2 = Math.max(g.a2, a); g.y1 = Math.min(g.y1, v[1]); g.y2 = Math.max(g.y2, v[1])
    })
  })
  for (var key in G) { var g = G[key]; finFacade(g.axe, g.a1, g.a2, g.y1, g.y2, g.p, g.d) }
  if (nInv || nPerdu || nNouv) vlog('ORIENT ' + (typeof DIAG_SERIE == 'string' ? DIAG_SERIE + ' ' : '') + 'graine ' + GRAINE + ' vitres inversees ' + nInv + ' ambigues ' + nPerdu + ' gagnees ' + nNouv)
  FIN_OK = null
  // 08/11 : bannieres murales sans mur plein derriere (vide ou vitre)
  var DOS = { north: [0, 1], south: [0, -1], east: [-1, 0], west: [1, 0] }
  for (var k in HM) {
    var mb = /_wall_banner\[facing=(\w+)/.exec(HM[k]); if (!mb) continue
    var q = k.split(','), bx = q[0] - OX, by = q[1] - OY, bz = q[2] - OZ, o = DOS[mb[1]], derr = HM[hk(bx + o[0], by, bz + o[1])]
    if (!derr || derr == AIR || estVerre(derr) || /pane|bars|door|trapdoor|fence/.test(derr)) vlog('BANNIERE ' + (typeof DIAG_SERIE == 'string' ? DIAG_SERIE + ' ' : '') + 'graine ' + GRAINE + ' en ' + bx + ',' + by + ',' + bz + ' derriere ' + derr)
  }
  var DIRS = ['north', 'south', 'east', 'west']
  tab.forEach(t => { if (H3(t[0], t[1], t[2]) < 0.45 && libreH(t[0], t[1] + 1, t[2])) SA(t[0], t[1] + 1, t[2], choix(VAISS.concat(['handcrafted:stackable_book', 'handcrafted:berry_jam_jar'])).replace('{I}', DIRS[Math.floor(H3(t[0], 9, t[2]) * 4)])) })
}

// ---- palettes : lits et canapes Handcrafted (bois du quartier), sols de rue en paves Macaw ----
function finPalette(bois, rue) {
  var T = {}
  ;['white', 'orange', 'magenta', 'light_blue', 'yellow', 'lime', 'pink', 'gray', 'light_gray', 'cyan', 'purple', 'blue', 'brown', 'green', 'red', 'black'].forEach(c => {
    T['minecraft:' + c + '_bed'] = (x, y, z, b) => { var f = b.match(/facing=(\w+)/), p = b.match(/part=(\w+)/); return 'handcrafted:' + bois + '_fancy_bed[color=' + c + ',facing=' + f[1] + ',occupied=false,part=' + p[1] + ',shape=single]' }
    T['mcwfurnitures:' + c + '_couch'] = (x, y, z, b) => { var f = b.match(/facing=(\w+)/); return 'handcrafted:' + bois + '_couch[color=' + c + ',facing=' + f[1] + ',shape=single,waterlogged=false]' }
  })
  for (var id in rue) (function (id, l) { T[id] = (x, y, z) => { if (y != -1 || z < 32 || z > 47) return null; var h = H3(x, y, z), s = 0; for (var i = 0; i < l.length; i++) { s += l[i][1]; if (h < s) return l[i][0] } return null } })(id, rue[id])
  return T
}
var THM_BG = finPalette('spruce', {
  'minecraft:stone_bricks': [['mcwpaths:stone_running_bond', 0.55], ['mcwpaths:cobblestone_basket_weave_paving', 0.25]],
  'minecraft:cracked_stone_bricks': [['mcwpaths:stone_flagstone', 0.7]],
  'minecraft:mossy_stone_bricks': [['mcwpaths:mossy_stone_running_bond', 0.8]],
  'minecraft:andesite': [['mcwpaths:andesite_square_paving', 0.7]],
  'minecraft:cobblestone': [['mcwpaths:cobblestone_square_paving', 0.7]]
})
var THM_DS = finPalette('acacia', {
  'minecraft:cut_sandstone': [['mcwpaths:sandstone_basket_weave_paving', 0.5], ['mcwpaths:sandstone_running_bond', 0.3]],
  'minecraft:smooth_sandstone': [['mcwpaths:sandstone_flagstone', 0.5], ['mcwpaths:sandstone_square_paving', 0.25]],
  'minecraft:sandstone': [['mcwpaths:sandstone_square_paving', 0.6]],
  'minecraft:andesite': [['mcwpaths:andesite_strewn_rocky_path', 0.6]]
})
var THM_GT = finPalette('dark_oak', {
  'minecraft:cobblestone': [['mcwpaths:cobblestone_square_paving', 0.6], ['mcwpaths:cobblestone_honeycomb_paving', 0.15]],
  'minecraft:mossy_cobblestone': [['mcwpaths:mossy_cobblestone_square_paving', 0.8]],
  'minecraft:andesite': [['mcwpaths:andesite_square_paving', 0.7]],
  'minecraft:polished_andesite': [['mcwpaths:andesite_flagstone', 0.6]],
  'minecraft:stone_bricks': [['mcwpaths:stone_running_bond', 0.5], ['mcwpaths:stone_flagstone', 0.25]],
  'minecraft:mossy_stone_bricks': [['mcwpaths:mossy_stone_running_bond', 0.8]],
  'minecraft:cracked_stone_bricks': [['mcwpaths:stone_strewn_rocky_path', 0.5]]
})

// batiment final : memoire vide, volets/rideaux du quartier, construction v1 sous palette, finitions automatiques
function QF(fn, vol, rid) { return function () { HM = {}; FIN_VOLET = vol; FIN_RID = rid; fn(); finAuto(32); finAncrage() } }
var QFIN_DZ = [0, 128, 256]
var QFIN = function () {
  var X0 = VB.X0, Y0 = VB.Y0, Z0 = VB.Z0
  for (var cx = X0 - 16; cx < X0 + 296; cx += 16) for (var cz = Z0 + 96; cz < Z0 + 352; cz += 16) {
    VB.q.push('fill ' + cx + ' ' + Y0 + ' ' + cz + ' ' + (cx + 15) + ' ' + (Y0 + 76) + ' ' + (cz + 15) + ' minecraft:air')
    VB.q.push('fill ' + cx + ' ' + (Y0 - 5) + ' ' + cz + ' ' + (cx + 15) + ' ' + (Y0 - 2) + ' ' + (cz + 15) + ' minecraft:dirt')
    VB.q.push('fill ' + cx + ' ' + (Y0 - 1) + ' ' + cz + ' ' + (cx + 15) + ' ' + (Y0 - 1) + ' ' + (cz + 15) + ' minecraft:grass_block')
  }
  HB2 = true; FIN = true
  // --- bourg forestier ---
  VB.Z0 = Z0 + QFIN_DZ[0]; THM = THM_BG; HM = {}
  var vb = 'mcwwindows:spruce_shutter', rb = ['red', 'white', 'green', 'brown']
  bgRue(); finAncrage()
  lot(QF(bgMairie, vb, ['white', 'red']), 0, 0, 999, 131, 32, 30); lot(QF(bgSalleCommunale, null, null), 32, 0, 999, 141, 32, 36); lot(QF(bgPlace, vb, rb), 64, 0, 999, 151, 32, 12); lot(QF(bgMaisons, vb, rb), 96, 0, 999, 161, 32, 20)
  lot(QF(bgCommerces, vb, rb), 0, 48, 999, 171, 32, 20); lot(QF(bgEcole, vb, ['yellow', 'white']), 32, 48, 999, 181, 32, 24); lot(QF(bgAuberge, vb, rb), 64, 48, 999, 191, 32, 28); lot(QF(bgScierie, vb, null), 96, 48, 999, 201, 32, 23)
  lot(QF(bgMairie, vb, ['white', 'red']), 144, 0, 5, 131, 32, 30); lot(QF(bgMaisons, vb, rb), 180, 0, 5, 161, 32, 20)
  lot(QF(bgCommerces, vb, rb), 144, 48, 5, 171, 32, 20); lot(QF(bgEcole, vb, ['yellow', 'white']), 180, 48, 5, 181, 32, 24); lot(QF(bgAuberge, vb, rb), 216, 48, 5, 191, 32, 28); lot(QF(bgAuberge, vb, rb), 252, 48, 11, 191, 32, 28)
  // --- desert ---
  VB.Z0 = Z0 + QFIN_DZ[1]; THM = THM_DS; HM = {}
  var vd = 'mcwwindows:acacia_louvered_shutter', rd = ['orange', 'yellow', 'white', 'red', 'cyan']
  OX = VB.X0; OY = VB.Y0; OZ = VB.Z0; CUT = 999; GRAINE = 207; HM = {}; dsRue(); finAncrage()
  lot(QF(dsRelais, null, ['white']), 0, 0, 999, 211, 32, 21); lot(QF(dsMairie, vd, rd), 32, 0, 999, 221, 32, 23); lot(QF(dsSoukF, vd, rd), 64, 0, 999, 231, 32, 12); lot(QF(dsPueblo, vd, rd), 96, 0, 999, 241, 32, 26)
  lot(QF(dsMotel, vd, rd), 0, 48, 999, 251, 32, 20); lot(QF(dsStation, null, ['white']), 32, 48, 999, 261, 32, 20); lot(QF(dsSherif, vd, ['white', 'brown']), 64, 48, 999, 271, 32, 20); lot(QF(dsOasis, vd, rd), 96, 48, 999, 281, 32, 26)
  lot(QF(dsRelais, null, ['white']), 144, 0, 9, 211, 32, 21); lot(QF(dsMairie, vd, rd), 180, 0, 5, 221, 32, 23); lot(QF(dsPueblo, vd, rd), 216, 0, 11, 241, 32, 26); lot(QF(dsMairie, vd, rd), 252, 0, 11, 221, 32, 23)
  lot(QF(dsMotel, vd, rd), 144, 48, 3, 251, 32, 20); lot(QF(dsStation, null, ['white']), 180, 48, 3, 261, 32, 20); lot(QF(dsSherif, vd, ['white', 'brown']), 216, 48, 8, 271, 32, 20)
  // --- gothique ---
  VB.Z0 = Z0 + QFIN_DZ[2]; THM = THM_GT; HM = {}
  var vg = 'mcwwindows:dark_oak_shutter', rg = ['purple', 'black', 'gray', 'red', 'brown']
  OX = VB.X0; OY = VB.Y0; OZ = VB.Z0; CUT = 999; GRAINE = 91; HM = {}; gtRue(); finAncrage()
  lot(QF(gtHalleDraps, null, null), 0, 0, 999, 311, 32, 44); lot(QF(gtBeffroi, vg, rg), 32, 0, 999, 321, 32, 44); lot(QF(gtMaisons, vg, rg), 64, 0, 999, 331, 32, 30); lot(QF(gtSquareClos, null, null), 96, 0, 999, 341, 32, 18)
  lot(QF(gtHospice, vg, ['white', 'light_gray']), 0, 48, 999, 351, 32, 20); lot(QF(gtBibliotheque, vg, ['red', 'green']), 32, 48, 999, 361, 32, 26); lot(QF(gtQuai, vg, rg), 64, 48, 999, 371, 32, 20); lot(QF(gtJardin, vg, rg), 96, 48, 999, 381, 32, 18)
  lot(QF(gtHalleDraps, null, null), 144, 0, 9, 311, 32, 44); lot(QF(gtBeffroi, vg, rg), 180, 0, 12, 321, 32, 44); lot(QF(gtMaisons, vg, rg), 216, 0, 7, 331, 32, 30)
  lot(QF(gtHospice, vg, ['white', 'light_gray']), 144, 48, 9, 351, 32, 20); lot(QF(gtBibliotheque, vg, ['red', 'green']), 180, 48, 10, 361, 32, 26); lot(QF(gtQuai, vg, rg), 216, 48, 5, 371, 32, 20)
  vlog('FIN volets ' + FIN_NV + ' rideaux ' + FIN_NR)
  VB.Z0 = Z0; HB2 = false; FIN = false; THM = null; HM = {}
}
var QFIN_VUES = function () {
  var Z0 = VB.Z0
  VB.Z0 = Z0 + QFIN_DZ[0]; vuesBourg()
  VB.Z0 = Z0 + QFIN_DZ[1]; vuesDesert()
  VB.Z0 = Z0 + QFIN_DZ[2]; vuesGothique()
  VB.Z0 = Z0
}

function dsSoukF() { dsSouk(); SA(2, 1, 13, 'supplementaries:sack') }  // comble le seul vide de l'audit (entre deux marchandises)
