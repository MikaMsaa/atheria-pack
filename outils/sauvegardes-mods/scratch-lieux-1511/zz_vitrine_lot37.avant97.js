// ================= QUARTIER BIDONVILLE (habitat de survivants) : marche, cabanes sur pilotis, atelier de recuperation, conteneurs, cantine, ruelle, chateau d'eau et jardins, ecole-bus et dispensaire =================
var BDM = ['minecraft:waxed_weathered_cut_copper', 'minecraft:waxed_oxidized_cut_copper', 'minecraft:waxed_exposed_cut_copper', 'minecraft:spruce_planks', 'minecraft:oak_planks', 'minecraft:dark_oak_planks', 'minecraft:blue_terracotta', 'minecraft:light_gray_terracotta', 'minecraft:stripped_spruce_wood[axis=y]']
var BDT = ['minecraft:waxed_weathered_cut_copper_slab[type=bottom]', 'minecraft:waxed_oxidized_cut_copper_slab[type=bottom]', 'minecraft:spruce_slab[type=bottom]', 'minecraft:waxed_exposed_cut_copper_slab[type=bottom]']
var BDF = 'minecraft:spruce_fence', BDLOG = 'minecraft:stripped_spruce_log[axis=y]', BDPL = 'minecraft:spruce_planks'
var BDFEU = 'minecraft:campfire[facing=north,lit=false,signal_fire=false,waterlogged=false]'
function bdMat(x, z) { return BDM[Math.abs(Math.floor(x / 2) * 31 + Math.floor(z / 2) * 17 + GRAINE) % BDM.length] }
function bdSol(x1, z1, x2, z2) { for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) { var r = R(), b = r < 0.35 ? 'minecraft:coarse_dirt' : r < 0.55 ? 'minecraft:packed_mud' : r < 0.7 ? 'minecraft:mud' : r < 0.85 ? 'minecraft:dirt_path' : 'minecraft:gravel'; S(x, -1, z, b); if (b == 'minecraft:coarse_dirt' && R() < 0.1) SA(x, 0, z, 'minecraft:short_grass') } }
// cabane de recuperation : panneaux de 2 colonnes d'une meme matiere, angles en rondins, toit de toles en debord, pilotis si y > 0
function bdCab(x1, z1, x2, z2, y, h, porte, fen) {
  if (y > 0) [[x1, z1], [x2, z1], [x1, z2], [x2, z2]].forEach(c => F(c[0], 0, c[1], c[0], y - 1, c[1], BDLOG))
  F(x1, y, z1, x2, y, z2, BDPL)
  for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) if (x == x1 || x == x2 || z == z1 || z == z2) F(x, y + 1, z, x, y + h, z, bdMat(x, z))
  ;[[x1, z1], [x2, z1], [x1, z2], [x2, z2]].forEach(c => F(c[0], y + 1, c[1], c[0], y + h, c[1], BDLOG))
  F(x1 + 1, y + 1, z1 + 1, x2 - 1, y + h, z2 - 1, AIR)
  for (var x = x1 - 1; x <= x2 + 1; x++) for (var z = z1 - 1; z <= z2 + 1; z++) S(x, y + h + 1, z, choix(BDT))
  PORTE(porte[0], y + 1, porte[1], 'minecraft:spruce_door', porte[2], 'left', 'false')
  ;(fen || []).forEach(f => S(f[0], y + 2, f[1], GP))
  S(Math.floor((x1 + x2) / 2), y + h, Math.floor((z1 + z2) / 2), RUL)
}
// conteneur maritime 7 x 4 x 4 (long selon x), porte dans la paroi sud a x1+dx
function bdCont(x1, y, z1, col, dx) {
  var C = 'minecraft:' + col + '_concrete', T = 'minecraft:' + col + '_terracotta'
  F(x1, y, z1, x1 + 6, y + 3, z1 + 3, C)
  for (var x = x1 + 1; x <= x1 + 5; x += 2) { F(x, y + 1, z1, x, y + 2, z1, T); F(x, y + 1, z1 + 3, x, y + 2, z1 + 3, T) }
  F(x1 + 1, y + 1, z1 + 1, x1 + 5, y + 2, z1 + 2, AIR); F(x1 + 1, y, z1 + 1, x1 + 5, y, z1 + 2, BDPL)
  PORTE(x1 + dx, y + 1, z1 + 3, 'minecraft:iron_door', 'south', 'left', 'false')
  S(x1 + (dx < 4 ? 5 : 1), y + 2, z1, GP)
  S(x1 + 3, y + 2, z1 + 1, RUL)
}
function bdMeubleCont(x1, y, z1, col) { vrLitS(x1 + 1, y + 1, z1 + 1, col, 'east'); S(x1 + 5, y + 1, z1 + 1, RUBAR); S(x1 + 5, y + 1, z1 + 2, 'minecraft:chest[facing=west,type=single,waterlogged=false]') }

// ---- rue de terre : planches en guise de trottoir, ornieres, debris d'asphalte ----
function bdRue() {
  OX = VB.X0; OY = VB.Y0; OZ = VB.Z0; CUT = 999; GRAINE = 565
  for (var x = -16; x <= 143; x++) for (var z = 32; z <= 47; z++) {
    var r = R(), b
    if (z <= 33 || z >= 46) b = r < 0.55 ? BDPL : r < 0.75 ? 'minecraft:oak_planks' : r < 0.9 ? 'minecraft:packed_mud' : 'minecraft:coarse_dirt'
    else if (z == 37 || z == 42) b = r < 0.8 ? 'minecraft:dirt_path' : 'minecraft:mud'
    else b = r < 0.35 ? 'minecraft:coarse_dirt' : r < 0.6 ? 'minecraft:packed_mud' : r < 0.75 ? 'minecraft:gravel' : r < 0.88 ? 'minecraft:mud' : r < 0.95 ? RUK : RUN
    S(x, -1, z, b)
    if (b == 'minecraft:coarse_dirt' && R() < 0.15) SA(x, 0, z, 'minecraft:short_grass')
  }
  for (var x = 0; x <= 128; x += 16) { var z = (x / 16) % 2 ? 46 : 33; F(x + 4, 0, z, x + 4, 3, z, BDF); S(x + 4, 4, z, 'minecraft:lantern[hanging=false,waterlogged=false]') }
  bgVoiture(20, 38, 'x', 'brown', 1); bgVoiture(70, 40, 'x', 'gray', 1, true); bgVoiture(112, 36, 'x', 'green', 1)
  ;[[9, 33], [41, 46], [58, 33], [86, 46], [101, 33], [125, 46]].forEach(c => { S(c[0], 0, c[1], RUBAR); if (R() < 0.6) S(c[0] + 1, 0, c[1], BDFEU) })
  F(136, 0, 35, 136, 2, 44, BDF); bgVoiture(137, 37, 'z', 'black', 1, true); bgVoiture(137, 41, 'z', 'white', 1, true)
}

// ================= MARCHE (etals sous baches, braseros) =================
function bdEtal(x1, z1, x2, z2, face, col) {
  ;[[x1, z1], [x2, z1], [x1, z2], [x2, z2]].forEach(c => F(c[0], 0, c[1], c[0], 3, c[1], BDF))
  F(x1, 4, z1, x2, 4, z2, 'minecraft:' + col + '_wool')
  var zc = face == 'south' ? z2 : z1, zb = face == 'south' ? z1 + 1 : z2 - 1
  for (var x = x1 + 1; x <= x2 - 1; x++) { S(x, 0, zc, RUBAR); if (R() < 0.75) S(x, 1, zc, choix(['minecraft:pumpkin', 'minecraft:melon', 'minecraft:hay_block[axis=y]', 'supplementaries:sack', 'minecraft:decorated_pot', 'minecraft:dried_kelp_block'])) }
  ;[x1 + 1, x2 - 1].forEach(x => SA(x, 0, zb, choix([RUCOF, 'minecraft:barrel[facing=east,open=false]', 'supplementaries:sack'])))
}
function bdMarche() {
  bdSol(0, 0, 31, 31); F(0, -1, 10, 31, -1, 14, 'minecraft:dirt_path'); F(13, -1, 15, 18, -1, 31, 'minecraft:dirt_path')
  ;[[2, 8, 'blue'], [11, 17, 'orange'], [20, 26, 'red']].forEach(e => bdEtal(e[0], 5, e[1], 9, 'south', e[2]))
  ;[[2, 8, 'green'], [20, 26, 'blue']].forEach(e => bdEtal(e[0], 15, e[1], 19, 'north', e[2]))
  bdEtal(28, 5, 30, 9, 'south', 'yellow')
  // feu de camp entoure de bancs de rondins, charrette
  S(15, 0, 25, BDFEU); ;[[13, 25, 'z'], [17, 25, 'z'], [15, 23, 'x'], [15, 27, 'x']].forEach(b => S(b[0], 0, b[1], 'minecraft:stripped_oak_log[axis=' + b[2] + ']'))
  F(4, 0, 24, 6, 0, 26, 'minecraft:spruce_slab[type=top]'); S(4, 0, 27, 'minecraft:spruce_trapdoor[facing=south,half=bottom,open=true,powered=false,waterlogged=false]'); S(6, 0, 27, 'minecraft:spruce_trapdoor[facing=south,half=bottom,open=true,powered=false,waterlogged=false]'); S(5, 1, 25, 'minecraft:hay_block[axis=y]')
  ;[[24, 24], [25, 24], [27, 28], [1, 21]].forEach(c => S(c[0], 0, c[1], choix([RUBAR, 'minecraft:water_cauldron[level=2]', 'supplementaries:sack'])))
  for (var x = 0; x <= 31; x++) if (x < 13 || x > 18) S(x, 0, 0, BDF); for (var z = 1; z <= 31; z++) { S(0, 0, z, BDF); S(31, 0, z, BDF) }
}

// ================= CABANES SUR PILOTIS (ilot de cabanes, passerelle, echelle, potager) =================
function bdCabanes() {
  bdSol(0, 0, 31, 31); F(13, -1, 26, 18, -1, 31, 'minecraft:dirt_path')
  bdCab(2, 18, 8, 24, 0, 4, [5, 24, 'south'], [[2, 21], [8, 21]])
  bdCab(11, 19, 17, 25, 0, 4, [14, 25, 'south'], [[11, 22], [17, 22]])
  bdCab(20, 17, 28, 24, 0, 5, [24, 24, 'south'], [[20, 20], [28, 20], [22, 17]])
  bdCab(3, 5, 9, 11, 5, 4, [9, 8, 'east'], [[3, 8], [6, 5]])
  bdCab(13, 4, 20, 11, 0, 4, [16, 11, 'south'], [[13, 7], [20, 7]])
  bdCab(14, 5, 19, 10, 5, 4, [14, 8, 'west'], [[19, 7], [16, 5]]); [[14, 5], [19, 5], [14, 10], [19, 10]].forEach(c => F(c[0], 1, c[1], c[0], 4, c[1], AIR))
  // passerelle entre la cabane perchee et l'etage, echelle d'acces
  F(10, 5, 7, 13, 5, 10, BDPL); F(10, 6, 7, 12, 6, 7, BDF); F(11, 6, 10, 12, 6, 10, BDF)
  F(10, 0, 11, 10, 5, 11, 'minecraft:ladder[facing=east,waterlogged=false]')
  // meubles
  vrLitS(3, 1, 19, 'brown', 'south'); S(7, 1, 19, RUBAR); S(7, 1, 20, 'minecraft:crafting_table'); S(3, 1, 23, 'minecraft:chest[facing=east,type=single,waterlogged=false]'); S(5, 1, 21, 'minecraft:brown_carpet')
  vrLitS(12, 1, 20, 'blue', 'south'); S(16, 1, 20, 'minecraft:furnace[facing=west,lit=false]'); S(16, 1, 21, RUBAR); vrTab(12, 1, 23, 'none'); vrCh(13, 1, 23, 'west')
  vrLitS(21, 1, 18, 'red', 'south'); vrLitS(27, 1, 18, 'red', 'south'); S(24, 1, 18, 'minecraft:smoker[facing=south,lit=false]'); S(23, 1, 18, RUBAR); vrTab(25, 1, 21, 'none'); vrCh(26, 1, 21, 'west')
  vrLitS(4, 6, 6, 'green', 'south'); S(8, 6, 6, RUBAR); S(4, 6, 10, 'minecraft:chest[facing=east,type=single,waterlogged=false]')
  vrLitS(14, 1, 5, 'gray', 'south'); S(19, 1, 5, 'minecraft:crafting_table'); S(19, 1, 6, RUBAR); S(14, 1, 10, 'minecraft:chest[facing=east,type=single,waterlogged=false]')
  vrLitS(18, 6, 6, 'yellow', 'south'); S(15, 6, 6, RUBAR)
  // corde a linge, eau de pluie, potager
  F(11, 0, 14, 11, 2, 14, BDF); F(19, 0, 14, 19, 2, 14, BDF); F(12, 2, 14, 18, 2, 14, 'minecraft:chain[axis=x]')
  S(24, 0, 14, 'minecraft:water_cauldron[level=3]'); S(1, 0, 26, 'minecraft:water_cauldron[level=1]'); S(25, 0, 14, RUBAR)
  ;[5, 7, 9].forEach((z, k) => { F(23, -1, z, 28, -1, z, 'minecraft:farmland[moisture=0]'); F(23, 0, z, 28, 0, z, ['minecraft:potatoes[age=7]', 'minecraft:carrots[age=5]', 'minecraft:beetroots[age=3]'][k]) })
  for (var z = 3; z <= 11; z++) S(30, 0, z, BDF); for (var x = 22; x <= 30; x++) { S(x, 0, 3, BDF); S(x, 0, 11, BDF) }; S(26, 0, 11, AIR)
}

// ================= ATELIER DE RECUPERATION (conteneurs, hangar bache, voiture en demontage, tas de ferraille) =================
function bdAtelier() {
  bdSol(0, 0, 31, 31)
  bdCont(2, 0, 14, 'blue', 3); bdCont(2, 0, 19, 'red', 3); bdCont(2, 4, 14, 'green', 2)
  F(5, 0, 18, 5, 6, 18, 'minecraft:ladder[facing=south,waterlogged=false]');
  bdMeubleCont(2, 0, 14, 'blue'); S(3, 1, 20, 'minecraft:smithing_table'); S(4, 1, 20, 'minecraft:anvil[facing=east]'); S(7, 1, 20, RUBAR); S(7, 1, 21, RUCOF.replace('south', 'west')); bdMeubleCont(2, 4, 14, 'green')
  // hangar sous bache
  ;[[11, 8], [19, 8], [27, 8], [11, 22], [19, 22], [27, 22]].forEach(c => F(c[0], 0, c[1], c[0], 4, c[1], BDLOG))
  for (var z = 8; z <= 22; z++) F(11, 5, z, 27, 5, z, z % 4 < 2 ? 'minecraft:orange_wool' : 'minecraft:blue_wool')
  bgVoiture(15, 13, 'x', 'gray', 1, true)
  S(12, 0, 10, 'minecraft:smithing_table'); S(13, 0, 10, 'minecraft:anvil[facing=north]'); S(14, 0, 10, 'minecraft:grindstone[face=floor,facing=south]'); S(15, 0, 10, 'minecraft:crafting_table'); S(16, 0, 10, 'minecraft:blast_furnace[facing=south,lit=false]')
  S(25, 0, 10, 'minecraft:furnace[facing=west,lit=false]'); S(25, 0, 11, RUBAR); F(26, 0, 10, 26, 1, 11, 'minecraft:waxed_weathered_copper')
  ;[[13, 18], [14, 18], [22, 16], [23, 19], [24, 19], [25, 14]].forEach(c => S(c[0], 0, c[1], choix(['minecraft:iron_bars', 'minecraft:chain[axis=x]', RUBAR, 'minecraft:waxed_oxidized_copper', 'minecraft:light_weighted_pressure_plate[power=0]'])))
  ;[[19, 4], [11, 15], [27, 15]].forEach(c => S(c[0], 4, c[1] == 4 ? 12 : c[1], RUL))
  // tas de ferraille
  for (var x = 21; x <= 30; x++) for (var z = 24; z <= 30; z++) { var h = Math.floor(R() * (4 - Math.abs(x - 25) / 3)); for (var y = 0; y < h; y++) S(x, y, z, choix(['minecraft:waxed_oxidized_cut_copper', 'minecraft:waxed_weathered_copper', 'minecraft:iron_bars', BDPL, 'minecraft:coarse_dirt', 'minecraft:red_terracotta'])) }
  for (var x = 0; x <= 31; x++) S(x, 0, 0, BDF); for (var z = 1; z <= 31; z++) S(0, 0, z, BDF)
}

// ================= CONTENEURS EMPILES (trois niveaux, coursives, echelles, toit-jardin) =================
function bdConteneurs() {
  bdSol(0, 0, 31, 31); F(2, -1, 10, 26, -1, 12, 'minecraft:packed_mud')
  bdCont(3, 0, 6, 'orange', 3); bdCont(11, 0, 6, 'blue', 3); bdCont(19, 0, 6, 'white', 3)
  bdCont(3, 4, 6, 'red', 2); bdCont(11, 4, 6, 'green', 4); bdCont(7, 8, 6, 'gray', 3)
  ;[[3, 0, 'orange'], [11, 0, 'blue'], [19, 0, 'white'], [3, 4, 'red'], [11, 4, 'green'], [7, 8, 'gray']].forEach(c => bdMeubleCont(c[0], c[1], 6, c[2] == 'white' ? 'light_gray' : c[2]))
  // coursive du premier niveau sur poteaux, coursive haute en porte-a-faux
  F(3, 4, 10, 17, 4, 11, BDPL); ;[3, 10, 17].forEach(x => F(x, 0, 11, x, 3, 11, BDF)); F(3, 5, 11, 17, 5, 11, BDF); S(10, 5, 11, BDF)
  F(8, 0, 10, 8, 4, 10, 'minecraft:ladder[facing=south,waterlogged=false]')
  F(7, 8, 10, 13, 8, 11, BDPL); F(7, 9, 11, 13, 9, 11, BDF); F(12, 5, 10, 12, 8, 10, 'minecraft:ladder[facing=south,waterlogged=false]')
  // toits : panneaux, bidons, pots
  for (var x = 8; x <= 12; x++) if (x % 2 == 0) S(x, 12, 7, 'minecraft:daylight_detector[inverted=false,power=0]'); S(13, 12, 9, 'minecraft:lightning_rod[facing=up,powered=false,waterlogged=false]')
  ;[[3, 8], [4, 8], [5, 9]].forEach(c => S(c[0], 8, c[1], choix(['minecraft:potted_fern', 'minecraft:potted_dandelion', 'minecraft:composter[level=4]']))); S(16, 8, 7, RUBAR); S(16, 8, 8, RUBAR)
  ;[[20, 4, 7], [24, 4, 8]].forEach(c => S(c[0], c[1], c[2], 'minecraft:water_cauldron[level=2]'))
  // cour : feu, corde a linge, pneus
  S(14, 0, 18, BDFEU); ;[[12, 18], [16, 18]].forEach(c => S(c[0], 0, c[1], 'minecraft:stripped_spruce_log[axis=z]'))
  F(4, 0, 22, 4, 2, 22, BDF); F(10, 0, 22, 10, 2, 22, BDF); F(5, 2, 22, 9, 2, 22, 'minecraft:chain[axis=x]')
  ;[[22, 20], [22, 21], [23, 20]].forEach(c => S(c[0], 0, c[1], RUK)); S(22, 1, 20, RUK)
  for (var x = 0; x <= 31; x++) S(x, 0, 1, BDF)
}

// ================= CANTINE COMMUNAUTAIRE (halle sur poteaux, four, tablees) =================
function bdCantine() {
  bdSol(0, 0, 31, 31); F(2, -1, 5, 29, -1, 21, 'minecraft:packed_mud')
  for (var x = 2; x <= 29; x++) F(x, 0, 21, x, 4, 21, bdMat(x, 21))
  F(2, 0, 14, 2, 4, 20, BDPL)
  ;[2, 9, 16, 23, 29].forEach(x => [5, 12].forEach(z => F(x, 0, z, x, 4, z, BDF)))
  for (var x = 1; x <= 30; x++) for (var z = 4; z <= 22; z++) S(x, 5, z, choix(BDT))
  // cuisine : four a pain, feux et marmites, comptoir de service
  F(3, 0, 17, 5, 2, 19, RUB); S(4, 1, 17, 'minecraft:furnace[facing=north,lit=false]'); F(4, 3, 18, 4, 6, 18, RUB)
  ;[7, 9].forEach(x => { S(x, 0, 18, BDFEU); S(x, 1, 18, 'minecraft:water_cauldron[level=2]') })
  S(11, 0, 19, 'minecraft:smoker[facing=north,lit=false]'); S(12, 0, 19, RUBAR); S(13, 0, 19, RUBAR); S(13, 1, 19, 'supplementaries:sack')
  for (var x = 3; x <= 9; x++) { vrCpt(x, 0, 14, 'north', 'smooth_stone'); if (x % 2) S(x, 1, 14, 'handcrafted:white_bowl') }
  // tablees et bancs
  ;[8, 16].forEach(z => { for (var x = 12; x <= 27; x++) { if (x == 19 || x == 20) continue; vrTab(x, 0, z, 'none'); S(x, 0, z - 1, btSt('spruce', 'north')); S(x, 0, z + 1, btSt('spruce', 'south')) } })
  ;[[6, 7], [13, 10], [24, 10], [20, 17]].forEach(c => S(c[0], 4, c[1], RUL))
  // reserve d'eau et file d'attente cote rue
  F(24, 0, 1, 26, 1, 2, 'minecraft:barrel[facing=up,open=false]'); S(27, 0, 1, 'minecraft:water_cauldron[level=3]')
  for (var x = 6; x <= 14; x++) S(x, 0, 2, BDF); S(10, 0, 2, AIR)
}

// ================= RUELLE (six cabanes autour d'une venelle, cordes a linge) =================
function bdRuelle() {
  bdSol(0, 0, 31, 31)
  for (var z = 0; z <= 31; z++) for (var x = 14; x <= 17; x++) S(x, -1, z, R() < 0.6 ? 'minecraft:dirt_path' : BDPL)
  var W1 = [[2, 2, 11, 8, 4, 5], [3, 11, 11, 17, 4, 14], [2, 20, 11, 28, 5, 24]], E1 = [[20, 3, 29, 10, 4, 6], [20, 13, 28, 19, 4, 16], [20, 22, 29, 29, 5, 25]]
  var cols = ['brown', 'blue', 'green', 'red', 'orange', 'gray']
  W1.forEach((c, i) => { bdCab(c[0], c[1], c[2], c[3], 0, c[4], [c[2], c[5], 'east'], [[c[0], c[5]], [c[0] + 4, c[1]]]); vrLitS(c[0] + 1, 1, c[1] + 1, cols[i], 'south'); S(c[0] + 1, 1, c[3] - 1, RUBAR); vrTab(c[0] + 4, 1, c[3] - 1, 'none'); S(c[0] + 3, 1, c[1] + 1, 'minecraft:crafting_table') })
  E1.forEach((c, i) => { bdCab(c[0], c[1], c[2], c[3], 0, c[4], [c[0], c[5], 'west'], [[c[2], c[5]], [c[0] + 4, c[1]]]); vrLitS(c[2] - 1, 1, c[1] + 1, cols[i + 3], 'south'); S(c[2] - 1, 1, c[3] - 1, RUBAR); vrTab(c[2] - 4, 1, c[3] - 1, 'none'); S(c[2] - 3, 1, c[1] + 1, 'minecraft:furnace[facing=south,lit=false]') })
  ;[7, 26].forEach(z => F(12, 4, z, 19, 4, z, 'minecraft:chain[axis=x]'))
  S(15, 0, 11, BDFEU); S(16, 0, 19, 'minecraft:water_cauldron[level=2]'); S(14, 0, 30, RUBAR); S(17, 0, 3, 'supplementaries:sack')
}

// ================= CHATEAU D'EAU ET JARDINS (cuve sur pilotis, serre, poulailler, potager collectif) =================
function bdChateau() {
  bdSol(0, 0, 31, 31)
  ;[[11, 11], [19, 11], [11, 19], [19, 19]].forEach(c => F(c[0], 0, c[1], c[0], 9, c[1], BDLOG))
  F(12, 4, 11, 18, 4, 11, BDF); F(12, 4, 19, 18, 4, 19, BDF); F(11, 4, 12, 11, 4, 18, BDF); F(19, 4, 12, 19, 4, 18, BDF)
  F(10, 10, 10, 20, 10, 20, BDPL); W(10, 10, 20, 20, 11, 11, BDF)
  ruRond(15, 15, 12, 11, 17, 'minecraft:waxed_oxidized_copper', true); ruRond(15, 15, 12, 18, 18, 'minecraft:waxed_weathered_cut_copper_slab[type=bottom]', true)
  F(20, 0, 19, 20, 10, 19, 'minecraft:ladder[facing=east,waterlogged=false]'); S(20, 11, 19, AIR)
  ;[[14, 14], [16, 14], [14, 16], [16, 16]].forEach(c => S(c[0], 0, c[1], 'minecraft:water_cauldron[level=3]')); S(15, 0, 15, RUBAR)
  // potager collectif clos
  for (var x = 1; x <= 30; x++) S(x, 0, 21, BDF); for (var z = 22; z <= 30; z++) { S(1, 0, z, BDF); S(30, 0, z, BDF) }; F(14, 0, 21, 17, 0, 21, AIR)
  ;[23, 25, 27, 29].forEach((z, k) => { F(3, -1, z, 28, -1, z, 'minecraft:farmland[moisture=0]'); for (var x = 3; x <= 28; x++) S(x, 0, z, ['minecraft:wheat[age=6]', 'minecraft:carrots[age=7]', 'minecraft:potatoes[age=6]', 'minecraft:beetroots[age=3]'][(k + (x > 15 ? 1 : 0)) % 4]) })
  ;[24, 26, 28].forEach(z => F(2, -1, z, 29, -1, z, 'minecraft:dirt_path'))
  F(15, 0, 26, 15, 1, 26, BDF); S(14, 1, 26, BDF); S(16, 1, 26, BDF); S(15, 2, 26, 'minecraft:carved_pumpkin[facing=north]')
  S(29, 0, 22, 'minecraft:composter[level=6]'); S(2, 0, 22, 'minecraft:water_cauldron[level=2]')
  // serre de recuperation
  W(22, 2, 29, 9, 0, 3, GP); ;[[22, 2], [29, 2], [22, 9], [29, 9]].forEach(c => F(c[0], 0, c[1], c[0], 3, c[1], BDLOG)); F(22, 4, 2, 29, 4, 9, 'minecraft:glass'); F(25, 0, 9, 25, 1, 9, AIR)
  F(23, -1, 3, 28, -1, 8, 'minecraft:packed_mud'); for (var x = 23; x <= 28; x++) { S(x, 0, 3, 'minecraft:spruce_slab[type=bottom]'); S(x, -1, 6, 'minecraft:farmland[moisture=0]'); S(x, 0, 6, 'minecraft:carrots[age=7]') }
  ;[23, 25, 27].forEach(x => S(x, 1, 3, choix(['minecraft:potted_fern', 'minecraft:potted_red_tulip', 'minecraft:potted_cactus'])))
  // poulailler
  bdCab(2, 2, 8, 8, 0, 3, [5, 8, 'south'], [[2, 5]]); F(3, 1, 3, 4, 1, 3, 'minecraft:hay_block[axis=y]'); S(7, 1, 3, 'minecraft:composter[level=3]')
  F(1, 0, 10, 9, 0, 10, BDF); S(1, 0, 9, BDF); S(9, 0, 9, BDF)
}

// ================= ECOLE ET DISPENSAIRE (classe dans un car, cabane de soins, balancoires) =================
function bdEcole() {
  bdSol(0, 0, 31, 31)
  // car scolaire transforme en classe
  ;[5, 6, 15, 16].forEach(x => { S(x, 0, 6, RUK); S(x, 0, 9, RUK) })
  F(4, 1, 6, 17, 4, 9, 'minecraft:yellow_concrete'); F(5, 2, 7, 16, 3, 8, AIR); F(5, 1, 7, 16, 1, 8, RUN); F(4, 1, 6, 17, 1, 6, RUK); F(4, 1, 9, 17, 1, 9, RUK)
  for (var x = 5; x <= 16; x++) if (x % 3) { S(x, 3, 6, GP); S(x, 3, 9, GP) }
  F(4, 3, 7, 4, 3, 8, GP); F(6, 2, 6, 6, 3, 6, AIR); S(6, 0, 5, 'minecraft:cobblestone'); S(6, 1, 5, btSt('stone', 'south'))
  F(16, 2, 7, 16, 3, 8, 'minecraft:black_concrete'); ;[8, 10, 12].forEach(x => { vrCh(x, 2, 7, 'east', 'blue'); vrCh(x, 2, 8, 'east', 'blue') }); S(14, 2, 8, 'handcrafted:stackable_book')
  // dispensaire
  bdCab(19, 3, 29, 12, 0, 4, [24, 3, 'north'], [[19, 7], [29, 7], [22, 12], [26, 12]])
  ;[20, 22, 26, 28].forEach(x => vrLitS(x, 1, 11, 'white', 'north'))
  vrArm(28, 1, 4, 'west'); S(20, 1, 4, 'minecraft:water_cauldron[level=2]'); vrTab(26, 1, 6, 'white'); S(26, 2, 6, 'supplementaries:jar'); vrCh(27, 1, 6, 'west', 'white')
  F(23, 3, 3, 25, 3, 3, 'minecraft:red_wool'); S(24, 4, 3, 'minecraft:red_wool')
  // balancoires, bac a sable, bancs
  F(6, 0, 18, 6, 4, 18, BDF); F(14, 0, 18, 14, 4, 18, BDF); F(7, 4, 18, 13, 4, 18, BDF)
  ;[8, 12].forEach(x => { F(x, 2, 18, x, 3, 18, 'minecraft:chain[axis=y]'); S(x, 1, 18, 'minecraft:spruce_slab[type=bottom]') })
  F(17, -1, 20, 21, -1, 24, 'minecraft:sand'); W(16, 19, 22, 25, 0, 0, 'minecraft:spruce_slab[type=bottom]')
  ;[[5, 24], [6, 24]].forEach(c => S(c[0], 0, c[1], btSt('spruce', 'north'))); S(26, 0, 22, 'minecraft:water_cauldron[level=1]')
  ;[[24, 26], [25, 26], [26, 26], [24, 28], [25, 28], [26, 28]].forEach(c => { S(c[0], -1, c[1], 'minecraft:farmland[moisture=0]'); S(c[0], 0, c[1], 'minecraft:carrots[age=6]') })
}

// ---- palette et vues ----
var THM_BD = finPalette('spruce', {})
function vuesBidonvilleF() {
  vue('bd_ensemble_sud', 0, 0, 64, 52, 120, 64, 8, 34, 3000)
  vue('bd_ensemble_no', 0, 0, -30, 50, -30, 64, 6, 40, 3000)
  vue('bd_rue_ouest', 0, 0, -8, 3, 39.5, 60, 4, 40)
  vue('bd_rue_est', 0, 0, 134, 3, 40.5, 64, 4, 40)
  vue('bd_marche', 0, 0, 16, 7, 40, 15, 2, 12)
  vue('bd_marche_allee', 0, 0, 1, 3, 12, 28, 1.5, 12.5)
  vue('bd_cabanes', 32, 0, 16, 9, 42, 15, 4, 14)
  vue('bd_cabanes_passerelle', 32, 0, 11.5, 8, 16, 11.5, 6, 6)
  vue('bd_cabane_interieur', 32, 0, 6.5, 2.6, 22.5, 3, 1.5, 19.5)
  vue('bd_atelier', 64, 0, 16, 8, 42, 16, 3, 14)
  vue('bd_atelier_hangar', 64, 0, 26, 3.5, 20, 12, 1.5, 12)
  vue('bd_conteneurs', 96, 0, 16, 10, 40, 13, 6, 8)
  vue('bd_conteneurs_coursive', 96, 0, 17, 6.5, 10.5, 4, 5.5, 10.5)
  vue('bd_cantine', 0, 48, 16, 7, -8, 16, 2, 12)
  vue('bd_cantine_salle', 0, 48, 27, 3, 6.5, 6, 1, 16)
  vue('bd_ruelle', 32, 48, 15.5, 4, -4, 15.5, 2, 20)
  vue('bd_ruelle_haut', 32, 48, 15.5, 16, -6, 15.5, 2, 14)
  vue('bd_chateau', 64, 48, 16, 10, -10, 15, 9, 15)
  vue('bd_jardins', 64, 48, 16, 10, 36, 15, 0, 24)
  vue('bd_serre', 64, 48, 27, 2.5, 7.5, 23, 1, 3.5)
  vue('bd_ecole', 96, 48, 14, 7, -8, 14, 2, 10)
  vue('bd_bus', 96, 48, 5.5, 3.2, 7.5, 16, 2.2, 8)
  vue('bd_dispensaire', 96, 48, 27, 3, 5.5, 20, 1, 10.5)
  vue('bd_jeux', 96, 48, 10, 4, 26, 10, 2, 18)
  vue('bd_coupe_cabanes', 144, 0, 16, 24, 44, 15, 0, 14)
  vue('bd_coupe_cabanes_haut', 180, 0, 16, 28, 44, 15, 5, 10)
  vue('bd_coupe_conteneurs', 216, 0, 16, 22, 30, 14, 0, 8)
  vue('bd_coupe_conteneurs_haut', 252, 0, 16, 26, 32, 14, 4, 8)
  vue('bd_coupe_ruelle', 144, 48, 16, 26, -12, 16, 0, 15)
  vue('bd_coupe_ecole', 180, 48, 16, 24, -12, 16, 0, 10)
}
var QFIN_BD = function () {
  HB2 = true; FIN = true; THM = THM_BD
  var rb = ['brown', 'orange', 'blue', 'green']
  HM = {}; bdRue(); finAncrage()
  lot(QF(bdMarche, null, null), 0, 0, 999, 1011, 32, 6); lot(QF(bdCabanes, null, rb), 32, 0, 999, 1021, 32, 12); lot(QF(bdAtelier, null, rb), 64, 0, 999, 1031, 32, 9); lot(QF(bdConteneurs, null, rb), 96, 0, 999, 1041, 32, 13)
  lot(QF(bdCantine, null, null), 0, 48, 999, 1051, 32, 7); lot(QF(bdRuelle, null, rb), 32, 48, 999, 1061, 32, 7); lot(QF(bdChateau, null, rb), 64, 48, 999, 1071, 32, 19); lot(QF(bdEcole, null, rb), 96, 48, 999, 1081, 32, 6)
  lot(QF(bdCabanes, null, rb), 144, 0, 4, 1021, 32, 12); lot(QF(bdCabanes, null, rb), 180, 0, 9, 1021, 32, 12); lot(QF(bdConteneurs, null, rb), 216, 0, 2, 1041, 32, 13); lot(QF(bdConteneurs, null, rb), 252, 0, 6, 1041, 32, 13)
  lot(QF(bdRuelle, null, rb), 144, 48, 3, 1061, 32, 7); lot(QF(bdEcole, null, rb), 180, 48, 3, 1081, 32, 6)
  vlog('FIN volets ' + FIN_NV + ' rideaux ' + FIN_NR + ' paves ' + PAVE_NB + ' retraits ancrage ' + ANC_NB)
  HB2 = false; FIN = false; THM = null; HM = {}
}
