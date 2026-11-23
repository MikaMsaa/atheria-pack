// Verifie au demarrage : donnees Lost Cities chargees, competences, puis distances de biomes et une carte d'architectures
var ZC = { t: 0, etape: 0, fini: false }
ServerEvents.tick(event => {
  if (ZC.fini) return
  ZC.t++
  if (ZC.t != 80) return
  var s = event.server, level = s.overworld()
  try {
    var Asset = Java.loadClass('mcjty.lostcities.varia.Tools')
    var Reg = Java.loadClass('mcjty.lostcities.setup.Registration')
    var City = Java.loadClass('mcjty.lostcities.worldgen.lost.City')
    var Coord = Java.loadClass('mcjty.lostcities.varia.ChunkCoord')
    var BI = Java.loadClass('mcjty.lostcities.worldgen.lost.BuildingInfo')
    var info = Reg.LOSTCITY_FEATURE.get().getDimensionInfo(level)
    var compte = {}
    var R = 350
    for (var x = -R; x < R; x++) for (var z = -R; z < R; z++) {
      var c = new Coord(level.dimension, x, z)
      if (City.isCityCenter(c, info) && BI.isCity(c, info)) {
        var st = '' + City.getCityStyleForCityCenter(c, info)
        var nom = st.replace(/.*CityStyle.*name=/, '')
        var r = City.getCityRadius(c, info)
        compte[st] = (compte[st] || 0) + 1
        console.info('[SCAN]ville ' + x + ' ' + z + ' r=' + r + ' ' + st)
      }
    }
    console.info('[SCAN]bilan ' + JSON.stringify(compte))
    // Generer une vraie ville de chaque style trouve
    var deja = {}
    for (var x2 = -R; x2 < R; x2 += 1) for (var z2 = -R; z2 < R; z2 += 1) {
      var c2 = new Coord(level.dimension, x2, z2)
      if (City.isCityCenter(c2, info) && BI.isCity(c2, info)) {
        var st2 = '' + City.getCityStyleForCityCenter(c2, info)
        if (deja[st2]) continue
        deja[st2] = 1
        var deb = Date.now()
        level.getChunk(x2, z2)
        var bi = BI.getBuildingInfo(c2, info)
        console.info('[SCAN]gen ' + st2 + ' en ' + x2 + ' ' + z2 + ' : ' + (Date.now() - deb) + ' ms, hasBuilding=' + bi.hasBuilding + ' building=' + (bi.hasBuilding ? bi.getBuilding().getName() : '-'))
      }
    }
    s.runCommandSilent('puffish_skills category list')
    var pc = s.runCommand ? 1 : 0
    console.info('[SCAN] fin')
  } catch (e) { console.error('[SCAN]ERREUR ' + e); console.info('[SCAN] fin') }
  ZC.fini = true
})
