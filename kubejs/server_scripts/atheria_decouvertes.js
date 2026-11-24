// Atheria - didacticiel, temps 4 : chaque lieu nommé découvert rapporte quelque chose (Mika 24/11, plan validé).
// Les 18 villes et lieux qui ont un titre d'entrée (atheria_ile). Première entrée dans le lieu, une seule fois par joueur :
//  - 40 points d'expérience d'arbre (routeXp : honneur de la semaine et « Second souffle » compris) ;
//  - une petite icône au-dessus de la barre d'objets, 6 s après (le titre d'entrée passe d'abord, au centre) ;
//  - une étape de jeu atheria_lieu_<id> que les quêtes peuvent demander ;
//  - paliers 6, 12 et 18 lieux : bons CAF donnés par Eniy à la radio. Pas d'équipement : explorer aide sans faire
//    rattraper un joueur assidu (règle du rattrapage).
// /decouvertes : les lieux trouvés et le compte.
// Rectangles = lots de la carte finale (config/atheria_ile/regions.json), avec 16 blocs de marge comme le mod.
var DECOUVERTES = {
  xp: 40,
  marge: 16,
  paliers: { 6: 5, 12: 10, 18: 20 },
  lieux: [
    ['longoni', 'Longoni', 2448, -3088, 2624, -2960],
    ['majicavo', 'Majicavo', 2304, -2112, 2594, -1818],
    ['mamoudzou', 'Mamoudzou', 2864, -1472, 3120, -640],
    ['station_total', 'Station Total', 2768, -576, 2816, -528],
    ['coconi', 'Coconi', -1104, -1088, -880, -784],
    ['mont_benara', 'Mont Bénara', 192, 1408, 256, 1472],
    ['choungui', 'Choungui', -336, 1488, -240, 1552],
    ['vahibe', 'Vahibé', -2096, 2000, -1968, 2128],
    ['handrema', 'Handrema', 1536, 2672, 1664, 2800],
    ['mtsamboro', 'Mtsamboro', -3152, -5312, -3024, -5184],
    ['kaweni', 'Kawéni', 1440, -2432, 1568, -2304],
    ['sada', 'Sada', -4000, 448, -3872, 576],
    ['dembeni', 'Dembéni', 1984, 192, 2112, 320],
    ['chirongui', 'Chirongui', 736, 3712, 864, 3840],
    ['pecheurs_sud', 'Village des pêcheurs du Sud', 2448, 5040, 2544, 5192],
    ['zamani', 'Parc de Zamani', -1408, 4544, -1280, 4672],
    ['ville_gothique', 'Ville gothique des hospices', 2188, 672, 2364, 848],
    ['somaco', 'Campus Somaco', 4144, -768, 4272, -640]
  ]
}

function atheriaDecouvertesDe(p) {
  var s = String(p.persistentData.getString('atheria_decouvertes') || '')
  return s ? s.split(',') : []
}

function atheriaLieuA(x, z) {
  var m = DECOUVERTES.marge
  for (var i = 0; i < DECOUVERTES.lieux.length; i++) {
    var l = DECOUVERTES.lieux[i]
    if (x >= l[2] - m && x < l[4] + m && z >= l[3] - m && z < l[5] + m) return l
  }
  return null
}

function atheriaDecouvrir(p, l) {
  var vus = atheriaDecouvertesDe(p)
  if (vus.indexOf(l[0]) >= 0) return
  vus.push(l[0])
  p.persistentData.putString('atheria_decouvertes', vus.join(','))
  p.stages.add('atheria_lieu_' + l[0])
  routeXp(p, DECOUVERTES.xp)
  var n = vus.length, total = DECOUVERTES.lieux.length, nom = p.username
  console.info('[Atheria découvertes] ' + nom + ' : ' + l[0] + ' (' + n + '/' + total + ')')
  p.server.scheduleInTicks(120, () => {
    var q = p.server.getPlayer(nom)
    if (!q) return
    atheriaHudAction(q, 'minecraft:filled_map', 'Lieu découvert : ' + l[1] + ' (' + n + '/' + total + ')', 'vert', n / total)
    var bons = DECOUVERTES.paliers[n]
    if (bons) {
      q.server.runCommandSilent('give ' + nom + ' atheria:bon_caf ' + bons)
      atheriaHudRadio(q, 'eniy', bons + ' bons CAF pour tes repérages. ' + n + ' lieux sur ' + total + ', continue.', 'Eniy :')
    }
  })
}

ServerEvents.tick(event => {
  var server = event.server
  if (server.tickCount % 40 != 20) return
  server.players.forEach(p => {
    try {
      if (p.isSpectator() || p.isCreative()) return
      if (('' + p.level.dimension) !== 'minecraft:overworld') return
      if (typeof ARRIVEE !== 'undefined' && ARRIVEE.attente[p.username]) return
      if (typeof INTRO_VIDEO !== 'undefined' && INTRO_VIDEO.attente[p.username]) return
      var l = atheriaLieuA(p.x, p.z)
      if (l) atheriaDecouvrir(p, l)
    } catch (e) {
      console.error('[Atheria découvertes] ' + e)
    }
  })
})

ServerEvents.commandRegistry(event => {
  var Commands = event.commands
  event.register(Commands.literal('decouvertes').executes(ctx => {
    var p = ctx.source.player
    if (!p) return 0
    var vus = atheriaDecouvertesDe(p)
    var noms = DECOUVERTES.lieux.filter(l => vus.indexOf(l[0]) >= 0).map(l => l[1])
    p.tell(Text.gold('Lieux découverts : ' + noms.length + ' sur ' + DECOUVERTES.lieux.length))
    if (noms.length) p.tell(Text.gray(noms.join(', ')))
    return 1
  }))
})
