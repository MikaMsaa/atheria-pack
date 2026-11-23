// ================= QUARTIER DE VERRE, SERIE 3 : studio de television, creche, salle de sport, laboratoire, musee d'art contemporain, poste et centre de tri, salle de concert, jardinerie =================
var V3COL = ['yellow', 'light_blue', 'lime', 'orange']
var V3POTS = ['minecraft:potted_fern', 'minecraft:potted_red_tulip', 'minecraft:potted_cactus', 'minecraft:potted_azure_bluet', 'minecraft:potted_dead_bush', 'minecraft:potted_oxeye_daisy', 'minecraft:flower_pot', 'handcrafted:terracotta_wide_pot']
// paillasse double (laboratoire) entre x1 et x2, tabourets de part et d'autre
function v3Paillasse(x1, x2, z, y) {
  var OBJ = ['minecraft:brewing_stand', 'supplementaries:jar', 'minecraft:flower_pot', 'handcrafted:stackable_book']
  for (var x = x1; x <= x2; x++) {
    vrCpt(x, y + 1, z, 'north', 'quartz_block'); vrCpt(x, y + 1, z + 1, 'south', 'quartz_block')
    if (H3(x, y, z) < 0.35) S(x, y + 2, z, choix(OBJ)); if (H3(x, y, z + 1) < 0.25) S(x, y + 2, z + 1, choix(OBJ))
    if ((x - x1) % 2 == 0) { vrCh(x, y + 1, z - 1, 'south', 'white'); vrCh(x, y + 1, z + 2, 'north', 'white') }
  }
}
// sorbonne : plan de travail, vitre, caisson, gaine jusqu'au plafond
function v3Hotte(x, y, z) { vrCpt(x, y + 1, z, 'west', 'quartz_block'); S(x, y + 2, z, GP); S(x, y + 3, z, 'minecraft:iron_block'); F(x, y + 4, z, x, y + 5, z, 'minecraft:iron_bars') }
function v3Parabole(x, y, z) { S(x, y, z, 'minecraft:iron_bars'); F(x - 1, y + 1, z - 1, x + 1, y + 1, z + 1, 'minecraft:white_concrete'); S(x, y + 2, z, 'minecraft:end_rod[facing=up]') }

// ================= STUDIO DE TELEVISION (R+2, plateau double hauteur, regie, redaction, pylone) =================
function vrStudioTV() {
  var NIV = 3, Y = k => 6 * k, CX = 4, CZ = 5
  btDalle(0, 0, 31, 31)
  for (var k = 0; k <= NIV; k++) { var y = Y(k); F(3, y, 4, 28, y, 27, k == 0 ? VRA : k == NIV ? VRS : V2PL); W(3, 4, 28, 27, y, y, VRNO) }
  F(15, 6, 5, 27, 6, 21, AIR); F(15, 0, 5, 27, 0, 21, VRC)
  for (var k = 0; k < NIV; k++) { var y = Y(k); vrMurRideau(3, 4, 28, 27, y + 1, y + 5, 3, k == 2 ? VRN : VRV, VRNO); vrCage(CX, CZ, y, VRA); PORTE(CX + 7, y + 1, CZ + 2, 'minecraft:iron_door', 'east', 'left', 'false') }
  // plateau : murs pleins (facades nord et est, cloisons ouest et sud)
  F(14, 1, 4, 28, 11, 4, VRNO); F(28, 1, 4, 28, 11, 22, VRNO); F(14, 1, 5, 14, 11, 21, VRNO); F(14, 1, 22, 27, 11, 22, VRNO)
  PORTE(14, 1, 16, 'minecraft:iron_door', 'west', 'left', 'false')
  F(15, 1, 5, 27, 7, 5, 'minecraft:light_blue_concrete'); F(15, 8, 5, 27, 8, 5, 'minecraft:blue_concrete')
  for (var x = 17; x <= 25; x++) vrCpt(x, 1, 8, 'south', 'quartz_block'); ;[18, 21, 24].forEach(x => vrCh(x, 1, 7, 'south', 'black')); S(19, 2, 8, 'handcrafted:stackable_book'); S(23, 2, 8, 'handcrafted:white_cup')
  for (var z = 11; z <= 13; z++) vrCanape(27, 1, z, 'west', 'red'); vrGueridon(25, 1, 12); S(27, 1, 15, choix(VRPOT))
  ;[[17, 15], [21, 17], [25, 15]].forEach(c => { S(c[0], 1, c[1], 'minecraft:iron_bars'); S(c[0], 2, c[1], 'minecraft:dispenser[facing=north,triggered=false]') })
  ;[7, 11, 15].forEach(z => { F(15, 10, z, 27, 10, z, 'minecraft:iron_bars'); S(15, 11, z, 'minecraft:chain[axis=y]'); S(27, 11, z, 'minecraft:chain[axis=y]'); [16, 20, 24].forEach(x => S(x, 9, z, 'minecraft:sea_lantern')); [18, 22, 26].forEach(x => S(x, 9, z, 'minecraft:lantern[hanging=true]')) })
  for (var x = 16; x <= 26; x += 3) [9, 13, 19].forEach(z => S(x, 11, z, VRT))
  F(16, 1, 19, 16, 1, 21, 'minecraft:black_carpet'); F(17, 1, 20, 24, 1, 20, 'minecraft:black_carpet')
  // rez : hall, accueil, mur d'ecrans ; loges au sud
  for (var x = 6; x <= 10; x++) vrCpt(x, 1, 20, 'south', 'quartz_block'); vrCh(8, 1, 19, 'south', 'black')
  for (var x = 5; x <= 8; x++) vrCanape(x, 1, 25, 'north', 'black'); vrGueridon(6, 1, 23)
  F(13, 2, 12, 13, 3, 16, 'minecraft:black_stained_glass'); ;[[4, 26], [12, 26], [4, 12]].forEach(p => S(p[0], 1, p[1], choix(VRPOT)))
  F(19, 1, 23, 19, 5, 26, VRB); F(24, 1, 23, 24, 5, 26, VRB); PORTE(19, 1, 24, 'minecraft:birch_door', 'east', 'left', 'false'); PORTE(24, 1, 24, 'minecraft:birch_door', 'east', 'left', 'false')
  ;[[15, 18], [20, 23], [25, 27]].forEach(l => { for (var x = l[0]; x <= l[1]; x++) { vrCpt(x, 1, 26, 'north', 'quartz_block'); if (x % 2) vrCh(x, 1, 25, 'south', 'red') } vrArm(l[0], 1, 23, 'south') })
  vrDebris(4, 4, 12, 13, 26, 1)
  // etage 1 : regie (vitrage sur le plateau) et bureaux ; etage 2 : redaction
  F(15, 7, 22, 26, 9, 22, 'minecraft:black_stained_glass_pane')
  for (var x = 15; x <= 26; x++) { vrBur(x, 7, 23, 'south'); S(x, 8, 23, 'minecraft:black_stained_glass_pane'); if (x % 2) vrCh(x, 7, 24, 'north', 'black') }
  for (var x = 15; x <= 26; x += 4) S(x, 7, 26, choix(VRPOT))
  v2Ilots(6, 5, 13, 10, 25, 'gray'); F(12, 7, 5, 13, 7, 21, 'minecraft:gray_carpet')
  v2Ilots(12, 13, 7, 27, 25, 'black'); F(14, 14, 5, 26, 15, 5, 'minecraft:black_stained_glass')
  for (var k = 0; k < NIV; k++) { vrPlaf(Y(k), 4, 6, 27, 26, 5); vrVolees(CX, CZ, Y(k), VRA, 'polished_andesite') }
  // toiture : paraboles, pylone a treillis
  var yt = Y(NIV)
  W(3, 4, 28, 27, yt + 1, yt + 1, VRNO); v2Edicule(CX, CZ, yt)
  v3Parabole(8, yt + 1, 20); v3Parabole(12, yt + 1, 24); v3Parabole(26, yt + 1, 24)
  ;[[20, 10], [23, 10], [20, 13], [23, 13]].forEach(p => F(p[0], yt + 1, p[1], p[0], yt + 11, p[1], 'minecraft:iron_bars'))
  ;[4, 8].forEach(d => W(20, 10, 23, 13, yt + d, yt + d, 'minecraft:iron_bars'))
  F(20, yt + 12, 10, 23, yt + 12, 13, 'minecraft:iron_block'); F(21, yt + 13, 11, 21, yt + 16, 11, 'minecraft:iron_bars'); S(21, yt + 17, 11, 'minecraft:lightning_rod[facing=up]')
  // entree, car-regie
  PORTE(7, 1, 27, 'mcwdoors:dark_oak_glass_door', 'south', 'left', 'false'); PORTE(8, 1, 27, 'mcwdoors:dark_oak_glass_door', 'south', 'right', 'true')
  F(16, 0, 29, 21, 2, 30, VRB); F(21, 1, 29, 21, 2, 30, 'minecraft:black_stained_glass'); F(16, 3, 29, 18, 3, 30, 'minecraft:light_gray_concrete'); S(17, 4, 29, 'minecraft:iron_bars'); F(16, 5, 28, 18, 5, 30, 'minecraft:white_concrete')
  ;[17, 20].forEach(x => { S(x, 0, 28, 'minecraft:polished_blackstone_button[face=wall,facing=north]'); S(x, 0, 31, 'minecraft:polished_blackstone_button[face=wall,facing=south]') })
  btLampe(2, 29, 'east'); btLampe(29, 29, 'west'); bgVoiture(4, 0, 'x', 'gray', 0)
}

// ================= CRECHE (plain-pied colore, dortoir, salle d'eveil, jardin clos) =================
function vrCreche() {
  btDalle(0, 0, 31, 31)
  F(4, 0, 5, 27, 0, 19, 'minecraft:smooth_stone'); vrMurRideau(4, 5, 27, 19, 1, 4, 3, VRV, VRB)
  for (var x = 4; x <= 27; x++) if ((x - 4) % 3 == 0) { var c = 'minecraft:' + V3COL[((x - 4) / 3) % 4] + '_concrete'; F(x, 1, 5, x, 4, 5, c); F(x, 1, 19, x, 4, 19, c) }
  for (var z = 5; z <= 19; z++) if ((z - 5) % 3 == 0) { var c = 'minecraft:' + V3COL[((z - 5) / 3) % 4] + '_concrete'; F(4, 1, z, 4, 4, z, c); F(27, 1, z, 27, 4, z, c) }
  F(4, 5, 5, 27, 5, 19, VRS); W(4, 5, 27, 19, 5, 5, 'minecraft:light_blue_concrete'); W(4, 5, 27, 19, 6, 6, VRB)
  // dortoir (ouest) et salle d'eveil (est)
  F(15, 1, 6, 15, 4, 18, VRB); PORTE(15, 1, 12, 'minecraft:birch_door', 'east', 'left', 'false')
  var n = 0; for (var z = 8; z <= 16; z += 4) for (var x = 6; x <= 14; x += 2) vrLitS(x, 1, z, V3COL[n++ % 4], 'north')
  for (var x = 17; x <= 25; x++) for (var z = 7; z <= 12; z++) S(x, 1, z, 'minecraft:' + V3COL[(x + z) % 4] + '_carpet')
  for (var z = 7; z <= 12; z += 2) vrEtag(26, 1, z, 'west'); S(26, 2, 7, 'minecraft:yellow_wool'); S(26, 2, 11, 'minecraft:light_blue_wool')
  ;[[19, 9], [23, 10]].forEach(p => S(p[0], 2, p[1], 'minecraft:note_block'))
  for (var x = 18; x <= 20; x++) { vrTab(x, 1, 15, 'yellow'); vrCh(x, 1, 14, 'south', 'red'); vrCh(x, 1, 16, 'north', 'blue') }
  for (var x = 23; x <= 26; x++) vrCpt(x, 1, 18, 'north', 'quartz_block'); S(22, 1, 18, 'farmersdelight:stove[facing=north,lit=false]'); S(24, 2, 18, choix(VAISS).replace('{I}', 'north'))
  vrPlaf(-1, 6, 7, 26, 18, 4); vrDebris(3, 16, 13, 26, 17, 1)
  PORTE(20, 1, 19, 'mcwdoors:dark_oak_glass_door', 'south', 'left', 'false')
  for (var x = 6; x <= 26; x++) if (x % 2 == 0) S(x, 6, 12, 'minecraft:daylight_detector[inverted=false,power=0]')
  // jardin clos : bac a sable, balancoires, potager, arbre
  W(2, 4, 29, 30, 0, 0, 'mcwfences:spruce_picket_fence'); F(19, 0, 30, 20, 0, 30, AIR)
  for (var x = 3; x <= 28; x++) for (var z = 20; z <= 29; z++) S(x, -1, z, x == 19 || x == 20 ? 'minecraft:smooth_stone' : 'minecraft:grass_block')
  W(5, 23, 10, 27, 0, 0, 'minecraft:oak_slab[type=bottom]'); F(6, -1, 24, 9, -1, 26, 'minecraft:sand'); S(7, 0, 25, 'minecraft:red_concrete_powder')
  F(12, 0, 24, 12, 3, 24, 'minecraft:oak_fence'); F(16, 0, 24, 16, 3, 24, 'minecraft:oak_fence'); F(12, 4, 24, 16, 4, 24, 'minecraft:oak_log[axis=x]')
  ;[13, 15].forEach(x => { F(x, 2, 24, x, 3, 24, 'minecraft:chain[axis=y]'); S(x, 1, 24, 'minecraft:oak_slab[type=top]') })
  for (var x = 23; x <= 27; x++) for (var z = 22; z <= 23; z++) { S(x, -1, z, 'minecraft:rooted_dirt'); if ((x + z) % 2) SA(x, 0, z, 'minecraft:sweet_berry_bush[age=1]') }
  btArbre(26, 27, 5); for (var x = 6; x <= 14; x += 4) if (H3(x, 0, 21) < 0.6) SA(x, 0, 21, 'minecraft:short_grass')
}

// ================= SALLE DE SPORT (R+1, plateau musculation, cardio, vestiaires, cours collectifs, sauna, piste en toiture) =================
function vrFitness() {
  var NIV = 2, Y = k => 6 * k, CX = 4, CZ = 5
  btDalle(0, 0, 31, 31)
  for (var k = 0; k <= NIV; k++) { var y = Y(k); F(3, y, 4, 28, y, 27, k == 0 ? VRA : k == NIV ? VRS : V2PL); W(3, 4, 28, 27, y, y, VRNO) }
  for (var k = 0; k < NIV; k++) { var y = Y(k); vrMurRideau(3, 4, 28, 27, y + 1, y + 5, 4, VRV, 'minecraft:red_concrete'); vrCage(CX, CZ, y, VRA); PORTE(CX + 7, y + 1, CZ + 2, 'minecraft:iron_door', 'east', 'left', 'false') }
  // musculation : sol noir, miroir, porte-disques, bancs, cage a squat
  F(13, 0, 5, 26, 0, 18, VRNO); F(13, 1, 5, 26, 4, 5, 'minecraft:light_gray_stained_glass')
  for (var x = 14; x <= 23; x++) { S(x, 1, 6, 'minecraft:iron_block'); S(x, 2, 6, 'minecraft:heavy_weighted_pressure_plate') }
  ;[[14, 10], [18, 10], [14, 14], [18, 14]].forEach(b => { F(b[0], 1, b[1], b[0] + 1, 1, b[1], 'minecraft:polished_blackstone_slab[type=bottom]'); F(b[0], 1, b[1] - 1, b[0], 2, b[1] - 1, 'minecraft:iron_bars'); F(b[0], 1, b[1] + 1, b[0], 2, b[1] + 1, 'minecraft:iron_bars'); S(b[0], 2, b[1], 'minecraft:chain[axis=z]') })
  ;[[22, 10], [25, 10], [22, 13], [25, 13]].forEach(p => F(p[0], 1, p[1], p[0], 4, p[1], 'minecraft:iron_bars')); F(22, 5, 10, 25, 5, 13, 'minecraft:iron_bars'); F(23, 3, 10, 24, 3, 10, 'minecraft:chain[axis=x]')
  // cardio le long du vitrage est
  for (var z = 7; z <= 19; z += 2) { S(26, 1, z, 'minecraft:polished_blackstone_slab[type=bottom]'); S(27, 1, z, VRNO); S(27, 2, z, 'minecraft:black_stained_glass_pane') }
  // accueil, tourniquets, vestiaires
  for (var x = 12; x <= 19; x++) vrCpt(x, 1, 22, 'south', 'quartz_block'); vrCh(15, 1, 21, 'south', 'black'); S(13, 2, 22, 'supplementaries:jar')
  ;[13, 15, 17, 19].forEach(x => S(x, 1, 20, 'minecraft:iron_bars'))
  F(4, 1, 12, 11, 5, 12, VRB); F(4, 1, 21, 11, 5, 21, VRB); F(12, 1, 13, 12, 5, 20, VRB); PORTE(12, 1, 16, 'minecraft:birch_door', 'east', 'left', 'false')
  for (var z = 13; z <= 20; z++) vrArm(4, 1, z, 'east'); F(7, 1, 14, 8, 1, 19, 'minecraft:spruce_slab[type=bottom]'); S(11, 1, 13, 'minecraft:water_cauldron[level=1]'); S(11, 1, 20, 'minecraft:cauldron')
  ;[[4, 26], [27, 26], [11, 25]].forEach(p => S(p[0], 1, p[1], choix(VRPOT))); vrDebris(5, 13, 7, 25, 19, 1)
  PORTE(15, 1, 27, 'mcwdoors:dark_oak_glass_door', 'south', 'left', 'false'); PORTE(16, 1, 27, 'mcwdoors:dark_oak_glass_door', 'south', 'right', 'true')
  // etage : salle de cours (tapis, miroir), sauna, bar
  var y = 6
  F(13, y + 1, 5, 27, y + 4, 5, 'minecraft:light_gray_stained_glass'); F(13, y + 1, 17, 27, y + 5, 17, GP); PORTE(20, y + 1, 17, 'minecraft:iron_door', 'south', 'left', 'false')
  for (var x = 14; x <= 26; x += 2) for (var z = 8; z <= 14; z += 3) { S(x, y + 1, z, 'minecraft:purple_carpet'); S(x, y + 1, z + 1, 'minecraft:purple_carpet') }
  W(4, 12, 11, 18, y + 1, y + 5, 'minecraft:spruce_planks'); F(5, y + 1, 13, 10, y + 5, 17, AIR); PORTE(11, y + 1, 15, 'minecraft:spruce_door', 'east', 'left', 'false')
  F(5, y + 1, 13, 5, y + 1, 17, 'minecraft:spruce_slab[type=bottom]'); F(6, y + 1, 13, 6, y + 1, 17, 'minecraft:spruce_planks'); F(6, y + 2, 13, 6, y + 2, 17, 'minecraft:spruce_slab[type=bottom]'); S(9, y + 1, 15, 'minecraft:smoker[facing=west,lit=false]'); S(9, y + 2, 15, 'minecraft:cobblestone_slab[type=bottom]')
  for (var x = 15; x <= 25; x += 3) { vrTab(x, y + 1, 23, 'white'); vrCh(x - 1, y + 1, 23, 'east'); vrCh(x + 1, y + 1, 23, 'west') }
  for (var x = 16; x <= 22; x++) vrCpt(x, y + 1, 20, 'south', 'quartz_block'); S(17, y + 2, 20, 'supplementaries:jar'); S(20, y + 2, 20, 'handcrafted:white_cup')
  for (var k = 0; k < NIV; k++) { vrPlaf(Y(k), 4, 6, 27, 26, 5); vrVolees(CX, CZ, Y(k), VRA, 'polished_andesite') }
  // toiture : piste de course, edicule, groupe froid
  var yt = Y(NIV)
  for (var x = 13; x <= 27; x++) for (var z = 6; z <= 26; z++) if (x <= 14 || x >= 26 || z <= 7 || z >= 25) S(x, yt, z, (x == 13 || x == 27 || z == 6 || z == 26) ? 'minecraft:red_terracotta' : 'minecraft:red_concrete')
  W(3, 4, 28, 27, yt + 1, yt + 1, VRNO); F(3, yt + 2, 4, 28, yt + 2, 4, 'minecraft:iron_bars'); v2Edicule(CX, CZ, yt)
  F(18, yt + 1, 12, 22, yt + 2, 16, 'minecraft:iron_block'); F(18, yt + 3, 12, 22, yt + 3, 16, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false]')
  btLampe(2, 29, 'east'); btLampe(29, 29, 'west'); for (var x = 18; x <= 26; x += 2) S(x, 0, 30, V2GR)
}

// ================= LABORATOIRE (R+2, paillasses, sorbonnes, chambre froide, bureaux) =================
function vrLabo() {
  var NIV = 3, Y = k => 6 * k, CX = 4, CZ = 6
  btDalle(0, 0, 31, 31)
  for (var k = 0; k <= NIV; k++) { var y = Y(k); F(3, y, 5, 28, y, 27, k == 0 ? VRA : k == NIV ? VRS : V2PL); W(3, 5, 28, 27, y, y, VRB) }
  for (var k = 0; k < NIV; k++) {
    var y = Y(k)
    W(3, 5, 28, 27, y + 1, y + 1, VRB); W(3, 5, 28, 27, y + 5, y + 5, VRB); vrMurRideau(3, 5, 28, 27, y + 2, y + 4, 3, VRN, VRB)
    vrCage(CX, CZ, y, VRA); PORTE(CX + 7, y + 1, CZ + 2, 'minecraft:iron_door', 'east', 'left', 'false')
  }
  // rez : hall et sas, chambre froide, reserve, laboratoire d'analyses
  for (var x = 6; x <= 10; x++) vrCpt(x, 1, 20, 'south', 'quartz_block'); vrCh(8, 1, 19, 'south'); ;[6, 8, 10].forEach(x => S(x, 1, 23, 'minecraft:iron_bars'))
  for (var z = 13; z <= 17; z++) vrCanape(4, 1, z, 'east', 'light_gray'); S(4, 1, 26, choix(VRPOT))
  F(13, 1, 13, 13, 5, 26, VRB); PORTE(13, 1, 24, 'minecraft:iron_door', 'east', 'left', 'false')
  W(15, 6, 22, 12, 1, 5, VRB); F(16, 1, 7, 21, 5, 11, AIR); F(16, 0, 7, 21, 0, 11, 'minecraft:packed_ice'); PORTE(18, 1, 12, 'minecraft:iron_door', 'south', 'left', 'false')
  for (var x = 16; x <= 21; x++) { vrEtag(x, 1, 7, 'south'); vrEtag(x, 2, 7, 'south'); if (x % 2) S(x, 3, 7, 'supplementaries:jar') } S(16, 1, 11, 'minecraft:barrel[facing=up,open=false]')
  for (var z = 6; z <= 11; z++) S(27, 1, z, 'minecraft:barrel[facing=west,open=' + (H3(27, 1, z) < 0.3) + ']'); S(24, 1, 8, 'supplementaries:sack')
  v3Paillasse(15, 24, 17, 0); v3Paillasse(15, 24, 22, 0); for (var z = 15; z <= 25; z += 2) v3Hotte(27, 0, z)
  // etage 1 : laboratoires ; etage 2 : bureaux et salle de reunion
  var y = 6
  ;[9, 14, 19, 24].forEach(z => v3Paillasse(14, 24, z, y)); for (var z = 8; z <= 25; z += 2) v3Hotte(27, y, z)
  for (var z = 14; z <= 24; z += 5) v3Paillasse(5, 10, z, y)
  F(12, y + 1, 12, 12, y + 5, 26, GP); PORTE(12, y + 1, 13, 'minecraft:iron_door', 'east', 'left', 'false')
  v2Ilots(12, 14, 8, 26, 25, 'gray')
  for (var x = 6; x <= 10; x++) { vrTab(x, 13, 18, 'white'); vrCh(x, 13, 17, 'south'); vrCh(x, 13, 19, 'north') } F(4, 13, 14, 11, 17, 14, GP); PORTE(9, 13, 14, 'minecraft:iron_door', 'north', 'left', 'false')
  for (var k = 0; k < NIV; k++) { vrPlaf(Y(k), 4, 7, 27, 26, 4); vrVolees(CX, CZ, Y(k), VRA, 'polished_andesite') }
  vrDebris(4, 15, 14, 26, 26, 1); vrDebris(6, 14, 8, 26, 26, 7)
  // toiture : extracteurs, gaines, mat
  var yt = Y(NIV)
  W(3, 5, 28, 27, yt + 1, yt + 1, VRB); v2Edicule(CX, CZ, yt)
  for (var z = 9; z <= 25; z += 4) { F(25, yt + 1, z, 26, yt + 2, z + 1, 'minecraft:iron_block'); F(26, yt + 3, z, 26, yt + 5, z, 'minecraft:iron_bars') }
  F(14, yt + 1, 14, 20, yt + 2, 19, 'minecraft:light_gray_concrete'); F(14, yt + 3, 14, 20, yt + 3, 19, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false]')
  F(8, yt + 6, 8, 8, yt + 9, 8, 'minecraft:iron_bars'); S(8, yt + 10, 8, 'minecraft:lightning_rod[facing=up]')
  // entree, parvis
  PORTE(15, 1, 27, 'mcwdoors:dark_oak_glass_door', 'south', 'left', 'false'); PORTE(16, 1, 27, 'mcwdoors:dark_oak_glass_door', 'south', 'right', 'false')
  F(13, 5, 28, 18, 5, 29, 'minecraft:smooth_stone_slab[type=bottom]')
  btArbre(5, 29, 5); btArbre(26, 29, 5); for (var x = 20; x <= 24; x += 2) S(x, 0, 30, V2GR); bgVoiture(4, 0, 'x', 'white', 0); bgVoiture(22, 0, 'x', 'light_gray', 1)
}

// ================= MUSEE D'ART CONTEMPORAIN (atrium vitre, salles blanches a sheds, sculptures) ; entree au nord =================
function vrMusee() {
  btDalle(0, 0, 31, 31)
  // grande salle d'exposition
  F(2, 0, 13, 29, 0, 28, VRQ); W(2, 13, 29, 28, 1, 7, VRB); F(2, 8, 13, 29, 8, 28, VRS); W(2, 13, 29, 28, 9, 9, VRB)
  for (var z = 16; z <= 26; z += 5) F(4, 8, z, 27, 8, z + 1, 'minecraft:glass')
  F(11, 1, 14, 11, 6, 23, VRB); F(20, 1, 18, 20, 6, 27, VRB)
  // oeuvres : tableaux (cadres sur les murs), socles, colonne de verres, cube suspendu
  ;[[3, 16, 'x', 'blue'], [3, 22, 'x', 'orange'], [28, 15, 'x', 'red'], [10, 18, 'x', 'yellow'], [21, 22, 'x', 'cyan'], [14, 27, 'z', 'magenta'], [24, 27, 'z', 'lime']].forEach(t => {
    var x = t[0], z = t[1], c = 'minecraft:' + t[3] + '_concrete'
    if (t[2] == 'x') { F(x, 2, z, x, 5, z + 3, 'minecraft:dark_oak_planks'); F(x, 3, z + 1, x, 4, z + 2, c) } else { F(x, 2, z, x + 3, 5, z, 'minecraft:dark_oak_planks'); F(x + 1, 3, z, x + 2, 4, z, c) }
  })
  ;[[6, 17, 'minecraft:decorated_pot'], [6, 21, 'supplementaries:globe_sepia[facing=north]'], [16, 15, 'minecraft:amethyst_cluster[facing=up]'], [25, 25, 'minecraft:end_rod[facing=up]']].forEach(o => { S(o[0], 1, o[1], VRQ); S(o[0], 2, o[1], o[2]) })
  var VV = ['red', 'orange', 'yellow', 'lime', 'light_blue', 'purple']; for (var k = 0; k < 6; k++) F(15, 1 + k, 22, 16, 1 + k, 23, 'minecraft:' + VV[k] + '_stained_glass')
  F(24, 4, 15, 26, 6, 17, 'minecraft:red_concrete'); S(25, 7, 16, 'minecraft:chain[axis=y]')
  ;[[7, 25], [24, 20]].forEach(b => { S(b[0], 1, b[1], btSt('smooth_quartz', 'north')); S(b[0] + 1, 1, b[1], btSt('smooth_quartz', 'north')) })
  vrPlaf(2, 3, 14, 28, 27, 4)
  // atrium vitre (accueil, mobile suspendu)
  F(9, 0, 3, 22, 0, 12, VRQ); vrMurRideau(9, 3, 22, 12, 1, 11, 3, 'minecraft:glass_pane', VRB)
  for (var x = 9; x <= 22; x++) for (var z = 3; z <= 12; z++) S(x, 12, z, x == 9 || x == 22 || z == 3 || z == 12 || (x - 9) % 4 == 0 ? VRB : 'minecraft:glass')
  F(13, 1, 12, 18, 4, 13, AIR)
  for (var x = 12; x <= 17; x++) vrCpt(x, 1, 9, 'north', 'quartz_block'); vrCh(14, 1, 10, 'north'); S(16, 2, 9, 'handcrafted:stackable_book')
  ;[13, 17].forEach(x => F(x, 8, 6, x, 11, 6, 'minecraft:chain[axis=y]')); F(12, 7, 5, 18, 7, 7, 'minecraft:yellow_stained_glass'); F(14, 7, 6, 16, 7, 6, 'minecraft:light_blue_stained_glass')
  for (var z = 4; z <= 8; z++) vrEtag(10, 1, z, 'east'); S(21, 1, 4, choix(VRPOT)); S(21, 1, 11, choix(VRPOT))
  PORTE(15, 1, 3, 'mcwdoors:dark_oak_glass_door', 'north', 'left', 'false'); PORTE(16, 1, 3, 'mcwdoors:dark_oak_glass_door', 'north', 'right', 'false')
  // ailes : cafe a l'ouest, vestiaire et boutique a l'est
  W(2, 3, 8, 12, 1, 6, VRB); F(2, 0, 3, 8, 0, 12, VRQ); F(2, 7, 3, 8, 7, 12, VRS); F(3, 2, 3, 7, 4, 3, VRV); F(8, 1, 7, 9, 3, 8, AIR)
  for (var x = 4; x <= 6; x += 2) for (var z = 6; z <= 10; z += 4) { vrTab(x, 1, z, 'white'); vrCh(x, 1, z - 1, 'south'); vrCh(x, 1, z + 1, 'north') } for (var z = 5; z <= 9; z++) vrCpt(7, 1, z, 'west', 'quartz_block')
  W(23, 3, 29, 12, 1, 6, VRB); F(23, 0, 3, 29, 0, 12, VRQ); F(23, 7, 3, 29, 7, 12, VRS); F(22, 1, 7, 23, 3, 8, AIR)
  for (var z = 4; z <= 11; z++) { if (z == 7 || z == 8) continue; vrArm(28, 1, z, 'west') } for (var x = 24; x <= 27; x++) vrEtag(x, 1, 11, 'north')
  vrPlaf(1, 3, 4, 28, 11, 4); vrDebris(4, 3, 14, 28, 27, 1)
  // parvis : deux sculptures
  F(3, 0, 0, 3, 6, 0, 'minecraft:red_concrete'); F(3, 6, 0, 6, 6, 0, 'minecraft:red_concrete'); F(6, 3, 0, 6, 5, 0, 'minecraft:red_concrete'); F(6, 3, 1, 6, 3, 2, 'minecraft:red_concrete')
  F(26, 0, 1, 26, 4, 1, 'minecraft:iron_block'); F(27, 4, 1, 28, 4, 1, 'minecraft:iron_block'); F(28, 5, 1, 28, 7, 1, 'minecraft:iron_block')
  btLampe(1, 2, 'east'); btLampe(30, 2, 'west')
}

// ================= BUREAU DE POSTE ET CENTRE DE TRI (guichets, boites postales, tapis de tri, quais) ; entree au nord =================
function vrPoste() {
  btDalle(0, 0, 31, 31)
  // bureau (nord)
  F(3, 0, 3, 28, 0, 12, VRA); vrMurRideau(3, 3, 28, 12, 1, 5, 4, VRV, 'minecraft:yellow_concrete'); F(3, 6, 3, 28, 6, 12, VRS); W(3, 3, 28, 12, 7, 7, 'minecraft:blue_concrete')
  F(3, 1, 12, 28, 5, 12, VRB); PORTE(24, 1, 12, 'minecraft:iron_door', 'south', 'left', 'false')
  for (var x = 6; x <= 18; x++) { vrCpt(x, 1, 9, 'north', 'quartz_block'); if ((x - 6) % 3 != 1) F(x, 2, 9, x, 3, 9, GP) }
  for (var x = 7; x <= 18; x += 3) vrCh(x, 1, 10, 'north', 'blue'); S(10, 2, 9, 'minecraft:heavy_weighted_pressure_plate')
  for (var z = 4; z <= 8; z++) for (var y = 1; y <= 3; y++) S(27, y, z, 'minecraft:barrel[facing=west,open=' + (H3(27, y, z) < 0.25) + ']')
  F(8, 1, 6, 16, 1, 6, V2GR); S(4, 1, 5, VRB); S(4, 2, 5, 'minecraft:dropper[facing=east,triggered=false]'); S(4, 3, 5, 'minecraft:yellow_concrete')
  for (var x = 21; x <= 24; x++) vrEtag(x, 1, 11, 'north'); vrPlaf(0, 4, 4, 27, 11, 4); vrDebris(4, 4, 4, 26, 8, 1)
  PORTE(14, 1, 3, 'mcwdoors:dark_oak_glass_door', 'north', 'left', 'false'); PORTE(15, 1, 3, 'mcwdoors:dark_oak_glass_door', 'north', 'right', 'true')
  // centre de tri (sud) : casiers, tapis, palettes, quais
  F(3, 0, 13, 28, 0, 28, VRC); W(3, 13, 28, 28, 1, 8, VRC); F(3, 9, 13, 28, 9, 28, VRS); W(3, 13, 28, 28, 10, 10, VRC)
  for (var x = 4; x <= 27; x++) if (x % 3) F(x, 6, 28, x, 7, 28, GP); for (var z = 15; z <= 27; z++) if (z % 3) { F(3, 6, z, 3, 7, z, GP); F(28, 6, z, 28, 7, z, GP) }
  for (var x = 5; x <= 26; x++) for (var y = 1; y <= 3; y++) S(x, y, 14, 'minecraft:barrel[facing=south,open=' + (H3(x, y, 14) < 0.3) + ']')
  ;[18, 22].forEach(z => { F(6, 1, z, 24, 1, z, 'minecraft:polished_blackstone_slab[type=top]'); F(6, 1, z + 1, 24, 1, z + 1, 'minecraft:iron_bars'); for (var x = 7; x <= 23; x += 3) if (H3(x, 2, z) < 0.6) S(x, 2, z, choix(['supplementaries:sack', 'minecraft:barrel[facing=up,open=false]'])) })
  ;[[5, 25], [24, 25]].forEach(p => { F(p[0], 1, p[1], p[0] + 1, 1, p[1] + 1, 'minecraft:oak_slab[type=bottom]') }); S(5, 2, 25, 'supplementaries:sack'); S(25, 2, 26, 'minecraft:barrel[facing=up,open=false]')
  F(12, 1, 25, 13, 2, 26, 'minecraft:iron_bars'); F(17, 1, 25, 18, 2, 26, 'minecraft:iron_bars')
  ;[8, 19].forEach(x => F(x, 1, 28, x + 3, 4, 28, AIR))
  vrPlaf(3, 4, 15, 27, 27, 4)
  // fourgonnettes a quai, boite aux lettres, arceaux
  ;[8, 19].forEach(x => { F(x, 0, 29, x + 4, 2, 30, 'minecraft:yellow_concrete'); F(x + 4, 1, 29, x + 4, 2, 30, 'minecraft:black_stained_glass'); ;[x + 1, x + 3].forEach(u => S(u, 0, 31, 'minecraft:polished_blackstone_button[face=wall,facing=south]')) })
  S(26, 0, 1, 'minecraft:yellow_concrete'); S(26, 1, 1, 'minecraft:yellow_concrete'); for (var x = 4; x <= 10; x += 2) S(x, 0, 1, V2GR)
  btLampe(1, 1, 'east'); bgVoiture(18, 0, 'x', 'gray', 1)
}

// ================= SALLE DE CONCERT (hall-bar, salle avec scene, balcons, regie son) ; entree au nord =================
function vrConcert() {
  btDalle(0, 0, 31, 31)
  F(2, 0, 3, 29, 0, 9, VRA); F(2, 0, 10, 29, 0, 28, VRC); W(2, 3, 29, 28, 1, 10, VRNO); F(2, 11, 3, 29, 11, 28, VRS); W(2, 3, 29, 28, 12, 12, VRNO); W(2, 3, 29, 28, 9, 9, 'minecraft:purple_concrete')
  for (var x = 3; x <= 28; x++) F(x, 1, 3, x, 8, 3, (x - 3) % 3 == 0 ? VRNO : vrVitre(VRV))
  // hall : bar, vestiaire, portes vers la salle
  F(3, 1, 10, 28, 10, 10, VRNO); F(8, 1, 10, 9, 3, 10, AIR); F(22, 1, 10, 23, 3, 10, AIR)
  for (var x = 5; x <= 12; x++) { vrCpt(x, 1, 7, 'north', 'quartz_block'); if (x % 2) vrCh(x, 1, 6, 'south', 'black') } for (var x = 5; x <= 12; x++) vrEtag(x, 1, 9, 'north'); S(6, 2, 7, 'supplementaries:jar'); S(10, 2, 7, 'handcrafted:white_cup')
  for (var x = 19; x <= 26; x++) { vrCpt(x, 1, 7, 'north', 'smooth_stone'); vrArm(x, 1, 9, 'north') }
  PORTE(14, 1, 3, 'mcwdoors:dark_oak_glass_door', 'north', 'left', 'false'); PORTE(15, 1, 3, 'mcwdoors:dark_oak_glass_door', 'north', 'right', 'true'); PORTE(16, 1, 3, 'mcwdoors:dark_oak_glass_door', 'north', 'left', 'true'); PORTE(17, 1, 3, 'mcwdoors:dark_oak_glass_door', 'north', 'right', 'false')
  // scene, enceintes, batterie, pont lumiere
  F(7, 1, 22, 24, 1, 27, 'minecraft:dark_oak_planks'); F(7, 2, 27, 24, 8, 27, 'minecraft:black_wool')
  ;[7, 23].forEach(x => { F(x, 2, 22, x + 1, 5, 23, VRNO); F(x, 3, 22, x + 1, 3, 22, 'minecraft:iron_bars') })
  S(15, 2, 25, 'minecraft:note_block'); S(16, 2, 25, 'minecraft:note_block'); S(16, 2, 26, 'minecraft:note_block'); S(10, 2, 26, VRNO); S(21, 2, 26, VRNO)
  ;[12, 19].forEach(x => { S(x, 2, 23, 'minecraft:iron_bars'); S(x, 3, 23, 'minecraft:end_rod[facing=up]') })
  W(7, 22, 24, 26, 9, 9, 'minecraft:iron_bars'); ;[[7, 22], [24, 22], [7, 26], [24, 26]].forEach(p => S(p[0], 10, p[1], 'minecraft:chain[axis=y]'))
  ;[10, 14, 18, 22].forEach(x => S(x, 8, 22, 'minecraft:sea_lantern')); [12, 20].forEach(x => S(x, 8, 26, 'minecraft:lantern[hanging=true]'))
  // fosse : barrieres, regie son
  F(8, 1, 20, 23, 1, 20, V2GR); F(14, 1, 13, 17, 1, 14, 'minecraft:polished_blackstone'); W(13, 12, 18, 15, 1, 1, V2GR); S(18, 1, 13, AIR); S(15, 2, 13, 'minecraft:black_stained_glass_pane'); S(16, 2, 13, 'minecraft:black_stained_glass_pane')
  // balcons lateraux (gradins), escaliers depuis la fosse
  ;[[3, 6, 'west', 6, 3], [25, 28, 'east', 25, 27]].forEach(b => {
    F(b[0], 4, 11, b[1], 4, 19, VRNO); F(b[3], 5, 11, b[3], 5, 19, GP)
    for (var z = 11; z <= 18; z++) { var s1 = b[2] == 'west' ? 4 : 26, s2 = b[2] == 'west' ? 5 : 27; S(s1, 5, z, btSt('dark_oak', b[2])); S(s2, 5, z, btSt('dark_oak', b[2])) }
    for (var i = 0; i < 4; i++) { var z = 23 - i; F(b[4], i + 1, z, b[4] + 1, i + 1, z, btSt('polished_blackstone', 'north')); if (i) F(b[4], 1, z, b[4] + 1, i, z, VRNO) }
  })
  for (var x = 9; x <= 22; x += 6) for (var z = 5; z <= 19; z += 7) S(x, 10, z, 'minecraft:lantern[hanging=true]'); vrPlaf(5, 9, 12, 22, 18, 6)
  PORTE(2, 1, 16, 'minecraft:iron_door', 'west', 'left', 'false'); PORTE(29, 1, 16, 'minecraft:iron_door', 'east', 'left', 'false')
  vrDebris(6, 8, 11, 23, 19, 1)
  // marquise, barrieres de file d'attente
  F(12, 5, 0, 19, 5, 2, 'minecraft:smooth_stone_slab[type=bottom]'); F(12, 0, 0, 12, 4, 0, 'minecraft:iron_bars'); F(19, 0, 0, 19, 4, 0, 'minecraft:iron_bars')
  F(3, 0, 1, 10, 0, 1, V2GR); bgVoiture(22, 0, 'x', 'black', 0)
  F(24, 12, 20, 27, 13, 24, 'minecraft:iron_block'); F(24, 14, 20, 27, 14, 24, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false]')
}

// ================= JARDINERIE (grande serre a deux pans, tables de culture, cour de vente exterieure) ; entree au nord =================
function vrJardinerie() {
  btDalle(0, 0, 31, 31)
  F(2, 0, 3, 29, 0, 22, VRA); vrMurRideau(2, 3, 29, 22, 1, 4, 6, 'minecraft:glass_pane', VRB)
  var H = z => z <= 12 ? 5 + Math.floor((z - 3) / 2) : 5 + Math.floor((22 - z) / 2)
  for (var x = 2; x <= 29; x++) for (var z = 3; z <= 22; z++) S(x, H(z), z, x == 2 || x == 29 || (x - 2) % 6 == 0 ? VRB : 'minecraft:glass')
  for (var z = 3; z <= 22; z++) if (H(z) > 5) { F(2, 5, z, 2, H(z) - 1, z, 'minecraft:glass'); F(29, 5, z, 29, H(z) - 1, z, 'minecraft:glass') }
  // tables de culture (dessus en dalles, pieds en barrieres) et vegetation qui deborde
  ;[9, 14, 18].forEach(z => {
    for (var x = 5; x <= 26; x++) { if (x == 15 || x == 16) continue; for (var w = 0; w < 2; w++) { S(x, 1, z + w, (x - 5) % 4 == 0 ? 'minecraft:spruce_fence' : 'minecraft:spruce_slab[type=top]'); var r = H3(x, 2, z + w); if ((x - 5) % 4 && r < 0.55) S(x, 2, z + w, choix(V3POTS)); else if ((x - 5) % 4 && r > 0.9) S(x, 2, z + w, 'minecraft:azalea_leaves[persistent=true]') } }
  })
  ;[[15, 12]].forEach(t => btArbre(t[0], t[1], 6))
  for (var z = 9; z <= 19; z += 2) vrEtag(3, 1, z, 'east'); S(3, 2, 9, 'supplementaries:sack'); S(3, 2, 13, 'supplementaries:sack')
  ;[[24, 4], [26, 4], [24, 6], [26, 6]].forEach(p => { F(p[0], 1, p[1], p[0] + 1, 1, p[1], 'minecraft:oak_slab[type=bottom]'); S(p[0], 2, p[1], 'supplementaries:sack') })
  for (var x = 5; x <= 9; x++) vrCpt(x, 1, 5, 'north', 'quartz_block'); vrCh(6, 1, 6, 'north'); vrCh(8, 1, 6, 'north'); S(7, 2, 5, 'supplementaries:jar')
  for (var x = 4; x <= 27; x += 6) S(x, 8, 12, 'minecraft:lantern[hanging=true]')
  PORTE(15, 1, 3, 'mcwdoors:dark_oak_glass_door', 'north', 'left', 'false'); PORTE(16, 1, 3, 'mcwdoors:dark_oak_glass_door', 'north', 'right', 'true')
  PORTE(15, 1, 22, 'mcwdoors:dark_oak_glass_door', 'south', 'left', 'true'); PORTE(16, 1, 22, 'mcwdoors:dark_oak_glass_door', 'south', 'right', 'false')
  // cour exterieure : arbustes en pleine terre, palettes de pots, cloture
  F(2, 0, 23, 2, 0, 30, 'minecraft:spruce_fence'); F(29, 0, 23, 29, 0, 30, 'minecraft:spruce_fence'); F(3, 0, 30, 28, 0, 30, 'minecraft:spruce_fence'); F(14, 0, 30, 17, 0, 30, AIR)
  for (var x = 3; x <= 28; x++) for (var z = 23; z <= 29; z++) S(x, -1, z, 'minecraft:gravel')
  for (var x = 5; x <= 26; x += 3) for (var z = 25; z <= 28; z += 3) { if (x >= 14 && x <= 17) continue; S(x, -1, z, 'minecraft:moss_block'); SA(x, 0, z, H3(x, 0, z) < 0.5 ? 'minecraft:azalea' : 'minecraft:flowering_azalea') }
  F(22, 0, 23, 24, 0, 23, 'minecraft:oak_slab[type=bottom]'); ;[22, 24].forEach(x => S(x, 1, 23, 'handcrafted:terracotta_wide_pot'))
  // stationnement client
  for (var x = 4; x <= 24; x += 5) S(x, -1, 2, VRB); bgVoiture(5, 0, 'x', 'green', 0); bgVoiture(19, 0, 'x', 'white', 1)
}

function vuesVerre3() {
  vue('vr3_ensemble_sud', 0, 0, 64, 52, 120, 64, 12, 34, 3000)
  vue('vr3_ensemble_nord', 0, 0, 64, 36, -40, 64, 8, 40, 3000)
  vue('vr3_studio', 0, 0, 16, 14, 46, 16, 12, 16)
  vue('vr3_studio_plateau', 0, 0, 26, 6, 19.5, 20, 2, 7)
  vue('vr3_studio_toit', 0, 0, 31, 32, 36, 20, 24, 12)
  vue('vr3_creche', 32, 0, 16, 6, 40, 16, 2, 14)
  vue('vr3_creche_salle', 32, 0, 25.5, 3.5, 17.5, 8, 1, 8)
  vue('vr3_creche_jardin', 32, 0, 4, 5, 30, 20, 0, 24)
  vue('vr3_sport', 64, 0, 16, 10, 44, 16, 6, 16)
  vue('vr3_sport_muscu', 64, 0, 25.5, 3.5, 18.5, 14, 1, 7)
  vue('vr3_sport_cours', 64, 0, 26.5, 9.5, 15.5, 14, 7, 6)
  vue('vr3_sport_toit', 64, 0, 16, 22, 40, 18, 12, 16)
  vue('vr3_labo', 96, 0, 16, 14, 46, 16, 10, 16)
  vue('vr3_labo_rez', 96, 0, 24.5, 3.5, 26.5, 15, 1, 15)
  vue('vr3_labo_etage', 96, 0, 13.5, 9.5, 26, 26, 7, 8)
  vue('vr3_musee', 0, 48, 16, 8, -12, 16, 5, 10)
  vue('vr3_musee_atrium', 0, 48, 11, 6, 4.5, 19, 3, 10)
  vue('vr3_musee_salle', 0, 48, 5, 5, 26.5, 24, 3, 16)
  vue('vr3_poste', 32, 48, 16, 8, -10, 16, 3, 10)
  vue('vr3_poste_guichets', 32, 48, 26, 3.5, 4.5, 8, 1.5, 10)
  vue('vr3_poste_tri', 32, 48, 26, 6, 26, 6, 1, 15)
  vue('vr3_concert', 64, 48, 16, 10, -12, 16, 6, 10)
  vue('vr3_concert_salle', 64, 48, 15.5, 7, 12, 15.5, 3, 26)
  vue('vr3_concert_hall', 64, 48, 26, 3.5, 5, 6, 2, 8)
  vue('vr3_jardinerie', 96, 48, 16, 10, -12, 16, 4, 12)
  vue('vr3_jardinerie_serre', 96, 48, 27, 4, 5, 8, 1, 18)
  vue('vr3_jardinerie_cour', 96, 48, 30.5, 6, 31, 12, 0, 24)
}
var QFIN_VR3 = function () {
  HB2 = true; FIN = true; THM = THM_VR
  HM = {}; vrRue(); finAncrage()
  lot(QF(vrStudioTV, null, null), 0, 0, 999, 4711, 32, 36); lot(QF(vrCreche, null, null), 32, 0, 999, 4721, 32, 8); lot(QF(vrFitness, null, null), 64, 0, 999, 4731, 32, 15); lot(QF(vrLabo, null, ['white', 'light_gray']), 96, 0, 999, 4741, 32, 29)
  lot(QF(vrMusee, null, null), 0, 48, 999, 4751, 32, 13); lot(QF(vrPoste, null, null), 32, 48, 999, 4761, 32, 11); lot(QF(vrConcert, null, null), 64, 48, 999, 4771, 32, 15); lot(QF(vrJardinerie, null, null), 96, 48, 999, 4781, 32, 10)
  vlog('FIN volets ' + FIN_NV + ' rideaux ' + FIN_NR + ' paves ' + PAVE_NB + ' retraits ancrage ' + ANC_NB)
  HB2 = false; FIN = false; THM = null; HM = {}
}
