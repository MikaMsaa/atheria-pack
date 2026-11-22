// Atheria - prime PvP (Mika 22/11, mécanique validée).
// Un survivant qui tue 3 autres joueurs en moins de 24 h (temps réel) devient « recherché » :
//  - la radio annonce une prime en bons CAF et, toutes les 5 minutes, sa position approximative (à 100 blocs près) ;
//  - chaque nouveau meurtre augmente la prime (10 bons par meurtre, 50 au plus) ;
//  - celui qui l'abat touche la prime ; tuer un recherché ne compte pas comme un meurtre ;
//  - la prime s'éteint au bout de 2 h sans nouveau meurtre.
// La tombe (Corpse) reste réservée à son propriétaire 30 minutes, puis s'ouvre à tous : config/corpse-server.toml.
var PRIME_SEUIL = 3
var PRIME_FENETRE = 24 * 3600 * 1000
var PRIME_DUREE = 2 * 3600 * 1000
var PRIME_PAR_MEURTRE = 10
var PRIME_MAX = 50

function atheriaRadio(server, texte) {
  server.players.forEach(p => p.tell(Text.darkRed('[Radio] ').append(Text.gray(texte))))
}

function atheriaNom(e) {
  return e.isPlayer() ? e.username : e.name.string
}

function atheriaPrimeLue(joueur) {
  var d = joueur.persistentData
  var prime = d.getInt('atheria_prime')
  if (prime > 0 && Date.now() > d.getLong('atheria_prime_fin')) {
    d.remove('atheria_prime')
    d.remove('atheria_prime_fin')
    joueur.removeTag('atheria_recherche')
    return 0
  }
  return prime
}

EntityEvents.death('minecraft:player', event => {
  var src = event.source
  var tueur = src ? src.player : null
  if (!tueur || !tueur.isPlayer() || tueur.uuid.equals(event.entity.uuid)) return
  atheriaPrimeMeurtre(tueur, event.entity)
})

function atheriaPrimeMeurtre(tueur, victime) {
  var server = tueur.server
  var maintenant = Date.now()

  // la victime était recherchée : le tueur touche la prime
  var prime = atheriaPrimeLue(victime)
  if (prime > 0) {
    victime.persistentData.remove('atheria_prime')
    victime.persistentData.remove('atheria_prime_fin')
    victime.persistentData.remove('atheria_meurtres')
    victime.removeTag('atheria_recherche')
    server.runCommandSilent('give ' + tueur.username + ' atheria:bon_caf ' + prime)
    atheriaRadio(server, '« ' + atheriaNom(victime) + ' ne fera plus de victimes. ' + tueur.username + ' touche la prime de ' + prime + ' bons CAF. »')
    return
  }

  // sinon c'est un meurtre : on garde ceux des dernières 24 h
  var d = tueur.persistentData
  var liste = String(d.getString('atheria_meurtres') || '').split(',').filter(t => t && maintenant - Number(t) < PRIME_FENETRE)
  liste.push(String(maintenant))
  d.putString('atheria_meurtres', liste.join(','))
  if (liste.length < PRIME_SEUIL) return

  var avant = atheriaPrimeLue(tueur)
  var nouvelle = Math.min(PRIME_MAX, (avant > 0 ? avant : (PRIME_SEUIL - 1) * PRIME_PAR_MEURTRE) + PRIME_PAR_MEURTRE)
  d.putInt('atheria_prime', nouvelle)
  d.putLong('atheria_prime_fin', maintenant + PRIME_DUREE)
  tueur.addTag('atheria_recherche')
  atheriaRadio(server, '« Avis à tous : ' + tueur.username + ' abat les siens. Prime : ' + nouvelle + ' bons CAF pour qui l\'arrête. »')
  tueur.tell(Text.red('Ta tête est mise à prix (' + nouvelle + ' bons CAF). La radio donne ta position toutes les 5 minutes pendant 2 heures.'))
}

// position des recherchés toutes les 5 minutes
ServerEvents.tick(event => {
  var server = event.server
  if (server.tickCount % 6000 != 3000) return
  server.players.forEach(p => {
    if (atheriaPrimeLue(p) <= 0) return
    var x = Math.round(p.x / 100) * 100
    var z = Math.round(p.z / 100) * 100
    atheriaRadio(server, '« ' + p.username + ' a été vu vers X ' + x + ', Z ' + z + '. Prime : ' + p.persistentData.getInt('atheria_prime') + ' bons CAF. »')
  })
})
