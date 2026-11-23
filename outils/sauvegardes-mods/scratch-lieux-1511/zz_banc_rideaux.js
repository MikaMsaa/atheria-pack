
// ================= BANC : orientation des rideaux Macaw, paratonnerres, objets poses sur les paves =================
function bancR() {
  F(-2, -1, -2, 30, -1, 22, 'minecraft:smooth_stone'); F(0, 0, 11, 18, 0, 18, 'minecraft:spruce_planks')
  F(0, 0, 10, 18, 5, 10, 'minecraft:light_gray_concrete')
  // quatre fenetres de 2 ; dehors = nord (z < 10), dedans = sud (z > 10)
  var W = [[2, 'north', 'left', 'right'], [6, 'south', 'left', 'right'], [10, 'north', 'right', 'left'], [14, 'south', 'right', 'left']]
  W.forEach((w, i) => {
    F(w[0], 2, 10, w[0] + 1, 3, 10, 'minecraft:glass_pane')
    F(w[0], 2, 11, w[0], 3, 11, 'mcwwindows:red_curtain[facing=' + w[1] + ',tied=' + w[2] + ']')
    F(w[0] + 1, 2, 11, w[0] + 1, 3, 11, 'mcwwindows:red_curtain[facing=' + w[1] + ',tied=' + w[3] + ']')
    F(w[0], 4, 11, w[0] + 1, 4, 11, 'mcwwindows:dark_oak_curtain_rod[facing=' + w[1] + ']')
    for (var k = 0; k <= i; k++) S(w[0] + k % 2, 1, 13 + Math.floor(k / 2), 'minecraft:yellow_wool')
  })
  // rideaux non noues
  F(0, 0, 0, 0, 0, 0, 'minecraft:air')
  // paratonnerres : sur barreaux, sur bloc, sur dalle
  F(21, 0, 4, 21, 3, 4, 'minecraft:iron_bars'); S(21, 4, 4, 'minecraft:lightning_rod[facing=up]')
  S(23, 0, 4, 'minecraft:stone'); S(23, 1, 4, 'minecraft:lightning_rod[facing=up]')
  F(25, 0, 4, 25, 3, 4, 'minecraft:chain[axis=y]'); S(25, 4, 4, 'minecraft:lightning_rod[facing=up]')
  // paves Macaw et objets poses dessus
  var P = ['mcwpaths:andesite_square_paving', 'mcwpaths:stone_flagstone', 'mcwpaths:cobblestone_square_paving', 'mcwpaths:andesite_flagstone']
  P.forEach((p, i) => { S(21 + i * 2, -1, 10, p); S(21 + i * 2, 0, 10, i % 2 ? 'minecraft:white_carpet' : 'minecraft:short_grass'); S(21 + i * 2, -1, 12, p) })
}
var BANC_FN = function () { lot(bancR, 0, 0, 999, 7, 32, 12) }
var BANC_VUES = function () {
  vue('br_dedans', 0, 0, 9, 3, 17, 9, 2.5, 10)
  vue('br_dedans_proche', 0, 0, 5, 3, 14, 5, 2.5, 10)
  vue('br_dehors', 0, 0, 9, 3, 3, 9, 2.5, 10)
  vue('br_dessus', 0, 0, 9, 9, 13, 9, 2, 11)
  vue('br_cote', 0, 0, -3, 3, 12, 4, 2.5, 11)
  vue('br_paves', 0, 0, 24, 3, 16, 24, 0, 10)
  vue('br_paratonnerres', 0, 0, 23, 3, 0, 23, 2, 4)
}
