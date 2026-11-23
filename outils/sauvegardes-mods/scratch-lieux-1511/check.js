// TEMPORAIRE : batiments temoins (maison de ville, immeuble haussmannien avec pharmacie), captures pour validation
var VB = { t: 0, etape: 0, q: [], qi: 0, echecs: {}, nEchecs: 0, lots: [], li: 0, vues: [], vi: 0, att: 0, X0: 0, Y0: 0, Z0: 0 }
var CUT = 999, OX = 0, OY = 0, OZ = 0, GRAINE = 1
function vlog(m) { console.info('[VIT] ' + m) }
function R() { GRAINE = (GRAINE * 1103515245 + 12345) & 0x7fffffff; return GRAINE / 0x7fffffff }
// Le code ecrit toujours facing = cote ou regarde l'utilisateur du meuble. Les modeles mcw ne suivent pas tous cette regle :
// canape : facing=west regarde au nord (rotation d'un quart) ; meuble haut de cuisine : facing = mur d'accroche (oppose).
var QUART = { north: 'west', east: 'north', south: 'east', west: 'south' }, OPP = { north: 'south', south: 'north', east: 'west', west: 'east' }
function corr(b) {
  b = '' + b
  var m = b.match(/_couch\[facing=(north|east|south|west)/); if (m) b = b.replace('_couch[facing=' + m[1], '_couch[facing=' + QUART[m[1]])
  m = b.match(/kitchen_cabinet\[facing=(north|east|south|west)/); if (m) b = b.replace('kitchen_cabinet[facing=' + m[1], 'kitchen_cabinet[facing=' + OPP[m[1]])
  return b
}
function S(x, y, z, b) { if (y > CUT) return; VB.q.push('setblock ' + (OX + x) + ' ' + (OY + y) + ' ' + (OZ + z) + ' ' + corr(b)) }
function SA(x, y, z, b) { if (y > CUT) return; VB.q.push('fill ' + (OX + x) + ' ' + (OY + y) + ' ' + (OZ + z) + ' ' + (OX + x) + ' ' + (OY + y) + ' ' + (OZ + z) + ' ' + corr(b) + ' replace minecraft:air') }
function F(x1, y1, z1, x2, y2, z2, b) {
  if (y1 > CUT) return; if (y2 > CUT) y2 = CUT; b = corr(b)
  VB.q.push('fill ' + (OX + x1) + ' ' + (OY + y1) + ' ' + (OZ + z1) + ' ' + (OX + x2) + ' ' + (OY + y2) + ' ' + (OZ + z2) + ' ' + b)
}
function W(x1, z1, x2, z2, y1, y2, b) { F(x1, y1, z1, x2, y2, z1, b); F(x1, y1, z2, x2, y2, z2, b); F(x1, y1, z1, x1, y2, z2, b); F(x2, y1, z1, x2, y2, z2, b) }
function PORTE(x, y, z, id, f, h, o) { S(x, y + 1, z, id + '[facing=' + f + ',half=upper,hinge=' + h + ',open=' + o + ']'); S(x, y, z, id + '[facing=' + f + ',half=lower,hinge=' + h + ',open=' + o + ']') }
function LIT(x, y, z, couleur, f) { var o = { north: [0, -1], south: [0, 1], east: [1, 0], west: [-1, 0] }[f]; S(x + o[0], y, z + o[1], 'minecraft:' + couleur + '_bed[facing=' + f + ',part=head]'); S(x, y, z, 'minecraft:' + couleur + '_bed[facing=' + f + ',part=foot]') }
function TOIT(f, m) { return 'mcwroofs:' + (m || 'gray') + '_roof[facing=' + f + ',half=bottom,shape=straight]' }
function MAT(id, f) { return 'mcwfurnitures:' + id + '[facing=' + f + ']' }
var AIR = 'minecraft:air', GP = 'minecraft:glass_pane'

// ================= MAISON DE VILLE =================
function maison() {
  var BR = 'minecraft:bricks', SB = 'minecraft:stone_bricks', PA = 'minecraft:polished_andesite', CA = 'minecraft:calcite', SP = 'minecraft:spruce_planks', DP = 'minecraft:dark_oak_planks'
  var LX = 'minecraft:dark_oak_log[axis=x]', LZ = 'minecraft:dark_oak_log[axis=z]', LY = 'minecraft:dark_oak_log[axis=y]'
  function VOLET(x, y, z) { S(x, y, z, 'minecraft:spruce_trapdoor[facing=south,half=bottom,open=true]') }
  function VOLETN(x, y, z) { S(x, y, z, 'minecraft:spruce_trapdoor[facing=north,half=bottom,open=true]') }
  var coins = [[1, 1], [14, 1], [1, 10], [14, 10]]
  function bande(y) { F(1, y, 1, 14, y, 1, LX); F(1, y, 10, 14, y, 10, LX); F(1, y, 2, 1, y, 9, LZ); F(14, y, 2, 14, y, 9, LZ); coins.forEach(c => S(c[0], y, c[1], LY)) }
  F(0, -1, 0, 15, -1, 15, 'minecraft:grass_block')
  // Rez-de-chaussee : soubassement en pierre, murs de brique, chainages d'angle
  F(1, 0, 1, 14, 0, 10, SB); F(2, 0, 2, 13, 0, 9, DP)
  W(1, 1, 14, 10, 1, 5, BR)
  for (var y = 0; y <= 5; y++) coins.forEach(c => S(c[0], y, c[1], y % 2 ? SB : PA))
  bande(6); F(2, 6, 2, 13, 6, 9, SP)
  // Etage a colombages
  W(1, 7, 14, 10, 7, 10, CA)
  ;[1, 5, 10, 14].forEach(x => { F(x, 7, 1, x, 10, 1, LY); F(x, 7, 10, x, 10, 10, LY) })
  ;[1, 4, 7, 10].forEach(z => { F(1, 7, z, 1, 10, z, LY); F(14, 7, z, 14, 10, z, LY) })
  // croix de Saint-Andre sous les fenetres de l'etage
  ;[[6, 9], [11, 13], [2, 4]].forEach(p => { S(p[0], 7, 10, 'minecraft:dark_oak_stairs[facing=east,half=top,shape=straight]'); S(p[1], 7, 10, 'minecraft:dark_oak_stairs[facing=west,half=top,shape=straight]') })
  bande(11)
  // Combles : murs pignons, entrait, plancher
  F(1, 12, 1, 14, 12, 1, CA); F(1, 12, 10, 14, 12, 10, CA); F(2, 12, 2, 13, 12, 9, SP)
  for (var z = 1; z <= 10; z++) { var h = 12 + Math.min(z, 11 - z) - 1; F(1, 12, z, 1, h, z, CA); F(14, 12, z, 14, h, z, CA) }
  F(1, 12, 1, 1, 12, 10, LZ); F(14, 12, 1, 14, 12, 10, LZ)
  F(1, 13, 5, 1, 16, 6, LY); F(14, 13, 4, 14, 16, 4, LY); F(14, 13, 7, 14, 16, 7, LY)
  // Toit d'ardoise a deux pans, debord d'un bloc
  for (var k = 0; k < 6; k++) { F(0, 12 + k, k, 15, 12 + k, k, TOIT('south')); F(0, 12 + k, 11 - k, 15, 12 + k, 11 - k, TOIT('north')) }
  F(14, 14, 5, 14, 15, 6, GP)
  // Cheminee : foyer au salon, conduit jusqu'au faitage, mitres en poterie
  F(2, 1, 4, 2, 5, 7, BR); F(2, 1, 5, 2, 2, 6, AIR); S(2, 1, 5, 'minecraft:campfire[lit=false,facing=east]'); S(2, 1, 6, 'minecraft:campfire[lit=false,facing=east]')
  F(2, 0, 5, 3, 0, 6, SB); F(3, 3, 4, 3, 3, 7, 'minecraft:dark_oak_slab[type=top]'); S(3, 4, 4, 'minecraft:candle[candles=3,lit=false]'); S(3, 4, 7, 'minecraft:candle[candles=2,lit=false]')
  S(3, 4, 5, 'minecraft:flower_pot'); F(2, 6, 5, 2, 18, 6, BR); S(2, 19, 5, 'minecraft:decorated_pot'); S(2, 19, 6, 'minecraft:decorated_pot')
  // --- Facade sur rue (z=10) ---
  // bow-window du salon
  F(3, 1, 10, 4, 3, 10, AIR); F(3, 1, 10, 4, 1, 10, 'minecraft:spruce_slab[type=top]'); F(3, 2, 10, 4, 2, 10, 'minecraft:red_carpet')
  F(2, 0, 11, 5, 0, 11, SB); F(2, 1, 11, 2, 3, 11, LY); F(5, 1, 11, 5, 3, 11, LY); F(3, 1, 11, 4, 1, 11, BR); F(3, 2, 11, 4, 3, 11, GP); F(2, 4, 11, 5, 4, 11, TOIT('north'))
  // porte d'entree double, imposte vitree, linteau
  PORTE(7, 1, 10, 'mcwdoors:spruce_classic_door', 'north', 'left', 'false'); PORTE(8, 1, 10, 'mcwdoors:spruce_classic_door', 'north', 'right', 'false')
  F(7, 3, 10, 8, 3, 10, GP); F(6, 4, 10, 9, 4, 10, SB); S(7, 4, 10, 'minecraft:chiseled_stone_bricks'); S(8, 4, 10, 'minecraft:chiseled_stone_bricks')
  // porche couvert
  F(6, 0, 11, 9, 0, 12, SP); F(6, 1, 12, 6, 3, 12, 'minecraft:dark_oak_fence'); F(9, 1, 12, 9, 3, 12, 'minecraft:dark_oak_fence')
  F(6, 4, 11, 9, 4, 11, SP); F(6, 4, 12, 9, 4, 12, TOIT('north')); F(6, 5, 11, 9, 5, 11, TOIT('north'))
  S(6, 3, 11, 'mcwlights:wall_lantern[facing=south]'); S(9, 3, 11, 'mcwlights:wall_lantern[facing=south]')
  S(7, 1, 11, 'supplementaries:doormat[facing=south]'); S(8, 1, 11, 'supplementaries:doormat[facing=south]')
  F(7, 0, 13, 8, 0, 13, 'minecraft:stone_brick_stairs[facing=north,half=bottom,shape=straight]')
  // fenetre de cuisine, volets et jardiniere
  F(11, 2, 10, 12, 3, 10, GP); VOLET(10, 2, 11); VOLET(10, 3, 11); VOLET(13, 2, 11); VOLET(13, 3, 11)
  S(11, 1, 11, 'supplementaries:planter'); S(12, 1, 11, 'supplementaries:planter'); S(11, 2, 11, 'minecraft:azalea'); S(12, 2, 11, 'minecraft:fern')
  // etage sur rue
  F(3, 8, 10, 3, 9, 10, GP); VOLET(2, 8, 11); VOLET(2, 9, 11); VOLET(4, 8, 11); VOLET(4, 9, 11)
  F(7, 8, 10, 8, 9, 10, 'minecraft:white_stained_glass_pane')
  F(12, 8, 10, 12, 9, 10, GP); VOLET(11, 8, 11); VOLET(11, 9, 11); VOLET(13, 8, 11); VOLET(13, 9, 11)
  S(3, 7, 11, 'supplementaries:planter'); S(3, 8, 11, 'minecraft:flowering_azalea'); S(12, 7, 11, 'supplementaries:planter'); S(12, 8, 11, 'minecraft:azalea')
  // --- Arriere (z=1) ---
  F(3, 2, 1, 4, 3, 1, GP); PORTE(10, 1, 1, 'mcwdoors:spruce_classic_door', 'south', 'left', 'false'); S(10, 0, 0, 'minecraft:stone_brick_slab[type=top]'); F(12, 2, 1, 13, 3, 1, GP)
  F(3, 8, 1, 3, 9, 1, GP); F(8, 8, 1, 8, 9, 1, GP); F(12, 8, 1, 12, 9, 1, GP)
  VOLETN(2, 8, 0); VOLETN(2, 9, 0); VOLETN(4, 8, 0); VOLETN(4, 9, 0)
  // --- Cotes ---
  F(1, 2, 8, 1, 3, 9, GP); F(1, 2, 2, 1, 3, 3, GP); F(1, 8, 8, 1, 9, 8, GP)
  F(14, 2, 4, 14, 3, 5, GP); F(14, 2, 8, 14, 3, 8, GP); F(14, 8, 5, 14, 9, 5, GP); F(14, 8, 8, 14, 9, 8, GP)
  // --- Interieur rez-de-chaussee ---
  F(6, 1, 2, 6, 5, 9, CA); F(9, 1, 2, 9, 5, 9, CA); F(6, 1, 8, 6, 3, 9, AIR); F(9, 1, 8, 9, 3, 9, AIR)
  F(6, 1, 7, 6, 5, 7, LY); F(9, 1, 7, 9, 5, 7, LY)
  for (var i = 0; i < 5; i++) { F(7, 1 + i, 7 - i, 8, 1 + i, 7 - i, 'minecraft:spruce_stairs[facing=north,half=bottom,shape=straight]'); if (i > 0) F(7, 1, 7 - i, 8, i, 7 - i, SP) }
  F(7, 6, 3, 8, 6, 5, AIR)
  F(3, 5, 3, 5, 5, 3, LX); F(10, 5, 3, 13, 5, 3, LX); F(3, 5, 6, 13, 5, 6, LX)
  S(7, 5, 9, 'minecraft:lantern[hanging=true]')
  // salon
  F(5, 1, 4, 5, 1, 7, 'mcwfurnitures:gray_couch[facing=west,shape=single]')
  F(4, 1, 5, 4, 1, 6, 'mcwfurnitures:spruce_coffee_table'); S(4, 2, 5, 'supplementaries:book_pile'); S(4, 2, 6, 'minecraft:candle[candles=1,lit=false]')
  F(3, 1, 2, 4, 2, 2, 'mcwfurnitures:spruce_bookshelf[facing=south,connection=base]')
  S(5, 1, 2, 'mcwfurnitures:spruce_end_table'); S(5, 2, 2, 'minecraft:lantern[hanging=false]')
  F(3, 1, 8, 5, 1, 9, 'minecraft:brown_carpet'); S(5, 1, 9, 'mcwfurnitures:light_gray_couch[facing=north,shape=single]')
  S(4, 5, 5, 'mcwlights:iron_chandelier')
  S(3, 1, 3, 'minecraft:potted_fern')
  // cuisine (sol en damier)
  for (var x = 10; x <= 13; x++) for (var z = 2; z <= 9; z++) S(x, 0, z, (x + z) % 2 ? 'minecraft:polished_andesite' : 'minecraft:polished_diorite')
  S(13, 1, 3, MAT('spruce_counter', 'west')); S(13, 1, 4, MAT('spruce_counter', 'west')); S(13, 1, 5, 'mcwfurnitures:spruce_kitchen_sink[facing=west,water=false]')
  S(13, 1, 6, MAT('spruce_counter', 'west')); S(13, 1, 7, MAT('spruce_drawer_counter', 'west'))
  S(11, 1, 2, MAT('spruce_counter', 'south')); S(12, 1, 2, 'farmersdelight:stove[facing=south,lit=false]'); S(13, 1, 2, MAT('spruce_counter', 'south'))
  S(12, 2, 2, 'farmersdelight:cooking_pot'); S(13, 2, 6, 'farmersdelight:cutting_board[facing=west]'); S(13, 2, 3, 'supplementaries:jar')
  S(11, 3, 2, 'mcwfurnitures:spruce_kitchen_cabinet[facing=south,hinge=left]'); S(13, 3, 2, 'mcwfurnitures:spruce_kitchen_cabinet[facing=south,hinge=right]')
  S(13, 3, 3, 'mcwfurnitures:spruce_kitchen_cabinet[facing=west,hinge=left]'); S(13, 3, 7, 'mcwfurnitures:spruce_kitchen_cabinet[facing=west,hinge=right]')
  S(12, 4, 2, 'minecraft:polished_andesite'); S(12, 3, 2, 'minecraft:iron_trapdoor[facing=south,half=top,open=false]')
  F(11, 1, 6, 11, 1, 7, 'mcwfurnitures:spruce_table'); S(10, 1, 6, MAT('spruce_chair', 'east')); S(10, 1, 7, MAT('spruce_chair', 'east')); S(12, 1, 6, MAT('spruce_chair', 'west')); S(12, 1, 7, MAT('spruce_chair', 'west'))
  S(11, 4, 6, 'mcwlights:tavern_lantern[hanging=true]')
  S(13, 1, 9, 'minecraft:barrel[facing=up,open=false]'); S(13, 1, 8, 'minecraft:chest[facing=west]'); S(10, 1, 9, 'supplementaries:sack')
  // --- Interieur etage ---
  F(6, 7, 2, 6, 11, 9, CA); F(9, 7, 2, 9, 11, 9, CA); F(7, 7, 6, 8, 11, 6, CA)
  PORTE(6, 7, 2, 'mcwdoors:spruce_classic_door', 'west', 'left', 'true'); PORTE(9, 7, 2, 'mcwdoors:spruce_classic_door', 'east', 'right', 'false')
  PORTE(9, 7, 8, 'mcwdoors:spruce_classic_door', 'east', 'left', 'false'); S(8, 12, 2, 'minecraft:spruce_trapdoor[facing=south,half=bottom,open=false]')
  S(8, 11, 4, 'minecraft:lantern[hanging=true]')
  // salle de bain
  for (var x = 7; x <= 8; x++) for (var z = 7; z <= 9; z++) S(x, 6, z, (x + z) % 2 ? 'minecraft:polished_deepslate' : 'minecraft:polished_diorite')
  S(7, 7, 9, 'minecraft:water_cauldron[level=3]'); S(8, 7, 9, 'minecraft:water_cauldron[level=3]'); S(7, 7, 7, 'minecraft:quartz_stairs[facing=north,half=bottom,shape=straight]')
  S(8, 7, 7, 'mcwfurnitures:stripped_spruce_kitchen_sink[facing=south,water=false]'); S(8, 11, 8, 'minecraft:lantern[hanging=true]')
  // chambre des parents
  LIT(3, 7, 7, 'red', 'west'); LIT(3, 7, 8, 'red', 'west')
  S(2, 7, 9, 'mcwfurnitures:spruce_end_table'); S(2, 8, 9, 'minecraft:lantern[hanging=false]')
  S(2, 7, 2, 'mcwfurnitures:spruce_wardrobe[facing=south,connection=base,hinge=left]'); S(3, 7, 2, 'mcwfurnitures:spruce_wardrobe[facing=south,connection=base,hinge=right]')
  F(4, 7, 9, 5, 7, 9, 'mcwfurnitures:spruce_desk[facing=north,connection=single]'); S(4, 7, 8, MAT('spruce_chair', 'south')); S(5, 8, 9, 'supplementaries:book_pile')
  F(3, 7, 4, 5, 7, 6, 'minecraft:white_carpet'); S(4, 7, 7, 'minecraft:chest[facing=west]'); S(4, 11, 5, 'minecraft:lantern[hanging=true]')
  // chambre d'enfants
  LIT(13, 7, 3, 'light_blue', 'north'); LIT(13, 7, 8, 'light_blue', 'south')
  S(13, 7, 5, 'mcwfurnitures:spruce_end_table'); S(13, 8, 5, 'minecraft:candle[candles=2,lit=false]'); S(13, 7, 6, 'minecraft:chest[facing=west]')
  S(12, 7, 9, 'mcwfurnitures:spruce_desk[facing=north,connection=single]'); S(12, 7, 8, MAT('spruce_chair', 'south')); S(12, 8, 9, 'supplementaries:globe')
  S(10, 7, 4, 'mcwfurnitures:spruce_wardrobe[facing=east,connection=base,hinge=left]')
  F(11, 7, 4, 12, 7, 6, 'minecraft:light_blue_carpet'); S(11, 11, 5, 'minecraft:lantern[hanging=true]')
  // grenier
  S(4, 13, 4, 'minecraft:chest[facing=south]'); S(10, 13, 7, 'minecraft:barrel[facing=up,open=false]'); S(5, 13, 6, 'supplementaries:sack'); S(9, 13, 4, 'supplementaries:sack')
  S(11, 13, 5, MAT('spruce_chair', 'west')); S(7, 13, 6, 'mcwfurnitures:white_couch[facing=north,shape=single]')
  // --- Jardin et clotures ---
  F(0, 0, 15, 15, 0, 15, 'mcwfences:spruce_picket_fence'); F(0, 0, 11, 0, 0, 14, 'mcwfences:spruce_picket_fence'); F(15, 0, 11, 15, 0, 14, 'mcwfences:spruce_picket_fence')
  S(7, 0, 15, 'minecraft:spruce_fence_gate[facing=south,open=true]'); S(8, 0, 15, 'minecraft:spruce_fence_gate[facing=south,open=false]'); S(6, 1, 11, 'minecraft:dark_oak_fence'); S(9, 1, 11, 'minecraft:dark_oak_fence')
  F(7, -1, 14, 8, -1, 15, 'minecraft:dirt_path'); F(15, -1, 1, 15, -1, 10, 'minecraft:coarse_dirt'); F(0, -1, 1, 0, -1, 10, 'minecraft:coarse_dirt')
  S(6, 0, 14, 'minecraft:dark_oak_fence'); S(6, 1, 14, 'minecraft:dark_oak_fence'); S(6, 2, 14, 'minecraft:lantern[hanging=false]')
  // arbre adulte et massifs
  F(12, 0, 13, 12, 5, 13, LY); S(13, 3, 13, 'minecraft:dark_oak_fence'); S(11, 4, 13, 'minecraft:dark_oak_fence')
  for (var x = 10; x <= 14; x++) for (var z = 11; z <= 15; z++) for (var y = 4; y <= 7; y++) { var d = Math.abs(x - 12) + Math.abs(z - 13) + Math.abs(y - 5.5); if (d < 3.2 && R() < 0.85) SA(x, y, z, 'minecraft:dark_oak_leaves[persistent=true]') }
  ;[[1, 13], [2, 13], [1, 14], [3, 14], [1, 12]].forEach(c => S(c[0], 0, c[1], 'minecraft:azalea_leaves[persistent=true]')); S(1, 1, 13, 'minecraft:flowering_azalea_leaves[persistent=true]')
  var herbes = ['minecraft:short_grass', 'minecraft:short_grass', 'minecraft:fern', 'minecraft:dead_bush', 'minecraft:sweet_berry_bush[age=2]', 'minecraft:short_grass', 'minecraft:poppy']
  for (var x = 1; x <= 14; x++) for (var z = 11; z <= 14; z++) if (R() < 0.45) SA(x, 0, z, herbes[Math.floor(R() * herbes.length)])
  for (var x = 1; x <= 14; x++) if (R() < 0.5) SA(x, 0, 0, herbes[Math.floor(R() * herbes.length)])
  S(14, 0, 14, 'supplementaries:sack'); S(13, 0, 11, 'minecraft:barrel[facing=north,open=false]')
  // lierre
  ;[2, 3, 9].forEach(z => { var b = 3 + Math.floor(R() * 3); F(0, b, z, 0, 11, z, 'minecraft:vine[east=true]') })
  ;[4, 11, 12].forEach(x => { var b = 2 + Math.floor(R() * 4); F(x, b, 0, x, 11, 0, 'minecraft:vine[south=true]') })
}

// ================= IMMEUBLE HAUSSMANNIEN AVEC PHARMACIE =================
function immeuble() {
  var ST = 'minecraft:smooth_sandstone', CS = 'minecraft:cut_sandstone', CH = 'minecraft:chiseled_sandstone', GT = 'minecraft:green_terracotta', WT = 'minecraft:white_terracotta'
  function SST(f, h) { return 'minecraft:smooth_sandstone_stairs[facing=' + f + ',half=' + h + ',shape=straight]' }
  var SLt = 'minecraft:smooth_sandstone_slab[type=top]', RAIL = 'mcwfences:ornate_metal_fence', DS = 'minecraft:dark_oak_stairs', ARD = 'mcwroofs:gray_roof_block'
  F(0, -1, 0, 15, -1, 15, 'minecraft:grass_block'); F(0, -1, 14, 15, -1, 15, 'minecraft:smooth_stone')
  F(1, 0, 1, 14, 0, 13, 'minecraft:polished_andesite')
  W(1, 1, 14, 13, 1, 17, ST)
  ;[6, 12, 18].forEach(y => F(2, y, 2, 13, y, 12, 'minecraft:spruce_planks'))
  ;[6, 12].forEach(y => { F(1, y, 13, 14, y, 13, CS); F(1, y, 1, 14, y, 1, CS) })
  for (var y = 1; y <= 17; y++) { var b = y % 2 ? CS : ST; S(1, y, 13, b); S(14, y, 13, b); S(1, y, 1, b); S(14, y, 1, b) }
  // --- Rez-de-chaussee sur rue : devanture de pharmacie ---
  F(11, 1, 13, 11, 5, 13, CS); F(13, 1, 13, 13, 5, 13, CS)
  F(2, 1, 13, 10, 1, 13, GT); F(2, 2, 13, 10, 3, 13, GP); F(2, 4, 13, 10, 5, 13, GT)
  S(4, 2, 13, 'minecraft:dark_oak_fence'); S(4, 3, 13, 'minecraft:dark_oak_fence'); S(9, 2, 13, 'minecraft:dark_oak_fence'); S(9, 3, 13, 'minecraft:dark_oak_fence')
  F(6, 1, 13, 7, 1, 13, AIR); PORTE(6, 1, 13, 'mcwdoors:dark_oak_glass_door', 'north', 'left', 'false'); PORTE(7, 1, 13, 'mcwdoors:dark_oak_glass_door', 'north', 'right', 'false')
  PORTE(12, 1, 13, 'mcwdoors:spruce_classic_door', 'north', 'left', 'false'); S(12, 3, 13, GP); S(12, 4, 13, CH); S(12, 5, 13, CS)
  S(13, 2, 13, 'minecraft:iron_bars'); S(13, 3, 13, 'minecraft:iron_bars')
  F(2, 4, 14, 10, 4, 14, 'supplementaries:awning_green[facing=south,slanted=true,bottom=true]')
  ;[[13, 4, 14], [13, 4, 15], [13, 4, 16], [13, 3, 15], [13, 5, 15]].forEach(c => S(c[0], c[1], c[2], 'minecraft:lime_stained_glass'))
  // balcon filant de l'etage noble, consoles
  F(1, 6, 14, 14, 6, 14, SLt); F(1, 7, 14, 14, 7, 14, RAIL); ;[1, 11, 14].forEach(x => S(x, 5, 14, SST('north', 'top')))
  // --- Etages sur rue : portes-fenetres, linteaux a clef, garde-corps ---
  ;[3, 6, 9, 12].forEach(x => {
    PORTE(x, 7, 13, 'mcwdoors:spruce_glass_door', 'north', 'left', 'false'); S(x, 9, 13, GP); S(x, 10, 13, CH); S(x - 1, 10, 13, CS); S(x + 1, 10, 13, CS)
    S(x, 13, 13, RAIL); F(x, 14, 13, x, 15, 13, GP); S(x, 16, 13, CH); S(x - 1, 16, 13, CS); S(x + 1, 16, 13, CS); S(x, 12, 14, SLt)
  })
  F(1, 17, 14, 14, 17, 14, SST('north', 'top')); F(2, 11, 14, 13, 11, 14, 'minecraft:smooth_sandstone_slab[type=top]')
  // --- Arriere ---
  ;[3, 6, 9, 12].forEach(x => { F(x, 8, 1, x, 9, 1, GP); S(x, 10, 1, CS); F(x, 14, 1, x, 15, 1, GP); S(x, 16, 1, CS) })
  PORTE(4, 1, 1, 'mcwdoors:dark_oak_classic_door', 'south', 'left', 'false'); F(8, 2, 1, 8, 3, 1, 'minecraft:iron_bars'); F(12, 2, 1, 12, 3, 1, GP)
  // --- Toit mansarde en ardoise, lucarnes a fronton, souches de cheminee ---
  F(1, 18, 14, 14, 18, 14, TOIT('north')); F(1, 19, 13, 14, 20, 13, ARD); F(1, 21, 13, 14, 21, 13, TOIT('north'))
  F(1, 18, 0, 14, 18, 0, TOIT('south')); F(1, 19, 1, 14, 20, 1, ARD); F(1, 21, 1, 14, 21, 1, TOIT('south'))
  F(2, 18, 2, 13, 18, 12, 'minecraft:spruce_planks'); F(1, 18, 1, 1, 21, 13, ST); F(14, 18, 1, 14, 21, 13, ST)
  F(1, 22, 1, 14, 22, 13, 'mcwroofs:gray_roof_slab[type=bottom]'); F(7, 22, 6, 8, 22, 7, 'minecraft:glass')
  F(1, 22, 4, 1, 23, 10, 'minecraft:bricks'); F(14, 22, 4, 14, 23, 10, 'minecraft:bricks')
  ;[5, 7, 9].forEach(z => { S(1, 24, z, 'minecraft:decorated_pot'); S(14, 24, z, 'minecraft:decorated_pot') })
  ;[3, 6, 9, 12].forEach(x => {
    F(x - 1, 18, 14, x + 1, 18, 14, CS); F(x - 1, 19, 14, x - 1, 20, 14, ARD); F(x + 1, 19, 14, x + 1, 20, 14, ARD); F(x, 19, 14, x, 20, 14, GP); F(x, 19, 13, x, 20, 13, AIR)
    S(x - 1, 21, 14, TOIT('east')); S(x + 1, 21, 14, TOIT('west')); S(x, 21, 14, ARD); S(x, 18, 15, 'minecraft:smooth_sandstone_slab[type=top]')
  })
  ;[4, 11].forEach(x => F(x, 19, 1, x, 20, 1, GP))
  S(7, 23, 10, 'minecraft:lightning_rod'); S(7, 24, 10, 'minecraft:lightning_rod')
  // --- Cage d'escalier (x12-13, z8-12) ---
  F(11, 1, 7, 11, 21, 12, ST); F(12, 1, 7, 13, 21, 7, ST)
  for (var f = 0; f < 3; f++) {
    var yb = 6 * f
    S(13, yb + 1, 11, DS + '[facing=north,half=bottom,shape=straight]'); S(13, yb + 2, 10, DS + '[facing=north,half=bottom,shape=straight]'); S(13, yb + 3, 9, DS + '[facing=north,half=bottom,shape=straight]')
    F(12, yb + 3, 8, 13, yb + 3, 8, 'minecraft:dark_oak_planks')
    S(12, yb + 4, 9, DS + '[facing=south,half=bottom,shape=straight]'); S(12, yb + 5, 10, DS + '[facing=south,half=bottom,shape=straight]'); F(12, yb + 6, 8, 13, yb + 6, 10, AIR); S(12, yb + 6, 11, DS + '[facing=south,half=bottom,shape=straight]')
    S(13, yb + 5, 12, 'minecraft:lantern[hanging=true]')
    if (f > 0) PORTE(11, yb + 1, 12, 'mcwdoors:spruce_classic_door', 'west', 'left', 'false')
  }
  PORTE(11, 19, 12, 'mcwdoors:spruce_classic_door', 'west', 'left', 'false')
  for (var x = 12; x <= 13; x++) for (var z = 8; z <= 12; z++) if (z == 12 || z == 8) S(x, 0, z, (x + z) % 2 ? 'minecraft:red_terracotta' : 'minecraft:white_terracotta')
  S(13, 2, 12, 'supplementaries:notice_board[facing=north,has_book=false]')
  // --- Pharmacie ---
  for (var x = 2; x <= 10; x++) for (var z = 2; z <= 12; z++) S(x, 0, z, (x + z) % 2 ? 'minecraft:smooth_quartz' : 'minecraft:polished_deepslate')
  F(11, 1, 2, 11, 5, 6, ST); PORTE(11, 1, 4, 'mcwdoors:spruce_classic_door', 'east', 'left', 'false')
  for (var x = 3; x <= 8; x++) S(x, 1, 5, MAT(x == 5 ? 'stripped_spruce_drawer_counter' : 'stripped_spruce_counter', 'south'))
  S(4, 2, 5, 'minecraft:brewing_stand'); S(7, 2, 5, 'supplementaries:jar'); S(6, 2, 5, 'supplementaries:book_pile'); S(8, 2, 5, 'minecraft:lectern[facing=south]')
  F(2, 1, 2, 10, 1, 2, 'mcwfurnitures:spruce_double_drawer[facing=south,connection=single]')
  for (var x = 2; x <= 10; x += 2) S(x, 2, 2, 'supplementaries:jar')
  F(2, 3, 2, 10, 3, 2, 'mcwfurnitures:spruce_glass_kitchen_cabinet[facing=south]')
  F(2, 1, 6, 2, 2, 11, 'mcwfurnitures:spruce_bookshelf[facing=east,connection=base]')
  F(5, 1, 8, 8, 1, 8, 'mcwfurnitures:spruce_bookshelf[facing=north,connection=base]'); F(5, 1, 9, 8, 1, 9, 'mcwfurnitures:spruce_bookshelf[facing=south,connection=base]')
  S(9, 1, 10, 'minecraft:barrel[facing=east,open=false]'); S(4, 1, 11, 'supplementaries:book_pile'); S(3, 1, 9, 'minecraft:white_carpet'); S(9, 1, 7, 'minecraft:white_carpet'); S(6, 1, 11, 'minecraft:white_carpet')
  ;[[4, 7], [8, 7], [6, 3], [6, 11]].forEach(c => S(c[0], 5, c[1], 'mcwlights:tavern_lantern[hanging=true]'))
  F(13, 1, 2, 13, 2, 3, 'minecraft:barrel[facing=up,open=false]'); S(12, 1, 2, 'minecraft:chest[facing=south]'); S(13, 1, 5, 'supplementaries:sack'); S(12, 1, 6, 'supplementaries:sack')
  // --- Appartement du 1er (bourgeois) ---
  F(2, 7, 7, 10, 11, 7, WT); F(6, 7, 2, 6, 11, 6, WT); F(11, 7, 2, 11, 11, 6, WT)
  PORTE(4, 7, 7, 'mcwdoors:spruce_classic_door', 'south', 'left', 'true'); PORTE(8, 7, 7, 'mcwdoors:spruce_classic_door', 'south', 'left', 'false'); PORTE(11, 7, 5, 'mcwdoors:spruce_classic_door', 'east', 'left', 'false')
  for (var x = 2; x <= 10; x++) for (var z = 8; z <= 12; z++) S(x, 6, z, (x + z) % 4 < 2 ? 'minecraft:oak_planks' : 'minecraft:spruce_planks')
  S(2, 7, 9, 'minecraft:quartz_pillar'); S(2, 7, 11, 'minecraft:quartz_pillar'); S(2, 7, 10, 'minecraft:campfire[lit=false,facing=east]'); F(2, 8, 9, 2, 8, 11, 'minecraft:quartz_slab[type=top]')
  S(2, 9, 9, 'minecraft:candle[candles=3,lit=false]'); S(2, 9, 11, 'minecraft:candle[candles=3,lit=false]'); F(2, 9, 10, 2, 10, 10, 'minecraft:glass_pane')
  F(3, 7, 9, 4, 7, 11, 'minecraft:red_carpet'); F(5, 7, 9, 5, 7, 11, 'mcwfurnitures:white_couch[facing=west,shape=single]'); S(4, 7, 10, 'mcwfurnitures:spruce_coffee_table')
  S(2, 7, 8, 'mcwfurnitures:light_gray_couch[facing=east,shape=single]'); S(2, 7, 12, 'mcwfurnitures:light_gray_couch[facing=east,shape=single]')
  F(6, 7, 8, 7, 8, 8, 'mcwfurnitures:spruce_bookshelf[facing=south,connection=base]')
  F(8, 7, 10, 9, 7, 11, 'mcwfurnitures:spruce_table'); S(8, 7, 9, MAT('spruce_chair', 'south')); S(9, 7, 9, MAT('spruce_chair', 'south')); S(10, 7, 10, MAT('spruce_chair', 'west')); S(10, 7, 11, MAT('spruce_chair', 'west'))
  S(10, 7, 12, 'minecraft:decorated_pot'); S(10, 7, 8, 'minecraft:potted_fern'); S(4, 11, 10, 'mcwlights:iron_chandelier'); S(8, 11, 10, 'mcwlights:iron_chandelier')
  for (var x = 2; x <= 5; x++) for (var z = 2; z <= 6; z++) S(x, 6, z, (x + z) % 2 ? 'minecraft:polished_andesite' : 'minecraft:polished_diorite')
  S(2, 7, 2, MAT('spruce_counter', 'south')); S(3, 7, 2, 'mcwfurnitures:spruce_kitchen_sink[facing=south,water=false]'); S(4, 7, 2, 'farmersdelight:stove[facing=south,lit=false]'); S(5, 7, 2, MAT('spruce_counter', 'south'))
  S(2, 7, 3, MAT('spruce_counter', 'east')); S(2, 7, 4, MAT('spruce_drawer_counter', 'east')); S(4, 8, 2, 'farmersdelight:cooking_pot')
  S(2, 9, 2, 'mcwfurnitures:spruce_kitchen_cabinet[facing=south,hinge=left]'); S(5, 9, 2, 'mcwfurnitures:spruce_kitchen_cabinet[facing=south,hinge=right]'); S(2, 9, 3, 'mcwfurnitures:spruce_kitchen_cabinet[facing=east,hinge=left]')
  S(4, 7, 5, 'mcwfurnitures:spruce_table'); S(3, 7, 5, MAT('spruce_chair', 'east')); S(5, 7, 5, MAT('spruce_chair', 'west')); S(4, 11, 4, 'minecraft:lantern[hanging=true]')
  LIT(9, 7, 3, 'white', 'north'); LIT(10, 7, 3, 'white', 'north'); S(8, 7, 2, 'mcwfurnitures:spruce_end_table'); S(8, 8, 2, 'minecraft:lantern[hanging=false]')
  S(7, 7, 6, 'mcwfurnitures:spruce_wardrobe[facing=east,connection=base,hinge=left]'); S(10, 7, 6, 'mcwfurnitures:spruce_double_drawer[facing=west,connection=single]')
  F(8, 7, 4, 9, 7, 5, 'minecraft:light_gray_carpet'); S(9, 11, 4, 'minecraft:lantern[hanging=true]')
  for (var x = 12; x <= 13; x++) for (var z = 2; z <= 6; z++) S(x, 6, z, (x + z) % 2 ? 'minecraft:polished_deepslate' : 'minecraft:smooth_quartz')
  S(12, 7, 2, 'minecraft:water_cauldron[level=3]'); S(13, 7, 2, 'minecraft:water_cauldron[level=3]'); S(13, 7, 5, 'minecraft:quartz_stairs[facing=east,half=bottom,shape=straight]')
  S(13, 7, 4, 'mcwfurnitures:stripped_spruce_kitchen_sink[facing=west,water=false]'); S(12, 11, 4, 'minecraft:lantern[hanging=true]')
  // --- Appartement du 2e (squat de survivants) ---
  F(2, 13, 7, 10, 17, 7, WT); F(3, 13, 7, 5, 15, 7, AIR); F(6, 13, 2, 6, 17, 6, WT); F(11, 13, 2, 11, 17, 6, WT); PORTE(11, 13, 5, 'mcwdoors:spruce_classic_door', 'east', 'left', 'true')
  S(3, 14, 13, 'minecraft:spruce_planks'); S(3, 15, 13, 'minecraft:spruce_trapdoor[facing=north,half=bottom,open=true]'); S(9, 14, 13, 'minecraft:spruce_planks')
  LIT(3, 13, 9, 'gray', 'west'); LIT(3, 13, 11, 'brown', 'west'); S(2, 13, 10, 'minecraft:candle[candles=2,lit=false]')
  F(9, 13, 8, 10, 14, 8, 'minecraft:barrel[facing=up,open=false]'); S(10, 13, 9, 'minecraft:chest[facing=west]'); S(6, 13, 10, 'minecraft:crafting_table'); S(7, 13, 10, 'minecraft:cartography_table')
  S(5, 13, 12, 'minecraft:water_cauldron[level=2]'); S(3, 13, 12, 'supplementaries:sack'); S(4, 13, 12, 'supplementaries:sack'); S(9, 13, 12, 'supplementaries:sack')
  S(8, 13, 11, 'minecraft:candle[candles=4,lit=false]'); S(4, 13, 8, 'minecraft:gravel'); S(5, 13, 8, 'minecraft:cobblestone_slab[type=bottom]'); S(3, 13, 8, 'minecraft:white_concrete_powder')
  S(2, 14, 12, 'supplementaries:notice_board[facing=east,has_book=false]'); S(7, 14, 10, 'supplementaries:globe_sepia')
  S(2, 13, 2, MAT('spruce_counter', 'south')); S(4, 13, 2, MAT('spruce_counter', 'south')); S(5, 13, 2, 'minecraft:barrel[facing=north,open=true]')
  LIT(9, 13, 3, 'white', 'north'); S(12, 13, 2, 'minecraft:cauldron'); S(13, 13, 6, 'supplementaries:sack'); S(6, 17, 10, 'minecraft:lantern[hanging=true]')
  // --- Mansarde (atelier d'artiste) ---
  LIT(2, 19, 3, 'cyan', 'north'); S(3, 19, 2, 'mcwfurnitures:spruce_end_table'); S(3, 20, 2, 'minecraft:candle[candles=1,lit=false]')
  S(5, 19, 2, 'mcwfurnitures:spruce_wardrobe[facing=south,connection=base,hinge=left]')
  F(2, 19, 6, 2, 20, 8, 'mcwfurnitures:spruce_bookshelf[facing=east,connection=base]'); S(4, 19, 9, 'mcwfurnitures:light_gray_couch[facing=north,shape=single]')
  F(4, 19, 5, 6, 19, 7, 'minecraft:brown_carpet'); S(9, 19, 12, 'mcwfurnitures:spruce_desk[facing=north,connection=single]'); S(9, 19, 11, MAT('spruce_chair', 'south')); S(9, 20, 12, 'supplementaries:book_pile')
  S(6, 19, 12, 'minecraft:loom[facing=south]'); S(3, 19, 12, 'minecraft:potted_fern'); S(12, 19, 2, 'minecraft:chest[facing=south]'); F(13, 19, 2, 13, 19, 3, 'minecraft:barrel[facing=up,open=false]')
  S(5, 21, 7, 'minecraft:lantern[hanging=true]'); S(10, 21, 5, 'minecraft:lantern[hanging=true]')
  // --- Trottoir, arbre d'alignement, lierre sur le mur mitoyen ---
  S(2, -1, 15, 'minecraft:podzol'); F(2, 0, 15, 2, 5, 15, 'minecraft:dark_oak_log[axis=y]')
  for (var x = 0; x <= 4; x++) for (var z = 14; z <= 17; z++) for (var y = 5; y <= 8; y++) { var d = Math.abs(x - 2) + Math.abs(z - 15.5) + Math.abs(y - 6.5); if (d < 3 && R() < 0.85) SA(x, y, z, 'minecraft:dark_oak_leaves[persistent=true]') }
  S(14, 0, 14, 'supplementaries:sack'); S(15, 0, 14, 'minecraft:barrel[facing=up,open=false]'); S(9, 0, 15, 'mcwlights:classic_street_lamp[part=base,lit=true]')
  ;[4, 5, 8, 9, 10].forEach(z => { var b = 4 + Math.floor(R() * 6); F(15, b, z, 15, 17, z, 'minecraft:vine[west=true]') })
}


// ================= BARRE HLM (beton) =================
function hlm() {
  var LG = 'minecraft:light_gray_concrete', WC = 'minecraft:white_concrete', GC = 'minecraft:gray_concrete', VP = 'minecraft:gray_stained_glass_pane', RL = 'mcwfences:panelled_metal_fence'
  F(0, -1, 0, 15, -1, 15, 'minecraft:grass_block'); F(0, -1, 13, 15, -1, 15, 'minecraft:smooth_stone'); F(0, -1, 0, 15, -1, 2, 'minecraft:gray_concrete_powder')
  F(1, 0, 3, 14, 0, 12, GC)
  W(1, 3, 14, 12, 1, 24, WC)
  for (var f = 1; f <= 4; f++) { var y = 6 * f; F(2, y, 4, 13, y, 11, 'minecraft:smooth_stone'); F(1, y, 3, 14, y, 3, GC); F(1, y, 12, 14, y, 12, GC); F(1, y, 3, 1, y, 12, GC); F(14, y, 3, 14, y, 12, GC) }
  ;[1, 14].forEach(x => { F(x, 1, 3, x, 24, 3, LG); F(x, 1, 12, x, 24, 12, LG) })
  // rez-de-chaussee : tabac-presse a gauche, hall vitre a droite
  F(2, 1, 12, 7, 4, 12, AIR); F(2, 1, 12, 7, 1, 12, 'minecraft:black_concrete'); F(2, 2, 12, 7, 3, 12, VP); F(2, 4, 12, 7, 4, 12, 'minecraft:iron_trapdoor[facing=south,half=top,open=false]')
  F(2, 5, 13, 7, 5, 13, 'minecraft:red_concrete'); S(8, 1, 12, LG); F(9, 1, 12, 12, 4, 12, 'minecraft:light_gray_stained_glass_pane'); PORTE(10, 1, 12, 'mcwdoors:metal_door', 'north', 'left', 'false'); PORTE(11, 1, 12, 'mcwdoors:metal_door', 'north', 'right', 'false')
  F(9, 5, 13, 12, 5, 13, 'mcwroofs:light_gray_concrete_roof[facing=north,half=bottom,shape=straight]')
  // tags et graffitis
  ;[[2, 1, 3], [3, 1, 3], [3, 2, 3], [12, 1, 3], [13, 2, 3], [1, 1, 12], [14, 2, 12], [8, 2, 12]].forEach((g, i) => S(g[0], g[1], g[2], 'minecraft:' + ['magenta', 'lime', 'black', 'orange', 'cyan'][i % 5] + '_concrete'))
  // etages : loggias en retrait, panneaux colores, fenetres en bande, cage d'escalier vitree
  var coul = ['cyan_terracotta', 'orange_terracotta', 'yellow_terracotta', 'cyan_terracotta']
  for (var f = 1; f <= 3; f++) {
    var yb = 6 * f
    ;[[2, 5], [8, 11]].forEach((l, i) => {
      F(l[0], yb + 1, 12, l[1], yb + 5, 12, AIR); F(l[0], yb + 1, 11, l[1], yb + 4, 11, WC); F(l[0] + 1, yb + 1, 11, l[0] + 2, yb + 3, 11, VP)
      PORTE(l[1], yb + 1, 11, 'mcwdoors:metal_door', 'south', 'left', 'false')
      F(l[0], yb + 1, 12, l[1], yb + 1, 12, RL); S(l[0], yb + 1, 12, 'minecraft:' + coul[(f + i) % 4]); S(l[0], yb + 2, 12, 'minecraft:' + coul[(f + i) % 4])
      if (R() < 0.6) S(l[0] + 1 + Math.floor(R() * 2), yb + 1, 11 + 1, 'minecraft:' + ['red', 'blue', 'white', 'yellow'][Math.floor(R() * 4)] + '_wall_banner[facing=south]')
      if (R() < 0.5) S(l[1] - 1, yb + 2, 11, 'minecraft:potted_fern')
    })
    F(6, yb + 2, 12, 7, yb + 3, 12, VP)
    F(12, yb + 1, 12, 13, yb + 5, 12, 'minecraft:light_gray_stained_glass'); S(13, yb + 3, 13, 'minecraft:iron_trapdoor[facing=south,half=bottom,open=true]')
    // arriere : fenetres et climatiseurs
    ;[3, 6, 9].forEach(x => F(x, yb + 2, 3, x + 1, yb + 3, 3, VP)); if (f != 2) { S(5, yb + 2, 2, 'minecraft:smooth_stone'); S(5, yb + 3, 2, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false]') }
    S(13, yb + 4, 2, 'minecraft:lightning_rod[facing=north]')
  }
  // toit terrasse : acrotere, local technique, antennes
  F(1, 25, 3, 14, 25, 12, 'minecraft:smooth_stone_slab[type=bottom]'); W(1, 3, 14, 12, 25, 25, 'minecraft:light_gray_concrete')
  F(10, 26, 5, 13, 28, 9, LG); PORTE(10, 26, 7, 'mcwdoors:metal_door', 'west', 'left', 'false'); F(10, 29, 5, 13, 29, 9, 'minecraft:smooth_stone_slab[type=bottom]')
  F(3, 26, 6, 3, 29, 6, 'minecraft:iron_bars'); S(3, 30, 6, 'minecraft:lightning_rod'); S(5, 26, 9, 'minecraft:iron_block'); S(5, 27, 9, 'minecraft:daylight_detector')
  F(6, 26, 4, 7, 26, 4, 'minecraft:iron_trapdoor[facing=south,half=bottom,open=false]'); S(12, 30, 7, 'minecraft:lightning_rod')
  // interieurs : tabac au rez-de-chaussee, appartement au 1er
  F(2, 1, 4, 7, 5, 4, WC); F(8, 1, 4, 8, 5, 11, WC); F(2, 0, 5, 7, 0, 11, 'minecraft:light_gray_terracotta')
  F(3, 1, 8, 6, 1, 8, MAT('stripped_spruce_counter', 'south')); S(5, 2, 8, 'supplementaries:jar'); S(3, 2, 8, 'supplementaries:book_pile')
  F(2, 1, 5, 7, 2, 5, 'mcwfurnitures:spruce_bookshelf[facing=south,connection=base]'); S(2, 1, 10, 'minecraft:barrel[facing=up,open=false]'); S(7, 1, 10, 'supplementaries:book_pile')
  S(5, 5, 7, 'mcwlights:tavern_lantern[hanging=true]'); F(9, 0, 4, 13, 0, 11, 'minecraft:polished_andesite')
  F(9, 2, 4, 11, 2, 4, 'minecraft:spruce_trapdoor[facing=south,half=bottom,open=true]'); S(12, 1, 5, 'minecraft:dark_oak_stairs[facing=north,half=bottom,shape=straight]')
  F(2, 7, 7, 13, 11, 7, WC); PORTE(5, 7, 7, 'mcwdoors:spruce_classic_door', 'south', 'left', 'true'); PORTE(10, 7, 7, 'mcwdoors:spruce_classic_door', 'south', 'left', 'false')
  F(2, 7, 8, 7, 7, 10, 'minecraft:light_gray_carpet'); F(3, 7, 9, 3, 7, 10, 'mcwfurnitures:brown_couch[facing=east,shape=single]'); S(5, 7, 9, 'mcwfurnitures:spruce_drawer[facing=west]')
  S(5, 8, 9, 'minecraft:black_concrete'); S(4, 7, 10, 'mcwfurnitures:spruce_coffee_table'); S(7, 7, 10, 'minecraft:potted_bamboo')
  F(9, 7, 8, 13, 7, 8, MAT('spruce_counter', 'south')); S(11, 7, 8, 'mcwfurnitures:spruce_kitchen_sink[facing=south,water=false]'); S(10, 7, 9, 'mcwfurnitures:spruce_table'); S(10, 7, 10, MAT('spruce_chair', 'north'))
  LIT(3, 7, 5, 'blue', 'west'); LIT(3, 8, 5, 'blue', 'west'); S(2, 9, 4, 'minecraft:air'); S(6, 7, 4, 'mcwfurnitures:spruce_wardrobe[facing=south,connection=base,hinge=left]'); S(12, 7, 5, 'minecraft:chest[facing=west]')
  // pied d'immeuble : arceaux, conteneurs, voiture brulee
  F(0, 0, 14, 3, 0, 14, 'minecraft:iron_bars'); S(13, 0, 14, 'minecraft:green_shulker_box'); S(14, 0, 14, 'minecraft:gray_shulker_box'); S(12, 0, 14, 'supplementaries:sack')
  F(4, 0, 0, 8, 0, 1, 'minecraft:black_concrete'); F(5, 1, 0, 7, 1, 1, 'minecraft:coal_block'); S(4, 1, 0, 'minecraft:tinted_glass'); S(8, 0, 1, 'minecraft:air')
}

// ================= CHALET FORESTIER (bois) =================
function chalet() {
  var SL = 'minecraft:spruce_log', SPL = 'minecraft:spruce_planks', CB = 'minecraft:cobblestone', MC = 'minecraft:mossy_cobblestone'
  F(0, -1, 0, 15, -1, 15, 'minecraft:grass_block'); F(2, 0, 2, 13, 0, 11, CB); F(3, 0, 3, 12, 0, 10, SPL)
  // murs en rondins, angles a encoches
  for (var y = 1; y <= 9; y++) {
    F(2, y, 2, 13, y, 2, SL + '[axis=x]'); F(2, y, 11, 13, y, 11, SL + '[axis=x]'); F(2, y, 3, 2, y, 10, SL + '[axis=z]'); F(13, y, 3, 13, y, 10, SL + '[axis=z]')
    if (y % 2) { S(1, y, 2, SL + '[axis=x]'); S(14, y, 2, SL + '[axis=x]'); S(1, y, 11, SL + '[axis=x]'); S(14, y, 11, SL + '[axis=x]') }
    else { S(2, y, 1, SL + '[axis=z]'); S(13, y, 1, SL + '[axis=z]'); S(2, y, 12, SL + '[axis=z]'); S(13, y, 12, SL + '[axis=z]') }
  }
  for (var x = 3; x <= 12; x++) { var top = 9 + (x <= 7 ? x - 1 : 14 - x) - 1; F(x, 10, 2, x, top, 2, SPL); F(x, 10, 11, x, top, 11, SPL) }
  F(3, 6, 3, 12, 6, 7, SPL); F(3, 7, 8, 12, 7, 8, 'minecraft:spruce_fence')
  // toit en bardeaux, fort debord
  for (var k = 0; k <= 6; k++) { F(1 + k, 9 + k, 0, 1 + k, 9 + k, 13, TOIT('east', 'spruce')); F(14 - k, 9 + k, 0, 14 - k, 9 + k, 13, TOIT('west', 'spruce')) }
  // pignon sur rue : grande baie triangulaire
  F(6, 2, 11, 9, 4, 11, GP); F(5, 7, 11, 10, 10, 11, GP); F(6, 11, 11, 9, 12, 11, GP); S(7, 13, 11, GP); S(8, 13, 11, GP)
  F(5, 7, 11, 5, 10, 11, SL + '[axis=y]'); F(10, 7, 11, 10, 10, 11, SL + '[axis=y]')
  PORTE(4, 1, 11, 'mcwdoors:spruce_classic_door', 'north', 'left', 'false')
  ;[[2, 5], [2, 8], [13, 5], [13, 8]].forEach(c => F(c[0], 2, c[1], c[0], 3, c[1], GP))
  F(3, 3, 2, 3, 3, 2, GP); F(10, 2, 2, 11, 3, 2, GP)
  // veranda couverte
  F(1, 0, 12, 14, 0, 14, SPL); ;[1, 5, 10, 14].forEach(x => F(x, 1, 14, x, 3, 14, 'minecraft:stripped_spruce_log[axis=y]'))
  F(2, 1, 14, 4, 1, 14, 'minecraft:spruce_fence'); F(11, 1, 14, 13, 1, 14, 'minecraft:spruce_fence'); F(1, 1, 12, 1, 1, 13, 'minecraft:spruce_fence'); F(14, 1, 12, 14, 1, 13, 'minecraft:spruce_fence')
  F(0, 4, 14, 15, 4, 14, TOIT('north', 'spruce')); F(0, 5, 13, 15, 5, 13, TOIT('north', 'spruce')); F(0, 6, 12, 15, 6, 12, TOIT('north', 'spruce'))
  F(6, 0, 15, 9, 0, 15, 'minecraft:spruce_stairs[facing=north,half=bottom,shape=straight]')
  S(3, 1, 13, MAT('spruce_chair', 'south')); S(11, 1, 13, 'minecraft:barrel[facing=up,open=false]'); S(12, 1, 13, 'mcwfurnitures:spruce_stool_chair'); S(2, 3, 12, 'mcwlights:wall_lantern[facing=south]'); S(13, 3, 12, 'mcwlights:wall_lantern[facing=south]')
  // cheminee de pierre exterieure
  F(0, 0, 5, 1, 1, 7, CB); F(1, 2, 5, 1, 17, 7, CB); F(1, 2, 6, 1, 17, 6, MC); F(0, 2, 5, 0, 4, 7, MC); F(1, 18, 6, 1, 18, 6, 'minecraft:campfire[lit=false,facing=east]')
  // appentis et bucher
  F(14, 0, 4, 15, 0, 9, 'minecraft:coarse_dirt'); F(15, 1, 4, 15, 3, 4, 'minecraft:spruce_fence'); F(15, 1, 9, 15, 3, 9, 'minecraft:spruce_fence')
  F(14, 4, 4, 14, 4, 9, TOIT('west', 'spruce')); F(15, 3, 3, 15, 3, 10, 'minecraft:spruce_slab[type=top]')
  F(14, 1, 5, 15, 2, 8, SL + '[axis=x]'); S(15, 3, 6, 'minecraft:spruce_slab[type=bottom]'); S(14, 1, 9, 'minecraft:chopping_block'.replace('chopping_block', 'barrel[facing=up,open=false]'))
  // interieur : sejour avec cheminee, cuisine, mezzanine
  F(3, 1, 5, 3, 4, 7, CB); S(3, 1, 6, 'minecraft:campfire[lit=false,facing=east]'); F(4, 3, 5, 4, 3, 7, 'minecraft:spruce_slab[type=top]'); S(4, 4, 6, 'minecraft:skeleton_skull[rotation=4]')
  F(5, 1, 5, 6, 1, 7, 'minecraft:brown_carpet'); F(7, 1, 5, 7, 1, 7, 'mcwfurnitures:brown_couch[facing=west,shape=single]'); S(5, 1, 9, 'minecraft:white_carpet')
  F(11, 1, 3, 12, 1, 3, MAT('spruce_counter', 'south')); F(12, 1, 4, 12, 1, 5, MAT('spruce_counter', 'west')); S(12, 2, 4, 'farmersdelight:cooking_pot'); S(11, 2, 3, 'supplementaries:jar')
  F(9, 1, 8, 10, 1, 9, 'mcwfurnitures:spruce_table'); S(8, 1, 8, 'minecraft:spruce_stairs[facing=west,half=bottom,shape=straight]'); S(8, 1, 9, 'minecraft:spruce_stairs[facing=west,half=bottom,shape=straight]'); S(11, 1, 8, 'minecraft:spruce_stairs[facing=east,half=bottom,shape=straight]'); S(11, 1, 9, 'minecraft:spruce_stairs[facing=east,half=bottom,shape=straight]')
  F(12, 1, 7, 12, 6, 7, 'minecraft:ladder[facing=west]'); S(12, 6, 7, 'minecraft:ladder[facing=west]')
  S(9, 5, 5, 'mcwlights:iron_chandelier'); S(10, 5, 9, 'minecraft:lantern[hanging=true]'); F(3, 1, 10, 4, 2, 10, 'minecraft:barrel[facing=up,open=false]')
  LIT(4, 7, 4, 'brown', 'north'); LIT(5, 7, 4, 'brown', 'north'); S(3, 7, 3, 'minecraft:chest[facing=east]'); S(9, 7, 4, MAT('spruce_chair', 'south')); S(9, 7, 3, 'mcwfurnitures:spruce_desk[facing=north,connection=single]'); S(9, 8, 3, 'supplementaries:globe_sepia')
  F(6, 7, 5, 8, 7, 6, 'minecraft:red_carpet'); S(7, 11, 5, 'minecraft:lantern[hanging=true]')
  // abords : souches, foret
  ;[[0, 1], [15, 13], [0, 15]].forEach(c => S(c[0], 0, c[1], SL + '[axis=y]'))
  for (var x = 0; x <= 15; x++) for (var z = 0; z <= 15; z++) if ((x < 1 || x > 14 || z < 1) && R() < 0.35) SA(x, 0, z, ['minecraft:fern', 'minecraft:short_grass', 'minecraft:sweet_berry_bush[age=3]', 'minecraft:large_fern'.replace('large_fern', 'fern')][Math.floor(R() * 4)])
}

// ================= VILLA MEDITERRANEENNE (terracotta) =================
function villa() {
  var WT = 'minecraft:white_terracotta', SS = 'minecraft:smooth_sandstone', TT = 'minecraft:terracotta', VO = 'minecraft:warped_trapdoor'
  function TU(f) { return TOIT(f, 'orange_terracotta') }
  F(0, -1, 0, 15, -1, 15, 'minecraft:grass_block')
  for (var x = 1; x <= 15; x++) for (var z = 1; z <= 14; z++) S(x, -1, z, (x + z) % 3 ? TT : 'minecraft:smooth_sandstone')
  // corps principal R+1
  F(1, 0, 1, 9, 0, 10, SS); W(1, 1, 9, 10, 1, 11, WT); F(1, 6, 1, 9, 6, 10, 'minecraft:smooth_sandstone_slab[type=top]'); F(2, 6, 2, 8, 6, 9, 'minecraft:spruce_planks')
  F(1, 6, 1, 9, 6, 1, SS); F(1, 6, 10, 9, 6, 10, SS); F(1, 6, 1, 1, 6, 10, SS); F(9, 6, 1, 9, 6, 10, SS)
  F(1, 11, 0, 9, 11, 0, 'minecraft:smooth_sandstone_stairs[facing=south,half=top,shape=straight]'); F(1, 11, 11, 9, 11, 11, 'minecraft:smooth_sandstone_stairs[facing=north,half=top,shape=straight]')
  // toit en croupe, tuiles canal
  for (var k = 0; k <= 4; k++) {
    var x1 = 0 + k, x2 = 10 - k, z1 = 0 + k, z2 = 11 - k, y = 12 + k
    if (x2 - x1 < 2) { F(x1, y, z1, x2, y, z2, 'minecraft:granite_slab[type=bottom]'); break }
    F(x1, y, z1, x2, y, z1, TU('south')); F(x1, y, z2, x2, y, z2, TU('north')); F(x1, y, z1 + 1, x1, y, z2 - 1, TU('east')); F(x2, y, z1 + 1, x2, y, z2 - 1, TU('west'))
    if (k == 4) F(x1 + 1, y, z1 + 1, x2 - 1, y, z2 - 1, 'minecraft:granite_slab[type=bottom]')
  }
  // loggia a arcades au rez-de-chaussee
  F(1, 1, 11, 9, 5, 12, AIR); F(1, 0, 11, 9, 0, 12, 'minecraft:smooth_sandstone'); ;[1, 4, 6, 9].forEach(x => F(x, 1, 12, x, 4, 12, 'minecraft:quartz_pillar'))
  F(1, 5, 11, 9, 5, 12, SS); ;[[2, 3], [7, 8]].forEach(a => { S(a[0], 4, 12, 'minecraft:smooth_sandstone_stairs[facing=west,half=top,shape=straight]'); S(a[1], 4, 12, 'minecraft:smooth_sandstone_stairs[facing=east,half=top,shape=straight]') })
  S(5, 4, 12, 'minecraft:smooth_sandstone_slab[type=top]'); F(1, 6, 11, 9, 6, 12, 'minecraft:smooth_sandstone_slab[type=bottom]'); F(1, 7, 12, 9, 7, 12, 'mcwfences:curved_metal_fence')
  PORTE(3, 1, 10, 'mcwdoors:jungle_glass_door'.replace('jungle', 'dark_oak'), 'north', 'left', 'false'); F(6, 2, 10, 7, 3, 10, GP)
  // etage : portes-fenetres sur la terrasse, volets provencaux
  ;[3, 7].forEach(x => { PORTE(x, 7, 10, 'mcwdoors:spruce_glass_door', 'north', 'left', 'false'); S(x - 1, 7, 11, VO + '[facing=south,half=bottom,open=true]'); S(x - 1, 8, 11, VO + '[facing=south,half=bottom,open=true]'); S(x + 1, 7, 11, VO + '[facing=south,half=bottom,open=true]'); S(x + 1, 8, 11, VO + '[facing=south,half=bottom,open=true]') })
  ;[3, 7].forEach(z => { F(1, 8, z, 1, 9, z, GP); F(9, 8, z, 9, 9, z, GP) }); F(4, 8, 1, 6, 9, 1, GP); F(3, 2, 1, 3, 3, 1, GP); F(7, 2, 1, 7, 3, 1, GP)
  ;[[1, 3], [1, 7]].forEach(c => { S(0, 8, c[1] - 1, VO + '[facing=west,half=bottom,open=true]'); S(0, 8, c[1] + 1, VO + '[facing=west,half=bottom,open=true]') })
  // aile basse avec toit-terrasse et pergola
  F(10, 0, 1, 14, 0, 7, SS); W(10, 1, 14, 7, 1, 5, WT); F(10, 6, 1, 14, 6, 7, 'minecraft:smooth_sandstone'); F(11, 2, 7, 13, 3, 7, GP); F(14, 2, 3, 14, 3, 5, GP)
  F(10, 7, 1, 14, 7, 7, 'minecraft:sandstone_wall'); F(10, 7, 2, 10, 7, 6, AIR); PORTE(9, 7, 4, 'mcwdoors:spruce_glass_door', 'east', 'left', 'false')
  ;[[11, 2], [14, 2], [11, 6], [14, 6]].forEach(c => F(c[0], 8, c[1], c[0], 9, c[1], 'minecraft:stripped_oak_log[axis=y]'))
  for (var x = 11; x <= 14; x++) S(x, 10, 2, 'minecraft:oak_fence'), S(x, 10, 6, 'minecraft:oak_fence'); for (var z = 3; z <= 5; z++) for (var x = 11; x <= 14; x += 1) if (R() < 0.7) S(x, 10, z, R() < 0.5 ? 'minecraft:flowering_azalea_leaves[persistent=true]' : 'minecraft:oak_fence')
  F(12, 7, 3, 12, 7, 4, MAT('stripped_oak_chair'.replace('stripped_oak_chair', 'spruce_chair'), 'east')); S(13, 7, 4, 'mcwfurnitures:spruce_glass_table'); S(14, 8, 4, 'minecraft:decorated_pot')
  // patio : fontaine, pots, bougainvillier, cypres
  F(10, 0, 9, 14, 0, 13, 'minecraft:smooth_sandstone'); F(11, 0, 10, 13, 0, 12, 'minecraft:smooth_sandstone_slab[type=bottom]'); S(12, 0, 11, 'minecraft:water'); S(12, -1, 11, 'minecraft:smooth_sandstone')
  F(15, 0, 8, 15, 1, 14, 'minecraft:sandstone_wall'); F(0, 0, 14, 15, 0, 14, 'minecraft:sandstone_wall'); F(5, 0, 14, 6, 0, 14, AIR); F(0, 1, 14, 3, 1, 14, 'minecraft:flowering_azalea_leaves[persistent=true]')
  ;[[10, 8], [14, 8], [10, 13], [9, 13]].forEach(c => S(c[0], 1, c[1], 'minecraft:decorated_pot')); S(14, 1, 13, 'minecraft:potted_cactus')
  F(9, 2, 11, 9, 9, 11, 'minecraft:vine[west=true]'.replace('west', 'east')); for (var y = 6; y <= 10; y++) if (R() < 0.8) SA(10, y, 8, 'minecraft:cherry_leaves[persistent=true]')
  ;[[0, 12], [15, 0], [0, 1]].forEach(c => { F(c[0], 0, c[1], c[0], 6, c[1], 'minecraft:spruce_log[axis=y]'); for (var y = 1; y <= 8; y++) { var r = y < 7 ? 1 : 0; for (var dx = -r; dx <= r; dx++) for (var dz = -r; dz <= r; dz++) if (Math.abs(dx) + Math.abs(dz) == 1 || (dx == 0 && dz == 0 && y > 6)) SA(c[0] + dx, y, c[1] + dz, 'minecraft:spruce_leaves[persistent=true]') } })
  // interieur
  for (var x = 2; x <= 8; x++) for (var z = 2; z <= 9; z++) S(x, 0, z, (x + z) % 2 ? 'minecraft:terracotta' : 'minecraft:white_glazed_terracotta'.replace('white_glazed_terracotta', 'smooth_sandstone'))
  F(5, 1, 2, 5, 5, 6, WT); PORTE(5, 1, 4, 'mcwdoors:spruce_classic_door', 'east', 'left', 'true')
  F(2, 1, 2, 4, 1, 2, MAT('stripped_spruce_counter'.replace('spruce', 'spruce'), 'south')); S(3, 1, 2, 'mcwfurnitures:stripped_spruce_kitchen_sink[facing=south,water=false]'); S(2, 2, 2, 'minecraft:decorated_pot')
  F(2, 1, 5, 3, 1, 6, 'mcwfurnitures:stripped_spruce_table'); S(4, 1, 5, MAT('stripped_spruce_chair', 'west')); S(4, 1, 6, MAT('stripped_spruce_chair', 'west')); S(3, 5, 5, 'mcwlights:iron_chandelier')
  F(6, 1, 7, 8, 1, 7, 'mcwfurnitures:white_couch[facing=south,shape=single]'); S(7, 1, 8, 'mcwfurnitures:stripped_spruce_coffee_table'); F(6, 1, 8, 8, 1, 9, 'minecraft:orange_carpet'.replace('orange', 'yellow')); S(7, 1, 8, 'mcwfurnitures:stripped_spruce_coffee_table')
  F(11, 0, 2, 13, 0, 6, 'minecraft:terracotta'); LIT(12, 1, 3, 'white', 'north'); LIT(13, 1, 3, 'white', 'north'); S(11, 1, 2, 'mcwfurnitures:stripped_spruce_end_table'); S(11, 2, 2, 'minecraft:candle[candles=2,lit=false]')
  LIT(3, 7, 3, 'orange', 'north'); S(7, 7, 3, 'mcwfurnitures:stripped_spruce_wardrobe[facing=south,connection=base,hinge=left]'); S(6, 7, 8, 'minecraft:water_cauldron[level=3]'); S(3, 11, 5, 'minecraft:lantern[hanging=true]')
}

// ================= VILLA CONTEMPORAINE (moderne) =================
function moderne() {
  var WC = 'minecraft:white_concrete', BK = 'minecraft:black_concrete', GL = 'minecraft:glass', SQ = 'minecraft:smooth_quartz', SLAT = 'minecraft:stripped_dark_oak_log[axis=y]'
  F(0, -1, 0, 15, -1, 15, 'minecraft:grass_block')
  // volume bas vitre
  F(1, 0, 4, 10, 0, 12, SQ); W(1, 4, 10, 12, 1, 5, WC); F(2, 1, 12, 9, 4, 12, GL); F(10, 1, 6, 10, 4, 11, GL); F(1, 2, 6, 1, 2, 10, GL)
  F(1, 6, 4, 10, 6, 12, WC); F(1, 5, 12, 10, 5, 12, BK); F(1, 1, 12, 1, 5, 12, BK); F(10, 1, 12, 10, 5, 12, BK)
  PORTE(10, 1, 5, 'mcwdoors:metal_door', 'east', 'left', 'false')
  // volume haut en porte-a-faux, bardage a claire-voie
  F(5, 6, 1, 14, 6, 9, WC); W(5, 1, 14, 9, 7, 11, WC); F(5, 12, 1, 14, 12, 9, WC)
  for (var x = 6; x <= 13; x++) F(x, 7, 9, x, 11, 9, x % 2 ? SLAT : GL); F(14, 7, 2, 14, 11, 8, GL); F(14, 7, 2, 14, 7, 8, BK); F(6, 8, 1, 9, 10, 1, GL)
  F(5, 11, 1, 14, 11, 1, BK); F(5, 12, 9, 14, 12, 9, BK)
  ;[[14, 1], [14, 9]].forEach(c => F(c[0], 0, c[1], c[0], 5, c[1], 'minecraft:light_gray_concrete')); F(11, 0, 1, 14, 0, 9, 'minecraft:polished_andesite')
  // toiture vegetalisee et panneaux solaires
  F(1, 6, 10, 10, 6, 12, 'minecraft:moss_block'); F(1, 6, 4, 4, 6, 9, 'minecraft:moss_block'); F(1, 7, 12, 10, 7, 12, 'minecraft:glass_pane'); F(1, 7, 4, 1, 7, 12, 'minecraft:glass_pane')
  for (var x = 2; x <= 9; x++) for (var z = 5; z <= 11; z++) if ((x < 5 || z > 9) && R() < 0.35) SA(x, 7, z, ['minecraft:short_grass', 'minecraft:azalea', 'minecraft:fern'][Math.floor(R() * 3)])
  PORTE(5, 7, 10, 'mcwdoors:metal_door', 'west', 'left', 'false'); F(6, 6, 10, 9, 6, 11, 'minecraft:stripped_oak_wood'.replace('oak_wood', 'oak_log[axis=x]')); S(7, 7, 11, MAT('stripped_spruce_chair', 'south')); S(8, 7, 11, MAT('stripped_spruce_chair', 'south'))
  for (var x = 6; x <= 13; x += 2) for (var z = 2; z <= 8; z += 3) S(x, 13, z, 'minecraft:daylight_detector'); F(5, 13, 1, 14, 13, 1, 'minecraft:smooth_quartz_slab[type=bottom]')
  // piscine abandonnee et terrasse en bois
  F(1, -1, 13, 9, -1, 15, 'minecraft:stripped_oak_log[axis=x]'); F(11, -3, 11, 14, -1, 14, 'minecraft:light_blue_terracotta'); F(12, -2, 12, 13, -1, 13, 'minecraft:water')
  S(12, -1, 12, 'minecraft:lily_pad'.replace('lily_pad', 'water')); SA(12, 0, 13, 'minecraft:lily_pad'); S(13, -2, 12, 'minecraft:seagrass'); F(11, 0, 10, 14, 0, 10, 'minecraft:glass_pane'); S(11, -1, 15, 'minecraft:stripped_oak_log[axis=x]')
  S(4, 0, 14, 'mcwfurnitures:white_chaise'); S(6, 0, 14, 'mcwfurnitures:white_chaise')
  // interieur epure
  F(2, 1, 5, 4, 1, 5, MAT('stripped_dark_oak_counter', 'south')); S(3, 1, 5, 'mcwfurnitures:stripped_dark_oak_kitchen_sink[facing=south,water=false]'); F(3, 1, 7, 4, 1, 7, 'minecraft:polished_deepslate')
  S(3, 1, 8, 'mcwfurnitures:stripped_dark_oak_stool_chair'); F(6, 1, 10, 8, 1, 10, 'mcwfurnitures:black_couch[facing=north,shape=single]'); S(7, 1, 9, 'mcwfurnitures:stripped_dark_oak_glass_table'); F(5, 1, 8, 9, 1, 11, 'minecraft:light_gray_carpet'); F(6, 1, 10, 8, 1, 10, 'mcwfurnitures:black_couch[facing=north,shape=single]'); S(7, 1, 9, 'mcwfurnitures:stripped_dark_oak_glass_table')
  for (var i = 0; i < 5; i++) S(9, 1 + i, 9 - i, 'minecraft:quartz_stairs[facing=north,half=bottom,shape=straight]'); F(9, 6, 5, 9, 6, 7, AIR)
  S(5, 5, 9, 'mcwlights:white_ceiling_light'); S(3, 5, 6, 'mcwlights:white_ceiling_light'); S(2, 1, 11, 'minecraft:potted_bamboo')
  F(6, 7, 2, 13, 7, 2, 'minecraft:light_gray_carpet'); LIT(12, 7, 3, 'black', 'north'); LIT(13, 7, 3, 'black', 'north'); S(11, 7, 2, 'mcwfurnitures:stripped_dark_oak_end_table'); S(6, 7, 4, 'mcwfurnitures:stripped_dark_oak_desk[facing=north,connection=single]')
  S(10, 11, 5, 'mcwlights:white_ceiling_light'); F(5, 7, 6, 13, 11, 6, WC); PORTE(11, 7, 6, 'mcwdoors:metal_door', 'south', 'left', 'true')
  // jardin : graviers, bambous, allee
  F(0, -1, 0, 4, -1, 3, 'minecraft:gravel'); ;[[1, 1], [2, 2], [3, 1]].forEach(c => F(c[0], 0, c[1], c[0], 2 + Math.floor(R() * 3), c[1], 'minecraft:bamboo[age=0,leaves=large,stage=0]'))
  F(10, -1, 13, 10, -1, 15, 'minecraft:smooth_stone'); S(0, 0, 13, 'mcwlights:garden_light'); S(9, 0, 15, 'mcwlights:garden_light')
}


// ================= MAISON DE MAITRE NEO-GOTHIQUE =================
function gothique() {
  var DB = 'minecraft:deepslate_bricks', PB = 'minecraft:polished_blackstone_bricks', PD = 'minecraft:polished_deepslate', VG = 'minecraft:purple_stained_glass_pane', BL = 'blackstone'
  function OGIVE(x, y, z, f1, f2, h) { F(x, y, z, x + 1, y + h - 1, z, VG); S(x, y + h, z, 'minecraft:polished_blackstone_brick_stairs[facing=' + f1 + ',half=top,shape=straight]'); S(x + 1, y + h, z, 'minecraft:polished_blackstone_brick_stairs[facing=' + f2 + ',half=top,shape=straight]') }
  F(0, -1, 0, 15, -1, 15, 'minecraft:podzol'); F(0, -1, 12, 15, -1, 15, 'minecraft:grass_block')
  F(1, 0, 2, 11, 0, 10, PD); W(1, 2, 11, 10, 1, 11, DB); F(2, 6, 3, 10, 6, 9, 'minecraft:dark_oak_planks'); F(2, 12, 3, 10, 12, 9, 'minecraft:dark_oak_planks')
  ;[0, 6, 12].forEach(y => { F(1, y, 2, 11, y, 2, PB); F(1, y, 10, 11, y, 10, PB); F(1, y, 2, 1, y, 10, PB); F(11, y, 2, 11, y, 10, PB) })
  ;[1, 4, 8, 11].forEach(x => { F(x, 1, 11, x, 11, 11, PB); S(x, 12, 11, 'minecraft:polished_blackstone_brick_wall') })
  // fenetres en ogive
  OGIVE(2, 1, 10, 'west', 'east', 3); OGIVE(9, 1, 10, 'west', 'east', 3); OGIVE(2, 7, 10, 'west', 'east', 3); OGIVE(5, 7, 10, 'west', 'east', 3); OGIVE(9, 7, 10, 'west', 'east', 3)
  ;[3, 7].forEach(z => { F(1, 2, z, 1, 4, z, VG); F(1, 8, z, 1, 10, z, VG) }); ;[4, 8].forEach(x => { F(x, 2, 2, x, 4, 2, VG); F(x, 8, 2, x, 10, 2, VG) })
  // portail : porte mystique sous arc brise, perron
  F(5, 1, 10, 7, 5, 10, PB); PORTE(6, 1, 10, 'mcwdoors:dark_oak_mystic_door', 'north', 'left', 'false'); S(5, 1, 10, AIR); F(5, 1, 10, 5, 2, 10, PB); S(7, 1, 10, PB)
  S(6, 3, 10, VG); S(5, 3, 10, 'minecraft:polished_blackstone_brick_stairs[facing=west,half=top,shape=straight]'); S(7, 3, 10, 'minecraft:polished_blackstone_brick_stairs[facing=east,half=top,shape=straight]'); S(6, 4, 10, 'minecraft:chiseled_polished_blackstone')
  F(5, 0, 11, 7, 0, 12, 'minecraft:polished_blackstone_brick_stairs[facing=north,half=bottom,shape=straight]'); S(5, 1, 12, 'minecraft:soul_lantern[hanging=false]'.replace('[hanging=false]', '')); S(7, 1, 12, 'minecraft:soul_lantern')
  // toit tres pentu en ardoise noire, pignon sur rue avec lucarne
  for (var k = 0; k < 5; k++) { F(0, 12 + k, 1 + k, 12, 12 + k, 1 + k, TOIT('south', BL)); F(0, 12 + k, 11 - k, 12, 12 + k, 11 - k, TOIT('north', BL)) }; F(0, 17, 6, 12, 17, 6, 'minecraft:polished_blackstone_brick_slab[type=bottom]'); F(1, 12, 6, 11, 16, 6, AIR); F(1, 12, 6, 1, 16, 6, DB); F(11, 12, 6, 11, 16, 6, DB)
  for (var z = 2; z <= 10; z++) { var h = 12 + Math.min(z - 1, 11 - z) - 1; F(1, 13, z, 1, h, z, DB); F(11, 13, z, 11, h, z, DB) }
  F(1, 14, 5, 1, 15, 7, VG); F(5, 13, 11, 7, 14, 11, DB); S(6, 13, 11, VG); S(6, 14, 11, VG); S(5, 15, 11, TOIT('east', BL)); S(7, 15, 11, TOIT('west', BL)); S(6, 15, 11, 'mcwroofs:blackstone_roof_block'.replace('blackstone_roof_block', 'black_roof_block')); S(6, 16, 11, 'minecraft:lightning_rod')
  F(3, 18, 6, 9, 18, 6, 'minecraft:polished_blackstone_wall'); S(2, 18, 6, 'minecraft:end_rod'); S(10, 18, 6, 'minecraft:end_rod')
  // tourelle d'angle a toit en poivriere
  F(11, 0, 8, 14, 0, 11, PD); W(11, 8, 14, 11, 1, 17, DB); F(12, 6, 9, 13, 6, 10, 'minecraft:dark_oak_planks'); F(12, 12, 9, 13, 12, 10, 'minecraft:dark_oak_planks')
  ;[[14, 9], [14, 10]].forEach(c => { F(c[0], 2, c[1], c[0], 4, c[1], VG); F(c[0], 8, c[1], c[0], 10, c[1], VG); F(c[0], 14, c[1], c[0], 16, c[1], VG) }); F(12, 14, 11, 13, 16, 11, VG)
  F(11, 18, 8, 14, 18, 11, PB); F(10, 18, 7, 15, 18, 12, 'minecraft:polished_blackstone_brick_slab[type=top]')
  F(11, 19, 8, 14, 19, 8, TOIT('south', BL)); F(11, 19, 11, 14, 19, 11, TOIT('north', BL)); F(11, 19, 9, 11, 19, 10, TOIT('east', BL)); F(14, 19, 9, 14, 19, 10, TOIT('west', BL))
  F(12, 20, 9, 13, 20, 9, TOIT('south', BL)); F(12, 20, 10, 13, 20, 10, TOIT('north', BL)); F(12, 21, 9, 13, 22, 10, 'minecraft:polished_blackstone_wall'); S(12, 23, 9, 'minecraft:lightning_rod')
  // grille en fer forge, jardin mort, statue
  F(0, 0, 15, 15, 0, 15, 'mcwfences:gothic_metal_fence'); F(5, 0, 15, 7, 0, 15, AIR); F(0, 0, 12, 0, 0, 14, 'mcwfences:gothic_metal_fence'); F(15, 0, 12, 15, 0, 14, 'mcwfences:gothic_metal_fence')
  F(6, -1, 13, 6, -1, 15, 'minecraft:gravel'); S(2, 0, 13, 'minecraft:polished_blackstone'); S(2, 1, 13, 'minecraft:polished_blackstone_wall'); S(2, 2, 13, 'minecraft:wither_skeleton_skull[rotation=0]')
  ;[[11, 13], [13, 14], [1, 1], [14, 3]].forEach(c => { F(c[0], 0, c[1], c[0], 3, c[1], 'minecraft:dark_oak_log[axis=y]'); S(c[0] + 1, 2, c[1], 'minecraft:dark_oak_fence'); S(c[0], 4, c[1], 'minecraft:dark_oak_fence') })
  for (var x = 0; x <= 15; x++) for (var z = 11; z <= 14; z++) if (R() < 0.3) SA(x, 0, z, R() < 0.5 ? 'minecraft:dead_bush' : 'minecraft:wither_rose')
  // interieur : bibliotheque et salon
  F(2, 1, 3, 2, 4, 9, 'minecraft:bookshelf'); F(4, 1, 3, 9, 1, 3, 'mcwfurnitures:dark_oak_bookshelf[facing=south,connection=base]'); F(3, 1, 5, 4, 1, 7, 'minecraft:red_carpet')
  S(5, 1, 6, 'mcwfurnitures:red_couch[facing=west,shape=single]'.replace('red_couch', 'black_couch')); S(3, 1, 6, 'mcwfurnitures:dark_oak_desk[facing=north,connection=single]'); S(3, 2, 6, 'minecraft:candle[candles=4,lit=false]')
  S(6, 5, 6, 'mcwlights:iron_chandelier'); F(8, 1, 6, 9, 1, 7, 'mcwfurnitures:dark_oak_table'); S(10, 1, 6, MAT('dark_oak_chair', 'west')); S(10, 1, 7, MAT('dark_oak_chair', 'west'))
  for (var i = 0; i < 5; i++) S(13, 1 + i, 9 + (i % 2), 'minecraft:dark_oak_stairs[facing=' + (i % 2 ? 'north' : 'south') + ',half=bottom,shape=straight]')
  LIT(4, 7, 4, 'black', 'north'); LIT(5, 7, 4, 'black', 'north'); S(3, 7, 3, 'mcwfurnitures:dark_oak_end_table'); S(3, 8, 3, 'minecraft:candle[candles=2,lit=false]'); F(8, 7, 3, 9, 8, 3, 'mcwfurnitures:dark_oak_wardrobe[facing=south,connection=base,hinge=left]')
}

// ================= TOUR DE BUREAUX (verre) =================
function verre() {
  var GC = 'minecraft:light_blue_stained_glass', AL = 'minecraft:light_gray_concrete', IR = 'minecraft:iron_block'
  F(0, -1, 0, 15, -1, 15, 'minecraft:smooth_stone'); F(1, 0, 1, 14, 0, 14, 'minecraft:polished_diorite')
  // socle double hauteur, angle coupe, auvent
  for (var f = 0; f < 7; f++) {
    var yb = f == 0 ? 0 : 6 + (f - 1) * 5, h = f == 0 ? 6 : 5
    W(2, 2, 13, 13, yb + 1, yb + h - 1, GC); if (f > 0) F(2, yb, 2, 13, yb, 13, AL)
    F(2, yb, 2, 13, yb, 2, IR); F(2, yb, 13, 13, yb, 13, IR); F(2, yb, 2, 2, yb, 13, IR); F(13, yb, 2, 13, yb, 13, IR)
    ;[2, 6, 9, 13].forEach(p => { F(p, yb + 1, 2, p, yb + h - 1, 2, AL); F(p, yb + 1, 13, p, yb + h - 1, 13, AL); F(2, yb + 1, p, 2, yb + h - 1, p, AL); F(13, yb + 1, p, 13, yb + h - 1, p, AL) })
  }
  for (var y = 1; y <= 35; y++) { S(13, y, 13, AIR); S(12, y, 13, GC); S(13, y, 12, GC) }
  F(4, 1, 13, 11, 5, 13, 'minecraft:glass_pane'); PORTE(7, 1, 13, 'mcwdoors:metal_door', 'north', 'left', 'false'); PORTE(8, 1, 13, 'mcwdoors:metal_door', 'north', 'right', 'false')
  F(3, 6, 14, 12, 6, 15, 'minecraft:smooth_stone_slab[type=top]'); F(3, 5, 15, 3, 1, 15, IR); F(12, 5, 15, 12, 1, 15, IR)
  F(4, 6, 15, 11, 6, 15, 'minecraft:light_gray_concrete'); ;['A', 'T', 'H', 'E', 'R', 'I', 'A'].forEach((c, i) => 0)
  // toit : heliport, edicule, antenne
  F(2, 36, 2, 13, 36, 13, AL); W(2, 2, 13, 13, 37, 37, 'minecraft:iron_bars')
  F(4, 36, 4, 11, 36, 11, 'minecraft:gray_concrete'); F(6, 36, 6, 6, 36, 9, 'minecraft:yellow_concrete'); F(9, 36, 6, 9, 36, 9, 'minecraft:yellow_concrete'); F(7, 36, 7, 8, 36, 8, 'minecraft:yellow_concrete'); F(7, 36, 8, 8, 36, 8, 'minecraft:gray_concrete')
  F(10, 37, 2, 12, 39, 4, AL); F(3, 37, 11, 3, 44, 11, 'minecraft:iron_bars'); S(3, 45, 11, 'minecraft:lightning_rod'); S(3, 46, 11, 'minecraft:redstone_lamp[lit=true]')
  // hall : banque d'accueil, plantes, ascenseurs
  F(5, 1, 6, 10, 1, 6, MAT('stripped_dark_oak_counter', 'south')); S(7, 2, 6, 'minecraft:daylight_detector'); S(9, 2, 6, 'supplementaries:book_pile')
  F(4, 1, 3, 11, 5, 3, 'minecraft:polished_andesite'); F(6, 1, 3, 7, 3, 3, 'minecraft:iron_block'); F(9, 1, 3, 10, 3, 3, 'minecraft:iron_block'); S(8, 4, 3, 'minecraft:redstone_lamp[lit=true]')
  ;[[3, 12], [12, 4], [3, 4]].forEach(c => { S(c[0], 1, c[1], 'minecraft:decorated_pot'); S(c[0], 2, c[1], 'minecraft:azalea_leaves[persistent=true]') })
  F(4, 1, 9, 6, 1, 9, 'mcwfurnitures:black_couch[facing=south,shape=single]'); S(5, 1, 10, 'mcwfurnitures:stripped_dark_oak_glass_table'); S(8, 5, 9, 'mcwlights:white_ceiling_light')
  // bureaux du 1er : plateau ouvert
  for (var x = 4; x <= 11; x += 3) for (var z = 5; z <= 10; z += 3) { S(x, 7, z, 'mcwfurnitures:stripped_dark_oak_desk[facing=north,connection=single]'); S(x, 7, z + 1, MAT('stripped_dark_oak_chair', 'north')); S(x, 8, z, 'minecraft:black_stained_glass_pane') }
  S(4, 7, 12, 'minecraft:barrel[facing=up,open=false]'); S(11, 7, 12, 'minecraft:water_cauldron[level=1]')
  // pied de tour : bancs, papiers, voiture de police
  F(1, 0, 14, 1, 0, 15, 'mcwfurnitures:white_couch[facing=east,shape=single]'.replace('white_couch', 'gray_couch')); S(14, 0, 14, 'supplementaries:sack')
  F(0, 0, 0, 3, 0, 0, 'minecraft:white_concrete'); F(0, 1, 0, 2, 1, 0, 'minecraft:black_concrete'); S(1, 2, 0, 'minecraft:blue_stained_glass'); S(2, 2, 0, 'minecraft:red_stained_glass')
}

// ================= ATELIER INDUSTRIEL (rouille) =================
function rouille() {
  var BR = 'minecraft:bricks', CU = 'minecraft:weathered_cut_copper', CO = 'minecraft:oxidized_cut_copper', IR = 'minecraft:iron_block'
  F(0, -1, 0, 15, -1, 15, 'minecraft:gravel'); F(1, 0, 1, 12, 0, 14, 'minecraft:smooth_stone')
  W(1, 1, 12, 14, 1, 3, BR); W(1, 1, 12, 14, 4, 9, CU)
  for (var y = 4; y <= 9; y++) for (var z = 1; z <= 14; z++) if ((y + z) % 5 == 0) { S(1, y, z, CO); S(12, y, z, CO) }
  F(2, 10, 1, 11, 10, 1, CU); F(2, 10, 14, 11, 10, 14, CU)
  // sheds : toiture en dents de scie, verrieres au nord
  for (var s = 0; s < 3; s++) { var z0 = 2 + s * 4; F(1, 10, z0, 12, 10, z0, 'minecraft:glass'); F(1, 11, z0, 12, 11, z0, 'minecraft:glass'); F(1, 10, z0 + 1, 12, 10, z0 + 1, 'minecraft:weathered_cut_copper_stairs[facing=north,half=bottom,shape=straight]'.replace('north', 'south')); F(1, 11, z0 + 1, 12, 11, z0 + 1, 'minecraft:weathered_cut_copper_slab[type=bottom]'); F(1, 10, z0 + 2, 12, 10, z0 + 3, 'minecraft:weathered_cut_copper_slab[type=top]') }
  F(1, 10, 14, 12, 10, 14, CU)
  // facade : grande porte roulante, quai, enseigne
  F(4, 1, 14, 9, 6, 14, AIR); F(4, 4, 14, 9, 6, 14, 'minecraft:iron_trapdoor[facing=south,half=top,open=false]'); F(4, 3, 15, 9, 3, 15, 'minecraft:iron_trapdoor[facing=south,half=top,open=false]'.replace('open=false', 'open=false'))
  F(3, 1, 14, 3, 7, 14, IR); F(10, 1, 14, 10, 7, 14, IR); F(3, 7, 14, 10, 7, 14, 'minecraft:iron_block')
F(2, 2, 14, 2, 3, 14, 'minecraft:iron_bars'); F(11, 2, 14, 11, 3, 14, 'minecraft:iron_bars')
  ;[3, 7, 11].forEach(z => { F(12, 5, z, 12, 7, z + 1, 'minecraft:glass_pane'); F(1, 5, z, 1, 7, z + 1, 'minecraft:glass_pane') })
  // haute cheminee de briques
  F(13, 0, 2, 15, 0, 4, BR); F(13, 1, 2, 15, 22, 4, BR); F(14, 1, 3, 14, 23, 3, AIR); ;[8, 14, 20].forEach(y => F(13, y, 2, 15, y, 4, 'minecraft:mud_bricks')); F(13, 23, 2, 15, 23, 4, 'minecraft:brick_wall')
  F(13, 6, 1, 13, 22, 1, 'minecraft:ladder[facing=north]'.replace('north', 'north'))
  // passerelle, cuve et tuyauterie
  F(13, 6, 6, 15, 6, 12, 'createdeco:andesite_catwalk'); F(15, 7, 6, 15, 7, 12, 'createdeco:andesite_catwalk_railing'.replace('andesite_catwalk_railing', 'zinc_catwalk_railing')); F(14, 0, 9, 15, 5, 11, 'minecraft:oxidized_copper'); S(14, 6, 10, 'minecraft:iron_trapdoor[facing=south,half=bottom,open=false]')
  F(12, 8, 8, 14, 8, 8, 'create:fluid_pipe'.replace('create:fluid_pipe', 'minecraft:copper_block')); F(15, 0, 7, 15, 5, 7, 'createdeco:industrial_iron_support'.replace('createdeco:industrial_iron_support', 'minecraft:chain[axis=y]'))
  // interieur : machines, etablis, pont roulant
  F(3, 1, 3, 4, 2, 4, 'minecraft:blast_furnace[facing=south,lit=false]'.replace('[facing=south,lit=false]', '')); S(3, 1, 3, 'minecraft:blast_furnace[facing=south,lit=false]'); S(4, 1, 3, 'minecraft:smithing_table'); S(3, 1, 4, 'minecraft:anvil[facing=east]'); S(4, 1, 4, 'minecraft:grindstone[face=floor,facing=north]')
  F(9, 1, 3, 11, 1, 3, 'minecraft:barrel[facing=up,open=false]'); F(10, 1, 4, 11, 2, 4, 'minecraft:iron_block'); S(11, 3, 4, 'minecraft:hopper')
  F(2, 9, 6, 11, 9, 6, 'minecraft:iron_bars'); F(6, 6, 6, 6, 8, 6, 'minecraft:chain[axis=y]'); S(6, 5, 6, 'minecraft:anvil[facing=north]'.replace('anvil', 'chipped_anvil'))
  F(3, 1, 9, 5, 1, 10, 'minecraft:black_concrete'); F(4, 2, 9, 4, 2, 10, 'minecraft:tinted_glass'); S(3, 1, 11, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=true]')
  ;[[8, 9], [9, 11], [10, 10], [8, 12]].forEach(c => S(c[0], 1, c[1], 'minecraft:barrel[facing=' + (R() < 0.5 ? 'up' : 'east') + ',open=false]')); S(2, 1, 12, 'minecraft:crafting_table')
  // cour : palettes, ferraille, flaques d'huile
  F(13, 0, 13, 15, 0, 15, 'minecraft:spruce_slab[type=bottom]'); S(14, 1, 14, 'minecraft:barrel[facing=up,open=false]'); S(0, 0, 3, 'minecraft:iron_bars'); S(0, 0, 4, 'minecraft:chain[axis=x]')
  ;[[2, 15], [0, 10], [11, 15]].forEach(c => S(c[0], -1, c[1], 'minecraft:black_concrete_powder')); F(0, 0, 6, 0, 1, 8, 'minecraft:oxidized_cut_copper')
}

// ================= BIDONVILLE =================
function bidonville() {
  var mats = ['minecraft:weathered_copper', 'minecraft:spruce_planks', 'minecraft:blue_terracotta', 'minecraft:oak_planks', 'minecraft:yellow_terracotta', 'minecraft:oxidized_cut_copper', 'atheria:carrosserie']
  function M() { return mats[Math.floor(R() * mats.length)] }
  function cabane(x1, y1, z1, x2, z2, h, porte) {
    F(x1, y1, z1, x2, y1, z2, 'minecraft:spruce_planks')
    for (var y = y1 + 1; y <= y1 + h; y++) for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) if (x == x1 || x == x2 || z == z1 || z == z2) S(x, y, z, M())
    F(x1 + 1, y1 + 1, z1 + 1, x2 - 1, y1 + h, z2 - 1, AIR)
    F(x1 - 1, y1 + h + 1, z1 - 1, x2 + 1, y1 + h + 1, z2 + 1, R() < 0.5 ? 'minecraft:weathered_cut_copper_slab[type=bottom]' : 'minecraft:oxidized_cut_copper_slab[type=bottom]')
    S(porte[0], y1 + 1, porte[1], AIR); S(porte[0], y1 + 2, porte[1], AIR); S(porte[0], y1 + 1, porte[1], 'minecraft:spruce_door[facing=' + porte[2] + ',half=lower,hinge=left,open=true]'); S(porte[0], y1 + 2, porte[1], 'minecraft:spruce_door[facing=' + porte[2] + ',half=upper,hinge=left,open=true]')
  }
  F(0, -1, 0, 15, -1, 15, 'minecraft:coarse_dirt'); for (var x = 0; x <= 15; x++) for (var z = 0; z <= 15; z++) if (R() < 0.25) S(x, -1, z, 'minecraft:mud')
  cabane(1, 0, 1, 6, 6, 3, [4, 6, 'south']); cabane(9, 0, 2, 14, 7, 4, [11, 7, 'south']); cabane(2, 4, 2, 5, 5, 2, [5, 4, 'east']); cabane(10, 5, 3, 13, 6, 3, [10, 5, 'west'])
  cabane(3, 0, 9, 7, 13, 3, [7, 11, 'east'])
  // passerelles, echelles, cordes
  F(6, 4, 4, 9, 4, 4, 'minecraft:spruce_slab[type=top]'); F(6, 5, 4, 9, 5, 4, 'minecraft:spruce_fence'.replace('spruce_fence', 'air')); S(7, 5, 3, 'minecraft:spruce_fence'); S(8, 5, 3, 'minecraft:spruce_fence')
  F(6, 1, 3, 6, 4, 3, 'minecraft:ladder[facing=west]'.replace('west', 'east')); F(14, 1, 8, 14, 5, 8, 'minecraft:ladder[facing=south]')
  F(1, 5, 7, 7, 5, 7, 'minecraft:chain[axis=x]'); ;[2, 4, 6].forEach(x => S(x, 4, 7, 'minecraft:' + ['red', 'blue', 'yellow'][x % 3] + '_wall_banner[facing=south]'.replace('_wall_banner[facing=south]', '_carpet').replace('carpet', 'banner[rotation=0]')))
  // bache, bidons de recuperation d'eau, potager
  F(8, 3, 9, 14, 3, 13, 'minecraft:blue_carpet'.replace('blue_carpet', 'air')); for (var x = 9; x <= 14; x++) S(x, 3, 9 + (x % 2), 'minecraft:blue_wool'.replace('wool', 'carpet'))
  ;[[9, 10], [14, 10], [9, 13], [14, 13]].forEach(c => F(c[0], 0, c[1], c[0], 2, c[1], 'minecraft:spruce_fence')); F(9, 3, 10, 14, 3, 13, 'minecraft:blue_carpet'.replace('carpet', 'wool')); F(10, 3, 11, 13, 3, 12, 'minecraft:light_blue_carpet'.replace('light_blue_carpet', 'blue_wool'))
  F(10, 0, 11, 11, 0, 12, 'minecraft:farmland[moisture=7]'.replace('farmland[moisture=7]', 'composter[level=4]')); S(12, 0, 11, 'minecraft:water_cauldron[level=3]'); S(13, 0, 12, 'minecraft:barrel[facing=up,open=true]')
  ;[[0, 9], [1, 14], [15, 1]].forEach(c => S(c[0], 0, c[1], 'minecraft:water_cauldron[level=' + (1 + Math.floor(R() * 3)) + ']'))
  F(13, 8, 4, 13, 9, 4, 'minecraft:spruce_fence'); S(13, 10, 4, 'minecraft:lightning_rod'); S(4, 9, 3, 'minecraft:iron_trapdoor[facing=south,half=bottom,open=true]')
  // interieurs sommaires
  LIT(2, 1, 2, 'brown', 'west'); S(5, 1, 2, 'minecraft:crafting_table'); S(5, 1, 5, 'supplementaries:sack'); S(2, 1, 5, 'minecraft:campfire[lit=false,facing=north]'.replace('campfire', 'cauldron').replace('[lit=false,facing=north]', ''))
  S(10, 1, 3, 'minecraft:chest[facing=east]'); LIT(13, 1, 4, 'gray', 'north'); S(12, 1, 6, 'minecraft:candle[candles=3,lit=false]'); S(4, 1, 10, 'minecraft:barrel[facing=up,open=false]'); LIT(5, 1, 12, 'red', 'south'.replace('south', 'west'))
  S(3, 5, 3, 'supplementaries:sack'); S(11, 6, 4, 'minecraft:chest[facing=south]')
  for (var x = 0; x <= 15; x++) for (var z = 0; z <= 15; z++) if (R() < 0.12) SA(x, 0, z, ['minecraft:short_grass', 'minecraft:dead_bush', 'supplementaries:sack'][Math.floor(R() * 3)])
}

// ================= CASERNE (garnison) =================
function garnison() {
  var CC = 'minecraft:gray_concrete', OL = 'minecraft:green_terracotta', SAC = 'supplementaries:sack'
  F(0, -1, 0, 15, -1, 15, 'minecraft:gravel'); F(1, -1, 1, 14, -1, 9, 'minecraft:packed_mud')
  // baraquement en beton peint
  F(2, 0, 2, 13, 0, 8, CC); W(2, 2, 13, 8, 1, 4, OL); F(2, 1, 2, 13, 1, 8, CC); F(3, 1, 3, 12, 1, 7, 'minecraft:air'); F(3, 0, 3, 12, 0, 7, 'minecraft:polished_andesite')
  F(1, 5, 1, 14, 5, 9, 'minecraft:smooth_stone_slab[type=bottom]'); F(2, 5, 2, 13, 5, 8, CC)
  ;[4, 7, 10].forEach(x => F(x, 2, 8, x + 1, 3, 8, 'minecraft:iron_bars')); PORTE(12, 1, 8, 'mcwdoors:metal_door', 'north', 'left', 'false'); F(2, 2, 4, 2, 3, 6, 'minecraft:iron_bars')
F(3, 4, 8, 11, 4, 8, 'minecraft:yellow_terracotta'.replace('yellow', 'black'))
  // filet de camouflage, toit sac de sable
  for (var x = 2; x <= 13; x++) for (var z = 2; z <= 8; z++) if (R() < 0.45) S(x, 6, z, R() < 0.5 ? 'minecraft:moss_carpet' : 'minecraft:green_carpet')
  F(3, 6, 2, 5, 6, 3, SAC); F(3, 7, 2, 4, 7, 2, SAC); F(10, 6, 3, 10, 7, 3, 'minecraft:iron_bars'); S(10, 8, 3, 'minecraft:lightning_rod')
  // mirador
  ;[[11, 11], [14, 11], [11, 14], [14, 14]].forEach(c => F(c[0], 0, c[1], c[0], 7, c[1], 'minecraft:spruce_log[axis=y]'))
  F(11, 8, 11, 14, 8, 14, 'minecraft:spruce_planks'); W(11, 11, 14, 14, 9, 9, SAC); F(11, 10, 11, 11, 10, 11, 'minecraft:spruce_fence'); F(14, 10, 14, 14, 10, 14, 'minecraft:spruce_fence'); F(11, 10, 14, 11, 10, 14, 'minecraft:spruce_fence'); F(14, 10, 11, 14, 10, 11, 'minecraft:spruce_fence')
  F(10, 11, 10, 15, 11, 15, 'minecraft:spruce_slab[type=bottom]'); F(12, 1, 11, 12, 8, 11, 'minecraft:ladder[facing=south]'); S(13, 10, 13, 'minecraft:redstone_lamp[lit=false]'.replace('redstone_lamp[lit=false]', 'lantern[hanging=false]'))
  // barbeles, chicane de sacs de sable, barriere levante
  F(0, 0, 15, 9, 0, 15, 'mcwfences:iron_cheval_de_frise'); F(0, 0, 0, 0, 0, 14, 'mcwfences:iron_cheval_de_frise'); F(0, 0, 0, 15, 0, 0, 'mcwfences:iron_cheval_de_frise'); F(15, 0, 1, 15, 0, 10, 'mcwfences:iron_cheval_de_frise')
  F(2, 0, 12, 6, 0, 12, SAC); F(3, 1, 12, 5, 1, 12, SAC); F(6, 0, 13, 6, 1, 13, SAC); S(9, 0, 15, 'minecraft:yellow_concrete'); F(9, 1, 15, 9, 1, 15, 'minecraft:yellow_concrete'); F(10, 2, 15, 14, 2, 15, 'minecraft:spruce_fence'.replace('spruce', 'dark_oak'))
  // mat et drapeau, caisses de munitions, jerricans
  F(1, 0, 10, 1, 9, 10, 'minecraft:iron_bars'); S(2, 8, 10, 'minecraft:green_wall_banner[facing=east]'.replace('green_wall_banner', 'white_wall_banner'))
  ;[[7, 10], [8, 10], [7, 11], [8, 13]].forEach(c => S(c[0], 0, c[1], 'minecraft:barrel[facing=' + (R() < 0.5 ? 'up' : 'north') + ',open=false]')); S(8, 1, 10, 'minecraft:chest[facing=south]'); F(3, 0, 10, 4, 0, 10, 'minecraft:green_shulker_box')
  // interieur : lits superposes, armurerie
  for (var x = 3; x <= 9; x += 3) { LIT(x, 1, 4, 'green', 'north'); S(x, 3, 3, 'minecraft:spruce_trapdoor[facing=north,half=top,open=false]'); S(x, 2, 4, 'minecraft:spruce_trapdoor[facing=north,half=bottom,open=false]') }
  F(12, 1, 3, 12, 3, 3, 'minecraft:chiseled_bookshelf'.replace('chiseled_bookshelf', 'barrel[facing=west,open=false]')); S(11, 1, 3, 'minecraft:chest[facing=south]'); S(12, 1, 6, 'minecraft:smithing_table'); S(8, 4, 5, 'minecraft:lantern[hanging=true]')
  F(4, 1, 7, 6, 1, 7, MAT('spruce_counter', 'north')); S(5, 2, 7, 'supplementaries:book_pile'); S(9, 1, 7, 'minecraft:cartography_table')
}

// ================= RUE =================
function rue(x1, x2, z0) {
  OX = 0; OY = VB.Y0; OZ = 0; CUT = 999
  F(x1, -1, z0, x2, -1, z0 + 1, 'minecraft:smooth_stone'); F(x1, -1, z0 + 1, x2, -1, z0 + 1, 'minecraft:polished_andesite')
  F(x1, -1, z0 + 2, x2, -1, z0 + 6, 'minecraft:gray_concrete')
  for (var x = x1; x <= x2; x++) {
    if (x % 4 != 0 && R() > 0.25) S(x, -1, z0 + 4, 'minecraft:white_concrete')
    for (var z = z0 + 2; z <= z0 + 6; z++) { var r = R(); if (r < 0.08) S(x, -1, z, 'minecraft:andesite'); else if (r < 0.11) { S(x, -1, z, 'minecraft:coarse_dirt'); S(x, 0, z, 'minecraft:short_grass') } else if (r < 0.13) S(x, -1, z, 'minecraft:cobblestone') }
  }
  F(x1, -1, z0 + 7, x2, -1, z0 + 7, 'minecraft:polished_andesite')
}

function lot(fn, dx, dz, cut, graine, w, h) { VB.lots.push({ x: VB.X0 + dx, z: VB.Z0 + dz, w: w || 16, h: h || 23 });OX = VB.X0 + dx; OY = VB.Y0; OZ = VB.Z0 + dz; CUT = cut; GRAINE = graine; fn() }

function preparer(server) {
  var X0 = VB.X0, Y0 = VB.Y0, Z0 = VB.Z0
  for (var cx = X0 - 16; cx < X0 + 296; cx += 16) for (var cz = Z0 - 16; cz < Z0 + 96; cz += 16) {
    VB.q.push('fill ' + cx + ' ' + Y0 + ' ' + cz + ' ' + (cx + 15) + ' ' + (Y0 + 76) + ' ' + (cz + 15) + ' minecraft:air')
    VB.q.push('fill ' + cx + ' ' + (Y0 - 5) + ' ' + cz + ' ' + (cx + 15) + ' ' + (Y0 - 2) + ' ' + (cz + 15) + ' minecraft:dirt')
    VB.q.push('fill ' + cx + ' ' + (Y0 - 1) + ' ' + cz + ' ' + (cx + 15) + ' ' + (Y0 - 1) + ' ' + (cz + 15) + ' minecraft:grass_block')
  }
  GRAINE = 93; OX = X0; OY = Y0; OZ = Z0; CUT = 999; hbRue()
  lot(hbGrandMagasin, 0, 0, 999, 411, 32, 46); lot(hbImmeubles, 32, 0, 999, 421, 32, 46); lot(hbGare, 64, 0, 999, 431, 32, 26); lot(hbTheatre, 96, 0, 999, 441, 32, 32)
  lot(hbHalles, 0, 48, 999, 451, 32, 20); lot(hbHBM, 32, 48, 999, 461, 32, 50); lot(hbSquare, 64, 48, 999, 471, 32, 12); lot(hbBanque, 96, 48, 999, 481, 32, 17)
  lot(hbGrandMagasin, 144, 0, 13, 411, 32, 46); lot(hbImmeubles, 180, 0, 9, 421, 32, 46); lot(hbGare, 216, 0, 7, 431, 32, 26); lot(hbTheatre, 252, 0, 12, 441, 32, 32)
  lot(hbHalles, 144, 48, 6, 451, 32, 20); lot(hbHBM, 180, 48, 15, 461, 32, 50); lot(hbBanque, 216, 48, 6, 481, 32, 17)
  // gothique (envoye le 07/11) : gtRue() ; gtCathedrale 0/0, gtBeffroi 32/0, gtMaisons 64/0, gtCimetiere 96/0, gtHospice 0/48, gtBibliotheque 32/48, gtQuai 64/48, gtJardin 96/48 (graines 311..381) ; vues dans vuesGothique()
  // desert (envoye le 07/11) : dsRue() ; dsMission 0/0, dsMairie 32/0, dsSouk 64/0, dsPueblo 96/0, dsMotel 0/48, dsStation 32/48, dsSherif 64/48, dsOasis 96/48 (graines 211..281) ; vues dans vuesDesert()
  // bourg forestier (valide le 07/11) : bgRue() puis bgMairie 0/0, bgEglise 32/0, bgPlace 64/0, bgMaisons 96/0, bgCommerces 0/48, bgEcole 32/48, bgAuberge 64/48, bgScierie 96/48 ; vues dans vuesBourg()
  // atelierRouille 0/36, bidonvilleGrand 72/108, caserne 144/180/216 : voir vuesAncien2()
  // manoirGothique : lot(manoirGothique, 0, 0, 999, 91, 32, 41) + coupes 16, 10, 4 ; tourBureaux + coupes 29, 17, 4 ; vues dans vuesManoirTour()
  // chaletGrand : lot(chaletGrand, 0, 0, 999, 81, 32, 23) + coupes 10, 4 ; vues dans vuesChalet()
  // maisonsVille : lot(maisonsVille, 0, 0, 999, 33, 32, 23) + coupes 10, 4, 15 ; vues dans vuesMaisons()
  // hauss : lot(hauss, 0, 0, 999, 71, 32, 51) + coupes 16, 4, 40 ; vues dans vuesHauss()
  // lots precedents : villaModerne 0/56/112, grandeVilla 168, testOrient 172/38, grandHLM 216
}

// Usure : briques fendues, vitres cassees, toiles d'araignee, mousse
function user(lvl, L) {
  var BP = Java.loadClass('net.minecraft.core.BlockPos'), REG = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
  GRAINE = 5000 + (L.z - VB.Z0) * 7
  var cmds = []
  function id(x, y, z) { return '' + REG.BLOCK.getKey(lvl.getBlockState(new BP(x, y, z)).getBlock()) }
  function plein(x, y, z) { var st = lvl.getBlockState(new BP(x, y, z)); return st.isSolidRender(lvl, new BP(x, y, z)) }
  for (var x = L.x; x < L.x + L.w; x++) for (var z = L.z; z < L.z + L.w; z++) for (var y = VB.Y0; y <= VB.Y0 + L.h; y++) {
    var b = id(x, y, z), r = R(), c = x + ' ' + y + ' ' + z
    if (b == 'minecraft:bricks') { if (r < 0.05) cmds.push('setblock ' + c + ' createdeco:cracked_red_bricks'); else if (r < 0.08) cmds.push('setblock ' + c + ' createdeco:mossy_red_bricks') }
    else if (b == 'minecraft:stone_bricks') { if (r < 0.2) cmds.push('setblock ' + c + ' minecraft:cracked_stone_bricks'); else if (r < 0.35) cmds.push('setblock ' + c + ' minecraft:mossy_stone_bricks') }
    else if (b == 'minecraft:air' && y > VB.Y0) {
      if (plein(x, y + 1, z)) { var n = 0; if (plein(x + 1, y, z)) n++; if (plein(x - 1, y, z)) n++; if (plein(x, y, z + 1)) n++; if (plein(x, y, z - 1)) n++; if (n >= 2 && r < 0.3) cmds.push('setblock ' + c + ' minecraft:cobweb') }
      else if (plein(x, y - 1, z) && r < 0.025 && id(x, y - 1, z).indexOf('planks') >= 0) cmds.push('setblock ' + c + ' minecraft:moss_carpet')
    }
  }
  return cmds
}

function rafraichir(lvl, L) {
  var BP = Java.loadClass('net.minecraft.core.BlockPos'), Block = Java.loadClass('net.minecraft.world.level.block.Block'), n = 0
  for (var p = 0; p < 2; p++) for (var x = L.x - 1; x <= L.x + L.w; x++) for (var z = L.z - 1; z <= L.z + L.w + 1; z++) for (var y = VB.Y0 - 1; y <= VB.Y0 + L.h + 2; y++) {
    var pos = new BP(x, y, z), st = lvl.getBlockState(pos)
    if (st.isAir()) continue
    var ns = Block.updateFromNeighbourShapes(st, lvl, pos)
    if (ns != st) { if (ns.isAir()) vlog('AUDIT tombe ' + st.getBlock().getDescriptionId() + ' en ' + (x - L.x) + ' ' + (y - VB.Y0) + ' ' + (z - L.z)); lvl.setBlock(pos, ns, 18); n++ }
  }
  return n
}

// Controle automatique : trous dans les murs, blocs isoles, portes et lits incomplets, sieges face a un mur
function auditer(lvl, L) {
  var BP = Java.loadClass('net.minecraft.core.BlockPos'), REG = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
  var res = { trou: [], trou_sol: [], isole: [], porte: [], lit: [], siege: [] }
  function mur(x, y, z) { var s = st(x, y, z); return s.isSolidRender(lvl, new BP(x, y, z)) || /glass/.test(id(s)) }
  var D = { north: [0, -1], south: [0, 1], east: [1, 0], west: [-1, 0] }, FACE_CANAPE = { west: 'north', north: 'east', east: 'south', south: 'west' }
  function st(x, y, z) { return lvl.getBlockState(new BP(x, y, z)) }
  function plein(x, y, z) { return st(x, y, z).isSolidRender(lvl, new BP(x, y, z)) }
  function id(s) { return '' + REG.BLOCK.getKey(s.getBlock()) }
  function prop(s, p) { var m = ('' + s).match(new RegExp(p + '=(\\w+)')); return m ? m[1] : null }
  function note(k, x, y, z, t) { if (res[k].length < 400) res[k].push((x - L.x) + ',' + (y - VB.Y0) + ',' + (z - L.z) + (t ? ' ' + t : '')) }
  for (var x = L.x; x < L.x + L.w; x++) for (var z = L.z; z < L.z + L.w; z++) for (var y = VB.Y0; y <= VB.Y0 + L.h; y++) {
    var s = st(x, y, z)
    if (s.isAir()) {
      var V = mur(x, y - 1, z) && mur(x, y + 1, z)
      if (V && ((mur(x - 1, y, z) && mur(x + 1, y, z)) || (mur(x, y, z - 1) && mur(x, y, z + 1)))) note('trou', x, y, z)
      else if (mur(x - 1, y, z) && mur(x + 1, y, z) && mur(x, y, z - 1) && mur(x, y, z + 1) && (st(x, y - 1, z).isAir() || st(x, y + 1, z).isAir())) note('trou_sol', x, y, z)
      continue
    }
    var b = id(s)
    if (st(x + 1, y, z).isAir() && st(x - 1, y, z).isAir() && st(x, y, z + 1).isAir() && st(x, y, z - 1).isAir() && st(x, y + 1, z).isAir() && st(x, y - 1, z).isAir()) note('isole', x, y, z, b)
    if (/_door$/.test(b)) { var h = prop(s, 'half'), o = h == 'lower' ? st(x, y + 1, z) : st(x, y - 1, z); if (id(o) != b) note('porte', x, y, z, b) }
    if (/_bed$/.test(b)) { var f = prop(s, 'facing'), pt = prop(s, 'part'), d = D[f], k = pt == 'head' ? -1 : 1; if (id(st(x + k * d[0], y, z + k * d[1])) != b) note('lit', x, y, z, b) }
    if (/mcwfurnitures:.*(_chair|_couch)$/.test(b) && !/stool/.test(b)) {
      var f = prop(s, 'facing'), av = /_couch$/.test(b) ? FACE_CANAPE[f] : f, d = D[av]
      if (d && plein(x + d[0], y, z + d[1])) note('siege', x, y, z, b + ' regarde ' + av)
    }
  }
  var tot = 0; for (var k in res) { tot += res[k].length; if (res[k].length) vlog('AUDIT lot ' + L.x + ' ' + k + ' (' + res[k].length + ') : ' + res[k].slice(0, 60).join(' | ')) }
  return tot
}
function vue(nom, dx, dz, ex, ey, ez, tx, ty, tz, temps) { VB.vues.push({ nom: nom, ox: VB.X0 + dx, oz: VB.Z0 + dz, e: [ex, ey, ez], t: [tx, ty, tz], temps: temps }) }
function vuesDesert() {
  vue('ds_ensemble_sud', 0, 0, 64, 46, 110, 64, 4, 36, 3000)
  vue('ds_ensemble_no', 0, 0, -30, 40, -22, 60, 2, 36, 3000)
  vue('ds_bd_ouest', 0, 0, -8, 3.5, 38.5, 60, 4, 40)
  vue('ds_bd_est', 0, 0, 136, 3.5, 41.5, 60, 4, 40)
  vue('ds_mission', 0, 0, 14.5, 6, 44, 14.5, 10, 18)
  vue('ds_mission_patio', 0, 0, 29, 16, 30, 20, 1, 18)
  vue('ds_mairie', 0, 0, 48, 7, 45, 48, 8, 18)
  vue('ds_mairie_patio', 0, 0, 48, 18, 24, 48, 1, 12)
  vue('ds_souk', 0, 0, 80, 6, 46, 80, 6, 20)
  vue('ds_souk_halle', 0, 0, 87, 3, 23, 76, 1.5, 12)
  vue('ds_pueblo', 0, 0, 112, 10, 46, 112, 10, 14)
  vue('ds_pueblo_ouest', 0, 0, 88, 16, 36, 108, 8, 16)
  vue('ds_nef', 0, 0, 14.5, 2.8, 22.5, 14.5, 4, 6)
  vue('ds_guichets', 32, 0, 15.5, 2.6, 7.5, 9, 2, 5)
  vue('ds_conseil', 32, 0, 21.5, 8.6, 19.5, 13, 7.5, 18)
  vue('ds_echoppe', 64, 0, 9.5, 2.4, 9.5, 4, 1.2, 4)
  vue('ds_coupe_mission', 144, 0, 15, 26, 42, 15, 1, 15)
  vue('ds_coupe_mairie', 180, 0, 16, 26, 40, 15, 1, 12)
  vue('ds_coupe_pueblo', 216, 0, 16, 26, 42, 16, 6, 16)
  vue('ds_coupe_mairie_etage', 252, 0, 16, 28, 40, 15, 7, 12)
  vue('ds_rangee_sud', 0, 0, 64, 30, 110, 64, 0, 60, 3000)
  vue('ds_motel', 0, 48, 28, 9, -10, 12, 2, 14)
  vue('ds_motel_piscine', 0, 48, 30, 6, 8, 20, -2, 10)
  vue('ds_motel_chambre', 0, 48, 6.5, 2.6, 15.4, 3.5, 1.2, 12.5)
  vue('ds_station', 32, 48, 10, 8, -12, 14, 3, 8)
  vue('ds_superette', 32, 48, 28.5, 2.6, 10.5, 21, 1.5, 4)
  vue('ds_garage', 32, 48, 15.5, 4.5, 25.5, 7, 1.5, 17)
  vue('ds_diner', 32, 48, 24.5, 3.3, 25.5, 21, 1.2, 17)
  vue('ds_sherif', 64, 48, 16, 10, -14, 16, 5, 10)
  vue('ds_tribunal', 64, 48, 24, 6, 10, 24, 3, 23)
  vue('ds_oasis', 96, 48, 12, 14, -8, 14, 2, 16)
  vue('ds_chateau_eau', 96, 48, 14, 10, 14, 26, 17, 21)
  vue('ds_theatre', 96, 48, 19, 10, 27.5, 4, 1, 27.5)
  vue('ds_coupe_motel', 144, 48, 16, 26, 44, 16, 1, 14)
  vue('ds_coupe_station', 180, 48, 16, 26, 44, 16, 1, 14)
  vue('ds_coupe_sherif', 216, 48, 16, 28, 44, 16, 3, 14)
}function vuesBourg() {
  vue('bg_ensemble_sud', 0, 0, 64, 50, 118, 64, 4, 38, 3000)
  vue('bg_ensemble_ne', 0, 0, 150, 45, -24, 60, 2, 40, 3000)
  vue('bg_rue_ouest', 0, 0, -8, 3.5, 39.5, 60, 4, 40)
  vue('bg_rue_est', 0, 0, 136, 3.5, 40.5, 60, 4, 40)
  vue('bg_mairie', 0, 0, 16, 7, 45, 16, 9, 18)
  vue('bg_eglise', 0, 0, 47.5, 6, 46, 47.5, 16, 18)
  vue('bg_place', 0, 0, 80, 14, 44, 80, 1, 14)
  vue('bg_kiosque', 0, 0, 80, 4, 20, 70, 2, 6)
  vue('bg_maisons', 0, 0, 112, 6, 45, 112, 6, 16)
  vue('bg_commerces', 0, 0, 16, 5, 34, 16, 7, 56)
  vue('bg_ecole', 0, 0, 48, 6, 34, 48, 8, 56)
  vue('bg_auberge', 0, 0, 79, 7, 35, 78, 10, 58)
  vue('bg_scierie', 0, 0, 112, 9, 35, 110, 4, 66)
  vue('bg_arriere_sud', 0, 0, 64, 30, 112, 64, 5, 64)
  vue('bg_conseil', 0, 0, 9.5, 2.6, 21.5, 7, 1.5, 12)
  vue('bg_nef', 32, 0, 15.5, 2.8, 22.5, 15.5, 3, 4)
  vue('bg_classe', 32, 48, 10.5, 2.6, 7.5, 3, 2.5, 8)
  vue('bg_taverne', 64, 48, 13.5, 2.6, 10.5, 4, 2, 8)
  vue('bg_cafe', 0, 48, 23.5, 2.6, 11.5, 29, 2, 6)
  vue('bg_coupe_mairie', 144, 0, 16, 24, 42, 15, 1, 17)
  vue('bg_coupe_eglise', 180, 0, 16, 26, 42, 15, 1, 15)
  vue('bg_coupe_maisons', 216, 0, 16, 24, 42, 16, 1, 17)
  vue('bg_coupe_commerces', 144, 48, 16, 24, -10, 15, 1, 9)
  vue('bg_coupe_ecole', 180, 48, 16, 24, -10, 15, 1, 9)
  vue('bg_coupe_auberge', 216, 48, 15, 24, -9, 14, 1, 10)
  vue('bg_coupe_auberge_etage', 252, 48, 15, 28, -8, 14, 7, 10)
}function vuesManoirTour() {
  vue('go_rue', 0, 0, 16, 8, 40, 15, 12, 16)
  vue('go_trois_quarts', 0, 0, -14, 24, 46, 14, 14, 16, 3000)
  vue('go_parc', 0, 0, -10, 14, -8, 14, 10, 14)
  vue('go_porche', 0, 0, 11.5, 1.6, 28.5, 11.5, 3, 21)
  vue('go_salon', 0, 0, 18.5, 2.6, 20.3, 14.5, 1.5, 17.5)
  vue('go_coupe_2', 36, 0, 15, 34, 34, 15, 13, 15)
  vue('go_coupe_1', 72, 0, 15, 28, 34, 15, 7, 15)
  vue('go_coupe_rdc', 108, 0, 15, 22, 34, 15, 1, 15)
  vue('tb_rue', 144, 0, 16, 10, 52, 16, 24, 16)
  vue('tb_trois_quarts', 144, 0, -16, 40, 56, 16, 28, 14, 3000)
  vue('tb_atrium', 144, 0, 5.5, 2.8, 27.5, 20, 1.5, 24)
  vue('tb_hall', 144, 0, 22.5, 2.6, 21.5, 10, 1.5, 15)
  vue('tb_open_space', 144, 0, 23.5, 8.6, 21.5, 8, 7, 14)
  vue('tb_bureaux', 144, 0, 14.5, 14.6, 16, 20, 13, 20)
  vue('tb_terrasse', 144, 0, 8.5, 44.6, 21.5, 22, 45, 18)
  vue('tb_toit', 144, 0, 30, 70, 30, 15, 61, 10)
  vue('tb_coupe_4', 180, 0, 16, 50, 40, 16, 25, 14)
  vue('tb_coupe_2', 216, 0, 16, 38, 40, 16, 13, 14)
  vue('tb_coupe_rdc', 252, 0, 16, 26, 44, 16, 1, 20)
}
function vuesChalet() {
  vue('ch_rue', 0, 0, 16, 8, 50, 16, 7, 16)
  vue('ch_trois_quarts', 0, 0, -12, 20, 46, 16, 8, 16, 3000)
  vue('ch_nord', 0, 0, 34, 14, -14, 14, 6, 12)
  vue('ch_terrasse', 0, 0, 5.5, 1.6, 30.5, 16, 3, 25)
  vue('ch_salon', 0, 0, 12.5, 2.6, 21.5, 6, 1.5, 17.5)
  vue('ch_chambre', 0, 0, 12.5, 8.6, 21.5, 6, 7.5, 18)
  vue('ch_escalier', 0, 0, 25.5, 2.6, 12.5, 19, 4, 9.5)
  vue('ch_coupe_etage', 36, 0, 16, 32, 40, 16, 7, 16)
  vue('ch_coupe_rdc', 72, 0, 16, 30, 40, 16, 1, 16)
  vue('go_rue', 108, 0, 16, 10, 50, 15, 12, 16)
  vue('go_trois_quarts', 108, 0, 44, 24, 48, 16, 14, 16, 3000)
  vue('go_parc', 108, 0, -10, 14, -8, 14, 10, 14)
  vue('go_porche', 108, 0, 11.5, 1.6, 28.5, 11.5, 3, 21)
  vue('go_salon', 108, 0, 18.5, 2.6, 20.3, 14.5, 1.5, 17.5)
  vue('go_coupe_2', 144, 0, 16, 36, 44, 14, 13, 15)
  vue('go_coupe_1', 180, 0, 16, 30, 44, 14, 7, 15)
  vue('go_coupe_rdc', 216, 0, 16, 26, 44, 14, 1, 15)
}
function vuesMaisons() {
  vue('mv_rue', 0, 0, 16, 6, 46, 16, 6, 20)
  vue('mv_trois_quarts', 0, 0, -10, 18, 44, 14, 6, 18, 3000)
  vue('mv_jardins', 0, 0, 16, 18, -12, 16, 3, 8)
  vue('mv_jardin_b', 0, 0, 19.5, 4, 10.5, 13, 2, 4)
  vue('mv_salon_a', 0, 0, 8.5, 2.7, 21.5, 3.5, 1.5, 18)
  vue('mv_cuisine_b', 0, 0, 18.5, 2.7, 13.5, 13, 1.5, 15.5)
  vue('mv_coupe_etage', 40, 0, 16, 34, 40, 16, 7, 17)
  vue('mv_coupe_rdc', 80, 0, 16, 30, 40, 16, 1, 17)
  vue('mv_combles', 120, 0, 16, 34, 36, 16, 13, 17)
}
function vuesHauss() {
  vue('hauss_angle', 0, 0, 46, 22, 54, 16, 20, 16, 3000)
  vue('hauss_rue', 0, 0, 8, 4, 42, 16, 12, 29)
  vue('hauss_terrasse', 0, 0, 13, 3, 36, 5, 2, 30)
  vue('hauss_cour', 0, 0, 3, 16, 2, 15, 9, 16)
  vue('hauss_toit', 0, 0, 40, 58, 46, 20, 40, 18)
  vue('hauss_est', 0, 0, 46, 34, 4, 31, 22, 14)
  vue('hauss_cafe', 0, 0, 13.5, 2.6, 27.5, 4, 1.5, 21)
  vue('hauss_pharmacie', 0, 0, 29.5, 2.8, 26.3, 21, 1.5, 23)
  vue('hauss_coupe_etage', 40, 0, 16, 42, 46, 16, 13, 20)
  vue('hauss_etage_detail', 40, 0, 12, 24, 34, 10, 13, 23)
  vue('hauss_coupe_rdc', 80, 0, 16, 30, 44, 16, 1, 18)
  vue('hauss_combles', 120, 0, 16, 58, 42, 16, 37, 20)
}
function vuesModerne() {
  vue('moderne_trois_quarts', 0, 0, 64, 28, 54, 24, 4, 18, 3000)
  vue('moderne_portail', 0, 0, 8, 3, 60, 8, 3, 30)
  vue('moderne_piscine', 0, 0, 46, 5, 46, 28, 1, 31)
  vue('moderne_toit', 0, 0, 50, 24, 32, 32, 13, 14)
  vue('moderne_zen', 0, 0, 30, 9, -14, 30, 2, 6)
  vue('moderne_entree', 0, 0, -10, 8, 30, 12, 2, 20)
  vue('moderne_salon', 0, 0, 31, 3.2, 23.6, 31, 2, 17)
  vue('moderne_cuisine', 0, 0, 33, 2.6, 16.5, 30, 1.5, 12)
  vue('moderne_coupe_rdc', 56, 0, 24, 44, 46, 24, 0, 18)
  vue('moderne_rdc_detail', 56, 0, 30, 14, 30, 29, 1, 18)
  vue('moderne_coupe_etage', 112, 0, 33, 30, 34, 33, 7, 13)
  vue('moderne_etage_detail', 112, 0, 40, 16, 26, 38, 7, 12)
  vue('villa_portail_corrige', 168, 0, 15.5, 3, 35, 15.5, 3, 25)
  vue('test_orientations', 172, 38, 12, 9, 18, 12, 0, 7)
  vue('villa_trois_quarts', 168, 0, 44, 18, 50, 16, 6, 14)
  vue('villa_piscine', 168, 0, 31, 7, 34, 22, 0, 22)
  vue('hlm_trois_quarts', 216, 0, -22, 34, 70, 15, 28, 18, 3000)
  vue('hlm_pied', 216, 0, 22, 2.5, 38, 12, 9, 25)
}
function vuesAncien() {
  vue('hlm_trois_quarts', 0, 0, -22, 34, 70, 15, 28, 18, 3000)
  vue('hlm_pied', 0, 0, 22, 2.5, 38, 12, 9, 25)
  vue('hlm_coursives', 0, 0, 36, 22, -16, 14, 18, 12)
  vue('hlm_parking', 0, 0, 29, 7, -8, 14, 1, 7)
  vue('hlm_coupe', 80, 0, 15.5, 42, 34, 15.5, 7, 19)
  vue('hlm_coupe_detail', 80, 0, 5, 16, 30, 6, 7, 20)
  vue('hlm_facade', 0, 0, 16, 22, 52, 15, 26, 25)
  vue('villa_trois_quarts', 40, 0, 44, 18, 50, 16, 6, 14)
  vue('villa_portail', 40, 0, 15.5, 3, 38, 15.5, 6, 15)
  vue('villa_piscine', 40, 0, 31, 7, 34, 22, 0, 22)
  vue('villa_jardin', 40, 0, 5.5, 6, 31, 10, 3, 18)
  vue('villa_arriere', 40, 0, 36, 20, -12, 16, 8, 9)
  vue('villa_coupe_rdc', 120, 0, 15.5, 34, 30, 15.5, 1, 10)
  vue('villa_salon', 120, 0, 10, 14, 18, 12, 1, 9)
  vue('villa_coupe_etage', 160, 0, 15.5, 36, 30, 15.5, 7, 10)
  vue('villa_etage_detail', 160, 0, 16, 18, 20, 15, 7, 9)
  vue('rue_ensemble', 0, 0, -14, 40, 72, 60, 10, 16)
}
ServerEvents.tick(event => {
  var server = event.server
  if (server.players.size() == 0) return
  VB.t++
  var lvl = server.overworld()
  if (VB.etape == 0 && VB.t == 200) {
    VB.X0 = 24000; VB.Z0 = 24000
    server.runCommandSilent('gamerule doMobSpawning false'); server.runCommandSilent('gamerule doDaylightCycle false'); server.runCommandSilent('gamerule doWeatherCycle false')
    server.runCommandSilent('weather clear'); server.runCommandSilent('time set 3000'); server.runCommandSilent('gamemode spectator @a')
    server.runCommandSilent('forceload add ' + (VB.X0 - 16) + ' ' + (VB.Z0 - 16) + ' ' + (VB.X0 + 295) + ' ' + (VB.Z0 + 95))
    server.runCommandSilent('tp @a ' + (VB.X0 + 40) + ' ' + 200 + ' ' + (VB.Z0 + 30))
    VB.etape = 1; VB.att = VB.t + 200
  }
  if (VB.etape == 1 && VB.t >= VB.att) {
    var HT = Java.loadClass('net.minecraft.world.level.levelgen.Heightmap$Types'), hs = []
    for (var i = 0; i < 9; i++) { var x = VB.X0 + (i % 3) * 40, z = VB.Z0 + Math.floor(i / 3) * 25; lvl.getChunk(x >> 4, z >> 4); hs.push(lvl.getHeight(HT.WORLD_SURFACE, x, z)) }
    hs.sort((a, b) => a - b); VB.Y0 = Math.max(70, Math.min(140, hs[4]))
    vlog('sol retenu ' + VB.Y0 + ' (echantillons ' + hs.join(',') + ')')
    preparer(server); vlog('commandes ' + VB.q.length)
    var BSP = Java.loadClass('net.minecraft.commands.arguments.blocks.BlockStateParser'), REGB = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries'), vus = {}
    VB.q.forEach(c => { var p = c.split(' '), b = c.indexOf(' replace ') > 0 ? p[p.length - 3] : (p[0] == 'fill' ? p.slice(7).join(' ') : p.slice(4).join(' ')); if (vus[b]) return; vus[b] = 1; try { BSP.parseForBlock(REGB.BLOCK.asLookup(), b, true) } catch (e) { vlog('BLOC INVALIDE ' + b + ' : ' + e) } })
    VB.etape = 2
  }
  if (VB.etape == 2) {
    for (var k = 0; k < 250 && VB.qi < VB.q.length; k++, VB.qi++) {
      var cmd = VB.q[VB.qi], r = server.runCommandSilent(cmd)
      if (r == 0 && cmd.indexOf('air') < 0 && cmd.indexOf('replace') < 0) { var b = cmd.split(' ').slice(-1)[0]; if (!VB.echecs[b]) { VB.echecs[b] = 1; VB.nEchecs++; if (VB.nEchecs < 60) vlog('echec ' + cmd) } }
    }
    if (VB.qi >= VB.q.length) { vlog('construction finie, echecs ' + VB.nEchecs); VB.etape = 3; VB.li = 0 }
  }
  if (VB.etape == 3) {
    if (VB.li < VB.lots.length) { var cm = user(lvl, VB.lots[VB.li]); cm.forEach(c => server.runCommandSilent(c)); vlog('usure lot ' + VB.li + ' : ' + cm.length); VB.li++ }
    else { VB.etape = 4; VB.li = 0 }
  }
  if (VB.etape == 4) {
    if (VB.li < VB.lots.length) { vlog('raccords lot ' + VB.li + ' : ' + rafraichir(lvl, VB.lots[VB.li])); vlog('audit lot ' + VB.li + ' : ' + auditer(lvl, VB.lots[VB.li])); VB.li++ }
    else { server.runCommandSilent('kill @e[type=!minecraft:player]'); vuesHauss2(); VB.etape = 5; VB.vi = 0; VB.att = VB.t + 60 }
  }
  if (VB.etape == 5 && VB.t >= VB.att) {
    if (VB.vi >= VB.vues.length) { vlog('fin des vues'); console.info('[TEST BUGS] fin'); VB.etape = 6; return }
    var v = VB.vues[VB.vi]
    if (v.temps) server.runCommandSilent('time set ' + v.temps)
    var ex = v.ox + v.e[0], ey = VB.Y0 + v.e[1], ez = v.oz + v.e[2], tx = v.ox + v.t[0], ty = VB.Y0 + v.t[1], tz = v.oz + v.t[2]
    var dx = tx - ex, dy = ty - ey, dz = tz - ez
    var yaw = Math.atan2(-dx, dz) * 180 / Math.PI, pitch = -Math.atan2(dy, Math.sqrt(dx * dx + dz * dz)) * 180 / Math.PI
    server.runCommandSilent('kill @e[type=!minecraft:player]')
    server.runCommandSilent('tp @a ' + ex.toFixed(2) + ' ' + (ey - 1.62).toFixed(2) + ' ' + ez.toFixed(2) + ' ' + yaw.toFixed(1) + ' ' + pitch.toFixed(1))
    vlog('vue ' + (VB.vi + 1) + ' ' + v.nom + ' pos=' + Math.floor(ex) + ' ' + Math.floor(ey) + ' ' + Math.floor(ez))
    VB.vi++; VB.att = VB.t + (VB.vi == 1 ? 400 : 220)
  }
})


// ================= OUTILS D'AMENAGEMENT =================
function choix(l) { return l[Math.floor(R() * l.length)] }
var COULS = ['white', 'light_gray', 'gray', 'brown', 'blue', 'cyan', 'green', 'red', 'orange', 'yellow', 'lime', 'light_blue', 'purple', 'pink', 'black']
var BOIS = ['spruce', 'oak', 'birch', 'dark_oak', 'stripped_spruce', 'stripped_oak']
var CANAPES = ['gray', 'brown', 'black', 'white', 'light_gray', 'red', 'blue', 'green']

// Tour d'escalier exterieure (x..x+1, z0..z0+4), ouverte au sud sur les coursives
function tour(x, z0, nb, mur) {
  var H = 6 * nb + 3, DS = 'minecraft:stone_brick_stairs', VI = 'minecraft:light_gray_stained_glass'
  F(x - 1, 0, z0 - 1, x - 1, H, z0 + 4, mur); F(x + 2, 0, z0 - 1, x + 2, H, z0 + 4, mur); F(x, 0, z0 - 1, x + 1, H, z0 - 1, mur)
  for (var f = 0; f <= nb; f++) {
    var yb = 6 * f
    F(x, yb, z0, x + 1, yb, z0 + 4, 'minecraft:polished_andesite')
    if (f < nb) { F(x - 1, yb + 2, z0 + 1, x - 1, yb + 4, z0 + 2, VI); F(x + 2, yb + 2, z0 + 1, x + 2, yb + 4, z0 + 2, VI); F(x, yb + 2, z0 - 1, x + 1, yb + 4, z0 - 1, VI); S(x + 1, yb + 5, z0 + 4, 'minecraft:lantern[hanging=true]') }
  }
  for (var f = 0; f < nb; f++) {
    var yb = 6 * f
    S(x + 1, yb + 1, z0 + 3, DS + '[facing=north,half=bottom,shape=straight]'); S(x + 1, yb + 2, z0 + 2, DS + '[facing=north,half=bottom,shape=straight]'); S(x + 1, yb + 3, z0 + 1, DS + '[facing=north,half=bottom,shape=straight]')
    F(x, yb + 3, z0, x + 1, yb + 3, z0, 'minecraft:stone_bricks')
    F(x, yb + 6, z0, x + 1, yb + 6, z0 + 2, AIR)
    S(x, yb + 4, z0 + 1, DS + '[facing=south,half=bottom,shape=straight]'); S(x, yb + 5, z0 + 2, DS + '[facing=south,half=bottom,shape=straight]'); S(x, yb + 6, z0 + 3, DS + '[facing=south,half=bottom,shape=straight]')
  }
  F(x - 1, H + 1, z0 - 1, x + 2, H + 1, z0 + 4, 'minecraft:smooth_stone_slab[type=bottom]')
}

// Logement de 6 x 10 (a..a+5, z1..z1+9). Entree au nord en (a+2, z1-1) depuis la coursive.
function logement(a, z1, y, mur, etat) {
  var w = choix(BOIS), b = w.replace('stripped_', ''), sol = choix(['minecraft:oak_planks', 'minecraft:spruce_planks', 'minecraft:birch_planks', 'minecraft:light_gray_terracotta', 'minecraft:white_terracotta', 'minecraft:dark_oak_planks'])
  F(a, y, z1, a + 5, y, z1 + 9, sol)
  F(a + 3, y + 1, z1, a + 3, y + 5, z1 + 4, mur); F(a + 4, y + 1, z1 + 4, a + 5, y + 5, z1 + 4, mur); F(a, y + 1, z1 + 5, a + 5, y + 5, z1 + 5, mur); F(a + 3, y + 1, z1 + 6, a + 3, y + 5, z1 + 9, mur)
  PORTE(a + 1, y + 1, z1 + 5, 'minecraft:' + b + '_door', 'south', 'left', R() < 0.5 ? 'true' : 'false')
  PORTE(a + 3, y + 1, z1 + 7, 'minecraft:' + b + '_door', 'east', 'left', R() < 0.5 ? 'true' : 'false')
  PORTE(a + 3, y + 1, z1 + 2, 'minecraft:birch_door', 'east', 'right', 'false')
  // cuisine
  S(a, y + 1, z1, MAT(w + '_counter', 'south')); S(a + 1, y + 1, z1, 'mcwfurnitures:' + w + '_kitchen_sink[facing=south,water=false]')
  S(a, y + 3, z1, 'mcwfurnitures:' + w + '_kitchen_cabinet[facing=south,hinge=left]'); S(a + 1, y + 3, z1, 'mcwfurnitures:' + w + '_kitchen_cabinet[facing=south,hinge=right]')
  S(a, y + 1, z1 + 1, R() < 0.6 ? 'farmersdelight:stove[facing=east,lit=false]' : 'minecraft:furnace[facing=east,lit=false]'); S(a, y + 1, z1 + 3, 'minecraft:iron_block'); S(a, y + 2, z1 + 3, 'minecraft:iron_block')
  S(a + 1, y + 1, z1 + 2, 'mcwfurnitures:' + w + '_table'); S(a, y + 1, z1 + 2, MAT(w + '_chair', 'east')); S(a + 1, y + 1, z1 + 3, MAT(w + '_chair', 'north')); S(a + 1, y + 5, z1 + 2, 'minecraft:lantern[hanging=true]')
  S(a, y + 2, z1, choix(['farmersdelight:cutting_board[facing=south]', 'supplementaries:jar', 'minecraft:flower_pot', 'minecraft:air']))
  // salle de bain
  F(a + 4, y, z1, a + 5, y, z1 + 3, (a + y) % 12 ? 'minecraft:smooth_quartz' : 'minecraft:light_blue_terracotta')
  S(a + 4, y + 1, z1, 'minecraft:water_cauldron[level=' + (1 + Math.floor(R() * 3)) + ']'); S(a + 5, y + 1, z1, 'minecraft:quartz_stairs[facing=south,half=bottom,shape=straight]'); S(a + 5, y + 2, z1, 'minecraft:quartz_slab[type=bottom]')
  S(a + 4, y + 1, z1 + 3, 'minecraft:water_cauldron[level=3]'); S(a + 5, y + 1, z1 + 3, 'minecraft:water_cauldron[level=' + (R() < 0.5 ? 2 : 3) + ']'); S(a + 5, y + 4, z1 + 2, 'minecraft:end_rod[facing=down]')
  // sejour
  F(a + 1, y + 1, z1 + 6, a + 1, y + 1, z1 + 9, 'minecraft:' + choix(COULS) + '_carpet')
  var cp = choix(CANAPES); S(a, y + 1, z1 + 7, 'mcwfurnitures:' + cp + '_couch[facing=east,shape=single]'); S(a, y + 1, z1 + 8, 'mcwfurnitures:' + cp + '_couch[facing=east,shape=single]')
  S(a, y + 1, z1 + 6, 'mcwfurnitures:' + w + '_end_table'); S(a, y + 2, z1 + 6, choix(['minecraft:candle[candles=2,lit=false]', 'minecraft:potted_cactus', 'minecraft:air']))
  S(a, y + 1, z1 + 9, choix(['minecraft:potted_fern', 'minecraft:potted_bamboo', 'minecraft:bookshelf', 'mcwfurnitures:' + cp + '_couch[facing=east,shape=single]']))
  S(a + 2, y + 1, z1 + 8, MAT(w + '_drawer', 'west')); S(a + 2, y + 2, z1 + 8, 'minecraft:black_stained_glass_pane')
  S(a + 2, y + 1, z1 + 6, choix(['minecraft:bookshelf', 'minecraft:barrel[facing=up,open=false]', 'minecraft:potted_azalea_bush'])); S(a + 2, y + 1, z1 + 9, choix(['minecraft:potted_fern', 'minecraft:decorated_pot', 'minecraft:air']))
  S(a + 1, y + 5, z1 + 7, R() < 0.5 ? 'minecraft:lantern[hanging=true]' : 'mcwlights:iron_chandelier')
  // chambre
  var lit = choix(COULS); S(a + 5, y + 1, z1 + 8, 'minecraft:' + lit + '_bed[facing=south,part=head]'); S(a + 5, y + 1, z1 + 7, 'minecraft:' + lit + '_bed[facing=south,part=foot]')
  S(a + 5, y + 1, z1 + 9, 'mcwfurnitures:' + w + '_end_table'); S(a + 5, y + 2, z1 + 9, 'minecraft:candle[candles=1,lit=false]')
  S(a + 5, y + 1, z1 + 6, 'mcwfurnitures:' + w + '_wardrobe[facing=west,connection=base,hinge=left]')
  S(a + 4, y + 1, z1 + 9, choix(['minecraft:chest[facing=north]', 'minecraft:bookshelf', 'minecraft:barrel[facing=up,open=false]'])); S(a + 4, y + 1, z1 + 8, 'minecraft:' + lit + '_carpet')
  S(a + 4, y + 1, z1 + 6, choix(['minecraft:potted_poppy', 'minecraft:chest[facing=east]', 'minecraft:air']))
  // etat : 1 = pille, 2 = squat barricade
  if (etat == 1) { S(a, y + 1, z1 + 7, AIR); S(a + 1, y + 1, z1 + 8, 'supplementaries:sack'); S(a + 2, y + 1, z1 + 4, 'minecraft:barrel[facing=east,open=true]'); S(a + 1, y + 1, z1 + 1, 'minecraft:white_carpet'); S(a + 1, y + 1, z1 + 2, AIR) }
  if (etat == 2) { F(a + 1, y + 1, z1 + 6, a + 1, y + 1, z1 + 7, 'supplementaries:sack'); S(a + 2, y + 1, z1 + 9, 'minecraft:barrel[facing=up,open=false]'); S(a + 2, y + 1, z1 + 6, 'minecraft:crafting_table'); S(a + 4, y + 1, z1 + 8, 'minecraft:white_carpet') }
}

// ================= GRAND ENSEMBLE HLM (2 x 2 chunks, R+9, 36 logements) =================
function grandHLM() {
  var WC = 'minecraft:white_concrete', LG = 'minecraft:light_gray_concrete', GC = 'minecraft:gray_concrete', VP = 'minecraft:gray_stained_glass_pane', RL = 'mcwfences:panelled_metal_fence', NB = 10
  var X1 = 1, X2 = 29, ZN = 14, ZS = 25, YT = 6 * NB, BL = [2, 9, 16, 23]
  F(0, -1, 0, 31, -1, 31, 'minecraft:grass_block')
  // parking, aire de jeux, conteneurs (arriere)
  F(0, -1, 0, 31, -1, 11, GC); F(0, -1, 12, 31, -1, 13, 'minecraft:smooth_stone')
  for (var x = 2; x <= 29; x += 3) { if (x > 10 && x < 17) continue; F(x, -1, 0, x, -1, 4, WC); if (x < 19) F(x, -1, 7, x, -1, 10, WC) }
  for (var x = 0; x <= 31; x++) for (var z = 0; z <= 11; z++) if (R() < 0.06) S(x, -1, z, choix(['minecraft:andesite', 'minecraft:coarse_dirt', 'minecraft:cobblestone']))
  function voiture(x, z, c, brulee) {
    F(x, 0, z, x + 1, 0, z + 3, brulee ? 'minecraft:black_concrete' : 'minecraft:' + c + '_concrete'); F(x, 1, z + 1, x + 1, 1, z + 2, brulee ? 'minecraft:coal_block' : 'minecraft:tinted_glass')
    var sl = 'minecraft:' + (brulee ? 'blackstone' : 'smooth_stone') + '_slab[type=bottom]'; S(x, 1, z, sl); S(x + 1, 1, z, sl); S(x, 1, z + 3, sl); S(x + 1, 1, z + 3, sl)
    if (brulee) { S(x, 2, z + 1, 'minecraft:cobweb'); SA(x + 2, 0, z + 1, 'minecraft:gray_carpet') }
  }
  voiture(3, 1, 'red', false); voiture(9, 1, 'white', true); voiture(18, 1, 'blue', false); voiture(24, 0, 'light_gray', false); voiture(5, 7, 'black', true); voiture(27, 7, 'white', false)
  F(20, -1, 7, 25, -1, 10, 'minecraft:sand'); F(21, 0, 8, 21, 2, 8, 'minecraft:iron_bars'); F(24, 0, 8, 24, 2, 8, 'minecraft:iron_bars'); F(21, 3, 8, 24, 3, 8, 'minecraft:iron_bars')
  S(22, 2, 8, 'minecraft:chain[axis=y]'); S(22, 1, 8, 'minecraft:oak_slab[type=top]'); S(23, 2, 8, 'minecraft:chain[axis=y]'); S(23, 1, 8, 'minecraft:oak_slab[type=top]')
  F(25, 0, 10, 25, 1, 10, 'minecraft:quartz_block'); S(25, 2, 10, 'minecraft:iron_bars'); S(24, 0, 10, 'minecraft:quartz_stairs[facing=east,half=bottom,shape=straight]'); S(20, 0, 10, MAT('oak_chair', 'north'))
  F(0, 0, 5, 0, 0, 9, 'minecraft:green_shulker_box'); S(0, 0, 10, 'minecraft:gray_shulker_box'); S(1, 0, 6, 'supplementaries:sack'); S(1, 0, 9, 'supplementaries:sack'); S(1, 0, 8, 'minecraft:white_carpet')
  // structure de la barre
  F(X1, 0, ZN, X2, 0, ZS, GC); W(X1, ZN, X2, ZS, 1, YT - 1, WC)
  for (var f = 1; f < NB; f++) { var y = 6 * f; F(X1 + 1, y, ZN + 1, X2 - 1, y, ZS - 1, 'minecraft:smooth_stone'); F(X1, y, ZN, X2, y, ZN, GC); F(X1, y, ZS, X2, y, ZS, GC) }
  ;[8, 15, 22].forEach(x => F(x, 1, ZN + 1, x, YT - 1, ZS - 1, WC))
  ;[X1, 8, 15, 22, X2].forEach(x => { F(x, 1, ZS, x, YT - 1, ZS, LG); F(x, 1, ZN, x, YT - 1, ZN, LG); F(x, 1, 12, x, YT - 1, 12, LG) })
  F(X1 - 1, YT, ZN - 3, X2 + 1, YT, ZS + 1, 'minecraft:smooth_stone_slab[type=top]'); F(X1, YT, ZN, X2, YT, ZS, GC); W(X1, ZN, X2, ZS, YT + 1, YT + 1, LG)
  // tour d'escalier et coursives au nord
  tour(13, 7, NB, LG)
  for (var f = 1; f < NB; f++) {
    var y = 6 * f
    F(X1, y, 12, X2, y, 13, 'minecraft:smooth_stone_slab[type=top]'); F(X1 + 1, y + 1, 12, X2 - 1, y + 1, 12, RL); S(X1, y + 1, 13, RL); S(X2, y + 1, 13, RL); F(13, y + 1, 12, 14, y + 1, 12, AIR)
    F(X1, y - 1, 12, X2, y - 1, 12, LG); F(13, y - 1, 12, 14, y - 1, 12, AIR)
  }
  // logements : 4 par etage sur 9 etages
  for (var f = 1; f < NB; f++) BL.forEach((a, i) => {
    var y = 6 * f, etat = R() < 0.22 ? 1 : (R() < 0.15 ? 2 : 0), c = choix(['cyan_terracotta', 'orange_terracotta', 'yellow_terracotta', 'light_blue_terracotta', 'red_terracotta', 'lime_terracotta'])
    logement(a, ZN + 1, y, WC, etat)
    // facade nord : porte palliere, fenetres, paillasson, plantes
    PORTE(a + 2, y + 1, ZN, 'mcwdoors:metal_door', 'north', i % 2 ? 'left' : 'right', 'false'); F(a, y + 2, ZN, a + 1, y + 3, ZN, VP); S(a + 5, y + 3, ZN, VP); S(a + 4, y + 3, ZN, VP)
    S(a + 2, y + 1, 13, 'minecraft:' + choix(['brown', 'gray', 'red', 'black', 'green']) + '_carpet')
    if (R() < 0.6) S(a + 4, y + 1, 13, choix(['minecraft:potted_fern', 'minecraft:decorated_pot', 'minecraft:barrel[facing=up,open=false]', 'supplementaries:sack', 'minecraft:potted_dead_bush']))
    if (R() < 0.3) S(a, y + 1, 13, choix(['minecraft:cauldron', 'minecraft:composter', 'minecraft:oak_trapdoor[facing=south,half=bottom,open=true]']))
    // facade sud : porte-fenetre, balcon en saillie ou loggia, fenetre de chambre
    F(a, y + 2, ZS, a + 2, y + 3, ZS, VP); PORTE(a + 1, y + 1, ZS, 'mcwdoors:metal_door', 'south', 'left', 'false'); F(a + 4, y + 2, ZS, a + 5, y + 3, ZS, VP)
    if ((f + i) % 2 == 0) {
      F(a - 1, y, ZS + 1, a + 3, y, ZS + 2, 'minecraft:smooth_stone_slab[type=top]'); F(a, y + 1, ZS + 2, a + 2, y + 1, ZS + 2, RL); S(a + 3, y + 1, ZS + 1, RL); S(a + 3, y + 1, ZS + 2, RL)
      F(a - 1, y + 1, ZS + 1, a - 1, y + 3, ZS + 2, 'minecraft:' + c); S(a - 1, y + 4, ZS + 1, 'minecraft:' + c)
      if (R() < 0.5) S(a, y + 1, ZS + 1, choix(['minecraft:potted_fern', 'minecraft:barrel[facing=up,open=false]', 'minecraft:decorated_pot', MAT('spruce_chair', 'south'), 'minecraft:composter']))
      if (R() < 0.4) S(a + 1, y, ZS + 3, 'minecraft:' + choix(['white', 'red', 'blue', 'yellow', 'pink', 'light_gray']) + '_wall_banner[facing=south]')
    } else {
      F(a, y + 1, ZS + 1, a + 2, y + 1, ZS + 1, RL); F(a - 1, y + 1, ZS + 1, a - 1, y + 4, ZS + 1, 'minecraft:' + c); F(a - 1, y + 5, ZS + 1, a + 3, y + 5, ZS + 1, 'minecraft:smooth_stone_slab[type=top]')
      if (R() < 0.5) S(a + 1, y + 5, ZS + 2, 'minecraft:' + choix(['white', 'light_blue', 'pink', 'yellow']) + '_wall_banner[facing=south]')
    }
    if (R() < 0.35) { S(a + 5, y + 2, ZS + 1, 'minecraft:smooth_stone'); S(a + 5, y + 3, ZS + 1, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false]') }
    if (R() < 0.25) { S(a + 4, y + 4, ZS + 1, 'minecraft:iron_trapdoor[facing=south,half=bottom,open=true]'); S(a + 4, y + 5, ZS + 1, 'minecraft:lightning_rod[facing=south]') }
    if (etat == 2) { F(a, y + 2, ZS, a, y + 3, ZS, 'minecraft:spruce_planks'); F(a + 2, y + 2, ZS, a + 2, y + 3, ZS, 'minecraft:spruce_planks'); S(a + 4, y + 2, ZS, 'minecraft:spruce_trapdoor[facing=north,half=bottom,open=true]'); S(a + 5, y + 3, ZS, 'minecraft:oak_planks') }
  })
  // rez-de-chaussee : boulangerie, hall d'entree, kebab, superette pillee (sans enseigne)
  var stores = ['red', 'green', 'blue', 'orange']
  ;[2, 9, 16, 23].forEach((s, i) => {
    F(s, 0, ZN + 1, s + 5, 0, ZS - 1, i % 2 ? 'minecraft:white_terracotta' : 'minecraft:light_gray_terracotta')
    F(s, 1, ZS, s + 5, 4, ZS, AIR); F(s, 1, ZS, s + 5, 1, ZS, 'minecraft:black_concrete'); F(s, 2, ZS, s + 5, 3, ZS, 'minecraft:glass_pane'); F(s, 4, ZS, s + 5, 4, ZS, LG)
    if (i == 1) { F(s + 2, 1, ZS, s + 3, 3, ZS, AIR); PORTE(s + 2, 1, ZS, 'mcwdoors:metal_door', 'south', 'left', 'false'); PORTE(s + 3, 1, ZS, 'mcwdoors:metal_door', 'south', 'right', 'false'); F(s + 1, 4, ZS + 1, s + 4, 4, ZS + 1, 'minecraft:smooth_stone_slab[type=bottom]') }
    else { PORTE(s + 1, 1, ZS, 'mcwdoors:metal_door', 'south', 'left', 'false'); F(s, 4, ZS + 1, s + 5, 4, ZS + 1, 'supplementaries:awning_' + stores[i] + '[facing=south]'); F(s, 1, 19, s + 5, 5, 19, WC); PORTE(s + 4, 1, 19, 'minecraft:spruce_door', 'south', 'left', 'false') }
  })
  // boulangerie
  F(3, 1, 22, 6, 1, 22, MAT('stripped_spruce_counter', 'south')); S(4, 2, 22, 'farmersdelight:cutting_board[facing=south]'); S(5, 2, 22, 'supplementaries:jar'); S(2, 1, 20, 'minecraft:smoker[facing=south,lit=false]'); S(7, 1, 20, 'minecraft:smoker[facing=south,lit=false]')
  F(3, 1, 20, 6, 1, 20, 'minecraft:barrel[facing=up,open=false]'); F(3, 2, 20, 6, 2, 20, 'minecraft:spruce_trapdoor[facing=south,half=bottom,open=true]'); S(2, 1, 24, 'minecraft:potted_bamboo')
  F(2, 1, 15, 7, 1, 15, 'supplementaries:sack'); S(3, 1, 17, 'minecraft:barrel[facing=up,open=false]'); S(6, 1, 16, 'minecraft:crafting_table')
  // hall d'entree : boites aux lettres, banc, porte vers la coursive
  F(9, 0, 15, 14, 0, 24, 'minecraft:polished_andesite'); F(9, 2, 17, 9, 3, 22, 'minecraft:iron_trapdoor[facing=east,half=bottom,open=true]'); F(14, 1, 19, 14, 1, 21, 'mcwfurnitures:gray_couch[facing=west,shape=single]')
  PORTE(11, 1, ZN, 'mcwdoors:metal_door', 'north', 'left', 'false'); PORTE(12, 1, ZN, 'mcwdoors:metal_door', 'north', 'right', 'false'); S(13, 1, 16, 'minecraft:potted_dead_bush'); S(10, 1, 23, 'minecraft:potted_fern')
  // kebab
  F(17, 1, 21, 20, 1, 21, MAT('stripped_oak_counter', 'south')); S(18, 2, 21, 'farmersdelight:cooking_pot'); S(20, 1, 20, 'farmersdelight:stove[facing=south,lit=false]')
  S(17, 1, 23, 'mcwfurnitures:oak_table'); S(16, 1, 23, MAT('oak_chair', 'east')); S(20, 1, 23, 'mcwfurnitures:oak_table'); S(21, 1, 23, MAT('oak_chair', 'west')); S(19, 1, 23, MAT('oak_chair', 'east'))
  // superette pillee
  ;[21, 23].forEach(z => F(24, 1, z, 27, 2, z, 'minecraft:chiseled_bookshelf[facing=south]')); S(26, 1, 22, 'minecraft:barrel[facing=east,open=true]'); S(25, 1, 24, 'supplementaries:sack'); S(27, 1, 24, 'minecraft:white_carpet'); S(28, 1, 22, 'supplementaries:sack')
  F(23, 2, ZS + 1, 28, 3, ZS + 1, 'minecraft:iron_trapdoor[facing=south,half=bottom,open=true]'); F(25, 2, ZS + 1, 26, 3, ZS + 1, AIR)
  ;[[4, 22], [11, 20], [18, 23], [26, 22]].forEach(c => S(c[0], 5, c[1], 'minecraft:lantern[hanging=true]'))
  // toit : local technique, antennes, paraboles
  ;[4, 19, 26].forEach(x => { F(x, YT + 1, 22, x, YT + 4, 22, 'minecraft:iron_bars'); S(x, YT + 5, 22, 'minecraft:lightning_rod') })
  ;[3, 10, 20, 25].forEach(x => { S(x, YT + 1, 17, 'minecraft:iron_block'); S(x, YT + 2, 17, 'minecraft:daylight_detector') })
  F(6, YT + 1, 19, 9, YT + 3, 22, LG); F(6, YT + 4, 19, 9, YT + 4, 22, 'minecraft:smooth_stone_slab[type=bottom]'); PORTE(7, YT + 1, 19, 'mcwdoors:metal_door', 'north', 'left', 'false')
  // parvis : arbres, bancs, abribus
  F(0, -1, 26, 31, -1, 31, 'minecraft:smooth_stone'); for (var x = 0; x <= 31; x++) if (x % 4 == 0) S(x, -1, 29, 'minecraft:polished_andesite')
  ;[3, 18, 27].forEach(x => { S(x, -1, 29, 'minecraft:coarse_dirt'); F(x, 0, 29, x, 4, 29, 'minecraft:oak_log[axis=y]'); for (var dx = -2; dx <= 2; dx++) for (var dz = -2; dz <= 2; dz++) for (var y = 4; y <= 7; y++) if (Math.abs(dx) + Math.abs(dz) + Math.abs(y - 5.5) < 3.6 && (Math.abs(dx) + Math.abs(dz) <= 1 || R() < 0.85)) SA(x + dx, y, 29 + dz, 'minecraft:oak_leaves[persistent=true]') })
  ;[6, 22].forEach(x => { S(x, 0, 30, MAT('oak_chair', 'south')); S(x + 1, 0, 30, MAT('oak_chair', 'south')); S(x + 2, 0, 30, 'minecraft:cauldron') })
  F(10, 0, 31, 10, 3, 31, 'minecraft:iron_bars'); F(14, 0, 31, 14, 3, 31, 'minecraft:iron_bars'); F(10, 4, 30, 14, 4, 31, 'minecraft:smooth_stone_slab[type=bottom]'); F(11, 0, 30, 13, 3, 30, 'minecraft:glass_pane'); F(10, 0, 30, 10, 3, 30, 'minecraft:iron_bars'); F(14, 0, 30, 14, 3, 30, 'minecraft:iron_bars'); F(11, 0, 31, 13, 0, 31, 'mcwfurnitures:gray_couch[facing=south,shape=single]')
  S(15, 0, 30, 'mcwlights:garden_light')
  for (var x = 0; x <= 31; x++) for (var z = 26; z <= 31; z++) if (R() < 0.05) SA(x, 0, z, choix(['minecraft:gray_carpet', 'supplementaries:sack', 'minecraft:white_carpet']))
}

// ================= GRANDE VILLA (2 x 2 chunks) =================
function grandeVilla() {
  var WT = 'minecraft:white_terracotta', SS = 'minecraft:smooth_sandstone', CS = 'minecraft:cut_sandstone', QP = 'minecraft:quartz_pillar', VO = 'minecraft:warped_trapdoor', TU = f => TOIT(f, 'orange_terracotta'), SL = 'minecraft:smooth_sandstone_slab'
  function croupe(x1, z1, x2, z2, y0) {
    for (var k = 0; k < 14; k++) {
      var a = x1 + k, b = x2 - k, c = z1 + k, d = z2 - k, y = y0 + k
      if (b - a < 1 || d - c < 1) { if (b >= a && d >= c) F(a, y, c, b, y, d, 'minecraft:granite_slab[type=bottom]'); break }
      F(a, y, c, b, y, c, TU('south')); F(a, y, d, b, y, d, TU('north')); F(a, y, c + 1, a, y, d - 1, TU('east')); F(b, y, c + 1, b, y, d - 1, TU('west'))
    }
  }
  function volets(x, y, z) { [x - 1, x + 1].forEach(v => { S(v, y, z, VO + '[facing=south,half=bottom,open=true]'); S(v, y + 1, z, VO + '[facing=south,half=bottom,open=true]') }) }
  F(0, -1, 0, 31, -1, 31, 'minecraft:grass_block')
  // mur d'enceinte, piliers, portail entrouvert
  W(0, 0, 31, 31, 0, 1, 'minecraft:sandstone_wall'); for (var i = 0; i <= 31; i += 5) { F(i, 0, 31, i, 2, 31, CS); S(i, 3, 31, 'minecraft:decorated_pot'); F(i, 0, 0, i, 2, 0, CS); F(0, 0, i, 0, 2, i, CS); F(31, 0, i, 31, 2, i, CS) }
  F(13, 0, 31, 18, 2, 31, AIR); F(12, 0, 31, 12, 3, 31, CS); F(19, 0, 31, 19, 3, 31, CS); S(12, 4, 31, 'mcwlights:garden_light'); S(19, 4, 31, 'mcwlights:garden_light')
  F(13, 0, 31, 18, 1, 31, 'mcwfences:ornate_metal_fence'); F(13, 2, 31, 14, 2, 31, 'mcwfences:ornate_metal_fence'); F(17, 2, 31, 18, 2, 31, 'mcwfences:ornate_metal_fence'); F(15, 2, 31, 16, 3, 31, 'mcwfences:ornate_metal_fence'); F(12, 4, 30, 12, 4, 30, AIR)
  // allee et rond-point a fontaine
  F(14, -1, 17, 17, -1, 31, 'minecraft:gravel')
  for (var x = 9; x <= 22; x++) for (var z = 18; z <= 29; z++) { var d = Math.hypot(x - 15.5, z - 23.5); if (d < 5.3) S(x, -1, z, 'minecraft:gravel'); if (d < 2.7) S(x, -1, z, SS); if (d >= 1.7 && d < 2.7) S(x, 0, z, SL + '[type=bottom]') }
  F(13, -2, 21, 18, -2, 26, SS); F(14, -1, 22, 17, -1, 25, 'minecraft:water'); F(14, 0, 22, 17, 0, 25, AIR)
  F(15, -1, 23, 16, 0, 24, CS); F(15, 1, 23, 16, 1, 24, 'minecraft:sandstone_wall'); F(15, 2, 23, 16, 2, 24, SL + '[type=bottom]'); S(15, 3, 23, 'minecraft:decorated_pot'); S(16, 3, 24, 'minecraft:decorated_pot')
  // corps principal R+1
  var X1 = 6, X2 = 25, Z1 = 3, Z2 = 15
  F(X1, 0, Z1, X2, 0, Z2, SS); W(X1, Z1, X2, Z2, 1, 11, WT); F(X1, 6, Z1, X2, 6, Z2, CS); F(X1 + 1, 6, Z1 + 1, X2 - 1, 6, Z2 - 1, 'minecraft:spruce_planks'); F(X1, 11, Z1, X2, 11, Z2, CS)
  for (var x = X1; x <= X2; x++) { S(x, 11, Z2 + 1, 'minecraft:smooth_sandstone_stairs[facing=north,half=top,shape=straight]'); S(x, 11, Z1 - 1, 'minecraft:smooth_sandstone_stairs[facing=south,half=top,shape=straight]'); S(x, 6, Z2 + 1, SL + '[type=top]') }
  ;[X1, X2].forEach(x => { F(x, 1, Z2, x, 11, Z2, CS); F(x, 1, Z1, x, 11, Z1, CS) })
  croupe(X1 - 1, Z1 - 1, X2 + 1, Z2 + 1, 12)
  ;[10, 21].forEach(x => { F(x, 12, Z1 + 3, x, 16, Z1 + 3, 'minecraft:bricks'); S(x, 17, Z1 + 3, 'minecraft:brick_slab[type=bottom]') })
  // portique a colonnes, balcon d'honneur
  F(12, 0, 16, 19, 0, 19, SS); F(12, 0, 20, 19, 0, 20, 'minecraft:smooth_sandstone_stairs[facing=north,half=bottom,shape=straight]')
  ;[12, 14, 17, 19].forEach(x => { F(x, 1, 19, x, 10, 19, QP); S(x, 1, 19, CS) }); F(12, 11, 16, 19, 11, 19, CS); F(11, 11, 20, 20, 11, 20, 'minecraft:smooth_sandstone_stairs[facing=north,half=top,shape=straight]')
  F(13, 12, 16, 18, 12, 19, SL + '[type=bottom]'); F(12, 12, 20, 19, 12, 20, 'minecraft:sandstone_wall'); F(14, 12, 20, 17, 13, 20, 'minecraft:chiseled_sandstone'); F(15, 14, 20, 16, 14, 20, SL + '[type=bottom]')
  F(12, 6, 16, 19, 6, 19, SL + '[type=top]'); F(13, 7, 19, 18, 7, 19, 'mcwfences:ornate_metal_fence'); S(13, 7, 17, 'minecraft:potted_azalea_bush'); S(18, 7, 17, 'minecraft:potted_azalea_bush')
  S(15, 5, 18, 'mcwlights:iron_chandelier'); S(16, 10, 18, 'minecraft:lantern[hanging=true]')
  F(14, 1, Z2, 17, 4, Z2, 'minecraft:glass_pane'); PORTE(15, 1, Z2, 'mcwdoors:dark_oak_glass_door', 'south', 'left', 'false'); PORTE(16, 1, Z2, 'mcwdoors:dark_oak_glass_door', 'south', 'right', 'false'); F(14, 1, Z2, 14, 2, Z2, QP); F(17, 1, Z2, 17, 2, Z2, QP)
  F(14, 7, Z2, 17, 9, Z2, 'minecraft:glass_pane'); PORTE(15, 7, Z2, 'mcwdoors:spruce_glass_door', 'south', 'left', 'false'); PORTE(16, 7, Z2, 'mcwdoors:spruce_glass_door', 'south', 'right', 'false')
  // fenetres a volets, jardinieres et garde-corps
  ;[8, 11, 20, 23].forEach(x => {
    ;[1, 7].forEach(y => { F(x, y + 1, Z2, x, y + 3, Z2, 'minecraft:glass_pane'); volets(x, y + 1, Z2 + 1); S(x, y + 4, Z2 + 1, 'minecraft:smooth_sandstone_stairs[facing=north,half=top,shape=straight]') })
    S(x, 8, Z2 + 1, 'mcwfences:ornate_metal_fence'); S(x, 1, Z2 + 1, 'supplementaries:planter'); SA(x, 2, Z2 + 1, 'minecraft:rose_bush[half=lower]'); SA(x, 3, Z2 + 1, 'minecraft:rose_bush[half=upper]')
    F(x, 2, Z1, x, 4, Z1, 'minecraft:glass_pane'); F(x, 8, Z1, x, 10, Z1, 'minecraft:glass_pane')
  })
  F(X2, 2, 11, X2, 4, 13, 'minecraft:glass_pane'); F(X2, 8, 11, X2, 10, 13, 'minecraft:glass_pane'); F(X1, 8, 7, X1, 10, 11, 'minecraft:glass_pane')
  // tour belvedere a l'est (cuisine, salon de musique, bureau panoramique)
  F(26, 0, 4, 30, 0, 9, SS); W(26, 4, 30, 9, 1, 17, WT); F(26, 6, 4, 30, 6, 9, CS); F(26, 12, 4, 30, 12, 9, CS); F(27, 6, 5, 29, 6, 8, 'minecraft:spruce_planks'); F(27, 12, 5, 29, 12, 8, 'minecraft:spruce_planks')
  ;[26, 30].forEach(x => { F(x, 0, 4, x, 17, 4, CS); F(x, 0, 9, x, 17, 9, CS) })
  F(30, 13, 5, 30, 16, 8, 'minecraft:glass_pane'); F(27, 13, 9, 29, 16, 9, 'minecraft:glass_pane'); F(27, 13, 4, 29, 16, 4, 'minecraft:glass_pane'); F(30, 8, 6, 30, 10, 7, 'minecraft:glass_pane'); F(30, 2, 6, 30, 4, 7, 'minecraft:glass_pane'); F(28, 8, 9, 28, 10, 9, 'minecraft:glass_pane')
  croupe(25, 3, 31, 10, 18); F(25, 17, 3, 31, 17, 10, SL + '[type=top]')
  F(26, 1, 6, 26, 2, 6, AIR); PORTE(X2, 1, 6, 'mcwdoors:dark_oak_classic_door', 'east', 'left', 'true'); F(26, 7, 6, 26, 8, 6, AIR); PORTE(X2, 7, 6, 'mcwdoors:dark_oak_classic_door', 'east', 'left', 'true')
  for (var y = 1; y <= 12; y++) S(27, y, 8, 'minecraft:ladder[facing=north]')
  // aile ouest : salle de billard, terrasse plantee sur le toit
  F(1, 0, 4, 5, 0, 13, SS); W(1, 4, 5, 13, 1, 5, WT); F(1, 6, 4, 5, 6, 13, SS); F(1, 7, 4, 5, 7, 13, 'minecraft:sandstone_wall'); F(2, 7, 5, 4, 7, 12, AIR); F(2, 0, 5, 4, 0, 12, 'minecraft:dark_oak_planks')
  ;[[1, 4], [5, 4], [1, 13], [5, 13]].forEach(c => F(c[0], 0, c[1], c[0], 7, c[1], CS))
  F(1, 2, 6, 1, 4, 11, 'minecraft:glass_pane'); F(2, 2, 13, 4, 4, 13, 'minecraft:glass_pane'); F(5, 1, 12, 6, 3, 12, AIR); PORTE(X1, 7, 8, 'mcwdoors:spruce_glass_door', 'west', 'left', 'false')
  F(2, 1, 7, 4, 1, 9, 'minecraft:dark_oak_slab[type=top]'); F(2, 2, 7, 4, 2, 9, 'minecraft:green_carpet'); F(2, 1, 5, 4, 2, 5, 'minecraft:bookshelf'); S(3, 5, 8, 'mcwlights:iron_chandelier'); S(2, 1, 11, MAT('dark_oak_chair', 'east')); S(4, 1, 11, 'minecraft:barrel[facing=up,open=false]'); S(4, 2, 11, 'minecraft:brewing_stand')
  ;[2, 3, 4].forEach(x => { S(x, 7, 5, 'minecraft:decorated_pot'); S(x, 7, 12, 'supplementaries:planter') })
  ;[[2, 6], [4, 6], [2, 11], [4, 11]].forEach(c => F(c[0], 7, c[1], c[0], 9, c[1], 'minecraft:stripped_oak_log[axis=y]')); F(2, 10, 6, 4, 10, 11, 'minecraft:oak_fence')
  for (var z = 6; z <= 11; z++) for (var x = 2; x <= 4; x++) if (R() < 0.55) S(x, 10, z, 'minecraft:flowering_azalea_leaves[persistent=true]')
  S(3, 7, 8, 'mcwfurnitures:spruce_table'); S(3, 7, 9, MAT('spruce_chair', 'north')); S(3, 7, 7, MAT('spruce_chair', 'south'))
  // piscine, plage, transats, parasol, pool-house
  F(20, -1, 21, 29, -1, 28, SS); F(21, -3, 22, 28, -2, 27, 'minecraft:light_blue_terracotta'); F(22, -2, 23, 27, -1, 26, 'minecraft:water'); S(26, -2, 25, 'minecraft:sea_pickle[pickles=1,waterlogged=true]')
  ;[22, 24, 26].forEach(x => { S(x, 0, 21, 'mcwfurnitures:white_chaise'); SA(x + 1, 0, 21, 'minecraft:potted_fern') }); F(29, 0, 24, 29, 3, 24, 'minecraft:oak_fence'); F(28, 4, 23, 30, 4, 25, 'minecraft:white_wool'); S(28, 4, 23, AIR); S(30, 4, 23, AIR); S(28, 4, 25, AIR); S(30, 4, 25, AIR)
  F(23, 0, 29, 30, 0, 30, SS); F(23, 1, 30, 30, 3, 30, WT); F(23, 1, 29, 23, 3, 29, WT); F(30, 1, 29, 30, 3, 29, WT); F(24, 1, 29, 29, 1, 29, MAT('stripped_spruce_counter', 'north')); S(26, 2, 29, 'supplementaries:jar'); S(28, 2, 29, 'minecraft:potted_bamboo')
  F(22, 4, 28, 31, 4, 28, TU('south')); F(22, 4, 29, 31, 4, 30, SL + '[type=bottom]')
  // jardin ouest : allee de cypres, parterres, pergola fleurie
  for (var z = 17; z <= 29; z += 3) [2, 9].forEach(x => { F(x, 0, z, x, 6, z, 'minecraft:spruce_log[axis=y]'); for (var y = 1; y <= 8; y++) { var r = y < 7 ? 1 : 0; for (var dx = -r; dx <= r; dx++) for (var dz = -r; dz <= r; dz++) if (Math.abs(dx) + Math.abs(dz) == 1 || (dx == 0 && dz == 0 && y > 6)) SA(x + dx, y, z + dz, 'minecraft:spruce_leaves[persistent=true]') } })
  F(4, -1, 17, 7, -1, 24, 'minecraft:gravel'); for (var z = 17; z <= 24; z++) { SA(4, 0, z, choix(['minecraft:poppy', 'minecraft:red_tulip', 'minecraft:azure_bluet', 'minecraft:allium'])); SA(7, 0, z, choix(['minecraft:poppy', 'minecraft:pink_tulip', 'minecraft:oxeye_daisy', 'minecraft:lily_of_the_valley'])) }
  F(3, -1, 25, 8, -1, 29, SS); ;[[3, 25], [8, 25], [3, 29], [8, 29]].forEach(c => F(c[0], 0, c[1], c[0], 3, c[1], QP)); F(3, 4, 25, 8, 4, 29, 'minecraft:oak_fence'); for (var x = 3; x <= 8; x++) for (var z = 25; z <= 29; z++) if (R() < 0.55) S(x, 4, z, 'minecraft:cherry_leaves[persistent=true]')
  F(5, 0, 27, 6, 0, 27, 'mcwfurnitures:spruce_table'); S(4, 0, 27, MAT('spruce_chair', 'east')); S(7, 0, 27, MAT('spruce_chair', 'west')); S(5, 0, 26, MAT('spruce_chair', 'south')); S(6, 0, 28, MAT('spruce_chair', 'north')); S(5, 3, 27, 'minecraft:lantern[hanging=true]')
  for (var x = 0; x <= 31; x++) for (var z = 16; z <= 30; z++) {
    var dur = (x >= 14 && x <= 17) || Math.hypot(x - 15.5, z - 23.5) < 5.3 || (x >= 20 && z >= 21) || (x >= 3 && x <= 8 && z >= 17) || z <= 20 && x >= 11 && x <= 20
    if (!dur && R() < 0.07) SA(x, 0, z, choix(['minecraft:short_grass', 'minecraft:fern', 'minecraft:short_grass', 'minecraft:poppy']))
  }
  // facade nord : terrasse de service, potager
  F(10, -1, 1, 22, -1, 2, SS); F(12, -1, 1, 14, -1, 1, 'minecraft:farmland'); F(17, -1, 1, 20, -1, 1, 'minecraft:farmland'); F(12, 0, 1, 14, 0, 1, 'minecraft:wheat[age=7]'); F(17, 0, 1, 20, 0, 1, 'minecraft:carrots[age=5]')
  PORTE(15, 1, Z1, 'mcwdoors:dark_oak_classic_door', 'north', 'left', 'false')
  // ================= interieur rez-de-chaussee =================
  for (var x = X1 + 1; x <= X2 - 1; x++) for (var z = Z1 + 1; z <= Z2 - 1; z++) S(x, 0, z, (x + z) % 2 ? 'minecraft:smooth_quartz' : 'minecraft:polished_diorite')
  F(12, 1, Z1 + 1, 12, 5, Z2 - 1, WT); F(19, 1, Z1 + 1, 19, 5, Z2 - 1, WT); F(12, 1, 11, 12, 4, 13, AIR); F(19, 1, 11, 19, 4, 13, AIR)
  // grand hall double hauteur, escalier d'honneur
  F(14, 6, 6, 17, 6, 12, AIR)
  for (var i = 0; i < 6; i++) { F(14, 1 + i, 10 - i, 17, 1 + i, 10 - i, 'minecraft:quartz_stairs[facing=north,half=bottom,shape=straight]'); if (i > 0) F(14, 1, 10 - i, 17, i, 10 - i, 'minecraft:quartz_block') }
  F(13, 1, 4, 13, 5, 10, WT); F(18, 1, 4, 18, 5, 10, WT); F(13, 7, 6, 13, 7, 12, 'mcwfences:ornate_metal_fence'); F(18, 7, 6, 18, 7, 12, 'mcwfences:ornate_metal_fence'); F(13, 7, 13, 18, 7, 13, 'mcwfences:ornate_metal_fence')
  F(14, 1, 11, 17, 1, 14, 'minecraft:red_carpet'); S(15, 10, 9, 'mcwlights:iron_chandelier'); S(16, 10, 9, 'mcwlights:iron_chandelier')
  ;[[13, 14], [18, 14]].forEach(c => { S(c[0], 1, c[1], 'minecraft:decorated_pot'); S(c[0], 2, c[1], 'minecraft:azalea_leaves[persistent=true]') })
  // grand salon ouest avec cheminee
  F(X1 + 1, 1, 8, X1 + 1, 5, 11, 'minecraft:quartz_bricks'); S(X1 + 1, 1, 9, 'minecraft:campfire[lit=false,facing=east]'); S(X1 + 1, 1, 10, 'minecraft:campfire[lit=false,facing=east]'); S(X1 + 1, 2, 9, AIR); S(X1 + 1, 2, 10, AIR); F(X1 + 2, 3, 8, X1 + 2, 3, 11, 'minecraft:quartz_slab[type=top]'); S(X1 + 2, 4, 9, 'minecraft:candle[candles=3,lit=false]'); S(X1 + 2, 4, 10, 'minecraft:decorated_pot')
  F(9, 1, 8, 10, 1, 8, 'mcwfurnitures:white_couch[facing=south,shape=single]'); F(9, 1, 11, 10, 1, 11, 'mcwfurnitures:white_couch[facing=north,shape=single]'); F(11, 1, 9, 11, 1, 10, 'mcwfurnitures:light_gray_couch[facing=west,shape=single]')
  F(8, 0, 9, 10, 0, 10, 'minecraft:red_terracotta'); S(9, 1, 9, 'mcwfurnitures:dark_oak_coffee_table'); S(9, 1, 10, 'mcwfurnitures:dark_oak_coffee_table'); S(9, 2, 9, 'minecraft:candle[candles=2,lit=false]'); S(10, 1, 9, 'minecraft:red_carpet'); S(10, 1, 10, 'minecraft:red_carpet')
  F(7, 1, 4, 11, 3, 4, 'minecraft:bookshelf'); S(9, 1, 4, 'minecraft:chiseled_bookshelf[facing=south]'); S(8, 1, 13, 'mcwfurnitures:dark_oak_desk[facing=north,connection=single]'); S(7, 1, 13, 'minecraft:jukebox'); S(8, 1, 14, MAT('dark_oak_chair', 'north')); S(9, 5, 10, 'mcwlights:iron_chandelier'); S(11, 1, 14, 'minecraft:potted_bamboo'); S(7, 1, 14, 'minecraft:potted_azalea_bush'); S(10, 1, 5, 'supplementaries:globe')
  // salle a manger est
  F(21, 1, 7, 23, 1, 11, 'mcwfurnitures:dark_oak_table'); for (var z = 7; z <= 11; z++) { S(20, 1, z, MAT('dark_oak_chair', 'east')); S(24, 1, z, MAT('dark_oak_chair', 'west')) } S(22, 1, 6, MAT('dark_oak_chair', 'south')); S(22, 1, 12, MAT('dark_oak_chair', 'north'))
  S(22, 5, 9, 'mcwlights:iron_chandelier'); F(20, 1, 4, 24, 1, 4, MAT('dark_oak_drawer', 'south')); S(21, 2, 4, 'minecraft:candle[candles=3,lit=false]'); S(23, 2, 4, 'minecraft:decorated_pot'); S(22, 2, 9, 'minecraft:candle[candles=4,lit=false]'); S(22, 2, 7, 'supplementaries:jar'); S(20, 1, 14, 'minecraft:potted_azalea_bush'); S(24, 1, 14, 'minecraft:potted_bamboo')
  // cuisine dans la tour
  F(27, 1, 5, 29, 1, 5, MAT('stripped_oak_counter', 'south')); S(28, 1, 5, 'farmersdelight:stove[facing=south,lit=false]'); S(28, 2, 5, 'farmersdelight:cooking_pot'); F(29, 1, 6, 29, 1, 8, MAT('stripped_oak_counter', 'west')); S(29, 1, 7, 'mcwfurnitures:stripped_oak_kitchen_sink[facing=west,water=false]'); S(28, 1, 8, 'minecraft:barrel[facing=up,open=false]'); S(27, 3, 5, 'mcwfurnitures:stripped_oak_kitchen_cabinet[facing=south,hinge=left]'); S(29, 3, 5, 'mcwfurnitures:stripped_oak_kitchen_cabinet[facing=south,hinge=right]'); S(29, 2, 6, 'farmersdelight:cutting_board[facing=west]')
  // ================= etage =================
  F(11, 7, 4, 11, 10, 14, WT); F(20, 7, 4, 20, 10, 14, WT); PORTE(11, 7, 5, 'mcwdoors:dark_oak_classic_door', 'west', 'left', 'true'); PORTE(20, 7, 5, 'mcwdoors:dark_oak_classic_door', 'east', 'left', 'true')
  // suite parentale
  LIT(8, 7, 6, 'white', 'north'); LIT(9, 7, 6, 'white', 'north'); S(7, 7, 5, 'mcwfurnitures:dark_oak_end_table'); S(10, 7, 5, 'mcwfurnitures:dark_oak_end_table'); S(7, 8, 5, 'minecraft:candle[candles=2,lit=false]'); S(10, 8, 5, 'minecraft:candle[candles=2,lit=false]')
  F(7, 7, 12, 7, 7, 14, 'mcwfurnitures:dark_oak_wardrobe[facing=east,connection=base,hinge=left]'); F(8, 7, 8, 9, 7, 9, 'minecraft:white_carpet'); S(9, 7, 13, 'minecraft:water_cauldron[level=3]'); S(10, 7, 13, 'minecraft:water_cauldron[level=3]'); S(10, 7, 14, 'minecraft:quartz_stairs[facing=west,half=bottom,shape=straight]'); S(9, 10, 9, 'mcwlights:iron_chandelier'); S(10, 7, 10, 'mcwfurnitures:light_gray_couch[facing=west,shape=single]')
  // chambres d'enfants
  LIT(21, 7, 5, 'light_blue', 'north'); LIT(24, 7, 5, 'pink', 'north'); S(22, 7, 4, 'mcwfurnitures:spruce_end_table'); S(23, 7, 4, 'mcwfurnitures:spruce_end_table'); S(22, 8, 4, 'minecraft:candle[candles=1,lit=false]'); F(21, 7, 8, 24, 7, 9, 'minecraft:light_blue_carpet')
  F(21, 7, 12, 21, 7, 13, 'mcwfurnitures:spruce_wardrobe[facing=east,connection=base,hinge=left]'); S(23, 7, 14, 'mcwfurnitures:spruce_desk[facing=north,connection=single]'); S(23, 7, 13, MAT('spruce_chair', 'south')); S(23, 8, 14, 'supplementaries:globe'); S(24, 7, 11, 'minecraft:chest[facing=west]'); S(22, 10, 9, 'minecraft:lantern[hanging=true]')
  // palier du hall
  F(12, 7, 4, 19, 7, 4, 'minecraft:red_carpet'); S(12, 7, 13, 'minecraft:potted_azalea_bush'); S(19, 7, 13, 'minecraft:potted_azalea_bush')
  // tour : salon de musique a l'etage, bureau panoramique au sommet
  F(27, 7, 5, 29, 7, 7, 'minecraft:light_gray_carpet'); S(29, 7, 5, 'mcwfurnitures:black_couch[facing=west,shape=single]'); S(29, 7, 6, 'mcwfurnitures:black_couch[facing=west,shape=single]'); S(29, 7, 8, 'minecraft:jukebox'); S(28, 7, 8, 'minecraft:note_block')
  F(27, 13, 5, 29, 13, 5, 'minecraft:bookshelf'); S(28, 13, 7, 'mcwfurnitures:dark_oak_desk[facing=north,connection=single]'); S(28, 14, 7, 'supplementaries:globe_sepia'); S(28, 13, 6, MAT('dark_oak_chair', 'south')); S(28, 17, 6, 'minecraft:cut_sandstone'); S(28, 16, 6, 'minecraft:lantern[hanging=true]'); S(29, 13, 8, 'minecraft:potted_fern')
}


// ================= GRANDE VILLA MODERNE (3 x 3 chunks) =================
function villaModerne() {
  var WC = 'minecraft:white_concrete', BK = 'minecraft:black_concrete', GL = 'minecraft:glass', SQ = 'minecraft:smooth_quartz', SP = 'minecraft:stripped_spruce_log[axis=y]', DK = 'minecraft:polished_deepslate', PB = 'minecraft:polished_blackstone'
  var TS = 'minecraft:smooth_stone_slab[type=top]', BS = 'minecraft:smooth_stone_slab[type=bottom]', LT = 'mcwlights:white_ceiling_light', HAIE = 'minecraft:azalea_leaves[persistent=true]', VP = 'minecraft:glass_pane'
  function arbre(x, z, tronc, feuille, h) { F(x, 0, z, x, h, z, tronc); for (var dx = -2; dx <= 2; dx++) for (var dz = -2; dz <= 2; dz++) for (var y = h - 1; y <= h + 2; y++) if (Math.abs(dx) + Math.abs(dz) + Math.abs(y - h - 0.5) < 3.6) SA(x + dx, y, z + dz, feuille) }
  function parasol(x, z) { F(x, 0, z, x, 2, z, 'minecraft:spruce_fence'); F(x - 1, 3, z - 1, x + 1, 3, z + 1, 'minecraft:white_wool'); ;[[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(c => S(x + c[0], 3, z + c[1], AIR)); S(x, 4, z, 'minecraft:white_carpet') }
  F(0, -1, 0, 47, -1, 47, 'minecraft:grass_block')
  // ---------- enceinte, portail, portillon, haies ----------
  W(0, 0, 47, 47, 0, 1, WC); W(0, 0, 47, 47, 2, 2, BS)
  for (var i = 0; i <= 47; i += 8) { F(i, 0, 47, i, 2, 47, BK); F(i, 0, 0, i, 2, 0, BK); F(0, 0, i, 0, 2, i, BK); F(47, 0, i, 47, 2, i, BK) }
  F(47, 0, 47, 47, 2, 47, BK)
  F(3, 0, 47, 10, 2, 47, AIR); F(3, 0, 47, 3, 3, 47, BK); F(10, 0, 47, 10, 3, 47, BK); S(3, 4, 47, 'mcwlights:garden_light'); S(10, 4, 47, 'mcwlights:garden_light'); F(4, 0, 47, 9, 1, 47, 'mcwfences:panelled_metal_fence'); F(4, 2, 47, 9, 2, 47, BS)
  F(13, 0, 47, 13, 1, 47, AIR); PORTE(13, 0, 47, 'minecraft:iron_door', 'south', 'left', 'false')
  F(1, 0, 1, 1, 1, 46, HAIE); F(1, 0, 1, 13, 1, 1, HAIE); F(46, 0, 1, 46, 1, 46, HAIE); F(14, 0, 46, 46, 1, 46, HAIE); F(1, 0, 1, 46, 1, 1, HAIE)
  // ---------- allee, garage double, avant-cour ----------
  F(3, -1, 22, 10, -1, 46, 'minecraft:polished_andesite'); F(2, -1, 22, 2, -1, 46, 'minecraft:smooth_stone'); F(11, -1, 22, 11, -1, 46, 'minecraft:smooth_stone'); F(12, -1, 20, 13, -1, 25, 'minecraft:polished_andesite')
  for (var z = 27; z <= 45; z += 2) S(13, -1, z, 'minecraft:smooth_stone')
  ;[26, 32, 38, 44].forEach(z => { SA(2, 0, z, 'mcwlights:garden_light'); SA(12, 0, z, 'mcwlights:garden_light') })
  F(2, 0, 10, 11, 0, 21, 'minecraft:smooth_stone'); W(2, 10, 11, 21, 1, 4, WC); F(1, 5, 9, 12, 5, 22, TS); F(2, 5, 10, 11, 5, 21, 'minecraft:moss_block')
  F(3, 1, 21, 5, 3, 21, AIR); F(8, 1, 21, 10, 3, 21, AIR); F(3, 1, 22, 5, 3, 22, 'minecraft:iron_trapdoor[facing=south,half=bottom,open=true]'); F(8, 1, 22, 10, 3, 22, 'minecraft:iron_trapdoor[facing=south,half=bottom,open=true]'); F(6, 1, 21, 7, 4, 21, BK)
  function auto(x, z, c) { F(x, 1, z, x + 1, 1, z + 3, 'minecraft:' + c + '_concrete'); F(x, 2, z + 1, x + 1, 2, z + 2, 'minecraft:tinted_glass'); S(x, 2, z, 'minecraft:' + c + '_carpet'); S(x + 1, 2, z, 'minecraft:' + c + '_carpet'); S(x, 2, z + 3, 'minecraft:' + c + '_carpet'); S(x + 1, 2, z + 3, 'minecraft:' + c + '_carpet') }
  auto(3, 13, 'red'); auto(8, 13, 'black'); F(3, 1, 11, 10, 1, 11, MAT('spruce_counter', 'south')); S(4, 2, 11, 'minecraft:anvil[facing=east]'); F(6, 2, 11, 8, 3, 11, 'minecraft:spruce_trapdoor[facing=south,half=bottom,open=true]'); S(10, 1, 19, 'minecraft:barrel[facing=up,open=false]'); S(3, 4, 16, LT); S(9, 4, 16, LT)
  F(12, 5, 20, 13, 5, 25, 'minecraft:polished_blackstone_slab[type=top]'); S(13, 4, 22, 'minecraft:end_rod[facing=down]'); S(13, 4, 24, 'minecraft:end_rod[facing=down]'); S(12, 0, 21, 'supplementaries:planter'); S(12, 1, 21, 'minecraft:flowering_azalea'); S(12, 0, 25, 'supplementaries:planter'); S(12, 1, 25, 'minecraft:flowering_azalea')
  // ---------- volume A : rez-de-chaussee vitre (x14..37, z10..25) ----------
  F(13, 0, 9, 38, 0, 26, DK); F(14, 0, 10, 37, 0, 25, SQ)
  F(14, 1, 10, 37, 5, 10, WC); F(14, 1, 10, 14, 5, 25, WC); F(14, 1, 25, 37, 5, 25, GL); F(37, 1, 10, 37, 5, 25, GL)
  ;[14, 18, 22, 26, 30, 34, 37].forEach(x => F(x, 1, 25, x, 5, 25, BK)); ;[10, 14, 18, 22, 25].forEach(z => F(37, 1, z, 37, 5, z, BK))
  F(24, 3, 10, 36, 4, 10, GL); F(28, 3, 10, 28, 4, 10, BK); F(32, 3, 10, 32, 4, 10, BK)
  F(13, 6, 9, 38, 6, 26, TS); F(14, 6, 10, 37, 6, 25, 'minecraft:smooth_stone')
  F(14, 1, 21, 14, 4, 24, GL); PORTE(14, 1, 22, 'mcwdoors:dark_oak_glass_door', 'west', 'left', 'false'); PORTE(14, 1, 23, 'mcwdoors:dark_oak_glass_door', 'west', 'right', 'false')
  PORTE(23, 1, 25, 'mcwdoors:dark_oak_glass_door', 'south', 'left', 'false'); PORTE(24, 1, 25, 'mcwdoors:dark_oak_glass_door', 'south', 'right', 'false'); PORTE(31, 1, 25, 'mcwdoors:dark_oak_glass_door', 'south', 'left', 'false'); PORTE(32, 1, 25, 'mcwdoors:dark_oak_glass_door', 'south', 'right', 'false')
  PORTE(37, 1, 16, 'mcwdoors:dark_oak_glass_door', 'east', 'left', 'false'); PORTE(37, 1, 17, 'mcwdoors:dark_oak_glass_door', 'east', 'right', 'false')
  // salle de cinema
  F(21, 1, 11, 21, 5, 18, WC); F(15, 1, 18, 20, 5, 18, WC); F(15, 1, 11, 20, 1, 17, 'minecraft:black_carpet'); PORTE(21, 1, 16, 'minecraft:dark_oak_door', 'east', 'left', 'false')
  F(16, 2, 11, 19, 4, 11, 'minecraft:white_wool'); F(15, 1, 11, 15, 2, 11, 'minecraft:note_block'); F(20, 1, 11, 20, 2, 11, 'minecraft:note_block')
  F(16, 1, 14, 19, 1, 14, 'mcwfurnitures:black_couch[facing=north,shape=single]'); F(16, 1, 16, 19, 1, 16, 'mcwfurnitures:black_couch[facing=north,shape=single]'); S(15, 1, 16, 'minecraft:barrel[facing=up,open=false]'); S(17, 5, 15, 'mcwlights:black_ceiling_light')
  // hall d'entree
  F(16, 1, 21, 19, 1, 23, 'minecraft:light_gray_carpet'); S(15, 1, 19, MAT('stripped_dark_oak_drawer', 'east')); S(15, 2, 19, 'minecraft:potted_white_tulip'); S(15, 1, 24, 'minecraft:potted_bamboo'); S(20, 1, 19, 'minecraft:decorated_pot'); S(18, 5, 22, LT); S(15, 1, 22, MAT('oak_modern_chair', 'east'))
  // escalier flottant vers l'etage
  for (var i = 0; i < 6; i++) F(22, 1 + i, 24 - i, 23, 1 + i, 24 - i, 'minecraft:smooth_quartz_stairs[facing=north,half=bottom,shape=straight]')
  F(24, 1, 19, 24, 5, 24, GL)
  // cuisine
  F(27, 1, 11, 35, 1, 11, MAT('stripped_oak_counter', 'south')); S(31, 1, 11, 'mcwfurnitures:stripped_oak_kitchen_sink[facing=south,water=false]'); S(29, 1, 11, 'farmersdelight:stove[facing=south,lit=false]'); S(29, 2, 11, 'farmersdelight:cooking_pot')
  S(27, 2, 11, 'farmersdelight:cutting_board[facing=south]'); S(34, 2, 11, 'supplementaries:jar'); F(36, 1, 11, 36, 3, 12, 'minecraft:iron_block'); F(26, 1, 11, 26, 1, 11, 'mcwfurnitures:stripped_oak_wardrobe[facing=south,connection=base,hinge=left]')
  F(28, 1, 14, 33, 1, 14, MAT('stripped_oak_counter', 'south')); S(29, 2, 14, 'minecraft:decorated_pot'); S(32, 2, 14, 'minecraft:potted_white_tulip'); ;[28, 30, 32].forEach(x => S(x + 1, 1, 15, 'mcwfurnitures:stripped_oak_stool_chair'))
  S(29, 5, 14, LT); S(32, 5, 14, LT); S(31, 5, 12, LT)
  // salle a manger
  F(26, 1, 17, 26, 1, 22, 'mcwfurnitures:stripped_oak_table'); for (var z = 17; z <= 22; z++) { S(25, 1, z, MAT('stripped_oak_modern_chair', 'east')); S(27, 1, z, MAT('stripped_oak_modern_chair', 'west')) } S(26, 1, 16, MAT('stripped_oak_modern_chair', 'south')); S(26, 1, 23, MAT('stripped_oak_modern_chair', 'north'))
  S(26, 2, 19, 'minecraft:candle[candles=3,lit=false]'); S(26, 2, 21, 'minecraft:potted_white_tulip'); S(26, 5, 18, LT); S(26, 5, 21, LT)
  // salon : cheminee, ecran, canape d'angle
  F(28, 1, 17, 34, 4, 17, PB); S(31, 1, 17, 'minecraft:campfire[lit=true,facing=south]'); S(31, 2, 17, AIR); F(30, 3, 18, 32, 4, 18, 'minecraft:black_stained_glass_pane')
  F(29, 1, 19, 33, 1, 22, 'minecraft:white_carpet'); F(29, 1, 23, 33, 1, 23, 'mcwfurnitures:light_gray_couch[facing=north,shape=single]'); F(28, 1, 20, 28, 1, 22, 'mcwfurnitures:light_gray_couch[facing=east,shape=single]'); F(34, 1, 20, 34, 1, 22, 'mcwfurnitures:light_gray_couch[facing=west,shape=single]')
  S(28, 1, 23, 'mcwfurnitures:stripped_oak_end_table'); S(34, 1, 23, 'mcwfurnitures:stripped_oak_end_table'); S(28, 2, 23, 'minecraft:candle[candles=2,lit=false]'); S(34, 2, 23, 'minecraft:potted_azalea_bush'); F(30, 1, 21, 32, 1, 21, 'mcwfurnitures:stripped_oak_coffee_table')
  S(36, 1, 19, 'minecraft:potted_bamboo'); S(36, 1, 24, 'minecraft:potted_fern'); S(35, 1, 24, 'minecraft:jukebox'); S(31, 5, 20, LT); S(31, 5, 23, LT); S(35, 5, 21, LT)
  // ---------- volume B : etage en porte-a-faux (x20..45, z6..21) ----------
  F(20, 6, 6, 45, 6, 21, 'minecraft:smooth_stone'); F(21, 6, 7, 44, 6, 20, 'minecraft:birch_planks'); F(20, 6, 6, 45, 6, 6, BK); F(45, 6, 6, 45, 6, 21, BK)
  F(20, 7, 6, 45, 11, 6, SP); F(20, 7, 6, 20, 11, 21, SP); F(45, 7, 6, 45, 11, 21, GL); F(20, 7, 21, 45, 11, 21, GL)
  ;[20, 26, 32, 38, 45].forEach(x => F(x, 7, 21, x, 11, 21, BK)); ;[6, 12, 21].forEach(z => F(45, 7, z, 45, 11, z, BK))
  F(22, 8, 6, 25, 10, 6, GL); F(29, 8, 6, 32, 10, 6, GL); F(35, 8, 6, 37, 10, 6, GL)
  F(19, 12, 5, 46, 12, 22, TS); F(20, 12, 6, 45, 12, 21, 'minecraft:smooth_stone')
  F(45, 0, 6, 45, 5, 6, BK); F(45, 0, 21, 45, 5, 21, BK)
  F(22, 6, 20, 23, 6, 21, AIR); F(22, 6, 19, 23, 6, 19, 'minecraft:smooth_quartz_stairs[facing=north,half=bottom,shape=straight]'); F(21, 7, 20, 21, 7, 21, VP); F(24, 7, 20, 24, 7, 21, VP)
  F(21, 7, 18, 44, 11, 18, WC); F(25, 7, 19, 40, 7, 20, 'minecraft:gray_carpet'); S(21, 7, 19, 'minecraft:potted_bamboo'); S(44, 7, 20, 'minecraft:potted_fern'); S(44, 7, 19, 'minecraft:decorated_pot'); ;[28, 35, 42].forEach(x => S(x, 11, 19, LT))
  // bureau-bibliotheque et escalier vers le belvedere
  PORTE(24, 7, 18, 'minecraft:birch_door', 'south', 'left', 'false'); F(28, 7, 7, 28, 11, 17, WC)
  F(21, 7, 7, 21, 9, 17, 'minecraft:bookshelf'); F(21, 10, 7, 21, 10, 17, 'minecraft:chiseled_bookshelf[facing=east]'); S(22, 7, 7, 'minecraft:potted_fern'); S(25, 7, 7, 'minecraft:potted_bamboo')
  S(23, 7, 10, 'mcwfurnitures:dark_oak_desk[facing=north,connection=single]'); S(24, 7, 10, 'mcwfurnitures:dark_oak_desk[facing=north,connection=single]'); S(23, 7, 11, MAT('dark_oak_modern_chair', 'north')); S(23, 8, 10, 'minecraft:lantern'); S(24, 8, 10, 'supplementaries:book_pile')
  F(22, 7, 14, 22, 7, 15, 'mcwfurnitures:brown_couch[facing=east,shape=single]'); S(22, 7, 13, 'mcwfurnitures:dark_oak_end_table'); S(22, 8, 13, 'supplementaries:globe'); F(23, 7, 13, 25, 7, 16, 'minecraft:brown_carpet'); S(24, 11, 12, LT)
  for (var i = 0; i < 6; i++) F(26, 7 + i, 16 - i, 27, 7 + i, 16 - i, 'minecraft:smooth_quartz_stairs[facing=north,half=bottom,shape=straight]')
  F(25, 7, 11, 25, 11, 17, GL)
  // chambre d'amis
  PORTE(31, 7, 18, 'minecraft:birch_door', 'south', 'left', 'false'); F(34, 7, 7, 34, 11, 17, WC)
  LIT(31, 7, 8, 'light_gray', 'north'); S(30, 7, 7, 'mcwfurnitures:birch_end_table'); S(32, 7, 7, 'mcwfurnitures:birch_end_table'); S(30, 8, 7, 'minecraft:candle[candles=1,lit=false]'); S(32, 8, 7, 'minecraft:potted_white_tulip')
  F(33, 7, 12, 33, 7, 13, 'mcwfurnitures:birch_wardrobe[facing=west,connection=base,hinge=left]'); S(29, 7, 15, 'mcwfurnitures:birch_desk[facing=north,connection=single]'); S(29, 7, 16, MAT('birch_modern_chair', 'north')); F(30, 7, 10, 32, 7, 12, 'minecraft:light_blue_carpet'); S(31, 11, 11, LT); S(33, 7, 16, 'minecraft:potted_fern')
  // suite parentale : dressing, salle de bain, chambre vitree
  F(38, 7, 7, 38, 11, 17, WC); F(35, 7, 12, 37, 11, 12, WC); F(38, 7, 9, 38, 8, 9, AIR); PORTE(38, 7, 15, 'minecraft:birch_door', 'east', 'left', 'false'); PORTE(41, 7, 18, 'minecraft:birch_door', 'south', 'left', 'false')
  F(35, 7, 7, 35, 7, 11, 'mcwfurnitures:stripped_birch_wardrobe[facing=east,connection=base,hinge=left]'); F(37, 7, 7, 37, 7, 8, 'mcwfurnitures:stripped_birch_wardrobe[facing=west,connection=base,hinge=left]'); S(36, 7, 10, 'mcwfurnitures:white_chaise'); S(36, 11, 9, LT)
  F(35, 6, 13, 37, 6, 17, SQ); S(36, 7, 14, 'minecraft:water_cauldron[level=3]'); S(36, 7, 15, 'minecraft:water_cauldron[level=3]'); F(35, 7, 16, 35, 7, 17, 'mcwfurnitures:stripped_birch_kitchen_sink[facing=east,water=false]'); S(37, 7, 13, 'minecraft:quartz_stairs[facing=west,half=bottom,shape=straight]'); F(37, 7, 16, 37, 9, 16, GL); S(37, 10, 17, 'minecraft:end_rod[facing=down]'); S(36, 11, 16, LT)
  F(39, 7, 11, 44, 7, 16, 'minecraft:light_gray_carpet'); LIT(42, 7, 8, 'white', 'north'); LIT(43, 7, 8, 'white', 'north'); S(41, 7, 7, 'mcwfurnitures:stripped_birch_end_table'); S(44, 7, 7, 'mcwfurnitures:stripped_birch_end_table'); S(41, 8, 7, 'minecraft:candle[candles=2,lit=false]'); S(44, 8, 7, 'minecraft:candle[candles=2,lit=false]')
  F(42, 7, 10, 43, 7, 10, 'mcwfurnitures:white_chaise'); F(44, 7, 13, 44, 7, 14, 'mcwfurnitures:white_couch[facing=east,shape=single]'); S(44, 7, 15, 'minecraft:potted_bamboo'); S(39, 7, 16, 'minecraft:potted_azalea_bush'); S(42, 11, 9, LT); S(41, 11, 14, LT)
  // ---------- volume C : belvedere vitre et toit-terrasse ----------
  F(25, 12, 10, 32, 12, 16, DK); F(26, 12, 12, 27, 12, 13, AIR); F(26, 12, 11, 27, 12, 11, 'minecraft:smooth_quartz_stairs[facing=north,half=bottom,shape=straight]')
  W(24, 9, 33, 17, 13, 16, GL); ;[[24, 9], [33, 9], [24, 17], [33, 17]].forEach(c => F(c[0], 13, c[1], c[0], 16, c[1], BK)); F(23, 17, 8, 34, 17, 18, TS); F(24, 17, 9, 33, 17, 17, 'minecraft:smooth_stone')
  PORTE(28, 13, 17, 'mcwdoors:dark_oak_glass_door', 'south', 'left', 'false'); PORTE(29, 13, 17, 'mcwdoors:dark_oak_glass_door', 'south', 'right', 'false')
  F(25, 13, 12, 25, 13, 14, VP); F(28, 13, 12, 28, 13, 14, VP); F(26, 13, 14, 27, 13, 14, VP)
  F(30, 13, 10, 32, 13, 10, MAT('stripped_dark_oak_counter', 'south')); S(30, 14, 10, 'supplementaries:jar'); S(32, 14, 10, 'minecraft:potted_white_tulip'); S(30, 13, 11, 'mcwfurnitures:stripped_dark_oak_stool_chair'); S(32, 13, 11, 'mcwfurnitures:stripped_dark_oak_stool_chair')
  F(30, 13, 14, 32, 13, 14, 'mcwfurnitures:black_couch[facing=south,shape=single]'); S(31, 13, 15, 'mcwfurnitures:stripped_dark_oak_coffee_table'); S(25, 13, 16, 'minecraft:lightning_rod'); S(32, 13, 16, 'minecraft:potted_bamboo'); S(28, 16, 13, LT); S(31, 16, 12, LT)
  for (var x = 25; x <= 32; x += 2) S(x, 18, 13, 'minecraft:daylight_detector')
  W(20, 6, 45, 21, 13, 13, VP); F(35, 12, 7, 44, 12, 20, 'minecraft:spruce_planks')
  F(38, 13, 12, 42, 13, 16, SQ); F(39, 13, 13, 41, 13, 15, 'minecraft:water'); ;[36, 38, 40].forEach(x => S(x, 13, 8, 'mcwfurnitures:white_chaise')); F(42, 13, 19, 42, 15, 19, 'minecraft:spruce_fence'); F(41, 16, 18, 43, 16, 20, 'minecraft:white_wool')
  ;[[21, 7], [44, 7], [21, 16], [44, 20]].forEach(c => { S(c[0], 13, c[1], 'supplementaries:planter'); S(c[0], 14, c[1], 'minecraft:flowering_azalea') })
  F(21, 13, 19, 21, 13, 20, 'mcwfurnitures:white_couch[facing=east,shape=single]'); S(22, 13, 19, 'mcwfurnitures:spruce_coffee_table')
  // toit vegetal du rez-de-chaussee
  F(15, 6, 11, 19, 6, 24, 'minecraft:moss_block'); F(20, 6, 22, 36, 6, 24, 'minecraft:moss_block'); F(22, 6, 22, 23, 6, 24, 'minecraft:smooth_stone')
  for (var x = 15; x <= 36; x++) for (var z = 11; z <= 24; z++) if ((x < 20 || z > 21) && R() < 0.12) SA(x, 7, z, choix(['minecraft:azalea', 'minecraft:short_grass', 'minecraft:fern']))
  // ---------- cuisine d'ete sous le porte-a-faux ----------
  F(38, -1, 6, 44, -1, 21, 'minecraft:spruce_planks'); F(44, 0, 9, 44, 0, 14, MAT('stripped_dark_oak_counter', 'west')); S(44, 0, 11, 'farmersdelight:stove[facing=west,lit=false]'); S(44, 1, 11, 'farmersdelight:cooking_pot'); S(44, 0, 13, 'mcwfurnitures:stripped_dark_oak_kitchen_sink[facing=west,water=false]'); S(44, 1, 9, 'minecraft:potted_bamboo')
  F(40, 0, 15, 41, 0, 18, 'mcwfurnitures:spruce_table'); for (var z = 15; z <= 18; z++) { S(39, 0, z, MAT('spruce_modern_chair', 'east')); S(42, 0, z, MAT('spruce_modern_chair', 'west')) } S(40, 0, 14, MAT('spruce_modern_chair', 'south')); S(41, 0, 19, MAT('spruce_modern_chair', 'north'))
  S(40, 1, 16, 'minecraft:candle[candles=3,lit=false]'); ;[[40, 10], [41, 17], [42, 13]].forEach(c => S(c[0], 5, c[1], LT))
  // ---------- piscine, plage, salon exterieur ----------
  F(14, -1, 26, 46, -1, 45, 'minecraft:smooth_stone'); F(16, -1, 28, 44, -1, 39, 'minecraft:spruce_planks')
  F(17, -5, 30, 43, -1, 37, 'minecraft:light_blue_terracotta'); F(18, -4, 31, 42, -1, 36, 'minecraft:water'); W(17, 30, 43, 37, -1, -1, SQ)
  ;[33, 34].forEach(z => { S(17, -3, z, 'minecraft:sea_lantern'); S(43, -3, z, 'minecraft:sea_lantern') }); for (var x = 21; x <= 39; x += 6) { S(x, -3, 30, 'minecraft:sea_lantern'); S(x, -3, 37, 'minecraft:sea_lantern') }
  ;[19, 21, 23, 31, 33, 35].forEach(x => S(x, 0, 28, 'mcwfurnitures:white_chaise')); parasol(27, 28); parasol(39, 28); S(25, 0, 28, 'minecraft:potted_bamboo'); S(29, 0, 28, 'minecraft:potted_bamboo')
  F(31, -1, 40, 41, -1, 45, DK); S(36, 0, 42, 'minecraft:campfire[lit=true,facing=south]'); S(36, 0, 43, 'minecraft:polished_blackstone_slab[type=bottom]'); S(35, 0, 42, 'minecraft:polished_blackstone_slab[type=bottom]'); S(37, 0, 42, 'minecraft:polished_blackstone_slab[type=bottom]'); S(36, 0, 41, 'minecraft:polished_blackstone_slab[type=bottom]')
  F(33, 0, 45, 39, 0, 45, 'mcwfurnitures:white_couch[facing=north,shape=single]'); F(32, 0, 41, 32, 0, 44, 'mcwfurnitures:white_couch[facing=east,shape=single]'); F(40, 0, 41, 40, 0, 44, 'mcwfurnitures:white_couch[facing=west,shape=single]')
  ;[[32, 45], [40, 45]].forEach(c => { S(c[0], 0, c[1], 'mcwfurnitures:spruce_end_table'); S(c[0], 1, c[1], 'minecraft:lantern') })
  arbre(45, 30, 'minecraft:birch_log[axis=y]', 'minecraft:birch_leaves[persistent=true]', 5); arbre(45, 38, 'minecraft:birch_log[axis=y]', 'minecraft:birch_leaves[persistent=true]', 6); arbre(16, 42, 'minecraft:cherry_log[axis=y]', 'minecraft:cherry_leaves[persistent=true]', 4); arbre(26, 43, 'minecraft:birch_log[axis=y]', 'minecraft:birch_leaves[persistent=true]', 5)
  ;[[15, 27], [44, 27], [15, 40], [44, 40], [30, 46]].forEach(c => SA(c[0], 0, c[1], 'mcwlights:garden_light'))
  // ---------- jardin zen au nord ----------
  F(14, -1, 1, 46, -1, 8, 'minecraft:gravel'); for (var x = 14; x <= 46; x++) if (x % 3 == 0) F(x, -1, 2, x, -1, 7, 'minecraft:light_gray_concrete_powder')
  F(30, -2, 1, 38, -2, 4, 'minecraft:moss_block'); F(30, -1, 1, 38, -1, 4, 'minecraft:water'); SA(31, 0, 2, 'minecraft:lily_pad'); SA(36, 0, 3, 'minecraft:lily_pad'); F(34, -1, 1, 34, -1, 4, 'minecraft:smooth_stone')
  for (var x = 15; x <= 17; x++) for (var z = 2; z <= 4; z++) if (R() < 0.8) F(x, 0, z, x, 3 + Math.floor(R() * 3), z, 'minecraft:bamboo[age=0,leaves=large,stage=0]')
  ;[[24, 3], [42, 4]].forEach(c => { S(c[0], 0, c[1], 'minecraft:stone_brick_wall'); S(c[0], 1, c[1], 'minecraft:lantern') }); F(20, 0, 5, 21, 0, 5, 'minecraft:mossy_cobblestone'); S(20, 1, 5, 'minecraft:mossy_cobblestone'); S(27, 0, 4, 'minecraft:mossy_cobblestone')
  arbre(40, 7, 'minecraft:cherry_log[axis=y]', 'minecraft:cherry_leaves[persistent=true]', 4)
}

// Banc d'essai des orientations de meubles (tout est ecrit pour regarder vers le sud)
function testOrient() {
  var L = ['mcwfurnitures:oak_chair[facing=south]', 'mcwfurnitures:gray_couch[facing=south,shape=single]', 'mcwfurnitures:oak_counter[facing=south]', 'mcwfurnitures:oak_kitchen_sink[facing=south,water=false]', 'mcwfurnitures:oak_drawer[facing=south]', 'mcwfurnitures:oak_wardrobe[facing=south,connection=base,hinge=left]', 'mcwfurnitures:oak_kitchen_cabinet[facing=south,hinge=left]', 'mcwfurnitures:oak_bookshelf[facing=south,connection=base]', 'mcwfurnitures:oak_modern_chair[facing=south]', 'mcwfurnitures:oak_desk[facing=north,connection=single]', 'mcwfurnitures:oak_end_table', 'minecraft:quartz_stairs[facing=south,half=bottom,shape=straight]']
  F(0, -1, 0, 24, -1, 14, 'minecraft:smooth_stone')
  var T = ['mcwfurnitures:oak_chair', 'mcwfurnitures:gray_couch', 'mcwfurnitures:oak_modern_chair'], FS = ['north', 'east', 'south', 'west'], DD = { north: [0, -1], south: [0, 1], east: [1, 0], west: [-1, 0] }
  T.forEach((t, k) => FS.forEach((f, i) => { var x = 3 + 6 * i, z = 3 + 4 * k; S(x, 0, z, t + '[facing=' + f + (t.indexOf('couch') > 0 ? ',shape=single' : '') + ']'); S(x + DD[f][0], 0, z + DD[f][1], 'minecraft:lime_carpet') }))
}


// ================= GRAND IMMEUBLE HAUSSMANNIEN D'ANGLE (2 x 2 chunks, R+5 + combles, dome d'angle) =================
// Rue au sud (z29), facade laterale a l'est (x31), cour interieure au nord-ouest.
// Une piece est decrite dans un repere local : u le long de la facade, v depuis la fenetre (v=0) vers le mur interieur.
// Orientations locales : {W} vers la fenetre, {I} vers le couloir, {P} vers +u, {M} vers -u. Porte de la piece en (L-1, D).
var CCW = { south: 'east', east: 'north', north: 'west', west: 'south' }
function cadre(x1, z1, x2, z2, fac, y, h) {
  var c = { fac: fac, y: y, h: h || 5 }, pu = CCW[fac]
  var T = { '{W}': fac, '{I}': OPP[fac], '{P}': pu, '{M}': OPP[pu] }
  if (fac == 'south') { c.L = x2 - x1 + 1; c.D = z2 - z1 + 1; c.pos = (u, v) => [x1 + u, z2 - v] }
  else if (fac == 'north') { c.L = x2 - x1 + 1; c.D = z2 - z1 + 1; c.pos = (u, v) => [x2 - u, z1 + v] }
  else if (fac == 'east') { c.L = z2 - z1 + 1; c.D = x2 - x1 + 1; c.pos = (u, v) => [x2 - v, z2 - u] }
  else { c.L = z2 - z1 + 1; c.D = x2 - x1 + 1; c.pos = (u, v) => [x1 + v, z1 + u] }
  c.f = b => ('' + b).replace(/\{[WIPM]\}/g, k => T[k])
  c.S = (u, v, dy, b) => { var p = c.pos(u, v); S(p[0], y + dy, p[1], c.f(b)) }
  c.porte = (id) => { var p = c.pos(c.L - 1, c.D); PORTE(p[0], y + 1, p[1], id, OPP[fac], 'left', 'false') }
  return c
}
function piece(c, type, etat) {
  var L = c.L, D = c.D, w = choix(BOIS), H = c.h
  for (var u = 0; u < L; u++) for (var v = 0; v < D; v++) c.S(u, v, 0, type == 'sdb' ? ((u + v) % 2 ? 'minecraft:smooth_quartz' : 'minecraft:polished_diorite') : type == 'cuisine' ? ((u + v) % 2 ? 'minecraft:polished_deepslate' : 'minecraft:smooth_quartz') : type == 'grenier' ? 'minecraft:spruce_planks' : ((u + v) % 4 < 2 ? 'minecraft:oak_planks' : 'minecraft:spruce_planks'))
  if (type == 'salon') {
    var c0 = Math.floor((L - 2) / 2), cp = choix(CANAPES), tapis = choix(['red', 'brown', 'blue', 'green', 'gray'])
    for (var u = c0 - 2; u <= c0 + 2; u++) for (var v = 1; v <= 3; v++) c.S(u, v, 1, 'minecraft:' + tapis + '_carpet')
    c.S(c0 - 1, D - 1, 1, 'minecraft:quartz_pillar'); c.S(c0 + 1, D - 1, 1, 'minecraft:quartz_pillar'); c.S(c0, D - 1, 1, 'minecraft:campfire[lit=' + (etat ? 'false' : 'true') + ',facing={W}]')
    for (var u = c0 - 1; u <= c0 + 1; u++) c.S(u, D - 1, 2, 'minecraft:quartz_slab[type=top]')
    c.S(c0 - 1, D - 1, 3, 'minecraft:candle[candles=3,lit=false]'); c.S(c0 + 1, D - 1, 3, 'minecraft:candle[candles=2,lit=false]'); c.S(c0, D - 1, 3, 'minecraft:decorated_pot')
    for (var u = 0; u <= L - 2; u++) if (u < c0 - 1 || u > c0 + 1) { c.S(u, D - 1, 1, 'minecraft:bookshelf'); c.S(u, D - 1, 2, 'minecraft:bookshelf') }
    for (var u = c0 - 1; u <= c0 + 1; u++) c.S(u, 1, 1, 'mcwfurnitures:' + cp + '_couch[facing={I},shape=single]')
    c.S(c0, 2, 1, 'mcwfurnitures:' + w + '_coffee_table'); c.S(c0, 2, 2, 'supplementaries:book_pile')
    c.S(c0 - 2, 2, 1, MAT(w + '_chair', '{P}')); c.S(c0 + 2, 2, 1, MAT(w + '_chair', '{M}'))
    c.S(0, 0, 1, 'minecraft:potted_fern'); c.S(L - 1, 0, 1, choix(['minecraft:potted_azalea_bush', 'minecraft:potted_bamboo', 'minecraft:decorated_pot']))
    c.S(c0, 2, H, 'mcwlights:iron_chandelier')
  } else if (type == 'salle') {
    var c0 = Math.floor((L - 1) / 2)
    for (var u = c0 - 1; u <= c0 + 1; u++) { c.S(u, 2, 1, 'mcwfurnitures:' + w + '_table'); c.S(u, 1, 1, MAT(w + '_chair', '{I}')); c.S(u, 3, 1, MAT(w + '_chair', '{W}')) }
    c.S(c0 - 2, 2, 1, MAT(w + '_chair', '{P}')); c.S(c0 + 2, 2, 1, MAT(w + '_chair', '{M}'))
    c.S(c0, 2, 2, 'minecraft:candle[candles=4,lit=false]'); c.S(c0 - 1, 2, 2, 'minecraft:potted_white_tulip'); c.S(c0 + 1, 2, 2, etat ? 'minecraft:air' : 'supplementaries:jar')
    for (var u = c0 - 1; u <= c0 + 1; u++) c.S(u, D - 1, 1, MAT(w + '_drawer', '{W}'))
    c.S(c0 - 1, D - 1, 2, 'minecraft:candle[candles=2,lit=false]'); c.S(c0 + 1, D - 1, 2, 'minecraft:decorated_pot')
    c.S(0, 0, 1, 'minecraft:potted_fern'); c.S(L - 1, 0, 1, 'minecraft:potted_azalea_bush'); c.S(0, D - 1, 1, 'minecraft:bookshelf')
    c.S(c0, 2, H, 'mcwlights:iron_chandelier')
  } else if (type == 'chambre') {
    var c0 = Math.floor((L - 2) / 2), col = choix(COULS)
    c.S(c0, D - 2, 1, 'minecraft:' + col + '_bed[facing={I},part=foot]'); c.S(c0, D - 1, 1, 'minecraft:' + col + '_bed[facing={I},part=head]')
    if (c0 >= 1) { c.S(c0 - 1, D - 1, 1, 'mcwfurnitures:' + w + '_end_table'); c.S(c0 - 1, D - 1, 2, 'minecraft:candle[candles=1,lit=false]') }
    if (c0 + 1 <= L - 2) { c.S(c0 + 1, D - 1, 1, 'mcwfurnitures:' + w + '_end_table'); c.S(c0 + 1, D - 1, 2, choix(['minecraft:candle[candles=2,lit=false]', 'supplementaries:book_pile', 'minecraft:potted_white_tulip'])) }
    if (c0 >= 2) c.S(c0 - 2, D - 1, 1, 'mcwfurnitures:' + w + '_wardrobe[facing={W},connection=base,hinge=left]')
    if (D >= 3) c.S(c0, D - 3, 1, 'minecraft:' + col + '_carpet')
    if (c0 >= 1 && D >= 4) c.S(0, 0, 1, 'minecraft:chest[facing={P}]')
    c.S(L - 1, 0, 1, choix(['minecraft:potted_fern', 'minecraft:potted_poppy', 'minecraft:barrel[facing=up,open=false]']))
    if (L >= 6 && D >= 4) { c.S(L - 2, 0, 1, MAT(w + '_drawer', '{I}')); c.S(L - 2, 0, 2, 'minecraft:candle[candles=1,lit=false]') }
    c.S(c0, Math.max(0, D - 3), H, 'minecraft:lantern[hanging=true]')
  } else if (type == 'cuisine') {
    for (var u = 0; u <= L - 2; u++) {
      c.S(u, D - 1, 1, u == 1 ? 'mcwfurnitures:' + w + '_kitchen_sink[facing={W},water=false]' : u == 2 ? 'farmersdelight:stove[facing={W},lit=false]' : MAT(w + '_counter', '{W}'))
      if (u != 2) c.S(u, D - 1, 3, 'mcwfurnitures:' + w + '_kitchen_cabinet[facing={W},hinge=' + (u % 2 ? 'right' : 'left') + ']')
    }
    c.S(0, D - 1, 2, 'farmersdelight:cutting_board[facing={W}]'); c.S(2, D - 1, 2, 'farmersdelight:cooking_pot'); if (L >= 5) c.S(3, D - 1, 2, 'supplementaries:jar')
    var c0 = Math.floor((L - 1) / 2), vt = D >= 4 ? 1 : 0
    c.S(c0, vt, 1, 'mcwfurnitures:' + w + '_table'); c.S(c0 - 1, vt, 1, MAT(w + '_chair', '{P}')); c.S(c0 + 1, vt, 1, MAT(w + '_chair', '{M}')); c.S(c0, vt, 2, 'minecraft:potted_red_tulip')
    c.S(c0, 1, H, 'minecraft:lantern[hanging=true]')
  } else if (type == 'sdb') {
    c.S(0, D - 1, 1, 'minecraft:water_cauldron[level=3]'); c.S(1, D - 1, 1, 'minecraft:water_cauldron[level=' + (etat ? 1 : 3) + ']')
    c.S(3, D - 1, 1, 'mcwfurnitures:' + w + '_kitchen_sink[facing={W},water=false]')
    c.S(L - 2, 0, 1, 'minecraft:quartz_stairs[facing={W},half=bottom,shape=straight]'); c.S(0, 0, 1, 'minecraft:potted_bamboo'); c.S(2, 0, 1, 'minecraft:white_carpet')
    c.S(1, 1, H, 'minecraft:end_rod[facing=down]')
  } else if (type == 'bureau') {
    for (var u = 0; u <= L - 2; u++) for (var dy = 1; dy <= 3; dy++) c.S(u, D - 1, dy, 'minecraft:bookshelf')
    var c0 = Math.floor((L - 1) / 2)
    for (var u = c0 - 1; u <= c0 + 1; u++) c.S(u, 2, 1, 'minecraft:brown_carpet')
    c.S(c0, 1, 1, 'mcwfurnitures:' + w + '_table'); c.S(c0, 2, 1, MAT(w + '_chair', '{W}')); c.S(c0, 1, 2, 'supplementaries:book_pile')
    c.S(0, 0, 1, 'supplementaries:globe'); c.S(L - 1, 0, 1, 'minecraft:potted_fern'); c.S(c0 + 1, 1, 1, 'minecraft:lectern[facing={I}]')
    c.S(c0, 2, H, 'mcwlights:iron_chandelier')
  } else if (type == 'grenier') {
    for (var u = 0; u <= L - 2; u++) if (R() < 0.65) c.S(u, D - 1, 1, choix(['supplementaries:sack', 'minecraft:barrel[facing=up,open=false]', 'minecraft:chest[facing={W}]', 'minecraft:decorated_pot', 'minecraft:spruce_planks']))
    c.S(1, 0, H, 'minecraft:lantern[hanging=true]')
  }
  if (etat == 1) { c.S(Math.floor(R() * (L - 1)), 0, 1, 'supplementaries:sack'); c.S(Math.floor(R() * (L - 1)), 0, 1, 'minecraft:white_carpet') }
}

function hauss() {
  var ST = 'minecraft:smooth_sandstone', CS = 'minecraft:cut_sandstone', CH = 'minecraft:chiseled_sandstone', WT = 'minecraft:calcite'
  var ARD = 'mcwroofs:gray_roof_block', RAIL = 'mcwfences:ornate_metal_fence', SLt = 'minecraft:smooth_sandstone_slab[type=top]', SLb = 'minecraft:smooth_sandstone_slab[type=bottom]'
  var PB = 'mcwdoors:spruce_classic_door', NB = 6
  function SST(f, h) { return 'minecraft:smooth_sandstone_stairs[facing=' + f + ',half=' + h + ',shape=straight]' }
  var sB = [2, 5, 9, 12, 17, 20, 25, 28], eB = [2, 5, 9, 12, 16, 19, 26]
  // ---- sol, trottoir, cour ----
  F(0, -1, 0, 31, -1, 31, 'minecraft:grass_block'); F(0, -1, 30, 31, -1, 31, 'minecraft:smooth_stone')
  for (var x = 0; x <= 31; x += 4) S(x, -1, 31, 'minecraft:polished_andesite')
  F(1, -1, 1, 18, -1, 16, 'minecraft:stone_bricks')
  for (var x = 1; x <= 18; x++) for (var z = 1; z <= 16; z++) { var r = R(); if (r < 0.12) S(x, -1, z, 'minecraft:mossy_stone_bricks'); else if (r < 0.2) S(x, -1, z, 'minecraft:cobblestone'); else if (r < 0.24) S(x, -1, z, 'minecraft:cracked_stone_bricks') }
  // ---- gros oeuvre : facades, pignons, planchers ----
  F(0, 0, 17, 31, 0, 29, 'minecraft:polished_andesite'); F(19, 0, 0, 31, 0, 16, 'minecraft:polished_andesite')
  F(0, 1, 29, 31, 35, 29, ST); F(31, 1, 0, 31, 35, 29, ST); F(0, 1, 17, 18, 35, 17, ST); F(19, 1, 0, 19, 35, 16, ST); F(0, 1, 18, 0, 35, 28, ST); F(20, 1, 0, 30, 35, 0, ST)
  for (var y = 1; y <= 5; y += 2) { F(0, y, 29, 31, y, 29, CS); F(31, y, 0, 31, y, 29, CS) }
  for (var y = 7; y <= 35; y++) if (y % 2 == 0) { S(0, y, 29, CS); S(31, y, 29, CS); S(31, y, 0, CS) }
  for (var f = 1; f < NB; f++) { var y = 6 * f; F(1, y, 18, 30, y, 28, 'minecraft:spruce_planks'); F(20, y, 1, 30, y, 17, 'minecraft:spruce_planks'); F(0, y, 29, 31, y, 29, CS); F(31, y, 0, 31, y, 29, CS) }
  F(0, 36, 17, 31, 36, 29, CS); F(19, 36, 0, 31, 36, 16, CS); F(1, 36, 18, 30, 36, 28, 'minecraft:spruce_planks'); F(20, 36, 1, 30, 36, 17, 'minecraft:spruce_planks')
  // ---- etages : baies sur rue, balcons, fenetres sur cour ----
  for (var f = 1; f < NB; f++) {
    var y = 6 * f, filant = f == 2 || f == 5
    sB.forEach(x => {
      F(x, y + 1, 29, x, y + 3, 29, GP); S(x, y + 4, 29, CH); S(x - 1, y + 4, 29, CS); S(x + 1, y + 4, 29, CS)
      if (filant) S(x, y - 1, 30, SST('north', 'top'))
      else { S(x, y, 30, SLt); S(x, y + 1, 30, RAIL); S(x, y - 1, 30, SST('north', 'top')) }
      if (f == 1) { S(x - 1, y + 5, 29, CS); S(x + 1, y + 5, 29, CS); S(x, y + 5, 30, SLb) }
    })
    if (filant) { F(0, y, 30, 31, y, 30, SLt); F(0, y + 1, 30, 31, y + 1, 30, RAIL) }
    eB.forEach(z => { S(31, y + 1, z, RAIL); F(31, y + 2, z, 31, y + 3, z, GP); S(31, y + 4, z, CH); S(31, y + 4, z - 1, CS); S(31, y + 4, z + 1, CS) })
    F(31, y + 2, 22, 31, y + 3, 22, GP); F(24, y + 2, 0, 24, y + 3, 0, GP)
    ;[3, 9, 15].forEach(x => { S(x, y + 1, 17, CS); F(x, y + 2, 17, x, y + 3, 17, GP) })
    ;[3, 11].forEach(z => { S(19, y + 1, z, CS); F(19, y + 2, z, 19, y + 3, z, GP) })
  }
  // ---- etages : cloisons, couloirs, pieces ----
  for (var f = 1; f < NB; f++) {
    var y = 6 * f, etat = R() < 0.3 ? 1 : 0
    F(1, y + 1, 23, 30, y + 5, 23, WT); F(1, y + 1, 21, 23, y + 5, 21, WT); F(25, y + 1, 21, 30, y + 5, 21, WT); F(23, y + 1, 1, 23, y + 5, 20, WT); F(25, y + 1, 1, 25, y + 5, 20, WT)
    ;[7, 15, 23].forEach(x => F(x, y + 1, 24, x, y + 5, 28, WT)); ;[6, 12].forEach(x => F(x, y + 1, 18, x, y + 5, 20, WT))
    F(26, y + 1, 7, 30, y + 5, 7, WT); F(26, y + 1, 14, 30, y + 5, 14, WT); F(20, y + 1, 7, 22, y + 5, 7, WT)
    for (var x = 1; x <= 30; x++) S(x, y, 22, (x % 4 < 2) ? 'minecraft:oak_planks' : 'minecraft:spruce_planks')
    F(2, y + 1, 22, 29, y + 1, 22, 'minecraft:red_carpet'); F(24, y + 1, 2, 24, y + 1, 21, 'minecraft:red_carpet')
    ;[4, 10, 16, 28].forEach(x => S(x, y + 5, 22, 'minecraft:lantern[hanging=true]')); ;[4, 10, 16].forEach(z => S(24, y + 5, z, 'minecraft:lantern[hanging=true]'))
    var rs = [[1, 6, choix(['chambre', 'bureau', 'salon'])], [8, 14, choix(['salle', 'salon'])], [16, 22, choix(['salon', 'chambre', 'salle'])], [24, 30, choix(['salon', 'salle', 'bureau'])]]
    rs.forEach(r => { var c = cadre(r[0], 24, r[1], 28, 'south', y); piece(c, r[2], etat); c.porte(PB) })
    var cr = ['cuisine', 'sdb', 'chambre']; if (R() < 0.5) cr = ['chambre', 'cuisine', 'sdb']
    ;[[1, 5], [7, 11], [13, 18]].forEach((r, i) => { var c = cadre(r[0], 18, r[1], 20, 'north', y); piece(c, cr[i], etat); c.porte(PB) })
    ;[[1, 6], [8, 13], [15, 20]].forEach(r => { var c = cadre(26, r[0], 30, r[1], 'east', y); piece(c, choix(['salon', 'chambre', 'bureau', 'chambre']), etat); c.porte(PB) })
    var ce = R() < 0.5 ? ['cuisine', 'sdb'] : ['sdb', 'cuisine']
    ;[[1, 6], [8, 14]].forEach((r, i) => { var c = cadre(20, r[0], 22, r[1], 'west', y); piece(c, ce[i], etat); c.porte(PB) })
    PORTE(20, y + 1, 21, PB, 'north', 'left', 'false')
  }
  // ---- combles : chambres de bonne et greniers ----
  var Y = 36
  F(1, Y + 1, 23, 29, Y + 4, 23, WT); F(1, Y + 1, 21, 23, Y + 4, 21, WT); F(25, Y + 1, 21, 29, Y + 4, 21, WT); F(23, Y + 1, 1, 23, Y + 4, 20, WT); F(25, Y + 1, 1, 25, Y + 4, 20, WT)
  ;[7, 15, 23].forEach(x => F(x, Y + 1, 24, x, Y + 4, 27, WT)); ;[6, 12].forEach(x => F(x, Y + 1, 19, x, Y + 4, 20, WT)); F(26, Y + 1, 7, 29, Y + 4, 7, WT); F(26, Y + 1, 14, 29, Y + 4, 14, WT); F(21, Y + 1, 7, 22, Y + 4, 7, WT)
  F(2, Y + 1, 22, 29, Y + 1, 22, 'minecraft:brown_carpet'); ;[4, 12, 20, 28].forEach(x => S(x, Y + 4, 22, 'minecraft:lantern[hanging=true]')); ;[5, 13].forEach(z => S(24, Y + 4, z, 'minecraft:lantern[hanging=true]'))
  ;[[1, 6], [8, 14], [16, 22], [24, 29]].forEach(r => { var c = cadre(r[0], 24, r[1], 27, 'south', Y, 4); piece(c, 'chambre', R() < 0.4 ? 1 : 0); c.porte(PB) })
  ;[[1, 6], [8, 13], [15, 20]].forEach(r => { var c = cadre(26, r[0], 29, r[1], 'east', Y, 4); piece(c, 'chambre', R() < 0.4 ? 1 : 0); c.porte(PB) })
  ;[[1, 5], [7, 11], [13, 18]].forEach(r => { var c = cadre(r[0], 19, r[1], 20, 'north', Y, 4); piece(c, 'grenier', 0); c.porte(PB) })
  ;[[1, 6], [8, 14]].forEach(r => { var c = cadre(21, r[0], 22, r[1], 'west', Y, 4); piece(c, 'grenier', 0); c.porte(PB) })
  PORTE(20, Y + 1, 21, PB, 'north', 'left', 'false')
  // ---- toit mansarde : brisis en ardoise, lucarnes a fronton, terrasson, souches ----
  F(1, 37, 28, 30, 40, 28, ARD); F(30, 37, 1, 30, 40, 27, ARD); F(1, 37, 18, 19, 40, 18, ARD); F(20, 37, 1, 20, 40, 17, ARD)
  F(0, 37, 17, 0, 41, 29, ST); F(20, 37, 0, 31, 41, 0, ST)
  F(1, 41, 19, 29, 41, 27, 'mcwroofs:gray_roof_slab[type=bottom]'); F(21, 41, 1, 29, 41, 18, 'mcwroofs:gray_roof_slab[type=bottom]')
  F(1, 41, 28, 30, 41, 28, TOIT('north')); F(30, 41, 1, 30, 41, 27, TOIT('west')); F(1, 41, 18, 19, 41, 18, TOIT('south')); F(20, 41, 1, 20, 41, 17, TOIT('east'))
  F(0, 35, 30, 31, 35, 30, SST('north', 'top')); F(0, 36, 30, 31, 36, 30, SLb)
  sB.forEach(x => { F(x, 37, 28, x, 38, 28, AIR); F(x, 37, 29, x, 38, 29, GP); F(x - 1, 37, 29, x - 1, 38, 29, CS); F(x + 1, 37, 29, x + 1, 38, 29, CS); S(x - 1, 39, 29, SST('east', 'bottom')); S(x + 1, 39, 29, SST('west', 'bottom')); S(x, 39, 29, CH); S(x, 40, 29, SLb) })
  eB.forEach(z => { F(30, 37, z, 30, 38, z, AIR); F(31, 37, z, 31, 38, z, GP); F(31, 37, z - 1, 31, 38, z - 1, CS); F(31, 37, z + 1, 31, 38, z + 1, CS); S(31, 39, z - 1, SST('south', 'bottom')); S(31, 39, z + 1, SST('north', 'bottom')); S(31, 39, z, CH); S(31, 40, z, SLb) })
  ;[3, 9, 15].forEach(x => S(x, 38, 18, GP)); ;[3, 11].forEach(z => S(20, 38, z, GP))
  ;[7, 15].forEach(x => { F(x, 42, 21, x, 44, 23, 'minecraft:bricks'); S(x, 45, 21, 'minecraft:decorated_pot'); S(x, 45, 23, 'minecraft:decorated_pot'); S(x, 45, 22, 'minecraft:flower_pot') })
  ;[7, 14].forEach(z => { F(23, 42, z, 25, 44, z, 'minecraft:bricks'); S(23, 45, z, 'minecraft:decorated_pot'); S(25, 45, z, 'minecraft:decorated_pot') })
  // dome d'angle en ardoise et paratonnerre
  for (var k = 0; k < 4; k++) {
    var y0 = 42 + 2 * k, y = y0 + 1, a = 24 + k, b = 30 - k, c1 = 22 + k, d = 28 - k
    if (a == b) { F(a, y0, c1, a, y0 + 1, c1, ARD); break }
    F(a, y0, c1, b, y, d, ARD); F(a, y, d, b, y, d, TOIT('north')); F(a, y, c1, b, y, c1, TOIT('south')); F(b, y, c1 + 1, b, y, d - 1, TOIT('west')); F(a, y, c1 + 1, a, y, d - 1, TOIT('east'))
  }
  S(27, 50, 25, 'minecraft:lightning_rod'); S(27, 42, 28, 'minecraft:glass'); S(30, 42, 25, 'minecraft:glass'); S(27, 44, 27, 'minecraft:glass'); S(29, 44, 25, 'minecraft:glass')
  // ---- cage d'escalier ----
  tour(20, 16, NB, ST); F(19, 1, 17, 19, 35, 18, ST); F(22, 1, 17, 22, 35, 18, ST); F(20, 1, 15, 21, 35, 15, ST)
  // ---- RDC : porte cochere et passage ----
  F(16, 0, 17, 18, 0, 29, 'minecraft:stone_bricks'); F(15, 1, 18, 15, 5, 28, ST); F(19, 1, 21, 19, 5, 28, ST)
  F(16, 1, 29, 18, 4, 29, AIR); PORTE(16, 1, 29, 'minecraft:dark_oak_door', 'south', 'left', 'true'); PORTE(18, 1, 29, 'minecraft:dark_oak_door', 'south', 'right', 'true')
  F(16, 3, 29, 18, 3, 29, 'minecraft:iron_bars'); S(17, 4, 29, 'minecraft:iron_bars'); S(16, 4, 29, SST('west', 'top')); S(18, 4, 29, SST('east', 'top')); S(17, 5, 29, CH)
  F(16, 1, 17, 18, 3, 17, AIR); S(16, 4, 17, SST('west', 'top')); S(18, 4, 17, SST('east', 'top')); S(17, 4, 17, 'minecraft:iron_bars'); S(17, 5, 17, CH)
  F(16, 2, 21, 16, 3, 23, 'minecraft:iron_trapdoor[facing=east,half=bottom,open=true]'); S(17, 5, 20, 'minecraft:lantern[hanging=true]'); S(17, 5, 26, 'minecraft:lantern[hanging=true]'); S(18, 1, 26, 'minecraft:potted_fern')
  PORTE(19, 1, 20, PB, 'west', 'left', 'false')
  // ---- RDC : cafe-brasserie ----
  for (var x = 1; x <= 14; x++) for (var z = 18; z <= 28; z++) S(x, 0, z, (x + z) % 2 ? 'minecraft:polished_blackstone' : 'minecraft:smooth_quartz')
  F(1, 1, 29, 14, 5, 29, AIR); F(1, 1, 29, 14, 1, 29, 'minecraft:dark_oak_planks'); F(1, 2, 29, 14, 4, 29, GP); F(1, 5, 29, 14, 5, 29, 'minecraft:dark_oak_planks'); ;[4, 11].forEach(x => F(x, 2, 29, x, 4, 29, 'minecraft:dark_oak_fence'))
  PORTE(7, 1, 29, 'mcwdoors:dark_oak_glass_door', 'north', 'left', 'false'); PORTE(8, 1, 29, 'mcwdoors:dark_oak_glass_door', 'north', 'right', 'false')
  F(1, 5, 30, 14, 5, 30, 'supplementaries:awning_red[facing=south]')
  F(2, 1, 20, 9, 1, 20, MAT('stripped_dark_oak_counter', 'south')); S(3, 2, 20, 'supplementaries:jar'); S(5, 2, 20, 'minecraft:candle[candles=3,lit=false]'); S(8, 2, 20, 'minecraft:brewing_stand')
  F(2, 1, 18, 9, 1, 18, MAT('stripped_dark_oak_counter', 'south')); for (var x = 2; x <= 9; x += 2) S(x, 2, 18, 'supplementaries:jar'); F(2, 3, 18, 9, 3, 18, 'mcwfurnitures:spruce_glass_kitchen_cabinet[facing=south]')
  ;[3, 5, 7, 9].forEach(x => S(x, 1, 21, 'mcwfurnitures:stripped_oak_stool_chair'))
  ;[[3, 23], [3, 26], [11, 23], [11, 26], [7, 23]].forEach(t => { S(t[0], 1, t[1], 'mcwfurnitures:dark_oak_table'); S(t[0] - 1, 1, t[1], MAT('dark_oak_chair', 'east')); S(t[0] + 1, 1, t[1], MAT('dark_oak_chair', 'west')); S(t[0], 2, t[1], 'minecraft:candle[candles=1,lit=false]') })
  ;[[4, 22], [10, 22], [7, 26]].forEach(c => S(c[0], 5, c[1], 'mcwlights:iron_chandelier')); S(14, 1, 19, 'minecraft:jukebox'); S(1, 1, 28, 'minecraft:potted_bamboo'); S(14, 1, 28, 'minecraft:potted_fern'); S(1, 1, 18, 'minecraft:barrel[facing=up,open=false]')
  PORTE(13, 1, 17, 'mcwdoors:dark_oak_classic_door', 'north', 'left', 'false'); ;[3, 9].forEach(x => F(x, 2, 17, x, 3, 17, GP))
  ;[3, 12].forEach(x => { S(x, 0, 31, 'mcwfurnitures:dark_oak_table'); S(x - 1, 0, 31, MAT('dark_oak_chair', 'east')); S(x + 1, 0, 31, MAT('dark_oak_chair', 'west')); S(x, 1, 31, 'minecraft:candle[candles=1,lit=false]') })
  // ---- RDC : pharmacie d'angle ----
  for (var x = 20; x <= 30; x++) for (var z = 22; z <= 28; z++) S(x, 0, z, (x + z) % 2 ? 'minecraft:smooth_quartz' : 'minecraft:polished_deepslate')
  F(19, 1, 21, 30, 5, 21, ST)
  F(20, 1, 29, 30, 5, 29, AIR); F(20, 1, 29, 30, 1, 29, 'minecraft:green_terracotta'); F(20, 2, 29, 30, 4, 29, GP); F(20, 5, 29, 30, 5, 29, 'minecraft:green_terracotta'); ;[22, 27].forEach(x => F(x, 2, 29, x, 4, 29, 'minecraft:dark_oak_fence'))
  PORTE(24, 1, 29, 'mcwdoors:dark_oak_glass_door', 'north', 'left', 'false'); PORTE(25, 1, 29, 'mcwdoors:dark_oak_glass_door', 'north', 'right', 'false')
  F(31, 2, 23, 31, 4, 27, GP); S(31, 1, 25, 'minecraft:green_terracotta')
  ;[[30, 4], [30, 3], [30, 5], [29, 4], [31, 4]].forEach(c => S(c[0], c[1], 30, 'minecraft:lime_stained_glass'))
  F(21, 1, 25, 28, 1, 25, MAT('stripped_spruce_counter', 'south')); S(22, 2, 25, 'minecraft:brewing_stand'); S(24, 2, 25, 'supplementaries:jar'); S(26, 2, 25, 'supplementaries:book_pile')
  for (var x = 20; x <= 30; x++) if (x != 27) { S(x, 1, 22, 'mcwfurnitures:spruce_double_drawer[facing=south,connection=single]'); S(x, 3, 22, 'mcwfurnitures:spruce_glass_kitchen_cabinet[facing=south]'); if (x % 2 == 0) S(x, 2, 22, 'supplementaries:jar') }
  F(20, 1, 27, 22, 1, 27, 'mcwfurnitures:spruce_bookshelf[facing=north,connection=base]'); F(28, 1, 27, 30, 1, 27, 'mcwfurnitures:spruce_bookshelf[facing=north,connection=base]')
  ;[[22, 24], [28, 24], [25, 27]].forEach(c => S(c[0], 5, c[1], 'mcwlights:tavern_lantern[hanging=true]')); S(29, 1, 26, 'minecraft:white_carpet'); S(23, 1, 28, 'minecraft:potted_cactus')
  PORTE(27, 1, 21, PB, 'north', 'left', 'false')
  // ---- RDC : reserve et remise sur cour ----
  F(20, 1, 14, 30, 5, 14, ST); F(23, 0, 15, 30, 0, 20, 'minecraft:stone')
  F(30, 1, 15, 30, 2, 20, 'minecraft:barrel[facing=up,open=false]'); S(26, 1, 15, 'minecraft:chest[facing=south]'); S(27, 1, 15, 'minecraft:chest[facing=south]'); F(23, 1, 15, 24, 1, 16, 'supplementaries:sack'); S(26, 5, 18, 'minecraft:lantern[hanging=true]')
  ;[17].forEach(z => F(31, 3, z, 31, 4, z, GP)); ;[3, 9].forEach(z => F(31, 3, z, 31, 4, z, GP))
  for (var x = 20; x <= 30; x++) for (var z = 1; z <= 13; z++) S(x, 0, z, R() < 0.15 ? 'minecraft:coarse_dirt' : 'minecraft:stone')
  F(19, 1, 6, 19, 3, 6, AIR); PORTE(19, 1, 5, 'minecraft:spruce_door', 'west', 'left', 'true'); PORTE(19, 1, 7, 'minecraft:spruce_door', 'west', 'right', 'true'); S(19, 3, 5, CS); S(19, 3, 7, CS)
  F(25, 1, 3, 26, 1, 6, 'minecraft:red_concrete'); F(25, 2, 4, 26, 2, 5, 'minecraft:tinted_glass'); ;[[25, 3], [26, 3], [25, 6], [26, 6]].forEach(c => S(c[0], 2, c[1], 'minecraft:smooth_stone_slab[type=bottom]'))
  S(30, 1, 3, 'minecraft:crafting_table'); S(30, 1, 5, 'minecraft:anvil[facing=north]'); S(30, 1, 7, 'minecraft:grindstone[face=floor,facing=north]'); F(30, 1, 9, 30, 1, 12, 'minecraft:barrel[facing=up,open=false]'); S(29, 1, 12, 'minecraft:chest[facing=west]')
  F(21, 1, 11, 22, 2, 12, 'minecraft:spruce_log[axis=z]'); S(27, 5, 10, 'minecraft:chain[axis=y]'); S(27, 4, 10, 'minecraft:lantern[hanging=true]'); S(22, 5, 4, 'minecraft:lantern[hanging=true]')
  // ---- cour : platane, bancs, massif, poubelles, vigne vierge ----
  F(0, 0, 0, 0, 4, 16, 'minecraft:bricks'); F(1, 0, 0, 18, 4, 0, 'minecraft:bricks'); F(0, 5, 0, 0, 5, 16, 'minecraft:stone_brick_slab[type=bottom]'); F(1, 5, 0, 18, 5, 0, 'minecraft:stone_brick_slab[type=bottom]')
  for (var z = 1; z <= 15; z++) if (R() < 0.6) { var hv = 1 + Math.floor(R() * 4); F(1, 5 - hv, z, 1, 4, z, 'minecraft:vine[west=true]') }
  F(1, -1, 6, 2, -1, 12, 'minecraft:grass_block'); for (var z = 6; z <= 12; z++) S(2, 0, z, choix(['minecraft:poppy', 'minecraft:oxeye_daisy', 'minecraft:azure_bluet', 'minecraft:cornflower', 'minecraft:short_grass']))
  S(9, -1, 8, 'minecraft:coarse_dirt'); F(9, 0, 8, 9, 6, 8, 'minecraft:oak_log[axis=y]')
  for (var dx = -3; dx <= 3; dx++) for (var dz = -3; dz <= 3; dz++) for (var y = 5; y <= 9; y++) { var dd = Math.abs(dx) + Math.abs(dz) + Math.abs(y - 7); if (dd < 4.5 && (Math.abs(dx) + Math.abs(dz) <= 3 || R() < 0.85)) SA(9 + dx, y, 8 + dz, 'minecraft:oak_leaves[persistent=true]') }
  S(6, 0, 8, MAT('oak_chair', 'east')); S(6, 0, 9, MAT('oak_chair', 'east')); S(12, 0, 8, MAT('oak_chair', 'west')); S(12, 0, 7, MAT('oak_chair', 'west'))
  S(2, 0, 1, 'minecraft:green_shulker_box'); S(3, 0, 1, 'minecraft:green_shulker_box'); S(4, 0, 1, 'minecraft:gray_shulker_box'); S(16, 0, 15, 'mcwlights:garden_light'); S(14, -1, 3, 'minecraft:spruce_trapdoor[facing=north,half=top,open=false]'); S(5, 0, 15, 'supplementaries:sack'); ;[4, 7, 10].forEach(x => { S(x, 0, 16, 'minecraft:moss_block'); S(x, 1, 16, x == 7 ? 'minecraft:flowering_azalea' : 'minecraft:azalea') }); S(17, 0, 1, 'minecraft:cauldron'); S(18, 0, 2, 'minecraft:composter')
  // ---- trottoir : platane d'alignement, reverbere ----
  S(21, -1, 31, 'minecraft:podzol'); F(21, 0, 31, 21, 4, 31, 'minecraft:oak_log[axis=y]')
  for (var dx = -2; dx <= 2; dx++) for (var dz = -1; dz <= 0; dz++) for (var y = 4; y <= 7; y++) if (Math.abs(dx) + Math.abs(y - 5.5) < 3 && (Math.abs(dx) <= 1 || R() < 0.8)) SA(21 + dx, y, 31 + dz, 'minecraft:oak_leaves[persistent=true]')
  F(15, 0, 31, 15, 3, 31, 'minecraft:dark_oak_fence'); S(15, 4, 31, 'minecraft:lantern'); S(18, 0, 31, 'minecraft:cauldron')
}


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
      var r = R(); return r < 0.4 ? 'minecraft:tuff' : r < 0.7 ? 'minecraft:dripstone_block' : r < 0.9 ? 'minecraft:andesite' : 'minecraft:granite'
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
    else if (i == 1) { S(a + 4, 13, 18, 'minecraft:loom[facing=south]'); S(a + 5, 13, 18, 'minecraft:cartography_table'); S(a + 6, 13, 18, 'minecraft:lantern'); F(a + 3, 13, 16, a + 6, 13, 16, 'minecraft:barrel[facing=up,open=false]'); S(a + 5, 13, 20, MAT('spruce_chair', 'south')) }
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
  W(27, 1, 29, 3, 0, 2, 'minecraft:spruce_planks'); PORTE(28, 0, 3, 'minecraft:spruce_door', 'south', 'left', 'false'); F(26, 3, 0, 30, 3, 4, 'minecraft:spruce_slab[type=bottom]'); S(28, 0, 2, 'minecraft:barrel[facing=up,open=false]'); S(28, 2, 2, 'minecraft:lantern[hanging=true]')
  F(22, -2, 3, 24, -2, 5, 'minecraft:clay'); F(22, -1, 3, 24, -1, 5, 'minecraft:water'); S(23, 0, 4, 'minecraft:lily_pad'); F(22, 0, 1, 25, 0, 1, 'minecraft:azalea_leaves[persistent=true]')
  // trottoir
  S(10, -1, 30, 'minecraft:podzol'); F(10, 0, 30, 10, 3, 30, 'minecraft:oak_log[axis=y]'); for (var dx = -2; dx <= 2; dx++) for (var dz = -1; dz <= 1; dz++) for (var y = 3; y <= 6; y++) if (Math.abs(dx) + Math.abs(dz) + Math.abs(y - 4.5) < 3.2 && 30 + dz <= 31) SA(10 + dx, y, 30 + dz, 'minecraft:oak_leaves[persistent=true]')
  F(20, 0, 31, 20, 3, 31, 'minecraft:dark_oak_fence'); S(20, 4, 31, 'minecraft:lantern')
}


// ================= GRAND CHALET FORESTIER (2 x 2 chunks) =================
function sapin(x, z, h) {
  F(x, 0, z, x, h, z, 'minecraft:spruce_log[axis=y]'); S(x, -1, z, 'minecraft:podzol')
  for (var y = 2; y <= h + 1; y++) { var r = Math.max(0, Math.floor((h + 1 - y) / 2.6)); if (y % 2 == 1 && r > 0) r-- ; for (var dx = -r; dx <= r; dx++) for (var dz = -r; dz <= r; dz++) if (Math.abs(dx) + Math.abs(dz) <= r && x + dx >= 0 && x + dx <= 31 && z + dz >= 0 && z + dz <= 31) SA(x + dx, y, z + dz, 'minecraft:spruce_leaves[persistent=true]') }
  SA(x, h + 1, z, 'minecraft:spruce_leaves[persistent=true]'); SA(x, h + 2, z, 'minecraft:spruce_leaves[persistent=true]')
}
function chaletGrand() {
  var SP = 'minecraft:spruce_planks', LOG = 'minecraft:spruce_log[axis=y]', SPF = 'minecraft:spruce_fence'
  F(0, -1, 0, 31, -1, 31, 'minecraft:grass_block')
  for (var x = 0; x <= 31; x++) for (var z = 0; z <= 31; z++) { var r = R(); if (r < 0.14) S(x, -1, z, 'minecraft:podzol'); else if (r < 0.2) S(x, -1, z, 'minecraft:coarse_dirt'); else if (r < 0.23) S(x, -1, z, 'minecraft:moss_block') }
  F(2, -1, 18, 2, -1, 31, 'minecraft:gravel'); F(1, -1, 13, 3, -1, 17, 'minecraft:gravel')
  // gros oeuvre : soubassement en pierre, etage en bois
  F(4, 0, 8, 27, 0, 23, SP)
  for (var y = 1; y <= 5; y++) { for (var x = 4; x <= 27; x++) { S(x, y, 8, choix(['minecraft:cobblestone', 'minecraft:stone_bricks', 'minecraft:mossy_cobblestone', 'minecraft:cobblestone'])); S(x, y, 23, choix(['minecraft:cobblestone', 'minecraft:stone_bricks', 'minecraft:mossy_cobblestone', 'minecraft:cobblestone'])) } for (var z = 9; z <= 22; z++) { S(4, y, z, choix(['minecraft:cobblestone', 'minecraft:stone_bricks', 'minecraft:mossy_cobblestone'])); S(27, y, z, choix(['minecraft:cobblestone', 'minecraft:stone_bricks', 'minecraft:mossy_cobblestone'])) } }
  F(4, 6, 8, 27, 6, 8, 'minecraft:stripped_spruce_log[axis=x]'); F(4, 6, 23, 27, 6, 23, 'minecraft:stripped_spruce_log[axis=x]'); F(4, 6, 9, 4, 6, 22, 'minecraft:stripped_spruce_log[axis=z]'); F(27, 6, 9, 27, 6, 22, 'minecraft:stripped_spruce_log[axis=z]')
  F(4, 7, 8, 27, 11, 8, SP); F(4, 7, 23, 27, 11, 23, SP); F(4, 7, 9, 4, 11, 22, SP); F(27, 7, 9, 27, 11, 22, SP)
  ;[4, 9, 14, 22, 27].forEach(x => { F(x, 7, 8, x, 11, 8, LOG); F(x, 7, 23, x, 11, 23, LOG) }); ;[13, 17].forEach(z => { F(4, 7, z, 4, 11, z, LOG); F(27, 7, z, 27, 11, z, LOG) })
  F(5, 6, 9, 26, 6, 22, SP); F(4, 12, 8, 27, 12, 23, SP)
  for (var k = 0; k <= 8; k++) {
    var y = 12 + k, zs = 24 - k, zn = 7 + k
    F(3, y, zs, 28, y, zs, TOIT('north', 'spruce')); F(3, y, zn, 28, y, zn, TOIT('south', 'spruce'))
    if (k > 0 && zn + 1 <= zs - 1) { F(4, y, zn + 1, 4, y, zs - 1, SP); F(27, y, zn + 1, 27, y, zs - 1, SP) }
  }
  F(4, 14, 15, 4, 16, 16, GP); F(27, 14, 15, 27, 16, 16, GP)
  F(28, 0, 9, 29, 21, 11, 'minecraft:cobblestone'); F(28, 22, 9, 29, 22, 11, 'minecraft:cobblestone_slab[type=bottom]'); S(29, 22, 10, 'minecraft:campfire[lit=false,signal_fire=false]')
  // cloisons et couloir (z15), hall d'escalier (x19..26, z9..13)
  for (var y0 = 0; y0 <= 6; y0 += 6) {
    F(5, y0 + 1, 16, 26, y0 + 5, 16, SP); F(5, y0 + 1, 14, 26, y0 + 5, 14, SP)
    ;[14, 22].forEach(x => F(x, y0 + 1, 17, x, y0 + 5, 22, SP)); ;[12, 18].forEach(x => F(x, y0 + 1, 9, x, y0 + 5, 13, SP))
    F(6, y0 + 1, 15, 25, y0 + 1, 15, y0 ? 'minecraft:green_carpet' : 'minecraft:brown_carpet'); ;[8, 14, 20, 25].forEach(x => S(x, y0 + 5, 15, 'minecraft:lantern[hanging=true]'))
    PORTE(22, y0 + 1, 14, 'mcwdoors:spruce_classic_door', 'south', 'left', 'false')
    F(27, y0 + 2, 15, 27, y0 + 4, 15, GP)
  }
  for (var k = 0; k <= 5; k++) { S(19 + k, 1 + k, 9, 'minecraft:spruce_stairs[facing=east,half=bottom,shape=straight]'); if (k > 0) F(19 + k, 1, 9, 19 + k, k, 9, SP) }
  F(19, 6, 9, 23, 6, 9, AIR); F(19, 7, 10, 23, 7, 10, SPF); S(26, 1, 13, 'minecraft:potted_fern'); S(20, 1, 13, 'mcwfurnitures:spruce_end_table'); S(20, 2, 13, 'minecraft:lantern'); S(25, 7, 13, 'minecraft:barrel[facing=up,open=false]')
  ;[[26, 10], [26, 12]].forEach(c => S(c[0], 1, c[1], MAT('spruce_chair', 'west'))); S(23, 5, 11, 'mcwlights:iron_chandelier')
  // pieces
  var c
  c = cadre(5, 17, 13, 22, 'south', 0); piece(c, 'salon', 0); c.porte('mcwdoors:spruce_classic_door')
  c = cadre(15, 17, 21, 22, 'south', 0); piece(c, 'salle', 0); c.porte('mcwdoors:spruce_classic_door')
  c = cadre(23, 17, 26, 22, 'south', 0); piece(c, 'bureau', 0); c.porte('mcwdoors:spruce_classic_door')
  c = cadre(5, 9, 11, 13, 'north', 0); piece(c, 'cuisine', 0); c.porte('mcwdoors:spruce_classic_door')
  c = cadre(13, 9, 17, 13, 'north', 0); piece(c, 'sdb', 0); c.porte('mcwdoors:spruce_classic_door')
  c = cadre(5, 17, 13, 22, 'south', 6); piece(c, 'chambre', 0); c.porte('mcwdoors:spruce_classic_door')
  c = cadre(15, 17, 21, 22, 'south', 6); piece(c, 'chambre', 0); c.porte('mcwdoors:spruce_classic_door')
  c = cadre(23, 17, 26, 22, 'south', 6); piece(c, 'chambre', 0); c.porte('mcwdoors:spruce_classic_door')
  c = cadre(5, 9, 11, 13, 'north', 6); piece(c, 'chambre', 0); c.porte('mcwdoors:spruce_classic_door')
  c = cadre(13, 9, 17, 13, 'north', 6); piece(c, 'sdb', 0); c.porte('mcwdoors:spruce_classic_door')
  // ouvertures
  PORTE(4, 1, 15, 'mcwdoors:spruce_classic_door', 'west', 'left', 'false')
  ;[6, 7, 10, 11, 16, 17, 19, 20, 24, 25].forEach(x => F(x, 2, 23, x, 4, 23, GP))
  ;[6, 7, 12, 16, 20, 24, 25].forEach(x => F(x, 8, 23, x, 10, 23, GP))
  PORTE(10, 7, 23, 'mcwdoors:spruce_glass_door', 'south', 'left', 'false'); PORTE(18, 7, 23, 'mcwdoors:spruce_glass_door', 'south', 'left', 'false')
  ;[7, 8, 15, 21, 24].forEach(x => F(x, 3, 8, x, 4, 8, GP)); ;[7, 11, 15, 21, 24].forEach(x => F(x, 8, 8, x, 10, 8, GP))
  ;[11, 19].forEach(z => { F(4, 2, z, 4, 4, z, GP); F(4, 8, z, 4, 10, z, GP) }); F(27, 8, 12, 27, 10, 12, GP); F(27, 8, 19, 27, 10, 19, GP); F(27, 2, 20, 27, 3, 20, GP); F(27, 2, 12, 27, 3, 12, GP)
  // porche ouest
  F(1, 0, 13, 3, 0, 17, 'minecraft:spruce_slab[type=bottom]'); F(1, 0, 13, 1, 4, 13, LOG); F(1, 0, 17, 1, 4, 17, LOG); F(0, 5, 12, 3, 5, 18, 'minecraft:spruce_slab[type=bottom]'); S(1, 4, 15, 'minecraft:lantern[hanging=true]')
  // balcon filant sud et terrasse
  F(3, -1, 24, 28, -1, 28, SP); F(3, 6, 24, 28, 6, 25, SP); ;[4, 10, 16, 22, 27].forEach(x => F(x, 0, 25, x, 5, 25, LOG))
  F(3, 7, 25, 28, 7, 25, SPF); S(3, 7, 24, SPF); S(28, 7, 24, SPF)
  ;[7, 13, 20].forEach(x => S(x, 7, 24, MAT('spruce_chair', 'south'))); ;[5, 15, 25].forEach(x => S(x, 7, 24, 'minecraft:potted_red_tulip'))
  S(13, 0, 27, 'mcwfurnitures:spruce_table'); S(12, 0, 27, MAT('spruce_chair', 'east')); S(14, 0, 27, MAT('spruce_chair', 'west')); S(13, 1, 27, 'minecraft:candle[candles=3,lit=false]')
  F(19, 0, 27, 20, 0, 27, 'mcwfurnitures:white_couch[facing=south,shape=single]'); S(21, 0, 27, 'minecraft:potted_azalea_bush'); ;[[7, 5, 24], [19, 5, 24]].forEach(c => S(c[0], c[1], c[2], 'minecraft:lantern[hanging=true]'))
  // foyer exterieur, bucher, souche
  S(8, 0, 30, 'minecraft:campfire[lit=true]'); F(7, 0, 29, 9, 0, 29, 'minecraft:stripped_spruce_log[axis=x]'); F(7, 0, 31, 9, 0, 31, 'minecraft:stripped_spruce_log[axis=x]')
  F(5, 0, 6, 12, 1, 6, 'minecraft:spruce_log[axis=x]'); S(5, 2, 6, 'minecraft:spruce_log[axis=x]'); S(14, 0, 5, 'minecraft:stripped_spruce_log[axis=y]'); S(15, 0, 5, 'minecraft:chopping_block'.replace('minecraft:chopping_block', 'minecraft:spruce_log[axis=x]'))
  // foret
  sapin(1, 2, 10); sapin(30, 2, 11); sapin(30, 29, 9); sapin(24, 3, 8); sapin(0, 8, 7)
  for (var x = 0; x <= 31; x++) for (var z = 0; z <= 31; z++) {
    var dans = (x >= 3 && x <= 31 && z >= 7 && z <= 28) || (x <= 3 && z >= 12) || (z >= 29 && x >= 6 && x <= 10) || (z <= 6 && x >= 5 && x <= 15)
    if (dans) continue
    var r = R(); if (r < 0.06) SA(x, 0, z, 'minecraft:fern'); else if (r < 0.09) SA(x, 0, z, 'minecraft:sweet_berry_bush[age=3]'); else if (r < 0.11) SA(x, 0, z, 'minecraft:mossy_cobblestone'); else if (r < 0.15) SA(x, 0, z, 'minecraft:short_grass')
  }
}

// ================= MANOIR NEO-GOTHIQUE (2 x 2 chunks) =================
function manoirGothique() {
  var DB = 'minecraft:deepslate_bricks', DT = 'minecraft:deepslate_tiles', PBB = 'minecraft:polished_blackstone_bricks', CPB = 'minecraft:chiseled_polished_blackstone', WD = 'minecraft:dark_oak_planks', PD = 'mcwdoors:dark_oak_classic_door'
  F(0, -1, 0, 31, -1, 31, 'minecraft:grass_block')
  for (var x = 0; x <= 31; x++) for (var z = 0; z <= 31; z++) { var r = R(); if (r < 0.15) S(x, -1, z, 'minecraft:coarse_dirt'); else if (r < 0.2) S(x, -1, z, 'minecraft:podzol') }
  F(11, -1, 22, 12, -1, 31, 'minecraft:gravel')
  // corps principal x5..24 z10..21, 3 niveaux
  F(5, 0, 10, 24, 0, 21, 'minecraft:polished_deepslate')
  for (var y = 1; y <= 17; y++) for (var x = 5; x <= 24; x++) for (var z = 10; z <= 21; z++) if (x == 5 || x == 24 || z == 10 || z == 21) S(x, y, z, (x == 5 || x == 24) && (z == 10 || z == 21) ? PBB : R() < 0.12 ? 'minecraft:cracked_deepslate_bricks' : DB)
  ;[6, 12].forEach(y => { F(6, y, 11, 23, y, 20, WD); F(5, y, 10, 24, y, 10, PBB); F(5, y, 21, 24, y, 21, PBB); F(5, y, 10, 5, y, 21, PBB); F(24, y, 10, 24, y, 21, PBB) })
  F(5, 18, 10, 24, 18, 21, DB)
  for (var k = 0; k <= 6; k++) {
    var y = 18 + k, zs = 22 - k, zn = 9 + k
    F(4, y, zs, 25, y, zs, TOIT('north')); F(4, y, zn, 25, y, zn, TOIT('south'))
    if (k > 0 && zn + 1 <= zs - 1) { F(5, y, zn + 1, 5, y, zs - 1, DB); F(24, y, zn + 1, 24, y, zs - 1, DB) }
  }
  ;[5, 24].forEach(x => { F(x, 25, 15, x, 26, 16, PBB); S(x, 27, 15, 'minecraft:end_rod[facing=up]') })
  F(8, 19, 15, 8, 27, 16, DB); S(8, 28, 15, 'minecraft:decorated_pot'); S(8, 28, 16, 'minecraft:decorated_pot')
  // escalier (hall x6..13 z11..13) : volee 1 vers l'est, volee 2 vers l'ouest
  for (var k = 0; k <= 5; k++) { S(6 + k, 1 + k, 11, 'minecraft:dark_oak_stairs[facing=east,half=bottom,shape=straight]'); if (k > 0) F(6 + k, 1, 11, 6 + k, k, 11, WD) }
  F(6, 6, 11, 10, 6, 11, AIR)
  for (var k = 0; k <= 5; k++) { S(12 - k, 7 + k, 13, 'minecraft:dark_oak_stairs[facing=west,half=bottom,shape=straight]'); if (k > 0) F(12 - k, 7, 13, 12 - k, 6 + k, 13, WD) }
  F(8, 12, 13, 12, 12, 13, AIR); F(8, 13, 12, 12, 13, 12, 'mcwfences:ornate_metal_fence'); F(7, 7, 12, 10, 7, 12, 'mcwfences:ornate_metal_fence')
  // cloisons et couloir z15
  for (var f = 0; f < 3; f++) {
    var y = 6 * f
    F(6, y + 1, 14, 23, y + 5, 14, DB); F(6, y + 1, 16, 19, y + 5, 16, DB); F(14, y + 1, 11, 14, y + 5, 13, DB); F(10, y + 1, 17, 10, y + 5, 20, DB); F(13, y + 1, 17, 13, y + 5, 20, DB)
    F(7, y + 1, 15, 22, y + 1, 15, 'minecraft:purple_carpet'); ;[8, 14, 20].forEach(x => S(x, y + 5, 15, 'minecraft:soul_lantern[hanging=true]'))
    F(24, y + 2, 15, 24, y + 4, 15, GP)
  }
  F(11, 1, 16, 12, 3, 16, AIR); PORTE(9, 1, 14, PD, 'south', 'left', 'false'); PORTE(13, 7, 14, PD, 'south', 'left', 'false'); PORTE(6, 13, 14, PD, 'south', 'left', 'false')
  var c
  c = cadre(6, 17, 9, 20, 'south', 0); piece(c, 'bureau', 0); c.porte(PD)
  c = cadre(14, 17, 19, 20, 'south', 0); piece(c, 'salon', 0); c.porte(PD)
  c = cadre(15, 11, 23, 13, 'north', 0); piece(c, 'cuisine', 0); c.porte(PD)
  c = cadre(6, 17, 9, 20, 'south', 6); piece(c, 'chambre', 0); c.porte(PD)
  c = cadre(14, 17, 19, 20, 'south', 6); piece(c, 'chambre', 0); c.porte(PD)
  c = cadre(15, 11, 23, 13, 'north', 6); piece(c, 'sdb', 0); c.porte(PD)
  c = cadre(6, 17, 9, 20, 'south', 12); piece(c, 'chambre', 1); c.porte(PD)
  c = cadre(14, 17, 19, 20, 'south', 12); piece(c, 'bureau', 0); c.porte(PD)
  c = cadre(15, 11, 23, 13, 'north', 12); piece(c, 'chambre', 0); c.porte(PD)
  // vestibule (x11..12) : dallage, armures factices, double porte d'entree
  for (var z = 17; z <= 20; z++) { S(11, 0, z, z % 2 ? 'minecraft:polished_blackstone' : 'minecraft:smooth_quartz'); S(12, 0, z, z % 2 ? 'minecraft:smooth_quartz' : 'minecraft:polished_blackstone') }
  S(11, 5, 18, 'mcwlights:iron_chandelier'); F(11, 7, 18, 12, 7, 20, 'minecraft:red_carpet'); F(11, 7, 17, 11, 9, 17, 'minecraft:bookshelf'); S(11, 7, 19, MAT('dark_oak_chair', 'east')); S(12, 11, 18, 'minecraft:soul_lantern[hanging=true]')
  F(11, 13, 17, 11, 14, 17, 'minecraft:bookshelf'); S(11, 13, 19, 'minecraft:chest[facing=east]'); S(12, 13, 20, 'minecraft:skeleton_skull[rotation=8]'); S(12, 17, 18, 'minecraft:soul_lantern[hanging=true]')
  PORTE(12, 7, 16, PD, 'south', 'left', 'false'); PORTE(12, 13, 16, PD, 'south', 'left', 'false')
  PORTE(11, 1, 21, PD, 'south', 'left', 'false'); PORTE(12, 1, 21, PD, 'south', 'right', 'false'); F(11, 3, 21, 12, 4, 21, 'minecraft:purple_stained_glass_pane')
  // fenetres en lancette
  function lancette(x, y, z, h) { F(x, y, z, x, y + h - 1, z, 'minecraft:gray_stained_glass_pane'); S(x, y + h, z, CPB) }
  ;[0, 6, 12].forEach(y => { ;[7, 8, 15, 16, 18].forEach(x => { lancette(x, y + 2, 21, 3); lancette(x, y + 2, 10, 3) }); lancette(12, y + 2, 10, 3); ;[12, 19].forEach(z => lancette(5, y + 2, z, 3)); lancette(24, y + 2, 12, 3) })
  ;[11, 12].forEach(x => lancette(x, 8, 21, 3)); ;[11, 12].forEach(x => lancette(x, 14, 21, 3))
  ;[6, 15].forEach(x0 => { F(x0, 19, 19, x0 + 2, 21, 21, DB); lancette(x0 + 1, 19, 21, 2); F(x0, 22, 19, x0, 22, 21, TOIT('east')); F(x0 + 2, 22, 19, x0 + 2, 22, 21, TOIT('west')); F(x0 + 1, 22, 19, x0 + 1, 22, 21, DB); F(x0 + 1, 23, 19, x0 + 1, 23, 21, 'minecraft:deepslate_tile_slab[type=bottom]') })
  // porche a pignon
  F(10, 0, 22, 13, 0, 24, PBB); F(10, 0, 25, 13, 0, 25, 'minecraft:polished_blackstone_brick_stairs[facing=north,half=bottom,shape=straight]'); F(9, 0, 24, 9, 4, 24, PBB); F(14, 0, 24, 14, 4, 24, PBB); F(9, 0, 22, 9, 4, 22, PBB); F(14, 0, 22, 14, 4, 22, PBB)
  for (var k = 0; k <= 2; k++) { F(9 + k, 5 + k, 22, 9 + k, 5 + k, 25, TOIT('east')); F(14 - k, 5 + k, 22, 14 - k, 5 + k, 25, TOIT('west')) }
  F(10, 5, 22, 13, 5, 25, DB); F(11, 6, 22, 12, 6, 25, DB); S(11, 4, 23, 'minecraft:soul_lantern[hanging=true]')
  // tour d'angle x20..25 z16..23, beffroi et fleche
  F(21, 18, 17, 24, 29, 22, AIR)
  for (var y = 0; y <= 30; y++) for (var x = 20; x <= 25; x++) for (var z = 16; z <= 23; z++) { var bord = x == 20 || x == 25 || z == 16 || z == 23; if (bord) S(x, y, z, (x == 20 || x == 25) && (z == 16 || z == 23) ? PBB : y % 6 == 0 ? PBB : DB); else if (y % 6 == 0) S(x, y, z, y == 30 ? DT : WD); else S(x, y, z, AIR) }
  for (var yy = 6; yy <= 24; yy += 6) S(24, yy, 17, AIR); F(24, 1, 17, 24, 24, 17, 'minecraft:ladder[facing=south]')
  for (var f = 0; f < 3; f++) PORTE(22, 6 * f + 1, 16, PD, 'north', 'left', 'false')
  ;[2, 8, 14, 20].forEach(y => { lancette(22, y, 23, 3); lancette(23, y, 23, 3); lancette(25, y, 19, 3); lancette(25, y, 20, 3) })
  ;[[22, 23], [23, 23]].forEach(c => F(c[0], 26, c[1], c[0], 28, c[1], AIR)); F(25, 26, 19, 25, 28, 20, AIR); F(20, 26, 19, 20, 28, 20, AIR)
  S(22, 29, 19, 'minecraft:bell[attachment=ceiling,facing=north]')
  F(21, 1, 22, 21, 3, 22, 'minecraft:bookshelf'); F(24, 1, 21, 24, 3, 22, 'minecraft:bookshelf'); F(21, 1, 18, 21, 3, 21, 'minecraft:bookshelf'); S(23, 1, 19, MAT('dark_oak_chair', 'south')); S(22, 5, 19, 'minecraft:soul_lantern[hanging=true]')
  S(22, 7, 21, 'mcwfurnitures:dark_oak_table'); S(22, 7, 20, MAT('dark_oak_chair', 'south')); S(22, 8, 21, 'minecraft:candle[candles=4,lit=false]'); S(21, 7, 22, 'minecraft:skeleton_skull[rotation=8]'); S(22, 11, 19, 'minecraft:soul_lantern[hanging=true]')
  S(22, 13, 20, 'supplementaries:globe_sepia'); S(23, 13, 22, 'minecraft:lectern[facing=north]'); S(21, 13, 18, 'minecraft:chest[facing=east]'); S(22, 17, 19, 'minecraft:soul_lantern[hanging=true]')
  S(22, 19, 20, 'minecraft:cauldron'); F(21, 19, 22, 21, 20, 22, 'minecraft:cobweb')
  for (var k = 0; k < 4; k++) {
    var y0 = 31 + 2 * k, a = 20 + k, b = 25 - k, c1 = 16 + k, d = 23 - k
    if (b < a) break
    F(a, y0, c1, b, y0 + 1, d, DT); F(a, y0 + 1, d, b, y0 + 1, d, TOIT('north')); F(a, y0 + 1, c1, b, y0 + 1, c1, TOIT('south')); if (d - c1 > 1) { F(b, y0 + 1, c1 + 1, b, y0 + 1, d - 1, TOIT('west')); F(a, y0 + 1, c1 + 1, a, y0 + 1, d - 1, TOIT('east')) }
  }
  F(22, 37, 19, 22, 38, 19, 'minecraft:lightning_rod'.replace('lightning_rod', 'polished_blackstone_wall')); S(22, 39, 19, 'minecraft:lightning_rod')
  // parc : grille, portail, arbres morts, petit cimetiere, mausolee
  F(0, 0, 31, 31, 0, 31, PBB); F(0, 1, 31, 31, 2, 31, 'mcwfences:ornate_metal_fence'); F(0, 0, 0, 0, 2, 30, 'mcwfences:ornate_metal_fence'); F(31, 0, 0, 31, 2, 30, 'mcwfences:ornate_metal_fence'); F(1, 0, 0, 30, 2, 0, 'mcwfences:ornate_metal_fence')
  F(11, 0, 31, 12, 2, 31, AIR); F(10, 0, 31, 10, 3, 31, PBB); F(13, 0, 31, 13, 3, 31, PBB); S(10, 4, 31, 'minecraft:soul_lantern'); S(13, 4, 31, 'minecraft:soul_lantern'); S(11, 0, 31, 'minecraft:dark_oak_fence_gate[facing=south,open=true,in_wall=false]'); S(12, 0, 31, 'minecraft:dark_oak_fence_gate[facing=south,open=true,in_wall=false]')
  function arbreMort(x, z, h) { F(x, 0, z, x, h, z, 'minecraft:dark_oak_log[axis=y]'); F(x + 1, h - 1, z, x + 2, h - 1, z, 'minecraft:dark_oak_log[axis=x]'); S(x + 2, h, z, 'minecraft:dark_oak_log[axis=y]'); F(x, h - 2, z - 2, x, h - 2, z - 1, 'minecraft:dark_oak_log[axis=z]'); S(x, h - 1, z - 2, 'minecraft:dark_oak_log[axis=y]') }
  arbreMort(3, 26, 6); arbreMort(18, 28, 5); arbreMort(2, 6, 7)
  for (var gx = 26; gx <= 30; gx += 2) for (var gz = 24; gz <= 29; gz += 3) { S(gx, -1, gz, 'minecraft:coarse_dirt'); S(gx, -1, gz + 1, 'minecraft:coarse_dirt'); S(gx, 0, gz - 1, choix(['minecraft:stone_brick_wall', 'minecraft:mossy_stone_brick_wall', 'minecraft:cobblestone_wall'])); if (R() < 0.5) S(gx, 1, gz - 1, 'minecraft:candle[candles=1,lit=false]') }
  F(26, -1, 2, 30, -1, 7, 'minecraft:polished_deepslate'); W(26, 2, 30, 6, 0, 3, DB); F(26, 4, 2, 30, 4, 6, 'minecraft:deepslate_tile_slab[type=bottom]'); F(28, 0, 6, 28, 1, 6, 'minecraft:iron_bars'); S(28, 2, 6, CPB); S(28, 0, 4, 'minecraft:polished_blackstone_slab[type=top]'.replace('[type=top]', '[type=bottom]')); S(28, 3, 4, 'minecraft:soul_lantern[hanging=true]')
  for (var x = 0; x <= 31; x++) for (var z = 0; z <= 31; z++) { var dans = (x >= 4 && x <= 25 && z >= 9 && z <= 25) || (x >= 25 && z >= 1 && z <= 7) || (x >= 10 && x <= 13 && z >= 22) || x == 0 || x == 31 || z == 0 || z == 31 || (x >= 25 && z >= 22); if (dans) continue; var r = R(); if (r < 0.05) SA(x, 0, z, 'minecraft:dead_bush'.replace('dead_bush', 'short_grass')); else if (r < 0.08) SA(x, 0, z, 'minecraft:fern') }
}


// ================= TOUR DE BUREAUX EN VERRE (2 x 2 chunks, R+9) =================
function tourBureaux() {
  var VE = 'minecraft:cyan_stained_glass', MU = 'minecraft:light_gray_concrete', BA = 'minecraft:smooth_quartz', SOL = 'minecraft:polished_andesite'
  var VP = 'minecraft:light_gray_stained_glass_pane', PV = 'mcwdoors:birch_glass_door', BW = ['oak', 'birch', 'dark_oak', 'spruce']
  function rideau(x1, z1, x2, z2, y, sans) {
    for (var yy = y + 1; yy <= y + 5; yy++) {
      for (var x = x1; x <= x2; x++) [z1, z2].forEach(z => { if (sans && z == sans) return; S(x, yy, z, x == x1 || x == x2 || yy == y + 5 || (x - x1) % 3 == 0 ? MU : VE) })
      for (var z = z1 + 1; z < z2; z++) [x1, x2].forEach(x => S(x, yy, z, yy == y + 5 || (z - z1) % 3 == 0 ? MU : VE))
    }
  }
  function bac(x, y, z, p) { S(x, y, z, 'minecraft:moss_block'); S(x, y + 1, z, p || choix(['minecraft:flowering_azalea', 'minecraft:azalea', 'minecraft:fern'])) }
  // sol du terrain
  F(0, -1, 0, 31, -1, 31, 'minecraft:gray_concrete'); F(0, -1, 0, 31, -1, 3, 'minecraft:grass_block')
  for (var x = 0; x <= 31; x++) for (var z = 29; z <= 31; z++) S(x, -1, z, (x + z) % 2 ? 'minecraft:smooth_stone' : 'minecraft:polished_andesite')
  ;[6, 9, 12, 15, 18].forEach(z => F(0, -1, z, 4, -1, z, 'minecraft:white_concrete'))
  // etages
  for (var k = 0; k <= 9; k++) {
    var y = 6 * k, zS = k >= 7 ? 17 : 22, zD = k >= 8 ? 17 : 22
    F(7, y, 5, 24, y, zD, SOL); W(7, 5, 24, zD, y, y, BA)
    rideau(7, 5, 24, zS, y)
  }
  F(7, 60, 5, 24, 60, 17, SOL); W(7, 5, 24, 17, 60, 61, BA)
  tour(15, 7, 9, MU)
  for (var k = 0; k <= 9; k++) {
    var y = 6 * k, zS = k >= 7 ? 17 : 22, w = choix(BW), w2 = choix(BW), etat = k == 5 ? 1 : 0
    // noyau : cage d'escalier, ascenseur, sanitaires
    F(14, y + 1, 12, 17, y + 5, 12, MU); F(15, y + 1, 12, 16, y + 3, 12, AIR)
    F(18, y + 1, 6, 20, y + 5, 12, MU); PORTE(19, y + 1, 12, 'minecraft:iron_door', 'south', 'left', 'false'); S(20, y + 2, 13, 'minecraft:stone_button[face=wall,facing=south,powered=false]')
    F(21, y + 1, 12, 23, y + 5, 12, MU); PORTE(22, y + 1, 12, 'minecraft:birch_door', 'south', 'left', 'false')
    for (var x = 21; x <= 23; x++) for (var z = 6; z <= 11; z++) S(x, y, z, (x + z) % 2 ? 'minecraft:smooth_quartz' : 'minecraft:polished_diorite')
    S(21, y + 1, 6, 'minecraft:quartz_stairs[facing=north,half=bottom,shape=straight]'); S(23, y + 1, 6, 'minecraft:quartz_stairs[facing=north,half=bottom,shape=straight]'); F(22, y + 1, 6, 22, y + 3, 7, 'minecraft:white_concrete')
    S(23, y + 1, 9, 'mcwfurnitures:birch_kitchen_sink[facing=west,water=false]'); S(23, y + 1, 10, 'mcwfurnitures:birch_kitchen_sink[facing=west,water=false]'); S(21, y + 1, 11, 'minecraft:potted_bamboo')
    // zone ouest (x8..13 z6..11) derriere une cloison vitree
    F(8, y + 1, 12, 13, y + 5, 12, VP); PORTE(12, y + 1, 12, PV, 'south', 'left', 'false')
    if (k == 0) {
      F(9, 1, 7, 11, 1, 7, 'mcwfurnitures:dark_oak_desk[facing=north,connection=single]'); F(9, 2, 7, 11, 2, 7, 'minecraft:black_stained_glass_pane'); S(9, 1, 8, MAT('oak_modern_chair', 'north')); S(11, 1, 8, MAT('oak_modern_chair', 'north'))
      F(8, 1, 10, 8, 2, 11, 'minecraft:barrel[facing=east,open=false]'); S(13, 1, 6, 'minecraft:chest[facing=west]'); S(8, 1, 6, 'minecraft:potted_fern')
    } else if (k % 3 == 1) {
      F(9, y + 1, 8, 12, y + 1, 9, 'mcwfurnitures:' + w + '_glass_table'); for (var x = 9; x <= 12; x++) { S(x, y + 1, 7, MAT(w2 + '_modern_chair', 'south')); S(x, y + 1, 10, MAT(w2 + '_modern_chair', 'north')) }
      S(8, y + 1, 8, MAT(w2 + '_modern_chair', 'east')); S(13, y + 1, 9, MAT(w2 + '_modern_chair', 'west')); S(8, y + 1, 6, 'minecraft:potted_bamboo'); S(13, y + 1, 6, 'minecraft:potted_azalea_bush'); S(10, y + 2, 8, 'minecraft:heavy_weighted_pressure_plate'); S(11, y + 2, 9, 'supplementaries:book_pile')
    } else if (k % 3 == 2) {
      ;[7, 9].forEach(z => F(8, y + 1, z, 11, y + 3, z, 'minecraft:bookshelf')); F(8, y + 1, 11, 10, y + 1, 11, 'minecraft:barrel[facing=up,open=false]'); S(13, y + 1, 6, 'minecraft:chest[facing=west]'); S(13, y + 1, 8, 'minecraft:ladder[facing=west]'.replace('minecraft:ladder[facing=west]', 'minecraft:decorated_pot'))
      if (etat) { S(9, y + 1, 8, 'supplementaries:sack'); S(11, y + 1, 10, 'minecraft:white_carpet') }
    } else {
      S(9, y + 1, 8, 'mcwfurnitures:' + w + '_table'); S(10, y + 1, 8, 'mcwfurnitures:' + w + '_table'); S(9, y + 1, 7, MAT(w + '_chair', 'south')); S(9, y + 1, 9, MAT(w2 + '_modern_chair', 'north')); S(10, y + 1, 9, MAT(w2 + '_modern_chair', 'north'))
      S(9, y + 2, 8, 'minecraft:heavy_weighted_pressure_plate'); S(10, y + 2, 8, 'supplementaries:book_pile'); F(13, y + 1, 7, 13, y + 1, 9, 'mcwfurnitures:' + choix(CANAPES) + '_couch[facing=west,shape=single]'); S(12, y + 1, 8, 'mcwfurnitures:' + w + '_coffee_table')
      F(8, y + 1, 6, 8, y + 2, 8, 'minecraft:bookshelf'); S(8, y + 1, 11, 'minecraft:potted_azalea_bush'); S(11, y + 1, 6, 'supplementaries:globe')
    }
    // plateau principal (z13..zS-1)
    if (k == 0) {
      for (var x = 8; x <= 23; x++) for (var z = 13; z <= 21; z++) S(x, 0, z, (x + z) % 2 ? 'minecraft:smooth_quartz' : 'minecraft:polished_diorite')
      F(9, 1, 16, 13, 1, 16, 'minecraft:smooth_quartz_slab[type=top]'); S(13, 1, 15, 'minecraft:smooth_quartz_slab[type=top]'); S(11, 1, 15, MAT('dark_oak_modern_chair', 'south')); S(10, 2, 16, 'minecraft:heavy_weighted_pressure_plate'); S(12, 2, 16, 'minecraft:potted_white_tulip')
      F(18, 1, 20, 20, 1, 20, 'mcwfurnitures:black_couch[facing=north,shape=single]'); S(19, 1, 19, 'mcwfurnitures:dark_oak_coffee_table'); S(17, 1, 19, MAT('dark_oak_modern_chair', 'east')); S(21, 1, 19, MAT('dark_oak_modern_chair', 'west')); S(19, 2, 19, 'supplementaries:book_pile')
      bac(8, 1, 21); bac(23, 1, 21); bac(13, 1, 21); bac(18, 1, 21); bac(8, 1, 14); bac(23, 1, 14)
      PORTE(15, 1, 22, PV, 'south', 'left', 'false'); PORTE(16, 1, 22, PV, 'south', 'right', 'false'); PORTE(24, 1, 19, 'minecraft:iron_door', 'east', 'left', 'false')
    } else if (k % 3 == 1) {
      var rangs = zS == 22 ? [14, 18] : [14]
      F(8, y + 1, 13, 23, y + 1, zS - 1, 'minecraft:gray_carpet')
      rangs.forEach(r => { for (var x = 8; x <= 21; x++) if ((x - 8) % 5 < 4) { S(x, y + 1, r, 'mcwfurnitures:' + w + '_desk[facing=north,connection=single]'); var p = R(); if (p < 0.55) S(x, y + 2, r, 'minecraft:heavy_weighted_pressure_plate'); else if (p < 0.75) S(x, y + 2, r, 'supplementaries:book_pile'); else if (p < 0.85) S(x, y + 2, r, 'minecraft:potted_cactus'); S(x, y + 1, r + 1, MAT(w2 + '_modern_chair', 'north')) } })
      S(23, y + 1, 13, 'minecraft:dropper[facing=up,triggered=false]'); S(23, y + 1, 15, 'minecraft:water_cauldron[level=3]'); S(22, y + 1, 16, 'minecraft:potted_bamboo')
      if (zS == 22) { F(9, y + 1, 21, 11, y + 1, 21, 'mcwfurnitures:' + choix(CANAPES) + '_couch[facing=north,shape=single]'); S(10, y + 1, 20, 'mcwfurnitures:' + w + '_coffee_table'); bac(13, y + 1, 21); bac(23, y + 1, 21); S(17, y + 1, 21, 'minecraft:potted_azalea_bush'); S(20, y + 1, 21, 'minecraft:potted_fern') }
    } else if (k % 3 == 2) {
      F(9, y + 1, 14, 13, y + 1, 14, 'mcwfurnitures:' + w + '_glass_table'); for (var x = 9; x <= 13; x++) { S(x, y + 1, 15, MAT(w2 + '_modern_chair', 'north')); if (x <= 11) S(x, y + 1, 13, MAT(w2 + '_modern_chair', 'south')) }
      S(8, y + 1, 14, MAT(w2 + '_modern_chair', 'east')); S(14, y + 1, 14, MAT(w2 + '_modern_chair', 'west')); S(11, y + 2, 14, 'minecraft:potted_white_tulip')
      S(23, y + 1, 13, 'minecraft:dropper[facing=up,triggered=false]'); S(23, y + 1, 14, 'minecraft:barrel[facing=up,open=false]'); S(23, y + 1, 16, 'minecraft:potted_bamboo')
      if (zS == 22) {
        F(8, y + 1, 17, 23, y + 5, 17, VP); F(12, y + 1, 18, 12, y + 5, 21, VP); F(17, y + 1, 18, 17, y + 5, 21, VP)
        ;[11, 16, 18].forEach(x => PORTE(x, y + 1, 17, PV, 'north', 'left', 'false'))
        ;[[8, 9], [13, 14]].forEach(c => { var a = c[0]; S(a + 1, y + 1, 19, 'mcwfurnitures:' + w + '_desk[facing=north,connection=single]'); S(a + 1, y + 2, 19, 'minecraft:heavy_weighted_pressure_plate'); S(a + 1, y + 1, 20, MAT(w2 + '_modern_chair', 'north')); S(a + 1, y + 1, 18, MAT(w + '_chair', 'south')); F(a, y + 1, 21, a, y + 2, 21, 'minecraft:bookshelf'); S(a + 3, y + 1, 21, 'minecraft:potted_fern'); S(a + 3, y + 1, 19, 'minecraft:barrel[facing=up,open=false]') })
        S(20, y + 1, 19, 'mcwfurnitures:dark_oak_desk[facing=north,connection=single]'); S(21, y + 1, 19, 'mcwfurnitures:dark_oak_desk[facing=north,connection=single]'); S(20, y + 2, 19, 'minecraft:heavy_weighted_pressure_plate'); S(21, y + 2, 19, 'supplementaries:globe_sepia'); S(20, y + 1, 20, MAT('dark_oak_modern_chair', 'north'))
        F(23, y + 1, 18, 23, y + 1, 20, 'mcwfurnitures:brown_couch[facing=west,shape=single]'); F(18, y + 1, 21, 19, y + 3, 21, 'minecraft:bookshelf'); S(23, y + 1, 21, 'minecraft:potted_azalea_bush'); F(18, y, 18, 23, y, 21, 'minecraft:dark_oak_planks')
      } else { F(18, y + 1, 16, 20, y + 1, 16, 'mcwfurnitures:gray_couch[facing=north,shape=single]'); S(19, y + 1, 15, 'mcwfurnitures:' + w + '_coffee_table'); bac(22, y + 1, 16) }
      if (etat) { for (var i = 0; i < 6; i++) S(8 + Math.floor(R() * 15), y + 1, 16, choix(['supplementaries:sack', 'minecraft:white_carpet', 'minecraft:white_carpet'])) }
    } else {
      if (zS == 22) {
        for (var x = 8; x <= 16; x++) for (var z = 18; z <= 21; z++) S(x, y, z, (x + z) % 2 ? 'minecraft:white_concrete' : 'minecraft:light_gray_concrete')
        for (var x = 8; x <= 13; x++) S(x, y + 1, 21, x == 9 ? 'mcwfurnitures:' + w + '_kitchen_sink[facing=north,water=false]' : MAT(w + '_counter', 'north'))
        S(8, y + 2, 21, 'farmersdelight:cutting_board[facing=north]'); S(11, y + 2, 21, 'farmersdelight:cooking_pot'); S(13, y + 2, 21, 'supplementaries:jar'); S(14, y + 1, 21, 'minecraft:barrel[facing=north,open=false]'); S(15, y + 1, 21, 'minecraft:potted_bamboo')
        ;[10, 15].forEach(x => { S(x, y + 1, 19, 'mcwfurnitures:' + w2 + '_table'); S(x - 1, y + 1, 19, MAT(w2 + '_chair', 'east')); S(x + 1, y + 1, 19, MAT(w2 + '_chair', 'west')); S(x, y + 2, 19, 'minecraft:candle[candles=1,lit=false]') })
        F(17, y + 1, 17, 23, y + 5, 17, VP); F(17, y + 1, 18, 17, y + 5, 21, VP); PORTE(18, y + 1, 17, PV, 'north', 'left', 'false')
        for (var x = 19; x <= 23; x++) { F(x, y + 1, 19, x, y + 3, 19, x % 2 ? 'minecraft:observer[facing=north,powered=false]' : 'minecraft:polished_basalt[axis=y]'); F(x, y + 1, 21, x, y + 2, 21, 'minecraft:black_concrete') }
        S(18, y + 1, 21, 'minecraft:iron_block'); S(18, y + 2, 21, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false,powered=false,waterlogged=false]')
        F(9, y + 1, 16, 11, y + 1, 16, 'mcwfurnitures:' + choix(CANAPES) + '_couch[facing=north,shape=single]'); S(10, y + 1, 15, 'mcwfurnitures:' + w + '_coffee_table'); bac(13, y + 1, 16); S(23, y + 1, 14, 'minecraft:potted_fern'); S(22, y + 1, 16, 'minecraft:jukebox')
      } else {
        F(8, y + 1, 13, 11, y + 1, 13, MAT(w + '_counter', 'south')); S(9, y + 2, 13, 'supplementaries:jar'); S(10, y + 2, 13, 'minecraft:potted_white_tulip')
        F(8, y + 1, 15, 11, y + 1, 15, 'minecraft:smooth_quartz_slab[type=top]'); F(8, y + 1, 16, 11, y + 1, 16, 'mcwfurnitures:' + w2 + '_stool_chair')
        F(18, y + 1, 16, 21, y + 1, 16, 'mcwfurnitures:white_couch[facing=north,shape=single]'); S(19, y + 1, 14, 'mcwfurnitures:' + w + '_coffee_table'); S(20, y + 1, 14, 'mcwfurnitures:' + w + '_coffee_table'); S(23, y + 1, 15, MAT(w2 + '_modern_chair', 'west')); bac(23, y + 1, 13); bac(13, y + 1, 16)
      }
    }
  }
  // eclairage encastre
  for (var k = 0; k <= 9; k++) {
    var y = 6 * k, zS = k >= 7 ? 17 : 22
    ;[9, 13, 17, 21].forEach(x => { S(x, y + 6, 14, 'minecraft:sea_lantern'); if (zS == 22) { if (k == 6) S(x, y + 5, 19, 'minecraft:lantern[hanging=true]'); else S(x, y + 6, 19, 'minecraft:sea_lantern') } })
    S(10, y + 6, 9, 'minecraft:sea_lantern'); S(22, y + 6, 9, 'minecraft:sea_lantern')
  }
  // terrasse du 7e (z18..22)
  F(8, 42, 18, 23, 42, 21, 'minecraft:spruce_planks'); F(7, 43, 22, 24, 43, 22, VP); F(7, 43, 18, 7, 43, 21, VP); F(24, 43, 18, 24, 43, 21, VP)
  for (var x = 8; x <= 23; x++) if (x < 18 || x > 20) bac(x, 43, 21)
  PORTE(12, 43, 17, PV, 'south', 'left', 'false'); PORTE(20, 43, 17, PV, 'south', 'left', 'false')
  ;[9, 10, 14, 15].forEach(x => S(x, 43, 19, 'mcwfurnitures:white_couch[facing=south,shape=single]'))
  S(17, 43, 19, 'mcwfurnitures:birch_table'); S(16, 43, 19, MAT('birch_chair', 'east')); S(18, 43, 19, MAT('birch_chair', 'west')); S(17, 44, 19, 'minecraft:candle[candles=3,lit=false]')
  F(22, 43, 19, 22, 46, 19, 'minecraft:birch_log[axis=y]'); for (var dx = -1; dx <= 1; dx++) for (var dz = -1; dz <= 1; dz++) { SA(22 + dx, 46, 19 + dz, 'minecraft:birch_leaves[persistent=true]'); if (Math.abs(dx) + Math.abs(dz) <= 1) SA(22 + dx, 47, 19 + dz, 'minecraft:birch_leaves[persistent=true]') }
  // toit technique
  F(14, 61, 6, 20, 64, 12, MU); PORTE(15, 61, 12, 'minecraft:iron_door', 'south', 'left', 'false'); F(14, 65, 6, 20, 65, 12, BA)
  F(9, 61, 7, 11, 62, 9, 'minecraft:iron_block'); F(9, 63, 7, 11, 63, 9, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false,powered=false,waterlogged=false]')
  F(22, 61, 7, 23, 62, 8, 'minecraft:iron_block'); F(22, 63, 7, 23, 63, 8, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false,powered=false,waterlogged=false]')
  for (var x = 9; x <= 22; x++) for (var z = 14; z <= 16; z++) if (x != 15 && x != 16) S(x, 61, z, 'minecraft:daylight_detector[inverted=false,power=0]')
  F(18, 66, 9, 18, 72, 9, 'minecraft:iron_bars'); S(18, 73, 9, 'minecraft:lightning_rod[facing=up,powered=false,waterlogged=false]'); S(19, 66, 9, 'minecraft:iron_bars'); S(17, 66, 9, 'minecraft:iron_bars')
  // atrium vitre devant la tour (x3..28 z23..28)
  F(3, 0, 23, 28, 0, 28, 'minecraft:polished_diorite'); for (var x = 4; x <= 27; x++) if (x % 4 == 1) F(x, 0, 23, x, 0, 27, 'minecraft:smooth_quartz')
  F(3, 0, 22, 6, 0, 22, 'minecraft:polished_diorite'); F(25, 0, 22, 28, 0, 22, 'minecraft:polished_diorite')
  rideau(3, 22, 28, 28, 0, 22); F(3, 1, 22, 6, 5, 22, MU); F(25, 1, 22, 28, 5, 22, MU)
  for (var x = 3; x <= 28; x++) for (var z = 22; z <= 28; z++) { if (z == 22 && x >= 7 && x <= 24) continue; S(x, 6, z, x == 3 || x == 28 || z == 28 || z == 22 || x % 4 == 3 ? BA : 'minecraft:light_blue_stained_glass') }
  PORTE(15, 1, 28, PV, 'south', 'left', 'false'); PORTE(16, 1, 28, PV, 'south', 'right', 'false'); F(13, 5, 29, 18, 5, 30, 'minecraft:smooth_quartz_slab[type=top]')
  for (var x = 21; x <= 26; x++) S(x, 1, 24, x == 23 ? 'mcwfurnitures:birch_kitchen_sink[facing=south,water=false]' : MAT('birch_counter', 'south'))
  S(21, 2, 24, 'farmersdelight:cooking_pot'); S(25, 2, 24, 'supplementaries:jar'); S(26, 2, 24, 'minecraft:potted_white_tulip'); F(21, 1, 23, 26, 1, 23, 'minecraft:barrel[facing=south,open=false]'); F(21, 2, 23, 26, 2, 23, 'mcwfurnitures:birch_kitchen_cabinet[facing=south,hinge=left]')
  F(21, 1, 25, 26, 1, 25, 'mcwfurnitures:birch_stool_chair'); ;[22, 25].forEach(x => { S(x, 1, 27, 'mcwfurnitures:birch_table'); S(x - 1, 1, 27, MAT('birch_chair', 'east')); S(x + 1, 1, 27, MAT('birch_chair', 'west')); S(x, 2, 27, 'minecraft:candle[candles=1,lit=false]') })
  F(4, 1, 24, 4, 1, 26, 'mcwfurnitures:gray_couch[facing=east,shape=single]'); S(5, 1, 25, 'mcwfurnitures:birch_coffee_table'); S(5, 2, 25, 'supplementaries:book_pile'); S(6, 1, 27, MAT('birch_modern_chair', 'north'))
  ;[[10, 24], [10, 27], [19, 24], [19, 27], [4, 27], [27, 27]].forEach(c => bac(c[0], 1, c[1])); ;[[11, 25], [18, 25]].forEach(c => { S(c[0], 1, c[1], 'minecraft:moss_block'); S(c[0], 2, c[1], 'minecraft:birch_log[axis=y]'); S(c[0], 3, c[1], 'minecraft:birch_leaves[persistent=true]') })
  // parvis, parking, cour de service
  ;[2, 12, 19, 29].forEach(x => { F(x, 0, 30, x, 3, 30, 'minecraft:polished_blackstone_wall'); S(x, 4, 30, 'minecraft:lantern') })
  ;[24, 25, 26, 27].forEach(x => S(x, 0, 30, 'minecraft:iron_bars')); ;[7, 9, 22].forEach(x => S(x, 0, 29, 'minecraft:stone_brick_wall'))
  ;[[1, 8], [2, 13], [1, 19]].forEach(c => { F(c[0], 0, c[1], c[0] + 2, 0, c[1] + 1, 'minecraft:' + choix(['red', 'white', 'blue', 'black']) + '_concrete'); F(c[0], 1, c[1], c[0] + 1, 1, c[1] + 1, 'minecraft:black_stained_glass') })
  F(27, 0, 8, 29, 1, 10, 'minecraft:iron_block'); S(28, 2, 9, 'minecraft:iron_bars'); S(28, 3, 9, 'minecraft:iron_bars'); F(27, 0, 14, 28, 0, 15, 'minecraft:green_terracotta'); F(27, 0, 17, 29, 0, 17, 'minecraft:barrel[facing=up,open=false]'); S(28, 1, 17, 'minecraft:barrel[facing=up,open=false]')
  ;[[3, 1], [28, 2]].forEach(c => { F(c[0], 0, c[1], c[0], 3, c[1], 'minecraft:birch_log[axis=y]'); for (var dx = -1; dx <= 1; dx++) for (var dz = -1; dz <= 1; dz++) { SA(c[0] + dx, 3, c[1] + dz, 'minecraft:birch_leaves[persistent=true]'); SA(c[0] + dx, 4, c[1] + dz, 'minecraft:birch_leaves[persistent=true]') } SA(c[0], 5, c[1], 'minecraft:birch_leaves[persistent=true]') })
}


// ================= ATELIER INDUSTRIEL ROUILLE (2 x 2 chunks) =================
function atelierRouille() {
  var BR = 'minecraft:bricks', GR = 'minecraft:waxed_weathered_copper_grate', CU = 'minecraft:waxed_weathered_cut_copper', CE = 'minecraft:waxed_exposed_cut_copper'
  var ST = 'minecraft:waxed_weathered_cut_copper_stairs', GL = 'minecraft:light_gray_stained_glass', PC = 'minecraft:waxed_exposed_copper_door'
  // sol de la cour
  for (var x = 0; x <= 31; x++) for (var z = 0; z <= 31; z++) S(x, -1, z, choix(['minecraft:gravel', 'minecraft:gravel', 'minecraft:coarse_dirt', 'minecraft:andesite', 'minecraft:cobblestone']))
  F(15, -1, 23, 19, -1, 31, 'minecraft:gray_concrete')
  // halle : murs x3..26 z5..22
  F(3, 0, 5, 26, 0, 22, 'minecraft:smooth_stone')
  for (var y = 1; y <= 11; y++) {
    for (var x = 3; x <= 26; x++) [5, 22].forEach(z => S(x, y, z, y >= 10 ? CU : y >= 4 && y <= 8 && (x - 3) % 4 != 0 ? GR : BR))
    for (var z = 6; z <= 21; z++) [3, 26].forEach(x => S(x, y, z, y >= 10 ? CU : y >= 4 && y <= 8 && (z - 5) % 4 != 0 ? GR : BR))
  }
  ;[3, 7, 11, 15, 19, 23, 26].forEach(x => { F(x, 0, 4, x, 11, 4, BR); F(x, 0, 23, x, 11, 23, BR); S(x, 12, 4, 'minecraft:brick_slab[type=bottom]'); S(x, 12, 23, 'minecraft:brick_slab[type=bottom]') })
  ;[9, 13, 17, 21].forEach(z => { F(2, 0, z, 2, 11, z, BR); F(27, 0, z, 27, 11, z, BR); S(2, 12, z, 'minecraft:brick_slab[type=bottom]'); S(27, 12, z, 'minecraft:brick_slab[type=bottom]') })
  // toit en sheds (verrieres au nord)
  ;[5, 9, 13, 17].forEach(zt => {
    F(3, 12, zt, 26, 14, zt, GL)
    F(3, 14, zt + 1, 26, 14, zt + 1, ST + '[facing=north,half=bottom,shape=straight]'); F(3, 13, zt + 2, 26, 13, zt + 2, ST + '[facing=north,half=bottom,shape=straight]'); F(3, 12, zt + 3, 26, 12, zt + 3, ST + '[facing=north,half=bottom,shape=straight]')
    ;[3, 26].forEach(x => { F(x, 12, zt + 1, x, 13, zt + 1, BR); S(x, 12, zt + 2, BR) })
  })
  F(3, 12, 21, 26, 12, 22, 'minecraft:waxed_weathered_cut_copper_slab[type=bottom]'); F(3, 13, 22, 26, 13, 22, 'minecraft:brick_wall')
  // charpente, poteaux, pont roulant, suspensions
  ;[9, 13, 17].forEach(z => { F(4, 11, z, 25, 11, z, CE); ;[11, 19].forEach(x => F(x, 1, z, x, 10, z, 'minecraft:polished_basalt[axis=y]')) ; [13, 22].forEach(x => { S(x, 10, z, 'minecraft:chain[axis=y]'); S(x, 9, z, 'minecraft:waxed_copper_bulb[lit=true,powered=false]') }) })
  F(10, 9, 6, 25, 9, 6, 'minecraft:waxed_weathered_cut_copper_slab[type=top]'); F(10, 9, 21, 25, 9, 21, 'minecraft:waxed_weathered_cut_copper_slab[type=top]')
  F(15, 9, 6, 15, 9, 21, 'minecraft:yellow_concrete'); F(15, 5, 12, 15, 8, 12, 'minecraft:chain[axis=y]'); S(15, 4, 12, 'minecraft:lightning_rod[facing=down,powered=false,waterlogged=false]')
  // marquages au sol, taches
  F(10, 0, 11, 25, 0, 11, 'minecraft:yellow_concrete'); F(10, 0, 18, 25, 0, 18, 'minecraft:yellow_concrete')
  for (var i = 0; i < 14; i++) { var x = 10 + Math.floor(R() * 16), z = 6 + Math.floor(R() * 16); if (z != 11 && z != 18) S(x, 0, z, choix(['minecraft:gray_concrete', 'minecraft:coal_block', 'minecraft:smooth_basalt'])) }
  // ouvertures
  F(16, 1, 22, 18, 4, 22, AIR); F(16, 5, 22, 18, 6, 22, CU); PORTE(13, 1, 22, PC, 'south', 'left', 'false'); PORTE(3, 1, 19, PC, 'west', 'left', 'false')
  // machines
  F(13, 1, 8, 17, 1, 9, 'minecraft:polished_deepslate'); S(13, 2, 8, 'minecraft:iron_block'); F(14, 2, 8, 16, 2, 8, 'minecraft:polished_basalt[axis=x]'); S(17, 2, 8, 'minecraft:lodestone'); S(13, 2, 9, 'minecraft:lever[face=floor,facing=north,powered=false]'); S(15, 1, 10, 'mcwfurnitures:oak_stool_chair')
  F(21, 1, 7, 23, 1, 8, 'minecraft:polished_deepslate'); F(21, 2, 7, 21, 5, 7, 'minecraft:polished_basalt[axis=y]'); F(23, 2, 7, 23, 5, 7, 'minecraft:polished_basalt[axis=y]'); F(21, 6, 7, 23, 6, 8, 'minecraft:iron_block'); S(22, 5, 7, 'minecraft:piston[facing=down,extended=false]'); S(22, 2, 8, 'minecraft:anvil[facing=north]')
  S(11, 1, 20, 'minecraft:grindstone[face=floor,facing=north]'); S(12, 1, 20, 'minecraft:stonecutter[facing=north]'); S(14, 1, 20, 'minecraft:smithing_table'); S(15, 1, 20, 'minecraft:anvil[facing=east]'); S(18, 1, 20, 'minecraft:blast_furnace[facing=north,lit=false]'); S(19, 1, 20, 'minecraft:blast_furnace[facing=north,lit=false]')
  S(12, 1, 19, 'mcwfurnitures:spruce_stool_chair'); S(14, 1, 19, 'mcwfurnitures:spruce_stool_chair'); S(20, 1, 21, 'minecraft:cauldron'); S(21, 1, 21, 'minecraft:water_cauldron[level=2]')
  F(12, 1, 15, 18, 1, 15, 'minecraft:polished_blackstone_slab[type=top]'); S(13, 2, 15, 'minecraft:barrel[facing=up,open=false]'); S(16, 2, 15, 'minecraft:chest[facing=south]'); S(11, 1, 15, 'minecraft:dropper[facing=east,triggered=false]')
  F(22, 1, 16, 22, 1, 17, 'minecraft:yellow_concrete'); S(22, 2, 16, 'minecraft:yellow_concrete'); S(22, 2, 17, 'minecraft:black_carpet'); F(22, 1, 15, 22, 3, 15, 'minecraft:iron_bars'); S(22, 1, 14, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false,powered=false,waterlogged=false]')
  F(24, 3, 12, 25, 3, 19, 'minecraft:spruce_slab[type=top]'); F(24, 6, 13, 25, 6, 18, 'minecraft:spruce_slab[type=top]'); ;[12, 19].forEach(z => F(24, 1, z, 24, 6, z, 'minecraft:stripped_spruce_log[axis=y]'))
  for (var z = 13; z <= 18; z++) { if (R() < 0.7) S(25, 1, z, choix(['minecraft:barrel[facing=up,open=false]', 'minecraft:chest[facing=west]', 'minecraft:hay_block[axis=y]'])); if (R() < 0.7) S(25, 4, z, choix(['minecraft:barrel[facing=up,open=false]', 'minecraft:decorated_pot', 'minecraft:chest[facing=west]'])) }
  ;[[10, 6], [10, 7], [12, 6]].forEach(c => S(c[0], 1, c[1], 'minecraft:barrel[facing=up,open=false]'))
  // rez sous mezzanine : sanitaires, vestiaires, refectoire
  F(4, 1, 10, 9, 5, 10, 'minecraft:white_concrete'); F(9, 1, 6, 9, 5, 9, 'minecraft:white_concrete'); PORTE(9, 1, 8, 'minecraft:birch_door', 'east', 'left', 'false')
  for (var x = 4; x <= 8; x++) for (var z = 6; z <= 9; z++) S(x, 0, z, (x + z) % 2 ? 'minecraft:smooth_quartz' : 'minecraft:polished_diorite')
  S(4, 1, 6, 'minecraft:quartz_stairs[facing=west,half=bottom,shape=straight]'); F(4, 1, 7, 5, 2, 7, 'minecraft:white_concrete'); S(4, 1, 8, 'minecraft:quartz_stairs[facing=west,half=bottom,shape=straight]'); S(6, 1, 9, 'mcwfurnitures:oak_kitchen_sink[facing=north,water=false]'); S(7, 1, 9, 'mcwfurnitures:oak_kitchen_sink[facing=north,water=false]'); S(8, 5, 7, 'minecraft:lantern[hanging=true]')
  F(4, 1, 11, 4, 2, 14, 'minecraft:barrel[facing=east,open=false]'); F(6, 1, 12, 6, 1, 13, 'minecraft:spruce_slab[type=bottom]'); F(9, 1, 13, 9, 5, 13, 'minecraft:polished_basalt[axis=y]')
  S(6, 1, 18, 'mcwfurnitures:spruce_table'); S(5, 1, 18, MAT('spruce_chair', 'east')); S(7, 1, 18, MAT('spruce_chair', 'west')); S(6, 2, 18, 'minecraft:candle[candles=2,lit=false]')
  F(4, 1, 20, 4, 1, 21, MAT('spruce_counter', 'east')); S(4, 2, 20, 'minecraft:brewing_stand'); S(4, 2, 21, 'supplementaries:jar'); F(8, 1, 21, 8, 2, 21, 'minecraft:white_concrete'); S(5, 5, 15, 'minecraft:lantern[hanging=true]'); S(6, 5, 19, 'minecraft:lantern[hanging=true]')
  // mezzanine (y6) : bureau du contremaitre, planches a dessin, stockage
  F(4, 6, 6, 9, 6, 15, 'minecraft:spruce_planks'); F(4, 6, 16, 8, 6, 21, 'minecraft:spruce_planks')
  for (var k = 0; k <= 5; k++) { S(9, 1 + k, 21 - k, ST + '[facing=north,half=bottom,shape=straight]'); if (k > 0) F(9, 1, 21 - k, 9, k, 21 - k, CU) }
  F(9, 7, 12, 9, 7, 14, 'minecraft:iron_bars'); F(8, 7, 17, 8, 7, 21, 'minecraft:iron_bars')
  F(4, 7, 11, 9, 10, 11, 'minecraft:white_concrete'); F(9, 7, 6, 9, 10, 10, 'minecraft:white_concrete'); F(4, 11, 6, 9, 11, 11, 'minecraft:white_concrete')
  F(5, 8, 11, 7, 9, 11, 'minecraft:glass_pane'); F(9, 8, 7, 9, 9, 9, 'minecraft:glass_pane'); PORTE(8, 7, 11, 'minecraft:spruce_door', 'south', 'left', 'false')
  S(6, 7, 7, 'mcwfurnitures:dark_oak_desk[facing=north,connection=single]'); S(6, 7, 8, MAT('dark_oak_chair', 'north')); S(6, 8, 7, 'supplementaries:book_pile'); S(7, 8, 7, 'minecraft:lantern')
  S(7, 7, 7, 'mcwfurnitures:dark_oak_desk[facing=north,connection=single]'); F(4, 7, 6, 4, 8, 7, 'minecraft:barrel[facing=east,open=false]'); S(8, 7, 6, 'minecraft:iron_block'); S(4, 7, 9, 'minecraft:cartography_table'); S(8, 7, 9, 'minecraft:potted_fern'); S(6, 10, 9, 'minecraft:lantern[hanging=true]')
  ;[13, 14].forEach(z => { S(5, 7, z, 'mcwfurnitures:spruce_table'); S(6, 7, z, MAT('spruce_chair', 'west')); S(5, 8, z, 'supplementaries:book_pile') }); S(4, 7, 15, 'minecraft:lantern'); S(8, 7, 13, 'minecraft:barrel[facing=up,open=false]')
  F(4, 7, 17, 4, 9, 21, 'minecraft:barrel[facing=east,open=false]'); F(6, 7, 18, 6, 8, 20, 'minecraft:barrel[facing=up,open=false]'); S(7, 7, 16, 'minecraft:lantern')
  // cheminee d'usine
  F(27, 0, 7, 31, 1, 11, 'minecraft:stone_bricks'); F(28, 2, 8, 30, 29, 10, BR); ;[10, 20].forEach(y => F(28, y, 8, 30, y, 10, CE)); F(27, 8, 9, 27, 8, 9, BR)
  F(28, 30, 8, 30, 30, 10, 'minecraft:brick_wall'); S(29, 30, 9, 'minecraft:campfire[lit=true,signal_fire=true]'); F(31, 2, 9, 31, 28, 9, 'minecraft:ladder[facing=east]')
  // conteneurs et ferraille au nord
  F(4, 0, 0, 10, 2, 2, 'minecraft:red_terracotta'); F(6, 3, 0, 12, 5, 2, 'minecraft:blue_terracotta'); F(15, 0, 1, 21, 2, 3, 'minecraft:green_terracotta')
  ;[4, 10].forEach(x => F(x, 0, 1, x, 1, 1, 'minecraft:iron_bars')); F(12, 3, 1, 12, 4, 1, 'minecraft:iron_bars'); F(21, 0, 2, 21, 1, 2, 'minecraft:iron_bars')
  for (var x = 22; x <= 26; x++) for (var z = 0; z <= 2; z++) if (R() < 0.6) S(x, 0, z, choix(['minecraft:cobblestone', 'minecraft:iron_bars', 'minecraft:damaged_anvil[facing=north]', 'minecraft:coal_block', 'minecraft:chain[axis=x]', 'minecraft:barrel[facing=up,open=false]']))
  // cour sud : camion a quai, palettes, ferraille, cloture
  F(16, 1, 23, 18, 3, 28, 'minecraft:white_concrete'); F(16, 0, 23, 18, 0, 28, 'minecraft:gray_concrete'); ;[24, 27].forEach(z => { S(16, 0, z, 'minecraft:black_concrete'); S(18, 0, z, 'minecraft:black_concrete') })
  F(16, 0, 29, 18, 2, 30, 'minecraft:red_concrete'); F(16, 2, 30, 18, 2, 30, 'minecraft:black_stained_glass'); S(16, 0, 30, 'minecraft:black_concrete'); S(18, 0, 30, 'minecraft:black_concrete'); F(16, 0, 31, 18, 0, 31, 'minecraft:iron_block'); S(17, 3, 29, 'minecraft:iron_trapdoor[facing=south,half=bottom,open=false,powered=false,waterlogged=false]')
  ;[[5, 25], [8, 25], [5, 28]].forEach(c => { F(c[0], 0, c[1], c[0] + 1, 0, c[1] + 1, 'minecraft:spruce_slab[type=bottom]') }); S(8, 0, 28, 'minecraft:barrel[facing=up,open=false]'); S(9, 0, 28, 'minecraft:barrel[facing=up,open=false]'); S(8, 1, 28, 'minecraft:barrel[facing=up,open=false]')
  S(3, 0, 26, 'minecraft:damaged_anvil[facing=east]'); S(11, 0, 26, 'minecraft:cauldron'); S(12, 0, 27, 'minecraft:composter[level=0]'); F(23, 0, 25, 25, 0, 25, 'minecraft:chain[axis=x]'); S(25, 0, 27, 'minecraft:coal_block'); S(26, 0, 27, 'minecraft:iron_bars')
  for (var x = 0; x <= 31; x++) if (x < 15 || x > 19) S(x, 0, 31, x % 4 == 0 ? 'minecraft:polished_basalt[axis=y]' : 'minecraft:iron_bars')
  ;[1, 2].forEach(z => {}); S(0, 0, 8, 'minecraft:barrel[facing=up,open=false]'); S(1, 0, 8, 'minecraft:barrel[facing=up,open=false]'); S(0, 1, 8, 'minecraft:barrel[facing=up,open=false]'); S(1, 0, 14, 'minecraft:composter[level=0]')
  for (var x = 0; x <= 31; x++) for (var z = 0; z <= 30; z++) { var dans = (x >= 2 && x <= 27 && z >= 3 && z <= 24) || (x >= 27 && z >= 7 && z <= 11) || (x >= 15 && x <= 19 && z >= 23) || (z <= 3 && x >= 4 && x <= 21); if (dans) continue; if (R() < 0.06) { S(x, -1, z, 'minecraft:coarse_dirt'); SA(x, 0, z, 'minecraft:short_grass') } }
}


// ================= BIDONVILLE (2 x 2 chunks) =================
var BV_MURS = ['minecraft:oak_planks', 'minecraft:spruce_planks', 'minecraft:birch_planks', 'minecraft:jungle_planks', 'minecraft:waxed_weathered_cut_copper', 'minecraft:waxed_exposed_cut_copper', 'minecraft:waxed_oxidized_cut_copper', 'minecraft:stripped_oak_log[axis=y]', 'minecraft:mossy_cobblestone', 'minecraft:bricks', 'minecraft:mud_bricks']
var BV_TOITS = ['minecraft:spruce_slab[type=bottom]', 'minecraft:waxed_weathered_cut_copper_slab[type=bottom]', 'minecraft:waxed_exposed_cut_copper_slab[type=bottom]', 'minecraft:oak_slab[type=bottom]', 'minecraft:mud_brick_slab[type=bottom]']
var BV_PORTES = ['minecraft:spruce_door', 'minecraft:oak_door', 'minecraft:jungle_door', 'minecraft:waxed_exposed_copper_door', 'minecraft:iron_door', 'minecraft:birch_door']
function cabane(x1, z1, x2, z2, y, h, pf, auvent) {
  var m = [choix(BV_MURS), choix(BV_MURS), choix(BV_MURS)], t = [choix(BV_TOITS), choix(BV_TOITS)], w = choix(BOIS)
  F(x1, y, z1, x2, y, z2, choix(['minecraft:spruce_planks', 'minecraft:oak_planks', 'minecraft:packed_mud', 'minecraft:mud_bricks']))
  function mur(i, yy) { return yy == y + 1 && R() < 0.3 ? 'minecraft:cobblestone' : m[Math.floor(i / 2) % 3] }
  for (var yy = y + 1; yy <= y + h; yy++) {
    for (var x = x1; x <= x2; x++) [z1, z2].forEach(z => S(x, yy, z, x == x1 || x == x2 ? 'minecraft:stripped_spruce_log[axis=y]' : mur(x - x1 + (z == z2 ? 1 : 0), yy)))
    for (var z = z1 + 1; z < z2; z++) [x1, x2].forEach(x => S(x, yy, z, mur(z - z1 + (x == x2 ? 1 : 0), yy)))
  }
  var fen = R() < 0.5 ? 'minecraft:glass_pane' : 'minecraft:iron_bars', mx = Math.floor((x1 + x2) / 2), mz = Math.floor((z1 + z2) / 2)
  if (pf != 'north' && x2 - x1 >= 4) S(mx, y + 2, z1, fen); if (pf != 'south' && x2 - x1 >= 4) S(mx, y + 2, z2, fen)
  if (pf != 'west' && z2 - z1 >= 4) S(x1, y + 2, mz, fen); if (pf != 'east' && z2 - z1 >= 4) S(x2, y + 2, mz, fen)
  for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) S(x, y + h + 1, z, choix(t))
  if (auvent) { var d = { north: [0, -1], south: [0, 1], east: [1, 0], west: [-1, 0] }[pf]; if (d[0]) F(d[0] > 0 ? x2 + 1 : x1 - 1, y + h + 1, z1, d[0] > 0 ? x2 + 1 : x1 - 1, y + h + 1, z2, t[0]); else F(x1, y + h + 1, d[1] > 0 ? z2 + 1 : z1 - 1, x2, y + h + 1, d[1] > 0 ? z2 + 1 : z1 - 1, t[0]) }
  var c = cadre(x1 + 1, z1 + 1, x2 - 1, z2 - 1, OPP[pf], y, h), L = c.L, D = c.D, col = choix(COULS)
  c.porte(choix(BV_PORTES))
  c.S(0, 0, 1, 'minecraft:' + col + '_bed[facing={W},part=head]'); c.S(0, 1, 1, 'minecraft:' + col + '_bed[facing={W},part=foot]')
  c.S(L - 1, 0, 1, 'minecraft:chest[facing={I}]')
  if (L >= 3) c.S(1, 0, 1, choix(['minecraft:furnace[facing={I},lit=false]', 'minecraft:smoker[facing={I},lit=false]', 'minecraft:barrel[facing=up,open=false]', 'minecraft:crafting_table']))
  if (D >= 4) c.S(0, D - 1, 1, choix(['minecraft:barrel[facing=up,open=false]', 'minecraft:cauldron', 'minecraft:composter[level=0]', 'supplementaries:sack']))
  if (L >= 3 && D >= 3) c.S(1, 1, 1, 'minecraft:' + choix(COULS) + '_carpet')
  if (L >= 4 && D >= 4) { c.S(L - 2, 1, 1, 'mcwfurnitures:' + w + '_table'); c.S(L - 2, 2, 1, MAT(w + '_chair', '{W}')); c.S(L - 2, 1, 2, 'minecraft:candle[candles=1,lit=false]') }
  if (L >= 5 && D >= 3) { c.S(2, 0, 1, choix(['minecraft:barrel[facing=up,open=false]', 'supplementaries:sack', 'minecraft:decorated_pot'])); c.S(2, 0, 2, 'minecraft:potted_dead_bush') }
  c.S(Math.min(1, L - 1), 1, h, 'minecraft:lantern[hanging=true]')
  if (R() < 0.5) c.S(L - 1, 1, 1, 'supplementaries:sack')
}
function bidonvilleGrand() {
  for (var x = 0; x <= 31; x++) for (var z = 0; z <= 31; z++) S(x, -1, z, choix(['minecraft:coarse_dirt', 'minecraft:coarse_dirt', 'minecraft:packed_mud', 'minecraft:gravel', 'minecraft:mud', 'minecraft:dirt_path']))
  // cabanes (rez)
  cabane(1, 1, 5, 6, 0, 3, 'south', true); cabane(6, 2, 9, 6, 0, 4, 'south', true); cabane(1, 8, 6, 13, 0, 3, 'east', false)
  cabane(12, 1, 20, 6, 0, 4, 'south', true); cabane(12, 8, 20, 14, 0, 3, 'north', false)
  cabane(23, 1, 30, 5, 0, 3, 'south', true); cabane(24, 7, 30, 13, 0, 4, 'west', true)
  cabane(1, 17, 7, 22, 0, 3, 'east', true); cabane(1, 24, 6, 30, 0, 3, 'north', true)
  cabane(12, 17, 20, 22, 0, 4, 'south', true); cabane(23, 17, 30, 23, 0, 3, 'west', true); cabane(24, 25, 30, 30, 0, 3, 'north', true)
  // cabanes perchees et echelles
  cabane(1, 8, 5, 12, 4, 3, 'south', false); F(6, 1, 7, 6, 3, 7, 'minecraft:ladder[facing=north]')
  cabane(14, 9, 19, 13, 4, 3, 'west', false); F(17, 1, 7, 17, 3, 7, 'minecraft:ladder[facing=north]')
  cabane(26, 8, 30, 12, 5, 3, 'west', false); F(25, 1, 14, 25, 4, 14, 'minecraft:ladder[facing=south]')
  cabane(12, 17, 16, 21, 5, 3, 'east', false); F(21, 1, 19, 21, 4, 19, 'minecraft:ladder[facing=east]')
  cabane(26, 26, 30, 30, 4, 3, 'west', false); F(23, 1, 28, 23, 3, 28, 'minecraft:ladder[facing=west]')
  // toits : citernes, antennes, pneus, panneaux
  S(8, 6, 4, 'minecraft:barrel[facing=up,open=false]'); S(8, 7, 4, 'minecraft:cauldron'); S(19, 6, 2, 'minecraft:daylight_detector[inverted=false,power=0]'); S(18, 6, 2, 'minecraft:daylight_detector[inverted=false,power=0]')
  S(13, 6, 3, 'minecraft:black_carpet'); S(29, 5, 2, 'minecraft:lightning_rod[facing=up,powered=false,waterlogged=false]'); S(24, 6, 12, 'minecraft:barrel[facing=up,open=false]'); S(19, 6, 22, 'minecraft:potted_cactus'); S(3, 5, 28, 'minecraft:black_carpet'); S(2, 5, 19, 'minecraft:barrel[facing=up,open=false]'); S(27, 5, 20, 'minecraft:composter[level=0]')
  // ruelles : cordes a linge avec lampes, bric-a-brac
  function corde(x1, z1, x2, z2, y, ax, lx, lz) { F(x1, y, z1, x2, y, z2, 'minecraft:chain[axis=' + ax + ']'); S(lx, y - 1, lz, 'minecraft:chain[axis=y]'); S(lx, y - 2, lz, 'minecraft:lantern[hanging=true]') }
  corde(10, 4, 11, 4, 4, 'x', 10, 4); corde(21, 10, 22, 10, 4, 'x', 22, 10); corde(4, 15, 4, 16, 5, 'z', 4, 16); corde(16, 15, 16, 16, 6, 'z', 16, 15); corde(27, 15, 27, 16, 5, 'z', 27, 15)
  ;[[10, 9], [11, 20], [22, 3], [3, 15], [9, 16], [26, 16], [21, 26], [8, 7]].forEach(c => SA(c[0], 0, c[1], choix(['minecraft:barrel[facing=up,open=false]', 'minecraft:composter[level=0]', 'minecraft:cauldron', 'supplementaries:sack', 'minecraft:black_carpet', 'minecraft:hay_block[axis=y]'])))
  // jardin potager
  F(8, -1, 25, 9, -1, 29, 'minecraft:farmland[moisture=7]'); for (var z = 25; z <= 29; z++) { S(8, 0, z, z % 2 ? 'minecraft:carrots[age=7]' : 'minecraft:potatoes[age=7]'); S(9, 0, z, 'minecraft:beetroots[age=3]') }
  S(7, -1, 27, 'minecraft:water'); F(7, 0, 25, 7, 0, 26, 'minecraft:spruce_fence'); F(7, 0, 28, 7, 0, 30, 'minecraft:spruce_fence'); S(8, 0, 30, 'minecraft:composter[level=0]'); S(9, 0, 30, 'minecraft:water_cauldron[level=2]')
  // marche
  function etal(x, z, c1, c2, biens) {
    ;[[0, 0], [2, 0], [0, 2], [2, 2]].forEach(p => F(x + p[0], 0, z + p[1], x + p[0], 2, z + p[1], 'minecraft:spruce_fence'))
    for (var dx = 0; dx <= 2; dx++) F(x + dx, 3, z, x + dx, 3, z + 2, dx % 2 ? c2 : c1)
    S(x + 1, 0, z + 2, biens[0]); S(x + 1, 0, z, biens[1]); S(x, 0, z + 1, biens[2]); S(x + 2, 0, z + 1, biens[3]); S(x + 1, 0, z + 1, 'mcwfurnitures:spruce_stool_chair')
  }
  etal(12, 25, 'minecraft:red_wool', 'minecraft:white_wool', ['farmersdelight:carrot_crate', 'minecraft:barrel[facing=up,open=false]', 'minecraft:composter[level=0]', 'minecraft:melon'])
  etal(17, 25, 'minecraft:blue_wool', 'minecraft:white_wool', ['farmersdelight:potato_crate', 'minecraft:hay_block[axis=y]', 'minecraft:pumpkin', 'minecraft:decorated_pot'])
  S(16, 0, 29, 'minecraft:campfire[lit=true]'); F(14, 0, 30, 18, 0, 30, 'minecraft:stripped_spruce_log[axis=x]'); S(14, 0, 29, 'minecraft:stripped_spruce_log[axis=z]'); S(18, 0, 29, 'minecraft:stripped_spruce_log[axis=z]')
}


// ================= CASERNE / GARNISON (2 x 2 chunks) =================
function caserne() {
  var BE = 'minecraft:light_gray_concrete', BA = 'minecraft:stone_bricks', VT = 'minecraft:green_terracotta', SAC = 'supplementaries:sack'
  for (var x = 0; x <= 31; x++) for (var z = 0; z <= 31; z++) S(x, -1, z, choix(['minecraft:gravel', 'minecraft:coarse_dirt', 'minecraft:gravel', 'minecraft:andesite']))
  for (var x = 2; x <= 20; x++) for (var z = 15; z <= 24; z++) S(x, -1, z, (x + z) % 3 ? 'minecraft:smooth_stone' : 'minecraft:polished_andesite')
  // enceinte, barbeles, portail
  W(0, 0, 31, 31, 0, 2, 'minecraft:gray_concrete'); W(0, 0, 31, 31, 3, 3, 'minecraft:iron_bars')
  F(13, 0, 31, 18, 3, 31, AIR); F(12, 0, 31, 12, 4, 31, 'minecraft:polished_andesite'); F(19, 0, 31, 19, 4, 31, 'minecraft:polished_andesite')
  for (var x = 13; x <= 18; x++) S(x, 1, 31, x % 2 ? 'minecraft:red_concrete' : 'minecraft:white_concrete'); S(12, 5, 31, 'minecraft:lantern'); S(19, 5, 31, 'minecraft:lantern')
  // batiment principal x2..19 z2..13, R+1
  F(2, 0, 2, 19, 0, 13, 'minecraft:polished_andesite')
  for (var y = 1; y <= 11; y++) for (var x = 2; x <= 19; x++) for (var z = 2; z <= 13; z++) if (x == 2 || x == 19 || z == 2 || z == 13) S(x, y, z, (x == 2 || x == 19) && (z == 2 || z == 13) ? 'minecraft:polished_andesite' : y <= 2 ? BA : BE)
  F(3, 6, 3, 18, 6, 12, 'minecraft:spruce_planks'); W(2, 2, 19, 13, 6, 6, VT); F(2, 12, 2, 19, 12, 13, 'minecraft:gray_concrete'); W(2, 2, 19, 13, 12, 12, VT); W(2, 2, 19, 13, 13, 13, 'minecraft:stone_brick_wall')
  tour(17, 3, 1, BE)
  ;[4, 7, 10, 13].forEach(x => { F(x, 3, 2, x, 4, 2, 'minecraft:glass_pane'); F(x, 3, 13, x, 4, 13, 'minecraft:glass_pane') }); ;[5, 11].forEach(z => F(2, 3, z, 2, 4, z, 'minecraft:glass_pane')); ;[10, 12].forEach(z => F(19, 3, z, 19, 4, z, 'minecraft:glass_pane'))
  ;[3, 5, 7, 9, 11, 13, 15].forEach(x => F(x, 9, 2, x, 10, 2, 'minecraft:glass_pane')); ;[3, 5, 7, 9, 11, 13, 15, 17].forEach(x => F(x, 9, 13, x, 10, 13, 'minecraft:glass_pane')); ;[6, 9].forEach(z => F(2, 9, z, 2, 10, z, 'minecraft:glass_pane'))
  // rez : couloir z8, armurerie, bureau, refectoire, cuisine
  F(3, 1, 7, 15, 5, 7, BE); F(9, 1, 3, 9, 5, 6, BE); F(12, 1, 9, 12, 5, 12, BE); F(13, 1, 9, 18, 5, 9, BE)
  PORTE(6, 1, 7, 'minecraft:iron_door', 'south', 'left', 'false'); PORTE(12, 1, 7, 'minecraft:spruce_door', 'south', 'left', 'false'); PORTE(14, 1, 9, 'minecraft:spruce_door', 'north', 'left', 'false')
  PORTE(6, 1, 13, 'minecraft:spruce_door', 'south', 'left', 'false'); PORTE(7, 1, 13, 'minecraft:spruce_door', 'south', 'right', 'false'); PORTE(2, 1, 8, 'minecraft:spruce_door', 'west', 'left', 'false')
  F(3, 1, 8, 16, 1, 8, 'minecraft:green_carpet'); ;[5, 10, 15].forEach(x => S(x, 5, 8, 'minecraft:lantern[hanging=true]'))
  F(3, 1, 3, 8, 1, 3, 'minecraft:chest[facing=south]'); F(3, 2, 3, 8, 3, 3, 'minecraft:spruce_trapdoor[facing=south,half=bottom,open=true]'); F(3, 1, 4, 3, 2, 6, 'minecraft:barrel[facing=east,open=false]')
  S(5, 1, 5, 'minecraft:anvil[facing=east]'); S(7, 1, 5, 'minecraft:smithing_table'); S(8, 1, 6, 'minecraft:grindstone[face=floor,facing=west]'); S(6, 5, 5, 'minecraft:lantern[hanging=true]')
  S(10, 1, 3, 'minecraft:cartography_table'); S(11, 1, 3, 'supplementaries:globe'); F(15, 1, 3, 15, 2, 4, 'minecraft:bookshelf'); S(15, 1, 6, 'minecraft:jukebox'); S(13, 3, 3, 'minecraft:green_wall_banner[facing=south]')
  S(12, 1, 4, 'mcwfurnitures:dark_oak_table'); S(13, 1, 4, 'mcwfurnitures:dark_oak_table'); S(12, 1, 5, MAT('dark_oak_chair', 'north')); S(13, 1, 5, MAT('dark_oak_chair', 'north')); S(12, 1, 3, MAT('dark_oak_chair', 'south'))
  S(12, 2, 4, 'supplementaries:book_pile'); S(13, 2, 4, 'minecraft:heavy_weighted_pressure_plate'); S(12, 5, 5, 'mcwlights:iron_chandelier')
  for (var x = 4; x <= 10; x++) { S(x, 1, 10, 'mcwfurnitures:spruce_table'); S(x, 1, 9, MAT('spruce_chair', 'south')); S(x, 1, 11, MAT('spruce_chair', 'north')); if (R() < 0.5) S(x, 2, 10, choix(['minecraft:candle[candles=1,lit=false]', 'supplementaries:jar', 'minecraft:potted_dead_bush', 'minecraft:bowl'.replace('minecraft:bowl', 'minecraft:candle[candles=2,lit=false]')])) }
  S(3, 1, 12, 'minecraft:barrel[facing=up,open=false]'); S(11, 1, 12, 'minecraft:barrel[facing=up,open=false]'); ;[5, 9].forEach(x => S(x, 5, 10, 'minecraft:lantern[hanging=true]'))
  for (var x = 13; x <= 18; x++) { S(x, 1, 12, x == 15 ? 'farmersdelight:stove[facing=north,lit=false]' : x == 16 ? 'mcwfurnitures:spruce_kitchen_sink[facing=north,water=false]' : MAT('spruce_counter', 'north')); if (x != 15) S(x, 3, 12, 'mcwfurnitures:spruce_kitchen_cabinet[facing=north,hinge=' + (x % 2 ? 'left' : 'right') + ']') }
  S(15, 2, 12, 'farmersdelight:cooking_pot'); S(13, 2, 12, 'farmersdelight:cutting_board[facing=north]'); S(18, 1, 10, 'minecraft:barrel[facing=west,open=false]'); S(18, 1, 11, 'minecraft:barrel[facing=west,open=false]'); S(16, 1, 10, 'mcwfurnitures:spruce_table'); S(16, 2, 10, 'farmersdelight:cabbage_crate'.replace('farmersdelight:cabbage_crate', 'supplementaries:jar')); S(15, 5, 11, 'minecraft:lantern[hanging=true]')
  // etage : dortoir, lits superposes
  for (var x = 4; x <= 14; x += 2) { S(x, 7, 3, 'minecraft:green_bed[facing=north,part=head]'); S(x, 7, 4, 'minecraft:green_bed[facing=north,part=foot]'); F(x, 8, 3, x, 8, 4, 'minecraft:spruce_slab[type=top]'); S(x, 9, 3, 'minecraft:green_bed[facing=north,part=head]'); S(x, 9, 4, 'minecraft:green_bed[facing=north,part=foot]'); S(x, 7, 5, 'minecraft:chest[facing=south]') }
  for (var x = 4; x <= 18; x += 2) { S(x, 7, 12, 'minecraft:green_bed[facing=south,part=head]'); S(x, 7, 11, 'minecraft:green_bed[facing=south,part=foot]'); F(x, 8, 11, x, 8, 12, 'minecraft:spruce_slab[type=top]'); S(x, 9, 12, 'minecraft:green_bed[facing=south,part=head]'); S(x, 9, 11, 'minecraft:green_bed[facing=south,part=foot]'); if (x != 18) S(x, 7, 10, 'minecraft:chest[facing=north]') }
  for (var x = 3; x <= 15; x += 2) F(x, 7, 3, x, 8, 3, 'minecraft:barrel[facing=south,open=false]'); for (var x = 3; x <= 17; x += 2) F(x, 7, 12, x, 8, 12, 'minecraft:barrel[facing=north,open=false]')
  S(9, 7, 7, 'mcwfurnitures:spruce_table'); S(8, 7, 7, MAT('spruce_chair', 'east')); S(10, 7, 7, MAT('spruce_chair', 'west')); S(9, 8, 7, 'minecraft:candle[candles=3,lit=false]'); ;[5, 9, 13].forEach(x => S(x, 11, 7, 'minecraft:lantern[hanging=true]')); S(17, 11, 10, 'minecraft:lantern[hanging=true]')
  // toit : nid de sacs, antenne, citerne
  ;[[15, 3], [16, 3], [17, 3], [18, 3], [18, 4], [18, 5], [14, 3]].forEach(c => S(c[0], 13, c[1], SAC)); F(4, 13, 4, 4, 18, 4, 'minecraft:iron_bars'); S(4, 19, 4, 'minecraft:lightning_rod[facing=up,powered=false,waterlogged=false]')
  F(8, 13, 9, 9, 14, 10, 'minecraft:barrel[facing=up,open=false]'); S(16, 13, 5, 'minecraft:end_rod[facing=up]')
  // parc auto (hangar x22..30 z2..12)
  F(22, -1, 2, 30, -1, 12, 'minecraft:gray_concrete'); F(22, 0, 2, 30, 5, 2, 'minecraft:gray_concrete'); ;[22, 26, 30].forEach(x => F(x, 0, 12, x, 5, 12, 'minecraft:polished_basalt[axis=y]')); F(22, 0, 3, 22, 5, 11, 'minecraft:gray_concrete'); F(30, 0, 3, 30, 5, 11, 'minecraft:gray_concrete')
  F(21, 6, 1, 31, 6, 13, 'minecraft:waxed_weathered_cut_copper_slab[type=bottom]'); F(22, 6, 2, 30, 6, 12, 'minecraft:waxed_weathered_cut_copper'); ;[4, 8].forEach(z => F(22, 3, z, 22, 4, z + 2, 'minecraft:glass_pane'))
  F(24, 0, 5, 26, 0, 9, 'minecraft:green_concrete'); ;[[24, 5], [26, 5], [24, 9], [26, 9]].forEach(c => S(c[0], 0, c[1], 'minecraft:black_concrete')); F(24, 1, 8, 26, 1, 9, 'minecraft:green_concrete'); F(24, 2, 7, 26, 2, 7, 'minecraft:glass_pane'); S(24, 1, 6, 'minecraft:black_carpet'); S(26, 1, 6, 'minecraft:black_carpet'); S(25, 1, 5, 'minecraft:green_concrete')
  F(28, 0, 3, 29, 0, 11, 'minecraft:gray_concrete'); F(28, 1, 3, 29, 3, 8, 'minecraft:green_wool'); F(28, 1, 9, 29, 2, 10, 'minecraft:green_concrete'); F(28, 2, 10, 29, 2, 10, 'minecraft:glass_pane'.replace('glass_pane', 'black_stained_glass')); ;[4, 7, 10].forEach(z => { S(28, 0, z, 'minecraft:black_concrete'); S(29, 0, z, 'minecraft:black_concrete') })
  F(23, 0, 3, 23, 1, 4, 'minecraft:barrel[facing=up,open=false]'); S(25, 0, 3, 'minecraft:smithing_table'); S(26, 0, 3, 'minecraft:anvil[facing=north]'); S(27, 0, 3, 'minecraft:chest[facing=south]'); F(25, 5, 10, 25, 5, 10, 'minecraft:chain[axis=y]'); S(25, 4, 10, 'minecraft:lightning_rod[facing=down,powered=false,waterlogged=false]')
  // place d'armes : mat, tentes, champ de tir, mirador, guerite
  F(11, 0, 19, 11, 9, 19, 'minecraft:iron_bars'); S(11, 10, 19, 'minecraft:green_banner[rotation=4]'); S(10, 0, 19, 'minecraft:stone_brick_wall'); S(12, 0, 19, 'minecraft:stone_brick_wall')
  function tente(x1, z0, laine, lits) {
    F(x1, 1, z0, x1 + 5, 1, z0, laine); F(x1, 1, z0 + 4, x1 + 5, 1, z0 + 4, laine); F(x1, 2, z0 + 1, x1 + 5, 2, z0 + 1, laine); F(x1, 2, z0 + 3, x1 + 5, 2, z0 + 3, laine); F(x1, 3, z0 + 2, x1 + 5, 3, z0 + 2, laine)
    F(x1, 1, z0 + 1, x1, 1, z0 + 3, laine); S(x1, 2, z0 + 2, laine); F(x1 + 5, 1, z0 + 1, x1 + 5, 1, z0 + 1, laine); S(x1 + 5, 1, z0 + 3, laine)
    F(x1, 0, z0, x1 + 5, 0, z0 + 4, 'minecraft:spruce_planks'); S(x1 + 4, 2, z0 + 2, 'minecraft:lantern[hanging=true]')
    S(x1 + 1, 1, z0 + 1, lits + '_bed[facing=west,part=head]'); S(x1 + 2, 1, z0 + 1, lits + '_bed[facing=west,part=foot]'); S(x1 + 1, 1, z0 + 3, lits + '_bed[facing=west,part=head]'); S(x1 + 2, 1, z0 + 3, lits + '_bed[facing=west,part=foot]')
    S(x1 + 4, 1, z0 + 1, 'minecraft:chest[facing=north]'); S(x1 + 4, 1, z0 + 3, 'minecraft:barrel[facing=up,open=false]')
  }
  tente(2, 25, 'minecraft:white_wool', 'minecraft:white'); F(2, 1, 27, 2, 1, 27, 'minecraft:red_wool'); S(2, 2, 27, 'minecraft:red_wool'); S(3, 1, 27, 'minecraft:brewing_stand'); S(5, 1, 27, 'minecraft:cauldron')
  tente(8, 24, 'minecraft:green_wool', 'minecraft:green')
  ;[15, 17, 19].forEach(z => { S(30, 0, z, 'minecraft:hay_block[axis=y]'); S(30, 1, z, 'minecraft:target') }); for (var z = 15; z <= 20; z++) S(23, 0, z, SAC); S(23, 1, 16, SAC); S(23, 1, 18, SAC)
  ;[[26, 24], [29, 24], [26, 27], [29, 27]].forEach(c => F(c[0], 0, c[1], c[0], 13, c[1], 'minecraft:spruce_log[axis=y]')); F(26, 10, 24, 29, 10, 27, 'minecraft:spruce_planks'); S(27, 10, 24, AIR); F(27, 1, 24, 27, 10, 24, 'minecraft:ladder[facing=east]')
  F(26, 11, 25, 26, 11, 26, 'minecraft:spruce_fence'); F(29, 11, 25, 29, 11, 26, 'minecraft:spruce_fence'); F(27, 11, 27, 28, 11, 27, 'minecraft:spruce_fence'); S(28, 11, 24, 'minecraft:spruce_fence')
  F(25, 14, 23, 30, 14, 28, 'minecraft:spruce_slab[type=bottom]'); S(28, 11, 26, SAC); S(27, 11, 26, 'minecraft:sea_lantern'); S(28, 13, 25, 'minecraft:lantern[hanging=true]')
  W(20, 26, 23, 29, 1, 3, 'minecraft:white_concrete'); F(20, 0, 26, 23, 0, 29, 'minecraft:polished_andesite'); F(20, 4, 26, 23, 4, 29, 'minecraft:smooth_stone_slab[type=bottom]'); PORTE(20, 1, 27, 'minecraft:spruce_door', 'west', 'left', 'false')
  F(23, 2, 27, 23, 2, 28, 'minecraft:glass_pane'); F(21, 2, 29, 22, 2, 29, 'minecraft:glass_pane'); F(21, 2, 26, 22, 2, 26, 'minecraft:glass_pane'); S(22, 1, 28, 'mcwfurnitures:spruce_table'); S(21, 1, 28, MAT('spruce_chair', 'east')); S(22, 2, 28, 'minecraft:jukebox'.replace('minecraft:jukebox', 'minecraft:candle[candles=1,lit=false]')); S(22, 3, 27, 'minecraft:lantern[hanging=true]')
  ;[13, 14, 17, 18].forEach(x => S(x, 0, 30, SAC)); S(13, 1, 30, SAC); S(18, 1, 30, SAC)
  ;[[1, 15], [1, 22], [24, 14]].forEach(c => S(c[0], 0, c[1], 'minecraft:barrel[facing=up,open=false]')); S(21, 0, 14, 'minecraft:chest[facing=south]'); S(21, 0, 15, 'minecraft:barrel[facing=up,open=false]')
}


// ================= BOURG FORESTIER ABANDONNE (exemple de ville complete, architecture bois / taiga) =================
// Rangee nord (z0..31, facades au sud) : mairie, eglise, place, maisons. Rue z32..47. Rangee sud (z48..79, facades au nord).
var BGS = 'minecraft:spruce_planks', BGL = 'minecraft:spruce_log[axis=y]', BGX = 'minecraft:stripped_spruce_log[axis=x]', BGZ = 'minecraft:stripped_spruce_log[axis=z]'
var BGF = 'minecraft:spruce_fence', BGP = 'mcwdoors:spruce_classic_door', BGV = 'mcwdoors:spruce_glass_door', BGT = {}
function bgPierre() { return choix(['minecraft:cobblestone', 'minecraft:stone_bricks', 'minecraft:mossy_cobblestone', 'minecraft:cobblestone', 'minecraft:andesite']) }
function bgSol(x1, z1, x2, z2) { for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) { var r = R(); S(x, -1, z, r < 0.15 ? 'minecraft:podzol' : r < 0.23 ? 'minecraft:coarse_dirt' : r < 0.26 ? 'minecraft:moss_block' : 'minecraft:grass_block'); BGT[x + ',' + z] = 1 } }
function bgDalle(x1, z1, x2, z2, l) { for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) { S(x, -1, z, typeof l == 'string' ? l : choix(l)); delete BGT[x + ',' + z] } }
function bgVeg(x1, z1, x2, z2, d) {
  for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) {
    if (!BGT[x + ',' + z]) continue
    var r = R()
    if (r < d * 0.45) SA(x, 0, z, 'minecraft:short_grass'); else if (r < d * 0.75) SA(x, 0, z, 'minecraft:fern'); else if (r < d * 0.83) SA(x, 0, z, 'minecraft:sweet_berry_bush[age=1]')
    else if (r < d * 0.93) SA(x, 0, z, choix(['minecraft:poppy', 'minecraft:dandelion', 'minecraft:cornflower', 'minecraft:lily_of_the_valley', 'minecraft:oxeye_daisy'])); else if (r < d) SA(x, 0, z, 'minecraft:dead_bush')
  }
}
function bgPapiers(x1, z1, x2, z2, y, n) { for (var i = 0; i < n; i++) SA(x1 + Math.floor(R() * (x2 - x1 + 1)), y, z1 + Math.floor(R() * (z2 - z1 + 1)), choix(['minecraft:white_carpet', 'minecraft:white_carpet', 'supplementaries:book_pile', 'minecraft:light_gray_carpet'])) }
// Coque : plancher, murs (rez en pierre si demande, etages en planches et poteaux), planchers d'etage et bandeaux
function bgCoque(x1, z1, x2, z2, nb, pierre) {
  F(x1, 0, z1, x2, 0, z2, BGS)
  for (var f = 0; f < nb; f++) {
    var y0 = 6 * f, pi = f == 0 && pierre
    for (var y = y0 + 1; y <= y0 + 5; y++) {
      for (var x = x1; x <= x2; x++) { S(x, y, z1, pi ? bgPierre() : BGS); S(x, y, z2, pi ? bgPierre() : BGS) }
      for (var z = z1 + 1; z < z2; z++) { S(x1, y, z, pi ? bgPierre() : BGS); S(x2, y, z, pi ? bgPierre() : BGS) }
    }
    if (pi) [[x1, z1], [x2, z1], [x1, z2], [x2, z2]].forEach(c => F(c[0], y0 + 1, c[1], c[0], y0 + 5, c[1], 'minecraft:stone_bricks'))
    else {
      for (var x = x1; x <= x2; x++) if ((x - x1) % 4 == 0 || x == x2) { F(x, y0 + 1, z1, x, y0 + 5, z1, BGL); F(x, y0 + 1, z2, x, y0 + 5, z2, BGL) }
      for (var z = z1; z <= z2; z++) if ((z - z1) % 4 == 0 || z == z2) { F(x1, y0 + 1, z, x1, y0 + 5, z, BGL); F(x2, y0 + 1, z, x2, y0 + 5, z, BGL) }
    }
    F(x1 + 1, y0 + 6, z1 + 1, x2 - 1, y0 + 6, z2 - 1, BGS); F(x1, y0 + 6, z1, x2, y0 + 6, z1, BGX); F(x1, y0 + 6, z2, x2, y0 + 6, z2, BGX); F(x1, y0 + 6, z1 + 1, x1, y0 + 6, z2 - 1, BGZ); F(x2, y0 + 6, z1 + 1, x2, y0 + 6, z2 - 1, BGZ)
  }
}
// Toits a deux pans : faitage selon x (pans au nord et au sud) ou selon z ; gab = plans de pignon a remplir
function bgFaite(m) { return m == 'gray' ? 'minecraft:deepslate_tile_slab[type=bottom]' : 'minecraft:spruce_slab[type=bottom]' }
function bgToitX(xa, xb, z1, z2, y0, m, gab) {
  for (var k = 0; ; k++) {
    var y = y0 + k, zn = z1 - 1 + k, zs = z2 + 1 - k
    if (zn > zs) break
    if (zn == zs) { F(xa, y, zn, xb, y, zn, bgFaite(m)); break }
    F(xa, y, zs, xb, y, zs, TOIT('north', m)); F(xa, y, zn, xb, y, zn, TOIT('south', m))
    if (k > 0 && zn + 1 <= zs - 1) (gab || []).forEach(g => F(g, y, zn + 1, g, y, zs - 1, BGS))
  }
}
function bgToitZ(za, zb, x1, x2, y0, m, gab) {
  for (var k = 0; ; k++) {
    var y = y0 + k, xw = x1 - 1 + k, xe = x2 + 1 - k
    if (xw > xe) break
    if (xw == xe) { F(xw, y, za, xw, y, zb, bgFaite(m)); break }
    F(xw, y, za, xw, y, zb, TOIT('east', m)); F(xe, y, za, xe, y, zb, TOIT('west', m))
    if (k > 0 && xw + 1 <= xe - 1) (gab || []).forEach(g => F(xw + 1, y, g, xe - 1, y, g, BGS))
  }
}
// Fenetre : a1..a2 le long du mur, c = coordonnee du mur, f = cote exterieur. etat 0 volets ouverts, 1 volets clos, 2 planches clouees, 3 vitre seule
function bgFen(a1, a2, y, c, f, h, etat) {
  var ns = f == 'north' || f == 'south', d = (f == 'south' || f == 'east') ? 1 : -1
  function P(a, yy, o, b) { if (ns) S(a, yy, c + o, b); else S(c + o, yy, a, b) }
  var vo = 'minecraft:spruce_trapdoor[facing=' + f + ',half=bottom,open=true]', g1 = R() > 0.15, g2 = R() > 0.15
  for (var a = a1; a <= a2; a++) for (var k = 0; k < h; k++) {
    P(a, y + k, 0, etat == 2 ? 'minecraft:oak_trapdoor[facing=' + f + ',half=' + (k % 2 ? 'bottom' : 'top') + ',open=false]' : GP)
    if (etat == 1) P(a, y + k, d, vo)
  }
  if (etat == 0) for (var k = 0; k < h; k++) { if (g1) P(a1 - 1, y + k, d, vo); if (g2) P(a2 + 1, y + k, d, vo) }
}
// Lierre accroche a un mur dont la face exterieure est f
function bgLierre(a, c, y1, y2, f) { var ns = f == 'north' || f == 'south', d = (f == 'south' || f == 'east') ? 1 : -1; for (var y = y1; y <= y2; y++) { if (ns) SA(a, y, c + d, 'minecraft:vine[' + OPP[f] + '=true]'); else SA(c + d, y, a, 'minecraft:vine[' + OPP[f] + '=true]') } }
function bgBanc(x, z, f, n) { // assise en marches, dossier du cote f ; n places le long de l'axe perpendiculaire
  var ns = f == 'north' || f == 'south'
  for (var i = 0; i < n; i++) S(ns ? x + i : x, 0, ns ? z : z + i, 'minecraft:spruce_stairs[facing=' + f + ',half=bottom,shape=straight]')
  if (ns) { S(x - 1, 0, z, 'minecraft:spruce_trapdoor[facing=west,half=bottom,open=true]'); S(x + n, 0, z, 'minecraft:spruce_trapdoor[facing=east,half=bottom,open=true]') }
  else { S(x, 0, z - 1, 'minecraft:spruce_trapdoor[facing=north,half=bottom,open=true]'); S(x, 0, z + n, 'minecraft:spruce_trapdoor[facing=south,half=bottom,open=true]') }
}
function bgLampe(x, z) { S(x, 0, z, 'minecraft:stone_brick_wall'); F(x, 1, z, x, 2, z, BGF); S(x, 3, z, 'minecraft:lantern[hanging=false]') }
// Voiture 2 x 4 ; ax = axe de la longueur ; etat 0 intacte, 1 vitres brisees, 2 brulee ; roues = boutons sur les flancs
function bgVoiture(x, z, ax, c, etat, sansRoues) {
  var corps = etat == 2 ? 'minecraft:black_concrete' : 'minecraft:' + c + '_concrete', vit = etat == 2 ? 'minecraft:coal_block' : 'minecraft:tinted_glass', tc = etat == 2 ? 'minecraft:black_carpet' : 'minecraft:' + c + '_carpet'
  function P(u, v, y, b) { if (ax == 'x') S(x + u, y, z + v, b); else S(x + v, y, z + u, b) }
  for (var u = 0; u < 4; u++) for (var v = 0; v < 2; v++) { P(u, v, 0, corps); P(u, v, 1, u == 0 || u == 3 ? tc : (etat == 1 && u == 1 && v == 0 ? 'minecraft:gray_stained_glass' : vit)) }
  if (etat != 2) for (var v = 0; v < 2; v++) { P(1, v, 2, tc); P(2, v, 2, tc) } else P(1, 0, 2, 'minecraft:cobweb')
  if (!sansRoues) { var cs = ax == 'x' ? ['north', 'south'] : ['west', 'east']; [0, 3].forEach(u => { P(u, -1, 0, 'minecraft:polished_blackstone_button[face=wall,facing=' + cs[0] + ']'); P(u, 2, 0, 'minecraft:polished_blackstone_button[face=wall,facing=' + cs[1] + ']') }) }
}

// ================= MAIRIE (2 x 2 chunks, R+1, avant-corps et campanile) =================
function bgMairie() {
  BGT = {}
  var SB = 'minecraft:stone_bricks', BS = 'minecraft:bookshelf', ST = 'minecraft:spruce_stairs', LH = 'minecraft:lantern[hanging=true]', LU = 'mcwlights:iron_chandelier'
  bgSol(0, 0, 31, 31)
  bgDalle(14, 27, 17, 31, ['minecraft:gravel', 'minecraft:gravel', 'minecraft:dirt_path', 'minecraft:cobblestone'])
  // gros oeuvre : corps x4..27 z10..23, avant-corps x12..19 z23..26
  bgCoque(4, 10, 27, 23, 2, true); bgCoque(12, 23, 19, 26, 2, true)
  W(4, 10, 27, 23, 0, 0, SB); F(12, 0, 23, 19, 0, 26, SB)
  F(13, 1, 23, 18, 5, 23, AIR); F(13, 7, 23, 18, 11, 23, AIR)
  F(13, 0, 11, 18, 0, 25, 'minecraft:dark_oak_planks')
  // cloisons
  F(12, 1, 11, 12, 5, 22, SB); F(19, 1, 11, 19, 5, 22, SB); F(20, 1, 17, 26, 5, 17, SB)
  PORTE(12, 1, 21, BGP, 'west', 'left', 'false'); PORTE(19, 1, 22, BGP, 'east', 'left', 'false'); PORTE(23, 1, 17, BGP, 'north', 'left', 'false')
  F(12, 7, 11, 12, 11, 22, BGS); F(19, 7, 11, 19, 11, 22, BGS)
  PORTE(12, 7, 13, BGP, 'west', 'left', 'false'); PORTE(19, 7, 13, BGP, 'east', 'right', 'false')
  // escalier d'honneur
  for (var k = 0; k <= 5; k++) { S(18, 1 + k, 21 - k, ST + '[facing=north,half=bottom,shape=straight]'); if (k > 0) F(18, 1, 21 - k, 18, k, 21 - k, BGS) }
  F(18, 6, 17, 18, 6, 20, AIR); F(17, 7, 17, 17, 7, 20, BGF)
  // toits : ardoise, avant-corps a pignon, campanile
  bgToitX(3, 28, 10, 23, 12, 'gray', [4, 27])
  F(13, 12, 24, 18, 12, 25, BGS)
  bgToitZ(20, 27, 12, 19, 12, 'gray', [26])
  F(14, 13, 15, 16, 22, 17, BGS); ;[[14, 15], [16, 15], [14, 17], [16, 17]].forEach(c => F(c[0], 13, c[1], c[0], 26, c[1], BGL))
  F(14, 23, 15, 16, 23, 17, BGS); S(15, 21, 17, 'supplementaries:clock_block[facing=south]'); S(15, 21, 15, 'supplementaries:clock_block[facing=north]')
  ;[[15, 15], [15, 17], [14, 16], [16, 16]].forEach(c => S(c[0], 24, c[1], BGF))
  F(13, 27, 14, 17, 27, 18, BGS); S(15, 26, 16, 'minecraft:bell[attachment=ceiling,facing=south]')
  F(14, 28, 15, 16, 28, 17, 'minecraft:deepslate_tile_slab[type=bottom]'); S(15, 28, 16, 'minecraft:deepslate_tiles'); S(15, 29, 16, 'minecraft:lightning_rod')
  // fenetres du rez (pierre) et de l'etage (bois, volets)
  ;[[6, 7], [9, 10], [21, 22], [24, 25]].forEach((p, i) => bgFen(p[0], p[1], 2, 23, 'south', 2, i == 2 ? 2 : 3))
  bgFen(13, 14, 2, 4, 'west', 2, 3); bgFen(18, 19, 2, 4, 'west', 2, 3); bgFen(13, 13, 2, 27, 'east', 2, 3); bgFen(20, 21, 2, 27, 'east', 2, 2)
  bgFen(8, 8, 2, 10, 'north', 2, 3); bgFen(15, 16, 2, 10, 'north', 3, 3); bgFen(22, 22, 3, 10, 'north', 2, 3); bgFen(24, 24, 3, 10, 'north', 2, 3)
  bgFen(13, 13, 2, 26, 'south', 2, 3); bgFen(18, 18, 2, 26, 'south', 2, 3); bgFen(25, 25, 2, 12, 'west', 2, 3); bgFen(25, 25, 2, 19, 'east', 2, 3)
  ;[[6, 7], [9, 10], [21, 22], [25, 26]].forEach((p, i) => bgFen(p[0], p[1], 8, 23, 'south', 2, i == 1 ? 1 : 0))
  ;[13, 16, 20].forEach((z, i) => { bgFen(z, z, 8, 4, 'west', 2, i == 2 ? 1 : 0); bgFen(z, z, 8, 27, 'east', 2, 0) })
  bgFen(7, 7, 8, 10, 'north', 2, 0); bgFen(10, 10, 8, 10, 'north', 2, 0); bgFen(14, 15, 8, 10, 'north', 2, 0); bgFen(22, 22, 8, 10, 'north', 2, 1); bgFen(25, 25, 8, 10, 'north', 2, 0)
  bgFen(13, 13, 8, 26, 'south', 2, 0); bgFen(18, 18, 8, 26, 'south', 2, 0); bgFen(25, 25, 8, 12, 'west', 2, 3); bgFen(25, 25, 8, 19, 'east', 2, 3)
  bgFen(16, 17, 14, 4, 'west', 2, 3); bgFen(16, 17, 14, 27, 'east', 2, 3)
  // entree : double porte, imposte, perron, balcon d'honneur
  PORTE(15, 1, 26, BGP, 'south', 'left', 'false'); PORTE(16, 1, 26, BGP, 'south', 'right', 'false'); S(15, 3, 26, GP); S(16, 3, 26, GP); F(15, 4, 26, 16, 4, 26, 'minecraft:chiseled_stone_bricks')
  F(13, 0, 27, 18, 0, 27, 'minecraft:stone_brick_stairs[facing=north,half=bottom,shape=straight]'); S(12, 0, 27, 'minecraft:stone_brick_wall'); S(19, 0, 27, 'minecraft:stone_brick_wall'); S(12, 1, 27, 'minecraft:lantern[hanging=false]'); S(19, 1, 27, 'minecraft:lantern[hanging=false]')
  PORTE(15, 7, 26, BGV, 'south', 'left', 'false'); PORTE(16, 7, 26, BGV, 'south', 'right', 'false')
  F(13, 6, 27, 18, 6, 28, 'minecraft:spruce_slab[type=top]'); F(13, 7, 28, 18, 7, 28, BGF); S(13, 7, 27, BGF); S(18, 7, 27, BGF)
  S(13, 5, 27, ST + '[facing=north,half=top,shape=straight]'); S(18, 5, 27, ST + '[facing=north,half=top,shape=straight]')
  S(13, 10, 27, 'minecraft:white_wall_banner[facing=south]'); S(18, 10, 27, 'minecraft:light_gray_wall_banner[facing=south]')
  // hall : accueil, banquette, tableau d'affichage, sacs de sable
  F(15, 1, 14, 16, 1, 25, 'minecraft:red_carpet'); for (var z = 14; z <= 25; z++) { if (R() < 0.15) S(15, 1, z, AIR); if (R() < 0.15) S(16, 1, z, AIR) }
  F(13, 1, 13, 16, 1, 13, MAT('spruce_counter', 'south')); S(14, 2, 13, 'supplementaries:book_pile'); S(16, 2, 13, 'minecraft:candle[candles=2,lit=false]')
  S(15, 1, 12, 'mcwfurnitures:spruce_table'); S(16, 1, 12, MAT('spruce_chair', 'west')); F(13, 1, 11, 14, 2, 11, BS); F(17, 1, 11, 17, 2, 11, BS)
  S(13, 2, 16, 'supplementaries:notice_board[facing=east]'); S(13, 1, 18, MAT('spruce_chair', 'east')); S(13, 1, 19, MAT('spruce_chair', 'east'))
  S(13, 1, 22, 'minecraft:potted_fern'); S(17, 1, 22, 'minecraft:potted_dead_bush'); S(15, 1, 19, LU); S(16, 5, 21, LU); S(14, 5, 12, LH); S(15, 5, 24, LH)
  F(13, 1, 24, 13, 2, 24, 'supplementaries:sack'); S(18, 1, 24, 'supplementaries:sack'); S(18, 1, 25, 'supplementaries:sack')
  // salle du conseil
  for (var z = 13; z <= 20; z++) { S(8, 1, z, 'mcwfurnitures:spruce_table'); S(7, 1, z, MAT('spruce_chair', 'east')); S(9, 1, z, MAT('spruce_chair', 'west')) }
  S(8, 1, 12, MAT('spruce_chair', 'south')); S(8, 1, 21, MAT('spruce_chair', 'north')); S(9, 1, 17, 'supplementaries:sack'); S(10, 1, 15, MAT('spruce_chair', 'east'))
  S(8, 2, 14, 'minecraft:candle[candles=3,lit=false]'); S(8, 2, 19, 'minecraft:candle[candles=3,lit=false]'); S(8, 2, 17, 'minecraft:white_carpet'); S(8, 2, 16, 'supplementaries:book_pile')
  F(5, 1, 11, 7, 2, 11, BS); F(9, 1, 11, 11, 2, 11, BS); S(5, 3, 16, 'minecraft:blue_wall_banner[facing=east]'); S(5, 3, 21, 'minecraft:red_wall_banner[facing=east]')
  S(6, 1, 22, 'minecraft:lectern[facing=north]'); S(11, 1, 22, 'minecraft:potted_fern'); S(8, 5, 15, LU); S(8, 5, 19, LU)
  // accueil et etat civil
  F(20, 1, 20, 25, 1, 20, MAT('spruce_counter', 'south')); S(21, 2, 20, 'minecraft:iron_bars'); S(23, 2, 20, 'minecraft:iron_bars'); S(25, 2, 20, 'supplementaries:book_pile')
  F(20, 1, 18, 22, 1, 18, MAT('spruce_drawer', 'south')); S(25, 1, 18, 'mcwfurnitures:spruce_table'); S(24, 1, 18, MAT('spruce_chair', 'east')); S(25, 2, 18, 'minecraft:candle[candles=1,lit=false]'); S(26, 1, 18, 'minecraft:barrel[facing=up,open=false]')
  S(23, 1, 22, MAT('spruce_chair', 'north')); S(24, 1, 22, MAT('spruce_chair', 'north')); S(26, 1, 22, 'minecraft:potted_fern'); S(20, 1, 21, 'minecraft:potted_bamboo'); S(23, 5, 19, LH); S(23, 5, 21, LH)
  // archives
  ;[21, 23, 25].forEach(x => F(x, 1, 12, x, 3, 15, BS)); S(20, 1, 11, 'minecraft:chest[facing=east]'); S(26, 1, 16, 'minecraft:barrel[facing=up,open=true]')
  S(22, 1, 13, 'supplementaries:book_pile'); S(24, 1, 16, 'supplementaries:book_pile'); S(22, 5, 13, LH); S(24, 5, 15, LH); S(26, 5, 12, LH)
  // etage : bureau du maire
  F(6, 7, 15, 10, 7, 20, 'minecraft:red_carpet'); for (var x = 7; x <= 9; x++) S(x, 7, 17, 'mcwfurnitures:spruce_table')
  S(8, 7, 18, MAT('spruce_chair', 'north')); S(7, 7, 16, MAT('spruce_chair', 'south')); S(9, 7, 16, MAT('spruce_chair', 'south'))
  S(7, 8, 17, 'minecraft:candle[candles=2,lit=false]'); S(8, 8, 17, 'supplementaries:book_pile'); S(9, 8, 17, 'supplementaries:globe')
  F(5, 7, 11, 6, 9, 11, BS); F(8, 7, 11, 9, 9, 11, BS); F(11, 7, 11, 11, 9, 11, BS); S(11, 7, 12, 'minecraft:chest[facing=west]')
  S(5, 7, 14, 'mcwfurnitures:brown_couch[facing=east,shape=single]'); S(5, 7, 15, 'mcwfurnitures:brown_couch[facing=east,shape=single]')
  S(5, 7, 21, 'minecraft:potted_azalea_bush'); S(11, 7, 21, 'mcwfurnitures:spruce_end_table'); S(11, 8, 21, 'minecraft:candle[candles=1,lit=false]'); S(5, 9, 18, 'minecraft:white_wall_banner[facing=east]'); S(8, 11, 17, LU)
  // etage : palier
  S(13, 7, 12, 'mcwfurnitures:gray_couch[facing=east,shape=single]'); S(13, 7, 14, 'mcwfurnitures:gray_couch[facing=east,shape=single]'); S(17, 7, 11, 'minecraft:chest[facing=south]'); S(13, 7, 11, 'minecraft:potted_fern')
  S(16, 11, 14, LU); S(17, 7, 22, 'minecraft:barrel[facing=up,open=false]'); S(13, 7, 25, 'minecraft:potted_bamboo'); S(18, 7, 25, 'minecraft:potted_fern')
  // etage : secretariat
  ;[[22, 14], [25, 14], [22, 19], [25, 19]].forEach(p => { S(p[0], 7, p[1], 'mcwfurnitures:spruce_table'); S(p[0], 7, p[1] + 1, MAT('spruce_chair', 'north')) })
  F(20, 7, 11, 21, 8, 11, BS); F(26, 7, 11, 26, 7, 12, 'minecraft:barrel[facing=up,open=false]'); F(26, 7, 16, 26, 7, 18, MAT('spruce_drawer', 'west'))
  S(22, 8, 14, 'supplementaries:book_pile'); S(25, 8, 19, 'minecraft:candle[candles=1,lit=false]'); S(22, 11, 16, LH); S(25, 11, 16, LH)
  bgPapiers(13, 11, 18, 22, 1, 5); bgPapiers(5, 11, 11, 22, 1, 4); bgPapiers(20, 18, 26, 22, 1, 4); bgPapiers(20, 11, 26, 22, 7, 5); bgPapiers(5, 11, 11, 22, 7, 3)
  // cour d'honneur : haies, bancs, lampadaires, massifs
  for (var x = 1; x <= 30; x++) if ((x < 12 || x > 19) && R() > 0.12) S(x, 0, 30, 'minecraft:spruce_leaves[persistent=true]')
  bgLampe(12, 29); bgLampe(19, 29); bgBanc(8, 27, 'north', 2); bgBanc(22, 27, 'north', 2)
  bgVeg(5, 24, 11, 26, 0.9); bgVeg(20, 24, 26, 26, 0.9)
  bgLierre(11, 4, 1, 9, 'west'); bgLierre(21, 4, 1, 7, 'west'); bgLierre(11, 27, 1, 10, 'east')
  // arriere : parking, remise des services techniques, bucher
  bgDalle(16, 1, 30, 8, ['minecraft:gravel', 'minecraft:gravel', 'minecraft:coarse_dirt', 'minecraft:andesite'])
  bgVoiture(19, 3, 'z', 'white', 0); bgVoiture(25, 2, 'z', 'green', 1)
  bgDalle(4, 3, 8, 5, 'minecraft:spruce_planks'); W(3, 2, 9, 6, 0, 3, BGS); ;[[3, 2], [9, 2], [3, 6], [9, 6]].forEach(c => F(c[0], 0, c[1], c[0], 3, c[1], BGL))
  F(2, 4, 1, 10, 4, 7, 'minecraft:spruce_slab[type=bottom]'); PORTE(6, 0, 6, BGP, 'south', 'left', 'true'); S(8, 1, 6, GP)
  S(4, 0, 3, 'minecraft:anvil[facing=north]'); S(8, 0, 3, 'minecraft:chest[facing=south]'); S(4, 0, 5, 'minecraft:barrel[facing=up,open=false]'); S(8, 0, 5, 'minecraft:grindstone[face=floor,facing=north]'); S(5, 0, 3, 'minecraft:composter[level=0]'); S(6, 3, 4, LH)
  F(10, 0, 1, 13, 1, 1, 'minecraft:spruce_log[axis=x]'); S(11, 2, 1, 'minecraft:spruce_log[axis=x]')
  // foret
  sapin(0, 8, 9); sapin(30, 13, 9); sapin(1, 20, 8); sapin(30, 25, 7); sapin(15, 3, 8)
  bgVeg(0, 0, 31, 31, 0.3)
}

// ================= EGLISE EN BOIS (2 x 2 chunks, nef, abside, clocher-porche a fleche d'ardoise, cimetiere) =================
function bgEglise() {
  BGT = {}
  var DT = 'minecraft:deepslate_tiles', DO = 'minecraft:dark_oak_planks', SB = 'minecraft:stone_bricks', VIT = ['minecraft:light_blue_stained_glass_pane', 'minecraft:yellow_stained_glass_pane', 'minecraft:white_stained_glass_pane', 'minecraft:red_stained_glass_pane']
  bgSol(0, 0, 31, 31)
  // nef x10..20 z6..24 : soubassement de pierre, bardage, poteaux
  F(10, 0, 6, 20, 0, 24, DO)
  for (var y = 1; y <= 9; y++) for (var x = 10; x <= 20; x++) for (var z = 6; z <= 24; z++) {
    if (x != 10 && x != 20 && z != 6 && z != 24) continue
    S(x, y, z, y <= 2 ? bgPierre() : y == 3 ? (x == 10 || x == 20 ? BGZ : BGX) : BGS)
  }
  ;[6, 10, 14, 18, 22, 24].forEach(z => { F(10, 3, z, 10, 9, z, BGL); F(20, 3, z, 20, 9, z, BGL) }); ;[13, 17].forEach(x => { F(x, 3, 6, x, 9, 6, BGL); F(x, 3, 24, x, 9, 24, BGL) })
  F(10, 10, 6, 20, 10, 6, BGX); F(10, 10, 24, 20, 10, 24, BGX); F(10, 10, 7, 10, 10, 23, BGZ); F(20, 10, 7, 20, 10, 23, BGZ)
  ;[10, 14, 18, 22].forEach(z => F(11, 10, z, 19, 10, z, BGX))
  bgToitZ(5, 25, 10, 20, 10, 'gray', [6, 24])
  S(15, 12, 6, 'minecraft:yellow_stained_glass_pane'); S(15, 13, 6, 'minecraft:yellow_stained_glass_pane')
  ;[8, 12, 16, 20].forEach(z => { var v = choix(VIT); F(10, 4, z, 10, 7, z, z == 16 ? AIR : v); if (z != 12) F(20, 4, z, 20, 7, z, choix(VIT)) })
  for (var k = 0; k < 4; k++) S(10, 4 + k, 16, 'minecraft:oak_trapdoor[facing=west,half=' + (k % 2 ? 'bottom' : 'top') + ',open=false]')
  // trou dans la toiture (pan ouest) et debris
  F(11, 12, 15, 11, 12, 16, AIR); F(12, 13, 15, 12, 13, 16, AIR); S(11, 1, 15, 'minecraft:spruce_leaves[persistent=true]'); S(11, 1, 16, 'minecraft:spruce_leaves[persistent=true]'); S(11, 1, 17, 'minecraft:moss_carpet')
  // choeur : estrade, autel, ambon
  F(11, 1, 7, 19, 1, 8, BGS); F(11, 1, 9, 19, 1, 9, 'minecraft:spruce_stairs[facing=north,half=bottom,shape=straight]')
  F(13, 2, 7, 17, 2, 7, 'minecraft:stripped_spruce_log[axis=x]'); F(14, 3, 7, 16, 3, 7, 'minecraft:white_carpet'); S(13, 3, 7, 'minecraft:candle[candles=3,lit=false]'); S(17, 3, 7, 'minecraft:candle[candles=3,lit=false]')
  S(18, 2, 8, 'minecraft:lectern[facing=south]'); S(12, 2, 8, MAT('dark_oak_chair', 'south')); S(11, 2, 7, 'minecraft:potted_dead_bush'); S(19, 2, 7, 'minecraft:potted_dead_bush')
  // abside x12..18 z2..6, ouverte sur la nef
  F(12, 0, 2, 18, 0, 5, DO); F(13, 1, 3, 17, 1, 6, BGS)
  for (var y = 1; y <= 8; y++) { for (var z = 2; z <= 5; z++) { S(12, y, z, y <= 2 ? bgPierre() : BGS); S(18, y, z, y <= 2 ? bgPierre() : BGS) } for (var x = 13; x <= 17; x++) S(x, y, 2, y <= 2 ? bgPierre() : BGS) }
  F(12, 3, 2, 12, 8, 2, BGL); F(18, 3, 2, 18, 8, 2, BGL); F(12, 9, 2, 18, 9, 2, BGX); F(12, 9, 3, 12, 9, 5, BGZ); F(18, 9, 3, 18, 9, 5, BGZ)
  F(13, 2, 6, 17, 7, 6, AIR)
  bgToitZ(1, 5, 12, 18, 9, 'gray', [2])
  F(15, 3, 3, 15, 7, 3, 'minecraft:stripped_dark_oak_log[axis=y]'); F(14, 6, 3, 16, 6, 3, 'minecraft:stripped_dark_oak_log[axis=x]')
  S(13, 2, 3, 'minecraft:candle[candles=4,lit=false]'); S(17, 2, 3, 'minecraft:candle[candles=2,lit=false]'); S(14, 2, 3, 'minecraft:potted_dead_bush'); S(16, 2, 4, 'minecraft:decorated_pot')
  F(12, 4, 4, 12, 6, 4, 'minecraft:yellow_stained_glass_pane'); F(18, 4, 4, 18, 6, 4, 'minecraft:yellow_stained_glass_pane'); F(13, 4, 2, 13, 6, 2, 'minecraft:red_stained_glass_pane'); F(17, 4, 2, 17, 6, 2, 'minecraft:blue_stained_glass_pane')
  // bancs, allee, benitiers, lustres
  F(15, 1, 10, 15, 1, 23, 'minecraft:red_carpet'); for (var z = 10; z <= 23; z++) if (R() < 0.2) S(15, 1, z, AIR)
  ;[11, 13, 15, 17, 19, 21].forEach(z => { F(12, 1, z, 14, 1, z, 'minecraft:spruce_stairs[facing=south,half=bottom,shape=straight]'); F(16, 1, z, 18, 1, z, 'minecraft:spruce_stairs[facing=south,half=bottom,shape=straight]') })
  S(17, 1, 15, AIR); S(18, 1, 15, 'minecraft:spruce_slab[type=bottom]'); S(13, 1, 19, AIR); F(16, 2, 17, 18, 2, 17, BGX)
  S(11, 1, 10, 'mcwfurnitures:spruce_table'); S(11, 2, 10, 'minecraft:candle[candles=4,lit=false]'); S(19, 1, 10, 'mcwfurnitures:spruce_table'); S(19, 2, 10, 'minecraft:candle[candles=3,lit=false]')
  S(14, 1, 23, 'minecraft:water_cauldron[level=1]'); S(16, 1, 23, 'minecraft:water_cauldron[level=1]'); S(11, 1, 23, 'supplementaries:notice_board[facing=east]'); S(19, 1, 23, 'minecraft:chest[facing=west]')
  ;[10, 14, 18, 22].forEach(z => S(15, 9, z, 'mcwlights:iron_chandelier')); bgPapiers(11, 10, 19, 23, 1, 6)
  // sacristie x21..25 z9..13
  F(21, 0, 9, 25, 0, 13, DO)
  for (var y = 1; y <= 5; y++) { for (var x = 21; x <= 25; x++) { S(x, y, 9, y <= 2 ? bgPierre() : BGS); S(x, y, 13, y <= 2 ? bgPierre() : BGS) } for (var z = 10; z <= 12; z++) S(25, y, z, y <= 2 ? bgPierre() : BGS) }
  F(21, 6, 9, 25, 6, 9, BGX); F(21, 6, 13, 25, 6, 13, BGX); F(25, 6, 10, 25, 6, 12, BGZ); F(21, 6, 10, 24, 6, 12, BGS)
  bgToitX(21, 26, 9, 13, 6, 'gray', [25])
  PORTE(20, 1, 11, BGP, 'east', 'left', 'false'); PORTE(25, 1, 11, BGP, 'east', 'left', 'false'); S(26, 0, 11, 'minecraft:stone_brick_stairs[facing=west,half=bottom,shape=straight]')
  S(23, 1, 10, 'mcwfurnitures:spruce_wardrobe[facing=south,connection=base,hinge=left]'); S(22, 1, 10, 'minecraft:chest[facing=south]'); S(24, 1, 12, 'mcwfurnitures:spruce_table'); S(23, 1, 12, MAT('spruce_chair', 'east')); S(24, 2, 12, 'minecraft:candle[candles=1,lit=false]'); S(23, 5, 11, 'minecraft:lantern[hanging=true]')
  F(23, 2, 13, 23, 3, 13, GP); F(23, 2, 9, 23, 3, 9, GP)
  // clocher-porche x13..17 z24..28
  F(13, 0, 24, 17, 0, 28, DO)
  for (var y = 1; y <= 20; y++) for (var x = 13; x <= 17; x++) for (var z = 24; z <= 28; z++) {
    var bord = x == 13 || x == 17 || z == 24 || z == 28
    if (!bord) { S(x, y, z, y == 6 || y == 12 ? BGS : AIR); continue }
    var coin = (x == 13 || x == 17) && (z == 24 || z == 28)
    S(x, y, z, y <= 4 ? (coin ? SB : bgPierre()) : coin ? BGL : (y == 6 || y == 12) ? (x == 13 || x == 17 ? BGZ : BGX) : BGS)
  }
  F(14, 1, 24, 16, 3, 24, AIR); S(14, 4, 24, 'minecraft:spruce_stairs[facing=east,half=top,shape=straight]'); S(16, 4, 24, 'minecraft:spruce_stairs[facing=west,half=top,shape=straight]'); S(15, 4, 24, AIR)
  F(16, 1, 27, 16, 19, 27, 'minecraft:ladder[facing=west]')
  PORTE(15, 1, 28, BGP, 'south', 'left', 'false'); S(15, 3, 28, 'minecraft:yellow_stained_glass_pane'); S(15, 4, 28, 'minecraft:chiseled_stone_bricks')
  F(14, 0, 29, 16, 0, 29, 'minecraft:stone_brick_stairs[facing=north,half=bottom,shape=straight]'); S(13, 0, 29, 'minecraft:stone_brick_wall'); S(17, 0, 29, 'minecraft:stone_brick_wall'); S(13, 1, 29, 'minecraft:lantern[hanging=false]'); S(17, 1, 29, 'minecraft:lantern[hanging=false]')
  F(15, 8, 28, 15, 9, 28, choix(VIT)); S(13, 8, 26, GP); S(17, 8, 26, GP); S(15, 14, 28, 'supplementaries:clock_block[facing=south]')
  ;[[15, 28], [15, 24], [13, 26], [17, 26]].forEach(c => F(c[0], 17, c[1], c[0], 19, c[1], AIR))
  S(15, 20, 26, 'minecraft:bell[attachment=ceiling,facing=south]')
  S(14, 7, 25, 'minecraft:note_block'); S(15, 7, 25, MAT('dark_oak_chair', 'south')); S(14, 7, 27, 'minecraft:barrel[facing=up,open=false]'); S(15, 11, 26, 'minecraft:lantern[hanging=true]'); S(15, 5, 26, 'minecraft:lantern[hanging=true]')
  // fleche
  for (var k = 0; k < 3; k++) {
    var a = 12 + k, b = 18 - k, c1 = 23 + k, d = 29 - k, y0 = 21 + 3 * k
    F(a, y0, c1, b, y0 + 2, d, DT); F(a, y0 + 2, d, b, y0 + 2, d, TOIT('north')); F(a, y0 + 2, c1, b, y0 + 2, c1, TOIT('south')); F(b, y0 + 2, c1 + 1, b, y0 + 2, d - 1, TOIT('west')); F(a, y0 + 2, c1 + 1, a, y0 + 2, d - 1, TOIT('east'))
  }
  F(15, 30, 26, 15, 32, 26, DT); F(15, 33, 26, 15, 35, 26, BGF); S(14, 34, 26, BGF); S(16, 34, 26, BGF)
  // cimetiere
  for (var x = 0; x <= 8; x++) { S(x, 0, 2, 'minecraft:cobblestone_wall'); S(x, 0, 23, 'minecraft:cobblestone_wall') }
  for (var z = 3; z <= 22; z++) { S(0, 0, z, 'minecraft:cobblestone_wall'); if (z != 19 && z != 20) S(8, 0, z, 'minecraft:cobblestone_wall') }
  S(8, 0, 19, 'minecraft:spruce_fence_gate[facing=east,open=true,in_wall=true]'); S(8, 0, 20, 'minecraft:spruce_fence_gate[facing=east,open=false,in_wall=true]')
  for (var gx = 2; gx <= 6; gx += 2) for (var gz = 4; gz <= 19; gz += 3) {
    if (gx == 4 && gz == 13) continue
    S(gx, 0, gz, choix(['minecraft:stone_brick_wall', 'minecraft:mossy_stone_brick_wall', 'minecraft:cobblestone_wall', 'minecraft:andesite_wall', 'minecraft:mossy_cobblestone_wall']))
    bgDalle(gx, gz + 1, gx, gz + 2, 'minecraft:coarse_dirt'); if (R() < 0.4) S(gx, 1, gz, 'minecraft:candle[candles=1,lit=false]'); else if (R() < 0.3) S(gx, 1, gz, BGF)
  }
  F(4, 0, 13, 4, 1, 13, 'minecraft:mossy_stone_bricks'); S(4, 2, 13, 'minecraft:stone_brick_wall'); bgDalle(4, 14, 4, 15, 'minecraft:mossy_cobblestone'); S(4, 1, 15, 'minecraft:potted_dead_bush')
  // jardin du presbytere : puits, banc, allees
  bgDalle(14, 30, 16, 31, 'minecraft:gravel'); bgDalle(9, 19, 9, 29, ['minecraft:gravel', 'minecraft:dirt_path']); bgDalle(10, 29, 13, 29, ['minecraft:gravel', 'minecraft:dirt_path']); bgDalle(26, 12, 26, 29, ['minecraft:dirt_path', 'minecraft:gravel', 'minecraft:dirt_path'])
  F(26, 0, 19, 28, 0, 21, 'minecraft:cobblestone'); S(27, 0, 20, 'minecraft:water'); F(26, 1, 20, 26, 2, 20, BGF); F(28, 1, 20, 28, 2, 20, BGF); F(26, 3, 20, 28, 3, 20, BGX); S(27, 2, 20, 'minecraft:chain[axis=y]')
  F(26, 4, 19, 28, 4, 21, 'minecraft:spruce_slab[type=bottom]'); bgBanc(28, 25, 'east', 2)
  bgLampe(12, 30); bgLampe(18, 30)
  bgLierre(19, 20, 1, 6, 'east'); bgLierre(22, 10, 1, 8, 'west'); bgLierre(14, 2, 1, 7, 'north')
  sapin(29, 4, 10); sapin(2, 27, 8); sapin(30, 30, 9); sapin(5, 9, 7)
  bgVeg(0, 0, 31, 31, 0.32)
}

// ================= PLACE DU VILLAGE (2 x 2 chunks : fontaine, kiosque, monument, halle, jeux) =================
function bgPlace() {
  BGT = {}
  var SB = 'minecraft:stone_bricks', LH = 'minecraft:lantern[hanging=true]'
  for (var x = 0; x <= 31; x++) for (var z = 0; z <= 31; z++) {
    var r = R(), b = (x == 0 || x == 31 || z == 0 || z == 31) ? SB : r < 0.5 ? 'minecraft:cobblestone' : r < 0.72 ? SB : r < 0.82 ? 'minecraft:mossy_cobblestone' : r < 0.88 ? 'minecraft:andesite' : r < 0.95 ? 'minecraft:coarse_dirt' : 'minecraft:moss_block'
    S(x, -1, z, b); if (/coarse|moss_block/.test(b)) BGT[x + ',' + z] = 1
  }
  for (var i = 0; i <= 31; i++) { if (i < 9 || i > 22) { S(i, -1, 15, 'minecraft:polished_andesite'); S(i, -1, 16, 'minecraft:polished_andesite'); S(15, -1, i, 'minecraft:polished_andesite'); S(16, -1, i, 'minecraft:polished_andesite'); delete BGT[i + ',15']; delete BGT[i + ',16']; delete BGT['15,' + i]; delete BGT['16,' + i] } }
  // fontaine : bassin a l'eau croupie, nenuphars, vasque a deux etages
  for (var x = 8; x <= 23; x++) for (var z = 8; z <= 23; z++) {
    var d = Math.sqrt((x - 15.5) * (x - 15.5) + (z - 15.5) * (z - 15.5)), k = x + ',' + z
    if (d < 4.6) { S(x, -1, z, 'minecraft:water'); delete BGT[k]; if (R() < 0.14) S(x, 0, z, 'minecraft:lily_pad') }
    else if (d < 5.7) { S(x, -1, z, SB); S(x, 0, z, R() < 0.25 ? 'minecraft:mossy_stone_bricks' : SB); delete BGT[k]; if (R() < 0.12) S(x, 1, z, 'minecraft:moss_carpet') }
    else if (d < 6.7) { S(x, -1, z, 'minecraft:polished_andesite'); delete BGT[k] }
  }
  F(15, -1, 15, 16, 1, 16, SB); F(15, 2, 15, 16, 2, 16, 'minecraft:chiseled_stone_bricks'); F(14, 3, 14, 17, 3, 17, 'minecraft:stone_brick_slab[type=bottom]'); F(15, 4, 15, 16, 4, 16, 'minecraft:stone_brick_wall'); F(15, 5, 15, 16, 5, 16, 'minecraft:stone_brick_slab[type=bottom]')
  bgBanc(14, 8, 'north', 4); bgBanc(14, 23, 'south', 4); bgBanc(8, 14, 'west', 4); bgBanc(23, 14, 'east', 4)
  ;[[10, 10], [21, 10], [10, 21], [21, 21]].forEach(p => { bgLampe(p[0], p[1]); delete BGT[p[0] + ',' + p[1]] })
  // kiosque a musique (centre 6,6)
  for (var x = 2; x <= 10; x++) for (var z = 2; z <= 10; z++) {
    var d = Math.sqrt((x - 6) * (x - 6) + (z - 6) * (z - 6))
    if (d <= 3.6) { S(x, 0, z, d > 2.8 ? SB : BGS); delete BGT[x + ',' + z] }
    if (d > 2.6 && d <= 3.6 && !(x == 6 && z == 9)) S(x, 1, z, BGF)
    if (d <= 4.4) S(x, 5, z, d > 3.4 ? 'minecraft:spruce_slab[type=bottom]' : 'minecraft:dark_oak_planks')
    if (d <= 3.4) S(x, 6, z, d > 2.2 ? 'minecraft:spruce_slab[type=bottom]' : 'minecraft:dark_oak_planks')
    if (d <= 2.2) S(x, 7, z, d > 1.2 ? 'minecraft:spruce_slab[type=bottom]' : 'minecraft:dark_oak_planks')
  }
  ;[[3, 5], [3, 7], [9, 5], [9, 7], [5, 3], [7, 3], [5, 9], [7, 9]].forEach(p => F(p[0], 1, p[1], p[0], 4, p[1], BGF))
  S(6, 8, 6, BGF); S(6, 9, 6, 'minecraft:lightning_rod'); S(6, 0, 10, 'minecraft:spruce_stairs[facing=north,half=bottom,shape=straight]')
  S(6, 1, 5, 'minecraft:jukebox'); S(5, 1, 6, MAT('spruce_chair', 'south')); S(7, 1, 6, MAT('spruce_chair', 'south')); S(4, 1, 5, 'minecraft:note_block'); S(8, 1, 5, 'minecraft:lectern[facing=south]'); S(6, 4, 6, LH); S(5, 1, 8, 'minecraft:spruce_leaves[persistent=true]')
  // monument aux morts (centre 25,6)
  F(23, 0, 4, 27, 0, 8, 'minecraft:polished_andesite'); F(24, 1, 5, 26, 1, 7, SB); F(25, 2, 6, 25, 6, 6, SB); S(25, 4, 6, 'minecraft:chiseled_stone_bricks'); S(25, 7, 6, 'minecraft:stone_brick_wall'); S(25, 8, 6, 'minecraft:lantern[hanging=false]')
  S(24, 2, 7, 'minecraft:potted_poppy'); S(26, 2, 7, 'minecraft:candle[candles=3,lit=false]'); S(24, 2, 5, 'minecraft:candle[candles=1,lit=false]'); S(25, 4, 7, 'minecraft:red_wall_banner[facing=south]')
  ;[[22, 3], [25, 3], [28, 3], [22, 6], [28, 6], [22, 9], [25, 9], [28, 9]].forEach(p => S(p[0], 0, p[1], 'minecraft:stone_brick_wall'))
  ;[3, 9].forEach(z => { F(23, 0, z, 24, 0, z, 'minecraft:chain[axis=x]'); F(26, 0, z, 27, 0, z, 'minecraft:chain[axis=x]') }); ;[22, 28].forEach(x => { F(x, 0, 4, x, 0, 5, 'minecraft:chain[axis=z]'); F(x, 0, 7, x, 0, 8, 'minecraft:chain[axis=z]') })
  for (var x = 21; x <= 29; x++) for (var z = 2; z <= 10; z++) delete BGT[x + ',' + z]
  // halle couverte x18..30 z21..29
  bgDalle(18, 21, 30, 29, ['minecraft:stone_bricks', 'minecraft:polished_andesite', 'minecraft:cobblestone'])
  ;[18, 22, 26, 30].forEach(x => [21, 25, 29].forEach(z => F(x, 0, z, x, 5, z, BGL)))
  ;[21, 25, 29].forEach(z => F(18, 6, z, 30, 6, z, BGX)); ;[18, 22, 26, 30].forEach(x => { F(x, 6, 22, x, 6, 24, BGZ); F(x, 6, 26, x, 6, 28, BGZ) })
  bgToitX(17, 31, 21, 29, 6, 'spruce', [])
  var biens = ['farmersdelight:carrot_crate', 'farmersdelight:potato_crate', 'farmersdelight:beetroot_crate', 'minecraft:barrel[facing=up,open=false]', 'minecraft:hay_block[axis=y]', 'minecraft:pumpkin', 'minecraft:melon', 'supplementaries:sack', 'minecraft:decorated_pot', 'minecraft:air']
  ;[23, 27].forEach(z => [[19, 21], [23, 25], [27, 29]].forEach(p => { F(p[0], 0, z, p[1], 0, z, MAT('spruce_counter', 'north')); for (var x = p[0]; x <= p[1]; x++) if (R() < 0.6) S(x, 1, z, choix(biens)) }))
  ;[20, 24, 28].forEach(x => S(x, 5, 25, LH)); S(25, 0, 26, 'supplementaries:sack'); S(21, 0, 28, 'minecraft:barrel[facing=east,open=true]'); S(29, 0, 22, 'minecraft:composter[level=0]')
  // aire de jeux x1..12 z19..31
  F(0, 0, 19, 12, 0, 19, BGF); F(12, 0, 20, 12, 0, 31, BGF); S(6, 0, 19, AIR); S(12, 0, 25, AIR)
  for (var x = 1; x <= 11; x++) for (var z = 20; z <= 31; z++) { var b = choix(['minecraft:coarse_dirt', 'minecraft:gravel', 'minecraft:coarse_dirt']); bgDalle(x, z, x, z, b); if (b == 'minecraft:coarse_dirt' && R() < 0.6) BGT[x + ',' + z] = 1 }
  F(2, 0, 21, 2, 2, 21, BGS); F(1, 0, 21, 1, 2, 21, 'minecraft:ladder[facing=west]'); S(2, 3, 21, 'minecraft:spruce_slab[type=bottom]')
  S(3, 2, 21, 'minecraft:smooth_quartz_stairs[facing=west,half=bottom,shape=straight]'); S(4, 1, 21, 'minecraft:smooth_quartz_stairs[facing=west,half=bottom,shape=straight]'); S(5, 0, 21, 'minecraft:smooth_quartz_stairs[facing=west,half=bottom,shape=straight]'); F(3, 0, 21, 3, 1, 21, BGF); S(4, 0, 21, BGF)
  F(6, 0, 25, 6, 3, 25, BGF); F(10, 0, 25, 10, 3, 25, BGF); F(6, 4, 25, 10, 4, 25, BGX); F(7, 2, 25, 7, 3, 25, 'minecraft:chain[axis=y]'); S(7, 1, 25, 'minecraft:spruce_slab[type=top]'); S(9, 3, 25, 'minecraft:chain[axis=y]')
  for (var x = 2; x <= 6; x++) for (var z = 26; z <= 30; z++) { if (x == 2 || x == 6 || z == 26 || z == 30) S(x, 0, z, 'minecraft:spruce_slab[type=bottom]'); else bgDalle(x, z, x, z, 'minecraft:sand') }
  bgBanc(9, 30, 'south', 2); S(11, 0, 22, 'minecraft:cauldron')
  // ombrages et vegetation
  sapin(2, 14, 9); sapin(13, 2, 8); sapin(29, 14, 10); sapin(14, 28, 7)
  for (var i = 0; i < 26; i++) SA(Math.floor(R() * 32), 0, Math.floor(R() * 32), choix(['minecraft:spruce_leaves[persistent=true]', 'minecraft:white_carpet', 'minecraft:moss_carpet', 'minecraft:spruce_leaves[persistent=true]']))
  bgVeg(0, 0, 31, 31, 0.55)
}

// ================= RUE PRINCIPALE (z32..47) : chaussee, trottoirs, voitures, abribus, barrage =================
function bgRue() {
  OX = VB.X0; OY = VB.Y0; OZ = VB.Z0; CUT = 999; GRAINE = 707; BGT = {}
  for (var x = -16; x <= 143; x++) {
    for (var z = 32; z <= 47; z++) {
      var r = R(), b
      if (z <= 34 || z >= 45) b = (z == 34 || z == 45) ? 'minecraft:smooth_stone' : r < 0.6 ? 'minecraft:stone_bricks' : r < 0.75 ? 'minecraft:cracked_stone_bricks' : r < 0.85 ? 'minecraft:mossy_stone_bricks' : r < 0.95 ? 'minecraft:polished_andesite' : 'minecraft:coarse_dirt'
      else b = z == 40 && x % 4 < 2 && r > 0.2 ? 'minecraft:white_concrete' : r < 0.82 ? 'minecraft:gray_concrete' : r < 0.88 ? 'minecraft:andesite' : r < 0.92 ? 'minecraft:cobblestone' : r < 0.97 ? 'minecraft:coarse_dirt' : 'minecraft:gravel'
      if (x >= 54 && x <= 61 && z >= 35 && z <= 44) b = x % 2 ? 'minecraft:gray_concrete' : 'minecraft:white_concrete'
      S(x, -1, z, b); if (b == 'minecraft:coarse_dirt') BGT[x + ',' + z] = 1
    }
  }
  ;[[20, 38], [71, 42], [118, 37]].forEach(p => { S(p[0], -1, p[1], 'minecraft:water'); delete BGT[p[0] + ',' + p[1]] })
  // reverberes (bras vers la chaussee)
  function rev(x, z, f, eteint) { var d = { north: -1, south: 1 }[f]; S(x, 0, z, 'minecraft:stone_brick_wall'); F(x, 1, z, x, 4, z, BGF); S(x, 4, z + d, BGF); if (!eteint) S(x, 3, z + d, 'minecraft:lantern[hanging=true]') }
  ;[6, 38, 70, 102, 134].forEach((x, i) => rev(x, 33, 'south', i == 2)); ;[22, 54, 86, 118].forEach((x, i) => rev(x, 46, 'north', i == 3))
  // vehicules abandonnes
  bgVoiture(9, 36, 'x', 'red', 0); bgVoiture(26, 42, 'x', 'blue', 1); bgVoiture(64, 37, 'x', 'white', 2); bgVoiture(79, 36, 'x', 'green', 0); bgVoiture(96, 41, 'x', 'black', 2); bgVoiture(108, 36, 'x', 'light_gray', 1); bgVoiture(130, 42, 'x', 'brown', 0)
  // car de ramassage scolaire devant l'ecole
  for (var u = 0; u <= 8; u++) for (var v = 0; v <= 1; v++) { S(36 + u, 0, 42 + v, 'minecraft:yellow_concrete'); S(36 + u, 1, 42 + v, u == 0 || u == 8 ? 'minecraft:yellow_concrete' : (u == 4 && v == 1 ? 'minecraft:gray_stained_glass' : 'minecraft:light_gray_stained_glass')); S(36 + u, 2, 42 + v, 'minecraft:yellow_concrete') }
  F(36, 3, 42, 44, 3, 43, 'minecraft:yellow_carpet'); ;[1, 7].forEach(u => { S(36 + u, 0, 41, 'minecraft:polished_blackstone_button[face=wall,facing=north]'); S(36 + u, 0, 44, 'minecraft:polished_blackstone_button[face=wall,facing=south]') })
  // abribus devant l'ecole
  F(57, 0, 47, 61, 2, 47, GP); F(56, 0, 46, 56, 2, 47, 'minecraft:iron_bars'); F(62, 0, 46, 62, 2, 47, 'minecraft:iron_bars'); F(56, 3, 46, 62, 3, 47, 'minecraft:smooth_stone_slab[type=bottom]')
  for (var x = 58; x <= 60; x++) S(x, 0, 46, 'minecraft:spruce_stairs[facing=south,half=bottom,shape=straight]')
  // arbre tombe en travers de la chaussee (ouest)
  F(1, 0, 39, 11, 0, 39, 'minecraft:spruce_log[axis=x]'); S(12, 0, 39, 'minecraft:rooted_dirt')
  for (var x = -3; x <= 1; x++) for (var z = 37; z <= 41; z++) for (var y = 0; y <= 1; y++) if (Math.abs(z - 39) + Math.abs(x + 1) + y < 4 && R() < 0.85) SA(x, y, z, 'minecraft:spruce_leaves[persistent=true]')
  // barrage d'evacuation (est) : sacs de sable, barrieres, cones
  F(124, 0, 35, 124, 0, 39, 'supplementaries:sack'); F(124, 1, 35, 124, 1, 37, 'supplementaries:sack'); F(125, 0, 41, 125, 0, 44, BGF); S(123, 0, 40, 'minecraft:orange_terracotta'); S(123, 0, 43, 'minecraft:orange_terracotta')
  S(125, 1, 41, 'minecraft:lantern[hanging=false]')
  // mobilier : poubelles, sacs, papiers, feuilles
  ;[[17, 33], [49, 33], [89, 33], [31, 46], [73, 46], [113, 46]].forEach(p => S(p[0], 0, p[1], choix(['minecraft:composter[level=0]', 'minecraft:cauldron', 'minecraft:barrel[facing=up,open=false]'])))
  for (var i = 0; i < 60; i++) SA(-10 + Math.floor(R() * 148), 0, 32 + Math.floor(R() * 16), choix(['minecraft:white_carpet', 'minecraft:spruce_leaves[persistent=true]', 'minecraft:moss_carpet', 'supplementaries:sack', 'minecraft:spruce_leaves[persistent=true]']))
  bgVeg(-16, 32, 143, 47, 0.8)
}


// ================= BOURG FORESTIER : MAISONS, COMMERCES, ECOLE, AUBERGE, SCIERIE =================
function bgCrop() { return choix(['minecraft:carrots[age=7]', 'minecraft:potatoes[age=7]', 'minecraft:wheat[age=7]', 'minecraft:beetroots[age=3]', 'minecraft:wheat[age=5]']) }
function bgParasol(x, z, col) {
  F(x, 0, z, x, 2, z, BGF); F(x - 1, 3, z - 1, x + 1, 3, z + 1, 'minecraft:' + col + '_wool'); ;[[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(c => S(x + c[0], 3, z + c[1], AIR)); S(x, 4, z, 'minecraft:' + col + '_carpet')
  S(x + 1, 0, z, 'mcwfurnitures:spruce_table'); S(x + 2, 0, z, MAT('spruce_chair', 'west')); S(x - 1, 0, z, 'mcwfurnitures:spruce_table'); if (R() < 0.6) S(x - 2, 0, z, MAT('spruce_chair', 'east'))
}

// ================= DEUX MAISONS (maison de bucheron en rondins, maison a etage avec garage) =================
function bgMaisons() {
  BGT = {}
  var SL = 'minecraft:spruce_log', LH = 'minecraft:lantern[hanging=true]', ST = 'minecraft:spruce_stairs'
  bgSol(0, 0, 31, 31)
  // ---- maison de bucheron x2..12 z12..22 : rondins croises, cheminee de pierre, porche ----
  F(2, 0, 12, 12, 0, 22, 'minecraft:cobblestone'); F(3, 0, 13, 11, 0, 21, BGS)
  for (var y = 1; y <= 8; y++) {
    for (var x = 3; x <= 11; x++) { S(x, y, 12, SL + '[axis=x]'); S(x, y, 22, SL + '[axis=x]') }
    for (var z = 13; z <= 21; z++) { S(2, y, z, SL + '[axis=z]'); S(12, y, z, SL + '[axis=z]') }
    ;[[2, 12], [12, 12], [2, 22], [12, 22]].forEach(c => S(c[0], y, c[1], BGL))
    if (y % 2) { S(1, y, 12, SL + '[axis=x]'); S(13, y, 12, SL + '[axis=x]'); S(1, y, 22, SL + '[axis=x]'); S(13, y, 22, SL + '[axis=x]') }
    else { S(2, y, 11, SL + '[axis=z]'); S(12, y, 11, SL + '[axis=z]'); S(2, y, 23, SL + '[axis=z]'); S(12, y, 23, SL + '[axis=z]') }
  }
  F(3, 6, 13, 11, 6, 21, BGS); F(2, 9, 12, 12, 9, 12, BGX); F(2, 9, 22, 12, 9, 22, BGX); F(2, 9, 13, 2, 9, 21, BGZ); F(12, 9, 13, 12, 9, 21, BGZ)
  bgToitZ(11, 23, 2, 12, 9, 'spruce', [12, 22])
  for (var x = 3; x <= 11; x++) for (var y = 7; y < Math.min(8 + x, 22 - x); y++) S(x, y, 15, BGS)
  // cheminee et foyer
  F(2, 1, 16, 2, 8, 18, 'minecraft:cobblestone'); F(0, 0, 16, 1, 16, 18, 'minecraft:cobblestone'); F(0, 17, 17, 1, 17, 17, 'minecraft:cobblestone_wall')
  F(3, 1, 16, 3, 2, 16, 'minecraft:cobblestone'); F(3, 1, 18, 3, 2, 18, 'minecraft:cobblestone'); S(3, 1, 17, 'minecraft:campfire[lit=false,facing=east]'); F(3, 3, 16, 3, 3, 18, 'minecraft:stone_brick_slab[type=top]')
  S(3, 4, 17, 'minecraft:candle[candles=2,lit=false]'); S(3, 4, 16, 'minecraft:potted_fern')
  // sejour, cuisine, coin repas
  F(4, 1, 15, 4, 1, 19, 'minecraft:brown_carpet'); S(5, 1, 16, 'minecraft:brown_carpet'); S(5, 1, 18, 'minecraft:brown_carpet'); S(5, 1, 17, 'mcwfurnitures:spruce_coffee_table'); S(4, 1, 15, MAT('spruce_chair', 'east'))
  F(6, 1, 16, 6, 1, 18, 'mcwfurnitures:brown_couch[facing=west,shape=single]')
  S(11, 1, 14, MAT('spruce_counter', 'west')); S(11, 1, 15, MAT('spruce_counter', 'west')); S(11, 1, 16, 'mcwfurnitures:spruce_kitchen_sink[facing=west,water=false]'); S(11, 1, 17, 'farmersdelight:stove[facing=west,lit=false]'); S(11, 1, 18, MAT('spruce_counter', 'west'))
  S(11, 2, 17, 'farmersdelight:cooking_pot'); S(11, 2, 14, 'farmersdelight:cutting_board[facing=west]'); S(11, 2, 15, 'supplementaries:jar')
  S(11, 3, 14, 'mcwfurnitures:spruce_kitchen_cabinet[facing=west,hinge=left]'); S(11, 3, 15, 'mcwfurnitures:spruce_kitchen_cabinet[facing=west,hinge=right]'); S(11, 3, 18, 'mcwfurnitures:spruce_kitchen_cabinet[facing=west,hinge=left]')
  S(8, 1, 20, 'mcwfurnitures:spruce_table'); S(9, 1, 20, 'mcwfurnitures:spruce_table'); S(8, 1, 21, MAT('spruce_chair', 'north')); S(9, 1, 21, MAT('spruce_chair', 'north')); S(7, 1, 20, MAT('spruce_chair', 'east')); S(10, 1, 20, MAT('spruce_chair', 'west'))
  S(8, 2, 20, 'minecraft:candle[candles=3,lit=false]'); S(9, 2, 20, 'minecraft:potted_dead_bush'); S(8, 5, 20, 'mcwlights:iron_chandelier'); S(5, 5, 17, LH); S(9, 5, 16, LH)
  for (var k = 0; k <= 5; k++) { S(4 + k, 1 + k, 13, ST + '[facing=east,half=bottom,shape=straight]'); if (k > 0) F(4 + k, 1, 13, 4 + k, k, 13, BGS) }
  F(6, 6, 13, 8, 6, 13, AIR); F(6, 7, 14, 8, 7, 14, BGF)
  PORTE(6, 1, 22, BGP, 'south', 'left', 'false')
  // etage sous combles : chambre, palier-bureau
  PORTE(10, 7, 15, BGP, 'south', 'left', 'false')
  LIT(6, 7, 17, 'red', 'north'); LIT(7, 7, 17, 'red', 'north'); S(5, 7, 16, 'mcwfurnitures:spruce_end_table'); S(5, 8, 16, 'minecraft:candle[candles=1,lit=false]'); S(8, 7, 16, 'mcwfurnitures:spruce_end_table'); S(8, 8, 16, 'supplementaries:book_pile')
  S(3, 7, 19, 'mcwfurnitures:spruce_wardrobe[facing=east,connection=base,hinge=left]'); S(6, 7, 18, 'minecraft:chest[facing=south]'); F(5, 7, 19, 8, 7, 20, 'minecraft:white_carpet'); S(7, 14, 18, 'minecraft:chain[axis=y]'); S(7, 13, 18, LH)
  S(11, 7, 21, 'minecraft:barrel[facing=up,open=false]'); S(3, 7, 21, 'minecraft:potted_fern')
  S(4, 7, 14, 'mcwfurnitures:spruce_table'); S(4, 7, 13, MAT('spruce_chair', 'south')); S(4, 8, 14, 'supplementaries:book_pile'); F(3, 7, 13, 3, 8, 13, 'minecraft:bookshelf'); S(11, 7, 13, 'minecraft:chest[facing=west]'); S(9, 12, 14, LH)
  // fenetres
  bgFen(3, 4, 2, 22, 'south', 2, 0); bgFen(8, 9, 2, 22, 'south', 2, 1); bgFen(14, 14, 2, 2, 'west', 2, 0); bgFen(20, 20, 2, 2, 'west', 2, 0); bgFen(16, 16, 2, 12, 'east', 2, 3); bgFen(10, 10, 2, 12, 'north', 2, 0)
  bgFen(18, 18, 7, 2, 'west', 2, 0); bgFen(18, 18, 7, 12, 'east', 2, 1); bgFen(7, 7, 10, 12, 'north', 2, 0); bgFen(6, 8, 10, 22, 'south', 2, 0)
  // porche
  F(1, 0, 23, 13, 0, 25, BGS); ;[1, 5, 9, 13].forEach(x => F(x, 1, 25, x, 4, 25, BGL)); for (var x = 2; x <= 12; x++) if (x != 5 && x != 9 && x != 6 && x != 7) S(x, 1, 25, BGF)
  S(6, 0, 26, ST + '[facing=north,half=bottom,shape=straight]'); S(7, 0, 26, ST + '[facing=north,half=bottom,shape=straight]'); F(1, 5, 23, 13, 5, 25, 'minecraft:spruce_slab[type=bottom]'); S(7, 4, 24, LH)
  S(3, 1, 23, MAT('spruce_chair', 'south')); S(4, 1, 23, MAT('spruce_chair', 'south')); S(10, 1, 23, 'mcwfurnitures:spruce_end_table'); S(10, 2, 23, 'minecraft:candle[candles=1,lit=false]'); S(11, 1, 23, MAT('spruce_chair', 'south'))
  F(1, 1, 23, 1, 2, 24, SL + '[axis=z]')
  // bucher (appentis est), potager, cabane au fond du jardin
  F(15, 0, 14, 15, 3, 14, BGL); F(15, 0, 20, 15, 3, 20, BGL); F(13, 4, 13, 15, 4, 21, 'minecraft:spruce_slab[type=bottom]')
  for (var z = 15; z <= 19; z++) for (var y = 0; y <= 2; y++) for (var x = 13; x <= 14; x++) S(x, y, z, SL + '[axis=x]')
  S(15, 0, 23, SL + '[axis=y]')
  W(3, 3, 11, 9, 0, 0, BGF); S(7, 0, 9, 'minecraft:spruce_fence_gate[facing=south,open=false,in_wall=false]')
  for (var x = 4; x <= 10; x++) for (var z = 4; z <= 8; z++) {
    if (x == 7 && z == 6) { bgDalle(x, z, x, z, 'minecraft:water'); continue }
    if (R() < 0.3) { bgDalle(x, z, x, z, 'minecraft:coarse_dirt'); BGT[x + ',' + z] = 1 } else { bgDalle(x, z, x, z, 'minecraft:farmland[moisture=7]'); S(x, 0, z, bgCrop()) }
  }
  W(1, 1, 3, 3, 0, 2, BGS); bgDalle(2, 2, 2, 2, BGS); PORTE(2, 0, 3, 'minecraft:spruce_door', 'south', 'left', 'false'); S(2, 0, 2, 'minecraft:spruce_trapdoor[facing=north,half=top,open=false]'); S(2, 2, 2, LH); F(0, 3, 0, 4, 3, 4, 'minecraft:spruce_slab[type=bottom]')
  // ---- maison a etage x18..27 z11..21, garage x28..31 ----
  bgCoque(18, 11, 27, 21, 2, true)
  F(23, 1, 12, 23, 5, 20, 'minecraft:stone_bricks'); F(19, 1, 16, 22, 5, 16, 'minecraft:stone_bricks')
  var c = cadre(19, 12, 22, 15, 'west', 0); piece(c, 'cuisine', 1); c.porte(BGP)
  F(19, 1, 17, 22, 2, 17, 'minecraft:bookshelf'); F(20, 1, 18, 21, 1, 20, 'minecraft:green_carpet'); F(19, 1, 18, 19, 1, 19, 'mcwfurnitures:gray_couch[facing=east,shape=single]'); S(20, 1, 19, 'mcwfurnitures:spruce_coffee_table')
  S(22, 1, 18, MAT('spruce_chair', 'west')); S(22, 1, 20, MAT('spruce_drawer', 'west')); S(22, 2, 20, 'minecraft:black_stained_glass_pane'); S(19, 1, 20, 'minecraft:potted_fern'); S(20, 5, 19, 'mcwlights:iron_chandelier')
  PORTE(23, 1, 20, BGP, 'east', 'left', 'false')
  for (var k = 0; k <= 5; k++) { S(25, 1 + k, 20 - k, ST + '[facing=north,half=bottom,shape=straight]'); if (k > 0) F(25, 1, 20 - k, 25, k, 20 - k, BGS) }
  F(25, 6, 16, 25, 6, 18, AIR); F(24, 7, 16, 24, 7, 18, BGF); F(26, 7, 16, 26, 7, 18, BGF)
  PORTE(24, 1, 21, BGP, 'south', 'left', 'false'); S(26, 1, 19, MAT('spruce_drawer', 'west')); S(26, 1, 20, 'minecraft:potted_fern'); S(24, 1, 12, 'minecraft:decorated_pot'); S(26, 1, 12, 'minecraft:chest[facing=west]'); S(26, 1, 13, 'minecraft:barrel[facing=up,open=false]'); S(24, 5, 17, LH); S(24, 5, 13, LH)
  F(23, 7, 12, 23, 11, 20, BGS); F(19, 7, 16, 22, 11, 16, BGS)
  c = cadre(19, 17, 22, 20, 'west', 6); piece(c, 'chambre', 0); c.porte(BGP)
  c = cadre(19, 12, 22, 15, 'west', 6); piece(c, 'sdb', 1); c.porte(BGP)
  F(24, 7, 12, 26, 8, 12, 'minecraft:bookshelf'); S(24, 7, 14, MAT('spruce_chair', 'east')); S(26, 7, 20, 'minecraft:potted_azalea_bush'); S(25, 11, 13, LH); S(25, 11, 19, LH)
  bgToitX(17, 28, 11, 21, 12, 'brown_terracotta', [18, 27])
  bgFen(20, 21, 2, 21, 'south', 2, 3); bgFen(26, 26, 2, 21, 'south', 2, 3); bgFen(13, 14, 2, 18, 'west', 2, 3); bgFen(18, 19, 2, 18, 'west', 2, 2); bgFen(20, 21, 2, 11, 'north', 2, 3)
  bgFen(20, 21, 8, 21, 'south', 2, 0); bgFen(24, 25, 8, 21, 'south', 2, 1); bgFen(20, 21, 8, 11, 'north', 2, 0); bgFen(24, 25, 8, 11, 'north', 2, 0); bgFen(13, 14, 8, 18, 'west', 2, 0); bgFen(17, 18, 8, 18, 'west', 2, 0)
  bgFen(13, 14, 8, 27, 'east', 2, 0); bgFen(17, 18, 8, 27, 'east', 2, 2); bgFen(15, 16, 14, 18, 'west', 2, 3); bgFen(15, 16, 14, 27, 'east', 2, 3)
  F(23, 4, 22, 25, 4, 23, 'minecraft:spruce_slab[type=bottom]'); S(24, 0, 22, 'minecraft:stone_brick_stairs[facing=north,half=bottom,shape=straight]'); S(24, 3, 23, LH)
  bgDalle(28, 14, 30, 20, 'minecraft:smooth_stone'); F(31, 0, 13, 31, 4, 21, BGS); F(28, 0, 13, 30, 4, 13, BGS); F(31, 0, 21, 31, 4, 21, BGL); F(28, 4, 21, 30, 4, 21, BGX); F(28, 3, 21, 30, 3, 21, 'minecraft:spruce_trapdoor[facing=north,half=top,open=false]')
  F(28, 5, 12, 31, 5, 22, 'minecraft:spruce_slab[type=bottom]'); bgVoiture(29, 15, 'z', 'blue', 0, true)
  S(28, 0, 14, 'minecraft:crafting_table'); S(28, 0, 15, 'minecraft:barrel[facing=up,open=false]'); S(28, 0, 16, 'minecraft:smithing_table'); S(28, 0, 17, 'minecraft:chest[facing=east]'); S(28, 0, 19, 'minecraft:anvil[facing=east]'); S(30, 0, 14, 'supplementaries:sack'); S(29, 4, 17, LH)
  bgDalle(28, 22, 30, 31, ['minecraft:gravel', 'minecraft:coarse_dirt', 'minecraft:gravel']); bgVoiture(29, 24, 'z', 'red', 1)
  bgDalle(24, 23, 24, 31, ['minecraft:gravel', 'minecraft:dirt_path']); S(23, 0, 30, BGF); S(23, 1, 30, 'minecraft:barrel[facing=south,open=false]')
  // sauna au fond du jardin, bucher
  W(20, 2, 24, 6, 0, 3, 'minecraft:stripped_spruce_log[axis=y]'); bgDalle(21, 3, 23, 5, BGS); PORTE(22, 0, 6, 'minecraft:spruce_door', 'south', 'left', 'false'); F(19, 4, 1, 25, 4, 7, 'minecraft:spruce_slab[type=bottom]')
  F(21, 0, 3, 23, 0, 3, ST + '[facing=north,half=bottom,shape=straight]'); S(23, 0, 5, 'minecraft:smoker[facing=west,lit=false]'); S(23, 1, 5, 'minecraft:cobblestone_slab[type=bottom]'); S(21, 0, 5, 'minecraft:water_cauldron[level=1]'); S(22, 3, 4, LH); S(20, 1, 4, GP)
  F(25, 0, 2, 25, 1, 5, SL + '[axis=z]')
  for (var z = 1; z <= 30; z++) if (z % 7) S(16, 0, z, BGF)
  bgLierre(19, 2, 1, 6, 'west'); bgLierre(15, 31, 1, 4, 'east')
  sapin(29, 3, 10); sapin(14, 2, 8); sapin(1, 30, 8); sapin(19, 29, 7); sapin(31, 8, 8)
  bgVeg(0, 0, 31, 31, 0.32)
}

// ================= RANGEE DE COMMERCES : EPICERIE, BOULANGERIE, CAFE (logements a l'etage) =================
// Etage d'habitation commun aux trois boutiques (o = decalage en x) : sejour sur rue, cuisine et chambre sur cour
function bgEtage(o, cp, lit, fenAv) {
  var y = 6, LH = 'minecraft:lantern[hanging=true]'
  F(o + 2, y + 1, 8, o + 9, y + 5, 8, BGS); F(o + 6, y + 1, 9, o + 6, y + 5, 13, BGS)
  PORTE(o + 4, y + 1, 8, BGP, 'north', 'left', 'false'); PORTE(o + 8, y + 1, 8, BGP, 'north', 'right', 'false')
  // sejour
  for (var x = o + 3; x <= o + 5; x++) S(x, y + 1, 6, 'mcwfurnitures:' + cp + '_couch[facing=north,shape=single]')
  S(o + 3, y + 1, 5, 'minecraft:brown_carpet'); S(o + 4, y + 1, 5, 'mcwfurnitures:spruce_coffee_table'); S(o + 5, y + 1, 5, 'minecraft:brown_carpet'); S(o + 4, y + 2, 5, 'supplementaries:book_pile')
  S(o + 7, y + 1, 5, 'mcwfurnitures:oak_table'); S(o + 8, y + 1, 5, 'mcwfurnitures:oak_table'); S(o + 7, y + 1, 6, MAT('oak_chair', 'north')); S(o + 8, y + 1, 6, MAT('oak_chair', 'north')); S(o + 7, y + 1, 4, MAT('oak_chair', 'south'))
  S(o + 7, y + 2, 5, 'minecraft:candle[candles=2,lit=false]'); S(o + 9, y + 1, 7, 'minecraft:note_block'); S(o + 2, y + 1, 7, 'minecraft:bookshelf'); S(o + 2, y + 2, 7, 'minecraft:potted_fern'); S(o + 5, y + 5, 5, 'mcwlights:iron_chandelier')
  // cuisine
  S(o + 2, y + 1, 9, MAT('spruce_counter', 'east')); S(o + 2, y + 1, 10, MAT('spruce_counter', 'east')); S(o + 2, y + 1, 11, 'mcwfurnitures:spruce_kitchen_sink[facing=east,water=false]'); S(o + 2, y + 1, 12, 'farmersdelight:stove[facing=east,lit=false]'); S(o + 2, y + 2, 12, 'farmersdelight:cooking_pot')
  ;[9, 10, 11].forEach((z, i) => S(o + 2, y + 3, z, 'mcwfurnitures:spruce_kitchen_cabinet[facing=east,hinge=' + (i % 2 ? 'right' : 'left') + ']')); S(o + 2, y + 2, 9, 'farmersdelight:cutting_board[facing=east]')
  S(o + 5, y + 1, 11, 'mcwfurnitures:spruce_table'); S(o + 5, y + 1, 12, MAT('spruce_chair', 'north')); S(o + 5, y + 1, 10, MAT('spruce_chair', 'south')); S(o + 5, y + 1, 13, 'minecraft:white_concrete'); S(o + 5, y + 2, 13, 'minecraft:white_concrete'); S(o + 3, y + 5, 11, LH)
  // chambre
  LIT(o + 7, y + 1, 12, lit, 'south'); S(o + 8, y + 1, 13, 'mcwfurnitures:spruce_end_table'); S(o + 8, y + 2, 13, 'minecraft:candle[candles=1,lit=false]'); S(o + 9, y + 1, 9, 'mcwfurnitures:spruce_wardrobe[facing=west,connection=base,hinge=left]')
  S(o + 9, y + 1, 13, 'minecraft:chest[facing=west]'); S(o + 8, y + 1, 11, 'minecraft:' + lit + '_carpet'); S(o + 9, y + 1, 11, 'minecraft:' + lit + '_carpet'); S(o + 8, y + 5, 11, LH)
  bgPapiers(o + 2, 4, o + 9, 13, y + 1, 3)
  // ouvertures : fenetres sur rue et sur cour, porte de service et escalier exterieur
  fenAv.forEach(p => bgFen(p[0], p[1], y + 2, 3, 'north', 2, p[2]))
  bgFen(o + 3, o + 3, y + 2, 14, 'south', 2, 0); bgFen(o + 8, o + 8, y + 2, 14, 'south', 2, 0)
  PORTE(o + 4, y + 1, 14, BGP, 'south', 'left', 'false'); S(o + 4, y, 15, BGS); S(o + 3, y + 1, 15, BGF); S(o + 5, y + 1, 15, BGF)
  for (var k = 0; k <= 5; k++) { S(o + 4, k, 21 - k, 'minecraft:spruce_stairs[facing=north,half=bottom,shape=straight]'); if (k > 0) F(o + 4, 0, 21 - k, o + 4, k - 1, 21 - k, BGF) }
}
function bgCommerces() {
  BGT = {}
  var SB = 'minecraft:stone_bricks', LH = 'minecraft:lantern[hanging=true]', DO = 'minecraft:dark_oak_planks'
  bgSol(0, 0, 31, 31)
  bgDalle(0, 0, 31, 2, [SB, 'minecraft:polished_andesite', SB, 'minecraft:cracked_stone_bricks'])
  bgDalle(0, 29, 31, 31, ['minecraft:gravel', 'minecraft:gravel', 'minecraft:coarse_dirt'])
  // ---- epicerie x1..10 ----
  bgCoque(1, 3, 10, 14, 2, false); W(1, 3, 10, 14, 0, 0, SB)
  F(1, 1, 3, 10, 5, 3, DO); F(2, 2, 3, 4, 4, 3, GP); F(7, 2, 3, 9, 4, 3, GP); PORTE(5, 1, 3, BGV, 'north', 'left', 'false'); PORTE(6, 1, 3, BGV, 'north', 'right', 'false'); F(5, 3, 3, 6, 4, 3, GP)
  F(1, 5, 2, 10, 5, 2, 'supplementaries:awning_green[facing=north]'); F(5, 0, 2, 6, 0, 2, 'minecraft:stone_brick_stairs[facing=south,half=bottom,shape=straight]')
  for (var x = 2; x <= 9; x++) for (var z = 4; z <= 13; z++) S(x, 0, z, (x + z) % 2 ? 'minecraft:white_terracotta' : 'minecraft:gray_terracotta')
  S(8, 1, 5, MAT('spruce_counter', 'west')); S(8, 1, 6, MAT('spruce_counter', 'west')); S(8, 2, 5, 'supplementaries:jar'); S(8, 2, 6, 'minecraft:candle[candles=1,lit=false]'); S(9, 1, 6, 'mcwfurnitures:spruce_stool_chair')
  F(2, 1, 7, 2, 2, 12, 'minecraft:chiseled_bookshelf[facing=east]'); F(5, 1, 7, 5, 2, 11, 'minecraft:chiseled_bookshelf[facing=west]'); F(6, 1, 7, 6, 2, 11, 'minecraft:chiseled_bookshelf[facing=east]'); F(9, 1, 8, 9, 2, 12, 'minecraft:chiseled_bookshelf[facing=west]')
  for (var x = 2; x <= 8; x++) S(x, 1, 13, choix(['farmersdelight:carrot_crate', 'farmersdelight:potato_crate', 'farmersdelight:beetroot_crate', 'minecraft:barrel[facing=up,open=false]', 'supplementaries:sack', AIR]))
  F(2, 1, 4, 2, 2, 5, 'minecraft:white_concrete'); S(4, 1, 10, 'minecraft:barrel[facing=up,open=true]'); S(7, 1, 9, 'supplementaries:sack'); bgPapiers(2, 4, 9, 12, 1, 6)
  S(4, 5, 9, LH); S(7, 5, 9, LH); S(5, 5, 5, LH)
  S(8, 0, 1, 'farmersdelight:carrot_crate'); S(9, 0, 1, 'minecraft:barrel[facing=up,open=false]'); S(2, 0, 1, 'minecraft:barrel[facing=up,open=true]')
  bgEtage(0, 'green', 'blue', [[3, 4, 0], [7, 8, 1]])
  bgToitX(0, 10, 3, 14, 12, 'gray', [1, 10])
  bgFen(5, 6, 8, 1, 'west', 2, 0); bgFen(11, 11, 8, 1, 'west', 2, 1)
  // ---- boulangerie x11..20 : rez de pierre, etage a colombages, pignon sur rue ----
  bgCoque(11, 3, 20, 14, 2, true)
  for (var x = 11; x <= 20; x++) for (var y = 7; y <= 11; y++) [3, 14].forEach(z => S(x, y, z, (x - 11) % 3 == 0 ? BGL : y == 9 ? BGX : 'minecraft:white_terracotta'))
  F(13, 2, 3, 15, 4, 3, GP); PORTE(17, 1, 3, BGV, 'north', 'left', 'false'); S(17, 3, 3, GP); S(17, 0, 2, 'minecraft:stone_brick_stairs[facing=south,half=bottom,shape=straight]'); F(13, 5, 3, 15, 5, 3, 'minecraft:chiseled_stone_bricks')
  F(12, 5, 2, 19, 5, 2, 'supplementaries:awning_red[facing=north]')
  F(13, 1, 6, 17, 1, 6, MAT('stripped_spruce_counter', 'north')); S(14, 2, 6, 'minecraft:cake'); S(16, 2, 6, 'minecraft:cake[bites=3]'); S(13, 2, 6, 'supplementaries:jar'); S(17, 2, 6, 'minecraft:decorated_pot')
  F(13, 1, 8, 17, 1, 8, 'minecraft:barrel[facing=north,open=false]'); F(13, 2, 8, 17, 2, 8, 'minecraft:spruce_trapdoor[facing=north,half=bottom,open=true]')
  S(19, 1, 5, 'mcwfurnitures:spruce_table'); S(19, 1, 4, MAT('spruce_chair', 'south')); S(12, 1, 4, 'minecraft:potted_fern'); S(12, 1, 5, 'minecraft:barrel[facing=up,open=false]'); S(12, 2, 5, 'minecraft:decorated_pot'); S(15, 5, 5, LH); S(18, 5, 7, LH)
  F(12, 1, 9, 19, 5, 9, SB); PORTE(18, 1, 9, BGP, 'north', 'left', 'false')
  F(15, 1, 12, 17, 3, 13, 'minecraft:bricks'); S(15, 1, 12, 'minecraft:furnace[facing=north,lit=false]'); S(16, 1, 12, 'minecraft:smoker[facing=north,lit=false]'); S(17, 1, 12, 'minecraft:furnace[facing=north,lit=false]')
  S(13, 1, 11, 'mcwfurnitures:spruce_table'); S(14, 1, 11, 'mcwfurnitures:spruce_table'); S(13, 2, 11, 'farmersdelight:cutting_board[facing=north]'); S(14, 2, 11, 'supplementaries:jar')
  F(19, 1, 10, 19, 1, 12, 'supplementaries:sack'); S(19, 2, 10, 'supplementaries:sack'); S(19, 1, 13, 'minecraft:hay_block[axis=y]'); S(12, 1, 10, 'minecraft:barrel[facing=up,open=true]'); S(14, 5, 12, LH)
  PORTE(12, 1, 14, BGP, 'south', 'left', 'false'); S(12, 0, 15, 'minecraft:stone_brick_stairs[facing=north,half=bottom,shape=straight]'); bgFen(18, 18, 2, 14, 'south', 2, 3); bgPapiers(12, 4, 19, 7, 1, 3)
  bgEtage(10, 'brown', 'yellow', [[12, 13, 3], [15, 16, 3], [18, 19, 3]])
  F(16, 4, 13, 16, 18, 13, 'minecraft:bricks'); S(16, 19, 13, 'minecraft:brick_wall')
  bgToitZ(2, 15, 12, 19, 12, 'spruce', [3, 14]); bgFen(15, 16, 13, 3, 'north', 2, 3); F(16, 16, 13, 16, 18, 13, 'minecraft:bricks')
  // ---- cafe-restaurant x21..30 : bois, grandes baies, terrasse sous pergola ----
  bgCoque(21, 3, 30, 14, 2, false); W(21, 3, 30, 14, 0, 0, SB)
  F(22, 2, 3, 24, 4, 3, GP); bgFen(27, 29, 2, 3, 'north', 3, 2); PORTE(25, 1, 3, BGV, 'north', 'left', 'false'); PORTE(26, 1, 3, BGV, 'north', 'right', 'false'); F(25, 3, 3, 26, 3, 3, GP)
  F(25, 0, 2, 26, 0, 2, 'minecraft:stone_brick_stairs[facing=south,half=bottom,shape=straight]')
  ;[21, 24, 27, 30].forEach(x => { F(x, 0, 0, x, 3, 0, BGF); F(x, 4, 1, x, 4, 2, BGZ) }); F(21, 4, 0, 30, 4, 0, BGX)
  for (var x = 22; x <= 29; x++) if (x != 24 && x != 27 && R() < 0.6) F(x, 2, 0, x, 3, 0, 'minecraft:vine[up=true]'.replace('[up=true]', '[up=true,north=false]'))
  S(22, 0, 1, 'mcwfurnitures:spruce_table'); S(23, 0, 1, MAT('spruce_chair', 'west')); S(28, 0, 1, 'mcwfurnitures:spruce_table'); S(29, 0, 1, MAT('spruce_chair', 'west')); S(27, 0, 1, MAT('spruce_chair', 'east')); S(22, 1, 1, 'minecraft:candle[candles=1,lit=false]')
  F(28, 1, 5, 28, 1, 10, MAT('dark_oak_counter', 'west')); S(28, 2, 6, 'minecraft:brewing_stand'); S(28, 2, 9, 'supplementaries:jar'); ;[6, 8, 10].forEach(z => S(27, 1, z, 'mcwfurnitures:spruce_stool_chair'))
  F(29, 1, 5, 29, 1, 9, 'minecraft:barrel[facing=west,open=false]'); F(29, 2, 5, 29, 3, 9, 'minecraft:chiseled_bookshelf[facing=west]')
  ;[5, 8].forEach(z => { S(22, 1, z, 'mcwfurnitures:red_couch[facing=east,shape=single]'); S(23, 1, z, 'mcwfurnitures:dark_oak_table'); S(24, 1, z, 'mcwfurnitures:red_couch[facing=west,shape=single]'); S(23, 2, z, 'minecraft:candle[candles=1,lit=false]') })
  S(25, 1, 11, 'mcwfurnitures:dark_oak_table'); S(24, 1, 11, MAT('dark_oak_chair', 'east')); S(21, 3, 11, 'minecraft:target'); S(25, 1, 7, 'supplementaries:jar'); S(26, 1, 9, 'supplementaries:jar')
  F(22, 1, 13, 26, 1, 13, MAT('spruce_counter', 'north')); S(23, 1, 13, 'mcwfurnitures:spruce_kitchen_sink[facing=north,water=false]'); S(24, 1, 13, 'farmersdelight:stove[facing=north,lit=false]'); S(24, 2, 13, 'farmersdelight:cooking_pot'); S(22, 2, 13, 'farmersdelight:cutting_board[facing=north]')
  ;[22, 23, 25].forEach((x, i) => S(x, 3, 13, 'mcwfurnitures:spruce_kitchen_cabinet[facing=north,hinge=' + (i % 2 ? 'right' : 'left') + ']')); S(27, 1, 13, 'minecraft:jukebox')
  S(24, 5, 7, 'mcwlights:iron_chandelier'); S(25, 5, 11, LH); S(28, 5, 8, LH); PORTE(29, 1, 14, BGP, 'south', 'left', 'false'); S(29, 0, 15, 'minecraft:stone_brick_stairs[facing=north,half=bottom,shape=straight]'); bgPapiers(22, 4, 27, 12, 1, 5)
  bgEtage(20, 'gray', 'red', [[23, 24, 0], [27, 28, 0]])
  bgToitX(21, 31, 3, 14, 12, 'brown_terracotta', [21, 30])
  bgFen(5, 6, 8, 30, 'east', 2, 0); bgFen(11, 11, 8, 30, 'east', 2, 0); bgFen(8, 9, 2, 30, 'east', 2, 3)
  // cours arriere
  F(10, 0, 16, 10, 0, 28, BGF); F(20, 0, 16, 20, 0, 28, BGF); S(10, 0, 23, AIR); S(20, 0, 25, AIR)
  bgVoiture(6, 24, 'z', 'white', 1); F(1, 0, 17, 2, 1, 18, 'farmersdelight:potato_crate'); S(1, 2, 17, 'farmersdelight:carrot_crate'); S(8, 0, 16, 'minecraft:composter[level=0]'); S(2, 0, 20, 'supplementaries:sack')
  F(16, 0, 17, 19, 1, 18, 'minecraft:spruce_log[axis=x]'); S(12, 0, 17, 'supplementaries:sack'); S(12, 0, 18, 'supplementaries:sack'); S(12, 1, 17, 'supplementaries:sack'); S(17, 0, 22, 'minecraft:hay_block[axis=y]')
  F(27, 0, 17, 29, 0, 17, 'minecraft:barrel[facing=up,open=false]'); S(27, 1, 17, 'supplementaries:jar'); F(30, 0, 20, 30, 1, 20, 'minecraft:white_concrete'); S(26, 0, 20, MAT('spruce_chair', 'south')); S(22, 0, 26, 'minecraft:composter[level=0]')
  bgLierre(8, 1, 1, 11, 'west'); bgLierre(12, 30, 1, 7, 'east'); bgLierre(15, 14, 1, 5, 'south')
  sapin(2, 26, 8); sapin(17, 26, 9); sapin(28, 25, 7)
  bgVeg(0, 0, 31, 31, 0.3)
}

// ================= ECOLE COMMUNALE (pavillon central a clocheton, deux ailes de classe, preau, cour) =================
function bgEcole() {
  BGT = {}
  var SB = 'minecraft:stone_bricks', LH = 'minecraft:lantern[hanging=true]', LU = 'mcwlights:iron_chandelier', DT = 'minecraft:deepslate_tiles', DTS = 'minecraft:deepslate_tile_slab'
  bgSol(0, 0, 31, 31)
  bgCoque(2, 3, 12, 13, 1, false); bgCoque(19, 3, 29, 13, 1, false); bgCoque(12, 2, 19, 14, 2, true)
  F(2, 1, 3, 11, 1, 3, 'minecraft:cobblestone'); F(2, 1, 13, 11, 1, 13, 'minecraft:cobblestone'); F(2, 1, 4, 2, 1, 12, 'minecraft:cobblestone')
  F(20, 1, 3, 29, 1, 3, 'minecraft:cobblestone'); F(20, 1, 13, 29, 1, 13, 'minecraft:cobblestone'); F(29, 1, 4, 29, 1, 12, 'minecraft:cobblestone')
  bgToitX(1, 11, 3, 13, 6, 'gray', [2]); bgToitX(20, 30, 3, 13, 6, 'gray', [29]); bgToitZ(1, 15, 12, 19, 12, 'gray', [2, 14])
  // clocheton
  F(14, 13, 6, 17, 16, 9, BGS); ;[[14, 6], [17, 6], [14, 9], [17, 9]].forEach(p => F(p[0], 13, p[1], p[0], 19, p[1], BGL))
  ;[[15, 6], [16, 6], [15, 9], [16, 9], [14, 7], [14, 8], [17, 7], [17, 8]].forEach(p => S(p[0], 17, p[1], BGF))
  F(14, 20, 6, 17, 20, 9, DT); F(13, 20, 5, 18, 20, 5, DTS + '[type=top]'); F(13, 20, 10, 18, 20, 10, DTS + '[type=top]'); F(13, 20, 6, 13, 20, 9, DTS + '[type=top]'); F(18, 20, 6, 18, 20, 9, DTS + '[type=top]')
  F(14, 21, 6, 17, 21, 9, DTS + '[type=bottom]'); F(15, 21, 7, 16, 21, 8, DT); F(15, 22, 7, 16, 22, 8, DTS + '[type=bottom]'); S(15, 23, 7, 'minecraft:lightning_rod'); S(15, 19, 7, 'minecraft:bell[attachment=ceiling,facing=north]')
  // pavillon : entree, vestiaire, escalier
  PORTE(15, 1, 2, BGP, 'north', 'left', 'false'); PORTE(16, 1, 2, BGP, 'north', 'right', 'false'); S(15, 3, 2, GP); S(16, 3, 2, GP)
  PORTE(12, 1, 8, BGP, 'west', 'left', 'false'); PORTE(19, 1, 8, BGP, 'east', 'right', 'false'); PORTE(15, 1, 14, BGP, 'south', 'left', 'false'); S(15, 0, 15, 'minecraft:stone_brick_stairs[facing=north,half=bottom,shape=straight]')
  for (var k = 0; k <= 5; k++) { S(13 + k, 1 + k, 12, 'minecraft:spruce_stairs[facing=east,half=bottom,shape=straight]'); if (k > 0) F(13 + k, 1, 12, 13 + k, k, 12, BGS) }
  F(15, 6, 12, 17, 6, 12, AIR); F(15, 7, 11, 17, 7, 11, BGF)
  F(13, 0, 0, 18, 0, 1, SB); F(14, 0, 0, 17, 0, 0, 'minecraft:stone_brick_stairs[facing=south,half=bottom,shape=straight]'); F(13, 1, 0, 13, 3, 0, BGF); F(18, 1, 0, 18, 3, 0, BGF); F(13, 4, 0, 18, 4, 1, 'minecraft:spruce_slab[type=bottom]'); S(15, 3, 1, LH)
  ;[14, 17].forEach(x => S(x, 3, 3, 'minecraft:tripwire_hook[facing=south,attached=false,powered=false]'))
  F(13, 1, 5, 13, 1, 6, 'minecraft:spruce_stairs[facing=west,half=bottom,shape=straight]'); F(18, 1, 5, 18, 1, 6, 'minecraft:spruce_stairs[facing=east,half=bottom,shape=straight]')
  S(13, 1, 3, 'minecraft:barrel[facing=up,open=false]'); S(18, 2, 9, 'supplementaries:notice_board[facing=west]'); S(13, 1, 10, 'minecraft:potted_fern'); S(13, 1, 11, 'minecraft:cauldron'); S(15, 5, 7, LU); bgPapiers(13, 3, 18, 11, 1, 5)
  // logement de fonction a l'etage
  F(13, 7, 7, 18, 11, 7, BGS); PORTE(13, 7, 7, BGP, 'north', 'left', 'false')
  var c = cadre(13, 3, 18, 6, 'north', 6); piece(c, 'chambre', 0)
  F(18, 7, 8, 18, 7, 10, MAT('spruce_counter', 'west')); S(18, 7, 9, 'mcwfurnitures:spruce_kitchen_sink[facing=west,water=false]'); S(18, 7, 10, 'farmersdelight:stove[facing=west,lit=false]'); S(18, 8, 10, 'farmersdelight:cooking_pot')
  S(15, 7, 9, 'mcwfurnitures:spruce_table'); S(14, 7, 9, MAT('spruce_chair', 'east')); S(16, 7, 9, MAT('spruce_chair', 'west')); S(15, 8, 9, 'minecraft:candle[candles=2,lit=false]')
  F(13, 7, 10, 13, 7, 11, 'mcwfurnitures:blue_couch[facing=east,shape=single]'); S(13, 7, 13, 'minecraft:bookshelf'); S(15, 11, 10, LH)
  // fenetres
  bgFen(3, 5, 2, 3, 'north', 3, 3); bgFen(7, 9, 2, 3, 'north', 3, 3); bgFen(3, 5, 2, 13, 'south', 3, 3); bgFen(7, 9, 2, 13, 'south', 3, 2)
  bgFen(20, 22, 2, 3, 'north', 3, 3); bgFen(24, 26, 2, 3, 'north', 3, 2); bgFen(28, 28, 2, 3, 'north', 3, 3); bgFen(20, 22, 2, 13, 'south', 3, 3); bgFen(24, 26, 2, 13, 'south', 3, 3); bgFen(28, 28, 2, 13, 'south', 3, 3)
  bgFen(4, 5, 2, 2, 'west', 3, 3); bgFen(12, 12, 2, 2, 'west', 3, 3); bgFen(4, 5, 2, 29, 'east', 3, 3); bgFen(12, 12, 2, 29, 'east', 3, 2)
  bgFen(13, 13, 2, 2, 'north', 3, 3); bgFen(18, 18, 2, 2, 'north', 3, 3); bgFen(13, 13, 2, 14, 'south', 3, 3); bgFen(18, 18, 2, 14, 'south', 3, 3)
  bgFen(14, 14, 8, 2, 'north', 2, 0); bgFen(17, 17, 8, 2, 'north', 2, 0); bgFen(14, 14, 8, 14, 'south', 2, 0); bgFen(17, 17, 8, 14, 'south', 2, 1); bgFen(15, 16, 13, 2, 'north', 2, 3)
  // salles de classe (ouest : tableau a l'ouest ; est : tableau a l'est)
  ;[[3, 1, 'east', 5, 4, [7, 10]], [28, -1, 'west', 26, 27, [24, 21]]].forEach(cl => {
    var xt = cl[0], s = cl[1], ft = cl[2]
    F(xt, 2, 7, xt, 3, 9, 'supplementaries:blackboard[facing=' + ft + ']'); S(xt, 4, 8, 'supplementaries:clock_block[facing=' + ft + ']')
    S(cl[3], 1, 8, 'mcwfurnitures:spruce_table'); S(cl[4], 1, 8, MAT('spruce_chair', ft)); S(cl[3], 2, 8, 'supplementaries:globe')
    cl[5].forEach(x => [5, 6, 10, 11].forEach(z => {
      S(x, 1, z, 'mcwfurnitures:spruce_table'); var r = R()
      S(x + s, 1, z, r < 0.18 ? AIR : r < 0.26 ? 'supplementaries:sack' : MAT('spruce_chair', OPP[ft]))
      if (R() < 0.35) S(x, 2, z, choix(['supplementaries:book_pile', 'minecraft:white_carpet', 'minecraft:candle[candles=1,lit=false]']))
    }))
    var xp = s > 0 ? 11 : 20; S(xp, 1, 4, 'minecraft:furnace[facing=' + OPP[ft] + ',lit=false]'); F(xp, 2, 4, xp, 5, 4, 'minecraft:iron_bars')
    F(s > 0 ? 3 : 26, 1, 12, s > 0 ? 5 : 28, 1, 12, 'minecraft:bookshelf'); S(s > 0 ? 7 : 24, 5, 8, LU); S(s > 0 ? 9 : 22, 5, 5, LH)
  })
  bgPapiers(3, 4, 11, 12, 1, 6); bgPapiers(20, 4, 28, 12, 1, 6)
  // preau
  bgDalle(3, 22, 13, 29, 'minecraft:smooth_stone'); ;[3, 7, 10, 13].forEach(x => [22, 29].forEach(z => F(x, 0, z, x, 4, z, BGL)))
  F(3, 5, 22, 13, 5, 22, BGX); F(3, 5, 29, 13, 5, 29, BGX); F(3, 5, 23, 3, 5, 28, BGZ); F(13, 5, 23, 13, 5, 28, BGZ)
  bgToitX(2, 14, 22, 29, 5, 'gray', [])
  F(4, 0, 29, 6, 2, 29, BGS); F(8, 0, 29, 9, 2, 29, BGS); F(11, 0, 29, 12, 2, 29, BGS); F(4, 0, 28, 12, 0, 28, 'minecraft:spruce_stairs[facing=south,half=bottom,shape=straight]')
  ;[5, 8, 11].forEach(x => S(x, 2, 28, 'minecraft:tripwire_hook[facing=north,attached=false,powered=false]')); S(12, 0, 23, 'supplementaries:sack')
  // cour : bitume fissure, marelle, but, bouleau
  for (var x = 14; x <= 30; x++) for (var z = 16; z <= 30; z++) { var r = R(), b = r < 0.82 ? 'minecraft:gray_concrete' : r < 0.9 ? 'minecraft:andesite' : 'minecraft:coarse_dirt'; bgDalle(x, z, x, z, b); if (b == 'minecraft:coarse_dirt') BGT[x + ',' + z] = 1 }
  ;[18, 19, 21, 22, 23, 25].forEach(z => { S(17, -1, z, 'minecraft:white_concrete'); if (z == 19 || z == 22 || z == 25) S(18, -1, z, 'minecraft:white_concrete') })
  F(30, 0, 21, 30, 2, 21, 'minecraft:iron_bars'); F(30, 0, 25, 30, 2, 25, 'minecraft:iron_bars'); F(30, 3, 21, 30, 3, 25, 'minecraft:iron_bars')
  F(24, 0, 27, 24, 6, 27, 'minecraft:birch_log[axis=y]'); bgDalle(24, 27, 24, 27, 'minecraft:coarse_dirt')
  for (var dx = -2; dx <= 2; dx++) for (var dz = -2; dz <= 2; dz++) for (var y = 5; y <= 8; y++) if (Math.abs(dx) + Math.abs(dz) + Math.abs(y - 6.5) < 3.6 && R() < 0.9) SA(24 + dx, y, 27 + dz, 'minecraft:birch_leaves[persistent=true]')
  bgBanc(22, 29, 'south', 2); bgBanc(26, 29, 'south', 2)
  F(0, 0, 15, 0, 0, 31, BGF); F(31, 0, 15, 31, 0, 31, BGF); F(1, 0, 31, 30, 0, 31, BGF)
  for (var i = 0; i < 14; i++) SA(14 + Math.floor(R() * 17), 0, 16 + Math.floor(R() * 15), choix(['minecraft:birch_leaves[persistent=true]', 'minecraft:white_carpet', 'minecraft:moss_carpet']))
  // abords
  for (var x = 2; x <= 11; x++) if (R() > 0.2) S(x, 0, 0, 'minecraft:spruce_leaves[persistent=true]'); for (var x = 20; x <= 29; x++) if (R() > 0.2) S(x, 0, 0, 'minecraft:spruce_leaves[persistent=true]')
  bgVeg(2, 1, 11, 2, 0.9); bgVeg(20, 1, 29, 2, 0.9)
  bgLierre(8, 2, 1, 6, 'west'); bgLierre(10, 13, 1, 5, 'south'); bgLierre(27, 3, 2, 5, 'north')
  sapin(1, 17, 9); sapin(30, 14, 8); sapin(9, 18, 7)
  bgVeg(0, 0, 31, 31, 0.3)
}

// ================= AUBERGE (R+2 a galeries, taverne, chambres d'hotes, grange, terrasse) =================
function bgAuberge() {
  BGT = {}
  var SB = 'minecraft:stone_bricks', LH = 'minecraft:lantern[hanging=true]', LU = 'mcwlights:iron_chandelier', ST = 'minecraft:spruce_stairs'
  bgSol(0, 0, 31, 31)
  bgDalle(2, 0, 25, 3, [SB, 'minecraft:cobblestone', 'minecraft:mossy_cobblestone'])
  bgCoque(3, 4, 24, 15, 3, true)
  // rez : taverne, bar, cuisine
  F(19, 1, 5, 19, 5, 14, SB)
  var c = cadre(20, 5, 23, 14, 'east', 0); piece(c, 'cuisine', 1); c.porte(BGP)
  F(16, 1, 5, 16, 1, 9, MAT('dark_oak_counter', 'west')); S(16, 2, 6, 'minecraft:brewing_stand'); S(16, 2, 8, 'supplementaries:jar'); ;[5, 7, 9].forEach(z => S(15, 1, z, 'mcwfurnitures:spruce_stool_chair'))
  F(18, 1, 6, 18, 2, 9, 'minecraft:barrel[facing=west,open=false]'); S(17, 5, 7, LH)
  F(4, 1, 8, 4, 3, 8, 'minecraft:cobblestone'); F(4, 1, 11, 4, 3, 11, 'minecraft:cobblestone'); S(4, 1, 9, 'minecraft:campfire[lit=false,facing=east]'); S(4, 1, 10, 'minecraft:campfire[lit=false,facing=east]'); F(4, 4, 8, 4, 4, 11, 'minecraft:stone_brick_slab[type=top]')
  S(4, 5, 9, 'minecraft:candle[candles=3,lit=false]'); S(4, 5, 10, 'minecraft:decorated_pot')
  ;[7, 11].forEach(zt => {
    F(6, 1, zt, 11, 1, zt, 'mcwfurnitures:spruce_table'); F(6, 1, zt - 1, 11, 1, zt - 1, ST + '[facing=north,half=bottom,shape=straight]'); F(6, 1, zt + 1, 11, 1, zt + 1, ST + '[facing=south,half=bottom,shape=straight]')
    for (var x = 6; x <= 11; x++) { if (R() < 0.15) S(x, 1, zt - 1, AIR); if (R() < 0.15) S(x, 1, zt + 1, AIR); if (R() < 0.3) S(x, 2, zt, choix(['minecraft:candle[candles=1,lit=false]', 'supplementaries:jar', 'minecraft:white_carpet'])) }
  })
  S(14, 1, 12, MAT('spruce_counter', 'north')); S(15, 1, 12, 'minecraft:barrel[facing=north,open=false]'); S(15, 2, 12, 'minecraft:bell[attachment=floor,facing=north]'); S(14, 2, 12, 'supplementaries:book_pile')
  S(8, 5, 9, LU); S(13, 5, 8, LU); S(9, 5, 13, LH); bgPapiers(5, 5, 14, 13, 1, 6)
  for (var k = 0; k <= 5; k++) { S(17 - k, 1 + k, 14, ST + '[facing=west,half=bottom,shape=straight]'); if (k > 0) F(17 - k, 1, 14, 17 - k, k, 14, BGS) }
  F(13, 6, 14, 15, 6, 14, AIR)
  PORTE(12, 1, 4, BGP, 'north', 'left', 'false'); PORTE(13, 1, 4, BGP, 'north', 'right', 'false'); F(11, 0, 3, 14, 0, 3, 'minecraft:stone_brick_stairs[facing=south,half=bottom,shape=straight]')
  PORTE(8, 1, 15, BGP, 'south', 'left', 'false'); S(8, 0, 16, 'minecraft:stone_brick_stairs[facing=north,half=bottom,shape=straight]')
  bgFen(5, 6, 2, 4, 'north', 3, 3); bgFen(8, 9, 2, 4, 'north', 3, 3); bgFen(15, 16, 2, 4, 'north', 3, 2); bgFen(21, 22, 2, 4, 'north', 3, 3)
  bgFen(6, 6, 2, 3, 'west', 2, 3); bgFen(13, 13, 2, 3, 'west', 2, 3); bgFen(5, 6, 2, 15, 'south', 2, 3); bgFen(10, 11, 2, 15, 'south', 2, 3); bgFen(8, 9, 2, 24, 'east', 2, 3)
  // etages : couloir, chambres d'hotes, cage d'escalier
  ;[6, 12].forEach((y, f) => {
    F(4, y + 1, 8, 23, y + 5, 8, BGS); F(4, y + 1, 11, 11, y + 5, 11, BGS); F(18, y + 1, 11, 23, y + 5, 11, BGS)
    ;[8, 13, 18].forEach(x => F(x, y + 1, 5, x, y + 5, 7, BGS)); F(11, y + 1, 12, 11, y + 5, 14, BGS); F(18, y + 1, 12, 18, y + 5, 14, BGS)
    ;[[4, 7], [9, 12], [14, 17], [19, 23]].forEach(p => { var cc = cadre(p[0], 5, p[1], 7, 'north', y); piece(cc, 'chambre', R() < 0.3 ? 1 : 0); cc.porte(BGP) })
    var ce = cadre(4, 12, 10, 14, 'south', y); piece(ce, f == 0 ? 'sdb' : 'salle', 0); ce.porte(BGP)
    var cg = cadre(19, 12, 23, 14, 'south', y); piece(cg, 'chambre', 0); cg.porte(BGP)
    for (var x = 4; x <= 23; x++) for (var z = 9; z <= 10; z++) if (R() > 0.12) S(x, y + 1, z, f == 0 ? 'minecraft:red_carpet' : 'minecraft:green_carpet')
    ;[7, 15, 21].forEach(x => S(x, y + 5, 9, LH))
    ;[6, 10, 16, 22].forEach(x => PORTE(x, y + 1, 4, BGV, 'north', 'left', 'false')); ;[5, 9, 14].forEach(x => F(x, y + 2, 4, x, y + 3, 4, GP)); F(20, y + 2, 4, 21, y + 3, 4, GP)
    bgFen(6, 6, y + 2, 3, 'west', 2, f); bgFen(13, 13, y + 2, 3, 'west', 2, 0); bgFen(6, 6, y + 2, 24, 'east', 2, 0); bgFen(13, 13, y + 2, 24, 'east', 2, 2 - f)
    bgFen(5, 6, y + 2, 15, 'south', 2, 0); bgFen(20, 21, y + 2, 15, 'south', 2, f); bgFen(14, 15, y + 3, 15, 'south', 2, 3)
    F(3, y, 2, 24, y, 3, 'minecraft:spruce_slab[type=top]'); F(3, y + 1, 2, 24, y + 1, 2, BGF); S(3, y + 1, 3, BGF); S(24, y + 1, 3, BGF)
  })
  for (var k = 0; k <= 5; k++) { S(12 + k, 7 + k, 13, ST + '[facing=east,half=bottom,shape=straight]'); if (k > 0) F(12 + k, 7, 13, 12 + k, 6 + k, 13, BGS) }
  F(15, 12, 13, 16, 12, 13, AIR)
  for (var k = 0; k <= 5; k++) { S(17 - k, 13 + k, 14, ST + '[facing=west,half=bottom,shape=straight]'); if (k > 0) F(17 - k, 13, 14, 17 - k, 12 + k, 14, BGS) }
  F(13, 18, 14, 14, 18, 14, AIR)
  ;[3, 8, 13, 18, 24].forEach(x => F(x, 0, 2, x, 17, 2, BGL)); F(3, 18, 2, 24, 18, 2, 'minecraft:spruce_slab[type=bottom]')
  S(5, 7, 3, MAT('spruce_chair', 'north')); S(20, 13, 3, MAT('spruce_chair', 'north')); S(11, 7, 3, 'minecraft:potted_dead_bush'); S(16, 13, 3, 'supplementaries:sack')
  // combles : dortoir du personnel, malles, lucarnes vitrees
  bgToitX(2, 25, 4, 15, 18, 'spruce', [3, 24])
  ;[[8, 20, 5], [18, 20, 5], [8, 21, 6], [18, 21, 6], [13, 20, 14], [20, 20, 14]].forEach(p => S(p[0], p[1], p[2], 'minecraft:glass'))
  LIT(6, 19, 10, 'gray', 'north'); LIT(9, 19, 10, 'brown', 'north'); S(5, 19, 6, 'minecraft:chest[facing=south]'); S(7, 19, 6, 'minecraft:barrel[facing=up,open=false]'); S(20, 19, 7, 'minecraft:chest[facing=south]')
  S(22, 19, 12, 'supplementaries:sack'); S(21, 19, 13, 'minecraft:barrel[facing=up,open=true]'); S(12, 23, 9, LH); S(20, 23, 10, LH); bgFen(9, 10, 20, 3, 'west', 2, 3); bgFen(9, 10, 20, 24, 'east', 2, 3)
  F(1, 0, 9, 2, 26, 10, 'minecraft:cobblestone'); F(1, 27, 9, 2, 27, 10, 'minecraft:cobblestone_wall')
  // grange x26..30 z3..19
  bgDalle(26, 3, 30, 19, ['minecraft:coarse_dirt', 'minecraft:packed_mud', 'minecraft:gravel']); W(26, 3, 30, 19, 0, 8, BGS); ;[3, 7, 11, 15, 19].forEach(z => { F(26, 0, z, 26, 8, z, BGL); F(30, 0, z, 30, 8, z, BGL) })
  bgToitZ(2, 20, 26, 30, 8, 'spruce', [3, 19])
  F(27, 0, 3, 29, 4, 3, AIR); F(27, 5, 3, 29, 5, 3, BGX)
  F(27, 5, 12, 29, 5, 18, BGS); F(27, 0, 11, 27, 5, 11, 'minecraft:ladder[facing=east]'); F(28, 6, 12, 29, 6, 12, BGF)
  F(27, 6, 14, 29, 6, 18, 'minecraft:hay_block[axis=y]'); F(27, 7, 14, 29, 7, 15, 'minecraft:hay_block[axis=y]')
  F(28, 0, 6, 29, 0, 6, BGF); F(28, 0, 9, 29, 0, 9, BGF); S(29, 0, 4, 'minecraft:composter[level=0]'); S(29, 0, 5, 'minecraft:hay_block[axis=y]'); S(29, 0, 7, 'minecraft:water_cauldron[level=1]'); S(29, 0, 8, 'minecraft:hay_block[axis=y]')
  S(27, 0, 18, 'minecraft:chest[facing=east]'); S(27, 0, 16, 'minecraft:anvil[facing=north]'); S(29, 0, 17, 'minecraft:barrel[facing=up,open=false]'); S(29, 0, 15, 'supplementaries:sack'); S(28, 4, 14, LH)
  F(30, 3, 9, 30, 4, 9, GP); F(30, 3, 16, 30, 4, 16, GP); S(26, 0, 1, 'minecraft:water_cauldron[level=2]'); S(27, 0, 1, 'minecraft:cauldron')
  // terrasse et jardin
  bgDalle(4, 17, 18, 24, [SB, 'minecraft:cobblestone', 'minecraft:mossy_cobblestone', 'minecraft:gravel'])
  bgParasol(7, 20, 'red'); bgParasol(13, 20, 'white'); bgParasol(16, 23, 'red')
  S(10, 0, 28, 'minecraft:campfire[lit=false]'); F(8, 0, 27, 8, 0, 29, 'minecraft:stripped_spruce_log[axis=z]'); F(12, 0, 27, 12, 0, 29, 'minecraft:stripped_spruce_log[axis=z]')
  bgLierre(12, 3, 1, 16, 'west'); bgLierre(10, 24, 1, 5, 'east')
  sapin(2, 27, 9); sapin(22, 28, 8); sapin(29, 25, 9)
  bgVeg(0, 0, 31, 31, 0.32)
}

// ================= SCIERIE (zone d'activite : halle de sciage, chaufferie, bureau, parc a grumes) =================
function bgScierie() {
  BGT = {}
  var LH = 'minecraft:lantern[hanging=true]'
  for (var x = 0; x <= 31; x++) for (var z = 0; z <= 31; z++) { var r = R(), b = r < 0.3 ? 'minecraft:gravel' : r < 0.55 ? 'minecraft:coarse_dirt' : r < 0.7 ? 'minecraft:packed_mud' : r < 0.8 ? 'minecraft:rooted_dirt' : 'minecraft:grass_block'; S(x, -1, z, b); if (b != 'minecraft:gravel' && b != 'minecraft:packed_mud') BGT[x + ',' + z] = 1 }
  // halle de sciage x2..18 z8..24
  F(2, 0, 8, 18, 0, 24, BGS); F(2, 1, 9, 2, 2, 23, BGS); F(18, 1, 9, 18, 2, 23, BGS); F(3, 1, 24, 17, 6, 24, BGS)
  ;[2, 6, 10, 14, 18].forEach(x => [8, 14, 20, 24].forEach(z => F(x, 1, z, x, 6, z, BGL)))
  F(2, 7, 8, 2, 7, 24, BGZ); F(18, 7, 8, 18, 7, 24, BGZ); ;[8, 14, 20, 24].forEach(z => F(3, 7, z, 17, 7, z, BGX))
  bgToitZ(7, 25, 2, 18, 7, 'spruce', [24])
  for (var z = 9; z <= 23; z++) if (z < 15 || z > 17) S(10, 1, z, 'minecraft:rail[shape=north_south]')
  S(10, 1, 11, 'minecraft:spruce_log[axis=z]'); S(10, 1, 12, 'minecraft:spruce_log[axis=z]'); S(10, 1, 16, 'minecraft:stonecutter[facing=north]'); F(9, 1, 15, 9, 1, 17, 'mcwfurnitures:spruce_table'); F(11, 1, 15, 11, 1, 17, 'mcwfurnitures:spruce_table')
  S(10, 6, 8, 'minecraft:chain[axis=y]'); S(10, 5, 8, 'minecraft:chain[axis=y]'); S(10, 4, 8, 'minecraft:spruce_log[axis=x]')
  F(3, 1, 16, 5, 2, 19, 'minecraft:stripped_spruce_log[axis=x]'); F(15, 1, 16, 17, 3, 19, BGS); F(15, 4, 16, 17, 4, 17, 'minecraft:spruce_slab[type=bottom]')
  S(3, 1, 22, 'minecraft:crafting_table'); S(4, 1, 22, 'minecraft:grindstone[face=floor,facing=north]'); S(5, 1, 23, 'minecraft:anvil[facing=east]'); S(3, 1, 23, 'minecraft:chest[facing=east]')
  S(16, 1, 22, 'minecraft:barrel[facing=up,open=false]'); S(17, 1, 22, 'minecraft:barrel[facing=up,open=false]'); S(17, 1, 23, 'minecraft:barrel[facing=up,open=true]'); S(16, 1, 23, 'supplementaries:sack')
  ;[[8, 14], [12, 14], [8, 20], [12, 20]].forEach(p => S(p[0], 6, p[1], LH))
  for (var i = 0; i < 14; i++) SA(3 + Math.floor(R() * 15), 1, 9 + Math.floor(R() * 15), choix(['minecraft:brown_carpet', 'minecraft:spruce_trapdoor[facing=north,half=bottom,open=false]', 'minecraft:stripped_spruce_log[axis=z]']))
  // parc a grumes et camion grumier
  F(3, 0, 2, 12, 1, 4, 'minecraft:spruce_log[axis=x]'); F(4, 2, 3, 11, 2, 3, 'minecraft:spruce_log[axis=x]'); F(14, 0, 2, 17, 1, 3, 'minecraft:birch_log[axis=x]')
  F(25, 0, 22, 30, 0, 26, 'minecraft:spruce_log[axis=x]'); F(25, 1, 22, 30, 1, 25, 'minecraft:spruce_log[axis=x]'); F(25, 2, 23, 30, 2, 24, 'minecraft:spruce_log[axis=x]'); F(25, 0, 28, 30, 1, 30, 'minecraft:spruce_log[axis=x]')
  for (var v = 0; v <= 1; v++) for (var u = 0; u <= 7; u++) {
    var x = 21 + v, z = 21 + u
    if (u <= 1) { S(x, 0, z, 'minecraft:red_concrete'); S(x, 1, z, u == 0 ? 'minecraft:tinted_glass' : 'minecraft:red_concrete'); S(x, 2, z, 'minecraft:smooth_stone_slab[type=bottom]') }
    else { S(x, 0, z, 'minecraft:gray_concrete'); S(x, 1, z, 'minecraft:spruce_log[axis=z]'); if (u < 7) S(x, 2, z, 'minecraft:spruce_log[axis=z]') }
  }
  ;[0, 3, 6].forEach(u => { S(20, 0, 21 + u, 'minecraft:polished_blackstone_button[face=wall,facing=west]'); S(23, 0, 21 + u, 'minecraft:polished_blackstone_button[face=wall,facing=east]') })
  // bureau x21..29 z2..8
  bgCoque(21, 2, 29, 8, 1, false); bgToitX(20, 30, 2, 8, 6, 'brown_terracotta', [21, 29])
  PORTE(25, 1, 2, BGP, 'north', 'left', 'false'); S(25, 0, 1, 'minecraft:stone_brick_stairs[facing=south,half=bottom,shape=straight]')
  S(22, 1, 3, 'mcwfurnitures:gray_couch[facing=east,shape=single]'); S(22, 1, 4, 'mcwfurnitures:gray_couch[facing=east,shape=single]'); S(24, 1, 6, 'mcwfurnitures:spruce_table'); S(25, 1, 6, 'mcwfurnitures:spruce_table')
  S(24, 1, 7, MAT('spruce_chair', 'north')); S(26, 1, 6, MAT('spruce_chair', 'west')); S(24, 2, 6, 'supplementaries:book_pile'); S(25, 2, 6, 'minecraft:candle[candles=1,lit=false]')
  F(28, 1, 3, 28, 1, 5, MAT('spruce_drawer', 'west')); S(28, 1, 7, 'minecraft:cartography_table'); S(22, 1, 7, 'minecraft:iron_block'); S(23, 1, 7, 'minecraft:bookshelf'); S(25, 5, 5, LH); bgPapiers(22, 3, 28, 7, 1, 5)
  bgFen(22, 23, 2, 2, 'north', 2, 0); bgFen(27, 28, 2, 2, 'north', 2, 1); bgFen(24, 25, 2, 8, 'south', 2, 0); bgFen(5, 5, 2, 21, 'west', 2, 0); bgFen(5, 5, 2, 29, 'east', 2, 2)
  // chaufferie et cheminee
  bgDalle(22, 13, 27, 18, 'minecraft:stone_bricks'); W(21, 12, 28, 19, 0, 7, 'minecraft:bricks'); bgToitX(20, 29, 12, 19, 7, 'gray', [21, 28])
  F(23, 0, 14, 25, 2, 16, 'minecraft:iron_block'); S(23, 0, 15, 'minecraft:blast_furnace[facing=west,lit=false]'); S(22, 1, 14, 'minecraft:lever[face=wall,facing=west,powered=false]'); F(25, 3, 15, 25, 6, 15, 'minecraft:iron_bars')
  F(22, 0, 18, 24, 0, 18, 'minecraft:coal_block'); S(22, 1, 18, 'minecraft:coal_block'); PORTE(21, 0, 17, 'minecraft:iron_door', 'west', 'left', 'false')
  F(26, 0, 15, 27, 20, 16, 'minecraft:bricks'); F(26, 16, 15, 27, 16, 16, 'minecraft:mud_bricks'); F(26, 21, 15, 27, 21, 16, 'minecraft:brick_wall')
  F(18, 4, 15, 21, 4, 15, 'minecraft:iron_bars'); F(28, 3, 14, 28, 4, 14, GP); F(28, 3, 17, 28, 4, 17, GP); F(24, 3, 12, 24, 4, 12, GP)
  F(29, 0, 13, 30, 0, 14, 'minecraft:barrel[facing=up,open=false]'); S(29, 1, 13, 'minecraft:barrel[facing=up,open=false]')
  // cloture et portail
  F(0, 0, 0, 0, 0, 31, BGF); F(31, 0, 0, 31, 0, 31, BGF); F(1, 0, 31, 30, 0, 31, BGF); F(1, 0, 0, 17, 0, 0, BGF); F(21, 0, 0, 30, 0, 0, BGF)
  S(18, 0, 0, 'minecraft:spruce_fence_gate[facing=north,open=true,in_wall=false]'); S(20, 0, 0, 'minecraft:spruce_fence_gate[facing=north,open=true,in_wall=false]')
  bgLierre(12, 21, 1, 5, 'west')
  sapin(1, 27, 9); sapin(30, 10, 8)
  bgVeg(0, 0, 31, 31, 0.35)
}


// ================= QUARTIER DU DESERT (adobe, terre cuite, acacia : desert, savane, badlands) =================
// Rangee nord (z0..31, facades au sud) : mission, hotel de ville, souk, habitat en gradins. Boulevard z32..47. Rangee sud (z48..79).
var DSA = 'minecraft:acacia_planks', DSL = 'minecraft:acacia_log[axis=y]', DSX = 'minecraft:stripped_acacia_log[axis=x]', DSZ = 'minecraft:stripped_acacia_log[axis=z]'
var DSF = 'minecraft:acacia_fence', DSP = 'mcwdoors:acacia_classic_door', DSV = 'mcwdoors:acacia_glass_door', DST = {}
var DSAB = 'minecraft:white_terracotta', DSJ = 'minecraft:smooth_sandstone', DSLH = 'minecraft:lantern[hanging=true]'
function dsM(b) { var r = R(); return r < 0.84 ? b : r < 0.93 ? 'minecraft:terracotta' : 'minecraft:packed_mud' }
function dsSol(x1, z1, x2, z2) {
  for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) {
    var r = R(), b = r < 0.36 ? 'minecraft:sand' : r < 0.42 ? 'minecraft:red_sand' : r < 0.56 ? 'minecraft:coarse_dirt' : r < 0.62 ? 'minecraft:packed_mud' : 'minecraft:grass_block'
    S(x, -1, z, b); var k = x + ',' + z
    if (b == 'minecraft:packed_mud') delete DST[k]; else DST[k] = (b == 'minecraft:grass_block' || b == 'minecraft:coarse_dirt') ? 'h' : 's'
  }
}
function dsDalle(x1, z1, x2, z2, l) { for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) { S(x, -1, z, typeof l == 'string' ? l : choix(l)); delete DST[x + ',' + z] } }
function dsVeg(x1, z1, x2, z2, d) {
  for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) {
    var t = DST[x + ',' + z]; if (!t) continue
    var r = R()
    if (t == 'h') { if (r < d * 0.5) SA(x, 0, z, 'minecraft:short_grass'); else if (r < d * 0.8) SA(x, 0, z, 'minecraft:dead_bush'); else if (r < d * 0.88) SA(x, 0, z, choix(['minecraft:orange_tulip', 'minecraft:dandelion', 'minecraft:allium'])) }
    else if (r < d * 0.35) SA(x, 0, z, 'minecraft:dead_bush')
  }
}
function dsPapiers(x1, z1, x2, z2, y, n) { for (var i = 0; i < n; i++) SA(x1 + Math.floor(R() * (x2 - x1 + 1)), y, z1 + Math.floor(R() * (z2 - z1 + 1)), choix(['minecraft:white_carpet', 'minecraft:white_carpet', 'supplementaries:book_pile', 'minecraft:light_gray_carpet', 'minecraft:yellow_carpet'])) }
function dsLibre(x, z) { for (var a = -1; a <= 1; a++) for (var b = -1; b <= 1; b++) delete DST[(x + a) + ',' + (z + b)] }
function dsCactus(x, z, h) { S(x, -1, z, 'minecraft:sand'); F(x, 0, z, x, h - 1, z, 'minecraft:cactus'); dsLibre(x, z) }
// Palmier (y0 = pied du tronc) ; mort : tronc sans palmes
function dsPalmier(x, z, h, mort, y0) {
  y0 = y0 || 0; var T = y0 + h, L = 'minecraft:azalea_leaves[persistent=true]'
  F(x, y0, z, x, T - 1, z, 'minecraft:jungle_log[axis=y]'); dsLibre(x, z)
  if (mort) { S(x, T, z, 'minecraft:stripped_jungle_log[axis=y]'); return }
  S(x, T, z, L); S(x, T + 1, z, L)
  ;[[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(d => { S(x + d[0], T, z + d[1], L); S(x + 2 * d[0], T, z + 2 * d[1], L); S(x + 3 * d[0], T, z + 3 * d[1], L); S(x + 3 * d[0], T - 1, z + 3 * d[1], L) })
  ;[[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(d => { S(x + d[0], T, z + d[1], L); S(x + d[0], T - 1, z + d[1], L) })
  S(x + 1, T - 1, z, 'minecraft:cocoa[age=2,facing=west]'); S(x, T - 1, z - 1, 'minecraft:cocoa[age=1,facing=south]')
}
function dsAcacia(x, z) {
  var L = 'minecraft:acacia_leaves[persistent=true]'
  F(x, 0, z, x, 3, z, DSL); S(x + 1, 3, z, DSL); S(x + 1, 4, z, DSL); S(x + 2, 4, z, DSL); S(x - 1, 3, z, DSL); dsLibre(x, z)
  for (var a = -2; a <= 2; a++) for (var b = -2; b <= 2; b++) if (Math.abs(a) + Math.abs(b) < 4) S(x + 2 + a, 5, z + b, L)
  for (var a = -1; a <= 1; a++) for (var b = -1; b <= 1; b++) S(x + 2 + a, 6, z + b, L)
  for (var a = -1; a <= 1; a++) for (var b = -1; b <= 1; b++) if (Math.abs(a) + Math.abs(b) < 2) S(x - 1 + a, 4, z + b, L)
}
// Olivier sec (feuillage gris-vert clairseme)
function dsOlivier(x, z) {
  var L = 'minecraft:azalea_leaves[persistent=true]'
  F(x, 0, z, x, 1, z, 'minecraft:stripped_acacia_log[axis=y]'); S(x, 2, z, DSL); dsLibre(x, z)
  for (var a = -1; a <= 1; a++) for (var b = -1; b <= 1; b++) for (var y = 2; y <= 3; y++) if ((a || b || y == 3) && R() < 0.7) S(x + a, y, z + b, L)
}
// Volume d'adobe : murs y0+1..y0+6, plafond a poutres (vigas) en y0+6, acrotere en y0+7 et vigas en saillie si o.toit
function dsBloc(x1, z1, x2, z2, y0, b, o) {
  o = o || {}; var sans = o.sans || []
  if (y0 == 0) F(x1, 0, z1, x2, 0, z2, DSA)
  for (var y = y0 + 1; y <= y0 + 6; y++) {
    for (var x = x1; x <= x2; x++) { S(x, y, z1, dsM(b)); S(x, y, z2, dsM(b)) }
    for (var z = z1 + 1; z < z2; z++) { S(x1, y, z, dsM(b)); S(x2, y, z, dsM(b)) }
  }
  var ax = (x2 - x1) <= (z2 - z1) ? 'x' : 'z'
  for (var x = x1 + 1; x < x2; x++) for (var z = z1 + 1; z < z2; z++) S(x, y0 + 6, z, ((ax == 'x' ? z : x) % 2) ? (ax == 'x' ? DSX : DSZ) : DSA)
  if (o.toit) {
    for (var x = x1; x <= x2; x++) { S(x, y0 + 7, z1, dsM(b)); S(x, y0 + 7, z2, dsM(b)) }
    for (var z = z1 + 1; z < z2; z++) { S(x1, y0 + 7, z, dsM(b)); S(x2, y0 + 7, z, dsM(b)) }
    if (ax == 'x') { for (var z = z1 + 1; z < z2; z++) if (z % 2) { if (sans.indexOf('west') < 0) S(x1 - 1, y0 + 5, z, DSX); if (sans.indexOf('east') < 0) S(x2 + 1, y0 + 5, z, DSX) } }
    else { for (var x = x1 + 1; x < x2; x++) if (x % 2) { if (sans.indexOf('north') < 0) S(x, y0 + 5, z1 - 1, DSZ); if (sans.indexOf('south') < 0) S(x, y0 + 5, z2 + 1, DSZ) } }
    // gargouilles (canales) en bois
    if (sans.indexOf('south') < 0) S(Math.floor((x1 + x2) / 2), y0 + 7, z2 + 1, 'minecraft:acacia_trapdoor[facing=south,half=bottom,open=false]')
    if (sans.indexOf('north') < 0) S(Math.floor((x1 + x2) / 2) + 1, y0 + 7, z1 - 1, 'minecraft:acacia_trapdoor[facing=north,half=bottom,open=false]')
  }
}
// Fenetre : etat 0 vitre + volets ouverts, 1 grille en fer (reja), 2 planches clouees, 3 vitre seule ; linteau en bois, appui en saillie
function dsFen(a1, a2, y, c, f, h, etat) {
  var ns = f == 'north' || f == 'south', d = (f == 'south' || f == 'east') ? 1 : -1
  function P(a, yy, o, b) { if (ns) S(a, yy, c + o, b); else S(c + o, yy, a, b) }
  var vo = 'minecraft:acacia_trapdoor[facing=' + f + ',half=bottom,open=true]'
  for (var a = a1; a <= a2; a++) {
    for (var k = 0; k < h; k++) P(a, y + k, 0, etat == 1 ? 'minecraft:iron_bars' : etat == 2 ? 'minecraft:acacia_trapdoor[facing=' + f + ',half=' + (k % 2 ? 'bottom' : 'top') + ',open=false]' : GP)
    P(a, y - 1, d, 'minecraft:smooth_sandstone_slab[type=top]')
  }
  for (var a = a1 - 1; a <= a2 + 1; a++) P(a, y + h, 0, ns ? DSX : DSZ)
  if (etat == 0) for (var k = 0; k < h; k++) { if (R() > 0.2) P(a1 - 1, y + k, d, vo); if (R() > 0.2) P(a2 + 1, y + k, d, vo) }
}
// Arcade : piliers tous les 3, arcs en marches renversees, poutre au-dessus (ns : arcade le long de x sur la ligne z = c)
function dsArcade(a1, a2, c, y0, ns, mat, st) {
  function P(a, y, b) { if (ns) S(a, y, c, b); else S(c, y, a, b) }
  for (var a = a1; a <= a2; a++) {
    if ((a - a1) % 3 == 0 || a == a2) { for (var y = y0 + 1; y <= y0 + 4; y++) P(a, y, mat) }
    else { var g = (a - a1) % 3 == 1; P(a, y0 + 4, st + '[facing=' + (ns ? (g ? 'west' : 'east') : (g ? 'north' : 'south')) + ',half=top,shape=straight]') }
    P(a, y0 + 5, mat)
  }
}
function dsLampadaire(x, z, d) { // d = decalage du bras vers la chaussee (+1 / -1 en z)
  F(x, 0, z, x, 4, z, 'minecraft:polished_blackstone_wall'); S(x, 5, z, 'minecraft:polished_blackstone_slab[type=bottom]'); S(x, 5, z + d, 'minecraft:polished_blackstone_slab[type=bottom]'); S(x, 4, z + d, DSLH)
}
function dsPickup(x, z, c) { // pick-up le long de x : cabine x..x+1, plateau x+2..x+4
  var k = 'minecraft:' + c + '_concrete'
  for (var u = 0; u < 5; u++) for (var v = 0; v < 2; v++) S(x + u, 0, z + v, k)
  S(x, 1, z, 'minecraft:tinted_glass'); S(x, 1, z + 1, 'minecraft:tinted_glass'); S(x + 1, 1, z, k); S(x + 1, 1, z + 1, k); S(x, 2, z, 'minecraft:' + c + '_carpet'); S(x + 1, 2, z, 'minecraft:' + c + '_carpet'); S(x, 2, z + 1, 'minecraft:' + c + '_carpet'); S(x + 1, 2, z + 1, 'minecraft:' + c + '_carpet')
  for (var u = 2; u < 5; u++) { S(x + u, 1, z, 'minecraft:' + c + '_carpet'); S(x + u, 1, z + 1, 'minecraft:' + c + '_carpet') }
  S(x + 3, 1, z, 'minecraft:barrel[facing=up,open=false]'); S(x + 4, 1, z + 1, 'supplementaries:sack')
  ;[0, 3].forEach(u => { S(x + u, 0, z - 1, 'minecraft:polished_blackstone_button[face=wall,facing=north]'); S(x + u, 0, z + 2, 'minecraft:polished_blackstone_button[face=wall,facing=south]') })
}

// ================= BOULEVARD (coordonnees du quartier, x -16..143, z 32..47) : terre-plein a palmiers, sable qui envahit =================
function dsRue() {
  DST = {}
  for (var x = -16; x <= 143; x++) for (var z = 32; z <= 47; z++) {
    var b
    if (z <= 34 || z >= 45) b = (z == 34 || z == 45) ? 'minecraft:smooth_stone' : ((x + z) % 3 ? DSJ : 'minecraft:cut_sandstone')
    else if (z == 39 || z == 40) b = 'minecraft:cut_sandstone'
    else { var r = R(); b = r < 0.8 ? 'minecraft:gray_concrete' : r < 0.88 ? 'minecraft:light_gray_concrete' : r < 0.94 ? 'minecraft:sand' : 'minecraft:andesite' }
    S(x, -1, z, b)
  }
  for (var x = -16; x <= 143; x++) {
    if (((x % 6) + 6) % 6 < 3) { S(x, -1, 37, 'minecraft:white_concrete'); S(x, -1, 42, 'minecraft:white_concrete') }
    var p = ((x - 4) % 14 + 14) % 14
    if (p < 2) { S(x, 0, 39, 'minecraft:coarse_dirt'); S(x, 0, 40, 'minecraft:coarse_dirt') }
    else { S(x, 0, 39, 'minecraft:smooth_sandstone_slab[type=bottom]'); S(x, 0, 40, 'minecraft:smooth_sandstone_slab[type=bottom]') }
  }
  for (var x = -10; x <= 140; x += 14) { if (x >= 54 && x <= 61) continue; var m = R() < 0.25; dsPalmier(x, 39, 7 + Math.floor(R() * 3), m, 1); SA(x + 1, 1, 40, 'minecraft:dead_bush') }
  // passage pieton
  for (var x = 54; x <= 61; x++) if (x % 2 == 0) for (var z = 35; z <= 44; z++) if (z != 39 && z != 40) S(x, -1, z, 'minecraft:white_concrete')
  for (var x = 54; x <= 61; x++) { S(x, 0, 39, AIR); S(x, 0, 40, AIR); S(x, -1, 39, 'minecraft:cut_sandstone'); S(x, -1, 40, 'minecraft:cut_sandstone') }
  // feux tricolores
  ;[[53, 33, 1], [62, 46, -1]].forEach(t => { F(t[0], 0, t[1], t[0], 5, t[1], 'minecraft:polished_blackstone_wall'); var zz = t[1] + t[2]; S(t[0], 5, zz, 'minecraft:black_concrete'); S(t[0], 4, zz, 'minecraft:red_stained_glass'); S(t[0], 3, zz, 'minecraft:yellow_stained_glass'); S(t[0], 2, zz, 'minecraft:black_concrete') })
  // lampadaires
  for (var x = -8; x <= 140; x += 16) { dsLampadaire(x, 33, 1); if (R() < 0.85) dsLampadaire(x + 8, 46, -1) }
  // dunes de sable qui recouvrent la chaussee
  ;[[-4, 43, 7, 3], [30, 36, 6, 2], [84, 43, 8, 3], [118, 35, 5, 2], [136, 41, 6, 4]].forEach(d => {
    for (var x = d[0] - d[2]; x <= d[0] + d[2]; x++) for (var z = d[1] - d[3]; z <= d[1] + d[3]; z++) {
      var e = Math.pow((x - d[0]) / d[2], 2) + Math.pow((z - d[1]) / d[3], 2); if (e > 1 || z < 32 || z > 47) continue
      if (z == 39 || z == 40) continue
      S(x, -1, z, 'minecraft:sand'); if (e < 0.35) S(x, 0, z, 'minecraft:sand'); if (e > 0.6 && R() < 0.12) SA(x, 0, z, 'minecraft:dead_bush')
    }
  })
  // vehicules abandonnes (emplacements des futurs vehicules MTS)
  bgVoiture(2, 36, 'x', 'white', 1); bgVoiture(20, 42, 'x', 'light_blue', 0); bgVoiture(45, 36, 'x', 'orange', 2); bgVoiture(68, 42, 'x', 'yellow', 1)
  bgVoiture(96, 36, 'x', 'red', 1); bgVoiture(124, 42, 'x', 'brown', 0); bgVoiture(82, 42, 'x', 'white', 1, true); dsPickup(108, 36, 'brown'); dsPickup(14, 36, 'light_gray')
  // palmier tombe en travers du trottoir
  F(10, 0, 32, 10, 0, 37, 'minecraft:jungle_log[axis=z]'); ;[[9, 38], [11, 38], [10, 38], [10, 39 - 1]].forEach(p => SA(p[0], 0, p[1], 'minecraft:jungle_leaves[persistent=true]'))
  // debris, barrieres de chantier, abribus
  for (var i = 0; i < 40; i++) SA(-16 + Math.floor(R() * 160), 0, 32 + Math.floor(R() * 16), choix(['minecraft:dead_bush', 'minecraft:light_gray_carpet', 'minecraft:white_carpet', 'minecraft:sand', 'minecraft:dead_bush', 'supplementaries:sack']))
  ;[70, 71, 72].forEach(x => { S(x, 0, 36, 'minecraft:orange_concrete'); S(x, 1, 36, 'minecraft:white_concrete') })
  F(36, 0, 46, 42, 0, 47, 'minecraft:smooth_stone'); ;[36, 42].forEach(x => F(x, 1, 47, x, 3, 47, 'minecraft:iron_bars')); F(36, 4, 46, 42, 4, 47, 'minecraft:smooth_stone_slab[type=bottom]'); F(37, 1, 47, 41, 3, 47, 'minecraft:light_blue_stained_glass_pane'); S(39, 2, 47, AIR)
  F(37, 1, 46, 41, 1, 46, 'minecraft:smooth_stone_slab[type=bottom]')
}

// ================= MISSION (eglise d'adobe a clocher-mur, couvent, patio, parvis a croix) =================
function dsMission() {
  DST = {}
  var B = DSAB, MB = 'minecraft:mud_bricks', MBS = 'minecraft:mud_brick_stairs', MBL = 'minecraft:mud_brick_slab'
  dsSol(0, 0, 31, 31)
  // ---- nef x9..19 z5..24 ----
  F(9, 0, 5, 19, 0, 24, DSA)
  for (var x = 10; x <= 18; x++) for (var z = 6; z <= 23; z++) S(x, 0, z, (x + z) % 2 ? 'minecraft:terracotta' : 'minecraft:brown_terracotta')
  for (var y = 1; y <= 11; y++) { for (var x = 9; x <= 19; x++) { S(x, y, 5, dsM(B)); S(x, y, 24, dsM(B)) } for (var z = 6; z <= 23; z++) { S(9, y, z, dsM(B)); S(19, y, z, dsM(B)) } }
  for (var x = 10; x <= 18; x++) for (var z = 6; z <= 23; z++) S(x, 11, z, z % 2 ? DSX : DSA)
  F(10, 12, 6, 18, 12, 23, 'minecraft:packed_mud')
  for (var z = 5; z <= 23; z++) { S(9, 12, z, dsM(B)); S(19, 12, z, dsM(B)) } for (var x = 10; x <= 18; x++) S(x, 12, 5, dsM(B))
  for (var z = 7; z <= 23; z += 2) { S(8, 10, z, DSX); if (z > 15) S(20, 10, z, DSX) }
  // clocher-mur (espadana) a trois baies
  ;[[12, 9, 19], [13, 10, 18], [14, 11, 17], [15, 12, 16], [16, 13, 15], [17, 14, 14]].forEach(p => F(p[1], p[0], 24, p[2], p[0], 24, B))
  F(12, 13, 24, 12, 14, 24, AIR); F(16, 13, 24, 16, 14, 24, AIR); F(14, 15, 24, 14, 16, 24, AIR)
  S(12, 14, 24, 'minecraft:bell[attachment=ceiling,facing=south]'); S(16, 14, 24, 'minecraft:bell[attachment=ceiling,facing=south]'); S(14, 16, 24, 'minecraft:bell[attachment=ceiling,facing=south]')
  ;[[9, 12], [19, 12], [10, 13], [18, 13], [11, 14], [17, 14], [12, 15], [16, 15], [13, 16], [15, 16]].forEach(p => S(p[0], p[1] + 1, 24, MBL + '[type=bottom]'))
  F(14, 18, 24, 14, 20, 24, 'minecraft:stripped_dark_oak_log[axis=y]'); S(13, 19, 24, 'minecraft:stripped_dark_oak_log[axis=x]'); S(15, 19, 24, 'minecraft:stripped_dark_oak_log[axis=x]')
  // portail
  F(12, 0, 25, 16, 0, 25, MB); F(13, 1, 25, 15, 5, 25, MB); F(14, 1, 25, 14, 3, 25, AIR); S(13, 3, 25, MBS + '[facing=west,half=top,shape=straight]'); S(15, 3, 25, MBS + '[facing=east,half=top,shape=straight]')
  F(12, 1, 25, 12, 5, 25, 'minecraft:mud_brick_wall'); F(16, 1, 25, 16, 5, 25, 'minecraft:mud_brick_wall'); F(12, 6, 25, 16, 6, 25, MBL + '[type=bottom]')
  F(12, 0, 26, 16, 0, 26, MBS + '[facing=north,half=bottom,shape=straight]')
  PORTE(14, 1, 24, DSP, 'south', 'left', 'false')
  S(14, 7, 24, GP); S(14, 8, 24, GP); S(13, 8, 24, GP); S(15, 8, 24, GP); S(14, 9, 24, GP)
  // contreforts
  ;[8, 14, 20].forEach(z => { F(8, 0, z, 8, 7, z, B); S(8, 8, z, MBS + '[facing=east,half=bottom,shape=straight]'); if (z > 15) { F(20, 0, z, 20, 7, z, B); S(20, 8, z, MBS + '[facing=west,half=bottom,shape=straight]') } })
  ;[9, 19].forEach(x => { F(x, 0, 25, x, 9, 25, B); S(x, 10, 25, MBS + '[facing=north,half=bottom,shape=straight]') })
  dsFen(11, 11, 5, 9, 'west', 3, 3); dsFen(17, 17, 5, 9, 'west', 3, 2); dsFen(22, 22, 6, 9, 'west', 2, 1); dsFen(18, 18, 5, 19, 'east', 3, 3); dsFen(22, 22, 6, 19, 'east', 2, 3)
  // sanctuaire, retable de carreaux, autel
  F(10, 1, 6, 18, 1, 9, 'minecraft:smooth_red_sandstone'); F(10, 1, 10, 18, 1, 10, 'minecraft:smooth_red_sandstone_stairs[facing=north,half=bottom,shape=straight]')
  for (var x = 11; x <= 17; x++) for (var y = 2; y <= 9; y++) S(x, y, 6, (x == 11 || x == 17) ? 'minecraft:cut_red_sandstone' : y == 9 ? 'minecraft:chiseled_red_sandstone' : y % 3 == 2 ? 'minecraft:chiseled_sandstone' : ((x + y) % 2 ? 'minecraft:orange_glazed_terracotta[facing=south]' : 'minecraft:yellow_glazed_terracotta[facing=south]'))
  F(14, 3, 6, 14, 8, 6, 'minecraft:stripped_dark_oak_log[axis=y]'); S(13, 7, 6, 'minecraft:stripped_dark_oak_log[axis=x]'); S(15, 7, 6, 'minecraft:stripped_dark_oak_log[axis=x]'); S(14, 10, 6, 'minecraft:chiseled_red_sandstone')
  F(12, 2, 8, 16, 2, 8, 'minecraft:smooth_quartz'); S(12, 3, 8, 'minecraft:candle[candles=3,lit=false]'); S(13, 3, 8, 'minecraft:white_carpet'); S(14, 3, 8, 'minecraft:candle[candles=4,lit=false]'); S(15, 3, 8, 'minecraft:white_carpet'); S(16, 3, 8, 'minecraft:candle[candles=2,lit=false]')
  ;[10, 18].forEach(x => { S(x, 2, 7, 'minecraft:mud_brick_wall'); S(x, 3, 7, 'minecraft:candle[candles=1,lit=false]') })
  // bancs, allee, fonts baptismaux, tribune et orgue
  for (var z = 12; z <= 20; z += 2) for (var x = 10; x <= 18; x++) { if (x == 14 || R() < 0.12) continue; S(x, 1, z, 'minecraft:acacia_stairs[facing=south,half=bottom,shape=straight]') }
  for (var z = 11; z <= 23; z++) if (R() > 0.2) S(14, 1, z, 'minecraft:red_carpet')
  S(11, 1, 23, 'minecraft:water_cauldron[level=1]'); S(17, 1, 23, 'minecraft:candle[candles=2,lit=false]'); S(10, 1, 13, 'minecraft:candle[candles=3,lit=false]'); S(18, 1, 17, 'minecraft:candle[candles=1,lit=false]')
  F(10, 5, 21, 18, 5, 23, DSA); F(10, 6, 21, 17, 6, 21, DSF); F(10, 1, 21, 10, 4, 21, DSL); F(17, 1, 21, 17, 4, 21, DSL)
  F(18, 1, 22, 18, 5, 22, 'minecraft:ladder[facing=west]')
  F(11, 6, 23, 15, 6, 23, 'minecraft:note_block'); ;[11, 12, 13, 14, 15].forEach((x, i) => F(x, 7, 23, x, 7 + (i % 3), 23, 'minecraft:lightning_rod')); S(13, 6, 22, 'mcwfurnitures:acacia_stool_chair')
  S(14, 10, 13, 'mcwlights:iron_chandelier'); S(14, 10, 18, 'mcwlights:iron_chandelier')
  // toit perce, gravats
  F(12, 11, 15, 13, 12, 16, AIR); S(13, 1, 15, 'minecraft:packed_mud'); S(12, 1, 15, MBL + '[type=bottom]'); S(13, 2, 15, 'minecraft:dead_bush')
  PORTE(9, 1, 19, DSP, 'west', 'left', 'false'); S(8, 0, 19, MBS + '[facing=east,half=bottom,shape=straight]')
  // ---- couvent x19..28 z6..15 : sacristie, chambre du pretre, cuisine a cheminee d'angle ----
  dsBloc(19, 6, 28, 15, 0, B, { toit: true, sans: ['west'] })
  for (var y = 1; y <= 7; y++) for (var z = 6; z <= 15; z++) S(19, y, z, dsM(B))
  F(23, 1, 7, 23, 5, 14, B); PORTE(23, 1, 10, DSP, 'east', 'left', 'false'); F(24, 1, 11, 27, 5, 11, B); PORTE(25, 1, 11, DSP, 'south', 'left', 'false')
  PORTE(19, 1, 11, DSP, 'east', 'left', 'false')
  S(20, 1, 7, 'mcwfurnitures:acacia_wardrobe[facing=east,connection=base,hinge=left]'); S(20, 1, 9, 'minecraft:chest[facing=east]'); F(20, 1, 13, 20, 2, 14, 'minecraft:bookshelf'); S(22, 1, 14, 'mcwfurnitures:acacia_table'); S(22, 1, 13, MAT('acacia_chair', 'south')); S(22, 2, 14, 'minecraft:brewing_stand'); S(22, 1, 7, 'minecraft:candle[candles=2,lit=false]'); S(21, 5, 10, DSLH)
  LIT(26, 1, 9, 'brown', 'north'); S(24, 1, 7, 'mcwfurnitures:acacia_table'); S(24, 1, 8, MAT('acacia_chair', 'north')); S(24, 2, 7, 'supplementaries:book_pile'); S(27, 1, 7, 'minecraft:chest[facing=west]'); S(27, 1, 10, 'minecraft:potted_dead_bush'); S(25, 5, 9, DSLH)
  S(27, 1, 14, 'minecraft:campfire[lit=false,facing=west]'); S(26, 1, 14, MB); S(27, 1, 13, MB); S(26, 2, 14, MB); S(27, 2, 13, MB); S(26, 3, 14, MBL + '[type=bottom]'); S(27, 3, 13, MBL + '[type=bottom]'); F(27, 3, 14, 27, 8, 14, MB); S(27, 9, 14, 'minecraft:mud_brick_wall')
  S(25, 1, 13, 'mcwfurnitures:acacia_table'); S(24, 1, 13, MAT('acacia_chair', 'east')); S(25, 1, 12, MAT('acacia_chair', 'south')); S(25, 2, 13, 'minecraft:decorated_pot'); S(24, 1, 14, MAT('acacia_counter', 'north')); S(24, 2, 14, 'supplementaries:jar'); S(26, 1, 12, 'minecraft:decorated_pot'); S(25, 5, 13, DSLH)
  dsPapiers(20, 7, 27, 14, 1, 5)
  PORTE(21, 1, 15, DSP, 'south', 'left', 'false'); PORTE(25, 1, 15, DSP, 'south', 'right', 'false')
  dsFen(21, 21, 2, 6, 'north', 2, 0); dsFen(26, 26, 2, 6, 'north', 2, 1); dsFen(8, 9, 2, 28, 'east', 2, 1); dsFen(13, 13, 2, 28, 'east', 2, 2); dsFen(27, 27, 2, 15, 'south', 2, 3)
  // portique (portal) z16..17
  F(19, 0, 16, 28, 0, 17, 'minecraft:mud_bricks')
  ;[20, 23, 26].forEach(x => { F(x, 1, 17, x, 4, 17, DSL); S(x - 1, 4, 17, DSX); S(x + 1, 4, 17, DSX) }); F(28, 1, 17, 28, 4, 17, DSL)
  F(19, 5, 16, 28, 5, 17, DSA); for (var x = 20; x <= 27; x += 2) S(x, 5, 18, DSZ)
  S(21, 4, 16, DSLH); S(25, 4, 16, DSLH); F(23, 1, 16, 24, 1, 16, 'minecraft:acacia_stairs[facing=north,half=bottom,shape=straight]')
  // patio : puits, oliviers secs, jarres ; murs et portail sur le boulevard
  dsDalle(24, 18, 25, 25, ['minecraft:mud_bricks', 'minecraft:packed_mud', 'minecraft:mud_bricks'])
  F(21, 0, 21, 23, 0, 23, MB); S(22, 0, 22, 'minecraft:water'); dsDalle(22, 22, 22, 22, MB); dsLibre(22, 22)
  F(21, 1, 22, 21, 2, 22, DSF); F(23, 1, 22, 23, 2, 22, DSF); F(21, 3, 22, 23, 3, 22, DSX); S(22, 2, 22, 'minecraft:chain[axis=y]')
  dsOlivier(27, 19); dsOlivier(26, 23)
  S(28, 0, 19, 'minecraft:decorated_pot'); S(28, 0, 22, 'minecraft:decorated_pot'); S(20, 0, 18, 'minecraft:decorated_pot'); F(20, 0, 25, 20, 0, 25, MBS + '[facing=west,half=bottom,shape=straight]')
  F(29, 0, 5, 29, 1, 26, B); F(19, 0, 26, 29, 1, 26, B); F(19, 0, 25, 19, 1, 25, B); F(20, 2, 26, 29, 2, 26, MBL + '[type=bottom]'); F(29, 2, 5, 29, 2, 25, MBL + '[type=bottom]')
  F(24, 1, 26, 25, 1, 26, AIR); F(24, 2, 26, 25, 2, 26, AIR); S(24, 0, 26, 'minecraft:acacia_fence_gate[facing=south,open=true,in_wall=false]'); S(25, 0, 26, 'minecraft:acacia_fence_gate[facing=south,open=false,in_wall=false]'); F(23, 3, 26, 26, 3, 26, DSX)
  // parvis et croix d'atrium
  dsDalle(1, 26, 18, 31, [DSJ, 'minecraft:packed_mud', 'minecraft:sand', 'minecraft:mud_bricks', DSJ])
  S(14, 0, 29, MB); S(14, 1, 29, MB); F(14, 2, 29, 14, 4, 29, 'minecraft:stripped_dark_oak_log[axis=y]'); S(13, 3, 29, 'minecraft:stripped_dark_oak_log[axis=x]'); S(15, 3, 29, 'minecraft:stripped_dark_oak_log[axis=x]')
  S(13, 0, 29, MBS + '[facing=east,half=bottom,shape=straight]'); S(15, 0, 29, MBS + '[facing=west,half=bottom,shape=straight]'); S(14, 0, 28, MBS + '[facing=south,half=bottom,shape=straight]'); S(14, 0, 30, MBS + '[facing=north,half=bottom,shape=straight]')
  S(4, 0, 28, 'minecraft:bell[attachment=floor,facing=east]'); S(5, 0, 27, MBL + '[type=bottom]'); S(3, 0, 29, 'minecraft:packed_mud')
  F(2, 0, 30, 2, 1, 30, DSF); F(7, 0, 30, 7, 1, 30, DSF); F(3, 1, 30, 6, 1, 30, DSF)
  // cote ouest : four a pain (horno), bucher, cactus
  F(2, 0, 9, 4, 1, 11, 'minecraft:packed_mud'); S(3, 1, 10, AIR); S(4, 1, 10, AIR); S(3, 2, 10, MBL + '[type=bottom]'); S(2, 2, 10, MBL + '[type=bottom]'); S(3, 2, 9, MBL + '[type=bottom]'); S(3, 2, 11, MBL + '[type=bottom]'); S(3, 0, 10, 'minecraft:campfire[lit=false,facing=east]')
  dsLibre(3, 10); F(5, 0, 12, 6, 1, 13, 'minecraft:acacia_log[axis=x]'); dsLibre(5, 12); dsLibre(6, 13)
  S(6, 0, 4, 'minecraft:water_cauldron[level=1]'); dsLibre(6, 4)
  dsCactus(2, 3, 3); dsCactus(6, 17, 2); dsCactus(1, 21, 3); dsCactus(25, 2, 2); dsCactus(30, 29, 3)
  dsPalmier(4, 23, 8); dsPalmier(27, 29, 7); dsAcacia(2, 14)
  dsVeg(0, 0, 31, 31, 0.3)
}

// ================= HOTEL DE VILLE (palais municipal a patio, arcades sur rue, tour de l'horloge) =================
function dsMairie() {
  DST = {}
  var B = DSJ, C = 'minecraft:cut_sandstone', CH = 'minecraft:chiseled_sandstone', SS = 'minecraft:smooth_sandstone_stairs', SW = 'minecraft:sandstone_wall'
  dsSol(0, 0, 31, 31)
  dsBloc(3, 3, 28, 21, 0, B, {}); dsBloc(3, 3, 28, 21, 6, B, { toit: true, sans: ['south'] })
  ;[[3, 3], [28, 3], [3, 21], [28, 21]].forEach(p => F(p[0], 1, p[1], p[0], 13, p[1], C))
  for (var x = 3; x <= 28; x++) { S(x, 6, 3, C); S(x, 6, 21, C) } for (var z = 4; z <= 20; z++) { S(3, 6, z, C); S(28, 6, z, C) }
  // cloitre a deux niveaux autour du patio (anneau x9..22 z9..15, ciel ouvert x11..20 z11..13)
  F(8, 1, 8, 23, 11, 8, B); F(8, 1, 16, 23, 11, 16, B); F(8, 1, 9, 8, 11, 15, B); F(23, 1, 9, 23, 11, 15, B)
  F(11, 6, 11, 20, 13, 13, AIR)
  ;[0, 6].forEach(y0 => { dsArcade(10, 21, 10, y0, true, C, SS); dsArcade(10, 21, 14, y0, true, C, SS); dsArcade(10, 14, 10, y0, false, C, SS); dsArcade(10, 14, 21, y0, false, C, SS) })
  for (var x = 11; x <= 20; x++) [10, 14].forEach(z => { if ((x - 10) % 3) S(x, 7, z, SW) }); ;[11, 12].forEach(z => { S(10, 7, z, SW); S(21, 7, z, SW) })
  for (var x = 11; x <= 20; x++) for (var z = 11; z <= 13; z++) S(x, 0, z, (x + z) % 2 ? 'minecraft:terracotta' : DSJ)
  F(14, 1, 11, 17, 1, 13, C); F(15, 1, 12, 16, 1, 12, AIR); S(15, 0, 12, 'minecraft:cyan_glazed_terracotta[facing=north]'); S(16, 0, 12, 'minecraft:cyan_glazed_terracotta[facing=south]'); S(15, 1, 12, SW); S(15, 2, 12, SW); S(15, 3, 12, 'minecraft:smooth_sandstone_slab[type=bottom]')
  ;[[11, 11], [20, 11], [11, 13], [20, 13]].forEach(p => S(p[0], 1, p[1], 'minecraft:potted_dead_bush'))
  ;[[12, 9], [19, 9], [12, 15], [19, 15], [9, 12], [22, 12]].forEach(p => S(p[0], 5, p[1], DSLH))
  // rez : hall d'entree (sud), guichets (nord), archives et escalier (ouest), salle des mariages (est)
  PORTE(15, 1, 21, DSP, 'south', 'left', 'false'); PORTE(16, 1, 21, DSP, 'south', 'right', 'false'); F(15, 3, 21, 16, 3, 21, GP)
  F(15, 1, 16, 16, 3, 16, AIR); S(14, 2, 17, 'supplementaries:notice_board[facing=south]'); S(17, 2, 17, 'supplementaries:notice_board[facing=south]')
  F(10, 1, 19, 11, 1, 19, 'minecraft:acacia_stairs[facing=south,half=bottom,shape=straight]'); F(20, 1, 19, 21, 1, 19, 'minecraft:acacia_stairs[facing=south,half=bottom,shape=straight]'); S(9, 1, 17, 'minecraft:potted_dead_bush'); S(22, 1, 17, 'minecraft:decorated_pot'); S(15, 5, 19, 'mcwlights:iron_chandelier'); dsPapiers(9, 17, 22, 20, 1, 7)
  F(9, 1, 6, 22, 1, 6, MAT('acacia_counter', 'south')); for (var x = 9; x <= 22; x++) if (x % 4) F(x, 2, 6, x, 3, 6, 'minecraft:iron_bars')
  ;[10, 14, 18, 21].forEach(x => { S(x, 1, 4, 'mcwfurnitures:acacia_table'); S(x, 1, 5, MAT('acacia_chair', 'north')) }); S(10, 2, 4, 'supplementaries:book_pile'); S(18, 2, 4, 'minecraft:candle[candles=1,lit=false]')
  S(12, 1, 4, MAT('acacia_drawer', 'south')); S(16, 1, 4, MAT('acacia_drawer', 'south')); S(22, 1, 4, 'minecraft:iron_block'); S(20, 1, 4, 'minecraft:chest[facing=south]'); F(14, 1, 7, 17, 1, 7, 'minecraft:acacia_stairs[facing=south,half=bottom,shape=straight]'); S(15, 5, 5, DSLH); S(20, 5, 5, DSLH)
  PORTE(12, 1, 8, DSP, 'north', 'left', 'false'); PORTE(19, 1, 8, DSP, 'north', 'right', 'false'); dsPapiers(9, 4, 22, 7, 1, 6)
  for (var k = 0; k <= 5; k++) { S(5, 1 + k, 19 - k, 'minecraft:acacia_stairs[facing=north,half=bottom,shape=straight]'); S(6, 1 + k, 19 - k, 'minecraft:acacia_stairs[facing=north,half=bottom,shape=straight]'); if (k > 0) F(5, 1, 19 - k, 6, k, 19 - k, DSA) }
  F(5, 6, 15, 6, 6, 19, AIR); F(7, 7, 15, 7, 7, 19, DSF); F(5, 7, 20, 6, 7, 20, DSF); PORTE(8, 1, 20, DSP, 'west', 'left', 'false')
  F(4, 1, 13, 7, 5, 13, B); PORTE(4, 1, 13, DSP, 'south', 'left', 'false'); PORTE(8, 1, 10, DSP, 'west', 'left', 'false')
  for (var z = 4; z <= 11; z++) { if (z != 10) { F(4, 1, z, 4, 3, z, 'minecraft:bookshelf'); F(7, 1, z, 7, 3, z, R() < 0.8 ? 'minecraft:bookshelf' : 'minecraft:chiseled_bookshelf[facing=west]') } }
  S(5, 1, 6, 'supplementaries:sack'); S(6, 1, 9, 'minecraft:barrel[facing=up,open=true]'); S(5, 5, 8, DSLH); dsPapiers(5, 4, 6, 12, 1, 4)
  F(24, 1, 11, 27, 5, 11, B); PORTE(23, 1, 9, DSP, 'east', 'left', 'false'); PORTE(23, 1, 13, DSP, 'east', 'left', 'false')
  F(25, 1, 12, 25, 1, 20, 'minecraft:red_carpet'); for (var z = 14; z <= 19; z += 2) { S(24, 1, z, MAT('acacia_chair', 'east')); S(26, 1, z, MAT('acacia_chair', 'west')); S(27, 1, z, MAT('acacia_chair', 'west')) }
  F(24, 1, 20, 27, 1, 20, 'minecraft:smooth_sandstone_slab[type=bottom]'); S(25, 2, 20, 'mcwfurnitures:acacia_table'); S(25, 3, 20, 'minecraft:candle[candles=3,lit=false]'); S(24, 2, 20, 'minecraft:potted_azalea_bush'); S(27, 2, 20, 'minecraft:potted_dead_bush'); S(25, 5, 16, 'mcwlights:iron_chandelier')
  S(24, 1, 4, 'mcwfurnitures:acacia_table'); S(25, 1, 4, MAT('acacia_chair', 'west')); S(27, 1, 4, 'minecraft:bookshelf'); S(27, 1, 7, 'minecraft:chest[facing=west]'); S(24, 2, 4, 'supplementaries:book_pile'); S(26, 5, 7, DSLH)
  // etage : salle du conseil (sud), bureaux (nord), archives (ouest), cabinet du maire (est)
  F(14, 7, 18, 17, 7, 19, 'mcwfurnitures:acacia_table'); for (var x = 13; x <= 18; x++) { if (x > 13 && x < 18) S(x, 7, 20, MAT('acacia_chair', 'north')) }
  ;[18, 19].forEach(z => { S(13, 7, z, MAT('acacia_chair', 'east')); S(18, 7, z, MAT('acacia_chair', 'west')) }); S(15, 8, 18, 'supplementaries:book_pile'); S(16, 8, 19, 'minecraft:candle[candles=2,lit=false]')
  S(10, 7, 18, 'minecraft:red_banner'); S(21, 7, 18, 'minecraft:yellow_banner'); F(9, 7, 20, 11, 7, 20, 'minecraft:bookshelf'); F(20, 7, 20, 22, 7, 20, 'minecraft:bookshelf'); S(15, 11, 18, 'mcwlights:iron_chandelier'); dsPapiers(9, 17, 22, 20, 7, 5)
  PORTE(15, 7, 16, DSP, 'north', 'left', 'false'); PORTE(12, 7, 21, DSV, 'south', 'left', 'false'); PORTE(19, 7, 21, DSV, 'south', 'right', 'false')
  var c = cadre(9, 4, 14, 7, 'north', 6); piece(c, 'bureau', 1); c.porte(DSP); F(15, 7, 4, 15, 11, 7, B)
  c = cadre(16, 4, 22, 7, 'north', 6); piece(c, 'bureau', 0); c.porte(DSP)
  F(4, 7, 13, 7, 11, 13, B); c = cadre(4, 4, 7, 12, 'west', 6); piece(c, 'grenier', 1); c.porte(DSP)
  for (var z = 5; z <= 11; z += 2) S(7, 7, z, 'minecraft:bookshelf')
  PORTE(8, 7, 14, DSP, 'west', 'left', 'false')
  F(24, 7, 13, 27, 11, 13, B); c = cadre(24, 14, 27, 20, 'east', 6); piece(c, 'bureau', 0); c.porte(DSP); S(27, 7, 14, 'minecraft:iron_block'); S(24, 7, 20, 'minecraft:red_banner')
  c = cadre(24, 4, 27, 12, 'east', 6); piece(c, 'salle', 1)
  PORTE(23, 7, 10, DSP, 'east', 'left', 'false')
  // fenetres
  ;[[5, 6], [9, 10], [20, 21], [24, 25]].forEach(p => { dsFen(p[0], p[1], 2, 21, 'south', 2, 3); dsFen(p[0], p[1], 8, 21, 'south', 2, p[0] < 10 ? 0 : 1) })
  ;[[5, 6], [10, 11], [15, 16], [20, 21], [25, 26]].forEach((p, i) => { dsFen(p[0], p[1], 2, 3, 'north', 2, 1); dsFen(p[0], p[1], 8, 3, 'north', 2, i % 2 ? 0 : 3) })
  ;[[6, 7], [11, 12], [17, 18]].forEach(p => { dsFen(p[0], p[1], 2, 3, 'west', 2, 1); dsFen(p[0], p[1], 8, 3, 'west', 2, 0); dsFen(p[0], p[1], 2, 28, 'east', 2, 1); dsFen(p[0], p[1], 8, 28, 'east', 2, p[0] == 11 ? 2 : 0) })
  // arcades sur rue, balcon
  F(3, 0, 22, 28, 0, 24, C); dsArcade(3, 28, 24, 0, true, C, SS); F(3, 1, 22, 3, 5, 23, B); F(28, 1, 22, 28, 5, 23, B)
  for (var x = 3; x <= 28; x++) for (var z = 22; z <= 24; z++) S(x, 6, z, z == 24 ? C : (x % 2 ? DSX : DSA))
  for (var x = 4; x <= 27; x++) S(x, 7, 24, (x - 3) % 3 ? SW : C); F(3, 7, 22, 3, 7, 24, C); F(28, 7, 22, 28, 7, 24, C)
  F(3, 0, 25, 28, 0, 25, SS + '[facing=north,half=bottom,shape=straight]')
  ;[5, 11, 20, 26].forEach(x => S(x, 5, 23, DSLH)); ;[5, 9, 21, 25].forEach(x => F(x, 1, 22, x + 1, 1, 22, 'minecraft:smooth_sandstone_stairs[facing=north,half=bottom,shape=straight]'))
  S(13, 4, 22, 'minecraft:red_wall_banner[facing=south]'); S(18, 4, 22, 'minecraft:yellow_wall_banner[facing=south]')
  S(8, 7, 22, 'minecraft:potted_dead_bush'); S(23, 7, 23, 'minecraft:decorated_pot'); S(14, 7, 23, MAT('acacia_chair', 'south'))
  // tour de l'horloge (angle sud-ouest, au-dessus du toit)
  W(3, 17, 7, 21, 13, 19, B); ;[[3, 17], [7, 17], [3, 21], [7, 21]].forEach(p => F(p[0], 13, p[1], p[0], 19, p[1], C))
  ;[[5, 17], [5, 21], [3, 19], [7, 19]].forEach(p => F(p[0], 17, p[1], p[0], 18, p[1], AIR))
  F(4, 19, 18, 6, 19, 20, B); S(5, 18, 19, 'minecraft:bell[attachment=ceiling,facing=south]')
  S(5, 15, 21, 'supplementaries:clock_block[facing=south]'); S(5, 15, 17, 'supplementaries:clock_block[facing=north]'); S(3, 15, 19, 'supplementaries:clock_block[facing=west]'); S(7, 15, 19, 'supplementaries:clock_block[facing=east]')
  F(3, 20, 17, 7, 20, 21, 'minecraft:smooth_sandstone_slab[type=bottom]'); F(4, 20, 18, 6, 20, 20, C); S(5, 21, 19, CH); S(5, 22, 19, 'minecraft:lightning_rod')
  ;[[3, 17], [7, 17], [3, 21], [7, 21]].forEach(p => S(p[0], 20, p[1], SW))
  // toit : reservoir, mat de drapeau, antenne
  F(24, 13, 6, 25, 14, 7, 'minecraft:barrel[facing=up,open=false]'); S(20, 13, 5, 'minecraft:lightning_rod'); F(16, 13, 4, 16, 18, 4, DSF); F(17, 17, 4, 18, 18, 4, 'minecraft:red_wool'); S(18, 17, 4, AIR)
  S(12, 13, 18, 'minecraft:cauldron'); F(9, 13, 6, 10, 13, 6, 'minecraft:smooth_sandstone_slab[type=bottom]')
  // abords
  dsDalle(0, 26, 31, 31, [DSJ, 'minecraft:cut_sandstone', 'minecraft:sand', DSJ])
  dsPalmier(1, 27, 8); dsPalmier(30, 27, 7, true); dsCactus(30, 8, 2)
  S(8, 0, 28, 'minecraft:decorated_pot'); S(23, 0, 28, 'minecraft:decorated_pot'); bgBanc(13, 29, 'south', 2); bgBanc(17, 29, 'south', 2)
  dsCactus(1, 1, 2); dsCactus(30, 1, 3); dsCactus(30, 16, 2)
  dsVeg(0, 0, 31, 31, 0.3)
}

// ================= SOUK (marche couvert : echoppes peintes, velums, fontaine seche, porte monumentale) =================
function dsSouk() {
  DST = {}
  var C = 'minecraft:cut_sandstone', SS = 'minecraft:smooth_sandstone_stairs'
  dsSol(0, 0, 31, 31)
  dsDalle(1, 1, 30, 27, ['minecraft:packed_mud', DSJ, 'minecraft:sand', 'minecraft:packed_mud', 'minecraft:mud_bricks'])
  var murs = [DSAB, DSJ, 'minecraft:terracotta', 'minecraft:light_blue_terracotta', 'minecraft:orange_terracotta', DSAB, 'minecraft:white_terracotta', DSJ, 'minecraft:light_blue_terracotta', 'minecraft:terracotta', DSAB]
  var toiles = ['red', 'orange', 'yellow', 'white', 'green', 'red', 'blue', 'orange', 'yellow', 'white', 'red']
  // echoppe : (x1,z1,x2,z2) ouverte du cote f, marchandise selon t
  function echoppe(x1, z1, x2, z2, f, t, i) {
    var m = murs[i % murs.length]
    F(x1, 0, z1, x2, 0, z2, DSA)
    for (var y = 1; y <= 5; y++) for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) {
      var bord = x == x1 || x == x2 || z == z1 || z == z2; if (!bord) continue
      var ouvert = (f == 'south' && z == z2) || (f == 'north' && z == z1) || (f == 'east' && x == x2) || (f == 'west' && x == x1)
      if (ouvert && y <= 3 && !((x == x1 || x == x2) && (f == 'south' || f == 'north')) && !((z == z1 || z == z2) && (f == 'east' || f == 'west'))) continue
      S(x, y, z, dsM(m))
    }
    F(x1, 6, z1, x2, 6, z2, 'minecraft:packed_mud'); for (var x = x1; x <= x2; x++) { S(x, 7, z1, dsM(m)); S(x, 7, z2, dsM(m)) } for (var z = z1; z <= z2; z++) { S(x1, 7, z, dsM(m)); S(x2, 7, z, dsM(m)) }
    var aw = 'supplementaries:awning_' + toiles[i % toiles.length] + '[facing=' + f + ']'
    if (f == 'south') F(x1, 4, z2 + 1, x2, 4, z2 + 1, aw); else if (f == 'north') F(x1, 4, z1 - 1, x2, 4, z1 - 1, aw); else if (f == 'east') F(x2 + 1, 4, z1, x2 + 1, 4, z2, aw); else F(x1 - 1, 4, z1, x1 - 1, 4, z2, aw)
    // comptoir sur le devant, marchandise au fond
    var ix1 = x1 + 1, ix2 = x2 - 1, iz1 = z1 + 1, iz2 = z2 - 1
    function fond(b, n) { for (var k = 0; k < n; k++) { var x = ix1 + Math.floor(R() * (ix2 - ix1 + 1)), z = iz1 + Math.floor(R() * (iz2 - iz1 + 1)); var av = (f == 'south' && z == iz2) || (f == 'north' && z == iz1) || (f == 'east' && x == ix2) || (f == 'west' && x == ix1); if (!av) SA(x, 1, z, typeof b == 'string' ? b : choix(b)) } }
    if (f == 'south' || f == 'north') { var zc = f == 'south' ? iz2 : iz1; for (var x = ix1; x <= ix2; x++) if (R() > 0.25) S(x, 1, zc, 'minecraft:acacia_slab[type=top]') }
    else { var xc = f == 'east' ? ix2 : ix1; for (var z = iz1; z <= iz2; z++) if (R() > 0.25) S(xc, 1, z, 'minecraft:acacia_slab[type=top]') }
    if (t == 'poterie') fond(['minecraft:decorated_pot', 'minecraft:decorated_pot', 'minecraft:flower_pot', 'minecraft:potted_dead_bush'], 10)
    else if (t == 'epices') fond(['supplementaries:jar', 'supplementaries:sack', 'minecraft:barrel[facing=up,open=true]', 'minecraft:potted_red_mushroom'], 9)
    else if (t == 'tapis') { fond(['minecraft:red_wool', 'minecraft:orange_wool', 'minecraft:yellow_wool', 'minecraft:blue_wool'], 6); fond(['minecraft:red_carpet', 'minecraft:orange_carpet', 'minecraft:magenta_carpet'], 5) }
    else if (t == 'lampes') { fond(['minecraft:lantern[hanging=false]', 'minecraft:soul_lantern[hanging=false]', 'minecraft:chain[axis=y]'], 8) }
    else if (t == 'metal') fond(['minecraft:cauldron', 'minecraft:anvil[facing=north]', 'minecraft:chain[axis=x]', 'minecraft:iron_bars', 'minecraft:grindstone[face=floor,facing=north]'], 7)
    else if (t == 'vivres') fond(['farmersdelight:carrot_crate', 'farmersdelight:potato_crate', 'minecraft:melon', 'minecraft:pumpkin', 'minecraft:hay_block[axis=y]'], 8)
    else if (t == 'tissus') fond(['minecraft:white_wool', 'minecraft:light_blue_wool', 'minecraft:cyan_wool', 'minecraft:white_carpet'], 9)
    else fond(['supplementaries:sack', 'minecraft:chest[facing=north]', 'minecraft:barrel[facing=up,open=false]'], 6)
    S(Math.floor((x1 + x2) / 2), 5, Math.floor((z1 + z2) / 2), DSLH)
  }
  // rangee du fond (5 echoppes) et rangees laterales (3 + 3)
  var types = ['poterie', 'epices', 'tapis', 'lampes', 'metal', 'vivres', 'tissus', 'bazar', 'epices', 'poterie', 'tapis']
  ;[[1, 6], [7, 12], [13, 18], [19, 24], [25, 30]].forEach((p, i) => echoppe(p[0], 1, p[1], 7, 'south', types[i], i))
  ;[[10, 14], [15, 19], [20, 24]].forEach((p, i) => { echoppe(1, p[0], 6, p[1], 'east', types[5 + i], 5 + i); echoppe(25, p[0], 30, p[1], 'west', types[(8 + i) % 11], 8 + i) })
  // halle centrale : poteaux, velum raye dechire
  ;[9, 13, 18, 22].forEach(x => [10, 16, 22].forEach(z => F(x, 0, z, x, 5, z, DSL)))
  ;[10, 16, 22].forEach(z => F(9, 6, z, 22, 6, z, DSX)); ;[9, 13, 18, 22].forEach(x => { F(x, 6, 11, x, 6, 15, DSZ); F(x, 6, 17, x, 6, 21, DSZ) })
  var bandes = ['red', 'white', 'orange', 'white']
  for (var x = 9; x <= 22; x++) for (var z = 10; z <= 22; z++) { SA(x, 6, z, 'minecraft:' + bandes[Math.floor(x / 2) % 4] + '_wool') }
  ;[[11, 13], [20, 13], [11, 19], [20, 19]].forEach(p => { S(p[0], 5, p[1], DSLH); S(p[0], 6, p[1], 'minecraft:chain[axis=y]') })
  // fontaine seche octogonale
  F(14, 0, 14, 17, 0, 18, C); F(15, 0, 13, 16, 0, 19, C); F(13, 0, 15, 18, 0, 17, C)
  F(15, 0, 15, 16, 0, 17, 'minecraft:cyan_glazed_terracotta[facing=north]'); S(15, 1, 16, 'minecraft:sandstone_wall'); S(16, 1, 16, 'minecraft:sandstone_wall'); S(15, 2, 16, 'minecraft:smooth_sandstone_slab[type=bottom]'); S(16, 2, 16, 'minecraft:smooth_sandstone_slab[type=bottom]')
  ;[[14, 14], [17, 14], [14, 18], [17, 18], [13, 15], [18, 15], [13, 17], [18, 17], [15, 13], [16, 13], [15, 19], [16, 19], [13, 16], [18, 16]].forEach(p => S(p[0], 1, p[1], 'minecraft:smooth_sandstone_slab[type=bottom]'))
  S(16, 1, 15, 'minecraft:azalea_leaves[persistent=true]'); S(15, 1, 17, 'minecraft:light_gray_carpet')
  // etals libres, tapis au sol, charrette renversee
  ;[[10, 12], [20, 12], [10, 20], [16, 21]].forEach((p, i) => { S(p[0], 0, p[1], 'mcwfurnitures:acacia_table'); S(p[0] + 1, 0, p[1], 'mcwfurnitures:acacia_table'); S(p[0], 1, p[1], choix(['minecraft:decorated_pot', 'supplementaries:jar', 'minecraft:melon'])); S(p[0] + 1, 1, p[1], choix(['supplementaries:sack', 'minecraft:candle[candles=3,lit=false]', 'minecraft:flower_pot'])) })
  F(11, 0, 17, 12, 0, 19, 'minecraft:red_carpet'); F(19, 0, 16, 21, 0, 17, 'minecraft:orange_carpet'); S(11, 0, 18, 'minecraft:yellow_carpet')
  F(19, 0, 20, 21, 0, 21, 'minecraft:acacia_slab[type=bottom]'); S(19, 1, 20, 'minecraft:acacia_trapdoor[facing=west,half=bottom,open=true]'); S(22, 0, 19, 'supplementaries:sack'); S(21, 0, 19, 'minecraft:pumpkin')
  for (var i = 0; i < 18; i++) SA(8 + Math.floor(R() * 16), 0, 9 + Math.floor(R() * 15), choix(['minecraft:white_carpet', 'supplementaries:sack', 'minecraft:decorated_pot', 'minecraft:dead_bush', 'minecraft:light_gray_carpet']))
  // porte monumentale sur le boulevard (bab) : deux tours et arc
  ;[[8, 10], [21, 23]].forEach(t => { F(t[0], 0, 25, t[1], 9, 27, DSJ); F(t[0], 10, 25, t[1], 10, 27, C); ;[t[0], t[1]].forEach(x => [25, 27].forEach(z => S(x, 11, z, 'minecraft:sandstone_wall'))) })
  F(11, 6, 25, 20, 9, 27, DSJ); F(11, 10, 25, 20, 10, 27, C); for (var x = 12; x <= 19; x += 2) S(x, 11, 25, 'minecraft:sandstone_wall')
  ;[25, 26, 27].forEach(z => { S(11, 5, z, SS + '[facing=west,half=top,shape=straight]'); S(20, 5, z, SS + '[facing=east,half=top,shape=straight]'); S(12, 6, z, SS + '[facing=west,half=top,shape=straight]'); S(19, 6, z, SS + '[facing=east,half=top,shape=straight]') })
  F(13, 6, 25, 18, 6, 27, AIR)
  for (var x = 12; x <= 19; x++) [25, 27].forEach(z => S(x, 8, z, (x % 2) ? 'minecraft:light_blue_glazed_terracotta[facing=south]' : 'minecraft:white_glazed_terracotta[facing=south]'))
  ;[[9, 4], [22, 4]].forEach(p => { S(p[0], p[1] + 2, 27, GP); S(p[0], p[1] + 3, 27, GP) })
  S(15, 6, 26, DSLH); S(16, 6, 26, DSLH)
  // parvis : charrette, jarres, palmiers
  dsDalle(0, 28, 31, 31, [DSJ, 'minecraft:sand', 'minecraft:cut_sandstone'])
  F(3, 0, 29, 5, 0, 30, 'minecraft:acacia_slab[type=top]'); S(3, 1, 29, 'minecraft:hay_block[axis=y]'); S(4, 1, 30, 'supplementaries:sack'); S(2, 0, 29, 'minecraft:acacia_trapdoor[facing=west,half=bottom,open=true]'); S(6, 0, 30, 'minecraft:acacia_trapdoor[facing=east,half=bottom,open=true]')
  ;[25, 26, 28].forEach(x => S(x, 0, 30, 'minecraft:decorated_pot')); S(27, 0, 29, 'minecraft:flower_pot')
  dsPalmier(7, 30, 7); dsPalmier(24, 30, 8, true)
  dsCactus(31, 3, 2); dsCactus(0, 26, 3)
  dsVeg(0, 0, 31, 31, 0.25)
}

// ================= HABITAT EN GRADINS (pueblo : 4 maisons empilees en terrasses, echelles, toits-terrasses) =================
function dsPueblo() {
  DST = {}
  var B = DSAB, lits = ['red', 'orange', 'yellow', 'brown'], murs = [DSAB, 'minecraft:smooth_sandstone', DSAB, 'minecraft:terracotta']
  dsSol(0, 0, 31, 31)
  ;[2, 9, 16, 23].forEach((o, i) => {
    var m = murs[i]
    dsBloc(o, 6, o + 7, 25, 0, m, { toit: true, sans: ['north', 'east', 'west'] })
    dsBloc(o, 6, o + 7, 20, 6, m, { toit: true, sans: ['north', 'east', 'west'] })
    dsBloc(o, 6, o + 7, 14, 12, m, { toit: true, sans: ['north', 'east', 'west'] })
    if (i == 2) { dsBloc(o, 6, o + 7, 10, 18, m, { toit: true, sans: ['north', 'east', 'west'] }); PORTE(o + 1, 19, 10, DSP, 'south', 'left', 'false'); var c3 = cadre(o + 1, 7, o + 6, 9, 'north', 18); piece(c3, 'grenier', 1); dsFen(o + 4, o + 5, 20, 10, 'south', 2, 0) }
    // niveau 0 : sejour, cuisine, chambre
    F(o + 1, 1, 20, o + 6, 5, 20, m); F(o + 1, 1, 14, o + 6, 5, 14, m)
    var c = cadre(o + 1, 21, o + 6, 24, 'south', 0); piece(c, i % 2 ? 'salle' : 'salon', i == 1 ? 1 : 0); c.porte(DSP)
    c = cadre(o + 1, 15, o + 6, 19, 'south', 0); piece(c, 'cuisine', i % 2); c.porte(DSP)
    c = cadre(o + 1, 7, o + 6, 13, 'north', 0); piece(c, 'chambre', 0); S(o + 6, 1, 13, AIR)
    PORTE(o + 3, 1, 25, DSP, 'south', i % 2 ? 'right' : 'left', 'false'); S(o + 3, 0, 26, 'minecraft:mud_brick_stairs[facing=north,half=bottom,shape=straight]')
    dsFen(o + 5, o + 6, 2, 25, 'south', 2, i == 3 ? 2 : 0); dsFen(o + 1, o + 1, 2, 25, 'south', 2, 1)
    // niveau 1 : sejour et chambre
    F(o + 1, 7, 15, o + 6, 11, 15, m)
    c = cadre(o + 1, 16, o + 6, 19, 'south', 6); piece(c, 'salon', 1); c.porte(DSP)
    c = cadre(o + 1, 7, o + 6, 14, 'north', 6); piece(c, 'chambre', i % 2); S(o + 6, 7, 14, AIR)
    PORTE(o + 2, 7, 20, DSP, 'south', 'left', 'false'); dsFen(o + 4, o + 4, 8, 20, 'south', 2, i == 0 ? 1 : 3)
    // niveau 2
    c = cadre(o + 1, 7, o + 6, 13, 'north', 12); piece(c, i == 3 ? 'bureau' : 'salle', 0)
    PORTE(o + 1, 13, 14, DSP, 'south', 'left', 'false'); dsFen(o + 4, o + 4, 14, 14, 'south', 2, i == 1 ? 2 : 3)
    // echelles de pueblo entre terrasses (vers le niveau superieur)
    F(o + 5, 7, 21, o + 5, 12, 21, 'minecraft:ladder[facing=south]'); S(o + 5, 13, 20, AIR)
    F(o + 6, 13, 15, o + 6, 18, 15, 'minecraft:ladder[facing=south]'); S(o + 6, 19, 14, AIR)
    // terrasses : mobilier, jarres, linge, reservoirs
    S(o + 2, 7, 23, MAT('acacia_chair', 'south')); S(o + 3, 7, 23, 'mcwfurnitures:acacia_table'); S(o + 3, 8, 23, choix(['minecraft:candle[candles=2,lit=false]', 'minecraft:potted_dead_bush', 'supplementaries:jar']))
    S(o + 6, 7, 24, 'minecraft:decorated_pot'); S(o + 1, 7, 21, 'minecraft:potted_cactus')
    F(o + 1, 13, 17, o + 1, 14, 17, DSF); F(o + 4, 13, 17, o + 4, 14, 17, DSF); F(o + 2, 14, 17, o + 3, 14, 17, 'minecraft:chain[axis=x]'); S(o + 2, 13, 18, 'minecraft:white_carpet'); if (R() < 0.6) S(o + 3, 13, 19, 'minecraft:light_blue_carpet')
    S(o + 2, 19, 12, 'minecraft:barrel[facing=up,open=false]'); S(o + 2, 20, 12, 'minecraft:barrel[facing=up,open=false]'); S(o + 5, 19, 8, 'minecraft:lightning_rod')
    // four exterieur et petite cour fermee devant chaque maison
    F(o, 0, 27, o, 1, 31, m); F(o + 7, 0, 27, o + 7, 1, 31, m); F(o + 1, 0, 31, o + 6, 1, 31, m); F(o + 3, 0, 31, o + 4, 1, 31, AIR); S(o + 3, 0, 31, 'minecraft:acacia_fence_gate[facing=south,open=' + (i % 2 ? 'true' : 'false') + ',in_wall=false]')
    if (i % 2 == 0) { F(o + 5, 0, 28, o + 6, 1, 29, 'minecraft:packed_mud'); S(o + 5, 1, 28, AIR); S(o + 5, 0, 28, 'minecraft:campfire[lit=false,facing=west]'); S(o + 5, 2, 29, 'minecraft:mud_brick_slab[type=bottom]'); S(o + 6, 2, 28, 'minecraft:mud_brick_slab[type=bottom]'); dsLibre(o + 5, 28); dsLibre(o + 6, 29) }
    else { S(o + 1, 0, 28, 'minecraft:water_cauldron[level=1]'); S(o + 6, 0, 28, 'minecraft:decorated_pot'); S(o + 6, 0, 30, 'supplementaries:sack'); dsLibre(o + 1, 28); dsLibre(o + 6, 29) }
    dsPapiers(o + 1, 7, o + 6, 24, 1, 3)
  })
  // details : ristras (piments) et pots, antennes, linge entre maisons, voiture dans la cour
  S(19, 4, 26, 'minecraft:red_wall_banner[facing=south]'); S(5, 10, 21, 'minecraft:orange_wall_banner[facing=south]')
  bgVoiture(26, 28, 'x', 'light_blue', 1, true)
  dsLibre(26, 28); dsLibre(29, 29)
  dsPalmier(1, 2, 8); dsPalmier(30, 1, 7); dsOlivier(15, 2); dsAcacia(6, 1)
  dsCactus(0, 5, 2); dsCactus(0, 16, 2)
  dsVeg(0, 0, 31, 31, 0.3)
}


// ================= QUARTIER DU DESERT, RANGEE SUD (facades au nord, sur le boulevard) =================
function dsBanc(x, z, f, n) { // assise en marches d'acacia, dossier du cote f
  var ns = f == 'north' || f == 'south'
  for (var i = 0; i < n; i++) S(ns ? x + i : x, 0, ns ? z : z + i, 'minecraft:acacia_stairs[facing=' + f + ',half=bottom,shape=straight]')
  if (ns) { S(x - 1, 0, z, 'minecraft:acacia_trapdoor[facing=west,half=bottom,open=true]'); S(x + n, 0, z, 'minecraft:acacia_trapdoor[facing=east,half=bottom,open=true]') }
  else { S(x, 0, z - 1, 'minecraft:acacia_trapdoor[facing=north,half=bottom,open=true]'); S(x, 0, z + n, 'minecraft:acacia_trapdoor[facing=south,half=bottom,open=true]') }
}
function dsParasol(x, z, col) { F(x, 0, z, x, 2, z, DSF); F(x - 1, 3, z - 1, x + 1, 3, z + 1, 'minecraft:' + col + '_wool'); ;[[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(c => S(x + c[0], 3, z + c[1], AIR)); S(x, 4, z, 'minecraft:' + col + '_carpet') }
function dsBitume(x1, z1, x2, z2) { for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) { var r = R(); dsDalle(x, z, x, z, r < 0.84 ? 'minecraft:gray_concrete' : r < 0.9 ? 'minecraft:light_gray_concrete' : r < 0.95 ? 'minecraft:black_concrete' : 'minecraft:sand') } }
// Volume bas a toit plat (murs y1..h, plafond y h+1, couvertine en y h+2)
function dsBas(x1, z1, x2, z2, h, mur, bande, sol) {
  F(x1, 0, z1, x2, 0, z2, sol || 'minecraft:smooth_stone')
  for (var y = 1; y <= h + 1; y++) {
    var b = y == h + 1 ? bande : y == h && bande ? bande : mur
    for (var x = x1; x <= x2; x++) { S(x, y, z1, b); S(x, y, z2, b) }
    for (var z = z1 + 1; z < z2; z++) { S(x1, y, z, b); S(x2, y, z, b) }
  }
  F(x1 + 1, h + 1, z1 + 1, x2 - 1, h + 1, z2 - 1, 'minecraft:smooth_stone')
  for (var x = x1; x <= x2; x++) { S(x, h + 2, z1, 'minecraft:smooth_stone_slab[type=bottom]'); S(x, h + 2, z2, 'minecraft:smooth_stone_slab[type=bottom]') }
  for (var z = z1 + 1; z < z2; z++) { S(x1, h + 2, z, 'minecraft:smooth_stone_slab[type=bottom]'); S(x2, h + 2, z, 'minecraft:smooth_stone_slab[type=bottom]') }
}

// ================= MOTEL DE BORD DE ROUTE (deux ailes de chambres, coursive, piscine videe, accueil, caravane) =================
function dsMotel() {
  DST = {}
  var B = DSAB, T = 'minecraft:light_blue_terracotta', cols = ['white', 'light_blue', 'yellow', 'red', 'orange', 'cyan', 'pink', 'lime']
  dsSol(0, 0, 31, 31)
  dsBitume(9, 0, 31, 18)
  // aile ouest x2..8 z6..27 : 4 chambres, portes a l'est
  dsBas(2, 6, 8, 27, 4, B, T); ;[11, 16, 21].forEach(z => F(3, 1, z, 7, 4, z, B))
  ;[7, 12, 17, 22].forEach((za, i) => {
    var col = cols[i]
    for (var x = 3; x <= 7; x++) for (var z = za; z <= za + 3; z++) S(x, 0, z, (x + z) % 2 ? T : 'minecraft:white_terracotta')
    LIT(4, 1, za + 1, col, 'west'); LIT(4, 1, za + 2, col, 'west')
    S(3, 1, za, 'mcwfurnitures:acacia_end_table'); S(3, 2, za, 'minecraft:candle[candles=1,lit=false]'); S(3, 1, za + 3, 'mcwfurnitures:acacia_end_table'); S(3, 2, za + 3, 'minecraft:potted_dead_bush')
    S(7, 1, za + 1, MAT('acacia_drawer', 'west')); S(7, 2, za + 1, 'minecraft:black_stained_glass_pane')
    S(7, 1, za + 3, 'mcwfurnitures:acacia_kitchen_sink[facing=west,water=false]'); S(6, 1, za + 3, 'minecraft:water_cauldron[level=' + (i % 2 ? 1 : 0 + 1) + ']')
    if (i == 3) { S(5, 1, 26, 'minecraft:chest[facing=north]'); S(7, 1, 26, 'supplementaries:sack') }
    PORTE(8, 1, za, DSP, 'east', 'left', i == 1 ? 'true' : 'false'); dsFen(za + 1, za + 2, 2, 2, 'west', 2, i == 2 ? 2 : 3)
    S(5, 4, za + 1, DSLH); dsPapiers(3, za, 7, za + 3, 1, 2)
  })
  // aile du fond x9..29 z21..27 : 4 chambres, portes au nord
  dsBas(9, 21, 29, 27, 4, B, T); ;[14, 19, 24].forEach(x => F(x, 1, 22, x, 4, 26, B))
  ;[10, 15, 20, 25].forEach((xa, i) => {
    var col = cols[4 + i]
    for (var x = xa; x <= xa + 3; x++) for (var z = 22; z <= 26; z++) S(x, 0, z, (x + z) % 2 ? T : 'minecraft:white_terracotta')
    LIT(xa + 1, 1, 25, col, 'south'); LIT(xa + 2, 1, 25, col, 'south')
    S(xa, 1, 26, 'mcwfurnitures:acacia_end_table'); S(xa, 2, 26, 'minecraft:candle[candles=2,lit=false]'); S(xa + 3, 1, 26, 'mcwfurnitures:acacia_end_table')
    S(xa + 1, 1, 22, MAT('acacia_drawer', 'south')); S(xa + 1, 2, 22, 'minecraft:black_stained_glass_pane')
    S(xa + 3, 1, 22, 'mcwfurnitures:acacia_kitchen_sink[facing=south,water=false]'); S(xa + 3, 1, 23, 'minecraft:water_cauldron[level=1]')
    PORTE(xa, 1, 21, DSP, 'north', 'left', 'false'); dsFen(xa + 1, xa + 2, 2, 27, 'south', 2, i == 1 ? 1 : 3)
    S(xa + 1, 4, 24, DSLH); dsPapiers(xa, 22, xa + 3, 26, 1, 2)
  })
  // coursives couvertes
  F(9, 0, 6, 10, 0, 20, 'minecraft:smooth_stone'); F(9, 0, 19, 29, 0, 20, 'minecraft:smooth_stone')
  ;[6, 10, 14, 18].forEach(z => F(10, 1, z, 10, 4, z, 'minecraft:polished_blackstone_wall')); ;[12, 17, 22, 27].forEach(x => F(x, 1, 19, x, 4, 19, 'minecraft:polished_blackstone_wall'))
  F(9, 5, 6, 10, 5, 20, 'minecraft:smooth_stone'); F(11, 5, 19, 29, 5, 20, 'minecraft:smooth_stone'); for (var z = 6; z <= 18; z++) S(10, 6, z, 'minecraft:smooth_stone_slab[type=bottom]'); for (var x = 11; x <= 29; x++) S(x, 6, 19, 'minecraft:smooth_stone_slab[type=bottom]')
  ;[8, 16].forEach(z => S(9, 4, z, DSLH)); ;[13, 23].forEach(x => S(x, 4, 20, DSLH))
  S(9, 1, 20, 'minecraft:red_concrete'); S(9, 2, 20, 'minecraft:red_stained_glass'); S(11, 1, 20, 'minecraft:white_concrete'); S(11, 2, 20, 'minecraft:packed_ice'); S(10, 1, 13, MAT('acacia_chair', 'east'))
  // places de parking
  for (var z = 6; z <= 18; z += 3) F(11, -1, z, 14, -1, z, 'minecraft:white_concrete'); for (var x = 16; x <= 28; x += 3) F(x, -1, 15, x, -1, 18, 'minecraft:white_concrete')
  bgVoiture(11, 7, 'x', 'white', 1); bgVoiture(20, 15, 'z', 'red', 0); bgVoiture(26, 15, 'z', 'light_blue', 2)
  // piscine videe (bassin x18..25 z7..12), plage et cloture
  dsDalle(15, 4, 28, 14, DSJ)
  for (var x = 17; x <= 26; x++) for (var z = 6; z <= 13; z++) {
    var bord = x == 17 || x == 26 || z == 6 || z == 13, fond = x <= 20 ? -3 : -4
    if (bord) { S(x, -1, z, 'minecraft:smooth_stone'); F(x, -4, z, x, -2, z, 'minecraft:white_concrete') }
    else { F(x, fond + 1, z, x, -1, z, AIR); S(x, fond, z, 'minecraft:light_blue_concrete') }
  }
  F(24, -3, 7, 24, -1, 7, 'minecraft:ladder[facing=south]'); S(26, 0, 10, 'minecraft:smooth_stone'); S(25, 0, 10, 'minecraft:smooth_stone_slab[type=bottom]'); S(24, 0, 10, 'minecraft:smooth_stone_slab[type=bottom]')
  S(22, -3, 10, 'minecraft:sand'); S(23, -3, 10, 'minecraft:sand'); S(23, -3, 11, 'minecraft:sand'); S(22, -3, 8, 'minecraft:azalea_leaves[persistent=true]'); S(25, -3, 12, 'minecraft:moss_carpet'); S(24, -3, 12, 'minecraft:green_carpet'); S(19, -2, 9, 'minecraft:smooth_quartz_slab[type=bottom]'); S(21, -3, 11, 'minecraft:light_gray_carpet')
  for (var x = 15; x <= 28; x++) { S(x, 0, 4, 'minecraft:iron_bars'); S(x, 0, 14, 'minecraft:iron_bars') } for (var z = 5; z <= 13; z++) { S(15, 0, z, 'minecraft:iron_bars'); S(28, 0, z, 'minecraft:iron_bars') }
  S(15, 0, 9, AIR); S(15, 0, 10, AIR); S(21, 0, 4, AIR)
  ;[18, 20, 22].forEach(x => { S(x, 0, 5, 'minecraft:quartz_stairs[facing=north,half=bottom,shape=straight]') }); S(23, 0, 5, 'minecraft:smooth_quartz_slab[type=bottom]'); S(27, 0, 8, 'minecraft:white_carpet'); S(27, 0, 11, 'minecraft:white_carpet'); S(16, 0, 12, 'minecraft:decorated_pot'); S(27, 0, 13, 'supplementaries:sack')
  // accueil x1..8 z0..5 : baie vitree sur rue, comptoir, porte-cles, salon
  dsBas(1, 0, 8, 5, 4, B, T, 'minecraft:white_terracotta'); F(2, 1, 0, 7, 3, 0, GP); PORTE(8, 1, 3, DSV, 'east', 'left', 'false')
  F(5, 1, 1, 5, 1, 3, MAT('acacia_counter', 'east')); S(5, 2, 2, 'minecraft:black_stained_glass_pane'); S(5, 2, 1, 'supplementaries:jar'); ;[1, 2, 3].forEach(z => S(2, 3, z, 'minecraft:tripwire_hook[facing=east,attached=false,powered=false]'))
  S(3, 1, 2, MAT('acacia_chair', 'east')); S(2, 1, 4, 'minecraft:chiseled_bookshelf[facing=east]'); S(3, 1, 4, 'minecraft:chest[facing=north]'); F(6, 1, 4, 7, 1, 4, 'mcwfurnitures:red_couch[facing=north,shape=single]'); S(7, 1, 1, 'minecraft:potted_cactus'); S(6, 1, 2, 'mcwfurnitures:acacia_coffee_table')
  S(4, 4, 2, DSLH); dsPapiers(2, 1, 7, 4, 1, 4)
  // caravane abandonnee
  for (var u = 0; u < 8; u++) for (var v = 0; v < 3; v++) {
    var x = 22 + u, z = 0 + v; S(x, 0, z, 'minecraft:white_concrete')
    var bord = u == 0 || u == 7 || v == 0 || v == 2
    if (bord) { S(x, 1, z, (u == 2 || u == 5) && v != 1 ? 'minecraft:glass' : 'minecraft:light_blue_concrete'); S(x, 2, z, 'minecraft:white_concrete') }
    S(x, 3, z, 'minecraft:smooth_quartz_slab[type=bottom]')
  }
  PORTE(25, 1, 2, 'minecraft:iron_door', 'south', 'left', 'true'); LIT(27, 1, 1, 'white', 'east'); S(23, 1, 1, 'mcwfurnitures:acacia_table'); S(24, 1, 1, 'minecraft:smoker[facing=west,lit=false]')
  ;[24, 27].forEach(x => { S(x, 0, 3, 'minecraft:polished_blackstone_button[face=wall,facing=south]') }); S(21, 0, 1, 'minecraft:chain[axis=x]'); F(23, 2, 3, 27, 2, 3, 'minecraft:smooth_quartz_slab[type=top]')
  // arriere : benne, climatiseurs, linge
  F(12, 0, 29, 13, 1, 30, 'minecraft:green_terracotta'); F(12, 2, 29, 13, 2, 30, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false]'); dsLibre(12, 29); dsLibre(13, 30)
  ;[17, 22, 27].forEach(x => { S(x, 0, 28, 'minecraft:smooth_stone'); S(x, 1, 28, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false]'); dsLibre(x, 28) })
  F(4, 0, 29, 4, 2, 29, DSF); F(9, 0, 29, 9, 2, 29, DSF); F(5, 2, 29, 8, 2, 29, 'minecraft:chain[axis=x]'); dsLibre(4, 29); dsLibre(9, 29)
  S(30, 0, 25, 'minecraft:barrel[facing=up,open=false]')
  dsPalmier(10, 2, 8); dsPalmier(20, 2, 7, true); dsPalmier(30, 21, 8); dsPalmier(0, 30, 7)
  dsCactus(31, 29, 2); dsCactus(16, 30, 3)
  dsVeg(0, 0, 31, 31, 0.3)
}

// ================= STATION-SERVICE (auvent et pompes, superette, garage a deux baies, diner) =================
function dsStation() {
  DST = {}
  var WC = 'minecraft:white_concrete', RC = 'minecraft:red_concrete', LG = 'minecraft:light_gray_concrete'
  dsSol(0, 0, 31, 31)
  dsBitume(0, 0, 31, 13); dsBitume(18, 13, 18, 31)
  // auvent x3..16 z3..10
  ;[[4, 4], [15, 4], [4, 9], [15, 9]].forEach(p => F(p[0], 0, p[1], p[0], 4, p[1], WC))
  F(3, 5, 3, 16, 5, 10, WC); for (var x = 3; x <= 16; x++) { S(x, 5, 3, RC); S(x, 5, 10, RC); S(x, 6, 3, RC); S(x, 6, 10, RC) } for (var z = 4; z <= 9; z++) { S(3, 5, z, RC); S(16, 5, z, RC); S(3, 6, z, RC); S(16, 6, z, RC) }
  F(4, 6, 4, 15, 6, 9, 'minecraft:smooth_stone_slab[type=bottom]')
  ;[[6, 5], [9, 5], [12, 5], [6, 8], [9, 8], [12, 8]].forEach(p => S(p[0], 5, p[1], 'minecraft:white_stained_glass')); S(13, 5, 7, AIR); S(13, 6, 7, AIR); S(14, 5, 7, AIR)
  // ilot et pompes
  F(6, 0, 6, 13, 0, 7, 'minecraft:smooth_stone'); S(6, 1, 6, 'minecraft:yellow_concrete'); S(13, 1, 7, 'minecraft:yellow_concrete')
  ;[8, 11].forEach(px => { S(px, 1, 6, RC); S(px, 2, 6, WC); S(px, 3, 6, RC); S(px, 1, 7, RC); S(px, 2, 7, 'minecraft:black_concrete'); S(px + 1, 2, 6, 'minecraft:tripwire_hook[facing=east,attached=false,powered=false]') })
  S(11, 3, 6, AIR); S(12, 1, 7, 'minecraft:chain[axis=x]')
  bgVoiture(8, 8, 'x', 'light_blue', 1); bgVoiture(1, 11, 'x', 'white', 2)
  F(1, 0, 1, 1, 2, 1, 'minecraft:polished_blackstone_wall'); S(1, 3, 1, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false]'); S(2, 1, 1, 'minecraft:chain[axis=x]')
  // superette x19..30 z2..12
  dsBas(19, 2, 30, 12, 4, WC, RC)
  for (var x = 20; x <= 29; x++) for (var z = 3; z <= 11; z++) S(x, 0, z, (x + z) % 2 ? WC : LG)
  F(20, 1, 2, 29, 3, 2, GP); PORTE(24, 1, 2, DSV, 'north', 'left', 'true'); PORTE(25, 1, 2, DSV, 'north', 'right', 'false'); F(24, 3, 2, 25, 3, 2, GP)
  F(19, 1, 4, 19, 3, 7, GP)
  F(22, 1, 5, 22, 2, 9, 'minecraft:chiseled_bookshelf[facing=west]'); F(23, 1, 5, 23, 2, 9, 'minecraft:chiseled_bookshelf[facing=east]'); F(26, 1, 5, 26, 2, 9, 'minecraft:chiseled_bookshelf[facing=west]'); F(27, 1, 6, 27, 2, 9, 'minecraft:chiseled_bookshelf[facing=east]')
  S(27, 1, 5, 'minecraft:chiseled_bookshelf[facing=east]'); S(27, 2, 5, AIR); S(28, 1, 6, 'minecraft:chiseled_bookshelf[facing=north]')
  F(20, 1, 11, 29, 2, 11, 'minecraft:light_blue_stained_glass'); F(20, 3, 11, 29, 3, 11, WC); PORTE(24, 1, 11, DSP, 'south', 'left', 'true')
  F(28, 1, 3, 29, 1, 3, MAT('acacia_counter', 'south')); S(28, 2, 3, 'minecraft:black_stained_glass_pane'); S(29, 1, 4, MAT('acacia_counter', 'west')); S(29, 2, 4, 'supplementaries:jar')
  S(20, 1, 3, 'minecraft:brewing_stand'); S(21, 1, 3, 'minecraft:blue_stained_glass'); S(20, 1, 9, 'minecraft:iron_block'); S(20, 2, 9, 'minecraft:stone_button[face=wall,facing=east]'.replace('face=wall,facing=east', 'face=floor,facing=east'))
  ;[[24, 7], [21, 7], [25, 4], [28, 9]].forEach(p => S(p[0], 1, p[1], choix(['supplementaries:sack', 'minecraft:light_gray_carpet', 'minecraft:white_carpet'])))
  ;[[22, 4], [26, 4], [22, 10], [26, 10]].forEach(p => S(p[0], 5, p[1], 'minecraft:white_stained_glass'))
  F(22, 6, 5, 23, 6, 6, 'minecraft:smooth_stone'); F(22, 7, 5, 23, 7, 6, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false]'); S(27, 6, 9, 'minecraft:lightning_rod'); dsPapiers(20, 3, 29, 10, 1, 6)
  // garage x3..17 z14..27 : baie ouverte (pont elevateur), baie fermee (fosse), etabli
  dsBas(3, 14, 17, 27, 6, DSJ, 'minecraft:cut_sandstone')
  for (var x = 4; x <= 16; x++) for (var z = 15; z <= 26; z++) if (R() < 0.08) S(x, 0, z, 'minecraft:black_concrete')
  F(5, 1, 14, 8, 4, 14, AIR); F(11, 1, 14, 14, 4, 14, 'minecraft:iron_trapdoor[facing=south,half=bottom,open=true]'); S(12, 3, 14, AIR); S(12, 4, 14, AIR)
  ;[[5, 17], [8, 17], [5, 20], [8, 20]].forEach(p => F(p[0], 1, p[1], p[0], 2, p[1], 'minecraft:yellow_concrete')); F(6, 2, 17, 7, 2, 20, 'minecraft:iron_trapdoor[facing=north,half=top,open=false]')
  OY += 2; bgVoiture(6, 17, 'z', 'orange', 1, true); OY -= 2
  F(12, -2, 17, 13, -1, 22, AIR); F(11, -2, 17, 11, -1, 22, 'minecraft:smooth_stone'); F(14, -2, 17, 14, -1, 22, 'minecraft:smooth_stone'); F(12, -3, 17, 13, -3, 22, 'minecraft:smooth_stone'); F(12, -2, 16, 13, -1, 16, 'minecraft:smooth_stone'); F(12, -2, 23, 13, -1, 23, 'minecraft:smooth_stone')
  F(12, -2, 22, 12, -1, 22, 'minecraft:ladder[facing=north]')
  F(13, 3, 24, 13, 6, 24, 'minecraft:chain[axis=y]'); S(13, 2, 24, 'minecraft:iron_block'); S(13, 1, 24, 'minecraft:piston[facing=up,extended=false]')
  S(4, 1, 26, 'minecraft:smithing_table'); S(5, 1, 26, 'minecraft:grindstone[face=floor,facing=north]'); S(6, 1, 26, 'minecraft:anvil[facing=east]'); S(7, 1, 26, 'minecraft:crafting_table'); S(8, 1, 26, 'minecraft:chest[facing=north]'); S(9, 1, 26, 'minecraft:stonecutter[facing=north]')
  F(4, 3, 26, 9, 4, 26, 'minecraft:iron_bars'); S(10, 1, 26, 'minecraft:barrel[facing=up,open=false]'); S(16, 1, 15, 'minecraft:black_concrete'); S(16, 2, 15, 'minecraft:black_concrete'); S(16, 3, 15, 'minecraft:black_concrete'); S(16, 1, 16, 'minecraft:black_concrete'); S(16, 2, 16, 'minecraft:black_concrete')
  S(16, 1, 18, RC); S(16, 2, 18, RC); S(16, 1, 19, 'minecraft:blue_concrete'); S(15, 1, 19, RC); S(16, 1, 21, 'minecraft:cauldron')
  S(15, 1, 25, 'mcwfurnitures:acacia_table'); S(15, 1, 24, MAT('acacia_chair', 'south')); S(15, 2, 25, 'supplementaries:book_pile'); S(16, 1, 26, 'minecraft:chest[facing=west]')
  ;[[6, 22], [12, 19]].forEach(p => S(p[0], 6, p[1], DSLH)); dsFen(17, 18, 3, 17, 'east', 2, 3); dsFen(20, 21, 3, 17, 'east', 2, 2); dsFen(6, 8, 3, 27, 'south', 2, 1)
  PORTE(16, 1, 27, 'minecraft:iron_door', 'south', 'left', 'false')
  // diner x19..30 z15..28
  dsBas(19, 15, 30, 28, 4, LG, RC)
  for (var x = 20; x <= 29; x++) for (var z = 16; z <= 27; z++) S(x, 0, z, (x + z) % 2 ? WC : 'minecraft:black_concrete')
  for (var z = 16; z <= 27; z++) { S(19, 2, z, GP); S(19, 3, z, GP) } for (var x = 20; x <= 29; x++) { S(x, 2, 15, GP); S(x, 3, 15, GP) }
  ;[17, 21, 25].forEach(z => { S(19, 2, z, LG); S(19, 3, z, LG) }); 
  PORTE(23, 1, 15, DSV, 'north', 'left', 'false'); S(23, 3, 15, GP)
  ;[16, 20, 24].forEach(zb => [20, 21].forEach(x => { S(x, 1, zb, 'mcwfurnitures:red_couch[facing=south,shape=single]'); S(x, 1, zb + 1, 'mcwfurnitures:acacia_table'); S(x, 1, zb + 2, 'mcwfurnitures:red_couch[facing=north,shape=single]') }))
  S(20, 2, 17, 'minecraft:candle[candles=1,lit=false]'); S(21, 2, 21, 'supplementaries:jar'); S(20, 2, 25, 'minecraft:white_carpet')
  F(26, 1, 17, 26, 1, 25, MAT('acacia_counter', 'west')); ;[17, 19, 21, 23, 25].forEach(z => S(25, 1, z, 'mcwfurnitures:acacia_stool_chair'))
  S(26, 2, 18, 'minecraft:cake[bites=2]'); S(26, 2, 20, 'minecraft:brewing_stand'); S(26, 2, 23, 'minecraft:cake'); S(26, 2, 25, 'minecraft:white_carpet')
  F(29, 1, 17, 29, 1, 19, 'farmersdelight:stove[facing=west,lit=false]'); S(29, 2, 17, 'farmersdelight:cooking_pot'); S(29, 1, 20, 'minecraft:smoker[facing=west,lit=false]'); S(29, 1, 21, 'mcwfurnitures:acacia_kitchen_sink[facing=west,water=false]'); F(29, 1, 22, 29, 2, 23, WC); S(29, 1, 24, MAT('acacia_counter', 'west')); S(29, 2, 24, 'farmersdelight:cutting_board[facing=west]')
  F(27, 1, 26, 29, 4, 26, LG); PORTE(28, 1, 26, DSP, 'north', 'left', 'false'); S(28, 1, 27, 'minecraft:water_cauldron[level=1]'); S(23, 1, 27, 'minecraft:jukebox'); S(22, 1, 27, 'minecraft:potted_cactus')
  ;[[21, 19], [21, 23], [24, 21], [28, 20]].forEach(p => S(p[0], 4, p[1], DSLH)); dsPapiers(22, 16, 25, 27, 1, 5)
  // abords : pneus, bidons, bornes, palmiers
  S(18, 0, 14, 'minecraft:black_concrete'); S(18, 1, 14, 'minecraft:black_concrete'); S(1, 0, 13, 'minecraft:barrel[facing=up,open=false]'); S(2, 0, 13, RC)
  F(1, 0, 15, 1, 0, 26, 'minecraft:yellow_concrete'); dsLibre(1, 20)
  dsPalmier(1, 29, 8); dsPalmier(31, 30, 7, true); dsCactus(10, 30, 2); dsCactus(0, 6, 3)
  dsVeg(0, 0, 31, 31, 0.3)
}

// ================= BUREAU DU SHERIF ET TRIBUNAL (porche a trottoir de planches, cellules, salle d'audience, cour fermee) =================
function dsSherif() {
  DST = {}
  var B = DSAB, DO = 'minecraft:dark_oak_planks', C = 'minecraft:cut_sandstone', CH = 'minecraft:chiseled_sandstone', SS = 'minecraft:smooth_sandstone_stairs'
  dsSol(0, 0, 31, 31)
  // ---- bureau du sherif x2..14 z4..20 ----
  dsBloc(2, 4, 14, 20, 0, B, { toit: true, sans: ['north'] })
  F(2, 8, 4, 14, 8, 4, B); F(4, 9, 4, 12, 9, 4, B); F(6, 10, 4, 10, 10, 4, B); S(8, 11, 4, B)
  ;[[2, 9], [14, 9], [4, 10], [12, 10], [6, 11], [10, 11], [8, 12]].forEach(p => S(p[0], p[1], 4, 'minecraft:mud_brick_slab[type=bottom]'))
  S(8, 9, 3, 'minecraft:gold_block'); S(7, 9, 3, 'minecraft:yellow_terracotta'); S(9, 9, 3, 'minecraft:yellow_terracotta'); S(8, 10, 3, 'minecraft:yellow_terracotta'); S(8, 8, 3, 'minecraft:yellow_terracotta')
  F(1, 0, 1, 15, 0, 3, DSA); ;[1, 5, 11, 15].forEach(x => F(x, 1, 1, x, 4, 1, DSL)); F(1, 5, 0, 15, 5, 3, 'minecraft:acacia_slab[type=bottom]')
  F(2, 1, 1, 4, 1, 1, DSF); F(12, 1, 1, 14, 1, 1, DSF); F(6, 0, 0, 10, 0, 0, 'minecraft:acacia_stairs[facing=south,half=bottom,shape=straight]'); S(4, 4, 2, DSLH); S(12, 4, 2, DSLH)
  S(3, 1, 3, 'minecraft:acacia_stairs[facing=north,half=bottom,shape=straight]'); S(13, 1, 3, 'minecraft:barrel[facing=up,open=false]'); S(13, 1, 2, 'minecraft:water_cauldron[level=1]')
  PORTE(8, 1, 4, DSP, 'north', 'left', 'false'); dsFen(4, 5, 2, 4, 'north', 2, 1); dsFen(11, 12, 2, 4, 'north', 2, 1)
  // bureau
  S(4, 1, 7, 'mcwfurnitures:acacia_table'); S(4, 1, 8, MAT('acacia_chair', 'north')); S(4, 2, 7, 'supplementaries:book_pile'); S(11, 1, 8, 'mcwfurnitures:acacia_table'); S(12, 1, 8, MAT('acacia_chair', 'west')); S(11, 2, 8, 'minecraft:candle[candles=1,lit=false]')
  S(3, 2, 10, 'supplementaries:notice_board[facing=east]'); S(3, 2, 11, 'supplementaries:notice_board[facing=east]'); F(13, 1, 5, 13, 3, 6, 'minecraft:iron_bars'); S(13, 1, 10, 'minecraft:iron_block'); S(13, 1, 11, 'minecraft:chest[facing=west]')
  S(7, 1, 10, 'minecraft:blast_furnace[facing=north,lit=false]'); F(7, 2, 10, 7, 7, 10, 'minecraft:iron_bars'); S(9, 1, 6, MAT('acacia_chair', 'north')); S(6, 1, 6, 'minecraft:barrel[facing=up,open=true]')
  S(8, 5, 8, DSLH); dsPapiers(3, 5, 13, 11, 1, 8)
  // cellules
  F(3, 1, 12, 13, 5, 12, B); PORTE(8, 1, 12, 'minecraft:iron_door', 'south', 'left', 'false')
  F(3, 1, 15, 13, 4, 15, 'minecraft:iron_bars'); F(7, 1, 16, 7, 4, 19, 'minecraft:iron_bars'); F(11, 1, 16, 11, 4, 19, 'minecraft:iron_bars')
  PORTE(5, 1, 15, 'minecraft:iron_door', 'north', 'left', 'true'); PORTE(9, 1, 15, 'minecraft:iron_door', 'north', 'left', 'false'); PORTE(12, 1, 15, 'minecraft:iron_door', 'north', 'right', 'false')
  LIT(3, 1, 18, 'gray', 'north'); LIT(8, 1, 18, 'gray', 'north'); LIT(13, 1, 18, 'gray', 'north'); S(6, 1, 19, 'minecraft:cauldron'); S(10, 1, 19, 'minecraft:cauldron'); S(12, 1, 19, 'supplementaries:sack')
  dsFen(4, 4, 3, 20, 'south', 1, 1); dsFen(12, 12, 3, 20, 'south', 1, 1); F(9, 1, 20, 9, 2, 20, AIR); S(9, 0, 21, 'minecraft:mud_brick_slab[type=bottom]'); S(10, 0, 22, 'minecraft:packed_mud')
  S(5, 1, 13, 'minecraft:barrel[facing=up,open=false]'); S(10, 1, 14, MAT('acacia_chair', 'south')); S(8, 4, 13, DSLH); S(5, 4, 17, DSLH)
  // ---- tribunal x17..30 z3..26 : portique a 5 colonnes, fronton, salle d'audience ----
  F(17, 0, 3, 30, 0, 26, DSJ); F(17, 1, 4, 30, 1, 26, DSJ); F(18, 0, 2, 29, 0, 2, SS + '[facing=south,half=bottom,shape=straight]'); F(18, 1, 3, 29, 1, 3, SS + '[facing=south,half=bottom,shape=straight]')
  for (var y = 2; y <= 11; y++) { for (var x = 17; x <= 30; x++) { S(x, y, 8, dsM(DSJ)); S(x, y, 26, dsM(DSJ)) } for (var z = 9; z <= 25; z++) { S(17, y, z, dsM(DSJ)); S(30, y, z, dsM(DSJ)) } }
  ;[[17, 8], [30, 8], [17, 26], [30, 26]].forEach(p => F(p[0], 2, p[1], p[0], 12, p[1], C))
  F(18, 12, 9, 29, 12, 25, 'minecraft:smooth_stone'); for (var x = 17; x <= 30; x++) { S(x, 12, 8, C); S(x, 12, 26, C); S(x, 13, 26, 'minecraft:smooth_sandstone_slab[type=bottom]') } for (var z = 9; z <= 25; z++) { S(17, 12, z, C); S(30, 12, z, C); S(17, 13, z, 'minecraft:smooth_sandstone_slab[type=bottom]'); S(30, 13, z, 'minecraft:smooth_sandstone_slab[type=bottom]') }
  ;[18, 21, 24, 27, 30].forEach((x, i) => { var xx = i == 4 ? 29 : x; S(xx, 2, 5, CH); F(xx, 3, 5, xx, 8, 5, 'minecraft:quartz_pillar[axis=y]'); S(xx, 9, 5, CH) })
  F(17, 10, 4, 30, 10, 7, DSJ); F(17, 11, 4, 30, 11, 4, C); F(18, 4, 4, 18, 9, 4, AIR)
  ;[[11, 17, 30], [12, 19, 28], [13, 21, 26], [14, 23, 24]].forEach(p => F(p[1], p[0], 4, p[2], p[0], 4, p[0] == 11 ? C : DSJ)); S(23, 15, 4, 'minecraft:smooth_sandstone_slab[type=bottom]'); S(24, 15, 4, 'minecraft:smooth_sandstone_slab[type=bottom]'); S(24, 12, 3, 'supplementaries:clock_block[facing=north]'.replace('clock_block[facing=north]', 'clock_block[facing=north]'))
  F(17, 11, 5, 30, 11, 7, 'minecraft:smooth_stone'); F(18, 2, 4, 29, 2, 4, AIR)
  PORTE(23, 2, 8, DO.replace('minecraft:dark_oak_planks', 'mcwdoors:dark_oak_classic_door'), 'north', 'left', 'false'); PORTE(24, 2, 8, 'mcwdoors:dark_oak_classic_door', 'north', 'right', 'false'); F(23, 4, 8, 24, 4, 8, GP)
  ;[11, 15, 19, 23].forEach(z => { dsFen(z, z, 4, 17, 'west', 4, z == 15 ? 2 : 3); dsFen(z, z, 4, 30, 'east', 4, z == 19 ? 2 : 3) })
  // salle d'audience
  for (var x = 18; x <= 29; x++) for (var z = 9; z <= 25; z++) S(x, 1, z, (x + z) % 2 ? DO : 'minecraft:spruce_planks')
  F(19, 2, 22, 28, 2, 25, DO); F(21, 3, 22, 27, 3, 22, DO); F(23, 3, 23, 25, 3, 23, 'mcwfurnitures:dark_oak_table'); S(24, 3, 24, MAT('dark_oak_chair', 'north')); S(24, 4, 23, 'supplementaries:book_pile'); S(23, 4, 23, 'minecraft:bell[attachment=floor,facing=north]')
  S(21, 3, 25, 'minecraft:red_banner'); S(27, 3, 25, 'minecraft:blue_banner'); S(24, 7, 26, 'supplementaries:clock_block[facing=north]')
  F(19, 3, 20, 20, 3, 21, 'minecraft:dark_oak_fence'); S(19, 2, 20, DO); S(20, 2, 20, DO); S(19, 2, 21, DO); S(20, 2, 21, DO); S(19, 3, 21, AIR); S(20, 3, 21, AIR); S(19, 3, 21, MAT('dark_oak_chair', 'east'))
  F(18, 2, 11, 18, 2, 18, DO); for (var z = 11; z <= 18; z++) { if (R() > 0.12) S(18, 3, z, MAT('dark_oak_chair', 'east')); if (R() > 0.12) S(19, 2, z, MAT('dark_oak_chair', 'east')) } F(20, 2, 11, 20, 2, 18, 'minecraft:dark_oak_fence')
  F(22, 2, 18, 23, 2, 18, 'mcwfurnitures:dark_oak_table'); F(22, 2, 17, 23, 2, 17, MAT('dark_oak_chair', 'south')); F(26, 2, 18, 27, 2, 18, 'mcwfurnitures:dark_oak_table'); F(26, 2, 17, 27, 2, 17, MAT('dark_oak_chair', 'south')); S(22, 3, 18, 'supplementaries:book_pile'); S(27, 3, 18, 'supplementaries:book_pile')
  for (var x = 21; x <= 28; x++) if (x != 24) S(x, 2, 16, 'minecraft:dark_oak_fence')
  ;[10, 12, 14].forEach(z => { for (var x = 21; x <= 28; x++) if (x != 24 && R() > 0.1) S(x, 2, z, 'minecraft:dark_oak_stairs[facing=north,half=bottom,shape=straight]') })
  S(24, 11, 13, 'mcwlights:iron_chandelier'); S(24, 11, 20, 'mcwlights:iron_chandelier'); dsPapiers(18, 9, 29, 21, 2, 9)
  // cour fermee arriere (vehicule de patrouille, groupe electrogene, fil barbele)
  W(1, 22, 15, 31, 0, 2, 'minecraft:mud_bricks'); for (var x = 1; x <= 15; x++) S(x, 3, 31, 'minecraft:cobweb'); for (var z = 23; z <= 30; z++) { S(1, 3, z, 'minecraft:cobweb'); S(15, 3, z, 'minecraft:cobweb') }
  F(7, 0, 31, 9, 2, 31, AIR); S(7, 0, 31, 'minecraft:iron_bars'); S(9, 0, 31, 'minecraft:iron_bars'); dsBitume(2, 23, 14, 30); S(7, 0, 22, AIR); S(8, 0, 22, AIR)
  bgVoiture(4, 24, 'z', 'black', 1); S(12, 0, 24, 'minecraft:iron_block'); S(12, 1, 24, 'minecraft:lever[face=floor,facing=north,powered=false]'); S(13, 0, 24, 'minecraft:barrel[facing=up,open=false]'); S(13, 0, 28, 'minecraft:water_cauldron[level=1]'); S(10, 0, 29, 'supplementaries:sack')
  // abords
  dsDalle(16, 0, 16, 31, ['minecraft:packed_mud', 'minecraft:sand']); F(31, 0, 0, 31, 0, 31, AIR)
  dsPalmier(16, 1, 7, true); dsCactus(0, 3, 2); dsCactus(31, 28, 3); dsCactus(0, 21, 2)
  dsVeg(0, 0, 31, 31, 0.3)
}

// ================= OASIS (bassin presque asseche, palmeraie, treille, chateau d'eau, theatre de plein air, serre aux cactus) =================
function dsOasis() {
  DST = {}
  var WCu = 'minecraft:waxed_weathered_cut_copper', OCu = 'minecraft:waxed_oxidized_cut_copper'
  dsSol(0, 0, 31, 31)
  // bassin x6..19 z8..21
  var cx = 12.5, cz = 14.5, eau = {}
  for (var x = 6; x <= 19; x++) for (var z = 8; z <= 21; z++) {
    var e = Math.pow((x - cx) / 6.6, 2) + Math.pow((z - cz) / 6.6, 2); if (e > 1) continue
    if (e > 0.72) { S(x, -1, z, R() < 0.7 ? 'minecraft:mud' : 'minecraft:packed_mud'); delete DST[x + ',' + z]; if (R() < 0.15) S(x, 0, z, 'minecraft:dead_bush') }
    else if (e > 0.3) { S(x, -1, z, AIR); S(x, -2, z, R() < 0.6 ? 'minecraft:mud' : 'minecraft:clay'); delete DST[x + ',' + z] }
    else { S(x, -1, z, AIR); S(x, -2, z, 'minecraft:water'); S(x, -3, z, 'minecraft:clay'); eau[x + ',' + z] = 1; delete DST[x + ',' + z]; if (R() < 0.2) S(x, -1, z, 'minecraft:lily_pad') }
  }
  for (var x = 6; x <= 19; x++) for (var z = 8; z <= 21; z++) {
    if (eau[x + ',' + z]) continue
    var e = Math.pow((x - cx) / 6.6, 2) + Math.pow((z - cz) / 6.6, 2); if (e > 0.72 || e <= 0.3) continue
    if ((eau[(x + 1) + ',' + z] || eau[(x - 1) + ',' + z] || eau[x + ',' + (z + 1)] || eau[x + ',' + (z - 1)]) && R() < 0.55) { S(x, -2, z, 'minecraft:mud'); S(x, -1, z, 'minecraft:sugar_cane'); if (R() < 0.6) S(x, 0, z, 'minecraft:sugar_cane') }
  }
  // allees
  dsDalle(10, 0, 11, 6, ['minecraft:mud_bricks', 'minecraft:packed_mud']); dsDalle(4, 7, 4, 22, ['minecraft:mud_bricks', 'minecraft:packed_mud']); dsDalle(5, 22, 20, 23, ['minecraft:mud_bricks', 'minecraft:packed_mud']); dsDalle(20, 7, 21, 22, ['minecraft:mud_bricks', 'minecraft:packed_mud']); dsDalle(5, 6, 21, 7, ['minecraft:mud_bricks', 'minecraft:packed_mud'])
  dsBanc(8, 7, 'north', 3); dsBanc(14, 7, 'north', 3); dsBanc(20, 12, 'east', 3); dsBanc(9, 23, 'south', 3)
  ;[[5, 6], [21, 6], [5, 23], [21, 23]].forEach(p => { S(p[0], 0, p[1], 'minecraft:mud_brick_wall'); F(p[0], 1, p[1], p[0], 2, p[1], DSF); S(p[0], 3, p[1], 'minecraft:lantern[hanging=false]') })
  // palmeraie
  dsPalmier(3, 3, 9); dsPalmier(17, 3, 8); dsPalmier(1, 12, 7, true); dsPalmier(23, 9, 8); dsPalmier(19, 20, 8); dsPalmier(7, 19, 7)
  // treille x23..29 z0..6 : poteaux, chevrons, vigne sechee, table
  ;[23, 26, 29].forEach(x => [0, 3, 6].forEach(z => F(x, 0, z, x, 3, z, DSL))); ;[0, 3, 6].forEach(z => F(23, 4, z, 29, 4, z, DSX)); ;[24, 26, 28].forEach(x => F(x, 5, 0, x, 5, 6, DSZ))
  for (var x = 24; x <= 28; x += 2) for (var z = 1; z <= 5; z++) if (z != 3 && R() < 0.5) S(x, 4, z, 'minecraft:vine[up=true]')
  S(25, 0, 2, 'mcwfurnitures:acacia_table'); S(27, 0, 2, 'mcwfurnitures:acacia_table'); S(25, 0, 1, MAT('acacia_chair', 'south')); S(27, 0, 4, MAT('acacia_chair', 'north')); S(28, 0, 2, MAT('acacia_chair', 'west')); S(25, 1, 2, 'minecraft:decorated_pot'); S(27, 1, 2, 'minecraft:candle[candles=2,lit=false]')
  dsDalle(23, 0, 29, 6, ['minecraft:mud_bricks', DSJ, 'minecraft:packed_mud'])
  // serre aux cactus en ruine x23..30 z11..16
  F(23, 0, 11, 30, 0, 16, 'minecraft:smooth_stone')
  for (var y = 1; y <= 3; y++) { for (var x = 23; x <= 30; x++) { S(x, y, 11, GP); S(x, y, 16, GP) } for (var z = 12; z <= 15; z++) { S(23, y, z, GP); S(30, y, z, GP) } }
  ;[[23, 11], [30, 11], [23, 16], [30, 16], [26, 11], [27, 16]].forEach(p => F(p[0], 1, p[1], p[0], 3, p[1], 'minecraft:polished_blackstone_wall'))
  F(23, 4, 11, 30, 4, 16, 'minecraft:glass'); PORTE(23, 1, 13, DSV, 'west', 'left', 'true')
  F(25, 0, 14, 28, 0, 14, 'minecraft:sand'); S(25, 1, 14, 'minecraft:cactus'); S(25, 2, 14, 'minecraft:cactus'); S(28, 1, 14, 'minecraft:cactus'); S(26, 1, 14, 'minecraft:dead_bush'); S(27, 1, 14, 'minecraft:dead_bush')
  ;[24, 27, 29].forEach(x => S(x, 1, 12, choix(['minecraft:potted_cactus', 'minecraft:potted_dead_bush', 'minecraft:flower_pot']))); ;[24, 26, 29].forEach(x => S(x, 1, 15, choix(['minecraft:potted_cactus', 'minecraft:potted_dead_bush'])))
  // chateau d'eau x23..29 z18..24
  ;[[24, 19], [28, 19], [24, 23], [28, 23]].forEach(p => F(p[0], 0, p[1], p[0], 13, p[1], DSL))
  ;[5, 10].forEach(y => { F(25, y, 19, 27, y, 19, DSF); F(25, y, 23, 27, y, 23, DSF); F(24, y, 20, 24, y, 22, DSF); F(28, y, 20, 28, y, 22, DSF) })
  F(23, 14, 18, 29, 14, 24, 'minecraft:acacia_slab[type=top]'); for (var x = 23; x <= 29; x++) { S(x, 15, 18, DSF); S(x, 15, 24, DSF) } for (var z = 19; z <= 23; z++) { S(23, 15, z, DSF); S(29, 15, z, DSF) }
  for (var y = 15; y <= 21; y++) for (var dx = -3; dx <= 3; dx++) for (var dz = -3; dz <= 3; dz++) {
    var d2 = dx * dx + dz * dz; if (d2 > 7.5) continue
    if (y == 15 || d2 >= 3.5) S(26 + dx, y, 21 + dz, (y == 15 || y == 18 || y == 21) ? OCu : WCu)
  }
  for (var dx = -3; dx <= 3; dx++) for (var dz = -3; dz <= 3; dz++) { var d2 = dx * dx + dz * dz; if (d2 <= 7.5) S(26 + dx, 22, 21 + dz, d2 <= 3.5 ? WCu : 'minecraft:waxed_weathered_cut_copper_slab[type=bottom]'); if (d2 <= 1.5) S(26 + dx, 23, 21 + dz, d2 == 0 ? WCu : 'minecraft:waxed_weathered_cut_copper_slab[type=bottom]') }
  S(26, 24, 21, 'minecraft:lightning_rod'); F(26, 0, 21, 26, 13, 21, 'minecraft:waxed_weathered_copper'); S(27, 0, 22, 'minecraft:water_cauldron[level=1]')
  S(24, 14, 19, DSA); F(23, 0, 19, 23, 14, 19, 'minecraft:ladder[facing=west]'); S(23, 15, 19, AIR)
  dsDalle(22, 17, 30, 25, ['minecraft:packed_mud', 'minecraft:coarse_dirt', 'minecraft:sand'])
  // theatre de plein air x1..18 z24..31 : scene a l'ouest, gradins vers l'est
  F(2, 0, 25, 6, 0, 30, DSA); F(1, 0, 24, 1, 6, 31, 'minecraft:mud_bricks'); for (var z = 25; z <= 30; z++) for (var y = 1; y <= 5; y++) if (z % 2 && R() < 0.75) S(2, y, z, 'minecraft:red_wool')
  F(6, 1, 24, 6, 5, 24, DSL); F(6, 1, 31, 6, 5, 31, DSL); F(6, 6, 24, 6, 6, 31, DSX); F(2, 6, 24, 5, 6, 24, DSX); F(2, 6, 31, 5, 6, 31, DSX)
  S(3, 1, 25, 'minecraft:note_block'); S(3, 2, 25, 'minecraft:note_block'); S(3, 1, 30, 'minecraft:note_block'); S(5, 1, 27, 'minecraft:lightning_rod'); S(4, 1, 28, 'minecraft:lectern[facing=east]'); S(4, 1, 26, MAT('acacia_chair', 'east')); S(5, 1, 29, 'minecraft:light_gray_carpet')
  for (var k = 0; k <= 4; k++) { F(8 + 2 * k, 0, 25, 9 + 2 * k, k, 30, DSJ); F(8 + 2 * k, k + 1, 25, 8 + 2 * k, k + 1, 30, 'minecraft:smooth_sandstone_stairs[facing=east,half=bottom,shape=straight]'); dsDalle(8 + 2 * k, 25, 9 + 2 * k, 30, DSJ) }
  for (var z = 25; z <= 30; z++) if (R() < 0.15) S(8 + 2 * Math.floor(R() * 5), 1 + Math.floor(R() * 3), z, AIR)
  dsDalle(2, 24, 18, 24, ['minecraft:mud_bricks', 'minecraft:packed_mud']); dsDalle(2, 31, 18, 31, ['minecraft:mud_bricks', 'minecraft:packed_mud'])
  dsCactus(31, 1, 3); dsCactus(21, 27, 2); dsCactus(0, 8, 2)
  dsVeg(0, 0, 31, 31, 0.32)
}


// ================= QUARTIER GOTHIQUE (pierre sombre, ardoise, chene noir : foret sombre, marais) =================
// Rangee nord (facades au sud) : cathedrale, beffroi, maisons a pignons, cimetiere. Rue pavee et canal z32..47. Rangee sud (facades au nord) : hospice, bibliotheque, darse, jardin d'hiver.
var GTP = 'minecraft:deepslate_bricks', GTT = 'minecraft:deepslate_tiles', GTS = 'minecraft:stone_bricks', GTD = 'minecraft:dark_oak_planks'
var GTPD = 'minecraft:polished_deepslate', GTCD = 'minecraft:chiseled_deepslate', GTW = 'minecraft:deepslate_brick_wall', GTSW = 'minecraft:stone_brick_wall'
var GTL = 'minecraft:dark_oak_log[axis=y]', GTLX = 'minecraft:dark_oak_log[axis=x]', GTLZ = 'minecraft:dark_oak_log[axis=z]', GTF = 'minecraft:dark_oak_fence'
var GTPO = 'mcwdoors:dark_oak_classic_door', GTPS = 'mcwdoors:spruce_classic_door', GTPV = 'mcwdoors:dark_oak_glass_door'
var GTLH = 'minecraft:lantern[hanging=true]', GTSL = 'minecraft:soul_lantern[hanging=true]', GTV = {}
var GTTS = 'minecraft:deepslate_tile', GTBS = 'minecraft:deepslate_brick', GTSB = 'minecraft:stone_brick', GTDO = 'minecraft:dark_oak'
function gtE(m, f, h) { return m + '_stairs[facing=' + f + ',half=' + (h || 'bottom') + ',shape=straight]' }
function gtM(b) {
  var r = R()
  if (b == GTS) return r < 0.14 ? 'minecraft:mossy_stone_bricks' : r < 0.22 ? 'minecraft:cracked_stone_bricks' : b
  if (b == GTP) return r < 0.12 ? 'minecraft:cracked_deepslate_bricks' : b
  if (b == 'minecraft:bricks') return r < 0.06 ? 'createdeco:cracked_red_bricks' : b
  if (b == 'minecraft:tuff_bricks') return r < 0.1 ? 'minecraft:tuff' : r < 0.16 ? 'minecraft:polished_tuff' : b
  return b
}
function gtVit() { return 'minecraft:' + choix(['red', 'blue', 'purple', 'yellow', 'cyan', 'magenta', 'light_blue']) + '_stained_glass_pane' }
function gtSol(x1, z1, x2, z2) {
  for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) {
    var r = R(), b = r < 0.38 ? 'minecraft:grass_block' : r < 0.58 ? 'minecraft:podzol' : r < 0.7 ? 'minecraft:coarse_dirt' : r < 0.85 ? 'minecraft:moss_block' : r < 0.94 ? 'minecraft:mud' : 'minecraft:rooted_dirt'
    S(x, -1, z, b); GTV[x + ',' + z] = b == 'minecraft:podzol' ? 'p' : 'h'
  }
}
function gtDalle(x1, z1, x2, z2, l) { for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) { S(x, -1, z, typeof l == 'string' ? l : choix(l)); delete GTV[x + ',' + z] } }
function gtLibre(x, z) { for (var a = -1; a <= 1; a++) for (var b = -1; b <= 1; b++) delete GTV[(x + a) + ',' + (z + b)] }
function gtVeg(x1, z1, x2, z2, d) {
  for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) {
    var t = GTV[x + ',' + z]; if (!t) continue
    var r = R()
    if (r < d * 0.4) SA(x, 0, z, 'minecraft:short_grass'); else if (r < d * 0.68) SA(x, 0, z, 'minecraft:fern')
    else if (r < d * 0.76) SA(x, 0, z, t == 'p' ? choix(['minecraft:brown_mushroom', 'minecraft:red_mushroom']) : 'minecraft:dead_bush')
    else if (r < d * 0.8) SA(x, 0, z, 'minecraft:wither_rose'); else if (r < d * 0.84) SA(x, 0, z, 'minecraft:lily_of_the_valley')
  }
}
function gtPapiers(x1, z1, x2, z2, y, n) { for (var i = 0; i < n; i++) SA(x1 + Math.floor(R() * (x2 - x1 + 1)), y, z1 + Math.floor(R() * (z2 - z1 + 1)), choix(['minecraft:white_carpet', 'minecraft:light_gray_carpet', 'supplementaries:book_pile', 'minecraft:cobweb', 'minecraft:gray_carpet'])) }
// Arbre mort : tronc de chene noir, branches nues, quelques touffes d'epicea si f
function gtArbreMort(x, z, h, f) {
  F(x, 0, z, x, h, z, GTL); gtLibre(x, z)
  S(x + 1, h - 2, z, GTLX); S(x + 2, h - 2, z, GTLX); S(x + 2, h - 1, z, GTL)
  S(x - 1, h - 3, z, GTLX); S(x - 1, h - 2, z, GTL)
  S(x, h - 1, z + 1, GTLZ); S(x, h, z + 1, GTL); S(x, h - 4, z - 1, GTLZ); S(x, h - 3, z - 1, GTL)
  if (f) { var L = 'minecraft:spruce_leaves[persistent=true]'; S(x + 2, h, z, L); S(x + 3, h - 1, z, L); S(x - 1, h - 1, z, L); S(x, h + 1, z + 1, L); S(x, h + 1, z, L); S(x, h - 2, z - 1, L) }
}
// If (conifere sombre en cone)
function gtIf(x, z, h) {
  var L = 'minecraft:spruce_leaves[persistent=true]'
  for (var y = 2; y <= h + 1; y++) { var r = Math.min(2, Math.round((h + 1 - y) * 0.6)); for (var a = -r; a <= r; a++) for (var b = -r; b <= r; b++) if (Math.abs(a) + Math.abs(b) <= r && (a || b || y >= h)) S(x + a, y, z + b, L) }
  F(x, 0, z, x, h - 1, z, 'minecraft:spruce_log[axis=y]'); gtLibre(x, z)
}
// Saule (feuillage d'azalee et lianes pendantes)
function gtSaule(x, z) {
  var L = 'minecraft:azalea_leaves[persistent=true]'
  for (var a = -2; a <= 2; a++) for (var b = -2; b <= 2; b++) { if (Math.abs(a) == 2 && Math.abs(b) == 2) continue; S(x + a, 5, z + b, L); if (Math.abs(a) + Math.abs(b) <= 2) S(x + a, 6, z + b, L); if ((Math.abs(a) == 2 || Math.abs(b) == 2) && R() < 0.6) S(x + a, 4, z + b, 'minecraft:vine[up=true]') }
  F(x, 0, z, x, 4, z, GTL); gtLibre(x, z)
}
function gtReverbere(x, z, dx, dz) { F(x, 0, z, x, 4, z, 'minecraft:polished_blackstone_wall'); S(x + dx, 4, z + dz, 'minecraft:polished_blackstone_wall'); S(x + dx, 3, z + dz, R() < 0.3 ? GTSL : GTLH); S(x, 5, z, 'minecraft:polished_blackstone_slab[type=bottom]'); gtLibre(x, z) }
function gtBanc(x, z, f, n) {
  var ns = f == 'north' || f == 'south'
  for (var i = 0; i < n; i++) S(ns ? x + i : x, 0, ns ? z : z + i, gtE(GTDO, f))
  if (ns) { S(x - 1, 0, z, 'minecraft:dark_oak_trapdoor[facing=west,half=bottom,open=true]'); S(x + n, 0, z, 'minecraft:dark_oak_trapdoor[facing=east,half=bottom,open=true]') }
  else { S(x, 0, z - 1, 'minecraft:dark_oak_trapdoor[facing=north,half=bottom,open=true]'); S(x, 0, z + n, 'minecraft:dark_oak_trapdoor[facing=south,half=bottom,open=true]') }
}
// Toits a deux pans : faitage selon x (gtToitX) ou selon z (gtToitZ) ; pignons pleins
function gtToitX(x1, x2, z1, z2, y, m) { var n = Math.floor((z2 - z1 + 1) / 2); for (var k = 0; k < n; k++) { F(x1, y + k, z1 + k, x2, y + k, z1 + k, gtE(m, 'south')); F(x1, y + k, z2 - k, x2, y + k, z2 - k, gtE(m, 'north')) } if ((z2 - z1) % 2 == 0) F(x1, y + n, z1 + n, x2, y + n, z1 + n, m + '_slab[type=bottom]') }
function gtToitZ(x1, x2, z1, z2, y, m) { var n = Math.floor((x2 - x1 + 1) / 2); for (var k = 0; k < n; k++) { F(x1 + k, y + k, z1, x1 + k, y + k, z2, gtE(m, 'east')); F(x2 - k, y + k, z1, x2 - k, y + k, z2, gtE(m, 'west')) } if ((x2 - x1) % 2 == 0) F(x1 + n, y + n, z1, x1 + n, y + n, z2, m + '_slab[type=bottom]') }
function gtPignonX(x, z1, z2, y, b) { var n = Math.floor((z2 - z1 + 1) / 2); for (var k = 0; k < n; k++) if (z1 + k + 1 <= z2 - k - 1) F(x, y + k, z1 + k + 1, x, y + k, z2 - k - 1, b) }
function gtPignonZ(z, x1, x2, y, b) { var n = Math.floor((x2 - x1 + 1) / 2); for (var k = 0; k < n; k++) if (x1 + k + 1 <= x2 - k - 1) F(x1 + k + 1, y + k, z, x2 - k - 1, y + k, z, b) }
// Tombe : stele ou croix au nord, tertre au sud
function gtTombe(x, z) {
  var t = Math.floor(R() * 5)
  S(x, -1, z, 'minecraft:podzol'); S(x, -1, z + 1, choix(['minecraft:podzol', 'minecraft:coarse_dirt', 'minecraft:rooted_dirt'])); S(x, -1, z + 2, 'minecraft:coarse_dirt')
  for (var i = 0; i < 3; i++) delete GTV[x + ',' + (z + i)]
  if (t == 0) { F(x, 0, z, x, 2, z, GTSW); S(x - 1, 1, z, GTSW); S(x + 1, 1, z, GTSW) }
  else if (t == 1) { S(x, 0, z, 'minecraft:chiseled_stone_bricks'); S(x, 1, z, 'minecraft:stone_brick_slab[type=bottom]') }
  else if (t == 2) S(x, 0, z, gtE('minecraft:mossy_stone_brick', 'north'))
  else if (t == 3) { S(x, 0, z, 'minecraft:cobblestone_wall'); F(x, 0, z + 1, x, 0, z + 2, 'minecraft:smooth_stone_slab[type=bottom]') }
  else { S(x, 0, z, 'minecraft:polished_andesite'); S(x, 1, z, 'minecraft:polished_andesite_slab[type=bottom]') }
  if (t != 3) { var r = R(); if (r < 0.3) S(x, 0, z + 1, 'minecraft:candle[candles=' + (1 + Math.floor(R() * 3)) + ',lit=false]'); else if (r < 0.5) S(x, 0, z + 1, 'minecraft:wither_rose'); else if (r < 0.65) S(x, 0, z + 1, 'minecraft:flower_pot'); else if (r < 0.8) S(x, 0, z + 2, 'minecraft:dead_bush') }
}
// Mausolee 5x5, porte au sud
function gtMausolee(x1, z1, m, porte) {
  var x2 = x1 + 4, z2 = z1 + 4, cx = x1 + 2
  F(x1, 0, z1, x2, 0, z2, m); F(x1 + 1, 0, z1 + 1, x2 - 1, 0, z2 - 1, 'minecraft:polished_andesite')
  for (var y = 1; y <= 4; y++) for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) if (x == x1 || x == x2 || z == z1 || z == z2) S(x, y, z, gtM(m))
  PORTE(cx, 1, z2, porte, 'south', 'left', 'false'); S(cx, 3, z2, 'minecraft:chiseled_stone_bricks')
  F(x1 + 1, 1, z2 + 1, x1 + 1, 3, z2 + 1, GTSW); F(x2 - 1, 1, z2 + 1, x2 - 1, 3, z2 + 1, GTSW); F(x1 + 1, 4, z2 + 1, x2 - 1, 4, z2 + 1, gtE(GTSB, 'north', 'top'))
  for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) S(x, 5, z, x == x1 || x == x2 || z == z1 || z == z2 ? 'minecraft:stone_brick_slab[type=bottom]' : m)
  S(cx, 6, z1 + 2, 'minecraft:chiseled_stone_bricks'); ;[[x1 + 1, z1 + 1], [x2 - 1, z1 + 1], [x1 + 1, z2 - 1], [x2 - 1, z2 - 1]].forEach(c => S(c[0], 6, c[1], 'minecraft:decorated_pot'))
  F(cx, 7, z1 + 2, cx, 9, z1 + 2, GTSW); S(cx - 1, 8, z1 + 2, GTSW); S(cx + 1, 8, z1 + 2, GTSW)
  F(x1 + 1, 1, z1 + 1, x2 - 1, 1, z1 + 1, 'minecraft:polished_andesite'); F(x1 + 1, 2, z1 + 1, x2 - 1, 2, z1 + 1, 'minecraft:polished_andesite_slab[type=bottom]')
  S(x1 + 1, 1, z1 + 3, 'minecraft:candle[candles=3,lit=false]'); S(x2 - 1, 1, z1 + 3, 'minecraft:candle[candles=2,lit=false]'); S(cx, 3, z1 + 1, 'minecraft:cobweb')
  F(cx, 2, z1, cx, 3, z1, 'minecraft:purple_stained_glass_pane')
}

// ================= RUE PAVEE ET CANAL (z32..47) =================
function gtRue() {
  GTV = {}
  for (var x = 0; x <= 127; x++) {
    for (var z = 32; z <= 33; z++) S(x, -1, z, R() < 0.75 ? 'minecraft:polished_andesite' : choix(['minecraft:andesite', GTS, 'minecraft:mossy_stone_bricks', 'minecraft:cracked_stone_bricks']))
    for (var z = 34; z <= 38; z++) { var r = R(); S(x, -1, z, r < 0.55 ? 'minecraft:cobblestone' : r < 0.75 ? 'minecraft:mossy_cobblestone' : r < 0.87 ? 'minecraft:andesite' : r < 0.94 ? 'minecraft:gravel' : 'minecraft:moss_block'); if (r > 0.96) S(x, 0, z, 'minecraft:short_grass') }
    S(x, -1, 39, 'minecraft:smooth_stone'); F(x, -4, 39, x, -2, 39, GTS); S(x, -1, 44, 'minecraft:smooth_stone'); F(x, -4, 44, x, -2, 44, GTS)
    F(x, -4, 40, x, -4, 43, 'minecraft:mud'); F(x, -3, 40, x, -2, 43, 'minecraft:water'); F(x, -1, 40, x, -1, 43, AIR)
    if (R() < 0.12) S(x, -1, 40 + Math.floor(R() * 4), 'minecraft:lily_pad'); if (R() < 0.15) S(x, -3, 40 + Math.floor(R() * 4), 'minecraft:seagrass')
    for (var z = 45; z <= 47; z++) S(x, -1, z, R() < 0.7 ? GTS : choix(['minecraft:mossy_stone_bricks', 'minecraft:cobblestone', 'minecraft:polished_andesite']))
  }
  // chenal vers la darse (x74..85) couvert d'une passerelle
  for (var x = 74; x <= 85; x++) { F(x, -4, 44, x, -4, 47, 'minecraft:mud'); F(x, -3, 44, x, -2, 47, 'minecraft:water'); F(x, -1, 44, x, -1, 47, GTD) }
  for (var z = 44; z <= 47; z++) { F(73, -4, z, 73, -2, z, GTS); F(86, -4, z, 86, -2, z, GTS) }
  F(74, 0, 47, 85, 0, 47, GTF)
  // garde-corps du canal
  for (var x = 0; x <= 127; x++) {
    if ((x >= 22 && x <= 26) || (x >= 100 && x <= 104)) continue
    var b = x % 8 == 0 ? 'minecraft:polished_blackstone_wall' : 'minecraft:iron_bars'
    if (x != 12) S(x, 0, 39, b); if (x < 74 || x > 85) S(x, 0, 44, b)
  }
  F(12, -2, 40, 12, -1, 40, 'minecraft:ladder[facing=south]'); F(115, -2, 43, 115, -1, 43, 'minecraft:ladder[facing=north]'); S(115, 0, 44, AIR)
  // ponts en dos d'ane
  ;[22, 100].forEach(x1 => {
    for (var x = x1; x <= x1 + 4; x++) {
      F(x, 0, 39, x, 0, 44, GTS); S(x, 0, 38, 'minecraft:stone_brick_slab[type=bottom]'); S(x, 0, 45, 'minecraft:stone_brick_slab[type=bottom]')
      S(x, -1, 40, gtE(GTSB, 'north', 'top')); S(x, -1, 43, gtE(GTSB, 'south', 'top'))
    }
    F(x1, 1, 39, x1, 1, 44, GTSW); F(x1 + 4, 1, 39, x1 + 4, 1, 44, GTSW)
    ;[[x1, 39], [x1, 44], [x1 + 4, 39], [x1 + 4, 44]].forEach(c => { S(c[0], 2, c[1], GTSW); S(c[0], 3, c[1], 'minecraft:lantern[hanging=false]') })
  })
  // reverberes, arbres, bancs
  ;[6, 30, 54, 78, 102, 126].forEach(x => gtReverbere(x, 33, 0, 1))
  ;[14, 46, 62, 110].forEach(x => gtReverbere(x, 46, 0, -1))
  ;[6, 38, 94, 118].forEach((x, i) => { S(x, -1, 46, 'minecraft:podzol'); gtArbreMort(x, 46, 7, i % 2 == 0) })
  S(54, -1, 46, 'minecraft:podzol'); gtIf(54, 46, 6)
  gtBanc(32, 45, 'south', 3); gtBanc(66, 45, 'south', 3); gtBanc(112, 45, 'south', 3)
  // vehicules abandonnes, barrage, mobilier
  bgVoiture(8, 35, 'x', 'black', 1); bgVoiture(44, 36, 'x', 'gray', 2); bgVoiture(88, 35, 'x', 'white', 1); bgVoiture(62, 34, 'z', 'red', 2); bgVoiture(120, 36, 'x', 'brown', 0)
  F(70, 0, 34, 70, 1, 38, 'minecraft:spruce_fence'); S(71, 0, 35, 'minecraft:barrel[facing=up,open=false]'); S(71, 0, 37, 'minecraft:barrel[facing=up,open=false]'); S(69, 0, 36, 'minecraft:cobblestone_wall'); S(71, 1, 35, 'minecraft:lantern[hanging=false]')
  F(40, 0, 32, 40, 3, 32, 'minecraft:green_terracotta'); S(40, 4, 32, 'minecraft:polished_blackstone_slab[type=bottom]')
  S(20, 0, 33, 'minecraft:red_nether_brick_wall'); S(84, 0, 33, 'minecraft:red_nether_brick_wall')
  ;[16, 58, 96].forEach(x => S(x, 0, 38, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false]'))
  for (var i = 0; i < 40; i++) SA(Math.floor(R() * 128), 0, 32 + Math.floor(R() * 7), choix(['minecraft:white_carpet', 'minecraft:light_gray_carpet', 'supplementaries:book_pile', 'minecraft:gray_carpet']))
}

// ================= CATHEDRALE (nef a bas-cotes, deux tours a fleches, rosace, abside, tribune d'orgue, sacristie) =================
function gtCathedrale() {
  GTV = {}
  var P = GTP, T = GTT, PD = GTPD
  function dA(x, z) { return Math.sqrt((x - 15.5) * (x - 15.5) + (z - 6) * (z - 6)) }
  gtSol(0, 0, 31, 31)
  gtDalle(3, 28, 28, 31, [GTS, GTS, 'minecraft:mossy_stone_bricks', 'minecraft:cobblestone', 'minecraft:andesite'])
  gtDalle(7, 0, 24, 27, PD); F(8, 0, 6, 23, 0, 27, PD)
  // sol en damier noir et blanc
  for (var x = 9; x <= 22; x++) for (var z = 7; z <= 26; z++) S(x, 0, z, (x + z) % 2 ? PD : 'minecraft:calcite')
  // murs des bas-cotes et mur nord
  for (var y = 1; y <= 10; y++) { for (var z = 6; z <= 27; z++) { S(8, y, z, gtM(P)); S(23, y, z, gtM(P)) } ;[9, 10, 21, 22].forEach(x => S(x, y, 6, gtM(P))) }
  F(11, 1, 6, 11, 10, 6, PD); F(20, 1, 6, 20, 10, 6, PD); F(11, 11, 6, 20, 18, 6, P)
  // abside en hemicycle
  for (var x = 6; x <= 25; x++) for (var z = 0; z <= 5; z++) {
    var d = dA(x, z)
    if (d < 5.3) { S(x, 0, z, PD); S(x, 1, z, (x + z) % 2 ? PD : 'minecraft:polished_blackstone') }
    else if (d < 6.8) { S(x, 0, z, P); for (var y = 1; y <= 12; y++) S(x, y, z, gtM(P)); if (z >= 1 && z <= 4 && Math.abs(x - 15.5) >= 2 && (x + z) % 3 == 0) F(x, 3, z, x, 10, z, gtVit()) }
  }
  ;[[13, 6.8], [14, 5.5], [15, 4.2], [16, 2.8], [17, 1.6]].forEach(c => { for (var x = 6; x <= 25; x++) for (var z = 0; z <= 5; z++) if (dA(x, z) < c[1]) S(x, c[0], z, T) })
  F(12, 1, 6, 19, 1, 6, PD); F(13, 1, 7, 18, 1, 7, gtE(GTBS, 'north'))
  // croix doree, autel, stalles
  F(15, 4, 0, 16, 10, 0, 'minecraft:gold_block'); F(13, 8, 0, 18, 8, 0, 'minecraft:gold_block')
  F(14, 2, 2, 17, 2, 2, 'minecraft:polished_blackstone_bricks'); F(15, 3, 2, 16, 3, 2, 'minecraft:white_carpet'); S(14, 3, 2, 'minecraft:candle[candles=4,lit=false]'); S(17, 3, 2, 'minecraft:candle[candles=3,lit=false]')
  S(11, 2, 4, gtE(GTDO, 'west')); S(11, 2, 5, gtE(GTDO, 'west')); S(20, 2, 4, gtE(GTDO, 'east')); S(20, 2, 5, gtE(GTDO, 'east'))
  S(13, 2, 6, 'minecraft:lectern[facing=south]'); S(18, 2, 6, 'minecraft:polished_blackstone_wall'); S(18, 3, 6, 'minecraft:candle[candles=2,lit=false]')
  // grandes arcades, piliers, fenetres hautes
  ;[11, 20].forEach(x => {
    ;[10, 14, 18, 22].forEach(z => { F(x, 1, z, x, 9, z, PD); S(x, 1, z, GTCD); S(x, 9, z, GTCD) })
    ;[[7, 9], [11, 13], [15, 17], [19, 21], [23, 26]].forEach(g => { S(x, 9, g[0], gtE(GTBS, 'north', 'top')); S(x, 9, g[1], gtE(GTBS, 'south', 'top')) })
    for (var z = 7; z <= 26; z++) for (var y = 10; y <= 17; y++) S(x, y, z, gtM(P))
    ;[8, 12, 16, 20].forEach(z => F(x, 12, z, x, 15, z, gtVit()))
  })
  // voutes et toitures
  F(9, 10, 7, 10, 10, 26, T); F(21, 10, 7, 22, 10, 26, T)
  F(8, 11, 6, 8, 11, 26, gtE(GTTS, 'east')); F(9, 11, 6, 10, 11, 26, T); F(9, 12, 6, 9, 12, 26, gtE(GTTS, 'east')); F(10, 12, 6, 10, 12, 26, T); F(10, 13, 6, 10, 13, 26, gtE(GTTS, 'east'))
  F(23, 11, 6, 23, 11, 26, gtE(GTTS, 'west')); F(21, 11, 6, 22, 11, 26, T); F(22, 12, 6, 22, 12, 26, gtE(GTTS, 'west')); F(21, 12, 6, 21, 12, 26, T); F(21, 13, 6, 21, 13, 26, gtE(GTTS, 'west'))
  F(12, 18, 7, 19, 18, 26, T); F(12, 17, 7, 12, 17, 26, gtE(GTBS, 'west', 'top')); F(19, 17, 7, 19, 17, 26, gtE(GTBS, 'east', 'top'))
  ;[10, 14, 18, 22].forEach(z => F(13, 17, z, 18, 17, z, 'minecraft:deepslate_brick_slab[type=top]'))
  for (var k = 0; k < 5; k++) { F(11 + k, 19 + k, 5, 11 + k, 19 + k, 28, gtE(GTTS, 'east')); F(20 - k, 19 + k, 5, 20 - k, 19 + k, 28, gtE(GTTS, 'west')) }
  F(15, 24, 5, 16, 24, 28, 'minecraft:deepslate_tile_slab[type=bottom]')
  for (var k = 0; k < 4; k++) { F(12 + k, 19 + k, 6, 19 - k, 19 + k, 6, P); F(12 + k, 19 + k, 27, 19 - k, 19 + k, 27, P) }
  // facade : portails, tympan, rosace, lancettes, croix de pignon
  for (var x = 9; x <= 22; x++) for (var y = 1; y <= 18; y++) S(x, y, 27, gtM(P))
  for (var x = 11; x <= 20; x++) for (var y = 9; y <= 17; y++) { var d2 = (x - 15.5) * (x - 15.5) + (y - 13) * (y - 13); if (d2 <= 9.5) S(x, y, 27, 'minecraft:' + (d2 < 1.5 ? 'yellow' : d2 < 4.6 ? 'red' : 'blue') + '_stained_glass_pane'); else if (d2 <= 14) S(x, y, 27, PD) }
  PORTE(15, 1, 27, GTPO, 'north', 'left', 'false'); PORTE(16, 1, 27, GTPO, 'north', 'right', 'false'); F(14, 3, 27, 17, 4, 27, GTCD); S(15, 4, 27, 'minecraft:gilded_blackstone'); S(16, 4, 27, 'minecraft:gilded_blackstone')
  PORTE(10, 1, 27, GTPO, 'north', 'left', 'false'); PORTE(21, 1, 27, GTPO, 'north', 'right', 'false')
  F(10, 6, 27, 10, 10, 27, 'minecraft:purple_stained_glass_pane'); F(21, 6, 27, 21, 10, 27, 'minecraft:purple_stained_glass_pane')
  F(15, 25, 27, 15, 27, 27, GTW); S(14, 26, 27, GTW); S(16, 26, 27, GTW)
  // porche
  F(12, 0, 28, 19, 0, 29, PD); F(12, 1, 28, 12, 6, 29, P); F(19, 1, 28, 19, 6, 29, P)
  ;[28, 29].forEach(z => { S(13, 6, z, gtE(GTBS, 'west', 'top')); S(18, 6, z, gtE(GTBS, 'east', 'top')) })
  F(12, 7, 28, 19, 8, 29, P); F(13, 9, 28, 18, 9, 29, P); F(14, 10, 28, 17, 10, 29, P); F(15, 11, 28, 16, 11, 29, P)
  ;[28, 29].forEach(z => { S(13, 9, z, gtE(GTBS, 'east')); S(18, 9, z, gtE(GTBS, 'west')); S(14, 10, z, gtE(GTBS, 'east')); S(17, 10, z, gtE(GTBS, 'west')); S(15, 11, z, gtE(GTBS, 'east')); S(16, 11, z, gtE(GTBS, 'west')) })
  F(12, 9, 28, 12, 10, 28, GTW); F(19, 9, 28, 19, 10, 28, GTW)
  F(12, 0, 30, 19, 0, 30, gtE(GTSB, 'north'))
  // tours a fleches
  function tour(x1, ouest) {
    var x2 = x1 + 4, xc = x1 + 2, xi = ouest ? x1 + 1 : x2 - 1, xp = ouest ? x2 : x1
    for (var y = 0; y <= 26; y++) for (var x = x1; x <= x2; x++) for (var z = 25; z <= 29; z++) if (y == 0 || x == x1 || x == x2 || z == 25 || z == 29) S(x, y, z, y == 0 ? PD : gtM(P))
    ;[6, 12, 19, 24].forEach(y => F(x1 + 1, y, 26, x2 - 1, y, 28, GTD))
    F(xi, 1, 28, xi, 23, 28, 'minecraft:ladder[facing=' + (ouest ? 'east' : 'west') + ']')
    PORTE(xc, 1, 29, GTPO, 'south', 'left', 'false')
    F(xp, 1, 26, xp, 2, 26, AIR); F(xp, 7, 26, xp, 8, 26, AIR)
    ;[9, 15].forEach(y => { F(xc, y, 29, xc, y + 2, 29, 'minecraft:purple_stained_glass_pane'); F(ouest ? x1 : x2, y, 27, ouest ? x1 : x2, y + 2, 27, 'minecraft:purple_stained_glass_pane') })
    for (var y = 20; y <= 22; y++) { S(xc, y, 29, 'minecraft:dark_oak_trapdoor[facing=north,half=bottom,open=true]'); S(xc, y, 25, 'minecraft:dark_oak_trapdoor[facing=south,half=bottom,open=true]'); S(x1, y, 27, 'minecraft:dark_oak_trapdoor[facing=east,half=bottom,open=true]'); S(x2, y, 27, 'minecraft:dark_oak_trapdoor[facing=west,half=bottom,open=true]') }
    S(xc, 23, 27, 'minecraft:bell[attachment=ceiling,facing=south]')
    for (var x = x1; x <= x2; x++) for (var z = 25; z <= 29; z++) {
      var bx = x == x1 || x == x2, bz = z == 25 || z == 29
      if (bx && bz) F(x, 27, z, x, 29, z, GTW); else if (bx || bz) S(x, 27, z, gtE(GTTS, x == x1 ? 'east' : x == x2 ? 'west' : z == 25 ? 'south' : 'north')); else S(x, 27, z, T)
    }
    F(x1 + 1, 28, 26, x2 - 1, 29, 28, T)
    for (var x = x1 + 1; x <= x2 - 1; x++) for (var z = 26; z <= 28; z++) S(x, 30, z, x == xc && z == 27 ? T : gtE(GTTS, x < xc ? 'east' : x > xc ? 'west' : z < 27 ? 'south' : 'north'))
    F(xc, 31, 27, xc, 33, 27, T); F(xc, 34, 27, xc, 35, 27, GTW); S(xc, 36, 27, 'minecraft:lightning_rod')
    S(x1, 25, 30, 'minecraft:wither_skeleton_wall_skull[facing=south]'); S(x2, 25, 30, 'minecraft:wither_skeleton_wall_skull[facing=south]')
    var xb = ouest ? x1 - 1 : x2 + 1, xs = ouest ? x1 : x2
    F(xb, 0, 29, xb, 14, 29, P); F(xs, 0, 30, xs, 14, 30, P); S(xb, 15, 29, gtE(GTBS, ouest ? 'east' : 'west')); S(xs, 15, 30, gtE(GTBS, 'north'))
  }
  tour(4, true); tour(23, false)
  // contreforts et arcs-boutants
  ;[10, 14, 18, 22].forEach(z => {
    F(7, 0, z, 7, 10, z, P); F(7, 11, z, 7, 12, z, GTW); F(24, 0, z, 24, 10, z, P); F(24, 11, z, 24, 12, z, GTW)
    S(8, 12, z, gtE(GTBS, 'west', 'top')); S(9, 13, z, gtE(GTBS, 'west', 'top')); S(10, 14, z, gtE(GTBS, 'west', 'top'))
    S(23, 12, z, gtE(GTBS, 'east', 'top')); S(22, 13, z, gtE(GTBS, 'east', 'top')); S(21, 14, z, gtE(GTBS, 'east', 'top'))
  })
  ;[8, 12, 16, 20].forEach(z => F(8, 3, z, 8, 8, z, gtVit())); ;[8, 16, 20].forEach(z => F(23, 3, z, 23, 8, z, gtVit()))
  // tribune et orgue
  F(9, 6, 24, 22, 6, 26, GTD); for (var x = 9; x <= 22; x++) S(x, 7, 24, GTF)
  F(13, 1, 24, 13, 5, 24, GTL); F(18, 1, 24, 18, 5, 24, GTL)
  F(12, 7, 26, 19, 7, 26, GTD); for (var x = 12; x <= 19; x++) F(x, 8, 26, x, 8 + (x % 3), 26, 'minecraft:lightning_rod')
  S(15, 7, 25, 'minecraft:dark_oak_slab[type=top]'); S(16, 7, 25, 'minecraft:note_block'); S(15, 7, 24, gtE(GTDO, 'north')); S(16, 7, 24, gtE(GTDO, 'north'))
  // bancs, tapis, chandeliers, cierges, confessionnal
  for (var z = 9; z <= 21; z += 2) [12, 13, 14, 17, 18, 19].forEach(x => { var r = R(); if (r > 0.08) S(x, 1, z, r < 0.15 ? 'minecraft:dark_oak_slab[type=bottom]' : gtE(GTDO, 'south')) })
  F(15, 1, 8, 16, 1, 26, 'minecraft:red_carpet')
  S(15, 16, 14, 'mcwlights:iron_chandelier'); S(16, 16, 18, 'mcwlights:iron_chandelier'); S(15, 16, 22, 'mcwlights:iron_chandelier')
  ;[12, 16, 20].forEach(z => { S(9, 9, z, GTSL); S(22, 9, z, GTSL) })
  ;[[9, 9], [9, 13], [9, 17], [22, 9], [22, 13], [22, 21]].forEach(c => { S(c[0], 1, c[1], 'minecraft:polished_blackstone_wall'); S(c[0], 2, c[1], 'minecraft:candle[candles=4,lit=false]') })
  F(21, 1, 17, 22, 3, 19, GTD); F(21, 4, 17, 22, 4, 19, 'minecraft:dark_oak_slab[type=bottom]'); F(22, 1, 18, 22, 2, 18, AIR); S(22, 1, 18, gtE(GTDO, 'east')); PORTE(21, 1, 18, GTPO, 'west', 'left', 'false')
  S(21, 2, 17, 'minecraft:dark_oak_trapdoor[facing=west,half=bottom,open=true]'.replace('open=true', 'open=false'))
  ;[[9, 9, 7], [22, 9, 7], [12, 16, 7], [19, 16, 26], [10, 9, 26]].forEach(c => S(c[0], c[1], c[2], 'minecraft:cobweb'))
  gtPapiers(12, 8, 19, 22, 1, 10)
  for (var i = 0; i < 14; i++) SA(9 + Math.floor(R() * 14), 1, 7 + Math.floor(R() * 20), choix(['minecraft:moss_carpet', 'minecraft:moss_carpet', 'minecraft:deepslate_brick_slab[type=bottom]', 'minecraft:cobblestone_slab[type=bottom]']))
  // sacristie et passage couvert
  F(25, 0, 8, 30, 0, 17, GTS); F(26, 0, 9, 29, 0, 16, GTD)
  for (var y = 1; y <= 5; y++) for (var x = 25; x <= 30; x++) for (var z = 8; z <= 17; z++) if (x == 25 || x == 30 || z == 8 || z == 17) S(x, y, z, gtM(GTS))
  gtToitZ(25, 30, 7, 18, 6, GTTS); gtPignonZ(8, 25, 30, 6, GTS); gtPignonZ(17, 25, 30, 6, GTS)
  F(24, 0, 11, 24, 0, 13, GTS); F(24, 1, 11, 24, 3, 11, GTS); F(24, 1, 13, 24, 3, 13, GTS); S(24, 3, 12, GTS); F(24, 4, 11, 24, 4, 13, 'minecraft:deepslate_tile_slab[type=bottom]')
  F(23, 1, 12, 23, 2, 12, AIR); F(25, 1, 12, 25, 2, 12, AIR); PORTE(24, 1, 12, GTPO, 'east', 'left', 'false')
  S(29, 1, 10, 'minecraft:chest[facing=west]'); S(29, 1, 11, 'minecraft:barrel[facing=west,open=false]'); S(29, 1, 14, 'minecraft:purple_banner'); S(29, 1, 15, 'minecraft:black_banner')
  F(26, 1, 15, 27, 1, 15, 'mcwfurnitures:dark_oak_table'); S(26, 1, 14, MAT('dark_oak_chair', 'south')); S(27, 2, 15, 'supplementaries:book_pile'); S(26, 2, 15, 'minecraft:candle[candles=2,lit=false]')
  S(28, 1, 9, 'minecraft:water_cauldron[level=2]'); S(26, 1, 9, 'minecraft:chiseled_bookshelf[facing=south]'); S(27, 7, 12, GTLH)
  F(30, 2, 11, 30, 3, 11, 'minecraft:purple_stained_glass_pane'); F(30, 2, 14, 30, 3, 14, 'minecraft:purple_stained_glass_pane'); F(27, 2, 17, 28, 3, 17, 'minecraft:purple_stained_glass_pane')
  // enclos paroissial a l'ouest
  ;[2, 5].forEach(x => [8, 12, 16, 20].forEach(z => gtTombe(x, z)))
  gtIf(2, 3, 7); gtArbreMort(28, 22, 6, true)
  gtReverbere(2, 29, 1, 0); gtReverbere(29, 29, -1, 0); gtBanc(25, 30, 'south', 3)
  gtVeg(0, 0, 31, 31, 0.35)
}

// ================= BEFFROI ET HOTEL DE VILLE (halle a arcades, pignons a gradins, salle du conseil, beffroi a cadrans) =================
function gtBeffroi() {
  GTV = {}
  var M = GTS
  gtSol(0, 0, 31, 31)
  for (var x = 0; x <= 31; x++) for (var z = 19; z <= 31; z++) { var r = R(); S(x, -1, z, r < 0.5 ? 'minecraft:cobblestone' : r < 0.75 ? GTS : r < 0.88 ? 'minecraft:andesite' : r < 0.95 ? 'minecraft:mossy_cobblestone' : 'minecraft:moss_block'); delete GTV[x + ',' + z] }
  // gros oeuvre x2..29 z4..18, galerie a arcades z16..17
  F(2, 0, 4, 29, 0, 18, GTPD)
  for (var x = 3; x <= 28; x++) for (var z = 5; z <= 17; z++) S(x, 0, z, (x + z) % 2 ? GTPD : 'minecraft:polished_andesite')
  for (var y = 1; y <= 13; y++) {
    for (var z = 4; z <= 18; z++) { S(2, y, z, y == 7 ? GTPD : gtM(M)); S(29, y, z, y == 7 ? GTPD : gtM(M)) }
    for (var x = 3; x <= 28; x++) { S(x, y, 4, y == 7 ? GTPD : gtM(M)); if (y >= 7) S(x, y, 18, y == 7 ? GTPD : gtM(M)) }
  }
  for (var x = 3; x <= 28; x++) for (var y = 1; y <= 6; y++) S(x, y, 15, gtM(M))
  for (var x = 2; x <= 29; x += 3) F(x, 1, 18, x, 6, 18, GTPD)
  for (var x = 3; x <= 27; x += 3) { S(x, 5, 18, gtE(GTSB, 'west', 'top')); S(x + 1, 5, 18, gtE(GTSB, 'east', 'top')); F(x, 6, 18, x + 1, 6, 18, M) }
  F(3, 7, 5, 28, 7, 17, GTD); F(3, 14, 5, 28, 14, 17, GTD)
  // toiture d'ardoise et pignons a gradins
  gtToitX(3, 28, 3, 19, 15, GTTS)
  ;[2, 29].forEach(x => {
    for (var k = 0; k < 8; k++) { F(x, 15 + k, 4 + k, x, 15 + k, 18 - k, M); if (k % 2 == 0) { S(x, 16 + k, 4 + k, 'minecraft:stone_brick_slab[type=bottom]'); S(x, 16 + k, 18 - k, 'minecraft:stone_brick_slab[type=bottom]') } }
    F(x, 23, 11, x, 24, 11, M); S(x, 25, 11, GTSW)
  })
  // beffroi x13..18 z7..12
  F(14, 15, 8, 17, 33, 11, AIR)
  for (var y = 15; y <= 33; y++) for (var x = 13; x <= 18; x++) for (var z = 7; z <= 12; z++) if (x == 13 || x == 18 || z == 7 || z == 12) S(x, y, z, gtM(M))
  ;[[13, 7], [18, 7], [13, 12], [18, 12]].forEach(c => F(c[0], 15, c[1], c[0], 33, c[1], GTPD))
  var QZ = 'minecraft:smooth_quartz'
  F(14, 23, 12, 17, 26, 12, QZ); S(15, 25, 12, 'supplementaries:clock_block[facing=south]'); S(14, 26, 12, 'minecraft:gold_block'); S(17, 26, 12, 'minecraft:gold_block'); S(14, 23, 12, 'minecraft:gold_block'); S(17, 23, 12, 'minecraft:gold_block')
  F(14, 23, 7, 17, 26, 7, QZ); S(16, 25, 7, 'supplementaries:clock_block[facing=north]')
  F(13, 23, 8, 13, 26, 11, QZ); S(13, 25, 10, 'supplementaries:clock_block[facing=west]')
  F(18, 23, 8, 18, 26, 11, QZ); S(18, 25, 9, 'supplementaries:clock_block[facing=east]')
  F(15, 28, 12, 16, 31, 12, 'minecraft:dark_oak_trapdoor[facing=north,half=bottom,open=true]'); F(15, 28, 7, 16, 31, 7, 'minecraft:dark_oak_trapdoor[facing=south,half=bottom,open=true]')
  F(13, 28, 9, 13, 31, 10, 'minecraft:dark_oak_trapdoor[facing=east,half=bottom,open=true]'); F(18, 28, 9, 18, 31, 10, 'minecraft:dark_oak_trapdoor[facing=west,half=bottom,open=true]')
  F(14, 32, 9, 17, 32, 10, GTLX); S(15, 31, 9, 'minecraft:bell[attachment=ceiling,facing=south]'); S(16, 31, 10, 'minecraft:bell[attachment=ceiling,facing=east]')
  F(14, 8, 5, 14, 13, 5, 'minecraft:ladder[facing=south]'); S(14, 14, 5, AIR); F(16, 15, 7, 16, 16, 7, AIR); F(14, 15, 8, 14, 30, 8, 'minecraft:ladder[facing=south]')
  F(14, 33, 8, 17, 33, 11, M)
  for (var x = 13; x <= 18; x++) for (var z = 7; z <= 12; z++) if (x == 13 || x == 18 || z == 7 || z == 12) S(x, 34, z, GTSW)
  ;[[13, 7], [18, 7], [13, 12], [18, 12]].forEach(c => { S(c[0], 35, c[1], GTSW); S(c[0], 36, c[1], 'minecraft:lightning_rod') })
  ;[[14, 8], [17, 8], [14, 11], [17, 11]].forEach(c => F(c[0], 34, c[1], c[0], 37, c[1], GTPD))
  S(15, 37, 9, 'minecraft:bell[attachment=ceiling,facing=south]')
  for (var x = 14; x <= 17; x++) for (var z = 8; z <= 11; z++) { var bx = x == 14 || x == 17, bz = z == 8 || z == 11; S(x, 38, z, bx && bz ? 'minecraft:deepslate_tile_slab[type=bottom]' : bx || bz ? gtE(GTTS, x == 14 ? 'east' : x == 17 ? 'west' : z == 8 ? 'south' : 'north') : GTT) }
  F(15, 39, 9, 16, 40, 10, GTT); S(15, 41, 9, 'minecraft:gold_block'); S(15, 42, 9, 'minecraft:lightning_rod')
  // rez-de-chaussee : salle des guichets (ouest), escalier et archives (est)
  F(15, 1, 5, 15, 6, 14, M); PORTE(15, 1, 10, GTPO, 'east', 'left', 'false')
  F(4, 1, 11, 13, 1, 11, MAT('dark_oak_counter', 'south')); F(4, 3, 11, 13, 3, 11, 'minecraft:iron_bars'); for (var x = 4; x <= 13; x++) if (x % 3 != 0) S(x, 2, 11, 'minecraft:iron_bars')
  ;[5, 9, 13].forEach(x => { S(x, 1, 9, 'mcwfurnitures:dark_oak_table'); S(x, 1, 8, MAT('dark_oak_chair', 'south')); S(x, 2, 9, choix(['supplementaries:book_pile', 'minecraft:candle[candles=1,lit=false]', 'minecraft:white_carpet'])) })
  for (var x = 3; x <= 14; x++) S(x, 1, 5, x % 3 == 0 ? 'minecraft:chest[facing=south]' : 'minecraft:barrel[facing=south,open=false]'); for (var x = 3; x <= 14; x++) if (x % 2) S(x, 2, 5, 'minecraft:barrel[facing=south,open=false]')
  S(3, 1, 13, 'supplementaries:notice_board[facing=east]'); S(3, 1, 12, 'minecraft:flower_pot')
  ;[4, 5, 6, 10, 11, 12, 13].forEach(x => S(x, 1, 14, gtE(GTDO, 'south')))
  PORTE(8, 1, 15, GTPO, 'south', 'left', 'false'); PORTE(22, 1, 15, GTPO, 'south', 'left', 'false')
  for (var i = 0; i < 6; i++) { S(21 - i, 1 + i, 5, gtE(GTDO, 'west')); S(21 - i, 1 + i, 6, gtE(GTDO, 'west')) }
  F(16, 7, 5, 21, 7, 6, AIR); F(16, 8, 7, 21, 8, 7, GTF); F(22, 8, 5, 22, 8, 6, GTF)
  F(24, 1, 8, 24, 4, 13, 'minecraft:bookshelf'); F(27, 1, 8, 27, 4, 13, 'minecraft:bookshelf'); F(28, 1, 8, 28, 2, 13, 'minecraft:barrel[facing=west,open=false]')
  F(19, 1, 11, 20, 1, 11, 'mcwfurnitures:dark_oak_table'); S(19, 1, 12, MAT('dark_oak_chair', 'north')); S(20, 2, 11, 'supplementaries:book_pile'); S(25, 1, 14, 'minecraft:lectern[facing=north]')
  ;[[8, 6, 12], [22, 6, 10], [26, 6, 11]].forEach(c => S(c[0], c[1], c[2], GTLH))
  gtPapiers(16, 8, 28, 14, 1, 8); gtPapiers(3, 6, 14, 14, 1, 7)
  // etage : salle du conseil et bureau du maire
  F(23, 8, 5, 23, 13, 17, M); PORTE(23, 8, 13, GTPO, 'east', 'left', 'false')
  F(8, 8, 10, 17, 8, 12, 'mcwfurnitures:dark_oak_table')
  for (var x = 8; x <= 17; x++) { if (R() > 0.12) S(x, 8, 9, MAT('dark_oak_chair', 'south')); if (R() > 0.12) S(x, 8, 13, MAT('dark_oak_chair', 'north')) }
  S(7, 8, 11, MAT('dark_oak_chair', 'east')); S(18, 8, 11, MAT('dark_oak_chair', 'west'))
  for (var i = 0; i < 8; i++) SA(8 + Math.floor(R() * 10), 9, 10 + Math.floor(R() * 3), choix(['supplementaries:book_pile', 'minecraft:white_carpet', 'minecraft:candle[candles=1,lit=false]']))
  F(3, 8, 9, 4, 12, 13, 'minecraft:polished_blackstone_bricks'); F(4, 8, 10, 4, 9, 12, AIR); S(4, 8, 11, 'minecraft:campfire[lit=false,facing=east]'); F(5, 10, 9, 5, 10, 13, 'minecraft:dark_oak_slab[type=top]'); S(5, 11, 9, 'minecraft:candle[candles=3,lit=false]'); S(5, 11, 13, 'minecraft:candle[candles=2,lit=false]')
  F(3, 13, 11, 3, 25, 11, 'minecraft:polished_blackstone_bricks')
  ;[7, 11, 17, 21].forEach(x => S(x, 11, 5, 'minecraft:black_wall_banner[facing=south]'))
  S(10, 13, 11, 'mcwlights:iron_chandelier'); S(15, 13, 11, 'mcwlights:iron_chandelier'); S(20, 13, 15, GTLH)
  F(9, 8, 15, 16, 8, 16, 'minecraft:red_carpet'); S(20, 8, 16, 'minecraft:potted_dead_bush'); S(3, 8, 16, 'minecraft:chiseled_bookshelf[facing=east]'); S(3, 8, 6, 'minecraft:chiseled_bookshelf[facing=east]')
  S(26, 8, 12, 'mcwfurnitures:dark_oak_table'); S(26, 8, 11, MAT('dark_oak_chair', 'south')); S(26, 9, 12, 'supplementaries:book_pile'); S(25, 8, 14, MAT('dark_oak_chair', 'north'))
  F(28, 8, 6, 28, 10, 9, 'minecraft:bookshelf'); S(28, 8, 15, 'minecraft:chest[facing=west]'); S(28, 8, 16, 'minecraft:iron_block'); S(28, 9, 16, 'minecraft:candle[candles=1,lit=false]'); F(25, 8, 10, 27, 8, 13, 'minecraft:red_carpet'.replace('red', 'black')); S(26, 13, 9, GTLH); S(27, 13, 16, 'minecraft:cobweb')
  // fenetres
  ;[5, 9, 13, 19, 25].forEach(x => F(x, 2, 4, x, 4, 4, GP)); ;[5, 9, 13, 19, 25, 27].forEach(x => F(x, 9, 4, x, 12, 4, GP))
  ;[4, 7, 10, 13, 19, 22, 25, 27].forEach(x => F(x, 9, 18, x, 12, 18, GP))
  ;[2, 29].forEach(x => { F(x, 2, 8, x, 4, 8, GP); F(x, 2, 13, x, 4, 13, GP); F(x, 9, 14, x, 12, 14, GP); if (x == 29) F(x, 9, 8, x, 12, 8, GP) })
  // balcon central et banieres de facade
  PORTE(15, 8, 18, GTPV, 'south', 'left', 'false'); PORTE(16, 8, 18, GTPV, 'south', 'right', 'false'); F(15, 10, 18, 16, 11, 18, GP)
  F(13, 7, 19, 18, 7, 19, GTPD); F(13, 8, 19, 18, 8, 19, GTSW); F(13, 6, 19, 18, 6, 19, gtE(GTSB, 'north', 'top'))
  S(9, 10, 19, 'minecraft:black_wall_banner[facing=south]'); S(21, 10, 19, 'minecraft:gray_wall_banner[facing=south]')
  // galerie : lanternes, bancs, affiches
  ;[6, 12, 18, 24].forEach(x => S(x, 6, 17, GTLH)); ;[4, 5, 6, 25, 26, 27].forEach(x => S(x, 1, 16, gtE(GTDO, 'north'))); S(11, 1, 16, 'supplementaries:notice_board[facing=south]'); S(19, 1, 16, 'supplementaries:notice_board[facing=south]')
  // place : fontaine gothique, croix de marche, arbres, reverberes
  for (var x = 13; x <= 18; x++) for (var z = 23; z <= 28; z++) {
    var bord = x == 13 || x == 18 || z == 23 || z == 28, coin = (x == 13 || x == 18) && (z == 23 || z == 28)
    if (coin) continue
    if (bord) { S(x, -1, z, GTS); S(x, 0, z, 'minecraft:stone_brick_slab[type=bottom]') }
    else { S(x, -2, z, 'minecraft:mud'); S(x, -1, z, (x == 15 || x == 16) && (z == 25 || z == 26) ? GTS : 'minecraft:water') }
  }
  F(15, 0, 25, 16, 2, 26, GTS); F(15, 3, 25, 16, 3, 26, 'minecraft:chiseled_stone_bricks'); F(15, 4, 25, 16, 5, 26, GTSW); F(15, 6, 25, 16, 6, 26, 'minecraft:stone_brick_slab[type=bottom]'); S(14, 0, 24, 'minecraft:lily_pad'); S(17, 0, 27, 'minecraft:lily_pad')
  F(5, 0, 24, 7, 0, 26, 'minecraft:stone_brick_slab[type=bottom]'); S(6, 0, 25, GTS); F(6, 1, 25, 6, 5, 25, GTSW); S(5, 4, 25, GTSW); S(7, 4, 25, GTSW)
  ;[[25, 24], [25, 29], [6, 29]].forEach(c => { S(c[0], -1, c[1], 'minecraft:podzol'); gtArbreMort(c[0], c[1], 6, false) })
  gtReverbere(1, 21, 1, 0); gtReverbere(30, 21, -1, 0); gtReverbere(1, 30, 1, 0); gtReverbere(30, 30, -1, 0)
  gtBanc(9, 29, 'south', 3); gtBanc(20, 29, 'south', 3)
  bgVoiture(20, 21, 'x', 'gray', 2); S(3, 0, 27, 'minecraft:barrel[facing=up,open=false]'); S(4, 0, 27, 'supplementaries:sack'); S(3, 0, 28, 'minecraft:barrel[facing=north,open=true]')
  for (var i = 0; i < 16; i++) SA(Math.floor(R() * 32), 0, 19 + Math.floor(R() * 13), choix(['minecraft:white_carpet', 'minecraft:light_gray_carpet', 'supplementaries:book_pile']))
  // arriere : cour, tas de charbon, arbres morts
  gtArbreMort(6, 1, 6, true); gtArbreMort(25, 1, 7, true); F(15, 0, 1, 17, 0, 2, 'minecraft:coal_block'); S(16, 1, 1, 'minecraft:coal_block'); S(20, 0, 2, 'minecraft:barrel[facing=up,open=false]')
  gtVeg(0, 0, 31, 31, 0.3)
}


// ================= QUARTIER GOTHIQUE, suite =================
// ---- Maisons etroites a pignon sur rue (boutique au rez-de-chaussee, escalier interieur, combles) ----
function gtEtageMaison(x1, x2, y, t, col) {
  var xa = x1 + 1, xb = x2 - 1, cx = Math.floor((x1 + x2) / 2)
  if (t == 'chambre') {
    LIT(xa + 1, y + 1, 21, col, 'south'); S(xa, y + 1, 22, 'mcwfurnitures:dark_oak_end_table'); S(xa, y + 2, 22, 'minecraft:candle[candles=1,lit=false]')
    S(xb, y + 1, 22, 'minecraft:chest[facing=west]'); S(xa, y + 1, 17, 'mcwfurnitures:dark_oak_table'); S(xa + 1, y + 1, 17, MAT('dark_oak_chair', 'west')); SA(xa, y + 2, 17, 'supplementaries:book_pile')
    F(xa + 1, y + 1, 19, xa + 2, y + 1, 19, 'minecraft:' + col + '_carpet')
  } else if (t == 'salon') {
    S(xa + 1, y + 1, 22, 'mcwfurnitures:red_couch[facing=north,shape=single]'); S(xa + 2, y + 1, 22, 'mcwfurnitures:red_couch[facing=north,shape=single]')
    S(xa + 1, y + 1, 20, 'mcwfurnitures:dark_oak_coffee_table'); S(xa, y + 1, 19, MAT('dark_oak_chair', 'east')); F(xa, y + 1, 9, xa, y + 3, 9, 'minecraft:bookshelf')
    S(xb, y + 1, 18, 'minecraft:decorated_pot'); F(xa + 1, y + 1, 18, xa + 2, y + 1, 18, 'minecraft:brown_carpet')
  } else if (t == 'cuisine') {
    F(xa, y + 1, 23, xa + 2, y + 1, 23, MAT('dark_oak_counter', 'north')); S(xa + 1, y + 1, 23, 'mcwfurnitures:dark_oak_kitchen_sink[facing=north,water=false]'); S(xa + 3, y + 1, 23, 'minecraft:smoker[facing=north,lit=false]')
    S(xa + 1, y + 1, 18, 'mcwfurnitures:dark_oak_table'); S(xa + 1, y + 1, 17, MAT('dark_oak_chair', 'south')); S(xa + 1, y + 1, 19, MAT('dark_oak_chair', 'north')); SA(xa + 1, y + 2, 18, 'minecraft:candle[candles=2,lit=false]')
    S(xa, y + 1, 9, 'minecraft:barrel[facing=up,open=false]'); S(xa, y + 1, 15, 'minecraft:chest[facing=east]')
  } else {
    S(cx, y + 1, 20, 'minecraft:hay_block[axis=x]'); S(cx, y + 1, 21, 'minecraft:barrel[facing=up,open=false]'); S(cx - 1, y + 1, 18, 'minecraft:chest[facing=south]'); S(xa, y + 2, 9, 'minecraft:cobweb'); S(cx - 1, y + 1, 22, 'minecraft:spruce_trapdoor[facing=north,half=bottom,open=false]')
  }
  S(cx, y + 4, 19, GTLH); gtPapiers(xa, 16, xb - 1, 22, y + 1, 3)
}
function gtMaison(o) {
  var x1 = o.x1, x2 = o.x2, zA = 8, zF = 24, H = 5 * o.n, xs = x2 - 2, cx = Math.floor((x1 + x2) / 2)
  F(x1, 0, zA, x2, 0, zF, o.sol || GTD)
  for (var y = 1; y <= H; y++) for (var x = x1; x <= x2; x++) for (var z = zA; z <= zF; z++) {
    if (!(x == x1 || x == x2 || z == zA || z == zF)) continue
    var b = y % 5 == 0 ? o.bande : gtM(o.mur)
    if (o.pan && y % 5 != 0 && (x == x1 || x == x2 || ((z == zA || z == zF) && (x - x1) % 3 == 0))) b = GTL
    S(x, y, z, b)
  }
  for (var e = 1; e <= o.n; e++) F(x1 + 1, 5 * e, zA + 1, x2 - 1, 5 * e, zF - 1, GTD)
  gtToitZ(x1, x2, zA - 1, zF + 1, H + 1, o.toit); gtPignonZ(zA, x1, x2, H + 1, o.pignon || o.mur); gtPignonZ(zF, x1, x2, H + 1, o.pignon || o.mur)
  F(cx, H + 2, zF, cx, H + 3, zF, GP); F(cx, H + 2, zA, cx, H + 2, zA, GP)
  // escalier droit a chaque niveau, tremie et garde-corps
  for (var e = 0; e < o.n; e++) { var y = 5 * e; for (var i = 0; i < 4; i++) { S(xs, y + 1 + i, zA + 6 - i, gtE(GTDO, 'north')); if (i) S(xs, y + i, zA + 6 - i, gtE(GTDO, 'south', 'top')) } F(xs, y + 5, zA + 3, xs, y + 5, zA + 6, AIR); F(xs - 1, y + 6, zA + 3, xs - 1, y + 6, zA + 6, GTF) }
  // devanture, porte, fenetres et jardinieres
  F(x1 + 1, 1, zF, x2 - 3, 1, zF, GTD); F(x1 + 1, 2, zF, x2 - 3, 3, zF, GP); F(x1 + 1, 4, zF, x2 - 1, 4, zF, GTLX); S(x2 - 2, 3, zF, gtM(o.mur))
  PORTE(x2 - 2, 1, zF, o.porte || GTPO, 'south', 'left', 'false'); S(x2 - 2, 0, zF + 1, gtE(GTSB, 'north'))
  for (var e = 1; e < o.n; e++) [x1 + 2, x2 - 2].forEach(xw => { F(xw, 5 * e + 2, zF, xw, 5 * e + 3, zF, GP); S(xw, 5 * e + 1, zF + 1, 'minecraft:dark_oak_trapdoor[facing=south,half=top,open=false]'); S(xw, 5 * e + 2, zF + 1, choix(['minecraft:potted_dead_bush', 'minecraft:flower_pot', 'minecraft:potted_fern', 'minecraft:potted_dead_bush'])) })
  for (var e = 0; e < o.n; e++) F(x1 + 2, 5 * e + 2, zA, x1 + 2, 5 * e + 3, zA, GP)
  PORTE(x2 - 2, 1, zA, GTPS, 'north', 'left', 'false')
  S(x1 + 1, 3, zF + 1, GTF); S(x1 + 1, 2, zF + 1, GTLH); S(x1 + 1, 0, zF + 2, 'minecraft:iron_trapdoor[facing=south,half=bottom,open=false]')
  F(x1 + 1, H + 1, 12, x1 + 1, H + Math.floor((x2 - x1 + 1) / 2) + 2, 12, 'minecraft:bricks'); S(x1 + 1, H + Math.floor((x2 - x1 + 1) / 2) + 3, 12, 'minecraft:decorated_pot')
  for (var e = 1; e < o.n; e++) gtEtageMaison(x1, x2, 5 * e, o.etages[(e - 1) % o.etages.length], o.col)
  gtEtageMaison(x1, x2, H, 'grenier', o.col)
  S(cx, 4, 19, GTLH)
}
function gtMaisons() {
  GTV = {}
  gtSol(0, 0, 31, 31)
  gtDalle(0, 25, 31, 31, [GTS, GTS, 'minecraft:polished_andesite', 'minecraft:mossy_stone_bricks', 'minecraft:cobblestone'])
  gtMaison({ x1: 0, x2: 7, n: 3, mur: GTS, bande: GTPD, toit: GTTS, etages: ['salon', 'chambre'], col: 'green' })
  gtMaison({ x1: 8, x2: 14, n: 4, mur: 'minecraft:bricks', bande: GTP, toit: GTDO, etages: ['cuisine', 'chambre', 'salon'], col: 'red' })
  gtMaison({ x1: 15, x2: 23, n: 3, mur: 'minecraft:calcite', bande: GTLX, pan: true, toit: GTTS, pignon: 'minecraft:calcite', etages: ['chambre', 'cuisine'], col: 'blue' })
  gtMaison({ x1: 24, x2: 31, n: 2, mur: 'minecraft:tuff_bricks', bande: 'minecraft:polished_tuff', toit: 'minecraft:polished_blackstone_brick', etages: ['salon'], col: 'purple' })
  // A : apothicaire
  F(1, 1, 17, 4, 1, 17, MAT('dark_oak_counter', 'south')); S(1, 2, 17, 'supplementaries:jar'); S(3, 2, 17, 'minecraft:brewing_stand'); S(4, 2, 17, 'supplementaries:jar')
  F(1, 1, 19, 1, 3, 22, 'minecraft:chiseled_bookshelf[facing=east]'); S(1, 1, 15, 'minecraft:brewing_stand'); S(2, 1, 15, 'minecraft:barrel[facing=up,open=true]'); S(3, 1, 15, 'minecraft:cauldron'); S(1, 1, 9, 'minecraft:chest[facing=east]')
  ;[1, 2, 3, 4].forEach(x => S(x, 1, 23, choix(['minecraft:potted_fern', 'minecraft:potted_dead_bush', 'minecraft:potted_brown_mushroom', 'minecraft:flower_pot'])))
  // B : librairie ancienne
  F(9, 1, 15, 9, 4, 22, 'minecraft:bookshelf'); F(13, 1, 16, 13, 3, 22, 'minecraft:bookshelf'); F(10, 1, 18, 10, 3, 18, 'minecraft:ladder[facing=east]')
  S(11, 1, 21, 'minecraft:lectern[facing=south]'); S(11, 1, 17, 'mcwfurnitures:dark_oak_table'); S(11, 1, 16, MAT('dark_oak_chair', 'south')); SA(11, 2, 17, 'supplementaries:book_pile'); gtPapiers(10, 15, 12, 23, 1, 5)
  // C : taverne
  F(16, 1, 9, 19, 2, 9, 'minecraft:barrel[facing=south,open=false]'); F(16, 1, 13, 19, 1, 13, MAT('dark_oak_counter', 'south')); S(17, 2, 13, 'supplementaries:jar'); S(19, 2, 13, 'minecraft:candle[candles=2,lit=false]')
  ;[16, 18, 19].forEach(x => S(x, 1, 15, 'mcwfurnitures:dark_oak_stool_chair'))
  S(17, 1, 19, 'mcwfurnitures:dark_oak_table'); S(16, 1, 19, MAT('dark_oak_chair', 'east')); S(18, 1, 19, MAT('dark_oak_chair', 'west')); SA(17, 2, 19, 'minecraft:candle[candles=1,lit=false]')
  S(20, 1, 21, 'mcwfurnitures:dark_oak_table'); S(20, 1, 20, MAT('dark_oak_chair', 'south')); S(20, 1, 22, MAT('dark_oak_chair', 'north')); S(17, 1, 22, 'mcwfurnitures:dark_oak_table'); S(16, 1, 22, MAT('dark_oak_chair', 'east'))
  F(16, 1, 11, 16, 3, 11, 'minecraft:bricks'); S(16, 1, 10, 'minecraft:campfire[lit=false,facing=south]'); S(18, 4, 17, GTLH)
  // D : horloger
  F(25, 1, 17, 25, 1, 20, 'mcwfurnitures:dark_oak_table'); S(26, 1, 18, MAT('dark_oak_chair', 'west')); S(25, 2, 17, 'supplementaries:clock_block[facing=east]'); S(25, 2, 19, 'supplementaries:clock_block[facing=east]')
  F(25, 2, 9, 27, 2, 9, 'supplementaries:clock_block[facing=south]'); S(26, 1, 23, 'supplementaries:clock_block[facing=south]'); S(27, 1, 23, 'supplementaries:clock_block[facing=south]')
  S(25, 1, 14, 'minecraft:grindstone[face=floor,facing=east]'); S(25, 1, 12, 'minecraft:smithing_table'); S(25, 1, 10, 'minecraft:chest[facing=east]'); SA(25, 2, 20, 'supplementaries:book_pile')
  // facades : lierre, pots ; jardins arriere
  F(9, 5, 25, 9, 18, 25, 'minecraft:vine[north=true]')
  F(7, 0, 0, 7, 1, 7, 'minecraft:cobblestone_wall'); F(14, 0, 0, 14, 1, 7, 'minecraft:cobblestone_wall'); F(23, 0, 0, 23, 1, 7, 'minecraft:cobblestone_wall'); F(0, 0, 0, 31, 1, 0, 'minecraft:cobblestone_wall')
  for (var x = 1; x <= 5; x++) for (var z = 2; z <= 5; z++) if (x % 2) { S(x, -1, z, 'minecraft:podzol'); delete GTV[x + ',' + z]; S(x, 0, z, choix(['minecraft:fern', 'minecraft:sweet_berry_bush[age=2]', 'minecraft:dead_bush', 'minecraft:brown_mushroom'])) }
  F(9, 0, 2, 13, 1, 2, 'minecraft:spruce_log[axis=x]'); S(13, 0, 6, 'minecraft:water_cauldron[level=1]'); gtArbreMort(11, 5, 6, true)
  ;[[16, 2], [17, 2], [16, 3], [21, 5], [21, 6]].forEach(c => S(c[0], 0, c[1], 'minecraft:barrel[facing=up,open=false]')); S(16, 1, 2, 'minecraft:barrel[facing=up,open=false]'); S(19, 0, 3, 'farmersdelight:potato_crate'); S(20, 0, 3, 'supplementaries:sack')
  F(25, 0, 1, 30, 2, 1, GTD); F(25, 3, 1, 30, 3, 3, 'minecraft:dark_oak_slab[type=bottom]'); F(25, 0, 2, 25, 2, 3, GTF); F(30, 0, 2, 30, 2, 3, GTF); S(27, 0, 2, 'minecraft:anvil[facing=east]'); S(28, 0, 2, 'minecraft:chest[facing=south]'); S(29, 2, 2, GTLH)
  ;[2, 10, 18, 26].forEach(x => SA(x, 0, 7, 'minecraft:composter'))
  // trottoir
  gtReverbere(4, 30, 0, 1); gtReverbere(20, 30, 0, 1); gtBanc(11, 30, 'north', 3); S(28, 0, 29, 'minecraft:cobblestone_wall'); S(28, 1, 29, 'minecraft:lantern[hanging=false]')
  for (var i = 0; i < 12; i++) SA(Math.floor(R() * 32), 0, 25 + Math.floor(R() * 7), choix(['minecraft:white_carpet', 'minecraft:light_gray_carpet', 'supplementaries:book_pile']))
  gtVeg(0, 0, 31, 31, 0.4)
}

// ---- Cimetiere (enceinte, grille, chapelle-ossuaire, mausolees, tombes) ----
function gtCimetiere() {
  GTV = {}
  gtSol(0, 0, 31, 31)
  for (var x = 0; x <= 31; x++) for (var z = 0; z <= 31; z++) {
    if (!(x == 0 || x == 31 || z == 0 || z == 31)) continue
    if (z == 31 && x >= 1 && x <= 30) { S(x, -1, z, GTS); if (x == 15 || x == 16) continue; S(x, 0, z, gtM(GTS)); if (x < 13 || x > 18 || x == 14 || x == 17) F(x, 1, z, x, 2, z, x % 5 == 1 ? GTSW : 'minecraft:iron_bars') }
    else { for (var y = 0; y <= 2; y++) S(x, y, z, gtM(GTS)); S(x, 3, z, 'minecraft:stone_brick_slab[type=bottom]') }
  }
  ;[13, 18].forEach(x => { F(x, 0, 31, x, 4, 31, GTS); S(x, 5, 31, 'minecraft:chiseled_stone_bricks'); S(x, 6, 31, 'minecraft:lantern[hanging=false]') })
  PORTE(15, 0, 31, 'minecraft:iron_door', 'south', 'left', 'true'); PORTE(16, 0, 31, 'minecraft:iron_door', 'south', 'right', 'false'); F(14, 4, 31, 17, 4, 31, 'minecraft:iron_bars'); S(14, 3, 31, 'minecraft:cobweb')
  gtDalle(15, 11, 16, 30, ['minecraft:gravel', 'minecraft:gravel', 'minecraft:coarse_dirt', 'minecraft:cobblestone']); gtDalle(1, 14, 30, 15, ['minecraft:gravel', 'minecraft:gravel', 'minecraft:coarse_dirt'])
  // chapelle-ossuaire x11..20 z2..10
  F(11, 0, 2, 20, 0, 10, GTPD)
  for (var y = 1; y <= 7; y++) for (var x = 11; x <= 20; x++) for (var z = 2; z <= 10; z++) if (x == 11 || x == 20 || z == 2 || z == 10) S(x, y, z, gtM(GTS))
  gtToitZ(10, 21, 1, 11, 8, GTTS); gtPignonZ(2, 10, 21, 8, GTS); gtPignonZ(10, 10, 21, 8, GTS)
  F(15, 14, 10, 15, 16, 10, GTSW); S(14, 15, 10, GTSW); S(16, 15, 10, GTSW)
  PORTE(15, 1, 10, GTPO, 'south', 'left', 'false'); PORTE(16, 1, 10, GTPO, 'south', 'right', 'false'); F(15, 5, 10, 16, 6, 10, 'minecraft:purple_stained_glass_pane'); F(15, 3, 2, 16, 6, 2, 'minecraft:red_stained_glass_pane')
  F(12, 1, 3, 12, 4, 9, 'minecraft:bone_block[axis=y]'); F(19, 1, 3, 19, 4, 9, 'minecraft:bone_block[axis=y]')
  for (var z = 3; z <= 9; z += 2) for (var y = 2; y <= 3; y++) { S(12, y, z, 'minecraft:skeleton_wall_skull[facing=east]'); S(19, y, z, 'minecraft:skeleton_wall_skull[facing=west]') }
  F(14, 1, 3, 17, 1, 3, 'minecraft:polished_blackstone_bricks'); S(14, 2, 3, 'minecraft:candle[candles=3,lit=false]'); S(17, 2, 3, 'minecraft:candle[candles=4,lit=false]'); S(15, 2, 3, 'minecraft:skeleton_skull[rotation=8]')
  ;[6, 8].forEach(z => [13, 14, 17, 18].forEach(x => S(x, 1, z, gtE(GTDO, 'south')))); F(15, 1, 4, 16, 1, 9, 'minecraft:red_carpet')
  F(15, 8, 6, 15, 12, 6, 'minecraft:chain[axis=y]'); S(15, 7, 6, GTSL); S(13, 6, 3, 'minecraft:cobweb'); S(18, 6, 9, 'minecraft:cobweb')
  // mausolees
  gtMausolee(2, 2, GTS, 'minecraft:iron_door'); gtMausolee(25, 2, GTP, 'minecraft:iron_door'); gtMausolee(2, 9, 'minecraft:polished_blackstone_bricks', 'minecraft:iron_door'); gtMausolee(25, 9, GTS, 'minecraft:iron_door')
  // tombes
  ;[2, 5, 8, 11].forEach(x => [17, 21, 25].forEach(z => gtTombe(x, z))); ;[20, 23, 26, 29].forEach(x => [17, 21, 25].forEach(z => gtTombe(x, z)))
  ;[[8, 3], [8, 7], [23, 3], [23, 7]].forEach(c => gtTombe(c[0], c[1]))
  gtArbreMort(13, 19, 6, false); gtArbreMort(18, 27, 6, true); gtArbreMort(29, 13, 5, false)
  ;[[14, 20], [17, 24], [14, 28]].forEach(p => { S(p[0], 0, p[1], GTSW); S(p[0], 1, p[1], GTSW); S(p[0], 2, p[1], 'minecraft:soul_lantern[hanging=false]') })
  gtBanc(20, 13, 'north', 3); S(27, 0, 29, 'minecraft:grindstone[face=floor,facing=north]'); S(28, 0, 29, 'minecraft:composter'); S(29, 0, 29, 'minecraft:barrel[facing=up,open=false]')
  gtVeg(0, 0, 31, 31, 0.45)
}

// ---- Hospice (plan en U, pharmacie, refectoire, salles communes, cellules d'isolement, cour-cloitre, puits) ----
function gtHospice() {
  GTV = {}
  var M = GTS
  gtSol(0, 0, 31, 31)
  gtDalle(0, 0, 31, 1, [GTS, 'minecraft:polished_andesite', 'minecraft:andesite'])
  function coque(x1, z1, x2, z2) {
    F(x1, 0, z1, x2, 0, z2, M)
    for (var x = x1 + 1; x < x2; x++) for (var z = z1 + 1; z < z2; z++) S(x, 0, z, (x + z) % 2 ? 'minecraft:polished_diorite' : 'minecraft:polished_andesite')
    for (var y = 1; y <= 11; y++) for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) if (x == x1 || x == x2 || z == z1 || z == z2) S(x, y, z, y == 6 ? GTPD : gtM(M))
    F(x1 + 1, 6, z1 + 1, x2 - 1, 6, z2 - 1, GTD); F(x1 + 1, 12, z1 + 1, x2 - 1, 12, z2 - 1, GTD)
  }
  coque(1, 2, 30, 9); coque(1, 9, 8, 27); coque(23, 9, 30, 27)
  gtToitX(1, 30, 1, 10, 13, GTTS); gtPignonX(1, 1, 10, 13, M); gtPignonX(30, 1, 10, 13, M)
  gtToitZ(1, 8, 11, 28, 13, GTTS); gtToitZ(23, 30, 11, 28, 13, GTTS)
  ;[[1, 8], [23, 30]].forEach(w => { gtPignonZ(11, w[0], w[1], 13, M); gtPignonZ(27, w[0], w[1], 13, M) })
  // entree, porche
  PORTE(15, 1, 2, GTPO, 'north', 'left', 'false'); PORTE(16, 1, 2, GTPO, 'north', 'right', 'false'); F(15, 3, 2, 16, 4, 2, GP)
  F(13, 0, 0, 13, 4, 0, 'minecraft:polished_deepslate_wall'); F(18, 0, 0, 18, 4, 0, 'minecraft:polished_deepslate_wall'); F(13, 5, 0, 18, 5, 1, 'minecraft:deepslate_tile_slab[type=bottom]'); F(14, 0, 1, 17, 0, 1, gtE(GTSB, 'south'))
  // fenetres
  ;[3, 6, 9, 21, 24, 27].forEach(x => F(x, 2, 2, x, 4, 2, GP)); ;[3, 6, 9, 14, 17, 21, 24, 27].forEach(x => F(x, 8, 2, x, 10, 2, GP))
  ;[12, 16, 20, 24].forEach(z => { F(1, 2, z, 1, 4, z, GP); F(1, 8, z, 1, 10, z, GP); F(30, 2, z, 30, 4, z, GP); F(30, 8, z, 30, 10, z, 'minecraft:iron_bars') })
  ;[12, 18, 24].forEach(z => { F(8, 2, z, 8, 3, z, GP); F(23, 2, z, 23, 3, z, GP) }); ;[12, 16, 20, 24].forEach(z => { F(8, 8, z, 8, 10, z, GP); F(23, 8, z, 23, 10, z, GP) })
  ;[[1, 5], [30, 5]].forEach(c => { F(c[0], 2, c[1], c[0], 4, c[1], GP); F(c[0], 8, c[1], c[0], 10, c[1], GP) })
  // rez-de-chaussee aile avant : pharmacie, hall, consultation
  F(12, 1, 3, 12, 5, 8, M); F(19, 1, 3, 19, 5, 8, M); PORTE(12, 1, 6, GTPO, 'west', 'left', 'false'); PORTE(19, 1, 6, GTPO, 'east', 'left', 'false')
  for (var i = 0; i < 5; i++) S(18, 1 + i, 8 - i, gtE(GTDO, 'north')); F(18, 6, 4, 18, 6, 8, AIR); F(17, 7, 4, 17, 7, 8, GTF)
  F(14, 1, 5, 16, 1, 5, MAT('dark_oak_counter', 'north')); S(15, 1, 6, MAT('dark_oak_chair', 'north')); S(13, 1, 8, 'minecraft:chest[facing=north]'); SA(15, 2, 5, 'supplementaries:book_pile')
  F(13, 1, 5, 13, 1, 7, gtE(GTDO, 'west')); S(13, 4, 4, GTLH); PORTE(15, 1, 9, GTPO, 'south', 'left', 'false')
  F(6, 1, 6, 10, 1, 6, MAT('dark_oak_counter', 'north')); S(7, 2, 6, 'minecraft:brewing_stand'); S(9, 2, 6, 'minecraft:brewing_stand'); SA(8, 2, 6, 'supplementaries:jar')
  F(6, 1, 8, 10, 3, 8, 'minecraft:chiseled_bookshelf[facing=north]'); S(2, 1, 3, 'minecraft:water_cauldron[level=1]'); S(2, 1, 7, 'minecraft:barrel[facing=up,open=true]'); S(8, 4, 4, GTLH)
  LIT(22, 1, 5, 'white', 'west'); F(24, 1, 3, 24, 2, 6, 'minecraft:white_stained_glass_pane'); S(25, 1, 6, 'mcwfurnitures:dark_oak_table'); S(25, 1, 7, MAT('dark_oak_chair', 'north')); SA(25, 2, 6, 'supplementaries:book_pile')
  S(29, 1, 3, 'minecraft:chest[facing=west]'); S(29, 1, 4, 'minecraft:chest[facing=west]'); S(20, 1, 8, 'minecraft:cauldron'); S(25, 4, 4, GTLH)
  PORTE(4, 1, 9, GTPO, 'south', 'left', 'false'); PORTE(27, 1, 9, GTPO, 'south', 'left', 'false')
  // etage aile avant : bureau du directeur, registres
  F(12, 7, 3, 12, 11, 8, M); F(19, 7, 3, 19, 11, 8, M); PORTE(12, 7, 6, GTPO, 'west', 'left', 'false'); PORTE(19, 7, 6, GTPO, 'east', 'left', 'false')
  S(6, 7, 5, 'mcwfurnitures:dark_oak_table'); S(7, 7, 5, 'mcwfurnitures:dark_oak_table'); S(6, 7, 4, MAT('dark_oak_chair', 'south')); S(5, 7, 6, MAT('dark_oak_chair', 'north')); S(8, 7, 6, MAT('dark_oak_chair', 'north')); SA(6, 8, 5, 'supplementaries:book_pile'); SA(7, 8, 5, 'minecraft:candle[candles=1,lit=false]')
  F(2, 7, 3, 2, 9, 8, 'minecraft:bookshelf'); S(10, 7, 3, 'minecraft:chest[facing=south]'); F(5, 7, 7, 8, 7, 7, 'minecraft:red_carpet'); S(6, 10, 5, GTLH)
  ;[22, 25, 28].forEach(x => F(x, 7, 4, x, 9, 7, 'minecraft:bookshelf')); S(26, 10, 6, GTLH); S(14, 7, 3, 'minecraft:potted_dead_bush'); S(13, 7, 6, gtE(GTDO, 'west')); S(15, 10, 5, GTLH)
  PORTE(4, 7, 9, GTPO, 'south', 'left', 'false'); PORTE(24, 7, 9, GTPO, 'south', 'left', 'false')
  // aile ouest : refectoire et cuisine (rdc), dortoir (etage)
  F(4, 1, 11, 5, 1, 18, 'mcwfurnitures:dark_oak_table'); for (var z = 11; z <= 18; z++) { if (R() > 0.15) S(3, 1, z, gtE(GTDO, 'west')); if (R() > 0.15) S(6, 1, z, gtE(GTDO, 'east')) }
  for (var i = 0; i < 6; i++) SA(4 + Math.floor(R() * 2), 2, 11 + Math.floor(R() * 8), choix(['minecraft:white_carpet', 'minecraft:candle[candles=1,lit=false]', 'minecraft:flower_pot']))
  F(2, 1, 20, 7, 5, 20, M); PORTE(4, 1, 20, GTPO, 'south', 'left', 'false'); PORTE(8, 1, 15, GTPO, 'east', 'left', 'false')
  S(2, 1, 22, 'minecraft:water_cauldron[level=2]'); F(2, 1, 23, 2, 1, 24, 'minecraft:furnace[facing=east,lit=false]'); S(2, 1, 25, 'minecraft:smoker[facing=east,lit=false]'); S(2, 1, 26, 'farmersdelight:stove[facing=east,lit=false]'); S(2, 2, 26, 'farmersdelight:cooking_pot')
  F(7, 1, 21, 7, 1, 25, MAT('dark_oak_counter', 'west')); S(7, 1, 23, 'mcwfurnitures:dark_oak_kitchen_sink[facing=west,water=false]'); F(4, 1, 24, 5, 1, 24, 'mcwfurnitures:dark_oak_table'); S(3, 1, 26, 'minecraft:chest[facing=north]')
  S(4, 5, 15, GTLH); S(5, 5, 23, GTLH); PORTE(4, 1, 27, GTPO, 'south', 'left', 'false')
  ;[11, 13, 15, 17, 19, 21, 23, 25].forEach(z => { LIT(3, 7, z, 'white', 'west'); LIT(6, 7, z, 'white', 'east') }); ;[12, 16, 20, 24].forEach(z => { S(2, 7, z, 'mcwfurnitures:dark_oak_end_table'); S(7, 7, z, 'minecraft:iron_bars') })
  S(4, 11, 14, GTLH); S(5, 11, 22, GTLH); gtPapiers(4, 10, 5, 26, 7, 6)
  // aile est : infirmerie (rdc), cellules d'isolement (etage)
  ;[11, 14, 17, 20, 23].forEach(z => { LIT(25, 1, z, 'white', 'west'); LIT(28, 1, z, 'white', 'east'); F(24, 1, z + 1, 25, 2, z + 1, 'minecraft:white_stained_glass_pane'); F(28, 1, z + 1, 29, 2, z + 1, 'minecraft:white_stained_glass_pane') })
  F(24, 1, 26, 29, 2, 26, 'minecraft:barrel[facing=north,open=false]'); PORTE(23, 1, 15, GTPO, 'west', 'left', 'false'); PORTE(27, 1, 27, GTPO, 'south', 'left', 'false'); S(26, 5, 14, GTLH); S(27, 5, 22, GTLH)
  F(26, 7, 10, 26, 11, 26, M); ;[13, 17, 21, 25].forEach(z => F(27, 7, z, 29, 11, z, M))
  ;[10, 14, 18, 22].forEach((zr, i) => { var zm = zr + 1; PORTE(26, 7, zm, 'minecraft:iron_door', 'west', 'left', i == 0 ? 'true' : 'false'); S(26, 9, zm, 'minecraft:iron_bars'); LIT(28, 7, zm, 'white', 'east'); S(29, 7, zr, 'minecraft:cauldron'); S(27, 7, zr + 2, choix(['minecraft:white_carpet', 'minecraft:cobweb', 'supplementaries:book_pile'])); S(28, 11, zm, GTSL) })
  S(24, 7, 12, gtE(GTDO, 'west')); S(24, 7, 13, gtE(GTDO, 'west')); S(25, 11, 18, GTLH); S(24, 7, 24, 'minecraft:potted_dead_bush')
  // cour-cloitre : galeries, puits, croix, bancs, haies
  gtDalle(15, 10, 16, 26, ['minecraft:gravel', 'minecraft:gravel', 'minecraft:cobblestone']); gtDalle(9, 17, 22, 18, ['minecraft:gravel', 'minecraft:gravel', 'minecraft:cobblestone'])
  ;[11, 14, 20, 23, 26].forEach(z => { F(10, 0, z, 10, 4, z, GTSW); F(21, 0, z, 21, 4, z, GTSW) }); F(9, 5, 10, 10, 5, 26, 'minecraft:deepslate_tile_slab[type=bottom]'); F(21, 5, 10, 22, 5, 26, 'minecraft:deepslate_tile_slab[type=bottom]')
  for (var x = 17; x <= 20; x++) for (var z = 20; z <= 23; z++) { if ((x == 18 || x == 19) && (z == 21 || z == 22)) { F(x, -3, z, x, -1, z, 'minecraft:water'); S(x, -4, z, 'minecraft:mud') } else { S(x, -1, z, 'minecraft:cobblestone'); S(x, 0, z, 'minecraft:cobblestone_wall') } delete GTV[x + ',' + z] }
  S(17, 1, 20, GTF); S(17, 2, 20, GTF); S(20, 1, 23, GTF); S(20, 2, 23, GTF); F(17, 3, 20, 20, 3, 23, 'minecraft:dark_oak_slab[type=bottom]'); S(18, 2, 21, 'minecraft:chain[axis=y]'); S(18, 1, 21, 'minecraft:lantern[hanging=true]'.replace('lantern', 'lantern'))
  S(12, -1, 13, GTS); S(12, 0, 13, 'minecraft:chiseled_stone_bricks'); F(12, 1, 13, 12, 3, 13, GTSW); S(11, 2, 13, GTSW); S(13, 2, 13, GTSW)
  gtBanc(12, 24, 'south', 3); gtBanc(18, 12, 'north', 2); gtArbreMort(13, 21, 6, true)
  for (var x = 11; x <= 20; x++) if (x != 15 && x != 16 && R() < 0.8) S(x, 0, 26, 'minecraft:azalea_leaves[persistent=true]')
  // jardin arriere : mur, tombes des pensionnaires, bois
  F(9, 0, 28, 14, 1, 28, 'minecraft:cobblestone_wall'); F(17, 0, 28, 22, 1, 28, 'minecraft:cobblestone_wall')
  gtTombe(25, 28); gtTombe(29, 28); F(2, 0, 29, 6, 1, 29, 'minecraft:spruce_log[axis=x]'); S(7, 0, 30, 'minecraft:barrel[facing=up,open=false]')
  gtPapiers(10, 10, 22, 26, 0, 6)
  gtVeg(0, 0, 31, 31, 0.4)
}

// ---- Bibliotheque universitaire (salle de lecture a mezzanine, charpente apparente, tourelles, jardin et observatoire) ----
function gtBibliotheque() {
  GTV = {}
  var M = 'minecraft:tuff_bricks', PT = 'minecraft:polished_tuff', BS = 'minecraft:bookshelf'
  gtSol(0, 0, 31, 31)
  gtDalle(0, 0, 31, 2, [GTS, 'minecraft:polished_andesite', 'minecraft:tuff'])
  F(3, 0, 3, 28, 0, 19, PT)
  for (var x = 4; x <= 27; x++) for (var z = 4; z <= 18; z++) S(x, 0, z, (x + z) % 2 ? GTD : 'minecraft:spruce_planks')
  for (var y = 1; y <= 14; y++) for (var x = 3; x <= 28; x++) for (var z = 3; z <= 19; z++) if (x == 3 || x == 28 || z == 3 || z == 19) S(x, y, z, y == 7 ? PT : gtM(M))
  gtToitX(2, 29, 2, 20, 15, GTTS); gtPignonX(3, 2, 20, 15, M); gtPignonX(28, 2, 20, 15, M)
  F(3, 17, 10, 3, 18, 12, 'minecraft:yellow_stained_glass_pane'); F(28, 17, 10, 28, 18, 12, 'minecraft:yellow_stained_glass_pane')
  // charpente a entraits
  ;[7, 11, 15, 19, 24].forEach(x => { F(x, 14, 4, x, 14, 18, GTLZ); S(x, 13, 4, gtE(GTDO, 'north', 'top')); S(x, 13, 18, gtE(GTDO, 'south', 'top')); F(x, 15, 11, x, 23, 11, GTL) })
  S(11, 13, 11, 'mcwlights:iron_chandelier'); S(19, 13, 11, 'mcwlights:iron_chandelier'); S(15, 13, 8, GTLH); S(15, 13, 14, GTLH)
  // mezzanine sur trois cotes et quatre
  F(4, 7, 4, 6, 7, 18, GTD); F(25, 7, 4, 27, 7, 18, GTD); F(7, 7, 4, 24, 7, 6, GTD); F(7, 7, 16, 24, 7, 18, GTD)
  for (var z = 6; z <= 16; z++) { if (z != 10) { S(6, 8, z, GTF); S(25, 8, z, GTF) } }
  for (var x = 7; x <= 24; x++) { S(x, 8, 6, GTF); S(x, 8, 16, GTF) }
  ;[[6, 6], [6, 16], [25, 6], [25, 16], [6, 11], [25, 11], [11, 6], [20, 6], [11, 16], [20, 16]].forEach(c => F(c[0], 1, c[1], c[0], 6, c[1], PT))
  for (var i = 0; i < 6; i++) { S(12 - i, 1 + i, 10, gtE(GTDO, 'west')); S(19 + i, 1 + i, 10, gtE(GTDO, 'east')); if (i) { S(12 - i, i, 10, gtE(GTDO, 'east', 'top')); S(19 + i, i, 10, gtE(GTDO, 'west', 'top')) } }
  var fenDos = [8, 12, 19, 23], fenAv = [7, 10, 21, 24]
  F(4, 8, 4, 4, 12, 18, BS); F(27, 8, 4, 27, 12, 18, BS)
  for (var x = 5; x <= 26; x++) { if (fenDos.indexOf(x) < 0) F(x, 8, 18, x, 12, 18, BS); if (fenAv.indexOf(x) < 0 && (x < 12 || x > 19)) F(x, 8, 4, x, 12, 4, BS) }
  // rez-de-chaussee : rayonnages, tables de lecture, banque de pret, fichier
  F(4, 1, 4, 4, 5, 18, BS); F(27, 1, 4, 27, 5, 18, BS)
  for (var x = 5; x <= 26; x++) if (fenDos.indexOf(x) < 0 && x != 15) F(x, 1, 18, x, 4, 18, BS)
  F(5, 1, 9, 5, 4, 9, 'minecraft:ladder[facing=east]'); F(26, 1, 14, 26, 4, 14, 'minecraft:ladder[facing=west]')
  F(15, 1, 8, 16, 1, 15, 'mcwfurnitures:dark_oak_table')
  for (var z = 8; z <= 15; z++) { if (R() > 0.15) S(14, 1, z, MAT('dark_oak_chair', 'east')); if (R() > 0.15) S(17, 1, z, MAT('dark_oak_chair', 'west')) }
  ;[9, 13].forEach(z => SA(15, 2, z, 'minecraft:lantern[hanging=false]')); for (var i = 0; i < 6; i++) SA(15 + Math.floor(R() * 2), 2, 8 + Math.floor(R() * 8), choix(['supplementaries:book_pile', 'minecraft:white_carpet', 'minecraft:candle[candles=1,lit=false]']))
  F(8, 1, 13, 11, 3, 13, BS); F(8, 1, 16, 11, 3, 16, BS); F(20, 1, 13, 23, 3, 13, BS); F(20, 1, 16, 23, 3, 16, BS)
  F(12, 1, 6, 13, 1, 6, MAT('dark_oak_counter', 'north')); F(18, 1, 6, 19, 1, 6, MAT('dark_oak_counter', 'north')); S(12, 1, 5, MAT('dark_oak_chair', 'south')); SA(13, 2, 6, 'supplementaries:book_pile')
  F(7, 1, 4, 9, 3, 4, 'minecraft:barrel[facing=south,open=false]'); F(22, 1, 4, 24, 3, 4, 'minecraft:barrel[facing=south,open=false]')
  ;[[5, 6, 8], [5, 6, 14], [26, 6, 8], [26, 6, 14]].forEach(c => S(c[0], c[1], c[2], GTLH))
  gtPapiers(7, 7, 24, 15, 1, 12); gtPapiers(7, 5, 24, 5, 8, 4); gtPapiers(7, 17, 24, 17, 8, 4)
  // facade : portail, rosace, lancettes ; facade arriere
  PORTE(15, 1, 3, GTPO, 'north', 'left', 'false'); PORTE(16, 1, 3, GTPO, 'north', 'right', 'false'); F(15, 3, 3, 16, 4, 3, 'minecraft:chiseled_tuff'); F(14, 1, 2, 14, 5, 2, PT); F(17, 1, 2, 17, 5, 2, PT); F(14, 6, 2, 17, 6, 2, gtE('minecraft:tuff_brick', 'south', 'top'))
  for (var x = 12; x <= 19; x++) for (var y = 7; y <= 13; y++) { var d2 = (x - 15.5) * (x - 15.5) + (y - 10) * (y - 10); if (d2 <= 6.5) S(x, y, 3, 'minecraft:' + (d2 < 1 ? 'yellow' : d2 < 3.5 ? 'orange' : 'green') + '_stained_glass_pane'); else if (d2 <= 9) S(x, y, 3, PT) }
  fenAv.forEach(x => { F(x, 2, 3, x, 5, 3, GP); F(x, 9, 3, x, 12, 3, GP) }); fenDos.forEach(x => { F(x, 2, 19, x, 5, 19, GP); F(x, 9, 19, x, 13, 19, GP) })
  PORTE(15, 1, 19, GTPO, 'south', 'left', 'false')
  // tourelles d'angle
  ;[1, 28].forEach(x1 => {
    for (var y = 0; y <= 18; y++) for (var x = x1; x <= x1 + 2; x++) for (var z = 1; z <= 3; z++) S(x, y, z, gtM(M))
    ;[6, 11, 15].forEach(y => S(x1 + 1, y, 1, GP))
    for (var x = x1; x <= x1 + 2; x++) for (var z = 1; z <= 3; z++) S(x, 19, z, x == x1 + 1 && z == 2 ? GTT : (x != x1 + 1 && z != 2) ? 'minecraft:deepslate_tile_slab[type=bottom]' : gtE(GTTS, x < x1 + 1 ? 'east' : x > x1 + 1 ? 'west' : z < 2 ? 'south' : 'north'))
    S(x1 + 1, 20, 2, GTT); S(x1 + 1, 21, 2, 'minecraft:deepslate_tile_wall'); S(x1 + 1, 22, 2, 'minecraft:lightning_rod')
  })
  // jardin : parterres de buis, cadran solaire, observatoire a coupole
  gtDalle(15, 20, 16, 31, ['minecraft:gravel', 'minecraft:gravel', 'minecraft:cobblestone']); gtDalle(5, 25, 22, 25, ['minecraft:gravel', 'minecraft:gravel'])
  for (var x = 4; x <= 12; x++) for (var z = 21; z <= 29; z++) { if (z == 25) continue; var bord = x == 4 || x == 12 || z == 21 || z == 29 || z == 24 || z == 26; S(x, -1, z, 'minecraft:podzol'); delete GTV[x + ',' + z]; if (bord) S(x, 0, z, 'minecraft:azalea_leaves[persistent=true]'); else if (R() < 0.5) S(x, 0, z, choix(['minecraft:fern', 'minecraft:dead_bush', 'minecraft:wither_rose', 'minecraft:short_grass'])) }
  S(15, 0, 25, 'minecraft:chiseled_tuff'); S(15, 1, 25, 'minecraft:lightning_rod')
  var ox = 26, oz = 25
  for (var x = 22; x <= 30; x++) for (var z = 21; z <= 29; z++) {
    var d = Math.sqrt((x - ox) * (x - ox) + (z - oz) * (z - oz)); if (d > 3.4) continue
    S(x, 0, z, PT); delete GTV[x + ',' + z]
    if (d >= 2.4) for (var y = 1; y <= 8; y++) S(x, y, z, gtM(M))
    ;[[9, 4.5], [10, 4.5], [11, 4.5], [12, 4.5]].forEach(c => { var dy = c[0] - 8, rr = 3.4 * Math.sqrt(Math.max(0, 1 - (dy / c[1]) * (dy / c[1]))); if (d <= rr && (d >= rr - 1.25 || rr < 1.8)) S(x, c[0], z, x == ox && z <= oz - 1 ? 'minecraft:glass' : 'minecraft:waxed_weathered_cut_copper') })
  }
  PORTE(26, 1, 22, GTPO, 'north', 'left', 'false'); F(29, 4, 25, 29, 5, 25, GP)
  F(26, 1, 25, 26, 2, 25, GTF); S(26, 3, 25, 'minecraft:waxed_cut_copper'); S(26, 3, 24, 'minecraft:lightning_rod[facing=north]')
  S(24, 1, 25, 'mcwfurnitures:dark_oak_table'); S(24, 1, 26, MAT('dark_oak_chair', 'north')); SA(24, 2, 25, 'supplementaries:book_pile'); S(28, 1, 25, 'minecraft:cartography_table'); S(27, 1, 27, 'minecraft:chest[facing=north]')
  F(26, 8, 25, 26, 11, 25, 'minecraft:chain[axis=y]'); S(26, 7, 25, GTLH)
  gtBanc(18, 30, 'south', 3); gtReverbere(13, 21, 1, 0); gtArbreMort(19, 22, 6, true)
  gtVeg(0, 0, 31, 31, 0.35)
}

// ---- Darse : bassin, halle aux poissons, grue, entrepot ----
function gtQuai() {
  GTV = {}
  gtSol(0, 0, 31, 31)
  gtDalle(0, 0, 31, 31, [GTS, GTS, 'minecraft:cobblestone', 'minecraft:andesite', 'minecraft:mossy_cobblestone'])
  for (var x = 9; x <= 22; x++) for (var z = 0; z <= 17; z++) {
    if (x == 9 || x == 22 || z == 17) { F(x, -4, z, x, -2, z, GTS); S(x, -1, z, 'minecraft:smooth_stone') }
    else { S(x, -4, z, 'minecraft:mud'); F(x, -3, z, x, -2, z, 'minecraft:water'); S(x, -1, z, AIR); if (R() < 0.1) S(x, -1, z, 'minecraft:lily_pad'); if (R() < 0.12) S(x, -3, z, 'minecraft:seagrass') }
  }
  F(10, -3, 8, 10, -1, 8, 'minecraft:ladder[facing=east]'); F(21, -3, 13, 21, -1, 13, 'minecraft:ladder[facing=west]')
  ;[[9, 3], [9, 11], [9, 15], [22, 2], [22, 12]].forEach(p => S(p[0], 0, p[1], 'minecraft:polished_blackstone_wall'))
  // peniche et barque coulee
  F(12, -2, 3, 19, -2, 5, 'minecraft:spruce_planks'); for (var x = 12; x <= 19; x++) { S(x, -1, 3, 'minecraft:spruce_slab[type=bottom]'); S(x, -1, 5, 'minecraft:spruce_slab[type=bottom]') }
  S(12, -1, 4, 'minecraft:spruce_slab[type=bottom]'); S(19, -1, 4, 'minecraft:spruce_slab[type=bottom]'); S(14, -1, 4, 'minecraft:barrel[facing=up,open=false]'); S(16, -1, 4, 'farmersdelight:carrot_crate'); S(17, -1, 4, 'supplementaries:sack'); F(13, -1, 4, 13, 3, 4, GTF)
  F(16, -3, 11, 18, -3, 12, 'minecraft:dark_oak_planks'); S(16, -2, 11, 'minecraft:dark_oak_slab[type=bottom,waterlogged=true]'); S(18, -2, 12, 'minecraft:dark_oak_slab[type=bottom,waterlogged=true]')
  // grue en bois sur le quai est
  F(23, 0, 6, 25, 0, 8, GTS); F(24, 1, 7, 24, 9, 7, GTL); F(19, 9, 7, 23, 9, 7, GTLX); S(23, 8, 7, gtE(GTDO, 'east', 'top'))
  F(19, 3, 7, 19, 8, 7, 'minecraft:chain[axis=y]'); S(19, 2, 7, 'minecraft:barrel[facing=up,open=false]'); S(25, 1, 7, 'minecraft:grindstone[face=floor,facing=west]')
  // halle aux poissons x0..8 z2..26
  ;[1, 7].forEach(x => [2, 6, 10, 14, 18, 22, 26].forEach(z => F(x, 0, z, x, 5, z, GTL)))
  F(1, 6, 2, 1, 6, 26, GTLZ); F(7, 6, 2, 7, 6, 26, GTLZ); ;[2, 6, 10, 14, 18, 22, 26].forEach(z => F(2, 6, z, 6, 6, z, GTLX))
  gtToitZ(0, 8, 1, 27, 7, GTTS); gtPignonZ(2, 0, 8, 7, GTD); gtPignonZ(26, 0, 8, 7, GTD)
  ;[4, 8, 12, 16, 20].forEach(z => {
    F(2, 0, z, 2, 0, z + 2, 'minecraft:polished_andesite'); F(2, 1, z, 2, 1, z + 2, 'minecraft:packed_ice'); F(6, 0, z, 6, 0, z + 2, 'minecraft:polished_andesite')
    S(6, 1, z, 'minecraft:barrel[facing=up,open=true]'); S(6, 1, z + 1, choix(['supplementaries:sack', 'minecraft:dried_kelp_block', 'minecraft:cauldron'])); S(6, 1, z + 2, choix(['minecraft:water_cauldron[level=1]', 'supplementaries:jar', 'minecraft:barrel[facing=up,open=false]']))
  })
  ;[6, 14, 22].forEach(z => S(4, 5, z, GTLH)); ;[[3, 5, 10], [5, 5, 18], [2, 5, 22], [5, 5, 26]].forEach(c => S(c[0], c[1], c[2], 'minecraft:cobweb'))
  // entrepot de brique x23..30 z12..30
  for (var y = 1; y <= 12; y++) for (var x = 23; x <= 30; x++) for (var z = 12; z <= 30; z++) if (x == 23 || x == 30 || z == 12 || z == 30) S(x, y, z, y == 6 ? GTPD : gtM('minecraft:bricks'))
  F(23, 0, 12, 30, 0, 30, GTPD); F(24, 0, 13, 29, 0, 29, 'minecraft:spruce_planks'); F(24, 6, 13, 29, 6, 29, 'minecraft:spruce_planks')
  gtToitZ(22, 31, 11, 31, 13, GTTS); gtPignonZ(12, 22, 31, 13, 'minecraft:bricks'); gtPignonZ(30, 22, 31, 13, 'minecraft:bricks')
  PORTE(23, 1, 15, GTPO, 'west', 'left', 'false'); PORTE(23, 1, 16, GTPO, 'west', 'right', 'true'); PORTE(23, 7, 15, GTPO, 'west', 'left', 'false'); PORTE(23, 7, 16, GTPO, 'west', 'right', 'false')
  F(21, 11, 15, 22, 11, 15, GTLX); F(21, 8, 15, 21, 10, 15, 'minecraft:chain[axis=y]'); S(21, 7, 15, 'minecraft:barrel[facing=up,open=false]')
  ;[14, 18, 22, 26].forEach(z => { F(30, 2, z, 30, 3, z, GP); F(30, 8, z, 30, 9, z, GP) }); ;[20, 24, 28].forEach(z => { F(23, 2, z, 23, 3, z, GP); F(23, 8, z, 23, 9, z, GP) })
  ;[25, 28].forEach(x => { F(x, 2, 12, x, 3, 12, GP); F(x, 8, 12, x, 9, 12, GP) }); F(26, 9, 30, 27, 10, 30, GP); F(26, 15, 30, 27, 15, 30, GP)
  ;[14, 18, 22, 26].forEach(z => { for (var x = 25; x <= 28; x++) { var h = 1 + Math.floor(R() * 3); for (var y = 1; y <= h; y++) S(x, y, z, choix(['farmersdelight:carrot_crate', 'farmersdelight:potato_crate', 'minecraft:barrel[facing=up,open=false]', 'supplementaries:sack'])) } })
  F(29, 1, 13, 29, 6, 13, 'minecraft:ladder[facing=west]')
  ;[[25, 7, 20], [26, 7, 20], [25, 8, 20], [27, 7, 24], [28, 7, 24]].forEach(c => S(c[0], c[1], c[2], c[1] == 8 ? 'minecraft:hay_block[axis=y]' : choix(['supplementaries:sack', 'minecraft:hay_block[axis=x]', 'minecraft:barrel[facing=up,open=false]'])))
  S(26, 7, 27, 'mcwfurnitures:dark_oak_table'); S(26, 7, 28, MAT('dark_oak_chair', 'north')); SA(26, 8, 27, 'supplementaries:book_pile'); S(28, 7, 28, 'minecraft:chest[facing=west]')
  ;[[26, 5, 18], [26, 5, 25], [27, 11, 20], [26, 11, 26]].forEach(c => S(c[0], c[1], c[2], GTLH)); ;[[24, 11, 13], [29, 11, 29], [24, 5, 29]].forEach(c => S(c[0], c[1], c[2], 'minecraft:cobweb'))
  // quai sud : ancre, filets, fumoir, bancs
  S(12, 0, 20, 'minecraft:anvil[facing=north]'); F(12, 1, 20, 12, 2, 20, 'minecraft:chain[axis=y]')
  F(10, 0, 25, 14, 0, 29, GTD); for (var y = 1; y <= 3; y++) for (var x = 10; x <= 14; x++) for (var z = 25; z <= 29; z++) if (x == 10 || x == 14 || z == 25 || z == 29) S(x, y, z, GTD)
  F(9, 4, 24, 15, 4, 30, 'minecraft:dark_oak_slab[type=bottom]'); PORTE(12, 1, 25, GTPS, 'north', 'left', 'false'); S(12, 1, 27, 'minecraft:campfire[lit=false,facing=north]'); F(12, 4, 27, 12, 6, 27, 'minecraft:bricks'); F(11, 3, 26, 13, 3, 28, 'minecraft:chain[axis=x]'); S(11, 1, 28, 'minecraft:barrel[facing=up,open=false]')
  ;[[17, 21], [18, 21], [19, 22], [20, 26]].forEach(c => S(c[0], 0, c[1], choix(['minecraft:barrel[facing=up,open=false]', 'supplementaries:sack', 'farmersdelight:potato_crate'])))
  F(17, 0, 28, 17, 2, 28, GTF); F(21, 0, 28, 21, 2, 28, GTF); F(18, 2, 28, 20, 2, 28, 'minecraft:cobweb')
  gtBanc(10, 19, 'south', 3); gtReverbere(16, 19, 0, -1); gtReverbere(8, 0, 1, 0)
  for (var i = 0; i < 10; i++) SA(Math.floor(R() * 9), 0, 18 + Math.floor(R() * 14), choix(['minecraft:white_carpet', 'supplementaries:sack', 'minecraft:cobweb']))
}

// ---- Jardin d'hiver : serre a structure metallique, kiosque, etang et passerelle, saules, fausse ruine gothique ----
function gtJardin() {
  GTV = {}
  gtSol(0, 0, 31, 31)
  // grille sur rue
  for (var x = 0; x <= 31; x++) { if (x == 14 || x == 15) continue; if (x % 4 == 0 || x == 13 || x == 16) { F(x, 0, 0, x, 2, 0, GTSW); S(x, 3, 0, 'minecraft:stone_brick_slab[type=bottom]') } else F(x, 0, 0, x, 2, 0, 'minecraft:iron_bars') }
  S(13, 3, 0, 'minecraft:chiseled_stone_bricks'); S(16, 3, 0, 'minecraft:chiseled_stone_bricks'); S(13, 4, 0, 'minecraft:lantern[hanging=false]'); S(16, 4, 0, 'minecraft:lantern[hanging=false]')
  PORTE(14, 0, 0, 'minecraft:iron_door', 'north', 'left', 'true'); PORTE(15, 0, 0, 'minecraft:iron_door', 'north', 'right', 'true')
  // allees
  gtDalle(14, 1, 15, 31, ['minecraft:gravel', 'minecraft:gravel', 'minecraft:dirt_path', 'minecraft:coarse_dirt']); gtDalle(10, 6, 13, 6, 'minecraft:gravel'); gtDalle(16, 3, 23, 4, ['minecraft:gravel', 'minecraft:gravel', 'minecraft:coarse_dirt'])
  // etang
  for (var x = 2; x <= 14; x++) for (var z = 13; z <= 28; z++) {
    var e = Math.pow((x - 8) / 5.6, 2) + Math.pow((z - 20.5) / 6.6, 2); if (e > 1) continue
    delete GTV[x + ',' + z]
    if (e > 0.82) { S(x, -1, z, 'minecraft:mud'); if (R() < 0.35) S(x, 0, z, 'minecraft:sugar_cane') }
    else { F(x, -2, z, x, -1, z, 'minecraft:water'); S(x, -3, z, 'minecraft:mud'); if (R() < 0.18) S(x, 0, z, 'minecraft:lily_pad') }
  }
  F(3, 0, 20, 13, 0, 21, 'minecraft:dark_oak_slab[type=bottom]'); F(3, 0, 19, 13, 0, 19, GTF); F(3, 0, 22, 13, 0, 22, GTF)
  // kiosque a musique octogonal centre (6,6)
  var kx = 6, kz = 6
  for (var a = -3; a <= 3; a++) for (var b = -3; b <= 3; b++) {
    if (Math.abs(a) + Math.abs(b) > 5) continue
    var x = kx + a, z = kz + b; S(x, 0, z, GTD); delete GTV[x + ',' + z]
    var poteau = (Math.abs(a) == 3 && Math.abs(b) == 1) || (Math.abs(a) == 1 && Math.abs(b) == 3), bord = Math.abs(a) == 3 || Math.abs(b) == 3 || Math.abs(a) + Math.abs(b) == 5
    if (poteau) F(x, 1, z, x, 4, z, GTL); else if (bord && !(a == 0 && b == 3)) S(x, 1, z, GTF)
    var f = Math.abs(a) >= Math.abs(b) ? (a > 0 ? 'west' : 'east') : (b > 0 ? 'north' : 'south')
    S(x, 5, z, bord ? gtE(GTTS, f) : GTT)
    if (Math.abs(a) <= 2 && Math.abs(b) <= 2 && Math.abs(a) + Math.abs(b) <= 3) S(x, 6, z, (Math.abs(a) == 2 || Math.abs(b) == 2 || Math.abs(a) + Math.abs(b) == 3) ? gtE(GTTS, f) : GTT)
    if (Math.abs(a) + Math.abs(b) <= 1) S(x, 7, z, a == 0 && b == 0 ? GTT : gtE(GTTS, f))
  }
  S(kx, 8, kz, 'minecraft:deepslate_tile_wall'); S(kx, 9, kz, 'minecraft:lightning_rod'); S(kx, 4, kz, GTLH)
  S(kx, 1, kz - 1, 'minecraft:lectern[facing=south]'); S(kx - 1, 1, kz + 1, MAT('dark_oak_chair', 'north')); S(kx + 1, 1, kz + 1, MAT('dark_oak_chair', 'north')); S(kx + 2, 1, kz - 1, 'minecraft:note_block'); SA(kx - 2, 1, kz, 'supplementaries:book_pile')
  // serre x15..30 z5..19, voute en berceau
  function p(z) { var d = Math.abs(z - 12); return 12 - Math.floor(d * d / 12) }
  for (var x = 15; x <= 30; x++) for (var z = 5; z <= 19; z++) {
    var rib = (x - 15) % 3 == 0, bout = x == 15 || x == 30, cote = z == 5 || z == 19
    var verre = rib ? 'minecraft:polished_blackstone' : (R() < 0.1 ? 'minecraft:light_gray_stained_glass' : 'minecraft:glass')
    delete GTV[x + ',' + z]
    S(x, 0, z, bout || cote ? 'minecraft:polished_blackstone_bricks' : GTPD)
    if (cote) { S(x, 1, z, 'minecraft:polished_blackstone_bricks'); F(x, 2, z, x, 7, z, verre) }
    if (bout && !cote) { S(x, 1, z, 'minecraft:polished_blackstone_bricks'); F(x, 2, z, x, p(z), z, z % 3 == 0 ? 'minecraft:polished_blackstone' : 'minecraft:glass') }
    var zo = z < 12 ? z - 1 : z + 1, lo = cote ? p(z) : Math.min(p(z), p(zo))
    F(x, lo, z, x, p(z), z, verre)
  }
  F(21, 13, 11, 24, 13, 13, 'minecraft:glass'); F(21, 14, 11, 24, 14, 13, 'minecraft:polished_blackstone_slab[type=bottom]'); S(22, 15, 12, 'minecraft:lightning_rod')
  PORTE(22, 1, 5, GTPV, 'north', 'left', 'false'); PORTE(23, 1, 5, GTPV, 'north', 'right', 'false')
  // interieur de la serre : massifs, palmiers secs, bassin, bancs
  for (var x = 16; x <= 29; x++) for (var z = 6; z <= 18; z++) {
    if (z >= 11 && z <= 13) continue; if (x == 22 || x == 23) continue
    if (z == 6 || z == 18 || x == 16 || x == 29 || ((z == 9 || z == 15) && x % 4 == 0)) { S(x, 0, z, choix(['minecraft:rooted_dirt', 'minecraft:podzol', 'minecraft:moss_block'])); if (R() < 0.6) S(x, 1, z, choix(['minecraft:azalea', 'minecraft:flowering_azalea', 'minecraft:fern', 'minecraft:dead_bush', 'minecraft:fern'])) }
  }
  ;[[18, 8], [27, 16], [19, 16]].forEach(c => { S(c[0], 0, c[1], 'minecraft:rooted_dirt'); F(c[0], 1, c[1], c[0], 6, c[1], 'minecraft:stripped_jungle_log[axis=y]'); var L = 'minecraft:azalea_leaves[persistent=true]'; S(c[0], 7, c[1], L); ;[[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(d => { S(c[0] + d[0], 7, c[1] + d[1], L); S(c[0] + 2 * d[0], 7, c[1] + 2 * d[1], L); S(c[0] + 2 * d[0], 6, c[1] + 2 * d[1], L) }) })
  for (var x = 21; x <= 24; x++) for (var z = 10; z <= 14; z++) { var bd = x == 21 || x == 24 || z == 10 || z == 14; S(x, 1, z, bd ? 'minecraft:polished_blackstone_brick_slab[type=bottom]' : 'minecraft:moss_carpet') }
  F(22, 1, 11, 23, 1, 13, AIR); F(22, 0, 11, 23, 0, 13, 'minecraft:mud'); F(22, 1, 11, 23, 1, 13, 'minecraft:moss_carpet')
  gtBanc(18, 12, 'south', 2); gtBanc(26, 11, 'north', 2)
  for (var i = 0; i < 12; i++) { var vx = 16 + Math.floor(R() * 14); if ((vx - 15) % 3) S(vx, 2 + Math.floor(R() * 4), 6, 'minecraft:vine[north=true]') }
  ;[[17, 1, 10], [28, 1, 14], [20, 1, 14]].forEach(c => S(c[0], c[1], c[2], choix(['minecraft:potted_fern', 'minecraft:potted_dead_bush', 'minecraft:flower_pot'])))
  // fausse ruine gothique
  F(22, 0, 26, 22, 6, 26, GTS); F(28, 0, 26, 28, 6, 26, GTS); S(23, 6, 26, gtE(GTSB, 'west', 'top')); S(27, 6, 26, gtE(GTSB, 'east', 'top')); F(22, 7, 26, 28, 8, 26, GTS)
  for (var x = 22; x <= 28; x++) { var h = 9 + Math.floor(R() * 3); if (x == 22 || x == 28) h = 11; F(x, 9, 26, x, h - 1, 26, gtM(GTS)) }
  for (var z = 22; z <= 29; z++) { var h = 1 + Math.floor(R() * 5); F(21, 0, z, 21, h - 1, z, gtM(GTS)); delete GTV['21,' + z] }
  for (var x = 23; x <= 27; x++) if (R() < 0.6) S(x, 7, 25, 'minecraft:vine[south=true]')
  for (var i = 0; i < 8; i++) SA(22 + Math.floor(R() * 8), 0, 22 + Math.floor(R() * 9), choix(['minecraft:cobblestone', 'minecraft:mossy_cobblestone_slab[type=bottom]', 'minecraft:stone_brick_slab[type=bottom]', 'minecraft:mossy_cobblestone']))
  // saules, statues, bancs, reverberes
  gtSaule(3, 11); gtSaule(14, 27)
  ;[[11, 9], [18, 23]].forEach(c => { S(c[0], 0, c[1], 'minecraft:chiseled_stone_bricks'); F(c[0], 1, c[1], c[0], 2, c[1], 'minecraft:calcite'); S(c[0], 3, c[1], 'minecraft:polished_diorite_slab[type=bottom]'); gtLibre(c[0], c[1]) })
  gtBanc(16, 22, 'east', 3); gtReverbere(16, 8, -1, 0); gtReverbere(13, 29, 1, 0)
  gtVeg(0, 0, 31, 31, 0.4)
}

// ================= VUES DU QUARTIER GOTHIQUE =================
function vuesGothique() {
  vue('gt_ensemble_sud', 0, 0, 64, 46, 106, 64, 0, 32)
  vue('gt_ensemble_no', 0, 0, 64, 48, -34, 64, 0, 30)
  vue('gt_rue_ouest', 0, 0, -6, 4, 36.5, 60, 3, 40)
  vue('gt_rue_est', 0, 0, 134, 4, 36.5, 60, 3, 40)
  vue('gt_cathedrale', 0, 0, 15.5, 12, 46.5, 15.5, 16, 24)
  vue('gt_cathedrale_tours', 0, 0, 34, 24, 40, 15, 24, 26)
  vue('gt_nef', 0, 0, 15.5, 4, 25, 15.5, 5, 4)
  vue('gt_choeur', 0, 0, 15.5, 4, 15, 15.5, 3, 3)
  vue('gt_beffroi', 32, 0, 15.5, 10, 50, 15.5, 20, 12)
  vue('gt_conseil', 32, 0, 20.5, 10.5, 16.5, 8, 9, 10)
  vue('gt_guichets', 32, 0, 9, 2.6, 14, 8, 1.5, 8)
  vue('gt_maisons', 64, 0, 16, 8, 44, 16, 10, 20)
  vue('gt_taverne', 64, 0, 21.5, 2.6, 22.5, 17, 1.2, 13)
  vue('gt_apothicaire', 64, 0, 5.5, 2.6, 22.5, 2, 1.5, 16)
  vue('gt_cimetiere', 96, 0, 15.5, 10, 46, 15.5, 2, 16)
  vue('gt_ossuaire', 96, 0, 15.5, 3.4, 9.3, 15.5, 3.4, 3)
  vue('gt_hospice', 0, 48, 15.5, 10, -14, 15.5, 6, 8)
  vue('gt_hospice_cour', 0, 48, 15.5, 14, 31, 15.5, 1, 16)
  vue('gt_dortoir', 0, 48, 4.5, 9, 25.5, 4.5, 8, 11)
  vue('gt_bibliotheque', 32, 48, 15.5, 10, -14, 15.5, 10, 6)
  vue('gt_salle_lecture', 32, 48, 15.5, 10.5, 17.4, 15.5, 5, 4)
  vue('gt_observatoire', 32, 48, 20, 10, 40, 26, 5, 25)
  vue('gt_darse', 64, 48, 15.5, 12, -10, 15.5, 0, 12)
  vue('gt_halle_poissons', 64, 48, 4, 3, 27.5, 4, 2, 4)
  vue('gt_jardin', 96, 48, 15, 16, -10, 14, 0, 16)
  vue('gt_serre', 96, 48, 28.5, 4, 12, 16, 4, 12)
  vue('gt_kiosque', 96, 48, 11, 6, 0.5, 6, 3, 6)
  vue('gt_coupe_cathedrale', 144, 0, 16, 32, 40, 16, 0, 14)
  vue('gt_coupe_beffroi', 180, 0, 16, 30, 36, 16, 6, 12)
  vue('gt_coupe_maisons', 216, 0, 16, 24, 38, 16, 4, 16)
  vue('gt_coupe_hospice', 144, 48, 16, 26, -6, 16, 2, 16)
  vue('gt_coupe_bibliotheque', 180, 48, 16, 26, -6, 16, 4, 12)
  vue('gt_coupe_darse', 216, 48, 16, 24, -6, 16, 0, 16)
}


// ================= QUARTIER HAUSSMANNIEN / BRIQUE (plaines, forets, rivieres) =================
// Rangee nord (facades au sud, z29) : grand magasin, immeubles, gare, opera. Boulevard z32..47. Rangee sud (facades au nord, z2) : halles, cite HBM, square, banque.
var HS = 'minecraft:smooth_sandstone', HC = 'minecraft:cut_sandstone', HCH = 'minecraft:chiseled_sandstone', HZ = 'minecraft:deepslate_tile', HZB = 'minecraft:deepslate_tiles'
var HF = 'mcwfences:ornate_metal_fence', HPO = 'mcwdoors:spruce_classic_door', HPV = 'mcwdoors:dark_oak_glass_door', HBR = 'minecraft:bricks', HSB = 'minecraft:stone_bricks'
var HLH = 'minecraft:lantern[hanging=true]', HV = {}
function hbE(m, f, h) { return m + '_stairs[facing=' + f + ',half=' + (h || 'bottom') + ',shape=straight]' }
function hbM(b) {
  var r = R()
  if (b == HS) return r < 0.07 ? 'minecraft:sandstone' : r < 0.11 ? 'minecraft:smooth_stone' : b
  if (b == HBR) return r < 0.07 ? 'createdeco:cracked_red_bricks' : b
  if (b == HSB) return r < 0.1 ? 'minecraft:mossy_stone_bricks' : r < 0.18 ? 'minecraft:cracked_stone_bricks' : b
  return b
}
// mur vieilli : remplissage puis quelques blocs uses
function hbMur(x1, y1, z1, x2, y2, z2, b) {
  F(x1, y1, z1, x2, y2, z2, b)
  for (var x = x1; x <= x2; x++) for (var y = y1; y <= y2; y++) for (var z = z1; z <= z2; z++) { var m = hbM(b); if (m != b) S(x, y, z, m) }
}
function hbSol(x1, z1, x2, z2) {
  for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) {
    var r = R(), b = r < 0.7 ? 'minecraft:grass_block' : r < 0.85 ? 'minecraft:coarse_dirt' : r < 0.95 ? 'minecraft:podzol' : 'minecraft:rooted_dirt'
    S(x, -1, z, b); HV[x + ',' + z] = 1
  }
}
function hbLibre(x, z) { for (var a = -1; a <= 1; a++) for (var b = -1; b <= 1; b++) delete HV[(x + a) + ',' + (z + b)] }
function hbVeg(x1, z1, x2, z2, d) {
  for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) {
    if (!HV[x + ',' + z]) continue
    var r = R()
    if (r < d * 0.45) SA(x, 0, z, 'minecraft:short_grass')
    else if (r < d * 0.6) SA(x, 0, z, choix(['minecraft:dandelion', 'minecraft:poppy', 'minecraft:oxeye_daisy', 'minecraft:cornflower', 'minecraft:azure_bluet']))
    else if (r < d * 0.66) SA(x, 0, z, 'minecraft:fern')
  }
}
// platane : tronc tachete, houppier arrondi
function hbPlatane(x, z, h) {
  var L1 = 'minecraft:birch_leaves[persistent=true]', L2 = 'minecraft:azalea_leaves[persistent=true]'
  for (var a = -3; a <= 3; a++) for (var b = -3; b <= 3; b++) for (var y = h - 2; y <= h + 2; y++) {
    var d = a * a + b * b + (y - h) * (y - h) * 2
    if (d <= 10 && !(d >= 8 && R() < 0.35)) SA(x + a, y, z + b, R() < 0.65 ? L1 : L2)
  }
  F(x, 0, z, x, h, z, 'minecraft:birch_log[axis=y]'); S(x + 1, h - 1, z, 'minecraft:birch_log[axis=x]'); S(x, h - 1, z - 1, 'minecraft:birch_log[axis=z]')
  S(x, -1, z, 'minecraft:rooted_dirt'); hbLibre(x, z)
}
// lampadaire : fut de fonte, une ou deux crosses (dx,dz), lanternes parfois cassees
function hbLampe(x, z, dx, dz, double) {
  F(x, 0, z, x, 5, z, 'minecraft:polished_blackstone_wall'); S(x, 6, z, 'minecraft:polished_blackstone_slab[type=bottom]')
  var bras = double ? [1, -1] : [1]
  bras.forEach(k => { S(x + dx * k, 5, z + dz * k, 'minecraft:polished_blackstone_wall'); if (R() < 0.78) S(x + dx * k, 4, z + dz * k, HLH) })
  hbLibre(x, z)
}
// cheminees de toit en brique avec mitres
function hbCheminee(x, z, y, n) { for (var i = 0; i < n; i++) { F(x + i, y, z, x + i, y + 2, z, HBR); S(x + i, y + 3, z, 'minecraft:decorated_pot') } }
// toit mansarde : brisis (ardoise et lucarnes) puis terrasson en zinc ; trou = zone laissee libre (atrium, dome)
function hbMansarde(x1, z1, x2, z2, y, trou) {
  for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) {
    if (trou && x >= trou[0] && x <= trou[2] && z >= trou[1] && z <= trou[3]) continue
    var dn = z - z1, ds = z2 - z, dw = x - x1, de = x2 - x, d = Math.min(dn, ds, dw, de)
    var f = d == dn ? 'south' : d == ds ? 'north' : d == dw ? 'east' : 'west'
    var le = (f == 'south' || f == 'north') ? x : z
    if (d == 0) S(x, y, z, hbE(HZ, f))
    else if (d == 1) {
      S(x, y, z, HZB); S(x, y + 2, z, HZB)
      S(x, y + 1, z, le % 3 == 1 && Math.min(dw, de, dn, ds) == 1 && !((dw <= 1 || de <= 1) && (dn <= 1 || ds <= 1)) ? GP : HZB)
      S(x, y + 3, z, hbE(HZ, f))
    } else { S(x, y, z, 'minecraft:spruce_planks'); S(x, y + 3, z, HZ + '_slab[type=bottom]') }
  }
}
// bric-a-brac de grenier ou de pieces abandonnees
function hbBazar(x1, z1, x2, z2, y, n) { for (var i = 0; i < n; i++) SA(x1 + Math.floor(R() * (x2 - x1 + 1)), y, z1 + Math.floor(R() * (z2 - z1 + 1)), choix(['minecraft:white_carpet', 'minecraft:light_gray_carpet', 'supplementaries:book_pile', 'supplementaries:sack', 'minecraft:barrel[facing=up,open=false]', 'minecraft:gray_carpet', 'minecraft:decorated_pot'])) }

// ================= BOULEVARD (z32..47) =================
function hbRue() {
  HV = {}
  for (var x = 0; x <= 127; x++) {
    ;[32, 33, 46, 47].forEach(z => S(x, -1, z, R() < 0.72 ? 'minecraft:smooth_stone' : choix(['minecraft:polished_andesite', 'minecraft:andesite', 'minecraft:stone', 'minecraft:gravel'])))
    S(x, -1, 34, 'minecraft:polished_andesite'); S(x, -1, 45, 'minecraft:polished_andesite')
    ;[35, 36, 37, 38, 41, 42, 43, 44].forEach(z => {
      var r = R(); S(x, -1, z, r < 0.7 ? 'minecraft:gray_concrete' : r < 0.86 ? 'minecraft:black_concrete' : r < 0.93 ? 'minecraft:cobblestone' : r < 0.97 ? 'minecraft:gray_concrete_powder' : 'minecraft:gravel')
      if (r > 0.985) S(x, 0, z, 'minecraft:short_grass')
    })
    if (x % 6 < 3) { S(x, -1, 37, 'minecraft:white_concrete'); S(x, -1, 42, 'minecraft:white_concrete') }
  }
  // terre-plein central : gazon, haies basses, massifs
  hbSol(0, 39, 127, 40)
  for (var x = 0; x <= 127; x++) { if (x % 16 == 8) continue; if (x % 4 == 1) { S(x, 0, 39, 'minecraft:azalea_leaves[persistent=true]'); delete HV[x + ',39'] } }
  // passage pieton
  for (var x = 62; x <= 65; x++) for (var z = 35; z <= 44; z++) if (z != 39 && z != 40) S(x, -1, z, z % 2 ? 'minecraft:white_concrete' : 'minecraft:gray_concrete')
  for (var x = 62; x <= 65; x++) { S(x, -1, 39, 'minecraft:smooth_stone'); S(x, -1, 40, 'minecraft:smooth_stone'); delete HV[x + ',39']; delete HV[x + ',40'] }
  // platanes des trottoirs, lampadaires, bancs
  for (var x = 8; x <= 120; x += 16) { hbPlatane(x, 33, 6); hbPlatane(x, 46, 6); hbLampe(x, 39, 0, 1, true) }
  for (var x = 0; x <= 112; x += 16) { if (x == 64) continue; if (x != 96) hbLampe(x + 1, 34, 0, 1); if (x != 16) hbLampe(x + 1, 45, 0, -1) }
  ;[[12, 32, 'north'], [52, 32, 'north'], [84, 47, 'south'], [116, 47, 'south'], [28, 47, 'south']].forEach(b => gtBanc(b[0], b[1], b[2], 3))
  // colonne Morris
  ;[[44, 33], [43, 33], [45, 33], [44, 32], [44, 34]].forEach(p => F(p[0], 0, p[1], p[0], 3, p[1], 'minecraft:green_terracotta'))
  ;[[43, 1, 33, 'minecraft:white_terracotta'], [45, 2, 33, 'minecraft:yellow_terracotta'], [44, 1, 34, 'minecraft:orange_terracotta'], [44, 2, 32, 'minecraft:light_gray_terracotta'], [43, 2, 33, 'minecraft:red_terracotta']].forEach(p => S(p[0], p[1], p[2], p[3]))
  ;[[44, 33], [43, 33], [45, 33], [44, 32], [44, 34]].forEach(p => S(p[0], 4, p[1], 'minecraft:oxidized_cut_copper_slab[type=bottom]'))
  S(44, 4, 33, 'minecraft:oxidized_cut_copper'); S(44, 5, 33, 'minecraft:oxidized_cut_copper_slab[type=bottom]')
  // kiosque a journaux (trottoir sud)
  W(18, 45, 21, 47, 0, 2, 'minecraft:green_terracotta'); F(19, 1, 45, 20, 2, 45, AIR); F(19, 1, 45, 20, 1, 45, 'minecraft:spruce_slab[type=top]')
  S(19, 2, 45, 'supplementaries:book_pile'); S(19, 0, 46, 'minecraft:barrel[facing=up,open=false]'); S(20, 0, 46, 'minecraft:white_carpet'); S(19, 1, 46, AIR)
  F(17, 3, 44, 22, 3, 48, 'minecraft:oxidized_cut_copper_slab[type=bottom]'); F(18, 3, 45, 21, 3, 47, 'minecraft:oxidized_cut_copper'); F(19, 4, 46, 20, 4, 46, 'minecraft:oxidized_cut_copper_slab[type=bottom]')
  S(17, 3, 48, AIR); S(22, 3, 48, AIR); S(17, 3, 44, AIR); S(22, 3, 44, AIR)
  PORTE(21, 0, 46, 'mcwdoors:spruce_classic_door', 'east', 'left', 'true')
  ;[[16, 0, 45], [23, 0, 47], [17, 0, 46], [24, 0, 33]].forEach(p => SA(p[0], p[1], p[2], choix(['minecraft:white_carpet', 'minecraft:light_gray_carpet'])))
  // abribus (trottoir nord)
  F(96, 0, 32, 99, 2, 32, GP); F(96, 0, 33, 96, 2, 33, GP); F(99, 0, 33, 99, 2, 33, 'minecraft:gray_stained_glass_pane')
  F(95, 3, 32, 100, 3, 34, 'minecraft:smooth_stone_slab[type=bottom]'); F(100, 0, 34, 100, 2, 34, 'minecraft:iron_bars'); F(95, 0, 34, 95, 2, 34, 'minecraft:iron_bars')
  F(97, 0, 33, 98, 0, 33, hbE('minecraft:spruce', 'north'))
  S(97, 1, 33, 'minecraft:white_carpet'); S(96, 1, 32, 'minecraft:light_gray_stained_glass_pane')
  // voitures abandonnees, une barricade de sacs, un camion de livraison renverse sur le flanc
  bgVoiture(10, 36, 'x', 'red', 0); bgVoiture(29, 42, 'x', 'blue', 1); bgVoiture(48, 35, 'x', 'white', 2); bgVoiture(74, 43, 'x', 'gray', 0)
  bgVoiture(88, 36, 'x', 'yellow', 1); bgVoiture(108, 41, 'x', 'green', 0); bgVoiture(56, 41, 'z', 'black', 1); bgVoiture(122, 35, 'x', 'light_blue', 2)
  // camion : caisse 6x3 couchee, cabine
  F(34, 0, 35, 39, 2, 37, 'minecraft:white_concrete'); F(35, 1, 35, 38, 1, 35, 'minecraft:light_gray_concrete'); F(40, 0, 35, 41, 1, 37, 'minecraft:red_concrete'); F(41, 1, 36, 41, 1, 36, 'minecraft:tinted_glass')
  F(33, 0, 36, 33, 1, 36, AIR); S(33, 0, 35, 'minecraft:barrel[facing=west,open=true]'); S(32, 0, 36, 'supplementaries:sack'); S(31, 0, 37, 'minecraft:white_carpet'); S(33, 0, 37, 'supplementaries:sack')
  for (var z = 41; z <= 44; z++) { S(120, 0, z, 'supplementaries:sack'); if (z != 43) S(120, 1, z, 'supplementaries:sack') }
  F(119, 0, 35, 119, 0, 38, 'minecraft:spruce_fence'); S(119, 1, 36, 'supplementaries:sack')
  // detritus
  for (var i = 0; i < 46; i++) { var x = Math.floor(R() * 128), z = 32 + Math.floor(R() * 16); if (z == 39 || z == 40) continue; SA(x, 0, z, choix(['minecraft:white_carpet', 'minecraft:light_gray_carpet', 'minecraft:gray_carpet', 'minecraft:brown_carpet', 'supplementaries:book_pile'])) }
  hbVeg(0, 39, 127, 40, 0.8)
  // bouches d'incendie
  ;[[30, 34], [70, 45], [104, 34]].forEach(p => { S(p[0], 0, p[1], 'minecraft:red_nether_brick_wall'); S(p[0], 1, p[1], 'minecraft:red_nether_brick_slab[type=bottom]') })
}


// ================= GRAND MAGASIN A COUPOLE (2x2 chunks, R+4, atrium sous verriere, escalators, ascenseur) =================
function hbGrandMagasin() {
  var NIV = [0, 6, 12, 18, 24], PX = [1, 5, 9, 13, 18, 22, 26, 30], PZ = [2, 6, 10, 14, 18, 22, 26, 29]
  var COL = [[9, 8], [9, 13], [9, 18], [9, 23], [22, 8], [22, 13], [22, 18], [22, 23], [13, 8], [18, 8], [13, 23], [18, 23]]
  function atrium(x, z) { return x >= 10 && x <= 21 && z >= 9 && z <= 22 }
  function trem(x, z, Y) { // tremies des escalators dans le plancher Y
    if ((Y == 6 || Y == 18) && x >= 6 && x <= 7 && z >= 4 && z <= 8) return true
    if ((Y == 12 || Y == 24) && x >= 24 && x <= 25 && z >= 5 && z <= 9) return true
    return x >= 3 && x <= 4 && z >= 10 && z <= 12 && Y > 0
  }
  function plafond(x, z, Y) { var Yn = Y + 6; if (Yn == 30) return !atrium(x, z) || x == 9 || x == 22; return !atrium(x, z) && !trem(x, z, Yn) }
  function estCol(x, z) { return COL.some(c => c[0] == x && c[1] == z) }
  function vitre() { return R() < 0.12 ? 'minecraft:light_gray_stained_glass_pane' : GP }
  // ---- sol, trottoir, cour de livraison ----
  for (var x = 0; x <= 31; x++) { S(x, -1, 30, R() < 0.8 ? 'minecraft:smooth_stone' : 'minecraft:polished_andesite'); S(x, -1, 31, R() < 0.8 ? 'minecraft:smooth_stone' : 'minecraft:andesite') }
  F(1, -1, 0, 30, -1, 1, 'minecraft:gray_concrete'); F(1, -1, 2, 30, -1, 29, 'minecraft:polished_andesite')
  // ---- planchers ----
  for (var x = 2; x <= 29; x++) for (var z = 3; z <= 28; z++) {
    S(x, 0, z, atrium(x, z) ? ((x + z) % 2 ? 'minecraft:smooth_quartz' : 'minecraft:polished_deepslate') : ((x + z) % 2 ? 'minecraft:polished_diorite' : 'minecraft:smooth_quartz'))
    for (var k = 1; k <= 5; k++) { var Y = k * 6; if (k < 5 && (atrium(x, z) || trem(x, z, Y))) continue; if (k == 5 && atrium(x, z)) continue; S(x, Y, z, k == 5 ? 'minecraft:spruce_planks' : ((x + z) % 4 < 2 ? 'minecraft:oak_planks' : 'minecraft:spruce_planks')) }
  }
  // ---- murs : pilastres, bandeaux, grandes baies ----
  function mur(P, pil, a1, a2, cote) {
    for (var i = a1; i <= a2; i++) for (var y = 0; y <= 29; y++) {
      var Y = Math.floor(y / 6) * 6, k = y - Y, b
      if (pil.indexOf(i) >= 0 || k == 0) b = y == 29 && pil.indexOf(i) >= 0 ? HCH : HC
      else if (y == 29) b = HC
      else {
        var v = cote == 'f' ? (Y == 24 ? k <= 3 : k <= 4) : cote == 'c' ? (Y == 0 ? k >= 2 && k <= 4 : k <= 4) : k >= 2 && k <= 3
        b = v ? vitre() : hbM(HS)
      }
      P(i, y, b)
    }
  }
  mur((i, y, b) => S(i, y, 29, b), PX, 1, 30, 'f'); mur((i, y, b) => S(i, y, 2, b), PX, 1, 30, 'd')
  mur((i, y, b) => S(1, y, i, b), PZ, 3, 28, 'c'); mur((i, y, b) => S(30, y, i, b), PZ, 3, 28, 'c')
  F(1, 29, 30, 30, 29, 30, hbE('minecraft:smooth_sandstone', 'north', 'top')); F(1, 29, 1, 30, 29, 1, hbE('minecraft:smooth_sandstone', 'south', 'top'))
  // vitrines barricadees de planches (une baie a l'ouest du rez)
  for (var x = 27; x <= 29; x++) for (var y = 1; y <= 4; y++) S(x, y, 29, y % 2 ? 'minecraft:spruce_planks' : 'minecraft:stripped_spruce_log[axis=x]')
  // ---- entree principale : portes vitrees, imposte, marquise ----
  F(14, 1, 29, 17, 4, 29, GP); S(14, 5, 29, HCH); S(17, 5, 29, HCH); F(15, 5, 29, 16, 5, 29, HC)
  PORTE(15, 1, 29, HPV, 'south', 'left', 'false'); PORTE(16, 1, 29, HPV, 'south', 'right', 'true')
  F(14, 0, 30, 17, 0, 30, hbE('minecraft:smooth_sandstone', 'north'))
  F(11, 5, 30, 20, 5, 31, 'minecraft:white_stained_glass'); F(11, 4, 31, 11, 4, 31, 'minecraft:iron_bars'); F(20, 4, 31, 20, 4, 31, 'minecraft:iron_bars')
  F(11, 6, 30, 20, 6, 30, HF)
  // balcons filants aux 2e et 4e etages
  ;[12, 24].forEach(y => { F(1, y, 30, 30, y, 30, 'minecraft:smooth_sandstone_slab[type=top]'); F(1, y + 1, 30, 30, y + 1, 30, HF) })
  ;[3, 8, 24, 28].forEach(x => S(x, 13, 30, 'minecraft:potted_dead_bush'))
  // lierre sur la facade
  ;[2, 3, 7, 23, 24, 29].forEach(x => { var h = 2 + Math.floor(R() * 8); for (var y = 1; y <= h && y <= 10; y++) if (!(x >= 11 && x <= 20 && y >= 4)) S(x, y, 30, 'minecraft:vine[north=true]') })
  // ---- atrium : colonnes, galeries, corniches sous les balcons interieurs ----
  COL.forEach(c => F(c[0], 0, c[1], c[0], 29, c[1], 'minecraft:quartz_pillar'))
  ;[6, 12, 18, 24].forEach(Y => {
    for (var x = 9; x <= 22; x++) ;[8, 23].forEach(z => { if (!estCol(x, z)) { S(x, Y + 1, z, HF); S(x, Y - 1, z, hbE('minecraft:smooth_sandstone', z == 8 ? 'north' : 'south', 'top')) } })
    for (var z = 9; z <= 22; z++) ;[9, 22].forEach(x => { if (!estCol(x, z)) { S(x, Y + 1, z, HF); S(x, Y - 1, z, hbE('minecraft:smooth_sandstone', x == 9 ? 'west' : 'east', 'top')) } })
  })
  // massif central et bancs en couronne
  F(14, 1, 15, 17, 1, 16, 'minecraft:moss_block'); S(15, 2, 15, 'minecraft:flowering_azalea'); S(16, 2, 16, 'minecraft:azalea'); S(14, 2, 16, 'minecraft:fern'); S(17, 2, 15, 'minecraft:short_grass')
  F(13, 1, 15, 13, 1, 16, hbE('minecraft:quartz', 'east')); F(18, 1, 15, 18, 1, 16, hbE('minecraft:quartz', 'west'))
  F(14, 1, 14, 17, 1, 14, hbE('minecraft:quartz', 'south')); F(14, 1, 17, 17, 1, 17, hbE('minecraft:quartz', 'north'))
  // lustre pendu sous la coupole, eclats de verre au sol
  F(15, 22, 15, 15, 41, 15, 'minecraft:chain[axis=y]'); S(15, 21, 15, 'mcwlights:iron_chandelier')
  ;[[11, 12], [19, 20], [12, 19], [20, 11]].forEach(p => S(p[0], 1, p[1], 'minecraft:light_blue_stained_glass_pane'))
  // ---- escalators croises ----
  function escalator(xs, Y, sens) {
    var f = sens > 0 ? 'south' : 'north'
    for (var i = 0; i < 6; i++) { var z = sens > 0 ? 4 + i : 9 - i; for (var x = xs; x <= xs + 1; x++) { S(x, Y + 1 + i, z, hbE('minecraft:polished_blackstone', f)); if (i) S(x, Y + i, z, hbE('minecraft:polished_blackstone', OPP[f], 'top')) } }
    var za = sens > 0 ? 4 : 5, zb = sens > 0 ? 8 : 9
    F(xs - 1, Y + 7, za, xs - 1, Y + 7, zb, HF); F(xs + 2, Y + 7, za, xs + 2, Y + 7, zb, HF); F(xs, Y + 7, sens > 0 ? 3 : 10, xs + 1, Y + 7, sens > 0 ? 3 : 10, HF)
  }
  escalator(6, 0, 1); escalator(24, 6, -1); escalator(6, 12, 1); escalator(24, 18, -1)
  // ---- ascenseur a cage de fer, cabine coincee entre deux etages ----
  var BAR = 'minecraft:iron_bars'
  F(2, 0, 9, 5, 29, 9, BAR); F(2, 0, 13, 5, 29, 13, BAR); F(2, 0, 10, 2, 29, 12, BAR); F(5, 0, 10, 5, 29, 12, BAR)
  F(3, 1, 10, 4, 29, 12, AIR); F(3, 0, 10, 4, 0, 12, 'minecraft:iron_block')
  NIV.forEach(Y => F(5, Y + 1, 11, 5, Y + 2, 11, AIR))
  F(3, 13, 10, 4, 13, 12, 'minecraft:spruce_planks'); F(3, 17, 10, 4, 17, 12, 'minecraft:spruce_planks'); S(4, 14, 11, 'minecraft:red_carpet'); S(3, 16, 11, HLH)
  F(3, 18, 11, 3, 29, 11, 'minecraft:chain[axis=y]'); F(4, 18, 11, 4, 29, 11, 'minecraft:chain[axis=y]')
  // ---- rayons ----
  function libre(x, z, Y) {
    var Zs = [[8, 7, 23, 24], [4, 2, 9, 11], [22, 2, 27, 11], [1, 8, 6, 14]]; if (Y == 0) Zs.push([12, 23, 19, 29]); if (Y == 24) Zs.push([9, 2, 22, 6])
    return !Zs.some(q => x + 2 >= q[0] && x <= q[2] && z + 1 >= q[1] && z <= q[3])
  }
  var W4 = ['oak', 'spruce', 'birch', 'dark_oak']
  function rayon(x, z, Y, t) {
    var y = Y + 1, w = choix(W4)
    if (t == 0) {
      if ((x + z) % 8 < 4) { F(x, y, z, x + 2, y, z, 'minecraft:smooth_quartz'); F(x, y + 1, z, x + 2, y + 1, z, 'minecraft:glass') }
      else { F(x, y, z, x + 2, y, z, 'minecraft:quartz_slab[type=top]'); for (var i = 0; i < 3; i++) if (R() < 0.75) S(x + i, y + 1, z, choix(['supplementaries:jar', 'minecraft:candle[candles=3,lit=false]', 'minecraft:flower_pot', 'supplementaries:jar'])) }
      if (R() < 0.4) S(x + Math.floor(R() * 3), y, z + 1, 'supplementaries:jar')
    } else if (t == 1) {
      for (var i = 0; i < 3; i++) { var c = choix(COULS); if (R() < 0.8) S(x + i, y, z, 'minecraft:' + c + '_banner[rotation=0]'); else S(x + i, y, z, 'minecraft:' + c + '_carpet'); c = choix(COULS); if (R() < 0.7) S(x + i, y, z + 1, 'minecraft:' + c + '_banner[rotation=8]') }
    } else if (t == 2) {
      var r = R()
      if (r < 0.35) { var cp = choix(CANAPES); for (var i = 0; i < 3; i++) S(x + i, y, z, 'mcwfurnitures:' + cp + '_couch[facing=south,shape=single]'); S(x + 1, y, z + 1, 'mcwfurnitures:' + w + '_coffee_table') }
      else if (r < 0.7) { S(x + 1, y, z, 'mcwfurnitures:' + w + '_table'); S(x, y, z, MAT(w + '_chair', 'east')); S(x + 2, y, z, MAT(w + '_chair', 'west')); S(x + 1, y + 1, z, 'minecraft:candle[candles=2,lit=false]'); S(x + 1, y, z + 1, MAT(w + '_chair', 'north')) }
      else { LIT(x + 1, y, z, choix(COULS), 'south'); S(x, y, z + 1, 'mcwfurnitures:' + w + '_end_table'); S(x + 2, y, z + 1, 'mcwfurnitures:' + w + '_end_table'); S(x + 2, y + 1, z + 1, 'minecraft:candle[candles=1,lit=false]') }
    } else if (t == 3) {
      F(x, y, z, x + 2, y + 1, z, 'minecraft:bookshelf')
      for (var i = 0; i < 3; i++) if (R() < 0.7) S(x + i, y, z + 1, choix(['minecraft:jukebox', 'minecraft:note_block', 'minecraft:target', 'minecraft:red_wool', 'minecraft:yellow_wool', 'minecraft:blue_wool', 'supplementaries:globe', 'minecraft:decorated_pot']))
    } else {
      S(x + 1, y, z, 'mcwfurnitures:' + w + '_table'); S(x + 1, y, z + 1, 'mcwfurnitures:' + w + '_table')
      ;[z, z + 1].forEach(zz => { if (R() < 0.85) S(x, y, zz, MAT(w + '_chair', 'east')); if (R() < 0.85) S(x + 2, y, zz, MAT(w + '_chair', 'west')) })
      S(x + 1, y + 1, z, choix(['supplementaries:jar', 'minecraft:candle[candles=1,lit=false]', 'minecraft:potted_white_tulip'])); if (R() < 0.5) S(x + 1, y + 1, z + 1, 'minecraft:flower_pot')
    }
  }
  NIV.forEach((Y, t) => { for (var x = 3; x <= 27; x += 4) for (var z = 4; z <= 26; z += 4) if (libre(x, z, Y)) rayon(x, z, Y, t) })
  // salon de the : office et vitrine a patisseries le long du mur nord
  var wt = 'dark_oak'
  for (var x = 10; x <= 21; x++) {
    S(x, 25, 3, x == 12 ? 'mcwfurnitures:' + wt + '_kitchen_sink[facing=south,water=false]' : x == 15 || x == 16 ? 'farmersdelight:stove[facing=south,lit=false]' : MAT(wt + '_counter', 'south'))
    if (x != 15 && x != 16) S(x, 27, 3, 'mcwfurnitures:' + wt + '_kitchen_cabinet[facing=south,hinge=' + (x % 2 ? 'right' : 'left') + ']')
  }
  S(15, 26, 3, 'farmersdelight:cooking_pot'); S(11, 26, 3, 'farmersdelight:cutting_board[facing=south]'); S(19, 26, 3, 'supplementaries:jar')
  F(12, 25, 6, 19, 25, 6, 'minecraft:quartz_slab[type=top]'); for (var x = 12; x <= 19; x++) if (R() < 0.6) S(x, 26, 6, choix(['supplementaries:jar', 'minecraft:cake', 'minecraft:candle[candles=2,lit=false]']))
  // ---- eclairage et toiles sous les plafonds ----
  NIV.forEach(Y => {
    for (var x = 4; x <= 28; x += 6) for (var z = 5; z <= 23; z += 6) if (plafond(x, z, Y) && !estCol(x, z) && !(x >= 2 && x <= 5 && z >= 9 && z <= 13)) S(x, Y + 5, z, R() < 0.8 ? HLH : 'minecraft:cobweb')
    for (var i = 0; i < 5; i++) { var x = 2 + Math.floor(R() * 28), z = 3 + Math.floor(R() * 26); if (plafond(x, z, Y) && !atrium(x, z) && !estCol(x, z) && !(x >= 2 && x <= 7 && z >= 3 && z <= 13) && !(x >= 23 && x <= 26)) SA(x, Y + 5, z, 'minecraft:cobweb') }
    for (var i = 0; i < 10; i++) { var x = 2 + Math.floor(R() * 28), z = 3 + Math.floor(R() * 26); if ((Y == 0 || !atrium(x, z)) && !trem(x, z, Y) && !(x >= 1 && x <= 9 && z >= 2 && z <= 14) && !(x >= 22 && x <= 27 && z <= 11) && !estCol(x, z)) SA(x, Y + 1, z, choix(['minecraft:white_carpet', 'minecraft:light_gray_carpet', 'supplementaries:book_pile', 'minecraft:gray_carpet'])) }
  })
  // ---- combles mansardes, tambour et coupole de vitrail ----
  hbMansarde(1, 2, 30, 29, 30, [9, 8, 22, 23])
  W(9, 8, 22, 23, 30, 35, HC); F(9, 35, 8, 22, 35, 8, HCH); F(9, 35, 23, 22, 35, 23, HCH)
  ;[[15, 8], [16, 8], [15, 23], [16, 23]].forEach(p => F(p[0], 34, p[1], p[0], 35, p[1], GP)); ;[[9, 15], [9, 16], [22, 15], [22, 16]].forEach(p => F(p[0], 34, p[1], p[0], 35, p[1], GP))
  function din(x, y, z) { if (y < 36) return x >= 9 && x <= 22 && z >= 8 && z <= 23; var a = (x - 15.5) / 7, b = (z - 15.5) / 8, c = (y - 35.5) / 7; return a * a + b * b + c * c <= 1 }
  for (var x = 9; x <= 22; x++) for (var z = 8; z <= 23; z++) for (var y = 36; y <= 43; y++) {
    if (!din(x, y, z)) continue
    if (din(x + 1, y, z) && din(x - 1, y, z) && din(x, y, z + 1) && din(x, y, z - 1) && din(x, y + 1, z)) continue
    S(x, y, z, x == 15 || x == 16 || z == 15 || z == 16 ? 'minecraft:waxed_copper_block' : y <= 37 ? 'minecraft:yellow_stained_glass' : y <= 39 ? 'minecraft:orange_stained_glass' : 'minecraft:light_blue_stained_glass')
  }
  S(15, 43, 15, 'minecraft:lightning_rod[facing=up]')
  for (var x = 10; x <= 21; x++) for (var z = 9; z <= 22; z++) if (!din(x, 36, z) || ((x - 15.5) * (x - 15.5) / 49 + (z - 15.5) * (z - 15.5) / 64 > 0.98)) S(x, 35, z, 'minecraft:waxed_cut_copper')
  // pavillons d'angle a dome de cuivre
  ;[1, 26].forEach(x1 => {
    var x2 = x1 + 4
    F(x1 + 1, 31, 26, x2 - 1, 35, 28, AIR); hbMur(x1, 30, 25, x2, 35, 25, HS); hbMur(x1, 30, 29, x2, 35, 29, HS); hbMur(x1, 30, 26, x1, 35, 28, HS); hbMur(x2, 30, 26, x2, 35, 28, HS)
    F(x1, 30, 25, x1, 35, 25, HC); F(x2, 30, 25, x2, 35, 25, HC); F(x1, 30, 29, x1, 35, 29, HC); F(x2, 30, 29, x2, 35, 29, HC)
    F(x1 + 2, 32, 29, x1 + 2, 33, 29, GP); F(x1 + 2, 32, 25, x1 + 2, 33, 25, GP); F(x1, 32, 27, x1, 33, 27, GP); F(x2, 32, 27, x2, 33, 27, GP)
    F(x1, 36, 25, x2, 36, 29, 'minecraft:oxidized_cut_copper'); F(x1 + 1, 37, 26, x2 - 1, 37, 28, 'minecraft:oxidized_cut_copper'); S(x1 + 2, 38, 27, 'minecraft:oxidized_cut_copper_slab[type=bottom]')
    S(x1 + 2, 31, 27, 'minecraft:barrel[facing=up,open=false]'); S(x1 + 1, 31, 28, 'supplementaries:sack'); S(x1 + 2, 35, 27, HLH)
  })
  // fronton au-dessus de l'entree, oeil-de-boeuf
  F(12, 30, 29, 19, 31, 29, HS); F(13, 32, 29, 18, 32, 29, HS); F(14, 33, 29, 17, 33, 29, HS); F(15, 34, 29, 16, 34, 29, HCH); F(15, 31, 29, 16, 32, 29, GP)
  hbCheminee(4, 5, 34, 2); hbCheminee(25, 5, 34, 2); hbCheminee(4, 19, 34, 1); hbCheminee(27, 19, 34, 1)
  hbBazar(3, 4, 7, 20, 31, 6); hbBazar(24, 4, 28, 20, 31, 6)
  // ---- cour de livraison ----
  PORTE(20, 1, 2, HPO, 'north', 'left', 'false'); F(24, 0, 0, 26, 0, 0, 'minecraft:green_terracotta'); F(24, 1, 0, 26, 1, 0, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false]')
  S(4, 0, 0, 'minecraft:barrel[facing=up,open=false]'); S(5, 0, 0, 'supplementaries:sack'); S(4, 0, 1, 'minecraft:white_carpet'); S(28, 0, 1, 'minecraft:barrel[facing=north,open=true]')
}


// ================= DEUX IMMEUBLES DE RAPPORT (R+5 + combles, porte cochere, cafe, boulangerie, pharmacie, cour) =================
// Batiment A x0..15, batiment B x16..31, profondeur z12..29 ; cour z0..11. Par etage : cage d'escalier x+6..8 z13..18, palier z20..21, 2 appartements.
function hbImmeubles() {
  var NIV = [0, 6, 12, 18, 24, 30], PL = 'minecraft:calcite'
  for (var x = 0; x <= 31; x++) { S(x, -1, 30, R() < 0.8 ? 'minecraft:smooth_stone' : 'minecraft:polished_andesite'); S(x, -1, 31, R() < 0.8 ? 'minecraft:smooth_stone' : 'minecraft:andesite') }
  // ---- cour pavee ----
  for (var x = 0; x <= 31; x++) for (var z = 0; z <= 11; z++) { var r = R(); S(x, -1, z, r < 0.6 ? 'minecraft:cobblestone' : r < 0.78 ? 'minecraft:stone_bricks' : r < 0.9 ? 'minecraft:mossy_cobblestone' : 'minecraft:gravel'); if (r > 0.95) S(x, 0, z, 'minecraft:short_grass') }
  hbMur(0, 0, 0, 31, 2, 0, HSB); F(0, 3, 0, 31, 3, 0, 'minecraft:stone_brick_slab[type=bottom]'); hbMur(0, 0, 1, 0, 2, 11, HSB); hbMur(31, 0, 1, 31, 2, 11, HSB)
  hbPlatane(5, 5, 7); gtBanc(8, 2, 'south', 3)
  // atelier d'artisan sous appentis
  F(23, 0, 1, 30, 0, 5, 'minecraft:spruce_planks'); F(23, 1, 1, 23, 3, 5, 'minecraft:spruce_planks'); F(24, 1, 1, 30, 3, 1, 'minecraft:spruce_planks'); F(30, 1, 2, 30, 3, 5, 'minecraft:spruce_planks')
  F(23, 4, 1, 30, 4, 6, 'minecraft:smooth_stone_slab[type=bottom]'); F(23, 1, 6, 23, 3, 6, 'minecraft:spruce_fence'); F(30, 1, 6, 30, 3, 6, 'minecraft:spruce_fence')
  S(25, 1, 2, 'minecraft:crafting_table'); S(26, 1, 2, 'minecraft:anvil[facing=east]'); S(28, 1, 2, 'minecraft:grindstone[face=floor,facing=south]'); S(29, 1, 2, 'minecraft:barrel[facing=up,open=true]')
  S(29, 1, 4, 'minecraft:smithing_table'); S(24, 1, 4, 'supplementaries:sack'); S(27, 1, 4, 'minecraft:white_carpet'); S(26, 3, 3, HLH)
  // poubelles, velo rouille (barreaux), linge oublie
  F(14, 0, 1, 15, 0, 1, 'minecraft:green_terracotta'); F(14, 1, 1, 15, 1, 1, 'minecraft:iron_trapdoor[facing=south,half=bottom,open=false]'); S(17, 0, 1, 'minecraft:iron_bars'); S(18, 0, 1, 'minecraft:iron_bars')
  ;[[11, 9], [20, 7], [2, 10]].forEach(p => SA(p[0], 0, p[1], choix(['minecraft:white_carpet', 'supplementaries:sack', 'minecraft:gray_carpet'])))
  // ---- deux batiments ----
  ;[0, 16].forEach((bx, ib) => {
    // planchers
    NIV.forEach(L => F(bx + 1, L, 13, bx + 14, L, 28, L == 0 ? 'minecraft:polished_andesite' : 'minecraft:spruce_planks'))
    F(bx + 1, 36, 13, bx + 14, 36, 28, 'minecraft:spruce_planks')
    // murs mitoyens et pignons aveugles
    hbMur(bx, 0, 12, bx, 35, 29, ib == 0 ? PL : HS); hbMur(bx + 15, 0, 12, bx + 15, 35, 29, ib == 1 ? PL : HS)
    // facade sur rue (z29) : bossage au rez, pierre de taille, bandeaux
    var BA = [[2, 3], [5, 6], [9, 10], [12, 13]]
    for (var x = bx + 1; x <= bx + 14; x++) for (var y = 0; y <= 35; y++) {
      var k = y % 6, b = y < 6 ? (y % 2 ? HC : HS) : k == 0 ? HC : hbM(HS)
      if (y >= 6 && k >= 1 && k <= 4 && BA.some(p => x - bx >= p[0] && x - bx <= p[1])) b = (y < 30 || k <= 3) ? GP : b
      S(x, y, 29, b)
    }
    F(bx, 35, 30, bx + 15, 35, 30, hbE('minecraft:smooth_sandstone', 'north', 'top')); F(bx, 11, 30, bx + 15, 11, 30, hbE('minecraft:smooth_sandstone', 'north', 'top'))
    // facade sur cour (z12) : enduit, fenetres simples, jour d'escalier
    for (var x = bx + 1; x <= bx + 14; x++) for (var y = 0; y <= 35; y++) { var k = y % 6, w = [2, 3, 11, 12].indexOf(x - bx) >= 0 && k >= 2 && k <= 4 && y >= 6; S(x, y, 12, w ? GP : (k == 0 ? HS : hbM(PL))) }
    NIV.forEach(L => { if (L < 30) F(bx + 7, L + 3, 12, bx + 7, L + 4, 12, GP) })
    // balcons filants (2e et 5e), garde-corps de fenetres aux autres etages
    ;[12, 30].forEach(L => { F(bx + 1, L, 30, bx + 14, L, 30, 'minecraft:smooth_sandstone_slab[type=top]'); F(bx + 1, L + 1, 30, bx + 14, L + 1, 30, HF) })
    ;[6, 18, 24].forEach(L => BA.forEach(p => F(bx + p[0], L + 1, 30, bx + p[1], L + 1, 30, HF)))
    ;[12, 30].forEach(L => { if (R() < 0.7) S(bx + 3 + Math.floor(R() * 9), L + 1, 30, 'minecraft:potted_dead_bush') })
    // ---- etages ----
    NIV.forEach((L, n) => {
      var y = L
      // cage d'escalier, palier, cloisons
      F(bx + 5, y + 1, 13, bx + 5, y + 5, 21, PL); F(bx + 9, y + 1, 13, bx + 9, y + 5, 21, PL); F(bx + 6, y + 1, 19, bx + 8, y + 5, 19, PL)
      F(bx + 1, y + 1, 22, bx + 14, y + 5, 22, PL)
      if (n > 0) F(bx + 7, y + 1, 23, bx + 7, y + 5, 28, PL)
      PORTE(bx + 7, y + 1, 19, HPO, 'south', 'left', 'false'); PORTE(bx + 5, y + 1, 20, HPO, 'west', 'left', R() < 0.3 ? 'true' : 'false'); PORTE(bx + 9, y + 1, 20, HPO, 'east', 'right', 'false')
      F(bx + 6, y, 20, bx + 8, y, 21, 'minecraft:spruce_planks'); S(bx + 7, y + 5, 20, HLH); S(bx + 6, y + 1, 21, 'supplementaries:doormat[facing=north]')
      if (n > 0 || ib == 1) { PORTE(bx + 6, y + 1, 22, HPO, 'south', 'left', 'false'); PORTE(bx + 8, y + 1, 22, HPO, 'south', 'right', R() < 0.4 ? 'true' : 'false') }
      if (n < 5) {
        var pair = n % 2 == 0, m = 'minecraft:spruce'
        for (var i = 0; i < 6; i++) {
          if (pair) { S(bx + 6, y + 1 + i, 13 + i, hbE(m, 'south')); if (i) S(bx + 6, y + i, 13 + i, hbE(m, 'north', 'top')) }
          else { S(bx + 8, y + 1 + i, 18 - i, hbE(m, 'north')); if (i) S(bx + 8, y + i, 18 - i, hbE(m, 'south', 'top')) }
        }
        if (pair) F(bx + 6, y + 6, 13, bx + 6, y + 6, 17, AIR); else F(bx + 8, y + 6, 14, bx + 8, y + 6, 18, AIR)
      }
      if (n == 0) return
      // appartements
      var et = R() < 0.5 ? 1 : 0
      piece(cadre(bx + 1, 13, bx + 4, 21, 'north', y, 5), choix(['chambre', 'cuisine']), et)
      piece(cadre(bx + 10, 13, bx + 14, 21, 'north', y, 5), choix(['chambre', 'cuisine', 'sdb', 'chambre']), et)
      piece(cadre(bx + 1, 23, bx + 6, 28, 'south', y, 5), choix(['salon', 'salle']), et)
      piece(cadreInv(bx + 8, 23, bx + 14, 28, 'south', y, 5), choix(['salon', 'salle', 'bureau']), R() < 0.5 ? 1 : 0)
      if (R() < 0.5) SA(bx + 2 + Math.floor(R() * 4), y + 5, 24 + Math.floor(R() * 4), 'minecraft:cobweb')
    })
    // porte de la cour vers l'escalier
    PORTE(bx + 7, 1, 12, HPO, 'north', 'left', 'false'); F(bx + 7, 3, 12, bx + 7, 4, 12, PL); S(bx + 7, 0, 11, hbE('minecraft:stone_brick', 'north'))
    // combles : chambres de bonne
    for (var x = bx + 3; x <= bx + 12; x += 3) { if (R() < 0.6) LIT(x, 37, 15, choix(['white', 'gray', 'brown']), 'south'); SA(x, 37, 26, choix(['minecraft:chest[facing=south]', 'supplementaries:sack', 'minecraft:barrel[facing=up,open=false]'])) }
    hbBazar(bx + 2, 18, bx + 13, 24, 37, 5)
  })
  hbMansarde(0, 12, 31, 29, 36)
  hbCheminee(15, 15, 40, 2); hbCheminee(15, 26, 40, 2); hbCheminee(3, 20, 40, 1); hbCheminee(28, 20, 40, 1)
  // ===== rez-de-chaussee A : cafe, porte cochere, loge =====
  // porte cochere x10..13
  F(9, 1, 13, 9, 5, 28, PL); F(14, 1, 13, 14, 5, 28, PL); F(10, 0, 12, 13, 0, 29, 'minecraft:cobblestone'); F(10, 1, 12, 13, 4, 12, AIR)
  F(10, 1, 29, 13, 4, 29, AIR); F(10, 5, 29, 13, 5, 29, HC); S(11, 5, 29, HCH); S(12, 5, 29, HCH); F(10, 1, 22, 13, 5, 22, AIR)
  PORTE(10, 1, 29, HPO, 'south', 'left', 'true'); PORTE(11, 1, 29, HPO, 'south', 'right', 'true'); PORTE(12, 1, 29, HPO, 'south', 'left', 'false'); PORTE(13, 1, 29, HPO, 'south', 'right', 'false')
  S(11, 5, 17, HLH); S(12, 5, 25, HLH); S(13, 1, 15, 'minecraft:green_terracotta'); S(13, 2, 15, 'minecraft:iron_trapdoor[facing=west,half=bottom,open=false]')
  F(13, 2, 19, 13, 2, 21, 'minecraft:chiseled_bookshelf[facing=west]'); S(10, 1, 26, 'supplementaries:sack'); S(11, 1, 14, 'minecraft:white_carpet')
  PORTE(9, 1, 20, HPO, 'east', 'left', 'false')
  // loge de la concierge
  piece(cadre(1, 13, 4, 21, 'north', 0, 5), 'chambre', 1)
  // cafe x1..8 z23..28
  for (var x = 1; x <= 8; x++) for (var z = 23; z <= 28; z++) S(x, 0, z, (x + z) % 2 ? 'minecraft:white_concrete' : 'minecraft:black_concrete')
  F(1, 1, 29, 8, 4, 29, GP); F(1, 5, 29, 8, 5, 29, 'minecraft:dark_oak_planks'); F(1, 1, 29, 1, 5, 29, 'minecraft:dark_oak_planks'); F(8, 1, 29, 8, 5, 29, 'minecraft:dark_oak_planks')
  PORTE(4, 1, 29, HPV, 'south', 'left', 'true')
  for (var x = 0; x <= 9; x++) S(x, 5, 30, x % 2 ? 'minecraft:red_wool' : 'minecraft:white_wool'); S(3, 5, 30, AIR); S(6, 4, 30, AIR)
  for (var x = 2; x <= 7; x++) { S(x, 1, 24, MAT('dark_oak_counter', 'south')); S(x, 1, 23, MAT('dark_oak_drawer', 'south')); if (R() < 0.7) S(x, 2, 23, choix(['supplementaries:jar', 'minecraft:flower_pot', 'minecraft:candle[candles=3,lit=false]'])) }
  S(3, 2, 24, 'supplementaries:jar'); S(6, 2, 24, 'minecraft:brewing_stand')
  ;[[2, 27], [6, 27]].forEach(t => { S(t[0], 1, t[1], 'mcwfurnitures:dark_oak_table'); S(t[0] - 1, 1, t[1], MAT('dark_oak_chair', 'east')); S(t[0] + 1, 1, t[1], MAT('dark_oak_chair', 'west')); S(t[0], 2, t[1], 'minecraft:candle[candles=1,lit=false]') })
  S(4, 5, 26, 'mcwlights:iron_chandelier'); S(8, 1, 26, 'minecraft:barrel[facing=up,open=false]')
  // terrasse sur le trottoir
  ;[[2, 31], [6, 31]].forEach(t => { S(t[0], 0, t[1], 'mcwfurnitures:oak_table'); S(t[0] - 1, 0, t[1], MAT('oak_chair', 'east')); if (R() < 0.6) S(t[0] + 1, 0, t[1], MAT('oak_chair', 'west')) })
  // ===== rez-de-chaussee B : boulangerie et pharmacie =====
  // fournil (arriere gauche) et reserve (arriere droite)
  for (var x = 17; x <= 20; x++) for (var z = 13; z <= 21; z++) S(x, 0, z, 'minecraft:terracotta')
  F(17, 1, 13, 17, 3, 15, 'minecraft:bricks'); S(17, 1, 14, 'minecraft:blast_furnace[facing=east,lit=false]'); S(18, 1, 13, 'minecraft:furnace[facing=south,lit=false]')
  ;[[19, 13], [20, 13], [20, 16], [18, 18]].forEach(p => S(p[0], 1, p[1], 'supplementaries:sack')); S(19, 1, 16, 'mcwfurnitures:oak_table'); S(19, 2, 16, 'minecraft:flower_pot'); S(18, 5, 16, HLH)
  for (var x = 26; x <= 30; x++) for (var z = 13; z <= 21; z++) S(x, 0, z, 'minecraft:polished_andesite')
  for (var z = 13; z <= 19; z++) { S(30, 1, z, MAT('dark_oak_drawer', 'west')); S(30, 2, z, MAT('dark_oak_drawer', 'west')); if (R() < 0.6) S(30, 3, z, 'supplementaries:jar') }
  S(27, 1, 13, 'minecraft:barrel[facing=up,open=false]'); S(28, 1, 13, 'minecraft:chest[facing=south]'); S(27, 1, 17, 'supplementaries:sack'); S(28, 5, 17, HLH)
  // boulangerie x17..22 z23..28
  for (var x = 17; x <= 22; x++) for (var z = 23; z <= 28; z++) S(x, 0, z, (x + z) % 2 ? 'minecraft:white_terracotta' : 'minecraft:light_gray_terracotta')
  for (var x = 17; x <= 21; x++) { S(x, 1, 25, MAT('oak_counter', 'south')); S(x, 2, 25, choix(['minecraft:cake', 'supplementaries:jar', 'minecraft:air', 'minecraft:cake'])); S(x, 1, 23, 'minecraft:barrel[facing=south,open=false]') }
  S(19, 2, 23, 'supplementaries:sack'); S(19, 5, 26, HLH)
  F(17, 1, 29, 22, 4, 29, GP); F(17, 5, 29, 22, 5, 29, 'minecraft:dark_oak_planks'); S(17, 1, 29, 'minecraft:dark_oak_planks'); S(22, 1, 29, 'minecraft:dark_oak_planks'); PORTE(20, 1, 29, HPV, 'south', 'left', 'false')
  F(17, 1, 28, 18, 1, 28, 'minecraft:oak_slab[type=bottom]'); S(17, 2, 28, AIR); S(18, 1, 27, 'minecraft:white_carpet')
  // pharmacie x24..30 z23..28 : boiseries, bocaux, comptoir
  for (var x = 24; x <= 30; x++) for (var z = 23; z <= 28; z++) S(x, 0, z, (x + z) % 2 ? 'minecraft:smooth_quartz' : 'minecraft:green_terracotta')
  for (var x = 25; x <= 30; x++) for (var y = 1; y <= 3; y++) S(x, y, 23, y == 3 ? 'minecraft:chiseled_bookshelf[facing=south]' : MAT('dark_oak_drawer', 'south'))
  for (var x = 25; x <= 30; x++) if (R() < 0.7) S(x, 4, 23, 'supplementaries:jar')
  for (var z = 24; z <= 27; z++) { S(30, 1, z, MAT('dark_oak_drawer', 'west')); S(30, 2, z, 'supplementaries:jar') }
  for (var x = 25; x <= 28; x++) S(x, 1, 25, MAT('dark_oak_counter', 'south')); S(26, 2, 25, 'minecraft:brewing_stand'); S(27, 2, 25, 'supplementaries:jar')
  S(27, 5, 26, 'mcwlights:iron_chandelier')
  F(24, 1, 29, 30, 4, 29, GP); F(24, 5, 29, 30, 5, 29, 'minecraft:warped_planks'); S(24, 1, 29, 'minecraft:warped_planks'); S(30, 1, 29, 'minecraft:warped_planks'); PORTE(27, 1, 29, HPV, 'south', 'left', 'true')
  F(23, 1, 23, 23, 5, 28, PL); F(23, 1, 29, 23, 5, 29, HC)
  S(25, 1, 28, 'minecraft:white_carpet'); S(29, 1, 27, 'supplementaries:book_pile')
}


// ================= GARE (batiment voyageurs en brique, halle voutee de verre, trois voies, train abandonne) =================
// Voies (est-ouest) : A rail z2, B rail z10, C rail z18 ; quais P1 z4..7, P2 z13..16, P3 z20..21 ; batiment voyageurs z22..29.
function hbGare() {
  function p(z) { return 16 - Math.floor((z - 10.5) * (z - 10.5) / 17) }
  for (var x = 0; x <= 31; x++) { S(x, -1, 30, R() < 0.8 ? 'minecraft:smooth_stone' : 'minecraft:polished_andesite'); S(x, -1, 31, R() < 0.8 ? 'minecraft:smooth_stone' : 'minecraft:andesite') }
  // ---- voies, ballast, traverses ----
  ;[2, 10, 18].forEach(zr => {
    var z1 = zr == 10 ? 8 : zr - 1, z2 = zr == 10 ? 12 : zr + 1
    for (var x = 0; x <= 31; x++) for (var z = z1; z <= z2; z++) {
      var r = R(); S(x, -1, z, x % 2 == 0 && Math.abs(z - zr) <= 1 ? 'minecraft:stripped_spruce_log[axis=z]' : r < 0.9 ? 'minecraft:gravel' : 'minecraft:coarse_dirt')
      if (r >= 0.9 && Math.abs(z - zr) > 1) S(x, 0, z, 'minecraft:short_grass')
    }
    F(0, -1, zr, 31, -1, zr, 'minecraft:stripped_spruce_log[axis=x]'); F(0, 0, zr, 31, 0, zr, 'minecraft:rail[shape=east_west]')
  })
  // ---- quais ----
  ;[[4, 7], [13, 16], [20, 21]].forEach(q => {
    for (var x = 0; x <= 31; x++) for (var z = q[0]; z <= q[1]; z++) S(x, 0, z, z == q[0] || z == q[1] ? 'minecraft:polished_andesite' : (R() < 0.85 ? 'minecraft:smooth_stone' : 'minecraft:stone'))
    F(0, -1, q[0], 31, -1, q[1], 'minecraft:stone')
    if (q[0] != 20) { F(0, 1, q[0], 31, 1, q[0], 'minecraft:yellow_carpet'); F(0, 1, q[1], 31, 1, q[1], 'minecraft:yellow_carpet') } else F(0, 1, 20, 31, 1, 20, 'minecraft:yellow_carpet')
  })
  // ---- mur nord, halle voutee : verre, fermes de fonte tous les 6, colonnes sur les quais ----
  for (var x = 1; x <= 30; x++) for (var y = 0; y <= 9; y++) S(x, y, 0, x % 6 == 0 ? HC : (x % 6 == 3 && y >= 3 && y <= 6) ? GP : hbM(HBR))
  for (var x = 1; x <= 30; x++) for (var z = 0; z <= 21; z++) {
    var lo = p(z); if (z > 0) lo = Math.min(lo, p(z - 1) + 1); if (z < 21) lo = Math.min(lo, p(z + 1) + 1)
    for (var y = lo; y <= p(z); y++) S(x, y, z, x % 6 == 0 ? 'minecraft:polished_blackstone' : (R() < 0.15 ? 'minecraft:gray_stained_glass' : 'minecraft:glass'))
  }
  // tympans vitres aux deux bouts, la partie basse reste ouverte au passage des trains
  ;[1, 30].forEach(x => { for (var z = 0; z <= 21; z++) { S(x, 7, z, 'minecraft:polished_blackstone'); for (var y = 8; y < p(z); y++) S(x, y, z, z % 4 == 1 ? 'minecraft:iron_bars' : GP) } })
  for (var x = 3; x <= 27; x += 6) ;[6, 14].forEach(z => { F(x, 1, z, x, p(z) - 2, z, 'minecraft:polished_deepslate_wall'); S(x, p(z) - 1, z, 'minecraft:polished_deepslate') })
  // suspensions sous les fermes
  ;[6, 18].forEach(x => ;[5, 15].forEach(z => { F(x, 7, z, x, p(z) - 1, z, 'minecraft:chain[axis=y]'); S(x, 6, z, HLH) }))
  // ---- materiel roulant ----
  // voiture voyageurs verte x4..18 z8..12
  var VG = 'minecraft:green_concrete'
  ;[5, 6, 16, 17].forEach(x => { S(x, 0, 9, 'minecraft:polished_blackstone'); S(x, 0, 11, 'minecraft:polished_blackstone') })
  F(4, 1, 8, 18, 1, 12, 'minecraft:black_concrete'); F(5, 1, 9, 17, 1, 11, 'minecraft:spruce_planks')
  for (var x = 4; x <= 18; x++) for (var y = 2; y <= 4; y++) { var b = y == 3 && x > 4 && x < 18 ? GP : VG; S(x, y, 8, b); S(x, y, 12, b) }
  F(4, 2, 9, 4, 4, 11, VG); F(18, 2, 9, 18, 4, 11, VG); S(4, 3, 10, GP); S(18, 3, 10, GP)
  ;[5, 17].forEach(x => { F(x, 2, 8, x, 3, 8, AIR); F(x, 2, 12, x, 3, 12, AIR) })
  F(4, 5, 8, 18, 5, 8, 'minecraft:smooth_stone_slab[type=bottom]'); F(4, 5, 12, 18, 5, 12, 'minecraft:smooth_stone_slab[type=bottom]'); F(4, 5, 9, 18, 5, 11, 'minecraft:light_gray_concrete')
  for (var x = 7; x <= 14; x += 3) ;[9, 11].forEach(z => { S(x, 2, z, hbE('minecraft:spruce', 'west')); S(x + 1, 2, z, 'mcwfurnitures:oak_end_table'); S(x + 2, 2, z, hbE('minecraft:spruce', 'east')) })
  S(9, 4, 10, HLH); S(13, 4, 10, HLH); S(8, 3, 9, 'minecraft:brown_shulker_box'); S(12, 2, 10, 'minecraft:white_carpet'); S(15, 2, 10, 'supplementaries:book_pile')
  // locomotive diesel rouge x22..30 z9..11
  ;[23, 29].forEach(x => { S(x, 0, 9, 'minecraft:polished_blackstone'); S(x, 0, 11, 'minecraft:polished_blackstone') })
  F(22, 1, 9, 30, 1, 11, 'minecraft:black_concrete')
  W(22, 9, 24, 11, 2, 4, 'minecraft:red_concrete'); F(23, 2, 10, 23, 4, 10, AIR); S(22, 3, 10, GP); S(23, 3, 9, GP); S(23, 3, 11, GP); F(22, 5, 9, 24, 5, 11, 'minecraft:red_concrete')
  S(23, 2, 10, hbE('minecraft:spruce', 'west')); S(23, 4, 10, HLH)
  F(25, 2, 9, 30, 3, 11, 'minecraft:red_concrete'); for (var x = 25; x <= 30; x += 2) { S(x, 2, 9, 'minecraft:yellow_concrete'); S(x, 2, 11, 'minecraft:yellow_concrete') }
  F(26, 4, 10, 29, 4, 10, 'minecraft:iron_bars'); S(30, 3, 10, 'minecraft:redstone_lamp'); S(31, 1, 9, 'minecraft:polished_blackstone_wall'); S(31, 1, 11, 'minecraft:polished_blackstone_wall')
  // wagon couvert eventre sur la voie C, caisses repandues sur le quai
  ;[9, 14].forEach(x => { S(x, 0, 17, 'minecraft:polished_blackstone'); S(x, 0, 19, 'minecraft:polished_blackstone') })
  F(8, 1, 17, 15, 1, 19, 'minecraft:spruce_planks'); W(8, 17, 15, 19, 2, 4, 'minecraft:stripped_spruce_wood'); F(8, 5, 17, 15, 5, 19, 'minecraft:spruce_slab[type=bottom]')
  F(11, 2, 17, 12, 4, 17, AIR); S(9, 2, 18, 'minecraft:barrel[facing=up,open=false]'); S(13, 2, 18, 'supplementaries:sack'); S(14, 2, 18, 'minecraft:barrel[facing=up,open=false]'); S(10, 2, 18, 'minecraft:chest[facing=north]')
  ;[[11, 16], [12, 15], [10, 14], [13, 16]].forEach(q => S(q[0], 1, q[1], choix(['minecraft:barrel[facing=up,open=false]', 'supplementaries:sack', 'minecraft:barrel[facing=north,open=true]'])))
  // heurtoirs, signal, valises, bancs de quai
  ;[2, 18].forEach(z => { S(0, 0, z, 'minecraft:red_concrete'); S(0, 0, z - 1, 'minecraft:polished_blackstone_wall'); S(0, 0, z + 1, 'minecraft:polished_blackstone_wall'); S(0, 1, z, 'minecraft:polished_blackstone_slab[type=bottom]') })
  F(29, 1, 5, 29, 4, 5, 'minecraft:polished_blackstone_wall'); S(29, 5, 5, 'minecraft:redstone_lamp'); S(29, 6, 5, 'minecraft:polished_blackstone_slab[type=bottom]')
  ;[[7, 5], [20, 6], [24, 14], [2, 15], [15, 21]].forEach(q => S(q[0], 1, q[1], choix(['minecraft:brown_shulker_box', 'minecraft:black_shulker_box', 'minecraft:red_shulker_box', 'supplementaries:sack'])))
  ;[[10, 5], [22, 5], [8, 15], [20, 15]].forEach(b => { F(b[0], 1, b[1], b[0] + 2, 1, b[1], hbE('minecraft:spruce', b[1] == 5 ? 'north' : 'south')); S(b[0] - 1, 1, b[1], 'minecraft:spruce_trapdoor[facing=west,half=bottom,open=true]'); S(b[0] + 3, 1, b[1], 'minecraft:spruce_trapdoor[facing=east,half=bottom,open=true]') })
  for (var i = 0; i < 18; i++) { var x = Math.floor(R() * 32), z = choix([5, 6, 14, 15, 21]); SA(x, 1, z, choix(['minecraft:white_carpet', 'minecraft:light_gray_carpet', 'supplementaries:book_pile'])) }
  // ===== batiment voyageurs x3..28 z22..29 =====
  F(3, -1, 22, 28, -1, 29, 'minecraft:stone'); F(4, 0, 23, 27, 0, 28, 'minecraft:polished_andesite')
  for (var x = 13; x <= 18; x++) for (var z = 23; z <= 28; z++) S(x, 0, z, (x + z) % 2 ? 'minecraft:smooth_quartz' : 'minecraft:polished_deepslate')
  // ailes R+1 (x3..11 et x20..28), pavillon central (x12..19) haut de 19
  // aile x1..x2, pignon exterieur en xg
  function aile(x1, x2, xg) {
    for (var x = x1; x <= x2; x++) for (var y = 0; y <= 11; y++) {
      var coin = x == x1 || x == x2, fen = !coin && (x - x1) % 3 == 2 && ((y >= 2 && y <= 4) || (y >= 7 && y <= 10))
      S(x, y, 29, coin ? (y % 2 ? HC : HSB) : y == 5 || y == 11 ? HC : fen ? GP : hbM(HBR)); S(x, y, 22, coin ? (y % 2 ? HC : HSB) : y == 5 || y == 11 ? HC : fen && y > 5 ? GP : hbM(HBR))
    }
    for (var z = 23; z <= 28; z++) for (var y = 0; y <= 11; y++) S(xg, y, z, y == 5 || y == 11 ? HC : (z == 25 || z == 26) && y >= 7 && y <= 10 ? GP : hbM(HBR))
    var xa = Math.min(x1, x2) + (xg == x1 ? 1 : 0), xb = Math.max(x1, x2) - (xg == x2 ? 1 : 0)
    F(xa, 6, 23, xb, 6, 28, 'minecraft:spruce_planks'); F(xa, 12, 23, xb, 12, 28, 'minecraft:spruce_planks')
    gtToitX(x1, x2, 22, 29, 12, HZ); gtPignonX(xg, 22, 29, 12, HBR)
  }
  aile(3, 11, 3); aile(20, 28, 28)
  // pavillon
  for (var x = 12; x <= 19; x++) for (var y = 0; y <= 19; y++) { var c = x == 12 || x == 19; S(x, y, 29, c ? (y % 2 ? HC : HSB) : y == 19 ? HC : hbM(HBR)); S(x, y, 22, c ? (y % 2 ? HC : HSB) : y == 19 || y == 5 ? HC : hbM(HBR)) }
  for (var z = 23; z <= 28; z++) for (var y = 12; y <= 19; y++) { S(12, y, z, hbM(HBR)); S(19, y, z, hbM(HBR)) }
  F(12, 1, 23, 12, 11, 28, HBR); F(19, 1, 23, 19, 11, 28, HBR); F(13, 20, 23, 18, 20, 28, 'minecraft:spruce_planks')
  // grande baie en plein cintre, portes, horloge
  PORTE(14, 1, 29, HPV, 'south', 'left', 'true'); PORTE(15, 1, 29, HPV, 'south', 'right', 'false'); PORTE(16, 1, 29, HPV, 'south', 'left', 'false'); PORTE(17, 1, 29, HPV, 'south', 'right', 'true')
  F(13, 1, 29, 13, 4, 29, HC); F(18, 1, 29, 18, 4, 29, HC); F(14, 3, 29, 17, 4, 29, GP); F(13, 5, 29, 18, 5, 29, HC)
  F(13, 6, 29, 18, 11, 29, GP); F(14, 12, 29, 17, 12, 29, GP); F(15, 13, 29, 16, 13, 29, GP); S(13, 12, 29, HC); S(18, 12, 29, HC); S(14, 13, 29, HC); S(17, 13, 29, HC); F(15, 14, 29, 16, 14, 29, HCH)
  for (var y = 6; y <= 11; y++) S(15, y, 29, 'minecraft:iron_bars')
  F(14, 15, 29, 17, 18, 29, 'minecraft:white_concrete'); S(14, 15, 29, HC); S(17, 15, 29, HC); S(14, 18, 29, HC); S(17, 18, 29, HC)
  S(15, 17, 29, 'minecraft:gold_block'); S(15, 18, 29, 'minecraft:black_concrete'); S(16, 16, 29, 'minecraft:black_concrete'); F(14, 15, 30, 17, 15, 30, 'minecraft:smooth_sandstone_slab[type=top]')
  hbMansarde(12, 22, 19, 29, 20); F(15, 24, 25, 16, 24, 26, HZB); F(15, 25, 25, 16, 25, 26, HF)
  // marquise
  F(11, 5, 30, 20, 5, 31, 'minecraft:white_stained_glass'); S(11, 4, 31, 'minecraft:iron_bars'); S(20, 4, 31, 'minecraft:iron_bars')
  F(14, 0, 30, 17, 0, 30, hbE('minecraft:smooth_sandstone', 'north'))
  // portes vers le quai P3
  PORTE(14, 1, 22, HPV, 'north', 'left', 'false'); PORTE(15, 1, 22, HPV, 'north', 'right', 'true'); PORTE(16, 1, 22, HPV, 'north', 'left', 'false'); PORTE(17, 1, 22, HPV, 'north', 'right', 'false')
  F(14, 3, 22, 17, 4, 22, GP); PORTE(24, 1, 22, HPO, 'north', 'left', 'false'); PORTE(7, 1, 22, HPO, 'north', 'left', 'false')
  // hall : tableau des departs a palettes, bancs, lustre
  for (var x = 13; x <= 18; x++) for (var y = 7; y <= 10; y++) S(x, y, 23, R() < 0.3 ? choix(['minecraft:yellow_concrete', 'minecraft:white_concrete']) : 'minecraft:black_concrete')
  F(13, 6, 23, 18, 6, 23, 'minecraft:polished_blackstone_slab[type=top]')
  F(14, 1, 26, 17, 1, 26, hbE('minecraft:dark_oak', 'south')); F(14, 1, 27, 17, 1, 27, hbE('minecraft:dark_oak', 'north'))
  F(15, 12, 25, 15, 19, 25, 'minecraft:chain[axis=y]'); S(15, 11, 25, 'mcwlights:iron_chandelier'); S(16, 1, 24, 'minecraft:brown_shulker_box'); S(13, 1, 23, 'minecraft:potted_dead_bush'); S(18, 1, 23, 'minecraft:potted_dead_bush')
  // guichets (aile ouest) : hygiaphones dans le mur du hall
  ;[24, 26].forEach(z => { S(12, 2, z, 'minecraft:iron_bars'); S(11, 1, z, MAT('oak_counter', 'east')); S(10, 1, z, MAT('oak_chair', 'east')); S(13, 1, z, 'minecraft:white_carpet') })
  PORTE(12, 1, 28, HPO, 'east', 'left', 'false')
  S(7, 1, 26, 'mcwfurnitures:oak_table'); S(6, 1, 26, MAT('oak_chair', 'east')); S(7, 2, 26, 'supplementaries:book_pile'); F(8, 1, 23, 10, 1, 23, MAT('oak_drawer', 'south')); S(8, 2, 23, 'supplementaries:jar')
  S(10, 1, 28, 'minecraft:iron_block'); S(9, 1, 28, 'minecraft:chest[facing=north]'); S(8, 5, 25, HLH); for (var i = 0; i < 6; i++) SA(5 + Math.floor(R() * 6), 1, 24 + Math.floor(R() * 4), 'minecraft:white_carpet')
  // salle d'attente (aile est)
  PORTE(19, 1, 25, HPO, 'west', 'left', 'true')
  ;[24, 26].forEach(z => F(21, 1, z, 25, 1, z, hbE('minecraft:dark_oak', 'north'))); S(26, 1, 28, 'farmersdelight:stove[facing=north,lit=false]'); S(22, 1, 28, 'minecraft:potted_dead_bush'); S(23, 5, 25, HLH)
  ;[[21, 27], [24, 28], [25, 25]].forEach(q => SA(q[0], 1, q[1], choix(['minecraft:white_carpet', 'supplementaries:book_pile', 'minecraft:red_shulker_box'])))
  // escaliers vers l'etage (le long des murs pignons) et logement du chef de gare / bureaux
  ;[4, 27].forEach(xs => { for (var i = 0; i < 6; i++) { S(xs, 1 + i, 28 - i, hbE('minecraft:spruce', 'north')); if (i) S(xs, i, 28 - i, hbE('minecraft:spruce', 'south', 'top')) } F(xs, 6, 24, xs, 6, 28, AIR) })
  piece(cadreInv(5, 23, 11, 28, 'south', 6, 5), 'salon', 1)
  piece(cadre(20, 23, 26, 28, 'south', 6, 5), 'bureau', 1)
  hbBazar(5, 23, 10, 28, 13, 3); hbBazar(21, 23, 26, 28, 13, 3)
}


// ================= OPERA (cage de scene, salle a l'italienne, fosse, loges, grand escalier, loggia) =================
// Scene z1..10, salle z10..21, foyer z22..28, loggia z28..29 a l'etage ; x3..28.
function hbTheatre() {
  for (var x = 0; x <= 31; x++) { S(x, -1, 30, R() < 0.8 ? 'minecraft:smooth_stone' : 'minecraft:polished_andesite'); S(x, -1, 31, R() < 0.8 ? 'minecraft:smooth_stone' : 'minecraft:andesite') }
  hbSol(0, 0, 31, 0); hbSol(0, 1, 2, 29); hbSol(29, 1, 31, 29)
  F(3, -1, 1, 28, -1, 29, 'minecraft:stone')
  // ---- enveloppe ----
  for (var z = 1; z <= 29; z++) for (var y = 0; y <= 25; y++) {
    var h = z <= 10 ? 25 : z <= 21 ? 18 : 18; if (y > h) continue
    ;[3, 28].forEach(x => S(x, y, z, z % 3 == 0 || y % 6 == 0 ? HC : hbM(HS)))
  }
  for (var x = 4; x <= 27; x++) for (var y = 0; y <= 25; y++) { S(x, y, 1, x % 4 == 0 ? HC : hbM(HS)); S(x, y, 10, y >= 4 && y <= 13 && x >= 8 && x <= 23 ? AIR : HS) }
  for (var x = 4; x <= 27; x++) for (var y = 0; y <= 18; y++) S(x, y, 21, HS)
  F(4, 0, 2, 27, 0, 28, 'minecraft:polished_andesite')
  // ---- cage de scene ----
  F(4, 1, 2, 27, 2, 9, 'minecraft:stone'); F(4, 3, 2, 27, 3, 10, 'minecraft:spruce_planks'); F(8, 0, 10, 23, 2, 10, HS)
  for (var x = 6; x <= 25; x++) for (var y = 4; y <= 14; y++) S(x, y, 2, y >= 9 ? 'minecraft:light_blue_wool' : y >= 6 ? (x % 7 < 3 ? 'minecraft:green_wool' : 'minecraft:lime_wool') : 'minecraft:green_wool')
  F(9, 10, 2, 11, 12, 2, 'minecraft:white_wool'); F(20, 11, 2, 21, 11, 2, 'minecraft:white_wool'); S(14, 6, 2, 'minecraft:brown_wool'); F(14, 7, 2, 14, 9, 2, 'minecraft:brown_wool'); F(13, 9, 2, 15, 11, 2, 'minecraft:green_wool')
  // decor : facade de maison en carton, table et chaises, projecteur tombe
  F(18, 4, 6, 22, 7, 6, 'minecraft:birch_planks'); F(19, 5, 6, 19, 6, 6, GP); F(21, 5, 6, 21, 6, 6, GP); F(18, 8, 6, 22, 8, 6, hbE('minecraft:spruce', 'south'))
  S(12, 4, 6, 'mcwfurnitures:oak_table'); S(11, 4, 6, MAT('oak_chair', 'east')); S(13, 4, 6, MAT('oak_chair', 'west')); S(12, 5, 6, 'minecraft:candle[candles=3,lit=false]'); S(9, 4, 8, 'minecraft:redstone_lamp'); S(15, 4, 9, 'minecraft:red_carpet')
  // rideau rouge, lambrequin
  F(8, 4, 9, 10, 13, 9, 'minecraft:red_wool'); F(21, 4, 9, 23, 13, 9, 'minecraft:red_wool'); F(11, 12, 9, 20, 13, 9, 'minecraft:red_wool'); F(11, 11, 9, 20, 11, 9, 'minecraft:red_carpet'.replace('carpet', 'wool'))
  F(7, 4, 10, 7, 14, 10, HCH); F(24, 4, 10, 24, 14, 10, HCH); F(7, 14, 10, 24, 14, 10, 'minecraft:gold_block')
  // passerelles et cintres
  F(4, 16, 2, 5, 16, 9, 'minecraft:spruce_slab[type=top]'); F(26, 16, 2, 27, 16, 9, 'minecraft:spruce_slab[type=top]'); F(5, 17, 2, 5, 17, 9, HF); F(26, 17, 2, 26, 17, 9, HF)
  F(4, 25, 2, 27, 25, 9, 'minecraft:spruce_slab[type=top]')
  ;[4, 7].forEach(z => { F(8, 16, z, 8, 24, z, 'minecraft:chain[axis=y]'); F(23, 16, z, 23, 24, z, 'minecraft:chain[axis=y]'); F(8, 15, z, 23, 15, z, 'minecraft:stripped_spruce_log[axis=x]') })
  F(4, 4, 9, 4, 15, 9, 'minecraft:ladder[facing=east]')
  gtToitX(3, 28, 1, 10, 26, 'minecraft:oxidized_cut_copper'); gtPignonX(3, 1, 10, 26, HS); gtPignonX(28, 1, 10, 26, HS)
  // ---- fosse d'orchestre z11..12 ----
  F(8, -3, 11, 23, -3, 12, 'minecraft:dark_oak_planks'); F(8, -2, 11, 23, 0, 12, AIR); F(7, -2, 11, 7, 0, 12, 'minecraft:dark_oak_planks'); F(24, -2, 11, 24, 0, 12, 'minecraft:dark_oak_planks'); F(8, -2, 13, 23, 0, 13, 'minecraft:dark_oak_planks')
  F(8, 1, 13, 23, 1, 13, HF)
  for (var x = 9; x <= 22; x += 2) { S(x, -2, 12, MAT('dark_oak_chair', 'north')); if (R() < 0.6) S(x, -2, 11, choix(['minecraft:note_block', 'minecraft:lectern[facing=south]', 'minecraft:jukebox'])) }
  S(15, -2, 11, 'minecraft:lectern[facing=south]')
  // ---- parterre en gradins, allee centrale ----
  function g(z) { return Math.floor((z - 14) / 3) }
  for (var z = 14; z <= 20; z++) for (var x = 4; x <= 27; x++) {
    if (x == 4 || x == 27) continue
    var f = g(z); if (f > 0) F(x, 1, z, x, f, z, 'minecraft:dark_oak_planks')
    if (x == 15 || x == 16) { S(x, f + 1, z, 'minecraft:red_carpet'); continue }
    S(x, f + 1, z, R() < 0.06 ? 'minecraft:red_carpet' : hbE('minecraft:mangrove', 'south'))
  }
  PORTE(4, 1, 21, HPO, 'south', 'left', 'false'); PORTE(27, 1, 21, HPO, 'south', 'right', 'true')
  // ---- balcons lateraux et de fond (y6, y11), loges ----
  ;[6, 11].forEach(y => {
    F(4, y, 12, 6, y, 20, 'minecraft:dark_oak_planks'); F(25, y, 12, 27, y, 20, 'minecraft:dark_oak_planks'); F(7, y, 18, 24, y, 20, 'minecraft:dark_oak_planks')
    var PAR = 'minecraft:smooth_quartz_slab[type=bottom]'
    F(6, y + 1, 12, 6, y + 1, 17, PAR); F(25, y + 1, 12, 25, y + 1, 17, PAR); F(6, y + 1, 18, 25, y + 1, 18, PAR); F(6, y, 12, 6, y, 18, 'minecraft:yellow_terracotta'); F(25, y, 12, 25, y, 18, 'minecraft:yellow_terracotta'); F(7, y, 18, 24, y, 18, 'minecraft:yellow_terracotta')
    F(6, y - 1, 12, 6, y - 1, 17, hbE('minecraft:smooth_quartz', 'west', 'top')); F(25, y - 1, 12, 25, y - 1, 17, hbE('minecraft:smooth_quartz', 'east', 'top')); F(7, y - 1, 18, 24, y - 1, 18, hbE('minecraft:smooth_quartz', 'south', 'top'))
    ;[12, 15].forEach(z => { F(4, y + 1, z, 5, y + 3, z, 'minecraft:red_wool'); F(26, y + 1, z, 27, y + 3, z, 'minecraft:red_wool') })
    ;[13, 14, 16, 17].forEach(z => { if (R() < 0.85) S(5, y + 1, z, MAT('dark_oak_chair', 'east')); if (R() < 0.85) S(26, y + 1, z, MAT('dark_oak_chair', 'west')) })
    for (var x = 8; x <= 23; x += 2) if (R() < 0.8) S(x, y + 1, 19, MAT('dark_oak_chair', 'north'))
    if (y == 6) { S(5, 10, 14, HLH); S(26, 10, 14, HLH) }
  })
  F(4, 7, 20, 4, 11, 20, 'minecraft:ladder[facing=north]')
  // ---- plafond peint, lustre a couronne doree ----
  for (var x = 4; x <= 27; x++) for (var z = 11; z <= 20; z++) { var d = Math.max(Math.abs(x - 15.5), Math.abs(z - 15.5) * 1.6); S(x, 18, z, d < 3 ? 'minecraft:gold_block' : d < 5 ? 'minecraft:light_blue_terracotta' : d < 8 ? 'minecraft:yellow_terracotta' : d < 10 ? 'minecraft:red_terracotta' : 'minecraft:white_terracotta') }
  ;[[14, 13], [17, 13], [14, 18], [17, 18]].forEach(c => F(c[0], 14, c[1], c[0], 17, c[1], 'minecraft:chain[axis=y]'))
  F(14, 13, 13, 17, 13, 13, 'minecraft:gold_block'); F(14, 13, 18, 17, 13, 18, 'minecraft:gold_block'); F(13, 13, 14, 13, 13, 17, 'minecraft:gold_block'); F(18, 13, 14, 18, 13, 17, 'minecraft:gold_block')
  ;[[15, 13], [16, 18], [13, 15], [18, 16]].forEach(c => S(c[0], 12, c[1], HLH))
  ;[[13, 13], [18, 18]].forEach(c => S(c[0], 13, c[1], 'minecraft:gold_block'))
  PORTE(3, 1, 16, HPO, 'west', 'left', 'false'); PORTE(28, 1, 16, HPO, 'east', 'left', 'true')
  for (var i = 0; i < 14; i++) { var x = 5 + Math.floor(R() * 22), z = 14 + Math.floor(R() * 7); SA(x, g(z) + 1, z, choix(['minecraft:white_carpet', 'supplementaries:book_pile', 'minecraft:light_gray_carpet'])) }
  // ---- foyer, grand escalier vers le balcon ----
  for (var x = 4; x <= 27; x++) for (var z = 22; z <= 28; z++) S(x, 0, z, (x + z) % 2 ? 'minecraft:smooth_quartz' : 'minecraft:polished_deepslate')
  for (var i = 0; i < 6; i++) for (var x = 13; x <= 18; x++) { if (i) F(x, 1, 27 - i, x, i, 27 - i, 'minecraft:smooth_quartz'); S(x, 1 + i, 27 - i, hbE('minecraft:quartz', 'north')) }
  for (var i = 0; i < 6; i++) { F(12, 1, 27 - i, 12, 2 + i, 27 - i, 'minecraft:smooth_quartz'); F(19, 1, 27 - i, 19, 2 + i, 27 - i, 'minecraft:smooth_quartz') }
  F(13, 1, 28, 18, 1, 28, 'minecraft:red_carpet'); F(13, 7, 21, 18, 9, 21, AIR); F(13, 6, 21, 18, 6, 21, 'minecraft:dark_oak_planks')
  ;[6, 10, 21, 25].forEach(x => ;[23, 26].forEach(z => F(x, 1, z, x, 12, z, 'minecraft:quartz_pillar')))
  F(4, 13, 22, 27, 13, 28, 'minecraft:smooth_stone'); S(8, 12, 24, 'mcwlights:iron_chandelier'); S(23, 12, 24, 'mcwlights:iron_chandelier')
  for (var z = 23; z <= 27; z++) { S(4, 3, z, 'minecraft:white_stained_glass_pane'); S(27, 3, z, 'minecraft:white_stained_glass_pane') }
  F(5, 1, 27, 8, 1, 27, MAT('dark_oak_counter', 'north')); S(6, 2, 27, 'supplementaries:book_pile'); S(5, 1, 28, 'minecraft:brown_shulker_box')
  ;[[9, 24], [22, 25], [20, 23], [11, 27]].forEach(q => SA(q[0], 1, q[1], choix(['minecraft:white_carpet', 'supplementaries:book_pile', 'minecraft:red_carpet'])))
  // ---- facade : arcades, loggia a colonnes jumelees, attique, statues dorees ----
  for (var x = 3; x <= 28; x++) for (var y = 0; y <= 5; y++) S(x, y, 29, y % 2 ? HC : HS)
  ;[7, 11, 15, 19, 23].forEach(x => { PORTE(x, 1, 29, HPV, 'south', 'left', 'false'); PORTE(x + 1, 1, 29, HPV, 'south', 'right', R() < 0.5 ? 'true' : 'false'); F(x, 3, 29, x + 1, 4, 29, GP); S(x, 5, 29, HCH); S(x + 1, 5, 29, HCH); F(x - 1, 0, 30, x + 2, 0, 30, hbE('minecraft:smooth_sandstone', 'north')) })
  F(3, 6, 27, 28, 6, 29, HS); F(3, 6, 30, 28, 6, 30, 'minecraft:smooth_sandstone_slab[type=bottom]')
  for (var x = 4; x <= 27; x++) for (var y = 7; y <= 12; y++) S(x, y, 27, x % 3 == 1 && y >= 8 && y <= 11 ? GP : HS)
  F(3, 7, 28, 3, 12, 29, HS); F(28, 7, 28, 28, 12, 29, HS)
  ;[5, 6, 9, 10, 14, 17, 21, 22, 25, 26].forEach(x => F(x, 7, 29, x, 12, 29, 'minecraft:quartz_pillar'))
  for (var x = 4; x <= 27; x++) if ([5, 6, 9, 10, 14, 17, 21, 22, 25, 26].indexOf(x) < 0) S(x, 7, 29, HF)
  F(3, 13, 27, 28, 13, 29, HC); F(3, 13, 30, 28, 13, 30, hbE('minecraft:smooth_sandstone', 'north', 'top'))
  for (var x = 3; x <= 28; x++) for (var y = 14; y <= 18; y++) S(x, y, 29, (y == 16 && x % 4 == 1) ? HCH : y == 18 ? HC : hbM(HS))
  F(3, 14, 22, 28, 14, 28, 'minecraft:smooth_stone')
  ;[4, 27].forEach(x => { S(x, 19, 29, 'minecraft:gold_block'); S(x, 20, 29, 'minecraft:lightning_rod[facing=up]') })
  F(14, 19, 29, 17, 19, 29, 'minecraft:chiseled_quartz_block'); S(15, 20, 29, 'minecraft:gold_block'); S(16, 20, 29, 'minecraft:gold_block'); S(15, 21, 29, 'minecraft:lightning_rod[facing=up]')
  ;[8, 13, 20].forEach(x => S(x, 7, 28, 'minecraft:potted_dead_bush'))
  // ---- toiture de la salle et coupole basse de cuivre ----
  F(3, 19, 10, 28, 19, 21, 'minecraft:smooth_stone')
  for (var x = 4; x <= 27; x++) for (var z = 11; z <= 20; z++) { var a = (x - 15.5) / 9, b = (z - 15.5) / 5.5, d = a * a + b * b; if (d <= 1) { var hh = Math.floor(4 * Math.sqrt(1 - d)); F(x, 20, z, x, 19 + hh, z, 'minecraft:oxidized_cut_copper'); if (hh > 0) S(x, 19 + hh, z, 'minecraft:oxidized_cut_copper') } }
  S(15, 24, 15, 'minecraft:oxidized_copper'); S(16, 24, 16, 'minecraft:oxidized_copper'); S(15, 25, 15, 'minecraft:lightning_rod[facing=up]')
}


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
  for (var z = 2; z <= 29; z++) ;[11, 20].forEach(x => { for (var y = 9; y <= 12; y++) S(x, y, z, col(z) ? FO : y == 9 ? FB : GP); S(x, 13, z, FB) })
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
    for (var i = 0; i < w; i++) for (var j = 0; j <= 2; j++) if (R() < 0.94 || j == 0 || i == 0 || i == w - 1) S(x + i, 4, z + j, 'minecraft:' + c[i % 2] + '_wool')
    for (var i = 1; i < w - 1; i++) {
      S(x + i, 1, z, t == 0 ? 'minecraft:packed_ice' : t == 1 ? 'minecraft:stripped_spruce_wood' : t == 2 ? 'minecraft:spruce_planks' : 'minecraft:spruce_slab[type=top]')
      var top = t == 0 ? choix(['minecraft:blue_ice', 'minecraft:prismarine', 'minecraft:air', 'minecraft:packed_ice']) : t == 1 ? choix(['minecraft:chain[axis=y]', 'minecraft:air']) : t == 2 ? choix(['minecraft:melon', 'minecraft:pumpkin', 'farmersdelight:carrot_crate', 'farmersdelight:potato_crate', 'farmersdelight:cabbage_crate', 'minecraft:air']) : choix(['minecraft:potted_poppy', 'minecraft:potted_dandelion', 'minecraft:potted_dead_bush', 'minecraft:potted_azure_bluet', 'minecraft:flower_pot'])
      if (top == 'minecraft:chain[axis=y]') { S(x + i, 3, z + 1, top); S(x + i, 2, z + 1, 'minecraft:brown_terracotta') } else if (top != 'minecraft:air') S(x + i, 2, z, top)
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


// ================= CITE HBM EN BRIQUE (barre R+6, bow-windows, cage vitree, cour avec jeux, jardins et sechoirs) =================
// Barre x1..30 z2..10, facade au nord (z2). Cage x9..16 : volees en z8 (etages pairs) et z9 (impairs), palier z7, hall z3..6.
function hbHBM() {
  var NIV = [0, 6, 12, 18, 24, 30, 36]
  for (var x = 0; x <= 31; x++) { S(x, -1, 0, R() < 0.8 ? 'minecraft:smooth_stone' : 'minecraft:polished_andesite'); S(x, -1, 1, R() < 0.8 ? 'minecraft:smooth_stone' : 'minecraft:andesite') }
  F(1, -1, 2, 30, -1, 10, 'minecraft:stone')
  // ---- planchers, murs ----
  NIV.forEach(L => F(2, L, 3, 29, L, 9, L == 0 ? 'minecraft:polished_andesite' : 'minecraft:spruce_planks'))
  F(1, 42, 2, 30, 42, 10, 'minecraft:smooth_stone')
  var BAIES = [[2, 2], [8, 8], [18, 20], [29, 29]], BOW = [[4, 6], [25, 27]]
  for (var x = 1; x <= 30; x++) for (var y = 0; y <= 41; y++) {
    var k = y % 6, b = k == 0 ? HS : hbM(HBR)
    if (x == 1 || x == 30) b = y % 2 ? HSB : HBR
    else if (x >= 11 && x <= 14 && y >= 1) b = k == 0 ? HS : GP
    else if (y >= 6 && k >= 2 && k <= 4 && BAIES.some(p => x >= p[0] && x <= p[1])) b = GP
    S(x, y, 2, b)
    var kr = k >= 2 && k <= 4 && [3, 4, 6, 7, 18, 19, 21, 22, 25, 26, 28, 29].indexOf(x) >= 0
    S(x, y, 10, k == 0 ? HS : (x == 12 || x == 13) && (k == 3 || k == 4) ? GP : kr ? GP : (x == 1 || x == 30 ? (y % 2 ? HSB : HBR) : hbM(HBR)))
  }
  for (var z = 3; z <= 9; z++) for (var y = 0; y <= 41; y++) { var k = y % 6; S(1, y, z, k == 0 ? HS : (z == 5 || z == 6) && k >= 2 && k <= 4 && y > 5 ? GP : hbM(HBR)); S(30, y, z, k == 0 ? HS : (z == 5 || z == 6) && k >= 2 && k <= 4 && y > 5 ? GP : hbM(HBR)) }
  // bow-windows superposes (x4..6 et x25..27) du 1er au 6e
  BOW.forEach(p => { for (var y = 6; y <= 41; y++) { var k = y % 6; for (var x = p[0]; x <= p[1]; x++) { S(x, y, 1, k == 0 ? HS : k >= 2 && k <= 4 ? GP : HBR); if (k >= 2 && k <= 4) S(x, y, 2, AIR) } } F(p[0], 42, 1, p[1], 42, 1, 'minecraft:smooth_stone_slab[type=bottom]') })
  // toit terrasse : acrotere, souches, chateau d'eau, antenne
  for (var x = 1; x <= 30; x++) { S(x, 43, 2, HBR); S(x, 43, 10, HBR) } for (var z = 3; z <= 9; z++) { S(1, 43, z, HBR); S(30, 43, z, HBR) }
  hbCheminee(5, 6, 43, 2); hbCheminee(20, 6, 43, 2); hbCheminee(26, 6, 43, 1)
  ;[[11, 4], [14, 4], [11, 7], [14, 7]].forEach(p => F(p[0], 43, p[1], p[0], 45, p[1], 'minecraft:iron_bars'))
  F(11, 46, 4, 14, 48, 7, 'minecraft:light_gray_concrete'); F(12, 49, 5, 13, 49, 6, 'minecraft:light_gray_concrete')  F(24, 43, 8, 24, 47, 8, 'minecraft:iron_bars'); S(24, 48, 8, 'minecraft:lightning_rod[facing=up]'); S(23, 46, 8, 'minecraft:iron_bars'); S(25, 46, 8, 'minecraft:iron_bars')
  // ---- cage d'escalier, hall, appartements ----
  NIV.forEach((L, n) => {
    F(9, L + 1, 3, 9, L + 5, 9, HBR); F(16, L + 1, 3, 16, L + 5, 9, HBR)
    F(23, L + 1, 3, 23, L + 5, 9, HBR)
    F(10, L, 3, 15, L, 7, 'minecraft:polished_andesite')
    PORTE(9, L + 1, 4, HPO, 'west', 'left', R() < 0.3 ? 'true' : 'false'); PORTE(16, L + 1, 4, HPO, 'east', 'right', 'false'); PORTE(23, L + 1, 8, HPO, 'east', 'left', 'false')
    S(12, L + 5, 5, HLH); S(10, L + 1, 3, n == 0 ? 'minecraft:chiseled_bookshelf[facing=east]' : 'minecraft:potted_dead_bush')
    if (n < 6) {
      var pair = n % 2 == 0
      for (var i = 0; i < 6; i++) {
        if (pair) { S(10 + i, L + 1 + i, 8, hbE('minecraft:stone_brick', 'east')); if (i) S(10 + i, L + i, 8, hbE('minecraft:stone_brick', 'west', 'top')) }
        else { S(15 - i, L + 1 + i, 9, hbE('minecraft:stone_brick', 'west')); if (i) S(15 - i, L + i, 9, hbE('minecraft:stone_brick', 'east', 'top')) }
      }
      if (pair) F(10, L + 6, 8, 14, L + 6, 8, AIR); else F(11, L + 6, 9, 15, L + 6, 9, AIR)
    }
    if (n == 0) return
    var et = R() < 0.55 ? 1 : 0
    piece(cadre(2, 3, 8, 9, 'north', L, 5), choix(['salon', 'salle', 'chambre']), et)
    piece(cadre(17, 3, 22, 9, 'north', L, 5), choix(['chambre', 'salon']), et)
    piece(cadre(24, 3, 29, 9, 'north', L, 5), choix(['cuisine', 'chambre', 'salle']), et)
    if (R() < 0.5) SA(3 + Math.floor(R() * 4), L + 5, 4, 'minecraft:cobweb')
    // balcons sur cour, linge et pots oublies
    F(18, L, 11, 21, L, 11, 'minecraft:smooth_stone_slab[type=top]'); F(18, L + 1, 11, 21, L + 1, 11, HF)
    if (R() < 0.5) S(18 + Math.floor(R() * 4), L + 1, 11, choix(['minecraft:white_wool', 'minecraft:light_blue_wool', 'minecraft:potted_dead_bush']))
  })
  // ---- rez-de-chaussee : entree, epicerie, local velos, laverie ----
  PORTE(12, 1, 2, HPV, 'north', 'left', 'false'); PORTE(13, 1, 2, HPV, 'north', 'right', 'true'); F(11, 5, 0, 14, 5, 1, 'minecraft:smooth_stone_slab[type=bottom]')
  F(12, 0, 1, 13, 0, 1, hbE('minecraft:stone_brick', 'south'))
  PORTE(12, 1, 10, HPO, 'south', 'left', 'false'); F(12, 3, 10, 12, 4, 10, GP)
  for (var x = 2; x <= 8; x++) for (var z = 3; z <= 9; z++) S(x, 0, z, (x + z) % 2 ? 'minecraft:white_terracotta' : 'minecraft:gray_terracotta')
  F(3, 1, 2, 4, 3, 2, GP); F(6, 1, 2, 7, 3, 2, GP); PORTE(5, 1, 2, HPV, 'north', 'left', 'true'); F(2, 4, 1, 8, 4, 1, 'minecraft:green_wool'); S(5, 4, 1, AIR)
  for (var z = 4; z <= 9; z++) { S(2, 1, z, choix(['farmersdelight:carrot_crate', 'farmersdelight:potato_crate', 'minecraft:barrel[facing=east,open=false]', 'supplementaries:sack'])); S(2, 2, z, choix(['supplementaries:jar', 'minecraft:air', 'minecraft:flower_pot'])) }
  for (var x = 4; x <= 7; x++) S(x, 1, 7, MAT('oak_counter', 'north')); S(5, 2, 7, 'supplementaries:jar'); S(5, 5, 5, HLH); S(7, 1, 9, 'minecraft:barrel[facing=up,open=true]')
  for (var x = 18; x <= 22; x += 2) for (var z = 4; z <= 8; z += 2) S(x, 1, z, 'minecraft:iron_bars'); S(19, 1, 5, 'minecraft:spruce_trapdoor[facing=north,half=bottom,open=true]'); S(20, 5, 6, HLH)
  for (var x = 25; x <= 29; x++) { S(x, 1, 9, 'minecraft:blast_furnace[facing=north,lit=false]'); if (x % 2) S(x, 2, 9, 'minecraft:white_carpet') }
  S(25, 1, 5, 'minecraft:water_cauldron[level=2]'); S(26, 1, 5, 'minecraft:cauldron'); F(27, 1, 4, 28, 1, 4, hbE('minecraft:oak', 'south')); S(27, 5, 6, HLH)
  // ---- cour : sechoirs, balancoires, toboggan, bac a sable, abri velos, jardins ouvriers, parking ----
  hbSol(0, 11, 31, 31)
  for (var x = 2; x <= 29; x++) { S(x, -1, 12, 'minecraft:gravel'); delete HV[x + ',12'] } for (var z = 13; z <= 31; z++) { S(15, -1, z, 'minecraft:gravel'); S(16, -1, z, 'minecraft:gravel'); delete HV['15,' + z]; delete HV['16,' + z] }
  ;[[3, 15], [3, 19]].forEach(p => { F(p[0], 0, p[1], p[0], 3, p[1], 'minecraft:spruce_fence'); F(p[0] + 8, 0, p[1], p[0] + 8, 3, p[1], 'minecraft:spruce_fence'); F(p[0] + 1, 3, p[1], p[0] + 7, 3, p[1], 'minecraft:chain[axis=x]'); for (var x = p[0] + 1; x <= p[0] + 7; x++) if (R() < 0.6) S(x, 2, p[1], choix(['minecraft:white_wool', 'minecraft:light_blue_wool', 'minecraft:pink_wool', 'minecraft:yellow_wool'])); hbLibre(p[0], p[1]); hbLibre(p[0] + 8, p[1]) })
  // balancoires
  F(19, 0, 15, 19, 3, 15, 'minecraft:spruce_fence'); F(23, 0, 15, 23, 3, 15, 'minecraft:spruce_fence'); F(19, 4, 15, 23, 4, 15, 'minecraft:spruce_planks')
  ;[20, 22].forEach(x => { F(x, 2, 15, x, 3, 15, 'minecraft:chain[axis=y]'); S(x, 1, 15, 'minecraft:spruce_slab[type=bottom]') }); F(21, 3, 15, 21, 3, 15, 'minecraft:chain[axis=y]'); hbLibre(21, 15)
  // toboggan
  F(26, 0, 15, 26, 3, 15, 'minecraft:yellow_concrete'); F(26, 0, 14, 26, 3, 14, 'minecraft:ladder[facing=north]'); S(26, 4, 15, 'minecraft:yellow_concrete_powder'.replace('_powder', ''))
  for (var i = 0; i < 3; i++) { S(26, 2 - i, 16 + i, hbE('minecraft:smooth_quartz', 'north')); if (i < 2) S(26, 1 - i, 16 + i, hbE('minecraft:smooth_quartz', 'south', 'top')) } hbLibre(26, 16)
  // bac a sable
  F(19, -1, 20, 22, -1, 23, 'minecraft:sand'); for (var x = 18; x <= 23; x++) { S(x, 0, 19, 'minecraft:stripped_spruce_log[axis=x]'); S(x, 0, 24, 'minecraft:stripped_spruce_log[axis=x]') } F(18, 0, 20, 18, 0, 23, 'minecraft:stripped_spruce_log[axis=z]'); F(23, 0, 20, 23, 0, 23, 'minecraft:stripped_spruce_log[axis=z]')
  S(20, 0, 21, 'minecraft:decorated_pot'); S(22, 0, 22, 'minecraft:red_carpet'); for (var x = 18; x <= 23; x++) for (var z = 19; z <= 24; z++) delete HV[x + ',' + z]
  // abri a velos
  F(2, 0, 24, 2, 2, 24, 'minecraft:spruce_fence'); F(9, 0, 24, 9, 2, 24, 'minecraft:spruce_fence'); F(2, 0, 28, 2, 2, 28, 'minecraft:spruce_fence'); F(9, 0, 28, 9, 2, 28, 'minecraft:spruce_fence'); F(2, 3, 24, 9, 3, 28, 'minecraft:smooth_stone_slab[type=bottom]')
  for (var x = 3; x <= 8; x += 2) { S(x, 0, 26, 'minecraft:iron_bars'); S(x, 0, 27, 'minecraft:iron_bars') } for (var x = 2; x <= 9; x++) for (var z = 24; z <= 28; z++) delete HV[x + ',' + z]
  // jardins ouvriers
  for (var x = 19; x <= 29; x++) for (var z = 26; z <= 30; z++) { delete HV[x + ',' + z]; if (x == 24 && z == 28) { S(x, -1, z, 'minecraft:water'); continue } S(x, -1, z, 'minecraft:farmland[moisture=7]'); var r = R(); SA(x, 0, z, r < 0.35 ? 'minecraft:wheat[age=' + Math.floor(R() * 8) + ']' : r < 0.55 ? 'minecraft:carrots[age=' + Math.floor(R() * 8) + ']' : r < 0.7 ? 'minecraft:potatoes[age=7]' : r < 0.8 ? 'minecraft:short_grass'.replace('short_grass', 'beetroots[age=3]') : AIR) }
  for (var x = 18; x <= 30; x++) { S(x, 0, 25, 'minecraft:spruce_fence'); S(x, 0, 31, 'minecraft:spruce_fence') } for (var z = 26; z <= 30; z++) { S(18, 0, z, 'minecraft:spruce_fence'); S(30, 0, z, 'minecraft:spruce_fence') } S(24, 0, 25, 'minecraft:spruce_fence_gate[facing=north,open=true]')
  S(29, 0, 26, 'minecraft:composter[level=4]'); S(19, 0, 30, 'minecraft:barrel[facing=up,open=false]')
  hbPlatane(6, 32 - 1 - 0, 6); hbPlatane(28, 18, 6); gtBanc(11, 14, 'south', 3); gtBanc(11, 21, 'north', 3)
  hbVeg(0, 11, 31, 31, 0.5)
}


// ================= SQUARE (bouche de metro, fontaine seche, fontaines Wallace, manege, guignol, statue de bronze) =================
function hbSquare() {
  for (var x = 0; x <= 31; x++) { S(x, -1, 0, R() < 0.8 ? 'minecraft:smooth_stone' : 'minecraft:polished_andesite'); S(x, -1, 1, R() < 0.8 ? 'minecraft:smooth_stone' : 'minecraft:andesite') }
  hbSol(0, 2, 31, 31)
  function allee(x, z) { S(x, -1, z, R() < 0.85 ? 'minecraft:gravel' : 'minecraft:coarse_dirt'); delete HV[x + ',' + z] }
  for (var i = 2; i <= 31; i++) { allee(15, i); allee(16, i); allee(i, 15); allee(i, 16) }
  for (var x = 4; x <= 27; x++) for (var z = 4; z <= 27; z++) { var d = Math.sqrt((x - 15.5) * (x - 15.5) + (z - 15.5) * (z - 15.5)); if (d >= 6 && d < 7.5) allee(x, z) }
  // grille basse du square, ouvertures
  for (var i = 0; i <= 31; i++) { if (!((i >= 13 && i <= 18) || (i >= 3 && i <= 7))) S(i, 0, 2, HF); if (i < 13 || i > 18) S(i, 0, 31, HF) }
  for (var z = 3; z <= 30; z++) { if (z < 14 || z > 17) { S(0, 0, z, HF); S(31, 0, z, HF) } }
  // ---- bouche de metro Guimard et couloir effondre ----
  for (var x = 3; x <= 7; x++) for (var z = 3; z <= 14; z++) { delete HV[x + ',' + z] }
  F(3, -5, 4, 7, -2, 13, 'minecraft:white_concrete'); F(4, -5, 4, 6, -5, 13, 'minecraft:gray_terracotta'); F(4, -4, 4, 6, -2, 13, AIR); F(4, -1, 5, 6, -1, 7, AIR)
  for (var k = 0; k < 4; k++) for (var x = 4; x <= 6; x++) { S(x, -1 - k, 4 + k, hbE('minecraft:stone_brick', 'north')); if (k < 3) F(x, -4, 4 + k, x, -2 - k, 4 + k, 'minecraft:stone_bricks') }
  for (var z = 8; z <= 13; z++) { S(3, -3, z, z % 2 ? 'minecraft:light_blue_terracotta' : 'minecraft:white_concrete'); S(7, -3, z, z % 2 ? 'minecraft:light_blue_terracotta' : 'minecraft:white_concrete') }
  F(4, -4, 12, 6, -3, 13, 'minecraft:cobblestone'); S(5, -2, 13, 'minecraft:andesite'); S(4, -2, 12, 'minecraft:gravel'.replace('gravel', 'tuff')); S(6, -4, 11, 'minecraft:cobblestone_slab[type=bottom]'); S(5, -4, 10, 'minecraft:white_carpet')
  S(5, -2, 9, HLH)
  for (var z = 4; z <= 8; z++) { S(3, 0, z, 'minecraft:warped_fence'); S(7, 0, z, 'minecraft:warped_fence') } F(4, 0, 8, 6, 0, 8, 'minecraft:warped_fence')
  F(3, 1, 3, 3, 3, 3, 'minecraft:warped_fence'); F(7, 1, 3, 7, 3, 3, 'minecraft:warped_fence'); S(3, 0, 3, 'minecraft:warped_fence'); S(7, 0, 3, 'minecraft:warped_fence')
  S(3, 4, 3, 'minecraft:shroomlight'); S(7, 4, 3, 'minecraft:shroomlight'); F(4, 4, 3, 6, 4, 3, 'minecraft:warped_fence'); S(5, 5, 3, 'minecraft:warped_fence')
  // ---- fontaine seche ----
  for (var x = 9; x <= 22; x++) for (var z = 9; z <= 22; z++) {
    var d = Math.sqrt((x - 15.5) * (x - 15.5) + (z - 15.5) * (z - 15.5)); if (d >= 6) continue
    delete HV[x + ',' + z]
    if (d >= 4.8) { S(x, -1, z, HSB); S(x, 0, z, 'minecraft:smooth_stone') }
    else { S(x, -1, z, choix(['minecraft:mossy_stone_bricks', 'minecraft:coarse_dirt', 'minecraft:mud', 'minecraft:stone_bricks'])); if (R() < 0.25) S(x, 0, z, choix(['minecraft:moss_carpet', 'minecraft:dead_bush'.replace('dead_bush', 'moss_carpet'), 'minecraft:white_carpet'])) }
  }
  F(15, 0, 15, 16, 3, 16, HSB); for (var x = 13; x <= 18; x++) for (var z = 13; z <= 18; z++) { var d = Math.max(Math.abs(x - 15.5), Math.abs(z - 15.5)); if (d > 1 && d < 3) S(x, 3, z, 'minecraft:stone_brick_slab[type=top]') }
  F(15, 4, 15, 16, 4, 16, 'minecraft:chiseled_stone_bricks'); S(15, 5, 15, 'minecraft:decorated_pot'); S(16, 5, 16, 'minecraft:stone_brick_wall')
  // ---- fontaines Wallace ----
  ;[[11, 4], [27, 11]].forEach(p => { S(p[0], 0, p[1], 'minecraft:dark_prismarine'); F(p[0], 1, p[1], p[0], 2, p[1], 'minecraft:prismarine_wall'); S(p[0], 3, p[1], 'minecraft:dark_prismarine_slab[type=bottom]'); delete HV[p[0] + ',' + p[1]] })
  // ---- manege ----
  var MX = 24, MZ = 24
  for (var x = MX - 5; x <= MX + 5; x++) for (var z = MZ - 5; z <= MZ + 5; z++) {
    var d = Math.sqrt((x - MX) * (x - MX) + (z - MZ) * (z - MZ)), a = Math.floor((Math.atan2(z - MZ, x - MX) + Math.PI) / (Math.PI / 4)), c = a % 2 ? 'red' : 'white'
    if (d <= 4) { S(x, 0, z, (x + z) % 2 ? 'minecraft:spruce_planks' : 'minecraft:birch_planks'); delete HV[x + ',' + z] }
    if (d <= 4.6) SA(x, 5, z, 'minecraft:' + c + '_wool'); if (d <= 3) S(x, 6, z, 'minecraft:' + c + '_wool'); if (d <= 1.5) S(x, 7, z, 'minecraft:' + c + '_wool')
  }
  F(MX, 1, MZ, MX, 7, MZ, 'minecraft:stripped_spruce_log[axis=y]'); S(MX, 8, MZ, 'minecraft:gold_block'); S(MX, 9, MZ, 'minecraft:lightning_rod[facing=up]')
  ;[[3, 0], [-3, 0], [0, 3], [0, -3], [2, 2], [-2, -2]].forEach((o, i) => { var x = MX + o[0], z = MZ + o[1]; F(x, 2, z, x, 4, z, 'minecraft:chain[axis=y]'); S(x, 1, z, i % 3 == 0 ? 'minecraft:brown_wool' : 'minecraft:white_wool') })
  S(MX - 3, 1, MZ + 2, 'minecraft:white_carpet'); S(MX + 1, 1, MZ - 1, 'minecraft:red_carpet')
  // ---- theatre de guignol ----
  F(26, 0, 4, 29, 4, 6, 'minecraft:spruce_planks'); F(27, 1, 5, 28, 4, 5, AIR); F(27, 2, 6, 28, 3, 6, AIR); S(26, 2, 6, 'minecraft:red_wool'); S(29, 2, 6, 'minecraft:red_wool'); F(26, 3, 6, 29, 3, 6, 'minecraft:red_wool')
  F(27, 2, 6, 28, 2, 6, AIR); for (var x = 25; x <= 30; x++) S(x, 5, 5, x % 2 ? 'minecraft:yellow_wool' : 'minecraft:red_wool'); S(27, 1, 6, 'minecraft:spruce_slab[type=top]'); S(28, 1, 6, 'minecraft:spruce_slab[type=top]')
  S(27, 2, 5, 'minecraft:carved_pumpkin[facing=south]'); for (var x = 25; x <= 30; x++) for (var z = 4; z <= 10; z++) delete HV[x + ',' + z]
  gtBanc(26, 9, 'south', 3)
  // ---- statue de bronze ----
  F(7, 0, 23, 9, 1, 25, HSB); S(8, 2, 24, 'minecraft:chiseled_stone_bricks'); F(8, 3, 24, 8, 5, 24, 'minecraft:oxidized_copper'); S(8, 6, 24, 'minecraft:oxidized_cut_copper'); S(7, 5, 24, 'minecraft:oxidized_cut_copper_stairs[facing=east,half=top,shape=straight]'); S(9, 5, 24, 'minecraft:lightning_rod[facing=east]')
  for (var x = 6; x <= 10; x++) for (var z = 22; z <= 26; z++) delete HV[x + ',' + z]
  // ---- platanes, bancs, reverberes ----
  ;[[4, 28], [11, 29], [27, 18], [20, 29], [10, 20], [21, 10]].forEach(p => hbPlatane(p[0], p[1], 6))
  ;[[12, 7, 'south'], [18, 25, 'north'], [3, 19, 'south'], [12, 25, 'north']].forEach(b => gtBanc(b[0], b[1], b[2], 3))
  ;[[14, 3], [17, 30], [2, 14], [29, 17]].forEach(p => hbLampe(p[0], p[1], 0, 1))
  hbVeg(1, 3, 30, 30, 0.75)
  for (var i = 0; i < 16; i++) SA(1 + Math.floor(R() * 30), 0, 3 + Math.floor(R() * 28), choix(['minecraft:white_carpet', 'minecraft:light_gray_carpet', 'supplementaries:book_pile']))
}

// ================= BANQUE (portique a colonnes, fronton a horloge, salle des guichets, mezzanines, chambre forte) =================
function hbBanque() {
  var Q = 'minecraft:smooth_quartz', QP = 'minecraft:quartz_pillar'
  for (var x = 0; x <= 31; x++) S(x, -1, 0, 'minecraft:smooth_stone')
  hbSol(0, 29, 31, 31); hbSol(0, 1, 2, 28); hbSol(29, 1, 31, 28)
  // emmarchement et podium
  F(3, 0, 0, 28, 0, 0, hbE('minecraft:quartz', 'south')); F(3, 0, 1, 28, 0, 1, Q); F(3, 1, 1, 28, 1, 1, hbE('minecraft:quartz', 'south'))
  F(3, 0, 2, 28, 0, 28, 'minecraft:stone'); F(3, 1, 2, 28, 1, 4, Q)
  // portique et fronton
  ;[4, 6, 10, 14, 17, 21, 25, 27].forEach(x => F(x, 2, 2, x, 10, 2, QP))
  F(3, 11, 2, 28, 11, 4, Q); F(3, 11, 1, 28, 11, 1, hbE('minecraft:quartz', 'north', 'top'))
  for (var k = 0; k <= 4; k++) F(4 + k * 3, 12 + k, 2, 27 - k * 3, 12 + k, 2, Q)
  F(4, 12, 3, 27, 12, 4, Q); S(15, 14, 2, 'minecraft:white_concrete'); S(16, 14, 2, 'minecraft:white_concrete'); S(15, 13, 2, HCH); S(16, 13, 2, HCH); S(15, 15, 2, 'minecraft:gold_block'); S(16, 15, 2, 'minecraft:gold_block')
  F(15, 14, 1, 16, 14, 1, 'minecraft:black_concrete'.replace('black_concrete', 'polished_blackstone_button[face=wall,facing=north]'))
  // ---- enveloppe ----
  for (var x = 3; x <= 28; x++) for (var y = 1; y <= 12; y++) { S(x, y, 5, y % 4 == 0 ? HC : hbM(HS)); S(x, y, 28, y % 4 == 0 ? HC : hbM(HS)) }
  for (var z = 6; z <= 27; z++) for (var y = 1; y <= 12; y++) { var fen = z % 4 == 2 && y >= 3 && y <= 8; S(3, y, z, fen ? GP : y % 4 == 0 ? HC : hbM(HS)); S(28, y, z, fen ? GP : y % 4 == 0 ? HC : hbM(HS)) }
  F(4, 1, 6, 27, 1, 27, 'minecraft:polished_andesite')
  for (var x = 4; x <= 27; x++) for (var z = 6; z <= 17; z++) S(x, 1, z, (x + z) % 2 ? Q : 'minecraft:polished_deepslate')
  // portes de bronze et imposte
  PORTE(14, 2, 5, HPV, 'north', 'left', 'false'); PORTE(15, 2, 5, HPV, 'north', 'right', 'true'); PORTE(16, 2, 5, HPV, 'north', 'left', 'true'); PORTE(17, 2, 5, HPV, 'north', 'right', 'false')
  F(14, 4, 5, 17, 7, 5, GP); F(13, 2, 5, 13, 8, 5, HC); F(18, 2, 5, 18, 8, 5, HC); F(13, 8, 5, 18, 8, 5, HCH)
  // toiture, verriere
  F(3, 13, 5, 28, 13, 28, 'minecraft:smooth_stone'); for (var x = 8; x <= 23; x++) for (var z = 7; z <= 16; z++) S(x, 13, z, (x % 4 == 0 || z % 4 == 0) ? 'minecraft:polished_blackstone' : 'minecraft:glass')
  for (var x = 3; x <= 28; x++) { S(x, 14, 5, HF); S(x, 14, 28, HF) } for (var z = 6; z <= 27; z++) { S(3, 14, z, HF); S(28, 14, z, HF) }
  ;[[10, 9], [21, 9], [10, 14], [21, 14]].forEach(c => S(c[0], 12, c[1], 'mcwlights:iron_chandelier'))
  // ---- salle des guichets : comptoir, grilles, bureaux ----
  for (var x = 7; x <= 24; x++) { S(x, 2, 13, MAT('dark_oak_counter', 'north')); if (x % 3 != 1) S(x, 3, 13, 'minecraft:iron_bars'); else S(x, 3, 13, 'supplementaries:book_pile') }
  F(7, 4, 13, 24, 4, 13, 'minecraft:dark_oak_slab[type=bottom]')
  for (var x = 8; x <= 23; x += 3) { S(x, 2, 14, MAT('dark_oak_chair', 'north')); S(x, 2, 16, 'mcwfurnitures:dark_oak_table'); S(x, 3, 16, choix(['supplementaries:book_pile', 'minecraft:candle[candles=2,lit=false]', 'minecraft:air'])); S(x, 2, 17, MAT('dark_oak_chair', 'north')) }
  for (var i = 0; i < 18; i++) SA(5 + Math.floor(R() * 22), 2, 6 + Math.floor(R() * 12), choix(['minecraft:white_carpet', 'minecraft:light_gray_carpet', 'minecraft:white_carpet', 'supplementaries:book_pile']))
  // coin poste : casiers et colis
  for (var z = 14; z <= 17; z++) for (var y = 2; y <= 4; y++) S(27, y, z, 'minecraft:chiseled_bookshelf[facing=west]')
  ;[[25, 15], [26, 17], [25, 16]].forEach(p => S(p[0], 2, p[1], choix(['minecraft:brown_shulker_box', 'minecraft:barrel[facing=up,open=false]', 'supplementaries:sack'])))
  // mezzanines sur colonnes, grand escalier ouest
  F(4, 7, 6, 6, 7, 17, 'minecraft:dark_oak_planks'); F(25, 7, 6, 27, 7, 17, 'minecraft:dark_oak_planks')
  for (var z = 7; z <= 17; z += 5) { F(6, 2, z, 6, 6, z, QP); F(25, 2, z, 25, 6, z, QP) }
  F(6, 8, 6, 6, 8, 17, HF); F(25, 8, 6, 25, 8, 17, HF)
  for (var i = 0; i < 6; i++) for (var x = 4; x <= 5; x++) { if (i) F(x, 2, 7 + i, x, 1 + i, 7 + i, Q); S(x, 2 + i, 7 + i, hbE('minecraft:quartz', 'south')) }
  F(4, 7, 6, 5, 7, 11, AIR); F(6, 8, 7, 6, 8, 11, HF)
  for (var z = 13; z <= 17; z += 2) { S(4, 8, z, 'minecraft:chiseled_bookshelf[facing=east]'); S(26, 8, z, MAT('dark_oak_desk'.replace('desk', 'drawer'), 'west')) }
  S(27, 8, 10, 'minecraft:barrel[facing=up,open=false]')
  // ---- antichambre, cloison, chambre forte ----
  F(4, 2, 18, 27, 12, 18, HS); PORTE(15, 2, 18, HPO, 'south', 'left', 'true'); F(4, 12, 18, 27, 12, 18, HC)
  F(11, 1, 22, 20, 7, 28, 'minecraft:polished_deepslate'); F(12, 2, 23, 19, 6, 27, AIR); F(12, 1, 23, 19, 1, 27, 'minecraft:iron_block')
  F(15, 2, 22, 17, 4, 22, AIR); S(15, 2, 22, 'minecraft:polished_deepslate'); S(17, 2, 22, 'minecraft:polished_deepslate'); S(15, 4, 22, 'minecraft:polished_deepslate'); S(17, 4, 22, 'minecraft:polished_deepslate')
  F(16, 2, 22, 16, 4, 22, AIR); F(15, 3, 22, 17, 3, 22, AIR)
  F(14, 2, 19, 14, 4, 21, 'minecraft:iron_block'); S(14, 2, 19, AIR); S(14, 4, 19, AIR); S(14, 2, 21, AIR); S(14, 4, 21, AIR); S(14, 3, 20, 'minecraft:chiseled_deepslate'); S(13, 3, 20, 'minecraft:lever[face=wall,facing=west,powered=false]')
  for (var y = 2; y <= 5; y++) { for (var z = 23; z <= 27; z++) { S(12, y, z, 'minecraft:iron_trapdoor[facing=east,half=bottom,open=true]'); S(19, y, z, 'minecraft:iron_trapdoor[facing=west,half=bottom,open=true]') } for (var x = 13; x <= 18; x++) S(x, y, 27, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=true]') }
  ;[[13, 24], [13, 26], [18, 24]].forEach(p => S(p[0], 3, p[1], AIR))
  S(15, 2, 25, 'minecraft:gold_block'); S(16, 2, 25, 'minecraft:gold_block'); S(15, 3, 25, 'minecraft:gold_block'); S(16, 2, 26, 'minecraft:chest[facing=north]'); S(14, 2, 26, 'minecraft:chest[facing=north]'); S(17, 2, 24, 'minecraft:barrel[facing=up,open=true]'); S(16, 6, 24, HLH)
  ;[[13, 23], [18, 26], [15, 24]].forEach(p => SA(p[0], 2, p[1], choix(['minecraft:white_carpet', 'supplementaries:sack'])))
  // bureaux du directeur et archives (arriere)
  F(4, 1, 19, 10, 1, 27, 'minecraft:spruce_planks'); F(21, 1, 19, 27, 1, 27, 'minecraft:spruce_planks')
  F(10, 2, 19, 10, 12, 27, HS); F(21, 2, 19, 21, 12, 27, HS); PORTE(10, 2, 20, HPO, 'east', 'left', 'false'); PORTE(21, 2, 20, HPO, 'west', 'right', 'false')
  piece(cadre(4, 22, 9, 27, 'south', 1, 5), 'bureau', 1); piece(cadreInv(22, 22, 27, 27, 'south', 1, 5), 'bureau', 1)
  for (var z = 19; z <= 21; z++) for (var y = 2; y <= 3; y++) { S(4, y, z, 'minecraft:chiseled_bookshelf[facing=east]'); S(27, y, z, 'minecraft:chiseled_bookshelf[facing=west]') }
  F(4, 7, 19, 27, 7, 27, 'minecraft:spruce_planks'); F(11, 7, 22, 20, 7, 28, 'minecraft:polished_deepslate'); hbBazar(4, 19, 27, 27, 8, 14)
}


// ================= VUES DU QUARTIER HAUSSMANNIEN =================
function vuesHauss2() {
  vue('hb_ensemble_sud', 0, 0, 64, 60, 118, 64, 8, 40)
  vue('hb_ensemble_no', 0, 0, 64, 62, -36, 64, 6, 40)
  vue('hb_boulevard_ouest', 0, 0, -6, 5, 39.5, 60, 4, 40)
  vue('hb_boulevard_est', 0, 0, 134, 5, 40.5, 60, 4, 40)
  vue('hb_boulevard_haut', 0, 0, 40, 22, 52, 70, 2, 38)
  vue('hb_magasin', 0, 0, 15.5, 14, 52, 15.5, 18, 24)
  vue('hb_magasin_coupole', 0, 0, 42, 50, 46, 15.5, 36, 15)
  vue('hb_magasin_atrium_haut', 0, 0, 12, 33, 12, 18, 0, 20)
  vue('hb_magasin_rez', 0, 0, 5, 2.5, 26, 20, 4, 12)
  vue('hb_immeubles', 0, 0, 48, 12, 50, 48, 16, 26)
  vue('hb_immeubles_cour', 0, 0, 48, 20, -12, 48, 10, 10)
  vue('hb_cafe', 0, 0, 36, 3, 37, 36, 2, 28)
  vue('hb_gare', 0, 0, 80, 10, 52, 80, 10, 24)
  vue('hb_gare_halle', 0, 0, 61, 6, 10.5, 90, 4, 10.5)
  vue('hb_gare_quai', 0, 0, 70, 3, 5.5, 90, 3, 14)
  vue('hb_opera', 0, 0, 112, 10, 52, 112, 12, 25)
  vue('hb_opera_toit', 0, 0, 132, 40, 42, 112, 20, 15)
  vue('hb_halles', 0, 0, 16, 10, 30, 16, 6, 60)
  vue('hb_halles_nef', 0, 0, 15.5, 6, 52, 15.5, 4, 76)
  vue('hb_hbm', 0, 0, 48, 24, 28, 48, 20, 56)
  vue('hb_hbm_cour', 0, 0, 48, 20, 100, 48, 10, 62)
  vue('hb_square', 0, 0, 80, 18, 36, 80, 0, 66)
  vue('hb_metro', 0, 0, 69, 2, 49.5, 69, -3, 57)
  vue('hb_manege', 0, 0, 80, 6, 63, 88, 3, 72)
  vue('hb_banque', 0, 0, 112, 8, 30, 112, 10, 54)
  vue('hb_banque_toit', 0, 0, 130, 30, 36, 112, 10, 62)
  vue('hb_coupe_magasin', 0, 0, 160, 40, 58, 160, 4, 16)
  vue('hb_coupe_magasin_detail', 0, 0, 152, 22, 40, 160, 6, 18)
  vue('hb_coupe_immeubles', 0, 0, 196, 30, 54, 196, 2, 20)
  vue('hb_coupe_gare', 0, 0, 232, 30, 48, 232, 0, 12)
  vue('hb_coupe_gare_train', 0, 0, 232, 12, 30, 226, 2, 10)
  vue('hb_coupe_opera', 0, 0, 268, 32, 50, 268, 2, 14)
  vue('hb_coupe_opera_salle', 0, 0, 268, 20, 40, 268, 4, 12)
  vue('hb_coupe_halles', 0, 0, 160, 30, 100, 160, 0, 64)
  vue('hb_coupe_hbm', 0, 0, 196, 34, 98, 196, 4, 54)
  vue('hb_coupe_banque', 0, 0, 232, 30, 100, 232, 0, 66)
  vue('hb_coupe_banque_coffre', 0, 0, 232, 16, 84, 232, 2, 73)
}

