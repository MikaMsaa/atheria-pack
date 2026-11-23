// ================= PORT DE LONGONI A L'ECHELLE REELLE (lot67, 14/11) : lieu 1 du trailer (ouverture : conteneurs, grue, mer a +X) et lieu 3 (parcours sur les toits) =================
// Lot 128 x 128. Terre-plein a y-1 ; mer a l'est (x >= 101), surface a y-4 (quai a 3 m au-dessus de l'eau), fond a y-11.
// Ouest : rangee d'entrepots du parcours (toits 13, 12, 12, 10, 9 ; ecarts 2, 3, 2, 4 ; palier final a 6). Route du port x32..47, cloture et poste de la PAF.
// Parc a conteneurs de 40 pieds (12 x 3 x 3) x48..83 ; deux portiques de quai sur rails x84 / x99 (le second fleche levee) ; cargo a quai x104..119.
var LP_COUL = ['red', 'blue', 'orange', 'green', 'white', 'gray', 'brown', 'light_gray', 'cyan', 'red', 'blue', 'white']
function lpCont(x, y, z, ax, c, porte) {
  var lx = ax == 'x' ? 12 : 3, lz = ax == 'x' ? 3 : 12
  F(x, y, z, x + lx - 1, y + 2, z + lz - 1, 'createdeco:' + c + '_shipping_container[axis=' + ax + ',large=false]')
  // portes au bout : vantaux de la couleur en terre cuite, barres de verrouillage

}
// paint use : taches de rouille
function lpRouille(b) { return R() < 0.025 ? 'minecraft:brown_terracotta' : b }
function lpBitume(x1, z1, x2, z2) { for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) { var r = R(), n = lbBruit(Math.floor(x / 3), Math.floor(z / 3), 4.4), m = lbBruit(x, z, 9.7); S(x, -1, z, m > 1.55 ? 'minecraft:cyan_terracotta' : n > 1.0 ? 'minecraft:black_concrete' : n < -1.2 ? 'minecraft:light_gray_concrete' : r < 0.015 ? 'minecraft:gravel' : 'minecraft:gray_concrete') } }

// ---------------- portique de quai (STS) : pieds 2x2 sur bogies, portail, fleche sur l'eau et contre-fleche, chevalet, haubans, salle des machines, chariot, cabine, spreader ----------------
function lpPortique(zc, couleur, levee, charge) {
  var C = 'minecraft:' + couleur + '_concrete', W = 'minecraft:white_concrete', zA = zc, zB = zc + 14
  function P(x, y, z, b) { S(x, y, z, lpRouille(b || C)) }
  ;[84, 98].forEach(x => [zA, zB].forEach(z => {
    F(x, 0, z - 2, x + 1, 1, z + 3, 'minecraft:black_concrete')        // bogie
    for (var y = 2; y <= 26; y++) for (var dx = 0; dx <= 1; dx++) for (var dz = 0; dz <= 1; dz++) P(x + dx, y, z + dz)
  }))
  for (var y = 2; y <= 25; y++) S(86, y, zA + 1, 'minecraft:ladder[facing=east,waterlogged=false]')
  // traverses basses et poutres du portail
  ;[zA, zB].forEach(z => { for (var x = 86; x <= 97; x++) { P(x, 12, z); P(x, 12, z + 1) } })
  for (var z = zA + 2; z < zB; z++) { P(84, 12, z); P(85, 12, z); P(98, 12, z); P(99, 12, z) }
  for (var x = 84; x <= 99; x++) for (var z = zA; z <= zB + 1; z++) if (z == zA || z == zA + 1 || z == zB || z == zB + 1 || x == 84 || x == 85 || x == 98 || x == 99) P(x, 26, z)
  // fleche (deux poutres caissons, entretoises) : contre-fleche x66..99, avant x100..127 (ou relevee a la verticale)
  var g1 = zc + 5, g2 = zc + 9, xmax = levee ? 99 : 127
  for (var x = 66; x <= xmax; x++) { [g1, g2].forEach(z => { P(x, 27, z, x > 99 ? W : C); P(x, 28, z, x > 99 ? W : C) }); if (x % 4 == 0) F(x, 27, g1 + 1, x, 27, g2 - 1, 'minecraft:iron_bars') }
  F(66, 29, g1, 99, 29, g1, 'createdeco:iron_catwalk_railing[north=true]'); F(66, 26, g1 + 1, 99, 26, g2 - 1, 'createdeco:iron_catwalk')
  if (levee) {
    for (var y = 29; y <= 56; y++) { [g1, g2].forEach(z => { P(98, y, z, W); P(99, y, z, W) }); if (y % 4 == 0) F(98, y, g1 + 1, 98, y, g2 - 1, 'minecraft:iron_bars') }
  }
  // chevalet : deux mats, traverse, haubans en escalier vers la pointe et vers la contre-fleche
  ;[g1, g2].forEach(z => {
    for (var y = 29; y <= 40; y++) { P(88, y, z); P(89, y, z) }
    var pts = levee ? [[90, 40, 98, 52]] : [[90, 40, 127, 29], [87, 40, 67, 29]]
    pts.forEach(p => { var n = Math.max(Math.abs(p[2] - p[0]), Math.abs(p[3] - p[1])), px = p[0], py = p[1]; for (var i = 1; i <= n; i++) { var x = Math.round(p[0] + (p[2] - p[0]) * i / n), y = Math.round(p[1] + (p[3] - p[1]) * i / n); if (x != px && y != py) S(x, py, z, 'minecraft:gray_concrete'); S(x, y, z, 'minecraft:gray_concrete'); px = x; py = y } })
  })
  F(88, 41, g1, 89, 41, g2, C)
  // salle des machines sur la contre-fleche, avec porte, grille et escalier
  F(67, 29, g1, 76, 33, g2, W); F(68, 30, g1 + 1, 75, 32, g2 - 1, AIR); F(67, 34, g1, 76, 34, g2, 'createdeco:andesite_sheet_metal')
  for (var x = 69; x <= 74; x += 2) S(x, 31, g1, 'createdeco:industrial_iron_window'); S(76, 30, g1 + 2, AIR); S(76, 31, g1 + 2, AIR)
  F(68, 30, g1 + 1, 70, 31, g1 + 2, 'create:andesite_casing'); S(72, 30, g2 - 1, 'create:encased_fan[facing=up]')
  // chariot, cabine du grutier, cables, spreader et conteneur en l'air au-dessus du cargo
  if (!levee) {
    var xt = 110
    F(xt - 2, 25, g1, xt + 2, 26, g2, 'minecraft:gray_concrete'); F(xt - 1, 22, g1 - 1, xt + 1, 24, g1, W); S(xt, 23, g1 - 1, 'minecraft:black_stained_glass')
    if (charge) {
      F(xt, 17, g1 + 2, xt, 24, g1 + 2, 'minecraft:chain[axis=y,waterlogged=false]'); F(xt, 17, g2 - 2, xt, 24, g2 - 2, 'minecraft:chain[axis=y,waterlogged=false]')
      F(xt - 1, 16, zc + 1, xt + 1, 16, zc + 12, 'minecraft:yellow_concrete'); lpCont(xt - 1, 13, zc + 1, 'z', charge, true)
    } else { F(xt, 19, g1 + 2, xt, 24, g1 + 2, 'minecraft:chain[axis=y,waterlogged=false]'); F(xt, 19, g2 - 2, xt, 24, g2 - 2, 'minecraft:chain[axis=y,waterlogged=false]'); F(xt - 1, 18, zc + 1, xt + 1, 18, zc + 12, 'minecraft:yellow_concrete') }
  }
  // feux d'obstacle en tete de chevalet
  S(88, 42, g1, 'minecraft:redstone_lamp[lit=false]'); S(89, 42, g2, 'minecraft:redstone_lamp[lit=false]')
}

// ---------------- cargo porte-conteneurs a quai : coque, bulbe, pont, baies chargees, chateau, cheminee, mat ----------------
function lpCargo() {
  var X1 = 104, X2 = 119, Z1 = 12, Z2 = 104
  for (var z = Z1; z <= Z2; z++) {
    var proue = Math.max(0, 12 - (z - Z1)), r = Math.floor(proue * proue / 18), a = X1 + r, b = X2 - r
    for (var x = a; x <= b; x++) for (var y = -9; y <= 1; y++) {
      var bord = x == a || x == b || z == Z1 || z == Z2 || y == -9
      if (!bord && y < 1) continue
      S(x, y, z, y <= -5 ? 'minecraft:red_terracotta' : y == -4 ? 'minecraft:white_concrete' : y == 1 && !bord ? (R() < 0.08 ? 'minecraft:brown_terracotta' : 'minecraft:gray_concrete') : lpRouille('minecraft:blue_concrete'))
    }
    if (a < b && z > Z1 && z < Z2) { F(a + 1, -8, z, b - 1, 0, z, 'minecraft:black_concrete') }
    // pavois et lisse
    if (a <= b) { S(a, 2, z, 'minecraft:blue_concrete'); S(b, 2, z, 'minecraft:blue_concrete'); if (z % 2 == 0) { S(a, 3, z, 'minecraft:iron_bars'); S(b, 3, z, 'minecraft:iron_bars') } }
  }
  // gaillard d'avant, guindeaux
  F(X1 + 3, 2, Z1 + 4, X2 - 3, 3, Z1 + 12, 'minecraft:blue_concrete'); F(X1 + 5, 4, Z1 + 8, X1 + 6, 4, Z1 + 9, 'minecraft:black_concrete'); F(X2 - 6, 4, Z1 + 8, X2 - 5, 4, Z1 + 9, 'minecraft:black_concrete')
  // baies : conteneurs de 40 pieds dans l'axe du navire, 5 de large, piles de 2 a 4, une baie vide, panneaux de cale
  var z0 = 28
  for (var bay = 0; bay < 5; bay++) {
    var zb = z0 + bay * 13
    F(X1 + 1, 2, zb - 1, X2 - 1, 2, zb - 1, 'minecraft:gray_concrete')   // hiloire
    if (bay == 2) { F(X1 + 1, 2, zb, X2 - 1, 2, zb + 11, 'minecraft:light_gray_concrete'); continue }
    for (var col = 0; col < 5; col++) { var h = 2 + Math.floor(R() * 3); for (var k = 0; k < h; k++) lpCont(X1 + 1 + col * 3, 2 + k * 3, zb, 'z', choix(LP_COUL), k % 2 == 0) }
    // ponts de saisissage entre les baies
    F(X1 + 1, 3, zb + 12, X2 - 1, 3, zb + 12, 'createdeco:iron_catwalk'); F(X1 + 1, 4, zb + 12, X2 - 1, 4, zb + 12, 'createdeco:iron_catwalk_railing[south=true]')
  }
  // chateau arriere : 6 ponts, bandes vitrees, passerelle de navigation a ailerons, cheminee, mat radar
  var C1 = Z2 - 14, C2 = Z2 - 5
  F(X1 + 2, 2, C1, X2 - 2, 19, C2, 'minecraft:white_concrete'); F(X1 + 3, 2, C1 + 1, X2 - 3, 18, C2 - 1, AIR)
  for (var y = 3; y <= 18; y += 3) { F(X1 + 3, y, C1, X2 - 3, y, C1, 'minecraft:gray_stained_glass_pane'); F(X1 + 2, y, C1 + 2, X1 + 2, y, C2 - 2, 'minecraft:gray_stained_glass_pane'); F(X2 - 2, y, C1 + 2, X2 - 2, y, C2 - 2, 'minecraft:gray_stained_glass_pane') }
  for (var y = 5; y <= 17; y += 3) F(X1 + 3, y, C1 + 1, X2 - 3, y, C2 - 1, 'minecraft:light_gray_concrete')
  for (var y = 3; y <= 18; y += 3) F(X1 + 4, y, C2, X2 - 4, y, C2, 'minecraft:gray_stained_glass_pane')
  F(X1 + 4, -2, Z2, X2 - 4, -1, Z2, 'minecraft:white_concrete'); F(X1 + 2, 4, Z2 - 3, X2 - 2, 4, Z2 - 3, 'minecraft:iron_bars')
  F(X1, 18, C1, X2, 18, C1 + 3, 'minecraft:white_concrete'); F(X1, 19, C1, X2, 19, C1, 'minecraft:black_stained_glass_pane'); F(X1, 20, C1, X2, 20, C1 + 3, 'minecraft:white_concrete')
  F(X1 + 5, 21, C2 - 2, X2 - 5, 27, C2, 'minecraft:black_concrete'); F(X1 + 5, 25, C2 - 2, X2 - 5, 25, C2, 'minecraft:red_concrete')
  F(X1 + 7, 21, C1 + 2, X1 + 7, 28, C1 + 2, 'minecraft:iron_bars'); F(X1 + 6, 28, C1 + 2, X1 + 8, 28, C1 + 2, 'minecraft:iron_bars'); S(X1 + 7, 29, C1 + 2, 'minecraft:lightning_rod[facing=up,powered=false,waterlogged=false]')
  // canots de sauvetage sur bossoirs, de part et d'autre
  ;[X1 + 1, X2 - 1].forEach(x => { F(x, 7, C1 + 2, x, 7, C1 + 7, 'minecraft:orange_concrete'); F(x, 8, C1 + 2, x, 8, C1 + 7, 'minecraft:white_concrete'); F(x, 9, C1 + 2, x, 9, C1 + 2, 'minecraft:white_concrete'); F(x, 9, C1 + 7, x, 9, C1 + 7, 'minecraft:white_concrete') })
  // coursives exterieures a deux ponts, lisses en barreaux, echelles de coupee
  ;[11, 14].forEach(y => { [[X1 + 1, 'west'], [X2 - 1, 'east']].forEach(c => { F(c[0], y, C1, c[0], y, C2, 'minecraft:smooth_quartz_slab[type=top,waterlogged=false]'); F(c[0], y + 1, C1, c[0], y + 1, C2, 'minecraft:iron_bars') }) })
  for (var y = 2; y <= 10; y++) S(X1 + 1, y, C2, 'minecraft:ladder[facing=west,waterlogged=false]')
  // cheminee : chapeau, deux sorties d'echappement ; mat radar : vergue et antenne
  F(X1 + 5, 28, C2 - 2, X2 - 5, 28, C2, 'minecraft:polished_blackstone_slab[type=bottom,waterlogged=false]'); S(X1 + 6, 29, C2 - 1, 'minecraft:polished_blackstone_wall'); S(X2 - 6, 29, C2 - 1, 'minecraft:polished_blackstone_wall')
  F(X1 + 5, 26, C1 + 2, X1 + 9, 26, C1 + 2, 'minecraft:smooth_stone_slab[type=bottom,waterlogged=false]')
}

// ---------------- entrepot du parcours : murs selon le style, rdc de 5, etages de 4, toit plat sans muret cote ecarts, details de toit loin des bords de saut ----------------
function lpEntrepot(x1, z1, x2, z2, h, style, coul) {
  var M = { brique: ['minecraft:bricks', 'createdeco:cracked_red_bricks', 'minecraft:smooth_stone'], beton: ['minecraft:light_gray_concrete', 'minecraft:smooth_stone', 'minecraft:andesite'], tole: ['createdeco:andesite_sheet_metal', 'minecraft:brown_terracotta', 'minecraft:light_gray_concrete'], enduit: ['minecraft:white_terracotta', 'minecraft:yellow_terracotta', 'minecraft:smooth_stone'] }[style]
  var yr = h - 1
  for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) for (var y = 0; y < yr; y++) {
    if (!(x == x1 || x == x2 || z == z1 || z == z2)) continue
    var coin = (x == x1 || x == x2) && (z == z1 || z == z2), n = lbBruit(x * 2, y * 3 + z, 1.7)
    S(x, y, z, coin ? M[2] : y == 0 ? 'minecraft:andesite' : (y == 5 || y == yr - 1) ? M[2] : style == 'tole' ? (((x + z) % 3 == 0) ? M[1] : M[0]) : n > 1.2 ? M[1] : M[0])
  }
  F(x1 + 1, 0, z1 + 1, x2 - 1, yr - 1, z2 - 1, AIR); F(x1 + 1, -1, z1 + 1, x2 - 1, -1, z2 - 1, 'minecraft:polished_andesite')
  // etancheite : membrane grise, reprises au goudron (plaques noires), joints de dalles en gravillons le long des relevés
  for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) { var n = lbBruit(Math.floor(x / 2), Math.floor(z / 2), 3.3 + x1); S(x, yr, z, n > 1.05 ? 'minecraft:black_concrete' : (x == x1 + 1 || x == x2 - 1) && R() < 0.5 ? 'minecraft:light_gray_concrete' : 'minecraft:gray_concrete') }
  // crosses de ventilation et cables le long du releve ouest
  for (var z = z1 + 5; z <= z2 - 5; z += 5) { S(x1 + 2, yr + 1, z, 'minecraft:polished_blackstone_wall'); S(x1 + 2, yr + 2, z, 'minecraft:polished_blackstone_slab[type=bottom,waterlogged=false]') }
  for (var y = 5; y < yr; y += 4) F(x1 + 1, y, z1 + 1, x2 - 1, y, z2 - 1, 'minecraft:smooth_stone')
  // fenetres : 2 de large tous les 4 sur toutes les faces, aux etages ; appuis en saillie ; quelques carreaux souffles par colonne entiere
  function baie(x, z, ax, y0, y1) { var casse = R() < 0.25; for (var y = y0; y <= y1; y++) S(x, y, z, casse ? AIR : 'minecraft:gray_stained_glass_pane') }
  for (var y0 = 6; y0 + 2 < yr; y0 += 4) {
    for (var z = z1 + 2; z <= z2 - 3; z += 4) { [x1, x2].forEach(x => { baie(x, z, 'z', y0, y0 + 1); baie(x, z + 1, 'z', y0, y0 + 1); var o = x == x1 ? -1 : 1; S(x + o, y0 - 1, z, 'minecraft:smooth_stone_slab[type=top,waterlogged=false]'); S(x + o, y0 - 1, z + 1, 'minecraft:smooth_stone_slab[type=top,waterlogged=false]') }) }
    for (var x = x1 + 2; x <= x2 - 3; x += 4) { [z1, z2].forEach(z => { baie(x, z, 'x', y0, y0 + 1); baie(x + 1, z, 'x', y0, y0 + 1) }) }
  }
  // rez-de-chaussee sur la route (est) : grandes portes de chargement, rideau de fer a moitie baisse, quai de chargement
  for (var z = z1 + 2; z + 3 <= z2 - 1; z += 6) {
    F(x2, 0, z, x2, 3, z + 3, AIR); F(x2, 4, z, x2, 4, z + 3, M[2])
    if (R() < 0.6) F(x2, 2, z, x2, 3, z + 3, 'minecraft:iron_trapdoor[facing=east,half=top,open=true,powered=false,waterlogged=false]')
    S(x2 + 1, 0, z - 1, 'minecraft:polished_blackstone_wall'); S(x2 + 1, 0, z + 4, 'minecraft:polished_blackstone_wall')
    // dans l'entrepot : palettes et caisses
    F(x2 - 4, 0, z, x2 - 3, 0, z + 1, 'minecraft:spruce_slab[type=bottom,waterlogged=false]'); S(x2 - 4, 1, z, 'minecraft:barrel[facing=up,open=false]'); SA(x2 - 3, 1, z + 1, 'supplementaries:sack')
    F(x1 + 1, 0, z, x1 + 1, 2, z + 2, 'handcrafted:spruce_shelf[facing=east]')
  }
  // ouest (ville) : porte d'entree, auvent de toile, enseigne vide
  var zp = Math.floor((z1 + z2) / 2); S(x1, 0, zp, AIR); S(x1, 1, zp, AIR); PORTE(x1, 0, zp, 'mcwdoors:metal_door', 'west', 'left', 'false')
  F(x1 - 1, 3, zp - 2, x1 - 1, 3, zp + 2, 'supplementaries:awning_' + coul + '[facing=west]')
  F(x1, 4, zp - 3, x1, 4, zp + 3, 'minecraft:' + coul + '_concrete')
  // descentes d'eaux pluviales aux angles (cote ville et cote route)
  ;[[x1 - 1, z1], [x1 - 1, z2], [x2 + 1, z1], [x2 + 1, z2]].forEach(p => F(p[0], 0, p[1], p[0], yr, p[1], 'create:fluid_pipe'))
  // muret seulement sur les cotes est et ouest (les ecarts de saut restent libres), couvertine
  F(x1, yr + 1, z1, x1, yr + 1, z2, 'minecraft:smooth_stone_slab[type=bottom,waterlogged=false]'); F(x2, yr + 1, z1, x2, yr + 1, z2, 'minecraft:smooth_stone_slab[type=bottom,waterlogged=false]')
  // toit : verrieres, groupe de ventilation, trappe d'acces, cuve, antenne ; rien a moins de 3 blocs des bords nord et sud
  var a = z1 + 4, b = z2 - 4
  if (b - a >= 4) {
    F(x1 + 4, yr, a, x1 + 6, yr, b, 'minecraft:glass'); F(x1 + 4, yr + 1, a, x1 + 6, yr + 1, a, 'minecraft:smooth_stone_slab[type=bottom,waterlogged=false]')
    F(x2 - 6, yr + 1, a + 1, x2 - 4, yr + 2, a + 2, 'create:andesite_casing'); S(x2 - 5, yr + 3, a + 1, 'create:encased_fan[facing=up]')
    S(x1 + 10, yr, b, 'minecraft:iron_trapdoor[facing=north,half=top,open=false,powered=false,waterlogged=false]')
    F(x2 - 3, yr + 1, b - 1, x2 - 2, yr + 3, b, 'minecraft:light_gray_terracotta'); F(x2 - 3, yr + 4, b - 1, x2 - 2, yr + 4, b, 'minecraft:smooth_stone_slab[type=bottom,waterlogged=false]')
    F(x1 + 12, yr + 1, a + 2, x1 + 12, yr + 5, a + 2, 'minecraft:iron_bars'); S(x1 + 12, yr + 6, a + 2, 'minecraft:lightning_rod[facing=up,powered=false,waterlogged=false]')
  }
  // flaques et mousse sur le toit
  for (var x = x1 + 1; x < x2; x++) for (var z = z1 + 1; z < z2; z++) if (libreH(x, yr + 1, z) && lbBruit(x, z, 8.1) > 1.35) S(x, yr, z, 'minecraft:moss_block')
}

function lpPort() {
  var N = 127
  // mer : fond de sable, eau jusqu'a y-4, quai de beton a parement et defenses
  for (var xs = 101; xs <= 250; xs += 10) { var xe = Math.min(250, xs + 9); F(xs, -11, -30, xe, -11, 160, 'minecraft:sand'); F(xs, -10, -30, xe, -4, 160, 'minecraft:water'); F(xs, -3, -30, xe, 4, 160, AIR) }
  F(100, -10, -30, 100, -1, -1, 'minecraft:light_gray_concrete'); F(100, -10, N + 1, 100, -1, 160, 'minecraft:light_gray_concrete')
  for (var z = 0; z <= N; z++) { F(100, -10, z, 100, -2, z, lpRouille('minecraft:light_gray_concrete')); S(100, -1, z, 'minecraft:smooth_stone'); if (z % 8 == 4) F(101, -4, z, 101, -2, z, 'minecraft:black_concrete') }
  // terre-plein : bitume, lignes de voies (bandes sans texte), rails des portiques
  lpBitume(48, 0, 99, N); lpBitume(28, 0, 47, N)
  for (var z = 0; z <= N; z++) { S(84, 0, z, 'minecraft:rail[shape=north_south,waterlogged=false]'); S(99, 0, z, 'minecraft:rail[shape=north_south,waterlogged=false]'); if (z % 8 == 0) S(97, 0, z, 'minecraft:polished_blackstone_wall') }
  for (var z = 0; z <= N; z++) if (z % 6 < 3) { S(91, -1, z, 'minecraft:yellow_concrete'); S(39, -1, z, 'minecraft:white_concrete') }
  for (var x = 28; x <= 47; x++) for (var z = 0; z <= N; z++) if (x <= 31 || x >= 45) S(x, -1, z, R() < 0.85 ? 'minecraft:smooth_stone' : 'minecraft:cracked_stone_bricks')
  // cloture du port (x48) a barbele, deux portails ; poste de la PAF a barrieres
  for (var z = 0; z <= N; z++) { if ((z >= 20 && z <= 27) || (z >= 88 && z <= 95)) continue; F(48, 0, z, 48, 2, z, 'createdeco:industrial_iron_mesh_fence'); if (z % 4 == 0) { F(48, 0, z, 48, 3, z, 'minecraft:polished_deepslate_wall'); S(48, 4, z, 'simply_traps:circular_barbed_wire_iron[facing=east]') } }
  F(50, 0, 28, 54, 3, 31, 'minecraft:white_concrete'); F(51, 0, 29, 53, 2, 30, AIR); F(50, 2, 28, 54, 2, 28, 'minecraft:gray_stained_glass_pane'); F(50, 2, 31, 54, 2, 31, 'minecraft:gray_stained_glass_pane'); F(49, 4, 27, 55, 4, 32, 'minecraft:smooth_stone_slab[type=bottom,waterlogged=false]')
  S(50, 0, 30, AIR); S(50, 1, 30, AIR); F(49, 3, 29, 49, 3, 30, 'minecraft:blue_concrete')
  S(49, 0, 21, 'minecraft:polished_blackstone_wall'); for (var z = 22; z <= 26; z++) S(49, 1, z, z % 2 ? 'minecraft:red_nether_brick_wall' : 'minecraft:diorite_wall'); S(49, 1, 21, 'minecraft:polished_blackstone_wall')
  S(49, 0, 89, 'minecraft:polished_blackstone_wall'); S(50, 0, 90, 'minecraft:red_nether_brick_wall'); S(51, 0, 91, 'minecraft:diorite_wall'); S(52, 0, 92, 'minecraft:red_nether_brick_wall')
  // parc a conteneurs : six blocs de 5 rangees, colonnes de 12 sur x48..83, piles 0 a 3 selon un bruit (silhouette organique)
  ;[4, 24, 44, 64, 84, 104].forEach((zb, ib) => {
    for (var col = 0; col < 3; col++) for (var row = 0; row < 5; row++) {
      var x = 49 + col * 12, z = zb + row * 3, n = lbBruit(x, z, 6.2) + R() * 0.8, h = n > 1.1 ? 3 : n > 0.1 ? 2 : n > -0.9 ? 1 : 0
      if (ib == 1 && col == 2) h = 0
      for (var k = 0; k < h; k++) lpCont(x, k * 3, z, 'x', choix(LP_COUL), col == 2)
    }
  })
  // conteneur renverse au pied d'une pile, porte arrachee
  lpCont(70, 0, 40, 'z', 'orange', true); S(71, 0, 40, AIR); S(71, 1, 40, AIR)
  // cavalier (straddle carrier) arrete au-dessus d'une rangee
  var sx = 61, sz = 47
  ;[[sx - 1, sz - 1], [sx + 12, sz - 1], [sx - 1, sz + 3], [sx + 12, sz + 3]].forEach(p => { F(p[0], 0, p[1], p[0], 9, p[1], 'minecraft:yellow_concrete'); S(p[0], 0, p[1], 'minecraft:black_concrete') })
  F(sx - 1, 10, sz - 1, sx + 12, 10, sz - 1, 'minecraft:yellow_concrete'); F(sx - 1, 10, sz + 3, sx + 12, 10, sz + 3, 'minecraft:yellow_concrete'); F(sx - 1, 10, sz, sx - 1, 10, sz + 2, 'minecraft:yellow_concrete'); F(sx + 12, 10, sz, sx + 12, 10, sz + 2, 'minecraft:yellow_concrete')
  F(sx + 5, 8, sz - 2, sx + 6, 9, sz - 2, 'minecraft:white_concrete'); S(sx + 5, 9, sz - 2, 'minecraft:black_stained_glass')
  // mats d'eclairage du parc : fut, couronne, projecteurs eteints
  ;[[46, 41], [46, 101], [86, 21], [86, 61], [86, 101]].forEach(m => {
    F(m[0], 0, m[1], m[0], 24, m[1], 'minecraft:polished_deepslate_wall'); F(m[0] - 1, 25, m[1] - 1, m[0] + 1, 25, m[1] + 1, 'minecraft:polished_deepslate')
    ;[[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(o => S(m[0] + o[0] * 1, 24, m[1] + o[1] * 1, 'minecraft:lantern[hanging=true,waterlogged=false]'))
  })
  // bittes d'amarrage, defenses, aussières du cargo
  for (var z = 6; z <= 122; z += 10) { S(98, 0, z, 'minecraft:polished_blackstone_wall'); S(98, 1, z, 'minecraft:polished_blackstone_slab[type=bottom,waterlogged=false]') }
  // les deux portiques : le premier travaille au-dessus du cargo (conteneur suspendu), le second a la fleche levee
  lpPortique(30, 'red', false, 'blue'); lpPortique(76, 'red', true, null)
  lpCargo()
  // conteneurs poses sur le quai sous les portiques, cales
  lpCont(87, 0, 50, 'z', 'white', false); lpCont(91, 0, 50, 'z', 'green', true); lpCont(87, 3, 50, 'z', 'red', false)
  // rangee d'entrepots du parcours (x4..26) et batiments du sud
  lpEntrepot(4, 2, 26, 15, 13, 'brique', 'red')
  lpEntrepot(4, 18, 26, 29, 12, 'beton', 'blue')
  lpEntrepot(4, 33, 26, 44, 12, 'tole', 'green')
  lpEntrepot(4, 47, 26, 60, 10, 'brique', 'orange')
  lpEntrepot(4, 65, 26, 80, 9, 'enduit', 'cyan')
  // palier final (annexe a 6), puis caisses en gradins jusqu'au sol
  F(8, 0, 81, 22, 4, 84, 'minecraft:bricks'); F(9, 0, 81, 21, 3, 83, AIR); F(8, 5, 81, 22, 5, 84, 'minecraft:gray_concrete'); S(15, 0, 84, AIR); S(15, 1, 84, AIR)
  F(10, 0, 85, 12, 2, 86, 'minecraft:spruce_planks'); F(10, 3, 85, 10, 3, 86, 'minecraft:barrel[facing=up,open=false]'); F(13, 0, 85, 14, 0, 86, 'minecraft:barrel[facing=up,open=false]')
  // ruelle entre la rangee et la route : poubelles, cartons
  ;[[28, 9], [29, 31], [28, 52], [29, 70]].forEach(p => { S(p[0], 0, p[1], 'minecraft:green_terracotta'); S(p[0], 0, p[1] + 1, 'minecraft:green_terracotta'); SA(p[0], 1, p[1], 'supplementaries:sack') })
  // sud : capitainerie (bureaux a vigie) et hangar
  lpEntrepot(4, 92, 26, 123, 20, 'beton', 'white')
  F(10, 20, 100, 20, 23, 112, 'minecraft:white_concrete'); F(11, 20, 101, 19, 22, 111, AIR); F(10, 21, 100, 20, 22, 100, 'minecraft:gray_stained_glass_pane'); F(10, 21, 112, 20, 22, 112, 'minecraft:gray_stained_glass_pane'); F(10, 21, 101, 10, 22, 111, 'minecraft:gray_stained_glass_pane'); F(20, 21, 101, 20, 22, 111, 'minecraft:gray_stained_glass_pane'); F(9, 24, 99, 21, 24, 113, 'minecraft:smooth_stone_slab[type=bottom,waterlogged=false]')
  // herbe qui perce le bitume, flaques
  for (var i = 0; i < 260; i++) { var x = 28 + Math.floor(R() * 72), z = Math.floor(R() * 128); if (libreH(x, 0, z) && !libreH(x, -1, z)) { var r = R(); if (r < 0.5) { S(x, -1, z, 'minecraft:grass_block[snowy=false]'); SA(x, 0, z, 'minecraft:short_grass') } else if (r < 0.7) S(x, -1, z, 'minecraft:gravel') } }
  lxNettoyer(/(pane|_bars|fence|carpet|chain|lantern|_slab|grass|_wall|rail)/)
}

var QFIN_PORT = function () {
  HB2 = true; FIN = true; THM = null
  lot(function () { HM = {}; FIN_VOLET = null; FIN_RID = null; lpPort(); finAncrage() }, 0, 0, 999, 6701, 128, 60)
  HB2 = false; FIN = false; THM = null; HM = {}
}
function vuesPort2() {
  vue('p_ouverture', 0, 0, -24, 30, 64, 110, 10, 64)
  vue('p_quai', 0, 0, 95, 2, 124, 95, 14, 30)
  vue('p_portique', 0, 0, 90, 1.6, 66, 110, 24, 36)
  vue('p_cargo', 0, 0, 127, 2, 125, 112, 8, 60)
  vue('p_parc', 0, 0, 47, 2, 21, 84, 5, 21)
  vue('p_dessus', 0, 0, 150, 58, -20, 70, 0, 60)
  vue('k_depart', 0, 0, 15, 14.6, 4, 15, 9, 70)
  vue('k_grand_saut', 0, 0, 38, 11, 62, 15, 9, 62)
  vue('k_palier', 0, 0, 34, 4, 92, 15, 4, 80)
  vue('k_route', 0, 0, 40, 1.6, 2, 40, 4, 64)
}
