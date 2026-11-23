// Atheria : ajoute des coffres et des tonneaux à l'intérieur des bâtiments des villes (retour de Mika et des testeurs).
// Lost Cities en place peu : moins d'un contenant par chunk. Seuls les chunks nouvellement générés sont concernés,
// un monde déjà exploré ne change pas. Un seul chunk traité par tick, pour éviter les saccades.
var ATHERIA_COFFRES = {
  parChunk: 4,
  essais: 80,
  ecart: 4,
  passage: /door|stairs|ladder/,
  facteurVille: 0.3,
  profondeur: 24,
  tables: [
    ['lostcities:chests/lostcitychest', 60],
    ['minecraft:chests/village/village_plains_house', 25],
    ['create_fallout:chests/fallout', 15]
  ],
  // Ni sol ni plafond : ce n'est pas un bâtiment (arbres, grottes, terrain)
  pasBatiment: /leaves|log|wood|dirt|grass|sand|gravel|vine|water|lava|snow|moss|mud|clay|ice|mushroom|bamboo|sapling|flower|fern|crop|chest|barrel|door|trapdoor|ladder|fence|rail|torch|bed|sign|carpet|slab|stairs|pane|bars/
}
var atheriaCoffresFile = []
var atheriaCoffresVille = null

NativeEvents.onEvent('net.neoforged.neoforge.event.level.ChunkEvent$Load', event => {
  if (!event.isNewChunk()) return
  var level = event.getLevel()
  if (level.isClientSide() || !/minecraft:overworld/.test(String(level.dimension))) return
  var pos = event.getChunk().getPos()
  atheriaCoffresFile.push([pos.x, pos.z])
})

function atheriaCoffresTable() {
  var total = 0, tables = ATHERIA_COFFRES.tables
  tables.forEach(t => { total += t[1] })
  var tirage = Math.random() * total
  for (var i = 0; i < tables.length; i++) {
    tirage -= tables[i][1]
    if (tirage < 0) return tables[i][0]
  }
  return tables[0][0]
}

function atheriaCoffresChunk(server, level, BlockPos, Types, cx, cz) {
  var cfg = ATHERIA_COFFRES
  var v = atheriaCoffresVille
  var places = []
  if (v.City.getCityFactor(new v.Coord(level.dimension, cx, cz), v.info, v.profile) <= cfg.facteurVille) return places
  var plein = (x, y, z) => {
    var id = '' + level.getBlock(new BlockPos(x, y, z)).id
    return id != 'minecraft:air' && !cfg.pasBatiment.test(id)
  }
  var vide = (x, y, z) => '' + level.getBlock(new BlockPos(x, y, z)).id == 'minecraft:air'
  for (var essai = 0; essai < cfg.essais && places.length < cfg.parChunk; essai++) {
    var x = cx * 16 + 1 + Math.floor(Math.random() * 14)
    var z = cz * 16 + 1 + Math.floor(Math.random() * 14)
    var haut = level.getHeight(Types.WORLD_SURFACE, x, z)
    var y = haut - 2 - Math.floor(Math.random() * cfg.profondeur)
    // Les étages sont espacés : on descend jusqu'au sol le plus proche au lieu de tirer une hauteur au hasard
    for (var pas = 0; pas < 6 && vide(x, y - 1, z); pas++) y--
    // Une pièce : sol plein, deux blocs d'air, plafond proche, et un mur à côté
    if (!plein(x, y - 1, z) || !vide(x, y, z) || !vide(x, y + 1, z)) continue
    if (places.some(p => Math.abs(p[0] - x) + Math.abs(p[1] - y) + Math.abs(p[2] - z) < cfg.ecart)) continue
    // Ne pas boucher un passage
    var passage = false
    ;[[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(d => {
      if (cfg.passage.test('' + level.getBlock(new BlockPos(x + d[0], y, z + d[1])).id)) passage = true
    })
    if (passage) continue
    var plafond = false
    for (var h = 2; h <= 6 && !plafond; h++) plafond = plein(x, y + h, z)
    if (!plafond) continue
    var sens = null
    if (plein(x + 1, y, z)) sens = 'west'
    else if (plein(x - 1, y, z)) sens = 'east'
    else if (plein(x, y, z + 1)) sens = 'north'
    else if (plein(x, y, z - 1)) sens = 'south'
    if (!sens) continue
    var bloc = Math.random() < 0.6 ? 'minecraft:chest[facing=' + sens + ']' : 'minecraft:barrel[facing=' + sens + ']'
    server.runCommandSilent('execute in minecraft:overworld run setblock ' + x + ' ' + y + ' ' + z + ' ' + bloc + '{LootTable:"' + atheriaCoffresTable() + '"}')
    places.push([x, y, z])
  }
  return places
}

ServerEvents.tick(event => {
  if (atheriaCoffresFile.length == 0) return
  var server = event.server
  var level = server.overworld()
  try {
    if (!atheriaCoffresVille) {
      var Reg = Java.loadClass('mcjty.lostcities.setup.Registration')
      var info = Reg.LOSTCITY_FEATURE.get().getDimensionInfo(level)
      atheriaCoffresVille = {
        City: Java.loadClass('mcjty.lostcities.worldgen.lost.City'),
        Coord: Java.loadClass('mcjty.lostcities.varia.ChunkCoord'),
        BlockPos: Java.loadClass('net.minecraft.core.BlockPos'),
        Types: Java.loadClass('net.minecraft.world.level.levelgen.Heightmap$Types'),
        info: info,
        profile: info.getProfile()
      }
    }
    var c = atheriaCoffresFile.shift()
    if (level.hasChunk(c[0], c[1])) atheriaCoffresChunk(server, level, atheriaCoffresVille.BlockPos, atheriaCoffresVille.Types, c[0], c[1])
  } catch (e) {
    atheriaCoffresFile = []
    console.error('[Atheria coffres] ' + e)
  }
})
