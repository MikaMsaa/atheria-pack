// ================= BASE MILITAIRE (enceinte de gabions, QG R+1 a dome radar, depot de carburant, DCA, station radar, depot logistique) =================
var BAH = 'minecraft:smooth_sandstone'
function baHesco(x1, z1, x2, z2) { F(x1, 0, z1, x2, 2, z2, BAH); for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) if ((x + z) % 4 == 0) S(x, 1, z, 'minecraft:sandstone') }
function baDome(cx, y0, cz, r, m) { for (var a = -r; a <= r; a++) for (var b = -r; b <= r; b++) for (var c = 0; c <= r; c++) if (a * a + b * b + c * c <= r * r) S(cx + a, y0 + c, cz + b, m) }
function baParabole(x, z) { F(x, 0, z, x, 1, z, PRB); F(x - 1, 2, z, x + 1, 3, z, 'minecraft:white_concrete'); S(x, 2, z - 1, 'minecraft:lightning_rod[facing=north,powered=false,waterlogged=false]') }

// ---- rue : chaussee, convoi, chicanes de gabions ----
function baRue() {
  OX = VB.X0; OY = VB.Y0; OZ = VB.Z0; CUT = 999; GRAINE = 605
  for (var x = -16; x <= 143; x++) for (var z = 32; z <= 47; z++) {
    var r = R(), b
    if (z <= 33 || z >= 46) b = r < 0.6 ? GAL : r < 0.85 ? 'minecraft:andesite' : 'minecraft:gravel'
    else if (z == 40 && (x + 32) % 6 < 3) b = 'minecraft:white_concrete'
    else b = r < 0.75 ? 'minecraft:black_concrete' : r < 0.9 ? GAC : 'minecraft:coarse_dirt'
    S(x, -1, z, b)
  }
  for (var x = 0; x <= 128; x += 16) { var z = (x / 16) % 2 ? 46 : 33; F(x + 4, 0, z, x + 4, 3, z, 'minecraft:andesite_wall'); S(x + 4, 4, z, 'minecraft:lantern[hanging=false,waterlogged=false]') }
  gaCamion(10, 41); gaCamion(20, 41); gaBlinde(76, 35); bgVoiture(100, 41, 'x', 'green', 1)
  baHesco(54, 34, 56, 37); baHesco(62, 42, 64, 45); F(110, 0, 34, 110, 0, 45, GAX)
}

// ================= QG ET ENCEINTE (lot double 64 x 32) =================
function baBase() {
  gaSol(0, 0, 63, 31); gaDalle(4, 22, 59, 31); gaDalle(26, 0, 37, 21)
  baHesco(0, 0, 63, 1); baHesco(0, 2, 1, 31); baHesco(62, 2, 63, 31); baHesco(2, 30, 25, 31); baHesco(38, 30, 61, 31)
  prTour(22, 27); prTour(39, 27); F(37, 0, 31, 37, 1, 31, 'minecraft:yellow_concrete'); F(27, 1, 31, 36, 1, 31, 'minecraft:dark_oak_fence')
  // QG : deux niveaux
  gaBat(6, 5, 33, 20, 0, 4, GAO); gaBat(6, 5, 33, 20, 5, 4, GAO)
  ;[2, 7].forEach(y => { gaFenX(8, 16, 5, y, 4); gaFenX(24, 32, 5, y, 4); gaFenX(8, 16, 20, y, 4); gaFenX(24, 32, 20, y, 4); gaFenZ(6, 8, 17, y, 4); gaFenZ(33, 8, 17, y, 4) })
  gaFenX(18, 22, 20, 7, 4)
  PORTE(19, 1, 20, GAD, 'south', 'left', 'false'); PORTE(20, 1, 20, GAD, 'south', 'right', 'false'); F(17, 5, 21, 22, 5, 22, GASL); F(17, 1, 22, 17, 4, 22, GAC); F(22, 1, 22, 22, 4, 22, GAC)
  // salle des operations : mur d'ecrans, pupitres, table de cartes
  F(25, 1, 6, 25, 4, 19, GAL); PORTE(25, 1, 12, GAD, 'east', 'left', 'false'); F(25, 6, 6, 25, 9, 19, GAL); PORTE(25, 6, 12, GAD, 'east', 'left', 'false')
  F(8, 1, 6, 23, 4, 6, 'minecraft:black_concrete'); for (var x = 9; x <= 21; x += 3) F(x, 2, 6, x + 1, 3, 6, 'minecraft:light_blue_stained_glass')
  for (var x = 9; x <= 22; x += 2) { vrBur(x, 1, 8, 'south'); vrCh(x, 1, 9, 'north', 'black'); S(x, 2, 8, 'minecraft:note_block') }
  F(13, 1, 13, 18, 1, 15, 'minecraft:cartography_table'); ;[13, 15, 17].forEach(x => { vrCh(x, 1, 12, 'south', 'green'); vrCh(x + 1, 1, 16, 'north', 'green') })
  ;[[11, 10], [20, 10], [15, 14], [11, 18], [20, 18]].forEach(c => S(c[0], 4, c[1], RUL))
  vrArm(7, 1, 18, 'east'); vrArm(7, 1, 16, 'east'); S(23, 1, 19, RUBAR); S(8, 1, 19, 'minecraft:potted_fern')
  // salle radio + escalier
  for (var x = 26; x <= 32; x++) { vrCpt(x, 1, 6, 'south', 'smooth_stone'); S(x, 2, 6, x % 2 ? 'minecraft:jukebox' : 'minecraft:note_block'); vrEtag(x, 3, 6, 'south') }
  ;[27, 30].forEach(x => vrCh(x, 1, 7, 'north', 'black')); vrArm(26, 1, 12, 'east'); vrArm(26, 1, 14, 'east'); S(29, 4, 10, RUL)
  mdEsc(30, 31, 18, 0, 5, -1, 'stone_brick', 'minecraft:stone_bricks'); mdGarde(29, 15, 18, 6)
  // etage : salle de briefing, quartier des officiers
  F(8, 7, 6, 23, 8, 6, 'minecraft:black_concrete'); for (var z = 10; z <= 16; z += 2) for (var x = 10; x <= 21; x += 2) vrCh(x, 6, z, 'north', 'green')
  vrBur(15, 6, 7, 'south'); ;[[11, 11], [20, 11], [15, 16]].forEach(c => S(c[0], 9, c[1], RUL))
  ;[26, 28].forEach(x => { vrLitS(x, 6, 7, 'green', 'north'); vrArm(x + 1, 6, 6, 'south') }); S(32, 6, 6, 'minecraft:chest[facing=south,type=single,waterlogged=false]'); vrBur(32, 6, 11, 'west'); vrCh(31, 6, 11, 'east', 'black'); S(28, 9, 11, RUL)
  // toit : dome radar, mat, panneaux
  baDome(20, 11, 12, 4, 'minecraft:white_concrete'); F(10, 11, 8, 10, 18, 8, PRB); S(10, 19, 8, 'minecraft:lightning_rod[facing=up,powered=false,waterlogged=false]')
  mdPanneaux(26, 8, 31, 10, 11); mdPanneaux(26, 15, 31, 17, 11)
  // depot de carburant : trois cuves, passerelle, conduites, muret de retention
  W(37, 4, 58, 22, 0, 0, GASL)
  ;[[42, 9], [52, 9], [47, 18]].forEach(c => { ruRond(c[0], c[1], 8, 0, 6, 'minecraft:white_concrete', true); ruRond(c[0], c[1], 8, 7, 7, GASL, true); S(c[0], 3, c[1] + 3 > 22 ? c[1] : c[1] + 3, 'minecraft:red_concrete') })
  F(45, 7, 9, 49, 7, 9, GASL); F(45, 0, 9, 45, 6, 9, 'minecraft:ladder[facing=east,waterlogged=false]')
  F(40, 1, 13, 54, 1, 13, 'minecraft:lightning_rod[facing=east,powered=false,waterlogged=false]'); F(47, 1, 14, 47, 1, 15, 'minecraft:lightning_rod[facing=south,powered=false,waterlogged=false]')
  ;[[57, 5], [57, 6], [56, 5]].forEach(c => S(c[0], 0, c[1], RUBAR))
  // batterie anti-aerienne
  W(51, 23, 57, 28, 0, 1, GAS); F(54, 0, 28, 54, 1, 28, AIR)
  F(53, 0, 25, 55, 0, 26, 'minecraft:iron_block'); F(53, 1, 25, 55, 1, 26, GAV); S(53, 2, 25, 'minecraft:lightning_rod[facing=north,powered=false,waterlogged=false]'); S(55, 2, 25, 'minecraft:lightning_rod[facing=north,powered=false,waterlogged=false]'); S(54, 2, 26, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false,powered=false,waterlogged=false]')
  ;[[52, 24], [56, 24]].forEach(c => S(c[0], 0, c[1], RUBAR))
  // parc de vehicules
  gaCamion(6, 24); gaBlinde(15, 24); bgVoiture(42, 25, 'x', 'green', 0)
  ;[[24, 3], [40, 3], [3, 22]].forEach(c => { F(c[0], 0, c[1], c[0], 4, c[1], 'minecraft:andesite_wall'); S(c[0], 5, c[1], 'minecraft:lantern[hanging=false,waterlogged=false]') })
}

// ================= STATION RADAR =================
function baRadar() {
  gaSol(0, 0, 31, 31); gaDalle(8, 8, 23, 23)
  F(14, 0, 14, 17, 8, 17, GAC); F(15, 9, 15, 16, 9, 15, 'minecraft:iron_block'); F(11, 10, 15, 20, 12, 15, PRB); F(11, 13, 15, 20, 13, 15, 'minecraft:iron_block')
  F(13, 8, 13, 18, 8, 18, GAC); F(14, 1, 18, 14, 8, 18, 'minecraft:ladder[facing=south,waterlogged=false]'); W(13, 13, 18, 18, 9, 9, PRB); F(14, 9, 18, 14, 9, 18, AIR)
  gaBat(4, 21, 12, 27, 0, 3, GAL); gaFenX(5, 11, 21, 2, 3); PORTE(12, 1, 24, GAD, 'east', 'left', 'false')
  for (var x = 5; x <= 11; x++) { vrCpt(x, 1, 26, 'north', 'smooth_stone'); if (x % 2) S(x, 2, 26, 'minecraft:note_block') }
  F(5, 2, 27, 11, 3, 27, 'minecraft:black_concrete'); ;[6, 9].forEach(x => vrCh(x, 1, 25, 'south', 'black')); S(8, 3, 24, RUL)
  ;[[24, 6], [27, 11], [24, 26]].forEach(c => baParabole(c[0], c[1]))
  S(4, 0, 4, 'minecraft:blast_furnace[facing=south,lit=false]'); S(5, 0, 4, 'minecraft:iron_block'); F(4, 1, 4, 5, 1, 4, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false,powered=false,waterlogged=false]'); F(6, 0, 4, 12, 0, 4, 'minecraft:chain[axis=x]')
  F(4, 0, 7, 6, 1, 9, RUBAR)
  W(0, 0, 31, 31, 0, 0, GAX); F(14, 0, 0, 17, 0, 0, AIR)
}

// ================= DEPOT LOGISTIQUE =================
function baDepot() {
  gaDalle(0, 0, 31, 31)
  bdCont(3, 0, 4, 'green', 3); bdCont(11, 0, 4, 'brown', 3); bdCont(19, 0, 4, 'gray', 3); bdCont(3, 4, 4, 'gray', 3); bdCont(11, 4, 4, 'green', 3)
  ;[[3, 0, 'green'], [11, 0, 'brown'], [19, 0, 'gray'], [3, 4, 'gray'], [11, 4, 'green']].forEach(c => bdMeubleCont(c[0], c[1], 4, c[2]))
  bdCont(3, 0, 20, 'green', 3); bdCont(11, 0, 20, 'gray', 3); bdMeubleCont(3, 0, 20, 'green'); bdMeubleCont(11, 0, 20, 'gray')
  // palettes de caisses
  for (var x = 20; x <= 28; x += 3) for (var z = 12; z <= 17; z += 3) { F(x, 0, z, x + 1, 0, z + 1, 'minecraft:spruce_slab[type=bottom]'); F(x, 1, z, x + 1, 1, z + 1, (x + z) % 2 ? RUBAR : 'minecraft:chest[facing=south,type=single,waterlogged=false]'); if ((x + z) % 3 == 0) F(x, 2, z, x + 1, 2, z + 1, GAS) }
  // chariot elevateur
  F(4, 0, 13, 5, 1, 14, 'minecraft:yellow_concrete'); S(4, 2, 14, 'minecraft:black_concrete'); F(6, 0, 13, 6, 3, 13, PRB); F(6, 0, 14, 6, 3, 14, PRB); F(7, 0, 13, 7, 0, 14, 'minecraft:iron_trapdoor[facing=east,half=bottom,open=false,powered=false,waterlogged=false]')
  gaCamion(20, 24)
  F(0, 0, 31, 31, 0, 31, GAX); F(31, 0, 0, 31, 0, 30, GAX)
}

// ---- palette et vues ----
var THM_BA = finPalette('spruce', {})
function vuesBaseF() {
  vue('ba_ensemble', 0, 0, 40, 48, 96, 32, 8, 22, 3000)
  vue('ba_rue_ouest', 0, 0, -8, 3, 39.5, 60, 4, 40)
  vue('ba_rue_est', 0, 0, 134, 3, 40.5, 64, 4, 40)
  vue('ba_entree', 0, 0, 31.5, 6, 44, 31.5, 3, 20)
  vue('ba_qg', 0, 0, 12, 7, 35, 19, 4, 12)
  vue('ba_operations', 0, 0, 23, 3, 18, 14, 2, 8)
  vue('ba_radio', 0, 0, 27.5, 3, 11, 31, 1.5, 6)
  vue('ba_briefing', 0, 0, 23, 8, 18.5, 15, 6, 7)
  vue('ba_toit', 0, 0, 8, 16, 28, 20, 12, 12)
  vue('ba_carburant', 0, 0, 31, 13, 13, 47, 3, 13)
  vue('ba_dca', 0, 0, 48, 4.5, 24, 55, 1, 26)
  vue('ba_vehicules', 0, 0, 28, 6, 23, 10, 1, 25)
  vue('ba_radar', 0, 48, 16, 10, -8, 16, 8, 15)
  vue('ba_depot', 32, 48, 16, 9, -8, 16, 2, 14)
  vue('ba_depot_allee', 32, 48, 16, 3, 10, 16, 1, 24)
  vue('ba_coupe_rdc', 72, 0, 32, 30, 46, 20, 0, 12)
  vue('ba_coupe_etage', 144, 0, 32, 32, 46, 20, 5, 12)
}
var QFIN_BA = function () {
  HB2 = true; FIN = true; THM = THM_BA
  HM = {}; baRue(); finAncrage()
  lot(QF64(baBase), 0, 0, 999, 1411, 64, 16)
  lot(QF(baRadar, null, null), 0, 48, 999, 1421, 32, 14); lot(QF(baDepot, null, null), 32, 48, 999, 1431, 32, 9)
  lot(QF64(baBase), 72, 0, 4, 1411, 64, 16); lot(QF64(baBase), 144, 0, 9, 1411, 64, 16)
  vlog('FIN volets ' + FIN_NV + ' rideaux ' + FIN_NR + ' paves ' + PAVE_NB + ' retraits ancrage ' + ANC_NB)
  HB2 = false; FIN = false; THM = null; HM = {}
}
