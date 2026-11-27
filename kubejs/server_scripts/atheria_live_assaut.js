// Atheria - soirée live « L'assaut de Majicavo » (dimanche 10/1, 21 h Paris ; doc « Soirées live d'Atheria »).
// Les Coupeurs détiennent Soilihi, infirmier du CHM, dans le bloc des cellules de la prison de Majicavo. Toutes les
// alliances attaquent ensemble pour le libérer, puis le ramènent à la camionnette de la PAF, aux abords de Longoni.
// Déroulé (/live assaut start) :
//  1. annonce radio 30 min avant ; à l'heure, 4 minutes de rassemblement à la Porte RN1 de Longoni (inscription) ;
//  2. assaut : la prison et le camp des Coupeurs se remplissent de défenseurs quand le premier inscrit approche ;
//     trois renforts arrivent par le camp nord tant que des inscrits sont dans le territoire ;
//  3. quand les deux tiers des défenseurs sont tombés (ou au bout de 10 minutes d'assaut), la porte de la cellule s'ouvre :
//     Soilihi suit le premier joueur qui l'approche ; Vinicius sort alors avec sa garde rapprochée ;
//  4. escorte jusqu'à la camionnette de la PAF ; si Soilihi meurt, la soirée est perdue (les points restent acquis).
// Score : 15 par Coupeur abattu, 100 pour qui libère Soilihi, 150 pour qui abat Vinicius, 150 à chaque inscrit
// à moins de 64 blocs quand Soilihi arrive à la camionnette.
var ASSAUT = {
  rassemblementSec: 240,
  depart: ['Porte RN1 de Longoni', 2487, -2940], rayonDepart: 45,
  prison: [2316, -2077],
  // territoire des Coupeurs : enceinte de la prison et camp nord (refonte du 27/11)
  territoire: [[2222, -2215, 2356, -2141], [2255, -2140, 2380, -2014]],
  rayonApproche: 120,
  cellule: [2300, 73, -2073],
  camionnette: ['camionnette de la PAF', 2320, 71, -2623], rayonArrivee: 8,
  // points praticables (fil de la carte, gel 39504) : [x, y, z]
  defense: [[2337, 68, -2045], [2268, 66, -2064], [2302, 66, -2016], [2335, 68, -2138], [2377, 67, -2111], [2307, 67, -2097],
    [2255, 65, -2016], [2377, 67, -2016], [2302, 73, -2064], [2353, 67, -2101], [2313, 67, -2050], [2276, 73, -2073],
    [2268, 66, -2035], [2292, 67, -2073], [2317, 86, -2113], [2326, 74, -2113], [2367, 68, -2044]],
  camp: [[2286, 67, -2169], [2222, 67, -2159], [2311, 68, -2154], [2312, 68, -2213], [2257, 67, -2144], [2284, 67, -2143],
    [2343, 67, -2167], [2222, 67, -2215], [2355, 66, -2185], [2248, 67, -2109], [2230, 67, -2124]],
  cour: [2337, 68, -2045],
  defenseurs: 8, parJoueur: 2, maxDefenseurs: 24,
  renforts: 3, renfortSec: 90, renfortTaille: 4,
  ouvertureSec: 600, partOuverture: 0.66,
  rayonSuivi: 4, rayonPerdu: 40, perduSec: 15, bloqueSec: 8,
  points: { coupeur: 15, liberer: 100, vinicius: 150, escorte: 150 },
  rayonEscorte: 64,
  dureeMin: 55
}

function assautDans(x, z) {
  return ASSAUT.territoire.some(r => x >= r[0] && x <= r[2] && z >= r[1] && z <= r[3])
}

function assautCoupeur(ctx, pt, stade, i, boss) {
  if (typeof atheriaCoupeursSnbt !== 'function') return
  var snbt = atheriaCoupeursSnbt(stade, i, 'live').replace('Tags:["atheria_coupeur",', 'Tags:["atheria_live","' + ctx.marque + '","atheria_assaut","atheria_coupeur",')
  if (boss) {
    snbt = snbt.replace(/CustomName:'[^']*'/, 'CustomName:\'{"text":"Vinicius","color":"#E03A2E"}\'')
      .replace(/Texture:"[^"]*"/, 'Texture:"atheria:textures/entity/pnj/vinicius.png"')
      .replace(/generic\.max_health",base:[0-9.]+d/, 'generic.max_health",base:150.0d').replace(/Health:[0-9.]+f/, 'Health:150.0f')
      .replace('"atheria_assaut"', '"atheria_assaut","atheria_vinicius"')
      .replace(/HandItems:\[[^\]]*\]/, 'HandItems:[{id:"tacz:modern_kinetic_gun",count:1,components:{"minecraft:custom_data":{GunId:"tacz:glock_17",GunCurrentAmmoCount:17}}},{}]')
      .replace('{Type:"MELEE_ATTACK",Prio:2,SpeedModifier:1.15d}', '{Type:"GUN_ATTACK",Prio:2,SpeedModifier:1.0d,AttackInterval:24,AttackRadius:18.0f}')
  }
  ctx.server.runCommandSilent('execute in minecraft:overworld positioned ' + (pt[0] + 0.5) + ' ' + pt[1] + ' ' + (pt[2] + 0.5) + ' summon easy_npc:humanoid run data merge entity @s ' + snbt)
}

function assautPrisonnierSnbt(ctx) {
  return '{EasyNPCVersion:3,PersistenceRequired:1b,CustomName:\'{"text":"Soilihi","color":"#8FD3E8"}\',CustomNameVisible:1b,' +
    'Tags:["atheria_live","' + ctx.marque + '","atheria_otage"],' +
    'EntityAttribute:{IsAttackableByPlayers:0b,IsAttackableByMonsters:1b,IsAttackableByFactions:1b,IsInvulnerable:0b,IsKnockbackResistant:0b,IsExplosionResistant:0b,HealthRegeneration:0.0d},' +
    'VariantType:"STEVE",SkinData:{Type:"RESOURCE_LOCATION",Texture:"atheria:textures/entity/habitants/habitant_46_soudeur.png"},' +
    'attributes:[{id:"minecraft:generic.max_health",base:40.0d},{id:"minecraft:generic.movement_speed",base:0.32d},{id:"minecraft:generic.follow_range",base:48.0d}],Health:40.0f,' +
    'ObjectiveData:{ObjectiveDataSet:[{Type:"FLOAT",Prio:0},{Type:"OPEN_DOOR",Prio:1},{Type:"LOOK_AT_PLAYER",Prio:7}]}}'
}

function assautEntites(ctx, tag) {
  var l = []
  ctx.server.overworld().getEntities().forEach(m => { if (m.tags.contains(tag) && m.tags.contains(ctx.marque) && m.isAlive()) l.push(m) })
  return l
}

// ouvre les portes en fer autour de la cellule
function assautOuvrirCellule(level) {
  var c = ASSAUT.cellule, n = 0
  for (var x = c[0] - 5; x <= c[0] + 5; x++) for (var y = c[1] - 1; y <= c[1] + 2; y++) for (var z = c[2] - 4; z <= c[2] + 4; z++) {
    var b = level.getBlock(x, y, z)
    // portes de cellule : createdeco:locked_industrial_iron_door sur la carte (toute porte convient)
    if (String(b.id).indexOf('door') < 0 || !b.properties.containsKey('open')) continue
    var pr = {}, src = b.properties
    src.keySet().forEach(k => { pr['' + k] = '' + src.get(k) })
    pr.open = 'true'
    b.set(b.id, pr)
    n++
  }
  return n
}

atheriaLiveDeclarer('assaut', {
  titre: 'L\'assaut de Majicavo',
  radio: 'semaine',
  annonce: 'La PAF demande du renfort : les Coupeurs détiennent Soilihi, un infirmier du CHM, à la prison de Majicavo. Rassemblement ce soir à la Porte RN1.',
  rappel: 'Rendez-vous à la Porte RN1 de Longoni. Venez armés et soignés : la prison est pleine.',
  consigne: 'Rassemblement à la Porte RN1 : 4 minutes. Prenez la prison, libérez Soilihi, ramenez-le à la camionnette de la PAF.',
  dureeMin: ASSAUT.dureeMin,
  objets: [['atheria:trousse_soins', 2], ['atheria:ration', 2]],
  titreGagnant: ['liberateur', 'Libérateur de Majicavo'],
  surPlace: (ctx, p) => ctx.inscrit(p),
  debut: ctx => {
    var d = ctx.d
    d.phase = 'rassemblement'
    d.abattus = 0; d.defenseurs = 0; d.renforts = 0; d.renfortDernier = 0
    d.suit = ''; d.loin = 0
  },
  seconde: (ctx, s) => {
    var d = ctx.d, level = ctx.server.overworld(), joueurs = ctx.joueurs()
    if (d.phase == 'rassemblement') {
      joueurs.forEach(p => {
        if (ctx.inscrit(p)) return
        var dx = p.x - ASSAUT.depart[1], dz = p.z - ASSAUT.depart[2]
        if (dx * dx + dz * dz > ASSAUT.rayonDepart * ASSAUT.rayonDepart) return
        ctx.inscrire(p)
        ctx.action(p, 'minecraft:iron_sword', 'Inscrit pour l\'assaut. Départ dans ' + Math.max(0, ASSAUT.rassemblementSec - s) + ' s.', 'vert')
      })
      var reste = ASSAUT.rassemblementSec - s
      if (reste == 60) ctx.radio('Plus qu\'une minute pour rejoindre la colonne à la Porte RN1.', 'PAF :')
      if (reste > 0) return
      var inscrits = joueurs.filter(p => ctx.inscrit(p))
      if (!inscrits.length) { ctx.radio('Personne pour l\'assaut. Soilihi attendra.', 'PAF :'); ctx.terminer(); return }
      d.phase = 'approche'; d.depart = s
      if (typeof REPERES !== 'undefined') {
        REPERES['assaut_prison'] = { nom: 'Assaut : prison de Majicavo', ini: '!', x: ASSAUT.prison[0], y: 70, z: ASSAUT.prison[1], couleur: 12 }
        REPERES['assaut_camionnette'] = { nom: 'Assaut : ' + ASSAUT.camionnette[0], ini: 'P', x: ASSAUT.camionnette[1], y: ASSAUT.camionnette[2], z: ASSAUT.camionnette[3], couleur: 9 }
      }
      inscrits.forEach(p => { if (!atheriaLiveFaux(p) && typeof atheriaRepere === 'function') { atheriaRepere(p, 'assaut_prison'); atheriaRepere(p, 'assaut_camionnette') } })
      ctx.banniere('evenement', 'L\'assaut de Majicavo', 'En avant', 'Prenez la prison par le camp nord. Soilihi est au bloc des cellules.', inscrits)
      ctx.radio('La colonne part : ' + inscrits.length + (inscrits.length > 1 ? ' volontaires' : ' volontaire') + '. Les Coupeurs savent que vous venez.', 'PAF :')
      return
    }
    var inscritsEnLigne = joueurs.filter(p => ctx.inscrit(p) && !atheriaLiveFaux(p))
    if (d.phase == 'approche') {
      // la défense se met en place quand le premier inscrit arrive (rien ne se charge à vide)
      var proche = inscritsEnLigne.some(p => (p.x - ASSAUT.prison[0]) * (p.x - ASSAUT.prison[0]) + (p.z - ASSAUT.prison[1]) * (p.z - ASSAUT.prison[1]) < ASSAUT.rayonApproche * ASSAUT.rayonApproche)
      if (!proche && !joueurs.some(p => atheriaLiveFaux(p) && assautDans(p.x, p.z))) return
      var n = Math.min(ASSAUT.maxDefenseurs, ASSAUT.defenseurs + ASSAUT.parJoueur * ctx.etat.inscrits.length)
      var pts = ASSAUT.defense.concat(ASSAUT.camp).sort(() => Math.random() - 0.5)
      for (var i = 0; i < n; i++) assautCoupeur(ctx, pts[i % pts.length], 4, i, false)
      d.defenseurs = n; d.phase = 'assaut'; d.assaut = s; d.renfortDernier = s
      ctx.server.runCommandSilent('playsound minecraft:event.raid.horn hostile @a ' + ASSAUT.prison[0] + ' 70 ' + ASSAUT.prison[1] + ' 4 0.9')
      ctx.radio('Ils vous ont vus. ' + n + ' Coupeurs dans la prison et le camp.', 'PAF :')
      return
    }
    // renforts par le camp nord tant que des inscrits sont dans le territoire
    if ((d.phase == 'assaut' || d.phase == 'escorte') && d.renforts < ASSAUT.renforts && s - d.renfortDernier >= ASSAUT.renfortSec &&
      inscritsEnLigne.some(p => assautDans(p.x, p.z))) {
      d.renforts++; d.renfortDernier = s
      var m = ASSAUT.renfortTaille + Math.floor(ctx.etat.inscrits.length / 2)
      for (var j = 0; j < m; j++) assautCoupeur(ctx, ASSAUT.camp[Math.floor(Math.random() * ASSAUT.camp.length)], 4, j, false)
      d.defenseurs += m
      ctx.radio('Renforts des Coupeurs par le camp nord : ' + m + ' de plus.', 'PAF :')
    }
    if (d.phase == 'assaut') {
      if (d.abattus < d.defenseurs * ASSAUT.partOuverture && s - d.assaut < ASSAUT.ouvertureSec) return
      var portes = assautOuvrirCellule(level)
      var c = ASSAUT.cellule
      ctx.server.runCommandSilent('execute in minecraft:overworld positioned ' + (c[0] + 0.5) + ' ' + c[1] + ' ' + (c[2] + 0.5) + ' summon easy_npc:humanoid run data merge entity @s ' + assautPrisonnierSnbt(ctx))
      d.phase = 'cellule'
      ctx.radio('La cellule est ouverte (' + portes + (portes > 1 ? ' portes' : ' porte') + '). Soilihi est au premier étage du bloc des cellules. Allez le chercher.', 'PAF :')
      return
    }
    var otage = assautEntites(ctx, 'atheria_otage')[0]
    if (!otage) {
      ctx.radio('Soilihi est tombé. Il n\'y aura pas de deuxième essai. Repliez-vous.', 'PAF :')
      d.echec = true
      ctx.terminer()
      return
    }
    if (d.phase == 'cellule') {
      var lib = inscritsEnLigne.filter(p => p.distanceTo(otage) <= ASSAUT.rayonSuivi)[0]
      if (!lib) return
      d.suit = lib.username; d.phase = 'escorte'; d.loin = 0
      ctx.score(lib, ASSAUT.points.liberer)
      ctx.action(lib, 'minecraft:lead', 'Soilihi te suit. Ramène-le à la camionnette de la PAF, aux abords de Longoni.', 'vert')
      ctx.radio(lib.username + ' a sorti Soilihi de sa cellule. Vinicius arrive avec sa garde.', 'PAF :')
      // Vinicius et sa garde rapprochée, dans la cour
      assautCoupeur(ctx, ASSAUT.cour, 5, 0, true)
      for (var g = 0; g < 4; g++) assautCoupeur(ctx, ASSAUT.defense[g], 5, g + 1, false)
      d.defenseurs += 4
      ctx.server.runCommandSilent('playsound minecraft:entity.pillager.celebrate hostile @a ' + ASSAUT.cour[0] + ' ' + ASSAUT.cour[1] + ' ' + ASSAUT.cour[2] + ' 3 0.7')
      return
    }
    // escorte
    var chef = d.suit ? ctx.trouver(d.suit) : null
    if (!chef || atheriaLiveFaux(chef)) {
      d.suit = ''
      var nouveau = inscritsEnLigne.filter(p => p.distanceTo(otage) <= ASSAUT.rayonSuivi)[0]
      if (nouveau) { d.suit = nouveau.username; ctx.action(nouveau, 'minecraft:lead', 'Soilihi te suit maintenant.', 'vert') }
    } else if (otage.distanceTo(chef) > ASSAUT.rayonPerdu) {
      if (++d.loin >= ASSAUT.perduSec) { ctx.action(chef, 'minecraft:lead', 'Soilihi ne te voit plus. Il attend là où tu l\'as laissé.', 'rouge'); d.suit = '' }
    } else {
      d.loin = 0
      var dist = otage.distanceTo(chef)
      if (dist > 3) otage.getNavigation().moveTo(chef, 1.25)
      // coincé (les rambardes de la passerelle des cellules bloquent son chemin) : s'il ne se rapproche plus
      // pendant 8 s, il rejoint le joueur, à sa place exacte (derrière lui, ce pourrait être le vide)
      if (dist > 4 && dist > (d.distPrec || 0) - 0.5) d.bloque = (d.bloque || 0) + 1
      else d.bloque = 0
      d.distPrec = dist
      if (d.bloque >= ASSAUT.bloqueSec && chef.onGround() && !chef.isPassenger()) {
        otage.teleportTo(chef.x, chef.y, chef.z)
        d.bloque = 0; d.distPrec = 0
      }
    }
    var ca = ASSAUT.camionnette, dx = otage.x - ca[1], dz = otage.z - ca[3]
    if (dx * dx + dz * dz <= ASSAUT.rayonArrivee * ASSAUT.rayonArrivee) {
      var presents = inscritsEnLigne.filter(p => p.distanceTo(otage) <= ASSAUT.rayonEscorte)
      presents.forEach(p => ctx.score(p, ASSAUT.points.escorte))
      otage.discard()
      d.reussi = true
      ctx.banniere('quete', 'L\'assaut de Majicavo', 'Soilihi est sauf', 'Il remonte dans la camionnette de la PAF. Le CHM a de nouveau un infirmier.', presents)
      ctx.radio('Soilihi est à la camionnette. Merci à ' + presents.map(p => p.username).join(', ') + '. La prison de Majicavo s\'en souviendra.', 'PAF :')
      ctx.terminer()
    }
  },
  fin: ctx => {
    ctx.server.getAllLevels().forEach(level => level.getEntities().forEach(m => { if (m.tags.contains('atheria_live')) m.discard() }))
  }
})

// Coupeur de l'assaut abattu par un joueur ; Vinicius a sa réplique (script, « Mort de Vinicius si combat »)
EntityEvents.death('easy_npc:humanoid', event => {
  var m = event.entity
  if (!m.tags.contains('atheria_assaut')) return
  var server = m.server, e = atheriaLiveEtat(server)
  if (!e || e.nom != 'assaut' || e.phase != 'encours' || !m.tags.contains(atheriaLiveCtx(server, e).marque)) return
  var ctx = atheriaLiveCtx(server, e), src = event.source, p = src ? src.actual : null
  ctx.d.abattus++
  if (p && p.isPlayer()) {
    ctx.inscrire(p)
    ctx.score(p, m.tags.contains('atheria_vinicius') ? ASSAUT.points.vinicius : ASSAUT.points.coupeur)
  }
  if (m.tags.contains('atheria_vinicius')) ctx.radio('Vinicius regarde ses mains : « Même ici, ils me l\'enlèvent. »', 'PAF :')
  atheriaLiveEcrire(server, e)
})
