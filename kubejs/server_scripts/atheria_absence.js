// Atheria - « Pendant ton absence » (Mika 27/11, lot gameplay 1) : à la connexion, un écran résume ce que les autres
// survivants ont fait depuis ton départ. Jamais de position : seulement des faits (classements, primes, avant-postes,
// caisses vidées, arrivées) et les totaux de l'île (infectés, Coupeurs, contrats).
// Les autres scripts appellent atheriaJournal(server, icone, texte, couleur, auteur) pour noter un fait marquant ;
// l'auteur ne voit pas ses propres faits. Les totaux viennent du tableau d'honneur (atheriaJournalCompter).
var ABSENCE = { minMs: 20 * 60 * 1000, garderMs: 14 * 86400 * 1000, max: 200, lignes: 7, delai: 160 }

function atheriaJournalLire(server) {
  var brut = String(server.persistentData.getString('atheria_journal') || '')
  var j = null
  try { j = brut ? JSON.parse(brut) : null } catch (e) { j = null }
  if (!j) j = { faits: [], totaux: {} }
  if (!j.faits) j.faits = []
  if (!j.totaux) j.totaux = {}
  return j
}

function atheriaJournalEcrire(server, j) {
  var limite = Date.now() - ABSENCE.garderMs
  j.faits = j.faits.filter(f => f.t >= limite)
  if (j.faits.length > ABSENCE.max) j.faits = j.faits.slice(j.faits.length - ABSENCE.max)
  server.persistentData.putString('atheria_journal', JSON.stringify(j))
}

// couleur : or, rouge, vert, bleu ou ambre ; auteur : nom du joueur concerné (il ne verra pas ce fait), facultatif
function atheriaJournal(server, icone, texte, couleur, auteur) {
  try {
    var j = atheriaJournalLire(server)
    j.faits.push({ t: Date.now(), i: icone || 'minecraft:paper', x: texte, c: couleur || 'ambre', a: auteur ? String(auteur) : '' })
    atheriaJournalEcrire(server, j)
  } catch (e) {
    console.warn('[Atheria absence] journal : ' + e)
  }
}

// totaux de l'île : infectes, coupeurs, contrats... (appelé par atheria_honneur.js)
function atheriaJournalCompter(server, cle, n) {
  var j = atheriaJournalLire(server)
  j.totaux[cle] = (j.totaux[cle] || 0) + n
  atheriaJournalEcrire(server, j)
}

function atheriaNombre(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

function atheriaAbsenceLignes(server, p, depuis, avant) {
  var j = atheriaJournalLire(server), moi = p.username
  var faits = j.faits.filter(f => f.t > depuis && f.a != moi)
  var lignes = faits.slice(Math.max(0, faits.length - (ABSENCE.lignes - 1))).reverse().map(f => [f.i, f.x, f.c])
  var d = k => (j.totaux[k] || 0) - (avant[k] || 0)
  var tues = [], phrase = ''
  if (d('infectes') > 0) tues.push(atheriaNombre(d('infectes')) + (d('infectes') > 1 ? ' infectés' : ' infecté'))
  if (d('coupeurs') > 0) tues.push(atheriaNombre(d('coupeurs')) + (d('coupeurs') > 1 ? ' Coupeurs' : ' Coupeur'))
  if (tues.length) phrase = 'abattu ' + tues.join(' et ')
  if (d('contrats') > 0) phrase += (phrase ? ' et ' : '') + 'rempli ' + atheriaNombre(d('contrats')) + (d('contrats') > 1 ? ' contrats radio' : ' contrat radio')
  if (phrase) lignes.push(['minecraft:zombie_head', 'Les survivants ont ' + phrase + '.', 'ambre'])
  return lignes
}

PlayerEvents.loggedOut(event => {
  var p = event.player
  p.persistentData.putString('atheria_absence_totaux', JSON.stringify(atheriaJournalLire(event.server).totaux))
  p.persistentData.putLong('atheria_absence_depart', Date.now())
})

PlayerEvents.loggedIn(event => {
  var p = event.player, d = p.persistentData, server = event.server
  var depart = d.getLong('atheria_absence_depart')
  if (!depart) {
    atheriaJournal(server, 'minecraft:player_head', p.username + ' est arrivé sur l\'île.', 'vert', p.username)
    return
  }
  if (Date.now() - depart < ABSENCE.minMs) return
  var avant = {}
  try { avant = JSON.parse(String(d.getString('atheria_absence_totaux') || '{}')) } catch (e) { avant = {} }
  var lignes = atheriaAbsenceLignes(server, p, depart, avant)
  if (!lignes.length) return
  var duree = Date.now() - depart
  // après les messages d'arrivée (radio, primes), et seulement si aucun autre écran n'est ouvert à ce moment
  server.scheduleInTicks(ABSENCE.delai, () => {
    if (!p.isAlive() || p.hasDisconnected()) return
    atheriaHud(p, { t: 'ecran', genre: 'absence', json: JSON.stringify({ duree: duree, lignes: lignes }) })
  })
})

// caisse des contrebandiers (atheria_largages.js) : le premier qui l'ouvre est noté, sans le lieu, et marque un point
// au tableau d'honneur (classement « cargaisons »)
BlockEvents.rightClicked('minecraft:barrel', event => {
  var server = event.server, b = event.block
  var pos = String(server.persistentData.getString('atheria_largage_pos') || '')
  if (!pos) return
  var c = pos.split(',').map(Number)
  if (b.x != c[0] + 1 || b.y != c[1] || b.z != c[2]) return
  if (String(server.persistentData.getString('atheria_largage_note') || '') == pos) return
  server.persistentData.putString('atheria_largage_note', pos)
  atheriaJournal(server, 'minecraft:barrel', event.player.username + ' a mis la main sur une cargaison des contrebandiers.', 'ambre', event.player.username)
  if (typeof atheriaHonneur === 'function') atheriaHonneur(event.player, 'cargaisons', 1, 'largage:' + pos)
})
