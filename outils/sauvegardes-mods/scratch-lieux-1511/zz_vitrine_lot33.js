
// ================= QUARTIER BETON (grands ensembles 1960-1975) : tour, centre commercial, parking silo, college, piscine, salle des fetes, square =================
var BTM = 'minecraft:light_gray_concrete', BTB = 'minecraft:white_concrete', BTG = 'minecraft:gray_concrete', BTS = 'minecraft:smooth_stone', BTA = 'minecraft:polished_andesite'
var BTP = ['minecraft:orange_terracotta', 'minecraft:yellow_terracotta', 'minecraft:light_blue_terracotta', 'minecraft:lime_terracotta', 'minecraft:red_terracotta']
function btSt(m, f, h) { return 'minecraft:' + m + '_stairs[facing=' + f + ',half=' + (h || 'bottom') + ',shape=straight]' }
function btSol(x1, z1, x2, z2) { for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) { var r = R(); S(x, -1, z, r < 0.7 ? 'minecraft:grass_block' : r < 0.85 ? 'minecraft:coarse_dirt' : r < 0.93 ? 'minecraft:podzol' : 'minecraft:gravel'); if (r < 0.25) SA(x, 0, z, 'minecraft:short_grass'); } }
function btDalle(x1, z1, x2, z2) { for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) { var r = R(); if (/grass|fern|bush/.test(HM[hk(x, 0, z)] || '')) S(x, 0, z, AIR); S(x, -1, z, r < 0.7 ? 'mcwpaths:stone_flagstone' : 'mcwpaths:andesite_flagstone') } }
function btArbre(x, z, h) {
  F(x, 0, z, x, h, z, 'minecraft:oak_log[axis=y]'); S(x, -1, z, 'minecraft:rooted_dirt')
  for (var a = -2; a <= 2; a++) for (var b = -2; b <= 2; b++) for (var y = h - 1; y <= h + 1; y++) { var d = a * a + b * b + (y - h) * (y - h) * 2; if (d <= 6 && !(d >= 5 && R() < 0.4)) SA(x + a, y, z + b, R() < 0.8 ? 'minecraft:oak_leaves[persistent=true]' : 'minecraft:azalea_leaves[persistent=true]') }
}
function btLampe(x, z, f) { var id = 'mcwlights:double_street_lamp'; S(x, 0, z, id + '[facing=' + f + ',part=bottom,lit=false]'); for (var y = 1; y <= 3; y++) S(x, y, z, id + '[facing=' + f + ',part=middle,lit=false]'); S(x, 4, z, id + '[facing=' + f + ',part=top,lit=false]') }
function btVoitureY(dy, x, z, ax, c, etat) { OY += dy; bgVoiture(x, z, ax, c, etat); OY -= dy }

// ---- avenue : chaussee 2 x 2 voies, couloir de bus, terre-plein a glissieres, trottoirs en dalles ----
function btRue() {
  OX = VB.X0; OY = VB.Y0; OZ = VB.Z0; CUT = 999; GRAINE = 515
  for (var x = -16; x <= 143; x++) for (var z = 32; z <= 47; z++) {
    var r = R(), b
    if (z <= 33 || z >= 46) b = r < 0.7 ? 'mcwpaths:stone_flagstone' : 'mcwpaths:andesite_flagstone'
    else if (z == 34 || z == 45) b = BTA
    else if (z == 39 || z == 40) b = BTS
    else if (z == 35 || z == 36) b = r < 0.75 ? 'minecraft:red_terracotta' : r < 0.9 ? 'minecraft:black_concrete' : 'minecraft:gravel'
    else b = r < 0.72 ? 'minecraft:black_concrete' : r < 0.88 ? BTG : r < 0.95 ? 'minecraft:gray_concrete_powder' : 'minecraft:coarse_dirt'
    S(x, -1, z, b); if (b == 'minecraft:coarse_dirt' && R() < 0.4) SA(x, 0, z, 'minecraft:short_grass')
  }
  for (var x = -16; x <= 143; x++) {
    if (((x % 6) + 6) % 6 < 3) { S(x, -1, 37, 'minecraft:white_concrete'); S(x, -1, 42, 'minecraft:white_concrete') }
    S(x, -1, 36, x % 8 == 0 ? 'minecraft:white_concrete' : 'minecraft:red_terracotta')
    // glissieres beton (separateur) avec breches
    if (!(x >= 58 && x <= 63) && !(x >= 100 && x <= 103)) { S(x, 0, 39, 'minecraft:smooth_stone_slab[type=bottom]'); S(x, 0, 40, 'minecraft:smooth_stone_slab[type=bottom]') }
  }
  for (var x = 58; x <= 63; x++) for (var z = 35; z <= 44; z++) if (z != 39 && z != 40 && x % 2 == 0) S(x, -1, z, 'mcwpaths:diorite_square_paving')
  // lampadaires doubles sur le terre-plein, simples sur les trottoirs
  for (var x = 4; x <= 124; x += 24) if (!(x >= 58 && x <= 63)) { S(x, 0, 39, AIR); btLampe(x, 39, 'north') }
  for (var x = 12; x <= 124; x += 24) { btLampe(x, 33, 'east'); btLampe(x + 6, 46, 'east') }
  // abribus (trottoir nord) et bus calcine en travers
  F(20, 0, 33, 26, 0, 33, BTS); F(20, 1, 32, 20, 3, 32, 'minecraft:iron_bars'); F(26, 1, 32, 26, 3, 32, 'minecraft:iron_bars'); F(21, 1, 32, 25, 3, 32, 'minecraft:light_gray_stained_glass_pane'); S(23, 2, 32, AIR)
  F(19, 4, 32, 27, 4, 34, 'minecraft:smooth_stone_slab[type=bottom]'); F(21, 1, 33, 25, 1, 33, btSt('smooth_quartz', 'north'))
  S(22, 1, 34, 'supplementaries:notice_board[facing=south,has_book=false]')
  for (var u = 0; u <= 10; u++) for (var v = 0; v <= 2; v++) {
    var x = 40 + u, z = 35 + v + (u > 6 ? 1 : 0)
    S(x, 0, z, u == 0 || u == 10 ? 'minecraft:black_concrete' : 'minecraft:gray_concrete'); S(x, 1, z, u == 0 || u == 10 || v != 1 ? (R() < 0.3 ? 'minecraft:coal_block' : 'minecraft:tinted_glass') : AIR)
    S(x, 2, z, R() < 0.3 ? AIR : 'minecraft:black_concrete'); if (v == 1 && u > 1 && u < 9 && u % 2 == 0) S(x, 1, z, 'minecraft:cobweb')
  }
  // voitures abandonnees, barricade de sacs et barbeles
  bgVoiture(4, 41, 'x', 'white', 1); bgVoiture(70, 36, 'x', 'red', 0); bgVoiture(86, 42, 'x', 'blue', 2); bgVoiture(112, 41, 'x', 'green', 1); bgVoiture(-10, 36, 'x', 'gray', 2)
  for (var z = 41; z <= 44; z++) { S(96, 0, z, 'supplementaries:sack'); S(96, 1, z, z % 2 ? 'supplementaries:sack' : AIR); S(98, 0, z, 'simply_traps:circular_barbed_wire_iron[facing=east]') }
}

// ================= TOUR R+10 (4 logements par palier, cage d'escalier centrale) =================
function btQ(q) {
  var sx = (q == 1 || q == 3) ? -1 : 1, sz = q >= 2 ? -1 : 1
  var Q = { X: i => sx > 0 ? 4 + i : 27 - i, Z: j => sz > 0 ? 4 + j : 27 - j, A: sz > 0 ? 'north' : 'south', B: sx > 0 ? 'west' : 'east' }
  Q.r = (i1, j1, i2, j2) => [Math.min(Q.X(i1), Q.X(i2)), Math.min(Q.Z(j1), Q.Z(j2)), Math.max(Q.X(i1), Q.X(i2)), Math.max(Q.Z(j1), Q.Z(j2))]
  Q.S = (i, y, j, b) => S(Q.X(i), y, Q.Z(j), b)
  Q.F = (i1, y1, j1, i2, y2, j2, b) => { var r = Q.r(i1, j1, i2, j2); F(r[0], y1, r[1], r[2], y2, r[3], b) }
  Q.cadre = (i1, j1, i2, j2, fac, y) => { var r = Q.r(i1, j1, i2, j2); return cadre(r[0], r[1], r[2], r[3], fac, y, 5) }
  return Q
}
function btAppart(q, y, etat) {
  var Q = btQ(q), PL = 'minecraft:white_concrete', pan = BTP[q % BTP.length]
  // cloisons : j6 (sejour | nuit), i7 (sejour | cuisine), i5 (chambre | entree)
  Q.F(1, y + 1, 6, 10, y + 5, 6, PL); Q.F(7, y + 1, 1, 7, y + 5, 5, PL); Q.F(5, y + 1, 7, 5, y + 5, 10, PL)
  ;[[6, 6], [9, 6], [5, 8]].forEach(p => { Q.S(p[0], y + 1, p[1], AIR); Q.S(p[0], y + 2, p[1], AIR) })
  Q.S(9, y + 1, 9, AIR); Q.S(9, y + 2, 9, AIR) // porte palière (mur de la cage)
  // fenetres : sejour (deux baies), cuisine, chambre
  ;[[2, 3], [5, 6]].forEach(w => Q.F(w[0], y + 2, 0, w[1], y + 3, 0, GP)); Q.F(9, y + 2, 0, 9, y + 3, 0, GP); Q.F(0, y + 2, 8, 0, y + 3, 9, GP)
  // allege coloree sous les baies du sejour
  Q.F(1, y + 1, 0, 6, y + 1, 0, pan)
  // loggia : dalle, garde-corps, separations
  Q.F(1, y, -1, 6, y, -2, BTS); Q.F(1, y + 1, -2, 6, y + 1, -2, 'minecraft:iron_bars'); Q.F(0, y + 1, -1, 0, y + 3, -2, BTM); Q.F(7, y + 1, -1, 7, y + 3, -2, BTM)
  if (R() < 0.6) Q.S(2, y + 1, -1, choix(['minecraft:potted_dead_bush', 'handcrafted:terracotta_wide_pot', 'minecraft:flower_pot', 'handcrafted:white_glazed_thin_pot']))
  if (R() < 0.5) Q.S(5, y + 1, -1, 'handcrafted:oak_chair[color=none,facing=' + Q.A + ',waterlogged=false]')
  // pieces
  piece(Q.cadre(1, 1, 6, 5, Q.A, y), R() < 0.6 ? 'salon' : 'salle', etat)
  piece(Q.cadre(8, 1, 10, 5, Q.A, y), 'cuisine', etat)
  piece(Q.cadre(1, 7, 4, 10, Q.B, y), 'chambre', etat)
  // entree : porte-manteau, meuble a chaussures
  Q.S(6, y + 1, 9, 'handcrafted:oak_drawer[facing=' + OPP[Q.B] + ',shape=single,type=1]'); if (etat) Q.S(7, y + 1, 8, choix(['supplementaries:sack', 'minecraft:white_carpet', 'supplementaries:book_pile_horizontal']))
  Q.S(6, y + 5, 8, 'minecraft:lantern[hanging=true]')
}
function btTour() {
  var NIV = 11, Y = k => 6 * k
  btSol(0, 0, 31, 31); btDalle(13, 28, 18, 31); btDalle(2, 2, 29, 3); btDalle(2, 28, 29, 29)
  for (var k = 0; k <= NIV; k++) { var y = Y(k); F(4, y, 4, 27, y, 27, BTS); W(4, 4, 27, 27, y, y, BTB) }
  for (var k = 0; k < NIV; k++) {
    var y = Y(k)
    W(4, 4, 27, 27, y + 1, y + 5, BTM)
    // cage d'escalier
    W(12, 13, 19, 18, y + 1, y + 5, BTA); F(13, y + 1, 14, 18, y + 5, 17, AIR)
    // murs mitoyens
    F(15, y + 1, 5, 16, y + 5, 12, BTB); F(15, y + 1, 19, 16, y + 5, 26, BTB); F(5, y + 1, 15, 11, y + 5, 16, BTB); F(20, y + 1, 15, 26, y + 5, 16, BTB)
    // pilastres d'angle et refends
    ;[4, 27].forEach(x => [4, 27].forEach(z => F(x, y + 1, z, x, y + 5, z, BTB)))
    var nb = k == 0 ? [0, 1] : [0, 1, 2, 3]
    nb.forEach(q => btAppart(q, y, (k * 7 + q * 3) % 5 < 2 ? 1 : 0))
    if (k == 0) btHall()
  }
  // volees : montee est (z15), palier (x17), montee ouest (z16) ; tremie au-dessus de la seconde volee
  for (var k = 0; k < NIV; k++) {
    var y = Y(k)
    S(14, y + 1, 15, btSt('polished_andesite', 'east')); S(15, y + 2, 15, btSt('polished_andesite', 'east')); S(16, y + 3, 15, btSt('polished_andesite', 'east'))
    F(17, y + 3, 15, 17, y + 3, 16, BTA)
    S(15, y + 6, 16, AIR); S(16, y + 6, 16, AIR)
    S(15, y + 1, 15, BTA); S(16, y + 2, 15, BTA); S(16, y + 3, 16, BTA); S(15, y + 4, 16, BTA); S(14, y + 5, 16, BTA)
    S(16, y + 4, 16, btSt('polished_andesite', 'west')); S(15, y + 5, 16, btSt('polished_andesite', 'west')); S(14, y + 6, 16, btSt('polished_andesite', 'west'))
    S(13, y + 5, 14, 'minecraft:lantern[hanging=true]'); if (k % 3 == 1) S(18, y + 1, 17, 'minecraft:cobweb')
  }
  // toit terrasse : acrotere, local machinerie, antennes, gaines
  var yt = Y(NIV)
  W(4, 4, 27, 27, yt + 1, yt + 1, BTM); W(12, 13, 19, 18, yt + 1, yt + 4, BTA); F(13, yt + 1, 14, 18, yt + 4, 17, AIR); F(12, yt + 5, 13, 19, yt + 5, 18, BTS)
  PORTE(12, yt + 1, 15, 'minecraft:iron_door', 'west', 'left', 'true')
  ;[[7, 7], [24, 8], [8, 23], [23, 24]].forEach(p => { F(p[0], yt + 1, p[1], p[0], yt + 4, p[1], 'minecraft:iron_bars'); S(p[0], yt + 5, p[1], 'minecraft:lightning_rod[facing=up]') })
  ;[[21, 21], [9, 11]].forEach(p => { F(p[0], yt + 1, p[1], p[0] + 1, yt + 2, p[1] + 1, BTG); S(p[0], yt + 3, p[1], 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false]') })
  F(17, yt + 6, 15, 17, yt + 9, 15, 'minecraft:iron_bars'); S(17, yt + 10, 15, 'minecraft:lightning_rod[facing=up]')
  for (var i = 0; i < 6; i++) SA(5 + Math.floor(R() * 22), yt + 1, 5 + Math.floor(R() * 22), choix(['minecraft:moss_carpet', 'minecraft:gravel', 'minecraft:cobweb']))
  // abords : parking, local poubelles, arbres
  F(0, -1, 0, 31, -1, 1, BTG); for (var x = 2; x <= 29; x += 4) S(x, -1, 1, BTB)
  btVoitureY(0, 3, 0, 'x', 'gray', 1); btVoitureY(0, 19, 0, 'x', 'yellow', 2)
  btArbre(1, 12, 5); btArbre(30, 20, 6); btArbre(1, 26, 5)
  W(26, 28, 30, 31, 0, 2, BTM); F(27, 0, 29, 29, 1, 30, AIR); F(27, 0, 29, 28, 0, 29, 'minecraft:composter'); S(29, 0, 30, 'minecraft:cauldron'); S(28, -1, 28, BTS); PORTE(28, 0, 28, 'minecraft:iron_door', 'north', 'left', 'true')
}
function btHall() {
  // rez sud : hall d'entree ouvert sur toute la moitie sud
  F(5, 1, 17, 26, 5, 26, AIR); F(5, 0, 17, 26, 0, 26, 'minecraft:polished_andesite'); for (var x = 5; x <= 26; x += 2) for (var z = 17; z <= 26; z += 2) S(x, 0, z, 'minecraft:polished_diorite')
  W(12, 13, 19, 18, 1, 5, BTA); F(13, 1, 14, 18, 5, 17, AIR); F(13, 1, 18, 13, 2, 18, AIR); F(18, 1, 18, 18, 2, 18, AIR)
  F(5, 1, 15, 11, 5, 16, BTB); F(20, 1, 15, 26, 5, 16, BTB)
  // portes vitrees et auvent
  F(13, 1, 27, 18, 4, 27, GP); PORTE(15, 1, 27, 'minecraft:iron_door', 'south', 'left', 'true'); PORTE(16, 1, 27, 'minecraft:iron_door', 'south', 'right', 'false')
  F(12, 5, 28, 19, 5, 30, 'minecraft:smooth_stone_slab[type=bottom]'); F(12, 1, 30, 12, 4, 30, BTB); F(19, 1, 30, 19, 4, 30, BTB)
  F(6, 2, 27, 10, 4, 27, GP); F(21, 2, 27, 25, 4, 27, GP)
  // boites aux lettres, banc, poussettes et velos oublies
  for (var x = 6; x <= 10; x++) for (var y = 2; y <= 3; y++) S(x, y, 17, 'minecraft:iron_trapdoor[facing=south,half=bottom,open=true]')
  F(21, 1, 17, 25, 1, 17, btSt('smooth_quartz', 'south')); S(24, 1, 25, 'minecraft:cauldron'); S(7, 1, 25, 'handcrafted:terracotta_wide_pot'); S(25, 1, 25, 'handcrafted:white_glazed_medium_pot')
  S(9, 1, 22, 'supplementaries:sack'); S(20, 1, 21, 'minecraft:white_carpet'); S(14, 1, 23, 'minecraft:light_gray_carpet'); S(16, 5, 22, 'mcwlights:iron_chandelier'); S(9, 5, 21, 'minecraft:lantern[hanging=true]'); S(22, 5, 21, 'minecraft:lantern[hanging=true]')
  F(5, 1, 26, 5, 4, 26, BTB); F(26, 1, 26, 26, 4, 26, BTB)
}

// ================= CENTRE COMMERCIAL (dalle, mail central, mezzanine, verriere) =================
function btCentre() {
  var X1 = 2, X2 = 29, Z1 = 3, Z2 = 28, VER = 'minecraft:glass_pane'
  btDalle(0, 0, 31, 31)
  F(X1, 0, Z1, X2, 0, Z2, 'minecraft:polished_diorite'); for (var x = X1; x <= X2; x++) for (var z = Z1; z <= Z2; z++) if ((x + z) % 4 == 0) S(x, 0, z, 'minecraft:polished_andesite')
  W(X1, Z1, X2, Z2, 1, 11, BTM); F(X1, 6, Z1, X2, 6, Z2, BTS); F(X1, 12, Z1, X2, 12, Z2, BTS); W(X1, Z1, X2, Z2, 13, 13, BTM)
  // mail : vide central x13..18 sur deux niveaux, verriere en dents de scie
  F(13, 6, 9, 18, 6, Z2 - 1, AIR); F(13, 12, 9, 18, 12, Z2 - 1, AIR)
  for (var z = 9; z <= Z2 - 1; z++) { F(13, 12, z, 18, 12, z, z % 3 == 0 ? BTB : VER); if (z % 3 == 0) F(13, 13, z, 18, 13, z, 'minecraft:smooth_stone_slab[type=bottom]') }
  for (var z = 9; z <= Z2 - 1; z++) { S(12, 7, z, 'minecraft:iron_bars'); S(19, 7, z, 'minecraft:iron_bars') }
  // entree sud : portes coulissantes, auvent, enseigne lumineuse eteinte (bandeau sans texte)
  F(12, 1, Z2, 19, 4, Z2, VER); F(14, 1, Z2, 17, 3, Z2, AIR); S(15, 1, Z2, 'minecraft:glass'); F(10, 5, Z2 + 1, 21, 5, Z2 + 2, 'minecraft:smooth_stone_slab[type=bottom]'); F(11, 5, Z2, 20, 5, Z2, 'minecraft:red_concrete')
  // boutiques est et ouest : vitrines sur le mail, rideaux metalliques
  var boutiques = [[X1 + 1, 4, 12, 13], [X1 + 1, 14, 12, 20], [X1 + 1, 21, 12, Z2 - 1], [19, 4, X2 - 1, 11], [19, 12, X2 - 1, 19], [19, 20, X2 - 1, Z2 - 1]]
  boutiques.forEach((b, i) => {
    var xm = i < 3 ? 12 : 19, f = i < 3 ? 'east' : 'west'
    F(xm, 1, b[1], xm, 5, b[3], BTM); F(b[0], 1, b[1], b[2], 5, b[1], BTM)
    F(xm, 1, b[1] + 1, xm, 4, b[3] - 1, VER); PORTE(xm, 1, b[1] + Math.floor((b[3] - b[1]) / 2), 'minecraft:iron_door', f, 'left', i % 2 ? 'true' : 'false')
    if (i == 1 || i == 4) for (var z = b[1] + 1; z <= b[3] - 1; z++) for (var y = 1; y <= 4; y++) { var xx = xm + (i < 3 ? 1 : -1); if (!libreH(xx, y, z)) continue; S(xx, y, z, 'mcwwindows:iron_shutter[facing=' + OPP[f] + ',hinge=left,open=false]') }
    S(xm + (i < 3 ? -1 : 1), 5, b[1] + 2, 'minecraft:lantern[hanging=true]')
  })
  // superette (ouest, boutique 0+1 reunies) : rayonnages, caisses
  F(X1 + 1, 1, 13, 11, 5, 13, AIR)
  for (var x = 4; x <= 10; x += 3) for (var z = 6; z <= 18; z++) { if (z == 12) continue; S(x, 1, z, 'handcrafted:birch_shelf[facing=east,shape=single,type=1]'); S(x, 2, z, 'handcrafted:birch_shelf[facing=east,shape=single,type=1]'); if (R() < 0.5 || x == 10) SA(x + 1, 1, z, choix(['farmersdelight:tomato_crate', 'farmersdelight:cabbage_crate', 'supplementaries:sack', 'minecraft:white_carpet', 'farmersdelight:rice_bag', 'minecraft:melon'])) }
  ;[5, 8].forEach(x => { S(x, 1, 20, 'handcrafted:birch_counter[counter=smooth_stone,facing=south,type=1]'); S(x + 1, 1, 20, 'handcrafted:birch_counter[counter=smooth_stone,facing=south,type=1]'); S(x, 2, 20, 'minecraft:stone_button[face=floor,facing=south,powered=false]') })
  // pharmacie (est 1) : comptoir, armoires vitrees ; tabac-presse (est 2) : journaux ; boulangerie (ouest 3)
  for (var z = 5; z <= 10; z++) S(X2 - 1, 1, z, 'handcrafted:oak_cupboard[facing=west,type=1]'); F(23, 1, 6, 23, 1, 9, 'handcrafted:oak_counter[counter=quartz_block,facing=west,type=1]'); S(23, 2, 7, 'supplementaries:jar')
  for (var z = 13; z <= 18; z++) { S(X2 - 1, 1, z, 'minecraft:bookshelf'); SA(X2 - 2, 1, z, 'supplementaries:book_pile') }
  for (var z = 22; z <= 26; z++) { S(X1 + 1, 1, z, 'handcrafted:oak_counter[counter=oak_planks,facing=east,type=1]'); if (R() < 0.6) S(X1 + 1, 2, z, choix(GATEAUX)) }
  // mezzanine : restauration rapide, bancs du mail, escalier
  for (var x = 4; x <= 10; x += 3) for (var z = 6; z <= 24; z += 4) { S(x, 7, z, 'handcrafted:oak_table[color=red,shape=single,waterlogged=false]'); S(x, 7, z - 1, 'handcrafted:oak_chair[color=none,facing=south,waterlogged=false]'); S(x, 7, z + 1, 'handcrafted:oak_chair[color=none,facing=north,waterlogged=false]'); if (R() < 0.5) S(x, 8, z, choix(VAISS).replace('{I}', 'north')) }
  for (var z = 6; z <= 24; z += 6) S(25, 7, z, 'handcrafted:oak_counter[counter=smooth_stone,facing=west,type=1]')
  for (var i = 0; i < 6; i++) { S(14 + i % 4, 1 + i, 4 + Math.floor(i / 4) * 0, AIR) }
  for (var i = 0; i < 5; i++) { S(15, 1 + i, 4 + i, btSt('polished_andesite', 'south')); S(16, 1 + i, 4 + i, btSt('polished_andesite', 'south')) }
  F(15, 6, 9, 16, 6, 9, BTA); F(13, 6, 4, 18, 6, 8, AIR); F(15, 6, 4, 16, 6, 8, AIR)
  for (var z = 12; z <= 24; z += 6) { gtBanc(14, z, 'east', 2); S(17, 0, z + 2, 'supplementaries:planter[extended=false]'); S(17, 1, z + 2, 'minecraft:dead_bush') }
  S(15, 11, 15, 'mcwlights:iron_chandelier'); S(15, 11, 22, 'mcwlights:iron_chandelier')
  // quai de livraison nord : conteneurs, palettes
  F(4, 0, 0, 27, 0, 2, BTG); F(6, 0, 0, 8, 1, 1, 'createdeco:blue_shipping_container[axis=x,large=false]'); F(20, 0, 1, 23, 0, 2, 'createdeco:gray_shipping_container[axis=x,large=false]')
  for (var x = 11; x <= 17; x += 3) { S(x, 0, 1, 'minecraft:spruce_slab[type=bottom]'); SA(x, 1, 1, choix(['minecraft:barrel[facing=up,open=false]', 'supplementaries:sack', 'minecraft:hay_block'])) }
  // toit : parking (lignes), edicule
  for (var x = X1 + 2; x <= X2 - 2; x += 3) { if (x >= 12 && x <= 19) continue; F(x, 12, Z1 + 2, x, 12, Z1 + 7, BTB); F(x, 12, Z2 - 7, x, 12, Z2 - 2, BTB) }
  btVoitureY(13, 4, 5, 'z', 'red', 1); btVoitureY(13, 23, 21, 'z', 'white', 0)
}

// ================= PARKING SILO (3 niveaux, rampes) + gare routiere =================
function btParking() {
  btDalle(0, 0, 31, 31)
  var X1 = 1, X2 = 30, Z1 = 1, Z2 = 22
  for (var n = 0; n <= 2; n++) {
    var y = n * 5
    F(X1, y, Z1, X2, y, Z2, n == 0 ? BTG : BTS)
    for (var x = X1; x <= X2; x += 6) for (var z = Z1; z <= Z2; z += 7) F(x, y + 1, z, x, y + 4, z, BTM)
    if (n > 0) { W(X1, Z1, X2, Z2, y + 1, y + 1, BTM); for (var x = X1; x <= X2; x++) { if (x % 2) { S(x, y + 2, Z1, 'minecraft:iron_bars'); S(x, y + 2, Z2, 'minecraft:iron_bars') } } }
    for (var x = X1 + 2; x <= X2 - 2; x += 3) { S(x, y, Z1 + 3, BTB); S(x, y, Z2 - 3, BTB) }
  }
  F(X1, 15, Z1, X2, 15, Z2, BTS); W(X1, Z1, X2, Z2, 16, 16, BTM)
  // rampes (est) : tremies
  for (var n = 0; n < 3; n++) { var y = n * 5; F(26, y + 5, 9, 29, y + 5, 14, AIR); for (var i = 0; i < 5; i++) F(26, y + 1 + i, 9 + i, 29, y + 1 + i, 9 + i, btSt('stone', 'south')) }
  // voitures abandonnees, une tombee de travers
  var cols = ['red', 'white', 'blue', 'black', 'yellow', 'gray', 'green', 'light_blue']
  for (var n = 0; n <= 3; n++) for (var i = 0; i < 4; i++) { if (R() < 0.3) continue; var x = 3 + i * 6; btVoitureY(n * 5 + 1 - (n == 0 ? 1 : 0), x, Z1 + 1, 'z', cols[(n * 4 + i) % cols.length], Math.floor(R() * 3)) }
  btVoitureY(5 + 1, 10, 16, 'x', 'orange', 2)
  // caisse automatique, barrieres
  S(3, 1, Z2 - 1, BTA); S(3, 2, Z2 - 1, 'minecraft:iron_trapdoor[facing=south,half=bottom,open=true]'); F(4, 1, Z2 - 1, 7, 1, Z2 - 1, 'minecraft:red_concrete'.replace('concrete', 'stained_glass_pane'))
  // gare routiere (sud) : quais, abri ondule, autocar abandonne
  F(0, -1, 24, 31, -1, 31, 'minecraft:black_concrete'); F(2, 0, 25, 29, 0, 26, BTS); F(2, 0, 29, 29, 0, 30, BTS)
  for (var x = 3; x <= 28; x += 5) { F(x, 1, 25, x, 4, 25, 'minecraft:iron_bars'); F(x, 1, 30, x, 4, 30, 'minecraft:iron_bars') }
  F(2, 5, 24, 29, 5, 27, 'minecraft:light_gray_stained_glass'); F(2, 5, 28, 29, 5, 31, 'minecraft:smooth_stone_slab[type=bottom]')
  for (var x = 4; x <= 26; x += 7) gtBanc(x, 26, 'north', 3)
  for (var u = 0; u <= 11; u++) for (var v = 0; v <= 2; v++) { S(6 + u, 0, 27 + v - 1 + 1, AIR) }
  for (var u = 0; u <= 11; u++) for (var v = 0; v <= 1; v++) { S(8 + u, 1, 27 + v, u == 0 || u == 11 ? 'minecraft:white_concrete' : 'minecraft:light_blue_concrete'); S(8 + u, 2, 27 + v, u % 3 == 0 ? 'minecraft:white_concrete' : (R() < 0.2 ? 'minecraft:cobweb' : 'minecraft:tinted_glass')); S(8 + u, 3, 27 + v, 'minecraft:white_concrete') }
  S(13, 2, 27, 'minecraft:cobweb')
}

// ================= COLLEGE (R+2, salles de classe, preau, cour) =================
function btCollege() {
  btSol(0, 0, 31, 31); btDalle(0, 0, 31, 6)
  var X1 = 1, X2 = 30, Z1 = 7, Z2 = 16
  for (var n = 0; n <= 3; n++) F(X1, n * 6, Z1, X2, n * 6, Z2, BTS)
  for (var n = 0; n < 3; n++) {
    var y = n * 6
    W(X1, Z1, X2, Z2, y + 1, y + 5, BTM)
    // couloir au sud (z15) : classes au nord, fenetres en bandeau
    F(X1 + 1, y + 1, 14, X2 - 1, y + 5, 14, BTB)
    for (var x = X1 + 1; x <= X2 - 1; x++) if ((x - X1) % 7 != 0) { F(x, y + 2, Z1, x, y + 4, Z1, GP); S(x, y + 2, Z2, GP); S(x, y + 3, Z2, GP) }
    for (var c = 0; c < 4; c++) {
      var x1 = X1 + 1 + c * 7, x2 = x1 + 5
      if (c > 0) F(x1 - 1, y + 1, Z1 + 1, x1 - 1, y + 5, 13, BTB)
      PORTE(x1 + 1, y + 1, 14, 'minecraft:oak_door', 'south', 'left', (n + c) % 3 == 0 ? 'true' : 'false')
      S(x1 + 2, y + 2, 13, 'supplementaries:blackboard[facing=north]'.replace('north', 'north'))
      for (var x = x1; x <= x2; x++) S(x, y + 3, 13, 'supplementaries:blackboard[facing=north]')
      S(x1 + 2, y + 1, 12, 'handcrafted:oak_desk[color=none,facing=north,waterlogged=false]'); S(x1 + 2, y + 1, 13, 'handcrafted:oak_chair[color=none,facing=north,waterlogged=false]')
      for (var x = x1; x <= x2; x += 2) for (var z = Z1 + 1; z <= 10; z += 2) {
        if ((n * 4 + c) % 5 == 2 && R() < 0.4) { SA(x, y + 1, z, 'handcrafted:oak_chair[color=none,facing=west,waterlogged=false]'); continue }
        S(x, y + 1, z + 1, 'handcrafted:oak_desk[color=none,facing=north,waterlogged=false]'); S(x, y + 1, z, 'handcrafted:oak_chair[color=none,facing=south,waterlogged=false]')
        if (R() < 0.3) S(x, y + 2, z + 1, 'handcrafted:stackable_book')
      }
      S(x2, y + 1, Z1 + 1, 'supplementaries:globe[facing=south]'); S(x1 + 3, y + 5, 10, 'mcwlights:iron_chandelier')
      if ((n + c) % 4 == 1) for (var i = 0; i < 6; i++) SA(x1 + Math.floor(R() * 6), y + 1, Z1 + 1 + Math.floor(R() * 6), choix(['minecraft:white_carpet', 'supplementaries:book_pile_horizontal', 'minecraft:cobweb']))
    }
    // escalier (bout ouest du couloir)
    if (n < 2) for (var i = 0; i < 5; i++) { S(X1 + 1 + i, y + 1 + i, 15, btSt('polished_andesite', 'east')) }
    if (n < 2) F(X1 + 1, y + 6, 15, X1 + 5, y + 6, 15, AIR)
  }
  // entree, preau sur poteaux, cour : marelle, paniers de basket, arbres
  PORTE(15, 1, Z2, 'minecraft:iron_door', 'south', 'left', 'true'); PORTE(16, 1, Z2, 'minecraft:iron_door', 'south', 'right', 'false')
  F(X1, 5, Z2 + 1, 14, 5, Z2 + 5, 'minecraft:smooth_stone_slab[type=bottom]'); for (var x = X1; x <= 14; x += 4) S(x, 1, Z2 + 5, BTB), F(x, 1, Z2 + 5, x, 4, Z2 + 5, BTB)
  btDalle(0, 17, 31, 31)
  for (var i = 0; i < 6; i++) S(20 + (i % 2), -1, 20 + Math.floor(i / 2), i % 2 ? 'minecraft:white_concrete' : 'minecraft:yellow_concrete')
  ;[[24, 30, 'north'], [24, 18, 'south']].forEach(p => { F(p[0], 0, p[1], p[0], 3, p[1], 'minecraft:iron_bars'); var dz = p[2] == 'north' ? -1 : 1; S(p[0], 3, p[1] + dz, 'minecraft:white_stained_glass'); S(p[0], 3, p[1] + 2 * dz, 'minecraft:iron_trapdoor[facing=' + p[2] + ',half=bottom,open=false]') })
  btArbre(3, 27, 5); btArbre(12, 29, 6); W(0, 17, 31, 31, 0, 1, 'minecraft:iron_bars')
  F(0, 0, 17, 0, 1, 31, 'minecraft:iron_bars'); F(31, 0, 17, 31, 1, 31, 'minecraft:iron_bars'); F(0, 0, 31, 31, 1, 31, 'minecraft:iron_bars')
  // toit : acrotere, lanterneaux
  W(X1, Z1, X2, Z2, 19, 19, BTM); for (var x = 5; x <= 27; x += 7) F(x, 19, 10, x + 1, 19, 12, 'minecraft:glass')
}

// ================= PISCINE MUNICIPALE (bassin a moitie vide, plongeoir, gradins, vestiaires) =================
function btPiscine() {
  btDalle(0, 0, 31, 31)
  var X1 = 1, X2 = 30, Z1 = 2, Z2 = 29
  F(X1, -4, Z1, X2, 0, Z2, BTS); W(X1, Z1, X2, Z2, 1, 9, BTM)
  // facade nord en verre (vers la rue), toit a sheds vitres
  for (var x = X1 + 1; x <= X2 - 1; x++) if (x % 5 != 1) F(x, 2, Z1, x, 8, Z1, GP)
  for (var z = Z1; z <= Z2; z++) F(X1, 10, z, X2, 10, z, z % 4 == 0 ? BTB : 'minecraft:glass')
  // bassin x5..26 z8..24 : 25 m en lignes d'eau, profondeur 1..3, eau croupie dans la fosse
  for (var x = 5; x <= 26; x++) for (var z = 8; z <= 24; z++) { var p = z > 19 ? -3 : z > 14 ? -2 : -1; F(x, p, z, x, 0, z, AIR); S(x, p - 1, z, x % 4 == 0 ? 'minecraft:blue_concrete' : 'minecraft:light_blue_terracotta') }
  for (var x = 5; x <= 26; x++) for (var z = 20; z <= 24; z++) { S(x, -3, z, 'minecraft:water'); if (R() < 0.15) S(x, -2, z, 'minecraft:lily_pad'); if (R() < 0.2) S(x, -4, z, 'minecraft:mud') }
  for (var x = 5; x <= 26; x++) for (var z = 8; z <= 19; z++) if (R() < 0.12) SA(x, z > 14 ? -2 : -1, z, choix(['minecraft:moss_carpet', 'minecraft:white_carpet', 'minecraft:light_gray_carpet']))
  W(4, 7, 27, 25, 0, 0, 'minecraft:white_concrete')
  for (var z = 8; z <= 24; z += 4) S(4, 0, z, 'minecraft:light_blue_concrete')
  // echelles, plongeoir
  ;[9, 22].forEach(x => { S(x, -1, 8, 'minecraft:ladder[facing=south,waterlogged=false]') })
  F(15, 0, 25, 16, 3, 26, BTB); F(15, 3, 23, 16, 3, 24, 'minecraft:quartz_slab[type=bottom]'); F(15, 1, 27, 16, 3, 27, 'minecraft:ladder[facing=south,waterlogged=false]'.replace('south', 'south'))
  // gradins (est)
  for (var i = 0; i < 3; i++) F(28 - i, i, 6, 28 - i, i, 26, btSt('stone', 'west')); for (var i = 0; i < 3; i++) F(29, i, 6, 29, i, 26, BTS)
  // vestiaires (ouest) : casiers, bancs, douches
  W(X1, 6, 3, 26, 1, 4, BTB); F(2, 1, 7, 2, 4, 25, AIR)
  for (var z = 8; z <= 24; z += 2) { S(2, 2, z, 'minecraft:iron_trapdoor[facing=east,half=bottom,open=true]'); S(2, 3, z, 'minecraft:iron_trapdoor[facing=east,half=bottom,open=true]') }
  for (var z = 9; z <= 23; z += 4) S(2, 1, z, btSt('smooth_quartz', 'east'))
  PORTE(3, 1, 16, 'minecraft:oak_door', 'east', 'left', 'true')
  // accueil, tourniquets, plantes mortes
  F(12, 1, 3, 19, 1, 3, 'handcrafted:oak_counter[counter=smooth_stone,facing=north,type=1]'); S(15, 1, 3, AIR); S(16, 1, 3, AIR)
  PORTE(15, 1, Z1, 'minecraft:iron_door', 'north', 'left', 'true'); PORTE(16, 1, Z1, 'minecraft:iron_door', 'north', 'right', 'false')
  ;[6, 25].forEach(x => { S(x, 1, 4, 'supplementaries:planter[extended=false]'); S(x, 2, 4, 'minecraft:dead_bush') })
  S(15, 9, 16, 'mcwlights:iron_chandelier'); S(10, 9, 12, 'minecraft:lantern[hanging=true]'); S(21, 9, 20, 'minecraft:lantern[hanging=true]')
  F(5, 1, 6, 8, 1, 6, 'minecraft:white_carpet'); S(24, 1, 5, 'supplementaries:sack')
}

// ================= SALLE DES FETES (halle en tente, verrieres en bandes, scene, buvette, local a velos) =================
function btSalleFetes() {
  function sfChaise(x, y, z, f) { S(x, y, z, 'handcrafted:oak_chair[color=none,facing=' + f + ',waterlogged=false]') }
  function sfComptoir(f) { return 'handcrafted:oak_counter[counter=smooth_stone,facing=' + f + ',type=1]' }
  btSol(0, 0, 31, 31); btDalle(10, 0, 21, 8)
  var X1 = 6, X2 = 25, Z1 = 9, Z2 = 28
  F(X1, 0, Z1, X2, 0, Z2, BTS)
  // toit en tente : pans en escalier jusqu'au faite (x15..16)
  for (var k = 0; k <= 9; k++) { F(X1 + k, 1 + k, Z1, X1 + k, 1 + k, Z2, btSt('stone', 'east')); F(X2 - k, 1 + k, Z1, X2 - k, 1 + k, Z2, btSt('stone', 'west')); if (k > 0) { F(X1 + k, 1, Z1, X1 + k, k, Z1, BTM); F(X2 - k, 1, Z1, X2 - k, k, Z1, BTM); F(X1 + k, 1, Z2, X1 + k, k, Z2, BTM); F(X2 - k, 1, Z2, X2 - k, k, Z2, BTM) } }
  F(15, 11, Z1, 16, 11, Z2, BTS)
  // verrieres : bandes verticales dans les pignons, bande zenithale au faite (verre clair et teinte)
  var VX = ['minecraft:glass_pane', 'minecraft:light_blue_stained_glass_pane', 'minecraft:glass_pane', 'minecraft:light_gray_stained_glass_pane']
  for (var x = X1 + 2; x <= X2 - 2; x += 3) for (var y = 1; y < Math.min(x - X1, X2 - x) + 1; y++) { if (y < 2) continue; S(x, y, Z1, VX[(x + y) % 4]); S(x, y, Z2, VX[(x + 2 * y) % 4]) }
  for (var z = Z1 + 1; z <= Z2 - 1; z += 2) { S(15, 11, z, 'minecraft:glass'); S(16, 11, z, 'minecraft:light_blue_stained_glass') }
  // entree (nord) sous auvent
  F(14, 1, Z1, 17, 3, Z1, AIR); PORTE(15, 1, Z1, 'minecraft:iron_door', 'north', 'left', 'true'); PORTE(16, 1, Z1, 'minecraft:iron_door', 'north', 'right', 'false'); S(14, 1, Z1, BTM); S(17, 1, Z1, BTM)
  F(12, 5, Z1 - 3, 19, 5, Z1 - 1, 'minecraft:smooth_stone_slab[type=bottom]'); F(12, 1, Z1 - 3, 12, 4, Z1 - 3, BTB); F(19, 1, Z1 - 3, 19, 4, Z1 - 3, BTB)
  // salle : tables de banquet et chaises, piste de danse, scene au fond, buvette
  for (var z = Z1 + 4; z <= Z2 - 8; z += 4) for (var x = 9; x <= 20; x += 11) {
    F(x, 1, z, x + 2, 1, z, 'handcrafted:oak_table[color=white,shape=single,waterlogged=false]')
    for (var i = 0; i <= 2; i++) { if (R() < 0.2) continue; sfChaise(x + i, 1, z - 1, 'south'); sfChaise(x + i, 1, z + 1, 'north') }
  }
  F(14, 0, Z1 + 3, 17, 0, Z2 - 6, 'minecraft:polished_andesite')
  F(10, 1, Z2 - 4, 21, 1, Z2 - 1, 'minecraft:spruce_slab[type=top]'); S(11, 2, Z2 - 2, 'minecraft:jukebox'); S(20, 2, Z2 - 2, 'minecraft:note_block'); S(15, 2, Z2 - 2, 'minecraft:spruce_trapdoor[facing=north,half=bottom,open=false]')
  F(X1 + 2, 1, Z1 + 2, X1 + 2, 1, Z1 + 5, sfComptoir('east')); S(X1 + 2, 2, Z1 + 3, 'supplementaries:jar'); S(X1 + 1, 1, Z1 + 3, 'minecraft:barrel[facing=up,open=false]')
  for (var i = 0; i < 4; i++) S(15 + i % 2, 9, 12 + i * 4, 'mcwlights:iron_chandelier')
  for (var i = 0; i < 5; i++) SA(9 + Math.floor(R() * 14), 1, Z1 + 2 + Math.floor(R() * 14), choix(['minecraft:white_carpet', 'minecraft:light_gray_carpet', 'minecraft:cobweb']))
  // local a velos (nord-ouest) : abri sur poteaux
  F(1, 0, 1, 5, 0, 5, BTS); for (var x = 1; x <= 5; x += 4) for (var z = 1; z <= 5; z += 4) F(x, 1, z, x, 3, z, 'minecraft:iron_bars'); F(1, 4, 1, 5, 4, 5, 'minecraft:smooth_stone_slab[type=bottom]')
  for (var z = 2; z <= 4; z++) S(3, 1, z, 'minecraft:iron_trapdoor[facing=east,half=bottom,open=true]')
  // parvis : arbres, banc, tronc tombe
  btArbre(4, 14, 5); btArbre(28, 6, 6); gtBanc(22, 4, 'south', 3); F(26, 0, 14, 29, 0, 14, 'minecraft:dark_oak_log[axis=x]')
}

// ================= SQUARE : aire de jeux, city-stade, kiosque =================
function btSquare() {
  btSol(0, 0, 31, 31); btDalle(14, 0, 17, 31); btDalle(0, 14, 31, 17)
  // aire de jeux (nord-ouest) : sol souple, toboggan, balancoires, tourniquet
  F(1, -1, 1, 12, -1, 12, 'minecraft:red_terracotta'); for (var x = 1; x <= 12; x++) for (var z = 1; z <= 12; z++) if (R() < 0.2) S(x, -1, z, 'minecraft:coarse_dirt')
  F(3, 0, 3, 3, 2, 3, 'minecraft:iron_bars'); S(3, 3, 3, 'minecraft:smooth_quartz_slab[type=bottom]'.replace('smooth_quartz_slab', 'smooth_quartz_slab')); for (var i = 0; i < 3; i++) S(4 + i, 2 - i, 3, btSt('smooth_quartz', 'west')); S(5, 0, 3, 'minecraft:iron_bars'); F(2, 0, 3, 2, 2, 3, 'minecraft:ladder[facing=west,waterlogged=false]')
  F(7, 0, 8, 7, 3, 8, 'minecraft:iron_bars'); F(11, 0, 8, 11, 3, 8, 'minecraft:iron_bars'); F(7, 4, 8, 11, 4, 8, 'minecraft:iron_bars')
  ;[8, 10].forEach(x => { F(x, 2, 8, x, 3, 8, 'minecraft:chain[axis=y]'); S(x, 1, 8, 'minecraft:spruce_slab[type=top]') })
  S(5, 0, 10, 'minecraft:iron_bars'); S(5, 1, 10, 'minecraft:yellow_carpet')
  W(0, 0, 13, 13, 0, 0, 'minecraft:iron_bars'); S(13, 0, 6, AIR)
  // city-stade (sud-est) : sol vert, lignes, buts, palissade
  F(18, -1, 18, 30, -1, 30, 'minecraft:green_terracotta'); W(18, 18, 30, 30, -1, -1, 'minecraft:white_concrete'); F(24, -1, 18, 24, -1, 30, 'minecraft:white_concrete')
  W(17, 17, 31, 31, 0, 3, 'minecraft:iron_bars'); F(17, 0, 24, 17, 2, 24, AIR)
  ;[18, 30].forEach(x => { F(x, 0, 23, x, 2, 23, 'minecraft:iron_bars'); F(x, 0, 25, x, 2, 25, 'minecraft:iron_bars'); S(x, 2, 24, 'minecraft:iron_bars') })
  // kiosque (nord-est) : socle, colonnes, toit en dome de cuivre
  F(20, 0, 3, 27, 0, 10, BTS); for (var x = 20; x <= 27; x += 7) for (var z = 3; z <= 10; z += 7) F(x, 1, z, x, 4, z, 'minecraft:iron_bars')
  F(19, 5, 2, 28, 5, 11, 'minecraft:oxidized_cut_copper_slab[type=bottom]'); F(21, 5, 4, 26, 5, 9, 'minecraft:oxidized_cut_copper'); F(22, 6, 5, 25, 6, 8, 'minecraft:oxidized_cut_copper_slab[type=bottom]'); F(23, 6, 6, 24, 6, 7, 'minecraft:oxidized_cut_copper'); S(23, 7, 6, 'minecraft:lightning_rod[facing=up]')
  W(20, 3, 27, 10, 1, 1, 'minecraft:iron_bars'); S(23, 1, 3, AIR); S(24, 1, 3, AIR)
  // arbres, bancs, voiture brulee, caddies (cages) renverses
  btArbre(3, 22, 5); btArbre(9, 28, 6); btArbre(28, 14, 5); gtBanc(4, 16, 'north', 3); gtBanc(20, 13, 'south', 3)
  bgVoiture(2, 18, 'z', 'black', 2)
  ;[[11, 20], [12, 24]].forEach(p => { S(p[0], 0, p[1], 'minecraft:iron_bars'); S(p[0] + 1, 0, p[1], 'minecraft:iron_bars') })
}

// ---- palette et lancement du quartier beton ----
var THM_BT = finPalette('birch', {})
function vuesBeton() {
  vue('bt_ensemble_sud', 0, 0, 64, 55, 120, 64, 8, 30, 3000)
  vue('bt_ensemble_no', 0, 0, -30, 60, -30, 64, 6, 40, 3000)
  vue('bt_avenue_ouest', 0, 0, -8, 4, 41.5, 60, 6, 40)
  vue('bt_avenue_est', 0, 0, 136, 4, 38.5, 60, 6, 40)
  vue('bt_hlm', 0, 0, 16, 30, 52, 16, 30, 18)
  vue('bt_tour', 0, 0, 48, 36, 62, 48, 34, 16)
  vue('bt_tour_pied', 0, 0, 52, 3, 44, 48, 8, 28)
  vue('bt_tour_toit', 0, 0, 64, 80, 40, 48, 66, 14)
  vue('bt_centre', 0, 0, 80, 10, 46, 80, 5, 20)
  vue('bt_centre_mail', 0, 0, 79.5, 3, 26, 79.5, 3, 6)
  vue('bt_centre_mezz', 0, 0, 72, 9, 26, 70, 7, 8)
  vue('bt_parking', 0, 0, 112, 12, 46, 112, 6, 12)
  vue('bt_gare_routiere', 0, 0, 100, 3, 33, 112, 2, 27)
  vue('bt_college', 0, 48, 16, 12, -12, 16, 8, 10)
  vue('bt_college_cour', 0, 48, 28, 10, 34, 16, 3, 20)
  vue('bt_piscine', 32, 48, 16, 10, -12, 16, 4, 10)
  vue('bt_piscine_bassin', 32, 48, 16, 7, 4, 16, -2, 22)
  vue('bt_salle_fetes', 64, 48, 16, 9, -12, 16, 7, 14)
  vue('bt_salle_fetes_salle', 64, 48, 15.5, 3, 12, 15.5, 4, 26)
  vue('bt_square', 96, 48, 16, 14, -10, 16, 0, 16)
  vue('bt_coupe_tour', 144, 0, 16, 26, 44, 16, 6, 16)
  vue('bt_coupe_tour_logement', 144, 0, 10, 16, 2, 9, 6, 10)
  vue('bt_coupe_centre', 180, 0, 16, 22, 42, 16, 0, 14)
  vue('bt_coupe_college', 216, 0, 16, 20, 30, 16, 6, 10)
  vue('bt_coupe_hlm', 252, 0, 16, 26, 44, 16, 6, 18)
  vue('bt_coupe_piscine', 144, 48, 16, 24, 40, 16, -2, 14)
  vue('bt_coupe_salle_fetes', 180, 48, 16, 24, 40, 16, 2, 18)
}
var QFIN_BDG = QFIN, QFIN_VUES_BDG = QFIN_VUES
QFIN = function () {
  HB2 = true; FIN = true; THM = THM_BT
  var vb = 'mcwwindows:iron_shutter', rb = ['white', 'light_gray', 'orange', 'yellow', 'brown', 'light_blue']
  HM = {}; btRue(); finAncrage()
  lot(QF(grandHLM, vb, rb), 0, 0, 999, 611, 32, 64); lot(QF(btTour, vb, rb), 32, 0, 999, 621, 32, 72); lot(QF(btCentre, null, null), 64, 0, 999, 631, 32, 16); lot(QF(btParking, null, null), 96, 0, 999, 641, 32, 18)
  lot(QF(btCollege, vb, ['white', 'light_gray']), 0, 48, 999, 651, 32, 22); lot(QF(btPiscine, null, null), 32, 48, 999, 661, 32, 12); lot(QF(btSalleFetes, null, null), 64, 48, 999, 671, 32, 13); lot(QF(btSquare, null, null), 96, 48, 999, 681, 32, 9)
  lot(QF(btTour, vb, rb), 144, 0, 9, 621, 32, 72); lot(QF(btCentre, null, null), 180, 0, 4, 631, 32, 16); lot(QF(btCollege, vb, ['white', 'light_gray']), 216, 0, 9, 651, 32, 22); lot(QF(grandHLM, vb, rb), 252, 0, 15, 611, 32, 64)
  lot(QF(btPiscine, null, null), 144, 48, 4, 661, 32, 12); lot(QF(btSalleFetes, null, null), 180, 48, 5, 671, 32, 13)
  vlog('FIN volets ' + FIN_NV + ' rideaux ' + FIN_NR + ' paves ' + PAVE_NB + ' paratonnerres retires ' + ANC_NB)
  HB2 = false; FIN = false; THM = null; HM = {}
}
QFIN_VUES = vuesBeton

// ---- ancrage : rien ne doit flotter ni tomber ----
// paratonnerre : support plein ; luminaire suspendu : bloc au-dessus a face basse pleine (sinon chaine + luminaire un cran plus bas, ou retrait) ;
// plantes : sol adapte ; toile d'araignee : au moins un voisin
var ANC_NB = 0
function finAncrage() {
  var OFF = { up: [0, -1, 0], down: [0, 1, 0], north: [0, 0, 1], south: [0, 0, -1], east: [-1, 0, 0], west: [1, 0, 0] }
  function V(x, y, z) { var s = HM[hk(x, y, z)]; return s && s != AIR ? s : null }
  var L = []
  for (var k in HM) { var p = k.split(','); L.push([p[0] - OX, p[1] - OY, p[2] - OZ, HM[k]]) }
  L.forEach(e => {
    var x = e[0], y = e[1], z = e[2], b = e[3], id = idDe(b)
    if (HM[hk(x, y, z)] != b) return
    if (id == 'minecraft:lightning_rod' || id == 'minecraft:end_rod') {
      var m = b.match(/facing=(\w+)/), o = OFF[m ? m[1] : 'up'], s = V(x + o[0], y + o[1], z + o[2])
      if (!s || /type=bottom|_carpet|_trapdoor|lantern|_button|torch/.test(s)) { S(x, y, z, AIR); ANC_NB++ }
    } else if ((/lantern$/.test(id) && b.indexOf('hanging=true') > 0) || /chandelier/.test(id)) {
      var s = V(x, y + 1, z)
      if (!s || /_carpet|_button|torch|_pressure_plate/.test(s)) { S(x, y, z, AIR); ANC_NB++ }
      else if (/half=top|type=top|_trapdoor|_pane|_leaves/.test(s)) { if (!V(x, y - 1, z)) { S(x, y, z, 'minecraft:chain[axis=y]'); S(x, y - 1, z, b) } else S(x, y, z, AIR); ANC_NB++ }
    } else if (id == 'minecraft:dead_bush' || id == 'minecraft:short_grass' || id == 'minecraft:fern' || id == 'minecraft:tall_grass') {
      var s = V(x, y - 1, z), ok = id == 'minecraft:dead_bush' ? /^minecraft:(sand|red_sand|suspicious_sand|\w*terracotta|dirt|coarse_dirt|rooted_dirt|podzol|grass_block|mud|moss_block)$/ : /^minecraft:(grass_block|dirt|coarse_dirt|rooted_dirt|podzol|moss_block|mud|mycelium|farmland)$/
      if (!s || !ok.test(idDe(s))) { S(x, y, z, AIR); ANC_NB++ }
    } else if (id == 'minecraft:cobweb') {
      if (!V(x + 1, y, z) && !V(x - 1, y, z) && !V(x, y + 1, z) && !V(x, y - 1, z) && !V(x, y, z + 1) && !V(x, y, z - 1)) { S(x, y, z, AIR); ANC_NB++ }
    }
  })
}
