
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
  ;[1, 5, 22, 26, 30].forEach(x => { var h = 2 + Math.floor(R() * 8); for (var y = 1; y <= h && y <= 10; y++) S(x, y, 30, 'minecraft:vine[north=true]') })
  // ---- atrium : colonnes, galeries, corniches sous les balcons interieurs ----
  COL.forEach(c => F(c[0], 0, c[1], c[0], 29, c[1], 'minecraft:quartz_pillar'))
  ;[6, 12, 18, 24].forEach(Y => {
    for (var x = 9; x <= 22; x++) [8, 23].forEach(z => { if (!estCol(x, z)) { S(x, Y + 1, z, HF); S(x, Y - 1, z, hbE('minecraft:smooth_sandstone', z == 8 ? 'north' : 'south', 'top')) } })
    for (var z = 9; z <= 22; z++) [9, 22].forEach(x => { if (!estCol(x, z)) { S(x, Y + 1, z, HF); S(x, Y - 1, z, hbE('minecraft:smooth_sandstone', x == 9 ? 'west' : 'east', 'top')) } })
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
