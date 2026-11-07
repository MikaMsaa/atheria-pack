// Atheria Zombie Edition : le Nether et l'End sont fermés, les objets qui en venaient se fabriquent ou se trouvent dans l'Overworld.
// Le butin correspondant est dans kubejs/data/atheria/loot_table/inject/raretes.json.
ServerEvents.recipes(event => {
  // Armes TaCZ, Create, alchimie
  event.shaped('minecraft:blaze_rod', ['M', 'C', 'M'], { M: 'minecraft:magma_block', C: 'minecraft:coal_block' }).id('atheria:overworld/blaze_rod')
  event.shapeless('2x minecraft:glowstone_dust', ['minecraft:redstone', 'minecraft:gold_nugget', 'minecraft:glow_ink_sac']).id('atheria:overworld/glowstone_dust')
  event.shapeless('2x minecraft:glowstone_dust', ['minecraft:redstone', 'minecraft:gold_nugget', 'minecraft:glow_berries']).id('atheria:overworld/glowstone_dust_baies')
  event.shapeless('minecraft:quartz', ['minecraft:diorite', 'minecraft:diorite', 'minecraft:flint']).id('atheria:overworld/quartz')
  event.shapeless('minecraft:crying_obsidian', ['minecraft:obsidian', 'minecraft:lapis_lazuli', 'minecraft:amethyst_shard']).id('atheria:overworld/crying_obsidian')
  event.shapeless('minecraft:ghast_tear', ['minecraft:phantom_membrane', 'minecraft:amethyst_shard', 'minecraft:sugar']).id('atheria:overworld/ghast_tear')
  event.shapeless('minecraft:nether_wart', ['minecraft:red_mushroom', 'minecraft:brown_mushroom', 'minecraft:bone_meal']).id('atheria:overworld/nether_wart')
  event.shapeless('minecraft:ender_pearl', ['minecraft:amethyst_shard', 'minecraft:lapis_lazuli', 'minecraft:ghast_tear']).id('atheria:overworld/ender_pearl')
  // Fin de progression : volontairement cher
  event.shaped('minecraft:netherite_scrap', ['IOI', 'ODO', 'IOI'], { I: 'minecraft:iron_block', O: 'minecraft:crying_obsidian', D: 'minecraft:diamond' }).id('atheria:overworld/netherite_scrap')
  // Create : le brûleur demande normalement de capturer un blaze
  event.shapeless('create:blaze_burner', ['create:empty_blaze_burner', 'minecraft:blaze_rod', 'minecraft:blaze_rod']).id('atheria:overworld/blaze_burner')
  event.shapeless('2x create:cinder_flour', ['minecraft:gravel', 'minecraft:redstone', 'minecraft:charcoal']).id('atheria:overworld/cinder_flour')

  // Mines fantaisistes retirées : on garde celles qui ont leur place dans un monde réaliste
  ;['levitation', 'teleport', 'snow', 'zombie', 'potion', 'lightning', 'launch', 'fake'].forEach(nom => {
    event.remove({ output: 'landmines:' + nom + '_landmine' })
  })
})
