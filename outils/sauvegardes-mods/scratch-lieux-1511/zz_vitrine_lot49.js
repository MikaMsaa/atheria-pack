
// ================= MAMOUDZOU BETON, SERIE 2 : coursives, poste, marche couvert, dispensaire, gymnase, mediatheque, maison de quartier, station-service, maternelle =================
var BT_CH = 'handcrafted:oak_chair[color=none,facing={F},waterlogged=false]'
function btChaise(x, y, z, f) { S(x, y, z, BT_CH.replace('{F}', f)) }
function btComptoir(f, m) { return 'handcrafted:oak_counter[counter=' + (m || 'smooth_stone') + ',facing=' + f + ',type=1]' }
var BT_CAISSES = ['farmersdelight:tomato_crate', 'farmersdelight:cabbage_crate', 'farmersdelight:carrot_crate', 'farmersdelight:potato_crate', 'farmersdelight:onion_crate', 'supplementaries:sack', 'minecraft:barrel[facing=up,open=false]']

// ================= IMMEUBLE A COURSIVES (R+4, cage d'escalier exterieure, balcons au nord) =================
function btCoursives() {
  var Y = k => 6 * k, U = [[2, 7], [9, 15], [17, 22]]
  btSol(0, 0, 31, 31); btDalle(0, 16, 31, 31)
  for (var k = 0; k <= 5; k++) { var y = Y(k); F(1, y, 4, 23, y, 15, BTS); W(1, 4, 23, 15, y, y, BTB) }
  for (var k = 0; k <= 5; k++) { var y = Y(k); F(25, y, 13, 30, y, 16, BTS) }
  for (var k = 0; k < 5; k++) {
    var y = Y(k)
    W(1, 4, 23, 15, y + 1, y + 5, BTM)
    W(24, 12, 31, 17, y + 1, y + 5, BTA); F(24, y + 1, 16, 24, y + 2, 16, AIR)
    F(31, y + 2, 14, 31, y + 4, 15, 'minecraft:iron_bars'); F(27, y + 2, 17, 29, y + 4, 17, 'minecraft:iron_bars')
    if (k == 0) {
      // rez : caves et local velos, soupiraux a barreaux
      F(8, 1, 5, 8, 5, 14, BTB); F(16, 1, 5, 16, 5, 14, BTB)
      ;[3, 11, 19].forEach((x, j) => { PORTE(x, 1, 15, 'minecraft:iron_door', 'south', 'left', j == 1 ? 'true' : 'false'); F(x + 1, 3, 4, x + 2, 4, 4, 'minecraft:iron_bars') })
      for (var i = 0; i < 14; i++) SA(2 + Math.floor(R() * 21), 1, 5 + Math.floor(R() * 9), choix(['minecraft:barrel[facing=up,open=false]', 'supplementaries:sack', 'minecraft:cobweb', 'minecraft:white_carpet']))
      F(2, 1, 13, 6, 1, 13, 'minecraft:air'); S(4, 5, 10, 'minecraft:lantern[hanging=true]'); S(12, 5, 10, 'minecraft:lantern[hanging=true]'); S(19, 5, 10, 'minecraft:lantern[hanging=true]')
      continue
    }
    F(8, y + 1, 5, 8, y + 5, 14, BTB); F(16, y + 1, 5, 16, y + 5, 14, BTB)
    // coursive : dalle, garde-corps, bandeau blanc
    F(1, y, 16, 23, y, 17, BTS); F(1, y, 17, 23, y, 17, BTB); F(1, y + 1, 17, 23, y + 1, 17, 'minecraft:iron_bars'); F(1, y + 2, 17, 23, y + 2, 17, 'minecraft:iron_bars')
    U.forEach((u, j) => {
      var a = u[0], b = u[1], pan = BTP[(k + j * 2) % BTP.length], etat = (k * 5 + j * 3) % 7 < 2 ? 1 : 0
      // couloir d'entree (colonne a) : porte palière, cloison jour | nuit
      PORTE(a, y + 1, 15, 'minecraft:oak_door', 'south', 'left', 'false')
      F(a + 1, y + 1, 10, b, y + 5, 10, BTB)
      F(a + 3, y + 2, 15, a + 4, y + 3, 15, GP)
      F(a + 1, y + 2, 4, a + 2, y + 4, 4, GP); F(a + 4, y + 2, 4, a + 5, y + 4, 4, GP); F(a + 1, y + 1, 4, a + 5, y + 1, 4, pan)
      // balcon nord
      F(a, y, 2, b, y, 3, BTS); F(a, y + 1, 2, b, y + 1, 2, 'minecraft:iron_bars')
      if (R() < 0.6) S(a + 1, y + 1, 3, choix(['minecraft:potted_dead_bush', 'handcrafted:terracotta_wide_pot', 'minecraft:flower_pot', 'handcrafted:white_glazed_thin_pot']))
      if (R() < 0.45) btChaise(b - 1, y + 1, 3, 'north')
      piece(cadre(a + 1, 5, b, 9, 'north', y, 5), R() < 0.55 ? 'salon' : 'salle', etat)
      piece(cadre(a + 1, 11, b, 14, 'south', y, 5), j == 1 ? 'chambre' : 'cuisine', etat)
      S(a, y + 1, 5, 'handcrafted:oak_drawer[facing=south,shape=single,type=1]'); S(a, y + 5, 12, 'minecraft:lantern[hanging=true]')
      if (etat) SA(a, y + 1, 13, choix(['supplementaries:sack', 'minecraft:white_carpet', 'supplementaries:book_pile_horizontal']))
    })
    ;[1, 8, 16, 23].forEach(x => F(x, y + 1, 2, x, y + 3, 3, BTM))
  }
  // poteaux de la coursive, auvent du dernier niveau
  ;[1, 8, 16, 23].forEach(x => F(x, 0, 17, x, 29, 17, BTB)); F(1, 30, 16, 23, 30, 17, BTS)
  // volees de la cage (montee de 6, comme la tour)
  PORTE(25, 1, 17, 'minecraft:iron_door', 'south', 'left', 'true')
  for (var k = 0; k < 5; k++) {
    var y = Y(k)
    S(26, y + 1, 14, btSt('polished_andesite', 'east')); S(27, y + 2, 14, btSt('polished_andesite', 'east')); S(28, y + 3, 14, btSt('polished_andesite', 'east'))
    F(29, y + 3, 14, 29, y + 3, 15, BTA)
    S(27, y + 6, 15, AIR); S(28, y + 6, 15, AIR)
    S(27, y + 1, 14, BTA); S(28, y + 2, 14, BTA); S(28, y + 3, 15, BTA); S(27, y + 4, 15, BTA); S(26, y + 5, 15, BTA)
    S(28, y + 4, 15, btSt('polished_andesite', 'west')); S(27, y + 5, 15, btSt('polished_andesite', 'west')); S(26, y + 6, 15, btSt('polished_andesite', 'west'))
    S(25, y + 5, 13, 'minecraft:lantern[hanging=true]'); if (k % 2 == 1) S(30, y + 1, 13, 'minecraft:cobweb')
  }
  // edicule de cage et toit terrasse
  W(24, 12, 31, 17, 31, 35, BTA); F(24, 36, 12, 31, 36, 17, BTS)
  W(1, 4, 23, 15, 31, 31, BTM)
  ;[[5, 8], [18, 11]].forEach(p => { F(p[0], 31, p[1], p[0] + 1, 32, p[1] + 1, BTG); S(p[0], 33, p[1], 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false]') })
  F(12, 31, 9, 12, 34, 9, 'minecraft:iron_bars'); F(11, 34, 9, 13, 34, 9, 'minecraft:iron_bars')
  for (var i = 0; i < 5; i++) SA(2 + Math.floor(R() * 21), 31, 5 + Math.floor(R() * 10), choix(['minecraft:moss_carpet', 'minecraft:gravel', 'minecraft:cobweb']))
  // abords : parking, local poubelles, arbres
  F(0, -1, 19, 31, -1, 29, BTG); for (var x = 2; x <= 29; x += 5) S(x, -1, 24, BTB)
  btVoitureY(0, 3, 20, 'x', 'red', 1); btVoitureY(0, 14, 26, 'x', 'light_blue', 0); btVoitureY(0, 22, 20, 'x', 'gray', 2)
  F(2, 0, 0, 6, 0, 1, 'minecraft:composter'); S(8, 0, 1, 'minecraft:cauldron'); btArbre(28, 4, 5); btArbre(14, 0, 5)
}

// ================= BUREAU DE POSTE (R+1, guichets, tri, bandeau jaune) =================
function btPoste() {
  var X1 = 3, X2 = 28, Z1 = 6, Z2 = 24
  btDalle(0, 0, 31, 31)
  F(X1, 0, Z1, X2, 0, Z2, 'minecraft:polished_andesite'); for (var x = X1; x <= X2; x++) for (var z = 16; z <= Z2; z++) if ((x + z) % 2 == 0) S(x, 0, z, 'minecraft:polished_diorite')
  W(X1, Z1, X2, Z2, 1, 5, BTM); F(X1, 6, Z1, X2, 6, Z2, BTS); W(X1, Z1, X2, Z2, 6, 6, BTB); F(X1, 6, Z2, X2, 6, Z2, 'minecraft:yellow_concrete')
  W(X1, Z1, X2, Z2, 7, 10, BTM); F(X1, 11, Z1, X2, 11, Z2, BTS); W(X1, Z1, X2, Z2, 12, 12, BTM)
  // facade : baies du rez, entree vitree, bandeau de fenetres a l'etage
  ;[[4, 6], [8, 10], [19, 21], [23, 25]].forEach(w => F(w[0], 2, Z2, w[1], 4, Z2, GP))
  F(13, 1, Z2, 18, 4, Z2, GP); PORTE(15, 1, Z2, 'minecraft:iron_door', 'south', 'left', 'true'); PORTE(16, 1, Z2, 'minecraft:iron_door', 'south', 'right', 'false')
  F(12, 5, Z2 + 1, 19, 5, Z2 + 3, 'minecraft:smooth_stone_slab[type=bottom]')
  for (var x = 4; x <= 24; x += 4) { F(x, 8, Z2, x + 2, 9, Z2, GP); F(x, 8, Z1, x + 2, 9, Z1, GP) }
  for (var z = 9; z <= 21; z += 4) { F(X1, 8, z, X1, 9, z + 1, GP); F(X2, 8, z, X2, 9, z + 1, GP) }
  ;[[6, 3], [12, 3], [20, 3]].forEach(p => F(p[0], 3, Z1, p[0] + 1, 4, Z1, 'minecraft:iron_bars'))
  // guichets : comptoir continu, hygiaphones, poteaux
  for (var x = X1 + 2; x <= X2 - 2; x++) {
    if ((x - X1) % 4 == 0) { F(x, 1, 15, x, 5, 15, BTB); continue }
    S(x, 1, 15, btComptoir('south')); F(x, 3, 15, x, 5, 15, 'minecraft:light_gray_stained_glass_pane'); btChaise(x, 1, 14, 'south')
  }
  F(X1 + 1, 1, 15, X1 + 1, 5, 15, BTM); F(X2 - 1, 1, 15, X2 - 1, 5, 15, BTM); PORTE(X2 - 1, 1, 15, 'minecraft:iron_door', 'north', 'left', 'false')
  // hall public : banc, presentoirs, panneau d'affichage
  F(X1 + 1, 1, 17, X1 + 1, 1, 21, btSt('smooth_quartz', 'west')); S(X2 - 1, 2, 19, 'supplementaries:notice_board[facing=west,has_book=false]')
  ;[[11, 20], [20, 20]].forEach(p => { S(p[0], 1, p[1], 'handcrafted:birch_shelf[facing=south,shape=single,type=1]'); SA(p[0], 2, p[1], 'supplementaries:book_pile_horizontal') })
  for (var i = 0; i < 6; i++) SA(5 + Math.floor(R() * 21), 1, 17 + Math.floor(R() * 6), choix(['minecraft:white_carpet', 'supplementaries:book_pile_horizontal', 'minecraft:cobweb']))
  S(9, 5, 19, 'mcwlights:iron_chandelier'); S(22, 5, 19, 'mcwlights:iron_chandelier')
  // tri : casiers, sacs postaux, chariot
  for (var x = 12; x <= 26; x++) { if (x == 19) continue; S(x, 1, 7, 'handcrafted:birch_shelf[facing=south,shape=single,type=1]'); S(x, 2, 7, 'handcrafted:birch_shelf[facing=south,shape=single,type=1]'); if (R() < 0.5) SA(x, 3, 7, 'supplementaries:sack') }
  for (var i = 0; i < 9; i++) SA(11 + Math.floor(R() * 15), 1, 9 + Math.floor(R() * 4), choix(['supplementaries:sack', 'supplementaries:sack', 'minecraft:barrel[facing=up,open=false]', 'minecraft:white_carpet']))
  S(19, 1, 7, 'minecraft:iron_door[facing=south,half=lower,hinge=left,open=false]'); S(19, 2, 7, 'minecraft:iron_door[facing=south,half=upper,hinge=left,open=false]')
  S(15, 5, 10, 'minecraft:lantern[hanging=true]'); S(23, 5, 10, 'minecraft:lantern[hanging=true]')
  // escalier vers l'etage (le long du mur nord, a l'ouest)
  for (var i = 0; i <= 5; i++) { S(X1 + 2 + i, 1 + i, Z1 + 1, btSt('polished_andesite', 'east')); if (i > 0) F(X1 + 2 + i, 1, Z1 + 1, X1 + 2 + i, i, Z1 + 1, BTA) }
  F(X1 + 2, 6, Z1 + 1, X1 + 6, 6, Z1 + 1, AIR)
  // etage : bureaux paysagers, bureau du receveur
  for (var x = 6; x <= 24; x += 4) for (var z = 11; z <= 21; z += 5) { S(x, 7, z, 'handcrafted:oak_desk[color=none,facing=south,waterlogged=false]'); btChaise(x, 7, z - 1, 'south'); if (R() < 0.5) SA(x, 8, z, choix(['handcrafted:stackable_book', 'supplementaries:book_pile_horizontal'])) }
  F(19, 7, 7, 19, 10, 9, BTB); S(19, 7, 8, AIR); S(19, 8, 8, AIR); S(23, 7, 8, 'handcrafted:oak_desk[color=none,facing=north,waterlogged=false]'); btChaise(23, 7, 9, 'north'); S(26, 7, 7, 'handcrafted:oak_cupboard[facing=south,type=1]'); S(21, 7, 7, 'supplementaries:globe[facing=south]')
  for (var x = 8; x <= 24; x += 8) S(x, 10, 16, 'mcwlights:iron_chandelier')
  // toit : mat d'antennes, groupe de ventilation ; cour de service, fourgon jaune, boite aux lettres
  F(24, 12, 9, 24, 17, 9, 'minecraft:iron_bars'); F(23, 16, 9, 25, 16, 9, 'minecraft:iron_bars'); F(7, 12, 9, 9, 13, 10, BTG); S(8, 14, 9, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false]')
  F(0, -1, 0, 31, -1, 4, BTG); btVoitureY(0, 8, 1, 'x', 'yellow', 1); btVoitureY(0, 20, 2, 'x', 'yellow', 2)
  S(10, 0, 27, 'minecraft:yellow_concrete'); S(10, 1, 27, 'minecraft:yellow_concrete'); S(10, 2, 27, 'minecraft:iron_trapdoor[facing=south,half=bottom,open=false]')
  btArbre(1, 28, 5); btArbre(30, 28, 5)
}

// ================= MARCHE COUVERT (trois voutes de beton, etals) =================
function btMarche() {
  var Z1 = 3, Z2 = 28, P = [0, 1, 2, 2, 3, 3, 2, 2, 1, 0], BAIES = [1, 11, 21]
  btDalle(0, 0, 31, 31)
  F(1, 0, Z1, 30, 0, Z2, 'minecraft:polished_andesite'); for (var x = 1; x <= 30; x++) { S(x, 0, 15, BTS); S(x, 0, 16, BTS) }
  function p(x) { for (var i = 0; i < 3; i++) { var u = x - BAIES[i]; if (u >= 0 && u <= 9) return P[u] } return 0 }
  // voutes : coque continue (de la hauteur du voisin le plus bas jusqu'a la sienne)
  for (var x = 1; x <= 30; x++) {
    var h = p(x), hm = Math.min(h, p(x - 1 < 1 ? x : x - 1), p(x + 1 > 30 ? x : x + 1))
    for (var z = Z1; z <= Z2; z++) F(x, 9 + hm, z, x, 9 + h, z, BTS)
    F(x, 9, Z1, x, 9 + h, Z1, BTM); F(x, 9, Z2, x, 9 + h, Z2, BTM)
    if (h == 3) for (var z = Z1 + 2; z <= Z2 - 2; z += 3) S(x, 9 + h, z, 'minecraft:glass')
  }
  // poteaux, muret, frise haute ; cotes ouverts sous la frise
  ;[1, 10, 11, 20, 21, 30].forEach(x => [Z1, 9, 15, 16, 22, Z2].forEach(z => F(x, 1, z, x, 8, z, BTB)))
  W(1, Z1, 30, Z2, 1, 1, BTM); W(1, Z1, 30, Z2, 8, 8, BTM)
  F(12, 1, Z2, 19, 1, Z2, AIR); F(12, 1, Z1, 19, 1, Z1, AIR); F(1, 1, 12, 1, 1, 19, AIR); F(30, 1, 12, 30, 1, 19, AIR)
  // etals : trois rangees, auvent de planches sur poteaux
  function etal(x1, x2, z1, z2, f) {
    var xc = f == 'east' ? x2 : x1
    for (var z = z1; z <= z2; z++) { S(xc, 1, z, btComptoir(f, 'oak_planks')); for (var x = x1; x <= x2; x++) if (x != xc && R() < 0.55) SA(x, 1, z, choix(BT_CAISSES)) }
    ;[[x1, z1], [x2, z1], [x1, z2], [x2, z2]].forEach(c => { if (c[0] != xc) F(c[0], 1, c[1], c[0], 2, c[1], 'minecraft:spruce_fence') })
    F(x1, 3, z1, x2, 3, z2, 'minecraft:spruce_slab[type=bottom]')
    if (R() < 0.6) SA(xc, 2, z1 + 1, choix(['supplementaries:jar', 'handcrafted:wood_plate', 'handcrafted:terracotta_bowl', 'minecraft:melon', 'minecraft:pumpkin']))
  }
  ;[[5, 8], [10, 13], [18, 21], [23, 26]].forEach((zz, i) => {
    if (zz[0] <= 16 && zz[1] >= 15) return
    etal(3, 6, zz[0], zz[1], 'east'); etal(13, 14, zz[0], zz[1], i % 2 ? 'east' : 'west'); etal(17, 18, zz[0], zz[1], i % 2 ? 'west' : 'east'); etal(25, 28, zz[0], zz[1], 'west')
  })
  // boucherie (crochets, chaines) et poissonnerie (glace) au fond
  for (var x = 4; x <= 8; x += 2) { S(x, 7, Z1 + 1, 'minecraft:chain[axis=y]'); S(x, 6, Z1 + 1, 'minecraft:chain[axis=y]') }
  F(3, 1, Z1 + 1, 9, 1, Z1 + 1, btComptoir('south', 'quartz_block')); F(22, 1, Z1 + 1, 28, 1, Z1 + 1, 'minecraft:packed_ice'); F(22, 2, Z1 + 1, 28, 2, Z1 + 1, 'minecraft:light_gray_carpet')
  // luminaires sous la crete de chaque voute
  BAIES.forEach(x0 => { for (var z = 7; z <= 25; z += 9) { F(x0 + 4, 7, z, x0 + 4, 10, z, 'minecraft:chain[axis=y]'); S(x0 + 4, 6, z, 'minecraft:lantern[hanging=true]') } })
  // abandon : toiles, cageots renverses, flaques de mousse
  for (var i = 0; i < 12; i++) SA(2 + Math.floor(R() * 28), 1, Z1 + 1 + Math.floor(R() * 24), choix(['minecraft:cobweb', 'minecraft:moss_carpet', 'supplementaries:sack', 'minecraft:white_carpet']))
  // parvis : chariots, arbres, camionnette
  btArbre(3, 30, 5); btArbre(28, 30, 5); btVoitureY(0, 22, 29, 'x', 'white', 1); F(0, -1, 0, 31, -1, 1, BTG); btVoitureY(0, 5, 0, 'x', 'green', 2)
}

// ================= DISPENSAIRE / CENTRE MEDICO-SOCIAL (R+1, croix rouge, salle d'attente) =================
function btDispensaire() {
  var X1 = 4, X2 = 27, Z1 = 8, Z2 = 23
  btDalle(0, 0, 31, 31); btSol(0, 0, 31, 6)
  F(X1, 0, Z1, X2, 0, Z2, 'minecraft:smooth_quartz'); for (var x = X1; x <= X2; x++) for (var z = Z1; z <= Z2; z++) if ((x + z) % 3 == 0) S(x, 0, z, 'minecraft:polished_diorite')
  W(X1, Z1, X2, Z2, 1, 5, BTM); F(X1, 6, Z1, X2, 6, Z2, BTS); W(X1, Z1, X2, Z2, 6, 6, BTB); W(X1, Z1, X2, Z2, 7, 10, BTM); F(X1, 11, Z1, X2, 11, Z2, BTS); W(X1, Z1, X2, Z2, 12, 12, BTM)
  // croix rouge sur fond blanc (facade sud, etage)
  F(23, 7, Z2, 25, 9, Z2, BTB); F(24, 7, Z2, 24, 9, Z2, 'minecraft:red_concrete'); F(23, 8, Z2, 25, 8, Z2, 'minecraft:red_concrete')
  // baies, entree sous auvent, rampe
  ;[[6, 8], [17, 19], [22, 24]].forEach(w => F(w[0], 2, Z2, w[1], 4, Z2, GP))
  F(11, 1, Z2, 14, 4, Z2, GP); PORTE(12, 1, Z2, 'minecraft:iron_door', 'south', 'left', 'true'); PORTE(13, 1, Z2, 'minecraft:iron_door', 'south', 'right', 'false')
  F(9, 5, Z2 + 1, 16, 5, Z2 + 3, 'minecraft:smooth_stone_slab[type=bottom]'); F(9, 1, Z2 + 3, 9, 4, Z2 + 3, BTB); F(16, 1, Z2 + 3, 16, 4, Z2 + 3, BTB)
  for (var x = 5; x <= 21; x += 4) { F(x, 8, Z2, x + 2, 9, Z2, GP); F(x, 8, Z1, x + 2, 9, Z1, GP) }
  ;[[6, 8], [12, 14], [20, 22]].forEach(w => F(w[0], 2, Z1, w[1], 4, Z1, GP))
  ;[11, 16].forEach(z => { F(X1, 2, z, X1, 4, z + 1, GP); F(X2, 2, z, X2, 4, z + 1, GP) })
  // rez : salle d'attente (ouest), accueil, deux cabinets (est), couloir z16
  F(16, 1, Z1 + 1, 16, 5, Z2 - 1, BTB); F(17, 1, 16, X2 - 1, 5, 16, BTB)
  PORTE(16, 1, 20, 'minecraft:oak_door', 'east', 'left', 'false'); PORTE(16, 1, 12, 'minecraft:oak_door', 'east', 'left', 'true')
  for (var x = 6; x <= 12; x += 3) for (var z = 17; z <= 20; z += 3) { btChaise(x, 1, z, 'north'); btChaise(x + 1, 1, z, 'north') }
  F(6, 1, 13, 10, 1, 13, btComptoir('south', 'quartz_block')); btChaise(8, 1, 12, 'south'); S(5, 1, 9, 'handcrafted:oak_cupboard[facing=east,type=1]'); S(5, 1, 10, 'handcrafted:oak_cupboard[facing=east,type=1]')
  S(13, 1, 9, 'minecraft:potted_fern'); S(5, 2, 18, 'supplementaries:notice_board[facing=east,has_book=false]'); S(8, 5, 18, 'mcwlights:iron_chandelier'); S(10, 5, 11, 'minecraft:lantern[hanging=true]')
  // cabinets : lit d'examen, bureau, armoire a pharmacie
  ;[[17, 26, 17, 22], [17, 26, 9, 15]].forEach((c, i) => {
    LIT(24, 1, c[2] + 1, 'white', 'east'); S(19, 1, c[2] + 2, 'handcrafted:oak_desk[color=none,facing=east,waterlogged=false]'); btChaise(18, 1, c[2] + 2, 'east')
    S(26, 1, c[3] - 1, 'handcrafted:oak_cupboard[facing=west,type=1]'); S(26, 2, c[3] - 1, 'supplementaries:jar'); S(21, 1, c[3], 'minecraft:cauldron'); S(22, 5, c[2] + 3, 'minecraft:lantern[hanging=true]')
    if (i == 1) for (var k = 0; k < 4; k++) SA(18 + Math.floor(R() * 8), 1, c[2] + Math.floor(R() * 6), choix(['minecraft:white_carpet', 'supplementaries:book_pile_horizontal', 'minecraft:cobweb']))
  })
  // escalier (mur ouest, vers le nord)
  for (var i = 0; i <= 5; i++) { S(X1 + 1, 1 + i, Z2 - 2 - i, btSt('polished_andesite', 'north')); if (i > 0) F(X1 + 1, 1, Z2 - 2 - i, X1 + 1, i, Z2 - 2 - i, BTA) }
  F(X1 + 1, 6, Z2 - 6, X1 + 1, 6, Z2 - 2, AIR)
  // etage : PMI (berceaux, table a langer), bureaux
  F(16, 7, Z1 + 1, 16, 10, Z2 - 1, BTB); S(16, 7, 15, AIR); S(16, 8, 15, AIR)
  for (var z = 10; z <= 20; z += 3) LIT(8, 7, z, choix(['light_blue', 'pink', 'yellow']), 'east')
  F(12, 7, 9, 14, 7, 9, btComptoir('south', 'quartz_block')); S(13, 8, 9, 'handcrafted:white_glazed_thin_pot'); S(10, 10, 15, 'mcwlights:iron_chandelier')
  for (var z = 10; z <= 20; z += 5) { S(21, 7, z, 'handcrafted:oak_desk[color=none,facing=south,waterlogged=false]'); btChaise(21, 7, z - 1, 'south'); S(25, 7, z, 'handcrafted:oak_drawer[facing=west,shape=single,type=1]') }
  S(22, 10, 15, 'mcwlights:iron_chandelier')
  // abords : parking, ambulance abandonnee, haie
  F(0, -1, 0, 31, -1, 5, BTG); btVoitureY(0, 4, 1, 'x', 'white', 1); btVoitureY(0, 16, 3, 'x', 'white', 2)
  for (var x = 0; x <= 31; x++) if (x < 9 || x > 16) SA(x, 0, 30, 'minecraft:oak_leaves[persistent=true]')
  btArbre(2, 27, 5); btArbre(29, 27, 5)
}

// ================= GYMNASE (salle omnisports, gradins, vestiaires) — entree au nord =================
function btGymnase() {
  var X1 = 2, X2 = 29, Z1 = 3, Z2 = 28
  btDalle(0, 0, 31, 2); btSol(0, 29, 31, 31)
  F(X1, 0, Z1, X2, 0, Z2, 'minecraft:birch_planks')
  // lignes du terrain
  W(7, 5, 26, 21, 0, 0, 'minecraft:white_terracotta'); F(7, 0, 13, 26, 0, 13, 'minecraft:white_terracotta'); F(15, 0, 11, 18, 0, 11, 'minecraft:white_terracotta'); F(15, 0, 15, 18, 0, 15, 'minecraft:white_terracotta')
  W(X1, Z1, X2, Z2, 1, 10, BTM); F(X1, 11, Z1, X2, 11, Z2, BTS); W(X1, Z1, X2, Z2, 11, 12, BTM)
  for (var z = Z1 + 3; z <= Z2 - 3; z += 4) F(9, 11, z, 26, 11, z, 'minecraft:glass')
  // bandeaux vitres hauts (est, ouest) entre les poteaux
  for (var z = Z1 + 1; z <= Z2 - 3; z += 4) { F(X1, 8, z, X1, 9, z + 2, 'minecraft:glass'); F(X2, 8, z, X2, 9, z + 2, 'minecraft:glass') }
  for (var z = Z1; z <= Z2; z += 4) { F(X1, 1, z, X1, 10, z, BTB); F(X2, 1, z, X2, 10, z, BTB) }
  ;[[4, 6], [8, 10], [21, 23], [25, 27]].forEach((w, i) => { F(w[0], 7, Z1, w[1], 9, Z1, 'minecraft:glass'); F(w[0], 6, Z1, w[1], 6, Z1, BTP[i % BTP.length]) })
  // entree nord : sas vitre, auvent
  F(13, 1, Z1, 18, 4, Z1, 'minecraft:glass'); PORTE(15, 1, Z1, 'minecraft:iron_door', 'north', 'left', 'true'); PORTE(16, 1, Z1, 'minecraft:iron_door', 'north', 'right', 'false')
  F(12, 5, Z1 - 3, 19, 5, Z1 - 1, 'minecraft:smooth_stone_slab[type=bottom]'); F(12, 1, Z1 - 3, 12, 4, Z1 - 3, BTB); F(19, 1, Z1 - 3, 19, 4, Z1 - 3, BTB)
  // paniers aux deux bouts
  ;[[5, 1], [21, -1]].forEach(p => { var z = p[0]; F(16, 1, z, 16, 5, z, 'minecraft:iron_bars'); S(16, 5, z + p[1], 'minecraft:white_stained_glass'); S(16, 5, z + 2 * p[1], 'minecraft:iron_trapdoor[facing=' + (p[1] > 0 ? 'south' : 'north') + ',half=bottom,open=false]') })
  // gradins (ouest)
  for (var z = 7; z <= 20; z++) for (var i = 0; i < 4; i++) { S(6 - i, 1 + i, z, btSt('stone', 'west')); if (i > 0) F(6 - i, 1, z, 6 - i, i, z, BTM) }
  F(3, 5, 7, 3, 5, 20, 'minecraft:iron_bars')
  // vestiaires (sud, derriere le mur z22) : bancs, casiers, douches
  F(X1 + 1, 1, 22, X2 - 1, 7, 22, BTB); PORTE(8, 1, 22, 'minecraft:oak_door', 'north', 'left', 'false'); PORTE(23, 1, 22, 'minecraft:oak_door', 'north', 'left', 'true'); F(16, 1, 23, 16, 7, Z2 - 1, BTB)
  ;[[4, 14], [18, 27]].forEach(v => {
    F(v[0], 1, 25, v[1] - 1, 1, 25, btSt('smooth_quartz', 'south')); for (var x = v[0]; x <= v[1] - 1; x++) { S(x, 1, Z2 - 1, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=true]'); S(x, 2, Z2 - 1, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=' + (R() < 0.3 ? 'false' : 'true') + ']') }
    S(v[1], 1, 23, 'minecraft:water_cauldron[level=1]'); S(v[1] - 1, 1, 23, 'minecraft:cauldron'); S(v[0] + 4, 5, 24, 'minecraft:lantern[hanging=true]')
  })
  // tapis de sol, ballons (citrouilles sculptees non : seaux), filet de volley
  F(24, 1, 6, 27, 1, 9, 'minecraft:blue_carpet'); SA(27, 2, 6, 'minecraft:blue_carpet')
  F(26, 1, 13, 26, 4, 13, 'minecraft:iron_bars'); F(8, 1, 13, 8, 4, 13, 'minecraft:iron_bars')
  for (var i = 0; i < 6; i++) SA(9 + Math.floor(R() * 16), 1, 6 + Math.floor(R() * 15), choix(['minecraft:cobweb', 'supplementaries:sack', 'minecraft:white_carpet']))
  for (var x = 9; x <= 25; x += 8) for (var z = 7; z <= 19; z += 6) S(x, 10, z, 'mcwlights:iron_chandelier')
  btArbre(1, 30, 4); btArbre(30, 30, 4)
}

// ================= MEDIATHEQUE (rez vitre, etage en porte-a-faux a fentes) — entree au nord =================
function btBibliotheque() {
  btDalle(0, 0, 31, 31)
  // rez : boite de verre sur poteaux, noyau beton
  F(7, 0, 6, 24, 0, 25, 'minecraft:polished_andesite')
  W(7, 6, 24, 25, 1, 5, 'minecraft:glass_pane'); for (var x = 7; x <= 24; x += 4) { F(x, 1, 6, x, 5, 6, BTB); F(x, 1, 25, x, 5, 25, BTB) } for (var z = 6; z <= 25; z += 4) { F(7, 1, z, 7, 5, z, BTB); F(24, 1, z, 24, 5, z, BTB) }
  F(24, 1, 25, 24, 5, 25, BTB)
  PORTE(15, 1, 6, 'minecraft:iron_door', 'north', 'left', 'true'); PORTE(16, 1, 6, 'minecraft:iron_door', 'north', 'right', 'false')
  // etage : grande boite beton x2..29, fentes verticales
  F(2, 6, 2, 29, 6, 29, BTS); W(2, 2, 29, 29, 6, 6, BTB); W(2, 2, 29, 29, 7, 11, BTM); F(2, 12, 2, 29, 12, 29, BTS); W(2, 2, 29, 29, 13, 13, BTM)
  for (var a = 4; a <= 27; a += 3) { F(a, 8, 2, a, 10, 2, GP); F(a, 8, 29, a, 10, 29, GP); F(2, 8, a, 2, 10, a, GP); F(29, 8, a, 29, 10, a, GP) }
  for (var x = 8; x <= 23; x += 5) F(x, 12, 10, x + 1, 12, 21, 'minecraft:glass')
  // rez : accueil, rayonnages, coin enfants
  F(10, 1, 9, 13, 1, 9, btComptoir('north', 'oak_planks')); btChaise(11, 1, 10, 'north'); S(13, 2, 9, 'handcrafted:stackable_book')
  for (var x = 9; x <= 22; x += 3) for (var z = 13; z <= 22; z++) { if (z == 17) continue; S(x, 1, z, 'minecraft:bookshelf'); S(x, 2, z, 'minecraft:bookshelf'); if (x >= 18) S(x, 3, z, 'minecraft:bookshelf') }
  F(17, 1, 8, 22, 1, 11, 'minecraft:yellow_carpet'); S(18, 1, 9, 'handcrafted:red_cushion'); S(21, 1, 10, 'handcrafted:green_cushion'); SA(20, 1, 8, 'supplementaries:book_pile')
  S(12, 5, 15, 'mcwlights:iron_chandelier'); S(20, 5, 15, 'mcwlights:iron_chandelier')
  for (var i = 0; i < 8; i++) SA(8 + Math.floor(R() * 16), 1, 12 + Math.floor(R() * 12), choix(['supplementaries:book_pile_horizontal', 'supplementaries:book_pile', 'minecraft:cobweb', 'minecraft:white_carpet']))
  // escalier droit vers l'etage (le long de la facade sud)
  for (var i = 0; i <= 5; i++) { S(9 + i, 1 + i, 24, btSt('polished_andesite', 'east')); if (i > 0) F(9 + i, 1, 24, 9 + i, i, 24, BTA) }
  F(9, 6, 24, 13, 6, 24, AIR); F(8, 7, 23, 15, 7, 23, 'minecraft:iron_bars'); S(14, 7, 23, AIR)
  // etage : salle de lecture, longues tables, rayonnages sous les fentes
  for (var x = 6; x <= 24; x += 6) for (var z = 7; z <= 19; z += 4) { F(x, 7, z, x + 2, 7, z, 'handcrafted:oak_table[color=green,shape=single,waterlogged=false]'); for (var u = 0; u < 3; u++) { btChaise(x + u, 7, z - 1, 'south'); btChaise(x + u, 7, z + 1, 'north') } if (R() < 0.5) SA(x + 1, 8, z, 'handcrafted:stackable_book') }
  for (var x = 3; x <= 28; x++) if ((x - 4) % 3 != 0) { S(x, 7, 3, 'minecraft:bookshelf'); S(x, 7, 28, x >= 8 && x <= 15 ? AIR : 'minecraft:bookshelf') }
  S(4, 7, 26, 'supplementaries:globe[facing=north]'); for (var x = 8; x <= 24; x += 8) for (var z = 9; z <= 21; z += 6) S(x, 11, z, 'mcwlights:iron_chandelier')
  // parvis : bancs, arbre, sculpture beton
  gtBanc(4, 3, 'east', 3); gtBanc(27, 3, 'west', 3); btArbre(3, 27, 5); F(28, 0, 26, 29, 2, 27, BTB); S(28, 3, 26, BTB)
}

// ================= MAISON DE QUARTIER (salle polyvalente, scene, bar, atelier) — entree au nord =================
function btMaisonQuartier() {
  var X1 = 3, X2 = 28, Z1 = 5, Z2 = 26
  btDalle(0, 0, 31, 4); btSol(0, 27, 31, 31); btDalle(0, 5, 2, 26); btDalle(29, 5, 31, 26)
  F(X1, 0, Z1, X2, 0, Z2, 'minecraft:spruce_planks')
  W(X1, Z1, X2, Z2, 1, 7, BTM); F(X1, 8, Z1, X2, 8, Z2, BTS); W(X1, Z1, X2, Z2, 8, 9, BTB)
  // facade nord : baies, panneaux colores, entree
  ;[[5, 7], [9, 11], [18, 20], [23, 25]].forEach((w, i) => { F(w[0], 2, Z1, w[1], 4, Z1, GP); F(w[0], 1, Z1, w[1], 1, Z1, BTP[i % BTP.length]); F(w[0], 5, Z1, w[1], 6, Z1, BTP[(i + 2) % BTP.length]) })
  F(13, 1, Z1, 16, 4, Z1, GP); PORTE(14, 1, Z1, 'minecraft:iron_door', 'north', 'left', 'true'); PORTE(15, 1, Z1, 'minecraft:iron_door', 'north', 'right', 'false'); F(12, 5, Z1 - 2, 17, 5, Z1 - 1, 'minecraft:smooth_stone_slab[type=bottom]')
  ;[[9, 11], [16, 18]].forEach(w => { F(X1, 2, w[0], X1, 4, w[1], GP); F(X2, 2, w[0], X2, 4, w[1], GP) })
  // salle polyvalente (x4..20) : scene au sud, rideaux, tables pliantes, ping-pong
  F(21, 1, Z1 + 1, 21, 7, Z2 - 1, BTB); PORTE(21, 1, 10, 'minecraft:oak_door', 'east', 'left', 'false'); PORTE(21, 1, 20, 'minecraft:oak_door', 'east', 'left', 'true')
  F(4, 1, 21, 20, 1, Z2 - 1, 'minecraft:spruce_slab[type=bottom]'); F(4, 1, 21, 20, 1, 21, btSt('spruce', 'north'))
  F(4, 2, 21, 5, 6, 21, 'minecraft:red_wool'); F(19, 2, 21, 20, 6, 21, 'minecraft:red_wool'); F(4, 7, 21, 20, 7, 21, 'minecraft:red_wool')
  S(12, 2, 24, 'minecraft:note_block'); S(10, 2, 23, 'handcrafted:oak_chair[color=none,facing=north,waterlogged=false]'); S(14, 2, 23, 'handcrafted:oak_chair[color=none,facing=north,waterlogged=false]')
  F(11, 1, 12, 12, 1, 12, 'handcrafted:oak_table[color=green,shape=single,waterlogged=false]'); F(11, 2, 12, 12, 2, 12, AIR)
  for (var x = 6; x <= 18; x += 4) for (var z = 15; z <= 18; z += 3) { if (x == 10 && z == 15) continue; S(x, 1, z, 'handcrafted:oak_table[color=red,shape=single,waterlogged=false]'); btChaise(x - 1, 1, z, 'east'); btChaise(x + 1, 1, z, 'west') }
  for (var i = 0; i < 4; i++) { btChaise(5, 1 + 0, 7 + i, 'east') }
  S(19, 2, 7, 'supplementaries:notice_board[facing=south,has_book=false]'); S(8, 7, 13, 'mcwlights:iron_chandelier'); S(16, 7, 13, 'mcwlights:iron_chandelier'); S(12, 7, 18, 'mcwlights:iron_chandelier')
  // bar et cuisine (est, nord), atelier couture et bureau (est, sud)
  F(22, 1, 15, X2 - 1, 7, 15, BTB); PORTE(25, 1, 15, 'minecraft:oak_door', 'south', 'left', 'false')
  F(23, 1, 11, 26, 1, 11, btComptoir('north', 'oak_planks')); F(22, 1, 6, X2 - 1, 1, 6, btComptoir('south', 'smooth_stone')); S(23, 2, 6, 'farmersdelight:cooking_pot'); S(25, 2, 6, 'handcrafted:white_crockery_combo[facing=south,waterlogged=false]')
  for (var x = 23; x <= 26; x++) btChaise(x, 1, 12, 'north'); S(24, 5, 9, 'minecraft:lantern[hanging=true]')
  for (var x = 23; x <= 26; x += 3) { S(x, 1, 20, 'handcrafted:oak_desk[color=none,facing=north,waterlogged=false]'); btChaise(x, 1, 21, 'north') } S(27, 1, 25, 'handcrafted:oak_cupboard[facing=west,type=1]'); S(22, 1, 25, 'minecraft:loom[facing=east]'); S(24, 5, 22, 'minecraft:lantern[hanging=true]')
  for (var i = 0; i < 7; i++) SA(5 + Math.floor(R() * 15), 1, 7 + Math.floor(R() * 13), choix(['minecraft:cobweb', 'minecraft:white_carpet', 'supplementaries:book_pile_horizontal', 'minecraft:red_carpet']))
  // toit : lanterneaux ; jardin partage au sud
  for (var x = 7; x <= 17; x += 5) F(x, 8, 10, x + 1, 8, 18, 'minecraft:glass')
  for (var x = 4; x <= 26; x += 4) { F(x, -1, 28, x + 2, -1, 30, 'minecraft:farmland[moisture=0]'); F(x, 0, 28, x + 2, 0, 30, 'minecraft:short_grass') }
  btArbre(1, 2, 4); btArbre(30, 2, 4)
}

// ================= STATION-SERVICE (auvent, pompes, boutique, atelier) — piste au nord =================
function btStation() {
  F(0, -1, 0, 31, -1, 31, 'minecraft:black_concrete'); for (var i = 0; i < 40; i++) S(Math.floor(R() * 32), -1, Math.floor(R() * 17), choix([BTG, 'minecraft:gray_concrete_powder', 'minecraft:coal_block']))
  for (var x = 0; x <= 31; x++) S(x, -1, 16, 'minecraft:white_concrete')
  // auvent sur quatre poteaux, rive blanche et rouge
  ;[[8, 8], [23, 8], [8, 13], [23, 13]].forEach(p => F(p[0], 0, p[1], p[0], 4, p[1], BTB))
  F(4, 5, 6, 27, 5, 15, BTS); W(4, 6, 27, 15, 5, 5, BTB); W(4, 6, 27, 15, 6, 6, 'minecraft:red_concrete')
  for (var x = 7; x <= 24; x += 6) S(x, 4, 10, 'minecraft:lantern[hanging=true]')
  // ilots et pompes (pistolet = levier pose sur le flanc)
  ;[10, 19].forEach(x0 => {
    F(x0, 0, 10, x0 + 3, 0, 11, 'minecraft:smooth_stone_slab[type=bottom]')
    ;[x0, x0 + 3].forEach(x => { S(x, 1, 10, BTB); S(x, 1, 11, BTB); S(x, 2, 10, 'minecraft:red_concrete'); S(x, 2, 11, 'minecraft:red_concrete'); S(x, 3, 10, 'minecraft:smooth_stone_slab[type=bottom]'); S(x, 3, 11, 'minecraft:smooth_stone_slab[type=bottom]') })
    S(x0 + 1, 2, 10, 'minecraft:lever[face=wall,facing=east,powered=false]'); S(x0 + 2, 2, 11, 'minecraft:lever[face=wall,facing=west,powered=false]')
  })
  btVoitureY(0, 14, 7, 'x', 'blue', 2); btVoitureY(0, 24, 12, 'x', 'orange', 1)
  // totem (sans texte) : mat et caisson rouge et blanc
  F(2, 0, 2, 2, 7, 2, 'minecraft:iron_bars'); F(2, 8, 1, 2, 10, 3, 'minecraft:red_concrete'); S(2, 9, 2, BTB); S(2, 11, 2, 'minecraft:smooth_stone_slab[type=bottom]')
  // boutique (x4..14) : vitrine, comptoir, rayons, frigos
  F(4, 0, 18, 14, 0, 27, 'minecraft:polished_diorite'); W(4, 18, 14, 27, 1, 5, BTM); F(4, 6, 18, 14, 6, 27, BTS); W(4, 18, 14, 27, 6, 6, BTB)
  ;[[5, 7], [11, 13]].forEach(w => F(w[0], 1, 18, w[1], 4, 18, GP)); PORTE(9, 1, 18, 'minecraft:iron_door', 'north', 'left', 'true')
  F(5, 1, 21, 8, 1, 21, btComptoir('north')); btChaise(6, 1, 22, 'north'); S(5, 2, 21, 'minecraft:stone_button[face=floor,facing=north,powered=false]')
  for (var x = 6; x <= 12; x += 3) for (var z = 23; z <= 26; z++) { if (x == 6 && z < 24) continue; S(x, 1, z, 'handcrafted:birch_shelf[facing=east,shape=single,type=1]'); if (R() < 0.4) SA(x + 1, 1, z, choix(['supplementaries:jar', 'supplementaries:sack', 'minecraft:white_carpet'])) }
  for (var z = 20; z <= 26; z++) { S(13, 1, z, 'minecraft:white_concrete'); S(13, 2, z, 'minecraft:iron_trapdoor[facing=west,half=bottom,open=' + (z % 3 ? 'true' : 'false') + ']') }
  S(9, 5, 23, 'minecraft:lantern[hanging=true]')
  // atelier (x16..27) : grande baie ouverte, voiture sur cales, etabli
  F(16, 0, 18, 27, 0, 27, BTS); W(16, 18, 27, 27, 1, 6, BTM); F(16, 7, 18, 27, 7, 27, BTS); W(16, 18, 27, 27, 7, 7, BTB)
  F(18, 1, 18, 25, 5, 18, AIR); F(18, 5, 18, 25, 5, 18, 'minecraft:iron_trapdoor[facing=south,half=top,open=false]')
  ;[[19, 21], [24, 21], [19, 24], [24, 24]].forEach(p => S(p[0], 1, p[1], 'minecraft:polished_andesite'))
  OY += 1; bgVoiture(20, 22, 'z', 'red', 1, true); OY -= 1
  F(17, 1, 26, 21, 1, 26, btComptoir('north', 'oak_planks')); S(17, 2, 26, 'minecraft:grindstone[face=floor,facing=north]'); S(22, 1, 26, 'minecraft:anvil[facing=north]'); S(26, 1, 26, 'minecraft:barrel[facing=up,open=false]'); S(26, 1, 25, 'minecraft:barrel[facing=up,open=false]'); S(26, 2, 26, 'minecraft:barrel[facing=up,open=false]')
  S(26, 1, 20, 'minecraft:cauldron'); S(21, 6, 22, 'minecraft:lantern[hanging=true]')
  // arriere : pneus (blocs de charbon), cuve
  F(28, 0, 28, 30, 0, 30, 'minecraft:coal_block'); S(29, 1, 29, 'minecraft:coal_block'); F(1, 0, 28, 3, 1, 30, 'minecraft:light_gray_concrete')
}

// ================= ECOLE MATERNELLE (plain-pied, classes, dortoir, cour et toboggan) — entree au nord =================
function btCreche() {
  var X1 = 3, X2 = 28, Z1 = 4, Z2 = 17
  btDalle(0, 0, 31, 3); btSol(0, 18, 31, 31)
  F(X1, 0, Z1, X2, 0, Z2, 'minecraft:polished_diorite'); for (var x = X1; x <= X2; x++) for (var z = Z1; z <= Z2; z++) if ((x + z) % 4 == 0) S(x, 0, z, 'minecraft:yellow_terracotta')
  W(X1, Z1, X2, Z2, 1, 4, BTM); F(X1, 5, Z1, X2, 5, Z2, BTS); W(X1, Z1, X2, Z2, 5, 6, BTB)
  // panneaux colores sous les baies, cote rue et cote cour
  ;[[5, 7], [10, 12], [19, 21], [24, 26]].forEach((w, i) => { F(w[0], 2, Z1, w[1], 3, Z1, GP); F(w[0], 1, Z1, w[1], 1, Z1, BTP[i % BTP.length]); F(w[0], 2, Z2, w[1], 4, Z2, GP); F(w[0], 1, Z2, w[1], 1, Z2, BTP[(i + 1) % BTP.length]) })
  F(15, 1, Z1, 16, 4, Z1, GP); PORTE(15, 1, Z1, 'minecraft:iron_door', 'north', 'left', 'true'); PORTE(16, 1, Z1, 'minecraft:iron_door', 'north', 'right', 'false'); F(14, 5, Z1 - 2, 17, 5, Z1 - 1, 'minecraft:smooth_stone_slab[type=bottom]')
  PORTE(15, 1, Z2, 'minecraft:oak_door', 'south', 'left', 'true')
  // hall central (x14..17), deux classes
  F(13, 1, Z1 + 1, 13, 4, Z2 - 1, BTB); F(18, 1, Z1 + 1, 18, 4, Z2 - 1, BTB); PORTE(13, 1, 10, 'minecraft:oak_door', 'west', 'left', 'false'); PORTE(18, 1, 12, 'minecraft:oak_door', 'east', 'left', 'true')
  for (var z = 6; z <= 14; z += 2) { S(14, 1, z, 'minecraft:iron_trapdoor[facing=east,half=bottom,open=true]'); S(17, 2, z, 'minecraft:stone_button[face=wall,facing=west,powered=false]') }
  S(15, 4, 10, 'minecraft:lantern[hanging=true]')
  ;[[4, 12], [19, 27]].forEach((c, i) => {
    for (var x = c[0] + 1; x <= c[1] - 1; x += 3) for (var z = 7; z <= 13; z += 4) { S(x, 1, z, 'handcrafted:oak_table[color=' + choix(['yellow', 'light_blue', 'red', 'lime']) + ',shape=single,waterlogged=false]'); btChaise(x, 1, z - 1, 'south'); btChaise(x, 1, z + 1, 'north') }
    for (var x = c[0]; x <= c[1]; x++) S(x, 2, Z1 + 1, x % 2 ? 'supplementaries:blackboard[facing=south]' : 'minecraft:bookshelf')
    F(c[0], 1, Z2 - 1, c[0] + 2, 1, Z2 - 1, BTP[i + 2].replace('terracotta', 'carpet'))
    S(c[0] + 4, 4, 10, 'minecraft:lantern[hanging=true]')
  })
  // dortoir : petits lits dans la classe est (cote cour)
  for (var x = 20; x <= 26; x += 2) LIT(x, 1, 15, choix(['light_blue', 'pink', 'yellow', 'lime']), 'north')
  for (var i = 0; i < 6; i++) SA(5 + Math.floor(R() * 22), 1, 6 + Math.floor(R() * 10), choix(['minecraft:cobweb', 'minecraft:white_carpet', 'supplementaries:book_pile_horizontal', 'minecraft:yellow_carpet']))
  for (var x = 6; x <= 24; x += 9) F(x, 5, 8, x + 1, 5, 13, 'minecraft:glass')
  // cour : bac a sable, toboggan, preau, grille
  F(4, -1, 21, 9, -1, 26, 'minecraft:sand'); W(4, 21, 9, 26, 0, 0, 'minecraft:smooth_stone_slab[type=bottom]'); F(5, 0, 22, 8, 0, 25, AIR)
  F(20, 0, 22, 22, 2, 22, 'minecraft:iron_bars'); F(20, 3, 22, 22, 3, 24, 'minecraft:yellow_concrete'); F(21, 1, 23, 21, 2, 23, AIR)
  for (var i = 0; i < 3; i++) S(21, 2 - i, 25 + i, btSt('smooth_quartz', 'north'))
  for (var i = 0; i < 3; i++) S(23 + i, 1 + i, 23, btSt('smooth_quartz', 'west')); F(24, 1, 23, 25, 2, 23, BTB)
  F(12, 3, 19, 19, 3, 22, 'minecraft:smooth_stone_slab[type=bottom]'); F(12, 0, 22, 12, 2, 22, BTB); F(19, 0, 22, 19, 2, 22, BTB)
  F(0, 0, 31, 31, 1, 31, 'minecraft:iron_bars'); F(0, 0, 18, 0, 1, 31, 'minecraft:iron_bars'); F(31, 0, 18, 31, 1, 31, 'minecraft:iron_bars')
  btArbre(27, 28, 5); btArbre(14, 28, 4)
}

// ---- vues de la serie 2 ----
function vuesBeton2() {
  vue('bt2_ensemble_sud', 0, 0, 64, 46, 120, 64, 8, 36, 3000)
  vue('bt2_coursives', 0, 0, 14, 16, 54, 14, 16, 12)
  vue('bt2_coursive_palier', 0, 0, 3, 13.6, 16.5, 22, 13, 16.5)
  vue('bt2_logement', 0, 0, 14, 13.6, 5.5, 10, 13, 9)
  vue('bt2_poste', 32, 0, 16, 8, 44, 16, 4, 14)
  vue('bt2_poste_guichets', 32, 0, 15.5, 3, 22, 15.5, 2, 10)
  vue('bt2_marche', 64, 0, 16, 10, 46, 16, 6, 14)
  vue('bt2_marche_halle', 64, 0, 15.5, 3, 27, 15.5, 4, 8)
  vue('bt2_dispensaire', 96, 0, 16, 8, 44, 16, 5, 14)
  vue('bt2_dispensaire_attente', 96, 0, 14, 3, 21.5, 6, 2, 16)
  vue('bt2_gymnase', 0, 48, 16, 12, -12, 16, 6, 10)
  vue('bt2_gymnase_terrain', 0, 48, 27, 8, 20, 10, 3, 8)
  vue('bt2_mediatheque', 32, 48, 16, 10, -12, 16, 7, 10)
  vue('bt2_mediatheque_etage', 32, 48, 4, 9, 4, 20, 7.5, 20)
  vue('bt2_maison_quartier', 64, 48, 16, 8, -12, 16, 4, 10)
  vue('bt2_maison_quartier_salle', 64, 48, 12, 5, 7.5, 12, 2, 22)
  vue('bt2_station', 96, 48, 16, 9, -10, 16, 3, 12)
  vue('bt2_station_atelier', 96, 48, 22, 3, 15, 22, 2, 24)
  vue('bt2_maternelle', 128, 48, 16, 8, -10, 16, 3, 10)
  vue('bt2_maternelle_cour', 128, 48, 16, 8, 34, 16, 1, 22)
}
var QFIN_BT2 = function () {
  HB2 = true; FIN = true; THM = THM_BT
  var rb = ['white', 'light_gray', 'orange', 'yellow', 'brown', 'light_blue']
  HM = {}; btRue(); finAncrage()
  lot(QF(btCoursives, null, rb), 0, 0, 999, 2611, 32, 40); lot(QF(btPoste, null, ['white', 'light_gray']), 32, 0, 999, 2621, 32, 18); lot(QF(btMarche, null, null), 64, 0, 999, 2631, 32, 14); lot(QF(btDispensaire, null, ['white']), 96, 0, 999, 2641, 32, 14)
  lot(QF(btGymnase, null, null), 0, 48, 999, 2651, 32, 14); lot(QF(btBibliotheque, null, null), 32, 48, 999, 2661, 32, 14); lot(QF(btMaisonQuartier, null, ['white', 'orange']), 64, 48, 999, 2671, 32, 11); lot(QF(btStation, null, null), 96, 48, 999, 2681, 32, 12)
  lot(QF(btCreche, null, ['yellow', 'light_blue']), 128, 48, 999, 2691, 32, 8)
  vlog('FIN volets ' + FIN_NV + ' rideaux ' + FIN_NR + ' paves ' + PAVE_NB + ' retraits ancrage ' + ANC_NB)
  HB2 = false; FIN = false; THM = null; HM = {}
}
