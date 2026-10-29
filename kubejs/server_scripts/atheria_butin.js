// Atheria Zombie Edition : rééquilibrage du butin (LootJS)
// Les objets ajoutés sont décrits dans kubejs/data/atheria/loot_table/inject/*.json (tables vanilla).
// Correspondance structure -> table et contenu détaillé : docs/butin.md

// Coffres de début : moins de diamants, enchantements plafonnés, pas d'objets trop forts
const BUTIN_DEBUT = [
  'minecraft:chests/simple_dungeon',
  'minecraft:chests/abandoned_mineshaft',
  'minecraft:chests/desert_pyramid',
  'minecraft:chests/jungle_temple',
  'minecraft:chests/buried_treasure',
  'minecraft:chests/shipwreck_treasure',
  'minecraft:chests/shipwreck_supply',
  'minecraft:chests/ruined_portal',
  'minecraft:chests/pillager_outpost',
  'minecraft:chests/underwater_ruin_big',
  'minecraft:chests/underwater_ruin_small',
  'minecraft:chests/igloo_chest',
  'minecraft:chests/spawn_bonus_chest',
  'minecraft:chests/woodland_mansion',
  'minecraft:chests/village/village_toolsmith',
  'minecraft:chests/village/village_weaponsmith',
  'lostcities:chests/lostcitychest',
  'lostcities:chests/raildungeonchest',
  'structory:harvest/graveyard',
  'structory:harvest/graveyard2',
  'structory:harvest/manor2/loot',
  'structory:harvest/manor2/treasure',
  'structory:harvest/old_manor/treasure',
  'structory:library/high',
  'structory:library/junk',
  'structory:library/low',
  'structory:outcast/boat/loot',
  'structory:outcast/generic/bandit',
  'structory:outcast/generic/miner',
  'structory:outcast/mine/loot',
  'structory:outcast/ruin/ruin',
  'structory:ruin/ruin',
  'structory:ruin/swamp/loot',
  'structory:ruin/taiga/illager_high',
  'structory:ruin/taiga/illager_treasure',
  'structory:ruin/taiga/loot',
  'underground_bunkers:chests/underground_bunker/underground_bunker_normal',
  'underground_bunkers:chests/underground_bunker/underground_bunker_supply'
]

const OBJETS_RETIRES_DEBUT = [
  'minecraft:enchanted_golden_apple',
  'minecraft:diamond_sword',
  'minecraft:diamond_pickaxe',
  'minecraft:diamond_axe',
  'minecraft:diamond_shovel',
  'minecraft:diamond_hoe',
  'minecraft:diamond_helmet',
  'minecraft:diamond_chestplate',
  'minecraft:diamond_leggings',
  'minecraft:diamond_boots',
  'minecraft:diamond_horse_armor',
  'tacz:modern_kinetic_gun',
  'tacz:ammo'
]

// Coffres civils : de rares fournitures médicales
const BUTIN_CIVIL = [
  'minecraft:chests/village/village_armorer',
  'minecraft:chests/village/village_butcher',
  'minecraft:chests/village/village_cartographer',
  'minecraft:chests/village/village_desert_house',
  'minecraft:chests/village/village_fisher',
  'minecraft:chests/village/village_fletcher',
  'minecraft:chests/village/village_mason',
  'minecraft:chests/village/village_plains_house',
  'minecraft:chests/village/village_savanna_house',
  'minecraft:chests/village/village_shepherd',
  'minecraft:chests/village/village_snowy_house',
  'minecraft:chests/village/village_taiga_house',
  'minecraft:chests/village/village_tannery',
  'minecraft:chests/village/village_temple',
  'minecraft:chests/village/village_toolsmith',
  'minecraft:chests/village/village_weaponsmith',
  'lostcities:chests/lostcitychest',
  'postapocalypse_structures:chests/food',
  'postapocalypse_structures:chests/trash',
  'create_fallout:chests/fallout',
  'structory:outcast/settlement',
  'structory:outcast/low',
  'structory:harvest/old_manor/common',
  'structory:mood/badlands',
  'structory:mood/cave',
  'structory:mood/desert',
  'structory:mood/farmer',
  'structory:mood/fisherman',
  'structory:mood/grassy',
  'structory:mood/jungle',
  'structory:mood/mangrove',
  'structory:mood/miner',
  'structory:mood/mushroom',
  'structory:mood/ocean',
  'structory:mood/snowy',
  'structory:mood/taiga'
]

// Structures militaires, police et médicales : table d'origine -> tables atheria ajoutées
const INJECTIONS = {
  'bunkers:chests/armory': ['atheria:inject/armurerie'],
  'bunkers:chests/ammo_storage': ['atheria:inject/depot_munitions'],
  'bunkers:chests/military_storage': ['atheria:inject/militaire'],
  'bunkers:chests/barracks': ['atheria:inject/militaire', 'atheria:inject/soins_rares'],
  'bunkers:chests/vault': ['atheria:inject/tresor_militaire'],
  'bunkers:chests/infirmary': ['atheria:inject/infirmerie'],
  'underground_bunkers:chests/underground_bunker/underground_bunker_normal': ['atheria:inject/militaire'],
  'underground_bunkers:chests/underground_bunker/underground_bunker_supply': ['atheria:inject/depot_munitions', 'atheria:inject/hopital'],
  'underground_bunkers:chests/underground_bunker/underground_bunker_treasure': ['atheria:inject/tresor_militaire'],
  // Spore : le bonus dépend de la structure (camp militaire, prison, hôpital), voir spore_structures.json
  'spore:chests/equipment_chest': ['atheria:inject/spore_structures'],
  'spore:chests/food_chest': ['atheria:inject/spore_structures'],
  'spore:chests/document_chest': ['atheria:inject/spore_structures'],
  'minecraft:chests/simple_dungeon': ['atheria:inject/spore_structures']
}

// Mods de structures présents seulement sur le serveur (Repurposed Structures, YUNG's, Terralith,
// Structory: Towers, Explorify) : trop de tables pour une liste, on les prend par motif d'identifiant.
// Nether, End, forteresses et cités antiques restent intacts (fin de progression).
const MOTIFS_DEBUT = [
  /^repurposed_structures:(chests|trapped_chests)\//,
  /^betterdungeons:/,
  /^explorify:/,
  /^structory_towers:/,
  /^terralith:/
]
const MOTIFS_FIN_DE_JEU = /nether|end|crimson|warped|basalt|soul|bastion|ancient_cit|stronghold/

const MOTIFS_CIVIL = [
  /^repurposed_structures:chests\/villages\/.*_house$/,
  /^terralith:village\/(desert|fortified)\/(generic|generic_low|attic|food|tavern_downstairs|tavern_upstairs)$/,
  /^explorify:chest\/(dark_forest_settlement|supply_cache)$/
]

LootJS.lootTables(event => {
  const existe = id => {
    if (event.hasLootTable(id)) return true
    console.warn(`[Atheria butin] table absente : ${id}`)
    return false
  }

  const toutesLesTables = []
  event.getLootTableIds().forEach(rl => toutesLesTables.push(String(rl)))
  const selonMotifs = motifs => toutesLesTables.filter(id => motifs.some(m => m.test(id)) && !MOTIFS_FIN_DE_JEU.test(id))

  const debut = BUTIN_DEBUT.filter(existe)
  selonMotifs(MOTIFS_DEBUT).forEach(id => { if (debut.indexOf(id) < 0) debut.push(id) })
  const civil = BUTIN_CIVIL.filter(existe).concat(selonMotifs(MOTIFS_CIVIL))
  console.info(`[Atheria butin] ${debut.length} tables de début rééquilibrées, ${civil.length} tables civiles avec soins rares`)

  debut.forEach(id => {
    const table = event.getLootTable(id)
    OBJETS_RETIRES_DEBUT.forEach(objet => table.removeItem(objet))
    table.modifyItemEntry(entree => {
      if (entree.test('minecraft:diamond')) {
        entree.setWeight(Math.max(1, Math.floor(entree.getWeight() / 4)))
        entree.setCount([1, 2])
      }
      // Enchantements plafonnés : niveaux 5 à 15 au lieu de 20-30 ou d'un niveau maximal au hasard
      const fonctions = entree.getFunctions()
      const avaitNiveaux = fonctions.remove('minecraft:enchant_with_levels')
      const avaitHasard = fonctions.remove('minecraft:enchant_randomly')
      if (avaitNiveaux || avaitHasard) entree.enchantWithLevels([5, 15])
      return entree
    })
  })

  civil.forEach(id => {
    event.getLootTable(id).createPool(pool => pool.addEntry(LootEntry.reference('atheria:inject/soins_rares')))
  })

  Object.keys(INJECTIONS).filter(existe).forEach(id => {
    const table = event.getLootTable(id)
    INJECTIONS[id].forEach(ajout => table.createPool(pool => pool.addEntry(LootEntry.reference(ajout))))
  })
})

LootJS.modifiers(event => {
  // TaCZ ajoute un pistolet et des munitions au coffre bonus de départ : retiré
  event.removeGlobalModifiers('tacz:loot_table_injector')
})
