// roue ronde 3 x 3 (vue de cote) a u..u+2, y0..y2 : pneu en escaliers aux coins, jante en fer, ecrou central
var VH3PH = 'minecraft:sea_lantern', VH3CL = 'minecraft:shroomlight', VH3FR = 'minecraft:red_concrete'
function vhRoue3(u, v) {
  var P = 'minecraft:polished_blackstone', E = P + '_stairs'
  vS(u, 0, v, E + '[facing={B},half=top,shape=straight]'); vS(u + 1, 0, v, P); vS(u + 2, 0, v, E + '[facing={F},half=top,shape=straight]')
  vS(u, 1, v, P); vS(u + 1, 1, v, 'minecraft:iron_block'); vS(u + 2, 1, v, P)
  vS(u, 2, v, E + '[facing={B},half=bottom,shape=straight]'); vS(u + 1, 2, v, P); vS(u + 2, 2, v, E + '[facing={F},half=bottom,shape=straight]')
  var ext = v == 0 ? -1 : VH.W, f = v == 0 ? '{G}' : '{D}'
  vS(u + 1, 1, ext, 'minecraft:polished_blackstone_button[face=wall,facing=' + f + ']')
}
function vhEssieu3(u) { vhRoue3(u, 0); vhRoue3(u, VH.W - 1); for (var v = 1; v < VH.W - 1; v++) { vS(u, 0, v, 'minecraft:air'); vS(u + 2, 0, v, 'minecraft:air'); vS(u + 1, 1, v, VHPN) } }

// ---------------- AMBULANCE v4 (15 x 5, 9 de haut) : fourgon cellule, nez court, pare-brise, cellule haute ----------------
function vhAmbulance3(x, z, dir, y) {
  vhDebut(x, y, z, dir, 15, 5)
  var B = 'minecraft:white_concrete', Q = 'minecraft:smooth_quartz', RG = 'minecraft:red_concrete', JA = 'minecraft:yellow_concrete', V = 'minecraft:tinted_glass'
  var BL = 'minecraft:blue_stained_glass', GR = 'minecraft:light_gray_concrete', A = 'minecraft:air'
  // chassis et roues (avant u1-3, arriere u10-12)
  vF(1, 1, 1, 13, 2, 3, VHPN)
  vhEssieu3(1); vhEssieu3(10)
  for (var u = 0; u <= 14; u++) if (!(u >= 1 && u <= 3) && !(u >= 10 && u <= 12)) vS2(u, 2, 0, B)
  // caisse pleine puis on evide
  vF(0, 3, 0, 14, 7, 4, B); vF(3, 8, 0, 14, 8, 4, B)
  // avant : pare-chocs gris fonce, phares, calandre, capot court et plongeant
  vF(0, 1, 0, 0, 1, 4, VHPC); vF(0, 2, 0, 0, 2, 4, VHPN)
  vS(0, 3, 0, VH3PH); vS(0, 3, 4, VH3PH); vF(0, 3, 1, 0, 3, 3, VHN); vS(0, 3, 2, 'minecraft:iron_block')
  vS2(0, 2, 0, VH3CL)
  vF(0, 4, 0, 0, 4, 4, Q + '_stairs[facing={B},half=bottom,shape=straight]'); vF(0, 5, 0, 0, 7, 4, A)
  vF(1, 5, 0, 1, 5, 4, Q + '_stairs[facing={B},half=bottom,shape=straight]'); vF(1, 6, 0, 1, 7, 4, A)
  // pare-brise (u2), montants blancs, pavillon arrondi
  vF(2, 5, 1, 2, 6, 3, V); vF(2, 7, 0, 2, 7, 4, Q + '_stairs[facing={B},half=bottom,shape=straight]')
  vhRetros(2, 6)
  // cabine : vitres de portiere, interieur, sieges, tableau de bord
  vS2(3, 5, 0, V); vS2(4, 5, 0, V); vS2(3, 6, 0, V); vS2(4, 6, 0, V)
  vF(3, 3, 1, 5, 6, 3, A); vF(3, 4, 1, 3, 4, 3, 'minecraft:polished_blackstone_slab[type=bottom]')
  vS(5, 3, 1, 'minecraft:blackstone_stairs[facing={B},half=bottom,shape=straight]'); vS(5, 3, 3, 'minecraft:blackstone_stairs[facing={B},half=bottom,shape=straight]')
  // rampe de gyrophares au-dessus du pare-brise
  vF(3, 8, 0, 3, 8, 4, BL); vS(3, 8, 2, GR)
  // bandes damier rouge et jaune sur tout le flanc
  for (var u = 2; u <= 14; u++) { vS2(u, 3, 0, u % 2 ? RG : JA); vS2(u, 4, 0, u % 2 ? JA : RG) }
  // croix medicale rouge sur la cellule
  ;[[10, 7], [9, 6], [10, 6], [11, 6], [10, 5]].forEach(c => vS2(c[0], c[1], 0, RG))
  // porte laterale coulissante (cote droit) : vitre depolie, joints gris, poignee
  vF(7, 5, 4, 8, 6, 4, 'minecraft:white_stained_glass'); vF(6, 3, 4, 6, 7, 4, GR); vF(9, 3, 4, 9, 7, 4, GR)
  vS(8, 4, 5, 'minecraft:lever[face=wall,facing={D},powered=false]')
  // cellule : interieur, cloison avec passe-vitre, plancher, brancard, armoires, bouteille d'oxygene
  vF(7, 3, 1, 13, 7, 3, A); vF(6, 3, 1, 6, 7, 3, B); vS(6, 5, 2, V)
  vF(6, 2, 1, 13, 2, 3, GR)
  vF(9, 3, 2, 12, 3, 2, Q + '_slab[type=top]')
  vF(7, 3, 1, 8, 6, 1, GR); vF(7, 7, 1, 13, 7, 1, GR); vS(13, 3, 3, 'minecraft:light_blue_concrete'); vS(13, 4, 3, 'minecraft:end_rod[facing=up]')
  vS(7, 3, 3, 'minecraft:warped_stairs[facing={G},half=bottom,shape=straight]')
  // arriere : deux battants, vitres, feux verticaux, poignees, marchepied
  vF(14, 3, 0, 14, 7, 4, B); vF(14, 3, 2, 14, 7, 2, GR); vS(14, 6, 1, V); vS(14, 6, 3, V)
  for (var yy = 3; yy <= 4; yy++) for (var v = 0; v <= 4; v++) vS(14, yy, v, (v + yy) % 2 ? RG : JA)
  vF(14, 5, 0, 14, 7, 0, VH3FR); vF(14, 5, 4, 14, 7, 4, VH3FR)
  vS(15, 5, 1, 'minecraft:lever[face=wall,facing={B},powered=false]'); vS(15, 5, 3, 'minecraft:lever[face=wall,facing={B},powered=false]')
  vF(15, 2, 0, 15, 2, 4, VHPC); vF(14, 2, 0, 14, 2, 4, VHPN)
  // toit : gyrophares d'angle arriere, climatiseur
  vS(14, 8, 0, BL); vS(14, 8, 4, BL)
  vF(9, 9, 1, 11, 9, 3, 'minecraft:smooth_stone_slab[type=bottom]')
}
