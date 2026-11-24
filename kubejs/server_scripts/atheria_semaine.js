// Atheria - événement de la semaine (Mika 22/11, « événements de lore hebdo » validé).
// Chaque lundi à minuit (heure de La Réunion), l'île change d'humeur pour 7 jours. Cinq semaines tournent dans l'ordre,
// pour que chaque joueur, même s'il ne vient que le week-end, voie la radio annoncer quelque chose de nouveau.
// Les autres scripts lisent atheriaSemaine() :
//  - coupeurs : « Les Coupeurs serrent la RN1 » - deux fois plus d'arrêts, butin en bons doublé (atheria_coupeurs.js) ;
//  - marche   : « Le marché noir d'Eniy » - Eniy rachète le butin Spore 50 % plus cher (atheria_eniy.js) ;
//  - cendres  : « Vents de cendres » - tempêtes deux fois plus fréquentes (atheria_tempetes.js) ;
//  - radio    : « La radio paie double » - contrats du jour payés 50 % de plus (atheria_contrats.js) ;
//  - cargaison: « Cargaison supplémentaire » - une caisse des contrebandiers en plus le dimanche à 20 h (atheria_largages.js).
var SEMAINES = [
  ['coupeurs', 'Les Coupeurs serrent la RN1', 'Bacar a doublé les barrages cette semaine. Plus de péages sur les routes, mais leurs poches sont pleines.'],
  ['marche', 'Le marché noir d\'Eniy', 'Eniy a un acheteur « aux Émirats ». Cette semaine, il rachète le butin des infectés 50 % plus cher.'],
  ['cendres', 'Vents de cendres', 'Le vent a tourné vers l\'île. Les tempêtes de cendres seront deux fois plus fréquentes cette semaine.'],
  ['radio', 'La radio paie double', 'Les fréquences sont bonnes cette semaine : les contrats radio du jour paient 50 % de plus.'],
  ['cargaison', 'Cargaison supplémentaire', 'Les contrebandiers ont un bateau de plus. Une caisse en plus dimanche à 20 h.']
]

function atheriaSemaineInfo() {
  return SEMAINES[atheriaEniySemaine() % SEMAINES.length]
}

function atheriaSemaine() {
  return atheriaSemaineInfo()[0]
}

function atheriaSemaineAnnoncer(p) {
  var s = atheriaSemaineInfo()
  atheriaHudRadio(p, 'semaine', s[2], s[1] + '.')
}

PlayerEvents.loggedIn(event => atheriaSemaineAnnoncer(event.player))

// changement de semaine en cours de partie
ServerEvents.tick(event => {
  var server = event.server
  if (server.tickCount % 1200 != 900) return
  var w = atheriaEniySemaine()
  if (server.persistentData.getInt('atheria_semaine') == w) return
  server.persistentData.putInt('atheria_semaine', w)
  server.players.forEach(p => atheriaSemaineAnnoncer(p))
})

ServerEvents.commandRegistry(event => {
  event.register(event.commands.literal('semaine').executes(ctx => {
    var p = ctx.source.player
    if (p) atheriaSemaineAnnoncer(p)
    return 1
  }))
})
