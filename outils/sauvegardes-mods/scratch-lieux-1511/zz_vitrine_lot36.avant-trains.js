// ================= QUARTIER ROUILLE (friche industrielle 1900-1970) : usine a sheds, entrepot, garage et casse, corons, silos, gare de fret, sous-station, cafe ouvrier =================
var RUB = 'minecraft:bricks', RUM = 'minecraft:mud_bricks', RUC = 'minecraft:waxed_weathered_cut_copper', RUO = 'minecraft:waxed_oxidized_cut_copper'
var RUS = 'minecraft:smooth_stone', RUA = 'minecraft:polished_andesite', RUT = 'minecraft:spruce_planks', RUN = 'minecraft:gray_concrete', RUK = 'minecraft:black_concrete'
var RUV = 'minecraft:light_gray_stained_glass_pane', RUW = 'minecraft:white_terracotta', RUI = 'minecraft:iron_block'
var RUL = 'minecraft:lantern[hanging=true,waterlogged=false]', RUSLC = 'minecraft:waxed_weathered_cut_copper_slab[type=bottom]', RUSLS = 'minecraft:smooth_stone_slab[type=bottom]'
var RUBAR = 'minecraft:barrel[facing=up,open=false]', RUCOF = 'minecraft:chest[facing=south,type=single,waterlogged=false]'
function ruSol(x1, z1, x2, z2) { for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) { var r = R(), b = r < 0.42 ? 'minecraft:gravel' : r < 0.7 ? 'minecraft:coarse_dirt' : r < 0.84 ? 'minecraft:andesite' : r < 0.95 ? RUN : 'minecraft:cobblestone'; S(x, -1, z, b); if (b == 'minecraft:coarse_dirt' && R() < 0.12) SA(x, 0, z, 'minecraft:short_grass') } }
function ruBitume(x1, z1, x2, z2) { for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) { var r = R(); S(x, -1, z, r < 0.6 ? RUK : r < 0.85 ? RUN : r < 0.94 ? 'minecraft:gray_concrete_powder' : 'minecraft:gravel') } }
function ruSusp(x, y, z) { S(x, y, z, 'minecraft:chain[axis=y]'); S(x, y - 1, z, RUL) }
// toit a deux pans, faitage selon x, murs za et zb arretes a y0-1, debord d'un bloc, pignons en "gab" aux bouts x1 et x2
function ruToit(x1, x2, za, zb, y0, m, gab) {
  for (var i = 0; ; i++) {
    var zn = za - 1 + i, zs = zb + 1 - i, y = y0 - 1 + i
    if (zn > zs) break
    if (gab && i >= 1 && zn + 1 <= zs - 1) { F(x1, y, zn + 1, x1, y, zs - 1, gab); F(x2, y, zn + 1, x2, y, zs - 1, gab) }
    F(x1 - 1, y, zn, x2 + 1, y, zn, btSt(m, 'south'))
    if (zs != zn) F(x1 - 1, y, zs, x2 + 1, y, zs, btSt(m, 'north'))
  }
}
// silo : anneau plein (pas de jour diagonal) de rayon carre r2
function ruRond(cx, cz, r2, y1, y2, m, plein) {
  function dans(a, b) { return a * a + b * b <= r2 }
  for (var a = -4; a <= 4; a++) for (var b = -4; b <= 4; b++) if (dans(a, b) && (plein || !dans(a + 1, b) || !dans(a - 1, b) || !dans(a, b + 1) || !dans(a, b - 1))) F(cx + a, y1, cz + b, cx + a, y2, cz + b, m)
}

// ---- rue industrielle : trottoirs fissures, chaussee rapiecee, voie ferree noyee dans la chaussee ----
function ruRue() {
  OX = VB.X0; OY = VB.Y0; OZ = VB.Z0; CUT = 999; GRAINE = 555
  for (var x = -16; x <= 143; x++) for (var z = 32; z <= 47; z++) {
    var r = R(), b
    if (z <= 33 || z >= 46) b = r < 0.55 ? 'mcwpaths:stone_flagstone' : r < 0.8 ? 'mcwpaths:andesite_flagstone' : r < 0.92 ? 'minecraft:gravel' : 'minecraft:coarse_dirt'
    else if (z == 34 || z == 45) b = r < 0.85 ? RUA : 'minecraft:cobblestone'
    else if (z == 43) b = 'minecraft:cobblestone'
    else b = r < 0.6 ? RUK : r < 0.84 ? RUN : r < 0.92 ? 'minecraft:gray_concrete_powder' : r < 0.97 ? 'minecraft:gravel' : 'minecraft:cobblestone'
    S(x, -1, z, b)
    if (b == 'minecraft:coarse_dirt' && R() < 0.3) SA(x, 0, z, 'minecraft:short_grass')
  }
  for (var x = -16; x <= 143; x++) { if (((x % 8) + 8) % 8 < 4 && R() < 0.75) S(x, -1, 39, 'minecraft:white_concrete'); S(x, 0, 43, 'minecraft:rail[shape=east_west,waterlogged=false]') }
  for (var x = 0; x <= 128; x += 32) { btLampe(x + 6, 33, 'east'); btLampe(x + 22, 46, 'east') }
  bgVoiture(10, 36, 'x', 'brown', 1); bgVoiture(52, 40, 'x', 'gray', 1); bgVoiture(88, 36, 'x', 'blue', 1); bgVoiture(118, 40, 'x', 'white', 1)
  ;[[3, 33], [30, 46], [61, 33], [70, 46], [99, 33], [127, 46]].forEach(c => { S(c[0], 0, c[1], RUBAR); if (R() < 0.5) S(c[0] + 1, 0, c[1], 'minecraft:barrel[facing=east,open=false]') })
  ;[[40, 33], [108, 46]].forEach(c => { F(c[0], 0, c[1], c[0] + 1, 0, c[1], 'minecraft:spruce_slab[type=bottom]') })
  F(136, 0, 35, 136, 1, 42, 'minecraft:iron_bars'); F(136, 0, 44, 136, 1, 44, 'minecraft:iron_bars'); S(136, 2, 35, RUI); S(136, 2, 44, RUI)
}

// ================= USINE A SHEDS (halle de briques, toiture en dents de scie, cheminee) =================
function ruUsine() {
  ruSol(0, 0, 31, 31); ruBitume(0, 26, 31, 31)
  F(3, 0, 4, 28, 0, 24, RUS)
  W(3, 4, 28, 24, 1, 10, RUB)
  for (var a = 4; a <= 27; a++) if ((a - 3) % 5) { F(a, 4, 4, a, 8, 4, RUV); F(a, 4, 24, a, 8, 24, RUV) }
  for (var a = 5; a <= 23; a++) if ((a - 4) % 5) { F(3, 4, a, 3, 8, a, RUV); F(28, 4, a, 28, 8, a, RUV) }
  ;[3, 8, 13, 18, 23, 28].forEach(x => { F(x, 0, 25, x, 10, 25, RUB); F(x, 0, 3, x, 10, 3, RUB) })
  F(3, 9, 4, 28, 9, 4, RUM); F(3, 9, 24, 28, 9, 24, RUM); F(3, 9, 5, 3, 9, 23, RUM); F(28, 9, 5, 28, 9, 23, RUM)
  // toiture en sheds : verrieres au nord, versants de cuivre
  ;[4, 8, 12, 16, 20].forEach(zt => {
    F(4, 11, zt, 27, 13, zt, 'minecraft:light_gray_stained_glass')
    F(3, 13, zt + 1, 28, 13, zt + 1, btSt('waxed_weathered_cut_copper', 'north')); F(3, 12, zt + 2, 28, 12, zt + 2, btSt('waxed_weathered_cut_copper', 'north')); F(3, 11, zt + 3, 28, 11, zt + 3, btSt('waxed_weathered_cut_copper', 'north'))
    F(3, 11, zt, 3, 13, zt, RUB); F(28, 11, zt, 28, 13, zt, RUB)
    ;[3, 28].forEach(x => { F(x, 11, zt + 1, x, 12, zt + 1, RUB); S(x, 11, zt + 2, RUB) })
  })
  F(3, 11, 24, 28, 11, 24, RUSLC)
  // grande porte a rideau releve a moitie, porte de service
  F(14, 1, 24, 17, 6, 24, AIR); F(14, 5, 24, 17, 6, 24, 'minecraft:iron_trapdoor[facing=north,half=top,open=true,powered=false,waterlogged=false]'); F(14, 7, 24, 17, 7, 24, RUI)
  F(14, -1, 25, 17, -1, 27, RUN)
  PORTE(25, 1, 24, 'minecraft:iron_door', 'south', 'left', 'false'); F(24, 4, 25, 26, 4, 25, RUSLS)
  // charpente : poteaux de fonte, poutres, pont roulant
  ;[9, 14, 19].forEach(z => { F(4, 10, z, 27, 10, z, RUC); ;[11, 20].forEach(x => F(x, 1, z, x, 9, z, 'minecraft:polished_basalt[axis=y]')) })
  F(15, 9, 5, 15, 9, 23, 'minecraft:yellow_concrete'); F(15, 6, 12, 15, 8, 12, 'minecraft:chain[axis=y]'); S(15, 5, 12, 'minecraft:lightning_rod[facing=down,powered=false,waterlogged=false]')
  ;[9, 14, 19].forEach(z => [7, 24].forEach(x => ruSusp(x, 9, z)))
  // allees peintes, forge, machines-outils
  F(4, 0, 11, 27, 0, 11, 'minecraft:yellow_concrete'); F(4, 0, 17, 27, 0, 17, 'minecraft:yellow_concrete')
  S(5, 1, 6, 'minecraft:blast_furnace[facing=south,lit=false]'); S(6, 1, 6, 'minecraft:smithing_table'); S(7, 1, 6, 'minecraft:anvil[facing=east]'); S(8, 1, 6, 'minecraft:grindstone[face=floor,facing=south]'); S(9, 1, 6, 'minecraft:stonecutter[facing=south]')
  F(5, 1, 5, 9, 1, 5, 'minecraft:barrel[facing=south,open=false]')
  for (var x = 13; x <= 25; x += 4) { S(x, 1, 7, 'minecraft:dropper[facing=east,triggered=false]'); S(x + 1, 1, 7, RUI); S(x + 2, 1, 7, 'minecraft:polished_blackstone_slab[type=top]'); S(x + 1, 2, 7, 'minecraft:lever[face=floor,facing=south,powered=false]') }
  for (var x = 13; x <= 25; x += 4) { S(x, 1, 14, 'minecraft:smoker[facing=north,lit=false]'); S(x + 1, 1, 14, 'minecraft:polished_deepslate'); S(x + 1, 2, 14, 'minecraft:heavy_weighted_pressure_plate[power=0]') }
  ;[[20, 22], [21, 22], [22, 22], [26, 22], [27, 22]].forEach((c, i) => S(c[0], 1, c[1], ['minecraft:crafting_table', RUBAR, RUCOF.replace('south', 'north'), 'minecraft:grindstone[face=floor,facing=north]', RUBAR][i]))
  ;[[6, 13], [7, 13], [6, 15], [24, 10]].forEach(c => SA(c[0], 1, c[1], choix([RUBAR, 'supplementaries:sack', 'minecraft:barrel[facing=east,open=false]'])))
  // bureau du contremaitre
  F(4, 1, 19, 9, 4, 19, RUW); F(9, 1, 20, 9, 4, 23, RUW); F(4, 5, 19, 9, 5, 23, RUT)
  F(5, 2, 19, 8, 3, 19, RUV); PORTE(9, 1, 21, 'minecraft:spruce_door', 'east', 'left', 'false')
  vrBur(5, 1, 22, 'north'); vrCh(5, 1, 21, 'south'); vrArm(8, 1, 23, 'north'); S(4, 1, 20, RUBAR); S(6, 4, 21, RUL); SA(5, 6, 20, RUBAR); SA(7, 6, 22, 'supplementaries:sack')
  // haute cheminee et cuve
  F(29, 0, 5, 31, 24, 7, RUB); S(30, 24, 6, 'minecraft:coal_block'); ;[8, 16].forEach(y => F(29, y, 5, 31, y, 7, RUM)); F(29, 25, 5, 31, 25, 7, 'minecraft:brick_wall'); S(30, 25, 6, AIR)
  F(30, 6, 4, 30, 23, 4, 'minecraft:ladder[facing=north,waterlogged=false]')
  F(29, 0, 11, 31, 5, 15, 'minecraft:waxed_oxidized_copper'); S(30, 6, 13, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false,powered=false,waterlogged=false]'); F(29, 0, 16, 31, 0, 16, 'minecraft:iron_bars')
  // cour : palettes, futs, voiture brulee
  ;[[26, 28], [27, 28], [28, 28], [26, 29], [27, 29]].forEach(c => S(c[0], 0, c[1], 'minecraft:spruce_slab[type=bottom]')); S(28, 0, 29, RUBAR); S(29, 0, 29, RUBAR); S(29, 1, 29, 'minecraft:barrel[facing=east,open=false]')
  bgVoiture(2, 28, 'x', 'brown', 1)
  ;[[1, 1], [2, 1], [12, 1], [20, 2]].forEach(c => S(c[0], 0, c[1], choix([RUBAR, 'minecraft:iron_bars', 'minecraft:spruce_slab[type=bottom]'])))
}

// ================= ENTREPOT (bardage cuivre, quais de chargement, rayonnages, remorque) =================
function ruEntrepot() {
  ruSol(0, 0, 31, 31); ruBitume(0, 23, 31, 31)
  F(2, 0, 3, 29, 0, 22, RUS)
  W(2, 3, 29, 22, 1, 9, RUC); W(2, 3, 29, 22, 1, 1, RUA)
  for (var x = 2; x <= 29; x += 3) { F(x, 2, 3, x, 9, 3, RUO); F(x, 2, 22, x, 9, 22, RUO) }
  for (var z = 6; z <= 21; z += 3) { F(2, 2, z, 2, 9, z, RUO); F(29, 2, z, 29, 9, z, RUO) }
  for (var x = 3; x <= 28; x++) if ((x - 2) % 3) { S(x, 7, 3, RUV); S(x, 7, 22, RUV) }
  F(2, 10, 3, 29, 10, 22, RUSLC); F(7, 10, 8, 24, 10, 9, 'minecraft:light_gray_stained_glass'); F(7, 10, 15, 24, 10, 16, 'minecraft:light_gray_stained_glass')
  // trois quais, rideaux releves, auvent porte par des poteaux
  ;[[4, 7], [12, 15], [20, 23]].forEach(q => {
    F(q[0], 1, 22, q[1], 4, 22, AIR); F(q[0], 3, 22, q[1], 4, 22, 'minecraft:iron_trapdoor[facing=north,half=top,open=true,powered=false,waterlogged=false]')
    F(q[0], -1, 23, q[0], -1, 27, 'minecraft:yellow_concrete'); F(q[1], -1, 23, q[1], -1, 27, 'minecraft:yellow_concrete')
    S(q[0] - 1, 0, 23, RUK); S(q[1] + 1, 0, 23, RUK)
  })
  F(2, 6, 23, 29, 6, 25, RUSLS); ;[2, 10, 18, 29].forEach(x => F(x, 0, 25, x, 5, 25, 'minecraft:iron_bars'))
  // remorque de semi a quai (bequilles a l'avant)
  F(12, 1, 24, 14, 3, 30, 'minecraft:white_concrete'); F(12, 1, 24, 14, 1, 30, 'minecraft:light_gray_concrete'); F(12, 0, 25, 14, 0, 26, RUK); S(12, 0, 29, 'minecraft:iron_bars'); S(14, 0, 29, 'minecraft:iron_bars')
  F(13, 1, 24, 13, 3, 24, AIR)
  // rayonnages
  ;[6, 10, 11, 15, 16].forEach(z => {
    ;[2, 4, 6].forEach(y => F(4, y, z, 19, y, z, 'minecraft:spruce_slab[type=top]'))
    ;[4, 9, 14, 19].forEach(x => F(x, 1, z, x, 6, z, 'minecraft:iron_bars'))
    for (var x = 5; x <= 18; x++) if (x != 9 && x != 14) [1, 3, 5].forEach(y => { if (R() < 0.6) SA(x, y, z, choix([RUBAR, 'supplementaries:sack', RUCOF, 'minecraft:white_wool', 'minecraft:barrel[facing=east,open=false]'])) })
  })
  ;[[9, 4], [16, 8], [24, 13], [21, 17]].forEach(c => ruSusp(c[0], 9, c[1]))
  // chariot elevateur, palettes au sol
  F(22, 0, 13, 22, 0, 14, 'minecraft:yellow_concrete'); S(22, 1, 14, 'minecraft:black_carpet'); S(22, 1, 13, 'minecraft:iron_bars'); F(22, 0, 12, 22, 2, 12, 'minecraft:chain[axis=y]'); S(22, 0, 11, 'minecraft:iron_trapdoor[facing=south,half=bottom,open=false,powered=false,waterlogged=false]')
  ;[[24, 17], [25, 17], [26, 18]].forEach(c => { S(c[0], 0, c[1], 'minecraft:spruce_slab[type=bottom]') }); SA(25, 1, 17, 'minecraft:white_wool')
  // bureau vitre du chef de quai
  F(24, 1, 9, 28, 4, 9, RUW); F(24, 1, 4, 24, 4, 8, RUW); F(24, 5, 4, 28, 5, 9, RUT); F(25, 2, 9, 27, 3, 9, RUV); PORTE(24, 1, 7, 'minecraft:spruce_door', 'west', 'left', 'false')
  vrBur(26, 1, 5, 'south'); vrCh(26, 1, 6, 'north'); vrArm(28, 1, 8, 'west'); S(28, 1, 4, RUBAR); S(26, 4, 7, RUL)
  ;[[1, 1], [30, 1], [30, 12]].forEach(c => S(c[0], 0, c[1], RUBAR))
}

// ================= GARAGE ET CASSE (atelier a deux baies, fosse, pont, cimetiere de voitures) =================
function ruGarage() {
  ruSol(0, 0, 31, 31); ruBitume(0, 22, 18, 31)
  F(2, 0, 6, 17, 0, 21, RUS); W(2, 6, 17, 21, 1, 5, RUB); W(2, 6, 17, 21, 4, 5, RUC); F(2, 6, 6, 17, 6, 21, RUC); W(2, 6, 17, 21, 7, 7, RUSLC)
  F(4, 2, 6, 5, 3, 6, RUV); F(13, 2, 6, 14, 3, 6, RUV); F(2, 2, 10, 2, 3, 12, RUV); F(17, 2, 10, 17, 3, 12, RUV)
  ;[[4, 7], [11, 14]].forEach(q => { F(q[0], 1, 21, q[1], 4, 21, AIR); F(q[0], 4, 21, q[1], 4, 21, 'minecraft:iron_trapdoor[facing=north,half=top,open=true,powered=false,waterlogged=false]') })
  // fosse sous la baie ouest
  F(5, -2, 9, 6, -2, 17, RUS); F(5, -1, 9, 6, 0, 17, AIR); F(4, -1, 9, 4, -1, 17, RUS); F(7, -1, 9, 7, -1, 17, RUS); F(5, -1, 8, 6, -1, 8, RUS); F(5, -1, 18, 6, -1, 18, RUS)
  S(5, -1, 17, btSt('stone', 'south')); S(6, -1, 17, btSt('stone', 'south'))
  // pont elevateur a deux colonnes sous la baie est
  F(10, 0, 11, 10, 4, 11, RUI); F(13, 0, 11, 13, 4, 11, RUI); F(11, 1, 11, 12, 1, 11, 'minecraft:iron_bars'); btVoitureY(2, 11, 10, 'z', 'red', 1)
  // etablis, outils, pneus
  for (var x = 7; x <= 12; x++) vrCpt(x, 1, 7, 'south', 'smooth_stone'); S(11, 2, 7, 'supplementaries:jar')
  S(3, 1, 7, 'minecraft:anvil[facing=east]'); S(3, 1, 8, 'minecraft:grindstone[face=floor,facing=east]'); S(16, 1, 7, RUBAR); S(16, 1, 8, RUCOF.replace('south', 'west'))
  ;[3, 16].forEach(x => { vrEtag(x, 2, 14, x == 3 ? 'east' : 'west'); vrEtag(x, 2, 15, x == 3 ? 'east' : 'west') })
  ;[[3, 18], [3, 19], [16, 18]].forEach(c => S(c[0], 1, c[1], 'minecraft:black_concrete')); S(3, 2, 18, 'minecraft:black_concrete')
  vrPlaf(0, 4, 8, 16, 20, 4)
  // pompe a essence devant
  S(8, 0, 26, 'minecraft:red_concrete'); S(8, 1, 26, 'minecraft:red_concrete'); S(8, 2, 26, 'minecraft:white_stained_glass'); S(8, 3, 26, 'minecraft:red_concrete'); S(7, 0, 26, 'minecraft:chain[axis=x]')
  F(6, -1, 25, 10, -1, 27, 'minecraft:light_gray_concrete')
  // casse close de toles
  for (var x = 19; x <= 31; x++) for (var z = 0; z <= 30; z++) S(x, -1, z, choix(['minecraft:gravel', 'minecraft:coarse_dirt', 'minecraft:mud', RUN]))
  W(19, 1, 31, 30, 0, 2, RUO); F(23, 0, 30, 27, 2, 30, AIR)
  for (var x = 19; x <= 31; x += 3) { S(x, 0, 1, RUC); S(x, 1, 1, RUC) }
  ;[[21, 3, 'brown'], [26, 3, 'blue'], [21, 8, 'white'], [26, 8, 'green'], [21, 13, 'red'], [26, 13, 'yellow'], [21, 18, 'gray'], [26, 18, 'light_blue']].forEach((c, i) => { bgVoiture(c[0], c[1], 'x', c[2], 1, i % 2 == 1); if (i < 4 || i == 6) btVoitureY(2, c[0], c[1], 'x', ['orange', 'black', 'cyan', 'lime', 'red', 'purple', 'brown', 'white'][i], 1) })
  ;[[20, 25], [21, 25], [20, 26], [20, 27], [21, 27]].forEach((c, i) => { for (var y = 0; y <= (i % 3); y++) S(c[0], y, c[1], choix(['minecraft:red_terracotta', 'minecraft:blue_terracotta', 'minecraft:white_terracotta', 'minecraft:brown_terracotta'])) })
  // grue a aimant
  F(28, 0, 22, 30, 1, 25, 'minecraft:yellow_concrete'); F(29, 2, 23, 29, 10, 23, 'minecraft:yellow_concrete'); F(22, 10, 23, 28, 10, 23, 'minecraft:yellow_concrete'); F(23, 6, 23, 23, 9, 23, 'minecraft:chain[axis=y]'); S(23, 5, 23, RUI)
  S(29, 2, 24, 'minecraft:black_stained_glass'); S(29, 3, 24, 'minecraft:black_stained_glass')
}

// ================= CORONS (trois maisons ouvrieres mitoyennes, jardins ouvriers) =================
function ruCorons() {
  ruSol(0, 0, 31, 31); F(0, -1, 26, 31, -1, 31, 'mcwpaths:stone_flagstone')
  ;[2, 11, 20].forEach((xl, i) => {
    var xr = xl + 9
    F(xl, 0, 12, xr, 0, 21, RUB); W(xl, 12, xr, 21, 1, 10, RUB); F(xl + 1, 0, 13, xr - 1, 0, 20, RUT); F(xl + 1, 6, 13, xr - 1, 6, 20, RUT); F(xl + 1, 11, 13, xr - 1, 11, 20, RUT)
    F(xl, 6, 12, xr, 6, 12, RUM); F(xl, 6, 21, xr, 6, 21, RUM)
    ruToit(xl, xr, 12, 21, 11, 'deepslate_tile', RUB)
    F(xl + 6, 12, 16, xl + 7, 16, 17, RUB)
    // facade rue : porte, fenetres ; jardin : porte de cuisine
    PORTE(xl + 2, 1, 21, 'minecraft:spruce_door', 'south', 'left', 'false'); F(xl + 5, 2, 21, xl + 7, 3, 21, GP); F(xl + 2, 8, 21, xl + 3, 9, 21, GP); F(xl + 6, 8, 21, xl + 7, 9, 21, GP)
    PORTE(xl + 7, 1, 12, 'minecraft:spruce_door', 'north', 'left', 'false'); F(xl + 3, 2, 12, xl + 4, 3, 12, GP); F(xl + 4, 8, 12, xl + 5, 9, 12, GP)
    // escalier droit contre le mur ouest, cloisons
    mdEsc(xl + 1, xl + 1, 14, 0, 6, 1, 'spruce', RUT); mdGarde(xl + 2, 14, 18, 7)
    F(xl + 2, 1, 16, xr - 1, 5, 16, RUW); mdPorteVide(xl + 5, 1, 16)
    F(xl + 2, 7, 16, xr - 1, 10, 16, RUW); mdPorteVide(xl + 3, 7, 16)
    piece(cadre(xl + 2, 13, xr - 1, 15, 'north', 0, 5), 'cuisine', i == 1 ? 1 : 0); piece(cadre(xl + 3, 17, xr - 1, 20, 'south', 0, 5), 'salon', 0)
    piece(cadre(xl + 4, 13, xr - 1, 15, 'north', 6, 4), 'chambre', 0); piece(cadre(xl + 3, 17, xr - 1, 20, 'south', 6, 4), 'chambre', i == 2 ? 1 : 0)
    vrPlaf(0, xl + 3, 14, xr - 1, 20, 4); vrPlaf(5, xl + 3, 14, xr - 1, 20, 4)
    // courette devant, jardin ouvrier derriere
    F(xl, 0, 25, xr, 0, 25, 'minecraft:brick_wall'); S(xl + 2, 0, 25, AIR); F(xl + 2, -1, 22, xl + 2, -1, 25, 'mcwpaths:stone_flagstone')
    for (var z = 0; z <= 11; z++) S(xl, 0, z, 'minecraft:spruce_fence'); for (var x = xl; x <= xr; x++) S(x, 0, 0, 'minecraft:spruce_fence')
    F(xl + 7, -1, 1, xl + 7, -1, 11, 'minecraft:dirt_path')
    ;[2, 4, 6].forEach((x, k) => { F(xl + x, -1, 2, xl + x, -1, 9, 'minecraft:farmland[moisture=0]'); F(xl + x, 0, 2, xl + x, 0, 9, ['minecraft:potatoes[age=5]', 'minecraft:carrots[age=6]', 'minecraft:beetroots[age=2]'][(k + i) % 3]) })
    S(xr - 1, 0, 2, 'minecraft:composter[level=5]'); S(xr - 1, 0, 10, 'minecraft:water_cauldron[level=2]')
  })
  for (var z = 0; z <= 11; z++) S(29, 0, z, 'minecraft:spruce_fence')
  F(30, 0, 3, 30, 2, 3, 'minecraft:spruce_fence'); F(30, 0, 9, 30, 2, 9, 'minecraft:spruce_fence'); F(30, 2, 4, 30, 2, 8, 'minecraft:chain[axis=z]')
  ;[[1, 23], [30, 24]].forEach(c => S(c[0], 0, c[1], RUBAR))
}

// ================= SILOS A GRAIN (trois cellules de beton, tour de manutention, galerie haute) =================
function ruSilos() {
  ruSol(0, 0, 31, 31); ruBitume(0, 0, 31, 5)
  ;[5, 13, 21].forEach(cx => {
    ruRond(cx, 12, 12, 0, 18, 'minecraft:light_gray_concrete')
    ;[6, 12].forEach(y => ruRond(cx, 12, 12, y, y, RUN))
    ruRond(cx, 12, 12, 19, 19, RUS, true); ruRond(cx, 12, 2, 20, 20, 'minecraft:light_gray_concrete', true)
    S(cx, 0, 8, 'minecraft:hopper[enabled=true,facing=south]')
  })
  // tour de manutention
  W(26, 6, 30, 17, 0, 25, RUC); F(27, -1, 7, 29, -1, 16, RUS); F(26, 26, 6, 30, 26, 17, RUO)
  for (var y = 3; y <= 23; y += 5) { F(26, y, 9, 26, y + 1, 10, RUV); F(30, y, 13, 30, y + 1, 14, RUV); F(28, y, 6, 28, y + 1, 6, RUV) }
  PORTE(28, 0, 6, 'minecraft:iron_door', 'north', 'left', 'false'); F(31, 1, 10, 31, 24, 10, 'minecraft:ladder[facing=east,waterlogged=false]')
  F(27, 1, 15, 29, 3, 16, 'minecraft:waxed_weathered_copper'); S(28, 4, 15, 'minecraft:hopper[enabled=true,facing=down]'); F(28, 5, 15, 28, 25, 15, 'minecraft:chain[axis=y]')
  // galerie haute vers les cellules
  F(2, 20, 11, 25, 20, 13, RUS); F(2, 21, 11, 25, 22, 11, RUC); F(2, 21, 13, 25, 22, 13, RUC); F(2, 21, 12, 2, 22, 12, RUC); F(2, 23, 11, 25, 23, 13, RUSLC)
  for (var x = 4; x <= 24; x += 4) { S(x, 22, 11, RUV); S(x, 22, 13, RUV) }
  F(26, 21, 12, 26, 22, 12, AIR); ;[5, 13, 21].forEach(cx => S(cx, 21, 12, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false,powered=false,waterlogged=false]'))
  // fosse de reception, camion benne, grain renverse
  F(18, -1, 2, 23, -1, 3, 'minecraft:iron_bars'); F(18, -2, 2, 23, -2, 3, 'minecraft:yellow_concrete_powder')
  bgVoiture(8, 2, 'x', 'orange', 1); F(12, 0, 2, 14, 1, 3, 'minecraft:orange_concrete'); F(13, 1, 2, 13, 1, 3, 'minecraft:hay_block[axis=y]')
  ;[[9, 5], [10, 6], [17, 6], [25, 3], [1, 18]].forEach(c => SA(c[0], 0, c[1], 'minecraft:hay_block[axis=y]'))
  ;[[0, 9], [9, 20], [17, 22]].forEach(c => S(c[0], -1, c[1], 'minecraft:yellow_concrete_powder'))
}

// ================= GARE DE FRET (batiment voyageurs, halles a marchandises, quai, voies, wagons) =================
function ruGare() {
  ruSol(0, 0, 31, 31); F(0, -1, 0, 31, -1, 2, 'mcwpaths:stone_flagstone')
  // batiment voyageurs R+1
  F(11, 0, 3, 20, 0, 12, RUA); W(11, 3, 20, 12, 1, 11, RUB); F(12, 6, 4, 19, 6, 11, RUT); F(12, 12, 4, 19, 12, 11, RUT)
  F(11, 6, 3, 20, 6, 3, RUM); F(11, 6, 12, 20, 6, 12, RUM)
  ruToit(11, 20, 3, 12, 12, 'deepslate_tile', RUB)
  PORTE(15, 1, 3, 'minecraft:spruce_door', 'north', 'left', 'false'); PORTE(16, 1, 3, 'minecraft:spruce_door', 'north', 'right', 'false'); F(15, 3, 3, 16, 3, 3, GP)
  F(12, 2, 3, 13, 4, 3, GP); F(18, 2, 3, 19, 4, 3, GP); F(12, 8, 3, 13, 10, 3, GP); F(15, 8, 3, 16, 10, 3, GP); F(18, 8, 3, 19, 10, 3, GP)
  PORTE(15, 1, 12, 'minecraft:spruce_door', 'south', 'left', 'false'); F(12, 2, 12, 13, 4, 12, GP); F(18, 2, 12, 19, 4, 12, GP); F(13, 8, 12, 14, 10, 12, GP); F(17, 8, 12, 18, 10, 12, GP)

  // salle des pas perdus, guichet, logement du chef de gare a l'etage
  mdEsc(12, 12, 5, 0, 6, 1, 'spruce', RUT); mdGarde(13, 5, 9, 7)
  F(16, 1, 9, 19, 1, 9, RUW); F(16, 2, 9, 16, 4, 9, RUW); F(19, 2, 9, 19, 4, 9, RUW); F(17, 2, 9, 18, 3, 9, 'minecraft:iron_bars'); F(16, 5, 9, 19, 5, 9, RUW)
  vrBur(17, 1, 10, 'north'); vrCh(17, 1, 11, 'north'); vrArm(19, 1, 11, 'west')
  ;[5, 7].forEach(z => S(19, 1, z, btSt('spruce', 'west'))); S(14, 1, 4, RUBAR)
  F(14, 7, 8, 19, 10, 8, RUW); mdPorteVide(16, 7, 8)
  piece(cadre(14, 4, 19, 7, 'north', 6, 5), 'chambre', 0); piece(cadre(14, 9, 19, 11, 'south', 6, 5), 'cuisine', 1)
  vrPlaf(0, 14, 4, 19, 11, 4); vrPlaf(6, 14, 4, 19, 11, 4)
  // halles a marchandises de part et d'autre
  ;[[3, 10], [21, 28]].forEach((h, k) => {
    F(h[0], 0, 3, h[1], 0, 12, RUS); W(h[0], 3, h[1], 12, 1, 6, RUB); F(h[0], 7, 3, h[1], 7, 12, RUSLC); F(h[0], 6, 3, h[1], 6, 3, RUM)
    var a = h[0] + 2, b = h[0] + 5
    F(a, 1, 3, b, 4, 3, AIR); F(a, 1, 12, b, 4, 12, AIR); F(a, 4, 3, b, 4, 3, 'minecraft:spruce_trapdoor[facing=south,half=top,open=true,powered=false,waterlogged=false]')
    for (var x = h[0] + 1; x <= h[1] - 1; x += 3) ruSusp(x, 6, 7)
    ;[[h[0] + 1, 5], [h[0] + 1, 6], [h[1] - 1, 5], [h[1] - 1, 9], [h[1] - 1, 10], [h[0] + 1, 10]].forEach(c => S(c[0], 1, c[1], choix([RUBAR, RUCOF, 'supplementaries:sack', 'minecraft:barrel[facing=east,open=false]'])))
    S(h[1] - 1, 2, 5, 'supplementaries:sack'); S(h[0] + 1, 0, 8, 'minecraft:heavy_weighted_pressure_plate[power=0]')
  })
  // quai couvert
  F(2, 0, 13, 29, 0, 15, RUS); F(2, 0, 15, 29, 0, 15, RUA)
  F(3, 5, 13, 28, 5, 15, RUSLS); ;[4, 10, 21, 27].forEach(x => F(x, 1, 15, x, 4, 15, 'minecraft:iron_bars'))
  ;[7, 13, 18, 24].forEach(x => S(x, 4, 14, RUL))
  ;[6, 7, 23, 24].forEach(x => S(x, 1, 13, btSt('spruce', 'north'))); S(14, 1, 15, 'minecraft:barrel[facing=east,open=false]')
  // voies : ballast, deux voies, wagon couvert ouvert, wagon-citerne, heurtoir, signal
  F(0, -1, 16, 31, -1, 26, 'minecraft:gravel'); for (var x = 0; x <= 31; x += 2) { S(x, -1, 18, 'minecraft:stripped_spruce_wood[axis=z]'); S(x, -1, 23, 'minecraft:stripped_spruce_wood[axis=z]') }
  F(0, 0, 18, 31, 0, 18, 'minecraft:rail[shape=east_west,waterlogged=false]'); F(0, 0, 23, 28, 0, 23, 'minecraft:rail[shape=east_west,waterlogged=false]')
  F(29, 0, 23, 29, 1, 23, RUI); S(29, 0, 22, 'minecraft:iron_bars'); S(29, 0, 24, 'minecraft:iron_bars')
  ;[7, 8, 13, 14].forEach(x => { S(x, 0, 17, RUK); S(x, 0, 19, RUK) }); F(6, 1, 17, 15, 4, 19, 'minecraft:red_terracotta'); F(7, 1, 18, 14, 4, 18, AIR); F(6, 5, 17, 15, 5, 19, 'minecraft:waxed_oxidized_cut_copper_slab[type=bottom]'); F(10, 1, 17, 11, 3, 17, AIR)
  F(7, 1, 18, 14, 1, 18, 'minecraft:spruce_slab[type=bottom]'); S(8, 2, 18, 'supplementaries:sack'); S(12, 2, 18, RUBAR)
  ;[19, 20, 25, 26].forEach(x => { S(x, 0, 22, RUK); S(x, 0, 24, RUK) }); F(18, 1, 22, 27, 1, 24, 'minecraft:black_concrete'); F(18, 2, 22, 27, 4, 24, 'minecraft:waxed_oxidized_copper'); S(22, 5, 23, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false,powered=false,waterlogged=false]')
  F(1, 0, 21, 1, 4, 21, 'minecraft:iron_bars'); S(1, 5, 21, 'minecraft:redstone_lamp[lit=false]'); S(1, 6, 21, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false,powered=false,waterlogged=false]')
  // parvis : banc, charrette a bagages
  S(5, 0, 1, btSt('spruce', 'south')); S(6, 0, 1, btSt('spruce', 'south')); F(24, 0, 1, 25, 0, 1, 'minecraft:spruce_slab[type=bottom]'); SA(24, 1, 1, 'supplementaries:sack')
}

// ================= SOUS-STATION ELECTRIQUE (poste de commande, transformateurs, portique, pylone) =================
function ruCentrale() {
  for (var x = 0; x <= 31; x++) for (var z = 0; z <= 31; z++) S(x, -1, z, R() < 0.85 ? 'minecraft:gravel' : 'minecraft:andesite')
  W(1, 1, 30, 30, 0, 2, 'minecraft:iron_bars'); F(13, 0, 1, 17, 2, 1, AIR); F(12, 0, 1, 12, 3, 1, RUI); F(18, 0, 1, 18, 3, 1, RUI)
  F(13, -1, 0, 17, -1, 5, RUN); F(12, -1, 6, 14, -1, 8, RUN)
  // poste de commande
  F(3, 0, 3, 11, 0, 10, RUA); W(3, 3, 11, 10, 1, 5, RUB); F(3, 6, 3, 11, 6, 10, RUS); W(3, 3, 11, 10, 7, 7, RUSLS)
  PORTE(7, 1, 3, 'minecraft:iron_door', 'north', 'left', 'false'); S(7, 0, 2, btSt('stone', 'south')); F(4, 2, 3, 5, 4, 3, GP); F(9, 2, 3, 10, 4, 3, GP); F(11, 2, 5, 11, 4, 8, GP); F(3, 2, 6, 3, 4, 7, GP)
  F(4, 1, 9, 10, 2, 9, RUN); for (var x = 4; x <= 10; x++) S(x, 3, 9, x % 2 ? 'minecraft:redstone_lamp[lit=false]' : 'minecraft:target[power=0]')
  ;[5, 7, 9].forEach(x => { vrBur(x, 1, 8, 'north'); vrCh(x, 1, 7, 'south') }); vrArm(4, 1, 4, 'east'); S(10, 1, 4, 'minecraft:lectern[facing=west,has_book=false,powered=false]')
  vrPlaf(0, 4, 4, 10, 8, 3)
  // transformateurs
  ;[15, 20, 25].forEach(x => {
    F(x - 1, -1, 5, x + 3, -1, 11, RUN); F(x, 0, 6, x + 2, 2, 9, 'minecraft:waxed_oxidized_copper'); F(x, 0, 10, x + 2, 1, 10, 'minecraft:iron_bars')
    F(x, 3, 9, x + 2, 3, 9, 'minecraft:waxed_weathered_copper'); ;[x, x + 1, x + 2].forEach(a => S(a, 3, 7, 'minecraft:lightning_rod[facing=up,powered=false,waterlogged=false]'))
  })
  // portique d'arrivee des lignes
  F(14, 0, 13, 14, 9, 13, 'minecraft:iron_bars'); F(28, 0, 13, 28, 9, 13, 'minecraft:iron_bars'); F(14, 10, 13, 28, 10, 13, 'minecraft:iron_bars')
  ;[16, 21, 26].forEach(x => { F(x, 8, 13, x, 9, 13, 'minecraft:chain[axis=y]'); S(x, 7, 13, 'minecraft:lightning_rod[facing=down,powered=false,waterlogged=false]') })
  // pylone a treillis
  var cx = 22, cz = 23
  for (var y = 0; y <= 20; y++) { var w = y <= 7 ? 2 : y <= 14 ? 1 : 0;[[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(d => S(cx + d[0] * w, y, cz + d[1] * w, 'minecraft:iron_bars')) }
  F(cx - 2, 7, cz - 2, cx + 2, 7, cz + 2, 'minecraft:iron_bars'); F(cx - 1, 14, cz - 1, cx + 1, 14, cz + 1, 'minecraft:iron_bars')
  ;[15, 19].forEach(y => { F(cx - 5, y, cz, cx + 5, y, cz, 'minecraft:iron_bars'); ;[-5, 5].forEach(d => { S(cx + d, y - 1, cz, 'minecraft:chain[axis=y]'); S(cx + d, y - 2, cz, 'minecraft:lightning_rod[facing=down,powered=false,waterlogged=false]') }) })
  S(cx, 21, cz, 'minecraft:lightning_rod[facing=up,powered=false,waterlogged=false]')
  // groupe electrogene en conteneur, fourgon de service
  F(3, 0, 20, 10, 2, 23, 'minecraft:green_terracotta'); F(3, 0, 21, 3, 1, 22, 'minecraft:iron_bars'); F(10, 0, 21, 10, 1, 22, 'minecraft:iron_bars'); S(9, 3, 21, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false,powered=false,waterlogged=false]')
  bgVoiture(4, 15, 'x', 'white', 1); ;[[27, 27], [28, 27], [4, 27]].forEach(c => S(c[0], 0, c[1], RUBAR))
}

// ================= CAFE OUVRIER (salle et billard au rez, deux logements, terrasse) =================
function ruCafe() {
  ruSol(0, 0, 31, 31); F(0, -1, 0, 31, -1, 3, 'mcwpaths:stone_flagstone')
  F(4, 0, 4, 27, 0, 15, RUA); W(4, 4, 27, 15, 1, 17, RUB); F(5, 6, 5, 26, 6, 14, RUT); F(5, 12, 5, 26, 12, 14, RUT); F(5, 18, 5, 26, 18, 14, RUT)
  ;[6, 12].forEach(y => { F(4, y, 4, 27, y, 4, RUM); F(4, y, 15, 27, y, 15, RUM) })
  ruToit(4, 27, 4, 15, 18, 'deepslate_tile', RUB)
  F(4, 18, 9, 4, 25, 10, RUB); F(27, 18, 9, 27, 25, 10, RUB)
  for (var x = 5; x <= 23; x++) for (var z = 5; z <= 14; z++) S(x, 0, z, (x + z) % 2 ? 'minecraft:polished_diorite' : 'minecraft:polished_deepslate')
  // devanture : vitrines, porte, store raye ; porte de l'immeuble
  F(6, 1, 4, 12, 4, 4, GP); F(14, 1, 4, 22, 4, 4, GP); PORTE(13, 1, 4, 'minecraft:spruce_door', 'north', 'left', 'false'); F(13, 3, 4, 13, 4, 4, GP)
  for (var x = 5; x <= 23; x++) S(x, 5, 3, x % 2 ? 'minecraft:red_wool' : 'minecraft:white_wool')
  PORTE(25, 1, 4, 'minecraft:spruce_door', 'north', 'left', 'false')
  ;[[6, 7], [10, 11], [17, 18], [21, 22]].forEach(w => { F(w[0], 8, 4, w[1], 10, 4, GP); F(w[0], 14, 4, w[1], 16, 4, GP); F(w[0], 8, 15, w[1], 10, 15, GP); F(w[0], 14, 15, w[1], 16, 15, GP) })
  F(6, 2, 15, 7, 3, 15, GP); F(21, 2, 15, 22, 3, 15, GP)
  // salle : comptoir, tables, billard ; cuisine au fond
  F(24, 1, 5, 24, 5, 14, RUB)
  for (var x = 6; x <= 15; x++) vrCpt(x, 1, 11, 'north', 'dark_oak_planks'); for (var x = 6; x <= 15; x++) vrEtag(x, 2, 14, 'north'); F(6, 1, 14, 15, 1, 14, 'minecraft:barrel[facing=north,open=false]')
  ;[7, 10, 13].forEach(x => vrCh(x, 1, 10, 'south', 'red')); S(9, 2, 11, 'supplementaries:jar'); S(14, 2, 11, 'handcrafted:white_plate')
  ;[[7, 6], [11, 7]].forEach(t => { vrTab(t[0], 1, t[1], 'none'); vrCh(t[0] - 1, 1, t[1], 'east', 'red'); vrCh(t[0] + 1, 1, t[1], 'west', 'red') })
  F(18, 1, 7, 20, 1, 8, 'minecraft:dark_oak_planks'); F(18, 2, 7, 20, 2, 8, 'minecraft:green_carpet'); S(21, 1, 6, 'minecraft:jukebox')
  F(17, 1, 12, 23, 5, 12, RUW); mdPorteVide(18, 1, 12); piece(cadre(17, 13, 23, 14, 'south', 0, 5), 'cuisine', 0)
  vrPlaf(0, 6, 5, 23, 10, 4)
  // cage d'escalier (deux volees) et deux logements
  mdEsc(26, 26, 6, 0, 6, 1, 'spruce', RUT); mdEsc(25, 25, 11, 6, 6, -1, 'spruce', RUT); mdGarde(26, 7, 11, 13); mdGarde(24, 7, 11, 13)
  ;[6, 12].forEach(y => {
    F(24, y + 1, 5, 24, y + 5, 14, RUB); F(15, y + 1, 5, 15, y + 5, 14, RUW); F(5, y + 1, 10, 23, y + 5, 10, RUW)
    mdPorteVide(15, y + 1, 7); mdPorteVide(10, y + 1, 10); mdPorteVide(19, y + 1, 10)
    piece(cadre(5, 5, 14, 9, 'north', y, 5), 'salon', y == 6 ? 0 : 1); piece(cadre(16, 5, 23, 9, 'north', y, 5), 'cuisine', 0)
    piece(cadre(5, 11, 14, 14, 'south', y, 5), 'chambre', y == 6 ? 1 : 0); piece(cadre(16, 11, 23, 14, 'south', y, 5), 'sdb', 0)
    vrPlaf(y, 6, 6, 23, 14, 4)
  })
  mdPorteVide(24, 7, 13); mdPorteVide(24, 13, 5)
  // terrasse et courette
  ;[[7, 1], [11, 1], [19, 1]].forEach(t => { vrTab(t[0], 0, t[1], 'none'); vrCh(t[0] - 1, 0, t[1], 'east', 'red'); vrCh(t[0] + 1, 0, t[1], 'west', 'red') })
  F(28, 0, 6, 28, 2, 14, 'minecraft:brick_wall'); S(30, 0, 8, RUBAR); S(29, 0, 12, RUCOF.replace('south', 'west')); S(30, 0, 13, 'minecraft:barrel[facing=east,open=false]')
}

// ---- palette et vues ----
var THM_RU = finPalette('spruce', {})
function vuesRouilleF() {
  vue('ru_ensemble_sud', 0, 0, 64, 52, 120, 64, 8, 34, 3000)
  vue('ru_ensemble_no', 0, 0, -30, 50, -30, 64, 6, 40, 3000)
  vue('ru_rue_ouest', 0, 0, -8, 3, 39.5, 60, 4, 40)
  vue('ru_rue_est', 0, 0, 136, 3, 40.5, 64, 4, 40)
  vue('ru_usine', 0, 0, 16, 10, 46, 16, 6, 14)
  vue('ru_usine_halle', 0, 0, 26, 7, 22, 8, 3, 8)
  vue('ru_usine_machines', 0, 0, 12, 3, 12, 22, 1.5, 7)
  vue('ru_usine_toits', 0, 0, 36, 26, -8, 14, 10, 14)
  vue('ru_entrepot', 32, 0, 16, 9, 46, 16, 4, 14)
  vue('ru_entrepot_quais', 32, 0, 30, 4, 30, 13, 2, 24)
  vue('ru_entrepot_rayons', 32, 0, 22, 4, 19, 8, 2, 8)
  vue('ru_garage', 64, 0, 14, 8, 46, 14, 3, 16)
  vue('ru_garage_atelier', 64, 0, 15, 3, 19, 6, 1.5, 9)
  vue('ru_casse', 64, 0, 25, 10, 38, 25, 1, 14)
  vue('ru_corons', 96, 0, 16, 8, 44, 15, 7, 16)
  vue('ru_corons_jardins', 96, 0, 16, 14, -12, 15, 4, 8)
  vue('ru_silos', 0, 48, 16, 10, -14, 14, 10, 10)
  vue('ru_silos_haut', 0, 48, -8, 28, 24, 16, 18, 10)
  vue('ru_gare', 32, 48, 16, 7, -5, 16, 5, 8)
  vue('ru_gare_quai', 32, 48, 1, 3, 14.5, 20, 2, 16)
  vue('ru_gare_voies', 32, 48, 16, 12, 36, 16, 2, 18)
  vue('ru_centrale', 64, 48, 16, 12, -12, 16, 3, 14)
  vue('ru_centrale_transfos', 64, 48, 21, 9, -3, 21, 1, 8)
  vue('ru_cafe', 96, 48, 16, 7, -10, 16, 6, 8)
  vue('ru_cafe_salle', 96, 48, 5.5, 3.2, 5.5, 16, 1.5, 10)
  vue('ru_cafe_logement', 96, 48, 13.5, 9.6, 6.6, 6, 7.2, 9)
  vue('ru_coupe_usine', 144, 0, 16, 30, 44, 16, 0, 14)
  vue('ru_coupe_entrepot', 180, 0, 16, 26, 44, 16, 0, 13)
  vue('ru_coupe_corons', 216, 0, 16, 24, 42, 15, 0, 16)
  vue('ru_coupe_corons_etage', 252, 0, 16, 28, 42, 15, 6, 16)
  vue('ru_coupe_gare', 144, 48, 16, 26, -12, 16, 0, 10)
  vue('ru_coupe_cafe', 180, 48, 16, 26, -12, 16, 0, 10)
  vue('ru_coupe_cafe_etage', 216, 48, 16, 30, -12, 16, 6, 10)
}
var QFIN_RU = function () {
  HB2 = true; FIN = true; THM = THM_RU
  var rc = ['white', 'light_gray', 'brown'], rf = ['red', 'white']
  HM = {}; ruRue(); finAncrage()
  lot(QF(ruUsine, null, null), 0, 0, 999, 911, 32, 27); lot(QF(ruEntrepot, null, null), 32, 0, 999, 921, 32, 12); lot(QF(ruGarage, null, null), 64, 0, 999, 931, 32, 12); lot(QF(ruCorons, null, rc), 96, 0, 999, 941, 32, 17)
  lot(QF(ruSilos, null, null), 0, 48, 999, 951, 32, 27); lot(QF(ruGare, null, rc), 32, 48, 999, 961, 32, 18); lot(QF(ruCentrale, null, null), 64, 48, 999, 971, 32, 22); lot(QF(ruCafe, null, rf), 96, 48, 999, 981, 32, 26)
  lot(QF(ruUsine, null, null), 144, 0, 6, 911, 32, 27); lot(QF(ruEntrepot, null, null), 180, 0, 6, 921, 32, 12); lot(QF(ruCorons, null, rc), 216, 0, 5, 941, 32, 17); lot(QF(ruCorons, null, rc), 252, 0, 10, 941, 32, 17)
  lot(QF(ruGare, null, rc), 144, 48, 5, 961, 32, 18); lot(QF(ruCafe, null, rf), 180, 48, 5, 981, 32, 26); lot(QF(ruCafe, null, rf), 216, 48, 11, 981, 32, 26)
  vlog('FIN volets ' + FIN_NV + ' rideaux ' + FIN_NR + ' paves ' + PAVE_NB + ' retraits ancrage ' + ANC_NB)
  HB2 = false; FIN = false; THM = null; HM = {}
}
