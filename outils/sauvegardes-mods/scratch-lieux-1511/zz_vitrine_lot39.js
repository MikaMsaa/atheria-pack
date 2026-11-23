// ================= HOPITAL (batiment R+2 de 56 x 22, heliport sur le toit, tentes de tri, parking d'ambulances) =================
var HW = 'minecraft:white_concrete', HOV = 'minecraft:light_blue_stained_glass_pane', HPD = 'minecraft:birch_door', HPS = 'minecraft:polished_diorite'
function hpEtage(y) {
  F(4, y, 6, 59, y, 27, GAL); F(5, y, 7, 58, y, 26, HPS)
  W(4, 6, 59, 27, y + 1, y + 4, HW); F(5, y + 1, 7, 58, y + 4, 26, AIR)
  ;[[4, 6], [59, 6], [4, 27], [59, 27]].forEach(c => F(c[0], y + 1, c[1], c[0], y + 4, c[1], GAL))
  for (var x = 6; x <= 56; x += 3) { F(x, y + 2, 6, x + 1, y + 3, 6, HOV); if (y > 0 || x < 28 || x > 34) F(x, y + 2, 27, x + 1, y + 3, 27, HOV) }
  for (var z = 9; z <= 24; z += 3) { F(4, y + 2, z, 4, y + 3, z + 1, HOV); F(59, y + 2, z, 59, y + 3, z + 1, HOV) }
}
function hpMurs(y, xs, za, zb) { xs.forEach(x => F(x, y + 1, za, x, y + 4, zb, HW)) }
function hpChN(x1, x2, y, t) {
  PORTE(x2 - 1, y + 1, 15, HPD, 'south', 'left', 'false'); var m = Math.floor((x1 + x2) / 2)
  if (t == 'salle') { for (var x = x1 + 1; x <= x2 - 1; x += 3) vrLitS(x, y + 1, 8, 'white', 'north'); vrArm(x2, y + 1, 11, 'west'); vrCh(x1, y + 1, 12, 'east', 'light_blue'); S(x1, y + 1, 13, 'minecraft:potted_fern') }
  if (t == 'bloc') { vrLitS(m, y + 1, 11, 'white', 'north'); S(m - 2, y + 1, 10, 'minecraft:iron_block'); S(m + 2, y + 1, 10, 'minecraft:white_concrete'); S(m + 2, y + 2, 10, 'supplementaries:jar'); vrArm(x1, y + 1, 8, 'east'); vrArm(x2, y + 1, 8, 'west'); S(x1, y + 1, 13, 'minecraft:water_cauldron[level=1]'); S(m, y + 4, 9, RUL) }
  if (t == 'labo') { for (var x = x1; x <= x2; x++) { vrCpt(x, y + 1, 7, 'south', 'quartz_block'); if (x % 2) S(x, y + 2, 7, 'supplementaries:jar') }; vrTab(m, y + 1, 11, 'white'); vrCh(m, y + 1, 12, 'north', 'white'); S(x1, y + 1, 13, RUBAR) }
  S(m, y + 4, 12, RUL)
}
function hpChS(x1, x2, y, t) {
  PORTE(x1 + 1, y + 1, 18, HPD, 'north', 'left', 'false'); var m = Math.floor((x1 + x2) / 2)
  if (t == 'salle') { for (var x = x1 + 1; x <= x2 - 1; x += 3) vrLitS(x, y + 1, 25, 'white', 'south'); vrArm(x2, y + 1, 21, 'west'); if (x2 - x1 >= 5) vrCh(x2, y + 1, 23, 'west', 'light_blue') }
  if (t == 'bureau') { vrBur(m, y + 1, 24, 'north'); vrCh(m, y + 1, 23, 'south', 'black'); for (var z = 21; z <= 25; z++) vrEtag(x2, y + 2, z, 'west'); S(x1, y + 1, 25, 'minecraft:potted_fern') }
  if (t == 'consult') { vrLitS(x1 + 1, y + 1, 25, 'white', 'south'); vrBur(x2, y + 1, 22, 'west'); vrCh(x2 - 1, y + 1, 22, 'east', 'black'); vrArm(x2, y + 1, 25, 'west') }
  S(m, y + 4, 22, RUL)
}

// ---- rue : chaussee, passage pietons devant l'entree, ambulances, arret de bus ----
function hpRue() {
  OX = VB.X0; OY = VB.Y0; OZ = VB.Z0; CUT = 999; GRAINE = 585
  for (var x = -16; x <= 143; x++) for (var z = 32; z <= 47; z++) {
    var r = R(), b
    if (z <= 33 || z >= 46) b = r < 0.7 ? GAL : r < 0.9 ? 'minecraft:andesite' : 'minecraft:gravel'
    else if (x >= 28 && x <= 35 && z >= 34 && z <= 45) b = z % 2 ? 'minecraft:white_concrete' : 'minecraft:black_concrete'
    else if (z == 40 && (x + 32) % 6 < 3) b = 'minecraft:white_concrete'
    else b = r < 0.8 ? 'minecraft:black_concrete' : r < 0.94 ? GAC : 'minecraft:gray_concrete_powder'
    S(x, -1, z, b)
  }
  for (var x = 0; x <= 128; x += 16) { var z = (x / 16) % 2 ? 46 : 33; F(x + 4, 0, z, x + 4, 3, z, 'minecraft:andesite_wall'); S(x + 4, 4, z, 'minecraft:lantern[hanging=false,waterlogged=false]') }
  gaCamion(8, 41, 'white'); bgVoiture(48, 35, 'x', 'white', 1); bgVoiture(74, 41, 'x', 'gray', 1); gaCamion(100, 35, 'white')
  // abri de bus
  F(56, 0, 47, 56, 3, 47, 'minecraft:iron_bars'); F(61, 0, 47, 61, 3, 47, 'minecraft:iron_bars'); F(56, 4, 46, 61, 4, 47, GASL); F(57, 1, 47, 60, 3, 47, GP); F(57, 0, 46, 60, 0, 46, btSt('smooth_quartz', 'north'))
}

// ================= HOPITAL (lot double 64 x 32) =================
function hpHopital() {
  gaSol(0, 0, 63, 31); gaDalle(0, 28, 63, 31); gaDalle(26, 0, 37, 5)
  hpEtage(0); hpEtage(5); hpEtage(10)
  F(4, 15, 6, 59, 15, 27, GAL); W(4, 6, 59, 27, 16, 16, GASL)
  // facade : croix rouge, entree vitree, marquise sur poteaux, ambulance
  F(31, 11, 28, 32, 14, 28, 'minecraft:red_concrete'); F(29, 12, 28, 34, 13, 28, 'minecraft:red_concrete')
  F(28, 1, 27, 35, 4, 27, GP); ;[[30, 'left'], [31, 'right'], [32, 'left'], [33, 'right']].forEach(d => PORTE(d[0], 1, 27, 'mcwdoors:spruce_glass_door', 'south', d[1], 'false'))
  F(26, 5, 28, 37, 5, 31, GAL); F(26, 1, 31, 26, 4, 31, GAL); F(37, 1, 31, 37, 4, 31, GAL); ;[29, 34].forEach(x => S(x, 4, 30, RUL))
  gaCamion(28, 28, 'white')
  for (var x = 5; x <= 22; x++) { S(x, 0, 29, 'minecraft:oak_leaves[distance=7,persistent=true,waterlogged=false]'); S(41 + x - 5, 0, 29, 'minecraft:oak_leaves[distance=7,persistent=true,waterlogged=false]') }
  // ---- rez-de-chaussee ----
  F(5, 1, 15, 25, 4, 15, HW); F(38, 1, 15, 58, 4, 15, HW); F(5, 1, 18, 25, 4, 18, HW); F(38, 1, 18, 58, 4, 18, HW)
  hpMurs(0, [13, 25, 38, 48], 7, 14); hpMurs(0, [12, 19, 25, 38, 48], 19, 26)
  F(25, 1, 16, 25, 4, 17, AIR); F(38, 1, 16, 38, 4, 17, AIR)
  // hall d'accueil
  for (var x = 28; x <= 35; x++) vrCpt(x, 1, 12, 'south', 'quartz_block'); vrCh(30, 1, 11, 'south', 'white'); vrCh(33, 1, 11, 'south', 'white'); vrArm(27, 1, 7, 'south'); vrArm(36, 1, 7, 'south'); for (var x = 29; x <= 34; x++) vrEtag(x, 3, 7, 'south')
  ;[20, 22, 24].forEach(z => { for (var x = 27; x <= 29; x++) vrCh(x, 1, z, 'north', 'light_blue'); for (var x = 34; x <= 36; x++) vrCh(x, 1, z, 'north', 'light_blue') })
  ;[[26, 26], [37, 26], [26, 7], [37, 19]].forEach(c => S(c[0], 1, c[1], 'minecraft:potted_fern'))
  ;[28, 35].forEach(x => F(x, 1, 18, x, 4, 18, 'minecraft:quartz_pillar[axis=y]'))
  ;[[31, 10], [31, 21], [28, 16], [35, 16]].forEach(c => S(c[0], 4, c[1], RUL))
  // urgences
  ;[15, 18, 21].forEach(x => vrLitS(x, 1, 8, 'white', 'north')); ;[17, 20].forEach(x => F(x, 1, 7, x, 2, 9, 'minecraft:white_stained_glass_pane'))
  S(24, 1, 7, RUBAR); S(24, 1, 8, 'minecraft:chest[facing=west,type=single,waterlogged=false]'); vrArm(14, 1, 13, 'east'); S(16, 1, 13, 'minecraft:water_cauldron[level=2]')
  PORTE(23, 1, 15, HPD, 'south', 'left', 'false'); S(19, 4, 11, RUL)
  hpChS(5, 11, 0, 'consult'); hpChS(13, 18, 0, 'consult'); hpChS(20, 24, 0, 'consult')
  // pharmacie
  for (var x = 39; x <= 47; x++) { vrEtag(x, 2, 7, 'south'); vrEtag(x, 3, 7, 'south'); S(x, 1, 7, x % 2 ? 'minecraft:chest[facing=south,type=single,waterlogged=false]' : RUBAR) }
  for (var x = 40; x <= 46; x++) vrCpt(x, 1, 12, 'south', 'quartz_block'); ;[41, 44].forEach(x => S(x, 2, 12, 'supplementaries:jar'))
  PORTE(46, 1, 15, HPD, 'south', 'left', 'false'); S(43, 4, 10, RUL)
  // radiologie
  F(52, 1, 9, 54, 3, 9, HW); S(53, 2, 9, 'minecraft:black_concrete'); vrLitS(53, 1, 11, 'white', 'north')
  vrBur(57, 1, 13, 'west'); vrCh(56, 1, 13, 'east', 'black'); F(55, 1, 12, 55, 3, 14, 'minecraft:white_stained_glass_pane'); F(55, 1, 13, 55, 3, 13, 'minecraft:white_stained_glass_pane')
  PORTE(57, 1, 15, HPD, 'south', 'left', 'false'); S(53, 4, 12, RUL)
  hpChS(39, 47, 0, 'bureau')
  // cafeteria
  PORTE(50, 1, 18, HPD, 'north', 'left', 'false'); ;[51, 55].forEach(x => { vrTab(x, 1, 22, 'none'); vrTab(x + 1, 1, 22, 'none'); vrCh(x, 1, 21, 'south', 'white'); vrCh(x + 1, 1, 21, 'south', 'white'); vrCh(x, 1, 23, 'north', 'white'); vrCh(x + 1, 1, 23, 'north', 'white') })
  for (var x = 49; x <= 58; x++) vrCpt(x, 1, 26, 'north', 'quartz_block'); S(52, 2, 26, 'handcrafted:white_cup'); S(55, 2, 26, 'handcrafted:white_plate'); S(53, 4, 22, RUL)
  // ---- etages : couloir central, chambres, blocs operatoires, bureaux ----
  ;[5, 10].forEach(y => {
    F(5, y + 1, 15, 58, y + 4, 15, HW); F(5, y + 1, 18, 58, y + 4, 18, HW)
    hpMurs(y, [13, 22, 31, 40, 49], 7, 14); hpMurs(y, [12, 18, 24, 30, 36, 42, 48, 54], 19, 26)
    var NS = [[14, 21], [23, 30], [32, 39], [41, 48], [50, 58]], SS = [[5, 11], [13, 17], [19, 23], [25, 29], [31, 35], [37, 41], [43, 47], [49, 53], [55, 58]]
    NS.forEach((r, i) => hpChN(r[0], r[1], y, y == 5 ? 'salle' : ['bloc', 'bloc', 'labo', 'bloc', 'labo'][i]))
    SS.forEach((r, i) => hpChS(r[0], r[1], y, y == 5 ? 'salle' : 'bureau'))
  })
  for (var x = 9; x <= 57; x += 8) [0, 5, 10].forEach(y => S(x, y + 4, 16, RUL))
  // cage d'escalier (x5..12 z7..14) : volee A rdc->1 en x5..6 vers le nord, volee B 1->2 en x11..12 vers le sud
  ;[0, 5, 10].forEach(y => PORTE(9, y + 1, 15, HPD, 'south', 'left', 'false'))
  mdEsc(5, 6, 13, 0, 5, -1, 'quartz', 'minecraft:quartz_block'); mdEsc(11, 12, 9, 5, 5, 1, 'quartz', 'minecraft:quartz_block')
  mdGarde(7, 10, 13, 6); F(5, 6, 14, 6, 6, 14, GP); mdGarde(10, 9, 12, 11); F(11, 11, 8, 12, 11, 8, GP)
  ;[0, 5, 10].forEach(y => S(9, y + 4, 11, RUL))
  // toit : heliport, groupes de climatisation, citerne
  for (var z = 11; z <= 22; z++) { F(27, 15, z, 28, 15, z, 'minecraft:yellow_concrete'); F(35, 15, z, 36, 15, z, 'minecraft:yellow_concrete') }; F(29, 15, 16, 34, 15, 17, 'minecraft:yellow_concrete')
  ;[[25, 9], [38, 9], [25, 24], [38, 24]].forEach(c => S(c[0], 16, c[1], 'minecraft:lantern[hanging=false,waterlogged=false]'))
  ;[[7, 9], [12, 9], [47, 9], [52, 9]].forEach(c => { F(c[0], 16, c[1], c[0] + 2, 16, c[1] + 2, 'minecraft:iron_block'); F(c[0], 17, c[1], c[0] + 2, 17, c[1] + 2, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false,powered=false,waterlogged=false]') })
  F(50, 16, 20, 54, 18, 24, 'minecraft:waxed_weathered_copper'); F(8, 16, 22, 8, 19, 22, 'minecraft:iron_bars'); S(8, 20, 22, 'minecraft:lightning_rod[facing=up,powered=false,waterlogged=false]')
  // arriere : groupe electrogene, bennes, epave
  S(10, 0, 2, 'minecraft:blast_furnace[facing=south,lit=false]'); S(11, 0, 2, 'minecraft:iron_block'); F(10, 1, 2, 11, 1, 2, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false,powered=false,waterlogged=false]')
  F(44, 0, 1, 46, 1, 3, 'minecraft:green_terracotta'); F(48, 0, 1, 50, 1, 3, 'minecraft:green_terracotta'); bgVoiture(54, 2, 'x', 'white', 2)
  F(0, 0, 0, 25, 0, 0, 'mcwfences:ornate_metal_fence'); F(38, 0, 0, 63, 0, 0, 'mcwfences:ornate_metal_fence')
}

// ================= TENTES DE TRI ET DECONTAMINATION =================
function hpTri() {
  gaSol(0, 0, 31, 31); gaDalle(0, 0, 31, 3)
  gaTente(3, 15, 6, 'minecraft:white_wool'); gaTente(18, 30, 6, 'minecraft:white_wool')
  ;[[3, 15, 6], [18, 30, 6]].forEach(t => { var x1 = t[0], x2 = t[1], z1 = t[2]; S(x2, 2, z1 + 3, 'minecraft:red_wool'); S(x2, 3, z1 + 3, 'minecraft:red_wool'); S(x2, 1, z1 + 3, 'minecraft:red_wool'); S(x2, 2, z1 + 2, 'minecraft:red_wool'); S(x2, 2, z1 + 4, 'minecraft:red_wool'); for (var x = x1 + 2; x <= x2 - 3; x += 3) { vrLitS(x, 1, z1 + 1, 'white', 'east'); vrLitS(x, 1, z1 + 5, 'white', 'east') } })
  // douche de decontamination
  ;[[5, 18], [9, 18], [5, 22], [9, 22]].forEach(c => F(c[0], 0, c[1], c[0], 3, c[1], 'minecraft:iron_bars')); F(5, 4, 18, 9, 4, 22, 'minecraft:white_stained_glass'); F(6, 3, 20, 8, 3, 20, 'minecraft:chain[axis=x]'); ;[6, 8].forEach(x => S(x, 0, 20, 'minecraft:water_cauldron[level=3]'))
  // brancards, barrieres, zone d'attente
  ;[14, 17, 20].forEach(x => vrLitS(x, 0, 18, 'light_blue', 'east')); F(13, 0, 22, 24, 0, 22, 'minecraft:smooth_stone')
  F(26, 0, 17, 29, 0, 20, RUBAR); F(26, 1, 17, 28, 1, 18, RUBAR); ;[[25, 16], [30, 16], [25, 21], [30, 21]].forEach(c => F(c[0], 0, c[1], c[0], 2, c[1], 'minecraft:spruce_fence')); F(25, 3, 16, 30, 3, 21, 'minecraft:light_blue_wool')
  gaCamion(4, 26, 'white'); gaCamion(14, 26, 'white')
  F(0, 0, 31, 31, 0, 31, GAX); F(31, 0, 4, 31, 0, 30, GAX)
}

// ================= PARKING DES AMBULANCES =================
function hpParking() {
  for (var x = 0; x <= 31; x++) for (var z = 0; z <= 31; z++) { var r = R(); S(x, -1, z, r < 0.8 ? 'minecraft:black_concrete' : r < 0.94 ? GAC : 'minecraft:gray_concrete_powder') }
  for (var x = 2; x <= 29; x += 4) { F(x, -1, 6, x, -1, 11, 'minecraft:white_concrete'); F(x, -1, 20, x, -1, 25, 'minecraft:white_concrete') }
  gaCamion(3, 7, 'white'); bgVoiture(11, 8, 'z', 'white', 1); bgVoiture(19, 8, 'z', 'red', 2); gaCamion(23, 21, 'white'); bgVoiture(7, 21, 'z', 'gray', 1); bgVoiture(15, 21, 'z', 'white', 0, true)
  // guerite d'acces, barriere, eclairage
  gaBat(26, 1, 30, 4, 0, 3, GAL); F(27, 2, 1, 29, 3, 1, GP); F(26, 2, 2, 26, 3, 3, GP); PORTE(30, 1, 3, GAD, 'east', 'left', 'false'); S(28, 3, 2, RUL); vrBur(27, 1, 3, 'west')
  F(25, 0, 1, 25, 1, 1, 'minecraft:yellow_concrete'); F(18, 1, 1, 24, 1, 1, 'minecraft:dark_oak_fence')
  ;[[1, 15], [15, 15], [30, 15]].forEach(c => { F(c[0], 0, c[1], c[0], 4, c[1], 'minecraft:andesite_wall'); S(c[0], 5, c[1], 'minecraft:lantern[hanging=false,waterlogged=false]') })
  vrDebris(14, 1, 12, 30, 19, 0)
  F(0, 0, 31, 31, 0, 31, GAX)
}

// ---- palette et vues ----
function QF64(fn) { return function () { HM = {}; FIN_VOLET = null; FIN_RID = null; fn(); finAuto(64); finAncrage() } }
var THM_HP = finPalette('spruce', {})
function vuesHopitalF() {
  vue('hp_ensemble', 0, 0, 40, 46, 96, 40, 8, 30, 3000)
  vue('hp_rue_ouest', 0, 0, -8, 3, 39.5, 60, 4, 40)
  vue('hp_rue_est', 0, 0, 134, 3, 40.5, 64, 4, 40)
  vue('hp_facade', 0, 0, 32, 9, 50, 32, 7, 18)
  vue('hp_entree', 0, 0, 31.5, 3, 37, 31.5, 2, 27)
  vue('hp_hall', 0, 0, 31.5, 3, 25, 31.5, 1.5, 9)
  vue('hp_urgences', 0, 0, 23, 3, 13, 15, 1, 8)
  vue('hp_pharmacie', 0, 0, 46, 3, 13, 40, 1.5, 7)
  vue('hp_radiologie', 0, 0, 50.5, 3, 13, 56, 1, 9)
  vue('hp_cafeteria', 0, 0, 50.5, 3, 19.5, 57, 1, 25)
  vue('hp_escalier', 0, 0, 10, 3.2, 12.5, 5.5, 4, 9)
  vue('hp_couloir', 0, 0, 53.5, 7.6, 16.5, 10, 6.5, 16.5)
  vue('hp_chambre', 0, 0, 20, 7.8, 13, 15, 6, 8)
  vue('hp_bloc', 0, 0, 47, 12.8, 13, 42, 11, 9)
  vue('hp_bureaux', 0, 0, 34, 12.8, 20, 31, 11, 25)
  vue('hp_toit', 0, 0, 32, 26, 40, 32, 15, 16)
  vue('hp_arriere', 0, 0, 32, 8, -10, 32, 5, 10)
  vue('hp_tri', 0, 48, 16, 9, -8, 16, 1, 14)
  vue('hp_tri_tente', 0, 48, 5.5, 2.2, 9.5, 14, 1, 9.5)
  vue('hp_decontamination', 0, 48, 13, 4, 15, 7, 1, 20)
  vue('hp_parking', 32, 48, 16, 9, -8, 16, 0, 14)
  vue('hp_coupe_rdc', 72, 0, 32, 32, 46, 32, 0, 16)
  vue('hp_coupe_etage', 144, 0, 32, 34, 46, 32, 5, 16)
  vue('hp_coupe_etage2', 216, 0, 32, 38, 46, 32, 10, 16)
}
var QFIN_HP = function () {
  HB2 = true; FIN = true; THM = THM_HP
  HM = {}; hpRue(); finAncrage()
  lot(QF64(hpHopital), 0, 0, 999, 1211, 64, 21)
  lot(QF(hpTri, null, null), 0, 48, 999, 1221, 32, 6); lot(QF(hpParking, null, null), 32, 48, 999, 1231, 32, 6)
  lot(QF64(hpHopital), 72, 0, 4, 1211, 64, 21); lot(QF64(hpHopital), 144, 0, 9, 1211, 64, 21); lot(QF64(hpHopital), 216, 0, 14, 1211, 64, 21)
  vlog('FIN volets ' + FIN_NV + ' rideaux ' + FIN_NR + ' paves ' + PAVE_NB + ' retraits ancrage ' + ANC_NB)
  HB2 = false; FIN = false; THM = null; HM = {}
}
