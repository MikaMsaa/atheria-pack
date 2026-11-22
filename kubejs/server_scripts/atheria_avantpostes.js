// Atheria - avant-postes tenus par les alliances (Mika 22/11, idée validée).
// Cinq lieux de l'île se disputent entre alliances (équipes FTB Teams ; un joueur sans équipe compte comme sa propre alliance) :
//  - rester 3 minutes dans la zone (rayon 24 blocs) sans alliance adverse présente = prise de l'avant-poste ;
//    une barre en haut de l'écran montre la progression ; si une autre alliance entre, la prise est bloquée (« contesté ») ;
//  - l'alliance qui tient un avant-poste touche des bons CAF : 2 bons par heure et par membre connecté, pour chaque avant-poste ;
//  - un avant-poste dont aucun membre ne s'est approché depuis 24 h (temps réel) redevient libre : il faut le tenir, pas seulement le prendre ;
//  - au plus 2 avant-postes par alliance, pour que les petites alliances aient leur chance.
// /avantpostes liste les lieux et qui les tient. Rien n'est construit sur la carte : la prise se voit dans le chat et la barre.
var AP = {
  rayon: 24,
  dureePrise: 180,          // secondes de présence
  gainHeure: 2,
  abandonHeures: 24,
  maxParAlliance: 2,
  lieux: [
    // [clé, nom, x, z]
    ['total', 'la station Total de la RN1', 2791, -553],
    ['kaweni', 'Kaweni', 1503, -2369],
    ['dembeni', 'Dembeni', 2047, 255],
    ['chirongui', 'Chirongui', 799, 3775],
    ['sada', 'Sada', -3937, 511]
  ]
}

function atheriaAlliance(p) {
  // { id, nom } de l'équipe FTB du joueur, sinon le joueur lui-même
  try {
    var api = Java.loadClass('dev.ftb.mods.ftbteams.api.FTBTeamsAPI').api()
    if (api.isManagerLoaded()) {
      var t = api.getManager().getTeamForPlayerID(p.uuid)
      if (t.isPresent()) {
        var team = t.get()
        if (!team.isPlayerTeam()) return { id: String(team.getId()), nom: String(team.getName().getString()) }
      }
    }
  } catch (e) { }
  return { id: String(p.uuid), nom: String(p.username) }
}

function atheriaApEtat(server) {
  var brut = String(server.persistentData.getString('atheria_avantpostes') || '')
  var e = null
  try { e = brut ? JSON.parse(brut) : null } catch (x) { e = null }
  if (!e) e = {}
  AP.lieux.forEach(l => { if (!e[l[0]]) e[l[0]] = { tenu: null, nom: null, vu: 0, prise: null, avance: 0 } })
  return e
}

function atheriaApEcrire(server, e) {
  server.persistentData.putString('atheria_avantpostes', JSON.stringify(e))
}

function atheriaApBarre(server, l, texte, couleur, valeur) {
  var id = 'atheria:ap_' + l[0]
  server.runCommandSilent('bossbar add ' + id + ' ""')
  server.runCommandSilent('bossbar set ' + id + ' max ' + AP.dureePrise)
  server.runCommandSilent('bossbar set ' + id + ' name ' + JSON.stringify({ text: texte }))
  server.runCommandSilent('bossbar set ' + id + ' color ' + couleur)
  server.runCommandSilent('bossbar set ' + id + ' value ' + Math.max(0, Math.min(AP.dureePrise, Math.round(valeur))))
  var r = AP.rayon + 16
  server.runCommandSilent('bossbar set ' + id + ' players @a[x=' + (l[2] - r) + ',y=-64,z=' + (l[3] - r) + ',dx=' + (2 * r) + ',dy=400,dz=' + (2 * r) + ']')
}

function atheriaApTenus(e, allianceId) {
  return AP.lieux.filter(l => e[l[0]].tenu == allianceId).length
}

ServerEvents.tick(event => {
  var server = event.server
  if (server.tickCount % 20 != 11) return
  var e = atheriaApEtat(server), change = false, now = Date.now()
  var joueurs = server.players.filter(p => !p.isSpectator() && !p.isCreative() && p.isAlive() && String(p.level.dimension) == 'minecraft:overworld')
  AP.lieux.forEach(l => {
    var s = e[l[0]]
    var presents = {}, n = 0
    joueurs.forEach(p => {
      var dx = p.x - l[2], dz = p.z - l[3]
      if (dx * dx + dz * dz > AP.rayon * AP.rayon) return
      var a = atheriaAlliance(p)
      if (!presents[a.id]) { presents[a.id] = a; n++ }
    })
    var ids = Object.keys(presents)
    if (s.tenu && presents[s.tenu]) { s.vu = now; change = true }
    // abandon : personne de l'alliance n'est passé depuis 24 h
    if (s.tenu && now - s.vu > AP.abandonHeures * 3600 * 1000) {
      server.tell(Text.gray('[Radio] Plus personne ne tient ' + l[1] + '. L\'avant-poste est libre.'))
      s.tenu = null; s.nom = null; change = true
    }
    if (n == 0) {
      server.runCommandSilent('bossbar set atheria:ap_' + l[0] + ' players')
      if (s.avance > 0) { s.avance = Math.max(0, s.avance - 2); change = true }
      if (s.avance == 0 && s.prise) { s.prise = null; change = true }
      return
    }
    if (n > 1) {
      atheriaApBarre(server, l, 'Avant-poste : ' + l[1] + ' — contesté', 'red', s.avance)
      return
    }
    var a = presents[ids[0]]
    if (a.id == s.tenu) {
      if (s.avance > 0) { s.avance = 0; s.prise = null; change = true }
      atheriaApBarre(server, l, 'Avant-poste : ' + l[1] + ' — tenu par ' + s.nom, 'green', AP.dureePrise)
      return
    }
    if (atheriaApTenus(e, a.id) >= AP.maxParAlliance) {
      atheriaApBarre(server, l, 'Avant-poste : ' + l[1] + ' — ton alliance en tient déjà ' + AP.maxParAlliance, 'white', 0)
      return
    }
    if (s.prise != a.id) { s.prise = a.id; s.avance = 0 }
    s.avance += 1
    change = true
    atheriaApBarre(server, l, 'Prise de l\'avant-poste : ' + l[1] + (s.tenu ? ' (tenu par ' + s.nom + ')' : ''), 'yellow', s.avance)
    if (s.avance >= AP.dureePrise) {
      var ancien = s.nom
      s.tenu = a.id; s.nom = a.nom; s.vu = now; s.prise = null; s.avance = 0
      joueurs.forEach(q => { var dx = q.x - l[2], dz = q.z - l[3]; if (dx * dx + dz * dz <= AP.rayon * AP.rayon) routeXp(q, 60) })
      server.tell(Text.gold('[Radio] ').append(Text.yellow(a.nom + ' tient maintenant ' + l[1] + (ancien ? ', pris à ' + ancien : '') + '.')))
      server.runCommandSilent('playsound minecraft:event.raid.horn master @a[x=' + l[2] + ',y=64,z=' + l[3] + ',distance=..200] ' + l[2] + ' 80 ' + l[3] + ' 4 1.2')
      atheriaApBarre(server, l, 'Avant-poste : ' + l[1] + ' — tenu par ' + a.nom, 'green', AP.dureePrise)
    }
  })
  if (change) atheriaApEcrire(server, e)

  // revenus : une fois par heure (temps réel) pour chaque avant-poste tenu
  if (server.tickCount % 1200 != 11) return
  var dernier = server.persistentData.getLong('atheria_ap_paye')
  if (dernier && now - dernier < 3600 * 1000) return
  server.persistentData.putLong('atheria_ap_paye', now)
  server.players.forEach(p => {
    var a = atheriaAlliance(p), k = atheriaApTenus(e, a.id)
    if (k <= 0) return
    var gain = k * AP.gainHeure
    server.runCommandSilent('give ' + p.username + ' atheria:bon_caf ' + gain)
    p.tell(Text.gold('[Radio] ').append(Text.gray('Les avant-postes de ton alliance rapportent ' + gain + ' bons CAF.')))
  })
})

ServerEvents.commandRegistry(event => {
  event.register(event.commands.literal('avantpostes').executes(ctx => {
    var p = ctx.source.player
    if (!p) return 0
    var e = atheriaApEtat(p.server), a = atheriaAlliance(p)
    p.tell(Text.gold('— Avant-postes de l\'île —'))
    AP.lieux.forEach(l => {
      var s = e[l[0]]
      var ligne = l[1] + ' (' + l[2] + ', ' + l[3] + ') : ' + (s.tenu ? 'tenu par ' + s.nom : 'libre')
      p.tell(s.tenu == a.id ? Text.green(ligne) : (s.tenu ? Text.red(ligne) : Text.gray(ligne)))
    })
    p.tell(Text.darkGray('3 minutes sur place sans adversaire pour le prendre. ' + AP.gainHeure + ' bons par heure et par membre connecté. Libre s\'il est laissé 24 h sans visite.'))
    return 1
  }))
})
