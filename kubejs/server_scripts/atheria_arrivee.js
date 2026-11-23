// Atheria - arrivée protégée (Mika 22/11 : « ils apparaissent, tombent dans le vide puis se font kick »).
// Sur une connexion lente, le joueur existe sur le serveur avant que son PC ait reçu le sol autour de lui :
// il tombe, prend des dégâts ou se fait tuer avant même de voir la carte.
// À chaque connexion, le joueur est donc tenu en place, sans gravité et sans dégâts, jusqu'à ce que son client
// confirme que le terrain autour de lui est chargé et affiché (client_scripts/atheria_arrivee.js),
// ou au plus 3 minutes. Rien ne change pour un joueur dont le PC charge vite : il est libéré en une seconde ou deux.
var ARRIVEE = { maxMs: 180000, attente: {} }

function atheriaArriveeLiberer(p, raison) {
  var a = ARRIVEE.attente[p.username]
  if (!a) return
  delete ARRIVEE.attente[p.username]
  p.setNoGravity(false)
  p.setInvulnerable(a.invulnerable)
  p.fallDistance = 0
  console.info('[Atheria arrivée] ' + p.username + ' libéré (' + raison + ', ' + Math.round((Date.now() - a.depuis) / 100) / 10 + ' s)')
}

PlayerEvents.loggedIn(event => {
  var p = event.player
  if (p.isSpectator() || p.isCreative()) return
  ARRIVEE.attente[p.username] = { x: p.x, y: p.y, z: p.z, depuis: Date.now(), invulnerable: false }
  p.setNoGravity(true)
  p.setInvulnerable(true)
  p.setMotion(0, 0, 0)
})

PlayerEvents.loggedOut(event => {
  var p = event.player, a = ARRIVEE.attente[p.username]
  if (!a) return
  delete ARRIVEE.attente[p.username]
  p.setNoGravity(false)
  p.setInvulnerable(false)
})

NetworkEvents.dataReceived('atheria_arrivee_pret', event => atheriaArriveeLiberer(event.player, 'terrain chargé'))

ServerEvents.tick(event => {
  var noms = Object.keys(ARRIVEE.attente)
  if (!noms.length) return
  var maintenant = Date.now()
  noms.forEach(n => {
    var p = event.server.playerList.getPlayerByName(n), a = ARRIVEE.attente[n]
    if (!p) { delete ARRIVEE.attente[n]; return }
    if (maintenant - a.depuis > ARRIVEE.maxMs) { atheriaArriveeLiberer(p, 'délai maximum'); return }
    // tenu en place : pas de chute, pas de glissade
    var dx = p.x - a.x, dy = p.y - a.y, dz = p.z - a.z
    if (dx * dx + dy * dy + dz * dz > 0.04) p.teleportTo(a.x, a.y, a.z)
    p.setMotion(0, 0, 0)
    p.fallDistance = 0
  })
})
