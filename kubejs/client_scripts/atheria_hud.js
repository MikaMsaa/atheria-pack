// Atheria - reçoit les affichages envoyés par le serveur (kubejs/server_scripts/atheria_hud.js) et les passe au mod atheria_hud.
var ATHERIA_HUD = null
try {
  ATHERIA_HUD = Java.loadClass('fr.atheria.hud.AtheriaHud')
} catch (e) {
  console.error('[Atheria HUD] mod absent : ' + e)
}

NetworkEvents.dataReceived('atheria_hud', event => {
  if (ATHERIA_HUD == null) return
  try {
    ATHERIA_HUD.recevoir(event.data)
  } catch (e) {
    console.error('[Atheria HUD] ' + e)
  }
})
