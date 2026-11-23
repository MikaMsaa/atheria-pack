// ================= QUARTIER ROUILLE, SERIE 3 : ZONE D'ACTIVITE DE LONGONI (distillerie d'ylang-ylang, station-service, centrale thermique, dechetterie, caserne de pompiers, depot de bus, gare maritime de la barge, centrale a beton, ateliers relais) =================
// rideau metallique de largeur x1..x2 sur la facade z, ouvert a moitie si mi
function ruRideau(x1, x2, z, y2, mi, f) {
  F(x1, 1, z, x2, y2, z, AIR)
  if (mi) F(x1, y2 - 1, z, x2, y2, z, 'minecraft:iron_trapdoor[facing=' + (f || 'north') + ',half=top,open=true,powered=false,waterlogged=false]')
  else F(x1, 1, z, x2, y2, z, 'minecraft:waxed_weathered_cut_copper')
}
// bus de 12 x 3 x 3 selon x, vitres continues, porte avant
function ruBus(x, y, z, c) {
  F(x, y, z, x + 11, y, z + 2, 'minecraft:black_concrete'); F(x, y + 1, z, x + 11, y + 3, z + 2, 'minecraft:' + c + '_concrete')
  F(x, y + 2, z, x + 11, y + 2, z, 'minecraft:black_stained_glass'); F(x, y + 2, z + 2, x + 11, y + 2, z + 2, 'minecraft:black_stained_glass'); F(x + 11, y + 2, z, x + 11, y + 2, z + 2, 'minecraft:black_stained_glass')
  F(x + 1, y + 1, z + 1, x + 10, y + 2, z + 1, AIR); S(x + 10, y + 1, z + 2, AIR)
  for (var k = x + 2; k <= x + 9; k += 2) S(k, y + 1, z + 1, 'minecraft:spruce_stairs[facing=east,half=bottom,shape=straight,waterlogged=false]')
}

// ================= DISTILLERIE D'YLANG-YLANG (hangar de briques, alambics de cuivre, cheminee, bois de chauffe, sechoir a fleurs) =================
function ruDistillerie() {
  ruSol(0, 0, 31, 31); ruBitume(0, 25, 31, 31)
  F(3, 0, 5, 22, 0, 20, RUS); W(3, 5, 22, 20, 1, 6, RUB); for (var x = 5; x <= 20; x += 4) { F(x, 2, 5, x + 1, 4, 5, RUV); F(x, 2, 20, x + 1, 4, 20, RUV) }
  ruToit(3, 22, 5, 20, 7, 'waxed_oxidized_cut_copper', RUB)
  F(11, 1, 20, 14, 5, 20, AIR); F(11, 6, 20, 14, 6, 20, RUM)
  // trois alambics : foyer de briques, cuve de cuivre, col de cygne, serpentin dans un bac
  ;[6, 12, 18].forEach(x => {
    F(x, 1, 8, x + 2, 1, 10, RUB); S(x + 1, 1, 10, 'minecraft:blast_furnace[facing=south,lit=false]')
    F(x, 2, 8, x + 2, 4, 10, 'minecraft:waxed_cut_copper'); S(x + 1, 5, 9, 'minecraft:waxed_copper_block'); S(x + 1, 6, 9, 'minecraft:waxed_cut_copper_slab[type=bottom,waterlogged=false]')
    F(x + 1, 6, 10, x + 1, 6, 12, 'minecraft:chain[axis=z]'); F(x, 1, 12, x + 2, 2, 15, 'minecraft:stone_bricks'); S(x + 1, 2, 13, 'minecraft:water'); S(x + 1, 2, 14, 'minecraft:water')
    S(x + 1, 3, 13, 'minecraft:chain[axis=y]'); S(x + 1, 4, 13, 'minecraft:chain[axis=y]'); S(x + 1, 5, 13, 'minecraft:chain[axis=y]'); S(x + 1, 6, 13, 'minecraft:chain[axis=z]')
  })
  // flacons d'essence, etabli, sacs de fleurs
  F(4, 1, 17, 9, 1, 17, 'minecraft:smooth_stone_slab[type=top]'); ;[4, 6, 8].forEach(x => S(x, 2, 17, 'supplementaries:jar')); S(5, 2, 17, 'minecraft:brewing_stand[has_bottle_0=false,has_bottle_1=false,has_bottle_2=false]')
  ;[[15, 17], [16, 17], [17, 18], [20, 17]].forEach(c => SA(c[0], 1, c[1], 'supplementaries:sack')); S(21, 1, 18, RUCOF.replace('south', 'west')); ;[8, 15].forEach(x => ruSusp(x, 9, 12))
  // cheminee de briques sur le pignon est
  F(23, 0, 11, 25, 16, 13, RUB); F(23, 17, 11, 25, 17, 13, 'minecraft:brick_wall'); S(24, 17, 12, AIR); S(24, 16, 12, 'minecraft:coal_block'); ;[6, 12].forEach(y => F(23, y, 11, 25, y, 13, RUM))
  // bois de chauffe sous appentis
  ;[[26, 4], [30, 4], [26, 9], [30, 9]].forEach(c => F(c[0], 0, c[1], c[0], 3, c[1], BDLOG)); F(25, 4, 3, 31, 4, 10, 'minecraft:spruce_slab[type=bottom]')
  for (var x = 27; x <= 29; x++) for (var z = 5; z <= 8; z++) F(x, 0, z, x, (x + z) % 2 ? 2 : 1, z, 'minecraft:oak_log[axis=z]')
  // sechoir a fleurs : claies sur treteaux
  ;[23, 26].forEach(z => { F(4, 0, z, 4, 1, z, BDF); F(12, 0, z, 12, 1, z, BDF); F(4, 2, z, 12, 2, z, 'minecraft:spruce_slab[type=bottom]'); for (var x = 5; x <= 11; x += 2) S(x, 3, z, 'minecraft:yellow_carpet') })
  S(16, 0, 24, 'minecraft:yellow_glazed_terracotta'); ;[[18, 27], [19, 27], [2, 2], [29, 1]].forEach(c => S(c[0], 0, c[1], RUBAR))
}

// ================= STATION-SERVICE (auvent sur piliers, ilots de pompes, boutique pillee, station de lavage) =================
function ruStation() {
  ruBitume(0, 0, 31, 31); for (var x = 2; x <= 29; x++) { S(x, -1, 30, 'minecraft:white_concrete') }
  // auvent
  ;[[8, 12], [8, 20], [22, 12], [22, 20]].forEach(c => F(c[0], 0, c[1], c[0], 5, c[1], 'minecraft:white_concrete'))
  F(5, 6, 10, 25, 6, 22, 'minecraft:white_concrete'); W(5, 10, 25, 22, 7, 7, 'minecraft:red_concrete'); F(6, 7, 11, 24, 7, 21, 'minecraft:smooth_stone_slab[type=bottom]')
  ;[[10, 16], [15, 16], [20, 16]].forEach(c => ruSusp(c[0], 5, c[1]))
  // ilots de pompes
  ;[11, 19].forEach(x => {
    F(x, -1, 13, x + 1, -1, 19, 'minecraft:smooth_stone'); F(x, 0, 13, x + 1, 0, 19, 'minecraft:smooth_stone_slab[type=bottom]')
    ;[14, 18].forEach(z => { F(x, 1, z, x + 1, 2, z, 'minecraft:red_concrete'); F(x, 3, z, x + 1, 3, z, 'minecraft:white_concrete'); S(x, 2, z - 1, 'minecraft:lever[face=wall,facing=north,powered=false]'); S(x + 1, 2, z + 1, 'minecraft:lever[face=wall,facing=south,powered=false]') })
  })
  bgVoiture(14, 15, 'z', 'red', 1); bgVoiture(23, 13, 'z', 'white', 1, true)
  // boutique pillee
  F(2, 0, 2, 17, 0, 8, RUS); W(2, 2, 17, 8, 1, 4, 'minecraft:white_concrete'); F(2, 5, 2, 17, 5, 8, RUSLS); W(2, 2, 17, 8, 4, 4, 'minecraft:red_concrete')
  F(4, 1, 8, 13, 3, 8, RUV); F(7, 1, 8, 9, 2, 8, AIR); S(8, 1, 8, AIR); F(4, 0, 9, 14, 0, 9, 'minecraft:smooth_stone_slab[type=bottom]')
  ;[3, 5].forEach(z => { for (var x = 4; x <= 12; x++) { S(x, 1, z, 'minecraft:spruce_slab[type=top]'); if (R() < 0.35) SA(x, 2, z, choix(['supplementaries:jar', RUBAR, 'supplementaries:sack'])) } })
  F(14, 1, 3, 16, 1, 3, 'minecraft:smooth_stone_slab[type=top]'); S(15, 2, 3, 'minecraft:observer[facing=south,powered=false]'); S(16, 1, 7, 'minecraft:white_concrete'); S(16, 2, 7, 'minecraft:iron_trapdoor[facing=west,half=bottom,open=true,powered=false,waterlogged=false]'); S(10, 4, 5, RUL)
  ;[[6, 6], [11, 4]].forEach(c => S(c[0], 0, c[1], 'minecraft:white_carpet'))
  // station de lavage a portique
  F(20, 0, 2, 29, 0, 8, 'minecraft:light_gray_concrete'); W(20, 2, 29, 8, 1, 5, 'minecraft:blue_concrete'); F(20, 6, 2, 29, 6, 8, RUSLS); F(21, 1, 8, 28, 4, 8, AIR); F(21, 1, 2, 28, 4, 2, AIR)
  F(23, 1, 4, 23, 4, 6, 'minecraft:light_blue_wool'); F(26, 1, 4, 26, 4, 6, 'minecraft:light_blue_wool'); F(23, 5, 4, 26, 5, 6, 'minecraft:iron_block')
  // gonfleur, poubelle, panneau de prix sans texte
  S(28, 0, 12, 'minecraft:yellow_concrete'); S(28, 1, 12, 'minecraft:yellow_concrete'); S(28, 1, 11, 'minecraft:lever[face=wall,facing=north,powered=false]'); S(3, 0, 12, 'minecraft:cauldron')
  F(28, 0, 26, 28, 6, 26, 'minecraft:iron_bars'); F(27, 7, 26, 29, 9, 26, 'minecraft:red_concrete'); F(27, 8, 26, 29, 8, 26, 'minecraft:white_concrete')
}

// ================= CENTRALE THERMIQUE (salle des moteurs, trois cheminees, aerorefrigerants, transformateurs) =================
function ruCentrale2() {
  ruSol(0, 0, 31, 31); ruBitume(0, 24, 31, 31)
  F(2, 0, 4, 24, 0, 18, RUS); W(2, 4, 24, 18, 1, 11, 'minecraft:light_gray_concrete'); W(2, 4, 24, 18, 1, 1, RUN)
  for (var x = 4; x <= 22; x += 3) { F(x, 7, 4, x + 1, 9, 4, RUV); F(x, 7, 18, x + 1, 9, 18, RUV) }
  F(2, 12, 4, 24, 12, 18, RUSLS); W(2, 4, 24, 18, 11, 11, 'minecraft:blue_concrete')
  ruRideau(10, 15, 18, 7, true, 'north')
  // groupes diesel : blocs moteurs alignes, passerelle
  ;[6, 12, 18].forEach(x => { F(x, 1, 7, x + 3, 3, 12, 'minecraft:green_concrete'); F(x + 1, 4, 8, x + 2, 4, 11, 'minecraft:iron_block'); F(x + 1, 5, 9, x + 2, 11, 10, 'minecraft:gray_concrete') })
  F(3, 6, 14, 23, 6, 15, 'minecraft:iron_trapdoor[facing=north,half=top,open=false,powered=false,waterlogged=false]'); F(3, 7, 14, 23, 7, 14, 'minecraft:iron_bars')
  F(3, 1, 15, 3, 6, 15, 'minecraft:ladder[facing=east,waterlogged=false]'); ;[8, 15, 21].forEach(x => ruSusp(x, 11, 13))
  // cheminees d'acier
  ;[7, 13, 19].forEach(x => { F(x + 1, 13, 9, x + 2, 26, 10, 'minecraft:light_gray_concrete'); F(x + 1, 22, 9, x + 2, 22, 10, 'minecraft:red_concrete'); F(x + 1, 25, 9, x + 2, 25, 10, 'minecraft:red_concrete'); S(x + 1, 26, 9, AIR) })
  // aerorefrigerants en toiture de l'annexe
  F(25, 0, 4, 30, 0, 18, RUS); W(25, 4, 30, 18, 1, 4, 'minecraft:light_gray_concrete'); F(25, 5, 4, 30, 5, 18, 'minecraft:light_gray_concrete')
  for (var z = 5; z <= 16; z += 4) { F(26, 6, z, 29, 6, z + 2, 'minecraft:iron_bars'); F(26, 7, z, 29, 7, z + 2, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false,powered=false,waterlogged=false]') }
  // transformateurs grillages devant
  for (var x = 2; x <= 22; x += 6) { F(x, 0, 21, x + 3, 2, 22, 'minecraft:gray_concrete'); F(x, 3, 21, x + 3, 3, 22, 'minecraft:iron_bars') }
  for (var x = 1; x <= 24; x++) { S(x, 0, 23, 'minecraft:iron_bars'); S(x, 1, 23, 'minecraft:iron_bars') }
  ;[[27, 26], [28, 26], [2, 2]].forEach(c => S(c[0], 0, c[1], RUBAR))
}

// ================= DECHETTERIE (quai haut, bennes, tas de ferraille et de pneus, broyeur, pont-bascule) =================
function ruDechets() {
  ruSol(0, 0, 31, 31); ruBitume(0, 18, 31, 31)
  // quai surélevé et rampe
  F(1, -1, 2, 30, 1, 9, 'minecraft:gray_concrete'); for (var x = 1; x <= 30; x++) S(x, 2, 9, 'minecraft:iron_bars')
  for (var k = 0; k <= 2; k++) F(26, -1, 12 + 2 * k, 30, 1 - k, 13 + 2 * k, 'minecraft:gray_concrete'); F(26, -1, 10, 30, 1, 11, 'minecraft:gray_concrete'); F(26, 2, 9, 30, 2, 9, AIR)
  // bennes en contrebas, le long du quai
  ;[2, 9, 16].forEach((x, i) => { var c = ['green', 'blue', 'yellow'][i]; W(x, 11, x + 5, 15, 0, 1, 'minecraft:' + c + '_concrete'); F(x + 1, 0, 12, x + 4, 0, 14, choix(['minecraft:gravel', 'minecraft:coarse_dirt', 'minecraft:white_wool', 'minecraft:brown_wool'])) })
  // tas de ferraille, pneus, frigos
  ;[[4, 4], [5, 5], [6, 4], [4, 6], [5, 4], [10, 5], [11, 6]].forEach(c => S(c[0], 2, c[1], choix(['minecraft:iron_block', 'minecraft:waxed_oxidized_cut_copper', 'minecraft:iron_bars', 'minecraft:anvil[facing=east]'])))
  ;[[15, 3], [16, 3], [15, 4], [17, 4]].forEach((c, i) => { for (var y = 2; y <= 2 + (i % 2); y++) S(c[0], y, c[1], 'minecraft:black_concrete') })
  ;[[21, 4], [23, 4], [21, 7]].forEach(c => { F(c[0], 2, c[1], c[0], 3, c[1], 'minecraft:white_concrete'); S(c[0] + 1, 2, c[1], 'minecraft:white_concrete') })
  // broyeur a portique
  F(4, 0, 20, 10, 3, 24, 'minecraft:orange_concrete'); F(5, 4, 21, 9, 4, 23, 'minecraft:iron_bars'); F(6, 3, 21, 8, 3, 23, AIR); F(11, 0, 22, 18, 0, 22, 'minecraft:black_concrete'); F(11, 1, 22, 18, 1, 22, 'minecraft:chain[axis=x]')
  // local d'accueil et pont-bascule
  F(21, 0, 20, 27, 0, 25, RUS); W(21, 20, 27, 25, 1, 3, 'minecraft:white_concrete'); F(21, 4, 20, 27, 4, 25, RUSLS); F(23, 2, 25, 25, 2, 25, RUV); PORTE(22, 1, 25, 'minecraft:iron_door', 'south', 'left', 'false'); vrBur(25, 1, 22, 'south'); vrCh(25, 1, 23, 'north'); S(24, 3, 22, RUL)
  F(13, -1, 26, 19, -1, 29, 'minecraft:iron_block'); F(13, -1, 26, 19, -1, 26, 'minecraft:yellow_concrete')
  bgVoiture(2, 27, 'x', 'white', 1)
}

// ================= CASERNE DE POMPIERS (remises a portes rouges, tour de sechage, logements, cour d'exercice) =================
function ruPompiers() {
  ruSol(0, 0, 31, 31); ruBitume(0, 18, 31, 31)
  F(2, 0, 4, 20, 0, 17, RUS); W(2, 4, 20, 17, 1, 6, RUB); F(2, 7, 4, 20, 7, 17, RUS); W(2, 4, 20, 17, 7, 11, 'minecraft:white_concrete'); F(2, 12, 4, 20, 12, 17, RUSLS)
  for (var x = 4; x <= 18; x += 3) F(x, 9, 17, x + 1, 10, 17, RUV)
  // trois portes de remise, une ouverte avec son fourgon
  ;[[4, 7], [10, 13], [16, 19]].forEach((q, i) => { if (i == 1) ruRideau(q[0], q[1], 17, 5, true, 'north'); else { F(q[0], 1, 17, q[1], 5, 17, 'minecraft:red_concrete'); F(q[0], 3, 17, q[1], 3, 17, 'minecraft:red_stained_glass_pane') } })
  F(10, 0, 9, 13, 0, 21, 'minecraft:black_concrete'); F(10, 1, 9, 13, 3, 21, 'minecraft:red_concrete'); F(10, 2, 21, 13, 2, 21, 'minecraft:black_stained_glass'); F(10, 4, 10, 13, 4, 18, 'minecraft:white_concrete'); F(11, 5, 11, 12, 5, 17, 'minecraft:rail[shape=north_south,waterlogged=false]')
  F(10, 1, 18, 13, 3, 20, 'minecraft:red_concrete'); F(10, 2, 19, 10, 2, 19, 'minecraft:black_stained_glass'); F(13, 2, 19, 13, 2, 19, 'minecraft:black_stained_glass')
  // interieur : casiers, tuyaux enroules
  for (var z = 5; z <= 16; z += 2) { S(3, 1, z, RUBAR); S(19, 1, z, choix([RUBAR, 'minecraft:red_wool', RUCOF.replace('south', 'west')])) }
  ;[[6, 6], [16, 6]].forEach(c => ruSusp(c[0], 6, c[1]))
  // etage : chambres, cuisine
  ;[[4, 8, 6], [8, 8, 6], [12, 8, 6]].forEach((c, i) => vrLitS(c[0], c[1], c[2], ['red', 'red', 'white'][i], 'east')); vrBur(17, 8, 7, 'south'); vrCh(17, 8, 8, 'north'); S(15, 8, 15, 'minecraft:smoker[facing=north,lit=false]'); S(16, 8, 15, 'minecraft:cauldron'); S(10, 11, 10, RUL)
  F(3, 1, 5, 3, 8, 5, 'minecraft:ladder[facing=east,waterlogged=false]'); S(3, 7, 5, 'minecraft:ladder[facing=east,waterlogged=false]')
  // tour de sechage des tuyaux
  F(22, 0, 4, 26, 18, 8, RUB); F(23, 1, 5, 25, 17, 7, AIR); F(22, 19, 4, 26, 19, 8, RUSLS); for (var y = 4; y <= 16; y += 4) { S(24, y, 4, RUV); S(26, y, 6, RUV) }
  F(24, 3, 6, 24, 17, 6, 'minecraft:chain[axis=y]'); PORTE(24, 1, 8, 'minecraft:spruce_door', 'south', 'left', 'false')
  // cour d'exercice : bouches, carcasse de voiture brulee
  S(28, 0, 12, 'minecraft:red_concrete'); S(28, 1, 12, 'minecraft:red_concrete'); S(28, 2, 12, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false,powered=false,waterlogged=false]')
  bgVoiture(23, 12, 'x', 'black', 1); ;[[29, 27], [30, 27], [1, 1]].forEach(c => S(c[0], 0, c[1], RUBAR))
}

// ================= DEPOT DE BUS (grande halle ouverte sur deux pignons, fosse, bus abandonnes, pompe a gazole) =================
function ruDepotBus() {
  ruBitume(0, 0, 31, 31)
  F(1, 0, 3, 30, 0, 3, RUB); F(1, 0, 22, 30, 0, 22, RUB); for (var x = 1; x <= 30; x += 4) { F(x, 1, 3, x, 8, 3, RUB); F(x, 1, 22, x, 8, 22, RUB) }
  F(1, 1, 3, 30, 3, 3, RUB); F(1, 1, 22, 30, 3, 22, RUB); for (var x = 2; x <= 29; x++) if ((x - 1) % 4) { F(x, 4, 3, x, 7, 3, RUV); F(x, 4, 22, x, 7, 22, RUV) }
  ruToit(1, 30, 3, 22, 9, 'waxed_weathered_cut_copper', null)
  for (var x = 1; x <= 30; x += 4) F(x, 9, 4, x, 9, 21, RUC)
  // trois bus alignes, un sur fosse
  ruBus(3, 0, 6, 'white'); ruBus(3, 0, 11, 'yellow'); ruBus(16, 0, 11, 'blue')
  F(17, -1, 6, 26, -1, 8, 'minecraft:black_concrete'); F(16, -1, 5, 27, -1, 5, 'minecraft:yellow_concrete'); F(16, -1, 9, 27, -1, 9, 'minecraft:yellow_concrete')
  // atelier : etablis, pneus, armoires
  for (var x = 3; x <= 12; x++) vrCpt(x, 1, 20, 'north', 'smooth_stone'); S(5, 2, 20, 'supplementaries:jar'); S(9, 1, 19, 'minecraft:anvil[facing=east]')
  ;[[15, 19], [16, 19], [15, 20], [16, 20]].forEach((c, i) => { for (var y = 1; y <= 1 + (i % 2); y++) S(c[0], y, c[1], 'minecraft:black_concrete') })
  ;[[24, 20], [25, 20], [26, 20], [27, 20]].forEach((c, i) => S(c[0], 1, c[1], [RUBAR, RUCOF.replace('south', 'north'), RUBAR, 'minecraft:grindstone[face=floor,facing=north]'][i]))
  ;[[8, 9], [22, 9], [8, 16], [22, 16]].forEach(c => ruSusp(c[0], 8, c[1]))
  // pompe a gazole et bus rouille dehors
  S(28, 0, 26, 'minecraft:red_concrete'); S(28, 1, 26, 'minecraft:red_concrete'); S(28, 2, 26, 'minecraft:white_concrete'); S(28, 1, 27, 'minecraft:lever[face=wall,facing=south,powered=false]')
  ruBus(3, 0, 26, 'brown'); F(9, 4, 26, 11, 4, 28, AIR); S(4, 2, 26, AIR)
}

// ================= GARE MARITIME DE LA BARGE (hall d'attente vitre, passerelle, rampe des vehicules, barge a quai) =================
function ruBarge() {
  ruBitume(0, 9, 31, 31); rpBassin(0, 7)
  // barge : coque plate, rampe abaissee, cabine haute
  F(4, -1, 1, 23, -1, 5, 'minecraft:white_concrete'); F(4, 0, 1, 23, 0, 1, 'minecraft:white_concrete'); F(4, 0, 5, 23, 0, 5, 'minecraft:white_concrete'); F(4, 0, 1, 4, 0, 5, 'minecraft:white_concrete'); F(4, 1, 1, 23, 1, 1, 'minecraft:blue_concrete'); F(4, 1, 5, 23, 1, 5, 'minecraft:blue_concrete')
  F(5, 0, 2, 22, 0, 4, 'minecraft:gray_concrete'); F(24, -1, 2, 26, -1, 4, 'minecraft:iron_block'); F(23, 0, 2, 23, 0, 4, 'minecraft:iron_block')
  F(10, 2, 1, 16, 5, 2, 'minecraft:white_concrete'); F(10, 4, 1, 16, 4, 1, 'minecraft:black_stained_glass'); F(10, 6, 1, 16, 6, 2, 'minecraft:smooth_stone_slab[type=bottom]'); F(13, 7, 1, 13, 9, 1, 'minecraft:iron_bars')
  bgVoiture(5, 3, 'x', 'red', 1, true); bgVoiture(17, 3, 'x', 'gray', 1, true); S(11, 1, 9, AIR)
  // rampe des vehicules
  F(25, -1, 8, 29, -1, 8, 'minecraft:iron_block'); F(24, 0, 8, 30, 0, 8, AIR)
  // hall d'attente vitre
  F(2, 0, 12, 20, 0, 22, RUS); W(2, 12, 20, 22, 1, 1, 'minecraft:white_concrete'); W(2, 12, 20, 22, 2, 5, 'minecraft:light_blue_stained_glass'); ;[2, 8, 14, 20].forEach(x => { F(x, 1, 12, x, 5, 12, 'minecraft:white_concrete'); F(x, 1, 22, x, 5, 22, 'minecraft:white_concrete') })
  F(1, 6, 11, 21, 6, 23, 'minecraft:white_concrete'); F(2, 7, 12, 20, 7, 22, 'minecraft:smooth_stone_slab[type=bottom]'); F(9, 1, 22, 12, 4, 22, AIR); F(9, 1, 12, 12, 4, 12, AIR)
  for (var z = 14; z <= 20; z += 3) for (var x = 4; x <= 17; x++) if (x != 10 && x != 11) S(x, 1, z, 'minecraft:spruce_stairs[facing=north,half=bottom,shape=straight,waterlogged=false]')
  F(17, 1, 21, 19, 1, 21, 'minecraft:smooth_stone_slab[type=top]'); vrCh(18, 1, 20, 'north'); S(19, 1, 13, RUCOF.replace('south', 'west')); ;[[6, 17], [15, 17]].forEach(c => ruSusp(c[0], 5, c[1]))
  ;[[5, 15], [13, 18], [7, 21]].forEach(c => SA(c[0], 1, c[1], choix(['supplementaries:sack', 'minecraft:brown_wool', RUBAR])))
  // passerelle pietons couverte vers la barge
  F(9, 0, 8, 12, 0, 11, 'minecraft:smooth_stone'); ;[9, 12].forEach(x => { F(x, 1, 8, x, 3, 11, 'minecraft:iron_bars') }); F(9, 4, 8, 12, 4, 11, RUSLC)
  // file des vehicules en attente
  for (var z = 13; z <= 29; z++) { S(23, -1, z, 'minecraft:white_concrete'); S(30, -1, z, 'minecraft:white_concrete') }
  bgVoiture(25, 14, 'z', 'blue', 1); bgVoiture(26, 22, 'z', 'white', 1)
  ;[[3, 26], [4, 26], [16, 27]].forEach(c => S(c[0], 0, c[1], RUBAR))
}

// ================= CENTRALE A BETON (tour de malaxage, tremies, tapis incline, toupies, tas d'agregats) =================
function ruBeton() {
  ruSol(0, 0, 31, 31); ruBitume(0, 22, 31, 31)
  // tas d'agregats separes par des murs de blocs
  ;[2, 9, 16].forEach((x, i) => { F(x - 1, 0, 2, x - 1, 2, 9, RUA); var m = ['minecraft:gravel', 'minecraft:sand', 'minecraft:cobblestone'][i]; for (var a = 0; a <= 5; a++) for (var b = 0; b <= 7; b++) { var h = Math.max(0, 2 - Math.floor(Math.abs(a - 2.5) / 1.5) - Math.floor(Math.abs(b - 3.5) / 2.5)); if (h >= 0) F(x + a, 0, 2 + b, x + a, h, 2 + b, m) } })
  F(22, 0, 2, 22, 2, 9, RUA)
  // tour de malaxage sur pilotis
  ;[[23, 3], [29, 3], [23, 9], [29, 9]].forEach(c => F(c[0], 0, c[1], c[0], 7, c[1], RPY))
  F(23, 8, 3, 29, 14, 9, 'minecraft:light_gray_concrete'); F(24, 11, 3, 28, 12, 3, RUV); F(23, 15, 3, 29, 15, 9, RUSLS)
  F(25, 4, 5, 27, 7, 7, 'minecraft:gray_concrete'); S(26, 3, 6, 'minecraft:hopper[enabled=true,facing=down]')
  // tremies et tapis incline vers le haut de la tour
  for (var k = 0; k <= 9; k++) F(13 + k, 2 + k, 11, 13 + k, 2 + k, 12, 'minecraft:black_concrete'); ;[3, 6, 9].forEach(k => { F(13 + k, 0, 11, 13 + k, 1 + k, 11, 'minecraft:iron_bars'); F(13 + k, 0, 12, 13 + k, 1 + k, 12, 'minecraft:iron_bars') })
  F(9, 0, 10, 13, 2, 13, 'minecraft:waxed_oxidized_cut_copper'); F(10, 2, 11, 12, 2, 12, AIR); S(11, 1, 11, 'minecraft:hopper[enabled=true,facing=down]')
  // silos a ciment
  ruRond(18, 17, 5, 0, 12, RPW, false); ruRond(18, 17, 5, 13, 13, 'minecraft:smooth_stone_slab[type=bottom]', true)
  // camions toupies
  ;[[2, 15, 'orange'], [2, 24, 'white']].forEach(t => {
    F(t[0], 0, t[1], t[0] + 9, 0, t[1] + 2, 'minecraft:black_concrete'); F(t[0] + 7, 1, t[1], t[0] + 9, 3, t[1] + 2, 'minecraft:' + t[2] + '_concrete'); F(t[0] + 8, 2, t[1], t[0] + 9, 2, t[1] + 2, 'minecraft:black_stained_glass')
    F(t[0] + 1, 1, t[1], t[0] + 6, 3, t[1] + 2, 'minecraft:light_gray_concrete'); F(t[0] + 2, 4, t[1] + 1, t[0] + 5, 4, t[1] + 1, 'minecraft:light_gray_concrete'); F(t[0] + 1, 2, t[1], t[0] + 6, 2, t[1], 'minecraft:' + t[2] + '_terracotta'); F(t[0] + 1, 2, t[1] + 2, t[0] + 6, 2, t[1] + 2, 'minecraft:' + t[2] + '_terracotta')
  })
  // bungalow de chantier
  F(23, 0, 23, 30, 0, 27, RUS); W(23, 23, 30, 27, 1, 3, 'minecraft:white_concrete'); F(23, 4, 23, 30, 4, 27, RUSLS); F(25, 2, 27, 28, 2, 27, RUV); PORTE(24, 1, 23, 'minecraft:iron_door', 'north', 'left', 'false')
  vrBur(28, 1, 25, 'south'); vrCh(28, 1, 26, 'north'); S(26, 3, 25, RUL)
}

// ================= ATELIERS RELAIS (rangee de cinq cellules artisanales a rideaux metalliques, cour de livraison) =================
function ruAteliers() {
  ruSol(0, 0, 31, 31); ruBitume(0, 17, 31, 31)
  F(1, 0, 2, 30, 0, 15, RUS); W(1, 2, 30, 15, 1, 6, RUC); F(1, 7, 2, 30, 7, 15, RUSLC); W(1, 2, 30, 15, 6, 6, RUO)
  for (var x = 7; x <= 25; x += 6) F(x, 1, 3, x, 6, 14, 'minecraft:light_gray_concrete')
  // cinq cellules : chacune son metier
  ;[1, 7, 13, 19, 25].forEach((x, i) => {
    var ouvert = i != 2, a = x + 1, b = x + 4
    if (ouvert) ruRideau(a, b, 15, 4, true, 'north'); else F(a, 1, 15, b, 4, 15, 'minecraft:waxed_weathered_cut_copper')
    F(x + 5, 1, 15, x + 5, 2, 15, AIR); PORTE(x + 5, 1, 15, 'minecraft:iron_door', 'south', 'left', 'false'); S(x + 3, 5, 9, RUL)
    if (i == 0) { S(a, 1, 4, 'minecraft:anvil[facing=east]'); S(a + 1, 1, 4, 'minecraft:smithing_table'); S(a + 2, 1, 4, 'minecraft:blast_furnace[facing=south,lit=false]'); for (var z = 6; z <= 11; z += 2) S(b, 1, z, 'minecraft:iron_bars') }
    if (i == 1) { for (var z = 4; z <= 12; z += 2) { S(a, 1, z, 'minecraft:spruce_planks'); S(a, 2, z, 'minecraft:spruce_slab[type=bottom]') } S(b, 1, 4, 'minecraft:stonecutter[facing=south]'); S(b, 1, 6, 'minecraft:crafting_table'); F(a + 2, 1, 9, a + 2, 3, 9, 'minecraft:oak_log[axis=y]') }
    if (i == 2) { S(a, 1, 4, RUBAR); S(b, 1, 4, RUBAR); SA(a + 1, 1, 6, 'supplementaries:sack') }
    if (i == 3) { bgVoiture(a, 7, 'z', 'green', 1, true); S(b, 1, 4, 'minecraft:grindstone[face=floor,facing=south]'); S(b, 1, 5, RUCOF) }
    if (i == 4) { F(a, 1, 4, b, 1, 4, 'minecraft:smooth_stone_slab[type=top]'); S(a, 2, 4, 'minecraft:loom'); S(a + 2, 2, 4, 'supplementaries:jar'); for (var z = 7; z <= 11; z += 2) S(b, 1, z, choix(['minecraft:white_wool', 'minecraft:red_wool', 'minecraft:blue_wool'])) }
  })
  // cour : palettes, camionnette, bennes
  ;[[3, 19], [4, 19], [3, 20]].forEach(c => S(c[0], 0, c[1], 'minecraft:spruce_slab[type=bottom]')); SA(3, 1, 19, 'supplementaries:sack')
  F(10, 0, 20, 15, 0, 22, 'minecraft:black_concrete'); F(10, 1, 20, 15, 3, 22, 'minecraft:white_concrete'); F(14, 2, 20, 15, 2, 22, 'minecraft:black_stained_glass')
  W(22, 19, 27, 22, 0, 1, 'minecraft:green_concrete'); F(23, 0, 20, 26, 0, 21, 'minecraft:gravel')
  for (var x = 2; x <= 28; x += 6) S(x, -1, 27, 'minecraft:white_concrete')
}

var QFIN_RU3 = function () {
  HB2 = true; FIN = true; THM = THM_RU
  var rc = ['white', 'light_gray', 'brown']
  HM = {}; ruRue(); finAncrage()
  lot(QF(ruDistillerie, null, null), 0, 0, 999, 4911, 32, 18); lot(QF(ruStation, null, null), 32, 0, 999, 4921, 32, 10); lot(QF(ruCentrale2, null, null), 64, 0, 999, 4931, 32, 27); lot(QF(ruDechets, null, null), 96, 0, 999, 4941, 32, 6)
  lot(QF(ruPompiers, null, rc), 0, 48, 999, 4951, 32, 20); lot(QF(ruDepotBus, null, null), 32, 48, 999, 4961, 32, 19); lot(QF(ruBarge, null, null), 64, 48, 999, 4971, 32, 10); lot(QF(ruBeton, null, null), 96, 48, 999, 4981, 32, 16)
  lot(QF(ruAteliers, null, null), 128, 48, 999, 4991, 32, 8)
  vlog('FIN volets ' + FIN_NV + ' rideaux ' + FIN_NR + ' paves ' + PAVE_NB + ' retraits ancrage ' + ANC_NB)
  HB2 = false; FIN = false; THM = null; HM = {}
}
function vuesRouille3() {
  vue('ru3_ensemble_sud', 0, 0, 80, 44, 118, 80, 4, 36, 3000)
  vue('ru3_ensemble_no', 0, 0, -24, 44, -24, 80, 4, 40, 3000)
  vue('ru3_distillerie', 0, 0, 16, 12, 46, 14, 4, 12)
  vue('ru3_distillerie_alambics', 0, 0, 12, 4, 18, 12, 3, 9)
  vue('ru3_station', 32, 0, 16, 12, 46, 16, 3, 12)
  vue('ru3_centrale', 64, 0, 16, 18, 48, 14, 10, 10)
  vue('ru3_dechets', 96, 0, 16, 12, 44, 16, 1, 10)
  vue('ru3_pompiers', 0, 48, 14, 14, 44, 12, 6, 10)
  vue('ru3_depot_bus', 32, 48, 16, 10, 40, 16, 3, 12)
  vue('ru3_depot_dedans', 32, 48, 29, 6, 13, 8, 2, 13)
  vue('ru3_barge', 64, 48, 16, 12, 40, 14, 2, 8)
  vue('ru3_barge_quai', 64, 48, 36, 10, -10, 14, 1, 4)
  vue('ru3_beton', 96, 48, 14, 14, 42, 18, 6, 10)
  vue('ru3_ateliers', 128, 48, 16, 12, 42, 16, 3, 10)
}
