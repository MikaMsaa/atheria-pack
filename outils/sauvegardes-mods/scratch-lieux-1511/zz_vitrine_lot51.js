// ================= QUARTIER DE VERRE, SERIE 2 : banque, residence, concession, bibliotheque universitaire, centre de donnees, centre aquatique, parking a etages, restauration rapide, gare routiere =================
var V2BZ = 'minecraft:brown_stained_glass_pane', V2PL = 'minecraft:light_gray_concrete', V2GR = 'mcwfences:ornate_metal_fence'
// rangee de bureaux en ilots (deux postes face a face), entre x1..x2 / z1..z2
function v2Ilots(y, x1, z1, x2, z2, col) {
  for (var x = x1; x + 1 <= x2; x += 4) for (var z = z1; z + 2 <= z2; z += 4) {
    vrBur(x, y + 1, z, 'north'); vrBur(x + 1, y + 1, z, 'north'); vrBur(x, y + 1, z + 1, 'south'); vrBur(x + 1, y + 1, z + 1, 'south')
    vrCh(x, y + 1, z - 1, 'south', col); vrCh(x + 1, y + 1, z - 1, 'south', col); vrCh(x, y + 1, z + 2, 'north', col); vrCh(x + 1, y + 1, z + 2, 'north', col)
    if (H3(x, y, z) < 0.5) S(x, y + 2, z, choix(VRPAP)); if (H3(x + 1, y, z + 1) < 0.3) S(x + 1, y + 2, z + 1, 'minecraft:black_stained_glass_pane')
  }
}
// sortie d'escalier en toiture (meme trace que vrCage)
function v2Edicule(cx, cz, yt) { W(cx, cz, cx + 7, cz + 5, yt + 1, yt + 4, VRA); F(cx + 1, yt + 1, cz + 1, cx + 6, yt + 4, cz + 4, AIR); F(cx, yt + 5, cz, cx + 7, yt + 5, cz + 5, VRS); PORTE(cx + 7, yt + 1, cz + 2, 'minecraft:iron_door', 'east', 'left', 'true') }
// autocar : 10 de long selon x, 3 de large
function v2Car(x, z, c, brule) {
  var co = brule ? 'minecraft:black_concrete' : 'minecraft:' + c + '_concrete', vi = brule ? 'minecraft:coal_block' : 'minecraft:black_stained_glass'
  F(x, 0, z, x + 9, 0, z + 2, co); F(x, 1, z, x + 9, 2, z + 2, vi); F(x, 3, z, x + 9, 3, z + 2, brule ? co : 'minecraft:white_concrete')
  for (var u = 0; u <= 9; u += 3) { S(x + u, 1, z, co); S(x + u, 1, z + 2, co) }
  F(x + 1, 1, z + 1, x + 8, 2, z + 1, brule ? 'minecraft:cobweb' : AIR); F(x + 1, 1, z + 1, x + 8, 1, z + 1, brule ? 'minecraft:cobweb' : 'minecraft:gray_carpet')
  if (!brule) { S(x + 2, 1, z + 2, AIR); S(x + 2, 2, z + 2, AIR) }
  ;[1, 8].forEach(u => { S(x + u, 0, z - 1, 'minecraft:polished_blackstone_button[face=wall,facing=north]'); S(x + u, 0, z + 3, 'minecraft:polished_blackstone_button[face=wall,facing=south]') })
}

// ================= BANQUE (R+3, verre bronze, salle des guichets, salle des marches, coffres au sous-sol) =================
function vrBanque() {
  var NIV = 4, Y = k => 6 * k, CX = 4, CZ = 5
  btDalle(0, 0, 31, 31)
  // sous-sol : coffres
  F(3, -8, 4, 28, -1, 27, VRA); F(4, -7, 5, 27, -7, 26, V2PL); F(4, -6, 5, 27, -1, 26, AIR)
  W(14, 13, 25, 24, -6, -1, 'minecraft:iron_block'); PORTE(14, -6, 18, 'minecraft:iron_door', 'west', 'left', 'true'); S(13, -6, 17, 'minecraft:iron_block'); S(13, -6, 20, 'minecraft:iron_block')
  for (var z = 14; z <= 23; z++) { S(15, -6, z, 'supplementaries:safe[facing=east,open=' + (H3(15, -6, z) < 0.6) + ']'); S(24, -6, z, 'supplementaries:safe[facing=west,open=' + (H3(24, -6, z) < 0.6) + ']'); S(15, -5, z, 'supplementaries:safe[facing=east,open=false]'); S(24, -5, z, 'supplementaries:safe[facing=west,open=false]') }
  vrTab(19, -6, 18); vrTab(20, -6, 18); ;[[17, 16], [22, 16], [17, 21], [22, 21]].forEach(p => S(p[0], -1, p[1], 'minecraft:lantern[hanging=true]')); S(19, -5, 18, 'supplementaries:sack'); vrDebris(4, 16, 14, 23, 23, -6)
  for (var x = 6; x <= 26; x += 5) for (var z = 8; z <= 24; z += 8) if ((x < 13 || x > 26 || z < 12 || z > 25) && !(x >= 20 && z == 8)) S(x, -1, z, 'minecraft:lantern[hanging=true]')
  for (var z = 6; z <= 25; z++) if (z % 4 == 0) S(4, -6, z, 'minecraft:barrel[facing=up,open=false]')
  for (var k = 0; k <= NIV; k++) { var y = Y(k); F(3, y, 4, 28, y, 27, k == 0 ? VRQ : k == NIV ? VRS : V2PL); W(3, 4, 28, 27, y, y, 'minecraft:polished_deepslate') }
  // descente vers les coffres (volee vers l'est), garde-corps
  for (var i = 0; i < 7; i++) { var x = 20 + i; if (i < 6) F(x, -7, 7, x, -1 - i, 8, VRA); S(x, -i, 7, btSt('polished_andesite', 'west')); S(x, -i, 8, btSt('polished_andesite', 'west')); if (i > 0) F(x, 1 - i, 7, x, 0, 8, AIR) }
  F(20, 1, 6, 27, 1, 6, V2GR); F(20, 1, 9, 27, 1, 9, V2GR); F(27, 1, 7, 27, 1, 8, V2GR)
  for (var k = 0; k < NIV; k++) {
    var y = Y(k)
    vrMurRideau(3, 4, 28, 27, y + 1, y + 5, 3, V2BZ, VRQ)
    vrCage(CX, CZ, y, VRA); PORTE(CX + 7, y + 1, CZ + 2, 'minecraft:iron_door', 'east', 'left', 'false')
    if (k == 0) vrBanqueGuichets(); else if (k == NIV - 1) vrBanqueMarches(y); else { v2Ilots(y, 14, 7, 26, 25, 'black'); for (var z = 12; z <= 25; z += 3) { vrArm(4, y + 1, z, 'east') } }
    vrPlaf(y, 6, 6, 26, 26, 5)
  }
  for (var k = 0; k < NIV; k++) vrVolees(CX, CZ, Y(k), VRA, 'polished_andesite')
  var yt = Y(NIV)
  W(3, 4, 28, 27, yt + 1, yt + 1, 'minecraft:polished_deepslate'); v2Edicule(CX, CZ, yt)
  for (var x = 14; x <= 27; x++) for (var z = 14; z <= 26; z++) if (z % 2 == 0) S(x, yt + 1, z, 'minecraft:daylight_detector[inverted=false,power=0]')
  F(22, yt + 1, 6, 26, yt + 2, 10, 'minecraft:iron_block'); F(22, yt + 3, 6, 26, yt + 3, 10, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false]')
  F(8, yt + 6, 7, 8, yt + 9, 7, 'minecraft:iron_bars'); S(8, yt + 10, 7, 'minecraft:lightning_rod[facing=up]')
  // entree, distributeurs en facade, auvent, bornes anti-belier
  PORTE(15, 1, 27, 'minecraft:iron_door', 'south', 'left', 'true'); PORTE(16, 1, 27, 'minecraft:iron_door', 'south', 'right', 'false')
  ;[6, 9].forEach(x => { S(x, 1, 27, VRQ); S(x, 2, 27, 'minecraft:dropper[facing=south,triggered=false]'); S(x, 3, 27, 'minecraft:polished_deepslate') })
  F(12, 5, 28, 19, 5, 29, 'minecraft:smooth_quartz_slab[type=bottom]')
  for (var x = 2; x <= 29; x += 3) if (x < 12 || x > 19) S(x, 0, 30, 'minecraft:andesite_wall')
  btLampe(1, 29, 'east'); btLampe(30, 29, 'west'); bgVoiture(20, 0, 'x', 'gray', 1); bgVoiture(4, 0, 'x', 'white', 0)
}
function vrBanqueGuichets() {
  // guichets vitres (cote clients au sud), passage de service a l'ouest
  for (var x = 13; x <= 26; x++) { vrCpt(x, 1, 14, 'south', 'quartz_block'); if ((x - 13) % 3 != 1) F(x, 2, 14, x, 3, 14, GP) }
  F(4, 1, 14, 11, 3, 14, GP); PORTE(12, 1, 14, 'minecraft:iron_door', 'south', 'left', 'true')
  for (var x = 13; x <= 26; x++) if ((x - 13) % 3 == 1) vrCh(x, 1, 13, 'south', 'black')
  for (var x = 13; x <= 18; x++) { vrBur(x, 1, 11, 'south'); if (x % 2) S(x, 2, 11, choix(VRPAP)) }
  vrArm(27, 1, 11, 'west'); vrArm(27, 1, 12, 'west')
  // file d'attente, attente, presentoirs
  F(14, 1, 18, 24, 1, 18, V2GR); F(14, 1, 21, 24, 1, 21, V2GR)
  for (var z = 17; z <= 24; z++) vrCanape(4, 1, z, 'east', 'black'); vrGueridon(6, 1, 20)
  ;[[4, 26], [27, 26], [27, 16], [11, 26]].forEach(p => S(p[0], 1, p[1], choix(VRPOT)))
  for (var z = 23; z <= 25; z++) vrEtag(27, 1, z, 'west')
  S(15, 5, 22, 'mcwlights:iron_chandelier'); vrDebris(7, 5, 15, 26, 26, 1)
}
function vrBanqueMarches(y) {
  // salle des marches : rangees d'ecrans face au nord
  for (var z = 12; z <= 24; z += 4) for (var x = 13; x <= 26; x++) { vrBur(x, y + 1, z, 'south'); vrCh(x, y + 1, z + 1, 'north', 'black'); S(x, y + 2, z, 'minecraft:black_stained_glass_pane') }
  // bureau du directeur (verriere)
  F(4, y + 1, 12, 11, y + 5, 12, GP); F(11, y + 1, 12, 11, y + 5, 26, GP); PORTE(11, y + 1, 15, 'minecraft:iron_door', 'west', 'left', 'false')
  vrBur(6, y + 1, 20, 'west'); vrBur(6, y + 1, 21, 'west'); vrCh(5, y + 1, 20, 'east', 'black'); vrCh(8, y + 1, 20, 'west'); vrCh(8, y + 1, 21, 'west'); S(6, y + 2, 21, 'supplementaries:globe[facing=east]')
  for (var z = 23; z <= 26; z++) vrCanape(4, y + 1, z, 'east', 'black'); vrArm(10, y + 1, 26, 'north'); S(10, y + 1, 14, choix(VRPOT))
  for (var x = 13; x <= 26; x += 4) S(x, y + 1, 26, choix(VRPOT)); vrDebris(6, 13, 12, 26, 26, y + 1)
}

// ================= RESIDENCE (R+8, deux appartements par palier, balcons filants) =================
function vrResidence() {
  var NIV = 9, Y = k => 6 * k, CX = 7, CZ = 6
  btDalle(0, 0, 31, 31)
  for (var k = 0; k <= NIV; k++) { var y = Y(k); F(6, y, 5, 25, y, 24, k == 0 ? VRA : k == NIV ? VRS : V2PL); W(6, 5, 25, 24, y, y, VRB) }
  for (var k = 0; k < NIV; k++) {
    var y = Y(k)
    if (k == 0) vrMurRideau(6, 5, 25, 24, 1, 5, 3, VRN, VRNO)
    else { W(6, 5, 25, 24, y + 1, y + 1, VRB); W(6, 5, 25, 24, y + 5, y + 5, VRB); vrMurRideau(6, 5, 25, 24, y + 2, y + 4, 4, VRV, VRB) }
    vrCage(CX, CZ, y, VRA); PORTE(CX + 7, y + 1, CZ + 2, 'minecraft:iron_door', 'east', 'left', 'false')
    // gaine d'ascenseur fermee, mur du palier
    W(21, 6, 24, 9, y + 1, y + 5, VRC); F(22, y + 1, 7, 23, y + 5, 8, AIR); PORTE(21, y + 1, 8, 'minecraft:iron_door', 'west', 'left', 'false')
    F(7, y + 1, 12, 24, y + 5, 12, VRB)
    if (k == 0) vrResidenceHall()
    else {
      PORTE(15, y + 1, 12, 'minecraft:birch_door', 'south', 'left', 'false'); PORTE(21, y + 1, 12, 'minecraft:birch_door', 'south', 'right', 'false')
      F(16, y + 1, 13, 16, y + 5, 23, VRB)
      vrAppart(7, 15, y, k, 0); vrAppart(17, 24, y, k, 1)
      // balcon filant au sud, garde-corps vitre, separation
      F(6, y, 25, 25, y, 26, VRS); F(6, y + 1, 26, 25, y + 1, 26, GP); S(6, y + 1, 25, GP); S(25, y + 1, 25, GP); F(16, y + 1, 25, 16, y + 2, 25, VRB)
      ;[[8, 'a'], [18, 'b']].forEach(b => { if (H3(b[0], y, 25) < 0.6) S(b[0], y + 1, 25, choix(VRPOT)); if (H3(b[0] + 3, y, 25) < 0.4) vrCh(b[0] + 3, y + 1, 25, 'south', 'white') })
    }
    vrPlaf(y, 9, 14, 24, 23, 4)
  }
  for (var k = 0; k < NIV; k++) vrVolees(CX, CZ, Y(k), VRA, 'polished_andesite')
  var yt = Y(NIV)
  W(6, 5, 25, 24, yt + 1, yt + 1, VRB); v2Edicule(CX, CZ, yt)
  // machinerie d'ascenseur, chateau d'eau de toiture, antenne sur mat
  F(21, yt + 1, 6, 24, yt + 3, 9, VRC)
  F(17, yt + 1, 16, 17, yt + 2, 16, 'minecraft:iron_bars'); F(22, yt + 1, 16, 22, yt + 2, 16, 'minecraft:iron_bars'); F(17, yt + 1, 21, 17, yt + 2, 21, 'minecraft:iron_bars'); F(22, yt + 1, 21, 22, yt + 2, 21, 'minecraft:iron_bars'); F(17, yt + 3, 16, 22, yt + 6, 21, 'minecraft:light_gray_terracotta')
  F(10, yt + 1, 20, 10, yt + 6, 20, 'minecraft:iron_bars'); F(9, yt + 4, 20, 11, yt + 4, 20, 'minecraft:iron_bars'); S(10, yt + 7, 20, 'minecraft:lightning_rod[facing=up]')
  for (var x = 8; x <= 14; x++) if (x % 2 == 0) S(x, yt + 1, 15, 'minecraft:daylight_detector[inverted=false,power=0]')
  // entree sous marquise, local poubelles, square
  PORTE(15, 1, 24, 'minecraft:iron_door', 'south', 'left', 'false'); PORTE(16, 1, 24, 'minecraft:iron_door', 'south', 'right', 'true')
  W(26, 26, 30, 30, 0, 2, VRC); F(27, 0, 27, 29, 2, 29, AIR); F(26, 0, 28, 26, 1, 28, AIR); F(26, 3, 26, 30, 3, 30, 'minecraft:smooth_stone_slab[type=bottom]'); S(27, 0, 27, 'minecraft:composter[level=0]'); S(29, 0, 29, 'minecraft:barrel[facing=up,open=true]')
  btArbre(2, 28, 5); btArbre(2, 10, 6); gtBanc(4, 29, 'north', 3); bgVoiture(27, 12, 'z', 'blue', 0); bgVoiture(27, 3, 'z', 'white', 1)
}
function vrResidenceHall() {
  F(15, 1, 12, 16, 3, 12, AIR)
  for (var z = 14; z <= 20; z++) { S(7, 1, z, 'minecraft:barrel[facing=east,open=' + (H3(7, 1, z) < 0.3) + ']'); S(7, 2, z, 'minecraft:barrel[facing=east,open=false]') }
  for (var x = 19; x <= 22; x++) vrCpt(x, 1, 16, 'south', 'quartz_block'); vrCh(20, 1, 15, 'south')
  for (var x = 10; x <= 12; x++) vrCanape(x, 1, 22, 'north', 'gray'); vrGueridon(11, 1, 20)
  ;[[24, 23], [7, 23], [24, 13]].forEach(p => S(p[0], 1, p[1], choix(VRPOT)))
  for (var x = 18; x <= 23; x += 2) S(x, 1, 22, choix(['supplementaries:sack', 'minecraft:barrel[facing=up,open=false]']))
  S(15, 5, 18, 'mcwlights:iron_chandelier'); vrDebris(5, 8, 13, 23, 23, 1)
}
// un appartement : sejour-cuisine au nord, chambre et salle d'eau au sud ; m = miroir (cuisine a l'est)
function vrAppart(xa, xb, y, k, m) {
  var g = m ? xb : xa, d = m ? -1 : 1, fc = m ? 'west' : 'east', X = u => g + d * u, etat = H3(xa, y, k)
  for (var z = 13; z <= 15; z++) vrCpt(X(0), y + 1, z, fc); S(X(0), y + 1, 16, 'farmersdelight:stove[facing=' + fc + ',lit=false]')
  if (etat < 0.6) S(X(0), y + 2, 14, choix(VAISS).replace('{I}', fc))
  vrTab(X(3), y + 1, 15); vrCh(X(2), y + 1, 15, fc); vrCh(X(4), y + 1, 15, m ? 'east' : 'west')
  for (var u = 5; u <= 7; u++) vrCanape(X(u), y + 1, 17, 'north', choix(['gray', 'light_gray', 'blue', 'brown'])); vrGueridon(X(6), y + 1, 13); S(X(6), y + 2, 13, 'minecraft:black_stained_glass_pane')
  // cloison, chambre, salle d'eau
  F(xa, y + 1, 18, xb, y + 5, 18, VRB); PORTE(X(6), y + 1, 18, 'minecraft:birch_door', 'south', 'left', 'false'); PORTE(X(1), y + 1, 18, 'minecraft:birch_door', 'south', 'left', 'false')
  F(X(3), y + 1, 19, X(3), y + 5, 23, VRB)
  S(X(0), y + 1, 23, 'minecraft:water_cauldron[level=' + (etat < 0.5 ? 1 : 2) + ']'); S(X(2), y + 1, 23, 'minecraft:cauldron'); S(X(0), y + 1, 20, btSt('quartz', m ? 'west' : 'east'))
  vrLitS(X(6), y + 1, 20, choix(['white', 'light_gray', 'light_blue', 'gray']), 'north'); vrGueridon(X(7) == xb || X(7) == xa ? X(7) : X(5), y + 1, 19); vrArm(X(4), y + 1, 23, 'north')
  PORTE(X(6), y + 1, 24, 'mcwdoors:dark_oak_glass_door', 'south', 'left', 'false')
  if (etat > 0.75) { S(X(5), y + 1, 21, 'minecraft:campfire[lit=false,facing=north]'); S(X(4), y + 1, 20, 'supplementaries:sack') }
  else if (etat < 0.2) vrDebris(3, xa, 13, xb, 17, y + 1)
}

// ================= CONCESSION AUTOMOBILE (hall d'exposition vitre, atelier, parc exterieur) =================
function vrConcession() {
  btDalle(0, 0, 31, 31)
  // atelier au nord
  F(3, 0, 2, 28, 0, 11, VRC); W(3, 2, 28, 11, 1, 5, VRC); F(3, 6, 2, 28, 6, 11, VRS); F(3, 1, 5, 3, 4, 8, AIR)
  for (var x = 4; x <= 27; x++) if (x % 4) F(x, 3, 2, x, 4, 2, 'minecraft:glass_pane')
  F(8, 1, 5, 8, 2, 5, 'minecraft:iron_bars'); F(11, 1, 6, 11, 2, 6, 'minecraft:iron_bars'); btVoitureY(3, 8, 5, 'x', 'gray', 1)
  btVoitureY(1, 16, 4, 'z', 'green', 2)
  S(26, 1, 3, 'minecraft:smithing_table'); S(25, 1, 3, 'minecraft:anvil[facing=east]'); S(24, 1, 3, 'minecraft:grindstone[face=floor,facing=north]'); S(27, 1, 3, 'minecraft:barrel[facing=up,open=false]')
  for (var z = 4; z <= 9; z += 2) S(27, 1, z, 'minecraft:barrel[facing=west,open=false]'); S(27, 2, 4, 'minecraft:barrel[facing=up,open=false]')
  ;[[21, 9], [22, 9], [21, 10]].forEach(p => S(p[0], 1, p[1], 'minecraft:black_concrete')); S(21, 2, 9, 'minecraft:black_concrete')
  for (var x = 6; x <= 26; x += 5) { S(x, 5, 4, 'minecraft:lantern[hanging=true]'); S(x, 5, 9, 'minecraft:lantern[hanging=true]') }
  // hall d'exposition : vitrage toute hauteur sud et est
  F(3, 0, 12, 28, 0, 27, VRQ); vrMurRideau(3, 12, 28, 27, 1, 6, 4, VRV, VRNO); F(3, 1, 12, 28, 6, 12, VRB); F(3, 1, 13, 3, 6, 27, VRB)
  F(10, 1, 12, 11, 3, 12, AIR); F(3, 7, 12, 28, 7, 27, VRS); W(3, 12, 28, 27, 8, 8, VRB)
  btVoitureY(1, 6, 16, 'x', 'red', 0); btVoitureY(1, 13, 20, 'z', 'white', 0); btVoitureY(1, 19, 15, 'x', 'black', 1); btVoitureY(1, 23, 20, 'z', 'yellow', 0)
  F(12, 0, 19, 15, 0, 24, 'minecraft:smooth_stone')
  // bureaux de vente, accueil
  for (var x = 5; x <= 8; x += 3) { vrBur(x, 1, 24, 'north'); vrCh(x, 1, 23, 'south', 'black'); vrCh(x, 1, 25, 'north'); vrCh(x + 1, 1, 25, 'north'); S(x, 2, 24, choix(VRPAP)) }
  for (var z = 22; z <= 26; z++) vrCpt(27, 1, z, 'west', 'quartz_block'); vrCh(26, 1, 24, 'east', 'black')
  ;[[4, 26], [4, 14], [27, 14], [18, 26]].forEach(p => S(p[0], 1, p[1], choix(VRPOT)))
  for (var x = 6; x <= 26; x += 5) for (var z = 15; z <= 26; z += 5) S(x, 6, z, 'mcwlights:white_ceiling_light')
  PORTE(15, 1, 27, 'mcwdoors:dark_oak_glass_door', 'south', 'left', 'false'); PORTE(16, 1, 27, 'mcwdoors:dark_oak_glass_door', 'south', 'right', 'true')
  vrDebris(5, 4, 13, 27, 26, 1)
  // parc exterieur (cote est, hors lot pour le stationnement), mats et totem
  for (var m = 0; m < 3; m++) { F(4 + 3 * m, 0, 30, 4 + 3 * m, 7, 30, 'minecraft:iron_bars'); F(5 + 3 * m, 6, 30, 5 + 3 * m, 7, 30, 'minecraft:' + ['blue', 'white', 'red'][m] + '_wool') }
  F(29, 0, 29, 29, 9, 29, VRNO); F(29, 6, 28, 29, 9, 30, VRB); S(29, 10, 29, VRNO)
  bgVoiture(20, 29, 'x', 'light_blue', 0, false)
  S(30, -1, 13, 'minecraft:white_concrete'); S(30, -1, 18, 'minecraft:white_concrete'); S(30, -1, 23, 'minecraft:white_concrete')
}

// ================= BIBLIOTHEQUE UNIVERSITAIRE (salle de lecture double hauteur, mezzanine, magasins, toit vegetalise) =================
function vrBiblio() {
  var Y = k => 6 * k, CX = 4, CZ = 6
  btDalle(0, 0, 31, 31)
  F(3, 0, 5, 28, 0, 27, VRA); F(3, 6, 5, 28, 6, 27, V2PL); F(13, 6, 13, 24, 6, 23, AIR); F(3, 12, 5, 28, 12, 27, V2PL); F(3, 18, 5, 28, 18, 27, VRS)
  ;[0, 6, 12, 18].forEach(y => W(3, 5, 28, 27, y, y, VRNO))
  for (var k = 0; k < 3; k++) { var y = Y(k); vrMurRideau(3, 5, 28, 27, y + 1, y + 5, 3, k == 2 ? VRN : VRV, VRC) }
  F(12, 7, 12, 25, 7, 12, GP); F(12, 7, 24, 25, 7, 24, GP); F(12, 7, 13, 12, 7, 23, GP); F(25, 7, 13, 25, 7, 23, GP)
  for (var k = 0; k < 3; k++) { vrCage(CX, CZ, Y(k), VRA); PORTE(CX + 7, Y(k) + 1, CZ + 2, 'minecraft:iron_door', 'east', 'left', 'false') }
  // salle de lecture (sous le vide central) : grandes tables
  for (var z = 15; z <= 21; z += 3) for (var x = 15; x <= 22; x++) { vrTab(x, 1, z, 'none'); vrCh(x, 1, z - 1, 'south'); vrCh(x, 1, z + 1, 'north'); if (H3(x, 1, z) < 0.35) S(x, 2, z, choix(VRPAP)) }
  // rayonnages bas (ouest), banque de pret, portiques antivol
  for (var z = 14; z <= 24; z += 3) F(5, 1, z, 10, 3, z, 'minecraft:bookshelf')
  for (var x = 11; x <= 14; x++) vrCpt(x, 1, 25, 'south', 'quartz_block'); vrCh(12, 1, 24, 'south'); vrCh(14, 1, 24, 'south'); S(11, 2, 25, 'handcrafted:stackable_book')
  F(17, 1, 25, 17, 2, 25, 'minecraft:iron_bars'); F(19, 1, 25, 19, 2, 25, 'minecraft:iron_bars')
  for (var z = 13; z <= 25; z += 4) S(27, 1, z, choix(VRPOT)); for (var z = 15; z <= 23; z += 4) vrCanape(27, 1, z, 'west', 'blue')
  // mezzanine : rayonnages a l'ouest, carrels le long du vitrage nord et sud
  for (var z = 14; z <= 24; z += 3) F(5, 7, z, 10, 9, z, 'minecraft:bookshelf')
  for (var x = 13; x <= 27; x++) { if (x % 3 == 0) continue; vrBur(x, 7, 6, 'south'); vrCh(x, 7, 7, 'north'); vrBur(x, 7, 26, 'north'); vrCh(x, 7, 25, 'south') }
  for (var z = 13; z <= 23; z += 5) { vrTab(27, 7, z); vrCh(26, 7, z, 'east') }
  // magasins (dernier niveau) : epis serres, salle de travail en groupe
  for (var z = 8; z <= 26; z += 3) F(14, 13, z, 22, 15, z, 'minecraft:bookshelf')
  for (var z = 14; z <= 26; z += 3) F(5, 13, z, 10, 14, z, 'minecraft:bookshelf')
  vrTab(25, 13, 15); vrTab(25, 13, 16); vrTab(25, 13, 17); for (var z = 15; z <= 17; z++) { vrCh(24, 13, z, 'east'); vrCh(26, 13, z, 'west') }
  F(23, 13, 12, 23, 17, 20, GP); F(24, 13, 12, 27, 17, 12, GP); F(24, 13, 20, 27, 17, 20, GP); PORTE(23, 13, 18, 'minecraft:iron_door', 'west', 'left', 'false'); vrDebris(6, 13, 7, 22, 26, 13)
  for (var k = 0; k < 3; k++) vrVolees(CX, CZ, Y(k), VRA, 'polished_andesite')
  vrPlaf(0, 5, 7, 27, 26, 4); vrPlaf(6, 5, 7, 27, 26, 4); vrPlaf(12, 5, 7, 27, 26, 4)
  // toit vegetalise, verriere sur le vide, edicule
  var yt = 18
  W(3, 5, 28, 27, yt + 1, yt + 1, VRNO); v2Edicule(CX, CZ, yt)
  for (var x = 14; x <= 27; x++) for (var z = 6; z <= 26; z++) { S(x, yt, z, 'minecraft:grass_block'); var r = H3(x, yt, z); if (r < 0.3) SA(x, yt + 1, z, 'minecraft:short_grass'); else if (r < 0.36) SA(x, yt + 1, z, 'minecraft:oxeye_daisy') }
  for (var x = 4; x <= 12; x++) for (var z = 14; z <= 26; z++) if (z % 2 == 0) S(x, yt + 1, z, 'minecraft:daylight_detector[inverted=false,power=0]')
  // parvis : arbres, bancs, entree
  PORTE(15, 1, 27, 'mcwdoors:dark_oak_glass_door', 'south', 'left', 'false'); PORTE(16, 1, 27, 'mcwdoors:dark_oak_glass_door', 'south', 'right', 'false')
  F(13, 5, 28, 18, 5, 29, 'minecraft:smooth_stone_slab[type=bottom]')
  btArbre(5, 29, 5); btArbre(26, 29, 5); gtBanc(9, 30, 'south', 3); gtBanc(20, 30, 'south', 3)
  for (var x = 0; x <= 31; x++) S(x, -1, 31, VRA)
}

// ================= CENTRE DE DONNEES (salle des baies, salle de controle, groupes electrogenes, enceinte grillagee) =================
function vrDonnees() {
  btDalle(0, 0, 31, 31)
  F(3, 0, 4, 28, 0, 24, V2PL); W(3, 4, 28, 24, 1, 7, VRC); F(3, 8, 4, 28, 8, 24, VRS); W(3, 4, 28, 24, 9, 9, VRC)
  for (var x = 4; x <= 20; x += 2) S(x, 6, 24, 'minecraft:black_stained_glass')
  for (var x = 4; x <= 27; x++) for (var z = 5; z <= 23; z++) if ((x + z) % 2 == 0 && x <= 20) S(x, 0, z, 'minecraft:smooth_stone')
  // salle des baies : six rangees face au sud, chemins de cables
  ;[7, 10, 13, 16, 19, 22].forEach(z => { for (var x = 6; x <= 18; x++) { S(x, 1, z, VRNO); S(x, 2, z, 'minecraft:blast_furnace[facing=' + (z % 2 ? 'south' : 'north') + ',lit=false]'); S(x, 3, z, VRNO) } F(6, 5, z, 18, 5, z, 'minecraft:chain[axis=x]') })
  for (var z = 6; z <= 23; z += 4) { F(4, 1, z, 4, 2, z, 'minecraft:red_concrete'); S(4, 3, z, 'minecraft:red_terracotta') }
  vrPlaf(2, 5, 5, 20, 23, 4)
  // cloison et salle de controle
  F(21, 1, 5, 21, 7, 23, VRC); F(21, 2, 10, 21, 3, 18, 'minecraft:black_stained_glass_pane'); PORTE(21, 1, 20, 'minecraft:iron_door', 'east', 'left', 'false')
  for (var z = 9; z <= 17; z++) { vrBur(23, 1, z, 'east'); vrCh(24, 1, z, 'west', 'black'); S(23, 2, z, 'minecraft:black_stained_glass_pane') }
  for (var z = 6; z <= 8; z++) vrArm(27, 1, z, 'west'); vrTab(26, 1, 20); vrCh(25, 1, 20, 'east'); S(26, 2, 20, 'handcrafted:white_cup')
  F(22, 2, 24, 27, 4, 24, 'minecraft:black_stained_glass_pane'); PORTE(25, 1, 24, 'minecraft:iron_door', 'south', 'left', 'false')
  PORTE(11, 1, 24, 'minecraft:iron_door', 'south', 'left', 'false'); PORTE(12, 1, 24, 'minecraft:iron_door', 'south', 'right', 'false')
  vrPlaf(2, 22, 5, 27, 23, 4); vrDebris(4, 22, 5, 27, 23, 1)
  // toiture : groupes froids, antenne sur mat
  ;[6, 12, 18].forEach(x => { F(x, 9, 8, x + 3, 10, 11, 'minecraft:iron_block'); F(x, 11, 8, x + 3, 11, 11, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false]') })
  ;[6, 12, 18].forEach(x => { F(x, 9, 16, x + 3, 10, 19, 'minecraft:iron_block'); F(x, 11, 16, x + 3, 11, 19, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false]') })
  F(25, 9, 7, 25, 13, 7, 'minecraft:iron_bars'); S(25, 14, 7, 'minecraft:lightning_rod[facing=up]')
  // cour : groupe electrogene, cuve, enceinte grillagee avec barbele
  F(4, 0, 26, 10, 2, 28, VRC); F(5, 1, 26, 9, 1, 26, 'minecraft:iron_bars'); S(11, 0, 27, 'minecraft:iron_block'); F(11, 1, 27, 11, 3, 27, 'minecraft:iron_bars')
  F(20, 0, 26, 26, 1, 28, VRB); F(20, 2, 27, 26, 2, 27, 'minecraft:white_concrete'); S(23, 3, 27, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false]')
  for (var x = 0; x <= 31; x++) { if (x >= 13 && x <= 18) continue; F(x, 0, 30, x, 2, 30, 'minecraft:iron_bars'); S(x, 3, 30, 'simply_traps:circular_barbed_wire_iron[facing=north]') }
  for (var z = 25; z <= 29; z++) { F(0, 0, z, 0, 2, z, 'minecraft:iron_bars'); F(31, 0, z, 31, 2, z, 'minecraft:iron_bars') }
  S(13, 0, 31, VRC); F(13, 1, 31, 13, 2, 31, 'minecraft:iron_bars'); S(18, 0, 31, VRC); F(18, 1, 31, 18, 2, 31, 'minecraft:iron_bars')
  btLampe(15, 26, 'east')
  ;[[14, 28], [16, 29], [27, 29]].forEach(p => S(p[0], 0, p[1], 'supplementaries:sack'))
}

// ================= CENTRE AQUATIQUE (bassin sous verriere, gradins, vestiaires) ; entree au nord =================
function vrPiscine() {
  btDalle(0, 0, 31, 31)
  F(2, 0, 4, 29, 0, 29, VRQ); vrMurRideau(2, 4, 29, 29, 1, 7, 4, VRV, VRB); F(2, 1, 29, 29, 7, 29, VRB); F(2, 1, 4, 2, 7, 29, VRB)
  for (var x = 2; x <= 29; x++) for (var z = 4; z <= 29; z++) S(x, 8, z, x == 2 || x == 29 || z == 4 || z == 29 || (x - 2) % 4 == 0 || (z - 4) % 4 == 0 ? VRB : R() < 0.12 ? 'minecraft:light_gray_stained_glass' : 'minecraft:glass')
  // bassin : niveau baisse, eau trouble, lignes d'eau au fond
  F(6, -5, 10, 25, -1, 23, 'minecraft:light_blue_concrete'); F(7, -4, 11, 24, -1, 22, 'minecraft:water'); F(7, 0, 11, 24, 0, 22, AIR)
  for (var z = 13; z <= 21; z += 4) F(8, -5, z, 23, -5, z, 'minecraft:blue_concrete')
  for (var x = 7; x <= 24; x++) for (var z = 11; z <= 22; z++) { var r = H3(x, -4, z); if (r < 0.12) S(x, -4, z, 'minecraft:seagrass'); else if (r > 0.94) S(x, 0, z, 'minecraft:lily_pad') }
  ;[10, 20].forEach(x => { for (var y = -4; y <= 0; y++) S(x, y, 11, 'minecraft:ladder[facing=south,waterlogged=' + (y < 0) + ']') })
  for (var x = 8; x <= 23; x += 3) S(x, 1, 24, btSt('smooth_quartz', 'south'))
  // gradins a l'est
  for (var z = 10; z <= 23; z++) { S(26, 1, z, btSt('smooth_quartz', 'east')); S(27, 1, z, VRQ); S(27, 2, z, btSt('smooth_quartz', 'east')); F(28, 1, z, 28, 2, z, VRQ); S(28, 3, z, btSt('smooth_quartz', 'east')) }
  // accueil, tourniquets, vestiaires a l'ouest
  for (var x = 13; x <= 18; x++) vrCpt(x, 1, 6, 'north', 'quartz_block'); vrCh(15, 1, 7, 'north'); S(13, 2, 6, 'supplementaries:jar')
  F(3, 1, 8, 28, 3, 8, GP); F(20, 1, 8, 21, 3, 8, AIR); F(20, 1, 8, 20, 1, 8, 'minecraft:iron_bars')
  for (var z = 10; z <= 27; z += 2) vrArm(3, 1, z, 'east'); for (var z = 11; z <= 27; z += 4) S(5, 1, z, btSt('smooth_quartz', 'west'))
  ;[[24, 5], [27, 5], [7, 5], [4, 5]].forEach(p => S(p[0], 1, p[1], choix(VRPOT)))
  for (var x = 6; x <= 25; x += 4) for (var z = 26; z <= 28; z += 2) if (H3(x, 1, z) < 0.5) S(x, 1, z, choix(['supplementaries:sack', 'minecraft:barrel[facing=up,open=false]']))
  vrLitS(9, 1, 27, 'white', 'east'); vrLitS(13, 1, 27, 'light_gray', 'east'); S(17, 1, 27, 'minecraft:campfire[lit=false,facing=north]')
  vrPlaf(2, 3, 5, 28, 28, 4)
  PORTE(10, 1, 4, 'mcwdoors:dark_oak_glass_door', 'north', 'left', 'false'); PORTE(11, 1, 4, 'mcwdoors:dark_oak_glass_door', 'north', 'right', 'true')
  // parvis nord : marquise, arceaux, vehicules
  F(8, 6, 1, 13, 6, 3, 'minecraft:smooth_stone_slab[type=bottom]'); F(8, 0, 1, 8, 5, 1, 'minecraft:iron_bars'); F(13, 0, 1, 13, 5, 1, 'minecraft:iron_bars')
  for (var x = 15; x <= 19; x += 2) S(x, 0, 2, V2GR)
  btLampe(3, 1, 'east'); bgVoiture(20, 0, 'x', 'white', 1)
}

// ================= PARKING A ETAGES (4 niveaux + terrasse, rampes alternees) ; entree au nord =================
function vrParking() {
  var YB = [-1, 3, 7, 11, 15]
  btDalle(0, 0, 31, 31)
  for (var k = 0; k < 5; k++) { var y = YB[k]; F(2, y, 3, 29, y, 28, k == 0 ? VRC : V2PL); if (k > 0) { if (k % 2) F(24, y, 6, 28, y, 12, AIR); else F(3, y, 6, 7, y, 12, AIR) } }
  // rampes : niveau pair a l'est, niveau impair a l'ouest (montee vers le sud)
  for (var k = 0; k < 4; k++) {
    var y = YB[k], x1 = k % 2 ? 3 : 24, x2 = x1 + 4
    for (var i = 0; i < 8; i++) { var z = 6 + i, b = y + 1 + Math.floor(i / 2); if (b > y + 1) F(x1, y + 1, z, x2, b - 1, z, VRC); F(x1, b, z, x2, b, z, i % 2 ? VRC : 'minecraft:smooth_stone_slab[type=bottom]') }
    if (k > 0) { var xa = k % 2 ? 24 : 3, xr = k % 2 ? 23 : 8; F(xr, y + 1, 6, xr, y + 1, 12, V2GR); F(xa, y + 1, 5, xa + 4, y + 1, 5, V2GR) }
  }
  // rives : allege, poteaux, resille metallique
  for (var k = 0; k < 5; k++) {
    var y = YB[k]
    W(2, 3, 29, 28, y + 1, y + 1, VRC)
    if (k < 4) { W(2, 3, 29, 28, y + 2, y + 2, 'minecraft:iron_bars'); for (var x = 2; x <= 29; x += 6) { F(x, y + 1, 3, x, y + 3, 3, VRC); F(x, y + 1, 28, x, y + 3, 28, VRC) } for (var z = 3; z <= 28; z += 5) { F(2, y + 1, z, 2, y + 3, z, VRC); F(29, y + 1, z, 29, y + 3, z, VRC) } F(29, y + 1, 28, 29, y + 3, 28, VRC) }
    for (var x = 11; x <= 20; x += 9) for (var z = 9; z <= 22; z += 13) if (k < 4) F(x, y + 1, z, x, y + 3, z, VRC)
    if (k < 4) for (var x = 6; x <= 26; x += 5) S(x, y + 3, 19, 'minecraft:lantern[hanging=true]')
    // marquage et voitures
    for (var x = 4; x <= 24; x += 4) { S(x - 1, y, 15, VRB); S(x - 1, y, 25, VRB) }
    for (var x = 4; x <= 20; x += 4) { var r = H3(x, y, k); if (r < 0.6) btVoitureY(y + 1, x, 15, 'z', choix(['white', 'gray', 'black', 'red', 'blue', 'light_gray']), r < 0.1 ? 2 : r < 0.3 ? 1 : 0); var r2 = H3(x, y, k + 7); if (r2 < 0.5) btVoitureY(y + 1, x, 23, 'z', choix(['white', 'gray', 'black', 'green', 'yellow']), r2 < 0.15 ? 1 : 0) }
  }
  F(3, -1, 4, 28, -1, 5, VRNO); F(9, 0, 3, 14, 2, 3, AIR)
  // terrasse : abri d'escalier, cuve de recuperation
  var yt = YB[4]
  F(25, yt + 1, 22, 28, yt + 3, 25, VRC); F(26, yt + 1, 23, 27, yt + 3, 24, AIR); F(26, yt + 1, 22, 27, yt + 2, 22, AIR); F(25, yt + 4, 22, 28, yt + 4, 25, VRS); S(27, yt + 1, 24, 'minecraft:barrel[facing=up,open=false]')
  F(8, yt + 1, 20, 8, yt + 4, 20, 'minecraft:iron_bars'); S(8, yt + 5, 20, 'minecraft:lightning_rod[facing=up]')
  // escalier pieton exterieur (sud) : volees alternees sur deux files, paliers raccordes aux niveaux
  for (var k = 0; k < 4; k++) {
    var y = YB[k], pair = k % 2 == 0, zf = pair ? 30 : 29
    for (var i = 0; i < 4; i++) { var x = pair ? 19 + i : 22 - i; S(x, y + 1 + i, zf, btSt('polished_andesite', pair ? 'east' : 'west')); if (i) F(x, y + 1, zf, x, y + i, zf, VRA) }
    var xl = pair ? 23 : 17; F(xl, y + 4, 29, xl + 1, y + 4, 30, VRA); F(xl, y + 5, 28, xl + 1, y + 6, 28, AIR)
    F(pair ? 25 : 16, y + 5, 29, pair ? 25 : 16, y + 5, 30, V2GR)
  }
  F(19, -1, 31, 22, -1, 31, VRA); F(17, 0, 31, 25, 0, 31, V2GR); S(18, 0, 31, AIR)
  // controle d'acces
  S(8, 0, 1, 'minecraft:smooth_stone'); S(8, 1, 1, 'minecraft:dropper[facing=north,triggered=false]'); F(9, 1, 1, 12, 1, 1, 'minecraft:end_rod[facing=east]')
  bgVoiture(16, 0, 'x', 'black', 0)
}

// ================= RESTAURATION RAPIDE (pavillon, comptoir, cuisine, drive, aire de jeux) ; entree au nord =================
function vrSnack() {
  btDalle(0, 0, 31, 31)
  F(6, 0, 6, 25, 0, 18, VRQ); vrMurRideau(6, 6, 25, 18, 1, 4, 4, VRV, 'minecraft:red_concrete'); F(6, 1, 18, 25, 4, 18, VRB); F(6, 5, 6, 25, 5, 18, VRS); W(6, 6, 25, 18, 6, 6, 'minecraft:red_concrete'); W(6, 6, 25, 18, 7, 7, 'minecraft:yellow_concrete')
  // salle : banquettes le long du vitrage nord, tables
  for (var x = 8; x <= 22; x += 3) { vrCanape(x, 1, 7, 'south', 'red'); vrTab(x, 1, 8, 'white'); vrCh(x, 1, 9, 'north', 'red'); if (H3(x, 1, 8) < 0.5) S(x, 2, 8, choix(VAISS).replace('{I}', 'north')) }
  for (var z = 8; z <= 10; z++) { vrCanape(7, 1, z, 'east', 'yellow') }
  // comptoir et cuisine
  for (var x = 9; x <= 21; x++) vrCpt(x, 1, 12, 'north', 'quartz_block'); S(10, 2, 12, 'supplementaries:jar'); S(14, 2, 12, 'handcrafted:white_cup')
  for (var x = 9; x <= 21; x += 3) { S(x, 1, 15, 'farmersdelight:stove[facing=north,lit=false]'); S(x + 1, 1, 15, 'minecraft:smoker[facing=north,lit=false]') }
  for (var x = 9; x <= 21; x++) if (x % 3 == 2) S(x, 1, 17, 'mcwfurnitures:birch_kitchen_sink[facing=north,water=false]'); else vrCpt(x, 1, 17, 'north', 'smooth_stone')
  F(7, 1, 13, 7, 4, 17, VRB); F(23, 1, 13, 24, 1, 17, 'minecraft:barrel[facing=up,open=false]'); S(23, 2, 14, 'farmersdelight:rice_bag')
  vrPlaf(-1, 8, 8, 24, 17, 4)
  // guichet du drive (facade est)
  F(25, 2, 14, 25, 3, 14, AIR); S(25, 1, 14, VRB); vrCpt(24, 1, 14, 'east')
  PORTE(15, 1, 6, 'mcwdoors:dark_oak_glass_door', 'north', 'left', 'false'); PORTE(16, 1, 6, 'mcwdoors:dark_oak_glass_door', 'north', 'right', 'true')
  F(13, 4, 5, 18, 4, 5, 'supplementaries:awning_red[facing=north]')
  // voie du drive : enrobe, fleches, borne de commande
  for (var x = 26; x <= 30; x++) for (var z = 2; z <= 29; z++) S(x, -1, z, VRNO)
  for (var x = 6; x <= 30; x++) for (var z = 26; z <= 29; z++) if (x > 19) S(x, -1, z, VRNO)
  for (var z = 8; z <= 26; z += 6) { S(28, -1, z, VRB); S(28, -1, z + 1, VRB) }
  S(25, 0, 23, VRC); S(25, 1, 23, 'minecraft:dropper[facing=east,triggered=false]'); S(25, 2, 23, 'minecraft:red_concrete')
  bgVoiture(27, 16, 'z', 'white', 1); bgVoiture(27, 24, 'z', 'red', 0)
  // aire de jeux (sud-ouest) : cloture, tour et toboggan
  for (var x = 4; x <= 18; x++) { S(x, 0, 21, 'mcwfences:spruce_picket_fence'); S(x, 0, 29, 'mcwfences:spruce_picket_fence') } for (var z = 22; z <= 28; z++) { S(4, 0, z, 'mcwfences:spruce_picket_fence'); S(18, 0, z, 'mcwfences:spruce_picket_fence') }
  S(11, 0, 21, AIR)
  for (var x = 4; x <= 18; x++) for (var z = 22; z <= 28; z++) S(x, -1, z, x > 4 && x < 18 && z > 21 && z < 29 ? 'minecraft:red_concrete_powder' : VRA)
  ;[[7, 23], [9, 23], [7, 25], [9, 25]].forEach(p => F(p[0], 0, p[1], p[0], 2, p[1], 'minecraft:yellow_concrete')); F(7, 3, 23, 9, 3, 25, 'minecraft:blue_concrete'); F(8, 4, 24, 8, 4, 24, 'minecraft:red_concrete')
  F(8, 0, 25, 8, 2, 25, 'minecraft:yellow_concrete'); for (var y = 0; y <= 3; y++) S(8, y, 26, 'minecraft:ladder[facing=south,waterlogged=false]')
  S(10, 2, 24, btSt('smooth_quartz', 'west')); S(11, 1, 24, btSt('smooth_quartz', 'west')); S(12, 0, 24, btSt('smooth_quartz', 'west')); S(10, 1, 24, 'minecraft:yellow_concrete'); S(10, 0, 24, 'minecraft:yellow_concrete'); S(11, 0, 24, 'minecraft:yellow_concrete')
  S(15, 0, 26, 'minecraft:oak_log[axis=y]'); S(15, 1, 26, 'minecraft:oak_fence'); S(14, 0, 25, 'minecraft:oak_slab[type=bottom]'); S(16, 0, 27, 'minecraft:oak_slab[type=bottom]')
  // parking client, totem sans inscription
  for (var x = 2; x <= 22; x += 4) S(x, -1, 2, VRB); bgVoiture(4, 0, 'z', 'gray', 1); bgVoiture(12, 0, 'z', 'blue', 0)
  F(1, 0, 18, 1, 9, 18, VRC); F(0, 7, 18, 2, 10, 18, 'minecraft:yellow_concrete'); F(0, 10, 18, 2, 10, 18, 'minecraft:red_concrete')
  for (var x = 9; x <= 21; x += 6) { F(x, 6, 9, x + 2, 6, 11, 'minecraft:iron_block'); S(x + 1, 7, 10, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false]') }
}

// ================= GARE ROUTIERE (hall voyageurs, quais sous verriere, autocars) ; entree au nord =================
function vrGareRoutiere() {
  btDalle(0, 0, 31, 31)
  for (var x = 11; x <= 31; x++) for (var z = 3; z <= 29; z++) S(x, -1, z, R() < 0.8 ? VRNO : VRC)
  // hall voyageurs (ouest)
  F(2, 0, 3, 10, 0, 28, VRA); vrMurRideau(2, 3, 10, 28, 1, 5, 3, VRN, VRNO); F(2, 6, 3, 10, 6, 28, VRS); W(2, 3, 10, 28, 7, 7, VRNO)
  for (var z = 6; z <= 9; z++) vrCpt(4, 1, z, 'east', 'quartz_block'); vrCh(3, 1, 7, 'east'); vrCh(3, 1, 8, 'east'); F(4, 2, 6, 4, 3, 9, GP)
  F(9, 3, 12, 9, 4, 16, VRNO); for (var z = 12; z <= 16; z += 2) S(9, 4, z, 'minecraft:redstone_lamp[lit=false]')
  for (var z = 12; z <= 20; z += 4) { S(5, 1, z, btSt('smooth_quartz', 'west')); S(5, 1, z + 1, btSt('smooth_quartz', 'west')); S(7, 1, z, btSt('smooth_quartz', 'east')); S(7, 1, z + 1, btSt('smooth_quartz', 'east')) }
  W(3, 23, 9, 27, 1, 5, VRB); F(4, 1, 24, 8, 5, 26, AIR); F(6, 1, 23, 6, 1, 23, AIR); S(6, 2, 23, AIR); F(4, 1, 26, 8, 1, 26, AIR); S(4, 1, 26, 'minecraft:cauldron'); S(8, 1, 26, 'minecraft:cauldron')
  S(3, 1, 21, 'minecraft:dropper[facing=east,triggered=false]'); S(3, 2, 21, VRNO); S(3, 1, 19, choix(VRPOT))
  vrPlaf(0, 3, 4, 9, 22, 4)
  PORTE(6, 1, 3, 'mcwdoors:dark_oak_glass_door', 'north', 'left', 'false'); PORTE(10, 1, 11, 'mcwdoors:dark_oak_glass_door', 'east', 'left', 'true'); PORTE(10, 1, 19, 'mcwdoors:dark_oak_glass_door', 'east', 'left', 'false')
  vrDebris(5, 3, 10, 9, 22, 1)
  // quais en ilot, bancs
  ;[9, 20].forEach(z => {
    F(12, 0, z, 29, 0, z + 1, 'minecraft:smooth_stone_slab[type=bottom]')
    for (var x = 14; x <= 26; x += 4) { S(x, 1, z, btSt('smooth_quartz', 'north')); S(x + 1, 1, z + 1, btSt('smooth_quartz', 'south')) }
    S(28, 1, z, 'minecraft:barrel[facing=up,open=false]')
  })
  // verriere sur poteaux metalliques (poteaux sur les quais et en rive)
  var BX = [12, 18, 24, 30], BZ = [3, 9, 20, 29]
  BX.forEach(x => BZ.forEach(z => F(x, z == 9 || z == 20 ? 1 : 0, z, x, 5, z, VRNO)))
  for (var x = 11; x <= 30; x++) for (var z = 3; z <= 29; z++) S(x, 6, z, x == 11 || BX.indexOf(x) >= 0 || [3, 9, 15, 20, 26, 29].indexOf(z) >= 0 ? VRNO : H3(x, 6, z) < 0.1 ? 'minecraft:light_gray_stained_glass' : 'minecraft:glass')
  ;[12, 18, 24].forEach(x => [15, 26].forEach(z => S(x, 5, z, 'minecraft:lantern[hanging=true]')))
  // autocars a quai
  v2Car(14, 5, 'white', false); v2Car(17, 12, 'blue', false); v2Car(13, 16, 'red', true); v2Car(16, 23, 'green', false)
  ;[[13, 27], [27, 27], [28, 14]].forEach(p => S(p[0], 0, p[1], 'supplementaries:sack'))
  // depose-minute
  btLampe(1, 1, 'east'); bgVoiture(14, 0, 'x', 'yellow', 0); bgVoiture(22, 0, 'x', 'white', 1)
}

// ---- prolongement du boulevard devant le 9e lot ----
function v2RueSuite() {
  OX = VB.X0; OY = VB.Y0; OZ = VB.Z0; CUT = 999; GRAINE = 2535
  for (var x = 144; x <= 163; x++) for (var z = 32; z <= 47; z++) {
    var r = R(), b
    if (z <= 33 || z >= 46) b = r < 0.6 ? 'mcwpaths:stone_flagstone' : r < 0.85 ? 'mcwpaths:andesite_flagstone' : 'mcwpaths:diorite_flagstone'
    else if (z == 34 || z == 45) b = VRA
    else if (z == 38 || z == 41) b = VRS
    else if (z >= 39 && z <= 40) b = r < 0.85 ? 'minecraft:grass_block' : 'minecraft:coarse_dirt'
    else b = r < 0.75 ? VRNO : r < 0.9 ? VRC : r < 0.96 ? 'minecraft:gray_concrete_powder' : 'minecraft:cobbled_deepslate'
    S(x, -1, z, b)
  }
  for (var x = 144; x <= 163; x++) { if (((x % 6) + 6) % 6 < 3) { S(x, -1, 36, VRB); S(x, -1, 43, VRB) } S(x, 0, 39, 'minecraft:rail[shape=east_west]') }
  F(148, 0, 38, 148, 5, 38, 'minecraft:iron_bars'); F(148, 0, 41, 148, 5, 41, 'minecraft:iron_bars'); F(148, 6, 38, 148, 6, 41, 'minecraft:iron_bars')
  F(144, 5, 39, 163, 5, 39, 'minecraft:chain[axis=x]'); F(144, 5, 40, 163, 5, 40, 'minecraft:chain[axis=x]'); F(163, 0, 39, 163, 1, 40, 'minecraft:andesite_wall')
  btLampe(150, 33, 'east'); btLampe(158, 46, 'east')
}

function vuesVerre2() {
  vue('vr2_ensemble_sud', 0, 0, 80, 64, 128, 80, 16, 32, 3000)
  vue('vr2_ensemble_nord', 0, 0, 80, 40, -40, 80, 10, 40, 3000)
  vue('vr2_banque', 0, 0, 16, 14, 46, 16, 12, 16)
  vue('vr2_banque_guichets', 0, 0, 22.5, 3.5, 24, 18, 1.5, 12)
  vue('vr2_banque_coffres', 0, 0, 19.5, -4, 21.5, 15.5, -5.5, 15)
  vue('vr2_banque_marches', 0, 0, 25, 21.5, 26, 16, 19, 12)
  vue('vr2_residence', 32, 0, 16, 30, 70, 16, 26, 14)
  vue('vr2_residence_appart', 32, 0, 13.5, 9.5, 14.5, 8, 7.5, 21)
  vue('vr2_residence_toit', 32, 0, 30, 62, 34, 16, 52, 14)
  vue('vr2_concession', 64, 0, 16, 8, 44, 16, 3, 18)
  vue('vr2_concession_hall', 64, 0, 26, 4.5, 26, 10, 1, 15)
  vue('vr2_concession_atelier', 64, 0, 4.5, 3.5, 9.5, 18, 2, 4)
  vue('vr2_biblio', 96, 0, 16, 14, 46, 16, 9, 16)
  vue('vr2_biblio_lecture', 96, 0, 26.5, 9.5, 24, 15, 2, 14)
  vue('vr2_biblio_toit', 96, 0, 30, 30, 34, 18, 18, 14)
  vue('vr2_donnees', 128, 0, 16, 10, 44, 16, 3, 16)
  vue('vr2_donnees_baies', 128, 0, 4.6, 3.6, 8.5, 19, 2, 9)
  vue('vr2_piscine', 0, 48, 16, 10, -12, 16, 3, 14)
  vue('vr2_piscine_bassin', 0, 48, 27.5, 5.5, 25, 12, -1, 13)
  vue('vr2_parking', 32, 48, 16, 12, -14, 16, 7, 14)
  vue('vr2_parking_niveau', 32, 48, 27, 9.6, 26.5, 6, 8, 16)
  vue('vr2_snack', 64, 48, 8, 8, -10, 16, 2, 12)
  vue('vr2_snack_salle', 64, 48, 23.5, 2.5, 9.5, 9, 1.5, 12)
  vue('vr2_snack_drive', 64, 48, 31, 6, 33, 25, 1, 16)
  vue('vr2_gare', 96, 48, 20, 10, -10, 20, 2, 14)
  vue('vr2_gare_quais', 96, 48, 29.5, 3, 21, 12, 1, 14)
}
var QFIN_VR2 = function () {
  HB2 = true; FIN = true; THM = THM_VR
  HM = {}; vrRue(); v2RueSuite(); finAncrage()
  lot(QF(vrBanque, null, null), 0, 0, 999, 2711, 32, 36); lot(QF(vrResidence, null, ['white', 'light_gray', 'gray', 'light_blue', 'brown']), 32, 0, 999, 2721, 32, 62); lot(QF(vrConcession, null, null), 64, 0, 999, 2731, 32, 11)
  lot(QF(vrBiblio, null, null), 96, 0, 999, 2741, 32, 25); lot(QF(vrDonnees, null, null), 128, 0, 999, 2751, 32, 15)
  lot(QF(vrPiscine, null, null), 0, 48, 999, 2761, 32, 9); lot(QF(vrParking, null, null), 32, 48, 999, 2771, 32, 21); lot(QF(vrSnack, null, null), 64, 48, 999, 2781, 32, 11); lot(QF(vrGareRoutiere, null, null), 96, 48, 999, 2791, 32, 8)
  vlog('FIN volets ' + FIN_NV + ' rideaux ' + FIN_NR + ' paves ' + PAVE_NB + ' retraits ancrage ' + ANC_NB)
  HB2 = false; FIN = false; THM = null; HM = {}
}
