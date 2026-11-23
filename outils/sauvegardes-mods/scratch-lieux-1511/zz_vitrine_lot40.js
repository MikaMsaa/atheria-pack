// ================= PRISON (enceinte, miradors, bloc cellulaire a deux niveaux autour d'un atrium, cour de promenade, parloir et laverie) =================
var PRB = 'minecraft:iron_bars', PRP = 'minecraft:iron_door', PRW = 'minecraft:light_gray_concrete'
function prTour(x, z) {
  F(x, 0, z, x + 2, 7, z + 2, GAC)
  F(x - 1, 8, z - 1, x + 3, 8, z + 3, GAC); W(x - 1, z - 1, x + 3, z + 3, 9, 10, GP); ;[[x - 1, z - 1], [x + 3, z - 1], [x - 1, z + 3], [x + 3, z + 3]].forEach(c => F(c[0], 9, c[1], c[0], 10, c[1], GAC))
  F(x - 2, 11, z - 2, x + 4, 11, z + 4, GASL); S(x + 1, 10, z + 1, RUL)
}
function prFourgon(x, z) {
  F(x, 0, z, x + 6, 2, z + 2, 'minecraft:white_concrete'); F(x, 1, z, x + 6, 1, z, 'minecraft:blue_concrete'); F(x, 1, z + 2, x + 6, 1, z + 2, 'minecraft:blue_concrete')
  ;[x + 1, x + 5].forEach(u => { S(u, 0, z, 'minecraft:black_concrete'); S(u, 0, z + 2, 'minecraft:black_concrete') })
  F(x, 2, z, x, 2, z + 2, 'minecraft:tinted_glass'); S(x + 1, 2, z, 'minecraft:tinted_glass'); S(x + 1, 2, z + 2, 'minecraft:tinted_glass'); S(x + 4, 2, z, PRB); S(x + 4, 2, z + 2, PRB)
}
// cellule : x1..x1+2, cote nord (barreaux en z10) ou sud (barreaux en z18), niveau y, hauteur h
function prCell(x1, y, h, nord) {
  var zb = nord ? 10 : 18, zl = nord ? 7 : 21, zf = nord ? 6 : 22, zm = nord ? 8 : 20
  F(x1, y + 1, zb, x1 + 2, y + h, zb, PRB); PORTE(x1 + 1, y + 1, zb, PRP, nord ? 'north' : 'south', 'left', 'false')
  vrLitS(x1, y + 1, zl, 'light_gray', nord ? 'north' : 'south'); S(x1 + 2, y + 1, zf, 'minecraft:cauldron'); vrEtag(x1 + 2, y + 3, zf, nord ? 'south' : 'north')
  if ((x1 + y) % 3 == 0) S(x1 + 2, y + 1, zm, 'handcrafted:stackable_book')
  S(x1 + 1, y + h, zl, RUL)
}

// ---- rue : chaussee, voitures de police, fourgon cellulaire ----
function prRue() {
  OX = VB.X0; OY = VB.Y0; OZ = VB.Z0; CUT = 999; GRAINE = 595
  for (var x = -16; x <= 143; x++) for (var z = 32; z <= 47; z++) {
    var r = R(), b
    if (z <= 33 || z >= 46) b = r < 0.7 ? GAL : r < 0.9 ? 'minecraft:andesite' : 'minecraft:gravel'
    else if (z == 40 && (x + 32) % 6 < 3) b = 'minecraft:white_concrete'
    else b = r < 0.8 ? 'minecraft:black_concrete' : r < 0.94 ? GAC : 'minecraft:gray_concrete_powder'
    S(x, -1, z, b)
  }
  for (var x = 0; x <= 128; x += 16) { var z = (x / 16) % 2 ? 46 : 33; F(x + 4, 0, z, x + 4, 3, z, 'minecraft:andesite_wall'); S(x + 4, 4, z, 'minecraft:lantern[hanging=false,waterlogged=false]') }
  prFourgon(40, 41); bgVoiture(12, 36, 'x', 'white', 1); bgVoiture(80, 41, 'x', 'black', 0); bgVoiture(104, 36, 'x', 'white', 2)
  ;[[22, 34], [70, 45], [118, 34]].forEach(c => F(c[0], 0, c[1], c[0] + 2, 0, c[1], 'minecraft:smooth_stone'))
}

// ================= ENCEINTE ET BLOC CELLULAIRE (lot double 64 x 32) =================
function prPrison() {
  gaSol(0, 0, 63, 31); gaDalle(29, 23, 34, 31); gaDalle(4, 24, 59, 25)
  // enceinte, barbeles, portail, miradors
  W(1, 1, 62, 30, 0, 5, GAC); W(1, 1, 62, 30, 6, 6, PRB); F(29, 0, 30, 34, 4, 30, PRB); F(29, 6, 30, 34, 6, 30, GAC)
  prTour(0, 0); prTour(61, 0); prTour(0, 29); prTour(61, 29)
  F(4, 0, 28, 27, 0, 28, GAX); F(37, 0, 28, 59, 0, 28, GAX)
  // bloc : murs x6..57 z5..23, deux niveaux (rdc y0..4, dalle y5, etage y6..10, toit y11)
  F(6, 0, 5, 57, 0, 23, GAP); W(6, 5, 57, 23, 1, 10, PRW); F(7, 1, 6, 56, 10, 22, AIR)
  ;[[6, 5], [57, 5], [6, 23], [57, 23]].forEach(c => F(c[0], 1, c[1], c[0], 10, c[1], GAC)); F(6, 5, 5, 57, 5, 5, GAC); F(6, 5, 23, 57, 5, 23, GAC); F(6, 5, 6, 6, 5, 22, GAC); F(57, 5, 6, 57, 5, 22, GAC)
  F(6, 11, 5, 57, 11, 23, GAC); W(6, 5, 57, 23, 12, 12, GASL)
  // dalles des cellules et coursives
  F(7, 5, 6, 56, 5, 12, GAP); F(7, 5, 16, 56, 5, 22, GAP)
  var CN = [], CS = [7, 11, 15, 19, 23, 37, 41, 45, 49, 53]
  for (var x = 7; x <= 51; x += 4) CN.push(x)
  ;[0, 5].forEach(y => {
    var h = y ? 5 : 4
    CN.forEach(x1 => { F(x1 + 3, y + 1, 6, x1 + 3, y + h, 10, PRW); prCell(x1, y, h, true) })
    CS.forEach(x1 => { F(x1 + 3, y + 1, 18, x1 + 3, y + h, 22, PRW); prCell(x1, y, h, false) })
    F(26, y + 1, 18, 26, y + h, 22, PRW); F(36, y + 1, 18, 36, y + h, 22, PRW)
  })
  F(55, 1, 6, 56, 10, 10, PRW)
  // escaliers aux deux bouts, garde-corps des coursives
  mdEsc(7, 8, 16, 0, 5, -1, 'stone_brick', 'minecraft:stone_bricks'); mdEsc(55, 56, 12, 0, 5, 1, 'stone_brick', 'minecraft:stone_bricks')
  F(9, 6, 12, 53, 6, 12, PRB); F(10, 6, 16, 54, 6, 16, PRB)
  // accueil au rez-de-chaussee (x27..35), portique et casiers ; poste de controle vitre a l'etage
  F(27, 1, 18, 35, 4, 22, AIR); PORTE(31, 1, 23, PRP, 'south', 'left', 'false'); PORTE(32, 1, 23, PRP, 'south', 'right', 'false')
  ;[30, 33].forEach(x => F(x, 1, 20, x, 3, 20, PRB)); F(31, 3, 20, 32, 3, 20, PRB)
  vrBur(28, 1, 21, 'east'); vrCh(29, 1, 21, 'west', 'black'); for (var z = 19; z <= 22; z++) vrArm(35, 1, z, 'west'); S(28, 1, 19, RUBAR)
  F(27, 6, 18, 35, 8, 18, GP); F(27, 9, 18, 35, 10, 18, PRW); PORTE(31, 6, 18, PRP, 'north', 'left', 'false'); F(27, 6, 19, 35, 10, 22, AIR)
  for (var x = 28; x <= 34; x++) { if (x == 31) continue; vrCpt(x, 6, 19, 'south', 'smooth_stone'); if (x % 2) S(x, 7, 19, 'minecraft:note_block') }
  ;[28, 33].forEach(x => vrCh(x, 6, 20, 'north', 'black')); S(31, 10, 21, RUL); S(31, 4, 21, RUL)
  // atrium : eclairage
  for (var x = 12; x <= 52; x += 8) { S(x, 10, 14, RUL); S(x, 4, 14, RUL) }
  ;[[10, 13], [22, 15], [42, 13]].forEach(c => S(c[0], 1, c[1], btSt('stone', 'north')))
  // fentes des cellules en facade
  CN.forEach(x1 => { S(x1 + 1, 3, 5, PRB); S(x1 + 1, 8, 5, PRB) }); CS.forEach(x1 => { S(x1 + 1, 3, 23, PRB); S(x1 + 1, 8, 23, PRB) })
  // toit : gaines, projecteurs
  ;[[14, 12], [30, 10], [46, 12]].forEach(c => { F(c[0], 12, c[1], c[0] + 2, 12, c[1] + 2, 'minecraft:iron_block'); F(c[0], 13, c[1], c[0] + 2, 13, c[1] + 2, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false,powered=false,waterlogged=false]') })
  // avant-cour : guerite, fourgon
  gaBat(40, 25, 46, 29, 0, 3, GAL); F(41, 2, 25, 45, 3, 25, GP); PORTE(40, 1, 27, PRP, 'west', 'left', 'false'); vrBur(44, 1, 27, 'west'); vrCh(43, 1, 27, 'east', 'black'); S(43, 3, 27, RUL)
  prFourgon(12, 25)
}

// ================= COUR DE PROMENADE =================
function prCour() {
  gaDalle(0, 0, 31, 31)
  for (var x = 6; x <= 25; x++) { S(x, -1, 2, 'minecraft:white_concrete'); S(x, -1, 14, 'minecraft:white_concrete') }; for (var z = 2; z <= 14; z++) { S(6, -1, z, 'minecraft:white_concrete'); S(25, -1, z, 'minecraft:white_concrete') }; for (var x = 6; x <= 25; x++) S(x, -1, 8, 'minecraft:white_concrete')
  ;[[15, 2, 3, 4], [15, 14, 13, 12]].forEach(p => { F(p[0], 0, p[1], p[0] + 1, 4, p[1], GAC); F(p[0] - 1, 4, p[2], p[0] + 2, 5, p[2], 'minecraft:white_concrete'); F(p[0], 4, p[3], p[0] + 1, 4, p[3], 'minecraft:iron_trapdoor[facing=north,half=top,open=false,powered=false,waterlogged=false]') })
  // musculation, tables, bancs
  ;[[4, 20], [8, 20]].forEach(c => { F(c[0], 0, c[1], c[0] + 2, 0, c[1], GASL); S(c[0], 1, c[1], 'minecraft:iron_block'); S(c[0] + 2, 1, c[1], 'minecraft:iron_block'); S(c[0] + 1, 1, c[1], 'minecraft:chain[axis=x]') })
  ;[[14, 21], [20, 21], [14, 26], [20, 26]].forEach(c => { vrTab(c[0], 0, c[1], 'none'); S(c[0] - 1, 0, c[1], btSt('stone', 'east')); S(c[0] + 1, 0, c[1], btSt('stone', 'west')) })
  F(3, 0, 27, 8, 0, 27, btSt('stone', 'north')); S(26, 0, 22, 'minecraft:water_cauldron[level=2]')
  // grillage et mirador
  W(0, 0, 31, 31, 0, 3, PRB); W(0, 0, 31, 31, 4, 4, GAX); F(14, 0, 0, 17, 3, 0, PRB)
  prTour(27, 27)
}

// ================= PARLOIR ET LAVERIE =================
function prParloir() {
  gaSol(0, 0, 31, 31); gaDalle(13, 0, 18, 3)
  gaBat(3, 4, 28, 24, 0, 4, PRW); gaFenX(5, 12, 4, 2, 4); gaFenX(19, 26, 4, 2, 4); gaFenX(5, 26, 24, 2, 4); gaFenZ(3, 8, 20, 2, 4); gaFenZ(28, 8, 20, 2, 4)
  PORTE(15, 1, 4, PRP, 'north', 'left', 'false'); PORTE(16, 1, 4, PRP, 'north', 'right', 'false')
  // parloir : vitre de separation, tables de chaque cote
  F(10, 1, 6, 10, 4, 23, GP); F(16, 1, 5, 16, 4, 23, PRW); PORTE(16, 1, 14, PRP, 'east', 'left', 'false')
  for (var z = 7; z <= 21; z += 2) { vrTab(9, 1, z, 'none'); vrCh(8, 1, z, 'east', 'gray'); vrTab(11, 1, z, 'none'); vrCh(12, 1, z, 'west', 'orange') }
  for (var z = 6; z <= 22; z += 4) S(5, 1, z, 'minecraft:potted_fern'); S(14, 1, 22, 'minecraft:chest[facing=west,type=single,waterlogged=false]')
  ;[[7, 9], [7, 19], [13, 9], [13, 19]].forEach(c => S(c[0], 4, c[1], RUL))
  // laverie : cuves, barils de linge, metiers, rayonnages
  for (var x = 18; x <= 26; x += 2) { S(x, 1, 6, 'minecraft:water_cauldron[level=3]'); S(x, 1, 10, 'minecraft:water_cauldron[level=2]') }
  for (var x = 18; x <= 27; x++) { S(x, 1, 23, x % 3 ? RUBAR : 'minecraft:white_wool'); vrEtag(x, 3, 23, 'north') }
  ;[19, 23].forEach(x => { S(x, 1, 17, 'minecraft:loom[facing=north]'); vrTab(x + 1, 1, 17, 'white') }); S(26, 1, 17, 'minecraft:white_wool'); S(26, 2, 17, 'minecraft:white_carpet')
  F(18, 3, 14, 27, 3, 14, 'minecraft:chain[axis=x]')
  ;[[21, 8], [21, 19], [25, 13]].forEach(c => S(c[0], 4, c[1], RUL))
  prFourgon(4, 26); F(0, 0, 31, 31, 0, 31, GAX)
}

// ---- palette et vues ----
var THM_PR = finPalette('spruce', {})
function vuesPrisonF() {
  vue('pr_ensemble', 0, 0, 40, 48, 96, 32, 8, 22, 3000)
  vue('pr_rue_ouest', 0, 0, -8, 3, 39.5, 60, 4, 40)
  vue('pr_rue_est', 0, 0, 134, 3, 40.5, 64, 4, 40)
  vue('pr_entree', 0, 0, 31.5, 6, 44, 31.5, 4, 20)
  vue('pr_mirador', 0, 0, 54, 5, 38, 62, 9, 30)
  vue('pr_avant_cour', 0, 0, 52, 7, 27, 24, 2, 25)
  vue('pr_atrium', 0, 0, 10, 7.5, 14, 54, 4, 14)
  vue('pr_coursives', 0, 0, 53, 9, 14, 10, 6, 11)
  vue('pr_cellule', 0, 0, 12, 2.6, 12.5, 12, 1.2, 7)
  vue('pr_accueil', 0, 0, 31.5, 3, 21.5, 31.5, 2, 10)
  vue('pr_controle', 0, 0, 34, 7.8, 21.5, 28, 6, 19)
  vue('pr_toit', 0, 0, 32, 24, 40, 32, 11, 14)
  vue('pr_cour', 0, 48, 16, 9, -8, 16, 1, 14)
  vue('pr_basket', 0, 48, 16, 3, 10, 16, 4, 2)
  vue('pr_parloir', 32, 48, 16, 8, -8, 16, 2, 14)
  vue('pr_parloir_salle', 32, 48, 5.5, 3, 21.5, 10, 1.5, 7)
  vue('pr_laverie', 32, 48, 26, 3, 20.5, 18, 1, 8)
  vue('pr_coupe_rdc', 72, 0, 32, 32, 46, 32, 0, 15)
  vue('pr_coupe_etage', 144, 0, 32, 34, 46, 32, 5, 15)
  vue('pr_coupe_parloir', 216, 48, 16, 16, -5, 16, 0, 14)
}
var QFIN_PR = function () {
  HB2 = true; FIN = true; THM = THM_PR
  HM = {}; prRue(); finAncrage()
  lot(QF64(prPrison), 0, 0, 999, 1311, 64, 13)
  lot(QF(prCour, null, null), 0, 48, 999, 1321, 32, 12); lot(QF(prParloir, null, null), 32, 48, 999, 1331, 32, 7)
  lot(QF64(prPrison), 72, 0, 4, 1311, 64, 13); lot(QF64(prPrison), 144, 0, 9, 1311, 64, 13); lot(QF(prParloir, null, null), 216, 48, 3, 1331, 32, 7)
  vlog('FIN volets ' + FIN_NV + ' rideaux ' + FIN_NR + ' paves ' + PAVE_NB + ' retraits ancrage ' + ANC_NB)
  HB2 = false; FIN = false; THM = null; HM = {}
}
