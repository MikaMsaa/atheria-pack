// ================= QUARTIER BIDONVILLE, SERIE 2 : LES HAUTS DE LONGONI (bangas, foyer des jeunes, point d'eau et lavoir, garage des motos, doukas, cabanes en terrasses, jardins et basse-cour, hangar-dortoir) =================
var BDTERRE = 'minecraft:packed_mud', BDBRT = 'minecraft:mud_bricks', BDBAN = 'minecraft:jungle_log[axis=y]', BDFEUIL = 'minecraft:azalea_leaves[distance=1,persistent=true,waterlogged=false]'
// banga : petite case de briques de terre, angles en rondins, toit de toles a un pan
function bdBanga(x1, z1, x2, z2, porte) {
  F(x1, 0, z1, x2, 0, z2, BDPL); W(x1, z1, x2, z2, 1, 3, BDBRT); W(x1, z1, x2, z2, 1, 1, BDTERRE)
  ;[[x1, z1], [x2, z1], [x1, z2], [x2, z2]].forEach(c => F(c[0], 1, c[1], c[0], 3, c[1], BDLOG))
  for (var x = x1 - 1; x <= x2 + 1; x++) for (var z = z1 - 1; z <= z2 + 1; z++) S(x, z <= Math.floor((z1 + z2) / 2) ? 5 : 4, z, choix(BDT))
  F(x1, 4, z1, x2, 4, Math.floor((z1 + z2) / 2), BDBRT); F(x1 + 1, 4, z1 + 1, x2 - 1, 4, Math.floor((z1 + z2) / 2), AIR)
  PORTE(porte[0], 1, porte[1], 'minecraft:spruce_door', porte[2], 'left', 'false')
  S(Math.floor((x1 + x2) / 2), 3, Math.floor((z1 + z2) / 2), RUL)
}
function bdBananier(x, z, h) { F(x, 0, z, x, h, z, BDBAN); ;[[1, 0], [-1, 0], [0, 1], [0, -1], [0, 0]].forEach(d => S(x + d[0], h + 1, z + d[1], BDFEUIL)); ;[[2, 0], [-2, 0], [0, 2], [0, -2]].forEach(d => S(x + d[0], h, z + d[1], BDFEUIL)) }
// sechoir : lisse de barriere tendue entre deux poteaux, linge pose en travers (tapis)
function bdLinge(x1, x2, z, y) { F(x1 + 1, y - 1, z, x2 - 1, y - 1, z, 'minecraft:spruce_fence[east=true,north=false,south=false,waterlogged=false,west=true]'); for (var x = x1 + 1; x < x2; x++) if (R() < 0.6) S(x, y, z, choix(['minecraft:white_carpet', 'minecraft:red_carpet', 'minecraft:yellow_carpet', 'minecraft:blue_carpet', 'minecraft:light_blue_carpet'])) }

// ================= BANGAS (cour commune de cases de terre, cuisine au feu de bois) =================
function bdBangas() {
  bdSol(0, 0, 31, 31)
  bdBanga(2, 2, 8, 7, [5, 7, 'south']); bdBanga(11, 1, 17, 6, [14, 6, 'south']); bdBanga(21, 2, 28, 8, [24, 8, 'south'])
  bdBanga(2, 14, 7, 20, [7, 17, 'east']); bdBanga(23, 15, 29, 21, [23, 18, 'west'])
  // mobilier interieur
  ;[[3, 4], [12, 3], [22, 4], [3, 16], [27, 17]].forEach((c, i) => { vrLitS(c[0], 1, c[1], ['orange', 'blue', 'green', 'brown', 'red'][i], 'east'); S(c[0] + 3, 1, c[1], i % 2 ? RUBAR : 'minecraft:chest[facing=west,type=single,waterlogged=false]') })
  // cour : cuisine commune sous abri, natte, mortier, jerricans
  F(12, -1, 10, 20, -1, 18, 'minecraft:packed_mud'); ;[[12, 11], [18, 11], [12, 16], [18, 16]].forEach(c => F(c[0], 0, c[1], c[0], 3, c[1], BDLOG)); for (var x = 11; x <= 19; x++) for (var z = 10; z <= 17; z++) S(x, 4, z, choix(BDT))
  S(15, 0, 13, BDFEU); S(14, 0, 13, 'minecraft:cauldron'); S(16, 0, 14, 'minecraft:mud_brick_slab[type=bottom]'); S(13, 0, 15, 'minecraft:decorated_pot[cracked=false,facing=north,waterlogged=false]')
  F(14, 0, 16, 16, 0, 16, 'minecraft:yellow_carpet'); S(17, 0, 12, RUBAR)
  bdLinge(9, 20, 9, 2); F(9, 0, 9, 9, 2, 9, BDF); F(20, 0, 9, 20, 2, 9, BDF)
  // cloture de toles sur la rue, portail
  for (var x = 0; x <= 31; x++) if (x < 14 || x > 17) F(x, 0, 29, x, 1, 29, bdMat(x, 29))
  bdBananier(10, 24, 4); bdBananier(26, 25, 5); bdBananier(4, 25, 3)
  ;[[20, 24], [21, 24], [19, 26]].forEach(c => S(c[0], 0, c[1], choix(['minecraft:blue_terracotta', RUBAR, 'supplementaries:sack'])))
}

// ================= FOYER DES JEUNES (salle de toles, pylone d'echafaudage a haut-parleurs, bornes-fontaines) =================
function bdFoyerJeunes() {
  bdSol(0, 0, 31, 31)
  F(5, 0, 4, 24, 0, 19, 'minecraft:white_concrete'); W(5, 4, 24, 19, 1, 5, 'minecraft:white_terracotta'); W(5, 4, 24, 19, 1, 1, 'minecraft:light_gray_terracotta')
  for (var z = 6; z <= 17; z += 3) { F(5, 2, z, 5, 4, z, 'minecraft:light_blue_stained_glass_pane'); F(24, 2, z, 24, 4, z, 'minecraft:light_blue_stained_glass_pane') }
  ruToit(5, 24, 4, 19, 6, 'waxed_oxidized_cut_copper', 'minecraft:white_terracotta')
  F(13, 1, 19, 16, 4, 19, AIR); F(12, 5, 19, 17, 5, 19, 'minecraft:light_blue_terracotta'); F(13, 1, 20, 16, 1, 22, 'minecraft:smooth_stone_slab[type=bottom]')
  // salle du foyer : nattes, bancs, tables ; coin musique au fond
  for (var x = 7; x <= 22; x++) for (var z = 10; z <= 17; z++) if (R() < 0.35) S(x, 1, z, choix(['minecraft:brown_carpet', 'minecraft:yellow_carpet', 'minecraft:light_gray_carpet']))
  ;[8, 19].forEach(x => { F(x, 1, 12, x + 2, 1, 12, 'handcrafted:oak_table[color=yellow,shape=single,waterlogged=false]'); for (var i = 0; i <= 2; i++) { S(x + i, 1, 11, 'minecraft:spruce_stairs[facing=south,half=bottom,shape=straight,waterlogged=false]'); S(x + i, 1, 13, 'minecraft:spruce_stairs[facing=north,half=bottom,shape=straight,waterlogged=false]') } })
  F(8, 1, 16, 21, 1, 16, 'minecraft:spruce_stairs[facing=north,half=bottom,shape=straight,waterlogged=false]'); F(14, 1, 16, 15, 1, 16, AIR)
  F(6, 1, 8, 23, 4, 8, 'minecraft:white_terracotta'); F(10, 2, 8, 13, 3, 8, 'minecraft:glass_pane'); PORTE(15, 1, 8, 'minecraft:spruce_door', 'south', 'left', 'false')
  F(8, 1, 6, 12, 1, 6, 'handcrafted:oak_counter[counter=smooth_stone,facing=south,type=1]'); S(9, 2, 6, 'minecraft:jukebox'); S(11, 2, 6, 'minecraft:note_block'); S(10, 1, 7, 'minecraft:spruce_stairs[facing=north,half=bottom,shape=straight,waterlogged=false]'); F(18, 1, 5, 22, 1, 5, 'minecraft:barrel[facing=up,open=false]'); S(20, 2, 5, 'supplementaries:sack')
  ;[9, 15, 20].forEach(x => ruSusp(x, 8, 12))
  // pylone d'echafaudage, haut-parleurs et antenne
  F(26, 0, 5, 27, 0, 6, 'minecraft:white_concrete'); F(26, 1, 5, 27, 14, 6, 'minecraft:scaffolding[bottom=false,distance=0,waterlogged=false]')
  F(25, 15, 4, 28, 15, 7, 'minecraft:smooth_stone_slab[type=bottom]'); F(26, 16, 5, 27, 17, 6, 'minecraft:white_concrete'); F(25, 18, 4, 28, 18, 7, 'minecraft:light_blue_terracotta'); F(26, 19, 5, 27, 19, 6, 'minecraft:white_concrete'); F(26, 20, 5, 27, 20, 6, 'minecraft:waxed_oxidized_cut_copper_slab[type=bottom]')
  F(26, 17, 4, 27, 17, 4, 'minecraft:light_blue_stained_glass_pane'); F(26, 17, 7, 27, 17, 7, 'minecraft:light_blue_stained_glass_pane'); F(26, 21, 5, 26, 24, 5, 'minecraft:iron_bars')
  // bornes-fontaines du quartier : rangee de robinets et bassin
  F(5, 0, 23, 16, 0, 25, 'minecraft:smooth_stone'); F(6, 1, 25, 15, 1, 25, 'minecraft:stone_brick_wall'); for (var x = 6; x <= 15; x += 2) S(x, 2, 25, 'minecraft:tripwire_hook[attached=false,facing=north,powered=false]')
  F(6, 0, 24, 15, 0, 24, 'minecraft:water'); F(5, 0, 23, 5, 1, 25, 'minecraft:stone_bricks'); F(16, 0, 23, 16, 1, 25, 'minecraft:stone_bricks')
  ;[[19, 24], [20, 24], [19, 25]].forEach(c => S(c[0], 0, c[1], 'minecraft:spruce_slab[type=bottom]'))
  // muret et arbres
  for (var x = 0; x <= 31; x++) if (x < 12 || x > 17) S(x, 0, 29, 'minecraft:white_terracotta')
  bdBananier(2, 10, 4); bdBananier(29, 22, 4); bdBananier(2, 22, 3)
}

// ================= POINT D'EAU ET LAVOIR (citerne surelevee, bornes, bacs a laver, linge) =================
function bdLavoir() {
  bdSol(0, 0, 31, 31)
  // citerne bleue sur tour de rondins
  ;[[4, 4], [9, 4], [4, 9], [9, 9]].forEach(c => F(c[0], 0, c[1], c[0], 7, c[1], BDLOG)); F(4, 4, 4, 9, 4, 9, BDF); F(5, 4, 5, 8, 4, 8, AIR)
  F(4, 8, 4, 9, 8, 9, BDPL); ruRond(6, 6, 5, 9, 13, 'minecraft:blue_concrete', false); ruRond(6, 6, 5, 14, 14, 'minecraft:blue_terracotta', true)
  F(10, 0, 6, 10, 8, 6, 'minecraft:ladder[facing=east,waterlogged=false]'); F(7, 1, 10, 7, 7, 10, 'minecraft:chain[axis=y]')
  // borne-fontaine et file de jerricans
  F(14, 0, 4, 15, 2, 4, 'minecraft:gray_concrete'); S(14, 1, 5, 'minecraft:tripwire_hook[attached=false,facing=south,powered=false]'); S(14, -1, 5, 'minecraft:mud')
  for (var z = 7; z <= 15; z++) if (R() < 0.75) S(14 + (z % 2), 0, z, choix(['minecraft:yellow_terracotta', 'minecraft:blue_terracotta', 'minecraft:white_terracotta', RUBAR]))
  // lavoir couvert : deux bacs, toit de toles
  F(18, 0, 3, 29, 0, 14, 'minecraft:smooth_stone'); ;[[18, 3], [29, 3], [18, 14], [29, 14]].forEach(c => F(c[0], 1, c[1], c[0], 4, c[1], BDLOG))
  for (var x = 17; x <= 30; x++) for (var z = 2; z <= 15; z++) S(x, 5, z, choix(BDT))
  ;[5, 10].forEach(z => { F(20, 0, z, 27, 1, z + 3, 'minecraft:stone_bricks'); F(21, 1, z + 1, 26, 1, z + 2, 'minecraft:water') })
  ;[[19, 4], [28, 7], [19, 12], [28, 14]].forEach(c => S(c[0], 1, c[1], choix(['minecraft:cauldron', 'minecraft:white_wool', 'minecraft:light_blue_wool'])))
  // cordes a linge
  bdLinge(2, 12, 19, 3); bdLinge(2, 12, 23, 3); bdLinge(18, 29, 19, 3); ;[2, 12].forEach(x => { F(x, 0, 19, x, 3, 19, BDF); F(x, 0, 23, x, 3, 23, BDF) }); F(18, 0, 19, 18, 3, 19, BDF); F(29, 0, 19, 29, 3, 19, BDF)
  // rigole d'eau grise
  for (var x = 0; x <= 31; x++) S(x, -1, 27, x % 5 ? 'minecraft:mud' : 'minecraft:water')
  bdBananier(25, 24, 4); S(5, 0, 26, 'minecraft:decorated_pot[cracked=false,facing=north,waterlogged=false]')
}

// ================= GARAGE DES MOTOS ET TAXIS-BROUSSE (auvent, motos, pneus, bidons d'essence) =================
function bdMotos() {
  bdSol(0, 0, 31, 31); F(1, -1, 1, 30, -1, 20, 'minecraft:packed_mud')
  // grand auvent de toles sur poteaux
  for (var x = 2; x <= 26; x += 6) { F(x, 0, 2, x, 4, 2, BDLOG); F(x, 0, 12, x, 4, 12, BDLOG) }
  for (var x = 1; x <= 27; x++) for (var z = 1; z <= 13; z++) S(x, 5, z, choix(BDT))
  F(2, 0, 1, 26, 3, 1, 'minecraft:waxed_oxidized_cut_copper'); F(26, 0, 2, 26, 3, 12, 'minecraft:waxed_weathered_cut_copper')
  // motos : roues, cadre, guidon
  ;[[5, 5], [9, 5], [13, 5], [5, 9], [10, 9]].forEach((c, i) => { S(c[0], 0, c[1], 'minecraft:black_concrete'); S(c[0] + 2, 0, c[1], 'minecraft:black_concrete'); S(c[0] + 1, 0, c[1], ['minecraft:red_concrete', 'minecraft:blue_concrete', 'minecraft:black_concrete', 'minecraft:white_concrete', 'minecraft:orange_concrete'][i]); S(c[0] + 1, 1, c[1], 'minecraft:spruce_slab[type=bottom]'); S(c[0] + 2, 1, c[1], 'minecraft:lever[face=floor,facing=east,powered=false]') })
  // etabli et outils
  for (var x = 18; x <= 24; x++) vrCpt(x, 1, 2, 'south', 'dark_oak_planks'); S(19, 2, 2, 'supplementaries:jar'); S(22, 1, 3, 'minecraft:anvil[facing=east]'); S(25, 1, 3, RUCOF.replace('south', 'west')); S(24, 1, 11, 'minecraft:grindstone[face=floor,facing=west]')
  ;[[18, 9], [18, 10], [19, 10], [18, 11]].forEach((c, i) => { for (var y = 0; y <= i % 3; y++) S(c[0], y, c[1], 'minecraft:black_concrete') })
  ruSusp(8, 4, 7); ruSusp(20, 4, 7)
  // taxi-brousse en attente (minibus blanc a bande jaune)
  F(4, 0, 16, 15, 0, 19, 'minecraft:black_concrete'); F(4, 1, 16, 15, 3, 19, 'minecraft:white_concrete'); F(4, 2, 16, 15, 2, 16, 'minecraft:black_stained_glass'); F(4, 2, 19, 15, 2, 19, 'minecraft:black_stained_glass'); F(15, 2, 17, 15, 2, 18, 'minecraft:black_stained_glass'); F(4, 1, 16, 15, 1, 16, 'minecraft:yellow_concrete')
  F(5, 4, 16, 14, 4, 19, 'minecraft:spruce_trapdoor[facing=north,half=bottom,open=false,powered=false,waterlogged=false]'); ;[[6, 17], [9, 18], [12, 17]].forEach(c => S(c[0], 5, c[1], choix([RUBAR, 'supplementaries:sack', 'minecraft:brown_wool'])))
  // bidons d'essence et pompe a main
  ;[[20, 17], [21, 17], [20, 18], [22, 18], [21, 19]].forEach(c => S(c[0], 0, c[1], choix(['minecraft:red_terracotta', 'minecraft:yellow_terracotta', RUBAR])))
  S(25, 0, 17, 'minecraft:red_concrete'); S(25, 1, 17, 'minecraft:red_concrete'); S(25, 2, 17, 'minecraft:lever[face=wall,facing=south,powered=false]')
  for (var x = 0; x <= 31; x++) if (x < 18 || x > 23) S(x, 0, 29, bdMat(x, 29))
  bdBananier(29, 24, 4)
}

// ================= RANGEE DE DOUKAS (petites boutiques a volets, comptoirs, auvents) =================
function bdDoukas() {
  bdSol(0, 0, 31, 31); for (var x = 0; x <= 31; x++) for (var z = 20; z <= 24; z++) S(x, -1, z, choix(['minecraft:packed_mud', 'minecraft:coarse_dirt', BDPL]))
  ;[1, 9, 17, 25].forEach((x, i) => {
    var m = ['minecraft:yellow_terracotta', 'minecraft:light_blue_terracotta', 'minecraft:white_terracotta', 'minecraft:lime_terracotta'][i]
    F(x, 0, 8, x + 6, 0, 18, BDPL); W(x, 8, x + 6, 18, 1, 4, m); F(x, 5, 7, x + 6, 5, 18, choix(BDT)); F(x + 1, 5, 8, x + 5, 5, 17, BDPL)
    F(x + 1, 1, 18, x + 5, 3, 18, AIR); F(x + 1, 1, 18, x + 5, 1, 18, 'minecraft:spruce_slab[type=top]')
    F(x + 1, 4, 19, x + 5, 4, 19, 'minecraft:spruce_trapdoor[facing=south,half=top,open=true,powered=false,waterlogged=false]')
    ;[x, x + 6].forEach(xx => F(xx, 0, 21, xx, 3, 21, BDF)); for (var xx = x; xx <= x + 6; xx++) for (var z = 19; z <= 21; z++) S(xx, 4, z, choix(BDT))
    // etageres
    for (var xx = x + 1; xx <= x + 5; xx++) { S(xx, 2, 9, 'minecraft:spruce_slab[type=top]'); if (R() < 0.7) SA(xx, 3, 9, choix(['supplementaries:jar', RUBAR, 'minecraft:decorated_pot[cracked=false,facing=south,waterlogged=false]', 'supplementaries:sack'])); if (R() < 0.6) SA(xx, 1, 9, choix([RUBAR, 'supplementaries:sack'])) }
    S(x + 3, 3, 13, RUL); S(x + 5, 1, 11, 'minecraft:chest[facing=west,type=single,waterlogged=false]'); PORTE(x + 3, 1, 8, 'minecraft:spruce_door', 'north', 'left', 'false')
  })
  // arriere-cour, generateur, caisses
  F(3, 0, 2, 5, 1, 4, 'minecraft:green_concrete'); ;[[12, 3], [13, 3], [20, 2], [27, 4]].forEach(c => S(c[0], 0, c[1], choix([RUBAR, 'minecraft:spruce_slab[type=bottom]', 'supplementaries:sack'])))
  F(6, 2, 4, 30, 2, 4, 'minecraft:chain[axis=x]')
  // devant : glaciere, chaises en plastique, moto
  S(8, 0, 22, 'minecraft:white_concrete'); S(15, 0, 23, 'minecraft:white_carpet'); vrCh(14, 0, 23, 'south'); S(24, 0, 23, 'minecraft:black_concrete'); S(26, 0, 23, 'minecraft:black_concrete'); S(25, 0, 23, 'minecraft:red_concrete')
  bdBananier(30, 27, 4)
}

// ================= CABANES EN TERRASSES (trois niveaux sur la pente, murs de soutenement, escaliers de beton) =================
function bdTerrasses() {
  bdSol(0, 0, 31, 31)
  // terrasses : niveau 0 devant, 3 au milieu, 6 au fond
  F(0, 0, 0, 31, 5, 9, 'minecraft:packed_mud'); F(0, 0, 10, 31, 2, 19, 'minecraft:packed_mud')
  F(0, 3, 10, 31, 5, 10, 'minecraft:cobblestone'); F(0, 0, 20, 31, 2, 20, 'minecraft:cobblestone'); for (var x = 0; x <= 31; x += 4) { S(x, 3, 20, 'minecraft:cobblestone_wall'); S(x, 6, 10, 'minecraft:cobblestone_wall') }
  for (var x = 0; x <= 31; x++) { S(x, 5, 0 + Math.floor(R() * 9), choix(['minecraft:coarse_dirt', 'minecraft:packed_mud'])) }
  // escalier central de beton
  for (var k = 0; k < 6; k++) { var z = 21 - k * 2; F(15, k, z, 17, k, z, 'minecraft:gray_concrete'); F(15, k, z - 1, 17, k, z - 1, 'minecraft:gray_concrete'); if (k < 5) F(15, k + 1, z - 1, 17, k + 1, z - 1, btSt('stone_brick', 'south')) }
  F(14, 1, 10, 14, 6, 21, BDF); F(18, 1, 10, 18, 6, 21, BDF); F(15, 6, 9, 17, 6, 9, 'minecraft:gray_concrete')
  // cabanes du niveau haut (sur la terrasse a 6)
  bdCabY(2, 2, 8, 7, 6, [5, 7, 'south']); bdCabY(20, 1, 27, 7, 6, [23, 7, 'south'])
  // cabanes du niveau moyen (a 3) dont une sur pilotis en surplomb
  bdCabY(2, 12, 9, 18, 3, [9, 15, 'east']); bdCabY(21, 12, 28, 18, 3, [21, 15, 'west'])
  // cabanes du bas, a cheval sur la rue
  bdCabY(3, 22, 9, 27, 0, [9, 24, 'east']); bdCabY(22, 22, 28, 27, 0, [22, 24, 'west'])
  ;[[4, 3, 13], [24, 3, 13], [3, 6, 3], [24, 6, 3], [5, 0, 23], [25, 0, 23]].forEach((c, i) => { vrLitS(c[0], c[1] + 1, c[2], ['orange', 'blue', 'green', 'brown', 'red', 'gray'][i], 'east') })
  bdLinge(11, 13, 14, 6); bdBananier(12, 4, 9); bdBananier(30, 14, 7)
  ;[[11, 6, 7], [19, 3, 18], [12, 0, 26]].forEach(c => S(c[0], c[1], c[2], choix([RUBAR, 'minecraft:blue_terracotta', 'supplementaries:sack'])))
}
// cabane posee a la hauteur y (sol de la terrasse)
function bdCabY(x1, z1, x2, z2, y, porte) { bdCab(x1, z1, x2, z2, y, 3, porte, [[x1 + 2, z2], [x2 - 2, z1]]) }

// ================= JARDINS ET BASSE-COUR (planches de manioc et de brèdes, bananiers, poulailler, enclos a chevres) =================
function bdJardins() {
  bdSol(0, 0, 31, 31)
  // planches de culture
  for (var z = 2; z <= 14; z += 3) { F(2, -1, z, 15, -1, z + 1, 'minecraft:farmland[moisture=7]'); for (var x = 2; x <= 15; x++) for (var zz = z; zz <= z + 1; zz++) if (R() < 0.8) S(x, 0, zz, choix(['minecraft:potatoes[age=5]', 'minecraft:carrots[age=6]', 'minecraft:beetroots[age=2]', 'minecraft:wheat[age=4]'])) ; F(2, -1, z + 2, 15, -1, z + 2, 'minecraft:dirt_path') }
  F(1, 0, 1, 16, 0, 1, BDF); F(1, 0, 16, 16, 0, 16, BDF); F(1, 0, 2, 1, 0, 15, BDF); F(16, 0, 2, 16, 0, 15, BDF); S(8, 0, 16, 'minecraft:spruce_fence_gate[facing=south,in_wall=false,open=true,powered=false]')
  // bananiers et papayer
  bdBananier(20, 3, 4); bdBananier(25, 6, 5); bdBananier(21, 10, 4); bdBananier(28, 12, 3)
  // poulailler sur pattes
  ;[[3, 20], [8, 20], [3, 24], [8, 24]].forEach(c => F(c[0], 0, c[1], c[0], 1, c[1], BDLOG)); F(3, 2, 20, 8, 2, 24, BDPL); W(3, 20, 8, 24, 3, 4, bdMat(5, 22)); F(4, 3, 21, 7, 4, 23, AIR); for (var x = 2; x <= 9; x++) for (var z = 19; z <= 25; z++) S(x, 5, z, choix(BDT))
  S(5, 3, 24, AIR); S(5, 2, 25, btSt('spruce', 'north')); F(4, 3, 21, 7, 3, 21, 'minecraft:hay_block[axis=x]')
  W(2, 26, 12, 30, 0, 1, 'minecraft:iron_bars'); S(7, 0, 30, AIR); S(7, 1, 30, AIR)
  // enclos a chevres et abri
  W(15, 19, 28, 28, 0, 0, BDF); S(21, 0, 28, 'minecraft:spruce_fence_gate[facing=south,in_wall=false,open=false,powered=false]')
  ;[[24, 20], [27, 20], [24, 23], [27, 23]].forEach(c => F(c[0], 1, c[1], c[0], 3, c[1], BDLOG)); for (var x = 23; x <= 28; x++) for (var z = 19; z <= 24; z++) S(x, 4, z, choix(BDT)); F(24, 1, 21, 26, 1, 22, 'minecraft:hay_block[axis=x]')
  S(18, 0, 22, 'minecraft:cauldron'); S(17, 0, 25, 'minecraft:composter[level=4]')
  // cabane a outils
  F(19, 0, 13, 23, 0, 16, BDPL); W(19, 13, 23, 16, 1, 3, bdMat(20, 14)); F(20, 1, 14, 22, 3, 15, AIR); for (var x = 18; x <= 24; x++) for (var z = 12; z <= 17; z++) S(x, 4, z, choix(BDT)); PORTE(21, 1, 16, 'minecraft:spruce_door', 'south', 'left', 'false')
  S(20, 1, 14, 'minecraft:barrel[facing=up,open=false]'); S(22, 1, 14, 'minecraft:chest[facing=south,type=single,waterlogged=false]')
}

// ================= HANGAR-DORTOIR (vieux hangar portuaire cloisonne de baches, lits de camp, cuisine collective) =================
function bdDortoir() {
  bdSol(0, 0, 31, 31); ruBitume(0, 25, 31, 31)
  F(2, 0, 2, 29, 0, 22, 'minecraft:smooth_stone'); W(2, 2, 29, 22, 1, 7, RUC); for (var x = 2; x <= 29; x += 3) { F(x, 1, 2, x, 7, 2, RUO); F(x, 1, 22, x, 7, 22, RUO) }
  ruToit(2, 29, 2, 22, 8, 'waxed_weathered_cut_copper', RUC)
  F(13, 1, 22, 18, 5, 22, AIR); F(13, 5, 22, 18, 5, 22, 'minecraft:iron_trapdoor[facing=north,half=top,open=true,powered=false,waterlogged=false]')
  ;[6, 12, 19, 25].forEach(x => { if (R() < 0.7) F(x, 5, 2, x + 1, 6, 2, RUV) })
  // alveoles de baches
  ;[[3, 3, 9, 9], [10, 3, 16, 9], [17, 3, 23, 9], [24, 3, 28, 9], [3, 14, 9, 21], [21, 14, 28, 21]].forEach((a, i) => {
    var col = ['minecraft:blue_wool', 'minecraft:light_blue_wool', 'minecraft:gray_wool', 'minecraft:green_wool', 'minecraft:orange_wool', 'minecraft:blue_wool'][i]
    var zf = a[1] == 3 ? a[3] : a[1]
    F(a[0], 1, zf, a[2], 3, zf, col); F(a[0] + 2, 1, zf, a[0] + 3, 3, zf, AIR); F(a[2], 1, a[1], a[2], 3, a[3], col)
    vrLitS(a[0] + 1, 1, a[1] == 3 ? a[1] + 1 : a[3] - 1, ['red', 'blue', 'green', 'brown', 'orange', 'gray'][i], 'east')
    S(a[2] - 1, 1, a[1] == 3 ? a[1] + 1 : a[3] - 1, choix([RUBAR, 'minecraft:chest[facing=west,type=single,waterlogged=false]', 'supplementaries:sack']))
  })
  // cuisine collective et tables au centre
  F(11, 1, 14, 19, 1, 14, 'minecraft:smooth_stone_slab[type=top]'); S(12, 2, 14, 'minecraft:cauldron'); S(14, 1, 15, BDFEU); S(17, 2, 14, 'supplementaries:jar'); S(19, 1, 15, RUBAR)
  ;[11, 15].forEach(x => { F(x, 1, 18, x + 3, 1, 18, 'minecraft:spruce_slab[type=top]'); vrCh(x, 1, 17, 'south'); vrCh(x + 2, 1, 19, 'north') })
  ;[[8, 12], [16, 12], [24, 12]].forEach(c => ruSusp(c[0], 7, c[1]))
  // dehors : bacs de pluie, abri de rondins, foyer
  S(1, 0, 4, 'minecraft:cauldron'); S(30, 0, 4, 'minecraft:cauldron'); S(24, 0, 27, BDFEU); ;[[22, 27], [26, 27]].forEach(c => S(c[0], 0, c[1], 'minecraft:spruce_slab[type=bottom]'))
  bdLinge(3, 11, 26, 3); F(3, 0, 26, 3, 3, 26, BDF); F(11, 0, 26, 11, 3, 26, BDF)
}

var QFIN_BD2 = function () {
  HB2 = true; FIN = true; THM = THM_BD
  var rb = ['brown', 'orange', 'blue', 'green']
  HM = {}; bdRue(); finAncrage()
  lot(QF(bdBangas, null, rb), 0, 0, 999, 3011, 32, 7); lot(QF(bdFoyerJeunes, null, null), 32, 0, 999, 3021, 32, 25); lot(QF(bdLavoir, null, null), 64, 0, 999, 3031, 32, 15); lot(QF(bdMotos, null, null), 96, 0, 999, 3041, 32, 7)
  lot(QF(bdDoukas, null, rb), 0, 48, 999, 3051, 32, 7); lot(QF(bdTerrasses, null, rb), 32, 48, 999, 3061, 32, 12); lot(QF(bdJardins, null, rb), 64, 48, 999, 3071, 32, 7); lot(QF(bdDortoir, null, null), 96, 48, 999, 3081, 32, 18)
  vlog('FIN volets ' + FIN_NV + ' rideaux ' + FIN_NR + ' paves ' + PAVE_NB + ' retraits ancrage ' + ANC_NB)
  HB2 = false; FIN = false; THM = null; HM = {}
}
function vuesBidonville2() {
  vue('bd2_ensemble_sud', 0, 0, 64, 52, 120, 64, 8, 34, 3000)
  vue('bd2_ensemble_no', 0, 0, -30, 50, -30, 64, 6, 40, 3000)
  vue('bd2_bangas', 0, 0, 16, 12, 44, 16, 2, 12)
  vue('bd2_bangas_cour', 0, 0, 22, 4, 20, 14, 1.5, 12)
  vue('bd2_foyer', 32, 0, 16, 12, 44, 16, 6, 12)
  vue('bd2_foyer_salle', 32, 0, 15, 3.5, 18, 15, 2, 8)
  vue('bd2_lavoir', 64, 0, 16, 12, 44, 14, 5, 10)
  vue('bd2_motos', 96, 0, 16, 10, 40, 14, 2, 10)
  vue('bd2_doukas', 0, 48, 16, 8, 38, 16, 3, 14)
  vue('bd2_terrasses', 32, 48, 16, 14, 42, 16, 5, 12)
  vue('bd2_jardins', 64, 48, 16, 12, 42, 16, 1, 14)
  vue('bd2_dortoir', 96, 48, 16, 12, 44, 16, 6, 12)
  vue('bd2_dortoir_dedans', 96, 48, 16, 4, 20, 16, 2, 5)
}
