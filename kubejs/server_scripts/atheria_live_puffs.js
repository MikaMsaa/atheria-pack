// Atheria - soirée live « La chasse aux Puffs » (dimanche 3/1, 21 h Paris ; doc « Soirées live d'Atheria »).
// Eniy a caché cinq Puffs dorés à travers le nord de l'île (un près de Longoni ou de Majicavo, deux à mi-distance,
// deux loin). Ce ne sont pas les dix Puffs de collection (atheria:puff_1 à _10) : ceux-là restent une chasse secrète.
// Déroulé (/live puffs start) :
//  1. annonce radio 30 min avant ; à l'heure, Eniy lit cinq devinettes, une par Puff ;
//  2. toutes les 10 minutes, un indice de plus pour chaque Puff encore caché : le nom du lieu, puis sa position
//     à 50 blocs près, puis à 10 blocs près ;
//  3. un Puff tinte doucement quand on s'en approche (une vingtaine de blocs) ; il se ramasse en marchant dessus ;
//  4. fin quand les cinq sont trouvés, ou au bout d'une heure.
// Score : 100 par Puff trouvé. Chaque Puff trouvé donne le Puff doré d'Eniy (objet de collection) et 5 bons CAF.
var PUFFS = {
  nombre: 5,
  indiceSec: 600,
  rayonApparition: 48, rayonPrise: 2.2,
  bons: 5, points: 100,
  dureeMin: 60,
  // [id, lieu, devinette, distance (0 près, 1 mi-distance, 2 loin), points sûrs [x, y, z] ou rectangle [x1, z1, x2, z2]]
  caches: [
    ['longoni', 'Longoni', 'Le premier dort chez nous, à Longoni, là où l\'on fait la queue pour tout.', 0,
      { points: [[2426, 67, -3031], [2539, 66, -3045], [2630, 64, -3077], [2332, 68, -3081], [2549, 65, -3173], [2365, 66, -3178], [2458, 65, -3224], [2391, 67, -2901], [2627, 68, -2941]] }],
    ['majicavo', 'la prison de Majicavo', 'Chez ceux qui coupent les routes. Je l\'ai échangé contre une cigarette, et je l\'ai regretté.', 0,
      { points: [[2337, 68, -2045], [2268, 66, -2064], [2302, 66, -2016], [2335, 68, -2138], [2286, 67, -2169], [2222, 67, -2159], [2311, 68, -2154], [2343, 67, -2167]] }],
    ['chm', 'le CHM de Mamoudzou', 'Devant l\'hôpital, là où les ambulances ne viennent plus.', 1, { rect: [2853, -1304, 2951, -1297] }],
    ['total', 'la station Total', 'Là où l\'on faisait le plein, avant. Ça sent encore l\'essence.', 1, { rect: [2768, -576, 2816, -528] }],
    ['kaweni', 'Kawéni', 'À Kawéni, dans la zone où tout le monde travaillait et où plus personne ne va.', 1, { rect: [1440, -2432, 1568, -2304] }],
    ['dembeni', 'Dembéni', 'Au sud de la capitale, à Dembéni, sur la route de l\'université.', 1, { rect: [1984, 192, 2112, 320] }],
    ['peage', 'le péage de Bacar', 'Au péage. Plus personne ne paie, mais quelqu\'un garde encore la barrière.', 2, { rect: [1595, -69, 1635, -29] }],
    ['camp', 'le camp de la RN1', 'Dans les ruines du camp de la RN1, entre les tentes brûlées.', 2, { rect: [1027, -60, 1067, -20] }],
    ['coconi', 'le Refuge de Coconi', 'Au Refuge de Coconi, au milieu des cultures.', 2, { rect: [-1104, -1088, -880, -784] }],
    ['somaco', 'le campus Somaco', 'Sur un campus où l\'on apprenait un métier, tout à l\'est, au bord de l\'eau.', 2, { rect: [4144, -768, 4272, -640] }],
    ['gothique', 'la ville des hospices', 'Dans la ville aux hospices de pierre noire, au sud-est de la capitale.', 2, { rect: [2188, 672, 2364, 848] }]
  ],
  ordinal: ['premier', 'deuxième', 'troisième', 'quatrième', 'cinquième']
}

// sol praticable : bloc solide, pas d'eau, deux blocs libres ; null si non chargé ou impraticable
function puffsDebout(level, x, y, z) {
  var bas = level.getBlockState(ATHERIA_BP.containing(x, y - 1, z)), a = level.getBlockState(ATHERIA_BP.containing(x, y, z)), b = level.getBlockState(ATHERIA_BP.containing(x, y + 1, z))
  return bas.isSolid() && bas.getFluidState().isEmpty() && !a.isSolid() && a.getFluidState().isEmpty() && !b.isSolid() && b.getFluidState().isEmpty()
}

// cherche une cachette au sol autour de la base (pas sur un toit, pas dans l'eau)
function puffsCachette(level, bx, bz) {
  var secours = null
  for (var essai = 0; essai < 30; essai++) {
    var x = bx + Math.floor(Math.random() * 17) - 8, z = bz + Math.floor(Math.random() * 17) - 8
    if (!level.isLoaded(ATHERIA_BP.containing(x, 64, z))) return null
    var y = atheriaHauteur(level, x, z)
    if (y < 62 || !puffsDebout(level, x, y, z)) continue
    if (!secours) secours = [x, y, z]
    // sur un toit : bien plus haut que le sol à 5 blocs autour
    var autour = [[5, 0], [-5, 0], [0, 5], [0, -5]].map(o => atheriaHauteur(level, x + o[0], z + o[1]))
    if (y - Math.min.apply(null, autour) <= 3) return [x, y, z]
  }
  return secours
}

function puffsArrondi(v, pas) {
  return Math.round(v / pas) * pas
}

function puffsAfficher(ctx, pf) {
  ctx.server.runCommandSilent('execute in minecraft:overworld run summon item_display ' + (pf.x + 0.5) + ' ' + (pf.y + 0.45) + ' ' + (pf.z + 0.5) +
    ' {item:{id:"atheria:puff_eniy",count:1},billboard:"vertical",transformation:{scale:[0.7f,0.7f,0.7f],translation:[0f,0f,0f],left_rotation:[0f,0f,0f,1f],right_rotation:[0f,0f,0f,1f]},' +
    'Tags:["atheria_live","' + ctx.marque + '","atheria_puff","atheria_puff_' + pf.n + '"]}')
}

function puffsTrouve(ctx, pf, p) {
  pf.trouve = p.username
  ctx.d.trouves++
  ctx.score(p, PUFFS.points)
  ctx.server.overworld().getEntities().forEach(m => { if (m.tags.contains('atheria_puff_' + pf.n) && m.tags.contains(ctx.marque)) m.discard() })
  if (!atheriaLiveFaux(p)) {
    ctx.server.runCommandSilent('give ' + p.username + ' atheria:puff_eniy 1')
    ctx.server.runCommandSilent('give ' + p.username + ' atheria:bon_caf ' + PUFFS.bons)
    ctx.server.runCommandSilent('playsound minecraft:entity.player.levelup player ' + p.username + ' ' + p.x + ' ' + p.y + ' ' + p.z + ' 0.8 1.4')
  }
  ctx.banniere('quete', 'La chasse aux Puffs', 'Puff trouvé', 'Le ' + PUFFS.ordinal[pf.n] + ' Puff d\'Eniy, à ' + pf.lieu + '. ' + PUFFS.bons + ' bons CAF.', [p])
  var reste = ctx.d.puffs.filter(q => !q.trouve).length
  ctx.radio(p.username + ' a trouvé le ' + PUFFS.ordinal[pf.n] + ' Puff, à ' + pf.lieu + '. ' + (reste ? 'Plus que ' + reste + '.' : 'Ils sont tous trouvés, bande de fouineurs.'), 'Eniy :')
}

atheriaLiveDeclarer('puffs', {
  titre: 'La chasse aux Puffs',
  radio: 'eniy',
  annonce: 'Ce soir, j\'ai caché cinq Puffs dorés dans le nord de l\'île. Une devinette pour chacun, un indice de plus toutes les dix minutes.',
  rappel: 'La chasse aux Puffs commence bientôt. Prenez de quoi rouler : il y en a de loin.',
  consigne: 'Cinq Puffs dorés cachés. Un indice de plus toutes les 10 minutes. Un Puff tinte quand on s\'en approche.',
  dureeMin: PUFFS.dureeMin + 2,
  objets: [['atheria:chocolat_dubai', 1]],
  titreGagnant: ['fouineur', 'Fouineur d\'Eniy'],
  surPlace: (ctx, p) => ctx.inscrit(p),
  debut: ctx => {
    var d = ctx.d
    d.trouves = 0
    d.indices = 0
    d.puffs = []
    // 1 près, 2 à mi-distance, 2 loin, tirés au hasard
    var tirer = (dist, n) => {
      var l = PUFFS.caches.filter(c => c[3] == dist)
      for (var i = 0; i < n && l.length; i++) d.puffs.push(l.splice(Math.floor(Math.random() * l.length), 1)[0])
    }
    tirer(0, 1); tirer(1, 2); tirer(2, 2)
    d.puffs = d.puffs.map((c, n) => {
      var o = c[4], pf = { n: n, id: c[0], lieu: c[1], devinette: c[2], trouve: '', pose: false }
      if (o.points) {
        var pt = o.points[Math.floor(Math.random() * o.points.length)]
        pf.x = pt[0]; pf.y = pt[1]; pf.z = pt[2]; pf.sur = true
      } else {
        var r = o.rect
        pf.x = r[0] + Math.floor(Math.random() * (r[2] - r[0] + 1)); pf.z = r[1] + Math.floor(Math.random() * (r[3] - r[1] + 1)); pf.y = 70; pf.sur = false
      }
      return pf
    })
  },
  seconde: (ctx, s) => {
    var d = ctx.d, level = ctx.server.overworld(), joueurs = ctx.joueurs()
    // les devinettes, puis un indice toutes les 10 min (étalés de 20 s pour ne pas noyer la radio)
    var etape = Math.floor(s / PUFFS.indiceSec), dans = s % PUFFS.indiceSec
    if (etape <= 3 && dans >= 5 && (dans - 5) % 20 == 0 && (dans - 5) / 20 < PUFFS.nombre) {
      var pf = d.puffs[(dans - 5) / 20]
      if (pf && !pf.trouve) {
        var o = PUFFS.ordinal[pf.n], t
        if (etape == 0) t = 'Le ' + o + ' Puff : « ' + pf.devinette + ' »'
        else if (etape == 1) t = 'Le ' + o + ' Puff est à ' + pf.lieu + '.'
        else if (etape == 2) t = 'Le ' + o + ' Puff, à ' + pf.lieu + ' : vers x ' + puffsArrondi(pf.x, 50) + ', z ' + puffsArrondi(pf.z, 50) + ', à 50 blocs près.'
        else t = 'Le ' + o + ' Puff : x ' + puffsArrondi(pf.x, 10) + ', z ' + puffsArrondi(pf.z, 10) + ', à 10 blocs près. Écoutez, il tinte.'
        ctx.radio(t, 'Eniy :')
      }
    }
    d.puffs.forEach(pf => {
      if (pf.trouve) return
      var proches = joueurs.filter(p => !atheriaLiveFaux(p) && (p.x - pf.x) * (p.x - pf.x) + (p.z - pf.z) * (p.z - pf.z) < PUFFS.rayonApparition * PUFFS.rayonApparition)
      // un faux joueur d'essai « trouve » un Puff en passant à côté
      joueurs.forEach(p => { if (!pf.trouve && atheriaLiveFaux(p) && Math.abs(p.x - pf.x) < 3 && Math.abs(p.z - pf.z) < 3) puffsTrouve(ctx, pf, p) })
      if (pf.trouve || !proches.length) return
      if (!pf.pose) {
        if (!pf.sur) {
          var c = puffsCachette(level, pf.x, pf.z)
          if (!c) return
          pf.x = c[0]; pf.y = c[1]; pf.z = c[2]; pf.sur = true
        }
        pf.pose = true
        puffsAfficher(ctx, pf)
      }
      // il tinte (toutes les 4 s), pour qui est à moins d'une vingtaine de blocs
      if (s % 4 == pf.n % 4) ctx.server.runCommandSilent('playsound minecraft:block.amethyst_block.chime ambient @a ' + (pf.x + 0.5) + ' ' + (pf.y + 0.5) + ' ' + (pf.z + 0.5) + ' 1.4 1.6')
      proches.forEach(p => {
        if (pf.trouve) return
        var dx = p.x - (pf.x + 0.5), dz = p.z - (pf.z + 0.5)
        if (dx * dx + dz * dz <= PUFFS.rayonPrise * PUFFS.rayonPrise && Math.abs(p.y - pf.y) <= 2.5) {
          ctx.inscrire(p)
          puffsTrouve(ctx, pf, p)
        }
      })
    })
    if (d.trouves >= d.puffs.length || s >= PUFFS.dureeMin * 60) {
      var restes = d.puffs.filter(q => !q.trouve).map(q => q.lieu)
      if (restes.length) ctx.radio('Fin de la chasse. Personne n\'a trouvé ceux de ' + restes.join(', ') + '. Je les reprends.', 'Eniy :')
      ctx.terminer()
    }
  },
  fin: ctx => {
    ctx.server.getAllLevels().forEach(level => level.getEntities().forEach(m => { if (m.tags.contains('atheria_live')) m.discard() }))
  }
})
