// Atheria - reçoit un lieu envoyé par le serveur (server_scripts/atheria_reperes.js, Bakoutoubo) et l'ajoute
// comme repère dans Xaero (minimap + World Map), sans doublon : un repère du même nom n'est jamais recréé.
// API Xaero Minimap 26.6.0 : BuiltInHudModules.MINIMAP -> session -> monde courant -> jeu de repères courant.
var ATHERIA_XAERO = null
try {
  ATHERIA_XAERO = {
    modules: Java.loadClass('xaero.hud.minimap.BuiltInHudModules'),
    Waypoint: Java.loadClass('xaero.common.minimap.waypoints.Waypoint')
  }
} catch (e) {
  console.warn('[Atheria repères] Xaero Minimap absent : ' + e)
}

function atheriaRepereAjouter(d) {
  var session = ATHERIA_XAERO.modules.MINIMAP.getCurrentSession()
  if (session == null) return 'pas de session'
  var monde = session.getWorldManager().getCurrentWorld()
  if (monde == null) return 'pas de monde'
  var jeu = monde.getCurrentWaypointSet()
  if (jeu == null) return 'pas de jeu de repères'
  var nom = '' + d.getString('nom')
  var it = jeu.getWaypoints().iterator()
  while (it.hasNext()) { if (('' + it.next().getName()) === nom) return 'déjà présent' }
  jeu.add(new ATHERIA_XAERO.Waypoint(d.getInt('x'), d.getInt('y'), d.getInt('z'), nom, '' + d.getString('ini'), d.getInt('couleur')))
  session.getWorldManagerIO().saveWorld(monde)
  return 'ajouté'
}

NetworkEvents.dataReceived('atheria_repere', event => {
  if (ATHERIA_XAERO == null) return
  try {
    console.info('[Atheria repères] ' + event.data.getString('id') + ' : ' + atheriaRepereAjouter(event.data))
  } catch (e) {
    console.error('[Atheria repères] ' + e)
  }
})

// Retours des testeurs du 25/11 : un repère posé par le didacticiel disparaît quand le joueur arrive (moins de 10 blocs).
// Noms des repères du serveur (server_scripts/atheria_reperes.js) : seuls eux sont retirés, jamais ceux du joueur.
var ATHERIA_REPERES_AUTO = ['Porte RN1 de Longoni', 'Infirmerie de Longoni', 'Eniy, camp des conteneurs']
var ATHERIA_REPERES_TICK = 0
ClientEvents.tick(event => {
  if (ATHERIA_XAERO == null || ++ATHERIA_REPERES_TICK % 20) return
  try {
    var mc = Client, p = mc.player
    if (p == null) return
    var session = ATHERIA_XAERO.modules.MINIMAP.getCurrentSession()
    if (session == null) return
    var monde = session.getWorldManager().getCurrentWorld()
    if (monde == null) return
    var jeu = monde.getCurrentWaypointSet()
    if (jeu == null) return
    var it = jeu.getWaypoints().iterator(), fini = []
    while (it.hasNext()) {
      var w = it.next()
      if (ATHERIA_REPERES_AUTO.indexOf('' + w.getName()) < 0) continue
      var dx = p.x - w.getX(), dz = p.z - w.getZ()
      if (dx * dx + dz * dz < 100) fini.push(w)
    }
    if (!fini.length) return
    fini.forEach(w => { jeu.remove(w); console.info('[Atheria repères] ' + w.getName() + ' : atteint, retiré') })
    session.getWorldManagerIO().saveWorld(monde)
  } catch (e) {
    if (ATHERIA_REPERES_TICK % 1200 == 0) console.warn('[Atheria repères] ' + e)
  }
})
