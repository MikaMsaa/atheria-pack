// ================= RN1 A MAJICAVO ET LA PIECE AUX DAKOUANE (lot70, 14/11, v2) : lieux 4 et 5 du trailer =================
// Fiche RN1 : ligne droite de 120 blocs ou plus, chaussee de 12 a 15, bas-cotes libres sur 10, denivele < 3.
// Fiche Majicavo : piece de 9 x 9 ou plus sur 4 de haut, une baie de 1 a 2, aucune lumiere (8 a 10 Dakouane poses par le trailer).
// v2 (retour de Mika : quelques maisons posees) : un vrai quartier mort des deux cotes de la RN1.
//   1re rangee sur la RN1 (facades x39 / x74) presque continue, coupee de passages ; ruelles arriere x20..24 et x88..91 ;
//   2e rangee tournee vers les ruelles (facades x19 / x92) ; au-dela, bangas, cours, clotures de tole, manguiers.
//   Abandon : carreaux casses, portes arrachees, fenetres condamnees, maisons brulees, toit effondre, epaves, poteaux tombes, gravats, vegetation.
// La piece : rez-de-chaussee de la maison ouest z30..41 (interieur 10 x 10 x 4), baie de 2 sur la RN1, aucune fenetre. Bas-cotes x40..49 et x64..73 laisses libres.
function mjAbandon(x1, z1, x2, z2) {
  for (var k in HM) {
    var p = k.split(','), x = p[0] - OX, y = p[1] - OY, z = p[2] - OZ, b = HM[k]
    if (x < x1 || x > x2 || z < z1 || z > z2) continue
    if (/glass_pane/.test(b)) { var r = R(); if (r < 0.35) S(x, y, z, AIR); else if (r < 0.43 && y >= 5) S(x, y, z, 'minecraft:spruce_planks') }
    else if (/awning/.test(b) && R() < 0.45) S(x, y, z, AIR)
    else if (/mcwdoors:/.test(b) && (x * 7 + z * 13) % 10 < 4) S(x, y, z, AIR)
  }
}
// ruine : toit effondre sur un disque (gravats au sol), rien ne reste sur le toit ; si brule : murs noircis, bois et mobilier partis, cendre au sol
function mjRuine(x1, z1, x2, z2, yR, cx, cz, rr, brule) {
  for (var k in HM) {
    var p = k.split(','), x = p[0] - OX, y = p[1] - OY, z = p[2] - OZ, b = HM[k]
    if (x < x1 || x > x2 || z < z1 || z > z2 || b == AIR) continue
    var bord = x == x1 || x == x2 || z == z1 || z == z2, dedans = (x - cx) * (x - cx) + (z - cz) * (z - cz) <= rr * rr
    if (y > yR + 1) { S(x, y, z, AIR); continue }
    if (y == yR + 1 && (dedans || R() < 0.35)) { S(x, y, z, AIR); continue }
    if (y == yR && !bord && dedans) { S(x, y, z, AIR); continue }
    if (!brule) continue
    if (/(glass_pane|mcwdoors|awning|handcrafted|mcwfurnitures|barrel|_bed|wool|carpet|sack|_crate|rice_bag|jar|planks|encased_fan|_slab\[type=top)/.test(b)) { S(x, y, z, AIR); continue }
    // suie par plaques (cellules de 2), plus noire en montant : les flammes sortaient par le haut
    if (bord && y >= 0 && y < yR && /(terracotta|_concrete)/.test(b)) { var n = lbBruit(Math.floor((x + z) / 2), Math.floor(y / 2), 5.7) + y * 0.3; S(x, y, z, n > 0.7 ? 'minecraft:black_concrete' : n > -0.1 ? 'minecraft:gray_concrete' : b) }
    else if (bord && y == yR) S(x, y, z, R() < 0.5 ? 'minecraft:black_concrete' : 'minecraft:gray_concrete')
  }
  for (var x = x1 + 1; x < x2; x++) for (var z = z1 + 1; z < z2; z++) {
    var dedans = (x - cx) * (x - cx) + (z - cz) * (z - cz) <= rr * rr
    if (brule) S(x, -1, z, R() < 0.45 ? 'minecraft:black_concrete_powder' : R() < 0.5 ? 'minecraft:coal_block' : 'minecraft:gray_concrete')
    if (dedans && libreH(x, 0, z)) { var r = R(); if (r < 0.35) S(x, 0, z, 'minecraft:gravel'); else if (r < 0.6) S(x, 0, z, 'minecraft:cobblestone_slab[type=bottom,waterlogged=false]'); else if (r < 0.72) S(x, 0, z, 'minecraft:smooth_stone_slab[type=bottom,waterlogged=false]') }
  }
}
// usure de tout le quartier (hors RN1) : coulures sous les nez de dalle et les toits, algues en pied de mur,
// cuves d'eau tombees ou volees, toits moussus, marchandises pourries ou pillees
var MJ_SALE = { 'minecraft:white_concrete': 'minecraft:light_gray_concrete', 'minecraft:light_gray_concrete': 'minecraft:gray_concrete' }
function mjSale(b) { if (MJ_SALE[b]) return MJ_SALE[b]; if (/(yellow|orange|pink|white|red|brown)_terracotta/.test(b)) return 'minecraft:brown_terracotta'; if (/_terracotta/.test(b)) return 'minecraft:gray_terracotta'; return 'minecraft:gray_concrete' }
function mjUsure() {
  var cuves = {}, L = []
  for (var k in HM) { var p = k.split(','); L.push([p[0] - OX, p[1] - OY, p[2] - OZ, HM[k]]) }
  L.forEach(e => {
    var x = e[0], y = e[1], z = e[2], b = e[3]
    if (x >= 40 && x <= 73) return
    var dessus = HM[hk(x, y + 1, z)] || AIR
    // coulure : sous une dalle, une colonne sur trois environ descend de 1 a 3 blocs
    if (y >= 1 && /(terracotta|_concrete)$/.test(b) && /(smooth_stone|white_concrete)/.test(dessus) && lbBruit(x * 3 + z, y, 4.1) > 0.9 && R() < 0.6) {
      var l = 1 + Math.floor(R() * 2)
      for (var i = 0; i < l; i++) { var bb = HM[hk(x, y - i, z)]; if (bb != b || y - i < 1) break; S(x, y - i, z, mjSale(b)) }
    }
    // algues et salissures en pied de mur (soubassement pose sur la dalle de la maison)
    if (y == 0 && b == 'minecraft:light_gray_concrete' && HM[hk(x, -1, z)] == 'minecraft:smooth_stone') { var n = lbBruit(Math.floor((x + z) / 2), 0, 6.3); if (n > 0.5) S(x, 0, z, 'minecraft:green_terracotta'); else if (n > -0.2) S(x, 0, z, 'minecraft:gray_concrete') }
    // cuves : une sur deux a disparu (2 x 2 x 3, decision par cuve)
    if (b == 'minecraft:black_carpet' && y >= 7) {
      var cx = /black_carpet/.test(HM[hk(x - 1, y, z)] || '') ? x - 1 : x, cz = /black_carpet/.test(HM[hk(x, y, z - 1)] || '') ? z - 1 : z, c = cx + ',' + cz
      if (cuves[c] === undefined) cuves[c] = R() < 0.5
      if (cuves[c]) for (var i = 0; i <= 2; i++) S(x, y - i, z, AIR)
    }
    // toit : mousse et feuilles mortes par plaques, la ou rien n'est au-dessus
    if (y >= 4 && b == 'minecraft:smooth_stone' && dessus == AIR && libreH(x, y + 2, z) && libreH(x, y + 3, z) && libreH(x, y + 4, z) && lbBruit(Math.floor(x / 2), Math.floor(z / 2), 8.8) > 0.6 && R() < 0.8) S(x, y + 1, z, R() < 0.75 ? 'minecraft:moss_carpet' : 'minecraft:brown_carpet')
    // etals pilles : cagettes et sacs en partie partis
    if (/(_crate|rice_bag)/.test(b) && R() < 0.6) S(x, y, z, AIR)
    if (/(supplementaries:jar|terracotta_wide_pot)/.test(b) && R() < 0.5) S(x, y, z, AIR)
  })
  // buissons au pied des murs
  var n = 0
  for (var i = 0; i < 900 && n < 40; i++) {
    var x = Math.floor(R() * 128), z = Math.floor(R() * 128)
    if (x >= 38 && x <= 75) continue
    if (!libreH(x, 0, z) || libreH(x, -1, z)) continue
    var mur = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(o => /(terracotta|light_gray_concrete|gray_concrete)/.test(HM[hk(x + o[0], 1, z + o[1])] || ''))
    if (mur) { mjBuisson(x, z, 1); n++ }
  }
}
function mjSolRuelle(x1, x2, z1, z2) { for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) { var n = lbBruit(x, z, 2.3); S(x, -1, z, n > 0.9 ? 'minecraft:gravel' : n < -1.0 ? 'minecraft:mud' : R() < 0.5 ? 'minecraft:packed_mud' : 'minecraft:coarse_dirt') } }
function mjTole(x1, z1, x2, z2) { for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) { if (!libreH(x, 0, z) || R() < 0.12) continue; S(x, 0, z, R() < 0.5 ? 'createdeco:iron_sheet_metal' : 'createdeco:zinc_sheet_metal'); if (R() < 0.8 && libreH(x, 1, z)) S(x, 1, z, R() < 0.5 ? 'createdeco:iron_sheet_metal' : 'createdeco:zinc_sheet_metal') } }
function mjMuret(x1, z1, x2, z2) { for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) if (libreH(x, 0, z) && R() > 0.1) S(x, 0, z, 'minecraft:light_gray_concrete') }
// poteau electrique tombe : moignon de 3, fut couche au sol vers +z, cable par terre
function mjPoteauTombe(x, z, l) {
  F(x, 0, z, x, 2, z, 'minecraft:stone_brick_wall')
  for (var i = 1; i <= l; i++) if (libreH(x, 0, z + i)) S(x, 0, z + i, i == l ? 'minecraft:smooth_stone' : 'minecraft:smooth_stone_slab[type=bottom,waterlogged=false]')
  for (var i = l + 1; i <= l + 6; i++) if (libreH(x, 0, z + i)) S(x, 0, z + i, 'minecraft:chain[axis=z,waterlogged=false]')
}
function mjDechets(n, x1, z1, x2, z2) {
  var L = ['minecraft:gravel', 'minecraft:cobblestone_slab[type=bottom,waterlogged=false]', 'supplementaries:sack', 'minecraft:barrel[facing=up,open=true]', 'minecraft:smooth_stone_slab[type=bottom,waterlogged=false]', 'minecraft:dead_bush']
  for (var i = 0; i < n; i++) {
    var x = x1 + Math.floor(R() * (x2 - x1 + 1)), z = z1 + Math.floor(R() * (z2 - z1 + 1)), b = choix(L)
    if (!libreH(x, 0, z) || libreH(x, -1, z)) continue
    if (b == 'minecraft:dead_bush' && !/(dirt|mud|grass)/.test(HM[hk(x, -1, z)] || '')) continue
    S(x, 0, z, b)
  }
}
function mjBuisson(x, z, r) { for (var dx = -r; dx <= r; dx++) for (var dz = -r; dz <= r; dz++) for (var dy = 0; dy <= 1; dy++) if (dx * dx + dz * dz + dy * dy * 3 <= r * r + 1 && R() < 0.85 && libreH(x + dx, dy, z + dz) && !libreH(x + dx, dy - 1, z + dz)) S(x + dx, dy, z + dz, R() < 0.6 ? 'minecraft:jungle_leaves[distance=1,persistent=true,waterlogged=false]' : 'minecraft:azalea_leaves[distance=1,persistent=true,waterlogged=false]') }

function mjRoute() {
  var N = 127
  for (var x = 0; x <= 127; x++) for (var z = 0; z <= N; z++) {
    var b
    if (x >= 50 && x <= 63) { var n = lbBruit(Math.floor(x / 3), Math.floor(z / 3), 7.3), m = lbBruit(x, z, 3.9); b = (x == 51 || x == 62) ? 'minecraft:white_concrete' : (x == 56 && z % 8 < 4) ? 'minecraft:white_concrete' : m > 1.6 ? 'minecraft:cyan_terracotta' : n > 1.0 ? 'minecraft:black_concrete' : n < -1.25 ? 'minecraft:light_gray_concrete' : 'minecraft:gray_concrete' }
    else if (x == 49 || x == 64) b = 'minecraft:gravel'
    else if (x >= 40 && x <= 73) { var n = lbBruit(x, z, 1.9); b = n > 1.1 ? 'minecraft:coarse_dirt' : 'minecraft:grass_block[snowy=false]' }
    else { var n = lbBruit(x, z, 1.9); b = n > 0.6 ? 'minecraft:coarse_dirt' : n < -0.9 ? 'minecraft:packed_mud' : 'minecraft:grass_block[snowy=false]' }
    S(x, -1, z, b)
  }
  for (var z = 0; z <= N; z++) { [50, 63].forEach(x => { if (R() < 0.18) S(x, -1, z, 'minecraft:moss_block') }) }
  mjSolRuelle(20, 24, 0, N); mjSolRuelle(88, 91, 0, N)
  var P = RM_PEINT
  // 1re rangee ouest, sur la RN1
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
  // 1re rangee est
  rmBat(1, 74, 0, 8, 10, 1, P[5], 'maison', { attente: true, pignons: [7] })
  rmBat(1, 74, 10, 12, 13, 2, P[2], 'maison', { attente: true, pignons: [10, 21] })
  rmBat(1, 74, 24, 13, 12, 2, P[1], 'ouvert', { pignons: [24, 36] })
  rmBat(1, 74, 40, 8, 12, 1, P[6], 'ouvert', { pignons: [40, 47] })
  rmBat(1, 74, 50, 11, 11, 1, P[0], 'maison', { attente: true, pignons: [50, 60] })
  rmBat(1, 74, 64, 12, 14, 2, P[8], 'vitrine', { balcons: true, pignons: [64, 75] })
  rmBat(1, 74, 78, 15, 13, 3, P[4], 'vitrine', { pignons: [78, 92] })
  rmBat(1, 74, 96, 10, 13, 3, P[7], 'maison', { attente: true, pignons: [96, 105] })
  rmBat(1, 74, 108, 11, 12, 2, P[3], 'maison', { attente: true, linge: true, pignons: [108, 118] })
  // 2e rangees, tournees vers les ruelles
  ;[[2, 10, 2, 'maison', 1], [14, 12, 3, 'maison', 2], [30, 8, 4, 'ouvert', 1], [40, 12, 0, 'maison', 2], [56, 10, 6, 'maison', 1], [70, 12, 8, 'maison', 2], [86, 10, 1, 'ouvert', 1], [100, 12, 5, 'maison', 2], [116, 10, 2, 'maison', 1]]
    .forEach(h => rmBat(-1, 19, h[0], h[1], 9, h[4], P[h[2]], h[3], { attente: true, pignons: [h[0], h[0] + h[1] - 1] }))
  ;[[4, 10, 7, 'maison', 1], [18, 12, 0, 'maison', 2], [34, 10, 3, 'ouvert', 1], [48, 12, 6, 'maison', 2], [66, 10, 2, 'maison', 1], [80, 12, 5, 'maison', 2], [96, 12, 8, 'maison', 1], [112, 12, 1, 'maison', 2]]
    .forEach(h => rmBat(1, 92, h[0], h[1], 9, h[4], P[h[2]], h[3], { attente: true, pignons: [h[0], h[0] + h[1] - 1] }))
  mjAbandon(0, 0, 127, N)
  // ruines : maison brulee sur la RN1 (un manguier pousse dans le trou du toit), toit effondre en 2e rangee ouest, maison brulee en 2e rangee est
  mjRuine(30, 44, 39, 51, 4, 34, 48, 3, true)
  rmManguier(34, 48)
  mjRuine(11, 56, 19, 65, 4, 14, 61, 3, false)
  mjRuine(92, 34, 100, 43, 4, 97, 38, 2, true)
  // bangas et cours au-dela des 2e rangees
  ;[[2, 4, 7, 8, 6], [3, 30, 8, 35, 32], [1, 72, 6, 77, 74], [3, 104, 8, 109, 106], [106, 8, 111, 12, 10], [112, 40, 117, 45, 42], [105, 70, 110, 75, 72], [114, 100, 119, 105, 102]].forEach(b => rmBanga(b[0], b[1], b[2], b[3], b[4]))
  ;[[0, 13, 10, 13], [0, 27, 10, 27], [0, 53, 10, 53], [0, 84, 10, 84], [0, 113, 10, 113], [101, 16, 127, 16], [101, 31, 127, 31], [101, 62, 127, 62], [101, 93, 127, 93], [101, 125, 127, 125]].forEach(m => mjTole(m[0], m[1], m[2], m[3]))
  ;[[0, 0, 0, 127], [127, 0, 127, 127], [25, 16, 28, 16], [25, 28, 28, 28], [25, 52, 28, 52], [25, 78, 28, 78]].forEach(m => mjMuret(m[0], m[1], m[2], m[3]))
  // epaves : ruelles, passages, cours ; jamais sur la RN1 ni sur les bas-cotes
  bgVoiture(21, 36, 'z', 'white', 1); bgVoiture(22, 82, 'z', 'red', 2); bgVoiture(89, 46, 'z', 'light_gray', 1); bgVoiture(89, 104, 'z', 'blue', 0)
  bgVoiture(30, 77, 'x', 'white', 1, true); bgVoiture(104, 52, 'x', 'black', 2)
  // poteaux electriques des ruelles, deux tombes en travers
  ;[[24, 10], [24, 58], [24, 110], [88, 14], [88, 72], [88, 120]].forEach(p => rmPoteau(p[0], p[1], 'z'))
  mjPoteauTombe(23, 86, 6); mjPoteauTombe(90, 26, 7)
  // arbres et buissons
  ;[[5, 20], [6, 62], [4, 94], [116, 24], [118, 56], [110, 84], [120, 116]].forEach(p => rmManguier(p[0], p[1]))
  ;[[7, 40], [8, 48], [2, 88], [6, 122], [104, 4], [107, 28], [102, 60], [106, 90], [103, 110], [25, 18], [104, 40]].forEach((p, i) => rmBananier(p[0], p[1], 4 + (i % 2)))
  ;[[26, 46], [26, 70], [87, 38], [87, 86], [12, 26], [101, 22], [20, 64], [91, 64]].forEach(p => mjBuisson(p[0], p[1], 2))
  mjUsure()
  mjDechets(70, 0, 0, 38, N); mjDechets(70, 75, 0, 127, N)
  for (var i = 0; i < 1800; i++) { var x = Math.floor(R() * 128), z = Math.floor(R() * 128); if (x >= 40 && x <= 73) continue; if (libreH(x, 0, z) && /grass_block|coarse_dirt/.test(HM[hk(x, -1, z)] || '')) SA(x, 0, z, R() < 0.65 ? 'minecraft:short_grass' : R() < 0.6 ? 'minecraft:fern' : 'minecraft:dead_bush') }
  // lianes : [x, y, z, direction de l'appui]
  ;[[40, 6, 8, 'west'], [40, 6, 33, 'west'], [40, 3, 58, 'west'], [40, 3, 98, 'west'], [73, 6, 13, 'east'], [73, 6, 67, 'east'], [73, 9, 100, 'east'], [27, 6, 70, 'east'], [26, 6, 110, 'east'], [86, 6, 30, 'west'], [86, 6, 112, 'west'], [20, 6, 18, 'west'], [91, 6, 52, 'east']].forEach(v => lxLiane(v[0], v[1], v[2], v[3], 4))
  lxNettoyer(/(pane|_bars|fence|chain|_slab|leaves|carpet|_wool|lantern|cocoa|vine|grass|fern|dead_bush|button)/)
}

var QFIN_RN1 = function () {
  HB2 = true; FIN = true; THM = null
  lot(function () { HM = {}; FIN_VOLET = null; FIN_RID = null; mjRoute(); finAncrage() }, 0, 0, 999, 7001, 128, 30)
  HB2 = false; FIN = false; THM = null; HM = {}
}
function vuesRN1() {
  vue('n_rn1', 0, 0, 56.5, 1.6, 1, 56.5, 2, 127)
  vue('n_rn1_haut', 0, 0, 56.5, 22, -12, 56.5, 0, 70)
  vue('n_bas_cote', 0, 0, 45, 1.6, 4, 45, 2, 70)
  vue('n_piece_dehors', 0, 0, 52, 1.7, 36, 39, 2, 36)
  vue('n_piece_seuil', 0, 0, 37, 1.7, 36, 28, 1.2, 33)
  vue('n_brulee', 0, 0, 47, 3, 53, 35, 2, 47)
  vue('n_ruelle_ouest', 0, 0, 22.5, 1.7, 2, 22.5, 1.2, 60)
  vue('n_ruelle_est', 0, 0, 89.5, 1.7, 125, 89.5, 1.2, 70)
  vue('n_cours', 0, 0, 125, 9, 4, 100, 0, 40)
  vue('n_majicavo', 0, 0, 56.5, 14, 128, 56.5, 0, 60)
  vue('n_dessus', 0, 0, 64, 75, -25, 64, 0, 64)
}
