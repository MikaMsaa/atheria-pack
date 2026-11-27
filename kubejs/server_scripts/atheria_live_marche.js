// Atheria - soirée live « Le grand marché d'Eniy » (samedi 26/12, 21 h Paris ; doc « Soirées live d'Atheria »).
// Au camp des conteneurs de Longoni (zone sûre). Eniy met 5 objets introuvables aux enchères en bons CAF, un toutes les
// 5 minutes ; entre deux lots, il lance un défi absurde (le premier qui lui apporte ce qu'il demande est payé).
// Les joueurs tiennent aussi leurs propres stands : la radio le rappelle, l'échange se fait de la main à la main.
// Enchères : un écran s'ouvre pour tous ceux qui sont au marché (boutons +1, +5, +10 bons ; /enchere le rouvre).
// On ne peut miser que les bons qu'on a dans son inventaire ; le lot est payé à la fin. Une mise dans les 15 dernières
// secondes relance le compte à 15 s. Si le gagnant n'a plus assez de bons (ou est parti), le lot va au suivant.
// Score : les bons dépensés aux enchères, plus 30 par défi gagné. Les bons dépensés sortent du jeu.
var MARCHE = {
  eniy: [2526, 64, -3114],
  rayon: 70,
  rayonEniy: 10,
  dureeLot: 180, relance: 15,
  debutsLots: [60, 360, 660, 960, 1260],
  debutsDefis: [270, 570, 870, 1170],
  dureeDefi: 240, bonsDefi: 10, pointsDefi: 30,
  lots: [
    ['sophisticatedbackpacks:diamond_backpack', 'Sac à dos renforcé', 1, 30],
    ['militaristic_armor:night_vision_goggles', 'Lunettes de vision nocturne', 1, 40],
    ['atheria:chocolat_dubai', 'Caisse de chocolat de Dubaï', 10, 15],
    ['militaristic_armor:stimpack', 'Trois stimpacks militaires', 3, 30],
    ['tacz_tactical_breaching:gas_mask', 'Masque à gaz et six filtres', 1, 25, [['atheria:filtre', 6]]]
  ],
  defis: [
    [['minecraft:rotten_flesh'], 16, 'Seize morceaux de chair avariée. Ne demandez pas pourquoi.'],
    [['atheria:poisson_seche'], 1, 'Un poisson séché. Bien sec. Je le saurai.'],
    [['minecraft:poppy', 'minecraft:dandelion', 'minecraft:blue_orchid', 'minecraft:allium', 'minecraft:oxeye_daisy', 'minecraft:cornflower'], 1, 'Une fleur pour décorer ma boutique. Une vraie.'],
    [['minecraft:egg'], 3, 'Trois œufs. Je fais un gâteau pour la fin du monde.']
  ]
}

function marcheSurPlace(p) {
  var dx = p.x - MARCHE.eniy[0], dz = p.z - MARCHE.eniy[2]
  return dx * dx + dz * dz <= MARCHE.rayon * MARCHE.rayon
}

function marcheCompter(p, ids) {
  var n = 0, inv = p.inventory
  for (var i = 0; i < inv.getContainerSize(); i++) {
    var st = inv.getItem(i)
    if (!st.isEmpty() && ids.indexOf(String(st.getId())) >= 0) n += st.getCount()
  }
  return n
}

function marcheRetirer(p, ids, n) {
  var inv = p.inventory
  for (var i = 0; i < inv.getContainerSize() && n > 0; i++) {
    var st = inv.getItem(i)
    if (st.isEmpty() || ids.indexOf(String(st.getId())) < 0) continue
    var k = Math.min(n, st.getCount())
    st.shrink(k)
    n -= k
  }
  return n == 0
}

function marcheEcran(ctx, p, maj) {
  if (atheriaLiveFaux(p)) return
  var l = ctx.d.lot
  if (!l) return
  var def = MARCHE.lots[l.i]
  var fin = Math.max(0, (l.fin - ctx.secondes) * 1000)
  atheriaHud(p, { t: 'ecran', genre: 'enchere', json: JSON.stringify({
    maj: !!maj, lot: l.i + 1, lots: MARCHE.lots.length, objet: def[0], nom: def[1], prix: l.prix, chef: l.chef || '',
    moi: p.username, solde: marcheCompter(p, ['atheria:bon_caf']), fin: fin, duree: MARCHE.dureeLot * 1000
  }) })
}

function marcheEcranTous(ctx, maj) {
  ctx.joueurs().forEach(p => { if (marcheSurPlace(p)) marcheEcran(ctx, p, maj) })
}

// une mise ; renvoie le message pour le joueur
function marcheMiser(ctx, p, montant) {
  var l = ctx.d.lot
  if (!l || l.clos) return 'Pas de lot en vente en ce moment.'
  if (!marcheSurPlace(p)) return 'Il faut être au marché, au camp des conteneurs de Longoni.'
  if (l.chef == p.username) return 'Tu mènes déjà.'
  var mini = l.chef ? l.prix + 1 : l.prix
  if (montant < mini) return 'La mise doit être d\'au moins ' + mini + ' bons.'
  if (marcheCompter(p, ['atheria:bon_caf']) < montant) return 'Tu n\'as pas ' + montant + ' bons sur toi.'
  l.prix = montant
  l.chef = p.username
  l.mises[p.username] = montant
  if (l.fin - ctx.secondes < MARCHE.relance) l.fin = ctx.secondes + MARCHE.relance
  ctx.joueurs().forEach(q => { if (q != p && marcheSurPlace(q)) ctx.action(q, 'atheria:bon_caf', p.username + ' mise ' + montant + ' bons.', 'ambre') })
  marcheEcranTous(ctx, true)
  return ''
}

function marcheAdjuger(ctx) {
  var l = ctx.d.lot, def = MARCHE.lots[l.i]
  l.clos = true
  var ordre = Object.keys(l.mises).map(k => [k, l.mises[k]]).sort((a, b) => b[1] - a[1])
  var gagnant = null
  for (var i = 0; i < ordre.length && !gagnant; i++) {
    var p = ctx.trouver(ordre[i][0])
    if (p && marcheRetirer(p, ['atheria:bon_caf'], ordre[i][1])) gagnant = [p, ordre[i][1]]
  }
  if (!gagnant) {
    ctx.radio('Personne pour « ' + def[1] + ' » ? Tant pis, je le garde. Il prendra de la valeur.', 'Eniy :')
  } else {
    var p = gagnant[0], prix = gagnant[1]
    if (!atheriaLiveFaux(p)) {
      ctx.server.runCommandSilent('give ' + p.username + ' ' + def[0] + ' ' + def[2])
      ;(def[4] || []).forEach(o => ctx.server.runCommandSilent('give ' + p.username + ' ' + o[0] + ' ' + o[1]))
    }
    ctx.score(p, prix)
    ctx.d.ventes.push([def[1], p.username, prix])
    ctx.radio('« ' + def[1] + ' », adjugé à ' + p.username + ' pour ' + prix + ' bons CAF. Satisfait ou satisfait.', 'Eniy :')
    ctx.banniere('quete', 'Le grand marché d\'Eniy', 'Adjugé !', def[1] + ', pour ' + prix + ' bons CAF.', [p])
  }
  marcheEcranTous(ctx, true)
  ctx.d.lot = null
}

atheriaLiveDeclarer('marche', {
  titre: 'Le grand marché d\'Eniy',
  radio: 'eniy',
  annonce: 'Grand marché ce soir au camp des conteneurs de Longoni : cinq objets introuvables aux enchères, des défis payés, et vos propres stands. Venez avec vos bons.',
  rappel: 'Le marché ouvre bientôt au camp des conteneurs. Apportez des bons, et ce que vous voulez vendre.',
  consigne: 'Cinq lots aux enchères, un toutes les 5 minutes. Entre deux lots, Eniy lance un défi. Vendez aussi entre vous.',
  dureeMin: 30,
  objets: [['atheria:chocolat_dubai', 2]],
  titreGagnant: ['grand_acheteur', 'Client préféré d\'Eniy'],
  surPlace: (ctx, p) => marcheSurPlace(p),
  debut: ctx => {
    ctx.d.lot = null
    ctx.d.lotsFaits = 0
    ctx.d.defi = null
    ctx.d.defisFaits = 0
    ctx.d.ventes = []
  },
  seconde: (ctx, s) => {
    var d = ctx.d
    if (s == 20) ctx.radio('Les stands sont ouverts. Vendez, achetez, troquez : je ne prends rien sur vos affaires. Pour l\'instant.', 'Eniy :')
    // un nouveau lot
    // (un lot relancé par une mise de dernière seconde décale le suivant : jamais deux lots à la fois)
    if (d.lotsFaits < MARCHE.lots.length && s >= MARCHE.debutsLots[d.lotsFaits] && !d.lot) {
      var i = d.lotsFaits++, def = MARCHE.lots[i]
      d.lot = { i: i, prix: def[3], chef: '', mises: {}, fin: s + MARCHE.dureeLot }
      ctx.radio('Lot ' + (i + 1) + ' : « ' + def[1] + ' ». Mise de départ ' + def[3] + ' bons. Trois minutes.', 'Eniy :')
      marcheEcranTous(ctx, false)
    }
    if (d.lot && !d.lot.clos) {
      if (s >= d.lot.fin) marcheAdjuger(ctx)
      else if ((d.lot.fin - s) == 30) ctx.joueurs().forEach(p => { if (marcheSurPlace(p)) ctx.action(p, 'atheria:bon_caf', 'Encore 30 s sur « ' + MARCHE.lots[d.lot.i][1] + ' » : ' + d.lot.prix + ' bons' + (d.lot.chef ? ' par ' + d.lot.chef : '') + '.', 'ambre') })
    }
    // les défis
    if (d.defisFaits < MARCHE.defis.length && s >= MARCHE.debutsDefis[d.defisFaits] && !d.defi) {
      d.defi = { i: d.defisFaits++, fin: s + MARCHE.dureeDefi }
      var df = MARCHE.defis[d.defi.i]
      ctx.radio('Défi : le premier qui m\'apporte ça gagne ' + MARCHE.bonsDefi + ' bons. ' + df[2], 'Eniy :')
    }
    if (d.defi) {
      var df2 = MARCHE.defis[d.defi.i], gagne = null
      ctx.joueurs().forEach(p => {
        if (gagne) return
        var dx = p.x - MARCHE.eniy[0], dz = p.z - MARCHE.eniy[2]
        if (dx * dx + dz * dz > MARCHE.rayonEniy * MARCHE.rayonEniy) return
        if (marcheCompter(p, df2[0]) >= df2[1] && marcheRetirer(p, df2[0], df2[1])) gagne = p
      })
      if (gagne) {
        if (!atheriaLiveFaux(gagne)) ctx.server.runCommandSilent('give ' + gagne.username + ' atheria:bon_caf ' + MARCHE.bonsDefi)
        ctx.score(gagne, MARCHE.pointsDefi)
        ctx.radio(gagne.username + ' remporte le défi. Je ne dirai pas ce que je vais en faire.', 'Eniy :')
        d.defi = null
      } else if (s >= d.defi.fin) {
        ctx.radio('Personne ? Bande d\'incapables. Défi annulé.', 'Eniy :')
        d.defi = null
      }
    }
    if (d.lotsFaits >= MARCHE.lots.length && !d.lot && !d.defi && s > MARCHE.debutsLots[MARCHE.lots.length - 1] + MARCHE.dureeLot + 20) ctx.terminer()
  }
})

// /enchere : rouvre l'écran ; /enchere <bons> : mise
ServerEvents.commandRegistry(event => {
  var { commands: Commands, arguments: Arg } = event
  var faire = (ctx, montant) => {
    var p = ctx.source.player
    if (!p) return 0
    var e = atheriaLiveEtat(p.server)
    if (!e || e.nom != 'marche' || e.phase != 'encours') { atheriaHudAction(p, 'atheria:bon_caf', 'Pas d\'enchères en ce moment.', 'rouge'); return 0 }
    var c = atheriaLiveCtx(p.server, e)
    if (montant == null) { marcheEcran(c, p, false); return 1 }
    var r = marcheMiser(c, p, montant)
    atheriaLiveEcrire(p.server, e)
    if (r) atheriaHudAction(p, 'atheria:bon_caf', r, 'rouge')
    return r ? 0 : 1
  }
  event.register(Commands.literal('enchere')
    .executes(ctx => faire(ctx, null))
    .then(Commands.argument('bons', Arg.INTEGER.create(event)).executes(ctx => faire(ctx, Arg.INTEGER.getResult(ctx, 'bons')))))
})
