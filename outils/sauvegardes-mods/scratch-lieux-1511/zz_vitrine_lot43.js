// ================= QUARTIER ROUILLE, SERIE 2 : LE PORT DE LONGONI (capitainerie, parc a conteneurs, portique, criee, entrepot frigorifique, chantier naval, depot de carburant, poste de la PAF) =================
var RPW = 'minecraft:white_concrete', RPG = 'minecraft:light_gray_concrete', RPY = 'minecraft:yellow_concrete', RPEAU = 'minecraft:water'
var RPCOUL = ['red', 'blue', 'orange', 'green', 'white', 'cyan', 'brown', 'light_gray', 'gray']
var RPBARB = 'simply_traps:circular_barbed_wire_iron'
// conteneur de 6 x 3 x 3, nervures sur les longs cotes, portes a une extremite ; ouvert = portes absentes et coffre au fond
function rpCont(x, y, z, ax, c, ouvert) {
  var lx = ax == 'x' ? 6 : 3, lz = ax == 'x' ? 3 : 6, m = 'minecraft:' + c + '_concrete', n = 'minecraft:' + c + '_terracotta'
  F(x, y, z, x + lx - 1, y + 2, z + lz - 1, m)
  if (ax == 'x') { for (var i = 1; i < 6; i += 2) { F(x + i, y, z, x + i, y + 2, z, n); F(x + i, y, z + 2, x + i, y + 2, z + 2, n) } }
  else { for (var i = 1; i < 6; i += 2) { F(x, y, z + i, x, y + 2, z + i, n); F(x + 2, y, z + i, x + 2, y + 2, z + i, n) } }
  if (ouvert) {
    if (ax == 'x') { F(x + 1, y, z + 1, x + 5, y + 1, z + 1, AIR); S(x + 1, y, z + 1, RUCOF.replace('south', 'east')) }
    else { F(x + 1, y, z + 1, x + 1, y + 1, z + 5, AIR); S(x + 1, y, z + 1, RUCOF) }
  } else {
    if (ax == 'x') S(x + 5, y + 1, z + 1, 'minecraft:iron_bars'); else S(x + 1, y + 1, z + 5, 'minecraft:iron_bars')
  }
}
function rpPile(x, z, ax, n) { for (var k = 0; k < n; k++) rpCont(x, k * 3, z, ax, choix(RPCOUL), k == 0 && R() < 0.3) }
function rpBitte(x, z) { S(x, 0, z, 'minecraft:polished_blackstone_wall'); S(x, 1, z, 'minecraft:polished_blackstone_button[face=floor,facing=north,powered=false]') }
// bassin : eau sur les rangs z1..z2, quai de pierre en bordure
function rpBassin(z1, z2) {
  F(0, -1, z1, 31, -1, z2, RPEAU); F(0, 0, z1, 31, 0, z2, AIR)
  F(0, -1, z2 + 1, 31, -1, z2 + 1, 'minecraft:stone_bricks'); F(0, 0, z2 + 1, 31, 0, z2 + 1, 'minecraft:smooth_stone_slab[type=bottom]')
  for (var x = 3; x <= 29; x += 8) rpBitte(x, z2 + 2)
}

// ================= CAPITAINERIE (tour de controle a vigie vitree, annexe de bureaux, mat de signaux) =================
function ruCapitainerie() {
  ruSol(0, 0, 31, 31); ruBitume(0, 21, 31, 31)
  // tour : 4 niveaux de bureaux
  F(4, 0, 6, 13, 0, 15, RUS); W(4, 6, 13, 15, 1, 16, RPW); W(4, 6, 13, 15, 1, 2, RUB)
  for (var k = 1; k <= 4; k++) {
    var y = k * 4; F(5, y, 7, 12, y, 14, RUS); S(5, y, 7, AIR)
    if (k < 4) { for (var a = 5; a <= 12; a++) if (a != 8 && a != 9) { if (R() < 0.85) { S(a, y - 1, 6, RUV); S(a, y - 1, 15, RUV) } } for (var a = 7; a <= 14; a++) if (R() < 0.85) { S(4, y - 1, a, RUV); S(13, y - 1, a, RUV) } }
    F(4, y, 6, 13, y, 6, 'minecraft:light_blue_concrete'); F(4, y, 15, 13, y, 15, 'minecraft:light_blue_concrete')
  }
  F(5, 1, 7, 5, 16, 7, 'minecraft:ladder[facing=south,waterlogged=false]')
  // vigie : salle vitree en encorbellement
  F(3, 17, 5, 14, 17, 16, RUS); W(3, 5, 14, 16, 18, 20, 'minecraft:light_blue_stained_glass'); ;[[3, 5], [14, 5], [3, 16], [14, 16]].forEach(c => F(c[0], 18, c[1], c[0], 20, c[1], RPW))
  F(2, 21, 4, 15, 21, 17, 'minecraft:smooth_stone_slab[type=bottom]'); F(4, 21, 6, 13, 21, 15, RPW); S(5, 17, 7, AIR); F(5, 17, 7, 5, 17, 7, 'minecraft:ladder[facing=south,waterlogged=false]')
  ;[5, 8, 11].forEach(x => { if (R() < 0.4) S(x, 19, 5, AIR) })
  vrBur(8, 18, 7, 'north'); vrCh(8, 18, 8, 'south'); S(10, 18, 7, 'minecraft:cartography_table'); S(11, 18, 7, 'minecraft:lectern[facing=south,has_book=false,powered=false]'); S(12, 18, 14, RUCOF.replace('south', 'west'))
  S(9, 18, 14, 'minecraft:spruce_slab[type=bottom]'); S(8, 20, 11, RUL)
  // radar et mat
  F(8, 22, 10, 8, 26, 10, 'minecraft:iron_bars'); F(6, 27, 10, 10, 27, 10, 'minecraft:light_gray_concrete'); S(8, 27, 10, RUI); F(8, 28, 10, 8, 30, 10, 'minecraft:lightning_rod[facing=up,powered=false,waterlogged=false]')
  // bureaux du rez et des etages
  PORTE(9, 1, 15, 'minecraft:iron_door', 'south', 'left', 'false'); F(8, 4, 16, 10, 4, 17, RUSLS)
  ;[1, 5, 9, 13].forEach((y, i) => { vrBur(11, y, 13, 'north'); vrCh(11, y, 12, 'south'); vrArm(12, y, 8, 'west'); if (i % 2) S(7, y, 13, RUBAR); else SA(7, y, 9, 'supplementaries:sack'); S(9, y + 2, 10, RUL) })
  // annexe basse : salle radio et douane portuaire
  F(14, 0, 8, 27, 0, 15, RUS); W(14, 8, 27, 15, 1, 4, RUB); F(14, 5, 8, 27, 5, 15, RUS); W(14, 8, 27, 15, 6, 6, RUSLS)
  for (var x = 16; x <= 26; x += 3) { F(x, 2, 15, x + 1, 3, 15, RUV); F(x, 2, 8, x + 1, 3, 8, RUV) }
  PORTE(21, 1, 15, 'minecraft:spruce_door', 'south', 'left', 'false')
  F(15, 1, 9, 26, 1, 9, 'minecraft:smooth_stone_slab[type=top]'); ;[16, 19, 22, 25].forEach(x => { S(x, 2, 9, choix(['minecraft:loom', 'minecraft:note_block', 'minecraft:jukebox', 'minecraft:observer[facing=south,powered=false]'])); vrCh(x, 1, 10, 'north') })
  vrArm(26, 1, 14, 'west'); S(15, 1, 14, RUCOF.replace('south', 'east')); S(20, 4, 12, RUL)
  F(24, 6, 10, 26, 7, 12, 'minecraft:light_gray_concrete'); S(25, 8, 11, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false,powered=false,waterlogged=false]')
  // mat de signaux et parking
  F(27, 0, 22, 27, 12, 22, 'minecraft:iron_bars'); F(24, 10, 22, 30, 10, 22, 'minecraft:iron_bars'); S(24, 9, 22, 'minecraft:red_wool'); S(30, 9, 22, 'minecraft:yellow_wool'); S(27, 13, 22, 'minecraft:white_wool')
  for (var x = 2; x <= 20; x += 4) S(x, -1, 26, 'minecraft:white_concrete')
  bgVoiture(3, 27, 'z', 'white', 1); bgVoiture(11, 27, 'z', 'blue', 1)
  ;[[29, 3], [30, 4], [1, 18]].forEach(c => S(c[0], 0, c[1], RUBAR))
}

// ================= PARC A CONTENEURS (piles de conteneurs, cavalier, guerite, camion a quai) =================
function ruConteneurs() {
  ruBitume(0, 0, 31, 31)
  for (var x = 0; x <= 31; x++) { S(x, 0, 0, 'minecraft:iron_bars'); S(x, 1, 0, 'minecraft:iron_bars'); if (x % 4 == 0) S(x, 2, 0, RPBARB) }
  for (var z = 1; z <= 20; z++) { S(0, 0, z, 'minecraft:iron_bars'); S(0, 1, z, 'minecraft:iron_bars') }
  // marquages au sol
  for (var x = 1; x <= 30; x++) { S(x, -1, 10, 'minecraft:yellow_concrete'); S(x, -1, 21, 'minecraft:yellow_concrete') }
  ;[2, 9, 16, 23].forEach((x, i) => { rpPile(x, 2, 'x', 1 + Math.floor(R() * 3)); rpPile(x, 6, 'x', 1 + Math.floor(R() * 3)) })
  ;[2, 9, 16].forEach(x => { rpPile(x, 13, 'x', 1 + Math.floor(R() * 2)); rpPile(x, 17, 'x', 1 + Math.floor(R() * 3)) })
  rpCont(24, 0, 13, 'x', 'red', true); rpCont(25, 0, 17, 'x', 'blue', true)
  // cavalier gerbeur (reach stacker) dans l'allee
  F(13, 0, 11, 19, 1, 12, RPY); F(14, 2, 11, 15, 3, 12, 'minecraft:black_stained_glass'); S(13, 2, 11, RPY); F(16, 2, 11, 19, 2, 12, RPY)
  F(13, 3, 12, 19, 3, 12, RPY); F(19, 4, 12, 23, 6, 12, RPY); F(23, 7, 11, 23, 7, 12, 'minecraft:iron_block')
  ;[13, 18].forEach(x => { S(x, 0, 10, 'minecraft:black_concrete'); S(x, 0, 13, 'minecraft:black_concrete') })
  // portail, guerite et barriere
  F(26, 0, 22, 30, 3, 26, RPG); F(27, 1, 22, 29, 2, 22, RUV); F(27, 1, 26, 29, 2, 26, RUV); F(26, 1, 24, 26, 1, 24, AIR); S(26, 1, 24, AIR); S(26, 2, 24, AIR)
  F(26, 4, 21, 30, 4, 27, RUSLS); vrBur(28, 1, 23, 'south'); vrCh(28, 1, 24, 'north'); S(29, 1, 25, RUCOF.replace('south', 'west')); S(28, 3, 25, RUL)
  S(24, 0, 24, 'minecraft:red_concrete'); for (var x = 18; x <= 23; x++) S(x, 1, 24, x % 2 ? 'minecraft:red_concrete' : 'minecraft:white_concrete'); F(18, 0, 24, 18, 0, 24, 'minecraft:iron_bars')
  // camion porte-conteneur a l'arret
  F(1, 0, 25, 12, 0, 27, 'minecraft:black_concrete'); rpCont(1, 1, 25, 'x', 'orange', false); rpCont(7, 1, 25, 'x', 'orange', false)
  F(13, 0, 25, 15, 3, 27, 'minecraft:blue_concrete'); F(14, 2, 25, 15, 2, 27, 'minecraft:black_stained_glass')
  ;[[1, 29], [2, 29], [1, 30]].forEach(c => S(c[0], 0, c[1], RUBAR)); S(30, 0, 30, 'minecraft:spruce_slab[type=bottom]')
}

// ================= PORTIQUE DE QUAI (grue a conteneurs sur rails, bassin, conteneur suspendu) =================
function ruPortique() {
  ruBitume(0, 9, 31, 31); rpBassin(0, 7)
  // barge amarree
  F(4, -1, 1, 22, -1, 5, 'minecraft:dark_oak_planks'); F(4, 0, 1, 22, 0, 1, 'minecraft:dark_oak_planks'); F(4, 0, 5, 22, 0, 5, 'minecraft:dark_oak_planks'); F(4, 0, 2, 4, 0, 4, 'minecraft:dark_oak_planks'); F(22, 0, 2, 22, 0, 4, 'minecraft:dark_oak_planks')
  F(5, 0, 2, 21, 0, 4, 'minecraft:spruce_slab[type=bottom]'); rpCont(6, 1, 2, 'x', 'green', false); rpCont(13, 1, 2, 'x', 'white', false)
  F(23, -1, 4, 25, -1, 4, 'minecraft:chain[axis=x]')
  // rails
  for (var x = 0; x <= 31; x++) { S(x, 0, 10, 'minecraft:rail[shape=east_west,waterlogged=false]'); S(x, 0, 20, 'minecraft:rail[shape=east_west,waterlogged=false]') }
  // pieds, traverses, poutres de fleche
  ;[[9, 11], [22, 11], [9, 19], [22, 19]].forEach(c => { F(c[0], 0, c[1], c[0] + 1, 17, c[1], RPY); S(c[0], 0, c[1] + (c[1] == 11 ? -1 : 1), 'minecraft:black_concrete') })
  F(9, 9, 11, 23, 9, 11, RPY); F(9, 9, 19, 23, 9, 19, RPY)
  F(9, 18, 0, 10, 18, 24, RPY); F(22, 18, 0, 23, 18, 24, RPY)
  for (var z = 0; z <= 24; z += 4) F(11, 18, z, 21, 18, z, 'minecraft:iron_bars')
  F(9, 19, 19, 10, 24, 19, RPY); F(22, 19, 19, 23, 24, 19, RPY); F(9, 25, 19, 23, 25, 19, RPY)
  // cabine de machinerie et cabine de conduite
  F(12, 19, 18, 20, 22, 24, RPW); F(13, 20, 18, 19, 21, 18, RUV); F(12, 23, 18, 20, 23, 24, RUSLS); S(16, 22, 21, RUL)
  F(14, 15, 3, 18, 17, 6, RPW); F(15, 16, 3, 17, 16, 3, 'minecraft:black_stained_glass')
  // chariot et conteneur suspendu au-dessus du bassin
  F(13, 17, 8, 19, 17, 9, RUI); F(16, 9, 8, 16, 16, 8, 'minecraft:chain[axis=y]'); F(13, 8, 7, 19, 8, 9, RPY); rpCont(13, 5, 7, 'x', 'red', false)
  // echelles et escaliers des pieds
  F(11, 1, 11, 11, 17, 11, 'minecraft:ladder[facing=east,waterlogged=false]')
  // conteneurs en attente sur le quai, pointes
  rpPile(2, 22, 'x', 2); rpPile(24, 22, 'x', 1); rpCont(13, 0, 26, 'x', 'blue', true)
  ;[[26, 28], [27, 28], [28, 29]].forEach(c => S(c[0], 0, c[1], RUBAR)); S(2, 0, 28, 'minecraft:yellow_concrete'); S(2, 1, 28, 'minecraft:iron_bars')
}

// ================= CRIEE (halle ouverte a poteaux de fonte, etals, bateau tire au sec) =================
function ruCriee() {
  ruSol(0, 0, 31, 31); ruBitume(0, 25, 31, 31)
  // dalle carrelee
  for (var x = 3; x <= 28; x++) for (var z = 6; z <= 22; z++) S(x, -1, z, (x + z) % 2 ? 'minecraft:white_concrete' : 'minecraft:light_blue_terracotta')
  for (var x = 3; x <= 28; x += 5) { F(x, 0, 6, x, 6, 6, 'minecraft:polished_basalt[axis=y]'); F(x, 0, 22, x, 6, 22, 'minecraft:polished_basalt[axis=y]') }
  F(3, 0, 6, 3, 6, 22, RUB); F(28, 0, 6, 28, 6, 22, RUB); F(3, 2, 10, 3, 4, 18, RUV); F(28, 2, 10, 28, 4, 18, RUV)
  F(3, 7, 6, 28, 7, 6, RUC); F(3, 7, 22, 28, 7, 22, RUC)
  ruToit(3, 28, 6, 22, 8, 'waxed_weathered_cut_copper', RUB)
  F(10, 15, 13, 21, 15, 15, 'minecraft:light_gray_stained_glass')
  // etals de poissonniers
  ;[9, 13, 17].forEach(z => {
    for (var x = 6; x <= 25; x++) if (x != 15 && x != 16) { S(x, 0, z, 'minecraft:smooth_stone'); S(x, 1, z, R() < 0.5 ? 'minecraft:packed_ice' : 'minecraft:smooth_quartz_slab[type=bottom]') }
    S(6, 2, z, 'minecraft:heavy_weighted_pressure_plate[power=0]'); ruSusp(10, 7, z); ruSusp(21, 7, z)
  })
  ;[[7, 10], [12, 14], [20, 10], [24, 18], [9, 18]].forEach(c => SA(c[0], 0, c[1], choix([RUBAR, 'supplementaries:sack', 'minecraft:barrel[facing=north,open=true]', RUCOF])))
  // bureau des ventes et tableau des cours (sans texte)
  F(23, 0, 19, 27, 3, 21, RUW); F(24, 1, 19, 26, 2, 19, RUV); PORTE(23, 1, 20, 'minecraft:spruce_door', 'west', 'left', 'false'); F(23, 4, 19, 27, 4, 21, RUT)
  vrBur(25, 1, 20, 'south'); S(26, 1, 21, RUCOF.replace('south', 'north')); F(4, 2, 7, 8, 4, 7, 'minecraft:black_concrete')
  // bateau de peche tire au sec sur le terre-plein arriere
  for (var x = 6; x <= 20; x++) { var hw = x > 17 ? 20 - x : 2; F(x, 0, 3 - hw, x, 0, 3 + hw, 'minecraft:blue_concrete'); if (hw > 0) { S(x, 1, 3 - hw, 'minecraft:white_concrete'); S(x, 1, 3 + hw, 'minecraft:white_concrete') } }
  F(8, 2, 2, 10, 4, 4, RPW); S(9, 3, 2, 'minecraft:black_stained_glass'); F(14, 1, 3, 14, 6, 3, 'minecraft:spruce_fence')
  ;[[22, 1], [23, 1], [22, 2]].forEach(c => S(c[0], 0, c[1], 'minecraft:spruce_slab[type=bottom]'))
  // casiers et filets devant
  ;[[2, 26], [3, 26], [2, 27], [29, 26], [29, 27]].forEach(c => S(c[0], 0, c[1], choix(['minecraft:barrel[facing=up,open=false]', 'minecraft:spruce_trapdoor[facing=north,half=bottom,open=false,powered=false,waterlogged=false]', 'minecraft:black_wool'])))
  bgVoiture(12, 27, 'x', 'white', 1)
}

// ================= ENTREPOT FRIGORIFIQUE (boite isolee aveugle, quais isothermes, compresseurs en toiture, chambres froides) =================
function ruFrigo() {
  ruSol(0, 0, 31, 31); ruBitume(0, 22, 31, 31)
  F(3, 0, 3, 28, 0, 20, RUS); W(3, 3, 28, 20, 1, 10, RPW); F(3, 9, 3, 28, 9, 20, RPW); W(3, 3, 28, 20, 8, 8, 'minecraft:blue_concrete')
  F(3, 10, 3, 28, 10, 20, RUSLS); W(3, 3, 28, 20, 1, 1, RPG)
  // trois quais isothermes a sas
  ;[[6, 8], [13, 15], [20, 22]].forEach(q => {
    F(q[0], 1, 20, q[1], 4, 20, AIR); F(q[0] - 1, 1, 21, q[1] + 1, 5, 23, RPG); F(q[0], 1, 21, q[1], 4, 23, AIR)
    F(q[0], 3, 23, q[1], 4, 23, 'minecraft:iron_trapdoor[facing=north,half=top,open=true,powered=false,waterlogged=false]')
    F(q[0], -1, 24, q[0], -1, 29, 'minecraft:yellow_concrete'); F(q[1], -1, 24, q[1], -1, 29, 'minecraft:yellow_concrete')
  })
  F(4, 1, 21, 4, 4, 21, RPG); F(27, 1, 21, 27, 4, 21, RPG)
  // interieur : sol de glace, chambres froides, rayonnages
  F(4, 0, 4, 27, 0, 19, 'minecraft:packed_ice'); F(4, 1, 11, 27, 7, 11, RPW); F(9, 1, 11, 10, 3, 11, AIR); F(20, 1, 11, 21, 3, 11, AIR)
  F(4, 8, 4, 27, 8, 19, AIR); W(3, 3, 28, 20, 8, 8, 'minecraft:blue_concrete')
  ;[5, 8, 14, 17, 23].forEach(x => { ;[2, 4, 6].forEach(y => F(x, y, 5, x, y, 9, 'minecraft:iron_trapdoor[facing=east,half=top,open=false,powered=false,waterlogged=false]')); F(x, 1, 5, x, 6, 5, 'minecraft:iron_bars'); for (var z = 6; z <= 9; z++) [1, 3, 5].forEach(y => { if (R() < 0.45) SA(x, y, z, choix([RUBAR, RUCOF.replace('south', 'east'), 'minecraft:white_wool', 'minecraft:snow_block'])) }) })
  for (var x = 5; x <= 26; x++) for (var z = 4; z <= 10; z++) if (R() < 0.12) SA(x, 1, z, 'minecraft:white_carpet')
  ;[[8, 15], [15, 16], [22, 15]].forEach(c => { S(c[0], 0, c[1], 'minecraft:spruce_slab[type=bottom]'); SA(c[0], 1, c[1], 'minecraft:white_wool') })
  ;[[6, 13], [16, 13], [25, 13]].forEach(c => ruSusp(c[0], 7, c[1]))
  // compresseurs en toiture
  ;[6, 13, 20].forEach(x => { F(x, 11, 6, x + 4, 12, 9, RPG); F(x + 1, 13, 7, x + 3, 13, 8, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false,powered=false,waterlogged=false]'); F(x, 11, 12, x + 4, 11, 12, 'minecraft:chain[axis=x]') })
  F(25, 11, 14, 27, 14, 16, RPG); F(26, 15, 15, 26, 17, 15, 'minecraft:iron_bars')
  // groupe electrogene et camion frigorifique
  F(29, 0, 8, 31, 2, 12, 'minecraft:green_concrete'); S(30, 3, 9, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false,powered=false,waterlogged=false]')
  F(12, 0, 25, 14, 0, 31, 'minecraft:black_concrete'); F(12, 1, 24, 14, 3, 29, RPW); F(12, 1, 30, 14, 3, 31, 'minecraft:red_concrete'); F(13, 2, 31, 13, 2, 31, 'minecraft:black_stained_glass')
  ;[[1, 1], [30, 1], [1, 20]].forEach(c => S(c[0], 0, c[1], RUBAR))
}

// ================= CHANTIER NAVAL (coque sur tins, echafaudages, atelier de soudure, grue mobile) =================
function ruChantier() {
  ruSol(0, 0, 31, 31); ruBitume(0, 24, 31, 31)
  F(2, -1, 7, 29, -1, 19, 'minecraft:gray_concrete')
  // tins de calage
  for (var x = 6; x <= 25; x += 3) S(x, 0, 13, 'minecraft:stone_bricks')
  // coque : carene rouge, muraille blanche, pont, passerelle
  for (var x = 5; x <= 27; x++) {
    var bow = x > 21 ? x - 21 : 0
    for (var y = 1; y <= 7; y++) {
      var hw = Math.min(y + 1, 5) - Math.ceil(bow * (y < 4 ? 1 : 0.7)); if (x == 5) hw = Math.min(hw, 4)
      if (hw < 0) continue
      var m = y <= 3 ? 'minecraft:red_terracotta' : y == 4 ? 'minecraft:black_concrete' : 'minecraft:white_concrete'
      if (y == 1) F(x, y, 13 - hw, x, y, 13 + hw, m)
      else { S(x, y, 13 - hw, m); S(x, y, 13 + hw, m); if (x == 5) F(x, y, 13 - hw, x, y, 13 + hw, m) }
      if (y == 7) F(x, y, 14 - hw, x, y, 12 + hw, 'minecraft:spruce_slab[type=top]')
    }
  }
  for (var x = 9; x <= 24; x += 5) if (R() < 0.6) S(x, 2, 8, AIR)
  F(6, 8, 10, 10, 11, 16, RPW); F(6, 10, 10, 10, 10, 16, 'minecraft:black_stained_glass'); F(6, 12, 9, 10, 12, 17, RUSLS); F(8, 13, 13, 8, 15, 13, 'minecraft:iron_bars')
  F(12, 8, 13, 12, 9, 13, 'minecraft:red_concrete'); S(12, 10, 13, 'minecraft:black_concrete')
  // echafaudages des deux bords
  for (var x = 6; x <= 24; x++) { if (x % 3 == 0) { F(x, 0, 7, x, 7, 7, 'minecraft:scaffolding[bottom=false,distance=0,waterlogged=false]'); } ;[3, 6].forEach(y => S(x, y, 7, 'minecraft:scaffolding[bottom=false,distance=0,waterlogged=false]')) }
  ;[9, 18].forEach(x => { F(x, 0, 19, x, 3, 19, 'minecraft:scaffolding[bottom=false,distance=0,waterlogged=false]'); F(x - 1, 3, 19, x + 1, 3, 19, 'minecraft:scaffolding[bottom=false,distance=0,waterlogged=false]') })
  // grue mobile
  F(26, 0, 21, 30, 1, 23, RPY); F(27, 2, 21, 28, 3, 22, RPY); S(29, 2, 21, 'minecraft:black_stained_glass')
  for (var k = 0; k <= 8; k++) S(27 - k, 4 + k, 22, RPY); F(19, 6, 22, 19, 11, 22, 'minecraft:chain[axis=y]'); S(19, 5, 22, RUI)
  // atelier de soudure et toles
  F(1, 0, 21, 12, 0, 30, RUS); W(1, 21, 12, 30, 1, 5, RUO); F(1, 6, 21, 12, 6, 30, RUSLC); F(4, 1, 21, 9, 4, 21, AIR)
  F(2, 1, 29, 11, 1, 29, 'minecraft:smooth_stone_slab[type=top]'); S(3, 2, 29, 'minecraft:anvil[facing=east]'); S(6, 2, 29, 'minecraft:grindstone[face=floor,facing=south]'); S(9, 2, 29, 'minecraft:smithing_table')
  ;[2, 3].forEach(x => { F(x, 1, 23, x, 2, 23, 'minecraft:lightning_rod[facing=up,powered=false,waterlogged=false]') }); S(11, 1, 23, RUCOF.replace('south', 'west')); S(7, 4, 26, RUL)
  ;[[15, 26], [15, 27], [16, 26]].forEach((c, i) => F(c[0], 0, c[1], c[0] + 4, i, c[1], 'minecraft:iron_block'))
  ;[[29, 2], [30, 3], [2, 2]].forEach(c => S(c[0], 0, c[1], RUBAR))
}

// ================= DEPOT DE CARBURANT (trois cuves, cuvette de retention, tuyauteries, poste de chargement) =================
function ruCiternes() {
  ruSol(0, 0, 31, 31); ruBitume(0, 18, 31, 31)
  F(1, -1, 3, 30, -1, 15, 'minecraft:gray_concrete'); W(1, 3, 30, 15, 0, 0, 'minecraft:smooth_stone')
  ;[6, 16, 25].forEach((cx, i) => {
    var r2 = i == 2 ? 13 : 18
    ruRond(cx, 9, r2, 0, 9, i == 1 ? RPG : RPW, false); ruRond(cx, 9, r2, 6, 6, 'minecraft:red_concrete', false)
    ruRond(cx, 9, r2, 10, 10, 'minecraft:smooth_stone_slab[type=bottom]', true)
    F(cx, 0, 13, cx, 10, 13, AIR); F(cx, 1, 14, cx, 10, 14, 'minecraft:ladder[facing=south,waterlogged=false]'); S(cx, 0, 14, 'minecraft:smooth_stone')
    if (R() < 0.5) S(cx + 2, 3, 5, AIR)
  })
  // tuyauteries vers le poste de chargement
  F(2, 1, 16, 29, 1, 16, 'minecraft:chain[axis=x]'); ;[6, 16, 25].forEach(cx => F(cx + 1, 1, 14, cx + 1, 1, 15, 'minecraft:chain[axis=z]'))
  F(20, 1, 17, 20, 1, 21, 'minecraft:chain[axis=z]')
  // poste de chargement sous auvent
  ;[[16, 20], [27, 20], [16, 28], [27, 28]].forEach(c => F(c[0], 0, c[1], c[0], 5, c[1], 'minecraft:iron_bars'))
  F(15, 6, 19, 28, 6, 29, RUSLC); F(20, 0, 22, 20, 4, 22, 'minecraft:red_concrete'); F(20, 5, 22, 20, 5, 26, 'minecraft:chain[axis=z]')
  F(22, 0, 21, 24, 0, 29, 'minecraft:black_concrete'); F(22, 1, 22, 24, 3, 27, RPW); F(22, 1, 28, 24, 3, 29, 'minecraft:red_concrete'); S(23, 2, 29, 'minecraft:black_stained_glass')
  // local des pompes
  F(2, 0, 20, 11, 0, 27, RUS); W(2, 20, 11, 27, 1, 4, RUB); F(2, 5, 20, 11, 5, 27, RUSLS); F(4, 2, 27, 5, 3, 27, RUV); PORTE(8, 1, 27, 'minecraft:iron_door', 'south', 'left', 'false')
  ;[4, 6, 8].forEach(x => { S(x, 1, 22, 'minecraft:blast_furnace[facing=south,lit=false]'); S(x, 2, 22, 'minecraft:lever[face=floor,facing=south,powered=false]') }); S(10, 1, 21, RUCOF.replace('south', 'west')); S(6, 4, 24, RUL)
  ;[[13, 29], [14, 30], [1, 30]].forEach(c => S(c[0], 0, c[1], RUBAR))
}

// ================= POSTE DE LA PAF (enceinte barbelee, bureaux, zone de retention, mirador, file d'attente) =================
function ruDouane() {
  ruSol(0, 0, 31, 31); ruBitume(0, 22, 31, 31); F(2, -1, 2, 29, -1, 20, 'minecraft:gray_concrete')
  // mur d'enceinte surmonte de barbele
  W(1, 1, 30, 21, 0, 3, RPG); F(1, 4, 1, 30, 4, 1, RPBARB); F(1, 4, 21, 30, 4, 21, RPBARB); F(1, 4, 2, 1, 4, 20, RPBARB); F(30, 4, 2, 30, 4, 20, RPBARB)
  F(13, 0, 21, 18, 3, 21, AIR); F(13, 4, 21, 18, 4, 21, AIR)
  for (var x = 12; x <= 19; x++) S(x, 1, 23, x % 2 ? 'minecraft:red_concrete' : 'minecraft:white_concrete'); S(12, 0, 23, 'minecraft:iron_block')
  // guerite
  F(20, 0, 22, 23, 3, 25, RPW); F(20, 1, 22, 20, 2, 25, RUV); F(21, 1, 22, 22, 2, 22, RUV); F(19, 4, 21, 24, 4, 26, RUSLS); PORTE(23, 1, 24, 'minecraft:iron_door', 'east', 'left', 'false')
  vrCh(21, 1, 24, 'west'); S(22, 1, 25, RUCOF.replace('south', 'north')); S(21, 3, 23, RUL)
  // bureaux de la police aux frontieres
  F(3, 0, 3, 16, 0, 12, RUS); W(3, 3, 16, 12, 1, 8, RPW); F(3, 4, 3, 16, 4, 12, RUS); F(3, 9, 3, 16, 9, 12, RUSLS); W(3, 3, 16, 12, 4, 4, 'minecraft:blue_concrete')
  for (var x = 5; x <= 14; x += 3) { F(x, 2, 12, x + 1, 3, 12, 'minecraft:iron_bars'); F(x, 6, 12, x + 1, 7, 12, RUV) }
  PORTE(9, 1, 12, 'minecraft:iron_door', 'south', 'left', 'false'); F(4, 1, 4, 4, 8, 4, 'minecraft:ladder[facing=south,waterlogged=false]'); S(4, 4, 4, 'minecraft:ladder[facing=south,waterlogged=false]')
  F(4, 1, 7, 15, 1, 7, 'minecraft:smooth_stone_slab[type=top]'); ;[6, 10, 14].forEach(x => vrCh(x, 1, 6, 'south'))
  ;[[6, 5, 9], [10, 5, 9], [13, 5, 6]].forEach(c => { vrBur(c[0], c[1], c[2], 'north'); vrCh(c[0], c[1], c[2] - 1, 'south') }); vrArm(15, 5, 4, 'west'); S(15, 1, 11, RUCOF.replace('south', 'west')); S(9, 7, 8, RUL); S(9, 3, 9, RUL)
  F(9, 10, 6, 9, 15, 6, 'minecraft:iron_bars'); S(9, 15, 7, 'minecraft:blue_wool'); S(9, 14, 7, 'minecraft:white_wool'); S(9, 13, 7, 'minecraft:red_wool')
  // zone de retention grillagee, lits de camp
  W(18, 3, 28, 12, 0, 2, 'minecraft:iron_bars'); F(18, 3, 3, 28, 3, 12, 'minecraft:iron_bars'); F(23, 0, 12, 23, 1, 12, AIR)
  ;[20, 22, 24, 26].forEach(x => { S(x, 0, 5, 'minecraft:white_carpet'); S(x, 0, 6, 'minecraft:white_carpet') }); S(27, 0, 10, RUBAR); SA(20, 0, 10, 'supplementaries:sack')
  // baie de fouille et conteneur de saisies
  F(4, -1, 15, 12, -1, 19, 'minecraft:yellow_concrete'); F(5, -1, 16, 11, -1, 18, 'minecraft:gray_concrete'); bgVoiture(6, 16, 'x', 'gray', 1)
  rpCont(19, 0, 15, 'x', 'blue', true); rpCont(25, 0, 15, 'z', 'red', false)
  // mirador d'angle
  ;[[26, 22], [29, 22], [26, 25], [29, 25]].forEach(c => F(c[0], 0, c[1], c[0], 7, c[1], 'minecraft:stripped_spruce_log[axis=y]'))
  F(25, 8, 21, 30, 8, 26, RUT); W(25, 21, 30, 26, 9, 9, 'minecraft:spruce_fence'); F(25, 11, 21, 30, 11, 26, 'minecraft:spruce_slab[type=bottom]'); ;[[25, 21], [30, 21], [25, 26], [30, 26]].forEach(c => S(c[0], 10, c[1], 'minecraft:spruce_fence'))
  S(28, 9, 22, 'minecraft:redstone_lamp[lit=false]'); F(27, 1, 24, 27, 7, 24, 'minecraft:ladder[facing=south,waterlogged=false]')
  // file d'attente : barrieres, sacs, valises abandonnees
  for (var x = 3; x <= 10; x++) { S(x, 0, 24, 'minecraft:iron_bars'); S(x, 0, 27, 'minecraft:iron_bars') }
  ;[[4, 25], [7, 26], [9, 25], [5, 28], [11, 29]].forEach(c => SA(c[0], 0, c[1], choix(['supplementaries:sack', 'minecraft:brown_wool', RUBAR, 'minecraft:black_wool'])))
}

var QFIN_RP = function () {
  HB2 = true; FIN = true; THM = THM_RU
  var rc = ['white', 'light_gray', 'brown']
  HM = {}; ruRue(); finAncrage()
  lot(QF(ruCapitainerie, null, rc), 0, 0, 999, 2911, 32, 31); lot(QF(ruConteneurs, null, null), 32, 0, 999, 2921, 32, 12); lot(QF(ruPortique, null, null), 64, 0, 999, 2931, 32, 26); lot(QF(ruCriee, null, null), 96, 0, 999, 2941, 32, 16)
  lot(QF(ruFrigo, null, null), 0, 48, 999, 2951, 32, 18); lot(QF(ruChantier, null, null), 32, 48, 999, 2961, 32, 16); lot(QF(ruCiternes, null, null), 64, 48, 999, 2971, 32, 12); lot(QF(ruDouane, null, rc), 96, 48, 999, 2981, 32, 16)
  vlog('FIN volets ' + FIN_NV + ' rideaux ' + FIN_NR + ' paves ' + PAVE_NB + ' retraits ancrage ' + ANC_NB)
  HB2 = false; FIN = false; THM = null; HM = {}
}
function vuesPort() {
  vue('rp_ensemble_sud', 0, 0, 64, 52, 120, 64, 8, 34, 3000)
  vue('rp_ensemble_no', 0, 0, -30, 50, -30, 64, 6, 40, 3000)
  vue('rp_capitainerie', 0, 0, 16, 14, 50, 10, 12, 10)
  vue('rp_capitainerie_vigie', 0, 0, 12, 19.5, 13, 6, 18.5, 8)
  vue('rp_conteneurs', 32, 0, 16, 14, 46, 14, 3, 10)
  vue('rp_portique', 64, 0, 16, 16, 48, 16, 10, 8)
  vue('rp_portique_bassin', 64, 0, 36, 12, -8, 16, 6, 6)
  vue('rp_criee', 96, 0, 16, 10, 40, 16, 3, 14)
  vue('rp_criee_halle', 96, 0, 26, 4, 15, 10, 1.5, 13)
  vue('rp_frigo', 0, 48, 16, 12, 44, 16, 5, 12)
  vue('rp_frigo_froid', 0, 48, 25, 3, 7, 6, 2, 8)
  vue('rp_chantier', 32, 48, 16, 14, 42, 16, 5, 13)
  vue('rp_citernes', 64, 48, 16, 16, 40, 16, 5, 9)
  vue('rp_douane', 96, 48, 16, 14, 44, 14, 3, 10)
  vue('rp_douane_cour', 96, 48, 28, 10, 24, 12, 2, 8)
}
