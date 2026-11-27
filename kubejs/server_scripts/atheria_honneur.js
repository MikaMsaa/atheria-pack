// Atheria - tableau d'honneur de la semaine (Mika 22/11, refait au lot gameplay 1 du 27/11).
// Six classements remis à zéro chaque lundi (heure de La Réunion), en même temps que l'événement de la semaine :
//  - experience  : expérience d'arbre gagnée avec les nouveautés (contrats, carnet, Coupeurs, avant-postes, routes) ;
//  - infectes    : infectés abattus ;
//  - coupeurs    : Coupeurs de route abattus ;
//  - contrats    : contrats radio remplis ;
//  - avantpostes : avant-postes pris (chaque joueur présent à la prise) ;
//  - cargaisons  : cargaisons des contrebandiers trouvées les premiers.
// Anti-farm : rien ne compte dans une zone sûre ; les monstres sortis d'une cage, d'un œuf ou d'une commande ne comptent pas ;
// au plus HONNEUR.coin.max abattages par joueur et par heure sur un même carré de 48 blocs (fermes à monstres) ;
// un plafond par jour et par classement ; un même avant-poste ou une même cargaison ne compte qu'une fois par jour.
// Le lundi : la radio annonce les podiums ; le 1er, le 2e et le 3e de chaque classement reçoivent des bons CAF et de
// l'équipement (jamais une arme lourde) à leur prochaine connexion s'ils ne sont pas là.
// Primes de la semaine (Mika 27/11, façon One Piece) : chaque premier est mis à prix pour la semaine. Le joueur qui l'abat
// hors d'une zone sûre (et hors de son alliance) touche la prime et un butin ; s'il tient jusqu'au lundi, c'est lui qui
// est payé. La prime ne court que quand il est connecté, et la radio ne donne sa zone (à 250 blocs près) que hors des zones sûres.
// /honneur ouvre le tableau à l'écran.
var HONNEUR = {
  categories: [
    ['experience', 'Survivant de la semaine', 'points d\'expérience'],
    ['infectes', 'Nettoyeur', 'infectés abattus'],
    ['coupeurs', 'Terreur des Coupeurs', 'Coupeurs abattus'],
    ['contrats', 'Voix de la radio', 'contrats remplis'],
    ['avantpostes', 'Maître des avant-postes', 'avant-postes pris'],
    ['cargaisons', 'Chasseur de cargaisons', 'cargaisons trouvées']
  ],
  // récompenses du 1er, du 2e et du 3e de chaque classement
  rangs: [
    { bons: 15, objets: [['atheria:trousse_soins', 2], ['atheria:filtre', 3], ['tacz:ammo[minecraft:custom_data={AmmoId:"tacz:9mm"}]', 30], ['atheria:fusee_eclairante', 2]] },
    { bons: 8, objets: [['atheria:trousse_soins', 1], ['atheria:filtre', 2], ['atheria:ration', 3]] },
    { bons: 4, objets: [['atheria:filtre', 1], ['atheria:ration', 2]] }
  ],
  // anti-farm
  plafondJour: { experience: 4000, infectes: 150, coupeurs: 30, contrats: 20, avantpostes: 6, cargaisons: 4 },
  coin: { taille: 48, max: 20, fenetreMs: 3600 * 1000 },
  minClasses: 2, // une prime seulement si au moins 2 joueurs sont classés dans la catégorie
  prime: {
    base: 30, parTitre: 10, // bons CAF pour qui l'abat
    survie: 25,             // bons CAF pour la cible qui tient la semaine
    butin: [['atheria:trousse_soins', 2], ['tacz:ammo[minecraft:custom_data={AmmoId:"tacz:556x45"}]', 30], ['atheria:filtre', 2]],
    precision: 250, radioTicks: 18000
  }
}
var HONNEUR_COINS = {}

function atheriaHonneurEtat(server) {
  var brut = String(server.persistentData.getString('atheria_honneur') || '')
  var e = null
  try { e = brut ? JSON.parse(brut) : null } catch (x) { e = null }
  if (!e) e = { semaine: atheriaEniySemaine(), scores: {}, dus: {} }
  if (!e.scores) e.scores = {}
  if (!e.dus) e.dus = {}
  if (!e.cibles) e.cibles = {}
  if (!e.jour) e.jour = { cle: '', n: {}, vus: {} }
  return e
}

function atheriaHonneurEcrire(server, e) {
  server.persistentData.putString('atheria_honneur', JSON.stringify(e))
}

function atheriaHonneurClasse(e, cat) {
  var sc = e.scores[cat] || {}
  return Object.keys(sc).map(k => [k, sc[k]]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1])
}

function atheriaHonneurJour() {
  return String(Math.floor((Date.now() + 4 * 3600 * 1000) / 86400000))
}

// ce qu'on doit à un joueur : { bons, objets: [[objet, nombre]...], textes: [...] } (ancien format : un nombre de bons)
function atheriaHonneurDu(e, nom) {
  var d = e.dus[nom]
  if (typeof d === 'number') d = { bons: d, objets: [], textes: [] }
  if (!d) d = { bons: 0, objets: [], textes: [] }
  e.dus[nom] = d
  return d
}

function atheriaHonneurDonner(e, nom, bons, objets, texte) {
  var d = atheriaHonneurDu(e, nom)
  d.bons += bons || 0
  ;(objets || []).forEach(o => d.objets.push(o))
  if (texte) d.textes.push(texte)
}

// fin de semaine : survivants des primes, podiums, nouvelles primes, remise à zéro
function atheriaHonneurTourner(server, e) {
  var w = atheriaEniySemaine()
  if (e.semaine == w) return e
  var journal = typeof atheriaJournal === 'function'
  Object.keys(e.cibles).forEach(nom => {
    atheriaHonneurDonner(e, nom, HONNEUR.prime.survie, [], 'Tu as tenu toute la semaine avec ta tête mise à prix')
    if (journal) atheriaJournal(server, 'minecraft:totem_of_undying', nom + ' a tenu toute la semaine avec sa tête mise à prix.', 'or', nom)
  })
  var annonces = [], cibles = {}
  HONNEUR.categories.forEach(c => {
    var cl = atheriaHonneurClasse(e, c[0])
    if (!cl.length) return
    cl.slice(0, 3).forEach((x, i) => {
      var r = HONNEUR.rangs[i]
      atheriaHonneurDonner(e, x[0], r.bons, r.objets, (i + 1) + (i ? 'e' : 'er') + ' du classement ' + c[1])
    })
    annonces.push(c[1] + ' : ' + cl[0][0])
    if (journal) atheriaJournal(server, 'atheria:bon_caf', cl[0][0] + ' a fini premier du tableau d\'honneur (' + c[1] + ', ' + cl[0][1] + ' ' + c[2] + ').', 'or', cl[0][0])
    if (cl.length >= HONNEUR.minClasses) {
      var nom = cl[0][0]
      cibles[nom] = cibles[nom] ? { prime: cibles[nom].prime + HONNEUR.prime.parTitre } : { prime: HONNEUR.prime.base }
    }
  })
  if (annonces.length) atheriaHudRadioTous(server, 'honneur', annonces.join('. ') + '.', 'Premiers de la semaine passée :')
  var noms = Object.keys(cibles)
  if (noms.length) {
    atheriaHudRadioTous(server, 'primes', '« Têtes mises à prix cette semaine : ' + noms.map(n => n + ' (' + cibles[n].prime + ' bons)').join(', ') + '. Payé à qui les abat hors des zones sûres. »')
    noms.forEach(n => { if (journal) atheriaJournal(server, 'minecraft:skeleton_skull', n + ' est mis à prix pour la semaine : ' + cibles[n].prime + ' bons CAF sur sa tête.', 'rouge', n) })
  }
  e.cibles = cibles
  e.semaine = w
  e.scores = {}
  server.players.forEach(p => { atheriaHonneurPayer(p, e); atheriaHonneurAvisCible(p, e) })
  return e
}

function atheriaHonneurPayer(p, e) {
  var d = e.dus[p.username]
  if (!d) return
  if (typeof d === 'number') d = atheriaHonneurDu(e, p.username)
  if (d.bons <= 0 && !d.objets.length) { delete e.dus[p.username]; return }
  if (d.bons > 0) p.server.runCommandSilent('give ' + p.username + ' atheria:bon_caf ' + d.bons)
  d.objets.forEach(o => p.server.runCommandSilent('give ' + p.username + ' ' + o[0] + ' ' + o[1]))
  var pourquoi = d.textes && d.textes.length ? d.textes.join(', ') + '.' : ''
  atheriaHudBanniere(p, 'quete', 'Tableau d\'honneur', 'Ta récompense de la semaine',
    (d.bons > 0 ? d.bons + ' bons CAF' : '') + (d.objets.length ? (d.bons > 0 ? ' et ' : '') + 'un lot d\'équipement' : '') + '. ' + pourquoi)
  delete e.dus[p.username]
}

function atheriaHonneurAvisCible(p, e) {
  var c = e.cibles[p.username]
  if (!c) return
  p.server.scheduleInTicks(240, () => {
    atheriaHudBanniere(p, 'danger', 'Avis de recherche', 'Ta tête est mise à prix', c.prime + ' bons CAF pour qui t\'abat hors des zones sûres, jusqu\'à lundi. Si tu tiens, c\'est toi qui touches ' + HONNEUR.prime.survie + ' bons.')
  })
}

// anti-farm : vrai si ce point peut compter
function atheriaHonneurCompte(p, e, cat, n, cle, lieu) {
  var j = atheriaHonneurJour()
  if (e.jour.cle != j) e.jour = { cle: j, n: {}, vus: {} }
  if (cle) {
    var k = p.username + '|' + cle
    if (e.jour.vus[k]) return 0
    e.jour.vus[k] = 1
  }
  if (lieu) {
    if (typeof atheriaZoneSure === 'function' && atheriaZoneSure(p.level, lieu[0], lieu[1]) != null) return 0
    var t = HONNEUR.coin.taille
    var ck = p.username + '|' + Math.floor(lieu[0] / t) + ',' + Math.floor(lieu[1] / t)
    var maintenant = Date.now()
    var l = (HONNEUR_COINS[ck] || []).filter(x => maintenant - x < HONNEUR.coin.fenetreMs)
    if (l.length >= HONNEUR.coin.max) { HONNEUR_COINS[ck] = l; return 0 }
    l.push(maintenant)
    HONNEUR_COINS[ck] = l
  }
  if (!e.jour.n[cat]) e.jour.n[cat] = {}
  var deja = e.jour.n[cat][p.username] || 0, plafond = HONNEUR.plafondJour[cat] || 1000000
  var ok = Math.max(0, Math.min(n, plafond - deja))
  e.jour.n[cat][p.username] = deja + ok
  return ok
}

// appelé par les autres scripts ; cle : identifiant d'un fait qui ne compte qu'une fois par jour (facultatif) ;
// lieu : [x, z] d'un abattage (facultatif, pour les zones sûres et les fermes)
function atheriaHonneur(p, cat, n, cle, lieu) {
  if (!p || !p.isPlayer() || n <= 0) return
  var e = atheriaHonneurTourner(p.server, atheriaHonneurEtat(p.server))
  n = atheriaHonneurCompte(p, e, cat, n, cle, lieu)
  if (n > 0) {
    if (!e.scores[cat]) e.scores[cat] = {}
    e.scores[cat][p.username] = (e.scores[cat][p.username] || 0) + n
    if (typeof atheriaJournalCompter === 'function' && cat != 'experience') atheriaJournalCompter(p.server, cat, n)
  }
  atheriaHonneurEcrire(p.server, e)
}

// les monstres sortis d'une cage, d'un œuf, d'un distributeur ou d'une commande ne comptent pas
NativeEvents.onEvent('net.neoforged.neoforge.event.entity.living.FinalizeSpawnEvent', event => {
  var t = String(event.getSpawnType())
  if (t == 'SPAWNER' || t == 'TRIAL_SPAWNER' || t == 'SPAWN_EGG' || t == 'DISPENSER' || t == 'COMMAND' || t == 'BUCKET')
    event.getEntity().addTag('atheria_sans_honneur')
})

var HONNEUR_INFECTES = /^spore:|^minecraft:(zombie|husk|drowned|zombie_villager)$/
EntityEvents.death(event => {
  var src = event.source, p = src ? src.player : null
  if (!p || !p.isPlayer()) return
  var e = event.entity
  if (e.isPlayer() || e.tags.contains('atheria_sans_honneur')) return
  if (e.tags.contains('atheria_coupeur')) { atheriaHonneur(p, 'coupeurs', 1, null, [e.x, e.z]); return }
  if (HONNEUR_INFECTES.test('' + e.getEncodeId())) atheriaHonneur(p, 'infectes', 1, null, [e.x, e.z])
})

// prime de la semaine : abattu par un autre joueur, hors zone sûre, hors de son alliance
function atheriaMemeAlliance(a, b) {
  try {
    return Java.loadClass('dev.ftb.mods.ftbteams.api.FTBTeamsAPI').api().getManager().arePlayersInSameTeam(a.uuid, b.uuid)
  } catch (x) {
    return false
  }
}

EntityEvents.death('minecraft:player', event => {
  var v = event.entity, src = event.source, k = src ? src.player : null
  if (!k || !k.isPlayer() || k.uuid.equals(v.uuid)) return
  atheriaHonneurPrimeAbattu(k, v)
})

function atheriaHonneurPrimeAbattu(k, v) {
  var server = k.server, e = atheriaHonneurEtat(server), c = e.cibles[v.username]
  if (!c) return
  if (typeof atheriaZoneSure === 'function' && atheriaZoneSure(v.level, v.x, v.z) != null) return
  if (atheriaMemeAlliance(k, v)) {
    atheriaHudAction(k, 'minecraft:skeleton_skull', 'Pas de prime entre membres d\'une même alliance.', 'rouge')
    return
  }
  delete e.cibles[v.username]
  atheriaHonneurEcrire(server, e)
  server.runCommandSilent('give ' + k.username + ' atheria:bon_caf ' + c.prime)
  HONNEUR.prime.butin.forEach(o => server.runCommandSilent('give ' + k.username + ' ' + o[0] + ' ' + o[1]))
  atheriaHudRadioTous(server, 'primes', '« ' + k.username + ' a abattu ' + v.username + ' et touche sa prime de la semaine : ' + c.prime + ' bons CAF. »')
  atheriaHudBanniere(k, 'quete', 'Prime touchée', v.username + ' est tombé', c.prime + ' bons CAF et un butin de prime.')
  if (typeof atheriaJournal === 'function') atheriaJournal(server, 'minecraft:skeleton_skull', k.username + ' a abattu ' + v.username + ', mis à prix pour la semaine, et touché ' + c.prime + ' bons CAF.', 'or')
}

ServerEvents.tick(event => {
  var server = event.server
  if (server.tickCount % 1200 == 1100) {
    var e = atheriaHonneurEtat(server)
    if (e.semaine != atheriaEniySemaine()) atheriaHonneurEcrire(server, atheriaHonneurTourner(server, e))
  }
  // la zone des têtes mises à prix, toutes les 15 minutes, seulement hors des zones sûres
  if (server.tickCount % HONNEUR.prime.radioTicks != 9000) return
  var e2 = atheriaHonneurEtat(server), pr = HONNEUR.prime.precision
  server.players.forEach(p => {
    var c = e2.cibles[p.username]
    if (!c || ('' + p.level.dimension) !== 'minecraft:overworld') return
    if (typeof atheriaZoneSure === 'function' && atheriaZoneSure(p.level, p.x, p.z) != null) return
    atheriaHudRadioTous(server, 'primes', '« ' + p.username + ' a été vu vers X ' + Math.round(p.x / pr) * pr + ', Z ' + Math.round(p.z / pr) * pr + '. Prime : ' + c.prime + ' bons CAF. »')
  })
})

PlayerEvents.loggedIn(event => {
  var e = atheriaHonneurTourner(event.server, atheriaHonneurEtat(event.server))
  atheriaHonneurPayer(event.player, e)
  atheriaHonneurAvisCible(event.player, e)
  atheriaHonneurEcrire(event.server, e)
})

ServerEvents.commandRegistry(event => {
  event.register(event.commands.literal('honneur').executes(ctx => {
    var p = ctx.source.player
    if (!p) return 0
    var e = atheriaHonneurEtat(p.server)
    var maintenant = Date.now() + 4 * 3600 * 1000 + 3 * 86400 * 1000
    var cibles = Object.keys(e.cibles)
    atheriaHud(p, { t: 'ecran', genre: 'honneur', json: JSON.stringify({
      moi: p.username, prime: HONNEUR.rangs[0].bons, lundi: 7 * 86400000 - (maintenant % (7 * 86400000)),
      pied: 'Le podium de chaque classement reçoit des bons CAF et de l\'équipement. Chaque premier est mis à prix la semaine suivante.',
      primes: cibles.length ? 'Têtes mises à prix : ' + cibles.map(n => n + ' (' + e.cibles[n].prime + ' bons)').join(', ') + '.' : '',
      categories: HONNEUR.categories.map(c => {
        var cl = atheriaHonneurClasse(e, c[0]), rang = cl.map(x => x[0]).indexOf(p.username)
        return [c[0], c[1], c[2], cl.slice(0, 3), rang, rang >= 0 ? cl[rang][1] : 0, cl.length]
      })
    }) })
    return 1
  }))
})
