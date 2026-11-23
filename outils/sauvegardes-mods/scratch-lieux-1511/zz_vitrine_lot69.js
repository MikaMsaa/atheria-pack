// ================= STATION DE TRAM INONDEE ET BOUCHE DES PASSEURS (lot69, 14/11) : lieu 6 du trailer =================
// Fiche : bouche des galeries de 3 x 3 ou plus (animatique 3,8 x 3,3), vue du ciel a 85-120 m ; elle mene a l'ancienne station de tram
// inondee sous Longoni, ou vivent les Enfants : eau au sol, quais, rails ou une rame, penombre (animatique : 24 x 12 x 5, deux quais de 1 m, rame a demi engloutie).
// Ici : bouche de 4 x 3 au nord (x30..33, z4), escalier qui descend vers le sud jusqu'au quai nord ; salle x20..55, z19..38, sol des quais a y-10, plafond a y-5.
// Voie x18..57 dans une cuvette z26..31 : ballast y-14, rails noyes y-13, eau jusqu'a y-11 ; rame de 20 m a demi immergee ; effondrement du plafond (puits de jour) sur la voie.
var TS_CARRO = 'minecraft:white_concrete', TS_FRISE = 'minecraft:cyan_terracotta', TS_SOL = 'minecraft:polished_andesite'
function tsCouches(x1, y1, z1, x2, y2, z2, b) { for (var y = y1; y <= y2; y++) F(x1, y, z1, x2, y, z2, b) }   // remplissages par couche (HM enregistre)
function tsLanterne(x, y, z) { S(x, y, z, 'minecraft:lantern[hanging=false,waterlogged=false]') }
function tsMatelas(x, z, c, f) { S(x, -10, z, 'minecraft:' + c + '_bed[facing=' + f + ',occupied=false,part=foot]'); var o = { north: [0, -1], south: [0, 1], east: [1, 0], west: [-1, 0] }[f]; S(x + o[0], -10, z + o[1], 'minecraft:' + c + '_bed[facing=' + f + ',occupied=false,part=head]') }

function tsStation() {
  // --- terrain de surface : friche de Longoni (herbes hautes, manguiers, gravats), y-1
  for (var x = 0; x <= 79; x++) for (var z = 0; z <= 49; z++) { var n = lbBruit(x, z, 6.9); S(x, -1, z, n > 0.9 ? 'minecraft:coarse_dirt' : n < -1.1 ? 'minecraft:gravel' : 'minecraft:grass_block[snowy=false]') }
  // --- coque de roche autour de tout le souterrain, puis vides
  tsCouches(14, -17, 2, 61, -2, 43, 'minecraft:stone')
  for (var x = 14; x <= 61; x++) for (var z = 2; z <= 43; z++) if (lbBruit(x, z, 2.2) > 0.8) S(x, -2, z, 'minecraft:dirt')
  // salle : murs carreles a frise, sol des quais, plafond
  tsCouches(20, -10, 19, 55, -6, 38, AIR)
  for (var x = 20; x <= 55; x++) for (var y = -10; y <= -6; y++) { S(x, y, 18, y == -8 ? TS_FRISE : TS_CARRO); S(x, y, 39, y == -8 ? TS_FRISE : TS_CARRO) }
  for (var z = 19; z <= 38; z++) for (var y = -10; y <= -6; y++) if (z < 26 || z > 31) { S(19, y, z, y == -8 ? TS_FRISE : TS_CARRO); S(56, y, z, y == -8 ? TS_FRISE : TS_CARRO) }
  F(20, -5, 19, 55, -5, 38, 'minecraft:smooth_stone')
  // carreaux tombes et taches d'humidite sur les murs (penombre, abandon)
  for (var x = 20; x <= 55; x++) { [18, 39].forEach(z => { for (var y = -10; y <= -6; y++) if (y != -8 && lbBruit(x, y * 3 + z, 4.4) > 1.2) S(x, y, z, R() < 0.5 ? 'minecraft:light_gray_concrete' : 'minecraft:mossy_stone_bricks') }) }
  // quais : nord z19..25, sud z32..38 ; sol a y-11 (on marche a y-10), bord jaune, cuvette de voie z26..31
  F(20, -11, 19, 55, -11, 25, TS_SOL); F(20, -11, 32, 55, -11, 38, TS_SOL)
  F(20, -11, 25, 55, -11, 25, 'minecraft:yellow_concrete'); F(20, -11, 32, 55, -11, 32, 'minecraft:yellow_concrete')
  for (var x = 20; x <= 55; x++) for (var z = 19; z <= 38; z++) if ((z < 25 || z > 32) && lbBruit(x, z, 8.8) > 1.25) S(x, -11, z, 'minecraft:cracked_stone_bricks')
  // voie : du mur ouest au mur est, et deux tunnels noirs aux extremites (x14..19 et x56..61)
  tsCouches(14, -14, 26, 61, -10, 31, AIR)
  F(14, -15, 26, 61, -15, 31, 'minecraft:gravel'); F(14, -14, 26, 61, -14, 31, 'minecraft:gravel')
  for (var x = 14; x <= 61; x++) { [27, 30].forEach(z => S(x, -13, z, 'minecraft:rail[shape=east_west,waterlogged=true]')); [28, 29].forEach(z => S(x, -13, z, 'minecraft:water')); [26, 31].forEach(z => S(x, -13, z, 'minecraft:water')) }
  tsCouches(14, -12, 26, 61, -11, 31, 'minecraft:water')
  // parois de la cuvette (sous les quais) en beton, tunnels voutes et bouches noires
  F(20, -14, 25, 55, -12, 25, 'minecraft:gray_concrete'); F(20, -14, 32, 55, -12, 32, 'minecraft:gray_concrete')
  ;[[14, 19], [56, 61]].forEach(t => { F(t[0], -9, 26, t[1], -9, 31, 'minecraft:stone_bricks'); F(t[0], -10, 26, t[1], -10, 26, 'minecraft:stone_bricks'); F(t[0], -10, 31, t[1], -10, 31, 'minecraft:stone_bricks'); F(t[0], -10, 27, t[1], -10, 30, AIR) })
  F(14, -14, 26, 14, -9, 31, 'minecraft:cobblestone'); F(61, -14, 26, 61, -9, 31, 'minecraft:cobblestone'); F(15, -12, 27, 16, -10, 30, 'minecraft:cobblestone'); F(15, -12, 28, 15, -10, 29, 'minecraft:gravel')
  // piliers en bord de quai (tous les 6), chapiteaux, et plafond a caissons
  for (var x = 23; x <= 53; x += 6) { [24, 33].forEach(z => { F(x, -10, z, x, -6, z, 'minecraft:polished_andesite'); S(x, -6, z, 'minecraft:chiseled_stone_bricks') }) }
  for (var x = 23; x <= 53; x += 6) F(x, -6, 25, x, -6, 32, 'minecraft:smooth_stone_slab[type=top,waterlogged=false]')
  // --- rame de tram a demi engloutie (x24..43, z27..30), vitres soufflees, portes ouvertes, toit avec pantographe couche
  var RX1 = 24, RX2 = 43
  tsCouches(RX1, -13, 27, RX2, -9, 30, 'minecraft:white_concrete')
  tsCouches(RX1 + 1, -12, 28, RX2 - 1, -10, 29, AIR)
  for (var x = RX1 + 1; x < RX2; x++) { [27, 30].forEach(z => { S(x, -13, z, 'minecraft:gray_concrete'); if ((x - RX1) % 4 != 0) S(x, -10, z, (x * z) % 3 == 0 ? AIR : 'minecraft:gray_stained_glass_pane') }) }
  ;[RX1 + 6, RX1 + 13].forEach(x => { [27, 30].forEach(z => { S(x, -10, z, AIR); S(x + 1, -10, z, AIR) }) })
  for (var x = RX1; x <= RX2; x++) { S(x, -11, 27, x % 2 ? 'minecraft:cyan_concrete' : 'minecraft:white_concrete'); S(x, -11, 30, x % 2 ? 'minecraft:cyan_concrete' : 'minecraft:white_concrete') }
  F(RX1, -12, 28, RX1, -10, 29, 'minecraft:black_stained_glass'); F(RX2, -12, 28, RX2, -10, 29, 'minecraft:black_stained_glass')
  F(RX1 + 8, -8, 28, RX1 + 11, -8, 29, 'minecraft:gray_concrete'); F(RX1 + 9, -7, 28, RX1 + 9, -7, 29, 'minecraft:iron_bars')
  // l'interieur de la rame est noye jusqu'a y-11 : les Enfants y ont pose un plancher de planches
  tsCouches(RX1 + 1, -12, 28, RX2 - 1, -12, 29, 'minecraft:water'); F(RX1 + 2, -11, 28, RX2 - 2, -11, 29, 'minecraft:spruce_slab[type=bottom,waterlogged=true]')
  // --- effondrement : puits de jour par le plafond sur la voie (x46..49, z27..30), eboulis dans l'eau
  tsCouches(46, -5, 27, 49, -2, 30, AIR); for (var x = 45; x <= 50; x++) for (var z = 26; z <= 31; z++) if (R() < 0.7 && !(x >= 46 && x <= 49 && z >= 27 && z <= 30)) S(x, -5, z, 'minecraft:cracked_stone_bricks')
  F(46, -1, 27, 49, -1, 30, AIR)
  ;[[46, 27, 3], [47, 28, 4], [48, 29, 3], [49, 27, 2], [47, 30, 2], [46, 29, 3], [48, 27, 3]].forEach(p => F(p[0], -14, p[1], p[0], -14 + p[2], p[1], R() < 0.5 ? 'minecraft:cobblestone' : 'minecraft:mossy_cobblestone'))
  F(46, -6, 26, 49, -6, 26, 'minecraft:iron_bars'); F(46, -6, 31, 49, -6, 31, 'minecraft:iron_bars')
  // racines et lianes qui descendent du puits, mousse sur les eboulis
  ;[[46, 28, 'west'], [49, 29, 'east'], [47, 27, 'north'], [48, 30, 'south']].forEach(v => lxLiane(v[0], -2, v[1], v[2], 4))
  for (var x = 46; x <= 49; x++) for (var z = 27; z <= 30; z++) { var y = -10; while (y < -1 && !libreH(x, y, z)) y++; if (y < -2 && libreH(x, y, z) && /cobble/.test(HM[hk(x, y - 1, z)] || '') && R() < 0.5) SA(x, y, z, 'minecraft:moss_carpet') }
  // --- escalier depuis la bouche : x30..33, de z5 (y-2) a z18 (arrivee sur le quai nord a y-10)
  for (var i = 0; i <= 13; i++) {
    var z = 5 + i, yf = Math.max(-10, -2 - Math.round(i * 8 / 12))
    F(30, yf, z, 33, -3, z, AIR); F(30, yf - 1, z, 33, yf - 1, z, 'minecraft:smooth_stone')
    F(29, yf, z, 29, -3, z, TS_CARRO); F(34, yf, z, 34, -3, z, TS_CARRO); if (yf + 2 <= -3) { S(29, yf + 2, z, TS_FRISE); S(34, yf + 2, z, TS_FRISE) }
    if (yf + 4 <= -2) F(30, yf + 4, z, 33, yf + 4, z, 'minecraft:smooth_stone')
  }
  F(30, -10, 18, 33, -7, 18, AIR)
  for (var i = 1; i <= 12; i++) { var z = 5 + i, y = -2 - Math.round(i * 8 / 12); if (y > -10) { S(30, y + 1, z, 'minecraft:iron_bars'); S(33, y + 1, z, 'minecraft:iron_bars') } }
  // --- bouche en surface : cadre de beton 4 x 3, garde-corps sur trois cotes, auvent casse, vegetation qui l'avale
  F(30, -2, 5, 33, -1, 10, AIR)
  F(29, -1, 4, 34, -1, 4, 'minecraft:light_gray_concrete'); F(29, -1, 5, 29, -1, 10, 'minecraft:light_gray_concrete'); F(34, -1, 5, 34, -1, 10, 'minecraft:light_gray_concrete')
  F(29, 0, 4, 34, 0, 4, 'mcwfences:panelled_metal_fence'); F(29, 0, 5, 29, 0, 10, 'mcwfences:panelled_metal_fence'); F(34, 0, 5, 34, 0, 10, 'mcwfences:panelled_metal_fence')
  F(29, 0, 7, 29, 0, 8, AIR)
  // tete du tunnel : mur de beton au-dessus de la bouche (4 x 3 sous le linteau), murs de soutenement le long de la tremie, couronnement
  F(29, -1, 11, 34, 1, 11, 'minecraft:light_gray_concrete'); F(28, 2, 11, 35, 2, 11, 'minecraft:smooth_stone_slab[type=bottom,waterlogged=false]')
  F(29, -1, 12, 34, 1, 13, 'minecraft:stone'); F(28, 1, 12, 35, 1, 13, 'minecraft:grass_block[snowy=false]'); F(27, 0, 12, 36, 0, 14, 'minecraft:grass_block[snowy=false]')
  for (var z = 8; z <= 10; z++) { F(29, 1, z, 29, 1, z, 'minecraft:light_gray_concrete'); F(34, 1, z, 34, 1, z, 'minecraft:light_gray_concrete') }
  F(29, 0, 8, 29, 0, 10, 'minecraft:light_gray_concrete'); F(34, 0, 8, 34, 0, 10, 'minecraft:light_gray_concrete')
  F(29, 2, 8, 29, 2, 10, 'mcwfences:panelled_metal_fence'); F(34, 2, 8, 34, 2, 10, 'mcwfences:panelled_metal_fence')
  for (var x = 30; x <= 33; x++) if (R() < 0.5) lxLiane(x, -2, 10, 'south', 2)
  ;[[30, 8, 'west'], [33, 9, 'east'], [31, 10, 'south']].forEach(v => lxLiane(v[0], -2, v[1], v[2], 3))
  // pierres de passage des Passeurs : tas de gravats, palette, brancard de bambou
  F(36, 0, 4, 37, 0, 5, 'minecraft:cobblestone'); S(36, 1, 4, 'minecraft:mossy_cobblestone'); F(25, 0, 6, 26, 0, 7, 'minecraft:spruce_slab[type=bottom,waterlogged=false]'); SA(25, 1, 6, 'supplementaries:sack')
  // --- camp des Enfants sur le quai sud : matelas, rideaux de toile, lanternes, caisses, foyer eteint, cordes a linge ; sur le quai nord : vigie et pirogue
  ;[[22, 36, 'red', 'east'], [22, 34, 'yellow', 'east'], [27, 37, 'blue', 'north'], [30, 37, 'green', 'north'], [33, 37, 'orange', 'north']].forEach(m => tsMatelas(m[0], m[1], m[2], m[3]))
  for (var x = 21; x <= 36; x += 5) { F(x, -10, 35, x, -7, 35, 'minecraft:spruce_fence') }
  for (var x = 22; x <= 35; x++) if (x % 5 != 1) { S(x, -7, 35, 'minecraft:chain[axis=x,waterlogged=false]'); if (x % 2 == 0) S(x, -8, 35, 'minecraft:' + choix(['white', 'yellow', 'light_blue', 'pink', 'orange']) + '_wool') }
  F(38, -10, 36, 40, -10, 38, 'minecraft:barrel[facing=up,open=false]'); S(38, -9, 37, 'minecraft:barrel[facing=up,open=false]'); SA(39, -9, 38, 'supplementaries:sack'); SA(40, -9, 36, 'supplementaries:jar')
  S(44, -10, 36, 'minecraft:campfire[facing=north,lit=false,signal_fire=false,waterlogged=false]'); S(44, -10, 35, 'minecraft:cobblestone_slab[type=bottom,waterlogged=false]'); S(43, -10, 36, 'minecraft:cobblestone_slab[type=bottom,waterlogged=false]'); S(45, -10, 36, 'minecraft:cobblestone_slab[type=bottom,waterlogged=false]')
  S(44, -10, 34, 'farmersdelight:cooking_pot')
  ;[[24, 34], [32, 36], [41, 37], [50, 35], [26, 21], [42, 20], [52, 22]].forEach(p => tsLanterne(p[0], -10, p[1]))
  // dessins a la craie impossibles (pas de texte) : taches de couleur basses sur le mur sud, ou les Enfants dorment
  ;[[25, -9], [26, -9], [29, -10], [33, -9], [34, -10]].forEach(p => S(p[0], p[1], 39, choix(['minecraft:yellow_terracotta', 'minecraft:light_blue_terracotta', 'minecraft:lime_terracotta'])))
  // quai nord : poste de vigie en caisses face a l'escalier, banquettes d'origine, distributeurs morts
  F(36, -10, 20, 37, -9, 21, 'minecraft:spruce_planks'); F(36, -8, 20, 37, -8, 21, 'minecraft:spruce_slab[type=bottom,waterlogged=false]'); S(37, -8, 21, 'minecraft:lantern[hanging=false,waterlogged=false]')
  ;[22, 46, 52].forEach(x => { S(x, -10, 19, 'minecraft:spruce_stairs[facing=south,half=bottom,shape=straight,waterlogged=false]'); S(x + 1, -10, 19, 'minecraft:spruce_stairs[facing=south,half=bottom,shape=straight,waterlogged=false]') })
  ;[40, 41].forEach(x => { F(x, -10, 19, x, -9, 19, 'create:andesite_casing'); S(x, -8, 19, 'minecraft:black_stained_glass') })
  // pirogue amarree le long du quai nord, dans l'eau ; corde vers un pilier
  F(47, -11, 26, 53, -11, 26, 'minecraft:spruce_slab[type=bottom,waterlogged=true]'); S(46, -11, 26, 'minecraft:spruce_stairs[facing=east,half=bottom,shape=straight,waterlogged=true]'); S(54, -11, 26, 'minecraft:spruce_stairs[facing=west,half=bottom,shape=straight,waterlogged=true]')
  // lichen lumineux le long des joints humides (seule lumiere naturelle avec le puits)
  for (var x = 20; x <= 55; x += 3) { if (R() < 0.6) SA(x, -6, 19, 'minecraft:glow_lichen[down=false,east=false,north=true,south=false,up=false,waterlogged=false,west=false]'); if (R() < 0.6) SA(x, -6, 38, 'minecraft:glow_lichen[down=false,east=false,north=false,south=true,up=false,waterlogged=false,west=false]') }
  // --- surface : manguiers et bananiers autour de la bouche, herbes hautes
  ;[[20, 12], [45, 10], [60, 30]].forEach(p => rmManguier(p[0], p[1]))
  ;[[38, 8], [26, 3], [55, 14], [12, 30]].forEach((p, i) => rmBananier(p[0], p[1], 4 + (i % 2)))
  for (var i = 0; i < 500; i++) { var x = Math.floor(R() * 80), z = Math.floor(R() * 50); if (libreH(x, 0, z) && /grass_block/.test(HM[hk(x, -1, z)] || '')) SA(x, 0, z, R() < 0.75 ? 'minecraft:short_grass' : 'minecraft:fern') }
  tsEnrichir()
  lxNettoyer(/(pane|_bars|fence|chain|_slab|leaves|carpet|_wool|lantern|cocoa|lichen|vine|grass\b|short_grass|fern)/)
}


// ================= ENRICHISSEMENT MODPACK (15/11, demande de Mika : tres detaille, realiste, pro, modpack exploite) =================
// Meme volume, memes positions que la v1 validee (le Trailer cadre deja dessus) : seuls les details et les blocs changent.
function tsEnrichir() {
  // carrelage : variantes Chipped (carreaux lisses, mosaique, grille) a la place d'une partie du beton blanc, frise en carreaux de terre cuite
  for (var x = 19; x <= 56; x++) for (var z = 18; z <= 39; z++) for (var y = -10; y <= -6; y++) {
    var b = HM[hk(x, y, z)]; if (!b) continue
    if (b == TS_CARRO) { var r = R(); if (r < 0.30) S(x, y, z, 'chipped:smooth_white_concrete'); else if (r < 0.38) S(x, y, z, 'chipped:mosaic_white_concrete'); else if (r < 0.42) S(x, y, z, 'chipped:grid_white_concrete') }
    else if (b == TS_FRISE) S(x, y, z, R() < 0.8 ? 'chipped:small_cyan_terracotta_tiles' : 'chipped:cyan_terracotta_tiles')
  }
  // plafonniers : halogenes casses de Spore dans le plafond, au droit des quais (un seul encore allume, cote camp)
  for (var x = 26; x <= 52; x += 6) [22, 35].forEach(z => S(x, -5, z, (x == 32 && z == 35) ? 'spore:halogen_light_on' : 'spore:broken_halogen_light'))
  // bord de quai : bande d'eveil (Chipped) le long des deux bords
  for (var x = 20; x <= 55; x++) { if (R() < 0.85) S(x, -11, 24, 'chipped:hazard_white_concrete'); if (R() < 0.85) S(x, -11, 33, 'chipped:hazard_white_concrete') }
  // banquettes d'origine : bancs Handcrafted
  ;[22, 46, 52].forEach(x => { S(x, -10, 19, 'handcrafted:spruce_bench[facing=south]'); S(x + 1, -10, 19, 'handcrafted:spruce_bench[facing=south]') })
  // portique de validation mort entre l'escalier et le quai (boitiers Create, barreaux Create Deco)
  ;[29, 34].forEach(x => { F(x, -10, 17, x, -9, 17, 'create:andesite_casing') })
  // camp des Enfants : coussins, tapis de toile, bougeoirs, caisses de Farmer's Delight, petite table
  ;[[21, 37, 'light_blue'], [24, 38, 'yellow'], [32, 38, 'pink'], [35, 36, 'lime']].forEach(c => SA(c[0], -10, c[1], 'handcrafted:' + c[2] + '_cushion'))
  ;[[28, 34], [29, 34], [30, 34], [28, 33], [29, 33]].forEach(p => SA(p[0], -10, p[1], 'farmersdelight:canvas_rug'))
  F(41, -10, 38, 41, -10, 38, 'farmersdelight:carrot_crate'); S(42, -10, 38, 'farmersdelight:potato_crate'); SA(41, -9, 38, 'farmersdelight:onion_crate')
  S(37, -10, 33, 'handcrafted:spruce_side_table'); SA(37, -9, 33, 'supplementaries:candle_holder_yellow[candles=3,face=floor,facing=north,lit=true,waterlogged=false]')
  SA(26, -10, 33, 'supplementaries:candle_holder_white[candles=2,face=floor,facing=north,lit=true,waterlogged=false]')
  SA(45, -10, 34, 'farmersdelight:cutting_board'); SA(43, -10, 34, 'supplementaries:jar')
  // dessins des Enfants sur le mur sud (z39), a hauteur d'enfant, sans texte : soleil, maison, trois personnages, lac vert (Hajar)
  ;[[24, -8], [25, -8], [24, -7], [25, -7]].forEach(p => S(p[0], p[1], 39, 'minecraft:yellow_terracotta')); S(23, -7, 39, 'minecraft:orange_terracotta'); S(26, -8, 39, 'minecraft:orange_terracotta')
  F(28, -10, 39, 30, -9, 39, 'minecraft:red_terracotta'); S(29, -10, 39, 'minecraft:brown_terracotta'); F(28, -8, 39, 30, -8, 39, 'minecraft:brown_terracotta'); S(29, -7, 39, 'minecraft:brown_terracotta')
  ;[[32, 'blue'], [34, 'red'], [36, 'green']].forEach(f => { S(f[0], -10, 39, 'minecraft:black_terracotta'); S(f[0], -9, 39, 'minecraft:' + f[1] + '_terracotta'); S(f[0], -8, 39, 'minecraft:pink_terracotta') })
  F(38, -10, 39, 40, -10, 39, 'minecraft:lime_terracotta'); S(39, -9, 39, 'minecraft:green_terracotta')
  // dans la rame : coussins et jarre (les Enfants y dorment au sec sur le plancher)
  ;[[27, 28, 'orange'], [33, 29, 'light_blue'], [38, 28, 'yellow']].forEach(c => SA(c[0], -10, c[1], 'handcrafted:' + c[2] + '_cushion'))
  // excroissances de Spore la ou l'eau suinte (pied du puits de jour, bord de la cuvette)
  for (var i = 0; i < 18; i++) { var x = 44 + Math.floor(R() * 8), z = R() < 0.5 ? 24 : 33; if (libreH(x, -10, z)) SA(x, -10, z, R() < 0.6 ? 'spore:growths_small' : 'spore:growths_big') }
  // bouche : lampadaire Macaw's eteint au bord de la tremie, poteau de signalisation sans panneau
  SA(36, 0, 9, 'mcwlights:classic_street_lamp'); F(27, 0, 4, 27, 1, 4, 'mcwfences:panelled_metal_fence')
  SA(37, 1, 5, 'supplementaries:sack')
}

var QFIN_STATION = function () {
  HB2 = true; FIN = true; THM = null
  lot(function () { HM = {}; FIN_VOLET = null; FIN_RID = null; tsStation(); finAncrage() }, 0, 0, 999, 6901, 80, 20)
  HB2 = false; FIN = false; THM = null; HM = {}
}
function vuesStation() {
  vue('s_bouche_ciel', 0, 0, 31.5, 40, -14, 31.5, 0, 8)
  vue('s_bouche', 0, 0, 31.5, 4.5, -2, 31.5, -4, 11)
  vue('s_escalier', 0, 0, 31.5, -4.4, 9, 31.5, -10, 24)
  vue('s_quai', 0, 0, 21, -8.4, 21, 55, -9.5, 30)
  vue('s_rame', 0, 0, 50, -8.4, 37, 32, -10.5, 28)
  vue('s_eau', 0, 0, 55, -9.5, 28.5, 20, -9.5, 28.5)
  vue('s_camp', 0, 0, 46, -8.4, 33, 27, -9.5, 36)
  vue('s_puits', 0, 0, 47.5, -9.4, 24, 47.5, 0, 28.5)
}
