
// ================= OUTILS D'AMENAGEMENT =================
function choix(l) { return l[Math.floor(R() * l.length)] }
var COULS = ['white', 'light_gray', 'gray', 'brown', 'blue', 'cyan', 'green', 'red', 'orange', 'yellow', 'lime', 'light_blue', 'purple', 'pink', 'black']
var BOIS = ['spruce', 'oak', 'birch', 'dark_oak', 'stripped_spruce', 'stripped_oak']
var CANAPES = ['gray', 'brown', 'black', 'white', 'light_gray', 'red', 'blue', 'green']

// Tour d'escalier exterieure (x..x+1, z0..z0+4), ouverte au sud sur les coursives
function tour(x, z0, nb, mur) {
  var H = 6 * nb + 3, DS = 'minecraft:stone_brick_stairs', VI = 'minecraft:light_gray_stained_glass'
  F(x - 1, 0, z0 - 1, x - 1, H, z0 + 4, mur); F(x + 2, 0, z0 - 1, x + 2, H, z0 + 4, mur); F(x, 0, z0 - 1, x + 1, H, z0 - 1, mur)
  for (var f = 0; f <= nb; f++) {
    var yb = 6 * f
    F(x, yb, z0, x + 1, yb, z0 + 4, 'minecraft:polished_andesite')
    if (f < nb) { F(x - 1, yb + 2, z0 + 1, x - 1, yb + 4, z0 + 2, VI); F(x + 2, yb + 2, z0 + 1, x + 2, yb + 4, z0 + 2, VI); F(x, yb + 2, z0 - 1, x + 1, yb + 4, z0 - 1, VI); S(x + 1, yb + 5, z0 + 4, 'minecraft:lantern[hanging=true]') }
  }
  for (var f = 0; f < nb; f++) {
    var yb = 6 * f
    S(x + 1, yb + 1, z0 + 3, DS + '[facing=north,half=bottom,shape=straight]'); S(x + 1, yb + 2, z0 + 2, DS + '[facing=north,half=bottom,shape=straight]'); S(x + 1, yb + 3, z0 + 1, DS + '[facing=north,half=bottom,shape=straight]')
    F(x, yb + 3, z0, x + 1, yb + 3, z0, 'minecraft:stone_bricks')
    F(x, yb + 6, z0, x + 1, yb + 6, z0 + 2, AIR)
    S(x, yb + 4, z0 + 1, DS + '[facing=south,half=bottom,shape=straight]'); S(x, yb + 5, z0 + 2, DS + '[facing=south,half=bottom,shape=straight]'); S(x, yb + 6, z0 + 3, DS + '[facing=south,half=bottom,shape=straight]')
  }
  F(x - 1, H + 1, z0 - 1, x + 2, H + 1, z0 + 4, 'minecraft:smooth_stone_slab[type=bottom]')
}

// Logement de 6 x 10 (a..a+5, z1..z1+9). Entree au nord en (a+2, z1-1) depuis la coursive.
function logement(a, z1, y, mur, etat) {
  var w = choix(BOIS), b = w.replace('stripped_', ''), sol = choix(['minecraft:oak_planks', 'minecraft:spruce_planks', 'minecraft:birch_planks', 'minecraft:light_gray_terracotta', 'minecraft:white_terracotta', 'minecraft:dark_oak_planks'])
  F(a, y, z1, a + 5, y, z1 + 9, sol)
  F(a + 3, y + 1, z1, a + 3, y + 5, z1 + 3, mur); F(a + 4, y + 1, z1 + 4, a + 5, y + 5, z1 + 4, mur); F(a, y + 1, z1 + 5, a + 5, y + 5, z1 + 5, mur); F(a + 3, y + 1, z1 + 6, a + 3, y + 5, z1 + 9, mur)
  PORTE(a + 1, y + 1, z1 + 5, 'minecraft:' + b + '_door', 'south', 'left', R() < 0.5 ? 'true' : 'false')
  PORTE(a + 3, y + 1, z1 + 7, 'minecraft:' + b + '_door', 'east', 'left', R() < 0.5 ? 'true' : 'false')
  PORTE(a + 3, y + 1, z1 + 2, 'minecraft:birch_door', 'east', 'right', 'false')
  // cuisine
  S(a, y + 1, z1, MAT(w + '_counter', 'south')); S(a + 1, y + 1, z1, 'mcwfurnitures:' + w + '_kitchen_sink[facing=south,water=false]')
  S(a, y + 3, z1, 'mcwfurnitures:' + w + '_kitchen_cabinet[facing=south,hinge=left]'); S(a + 1, y + 3, z1, 'mcwfurnitures:' + w + '_kitchen_cabinet[facing=south,hinge=right]')
  S(a, y + 1, z1 + 1, R() < 0.6 ? 'farmersdelight:stove[facing=east,lit=false]' : 'minecraft:furnace[facing=east,lit=false]'); S(a, y + 1, z1 + 3, 'minecraft:iron_block'); S(a, y + 2, z1 + 3, 'minecraft:iron_block')
  S(a + 1, y + 1, z1 + 2, 'mcwfurnitures:' + w + '_table'); S(a, y + 1, z1 + 2, MAT(w + '_chair', 'east')); S(a + 1, y + 1, z1 + 3, MAT(w + '_chair', 'north')); S(a + 1, y + 5, z1 + 2, 'minecraft:lantern[hanging=true]')
  S(a, y + 2, z1, choix(['farmersdelight:cutting_board[facing=south]', 'supplementaries:jar', 'minecraft:flower_pot', 'minecraft:air']))
  // salle de bain
  F(a + 4, y, z1, a + 5, y, z1 + 3, (a + y) % 12 ? 'minecraft:smooth_quartz' : 'minecraft:light_blue_terracotta')
  S(a + 4, y + 1, z1, 'minecraft:water_cauldron[level=' + (1 + Math.floor(R() * 3)) + ']'); S(a + 5, y + 1, z1, 'minecraft:quartz_stairs[facing=south,half=bottom,shape=straight]'); S(a + 5, y + 2, z1, 'minecraft:quartz_slab[type=bottom]')
  S(a + 4, y + 1, z1 + 3, 'minecraft:water_cauldron[level=3]'); S(a + 5, y + 1, z1 + 3, 'minecraft:water_cauldron[level=' + (R() < 0.5 ? 2 : 3) + ']'); S(a + 5, y + 4, z1 + 2, 'minecraft:end_rod[facing=down]')
  // sejour
  F(a + 1, y + 1, z1 + 6, a + 1, y + 1, z1 + 9, 'minecraft:' + choix(COULS) + '_carpet')
  var cp = choix(CANAPES); S(a, y + 1, z1 + 7, 'mcwfurnitures:' + cp + '_couch[facing=east,shape=single]'); S(a, y + 1, z1 + 8, 'mcwfurnitures:' + cp + '_couch[facing=east,shape=single]')
  S(a, y + 1, z1 + 6, 'mcwfurnitures:' + w + '_end_table'); S(a, y + 2, z1 + 6, choix(['minecraft:candle[candles=2,lit=false]', 'minecraft:potted_cactus', 'minecraft:air']))
  S(a, y + 1, z1 + 9, choix(['minecraft:potted_fern', 'minecraft:potted_bamboo', 'minecraft:bookshelf', 'mcwfurnitures:' + cp + '_couch[facing=east,shape=single]']))
  S(a + 2, y + 1, z1 + 8, MAT(w + '_drawer', 'west')); S(a + 2, y + 2, z1 + 8, 'minecraft:black_stained_glass_pane')
  S(a + 2, y + 1, z1 + 6, choix(['minecraft:bookshelf', 'minecraft:barrel[facing=up,open=false]', 'minecraft:potted_azalea_bush'])); S(a + 2, y + 1, z1 + 9, choix(['minecraft:potted_fern', 'minecraft:decorated_pot', 'minecraft:air']))
  S(a + 1, y + 5, z1 + 7, R() < 0.5 ? 'minecraft:lantern[hanging=true]' : 'mcwlights:iron_chandelier')
  // chambre
  var lit = choix(COULS); S(a + 5, y + 1, z1 + 8, 'minecraft:' + lit + '_bed[facing=south,part=head]'); S(a + 5, y + 1, z1 + 7, 'minecraft:' + lit + '_bed[facing=south,part=foot]')
  S(a + 5, y + 1, z1 + 9, 'mcwfurnitures:' + w + '_end_table'); S(a + 5, y + 2, z1 + 9, 'minecraft:candle[candles=1,lit=false]')
  S(a + 5, y + 1, z1 + 6, 'mcwfurnitures:' + w + '_wardrobe[facing=west,connection=base,hinge=left]')
  S(a + 4, y + 1, z1 + 9, choix(['minecraft:chest[facing=north]', 'minecraft:bookshelf', 'minecraft:barrel[facing=up,open=false]'])); S(a + 4, y + 1, z1 + 8, 'minecraft:' + lit + '_carpet')
  S(a + 4, y + 1, z1 + 6, choix(['minecraft:potted_poppy', 'minecraft:chest[facing=east]', 'minecraft:air']))
  // etat : 1 = pille, 2 = squat barricade
  if (etat == 1) { S(a, y + 1, z1 + 7, AIR); S(a + 1, y + 1, z1 + 8, 'supplementaries:sack'); S(a + 2, y + 1, z1 + 4, 'minecraft:barrel[facing=east,open=true]'); S(a + 1, y + 1, z1 + 1, 'minecraft:white_carpet'); S(a + 1, y + 1, z1 + 2, AIR) }
  if (etat == 2) { F(a + 1, y + 1, z1 + 6, a + 1, y + 1, z1 + 7, 'supplementaries:sack'); S(a + 2, y + 1, z1 + 9, 'minecraft:barrel[facing=up,open=false]'); S(a + 2, y + 1, z1 + 6, 'minecraft:crafting_table'); S(a + 4, y + 1, z1 + 8, 'minecraft:white_carpet') }
}

// ================= GRAND ENSEMBLE HLM (2 x 2 chunks, R+9, 36 logements) =================
function grandHLM() {
  var WC = 'minecraft:white_concrete', LG = 'minecraft:light_gray_concrete', GC = 'minecraft:gray_concrete', VP = 'minecraft:gray_stained_glass_pane', RL = 'mcwfences:panelled_metal_fence', NB = 10
  var X1 = 1, X2 = 29, ZN = 14, ZS = 25, YT = 6 * NB, BL = [2, 9, 16, 23]
  F(0, -1, 0, 31, -1, 31, 'minecraft:grass_block')
  // parking, aire de jeux, conteneurs (arriere)
  F(0, -1, 0, 31, -1, 11, GC); F(0, -1, 12, 31, -1, 13, 'minecraft:smooth_stone')
  for (var x = 2; x <= 29; x += 3) { if (x > 10 && x < 17) continue; F(x, -1, 0, x, -1, 4, WC); if (x < 19) F(x, -1, 7, x, -1, 10, WC) }
  for (var x = 0; x <= 31; x++) for (var z = 0; z <= 11; z++) if (R() < 0.06) S(x, -1, z, choix(['minecraft:andesite', 'minecraft:coarse_dirt', 'minecraft:cobblestone']))
  function voiture(x, z, c, brulee) {
    F(x, 0, z, x + 1, 0, z + 3, brulee ? 'minecraft:black_concrete' : 'minecraft:' + c + '_concrete'); F(x, 1, z + 1, x + 1, 1, z + 2, brulee ? 'minecraft:coal_block' : 'minecraft:tinted_glass')
    var sl = 'minecraft:' + (brulee ? 'blackstone' : 'smooth_stone') + '_slab[type=bottom]'; S(x, 1, z, sl); S(x + 1, 1, z, sl); S(x, 1, z + 3, sl); S(x + 1, 1, z + 3, sl)
    if (brulee) { S(x, 2, z + 1, 'minecraft:cobweb'); SA(x + 2, 0, z + 1, 'minecraft:gray_carpet') }
  }
  voiture(3, 1, 'red', false); voiture(9, 1, 'white', true); voiture(18, 1, 'blue', false); voiture(24, 0, 'light_gray', false); voiture(5, 7, 'black', true); voiture(27, 7, 'white', false)
  F(20, -1, 7, 25, -1, 10, 'minecraft:sand'); F(21, 0, 8, 21, 2, 8, 'minecraft:iron_bars'); F(24, 0, 8, 24, 2, 8, 'minecraft:iron_bars'); F(21, 3, 8, 24, 3, 8, 'minecraft:iron_bars')
  S(22, 2, 8, 'minecraft:chain[axis=y]'); S(22, 1, 8, 'minecraft:oak_slab[type=top]'); S(23, 2, 8, 'minecraft:chain[axis=y]'); S(23, 1, 8, 'minecraft:oak_slab[type=top]')
  F(25, 0, 10, 25, 1, 10, 'minecraft:quartz_block'); S(25, 2, 10, 'minecraft:iron_bars'); S(24, 0, 10, 'minecraft:quartz_stairs[facing=east,half=bottom,shape=straight]'); S(20, 0, 10, MAT('oak_chair', 'north'))
  F(0, 0, 5, 0, 0, 9, 'minecraft:green_shulker_box'); S(0, 0, 10, 'minecraft:gray_shulker_box'); S(1, 0, 6, 'supplementaries:sack'); S(1, 0, 9, 'supplementaries:sack'); S(1, 0, 8, 'minecraft:white_carpet')
  // structure de la barre
  F(X1, 0, ZN, X2, 0, ZS, GC); W(X1, ZN, X2, ZS, 1, YT - 1, WC)
  for (var f = 1; f < NB; f++) { var y = 6 * f; F(X1 + 1, y, ZN + 1, X2 - 1, y, ZS - 1, 'minecraft:smooth_stone'); F(X1, y, ZN, X2, y, ZN, GC); F(X1, y, ZS, X2, y, ZS, GC) }
  ;[8, 15, 22].forEach(x => F(x, 1, ZN + 1, x, YT - 1, ZS - 1, WC))
  ;[X1, 8, 15, 22, X2].forEach(x => { F(x, 1, ZS, x, YT - 1, ZS, LG); F(x, 1, ZN, x, YT - 1, ZN, LG); F(x, 1, 12, x, YT - 1, 12, LG) })
  F(X1 - 1, YT, ZN - 3, X2 + 1, YT, ZS + 1, 'minecraft:smooth_stone_slab[type=top]'); F(X1, YT, ZN, X2, YT, ZS, GC); W(X1, ZN, X2, ZS, YT + 1, YT + 1, LG)
  // tour d'escalier et coursives au nord
  tour(13, 7, NB, LG)
  for (var f = 1; f < NB; f++) {
    var y = 6 * f
    F(X1, y, 12, X2, y, 13, 'minecraft:smooth_stone_slab[type=top]'); F(X1 + 1, y + 1, 12, X2 - 1, y + 1, 12, RL); S(X1, y + 1, 13, RL); S(X2, y + 1, 13, RL); F(13, y + 1, 12, 14, y + 1, 12, AIR)
    F(X1, y - 1, 12, X2, y - 1, 12, LG); F(13, y - 1, 12, 14, y - 1, 12, AIR)
  }
  // logements : 4 par etage sur 9 etages
  for (var f = 1; f < NB; f++) BL.forEach((a, i) => {
    var y = 6 * f, etat = R() < 0.22 ? 1 : (R() < 0.15 ? 2 : 0), c = choix(['cyan_terracotta', 'orange_terracotta', 'yellow_terracotta', 'light_blue_terracotta', 'red_terracotta', 'lime_terracotta'])
    logement(a, ZN + 1, y, WC, etat)
    // facade nord : porte palliere, fenetres, paillasson, plantes
    PORTE(a + 2, y + 1, ZN, 'mcwdoors:metal_door', 'north', i % 2 ? 'left' : 'right', 'false'); F(a, y + 2, ZN, a + 1, y + 3, ZN, VP); S(a + 5, y + 3, ZN, VP); S(a + 4, y + 3, ZN, VP)
    S(a + 2, y + 1, 13, 'minecraft:' + choix(['brown', 'gray', 'red', 'black', 'green']) + '_carpet')
    if (R() < 0.6) S(a + 4, y + 1, 13, choix(['minecraft:potted_fern', 'minecraft:decorated_pot', 'minecraft:barrel[facing=up,open=false]', 'supplementaries:sack', 'minecraft:potted_dead_bush']))
    if (R() < 0.3) S(a, y + 1, 13, choix(['minecraft:cauldron', 'minecraft:composter', 'minecraft:oak_trapdoor[facing=south,half=bottom,open=true]']))
    // facade sud : porte-fenetre, balcon en saillie ou loggia, fenetre de chambre
    F(a, y + 2, ZS, a + 2, y + 3, ZS, VP); PORTE(a + 1, y + 1, ZS, 'mcwdoors:metal_door', 'south', 'left', 'false'); F(a + 4, y + 2, ZS, a + 5, y + 3, ZS, VP)
    if ((f + i) % 2 == 0) {
      F(a - 1, y, ZS + 1, a + 3, y, ZS + 2, 'minecraft:smooth_stone_slab[type=top]'); F(a, y + 1, ZS + 2, a + 2, y + 1, ZS + 2, RL); S(a + 3, y + 1, ZS + 1, RL); S(a + 3, y + 1, ZS + 2, RL)
      F(a - 1, y + 1, ZS + 1, a - 1, y + 3, ZS + 2, 'minecraft:' + c); S(a - 1, y + 4, ZS + 1, 'minecraft:' + c)
      if (R() < 0.5) S(a, y + 1, ZS + 1, choix(['minecraft:potted_fern', 'minecraft:barrel[facing=up,open=false]', 'minecraft:decorated_pot', MAT('spruce_chair', 'south'), 'minecraft:composter']))
      if (R() < 0.4) S(a + 2, y + 3, ZS + 2, 'minecraft:' + choix(['white', 'red', 'blue', 'yellow', 'pink', 'light_gray']) + '_wall_banner[facing=south]')
    } else {
      F(a, y + 1, ZS + 1, a + 2, y + 1, ZS + 1, RL); F(a - 1, y + 1, ZS + 1, a - 1, y + 4, ZS + 1, 'minecraft:' + c); F(a - 1, y + 5, ZS + 1, a + 3, y + 5, ZS + 1, 'minecraft:smooth_stone_slab[type=top]')
      if (R() < 0.5) S(a + 1, y + 1, ZS + 2, 'minecraft:' + choix(['white', 'light_blue', 'pink', 'yellow']) + '_wall_banner[facing=south]')
    }
    if (R() < 0.35) { S(a + 5, y + 2, ZS + 1, 'minecraft:smooth_stone'); S(a + 5, y + 3, ZS + 1, 'minecraft:iron_trapdoor[facing=north,half=bottom,open=false]') }
    if (R() < 0.25) { S(a + 4, y + 4, ZS + 1, 'minecraft:iron_trapdoor[facing=south,half=bottom,open=true]'); S(a + 4, y + 5, ZS + 1, 'minecraft:lightning_rod[facing=south]') }
    if (etat == 2) { F(a, y + 2, ZS, a + 2, y + 3, ZS, 'minecraft:spruce_planks'); S(a + 4, y + 2, ZS, 'minecraft:spruce_trapdoor[facing=north,half=bottom,open=true]'); S(a + 5, y + 3, ZS, 'minecraft:oak_planks') }
    if (etat == 1 && R() < 0.5) S(a + 4, y + 3, ZS, AIR)
  })
  // rez-de-chaussee : boulangerie, hall d'entree, kebab, superette pillee (sans enseigne)
  var stores = ['red', 'green', 'blue', 'orange']
  ;[2, 9, 16, 23].forEach((s, i) => {
    F(s, 0, ZN + 1, s + 5, 0, ZS - 1, i % 2 ? 'minecraft:white_terracotta' : 'minecraft:light_gray_terracotta')
    F(s, 1, ZS, s + 5, 4, ZS, AIR); F(s, 1, ZS, s + 5, 1, ZS, 'minecraft:black_concrete'); F(s, 2, ZS, s + 5, 3, ZS, 'minecraft:glass_pane'); F(s, 4, ZS, s + 5, 4, ZS, LG)
    if (i == 1) { F(s + 2, 1, ZS, s + 3, 3, ZS, AIR); PORTE(s + 2, 1, ZS, 'mcwdoors:metal_door', 'south', 'left', 'false'); PORTE(s + 3, 1, ZS, 'mcwdoors:metal_door', 'south', 'right', 'false'); F(s + 1, 4, ZS + 1, s + 4, 4, ZS + 1, 'minecraft:smooth_stone_slab[type=bottom]') }
    else { PORTE(s + 1, 1, ZS, 'mcwdoors:metal_door', 'south', 'left', 'false'); F(s, 4, ZS + 1, s + 5, 4, ZS + 1, 'supplementaries:awning_' + stores[i] + '[facing=south]'); F(s, 1, 19, s + 5, 5, 19, WC); PORTE(s + 4, 1, 19, 'minecraft:spruce_door', 'south', 'left', 'false') }
  })
  // boulangerie
  F(3, 1, 22, 6, 1, 22, MAT('stripped_spruce_counter', 'south')); S(4, 2, 22, 'farmersdelight:cutting_board[facing=south]'); S(5, 2, 22, 'supplementaries:jar'); S(2, 1, 20, 'minecraft:smoker[facing=south,lit=false]'); S(7, 1, 20, 'minecraft:smoker[facing=south,lit=false]')
  F(3, 1, 20, 6, 1, 20, 'minecraft:barrel[facing=up,open=false]'); F(3, 2, 20, 6, 2, 20, 'minecraft:spruce_trapdoor[facing=south,half=bottom,open=true]'); S(2, 1, 24, 'minecraft:potted_bamboo')
  F(2, 1, 15, 7, 1, 15, 'supplementaries:sack'); S(3, 1, 17, 'minecraft:barrel[facing=up,open=false]'); S(6, 1, 16, 'minecraft:crafting_table')
  // hall d'entree : boites aux lettres, banc, porte vers la coursive
  F(9, 0, 15, 14, 0, 24, 'minecraft:polished_andesite'); F(9, 2, 17, 9, 3, 22, 'minecraft:iron_trapdoor[facing=east,half=bottom,open=true]'); F(14, 1, 19, 14, 1, 21, 'mcwfurnitures:gray_couch[facing=west,shape=single]')
  PORTE(11, 1, ZN, 'mcwdoors:metal_door', 'north', 'left', 'false'); PORTE(12, 1, ZN, 'mcwdoors:metal_door', 'north', 'right', 'false'); S(13, 1, 16, 'minecraft:potted_dead_bush'); S(10, 1, 23, 'minecraft:potted_fern')
  // kebab
  F(17, 1, 21, 20, 1, 21, MAT('stripped_oak_counter', 'south')); S(18, 2, 21, 'farmersdelight:cooking_pot'); S(20, 1, 20, 'farmersdelight:stove[facing=south,lit=false]')
  S(17, 1, 23, 'mcwfurnitures:oak_table'); S(16, 1, 23, MAT('oak_chair', 'east')); S(20, 1, 23, 'mcwfurnitures:oak_table'); S(21, 1, 23, MAT('oak_chair', 'west')); S(19, 1, 23, MAT('oak_chair', 'east'))
  // superette pillee
  ;[21, 23].forEach(z => F(24, 1, z, 27, 2, z, 'minecraft:chiseled_bookshelf[facing=south]')); S(26, 1, 22, 'minecraft:barrel[facing=east,open=true]'); S(25, 1, 24, 'supplementaries:sack'); S(27, 1, 24, 'minecraft:white_carpet'); S(28, 1, 22, 'supplementaries:sack')
  F(23, 2, ZS + 1, 28, 3, ZS + 1, 'minecraft:iron_trapdoor[facing=south,half=bottom,open=true]'); F(25, 2, ZS + 1, 26, 3, ZS + 1, AIR)
  ;[[4, 22], [11, 20], [18, 23], [26, 22]].forEach(c => S(c[0], 5, c[1], 'minecraft:lantern[hanging=true]'))
  // toit : local technique, antennes, paraboles
  ;[4, 19, 26].forEach(x => { F(x, YT + 1, 22, x, YT + 4, 22, 'minecraft:iron_bars'); S(x, YT + 5, 22, 'minecraft:lightning_rod') })
  ;[3, 10, 20, 25].forEach(x => { S(x, YT + 1, 17, 'minecraft:iron_block'); S(x, YT + 2, 17, 'minecraft:daylight_detector') })
  F(6, YT + 1, 19, 9, YT + 3, 22, LG); F(6, YT + 4, 19, 9, YT + 4, 22, 'minecraft:smooth_stone_slab[type=bottom]'); PORTE(7, YT + 1, 19, 'mcwdoors:metal_door', 'north', 'left', 'false')
  // parvis : arbres, bancs, abribus
  F(0, -1, 26, 31, -1, 31, 'minecraft:smooth_stone'); for (var x = 0; x <= 31; x++) if (x % 4 == 0) S(x, -1, 29, 'minecraft:polished_andesite')
  ;[3, 18, 27].forEach(x => { S(x, -1, 29, 'minecraft:coarse_dirt'); F(x, 0, 29, x, 4, 29, 'minecraft:oak_log[axis=y]'); for (var dx = -2; dx <= 2; dx++) for (var dz = -2; dz <= 2; dz++) for (var y = 4; y <= 7; y++) if (Math.abs(dx) + Math.abs(dz) + Math.abs(y - 5.5) < 3.6 && R() < 0.85) SA(x + dx, y, 29 + dz, 'minecraft:oak_leaves[persistent=true]') })
  ;[6, 22].forEach(x => { S(x, 0, 30, MAT('oak_chair', 'south')); S(x + 1, 0, 30, MAT('oak_chair', 'south')); S(x + 2, 0, 30, 'minecraft:cauldron') })
  F(10, 0, 31, 10, 3, 31, 'minecraft:iron_bars'); F(14, 0, 31, 14, 3, 31, 'minecraft:iron_bars'); F(10, 4, 30, 14, 4, 31, 'minecraft:smooth_stone_slab[type=bottom]'); F(11, 1, 31, 13, 3, 31, 'minecraft:glass_pane'); F(11, 0, 30, 13, 0, 30, 'mcwfurnitures:gray_couch[facing=north,shape=single]')
  S(15, 0, 30, 'mcwlights:garden_light')
  for (var x = 0; x <= 31; x++) for (var z = 26; z <= 31; z++) if (R() < 0.05) SA(x, 0, z, choix(['minecraft:short_grass', 'supplementaries:sack', 'minecraft:white_carpet']))
}

// ================= GRANDE VILLA (2 x 2 chunks) =================
function grandeVilla() {
  var WT = 'minecraft:white_terracotta', SS = 'minecraft:smooth_sandstone', CS = 'minecraft:cut_sandstone', QP = 'minecraft:quartz_pillar', VO = 'minecraft:warped_trapdoor', TU = f => TOIT(f, 'orange_terracotta'), SL = 'minecraft:smooth_sandstone_slab'
  function croupe(x1, z1, x2, z2, y0) {
    for (var k = 0; k < 14; k++) {
      var a = x1 + k, b = x2 - k, c = z1 + k, d = z2 - k, y = y0 + k
      if (b - a < 1 || d - c < 1) { if (b >= a && d >= c) F(a, y, c, b, y, d, 'minecraft:granite_slab[type=bottom]'); break }
      F(a, y, c, b, y, c, TU('south')); F(a, y, d, b, y, d, TU('north')); F(a, y, c + 1, a, y, d - 1, TU('east')); F(b, y, c + 1, b, y, d - 1, TU('west'))
    }
  }
  function volets(x, y, z) { [x - 1, x + 1].forEach(v => { S(v, y, z, VO + '[facing=south,half=bottom,open=true]'); S(v, y + 1, z, VO + '[facing=south,half=bottom,open=true]') }) }
  F(0, -1, 0, 31, -1, 31, 'minecraft:grass_block')
  // mur d'enceinte, piliers, portail entrouvert
  W(0, 0, 31, 31, 0, 1, 'minecraft:sandstone_wall'); for (var i = 0; i <= 31; i += 5) { F(i, 0, 31, i, 2, 31, CS); S(i, 3, 31, 'minecraft:decorated_pot'); F(i, 0, 0, i, 2, 0, CS); F(0, 0, i, 0, 2, i, CS); F(31, 0, i, 31, 2, i, CS) }
  F(13, 0, 31, 18, 2, 31, AIR); F(12, 0, 31, 12, 3, 31, CS); F(19, 0, 31, 19, 3, 31, CS); S(12, 4, 31, 'mcwlights:garden_light'); S(19, 4, 31, 'mcwlights:garden_light')
  F(13, 0, 31, 15, 1, 31, 'mcwfences:ornate_metal_fence'); F(16, 0, 30, 16, 1, 30, 'mcwfences:ornate_metal_fence'); F(17, 0, 29, 17, 1, 29, 'mcwfences:ornate_metal_fence')
  // allee et rond-point a fontaine
  F(14, -1, 17, 17, -1, 31, 'minecraft:gravel')
  for (var x = 9; x <= 22; x++) for (var z = 18; z <= 29; z++) { var d = Math.hypot(x - 15.5, z - 23.5); if (d < 5.3) S(x, -1, z, 'minecraft:gravel'); if (d < 2.7) S(x, -1, z, SS); if (d >= 1.7 && d < 2.7) S(x, 0, z, SL + '[type=bottom]') }
  F(14, 0, 22, 17, 0, 25, 'minecraft:water'); S(14, 0, 22, SL + '[type=bottom]'); S(17, 0, 22, SL + '[type=bottom]'); S(14, 0, 25, SL + '[type=bottom]'); S(17, 0, 25, SL + '[type=bottom]')
  F(15, 0, 23, 16, 0, 24, CS); F(15, 1, 23, 16, 1, 24, 'minecraft:sandstone_wall'); F(15, 2, 23, 16, 2, 24, SL + '[type=bottom]'); S(15, 3, 23, 'minecraft:decorated_pot'); S(16, 3, 24, 'minecraft:decorated_pot')
  // corps principal R+1
  var X1 = 6, X2 = 25, Z1 = 3, Z2 = 15
  F(X1, 0, Z1, X2, 0, Z2, SS); W(X1, Z1, X2, Z2, 1, 11, WT); F(X1, 6, Z1, X2, 6, Z2, CS); F(X1 + 1, 6, Z1 + 1, X2 - 1, 6, Z2 - 1, 'minecraft:spruce_planks'); F(X1, 11, Z1, X2, 11, Z2, CS)
  for (var x = X1; x <= X2; x++) { S(x, 11, Z2 + 1, 'minecraft:smooth_sandstone_stairs[facing=north,half=top,shape=straight]'); S(x, 11, Z1 - 1, 'minecraft:smooth_sandstone_stairs[facing=south,half=top,shape=straight]'); S(x, 6, Z2 + 1, SL + '[type=top]') }
  ;[X1, X2].forEach(x => { F(x, 1, Z2, x, 11, Z2, CS); F(x, 1, Z1, x, 11, Z1, CS) })
  croupe(X1 - 1, Z1 - 1, X2 + 1, Z2 + 1, 12)
  ;[10, 21].forEach(x => { F(x, 12, Z1 + 3, x, 16, Z1 + 3, 'minecraft:bricks'); S(x, 17, Z1 + 3, 'minecraft:brick_slab[type=bottom]') })
  // portique a colonnes, balcon d'honneur
  F(12, 0, 16, 19, 0, 19, SS); F(12, 0, 20, 19, 0, 20, 'minecraft:smooth_sandstone_stairs[facing=north,half=bottom,shape=straight]')
  ;[12, 14, 17, 19].forEach(x => { F(x, 1, 19, x, 10, 19, QP); S(x, 1, 19, CS) }); F(12, 11, 16, 19, 11, 19, CS); F(11, 11, 20, 20, 11, 20, 'minecraft:smooth_sandstone_stairs[facing=north,half=top,shape=straight]')
  F(13, 12, 16, 18, 12, 19, SL + '[type=bottom]'); F(12, 12, 20, 19, 12, 20, 'minecraft:sandstone_wall'); F(14, 12, 20, 17, 13, 20, 'minecraft:chiseled_sandstone'); F(15, 14, 20, 16, 14, 20, SL + '[type=bottom]')
  F(12, 6, 16, 19, 6, 19, SL + '[type=top]'); F(13, 7, 19, 18, 7, 19, 'mcwfences:ornate_metal_fence'); S(13, 7, 17, 'minecraft:potted_azalea_bush'); S(18, 7, 17, 'minecraft:potted_azalea_bush')
  S(15, 5, 18, 'mcwlights:iron_chandelier'); S(16, 10, 18, 'minecraft:lantern[hanging=true]')
  F(14, 1, Z2, 17, 4, Z2, 'minecraft:glass_pane'); PORTE(15, 1, Z2, 'mcwdoors:dark_oak_glass_door', 'south', 'left', 'false'); PORTE(16, 1, Z2, 'mcwdoors:dark_oak_glass_door', 'south', 'right', 'false'); F(14, 1, Z2, 14, 2, Z2, QP); F(17, 1, Z2, 17, 2, Z2, QP)
  F(14, 7, Z2, 17, 9, Z2, 'minecraft:glass_pane'); PORTE(15, 7, Z2, 'mcwdoors:spruce_glass_door', 'south', 'left', 'false'); PORTE(16, 7, Z2, 'mcwdoors:spruce_glass_door', 'south', 'right', 'false')
  // fenetres a volets, jardinieres et garde-corps
  ;[8, 11, 20, 23].forEach(x => {
    ;[1, 7].forEach(y => { F(x, y + 1, Z2, x, y + 3, Z2, 'minecraft:glass_pane'); volets(x, y + 1, Z2 + 1); S(x, y + 4, Z2 + 1, 'minecraft:smooth_sandstone_stairs[facing=north,half=top,shape=straight]') })
    S(x, 8, Z2 + 1, 'mcwfences:ornate_metal_fence'); S(x, 1, Z2 + 1, 'supplementaries:planter'); SA(x, 2, Z2 + 1, 'minecraft:rose_bush[half=lower]'); SA(x, 3, Z2 + 1, 'minecraft:rose_bush[half=upper]')
    F(x, 2, Z1, x, 4, Z1, 'minecraft:glass_pane'); F(x, 8, Z1, x, 10, Z1, 'minecraft:glass_pane')
  })
  F(X2, 2, 11, X2, 4, 13, 'minecraft:glass_pane'); F(X2, 8, 11, X2, 10, 13, 'minecraft:glass_pane'); F(X1, 8, 7, X1, 10, 11, 'minecraft:glass_pane')
  // tour belvedere a l'est (cuisine, salon de musique, bureau panoramique)
  F(26, 0, 4, 30, 0, 9, SS); W(26, 4, 30, 9, 1, 17, WT); F(26, 6, 4, 30, 6, 9, CS); F(26, 12, 4, 30, 12, 9, CS); F(27, 6, 5, 29, 6, 8, 'minecraft:spruce_planks'); F(27, 12, 5, 29, 12, 8, 'minecraft:spruce_planks')
  ;[26, 30].forEach(x => { F(x, 0, 4, x, 17, 4, CS); F(x, 0, 9, x, 17, 9, CS) })
  F(30, 13, 5, 30, 16, 8, 'minecraft:glass_pane'); F(27, 13, 9, 29, 16, 9, 'minecraft:glass_pane'); F(27, 13, 4, 29, 16, 4, 'minecraft:glass_pane'); F(30, 8, 6, 30, 10, 7, 'minecraft:glass_pane'); F(30, 2, 6, 30, 4, 7, 'minecraft:glass_pane'); F(28, 8, 9, 28, 10, 9, 'minecraft:glass_pane')
  croupe(25, 3, 31, 10, 18); F(25, 17, 3, 31, 17, 10, SL + '[type=top]')
  F(26, 1, 6, 26, 2, 6, AIR); PORTE(X2, 1, 6, 'mcwdoors:dark_oak_classic_door', 'east', 'left', 'true'); F(26, 7, 6, 26, 8, 6, AIR); PORTE(X2, 7, 6, 'mcwdoors:dark_oak_classic_door', 'east', 'left', 'true')
  for (var y = 1; y <= 12; y++) S(27, y, 8, 'minecraft:ladder[facing=north]')
  // aile ouest : salle de billard, terrasse plantee sur le toit
  F(1, 0, 4, 5, 0, 13, SS); W(1, 4, 5, 13, 1, 5, WT); F(1, 6, 4, 5, 6, 13, SS); F(1, 7, 4, 5, 7, 13, 'minecraft:sandstone_wall'); F(2, 7, 5, 4, 7, 12, AIR); F(2, 0, 5, 4, 0, 12, 'minecraft:dark_oak_planks')
  ;[[1, 4], [5, 4], [1, 13], [5, 13]].forEach(c => F(c[0], 0, c[1], c[0], 7, c[1], CS))
  F(1, 2, 6, 1, 4, 11, 'minecraft:glass_pane'); F(2, 2, 13, 4, 4, 13, 'minecraft:glass_pane'); F(5, 1, 12, 6, 3, 12, AIR); PORTE(X1, 7, 8, 'mcwdoors:spruce_glass_door', 'west', 'left', 'false')
  F(2, 1, 7, 4, 1, 9, 'minecraft:dark_oak_slab[type=top]'); F(2, 2, 7, 4, 2, 9, 'minecraft:green_carpet'); F(2, 1, 5, 4, 2, 5, 'minecraft:bookshelf'); S(3, 5, 8, 'mcwlights:iron_chandelier'); S(2, 1, 11, MAT('dark_oak_chair', 'east')); S(4, 1, 11, 'minecraft:barrel[facing=up,open=false]'); S(4, 2, 11, 'minecraft:brewing_stand')
  ;[2, 3, 4].forEach(x => { S(x, 7, 5, 'minecraft:decorated_pot'); S(x, 7, 12, 'supplementaries:planter') })
  ;[[2, 6], [4, 6], [2, 11], [4, 11]].forEach(c => F(c[0], 7, c[1], c[0], 9, c[1], 'minecraft:stripped_oak_log[axis=y]')); F(2, 10, 6, 4, 10, 11, 'minecraft:oak_fence')
  for (var z = 6; z <= 11; z++) for (var x = 2; x <= 4; x++) if (R() < 0.55) S(x, 10, z, 'minecraft:flowering_azalea_leaves[persistent=true]')
  S(3, 7, 8, 'mcwfurnitures:spruce_table'); S(3, 7, 9, MAT('spruce_chair', 'north')); S(3, 7, 7, MAT('spruce_chair', 'south'))
  // piscine, plage, transats, parasol, pool-house
  F(20, -1, 21, 29, -1, 28, SS); F(21, -3, 22, 28, -2, 27, 'minecraft:light_blue_terracotta'); F(22, -2, 23, 27, -1, 26, 'minecraft:water'); S(26, -2, 25, 'minecraft:sea_pickle[pickles=1,waterlogged=true]')
  ;[22, 24, 26].forEach(x => { S(x, 0, 21, 'mcwfurnitures:white_chaise'); SA(x + 1, 0, 21, 'minecraft:potted_fern') }); F(29, 0, 24, 29, 3, 24, 'minecraft:oak_fence'); F(28, 4, 23, 30, 4, 25, 'minecraft:white_wool'); S(28, 4, 23, AIR); S(30, 4, 23, AIR); S(28, 4, 25, AIR); S(30, 4, 25, AIR)
  F(23, 0, 29, 30, 0, 30, SS); F(23, 1, 30, 30, 3, 30, WT); F(23, 1, 29, 23, 3, 29, WT); F(30, 1, 29, 30, 3, 29, WT); F(24, 1, 29, 29, 1, 29, MAT('stripped_spruce_counter', 'north')); S(26, 2, 29, 'supplementaries:jar'); S(28, 2, 29, 'minecraft:potted_bamboo')
  F(22, 4, 28, 31, 4, 28, TU('south')); F(22, 4, 29, 31, 4, 30, SL + '[type=bottom]')
  // jardin ouest : allee de cypres, parterres, pergola fleurie
  for (var z = 17; z <= 29; z += 3) [2, 9].forEach(x => { F(x, 0, z, x, 6, z, 'minecraft:spruce_log[axis=y]'); for (var y = 1; y <= 8; y++) { var r = y < 7 ? 1 : 0; for (var dx = -r; dx <= r; dx++) for (var dz = -r; dz <= r; dz++) if (Math.abs(dx) + Math.abs(dz) == 1 || (dx == 0 && dz == 0 && y > 6)) SA(x + dx, y, z + dz, 'minecraft:spruce_leaves[persistent=true]') } })
  F(4, -1, 17, 7, -1, 24, 'minecraft:gravel'); for (var z = 17; z <= 24; z++) { SA(4, 0, z, choix(['minecraft:poppy', 'minecraft:red_tulip', 'minecraft:azure_bluet', 'minecraft:allium'])); SA(7, 0, z, choix(['minecraft:poppy', 'minecraft:pink_tulip', 'minecraft:oxeye_daisy', 'minecraft:lily_of_the_valley'])) }
  F(3, -1, 25, 8, -1, 29, SS); ;[[3, 25], [8, 25], [3, 29], [8, 29]].forEach(c => F(c[0], 0, c[1], c[0], 3, c[1], QP)); F(3, 4, 25, 8, 4, 29, 'minecraft:oak_fence'); for (var x = 3; x <= 8; x++) for (var z = 25; z <= 29; z++) if (R() < 0.55) S(x, 4, z, 'minecraft:cherry_leaves[persistent=true]')
  F(5, 0, 27, 6, 0, 27, 'mcwfurnitures:spruce_table'); S(4, 0, 27, MAT('spruce_chair', 'east')); S(7, 0, 27, MAT('spruce_chair', 'west')); S(5, 0, 26, MAT('spruce_chair', 'south')); S(6, 0, 28, MAT('spruce_chair', 'north')); S(5, 3, 27, 'minecraft:lantern[hanging=true]')
  for (var x = 0; x <= 31; x++) for (var z = 16; z <= 30; z++) if (R() < 0.07) SA(x, 0, z, choix(['minecraft:short_grass', 'minecraft:fern', 'minecraft:short_grass', 'minecraft:dead_bush']))
  // facade nord : terrasse de service, potager
  F(10, -1, 1, 22, -1, 2, SS); F(12, -1, 1, 14, -1, 1, 'minecraft:farmland'); F(17, -1, 1, 20, -1, 1, 'minecraft:farmland'); F(12, 0, 1, 14, 0, 1, 'minecraft:wheat[age=7]'); F(17, 0, 1, 20, 0, 1, 'minecraft:carrots[age=5]')
  PORTE(15, 1, Z1, 'mcwdoors:dark_oak_classic_door', 'north', 'left', 'false')
  // ================= interieur rez-de-chaussee =================
  for (var x = X1 + 1; x <= X2 - 1; x++) for (var z = Z1 + 1; z <= Z2 - 1; z++) S(x, 0, z, (x + z) % 2 ? 'minecraft:smooth_quartz' : 'minecraft:polished_diorite')
  F(12, 1, Z1 + 1, 12, 5, Z2 - 1, WT); F(19, 1, Z1 + 1, 19, 5, Z2 - 1, WT); F(12, 1, 11, 12, 4, 13, AIR); F(19, 1, 11, 19, 4, 13, AIR)
  // grand hall double hauteur, escalier d'honneur
  F(14, 6, 6, 17, 6, 12, AIR)
  for (var i = 0; i < 6; i++) { F(14, 1 + i, 10 - i, 17, 1 + i, 10 - i, 'minecraft:quartz_stairs[facing=north,half=bottom,shape=straight]'); if (i > 0) F(14, 1, 10 - i, 17, i, 10 - i, 'minecraft:quartz_block') }
  F(13, 1, 4, 13, 5, 10, WT); F(18, 1, 4, 18, 5, 10, WT); F(13, 7, 6, 13, 7, 12, 'mcwfences:ornate_metal_fence'); F(18, 7, 6, 18, 7, 12, 'mcwfences:ornate_metal_fence'); F(13, 7, 13, 18, 7, 13, 'mcwfences:ornate_metal_fence')
  F(14, 1, 11, 17, 1, 14, 'minecraft:red_carpet'); S(15, 10, 9, 'mcwlights:iron_chandelier'); S(16, 10, 9, 'mcwlights:iron_chandelier')
  ;[[13, 14], [18, 14]].forEach(c => { S(c[0], 1, c[1], 'minecraft:decorated_pot'); S(c[0], 2, c[1], 'minecraft:azalea_leaves[persistent=true]') })
  // grand salon ouest avec cheminee
  F(X1 + 1, 1, 8, X1 + 1, 5, 11, 'minecraft:quartz_bricks'); S(X1 + 1, 1, 9, 'minecraft:campfire[lit=false,facing=east]'); S(X1 + 1, 1, 10, 'minecraft:campfire[lit=false,facing=east]'); S(X1 + 1, 2, 9, AIR); S(X1 + 1, 2, 10, AIR); F(X1 + 2, 3, 8, X1 + 2, 3, 11, 'minecraft:quartz_slab[type=top]'); S(X1 + 2, 4, 9, 'minecraft:candle[candles=3,lit=false]'); S(X1 + 2, 4, 10, 'minecraft:decorated_pot')
  F(9, 1, 8, 10, 1, 8, 'mcwfurnitures:white_couch[facing=south,shape=single]'); F(9, 1, 11, 10, 1, 11, 'mcwfurnitures:white_couch[facing=north,shape=single]'); F(11, 1, 9, 11, 1, 10, 'mcwfurnitures:light_gray_couch[facing=west,shape=single]')
  F(8, 0, 9, 10, 0, 10, 'minecraft:red_terracotta'); S(9, 1, 9, 'mcwfurnitures:dark_oak_coffee_table'); S(9, 1, 10, 'mcwfurnitures:dark_oak_coffee_table'); S(9, 2, 9, 'minecraft:candle[candles=2,lit=false]'); S(10, 1, 9, 'minecraft:red_carpet'); S(10, 1, 10, 'minecraft:red_carpet')
  F(7, 1, 4, 11, 3, 4, 'minecraft:bookshelf'); S(9, 1, 4, 'minecraft:chiseled_bookshelf[facing=south]'); S(8, 1, 13, 'minecraft:note_block'); S(8, 2, 13, 'minecraft:spruce_pressure_plate'); S(8, 1, 14, MAT('dark_oak_chair', 'north')); S(9, 5, 10, 'mcwlights:iron_chandelier'); S(11, 1, 14, 'minecraft:potted_bamboo'); S(7, 1, 14, 'minecraft:potted_azalea_bush'); S(10, 1, 5, 'supplementaries:globe')
  // salle a manger est
  F(21, 1, 7, 23, 1, 11, 'mcwfurnitures:dark_oak_table'); for (var z = 7; z <= 11; z++) { S(20, 1, z, MAT('dark_oak_chair', 'east')); S(24, 1, z, MAT('dark_oak_chair', 'west')) } S(22, 1, 6, MAT('dark_oak_chair', 'south')); S(22, 1, 12, MAT('dark_oak_chair', 'north'))
  S(22, 5, 9, 'mcwlights:iron_chandelier'); F(20, 1, 4, 24, 1, 4, MAT('dark_oak_drawer', 'south')); S(21, 2, 4, 'minecraft:candle[candles=3,lit=false]'); S(23, 2, 4, 'minecraft:decorated_pot'); S(22, 2, 9, 'minecraft:candle[candles=4,lit=false]'); S(22, 2, 7, 'supplementaries:jar'); S(20, 1, 14, 'minecraft:potted_azalea_bush'); S(24, 1, 14, 'minecraft:potted_bamboo')
  // cuisine dans la tour
  F(27, 1, 5, 29, 1, 5, MAT('stripped_oak_counter', 'south')); S(28, 1, 5, 'farmersdelight:stove[facing=south,lit=false]'); S(28, 2, 5, 'farmersdelight:cooking_pot'); F(29, 1, 6, 29, 1, 8, MAT('stripped_oak_counter', 'west')); S(29, 1, 7, 'mcwfurnitures:stripped_oak_kitchen_sink[facing=west,water=false]'); S(28, 1, 8, 'minecraft:barrel[facing=up,open=false]'); S(27, 3, 5, 'mcwfurnitures:stripped_oak_kitchen_cabinet[facing=south,hinge=left]'); S(29, 3, 5, 'mcwfurnitures:stripped_oak_kitchen_cabinet[facing=south,hinge=right]'); S(29, 2, 6, 'farmersdelight:cutting_board[facing=west]')
  // ================= etage =================
  F(11, 7, 4, 11, 10, 14, WT); F(20, 7, 4, 20, 10, 14, WT); PORTE(11, 7, 5, 'mcwdoors:dark_oak_classic_door', 'west', 'left', 'true'); PORTE(20, 7, 5, 'mcwdoors:dark_oak_classic_door', 'east', 'left', 'true')
  // suite parentale
  LIT(8, 7, 6, 'white', 'north'); LIT(9, 7, 6, 'white', 'north'); S(7, 7, 5, 'mcwfurnitures:dark_oak_end_table'); S(10, 7, 5, 'mcwfurnitures:dark_oak_end_table'); S(7, 8, 5, 'minecraft:candle[candles=2,lit=false]'); S(10, 8, 5, 'minecraft:candle[candles=2,lit=false]')
  F(7, 7, 12, 7, 7, 14, 'mcwfurnitures:dark_oak_wardrobe[facing=east,connection=base,hinge=left]'); F(8, 7, 8, 9, 7, 9, 'minecraft:white_carpet'); S(9, 7, 13, 'minecraft:water_cauldron[level=3]'); S(10, 7, 13, 'minecraft:water_cauldron[level=3]'); S(10, 7, 14, 'minecraft:quartz_stairs[facing=west,half=bottom,shape=straight]'); S(9, 10, 9, 'mcwlights:iron_chandelier'); S(10, 7, 10, 'mcwfurnitures:light_gray_couch[facing=west,shape=single]')
  // chambres d'enfants
  LIT(21, 7, 5, 'light_blue', 'north'); LIT(24, 7, 5, 'pink', 'north'); S(22, 7, 4, 'mcwfurnitures:spruce_end_table'); S(23, 7, 4, 'mcwfurnitures:spruce_end_table'); S(22, 8, 4, 'minecraft:candle[candles=1,lit=false]'); F(21, 7, 8, 24, 7, 9, 'minecraft:light_blue_carpet')
  F(21, 7, 12, 21, 7, 13, 'mcwfurnitures:spruce_wardrobe[facing=east,connection=base,hinge=left]'); S(23, 7, 14, 'mcwfurnitures:spruce_desk[facing=north,connection=single]'); S(23, 7, 13, MAT('spruce_chair', 'south')); S(23, 8, 14, 'supplementaries:globe'); S(24, 7, 11, 'minecraft:chest[facing=west]'); S(22, 10, 9, 'minecraft:lantern[hanging=true]')
  // palier du hall
  F(12, 7, 4, 19, 7, 4, 'minecraft:red_carpet'); S(12, 7, 13, 'minecraft:potted_azalea_bush'); S(19, 7, 13, 'minecraft:potted_azalea_bush')
  // tour : salon de musique a l'etage, bureau panoramique au sommet
  F(27, 7, 5, 29, 7, 7, 'minecraft:light_gray_carpet'); S(29, 7, 5, 'mcwfurnitures:black_couch[facing=west,shape=single]'); S(29, 7, 6, 'mcwfurnitures:black_couch[facing=west,shape=single]'); S(29, 7, 8, 'minecraft:jukebox'); S(28, 7, 5, 'minecraft:note_block')
  F(27, 13, 5, 29, 13, 5, 'minecraft:bookshelf'); S(28, 13, 7, 'mcwfurnitures:dark_oak_desk[facing=north,connection=single]'); S(28, 14, 7, 'supplementaries:globe_sepia'); S(28, 13, 6, MAT('dark_oak_chair', 'south')); S(28, 16, 6, 'minecraft:lantern[hanging=true]'); S(29, 13, 8, 'minecraft:potted_fern')
}
