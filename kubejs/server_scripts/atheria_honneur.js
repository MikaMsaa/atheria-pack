// Atheria - tableau d'honneur de la semaine (Mika 22/11, idée validée).
// Quatre classements remis à zéro chaque lundi (heure de La Réunion), en même temps que l'événement de la semaine :
//  - experience : expérience d'arbre gagnée avec les nouveautés (contrats, carnet, Coupeurs, avant-postes, routes) ;
//  - infectes   : infectés abattus ;
//  - coupeurs   : Coupeurs de route abattus ;
//  - contrats   : contrats radio remplis.
// /honneur montre les trois premiers de chaque classement et ta place. Le lundi, la radio annonce les premiers de la semaine
// passée ; chaque premier reçoit 15 bons CAF (à sa prochaine connexion s'il n'est pas là). Pas d'équipement : un honneur, pas un avantage.
var HONNEUR = {
  categories: [
    ['experience', 'Survivant de la semaine', 'points d\'expérience'],
    ['infectes', 'Nettoyeur', 'infectés abattus'],
    ['coupeurs', 'Terreur des Coupeurs', 'Coupeurs abattus'],
    ['contrats', 'Voix de la radio', 'contrats remplis']
  ],
  prime: 15
}

function atheriaHonneurEtat(server) {
  var brut = String(server.persistentData.getString('atheria_honneur') || '')
  var e = null
  try { e = brut ? JSON.parse(brut) : null } catch (x) { e = null }
  if (!e) e = { semaine: atheriaEniySemaine(), scores: {}, dus: {} }
  if (!e.dus) e.dus = {}
  return e
}

function atheriaHonneurEcrire(server, e) {
  server.persistentData.putString('atheria_honneur', JSON.stringify(e))
}

function atheriaHonneurClasse(e, cat) {
  var sc = e.scores[cat] || {}
  return Object.keys(sc).map(k => [k, sc[k]]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1])
}

// fin de semaine : annonce, primes, remise à zéro
function atheriaHonneurTourner(server, e) {
  var w = atheriaEniySemaine()
  if (e.semaine == w) return e
  var lignes = []
  HONNEUR.categories.forEach(c => {
    var cl = atheriaHonneurClasse(e, c[0])
    if (!cl.length) return
    lignes.push(c[1] + ' : ' + cl[0][0] + ' (' + cl[0][1] + ' ' + c[2] + ')')
    e.dus[cl[0][0]] = (e.dus[cl[0][0]] || 0) + HONNEUR.prime
  })
  if (lignes.length) {
    server.tell(Text.gold('[Radio] Tableau d\'honneur de la semaine passée :'))
    lignes.forEach(l => server.tell(Text.yellow('  ' + l)))
  }
  e.semaine = w
  e.scores = {}
  server.players.forEach(p => atheriaHonneurPayer(p, e))
  return e
}

function atheriaHonneurPayer(p, e) {
  var n = e.dus[p.username] || 0
  if (n <= 0) return
  p.server.runCommandSilent('give ' + p.username + ' atheria:bon_caf ' + n)
  atheriaHudRadio(p, 'honneur', n + ' bons CAF de prime.', 'Tu es au tableau d\'honneur :')
  delete e.dus[p.username]
}

// appelé par les autres scripts
function atheriaHonneur(p, cat, n) {
  if (!p || !p.isPlayer() || n <= 0) return
  var e = atheriaHonneurTourner(p.server, atheriaHonneurEtat(p.server))
  if (!e.scores[cat]) e.scores[cat] = {}
  e.scores[cat][p.username] = (e.scores[cat][p.username] || 0) + n
  atheriaHonneurEcrire(p.server, e)
}

var HONNEUR_INFECTES = /^spore:|^minecraft:(zombie|husk|drowned|zombie_villager)$/
EntityEvents.death(event => {
  var src = event.source, p = src ? src.player : null
  if (!p || !p.isPlayer()) return
  var e = event.entity
  if (e.tags.contains('atheria_coupeur')) { atheriaHonneur(p, 'coupeurs', 1); return }
  if (HONNEUR_INFECTES.test('' + e.getEncodeId())) atheriaHonneur(p, 'infectes', 1)
})

ServerEvents.tick(event => {
  var server = event.server
  if (server.tickCount % 1200 != 1100) return
  var e = atheriaHonneurEtat(server)
  if (e.semaine != atheriaEniySemaine()) atheriaHonneurEcrire(server, atheriaHonneurTourner(server, e))
})

PlayerEvents.loggedIn(event => {
  var e = atheriaHonneurTourner(event.server, atheriaHonneurEtat(event.server))
  atheriaHonneurPayer(event.player, e)
  atheriaHonneurEcrire(event.server, e)
})

ServerEvents.commandRegistry(event => {
  event.register(event.commands.literal('honneur').executes(ctx => {
    var p = ctx.source.player
    if (!p) return 0
    var e = atheriaHonneurEtat(p.server)
    if (typeof atheriaHud === 'function') {
      // tableau d'honneur à l'écran (mod atheria_hud) : un podium par classement
      var maintenant = Date.now() + 4 * 3600 * 1000 + 3 * 86400 * 1000
      atheriaHud(p, { t: 'ecran', genre: 'honneur', json: JSON.stringify({
        moi: p.username, prime: HONNEUR.prime, lundi: 7 * 86400000 - (maintenant % (7 * 86400000)),
        categories: HONNEUR.categories.map(c => {
          var cl = atheriaHonneurClasse(e, c[0]), rang = cl.map(x => x[0]).indexOf(p.username)
          return [c[0], c[1], c[2], cl.slice(0, 3), rang, rang >= 0 ? cl[rang][1] : 0, cl.length]
        })
      }) })
      return 1
    }
    p.tell(Text.gold('— Tableau d\'honneur de la semaine —'))
    HONNEUR.categories.forEach(c => {
      var cl = atheriaHonneurClasse(e, c[0])
      var top = cl.slice(0, 3).map((x, i) => (i + 1) + '. ' + x[0] + ' (' + x[1] + ')').join('   ')
      var rang = cl.map(x => x[0]).indexOf(p.username)
      p.tell(Text.yellow(c[1] + ' : ').append(Text.gray(top || 'personne pour l\'instant')))
      if (rang >= 3) p.tell(Text.darkGray('   toi : ' + (rang + 1) + 'e (' + cl[rang][1] + ' ' + c[2] + ')'))
    })
    p.tell(Text.darkGray('Remise à zéro lundi à minuit. Le premier de chaque classement reçoit ' + HONNEUR.prime + ' bons.'))
    return 1
  }))
})
