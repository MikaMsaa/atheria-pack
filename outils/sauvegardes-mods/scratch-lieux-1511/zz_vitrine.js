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
  var m = /^mcwfurnitures:/.test(b) && b.match(/_couch\[facing=(north|east|south|west)/); if (m) b = b.replace('_couch[facing=' + m[1], '_couch[facing=' + QUART[m[1]])
  m = b.match(/kitchen_cabinet\[facing=(north|east|south|west)/); if (m) b = b.replace('kitchen_cabinet[facing=' + m[1], 'kitchen_cabinet[facing=' + OPP[m[1]])
  return b
}
// HB2 = true pendant une construction v2 : S/SA/F memorisent chaque bloc (HM) et passent par la palette THM (voir lot28)
var HB2 = false, THM = null, HM = {}
function hk(x, y, z) { return (OX + x) + ',' + (OY + y) + ',' + (OZ + z) }
function idDe(b) { var i = b.indexOf('['); return i < 0 ? b : b.substring(0, i) }
function thm(b, x, y, z) { if (!THM) return b; var f = THM[idDe(b)]; if (!f) return b; var r = f(x, y, z, b); return r || b }
function libreH(x, y, z) { var b = HM[hk(x, y, z)]; return !b || b == AIR }
// paves Macaw : plaques fines posees SUR le sol ; un pave demande au niveau du sol devient sol plein + plaque au-dessus (si l'air est libre)
var PAVE_BASE = [['mossy_cobblestone', 'mossy_cobblestone'], ['cobbled_deepslate', 'cobbled_deepslate'], ['mossy_stone', 'mossy_stone_bricks'], ['cobblestone', 'cobblestone'], ['andesite', 'polished_andesite'], ['diorite', 'polished_diorite'], ['granite', 'polished_granite'], ['sandstone', 'smooth_sandstone'], ['red_sandstone', 'smooth_red_sandstone'], ['blackstone', 'polished_blackstone'], ['deepslate', 'polished_deepslate'], ['stone', 'stone_bricks'], ['brick', 'bricks'], ['dirt', 'dirt'], ['gravel', 'gravel']]
// mesure en jeu (banc hauteurs) : *_paving et *_path = plaques de 1/16 ; flagstone, running_bond, etc. = blocs pleins ; *_slab = 8/16
function estPave(b) { return b.indexOf('mcwpaths:') == 0 && /(_paving|_path)$/.test(idDe(b)) }
function paveBase(b) { var n = idDe(b).substring(9); for (var i = 0; i < PAVE_BASE.length; i++) if (n.indexOf(PAVE_BASE[i][0] + '_') == 0) return 'minecraft:' + PAVE_BASE[i][1]; return 'minecraft:stone_bricks' }
var PAVE_NB = 0
function sansTapisRue(y, z, b) { return y == 0 && z >= 32 && z <= 47 && /_carpet$/.test(idDe(b)) }  // retour Mika : pas de tapis poses sur la chaussee ni les trottoirs
function S(x, y, z, b) { if (y > CUT) return; b = thm('' + b, x, y, z); if (sansTapisRue(y, z, b)) return; if (estPave(b) && y < 0) { PAVE_NB++; S0(x, y, z, paveBase(b)); SA(x, y + 1, z, b); return } S0(x, y, z, b) }
function S0(x, y, z, b) { if (HB2) HM[hk(x, y, z)] = b; VB.q.push('setblock ' + (OX + x) + ' ' + (OY + y) + ' ' + (OZ + z) + ' ' + corr(b)) }
function SA(x, y, z, b) { if (y > CUT) return; b = thm('' + b, x, y, z); if (sansTapisRue(y, z, b)) return; if (HB2 && libreH(x, y, z)) HM[hk(x, y, z)] = b; VB.q.push('fill ' + (OX + x) + ' ' + (OY + y) + ' ' + (OZ + z) + ' ' + (OX + x) + ' ' + (OY + y) + ' ' + (OZ + z) + ' ' + corr(b) + ' replace minecraft:air') }
function F(x1, y1, z1, x2, y2, z2, b) {
  if (y1 > CUT) return; if (y2 > CUT) y2 = CUT; b = '' + b
  var ax = Math.min(x1, x2), bx = Math.max(x1, x2), ay = Math.min(y1, y2), by = Math.max(y1, y2), az = Math.min(z1, z2), bz = Math.max(z1, z2)
  if ((THM && THM[idDe(b)]) || (estPave(b) && ay < 0)) { for (var x = ax; x <= bx; x++) for (var y = ay; y <= by; y++) for (var z = az; z <= bz; z++) S(x, y, z, b); return }
  if (HB2 && (bx - ax + 1) * (by - ay + 1) * (bz - az + 1) <= 8000) for (var x = ax; x <= bx; x++) for (var y = ay; y <= by; y++) for (var z = az; z <= bz; z++) HM[hk(x, y, z)] = b
  b = corr(b)
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
  for (var cx = X0 - 16; cx < X0 + 360; cx += 16) for (var cz = Z0 - 16; cz < Z0 + (typeof PREP_ZMAX == 'number' ? PREP_ZMAX : 96); cz += 16) {
    VB.q.push('fill ' + cx + ' ' + Y0 + ' ' + cz + ' ' + (cx + 15) + ' ' + (Y0 + 76) + ' ' + (cz + 15) + ' minecraft:air')
    VB.q.push('fill ' + cx + ' ' + (Y0 - 5) + ' ' + cz + ' ' + (cx + 15) + ' ' + (Y0 - 2) + ' ' + (cz + 15) + ' minecraft:dirt')
    VB.q.push('fill ' + cx + ' ' + (Y0 - 1) + ' ' + cz + ' ' + (cx + 15) + ' ' + (Y0 - 1) + ' ' + (cz + 15) + ' minecraft:grass_block')
  }
  if (typeof BANC_FN == 'function') { BANC_FN(); return }
  if (typeof QFIN == 'function') { QFIN(); return }
  // haussmannien v2 (palette moddee) ; v1 envoye le 07/11 (grands-14) = memes lots avec hbXxx et HB2 = false, vues dans vuesHauss2()
  // haussmannien FINAL (v2 + Macaw's Windows / Paths, Handcrafted) : memes lots, FIN = true, palette THM_HF, volets par batiment
  HB2 = true; FIN = true; THM = THM_HF
  function VLT(vol, rid, fn) { return function () { HM = {}; FIN_VOLET = vol; FIN_RID = rid; fn(); finAncrage() } }
  var MAG = VLT(null, null, hb2GrandMagasin), IMM = VLT('mcwwindows:iron_shutter', ['white', 'light_gray', 'red'], hb2Immeubles), GAR = VLT(null, null, hb2Gare), THE = VLT(null, ['red'], hb2Theatre)
  var HAL = VLT(null, null, hb2Halles), HBM = VLT('mcwwindows:dark_oak_louvered_shutter', ['white', 'yellow', 'light_blue', 'pink', 'green'], hb2HBM), SQU = VLT(null, null, hb2Square), BAN = VLT('mcwwindows:iron_shutter', ['red', 'brown'], hb2Banque)
  GRAINE = 93; OX = X0; OY = Y0; OZ = Z0; CUT = 999; HM = {}; hb2Rue(); finAncrage()
  lot(MAG, 0, 0, 999, 411, 32, 46); lot(IMM, 32, 0, 999, 421, 32, 46); lot(GAR, 64, 0, 999, 431, 32, 26); lot(THE, 96, 0, 999, 441, 32, 32)
  lot(HAL, 0, 48, 999, 451, 32, 20); lot(HBM, 32, 48, 999, 461, 32, 50); lot(SQU, 64, 48, 999, 471, 32, 12); lot(BAN, 96, 48, 999, 481, 32, 17)
  lot(MAG, 144, 0, 13, 411, 32, 46); lot(IMM, 180, 0, 9, 421, 32, 46); lot(GAR, 216, 0, 7, 431, 32, 26); lot(THE, 252, 0, 12, 441, 32, 32)
  lot(HAL, 144, 48, 6, 451, 32, 20); lot(HBM, 180, 48, 15, 461, 32, 50); lot(BAN, 216, 48, 6, 481, 32, 17)
  vlog('FIN volets ' + FIN_NV + ' rideaux ' + FIN_NR + ' paves ' + PAVE_NB + ' ancrages ' + ANC_NB); HB2 = false; FIN = false; THM = null; HM = {}
  // gothique (envoye le 07/11) : gtRue() ; gtHalleDraps 0/0, gtBeffroi 32/0, gtMaisons 64/0, gtSquareClos 96/0, gtHospice 0/48, gtBibliotheque 32/48, gtQuai 64/48, gtJardin 96/48 (graines 311..381) ; vues dans vuesGothique()
  // desert (envoye le 07/11) : dsRue() ; dsRelais 0/0, dsMairie 32/0, dsSouk 64/0, dsPueblo 96/0, dsMotel 0/48, dsStation 32/48, dsSherif 64/48, dsOasis 96/48 (graines 211..281) ; vues dans vuesDesert()
  // bourg forestier (valide le 07/11) : bgRue() puis bgMairie 0/0, bgSalleCommunale 32/0, bgPlace 64/0, bgMaisons 96/0, bgCommerces 0/48, bgEcole 32/48, bgAuberge 64/48, bgScierie 96/48 ; vues dans vuesBourg()
  // atelierRouille 0/36, bidonvilleGrand 72/108, caserne 144/180/216 : voir vuesAncien2()
  // manoirGothique : lot(manoirGothique, 0, 0, 999, 91, 32, 41) + coupes 16, 10, 4 ; tourBureaux + coupes 29, 17, 4 ; vues dans vuesManoirTour()
  // chaletGrand : lot(chaletGrand, 0, 0, 999, 81, 32, 23) + coupes 10, 4 ; vues dans vuesChalet()
  // maisonsVille : lot(maisonsVille, 0, 0, 999, 33, 32, 23) + coupes 10, 4, 15 ; vues dans vuesMaisons()
  // hauss : lot(hauss, 0, 0, 999, 71, 32, 51) + coupes 16, 4, 40 ; vues dans vuesHauss()
  // lots precedents : villaModerne 0/56/112, grandeVilla 168, testOrient 172/38, grandHLM 216
}

// Usure : briques fendues, vitres cassees, toiles d'araignee, mousse
function user(lvl, L) {
  var BP = Java.loadClass('net.minecraft.core.BlockPos'), REG = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries'), LL = Java.loadClass('net.minecraft.world.level.LightLayer')
  GRAINE = 5000 + (L.z - VB.Z0) * 7
  var cmds = []
  function id(x, y, z) { return '' + REG.BLOCK.getKey(lvl.getBlockState(new BP(x, y, z)).getBlock()) }
  function plein(x, y, z) { var st = lvl.getBlockState(new BP(x, y, z)); return st.isSolidRender(lvl, new BP(x, y, z)) }
  for (var x = L.x; x < L.x + L.w; x++) for (var z = L.z; z < L.z + L.w; z++) for (var y = VB.Y0; y <= VB.Y0 + L.h; y++) {
    var b = id(x, y, z), r = R(), c = x + ' ' + y + ' ' + z
    if (b == 'minecraft:bricks') { if (r < 0.05) cmds.push('setblock ' + c + ' createdeco:cracked_red_bricks');  }
    else if (b == 'minecraft:stone_bricks') { if (r < 0.2) cmds.push('setblock ' + c + ' minecraft:cracked_stone_bricks'); else if (r < 0.35) cmds.push('setblock ' + c + ' minecraft:mossy_stone_bricks') }
    else if (b == 'minecraft:air' && y > VB.Y0) {
      if (plein(x, y + 1, z)) { var n = 0; if (plein(x + 1, y, z)) n++; if (plein(x - 1, y, z)) n++; if (plein(x, y, z + 1)) n++; if (plein(x, y, z - 1)) n++; if (n >= 2 && r < 0.3 && lvl.getBrightness(LL.SKY, new BP(x, y, z)) <= 10) cmds.push('setblock ' + c + ' minecraft:cobweb') }  // toiles seulement a l'interieur
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
  vue('ds_relais', 0, 0, 14.5, 6, 44, 14.5, 10, 18)
  vue('ds_relais_patio', 0, 0, 29, 16, 30, 20, 1, 18)
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
  vue('ds_coupe_relais', 144, 0, 15, 26, 42, 15, 1, 15)
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
  vue('bg_salle_communale', 0, 0, 47.5, 6, 46, 47.5, 16, 18)
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
  vue('bg_coupe_salle_communale', 180, 0, 16, 26, 42, 15, 1, 15)
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
    if (typeof QFIN == 'function') for (var fz = VB.Z0 + 96; fz < VB.Z0 + 352; fz += 128) server.runCommandSilent('forceload add ' + (VB.X0 - 16) + ' ' + fz + ' ' + (VB.X0 + 295) + ' ' + (fz + 127))
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
    else { server.runCommandSilent('kill @e[type=!minecraft:player,type=!mts:builder_existing,type=!mts:builder_seat,type=!mts:builder_rendering]'); if (typeof BANC_MTS == 'function') BANC_MTS(server, lvl); if (typeof BANC_VUES == 'function') BANC_VUES(); else if (typeof QFIN_VUES == 'function') QFIN_VUES(); else vuesHaussF(); VB.etape = 5; VB.vi = 0; VB.att = VB.t + 60 }
  }
  if (VB.etape == 5 && VB.t >= VB.att) {
    if (VB.vi >= VB.vues.length) { vlog('fin des vues'); console.info('[TEST BUGS] fin'); VB.etape = 6; return }
    var v = VB.vues[VB.vi]
    if (v.temps) server.runCommandSilent('time set ' + v.temps)
    var ex = v.ox + v.e[0], ey = VB.Y0 + v.e[1], ez = v.oz + v.e[2], tx = v.ox + v.t[0], ty = VB.Y0 + v.t[1], tz = v.oz + v.t[2]
    var dx = tx - ex, dy = ty - ey, dz = tz - ez
    var yaw = Math.atan2(-dx, dz) * 180 / Math.PI, pitch = -Math.atan2(dy, Math.sqrt(dx * dx + dz * dz)) * 180 / Math.PI
    server.runCommandSilent('kill @e[type=!minecraft:player,type=!mts:builder_existing,type=!mts:builder_seat,type=!mts:builder_rendering]')
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
    if (R() < 0.25) { S(a + 4, y + 4, ZS + 1, 'minecraft:iron_trapdoor[facing=south,half=bottom,open=true]') }
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
function piece(c, type, etat) { pieceV1(c, type, etat); if (typeof HB2 != 'undefined' && HB2) { pieceEnrichir(c, type, etat); if (FIN) finPiece(c, type, etat) } }
function pieceV1(c, type, etat) {
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
