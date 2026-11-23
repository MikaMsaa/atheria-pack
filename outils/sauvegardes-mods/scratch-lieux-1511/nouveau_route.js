// mur demoli : les murs tombent a une hauteur irreguliere (1 a 5), plus de toit ni d'etage, gravats en tas dedans et au pied
function mjDemolie(x1, z1, x2, z2) {
  for (var k in HM) {
    var p = k.split(','), x = p[0] - OX, y = p[1] - OY, z = p[2] - OZ, b = HM[k]
    if (x < x1 || x > x2 || z < z1 || z > z2 || b == AIR || y < 1) continue
    var h = 1 + Math.floor((lbBruit(Math.floor((x + z) / 2), 0, 3.3) + 1.5) * 1.4)
    if (y > h) S(x, y, z, AIR)
    else if (/(glass_pane|mcwdoors|awning|handcrafted|mcwfurnitures|_bed|wool|carpet|_crate|rice_bag|jar|encased_fan)/.test(b)) S(x, y, z, AIR)
  }
  for (var x = x1 - 2; x <= x2 + 2; x++) for (var z = z1 - 2; z <= z2 + 2; z++) {
    var dedans = x > x1 && x < x2 && z > z1 && z < z2, n = lbBruit(x, z, 4.4)
    if (!libreH(x, 0, z) || libreH(x, -1, z)) continue
    if (dedans ? n > -0.4 : n > 0.5) { var r = R(); S(x, 0, z, r < 0.4 ? 'minecraft:gravel' : r < 0.7 ? 'minecraft:cobblestone' : 'minecraft:smooth_stone'); if (dedans && n > 0.8 && libreH(x, 1, z)) S(x, 1, z, R() < 0.5 ? 'minecraft:cobblestone_slab[type=bottom,waterlogged=false]' : 'minecraft:gravel') }
  }
}
// barricade de survivants : futs, sacs empiles, planches, toles, palettes, le long d'une ligne
function mjBarricade(x1, z1, x2, z2) {
  for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) {
    if (!libreH(x, 0, z)) continue
    var r = R()
    if (r < 0.25) { S(x, 0, z, 'minecraft:barrel[facing=up,open=false]'); if (R() < 0.6) S(x, 1, z, 'supplementaries:sack') }
    else if (r < 0.5) { S(x, 0, z, 'minecraft:spruce_planks'); S(x, 1, z, R() < 0.7 ? 'minecraft:spruce_planks' : 'minecraft:spruce_slab[type=bottom,waterlogged=false]') }
    else if (r < 0.72) { S(x, 0, z, 'createdeco:iron_sheet_metal'); S(x, 1, z, 'createdeco:zinc_sheet_metal') }
    else if (r < 0.9) S(x, 0, z, 'supplementaries:sack')
    else S(x, 0, z, 'minecraft:spruce_slab[type=bottom,waterlogged=false]')
  }
}

function mjRoute() {
  var N = 127, OX0 = OX
  // sol : chaussee x50..63, bas-cotes x44..49 et x64..69 (les maisons sont a 6 blocs de la route)
  for (var x = 0; x <= 127; x++) for (var z = 0; z <= N; z++) {
    var b
    if (x >= 50 && x <= 63) { var n = lbBruit(Math.floor(x / 3), Math.floor(z / 3), 7.3), m = lbBruit(x, z, 3.9); b = (x == 51 || x == 62) ? 'minecraft:white_concrete' : (x == 56 && z % 8 < 4) ? 'minecraft:white_concrete' : m > 1.6 ? 'minecraft:cyan_terracotta' : n > 1.0 ? 'minecraft:black_concrete' : n < -1.25 ? 'minecraft:light_gray_concrete' : 'minecraft:gray_concrete' }
    else if (x == 49 || x == 64) b = 'minecraft:gravel'
    else if (x >= 44 && x <= 69) { var n = lbBruit(x, z, 1.9); b = n > 1.1 ? 'minecraft:coarse_dirt' : 'minecraft:grass_block[snowy=false]' }
    else { var n = lbBruit(x, z, 1.9); b = n > 0.6 ? 'minecraft:coarse_dirt' : n < -0.9 ? 'minecraft:packed_mud' : 'minecraft:grass_block[snowy=false]' }
    S(x, -1, z, b)
  }
  for (var z = 0; z <= N; z++) { [50, 63].forEach(x => { if (R() < 0.18) S(x, -1, z, 'minecraft:moss_block') }) }
  var P = RM_PEINT
  // ===== cote ouest, decale de 4 vers la route (facades a x43) =====
  OX = OX0 + 4
  mjSolRuelle(20, 24, 0, N)
  rmBat(-1, 39, 6, 10, 13, 2, P[1], 'ouvert', { attente: true, pignons: [6, 15] })
  rmBat(-1, 39, 19, 9, 11, 1, P[3], 'maison', { attente: true, pignons: [19] })
  rmBat(-1, 39, 30, 12, 12, 2, P[5], 'piece', { attente: true, pignons: [30, 41] })
  rmBat(-1, 39, 44, 8, 10, 1, P[2], 'maison', { attente: true })
  rmBat(-1, 39, 54, 8, 12, 1, P[4], 'maison', { attente: true, pignons: [54, 61] })
  rmBat(-1, 39, 64, 13, 12, 2, P[6], 'vitrine', { pignons: [76] })
  rmBat(-1, 39, 80, 12, 14, 3, P[0], 'vitrine', { balcons: true, pignons: [80, 91] })
  rmBat(-1, 39, 94, 10, 11, 1, P[8], 'maison', { attente: true, pignons: [94, 103] })
  rmBat(-1, 39, 106, 10, 13, 2, P[3], 'maison', { linge: true, pignons: [106, 115] })
  rmBat(-1, 39, 118, 9, 12, 2, P[7], 'ouvert', { attente: true, pignons: [118] })
  ;[[2, 10, 2, 'maison', 1], [14, 12, 3, 'maison', 2], [30, 8, 4, 'ouvert', 1], [40, 12, 0, 'maison', 2], [56, 10, 6, 'maison', 1], [70, 12, 8, 'maison', 2], [86, 10, 1, 'ouvert', 1], [100, 12, 5, 'maison', 2], [116, 10, 2, 'maison', 1]]
    .forEach(h => rmBat(-1, 19, h[0], h[1], 9, h[4], P[h[2]], h[3], { attente: true, pignons: [h[0], h[0] + h[1] - 1] }))
  mjAbandon(0, 0, 40, N)
  mjRuine(30, 44, 39, 51, 4, 34, 48, 3, true); rmManguier(34, 48)          // maison brulee de la RN1, un manguier pousse dedans
  mjRuine(11, 56, 19, 65, 4, 14, 61, 3, false)                              // toit effondre
  mjRuine(29, 94, 39, 103, 4, 34, 98, 3, false)                             // toit effondre sur la RN1
  mjDemolie(11, 86, 19, 95)                                                 // maison demolie, murs a mi-hauteur
  ;[[2, 4, 7, 8, 6], [3, 30, 8, 35, 32], [1, 72, 6, 77, 74], [3, 104, 8, 109, 106]].forEach(b => rmBanga(b[0], b[1], b[2], b[3], b[4]))
  ;[[0, 13, 10, 13], [0, 27, 10, 27], [0, 53, 10, 53], [0, 84, 10, 84], [0, 113, 10, 113]].forEach(m => mjTole(m[0], m[1], m[2], m[3]))
  ;[[0, 0, 0, 127], [25, 16, 28, 16], [25, 28, 28, 28], [25, 52, 28, 52], [25, 78, 28, 78]].forEach(m => mjMuret(m[0], m[1], m[2], m[3]))
  // barricades : bouches des passages sur la RN1, bouts de la ruelle
  ;[[39, 16, 39, 18], [39, 42, 39, 43], [39, 77, 39, 79], [39, 104, 39, 105], [20, 1, 24, 1], [20, 126, 24, 126]].forEach(m => mjBarricade(m[0], m[1], m[2], m[3]))
  bgVoiture(21, 36, 'z', 'white', 1); bgVoiture(22, 82, 'z', 'red', 2); bgVoiture(30, 77, 'x', 'white', 1, true)
  ;[[24, 10], [24, 58], [24, 110]].forEach(p => rmPoteau(p[0], p[1], 'z')); mjPoteauTombe(23, 86, 6)
  ;[[5, 20], [6, 62], [4, 94]].forEach(p => rmManguier(p[0], p[1]))
  ;[[7, 40], [8, 48], [2, 88], [6, 122], [25, 18]].forEach((p, i) => rmBananier(p[0], p[1], 4 + (i % 2)))
  ;[[26, 46], [26, 70], [12, 26], [20, 64]].forEach(p => mjBuisson(p[0], p[1], 2))
  ;[[40, 6, 8, 'west'], [40, 6, 33, 'west'], [40, 3, 58, 'west'], [27, 6, 70, 'east'], [26, 6, 110, 'east'], [20, 6, 18, 'west']].forEach(v => lxLiane(v[0], v[1], v[2], v[3], 4))
  // ===== cote est, decale de 4 vers la route (facades a x70) =====
  OX = OX0 - 4
  mjSolRuelle(88, 91, 0, N)
  rmBat(1, 74, 0, 8, 10, 1, P[5], 'maison', { attente: true, pignons: [7] })
  rmBat(1, 74, 10, 12, 13, 2, P[2], 'maison', { attente: true, pignons: [10, 21] })
  rmBat(1, 74, 24, 13, 12, 2, P[1], 'ouvert', { pignons: [24, 36] })
  rmBat(1, 74, 40, 8, 12, 1, P[6], 'ouvert', { pignons: [40, 47] })
  rmBat(1, 74, 50, 11, 11, 1, P[0], 'maison', { attente: true, pignons: [50, 60] })
  rmBat(1, 74, 64, 12, 14, 2, P[8], 'vitrine', { balcons: true, pignons: [64, 75] })
  rmBat(1, 74, 78, 15, 13, 3, P[4], 'vitrine', { pignons: [78, 92] })
  rmBat(1, 74, 96, 10, 13, 3, P[7], 'maison', { attente: true, pignons: [96, 105] })
  rmBat(1, 74, 108, 11, 12, 2, P[3], 'maison', { attente: true, linge: true, pignons: [108, 118] })
  ;[[4, 10, 7, 'maison', 1], [18, 12, 0, 'maison', 2], [34, 10, 3, 'ouvert', 1], [48, 12, 6, 'maison', 2], [66, 10, 2, 'maison', 1], [80, 12, 5, 'maison', 2], [96, 12, 8, 'maison', 1], [112, 12, 1, 'maison', 2]]
    .forEach(h => rmBat(1, 92, h[0], h[1], 9, h[4], P[h[2]], h[3], { attente: true, pignons: [h[0], h[0] + h[1] - 1] }))
  mjAbandon(73, 0, 127, N)
  mjRuine(92, 34, 100, 43, 4, 97, 38, 2, true)                              // maison brulee, 2e rangee
  mjRuine(92, 80, 100, 91, 7, 96, 85, 3, true)                              // R+1 brule, toit perce
  mjDemolie(74, 50, 84, 60)                                                 // maison demolie sur la RN1
  ;[[106, 8, 111, 12, 10], [112, 40, 117, 45, 42], [105, 70, 110, 75, 72], [114, 100, 119, 105, 102]].forEach(b => rmBanga(b[0], b[1], b[2], b[3], b[4]))
  ;[[101, 16, 127, 16], [101, 31, 127, 31], [101, 62, 127, 62], [101, 93, 127, 93], [101, 125, 127, 125]].forEach(m => mjTole(m[0], m[1], m[2], m[3]))
  mjMuret(127, 0, 127, 127)
  ;[[74, 37, 74, 39], [74, 61, 74, 63], [74, 93, 74, 95], [74, 119, 74, 124], [88, 126, 91, 126], [88, 1, 91, 1]].forEach(m => mjBarricade(m[0], m[1], m[2], m[3]))
  bgVoiture(89, 46, 'z', 'light_gray', 1); bgVoiture(89, 104, 'z', 'blue', 0); bgVoiture(104, 52, 'x', 'black', 2)
  ;[[88, 14], [88, 72], [88, 120]].forEach(p => rmPoteau(p[0], p[1], 'z')); mjPoteauTombe(90, 26, 7)
  ;[[116, 24], [118, 56], [110, 84], [120, 116]].forEach(p => rmManguier(p[0], p[1]))
  ;[[104, 4], [107, 28], [102, 60], [106, 90], [103, 110], [104, 40]].forEach((p, i) => rmBananier(p[0], p[1], 4 + (i % 2)))
  ;[[87, 38], [87, 86], [101, 22], [91, 64]].forEach(p => mjBuisson(p[0], p[1], 2))
  ;[[73, 6, 13, 'east'], [73, 6, 67, 'east'], [73, 9, 100, 'east'], [86, 6, 30, 'west'], [86, 6, 112, 'west'], [91, 6, 52, 'east']].forEach(v => lxLiane(v[0], v[1], v[2], v[3], 4))
  // ===== passes communes =====
  OX = OX0
  mjUsure()
  mjDechets(80, 0, 0, 42, N); mjDechets(80, 71, 0, 127, N)
  for (var i = 0; i < 1800; i++) { var x = Math.floor(R() * 128), z = Math.floor(R() * 128); if (x >= 44 && x <= 69) continue; if (libreH(x, 0, z) && /grass_block|coarse_dirt/.test(HM[hk(x, -1, z)] || '')) SA(x, 0, z, R() < 0.65 ? 'minecraft:short_grass' : R() < 0.6 ? 'minecraft:fern' : 'minecraft:dead_bush') }
  lxNettoyer(/(pane|_bars|fence|chain|_slab|leaves|carpet|_wool|lantern|cocoa|vine|grass|fern|dead_bush|button|sack)/)
}

var QFIN_RN1 = function () {
  HB2 = true; FIN = true; THM = null
  lot(function () { HM = {}; FIN_VOLET = null; FIN_RID = null; mjRoute(); finAncrage() }, 0, 0, 999, 7001, 128, 30)
  HB2 = false; FIN = false; THM = null; HM = {}
}
function vuesRN1() {
  vue('n_rn1', 0, 0, 56.5, 1.6, 1, 56.5, 2, 127)
  vue('n_rn1_haut', 0, 0, 56.5, 22, -12, 56.5, 0, 70)
  vue('n_bas_cote', 0, 0, 47, 1.6, 4, 47, 2, 70)
  vue('n_piece_dehors', 0, 0, 54, 1.7, 36, 43, 2, 36)
  vue('n_piece_seuil', 0, 0, 41, 1.7, 36, 32, 1.2, 33)
  vue('n_barricade', 0, 0, 55, 1.7, 36, 43, 1, 42.5)
  vue('n_brulee', 0, 0, 52, 3, 54, 39, 2, 47)
  vue('n_demolie', 0, 0, 58, 4, 46, 74, 1, 55)
  vue('n_ruelle_ouest', 0, 0, 26.5, 1.7, 3, 26.5, 1.2, 60)
  vue('n_ruelle_est', 0, 0, 85.5, 1.7, 124, 85.5, 1.2, 70)
  vue('n_cours', 0, 0, 121, 9, 4, 96, 0, 40)
  vue('n_majicavo', 0, 0, 56.5, 14, 128, 56.5, 0, 60)
  vue('n_dessus', 0, 0, 64, 75, -25, 64, 0, 64)
}
