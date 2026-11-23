// Atheria - enchaînement de l'intro (Mika 22/11 : « Vidéo puis direct au hameau »).
// 1re connexion : Conditional Videos joue la vidéo d'intro (firstJoin), puis la partie en direct
// au hameau (cinématique Atheria Récit « intro », 21 s) part dès que le client signale la fin de la vidéo.
// L'intro automatique d'Atheria Récit est coupée par config/atheria_recit_sans_intro.txt ;
// c'est ce script qui la lance. /recit intro la rejoue comme avant.
var INTRO_VIDEO = { maxMs: 240000, attente: {} }

function atheriaIntroLancer(p, raison) {
  if (!INTRO_VIDEO.attente[p.username]) return
  delete INTRO_VIDEO.attente[p.username]
  p.persistentData.putBoolean('atheria_intro_lancee', true)
  console.info('[Atheria intro] ' + p.username + ' : partie en direct (' + raison + ')')
  p.server.runCommandSilent('recit cinematique intro ' + p.username)
}

PlayerEvents.loggedIn(event => {
  var p = event.player
  // serveur seulement : en solo la carte est générée normalement, pas de hameau
  if (!/DedicatedServer/.test('' + p.server)) return
  if (p.persistentData.getBoolean('atheria_intro_lancee')) return
  INTRO_VIDEO.attente[p.username] = Date.now()
})

PlayerEvents.loggedOut(event => { delete INTRO_VIDEO.attente[event.player.username] })

NetworkEvents.dataReceived('atheria_video_finie', event => atheriaIntroLancer(event.player, 'vidéo finie'))

ServerEvents.tick(event => {
  var noms = Object.keys(INTRO_VIDEO.attente)
  if (!noms.length || event.server.tickCount % 20) return
  noms.forEach(n => {
    var p = event.server.playerList.getPlayerByName(n)
    if (!p) { delete INTRO_VIDEO.attente[n]; return }
    if (Date.now() - INTRO_VIDEO.attente[n] > INTRO_VIDEO.maxMs) atheriaIntroLancer(p, 'délai maximum')
  })
})
