// TEMPORAIRE : essai du pilote a l'echelle reelle dans Lost Cities. Le pilote (8 x 7 chunks, rues comprises) est epingle
// dans une ville predefinie d'essai a la chunk 1500, 1500 ; on lit ce que Lost Cities y a mis, puis on prend les vues.
var PL = { t: 0, etape: 0, vi: 0, att: 0, CX: 181, CZ: -60 }
function pllog(m) { console.info('[PLC] ' + m) }
ServerEvents.tick(event => {
  try { tickPL(event) } catch (e) { pllog('ERREUR ' + e); console.info('[TEST BUGS] fin'); PL.etape = 9 }
})
function tickPL(event) {
  var server = event.server
  if (server.players.size() == 0) return
  PL.t++
  var lvl = server.overworld()
  if (PL.etape == 0 && PL.t == 200) {
    ;['gamerule doMobSpawning false', 'gamerule doDaylightCycle false', 'gamerule doWeatherCycle false', 'weather clear', 'time set 3000', 'gamemode spectator @a'].forEach(c => server.runCommandSilent(c))
    server.runCommandSilent('tp @a ' + (PL.CX * 16 + 64) + ' 140 ' + (PL.CZ * 16 + 56))
    PL.etape = 1; PL.att = PL.t + 300
  }
  if (PL.etape == 1 && PL.t >= PL.att) {
    for (var cx = -2; cx <= 10; cx++) for (var cz = -2; cz <= 9; cz++) lvl.getChunk(PL.CX + cx, PL.CZ + cz)
    var Reg = Java.loadClass('mcjty.lostcities.setup.Registration'), BI = Java.loadClass('mcjty.lostcities.worldgen.lost.BuildingInfo'), CC = Java.loadClass('mcjty.lostcities.varia.ChunkCoord'), OW = Java.loadClass('net.minecraft.world.level.Level').OVERWORLD
    var di = Reg.LOSTCITY_FEATURE.get().getDimensionInfo(lvl), noms = {}, sols = {}
    for (var cx = -1; cx <= 8; cx++) for (var cz = -1; cz <= 7; cz++) {
      var b = BI.getBuildingInfo(new CC(OW, PL.CX + cx, PL.CZ + cz), di)
      var n = b && b.hasBuilding && b.getBuilding() ? '' + b.getBuilding().getId().getPath() : (b && b.isCity === true ? "rue" : "hors_ville")
      noms[n] = (noms[n] || 0) + 1; if (b) sols['' + b.getCityGroundLevel()] = 1
      if (cx == 0 && cz == 0 && b) PL.sol = b.getCityGroundLevel()
    }
    pllog('chunks autour du pilote : ' + JSON.stringify(noms))
    pllog('niveaux de sol : ' + Object.keys(sols).join(','))
    PL.etape = 2; PL.att = PL.t + 400
  }
  if (PL.etape == 2 && PL.t >= PL.att) {
    // memes vues que le banc (coordonnees du lot), sol = niveau de la ville
    var O = [PL.CX * 16, PL.sol || 67, PL.CZ * 16]
    PL.vues = [[2, 3, 56, 60, 6, 56], [125, 3, 56, 60, 6, 56], [64, 4, 30, 64, 4, 70], [64, 3, 60, 40, 14, 30], [6, 33, 100, 70, 22, 80], [64, 70, 140, 64, 0, 56], [-30, 40, -30, 40, 10, 40], [160, 30, 130, 100, 5, 80]].map(v => [O[0] + v[0], O[1] + v[1], O[2] + v[2], O[0] + v[3], O[1] + v[4], O[2] + v[5]])
    PL.etape = 3; PL.att = PL.t + 20
  }
  if (PL.etape == 3 && PL.t >= PL.att) {
    if (PL.vi >= PL.vues.length) { pllog('fin des vues'); console.info('[TEST BUGS] fin'); PL.etape = 5; return }
    var v = PL.vues[PL.vi], dx = v[3] - v[0], dy = v[4] - v[1], dz = v[5] - v[2]
    var yaw = Math.atan2(-dx, dz) * 180 / Math.PI, pitch = -Math.atan2(dy, Math.sqrt(dx * dx + dz * dz)) * 180 / Math.PI
    server.runCommandSilent('tp @a ' + v[0].toFixed(2) + ' ' + (v[1] - 1.62).toFixed(2) + ' ' + v[2].toFixed(2) + ' ' + yaw.toFixed(1) + ' ' + pitch.toFixed(1))
    pllog('vue ' + (PL.vi + 1))
    PL.vi++; PL.att = PL.t + (PL.vi == 1 ? 700 : 300)
  }
}
