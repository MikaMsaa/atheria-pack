// Atheria - soirée live « Le convoi de la PAF » (dimanche 27/12, 21 h Paris ; doc « Soirées live d'Atheria »).
// La PAF envoie des caisses de médicaments de Longoni au CHM de Mamoudzou, par la RN1 et Majicavo, le territoire des Coupeurs.
// Déroulé (/live convoi start) :
//  1. annonce radio 30 min avant ; à l'heure, 3 minutes de rassemblement à la Porte RN1 : tout joueur à moins de 45 blocs
//     est inscrit comme escorte ; au départ, la PAF remet les caisses (une par escorte, de 2 à 8) ;
//  2. une caisse se porte dans l'inventaire, à pied ou en véhicule ; son porteur brille (on le voit de loin), avance moins vite
//     à pied, et perd sa protection de débutant tant qu'il la porte ; s'il meurt ou se déconnecte, la caisse tombe au sol,
//     brillante, et n'importe qui peut la ramasser ; une caisse rangée dans un coffre ressort au sol, à la place du porteur ;
//  3. trois fois sur la route, des Coupeurs sortent des fourrés devant le porteur de tête ; toutes les 4 minutes, la radio
//     donne la position approximative des caisses (à 100 blocs près) ;
//  4. livrer au CHM (parvis de l'entrée principale ou voie des ambulances) : 12 bons par caisse au porteur, 4 bons à chaque escorte à moins de 64 blocs ; c'est ce qui compte au score ;
//     trahir : revendre une caisse aux Coupeurs, dans l'enceinte de la prison de Majicavo, paie 25 bons, mais ne compte pas
//     au score, et la radio dit qui l'a fait ;
//  5. fin quand toutes les caisses sont livrées, vendues ou perdues, ou au bout de 45 min ; les caisses restantes disparaissent.
// Score : 100 par caisse livrée par soi, 40 par caisse livrée en escorte.
var CONVOI = {
  rassemblementSec: 180,
  depart: ['Porte RN1 de Longoni', 2487, -2940],
  rayonDepart: 45,
  chm: ['CHM de Mamoudzou', 2907, -1300],  // portes principales du grand CHM (Mamoudzou nord, version du 27/11)
  // livraison : le parvis nord et la voie des ambulances le long de la façade ouest (x1, z1, x2, z2)
  livraison: [[2853, -1304, 2951, -1297], [2853, -1304, 2869, -1239]],
  prison: [2255, -2138, 2377, -2016],   // enceinte de la prison de Majicavo (x1, z1, x2, z2) : les Coupeurs rachètent
  caissesMin: 2, caissesMax: 8,
  bonsLivraison: 12, bonsEscorte: 4, rayonEscorte: 64,
  bonsTrahison: 25,
  pointsLivraison: 100, pointsEscorte: 40,
  embuscades: [0.25, 0.5, 0.75],      // part du trajet faite par le porteur de tête
  coupeurs: 3,                        // + 1 par tranche de 2 escortes, 7 au plus (6 tuent un porteur seul en quelques secondes)
  radioSec: 240,
  perduSec: 5,                        // une caisse introuvable (rangée) ressort au sol après 5 s
  dureeCourseMin: 45
}

var CONVOI_DC = Java.loadClass('net.minecraft.core.component.DataComponents')

function convoiNumero(st) {
  if (st == null || st.isEmpty() || String(st.getId()) != 'atheria:caisse_paf') return -1
  var cd = st.get(CONVOI_DC.CUSTOM_DATA)
  return cd ? cd.copyTag().getInt('atheria_caisse') : 0
}

function convoiDans(p, pt, r) {
  var dx = p.x - pt[1], dz = p.z - pt[2]
  return dx * dx + dz * dz <= r * r
}

function convoiAuChm(p) {
  return CONVOI.livraison.some(c => p.x >= c[0] && p.x <= c[2] + 1 && p.z >= c[1] && p.z <= c[3] + 1)
}

function convoiPrison(p) {
  var c = CONVOI.prison
  return p.x >= c[0] && p.x <= c[2] && p.z >= c[1] && p.z <= c[3]
}

// part du trajet faite (0 au départ, 1 au CHM), à vol d'oiseau
function convoiAvance(x, z) {
  var a = CONVOI.depart, b = CONVOI.chm
  var total = Math.sqrt((b[1] - a[1]) * (b[1] - a[1]) + (b[2] - a[2]) * (b[2] - a[2]))
  var reste = Math.sqrt((b[1] - x) * (b[1] - x) + (b[2] - z) * (b[2] - z))
  return Math.max(0, Math.min(1, 1 - reste / total))
}

function convoiActive(c) {
  return c.etat == 'porte' || c.etat == 'sol'
}

// pose une caisse au sol : brillante, sans fin de vie, impossible à détruire
function convoiPoser(ctx, n, x, y, z) {
  var server = ctx.server
  server.runCommandSilent('execute in minecraft:overworld run summon item ' + x + ' ' + (y + 0.5) + ' ' + z +
    ' {Item:{id:"atheria:caisse_paf",count:1,components:{"minecraft:custom_data":{atheria_caisse:' + n + '}}},' +
    'Age:-32768,PickupDelay:20,Glowing:1b,Invulnerable:1b,Tags:["atheria_live","' + ctx.marque + '","atheria_caisse"]}')
}

// retire les caisses d'un joueur (mort, déconnexion) et les pose à ses pieds
function convoiLacher(ctx, p, raison) {
  var d = ctx.d, lachees = []
  if (atheriaLiveFaux(p)) {
    for (var k in d.caisses) if (d.caisses[k].qui == p.username && d.caisses[k].etat == 'porte') lachees.push(+k)
  } else {
    var inv = p.inventory
    for (var i = 0; i < inv.getContainerSize(); i++) {
      var n = convoiNumero(inv.getItem(i))
      if (n < 0) continue
      inv.getItem(i).setCount(0)
      if (d.caisses[n] && convoiActive(d.caisses[n]) && lachees.indexOf(n) < 0) lachees.push(n)
    }
    p.removeTag('atheria_caisse_portee')
  }
  lachees.forEach(n => {
    var c = d.caisses[n]
    c.etat = 'sol'; c.qui = ''; c.x = p.x; c.z = p.z; c.y = p.y; c.vu = ctx.secondes
    if (!atheriaLiveFaux(p)) convoiPoser(ctx, n, p.x, p.y, p.z)
  })
  if (lachees.length) ctx.radio(p.username + (raison == 'mort' ? ' est tombé' : ' a disparu') + ' avec ' +
    (lachees.length > 1 ? lachees.length + ' caisses' : 'une caisse') + '. Elle est au sol, à qui la ramasse.', 'Convoi :')
  return lachees.length
}

function convoiCoupeurs(ctx, p) {
  if (atheriaLiveFaux(p) || typeof atheriaCoupeursSnbt !== 'function') return 0
  var n = Math.min(7, CONVOI.coupeurs + Math.floor(ctx.etat.inscrits.length / 2)), faits = 0, stade = 3
  var yaw = p.yRot * Math.PI / 180
  // hauteur de référence : le sol sous le porteur (il peut être en véhicule, sur un pont, dans l'eau)
  var ref = atheriaCoupeursSol(p.level, Math.floor(p.x), Math.floor(p.z))
  if (ref == null) ref = p.y
  for (var essai = 0; essai < 64 && faits < n; essai++) {
    // devant le porteur et sur les côtés, à 18-30 blocs : ils barrent la route
    var a = yaw + (Math.random() - 0.5) * 2.4, dist = 18 + Math.random() * 12
    var x = Math.floor(p.x - Math.sin(a) * dist), z = Math.floor(p.z + Math.cos(a) * dist)
    var y = atheriaCoupeursSol(p.level, x, z)
    if (y == null || Math.abs(y - ref) > 10) continue
    var snbt = atheriaCoupeursSnbt(stade, faits, p.username).replace('Tags:["atheria_coupeur",', 'Tags:["atheria_live","' + ctx.marque + '","atheria_coupeur",')
    ctx.server.runCommandSilent('execute in minecraft:overworld positioned ' + (x + 0.5) + ' ' + y + ' ' + (z + 0.5) + ' summon easy_npc:humanoid run data merge entity @s ' + snbt)
    faits++
  }
  if (faits) {
    p.persistentData.putLong('atheria_coupeurs_fin', Date.now() + 6 * 60 * 1000)
    ctx.server.runCommandSilent('playsound minecraft:entity.pillager.celebrate hostile @a ' + p.x + ' ' + p.y + ' ' + p.z + ' 2 0.8')
  }
  return faits
}

function convoiLivrer(ctx, p, n) {
  var c = ctx.d.caisses[n]
  c.etat = 'livree'; c.qui = p.username
  ctx.d.livrees++
  ctx.score(p, CONVOI.pointsLivraison)
  if (!atheriaLiveFaux(p)) ctx.server.runCommandSilent('give ' + p.username + ' atheria:bon_caf ' + CONVOI.bonsLivraison)
  var escortes = []
  ctx.joueurs().forEach(q => {
    if (q.username == p.username || !ctx.inscrit(q)) return
    var dx = q.x - p.x, dz = q.z - p.z
    if (dx * dx + dz * dz > CONVOI.rayonEscorte * CONVOI.rayonEscorte) return
    escortes.push(q.username)
    ctx.score(q, CONVOI.pointsEscorte)
    if (!atheriaLiveFaux(q)) {
      ctx.server.runCommandSilent('give ' + q.username + ' atheria:bon_caf ' + CONVOI.bonsEscorte)
      ctx.action(q, 'atheria:caisse_paf', 'Caisse livrée sous ton escorte : ' + CONVOI.bonsEscorte + ' bons.', 'vert')
    }
  })
  ctx.banniere('quete', 'Convoi de la PAF', 'Caisse livrée', CONVOI.bonsLivraison + ' bons CAF. Le CHM tiendra une semaine de plus.', [p])
  ctx.radio(p.username + ' livre une caisse au CHM' + (escortes.length ? ', escorté par ' + escortes.join(', ') : '') + '. ' +
    ctx.d.livrees + ' sur ' + ctx.d.total + ' arrivées.', 'Convoi :')
}

function convoiVendre(ctx, p, n) {
  var c = ctx.d.caisses[n]
  c.etat = 'vendue'; c.qui = p.username
  ctx.d.vendues++
  if (!atheriaLiveFaux(p)) ctx.server.runCommandSilent('give ' + p.username + ' atheria:bon_caf ' + CONVOI.bonsTrahison)
  ctx.action(p, 'atheria:bon_caf', 'Les Coupeurs paient ' + CONVOI.bonsTrahison + ' bons. Ils se souviendront de ton visage, la PAF aussi.', 'ambre')
  ctx.radio('Une caisse de médicaments a été revendue aux Coupeurs de Majicavo. Le vendeur : ' + p.username + '.', 'Convoi :')
}

function convoiLieu(x, z) {
  return 'vers x ' + Math.round(x / 100) * 100 + ', z ' + Math.round(z / 100) * 100
}

atheriaLiveDeclarer('convoi', {
  titre: 'Le convoi de la PAF',
  radio: 'semaine',
  annonce: 'Ce soir, la PAF envoie des médicaments de Longoni au CHM de Mamoudzou, par Majicavo. Elle paie les escortes à l\'arrivée.',
  rappel: 'Rendez-vous à la Porte RN1 de Longoni. Les Coupeurs savent que le convoi part ce soir.',
  consigne: 'Rassemblement à la Porte RN1 : 3 minutes. Une caisse par escorte. Qui porte une caisse brille et peut être attaqué.',
  dureeMin: 50,
  objets: [['atheria:trousse_soins', 2], ['atheria:ration', 2]],
  titreGagnant: ['escorte_paf', 'Escorte de la PAF'],
  surPlace: (ctx, p) => ctx.inscrit(p),
  debut: ctx => {
    var d = ctx.d
    d.phase = 'rassemblement'
    d.caisses = {}
    d.total = 0; d.livrees = 0; d.vendues = 0; d.perdues = 0
    d.embusques = {}
    d.radioDerniere = 0
  },
  seconde: (ctx, s) => {
    var d = ctx.d
    if (d.phase == 'rassemblement') {
      ctx.joueurs().forEach(p => {
        if (ctx.inscrit(p) || !convoiDans(p, CONVOI.depart, CONVOI.rayonDepart)) return
        ctx.inscrire(p)
        ctx.action(p, 'atheria:caisse_paf', 'Inscrit comme escorte. Départ dans ' + Math.max(0, CONVOI.rassemblementSec - s) + ' s.', 'vert')
      })
      var reste = CONVOI.rassemblementSec - s
      if (reste == 60) ctx.radio('Plus qu\'une minute pour rejoindre le convoi à la Porte RN1.', 'Convoi :')
      if (reste > 0) return
      d.phase = 'route'
      d.depart = s
      var escortes = ctx.joueurs().filter(p => ctx.inscrit(p))
      if (!escortes.length) { ctx.radio('Personne pour escorter le convoi. La PAF garde ses caisses à Longoni.', 'Convoi :'); ctx.terminer(); return }
      d.total = Math.max(CONVOI.caissesMin, Math.min(CONVOI.caissesMax, escortes.length))
      for (var n = 1; n <= d.total; n++) {
        var p = escortes[(n - 1) % escortes.length]
        d.caisses[n] = { etat: 'porte', qui: p.username, x: p.x, y: p.y, z: p.z, vu: s }
        if (!atheriaLiveFaux(p)) ctx.server.runCommandSilent('give ' + p.username + ' atheria:caisse_paf[minecraft:custom_data={atheria_caisse:' + n + '}] 1')
      }
      if (typeof REPERES !== 'undefined') REPERES['convoi_chm'] = { nom: 'Convoi : ' + CONVOI.chm[0], ini: '+', x: CONVOI.chm[1], y: 66, z: CONVOI.chm[2], couleur: 12 }
      escortes.forEach(p => { if (!atheriaLiveFaux(p) && typeof atheriaRepere === 'function') atheriaRepere(p, 'convoi_chm') })
      ctx.banniere('evenement', 'Convoi de la PAF', 'En route', 'Destination : le CHM de Mamoudzou, par Majicavo. Ne lâchez pas les caisses.', escortes)
      ctx.radio('Le convoi quitte Longoni : ' + d.total + ' caisses, ' + escortes.length + (escortes.length > 1 ? ' escortes' : ' escorte') + '. Bonne route.', 'Convoi :')
      return
    }
    // route : où sont les caisses ?
    var vus = {}
    ctx.joueurs().forEach(p => {
      var porte = 0
      if (atheriaLiveFaux(p)) {
        for (var k in d.caisses) {
          var c0 = d.caisses[k]
          if (c0.etat == 'porte' && c0.qui == p.username) { vus[k] = p; c0.x = p.x; c0.z = p.z; c0.vu = s; porte++ }
        }
      } else {
        var inv = p.inventory
        for (var i = 0; i < inv.getContainerSize(); i++) {
          var st = inv.getItem(i), n2 = convoiNumero(st)
          if (n2 < 0) continue
          var c = d.caisses[n2]
          // caisse d'une autre soirée, déjà livrée ou en double : elle s'efface
          if (!c || !convoiActive(c) || vus[n2]) { st.setCount(0); continue }
          if (st.getCount() > 1) st.setCount(1)
          vus[n2] = p
          if (c.qui != p.username) {
            if (c.etat == 'sol') ctx.action(p, 'atheria:caisse_paf', 'Tu portes une caisse de la PAF : le CHM la paie, les Coupeurs aussi.', 'ambre')
            c.qui = p.username
          }
          c.etat = 'porte'; c.x = p.x; c.y = p.y; c.z = p.z; c.vu = s
          porte++
        }
        if (porte) {
          p.addTag('atheria_caisse_portee')
          ctx.server.runCommandSilent('effect give ' + p.username + ' minecraft:glowing 3 0 true')
          if (!convoiVehicule(p)) ctx.server.runCommandSilent('effect give ' + p.username + ' minecraft:slowness 3 0 true')
        } else p.removeTag('atheria_caisse_portee')
      }
      if (!porte) return
      // livraison ou trahison
      for (var k2 in d.caisses) {
        var c2 = d.caisses[k2]
        if (c2.etat != 'porte' || c2.qui != p.username) continue
        if (convoiAuChm(p)) convoiLivrer(ctx, p, k2)
        else if (convoiPrison(p)) convoiVendre(ctx, p, k2)
        else continue
        if (!atheriaLiveFaux(p)) convoiRetirerUne(p, +k2)
      }
    })
    // au sol
    ctx.server.overworld().getEntities().forEach(en => {
      if (!en.tags.contains('atheria_caisse')) return
      var n3 = convoiNumero(en.getItem ? en.getItem() : null), c3 = d.caisses[n3]
      if (!c3 || !convoiActive(c3) || vus[n3]) { en.discard(); return }
      vus[n3] = 'sol'
      c3.etat = 'sol'; c3.qui = ''; c3.x = en.x; c3.y = en.y; c3.z = en.z; c3.vu = s
    })
    // rangée dans un coffre ou un véhicule : elle ressort au sol, là où on l'a vue
    for (var k3 in d.caisses) {
      var c4 = d.caisses[k3]
      if (!convoiActive(c4) || vus[k3] || s - c4.vu < CONVOI.perduSec) continue
      var ancien = c4.qui ? ctx.trouver(c4.qui) : null
      if (ancien && !atheriaLiveFaux(ancien)) ctx.action(ancien, 'atheria:caisse_paf', 'Une caisse de la PAF ne se range pas : elle reste à vue.', 'rouge')
      c4.etat = 'sol'; c4.qui = ''; c4.vu = s
      convoiPoser(ctx, +k3, c4.x, c4.y, c4.z)
    }
    // embuscades devant le porteur de tête
    var tete = null, avTete = -1
    for (var k4 in d.caisses) {
      var c5 = d.caisses[k4]
      if (c5.etat != 'porte') continue
      var av = convoiAvance(c5.x, c5.z)
      if (av > avTete) { avTete = av; tete = ctx.trouver(c5.qui) }
    }
    // une embuscade à la fois, au moins 60 s d'écart ; si personne n'a pu sortir (eau, falaise), on retente à la seconde suivante
    CONVOI.embuscades.forEach((seuil, i) => {
      if (d.embusques[i] || !tete || avTete < seuil || s - (d.derniereEmbuscade || -999) < 60) return
      if (atheriaLiveFaux(tete)) { d.embusques[i] = true; return }
      var n4 = convoiCoupeurs(ctx, tete)
      if (!n4) return
      d.embusques[i] = true
      d.derniereEmbuscade = s
      d.coupeursSortis = (d.coupeursSortis || 0) + n4
      ctx.banniere('danger', 'Convoi de la PAF', 'Embuscade', 'Les Coupeurs barrent la route devant ' + tete.username + '.', ctx.joueurs().filter(p => ctx.inscrit(p)))
    })
    // nouvelles de la route
    var actives = Object.keys(d.caisses).filter(k => convoiActive(d.caisses[k]))
    if (s - d.radioDerniere >= CONVOI.radioSec && actives.length) {
      d.radioDerniere = s
      var portees = actives.filter(k => d.caisses[k].etat == 'porte'), sol = actives.filter(k => d.caisses[k].etat == 'sol')
      var t = portees.length + (portees.length > 1 ? ' caisses en route' : ' caisse en route')
      if (portees.length) t += ', la plus avancée ' + convoiLieu(d.caisses[portees[0]].x, d.caisses[portees[0]].z)
      if (sol.length) t += '. ' + (sol.length > 1 ? sol.length + ' caisses au sol' : 'Une caisse au sol') + ' ' + convoiLieu(d.caisses[sol[0]].x, d.caisses[sol[0]].z)
      ctx.radio(t + '.', 'Convoi :')
    }
    if (!actives.length) ctx.terminer()
    if (s - d.depart >= CONVOI.dureeCourseMin * 60) ctx.terminer()
  },
  fin: ctx => {
    var d = ctx.d
    ctx.server.players.forEach(p => {
      var inv = p.inventory
      for (var i = 0; i < inv.getContainerSize(); i++) if (convoiNumero(inv.getItem(i)) >= 0) inv.getItem(i).setCount(0)
      p.removeTag('atheria_caisse_portee')
    })
    ctx.server.getAllLevels().forEach(level => level.getEntities().forEach(m => { if (m.tags.contains('atheria_live')) m.discard() }))
    if (d.total) ctx.radio('Fin du convoi : ' + d.livrees + ' caisse(s) livrée(s) au CHM sur ' + d.total + (d.vendues ? ', ' + d.vendues + ' vendue(s) aux Coupeurs' : '') + '.', 'Convoi :')
  }
})

function convoiVehicule(p) {
  return typeof atheriaDidaVhMonte === 'function' && atheriaDidaVhMonte(p) != null
}

function convoiRetirerUne(p, n) {
  var inv = p.inventory
  for (var i = 0; i < inv.getContainerSize(); i++) if (convoiNumero(inv.getItem(i)) == n) { inv.getItem(i).setCount(0); return true }
  return false
}

// mort ou déconnexion d'un porteur : la caisse tombe (avant que la tombe ne ramasse l'inventaire)
EntityEvents.death('minecraft:player', event => {
  var server = event.entity.server, e = atheriaLiveEtat(server)
  if (!e || e.nom != 'convoi' || e.phase != 'encours') return
  var ctx = atheriaLiveCtx(server, e)
  if (convoiLacher(ctx, event.entity, 'mort')) atheriaLiveEcrire(server, e)
})

PlayerEvents.loggedOut(event => {
  var server = event.player.server, e = atheriaLiveEtat(server)
  if (!e || e.nom != 'convoi' || e.phase != 'encours') return
  var ctx = atheriaLiveCtx(server, e)
  if (convoiLacher(ctx, event.player, 'depart')) atheriaLiveEcrire(server, e)
})

// hors soirée, une caisse ne sert à rien : elle s'efface des inventaires (toutes les 5 s)
ServerEvents.tick(event => {
  var server = event.server
  if (server.tickCount % 100 != 37) return
  var e = atheriaLiveEtat(server)
  if (e && e.nom == 'convoi') return
  server.players.forEach(p => {
    var inv = p.inventory
    for (var i = 0; i < inv.getContainerSize(); i++) if (convoiNumero(inv.getItem(i)) >= 0) inv.getItem(i).setCount(0)
    p.removeTag('atheria_caisse_portee')
  })
})
