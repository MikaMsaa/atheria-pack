// Atheria - arrivée protégée, côté joueur (voir server_scripts/atheria_arrivee.js).
// Prévient le serveur quand le terrain autour du joueur est reçu et affiché depuis une seconde.
var atheriaArrivee = { envoye: false, pret: 0, joueur: null }
ClientEvents.tick(event => {
  var p = Client.player, niveau = Client.level
  if (!p || !niveau) { atheriaArrivee.envoye = false; atheriaArrivee.pret = 0; return }
  // nouvelle connexion (le joueur client change à chaque arrivée) : on recommence
  if (atheriaArrivee.joueur !== p) { atheriaArrivee.joueur = p; atheriaArrivee.envoye = false; atheriaArrivee.pret = 0 }
  if (atheriaArrivee.envoye) return
  try {
    if (Client.screen && /ReceivingLevelScreen|LevelLoadingScreen|ConnectScreen/.test('' + Client.screen)) { atheriaArrivee.pret = 0; return }
    var cx = Math.floor(p.x) >> 4, cz = Math.floor(p.z) >> 4, ok = true
    var cache = niveau.getChunkSource()
    for (var i = -1; i <= 1 && ok; i++) for (var j = -1; j <= 1 && ok; j++) if (!cache.hasChunk(cx + i, cz + j)) ok = false
    if (ok && !Client.levelRenderer.isSectionCompiled(p.blockPosition())) ok = false
    atheriaArrivee.pret = ok ? atheriaArrivee.pret + 1 : 0
    if (atheriaArrivee.pret >= 20) {
      p.sendData('atheria_arrivee_pret', {})
      atheriaArrivee.envoye = true
    }
  } catch (e) {
    // en cas d'erreur, on libère tout de suite plutôt que de bloquer le joueur
    p.sendData('atheria_arrivee_pret', {})
    atheriaArrivee.envoye = true
    console.error('[Atheria arrivée] ' + e)
  }
})
