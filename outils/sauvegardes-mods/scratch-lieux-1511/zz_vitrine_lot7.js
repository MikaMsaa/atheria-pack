
// ================= RANGEE DE MAISONS DE VILLE (2 x 2 chunks) : brique, colombage, meuliere =================
// Rue au sud. Chaque maison : x a..a+9, z12..23, RDC + etage + combles, jardin devant (z24..28) et derriere (z1..11).
function cadreInv(x1, z1, x2, z2, fac, y, h) {
  var c = cadre(x1, z1, x2, z2, fac, y, h), p0 = c.pos, f0 = c.f
  c.pos = (u, v) => p0(c.L - 1 - u, v)
  c.f = b => f0(('' + b).replace(/\{P\}/g, '{X}').replace(/\{M\}/g, '{P}').replace(/\{X\}/g, '{M}'))
  c.S = (u, v, dy, b) => { var p = c.pos(u, v); S(p[0], y + dy, p[1], c.f(b)) }
  c.porte = (id) => { var p = c.pos(c.L - 1, c.D); PORTE(p[0], y + 1, p[1], id, OPP[fac], 'left', 'false') }
  return c
}
function maisonsVille() {
  var CAL = 'minecraft:calcite'
  F(0, -1, 0, 31, -1, 31, 'minecraft:grass_block'); F(0, -1, 29, 31, -1, 31, 'minecraft:smooth_stone'); for (var x = 0; x <= 31; x += 4) S(x, -1, 31, 'minecraft:polished_andesite')
  F(0, 0, 0, 31, 1, 0, 'minecraft:stone_bricks'); F(0, 2, 0, 31, 2, 0, 'minecraft:stone_brick_slab[type=bottom]'); F(0, 0, 1, 0, 1, 11, 'minecraft:dark_oak_fence'); F(31, 0, 1, 31, 1, 11, 'minecraft:dark_oak_fence')
  F(10, 0, 1, 10, 1, 11, 'minecraft:dark_oak_fence'); F(20, 0, 1, 20, 1, 11, 'minecraft:dark_oak_fence')
  var styles = [
    { a: 1, toit: 'gray', bande: 'minecraft:stone_bricks', porte: 'mcwdoors:spruce_classic_door', volet: 'minecraft:spruce_trapdoor', muret: 'minecraft:bricks', cloture: 'minecraft:spruce_fence', pieces: ['salon', 'cuisine', 'chambre', 'bureau'], etat: 0 },
    { a: 11, toit: 'spruce', bande: 'minecraft:dark_oak_log[axis=x]', porte: 'mcwdoors:dark_oak_classic_door', volet: 'minecraft:dark_oak_trapdoor', muret: 'minecraft:mossy_cobblestone', cloture: 'minecraft:dark_oak_fence', pieces: ['salle', 'cuisine', 'chambre', 'sdb'], etat: 0 },
    { a: 21, toit: 'orange_terracotta', bande: 'minecraft:bricks', porte: 'mcwdoors:dark_oak_glass_door', volet: null, muret: 'minecraft:granite', cloture: 'minecraft:iron_bars', pieces: ['salon', 'cuisine', 'chambre', 'chambre'], etat: 1 }
  ]
  styles.forEach((st, i) => {
    var a = st.a
    function mur(x, y, z) {
      if (i == 0) return (x == a || x == a + 9) && y % 2 ? 'minecraft:stone_bricks' : 'minecraft:bricks'
      if (i == 1) return y <= 5 ? (R() < 0.25 ? 'minecraft:cobblestone' : 'minecraft:stone_bricks') : ((x - a) % 3 == 0 ? 'minecraft:dark_oak_log[axis=y]' : CAL)
      var r = R(); return r < 0.45 ? 'minecraft:granite' : r < 0.7 ? 'minecraft:polished_granite' : r < 0.85 ? 'minecraft:dripstone_block' : 'minecraft:terracotta'
    }
    // gros oeuvre
    F(a, 0, 12, a + 9, 0, 23, 'minecraft:polished_andesite')
    for (var y = 1; y <= 12; y++) for (var x = a; x <= a + 9; x++) { S(x, y, 23, mur(x, y, 23)); S(x, y, 12, mur(x, y, 12)) }
    for (var y = 1; y <= 12; y++) { F(a, y, 13, a, y, 22, i == 1 && y > 5 ? CAL : mur(a, y, 13)); F(a + 9, y, 13, a + 9, y, 22, i == 1 && y > 5 ? CAL : mur(a + 9, y, 13)) }
    F(a, 6, 23, a + 9, 6, 23, st.bande); F(a, 6, 12, a + 9, 6, 12, st.bande)
    F(a + 1, 6, 13, a + 8, 6, 22, 'minecraft:spruce_planks'); F(a + 1, 12, 13, a + 8, 12, 22, 'minecraft:spruce_planks')
    // toit a deux pans, pignons sur les murs mitoyens
    for (var k = 0; k <= 6; k++) {
      var y = 12 + k, zs = 24 - k, zn = 11 + k
      F(a, y, zs, a + 9, y, zs, TOIT('north', st.toit)); F(a, y, zn, a + 9, y, zn, TOIT('south', st.toit))
      if (zn + 1 <= zs - 1 && k > 0) { F(a, y, zn + 1, a, y, zs - 1, i == 1 ? CAL : mur(a, y, 15)); F(a + 9, y, zn + 1, a + 9, y, zs - 1, i == 1 ? CAL : mur(a + 9, y, 15)) }
    }
    F(a + 7, 12, 17, a + 7, 20, 18, 'minecraft:bricks'); S(a + 7, 21, 17, 'minecraft:decorated_pot'); S(a + 7, 21, 18, 'minecraft:flower_pot')
    // escalier droit le long du mur ouest, sous-face pleine
    for (var k = 0; k <= 5; k++) { S(a + 1, 1 + k, 21 - k, 'minecraft:spruce_stairs[facing=north,half=bottom,shape=straight]'); if (k > 0) F(a + 1, 1, 21 - k, a + 1, k, 21 - k, 'minecraft:spruce_planks') }
    F(a + 1, 6, 17, a + 1, 6, 21, AIR)
    F(a + 1, 7, 15, a + 1, 12, 15, 'minecraft:ladder[facing=east]')
    // cloisons
    F(a + 2, 1, 17, a + 8, 5, 17, CAL); F(a + 2, 7, 17, a + 8, 11, 17, CAL); F(a + 2, 7, 18, a + 2, 11, 22, CAL)
    // pieces
    var c = cadre(a + 2, 18, a + 8, 22, 'south', 0); piece(c, st.pieces[0], st.etat); c.porte(st.porte.replace('glass', 'classic'))
    c = cadreInv(a + 2, 13, a + 8, 16, 'north', 0); piece(c, st.pieces[1], st.etat)
    c = cadre(a + 3, 18, a + 8, 22, 'south', 6); piece(c, st.pieces[2], st.etat); c.porte('mcwdoors:spruce_classic_door')
    c = cadreInv(a + 2, 13, a + 8, 16, 'north', 6); piece(c, st.pieces[3], st.etat)
    S(a + 1, 1, 13, 'minecraft:barrel[facing=up,open=false]'); S(a + 1, 1, 14, 'supplementaries:sack'); S(a + 1, 5, 22, 'minecraft:lantern[hanging=true]'); S(a + 1, 7, 22, 'minecraft:potted_fern'); S(a + 1, 11, 14, 'minecraft:lantern[hanging=true]')
    // combles
    if (i == 0) { S(a + 4, 13, 18, 'minecraft:light_blue_bed[facing=north,part=foot]'); S(a + 4, 13, 17, 'minecraft:light_blue_bed[facing=north,part=head]'); S(a + 3, 13, 17, 'minecraft:chest[facing=south]'); S(a + 6, 13, 18, 'minecraft:lantern'); S(a + 5, 13, 19, 'minecraft:yellow_carpet'); S(a + 6, 13, 16, 'minecraft:jukebox') }
    else if (i == 1) { S(a + 4, 13, 18, 'minecraft:loom[facing=south]'); S(a + 5, 13, 18, 'minecraft:cartography_table'); S(a + 6, 13, 18, 'minecraft:lantern'); F(a + 3, 13, 16, a + 6, 13, 16, 'minecraft:barrel[facing=up,open=false]'); S(a + 4, 13, 19, MAT('spruce_chair', 'north')) }
    else { F(a + 3, 13, 16, a + 6, 13, 16, 'supplementaries:sack'); S(a + 4, 13, 18, 'minecraft:chest[facing=south]'); S(a + 6, 13, 19, 'minecraft:lantern'); S(a + 5, 13, 19, 'minecraft:barrel[facing=up,open=false]') }
    // facades : portes, fenetres, volets
    PORTE(a + 1, 1, 23, st.porte, 'south', 'left', 'false'); S(a + 1, 3, 23, GP); PORTE(a + 5, 1, 12, 'minecraft:spruce_door', 'north', 'left', 'false')
    function fen(x, y, z, h, out) { F(x, y, z, x, y + h - 1, z, GP); S(x, y - 1, z, i == 2 ? 'minecraft:bricks' : 'minecraft:smooth_quartz'); S(x, y + h, z, i == 2 ? 'minecraft:bricks' : st.bande.indexOf('log') > 0 ? 'minecraft:dark_oak_log[axis=x]' : 'minecraft:stone_bricks')
      if (st.volet) for (var d = -1; d <= 1; d += 2) for (var yy = y; yy < y + h; yy++) S(x + d, yy, z + (out == 'south' ? 1 : -1), st.volet + '[facing=' + out + ',half=bottom,open=true]') }
    ;[a + 4, a + 7].forEach(x => { fen(x, 8, 23, 2, 'south'); fen(x, 8, 12, 2, 'north') })
    ;[a + 3, a + 7].forEach(x => fen(x, 2, 12, 2, 'north'))
    if (i == 0) { F(a + 3, 2, 23, a + 6, 3, 23, AIR); F(a + 3, 0, 24, a + 6, 1, 24, 'minecraft:bricks'); F(a + 3, 2, 24, a + 6, 3, 24, GP); F(a + 3, 4, 24, a + 6, 4, 24, 'minecraft:bricks'); F(a + 3, 5, 24, a + 6, 5, 24, TOIT('north', 'gray')) }
    else if (i == 1) { ;[a + 4, a + 7].forEach(x => fen(x, 2, 23, 2, 'south')); F(a, 7, 23, a + 9, 7, 23, 'minecraft:dark_oak_log[axis=x]') }
    else { ;[a + 3, a + 6].forEach(x => { F(x, 2, 23, x + 1, 3, 23, GP); F(x, 4, 23, x + 1, 4, 23, 'minecraft:bricks'); F(x, 1, 23, x + 1, 1, 23, 'minecraft:bricks') }); F(a, 4, 24, a + 2, 4, 25, 'minecraft:smooth_stone_slab[type=top]'); S(a + 2, 3, 24, 'minecraft:iron_bars') }
    // lucarne (colombage) ou chassis de toit
    if (i == 1) { F(a + 3, 13, 21, a + 6, 15, 23, CAL); F(a + 4, 13, 21, a + 5, 15, 22, AIR); F(a + 4, 13, 23, a + 5, 14, 23, GP); F(a + 3, 16, 20, a + 6, 16, 24, 'minecraft:spruce_slab[type=bottom]') }
    else { S(a + 4, 14, 22, 'minecraft:glass'); S(a + 4, 14, 13, 'minecraft:glass') }
    // jardin de devant : muret, cloture, portillon, allee, fleurs
    F(a, 0, 28, a + 9, 0, 28, st.muret); F(a, 1, 28, a + 9, 1, 28, st.cloture); S(a + 1, 1, 28, AIR); S(a + 1, 0, 28, 'minecraft:' + (i == 1 ? 'dark_oak' : 'spruce') + '_fence_gate[facing=south,open=false,in_wall=false]')
    F(a + 9, 0, 24, a + 9, 0, 27, 'minecraft:' + (i == 1 ? 'dark_oak' : 'spruce') + '_fence')
    F(a + 1, -1, 24, a + 1, -1, 28, i == 2 ? 'minecraft:polished_andesite' : 'minecraft:gravel')
    for (var x = a + 2; x <= a + 8; x++) for (var z = 25; z <= 27; z++) if (!(i == 0 && z == 24) && R() < 0.45) S(x, 0, z, choix(['minecraft:poppy', 'minecraft:oxeye_daisy', 'minecraft:allium', 'minecraft:pink_tulip', 'minecraft:cornflower', 'minecraft:short_grass', 'minecraft:lily_of_the_valley']))
    S(a + 8, 0, 25, 'minecraft:green_shulker_box'); if (i == 1) { S(a + 5, 0, 26, 'minecraft:flowering_azalea') } if (i == 2) { S(a + 5, 0, 26, 'minecraft:rose_bush[half=lower]'); S(a + 5, 1, 26, 'minecraft:rose_bush[half=upper]') }
  })
  // jardin A : potager
  F(2, -1, 2, 9, -1, 9, 'minecraft:farmland[moisture=7]'); F(3, -1, 2, 3, -1, 9, 'minecraft:water'); F(8, -1, 2, 8, -1, 9, 'minecraft:water'); F(6, -1, 1, 6, -1, 11, 'minecraft:gravel'); F(5, -1, 2, 5, -1, 9, 'minecraft:coarse_dirt'); F(7, -1, 2, 7, -1, 9, 'minecraft:coarse_dirt')
  for (var z = 2; z <= 9; z++) { S(2, 0, z, 'minecraft:wheat[age=' + (4 + z % 4) + ']'); S(4, 0, z, z < 6 ? 'minecraft:carrots[age=7]' : 'minecraft:potatoes[age=7]'); S(9, 0, z, 'minecraft:beetroots[age=3]') }
  S(2, 0, 10, 'minecraft:composter'); S(9, 0, 10, 'minecraft:water_cauldron[level=3]'); S(5, 0, 10, 'minecraft:barrel[facing=up,open=false]'); F(5, 0, 1, 5, 2, 1, 'minecraft:oak_fence'); S(5, 3, 1, 'minecraft:carved_pumpkin[facing=south]')
  // jardin B : pelouse, cerisier, table et parasol, balancoire
  S(13, 0, 3, 'minecraft:cherry_log[axis=y]'); F(13, 1, 3, 13, 3, 3, 'minecraft:cherry_log[axis=y]')
  for (var dx = -2; dx <= 2; dx++) for (var dz = -2; dz <= 2; dz++) for (var y = 3; y <= 5; y++) { var dd = Math.abs(dx) + Math.abs(dz) + Math.abs(y - 4); if (dd <= 3 && (Math.abs(dx) + Math.abs(dz) <= 2 || R() < 0.7) && 3 + dz >= 1) SA(13 + dx, y, 3 + dz, 'minecraft:cherry_leaves[persistent=true]') }
  S(15, 0, 7, 'mcwfurnitures:oak_table'); S(14, 0, 7, MAT('oak_chair', 'east')); S(16, 0, 7, MAT('oak_chair', 'west')); S(15, 0, 8, MAT('oak_chair', 'north')); S(15, 1, 7, 'minecraft:oak_fence'); S(15, 2, 7, 'minecraft:oak_fence'); F(14, 3, 6, 16, 3, 8, 'minecraft:white_wool'); S(15, 3, 7, 'minecraft:red_wool')
  F(18, 0, 3, 18, 3, 3, 'minecraft:oak_log[axis=y]'); F(18, 0, 7, 18, 3, 7, 'minecraft:oak_log[axis=y]'); F(18, 4, 3, 18, 4, 7, 'minecraft:oak_log[axis=z]'); F(18, 2, 5, 18, 3, 5, 'minecraft:chain[axis=y]'); S(18, 1, 5, 'minecraft:oak_slab[type=bottom]')
  ;[[16, 11], [16, 10], [15, 9]].forEach(c => S(c[0], -1, c[1], 'minecraft:cobblestone'))
  // jardin C : terrasse, barbecue, abri, bassin
  F(22, -1, 9, 29, -1, 11, 'minecraft:stone_bricks'); S(28, 0, 9, 'minecraft:bricks'); S(28, 1, 9, 'minecraft:campfire[lit=false,facing=south]'); S(29, 0, 9, 'minecraft:bricks'); S(29, 1, 9, 'minecraft:smoker[facing=south,lit=false]')
  S(23, 0, 10, MAT('spruce_chair', 'north')); S(24, 0, 10, MAT('spruce_chair', 'north')); S(25, 0, 10, 'minecraft:potted_fern')
  W(27, 1, 29, 3, 0, 2, 'minecraft:spruce_planks'); PORTE(28, 0, 3, 'minecraft:spruce_door', 'south', 'left', 'false'); F(26, 3, 0, 30, 3, 4, 'minecraft:spruce_slab[type=bottom]'); S(28, 0, 2, 'minecraft:barrel[facing=up,open=false]')
  F(22, -2, 3, 24, -2, 5, 'minecraft:clay'); F(22, -1, 3, 24, -1, 5, 'minecraft:water'); S(23, 0, 4, 'minecraft:lily_pad'); F(22, 0, 1, 25, 0, 1, 'minecraft:azalea_leaves[persistent=true]')
  // trottoir
  S(10, -1, 30, 'minecraft:podzol'); F(10, 0, 30, 10, 3, 30, 'minecraft:oak_log[axis=y]'); for (var dx = -2; dx <= 2; dx++) for (var dz = -1; dz <= 1; dz++) for (var y = 3; y <= 6; y++) if (Math.abs(dx) + Math.abs(dz) + Math.abs(y - 4.5) < 3.2 && 30 + dz <= 31) SA(10 + dx, y, 30 + dz, 'minecraft:oak_leaves[persistent=true]')
  F(20, 0, 31, 20, 3, 31, 'minecraft:dark_oak_fence'); S(20, 4, 31, 'minecraft:lantern')
}
