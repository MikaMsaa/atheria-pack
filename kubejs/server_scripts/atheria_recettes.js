// Atheria Zombie Edition : recettes du pack
// Les recettes liées aux quêtes (armes TaCZ, véhicules, munitions) viendront quand on aura la liste des ID d'objets.

ServerEvents.recipes(event => {
  // La boussole d'explorateur ne se fabrique pas : elle s'obtient en récompense de quête (chapitre 4)
  event.remove({ output: 'explorerscompass:explorerscompass' })

  // La boussole de la nature reste fabricable, mais plus chère : 4 lingots de fer en plus de la boussole,
  // de la mousse et des pousses à récolter dans les ruines (environ 8 fer au total, fin de semaine 1)
  event.remove({ output: 'naturescompass:naturescompass' })
  event.shaped('naturescompass:naturescompass', [
    'IMI',
    'SCS',
    'IMI'
  ], {
    I: 'minecraft:iron_ingot',
    S: '#minecraft:saplings',
    M: 'minecraft:moss_block',
    C: 'minecraft:compass'
  })
})
