// Atheria - tempêtes de cendres (Mika 22/11, mécanique validée).
// De temps en temps, le vent rabat les cendres sur l'île pendant 10 minutes :
//  - pluie sombre et nuages de cendre autour des joueurs dehors ;
//  - dehors, l'air se respire comme dans la zone contaminée : sans masque ni filtre, il empoisonne (atheria_air.js) ;
//  - les infectés sortent comme la nuit, 30 % plus nombreux (atheria-bestiaire, #tempete dans le tableau « atheria »).
// Au moins 90 minutes de temps réel entre deux tempêtes, puis une chance par minute : environ une tempête toutes les 2 h 30 de jeu.
// Jamais avant le jour 3 du serveur, ni pendant une lune de sang ou une nuit de horde.
var TEMPETE = {
  dureeMin: 10,
  ecartMin: 90,
  chanceParMinute: 1 / 60,
  jourMini: 3,
  periodeAir: 40
}

function atheriaTempeteScore(server, v) {
  server.runCommandSilent('scoreboard objectives add atheria dummy')
  server.runCommandSilent('scoreboard players set #tempete atheria ' + v)
}

function atheriaTempeteDehors(joueur) {
  var BP = Java.loadClass('net.minecraft.core.BlockPos')
  return joueur.level.canSeeSky(new BP(Math.floor(joueur.x), Math.floor(joueur.y + 1.7), Math.floor(joueur.z)))
}

function atheriaTempeteDebut(server) {
  var data = server.persistentData
  data.putLong('atheria_tempete_fin', Date.now() + TEMPETE.dureeMin * 60 * 1000)
  atheriaTempeteScore(server, 1)
  server.runCommandSilent('weather rain ' + (TEMPETE.dureeMin * 60) + 's')
  server.players.forEach(p => {
    atheriaHud(p, { t: 'tempete', actif: true })
    server.runCommandSilent('playsound minecraft:item.elytra.flying ambient ' + p.username + ' ~ ~ ~ 0.6 0.5')
  })
}

function atheriaTempeteFin(server) {
  server.persistentData.remove('atheria_tempete_fin')
  server.persistentData.putLong('atheria_tempete_derniere', Date.now())
  atheriaTempeteScore(server, 0)
  server.runCommandSilent('weather clear')
  server.players.forEach(p => atheriaHud(p, { t: 'tempete', actif: false }))
}

// Un joueur qui arrive pendant une tempête la voit à l'écran
PlayerEvents.loggedIn(event => {
  var fin = event.server.persistentData.getLong('atheria_tempete_fin')
  if (!fin || Date.now() >= fin) return
  var nom = event.player.username
  event.server.scheduleInTicks(100, () => {
    var p = event.server.getPlayerList().getPlayerByName(nom)
    if (p) atheriaHud(p, { t: 'tempete', actif: true })
  })
})

ServerEvents.tick(event => {
  var server = event.server
  var data = server.persistentData
  var fin = data.getLong('atheria_tempete_fin')

  // pendant la tempête : cendres et air toxique dehors
  if (fin) {
    if (Date.now() >= fin) { atheriaTempeteFin(server); return }
    if (server.tickCount % TEMPETE.periodeAir != 0) return
    server.players.forEach(p => {
      if (p.isSpectator() || p.isCreative() || !atheriaTempeteDehors(p)) return
      server.runCommandSilent('execute at ' + p.username + ' run particle minecraft:white_ash ~ ~3 ~ 12 4 12 0.02 400 normal ' + p.username)
      server.runCommandSilent('execute at ' + p.username + ' run particle minecraft:ash ~ ~2 ~ 8 3 8 0.01 200 normal ' + p.username)
      if (!airBiome(p)) airRespirer(p)
    })
    return
  }

  // tirage une fois par minute
  if (server.tickCount % 1200 != 600 || server.players.isEmpty()) return
  if (server.overworld().getDayTime() / 24000 < TEMPETE.jourMini) return
  var derniere = data.getLong('atheria_tempete_derniere')
  if (derniere && Date.now() - derniere < TEMPETE.ecartMin * 60 * 1000) return
  var sb = server.scoreboard, o = sb.getObjective('atheria')
  if (o) {
    var SH = Java.loadClass('net.minecraft.world.scores.ScoreHolder')
    var lune = sb.getOrCreatePlayerScore(SH.forNameOnly('#lune'), o).get()
    var horde = sb.getOrCreatePlayerScore(SH.forNameOnly('#horde'), o).get()
    if (lune > 0 || horde > 0) return
  }
  if (Math.random() < TEMPETE.chanceParMinute * (atheriaSemaine() == 'cendres' ? 2 : 1)) atheriaTempeteDebut(server)
})

// un redémarrage du serveur pendant une tempête la termine proprement au prochain tick
ServerEvents.loaded(event => {
  if (event.server.persistentData.getLong('atheria_tempete_fin')) atheriaTempeteScore(event.server, 1)
})
