// ================= ESSAI DE BLOCS MODDES POUR LES VEHICULES (lot55, 11/11) =================
// Conteneurs Create Deco (multibloc facon coffre-fort Create), bogies Create, roue arrondie en escaliers, portes de train, toles.
function vhEssaiBlocs() {
  OX = VB.X0; OY = VB.Y0; OZ = VB.Z0; CUT = 999; GRAINE = 5501
  for (var x = -8; x <= 80; x++) for (var z = 0; z <= 47; z++) S(x, -1, z, 'minecraft:black_concrete')
  // conteneurs : 3 x 3 x 9 (axe x), 3 x 3 x 6, pile, et un 2 x 2 x 6
  F(2, 0, 2, 10, 2, 4, 'createdeco:red_shipping_container[axis=x,large=false]')
  F(14, 0, 2, 19, 2, 4, 'createdeco:blue_shipping_container[axis=x,large=false]')
  F(2, 3, 2, 10, 5, 4, 'createdeco:green_shipping_container[axis=x,large=false]')
  F(24, 0, 2, 29, 1, 3, 'createdeco:orange_shipping_container[axis=x,large=false]')
  F(34, 0, 2, 36, 2, 10, 'createdeco:white_shipping_container[axis=z,large=false]')
  // bogies sur voie et hors voie
  for (var x = 42; x <= 70; x++) S(x, 0, 4, 'create:track[shape=xo,turn=false,waterlogged=false]')
  S(46, 1, 4, 'create:small_bogey[axis=x,waterlogged=false]'); S(54, 1, 4, 'create:large_bogey[axis=x,waterlogged=false]')
  S(62, 0, 8, 'create:small_bogey[axis=x,waterlogged=false]')
  // roue arrondie 2 x 2 vue de cote (axe x = longueur)
  S(42, 1, 14, 'minecraft:polished_blackstone_stairs[facing=east,half=bottom,shape=straight]'); S(43, 1, 14, 'minecraft:polished_blackstone_stairs[facing=west,half=bottom,shape=straight]')
  S(42, 0, 14, 'minecraft:polished_blackstone_stairs[facing=east,half=top,shape=straight]'); S(43, 0, 14, 'minecraft:polished_blackstone_stairs[facing=west,half=top,shape=straight]')
  // portes de train et vitrages Create, toles Create Deco
  PORTE(48, 0, 14, 'create:train_door', 'north', 'left', 'false'); S(48, 0, 15, 'create:railway_casing'); S(48, 1, 15, 'create:railway_casing')
  var t = ['createdeco:iron_sheet_metal[axis=y]', 'createdeco:industrial_iron_sheet_metal[axis=y]', 'createdeco:andesite_sheet_metal[axis=y]', 'createdeco:zinc_sheet_metal[axis=y]', 'createdeco:iron_hull[facing=north]', 'createdeco:industrial_iron_hull[facing=north]', 'create:railway_casing', 'create:andesite_casing', 'create:framed_glass', 'create:tiled_glass', 'create:industrial_iron_block', 'create:weathered_iron_block', 'createdeco:iron_window', 'create:horizontal_framed_glass', 'create:vertical_framed_glass']
  t.forEach((b, i) => { S(42 + i * 2, 0, 20, b); S(42 + i * 2, 1, 20, b) })
}
var QFIN_VH3 = function () { HM = {}; lot(vhEssaiBlocs, 0, 0, 999, 5501, 80, 20) }
function vuesVH3() {
  vue('vh3_conteneurs', 0, 0, 14, 4, 14, 10, 2, 3)
  vue('vh3_conteneurs_bout', 0, 0, -6, 3, 8, 3, 2, 3)
  vue('vh3_conteneur_z', 0, 0, 30, 3, 14, 35, 1, 8)
  vue('vh3_bogies', 0, 0, 54, 3, 10, 54, 1, 4)
  vue('vh3_roue_porte', 0, 0, 46, 2, 9, 45, 1, 14)
  vue('vh3_toles', 0, 0, 56, 3, 14, 56, 1, 20)
}
