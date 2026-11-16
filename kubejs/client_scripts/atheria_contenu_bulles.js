// Atheria : info-bulles des objets de route
ItemEvents.modifyTooltips(event => {
  event.add('atheria:kit_siphon', [Text.gray("Clic droit sur le réservoir d'une épave, ou près d'un véhicule.")])
  event.add('atheria:pieces_vehicule', [Text.gray("Clic droit près d'un véhicule abîmé pour le réparer.")])
  event.add('atheria:carte_routiere', [Text.gray("Clic droit : indique une ville que tu ne connais pas encore.")])
  event.add('atheria:bidon_essence', [Text.gray("Clic droit près d'un véhicule pour remplir son réservoir.")])
  event.add('atheria:radio_portative', [Text.gray("Accroupi : cherche une balise de ville, une fois par jour.")])
})
