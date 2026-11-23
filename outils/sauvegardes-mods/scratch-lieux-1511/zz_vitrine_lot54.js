// ================= VEHICULES MAQUETTES v2, suite (lot54, 11/11) : metro, train, camions speciaux, engins, deux-roues, caravane =================
// Meme repere que le lot53 (vhDebut, vS, vF, vS2, vhRoues, vhRetros).

// ---------------- RAME DE METRO (voiture 16 x 3, 5 de haut) ----------------
// Caisse inox, bandeau colore, quatre portes doubles par flanc, baies, intercirculation aux bouts, frotteur sur le bogie.
function vhMetro(x, z, dir, y) {
  vhDebut(x, y, z, dir, 16, 3)
  var IN = 'minecraft:light_gray_concrete', BD = 'minecraft:blue_concrete', VI = 'minecraft:tinted_glass'
  var portes = [2, 3, 7, 8, 12, 13]
  for (var u = 0; u <= 15; u++) {
    vS2(u, 0, 0, [1, 4, 11, 14].indexOf(u) >= 0 ? VHN : 'minecraft:gray_concrete'); vS(u, 0, 1, VHPN)
    var p = portes.indexOf(u) >= 0, bout = u == 0 || u == 15
    vS2(u, 1, 0, p ? 'minecraft:tinted_glass' : BD)
    vS2(u, 2, 0, p ? 'minecraft:tinted_glass' : bout || u % 5 == 0 ? IN : VI)
    vS2(u, 3, 0, p ? 'minecraft:tinted_glass' : IN)
    vF(u, 4, 0, u, 4, 2, IN)
    vF(u, 1, 1, u, 3, 1, 'minecraft:air')
    if (!p && !bout && u % 5 != 0) vS(u, 1, 1, 'minecraft:blue_terracotta')
    if (u == 5 || u == 10) vS(u, 3, 1, 'minecraft:chain[axis=y]')
  }
  ;[0, 15].forEach(u => { vS(u, 1, 0, VHPH); vS(u, 1, 2, VHPH); vS(u, 1, 1, IN); vS(u, 2, 0, 'minecraft:black_stained_glass'); vS(u, 2, 2, 'minecraft:black_stained_glass'); vS(u, 2, 1, 'minecraft:tinted_glass'); vS(u, 3, 1, IN) })
  vF(1, 5, 1, 14, 5, 1, 'minecraft:smooth_stone_slab[type=bottom]')
}

// ---------------- WAGONS DE TRAIN (voiture voyageurs 20 x 3, wagon couvert 14 x 3, wagon-citerne 14 x 3) ----------------
function vhBogie(u) { vS2(u, 0, 0, VHN); vS2(u + 1, 0, 0, VHN); vS(u, 0, 1, 'minecraft:gray_concrete'); vS(u + 1, 0, 1, 'minecraft:gray_concrete') }
function vhTampons(L) {
  ;[-1, L].forEach(u => { vS(u, 1, 0, 'minecraft:polished_blackstone_button[face=wall,facing={' + (u < 0 ? 'F' : 'B') + '}]'); vS(u, 1, 2, 'minecraft:polished_blackstone_button[face=wall,facing={' + (u < 0 ? 'F' : 'B') + '}]'); vS(u, 1, 1, 'minecraft:chain[axis={AU}]') })
}
function vhVoitureVoyageurs(x, z, dir, col, y) {
  vhDebut(x, y, z, dir, 20, 3)
  var C = 'minecraft:' + (col || 'green') + '_concrete', TO = 'minecraft:gray_concrete'
  for (var u = 0; u <= 19; u++) {
    vS(u, 0, 1, VHPN); vS2(u, 0, 0, 'minecraft:smooth_stone_slab[type=top]')
    var porte = u == 1 || u == 18
    vS2(u, 1, 0, C); vS2(u, 2, 0, porte ? C : u % 2 ? 'minecraft:tinted_glass' : C); vS2(u, 3, 0, C)
    vF(u, 4, 0, u, 4, 2, TO)
    vF(u, 1, 1, u, 3, 1, 'minecraft:air')
    if (!porte && u > 1 && u < 18) vS(u, 1, 1, 'minecraft:red_terracotta')
  }
  vF(0, 1, 0, 0, 3, 2, C); vF(19, 1, 0, 19, 3, 2, C); vS(0, 2, 1, 'minecraft:tinted_glass'); vS(19, 2, 1, 'minecraft:tinted_glass')
  ;[1, 18].forEach(u => { vS(u, 1, 0, 'minecraft:spruce_trapdoor[facing={G},half=bottom,open=true]'); vS(u, 1, 2, 'minecraft:spruce_trapdoor[facing={D},half=bottom,open=true]') })
  vF(1, 5, 1, 18, 5, 1, 'minecraft:gray_carpet')
  vhBogie(3); vhBogie(15); vhTampons(20)
}
function vhWagonCouvert(x, z, dir, col, ouvert, y) {
  vhDebut(x, y, z, dir, 14, 3)
  var C = 'minecraft:' + (col || 'brown') + '_terracotta', P = 'minecraft:spruce_planks'
  for (var u = 0; u <= 13; u++) { vS(u, 0, 1, VHPN); vS2(u, 0, 0, 'minecraft:smooth_stone_slab[type=top]') }
  vF(0, 1, 0, 13, 3, 2, C); vF(1, 1, 1, 12, 3, 1, 'minecraft:air')
  for (var u = 1; u <= 12; u += 3) { vS2(u, 1, 0, 'minecraft:dark_oak_planks'); vS2(u, 2, 0, 'minecraft:dark_oak_planks'); vS2(u, 3, 0, 'minecraft:dark_oak_planks') }
  vF(0, 4, 0, 13, 4, 2, 'minecraft:spruce_slab[type=bottom]'); vF(0, 4, 1, 13, 4, 1, P)
  if (ouvert) { vF(6, 1, 0, 7, 3, 0, 'minecraft:air'); vS(8, 1, -1, 'minecraft:spruce_trapdoor[facing={G},half=bottom,open=true]'); vS(9, 1, -1, 'minecraft:spruce_trapdoor[facing={G},half=bottom,open=true]'); vS(7, 1, 1, 'minecraft:barrel[facing=up,open=false]'); vS(8, 1, 1, 'supplementaries:sack') }
  vhBogie(2); vhBogie(10); vhTampons(14)
}
function vhWagonCiterne(x, z, dir, col, y) {
  vhDebut(x, y, z, dir, 14, 3)
  var C = 'minecraft:' + (col || 'black') + '_concrete'
  for (var u = 0; u <= 13; u++) { vS(u, 0, 1, VHPN); vS2(u, 0, 0, 'minecraft:smooth_stone_slab[type=top]') }
  // cuve : section ronde approchee (escaliers sur les aretes)
  for (var u = 1; u <= 12; u++) {
    vS(u, 1, 1, C); vS(u, 2, 1, C); vS(u, 3, 1, C)
    vS(u, 1, 0, 'minecraft:blackstone_stairs[facing={D},half=top,shape=straight]'.replace('blackstone', col == 'white' ? 'quartz' : 'blackstone')); vS(u, 1, 2, 'minecraft:blackstone_stairs[facing={G},half=top,shape=straight]'.replace('blackstone', col == 'white' ? 'quartz' : 'blackstone'))
    vS(u, 2, 0, C); vS(u, 2, 2, C)
    vS(u, 3, 0, 'minecraft:blackstone_stairs[facing={D},half=bottom,shape=straight]'.replace('blackstone', col == 'white' ? 'quartz' : 'blackstone')); vS(u, 3, 2, 'minecraft:blackstone_stairs[facing={G},half=bottom,shape=straight]'.replace('blackstone', col == 'white' ? 'quartz' : 'blackstone'))
  }
  vS(6, 4, 1, 'minecraft:iron_block'); vS(7, 4, 1, 'minecraft:iron_trapdoor[facing={F},half=bottom,open=false]')
  vF(0, 1, 0, 0, 1, 2, 'minecraft:iron_bars'); vF(13, 1, 0, 13, 1, 2, 'minecraft:iron_bars')
  vS(6, 1, -1, 'minecraft:ladder[facing={G}]'); vS(6, 2, -1, 'minecraft:ladder[facing={G}]')
  vhBogie(2); vhBogie(10); vhTampons(14)
}

// ---------------- CAMIONS SPECIAUX (cabine commune 11 x 4) ----------------
function vhCabine(C, col) {
  vF(0, 0, 0, 0, 0, 3, VHPC); vF(1, 0, 1, 10, 0, 2, VHPN)
  vhRoues(1); vhRoues(7); vhRoues(8)
  vF(3, 0, 0, 4, 0, 0, 'minecraft:iron_block'); vF(3, 0, 3, 4, 0, 3, VHN)
  vF(0, 1, 0, 2, 3, 3, C)
  vS(0, 1, 0, VHPH); vS(0, 1, 3, VHPH); vS(0, 1, 1, 'minecraft:iron_block'); vS(0, 1, 2, 'minecraft:iron_block')
  vF(0, 2, 0, 0, 2, 3, 'minecraft:tinted_glass'); vS2(1, 2, 0, 'minecraft:tinted_glass')
  vF(1, 1, 1, 2, 2, 2, 'minecraft:air'); vF(1, 1, 1, 1, 1, 2, VHN); vF(2, 1, 1, 2, 1, 2, 'minecraft:gray_wool')
  vF(0, 4, 0, 2, 4, 3, 'minecraft:smooth_stone_slab[type=bottom]'); vS(0, 3, 0, VHCL); vS(0, 3, 3, VHCL)
  vhRetros(0, 2)
  vS(2, 0, -1, 'minecraft:iron_trapdoor[facing={D},half=top,open=false]'); vS(2, 0, 4, 'minecraft:iron_trapdoor[facing={G},half=top,open=false]')
  vS2(10, 0, 0, VHPC); vS2(10, 0, 1, VHPC)
}
// toupie a beton : cuve inclinee (degrade d'escaliers), goulotte a l'arriere
function vhToupie(x, z, dir, col, y) {
  vhDebut(x, y, z, dir, 11, 4); var C = 'minecraft:' + (col || 'orange') + '_concrete'; vhCabine(C)
  vF(3, 1, 0, 10, 1, 3, VHPN)
  vF(4, 2, 0, 9, 3, 3, 'minecraft:light_gray_concrete'); vF(5, 4, 1, 9, 4, 2, 'minecraft:light_gray_concrete'); vF(6, 5, 1, 8, 5, 2, 'minecraft:light_gray_concrete')
  for (var u = 4; u <= 9; u += 2) { vS2(u, 2, 0, C); vS2(u, 3, 0, C) }
  vS(4, 4, 1, 'minecraft:smooth_stone_stairs[facing={B},half=bottom,shape=straight]'.replace('smooth_stone_stairs', 'stone_stairs')); vS(4, 4, 2, 'minecraft:stone_stairs[facing={B},half=bottom,shape=straight]')
  vS(10, 3, 1, 'minecraft:hopper[facing=down,enabled=true]'); vS(10, 2, 1, 'minecraft:iron_trapdoor[facing={F},half=top,open=false]')
  vS(10, 1, 0, VHFR); vS(10, 1, 3, VHFR)
}
// benne : caisson a ridelles hautes, gravats dedans
function vhBenne(x, z, dir, col, y) {
  vhDebut(x, y, z, dir, 11, 4); var C = 'minecraft:' + (col || 'yellow') + '_concrete'; vhCabine(C)
  vF(3, 1, 0, 10, 3, 3, 'minecraft:gray_concrete'); vF(4, 2, 1, 10, 3, 2, 'minecraft:air')
  vF(4, 2, 1, 9, 2, 2, 'minecraft:gravel'); vS(5, 3, 1, 'minecraft:cobblestone'); vS(7, 3, 2, 'minecraft:gravel')
  for (var u = 3; u <= 10; u += 2) vS2(u, 3, 0, 'minecraft:light_gray_concrete')
  vF(10, 1, 1, 10, 3, 2, 'minecraft:gray_concrete'); vS(10, 1, 0, VHFR); vS(10, 1, 3, VHFR)
}
// grumier : ranchers verticaux et grumes couchees
function vhGrumier(x, z, dir, col, y) {
  vhDebut(x, y, z, dir, 11, 4); var C = 'minecraft:' + (col || 'red') + '_concrete'; vhCabine(C)
  vF(3, 1, 0, 10, 1, 3, VHPN)
  ;[4, 7, 10].forEach(u => { vS(u, 2, 0, 'minecraft:iron_bars'); vS(u, 3, 0, 'minecraft:iron_bars'); vS(u, 2, 3, 'minecraft:iron_bars'); vS(u, 3, 3, 'minecraft:iron_bars') })
  vF(3, 2, 1, 11, 2, 2, 'minecraft:spruce_log[axis={AU}]'); vF(3, 3, 1, 10, 3, 2, 'minecraft:spruce_log[axis={AU}]'); vF(4, 2, 0, 9, 2, 0, 'minecraft:spruce_log[axis={AU}]'); vF(4, 2, 3, 9, 2, 3, 'minecraft:spruce_log[axis={AU}]')
  vS(10, 1, 0, VHFR); vS(10, 1, 3, VHFR)
}
// ---------------- BLINDE A ROUES (10 x 4, 5 de haut) ----------------
function vhBlinde(x, z, dir, y) {
  vhDebut(x, y, z, dir, 10, 4)
  var K = 'minecraft:green_terracotta', K2 = 'minecraft:brown_terracotta'
  vF(0, 0, 1, 9, 0, 2, VHPN); vhRoues(1); vhRoues(4); vhRoues(8)
  vF(0, 1, 0, 9, 3, 3, K)
  for (var u = 0; u <= 9; u++) if ((u * 7) % 5 == 1) vS2(u, 2, 0, K2)
  vS(0, 1, 0, 'minecraft:smooth_stone_stairs[facing={B},half=bottom,shape=straight]'.replace('smooth_stone_stairs', 'mud_brick_stairs'))
  vF(0, 2, 0, 0, 2, 3, 'minecraft:mud_brick_stairs[facing={B},half=bottom,shape=straight]')
  vF(0, 3, 0, 0, 3, 3, 'minecraft:air'); vF(1, 3, 0, 1, 3, 3, 'minecraft:tinted_glass')
  vS(0, 1, 0, VHPH); vS(0, 1, 3, VHPH)
  vF(4, 4, 1, 6, 4, 2, K); vS(5, 5, 1, 'minecraft:mud_brick_slab[type=bottom]'); vS(3, 4, 1, 'minecraft:lightning_rod[facing={F},powered=false,waterlogged=false]'); vS(2, 4, 1, 'minecraft:lightning_rod[facing={F},powered=false,waterlogged=false]')
  vF(9, 1, 1, 9, 2, 2, 'minecraft:iron_trapdoor[facing={F},half=bottom,open=false]'.replace('open=false', 'open=false'))
  vS(9, 3, 0, VHFR); vS(9, 3, 3, VHFR)
  vS(7, 4, 0, 'minecraft:chest[facing={G},type=single,waterlogged=false]'); vS(8, 4, 3, 'supplementaries:sack')
}

// ---------------- CHARIOT ELEVATEUR (4 x 2, mat et fourches) ----------------
function vhChariot(x, z, dir, haut, y) {
  vhDebut(x, y, z, dir, 4, 2)
  vF(1, 0, 0, 3, 0, 1, 'minecraft:yellow_concrete'); vS(1, 0, 0, VHN); vS(1, 0, 1, VHN); vS(3, 0, 0, VHN); vS(3, 0, 1, VHN)
  vS(3, 1, 0, 'minecraft:gray_concrete'); vS(3, 1, 1, 'minecraft:gray_concrete')
  vS(2, 1, 0, 'minecraft:black_concrete'); vS(2, 1, 1, 'minecraft:air')
  vS(2, 2, 0, 'minecraft:iron_bars'); vS(2, 2, 1, 'minecraft:iron_bars'); vS(3, 2, 0, 'minecraft:iron_bars'); vS(3, 2, 1, 'minecraft:iron_bars')
  vF(2, 3, 0, 3, 3, 1, 'minecraft:yellow_carpet')
  vF(1, 1, 0, 1, 3, 1, 'minecraft:iron_bars')
  var h = haut || 0
  vS(0, h, 0, 'minecraft:iron_trapdoor[facing={F},half=bottom,open=false]'); vS(0, h, 1, 'minecraft:iron_trapdoor[facing={F},half=bottom,open=false]')
}

// ---------------- MOTO (3 x 1) ----------------
function vhMoto(x, z, dir, col, y) {
  vhDebut(x, y, z, dir, 3, 1)
  vS(0, 0, 0, 'minecraft:black_concrete'.replace('concrete', 'concrete')); vS(2, 0, 0, 'minecraft:black_concrete')
  vS(0, 0, 0, 'minecraft:polished_blackstone_wall'); vS(2, 0, 0, 'minecraft:polished_blackstone_wall')
  vS(1, 0, 0, 'minecraft:' + (col || 'red') + '_concrete')
  vS(1, 1, 0, 'minecraft:black_carpet'); vS(0, 1, 0, 'minecraft:lever[face=floor,facing={F},powered=false]')
}

// ---------------- CARAVANE (8 x 3, 4 de haut) ----------------
function vhCaravane(x, z, dir, y) {
  vhDebut(x, y, z, dir, 8, 3)
  var B = 'minecraft:white_concrete', BA = 'minecraft:brown_concrete'
  vS(-1, 0, 1, 'minecraft:chain[axis={AU}]'); vS(0, 0, 1, 'minecraft:polished_blackstone_wall')
  vhRoues(4)
  vF(1, 1, 0, 7, 3, 2, B); vF(2, 1, 1, 6, 2, 1, 'minecraft:air')
  for (var u = 1; u <= 7; u++) vS2(u, 1, 0, BA)
  vS2(2, 2, 0, 'minecraft:tinted_glass'); vS2(6, 2, 0, 'minecraft:tinted_glass'); vS(1, 2, 1, 'minecraft:tinted_glass')
  vS(4, 1, 2, 'minecraft:spruce_trapdoor[facing={D},half=bottom,open=true]'); vS(4, 2, 2, 'minecraft:air')
  vF(1, 4, 0, 7, 4, 2, 'minecraft:smooth_quartz_slab[type=bottom]'); vS(4, 4, 1, 'minecraft:white_stained_glass')
  vS(7, 1, 0, VHFR); vS(7, 1, 2, VHFR)
  vS(3, 1, 1, 'minecraft:white_wool'); vS(5, 1, 1, 'minecraft:barrel[facing=up,open=false]')
}

// ---------------- BANC 2 ----------------
function vhBanc2() {
  OX = VB.X0; OY = VB.Y0; OZ = VB.Z0; CUT = 999; GRAINE = 5401
  for (var x = -8; x <= 111; x++) for (var z = 0; z <= 47; z++) { var r = R(); S(x, -1, z, z >= 6 && z <= 10 ? (z == 7 || z == 9 ? 'minecraft:iron_block' : 'minecraft:gravel') : r < 0.85 ? 'minecraft:black_concrete' : 'minecraft:gray_concrete') }
  vhVoitureVoyageurs(0, 7, 'x', 'green'); vhWagonCouvert(22, 7, 'x', 'brown', true); vhWagonCiterne(38, 7, 'x', 'black'); vhMetro(56, 7, 'x')
  vhToupie(4, 16, 'x', 'orange'); vhBenne(20, 16, 'x', 'yellow'); vhGrumier(36, 16, 'x', 'red'); vhBlinde(70, 16, 'x')
  vhChariot(4, 30, 'x', 1); vhMoto(14, 30, 'x', 'red'); vhMoto(14, 32, 'x', 'blue'); vhCaravane(22, 30, 'x')
}
var QFIN_VH2 = function () { HM = {}; lot(vhBanc2, 0, 0, 999, 5401, 112, 20) }
function vuesVH2() {
  vue('vh2_ensemble', 0, 0, 40, 20, -16, 40, 2, 20, 3000)
  vue('vh2_train', 0, 0, 24, 4, -2, 14, 2, 8)
  vue('vh2_wagons', 0, 0, 50, 4, -2, 38, 2, 8)
  vue('vh2_metro', 0, 0, 76, 3, 3, 64, 2, 8)
  vue('vh2_toupie_benne', 0, 0, 22, 4, 11, 14, 2, 17)
  vue('vh2_grumier', 0, 0, 54, 5, 11, 44, 2, 17)
  vue('vh2_blinde', 0, 0, 86, 4, 12, 76, 2, 17)
  vue('vh2_petits', 0, 0, 12, 4, 25, 16, 1, 31)
}
