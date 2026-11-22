// Atheria - danger selon la distance (Mika 22/11, mécanique validée) : plus on s'éloigne de Longoni, meilleur est le butin.
// Les infectés, eux, prennent un stade d'avance au-delà de 4500 blocs (atheria-bestiaire, reglages.json : distance_bonus).
// Le joueur qui ouvre le coffre (Lootr : chacun le sien) est presque à la position du coffre, on mesure donc sa distance au spawn.
// Relevé de la carte gelée 22/11 : 89 000 conteneurs, dont 5 % à moins de 2 km du spawn et 35 % au-delà de 6 km.
var BUTIN_PALIERS = [
  // [distance mini, chance, table ajoutée]
  [3000, 0.30, 'atheria:inject/munitions_pistolet'],
  [3000, 0.15, 'atheria:inject/soins_rares'],
  [6000, 0.25, 'atheria:inject/munitions_militaires'],
  [6000, 0.10, 'atheria:inject/equipement_militaire'],
  [6000, 0.04, 'atheria:inject/arme_longue']
]

function atheriaDistanceSpawn(joueur) {
  var spawn = joueur.server.overworld().getSharedSpawnPos()
  var dx = joueur.x - spawn.x
  var dz = joueur.z - spawn.z
  return Math.sqrt(dx * dx + dz * dz)
}

LootJS.modifiers(event => {
  BUTIN_PALIERS.forEach(p => {
    event.addTableModifier(LootType.CHEST)
      .matchPlayerCustom(joueur => atheriaDistanceSpawn(joueur) >= p[0])
      .randomChance(p[1])
      .addLoot(LootEntry.reference(p[2]))
  })
})
