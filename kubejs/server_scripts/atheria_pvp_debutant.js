// Atheria - protection des nouveaux arrivants (Mika 27/11, lot gameplay 1) : pas de PvP pendant les 5 premières heures
// de jeu d'un joueur, ensuite chacun se débrouille. Le temps compté est le temps de jeu réel sur le serveur
// (statistique « temps de jeu »), pas le temps écoulé depuis la première connexion.
// La protection marche dans les deux sens : un nouveau ne peut pas être blessé par un joueur, et il ne peut blesser
// personne, pour qu'on ne s'en serve pas comme d'un bouclier. Balles, flèches et explosions allumées par un joueur comptent.
var PVP_DEBUT = { heures: 5, rappelMs: 4000, rappels: {} }

function atheriaTempsJeuTicks(p) {
  try {
    return p.stats.getPlayTime()
  } catch (e) {
    return 0
  }
}

// minutes de protection restantes (0 = plus protégé)
function atheriaPvpProtectionMin(p) {
  if (!p || !p.isPlayer()) return 0
  var restant = PVP_DEBUT.heures * 72000 - atheriaTempsJeuTicks(p)
  return restant > 0 ? Math.ceil(restant / 1200) : 0
}

function atheriaPvpDuree(min) {
  var h = Math.floor(min / 60), m = min % 60
  return h > 0 ? h + ' h ' + (m < 10 ? '0' : '') + m : m + ' min'
}

function atheriaPvpRappel(p, texte) {
  var maintenant = Date.now(), avant = PVP_DEBUT.rappels[p.username] || 0
  if (maintenant - avant < PVP_DEBUT.rappelMs) return
  PVP_DEBUT.rappels[p.username] = maintenant
  atheriaHudAction(p, 'minecraft:shield', texte, 'ambre')
}

// vrai si ce coup entre deux joueurs doit être annulé (l'un des deux est encore protégé)
function atheriaPvpBloque(victime, auteur) {
  if (victime == null || auteur == null || !victime.isPlayer() || !auteur.isPlayer() || auteur == victime) return false
  // soirée « convoi de la PAF » : qui porte une caisse renonce à sa protection tant qu'il la porte
  if (victime.tags.contains('atheria_caisse_portee')) return atheriaPvpProtectionMin(auteur) > 0
  return atheriaPvpProtectionMin(victime) > 0 || atheriaPvpProtectionMin(auteur) > 0
}

NativeEvents.onEvent('net.neoforged.neoforge.event.entity.living.LivingIncomingDamageEvent', event => {
  var victime = event.getEntity()
  if (!victime.isPlayer() || victime.level.isClientSide()) return
  var auteur = event.getSource().actual
  if (!atheriaPvpBloque(victime, auteur)) return
  event.setCanceled(true)
  var mv = atheriaPvpProtectionMin(victime), ma = atheriaPvpProtectionMin(auteur)
  if (ma > 0) atheriaPvpRappel(auteur, 'Tu es encore protégé pendant ' + atheriaPvpDuree(ma) + ' : pas de combat entre joueurs.')
  else atheriaPvpRappel(auteur, victime.username + ' vient d\'arriver : protégé encore ' + atheriaPvpDuree(mv) + '.')
})

// à la connexion : rappel du temps restant ; une fois la protection finie, une bannière l'annonce (une seule fois)
PlayerEvents.loggedIn(event => {
  var p = event.player
  var min = atheriaPvpProtectionMin(p)
  if (min > 0) event.server.scheduleInTicks(200, () => {
    atheriaHudAction(p, 'minecraft:shield', 'Nouvel arrivant : aucun joueur ne peut te blesser pendant encore ' + atheriaPvpDuree(min) + ' de jeu.', 'vert')
  })
})

ServerEvents.tick(event => {
  var server = event.server
  if (server.tickCount % 200) return
  server.players.forEach(p => {
    if (p.persistentData.getBoolean('atheria_pvp_libre')) return
    if (atheriaPvpProtectionMin(p) > 0) return
    p.persistentData.putBoolean('atheria_pvp_libre', true)
    atheriaHudBanniere(p, 'danger', 'Fin de la protection', 'Les autres survivants', 'Tes 5 premières heures sont passées. À partir de maintenant, les autres joueurs peuvent t\'attaquer, et toi aussi.')
  })
})
