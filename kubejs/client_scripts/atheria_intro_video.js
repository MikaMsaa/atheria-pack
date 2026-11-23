// Atheria - côté joueur de l'enchaînement de l'intro (voir server_scripts/atheria_intro_video.js).
// Prévient le serveur quand l'écran vidéo de Conditional Videos se ferme (vue en entier ou passée).
// Si aucune vidéo n'apparaît dans les 8 s après l'arrivée (mod absent, déjà vue), on prévient aussi.
var atheriaVideo = { joueur: null, vue: false, envoye: false, pret: 0 }
ClientEvents.tick(event => {
  var p = Client.player
  if (!p || !Client.level) return
  if (atheriaVideo.joueur !== p) { atheriaVideo.joueur = p; atheriaVideo.vue = false; atheriaVideo.envoye = false; atheriaVideo.pret = 0 }
  if (atheriaVideo.envoye) return
  var ecran = Client.screen ? '' + Client.screen : ''
  if (/conditionalvideos|watermedia/i.test(ecran)) { atheriaVideo.vue = true; return }
  if (/ReceivingLevelScreen|LevelLoadingScreen|ConnectScreen/.test(ecran)) return
  atheriaVideo.pret++
  if (atheriaVideo.vue || atheriaVideo.pret > 160) {
    p.sendData('atheria_video_finie', {})
    atheriaVideo.envoye = true
  }
})
