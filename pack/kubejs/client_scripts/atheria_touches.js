// Atheria - une seule fois par installation : range les touches pour qu'aucune action importante n'en partage une autre.
// Gardées volontairement : R pour TaCZ et Underground Bunkers (recharger), clics pour tirer et viser,
// Espace et Ctrl pour l'hélicoptère, Maj, Alt et Ctrl comme modificateurs de Create et Jade.
// Ensuite, chaque joueur garde ses réglages.
var ATHERIA_LIBRE = 'key.keyboard.unknown'
var ATHERIA_TOUCHES = {
  // Essential
  'keybind.name.EMOTE_WHEEL': ATHERIA_LIBRE,
  'keybind.name.COSMETIC_STUDIO': ATHERIA_LIBRE,
  'keybind.name.CHAT_PEEK': ATHERIA_LIBRE,
  'keybind.name.ZOOM': ATHERIA_LIBRE,
  'keybind.name.SCREENSHOT_MANAGER': ATHERIA_LIBRE,
  'keybind.name.MENU_ACCESS': ATHERIA_LIBRE,
  'keybind.name.ESSENTIAL_FRIENDS': ATHERIA_LIBRE,
  // Armes : R recharger, G mode de tir, H inspecter, C ramper, O interagir, X mêlée, bouton 4 de la souris pour la lunette
  'key.tacz.melee.desc': 'key.keyboard.x',
  'key.tacz.zoom.desc': 'key.mouse.4',
  'key.cinematiczoom.zoom': 'key.keyboard.n',
  // Soins
  'keybinds.show_wounds': 'key.keyboard.j',
  'keybinds.give_up': 'key.keyboard.backspace',
  // Inventaire
  'supplementaries.keybind.quiver': 'key.keyboard.i',
  'key.curios.open.desc': 'key.keyboard.comma',
  'key.sophisticatedbackpacks.inventory_interaction': ATHERIA_LIBRE,
  // Voix : V pour parler
  'key.mute_microphone': 'key.keyboard.backslash',
  'key.disable_voice_chat': ATHERIA_LIBRE,
  'key.voice_chat_group': ATHERIA_LIBRE,
  'key.hide_icons': ATHERIA_LIBRE,
  // Carte
  'gui.xaero_enlarge_map': ATHERIA_LIBRE,
  'gui.xaero_minimap_settings': ATHERIA_LIBRE,
  'gui.xaero_open_settings': ATHERIA_LIBRE,
  'gui.xaero_new_waypoint': 'key.keyboard.period',
  // Interface et divers
  'iris.keybind.reload': ATHERIA_LIBRE,
  'iris.keybind.shaderPackSelection': 'key.keyboard.f9',
  'key.kubejs.kubedex': ATHERIA_LIBRE,
  'Open configuration screen': ATHERIA_LIBRE,
  'key.corpse.death_history': 'key.keyboard.f7',
  'key.emotecraft.fastchoose': 'key.keyboard.y',
  // Caméra
  'key.shouldersurfing.swap_shoulder': 'key.keyboard.f8',
  'key.shouldersurfing.free_look': ATHERIA_LIBRE,
  'key.shouldersurfing.adjust_camera_left': ATHERIA_LIBRE,
  'key.shouldersurfing.adjust_camera_right': ATHERIA_LIBRE,
  'key.shouldersurfing.adjust_camera_in': ATHERIA_LIBRE,
  'key.shouldersurfing.adjust_camera_out': ATHERIA_LIBRE,
  'key.shouldersurfing.adjust_camera_up': ATHERIA_LIBRE,
  'key.shouldersurfing.adjust_camera_down': ATHERIA_LIBRE,
  // Véhicules de Jurassic Reborn
  'key.jurassicreborn.switch_seat': 'key.keyboard.semicolon',
  'key.jurassicreborn.next_station': 'key.keyboard.keypad.7',
  'key.jurassicreborn.helicopter_autopilot': 'key.keyboard.keypad.subtract',
  'key.jurassicreborn.helicopter_lock': 'key.keyboard.keypad.6',
  'key.jurassicreborn.helicopter_rotate_left': 'key.keyboard.left',
  'key.jurassicreborn.helicopter_rotate_right': 'key.keyboard.right',
  'key.jurassicreborn.helicopter_zoom_out': ATHERIA_LIBRE,
  'key.jurassicreborn.helicopter_zoom_in': ATHERIA_LIBRE,
  'key.jurassicreborn.microraptor_dismount': 'key.keyboard.keypad.divide'
}
var ATHERIA_TOUCHES_FICHIER = 'kubejs/config/atheria_touches_v2.json'
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
