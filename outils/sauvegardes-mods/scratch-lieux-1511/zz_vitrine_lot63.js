// ================= TRAINS v5 (lot63, 13/11) : wagon-citerne refait, vues des voitures voyageurs degagees =================
// Citerne : reservoir cylindrique blanc (quartz lisse), ventre arrondi et berceaux sur les selles, bouts arrondis, fonds bombes,
// dome de remplissage avec trappe, passerelle et echelle a mi-longueur, chassis rivete et tampons.
function vhCiterne5(x, z, dir, y) {
  vhDebut(x, y, z, dir, 14, 3); vhVoie(14); vhBogie4(2); vhBogie4(11)
  var P = 'minecraft:smooth_quartz', ES = 'minecraft:smooth_quartz_stairs', SL = 'minecraft:smooth_quartz_slab'
  vF(0, 1, 0, 13, 1, 2, 'railways:black_riveted_locometal')
  for (var u = 1; u <= 12; u++) {
    var bout = u == 1 || u == 12, selle = u == 2 || u == 3 || u == 10 || u == 11
    // dessous : berceaux pleins sur les selles, ailleurs ventre arrondi (demi-dalle haute au centre, vide sur les flancs)
    if (selle) { vS(u, 2, 0, ES + '[facing={D},half=top,shape=straight]'); vS(u, 2, 1, P); vS(u, 2, 2, ES + '[facing={G},half=top,shape=straight]') }
    else vS(u, 2, 1, SL + '[type=top]')
    // corps plein
    vF(u, 3, 0, u, 4, 2, P)
    // dessus : escaliers sur les flancs, dalle au centre ; aux bouts, seul le centre (fond arrondi vu de flanc)
    if (bout) vS(u, 5, 1, ES + '[facing={' + (u == 1 ? 'B' : 'F') + '},half=bottom,shape=straight]')
    else { vS(u, 5, 0, ES + '[facing={D},half=bottom,shape=straight]'); vS(u, 5, 1, SL + '[type=bottom]'); vS(u, 5, 2, ES + '[facing={G},half=bottom,shape=straight]') }
  }
  // fonds bombes : renflement au centre des deux bouts
  ;[[0, 'B'], [13, 'F']].forEach(t => { vS(t[0], 3, 1, ES + '[facing={' + t[1] + '},half=top,shape=straight]'); vS(t[0], 4, 1, ES + '[facing={' + t[1] + '},half=bottom,shape=straight]') })
  // dome de remplissage et trappe au milieu, echelle
  vS(6, 5, 1, P); vS(7, 5, 1, P); vS(6, 6, 1, 'minecraft:iron_trapdoor[facing={F},half=bottom,open=false]'); vS(7, 6, 1, 'minecraft:iron_trapdoor[facing={B},half=bottom,open=false]')
  vS(6, 2, -1, 'railways:black_locometal_rung_ladder[facing={G},waterlogged=false]'.replace('{G}', VH.o.G == 'north' ? 'north' : VH.o.G))
  ;[[-1, 'F'], [14, 'B']].forEach(t => vS(t[0], 1, 1, 'railways:headstock[facing={' + t[1] + '},style=buffer,upside_down=false]'))
}
function vhBancRail5() {
  OX = VB.X0; OY = VB.Y0; OZ = VB.Z0; CUT = 999; GRAINE = 6301
  for (var x = -10; x <= 110; x++) for (var z = -4; z <= 30; z++) { var r = R(); S(x, -1, z, z == 4 || z == 11 || z == 18 ? 'minecraft:gravel' : r < 0.9 ? 'minecraft:black_concrete' : 'minecraft:gray_concrete') }
  F(-10, 0, -4, 110, 30, 30, 'minecraft:air')
  F(-10, -3, -4, 110, -2, 30, 'minecraft:stone')   // appui sous les rails Create (sans support, la voie casse)
  vhTram4(6, 3, 'x'); vhMetro4(44, 3, 'x')
  vhVoyageurs4(6, 10, 'x', 'green'); vhVoyageurs4(32, 10, 'x', 'red')
  vhWagonCouvert4(6, 17, 'x', 'brown'); vhCiterne5(24, 17, 'x'); vhWagonCouvert4(42, 17, 'x', 'gray')
}
BANC_MTS = function (server, lvl) { }   // pas de vehicules MTS sur ce banc
var QFIN_RAIL5 = function () { HM = {}; lot(vhBancRail5, 0, 0, 999, 6301, 110, 20) }
function vuesRail5() {
  // voitures voyageurs : camera dans l'allee entre les voies (z 13..16), en enfilade le long des caisses
  vue('r5_voyageurs_enfilade', 0, 0, 30, 3.5, 7.5, 16, 3, 11)
  vue('r5_voyageurs_flanc', 0, 0, 30, 3.5, 7.5, 44, 3, 11)
  vue('r5_voyageurs_dessus', 0, 0, 30, 14, 15, 30, 3, 11)
  vue('r5_voyageurs_bout', 0, 0, 60, 4, 14, 50, 2.5, 11)
  // citerne : de trois quarts, de flanc, de haut, en bout
  vue('r5_citerne_34', 0, 0, 44, 5, 24, 31, 3, 18)
  vue('r5_citerne_flanc', 0, 0, 31, 3.5, 25, 31, 3, 18)
  vue('r5_citerne_dessus', 0, 0, 38, 14, 28, 31, 3, 18)
  vue('r5_citerne_bout', 0, 0, 34, 4, 22, 24, 3, 18)
  // rails sous les bogies (vue rasante)
  vue('r5_bogie_rail', 0, 0, 22, 1.2, 15.5, 27, 0, 18)
}
