// TEMPORAIRE : verifie des maisons Cinch et des tours : starts reels et blocs
var ZF = { t: 0 }
ServerEvents.tick(event => {
  ZF.t++
  if (ZF.t != 120) return
  try {
    var level = event.server.overworld()
    var Regs = Java.loadClass('net.minecraft.core.registries.Registries'), RK = Java.loadClass('net.minecraft.resources.ResourceKey'), RL = Java.loadClass('net.minecraft.resources.ResourceLocation'), HS = Java.loadClass('net.minecraft.core.HolderSet'), BP = Java.loadClass('net.minecraft.core.BlockPos'), JL = Java.loadClass('java.util.List'), HM = Java.loadClass('net.minecraft.world.level.levelgen.Heightmap$Types')
    var reg = level.registryAccess().registryOrThrow(Regs.STRUCTURE)
    ;['cinchsabandonedhouses:abandoned_house', 'cinchsabandonedhouses:abandoned_taiga_house', 'watchtower_building:abandoned_watchtower'].forEach(id => {
      var h = reg.getHolderOrThrow(RK.create(Regs.STRUCTURE, RL.parse(id)))
      var vus = 0, reels = 0, ex = []
      ;[[0, 0], [2500, 0], [-2500, 0], [0, 2500], [0, -2500], [2500, 2500], [-2500, -2500]].forEach(o => {
        var res = level.getChunkSource().getGenerator().findNearestMapStructure(level, HS['direct(java.util.List)'](JL.of(h)), new BP(o[0], 80, o[1]), 60, false)
        if (res == null) return
        vus++
        var bp = res.getFirst()
        var ch = level.getChunk(bp.getX() >> 4, bp.getZ() >> 4)
        var it = ch.getAllStarts().entrySet().iterator(), txt = ''
        while (it.hasNext()) { var en = it.next(); var bb = en.getValue().getBoundingBox(); if (en.getValue().getPieces().size() > 0) { reels++; txt += bb.minX() + ',' + bb.minY() + ',' + bb.minZ() + ' > ' + bb.maxX() + ',' + bb.maxY() + ',' + bb.maxZ() + ' pieces=' + en.getValue().getPieces().size() } }
        var sol = level.getHeight(HM.MOTION_BLOCKING_NO_LEAVES, bp.getX(), bp.getZ())
        var cb = level.getBiome(new BP(bp.getX(), sol, bp.getZ())).unwrapKey()
        ex.push('[' + bp.getX() + ' ' + bp.getZ() + ' sol=' + sol + ' biome=' + (cb.isPresent() ? cb.get().location() : '?') + ' ' + txt + ']')
      })
      console.info('[CIB] ' + id + ' vus=' + vus + ' reels=' + reels + ' ' + ex.join(' '))
    })
  } catch (e) { console.error('[CIB] ERREUR ' + e) }
  console.info('[SCAN] fin')
})