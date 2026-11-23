
// ================= BIDONVILLE (2 x 2 chunks) =================
var BV_MURS = ['minecraft:oak_planks', 'minecraft:spruce_planks', 'minecraft:birch_planks', 'minecraft:jungle_planks', 'minecraft:waxed_weathered_cut_copper', 'minecraft:waxed_exposed_cut_copper', 'minecraft:waxed_oxidized_cut_copper', 'minecraft:stripped_oak_log[axis=y]', 'minecraft:mossy_cobblestone', 'minecraft:bricks', 'minecraft:mud_bricks']
var BV_TOITS = ['minecraft:spruce_slab[type=bottom]', 'minecraft:waxed_weathered_cut_copper_slab[type=bottom]', 'minecraft:waxed_exposed_cut_copper_slab[type=bottom]', 'minecraft:oak_slab[type=bottom]', 'minecraft:mud_brick_slab[type=bottom]']
var BV_PORTES = ['minecraft:spruce_door', 'minecraft:oak_door', 'minecraft:jungle_door', 'minecraft:waxed_exposed_copper_door', 'minecraft:iron_door', 'minecraft:birch_door']
function cabane(x1, z1, x2, z2, y, h, pf, auvent) {
  var m = [choix(BV_MURS), choix(BV_MURS), choix(BV_MURS)], t = [choix(BV_TOITS), choix(BV_TOITS)], w = choix(BOIS)
  F(x1, y, z1, x2, y, z2, choix(['minecraft:spruce_planks', 'minecraft:oak_planks', 'minecraft:packed_mud', 'minecraft:mud_bricks']))
  function mur(i, yy) { return yy == y + 1 && R() < 0.3 ? 'minecraft:cobblestone' : m[Math.floor(i / 2) % 3] }
  for (var yy = y + 1; yy <= y + h; yy++) {
    for (var x = x1; x <= x2; x++) [z1, z2].forEach(z => S(x, yy, z, x == x1 || x == x2 ? 'minecraft:stripped_spruce_log[axis=y]' : mur(x - x1 + (z == z2 ? 1 : 0), yy)))
    for (var z = z1 + 1; z < z2; z++) [x1, x2].forEach(x => S(x, yy, z, mur(z - z1 + (x == x2 ? 1 : 0), yy)))
  }
  var fen = R() < 0.5 ? 'minecraft:glass_pane' : 'minecraft:iron_bars', mx = Math.floor((x1 + x2) / 2), mz = Math.floor((z1 + z2) / 2)
  if (pf != 'north' && x2 - x1 >= 4) S(mx, y + 2, z1, fen); if (pf != 'south' && x2 - x1 >= 4) S(mx, y + 2, z2, fen)
  if (pf != 'west' && z2 - z1 >= 4) S(x1, y + 2, mz, fen); if (pf != 'east' && z2 - z1 >= 4) S(x2, y + 2, mz, fen)
  for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) S(x, y + h + 1, z, choix(t))
  if (auvent) { var d = { north: [0, -1], south: [0, 1], east: [1, 0], west: [-1, 0] }[pf]; if (d[0]) F(d[0] > 0 ? x2 + 1 : x1 - 1, y + h + 1, z1, d[0] > 0 ? x2 + 1 : x1 - 1, y + h + 1, z2, t[0]); else F(x1, y + h + 1, d[1] > 0 ? z2 + 1 : z1 - 1, x2, y + h + 1, d[1] > 0 ? z2 + 1 : z1 - 1, t[0]) }
  var c = cadre(x1 + 1, z1 + 1, x2 - 1, z2 - 1, OPP[pf], y, h), L = c.L, D = c.D, col = choix(COULS)
  c.porte(choix(BV_PORTES))
  c.S(0, 0, 1, 'minecraft:' + col + '_bed[facing={W},part=head]'); c.S(0, 1, 1, 'minecraft:' + col + '_bed[facing={W},part=foot]')
  c.S(L - 1, 0, 1, 'minecraft:chest[facing={I}]')
  if (L >= 3) c.S(1, 0, 1, choix(['minecraft:furnace[facing={I},lit=false]', 'minecraft:smoker[facing={I},lit=false]', 'minecraft:barrel[facing=up,open=false]', 'minecraft:crafting_table']))
  if (D >= 4) c.S(0, D - 1, 1, choix(['minecraft:barrel[facing=up,open=false]', 'minecraft:cauldron', 'minecraft:composter[level=0]', 'supplementaries:sack']))
  if (L >= 3 && D >= 3) c.S(1, 1, 1, 'minecraft:' + choix(COULS) + '_carpet')
  if (L >= 4 && D >= 4) { c.S(L - 2, 1, 1, 'mcwfurnitures:' + w + '_table'); c.S(L - 2, 2, 1, MAT(w + '_chair', '{W}')); c.S(L - 2, 1, 2, 'minecraft:candle[candles=1,lit=false]') }
  if (L >= 5 && D >= 3) { c.S(2, 0, 1, choix(['minecraft:barrel[facing=up,open=false]', 'supplementaries:sack', 'minecraft:decorated_pot'])); c.S(2, 0, 2, 'minecraft:potted_dead_bush') }
  c.S(Math.min(1, L - 1), 1, h, 'minecraft:lantern[hanging=true]')
  if (R() < 0.5) c.S(L - 1, 1, 1, 'supplementaries:sack')
}
function bidonvilleGrand() {
  for (var x = 0; x <= 31; x++) for (var z = 0; z <= 31; z++) S(x, -1, z, choix(['minecraft:coarse_dirt', 'minecraft:coarse_dirt', 'minecraft:packed_mud', 'minecraft:gravel', 'minecraft:mud', 'minecraft:dirt_path']))
  // cabanes (rez)
  cabane(1, 1, 5, 6, 0, 3, 'south', true); cabane(6, 2, 9, 6, 0, 4, 'south', true); cabane(1, 8, 6, 13, 0, 3, 'east', false)
  cabane(12, 1, 20, 6, 0, 4, 'south', true); cabane(12, 8, 20, 14, 0, 3, 'north', false)
  cabane(23, 1, 30, 5, 0, 3, 'south', true); cabane(24, 7, 30, 13, 0, 4, 'west', true)
  cabane(1, 17, 7, 22, 0, 3, 'east', true); cabane(1, 24, 6, 30, 0, 3, 'north', true)
  cabane(12, 17, 20, 22, 0, 4, 'south', true); cabane(23, 17, 30, 23, 0, 3, 'west', true); cabane(24, 25, 30, 30, 0, 3, 'north', true)
  // cabanes perchees et echelles
  cabane(1, 8, 5, 12, 4, 3, 'south', false); F(6, 1, 7, 6, 3, 7, 'minecraft:ladder[facing=north]')
  cabane(14, 9, 19, 13, 4, 3, 'west', false); F(17, 1, 7, 17, 3, 7, 'minecraft:ladder[facing=north]')
  cabane(26, 8, 30, 12, 5, 3, 'west', false); F(25, 1, 14, 25, 4, 14, 'minecraft:ladder[facing=south]')
  cabane(12, 17, 16, 21, 5, 3, 'east', false); F(21, 1, 19, 21, 4, 19, 'minecraft:ladder[facing=east]')
  cabane(26, 26, 30, 30, 4, 3, 'west', false); F(23, 1, 28, 23, 3, 28, 'minecraft:ladder[facing=west]')
  // toits : citernes, antennes, pneus, panneaux
  S(8, 6, 4, 'minecraft:barrel[facing=up,open=false]'); S(8, 7, 4, 'minecraft:cauldron'); S(19, 6, 2, 'minecraft:daylight_detector[inverted=false,power=0]'); S(18, 6, 2, 'minecraft:daylight_detector[inverted=false,power=0]')
  S(13, 6, 3, 'minecraft:black_carpet'); S(29, 5, 2, 'minecraft:lightning_rod[facing=up,powered=false,waterlogged=false]'); S(24, 6, 12, 'minecraft:barrel[facing=up,open=false]'); S(19, 6, 22, 'minecraft:potted_cactus'); S(3, 5, 28, 'minecraft:black_carpet'); S(2, 5, 19, 'minecraft:barrel[facing=up,open=false]'); S(27, 5, 20, 'minecraft:composter[level=0]')
  // ruelles : cordes a linge avec lampes, bric-a-brac
  function corde(x1, z1, x2, z2, y, ax, lx, lz) { F(x1, y, z1, x2, y, z2, 'minecraft:chain[axis=' + ax + ']'); S(lx, y - 1, lz, 'minecraft:chain[axis=y]'); S(lx, y - 2, lz, 'minecraft:lantern[hanging=true]') }
  corde(10, 4, 11, 4, 4, 'x', 10, 4); corde(21, 10, 22, 10, 4, 'x', 22, 10); corde(4, 15, 4, 16, 5, 'z', 4, 16); corde(16, 15, 16, 16, 6, 'z', 16, 15); corde(27, 15, 27, 16, 5, 'z', 27, 15)
  ;[[10, 9], [11, 20], [22, 3], [3, 15], [9, 16], [26, 16], [21, 26], [8, 7]].forEach(c => SA(c[0], 0, c[1], choix(['minecraft:barrel[facing=up,open=false]', 'minecraft:composter[level=0]', 'minecraft:cauldron', 'supplementaries:sack', 'minecraft:black_carpet', 'minecraft:hay_block[axis=y]'])))
  // jardin potager
  F(8, -1, 25, 9, -1, 29, 'minecraft:farmland[moisture=7]'); for (var z = 25; z <= 29; z++) { S(8, 0, z, z % 2 ? 'minecraft:carrots[age=7]' : 'minecraft:potatoes[age=7]'); S(9, 0, z, 'minecraft:beetroots[age=3]') }
  S(7, -1, 27, 'minecraft:water'); F(7, 0, 25, 7, 0, 26, 'minecraft:spruce_fence'); F(7, 0, 28, 7, 0, 30, 'minecraft:spruce_fence'); S(8, 0, 30, 'minecraft:composter[level=0]'); S(9, 0, 30, 'minecraft:water_cauldron[level=2]')
  // marche
  function etal(x, z, c1, c2, biens) {
    ;[[0, 0], [2, 0], [0, 2], [2, 2]].forEach(p => F(x + p[0], 0, z + p[1], x + p[0], 2, z + p[1], 'minecraft:spruce_fence'))
    for (var dx = 0; dx <= 2; dx++) F(x + dx, 3, z, x + dx, 3, z + 2, dx % 2 ? c2 : c1)
    S(x + 1, 0, z + 2, biens[0]); S(x + 1, 0, z, biens[1]); S(x, 0, z + 1, biens[2]); S(x + 2, 0, z + 1, biens[3]); S(x + 1, 0, z + 1, 'mcwfurnitures:spruce_stool_chair')
  }
  etal(12, 25, 'minecraft:red_wool', 'minecraft:white_wool', ['farmersdelight:carrot_crate', 'minecraft:barrel[facing=up,open=false]', 'minecraft:composter[level=0]', 'minecraft:melon'])
  etal(17, 25, 'minecraft:blue_wool', 'minecraft:white_wool', ['farmersdelight:potato_crate', 'minecraft:hay_block[axis=y]', 'minecraft:pumpkin', 'minecraft:decorated_pot'])
  S(16, 0, 29, 'minecraft:campfire[lit=true]'); F(14, 0, 30, 18, 0, 30, 'minecraft:stripped_spruce_log[axis=x]'); S(14, 0, 29, 'minecraft:stripped_spruce_log[axis=z]'); S(18, 0, 29, 'minecraft:stripped_spruce_log[axis=z]')
}
