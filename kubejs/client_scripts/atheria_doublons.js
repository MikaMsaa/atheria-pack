// Atheria - objets en double cachés de JEI (voir server_scripts/atheria_doublons.js)
RecipeViewerEvents.removeEntries('item', event => {
  event.remove('spore:gas_mask')
  event.remove('create_fallout:stimpack')
})

// Objet qui plante quand on le mange (banc d'essai du 26/11, voir server_scripts/atheria_objets_casses.js) :
// caché du livre de recettes, et le clic droit est aussi annulé côté client pour que le repas ne démarre jamais.
RecipeViewerEvents.removeEntries('item', event => {
  event.remove('mts:mtsofficialpack.ocpbutter')
})
ItemEvents.rightClicked('mts:mtsofficialpack.ocpbutter', event => event.cancel())
