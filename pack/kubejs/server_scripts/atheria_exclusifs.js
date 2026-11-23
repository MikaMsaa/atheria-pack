// Objets obtenables uniquement par les quêtes Atheria (généré)
ServerEvents.recipes(event => {
  event.remove({ output: 'sophisticatedbackpacks:gold_backpack' })
  event.remove({ output: 'sophisticatedbackpacks:diamond_backpack' })
  event.remove({ output: 'sophisticatedbackpacks:netherite_backpack' })
})
LootJS.modifiers(event => {
  event.addTableModifier(LootType.CHEST).removeLoot('sophisticatedbackpacks:gold_backpack')
  event.addTableModifier(LootType.CHEST).removeLoot('sophisticatedbackpacks:diamond_backpack')
  event.addTableModifier(LootType.CHEST).removeLoot('sophisticatedbackpacks:netherite_backpack')
})
