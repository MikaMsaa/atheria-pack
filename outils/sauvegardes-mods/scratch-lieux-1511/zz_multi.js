// TEMPORAIRE : histogramme des multibatiments via MultiChunk
var ZD = { t: 0, x: -320, z: -320, h: {}, c: {}, fini: false, deb: 0 }
ServerEvents.tick(event => {
  ZD.t++
  if (ZD.fini || ZD.t < 100) return
  try {
    var level = event.server.overworld()
    var Reg = Java.loadClass('mcjty.lostcities.setup.Registration'), Coord = Java.loadClass('mcjty.lostcities.varia.ChunkCoord'), MC = Java.loadClass('mcjty.lostcities.worldgen.lost.MultiChunk')
    var info = Reg.LOSTCITY_FEATURE.get().getDimensionInfo(level)
    if (!ZD.deb) ZD.deb = Date.now()
    var fin = Date.now() + 45
    while (Date.now() < fin && ZD.x <= -100) {
      var c = new Coord(level.dimension, ZD.x, ZD.z)
      var mb = MC.getOrCreate(info, c).getMultiBuilding(c)
      if (mb != null) {
        var txt = '' + mb, n = txt.replace(/^.*name=/, '').replace(/,.*$/, ''); if (txt.indexOf('offsetX=0, offsetZ=0') < 0) n = ''
        if (n != '') ZD.h[n] = (ZD.h[n] || 0) + 1
        if (!ZD.c[n] && n.indexOf('ath_') >= 0) { ZD.c[n] = 1; console.info('[CIB] MULTI ' + n + ' ' + (ZD.x * 16 + 8) + ' ' + (ZD.z * 16 + 8)) }
      }
      ZD.z++
      if (ZD.z > -60) { ZD.z = -320; ZD.x++ }
    }
    if (ZD.x > -100 || Date.now() - ZD.deb > 300000) {
      console.info('[CIB] fin x=' + ZD.x + ' ms=' + (Date.now() - ZD.deb) + ' ' + JSON.stringify(ZD.h))
      ZD.fini = true
      console.info('[SCAN] fin')
    }
  } catch (e) { console.error('[CIB] ERREUR ' + e); ZD.fini = true; console.info('[SCAN] fin') }
})