// Atheria - les livrets MTS ouvrent le guide côté client : le serveur ne doit pas ouvrir l'ancien par-dessus.
;['mts:mts.handbook_car', 'mts:mts.handbook_plane'].forEach(id => ItemEvents.rightClicked(id, event => event.cancel()))

// Téléporter un joueur assis dans un véhicule MTS fait planter le serveur (« Entity is already tracked ») :
// quand le véhicule se décharge, son siège ramène le joueur en plein chargement de chunk. On le fait descendre avant.
ServerEvents.command(event => {
  var nomCommande = '' + event.getCommandName()
  if (nomCommande != 'tp' && nomCommande != 'teleport') return
  var saisie = '' + event.getInput()
  var source = event.getParseResults().getContext().getSource().getEntity()
  event.getServer().players.forEach(joueur => {
    var vehicule = joueur.getVehicle()
    if (vehicule == null || ('' + vehicule.getType()).indexOf('mts') < 0) return
    if (saisie.indexOf('@') >= 0 || saisie.indexOf('' + joueur.username) >= 0 || (source != null && source.getUuid().equals(joueur.getUuid()))) {
      console.info('[Atheria vehicule] descente avant téléportation de ' + joueur.username)
      vehicule.entity.removeRider()
    }
  })
})
