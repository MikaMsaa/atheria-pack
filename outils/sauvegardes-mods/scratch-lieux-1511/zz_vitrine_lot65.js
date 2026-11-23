// ================= REFONTE A L'ECHELLE REELLE (lot65, 13/11) : pilote, rue haussmannienne de Mamoudzou =================
// Echelle calee sur les vehicules (3 de large) : rez-de-chaussee 5 de plancher a plancher, etages 4, rues de 24.
// Lieux du trailer : rue droite + terrasses + marche (1), boutique (2), carrefour + immeuble a edicule (9),
// suite de toits pour la fuite (10), toit avec sortie de Nid (11).
var HR = {
  M: 'minecraft:smooth_sandstone', B: 'minecraft:cut_sandstone', C: 'minecraft:chiseled_sandstone',
  MS: 'minecraft:smooth_sandstone_stairs', MSL: 'minecraft:smooth_sandstone_slab',
  Z: 'minecraft:deepslate_tiles', ZS: 'minecraft:deepslate_tile_stairs', ZSL: 'minecraft:deepslate_tile_slab',
  FER: 'mcwfences:ornate_metal_fence', BR: 'minecraft:bricks', PL: 'minecraft:spruce_planks', TO: 'minecraft:smooth_stone'
}
function hrY(k) { return k <= 0 ? 0 : 5 + 4 * (k - 1) }   // plancher de l'etage k
function hrVitre() { var r = R(); return r < 0.18 ? AIR : r < 0.28 ? 'minecraft:light_gray_stained_glass_pane' : GP }

// ---------------- immeuble ----------------
// o : x1 z1 x2 z2 (emprise, murs compris), face 'south' | 'north', n etages (rdc compris), toit 'mansarde' | 'plat',
//     acrotere, edicule, porteOuverte, boutiques [[u1, u2, type]], nid, mat (pierre de facade)
function hrImm(o) {
  var x1 = o.x1, x2 = o.x2, z1 = o.z1, z2 = o.z2, n = o.n, R0 = hrY(n), M = o.mat || HR.M
  var fz = o.face == 'south' ? z2 : z1, out = o.face == 'south' ? 1 : -1, L = x2 - x1 + 1
  var fu = u => x1 + u                                     // u le long de la facade
  // gros oeuvre : murs, planchers, toit
  W(x1, z1, x2, z2, 0, R0 - 1, M)
  F(x1 + 1, 0, z1 + 1, x2 - 1, 0, z2 - 1, 'minecraft:polished_andesite')
  for (var k = 1; k < n; k++) F(x1 + 1, hrY(k), z1 + 1, x2 - 1, hrY(k), z2 - 1, HR.PL)
  F(x1, R0, z1, x2, R0, z2, HR.B)
  F(x1 + 1, 1, z1 + 1, x2 - 1, R0 - 1, z2 - 1, AIR)
  for (var k = 1; k < n; k++) F(x1 + 1, hrY(k), z1 + 1, x2 - 1, hrY(k), z2 - 1, HR.PL)
  // cage d'escalier (4 x 6) au fond, montee en s'eloignant de la facade
  var cx = x1 + Math.floor(L / 2) - 2, dz = -out, cz = fz + dz * 8
  var cg = (a, b) => [cx + a, cz + dz * b], fa = dz > 0 ? 'south' : 'north', fb = dz > 0 ? 'north' : 'south'
  function cS(a, y, b, bl) { var p = cg(a, b); S(p[0], y, p[1], bl) }
  for (var k = 0; k < n; k++) {
    var y = hrY(k), h = hrY(k + 1) - y, a = Math.ceil(h / 2), bb = h - a
    for (var aa = 0; aa < 4; aa++) for (var b = 1; b <= 4; b++) for (var yy = y + 1; yy <= hrY(k + 1); yy++) cS(aa, yy, b, AIR)
    for (var i = 0; i < a; i++) for (var aa = 0; aa < 2; aa++) cS(aa, y + 1 + i, 1 + i, 'minecraft:spruce_stairs[facing=' + fa + ',half=bottom,shape=straight]')
    for (var aa = 0; aa < 4; aa++) cS(aa, y + a, 1 + a, HR.PL)
    for (var j = 0; j < bb; j++) for (var aa = 2; aa < 4; aa++) cS(aa, y + a + 1 + j, a - j, 'minecraft:spruce_stairs[facing=' + fb + ',half=bottom,shape=straight]')
    // murs de cage (cotes et fond), rampe le long de la tremie
    for (var yy = y + 1; yy < hrY(k + 1) || (k == n - 1 && yy <= R0 + 3); yy++) { for (var b = 0; b <= 5; b++) { cS(-1, yy, b, M); cS(4, yy, b, M) } for (var aa = -1; aa <= 4; aa++) cS(aa, yy, 5, M) }
    if (k > 0) for (var aa = 0; aa < 2; aa++) cS(aa, y + 1, 0, AIR)
    // portes palieres vers les deux logements
    if (k > 0) { var p = cg(-1, 0); PORTE(p[0], y + 1, p[1], 'mcwdoors:spruce_classic_door', 'west', 'left', R() < 0.4 ? 'true' : 'false'); p = cg(4, 0); PORTE(p[0], y + 1, p[1], 'mcwdoors:spruce_classic_door', 'east', 'right', R() < 0.4 ? 'true' : 'false') }
    S(cg(2, 0)[0], hrY(k + 1) - 1, cg(2, 0)[1], 'minecraft:lantern[hanging=true]')
  }
  // logements : deux appartements par etage, meubles par piece
  var types = ['salon', 'chambre', 'cuisine', 'salon', 'chambre', 'sdb']
  for (var k = 1; k < n; k++) {
    var y = hrY(k), h = hrY(k + 1) - y
    var zi1 = Math.min(fz - out, fz + dz * 7), zi2 = Math.max(fz - out, fz + dz * 7)
    ;[[x1 + 1, cx - 2], [cx + 5, x2 - 1]].forEach((s, m) => {
      if (s[1] - s[0] < 3) return
      F(s[0], y + 1, Math.min(zi1, zi2), s[1], y + 1, Math.min(zi1, zi2), AIR)
      piece(cadre(s[0], zi1, s[1], zi2, o.face, y, h), types[(k * 2 + m) % types.length], R() < 0.5 ? 1 : 0)
    })
    // cloisons entre logements et palier
    F(cx - 1, y + 1, Math.min(fz - out, cz), cx - 1, y + h - 1, Math.max(fz - out, cz), M); F(cx + 4, y + 1, Math.min(fz - out, cz), cx + 4, y + h - 1, Math.max(fz - out, cz), M)
  }
  // facade : bandeaux, fenetres hautes, balcons filants aux 2e et 5e etages
  for (var k = 1; k < n; k++) {
    var y = hrY(k)
    for (var u = 0; u < L; u++) {
      S(fu(u), y, fz, HR.B)
      if (u >= 2 && u <= L - 3 && u % 3 == 1) {
        for (var yy = y + 1; yy <= y + 3; yy++) S(fu(u), yy, fz, hrVitre())
        S(fu(u), y, fz + out, HR.MSL + '[type=top]')
        if (k == 2 || k == 5) S(fu(u), y + 1, fz + out, HR.FER)
        else S(fu(u), y + 1, fz + out, 'minecraft:iron_bars')
      } else if (k == 2 || k == 5) { if (u >= 1 && u <= L - 2) { S(fu(u), y, fz + out, HR.MSL + '[type=top]'); S(fu(u), y + 1, fz + out, HR.FER) } }
    }
  }
  // rez-de-chaussee : refends, vitrines, porte cochere dans l'axe de la cage
  for (var u = 0; u < L; u++) { S(fu(u), 4, fz, HR.C); if (u % 2 == 0) for (var yy = 1; yy <= 3; yy++) S(fu(u), yy, fz, HR.B) }
  var pc = [cx + 1, cx + 2]
  for (var x = pc[0]; x <= pc[1]; x++) for (var yy = 1; yy <= 3; yy++) S(x, yy, fz, AIR)
  for (var z = Math.min(fz, cz), zz = Math.max(fz, cz); z <= zz; z++) F(cx, 1, z, cx + 3, 4, z, AIR)
  for (var yy = 1; yy <= 4; yy++) { S(cx, yy, fz, M); S(cx + 3, yy, fz, M) } S(pc[0], 4, fz, HR.C); S(pc[1], 4, fz, HR.C)
  F(cx - 1, 1, Math.min(fz - out, cz), cx - 1, 4, Math.max(fz - out, cz), M); F(cx + 4, 1, Math.min(fz - out, cz), cx + 4, 4, Math.max(fz - out, cz), M)
  if (!o.porteOuverte) { PORTE(pc[0], 1, fz, 'mcwdoors:dark_oak_glass_door', o.face, 'left', 'false'); PORTE(pc[1], 1, fz, 'mcwdoors:dark_oak_glass_door', o.face, 'right', 'false') }
  ;(o.boutiques || []).forEach(bq => {
    var xa = fu(bq[0]), xb = fu(bq[1])
    for (var x = xa; x <= xb; x++) for (var yy = 1; yy <= 3; yy++) S(x, yy, fz, x == Math.floor((xa + xb) / 2) && yy < 3 ? AIR : hrVitre())
    var xm = Math.floor((xa + xb) / 2); PORTE(xm, 1, fz, 'mcwdoors:spruce_glass_door', o.face, 'left', R() < 0.5 ? 'true' : 'false')
    hrBoutique(xa, xb, fz, out, bq[2])
  })
  // corniche
  for (var u = 0; u < L; u++) S(fu(u), R0, fz + out, HR.MS + '[facing=' + o.face.replace('south', 'north_').replace('north', 'south').replace('south_', 'north') + ',half=top,shape=straight]')
  // toit
  if (o.toit == 'mansarde') {
    var inw = o.face == 'south' ? 'north' : 'south'
    for (var x = x1; x <= x2; x++) { S(x, R0 + 1, fz, HR.ZS + '[facing=' + inw + ',half=bottom,shape=straight]'); S(x, R0 + 1, fz - out * (z2 - z1), HR.ZS + '[facing=' + o.face + ',half=bottom,shape=straight]') }
    W(x1, Math.min(fz - out, fz - out * (z2 - z1 - 1)), x2, Math.max(fz - out, fz - out * (z2 - z1 - 1)), R0 + 1, R0 + 3, HR.Z)
    for (var u = 2; u <= L - 3; u += 3) { S(fu(u), R0 + 2, fz - out, hrVitre()); S(fu(u), R0 + 3, fz - out, hrVitre()); S(fu(u), R0 + 4, fz, HR.ZSL + '[type=bottom]') }
    F(x1, R0 + 4, Math.min(fz - out, fz - out * (z2 - z1 - 1)), x2, R0 + 4, Math.max(fz - out, fz - out * (z2 - z1 - 1)), HR.ZSL + '[type=bottom]')
    ;[x1, x2].forEach(x => { F(x, R0 + 4, z1 + 4, x, R0 + 7, z1 + 5, HR.BR); F(x, R0 + 4, z2 - 5, x, R0 + 7, z2 - 4, HR.BR) })
  } else {
    F(x1 + 1, R0 + 1, z1 + 1, x2 - 1, R0 + 1, z2 - 1, AIR)
    for (var x = x1 + 1; x < x2; x++) for (var z = z1 + 1; z < z2; z++) if (R() < 0.08) S(x, R0, z, choix(['minecraft:andesite', 'minecraft:mossy_cobblestone', 'minecraft:smooth_stone']))
    if (o.acrotere !== false) W(x1, z1, x2, z2, R0 + 1, R0 + 1, HR.B)
    // gaines et ventilations
    S(x1 + 3, R0 + 1, z1 + 3, 'minecraft:iron_block'); S(x2 - 4, R0 + 1, z1 + 3, 'create:fluid_pipe[down=false,east=false,north=false,south=false,up=true,west=false,waterlogged=false]')
  }
  // edicule : la cage sort sur le toit, porte vers la facade
  if (o.edicule) {
    var e1 = cg(-1, -1), e2 = cg(4, 5)
    W(Math.min(e1[0], e2[0]), Math.min(e1[1], e2[1]), Math.max(e1[0], e2[0]), Math.max(e1[1], e2[1]), R0 + 1, R0 + 3, HR.M)
    F(Math.min(e1[0], e2[0]), R0 + 4, Math.min(e1[1], e2[1]), Math.max(e1[0], e2[0]), R0 + 4, Math.max(e1[1], e2[1]), HR.B)
    var pd = cg(1, -1); PORTE(pd[0], R0 + 1, pd[1], 'minecraft:iron_door', o.face, 'left', 'true')
    for (var aa = -1; aa <= 4; aa++) { var q = cg(aa, -1); S(q[0], R0, q[1], HR.B) }
    for (var aa = 0; aa < 4; aa++) cS(aa, R0, 0, HR.PL)
  }
  if (o.nid) hrNid(o.nidX, o.nidZ, R0)
  // facade arriere sur cour : fenetres plus simples ; pignons sur rue (immeubles d'angle) : vraie facade avec balcons
  var bz = fz - out * (z2 - z1)
  hrFenetres('x', bz, x1, x2, -out, n, false, false)
  ;(o.angles || []).forEach(c => hrFenetres('z', c == 'east' ? x2 : x1, z1, z2, c == 'east' ? 1 : -1, n, true, true))
  // usure : lierre sur les murs aveugles, mousse au pied
  for (var yv = 1; yv < R0; yv++) for (var t = 0; t < 2; t++) {
    var xv = t == 0 ? x1 : x2
    if (xv > 0 && xv < 127 && R() < 0.12) for (var zv = z1 + 1; zv < z2; zv++) if (R() < 0.3 && (typeof lxAppui != 'function' || lxAppui(xv, yv, zv))) SA(xv + (t == 0 ? -1 : 1), yv, zv, 'minecraft:vine[' + (t == 0 ? 'east' : 'west') + '=true]')
  }
}
// fenetres d'un mur quelconque : ax 'x' (mur le long de x, a la coordonnee z = c) ou 'z' (mur le long de z, a x = c)
function hrFenetres(ax, c, a1, a2, out, n, balc, rdc) {
  var P = (a, y) => ax == 'x' ? [a, y, c] : [c, y, a], O = (a, y) => ax == 'x' ? [a, y, c + out] : [c + out, y, a]
  function s(p, b) { S(p[0], p[1], p[2], b) }
  for (var k = rdc ? 0 : 1; k < n; k++) {
    var y = hrY(k)
    for (var a = a1; a <= a2; a++) {
      if (k > 0) s(P(a, y), HR.B)
      var i = a - a1
      if (i >= 2 && i <= a2 - a1 - 2 && i % 3 == 1) {
        for (var yy = y + 1; yy <= y + 3; yy++) s(P(a, yy), hrVitre())
        if (k > 0) { s(O(a, y), HR.MSL + '[type=top]'); s(O(a, y + 1), balc && (k == 2 || k == 5) ? HR.FER : 'minecraft:iron_bars') }
      } else if (balc && k > 0 && (k == 2 || k == 5) && i >= 1 && i <= a2 - a1 - 1) { s(O(a, y), HR.MSL + '[type=top]'); s(O(a, y + 1), HR.FER) }
    }
  }
}
function hrBoutique(xa, xb, fz, out, type) {
  var zin = fz - out
  if (type == 'cafe') {
    // comptoir, tabourets, terrasse sous store
    for (var x = xa + 1; x <= xb - 1; x++) S(x, 1, zin - out * 5, 'handcrafted:oak_counter[counter=smooth_stone,facing=' + (out > 0 ? 'south' : 'north') + ',type=1]')
    for (var x = xa; x <= xb; x++) S(x, 4, fz + out, 'supplementaries:awning_' + ((x - xa) % 2 ? 'white' : 'red') + '[slanted=true,facing=' + (out > 0 ? 'south' : 'north') + ',bottom=true]')
    for (var x = xa; x <= xb - 1; x += 3) { S(x, 0, fz + out * 2, 'handcrafted:oak_table[color=none,shape=single,waterlogged=false]'); S(x + 1, 0, fz + out * 2, 'handcrafted:oak_chair[color=red,facing=' + (out > 0 ? 'west' : 'east') + ',waterlogged=false]'); if (R() < 0.5) S(x - 1, 0, fz + out * 2, 'handcrafted:oak_chair[color=red,facing=' + (out > 0 ? 'east' : 'west') + ',waterlogged=false]') }
  } else {
    // boutique : rayonnages, caisse, cartons renverses
    for (var x = xa; x <= xb; x += 2) for (var y = 1; y <= 2; y++) S(x, y, zin - out * 6, 'handcrafted:oak_shelf[facing=' + (out > 0 ? 'south' : 'north') + ',shape=single,type=1]')
    S(xa + 1, 1, zin - out, 'handcrafted:oak_counter[counter=smooth_stone,facing=' + (out > 0 ? 'south' : 'north') + ',type=1]')
    for (var i = 0; i < 4; i++) SA(xa + Math.floor(R() * (xb - xa + 1)), 1, zin - out * (2 + Math.floor(R() * 3)), choix(['supplementaries:sack', 'minecraft:barrel[facing=up,open=false]', 'handcrafted:stackable_book']))
  }
}
// sortie de Nid : local technique au mur plein, couvert de mycelium et de champignons
// bruit doux deterministe (taches organiques au lieu de damiers)
function lbBruit(x, z, g) { return Math.sin(x * 0.37 + g) * Math.cos(z * 0.29 + g * 1.7) + 0.6 * Math.sin(x * 0.13 + z * 0.21 + g * 2.3) + 0.4 * Math.cos(x * 0.71 - z * 0.53 + g) }
// (14/11, C44, v3 "pro") local technique de toiture parisien 9 x 6 : socle d'andesite, panneaux d'enduit entre pilastres saillants,
// bandeau et couvertine de zinc, groupe de ventilation et gaines sur le toit, ventilateurs dans le mur ouest, porte de service a l'est.
// Mur nord (z) PLEIN : le Koro le traverse (casse sur copie jetable par le trailer). L'infestation Spore pousse de l'interieur :
// membranes et biomasse dans les fissures, excroissances murales, racines fongiques sur le zinc, nappe de mycelium sur le toit.
function hrNid(x, z, R0) {
  var x2 = x + 8, z2 = z + 5, yh = R0 + 6
  function lic(f) { var o = { down: 'false', east: 'false', north: 'false', south: 'false', up: 'false', west: 'false' }; o[f] = 'true'; return 'minecraft:glow_lichen[down=' + o.down + ',east=' + o.east + ',north=' + o.north + ',south=' + o.south + ',up=' + o.up + ',waterlogged=false,west=' + o.west + ']' }
  function enduit(xx, y, zz) { var n = lbBruit(xx * 2, y * 3 + zz, 4.1), r = R(); return n > 1.1 ? 'minecraft:light_gray_concrete' : r < 0.75 ? 'minecraft:smooth_stone' : 'minecraft:light_gray_concrete' }
  var PIL = 'minecraft:polished_andesite', ZN = 'createdeco:zinc_sheet_metal'
  // --- gros oeuvre : socle, panneaux, pilastres d'angle et pilastres intermediaires (x+4 au nord/sud, z+3 a l'est/ouest)
  for (var xx = x; xx <= x2; xx++) for (var zz = z; zz <= z2; zz++) for (var y = R0 + 1; y < yh; y++) {
    if (!(xx == x || xx == x2 || zz == z || zz == z2)) continue
    var pil = (xx == x || xx == x2) && (zz == z || zz == z2)
    S(xx, y, zz, y == R0 + 1 ? 'minecraft:andesite' : pil ? PIL : y == yh - 1 ? ZN : enduit(xx, y, zz))
  }
  F(x + 1, R0 + 1, z + 1, x2 - 1, yh - 1, z2 - 1, AIR)
  // pilastres saillants (profondeur de facade) sur les quatre faces, avec base et chapiteau en dalles
  ;[[x + 4, z2 + 1], [x - 1, z + 3], [x2 + 1, z + 2]].forEach(p => {
    F(p[0], R0 + 1, p[1], p[0], yh - 1, p[1], PIL); S(p[0], R0 + 1, p[1], 'minecraft:andesite')
  })
  ;[[x - 1, z - 1], [x2 + 1, z - 1], [x - 1, z2 + 1], [x2 + 1, z2 + 1]].forEach(p => { F(p[0], R0 + 1, p[1], p[0], yh - 1, p[1], PIL); S(p[0], R0 + 1, p[1], 'minecraft:andesite') })
  // couvertine de zinc et corniche : dalle pleine en debord, rive en tole, toit
  F(x - 1, yh, z - 1, x2 + 1, yh, z2 + 1, 'minecraft:smooth_stone'); F(x - 2, yh, z - 2, x2 + 2, yh, z - 2, 'minecraft:smooth_stone_slab[type=top,waterlogged=false]')
  F(x - 2, yh, z2 + 2, x2 + 2, yh, z2 + 2, 'minecraft:smooth_stone_slab[type=top,waterlogged=false]'); F(x - 2, yh, z - 1, x - 2, yh, z2 + 1, 'minecraft:smooth_stone_slab[type=top,waterlogged=false]'); F(x2 + 2, yh, z - 1, x2 + 2, yh, z2 + 1, 'minecraft:smooth_stone_slab[type=top,waterlogged=false]')
  W(x - 1, z - 1, x2 + 1, z2 + 1, yh + 1, yh + 1, 'createdeco:zinc_sheet_metal')
  // --- mur nord : eclatement depuis le centre ; membrane au coeur qui bombe hors du mur, couronne de biomasse,
  //     briques infestees puis fissures qui rayonnent jusqu'au socle et au bandeau de zinc
  ;[[4, 3, 'spore:membrane_block'], [3, 3, 'spore:biomass_block'], [5, 3, 'spore:biomass_block'], [4, 2, 'spore:biomass_block'], [4, 4, 'spore:biomass_block'], [5, 4, 'spore:biomass_block'],
    [3, 4, 'spore:infested_stone_bricks'], [6, 3, 'spore:infested_stone_bricks'], [3, 2, 'spore:infested_stone_bricks'], [5, 2, 'spore:infested_stone_bricks'], [6, 4, 'spore:infested_stone_bricks'],
    [2, 4, 'minecraft:cracked_stone_bricks'], [2, 5, 'minecraft:cracked_stone_bricks'], [1, 5, 'minecraft:cracked_stone_bricks'], [7, 3, 'minecraft:cracked_stone_bricks'], [7, 4, 'minecraft:cracked_stone_bricks'],
    [6, 5, 'minecraft:cracked_stone_bricks'], [4, 5, 'spore:infested_stone_bricks'], [2, 2, 'minecraft:cracked_stone_bricks'], [6, 2, 'minecraft:cracked_stone_bricks'], [1, 1, 'minecraft:cracked_stone_bricks'], [7, 1, 'minecraft:cracked_stone_bricks']].forEach(p => S(x + p[0], R0 + p[1], z, p[2]))
  S(x + 4, R0 + 3, z - 1, 'spore:membrane_block'); S(x + 4, R0 + 2, z - 1, 'spore:biomass_block')
  // excroissances autour du bombement (face nord), lichen dans les fissures
  ;[[3, 3], [5, 3], [4, 4], [3, 2], [5, 2], [5, 4]].forEach(p => SA(x + p[0], R0 + p[1], z - 1, 'spore:wall_growths[facing=north]'))
  ;[[2, 4], [7, 3], [6, 5], [1, 5], [2, 2]].forEach(p => SA(x + p[0], R0 + p[1], z - 1, lic('south')))
  // --- ouest : deux ventilateurs d'extraction encastres, grille de reprise ; est : porte de service, marche, eclairage
  S(x, R0 + 3, z + 1, 'create:encased_fan[facing=west]'); S(x, R0 + 3, z + 5 - 1, 'create:encased_fan[facing=west]')
  S(x, R0 + 4, z + 1, 'createdeco:industrial_iron_window'); S(x, R0 + 4, z + 4, 'createdeco:industrial_iron_window')
  PORTE(x2, R0 + 1, z + 3, 'createdeco:industrial_iron_door', 'east', 'left', 'false')
  S(x2 + 1, R0, z + 3, 'minecraft:polished_andesite'); S(x2 + 1, R0, z + 4, 'minecraft:polished_andesite')
  S(x2, R0 + 3, z + 3, 'minecraft:andesite'); S(x2 + 1, R0 + 3, z + 3, 'minecraft:polished_andesite_slab[type=top,waterlogged=false]')
  S(x2 + 1, R0 + 4, z + 4, 'mcwlights:wall_lantern[facing=east]')
  // planches clouees en travers de la porte (quelqu'un a voulu condamner le local)
  S(x2 + 1, R0 + 1, z + 3, 'minecraft:spruce_trapdoor[facing=east,half=bottom,open=true,powered=false,waterlogged=false]'); S(x2 + 1, R0 + 2, z + 3, 'minecraft:spruce_trapdoor[facing=east,half=top,open=true,powered=false,waterlogged=false]')
  // --- sud : coffret electrique, gaine de cables qui descend du toit, ventouse de cuivre
  F(x + 1, R0 + 2, z2 + 1, x + 2, R0 + 3, z2 + 1, 'create:andesite_casing')
  for (var y = R0 + 1; y <= yh + 1; y++) S(x + 6, y, z2 + 1, 'create:fluid_pipe')
  S(x + 6, yh + 2, z2 + 1, 'create:fluid_pipe'); S(x + 6, yh + 2, z2, 'create:fluid_pipe'); S(x + 6, yh + 2, z2 - 1, 'create:fluid_pipe')
  // --- toit : groupe de ventilation (caisson, ventilateur vers le ciel), gaine qui file, antenne, nappe Spore
  for (var xx = x; xx <= x2; xx++) for (var zz = z; zz <= z2; zz++) {
    var n = lbBruit(xx, zz, 1.3)
    S(xx, yh, zz, n > -0.4 ? 'spore:mycelium_block' : 'minecraft:smooth_stone')
  }
  F(x + 5, yh + 1, z + 2, x + 7, yh + 2, z + 3, 'create:andesite_casing'); S(x + 6, yh + 3, z + 2, 'create:encased_fan[facing=up]'); S(x + 6, yh + 3, z + 3, 'createdeco:andesite_sheet_metal')
  F(x + 5, yh + 1, z + 4, x + 5, yh + 1, z2 - 1, 'create:fluid_pipe'); F(x + 1, yh + 1, z + 2, x + 4, yh + 1, z + 2, 'create:fluid_pipe')
  F(x + 1, yh + 1, z + 1, x + 1, yh + 5, z + 1, 'minecraft:iron_bars'); S(x + 1, yh + 6, z + 1, 'minecraft:lightning_rod[facing=up,powered=false,waterlogged=false]')
  // la biomasse a perce le toit par la tremie, monte en bourrelets et se repand
  ;[[2, 3], [3, 3], [2, 4], [3, 4], [3, 2]].forEach(p => S(x + p[0], yh + 1, z + p[1], 'spore:biomass_block'))
  S(x + 2, yh + 2, z + 3, 'spore:membrane_block'); S(x + 3, yh + 2, z + 4, 'spore:biomass_block')
  ;[[1, 3], [1, 4], [4, 3], [4, 4], [2, 5], [3, 1], [4, 1], [7, 1], [8, 4]].forEach((p, i) => SA(x + p[0], yh + 1, z + p[1], i % 3 == 0 ? 'spore:growths_big' : 'spore:growths_small'))
  SA(x + 2, yh + 3, z + 3, 'spore:growths_small'); SA(x + 3, yh + 2, z + 3, 'spore:growths_big'); SA(x + 2, yh + 2, z + 4, 'spore:blomfung')
  // racines fongiques qui debordent par-dessus la couvertine nord et pendent sur la facade
  // --- interieur : armoires electriques, gaines au plafond, tremie vers l'etage du dessous envahie par la biomasse, restes
  F(x + 3, R0, z + 2, x + 5, R0, z + 3, AIR)
  for (var xx = x + 1; xx < x2; xx++) for (var zz = z + 1; zz < z2; zz++) if (!(xx >= x + 3 && xx <= x + 5 && zz >= z + 2 && zz <= z + 3)) S(xx, R0, zz, lbBruit(xx, zz, 2) > -0.3 ? 'spore:mycelium_block' : 'minecraft:polished_andesite')
  F(x + 1, R0 + 1, z2 - 1, x + 2, R0 + 3, z2 - 1, 'create:andesite_casing'); F(x + 6, R0 + 1, z2 - 1, x + 7, R0 + 2, z2 - 1, 'create:andesite_casing')
  F(x + 1, yh - 1, z + 2, x2 - 1, yh - 1, z + 2, 'create:fluid_pipe')
  ;[[x + 3, z + 1], [x + 5, z + 1], [x + 6, z + 2], [x + 2, z + 2], [x + 2, z + 3], [x + 6, z + 3]].forEach(p => F(p[0], R0 + 1, p[1], p[0], R0 + 1 + Math.floor(R() * 3), p[1], 'spore:biomass_block'))
  SA(x + 7, R0 + 1, z + 1, 'spore:remains'); SA(x + 1, R0 + 1, z + 1, 'spore:remains'); SA(x + 6, R0 + 1, z + 1, 'spore:growths_small')
  S(x + 4, yh - 1, z + 4, 'spore:broken_halogen_light')
  F(x + 3, R0 - 4, z + 2, x + 5, R0 - 4, z + 3, 'spore:biomass_block'); for (var xx = x + 1; xx <= x + 7; xx++) for (var zz = z; zz <= z + 5; zz++) if (lbBruit(xx, zz, 2.2) > -0.5) S(xx, R0 - 4, zz, 'spore:mycelium_block')
  // --- nappe de mycelium sur le toit de l'immeuble : continue au pied, en langues qui s'effilochent ; excroissances, lueurs
  for (var xx = x - 7; xx <= x2 + 4; xx++) for (var zz = z - 6; zz <= z2 + 5; zz++) {
    var d = Math.max(x - 1 - xx, xx - x2 - 1, z - 1 - zz, zz - z2 - 1, 0); if (d == 0) continue
    if (xx == x2 + 1 && (zz == z + 3 || zz == z + 4)) continue
    var n = lbBruit(xx, zz, 0.7) * 1.4 - d * 0.42 + 1.6
    if (n > 0) S(xx, R0, zz, n > 1.2 ? 'spore:mycelium_block' : 'minecraft:mycelium')
    if (n > 0.9 && R() < 0.22) SA(xx, R0 + 1, zz, choix(['spore:growths_small', 'spore:growths_small', 'spore:growths_big', 'spore:growths_small']))
  }
}
// arbre d'alignement (platane) ; perce : dalle cassee autour du pied
function hrArbre(x, z, perce) {
  if (perce) for (var dx = -2; dx <= 2; dx++) for (var dz2 = -2; dz2 <= 2; dz2++) if (Math.abs(dx) + Math.abs(dz2) <= 3) S(x + dx, -1, z + dz2, choix(['minecraft:coarse_dirt', 'minecraft:rooted_dirt', 'minecraft:gravel', 'minecraft:cracked_stone_bricks']))
  var h = 6 + Math.floor(R() * 3)
  F(x, 0, z, x, h, z, 'minecraft:birch_log[axis=y]')
  for (var dx = -3; dx <= 3; dx++) for (var dz2 = -3; dz2 <= 3; dz2++) for (var dy = -1; dy <= 2; dy++) if (dx * dx + dz2 * dz2 + dy * dy * 2 <= 10 && R() < 0.85) SA(x + dx, h + dy, z + dz2, 'minecraft:oak_leaves[persistent=true]')
}

// ---------------- la rue pilote ----------------
// Boulevard est-ouest z44..67 (trottoirs 5, chaussee 14), rue nord-sud x56..71 (trottoirs 3, chaussee 10) jusqu'au carrefour.
function hrRue() {
  for (var x = 0; x <= 127; x++) for (var z = 0; z <= 111; z++) S(x, -1, z, 'minecraft:stone')
  // boulevard
  for (var x = 0; x <= 127; x++) {
    for (var z = 44; z <= 67; z++) {
      var trott = z <= 48 || z >= 63, r = R()
      S(x, -1, z, trott ? (r < 0.75 ? 'minecraft:smooth_stone' : r < 0.95 ? 'minecraft:polished_andesite' : 'minecraft:cracked_stone_bricks') : (r < 0.8 ? 'minecraft:black_concrete' : r < 0.93 ? 'minecraft:gray_concrete' : r < 0.98 ? 'minecraft:gray_concrete_powder' : 'minecraft:gravel'))
    }
    S(x, -1, 48, 'minecraft:andesite'); S(x, -1, 63, 'minecraft:andesite')
    if (x % 6 < 3) S(x, -1, 55, 'minecraft:white_concrete')
  }
  // rue nord-sud jusqu'au boulevard
  for (var x = 56; x <= 71; x++) for (var z = 0; z <= 43; z++) { var trott = x <= 58 || x >= 69, r = R(); S(x, -1, z, trott ? (r < 0.8 ? 'minecraft:smooth_stone' : 'minecraft:polished_andesite') : (r < 0.85 ? 'minecraft:black_concrete' : 'minecraft:gray_concrete')) }
  // passages pietons (bandes sans texte)
  for (var x = 59; x <= 68; x++) for (var z = 49; z <= 62; z++) if (z % 2 == 0 && (x == 59 || x == 60 || x == 67 || x == 68)) S(x, -1, z, 'minecraft:white_concrete')
  // arbres d'alignement, deux qui percent la chaussee
  for (var x = 4; x <= 124; x += 10) if (x < 54 || x > 73) { hrArbre(x, 46); if (x + 5 <= 124) hrArbre(x + 5, 65) }
  hrArbre(30, 52, true); hrArbre(98, 58, true)
  // lampadaires
  for (var x = 8; x <= 120; x += 20) if (x < 54 || x > 73) { btLampe(x, 48, 'south'); btLampe(x + 10, 63, 'north') }
  // petit marche dans la rue nord-sud, rendue aux pietons : etals sous toile, cageots
  ;[[59, 4], [65, 4], [59, 11], [65, 11], [59, 18], [65, 18]].forEach((e, i) => {
    var c = ['green', 'white', 'yellow', 'red', 'white', 'green'][i]
    ;[[0, 0], [3, 0], [0, 2], [3, 2]].forEach(p => F(e[0] + p[0], 0, e[1] + p[1], e[0] + p[0], 2, e[1] + p[1], 'minecraft:spruce_fence'))
    F(e[0], 3, e[1], e[0] + 3, 3, e[1] + 2, 'minecraft:' + c + '_wool')
    F(e[0] + 1, 0, e[1] + 1, e[0] + 2, 0, e[1] + 1, 'minecraft:barrel[facing=up,open=true]')
    SA(e[0] + 1, 1, e[1], 'supplementaries:sack')
  })
  // voitures abandonnees (maquettes, remplacees par MTS a l'export)
  bgVoiture(14, 51, 'x', 'white', 1); bgVoiture(40, 58, 'x', 'red', 0); bgVoiture(84, 51, 'x', 'black', 1); bgVoiture(112, 58, 'x', 'light_gray', 0)
  // debris
  for (var i = 0; i < 40; i++) SA(Math.floor(R() * 128), 0, 44 + Math.floor(R() * 24), choix(['supplementaries:sack', 'minecraft:cobblestone_slab[type=bottom]', 'minecraft:gravel', 'handcrafted:stackable_book', 'minecraft:dead_bush']))
}
function hrPilote() {
  HM = {}; hrRue()
  // rangee nord, facades au sud (z43) : immeubles de rapport, cafe et boutique (C15)
  hrImm({ x1: 0, z1: 14, x2: 27, z2: 43, face: 'south', n: 6, toit: 'mansarde', boutiques: [[2, 9, 'cafe'], [18, 25, 'boutique']] })
  hrImm({ x1: 28, z1: 14, x2: 55, z2: 43, face: 'south', n: 6, toit: 'mansarde', angles: ['east'], boutiques: [[2, 9, 'boutique'], [18, 25, 'boutique']], mat: 'minecraft:sandstone' })
  hrImm({ x1: 72, z1: 14, x2: 99, z2: 43, face: 'south', n: 7, toit: 'mansarde', angles: ['west'], boutiques: [[2, 9, 'boutique']] })
  hrImm({ x1: 100, z1: 14, x2: 127, z2: 43, face: 'south', n: 6, toit: 'mansarde', boutiques: [[18, 25, 'cafe']], mat: 'minecraft:sandstone' })
  // rangee sud, facades au nord (z68) : la fuite par les toits (C28 a C33)
  // E : immeuble haut, porte ouverte sur la rue, cage qui sort sur le toit par un edicule
  hrImm({ x1: 0, z1: 68, x2: 23, z2: 95, face: 'north', n: 7, toit: 'plat', edicule: true, porteOuverte: true })
  // ruelle sautable x24..28 (5 blocs), F un etage plus bas avec acrotere
  hrImm({ x1: 29, z1: 68, x2: 52, z2: 95, face: 'north', n: 6, toit: 'plat', edicule: true, boutiques: [[2, 8, 'boutique']], mat: 'minecraft:sandstone' })
  // G : beaucoup plus bas, muret sur le toit ; puis ruelle de 8 (trop large pour un saut) qui donne sur le boulevard
  hrImm({ x1: 53, z1: 68, x2: 76, z2: 95, face: 'north', n: 4, toit: 'plat', edicule: true, boutiques: [[16, 22, 'cafe']] })
  // H : grand immeuble, sortie de Nid sur le toit (lieu 11 du trailer ; le CHM reste reserve au lore)
  hrImm({ x1: 85, z1: 68, x2: 127, z2: 95, face: 'north', n: 6, toit: 'plat', edicule: true, boutiques: [[2, 9, 'boutique'], [30, 38, 'boutique']], nid: true, nidX: 113, nidZ: 84, mat: 'minecraft:sandstone' })
  // ruelles : sol de gravier et poubelles, la ruelle large debouche sur le boulevard
  for (var z = 68; z <= 111; z++) { for (var x = 24; x <= 28; x++) S(x, -1, z, R() < 0.6 ? 'minecraft:gravel' : 'minecraft:coarse_dirt'); for (var x = 77; x <= 84; x++) S(x, -1, z, R() < 0.6 ? 'minecraft:gravel' : 'minecraft:andesite') }
  SA(26, 0, 80, 'minecraft:barrel[facing=up,open=false]'); SA(80, 0, 76, 'minecraft:barrel[facing=up,open=true]'); SA(81, 0, 90, 'supplementaries:sack')
}
var QFIN_PILOTE = function () {
  HB2 = true; FIN = true; THM = THM_HF
  lot(function () { HM = {}; FIN_VOLET = null; FIN_RID = null; hrPilote(); finAncrage() }, 0, 0, 999, 6501, 128, 44); VB.lots[VB.lots.length - 1].d = 112
  HB2 = false; FIN = false; THM = null; HM = {}
}
function vuesPilote() {
  vue('p_boulevard_ouest', 0, 0, 2, 3, 56, 60, 6, 56)
  vue('p_boulevard_est', 0, 0, 125, 3, 56, 60, 6, 56)
  vue('p_carrefour', 0, 0, 64, 4, 30, 64, 4, 70)
  vue('p_terrasse_cafe', 0, 0, 14, 2.6, 52, 6, 2, 44)
  vue('p_boutique', 0, 0, 22, 2.6, 50, 22, 2, 40)
  vue('p_edicule', 0, 0, 30, 34, 78, 12, 30, 82)
  vue('p_toits_fuite', 0, 0, 6, 33, 100, 70, 22, 80)
  vue('p_nid', 0, 0, 102, 30, 75, 117, 27, 86)
  vue('p_nid_face', 0, 0, 117.5, 27.6, 75, 117.5, 28.5, 84)
  vue('p_nid_dos', 0, 0, 125, 31, 98, 117, 27, 86)
  vue('p_vue_haut', 0, 0, 64, 70, 140, 64, 0, 56)
  vue('p_escalier', 0, 0, 12, 7, 84, 12, 9, 88)
  vue('p_marche', 0, 0, 64, 3.5, 27, 64, 1, 8)
  vue('p_angle', 0, 0, 64, 3, 60, 40, 14, 30)
}
