
// ================= MAMOUDZOU : HAUSSMANNIEN SERIE 2 (mairie, poste, grand hotel, passage couvert, ecole, commissariat, musee, hotel des ventes, brasserie) =================
// Rangee nord : facade au sud en z29 (trottoir z30..31). Rangee sud : facade au nord en z2 (trottoir z0..1). Etages de 6, planchers a y%6 == 0.
var HMPL = 'minecraft:calcite', HMV = 'mcwdoors:dark_oak_glass_door'
function hmTrottoir(z1, z2) { for (var x = 0; x <= 31; x++) for (var z = z1; z <= z2; z++) S(x, -1, z, R() < 0.8 ? 'minecraft:smooth_stone' : 'minecraft:polished_andesite') }
// facade de pierre dans le plan z = zf, exterieur en zf + d ; baies : intervalles de x relatifs a x1 ; balc : niveaux des balcons filants
function hmFac(x1, x2, zf, d, nf, baies, balc) {
  var fo = d > 0 ? 'north' : 'south'
  for (var x = x1; x <= x2; x++) for (var y = 0; y < nf * 6; y++) {
    var k = y % 6, b = y < 6 ? (y % 2 ? HC : HS) : k == 0 ? HC : hbM(HS)
    if (y >= 6 && k >= 1 && k <= 4 && baies.some(p => x - x1 >= p[0] && x - x1 <= p[1])) b = GP
    S(x, y, zf, b)
  }
  if (nf >= 2) F(x1, 11, zf + d, x2, 11, zf + d, hbE('minecraft:smooth_sandstone', fo, 'top'))
  F(x1, nf * 6 - 1, zf + d, x2, nf * 6 - 1, zf + d, hbE('minecraft:smooth_sandstone', fo, 'top'))
  ;(balc || []).forEach(L => { F(x1 + 1, L, zf + d, x2 - 1, L, zf + d, 'minecraft:smooth_sandstone_slab[type=top]'); F(x1 + 1, L + 1, zf + d, x2 - 1, L + 1, zf + d, HF) })
}
// facade arriere enduite
function hmArr(x1, x2, zb, nf, baies) {
  for (var x = x1; x <= x2; x++) for (var y = 0; y < nf * 6; y++) { var k = y % 6, w = k >= 2 && k <= 4 && baies.some(p => x - x1 >= p[0] && x - x1 <= p[1]); S(x, y, zb, w ? GP : (k == 0 ? HS : hbM(HMPL))) }
}
function hmPignons(x1, x2, z1, z2, nf) { hbMur(x1, 0, z1, x1, nf * 6 - 1, z2, HS); hbMur(x2, 0, z1, x2, nf * 6 - 1, z2, HS) }
function hmPlanchers(x1, z1, x2, z2, nf) { F(x1 + 1, 0, z1 + 1, x2 - 1, 0, z2 - 1, 'minecraft:polished_andesite'); for (var n = 1; n < nf; n++) F(x1 + 1, n * 6, z1 + 1, x2 - 1, n * 6, z2 - 1, 'minecraft:spruce_planks') }
// escalier a volees alternees dans une cage x xa..xa+2, z za..za+5
function hmEsc(xa, za, nf) {
  var m = 'minecraft:spruce'
  for (var n = 0; n < nf - 1; n++) {
    var y = n * 6, pair = n % 2 == 0
    for (var i = 0; i < 6; i++) {
      if (pair) { S(xa, y + 1 + i, za + i, hbE(m, 'south')); if (i) S(xa, y + i, za + i, hbE(m, 'north', 'top')) }
      else { S(xa + 2, y + 1 + i, za + 5 - i, hbE(m, 'north')); if (i) S(xa + 2, y + i, za + 5 - i, hbE(m, 'south', 'top')) }
    }
    if (pair) F(xa, y + 6, za, xa, y + 6, za + 4, AIR); else F(xa + 2, y + 6, za + 1, xa + 2, y + 6, za + 5, AIR)
  }
}
function hmSills(x1, x2, zf, d, nf) { hb2Pierre('x', x1, x2, 6, nf * 6 - 1, zf, d, 0.25) }
function hmLustre(x, y, z) { S(x, y, z, 'mcwlights:iron_chandelier') }

// ================= MAIRIE (R+2, campanile a horloge, salle des mariages, jardin) =================
function hmMairie() {
  hmTrottoir(30, 31); hbSol(1, 1, 30, 12)
  var B = [[1, 2], [5, 6], [9, 10], [13, 14], [17, 18], [21, 22], [25, 26]]
  hmPlanchers(2, 14, 29, 29, 3); hmPignons(2, 29, 14, 29, 3); hmArr(2, 29, 14, 3, [[3, 4], [8, 9], [18, 19], [23, 24]])
  hmFac(2, 29, 29, 1, 3, B, [])
  F(12, 6, 30, 19, 6, 30, 'minecraft:smooth_sandstone_slab[type=top]'); F(12, 7, 30, 19, 7, 30, HF)
  // rez : fenetres hautes, porte double vitree, perron
  B.forEach(p => { if (p[0] != 13) F(2 + p[0], 2, 29, 2 + p[1], 4, 29, GP) })
  F(14, 1, 29, 17, 4, 29, GP); PORTE(15, 1, 29, HMV, 'south', 'left', 'true'); PORTE(16, 1, 29, HMV, 'south', 'right', 'false')
  F(13, 0, 30, 18, 0, 30, 'minecraft:smooth_stone_slab[type=bottom]')
  S(13, 9, 30, 'minecraft:blue_wall_banner[facing=south]'); S(18, 9, 30, 'minecraft:red_wall_banner[facing=south]')
  // hall et escalier d'honneur
  for (var x = 12; x <= 19; x++) for (var z = 15; z <= 28; z++) S(x, 0, z, (x + z) % 2 ? 'minecraft:smooth_quartz' : 'minecraft:polished_deepslate')
  hmEsc(13, 15, 3)
  ;[0, 6, 12].forEach((y, n) => {
    F(11, y + 1, 15, 11, y + 5, 28, HMPL); F(20, y + 1, 15, 20, y + 5, 28, HMPL)
    PORTE(11, y + 1, 25, HPO, 'west', 'left', 'false'); PORTE(20, y + 1, 25, HPO, 'east', 'right', n == 1 ? 'true' : 'false')
    hmLustre(16, y + 5, 24)
    if (n == 0) { piece(cadre(3, 15, 10, 28, 'south', y, 5), 'bureau', 0); piece(cadre(21, 15, 28, 28, 'south', y, 5), 'bureau', 1) }
    if (n == 2) { piece(cadre(3, 15, 10, 28, 'south', y, 5), 'salle', 1); piece(cadre(21, 15, 28, 28, 'south', y, 5), 'bureau', 0) }
  })
  // salle des mariages (1er, a gauche) : rangs de chaises, table du maire, tapis rouge
  for (var z = 17; z <= 27; z += 2) for (var x = 5; x <= 9; x++) if (x != 7) S(x, 7, z, MAT('dark_oak_chair', 'north'))
  F(7, 6, 16, 7, 6, 28, 'minecraft:red_wool'); F(4, 7, 15, 10, 7, 15, MAT('dark_oak_counter', 'south')); S(6, 8, 15, 'minecraft:candle[candles=3,lit=false]'); S(8, 8, 15, 'supplementaries:book_pile')
  S(7, 11, 21, 'mcwlights:iron_chandelier'); S(3, 7, 28, 'minecraft:potted_dead_bush'); S(10, 7, 28, 'minecraft:potted_dead_bush')
  // bureau du maire (1er, a droite)
  piece(cadre(21, 15, 28, 28, 'south', 6, 5), 'bureau', 1)
  // toit, campanile
  hbMansarde(2, 14, 29, 29, 18, [14, 21, 17, 24]); hbCheminee(4, 18, 22, 1); hbCheminee(27, 18, 22, 1)
  W(14, 21, 17, 24, 18, 25, HS); F(15, 18, 22, 16, 18, 23, 'minecraft:spruce_planks'); F(15, 25, 22, 16, 25, 23, HS)
  F(15, 22, 24, 16, 23, 24, 'minecraft:white_concrete'); S(15, 23, 25, 'minecraft:black_concrete'); S(16, 22, 25, 'minecraft:black_concrete')
  F(15, 22, 21, 16, 23, 21, AIR); F(14, 22, 22, 14, 23, 23, AIR); F(17, 22, 22, 17, 23, 23, AIR)
  S(15, 24, 22, 'minecraft:bell[attachment=ceiling,facing=north,powered=false]')
  F(13, 26, 20, 18, 26, 25, 'minecraft:oxidized_cut_copper_slab[type=bottom]'); F(14, 26, 21, 17, 26, 24, 'minecraft:oxidized_cut_copper'); F(15, 27, 22, 16, 27, 23, 'minecraft:oxidized_cut_copper_slab[type=bottom]')
  hmSills(2, 29, 29, 1, 3)
  // jardin : bassin, platanes, allee
  PORTE(15, 1, 14, HPO, 'north', 'left', 'false')
  for (var z = 1; z <= 13; z++) { S(15, -1, z, 'minecraft:gravel'); S(16, -1, z, 'minecraft:gravel'); delete HV['15,' + z]; delete HV['16,' + z] }
  W(22, 4, 27, 9, 0, 0, 'minecraft:stone_bricks'); F(23, 0, 5, 26, 0, 8, 'minecraft:water'); F(23, -1, 5, 26, -1, 8, 'minecraft:stone_bricks'); for (var x = 22; x <= 27; x++) for (var z = 4; z <= 9; z++) delete HV[x + ',' + z]
  hbPlatane(5, 6, 6); hbPlatane(10, 10, 5); gtBanc(18, 6, 'west', 3)
  hbMur(0, 0, 0, 31, 1, 0, HSB); hbMur(0, 0, 1, 0, 1, 13, HSB); hbMur(31, 0, 1, 31, 1, 13, HSB)
  hbVeg(1, 1, 30, 12, 0.7)
}

// ================= HOTEL DES POSTES (R+3, guichets grilles, salle de tri, bureaux) =================
function hmPoste() {
  hmTrottoir(30, 31)
  for (var x = 1; x <= 30; x++) for (var z = 1; z <= 11; z++) { var r = R(); S(x, -1, z, r < 0.7 ? 'minecraft:cobblestone' : r < 0.9 ? 'minecraft:stone_bricks' : 'minecraft:gravel') }
  var B = [[1, 2], [5, 6], [9, 10], [15, 16], [19, 20], [23, 24]]
  hmPlanchers(3, 12, 28, 29, 4); hmPignons(3, 28, 12, 29, 4); hmArr(3, 28, 12, 4, [[2, 3], [7, 8], [17, 18], [22, 23]])
  hmFac(3, 28, 29, 1, 4, B, [12])
  B.forEach(p => F(3 + p[0], 1, 29, 3 + p[1], 4, 29, GP))
  F(15, 1, 29, 16, 4, 29, GP); PORTE(15, 1, 29, HMV, 'south', 'left', 'false'); PORTE(16, 1, 29, HMV, 'south', 'right', 'true')
  F(14, 5, 30, 17, 5, 30, 'minecraft:smooth_sandstone_slab[type=bottom]')
  F(10, 0, 30, 10, 1, 30, 'minecraft:yellow_concrete'); S(10, 2, 30, 'minecraft:smooth_stone_slab[type=bottom]')
  // salle du public : guichets grilles
  for (var x = 4; x <= 27; x++) for (var z = 22; z <= 28; z++) S(x, 0, z, (x + z) % 2 ? 'minecraft:white_terracotta' : 'minecraft:light_gray_terracotta')
  F(4, 1, 21, 27, 1, 21, MAT('dark_oak_counter', 'south')); F(4, 2, 21, 27, 4, 21, 'minecraft:iron_bars'); ;[7, 12, 19, 24].forEach(x => S(x, 2, 21, AIR))
  F(4, 5, 21, 27, 5, 21, 'minecraft:dark_oak_planks')
  for (var x = 5; x <= 26; x++) if (x % 4 != 1 && x != 15 && x != 16) S(x, 1, 28, hbE('minecraft:spruce', 'south'))
  ;[[8, 25], [16, 25], [23, 25]].forEach(p => hmLustre(p[0], 5, p[1]))
  ;[[6, 23], [20, 26], [25, 24]].forEach(p => SA(p[0], 1, p[1], choix(['minecraft:white_carpet', 'supplementaries:sack'])))
  // salle de tri : casiers, sacs, caisses
  F(4, 1, 13, 22, 3, 13, 'minecraft:chiseled_bookshelf[facing=south]'); F(4, 4, 13, 22, 4, 13, 'minecraft:spruce_slab[type=bottom]')
  ;[[6, 17], [10, 18], [14, 16], [18, 18], [9, 15]].forEach(p => { S(p[0], 1, p[1], 'supplementaries:sack'); if (R() < 0.5) S(p[0], 2, p[1], 'supplementaries:sack') })
  ;[[12, 19], [13, 19], [16, 15]].forEach(p => S(p[0], 1, p[1], 'minecraft:barrel[facing=up,open=false]'))
  F(7, 1, 16, 9, 1, 16, 'mcwfurnitures:oak_table'); S(8, 2, 16, 'supplementaries:book_pile'); S(12, 5, 16, HLH); S(19, 5, 16, HLH)
  // cage d'escalier (angle arriere droit) et bureaux des etages
  hmEsc(24, 13, 4)
  ;[0, 6, 12, 18].forEach((y, n) => {
    F(23, y + 1, 13, 23, y + 5, 19, HMPL); F(24, y + 1, 19, 27, y + 5, 19, HMPL); PORTE(25, y + 1, 19, HPO, 'south', 'left', n == 2 ? 'true' : 'false')
    if (n == 0) { F(23, 1, 13, 23, 5, 18, HMPL); return }
    F(14, y + 1, 13, 14, y + 5, 28, HMPL); PORTE(14, y + 1, 24, HPO, 'east', 'left', 'false')
    piece(cadre(4, 13, 13, 28, 'south', y, 5), n == 3 ? 'salle' : 'bureau', R() < 0.5 ? 1 : 0)
    piece(cadre(15, 20, 27, 28, 'south', y, 5), choix(['bureau', 'salle', 'bureau']), R() < 0.5 ? 1 : 0)
    F(15, y + 1, 13, 22, y + 3, 13, 'minecraft:chiseled_bookshelf[facing=south]'); hbBazar(15, 14, 22, 18, y + 1, 3)
  })
  hbMansarde(3, 12, 28, 29, 24); hbCheminee(5, 15, 28, 2); hbCheminee(25, 26, 28, 2)
  hmSills(3, 28, 29, 1, 4)
  // cour de service : fourgon, chariots, porte arriere
  PORTE(10, 1, 12, HPO, 'north', 'left', 'false'); bgVoiture(17, 4, 'x', 'yellow', 1); S(6, 0, 5, 'minecraft:barrel[facing=up,open=false]'); S(7, 0, 5, 'supplementaries:sack'); S(26, 0, 3, 'supplementaries:sack')
  hbMur(0, 0, 0, 31, 2, 0, HSB); hbMur(0, 0, 1, 0, 2, 11, HSB); hbMur(31, 0, 1, 31, 2, 11, HSB)
}

// ================= GRAND HOTEL (R+5, marquise, hall de marbre, salon, chambres, jardin d'hiver) =================
function hmHotel() {
  hmTrottoir(30, 31); hbSol(1, 1, 30, 9)
  var B = [[1, 2], [5, 6], [9, 10], [14, 15], [19, 20], [23, 24], [27, 28]]
  hmPlanchers(1, 10, 30, 29, 6); hmPignons(1, 30, 10, 29, 6); hmArr(1, 30, 10, 6, [[3, 4], [9, 10], [19, 20], [25, 26]])
  hmFac(1, 30, 29, 1, 6, B, [12, 30])
  B.forEach(p => { if (p[0] != 14) F(1 + p[0], 1, 29, 1 + p[1], 4, 29, GP) })
  F(15, 1, 29, 16, 4, 29, GP); PORTE(15, 1, 29, HMV, 'south', 'left', 'true'); PORTE(16, 1, 29, HMV, 'south', 'right', 'true')
  // marquise de fer et verre sur le trottoir
  F(12, 5, 30, 19, 5, 31, 'minecraft:iron_trapdoor[facing=south,half=top,open=false,powered=false,waterlogged=false]'); F(12, 6, 30, 19, 6, 30, 'minecraft:glass_pane')
  ;[12, 19].forEach(x => F(x, 0, 31, x, 4, 31, 'minecraft:polished_blackstone_wall'))
  // hall de marbre, reception, salon
  for (var x = 2; x <= 29; x++) for (var z = 17; z <= 28; z++) S(x, 0, z, (x + z) % 2 ? 'minecraft:smooth_quartz' : 'minecraft:polished_blackstone')
  F(7, 1, 18, 12, 1, 18, MAT('dark_oak_counter', 'south')); F(7, 1, 17, 12, 3, 17, 'minecraft:chiseled_bookshelf[facing=south]'); S(9, 2, 18, 'minecraft:bell[attachment=floor,facing=south,powered=false]'); S(11, 2, 18, 'supplementaries:book_pile')
  ;[[21, 21], [26, 21], [21, 26], [26, 26]].forEach(t => { S(t[0], 1, t[1], 'mcwfurnitures:dark_oak_table'); S(t[0] - 1, 1, t[1], 'mcwfurnitures:red_couch[facing=east]'); S(t[0] + 1, 1, t[1], 'mcwfurnitures:red_couch[facing=west]'); SA(t[0], 2, t[1], choix(VAISS).replace('{I}', 'north')) })
  ;[[9, 23], [16, 23], [23, 23]].forEach(p => hmLustre(p[0], 5, p[1])); S(2, 1, 28, 'minecraft:potted_dead_bush'); S(29, 1, 28, 'minecraft:potted_dead_bush')
  F(2, 1, 16, 29, 5, 16, HMPL); PORTE(15, 1, 16, HPO, 'south', 'left', 'true'); PORTE(16, 1, 16, HPO, 'south', 'right', 'true')
  // salle a manger (rez arriere)
  for (var x = 6; x <= 26; x += 5) { S(x, 1, 13, 'mcwfurnitures:oak_table'); S(x - 1, 1, 13, MAT('oak_chair', 'east')); S(x + 1, 1, 13, MAT('oak_chair', 'west')); SA(x, 2, 13, choix(VAISS).replace('{I}', 'north')) }
  hmLustre(10, 5, 13); hmLustre(21, 5, 13)
  // escalier et chambres
  hmEsc(2, 11, 6)
  ;[6, 12, 18, 24, 30].forEach((y, n) => {
    F(2, y + 1, 21, 29, y + 5, 21, HMPL); F(5, y + 1, 18, 29, y + 5, 18, HMPL); F(5, y + 1, 11, 5, y + 5, 17, HMPL)
    F(11, y + 1, 22, 11, y + 5, 28, HMPL); F(21, y + 1, 22, 21, y + 5, 28, HMPL); F(17, y + 1, 11, 17, y + 5, 17, HMPL)
    ;[6, 16, 25].forEach(x => PORTE(x, y + 1, 21, HPO, 'north', 'left', R() < 0.25 ? 'true' : 'false')); ;[10, 22].forEach(x => PORTE(x, y + 1, 18, HPO, 'south', 'left', 'false'))
    F(2, y, 19, 29, y, 20, 'minecraft:red_wool'); S(16, y + 5, 19, HLH)
    piece(cadre(2, 22, 10, 28, 'south', y, 5), 'chambre', R() < 0.4 ? 1 : 0); piece(cadre(12, 22, 20, 28, 'south', y, 5), n % 2 ? 'salon' : 'chambre', 0); piece(cadre(22, 22, 29, 28, 'south', y, 5), 'chambre', R() < 0.4 ? 1 : 0)
    piece(cadre(6, 11, 16, 17, 'north', y, 5), 'chambre', 0); piece(cadre(18, 11, 29, 17, 'north', y, 5), n == 4 ? 'salle' : 'chambre', 1)
  })
  hbMansarde(1, 10, 30, 29, 36); hbCheminee(4, 14, 40, 2); hbCheminee(26, 25, 40, 2); hbCheminee(15, 12, 40, 1)
  hmSills(1, 30, 29, 1, 6)
  // jardin d'hiver adosse et terrasse
  PORTE(15, 1, 10, HMV, 'north', 'left', 'false')
  F(10, 0, 4, 21, 0, 9, 'minecraft:smooth_stone'); W(10, 4, 21, 9, 1, 4, GP); F(10, 5, 4, 21, 5, 9, 'minecraft:glass'); F(10, 1, 9, 21, 4, 9, AIR)
  ;[10, 21].forEach(x => F(x, 1, 4, x, 4, 4, 'minecraft:polished_blackstone_wall')); for (var x = 10; x <= 21; x++) for (var z = 4; z <= 9; z++) delete HV[x + ',' + z]
  ;[[12, 6], [19, 6]].forEach(t => { S(t[0], 1, t[1], 'mcwfurnitures:oak_table'); S(t[0], 1, t[1] + 1, MAT('oak_chair', 'north')) }); S(15, 1, 5, 'minecraft:potted_fern'); S(16, 1, 5, 'minecraft:potted_dead_bush')
  hbPlatane(4, 4, 6); hbPlatane(27, 5, 6)
  hbMur(0, 0, 0, 31, 1, 0, HSB); hbMur(0, 0, 1, 0, 1, 9, HSB); hbMur(31, 0, 1, 31, 1, 9, HSB)
  hbVeg(1, 1, 30, 9, 0.6)
}

// ================= PASSAGE COUVERT (verriere, boutiques de part et d'autre, immeuble d'entree) =================
function hmPassage() {
  hmTrottoir(30, 31)
  // immeuble d'entree z23..29 sur toute la largeur, ailes x1..12 et x19..30 vers l'arriere
  hmPlanchers(1, 23, 30, 29, 3); hmFac(1, 30, 29, 1, 3, [[2, 3], [6, 7], [11, 12], [17, 18], [22, 23], [26, 27]], [12])
  hbMur(1, 0, 1, 1, 17, 28, HS); hbMur(30, 0, 1, 30, 17, 28, HS); hmArr(1, 12, 1, 3, [[3, 4], [8, 9]]); hmArr(19, 30, 1, 3, [[3, 4], [8, 9]])
  F(2, 0, 2, 11, 0, 22, 'minecraft:polished_andesite'); F(20, 0, 2, 29, 0, 22, 'minecraft:polished_andesite')
  ;[6, 12].forEach(y => { F(2, y, 2, 11, y, 22, 'minecraft:spruce_planks'); F(20, y, 2, 29, y, 22, 'minecraft:spruce_planks') })
  // murs sur le passage (x12 et x19) : vitrines au rez, fenetres aux etages
  ;[12, 19].forEach(x => { for (var z = 2; z <= 22; z++) for (var y = 0; y <= 17; y++) { var k = y % 6, w = y >= 6 && k >= 2 && k <= 4 && z % 4 == 1; S(x, y, z, w ? GP : (k == 0 ? HC : hbM(HS))) } })
  // passage : sol en damier, arc d'entree, verriere a y12
  for (var x = 13; x <= 18; x++) for (var z = 1; z <= 29; z++) S(x, 0, z, (x + z) % 2 ? 'minecraft:smooth_quartz' : 'minecraft:polished_deepslate')
  F(13, 1, 23, 18, 11, 29, AIR); F(14, 1, 29, 17, 5, 29, AIR); F(13, 6, 29, 18, 11, 29, HS); F(14, 6, 29, 17, 6, 29, 'chipped:engraved_sandstone')
  F(13, 6, 23, 18, 6, 28, 'minecraft:spruce_planks'); F(13, 1, 23, 13, 5, 28, HS); F(18, 1, 23, 18, 5, 28, HS); F(14, 1, 23, 17, 5, 23, AIR)
  for (var z = 1; z <= 22; z++) { F(13, 12, z, 18, 12, z, z % 4 == 0 ? 'minecraft:iron_block' : 'minecraft:glass'); if (z % 4 == 2) S(15, 11, z, HLH) }
  F(13, 1, 1, 18, 4, 1, 'minecraft:iron_bars'); F(13, 5, 1, 18, 11, 1, HS)
  // boutiques : trois de chaque cote, vitrines et portes vitrees
  var MET = [
    (x, z, s) => { F(x, 1, z, x, 3, z + 3, 'minecraft:bookshelf'); S(x + s * 3, 1, z + 1, 'mcwfurnitures:oak_table'); S(x + s * 3, 2, z + 1, 'supplementaries:book_pile') },
    (x, z, s) => { for (var k = 0; k < 4; k++) { S(x, 1, z + k, 'minecraft:spruce_slab[type=top]'); SA(x, 2, z + k, 'supplementaries:jar') } S(x + s * 3, 1, z + 2, MAT('oak_counter', s > 0 ? 'west' : 'east')) },
    (x, z, s) => { F(x, 1, z, x, 2, z + 3, choix(['minecraft:white_wool', 'minecraft:red_wool', 'minecraft:light_blue_wool'])); S(x, 3, z + 1, 'minecraft:yellow_wool'); S(x + s * 2, 1, z + 3, 'minecraft:barrel[facing=up,open=false]') },
    (x, z, s) => { F(x, 1, z, x, 1, z + 3, MAT('dark_oak_drawer', s > 0 ? 'east' : 'west')); ;[0, 2].forEach(k => SA(x, 2, z + k, 'minecraft:decorated_pot')); S(x + s * 3, 1, z + 1, 'minecraft:grindstone[face=floor,facing=south]') },
    (x, z, s) => { F(x, 1, z, x, 3, z + 3, 'minecraft:chiseled_bookshelf[facing=' + (s > 0 ? 'east' : 'west') + ']'); S(x + s * 3, 1, z + 2, 'mcwfurnitures:oak_table'); S(x + s * 3, 2, z + 2, 'minecraft:candle[candles=2,lit=false]') },
    (x, z, s) => { for (var k = 0; k < 4; k++) S(x, 1, z + k, MAT('oak_counter', s > 0 ? 'east' : 'west')); ;[0, 3].forEach(k => SA(x, 2, z + k, choix(GATEAUX))); S(x + s * 3, 1, z + 1, 'minecraft:barrel[facing=up,open=false]') }
  ]
  var iM = 0
  ;[[2, 7], [9, 14], [16, 21]].forEach(zz => {
    ;[[12, 2, 11, 1, -1], [19, 20, 29, 30, 1]].forEach(c => {
      var xw = c[0], xa = Math.min(c[1], c[2]), xb = Math.max(c[1], c[2]), s = c[4]
      F(xw, 1, zz[0], xw, 4, zz[1], GP); F(xw, 5, zz[0], xw, 5, zz[1], 'minecraft:dark_oak_planks'); F(xw, 1, zz[0], xw, 5, zz[0], 'minecraft:dark_oak_planks'); F(xw, 1, zz[1], xw, 5, zz[1], 'minecraft:dark_oak_planks')
      PORTE(xw, 1, zz[0] + 2, HMV, s > 0 ? 'west' : 'east', 'left', R() < 0.3 ? 'true' : 'false')
      F(xa, 1, zz[1] + 1, xb, 5, zz[1] + 1, HMPL)
      MET[iM % MET.length](s > 0 ? xb - 1 : xa + 1, zz[0] + 1, -s); iM++
      S(Math.floor((xa + xb) / 2), 5, zz[0] + 3, HLH)
    })
  })
  // boutiques des deux cotes du rez d'entree et etages : logements
  F(2, 1, 23, 12, 5, 23, HMPL); F(19, 1, 23, 29, 5, 23, HMPL)
  hmEsc(2, 23, 3); F(5, 1, 24, 5, 17, 28, HMPL); PORTE(5, 1, 26, HPO, 'east', 'left', 'false')
  ;[6, 12].forEach(y => {
    F(2, y, 23, 29, y, 28, 'minecraft:spruce_planks'); F(5, y + 1, 24, 5, y + 5, 28, HMPL); PORTE(5, y + 1, 26, HPO, 'east', 'left', 'false')
    piece(cadre(6, 24, 29, 28, 'south', y, 5), y == 6 ? 'salon' : 'salle', R() < 0.5 ? 1 : 0)
    F(2, y + 1, 22, 11, y + 5, 22, HMPL); F(20, y + 1, 22, 29, y + 5, 22, HMPL)
    piece(cadre(2, 2, 11, 21, 'east', y, 5), choix(['chambre', 'salon', 'bureau']), R() < 0.5 ? 1 : 0); piece(cadre(20, 2, 29, 21, 'west', y, 5), choix(['chambre', 'cuisine', 'salle']), R() < 0.5 ? 1 : 0)
  })
  piece(cadre(6, 24, 12, 28, 'south', 0, 5), 'salle', 0); piece(cadre(19, 24, 29, 28, 'south', 0, 5), 'salle', 1)
  F(2, 2, 29, 4, 4, 29, GP); F(7, 2, 29, 12, 4, 29, GP); F(19, 2, 29, 29, 4, 29, GP); PORTE(24, 1, 29, HMV, 'south', 'left', 'false')
  hbMansarde(1, 23, 30, 29, 18); hbMansarde(1, 1, 12, 22, 18); hbMansarde(19, 1, 30, 22, 18); hbCheminee(4, 25, 22, 2); hbCheminee(25, 25, 22, 2)
  hmSills(1, 30, 29, 1, 3)
  ;[[15, 8], [16, 17]].forEach(p => SA(p[0], 1, p[1], choix(['minecraft:white_carpet', 'supplementaries:book_pile'])))
}

// ================= ECOLE COMMUNALE (rangee sud : facade au nord, classes, preau, cour) =================
function hmEcole() {
  hmTrottoir(0, 1)
  var B = [[1, 2], [5, 6], [9, 10], [17, 18], [21, 22], [25, 26]]
  hmPlanchers(2, 2, 29, 15, 2); hmPignons(2, 29, 2, 15, 2); hmArr(2, 29, 15, 2, [[2, 4], [7, 9], [18, 20], [23, 25]])
  hmFac(2, 29, 2, -1, 2, B, [])
  B.forEach(p => F(2 + p[0], 2, 2, 2 + p[1], 4, 2, GP))
  F(15, 1, 2, 16, 4, 2, GP); PORTE(15, 1, 2, HPO, 'north', 'left', 'false'); PORTE(16, 1, 2, HPO, 'north', 'right', 'false'); F(14, 5, 1, 17, 5, 1, 'minecraft:smooth_sandstone_slab[type=bottom]')
  S(15, 8, 1, 'minecraft:blue_wall_banner[facing=north]'); S(16, 8, 1, 'minecraft:red_wall_banner[facing=north]')
  // hall et escalier
  hmEsc(14, 8, 2)
  ;[0, 6].forEach((y, n) => {
    F(13, y + 1, 3, 13, y + 5, 14, HMPL); F(18, y + 1, 3, 18, y + 5, 14, HMPL)
    PORTE(13, y + 1, 5, HPO, 'west', 'left', 'false'); PORTE(18, y + 1, 5, HPO, 'east', 'right', R() < 0.4 ? 'true' : 'false')
    // deux classes : tableau, estrade, pupitres en rangs face a l'ouest / a l'est
    ;[[3, 12, 1], [19, 28, -1]].forEach(c => {
      var xb = c[2] > 0 ? c[0] : c[1], f = c[2] > 0 ? 'west' : 'east'
      F(xb, y + 2, 6, xb, y + 3, 11, 'minecraft:black_concrete'); F(xb + c[2], y, 5, xb + c[2] * 2, y, 12, 'minecraft:dark_oak_planks')
      S(xb + c[2] * 2, y + 1, 8, 'mcwfurnitures:dark_oak_table'); S(xb + c[2] * 2, y + 2, 8, 'supplementaries:globe[facing=' + (c[2] > 0 ? 'east' : 'west') + ']')
      for (var k = 4; k <= 8; k += 2) for (var z = 4; z <= 13; z += 3) { var x = xb + c[2] * k; S(x, y + 1, z, 'mcwfurnitures:oak_table'); S(x + c[2], y + 1, z, MAT('oak_chair', f)); if (R() < 0.3) SA(x, y + 2, z, 'supplementaries:book_pile') }
      S(xb + c[2] * 9, y + 1, 4, 'minecraft:blast_furnace[facing=' + OPP[f] + ',lit=false]'); S(xb + c[2] * 5, y + 5, 9, HLH)
    })
  })
  hbMansarde(2, 2, 29, 15, 12); hbCheminee(8, 8, 16, 1); hbCheminee(24, 8, 16, 1)
  hmSills(2, 29, 2, -1, 2)
  // cour : preau, marelle, platane, fontaine
  for (var x = 1; x <= 30; x++) for (var z = 16; z <= 30; z++) S(x, -1, z, R() < 0.85 ? 'minecraft:gravel' : 'minecraft:coarse_dirt')
  PORTE(15, 1, 15, HPO, 'south', 'left', 'false')
  ;[3, 9, 15, 21, 28].forEach(x => F(x, 0, 24, x, 3, 24, 'minecraft:stripped_spruce_log[axis=y]'))
  F(2, 4, 24, 29, 4, 30, 'minecraft:spruce_slab[type=bottom]'); hbMur(2, 0, 30, 29, 3, 30, HMPL)
  ;[[6, 29], [18, 29], [25, 29]].forEach(p => gtBanc(p[0], p[1], 'north', 3))
  ;[[8, 18], [9, 18], [8, 19], [8, 20], [9, 20], [8, 21]].forEach(p => S(p[0], -1, p[1], 'minecraft:white_concrete'))
  hbPlatane(22, 19, 6); S(27, 0, 18, 'minecraft:stone_bricks'); S(27, 1, 18, 'minecraft:cauldron')
  hbMur(0, 0, 16, 0, 2, 31, HSB); hbMur(31, 0, 16, 31, 2, 31, HSB); hbMur(1, 0, 31, 30, 2, 31, HSB)
  ;[[5, 19], [13, 22], [24, 26]].forEach(p => SA(p[0], 0, p[1], choix(['minecraft:white_carpet', 'supplementaries:book_pile'])))
}

// ================= COMMISSARIAT (rangee sud, accueil, cellules, bureaux, cour des vehicules) =================
function hmCommissariat() {
  hmTrottoir(0, 1)
  var B = [[1, 2], [5, 6], [9, 10], [15, 16], [19, 20], [23, 24]]
  hmPlanchers(3, 2, 28, 17, 3); hmPignons(3, 28, 2, 17, 3); hmArr(3, 28, 17, 3, [[2, 3], [8, 9], [16, 17], [22, 23]])
  hmFac(3, 28, 2, -1, 3, B, [12])
  B.forEach(p => F(3 + p[0], 2, 2, 3 + p[1], 4, 2, GP))
  F(15, 1, 2, 16, 4, 2, GP); PORTE(15, 1, 2, HMV, 'north', 'left', 'false'); PORTE(16, 1, 2, HMV, 'north', 'right', 'false')
  S(14, 4, 1, 'minecraft:blue_wall_banner[facing=north]'); S(17, 4, 1, 'minecraft:blue_wall_banner[facing=north]')
  // accueil : banc, comptoir vitre
  for (var x = 4; x <= 27; x++) for (var z = 3; z <= 8; z++) S(x, 0, z, (x + z) % 2 ? 'minecraft:white_concrete' : 'minecraft:light_gray_concrete')
  F(4, 1, 9, 22, 1, 9, MAT('dark_oak_counter', 'north')); F(4, 2, 9, 22, 3, 9, 'minecraft:glass_pane'); S(13, 2, 9, AIR); F(4, 4, 9, 22, 5, 9, HMPL)
  for (var x = 5; x <= 12; x++) S(x, 1, 3, hbE('minecraft:spruce', 'north')); S(20, 1, 4, 'minecraft:potted_dead_bush'); hmLustre(10, 5, 6); hmLustre(20, 5, 6)
  // cellules a barreaux, couloir
  ;[[4, 7], [9, 12], [14, 17]].forEach(c => { F(c[1] + 1, 1, 12, c[1] + 1, 5, 16, HMPL); F(c[0], 1, 11, c[1], 4, 11, 'minecraft:iron_bars'); PORTE(c[0] + 1, 1, 11, 'minecraft:iron_door', 'north', 'left', R() < 0.4 ? 'true' : 'false'); S(c[1], 1, 16, hbE('minecraft:stone_brick', 'west')); S(c[0], 1, 16, 'minecraft:cauldron'); S(c[0] + 2, 5, 14, HLH) })
  F(4, 5, 11, 18, 5, 11, HMPL)
  // bureaux du rez
  F(19, 1, 10, 19, 5, 16, HMPL); PORTE(19, 1, 13, HPO, 'west', 'left', 'false'); piece(cadre(20, 10, 22, 16, 'south', 0, 5), 'bureau', 1)
  // escalier et etages : bureaux, archives
  hmEsc(24, 3, 3); F(23, 1, 3, 23, 17, 8, HMPL); PORTE(23, 1, 6, HPO, 'west', 'left', 'false'); F(24, 1, 9, 27, 5, 9, HMPL)
  ;[6, 12].forEach((y, n) => {
    PORTE(23, y + 1, 6, HPO, 'west', 'left', 'false'); F(4, y + 1, 10, 22, y + 5, 10, HMPL); PORTE(12, y + 1, 10, HPO, 'south', 'left', 'false')
    piece(cadre(4, 3, 22, 9, 'north', y, 5), 'bureau', n); F(24, y + 1, 9, 27, y + 5, 9, HMPL)
    if (n == 0) piece(cadre(4, 11, 27, 16, 'south', y, 5), 'salle', 1)
    else { for (var x = 5; x <= 25; x += 3) F(x, y + 1, 12, x, y + 3, 15, 'minecraft:chiseled_bookshelf[facing=east]'); hbBazar(4, 11, 27, 16, y + 1, 5) }
  })
  hbMansarde(3, 2, 28, 17, 18); hbCheminee(6, 9, 22, 2); hbCheminee(24, 12, 22, 1)
  hmSills(3, 28, 2, -1, 3)
  // cour des vehicules
  for (var x = 1; x <= 30; x++) for (var z = 18; z <= 30; z++) { var r = R(); S(x, -1, z, r < 0.7 ? 'minecraft:gray_concrete' : r < 0.9 ? 'minecraft:black_concrete' : 'minecraft:gravel') }
  PORTE(10, 1, 17, HPO, 'south', 'left', 'false'); bgVoiture(6, 22, 'x', 'blue', 1); bgVoiture(14, 23, 'x', 'white', 0); bgVoiture(22, 21, 'z', 'blue', 2)
  ;[[4, 28], [5, 28], [27, 27]].forEach(p => S(p[0], 0, p[1], 'minecraft:barrel[facing=up,open=false]')); F(12, 0, 28, 18, 0, 28, 'minecraft:yellow_concrete')
  hbMur(0, 0, 18, 0, 2, 31, HSB); hbMur(31, 0, 18, 31, 2, 31, HSB); hbMur(1, 0, 31, 30, 2, 31, HSB); F(1, 3, 31, 30, 3, 31, 'minecraft:iron_bars')
}

// ================= MUSEE (rangee sud : portique a fronton, grande galerie sous verriere, squelette, mezzanine) =================
function hmMusee() {
  hmTrottoir(0, 1)
  hmPignons(2, 29, 2, 25, 2); hmArr(2, 29, 25, 2, [[4, 5], [12, 15], [22, 23]])
  for (var x = 2; x <= 29; x++) for (var y = 0; y <= 11; y++) S(x, y, 2, y % 4 == 0 ? HC : hbM(HS))
  F(3, 0, 3, 28, 0, 24, 'minecraft:polished_andesite'); for (var x = 4; x <= 27; x++) for (var z = 4; z <= 23; z++) if ((x + z) % 3 == 0) S(x, 0, z, 'minecraft:smooth_quartz')
  F(2, 12, 2, 29, 12, 25, 'minecraft:smooth_stone_slab[type=bottom]'); F(1, 11, 1, 8, 11, 1, hbE('minecraft:smooth_sandstone', 'south', 'top')); F(23, 11, 1, 30, 11, 1, hbE('minecraft:smooth_sandstone', 'south', 'top'))
  // portique : marches, colonnes, entablement, fronton
  F(9, 0, 0, 22, 0, 1, 'minecraft:smooth_quartz_slab[type=bottom]')
  ;[10, 13, 18, 21].forEach(x => { F(x, 1, 0, x, 8, 0, 'minecraft:quartz_pillar[axis=y]'); S(x, 9, 0, 'minecraft:chiseled_quartz_block') })
  F(9, 10, 0, 22, 10, 1, 'minecraft:smooth_quartz')
  for (var k = 0; k <= 6; k++) { F(9 + k, 11 + k, 1, 22 - k, 11 + k, 2, 'minecraft:smooth_quartz'); S(9 + k, 11 + k, 0, 'minecraft:quartz_stairs[facing=east,half=bottom,shape=straight]'); S(22 - k, 11 + k, 0, 'minecraft:quartz_stairs[facing=west,half=bottom,shape=straight]') }
  F(14, 1, 2, 17, 6, 2, AIR); PORTE(15, 1, 2, HPO, 'north', 'left', 'true'); PORTE(16, 1, 2, HPO, 'north', 'right', 'false'); F(14, 3, 2, 17, 6, 2, GP); F(14, 1, 2, 14, 2, 2, HS); F(17, 1, 2, 17, 2, 2, HS)
  // toit : corniche, verriere centrale
  for (var x = 7; x <= 24; x++) for (var z = 6; z <= 21; z++) S(x, 12, z, (x % 6 == 1 || z % 5 == 1) ? 'minecraft:iron_block' : 'minecraft:glass')
  // mezzanine sur trois cotes, garde-corps, escalier
  F(3, 6, 18, 28, 6, 24, 'minecraft:spruce_planks'); F(3, 6, 3, 6, 6, 17, 'minecraft:spruce_planks'); F(25, 6, 3, 28, 6, 17, 'minecraft:spruce_planks')
  F(6, 7, 3, 6, 7, 17, 'minecraft:iron_bars[east=false,north=true,south=true,waterlogged=false,west=false]'); F(25, 7, 3, 25, 7, 17, 'minecraft:iron_bars[east=false,north=true,south=true,waterlogged=false,west=false]'); F(7, 7, 18, 24, 7, 18, HF)
  for (var i = 0; i < 6; i++) S(4, 1 + i, 9 + i, hbE('minecraft:spruce', 'south')); F(4, 6, 9, 4, 6, 14, AIR); S(4, 6, 15, hbE('minecraft:spruce', 'south'))
  ;[[6, 17], [25, 17], [6, 4], [25, 4], [11, 18], [20, 18]].forEach(p => F(p[0], 1, p[1], p[0], 5, p[1], 'minecraft:quartz_pillar[axis=y]'))
  // squelette au centre : colonne vertebrale, cotes, crane
  for (var z = 8; z <= 16; z++) S(15, 4, z, 'minecraft:bone_block[axis=z]'); F(15, 1, 10, 15, 3, 10, 'minecraft:bone_block[axis=y]'); F(15, 1, 14, 15, 3, 14, 'minecraft:bone_block[axis=y]')
  for (var z = 10; z <= 14; z += 2) { S(14, 3, z, 'minecraft:bone_block[axis=x]'); S(16, 3, z, 'minecraft:bone_block[axis=x]') }
  for (var k = 0; k < 3; k++) S(15, 5 + k, 7 - k, 'minecraft:bone_block[axis=y]'); S(15, 8, 4, 'minecraft:skeleton_skull[rotation=8]'); S(15, 8, 5, 'minecraft:bone_block[axis=z]')
  F(13, 0, 9, 17, 0, 15, 'minecraft:polished_deepslate'); F(12, 1, 8, 18, 1, 8, 'minecraft:chain[axis=x]'); F(12, 1, 16, 18, 1, 16, 'minecraft:chain[axis=x]')
  // vitrines et socles
  ;[[9, 6], [21, 6], [9, 20], [21, 20], [11, 13], [19, 13]].forEach((p, i) => { S(p[0], 1, p[1], 'minecraft:chiseled_quartz_block'); S(p[0], 2, p[1], ['minecraft:decorated_pot', 'minecraft:amethyst_cluster[facing=up,waterlogged=false]', 'supplementaries:globe[facing=north]', 'minecraft:skeleton_skull[rotation=4]', 'minecraft:decorated_pot', 'minecraft:bell[attachment=floor,facing=north,powered=false]'][i]) })
  ;[5, 8, 11].forEach(z => { S(27, 1, z + 3, 'minecraft:glass'); S(27, 0, z + 3, 'minecraft:chiseled_quartz_block') })
  for (var x = 8; x <= 23; x += 3) { S(x, 7, 22, 'minecraft:chiseled_quartz_block'); SA(x, 8, 22, choix(['minecraft:decorated_pot', 'minecraft:flower_pot', 'supplementaries:book_pile'])) }
  hmLustre(10, 11, 12); hmLustre(21, 11, 12)
  // jardin des sculptures derriere
  hbSol(1, 26, 30, 30); PORTE(15, 1, 25, HPO, 'south', 'left', 'false')
  ;[[6, 28], [15, 28], [24, 28]].forEach(p => { S(p[0], 0, p[1], 'minecraft:chiseled_stone_bricks'); S(p[0], 1, p[1], 'minecraft:stone_brick_wall'); S(p[0], 2, p[1], 'minecraft:zombie_head[rotation=0]'); hbLibre(p[0], p[1]) })
  hbMur(0, 0, 26, 0, 1, 31, HSB); hbMur(31, 0, 26, 31, 1, 31, HSB); hbMur(1, 0, 31, 30, 1, 31, HSB); hbVeg(1, 26, 30, 30, 0.7)
  hbSol(0, 2, 1, 25); hbSol(30, 2, 31, 25); hbVeg(0, 2, 1, 25, 0.6); hbVeg(30, 2, 31, 25, 0.6)
}

// ================= HOTEL DES VENTES (rangee sud : tour de l'horloge, salle des encheres, estrade du commissaire-priseur, toit a deux pans) =================
function hmSalleVentes() {
  hmTrottoir(0, 1); hbSol(0, 2, 6, 31); hbSol(25, 2, 31, 31); hbSol(7, 28, 24, 31)
  // nef x7..24 z3..27, murs de 14
  hbMur(7, 0, 3, 7, 13, 27, HS); hbMur(24, 0, 3, 24, 13, 27, HS); hbMur(7, 0, 27, 24, 13, 27, HS); hbMur(7, 0, 3, 24, 13, 3, HS)
  F(8, 0, 4, 23, 0, 26, 'minecraft:polished_andesite'); for (var z = 4; z <= 26; z += 2) { S(15, 0, z, 'minecraft:polished_diorite'); S(16, 0, z, 'minecraft:polished_diorite') }
  for (var z = 6; z <= 24; z += 4) { var vz = choix(['minecraft:glass_pane', 'minecraft:glass_pane', 'minecraft:light_gray_stained_glass_pane']); F(7, 3, z, 7, 9, z + 1, vz); F(24, 3, z, 24, 9, z + 1, vz) }
  for (var z = 3; z <= 27; z += 4) { F(6, 0, z, 6, 10, z, HC); F(25, 0, z, 25, 10, z, HC) }
  // toit : deux pans d'ardoise, pignon arriere
  for (var k = 0; k <= 9; k++) {
    F(6 + k, 14 + k, 2, 6 + k, 14 + k, 28, hbE(HZ, 'east')); F(25 - k, 14 + k, 2, 25 - k, 14 + k, 28, hbE(HZ, 'west'))
    if (7 + k <= 24 - k) { F(7 + k, 14 + k, 27, 24 - k, 14 + k, 27, HS); F(7 + k, 14 + k, 3, 24 - k, 14 + k, 3, HS) }
  }
  // rangees de chaises face a l'estrade
  for (var z = 7; z <= 19; z += 2) for (var x = 9; x <= 22; x++) { if (x >= 14 && x <= 17) continue; if (R() < 0.12) continue; S(x, 1, z, 'handcrafted:oak_chair[color=red,facing=south,waterlogged=false]') }
  // estrade : pupitre du commissaire-priseur, lots a vendre, oculus clair au pignon
  F(8, 1, 22, 23, 1, 26, 'minecraft:smooth_quartz'); F(8, 1, 22, 23, 1, 22, 'minecraft:quartz_stairs[facing=north,half=bottom,shape=straight]')
  ;[10, 13, 18, 21].forEach(x => S(x, 2, 25, choix(['minecraft:chest[facing=north]', 'minecraft:barrel[facing=up,open=false]', 'minecraft:decorated_pot', 'supplementaries:globe[facing=north]']))); S(15, 2, 23, 'minecraft:lectern[facing=north,has_book=false,powered=false]'); S(16, 2, 24, 'handcrafted:oak_chair[color=none,facing=north,waterlogged=false]'); ;[12, 19].forEach(x => S(x, 2, 24, 'mcwfurnitures:oak_table'))
  for (var x = 13; x <= 18; x++) for (var y = 14; y <= 19; y++) { var dx = x - 15.5, dy = y - 16.5; if (dx * dx + dy * dy <= 7) S(x, y, 27, 'minecraft:glass_pane') }
  F(9, 4, 26, 22, 9, 26, 'minecraft:dark_oak_planks'); F(9, 10, 26, 22, 10, 26, 'minecraft:dark_oak_slab[type=bottom]')
  ;[[11, 12], [20, 12], [15, 16]].forEach(p => { S(p[0], 13, p[1], 'minecraft:chain[axis=y]'); S(p[0], 12, p[1], 'mcwlights:iron_chandelier') })
  // tour de l'horloge x12..19 z0..7 (avance sur le trottoir), pavillon de cuivre et mat
  W(12, 2, 19, 7, 0, 25, HS); F(13, 1, 3, 18, 25, 6, AIR); F(14, 1, 2, 17, 6, 2, AIR); F(14, 1, 7, 17, 6, 7, AIR)
  F(14, 7, 2, 17, 7, 2, 'chipped:engraved_sandstone'); PORTE(15, 1, 2, HPO, 'north', 'left', 'true'); PORTE(16, 1, 2, HPO, 'north', 'right', 'false')
  F(13, 0, 3, 18, 0, 6, 'minecraft:polished_andesite'); F(13, 12, 3, 18, 12, 6, 'minecraft:spruce_planks'); S(13, 12, 3, AIR)
  ;[2, 7].forEach(z => F(15, 18, z, 16, 21, z, AIR)); ;[12, 19].forEach(x => F(x, 18, 4, x, 21, 5, AIR))
  F(13, 22, 3, 18, 22, 6, HS); S(15, 21, 4, 'minecraft:lantern[hanging=true]')
  F(15, 14, 1, 16, 15, 1, 'minecraft:white_concrete'); S(15, 15, 0, 'minecraft:black_concrete'); S(16, 14, 0, 'minecraft:black_concrete')
  for (var k = 0; k <= 3; k++) F(12 + k, 26 + k, 2 + k, 19 - k, 26 + k, 7 - k, 'minecraft:oxidized_cut_copper')
  F(15, 30, 4, 16, 31, 5, 'minecraft:oxidized_cut_copper'); F(15, 32, 4, 15, 34, 4, 'minecraft:iron_bars')
  F(13, 1, 3, 13, 11, 3, 'minecraft:ladder[facing=east,waterlogged=false]')
  // parvis et abords
  hbPlatane(3, 10, 6); hbPlatane(28, 18, 6); hbPlatane(3, 24, 5); gtBanc(4, 16, 'east', 3); gtBanc(27, 8, 'west', 3)
  ;[[27, 26], [28, 26], [29, 27]].forEach(p => { S(p[0], 0, p[1], 'minecraft:mossy_stone_bricks'); S(p[0], 1, p[1], 'minecraft:stone_brick_wall'); hbLibre(p[0], p[1]) })
  hbMur(0, 0, 31, 31, 1, 31, HSB); hbVeg(0, 2, 31, 31, 0.7)
}

// ================= BRASSERIE D'ANGLE (rangee sud, R+4, veranda sur trottoir, zinc, banquettes, logements) =================
function hmBrasserie() {
  hmTrottoir(0, 1)
  var B = [[1, 2], [5, 6], [9, 10], [14, 15], [19, 20], [23, 24], [27, 28]]
  hmPlanchers(1, 2, 30, 16, 5); hmPignons(1, 30, 2, 16, 5); hmArr(1, 30, 16, 5, [[3, 4], [9, 10], [19, 20], [25, 26]])
  hmFac(1, 30, 2, -1, 5, B, [12, 24])
  F(2, 1, 2, 29, 4, 2, GP); F(2, 5, 2, 29, 5, 2, 'minecraft:dark_oak_planks'); ;[1, 8, 15, 22, 30].forEach(x => F(x, 1, 2, x, 5, 2, 'minecraft:dark_oak_planks'))
  PORTE(11, 1, 2, HMV, 'north', 'left', 'true'); PORTE(26, 1, 2, HMV, 'north', 'left', 'false')
  // veranda sur le trottoir
  F(2, 0, 0, 22, 0, 1, 'minecraft:dark_oak_planks'); F(2, 1, 0, 22, 3, 0, GP); F(2, 1, 1, 2, 3, 1, GP); F(22, 1, 1, 22, 3, 1, GP); F(11, 1, 0, 11, 2, 0, AIR)
  ;[2, 7, 12, 17, 22].forEach(x => F(x, 1, 0, x, 3, 0, 'minecraft:dark_oak_planks')); F(2, 4, 0, 22, 4, 1, 'minecraft:red_terracotta'); F(1, 5, 0, 23, 5, 1, 'minecraft:dark_oak_slab[type=bottom]')
  ;[[5, 1], [15, 1], [19, 1]].forEach(t => { S(t[0], 1, t[1], 'mcwfurnitures:oak_table'); S(t[0] - 1, 1, t[1], MAT('oak_chair', 'east')) })
  // salle : zinc, banquettes, miroirs, lustres
  for (var x = 2; x <= 29; x++) for (var z = 3; z <= 15; z++) S(x, 0, z, (x + z) % 2 ? 'minecraft:white_concrete' : 'minecraft:black_concrete')
  F(4, 1, 12, 14, 1, 12, 'minecraft:iron_block'); F(4, 2, 12, 14, 2, 12, 'minecraft:smooth_stone_slab[type=bottom]'); S(10, 3, 12, 'minecraft:brewing_stand'); S(6, 3, 12, 'supplementaries:jar')
  F(4, 1, 15, 14, 1, 15, MAT('dark_oak_drawer', 'north')); F(4, 2, 15, 14, 4, 15, 'minecraft:glass'); for (var x = 5; x <= 14; x += 3) SA(x, 2, 14, 'createfood:apple_juice_bottle_block')
  for (var x = 21; x <= 29; x++) S(x, 1, 15, 'mcwfurnitures:red_couch[facing=north]')
  ;[[23, 13], [27, 13], [19, 6], [24, 6], [28, 6], [6, 6], [11, 6]].forEach(t => { S(t[0], 1, t[1], 'mcwfurnitures:dark_oak_table'); S(t[0], 1, t[1] - 1, MAT('dark_oak_chair', 'south')); if (R() < 0.6) SA(t[0], 2, t[1], choix(VAISS).replace('{I}', 'north')) })
  ;[[8, 8], [17, 8], [24, 9]].forEach(p => hmLustre(p[0], 5, p[1]))
  // escalier et logements
  hmEsc(17, 10, 5); F(16, 1, 10, 16, 29, 15, HMPL); F(20, 1, 10, 20, 29, 15, HMPL); F(17, 1, 9, 19, 5, 9, HMPL); PORTE(18, 1, 9, HPO, 'north', 'left', 'false')
  ;[6, 12, 18, 24].forEach((y, n) => {
    F(2, y + 1, 9, 29, y + 5, 9, HMPL); PORTE(18, y + 1, 9, HPO, 'north', 'left', 'false')
    PORTE(10, y + 1, 9, HPO, 'south', 'left', 'false'); PORTE(25, y + 1, 9, HPO, 'south', 'left', R() < 0.3 ? 'true' : 'false')
    piece(cadre(2, 3, 15, 8, 'north', y, 5), choix(['salon', 'salle']), R() < 0.5 ? 1 : 0); piece(cadre(17, 3, 29, 8, 'north', y, 5), choix(['salon', 'chambre']), R() < 0.5 ? 1 : 0)
    piece(cadre(2, 10, 15, 15, 'south', y, 5), choix(['chambre', 'cuisine']), R() < 0.5 ? 1 : 0); piece(cadre(21, 10, 29, 15, 'south', y, 5), choix(['chambre', 'sdb', 'cuisine']), R() < 0.5 ? 1 : 0)
  })
  hbMansarde(1, 2, 30, 16, 30); hbCheminee(5, 9, 34, 2); hbCheminee(25, 9, 34, 2)
  hmSills(1, 30, 2, -1, 5)
  // cour arriere : cuisine, caisses, poubelles, terrasse du personnel
  for (var x = 1; x <= 30; x++) for (var z = 17; z <= 30; z++) S(x, -1, z, R() < 0.75 ? 'minecraft:cobblestone' : 'minecraft:stone_bricks')
  PORTE(6, 1, 16, HPO, 'south', 'left', 'false')
  ;[[3, 18], [4, 18], [3, 19], [10, 18]].forEach(p => S(p[0], 0, p[1], 'minecraft:barrel[facing=up,open=false]')); F(13, 0, 18, 14, 0, 18, 'minecraft:green_terracotta'); F(13, 1, 18, 14, 1, 18, 'minecraft:iron_trapdoor[facing=south,half=bottom,open=false,powered=false,waterlogged=false]')
  ;[[22, 24], [26, 26]].forEach(t => { S(t[0], 0, t[1], 'mcwfurnitures:oak_table'); S(t[0] + 1, 0, t[1], MAT('oak_chair', 'west')) }); hbPlatane(8, 25, 6)
  hbMur(0, 0, 17, 0, 2, 31, HSB); hbMur(31, 0, 17, 31, 2, 31, HSB); hbMur(1, 0, 31, 30, 2, 31, HSB)
}

var QFIN_MH2 = function () {
  HB2 = true; FIN = true; THM = THM_HF
  var vh = 'mcwwindows:iron_shutter', rh = ['white', 'light_gray', 'red']
  OX = VB.X0; OY = VB.Y0; OZ = VB.Z0; CUT = 999; GRAINE = 2401; HM = {}; hbRue(); finAncrage()
  lot(QF(hmMairie, vh, rh), 0, 0, 999, 2411, 32, 30); lot(QF(hmPoste, vh, rh), 32, 0, 999, 2421, 32, 32); lot(QF(hmHotel, vh, rh), 64, 0, 999, 2431, 32, 44); lot(QF(hmPassage, vh, rh), 96, 0, 999, 2441, 32, 24)
  lot(QF(hmEcole, vh, ['white']), 0, 48, 999, 2451, 32, 18); lot(QF(hmCommissariat, vh, rh), 32, 48, 999, 2461, 32, 24); lot(QF(hmMusee, null, null), 64, 48, 999, 2471, 32, 20); lot(QF(hmSalleVentes, null, null), 96, 48, 999, 2481, 32, 36)
  lot(QF(hmBrasserie, vh, rh), 128, 48, 999, 2491, 32, 36)
  vlog('FIN volets ' + FIN_NV + ' rideaux ' + FIN_NR + ' paves ' + PAVE_NB + ' retraits ancrage ' + ANC_NB)
  HB2 = false; FIN = false; THM = null; HM = {}
}
function vuesMamoudzouH() {
  vue('mh_ensemble_sud', 0, 0, 80, 46, 120, 72, 8, 36, 3000)
  vue('mh_mairie', 0, 0, 16, 10, 44, 16, 10, 22)
  vue('mh_mairie_mariages', 0, 0, 9, 8.5, 27, 6, 7.5, 17)
  vue('mh_poste', 32, 0, 16, 10, 44, 16, 10, 22)
  vue('mh_poste_guichets', 32, 0, 16, 2.5, 27, 16, 2, 15)
  vue('mh_hotel', 64, 0, 16, 14, 46, 16, 16, 22)
  vue('mh_hotel_hall', 64, 0, 27, 2.5, 27, 10, 2, 19)
  vue('mh_passage', 96, 0, 16, 8, 44, 16, 5, 22)
  vue('mh_passage_galerie', 96, 0, 15.5, 2.5, 27, 15.5, 3, 6)
  vue('mh_ecole', 0, 48, 16, 9, -12, 16, 6, 8)
  vue('mh_ecole_classe', 0, 48, 11, 2.5, 13, 3, 2, 6)
  vue('mh_commissariat', 32, 48, 16, 10, -12, 16, 8, 8)
  vue('mh_musee', 64, 48, 16, 9, -12, 16, 8, 8)
  vue('mh_musee_galerie', 64, 48, 24, 9, 20, 15, 2, 11)
  vue('mh_salle_ventes', 96, 48, 16, 14, -14, 16, 14, 10)
  vue('mh_salle_ventes_salle', 96, 48, 15.5, 5, 9, 15.5, 3, 25)
  vue('mh_brasserie', 128, 48, 16, 10, -12, 16, 8, 8)
  vue('mh_brasserie_salle', 128, 48, 24, 3, 7, 6, 2, 12)
}
