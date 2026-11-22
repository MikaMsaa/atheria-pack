// Atheria - corrections du butin après l'audit des coffres de la carte gelée (22/11, relevé du fil Carte : 89 000 conteneurs).
// Principe de Mika : explorer doit récompenser avec le matériel du pack, pas avec le butin « classique » de Minecraft.
//  1. Donjons souterrains (Repurposed Structures et donjons vanilla : 34 000 coffres, Lootr = un butin par joueur) :
//     plus de pommes dorées, de pommes de Notch, de livres enchantés ni de disques. Rien n'est ajouté : atheria_butin.js
//     y met déjà rations, soins, filtres et essence (test : 60 coffres « deep » = 44 rations, 34 bidons, 33 bandages).
//  2. Bunkers souterrains (21 000 coffres « supply » et « normal ») : plus de diamants (ils faisaient monter le stade par l'armure
//     sans rien explorer d'autre) ; les coffres « treasure », rares, gardent les leurs.
//  3. 8 766 coffres et tonneaux sont restés vanilla (pas Lootr) : le premier joueur prenait tout. Ils deviennent Lootr
//     quand un joueur les ouvre pour la première fois (même table de butin), chacun a donc le sien.
var BUTIN_DONJONS = /^(repurposed_structures:chests\/dungeons\/.*|minecraft:chests\/simple_dungeon)$/
var BUTIN_BUNKERS = /^underground_bunkers:chests\/underground_bunker\/underground_bunker_(supply|normal)$/

LootJS.modifiers(event => {
  event.addTableModifier(BUTIN_DONJONS)
    .removeLoot('minecraft:golden_apple')
    .removeLoot('minecraft:enchanted_golden_apple')
    .removeLoot('minecraft:book')
    .removeLoot('minecraft:enchanted_book')
    .removeLoot('#minecraft:creeper_drop_music_discs')
    .removeLoot('minecraft:music_disc_otherside')
  event.addTableModifier(BUTIN_BUNKERS).removeLoot('minecraft:diamond')
})

// 3. conversion en Lootr à la première ouverture
var BUTIN_VERS_LOOTR = { 'minecraft:chest': 'lootr:lootr_chest', 'minecraft:barrel': 'lootr:lootr_barrel', 'minecraft:trapped_chest': 'lootr:lootr_trapped_chest' }
BlockEvents.rightClicked(event => {
  var b = event.block, cible = BUTIN_VERS_LOOTR[String(b.id)]
  if (!cible || event.player.isShiftKeyDown()) return
  var be = b.entity
  if (!be) return
  var nbt = be.saveWithoutMetadata(event.level.registryAccess())
  if (!nbt.contains('LootTable')) return
  var table = String(nbt.getString('LootTable')), graine = nbt.getLong('LootTableSeed')
  var props = b.properties, etat = {}
  if (props.facing) etat.facing = String(props.facing)
  if (props.waterlogged) etat.waterlogged = String(props.waterlogged)
  if (props.open) etat.open = 'false'
  b.set(cible, etat)
  var nouveau = event.level.getBlockEntity(b.pos)
  if (nouveau) {
    var t = nouveau.saveWithoutMetadata(event.level.registryAccess())
    t.putString('LootTable', table)
    if (graine) t.putLong('LootTableSeed', graine)
    nouveau.loadWithComponents(t, event.level.registryAccess())
    nouveau.setChanged()
  }
})

// 4. Intérieurs des villes (choix de Mika 22/11 : « les deux ») : la carte gelée n'a qu'environ 1 300 conteneurs en surface
//    dans les villes ; en attendant que le fil Carte en ajoute après la bêta, ceux qui existent donnent plus.
//    Emprises des villes = boîte des conteneurs relevés (coffres-carte-20261122.csv), en surface seulement (y >= 50).
var BUTIN_VILLES = [
  // [nom, xmin, zmin, xmax, zmax]
  ['mamoudzou', 2626, -1539, 3180, -457], ['kaweni', 1253, -2606, 1761, -2113], ['longoni', 2209, -3206, 3030, -2644],
  ['sada', -4159, 287, -3701, 743], ['somaco', 3956, -904, 4454, -421], ['dembeni', 1810, 44, 2434, 900],
  ['majicavo', 2212, -2260, 2713, -1748], ['vahibe', -2310, 1823, -1758, 2263], ['handrema', 1360, 2488, 1814, 2892],
  ['chirongui', 528, 3536, 1021, 3945], ['coconi', -1175, -1304, -714, -677], ['choungui', -488, 1300, -162, 1659],
  ['ice', 4310, 4509, 4711, 4859], ['pecheurs', 2264, 4937, 2608, 5259], ['zamani', -1552, 4430, -1133, 4829],
  ['mtsamboro', -3282, -5424, -2841, -5054]
]
function atheriaEnVille(j) {
  if (j.y < 50) return false
  for (var i = 0; i < BUTIN_VILLES.length; i++) {
    var v = BUTIN_VILLES[i]
    if (j.x >= v[1] - 16 && j.x <= v[3] + 16 && j.z >= v[2] - 16 && j.z <= v[4] + 16) return true
  }
  return false
}
var BUTIN_VILLE_AJOUTS = [
  [0.60, 'atheria:inject/fournitures'],
  [0.35, 'atheria:inject/soins'],
  [0.15, 'atheria:inject/munitions_pistolet']
]
LootJS.modifiers(event => {
  BUTIN_VILLE_AJOUTS.forEach(a => {
    event.addTableModifier(LootType.CHEST).matchPlayerCustom(j => atheriaEnVille(j)).randomChance(a[0]).addLoot(LootEntry.reference(a[1]))
  })
})
