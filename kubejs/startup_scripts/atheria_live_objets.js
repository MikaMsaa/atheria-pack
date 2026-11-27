// Atheria - soirées live : l'insigne de soirée (un seul objet, nommé d'après la soirée à la remise) et les titres des gagnants.
StartupEvents.registry('item', event => {
  event.create('atheria:insigne_soiree').displayName('Insigne de soirée').texture('atheria:item/insigne_soiree').maxStackSize(16).rarity('uncommon')
  // soirée « convoi de la PAF » : une caisse de médicaments (n'existe que pendant la soirée)
  // soirée « la fermeture des portes » : le sac de vivres d'un groupe de réfugiés (n'existe que pendant la soirée)
  event.create('atheria:sac_vivres').displayName('Sac de vivres des réfugiés').texture('atheria:item/sac_vivres').maxStackSize(4).rarity('uncommon')
  // soirée « la chasse aux Puffs » : le Puff doré d'Eniy (collection, se garde après la soirée)
  event.create('atheria:puff_eniy').displayName('Puff doré d\'Eniy').texture('atheria:item/puff_eniy').maxStackSize(16).rarity('epic')
  event.create('atheria:caisse_paf').displayName('Caisse de médicaments de la PAF').texture('atheria:item/caisse_paf').maxStackSize(1).rarity('rare')
})

var ATHERIA_TITRES_LIVE = {
  roi_rn1: 'Roi de la RN1',
  grand_acheteur: 'Client préféré d\'Eniy',
  escorte_paf: 'Escorte de la PAF',
  gardien_porte: 'Gardien de la Porte',
  fouineur: 'Fouineur d\'Eniy'
}
if (!global.ATHERIA_TITRES) global.ATHERIA_TITRES = {}
for (var k in ATHERIA_TITRES_LIVE) global.ATHERIA_TITRES[k] = ATHERIA_TITRES_LIVE[k]
