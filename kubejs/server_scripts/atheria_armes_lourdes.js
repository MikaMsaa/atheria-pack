// Atheria - armes lourdes verrouillées jusqu'à leur semaine d'arrivée (calendrier : startup_scripts/atheria_calendrier_armes.js).
//  - butin : retirées de tous les coffres et des créatures tant qu'elles sont verrouillées (vérifié à chaque ouverture) ;
//  - établi d'armurier : recettes retirées (appliqué au chargement, donc au redémarrage quotidien de 4 h) ;
//  - une arme verrouillée obtenue quand même (commande, ancien stock) ne tire pas ;
//  - le lundi de son arrivée, la radio annonce la vague.
function atheriaGunId(stack) {
  try {
    if (!stack || String(stack.id) != 'tacz:modern_kinetic_gun') return ''
    var cd = stack.getComponents().get(Java.loadClass('net.minecraft.core.component.DataComponents').CUSTOM_DATA)
    return cd ? String(cd.copyTag().getString('GunId')) : ''
  } catch (e) {
    return ''
  }
}

function atheriaArmeVerrouillee(stack) {
  var id = atheriaGunId(stack)
  return id != '' && global.atheriaArmesVerrouillees().indexOf(id) >= 0
}

LootJS.modifiers(event => {
  var filtre = ItemFilter.custom(s => atheriaArmeVerrouillee(s))
  event.addTableModifier(LootType.CHEST).removeLoot(filtre)
  event.addTableModifier(LootType.ENTITY).removeLoot(filtre)
})

ServerEvents.recipes(event => {
  global.atheriaArmesVerrouillees().forEach(id => event.remove({ id: 'tacz:gun/' + id.split(':')[1] }))
})

NativeEvents.onEvent('com.tacz.guns.api.event.common.GunShootEvent', event => {
  if (!atheriaArmeVerrouillee(event.getGunItemStack())) return
  event.setCanceled(true)
  var p = event.getShooter()
  if (p && p.isPlayer() && !p.level.isClientSide()) atheriaHudAction(p, 'tacz:modern_kinetic_gun', 'Cette arme n\'a pas encore de munitions sur l\'île. Elle arrivera plus tard dans la saison.', 'ambre')
})

// annonce radio de la vague, une fois, au premier passage après sa date
ServerEvents.tick(event => {
  var server = event.server
  if (server.tickCount % 1200 != 600) return
  var faites = String(server.persistentData.getString('atheria_armes_annoncees') || '')
  global.ATHERIA_ARMES_LOURDES.forEach((v, i) => {
    if (Date.now() < Date.parse(v[0]) || faites.indexOf('[' + i + ']') >= 0) return
    faites += '[' + i + ']'
    server.persistentData.putString('atheria_armes_annoncees', faites)
    atheriaHudRadioTous(server, 'contrebandiers', 'Nouvelle cargaison d\'armes sur l\'île : ' + v[2] + '. On en trouve maintenant dans le butin et à l\'établi d\'armurier.', 'Arrivage :')
    if (typeof atheriaJournal === 'function') atheriaJournal(server, 'tacz:modern_kinetic_gun', 'Arrivage d\'armes : ' + v[2] + '.', 'rouge')
  })
})
