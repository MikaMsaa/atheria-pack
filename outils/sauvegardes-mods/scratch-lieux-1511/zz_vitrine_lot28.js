
// ================= HAUSSMANNIEN V2 : moteur de palette, memoire des blocs poses, passes de finition =================
// HB2 = true pendant la construction v2 : S/SA/F memorisent chaque bloc (HM) et passent par la palette THM.
function H3(x, y, z) { var s = Math.sin((OX + x) * 12.9898 + (OY + y) * 78.233 + (OZ + z) * 37.719) * 43758.5453; return s - Math.floor(s) }
function HG(x, y, z) { return HM[hk(x, y, z)] || AIR }
function estVerre(b) { return /glass_pane|:glass$|_glass$/.test(b) }

// ---- palette haussmannienne : refends au rez, pierre de taille nuancee, frises a la grecque, pilastres cannneles, parquets ----
var PARQ = ['chipped:versailles_spruce_planks', 'chipped:herringbone_spruce_planks', 'chipped:double_herringbone_spruce_planks', 'chipped:herringbone_oak_planks', 'chipped:versailles_dark_oak_planks']
function hb2Parquet(x, y, z) { if (y <= 0 || y % 6 != 0) return null; return PARQ[Math.floor(H3(Math.floor(x / 7) * 7, y, Math.floor(z / 7) * 7) * PARQ.length)] }
var THM_HB = {
  'minecraft:smooth_sandstone': (x, y, z) => { if (y < 0) return null; if (y <= 5) return 'chipped:stacked_sandstone_bricks'; var h = H3(x, y, z); return h < 0.13 ? 'chipped:sanded_sandstone' : h < 0.19 ? 'chipped:polished_sandstone' : null },
  'minecraft:cut_sandstone': (x, y, z) => { if (y < 0) return null; if (y <= 5) return 'chipped:stacked_sandstone_bricks'; if (y % 6 == 0) return (y == 12 || y == 24) ? 'chipped:ornate_sandstone_pillar' : null; return 'chipped:simple_sandstone_pillar' },
  'minecraft:chiseled_sandstone': () => 'chipped:engraved_sandstone',
  'minecraft:spruce_planks': (x, y, z) => hb2Parquet(x, y, z),
  'minecraft:oak_planks': (x, y, z) => hb2Parquet(x, y, z),
  'minecraft:dark_oak_planks': (x, y, z) => hb2Parquet(x, y, z),
  'minecraft:bricks': (x, y, z) => { if (y < 0) return null; if (y % 6 == 5) return 'createdeco:long_red_bricks'; return null },
  'minecraft:deepslate_tiles': (x, y, z) => H3(x, y, z) < 0.12 ? 'minecraft:cracked_deepslate_tiles' : null,
  'minecraft:glass': (x, y, z) => H3(x, y, z) < 0.45 ? 'chipped:clear_leaded_glass' : null
}

// ---- appuis (dalle haute) sous les fenetres, corniches (marche renversee) au-dessus, jardinieres ----
// axe 'x' : facade dans le plan z = p, exterieur en p + d ; axe 'z' : facade dans le plan x = p
function hb2Appuis(axe, a1, a2, ymin, ymax, p, d, appui, linteau, jard) {
  var fe = axe == 'x' ? (d > 0 ? 'south' : 'north') : (d > 0 ? 'east' : 'west'), fm = OPP[fe]
  function P(a, y) { return axe == 'x' ? [a, y, p] : [p, y, a] }
  function O(a, y) { return axe == 'x' ? [a, y, p + d] : [p + d, y, a] }
  for (var a = a1; a <= a2; a++) for (var y = ymin; y <= ymax; y++) {
    var c = P(a, y); if (!estVerre(HG(c[0], c[1], c[2]))) continue
    var dn = P(a, y - 1), up = P(a, y + 1), od = O(a, y - 1), ou = O(a, y + 1), oc = O(a, y)
    if (!estVerre(HG(dn[0], dn[1], dn[2])) && libreH(od[0], od[1], od[2])) {
      S(od[0], od[1], od[2], appui)
      if (jard && libreH(oc[0], oc[1], oc[2]) && H3(a, y, p) < jard) S(oc[0], oc[1], oc[2], 'supplementaries:flower_box[facing=' + fe + ',face=wall]')
    }
    if (!estVerre(HG(up[0], up[1], up[2])) && libreH(ou[0], ou[1], ou[2])) S(ou[0], ou[1], ou[2], linteau.replace('{F}', fm))
  }
  if (FIN) finFacade(axe, a1, a2, ymin, ymax, p, d)
}
function hb2Pierre(axe, a1, a2, ymin, ymax, p, d, jard) { hb2Appuis(axe, a1, a2, ymin, ymax, p, d, 'minecraft:smooth_sandstone_slab[type=top]', 'minecraft:smooth_sandstone_stairs[facing={F},half=top,shape=straight]', jard) }
function hb2Brique(axe, a1, a2, ymin, ymax, p, d, jard) { hb2Appuis(axe, a1, a2, ymin, ymax, p, d, 'minecraft:stone_brick_slab[type=top]', 'minecraft:stone_brick_stairs[facing={F},half=top,shape=straight]', jard) }

// ---- reverberes Macaw (eteints) a la place des fûts de v1 ----
function hb2Lampe(x, z, dx, dz, double) {
  var id = double ? 'mcwlights:double_street_lamp' : 'mcwlights:classic_street_lamp', f = double ? 'facing=' + (dz ? 'north' : 'east') + ',' : ''
  S(x, 0, z, id + '[' + f + 'part=bottom,lit=false]'); for (var y = 1; y <= 3; y++) S(x, y, z, id + '[' + f + 'part=middle,lit=false]')
  S(x, 4, z, id + '[' + f + 'part=' + (H3(x, 4, z) < 0.15 ? 'middle' : 'top') + ',lit=false]')
  hbLibre(x, z)
}

// ---- pieces : complements moddes (n'ecrasent rien : remplissage de l'air seulement) ----
var ASSIET = ['createfood:cheesecake_slice_small_plate_block', 'createfood:cheese_slice_small_plate_block', 'createfood:apple_cheesecake_slice_small_plate_block', 'createfood:baked_potato_butter_small_plate_block']
var GATEAUX = ['createfood:cheesecake', 'createfood:cream_cake', 'createfood:berry_pie', 'createfood:chocolate_cream_cake', 'createfood:apple_cheesecake', 'createfood:bread_pudding_block']
var BOUT = ['createfood:chocolate_milk_bottle_block', 'createfood:builders_tea_bottle_block', 'createfood:apple_juice_bottle_block', 'createfood:berry_jam_bottle_block']
function pieceEnrichir(c, type, etat) {
  var L = c.L, D = c.D, H = c.h
  function A(u, v, dy, b) { if (u < 0 || v < 0 || u >= L || v >= D) return; var p = c.pos(u, v); SA(p[0], c.y + dy, p[1], c.f(b)) }
  if (type == 'salon') {
    var c0 = Math.floor((L - 2) / 2)
    A(L - 1, 1, 1, 'supplementaries:globe[facing={I}]'); A(c0 + 1, 2, 1, 'supplementaries:candle_holder[lit=false,facing={I},face=floor,candles=3]')
    A(0, 2, 1, choix(['minecraft:jukebox', 'supplementaries:urn', 'minecraft:decorated_pot']))
  } else if (type == 'salle') {
    var c0 = Math.floor((L - 1) / 2)
    A(c0 - 1, 2, 2, choix(ASSIET)); A(c0 + 1, 2, 2, choix(BOUT)); A(c0, D - 1, 2, 'supplementaries:candle_holder[lit=false,facing={I},face=floor,candles=2]')
  } else if (type == 'cuisine') {
    for (var u = 3; u <= L - 2; u++) A(u, D - 1, 2, choix(['farmersdelight:skillet[facing={W},support=false]', 'supplementaries:jar', choix(BOUT), 'createfood:cheese_block']))
    A(L - 1, D - 1, 1, 'farmersdelight:wooden_basket[facing=up]'); A(L - 1, 0, 1, 'farmersdelight:tomato_crate')
  } else if (type == 'chambre') {
    A(L - 1, 1, 1, 'supplementaries:hourglass[facing={I}]'); A(0, 1, 1, 'minecraft:chest[facing={P}]')
  } else if (type == 'bureau') {
    var c0 = Math.floor((L - 1) / 2)
    A(c0 - 1, 1, 1, 'supplementaries:blackboard[facing={I}]'); A(L - 1, 1, 1, 'supplementaries:globe_sepia[facing={I}]'); A(c0, 1, 2, 'supplementaries:hourglass[facing={I}]')
  }
  if (etat == 1) { A(0, 0, H, 'minecraft:cobweb'); A(L - 1, D - 1, H, 'minecraft:cobweb'); A(Math.floor(R() * L), Math.floor(R() * D), 1, 'supplementaries:book_pile_horizontal') }
}
