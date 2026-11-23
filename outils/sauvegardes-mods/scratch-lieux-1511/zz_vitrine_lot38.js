// ================= QUARTIER GARNISON (camp militaire tenu par des survivants) : caserne, poste de controle, armurerie, hangar, mess, infirmerie de campagne, heliport, camp de toile =================
var GAC = 'minecraft:gray_concrete', GAO = 'minecraft:green_terracotta', GAL = 'minecraft:light_gray_concrete', GAS = 'supplementaries:sack', GAX = 'mcwfences:iron_cheval_de_frise', GAD = 'mcwdoors:metal_door', GAP = 'minecraft:polished_andesite'
var GASL = 'minecraft:smooth_stone_slab[type=bottom]', GAV = 'minecraft:green_concrete'
function gaSol(x1, z1, x2, z2) { for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) { var r = R(); S(x, -1, z, r < 0.5 ? 'minecraft:gravel' : r < 0.75 ? 'minecraft:coarse_dirt' : r < 0.9 ? 'minecraft:packed_mud' : 'minecraft:andesite'); if (r > 0.5 && r < 0.75 && R() < 0.1) SA(x, 0, z, 'minecraft:short_grass') } }
function gaDalle(x1, z1, x2, z2) { for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) { var r = R(); S(x, -1, z, r < 0.72 ? GAL : r < 0.92 ? GAC : 'minecraft:andesite') } }
// batiment en beton : dalle, murs, angles en beton gris, toit plat a acrotere de dalles
function gaBat(x1, z1, x2, z2, y, h, mur) {
  F(x1, y, z1, x2, y, z2, GAP); W(x1, z1, x2, z2, y + 1, y + h, mur); F(x1 + 1, y + 1, z1 + 1, x2 - 1, y + h, z2 - 1, AIR)
  ;[[x1, z1], [x2, z1], [x1, z2], [x2, z2]].forEach(c => F(c[0], y + 1, c[1], c[0], y + h, c[1], GAC))
  F(x1, y + h + 1, z1, x2, y + h + 1, z2, GAC); W(x1, z1, x2, z2, y + h + 2, y + h + 2, GASL)
}
function gaFenX(x1, x2, z, y, pas) { for (var x = x1; x + 1 <= x2; x += pas) F(x, y, z, x + 1, y + 1, z, GP) }
function gaFenZ(x, z1, z2, y, pas) { for (var z = z1; z + 1 <= z2; z += pas) F(x, y, z, x, y + 1, z + 1, GP) }
// camion bache 7 x 3 (long selon x, cabine cote x)
function gaCamion(x, z, col) {
  var C = 'minecraft:' + (col || 'green') + '_concrete', T = col == 'white' ? 'minecraft:white_wool' : 'minecraft:green_wool'
  F(x, 0, z, x + 6, 0, z + 2, C); [x + 1, x + 5].forEach(u => { S(u, 0, z, 'minecraft:black_concrete'); S(u, 0, z + 2, 'minecraft:black_concrete') })
  F(x, 1, z, x + 1, 2, z + 2, C); F(x, 2, z, x, 2, z + 2, 'minecraft:tinted_glass'); S(x + 1, 2, z, 'minecraft:tinted_glass'); S(x + 1, 2, z + 2, 'minecraft:tinted_glass')
  F(x + 2, 1, z, x + 6, 3, z + 2, T)
  if (col == 'white') [z, z + 2].forEach(zz => { S(x + 4, 2, zz, 'minecraft:red_wool'); S(x + 4, 1, zz, 'minecraft:red_wool'); S(x + 4, 3, zz, 'minecraft:red_wool'); S(x + 3, 2, zz, 'minecraft:red_wool'); S(x + 5, 2, zz, 'minecraft:red_wool') })
}
// tente en A (faitage selon x, largeur 7 en z), ouverte au bout x1
function gaTente(x1, x2, z1, W0) {
  F(x1, 0, z1, x2, 0, z1 + 6, 'minecraft:spruce_planks')
  for (var k = 0; k < 3; k++) { F(x1, 1 + k, z1 + k, x2, 1 + k, z1 + k, W0); F(x1, 1 + k, z1 + 6 - k, x2, 1 + k, z1 + 6 - k, W0) }
  F(x1, 4, z1 + 3, x2, 4, z1 + 3, W0)
  ;[x1, x2].forEach(x => { F(x, 1, z1 + 1, x, 1, z1 + 5, W0); F(x, 2, z1 + 2, x, 2, z1 + 4, W0); S(x, 3, z1 + 3, W0) })
  F(x1, 1, z1 + 3, x1, 2, z1 + 3, AIR)
  S(Math.floor((x1 + x2) / 2), 3, z1 + 3, RUL)
}
function gaSacs(x1, z1, x2, z2, h) { F(x1, 0, z1, x2, (h || 2) - 1, z2, GAS) }

// ---- rue : chaussee goudronnee, trottoirs en dalles, barrieres jersey, poste de controle a l'est ----
function gaRue() {
  OX = VB.X0; OY = VB.Y0; OZ = VB.Z0; CUT = 999; GRAINE = 575
  for (var x = -16; x <= 143; x++) for (var z = 32; z <= 47; z++) {
    var r = R(), b
    if (z <= 33 || z >= 46) b = r < 0.7 ? GAL : r < 0.9 ? 'minecraft:andesite' : 'minecraft:gravel'
    else if (z == 40 && (x + 32) % 6 < 3) b = 'minecraft:white_concrete'
    else b = r < 0.78 ? 'minecraft:black_concrete' : r < 0.93 ? GAC : 'minecraft:gray_concrete_powder'
    S(x, -1, z, b)
  }
  for (var x = 0; x <= 128; x += 16) { var z = (x / 16) % 2 ? 46 : 33; F(x + 4, 0, z, x + 4, 3, z, 'minecraft:andesite_wall'); S(x + 4, 4, z, 'minecraft:lantern[hanging=false,waterlogged=false]') }
  ;[[10, 34], [44, 45], [76, 34], [108, 45]].forEach(c => F(c[0], 0, c[1], c[0] + 2, 0, c[1], 'minecraft:smooth_stone'))
  gaCamion(20, 41); gaCamion(84, 35); bgVoiture(56, 41, 'x', 'green', 1)
  gaSacs(134, 34, 134, 38, 2); gaSacs(134, 41, 134, 45, 2); F(136, 0, 34, 136, 0, 45, GAX); S(135, 0, 39, 'minecraft:yellow_concrete'); S(135, 1, 39, 'minecraft:yellow_concrete'); F(135, 1, 40, 135, 1, 40, 'minecraft:dark_oak_fence')
}

// ================= CASERNE (R+1, chambrees, bureau de commandement) =================
function gaCaserne() {
  gaSol(0, 0, 31, 31); gaDalle(14, 21, 17, 31); gaDalle(2, 22, 29, 23)
  gaBat(3, 6, 28, 20, 0, 4, GAO); gaBat(3, 6, 28, 20, 5, 4, GAO)
  ;[2, 7].forEach(y => { gaFenX(5, 26, 6, y, 4); gaFenX(5, 12, 20, y, 4); gaFenX(19, 26, 20, y, 4); gaFenZ(3, 9, 18, y, 4); gaFenZ(28, 9, 12, y, 4) })
  gaFenX(13, 18, 20, 7, 4)
  PORTE(15, 1, 20, GAD, 'south', 'left', 'false'); PORTE(16, 1, 20, GAD, 'south', 'right', 'false')
  // auvent d'entree sur poteaux, marches
  F(13, 5, 21, 18, 5, 22, GASL); F(13, 1, 22, 13, 4, 22, GAC); F(18, 1, 22, 18, 4, 22, GAC); F(14, 0, 21, 17, 0, 22, GASL)
  // rez-de-chaussee : chambree (lits superposes), armoires, table, ratelier
  for (var x = 5; x <= 23; x += 3) { vrLitS(x, 1, 7, 'green', 'south'); vrLitS(x, 2, 7, 'green', 'south') }
  ;[5, 8, 11, 20].forEach(x => { vrLitS(x, 1, 19, 'green', 'north'); vrLitS(x, 2, 19, 'green', 'north') })
  ;[6, 9, 12, 21].forEach(x => vrArm(x, 1, 19, 'north'))
  for (var x = 8; x <= 12; x++) { vrTab(x, 1, 13, 'none'); vrCh(x, 1, 12, 'south', 'green'); vrCh(x, 1, 14, 'north', 'green') }
  for (var z = 10; z <= 16; z++) vrEtag(4, 2, z, 'east')
  S(4, 1, 10, RUBAR); S(4, 1, 16, RUBAR)
  mdEsc(26, 27, 18, 0, 5, -1, 'stone_brick', 'minecraft:stone_bricks'); mdGarde(25, 15, 18, 6)
  // etage : cloison, bureau de commandement, chambres d'officiers
  F(14, 6, 7, 14, 9, 19, GAL); PORTE(14, 6, 13, 'mcwdoors:spruce_classic_door', 'east', 'left', 'false')
  vrBur(6, 6, 8, 'south'); vrBur(10, 6, 8, 'south'); vrCh(6, 6, 9, 'north', 'black'); vrCh(10, 6, 9, 'north', 'black')
  S(8, 6, 14, 'minecraft:cartography_table'); S(8, 6, 13, 'minecraft:cartography_table'); vrCh(9, 6, 14, 'west', 'black'); vrCh(7, 6, 13, 'east', 'black')
  ;[4].forEach(x => { for (var z = 10; z <= 18; z += 2) vrEtag(x, 7, z, 'east') }); S(13, 6, 19, 'minecraft:chest[facing=north,type=single,waterlogged=false]'); S(4, 6, 19, RUBAR)
  ;[16, 19, 22].forEach(x => { vrLitS(x, 6, 7, 'gray', 'south'); vrArm(x, 6, 19, 'north') })
  ;[[8, 13], [20, 13], [24, 9]].forEach(c => { S(c[0], 4, c[1], RUL); S(c[0], 9, c[1], RUL) })
  // toit : antenne, nid de sacs de sable
  F(8, 11, 9, 8, 14, 9, 'minecraft:iron_bars'); S(8, 15, 9, 'minecraft:lightning_rod[facing=up,powered=false,waterlogged=false]')
  F(24, 11, 16, 26, 11, 16, GAS); F(26, 11, 17, 26, 11, 18, GAS)
  // cour : mat et drapeau, sacs de sable, jeep, chevaux de frise
  F(10, 0, 26, 10, 9, 26, 'minecraft:iron_bars'); S(10, 10, 26, 'minecraft:green_banner[rotation=4]')
  gaSacs(3, 26, 7, 26, 2); gaSacs(22, 27, 25, 27, 1); bgVoiture(23, 29, 'x', 'green', 0)
  F(0, 0, 0, 31, 0, 0, GAX); F(0, 0, 1, 0, 0, 31, GAX)
}

// ================= POSTE DE CONTROLE (mur d'enceinte, barriere, guerite, mirador, conteneurs) =================
function gaPoste() {
  gaSol(0, 0, 31, 31); gaDalle(12, 0, 19, 31)
  F(0, 0, 24, 11, 2, 24, GAC); F(0, 3, 24, 11, 3, 24, 'minecraft:iron_bars'); F(20, 0, 24, 31, 2, 24, GAC); F(20, 3, 24, 31, 3, 24, 'minecraft:iron_bars')
  // barriere levante
  F(20, 0, 25, 20, 1, 25, 'minecraft:yellow_concrete'); F(13, 1, 25, 19, 1, 25, 'minecraft:dark_oak_fence')
  // guerite
  gaBat(21, 26, 26, 30, 0, 3, GAL); F(22, 2, 26, 25, 3, 26, GP); F(22, 2, 30, 25, 3, 30, GP); F(21, 2, 27, 21, 3, 29, GP)
  PORTE(26, 1, 28, GAD, 'east', 'left', 'false'); vrBur(22, 1, 28, 'east'); vrCh(23, 1, 28, 'west', 'black'); S(25, 1, 27, 'minecraft:chest[facing=west,type=single,waterlogged=false]'); S(23, 3, 28, RUL)
  // chicane de blocs beton cote rue
  F(12, 0, 29, 15, 0, 29, 'minecraft:smooth_stone'); F(16, 0, 27, 19, 0, 27, 'minecraft:smooth_stone')
  F(0, 0, 27, 10, 0, 27, GAX)
  // mirador
  ;[[3, 3], [6, 3], [3, 6], [6, 6]].forEach(c => F(c[0], 0, c[1], c[0], 7, c[1], 'minecraft:stripped_spruce_log[axis=y]'))
  F(3, 8, 3, 6, 8, 6, 'minecraft:spruce_planks'); W(3, 3, 6, 6, 9, 9, GAS); F(3, 9, 6, 4, 9, 6, AIR)
  ;[[3, 3], [6, 3], [3, 6], [6, 6]].forEach(c => S(c[0], 10, c[1], 'minecraft:spruce_fence')); F(2, 11, 2, 7, 11, 7, 'minecraft:spruce_slab[type=bottom]')
  F(3, 1, 7, 3, 8, 7, 'minecraft:ladder[facing=south,waterlogged=false]'); S(5, 9, 4, 'minecraft:lantern[hanging=false,waterlogged=false]')
  // camion, conteneurs de stockage, futs
  gaCamion(13, 12)
  bdCont(22, 0, 3, 'green', 3); bdCont(22, 0, 10, 'gray', 3); bdMeubleCont(22, 0, 3, 'green'); bdMeubleCont(22, 0, 10, 'gray')
  ;[16, 17, 18].forEach(z => { S(27, 0, z, RUBAR); S(28, 0, z, RUBAR) }); S(27, 1, 17, RUBAR)
  gaSacs(4, 14, 8, 14, 2); gaSacs(4, 15, 4, 18, 2); S(6, 0, 17, RUCOF)
  F(0, 0, 0, 31, 0, 0, GAX)
}

// ================= ARMURERIE (bunker enterre sous butte, porte blindee, rateliers) =================
function gaArmurerie() {
  gaSol(0, 0, 31, 31); gaDalle(13, 23, 18, 31)
  gaBat(6, 8, 25, 22, 0, 4, GAC)
  F(6, 6, 8, 25, 6, 22, 'minecraft:grass_block[snowy=false]'); F(8, 7, 10, 23, 7, 20, 'minecraft:grass_block[snowy=false]'); F(11, 8, 13, 20, 8, 17, 'minecraft:grass_block[snowy=false]')
  for (var x = 6; x <= 25; x++) for (var z = 8; z <= 22; z++) { var y = (x >= 11 && x <= 20 && z >= 13 && z <= 17) ? 9 : (x >= 8 && x <= 23 && z >= 10 && z <= 20) ? 8 : 7; if (R() < 0.25) S(x, y, z, R() < 0.7 ? 'minecraft:short_grass' : 'minecraft:fern') }
  F(15, 9, 15, 15, 11, 15, 'minecraft:iron_bars'); S(15, 12, 15, 'minecraft:lightning_rod[facing=up,powered=false,waterlogged=false]')
  PORTE(15, 1, 22, GAD, 'south', 'left', 'false'); PORTE(16, 1, 22, GAD, 'south', 'right', 'false'); F(14, 4, 22, 17, 4, 22, 'minecraft:yellow_concrete')
  F(6, 3, 12, 6, 3, 13, 'minecraft:iron_bars'); F(25, 3, 12, 25, 3, 13, 'minecraft:iron_bars'); F(6, 3, 17, 6, 3, 18, 'minecraft:iron_bars'); F(25, 3, 17, 25, 3, 18, 'minecraft:iron_bars')
  gaSacs(12, 24, 13, 24, 2); gaSacs(18, 24, 19, 24, 2)
  // interieur : rateliers muraux, caisses, etabli d'armurier, casiers
  for (var x = 8; x <= 23; x++) { S(x, 1, 9, x % 2 ? RUBAR : 'minecraft:chest[facing=south,type=single,waterlogged=false]'); vrEtag(x, 2, 9, 'south'); vrEtag(x, 3, 9, 'south') }
  ;[13, 17].forEach(z => { for (var x = 9; x <= 22; x++) { if (x == 15 || x == 16) continue; S(x, 1, z, x % 3 ? RUBAR : 'minecraft:chest[facing=east,type=single,waterlogged=false]'); if (x % 2) S(x, 2, z, x % 3 ? RUBAR : GAS) } })
  S(8, 1, 21, 'minecraft:anvil[facing=east]'); S(9, 1, 21, 'minecraft:smithing_table'); S(10, 1, 21, 'minecraft:grindstone[face=floor,facing=north]'); S(11, 1, 21, 'minecraft:crafting_table')
  for (var z = 11; z <= 19; z += 2) vrArm(7, 1, z, 'east')
  for (var z = 11; z <= 19; z += 2) vrArm(24, 1, z, 'west')
  ;[[10, 12], [15, 15], [21, 12], [10, 19], [21, 19]].forEach(c => S(c[0], 4, c[1], RUL))
  // exterieur : camion, caisses sous bache, projecteurs
  gaCamion(22, 26)
  F(3, 0, 26, 6, 0, 28, RUBAR); F(3, 1, 26, 5, 1, 27, RUBAR); ;[[2, 25], [7, 25], [2, 29], [7, 29]].forEach(c => F(c[0], 0, c[1], c[0], 2, c[1], 'minecraft:spruce_fence')); F(2, 3, 25, 7, 3, 29, 'minecraft:green_wool')
  F(0, 0, 0, 31, 0, 0, GAX); F(0, 0, 1, 0, 0, 31, GAX); F(31, 0, 1, 31, 0, 31, GAX)
}

// ================= HANGAR A VEHICULES (charpente a deux pans, camions, blinde, atelier) =================
function gaBlinde(x, z) {
  F(x, 0, z, x + 6, 1, z + 3, GAV); [x + 1, x + 3, x + 5].forEach(u => { S(u, 0, z, 'minecraft:black_concrete'); S(u, 0, z + 3, 'minecraft:black_concrete') })
  F(x, 1, z + 1, x, 1, z + 2, 'minecraft:tinted_glass'); F(x + 2, 2, z + 1, x + 4, 2, z + 2, GAV); S(x + 3, 3, z + 1, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false,powered=false,waterlogged=false]')
  S(x + 1, 2, z + 1, 'minecraft:lightning_rod[facing=west,powered=false,waterlogged=false]')
}
function gaHangar() {
  gaSol(0, 0, 31, 31); gaDalle(1, 3, 30, 31)
  W(2, 4, 29, 24, 1, 6, 'minecraft:gray_terracotta'); F(2, 0, 4, 29, 0, 24, GAC)
  for (var x = 2; x <= 29; x += 9) { F(x, 1, 4, x, 6, 4, GAC); F(x, 1, 24, x, 6, 24, GAC) }
  F(7, 1, 24, 24, 5, 24, AIR); F(7, 6, 24, 24, 6, 24, 'minecraft:yellow_concrete'); ;[7, 24].forEach(x => S(x, 6, 24, 'minecraft:black_concrete'))
  ruToit(2, 29, 4, 24, 7, 'waxed_weathered_cut_copper', GAL)
  gaFenZ(2, 8, 20, 4, 4); gaFenZ(29, 8, 20, 4, 4)
  // vehicules
  gaCamion(5, 9); gaCamion(5, 16); gaBlinde(17, 12)
  // atelier du fond, moteur suspendu, futs
  for (var x = 4; x <= 10; x++) vrCpt(x, 1, 5, 'south', 'smooth_stone'); S(8, 2, 5, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false,powered=false,waterlogged=false]')
  S(12, 1, 5, 'minecraft:anvil[facing=north]'); S(13, 1, 5, 'minecraft:smithing_table'); for (var x = 4; x <= 13; x++) vrEtag(x, 3, 5, 'south')
  ;[14, 22].forEach(x => { F(x, 8, 14, x, 16, 14, 'minecraft:chain[axis=y]'); S(x, 7, 14, RUL) }); [[8, 9], [18, 9], [8, 19], [18, 19]].forEach(c => { F(c[0], 8, c[1], c[0], 11, c[1], 'minecraft:chain[axis=y]'); S(c[0], 7, c[1], RUL) })
  S(24, 1, 8, 'minecraft:iron_block'); F(24, 2, 8, 24, 10, 8, 'minecraft:chain[axis=y]')
  for (var z = 6; z <= 10; z++) { S(27, 1, z, RUBAR); S(28, 1, z, RUBAR); if (z % 2) S(27, 2, z, RUBAR) }
  S(4, 1, 22, 'minecraft:chest[facing=east,type=single,waterlogged=false]'); S(4, 1, 21, RUBAR); S(4, 1, 20, 'minecraft:crafting_table')
  // parvis : marquage
  for (var z = 25; z <= 31; z++) { S(7, -1, z, 'minecraft:yellow_concrete'); S(24, -1, z, 'minecraft:yellow_concrete') }
  F(0, 0, 0, 31, 0, 0, GAX)
}

// ================= MESS (refectoire, cuisine collective) =================
function gaMess() {
  gaSol(0, 0, 31, 31); gaDalle(14, 0, 17, 4); gaDalle(2, 21, 29, 23)
  gaBat(3, 5, 28, 20, 0, 5, GAO)
  ;[2].forEach(y => { gaFenX(5, 12, 5, y, 4); gaFenX(19, 26, 5, y, 4); gaFenX(5, 26, 20, y, 4); gaFenZ(3, 8, 17, y, 4); gaFenZ(28, 8, 17, y, 4) })
  PORTE(15, 1, 5, GAD, 'north', 'left', 'false'); PORTE(16, 1, 5, GAD, 'north', 'right', 'false'); F(14, 6, 4, 17, 6, 4, GASL)
  // cuisine au fond, comptoir de service
  for (var x = 5; x <= 25; x++) vrCpt(x, 1, 15, 'north', 'smooth_stone')
  ;[6, 9, 12, 19, 22].forEach(x => S(x, 2, 15, 'handcrafted:white_plate'))
  ;[5, 6, 7, 8].forEach(x => S(x, 1, 19, 'minecraft:smoker[facing=north,lit=false]')); S(10, 1, 19, 'minecraft:water_cauldron[level=3]'); S(11, 1, 19, 'minecraft:water_cauldron[level=2]')
  ;[13, 14, 15].forEach(x => S(x, 1, 19, RUBAR)); S(17, 1, 19, 'minecraft:crafting_table'); S(19, 1, 19, 'minecraft:furnace[facing=north,lit=false]'); S(20, 1, 19, 'minecraft:furnace[facing=north,lit=false]'); S(22, 1, 19, 'minecraft:chest[facing=north,type=single,waterlogged=false]'); S(23, 1, 19, GAS)
  for (var x = 5; x <= 23; x++) vrEtag(x, 3, 19, 'north')
  // tablees et bancs
  ;[8, 12].forEach(z => { for (var x = 6; x <= 25; x++) { if (x == 15 || x == 16) continue; vrTab(x, 1, z, 'none'); S(x, 1, z - 1, btSt('spruce', 'north')); S(x, 1, z + 1, btSt('spruce', 'south')); if (x % 4 == 1) S(x, 2, z, 'handcrafted:white_cup') } })
  ;[[9, 10], [22, 10], [9, 17], [22, 17]].forEach(c => S(c[0], 5, c[1], RUL))
  F(6, 7, 18, 7, 9, 19, 'minecraft:bricks')
  // exterieur : citerne, poubelles, camion de ravitaillement
  F(23, 0, 25, 26, 2, 27, 'minecraft:waxed_weathered_copper'); S(5, 0, 22, 'minecraft:composter[level=4]'); S(6, 0, 22, 'minecraft:cauldron')
  gaCamion(4, 26)
  F(0, 0, 31, 31, 0, 31, GAX)
}

// ================= INFIRMERIE DE CAMPAGNE (tentes, ambulance, groupe electrogene) =================
function gaInfirmerie() {
  gaSol(0, 0, 31, 31); gaDalle(0, 13, 31, 16)
  var B = 'minecraft:white_wool'
  gaTente(3, 14, 5, B); gaTente(17, 28, 5, B); gaTente(3, 14, 18, B); gaTente(17, 28, 18, 'minecraft:green_wool')
  ;[[3, 14, 5], [17, 28, 5], [3, 14, 18]].forEach(t => {
    var x1 = t[0], x2 = t[1], z1 = t[2]
    S(x2, 2, z1 + 3, 'minecraft:red_wool'); S(x2, 3, z1 + 3, 'minecraft:red_wool'); S(x2, 1, z1 + 3, 'minecraft:red_wool'); S(x2, 2, z1 + 2, 'minecraft:red_wool'); S(x2, 2, z1 + 4, 'minecraft:red_wool')
    ;[x1 + 2, x1 + 5, x1 + 8].forEach(x => { vrLitS(x, 1, z1 + 1, 'white', 'east'); vrLitS(x, 1, z1 + 5, 'white', 'east') })
  })
  vrArm(13, 1, 21, 'west'); vrTab(9, 1, 21, 'white'); S(9, 2, 21, 'supplementaries:jar'); S(7, 1, 21, 'minecraft:water_cauldron[level=2]')
  // tente des reserves
  F(18, 1, 19, 27, 1, 19, RUBAR); for (var x = 18; x <= 27; x++) S(x, 1, 23, x % 2 ? GAS : 'minecraft:chest[facing=north,type=single,waterlogged=false]'); S(26, 1, 21, GAS)
  // ambulance, groupe electrogene, citerne d'eau
  gaCamion(22, 26, 'white')
  S(4, 0, 27, 'minecraft:blast_furnace[facing=south,lit=false]'); S(5, 0, 27, 'minecraft:iron_block'); F(4, 1, 27, 5, 1, 27, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false,powered=false,waterlogged=false]'); F(6, 0, 27, 9, 0, 27, 'minecraft:chain[axis=x]')
  F(12, 0, 27, 14, 1, 29, 'minecraft:waxed_oxidized_copper')
  F(31, 0, 0, 31, 0, 31, GAX); F(0, 0, 31, 30, 0, 31, GAX)
}

// ================= HELIPORT (aire balisee, helicoptere, tour radio, poste de controle) =================
function gaHeliport() {
  gaSol(0, 0, 31, 31); gaDalle(4, 4, 22, 22)
  for (var z = 9; z <= 17; z++) { F(9, -1, z, 10, -1, z, 'minecraft:yellow_concrete'); F(16, -1, z, 17, -1, z, 'minecraft:yellow_concrete') }; F(11, -1, 12, 15, -1, 14, 'minecraft:yellow_concrete')
  ;[[4, 4], [22, 4], [4, 22], [22, 22], [13, 4], [13, 22], [4, 13], [22, 13]].forEach(c => S(c[0], 0, c[1], 'minecraft:lantern[hanging=false,waterlogged=false]'))
  // helicoptere pose sur l'aire
  F(10, 0, 12, 15, 0, 12, 'minecraft:iron_bars'); F(10, 0, 14, 15, 0, 14, 'minecraft:iron_bars')
  F(11, 1, 12, 15, 2, 14, GAV); F(11, 2, 12, 11, 2, 14, 'minecraft:tinted_glass'); S(12, 2, 12, 'minecraft:tinted_glass'); S(12, 2, 14, 'minecraft:tinted_glass')
  F(16, 2, 13, 21, 2, 13, GAV); S(21, 3, 13, GAV); S(21, 1, 13, GAV)
  S(13, 3, 13, 'minecraft:iron_bars'); F(9, 4, 13, 17, 4, 13, 'minecraft:polished_blackstone_slab[type=bottom]'); F(13, 4, 9, 13, 4, 17, 'minecraft:polished_blackstone_slab[type=bottom]')
  // tour radio
  ;[[26, 4], [27, 4], [26, 5], [27, 5]].forEach(c => F(c[0], 0, c[1], c[0], 20, c[1], 'minecraft:iron_bars'))
  F(25, 8, 3, 28, 8, 6, GASL); F(25, 16, 3, 28, 16, 6, GASL); S(26, 21, 4, 'minecraft:lightning_rod[facing=up,powered=false,waterlogged=false]'); S(27, 21, 5, 'minecraft:lantern[hanging=false,waterlogged=false]')
  // poste de controle
  gaBat(22, 24, 29, 29, 0, 3, GAL); gaFenX(23, 28, 24, 2, 3); gaFenZ(22, 25, 28, 2, 3); PORTE(29, 1, 26, GAD, 'east', 'left', 'false')
  vrBur(24, 1, 28, 'north'); vrBur(26, 1, 28, 'north'); vrCh(24, 1, 27, 'south', 'black'); vrCh(26, 1, 27, 'south', 'black'); S(28, 1, 28, 'minecraft:note_block'); S(23, 1, 28, 'minecraft:chest[facing=east,type=single,waterlogged=false]'); S(25, 3, 26, RUL)
  // manche a air, reserve de kerosene
  F(2, 0, 26, 2, 5, 26, 'minecraft:spruce_fence'); S(3, 5, 26, 'minecraft:orange_wool'); S(4, 5, 26, 'minecraft:white_wool')
  F(5, 0, 28, 8, 0, 30, RUBAR); F(5, 1, 28, 7, 1, 29, RUBAR)
  F(31, 0, 0, 31, 0, 31, GAX); F(0, 0, 31, 30, 0, 31, GAX)
}

// ================= CAMP DE TOILE ET TERRAIN D'EXERCICE =================
function gaCamp() {
  gaSol(0, 0, 31, 31)
  var V = 'minecraft:green_wool'
  ;[[3, 10, 3], [14, 21, 3], [3, 10, 12], [14, 21, 12]].forEach(t => { gaTente(t[0], t[1], t[2], V); vrLitS(t[0] + 2, 1, t[2] + 1, 'green', 'east'); vrLitS(t[0] + 2, 1, t[2] + 5, 'green', 'east'); vrLitS(t[0] + 5, 1, t[2] + 1, 'green', 'east'); vrLitS(t[0] + 5, 1, t[2] + 5, 'green', 'east'); S(t[1] - 1, 1, t[2] + 3, RUCOF.replace('south', 'west')) })
  // mat, feu de camp
  F(12, 0, 10, 12, 8, 10, 'minecraft:iron_bars'); S(12, 9, 10, 'minecraft:green_banner[rotation=4]')
  S(26, 0, 6, 'minecraft:campfire[facing=north,lit=false,signal_fire=false,waterlogged=false]'); ;[[24, 6, 'z'], [28, 6, 'z'], [26, 4, 'x'], [26, 8, 'x']].forEach(b => S(b[0], 0, b[1], 'minecraft:stripped_spruce_log[axis=' + b[2] + ']'))
  // stand de tir
  for (var x = 3; x <= 20; x++) if (x % 4 != 1) S(x, 0, 23, GAS)
  ;[5, 9, 13, 17].forEach(x => { F(x, 0, 30, x, 1, 30, 'minecraft:spruce_fence'); S(x, 2, 30, 'minecraft:target[power=0]'); S(x, 0, 31, 'minecraft:hay_block[axis=y]') })
  // parcours d'obstacles
  F(24, 0, 20, 29, 2, 20, 'minecraft:spruce_planks'); ;[24, 29].forEach(x => F(x, 0, 24, x, 1, 24, 'minecraft:spruce_fence')); F(25, 1, 24, 28, 1, 24, 'minecraft:stripped_spruce_log[axis=x]')
  ;[24, 29].forEach(x => F(x, 0, 28, x, 4, 28, 'minecraft:stripped_spruce_log[axis=y]')); F(25, 4, 28, 28, 4, 28, 'minecraft:stripped_spruce_log[axis=x]'); F(25, 0, 28, 28, 3, 28, 'minecraft:spruce_planks'); F(25, 0, 27, 28, 3, 27, 'minecraft:ladder[facing=north,waterlogged=false]')
  gaSacs(23, 30, 30, 30, 1)
  F(31, 0, 0, 31, 0, 19, GAX); F(0, 0, 0, 0, 0, 31, GAX)
}

// ---- palette et vues ----
var THM_GA = finPalette('spruce', {})
function vuesGarnisonF() {
  vue('ga_ensemble_sud', 0, 0, 64, 52, 120, 64, 8, 34, 3000)
  vue('ga_rue_ouest', 0, 0, -8, 3, 39.5, 60, 4, 40)
  vue('ga_rue_est', 0, 0, 132, 3, 40.5, 64, 4, 40)
  vue('ga_caserne', 0, 0, 16, 8, 40, 16, 4, 13)
  vue('ga_caserne_chambree', 0, 0, 6, 2.6, 13, 24, 1.5, 13)
  vue('ga_caserne_bureau', 0, 0, 11.5, 7.6, 17.5, 6, 6, 8)
  vue('ga_caserne_officiers', 0, 0, 24.5, 7.6, 9.5, 16, 6.5, 18)
  vue('ga_poste', 32, 0, 16, 6, 42, 15, 2, 22)
  vue('ga_barriere', 32, 0, 9, 3, 35, 18, 1.5, 25)
  vue('ga_mirador', 32, 0, 14, 6, 19, 5, 8, 5)
  vue('ga_armurerie', 64, 0, 16, 7, 40, 16, 3, 18)
  vue('ga_armurerie_interieur', 64, 0, 22, 3, 19.5, 9, 1.5, 10)
  vue('ga_armurerie_butte', 64, 0, 2, 13, 30, 16, 6, 15)
  vue('ga_hangar', 96, 0, 16, 7, 40, 16, 4, 14)
  vue('ga_hangar_interieur', 96, 0, 25, 4, 21, 8, 1.5, 8)
  vue('ga_hangar_atelier', 96, 0, 20, 3.5, 9.5, 6, 2, 5)
  vue('ga_mess', 0, 48, 16, 7, -7, 16, 3, 12)
  vue('ga_mess_salle', 0, 48, 25, 3.2, 9.5, 6, 1, 13)
  vue('ga_mess_cuisine', 0, 48, 5.5, 3, 12.5, 20, 1.5, 18)
  vue('ga_infirmerie', 32, 48, 16, 9, -8, 16, 1, 14)
  vue('ga_infirmerie_tente', 32, 48, 5, 2.2, 8.5, 13, 1, 8.5)
  vue('ga_heliport', 64, 48, 16, 12, -8, 14, 1, 14)
  vue('ga_helico', 64, 48, 6, 4, 8, 14, 2, 13)
  vue('ga_tour_radio', 64, 48, 22, 3, 10, 26.5, 14, 4.5)
  vue('ga_camp', 96, 48, 16, 10, -8, 14, 1, 14)
  vue('ga_camp_tentes', 96, 48, 12.5, 3.5, 25, 6, 1.5, 15)
  vue('ga_stand_tir', 96, 48, 12, 4, 20, 12, 1, 30)
  vue('ga_coupe_caserne', 144, 0, 16, 20, 38, 16, 0, 13)
  vue('ga_coupe_caserne_etage', 180, 0, 16, 24, 38, 16, 5, 13)
  vue('ga_coupe_armurerie', 216, 0, 16, 18, 38, 16, 0, 15)
  vue('ga_coupe_mess', 144, 48, 16, 18, -6, 16, 0, 12)
  vue('ga_coupe_infirmerie', 180, 48, 16, 16, -5, 16, 0, 15)
  vue('ga_coupe_camp', 216, 48, 16, 16, -5, 12, 0, 12)
}
var QFIN_GA = function () {
  HB2 = true; FIN = true; THM = THM_GA
  HM = {}; gaRue(); finAncrage()
  lot(QF(gaCaserne, null, null), 0, 0, 999, 1111, 32, 16); lot(QF(gaPoste, null, null), 32, 0, 999, 1121, 32, 12); lot(QF(gaArmurerie, null, null), 64, 0, 999, 1131, 32, 13); lot(QF(gaHangar, null, null), 96, 0, 999, 1141, 32, 18)
  lot(QF(gaMess, null, null), 0, 48, 999, 1151, 32, 10); lot(QF(gaInfirmerie, null, null), 32, 48, 999, 1161, 32, 6); lot(QF(gaHeliport, null, null), 64, 48, 999, 1171, 32, 22); lot(QF(gaCamp, null, null), 96, 48, 999, 1181, 32, 6)
  lot(QF(gaCaserne, null, null), 144, 0, 3, 1111, 32, 16); lot(QF(gaCaserne, null, null), 180, 0, 8, 1111, 32, 16); lot(QF(gaArmurerie, null, null), 216, 0, 3, 1131, 32, 13)
  lot(QF(gaMess, null, null), 144, 48, 3, 1151, 32, 10); lot(QF(gaInfirmerie, null, null), 180, 48, 2, 1161, 32, 6); lot(QF(gaCamp, null, null), 216, 48, 2, 1181, 32, 6)
  vlog('FIN volets ' + FIN_NV + ' rideaux ' + FIN_NR + ' paves ' + PAVE_NB + ' retraits ancrage ' + ANC_NB)
  HB2 = false; FIN = false; THM = null; HM = {}
}
