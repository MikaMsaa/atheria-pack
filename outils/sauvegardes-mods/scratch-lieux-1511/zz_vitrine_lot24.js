
// ================= HALLES DE FER ET DE VERRE (rangee sud, facade au nord z2) =================
// Trame de colonnes de fonte tous les 3 (x2..29, z2..29) ; nef x11..20 a verriere en batiere, bas-cotes a verriere plate y9.
function hbHalles() {
  var FO = 'minecraft:polished_deepslate_wall', FB = 'minecraft:polished_deepslate'
  function col(v) { return (v - 2) % 3 == 0 }
  for (var x = 0; x <= 31; x++) { S(x, -1, 0, R() < 0.8 ? 'minecraft:smooth_stone' : 'minecraft:polished_andesite'); S(x, -1, 1, R() < 0.8 ? 'minecraft:smooth_stone' : 'minecraft:andesite') }
  hbSol(0, 30, 31, 31); hbSol(0, 2, 1, 29); hbSol(30, 2, 31, 29); hbVeg(0, 30, 31, 31, 0.6)
  // sol de la halle : dalles, caniveaux
  for (var x = 2; x <= 29; x++) for (var z = 2; z <= 29; z++) S(x, 0, z, x == 15 || x == 16 ? 'minecraft:polished_andesite' : R() < 0.9 ? 'minecraft:smooth_stone' : 'minecraft:stone')
  F(2, -1, 2, 29, -1, 29, 'minecraft:stone')
  // ---- murs : soubassement de brique, vitrages, colonnes ----
  function mur(P, a1, a2) {
    for (var i = a1; i <= a2; i++) for (var y = 0; y <= 8; y++) P(i, y, col(i) ? FO : y <= 2 ? hbM(HBR) : y == 8 ? FB : y == 5 ? 'minecraft:iron_bars' : GP)
  }
  mur((i, y, b) => S(i, y, 2, b), 2, 29); mur((i, y, b) => S(i, y, 29, b), 2, 29); mur((i, y, b) => S(2, y, i, b), 3, 28); mur((i, y, b) => S(29, y, i, b), 3, 28)
  for (var i = 2; i <= 29; i++) if (col(i)) { S(i, 8, 2, FB); S(i, 8, 29, FB); S(2, 8, i, FB); S(29, 8, i, FB) }
  // entrees : grand portail de la nef (grilles mi-closes), portes des bas-cotes
  ;[2, 29].forEach(z => {
    F(12, 1, z, 13, 7, z, 'minecraft:iron_bars'); F(15, 1, z, 16, 7, z, AIR); F(18, 1, z, 19, 7, z, z == 2 ? 'minecraft:iron_bars' : AIR)
    F(6, 1, z, 7, 3, z, AIR); F(24, 1, z, 25, 3, z, AIR); F(6, 4, z, 7, 4, z, GP); F(24, 4, z, 25, 4, z, GP)
  })
  F(14, 0, 1, 17, 0, 1, hbE('minecraft:stone_brick', 'south')); F(5, 0, 1, 8, 0, 1, 'minecraft:polished_andesite'); F(23, 0, 1, 26, 0, 1, 'minecraft:polished_andesite')
  // ---- colonnes interieures de la nef, claire-voie, verrieres ----
  for (var z = 2; z <= 29; z++) if (col(z)) { F(11, 0, z, 11, 12, z, FO); F(20, 0, z, 20, 12, z, FO) }
  for (var z = 2; z <= 29; z++) [11, 20].forEach(x => { for (var y = 9; y <= 12; y++) S(x, y, z, col(z) ? FO : y == 9 ? FB : GP); S(x, 13, z, FB) })
  for (var z = 2; z <= 29; z++) { var r = col(z); F(2, 9, z, 10, 9, z, r ? FB : 'minecraft:glass'); F(21, 9, z, 29, 9, z, r ? FB : 'minecraft:glass') }
  F(2, 9, 2, 10, 9, 2, FB); F(21, 9, 2, 29, 9, 2, FB); F(2, 9, 29, 10, 9, 29, FB); F(21, 9, 29, 29, 9, 29, FB); F(2, 9, 3, 2, 9, 28, FB); F(29, 9, 3, 29, 9, 28, FB)
  for (var k = 0; k <= 4; k++) for (var z = 2; z <= 29; z++) { var b = col(z) || z == 2 || z == 29 ? FB : 'minecraft:glass'; F(11 + k, 13 + k, z, 11 + k, 14 + k, z, b); F(20 - k, 13 + k, z, 20 - k, 14 + k, z, b) }
  F(15, 19, 2, 16, 19, 29, 'minecraft:polished_deepslate_slab[type=bottom]')
  // pignons de la nef : claire-voie et horloge
  ;[2, 29].forEach(z => {
    for (var x = 12; x <= 19; x++) for (var y = 9; y <= 12; y++) S(x, y, z, x % 3 == 2 ? FO : GP)
    for (var k = 0; k <= 3; k++) for (var x = 12 + k; x <= 19 - k; x++) S(x, 13 + k, z, GP)
    F(14, 13, z, 17, 13, z, FB); F(15, 14, z, 16, 15, z, 'minecraft:white_concrete'); S(15, 15, z, 'minecraft:black_concrete')
  })
  // horloge a quatre faces pendue au faitage
  F(15, 9, 15, 16, 10, 16, 'minecraft:white_concrete'); S(15, 10, 15, 'minecraft:black_concrete'); S(16, 9, 16, 'minecraft:black_concrete')
  F(15, 11, 15, 15, 16, 15, 'minecraft:chain[axis=y]'); F(16, 11, 16, 16, 16, 16, 'minecraft:chain[axis=y]')
  // ---- etals : poteaux, auvent raye, comptoir, marchandises ----
  var AUV = [['red', 'white'], ['green', 'white'], ['blue', 'white'], ['yellow', 'orange'], ['red', 'yellow']]
  function etal(x, z, w, t) {
    var c = choix(AUV)
    ;[[x, z], [x + w - 1, z], [x, z + 2], [x + w - 1, z + 2]].forEach(p => F(p[0], 1, p[1], p[0], 3, p[1], 'minecraft:dark_oak_fence'))
    for (var i = 0; i < w; i++) for (var j = 0; j <= 2; j++) S(x + i, 4, z + j, 'minecraft:' + c[i % 2] + '_wool')
    for (var i = 1; i < w - 1; i++) {
      S(x + i, 1, z, t == 0 ? 'minecraft:packed_ice' : t == 1 ? 'minecraft:stripped_spruce_wood' : t == 2 ? 'minecraft:spruce_planks' : 'minecraft:spruce_slab[type=top]')
      var top = t == 0 ? choix(['minecraft:blue_ice', 'minecraft:prismarine', 'minecraft:air', 'minecraft:packed_ice']) : t == 1 ? choix(['minecraft:chain[axis=y]', 'minecraft:air']) : t == 2 ? choix(['minecraft:melon', 'minecraft:pumpkin', 'farmersdelight:carrot_crate', 'farmersdelight:potato_crate', 'farmersdelight:cabbage_crate', 'minecraft:air']) : choix(['minecraft:potted_poppy', 'minecraft:potted_dandelion', 'minecraft:potted_dead_bush', 'minecraft:potted_azure_bluet', 'minecraft:flower_pot'])
      if (top == 'minecraft:chain[axis=y]') { S(x + i, 3, z + 1, top); S(x + i, 2, z + 1, top); S(x + i, 1, z + 1, 'minecraft:brown_terracotta') } else if (top != 'minecraft:air') S(x + i, 2, z, top)
      if (R() < 0.6) S(x + i, 1, z + 2, choix(['minecraft:barrel[facing=up,open=false]', 'supplementaries:sack', 'minecraft:hay_block', 'farmersdelight:onion_crate']))
    }
  }
  var t = 0
  ;[5, 11, 17, 23].forEach(z => { etal(4, z, 4, t % 4); etal(24, z, 4, (t + 1) % 4); etal(12, z, 3, (t + 2) % 4); etal(17, z, 3, (t + 3) % 4); t++ })
  // eclairage, mousse, toiles, debris
  for (var x = 4; x <= 28; x += 6) for (var z = 4; z <= 28; z += 6) if (x < 11 || x > 20) S(x, 8, z, HLH)
  for (var i = 0; i < 40; i++) { var x = 3 + Math.floor(R() * 26), z = 3 + Math.floor(R() * 26); SA(x, 1, z, choix(['minecraft:moss_carpet', 'minecraft:moss_carpet', 'minecraft:white_carpet', 'supplementaries:sack', 'minecraft:light_gray_carpet'])) }
  ;[[3, 3], [28, 3], [3, 28], [28, 28], [10, 15], [21, 9]].forEach(p => SA(p[0], 8, p[1], 'minecraft:cobweb'))
  // charrette de livraison renversee devant l'entree
  F(26, 0, 0, 29, 0, 1, 'minecraft:spruce_planks'); S(25, 0, 0, 'minecraft:barrel[facing=west,open=true]'); S(24, 0, 1, 'farmersdelight:potato_crate'); S(30, 0, 1, 'minecraft:dark_oak_fence')
}
