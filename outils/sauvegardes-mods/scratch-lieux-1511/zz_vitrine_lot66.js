// ================= LIEUX DU TRAILER (lot66, 14/11, v3 "pro") : centre commercial inonde (C35), camp des Goblini avec cage (C41) =================
// La sortie de Nid (C44) est sur le toit de l'immeuble H du pilote (lot65, hrNid).
// Echelle reelle : sol du lot a y-1, eau de crue y-2..-1 sur un fond a y-3. lbBruit (lot65) donne des taches organiques.
// Zero defaut (exigence Mika 14/11) : vitres cassees par colonnes entieres, lianes et lichens seulement sur appui plein,
// garde-corps poses a cote du platelage, et un nettoyage final retire tout bloc fin laisse sans voisin (feuilles, vitres, clotures).

var CM_EAU = 'minecraft:water', PREP_ZMAX = 256
// appui plein pour liane : ce qui a ete pose a cet endroit (HM) et qui offre une face pleine
function lxAppui(x, y, z) { var b = HM[hk(x, y, z)]; if (!b || b == AIR) return false; return !/(pane|_bars|fence|_slab|stairs|carpet|vine|lichen|door|trapdoor|water|_wall\b|_wall\[|lantern|chain|leaves|growths|sapling|bamboo\[|mushroom\b|cane|grass|fern|roots|rope|lily|_roof|skull|campfire)/.test(b) }
var LX_DIR = { north: [0, -1], south: [0, 1], east: [1, 0], west: [-1, 0] }
// liane accrochee : la premiere sur un appui plein, les suivantes pendent sous la meme face
function lxLiane(x, y, z, f, n) {
  var d = LX_DIR[f]; if (!lxAppui(x + d[0], y, z + d[1]) || !libreH(x, y, z)) return
  for (var i = 0; i < n; i++) { if (!libreH(x, y - i, z)) return; SA(x, y - i, z, 'minecraft:vine[east=' + (f == 'east') + ',north=' + (f == 'north') + ',south=' + (f == 'south') + ',up=false,west=' + (f == 'west') + ']') }
}
// nettoyage final : retire les blocs fins sans aucun voisin (le terrain y<=-1 compte comme plein)
function lxNettoyer(re) {
  for (var passe = 0; passe < 3; passe++) {
    var L = []
    for (var k in HM) { var b = HM[k]; if (b == AIR || !re.test(idDe(b))) continue; var p = k.split(','); L.push([p[0] - OX, p[1] - OY, p[2] - OZ]) }
    var n = 0
    L.forEach(e => {
      var x = e[0], y = e[1], z = e[2], v = 0
      ;[[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].forEach(o => { var yy = y + o[1]; if (yy <= -1 && o[1] < 0) { v++; return } if (!libreH(x + o[0], yy, z + o[2])) v++ })
      if (!v) { S(x, y, z, AIR); n++ }
    })
    if (!n) return
  }
}
function cmEnduit(x, y, z) { var n = lbBruit(x, y * 2 + z, 3.3), r = R(); return n > 1.1 ? 'minecraft:andesite' : n < -1.2 ? 'minecraft:cyan_terracotta' : r < 0.7 ? 'minecraft:light_gray_concrete' : 'minecraft:smooth_stone' }
// epave noyee : caisse sous l'eau, toit qui affleure (remplacee par un vehicule MTS a l'integration)
function cmEpave(x, z, ax, c) {
  function P(u, v, y, b) { if (ax == 'x') S(x + u, y, z + v, b); else S(x + v, y, z + u, b) }
  for (var u = 0; u < 5; u++) for (var v = 0; v < 3; v++) P(u, v, -2, R() < 0.25 ? 'minecraft:brown_terracotta' : 'minecraft:' + c + '_concrete')
  for (var u = 1; u < 4; u++) for (var v = 0; v < 3; v++) P(u, v, -1, v == 1 ? 'minecraft:' + c + '_terracotta' : 'minecraft:tinted_glass')
}
function cmMangrove(x, z, h) {
  for (var dx = -2; dx <= 2; dx++) for (var dz = -2; dz <= 2; dz++) if (Math.abs(dx) + Math.abs(dz) <= 2 && R() < 0.75) { S(x + dx, -2, z + dz, 'minecraft:mangrove_roots[waterlogged=true]'); if (Math.abs(dx) + Math.abs(dz) <= 1) S(x + dx, -1, z + dz, 'minecraft:mangrove_roots[waterlogged=true]') }
  F(x, 0, z, x, h, z, 'minecraft:mangrove_log[axis=y]')
  for (var dx = -3; dx <= 3; dx++) for (var dz = -3; dz <= 3; dz++) for (var dy = -1; dy <= 2; dy++) if (dx * dx + dz * dz + dy * dy * 2 <= 11 && R() < 0.9) SA(x + dx, h + dy, z + dz, 'minecraft:mangrove_leaves[distance=1,persistent=true,waterlogged=false]')
}
// vitre : sous la ligne d'eau, vitre grise noyee (pas de poche d'air dans la crue) ; au-dessus, le modele demande
function cmVitre(y, id) { return y <= -1 ? 'minecraft:light_gray_stained_glass_pane[waterlogged=true]' : (id || 'minecraft:light_gray_stained_glass_pane') }
// devanture d'une boutique (x1..x2 sur la ligne zf) : vitrine, porte, bandeau d'enseigne vide ; casse par colonnes entieres
// etat : 0 intacte, 1 vitrine crevee (colonnes centrales), 2 rideau de fer a moitie baisse, 3 tout souffle
function cmDevanture(x1, x2, zf, yb, yh, couleur, etat, face) {
  var milieu = Math.floor((x1 + x2) / 2)
  for (var x = x1; x <= x2; x++) {
    var porte = x == milieu || x == milieu + 1, casse = etat == 3 || (etat == 1 && Math.abs(x - milieu) <= 2 && !porte)
    for (var y = yb; y <= yh - 2; y++) {
      if (porte && y <= yb + 2) { S(x, y, zf, y <= -1 ? CM_EAU : AIR); continue }
      if (etat == 2 && y >= yh - 3) { S(x, y, zf, 'minecraft:iron_trapdoor[facing=' + face + ',half=top,open=true,powered=false,waterlogged=' + (y <= -1) + ']'); continue }
      S(x, y, zf, casse ? (y <= -1 ? CM_EAU : AIR) : cmVitre(y, porte ? 'create:framed_glass_pane' : null))
    }
    // bandeau : cadre clair, panneau de couleur sans aucun texte
    S(x, yh - 1, zf, 'minecraft:smooth_quartz'); S(x, yh, zf, x == x1 || x == x2 ? 'minecraft:smooth_quartz' : 'minecraft:' + couleur + '_concrete')
  }
}
// interieur de boutique a l'etage (sec) : mobilier selon le type, sur les rangees derriere la vitrine (dz = sens vers le fond)
function cmMeubler(x1, x2, zf, dz, y, type) {
  var f = dz > 0 ? 'north' : 'south', fb = dz > 0 ? 'south' : 'north'
  for (var x = x1; x <= x2; x++) for (var k = 1; k <= 7; k++) { var z = zf + dz * k; if (R() < 0.05) SA(x, y, z, choix(['minecraft:white_carpet', 'minecraft:light_gray_carpet'])) }
  if (type == 'mode') {
    for (var x = x1 + 1; x < x2; x += 2) S(x, y, zf + dz * 3, 'mcwfurnitures:spruce_wardrobe[facing=' + f + ']')
    S(x1 + 1, y, zf + dz * 1, 'handcrafted:spruce_table[color=none,shape=single,waterlogged=false]'); SA(x1 + 1, y + 1, zf + dz * 1, 'minecraft:white_carpet')
    S(x2 - 1, y, zf + dz * 6, 'handcrafted:spruce_counter[facing=' + f + ']')
  } else if (type == 'cafe') {
    for (var x = x1 + 1; x < x2; x += 3) { S(x, y, zf + dz * 2, 'handcrafted:oak_table[color=red,shape=single,waterlogged=false]'); SA(x, y, zf + dz * 1, 'handcrafted:oak_chair[color=none,facing=' + fb + ',waterlogged=false]'); SA(x, y, zf + dz * 3, 'handcrafted:oak_chair[color=none,facing=' + f + ',waterlogged=false]'); if (R() < 0.6) SA(x, y + 1, zf + dz * 2, 'handcrafted:white_cup') }
    for (var x = x1; x <= x2; x++) S(x, y, zf + dz * 5, 'handcrafted:oak_counter[facing=' + f + ']')
    SA(x1 + 1, y + 1, zf + dz * 5, 'farmersdelight:cutting_board[facing=' + f + ']')
  } else if (type == 'pharma') {
    for (var x = x1; x <= x2; x++) { S(x, y, zf + dz * 6, 'handcrafted:birch_shelf[facing=' + f + ']'); S(x, y + 1, zf + dz * 6, 'handcrafted:birch_shelf[facing=' + f + ']') }
    for (var x = x1 + 1; x < x2; x++) S(x, y, zf + dz * 3, 'handcrafted:birch_counter[facing=' + f + ']')
    SA(x1 + 2, y + 1, zf + dz * 3, 'supplementaries:jar'); SA(x2 - 1, y + 1, zf + dz * 3, 'supplementaries:jar')
  } else if (type == 'livres') {
    for (var x = x1; x <= x2; x++) { S(x, y, zf + dz * 6, 'mcwfurnitures:spruce_bookshelf[facing=' + f + ']'); S(x, y + 1, zf + dz * 6, 'mcwfurnitures:spruce_bookshelf[facing=' + f + ']') }
    S(x1 + 2, y, zf + dz * 3, 'mcwfurnitures:spruce_table'); SA(x1 + 2, y + 1, zf + dz * 3, 'supplementaries:book_pile'); SA(x2 - 1, y, zf + dz * 2, 'supplementaries:book_pile_horizontal')
  } else if (type == 'pille') {
    // boutique pillee : rayonnages renverses, cartons, sacs
    for (var i = 0; i < 6; i++) SA(x1 + Math.floor(R() * (x2 - x1 + 1)), y, zf + dz * (1 + Math.floor(R() * 6)), choix(['supplementaries:sack', 'minecraft:barrel[facing=north,open=true]', 'handcrafted:stackable_book', 'minecraft:barrel[facing=up,open=false]']))
    S(x1 + 1, y, zf + dz * 5, 'handcrafted:spruce_shelf[facing=' + f + ']')
  }
}

// ---------------- centre commercial inonde : galerie marchande sous verriere, deux grands magasins aux bouts, parking noye ----------------
function cmCentreInonde() {
  var N = 127
  function eE(x, z) { return Math.min(x, N - x, z, N - z) + lbBruit(x, z, 5.5) * 4 - 8 }
  // terrain : remblai, prairie haute, cuvette inondee aux rives naturelles
  F(0, -6, 0, N, -2, N, 'minecraft:dirt'); F(0, -1, 0, N, -1, N, 'minecraft:grass_block[snowy=false]')
  for (var x = 0; x <= N; x++) for (var z = 0; z <= N; z++) {
    var e = eE(x, z)
    if (e < -1) { if (R() < 0.25) SA(x, 0, z, choix(['minecraft:short_grass', 'minecraft:short_grass', 'minecraft:fern'])); continue }
    if (e < 1) {
      S(x, -1, z, lbBruit(x, z, 9) > 0 ? 'minecraft:mud' : 'minecraft:coarse_dirt')
      // canne a sucre seulement au bord d'une case d'eau (sinon elle tombe)
      var eau = eE(x + 1, z) >= 1 || eE(x - 1, z) >= 1 || eE(x, z + 1) >= 1 || eE(x, z - 1) >= 1
      if (eau && R() < 0.35) { S(x, -1, z, 'minecraft:mud'); SA(x, 0, z, 'minecraft:sugar_cane[age=0]'); SA(x, 1, z, 'minecraft:sugar_cane[age=0]') }
      continue
    }
    var parking = x >= 12 && x <= 115 && z >= 6 && z <= 31
    S(x, -3, z, parking ? (R() < 0.85 ? 'minecraft:gray_concrete' : 'minecraft:cracked_stone_bricks') : 'minecraft:mud')
    S(x, -2, z, CM_EAU); S(x, -1, z, CM_EAU)
    if (parking && z >= 9 && z <= 28 && (x - 12) % 4 == 0 && z != 18 && z != 19) S(x, -3, z, 'minecraft:white_concrete')
    if (lbBruit(x, z, 7) > 1.2 && R() < 0.5) SA(x, 0, z, 'minecraft:lily_pad'); else if (R() < 0.05) S(x, -2, z, 'minecraft:seagrass')
  }
  // parking : terre-plein central, ilots plantes, candelabres a deux lanternes
  for (var x = 14; x <= 113; x++) { S(x, -2, 18, 'minecraft:smooth_stone'); S(x, -2, 19, 'minecraft:smooth_stone') }
  ;[20, 40, 60, 80, 100].forEach(x => { F(x, -2, 18, x + 1, -1, 19, 'minecraft:moss_block'); F(x, 0, 18, x, 4, 18, 'minecraft:polished_deepslate_wall'); S(x, 5, 18, 'minecraft:polished_deepslate_slab[type=bottom,waterlogged=false]'); S(x, 4, 17, 'mcwlights:wall_lantern[facing=north]'); S(x, 4, 19, 'mcwlights:wall_lantern[facing=south]') })
  // gros oeuvre : 92 x 60 ; galerie centrale est-ouest sous verriere en berceau ; deux niveaux (fond y-3, etage y5, toit y11) ; magasins d'angle jusqu'a y18
  var X1 = 18, X2 = 109, Z1 = 36, Z2 = 95, GZ1 = 58, GZ2 = 73, EX1 = 60, EX2 = 67
  for (var x = X1; x <= X2; x++) for (var z = Z1; z <= Z2; z++) S(x, -3, z, (x + z) % 2 ? 'minecraft:smooth_quartz' : 'minecraft:light_gray_concrete')
  for (var x = X1; x <= X2; x++) for (var z = Z1; z <= Z2; z++) for (var y = -2; y <= 10; y++) if (x == X1 || x == X2 || z == Z1 || z == Z2) S(x, y, z, cmEnduit(x, y, z))
  for (var x = X1 + 1; x < X2; x++) for (var z = Z1 + 1; z < Z2; z++) { S(x, -2, z, CM_EAU); S(x, -1, z, CM_EAU) }
  F(X1 + 1, 5, Z1 + 1, X2 - 1, 5, Z2 - 1, 'minecraft:polished_andesite'); F(X1, 11, Z1, X2, 11, Z2, 'minecraft:smooth_stone')
  F(X1 + 1, 0, Z1 + 1, X2 - 1, 4, Z2 - 1, AIR); F(X1 + 1, 6, Z1 + 1, X2 - 1, 10, Z2 - 1, AIR)
  // acrotere a couvertine metallique, bandeaux de nez de dalle
  W(X1, Z1, X2, Z2, 12, 12, 'createdeco:andesite_sheet_metal'); F(X1, 5, Z1, X2, 5, Z1, 'minecraft:white_concrete'); F(X1, 11, Z1, X2, 11, Z1, 'minecraft:white_concrete')
  // grands magasins d'angle (x18..37 et x90..109), plus hauts : bandeaux, bardage, caisson d'enseigne vide, grande baie au rez-de-chaussee
  ;[[X1, 37], [90, X2]].forEach(m => {
    for (var x = m[0]; x <= m[1]; x++) for (var z = Z1; z <= Z2; z++) for (var y = 11; y <= 17; y++) if (x == m[0] || x == m[1] || z == Z1 || z == Z2) S(x, y, z, y == 14 ? 'minecraft:white_concrete' : (z == Z1 && y >= 15) ? 'createdeco:andesite_sheet_metal' : cmEnduit(x, y, z))
    F(m[0], 18, Z1, m[1], 18, Z2, 'minecraft:smooth_stone'); W(m[0], Z1, m[1], Z2, 19, 19, 'createdeco:andesite_sheet_metal')
    F(m[0] + 1, 11, Z1 + 1, m[1] - 1, 17, Z2 - 1, AIR); F(m[0] + 1, 11, Z1 + 1, m[1] - 1, 11, Z2 - 1, 'minecraft:polished_andesite')
    F(m[0] + 4, 13, Z1 - 1, m[1] - 4, 17, Z1 - 1, 'createdeco:iron_sheet_metal'); F(m[0] + 5, 14, Z1 - 1, m[1] - 5, 16, Z1 - 1, 'minecraft:red_concrete'); F(m[0] + 6, 15, Z1 - 1, m[1] - 6, 15, Z1 - 1, 'minecraft:light_gray_concrete')
    for (var x = m[0] + 2; x <= m[1] - 2; x++) for (var y = -2; y <= 3; y++) S(x, y, Z1, (x - m[0]) % 4 == 0 ? 'minecraft:smooth_quartz' : (m[0] == X1 && x >= m[0] + 9 && x <= m[0] + 15) ? (y <= -1 ? CM_EAU : AIR) : cmVitre(y))
  })
  // facade sur parking de la galerie (z = Z1) : poteaux saillants tous les 6, vitrines par travees (intactes, crevees ou soufflees), bardage et bandeau vitre a l'etage
  for (var x = 38; x <= 89; x++) {
    var t = Math.floor((x - 38) / 6), u = (x - 38) % 6, pot = u == 0, etat = [0, 1, 0, 3, 0, 2, 1, 0, 3][t % 9]
    if (x >= EX1 - 2 && x <= EX2 + 2) continue
    for (var y = -2; y <= 10; y++) {
      if (pot) { S(x, y, Z1, 'minecraft:smooth_quartz'); S(x, y, Z1 - 1, y == 5 ? 'minecraft:white_concrete' : 'minecraft:smooth_quartz'); continue }
      if (y <= 3) S(x, y, Z1, etat == 3 || (etat == 1 && u >= 2 && u <= 4) ? (y <= -1 ? CM_EAU : AIR) : (etat == 2 && y >= 2) ? 'minecraft:iron_trapdoor[facing=north,half=top,open=true,powered=false,waterlogged=false]' : cmVitre(y))
      else if (y == 4) S(x, y, Z1, 'createdeco:andesite_sheet_metal')
      else if (y >= 7 && y <= 8) S(x, y, Z1, etat == 3 && u <= 3 ? AIR : 'create:framed_glass_pane')
      else if (y != 5) S(x, y, Z1, 'createdeco:andesite_sheet_metal')
    }
  }
  // marquise en porte-a-faux (coupee au droit de l'entree), rive de tole, poteaux ; un bout arrache
  F(38, 5, Z1 - 4, 89, 5, Z1 - 2, 'minecraft:smooth_stone_slab[type=top,waterlogged=false]'); F(38, 6, Z1 - 4, 89, 6, Z1 - 4, 'createdeco:andesite_sheet_metal')
  F(EX1 - 2, 5, Z1 - 4, EX2 + 2, 6, Z1 - 2, AIR)
  for (var x = 38; x <= 89; x += 6) if (x < EX1 - 3 || x > EX2 + 3) F(x, -2, Z1 - 4, x, 4, Z1 - 4, 'minecraft:polished_deepslate_wall')
  for (var x = 74; x <= 82; x++) if (lbBruit(x, 3, 2) > 0.2) { S(x, 5, Z1 - 4, AIR); S(x, 6, Z1 - 4, AIR) }
  // entree principale : portique double hauteur en saillie (x58..69), mur-rideau vitre en partie creve, linteau, hall, couloir vers la galerie
  F(EX1 - 2, -2, Z1 - 3, EX1 - 1, 15, Z1, 'minecraft:white_concrete'); F(EX2 + 1, -2, Z1 - 3, EX2 + 2, 15, Z1, 'minecraft:white_concrete')
  F(EX1 - 2, 14, Z1 - 3, EX2 + 2, 15, Z1 - 3, 'minecraft:white_concrete'); F(EX1 - 2, 16, Z1 - 3, EX2 + 2, 16, Z1, 'createdeco:andesite_sheet_metal'); F(EX1, 14, Z1 - 2, EX2, 15, Z1, 'minecraft:smooth_stone')
  F(EX1, -2, Z1 - 2, EX2, -1, Z1, CM_EAU); F(EX1, 0, Z1 - 2, EX2, 13, Z1, AIR); F(EX1, -3, Z1 - 3, EX2, -3, Z1, 'minecraft:smooth_quartz')
  for (var x = EX1; x <= EX2; x++) for (var y = -2; y <= 13; y++) {
    var mont = (x - EX1) % 3 == 0, porte = y <= 1 && x >= EX1 + 2 && x <= EX2 - 2
    S(x, y, Z1 - 3, porte ? (y <= -1 ? CM_EAU : AIR) : (x >= EX1 + 5 && y >= 4 && y <= 9) ? AIR : cmVitre(y, mont ? 'createdeco:industrial_iron_window_pane' : 'create:framed_glass_pane'))
  }
  F(EX1, 0, Z1, EX2, 13, Z1 + 6, AIR); F(EX1, 11, Z1 + 1, EX2, 11, Z1 + 6, 'minecraft:smooth_stone'); F(EX1, 12, Z1 + 1, EX2, 13, Z1 + 1, 'minecraft:white_concrete')
  W(EX1 - 1, Z1 + 1, EX2 + 1, GZ1 - 2, -2, 10, 'minecraft:light_gray_concrete'); F(EX1, -2, Z1 + 1, EX2, -1, GZ1 - 1, CM_EAU); F(EX1, 0, Z1 + 1, EX2, 4, GZ1 - 1, AIR); F(EX1, 6, Z1 + 7, EX2, 10, GZ1 - 1, AIR)
  F(EX1, 5, Z1 + 7, EX2, 5, GZ1 - 1, 'minecraft:polished_andesite')
  for (var x = EX1; x <= EX2; x++) S(x, 6, Z1 + 7, 'minecraft:glass_pane')
  S(EX1 + 3, 10, Z1 + 3, 'mcwlights:iron_chandelier'); S(EX1 + 4, 10, Z1 + 3, 'mcwlights:iron_chandelier')
  // galerie : vide sur deux niveaux, garde-corps vitres a nez de quartz, verriere en berceau (arcs d'acier tous les 4, verre entre les arcs)
  F(38, 5, GZ1 + 2, 89, 5, GZ2 - 2, AIR); F(38, 11, GZ1, 89, 11, GZ2, AIR)
  for (var x = 38; x <= 89; x++) { S(x, 6, GZ1 + 1, 'create:framed_glass_pane'); S(x, 6, GZ2 - 1, 'create:framed_glass_pane'); S(x, 5, GZ1 + 1, 'minecraft:smooth_quartz'); S(x, 5, GZ2 - 1, 'minecraft:smooth_quartz') }
  var ARC = [[GZ1, 11], [GZ1 + 1, 12], [GZ1 + 2, 13], [GZ1 + 3, 14], [GZ1 + 4, 15], [GZ1 + 5, 15], [GZ1 + 6, 16], [GZ1 + 7, 16], [GZ1 + 8, 16], [GZ1 + 9, 16], [GZ1 + 10, 15], [GZ1 + 11, 15], [GZ1 + 12, 14], [GZ1 + 13, 13], [GZ1 + 14, 12], [GZ1 + 15, 11]]
  for (var x = 38; x <= 89; x++) {
    var arc = (x - 38) % 4 == 0, effondre = x >= 62 && x <= 77 && !arc, trou = x >= 50 && x <= 53
    ARC.forEach((a, i) => {
      if (arc) { S(x, a[1], a[0], 'minecraft:polished_deepslate'); if (i > 0 && ARC[i - 1][1] < a[1]) S(x, a[1] - 1, a[0], 'minecraft:polished_deepslate'); if (i < ARC.length - 1 && ARC[i + 1][1] < a[1]) S(x, a[1] - 1, a[0], 'minecraft:polished_deepslate') }
      else if (!effondre && !(trou && i >= 3 && i <= 12)) S(x, a[1], a[0], 'minecraft:light_gray_stained_glass')
    })
    if (!effondre) { S(x, 17, GZ1 + 7, 'minecraft:polished_deepslate_slab[type=bottom,waterlogged=false]'); S(x, 17, GZ1 + 8, 'minecraft:polished_deepslate_slab[type=bottom,waterlogged=false]') }
    // suspensions sous chaque arc (chaine + lanterne), sauf dans la travee effondree
    if (arc && !(x >= 62 && x <= 77)) { F(x, 12, GZ1 + 7, x, 15, GZ1 + 7, 'minecraft:chain[axis=y,waterlogged=false]'); S(x, 11, GZ1 + 7, 'minecraft:lantern[hanging=true,waterlogged=false]') }
  }
  // un arc plie dans l'eau, verre en eclats au fond
  for (var i = 0; i < 9; i++) S(66 + i, -2 + Math.floor(i / 3), GZ1 + 3 + i, 'minecraft:polished_deepslate')
  for (var i = 0; i < 40; i++) S(62 + Math.floor(R() * 16), -2, GZ1 + 2 + Math.floor(R() * 12), choix(['minecraft:light_gray_stained_glass', 'minecraft:polished_deepslate_slab[type=bottom,waterlogged=true]', 'minecraft:light_gray_concrete']))
  // escaliers mecaniques arretes : marches, joues pleines, main courante noire
  ;[[44, GZ1 + 3, 1], [83, GZ2 - 3, -1]].forEach(e => {
    for (var i = 0; i < 8; i++) {
      var wl = i < 2 ? 'true' : 'false', xx = e[0] + i * e[2]
      F(xx, -2 + i, e[1], xx, -2 + i, e[1] + 1, 'minecraft:polished_andesite_stairs[facing=' + (e[2] > 0 ? 'east' : 'west') + ',half=bottom,shape=straight,waterlogged=' + wl + ']')
      F(xx, -2, e[1] - 1, xx, -1 + i, e[1] - 1, 'minecraft:light_gray_concrete'); F(xx, -2, e[1] + 2, xx, -1 + i, e[1] + 2, 'minecraft:light_gray_concrete')
      S(xx, i, e[1] - 1, 'minecraft:black_concrete'); S(xx, i, e[1] + 2, 'minecraft:black_concrete')
    }
  })
  F(52, 5, GZ1 + 2, 53, 5, GZ1 + 4, 'minecraft:polished_andesite'); F(74, 5, GZ2 - 3, 75, 5, GZ2 - 2, 'minecraft:polished_andesite')
  F(52, 6, GZ1 + 1, 53, 6, GZ1 + 1, AIR); F(74, 6, GZ2 - 1, 75, 6, GZ2 - 1, AIR)
  // jardinieres : bacs de quartz qui sortent de l'eau, arbres qui ont monte jusqu'a la verriere
  ;[[47, GZ1 + 7], [81, GZ1 + 7]].forEach(j => {
    W(j[0] - 2, j[1] - 1, j[0] + 2, j[1] + 2, -2, 0, 'minecraft:smooth_quartz'); F(j[0] - 1, -2, j[1], j[0] + 1, -1, j[1] + 1, 'minecraft:dirt'); F(j[0] - 1, 0, j[1], j[0] + 1, 0, j[1] + 1, 'minecraft:moss_block')
    F(j[0], 1, j[1], j[0], 10, j[1], 'minecraft:birch_log[axis=y]')
    for (var dx = -3; dx <= 3; dx++) for (var dz = -3; dz <= 3; dz++) for (var dy = -2; dy <= 2; dy++) if (dx * dx + dz * dz + dy * dy * 2 <= 11 && R() < 0.85) SA(j[0] + dx, 10 + dy, j[1] + dz, 'minecraft:oak_leaves[distance=1,persistent=true,waterlogged=false]')
  })
  // kiosque au milieu de la galerie : socle et comptoir hors de l'eau, vitrine, auvent
  W(58, GZ1 + 6, 61, GZ1 + 9, -2, 0, 'minecraft:smooth_quartz'); F(59, -2, GZ1 + 7, 60, 0, GZ1 + 8, 'minecraft:light_gray_concrete')
  W(58, GZ1 + 6, 61, GZ1 + 9, 1, 2, 'create:framed_glass_pane'); F(58, 3, GZ1 + 6, 61, 3, GZ1 + 9, 'minecraft:smooth_quartz_slab[type=bottom,waterlogged=false]')
  F(58, 1, GZ1 + 7, 58, 2, GZ1 + 8, AIR)
  // boutiques des deux cotes de la galerie : cloisons, devantures a bandeau d'enseigne vide, deux niveaux, meublees a l'etage
  var P = [38, 45, 52, EX1 - 1, EX2 + 1, 75, 82, 89], COUL = ['red', 'blue', 'green', 'orange', 'cyan', 'yellow', 'purple', 'lime', 'black', 'white', 'pink', 'brown', 'magenta', 'light_blue']
  var TYPES = ['mode', 'cafe', 'pille', 'pharma', 'livres', 'mode', 'pille', 'cafe', 'livres', 'pharma', 'mode', 'pille', 'cafe', 'mode']
  ;[[Z1 + 1, GZ1 - 2, GZ1 - 1, -1, 'north'], [GZ2 + 2, Z2 - 1, GZ2 + 1, 1, 'south']].forEach((c, ci) => {
    P.forEach(px => { for (var y = -2; y <= 10; y++) if (y != 5) F(px, y, c[0], px, y, c[1], 'minecraft:light_gray_concrete') })
    for (var s = 0; s < P.length - 1; s++) {
      var a = P[s] + 1, b = P[s + 1] - 1; if (ci == 0 && a == EX1) continue
      var idx = ci * 7 + s, coul = COUL[idx % COUL.length], etatB = [0, 1, 3, 2, 0, 1, 3][(idx * 3) % 7], etatH = [2, 0, 1, 0, 3, 0, 1][(idx * 5) % 7]
      cmDevanture(a, b, c[2], -2, 4, coul, etatB, c[4])
      cmDevanture(a, b, c[2], 6, 10, COUL[(idx + 5) % COUL.length], etatH, c[4])
      cmMeubler(a, b, c[2], c[3], 6, TYPES[idx % TYPES.length])
      if (R() < 0.6) S(a + 1, -2, c[2] + c[3] * 3, 'minecraft:barrel[facing=up,open=false]')
    }
  })
  // effondrement de l'angle sud-est du grand magasin : toit et murs hauts tombes dans l'eau, fers a beton qui depassent
  var EF = []
  for (var x = 96; x <= X2; x++) for (var z = Z1 - 1; z <= 48; z++) {
    var cut = (x - 96) * 0.8 + (48 - z) * 0.6 + lbBruit(x, z, 8) * 2
    for (var y = 6; y <= 19; y++) if (y >= 19 - cut) S(x, y, z, AIR); else EF.push([x, y, z])
    if (cut > 4 && R() < 0.35) S(x, -2, z, choix(['minecraft:light_gray_concrete', 'minecraft:smooth_stone', 'minecraft:white_concrete', 'minecraft:cobblestone']))
  }
  EF.forEach(p => { [[1, 0, 0], [0, 0, -1], [0, 1, 0]].forEach(o => { var q = [p[0] + o[0], p[1] + o[1], p[2] + o[2]]; if (q[0] <= X2 && lxAppui(p[0], p[1], p[2]) && libreH(q[0], q[1], q[2]) && R() < 0.12) S(q[0], q[1], q[2], 'minecraft:iron_bars') }) })
  for (var i = 0; i < 22; i++) S(95 + Math.floor(R() * 16), -2, Z1 - 1 - Math.floor(R() * 5), choix(['minecraft:light_gray_concrete', 'minecraft:smooth_stone_slab[type=bottom,waterlogged=true]', 'minecraft:white_concrete']))
  // toits : centrales de traitement d'air (caisson, ventilateurs vers le ciel, gaine), mousse, arbustes et jeunes arbres
  ;[[44, 42], [56, 86], [80, 44], [84, 86], [26, 50], [100, 80]].forEach(p => {
    var y0 = p[0] < 38 || p[0] > 89 ? 19 : 12
    F(p[0], y0, p[1], p[0] + 3, y0 + 1, p[1] + 2, 'create:andesite_casing'); S(p[0] + 1, y0 + 2, p[1] + 1, 'create:encased_fan[facing=up]'); S(p[0] + 2, y0 + 2, p[1] + 1, 'create:encased_fan[facing=up]')
    F(p[0] + 4, y0, p[1] + 1, p[0] + 7, y0, p[1] + 1, 'create:fluid_pipe')
  })
  for (var x = X1 + 1; x < X2; x++) for (var z = Z1 + 1; z < Z2; z++) {
    var haut = x < 38 || x > 89, y0 = haut ? 19 : 12; if (!haut && z >= GZ1 && z <= GZ2) continue
    if (!libreH(x, y0, z) || libreH(x, y0 - 1, z)) continue
    var n = lbBruit(x, z, 6.6)
    if (n > 0.6) { S(x, y0 - 1, z, 'minecraft:moss_block'); if (R() < 0.35) SA(x, y0, z, choix(['minecraft:moss_carpet', 'minecraft:short_grass', 'minecraft:azalea', 'minecraft:fern'])) }
  }
  ;[[28, 46], [100, 88], [60, 84]].forEach(t => { var y0 = t[0] < 38 || t[0] > 89 ? 18 : 11; S(t[0], y0, t[1], 'minecraft:moss_block'); OY += y0 + 1; hrArbre(t[0], t[1], false); OY -= y0 + 1 })
  // lierre sur les facades (seulement depuis un appui plein), mangroves dans le parking, arbres sur les rives
  for (var x = X1; x <= X2; x++) if (lbBruit(x, 0, 2) > -0.2) lxLiane(x, x < 38 || x > 89 ? 17 : 10, Z1 - 2, 'south', 3 + Math.floor(R() * 8))
  for (var x = X1; x <= X2; x++) if (lbBruit(x, 5, 2.5) > 0.1) lxLiane(x, x < 38 || x > 89 ? 17 : 10, Z1 - 1, 'south', 2 + Math.floor(R() * 6))
  for (var z = Z1; z <= Z2; z++) { if (lbBruit(0, z, 3) > -0.3) lxLiane(X1 - 1, 17, z, 'east', 3 + Math.floor(R() * 10)); if (lbBruit(9, z, 4) > -0.3) lxLiane(X2 + 1, 17, z, 'west', 3 + Math.floor(R() * 10)) }
  ;[[16, 14, 7], [33, 26, 6], [54, 9, 8], [88, 25, 6], [108, 14, 7], [10, 70, 7], [116, 100, 6], [70, 108, 7], [30, 110, 6]].forEach(t => cmMangrove(t[0], t[1], t[2]))
  ;[[3, 50], [124, 40], [4, 120], [122, 122], [60, 124], [90, 3], [5, 5]].forEach(t => hrArbre(t[0], t[1], false))
  // pylone d'enseigne (vide) a l'entree du parking : fut de beton, caisson de tole, face sans texte, chapeau
  F(10, -2, 30, 11, 13, 30, 'minecraft:light_gray_concrete'); F(9, 14, 30, 12, 20, 30, 'createdeco:iron_sheet_metal'); F(10, 15, 30, 11, 19, 30, 'minecraft:red_concrete'); F(9, 21, 30, 12, 21, 30, 'minecraft:smooth_stone_slab[type=bottom,waterlogged=false]')
  cmEpave(14, 10, 'z', 'white'); cmEpave(22, 22, 'z', 'red'); cmEpave(38, 10, 'z', 'black'); cmEpave(50, 24, 'x', 'light_gray'); cmEpave(70, 10, 'z', 'blue'); cmEpave(86, 22, 'z', 'white'); cmEpave(98, 10, 'z', 'gray')
  lxNettoyer(/(leaves|pane|_bars|fence|vine|lichen|carpet|chain|lantern|_slab|cane|lily|grass|fern|azalea)/)
}

// ---------------- camp des Goblini : plates-formes noyees dans la canopee de grands arbres, cage a dinosaure au sol ----------------
var GB_F = 'minecraft:jungle_leaves[distance=1,persistent=true,waterlogged=false]', GB_C = 'minecraft:oak_leaves[distance=1,persistent=true,waterlogged=false]'
function gbBambou(x, z, h) { for (var y = 0; y < h; y++) SA(x, y, z, 'minecraft:bamboo[age=1,leaves=' + (y >= h - 1 ? 'large' : y >= h - 3 ? 'small' : 'none') + ',stage=0]') }
function gbBoule(x, y, z, r, f) { for (var dx = -r; dx <= r; dx++) for (var dz = -r; dz <= r; dz++) for (var dy = -2; dy <= 2; dy++) if (dx * dx + dz * dz + dy * dy * 3 <= r * r + 1 && R() < 0.92) SA(x + dx, y + dy, z + dz, f || GB_F) }
// grand arbre : tronc 2x2, contreforts, branches a mi-hauteur avec couronnes basses (qui cachent les plates-formes), couronne haute large
function gbArbre(x, z, h, branches) {
  F(x, -1, z, x + 1, h, z + 1, 'minecraft:jungle_log[axis=y]')
  ;[[-1, 0, 'x'], [2, 1, 'x'], [0, -1, 'z'], [1, 2, 'z'], [-2, 0, 'x'], [3, 1, 'x']].forEach((c, i) => { var hh = i < 4 ? 2 + Math.floor(R() * 2) : 0; F(x + c[0], 0, z + c[1], x + c[0], hh, z + c[1], 'minecraft:jungle_log[axis=y]') })
  ;(branches || []).forEach(b => {
    var dx = b[0], dz = b[1], L = b[2], y = b[3]
    for (var i = 1; i <= L; i++) {
      var bx = x + (dx > 0 ? 1 : 0) + dx * i, by = y + Math.floor(i / 3), bz = z + (dz > 0 ? 1 : 0) + dz * i
      S(bx, by, bz, 'minecraft:jungle_log[axis=' + (dx != 0 ? 'x' : 'z') + ']')
      if (i % 3 == 2) S(bx, by + 1, bz, 'minecraft:jungle_log[axis=y]')
    }
    var ex = x + (dx > 0 ? 1 : 0) + dx * L, ez = z + (dz > 0 ? 1 : 0) + dz * L, ey = y + Math.floor(L / 3)
    gbBoule(ex, ey + 2, ez, 4)
  })
  for (var dx = -8; dx <= 9; dx++) for (var dz = -8; dz <= 9; dz++) for (var dy = -2; dy <= 3; dy++) { var ex = dx - 0.5, ez = dz - 0.5, r2 = ex * ex + ez * ez; if (r2 + dy * dy * 6 <= 70 + lbBruit(x + dx, z + dz, 1) * 10 && R() < 0.93) SA(x + dx, h + dy, z + dz, GB_F) }
}
// lianes du tronc et des branches : posees apres tout le bois, seulement sur le bois
function gbLianes(x, z, h, branches) {
  for (var y = 1; y < h - 3; y += 1 + Math.floor(R() * 4)) { lxLiane(x - 1, y + 3, z + 1, 'east', 1 + Math.floor(R() * 3)); lxLiane(x + 2, y + 3, z, 'west', 1 + Math.floor(R() * 3)) }
  ;(branches || []).forEach(b => {
    var dx = b[0], dz = b[1], L = b[2], y = b[3]
    for (var i = 2; i <= L; i++) {
      if (R() > 0.5) continue
      var bx = x + (dx > 0 ? 1 : 0) + dx * i, by = y + Math.floor(i / 3), bz = z + (dz > 0 ? 1 : 0) + dz * i
      if (dx != 0) lxLiane(bx, by, bz - 1, 'south', 2 + Math.floor(R() * 6)); else lxLiane(bx - 1, by, bz, 'east', 2 + Math.floor(R() * 6))
    }
  })
}
// plate-forme : solives de rondins en rive, platelage melange, garde-corps de bambou pose SUR la rive, poteaux d'angle a lanterne, jambes de force
function gbPlateforme(x, z, y, r, sorties) {
  for (var dx = -r; dx <= r + 1; dx++) for (var dz = -r; dz <= r + 1; dz++) {
    if ((dx == 0 || dx == 1) && (dz == 0 || dz == 1)) continue
    var bordX = dx == -r || dx == r + 1, bordZ = dz == -r || dz == r + 1
    if (bordX || bordZ) S(x + dx, y, z + dz, 'minecraft:stripped_jungle_log[axis=' + (bordZ ? 'x' : 'z') + ']')
    else S(x + dx, y, z + dz, lbBruit(x + dx, z + dz, 3) > 0.8 ? 'minecraft:spruce_planks' : lbBruit(x + dx, z + dz, 5) > 1 ? 'minecraft:jungle_planks' : 'minecraft:bamboo_planks')
    if ((bordX || bordZ) && !(sorties || []).some(s => Math.abs(s[0] - (x + dx)) <= 1 && Math.abs(s[1] - (z + dz)) <= 1)) S(x + dx, y + 1, z + dz, 'minecraft:bamboo_fence')
  }
  ;[[-r, -r], [r + 1, -r], [-r, r + 1], [r + 1, r + 1]].forEach(c => { F(x + c[0], y - 3, z + c[1], x + c[0], y - 1, z + c[1], 'minecraft:stripped_jungle_log[axis=y]'); S(x + c[0], y + 1, z + c[1], 'minecraft:stripped_jungle_log[axis=y]'); S(x + c[0], y + 2, z + c[1], 'minecraft:lantern[hanging=false,waterlogged=false]') })
}
// hutte de recuperation : poteaux d'angle, murs de bambou, planches, toles et baches recuperees ; toit de chaume a deux pans ; volets de bambou
function gbHutte(x, z, y, w, d, porte) {
  for (var dx = 0; dx < w; dx++) for (var dz = 0; dz < d; dz++) {
    if (!(dx == 0 || dx == w - 1 || dz == 0 || dz == d - 1)) continue
    var coin = (dx == 0 || dx == w - 1) && (dz == 0 || dz == d - 1)
    for (var yy = y + 1; yy <= y + 3; yy++) {
      var n = lbBruit((x + dx) * 1.7, yy * 2 + (z + dz), 2.2)
      S(x + dx, yy, z + dz, coin ? 'minecraft:stripped_jungle_log[axis=y]' : n > 1 ? 'createdeco:iron_sheet_metal' : n > 0.3 ? 'minecraft:spruce_planks' : n < -1.1 ? 'minecraft:brown_wool' : 'minecraft:bamboo_block[axis=y]')
    }
  }
  F(x + 1, y + 1, z + 1, x + w - 2, y + 3, z + d - 2, AIR)
  S(x + porte[0], y + 1, z + porte[1], AIR); S(x + porte[0], y + 2, z + porte[1], AIR)
  var fx = x + Math.floor(w / 2)
  if (porte[1] != 0) { S(fx, y + 2, z, 'minecraft:bamboo_trapdoor[facing=south,half=top,open=true,powered=false,waterlogged=false]') }
  if (porte[1] != d - 1) { S(fx, y + 2, z + d - 1, 'minecraft:bamboo_trapdoor[facing=north,half=top,open=true,powered=false,waterlogged=false]') }
  // sablieres sur les grands cotes, puis toit de chaume a deux pans (faitage selon z) avec debord, pignons en planches
  F(x, y + 4, z, x, y + 4, z + d - 1, 'minecraft:bamboo_planks'); F(x + w - 1, y + 4, z, x + w - 1, y + 4, z + d - 1, 'minecraft:bamboo_planks')
  F(x, y + 4, z, x + w - 1, y + 4, z, 'minecraft:bamboo_planks'); F(x, y + 4, z + d - 1, x + w - 1, y + 4, z + d - 1, 'minecraft:bamboo_planks')
  var demi = Math.floor(w / 2) + 1
  for (var k = 0; k < demi; k++) for (var dz = -1; dz <= d; dz++) {
    var g = x - 1 + k, dd = x + w - k
    if (g > dd) continue
    if (k > 0 && (dz == 0 || dz == d - 1) && g + 1 <= dd - 1) F(g + 1, y + 4 + k, z + dz, dd - 1, y + 4 + k, z + dz, 'minecraft:bamboo_planks')
    S(g, y + 4 + k, z + dz, 'mcwroofs:thatch_roof[facing=east,half=bottom,shape=straight]')
    if (dd != g) S(dd, y + 4 + k, z + dz, 'mcwroofs:thatch_roof[facing=west,half=bottom,shape=straight]')
  }
  if (w % 2 == 1) for (var dz = -1; dz <= d; dz++) S(x + Math.floor(w / 2), y + 4 + demi - 1, z + dz, 'mcwroofs:thatch_top_roof')
  // interieur : couchage de peaux, reserve
  F(x + 1, y + 1, z + d - 2, x + w - 2, y + 1, z + d - 2, 'minecraft:brown_carpet'); S(x + 1, y + 1, z + 1, 'minecraft:barrel[facing=up,open=false]'); SA(x + w - 2, y + 1, z + 1, 'farmersdelight:rice_bag')
}
// passerelle : platelage d'un bloc (dalles basses, une traverse de rondin tous les 4), garde-corps de bambou a la meme hauteur des deux cotes, flechissement
function gbPasserelle(x1, z1, x2, z2, y) {
  var n = Math.max(Math.abs(x2 - x1), Math.abs(z2 - z1)), lx = Math.abs(x2 - x1) >= Math.abs(z2 - z1)
  for (var i = 0; i <= n; i++) {
    var t = i / n, x = Math.round(x1 + (x2 - x1) * t), z = Math.round(z1 + (z2 - z1) * t), s = Math.round(Math.sin(t * Math.PI) * 1.4)
    S(x, y - s, z, i % 4 == 2 ? 'minecraft:stripped_jungle_log[axis=' + (lx ? 'z' : 'x') + ']' : 'minecraft:spruce_slab[type=bottom,waterlogged=false]')
    var a = lx ? [x, z - 1] : [x - 1, z], b = lx ? [x, z + 1] : [x + 1, z]
    if (i > 0 && i < n) { S(a[0], y - s, a[1], 'minecraft:bamboo_fence'); S(b[0], y - s, b[1], 'minecraft:bamboo_fence') }
  }
}
function gbCamp() {
  var N = 79
  F(0, -6, 0, N, -2, N, 'minecraft:dirt')
  for (var x = 0; x <= N; x++) for (var z = 0; z <= N; z++) { var n = lbBruit(x, z, 2.7); S(x, -1, z, n > 0.9 ? 'minecraft:moss_block' : n < -1.1 ? 'minecraft:coarse_dirt' : n < -0.6 ? 'minecraft:rooted_dirt' : 'minecraft:podzol[snowy=false]') }
  // sentiers battus entre le pied des echelles, le foyer et la cage
  function sentier(ax, az, bx, bz) { var n = Math.max(Math.abs(bx - ax), Math.abs(bz - az)); for (var i = 0; i <= n; i++) { var x = Math.round(ax + (bx - ax) * i / n), z = Math.round(az + (bz - az) * i / n); S(x, -1, z, 'minecraft:dirt_path'); if (R() < 0.5) S(x + 1, -1, z, 'minecraft:coarse_dirt') } }
  sentier(19, 18, 20, 31); sentier(27, 50, 21, 37); sentier(23, 34, 30, 31)
  var ARB = [[16, 16, 30, [[-1, 0, 6, 16], [0, -1, 5, 19], [1, 0, 5, 18]]], [44, 12, 28, [[0, -1, 5, 17], [1, 0, 6, 16]]], [58, 40, 31, [[1, 0, 6, 17], [0, 1, 5, 16], [0, -1, 4, 19]]],
    [24, 50, 29, [[-1, 0, 5, 17], [0, 1, 6, 16]]], [10, 68, 27, [[0, 1, 5, 16]]], [52, 66, 28, [[1, 0, 5, 17], [-1, 0, 4, 18]]], [70, 14, 26, [[0, 1, 5, 16]]], [48, 30, 27, [[-1, 0, 7, 12]]]]
  ARB.forEach(a => gbArbre(a[0], a[1], a[2], a[3]))
  // plates-formes a y14, huttes sous les feuilles, passerelles
  gbPlateforme(16, 16, 14, 4, [[21, 15], [17, 21]]); gbHutte(12, 12, 14, 5, 4, [2, 3])
  gbPlateforme(58, 40, 14, 4, [[57, 36], [54, 42]]); gbHutte(60, 42, 14, 4, 4, [0, 2])
  gbPlateforme(24, 50, 14, 4, [[29, 49], [23, 46]]); gbHutte(20, 51, 14, 4, 4, [3, 2])
  gbPlateforme(44, 12, 14, 3, [[41, 13], [46, 16]])
  gbPasserelle(21, 15, 41, 13, 14); gbPasserelle(46, 16, 57, 35, 14); gbPasserelle(53, 42, 29, 49, 14); gbPasserelle(17, 21, 23, 45, 14)
  for (var y = 0; y < 14; y++) { S(18, y, 16, 'minecraft:ladder[facing=east,waterlogged=false]'); S(26, y, 51, 'minecraft:ladder[facing=east,waterlogged=false]') }
  F(18, 14, 16, 18, 15, 16, AIR); F(26, 14, 51, 26, 15, 51, AIR)
  // treuil de la plate-forme ouest : potence de rondins, chaine jusqu'au sol, panier
  S(13, 15, 20, 'minecraft:stripped_jungle_log[axis=y]'); S(13, 16, 20, 'minecraft:stripped_jungle_log[axis=y]'); F(11, 17, 20, 13, 17, 20, 'minecraft:stripped_jungle_log[axis=x]')
  F(11, 1, 20, 11, 16, 20, 'minecraft:chain[axis=y,waterlogged=false]'); S(11, 0, 20, 'farmersdelight:wooden_basket')
  // vigie dans la couronne du grand arbre : plancher, garde-corps, echelle, lanterne
  F(55, 28, 37, 62, 30, 44, AIR); F(56, 27, 38, 61, 27, 43, 'minecraft:bamboo_planks'); W(56, 38, 61, 43, 28, 28, 'minecraft:bamboo_fence'); F(58, 27, 40, 59, 29, 41, 'minecraft:jungle_log[axis=y]')
  for (var y = 15; y < 27; y++) S(60, y, 40, 'minecraft:ladder[facing=east,waterlogged=false]'); S(60, 27, 40, 'minecraft:ladder[facing=east,waterlogged=false]')
  S(56, 28, 38, 'minecraft:lantern[hanging=false,waterlogged=false]')
  // cage a dinosaure renforcee : poteaux de rondins tous les 3, barreaux avec lisse de fer industriel, lisse haute et barbele, porte barree cote camp
  var C1 = 32, C2 = 46, D1 = 24, D2 = 38, HC = 8
  for (var x = C1; x <= C2; x++) for (var z = D1; z <= D2; z++) {
    var bx = x == C1 || x == C2, bz = z == D1 || z == D2
    if (bx || bz) {
      var pot = (bz && (x - C1) % 3 == 0) || (bx && (z - D1) % 3 == 0) || ((x == C1 || x == C2) && bz)
      for (var y = 0; y < HC; y++) S(x, y, z, pot ? 'minecraft:stripped_jungle_log[axis=y]' : y == 3 ? 'createdeco:industrial_iron_bars' : 'minecraft:iron_bars')
      S(x, -1, z, 'minecraft:cobblestone')
    } else { S(x, -1, z, lbBruit(x, z, 4) > 0 ? 'minecraft:coarse_dirt' : 'minecraft:mud'); if (R() < 0.05) SA(x, 0, z, choix(['minecraft:hay_block[axis=y]', 'minecraft:bone_block[axis=x]', 'minecraft:bone_block[axis=z]'])) }
  }
  for (var x = C1; x <= C2; x++) { S(x, HC, D1, 'minecraft:stripped_jungle_log[axis=x]'); S(x, HC, D2, 'minecraft:stripped_jungle_log[axis=x]'); if (x % 2 == 0) { SA(x, HC + 1, D1, 'simply_traps:circular_barbed_wire_iron'); SA(x, HC + 1, D2, 'simply_traps:circular_barbed_wire_iron') } }
  for (var z = D1; z <= D2; z++) { S(C1, HC, z, 'minecraft:stripped_jungle_log[axis=z]'); S(C2, HC, z, 'minecraft:stripped_jungle_log[axis=z]') }
  for (var z = D1 + 2; z < D2; z += 3) F(C1, HC, z, C2, HC, z, 'minecraft:stripped_jungle_log[axis=x]')
  // porte : vantail de planches cerclees, chaines, poutre de blocage en travers sur deux poteaux
  F(C1, 0, 29, C1, 5, 33, 'minecraft:spruce_planks'); for (var y = 0; y <= 5; y += 2) F(C1, y, 29, C1, y, 33, 'minecraft:stripped_spruce_log[axis=z]')
  F(C1 - 1, 0, 28, C1 - 1, 4, 28, 'minecraft:stripped_jungle_log[axis=y]'); F(C1 - 1, 0, 34, C1 - 1, 4, 34, 'minecraft:stripped_jungle_log[axis=y]')
  F(C1 - 1, 4, 29, C1 - 1, 4, 33, 'minecraft:stripped_jungle_log[axis=z]'); F(C1 - 1, 2, 29, C1 - 1, 2, 33, 'minecraft:chain[axis=z,waterlogged=false]')
  // interieur de la cage : abreuvoir, foin, os
  S(C2 - 2, 0, D2 - 2, 'minecraft:water_cauldron[level=3]'); S(C2 - 3, 0, D2 - 2, 'minecraft:hay_block[axis=y]'); S(C2 - 3, 1, D2 - 2, 'minecraft:hay_block[axis=y]'); S(C2 - 2, 0, D2 - 3, 'minecraft:hay_block[axis=x]')
  // camp au sol : foyer eteint (le trailer amene le feu), marmite, bancs de rondins, etabli, caisses de vivres, sacs
  for (var a = 0; a < 8; a++) S(20 + Math.round(Math.cos(a * Math.PI / 4) * 2), -1, 34 + Math.round(Math.sin(a * Math.PI / 4) * 2), 'minecraft:cobblestone')
  S(20, -1, 34, 'minecraft:coarse_dirt'); S(20, 0, 34, 'minecraft:campfire[facing=north,lit=false,signal_fire=false,waterlogged=false]'); S(21, 0, 34, 'farmersdelight:cooking_pot')
  F(16, 0, 32, 16, 0, 34, 'minecraft:stripped_jungle_log[axis=z]'); F(24, 0, 34, 24, 0, 36, 'minecraft:stripped_jungle_log[axis=z]'); F(19, 0, 30, 21, 0, 30, 'minecraft:stripped_jungle_log[axis=x]')
  S(14, 0, 37, 'minecraft:crafting_table'); S(15, 0, 37, 'minecraft:smithing_table'); S(14, 0, 36, 'minecraft:anvil[facing=north]')
  S(14, 0, 39, 'farmersdelight:potato_crate'); S(15, 0, 39, 'farmersdelight:carrot_crate'); S(14, 0, 40, 'minecraft:barrel[facing=up,open=true]'); SA(15, 1, 39, 'supplementaries:sack')
  S(26, 0, 30, 'farmersdelight:rice_bag'); S(27, 0, 30, 'minecraft:barrel[facing=up,open=false]'); S(27, 0, 31, 'supplementaries:sack'); S(26, 0, 29, 'farmersdelight:cabbage_crate')
  // sechoir a peaux : cadre de bambou, peaux tendues
  F(22, 0, 40, 22, 2, 40, 'minecraft:bamboo_fence'); F(26, 0, 40, 26, 2, 40, 'minecraft:bamboo_fence'); F(22, 3, 40, 26, 3, 40, 'minecraft:stripped_bamboo_block[axis=x]'); F(23, 1, 40, 25, 2, 40, 'minecraft:brown_wool')
  // cranes sur des piquets en limite du camp : avertissement
  ;[[30, 21], [30, 41], [12, 42]].forEach(p => { F(p[0], 0, p[1], p[0], 1, p[1], 'minecraft:bamboo_fence'); S(p[0], 2, p[1], 'minecraft:skeleton_skull[rotation=' + Math.floor(R() * 16) + ']') })
  // lianes, une fois tout le bois en place
  ARB.forEach(a => gbLianes(a[0], a[1], a[2], a[3]))
  // sous-bois : bosquets de bambous serres, buissons de feuilles, fougeres ; le camp n'est visible que de l'interieur
  function libre(x, z) { return !(x >= C1 - 2 && x <= C2 + 2 && z >= D1 - 2 && z <= D2 + 2) && !(x >= 11 && x <= 28 && z >= 28 && z <= 42) && !(x >= 10 && x <= 19 && z >= 14 && z <= 21) && !(x >= 22 && x <= 27 && z >= 48 && z <= 53) }
  for (var x = 0; x <= N; x++) for (var z = 0; z <= N; z++) {
    if (!libre(x, z) || !libreH(x, 0, z) || /dirt_path/.test(HM[hk(x, -1, z)] || '')) continue
    var n = lbBruit(x * 1.3, z * 1.3, 0.4), bordure = Math.min(x, N - x, z, N - z) < 9
    if ((n > 0.7 || (bordure && n > -0.2)) && R() < 0.55) gbBambou(x, z, 9 + Math.floor(R() * 8))
    else if (n < -0.9 && R() < 0.5) { SA(x, 0, z, GB_C); if (R() < 0.4) SA(x, 1, z, GB_C) }
    else if (R() < 0.35) SA(x, 0, z, choix(['minecraft:fern', 'minecraft:fern', 'minecraft:short_grass', 'minecraft:moss_carpet']))
  }
  lxNettoyer(/(leaves|_bars|fence|vine|carpet|chain|lantern|_slab|grass|fern|skull)/)
}

var QFIN_LIEUX = function () {
  HB2 = true; FIN = true; THM = THM_HF
  lot(function () { HM = {}; FIN_VOLET = null; FIN_RID = null; hrPilote(); lxNettoyer(/leaves/); finAncrage() }, 0, 0, 999, 6501, 128, 44)
  THM = null
  lot(function () { HM = {}; FIN_VOLET = null; FIN_RID = null; cmCentreInonde(); finAncrage() }, 160, 0, 999, 3502, 128, 30)
  lot(function () { HM = {}; FIN_VOLET = null; FIN_RID = null; gbCamp(); finAncrage() }, 160, 160, 999, 4102, 80, 40)
  HB2 = false; FIN = false; THM = null; HM = {}
}
function vuesLieux() {
  vue('n_nid_face', 0, 0, 117.5, 27.6, 75, 117.5, 28.5, 84)
  vue('n_nid_trois_quarts', 0, 0, 128, 30, 76, 117, 27, 86)
  vue('n_nid_dos', 0, 0, 125, 31, 98, 117, 27, 86)
  vue('n_nid_toit', 0, 0, 108, 38, 77, 117, 31, 86)
  vue('c_paysage', 160, 0, -20, 30, -24, 64, 4, 60)
  vue('c_ras_eau', 160, 0, 40, 0.5, 15, 64, 6, 40)
  vue('c_entree', 160, 0, 64, 2, 12, 64, 6, 36)
  vue('c_galerie', 160, 0, 40, 7.6, 65.5, 88, 6, 65.5)
  vue('c_galerie_eau', 160, 0, 86, 0.6, 62, 40, 6, 66)
  vue('c_effondrement', 160, 0, 122, 10, 24, 100, 8, 42)
  vue('g_sol_cage', 160, 160, 14, 1.6, 31, 38, 3, 31)
  vue('g_plateformes', 160, 160, 38, 10, 70, 30, 15, 30)
  vue('g_hutte', 160, 160, 23, 18, 7, 14, 17, 14)
  vue('g_lisiere', 160, 160, -10, 6, 40, 30, 10, 38)
  vue('g_dessus', 160, 160, 40, 55, -14, 40, 6, 40)
}
