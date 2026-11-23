// Atheria - retire du chat les annonces de mods sans intérêt pour le joueur.
var ATHERIA_CHAT_RETIRE = /\[First Aid\] Press|thank you for downloading Terralith|Distant Horizons: G1|This can cause FPS stuttering|recommended to use a concurrent|like ZGC|for a smoother experience|This warning can be disabled in the DH/

NativeEvents.onEvent('net.neoforged.neoforge.client.event.ClientChatReceivedEvent$System', event => {
  try {
    if (ATHERIA_CHAT_RETIRE.test('' + event.getMessage().getString())) event.setCanceled(true)
  } catch (e) {
    console.error('[Atheria chat] ' + e)
  }
})
