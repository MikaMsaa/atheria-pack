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
  ;[[x + 4, z - 1], [x + 4, z2 + 1], [x - 1, z + 3], [x2 + 1, z + 2]].forEach(p => {
    F(p[0], R0 + 1, p[1], p[0], yh - 1, p[1], PIL); S(p[0], R0 + 1, p[1], 'minecraft:andesite')
  })
  ;[[x - 1, z - 1], [x2 + 1, z - 1], [x - 1, z2 + 1], [x2 + 1, z2 + 1]].forEach(p => { F(p[0], R0 + 1, p[1], p[0], yh - 1, p[1], PIL); S(p[0], R0 + 1, p[1], 'minecraft:andesite') })
  // couvertine de zinc et corniche : dalle pleine en debord, rive en tole, toit
  F(x - 1, yh, z - 1, x2 + 1, yh, z2 + 1, 'minecraft:smooth_stone'); F(x - 2, yh, z - 2, x2 + 2, yh, z - 2, 'minecraft:smooth_stone_slab[type=top,waterlogged=false]')
  F(x - 2, yh, z2 + 2, x2 + 2, yh, z2 + 2, 'minecraft:smooth_stone_slab[type=top,waterlogged=false]'); F(x - 2, yh, z - 1, x - 2, yh, z2 + 1, 'minecraft:smooth_stone_slab[type=top,waterlogged=false]'); F(x2 + 2, yh, z - 1, x2 + 2, yh, z2 + 1, 'minecraft:smooth_stone_slab[type=top,waterlogged=false]')
  W(x - 1, z - 1, x2 + 1, z2 + 1, yh + 1, yh + 1, 'createdeco:zinc_sheet_metal')
  // --- mur nord : fissure en etoile depuis le centre ; la membrane et la biomasse remplissent les fissures, le mur bombe
  ;[[4, 2], [4, 3], [3, 3], [5, 3], [4, 4], [2, 4], [6, 4], [3, 5], [5, 5], [1, 5], [7, 2], [2, 2], [6, 2], [1, 3]].forEach((p, i) => S(x + p[0], R0 + p[1], z, i < 5 ? 'spore:membrane_block' : i < 9 ? 'spore:biomass_block' : 'minecraft:cracked_stone_bricks'))
  // excroissances murales au droit des fissures (face nord), lichen dans les joints
  ;[[3, 2], [5, 2], [3, 4], [5, 4], [2, 3], [6, 3], [4, 5]].forEach(p => SA(x + p[0], R0 + p[1], z - 1, 'spore:wall_growths[facing=north]'))
  ;[[1, 4], [7, 4], [2, 5], [6, 5], [1, 2], [7, 3]].forEach(p => SA(x + p[0], R0 + p[1], z - 1, lic('south')))
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
  SA(x + 2, yh + 3, z + 3, 'spore:growths_small'); SA(x + 3, yh + 2, z + 3, 'spore:glowshroom'); SA(x + 2, yh + 2, z + 4, 'spore:blomfung')
  // racines fongiques qui debordent par-dessus la couvertine nord et pendent sur la facade
  ;[[3, -1], [4, -2], [5, -1], [2, -1]].forEach(p => SA(x + p[0], yh + 1, z + p[1], 'spore:fungal_roots'))
  // --- interieur : armoires electriques, gaines au plafond, tremie vers l'etage du dessous envahie par la biomasse, restes
  F(x + 3, R0, z + 2, x + 5, R0, z + 3, AIR)
  for (var xx = x + 1; xx < x2; xx++) for (var zz = z + 1; zz < z2; zz++) if (!(xx >= x + 3 && xx <= x + 5 && zz >= z + 2 && zz <= z + 3)) S(xx, R0, zz, lbBruit(xx, zz, 2) > -0.3 ? 'spore:mycelium_block' : 'minecraft:polished_andesite')
  F(x + 1, R0 + 1, z2 - 1, x + 2, R0 + 3, z2 - 1, 'create:andesite_casing'); F(x + 6, R0 + 1, z2 - 1, x + 7, R0 + 2, z2 - 1, 'create:andesite_casing')
  F(x + 1, yh - 1, z + 2, x2 - 1, yh - 1, z + 2, 'create:fluid_pipe')
  ;[[x + 3, z + 1], [x + 5, z + 1], [x + 6, z + 2], [x + 2, z + 2], [x + 2, z + 3], [x + 6, z + 3]].forEach(p => F(p[0], R0 + 1, p[1], p[0], R0 + 1 + Math.floor(R() * 3), p[1], 'spore:biomass_block'))
  SA(x + 7, R0 + 1, z + 1, 'spore:remains'); SA(x + 1, R0 + 1, z + 1, 'spore:body_bag[facing=east]'); SA(x + 6, R0 + 3, z + 1, 'spore:growths_small')
  S(x + 4, yh - 1, z + 4, 'spore:broken_halogen_light')
  F(x + 3, R0 - 4, z + 2, x + 5, R0 - 4, z + 3, 'spore:biomass_block'); for (var xx = x + 1; xx <= x + 7; xx++) for (var zz = z; zz <= z + 5; zz++) if (lbBruit(xx, zz, 2.2) > -0.5) S(xx, R0 - 4, zz, 'spore:mycelium_block')
  // --- nappe de mycelium sur le toit de l'immeuble : continue au pied, en langues qui s'effilochent ; excroissances, lueurs
  for (var xx = x - 7; xx <= x2 + 4; xx++) for (var zz = z - 6; zz <= z2 + 5; zz++) {
    var d = Math.max(x - 1 - xx, xx - x2 - 1, z - 1 - zz, zz - z2 - 1, 0); if (d == 0) continue
    if (xx == x2 + 1 && (zz == z + 3 || zz == z + 4)) continue
    var n = lbBruit(xx, zz, 0.7) * 1.4 - d * 0.42 + 1.6
    if (n > 0) S(xx, R0, zz, n > 1.2 ? 'spore:mycelium_block' : 'minecraft:mycelium')
    if (n > 0.9 && R() < 0.22) SA(xx, R0 + 1, zz, choix(['spore:growths_small', 'spore:growths_small', 'spore:growths_big', 'spore:glowshroom']))
  }
}
