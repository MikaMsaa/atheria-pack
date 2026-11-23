// ---------------- CAMION BACHE v4 (20 x 5, 10 de haut) : cabine avancee, calandre a barreaux, bache sur arceaux ----------------
function vhCamion3(x, z, dir, col, y) {
  vhDebut(x, y, z, dir, 20, 5)
  var C = 'minecraft:' + (col || 'green') + '_concrete', T = col == 'white' ? 'minecraft:white_wool' : col == 'green' ? 'minecraft:green_terracotta' : 'minecraft:' + col + '_wool'
  var T2 = col == 'white' ? 'minecraft:light_gray_wool' : col == 'green' ? 'minecraft:brown_terracotta' : 'minecraft:gray_wool'
  var TC = col == 'green' ? 'minecraft:green_carpet' : col == 'white' ? 'minecraft:white_carpet' : 'minecraft:' + col + '_carpet'
  var V = 'minecraft:tinted_glass', A = 'minecraft:air', PL = 'minecraft:spruce_planks'
  // longerons et roues (avant u1-3, tandem arriere u12-14 et u15-17)
  vF(0, 2, 1, 19, 2, 3, VHPN)
  vhEssieu3(1); vhEssieu3(12); vhEssieu3(15)
  // pare-chocs, phares
  vF(0, 1, 0, 0, 1, 4, VHPC); vF(0, 2, 0, 0, 2, 4, VHPN); vS(0, 2, 0, VH3PH); vS(0, 2, 4, VH3PH)
  // cabine avancee u0-4, y3-7, toit y8
  vF(0, 3, 0, 4, 7, 4, C); vF(1, 3, 1, 3, 6, 3, A)
  // calandre a barreaux sur fond noir, clignotants
  vF(1, 3, 1, 1, 4, 3, VHN); vF(0, 3, 1, 0, 4, 3, 'minecraft:iron_bars'); vS(0, 4, 0, VH3CL); vS(0, 4, 4, VH3CL)
  // pare-brise, montants, bandeau, pare-soleil
  vF(0, 5, 1, 0, 6, 3, V); vF(-1, 7, 0, -1, 7, 4, 'minecraft:polished_blackstone_slab[type=top]')
  vF(0, 8, 0, 4, 8, 4, 'minecraft:' + (col == 'white' ? 'smooth_quartz' : 'smooth_stone') + '_slab[type=bottom]')
  // portieres : vitre 2 x 2, retroviseurs, marchepied derriere la roue
  vS2(1, 5, 0, V); vS2(2, 5, 0, V); vS2(1, 6, 0, V); vS2(2, 6, 0, V)
  vhRetros(0, 6); vhRetros(0, 5)
  vS(4, 2, -1, 'minecraft:iron_trapdoor[facing={D},half=top,open=false]'); vS(4, 2, 5, 'minecraft:iron_trapdoor[facing={G},half=top,open=false]')
  // interieur : sieges, tableau de bord
  vF(1, 5, 1, 1, 5, 3, A); vS(1, 4, 1, 'minecraft:polished_blackstone_slab[type=top]'); vS(1, 4, 3, 'minecraft:polished_blackstone_slab[type=top]')
  vS(3, 3, 1, 'minecraft:blackstone_stairs[facing={B},half=bottom,shape=straight]'); vS(3, 3, 3, 'minecraft:blackstone_stairs[facing={B},half=bottom,shape=straight]')
  // entre cabine et plateau : echappement vertical, reservoir, coffre a batterie
  vF(5, 3, 0, 5, 9, 0, 'minecraft:chain[axis=y]'); vF(5, 3, 1, 5, 3, 4, VHPN)
  vF(6, 2, 0, 8, 2, 0, 'minecraft:iron_block'); vF(6, 2, 4, 7, 2, 4, VHPN)
  // plateau u6-19 : plancher, ridelles bois, bache sur arceaux (y5-8, toit y9)
  vF(6, 3, 0, 19, 3, 4, PL); vF(6, 4, 0, 19, 4, 4, PL)
  vF(6, 5, 0, 19, 8, 4, T); vF(6, 9, 1, 19, 9, 3, T); vF(6, 9, 0, 19, 9, 0, TC); vF(6, 9, 4, 19, 9, 4, TC)
  for (var u = 6; u <= 18; u += 3) { for (var yy = 5; yy <= 8; yy++) vS2(u, yy, 0, T2); vF(u, 9, 1, u, 9, 3, T2) }
  vF(7, 4, 1, 19, 8, 3, A)
  // arriere : bache relevee (roulee en haut), chargement, ridelle arriere, feux, barre anti-encastrement
  vF(19, 8, 1, 19, 8, 3, T2)
  vF(19, 4, 1, 19, 4, 3, PL)
  ;[[17, 4, 1, 'minecraft:barrel[facing=up,open=false]'], [17, 4, 2, 'supplementaries:sack'], [18, 4, 3, 'minecraft:barrel[facing=up,open=false]'], [16, 4, 1, 'minecraft:barrel[facing=up,open=false]'], [16, 5, 1, 'minecraft:barrel[facing=up,open=false]'], [15, 4, 3, 'supplementaries:sack'], [14, 4, 2, 'minecraft:barrel[facing=up,open=false]']].forEach(c => vS(c[0], c[1], c[2], c[3]))
  vS(19, 2, 0, VH3FR); vS(19, 2, 4, VH3FR)
  vF(20, 1, 0, 20, 1, 4, VHPC)
}
