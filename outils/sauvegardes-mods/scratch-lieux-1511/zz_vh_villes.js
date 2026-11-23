// TEMPORAIRE : essai de la pose des vehicules MTS a la place des maquettes, dans une ville Lost Cities generee.
// Cherche les batiments vitrine qui ont des vehicules, fait generer leurs chunks, compte les entites MTS posees,
// puis place la camera devant un vehicule de chaque modele (capture par zz_vitrine_client.js apres chaque deplacement).
// Les villes ne sont plus tirees au hasard (cityChance 0) : seules les villes predefinies de generer-villes.ps1 existent, vers x 2500..3000, z -3000..-900.
var VV = { t: 0, etape: 0, cx: 150, cz: -195, X1: 195, Z0: -195, Z1: -45, nbat: 0, nvit: 0, nerr: 0, vitNoms: {}, trouves: [], vues: [], vi: 0, att: 0 }
function vvlog(m) { console.info('[VVH] ' + m) }
ServerEvents.tick(event => {
  try { tickVV(event) } catch (e) { vvlog('ERREUR ' + e); console.info('[TEST BUGS] fin'); VV.etape = 9 }
})
function vvCompter(lvl, x, y, z, r) {
  var AABB = Java.loadClass('net.minecraft.world.phys.AABB'), REG = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
  var l = lvl.getEntities(null, new AABB(x - r, y - 4, z - r, x + r, y + 6, z + r)), n = 0, it = l.iterator()
  while (it.hasNext()) { var e = it.next(); if (('' + REG.ENTITY_TYPE.getKey(e.getType())).indexOf('mts:') == 0) n++ }
  return n
}
function tickVV(event) {
  var server = event.server
  if (server.players.size() == 0) return
  VV.t++
  var lvl = server.overworld()
  var FV = Java.loadClass('fr.atheria.monde.FinitionVitrines')
  if (VV.etape == 0 && VV.t == 200) {
    ['gamerule doMobSpawning false', 'gamerule doDaylightCycle false', 'gamerule doWeatherCycle false', 'weather clear', 'time set 3000', 'gamemode spectator @a', 'kill @e[type=!minecraft:player]'].forEach(c => server.runCommandSilent(c))
    VV.liste = JsonIO.read('kubejs/data/atheria_monde/vehicules_vitrines.json')
    vvlog('liste ' + (VV.liste ? Object.keys(VV.liste).length : 'ABSENTE') + ' batiments')
    var Reg = Java.loadClass('mcjty.lostcities.setup.Registration')
    VV.di = Reg.LOSTCITY_FEATURE.get().getDimensionInfo(lvl)
    VV.BI = Java.loadClass('mcjty.lostcities.worldgen.lost.BuildingInfo'); VV.CC = Java.loadClass('mcjty.lostcities.varia.ChunkCoord'); VV.OW = Java.loadClass('net.minecraft.world.level.Level').OVERWORLD
    VV.etape = 1
  }
  if (VV.etape == 1) {
    for (var k = 0; k < 800 && VV.etape == 1; k++) {
      try {
        var b = VV.BI.getBuildingInfo(new VV.CC(VV.OW, VV.cx, VV.cz), VV.di)
        if (b && b.hasBuilding && b.getBuilding()) {
          var nom = '' + b.getBuilding().getId().getPath(), l = VV.liste[nom]
          VV.nbat++; if (nom.indexOf('ath_v_') == 0) { VV.nvit++; VV.vitNoms[nom.replace(/_\d\d$/, '')] = 1 }
          if (l) l.forEach(v => VV.trouves.push({ nom: nom, id: '' + v.id, cx: VV.cx, cz: VV.cz, x: VV.cx * 16 + v.x, y: b.getCityGroundLevel() + v.y, z: VV.cz * 16 + v.z, cap: v.cap }))
        }
      } catch (e) { if (VV.nerr++ < 3) vvlog('ERR scan ' + e) }
      VV.cz++; if (VV.cz > VV.Z1) { VV.cz = VV.Z0; VV.cx++; if (VV.cx > VV.X1) VV.etape = 2 }
    }
  }
  if (VV.etape == 2) {
    vvlog('scan : batiments ' + VV.nbat + ' chunks vitrine ' + VV.nvit + ' (' + Object.keys(VV.vitNoms).length + ' types) erreurs ' + VV.nerr)
    vvlog('vehicules prevus dans le rayon : ' + VV.trouves.length)
    VV.trouves.sort((a, b) => (a.x + a.z) - (b.x + b.z))
    // un vehicule par modele, puis d'autres jusqu'a 10
    var vus = {}, choix = []
    VV.trouves.forEach(v => { var m = v.id.replace(/^atheriavh\./, '').replace(/_.*$/, ''); if (!vus[m]) { vus[m] = 1; choix.push(v) } })
    VV.trouves.forEach(v => { if (choix.length < 10 && choix.indexOf(v) < 0 && /rouille|brulee/.test(v.id)) choix.push(v) })
    VV.choix = choix
    // generation des chunks de ces batiments (et de leurs voisins) : la passe 2 pose alors les vehicules
    choix.forEach(v => { for (var dx = -1; dx <= 1; dx++) for (var dz = -1; dz <= 1; dz++) lvl.getChunk(v.cx + dx, v.cz + dz) })
    VV.etape = 3; VV.att = VV.t + 200
  }
  if (VV.etape == 3 && VV.t >= VV.att) {
    VV.choix.forEach(v => vvlog('VH ' + v.nom + ' ' + v.id + ' a ' + v.x.toFixed(1) + ' ' + v.y + ' ' + v.z.toFixed(1) + ' cap ' + v.cap + ' : entites MTS a 3 blocs = ' + vvCompter(lvl, v.x, v.y, v.z, 3)))
    vvlog('compteurs : poses ' + FV.VEHICULES.get() + ' rates ' + FV.VEHICULES_RATES.get() + ' erreurs ' + FV.ERREURS.get() + ' chunks passe2 ' + FV.CHUNKS2.get())
    VV.choix.forEach(v => {
      var a = (v.cap + 40) * Math.PI / 180, d = 7.5
      // camera de trois quarts avant : le vehicule regarde vers son cap (yaw Minecraft)
      VV.vues.push({ v: v, ex: v.x - Math.sin(a) * d, ez: v.z + Math.cos(a) * d, ey: v.y + 3.2 })
    })
    VV.etape = 4; VV.att = VV.t + 20
  }
  if (VV.etape == 4 && VV.t >= VV.att) {
    if (VV.vi >= VV.vues.length) {
      vvlog('compteurs fin : poses ' + FV.VEHICULES.get() + ' rates ' + FV.VEHICULES_RATES.get() + ' erreurs ' + FV.ERREURS.get())
      vvlog('fin des vues'); console.info('[TEST BUGS] fin'); VV.etape = 5; return
    }
    var w = VV.vues[VV.vi], v = w.v
    var dx = v.x - w.ex, dy = v.y + 0.8 - w.ey, dz = v.z - w.ez
    var yaw = Math.atan2(-dx, dz) * 180 / Math.PI, pitch = -Math.atan2(dy, Math.sqrt(dx * dx + dz * dz)) * 180 / Math.PI
    server.runCommandSilent('tp @a ' + w.ex.toFixed(2) + ' ' + (w.ey - 1.62).toFixed(2) + ' ' + w.ez.toFixed(2) + ' ' + yaw.toFixed(1) + ' ' + pitch.toFixed(1))
    vvlog('vue ' + (VV.vi + 1) + ' ' + v.id + ' ' + v.nom + ' entites=' + vvCompter(lvl, v.x, v.y, v.z, 3))
    VV.vi++; VV.att = VV.t + (VV.vi == 1 ? 700 : 300)
  }
}
