// ================= VEHICULES MAQUETTES v2 (lot53, 11/11) =================
// Retour de Mika (10/11) : tram, ambulance, camion et conteneurs trop simplifies. Ils restent en maquette (pas de modele MTS) :
// echelle 1,5 environ, details de vrais vehicules (pare-chocs, phares, retroviseurs, enjoliveurs, sieges, soufflets, pantographe...).
// Repere local : u le long du vehicule (0 = avant), v en travers (0 = cote gauche du conducteur), y vers le haut (0 = sur la chaussee).
// dir : 'x' avant vers l'est, 'xr' vers l'ouest, 'z' vers le sud, 'zr' vers le nord. Jetons d'orientation dans les etats :
// {F} avant, {B} arriere, {G} cote gauche (v = 0), {D} cote droit, {AU} axe de la longueur, {AV} axe de la largeur.
var VH = null
var VH_DIRS = {
  x: { F: 'east', B: 'west', G: 'north', D: 'south', AU: 'x', AV: 'z' },
  xr: { F: 'west', B: 'east', G: 'south', D: 'north', AU: 'x', AV: 'z' },
  z: { F: 'south', B: 'north', G: 'east', D: 'west', AU: 'z', AV: 'x' },
  zr: { F: 'north', B: 'south', G: 'west', D: 'east', AU: 'z', AV: 'x' }
}
function vhDebut(x0, y0, z0, dir, L, W) { VH = { x0: x0, y0: y0 || 0, z0: z0, d: dir, L: L, W: W, o: VH_DIRS[dir] } }
function vhXZ(u, v) {
  var d = VH.d, L = VH.L, W = VH.W
  // l'avant (u = 0) est du cote ou le vehicule regarde ; v = 0 a sa gauche
  if (d == 'x') return [VH.x0 + L - 1 - u, VH.z0 + v]
  if (d == 'xr') return [VH.x0 + u, VH.z0 + W - 1 - v]
  if (d == 'z') return [VH.x0 + W - 1 - v, VH.z0 + L - 1 - u]
  return [VH.x0 + v, VH.z0 + u]
}
function vhT(b) { var o = VH.o; return ('' + b).replace(/\{(F|B|G|D|AU|AV)\}/g, (m, k) => o[k]) }
function vS(u, y, v, b) { var p = vhXZ(u, v); S(p[0], VH.y0 + y, p[1], vhT(b)) }
function vF(u1, y1, v1, u2, y2, v2, b) { for (var u = Math.min(u1, u2); u <= Math.max(u1, u2); u++) for (var y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) for (var v = Math.min(v1, v2); v <= Math.max(v1, v2); v++) vS(u, y, v, b) }
// les deux flancs a la fois (v et son symetrique)
function vS2(u, y, v, b) { vS(u, y, v, b); vS(u, y, VH.W - 1 - v, b) }

var VHN = 'minecraft:black_concrete', VHPN = 'minecraft:polished_blackstone', VHPC = 'minecraft:polished_blackstone_slab[type=top]'
var VHPH = 'minecraft:white_stained_glass', VHFR = 'minecraft:red_stained_glass', VHCL = 'minecraft:orange_stained_glass'
// roue : pneu plein + enjoliveur (bouton) sur la face exterieure
function vhRoue(u, v) {
  vS(u, 0, v, VHN)
  if (v == 0) vS(u, 0, -1, 'minecraft:stone_button[face=wall,facing={G}]')
  else vS(u, 0, VH.W, 'minecraft:stone_button[face=wall,facing={D}]')
}
function vhRoues(u) { vhRoue(u, 0); vhRoue(u, VH.W - 1) }
// retroviseurs : petit bloc sombre accroche au flanc de la cabine
function vhRetros(u, y) { vS(u, y, -1, 'minecraft:polished_blackstone_button[face=wall,facing={G}]'); vS(u, y, VH.W, 'minecraft:polished_blackstone_button[face=wall,facing={D}]') }

// ---------------- AMBULANCE (fourgon cellule, 9 x 3, 5 de haut) ----------------
// Cabine basse a l'avant (capot court, pare-brise), cellule sanitaire haute, rampe de gyrophares, croix rouge medicale, portes arriere vitrees.
function vhAmbulance(x, z, dir, y) {
  vhDebut(x, y, z, dir, 9, 3)
  var BL = 'minecraft:white_concrete', BLD = 'minecraft:smooth_quartz_slab[type=bottom]', RG = 'minecraft:red_concrete', JA = 'minecraft:yellow_concrete'
  // chassis, pare-chocs, roues (avant u1, arriere u6)
  vF(0, 0, 0, 0, 0, 2, VHPC); vF(8, 0, 0, 8, 0, 2, VHPC); vF(1, 0, 1, 7, 0, 1, VHPN)
  for (var u = 2; u <= 7; u++) if (u != 6) vS2(u, 0, 0, 'minecraft:smooth_quartz_slab[type=top]')
  vhRoues(1); vhRoues(6)
  // capot : calandre, phares, clignotants
  vS(0, 1, 0, VHPH); vS(0, 1, 1, 'minecraft:light_gray_concrete'); vS(0, 1, 2, VHPH)
  vF(0, 2, 0, 0, 2, 2, 'minecraft:smooth_quartz_stairs[facing={B},half=bottom,shape=straight]')
  // cabine : bas de caisse, pare-brise, vitres de portiere, toit
  vF(1, 1, 0, 2, 1, 2, BL); vS(1, 1, 1, VHN)
  vF(1, 2, 0, 1, 2, 2, 'minecraft:tinted_glass')
  vS2(2, 2, 0, 'minecraft:tinted_glass'); vS(2, 2, 1, 'minecraft:air'); vS(2, 1, 1, 'minecraft:gray_wool')
  vF(1, 3, 0, 2, 3, 2, BLD)
  vhRetros(1, 2)
  // cellule : parois, bandeau rouge et jaune (damier), croix rouge, vitre depolie, toit
  vF(3, 1, 0, 8, 4, 2, BL); vF(3, 1, 1, 7, 3, 1, 'minecraft:air')
  for (var u = 3; u <= 8; u++) vS2(u, 1, 0, u % 2 ? RG : JA)
  vS2(6, 2, 0, RG); vS2(5, 3, 0, RG); vS2(6, 3, 0, RG); vS2(7, 3, 0, RG); vS2(6, 4, 0, RG)
  vS2(4, 3, 0, 'minecraft:white_stained_glass')
  vF(3, 5, 0, 8, 5, 2, BLD)
  // rampe de gyrophares au-dessus de la cabine, feux arriere hauts
  vS(3, 5, 0, 'minecraft:blue_stained_glass'); vS(3, 5, 1, 'minecraft:light_gray_concrete'); vS(3, 5, 2, 'minecraft:blue_stained_glass')
  vS2(8, 5, 0, 'minecraft:blue_stained_glass')
  // portes arriere : deux battants vitres en haut, poignees, feux
  vS(8, 3, 0, 'minecraft:tinted_glass'); vS(8, 3, 2, 'minecraft:tinted_glass'); vS(8, 3, 1, BL)
  vS(8, 1, 0, VHFR); vS(8, 1, 2, VHFR)
  vS(9, 2, 1, 'minecraft:lever[face=wall,facing={B},powered=false]')
  // interieur : brancard, armoire
  vF(5, 1, 1, 6, 1, 1, 'minecraft:smooth_quartz_slab[type=bottom]'); vS(3, 1, 1, 'minecraft:light_gray_concrete'); vS(3, 2, 1, 'minecraft:iron_trapdoor[facing={F},half=bottom,open=false]')
}

// ---------------- CAMION PORTEUR A BACHE (11 x 4, 6 de haut) ----------------
// Cabine avancee (calandre chromee, phares, pare-brise, retroviseurs, deflecteur), plateau a ridelles, bache sur arceaux
// avec sangles, roues en tandem a l'arriere, reservoir, feux, barre anti-encastrement. col : 'green' (armee) ou 'white' (civil).
function vhCamion(x, z, dir, col, y) {
  vhDebut(x, y, z, dir, 11, 4)
  var C = 'minecraft:' + (col || 'green') + '_concrete'
  var T = col == 'white' ? 'minecraft:white_wool' : col == 'green' ? 'minecraft:green_terracotta' : 'minecraft:' + col + '_wool'
  var T2 = col == 'white' ? 'minecraft:light_gray_wool' : col == 'green' ? 'minecraft:brown_terracotta' : 'minecraft:gray_wool'
  // chassis, roues (avant u1, tandem u7-u8), reservoir et coffre a batterie, pare-chocs
  vF(0, 0, 0, 0, 0, 3, VHPC); vF(1, 0, 1, 10, 0, 2, VHPN)
  vhRoues(1); vhRoues(7); vhRoues(8)
  vF(3, 0, 0, 4, 0, 0, 'minecraft:iron_block'); vF(3, 0, 3, 4, 0, 3, VHN)
  vS2(10, 0, 0, VHPC); vS2(10, 0, 1, VHPC)
  // cabine u0-u2
  vF(0, 1, 0, 2, 3, 3, C)
  vS(0, 1, 0, VHPH); vS(0, 1, 3, VHPH); vS(0, 1, 1, 'minecraft:iron_block'); vS(0, 1, 2, 'minecraft:iron_block')
  vF(0, 2, 0, 0, 2, 3, 'minecraft:tinted_glass')
  vS2(1, 2, 0, 'minecraft:tinted_glass')
  vF(1, 1, 1, 2, 2, 2, 'minecraft:air'); vF(1, 1, 1, 1, 1, 2, VHN); vF(2, 1, 1, 2, 1, 2, 'minecraft:gray_wool')
  vF(0, 4, 0, 2, 4, 3, 'minecraft:' + (col == 'white' ? 'smooth_quartz' : 'smooth_stone') + '_slab[type=bottom]')
  vS(0, 3, 0, VHCL); vS(0, 3, 3, VHCL)
  vhRetros(0, 2)
  // marchepied sous les portieres
  vS(2, 0, -1, 'minecraft:iron_trapdoor[facing={D},half=top,open=false]'); vS(2, 0, 4, 'minecraft:iron_trapdoor[facing={G},half=top,open=false]')
  // plateau : plancher, ridelles basses en bois
  vF(3, 1, 0, 10, 1, 3, 'minecraft:spruce_planks')
  // bache u3-u10, y2-y5, sangles plus sombres tous les 3 blocs, toit bombe
  vF(3, 2, 0, 10, 4, 3, T); vF(3, 5, 1, 10, 5, 2, T)
  vF(3, 5, 0, 10, 5, 0, 'minecraft:' + (col == 'white' ? 'white' : col == 'green' ? 'green' : 'gray') + '_carpet')
  vF(3, 5, 3, 10, 5, 3, 'minecraft:' + (col == 'white' ? 'white' : col == 'green' ? 'green' : 'gray') + '_carpet')
  for (var u = 4; u <= 10; u += 3) { vS2(u, 2, 0, T2); vS2(u, 3, 0, T2); vS2(u, 4, 0, T2) }
  vF(4, 2, 1, 9, 4, 2, 'minecraft:air')
  // arriere : bache relevee sur la moitie haute, chargement visible, feux, ridelle
  vF(10, 2, 1, 10, 3, 2, 'minecraft:air')
  vS(9, 2, 1, 'minecraft:barrel[facing=up,open=false]'); vS(9, 2, 2, 'supplementaries:sack'); vS(8, 2, 1, 'minecraft:barrel[facing=up,open=false]'); vS(8, 3, 1, 'minecraft:barrel[facing=up,open=false]')
  vS(10, 1, 0, VHFR); vS(10, 1, 3, VHFR)
}

// ---------------- TRAMWAY (rame articulee 21 x 3, 7 de haut avec pantographe) ----------------
// Deux cabines a nez incline, deux caisses a grandes baies, soufflet noir, portes doubles, jupe sur bogies, climatiseurs
// et pantographe sur le toit, sieges et barres de maintien a l'interieur. Le fil de contact passe a y = 7.
function vhTram(x, z, dir, y) {
  vhDebut(x, y, z, dir, 21, 3)
  var BL = 'minecraft:white_concrete', AC = 'minecraft:light_blue_concrete', JU = 'minecraft:gray_concrete', VI = 'minecraft:tinted_glass'
  var PO = [5, 6, 14, 15]
  for (var u = 0; u <= 20; u++) {
    var bout = u == 0 || u == 20, souf = u == 10
    // jupe et bogies, plancher bas
    vS2(u, 0, 0, [2, 3, 7, 8, 12, 13, 17, 18].indexOf(u) >= 0 ? VHN : JU); vS(u, 0, 1, VHPN)
    if (souf) { vF(u, 1, 0, u, 4, 2, VHN); vF(u, 1, 1, u, 3, 1, 'minecraft:air'); continue }
    // bandeau bas colore, baies, bandeau de toit
    vS2(u, 1, 0, AC)
    var porte = PO.indexOf(u) >= 0
    vS2(u, 2, 0, porte ? 'minecraft:tinted_glass' : u % 3 == 1 ? BL : VI)
    vS2(u, 3, 0, porte ? 'minecraft:tinted_glass' : u % 3 == 1 ? BL : VI)
    if (porte) vS2(u, 1, 0, 'minecraft:tinted_glass')
    vF(u, 4, 0, u, 4, 2, BL)
    // interieur
    vS(u, 1, 1, 'minecraft:air'); vS(u, 2, 1, 'minecraft:air'); vS(u, 3, 1, 'minecraft:air')
    if (!bout && !porte) {
      if (u % 3 == 0) vS(u, 3, 1, 'minecraft:chain[axis=y]')
      else vS(u, 1, 1, 'minecraft:warped_stairs[facing={B},half=bottom,shape=straight]')
    }
  }
  // nez : phares, pare-brise noir, pupitre, toit incline, attelage
  ;[[0, 'F', -1], [20, 'B', 21]].forEach(n => {
    var u = n[0]
    vS(u, 1, 0, VHPH); vS(u, 1, 2, VHPH); vS(u, 1, 1, AC)
    vF(u, 2, 0, u, 3, 2, 'minecraft:black_stained_glass')
    vS(u, 4, 0, 'minecraft:smooth_quartz_stairs[facing={' + (n[1] == 'F' ? 'B' : 'F') + '},half=bottom,shape=straight]')
    vS(u, 4, 1, 'minecraft:smooth_quartz_stairs[facing={' + (n[1] == 'F' ? 'B' : 'F') + '},half=bottom,shape=straight]')
    vS(u, 4, 2, 'minecraft:smooth_quartz_stairs[facing={' + (n[1] == 'F' ? 'B' : 'F') + '},half=bottom,shape=straight]')
    var ui = n[1] == 'F' ? 1 : 19
    vS(ui, 1, 1, 'minecraft:black_concrete'); vS(ui, 2, 1, 'minecraft:air')
    vS(n[2], 0, 1, 'minecraft:polished_blackstone_slab[type=top]')
    vhRetros(u, 3)
  })
  // toit : climatiseurs a grille, pantographe sous le fil
  // carenage bas sur toute la largeur (equipements de toit), grilles par-dessus
  ;[[2, 4], [12, 13], [16, 18]].forEach(c => { vF(c[0], 5, 0, c[1], 5, 2, 'minecraft:smooth_stone_slab[type=bottom]'); vF(c[0], 5, 1, c[1], 5, 1, 'minecraft:light_gray_concrete'); vF(c[0], 6, 1, c[1], 6, 1, 'minecraft:iron_trapdoor[facing={F},half=bottom,open=false]') })
  vF(6, 5, 1, 8, 5, 1, 'minecraft:gray_concrete'); vS(7, 6, 1, 'minecraft:lightning_rod[facing=up,powered=false,waterlogged=false]')
}

// ---------------- CONTENEUR MARITIME (20 pieds : 10 x 4 x 5 ; 40 pieds : 20 x 4 x 5) ----------------
// Pose sur ses pieces de coin, longerons avec passages de fourche, parois ondulees (beton et laine de la meme couleur
// en alternance), portes au bout arriere avec poignees de verrouillage, taches de rouille. creux : interieur vide (habitat).
function vhConteneur(x, y, z, dir, col, long, creux, graine) {
  var L = long ? 20 : 10
  vhDebut(x, y, z, dir, L, 4)
  var C = 'minecraft:' + col + '_concrete', O = 'minecraft:' + col + '_wool', RO = ['minecraft:brown_terracotta', 'minecraft:orange_terracotta', 'minecraft:' + col + '_terracotta']
  var g = GRAINE; GRAINE = graine || (x * 31 + z * 17 + y)
  // longerons et pieces de coin (y0), passages de fourche
  vF(0, 0, 0, L - 1, 0, 3, 'minecraft:air')
  vF(0, 0, 0, L - 1, 0, 0, C); vF(0, 0, 3, L - 1, 0, 3, C); vF(0, 0, 0, 0, 0, 3, C); vF(L - 1, 0, 0, L - 1, 0, 3, C)
  ;[3, 4, L - 5, L - 4].forEach(u => { vS2(u, 0, 0, 'minecraft:air') })
  // parois ondulees
  for (var u = 0; u < L; u++) for (var yy = 1; yy <= 4; yy++) {
    var coin = u == 0 || u == L - 1
    var b = coin ? C : u % 2 ? O : C
    if (!coin && yy == 1 && R() < 0.18) b = RO[Math.floor(R() * 3)]
    vS2(u, yy, 0, b)
  }
  // toit (rails hauts) et bouts
  vF(0, 4, 0, L - 1, 4, 3, C)
  for (var u = 1; u < L - 1; u++) for (var v = 1; v <= 2; v++) if (R() < 0.2) vS(u, 4, v, RO[Math.floor(R() * 3)])
  vF(0, 1, 1, 0, 3, 2, O)
  vF(L - 1, 1, 0, L - 1, 3, 3, C)
  // portes : joint central, poignees de verrouillage (leviers) sur les deux battants
  vS(L - 1, 1, 1, O); vS(L - 1, 2, 1, O); vS(L - 1, 3, 1, O)
  ;[0, 1, 2, 3].forEach(v => vS(L, 2, v, 'minecraft:lever[face=wall,facing={B},powered=false]'))
  if (creux) vF(1, 1, 1, L - 2, 3, 2, 'minecraft:air')
  else vF(1, 1, 1, L - 2, 3, 2, C)
  GRAINE = g
}

// ---------------- AUTOBUS URBAIN (18 x 4, 5 de haut) ----------------
// Grand pare-brise, girouette eteinte (sans texte), portes doubles cote droit a l'avant et au milieu, baies a montants,
// bandeau de couleur, roues avant et arriere, climatiseur et trappes sur le toit, sieges et barres a l'interieur.
function vhBus(x, z, dir, col, y) {
  vhDebut(x, y, z, dir, 18, 4)
  var C = 'minecraft:' + (col || 'white') + '_concrete', BA = 'minecraft:' + (col == 'white' ? 'light_blue' : 'white') + '_concrete', VI = 'minecraft:tinted_glass'
  vF(0, 0, 0, 0, 0, 3, VHPC); vF(17, 0, 0, 17, 0, 3, VHPC); vF(1, 0, 1, 16, 0, 2, VHPN)
  for (var u = 1; u <= 16; u++) vS2(u, 0, 0, 'minecraft:smooth_stone_slab[type=top]')
  vhRoues(3); vhRoues(13)
  var portes = [1, 2, 8, 9]
  for (var u = 0; u <= 17; u++) {
    var bout = u == 0 || u == 17
    vS2(u, 1, 0, BA)
    vS2(u, 2, 0, bout ? C : u % 3 == 0 ? C : VI); vS2(u, 3, 0, bout ? C : u % 3 == 0 ? C : VI)
    vF(u, 4, 0, u, 4, 3, C)
    if (!bout) { vF(u, 1, 1, u, 3, 2, 'minecraft:air'); if (u % 2 == 0 && portes.indexOf(u) < 0 && u > 2) { vS(u, 1, 1, 'minecraft:warped_stairs[facing={B},half=bottom,shape=straight]'); vS(u, 1, 2, 'minecraft:warped_stairs[facing={B},half=bottom,shape=straight]') } }
  }
  portes.forEach(u => { vS(u, 1, 3, 'minecraft:tinted_glass'); vS(u, 2, 3, 'minecraft:tinted_glass'); vS(u, 3, 3, 'minecraft:tinted_glass') })
  ;[5, 11, 15].forEach(u => vS(u, 3, 1, 'minecraft:chain[axis=y]'))
  // face avant : pare-brise sur deux hauteurs, girouette noire, phares ; arriere : lunette, feux, capot moteur a grille
  vF(0, 2, 0, 0, 3, 3, 'minecraft:tinted_glass'); vF(0, 4, 0, 0, 4, 3, VHN)
  vS(0, 1, 0, VHPH); vS(0, 1, 3, VHPH); vS(0, 1, 1, C); vS(0, 1, 2, C)
  vS(1, 1, 1, VHN)
  vF(17, 3, 1, 17, 3, 2, 'minecraft:tinted_glass'); vS(17, 1, 0, VHFR); vS(17, 1, 3, VHFR)
  vS(18, 1, 1, 'minecraft:iron_trapdoor[facing={B},half=bottom,open=true]'); vS(18, 1, 2, 'minecraft:iron_trapdoor[facing={B},half=bottom,open=true]')
  vhRetros(0, 3)
  vF(10, 5, 0, 14, 5, 3, 'minecraft:light_gray_concrete'); vF(10, 6, 1, 14, 6, 2, 'minecraft:iron_trapdoor[facing={F},half=bottom,open=false]')
  vS(5, 5, 1, 'minecraft:iron_trapdoor[facing={F},half=bottom,open=false]'); vS(5, 5, 2, 'minecraft:iron_trapdoor[facing={F},half=bottom,open=false]')
}

// ---------------- MINIBUS / TAXI-BROUSSE ET FOURGON (9 x 3, 4 de haut + galerie) ----------------
// Capot court, pare-brise, vitres laterales (minibus) ou flancs pleins (fourgon), porte coulissante, galerie de toit chargee.
function vhMinibus(x, z, dir, col, vitre, charge, y) {
  vhDebut(x, y, z, dir, 9, 3)
  var C = 'minecraft:' + (col || 'white') + '_concrete'
  vF(0, 0, 0, 0, 0, 2, VHPC); vF(8, 0, 0, 8, 0, 2, VHPC); vF(1, 0, 1, 7, 0, 1, VHPN)
  for (var u = 2; u <= 7; u++) if (u != 6) vS2(u, 0, 0, 'minecraft:smooth_stone_slab[type=top]')
  vhRoues(1); vhRoues(6)
  vS(0, 1, 0, VHPH); vS(0, 1, 1, 'minecraft:light_gray_concrete'); vS(0, 1, 2, VHPH)
  vF(0, 2, 0, 0, 2, 2, 'minecraft:' + (col || 'white') + '_concrete')
  vF(1, 1, 0, 8, 3, 2, C); vF(1, 1, 1, 7, 2, 1, 'minecraft:air')
  vF(1, 2, 0, 1, 2, 2, 'minecraft:tinted_glass')
  for (var u = 2; u <= 7; u++) if (vitre || u == 2) vS2(u, 2, 0, 'minecraft:tinted_glass')
  vS(8, 2, 0, 'minecraft:tinted_glass'); vS(8, 2, 2, 'minecraft:tinted_glass')
  vS(8, 1, 0, VHFR); vS(8, 1, 2, VHFR)
  if (vitre) for (var u = 3; u <= 7; u += 2) vS(u, 1, 1, 'minecraft:warped_stairs[facing={B},half=bottom,shape=straight]')
  vS(2, 1, 1, 'minecraft:gray_wool'); vS(1, 1, 1, VHN)
  vS(4, 1, 2, 'minecraft:light_gray_concrete')
  vhRetros(1, 2)
  // galerie de toit
  vF(2, 4, 0, 7, 4, 2, 'minecraft:iron_trapdoor[facing={F},half=bottom,open=false]')
  if (charge) { vS(3, 4, 1, 'minecraft:barrel[facing=up,open=false]'); vS(5, 4, 0, 'supplementaries:sack'); vS(6, 4, 2, 'supplementaries:sack'); vS(4, 4, 2, 'minecraft:brown_wool') }
}

// ---------------- BANC D'ESSAI : boulevard avec tram sous catenaire, ambulance, camions, conteneurs ----------------
function vhBanc() {
  OX = VB.X0; OY = VB.Y0; OZ = VB.Z0; CUT = 999; GRAINE = 5301
  // chaussee et voies du tram
  for (var x = -8; x <= 111; x++) for (var z = 0; z <= 47; z++) {
    var r = R(), b
    if (z <= 1 || z >= 46) b = 'minecraft:smooth_stone'
    else if (z >= 6 && z <= 10) b = z == 7 || z == 9 ? 'minecraft:gray_concrete' : 'minecraft:moss_block'
    else b = r < 0.8 ? 'minecraft:black_concrete' : r < 0.95 ? 'minecraft:gray_concrete' : 'minecraft:gray_concrete_powder'
    S(x, -1, z, b)
  }
  // catenaire : poteaux tous les 16 blocs, fil de contact a y7 au-dessus de l'axe de la voie (z8)
  for (var x = -8; x <= 103; x += 16) { F(x, 0, 5, x, 8, 5, 'minecraft:iron_bars'); S(x, 8, 6, 'minecraft:chain[axis=z]'); S(x, 8, 7, 'minecraft:chain[axis=z]'); S(x, 8, 8, 'minecraft:chain[axis=z]') }
  F(-8, 7, 8, 103, 7, 8, 'minecraft:chain[axis=x]')
  vhTram(20, 7, 'x')
  // ambulance et camions sur la chaussee
  vhAmbulance(6, 16, 'x'); vhAmbulance(30, 21, 'xr')
  vhCamion(48, 16, 'x', 'green'); vhCamion(70, 21, 'xr', 'white')
  vhBus(84, 15, 'x', 'white'); vhMinibus(86, 21, 'xr', 'white', true, true); vhMinibus(96, 21, 'xr', 'light_gray', false, false)
  // parc a conteneurs : 20 et 40 pieds, pile de trois
  vhConteneur(4, 0, 30, 'x', 'red', false, false, 11); vhConteneur(18, 0, 30, 'x', 'blue', true, false, 12)
  vhConteneur(44, 0, 30, 'x', 'orange', false, false, 13); vhConteneur(44, 5, 30, 'x', 'light_blue', false, false, 14); vhConteneur(46, 10, 30, 'x', 'green', false, false, 15)
  vhConteneur(60, 0, 36, 'z', 'white', false, true, 16); vhConteneur(70, 0, 30, 'x', 'gray', true, false, 17)
}
var QFIN_VH = function () { HM = {}; lot(vhBanc, 0, 0, 999, 5301, 104, 20) }
function vuesVH() {
  vue('vh_ensemble', 0, 0, 50, 22, -18, 50, 2, 24, 3000)
  vue('vh_tram_avant', 0, 0, 48, 3, 2, 36, 3, 8)
  vue('vh_tram_flanc', 0, 0, 30, 4, -6, 30, 3, 8)
  vue('vh_tram_toit', 0, 0, 34, 12, 1, 30, 6, 8)
  vue('vh_tram_dedans', 0, 0, 33.5, 2.6, 8, 25, 2, 8)
  vue('vh_ambulance_avant', 0, 0, 19, 3, 12, 11, 2, 17)
  vue('vh_ambulance_arriere', 0, 0, 45, 3, 27, 36, 2, 22)
  vue('vh_camion_avant', 0, 0, 64, 3, 11, 55, 2, 18)
  vue('vh_camion_arriere', 0, 0, 88, 4, 28, 78, 3, 22)
  vue('vh_bus_avant', 0, 0, 108, 3, 11, 98, 2, 17)
  vue('vh_bus_flanc', 0, 0, 92, 4, 26, 92, 2, 16)
  vue('vh_minibus', 0, 0, 82, 3, 27, 90, 2, 22)
  vue('vh_conteneurs', 0, 0, 14, 4, 24, 20, 2, 32)
  vue('vh_conteneurs_pile', 0, 0, 38, 8, 22, 48, 7, 32)
  vue('vh_conteneur_portes', 0, 0, -4, 3, 27, 5, 2, 32)
}
