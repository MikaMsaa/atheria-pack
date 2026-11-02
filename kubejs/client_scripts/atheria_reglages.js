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
// Le corps complet du joueur passe à travers l'habitacle : la vue vanilla reprend le temps d'un trajet en véhicule.
var atheriaEnVehicule = false
var atheriaAideVehicule = false

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
  }

  var joueur = mc.player
  if (joueur == null) return
  var vehicule = joueur.getVehicle()
  var dansMts = vehicule != null && ('' + vehicule.getType()).indexOf('mts') >= 0
  if (dansMts == atheriaEnVehicule) return
  atheriaEnVehicule = dansMts
  try {
    var Core = Java.loadClass('dev.tr7zw.firstperson.FirstPersonModelCore')
    Core.instance.setEnabled(!dansMts)
  } catch (e) {
    console.error('[Atheria vehicule] ' + e)
  }
  if (dansMts && !atheriaAideVehicule) {
    atheriaAideVehicule = true
    joueur.displayClientMessage(Component.string('Véhicule : Z avancer, S freiner, Q et D tourner, N frein à main, G phares, C klaxon, X changer de vue, U tableau de bord').gray(), false)
  }
})
