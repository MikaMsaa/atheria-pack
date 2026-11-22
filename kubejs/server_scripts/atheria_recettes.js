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

  // Create Deco : la recette « pancarte colorée + colorant blanc → pancarte » est écrite dans l'ancien format
  // et ne se charge pas en 1.21.1. On la recrée avec le même identifiant.
  event.shapeless('create:placard', ['#createdeco:placards', 'minecraft:white_dye']).id('createdeco:placard')
})

// Atheria (Mika 22/11) : les creepers et les slimes n'existent plus, leurs objets se fabriquent aussi.
// Poudre noire : charbon de bois, salpêtre (poudre d'os) et silex broyé. Les Gonflés en lâchent aussi (spore-common.toml).
ServerEvents.recipes(event => {
  event.shapeless('2x minecraft:gunpowder', ['minecraft:charcoal', 'minecraft:bone_meal', 'minecraft:bone_meal', 'minecraft:flint']).id('atheria:sans_creeper/poudre_noire')
  // Colle : algues, sucre et argile. Les Cracheurs en lâchent aussi.
  event.shapeless('minecraft:slime_ball', ['minecraft:kelp', 'minecraft:kelp', 'minecraft:sugar', 'minecraft:clay_ball']).id('atheria:sans_slime/colle')
})
