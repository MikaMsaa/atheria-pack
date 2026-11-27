// Atheria - soirée live « Le rallye de la RN1 » (dimanche 20/12, 21 h Paris ; doc « Soirées live d'Atheria »).
// Course de véhicules de la Porte RN1 de Longoni jusqu'au Refuge de Coconi, par la RN1 : station Total, péage de Bacar,
// ruines du camp de la RN1. Chacun vient avec son véhicule (ou en prend un à la grille : la PAF en prête une poignée).
// Déroulé (/live rallye start) :
//  1. annonce radio 30 min avant ; à l'heure, 4 minutes de grille à la Porte RN1 : tout joueur à moins de 45 blocs est inscrit,
//     reçoit les points de passage sur sa carte, et le réservoir de son véhicule est mis à 1 bidon (carburant limité) ;
//  2. départ lancé (bannière 3, 2, 1) ; chaque point de passage se valide en véhicule, dans l'ordre ; la radio annonce
//     le premier à chaque point ; à la station Total, chaque pilote reçoit un bidon d'essence (à verser soi-même) ;
//  3. sur la route, des infectés sortent des épaves au passage du premier pilote (pas avant : rien ne se charge à vide) ;
//  4. arrivée dans l'enceinte de Coconi ; fin quand tous les inscrits sont arrivés, ou au bout de 40 min de course.
// Score : 1000 pour le premier arrivé, puis 20 de moins par place ; les non-arrivés : 100 par point de passage validé.
var RALLYE = {
  grilleSec: 240,
  rayonGrille: 45,
  carburant: 3000,      // mB laissés dans chaque réservoir au départ (1 bidon)
  rayonPoint: 32,
  points: [
    ['Porte RN1 de Longoni', 2487, -2940],
    ['Station Total', 2770, -575],
    ['Péage de Bacar', 1615, -49],
    ['Camp de la RN1', 1047, -40],
    ['Refuge de Coconi', -990, -935]
  ],
  coconi: [-1120, -1100, -860, -770], // enceinte de Coconi (x1, z1, x2, z2) : l'arrivée
  embuscades: [1, 2, 3],              // points où des infectés attendent
  infectes: ['spore:inf_human', 'spore:inf_human', 'spore:inf_wanderer', 'minecraft:zombie', 'minecraft:husk']
}

function rallyeAuPoint(p, i) {
  var pt = RALLYE.points[i]
  if (i == RALLYE.points.length - 1) {
    var c = RALLYE.coconi
    return p.x >= c[0] && p.x <= c[2] && p.z >= c[1] && p.z <= c[3]
  }
  var dx = p.x - pt[1], dz = p.z - pt[2]
  return dx * dx + dz * dz <= RALLYE.rayonPoint * RALLYE.rayonPoint
}

function rallyeVehicule(p) {
  if (atheriaLiveFaux(p)) return true
  return typeof atheriaDidaVhMonte === 'function' && atheriaDidaVhMonte(p) != null
}

// réservoir mis à la quantité du départ (ni plus ni moins)
function rallyeCarburant(server, x, z) {
  try {
    var WW = Java.loadClass('mcinterface1211.WrapperWorld')
    var Phys = Java.loadClass('minecrafttransportsimulator.entities.instances.EntityVehicleF_Physics')
    var l = WW.getWrapperFor(server.overworld()).getEntitiesExtendingType(Phys), n = 0
    for (var i = 0; i < l.size(); i++) {
      var v = l.get(i)
      var dx = v.position.x - x, dz = v.position.z - z
      if (dx * dx + dz * dz > RALLYE.rayonGrille * RALLYE.rayonGrille || v.fuelTank == null) continue
      var niveau = v.fuelTank.getFluidLevel()
      if (niveau > RALLYE.carburant) v.fuelTank.drain(niveau - RALLYE.carburant, true)
      else if (niveau < RALLYE.carburant) v.fuelTank.fill('gasoline', '', RALLYE.carburant - niveau, true)
      n++
    }
    return n
  } catch (e) {
    console.warn('[Atheria rallye] carburant : ' + e)
    return 0
  }
}

function rallyeEmbuscade(ctx, i) {
  var server = ctx.server, level = server.overworld(), pt = RALLYE.points[i], n = 0
  for (var k = 0; k < 7; k++) {
    var ang = Math.random() * Math.PI * 2, dist = 25 + Math.random() * 35
    var x = Math.floor(pt[1] + Math.cos(ang) * dist), z = Math.floor(pt[2] + Math.sin(ang) * dist)
    if (!level.isLoaded(ATHERIA_BP.containing(x, 64, z))) continue
    var m = level.createEntity(RALLYE.infectes[Math.floor(Math.random() * RALLYE.infectes.length)])
    if (!m) continue
    m.setPos(x + 0.5, atheriaHauteur(level, x, z), z + 0.5)
    m.addTag('atheria_live')
    m.addTag(ctx.marque)
    m.setPersistenceRequired()
    m.spawn()
    n++
  }
  return n
}

atheriaLiveDeclarer('rallye', {
  titre: 'Le rallye de la RN1',
  radio: 'semaine',
  annonce: 'Ce soir, course de véhicules sur la RN1, de la Porte RN1 de Longoni au Refuge de Coconi. Venez avec ce qui roule, la PAF prête des carcasses retapées.',
  rappel: 'Rendez-vous à la Porte RN1 de Longoni, en véhicule. Le réservoir sera mis à un bidon pour tout le monde.',
  consigne: 'Grille de départ à la Porte RN1 : 4 minutes pour s\'y garer. Ensuite, station Total, péage de Bacar, camp de la RN1, Coconi.',
  dureeMin: 50,
  objets: [['atheria:pieces_vehicule', 2], ['atheria:bidon_essence', 1]],
  titreGagnant: ['roi_rn1', 'Roi de la RN1'],
  surPlace: (ctx, p) => ctx.inscrit(p),
  debut: ctx => {
    ctx.d.phase = 'grille'
    ctx.d.points = {}   // joueur -> prochain point (1 = station Total)
    ctx.d.arrivees = []
    ctx.d.premiers = {}
    ctx.d.embusques = {}
    if (typeof REPERES !== 'undefined') RALLYE.points.forEach((pt, i) => {
      if (i) REPERES['rallye_' + i] = { nom: 'Rallye ' + i + ' : ' + pt[0], ini: '' + i, x: pt[1], y: 70, z: pt[2], couleur: 6 }
    })
  },
  seconde: (ctx, s) => {
    var d = ctx.d, depart = RALLYE.points[0]
    if (d.phase == 'grille') {
      ctx.joueurs().forEach(p => {
        if (ctx.inscrit(p) || !rallyeAuPoint(p, 0)) return
        ctx.inscrire(p)
        d.points[p.username] = 1
        if (!atheriaLiveFaux(p) && typeof atheriaRepere === 'function') for (var i = 1; i < RALLYE.points.length; i++) atheriaRepere(p, 'rallye_' + i)
        ctx.action(p, 'minecraft:oak_sign', 'Inscrit au rallye. Départ dans ' + Math.max(0, RALLYE.grilleSec - s) + ' s.', 'vert')
      })
      var reste = RALLYE.grilleSec - s
      if (reste == 60) ctx.radio('Plus qu\'une minute pour rejoindre la grille à la Porte RN1.', 'Rallye :')
      if (reste <= 3 && reste > 0) ctx.banniere('evenement', 'Rallye de la RN1', String(reste), 'Moteurs !', ctx.joueurs().filter(p => ctx.inscrit(p)))
      if (reste <= 0) {
        d.phase = 'course'
        d.depart = s
        var n = rallyeCarburant(ctx.server, depart[1], depart[2])
        ctx.banniere('evenement', 'Rallye de la RN1', 'Partez !', 'Premier point : la station Total. Un bidon vous y attend.', ctx.joueurs().filter(p => ctx.inscrit(p)))
        ctx.radio(ctx.etat.inscrits.length + (ctx.etat.inscrits.length > 1 ? ' pilotes' : ' pilote') + ' au départ, ' + n + (n > 1 ? ' véhicules' : ' véhicule') + ' sur la grille. C\'est parti !', 'Rallye :')
        if (!ctx.etat.inscrits.length) ctx.terminer()
      }
      return
    }
    // course
    ctx.joueurs().forEach(p => {
      var k = p.username, i = d.points[k]
      if (!i || i >= RALLYE.points.length || !rallyeAuPoint(p, i) || !rallyeVehicule(p)) return
      var pt = RALLYE.points[i]
      d.points[k] = i + 1
      var temps = s - d.depart, mn = Math.floor(temps / 60), sec = temps % 60
      var chrono = mn + ' min ' + (sec < 10 ? '0' : '') + sec
      if (i == RALLYE.points.length - 1) {
        d.arrivees.push(k)
        var place = d.arrivees.length
        ctx.fixerScore(p, 1000 - 20 * (place - 1))
        ctx.banniere('quete', 'Rallye de la RN1', place == 1 ? 'Vainqueur !' : place + 'e place', 'Arrivé à Coconi en ' + chrono + '.', [p])
        ctx.radio(k + ' arrive à Coconi, ' + (place == 1 ? 'premier' : place + 'e') + ', en ' + chrono + '.', 'Rallye :')
      } else {
        ctx.fixerScore(p, 100 * i)
        ctx.action(p, 'minecraft:oak_sign', 'Point ' + i + '/' + (RALLYE.points.length - 1) + ' : ' + pt[0] + ' (' + chrono + ')', 'vert', i / (RALLYE.points.length - 1))
        if (i == 1 && !atheriaLiveFaux(p)) ctx.server.runCommandSilent('give ' + k + ' atheria:bidon_essence 1')
        if (!d.premiers[i]) {
          d.premiers[i] = k
          ctx.radio(k + ' passe le premier à ' + pt[0] + ' en ' + chrono + '.', 'Rallye :')
        }
      }
    })
    // embuscades : quand le premier pilote approche d'un point (moins de 200 blocs), une fois
    RALLYE.embuscades.forEach(i => {
      if (d.embusques[i]) return
      var pt = RALLYE.points[i], proche = false
      ctx.joueurs().forEach(p => { if (ctx.inscrit(p) && (p.x - pt[1]) * (p.x - pt[1]) + (p.z - pt[2]) * (p.z - pt[2]) < 200 * 200) proche = true })
      if (proche) { d.embusques[i] = true; rallyeEmbuscade(ctx, i) }
    })
    if (d.arrivees.length && d.arrivees.length >= ctx.etat.inscrits.length) ctx.terminer()
    if (s - d.depart >= 40 * 60) ctx.terminer()
  },
  fin: ctx => {
    ctx.server.getAllLevels().forEach(level => level.getEntities().forEach(m => { if (m.tags.contains('atheria_live')) m.discard() }))
  }
})
