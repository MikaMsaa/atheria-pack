// Atheria - contrats radio du jour (Mika 22/11, idée validée).
// Chaque jour (minuit, heure de La Réunion), chaque joueur reçoit 3 petits contrats tirés selon son stade :
// éliminer des infectés, explorer un lieu de l'île, fabriquer un objet d'un mod du pack, rouler en véhicule.
// Ils récompensent l'exploration et les nouveautés du pack plutôt que le jeu « classique » (principe de Mika).
// /contrats affiche la liste ; la barre d'action montre la progression ; les 3 faits = bonus.
var CONTRATS = {
  parJour: 3,
  recompense: [0, 6, 8, 10, 12, 14],   // bons CAF par contrat, selon le stade
  bonus: 10,                            // les 3 contrats du jour
  rayonLieu: 64
}
// [type, clé, texte, cible, nombre, stade mini]
var CONTRATS_POOL = [
  ['tuer', 'humains', 'Éliminer 15 infectés humains', ['spore:inf_human', 'spore:inf_villager', 'spore:inf_wanderer', 'spore:inf_player', 'minecraft:zombie'], 15, 1],
  ['tuer', 'noyes', 'Éliminer 6 noyés', ['spore:inf_drowned', 'minecraft:drowned', 'spore:naiad'], 6, 1],
  ['tuer', 'cendreux', 'Éliminer 6 cendreux', ['spore:inf_husk', 'minecraft:husk', 'spore:thorn', 'spore:scavenger'], 6, 1],
  ['tuer', 'soldats', 'Éliminer 5 soldats infectés de la ICE', ['spore:inf_pillager', 'spore:inf_vindicator', 'spore:knight'], 5, 2],
  ['tuer', 'cracheurs', 'Éliminer 4 cracheurs', ['spore:spitter', 'spore:mephitic'], 4, 2],
  ['tuer', 'sauteurs', 'Éliminer 3 sauteurs', ['spore:leaper', 'spore:slasher', 'spore:scamper'], 3, 3],
  ['tuer', 'koro', 'Éliminer 2 Koro', ['spore:brute', 'spore:gargoyle', 'spore:ogre'], 2, 4],
  ['lieu', 'coconi', 'Faire un relevé à Coconi', [-1041, -849], 1, 1],
  ['lieu', 'total', 'Passer à la station Total de la RN1', [2791, -553], 1, 1],
  ['lieu', 'kaweni', 'Explorer Kaweni', [1503, -2369], 1, 1],
  ['lieu', 'majicavo', 'Fouiller Majicavo', [2559, -2001], 1, 1],
  ['lieu', 'mamoudzou', 'Atteindre le CHM de Mamoudzou', [2887, -1209], 1, 1],
  ['lieu', 'dembeni', 'Explorer Dembeni', [2047, 255], 1, 2],
  ['lieu', 'peage', 'Repérer le péage de la RN1', [1615, -49], 1, 2],
  ['lieu', 'somaco', 'Approcher le campus de Somaco', [4207, -705], 1, 3],
  ['lieu', 'handrema', 'Traverser Handrema', [1599, 2735], 1, 3],
  ['lieu', 'chirongui', 'Atteindre Chirongui', [799, 3775], 1, 3],
  ['lieu', 'sada', 'Atteindre Sada', [-3937, 511], 1, 3],
  ['lieu', 'vahibe', 'Descendre à Vahibe', [-2033, 2063], 1, 4],
  ['lieu', 'mtsamboro', 'Atteindre Mtsamboro', [-3089, -5249], 1, 4],
  ['fabriquer', 'marmite', 'Fabriquer une marmite (Farmer\'s Delight)', 'farmersdelight:cooking_pot', 1, 1],
  ['fabriquer', 'planche', 'Fabriquer une planche à découper (Farmer\'s Delight)', 'farmersdelight:cutting_board', 1, 1],
  ['fabriquer', 'sac', 'Coudre un sac à dos', 'sophisticatedbackpacks:backpack', 1, 1],
  ['fabriquer', 'alliage', 'Fabriquer 8 alliages d\'andésite (Create)', 'create:andesite_alloy', 8, 2],
  ['fabriquer', 'engrenage', 'Fabriquer 4 engrenages (Create)', 'create:cogwheel', 4, 2],
  ['rouler', 'route', 'Rouler 800 blocs en véhicule', null, 800, 1]
]

function atheriaContratsJour() {
  return Math.floor((Date.now() + 4 * 3600 * 1000) / 86400000)
}

function atheriaContratsStade(p) {
  var sb = p.server.scoreboard, o = sb.getObjective('atheria_stade')
  if (!o) return 1
  var SH = Java.loadClass('net.minecraft.world.scores.ScoreHolder')
  return Math.max(1, sb.getOrCreatePlayerScore(SH.forNameOnly(p.username), o).get())
}

// tirage déterministe par joueur et par jour : un type de chaque sorte quand c'est possible
function atheriaContratsTirer(p, jour) {
  var stade = atheriaContratsStade(p)
  var graine = atheriaEniyHash(p.username + ':' + jour)
  var dispo = CONTRATS_POOL.filter(c => c[5] <= stade)
  var types = ['tuer', 'lieu', 'fabriquer', 'rouler']
  var debut = Math.floor(graine * types.length)
  var choisis = []
  for (var i = 0; i < types.length && choisis.length < CONTRATS.parJour; i++) {
    var t = types[(debut + i) % types.length]
    var l = dispo.filter(c => c[0] == t)
    if (!l.length) continue
    var c = l[Math.floor(atheriaEniyHash(p.username + t + jour) * l.length)]
    choisis.push({ cle: c[1], fait: 0 })
  }
  return { jour: jour, stade: stade, liste: choisis, bonus: false }
}

function atheriaContratsLire(p) {
  var jour = atheriaContratsJour()
  var brut = String(p.persistentData.getString('atheria_contrats') || '')
  var etat = null
  try { etat = brut ? JSON.parse(brut) : null } catch (e) { etat = null }
  if (!etat || etat.jour != jour) {
    etat = atheriaContratsTirer(p, jour)
    atheriaContratsEcrire(p, etat)
  }
  return etat
}

function atheriaContratsEcrire(p, etat) {
  p.persistentData.putString('atheria_contrats', JSON.stringify(etat))
}

function atheriaContratDef(cle) {
  return CONTRATS_POOL.filter(c => c[1] == cle)[0]
}

function atheriaContratsAfficher(p) {
  var etat = atheriaContratsLire(p)
  p.tell(Text.gold('— Contrats radio du jour —'))
  etat.liste.forEach(c => {
    var d = atheriaContratDef(c.cle)
    if (!d) return
    var fini = c.fait >= d[4]
    var ligne = (fini ? '✔ ' : '• ') + d[2] + (d[4] > 1 ? ' (' + Math.min(c.fait, d[4]) + '/' + d[4] + ')' : '')
    p.tell(fini ? Text.green(ligne) : Text.gray(ligne))
  })
  p.tell(Text.darkGray('Récompense : ' + CONTRATS.recompense[etat.stade] + ' bons par contrat, ' + CONTRATS.bonus + ' de plus pour les trois. Nouveaux contrats à minuit.'))
  return 1
}

function atheriaContratsAvancer(p, type, test, combien) {
  var etat = atheriaContratsLire(p), change = false
  etat.liste.forEach(c => {
    var d = atheriaContratDef(c.cle)
    if (!d || d[0] != type || c.fait >= d[4] || !test(d)) return
    c.fait = Math.min(d[4], c.fait + combien)
    change = true
    if (c.fait >= d[4]) {
      var gain = CONTRATS.recompense[etat.stade]
      p.server.runCommandSilent('give ' + p.username + ' atheria:bon_caf ' + gain)
      p.tell(Text.gold('[Radio] ').append(Text.yellow('Contrat rempli : ' + d[2] + '. ' + gain + ' bons CAF.')))
      p.server.runCommandSilent('playsound minecraft:entity.experience_orb.pickup master ' + p.username + ' ~ ~ ~ 0.7 1.1')
    } else if (d[4] > 1) {
      p.setStatusMessage(Text.gray(d[2] + ' : ' + c.fait + '/' + d[4]))
    }
  })
  if (!change) return
  if (!etat.bonus && etat.liste.every(c => { var d = atheriaContratDef(c.cle); return d && c.fait >= d[4] })) {
    etat.bonus = true
    p.server.runCommandSilent('give ' + p.username + ' atheria:bon_caf ' + CONTRATS.bonus)
    p.server.runCommandSilent('xp add ' + p.username + ' 200 points')
    p.tell(Text.gold('[Radio] ').append(Text.yellow('Les trois contrats du jour sont remplis. Prime : ' + CONTRATS.bonus + ' bons CAF. Reviens demain.')))
  }
  atheriaContratsEcrire(p, etat)
}

EntityEvents.death(event => {
  var src = event.source
  var p = src ? src.player : null
  if (!p || !p.isPlayer()) return
  var id = '' + event.entity.getEncodeId()
  atheriaContratsAvancer(p, 'tuer', d => d[3].indexOf(id) >= 0, 1)
})

ItemEvents.crafted(event => {
  var p = event.player
  if (!p) return
  var id = String(event.item.id), n = event.item.count
  atheriaContratsAvancer(p, 'fabriquer', d => d[3] == id, n)
})

// lieux et véhicule : toutes les 5 s
ServerEvents.tick(event => {
  var server = event.server
  if (server.tickCount % 100 != 40) return
  server.players.forEach(p => {
    if (p.isSpectator()) return
    var etat = atheriaContratsLire(p)
    var d = p.persistentData
    // distance parcourue assis dans un véhicule (MTS : le joueur est passager d'un siège)
    var x = p.x, z = p.z
    if (p.isPassenger() && d.contains('atheria_contrat_x')) {
      var dx = x - d.getDouble('atheria_contrat_x'), dz = z - d.getDouble('atheria_contrat_z')
      var parcouru = Math.sqrt(dx * dx + dz * dz)
      if (parcouru > 2 && parcouru < 400) atheriaContratsAvancer(p, 'rouler', c => true, Math.round(parcouru))
    }
    d.putDouble('atheria_contrat_x', x)
    d.putDouble('atheria_contrat_z', z)
    var r2 = CONTRATS.rayonLieu * CONTRATS.rayonLieu
    atheriaContratsAvancer(p, 'lieu', c => { var a = x - c[3][0], b = z - c[3][1]; return a * a + b * b <= r2 }, 1)
  })
})

PlayerEvents.loggedIn(event => {
  var p = event.player
  var etat = atheriaContratsLire(p)
  var reste = etat.liste.filter(c => { var d = atheriaContratDef(c.cle); return d && c.fait < d[4] }).length
  if (reste > 0) p.tell(Text.gold('[Radio] ').append(Text.gray(reste + ' contrat(s) t\'attendent aujourd\'hui. Tape /contrats pour les voir.')))
})

ServerEvents.commandRegistry(event => {
  event.register(event.commands.literal('contrats').executes(ctx => {
    var p = ctx.source.player
    return p ? atheriaContratsAfficher(p) : 0
  }))
})
