// TEMPORAIRE : prison et tours, blocs reels
var ZG = { t: 0 }
ServerEvents.tick(event => {
  ZG.t++
  if (ZG.t != 120) return
  try {
    var level = event.server.overworld()
    var BP = Java.loadClass('net.minecraft.core.BlockPos'), HM = Java.loadClass('net.minecraft.world.level.levelgen.Heightmap$Types')
    var champ = (nom, x1, z1, x2, z2) => {
      var h = {}
      for (var cx = x1 >> 4; cx <= x2 >> 4; cx++) for (var cz = z1 >> 4; cz <= z2 >> 4; cz++) level.getChunk(cx, cz)
      for (var x = x1; x <= x2; x += 2) for (var z = z1; z <= z2; z += 2) {
        var y = level.getHeight(HM.MOTION_BLOCKING_NO_LEAVES, x, z)
        var id = '' + level.getBlockState(new BP(x, y - 1, z)).getBlock().getId()
        var cle = id + '@' + Math.floor(y / 10) * 10
        h[cle] = (h[cle] || 0) + 1
      }
      var l = Object.keys(h).sort((a, b) => h[b] - h[a]).slice(0, 10).map(k => k + '=' + h[k])
      console.info('[CIB] ' + nom + ' ' + l.join(' '))
    }
    champ('prison', -4432, -4144, -4385, -4097)
    champ('tour_terres', 932, 3540, 970, 3578)
    champ('tour_foret', -5514, -3242, -5476, -3204)
  } catch (e) { console.error('[CIB] ERREUR ' + e) }
  console.info('[SCAN] fin')
})