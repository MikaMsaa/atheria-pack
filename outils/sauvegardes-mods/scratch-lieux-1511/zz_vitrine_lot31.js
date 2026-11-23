
// ================= FINITIONS FINALES (Macaw's Windows, Paths and Pavings, Handcrafted) =================
// FIN = true : chaque facade passee a hb2Appuis recoit volets et rideaux ; la palette THM_HF remplace lits, canapes et chaussee.
var FIN_OK = null, FIN_NV = 0, FIN_NR = 0, FIN = false, FIN_VOLET = 'mcwwindows:iron_shutter', FIN_RID = ['white', 'light_gray'], FIN_PV = 0.55, FIN_PR = 0.5, FIN_BOIS_LIT = 'dark_oak'

// baies d'une facade : bas de baie, largeur 1 a 3, hauteur 2 a 4
function finBaies(axe, a1, a2, ymin, ymax, p, fn) {
  function V(a, y) { var c = axe == 'x' ? [a, y, p] : [p, y, a]; return estVerre(HG(c[0], c[1], c[2])) }
  for (var y = ymin; y <= ymax; y++) for (var a = a1; a <= a2; a++) {
    if (!V(a, y) || V(a, y - 1) || V(a - 1, y)) continue
    var w = 0; while (w < 5 && V(a + w, y)) w++
    var h = 0; while (h < 6 && V(a, y + h)) h++
    if (w <= 3 && h >= 2 && h <= 5) fn(a, y, w, h)
  }
}
function finFacade(axe, a1, a2, ymin, ymax, p, d) {
  var fe = axe == 'x' ? (d > 0 ? 'south' : 'north') : (d > 0 ? 'east' : 'west'), fm = OPP[fe]
  var gMoins = (fe == 'south' || fe == 'west')  // colonne de gauche vue de dehors = a le plus petit
  function C(a, y, k) { return axe == 'x' ? [a, y, p + k] : [p + k, y, a] }
  function libreCol(a, y, h, k) { for (var i = 0; i < h; i++) { var c = C(a, y + i, k); if (!libreH(c[0], c[1], c[2])) return false } return true }
  finBaies(axe, a1, a2, ymin, ymax, p, function (a, y, w, h) {
    // 08/11 : chaque baie doit etre validee pour CE sens (sinon une seule vitre ambigue retournait tout le plan : rideaux dehors)
    if (FIN_OK) { var c0 = axe == 'x' ? [a, y, p] : [p, y, a]; if (!FIN_OK[c0[0] + ',' + c0[1] + ',' + c0[2] + '|' + d]) return }
    // volets a plat contre le mur, parfois fermes, parfois arraches
    // 08/11 : un volet ouvert se rabat sur le mur voisin ; si ce mur est en retrait (rotonde, angle), il flotterait
    var murs = true; for (var k2 = 0; k2 < h; k2++) { var g1 = C(a - 1, y + k2, 0), g2 = C(a + w, y + k2, 0); if (libreH(g1[0], g1[1], g1[2]) || libreH(g2[0], g2[1], g2[2]) || estVerre(HG(g1[0], g1[1], g1[2])) || estVerre(HG(g2[0], g2[1], g2[2]))) murs = false }
    if (FIN_VOLET && murs && H3(a, y, p * 3) < FIN_PV && w <= 3) {
      var e = H3(a + 7, y, p), cols = w == 1 ? [a] : [a, a + w - 1]
      cols.forEach((col, i) => {
        var gauche = (w == 1) ? (e < 0.5) : ((i == 0) == gMoins)
        if (e > 0.85 && i == 1) return
        if (!libreCol(col, y, h, d)) return
        FIN_NV++; for (var k = 0; k < h; k++) { var c = C(col, y + k, d); S(c[0], c[1], c[2], FIN_VOLET + '[facing=' + fm + ',hinge=' + (gauche ? 'left' : 'right') + ',open=' + (e < 0.12 ? 'false' : 'true') + ']') }
      })
    }
    // rideaux noues de part et d'autre a l'interieur, tringle au-dessus
    if (FIN_RID && H3(a, y + 3, p * 5) < FIN_PR) {
      var coul = FIN_RID[Math.floor(H3(a, y, p + 11) * FIN_RID.length)], cols = w == 1 ? [a] : [a, a + w - 1]
      var ok = true; for (var u = a; u < a + w; u++) { var t = C(u, y + h, -d), m = C(u, y + h, 0); if (!libreH(t[0], t[1], t[2]) || estVerre(HG(m[0], m[1], m[2])) || libreH(m[0], m[1], m[2])) ok = false }
      cols.forEach((col, i) => {
        if (!libreCol(col, y, h, -d)) return
        var gauche = (w == 1) ? (H3(a, y, p + 3) < 0.5) : ((i == 0) != gMoins)  // noue a gauche = colonne de gauche vue de l'interieur (banc film78)
        FIN_NR++; for (var k = 0; k < h; k++) { var c = C(col, y + k, -d); S(c[0], c[1], c[2], 'mcwwindows:' + coul + '_curtain[facing=' + fm + ',tied=' + (gauche ? 'left' : 'right') + ']') }
      })
      if (ok) for (var u = a; u < a + w; u++) { var t = C(u, y + h, -d); S(t[0], t[1], t[2], 'mcwwindows:dark_oak_curtain_rod[facing=' + fm + ']') }
    }
  })
}

// ---- palette finale : haussmannien v2 + lits a baldaquin, canapes Handcrafted, chaussee en paves ----
var THM_HF = {}
for (var k in THM_HB) THM_HF[k] = THM_HB[k]
;['white', 'orange', 'magenta', 'light_blue', 'yellow', 'lime', 'pink', 'gray', 'light_gray', 'cyan', 'purple', 'blue', 'brown', 'green', 'red', 'black'].forEach(c => {
  THM_HF['minecraft:' + c + '_bed'] = (x, y, z, b) => { var f = b.match(/facing=(\w+)/), p = b.match(/part=(\w+)/); return 'handcrafted:' + FIN_BOIS_LIT + '_fancy_bed[color=' + c + ',facing=' + f[1] + ',occupied=false,part=' + p[1] + ',shape=single]' }
  THM_HF['mcwfurnitures:' + c + '_couch'] = (x, y, z, b) => { var f = b.match(/facing=(\w+)/); return 'handcrafted:' + FIN_BOIS_LIT + '_couch[color=' + c + ',facing=' + f[1] + ',shape=single,waterlogged=false]' }
})
function finPave(x, y, z) {
  if (y != -1 || z < 35 || z > 44 || z == 39 || z == 40) return null
  var h = H3(x, y, z); return h < 0.55 ? 'mcwpaths:cobblestone_square_paving' : h < 0.8 ? 'mcwpaths:andesite_square_paving' : h < 0.92 ? 'mcwpaths:cobbled_deepslate_square_paving' : 'mcwpaths:mossy_cobblestone_square_paving'
}
;['minecraft:gray_concrete', 'minecraft:black_concrete', 'minecraft:cobblestone', 'minecraft:gray_concrete_powder', 'minecraft:gravel'].forEach(id => { var f0 = THM_HF[id]; THM_HF[id] = (x, y, z, b) => finPave(x, y, z) || (f0 ? f0(x, y, z, b) : null) })
THM_HF['minecraft:white_concrete'] = (x, y, z) => (y == -1 && z >= 35 && z <= 44) ? 'mcwpaths:diorite_square_paving' : null
// trottoirs : dalles de pierre a joints
THM_HF['minecraft:smooth_stone'] = (x, y, z) => { if (y != -1 || !((z >= 32 && z <= 33) || (z >= 46 && z <= 47))) return null; var h = H3(x, y, z); return h < 0.6 ? 'mcwpaths:stone_flagstone' : h < 0.85 ? 'mcwpaths:andesite_flagstone' : null }

// ---- complements Handcrafted dans les pieces (air seulement) ----
var VAISS = ['handcrafted:white_plate', 'handcrafted:white_cup', 'handcrafted:white_bowl', 'handcrafted:white_crockery_combo[facing={I},waterlogged=false]', 'handcrafted:blue_plate', 'handcrafted:blue_cup']
var POTS = ['handcrafted:white_glazed_medium_pot', 'handcrafted:blue_glazed_thin_pot', 'handcrafted:terracotta_wide_pot', 'handcrafted:white_glazed_thick_pot', 'handcrafted:golden_thin_pot']
function finPiece(c, type, etat) {
  var L = c.L, D = c.D
  function A(u, v, dy, b) { if (u < 0 || v < 0 || u >= L || v >= D) return; var p = c.pos(u, v); SA(p[0], c.y + dy, p[1], c.f(b)) }
  var c0 = Math.floor((L - 1) / 2)
  if (type == 'salon') { A(L - 1, D - 1, 1, choix(POTS)); A(c0, 1, 1, choix(['handcrafted:red_cushion', 'handcrafted:yellow_cushion', 'handcrafted:green_cushion'])) }
  else if (type == 'salle') { A(c0, 2, 2, choix(VAISS)); A(c0 - 1, 1, 2, choix(VAISS)); A(L - 1, 0, 1, choix(POTS)) }
  else if (type == 'cuisine') { for (var u = 2; u <= L - 2; u += 2) A(u, D - 1, 2, choix(['handcrafted:terracotta_bowl', 'handcrafted:wood_plate', 'handcrafted:berry_jam_jar', 'handcrafted:wood_cup'])) }
  else if (type == 'chambre') { A(L - 1, D - 1, 1, choix(POTS)); A(0, D - 1, 1, 'handcrafted:stackable_book') }
  else if (type == 'bureau') { A(c0 + 1, 1, 2, 'handcrafted:stackable_book'); A(0, D - 1, 1, choix(POTS)) }
}

// ---- vues du haussmannien final : memes cadrages que v1/v2, puis gros plans des finitions ----
function vuesHaussF() {
  vuesHauss3()
  vue('hf_persiennes', 0, 0, 39, 10, 35, 46, 11, 29)
  vue('hf_persiennes_haut', 0, 0, 54, 20, 36, 48, 20, 29)
  vue('hf_hbm_volets', 0, 0, 40, 9, 43, 46, 10, 50)
  vue('hf_paves', 0, 0, 56, 3, 40, 70, -1, 40)
  vue('hf_trottoir', 0, 0, 20, 2.5, 46.5, 30, 0, 46)
  vue('hf_banque_volets', 0, 0, 104, 8, 42, 110, 8, 50)
}