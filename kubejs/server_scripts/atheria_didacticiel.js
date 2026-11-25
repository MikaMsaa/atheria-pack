// Atheria - didacticiel, temps 1 : les mécaniques s'expliquent la première fois qu'on les rencontre (Mika 24/11).
// Remplace les cartes de la cinématique d'arrivée (soif, blessures, bruit, nuit, cendres) : une bannière à l'écran
// (mod atheria_hud, file d'attente, jamais deux à la fois), une seule fois par joueur, au bon moment :
//  soif      : à côté de l'eau ou dans l'eau, sinon après 8 minutes de jeu ;
//  blessures : premier dégât reçu ;
//  bruit     : premier coup de feu ;
//  air       : première entrée dans la zone contaminée ;
//  nuit      : première tombée de la nuit ;
//  cendres   : première tempête de cendres passée dehors.
// Rien ne s'affiche pendant l'arrivée protégée, la vidéo et la cinématique d'intro, ni dans les 20 s qui suivent.
var DIDA = {
  periode: 40,          // contrôle toutes les 2 s
  pauseSec: 20,         // écart minimum entre deux bannières du didacticiel
  soifSec: 480,
  textes: {
    soif: ['La soif', 'L\'eau des rivières rend malade : fais-la bouillir sur un feu avant de la boire.'],
    blessures: ['Les blessures', 'Chaque partie du corps se soigne à part. Bandages et attelles : clic droit, puis choisis la partie. J montre tes blessures.'],
    bruit: ['Le bruit', 'Un coup de feu s\'entend de loin et attire les infectés. Le couteau, lui, est silencieux.'],
    air: ['L\'air contaminé', 'Ici, l\'air empoisonne. Un masque avec un filtre te laisse respirer, le temps que le filtre tienne.'],
    nuit: ['La nuit', 'Les infectés sortent. Dormir ne fait plus passer la nuit, mais ça soigne : trouve un abri sûr.'],
    cendres: ['Les cendres', 'Le ciel vire au gris : l\'air du dehors devient toxique. Abrite-toi ou porte un masque avec un filtre.']
  },
  dernier: {}
}

function atheriaDidaPret(p) {
  if (typeof ARRIVEE !== 'undefined' && ARRIVEE.attente[p.username]) return false
  if (typeof INTRO_VIDEO !== 'undefined' && INTRO_VIDEO.attente[p.username]) return false
  var depuis = p.persistentData.getLong('atheria_dida_depuis')
  return depuis > 0 && Date.now() - depuis > DIDA.pauseSec * 1000
}

// Montre la bannière une seule fois ; renvoie false si le moment ne s'y prête pas (réessayé plus tard)
function atheriaDida(p, id) {
  var cle = 'atheria_dida_' + id
  if (p.persistentData.getBoolean(cle)) return true
  if (!atheriaDidaPret(p)) return false
  var d = DIDA.dernier[p.username]
  if (d && Date.now() - d < DIDA.pauseSec * 1000) return false
  DIDA.dernier[p.username] = Date.now()
  p.persistentData.putBoolean(cle, true)
  atheriaHudBanniere(p, 'info', 'Survivre', DIDA.textes[id][0], DIDA.textes[id][1])
  console.info('[Atheria didacticiel] ' + p.username + ' : ' + id)
  return true
}

// Événements ponctuels (dégât, tir) : notés tout de suite, montrés au prochain contrôle s'il est trop tôt
function atheriaDidaPlus(p, id) {
  if (p.persistentData.getBoolean('atheria_dida_' + id)) return
  p.persistentData.putBoolean('atheria_dida_attente_' + id, true)
}

function atheriaDidaEau(p) {
  if (p.isInWater()) return true
  var lv = p.level, x = Math.floor(p.x), y = Math.floor(p.y), z = Math.floor(p.z)
  for (var dx = -2; dx <= 2; dx++) for (var dz = -2; dz <= 2; dz++) for (var dy = -1; dy <= 0; dy++) {
    if (('' + lv.getBlock(x + dx, y + dy, z + dz).id) === 'minecraft:water') return true
  }
  return false
}

// La cinématique d'arrivée (ou une connexion normale) démarre le compteur
PlayerEvents.loggedIn(event => {
  var p = event.player
  if (!p.persistentData.getLong('atheria_dida_depuis')) p.persistentData.putLong('atheria_dida_depuis', Date.now() + 40000)
})

NativeEvents.onEvent('net.neoforged.neoforge.event.entity.living.LivingIncomingDamageEvent', event => {
  try {
    var v = event.getEntity()
    if (v.level.isClientSide() || !v.isPlayer() || event.getAmount() <= 0) return
    atheriaDidaPlus(v, 'blessures')
  } catch (e) {
    console.error('[Atheria didacticiel] ' + e)
  }
})

NativeEvents.onEvent('com.tacz.guns.api.event.common.GunFireEvent', event => {
  try {
    var t = event.getShooter()
    if (t == null || t.level.isClientSide() || !t.isPlayer()) return
    atheriaDidaPlus(t, 'bruit')
  } catch (e) {
    console.error('[Atheria didacticiel] ' + e)
  }
})

ServerEvents.tick(event => {
  var server = event.server
  if (server.tickCount % DIDA.periode) return
  var tempete = server.persistentData.getLong('atheria_tempete_fin') > Date.now()
  server.players.forEach(p => {
    try {
      if (p.isSpectator() || p.isCreative()) return
      var data = p.persistentData
      if (data.getBoolean('atheria_dida_fini')) return
      if (!atheriaDidaPret(p)) return
      var sec = data.getInt('atheria_dida_sec') + DIDA.periode / 20
      data.putInt('atheria_dida_sec', sec)
      ;['blessures', 'bruit'].forEach(id => {
        if (data.getBoolean('atheria_dida_attente_' + id) && atheriaDida(p, id)) data.remove('atheria_dida_attente_' + id)
      })
      if (!data.getBoolean('atheria_dida_soif') && (sec >= DIDA.soifSec || atheriaDidaEau(p))) atheriaDida(p, 'soif')
      if (!data.getBoolean('atheria_dida_air') && airBiome(p)) atheriaDida(p, 'air')
      var heure = ('' + p.level.dimension) === 'minecraft:overworld' ? p.level.getDayTime() % 24000 : 0
      if (!data.getBoolean('atheria_dida_nuit') && heure >= 12600 && heure < 22000) atheriaDida(p, 'nuit')
      if (!data.getBoolean('atheria_dida_cendres') && tempete && atheriaTempeteDehors(p)) atheriaDida(p, 'cendres')
      var tous = true
      Object.keys(DIDA.textes).forEach(id => { if (!data.getBoolean('atheria_dida_' + id)) tous = false })
      if (tous) data.putBoolean('atheria_dida_fini', true)
    } catch (e) {
      console.error('[Atheria didacticiel] ' + e)
    }
  })
})
