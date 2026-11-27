// Atheria - soirées live du week-end (Mika 27/11 : « chaque samedi et dimanche à 21 h, heure de Paris, dès le dimanche 20/12 »).
// Cadre commun à toutes les soirées. Chaque soirée est un fichier atheria_live_<nom>.js qui appelle atheriaLiveDeclarer.
// Une seule commande (opérateurs) : /live <nom> start [minutes] lance l'annonce radio (30 min par défaut, 0 = tout de suite),
// puis la soirée se déroule seule : début, vagues, score, fin et récompenses.
//   /live stop    arrête la soirée sans récompense (en cas de souci)
//   /live fin     termine la soirée maintenant, avec les récompenses
//   /live etat    où en est la soirée
// Récompenses (doc « Soirées live d'Atheria ») :
//  - présents : un insigne de la soirée (à collectionner), des bons CAF et l'objet de la soirée, jamais une arme de haut niveau ;
//  - les trois premiers : des points au tableau d'honneur (classement « Survivant de la semaine ») ; le premier : un titre ;
//  - absents : à leur prochaine connexion dans la semaine, une petite part en bons, et la soirée racontée dans « Pendant ton absence ».
// Les récompenses d'un joueur qui s'est déconnecté entre-temps l'attendent à sa connexion.
var LIVE = {
  annonceMin: 30,
  presence: 0.33,          // part de la soirée à passer sur place (ou inscrit) pour compter comme présent
  bonsPresence: 10,
  bonsConsolation: 4,
  points: [300, 200, 100], // points d'honneur des trois premiers
  defs: {},
  faux: []                 // faux joueurs des essais (jamais en jeu normal)
}

function atheriaLiveDeclarer(nom, def) {
  LIVE.defs[nom] = def
}

function atheriaLiveEtat(server) {
  var brut = String(server.persistentData.getString('atheria_live') || '')
  try { return brut ? JSON.parse(brut) : null } catch (e) { return null }
}

function atheriaLiveEcrire(server, e) {
  if (e) server.persistentData.putString('atheria_live', JSON.stringify(e))
  else server.persistentData.remove('atheria_live')
}

function atheriaLiveMemoire(server) {
  var brut = String(server.persistentData.getString('atheria_live_memoire') || '')
  var m = null
  try { m = brut ? JSON.parse(brut) : null } catch (e) { m = null }
  if (!m) m = { dus: {}, soirees: [] }
  return m
}

function atheriaLiveMemoireEcrire(server, m) {
  m.soirees = m.soirees.filter(s => Date.now() - s.fin < 7 * 86400000).slice(-8)
  server.persistentData.putString('atheria_live_memoire', JSON.stringify(m))
}

// tous les joueurs de la surface (et les faux joueurs d'un essai)
function atheriaLiveJoueurs(server) {
  var l = []
  server.players.forEach(p => { if (!p.isSpectator() && ('' + p.level.dimension) === 'minecraft:overworld') l.push(p) })
  LIVE.faux.forEach(f => l.push(f))
  return l
}

function atheriaLiveFaux(p) {
  return LIVE.faux.indexOf(p) >= 0
}

function atheriaLiveTrouver(server, nom) {
  var r = null
  atheriaLiveJoueurs(server).forEach(p => { if (p.username == nom) r = p })
  return r
}

// ce que chaque soirée reçoit pour travailler
function atheriaLiveCtx(server, e) {
  var def = LIVE.defs[e.nom]
  var ctx = {
    server: server, etat: e, d: e.data, def: def,
    secondes: Math.floor((Date.now() - e.t0) / 1000),
    joueurs: () => atheriaLiveJoueurs(server),
    trouver: nom => atheriaLiveTrouver(server, nom),
    score: (p, n) => { var k = typeof p === 'string' ? p : p.username; e.scores[k] = (e.scores[k] || 0) + n },
    fixerScore: (p, n) => { var k = typeof p === 'string' ? p : p.username; e.scores[k] = n },
    inscrire: p => { if (e.inscrits.indexOf(p.username) < 0) e.inscrits.push(p.username) },
    inscrit: p => e.inscrits.indexOf(p.username) >= 0,
    radio: (texte, accent) => atheriaHudRadioTous(server, def.radio || 'semaine', texte, accent),
    banniere: (genre, sur, titre, texte, qui) => (qui || atheriaLiveJoueurs(server)).forEach(p => { if (atheriaLiveFaux(p)) return; atheriaHudBanniere(p, genre, sur, titre, texte) }),
    action: (p, icone, texte, couleur, progres) => { if (atheriaLiveFaux(p)) return; atheriaHudAction(p, icone, texte, couleur, progres) },
    terminer: () => { e.finDemandee = true }
  }
  return ctx
}

function atheriaLiveLancer(server, nom, minutes) {
  var def = LIVE.defs[nom]
  if (!def) return 'Soirée inconnue : ' + nom + '. Soirées : ' + Object.keys(LIVE.defs).join(', ')
  if (atheriaLiveEtat(server)) return 'Une soirée est déjà en cours (/live etat, /live stop).'
  var m = minutes == null ? LIVE.annonceMin : minutes
  var e = { nom: nom, phase: 'annonce', t0: Date.now() + m * 60000, scores: {}, presence: {}, inscrits: [], data: {}, dits: {} }
  atheriaLiveEcrire(server, e)
  if (def.preparer) def.preparer(atheriaLiveCtx(server, e))
  atheriaLiveEcrire(server, e)
  if (m > 0) atheriaHudRadioTous(server, def.radio || 'semaine', def.annonce + ' Dans ' + m + ' minutes.', def.titre + ' :')
  return def.titre + ' : ' + (m > 0 ? 'annonce faite, début dans ' + m + ' min.' : 'début maintenant.')
}

// une récompense à donner (tout de suite si le joueur est là, sinon à sa connexion)
function atheriaLiveDonner(server, m, nom, bons, objets, tags, texte) {
  if (!m.dus[nom]) m.dus[nom] = { bons: 0, objets: [], tags: [], textes: [] }
  var d = m.dus[nom]
  d.bons += bons || 0
  ;(objets || []).forEach(o => d.objets.push(o))
  ;(tags || []).forEach(t => d.tags.push(t))
  if (texte) d.textes.push(texte)
}

function atheriaLivePayer(p, m) {
  var d = m.dus[p.username]
  if (!d) return false
  if (d.bons > 0) p.server.runCommandSilent('give ' + p.username + ' atheria:bon_caf ' + d.bons)
  d.objets.forEach(o => p.server.runCommandSilent('give ' + p.username + ' ' + o[0] + ' ' + o[1]))
  d.tags.forEach(t => p.addTag(t))
  atheriaHudBanniere(p, 'quete', 'Soirée live', d.textes.length ? d.textes[0] : 'Ta récompense', (d.bons > 0 ? d.bons + ' bons CAF' : '') + (d.objets.length ? (d.bons > 0 ? ', ' : '') + 'un insigne et l\'objet de la soirée' : '') + '.')
  delete m.dus[p.username]
  return true
}

function atheriaLiveInsigne(def) {
  return 'atheria:insigne_soiree[minecraft:custom_name=\'{"text":"Insigne : ' + def.titre.replace(/'/g, '\\\'') + '","italic":false,"color":"gold"}\']'
}

function atheriaLiveTerminer(server, e, recompenser) {
  var def = LIVE.defs[e.nom], ctx = atheriaLiveCtx(server, e)
  try { if (def.fin) def.fin(ctx) } catch (x) { console.error('[Atheria live] fin ' + e.nom + ' : ' + x) }
  atheriaLiveEcrire(server, null)
  if (!recompenser) {
    atheriaHudRadioTous(server, def.radio || 'semaine', 'La soirée est annulée. On se retrouve une autre fois.', def.titre + ' :')
    return
  }
  var duree = Math.max(60, (Date.now() - e.t0) / 1000)
  var classement = Object.keys(e.scores).map(k => [k, e.scores[k]]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1])
  var presents = {}
  Object.keys(e.presence).forEach(k => { if (e.presence[k] >= duree * LIVE.presence) presents[k] = true })
  e.inscrits.forEach(k => presents[k] = true)
  classement.forEach(x => presents[x[0]] = true)
  var m = atheriaLiveMemoire(server)
  Object.keys(presents).forEach(k => {
    var objets = [[atheriaLiveInsigne(def), 1]].concat(def.objets || [])
    atheriaLiveDonner(server, m, k, LIVE.bonsPresence, objets, [], def.titre + ' : merci d\'être venu')
  })
  classement.slice(0, 3).forEach((x, i) => {
    var e2 = atheriaHonneurTourner(server, atheriaHonneurEtat(server))
    if (!e2.scores.experience) e2.scores.experience = {}
    e2.scores.experience[x[0]] = (e2.scores.experience[x[0]] || 0) + LIVE.points[i]
    atheriaHonneurEcrire(server, e2)
    var d = m.dus[x[0]]
    if (d) d.textes.unshift(def.titre + ' : ' + (i + 1) + (i ? 'e' : 'er') + ', ' + LIVE.points[i] + ' points d\'honneur')
    if (i == 0 && def.titreGagnant) atheriaLiveDonner(server, m, x[0], 0, [], ['titre_' + def.titreGagnant[0]], null)
  })
  m.soirees.push({ nom: e.nom, titre: def.titre, fin: Date.now(), presents: Object.keys(presents) })
  var podium = classement.slice(0, 3).map(x => x[0])
  var resume = podium.length ? podium[0] + ' gagne' + (podium.length > 1 ? ' devant ' + podium.slice(1).join(' et ') : '') : 'personne n\'a marqué de points'
  if (typeof atheriaJournal === 'function') atheriaJournal(server, 'minecraft:firework_rocket', 'Soirée « ' + def.titre + ' » : ' + resume + '.', 'or')
  atheriaHudRadioTous(server, def.radio || 'semaine', 'C\'est fini. ' + resume.charAt(0).toUpperCase() + resume.substring(1) + '. Merci à tous les présents.', def.titre + ' :')
  server.players.forEach(p => atheriaLivePayer(p, m))
  atheriaLiveMemoireEcrire(server, m)
}

ServerEvents.tick(event => {
  var server = event.server
  if (server.tickCount % 20) return
  var e = atheriaLiveEtat(server)
  if (!e) return
  var def = LIVE.defs[e.nom]
  if (!def) { atheriaLiveEcrire(server, null); return }
  var reste = e.t0 - Date.now()
  try {
    if (e.phase == 'annonce') {
      ;[10, 2].forEach(mn => {
        if (reste <= mn * 60000 && reste > (mn - 1) * 60000 && !e.dits['a' + mn]) {
          e.dits['a' + mn] = true
          atheriaHudRadioTous(server, def.radio || 'semaine', def.rappel || def.annonce, def.titre + ', dans ' + mn + ' min :')
        }
      })
      if (reste <= 0) {
        e.phase = 'encours'
        e.t0 = Date.now()
        var c0 = atheriaLiveCtx(server, e)
        c0.banniere('evenement', 'Soirée live', def.titre, def.consigne || def.annonce)
        if (def.debut) def.debut(c0)
      }
      atheriaLiveEcrire(server, e)
      return
    }
    var ctx = atheriaLiveCtx(server, e)
    atheriaLiveJoueurs(server).forEach(p => {
      if (!def.surPlace || def.surPlace(ctx, p)) e.presence[p.username] = (e.presence[p.username] || 0) + 1
    })
    if (def.seconde) def.seconde(ctx, ctx.secondes)
    if (e.finDemandee || ctx.secondes >= (def.dureeMin || 60) * 60) { atheriaLiveTerminer(server, e, true); return }
    atheriaLiveEcrire(server, e)
  } catch (x) {
    console.error('[Atheria live] ' + e.nom + ' : ' + x)
  }
})

// connexion : récompenses en attente, ou consolation des absents (une fois par soirée manquée, dans la semaine)
PlayerEvents.loggedIn(event => atheriaLiveConnexion(event.player))

function atheriaLiveConnexion(p) {
  var server = p.server, m = atheriaLiveMemoire(server)
  var change = atheriaLivePayer(p, m)
  var vues = String(p.persistentData.getString('atheria_live_vues') || '').split(',').filter(x => x)
  var manquees = m.soirees.filter(s => s.presents.indexOf(p.username) < 0 && vues.indexOf(String(s.fin)) < 0)
  m.soirees.forEach(s => { if (vues.indexOf(String(s.fin)) < 0) vues.push(String(s.fin)) })
  p.persistentData.putString('atheria_live_vues', vues.slice(-16).join(','))
  if (manquees.length) {
    var bons = manquees.length * LIVE.bonsConsolation
    server.runCommandSilent('give ' + p.username + ' atheria:bon_caf ' + bons)
    server.scheduleInTicks(300, () => atheriaHudAction(p, 'atheria:bon_caf', 'Tu as manqué ' + (manquees.length > 1 ? manquees.length + ' soirées' : '« ' + manquees[0].titre + ' »') + ' : ' + bons + ' bons de consolation.', 'ambre'))
  }
  if (change) atheriaLiveMemoireEcrire(server, m)
}

// une créature d'une soirée rechargée depuis le disque une fois la soirée finie ne revient pas
EntityEvents.spawned(event => {
  var m = event.entity
  if (m.tags.contains('atheria_live') && !atheriaLiveEtat(m.server)) event.cancel()
})

ServerEvents.commandRegistry(event => {
  var { commands: Commands, arguments: Arg } = event
  var dire = (ctx, s) => { ctx.source.sendSystemMessage(Text.of(s)); return 1 }
  event.register(Commands.literal('live').requires(src => src.hasPermission(2))
    .then(Commands.literal('stop').executes(ctx => {
      var e = atheriaLiveEtat(ctx.source.server)
      if (!e) return dire(ctx, 'Aucune soirée en cours.')
      atheriaLiveTerminer(ctx.source.server, e, false)
      return dire(ctx, 'Soirée arrêtée sans récompense.')
    }))
    .then(Commands.literal('fin').executes(ctx => {
      var e = atheriaLiveEtat(ctx.source.server)
      if (!e) return dire(ctx, 'Aucune soirée en cours.')
      if (e.phase != 'encours') return dire(ctx, 'La soirée n\'a pas commencé (/live stop pour annuler).')
      atheriaLiveTerminer(ctx.source.server, e, true)
      return dire(ctx, 'Soirée terminée, récompenses données.')
    }))
    .then(Commands.literal('etat').executes(ctx => {
      var e = atheriaLiveEtat(ctx.source.server)
      if (!e) return dire(ctx, 'Aucune soirée en cours. Soirées : ' + Object.keys(LIVE.defs).join(', '))
      var sc = Object.keys(e.scores).map(k => k + ' ' + e.scores[k]).join(', ')
      return dire(ctx, LIVE.defs[e.nom].titre + ' : ' + (e.phase == 'annonce' ? 'début dans ' + Math.ceil((e.t0 - Date.now()) / 60000) + ' min' : 'en cours depuis ' + Math.floor((Date.now() - e.t0) / 60000) + ' min') + '. Scores : ' + (sc || 'aucun') + '.')
    }))
    .then(Commands.argument('nom', Arg.STRING.create(event))
      .then(Commands.literal('start')
        .executes(ctx => dire(ctx, atheriaLiveLancer(ctx.source.server, String(Arg.STRING.getResult(ctx, 'nom')), null)))
        .then(Commands.argument('minutes', Arg.INTEGER.create(event))
          .executes(ctx => dire(ctx, atheriaLiveLancer(ctx.source.server, String(Arg.STRING.getResult(ctx, 'nom')), Arg.INTEGER.getResult(ctx, 'minutes'))))))))
})
