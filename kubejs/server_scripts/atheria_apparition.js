// Monde neuf uniquement : ecarte le point d'apparition des structures.
// Sinon le joueur peut arriver au milieu d'un camp hostile (camp de pillards de When Dungeons Arise, etc.) et mourir en quelques secondes.
// Un monde deja joue n'est jamais modifie : le test se fait une seule fois, et seulement si le monde vient d'etre cree.
var ATHERIA_APPARITION = { marqueur: 'atheria_apparition', ageMax: 200, marge: 64, pasMarge: 32, pasAnneau: 96, anneauxMax: 4, essaisMax: 60 }

function atheriaZoneLibre(level, BlockPos, x, z) {
  var cfg = ATHERIA_APPARITION
  var biome = '' + level.getBiome(new BlockPos(x, 64, z)).unwrapKey().get().location()
  if (/ocean|river|sea/.test(biome)) return false
  for (var dx = -cfg.marge; dx <= cfg.marge; dx += cfg.pasMarge) {
    for (var dz = -cfg.marge; dz <= cfg.marge; dz += cfg.pasMarge) {
      // Java Map : on lit sa forme texte, une methode serait prise pour une cle par Rhino
      if ('' + level.structureManager().getAllStructuresAt(new BlockPos(x + dx, 64, z + dz)) != '{}') return false
    }
  }
  return true
}

ServerEvents.loaded(event => {
  var server = event.server
  var data = server.persistentData
  if (data.getBoolean(ATHERIA_APPARITION.marqueur)) return
  data.putBoolean(ATHERIA_APPARITION.marqueur, true)
  var level = server.overworld()
  if (level.getLevelData().getGameTime() > ATHERIA_APPARITION.ageMax) return

  var cfg = ATHERIA_APPARITION
  var BlockPos = Java.loadClass('net.minecraft.core.BlockPos')
  var depart = level.getSharedSpawnPos()
  var debut = Date.now()
  var essais = 0
  for (var r = 0; r <= cfg.anneauxMax; r++) {
    var cote = r * cfg.pasAnneau
    for (var a = -r; a <= r; a++) {
      for (var b = -r; b <= r; b++) {
        if (Math.max(Math.abs(a), Math.abs(b)) != r) continue
        if (essais >= cfg.essaisMax) { console.warn('[Atheria] apparition : aucune zone libre trouvee, point d\'origine garde'); return }
        essais++
        var x = depart.getX() + a * cfg.pasAnneau
        var z = depart.getZ() + b * cfg.pasAnneau
        if (!atheriaZoneLibre(level, BlockPos, x, z)) continue
        if (cote > 0) {
          level.getChunk(x >> 4, z >> 4)
          level.setDefaultSpawnPos(new BlockPos(x, level.getHeight(Java.loadClass('net.minecraft.world.level.levelgen.Heightmap$Types').MOTION_BLOCKING_NO_LEAVES, x, z), z), 0)
        }
        console.info('[Atheria] apparition : ' + x + ' ' + z + ' apres ' + essais + ' essais, ' + (Date.now() - debut) + ' ms')
        return
      }
    }
  }
})
