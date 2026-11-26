// Atheria - objets qui plantent quand on s'en sert (banc d'essai du 26/11, lot 2). Chaque objet du pack a été utilisé
// une fois sur une copie (clic droit, clic droit au sol, fin d'utilisation) : un seul plantage hors Stimpack (déjà corrigé
// par atheria_stimpack.js et converti par atheria_doublons.js).
//  mts:mtsofficialpack.ocpbutter : le beurre du pack officiel MTS donne l'effet « minecraft:instant_damage », qui n'existe
//  plus en 1.21 (NullPointerException à la fin du repas, le joueur serait expulsé). Il ne se mange plus et ne se fabrique plus.
var OBJETS_CASSES = ['mts:mtsofficialpack.ocpbutter']

OBJETS_CASSES.forEach(id => ItemEvents.rightClicked(id, event => {
  event.cancel()
  event.player.setStatusMessage(Text.gray('Ce beurre est immangeable.'))
}))

ServerEvents.recipes(event => {
  OBJETS_CASSES.forEach(id => event.remove({ output: id }))
})
