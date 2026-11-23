
// ================= QUARTIER DE VERRE (affaires, 1990-2010) : tour de bureaux, hotel, galerie marchande, siege, metro, parvis, brasserie, clinique =================
var VRC = 'minecraft:gray_concrete', VRB = 'minecraft:white_concrete', VRS = 'minecraft:smooth_stone', VRA = 'minecraft:polished_andesite', VRQ = 'minecraft:smooth_quartz'
var VRV = 'minecraft:light_blue_stained_glass_pane', VRN = 'minecraft:gray_stained_glass_pane', VRT = 'mcwlights:sea_lantern_slab[type=top]', VRNO = 'minecraft:black_concrete'
var VRPAP = ['handcrafted:stackable_book', 'supplementaries:book_pile_horizontal', 'supplementaries:book_pile', 'minecraft:candle[candles=1,lit=false]']
var VRPOT = ['handcrafted:terracotta_wide_pot', 'handcrafted:white_glazed_wide_pot', 'handcrafted:white_glazed_medium_pot', 'minecraft:potted_bamboo', 'minecraft:potted_dead_bush']
function vrCh(x, y, z, f, c) { S(x, y, z, 'handcrafted:birch_chair[color=' + (c || 'gray') + ',facing=' + f + ',waterlogged=false]') }
function vrBur(x, y, z, f) { S(x, y, z, 'handcrafted:birch_desk[color=none,facing=' + f + ',waterlogged=false]') }
function vrTab(x, y, z, c) { S(x, y, z, 'handcrafted:birch_table[color=' + (c || 'none') + ',shape=single,waterlogged=false]') }
function vrCpt(x, y, z, f, m) { S(x, y, z, 'handcrafted:birch_counter[counter=' + (m || 'smooth_stone') + ',facing=' + f + ',type=1]') }
function vrCanape(x, y, z, f, c) { S(x, y, z, 'handcrafted:birch_couch[color=' + (c || 'gray') + ',facing=' + f + ',shape=single,waterlogged=false]') }
function vrArm(x, y, z, f) { S(x, y, z, 'handcrafted:birch_cupboard[facing=' + f + ',type=1]') }
function vrEtag(x, y, z, f) { S(x, y, z, 'handcrafted:birch_shelf[facing=' + f + ',shape=single,type=1]') }
function vrGueridon(x, y, z) { S(x, y, z, 'handcrafted:birch_side_table[color=none,facing=north,waterlogged=false]') }
// lit simple vanille (lits de camp, hopital) : hors palette
function vrLitS(x, y, z, col, f) { if (y > CUT) return; var o = { north: [0, -1], south: [0, 1], east: [1, 0], west: [-1, 0] }[f]; S0(x + o[0], y, z + o[1], 'minecraft:' + col + '_bed[facing=' + f + ',part=head,occupied=false]'); S0(x, y, z, 'minecraft:' + col + '_bed[facing=' + f + ',part=foot,occupied=false]') }
function vrVitre(v) { var r = R(); return r < 0.05 ? 'minecraft:light_gray_stained_glass_pane' : r < 0.08 ? 'minecraft:white_stained_glass_pane' : v }
// mur-rideau : poteaux tous les "pas", angles pleins, vitrage entre
function vrMurRideau(x1, z1, x2, z2, y1, y2, pas, verre, poteau) {
  for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) {
    if (x != x1 && x != x2 && z != z1 && z != z2) continue
    var coin = (x == x1 || x == x2) && (z == z1 || z == z2), a = (z == z1 || z == z2) ? x - x1 : z - z1
    for (var y = y1; y <= y2; y++) S(x, y, z, coin || a % pas == 0 ? (poteau || VRC) : vrVitre(verre))
  }
}
// plafonniers encastres sous une dalle
function vrPlaf(y, x1, z1, x2, z2, pas) { for (var x = x1; x <= x2; x += pas) for (var z = z1; z <= z2; z += pas) if (libreH(x, y + 5, z) && !libreH(x, y + 6, z)) S(x, y + 5, z, VRT) }
// cage d'escalier 8 x 6 (meme trace que la tour beton) : murs, puis volees une fois toutes les dalles posees
function vrCage(x0, z0, y, M) { W(x0, z0, x0 + 7, z0 + 5, y + 1, y + 5, M); F(x0 + 1, y + 1, z0 + 1, x0 + 6, y + 5, z0 + 4, AIR) }
function vrVolees(x0, z0, y, M, stm) {
  var a = x0 + 2, b = z0 + 2
  S(a, y + 1, b, btSt(stm, 'east')); S(a + 1, y + 2, b, btSt(stm, 'east')); S(a + 2, y + 3, b, btSt(stm, 'east'))
  F(a + 3, y + 3, b, a + 3, y + 3, b + 1, M)
  S(a + 1, y + 6, b + 1, AIR); S(a + 2, y + 6, b + 1, AIR)
  S(a + 1, y + 1, b, M); S(a + 2, y + 2, b, M); S(a + 2, y + 3, b + 1, M); S(a + 1, y + 4, b + 1, M); S(a, y + 5, b + 1, M)
  S(a + 2, y + 4, b + 1, btSt(stm, 'west')); S(a + 1, y + 5, b + 1, btSt(stm, 'west')); S(a, y + 6, b + 1, btSt(stm, 'west'))
  S(x0 + 1, y + 5, z0 + 1, 'minecraft:lantern[hanging=true]')
}
function vrDebris(n, x1, z1, x2, z2, y) { for (var i = 0; i < n; i++) { var x = x1 + Math.floor(R() * (x2 - x1 + 1)), z = z1 + Math.floor(R() * (z2 - z1 + 1)); if (libreH(x, y, z) && !libreH(x, y - 1, z)) SA(x, y, z, choix(['supplementaries:book_pile_horizontal', 'supplementaries:sack', 'handcrafted:stackable_book'])) } }

// ---- boulevard : 2 x 3 voies, tramway engazonne au centre, caternaires, trottoirs en dalles pleines ----
function vrRue() {
  OX = VB.X0; OY = VB.Y0; OZ = VB.Z0; CUT = 999; GRAINE = 535
  for (var x = -16; x <= 143; x++) for (var z = 32; z <= 47; z++) {
    var r = R(), b
    if (z <= 33 || z >= 46) b = r < 0.6 ? 'mcwpaths:stone_flagstone' : r < 0.85 ? 'mcwpaths:andesite_flagstone' : 'mcwpaths:diorite_flagstone'
    else if (z == 34 || z == 45) b = VRA
    else if (z == 38 || z == 41) b = VRS
    else if (z >= 39 && z <= 40) b = r < 0.85 ? 'minecraft:grass_block' : 'minecraft:coarse_dirt'
    else b = r < 0.75 ? VRNO : r < 0.9 ? VRC : r < 0.96 ? 'minecraft:gray_concrete_powder' : 'minecraft:cobbled_deepslate'
    S(x, -1, z, b)
  }
  for (var x = -16; x <= 143; x++) {
    if (((x % 6) + 6) % 6 < 3) { S(x, -1, 36, VRB); S(x, -1, 43, VRB) }
    S(x, 0, 39, 'minecraft:rail[shape=east_west]'); S(x, 0, 40, 'minecraft:rail[shape=east_west]')
  }
  // passages pietons (bandes blanches), arret sur le quai central
  ;[[56, 63], [104, 109]].forEach(p => { for (var x = p[0]; x <= p[1]; x++) for (var z = 35; z <= 44; z++) if (z != 38 && z != 39 && z != 40 && z != 41 && x % 2 == 0) S(x, -1, z, VRB) })
  // poteaux de caternaire (quais z38 / z41), console a y6, fils (chaines) a y5 au-dessus de chaque voie
  for (var x = -12; x <= 140; x += 16) { F(x, 0, 38, x, 5, 38, 'minecraft:iron_bars'); F(x, 0, 41, x, 5, 41, 'minecraft:iron_bars'); F(x, 6, 38, x, 6, 41, 'minecraft:iron_bars') }
  F(-16, 5, 39, 143, 5, 39, 'minecraft:chain[axis=x]'); F(-16, 5, 40, 143, 5, 40, 'minecraft:chain[axis=x]')
  // arret de tram : abris vitres sur les deux quais
  ;[[38, 'north', 37], [41, 'south', 42]].forEach(q => {
    var z = q[0]
    F(84, 0, z, 84, 3, z, 'minecraft:iron_bars'); F(92, 0, z, 92, 3, z, 'minecraft:iron_bars'); F(84, 4, z, 92, 4, z, 'minecraft:smooth_stone_slab[type=bottom]')
    F(86, 0, z, 90, 0, z, btSt('smooth_quartz', q[1]))
  })
  // lampadaires sur les trottoirs
  for (var x = 0; x <= 128; x += 32) { btLampe(x + 6, 33, 'east'); btLampe(x + 22, 46, 'east') }
  // rame de tramway arretee (x66..79 sur les deux voies), pantographe sous le fil
  for (var x = 66; x <= 79; x++) for (var z = 39; z <= 40; z++) { S(x, 0, z, VRC); S(x, 3, z, VRB) }
  F(67, 1, 39, 78, 2, 40, 'minecraft:light_blue_stained_glass'); for (var x = 70; x <= 78; x += 4) F(x, 1, 39, x, 2, 40, VRB)
  F(66, 1, 39, 66, 2, 40, 'minecraft:black_stained_glass'); F(79, 1, 39, 79, 2, 40, 'minecraft:black_stained_glass')
  S(72, 4, 39, 'minecraft:iron_bars'); S(72, 4, 40, 'minecraft:iron_bars')
  // voitures abandonnees, barrieres et sacs
  bgVoiture(8, 36, 'x', 'white', 1); bgVoiture(40, 42, 'x', 'black', 0); bgVoiture(96, 35, 'x', 'red', 2); bgVoiture(118, 43, 'x', 'light_gray', 1); bgVoiture(-12, 42, 'x', 'blue', 0)
  for (var z = 42; z <= 44; z++) { S(30, 0, z, 'supplementaries:sack'); S(31, 0, z, 'supplementaries:sack') }
  F(132, 0, 35, 132, 0, 37, 'minecraft:iron_bars')
}

// ================= TOUR DE BUREAUX R+10 (mur-rideau, noyau central) =================
function vrTour() {
  var NIV = 11, Y = k => 6 * k
  btDalle(0, 0, 31, 31)
  for (var k = 0; k <= NIV; k++) { var y = Y(k); F(4, y, 4, 27, y, 27, k == 0 ? VRA : k == NIV ? VRS : 'minecraft:light_gray_concrete'); W(4, 4, 27, 27, y, y, VRC) }
  for (var k = 0; k < NIV; k++) {
    var y = Y(k)
    vrMurRideau(4, 4, 27, 27, y + 1, y + 5, 4, k == NIV - 1 ? VRN : VRV)
    vrCage(12, 13, y, VRA)
    PORTE(12, y + 1, 15, 'minecraft:iron_door', 'west', 'left', 'false'); PORTE(19, y + 1, 16, 'minecraft:iron_door', 'east', 'left', 'false')
    PORTE(15, y + 1, 18, 'minecraft:iron_door', 'south', 'left', 'false'); PORTE(16, y + 1, 18, 'minecraft:iron_door', 'south', 'right', 'false')
    if (k == 0) vrTourHall(); else if (k == NIV - 1) vrTourDirection(y); else if (k == 6) vrTourCamp(y); else if (k % 2) vrTourPlateau(y, k); else vrTourBureaux(y, k)
    vrPlaf(y, 7, 7, 26, 26, 5)
  }
  for (var k = 0; k < NIV; k++) vrVolees(12, 13, Y(k), VRA, 'polished_andesite')
  // toit : acrotere, local machinerie, groupes de clim, antenne, nacelle de laveur de vitres
  var yt = Y(NIV)
  W(4, 4, 27, 27, yt + 1, yt + 1, VRC); W(12, 13, 19, 18, yt + 1, yt + 4, VRA); F(13, yt + 1, 14, 18, yt + 4, 17, AIR); F(12, yt + 5, 13, 19, yt + 5, 18, VRS)
  PORTE(12, yt + 1, 15, 'minecraft:iron_door', 'west', 'left', 'true')
  ;[[6, 6], [22, 6], [6, 22]].forEach(p => { F(p[0], yt + 1, p[1], p[0] + 2, yt + 2, p[1] + 1, VRC); F(p[0], yt + 3, p[1], p[0] + 2, yt + 3, p[1] + 1, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false]') })
  ;[[4, 4], [27, 4], [4, 27], [27, 27]].forEach(p => S(p[0], yt + 2, p[1], 'minecraft:lightning_rod[facing=up]'))
  F(17, yt + 6, 15, 17, yt + 9, 15, 'minecraft:iron_bars'); S(17, yt + 10, 15, 'minecraft:lightning_rod[facing=up]')
  S(14, yt + 6, 16, 'minecraft:iron_bars'); S(14, yt + 7, 16, 'minecraft:iron_trapdoor[facing=south,half=bottom,open=true]')
  var yg = 40
  ;[8, 10].forEach(x => { F(x, yt + 1, 25, x, yt + 3, 25, 'minecraft:iron_bars'); F(x, yt + 3, 26, x, yt + 3, 28, 'minecraft:iron_bars'); F(x, yg + 1, 28, x, yt + 2, 28, 'minecraft:chain[axis=y]') })
  F(8, yg, 28, 10, yg, 29, 'minecraft:iron_trapdoor[facing=north,half=top,open=false]'); F(8, yg + 1, 29, 10, yg + 1, 29, 'minecraft:iron_bars')
  // abords : esplanade, arbres, bancs ; desserte au nord
  btArbre(2, 29, 5); btArbre(29, 29, 5); gtBanc(6, 30, 'north', 3); gtBanc(23, 30, 'north', 3)
  F(0, -1, 0, 31, -1, 2, VRC); for (var x = 2; x <= 29; x += 4) S(x, -1, 2, VRB)
  btVoitureY(0, 3, 0, 'x', 'black', 1); btVoitureY(0, 22, 0, 'x', 'white', 0)
}
function vrTourHall() {
  for (var x = 5; x <= 26; x++) for (var z = 5; z <= 26; z++) S(x, 0, z, (x + z) % 2 ? VRA : 'minecraft:polished_diorite')
  // entree vitree et marquise
  PORTE(15, 1, 27, 'minecraft:iron_door', 'south', 'left', 'true'); PORTE(16, 1, 27, 'minecraft:iron_door', 'south', 'right', 'false')
  F(11, 5, 28, 20, 5, 30, 'minecraft:smooth_stone_slab[type=bottom]'); F(11, 0, 30, 11, 4, 30, VRC); F(20, 0, 30, 20, 4, 30, VRC)
  // accueil (est), portiques devant les ascenseurs, attente (ouest)
  for (var z = 21; z <= 24; z++) { vrCpt(22, 1, z, 'west', 'quartz_block'); if (z == 22 || z == 24) vrCh(23, 1, z, 'west') }
  S(22, 2, 21, 'handcrafted:stackable_book'); S(22, 2, 23, 'minecraft:candle[candles=2,lit=false]')
  ;[12, 14, 17, 19].forEach(x => S(x, 1, 20, 'minecraft:quartz_pillar[axis=y]'))
  for (var z = 21; z <= 24; z++) vrCanape(6, 1, z, 'east', 'light_gray')
  vrGueridon(8, 1, 22); vrGueridon(8, 1, 23); S(8, 2, 22, 'supplementaries:book_pile_horizontal')
  ;[[5, 26], [26, 26], [5, 17], [26, 17], [11, 26], [20, 26]].forEach(p => S(p[0], 1, p[1], choix(VRPOT)))
  S(15, 5, 23, 'mcwlights:iron_chandelier'); S(15, 5, 9, 'mcwlights:iron_chandelier')
  // cafeteria (nord)
  for (var x = 7; x <= 24; x += 5) { if (x >= 12 && x <= 19) continue; vrTab(x, 1, 8, 'white'); vrCh(x - 1, 1, 8, 'east'); vrCh(x + 1, 1, 8, 'west'); S(x, 2, 8, choix(VAISS).replace('{I}', 'north')) }
  for (var x = 13; x <= 18; x++) vrCpt(x, 1, 6, 'south', 'smooth_stone'); S(14, 2, 6, 'supplementaries:jar'); S(17, 2, 6, 'handcrafted:white_cup')
  vrDebris(5, 5, 9, 26, 12, 1); S(20, 1, 25, 'supplementaries:sack'); S(10, 1, 25, 'supplementaries:sack')
}
function vrTourPlateau(y, k) {
  var et = k % 4 == 3
  ;[6, 21].forEach(z0 => {
    for (var x = 6; x <= 24; x++) {
      if ((x - 6) % 4 == 3) continue
      vrBur(x, y + 1, z0 + 1, 'north'); vrBur(x, y + 1, z0 + 2, 'south'); S(x, y + 2, z0 + 2, 'minecraft:light_gray_stained_glass_pane')
      vrCh(x, y + 1, z0, et && H3(x, y, z0) < 0.3 ? 'east' : 'south'); vrCh(x, y + 1, z0 + 3, et && H3(x, y, z0 + 3) < 0.3 ? 'west' : 'north')
      if (H3(x, y + 1, z0) < 0.45) S(x, y + 2, z0 + 1, choix(VRPAP))
    }
  })
  vrTourAnnexes(y)
  if (et) vrDebris(10, 5, 5, 26, 26, y + 1)
}
function vrTourAnnexes(y) {
  // ouest : reprographie, fontaine a eau ; est : kitchenette
  for (var z = 13; z <= 18; z++) vrArm(5, y + 1, z, 'east')
  vrGueridon(8, y + 1, 13); S(8, y + 2, 13, 'supplementaries:jar'); S(11, y + 1, 13, choix(VRPOT)); S(11, y + 1, 18, choix(VRPOT))
  for (var z = 13; z <= 18; z++) { if (z == 15) S(26, y + 1, z, 'minecraft:cauldron'); else vrCpt(26, y + 1, z, 'west') }
  S(26, y + 2, 14, 'supplementaries:jar'); S(26, y + 2, 17, 'handcrafted:white_cup')
  vrTab(23, y + 1, 15, 'white'); vrTab(23, y + 1, 16, 'white'); vrCh(22, y + 1, 15, 'east'); vrCh(24, y + 1, 16, 'west')
}
function vrTourBureaux(y, k) {
  F(5, y + 1, 11, 26, y + 5, 11, GP); F(5, y + 1, 20, 26, y + 5, 20, GP); F(10, y + 1, 12, 10, y + 5, 19, GP)
  ;[9, 14, 18, 22].forEach(x => { F(x, y + 1, 5, x, y + 5, 10, VRB); F(x, y + 1, 21, x, y + 5, 26, VRB) })
  ;[[5, 8], [10, 13], [15, 17], [19, 21], [23, 26]].forEach((b, i) => {
    var cx = b[0] + 1
    // [cloison, bureau, chaise, sens bureau, sens chaise, z armoire, z fenetre]
    ;[[11, 6, 7, 'south', 'north', 10, 5], [20, 25, 24, 'north', 'south', 21, 26]].forEach(c => {
      S(cx, y + 1, c[0], AIR); S(cx, y + 2, c[0], AIR)
      vrBur(cx, y + 1, c[1], c[3]); vrCh(cx, y + 1, c[2], c[4]); if (H3(cx, y, c[1]) < 0.6) S(cx, y + 2, c[1], choix(VRPAP))
      vrArm(b[1], y + 1, c[5], c[0] == 11 ? 'north' : 'south'); S(b[1], y + 1, c[6], choix(VRPOT))
    })
  })
  // salle de reunion (ouest)
  S(10, y + 1, 15, AIR); S(10, y + 2, 15, AIR)
  for (var z = 13; z <= 18; z++) { vrTab(7, y + 1, z, 'white'); vrCh(6, y + 1, z, 'east'); vrCh(8, y + 1, z, 'west') }
  vrCh(7, y + 1, 12, 'south'); vrCh(7, y + 1, 19, 'north'); S(7, y + 2, 15, 'handcrafted:white_cup'); S(7, y + 2, 17, 'supplementaries:book_pile_horizontal')
  for (var z = 13; z <= 18; z++) { if (z == 15) S(26, y + 1, z, 'minecraft:cauldron'); else vrCpt(26, y + 1, z, 'west') }
  vrTab(23, y + 1, 15, 'white'); vrCh(22, y + 1, 15, 'east'); vrCh(24, y + 1, 15, 'west'); S(26, y + 2, 13, 'supplementaries:jar')
}
function vrTourCamp(y) {
  // etage refuge : lits de camp, reserves, table des cartes, sacs devant les portes de la cage
  var C = ['white', 'light_gray', 'green', 'brown']
  for (var x = 6; x <= 24; x += 3) { vrLitS(x, y + 1, 7, choix(C), 'north'); vrLitS(x, y + 1, 24, choix(C), 'south'); S(x + 1, y + 1, 6, choix(['minecraft:barrel[facing=up,open=false]', 'supplementaries:sack'])); S(x + 1, y + 1, 25, choix(['minecraft:barrel[facing=up,open=false]', 'supplementaries:sack'])) }
  for (var x = 6; x <= 24; x += 3) { if (R() < 0.5) S(x + 1, y + 2, 6, 'minecraft:lantern[hanging=false]') }
  ;[[7, 10], [9, 10], [21, 10], [23, 10], [8, 21], [22, 21]].forEach(p => S(p[0], y + 1, p[1], choix(['farmersdelight:rice_bag', 'farmersdelight:tomato_crate', 'farmersdelight:cabbage_crate', 'minecraft:barrel[facing=up,open=false]'])))
  S(23, y + 1, 15, 'minecraft:cartography_table'); vrCh(23, y + 1, 14, 'south'); vrCh(23, y + 1, 16, 'north'); S(23, y + 2, 15, 'supplementaries:globe[facing=west]')
  S(25, y + 1, 18, 'minecraft:water_cauldron[level=2]'); S(25, y + 1, 13, 'minecraft:campfire[lit=false,facing=west]')
  ;[[11, 13], [11, 14], [11, 16], [11, 17], [20, 14], [20, 15], [20, 17]].forEach(p => S(p[0], y + 1, p[1], 'supplementaries:sack'))
  S(11, y + 2, 14, 'supplementaries:sack'); S(20, y + 2, 15, 'supplementaries:sack')
  for (var z = 13; z <= 18; z++) vrArm(5, y + 1, z, 'east')
}
function vrTourDirection(y) {
  // salle du conseil (nord), bureau du directeur (sud-est), salon (ouest)
  F(5, y + 1, 12, 11, y + 5, 12, GP); F(20, y + 1, 12, 26, y + 5, 12, GP); S(8, y + 1, 12, AIR); S(8, y + 2, 12, AIR)
  for (var x = 8; x <= 23; x++) { vrTab(x, y + 1, 8, 'white'); vrCh(x, y + 1, 7, 'south', 'black'); vrCh(x, y + 1, 9, 'north', 'black'); if (x % 3 == 0) S(x, y + 2, 8, choix(VAISS).replace('{I}', 'north')) }
  vrCh(7, y + 1, 8, 'east', 'black'); vrCh(24, y + 1, 8, 'west', 'black')
  F(13, y + 1, 20, 26, y + 5, 20, GP); F(13, y + 1, 21, 13, y + 5, 26, GP); S(13, y + 1, 23, AIR); S(13, y + 2, 23, AIR)
  vrBur(19, y + 1, 24, 'south'); vrBur(20, y + 1, 24, 'south'); vrCh(19, y + 1, 25, 'north', 'black'); vrCh(18, y + 1, 22, 'south'); vrCh(21, y + 1, 22, 'south')
  S(20, y + 2, 24, 'supplementaries:globe[facing=north]'); S(19, y + 2, 24, 'handcrafted:stackable_book')
  for (var z = 21; z <= 25; z++) S(26, y + 1, z, 'minecraft:bookshelf'); vrCanape(15, y + 1, 21, 'east', 'black'); vrCanape(15, y + 1, 22, 'east', 'black')
  for (var z = 14; z <= 18; z++) vrCanape(6, y + 1, z, 'east', 'light_gray'); vrGueridon(8, y + 1, 15); vrGueridon(8, y + 1, 17)
  for (var x = 5; x <= 10; x++) vrCpt(x, y + 1, 26, 'north', 'quartz_block'); S(6, y + 2, 26, 'supplementaries:jar'); S(9, y + 2, 26, 'handcrafted:white_cup')
  ;[[5, 20], [11, 20], [25, 13], [25, 18]].forEach(p => S(p[0], y + 1, p[1], choix(VRPOT)))
}

// ================= HOTEL R+7 (couloir central, chambres, suites, piscine sur le toit) =================
function vrHotel() {
  var NIV = 8, Y = k => 6 * k, X1 = 3, X2 = 27, Z1 = 5, Z2 = 25
  btDalle(0, 0, 31, 31)
  for (var k = 0; k <= NIV; k++) { var y = Y(k); F(X1, y, Z1, X2, y, Z2, VRS); W(X1, Z1, X2, Z2, y, y, VRC) }
  var WN = [[5, 6], [8, 9], [13, 14], [18, 19], [23, 25]]
  for (var k = 0; k < NIV; k++) {
    var y = Y(k)
    W(X1, Z1, X2, Z2, y + 1, y + 5, VRB)
    if (k > 0) {
      WN.forEach(w => { F(w[0], y + 2, Z1, w[1], y + 4, Z1, VRV); F(w[0], y + 2, Z2, w[1], y + 4, Z2, VRV) })
      F(X2, y + 2, 9, X2, y + 4, 10, VRV); F(X2, y + 2, 20, X2, y + 4, 21, VRV); F(X2, y + 2, 15, X2, y + 4, 16, VRV)
      F(X1, y + 2, 8, X1, y + 4, 9, VRV); F(X1, y + 2, 21, X1, y + 4, 22, VRV)
    }
    vrCage(4, 13, y, VRA)
    if (k == 0) vrHotelRez(); else vrHotelEtage(y, k)
    vrPlaf(y, 14, 15, 26, 15, 4)
  }
  for (var k = 0; k < NIV; k++) vrVolees(4, 13, Y(k), VRA, 'polished_andesite')
  // toit : garde-corps vitre, machinerie, piscine, transats, parasol
  var yt = Y(NIV)
  W(X1, Z1, X2, Z2, yt + 1, yt + 1, VRB); W(X1, Z1, X2, Z2, yt + 2, yt + 2, GP)
  W(4, 13, 11, 18, yt + 1, yt + 4, VRA); F(5, yt + 1, 14, 10, yt + 4, 17, AIR); F(4, yt + 5, 13, 11, yt + 5, 18, VRS); PORTE(11, yt + 1, 15, 'minecraft:iron_door', 'east', 'left', 'true')
  W(14, 7, 25, 12, yt + 1, yt + 1, VRQ); F(15, yt + 1, 8, 24, yt + 1, 11, 'minecraft:water'); ;[[16, 9], [21, 10], [23, 8]].forEach(p => S(p[0], yt + 2, p[1], 'minecraft:lily_pad'))
  for (var x = 15; x <= 21; x += 2) { S(x, yt + 1, 14, 'minecraft:birch_stairs[facing=north,half=bottom,shape=straight]'); S(x, yt + 1, 15, 'minecraft:birch_slab[type=bottom]') }
  F(24, yt + 1, 16, 24, yt + 2, 16, 'minecraft:iron_bars'); F(23, yt + 3, 15, 25, yt + 3, 17, 'minecraft:white_wool')
  F(14, yt, 13, 25, yt, 18, 'minecraft:birch_planks')
  ;[[13, 21], [20, 22], [25, 23]].forEach(p => S(p[0], yt + 1, p[1], choix(VRPOT)))
  F(7, yt + 6, 15, 7, yt + 8, 15, 'minecraft:iron_bars'); S(7, yt + 9, 15, 'minecraft:lightning_rod[facing=up]')
  // parvis : marquise, taxi, mats
  F(16, 5, 26, 21, 5, 28, 'minecraft:light_gray_stained_glass'); F(16, 0, 28, 16, 4, 28, 'minecraft:iron_bars'); F(21, 0, 28, 21, 4, 28, 'minecraft:iron_bars')
  bgVoiture(4, 28, 'x', 'yellow', 1)
  ;[[24, 'blue'], [26, 'white'], [28, 'red']].forEach(m => { F(m[0], 0, 29, m[0], 6, 29, 'minecraft:iron_bars'); F(m[0], 5, 30, m[0], 6, 30, 'minecraft:' + m[1] + '_wool') })
  F(0, -1, 0, 31, -1, 3, VRC); S(6, 0, 1, 'minecraft:composter'); S(7, 0, 1, 'minecraft:composter'); S(8, 0, 1, 'minecraft:cauldron')
}
function vrHotelRez() {
  for (var x = 12; x <= 26; x++) for (var z = 6; z <= 24; z++) S(x, 0, z, (x + z) % 2 ? 'minecraft:polished_diorite' : VRQ)
  F(12, 1, 25, 26, 4, 25, VRV); F(13, 2, 5, 25, 4, 5, VRV)
  PORTE(18, 1, 25, 'minecraft:iron_door', 'south', 'left', 'false'); PORTE(19, 1, 25, 'minecraft:iron_door', 'south', 'right', 'true')
  PORTE(11, 1, 15, 'minecraft:birch_door', 'east', 'left', 'true'); PORTE(11, 1, 16, 'minecraft:iron_door', 'east', 'left', 'false')
  // reception (est), salon (centre sud), bar et petit-dejeuner (nord)
  for (var z = 19; z <= 22; z++) { vrCpt(24, 1, z, 'west', 'quartz_block'); vrEtag(26, 1, z, 'west'); vrEtag(26, 2, z, 'west') }
  vrCh(25, 1, 20, 'west'); S(24, 2, 20, 'minecraft:candle[candles=1,lit=false]'); S(24, 2, 22, 'handcrafted:stackable_book')
  F(14, 1, 20, 19, 1, 23, 'minecraft:red_carpet')
  ;[21, 22].forEach(z => { vrCanape(14, 1, z, 'east', 'red'); vrCanape(19, 1, z, 'west', 'red') }); vrGueridon(16, 1, 21); vrGueridon(17, 1, 22)
  S(16, 5, 21, 'mcwlights:iron_chandelier'); S(16, 5, 9, 'mcwlights:iron_chandelier')
  for (var x = 14; x <= 22; x++) vrCpt(x, 1, 11, 'north', 'dark_oak_planks'); for (var x = 14; x <= 22; x += 2) vrCh(x, 1, 10, 'south', 'red')
  S(15, 2, 11, 'supplementaries:jar'); S(19, 2, 11, 'handcrafted:white_cup'); S(21, 2, 11, 'supplementaries:jar')
  for (var x = 14; x <= 25; x += 4) { vrTab(x, 1, 7, 'white'); vrCh(x - 1, 1, 7, 'east'); vrCh(x + 1, 1, 7, 'west'); S(x, 2, 7, choix(VAISS).replace('{I}', 'north')) }
  ;[[12, 6], [26, 6], [12, 24], [26, 24]].forEach(p => S(p[0], 1, p[1], choix(VRPOT)))
  S(20, 1, 24, 'supplementaries:sack'); S(13, 1, 19, 'supplementaries:sack'); vrDebris(4, 12, 12, 26, 18, 1)
  // bagagerie (suite nord) et bureau (suite sud)
  F(11, 1, 6, 11, 5, 12, VRB); F(11, 1, 19, 11, 5, 24, VRB); PORTE(6, 1, 13, 'minecraft:birch_door', 'north', 'left', 'false'); PORTE(8, 1, 18, 'minecraft:birch_door', 'south', 'left', 'false')
  for (var x = 4; x <= 10; x++) { S(x, 1, 6, 'supplementaries:sack'); if (x % 2) S(x, 2, 6, 'supplementaries:sack') }
  for (var z = 20; z <= 24; z += 2) { vrBur(5, 1, z, 'east'); vrCh(6, 1, z, 'west') }
}
function vrHotelEtage(y, k) {
  var PL = VRB, BD = 'minecraft:birch_door'
  F(11, y + 1, 6, 11, y + 5, 12, PL); F(11, y + 1, 19, 11, y + 5, 24, PL)
  F(12, y + 1, 14, 26, y + 5, 14, PL); F(12, y + 1, 17, 26, y + 5, 17, PL)
  ;[16, 21].forEach(x => { F(x, y + 1, 6, x, y + 5, 13, PL); F(x, y + 1, 18, x, y + 5, 24, PL) })
  ;[[12, 15], [17, 20], [22, 26]].forEach((r, i) => {
    piece(cadre(r[0], 6, r[1], 13, 'north', y, 5), 'chambre', (k * 3 + i) % 5 < 2 ? 1 : 0)
    piece(cadre(r[0], 18, r[1], 24, 'south', y, 5), 'chambre', (k * 3 + i + 2) % 5 < 2 ? 1 : 0)
  })
  piece(cadre(4, 6, 10, 12, 'north', y, 5), 'chambre', k % 3 == 0 ? 1 : 0); piece(cadre(4, 19, 10, 24, 'south', y, 5), 'chambre', k % 3 == 1 ? 1 : 0)
  ;[12, 17, 22].forEach(x => { S(x, y + 1, 13, AIR); S(x, y + 2, 13, AIR); PORTE(x, y + 1, 14, BD, 'north', 'left', 'false') })
  ;[15, 20, 25].forEach(x => { S(x, y + 1, 18, AIR); S(x, y + 2, 18, AIR); PORTE(x, y + 1, 17, BD, 'south', 'right', 'false') })
  S(6, y + 1, 12, AIR); S(6, y + 2, 12, AIR); PORTE(6, y + 1, 13, BD, 'north', 'left', 'false')
  S(8, y + 1, 19, AIR); S(8, y + 2, 19, AIR); PORTE(8, y + 1, 18, BD, 'south', 'left', 'false')
  PORTE(11, y + 1, 15, BD, 'east', 'left', 'false'); PORTE(11, y + 1, 16, 'minecraft:iron_door', 'east', 'left', 'false')
  F(12, y + 1, 15, 26, y + 1, 16, 'minecraft:red_carpet'); S(26, y + 1, 15, choix(VRPOT))
  // suites : petit salon
  vrCanape(5, y + 1, 9, 'east', 'brown'); vrGueridon(6, y + 1, 8); vrBur(9, y + 1, 21, 'south'); vrCh(9, y + 1, 22, 'north')
  if (k % 4 == 2) vrDebris(3, 12, 15, 26, 16, y + 2)
}

// ================= GALERIE MARCHANDE (passage couvert, deux niveaux de boutiques, voute vitree) =================
function vrGalerie() {
  var X1 = 2, X2 = 29, Z1 = 2, Z2 = 29
  btDalle(0, 0, 31, 31)
  F(X1, 0, Z1, X2, 0, Z2, VRA)
  for (var x = 12; x <= 19; x++) for (var z = Z1; z <= Z2; z++) S(x, 0, z, (x + z) % 2 ? VRQ : 'minecraft:polished_diorite')
  ;[[X1, 11], [20, X2]].forEach(b => { W(b[0], Z1, b[1], Z2, 1, 11, VRB); F(b[0], 6, Z1, b[1], 6, Z2, VRS); F(b[0], 12, Z1, b[1], 12, Z2, VRS); W(b[0], Z1, b[1], Z2, 13, 13, VRB) })
  var ZS = [[3, 8], [10, 15], [17, 22], [24, 28]], FAS = ['red', 'blue', 'green', 'yellow', 'black', 'orange', 'purple', 'cyan']
  var TYP = ['mode', 'cafe', 'livres', 'bijoux', 'pharma', 'vide', 'mode', 'livres', 'cafe', 'vide', 'bijoux', 'pharma', 'livres', 'mode', 'vide', 'cafe']
  ;[0, 1].forEach(cote => [0, 6].forEach((y, n) => ZS.forEach((zs, i) => {
    var xf = cote ? 20 : 11, f = cote ? 'west' : 'east', t = TYP[cote * 8 + n * 4 + i]
    if (i > 0) F(cote ? 21 : 3, y + 1, zs[0] - 1, cote ? 28 : 10, y + 5, zs[0] - 1, VRB)
    F(xf, y + 1, zs[0], xf, y + 4, zs[1], GP); F(xf, y + 5, zs[0], xf, y + 5, zs[1], 'minecraft:' + FAS[(cote * 3 + n * 5 + i) % 8] + '_concrete')
    vrBoutique(t, cote, zs[0], zs[1], y)
    PORTE(xf, y + 1, zs[0] + 2, 'minecraft:iron_door', f, 'left', t == 'vide' ? 'true' : 'false')
  })))
  // pignons : nord vitre avec portes, sud ouvert (grille a demi baissee)
  F(12, 1, Z1, 19, 11, Z1, GP); F(12, 6, Z1, 19, 6, Z1, VRC); PORTE(15, 1, Z1, 'minecraft:iron_door', 'north', 'left', 'false'); PORTE(16, 1, Z1, 'minecraft:iron_door', 'north', 'right', 'false')
  F(12, 1, Z2, 13, 5, Z2, VRB); F(18, 1, Z2, 19, 5, Z2, VRB); F(14, 4, Z2, 17, 5, Z2, 'minecraft:iron_bars'); F(12, 6, Z2, 19, 6, Z2, VRC); F(12, 7, Z2, 19, 11, Z2, GP)
  // coursives de l'etage, passerelle, palier ; garde-corps vitres
  F(12, 6, Z1 + 1, 13, 6, Z2 - 1, VRS); F(18, 6, Z1 + 1, 19, 6, Z2 - 1, VRS); F(14, 6, 15, 17, 6, 16, VRS); F(14, 6, 26, 17, 6, Z2 - 1, VRS)
  for (var z = Z1 + 1; z <= 25; z++) if (z != 15 && z != 16) { S(13, 7, z, GP); S(18, 7, z, GP) }
  F(14, 7, 14, 17, 7, 14, GP); F(14, 7, 17, 17, 7, 17, GP)
  // escalator a l'arret (montee vers le sud) entre deux joues pleines
  for (var i = 0; i < 6; i++) { var z = 20 + i; F(15, 1 + i, z, 16, 1 + i, z, btSt('polished_andesite', 'south')); if (i > 0) F(15, 1, z, 16, i, z, VRA); F(14, 1, z, 14, 2 + i, z, VRQ); F(17, 1, z, 17, 2 + i, z, VRQ) }
  // voute vitree a nervures
  var VP = [[12, 12, 13], [13, 13, 14], [14, 14, 15], [15, 15, 16], [16, 15, 16], [17, 14, 15], [18, 13, 14], [19, 12, 13]]
  for (var z = Z1; z <= Z2; z++) VP.forEach(p => F(p[0], p[1], z, p[0], p[2], z, z % 4 == 1 ? VRC : 'minecraft:glass'))
  ;[Z1, Z2].forEach(z => VP.forEach(p => { if (p[1] > 12) F(p[0], 12, z, p[0], p[1] - 1, z, GP) }))
  ;[8, 18, 23].forEach(z => { S(15, 14, z, 'minecraft:chain[axis=y]'); S(15, 13, z, 'mcwlights:iron_chandelier') })
  // mail : fontaine seche, bancs, bacs
  W(14, 6, 17, 9, 1, 1, VRQ); F(15, 1, 7, 16, 1, 8, 'minecraft:water'); S(15, 2, 7, 'minecraft:lily_pad')
  OY += 1; gtBanc(12, 10, 'west', 3); gtBanc(19, 10, 'east', 3); OY -= 1; ;[[12, 18], [19, 18], [12, 4], [19, 4]].forEach(p => S(p[0], 1, p[1], choix(VRPOT)))
  vrDebris(8, 12, 3, 19, 19, 1); for (var i = 0; i < 2; i++) { S(13 + i * 5, 1, 13, 'minecraft:iron_bars'); S(13 + i * 5, 1, 14, 'minecraft:iron_bars') }
  // toits : groupes de clim
  ;[[5, 6], [24, 20]].forEach(p => { F(p[0], 13, p[1], p[0] + 2, 14, p[1] + 1, VRC); F(p[0], 15, p[1], p[0] + 2, 15, p[1] + 1, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false]') })
  F(0, -1, 0, 31, -1, 1, VRC); S(4, 0, 0, 'minecraft:composter'); S(26, 0, 0, 'minecraft:composter')
}
function vrBoutique(t, cote, za, zb, y) {
  var fr = cote ? 'west' : 'east', X = u => cote ? 21 + u : 10 - u, zm = za + 2
  function P(u, dy, z, b) { S(X(u), y + dy, z, b) }
  if (t == 'mode') {
    for (var z = za; z <= zb; z++) { P(7, 1, z, 'handcrafted:birch_shelf[facing=' + fr + ',shape=single,type=1]'); P(7, 2, z, 'handcrafted:birch_shelf[facing=' + fr + ',shape=single,type=1]'); P(7, 3, z, 'minecraft:' + choix(COULS) + '_carpet') }
    ;[za, zb].forEach(z => { if (z == zm) return; vrTab(X(3), y + 1, z, 'none'); P(3, 2, z, 'minecraft:' + choix(COULS) + '_carpet'); vrTab(X(4), y + 1, z, 'none'); P(4, 2, z, 'minecraft:' + choix(COULS) + '_carpet') })
    P(1, 1, zb, 'handcrafted:birch_counter[counter=birch_planks,facing=' + fr + ',type=1]')
  } else if (t == 'cafe') {
    for (var z = za; z <= zb; z++) { P(6, 1, z, 'handcrafted:birch_counter[counter=dark_oak_planks,facing=' + fr + ',type=1]'); if (R() < 0.5) P(6, 2, z, choix(['supplementaries:jar', 'handcrafted:white_cup', 'handcrafted:white_plate'])); P(7, 2, z, 'handcrafted:birch_shelf[facing=' + fr + ',shape=single,type=1]') }
    ;[za, zb].forEach(z => { vrTab(X(2), y + 1, z, 'white'); vrCh(X(1), y + 1, z, OPP[fr]); vrCh(X(3), y + 1, z, fr); P(2, 2, z, choix(VAISS).replace('{I}', 'north')) })
  } else if (t == 'livres') {
    for (var z = za; z <= zb; z++) { for (var dy = 1; dy <= 3; dy++) P(7, dy, z, 'minecraft:bookshelf'); if (z != zm) { P(4, 1, z, 'minecraft:bookshelf'); P(4, 2, z, 'minecraft:bookshelf') } }
    for (var i = 0; i < 4; i++) { var u = choix([1, 2, 5, 6]), z = za + Math.floor(R() * (zb - za + 1)); if (libreH(X(u), y + 1, z)) P(u, 1, z, choix(['supplementaries:book_pile', 'supplementaries:book_pile_horizontal', 'handcrafted:stackable_book'])) }
  } else if (t == 'bijoux') {
    for (var z = za; z <= zb; z++) { P(7, 1, z, 'handcrafted:birch_cupboard[facing=' + fr + ',type=1]'); if (z != zm) { P(3, 1, z, 'handcrafted:birch_counter[counter=quartz_block,facing=' + fr + ',type=1]'); if (R() < 0.5) P(3, 2, z, 'supplementaries:jar') } }
  } else if (t == 'pharma') {
    for (var z = za; z <= zb; z++) { P(7, 1, z, 'handcrafted:birch_cupboard[facing=' + fr + ',type=1]'); P(7, 2, z, 'handcrafted:birch_cupboard[facing=' + fr + ',type=1]'); if (z != zm) P(4, 1, z, 'handcrafted:birch_counter[counter=quartz_block,facing=' + fr + ',type=1]') }
    P(4, 2, za, 'minecraft:brewing_stand'); P(4, 2, zb, 'supplementaries:jar')
  } else {
    for (var z = za; z <= zb; z++) P(7, 1, z, 'handcrafted:birch_shelf[facing=' + fr + ',shape=single,type=1]')
    for (var i = 0; i < 4; i++) { var u = 1 + Math.floor(R() * 6), z = za + Math.floor(R() * (zb - za + 1)); if (z != zm && libreH(X(u), y + 1, z)) P(u, 1, z, choix(['supplementaries:sack', 'minecraft:barrel[facing=up,open=false]', 'handcrafted:stackable_book'])) }
  }
  P(3, 5, zm, VRT)
}

// ================= SIEGE SOCIAL (verre fume, atrium plante, verriere) =================
function vrSiege() {
  var NIV = 5, Y = k => 6 * k, A1 = 12, A2 = 19
  btDalle(0, 0, 31, 31)
  for (var k = 0; k <= NIV; k++) { var y = Y(k); F(3, y, 3, 28, y, 28, k == 0 ? VRA : k == NIV ? VRS : 'minecraft:light_gray_concrete'); W(3, 3, 28, 28, y, y, VRNO); if (k > 0 && k < NIV) F(A1, y, A1, A2, y, A2, AIR) }
  // jardin d'hiver au pied de l'atrium (envahi)
  F(A1, -1, A1, A2, -1, A2, 'minecraft:dirt'); F(A1, 0, A1, A2, 0, A2, 'minecraft:grass_block'); F(13, 0, 17, 14, 0, 18, 'minecraft:water')
  btArbre(16, 14, 10); btArbre(17, 17, 5)
  for (var x = A1; x <= A2; x++) for (var z = A1; z <= A2; z++) { var r = H3(x, 1, z); if (!libreH(x, 1, z) || !/grass_block/.test(HM[hk(x, 0, z)] || '')) continue; if (r < 0.15) SA(x, 1, z, 'minecraft:azalea'); else if (r < 0.22) SA(x, 1, z, 'minecraft:flowering_azalea'); else if (r < 0.45) SA(x, 1, z, 'minecraft:short_grass') }
  S(13, 1, 17, 'minecraft:lily_pad')
  for (var k = 0; k < NIV; k++) {
    var y = Y(k)
    vrMurRideau(3, 3, 28, 28, y + 1, y + 5, 3, k == NIV - 1 ? 'minecraft:black_stained_glass_pane' : VRN, VRNO)
    vrCage(4, 4, y, VRA); PORTE(11, y + 1, 6, 'minecraft:iron_door', 'east', 'left', 'false')
    if (k > 0) for (var a = 11; a <= 20; a++) { S(a, y + 1, 11, GP); S(a, y + 1, 20, GP); S(11, y + 1, a, GP); S(20, y + 1, a, GP) }
    if (k == 0) vrSiegeRez(); else if (k == NIV - 1) vrSiegeDirection(y); else vrSiegeBureaux(y, k)
    vrPlaf(y, 6, 6, 26, 26, 5)
  }
  for (var k = 0; k < NIV; k++) vrVolees(4, 4, Y(k), VRA, 'polished_andesite')
  // toit : verriere de l'atrium, panneaux solaires, machinerie, antenne
  var yt = Y(NIV)
  for (var x = A1; x <= A2; x++) for (var z = A1; z <= A2; z++) S(x, yt, z, (x - A1) % 4 == 0 || (z - A1) % 4 == 0 ? VRNO : 'minecraft:glass')
  W(3, 3, 28, 28, yt + 1, yt + 1, VRNO)
  W(4, 4, 11, 9, yt + 1, yt + 4, VRA); F(5, yt + 1, 5, 10, yt + 4, 8, AIR); F(4, yt + 5, 4, 11, yt + 5, 9, VRS); PORTE(11, yt + 1, 6, 'minecraft:iron_door', 'east', 'left', 'true')
  for (var x = 5; x <= 27; x++) for (var z = 22; z <= 27; z++) if (z % 2 == 0) S(x, yt + 1, z, 'minecraft:daylight_detector[inverted=false,power=0]')
  for (var x = 21; x <= 27; x++) for (var z = 5; z <= 10; z++) if (z % 2 == 0) S(x, yt + 1, z, 'minecraft:daylight_detector[inverted=false,power=0]')
  F(8, yt + 6, 6, 8, yt + 9, 6, 'minecraft:iron_bars'); S(8, yt + 10, 6, 'minecraft:lightning_rod[facing=up]')
  // entree sud sous auvent, mats, parking nord
  PORTE(15, 1, 28, 'minecraft:iron_door', 'south', 'left', 'false'); PORTE(16, 1, 28, 'minecraft:iron_door', 'south', 'right', 'false')
  F(12, 5, 29, 19, 5, 30, 'minecraft:smooth_stone_slab[type=bottom]')
  ;[[4, 'black'], [6, 'gray']].forEach(m => { F(m[0], 0, 30, m[0], 6, 30, 'minecraft:iron_bars'); F(m[0] + 1, 5, 30, m[0] + 1, 6, 30, 'minecraft:' + m[1] + '_wool') })
  F(0, -1, 0, 31, -1, 1, VRC); bgVoiture(20, 0, 'x', 'black', 0)
}
function vrSiegeRez() {
  W(12, 12, 19, 19, 1, 1, 'minecraft:smooth_stone_slab[type=bottom]'); S(15, 1, 19, AIR); S(16, 1, 19, AIR)
  for (var x = 13; x <= 18; x++) vrCpt(x, 1, 24, 'south', 'quartz_block'); vrCh(14, 1, 23, 'south', 'black'); vrCh(17, 1, 23, 'south', 'black'); S(15, 2, 24, 'handcrafted:stackable_book')
  for (var z = 21; z <= 25; z++) { vrCanape(5, 1, z, 'east', 'black'); vrCanape(26, 1, z, 'west', 'black') }
  vrGueridon(7, 1, 23); vrGueridon(24, 1, 23)
  for (var x = 14; x <= 26; x += 4) { vrTab(x, 1, 7, 'white'); vrCh(x - 1, 1, 7, 'east'); vrCh(x + 1, 1, 7, 'west') }
  ;[[4, 27], [27, 27], [27, 4], [11, 27], [20, 27]].forEach(p => S(p[0], 1, p[1], choix(VRPOT)))
  S(15, 5, 25, 'mcwlights:iron_chandelier'); vrDebris(5, 4, 20, 27, 27, 1)
}
function vrSiegeBureaux(y, k) {
  for (var x = 13; x <= 24; x++) { if ((x - 13) % 4 == 3) continue; vrBur(x, y + 1, 4, 'south'); vrCh(x, y + 1, 5, 'north', 'black'); if (H3(x, y, 4) < 0.4) S(x, y + 2, 4, choix(VRPAP)) }
  for (var z = 6; z <= 24; z++) { if ((z - 6) % 4 == 3) continue; vrBur(27, y + 1, z, 'west'); vrCh(26, y + 1, z, 'east', 'black'); if (H3(27, y, z) < 0.4) S(27, y + 2, z, choix(VRPAP)) }
  for (var x = 6; x <= 24; x++) { if ((x - 6) % 4 == 3) continue; vrBur(x, y + 1, 27, 'north'); vrCh(x, y + 1, 26, 'south', 'black'); if (H3(x, y, 27) < 0.4) S(x, y + 2, 27, choix(VRPAP)) }
  for (var z = 12; z <= 24; z++) { if ((z - 12) % 4 == 3) continue; vrBur(4, y + 1, z, 'east'); vrCh(5, y + 1, z, 'west', 'black'); if (H3(4, y, z) < 0.4) S(4, y + 2, z, choix(VRPAP)) }
  ;[[4, 27], [27, 27], [27, 4], [12, 4], [4, 10]].forEach(p => S(p[0], y + 1, p[1], choix(VRPOT)))
  vrTab(23, y + 1, 15, 'white'); vrTab(23, y + 1, 16, 'white'); vrCh(22, y + 1, 15, 'east'); vrCh(22, y + 1, 16, 'east'); vrCh(24, y + 1, 15, 'west'); vrCh(24, y + 1, 16, 'west')
  if (k == 2) vrDebris(8, 4, 4, 27, 27, y + 1)
}
function vrSiegeDirection(y) {
  F(4, y + 1, 21, 10, y + 5, 21, GP); F(21, y + 1, 21, 27, y + 5, 21, GP); S(7, y + 1, 21, AIR); S(7, y + 2, 21, AIR)
  for (var x = 8; x <= 23; x++) { vrTab(x, y + 1, 24, 'black'); vrCh(x, y + 1, 23, 'south', 'black'); vrCh(x, y + 1, 25, 'north', 'black'); if (x % 4 == 0) S(x, y + 2, 24, choix(VAISS).replace('{I}', 'north')) }
  vrCh(7, y + 1, 24, 'east', 'black'); vrCh(24, y + 1, 24, 'west', 'black')
  vrBur(19, y + 1, 6, 'north'); vrBur(20, y + 1, 6, 'north'); vrCh(19, y + 1, 5, 'south', 'black'); vrCh(18, y + 1, 8, 'north'); vrCh(21, y + 1, 8, 'north'); S(20, y + 2, 6, 'supplementaries:globe[facing=south]')
  for (var z = 6; z <= 9; z++) vrCanape(27, y + 1, z, 'west', 'black'); vrGueridon(25, y + 1, 7)
  for (var z = 13; z <= 18; z++) vrCanape(5, y + 1, z, 'east', 'light_gray'); vrGueridon(7, y + 1, 14); vrGueridon(7, y + 1, 17)
  for (var x = 22; x <= 26; x++) vrCpt(x, y + 1, 13, 'south', 'quartz_block'); S(23, y + 2, 13, 'supplementaries:jar'); S(25, y + 2, 13, 'handcrafted:white_cup')
  ;[[4, 27], [27, 27], [27, 4], [12, 4]].forEach(p => S(p[0], y + 1, p[1], choix(VRPOT)))
}

// ================= STATION DE METRO (bouche, escalier, quais souterrains, rame a quai) =================
function vrMetro() {
  btDalle(0, 0, 31, 31)
  var TU = VRQ, RAILM = 'mcwfences:ornate_metal_fence'
  F(0, -9, 2, 31, -2, 29, 'minecraft:stone')
  // escalier de la bouche (descente vers le sud), joues carrelees
  F(3, -8, 3, 3, -1, 8, TU); F(8, -8, 3, 8, -1, 8, TU); F(4, -8, 2, 7, -2, 2, TU)
  for (var i = 0; i < 6; i++) { var z = 3 + i, ys = -2 - i; F(4, -9, z, 7, ys - 1, z, VRA); F(4, ys, z, 7, ys, z, btSt('polished_andesite', 'north')); F(4, ys + 1, z, 7, -1, z, AIR) }
  F(3, 0, 3, 3, 0, 8, RAILM); F(8, 0, 3, 8, 0, 8, RAILM); F(3, 0, 9, 8, 0, 9, RAILM)
  F(3, 0, 2, 3, 3, 2, 'minecraft:iron_bars'); F(8, 0, 2, 8, 3, 2, 'minecraft:iron_bars'); F(4, 3, 2, 7, 3, 2, 'minecraft:iron_bars'); S(3, 4, 2, 'minecraft:ochre_froglight[axis=y]'); S(8, 4, 2, 'minecraft:ochre_froglight[axis=y]')
  // couloir et tourniquets
  F(3, -7, 9, 8, -2, 11, TU); F(4, -7, 9, 7, -7, 11, VRA); F(4, -6, 9, 7, -3, 11, AIR); S(4, -6, 11, 'minecraft:iron_bars'); S(6, -6, 11, 'minecraft:iron_bars')
  S(5, -3, 10, 'minecraft:lantern[hanging=true]')
  // salle des quais : voute carrelee, deux quais, voies sur ballast, entrees de tunnel
  F(0, -8, 12, 31, -2, 28, TU); F(1, -6, 13, 30, -3, 27, AIR)
  F(1, -7, 13, 30, -7, 16, 'minecraft:light_gray_concrete'); F(1, -7, 24, 30, -7, 27, 'minecraft:light_gray_concrete'); F(1, -7, 16, 30, -7, 16, VRB); F(1, -7, 24, 30, -7, 24, VRB)
  F(1, -7, 17, 30, -7, 23, AIR); F(1, -8, 17, 30, -8, 23, 'minecraft:gravel'); F(0, -7, 19, 31, -7, 19, 'minecraft:rail[shape=east_west]'); F(0, -7, 21, 31, -7, 21, 'minecraft:rail[shape=east_west]')
  F(0, -8, 17, 0, -8, 23, 'minecraft:gravel'); F(31, -8, 17, 31, -8, 23, 'minecraft:gravel')
  F(0, -7, 17, 0, -3, 23, VRNO); F(31, -7, 17, 31, -3, 23, VRNO); S(0, -7, 19, 'minecraft:rail[shape=east_west]'); S(0, -7, 21, 'minecraft:rail[shape=east_west]'); S(31, -7, 19, 'minecraft:rail[shape=east_west]'); S(31, -7, 21, 'minecraft:rail[shape=east_west]')
  F(1, -3, 13, 30, -3, 13, 'minecraft:smooth_quartz_stairs[facing=north,half=top,shape=straight]'); F(1, -3, 27, 30, -3, 27, 'minecraft:smooth_quartz_stairs[facing=south,half=top,shape=straight]')
  F(4, -6, 12, 7, -4, 12, AIR)
  ;[[10, 'light_blue'], [18, 'orange'], [25, 'yellow']].forEach(a => { F(a[0], -5, 12, a[0] + 2, -4, 12, 'minecraft:' + a[1] + '_terracotta'); F(a[0] - 4, -5, 28, a[0] - 2, -4, 28, 'minecraft:' + a[1] + '_terracotta') })
  for (var x = 11; x <= 28; x += 6) F(x, -6, 13, x + 2, -6, 13, btSt('smooth_quartz', 'north'))
  for (var x = 3; x <= 28; x += 5) { S(x, -3, 15, 'minecraft:lantern[hanging=true]'); S(x, -3, 25, 'minecraft:lantern[hanging=true]') }
  // rame a quai (x6..21, voie nord), portes ouvertes cote quai
  for (var x = 6; x <= 21; x++) for (var z = 18; z <= 20; z++) {
    S(x, -7, z, VRC); S(x, -4, z, VRB)
    for (var y = -6; y <= -5; y++) S(x, y, z, x == 6 || x == 21 ? 'minecraft:black_stained_glass' : z == 19 ? AIR : (x - 6) % 3 == 0 ? VRB : 'minecraft:glass_pane')
  }
  F(9, -6, 18, 10, -5, 18, AIR); F(16, -6, 18, 17, -5, 18, AIR); F(7, -6, 19, 20, -6, 19, 'minecraft:blue_carpet')
  // campement sur le quai sud
  for (var x = 4; x <= 12; x += 2) vrLitS(x, -6, 26, choix(['white', 'gray', 'green']), 'south')
  ;[[14, 26], [15, 27], [16, 26], [2, 25], [3, 27]].forEach(p => S(p[0], -6, p[1], choix(['supplementaries:sack', 'minecraft:barrel[facing=up,open=false]', 'farmersdelight:rice_bag'])))
  S(14, -6, 25, 'minecraft:campfire[lit=false,facing=north]'); F(20, -6, 24, 20, -5, 27, 'supplementaries:sack')
  // surface : square, grille d'aeration, ascenseur vitre, kiosque a journaux
  F(14, -1, 22, 17, -1, 23, 'minecraft:iron_trapdoor[facing=north,half=top,open=false]')
  ;[[24, 4], [26, 4], [24, 6], [26, 6]].forEach(p => F(p[0], 0, p[1], p[0], 3, p[1], VRC)); F(25, 0, 4, 25, 3, 4, GP); F(25, 0, 6, 25, 3, 6, GP); F(24, 0, 5, 24, 3, 5, GP); F(26, 0, 5, 26, 2, 5, 'minecraft:iron_bars'); F(24, 4, 4, 26, 4, 6, 'minecraft:smooth_stone_slab[type=bottom]')
  W(25, 9, 28, 12, 0, 2, 'minecraft:green_terracotta'); F(26, 0, 10, 27, 2, 11, AIR); F(25, 1, 10, 25, 1, 11, AIR); F(24, 3, 8, 29, 3, 13, 'minecraft:dark_oak_slab[type=bottom]'); F(26, 0, 10, 26, 0, 11, 'supplementaries:book_pile_horizontal')
  btArbre(12, 27, 5); btArbre(27, 22, 6); btArbre(20, 15, 5); gtBanc(14, 19, 'north', 3); gtBanc(5, 22, 'west', 3)
  bgVoiture(14, 0, 'x', 'red', 1)
}

// ================= PARVIS (fontaine, sculpture, tente d'evacuation, poste de controle) =================
function vrParvis() {
  btDalle(0, 0, 31, 31)
  for (var x = 0; x <= 31; x++) for (var z = 0; z <= 31; z++) { var d = Math.sqrt((x - 15.5) * (x - 15.5) + (z - 13.5) * (z - 13.5)); if (d < 7.5) S(x, -1, z, 'mcwpaths:diorite_crystal_floor') }
  for (var x = 8; x <= 23; x++) for (var z = 6; z <= 21; z++) {
    var d = Math.sqrt((x - 15.5) * (x - 15.5) + (z - 13.5) * (z - 13.5))
    if (d < 4.6 && d >= 3.6) S(x, 0, z, VRQ); else if (d < 3.6) { S(x, -1, z, VRA); S(x, 0, z, 'minecraft:water') }
  }
  F(15, 0, 13, 16, 4, 14, 'minecraft:oxidized_copper'); F(14, 5, 13, 15, 6, 14, 'minecraft:weathered_copper'); F(15, 7, 13, 16, 8, 14, 'minecraft:oxidized_cut_copper'); F(16, 9, 13, 17, 10, 14, 'minecraft:weathered_cut_copper')
  ;[[13, 12], [18, 15]].forEach(p => S(p[0], 1, p[1], 'minecraft:lily_pad'))
  gtBanc(7, 12, 'west', 4); gtBanc(24, 12, 'east', 4); gtBanc(14, 5, 'north', 4)
  // bacs plantes (nord)
  ;[[4, 4], [27, 4]].forEach(p => { W(p[0] - 2, p[1] - 2, p[0] + 2, p[1] + 2, 0, 0, VRA); F(p[0] - 1, -1, p[1] - 1, p[0] + 1, -1, p[1] + 1, 'minecraft:grass_block'); btArbre(p[0], p[1], 6); SA(p[0] + 1, 0, p[1] - 1, 'minecraft:short_grass') })
  // tente d'evacuation (sud-est) sur plancher
  F(17, -1, 20, 29, -1, 28, 'minecraft:spruce_planks')
  var PR = [[21, 0, 1], [22, 1, 2], [23, 2, 3], [24, 3, 4], [25, 2, 3], [26, 1, 2], [27, 0, 1]]
  for (var x = 18; x <= 28; x++) PR.forEach(p => F(x, p[1], p[0], x, p[2], p[0], 'minecraft:white_wool'))
  ;[18, 28].forEach(x => { F(x, 0, 22, x, 0, 26, 'minecraft:white_wool'); F(x, 1, 23, x, 1, 25, 'minecraft:white_wool'); F(x, 2, 24, x, 2, 24, 'minecraft:white_wool') })
  F(28, 0, 23, 28, 1, 25, AIR)
  S(18, 1, 24, 'minecraft:red_wool'); S(18, 0, 24, 'minecraft:red_wool'); S(18, 2, 24, 'minecraft:red_wool'); S(18, 1, 23, 'minecraft:red_wool'); S(18, 1, 25, 'minecraft:red_wool')
  for (var x = 19; x <= 27; x += 2) { vrLitS(x, 0, 23, choix(['white', 'light_gray']), 'north'); vrLitS(x, 0, 25, choix(['white', 'light_gray']), 'south') }
  ;[[29, 21], [29, 22], [17, 28], [18, 29], [29, 27]].forEach(p => S(p[0], 0, p[1], choix(['minecraft:barrel[facing=up,open=false]', 'supplementaries:sack', 'farmersdelight:rice_bag'])))
  S(29, 0, 24, 'minecraft:water_cauldron[level=3]'); S(29, 1, 22, 'supplementaries:sack')
  // poste de controle cote boulevard : sacs, barbele, vehicules militaires
  for (var x = 2; x <= 12; x++) { S(x, 0, 1, 'supplementaries:sack'); if (x % 3) S(x, 1, 1, 'supplementaries:sack'); S(x, 0, 0, 'simply_traps:circular_barbed_wire_iron[facing=north]') }
  bgVoiture(3, 22, 'z', 'green', 0); bgVoiture(8, 24, 'z', 'green', 1)
  btLampe(1, 16, 'east'); btLampe(30, 16, 'west')
}

// ================= BRASSERIE (pavillon vitre, terrasse a parasols) =================
function vrBrasserie() {
  btDalle(0, 0, 31, 31)
  var X1 = 4, X2 = 27, Z1 = 9, Z2 = 26
  F(X1, 0, Z1, X2, 0, Z2, 'minecraft:dark_oak_planks'); W(X1, Z1, X2, Z2, 0, 0, VRNO)
  vrMurRideau(X1, Z1, X2, Z2, 1, 5, 3, GP, VRNO)
  F(X1 - 1, 6, Z1 - 1, X2 + 1, 6, Z2 + 1, VRS); W(X1 - 1, Z1 - 1, X2 + 1, Z2 + 1, 6, 6, VRNO); W(X1 - 1, Z1 - 1, X2 + 1, Z2 + 1, 7, 7, VRNO)
  PORTE(15, 1, Z1, 'minecraft:iron_door', 'north', 'left', 'true'); PORTE(16, 1, Z1, 'minecraft:iron_door', 'north', 'right', 'false')
  // cuisine (sud) derriere une cloison a passe-plat
  F(X1 + 1, 1, 20, X2 - 1, 5, 20, VRB); F(10, 2, 20, 14, 2, 20, AIR); S(20, 1, 20, AIR); S(20, 2, 20, AIR)
  for (var x = 10; x <= 14; x++) S(x, 1, 20, 'handcrafted:birch_counter[counter=smooth_stone,facing=north,type=1]')
  for (var x = 5; x <= 26; x++) { var b = x % 6 == 2 ? 'farmersdelight:stove[facing=north,lit=false]' : x % 6 == 4 ? 'minecraft:smoker[facing=north,lit=false]' : 'handcrafted:birch_counter[counter=smooth_stone,facing=north,type=1]'; S(x, 1, 25, b); if (x % 6 == 2) S(x, 2, 25, 'farmersdelight:cooking_pot') }
  for (var x = 9; x <= 16; x++) S(x, 1, 22, 'handcrafted:birch_counter[counter=smooth_stone,facing=south,type=1]'); S(11, 2, 22, 'farmersdelight:cutting_board[facing=north]'); S(14, 2, 22, 'supplementaries:jar')
  F(23, 1, 21, 24, 2, 21, 'minecraft:iron_block'); S(22, 1, 23, 'minecraft:barrel[facing=up,open=false]'); S(5, 1, 21, 'minecraft:water_cauldron[level=1]')
  // bar (est) et salle
  for (var z = 12; z <= 17; z++) { vrCpt(23, 1, z, 'west', 'dark_oak_planks'); vrCh(22, 1, z, 'east', 'red'); vrEtag(26, 1, z, 'west'); vrEtag(26, 2, z, 'west'); if (R() < 0.5) S(26, 3, z, 'supplementaries:jar') }
  S(23, 2, 13, 'handcrafted:white_cup'); S(23, 2, 16, 'supplementaries:jar')
  for (var x = 6; x <= 18; x += 4) for (var z = 11; z <= 17; z += 3) {
    vrTab(x, 1, z, 'white'); var tombe = H3(x, 1, z) < 0.25
    vrCh(x, 1, z - 1, tombe ? 'east' : 'south', 'red'); vrCh(x, 1, z + 1, 'north', 'red'); if (!tombe) S(x, 2, z, choix(VAISS).replace('{I}', 'north'))
  }
  ;[[10, 13], [18, 16]].forEach(p => S(p[0], 5, p[1], 'mcwlights:iron_chandelier'))
  vrDebris(4, 5, 10, 21, 18, 1)
  // terrasse sur caillebotis, jardinieres en haie, parasols
  F(4, -1, 1, 27, -1, 7, 'minecraft:spruce_planks')
  for (var x = 4; x <= 27; x++) { if (x == 15 || x == 16) continue; S(x, 0, 1, 'supplementaries:planter[extended=false]'); S(x, 1, 1, 'minecraft:oak_leaves[persistent=true]') }
  ;[6, 12, 19, 25].forEach(px => {
    F(px, 0, 4, px, 2, 4, 'minecraft:iron_bars'); F(px - 1, 3, 3, px + 1, 3, 5, 'minecraft:red_wool')
    vrTab(px - 1, 0, 4, 'white'); vrTab(px + 1, 0, 4, 'white'); vrCh(px - 2, 0, 4, 'east', 'red'); vrCh(px + 2, 0, 4, H3(px, 0, 4) < 0.4 ? 'north' : 'west', 'red')
  })
  // toit : extraction, clim ; arriere : poubelles, caisses
  F(8, 7, 22, 9, 8, 23, VRC); S(8, 9, 22, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false]'); S(9, 9, 22, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false]'); S(8, 9, 23, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false]'); S(9, 9, 23, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false]')
  ;[[6, 29], [7, 29], [24, 29]].forEach(p => S(p[0], 0, p[1], 'minecraft:composter')); S(25, 0, 29, 'farmersdelight:cabbage_crate'); S(26, 0, 29, 'farmersdelight:tomato_crate')
}

// ================= CLINIQUE R+2 (accueil, consultations, chambres, ambulance) =================
function vrClinique() {
  var NIV = 3, Y = k => 6 * k
  btDalle(0, 0, 31, 31)
  for (var k = 0; k <= NIV; k++) { var y = Y(k); F(4, y, 4, 27, y, 27, k == 0 ? VRQ : VRS); W(4, 4, 27, 27, y, y, 'minecraft:light_blue_concrete') }
  for (var k = 0; k < NIV; k++) {
    var y = Y(k)
    W(4, 4, 27, 27, y + 1, y + 5, VRB)
    ;[[6, 8], [12, 14], [18, 19], [23, 25]].forEach(w => { F(w[0], y + 2, 4, w[1], y + 4, 4, GP); F(w[0], y + 2, 27, w[1], y + 4, 27, GP) })
    for (var z = 13; z <= 18; z++) if (z != 15 && z != 16) { F(4, y + 2, z, 4, y + 4, z, GP); F(27, y + 2, z, 27, y + 4, z, GP) }
    vrCage(12, 13, y, VRA); PORTE(12, y + 1, 15, 'minecraft:iron_door', 'west', 'left', 'false'); PORTE(19, y + 1, 16, 'minecraft:iron_door', 'east', 'left', 'false')
    if (k == 0) vrCliniqueRez(); else vrCliniqueEtage(y, k)
    vrPlaf(y, 6, 6, 26, 26, 4)
  }
  for (var k = 0; k < NIV; k++) vrVolees(12, 13, Y(k), VRA, 'polished_andesite')
  var yt = Y(NIV)
  W(4, 4, 27, 27, yt + 1, yt + 1, VRB); W(12, 13, 19, 18, yt + 1, yt + 4, VRA); F(13, yt + 1, 14, 18, yt + 4, 17, AIR); F(12, yt + 5, 13, 19, yt + 5, 18, VRS); PORTE(12, yt + 1, 15, 'minecraft:iron_door', 'west', 'left', 'true')
  F(22, yt + 1, 7, 24, yt + 3, 9, 'minecraft:iron_block'); F(6, yt + 1, 22, 8, yt + 2, 23, VRC); F(6, yt + 3, 22, 8, yt + 3, 23, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false]')
  // croix rouge dressee sur l'acrotere nord (au-dessus de l'entree)
  F(15, yt + 2, 4, 16, yt + 5, 4, 'minecraft:red_concrete'); F(14, yt + 3, 4, 17, yt + 4, 4, 'minecraft:red_concrete')
  // auvent des urgences et ambulance
  PORTE(15, 1, 4, 'minecraft:iron_door', 'north', 'left', 'true'); PORTE(16, 1, 4, 'minecraft:iron_door', 'north', 'right', 'false')
  F(11, 5, 0, 20, 5, 3, 'minecraft:smooth_stone_slab[type=bottom]'); F(11, 0, 0, 11, 4, 0, VRB); F(20, 0, 0, 20, 4, 0, VRB)
  for (var x = 13; x <= 18; x++) for (var z = 1; z <= 2; z++) {
    S(x, 0, z, x == 13 || x == 17 ? VRNO : VRB); S(x, 1, z, x == 13 ? 'minecraft:light_blue_stained_glass' : x == 18 ? VRB : 'minecraft:red_concrete'); S(x, 2, z, VRB)
  }
  S(14, 3, 1, 'minecraft:blue_stained_glass'); S(14, 3, 2, 'minecraft:red_stained_glass')
  // parking sud, cloture, groupe electrogene
  F(0, -1, 29, 31, -1, 31, VRC); bgVoiture(4, 29, 'x', 'white', 1); bgVoiture(22, 29, 'x', 'gray', 2)
  F(1, 0, 28, 3, 1, 28, VRC); S(2, 2, 28, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false]')
}
function vrCliniqueRez() {
  // accueil (nord), attente (ouest), consultations (est)
  for (var x = 13; x <= 18; x++) if (x != 15 && x != 16) vrCpt(x, 1, 8, 'north', 'quartz_block')
  vrCh(14, 1, 9, 'north'); vrCh(17, 1, 9, 'north'); S(13, 2, 8, 'handcrafted:stackable_book'); S(18, 2, 8, 'supplementaries:jar')
  for (var z = 7; z <= 25; z += 2) { if (z >= 13 && z <= 18) continue; for (var x = 6; x <= 9; x++) vrCh(x, 1, z, 'east', 'light_blue') }
  F(21, 1, 11, 26, 5, 11, VRB); F(21, 1, 20, 26, 5, 20, VRB); F(21, 1, 12, 21, 5, 19, VRB); F(24, 1, 12, 24, 5, 19, VRB)
  PORTE(21, 1, 13, 'minecraft:birch_door', 'west', 'left', 'false'); S(24, 1, 16, AIR); S(24, 2, 16, AIR)
  vrLitS(22, 1, 18, 'white', 'south'); vrArm(23, 1, 12, 'south'); vrCh(23, 1, 17, 'west')
  vrLitS(25, 1, 18, 'white', 'south'); vrBur(26, 1, 14, 'west'); vrCh(25, 1, 14, 'east'); S(26, 1, 12, 'minecraft:brewing_stand')
  for (var x = 21; x <= 26; x++) { if (x == 23) continue; vrCpt(x, 1, 26, 'north', 'quartz_block') } S(22, 2, 26, 'supplementaries:jar'); S(25, 2, 26, 'minecraft:brewing_stand')
  F(5, 1, 26, 9, 1, 26, 'handcrafted:birch_cupboard[facing=north,type=1]')
  S(15, 5, 7, 'mcwlights:iron_chandelier'); vrDebris(6, 5, 5, 11, 26, 1); S(10, 1, 15, 'supplementaries:sack')
}
function vrCliniqueEtage(y, k) {
  // chambres nord (z5..9) et sud (z22..26), couloirs z10..12 et z19..21
  F(5, y + 1, 10, 26, y + 5, 10, VRB); F(5, y + 1, 21, 26, y + 5, 21, VRB)
  ;[10, 16, 21].forEach(x => { F(x, y + 1, 5, x, y + 5, 9, VRB); F(x, y + 1, 22, x, y + 5, 26, VRB) })
  ;[[5, 9], [11, 15], [17, 20], [22, 26]].forEach((b, i) => {
    var cx = b[0] + 1, et = (k + i) % 3 == 0
    S(b[1] - 1, y + 1, 10, AIR); S(b[1] - 1, y + 2, 10, AIR); S(b[1] - 1, y + 1, 21, AIR); S(b[1] - 1, y + 2, 21, AIR)
    vrLitS(cx, y + 1, 6, 'white', 'north'); vrLitS(cx, y + 1, 25, 'white', 'south')
    F(cx + 1, y + 1, 5, cx + 1, y + 2, 5, 'minecraft:iron_bars'); F(cx + 1, y + 1, 26, cx + 1, y + 2, 26, 'minecraft:iron_bars')
    vrGueridon(cx - 1 >= b[0] ? cx - 1 : cx + 2, y + 1, 5); vrCh(cx + 2, y + 1, 8, 'west', 'light_blue'); vrCh(cx + 2, y + 1, 23, 'west', 'light_blue')
    if (et) { S(cx, y + 1, 8, 'supplementaries:sack'); S(cx + 1, y + 1, 23, 'supplementaries:book_pile_horizontal') }
  })
  // poste infirmier et reserve (zones laterales)
  for (var z = 12; z <= 19; z++) { if (z == 15 || z == 16) continue; vrArm(5, y + 1, z, 'east') }
  for (var z = 13; z <= 18; z++) { if (z == 16) continue; vrCpt(24, y + 1, z, 'west', 'quartz_block') } vrCh(25, y + 1, 14, 'west'); S(24, y + 2, 15, 'supplementaries:jar'); S(24, y + 2, 17, 'handcrafted:stackable_book')
  if (k == 2) vrDebris(5, 5, 11, 26, 20, y + 1)
}

// ---- palette, vues et lancement du quartier de verre ----
var THM_VR = finPalette('birch', {})
function vuesVerre() {
  vue('vr_ensemble_sud', 0, 0, 64, 70, 132, 64, 18, 34, 3000)
  vue('vr_ensemble_no', 0, 0, -34, 74, -34, 64, 14, 40, 3000)
  vue('vr_bd_ouest', 0, 0, -8, 4, 36.5, 60, 6, 40)
  vue('vr_bd_est', 0, 0, 136, 4, 43.5, 60, 6, 40)
  vue('vr_tram', 0, 0, 60, 3, 44.5, 72, 2, 39.5)
  vue('vr_arret_tram', 0, 0, 94, 3, 36, 88, 2, 40)
  vue('vr_tour', 0, 0, 16, 44, 74, 16, 34, 16)
  vue('vr_tour_pied', 0, 0, 22, 3, 41, 16, 6, 27)
  vue('vr_tour_toit', 0, 0, 36, 80, 42, 16, 68, 14)
  vue('vr_tour_nacelle', 0, 0, 14, 42, 38, 9, 40, 28)
  vue('vr_hotel', 0, 0, 48, 28, 66, 48, 24, 16)
  vue('vr_hotel_entree', 0, 0, 54, 3, 40, 50, 4, 26)
  vue('vr_hotel_toit', 0, 0, 62, 58, 34, 50, 48, 12)
  vue('vr_galerie', 0, 0, 80, 9, 46, 80, 6, 20)
  vue('vr_galerie_mail', 0, 0, 79.5, 3, 27, 79.5, 4, 6)
  vue('vr_galerie_haut', 0, 0, 76.5, 9, 27, 80, 8, 6)
  vue('vr_siege', 0, 0, 112, 20, 64, 112, 15, 16)
  vue('vr_siege_atrium', 0, 0, 108.5, 26, 16.5, 112, 1, 17)
  vue('vr_siege_toit', 0, 0, 126, 44, 40, 112, 30, 14)
  vue('vr_metro_bouche', 0, 48, 5.5, 4, -6, 5.5, -3, 6)
  vue('vr_metro_quai', 0, 48, 2, -5, 14.5, 28, -5.5, 19)
  vue('vr_metro_rame', 0, 48, 28, -5, 25.5, 12, -5.5, 18)
  vue('vr_parvis', 32, 48, 16, 14, -8, 16, 1, 16)
  vue('vr_parvis_tente', 32, 48, 30, 4, 18, 22, 1, 24)
  vue('vr_brasserie', 64, 48, 16, 7, -8, 16, 2, 10)
  vue('vr_brasserie_salle', 64, 48, 6, 3, 11, 20, 2, 18)
  vue('vr_clinique', 96, 48, 16, 9, -10, 16, 6, 6)
  vue('vr_coupe_tour_plateau', 144, 0, 16, 28, 44, 16, 8, 16)
  vue('vr_coupe_tour_bureaux', 180, 0, 16, 34, 44, 16, 14, 16)
  vue('vr_coupe_tour_refuge', 216, 0, 16, 58, 44, 16, 38, 16)
  vue('vr_coupe_hotel', 252, 0, 16, 28, 42, 16, 8, 15)
  vue('vr_coupe_galerie', 288, 0, 16, 24, 40, 16, 2, 15)
  vue('vr_coupe_siege', 324, 0, 16, 28, 42, 16, 8, 15)
  vue('vr_coupe_metro', 144, 48, 16, 14, 40, 16, -7, 18)
  vue('vr_coupe_brasserie', 180, 48, 16, 22, 40, 16, 0, 16)
  vue('vr_coupe_clinique', 216, 48, 16, 28, 42, 16, 8, 15)
}
var QFIN_VR = function () {
  HB2 = true; FIN = true; THM = THM_VR
  var rh = ['white', 'light_gray', 'gray', 'light_blue'], rc = ['white', 'light_blue']
  HM = {}; vrRue(); finAncrage()
  lot(QF(vrTour, null, null), 0, 0, 999, 711, 32, 76); lot(QF(vrHotel, null, rh), 32, 0, 999, 721, 32, 58); lot(QF(vrGalerie, null, null), 64, 0, 999, 731, 32, 18); lot(QF(vrSiege, null, null), 96, 0, 999, 741, 32, 42)
  lot(QF(vrMetro, null, null), 0, 48, 999, 751, 32, 8); lot(QF(vrParvis, null, null), 32, 48, 999, 761, 32, 12); lot(QF(vrBrasserie, null, null), 64, 48, 999, 771, 32, 10); lot(QF(vrClinique, null, rc), 96, 48, 999, 781, 32, 22)
  lot(QF(vrTour, null, null), 144, 0, 9, 711, 32, 76); lot(QF(vrTour, null, null), 180, 0, 15, 711, 32, 76); lot(QF(vrTour, null, null), 216, 0, 39, 711, 32, 76)
  lot(QF(vrHotel, null, rh), 252, 0, 9, 721, 32, 58); lot(QF(vrGalerie, null, null), 288, 0, 4, 731, 32, 18); lot(QF(vrSiege, null, null), 324, 0, 9, 741, 32, 42)
  lot(QF(vrMetro, null, null), 144, 48, -3, 751, 32, 8); lot(QF(vrBrasserie, null, null), 180, 48, 4, 771, 32, 10); lot(QF(vrClinique, null, rc), 216, 48, 9, 781, 32, 22)
  vlog('FIN volets ' + FIN_NV + ' rideaux ' + FIN_NR + ' paves ' + PAVE_NB + ' retraits ancrage ' + ANC_NB)
  HB2 = false; FIN = false; THM = null; HM = {}
}
