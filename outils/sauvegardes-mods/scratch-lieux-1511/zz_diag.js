// TEMPORAIRE : pourquoi si peu de multibatiments
var ZD = { t: 0 }
ServerEvents.tick(event => {
  ZD.t++
  if (ZD.t != 120) return
  try {
    var level = event.server.overworld()
    var Reg = Java.loadClass('mcjty.lostcities.setup.Registration'), Coord = Java.loadClass('mcjty.lostcities.varia.ChunkCoord'), MC = Java.loadClass('mcjty.lostcities.worldgen.lost.MultiChunk'), BI = Java.loadClass('mcjty.lostcities.worldgen.lost.BuildingInfo'), City = Java.loadClass('mcjty.lostcities.worldgen.lost.City'), Rail = Java.loadClass('mcjty.lostcities.worldgen.lost.Railway')
    var info = Reg.LOSTCITY_FEATURE.get().getDimensionInfo(level), p = info.getProfile()
    console.info('[CIB] mode=' + info.getStreetGenerationMode() + ' conflit=' + p.MULTI_BUILDING_STREET_CONFLICT)
    var pl = info.getStreetPlanner()
    var c = { total: 0, raw: 0, occ: 0, route: 0, mineur: 0, rail: 0, hw: 0, mb: 0, libre: 0 }, types = {}, st = {}
    for (var x = -303; x < -253; x++) for (var z = -154; z < -104; z++) {
      var k = new Coord(level.dimension, x, z)
      c.total++
      if (!BI.isCityRaw(k, info, p)) continue
      c.raw++
      if (City.isChunkOccupied(info, k)) c.occ++
      var rt = pl != null ? '' + pl.getRoadType(x, z) : 'sans'
      types[rt] = (types[rt] || 0) + 1
      var bl = pl != null && p.MULTI_BUILDING_STREET_CONFLICT.roadBlocks(pl.getRoadType(x, z))
      if (bl) c.route++
      if (BI.hasHighway(k, info, p)) c.hw++
      var ri = Rail.getRailChunkType(k, info, p).getType()
      if (ri.isSurface() || ri.isStation()) c.rail++
      var s2 = '' + City.getCityStyle(k, info, p); st[s2] = (st[s2] || 0) + 1
      if (MC.getOrCreate(info, k).getMultiBuilding(k) != null) c.mb++
    }
    console.info('[CIB] ' + JSON.stringify(c))
    console.info('[CIB] routes ' + JSON.stringify(types))
    console.info('[CIB] styles ' + JSON.stringify(st))
  } catch (e) { console.error('[CIB] ERREUR ' + e) }
  console.info('[SCAN] fin')
})