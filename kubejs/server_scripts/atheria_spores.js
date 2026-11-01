// Atheria - pas de foyer d'infection (mound Spore) trop tôt ni trop près des joueurs.
// Les infectés créent ces foyers en mourant ou en se transformant : on refuse seulement
// les nouveaux, ceux déjà présents dans le monde ne bougent pas.
var SPORES_JOUR_MIN = 7       // première nuit de horde
var SPORES_DISTANCE_MIN = 96  // blocs autour de chaque joueur

NativeEvents.onEvent('net.neoforged.neoforge.event.entity.EntityJoinLevelEvent', event => {
  if (event.loadedFromDisk()) return
  var level = event.getLevel()
  if (level.isClientSide()) return
  var entity = event.getEntity()
  if (String(entity.getType()) != 'spore:mound') return
  var jour = Math.floor(Number(level.getDayTime()) / 24000)
  var proche = false
  level.getPlayers().forEach(p => {
    if (Math.hypot(p.getX() - entity.getX(), p.getZ() - entity.getZ()) < SPORES_DISTANCE_MIN) proche = true
  })
  if (jour < SPORES_JOUR_MIN || proche) event.setCanceled(true)
})
