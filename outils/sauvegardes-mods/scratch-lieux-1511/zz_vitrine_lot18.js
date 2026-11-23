
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

// ---- Square clos (enceinte, grille, orangerie, carres plantes, lanternes) ----
function gtSquareClos() {
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
  // orangerie x11..20 z2..10 : grandes baies, gradins de pots, poele
  F(11, 0, 2, 20, 0, 10, GTPD)
  for (var y = 1; y <= 7; y++) for (var x = 11; x <= 20; x++) for (var z = 2; z <= 10; z++) if (x == 11 || x == 20 || z == 2 || z == 10) S(x, y, z, gtM(GTS))
  gtToitZ(10, 21, 1, 11, 8, GTTS); gtPignonZ(2, 10, 21, 8, GTS); gtPignonZ(10, 10, 21, 8, GTS)
  for (var x = 12; x <= 19; x += 2) { if (x == 14 || x == 16) continue; F(x, 2, 10, x + 1, 6, 10, 'minecraft:glass_pane') }
  for (var z = 3; z <= 8; z += 3) { F(11, 2, z, 11, 6, z + 1, 'minecraft:glass_pane'); F(20, 2, z, 20, 6, z + 1, 'minecraft:glass_pane') }
  PORTE(15, 1, 10, GTPO, 'south', 'left', 'false'); PORTE(16, 1, 10, GTPO, 'south', 'right', 'false'); F(15, 3, 2, 16, 6, 2, 'minecraft:glass_pane')
  F(12, 1, 3, 12, 1, 9, 'minecraft:spruce_slab[type=top]'); F(19, 1, 3, 19, 1, 9, 'minecraft:spruce_slab[type=top]')
  for (var z = 3; z <= 9; z++) { S(12, 2, z, choix(['minecraft:potted_fern', 'minecraft:potted_dead_bush', 'minecraft:flower_pot', 'minecraft:potted_azalea_bush'])); S(19, 2, z, choix(['minecraft:potted_fern', 'minecraft:potted_dead_bush', 'minecraft:flower_pot'])) }
  S(15, 1, 3, 'minecraft:blast_furnace[facing=south,lit=false]'); F(15, 2, 3, 15, 8, 3, 'minecraft:chain[axis=y]'); S(16, 1, 3, 'minecraft:barrel[facing=up,open=false]'); S(14, 1, 3, 'minecraft:composter[level=5]')
  ;[6, 8].forEach(z => { S(14, 1, z, 'minecraft:potted_azalea_bush'); S(17, 1, z, 'minecraft:potted_fern') }); F(15, 1, 4, 16, 1, 9, 'minecraft:moss_carpet')
  F(15, 8, 6, 15, 12, 6, 'minecraft:chain[axis=y]'); S(15, 7, 6, GTSL); S(13, 6, 3, 'minecraft:cobweb'); S(18, 6, 9, 'minecraft:cobweb')
  // carres plantes a bordure de pierre (coins nord), massifs le long des allees
  function carre(x1, z1, x2, z2) {
    for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) { delete GTV[x + ',' + z]; var b = x == x1 || x == x2 || z == z1 || z == z2
      if (b) S(x, 0, z, 'minecraft:stone_brick_slab[type=bottom]'); else { S(x, -1, z, 'minecraft:coarse_dirt'); var r = R(); S(x, 0, z, r < 0.35 ? 'minecraft:sweet_berry_bush[age=2]' : r < 0.6 ? 'minecraft:fern' : r < 0.75 ? 'minecraft:dead_bush' : AIR) } }
  }
  carre(2, 2, 8, 8); carre(23, 2, 29, 8); carre(2, 9, 8, 12); carre(23, 9, 29, 12)
  ;[[1, 17, 13, 28], [18, 17, 30, 28]].forEach(m => { for (var x = m[0]; x <= m[2]; x++) for (var z = m[1]; z <= m[3]; z++) { if ((x + z) % 4) continue; delete GTV[x + ',' + z]; S(x, -1, z, 'minecraft:grass_block'); S(x, 0, z, choix(['minecraft:poppy', 'minecraft:dandelion', 'minecraft:azure_bluet', 'minecraft:oxeye_daisy', 'minecraft:short_grass', 'minecraft:fern'])) } })
  gtArbreMort(13, 19, 6, false); gtArbreMort(18, 27, 6, true); gtArbreMort(29, 13, 5, false)
  ;[[14, 20], [17, 24], [14, 28]].forEach(p => { S(p[0], 0, p[1], GTSW); S(p[0], 1, p[1], GTSW); S(p[0], 2, p[1], 'minecraft:lantern[hanging=false]') })
  gtBanc(20, 13, 'north', 3); gtBanc(9, 13, 'north', 3); S(27, 0, 29, 'minecraft:grindstone[face=floor,facing=north]'); S(28, 0, 29, 'minecraft:composter'); S(29, 0, 29, 'minecraft:barrel[facing=up,open=false]')
  gtVeg(0, 0, 31, 31, 0.45)
}

// ---- Hospice (plan en U, pharmacie, refectoire, salles communes, cellules d'isolement, cour a galeries, puits) ----
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
  // cour a galeries : puits, borne-lanterne, bancs, haies
  gtDalle(15, 10, 16, 26, ['minecraft:gravel', 'minecraft:gravel', 'minecraft:cobblestone']); gtDalle(9, 17, 22, 18, ['minecraft:gravel', 'minecraft:gravel', 'minecraft:cobblestone'])
  ;[11, 14, 20, 23, 26].forEach(z => { F(10, 0, z, 10, 4, z, GTSW); F(21, 0, z, 21, 4, z, GTSW) }); F(9, 5, 10, 10, 5, 26, 'minecraft:deepslate_tile_slab[type=bottom]'); F(21, 5, 10, 22, 5, 26, 'minecraft:deepslate_tile_slab[type=bottom]')
  for (var x = 17; x <= 20; x++) for (var z = 20; z <= 23; z++) { if ((x == 18 || x == 19) && (z == 21 || z == 22)) { F(x, -3, z, x, -1, z, 'minecraft:water'); S(x, -4, z, 'minecraft:mud') } else { S(x, -1, z, 'minecraft:cobblestone'); S(x, 0, z, 'minecraft:cobblestone_wall') } delete GTV[x + ',' + z] }
  S(17, 1, 20, GTF); S(17, 2, 20, GTF); S(20, 1, 23, GTF); S(20, 2, 23, GTF); F(17, 3, 20, 20, 3, 23, 'minecraft:dark_oak_slab[type=bottom]'); S(18, 2, 21, 'minecraft:chain[axis=y]'); S(18, 1, 21, 'minecraft:lantern[hanging=true]'.replace('lantern', 'lantern'))
  S(12, -1, 13, GTS); S(12, 0, 13, 'minecraft:chiseled_stone_bricks'); F(12, 1, 13, 12, 2, 13, GTSW); S(12, 3, 13, 'minecraft:lantern[hanging=false]')
  gtBanc(12, 24, 'south', 3); gtBanc(18, 12, 'north', 2); gtArbreMort(13, 21, 6, true)
  for (var x = 11; x <= 20; x++) if (x != 15 && x != 16 && R() < 0.8) S(x, 0, 26, 'minecraft:azalea_leaves[persistent=true]')
  // jardin arriere : mur, compost, bois
  F(9, 0, 28, 14, 1, 28, 'minecraft:cobblestone_wall'); F(17, 0, 28, 22, 1, 28, 'minecraft:cobblestone_wall')
  S(25, 0, 28, 'minecraft:composter[level=3]'); S(29, 0, 28, 'minecraft:hay_block[axis=y]'); F(2, 0, 29, 6, 1, 29, 'minecraft:spruce_log[axis=x]'); S(7, 0, 30, 'minecraft:barrel[facing=up,open=false]')
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
  vue('gt_halle_draps', 0, 0, 15.5, 12, 46.5, 15.5, 16, 24)
  vue('gt_halle_draps_tours', 0, 0, 34, 24, 40, 15, 24, 26)
  vue('gt_nef', 0, 0, 15.5, 4, 25, 15.5, 5, 4)
  vue('gt_choeur', 0, 0, 15.5, 4, 15, 15.5, 3, 3)
  vue('gt_beffroi', 32, 0, 15.5, 10, 50, 15.5, 20, 12)
  vue('gt_conseil', 32, 0, 20.5, 10.5, 16.5, 8, 9, 10)
  vue('gt_guichets', 32, 0, 9, 2.6, 14, 8, 1.5, 8)
  vue('gt_maisons', 64, 0, 16, 8, 44, 16, 10, 20)
  vue('gt_taverne', 64, 0, 21.5, 2.6, 22.5, 17, 1.2, 13)
  vue('gt_apothicaire', 64, 0, 5.5, 2.6, 22.5, 2, 1.5, 16)
  vue('gt_square_clos', 96, 0, 15.5, 10, 46, 15.5, 2, 16)
  vue('gt_orangerie', 96, 0, 15.5, 3.4, 9.3, 15.5, 3.4, 3)
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
  vue('gt_coupe_halle_draps', 144, 0, 16, 32, 40, 16, 0, 14)
  vue('gt_coupe_beffroi', 180, 0, 16, 30, 36, 16, 6, 12)
  vue('gt_coupe_maisons', 216, 0, 16, 24, 38, 16, 4, 16)
  vue('gt_coupe_hospice', 144, 48, 16, 26, -6, 16, 2, 16)
  vue('gt_coupe_bibliotheque', 180, 48, 16, 26, -6, 16, 4, 12)
  vue('gt_coupe_darse', 216, 48, 16, 24, -6, 16, 0, 16)
}
