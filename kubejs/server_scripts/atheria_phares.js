// Atheria - phares de véhicules qui éclairent vraiment la route (retours bêta du 25/11, lot 2).
// Les phares MTS ne sont qu'un faisceau dessiné : ils n'éclairent pas le monde. Ici, tant que les phares d'un véhicule
// sont allumés (variable MTS « headlight »), le serveur pose des blocs de lumière invisibles (minecraft:light)
// devant lui, seulement dans l'air, et les retire dès qu'ils ne sont plus devant le véhicule ou que les phares s'éteignent.
// Chaque bloc posé est noté dans les données du serveur : après un arrêt brutal, ceux qui restaient sont retirés au démarrage,
// pour ne laisser aucune trace sur la carte.
var PHARES = {
  periode: 4,                          // mise à jour tous les 4 ticks (5 fois par seconde)
  points: [[3, 15], [6, 15], [10, 14], [14, 12], [18, 10]], // [distance devant le véhicule, niveau de lumière]
  poses: {},                           // "x y z" -> true, blocs de lumière posés en ce moment
  cle: 'atheria_phares_poses'
}

function atheriaPharesSauver(server) {
  server.persistentData.putString(PHARES.cle, Object.keys(PHARES.poses).join(';'))
}

function atheriaPharesRetirer(level, cleBloc) {
  var c = cleBloc.split(' ')
  var b = level.getBlock(parseInt(c[0]), parseInt(c[1]), parseInt(c[2]))
  if (b.id == 'minecraft:light') b.set('minecraft:air')
}

ServerEvents.loaded(event => {
  var s = event.server.persistentData.getString(PHARES.cle)
  if (!s) return
  var level = event.server.overworld()
  s.split(';').forEach(k => { if (k) atheriaPharesRetirer(level, k) })
  event.server.persistentData.putString(PHARES.cle, '')
})

ServerEvents.tick(event => {
  var server = event.server
  if (server.tickCount % PHARES.periode != 0) return
  var level = server.overworld()
  var WW = Java.loadClass('mcinterface1211.WrapperWorld')
  var Phys = Java.loadClass('minecrafttransportsimulator.entities.instances.EntityVehicleF_Physics')
  var P3 = Java.loadClass('minecrafttransportsimulator.baseclasses.Point3D')
  var voulus = {}
  var liste = WW.getWrapperFor(level).getEntitiesExtendingType(Phys)
  for (var i = 0; i < liste.size(); i++) {
    var v = liste.get(i)
    var phare = v.getOrCreateVariable('headlight')
    if (!phare || !phare.isActive) continue
    var avant = new P3(0, 0, 1).rotate(v.orientation)
    for (var j = 0; j < PHARES.points.length; j++) {
      var d = PHARES.points[j][0]
      var x = Math.floor(v.position.x + avant.x * d)
      var z = Math.floor(v.position.z + avant.z * d)
      var y0 = Math.floor(v.position.y + avant.y * d) + 1
      // cherche une case d'air à hauteur de phare, sinon juste au-dessus ou en dessous (pentes)
      var dys = [0, 1, -1, 2]
      for (var k = 0; k < dys.length; k++) {
        var cle = x + ' ' + (y0 + dys[k]) + ' ' + z
        if (PHARES.poses[cle]) { voulus[cle] = PHARES.points[j][1]; break }
        var b = level.getBlock(x, y0 + dys[k], z)
        if (b.id == 'minecraft:air') { voulus[cle] = PHARES.points[j][1]; break }
      }
    }
  }
  var change = false
  Object.keys(PHARES.poses).forEach(cle => {
    if (voulus[cle] === undefined) { atheriaPharesRetirer(level, cle); delete PHARES.poses[cle]; change = true }
  })
  Object.keys(voulus).forEach(cle => {
    if (PHARES.poses[cle]) return
    var c = cle.split(' ')
    level.getBlock(parseInt(c[0]), parseInt(c[1]), parseInt(c[2])).set('minecraft:light', { level: '' + voulus[cle] })
    PHARES.poses[cle] = true
    change = true
  })
  if (change) atheriaPharesSauver(server)
})
