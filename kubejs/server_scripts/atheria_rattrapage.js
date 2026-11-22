// Atheria - rattrapage calibré (Mika 22/11 : « faut pas qu'elle soit abusée [...] faut que ça soit bien calibré »).
// Un joueur qui joue peu ne doit jamais rattraper l'équipement des joueurs assidus. Le rattrapage ne donne donc :
//  - ni armes, ni armure, ni stade : seulement de l'expérience d'arbre, des consommables et de quoi repartir ;
//  - « Second souffle » : tant que ton temps de jeu est sous la moitié du temps médian des joueurs du serveur,
//    l'expérience d'arbre gagnée en utilisant les nouveautés (contrats, carnet, Coupeurs, avant-postes) compte 1,5 fois.
//    Au mieux, un joueur à mi-temps gagne donc 75 % de l'expérience d'un assidu : il se rapproche sans jamais le dépasser ;
//  - « Colis de retour » : après 3 jours d'absence, une fois, Eniy garde un colis de survie (rations, bandages, filtres, essence).
var RATTRAPAGE = {
  facteur: 1.5,
  seuilMedian: 0.5,
  medianMini: 300,        // minutes : pas de rattrapage tant que le serveur est jeune
  absenceJours: 3,
  colis: [['atheria:ration', 3], ['firstaid:bandage', 4], ['atheria:filtre', 2], ['atheria:bidon_essence', 1]]
}

function atheriaTempsTous(server) {
  var brut = String(server.persistentData.getString('atheria_temps_jeu') || '')
  try { return brut ? JSON.parse(brut) : {} } catch (e) { return {} }
}

function atheriaRattrapageActif(p) {
  var t = atheriaTempsTous(p.server), mien = t[p.username] || 0
  var autres = Object.keys(t).filter(k => k != p.username).map(k => t[k]).sort((a, b) => a - b)
  if (autres.length == 0) return false
  var med = autres[Math.floor(autres.length / 2)]
  return med >= RATTRAPAGE.medianMini && mien < med * RATTRAPAGE.seuilMedian
}

// appelé par routeXp (atheria_contenu_routes.js) pour l'expérience des nouveautés
function atheriaRattrapageXp(p, n) {
  return atheriaRattrapageActif(p) ? Math.round(n * RATTRAPAGE.facteur) : n
}

// temps de jeu : une minute de plus par minute connectée (hors spectateur)
ServerEvents.tick(event => {
  var server = event.server
  if (server.tickCount % 1200 != 1000 || server.players.isEmpty()) return
  var t = atheriaTempsTous(server)
  server.players.forEach(p => { if (!p.isSpectator()) t[p.username] = (t[p.username] || 0) + 1 })
  server.persistentData.putString('atheria_temps_jeu', JSON.stringify(t))
})

PlayerEvents.loggedOut(event => event.player.persistentData.putLong('atheria_deconnexion', Date.now()))

PlayerEvents.loggedIn(event => {
  var p = event.player, d = p.persistentData
  var depart = d.getLong('atheria_deconnexion')
  if (depart && Date.now() - depart >= RATTRAPAGE.absenceJours * 86400 * 1000) {
    RATTRAPAGE.colis.forEach(c => p.give(Item.of(c[0], c[1])))
    p.tell(Text.gold('[Radio] ').append(Text.gray('Eniy : « Tu étais passé où ? J\'ai gardé un colis pour toi. Gratuit, pour une fois. Ne le répète pas. »')))
  }
  if (atheriaRattrapageActif(p))
    p.tell(Text.gold('[Radio] ').append(Text.gray('Second souffle : les contrats, le carnet, les Coupeurs et les avant-postes te font progresser plus vite dans l\'arbre Survivant.')))
})
