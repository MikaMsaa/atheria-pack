// ================= QUARTIER BIDONVILLE, SERIE 3 : LE VILLAGE DE LONGONI (coin des kiosques, terrain de foot, radio pirate, boulangerie au four de terre, ravine et passerelles, maison de parpaings inachevee, camp de baches, barricade d'entree, place du manguier) =================
var BDPARP = 'minecraft:gray_concrete_powder', BDPARP2 = 'minecraft:light_gray_concrete_powder', BDFER = 'minecraft:iron_bars'
function bdToitTole(x1, z1, x2, z2, y) { for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) S(x, y, z, choix(BDT)) }
function bdPoteaux(l, y2) { l.forEach(c => F(c[0], 0, c[1], c[0], y2, c[1], BDLOG)) }
// grand arbre : tronc, branches, couronne en dome
function bdManguier(cx, cz, h, r) {
  F(cx, 0, cz, cx, h, cz, 'minecraft:jungle_log[axis=y]'); ;[[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(d => S(cx + d[0], h - 1, cz + d[1], 'minecraft:jungle_log[axis=' + (d[0] ? 'x' : 'z') + ']'))
  for (var a = -r; a <= r; a++) for (var b = -r; b <= r; b++) for (var y = 0; y <= 3; y++) { var d = a * a + b * b + (y - 1) * (y - 1) * 3; if (d <= r * r && !(a == 0 && b == 0 && y < 2)) S(cx + a, h + y, cz + b, 'minecraft:azalea_leaves[distance=1,persistent=true,waterlogged=false]') }
}

// ================= COIN DES KIOSQUES (barbier, recharge de telephones au panneau solaire, grill a brochettes, bancs) =================
function bdKiosques() {
  bdSol(0, 0, 31, 31)
  // barbier : cabane ouverte, fauteuil, miroir
  bdCab(2, 3, 9, 10, 0, 3, [6, 10, 'south'], [[2, 6]]); F(4, 1, 10, 5, 2, 10, AIR); S(4, 1, 5, 'minecraft:spruce_stairs[facing=north,half=bottom,shape=straight,waterlogged=false]'); S(7, 1, 4, 'minecraft:smooth_stone_slab[type=top]'); S(7, 2, 4, 'supplementaries:jar'); S(8, 1, 8, 'minecraft:cauldron')
  // kiosque de recharge : panneau solaire, batteries, multiprise
  bdPoteaux([[12, 4], [17, 4], [12, 8], [17, 8]], 3); bdToitTole(11, 3, 18, 9, 4); F(12, 5, 4, 17, 5, 8, 'minecraft:daylight_detector[inverted=false,power=0]')
  F(13, 1, 8, 16, 1, 8, 'minecraft:spruce_slab[type=top]'); ;[13, 15].forEach(x => S(x, 2, 8, 'minecraft:observer[facing=south,powered=false]')); F(13, 0, 5, 14, 0, 5, 'minecraft:black_concrete'); S(16, 0, 5, 'minecraft:black_concrete'); vrCh(14, 0, 9, 'north')
  // grill a brochettes sous parasol de tole
  S(23, 0, 5, 'minecraft:campfire[facing=north,lit=false,signal_fire=false,waterlogged=false]'); F(22, 0, 6, 24, 0, 6, 'minecraft:mud_brick_slab[type=bottom]'); S(25, 0, 5, 'minecraft:cauldron')
  F(23, 0, 9, 23, 3, 9, BDLOG); bdToitTole(21, 7, 25, 11, 4); ;[[21, 10], [25, 10], [22, 12]].forEach(c => vrCh(c[0], 0, c[1], 'north'))
  // grand banc de causerie (baraza) et table de dominos
  F(4, 0, 16, 16, 0, 16, 'minecraft:mud_bricks'); F(4, 1, 16, 16, 1, 16, 'minecraft:mud_brick_slab[type=bottom]'); F(4, 0, 15, 16, 0, 15, 'minecraft:mud_brick_stairs[facing=north,half=bottom,shape=straight,waterlogged=false]')
  F(9, 0, 13, 11, 0, 13, 'minecraft:spruce_slab[type=top]'); S(10, 1, 13, 'minecraft:white_carpet'); ;[8, 12].forEach(x => vrCh(x, 0, 13, x == 8 ? 'east' : 'west'))
  // cases de fond et bananiers
  bdBanga(20, 17, 27, 24, [23, 17, 'north']); bdBananier(3, 24, 4); bdBananier(13, 25, 5); bdBananier(29, 27, 4)
  for (var x = 0; x <= 31; x++) if (x < 10 || x > 21) S(x, 0, 30, bdMat(x, 30))
}

// ================= TERRAIN DE FOOT (terre battue, cages de bois, tribune de planches, buvette) =================
function bdFoot() {
  for (var x = 0; x <= 31; x++) for (var z = 0; z <= 31; z++) { var r = R(); S(x, -1, z, r < 0.7 ? 'minecraft:coarse_dirt' : r < 0.9 ? 'minecraft:packed_mud' : 'minecraft:dirt') }
  for (var x = 2; x <= 29; x++) { S(x, -1, 2, 'minecraft:white_concrete_powder'); S(x, -1, 20, 'minecraft:white_concrete_powder') } for (var z = 2; z <= 20; z++) { S(2, -1, z, 'minecraft:white_concrete_powder'); S(29, -1, z, 'minecraft:white_concrete_powder'); S(15, -1, z, 'minecraft:white_concrete_powder') }
  // cages
  ;[2, 29].forEach(x => { var d = x == 2 ? -1 : 1; F(x, 0, 8, x, 3, 8, BDLOG); F(x, 0, 14, x, 3, 14, BDLOG); F(x, 4, 8, x, 4, 14, 'minecraft:stripped_spruce_log[axis=z]'); F(x + d, 0, 9, x + d, 3, 13, 'minecraft:white_stained_glass_pane') })
  // tribune de planches a trois gradins
  for (var k = 0; k < 3; k++) F(4, 0, 23 + k, 27, k, 23 + k, BDPL); for (var x = 4; x <= 27; x += 6) F(x, 0, 26, x, 4, 26, BDLOG); bdToitTole(3, 24, 28, 27, 5)
  // buvette et tableau d'affichage sans texte
  bdCab(2, 27, 8, 31, 0, 3, [5, 27, 'north'], [[4, 27]]); F(3, 1, 27, 4, 2, 27, AIR); S(3, 1, 27, 'minecraft:spruce_slab[type=top]'); S(6, 1, 30, 'minecraft:cauldron'); S(7, 1, 30, RUBAR)
  F(24, 0, 29, 24, 4, 29, BDLOG); F(28, 0, 29, 28, 4, 29, BDLOG); F(24, 5, 29, 28, 7, 29, 'minecraft:black_concrete'); F(25, 6, 29, 27, 6, 29, 'minecraft:white_concrete')
  // ballon, bouteilles, moto
  S(17, 0, 11, 'minecraft:white_wool'); ;[[10, 22], [20, 22]].forEach(c => S(c[0], 0, c[1], choix(['minecraft:decorated_pot[cracked=false,facing=north,waterlogged=false]', RUBAR])))
}

// ================= RADIO PIRATE (studio de planches, mat d'antenne haubane, groupe electrogene, panneaux solaires) =================
function bdRadio() {
  bdSol(0, 0, 31, 31)
  // studio sur pilotis bas
  bdCab(4, 6, 14, 14, 1, 4, [9, 14, 'south'], [[6, 14], [12, 14], [4, 10]])
  F(5, 2, 7, 13, 2, 7, 'minecraft:spruce_slab[type=top]'); ;[6, 8, 10, 12].forEach(x => S(x, 3, 7, choix(['minecraft:note_block', 'minecraft:jukebox', 'minecraft:observer[facing=south,powered=false]', 'minecraft:target[power=0]']))); vrCh(8, 2, 8, 'north'); vrCh(11, 2, 8, 'north')
  F(5, 2, 13, 8, 2, 13, 'minecraft:gray_wool'); S(12, 2, 12, RUCOF.replace('south', 'west')); F(4, 2, 9, 4, 4, 11, 'minecraft:black_wool'); F(14, 2, 9, 14, 4, 11, 'minecraft:black_wool')
  F(8, 1, 15, 10, 1, 16, BDPL); S(9, 0, 17, btSt('spruce', 'south'))
  // mat d'antenne en treillis, haubans
  F(22, 0, 9, 22, 22, 9, 'minecraft:iron_bars'); F(23, 0, 9, 23, 22, 9, 'minecraft:iron_bars'); F(22, 0, 10, 23, 22, 10, 'minecraft:iron_bars')
  for (var y = 4; y <= 20; y += 4) F(21, y, 8, 24, y, 11, 'minecraft:iron_bars'); F(22, 23, 9, 23, 23, 10, 'minecraft:iron_block'); S(22, 24, 9, 'minecraft:iron_bars'); S(22, 25, 9, 'minecraft:iron_bars'); S(23, 21, 11, 'minecraft:redstone_lamp[lit=false]')
    ;[[17, 9], [28, 9], [22, 3], [22, 16]].forEach(c => { S(c[0], 0, c[1], 'minecraft:stone_bricks'); S(c[0], 1, c[1], 'minecraft:tripwire_hook[attached=false,facing=' + (c[0] == 17 ? 'east' : c[0] == 28 ? 'west' : c[1] == 3 ? 'south' : 'north') + ',powered=false]') })
  // cable du mat au studio
  F(15, 4, 10, 21, 4, 10, 'minecraft:chain[axis=x]')
  // groupe electrogene et bidons, panneaux solaires sur treteaux
  F(17, 0, 20, 20, 1, 22, 'minecraft:green_concrete'); S(18, 2, 21, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false,powered=false,waterlogged=false]'); ;[[21, 20], [21, 21], [22, 20]].forEach(c => S(c[0], 0, c[1], choix(['minecraft:red_terracotta', 'minecraft:yellow_terracotta'])))
  for (var x = 4; x <= 14; x += 5) { F(x, 0, 21, x, 0, 23, BDF); F(x + 3, 0, 21, x + 3, 0, 23, BDF); F(x, 1, 21, x + 3, 1, 23, 'minecraft:daylight_detector[inverted=false,power=0]') }
  bdLinge(25, 30, 25, 3); F(25, 0, 25, 25, 3, 25, BDF); F(30, 0, 25, 30, 3, 25, BDF); bdBananier(2, 28, 4)
}

// ================= BOULANGERIE AU FOUR DE TERRE (four voute, petrin, etagere a pains, file d'attente) =================
function bdBoulangerie() {
  bdSol(0, 0, 31, 31)
  // salle de cuisson : murs de terre, toit de toles sur charpente
  F(3, 0, 4, 20, 0, 16, 'minecraft:packed_mud'); W(3, 4, 20, 16, 1, 4, BDBRT); bdToitTole(2, 3, 21, 17, 5); F(3, 5, 4, 20, 5, 16, AIR); bdToitTole(2, 3, 21, 17, 6)
  ;[3, 20].forEach(x => F(x, 5, 4, x, 5, 16, BDBRT)); F(4, 5, 4, 19, 5, 4, BDBRT); F(4, 5, 16, 19, 5, 16, BDBRT)
  for (var x = 6; x <= 17; x += 4) S(x, 2, 4, 'minecraft:iron_bars')
  F(9, 1, 16, 12, 3, 16, AIR); F(9, 1, 17, 12, 1, 17, 'minecraft:spruce_slab[type=bottom]')
  // four voute de terre contre le mur nord
  F(5, 1, 5, 11, 1, 8, 'minecraft:mud_bricks'); F(5, 2, 5, 11, 3, 7, 'minecraft:mud_bricks'); F(6, 4, 5, 10, 4, 6, 'minecraft:mud_bricks'); F(7, 2, 8, 9, 2, 8, 'minecraft:mud_brick_wall')
  F(7, 2, 7, 9, 2, 7, AIR); S(8, 2, 6, 'minecraft:campfire[facing=south,lit=false,signal_fire=false,waterlogged=false]'); F(8, 5, 6, 8, 7, 6, 'minecraft:mud_bricks'); S(8, 8, 6, 'minecraft:mud_brick_wall')
  // petrin, etageres a pains, sacs de farine
  F(14, 1, 6, 18, 1, 7, 'minecraft:spruce_planks'); F(14, 2, 6, 18, 2, 7, 'minecraft:spruce_slab[type=bottom]'); ;[15, 17].forEach(x => S(x, 3, 6, 'minecraft:white_carpet'))
  for (var z = 9; z <= 14; z++) { S(19, 1, z, 'minecraft:spruce_slab[type=top]'); S(19, 3, z, 'minecraft:spruce_slab[type=top]'); if (R() < 0.6) SA(19, 2, z, 'minecraft:hay_block[axis=z]') }
  ;[[5, 13], [6, 14], [5, 14], [7, 13]].forEach(c => SA(c[0], 1, c[1], choix(['supplementaries:sack', 'minecraft:white_wool']))); S(12, 1, 11, 'minecraft:barrel[facing=up,open=false]'); S(13, 4, 11, RUL)
  // comptoir de vente sur la rue et file d'attente
  F(22, 0, 18, 28, 0, 22, BDPL); bdPoteaux([[22, 18], [28, 18], [22, 22], [28, 22]], 3); bdToitTole(21, 17, 29, 23, 4); F(23, 1, 22, 27, 1, 22, 'minecraft:spruce_slab[type=top]'); S(24, 2, 22, 'minecraft:hay_block[axis=x]'); S(26, 2, 22, 'supplementaries:jar')
  ;[[24, 25], [25, 26], [24, 27]].forEach(c => S(c[0], 0, c[1], choix(['minecraft:brown_wool', RUBAR])))
  // bois de chauffe
  for (var x = 23; x <= 29; x++) for (var z = 4; z <= 6; z++) F(x, 0, z, x, (x + z) % 3, z, 'minecraft:oak_log[axis=x]')
  bdBananier(2, 26, 4); bdBananier(14, 27, 4)
}

// ================= RAVINE ET PASSERELLES (ruisseau encaisse, cabanes de berge, passerelles de planches, lavandieres) =================
function bdRavine() {
  bdSol(0, 0, 31, 31)
  // lit du ruisseau : eau a -1 entre berges de boue et de pierres
  for (var x = 0; x <= 31; x++) { var c = 14 + Math.round(Math.sin(x / 5) * 2); F(x, 0, c - 2, x, 0, c + 2, AIR); F(x, -1, c - 1, x, -1, c + 1, 'minecraft:water'); S(x, -1, c - 2, 'minecraft:mud'); S(x, -1, c + 2, 'minecraft:mud'); if (R() < 0.3) S(x, 0, c - 3, 'minecraft:cobblestone'); if (R() < 0.3) S(x, 0, c + 3, 'minecraft:cobblestone') }
  // deux passerelles
  ;[7, 21].forEach(x => { var c = 14 + Math.round(Math.sin(x / 5) * 2); F(x, 0, c - 4, x + 2, 0, c + 4, 'minecraft:spruce_slab[type=bottom]'); F(x - 1, 0, c - 3, x - 1, 1, c + 3, BDF); F(x + 3, 0, c - 3, x + 3, 1, c + 3, BDF) })
  // cabanes des deux berges, une sur pilotis au-dessus du lit
  bdCab(1, 2, 7, 7, 0, 3, [4, 7, 'south'], [[1, 4]]); bdCab(13, 1, 19, 6, 0, 3, [16, 6, 'south'], [[19, 3]]); bdCab(24, 2, 30, 8, 0, 3, [27, 8, 'south'])
  bdCab(2, 21, 8, 27, 0, 3, [5, 21, 'north'], [[8, 24]]); bdCab(14, 12, 18, 17, 2, 3, [16, 17, 'south'])
  bdCab(23, 22, 29, 28, 0, 3, [26, 22, 'north'])
  // pierres plates des lavandieres, linge sur les berges
  ;[11, 12, 13].forEach(x => { var c = 14 + Math.round(Math.sin(x / 5) * 2); S(x, -1, c - 1, 'minecraft:smooth_stone') }); S(12, 0, 10, 'minecraft:cauldron')
  bdLinge(10, 14, 22, 3); F(10, 0, 22, 10, 3, 22, BDF); F(14, 0, 22, 14, 3, 22, BDF)
  ;[[3, 5, 'orange'], [26, 5, 'blue'], [4, 24, 'green'], [25, 25, 'brown']].forEach(c => vrLitS(c[0], 1, c[1], c[2], 'east'))
  bdBananier(10, 3, 4); bdBananier(30, 18, 3); bdBananier(19, 26, 4)
}

// ================= MAISON DE PARPAINGS INACHEVEE (rez habite, etage en attente, fers en attente, toit-terrasse, echafaudage de bois) =================
function bdParpaings() {
  bdSol(0, 0, 31, 31)
  // rez : murs de parpaings, enduit partiel, ouvertures sans menuiseries
  F(5, 0, 5, 24, 0, 18, 'minecraft:smooth_stone'); W(5, 5, 24, 18, 1, 4, BDPARP)
  for (var x = 6; x <= 23; x++) for (var y = 1; y <= 4; y++) if (R() < 0.35) { S(x, y, 18, 'minecraft:white_terracotta') }
  ;[[8, 9], [19, 20]].forEach(o => F(o[0], 2, 18, o[1], 3, 18, AIR)); F(13, 1, 18, 15, 3, 18, AIR); F(5, 2, 9, 5, 3, 10, AIR); F(24, 2, 12, 24, 3, 13, AIR); F(8, 2, 5, 9, 3, 5, AIR)
  PORTE(14, 1, 18, 'minecraft:iron_door', 'south', 'left', 'false')
  F(5, 5, 5, 24, 5, 18, 'minecraft:gray_concrete')
  // etage : poteaux de beton et fers en attente, murs commences
  ;[[5, 5], [14, 5], [24, 5], [5, 11], [24, 11], [5, 18], [14, 18], [24, 18]].forEach(c => { F(c[0], 6, c[1], c[0], 8, c[1], 'minecraft:gray_concrete'); F(c[0], 9, c[1], c[0], 10, c[1], BDFER) })
  F(6, 6, 5, 13, 7, 5, BDPARP2); F(5, 6, 6, 5, 6, 10, BDPARP2); F(15, 6, 18, 18, 6, 18, BDPARP2)
  ;[[9, 6, 9], [10, 6, 9], [9, 6, 10], [18, 6, 14]].forEach(c => S(c[0], c[1], c[2], BDPARP2)); F(16, 6, 8, 19, 6, 9, 'minecraft:spruce_slab[type=bottom]')
  // escalier exterieur de beton sans garde-corps
  for (var k = 0; k < 5; k++) F(25, 0, 14 - k, 26, k, 14 - k, 'minecraft:gray_concrete'); F(25, 0, 9, 26, 5, 9, 'minecraft:gray_concrete')
  // echafaudage de bois sur la facade sud
  ;[6, 12, 18, 23].forEach(x => F(x, 0, 20, x, 7, 20, BDLOG)); F(6, 4, 20, 23, 4, 20, 'minecraft:spruce_slab[type=bottom]'); F(6, 4, 19, 23, 4, 19, 'minecraft:spruce_slab[type=bottom]')
  // interieur habite du rez
  vrLitS(6, 1, 7, 'orange', 'east'); vrLitS(20, 1, 7, 'blue', 'east'); S(10, 1, 15, 'minecraft:smoker[facing=south,lit=false]'); S(11, 1, 15, 'minecraft:cauldron'); S(22, 1, 16, 'minecraft:chest[facing=west,type=single,waterlogged=false]'); F(9, 1, 11, 11, 1, 11, 'minecraft:spruce_slab[type=top]'); S(14, 4, 11, RUL)
  // tas de parpaings, sable, betonniere
  ;[[3, 22], [4, 22], [3, 23], [4, 23], [3, 22]].forEach((c, i) => F(c[0], 0, c[1], c[0], i % 2, c[1], BDPARP2)); for (var a = 0; a <= 3; a++) for (var b = 0; b <= 3; b++) S(8 + a, 0, 23 + b, 'minecraft:sand'); S(9, 1, 24, 'minecraft:sand')
  F(15, 0, 23, 16, 0, 23, 'minecraft:orange_concrete'); S(15, 1, 23, 'minecraft:cauldron'); S(16, 1, 23, 'minecraft:orange_concrete')
  for (var x = 0; x <= 31; x++) if (x < 13 || x > 17) S(x, 0, 30, BDPARP)
  bdBananier(28, 26, 4)
}

// ================= CAMP DE BACHES (tentes alignees, citerne souple, latrines, distribution) =================
function bdTente(x, z, col) {
  var c = 'minecraft:' + col + '_wool'
  F(x, 0, z, x + 4, 0, z + 5, 'minecraft:' + col + '_carpet'); F(x, 1, z, x, 1, z + 5, c); F(x + 4, 1, z, x + 4, 1, z + 5, c)
  F(x + 1, 2, z, x + 1, 2, z + 5, c); F(x + 3, 2, z, x + 3, 2, z + 5, c); F(x + 2, 3, z, x + 2, 3, z + 5, c); F(x + 2, 0, z, x + 2, 2, z, AIR); S(x + 2, 0, z, 'minecraft:' + col + '_carpet')
  F(x + 1, 1, z + 5, x + 3, 1, z + 5, c); S(x + 2, 2, z + 5, c)
}
function bdCamp() {
  bdSol(0, 0, 31, 31); for (var x = 0; x <= 31; x++) for (var z = 10; z <= 12; z++) S(x, -1, z, 'minecraft:gravel')
  ;[1, 7, 13, 19, 25].forEach((x, i) => { bdTente(x, 2, i % 2 ? 'light_blue' : 'blue'); bdTente(x, 14, i % 2 ? 'blue' : 'white') })
  ;[3, 9, 15, 21, 27].forEach(x => { S(x, 0, 4, 'minecraft:white_carpet'); S(x - 1, 0, 6, choix(['supplementaries:sack', RUBAR])) })
  // citerne souple et rampe de robinets
  F(4, 0, 22, 12, 0, 26, 'minecraft:gray_concrete'); F(5, 1, 23, 11, 1, 25, 'minecraft:blue_wool'); F(6, 2, 23, 10, 2, 25, 'minecraft:blue_carpet'); F(13, 0, 24, 18, 0, 24, 'minecraft:chain[axis=x]')
  F(18, 0, 23, 18, 1, 25, 'minecraft:stone_bricks'); ;[23, 24, 25].forEach(z => S(19, 1, z, 'minecraft:tripwire_hook[attached=false,facing=east,powered=false]'))
  // latrines de planches
  for (var x = 23; x <= 29; x += 3) { F(x, 0, 21, x + 2, 0, 23, BDPL); F(x, 1, 21, x + 2, 3, 23, bdMat(x, 21)); F(x + 1, 1, 22, x + 1, 2, 22, AIR); PORTE(x + 1, 1, 23, 'minecraft:spruce_door', 'south', 'left', 'false'); F(x, 4, 21, x + 2, 4, 23, choix(BDT)) }
  // point de distribution : tables, caisses
  F(2, 0, 28, 14, 0, 28, 'minecraft:spruce_slab[type=top]'); ;[[3, 29], [6, 29], [11, 29]].forEach(c => S(c[0], 0, c[1], choix([RUBAR, 'supplementaries:sack', RUCOF])))
  F(1, 0, 28, 1, 3, 28, BDLOG); F(15, 0, 28, 15, 3, 28, BDLOG); bdToitTole(0, 27, 16, 29, 4)
}

// ================= BARRICADE D'ENTREE (palissade de toles et de portes, chicane de voitures, tour de guet, poste de garde) =================
function bdBarricade() {
  bdSol(0, 0, 31, 31)
  // palissade sur toute la largeur, passage en chicane au milieu
  for (var x = 0; x <= 31; x++) if (x < 13 || x > 18) F(x, 0, 14, x, 3, 14, bdMat(x, 14)); for (var x = 0; x <= 31; x += 3) if (x < 13 || x > 18) S(x, 4, 14, 'simply_traps:circular_barbed_wire_iron')
  for (var x = 0; x <= 31; x += 4) if (x < 13 || x > 18) F(x, 0, 15, x, 2, 15, BDLOG)
  // chicane : voitures retournees et fûts
  bgVoiture(10, 17, 'x', 'gray', 1, true); bgVoiture(16, 21, 'x', 'brown', 1, true); bgVoiture(9, 24, 'x', 'white', 1)
  ;[[14, 17], [15, 17], [19, 20], [20, 20], [13, 24]].forEach(c => { S(c[0], 0, c[1], RUBAR); if (R() < 0.5) S(c[0], 1, c[1], 'minecraft:barrel[facing=east,open=false]') })
  ;[[22, 18], [23, 18], [22, 19]].forEach(c => SA(c[0], 0, c[1], 'supplementaries:sack')); F(4, 0, 20, 7, 0, 20, 'supplementaries:sack')
  // tour de guet en rondins
  bdPoteaux([[21, 8], [25, 8], [21, 12], [25, 12]], 8); F(20, 9, 7, 26, 9, 13, BDPL); W(20, 7, 26, 13, 10, 10, BDF); bdToitTole(19, 6, 27, 14, 13); ;[[20, 7], [26, 7], [20, 13], [26, 13]].forEach(c => F(c[0], 11, c[1], c[0], 12, c[1], BDF))
  F(21, 0, 13, 21, 9, 13, 'minecraft:ladder[facing=south,waterlogged=false]'); S(21, 10, 13, AIR); S(24, 10, 9, 'minecraft:redstone_lamp[lit=false]'); S(22, 10, 10, RUBAR)
  // poste de garde derriere
  bdCab(3, 3, 10, 9, 0, 3, [6, 9, 'south'], [[3, 6], [10, 6]]); vrBur(5, 1, 4, 'south'); vrCh(5, 1, 5, 'north'); S(9, 1, 4, RUCOF.replace('south', 'west')); vrLitS(8, 1, 7, 'gray', 'east')
  // brasero, cloche d'alerte
  S(16, 0, 11, 'minecraft:campfire[facing=north,lit=false,signal_fire=false,waterlogged=false]'); F(12, 0, 12, 12, 4, 12, BDLOG); S(13, 4, 12, 'minecraft:stripped_spruce_log[axis=x]'); S(13, 3, 12, 'minecraft:bell[attachment=ceiling,facing=north,powered=false]')
  // pancartes de bois sans texte, pieux
  for (var x = 1; x <= 30; x += 2) if (x < 12 || x > 19) S(x, 0, 17 + (x % 3), 'minecraft:pointed_dripstone[thickness=tip,vertical_direction=up,waterlogged=false]')
}

// ================= PLACE DU MANGUIER (grand arbre, bancs de parpaings, foyer, etals, cases autour) =================
function bdPlace() {
  bdSol(0, 0, 31, 31); for (var x = 7; x <= 24; x++) for (var z = 7; z <= 22; z++) if ((x - 15.5) * (x - 15.5) + (z - 14.5) * (z - 14.5) < 64) S(x, -1, z, choix(['minecraft:packed_mud', 'minecraft:dirt_path', 'minecraft:coarse_dirt']))
  bdManguier(15, 14, 7, 6)
  // banc circulaire autour du tronc
  ;[[13, 12], [17, 12], [13, 16], [17, 16], [15, 11], [15, 17], [12, 14], [18, 14]].forEach(c => S(c[0], 0, c[1], 'minecraft:mud_brick_slab[type=bottom]'))
  // etals et foyer
  ;[[6, 6], [24, 7]].forEach(c => { bdPoteaux([[c[0], c[1]], [c[0] + 3, c[1]], [c[0], c[1] + 2], [c[0] + 3, c[1] + 2]], 2); bdToitTole(c[0] - 1, c[1] - 1, c[0] + 4, c[1] + 3, 3); F(c[0], 1, c[1] + 1, c[0] + 3, 1, c[1] + 1, 'minecraft:spruce_slab[type=bottom]'); SA(c[0] + 1, 2, c[1] + 1, choix(['supplementaries:jar', 'minecraft:melon', 'minecraft:pumpkin'])) })
  S(21, 0, 21, BDFEU); ;[[20, 21], [22, 21], [21, 22]].forEach(c => S(c[0], 0, c[1], 'minecraft:cobblestone_slab[type=bottom]'))
  // cases autour de la place
  bdBanga(1, 1, 6, 5, [4, 5, 'south']); bdBanga(25, 0, 30, 4, [27, 4, 'south']); bdBanga(1, 24, 7, 29, [4, 24, 'north']); bdBanga(24, 25, 30, 30, [27, 25, 'north'])
  ;[[2, 2, 'red'], [26, 1, 'green'], [2, 26, 'blue'], [25, 27, 'orange']].forEach(c => vrLitS(c[0], 1, c[1], c[2], 'east'))
  // fontaine a pompe et tas de noix de coco
  F(9, 0, 23, 9, 1, 23, 'minecraft:gray_concrete'); S(9, 2, 23, 'minecraft:lever[face=floor,facing=south,powered=false]'); S(9, -1, 24, 'minecraft:mud')
  ;[[18, 25], [19, 25], [18, 26]].forEach(c => S(c[0], 0, c[1], 'minecraft:brown_wool'))
}

var QFIN_BD3 = function () {
  HB2 = true; FIN = true; THM = THM_BD
  var rb = ['brown', 'orange', 'blue', 'green']
  HM = {}; bdRue(); finAncrage()
  lot(QF(bdKiosques, null, rb), 0, 0, 999, 5011, 32, 7); lot(QF(bdFoot, null, null), 32, 0, 999, 5021, 32, 8); lot(QF(bdRadio, null, rb), 64, 0, 999, 5031, 32, 25); lot(QF(bdBoulangerie, null, null), 96, 0, 999, 5041, 32, 9)
  lot(QF(bdRavine, null, rb), 0, 48, 999, 5051, 32, 8); lot(QF(bdParpaings, null, null), 32, 48, 999, 5061, 32, 11); lot(QF(bdCamp, null, null), 64, 48, 999, 5071, 32, 5); lot(QF(bdBarricade, null, rb), 96, 48, 999, 5081, 32, 14)
  lot(QF(bdPlace, null, rb), 128, 48, 999, 5091, 32, 11)
  vlog('FIN volets ' + FIN_NV + ' rideaux ' + FIN_NR + ' paves ' + PAVE_NB + ' retraits ancrage ' + ANC_NB)
  HB2 = false; FIN = false; THM = null; HM = {}
}
function vuesBidonville3() {
  vue('bd3_ensemble_sud', 0, 0, 80, 56, 130, 80, 8, 34, 3000)
  vue('bd3_ensemble_no', 0, 0, -30, 50, -30, 72, 6, 40, 3000)
  vue('bd3_kiosques', 0, 0, 16, 10, 42, 14, 2, 10)
  vue('bd3_foot', 32, 0, 16, 14, 44, 16, 1, 12)
  vue('bd3_radio', 64, 0, 14, 14, 44, 16, 8, 10)
  vue('bd3_boulangerie', 96, 0, 16, 10, 42, 12, 3, 10)
  vue('bd3_boulangerie_four', 96, 0, 14, 3, 14, 8, 2, 6)
  vue('bd3_ravine', 0, 48, 16, 12, 42, 16, 1, 14)
  vue('bd3_parpaings', 32, 48, 16, 12, 44, 15, 5, 12)
  vue('bd3_camp', 64, 48, 16, 12, 42, 16, 1, 12)
  vue('bd3_barricade', 96, 48, 16, 10, 44, 16, 3, 14)
  vue('bd3_place', 128, 48, 16, 14, 44, 15, 5, 14)
}
