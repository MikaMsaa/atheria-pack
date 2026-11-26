// Atheria - objets en double (retours bêta du 25/11) : un seul masque à gaz et un seul stimpack dans le jeu.
// On garde le masque à gaz de TaCZ Tactical Breaching (le seul qui prend un filtre, vendu par Eniy) et le stimpack
// militaire (vendu par Eniy, sans le plantage de celui de Create Fallout). Le double est retiré des recettes, caché de
// JEI (client_scripts/atheria_doublons.js) et changé en l'objet gardé dès qu'il entre dans l'inventaire d'un joueur
// (coffre, butin de mob, ancien stock), en gardant le nombre.
var DOUBLONS = {
  'spore:gas_mask': 'tacz_tactical_breaching:gas_mask',
  'create_fallout:stimpack': 'militaristic_armor:stimpack'
}

ServerEvents.recipes(event => {
  Object.keys(DOUBLONS).forEach(id => {
    event.remove({ output: id })
    event.replaceInput({ input: id }, id, DOUBLONS[id])
  })
})

PlayerEvents.inventoryChanged(event => {
  var id = '' + event.item.id, garde = DOUBLONS[id]
  if (!garde) return
  var p = event.player, inv = p.inventory
  for (var i = 0; i < inv.containerSize; i++) {
    var s = inv.getItem(i)
    if (s.isEmpty() || ('' + s.id) !== id) continue
    inv.setItem(i, Item.of(garde, s.count))
  }
})
