// Atheria - réglages de la 1.0.6, appliqués une seule fois par installation (sons équilibrés, shader Unbound, touches).
// Ensuite, chaque joueur garde ses réglages. Les nouvelles installations ont déjà ces sons dans options.txt.
var ATHERIA_REGLAGES_FICHIER = 'kubejs/config/atheria_reglages_v1.json'
var ATHERIA_SONS = { MUSIC: 0.4, RECORDS: 0.7, WEATHER: 0.65, BLOCKS: 0.7, HOSTILE: 0.9, NEUTRAL: 0.7, PLAYERS: 0.85, AMBIENT: 0.7 }
var ATHERIA_TOUCHES_106 = {
  'gui.xaero_instant_waypoint': 'key.keyboard.unknown',
  // Roulade et chute amortie sur Verr. Maj, le reste du parkour sur Alt : R et C restent à TaCZ, le clic droit à la visée
  'keybinds.combat_roll.roll': 'key.keyboard.caps.lock',
  'key.parcool.breakfall': 'key.keyboard.caps.lock',
  'key.parcool.dodge': 'key.keyboard.unknown',
  'key.parcool.horizontal_wall_run': 'key.keyboard.left.alt',
  'key.parcool.hang': 'key.keyboard.left.alt',
  'key.parcool.slide_down': 'key.keyboard.left.alt',
  'key.parcool.crawl': 'key.keyboard.unknown',
  'key.parcool.hide_in_block': 'key.keyboard.unknown',
  'key.parcool.enable': 'key.keyboard.unknown',
  'key.parcool.open_setting_skilltree': 'key.keyboard.f10'
}
var atheriaReglagesFait = false

// FA Player arrive par mise à jour : il faut l'activer une fois chez les joueurs déjà installés, juste au-dessus de Fresh Animations.
var ATHERIA_PACKS_FICHIER = 'kubejs/config/atheria_reglages_v2.json'
var ATHERIA_FA_PLAYER = 'file/FA+Player-v1.1.zip'
var atheriaPacksFait = false

function atheriaActiverFaPlayer(mc) {
  if (JsonIO.read(ATHERIA_PACKS_FICHIER)) return
  var packs = mc.options.resourcePacks
  if (!packs.contains(ATHERIA_FA_PLAYER)) {
    var base = packs.indexOf('file/FreshAnimations_v1.11.1_1.20+.zip')
    if (base >= 0) packs.add(base + 1, ATHERIA_FA_PLAYER)
    else packs.add(ATHERIA_FA_PLAYER)
    mc.options.save()
    mc.getResourcePackRepository().reload()
    mc.options.loadSelectedResourcePacks(mc.getResourcePackRepository())
    mc.reloadResourcePacks()
  }
  JsonIO.write(ATHERIA_PACKS_FICHIER, { fait: true })
}
// Plan de touches validé avec Mika : les gestes d'urgence sous la main gauche, le reste plus loin. Une fois par installation,
// après les anciens réglages. M se cherche par son nom affiché : sa position physique dépend du clavier (AZERTY, QWERTY).
var ATHERIA_TOUCHES_V3_FICHIER = 'kubejs/config/atheria_touches_v3.json'
var ATHERIA_TOUCHES_V3 = {
  // Parkour et urgence
  'keybinds.combat_roll.roll': 'key.keyboard.f',
  'key.parcool.breakfall': 'key.keyboard.f',
  'key.parcool.fast_move': 'key.keyboard.left.control',
  'key.parcool.crawl': 'key.keyboard.left.alt',
  'key.parcool.hang': 'key.keyboard.v',
  'key.parcool.slide_down': 'key.keyboard.v',
  'key.parcool.horizontal_wall_run': 'key.keyboard.v',
  'key.parcool.dodge': 'key.keyboard.unknown',
  'key.parcool.hide_in_block': 'key.keyboard.unknown',
  'key.parcool.enable': 'key.keyboard.unknown',
  'key.shouldersurfing.adjust_camera_in': 'key.keyboard.unknown',
  'key.shouldersurfing.adjust_camera_out': 'key.keyboard.unknown',
  'key.shouldersurfing.adjust_camera_left': 'key.keyboard.unknown',
  'key.shouldersurfing.adjust_camera_right': 'key.keyboard.unknown',
  'key.shouldersurfing.free_look': 'key.keyboard.unknown',
  'key.swapOffhand': 'key.keyboard.n',
  // Armes : mêlée et interaction sous la main, l'inspection peut attendre
  'key.tacz.reload.desc': 'key.keyboard.r',
  'key.tacz.fire_select.desc': 'key.keyboard.g',
  'key.tacz.melee.desc': 'key.keyboard.x',
  'key.tacz.interact.desc': 'key.keyboard.h',
  'key.tacz.inspect.desc': 'key.keyboard.o',
  'key.tacz.zoom.desc': 'key.keyboard.period',
  'key.tacz.crawl.desc': 'key.keyboard.unknown',
  'key.tacz_tactical_breaching.toggle_nightstick_flashlight': 'key.keyboard.i',
  'key.cinematiczoom.zoom': 'key.keyboard.c',
  'keybinds.show_wounds': 'key.keyboard.j',
  'keybinds.give_up': 'key.keyboard.g',
  // Vocal et communication, plus loin
  'key.push_to_talk': 'key.keyboard.y',
  'key.voice_chat': 'key.keyboard.f12',
  'key.voice_chat_group': 'key.keyboard.unknown',
  'key.disable_voice_chat': 'key.keyboard.unknown',
  'key.hide_icons': 'key.keyboard.unknown',
  'key.pingwheel.ping_location': 'key.keyboard.grave.accent',
  'key.emotecraft.fastchoose': 'key.keyboard.k',
  // Le reste libère des touches utiles
  'key.sophisticatedbackpacks.open_backpack': 'key.keyboard.b',
  'gui.xaero_new_waypoint': 'key.keyboard.minus',
  'gui.xaero_waypoints_key': 'key.keyboard.unknown',
  'gui.xaero_minimap_settings': 'key.keyboard.unknown',
  'gui.xaero_enlarge_map': 'key.keyboard.unknown',
  'key.corpse.death_history': 'key.keyboard.unknown',
  'key.curios.open.desc': 'key.keyboard.unknown',
  'key.kubejs.kubedex': 'key.keyboard.unknown',
  'key.sophisticatedbackpacks.inventory_interaction': 'key.keyboard.unknown',
  'supplementaries.keybind.quiver': 'key.keyboard.unknown',
  'Open configuration screen': 'key.keyboard.f9',
  'iris.keybind.reload': 'key.keyboard.unknown',
  'iris.keybind.shaderPackSelection': 'key.keyboard.unknown',
  'iris.keybind.toggleShaders': 'key.keyboard.unknown',
  'key.shouldersurfing.swap_shoulder': 'key.keyboard.u',
  'key.jurassicreborn.switch_seat': 'key.keyboard.keypad.multiply',
  'key.jurassicreborn.next_station': 'key.keyboard.unknown'
}
var atheriaTouchesV3Attente = 40

function atheriaToucheAffichee(lettre) {
  var Keysym = Java.loadClass('com.mojang.blaze3d.platform.InputConstants$Type').KEYSYM
  for (var code = 32; code <= 96; code++) {
    var cle = Keysym.getOrCreate(code)
    if (('' + cle.getDisplayName().getString()).toUpperCase() == lettre) return cle
  }
  return null
}

function atheriaAppliquerTouchesV3(mc) {
  if (JsonIO.read(ATHERIA_TOUCHES_V3_FICHIER)) return
  var Input = Java.loadClass('com.mojang.blaze3d.platform.InputConstants')
  var carte = atheriaToucheAffichee('M') || Input.getKey('key.keyboard.m')
  mc.options.keyMappings.forEach(k => {
    var nom = String(k.getName())
    if (nom == 'gui.xaero_open_map') mc.options.setKey(k, carte)
    else if (ATHERIA_TOUCHES_V3[nom]) mc.options.setKey(k, Input.getKey(ATHERIA_TOUCHES_V3[nom]))
  })
  Java.loadClass('net.minecraft.client.KeyMapping').resetMapping()
  mc.options.save()
  JsonIO.write(ATHERIA_TOUCHES_V3_FICHIER, { fait: true })
}

// Vue épaule : Essential affiche le pseudo du joueur au-dessus de sa propre tête. Coupé une fois chez les joueurs déjà installés.
var ATHERIA_PSEUDO_FICHIER = 'kubejs/config/atheria_reglages_v3.json'
function atheriaCacherPseudoPerso() {
  try {
    if (JsonIO.read(ATHERIA_PSEUDO_FICHIER)) return
    Java.loadClass('gg.essential.config.EssentialConfig').INSTANCE.getShowOwnNametag().set(false)
    JsonIO.write(ATHERIA_PSEUDO_FICHIER, { fait: true })
  } catch (e) {
    console.error('[Atheria pseudo] ' + e)
  }
}
// Le corps complet du joueur passe à travers l'habitacle : la vue vanilla reprend le temps d'un trajet en véhicule.
var atheriaEnVehicule = false
var atheriaAideVehicule = {}
var atheriaRappelAttendu = false
var ATHERIA_AIDES_VEHICULE = {
  voiture: ['Véhicule : Z avancer, S freiner, Q et D tourner, N frein à main, G phares, H klaxon, X changer de vue, U tableau de bord'],
  avion: [
    'Avion : flèches haut et bas gaz, S cabrer, Z piquer, Q et D incliner, flèches gauche et droite lacet, H et O volets, G frein, N frein à main, X vue, U tableau de bord',
    'Décollage : gaz à fond avec la flèche du haut, roule tout droit, puis tire doucement sur S. Détails : F4.'
  ],
  helico: [
    'Hélicoptère : flèche haut monter, flèche bas descendre, Z et S avancer ou reculer, Q et D glisser, flèches gauche et droite tourner, X vue, U tableau de bord',
    'Attends que le rotor tourne, puis maintiens I. Lâche les commandes : il se remet à plat. Détails : F4.'
  ]
}

NativeEvents.onEvent('net.neoforged.neoforge.client.event.ClientTickEvent$Post', event => {
  var mc = Client
  if (!atheriaReglagesFait) {
    atheriaReglagesFait = true
    try {
      if (!JsonIO.read(ATHERIA_REGLAGES_FICHIER)) {
        var SoundSource = Java.loadClass('net.minecraft.sounds.SoundSource')
        Object.keys(ATHERIA_SONS).forEach(nom => mc.options.getSoundSourceOptionInstance(SoundSource[nom]).set(ATHERIA_SONS[nom]))
        var Input = Java.loadClass('com.mojang.blaze3d.platform.InputConstants')
        mc.options.keyMappings.forEach(k => {
          var cible = ATHERIA_TOUCHES_106[String(k.getName())]
          if (cible) mc.options.setKey(k, Input.getKey(cible))
        })
        Java.loadClass('net.minecraft.client.KeyMapping').resetMapping()
        mc.options.save()
        // Un joueur qui utilisait Complementary Reimagined passe à Unbound, dont les réglages sont fournis
        var Iris = Java.loadClass('net.irisshaders.iris.Iris')
        var iris = Iris.getIrisConfig()
        if (('' + iris.getShaderPackName().orElse('')).indexOf('ComplementaryReimagined') >= 0) {
          iris.setShaderPackName('ComplementaryUnbound_r5.9.3.zip')
          iris.save()
        }
        JsonIO.write(ATHERIA_REGLAGES_FICHIER, { fait: true })
      }
    } catch (e) {
      console.error('[Atheria reglages] ' + e)
    }
  }

  if (!atheriaPacksFait) {
    atheriaPacksFait = true
    try {
      atheriaActiverFaPlayer(mc)
    } catch (e) {
      console.error('[Atheria packs] ' + e)
    }
    atheriaCacherPseudoPerso()
  }

  if (atheriaTouchesV3Attente > 0 && --atheriaTouchesV3Attente == 0) {
    try {
      atheriaAppliquerTouchesV3(mc)
    } catch (e) {
      console.error('[Atheria touches] ' + e)
    }
  }

  var joueur = mc.player
  if (joueur == null) return
  var vehicule = joueur.getVehicle()
  var dansMts = vehicule != null && ('' + vehicule.getType()).indexOf('mts') >= 0
  if (dansMts != atheriaEnVehicule) {
    atheriaEnVehicule = dansMts
    atheriaRappelAttendu = dansMts
    try {
      var Core = Java.loadClass('dev.tr7zw.firstperson.FirstPersonModelCore')
      Core.instance.setEnabled(!dansMts)
    } catch (e) {
      console.error('[Atheria vehicule] ' + e)
    }
  }
  if (atheriaRappelAttendu) {
    var genre = atheriaGenreVehicule(vehicule)
    if (genre == null) return
    atheriaRappelAttendu = false
    if (atheriaAideVehicule[genre]) return
    atheriaAideVehicule[genre] = true
    ATHERIA_AIDES_VEHICULE[genre].forEach(ligne => joueur.displayClientMessage(Component.string(ligne).gray(), false))
  }
})

// Le rappel dépend de l'engin : un hélicoptère a un rotor ou un moteur d'hélicoptère, un avion est un aéronef sans.
// Le siège ne connaît son véhicule que quelques ticks après la montée : null veut dire « pas encore ».
function atheriaGenreVehicule(siege) {
  try {
    var engin = siege.entity == null ? null : siege.entity.vehicleOn
    if (engin == null) return null
    var def = engin.definition
    if (!def.motorized.isAircraft) return 'voiture'
    var rotor = false
    def.parts.forEach(p => { if (p.types != null && /rotor|helicopter/.test('' + p.types)) rotor = true })
    return rotor ? 'helico' : 'avion'
  } catch (e) {
    console.error('[Atheria vehicule] ' + e)
    return 'voiture'
  }
}
