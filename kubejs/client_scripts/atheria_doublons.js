// Atheria - objets en double cachés de JEI (voir server_scripts/atheria_doublons.js)
RecipeViewerEvents.removeEntries('item', event => {
  event.remove('spore:gas_mask')
  event.remove('create_fallout:stimpack')
})
