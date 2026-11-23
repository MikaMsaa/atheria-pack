
// ================= DEUX IMMEUBLES DE RAPPORT (R+5 + combles, porte cochere, cafe, boulangerie, pharmacie, cour) =================
// Batiment A x0..15, batiment B x16..31, profondeur z12..29 ; cour z0..11. Par etage : cage d'escalier x+6..8 z13..18, palier z20..21, 2 appartements.
function hbImmeubles() {
  var NIV = [0, 6, 12, 18, 24, 30], PL = 'minecraft:calcite'
  for (var x = 0; x <= 31; x++) { S(x, -1, 30, R() < 0.8 ? 'minecraft:smooth_stone' : 'minecraft:polished_andesite'); S(x, -1, 31, R() < 0.8 ? 'minecraft:smooth_stone' : 'minecraft:andesite') }
  // ---- cour pavee ----
  for (var x = 0; x <= 31; x++) for (var z = 0; z <= 11; z++) { var r = R(); S(x, -1, z, r < 0.6 ? 'minecraft:cobblestone' : r < 0.78 ? 'minecraft:stone_bricks' : r < 0.9 ? 'minecraft:mossy_cobblestone' : 'minecraft:gravel'); }
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
