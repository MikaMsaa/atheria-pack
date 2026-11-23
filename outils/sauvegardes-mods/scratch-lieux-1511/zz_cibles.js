// TEMPORAIRE : repere les batiments et structures, sans client. Serveur seul.
var ZC = { t: 0, r: 0, x: 0, z: 0, multi: {}, bat: {}, styles: {}, cibles: {}, fini: false, debut: 0, routes: [], iR: 0, chunks: 0, chests: {} }
function zcLog(m) { console.info('[CIB] ' + m) }
function zcAvancer() {
  ZC.z++
  if (ZC.z > ZC.r) { ZC.z = -ZC.r; ZC.x++ }
  if (ZC.x > ZC.r) { ZC.r++; ZC.x = -ZC.r; ZC.z = -ZC.r }
}
ServerEvents.tick(event => {
  var s = event.server
  ZC.t++
  if (ZC.fini || ZC.t < 100) return
  try {
    var level = s.overworld()
    var Reg = Java.loadClass('mcjty.lostcities.setup.Registration'), Coord = Java.loadClass('mcjty.lostcities.varia.ChunkCoord'), BI = Java.loadClass('mcjty.lostcities.worldgen.lost.BuildingInfo'), Highway = Java.loadClass('mcjty.lostcities.worldgen.lost.Highway')
    var info = Reg.LOSTCITY_FEATURE.get().getDimensionInfo(level), profil = info.getProfile()
    if (ZC.t == 100) {
      ZC.debut = Date.now()
      try {
        var Regs = Java.loadClass('net.minecraft.core.registries.Registries'), RK = Java.loadClass('net.minecraft.resources.ResourceKey'), RL = Java.loadClass('net.minecraft.resources.ResourceLocation'), HS = Java.loadClass('net.minecraft.core.HolderSet'), BP = Java.loadClass('net.minecraft.core.BlockPos'), JL = Java.loadClass('java.util.List')
        var reg = level.registryAccess().registryOrThrow(Regs.STRUCTURE)
        ;['cinchsabandonedhouses:abandoned_house', 'cinchsabandonedhouses:abandoned_taiga_house', 'cinchsabandonedhouses:abandoned_birch_forest_house', 'watchtower_building:abandoned_watchtower', 'watchtower_building:fresh_watchtower'].forEach(id => {
          var h = reg.getHolderOrThrow(RK.create(Regs.STRUCTURE, RL.parse(id)))
          var res = level.getChunkSource().getGenerator().findNearestMapStructure(level, HS['direct(java.util.List)'](JL.of(h)), new BP(0, 80, 0), 100, false)
          if (res == null) zcLog('structure introuvable ' + id)
          else zcLog('STRUCT ' + id + ' ' + res.getFirst().getX() + ' ' + res.getFirst().getZ())
        })
      } catch (e) { zcLog('structures erreur ' + e) }
    }
    var fin = Date.now() + 45
    while (Date.now() < fin && ZC.r <= 180) {
      var x = ZC.x, z = ZC.z
      var bord = Math.max(Math.abs(x), Math.abs(z)) == ZC.r
      zcAvancer()
      if (!bord) continue
      var c = new Coord(level.dimension, x, z)
      var ca = BI.getChunkCharacteristics(c, info)
      if (!ca.isCity) {
        if (ZC.r <= 150 && ZC.routes.length < 1500 && (Highway.getXHighwayLevel(c, info, profil) >= 0 || Highway.getZHighwayLevel(c, info, profil) >= 0)) ZC.routes.push([x, z])
        continue
      }
      var st = '' + ca.cityStyleId
      ZC.styles[st] = (ZC.styles[st] || 0) + 1
      if (ca.multiBuilding != null) {
        var m = '' + ca.multiBuildingId
        ZC.multi[m] = (ZC.multi[m] || 0) + 1
        if (!ZC.cibles[m] && m.indexOf('ath_') >= 0) { ZC.cibles[m] = [x * 16 + 8, z * 16 + 8, st]; zcLog('MULTI ' + m + ' ' + (x * 16 + 8) + ' ' + (z * 16 + 8) + ' ' + st) }
      } else if (ca.couldHaveBuilding && ca.buildingTypeId != null) {
        var b = '' + ca.buildingTypeId
        ZC.bat[b] = (ZC.bat[b] || 0) + 1
      }
    }
    if (ZC.r > 180 || Date.now() - ZC.debut > 200000) {
      if (!ZC.etape2) {
        ZC.etape2 = true
        zcLog('rayon atteint ' + ZC.r + ' en ' + (Date.now() - ZC.debut) + ' ms')
        zcLog('multi ' + JSON.stringify(ZC.multi))
        zcLog('batiments ' + JSON.stringify(ZC.bat))
        zcLog('styles ' + JSON.stringify(ZC.styles))
        zcLog('routes ' + ZC.routes.length)
        ZC.debut2 = Date.now()
      }
      // Structures eparses : on genere les chunks de route et on lit les coffres
      var noms = { 'atheria:chests/garage': 'ath_garage', 'atheria:chests/militaire': 'ath_poste', 'atheria:chests/refugies': 'ath_camp' }
      var fin2 = Date.now() + 80
      while (Date.now() < fin2 && ZC.iR < ZC.routes.length) {
        var rc = ZC.routes[ZC.iR++]
        var ch = level.getChunk(rc[0], rc[1])
        ZC.chunks++
        var it = ch.getBlockEntities().values().iterator()
        while (it.hasNext()) {
          var be = it.next()
          var tag = be.saveWithoutMetadata(level.registryAccess())
          if (!tag.contains('LootTable')) continue
          var lt = '' + tag.getString('LootTable')
          if (lt.indexOf('atheria:') != 0) continue
          ZC.chests[lt] = (ZC.chests[lt] || 0) + 1
          if (ZC.chests[lt] == 1) zcLog('COFFRE ' + lt + ' ' + be.getBlockPos().getX() + ' ' + be.getBlockPos().getY() + ' ' + be.getBlockPos().getZ() + ' nom=' + noms[lt])
        }
      }
      if (ZC.iR >= ZC.routes.length || Date.now() - ZC.debut2 > 200000) {
        zcLog('coffres ' + JSON.stringify(ZC.chests) + ' sur ' + ZC.chunks + ' chunks de route')
        ZC.fini = true
        console.info('[SCAN] fin')
      }
    }
  } catch (e2) { console.error('[CIB] ERREUR ' + e2); ZC.fini = true; console.info('[SCAN] fin') }
})
