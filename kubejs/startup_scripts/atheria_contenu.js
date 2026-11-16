// Atheria : blocs des biomes et objets de survie sur la route.
StartupEvents.registry('block', event => {
  event.create('atheria:tronc_calcine').displayName('Tronc calciné').mapColor('color_black').soundType('wood').hardness(1.2).resistance(1.0).tagBlock('minecraft:mineable/axe')
  event.create('atheria:terre_calcinee').displayName('Terre calcinée').mapColor('color_black').soundType('gravel').hardness(0.6).resistance(0.5).tagBlock('minecraft:mineable/shovel').tagBlock('minecraft:dirt').tagBlock('minecraft:overworld_carver_replaceables')
  event.create('atheria:sol_cendre').displayName('Sol de cendres').mapColor('color_gray').soundType('sand').hardness(0.5).resistance(0.5).tagBlock('minecraft:mineable/shovel').tagBlock('minecraft:dirt').tagBlock('minecraft:overworld_carver_replaceables')
  event.create('atheria:carrosserie').displayName('Carrosserie rouillée').mapColor('terracotta_brown').soundType('metal').hardness(2.0).resistance(3.0).requiresTool(false).tagBlock('minecraft:mineable/pickaxe')
  event.create('atheria:reservoir_epave').displayName("Réservoir d'épave").mapColor('terracotta_brown').soundType('metal').hardness(2.0).resistance(3.0).requiresTool(false).tagBlock('minecraft:mineable/pickaxe')
})

StartupEvents.registry('item', event => {
  event.create('atheria:kit_siphon').displayName('Kit de siphonnage').texture('minecraft:item/lead').maxStackSize(1).maxDamage(12)
  event.create('atheria:pieces_vehicule').displayName('Pièces détachées').texture('minecraft:item/chain').maxStackSize(16)
  event.create('atheria:carte_routiere').displayName('Carte routière').texture('minecraft:item/map').maxStackSize(8)
})
