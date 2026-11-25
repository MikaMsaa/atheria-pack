// Atheria - Stimpack de Create Fallout (retour des testeurs du 25/11 : « en utilisant le Stimpack, le joueur se fait
// déconnecter »). Cause : StimpackItem.finishUsingItem (ligne 89) appelle hurtAndBreak sans fonction de casse ; quand la
// dernière dose casse l'objet, NullPointerException et le joueur est expulsé.
// Correctif : juste avant la fin de l'utilisation, on l'interrompt et on applique nous-mêmes les mêmes effets
// (piqûre 3 PV « needled », Régénération VI 4 s, bruit), puis on use l'objet d'une dose ou on le retire s'il casse.
NativeEvents.onEvent('net.neoforged.neoforge.event.entity.living.LivingEntityUseItemEvent$Tick', event => {
  var ent = event.getEntity()
  if (event.getDuration() > 1 || ent.level.isClientSide()) return
  if (('' + event.getItem().id) !== 'create_fallout:stimpack') return
  event.setCanceled(true)
  var stack = ent.getItemInHand(ent.getUsedItemHand())
  ent.stopUsingItem()
  var server = ent.level.server, u = '' + ent.getStringUUID()
  server.runCommandSilent('damage ' + u + ' 3 create_fallout:needled')
  server.runCommandSilent('effect give ' + u + ' minecraft:regeneration 4 5')
  server.runCommandSilent('execute at ' + u + ' run playsound minecraft:entity.item.break ambient @a ~ ~ ~ 1 1')
  if (('' + stack.id) !== 'create_fallout:stimpack') return
  if (ent.isPlayer() && ent.isCreative()) return
  if (stack.isDamageableItem()) {
    stack.setDamageValue(stack.getDamageValue() + 1)
    if (stack.getDamageValue() >= stack.getMaxDamage()) stack.shrink(1)
  } else stack.shrink(1)
})
