
// ================= HAUSSMANNIEN V2 : chaque batiment v1 rejoue avec la palette moddee, puis enrichi =================
function hb2Auvent(x1, x2, y, z, f, c1, c2) { for (var x = x1; x <= x2; x++) if (libreH(x, y, z) || /_wool$/.test(HG(x, y, z))) S(x, y, z, 'supplementaries:awning_' + ((x - x1) % 2 ? c2 : c1) + '[slanted=true,facing=' + f + ',bottom=true]') }
var HORL = f => 'supplementaries:clock_block[facing=' + f + ',two_faced=false]'

// ---- boulevard ----
function hb2Rue() {
  HM = {}; hbRue()
  // barricade renforcee : barbeles en rouleaux, conteneurs couches en travers de la chaussee
  for (var z = 41; z <= 44; z++) S(118, 0, z, 'simply_traps:circular_barbed_wire_iron[facing=east]')
  for (var z = 35; z <= 38; z++) if (z != 36) S(118, 0, z, 'simply_traps:circular_barbed_wire_iron[facing=east]')
  F(123, 0, 42, 126, 1, 43, 'createdeco:red_shipping_container[axis=x,large=false]'); F(124, 2, 42, 126, 2, 42, 'createdeco:red_shipping_container[axis=x,large=false]')
  F(124, 0, 44, 125, 0, 44, 'createdeco:gray_shipping_container[axis=x,large=false]')
  // abribus : tableau d'affichage, kiosque : piles de journaux
  S(97, 1, 32, 'supplementaries:notice_board[facing=south,has_book=false]'); SA(20, 2, 45, 'supplementaries:book_pile_horizontal')
  // panneau de danger sur le conteneur
  S(122, 1, 42, 'createdeco:yellow_placard[face=wall,facing=west,powered=false,waterlogged=false]')
}

// ---- grand magasin ----
function hb2GrandMagasin() {
  HM = {}; hbGrandMagasin()
  hb2Pierre('x', 1, 30, 7, 29, 29, 1, 0.3); hb2Pierre('x', 1, 30, 7, 29, 2, -1, 0.12)
  hb2Pierre('z', 3, 28, 7, 29, 1, -1, 0.12); hb2Pierre('z', 3, 28, 7, 29, 30, 1, 0.12)
  // auvents des vitrines, horloge sur la porte, lustre dore sous la coupole
  hb2Auvent(2, 8, 5, 30, 'south', 'green', 'white'); hb2Auvent(23, 25, 5, 30, 'south', 'red', 'white')
  S(15, 5, 29, HORL('south')); S(16, 5, 29, HORL('south'))
  S(15, 21, 15, 'mcwlights:golden_chandelier')
  // salon de the : vitrine de patisseries et bouteilles
  for (var x = 12; x <= 19; x++) SA(x, 26, 6, choix(GATEAUX.concat(BOUT)))
  for (var x = 10; x <= 21; x++) if (x != 15 && x != 16) SA(x, 26, 3, choix(BOUT.concat(['supplementaries:jar', 'minecraft:air'])))
  // vitrine barricadee : barbeles sur le trottoir
  for (var x = 26; x <= 30; x++) S(x, 0, 30, 'simply_traps:circular_barbed_wire_iron[facing=south]')
}

// ---- immeubles de rapport ----
function hb2Immeubles() {
  HM = {}; hbImmeubles()
  hb2Pierre('x', 1, 30, 7, 35, 29, 1, 0.35)
  hb2Appuis('x', 1, 30, 7, 35, 12, -1, 'minecraft:smooth_stone_slab[type=top]', 'minecraft:smooth_stone_slab[type=top]', 0.2)
  // stores bannes : cafe (raye rouge, un pan arrache), boulangerie, pharmacie
  hb2Auvent(0, 9, 5, 30, 'south', 'red', 'white'); S(3, 5, 30, AIR)
  hb2Auvent(17, 22, 5, 30, 'south', 'brown', 'white'); hb2Auvent(24, 30, 5, 30, 'south', 'green', 'white')
  // cafe : bouteilles au comptoir, tasses en terrasse
  for (var x = 2; x <= 7; x++) SA(x, 2, 24, choix(BOUT))
  ;[[2, 31], [6, 31]].forEach(t => SA(t[0], 1, t[1], choix(BOUT.concat(ASSIET))))
  ;[[2, 27], [6, 27]].forEach(t => S(t[0], 2, t[1], choix(ASSIET)))
  // boulangerie : gateaux et tartes en vitrine, pains en reserve
  for (var x = 17; x <= 21; x++) S(x, 2, 25, choix(GATEAUX))
  for (var x = 17; x <= 21; x++) SA(x, 2, 23, choix(['createfood:bread_pudding_block', 'supplementaries:sack', 'minecraft:air']))
  // atelier de la cour : etabli Create
  S(26, 1, 5, 'create:depot'); S(27, 1, 5, 'create:andesite_casing'); S(27, 2, 5, 'create:hand_crank[facing=up,waterlogged=false]'); S(28, 1, 5, 'create:millstone')
}

// ---- gare ----
function hb2Gare() {
  HM = {}; hbGare()
  var TR = 'create:track[shape=xo,turn=false,waterlogged=false]', BOG = 'create:small_bogey[axis=x,waterlogged=false]'
  // trains valides le 13/11 (lot63) a la place de l'ancienne rame en blocs : on vide les voies B et C au-dessus du ballast
  F(0, 0, 8, 31, 6, 12, AIR); F(0, 0, 17, 31, 6, 19, AIR)
  ;[2, 10, 18].forEach(zr => F(0, 0, zr, 31, 0, zr, TR))
  VH_NUE = true
  vhVoyageurs4(1, 9, 'x', 'green', 1)                                   // voie B : voiture voyageurs restee a quai
  vhWagonCouvert4(1, 17, 'x', 'brown', 1); vhCiterne5(17, 17, 'x', 1)   // voie C : wagon couvert et citerne
  VH_NUE = false
  // heurtoir de la voie C (efface par le vidage)
  S(0, 0, 18, 'minecraft:red_concrete'); S(0, 0, 17, 'minecraft:polished_blackstone_wall'); S(0, 0, 19, 'minecraft:polished_blackstone_wall'); S(0, 1, 18, 'minecraft:polished_blackstone_slab[type=bottom]')
  // horloge du pavillon, tableau des departs
  S(15, 17, 29, HORL('south')); S(16, 17, 29, HORL('south')); F(15, 16, 29, 16, 16, 29, 'chipped:engraved_sandstone'); F(15, 18, 29, 16, 18, 29, 'chipped:engraved_sandstone')
  for (var x = 13; x <= 18; x++) for (var y = 7; y <= 10; y++) S(x, y, 23, 'create:display_board[down=false,facing=south,up=false,waterlogged=false]')
  // passerelle metallique au-dessus des voies (quai P1 -> quai P3)
  var CW = 'createdeco:iron_catwalk', CS = 'createdeco:iron_catwalk_stairs[facing=east]'
  F(24, 7, 5, 25, 7, 21, CW)
  for (var i = 0; i < 6; i++) { F(18 + i, 1 + i, 6, 18 + i, 1 + i, 7, CS); F(23 - i, 6 - i, 20, 23 - i, 6 - i, 21, CS) }
  for (var z = 5; z <= 21; z++) { S(26, 8, z, HF); if (z >= 8 && z <= 19) S(23, 8, z, HF) }
  F(24, 8, 4, 25, 8, 4, HF)
  ;[24, 25].forEach(x => F(x, 1, 14, x, 6, 14, 'minecraft:polished_deepslate_wall'))
  S(25, 6, 12, 'supplementaries:clock_block[facing=west,two_faced=true]')
}

// ---- opera ----
function hb2Theatre() {
  HM = {}; hbTheatre()
  S(8, 12, 24, 'mcwlights:golden_chandelier'); S(23, 12, 24, 'mcwlights:golden_chandelier')
  F(15, 14, 15, 15, 17, 15, 'minecraft:chain[axis=y]'); S(15, 13, 15, 'mcwlights:golden_chandelier')
}

// ---- halles : auvents en avancee des etals, victuailles ----
function hb2Halles() {
  HM = {}; hbHalles()
  function etal2(x, z, w, t) {
    for (var i = 0; i < w; i++) { var m = HG(x + i, 4, z).match(/minecraft:(\w+)_wool/); if (m) S(x + i, 4, z - 1, 'supplementaries:awning_' + m[1] + '[slanted=true,facing=north,bottom=true]') }
    for (var i = 1; i < w - 1; i++) {
      if (t == 1) SA(x + i, 2, z, choix(['farmersdelight:honey_glazed_ham_block', 'farmersdelight:roast_chicken_block', 'farmersdelight:shepherds_pie_block']))
      if (t == 2) SA(x + i, 2, z, choix(['farmersdelight:tomato_crate', 'farmersdelight:beetroot_crate', 'farmersdelight:rice_bag', 'farmersdelight:cabbage_crate']))
    }
  }
  var t = 0
  ;[5, 11, 17, 23].forEach(z => { etal2(4, z, 4, t % 4); etal2(24, z, 4, (t + 1) % 4); etal2(12, z, 3, (t + 2) % 4); etal2(17, z, 3, (t + 3) % 4); t++ })
  ;[2, 29].forEach(z => { S(15, 15, z, HORL(z == 2 ? 'north' : 'south')); S(16, 15, z, HORL(z == 2 ? 'north' : 'south')) })
}

// ---- cite HBM ----
function hb2HBM() {
  HM = {}; hbHBM()
  hb2Brique('x', 2, 29, 7, 41, 2, -1, 0.3); hb2Brique('x', 2, 29, 7, 41, 10, 1, 0.25)
  hb2Brique('z', 3, 9, 7, 41, 1, -1, 0); hb2Brique('z', 3, 9, 7, 41, 30, 1, 0)
  hb2Auvent(2, 8, 4, 1, 'north', 'green', 'white'); S(5, 4, 1, AIR)
}

// ---- square ----
function hb2Square() {
  HM = {}; hbSquare()
  ;[[9, 12], [22, 12], [9, 19], [22, 19]].forEach(p => { S(p[0], 0, p[1], 'supplementaries:planter[extended=false]'); S(p[0], 1, p[1], 'minecraft:flowering_azalea') })
  S(13, 0, 3, 'supplementaries:urn'); S(18, 0, 3, 'supplementaries:urn')
}

// ---- banque ----
function hb2Banque() {
  HM = {}; hbBanque()
  F(15, 14, 1, 16, 14, 1, AIR); S(15, 14, 2, HORL('north')); S(16, 14, 2, HORL('north'))
  hb2Pierre('z', 6, 27, 3, 12, 3, -1, 0); hb2Pierre('z', 6, 27, 3, 12, 28, 1, 0)
  S(13, 2, 25, 'supplementaries:safe[facing=east,open=true]'); S(18, 2, 25, 'supplementaries:safe[facing=west,open=false]')
  S(14, 2, 24, 'createdeco:gold_coinstack[layers=3,waterlogged=false]'); SA(16, 3, 25, 'createdeco:gold_coinstack[layers=2,waterlogged=false]')
  SA(17, 2, 26, 'createdeco:iron_coinstack[layers=1,waterlogged=false]'); SA(13, 2, 24, 'createdeco:copper_coinstack[layers=4,waterlogged=false]')
  for (var x = 8; x <= 23; x += 3) if (R() < 0.5) SA(x, 3, 16, 'createdeco:copper_coinstack[layers=2,waterlogged=false]')
}
