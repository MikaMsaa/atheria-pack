// Atheria : lunes de sang (Enhanced Celestials 2).
// EC2 ne sait pas dire "pas avant le jour 10" ni "jamais une nuit de horde" : juste avant la tombee
// de la nuit, on retire la lune de sang (ou super lune de sang) prevue ce soir si l'une des deux regles
// n'est pas respectee. Frequence, ecart mini et multiplicateurs : kubejs/data/enhancedcelestials2defaultlunarevents.
var EC2 = Java.loadClass('dev.corgitaco.enhancedcelestials2core.EnhancedCelestials')
var HordeSavedData = Java.loadClass('net.smileycorp.hordes.hordeevent.capability.HordeSavedData')

var LUNES_JOUR_MIN = 10
var LUNES_DE_SANG = [
  'enhancedcelestials2defaultlunarevents:blood_moon',
  'enhancedcelestials2defaultlunarevents:super_blood_moon'
]

// Vrai si un joueur connecte a sa horde ce soir (The Hordes compte les jours par joueur)
function nuitDeHorde(level) {
  try {
    var data = HordeSavedData.getData(level)
    for (var player of level.getPlayers()) {
      if (data['getEvent(net.minecraft.server.level.ServerPlayer)'](player).isHordeDay(player)) return true
    }
    return false
  } catch (e) {
    // Repli : hordes tous les 7 jours (hordeSpawnDays = 7, sans variation)
    var jour = Math.floor(level.getDayTime() / 24000)
    return jour > 0 && jour % 7 == 0
  }
}

ServerEvents.tick(event => {
  var server = event.server
  if (server.tickCount % 100 != 0) return
  var level = server.overworld()
  var heure = level.getDayTime() % 24000
  // EC2 lance l'evenement a 12500 : on verifie entre 11000 et 12400
  if (heure < 11000 || heure > 12400) return

  var forecast = EC2.lunarForecastWorldData(level).orElse(null)
  if (!forecast) return
  // Rhino ne sait pas appeler les methodes d'une Long2ObjectMap : on lit son texte,
  // de la forme "{0=>Reference{ResourceKey[enhancedcelestials2core:lunar/event / <id>]=...}, 5=>..."
  var prevues = '' + forecast.upcomingEventsByDaysInAdvance()
  var m = prevues.match(/^\{0=>Reference\{ResourceKey\[[^\]]* \/ ([a-z0-9_.\-]+:[a-z0-9_.\/\-]+)\]/)
  if (!m) return
  var ceSoir = m[1]
  if (LUNES_DE_SANG.indexOf(ceSoir) < 0) return

  var jour = Math.floor(level.getDayTime() / 24000)
  var raison = null
  if (jour < LUNES_JOUR_MIN) raison = 'avant le jour ' + LUNES_JOUR_MIN
  else if (nuitDeHorde(level)) raison = 'nuit de horde'
  if (!raison) return

  if (forecast.removeLunarEvent(0)) {
    console.info('[Atheria] ' + ceSoir + ' annulee (jour ' + jour + ', ' + raison + ')')
  }
})
