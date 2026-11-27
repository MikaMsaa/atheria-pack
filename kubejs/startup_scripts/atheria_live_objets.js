// Atheria - soirées live : l'insigne de soirée (un seul objet, nommé d'après la soirée à la remise) et les titres des gagnants.
StartupEvents.registry('item', event => {
  event.create('atheria:insigne_soiree').displayName('Insigne de soirée').texture('atheria:item/insigne_soiree').maxStackSize(16).rarity('uncommon')
})

var ATHERIA_TITRES_LIVE = {
  roi_rn1: 'Roi de la RN1',
  grand_acheteur: 'Client préféré d\'Eniy'
}
if (!global.ATHERIA_TITRES) global.ATHERIA_TITRES = {}
for (var k in ATHERIA_TITRES_LIVE) global.ATHERIA_TITRES[k] = ATHERIA_TITRES_LIVE[k]
