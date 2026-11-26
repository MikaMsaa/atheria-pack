// Atheria - journée de 30 min et nuit de 20 min en temps réel (retours bêta du 25/11, choix de Mika).
// Vanilla : 24 000 ticks = 20 min (jour 0-12 000 = 10 min, nuit 12 000-24 000 = 10 min).
// Ici le cycle vanilla est coupé (doDaylightCycle false) et le serveur avance l'heure lui-même :
// le jour d'un tick tous les 3 ticks (12 000 ticks en 30 min), la nuit d'un tick tous les 2 (12 000 ticks en 20 min).
// L'heure reste une vraie heure Minecraft (getDayTime) : lunes, radio, hordes, saisons et lunes d'Enhanced Celestials
// la lisent comme avant. Les clients reçoivent l'heure chaque seconde : le soleil avance sans à-coup visible.
var CYCLE = { jourParTick: 1 / 3, nuitParTick: 1 / 2, debutNuit: 12000, reste: 0 }

ServerEvents.loaded(event => {
  event.server.runCommandSilent('gamerule doDaylightCycle false')
})

ServerEvents.tick(event => {
  var level = event.server.overworld()
  var t = level.getDayTime()
  CYCLE.reste += (t % 24000) < CYCLE.debutNuit ? CYCLE.jourParTick : CYCLE.nuitParTick
  if (CYCLE.reste < 1) return
  var n = Math.floor(CYCLE.reste)
  CYCLE.reste -= n
  level.setDayTime(t + n)
})
