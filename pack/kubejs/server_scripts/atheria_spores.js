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

// Atheria - ni Madness (murmures, hallucinations, voile) ni Uneasy (battements de coeur, sommeil refusé) : la peur est retirée du pack.
var SPORES_EFFETS_RETIRES = ['spore:madness', 'spore:uneasy']

NativeEvents.onEvent('LOWEST', 'net.neoforged.neoforge.event.entity.living.MobEffectEvent$Applicable', event => {
  var id = '' + event.getEffectInstance().getEffect().getRegisteredName()
  if (SPORES_EFFETS_RETIRES.indexOf(id) < 0) return
  event.setResult(Java.loadClass('net.neoforged.neoforge.event.entity.living.MobEffectEvent$Applicable$Result').DO_NOT_APPLY)
})

// Les joueurs déjà touchés dans une sauvegarde existante en sont libérés à la connexion
PlayerEvents.loggedIn(event => {
  SPORES_EFFETS_RETIRES.forEach(id => event.server.runCommandSilent('effect clear ' + event.player.username + ' ' + id))
  event.player.persistentData.remove('atheria_peur')
})
