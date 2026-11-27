// Atheria - armes lourdes cachées de JEI jusqu'à leur semaine d'arrivée (startup_scripts/atheria_calendrier_armes.js).
// La date est lue à l'ouverture du monde : une arme arrivée réapparaît dans JEI à la connexion suivante.
RecipeViewerEvents.removeEntries('item', event => {
  global.atheriaArmesVerrouillees().forEach(id => {
    event.remove(Item.of('tacz:modern_kinetic_gun[custom_data={GunId:"' + id + '"}]'))
  })
})
