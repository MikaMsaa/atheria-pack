// Atheria - soirées live : l'insigne de soirée (un seul objet, nommé d'après la soirée à la remise) et les titres des gagnants.
StartupEvents.registry('item', event => {
  event.create('atheria:insigne_soiree').displayName('Insigne de soirée').texture('atheria:item/insigne_soiree').maxStackSize(16).rarity('uncommon')
  // soirée « convoi de la PAF » : une caisse de médicaments (n'existe que pendant la soirée)
  event.create('atheria:caisse_paf').displayName('Caisse de médicaments de la PAF').texture('atheria:item/caisse_paf').maxStackSize(1).rarity('rare')
})

var ATHERIA_TITRES_LIVE = {
  roi_rn1: 'Roi de la RN1',
  grand_acheteur: 'Client préféré d\'Eniy',
  escorte_paf: 'Escorte de la PAF'
}
if (!global.ATHERIA_TITRES) global.ATHERIA_TITRES = {}
for (var k in ATHERIA_TITRES_LIVE) global.ATHERIA_TITRES[k] = ATHERIA_TITRES_LIVE[k]
