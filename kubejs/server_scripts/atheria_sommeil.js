// Atheria - le sommeil ne fait plus passer la nuit (Mika 22/11) : la nuit reste dangereuse pour tout le monde.
// Dormir sert à récupérer :
//  - pendant le sommeil : un demi-cœur rendu toutes les 2 secondes, et la faim ne baisse pas ;
//  - au réveil, après au moins une minute de sommeil : « Reposé », régénération légère pendant 2 minutes
//    (une fois toutes les 20 minutes de temps réel, pour ne pas en abuser).
// La soif n'est pas touchée (Thirst Was Taken garde ses règles). Les lits, sacs de couchage et hamacs marchent pareil.
// On ne peut toujours pas dormir avec des infectés à côté ni pendant une horde (vanilla et The Hordes).
var SOMMEIL = {
  periode: 40,
  soin: 1,
  reposMinSec: 60,
  reposEffetSec: 120,
  reposDelaiMin: 20
}

ServerEvents.loaded(event => {
  // 101 % : aucun nombre de dormeurs ne fait passer la nuit (Comforts suit cette règle : daySleepingPercentage = -1)
  event.server.runCommandSilent('gamerule playersSleepingPercentage 101')
})

ServerEvents.tick(event => {
  var server = event.server
  if (server.tickCount % SOMMEIL.periode != 20) return
  server.players.forEach(p => {
    var d = p.persistentData
    var dort = p.isSleeping()
    var duree = d.getInt('atheria_sommeil_sec')
    if (dort) {
      if (duree == 0 && !d.getBoolean('atheria_sommeil_explique')) {
        d.putBoolean('atheria_sommeil_explique', true)
        p.tell(Text.gray('Ici, dormir ne fait pas passer la nuit. Mais ça soigne, et la faim te laisse tranquille pendant ce temps.'))
      }
      d.putInt('atheria_sommeil_sec', duree + SOMMEIL.periode / 20)
      if (p.health < p.maxHealth) p.heal(SOMMEIL.soin)
      p.foodData.setExhaustion(0)
      return
    }
    if (duree <= 0) return
    // réveil
    d.putInt('atheria_sommeil_sec', 0)
    if (duree < SOMMEIL.reposMinSec) return
    var dernier = d.getLong('atheria_repos_dernier')
    if (dernier && Date.now() - dernier < SOMMEIL.reposDelaiMin * 60 * 1000) return
    d.putLong('atheria_repos_dernier', Date.now())
    p.potionEffects.add('minecraft:regeneration', SOMMEIL.reposEffetSec * 20, 0, false, true)
    p.setStatusMessage(Text.green('Reposé : tu récupères mieux pendant 2 minutes.'))
  })
})
