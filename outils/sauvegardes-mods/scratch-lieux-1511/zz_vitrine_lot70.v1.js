// ================= RN1 A MAJICAVO ET LA PIECE AUX DAKOUANE (lot70, 14/11) : lieux 4 et 5 du trailer =================
// Fiche RN1 : ligne droite de 120 blocs ou plus, chaussee de 12 a 15, bas-cotes libres sur 10, denivele < 3.
// Fiche Majicavo : piece de 9 x 9 ou plus sur 4 de haut, une baie de 1 a 2, aucune lumiere (8 a 10 Dakouane poses par le trailer).
// Ici : RN1 nord-sud sur 128 blocs, chaussee x50..63 (14), bas-cotes x40..49 et x64..73 laisses libres ; maisons de Majicavo au-dela, abandonnees.
// La piece : rez-de-chaussee de la maison ouest z30..41 (interieur 10 x 10 x 4), baie de 2 sur la RN1, aucune fenetre.
function mjAbandon(x1, z1, x2, z2) {
  // apres l'epidemie : carreaux casses, auvents arraches, lianes sur les facades, herbe au pied des murs
  for (var k in HM) {
    var p = k.split(','), x = p[0] - OX, y = p[1] - OY, z = p[2] - OZ, b = HM[k]
    if (x < x1 || x > x2 || z < z1 || z > z2) continue
    if (/glass_pane/.test(b) && R() < 0.35) S(x, y, z, AIR)
    else if (/awning/.test(b) && R() < 0.4) S(x, y, z, AIR)
  }
}
function mjRoute() {
  var N = 127
  // sol : chaussee, bas-cotes en herbe rase et terre battue, abords en friche
  for (var x = 0; x <= 115; x++) for (var z = 0; z <= N; z++) {
    var b
    if (x >= 50 && x <= 63) { var n = lbBruit(Math.floor(x / 3), Math.floor(z / 3), 7.3), m = lbBruit(x, z, 3.9); b = (x == 51 || x == 62) ? 'minecraft:white_concrete' : (x == 56 && z % 8 < 4) ? 'minecraft:white_concrete' : m > 1.6 ? 'minecraft:cyan_terracotta' : n > 1.0 ? 'minecraft:black_concrete' : n < -1.25 ? 'minecraft:light_gray_concrete' : 'minecraft:gray_concrete' }
    else if (x == 49 || x == 64) b = 'minecraft:gravel'
    else { var n = lbBruit(x, z, 1.9); b = n > 1.0 ? 'minecraft:coarse_dirt' : n < -1.2 ? 'minecraft:packed_mud' : 'minecraft:grass_block[snowy=false]' }
    S(x, -1, z, b)
  }
  // la route est abandonnee depuis des semaines : herbe dans les fissures de rive (couche au ras du sol, pas d'obstacle)
  for (var z = 0; z <= N; z++) { [50, 63].forEach(x => { if (R() < 0.18) S(x, -1, z, 'minecraft:moss_block') }) }
  // maisons de Majicavo, ouest (facades x39 vers l'est) et est (facades x74 vers l'ouest)
  var P = RM_PEINT
  rmBat(-1, 39, 6, 10, 13, 2, P[1], 'ouvert', { attente: true, pignons: [6, 15] })
  rmBat(-1, 39, 30, 12, 12, 2, P[5], 'piece', { attente: true, pignons: [30, 41] })
  rmBat(-1, 39, 54, 8, 12, 1, P[4], 'maison', { attente: true, pignons: [54, 61] })
  rmBat(-1, 39, 80, 12, 14, 3, P[0], 'vitrine', { balcons: true, pignons: [80, 91] })
  rmBat(-1, 39, 106, 10, 13, 2, P[3], 'maison', { linge: true, pignons: [106, 115] })
  rmBat(1, 74, 10, 12, 13, 2, P[2], 'maison', { attente: true, pignons: [10, 21] })
  rmBat(1, 74, 40, 8, 12, 1, P[6], 'ouvert', { pignons: [40, 47] })
  rmBat(1, 74, 64, 12, 14, 2, P[8], 'vitrine', { balcons: true, pignons: [64, 75] })
  rmBat(1, 74, 96, 10, 13, 3, P[7], 'maison', { attente: true, pignons: [96, 105] })
  mjAbandon(20, 0, 95, N)
  // la piece doit rester noire : on bouche les fenetres du pignon au rez-de-chaussee (il n'y en a pas) et on verifie qu'aucune lanterne n'y entre
  // abords : bananiers, manguiers, murets de parpaings entre parcelles, herbes hautes (rien dans les bas-cotes)
  ;[[20, 20], [24, 70], [96, 30], [100, 84], [18, 98]].forEach(p => rmManguier(p[0], p[1]))
  ;[[34, 22], [33, 47], [80, 30], [82, 58], [34, 70], [79, 90], [33, 98], [84, 118]].forEach((p, i) => rmBananier(p[0], p[1], 4 + (i % 2)))
  ;[[24, 17, 39, 17], [24, 27, 39, 27], [24, 44, 39, 44], [74, 26, 90, 26], [74, 52, 88, 52], [74, 88, 90, 88]].forEach(m => F(m[0], 0, m[1], m[2], 0, m[3], 'minecraft:light_gray_concrete'))
  for (var i = 0; i < 700; i++) { var x = Math.floor(R() * 116), z = Math.floor(R() * 128); if (x >= 40 && x <= 73) continue; if (libreH(x, 0, z) && /grass_block/.test(HM[hk(x, -1, z)] || '')) SA(x, 0, z, R() < 0.7 ? 'minecraft:short_grass' : 'minecraft:fern') }
  // lianes sur quelques facades (la vegetation reprend)
  ;[[40, 8], [40, 33], [40, 58], [73, 13], [73, 67]].forEach(v => lxLiane(v[0], 6, v[1], v[0] < 50 ? 'west' : 'east', 4))
  lxNettoyer(/(pane|_bars|fence|chain|_slab|leaves|carpet|_wool|lantern|cocoa|vine|grass|fern)/)
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
  vue('n_piece_dedans', 0, 0, 30.5, 1.6, 39.5, 39, 1.2, 35.5)
  vue('n_piece_seuil', 0, 0, 37, 1.7, 36, 28, 1.2, 33)
  vue('n_majicavo', 0, 0, 60, 6, 120, 70, 3, 60)
  vue('n_dessus', 0, 0, 56, 70, -30, 56, 0, 64)
}
