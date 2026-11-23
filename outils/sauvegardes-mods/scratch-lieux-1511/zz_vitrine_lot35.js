// ================= QUARTIER MODERNE (residentiel 2010-2025) : villa a piscine, residence, mediatheque, maisons de ville, concession, parc, gymnase-refuge, maison a toit vegetal =================
var MDB = 'minecraft:white_concrete', MDG = 'minecraft:light_gray_concrete', MDA = 'minecraft:polished_andesite', MDS = 'minecraft:smooth_stone', MDQ = 'minecraft:smooth_quartz'
var MDW = 'minecraft:dark_oak_planks', MDL = 'minecraft:stripped_spruce_log[axis=y]', MDP = 'minecraft:birch_planks', MDN = 'minecraft:gray_concrete'
var MDHAIE = 'minecraft:spruce_leaves[persistent=true]'
// escalier droit d'un etage (montee de n marches selon dz), plein dessous, tremie dans le plancher du haut
function mdEsc(x1, x2, z0, y, n, dz, m, plein) {
  var f = dz > 0 ? 'south' : 'north'
  for (var i = 0; i < n; i++) { var z = z0 + dz * i; F(x1, y + 1 + i, z, x2, y + 1 + i, z, btSt(m, f)); if (i > 0) F(x1, y + 1, z, x2, y + i, z, plein) }
  for (var i = 0; i < n - 1; i++) { var z = z0 + dz * i; F(x1, y + n, z, x2, y + n, z, AIR) }
}
// garde-corps vitre autour d'une tremie (cote x et bout de depart)
function mdGarde(x, z1, z2, y) { F(x, y, Math.min(z1, z2), x, y, Math.max(z1, z2), GP) }
function mdLit(x, y, z, col, f) { var o = { north: [0, -1], south: [0, 1], east: [1, 0], west: [-1, 0] }[f]; S(x + o[0], y, z + o[1], 'minecraft:' + col + '_bed[facing=' + f + ',part=head,occupied=false]'); S(x, y, z, 'minecraft:' + col + '_bed[facing=' + f + ',part=foot,occupied=false]') }
function mdPorteVide(x, y, z) { S(x, y, z, AIR); S(x, y + 1, z, AIR) }
function mdPanneaux(x1, z1, x2, z2, y) { for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) if ((x - x1) % 3 != 2) S(x, y, z, 'minecraft:daylight_detector[inverted=false,power=0]') }
function mdTV(x, y, z, f) { S(x, y, z, vrCptId(f)); S(x, y + 1, z, 'minecraft:black_stained_glass_pane') }
function vrCptId(f) { return 'handcrafted:birch_counter[counter=dark_oak_planks,facing=' + f + ',type=1]' }

// ---- rue residentielle : piste cyclable, chaussee 2 voies, stationnement, bande plantee ----
function mdRue() {
  OX = VB.X0; OY = VB.Y0; OZ = VB.Z0; CUT = 999; GRAINE = 545
  for (var x = -16; x <= 143; x++) for (var z = 32; z <= 47; z++) {
    var r = R(), b
    if (z <= 34 || z >= 45) b = r < 0.6 ? 'mcwpaths:stone_flagstone' : r < 0.85 ? 'mcwpaths:andesite_flagstone' : 'mcwpaths:diorite_flagstone'
    else if (z == 35) b = r < 0.9 ? 'minecraft:red_terracotta' : 'minecraft:brown_terracotta'
    else if (z == 36) b = MDA
    else if (z == 43) b = MDN
    else if (z == 44) b = r < 0.9 ? 'minecraft:grass_block' : 'minecraft:coarse_dirt'
    else b = r < 0.78 ? 'minecraft:black_concrete' : r < 0.92 ? MDN : r < 0.97 ? 'minecraft:gray_concrete_powder' : 'minecraft:cobbled_deepslate'
    S(x, -1, z, b)
  }
  for (var x = -16; x <= 143; x++) {
    if (((x % 6) + 6) % 6 < 3) S(x, -1, 40, MDB)
    if (((x % 6) + 6) % 6 == 0) S(x, -1, 43, MDB)
    if (((x % 8) + 8) % 8 == 4) S(x, 0, 44, R() < 0.5 ? 'minecraft:azalea' : 'minecraft:flowering_azalea')
  }
  // passages pietons
  ;[[58, 63], [122, 127]].forEach(p => { for (var x = p[0]; x <= p[1]; x++) for (var z = 37; z <= 42; z++) if (x % 2 == 0) S(x, -1, z, MDB) })
  for (var x = 0; x <= 128; x += 32) { btLampe(x + 6, 33, 'east'); btLampe(x + 22, 46, 'east') }
  // voitures garees et abandonnees, poubelles de tri, barricade legere
  bgVoiture(10, 42, 'x', 'white', 0); bgVoiture(44, 42, 'x', 'light_blue', 1); bgVoiture(70, 37, 'x', 'gray', 1); bgVoiture(100, 42, 'x', 'black', 0); bgVoiture(28, 37, 'x', 'red', 1)
  ;[[28, 34], [92, 34], [60, 45]].forEach(p => { S(p[0], 0, p[1], 'minecraft:green_concrete'); S(p[0] + 1, 0, p[1], 'minecraft:yellow_concrete') })
  for (var z = 37; z <= 39; z++) S(84, 0, z, 'supplementaries:sack')
  F(136, 0, 37, 136, 0, 42, 'minecraft:iron_bars')
}

// ================= VILLA CONTEMPORAINE A PISCINE (R+1, cube blanc, etage bardage sombre) =================
function mdVilla() {
  F(0, -1, 0, 31, -1, 31, 'minecraft:grass_block')
  var Z1 = 10, Z2 = 25, X1 = 3, X2 = 18
  // dalles, murs, toit
  F(X1, 0, Z1, X2, 0, Z2, MDS); F(X1, 6, Z1, X2, 6, Z2, MDS); F(X1, 12, Z1, X2, 12, Z2, MDS)
  W(X1, Z1, X2, Z2, 1, 5, MDB); W(X1, Z1, X2, Z2, 7, 11, MDW); W(X1, Z1, X2, Z2, 13, 13, MDB)
  F(X1, 6, Z1, X2, 6, Z1, MDB); F(X1, 6, Z2, X2, 6, Z2, MDB); F(X1, 6, Z1, X1, 6, Z2, MDB); F(X2, 6, Z1, X2, 6, Z2, MDB)
  vrCage(11, 10, 0, MDB); vrCage(11, 10, 6, MDB)
  // rez : grande baie au sud, fenetres en bande ailleurs
  for (var x = 5; x <= 15; x++) F(x, 1, Z2, x, 4, Z2, (x - 5) % 4 == 0 ? MDN : GP)
  F(5, 2, Z1, 8, 3, Z1, GP); F(X1, 2, 14, X1, 3, 21, GP); F(X2, 2, 18, X2, 4, 23, GP)
  PORTE(17, 1, Z2, 'minecraft:dark_oak_door', 'south', 'left', 'false'); F(15, 5, 26, 19, 5, 28, 'minecraft:smooth_stone_slab[type=bottom]'); F(19, 0, 28, 19, 4, 28, MDB)
  F(4, 0, 11, 17, 0, 24, MDP); F(4, 0, 11, 10, 0, 15, MDQ)
  // cuisine ouverte : plan de travail au nord, ilot, tabourets
  for (var x = 4; x <= 9; x++) vrCpt(x, 1, 11, 'south', 'quartz_block'); S(4, 2, 11, 'supplementaries:jar'); S(7, 2, 11, 'handcrafted:white_crockery_combo[facing=south,waterlogged=false]')
  vrArm(10, 1, 11, 'south'); vrArm(10, 2, 11, 'south')
  for (var x = 5; x <= 8; x++) vrCpt(x, 1, 13, 'south', 'quartz_block'); vrCh(6, 1, 14, 'north', 'black'); vrCh(8, 1, 14, 'north', 'black')
  // salle a manger et salon face a la baie
  vrTab(5, 1, 18, 'white'); vrTab(6, 1, 18, 'white'); vrCh(5, 1, 17, 'south', 'white'); vrCh(6, 1, 17, 'south', 'white'); vrCh(5, 1, 19, 'north', 'white'); vrCh(6, 1, 19, 'north', 'white'); S(5, 2, 18, 'handcrafted:white_plate')
  for (var x = 10; x <= 15; x++) for (var z = 20; z <= 22; z++) S(x, 1, z, 'minecraft:light_gray_carpet')
  for (var x = 11; x <= 14; x++) vrCanape(x, 1, 19, 'south', 'gray'); vrTab(12, 1, 21, 'black'); vrTab(13, 1, 21, 'black'); S(12, 2, 21, 'handcrafted:stackable_book')
  vrCanape(16, 1, 20, 'west', 'gray'); vrCanape(16, 1, 21, 'west', 'gray'); S(16, 1, 23, choix(VRPOT)); S(4, 1, 24, choix(VRPOT))
  mdTV(9, 1, 21, 'east'); vrDebris(4, 4, 16, 17, 24, 1)
  // etage : salle de bains, palier, deux chambres
  F(4, 7, 15, 10, 11, 15, MDB); F(4, 7, 18, 17, 11, 18, MDB); F(11, 7, 19, 11, 11, 24, MDB)
  mdPorteVide(13, 1, 15); mdPorteVide(13, 7, 15); PORTE(8, 7, 15, 'minecraft:birch_door', 'south', 'left', 'false'); PORTE(6, 7, 18, 'minecraft:birch_door', 'south', 'left', 'false'); PORTE(14, 7, 18, 'minecraft:birch_door', 'south', 'right', 'false')
  F(4, 6, 16, 17, 6, 17, MDP); S(16, 7, 16, choix(VRPOT)); S(4, 7, 16, 'handcrafted:birch_shelf[facing=east,shape=single,type=1]')
  piece(cadre(4, 11, 10, 14, 'north', 6, 5), 'sdb', 0); piece(cadre(4, 19, 10, 24, 'south', 6, 5), 'chambre', 0); piece(cadre(12, 19, 17, 24, 'south', 6, 5), 'chambre', 1)
  F(5, 8, Z2, 8, 10, Z2, GP); F(13, 8, Z2, 16, 10, Z2, GP); F(5, 8, Z1, 8, 10, Z1, GP); F(X2, 8, 20, X2, 10, 22, GP); F(X1, 8, 20, X1, 10, 22, GP)
  vrVolees(11, 10, 0, MDB, 'polished_andesite')
  vrPlaf(0, 5, 12, 17, 24, 4); vrPlaf(6, 5, 16, 17, 24, 4)
  // toit : panneaux solaires, groupe de clim
  mdPanneaux(4, 12, 16, 22, 13); F(5, 13, 23, 6, 14, 24, MDG); S(5, 15, 23, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false]')
  // terrasse en bois, piscine, transats, parasol
  F(20, -1, 8, 30, -1, 29, MDP); F(19, -1, 20, 19, -1, 25, MDP)
  F(21, -4, 10, 28, -1, 25, MDQ); F(22, -3, 11, 27, -1, 24, 'minecraft:water'); S(23, 0, 14, 'minecraft:lily_pad'); S(26, 0, 21, 'minecraft:lily_pad')
  ;[12, 15, 18].forEach(z => vrCanape(30, 0, z, 'west', 'white'))
  F(29, 0, 22, 29, 2, 22, 'minecraft:iron_bars'); F(28, 3, 21, 30, 3, 23, 'minecraft:white_wool')
  // jardin : haie, allee, arbre, potager en bacs
  for (var x = 0; x <= 31; x++) if (x < 15 || x > 18) S(x, 0, 30, MDHAIE)
  for (var z = 0; z <= 29; z++) { S(0, 0, z, MDHAIE); S(31, 0, z, MDHAIE) }
  for (var x = 1; x <= 30; x++) S(x, 0, 0, MDHAIE)
  F(15, -1, 26, 18, -1, 31, 'mcwpaths:stone_flagstone'); btArbre(7, 5, 5); btArbre(25, 4, 4)
  ;[3, 9].forEach(x => { S(x, 0, 28, 'minecraft:spruce_planks'); S(x + 3, 0, 28, 'minecraft:spruce_planks'); F(x + 1, 0, 28, x + 2, 0, 28, 'minecraft:dirt'); S(x + 1, 1, 28, 'minecraft:sweet_berry_bush[age=1]'); S(x + 2, 1, 28, 'minecraft:sweet_berry_bush[age=2]') })
}

// ================= RESIDENCE R+4 (balcons vitres, bardage bois, boulangerie au rez) =================
function mdResidence() {
  btDalle(0, 0, 31, 31)
  var NIV = 5, Y = k => 6 * k, X1 = 4, X2 = 27, Z1 = 6, Z2 = 25
  for (var k = 0; k <= NIV; k++) F(X1, Y(k), Z1, X2, Y(k), Z2, MDS)
  for (var k = 0; k < NIV; k++) {
    var y = Y(k)
    W(X1, Z1, X2, Z2, y + 1, y + 5, MDB)
    // bardage bois entre les baies du sud, bandeau gris a chaque plancher
    F(14, y + 1, Z2, 17, y + 5, Z2, MDL)
    vrCage(12, 6, y, MDG)
    ;[[6, 7], [9, 10], [21, 22], [24, 25]].forEach(w => F(w[0], y + 2, Z1, w[1], y + 4, Z1, GP))
    if (k > 0) {
      F(6, y + 1, Z2, 13, y + 4, Z2, GP); F(18, y + 1, Z2, 25, y + 4, Z2, GP)
      F(X1, y + 2, 16, X1, y + 4, 17, GP); F(X1, y + 2, 20, X1, y + 4, 23, GP); F(X2, y + 2, 16, X2, y + 4, 17, GP); F(X2, y + 2, 20, X2, y + 4, 23, GP)
      // balcons
      F(5, y, 26, 14, y, 27, MDS); F(17, y, 26, 26, y, 27, MDS)
      F(5, y + 1, 27, 14, y + 1, 27, GP); F(5, y + 1, 26, 5, y + 1, 26, GP); F(14, y + 1, 26, 14, y + 1, 26, GP)
      F(17, y + 1, 27, 26, y + 1, 27, GP); F(17, y + 1, 26, 17, y + 1, 26, GP); F(26, y + 1, 26, 26, y + 1, 26, GP)
      vrCh(7, y + 1, 26, 'south', 'white'); S(12, y + 1, 26, choix(VRPOT)); vrCh(24, y + 1, 26, 'south', 'white'); S(19, y + 1, 26, choix(VRPOT))
      mdLogements(y, k)
    } else mdResidenceRez()
    S(16, y + 1, 11, AIR); S(16, y + 2, 11, AIR); PORTE(16, y + 1, 11, 'minecraft:iron_door', 'south', 'left', 'false')
  }
  for (var k = 0; k < NIV; k++) vrVolees(12, 6, Y(k), MDG, 'polished_andesite')
  for (var k = 0; k < NIV; k++) vrPlaf(Y(k), 5, 7, 26, 24, 4)
  var yt = Y(NIV)
  W(X1, Z1, X2, Z2, yt + 1, yt + 1, MDB); W(12, 6, 19, 11, yt + 1, yt + 4, MDG); F(13, yt + 1, 7, 18, yt + 4, 10, AIR); F(12, yt + 5, 6, 19, yt + 5, 11, MDS)
  PORTE(16, yt + 1, 11, 'minecraft:iron_door', 'south', 'left', 'true')
  mdPanneaux(5, 14, 25, 23, yt + 1); F(22, yt + 1, 8, 24, yt + 2, 9, MDG); F(6, yt + 1, 8, 7, yt + 3, 9, 'minecraft:iron_block')
}
function mdLogements(y, k) {
  // couloir z12..13 ; au nord deux studios (x5..11, x20..26) ; au sud deux T3 (x5..14, x17..26)
  F(5, y + 1, 11, 11, y + 5, 11, MDB); F(20, y + 1, 11, 26, y + 5, 11, MDB)
  F(5, y + 1, 14, 26, y + 5, 14, MDB); F(15, y + 1, 15, 16, y + 5, 24, MDB); F(5, y + 1, 18, 14, y + 5, 18, MDB); F(17, y + 1, 18, 26, y + 5, 18, MDB)
  F(9, y + 1, 15, 9, y + 5, 17, MDB); F(22, y + 1, 15, 22, y + 5, 17, MDB)
  F(5, y, 12, 26, y, 13, MDA); S(26, y + 1, 12, choix(VRPOT))
  var et = (k % 2) == 0
  piece(cadre(5, 7, 11, 10, 'north', y, 5), 'chambre', et ? 1 : 0); piece(cadre(20, 7, 26, 10, 'north', y, 5), 'chambre', et ? 0 : 1)
  piece(cadre(5, 19, 14, 24, 'south', y, 5), 'salon', 0); piece(cadre(17, 19, 26, 24, 'south', y, 5), 'salon', et ? 1 : 0)
  piece(cadre(5, 15, 8, 17, 'west', y, 5), 'chambre', 0); piece(cadre(23, 15, 26, 17, 'east', y, 5), 'chambre', 1)
  piece(cadre(10, 15, 14, 17, 'north', y, 5), 'cuisine', 0); piece(cadre(17, 15, 21, 17, 'north', y, 5), 'cuisine', et ? 1 : 0)
  PORTE(8, y + 1, 11, 'minecraft:birch_door', 'north', 'left', 'false'); PORTE(23, y + 1, 11, 'minecraft:birch_door', 'north', 'right', 'false')
  PORTE(12, y + 1, 14, 'minecraft:birch_door', 'south', 'left', 'false'); PORTE(19, y + 1, 14, 'minecraft:birch_door', 'south', 'right', 'false')
  F(10, y + 1, 18, 14, y + 5, 18, AIR); F(17, y + 1, 18, 21, y + 5, 18, AIR); mdPorteVide(9, y + 1, 16); mdPorteVide(22, y + 1, 16)
  if (k == 3) { for (var x = 6; x <= 13; x += 3) SA(x, y + 1, 13, 'supplementaries:sack'); S(20, y + 1, 12, 'minecraft:barrel[facing=up,open=false]') }
}
function mdResidenceRez() {
  // hall vitre au centre, local velos a l'ouest, boulangerie a l'est
  F(12, 1, 12, 12, 5, 24, MDB); F(19, 1, 12, 19, 5, 24, MDB)
  F(13, 1, 25, 18, 4, 25, GP); PORTE(15, 1, 25, 'minecraft:iron_door', 'south', 'left', 'false'); PORTE(16, 1, 25, 'minecraft:iron_door', 'south', 'right', 'true')
  F(13, 0, 12, 18, 0, 24, MDQ); for (var z = 15; z <= 21; z += 2) S(13, 2, z, 'minecraft:iron_trapdoor[facing=east,half=top,open=true]')
  S(18, 1, 22, choix(VRPOT)); S(13, 1, 24, choix(VRPOT)); F(15, 6, 26, 16, 6, 27, 'minecraft:smooth_stone_slab[type=bottom]')
  // local velos
  F(6, 1, 25, 10, 3, 25, GP); for (var z = 13; z <= 23; z += 2) { S(6, 1, z, 'minecraft:iron_bars'); S(8, 1, z, 'minecraft:iron_bars') } ; vrDebris(4, 5, 12, 11, 24, 1)
  PORTE(12, 1, 18, 'minecraft:iron_door', 'west', 'left', 'false')
  // boulangerie : vitrine, comptoir, etageres, petite salle
  F(20, 1, 25, 26, 4, 25, GP); PORTE(23, 1, 25, 'minecraft:spruce_door', 'south', 'left', 'false'); F(20, 5, 26, 26, 5, 27, 'minecraft:red_concrete')
  F(20, 0, 12, 26, 0, 24, MDP)
  for (var x = 20; x <= 26; x++) { if (x == 23) continue; vrCpt(x, 1, 19, 'south', 'smooth_stone'); if (R() < 0.6) S(x, 2, 19, choix(['supplementaries:jar', 'handcrafted:white_plate', 'handcrafted:white_bowl'])) }
  for (var x = 20; x <= 26; x++) { vrEtag(x, 1, 13, 'south'); vrEtag(x, 2, 13, 'south') }
  vrTab(21, 1, 23, 'white'); vrCh(21, 1, 22, 'south', 'red'); vrTab(25, 1, 23, 'white'); vrCh(25, 1, 22, 'south', 'red')
  S(26, 1, 17, 'minecraft:furnace[facing=west,lit=false]'); S(26, 1, 16, 'minecraft:smoker[facing=west,lit=false]'); S(20, 1, 15, 'supplementaries:sack')
  ;[[6, 7], [9, 10], [21, 22], [24, 25]].forEach(w => F(w[0], 2, 6, w[1], 4, 6, MDB))
  // abords : arceaux, bancs, bac a arbuste
  for (var x = 4; x <= 10; x += 2) S(x, 0, 29, 'minecraft:iron_bars'); S(22, 0, 29, 'minecraft:flowering_azalea'); S(22, -1, 29, 'minecraft:grass_block')
}

// ================= MEDIATHEQUE (verre et bois, mezzanine, toit vegetal) =================
function mdMediatheque() {
  btDalle(0, 0, 31, 31)
  var X1 = 3, X2 = 28, Z1 = 5, Z2 = 26
  F(X1, 0, Z1, X2, 0, Z2, MDP); F(X1, 12, Z1, X2, 12, Z2, MDS)
  vrMurRideau(X1, Z1, X2, Z2, 1, 11, 3, GP, MDL)
  F(X1, 1, Z1, X2, 11, Z1, MDB); for (var x = 5; x <= 26; x += 4) F(x, 8, Z1, x + 1, 10, Z1, GP)
  F(X1, 6, Z1, X2, 6, 15, MDS)
  F(4, 7, 15, 25, 7, 15, GP)
  // toit vegetal
  F(X1, 13, Z1, X2, 13, Z2, 'minecraft:moss_block'); W(X1, Z1, X2, Z2, 14, 14, MDB)
  for (var x = 5; x <= 26; x += 3) for (var z = 7; z <= 24; z += 4) S(x + (z % 2), 14, z, choix(['minecraft:azalea', 'minecraft:flowering_azalea', 'minecraft:moss_carpet']))
  // entree au sud : portes, auvent
  F(14, 1, Z2, 17, 4, Z2, GP); PORTE(15, 1, Z2, 'minecraft:iron_door', 'south', 'left', 'false'); PORTE(16, 1, Z2, 'minecraft:iron_door', 'south', 'right', 'false')
  F(12, 5, 27, 19, 5, 29, 'minecraft:smooth_stone_slab[type=bottom]'); F(12, 0, 29, 12, 4, 29, MDL); F(19, 0, 29, 19, 4, 29, MDL)
  // rayonnages au nord, sous la mezzanine
  for (var x = 6; x <= 24; x += 3) for (var z = 8; z <= 13; z++) F(x, 1, z, x, 3, z, 'minecraft:bookshelf')
  for (var x = 5; x <= 26; x++) F(x, 1, 6, x, 3, 6, 'minecraft:bookshelf')
  // accueil, coin enfants, tables de lecture
  for (var x = 18; x <= 22; x++) vrCpt(x, 1, 18, 'south', 'birch_planks'); vrCh(20, 1, 17, 'south', 'gray'); S(18, 2, 18, 'handcrafted:stackable_book')
  for (var x = 5; x <= 10; x++) for (var z = 21; z <= 24; z++) S(x, 1, z, 'minecraft:' + ['yellow', 'lime', 'light_blue', 'pink'][(x + z) % 4] + '_carpet')
  vrCanape(5, 1, 20, 'south', 'yellow'); vrCanape(6, 1, 20, 'south', 'yellow'); S(9, 1, 20, 'supplementaries:book_pile')
  ;[[13, 21], [13, 24], [23, 22]].forEach(t => { vrTab(t[0], 1, t[1], 'none'); vrTab(t[0] + 1, 1, t[1], 'none'); vrCh(t[0], 1, t[1] - 1, 'south'); vrCh(t[0] + 1, 1, t[1] + 1, 'north'); S(t[0], 2, t[1], choix(VRPAP)) })
  // escalier droit contre le mur est, de z21 a la mezzanine
  for (var i = 0; i < 6; i++) { var z = 21 - i; F(26, 1 + i, z, 27, 1 + i, z, btSt('spruce', 'north')); if (i > 0) F(26, 1, z, 27, i, z, MDP) }
  // mezzanine : postes de lecture et rayonnages
  for (var x = 5; x <= 24; x += 4) { vrBur(x, 7, 13, 'south'); vrCh(x, 7, 14, 'north'); vrBur(x + 1, 7, 13, 'south') ; S(x + 1, 8, 13, choix(VRPAP)) }
  for (var x = 5; x <= 26; x++) F(x, 7, 6, x, 9, 6, 'minecraft:bookshelf')
  for (var x = 7; x <= 23; x += 4) F(x, 7, 9, x + 1, 9, 9, 'minecraft:bookshelf')
  vrDebris(8, 4, 16, 27, 25, 1); vrDebris(5, 4, 7, 27, 15, 7)
  vrPlaf(0, 5, 7, 26, 15, 4); vrPlaf(6, 5, 7, 26, 15, 4)
  for (var x = 6; x <= 26; x += 5) for (var z = 18; z <= 24; z += 5) { S(x, 11, z, 'minecraft:chain[axis=y]'); S(x, 10, z, 'mcwlights:iron_chandelier') }
  // parvis : arceaux, banc, boite de retour
  for (var x = 4; x <= 9; x += 2) S(x, 0, 29, 'minecraft:iron_bars'); gtBanc(22, 29, 'south', 3); S(10, 0, 28, MDG); S(10, 1, 28, 'minecraft:iron_trapdoor[facing=south,half=top,open=false]')
  btArbre(29, 29, 4)
}

// ================= MAISONS DE VILLE (trois maisons mitoyennes, jardins a l'arriere) =================
function mdMaisons() {
  F(0, -1, 0, 31, -1, 31, 'minecraft:grass_block')
  var FAC = [MDB, 'minecraft:smooth_sandstone', MDG], Z1 = 10, Z2 = 22
  ;[3, 11, 19].forEach((xl, i) => {
    var xr = xl + 8, M = FAC[i]
    F(xl, 0, Z1, xr, 0, Z2, MDS); F(xl, 6, Z1, xr, 6, Z2, MDS); F(xl, 12, Z1, xr, 12, Z2, MDS)
    W(xl, Z1, xr, Z2, 1, 5, M); W(xl, Z1, xr, Z2, 7, 11, M); W(xl, Z1, xr, Z2, 13, 13, M)
    F(xl, 6, Z2, xr, 6, Z2, MDN); F(xl, 12, Z2, xr, 12, Z2, MDN)
    // facade rue (sud) : porte, baie, fenetres de l'etage ; jardin (nord) : porte-fenetre
    PORTE(xl + 6, 1, Z2, 'minecraft:dark_oak_door', 'south', 'left', 'false'); F(xl + 2, 2, Z2, xl + 4, 4, Z2, GP); F(xl + 2, 8, Z2, xl + 6, 10, Z2, GP)
    F(xl + 4, 1, Z1, xl + 6, 4, Z1, GP); F(xl + 2, 8, Z1, xl + 6, 10, Z1, GP)
    F(xl + 5, 5, Z2 + 1, xl + 7, 5, Z2 + 1, 'minecraft:smooth_stone_slab[type=bottom]')
    // rez : cuisine au nord, sejour au sud, escalier droit contre le mur ouest
    F(xl + 1, 0, Z1 + 1, xr - 1, 0, Z2 - 1, MDP); F(xl + 2, 0, Z1 + 1, xr - 1, 0, Z1 + 4, MDQ)
    mdEsc(xl + 1, xl + 1, Z1 + 2, 0, 6, 1, 'spruce', MDP)
    mdGarde(xl + 2, Z1 + 1, Z1 + 6, 7); S(xl + 1, 7, Z1 + 1, GP)
    for (var x = xl + 3; x <= xr - 1; x++) vrCpt(x, 1, Z1 + 1, 'south', 'smooth_stone'); S(xr - 1, 2, Z1 + 1, 'supplementaries:jar'); vrArm(xl + 2, 1, Z1 + 1, 'south')
    vrTab(xl + 4, 1, Z1 + 4, 'white'); vrTab(xl + 5, 1, Z1 + 4, 'white'); vrCh(xl + 4, 1, Z1 + 5, 'north'); vrCh(xl + 5, 1, Z1 + 5, 'north'); vrCh(xl + 6, 1, Z1 + 4, 'west')
    vrCanape(xl + 3, 1, Z2 - 3, 'south', ['blue', 'green', 'brown'][i]); vrCanape(xl + 4, 1, Z2 - 3, 'south', ['blue', 'green', 'brown'][i]); vrTab(xl + 3, 1, Z2 - 1, 'none')
    mdTV(xr - 1, 1, Z2 - 2, 'west'); S(xr - 1, 1, Z2 - 5, choix(VRPOT)); S(xr - 1, 1, Z2 - 1, choix(VRPOT)); for (var x = xl + 2; x <= xl + 5; x++) S(x, 1, Z2 - 2, 'minecraft:' + ['white', 'gray', 'light_gray'][i] + '_carpet')
    // etage : chambre sur jardin, chambre sur rue, cloison z16
    F(xl + 2, 7, 16, xr - 1, 11, 16, M); mdPorteVide(xl + 3, 7, 16)
    piece(cadre(xl + 3, Z1 + 1, xr - 1, 15, 'north', 6, 5), 'chambre', i == 1 ? 1 : 0); piece(cadre(xl + 2, 17, xr - 1, Z2 - 1, 'south', 6, 5), 'chambre', 0)
    vrPlaf(0, xl + 3, Z1 + 2, xr - 1, Z2 - 1, 3); vrPlaf(6, xl + 3, Z1 + 2, xr - 1, Z2 - 1, 3)
    // toit terrasse : bacs, chaise, chauffe-eau solaire
    mdPanneaux(xl + 1, Z1 + 1, xl + 3, Z1 + 4, 13); vrCh(xl + 5, 13, Z2 - 2, 'south'); S(xl + 7, 13, Z2 - 2, choix(VRPOT))
    // jardin arriere clos, allee et voiture devant
    for (var z = 1; z <= Z1 - 1; z++) { S(xl, 0, z, 'minecraft:spruce_fence'); S(xr, 0, z, 'minecraft:spruce_fence') }
    for (var x = xl; x <= xr; x++) S(x, 0, 1, 'minecraft:spruce_fence')
    F(xl + 4, -1, Z1 - 3, xl + 6, -1, Z1 - 1, 'mcwpaths:stone_flagstone'); vrTab(xl + 5, 0, Z1 - 2, 'white'); vrCh(xl + 4, 0, Z1 - 2, 'east'); vrCh(xl + 6, 0, Z1 - 2, 'west')
    F(xl + 6, -1, Z2 + 1, xl + 7, -1, 31, 'mcwpaths:stone_flagstone'); F(xl + 1, -1, Z2 + 3, xl + 4, -1, 31, 'mcwpaths:andesite_flagstone')
    bgVoiture(xl + 2, Z2 + 4, 'z', ['red', 'white', 'blue'][i], i == 2 ? 1 : 0)
  })
  // details de jardins
  btArbre(7, 4, 4); S(14, 0, 4, 'minecraft:composter[level=3]'); S(24, 0, 5, 'minecraft:flowering_azalea'); S(22, 0, 3, 'minecraft:barrel[facing=up,open=false]')
}

// ================= CONCESSION ELECTRIQUE (showroom vitre, ombrieres solaires, bornes) =================
function mdConcession() {
  btDalle(0, 0, 31, 31)
  // showroom au fond (z12..28), parking couvert devant (z0..9) cote rue
  OZ += 8
  var X1 = 3, X2 = 28, Z1 = 4, Z2 = 20
  F(X1, 0, Z1, X2, 0, Z2, MDQ); F(X1, 7, Z1, X2, 7, Z2, MDS); F(X1, 8, Z1, X2, 8, Z2, MDB)
  vrMurRideau(X1, Z1, X2, Z2, 1, 6, 4, GP, MDB)
  F(X1, 1, Z2, X2, 6, Z2, MDB); F(5, 2, Z2, 9, 4, Z2, GP)
  PORTE(15, 1, Z1, 'minecraft:iron_door', 'north', 'left', 'false'); PORTE(16, 1, Z1, 'minecraft:iron_door', 'north', 'right', 'false')
  for (var x = X1; x <= X2; x++) S(x, 7, Z1 - 1, 'minecraft:smooth_stone_slab[type=bottom]')
  // voitures exposees, accueil, bureaux vitres au fond
  btVoitureY(1, 6, 7, 'x', 'white', 0); btVoitureY(1, 13, 10, 'x', 'light_blue', 0); btVoitureY(1, 21, 7, 'x', 'red', 1)
  F(6, 0, 14, 25, 0, 14, MDN)
  for (var x = 4; x <= 27; x++) F(x, 1, 15, x, 6, 15, x % 6 == 2 ? MDB : GP)
  ;[11, 17, 23].forEach(x => mdPorteVide(x, 1, 15))
  ;[[5, 10], [12, 16], [18, 22], [24, 27]].forEach((b, i) => { vrBur(b[0] + 1, 1, 18, 'north'); vrCh(b[0] + 1, 1, 19, 'north'); vrCh(b[0] + 1, 1, 17, 'south', 'white'); if (i % 2) S(b[0] + 3, 1, 19, choix(VRPOT)) })
  for (var x = 19; x <= 23; x++) vrCpt(x, 1, 12, 'north', 'quartz_block'); vrCh(21, 1, 13, 'north', 'black'); S(19, 2, 12, 'handcrafted:stackable_book')
  vrCanape(4, 1, 6, 'east', 'black'); vrCanape(4, 1, 7, 'east', 'black'); vrTab(5, 1, 11, 'black'); vrCh(5, 1, 12, 'north', 'black')
  S(27, 1, 5, choix(VRPOT)); S(4, 1, 13, choix(VRPOT)); vrDebris(4, 4, 5, 27, 13, 1)
  vrPlaf(1, 5, 5, 26, 19, 4)
  mdPanneaux(4, 6, 27, 18, 9)
  for (var z = 6; z <= 18; z++) S(0, 0, z, MDHAIE)
  F(30, 0, 6, 30, 1, 8, 'minecraft:black_concrete'); S(30, 2, 7, 'minecraft:black_carpet')
  OZ -= 8
  // parking : marquage, bornes de recharge, ombriere a panneaux solaires
  F(0, -1, 0, 31, -1, 10, MDN); for (var x = 3; x <= 31; x += 4) F(x, -1, 3, x, -1, 8, MDB)
  for (var x = 5; x <= 29; x += 8) { S(x, 0, 9, MDB); S(x, 1, 9, 'minecraft:green_stained_glass_pane') }
  ;[1, 10, 18, 26, 30].forEach(x => { F(x, 0, 2, x, 3, 2, 'minecraft:iron_bars'); F(x, 0, 8, x, 3, 8, 'minecraft:iron_bars') })
  F(1, 4, 2, 30, 4, 8, 'minecraft:smooth_stone_slab[type=bottom]')
  for (var x = 2; x <= 29; x++) for (var z = 3; z <= 7; z++) if ((x + z) % 3 != 0) S(x, 4, z, 'minecraft:daylight_detector[inverted=false,power=0]')
  bgVoiture(4, 4, 'z', 'white', 0); bgVoiture(12, 4, 'z', 'gray', 1); bgVoiture(24, 4, 'z', 'black', 0)
}

// ================= PARC DE QUARTIER (etang, aire de jeux, pergola, agres) =================
function mdParc() {
  F(0, -1, 0, 31, -1, 31, 'minecraft:grass_block')
  for (var x = 0; x <= 31; x++) for (var z = 0; z <= 31; z++) if (R() < 0.06) S(x, 0, z, choix(['minecraft:short_grass', 'minecraft:dandelion', 'minecraft:poppy', 'minecraft:oxeye_daisy']))
  // allees en croix
  F(14, -1, 0, 17, -1, 31, 'mcwpaths:stone_flagstone'); F(0, -1, 14, 31, -1, 17, 'mcwpaths:stone_flagstone'); F(14, 0, 0, 17, 0, 31, AIR); F(0, 0, 14, 31, 0, 17, AIR)
  // etang (nord-est)
  F(20, -3, 3, 29, -1, 11, 'minecraft:mud'); F(21, -2, 4, 28, -1, 10, 'minecraft:water'); F(20, -1, 3, 20, -1, 11, 'minecraft:stone'); F(29, -1, 3, 29, -1, 11, 'minecraft:stone'); F(20, -1, 3, 29, -1, 3, 'minecraft:stone'); F(20, -1, 11, 29, -1, 11, 'minecraft:stone')
  F(20, 0, 3, 29, 0, 11, AIR); S(23, 0, 6, 'minecraft:lily_pad'); S(26, 0, 9, 'minecraft:lily_pad'); 
  F(23, -1, 9, 24, -1, 13, MDP); gtBanc(25, 13, 'north', 2)
  // aire de jeux (nord-ouest)
  F(2, -1, 2, 11, -1, 11, 'minecraft:red_terracotta'); F(2, 0, 2, 11, 0, 11, AIR)
  F(3, 0, 3, 3, 2, 3, 'minecraft:iron_bars'); S(3, 3, 3, 'minecraft:smooth_quartz_slab[type=bottom]'); for (var i = 0; i < 3; i++) S(4 + i, 2 - i, 3, btSt('smooth_quartz', 'west')); S(5, 0, 3, 'minecraft:iron_bars'); F(2, 0, 3, 2, 2, 3, 'minecraft:ladder[facing=west,waterlogged=false]')
  F(7, 0, 8, 7, 3, 8, 'minecraft:iron_bars'); F(11, 0, 8, 11, 3, 8, 'minecraft:iron_bars'); F(7, 4, 8, 11, 4, 8, 'minecraft:iron_bars')
  ;[8, 10].forEach(x => { F(x, 2, 8, x, 3, 8, 'minecraft:chain[axis=y]'); S(x, 1, 8, 'minecraft:spruce_slab[type=top]') })
  F(4, -1, 6, 5, -1, 7, 'minecraft:sand'); W(1, 1, 12, 12, 0, 0, 'minecraft:spruce_fence'); S(12, 0, 6, AIR); S(12, 0, 7, AIR)
  // pergola et tables (sud-ouest)
  ;[[3, 20], [11, 20], [3, 27], [11, 27]].forEach(p => F(p[0], 0, p[1], p[0], 3, p[1], MDL))
  for (var x = 3; x <= 11; x++) { S(x, 4, 20, 'minecraft:spruce_slab[type=bottom]'); S(x, 4, 27, 'minecraft:spruce_slab[type=bottom]') }
  for (var z = 21; z <= 26; z += 2) F(3, 4, z, 11, 4, z, 'minecraft:spruce_slab[type=bottom]')
  for (var z = 21; z <= 26; z++) { S(3, 4, z, 'minecraft:spruce_slab[type=bottom]'); S(11, 4, z, 'minecraft:spruce_slab[type=bottom]') }
  for (var x = 4; x <= 10; x += 3) S(x, 4, 22, 'minecraft:oak_leaves[persistent=true]')
  F(4, -1, 21, 10, -1, 26, 'mcwpaths:andesite_flagstone')
  ;[[5, 23], [9, 23]].forEach(t => { vrTab(t[0], 0, t[1], 'none'); vrTab(t[0], 0, t[1] + 1, 'none'); vrCh(t[0] - 1, 0, t[1], 'east'); vrCh(t[0] + 1, 0, t[1] + 1, 'west') })
  // agres (sud-est) et terrain de petanque
  F(20, -1, 20, 29, -1, 29, 'minecraft:gravel'); F(21, 0, 21, 21, 2, 21, 'minecraft:iron_bars'); F(24, 0, 21, 24, 2, 21, 'minecraft:iron_bars'); F(21, 3, 21, 24, 3, 21, 'minecraft:iron_bars')
  F(27, 0, 24, 27, 1, 24, 'minecraft:iron_bars'); F(27, 0, 27, 27, 1, 27, 'minecraft:iron_bars'); F(27, 2, 24, 27, 2, 27, 'minecraft:iron_bars')
  S(22, 0, 26, 'minecraft:spruce_trapdoor[facing=north,half=bottom,open=false]'); S(23, 0, 26, 'minecraft:spruce_trapdoor[facing=north,half=bottom,open=false]')
  // arbres, bancs le long des allees, lampadaires, campement abandonne
  btArbre(27, 18, 5); btArbre(12, 29, 4); btArbre(19, 29, 4); btArbre(19, 1, 4); btArbre(10, 13, 4)
  gtBanc(19, 13, 'north', 3); gtBanc(10, 18, 'south', 3)
  btLampe(13, 13, 'east'); btLampe(18, 18, 'east')
  S(6, 0, 30, 'minecraft:campfire[lit=false,facing=north,signal_fire=false,waterlogged=false]'); S(7, 0, 30, 'supplementaries:sack'); vrLitS(3, 0, 30, 'green', 'east')
}

// ================= GYMNASE DEVENU CENTRE D'HEBERGEMENT =================
function mdGymnase() {
  btDalle(0, 0, 31, 31)
  var X1 = 3, X2 = 28, Z1 = 4, Z2 = 26
  F(X1, 0, Z1, X2, 0, Z2, MDS); F(X1, 10, Z1, X2, 10, Z2, MDS)
  W(X1, Z1, X2, Z2, 1, 9, MDG); W(X1, Z1, X2, Z2, 11, 11, MDG)
  for (var x = 5; x <= 26; x++) F(x, 6, Z1, x, 8, Z1, x % 4 == 0 ? MDG : 'minecraft:light_blue_stained_glass_pane'); for (var x = 5; x <= 26; x++) F(x, 6, Z2, x, 8, Z2, x % 4 == 0 ? MDG : 'minecraft:light_blue_stained_glass_pane')
  F(X1, 1, Z1, X2, 1, Z1, 'minecraft:orange_concrete'); F(X1, 9, Z1, X2, 9, Z1, 'minecraft:orange_concrete')
  PORTE(15, 1, Z1, 'minecraft:iron_door', 'north', 'left', 'true'); PORTE(16, 1, Z1, 'minecraft:iron_door', 'north', 'right', 'false')
  F(13, 5, 1, 18, 5, 3, 'minecraft:smooth_stone_slab[type=bottom]')
  // vestiaires au nord (z5..9), terrain au sud
  F(4, 1, 10, 27, 5, 10, MDB); F(9, 1, 5, 9, 5, 9, MDB); F(22, 1, 5, 22, 5, 9, MDB); F(4, 6, 5, 27, 6, 9, MDS)
  mdPorteVide(6, 1, 10); mdPorteVide(25, 1, 10); mdPorteVide(14, 1, 10); mdPorteVide(17, 1, 10)
  for (var x = 4; x <= 8; x++) { vrArm(x, 1, 5, 'south'); vrArm(x, 2, 5, 'south') } for (var x = 23; x <= 27; x++) { vrArm(x, 1, 5, 'south'); vrArm(x, 2, 5, 'south') }
  F(5, 1, 8, 7, 1, 8, 'minecraft:spruce_slab[type=bottom]'); F(24, 1, 8, 26, 1, 8, 'minecraft:spruce_slab[type=bottom]')
  F(10, 0, 5, 21, 0, 9, MDQ)
  // terrain : parquet, lignes, paniers aux deux bouts
  F(4, 0, 11, 27, 0, 25, 'minecraft:stripped_oak_wood[axis=x]'); W(5, 12, 26, 24, 0, 0, MDB); F(15, 0, 12, 15, 0, 24, MDB)
  ;[4, 27].forEach((x, i) => { F(x, 1, 18, x, 6, 18, MDB); S(i ? x - 1 : x + 1, 5, 18, 'minecraft:iron_trapdoor[facing=' + (i ? 'east' : 'west') + ',half=top,open=false]') })
  // gradins contre le mur sud
  for (var x = 6; x <= 25; x++) S(x, 1, 25, btSt('stone', 'south'))
  // centre d'hebergement : lits de camp en rangees sur la moitie ouest, tables de distribution
  for (var x = 6; x <= 13; x += 2) for (var z = 13; z <= 23; z += 3) { vrLitS(x, 1, z, ['green', 'blue', 'gray'][(x + z) % 3], 'south'); if (R() < 0.35) S(x + 1, 1, z, 'supplementaries:sack') }
  for (var x = 18; x <= 23; x++) vrTab(x, 1, 14, 'none'); for (var x = 18; x <= 23; x++) if (x % 2) S(x, 2, 14, choix(['supplementaries:jar', 'handcrafted:white_bowl', 'handcrafted:white_cup']))
  for (var x = 18; x <= 23; x += 2) { S(x, 1, 22, 'minecraft:barrel[facing=up,open=false]'); S(x, 1, 23, 'minecraft:barrel[facing=up,open=false]'); S(x + 1, 1, 22, 'minecraft:cauldron') }
  vrDebris(10, 4, 11, 25, 25, 1)
  for (var x = 6; x <= 26; x += 5) for (var z = 13; z <= 24; z += 5) { S(x, 9, z, 'minecraft:chain[axis=y]'); S(x, 8, z, 'minecraft:lantern[hanging=true]') }
  vrPlaf(0, 5, 6, 26, 9, 4)
  // abords : barrieres, sacs, panneaux solaires
  for (var x = 0; x <= 31; x++) if (x < 13 || x > 18) S(x, 0, 0, 'minecraft:iron_bars')
  for (var x = 10; x <= 12; x++) { S(x, 0, 2, 'supplementaries:sack'); S(x, 1, 2, 'supplementaries:sack') }
  mdPanneaux(5, 6, 26, 24, 11)
  S(28, 0, 29, 'minecraft:green_concrete'); S(29, 0, 29, 'minecraft:yellow_concrete'); bgVoiture(4, 28, 'x', 'white', 1)
}

// ================= MAISON A TOIT VEGETAL (plain-pied en L, patio, garage) =================
function mdEco() {
  F(0, -1, 0, 31, -1, 31, 'minecraft:grass_block')
  // aile principale x4..22 z6..14, aile chambres x4..12 z15..26, garage x23..29 z6..14
  F(4, 0, 6, 22, 0, 14, MDS); F(4, 0, 15, 12, 0, 26, MDS); F(23, 0, 6, 29, 0, 14, MDN)
  W(4, 6, 22, 14, 1, 4, MDW); W(4, 14, 12, 26, 1, 4, MDW); W(23, 6, 29, 14, 1, 4, MDB)
  F(5, 1, 14, 11, 4, 14, AIR)
  F(4, 5, 6, 22, 5, 14, MDS); F(4, 5, 15, 12, 5, 26, MDS); F(23, 5, 6, 29, 5, 14, MDS)
  F(4, 6, 6, 22, 6, 14, 'minecraft:moss_block'); F(4, 6, 15, 12, 6, 26, 'minecraft:moss_block'); F(23, 6, 6, 29, 6, 14, 'minecraft:moss_block')
  for (var x = 5; x <= 28; x += 3) for (var z = 7; z <= 13; z += 3) S(x, 7, z, choix(['minecraft:azalea', 'minecraft:moss_carpet', 'minecraft:fern']))
  for (var x = 5; x <= 11; x += 3) for (var z = 17; z <= 25; z += 3) S(x, 7, z, choix(['minecraft:azalea', 'minecraft:moss_carpet']))
  // facades : grandes baies sur le patio (est de l'aile chambres, sud de l'aile principale), entree au nord
  F(13, 1, 14, 21, 4, 14, GP); F(12, 1, 16, 12, 4, 25, GP); for (var z = 18; z <= 24; z += 3) F(12, 1, z, 12, 4, z, MDL); for (var x = 15; x <= 21; x += 3) F(x, 1, 14, x, 4, 14, MDL)
  PORTE(9, 1, 6, 'minecraft:dark_oak_door', 'north', 'left', 'false'); F(5, 2, 6, 7, 3, 6, GP); F(12, 2, 6, 20, 3, 6, GP)
  F(4, 2, 18, 4, 3, 23, GP); F(8, 2, 26, 10, 3, 26, GP)
  // interieur : sejour-cuisine dans l'aile principale, chambres et sdb dans l'aile en retour
  F(5, 0, 7, 21, 0, 13, MDP)
  for (var x = 15; x <= 21; x++) vrCpt(x, 1, 7, 'south', 'quartz_block'); for (var x = 16; x <= 19; x++) vrCpt(x, 1, 10, 'south', 'quartz_block'); vrCh(17, 1, 11, 'north', 'white'); vrCh(18, 1, 11, 'north', 'white'); S(21, 2, 7, 'supplementaries:jar')
  F(6, 1, 8, 9, 1, 11, 'minecraft:green_carpet'); for (var z = 8; z <= 11; z++) vrCanape(10, 1, z, 'west', 'green'); vrTab(7, 1, 9, 'none'); vrTab(7, 1, 10, 'none'); mdTV(5, 1, 9, 'east'); mdTV(5, 1, 10, 'east'); S(11, 1, 13, choix(VRPOT))
  vrTab(14, 1, 12, 'white'); vrTab(15, 1, 12, 'white'); vrCh(14, 1, 11, 'south', 'white'); vrCh(15, 1, 13, 'north', 'white'); vrCh(13, 1, 12, 'east', 'white')
  F(5, 1, 15, 11, 4, 15, MDB); mdPorteVide(8, 1, 15); F(5, 1, 20, 11, 4, 20, MDB); F(8, 1, 21, 8, 4, 25, MDB); mdPorteVide(10, 1, 20); mdPorteVide(6, 1, 20)
  piece(cadre(5, 16, 11, 19, 'west', 0, 4), 'chambre', 0); piece(cadre(5, 21, 7, 25, 'west', 0, 4), 'sdb', 0); piece(cadre(9, 21, 11, 25, 'south', 0, 4), 'chambre', 1)
  vrPlaf(-1, 6, 8, 21, 13, 3)
  // garage : voiture electrique, borne, etabli
  btVoitureY(1, 25, 8, 'z', 'white', 0); S(28, 1, 9, MDB); S(28, 2, 9, 'minecraft:green_stained_glass_pane')
  F(24, 1, 6, 28, 3, 6, MDG)
  vrCpt(28, 1, 13, 'west', 'spruce_planks'); S(28, 2, 13, 'minecraft:flower_pot')
  // patio : terrasse bois, potager sureleve, hamac
  F(13, -1, 15, 30, -1, 29, 'minecraft:grass_block'); F(13, -1, 15, 21, -1, 20, MDP)
  vrTab(16, 0, 17, 'none'); vrTab(17, 0, 17, 'none'); vrCh(16, 0, 16, 'south'); vrCh(17, 0, 18, 'north'); vrCh(18, 0, 17, 'west')
  F(24, 0, 22, 28, 0, 22, 'minecraft:spruce_planks'); F(24, 0, 25, 28, 0, 25, 'minecraft:spruce_planks'); F(24, 0, 23, 24, 0, 24, 'minecraft:spruce_planks'); F(28, 0, 23, 28, 0, 24, 'minecraft:spruce_planks')
  F(25, 0, 23, 27, 0, 24, 'minecraft:dirt'); for (var x = 25; x <= 27; x++) S(x, 1, 23, 'minecraft:sweet_berry_bush[age=2]')
  btArbre(28, 17, 4); btArbre(16, 27, 4)
  // allee, haie, boite aux lettres
  F(8, -1, 0, 10, -1, 5, 'mcwpaths:stone_flagstone'); F(23, -1, 0, 29, -1, 5, MDN)
  for (var z = 0; z <= 31; z++) S(31, 0, z, MDHAIE); for (var x = 0; x <= 30; x++) S(x, 0, 31, MDHAIE)
  S(11, 0, 1, MDN); S(11, 1, 1, 'minecraft:iron_trapdoor[facing=north,half=top,open=false]')
}

// ---- palette et vues ----
var THM_MD = finPalette('birch', {})
function vuesModerneF() {
  vue('md_ensemble_sud', 0, 0, 64, 52, 120, 64, 8, 34, 3000)
  vue('md_ensemble_no', 0, 0, -30, 50, -30, 64, 6, 40, 3000)
  vue('md_rue_ouest', 0, 0, -8, 3, 39.5, 60, 4, 40)
  vue('md_rue_est', 0, 0, 136, 3, 40.5, 64, 4, 40)
  vue('md_villa', 0, 0, 16, 9, 42, 12, 6, 18)
  vue('md_villa_piscine', 0, 0, 30, 6, 31, 22, 1, 14)
  vue('md_villa_salon', 0, 0, 14.5, 2.6, 23.5, 6, 2, 13)
  vue('md_villa_chambre', 0, 0, 5.5, 8.6, 20, 9, 8, 24)
  vue('md_residence', 32, 0, 16, 18, 52, 16, 14, 16)
  vue('md_boulangerie', 32, 0, 22.5, 3.2, 24.3, 22.5, 1, 14)
  vue('md_residence_salon', 32, 0, 6, 14.6, 23.5, 13, 13.5, 19)
  vue('md_residence_toit', 32, 0, 30, 40, 30, 16, 30, 14)
  vue('md_mediatheque', 64, 0, 16, 8, 44, 16, 5, 16)
  vue('md_mediatheque_salle', 64, 0, 9, 3, 24.5, 22, 4, 9)
  vue('md_mediatheque_mezz', 64, 0, 7, 8.6, 15, 24, 7, 10)
  vue('md_maisons', 96, 0, 16, 8, 44, 15, 6, 16)
  vue('md_maisons_jardins', 96, 0, 16, 16, -12, 15, 4, 8)
  vue('md_maison_sejour', 96, 0, 15.5, 2.6, 20.5, 16, 1.6, 12)
  vue('md_concession', 0, 48, 16, 6, -6, 16, 3, 12)
  vue('md_showroom', 0, 48, 26.5, 4.5, 13.5, 10, 1, 19)
  vue('md_ombriere', 0, 48, 30, 2.5, 1, 2, 1, 6)
  vue('md_parc', 32, 48, 16, 22, -10, 16, 0, 16)
  vue('md_aire_jeux', 32, 48, 15.5, 3, 15.5, 5, 1, 5)
  vue('md_gymnase', 64, 48, 16, 8, -8, 16, 5, 6)
  vue('md_gymnase_refuge', 64, 48, 26, 7, 24, 10, 1, 15)
  vue('md_eco', 96, 48, 16, 10, -10, 16, 3, 12)
  vue('md_eco_patio', 96, 48, 26, 4, 28, 12, 2, 16)
  vue('md_eco_sejour', 96, 48, 19.5, 2.6, 12.5, 6, 1.5, 10)
  vue('md_coupe_villa', 144, 0, 16, 26, 44, 12, 0, 16)
  vue('md_coupe_villa_etage', 180, 0, 16, 30, 44, 12, 6, 16)
  vue('md_coupe_residence', 216, 0, 16, 32, 44, 16, 12, 15)
  vue('md_coupe_mediatheque', 252, 0, 16, 26, 42, 16, 0, 15)
  vue('md_coupe_maisons', 288, 0, 16, 26, 42, 15, 0, 15)
  vue('md_coupe_gymnase', 144, 48, 16, 26, -12, 16, 0, 15)
  vue('md_coupe_eco', 180, 48, 16, 24, -12, 16, 0, 16)
}
var QFIN_MD = function () {
  HB2 = true; FIN = true; THM = THM_MD
  var rv = ['white', 'light_gray'], rr = ['white', 'light_gray', 'brown', 'light_blue']
  HM = {}; mdRue(); finAncrage()
  lot(QF(mdVilla, null, rv), 0, 0, 999, 811, 32, 16); lot(QF(mdResidence, null, rr), 32, 0, 999, 821, 32, 36); lot(QF(mdMediatheque, null, null), 64, 0, 999, 831, 32, 15); lot(QF(mdMaisons, null, rv), 96, 0, 999, 841, 32, 14)
  lot(QF(mdConcession, null, null), 0, 48, 999, 851, 32, 10); lot(QF(mdParc, null, null), 32, 48, 999, 861, 32, 6); lot(QF(mdGymnase, null, null), 64, 48, 999, 871, 32, 12); lot(QF(mdEco, null, rv), 96, 48, 999, 881, 32, 8)
  lot(QF(mdVilla, null, rv), 144, 0, 5, 811, 32, 16); lot(QF(mdVilla, null, rv), 180, 0, 11, 811, 32, 16); lot(QF(mdResidence, null, rr), 216, 0, 17, 821, 32, 36)
  lot(QF(mdMediatheque, null, null), 252, 0, 5, 831, 32, 15); lot(QF(mdMaisons, null, rv), 288, 0, 5, 841, 32, 14)
  lot(QF(mdGymnase, null, null), 144, 48, 5, 871, 32, 12); lot(QF(mdEco, null, rv), 180, 48, 4, 881, 32, 8)
  vlog('FIN volets ' + FIN_NV + ' rideaux ' + FIN_NR + ' paves ' + PAVE_NB + ' retraits ancrage ' + ANC_NB)
  HB2 = false; FIN = false; THM = null; HM = {}
}
