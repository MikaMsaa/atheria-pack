// Atheria - une seule fois par installation : libère les touches prises par Essential (R, B, Z, C, I, G, H)
// et déplace Cinematic Zoom sur N, car C sert à ramper avec TaCZ. Ensuite, chaque joueur garde ses réglages.
var ATHERIA_TOUCHES = {
  'keybind.name.EMOTE_WHEEL': 'key.keyboard.unknown',
  'keybind.name.COSMETIC_STUDIO': 'key.keyboard.unknown',
  'keybind.name.CHAT_PEEK': 'key.keyboard.unknown',
  'keybind.name.ZOOM': 'key.keyboard.unknown',
  'keybind.name.SCREENSHOT_MANAGER': 'key.keyboard.unknown',
  'keybind.name.MENU_ACCESS': 'key.keyboard.unknown',
  'keybind.name.ESSENTIAL_FRIENDS': 'key.keyboard.unknown',
  'key.cinematiczoom.zoom': 'key.keyboard.n'
}
var ATHERIA_TOUCHES_FICHIER = 'kubejs/config/atheria_touches.json'
var atheriaTouchesFait = false

NativeEvents.onEvent('net.neoforged.neoforge.client.event.ClientTickEvent$Post', event => {
  if (atheriaTouchesFait) return
  atheriaTouchesFait = true
  try {
    if (JsonIO.read(ATHERIA_TOUCHES_FICHIER)) return
    var mc = Client
    var Input = Java.loadClass('com.mojang.blaze3d.platform.InputConstants')
    var KeyMapping = Java.loadClass('net.minecraft.client.KeyMapping')
    mc.options.keyMappings.forEach(k => {
      var cible = ATHERIA_TOUCHES[String(k.getName())]
      if (cible) mc.options.setKey(k, Input.getKey(cible))
    })
    KeyMapping.resetMapping()
    mc.options.save()
    JsonIO.write(ATHERIA_TOUCHES_FICHIER, { fait: true })
  } catch (e) {
    console.error('[Atheria touches] ' + e)
  }
})
