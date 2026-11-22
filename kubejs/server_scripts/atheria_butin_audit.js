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
