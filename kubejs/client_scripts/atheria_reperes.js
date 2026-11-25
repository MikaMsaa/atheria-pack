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
