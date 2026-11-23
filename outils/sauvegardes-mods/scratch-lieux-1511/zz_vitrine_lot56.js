// ================= VEHICULES MAQUETTES v3 (lot56, 11/11) : blocs moddes, echelle 2 environ =================
// Retour de Mika : encore trop simplifie, il faut reconnaitre chaque vehicule au premier coup d'oeil. Taille libre, blocs moddes permis.
// Conteneurs : vrais conteneurs texturés de Create Deco (multibloc 3 x 3, portes et barres de verrouillage dessinees).
// Ferroviaire : bogies, voie, portes de train et vitrages de Create. Routier : roues arrondies 2 x 2, carrosseries a decrochements.
// Meme repere que le lot53 (vhDebut, vS, vF, vS2).

var VH_CONT_COUL = ['red', 'blue', 'green', 'orange', 'white', 'light_gray', 'gray', 'brown', 'yellow', 'cyan', 'light_blue', 'black']
// conteneur Create Deco : 3 x 3, 6 (20 pieds) ou 9 (40 pieds) de long ; axe 'x' ou 'z'
function vhConteneurCD(x, y, z, axe, col, long) {
  var L = long ? 9 : 6, b = 'createdeco:' + col + '_shipping_container[axis=' + axe + ',large=false]'
  if (axe == 'x') F(x, y, z, x + L - 1, y + 2, z + 2, b); else F(x, y, z, x + 2, y + 2, z + L - 1, b)
}

// roue arrondie 2 x 2 (vue de cote) a u..u+1, y0..y1, sur le flanc v ; moyeu = bouton sur la face exterieure
function vhRoue2(u, v) {
  var P = 'minecraft:polished_blackstone_stairs'
  vS(u, 1, v, P + '[facing={B},half=bottom,shape=straight]'); vS(u + 1, 1, v, P + '[facing={F},half=bottom,shape=straight]')
  vS(u, 0, v, P + '[facing={B},half=top,shape=straight]'); vS(u + 1, 0, v, P + '[facing={F},half=top,shape=straight]')
  var ext = v == 0 ? -1 : VH.W, f = v == 0 ? '{G}' : '{D}'
  vS(u, 0, ext, 'minecraft:stone_button[face=wall,facing=' + f + ']'); vS(u + 1, 1, ext, 'minecraft:stone_button[face=wall,facing=' + f + ']')
}
function vhEssieu(u) { vhRoue2(u, 0); vhRoue2(u, VH.W - 1); for (var v = 1; v < VH.W - 1; v++) { vS(u, 0, v, 'minecraft:air'); vS(u + 1, 0, v, 'minecraft:air'); vS(u, 1, v, VHPN); vS(u + 1, 1, v, VHPN) } }

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

// ---------------- AUTOBUS v3 (26 x 5, 8 de haut) ----------------
function vhBus3(x, z, dir, col, y) {
  vhDebut(x, y, z, dir, 26, 5)
  var C = 'minecraft:' + (col || 'white') + '_concrete', BA = 'minecraft:' + (col == 'white' ? 'light_blue' : 'white') + '_concrete', V = 'minecraft:tinted_glass', T = 'createdeco:iron_sheet_metal[axis=y]'
  vF(0, 1, 0, 25, 1, 4, VHPN)
  vhEssieu(4); vhEssieu(19)
  var portes = [2, 3, 12, 13]
  for (var u = 0; u <= 25; u++) {
    var bout = u == 0 || u == 25
    vS2(u, 2, 0, BA)
    for (var yy = 3; yy <= 5; yy++) vS2(u, yy, 0, bout ? C : u % 4 == 1 ? C : V)
    vF(u, 6, 0, u, 6, 4, C)
    if (!bout) vF(u, 2, 1, u, 5, 3, 'minecraft:air')
  }
  for (var u = 1; u <= 24; u++) if (u != 4 && u != 5 && u != 19 && u != 20) vS2(u, 1, 0, 'minecraft:smooth_stone_slab[type=top]')
  // portes doubles vitrees cote droit, marche
  portes.forEach(u => { for (var yy = 2; yy <= 5; yy++) vS(u, yy, 4, yy == 2 ? 'minecraft:gray_concrete' : 'minecraft:gray_stained_glass') })
  // sieges par paires face a l'avant, barres de maintien, plancher
  for (var u = 5; u <= 24; u += 2) if (portes.indexOf(u) < 0 && portes.indexOf(u - 1) < 0) { vS(u, 2, 1, 'minecraft:warped_stairs[facing={B},half=bottom,shape=straight]'); vS(u, 2, 3, 'minecraft:warped_stairs[facing={B},half=bottom,shape=straight]') }
  ;[7, 11, 16, 22].forEach(u => vF(u, 3, 2, u, 5, 2, 'minecraft:chain[axis=y]'))
  // face avant : grand pare-brise sur deux hauteurs, girouette sombre (sans texte), phares, pare-chocs
  vF(0, 3, 0, 0, 5, 4, V); vS(0, 3, 0, C); vS(0, 3, 4, C)
  vF(0, 6, 0, 0, 6, 4, VHN)
  vS(0, 2, 0, VHPH); vS(0, 2, 4, VHPH); vS(0, 2, 1, VHCL); vS(0, 2, 3, VHCL)
  vF(-1, 1, 0, -1, 1, 4, VHPC)
  vS(1, 2, 1, VHN); vS(1, 3, 1, 'minecraft:black_concrete')
  vhRetros(0, 5)
  // arriere : lunette, feux, capot moteur a grille, pare-chocs
  vF(25, 4, 1, 25, 5, 3, V); vS(25, 2, 0, VHFR); vS(25, 2, 4, VHFR); vS(25, 3, 0, VHCL); vS(25, 3, 4, VHCL)
  vF(26, 2, 1, 26, 3, 3, 'minecraft:iron_trapdoor[facing={B},half=bottom,open=true]'); vF(26, 1, 0, 26, 1, 4, VHPC)
  // toit : carenage de climatisation, trappes
  vF(14, 7, 1, 22, 7, 3, T); vF(15, 8, 2, 21, 8, 2, 'minecraft:iron_trapdoor[facing={F},half=bottom,open=false]')
  vS(7, 7, 2, 'minecraft:iron_trapdoor[facing={F},half=bottom,open=false]')
}

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

// ---------------- TRAMWAY v3 (rame de 3 caisses, 34 x 4, sur voie Create, bogies) ----------------
// La voie est a y = -1 (dans la chaussee), les bogies a y = 0, le plancher a y = 1.
function vhTram3(x, z, dir, y) {
  vhDebut(x, y, z, dir, 34, 4)
  var B = 'minecraft:white_concrete', AC = 'minecraft:light_blue_concrete', V = 'minecraft:tinted_glass', T = 'createdeco:iron_sheet_metal[axis=y]'
  for (var u = -3; u <= 36; u++) { vS(u, -1, 1, 'create:track[shape=' + (VH.o.AU == 'x' ? 'xo' : 'zo') + ',turn=false,waterlogged=false]') }
  ;[3, 16, 30].forEach(u => vS(u, 0, 1, 'create:small_bogey[axis=' + VH.o.AU + ',waterlogged=false]'))
  var souf = [11, 22], portes = [5, 6, 15, 16, 26, 27]
  for (var u = 0; u <= 33; u++) {
    if (souf.indexOf(u) >= 0) { vF(u, 1, 0, u, 5, 3, 'minecraft:black_wool'); vF(u, 2, 1, u, 4, 2, 'minecraft:air'); continue }
    var bout = u == 0 || u == 33, p = portes.indexOf(u) >= 0
    vS2(u, 1, 0, 'minecraft:gray_concrete'); vF(u, 1, 1, u, 1, 2, 'minecraft:gray_concrete')
    vS2(u, 2, 0, p ? 'create:train_door[facing={G},half=lower,hinge=left,open=false,visible=true]' : AC)
    vS2(u, 3, 0, p ? 'create:train_door[facing={G},half=upper,hinge=left,open=false,visible=true]' : u % 4 == 1 ? B : V)
    vS2(u, 4, 0, u % 4 == 1 && !p ? B : V)
    vF(u, 5, 0, u, 5, 3, B)
    vF(u, 2, 1, u, 4, 2, 'minecraft:air')
    if (!p && !bout && u % 2 == 0) { vS(u, 2, 1, 'minecraft:warped_stairs[facing={B},half=bottom,shape=straight]'); vS(u, 2, 2, 'minecraft:warped_stairs[facing={B},half=bottom,shape=straight]') }
  }
  // flanc droit : portes du meme cote que le quai (facing D)
  portes.forEach(u => { vS(u, 2, 3, 'create:train_door[facing={D},half=lower,hinge=left,open=false,visible=true]'); vS(u, 3, 3, 'create:train_door[facing={D},half=upper,hinge=left,open=false,visible=true]') })
  // nez : pare-brise bombe, phares, toit incline, pupitre
  ;[[0, 'B', -1, 1], [33, 'F', 34, 32]].forEach(n => {
    var u = n[0]
    vF(u, 1, 0, u, 1, 3, 'minecraft:gray_concrete'); vS(u, 2, 0, VHPH); vS(u, 2, 3, VHPH); vS(u, 2, 1, AC); vS(u, 2, 2, AC)
    vF(u, 3, 0, u, 4, 3, 'minecraft:black_stained_glass')
    vF(u, 5, 0, u, 5, 3, 'minecraft:smooth_quartz_stairs[facing={' + n[1] + '},half=bottom,shape=straight]')
    vF(n[2], 1, 1, n[2], 1, 2, 'minecraft:polished_blackstone_slab[type=top]')
    vS(n[3], 2, 1, 'minecraft:black_concrete'); vS(n[3], 3, 1, 'minecraft:air')
    vhRetros(u, 4)
  })
  // toit : carenages, climatiseurs, pantographe et fil de contact a y8
  ;[[2, 8], [13, 20], [24, 31]].forEach(c => { vF(c[0], 6, 1, c[1], 6, 2, T) })
  ;[[4, 6], [26, 28]].forEach(c => vF(c[0], 7, 1, c[1], 7, 2, 'minecraft:iron_trapdoor[facing={F},half=bottom,open=false]'))
  vF(16, 7, 1, 18, 7, 2, 'create:andesite_casing'); vS(17, 8, 1, 'minecraft:lightning_rod[facing=up,powered=false,waterlogged=false]'); vS(17, 8, 2, 'minecraft:lightning_rod[facing=up,powered=false,waterlogged=false]')
}

// ---------------- METRO v3 (voiture 22 x 4, sur voie, bogies) ----------------
function vhMetro3(x, z, dir, y) {
  vhDebut(x, y, z, dir, 22, 4)
  var I = 'minecraft:light_gray_concrete', BD = 'minecraft:blue_concrete', V = 'minecraft:tinted_glass'
  for (var u = -2; u <= 23; u++) vS(u, -1, 1, 'create:track[shape=' + (VH.o.AU == 'x' ? 'xo' : 'zo') + ',turn=false,waterlogged=false]')
  ;[3, 18].forEach(u => vS(u, 0, 1, 'create:small_bogey[axis=' + VH.o.AU + ',waterlogged=false]'))
  var portes = [3, 4, 10, 11, 17, 18]
  for (var u = 0; u <= 21; u++) {
    var p = portes.indexOf(u) >= 0, bout = u == 0 || u == 21
    vF(u, 1, 0, u, 1, 3, 'create:railway_casing')
    vS2(u, 2, 0, p ? 'create:train_door[facing={G},half=lower,hinge=left,open=false,visible=true]' : BD)
    vS2(u, 3, 0, p ? 'create:train_door[facing={G},half=upper,hinge=left,open=false,visible=true]' : bout || u % 3 == 0 ? I : V)
    vS2(u, 4, 0, I); vF(u, 5, 0, u, 5, 3, 'createdeco:iron_sheet_metal[axis=y]')
    vF(u, 2, 1, u, 4, 2, 'minecraft:air')
    if (!p && !bout && u % 3) vS(u, 2, 1, 'minecraft:blue_terracotta')
  }
  portes.forEach(u => { vS(u, 2, 3, 'create:train_door[facing={D},half=lower,hinge=left,open=false,visible=true]'); vS(u, 3, 3, 'create:train_door[facing={D},half=upper,hinge=left,open=false,visible=true]') })
  ;[0, 21].forEach(u => { vF(u, 2, 0, u, 4, 3, I); vS(u, 3, 0, 'minecraft:black_stained_glass'); vS(u, 3, 3, 'minecraft:black_stained_glass'); vS(u, 2, 0, VHPH); vS(u, 2, 3, VHPH); vS(u, 2, 1, 'create:train_door[facing=' + (u == 0 ? '{F}' : '{B}') + ',half=lower,hinge=left,open=false,visible=true]'); vS(u, 3, 1, 'create:train_door[facing=' + (u == 0 ? '{F}' : '{B}') + ',half=upper,hinge=left,open=false,visible=true]') })
  ;[7, 14].forEach(u => vS(u, 4, 1, 'minecraft:chain[axis=y]'))
}

// ---------------- VOITURE VOYAGEURS v3 (24 x 4) et WAGON-CITERNE (16 x 4), sur voie ----------------
function vhVoyageurs3(x, z, dir, col, y) {
  vhDebut(x, y, z, dir, 24, 4)
  var C = 'minecraft:' + (col || 'green') + '_concrete', V = 'minecraft:tinted_glass'
  for (var u = -2; u <= 25; u++) vS(u, -1, 1, 'create:track[shape=' + (VH.o.AU == 'x' ? 'xo' : 'zo') + ',turn=false,waterlogged=false]')
  ;[3, 20].forEach(u => vS(u, 0, 1, 'create:large_bogey[axis=' + VH.o.AU + ',waterlogged=false]'))
  for (var u = 0; u <= 23; u++) {
    vF(u, 1, 0, u, 1, 3, 'create:railway_casing')
    var porte = u == 1 || u == 22
    vS2(u, 2, 0, C); vS2(u, 3, 0, porte ? C : u % 3 == 0 ? C : V); vS2(u, 4, 0, C)
    vF(u, 5, 0, u, 5, 3, 'createdeco:iron_sheet_metal[axis=y]'); vF(u, 6, 1, u, 6, 2, 'minecraft:smooth_stone_slab[type=bottom]')
    vF(u, 2, 1, u, 4, 2, 'minecraft:air')
    if (!porte && u > 1 && u < 22 && u % 3) { vS(u, 2, 1, 'minecraft:red_terracotta'); vS(u, 2, 2, 'minecraft:red_terracotta') }
  }
  ;[1, 22].forEach(u => { vS(u, 2, 0, 'create:train_door[facing={G},half=lower,hinge=left,open=false,visible=true]'); vS(u, 3, 0, 'create:train_door[facing={G},half=upper,hinge=left,open=false,visible=true]'); vS(u, 2, 3, 'create:train_door[facing={D},half=lower,hinge=left,open=false,visible=true]'); vS(u, 3, 3, 'create:train_door[facing={D},half=upper,hinge=left,open=false,visible=true]') })
  ;[0, 23].forEach(u => { vF(u, 2, 0, u, 4, 3, C); vF(u, 2, 1, u, 3, 2, 'minecraft:black_wool') })
  ;[-1, 24].forEach(u => { vS(u, 1, 0, 'minecraft:polished_blackstone_button[face=wall,facing={' + (u < 0 ? 'F' : 'B') + '}]'); vS(u, 1, 3, 'minecraft:polished_blackstone_button[face=wall,facing={' + (u < 0 ? 'F' : 'B') + '}]'); vS(u, 1, 1, 'minecraft:chain[axis={AU}]') })
}
function vhCiterne3(x, z, dir, y) {
  vhDebut(x, y, z, dir, 16, 4)
  for (var u = -2; u <= 17; u++) vS(u, -1, 1, 'create:track[shape=' + (VH.o.AU == 'x' ? 'xo' : 'zo') + ',turn=false,waterlogged=false]')
  ;[2, 13].forEach(u => vS(u, 0, 1, 'create:small_bogey[axis=' + VH.o.AU + ',waterlogged=false]'))
  vF(0, 1, 0, 15, 1, 3, 'create:railway_casing')
  vF(1, 2, 0, 14, 4, 3, 'createdeco:industrial_iron_hull[facing={F}]')
  vF(1, 2, 0, 14, 2, 0, 'minecraft:polished_blackstone_stairs[facing={D},half=top,shape=straight]'); vF(1, 2, 3, 14, 2, 3, 'minecraft:polished_blackstone_stairs[facing={G},half=top,shape=straight]')
  vF(1, 4, 0, 14, 4, 0, 'minecraft:polished_blackstone_stairs[facing={D},half=bottom,shape=straight]'); vF(1, 4, 3, 14, 4, 3, 'minecraft:polished_blackstone_stairs[facing={G},half=bottom,shape=straight]')
  vF(7, 5, 1, 8, 5, 2, 'create:fluid_valve'.replace('create:fluid_valve', 'minecraft:iron_block')); vF(6, 5, 0, 9, 5, 0, 'createdeco:iron_catwalk_railing'.replace('createdeco:iron_catwalk_railing', 'minecraft:iron_bars'))
  vS(7, 2, -1, 'minecraft:ladder[facing={G}]'); vS(7, 3, -1, 'minecraft:ladder[facing={G}]'); vS(7, 4, -1, 'minecraft:ladder[facing={G}]')
}

// ---------------- BANC v3 ----------------
function vhBanc3() {
  OX = VB.X0; OY = VB.Y0; OZ = VB.Z0; CUT = 999; GRAINE = 5601
  for (var x = -8; x <= 120; x++) for (var z = 0; z <= 63; z++) { var r = R(); S(x, -1, z, (z >= 3 && z <= 6) || (z >= 21 && z <= 24) ? 'minecraft:gravel' : r < 0.85 ? 'minecraft:black_concrete' : 'minecraft:gray_concrete') }
  for (var x = -8; x <= 120; x += 16) { F(x, 0, 2, x, 9, 2, 'minecraft:iron_bars'); F(x, 9, 2, x, 9, 6, 'minecraft:chain[axis=z]') }
  F(-8, 8, 4, 120, 8, 4, 'minecraft:chain[axis=x]')
  vhTram3(10, 3, 'x'); vhMetro3(60, 3, 'x')
  vhVoyageurs3(10, 21, 'x', 'green'); vhCiterne3(40, 21, 'x'); vhMetro3(64, 21, 'x')
  vhAmbulance3(4, 32, 'x'); vhBus3(26, 32, 'x', 'white'); vhCamion3(60, 32, 'x', 'green'); vhCamion3(86, 32, 'x', 'white')
  // parc a conteneurs Create Deco : alignes, piles, axe croise
  vhConteneurCD(4, 0, 46, 'x', 'red', true); vhConteneurCD(4, 3, 46, 'x', 'blue', true); vhConteneurCD(4, 0, 50, 'x', 'green', true)
  vhConteneurCD(16, 0, 46, 'x', 'orange', false); vhConteneurCD(16, 3, 46, 'x', 'white', false); vhConteneurCD(16, 6, 46, 'x', 'gray', false)
  vhConteneurCD(26, 0, 46, 'z', 'brown', true); vhConteneurCD(30, 0, 46, 'z', 'light_blue', false); vhConteneurCD(30, 3, 46, 'z', 'yellow', false)
}
var QFIN_VH4 = function () { HM = {}; lot(vhBanc3, 0, 0, 999, 5601, 120, 20) }
function vuesVH4() {
  vue('v3_tram', 0, 0, 52, 4, -6, 40, 3, 4)
  vue('v3_tram_flanc', 0, 0, 25, 5, -10, 25, 3, 4)
  vue('v3_metro', 0, 0, 90, 3, 0, 78, 3, 4)
  vue('v3_train', 0, 0, 30, 4, 14, 22, 3, 22)
  vue('v3_citerne_metro', 0, 0, 62, 4, 14, 52, 2, 22)
  vue('v3_ambulance', 0, 0, 24, 4, 28, 14, 3, 34)
  vue('v3_ambulance_arriere', 0, 0, -6, 5, 41, 4, 3, 34)
  vue('v3_bus', 0, 0, 56, 4, 28, 44, 3, 34)
  vue('v3_bus_flanc', 0, 0, 38, 5, 44, 38, 3, 34)
  vue('v3_camion', 0, 0, 86, 5, 27, 74, 3, 34)
  vue('v3_camion_arriere', 0, 0, 82, 6, 44, 92, 3, 34)
  vue('v3_conteneurs', 0, 0, 20, 6, 60, 14, 3, 48)
  vue('v3_conteneurs_bout', 0, 0, -6, 5, 54, 4, 3, 48)
}
