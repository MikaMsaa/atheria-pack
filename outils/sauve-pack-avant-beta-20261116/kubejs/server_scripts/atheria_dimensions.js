// Atheria Zombie Edition : seul l'Overworld est jouable. Le retour vers l'Overworld reste permis
// pour un joueur qui serait encore dans une autre dimension sur un ancien monde.
NativeEvents.onEvent('net.neoforged.neoforge.event.entity.EntityTravelToDimensionEvent', event => {
  if (('' + event.getDimension().location()) != 'minecraft:overworld') event.setCanceled(true)
})

NativeEvents.onEvent('net.neoforged.neoforge.event.level.BlockEvent$PortalSpawnEvent', event => {
  event.setCanceled(true)
})

// Pas de phantoms : seuls les infectés et les bêtes hantent les nuits
ServerEvents.loaded(event => {
  event.server.runCommandSilent('gamerule doInsomnia false')
})
