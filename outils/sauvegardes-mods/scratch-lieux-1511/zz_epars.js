// TEMPORAIRE : grands batiments et structures eparses
var ZE = { t: 0, phase: 0, routes: [], i: 0, trouves: {}, lt: {}, n: 0, deb: 0 }
function zeLog(m) { console.info('[CIB] ' + m) }
ServerEvents.tick(event => {
  ZE.t++
  if (ZE.fin || ZE.t < 100) return
  try {
    var level = event.server.overworld()
    var Reg = Java.loadClass('mcjty.lostcities.setup.Registration'), Coord = Java.loadClass('mcjty.lostcities.varia.ChunkCoord'), BI = Java.loadClass('mcjty.lostcities.worldgen.lost.BuildingInfo'), Highway = Java.loadClass('mcjty.lostcities.worldgen.lost.Highway')
    var info = Reg.LOSTCITY_FEATURE.get().getDimensionInfo(level), profil = info.getProfile()
    if (ZE.phase == 0) {
      ZE.phase = 1
      ZE.deb = Date.now()
      ;[[-276, -258], [-276, -119], [-208, -74]].forEach(a => {
        var b = BI.getBuildingInfo(new Coord(level.dimension, a[0], a[1]), info)
        zeLog('info ' + a + ' city=' + b.isCity + ' has=' + b.hasBuilding + ' multi=' + (b.multiBuilding != null ? b.multiBuilding.getName() : null) + ' bat=' + b.getBuildingType())
        var ch = level.getChunk(a[0], a[1]); var it = ch.getBlockEntities().values().iterator(), l = []
        while (it.hasNext()) { var be = it.next(); var tg = be.saveWithoutMetadata(level.registryAccess()); if (tg.contains('LootTable')) l.push('' + tg.getString('LootTable')) }
        zeLog('coffres ' + l.join(' '))
      })
      // Route : une ligne de 60 chunks hors ville et ses deux bords
      for (var x = -240; x < 240 && ZE.routes.length < 300; x++) for (var z = -240; z < 240 && ZE.routes.length < 300; z++) {
        var c = new Coord(level.dimension, x, z)
        if (Highway.getXHighwayLevel(c, info, profil) >= 0 && !BI.isCity(c, info)) { ZE.routes.push([x, z]); ZE.routes.push([x, z - 1]); ZE.routes.push([x, z + 1]); ZE.routes.push([x, z - 2]); ZE.routes.push([x, z + 2]) }
      }
      zeLog('a parcourir ' + ZE.routes.length + ' premier ' + ZE.routes[0])
      return
    }
    var fin = Date.now() + 100
    var Blocks = Java.loadClass('net.minecraft.world.level.block.Blocks')
    var cibles = { reservoir: Java.loadClass('net.minecraft.core.registries.BuiltInRegistries').BLOCK.get(Java.loadClass('net.minecraft.resources.ResourceLocation').parse('atheria:reservoir_epave')), laine: Blocks.LIGHT_GRAY_WOOL, foin: Blocks.HAY_BLOCK, kaki: Blocks.GREEN_TERRACOTTA }
    while (Date.now() < fin && ZE.i < ZE.routes.length) {
      var r = ZE.routes[ZE.i++]
      var ch2 = level.getChunk(r[0], r[1])
      ZE.n++
      var secs = ch2.getSections()
      Object.keys(cibles).forEach(k => {
        for (var s = 0; s < secs.length; s++) {
          if (secs[s].hasOnlyAir()) continue
          var bl = cibles[k]
          if (secs[s].maybeHas(st => st.getBlock() == bl)) { if (!ZE.trouves[k]) { ZE.trouves[k] = []; }; if (ZE.trouves[k].length < 8) ZE.trouves[k].push(r[0] * 16 + ',' + r[1] * 16); break }
        }
      })
      var it2 = ch2.getBlockEntities().values().iterator()
      while (it2.hasNext()) { var b2 = it2.next(); var t2 = b2.saveWithoutMetadata(level.registryAccess()); if (t2.contains('LootTable')) { var n2 = '' + t2.getString('LootTable'); ZE.lt[n2] = (ZE.lt[n2] || 0) + 1 } }
    }
    if (ZE.i >= ZE.routes.length || Date.now() - ZE.deb > 420000) {
      zeLog('chunks ' + ZE.n + ' trouves ' + JSON.stringify(ZE.trouves))
      zeLog('butins ' + JSON.stringify(ZE.lt))
      ZE.fin = true
      console.info('[SCAN] fin')
    }
  } catch (e) { console.error('[CIB] ERREUR ' + e); ZE.fin = true; console.info('[SCAN] fin') }
})