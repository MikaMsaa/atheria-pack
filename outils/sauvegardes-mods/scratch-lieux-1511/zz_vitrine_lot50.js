
// ================= MAMOUDZOU BETON, SERIE 3 : foyer, commissariat, supermarche, commerces et logements, pompiers, mairie annexe, cinema de quartier, chateau d'eau =================

// ================= FOYER-RESIDENCE (R+3, chambres sur couloir central, cuisine d'etage) =================
function btFoyer() {
  var X1 = 2, X2 = 29, Z1 = 8, Z2 = 19, Y = k => 5 * k
  btDalle(0, 20, 31, 31); btSol(0, 0, 31, 7)
  for (var k = 0; k <= 4; k++) { var y = Y(k); F(X1, y, Z1, X2, y, Z2, BTS); W(X1, Z1, X2, Z2, y, y, BTB) }
  for (var k = 0; k < 4; k++) {
    var y = Y(k)
    W(X1, Z1, X2, Z2, y + 1, y + 4, BTM)
    F(X1 + 1, y + 1, 12, 25, y + 4, 12, BTB); F(X1 + 1, y + 1, 15, 25, y + 4, 15, BTB)
    for (var i = 0; i <= 6; i++) { var xw = 2 + 4 * i; F(xw, y + 1, Z1 + 1, xw, y + 4, 11, BTB); F(xw, y + 1, 16, xw, y + 4, Z2 - 1, BTB) }
    for (var i = 0; i <= 5; i++) {
      var a = 3 + 4 * i, pan = BTP[(i + k) % BTP.length], vide = (i * 3 + k) % 5 == 0
      ;[[Z1, 'north', 12, 9, 10, 11], [Z2, 'south', 15, 18, 17, 16]].forEach(s => {
        var zf = s[0], f = s[1], zp = s[2], zh = s[3], zm = s[4]
        F(a + 1, y + 2, zf, a + 1, y + 3, zf, GP); S(a + 1, y + 1, zf, pan)
        // premiere travee : locaux fermes (l'escalier du couloir passe devant)
        if (i == 0) { SA(a + 1, y + 1, zm, choix(['minecraft:barrel[facing=up,open=false]', 'supplementaries:sack'])); return }
        PORTE(a + 1, y + 1, zp, 'minecraft:oak_door', f == 'north' ? 'south' : 'north', 'left', vide ? 'true' : 'false')
        if (vide) { for (var n = 0; n < 3; n++) SA(a + Math.floor(R() * 3), y + 1, Math.min(zh, zm) + Math.floor(R() * 2), choix(['minecraft:cobweb', 'supplementaries:sack', 'minecraft:white_carpet'])); return }
        LIT(a, y + 1, zm, choix(['white', 'light_gray', 'brown', 'light_blue']), f)
        S(a + 2, y + 1, zh, 'handcrafted:oak_desk[color=none,facing=' + f + ',waterlogged=false]'); btChaise(a + 2, y + 1, zm, f)
        if (R() < 0.5) SA(a + 2, y + 2, zh, choix(['handcrafted:stackable_book', 'supplementaries:jar', 'minecraft:potted_fern']))
        S(a + 1, y + 4, zm, 'minecraft:lantern[hanging=true]')
      })
    }
    // cuisine d'etage (bout est) : plans de travail, table commune
    for (var z = Z1 + 1; z <= 11; z++) S(X2 - 1, y + 1, z, btComptoir('west')); S(X2 - 1, y + 2, 10, 'farmersdelight:cooking_pot'); S(X2 - 1, y + 1, 9, 'farmersdelight:stove[facing=west,lit=false]')
    S(27, y + 1, 17, 'handcrafted:oak_table[color=yellow,shape=single,waterlogged=false]'); btChaise(27, y + 1, 16, 'south'); btChaise(27, y + 1, 18, 'north'); btChaise(28, y + 1, 17, 'west')
    F(X2, y + 2, 10, X2, y + 3, 11, GP); F(X2, y + 2, 16, X2, y + 3, 17, GP); S(27, y + 4, 13, 'minecraft:lantern[hanging=true]')
    // escalier empile dans le couloir (bout ouest)
    for (var i = 0; i <= 4; i++) { S(3 + i, y + 1 + i, 13, btSt('polished_andesite', 'east')); if (i > 0) F(3 + i, y + 1, 13, 3 + i, y + i, 13, BTA) }
    if (k < 3) F(3, y + 5, 13, 6, y + 5, 13, AIR)
    S(12, y + 4, 14, 'minecraft:lantern[hanging=true]'); S(20, y + 4, 14, 'minecraft:lantern[hanging=true]')
  }
  // entree est, boites aux lettres ; toit : acrotere, gaines
  PORTE(X2, 1, 13, 'minecraft:iron_door', 'east', 'left', 'true'); F(X2 + 1, 4, 12, X2 + 2, 4, 15, 'minecraft:smooth_stone_slab[type=bottom]')
  W(X1, Z1, X2, Z2, 21, 21, BTM); ;[[8, 13], [20, 14]].forEach(p => { F(p[0], 21, p[1], p[0] + 1, 22, p[1], BTG); S(p[0], 23, p[1], 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false]') })
  // abords : cour, bancs, etendoir, arbres
  gtBanc(6, 24, 'north', 3); gtBanc(20, 24, 'north', 3); btArbre(3, 28, 5); btArbre(28, 28, 5)
  F(12, 0, 27, 12, 2, 27, 'minecraft:iron_bars'); F(18, 0, 27, 18, 2, 27, 'minecraft:iron_bars'); F(13, 2, 27, 17, 2, 27, 'minecraft:chain[axis=x]')
  btArbre(15, 2, 5)
}

// ================= COMMISSARIAT (R+1, accueil grille, cellules, cour des vehicules) =================
function btCommissariat() {
  var X1 = 3, X2 = 28, Z1 = 7, Z2 = 24
  btDalle(0, 0, 31, 31)
  F(X1, 0, Z1, X2, 0, Z2, 'minecraft:polished_andesite')
  W(X1, Z1, X2, Z2, 1, 5, BTM); F(X1, 6, Z1, X2, 6, Z2, BTS); W(X1, Z1, X2, Z2, 6, 6, BTB); F(X1, 6, Z2, X2, 6, Z2, 'minecraft:blue_concrete')
  W(X1, Z1, X2, Z2, 7, 10, BTM); F(X1, 11, Z1, X2, 11, Z2, BTS); W(X1, Z1, X2, Z2, 12, 12, BTM)
  // facade : baies a barreaux au rez, bandeau de fenetres a l'etage, entree en retrait
  ;[[5, 7], [9, 11], [20, 22], [24, 26]].forEach(w => { F(w[0], 2, Z2, w[1], 4, Z2, GP); F(w[0], 2, Z2 + 1, w[1], 4, Z2 + 1, 'minecraft:iron_bars') })
  for (var x = 5; x <= 25; x += 4) F(x, 8, Z2, x + 1, 9, Z2, GP)
  F(14, 1, Z2, 17, 4, Z2, GP); PORTE(15, 1, Z2, 'minecraft:iron_door', 'south', 'left', 'false'); PORTE(16, 1, Z2, 'minecraft:iron_door', 'south', 'right', 'false')
  F(13, 5, Z2 + 1, 18, 5, Z2 + 2, 'minecraft:smooth_stone_slab[type=bottom]')
  // barricade de sacs devant l'entree
  for (var x = 12; x <= 19; x++) { if (x == 15 || x == 16) continue; S(x, 0, Z2 + 4, 'supplementaries:sack'); if (R() < 0.6) S(x, 1, Z2 + 4, 'supplementaries:sack') }
  // accueil : comptoir sous grille, bancs, portique
  for (var x = X1 + 1; x <= X2 - 1; x++) { S(x, 1, 18, x == 15 ? AIR : btComptoir('south')); F(x, 2, 18, x, 5, 18, x == 15 ? AIR : 'minecraft:iron_bars') }
  S(15, 1, 18, 'minecraft:iron_door[facing=south,half=lower,hinge=left,open=false]'); S(15, 2, 18, 'minecraft:iron_door[facing=south,half=upper,hinge=left,open=false]')
  F(X1 + 1, 1, 20, X1 + 1, 1, 23, btSt('smooth_quartz', 'west')); F(X2 - 1, 1, 20, X2 - 1, 1, 23, btSt('smooth_quartz', 'east')); S(X2 - 1, 2, 21, 'supplementaries:notice_board[facing=west,has_book=false]')
  for (var x = 6; x <= 24; x += 6) btChaise(x, 1, 17, 'south')
  S(10, 5, 21, 'mcwlights:iron_chandelier'); S(21, 5, 21, 'mcwlights:iron_chandelier')
  // bureaux (milieu) et cellules (nord)
  F(X1 + 1, 1, 13, X2 - 1, 5, 13, BTB); PORTE(10, 1, 13, 'minecraft:iron_door', 'north', 'left', 'false')
  for (var x = 6; x <= 24; x += 6) { S(x, 1, 15, 'handcrafted:oak_desk[color=none,facing=south,waterlogged=false]'); btChaise(x, 1, 14, 'south'); if (R() < 0.6) SA(x, 2, 15, choix(['handcrafted:stackable_book', 'supplementaries:book_pile_horizontal'])) }
  S(X2 - 1, 1, 14, 'handcrafted:oak_cupboard[facing=west,type=1]'); S(X2 - 1, 1, 16, 'handcrafted:oak_cupboard[facing=west,type=1]'); S(15, 5, 15, 'minecraft:lantern[hanging=true]')
  ;[[5, 9], [11, 15], [17, 21]].forEach((c, i) => {
    F(c[0] - 1, 1, Z1 + 1, c[0] - 1, 5, 11, BTB); F(c[1] + 1, 1, Z1 + 1, c[1] + 1, 5, 11, BTB)
    F(c[0], 1, 11, c[1], 4, 11, 'minecraft:iron_bars'); S(c[0] + 2, 1, 11, i == 1 ? AIR : 'minecraft:iron_bars'); S(c[0] + 2, 2, 11, i == 1 ? AIR : 'minecraft:iron_bars')
    F(c[0], 1, Z1 + 1, c[0] + 2, 1, Z1 + 1, btSt('smooth_quartz', 'north')); S(c[1], 1, Z1 + 1, 'minecraft:cauldron'); S(c[0] + 1, 4, 9, 'minecraft:lantern[hanging=true]')
    if (i == 2) SA(c[0] + 1, 1, 9, 'minecraft:cobweb')
  })
  F(23, 1, Z1 + 1, X2 - 1, 1, 11, 'minecraft:barrel[facing=up,open=false]'); F(23, 2, Z1 + 1, X2 - 1, 2, Z1 + 1, 'minecraft:iron_trapdoor[facing=south,half=bottom,open=true]')
  // escalier (est, contre le mur du hall)
  for (var i = 0; i <= 5; i++) { S(X2 - 1 - i, 1 + i, 19, btSt('polished_andesite', 'west')); if (i > 0) F(X2 - 1 - i, 1, 19, X2 - 1 - i, i, 19, BTA) }
  F(X2 - 5, 6, 19, X2 - 1, 6, 19, AIR); F(X2 - 1, 1, 20, X2 - 1, 5, 20, AIR); F(X2 - 1, 1, 20, X2 - 1, 1, 23, btSt('smooth_quartz', 'east'))
  // etage : salle de crise, armurerie vide, vestiaire
  for (var x = 8; x <= 14; x++) S(x, 7, 17, 'handcrafted:oak_table[color=blue,shape=single,waterlogged=false]'); for (var x = 8; x <= 14; x += 2) { btChaise(x, 7, 16, 'south'); btChaise(x, 7, 18, 'north') }
  S(11, 8, 17, 'supplementaries:globe[facing=south]'); for (var x = 5; x <= 15; x++) S(x, 8, Z1 + 1, x % 2 ? 'supplementaries:blackboard[facing=south]' : 'minecraft:bookshelf')
  F(18, 7, Z1 + 1, 18, 10, Z2 - 1, BTB); S(18, 7, 14, AIR); S(18, 8, 14, AIR)
  for (var z = 9; z <= 22; z++) { S(X2 - 1, 7, z, 'minecraft:iron_trapdoor[facing=west,half=bottom,open=' + (R() < 0.6 ? 'true' : 'false') + ']'); S(X2 - 1, 8, z, 'minecraft:iron_trapdoor[facing=west,half=bottom,open=true]') }
  for (var i = 0; i < 6; i++) SA(19 + Math.floor(R() * 8), 7, 9 + Math.floor(R() * 13), choix(['minecraft:barrel[facing=up,open=true]', 'supplementaries:sack', 'minecraft:cobweb']))
  S(11, 10, 13, 'mcwlights:iron_chandelier'); S(23, 10, 15, 'mcwlights:iron_chandelier')
  // cour nord grillagee : voitures de patrouille, fourgon
  F(0, -1, 0, 31, -1, 6, BTG); F(0, 0, 0, 31, 2, 0, 'minecraft:iron_bars'); F(0, 0, 0, 0, 2, 6, 'minecraft:iron_bars'); F(31, 0, 0, 31, 2, 6, 'minecraft:iron_bars'); F(13, 0, 0, 18, 2, 0, AIR)
  btVoitureY(0, 3, 2, 'x', 'white', 1); btVoitureY(0, 9, 3, 'x', 'blue', 0); btVoitureY(0, 22, 2, 'x', 'white', 2)
  F(0, 3, 0, 31, 3, 0, 'simply_traps:circular_barbed_wire_iron[facing=south]'); F(13, 3, 0, 18, 3, 0, AIR)
}

// ================= SUPERMARCHE (plain-pied, rayons pilles, caisses, parking) =================
function btSupermarche() {
  var X1 = 2, X2 = 29, Z1 = 3, Z2 = 20
  btDalle(0, 0, 31, 2)
  F(X1, 0, Z1, X2, 0, Z2, 'minecraft:smooth_quartz'); for (var x = X1; x <= X2; x++) for (var z = Z1; z <= Z2; z++) if ((x + z) % 2 == 0) S(x, 0, z, 'minecraft:polished_diorite')
  W(X1, Z1, X2, Z2, 1, 6, BTM); F(X1, 7, Z1, X2, 7, Z2, BTS); W(X1, Z1, X2, Z2, 7, 8, BTB); F(X1, 6, Z2, X2, 6, Z2, 'minecraft:orange_concrete')
  // facade sud : vitrines, sas, auvent sur poteaux
  ;[[4, 6], [8, 10], [21, 23], [25, 27]].forEach(w => F(w[0], 1, Z2, w[1], 4, Z2, GP))
  F(13, 1, Z2, 18, 4, Z2, 'minecraft:glass'); F(14, 1, Z2, 17, 3, Z2, AIR)
  F(X1, 5, Z2 + 1, X2, 5, Z2 + 3, 'minecraft:smooth_stone_slab[type=bottom]'); for (var x = X1; x <= X2; x += 9) F(x, 0, Z2 + 3, x, 4, Z2 + 3, BTB); F(X2, 0, Z2 + 3, X2, 4, Z2 + 3, BTB)
  // rayons (pilles), frigos au nord, caisses
  for (var x = 5; x <= 26; x += 3) for (var z = 7; z <= 15; z++) {
    if (z == 11) continue
    S(x, 1, z, 'handcrafted:birch_shelf[facing=east,shape=single,type=1]'); S(x, 2, z, 'handcrafted:birch_shelf[facing=east,shape=single,type=1]')
    if (R() < 0.25) SA(x + 1, 1, z, choix(['supplementaries:jar', 'supplementaries:sack', 'minecraft:white_carpet', 'minecraft:cobweb', 'farmersdelight:onion_crate']))
  }
  for (var x = X1 + 1; x <= X2 - 1; x++) { S(x, 1, Z1 + 1, 'minecraft:white_concrete'); S(x, 2, Z1 + 1, 'minecraft:iron_trapdoor[facing=south,half=bottom,open=' + (x % 4 == 0 ? 'true' : 'false') + ']'); S(x, 3, Z1 + 1, 'minecraft:light_blue_stained_glass') }
  for (var x = 5; x <= 25; x += 5) { F(x, 1, 18, x + 2, 1, 18, btComptoir('south')); btChaise(x + 1, 1, 17, 'south'); S(x + 2, 2, 18, 'minecraft:stone_button[face=floor,facing=south,powered=false]') }
  // chariots abandonnes
  ;[[12, 16], [20, 12], [16, 24], [8, 27]].forEach(p => { S(p[0], 0, p[1], 'minecraft:iron_bars'); S(p[0] + 1, 0, p[1], 'minecraft:iron_bars'); S(p[0], 1, p[1], 'minecraft:iron_trapdoor[facing=east,half=bottom,open=false]') })
  for (var x = 6; x <= 26; x += 5) for (var z = 7; z <= 15; z += 4) S(x, 6, z, 'minecraft:lantern[hanging=true]')
  // toit : groupes froids, lanterneaux
  ;[[6, 6], [24, 6], [15, 14]].forEach(p => { F(p[0], 8, p[1], p[0] + 2, 9, p[1] + 1, BTG); S(p[0] + 1, 10, p[1], 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false]') })
  for (var x = 9; x <= 21; x += 6) F(x, 7, 8, x + 1, 7, 15, 'minecraft:glass')
  // parking : lignes, voitures, chariots
  F(0, -1, 23, 31, -1, 31, BTG); for (var x = 1; x <= 30; x += 4) F(x, -1, 25, x, -1, 30, BTB)
  btVoitureY(0, 2, 26, 'z', 'red', 1); btVoitureY(0, 10, 26, 'z', 'gray', 2); btVoitureY(0, 22, 26, 'z', 'yellow', 0)
  btArbre(30, 30, 4)
}

// ================= COMMERCES DE PIED D'IMMEUBLE + 2 ETAGES DE LOGEMENTS (escalier exterieur au nord) =================
function btBoutiques() {
  var X1 = 2, X2 = 29
  btDalle(0, 0, 31, 31)
  // rez : trois boutiques profondes (z6..22)
  F(X1, 0, 6, X2, 0, 22, 'minecraft:polished_andesite'); W(X1, 6, X2, 22, 1, 5, BTM); F(X1, 6, 6, X2, 6, 22, BTS); W(X1, 6, X2, 22, 6, 6, BTB)
  F(11, 1, 7, 11, 5, 21, BTB); F(20, 1, 7, 20, 5, 21, BTB)
  var BQ = [[3, 10, 'laverie'], [12, 19, 'tabac'], [21, 28, 'boulangerie']]
  BQ.forEach((b, i) => {
    F(b[0] + 1, 1, 22, b[1] - 1, 4, 22, GP); PORTE(b[0] + 3, 1, 22, 'minecraft:iron_door', 'south', 'left', i == 1 ? 'true' : 'false')
    F(b[0], 5, 23, b[1], 5, 24, 'minecraft:' + ['light_blue', 'red', 'yellow'][i] + '_terracotta')
    if (i == 1) for (var x = b[0] + 1; x <= b[1] - 1; x++) for (var y = 1; y <= 4; y++) if (libreH(x, y, 23)) S(x, y, 23, 'mcwwindows:iron_shutter[facing=south,hinge=left,open=false]')
    S(b[0] + 3, 5, 14, 'minecraft:lantern[hanging=true]')
  })
  // laverie : machines (blocs blancs a hublot), banc, panier
  for (var x = 3; x <= 10; x++) { S(x, 1, 7, 'minecraft:white_concrete'); S(x, 2, 7, 'minecraft:iron_trapdoor[facing=south,half=bottom,open=' + (x % 3 ? 'false' : 'true') + ']'); S(x, 3, 7, 'minecraft:white_concrete') }
  F(3, 1, 18, 7, 1, 18, btSt('smooth_quartz', 'north')); SA(9, 1, 16, 'supplementaries:sack'); SA(5, 1, 12, 'minecraft:white_carpet')
  // tabac-presse : comptoir, presentoirs a journaux
  F(13, 1, 10, 18, 1, 10, btComptoir('south', 'dark_oak_planks')); btChaise(15, 1, 9, 'south')
  for (var z = 13; z <= 19; z += 3) { S(13, 1, z, 'minecraft:bookshelf'); S(18, 1, z, 'handcrafted:birch_shelf[facing=west,shape=single,type=1]'); SA(18, 2, z, 'supplementaries:book_pile_horizontal') }
  // boulangerie : vitrine refrigeree, four, sacs de farine
  F(22, 1, 15, 27, 1, 15, btComptoir('south', 'quartz_block')); for (var x = 22; x <= 27; x += 2) if (R() < 0.5) S(x, 2, 15, choix(GATEAUX))
  S(24, 1, 8, 'minecraft:smoker[facing=south,lit=false]'); S(25, 1, 8, 'minecraft:furnace[facing=south,lit=false]'); for (var x = 21; x <= 23; x++) SA(x, 1, 8, 'supplementaries:sack')
  // etages : deux logements traversants (z7..15), loggias au sud sur le toit des boutiques
  for (var e = 0; e < 2; e++) {
    var y = 6 + 6 * e
    F(X1, y, 6, X2, y, 16, BTS); W(X1, 6, X2, 16, y, y, BTB); W(X1, 6, X2, 16, y + 1, y + 5, BTM); F(X1, y + 6, 6, X2, y + 6, 16, BTS)
    for (var x = 4; x <= 26; x += 4) { F(x, y + 2, 16, x + 1, y + 4, 16, GP); F(x, y + 1, 16, x + 1, y + 1, 16, BTP[(x + e) % BTP.length]) }
    for (var x = 5; x <= 25; x += 10) F(x, y + 2, 6, x + 1, y + 3, 6, GP)
    F(11, y + 1, 7, 11, y + 5, 15, BTB); F(20, y + 1, 7, 20, y + 5, 15, BTB); S(11, y + 1, 11, AIR); S(11, y + 2, 11, AIR); S(20, y + 1, 11, AIR); S(20, y + 2, 11, AIR)
    // sejour (ouest) : canape, table basse, buffet
    for (var x = 4; x <= 6; x++) S(x, y + 1, 13, 'mcwfurnitures:' + choix(['red', 'blue', 'gray']) + '_couch[facing=north,shape=single]')
    S(5, y + 1, 11, 'handcrafted:oak_table[color=white,shape=single,waterlogged=false]'); F(3, y + 1, 7, 6, y + 1, 7, 'handcrafted:oak_drawer[facing=south,shape=single,type=1]'); S(9, y + 1, 15, 'minecraft:potted_fern')
    S(6, y + 5, 11, 'mcwlights:iron_chandelier')
    // cuisine (milieu)
    for (var x = 12; x <= 19; x++) if (x != 17) S(x, y + 1, 7, x == 14 ? 'farmersdelight:stove[facing=south,lit=false]' : btComptoir('south')); S(16, y + 1, 12, 'handcrafted:oak_table[color=red,shape=single,waterlogged=false]'); btChaise(15, y + 1, 12, 'east'); btChaise(17, y + 1, 12, 'west'); S(16, y + 5, 11, 'minecraft:lantern[hanging=true]')
    // chambre (est)
    LIT(24, y + 1, 9, choix(['white', 'light_blue', 'orange']), 'north'); S(23, y + 1, 7, 'handcrafted:oak_drawer[facing=south,shape=single,type=1]'); S(27, y + 1, 15, 'handcrafted:oak_cupboard[facing=north,type=1]'); S(24, y + 5, 12, 'minecraft:lantern[hanging=true]')
    if (e == 1) for (var n = 0; n < 5; n++) SA(3 + Math.floor(R() * 25), y + 1, 8 + Math.floor(R() * 7), choix(['minecraft:cobweb', 'minecraft:white_carpet', 'supplementaries:sack']))
  }
  W(X1, 6, X2, 16, 19, 19, BTM)
  // terrasses sur les boutiques (y6, z17..22) : garde-corps, separations, jardinieres
  F(X1, 7, 22, X2, 7, 22, 'minecraft:iron_bars'); ;[11, 20].forEach(x => F(x, 7, 17, x, 8, 21, BTM))
  for (var x = 4; x <= 26; x += 7) S(x, 7, 21, choix(['handcrafted:terracotta_wide_pot', 'minecraft:potted_dead_bush', 'supplementaries:planter[extended=false]']))
  // escalier exterieur (nord) : deux volees, paliers sur poteaux, portes palieres
  ;[[3, 0, 9], [11, 6, 17]].forEach(v => {
    var x0 = v[0], y0 = v[1], xp = v[2]
    for (var i = 0; i <= 5; i++) { S(x0 + i, y0 + 1 + i, 5, btSt('polished_andesite', 'east')); F(x0 + i, 0, 5, x0 + i, y0 + i, 5, BTM) }
    F(x0 + 6, y0 + 6, 3, x0 + 8, y0 + 6, 5, BTS); F(x0 + 8, 0, 3, x0 + 8, y0 + 5, 3, BTB); F(x0 + 6, y0 + 7, 3, x0 + 8, y0 + 7, 3, 'minecraft:iron_bars')
    F(x0 + 6, y0 + 7, 2, x0 + 8, y0 + 7, 2, AIR); PORTE(xp, y0 + 7, 6, 'minecraft:oak_door', 'north', 'left', 'false')
  })
}

// ================= CASERNE DE POMPIERS (remises, tour de sechage, dortoir) — entree au nord =================
function btPompiers() {
  btDalle(0, 0, 31, 31)
  // remises : trois baies ouvertes sur la rue
  F(2, 0, 3, 20, 0, 20, BTS); W(2, 3, 20, 20, 1, 7, BTM); F(2, 8, 3, 20, 8, 20, BTS); W(2, 3, 20, 20, 8, 8, BTB); F(2, 7, 3, 20, 7, 3, 'minecraft:red_concrete')
  ;[3, 9, 15].forEach((x, i) => { F(x, 1, 3, x + 4, 5, 3, AIR); F(x, 6, 3, x + 4, 6, 3, BTB); if (i == 2) F(x, 5, 3, x + 4, 5, 3, 'minecraft:iron_trapdoor[facing=south,half=top,open=false]'); for (var z = 4; z <= 19; z += 5) SA(x + 2, 6, z, 'minecraft:lantern[hanging=true]') })
  F(8, 1, 4, 8, 7, 19, BTB); F(14, 1, 4, 14, 7, 19, BTB); S(8, 1, 15, AIR); S(8, 2, 15, AIR); S(14, 1, 15, AIR); S(14, 2, 15, AIR)
  // fourgons (rouges, longs) : caisse, echelle sur le toit
  ;[[4, 5], [10, 7]].forEach((p, i) => {
    for (var u = 0; u < 9; u++) for (var v = 0; v < 3; v++) { S(p[0] + v, 1, p[1] + u, 'minecraft:red_concrete'); S(p[0] + v, 2, p[1] + u, u < 2 ? (v == 1 ? 'minecraft:tinted_glass' : 'minecraft:red_concrete') : 'minecraft:red_concrete'); if (u >= 2) S(p[0] + v, 3, p[1] + u, v == 1 ? 'minecraft:rail[shape=north_south]' : 'minecraft:light_gray_concrete') }
    ;[0, 7].forEach(u => { S(p[0] - 1, 1, p[1] + u, 'minecraft:polished_blackstone_button[face=wall,facing=west]'); S(p[0] + 3, 1, p[1] + u, 'minecraft:polished_blackstone_button[face=wall,facing=east]') })
    if (i == 1) { S(p[0] + 1, 2, p[1], 'minecraft:gray_stained_glass'); SA(p[0] + 1, 4, p[1] + 5, 'minecraft:cobweb') }
  })
  // troisieme remise : tuyaux enroules, casiers, bottes
  for (var z = 6; z <= 18; z += 2) { S(19, 1, z, 'minecraft:barrel[facing=west,open=false]'); S(19, 2, z, 'minecraft:iron_trapdoor[facing=west,half=bottom,open=true]') }
  for (var i = 0; i < 4; i++) SA(15 + Math.floor(R() * 3), 1, 8 + i * 3, choix(['minecraft:light_gray_carpet', 'supplementaries:sack', 'minecraft:cobweb']))
  // tour de sechage des tuyaux (angle nord-est)
  W(23, 2, 27, 6, 1, 22, BTM); F(23, 23, 2, 27, 23, 6, BTS); for (var y = 4; y <= 20; y += 4) { F(25, y, 2, 25, y + 2, 2, 'minecraft:iron_bars'); F(27, y, 4, 27, y + 2, 4, 'minecraft:iron_bars') }
  for (var y = 1; y <= 21; y++) S(24, y, 5, 'minecraft:ladder[facing=north]'); PORTE(25, 1, 6, 'minecraft:iron_door', 'south', 'left', 'false')
  for (var y = 8; y <= 20; y += 3) S(26, y, 4, 'minecraft:chain[axis=y]')
  // dortoir et bureaux (R+1, x21..29, z9..20)
  var X1 = 21, X2 = 29, Z1 = 9, Z2 = 20
  F(X1, 0, Z1, X2, 0, Z2, 'minecraft:polished_andesite'); W(X1, Z1, X2, Z2, 1, 5, BTM); F(X1, 6, Z1, X2, 6, Z2, BTS); W(X1, Z1, X2, Z2, 7, 11, BTM); F(X1, 12, Z1, X2, 12, Z2, BTS); W(X1, Z1, X2, Z2, 13, 13, BTM)
  F(23, 2, Z1, 24, 4, Z1, GP); F(26, 2, Z1, 27, 4, Z1, GP); F(23, 8, Z1, 24, 10, Z1, GP); F(26, 8, Z1, 27, 10, Z1, GP); ;[12, 16].forEach(z => { F(X2, 2, z, X2, 4, z + 1, GP); F(X2, 8, z, X2, 10, z + 1, GP) })
  PORTE(X1, 1, 15, 'minecraft:iron_door', 'west', 'left', 'true')
  F(22, 1, 18, 26, 1, 18, btComptoir('south')); S(24, 2, 18, 'supplementaries:jar'); for (var x = 23; x <= 27; x += 2) btChaise(x, 1, 13, 'north'); S(25, 1, 12, 'handcrafted:oak_table[color=red,shape=single,waterlogged=false]'); S(25, 5, 14, 'mcwlights:iron_chandelier')
  for (var i = 0; i <= 5; i++) { S(X1 + 1 + i, 1 + i, Z2 - 1, btSt('polished_andesite', 'east')); if (i > 0) F(X1 + 1 + i, 1, Z2 - 1, X1 + 1 + i, i, Z2 - 1, BTA) }
  F(X1 + 1, 6, Z2 - 1, X1 + 5, 6, Z2 - 1, AIR)
  for (var z = 11; z <= 17; z += 3) { LIT(23, 7, z, 'red', 'west'); LIT(27, 7, z, 'red', 'east') } S(25, 11, 14, 'minecraft:lantern[hanging=true]')
  // cour arriere : poteau d'exercice, bouche d'incendie, tuyau
  F(4, 0, 24, 4, 9, 24, 'minecraft:iron_bars'); F(4, 9, 24, 8, 9, 24, 'minecraft:iron_bars'); F(8, 0, 24, 8, 9, 24, 'minecraft:iron_bars')
  S(15, 0, 27, 'minecraft:red_concrete'); S(15, 1, 27, 'minecraft:red_concrete'); S(15, 2, 27, 'minecraft:smooth_stone_slab[type=bottom]'); S(16, 1, 27, 'minecraft:lever[face=wall,facing=east,powered=false]')
  btArbre(27, 28, 5); btArbre(2, 29, 4)
}

// ================= MAIRIE ANNEXE (pilotis, salle des mariages, guichets) — entree au nord =================
function btMairieAnnexe() {
  btDalle(0, 0, 31, 31)
  // rez sur pilotis : hall vitre au centre, porche couvert
  F(4, 0, 4, 27, 0, 25, 'minecraft:polished_diorite')
  for (var x = 4; x <= 27; x += 23) for (var z = 4; z <= 25; z += 7) F(x, 1, z, x, 5, z, BTB)
  for (var x = 11; x <= 20; x += 9) for (var z = 4; z <= 25; z += 7) F(x, 1, z, x, 5, z, BTB)
  W(9, 9, 22, 22, 1, 5, 'minecraft:glass_pane'); for (var x = 9; x <= 22; x += 4) { F(x, 1, 9, x, 5, 9, BTB); F(x, 1, 22, x, 5, 22, BTB) } F(9, 1, 9, 9, 5, 22, BTB); F(22, 1, 9, 22, 5, 22, BTB)
  for (var z = 12; z <= 20; z += 4) { F(9, 2, z, 9, 4, z + 1, GP); F(22, 2, z, 22, 4, z + 1, GP) }
  PORTE(15, 1, 9, 'minecraft:iron_door', 'north', 'left', 'true'); PORTE(16, 1, 9, 'minecraft:iron_door', 'north', 'right', 'false')
  F(10, 1, 17, 21, 1, 17, btComptoir('north', 'quartz_block')); for (var x = 11; x <= 20; x += 3) btChaise(x, 1, 18, 'north'); S(13, 1, 12, 'supplementaries:notice_board[facing=south,has_book=false]')
  F(10, 1, 12, 10, 1, 15, btSt('smooth_quartz', 'west')); S(15, 5, 13, 'mcwlights:iron_chandelier')
  for (var i = 0; i <= 5; i++) { S(21 - i, 1 + i, 21, btSt('polished_andesite', 'west')); if (i > 0) F(21 - i, 1, 21, 21 - i, i, 21, BTA) } F(16, 6, 21, 20, 6, 21, AIR)
  // etage en caisson (y6..13) : salle des mariages, bureau du maire
  F(2, 6, 2, 29, 6, 27, BTS); W(2, 2, 29, 27, 6, 6, BTB); W(2, 2, 29, 27, 7, 12, BTM); F(2, 13, 2, 29, 13, 27, BTS); W(2, 2, 29, 27, 14, 14, BTM)
  for (var x = 4; x <= 26; x += 4) { F(x, 8, 2, x + 1, 11, 2, GP); F(x, 8, 27, x + 1, 11, 27, GP) }
  for (var z = 5; z <= 23; z += 6) { F(2, 8, z, 2, 10, z + 1, GP); F(29, 8, z, 29, 10, z + 1, GP) }
  F(3, 7, 18, 28, 12, 18, BTB); PORTE(15, 7, 18, 'minecraft:oak_door', 'south', 'left', 'false')
  F(13, 7, 4, 18, 7, 4, 'handcrafted:oak_table[color=white,shape=single,waterlogged=false]'); for (var x = 13; x <= 18; x += 5) btChaise(x, 7, 3, 'south'); btChaise(15, 7, 3, 'south'); btChaise(16, 7, 3, 'south')
  for (var z = 7; z <= 15; z += 2) for (var x = 5; x <= 26; x++) { if (x >= 14 && x <= 17) continue; btChaise(x, 7, z, 'north') }
  F(14, 7, 6, 17, 7, 16, 'minecraft:red_carpet'); S(10, 12, 9, 'mcwlights:iron_chandelier'); S(21, 12, 9, 'mcwlights:iron_chandelier'); S(15, 12, 13, 'mcwlights:iron_chandelier')
  for (var i = 0; i < 6; i++) SA(4 + Math.floor(R() * 23), 7, 6 + Math.floor(R() * 10), choix(['minecraft:white_carpet', 'minecraft:cobweb', 'minecraft:light_gray_carpet']))
  S(6, 7, 24, 'handcrafted:oak_desk[color=none,facing=north,waterlogged=false]'); btChaise(6, 7, 25, 'north'); F(24, 7, 26, 28, 7, 26, 'minecraft:bookshelf'); F(24, 8, 26, 28, 8, 26, 'minecraft:bookshelf'); S(20, 7, 22, 'supplementaries:globe[facing=north]'); S(14, 12, 23, 'minecraft:lantern[hanging=true]')
  // parvis : banc, massifs, arbres, mat sans drapeau
  btSol(0, 26, 31, 31); gtBanc(4, 1, 'east', 3); gtBanc(27, 1, 'west', 3); btArbre(2, 29, 5); btArbre(29, 29, 5); F(15, 0, 1, 15, 8, 1, 'minecraft:iron_bars')
}

// ================= CINEMA DE QUARTIER (hall, guichet, salle en gradins, cabine de projection) — entree au nord =================
function btCinema() {
  var X1 = 4, X2 = 27, Z1 = 8, Z2 = 27
  btDalle(0, 0, 31, 7); btSol(0, 28, 31, 31); btDalle(0, 8, 3, 27); btDalle(28, 8, 31, 27)
  F(X1, 0, Z1, X2, 0, Z2, BTS); F(X1 + 1, 0, Z1 + 1, X2 - 1, 0, 12, 'minecraft:polished_diorite')
  W(X1, Z1, X2, Z2, 1, 9, BTM); F(X1, 10, Z1, X2, 10, Z2, BTS); W(X1, Z1, X2, Z2, 10, 11, BTB); W(X1, Z1, X2, Z2, 5, 5, BTB)
  // facade nord : entree vitree, bandeau vitre de la cabine, auvent sur poteaux
  F(12, 1, Z1, 19, 4, Z1, GP); PORTE(15, 1, Z1, 'minecraft:iron_door', 'north', 'left', 'false'); PORTE(16, 1, Z1, 'minecraft:iron_door', 'north', 'right', 'false')
  F(7, 7, Z1, 24, 8, Z1, GP); for (var x = 9; x <= 22; x += 4) F(x, 7, Z1, x, 8, Z1, BTB)
  F(10, 5, 4, 21, 5, 7, 'minecraft:smooth_stone_slab[type=top]'); F(10, 1, 4, 10, 4, 4, 'minecraft:iron_bars'); F(21, 1, 4, 21, 4, 4, 'minecraft:iron_bars')
  for (var x = 12; x <= 19; x += 7) S(x, 4, 5, 'minecraft:lantern[hanging=true]')
  // hall (z9..12) : guichet, confiserie, banquettes ; cabine de projection au-dessus (y6)
  F(X1 + 1, 1, 13, X2 - 1, 9, 13, BTM); F(X1 + 1, 6, Z1 + 1, X2 - 1, 6, 12, BTS)
  F(6, 1, 11, 10, 1, 11, btComptoir('north')); S(8, 2, 11, 'supplementaries:jar'); S(21, 1, 11, btComptoir('north')); S(22, 1, 11, btComptoir('north')); S(21, 2, 11, 'supplementaries:jar')
  for (var z = 9; z <= 10; z++) { btChaise(X1 + 1, 1, z, 'east'); btChaise(X2 - 1, 1, z, 'west') }
  S(15, 5, 10, 'mcwlights:iron_chandelier'); S(10, 5, 9, 'minecraft:lantern[hanging=true]'); S(21, 5, 9, 'minecraft:lantern[hanging=true]')
  PORTE(12, 1, 13, 'minecraft:oak_door', 'south', 'left', 'false'); PORTE(19, 1, 13, 'minecraft:oak_door', 'south', 'right', 'false')
  // acces cabine : echelle contre le mur ouest, trappe dans le plancher
  for (var y = 1; y <= 6; y++) S(X1 + 1, y, 12, 'minecraft:ladder[facing=east]')
  F(14, 7, 13, 17, 8, 13, GP); S(15, 7, 12, 'minecraft:dispenser[facing=south,triggered=false]'); S(16, 7, 12, 'minecraft:dispenser[facing=south,triggered=false]')
  for (var x = 20; x <= 25; x += 2) S(x, 7, 9, 'minecraft:barrel[facing=up,open=false]'); S(8, 7, 10, 'handcrafted:oak_desk[color=none,facing=north,waterlogged=false]'); btChaise(8, 7, 11, 'north'); S(12, 9, 10, 'minecraft:lantern[hanging=true]')
  // salle (z14..26) : ecran au sud, scene, gradins (rangees face a l'ecran), allee centrale
  F(7, 3, Z2 - 1, 24, 8, Z2 - 1, 'minecraft:white_wool'); F(6, 2, Z2 - 1, 25, 2, Z2 - 1, 'minecraft:black_concrete'); F(6, 9, Z2 - 1, 25, 9, Z2 - 1, 'minecraft:black_concrete')
  F(6, 1, Z2 - 2, 25, 1, Z2 - 1, 'minecraft:spruce_slab[type=bottom]')
  for (var k = 0; k <= 4; k++) {
    var z = 22 - 2 * k, h = k < 2 ? 0 : 1
    if (h) F(X1 + 1, 1, z, X2 - 1, 1, z + 1, BTS)
    for (var x = X1 + 2; x <= X2 - 2; x++) { if ((x >= 15 && x <= 16) || x == 12 || x == 19) continue; if (R() < 0.12) continue; btChaise(x, 1 + h, z, 'south') }
  }
  F(15, 2, 14, 16, 2, 19, 'minecraft:red_carpet'); F(15, 1, 20, 16, 1, 23, 'minecraft:red_carpet')
  for (var z = 16; z <= 22; z += 6) { S(X1 + 1, 6, z, 'minecraft:lantern[hanging=false]'); S(X2 - 1, 6, z, 'minecraft:lantern[hanging=false]') }
  for (var z = 16; z <= 22; z += 6) { S(X1 + 1, 5, z, BTB); S(X2 - 1, 5, z, BTB) }
  PORTE(X2, 1, 24, 'minecraft:iron_door', 'east', 'left', 'false')
  for (var i = 0; i < 8; i++) SA(X1 + 2 + Math.floor(R() * 20), 4 + Math.floor(R() * 4), 14 + Math.floor(R() * 10), 'minecraft:cobweb')
  // toit : groupes de ventilation ; cour arriere
  for (var x = 8; x <= 22; x += 7) { S(x, 11, 20, 'minecraft:iron_block'); S(x, 12, 20, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false]') }
  btArbre(2, 30, 5); btArbre(29, 30, 5); btArbre(2, 2, 4); gtBanc(24, 2, 'east', 3)
}

// ================= CHATEAU D'EAU (fut, cuve evasee, echelle) + local technique =================
function btChateauEau() {
  btSol(0, 0, 31, 31); btDalle(10, 0, 21, 4)
  var CX = 15.5, CZ = 15.5
  function d(x, z) { return Math.sqrt((x - CX) * (x - CX) + (z - CZ) * (z - CZ)) }
  F(9, -1, 9, 22, -1, 22, BTS)
  for (var x = 8; x <= 23; x++) for (var z = 8; z <= 23; z++) {
    var r = d(x, z)
    // fut : couronne de rayon 2,5
    if (r <= 3 && r > 1.6) F(x, 0, z, x, 18, z, BTM)
    // evasement (y19..21) puis cuve (y22..29)
    if (r <= 4.2 && r > 1.6) S(x, 19, z, BTM); if (r <= 5.4 && r > 1.6) S(x, 20, z, BTM); if (r <= 7.4 && r > 1.6) S(x, 21, z, BTM)
    if (r <= 7.4 && r > 6.2) F(x, 22, z, x, 29, z, (x + z) % 7 == 0 ? BTB : BTM)
    if (r <= 7.4) S(x, 30, z, BTS)
    if (r <= 7.4 && r > 6.6) S(x, 31, z, 'minecraft:iron_bars')
  }
  // bandeaux et ouvertures, porte, echelle interieure jusqu'a la cuve puis au toit
  for (var x = 8; x <= 23; x++) for (var z = 8; z <= 23; z++) { var r = d(x, z); if (r <= 7.4 && r > 6.2) { S(x, 25, z, BTB); if ((x * 3 + z) % 11 == 0) S(x, 27, z, 'minecraft:iron_bars') } }
  PORTE(15, 1, 18, 'minecraft:iron_door', 'south', 'left', 'false'); F(15, 0, 19, 16, 0, 20, BTS)
  // echelle du fut accrochee au mur nord (15,13) ; dans la cuve, sur un poteau central
  F(14, 0, 14, 16, 0, 16, BTS); for (var y = 1; y <= 21; y++) S(15, y, 14, 'minecraft:ladder[facing=south]')
  S(15, 21, 15, BTM); for (var y = 22; y <= 29; y++) { S(15, y, 15, BTM); S(15, y, 16, 'minecraft:ladder[facing=south]') } S(15, 30, 16, AIR)
  for (var i = 0; i < 6; i++) SA(10 + Math.floor(R() * 12), 22, 10 + Math.floor(R() * 12), choix(['minecraft:cobweb', 'minecraft:moss_carpet']))
  // toit : antennes relais (sans paratonnerre)
  F(13, 31, 15, 13, 35, 15, 'minecraft:iron_bars'); F(18, 31, 16, 18, 34, 16, 'minecraft:iron_bars'); S(13, 35, 14, 'minecraft:iron_trapdoor[facing=south,half=bottom,open=true]'); S(18, 34, 17, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=true]')
  // local technique, pompes, grille d'enceinte (portail au nord)
  W(2, 2, 8, 7, 1, 4, BTM); F(2, 5, 2, 8, 5, 7, BTS); F(2, 0, 2, 8, 0, 7, BTS); PORTE(5, 1, 7, 'minecraft:iron_door', 'south', 'left', 'true')
  for (var x = 3; x <= 7; x += 2) { S(x, 1, 3, 'minecraft:barrel[facing=up,open=false]'); S(x, 2, 3, 'minecraft:iron_trapdoor[facing=south,half=bottom,open=false]') } S(5, 4, 5, 'minecraft:lantern[hanging=true]')
  F(9, 1, 5, 14, 1, 5, 'minecraft:iron_bars'); F(14, 1, 5, 14, 1, 9, 'minecraft:iron_bars')
  F(0, 0, 0, 31, 2, 0, 'minecraft:iron_bars'); F(0, 0, 31, 31, 2, 31, 'minecraft:iron_bars'); F(0, 0, 0, 0, 2, 31, 'minecraft:iron_bars'); F(31, 0, 0, 31, 2, 31, 'minecraft:iron_bars'); F(12, 0, 0, 19, 2, 0, AIR)
  btArbre(4, 26, 5); btArbre(27, 4, 5); btArbre(26, 27, 6)
}

// ---- vues de la serie 3 ----
function vuesBeton3() {
  vue('bt3_ensemble_sud', 0, 0, 64, 46, 120, 64, 8, 36, 3000)
  vue('bt3_foyer', 0, 0, 16, 12, 46, 16, 10, 14)
  vue('bt3_foyer_couloir', 0, 0, 26, 7.6, 13.5, 6, 7, 14)
  vue('bt3_commissariat', 32, 0, 16, 8, 44, 16, 4, 14)
  vue('bt3_commissariat_cellules', 32, 0, 19, 2.6, 12.5, 12, 2, 9)
  vue('bt3_supermarche', 64, 0, 16, 8, 44, 16, 3, 14)
  vue('bt3_supermarche_rayons', 64, 0, 15.5, 3.5, 19, 15.5, 1, 6)
  vue('bt3_commerces', 96, 0, 16, 10, 46, 16, 6, 14)
  vue('bt3_commerces_laverie', 96, 0, 9.5, 2.6, 20, 5, 2, 8)
  vue('bt3_pompiers', 0, 48, 12, 9, -12, 14, 5, 10)
  vue('bt3_pompiers_remise', 0, 48, 11.5, 3, 2, 11.5, 2, 18)
  vue('bt3_mairie_annexe', 32, 48, 16, 10, -12, 16, 7, 12)
  vue('bt3_salle_mariages', 32, 48, 15.5, 9, 16, 15.5, 8, 3)
  vue('bt3_cinema', 64, 48, 16, 8, -12, 16, 5, 10)
  vue('bt3_cinema_salle', 64, 48, 15.5, 4.5, 15, 15.5, 4, 26)
  vue('bt3_chateau_eau', 96, 48, 16, 18, -16, 16, 18, 16)
  vue('bt3_chateau_eau_pied', 96, 48, 6, 3, 13, 15, 14, 16)
}
var QFIN_BT3 = function () {
  HB2 = true; FIN = true; THM = THM_BT
  var rb = ['white', 'light_gray', 'orange', 'yellow', 'brown', 'light_blue']
  HM = {}; btRue(); finAncrage()
  lot(QF(btFoyer, null, rb), 0, 0, 999, 4611, 32, 26); lot(QF(btCommissariat, null, ['white']), 32, 0, 999, 4621, 32, 14); lot(QF(btSupermarche, null, null), 64, 0, 999, 4631, 32, 12); lot(QF(btBoutiques, null, rb), 96, 0, 999, 4641, 32, 22)
  lot(QF(btPompiers, null, ['white']), 0, 48, 999, 4651, 32, 26); lot(QF(btMairieAnnexe, null, ['white']), 32, 48, 999, 4661, 32, 16); lot(QF(btCinema, null, null), 64, 48, 999, 4671, 32, 13); lot(QF(btChateauEau, null, null), 96, 48, 999, 4681, 32, 37)
  vlog('FIN volets ' + FIN_NV + ' rideaux ' + FIN_NR + ' paves ' + PAVE_NB + ' retraits ancrage ' + ANC_NB)
  HB2 = false; FIN = false; THM = null; HM = {}
}
