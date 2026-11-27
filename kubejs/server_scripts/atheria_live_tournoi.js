// Atheria - soirée live « Le tournoi d'Angellow » (dimanche 17/1, 21 h Paris ; doc « Soirées live d'Atheria »).
// Fête de fin de saison au Refuge de Coconi, façon goulag (Mika 27/11) : une arène, un duel à la fois, tout le monde
// d'autre en mode spectateur, avec la caméra d'un combattant au choix (/suivre <joueur>).
// Kit identique : casque, gilet, pantalon et bottes camouflage (Military Armors), Glock 17 et 2 chargeurs, couteau de
// combat. Sans perte : l'inventaire de chaque combattant est mis de côté puis rendu ; le coup fatal le met KO.
// Déroulé (/live tournoi start) :
//  1. annonce radio 30 min avant ; à l'heure, 5 minutes d'inscription : qui est DANS l'arène à la fin combat,
//     les autres (à moins de 48 blocs) regardent ; tous passent alors en spectateur pour tout le tournoi ;
//  2. chaque duel est tiré au sort (tableau à élimination directe) ; un op peut imposer le suivant :
//     /live tournoi duel <joueur1> <joueur2> ; 25 s de paris (/parier <joueur> <bons>), puis 2 min 30 de combat,
//     dernier debout gagne ; au temps, 30 s de mort subite (les deux brillent), puis le plus en forme gagne ;
//  3. le vainqueur du tableau est champion ; puis un 2 contre 2 (champion + dernier contre 2e + 3e) ;
//  4. à la fin, chacun retrouve son mode de jeu et sa place d'avant.
// Paris : la cagnotte du duel est partagée entre ceux qui ont parié sur le vainqueur, au prorata ;
// si personne n'a parié sur lui, chacun est remboursé.
// Score : 50 par KO, 40 par duel gagné, 100 au champion, 30 à chaque vainqueur du 2 contre 2, et le gain des paris.
var TOURNOI = {
  lieu: 'Refuge de Coconi',
  // arène : PROVISOIRE (pré du Refuge) tant que le fil de la carte n'a pas posé la vraie arène et donné ses mesures
  arene: [-919, -941, -880, -918],
  departs: { a: [[-916, -933], [-916, -926]], b: [[-883, -933], [-883, -926]] },
  solDefaut: 64,
  rayonPublic: 48,
  inscriptionSec: 300,
  pariSec: 25, matchSec: 150, mortSubiteSec: 30,
  pariMax: 20,
  points: { ko: 50, victoire: 40, champion: 100, equipe: 30 },
  kit: {
    tete: 'militaristic_armor:camo_helmet', torse: 'militaristic_armor:camo_chestplate',
    jambes: 'militaristic_armor:camo_leggings', pieds: 'militaristic_armor:camo_boots',
    objets: ['tacz:modern_kinetic_gun[minecraft:custom_data={GunId:"tacz:glock_17",GunCurrentAmmoCount:17,HasBulletInBarrel:1b}] 1',
      'militaristic_armor:combat_knife 1', 'tacz:ammo[minecraft:custom_data={AmmoId:"tacz:9mm"}] 34']
  },
  dureeMin: 75
}

// inventaire mis de côté objet par objet, en SNBT (les ListTag/CompoundTag ne passent pas tels quels par KubeJS)
var TOURNOI_IS = Java.loadClass('net.minecraft.world.item.ItemStack')
var TOURNOI_OPS = Java.loadClass('net.minecraft.nbt.NbtOps')
var TOURNOI_SNBT = Java.loadClass('net.minecraft.nbt.TagParser')
var TOURNOI_FA = null
try { TOURNOI_FA = Java.loadClass('ichttt.mods.firstaid.common.util.CommonUtils') } catch (x) { TOURNOI_FA = null }

function tournoiCentre() { var a = TOURNOI.arene; return [(a[0] + a[2] + 1) / 2, (a[1] + a[3] + 1) / 2] }
function tournoiDist(p) { var c = tournoiCentre(), dx = p.x - c[0], dz = p.z - c[1]; return Math.sqrt(dx * dx + dz * dz) }
function tournoiDans(p, marge) {
  var a = TOURNOI.arene, m = marge || 0
  return p.x >= a[0] - m && p.x <= a[2] + 1 + m && p.z >= a[1] - m && p.z <= a[3] + 1 + m
}
// hauteur du sol ; tronçon non chargé (hauteur au fond du monde) : sol de l'arène par défaut, jamais le vide
function tournoiSol(level, x, z) {
  var y = typeof atheriaHauteur === 'function' ? atheriaHauteur(level, Math.floor(x), Math.floor(z)) : TOURNOI.solDefaut
  return y > level.getMinBuildHeight() + 2 ? y : TOURNOI.solDefaut
}
function tournoiNoms(camp) { return camp.join(' et ') }
function tournoiCampDe(m, nom) { return !m ? '' : m.a.indexOf(nom) >= 0 ? 'a' : m.b.indexOf(nom) >= 0 ? 'b' : '' }
function tournoiMelanger(l) {
  for (var i = l.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = l[i]; l[i] = l[j]; l[j] = t }
  return l
}
function tournoiPresents(ctx) { return ctx.joueurs().filter(p => tournoiDist(p) <= TOURNOI.rayonPublic) }
function tournoiPublic(ctx) { return tournoiPresents(ctx).filter(p => !atheriaLiveFaux(p)) }

function tournoiTp(server, p, x, y, z, vers) {
  if (atheriaLiveFaux(p)) { p.setPos(x, y, z); return }
  if (typeof atheriaArriveeLiberer === 'function') atheriaArriveeLiberer(p, 'tournoi')
  server.runCommandSilent('execute in minecraft:overworld run tp ' + p.username + ' ' + x.toFixed(2) + ' ' + y + ' ' + z.toFixed(2) +
    (vers ? ' facing ' + vers[0] + ' ' + (y + 1) + ' ' + vers[1] : ''))
}

// ---------- spectateurs ----------
// « atheria_tournoi_origine » : mode et place d'avant le tournoi, gardés sur le joueur (survit à une déconnexion),
// rendus à la fin ; « atheria_tournoi_spec » : il regarde en ce moment (un combattant le perd pendant son duel)
var TOURNOI_MODES = Java.loadClass('net.minecraft.world.level.GameType')
function tournoiMode(p, nom) { try { p.setGameMode(TOURNOI_MODES.byName(nom, TOURNOI_MODES.SURVIVAL)) } catch (x) { console.error('[Atheria tournoi] mode : ' + x) } }

function tournoiEnSpectateur(ctx, p) {
  if (atheriaLiveFaux(p) || p.persistentData.contains('atheria_tournoi_spec')) return
  var mode = 'survival'
  try { mode = String(p.gameMode.getGameModeForPlayer().getName()) } catch (x) {}
  if (mode == 'creative' || (mode == 'spectator' && !p.persistentData.contains('atheria_tournoi_origine'))) return
  if (!p.persistentData.contains('atheria_tournoi_origine')) p.persistentData.putString('atheria_tournoi_origine', JSON.stringify({ x: p.x, y: p.y, z: p.z, mode: mode }))
  p.persistentData.putBoolean('atheria_tournoi_spec', true)
  tournoiMode(p, 'spectator')
  tournoiVue(ctx.server, p)
  ctx.action(p, 'minecraft:ender_eye', 'Tu regardes le tournoi. /suivre <joueur> pour voir avec ses yeux, /suivre pour revenir. /tournoi quitter pour partir.', 'ambre')
}

function tournoiVue(server, p) {
  var c = tournoiCentre(), y = tournoiSol(server.overworld(), c[0], c[1]) + 14
  try { p.setCamera(p) } catch (x) {}
  tournoiTp(server, p, c[0], y, TOURNOI.arene[1] - 6, c)
}

function tournoiOrigine(p) {
  try { return JSON.parse(String(p.persistentData.getString('atheria_tournoi_origine'))) } catch (x) { return {} }
}

// le spectateur appelé pour son duel : il reprend son mode de jeu, sa place d'avant reste gardée pour la fin
function tournoiEnCombattant(server, p) {
  if (atheriaLiveFaux(p) || !p.persistentData.contains('atheria_tournoi_spec')) return
  p.persistentData.remove('atheria_tournoi_spec')
  try { p.setCamera(p) } catch (x) {}
  var mo = tournoiOrigine(p).mode
  tournoiMode(p, mo && mo != 'spectator' ? mo : 'survival')
}

// fin du tournoi (ou /tournoi quitter) : mode de jeu et place d'avant
function tournoiRetour(server, p) {
  if (atheriaLiveFaux(p)) return
  var pd = p.persistentData
  if (!pd.contains('atheria_tournoi_spec') && !pd.contains('atheria_tournoi_origine')) return
  var o = tournoiOrigine(p)
  pd.remove('atheria_tournoi_spec'); pd.remove('atheria_tournoi_origine')
  try { p.setCamera(p) } catch (x) {}
  tournoiMode(p, o.mode || 'survival')
  if (o.x != null) tournoiTp(server, p, o.x, Math.round(o.y * 100) / 100, o.z, null)
}

// ---------- combattants : inventaire et santé mis de côté, kit identique, rendu à la fin du duel ----------
function tournoiModele(p) {
  if (!TOURNOI_FA) return null
  try { return TOURNOI_FA.getDamageModel(p) } catch (x) { return null }
}

function tournoiArmer(ctx, p) {
  if (atheriaLiveFaux(p)) return
  var pd = p.persistentData
  if (!pd.contains('atheria_tournoi_sac')) {
    var ops = p.registryAccess().createSerializationContext(TOURNOI_OPS.INSTANCE), inv = p.inventory, sac = []
    for (var i = 0; i < inv.getContainerSize(); i++) {
      var st = inv.getItem(i)
      if (!st.isEmpty()) sac.push([i, String(TOURNOI_IS.CODEC.encodeStart(ops, st).getOrThrow())])
    }
    pd.putString('atheria_tournoi_sac', JSON.stringify(sac))
    pd.putFloat('atheria_tournoi_vie', p.health)
    pd.putInt('atheria_tournoi_faim', p.foodData.getFoodLevel())
    var mo = tournoiModele(p), parts = []
    if (mo) { mo.forEach(part => { parts.push(part.currentHealth) }); pd.putString('atheria_tournoi_fa', JSON.stringify(parts)) }
  }
  p.inventory.clearContent()
  var mo2 = tournoiModele(p)
  if (mo2) { mo2.forEach(part => { part.currentHealth = part.getMaxHealth() }); mo2.scheduleResync() }
  p.setHealth(p.maxHealth)
  p.foodData.setFoodLevel(20)
  var s = ctx.server, n = p.username, k = TOURNOI.kit
  s.runCommandSilent('item replace entity ' + n + ' armor.head with ' + k.tete)
  s.runCommandSilent('item replace entity ' + n + ' armor.chest with ' + k.torse)
  s.runCommandSilent('item replace entity ' + n + ' armor.legs with ' + k.jambes)
  s.runCommandSilent('item replace entity ' + n + ' armor.feet with ' + k.pieds)
  k.objets.forEach(o => s.runCommandSilent('give ' + n + ' ' + o))
  p.clearFire()
}

function tournoiRendre(server, p) {
  if (atheriaLiveFaux(p)) return
  var pd = p.persistentData
  if (!pd.contains('atheria_tournoi_sac')) return
  var sac = []
  try { sac = JSON.parse(String(pd.getString('atheria_tournoi_sac'))) } catch (x) { console.error('[Atheria tournoi] sac illisible de ' + p.username + ' : ' + pd.getString('atheria_tournoi_sac')); return }
  var ops = p.registryAccess().createSerializationContext(TOURNOI_OPS.INSTANCE)
  p.inventory.clearContent()
  sac.forEach(o => {
    try { p.inventory.setItem(o[0], TOURNOI_IS.CODEC.parse(ops, TOURNOI_SNBT.parseTag(o[1])).getOrThrow()) }
    catch (x) { console.error('[Atheria tournoi] objet non rendu à ' + p.username + ' (case ' + o[0] + ') : ' + o[1] + ' : ' + x) }
  })
  var mo = tournoiModele(p)
  if (mo && pd.contains('atheria_tournoi_fa')) {
    try {
      var parts = JSON.parse(String(pd.getString('atheria_tournoi_fa'))), k = 0
      mo.forEach(part => { if (k < parts.length) part.currentHealth = parts[k]; k++ })
      mo.scheduleResync()
    } catch (x) { console.error('[Atheria tournoi] First Aid : ' + x) }
  }
  p.setHealth(Math.max(1, pd.getFloat('atheria_tournoi_vie')))
  p.foodData.setFoodLevel(pd.getInt('atheria_tournoi_faim'))
  ;['atheria_tournoi_sac', 'atheria_tournoi_fa', 'atheria_tournoi_vie', 'atheria_tournoi_faim'].forEach(k => pd.remove(k))
  server.runCommandSilent('effect clear ' + p.username + ' minecraft:glowing')
  p.clearFire()
}

// objets du kit tombés dans l'arène (lâchés) : retirés, rien ne sort du tournoi
function tournoiNettoyer(server) {
  server.overworld().getEntities().forEach(m => { if (String(m.type) == 'minecraft:item' && tournoiDans(m, 3)) m.discard() })
}

// ---------- tableau ----------
function tournoiLa(ctx, n) {
  var p = ctx.trouver(n)
  return p != null && tournoiDist(p) <= TOURNOI.rayonPublic && !ctx.d.sortis[n]
}

function tournoiSuivant(ctx) {
  var d = ctx.d
  if (d.impose) {
    var im = d.impose
    d.impose = null
    if (tournoiLa(ctx, im[0]) && tournoiLa(ctx, im[1])) {
      // les deux quittent leur place du tableau pour ce duel imposé ; le gagnant y reprend la place
      d.file = d.file.map(pa => pa.filter(n => im.indexOf(n) < 0)).filter(pa => {
        if (pa.length == 1) { d.vainqueurs.push(pa[0]); return false }
        return pa.length == 2
      })
      d.restants = d.restants.filter(n => im.indexOf(n) < 0)
      d.vainqueurs = d.vainqueurs.filter(n => im.indexOf(n) < 0)
      return { a: [im[0]], b: [im[1]], type: 'duel' }
    }
  }
  while (true) {
    if (d.file.length) {
      var paire = d.file.shift()
      if (paire.every(n => tournoiLa(ctx, n))) return { a: [paire[0]], b: [paire[1]], type: 'duel' }
      paire.filter(n => tournoiLa(ctx, n)).forEach(n => d.vainqueurs.push(n))
      continue
    }
    if (!d.champion && d.restants.length + d.vainqueurs.length <= 1) {
      var ch = d.vainqueurs.concat(d.restants)[0] || ''
      d.champion = ch || '-'
      if (ch) {
        ctx.score(ch, TOURNOI.points.champion)
        ctx.radio('Champion du tournoi : ' + ch + '. Angellow lui serre la main et dit « six-seven ». Zaida dit que ça veut dire bravo.', 'Zaida :')
        ctx.banniere('quete', 'Le tournoi d\'Angellow', ch + ', champion', 'Le Refuge acclame son champion de fin de saison.', tournoiPublic(ctx))
      }
      var dispo = d.combattants.filter(n => tournoiLa(ctx, n)).sort((x, y) => (d.victoires[y] || 0) - (d.victoires[x] || 0))
      if (ch && dispo.indexOf(ch) > 0) { dispo.splice(dispo.indexOf(ch), 1); dispo.unshift(ch) }
      if (dispo.length >= 4) return { a: [dispo[0], dispo[dispo.length - 1]], b: [dispo[1], dispo[2]], type: 'equipe' }
      return null
    }
    if (d.champion) return null
    if (d.restants.length == 0) {
      d.restants = tournoiMelanger(d.vainqueurs.slice())
      d.vainqueurs = []
      d.tour++
      if (d.restants.length <= 1) continue
    }
    var l = d.restants.filter(n => tournoiLa(ctx, n))
    d.restants = []
    if (l.length % 2 == 1) {
      var ex = l.pop()
      d.vainqueurs.push(ex)
      var pe = ctx.trouver(ex)
      if (pe) ctx.action(pe, 'tacz:modern_kinetic_gun', 'Nombre impair au tirage : tu passes directement au tour suivant.', 'vert')
    }
    for (var i = 0; i + 1 < l.length; i += 2) d.file.push([l[i], l[i + 1]])
  }
}

function tournoiAnnoncer(ctx, m, s) {
  var d = ctx.d
  d.n++
  d.m = { a: m.a, b: m.b, type: m.type, ko: [], debut: s + TOURNOI.pariSec, fin: s + TOURNOI.pariSec + TOURNOI.matchSec, mort: false }
  d.paris = {}
  d.phase = 'paris'
  var titre = (m.type == 'equipe' ? '2 contre 2 : ' : 'Duel ' + d.n + ' : ') + tournoiNoms(m.a) + ' contre ' + tournoiNoms(m.b)
  ctx.radio(titre + '. Pariez : /parier <joueur> <bons>, jusqu\'à ' + TOURNOI.pariMax + ' bons. Début dans ' + TOURNOI.pariSec + ' s.', 'Zaida :')
  ctx.banniere('evenement', 'Le tournoi d\'Angellow', titre, 'Les paris sont ouverts : /parier <joueur> <bons>.', tournoiPublic(ctx))
}

function tournoiCommencer(ctx, s) {
  var d = ctx.d, m = d.m
  var absA = m.a.filter(n => !tournoiLa(ctx, n)), absB = m.b.filter(n => !tournoiLa(ctx, n))
  if (absA.length || absB.length) {
    if (absA.length && absB.length) { tournoiFinir(ctx, s, '', 'Personne ne s\'est présenté. Angellow hausse les épaules : « six-seven ».'); return }
    tournoiFinir(ctx, s, absA.length ? 'b' : 'a', 'Forfait de ' + (absA.length ? absA : absB).join(' et ') + '.')
    return
  }
  d.phase = 'match'
  m.debut = s; m.fin = s + TOURNOI.matchSec
  var level = ctx.server.overworld(), c = tournoiCentre()
  ;['a', 'b'].forEach(k => m[k].forEach((nom, i) => {
    var p = ctx.trouver(nom), pt = TOURNOI.departs[k][i % TOURNOI.departs[k].length]
    tournoiEnCombattant(ctx.server, p)
    tournoiTp(ctx.server, p, pt[0] + 0.5, tournoiSol(level, pt[0], pt[1]), pt[1] + 0.5, c)
    tournoiArmer(ctx, p)
    ctx.action(p, 'tacz:modern_kinetic_gun', 'À toi ! Même kit pour tous, rien à perdre : ton sac t\'attend. Dernier debout gagne.', 'ambre')
  }))
  ctx.server.runCommandSilent('playsound minecraft:block.bell.use master @a ' + c[0] + ' ' + tournoiSol(level, c[0], c[1]) + ' ' + c[1] + ' 4 1')
  ctx.radio('Combat ! ' + tournoiNoms(m.a) + ' contre ' + tournoiNoms(m.b) + '. Angellow lève le bras : « six… seven ! »', 'Zaida :')
}

// fin d'un duel : camp gagnant 'a' / 'b' (ou '' sans vainqueur)
function tournoiFinir(ctx, s, camp, raison) {
  var d = ctx.d, m = d.m
  var gagnants = camp ? m[camp] : []
  m.a.concat(m.b).forEach(n => {
    var p = ctx.trouver(n)
    if (!p) return
    tournoiRendre(ctx.server, p)
    if (tournoiDist(p) <= TOURNOI.rayonPublic) tournoiEnSpectateur(ctx, p)
  })
  tournoiNettoyer(ctx.server)
  gagnants.forEach(n => {
    d.victoires[n] = (d.victoires[n] || 0) + 1
    ctx.score(n, m.type == 'equipe' ? TOURNOI.points.equipe : TOURNOI.points.victoire)
  })
  if (m.type == 'duel' && gagnants.length) d.vainqueurs.push(gagnants[0])
  var titre = gagnants.length ? tournoiNoms(gagnants) + (gagnants.length > 1 ? ' gagnent' : ' gagne') : 'Pas de vainqueur'
  ctx.radio(titre + '. ' + (raison || ''), 'Zaida :')
  ctx.banniere('evenement', 'Le tournoi d\'Angellow', titre, raison || '', tournoiPublic(ctx))
  tournoiPayerParis(ctx, camp)
  d.historique.push([m.type, m.a, m.b, camp, raison || ''])
  d.m = null
  d.phase = 'attente'
  d.reprise = s + 6
}

function tournoiPayerParis(ctx, camp) {
  var d = ctx.d, noms = Object.keys(d.paris || {})
  if (!noms.length) return
  var cagnotte = 0, surGagnant = 0
  noms.forEach(n => { cagnotte += d.paris[n].bons; if (camp && d.paris[n].camp == camp) surGagnant += d.paris[n].bons })
  var mem = atheriaLiveMemoire(ctx.server), rembourse = !camp || surGagnant == 0
  noms.forEach(n => {
    var pa = d.paris[n], rendu = rembourse ? pa.bons : (pa.camp == camp ? Math.floor(cagnotte * pa.bons / surGagnant) : 0)
    var p = ctx.trouver(n)
    if (rendu <= 0) { if (p) ctx.action(p, 'atheria:bon_caf', 'Pari perdu (' + pa.bons + ' bons).', 'rouge'); return }
    if (!rembourse && rendu > pa.bons) ctx.score(n, rendu - pa.bons)
    if (p && !atheriaLiveFaux(p)) {
      ctx.server.runCommandSilent('give ' + p.username + ' atheria:bon_caf ' + rendu)
      ctx.action(p, 'atheria:bon_caf', rembourse ? 'Pari remboursé : ' + rendu + ' bons.' : 'Pari gagné : ' + rendu + ' bons (mise ' + pa.bons + ').', 'vert')
    } else if (!p) atheriaLiveDonner(ctx.server, mem, n, rendu, [], [], 'Le tournoi d\'Angellow : ton pari')
  })
  atheriaLiveMemoireEcrire(ctx.server, mem)
  d.paris = {}
}

// un combattant tombe : KO au lieu de la mort (appelé par les dégâts, ou directement par l'essai)
function tournoiKO(server, victime, auteur) {
  var e = atheriaLiveEtat(server)
  if (!e || e.nom != 'tournoi' || e.phase != 'encours') return false
  var r = tournoiKOctx(atheriaLiveCtx(server, e), victime, auteur)
  if (r) atheriaLiveEcrire(server, e)
  return r
}

// même chose sur l'état déjà ouvert de la soirée (depuis la seconde de la soirée : pas de relecture)
function tournoiKOctx(ctx, victime, auteur) {
  var server = ctx.server, d = ctx.d, m = d.m
  victime = String(victime); auteur = auteur ? String(auteur) : null
  if (d.phase != 'match' || !m || !tournoiCampDe(m, victime) || m.ko.indexOf(victime) >= 0) return false
  m.ko.push(victime)
  var cv = tournoiCampDe(m, victime)
  if (auteur && tournoiCampDe(m, auteur) && tournoiCampDe(m, auteur) != cv) ctx.score(auteur, TOURNOI.points.ko)
  var pv = ctx.trouver(victime)
  if (pv) {
    server.runCommandSilent('playsound minecraft:entity.player.hurt_sweet_berry_bush player @a ' + pv.x + ' ' + pv.y + ' ' + pv.z + ' 1 0.6')
    ctx.action(pv, 'minecraft:skeleton_skull', 'KO ! ' + (auteur ? auteur + ' t\'a eu. ' : '') + 'Tu retrouves ton sac, rien n\'est perdu.', 'rouge')
  }
  var restent = m[cv].filter(n => m.ko.indexOf(n) < 0)
  if (!restent.length) tournoiFinir(ctx, ctx.secondes, cv == 'a' ? 'b' : 'a', (auteur ? auteur + ' met ' + victime + ' KO.' : victime + ' est KO.'))
  else if (pv) {
    // 2 contre 2 : le coéquipier continue seul, le KO regarde
    tournoiRendre(server, pv)
    tournoiEnSpectateur(ctx, pv)
    ctx.radio(victime + ' est KO. ' + restent.join(' et ') + ' continue seul.', 'Zaida :')
  }
  return true
}

function tournoiCombattantEnMatch(server, p) {
  if (!p || !p.isPlayer()) return null
  var e = atheriaLiveEtat(server)
  if (!e || e.nom != 'tournoi' || e.phase != 'encours' || e.data.phase != 'match' || !e.data.m) return null
  var m = e.data.m
  return tournoiCampDe(m, p.username) && m.ko.indexOf(p.username) < 0 ? m : null
}

// First Aid : la blessure qui tuerait est annulée et devient un KO
NativeEvents.onEvent('ichttt.mods.firstaid.api.event.FirstAidLivingDamageEvent', event => {
  try {
    var p = event.getEntity()
    if (p.level.isClientSide() || !tournoiCombattantEnMatch(p.server, p)) return
    if (!event.getAfterDamage().isDead(p)) return
    event.setCanceled(true)
    var a = event.getSource().actual
    tournoiKO(p.server, p.username, a && a.isPlayer() ? a.username : null)
  } catch (x) {
    console.error('[Atheria tournoi] First Aid : ' + x)
  }
})

// filet : une mort en match (sans First Aid, chute, autre) est annulée elle aussi
NativeEvents.onEvent('net.neoforged.neoforge.event.entity.living.LivingDeathEvent', event => {
  try {
    var p = event.getEntity()
    if (!p.isPlayer() || p.level.isClientSide() || !tournoiCombattantEnMatch(p.server, p)) return
    event.setCanceled(true)
    p.setHealth(1)
    var a = event.getSource().actual
    tournoiKO(p.server, p.username, a && a.isPlayer() ? a.username : null)
  } catch (x) {
    console.error('[Atheria tournoi] mort : ' + x)
  }
})

atheriaLiveDeclarer('tournoi', {
  titre: 'Le tournoi d\'Angellow',
  radio: 'semaine',
  annonce: 'Fin de saison : le tournoi d\'Angellow, dans l\'arène du Refuge de Coconi. Duels au pistolet et au couteau, même kit pour tous, rien à perdre. Le public regarde et parie en bons CAF.',
  rappel: 'Le tournoi d\'Angellow approche, au Refuge de Coconi. Pour combattre, entrez dans l\'arène à l\'heure dite.',
  consigne: 'Inscription 5 minutes : entrez dans l\'arène du Refuge pour combattre, restez autour pour regarder et parier.',
  dureeMin: TOURNOI.dureeMin,
  objets: [['atheria:ration', 2]],
  titreGagnant: ['champion_angellow', 'Champion d\'Angellow'],
  surPlace: (ctx, p) => tournoiDist(p) <= TOURNOI.rayonPublic,
  debut: ctx => {
    var d = ctx.d
    d.phase = 'inscription'
    d.combattants = []; d.restants = []; d.vainqueurs = []; d.file = []; d.victoires = {}; d.historique = []
    d.n = 0; d.tour = 1; d.champion = ''; d.m = null; d.paris = {}; d.sortis = {}; d.impose = null
    var level = ctx.server.overworld(), c = tournoiCentre(), x = c[0], z = TOURNOI.arene[1] - 2.5
    ctx.server.runCommandSilent('execute in minecraft:overworld positioned ' + x + ' ' + tournoiSol(level, x, z) + ' ' + z + ' summon easy_npc:humanoid run data merge entity @s ' +
      '{EasyNPCVersion:3,PersistenceRequired:1b,CustomName:\'{"text":"Angellow","color":"#E8C66A"}\',CustomNameVisible:1b,' +
      'Tags:["atheria_live","' + ctx.marque + '","atheria_arbitre"],' +
      'EntityAttribute:{IsAttackableByPlayers:0b,IsAttackableByMonsters:0b,IsAttackableByFactions:0b,IsInvulnerable:1b,IsKnockbackResistant:1b,IsExplosionResistant:1b,HealthRegeneration:0.0d},' +
      'VariantType:"STEVE",SkinData:{Type:"RESOURCE_LOCATION",Texture:"atheria:textures/entity/pnj/angellow.png"},' +
      'ObjectiveData:{ObjectiveDataSet:[{Type:"LOOK_AT_PLAYER",Prio:7}]}}')
    ctx.radio('L\'arène du Refuge est ouverte. Entrez-y dans les 5 minutes pour combattre. Angellow arbitre. Il ne dira qu\'un seul mot.', 'Zaida :')
  },
  seconde: (ctx, s) => {
    var d = ctx.d, level = ctx.server.overworld()
    // le Refuge tient les infectés à l'écart
    if (s % 3 == 0) level.getEntities().forEach(m => {
      if (m.isPlayer() || m.tags.contains('atheria_live') || !atheriaEstMonstre(m)) return
      if (tournoiDist(m) <= TOURNOI.rayonPublic + 16) m.discard()
    })
    var presents = tournoiPresents(ctx)
    presents.forEach(p => ctx.inscrire(p))
    if (d.phase == 'inscription') {
      if (s % 30 == 0) presents.forEach(p => ctx.action(p, 'tacz:modern_kinetic_gun', tournoiDans(p) ?
        'Tu es dans l\'arène : tu combats. Sors-en pour seulement regarder et parier (' + Math.max(0, TOURNOI.inscriptionSec - s) + ' s).' :
        'Entre dans l\'arène pour combattre (fin des inscriptions dans ' + Math.max(0, TOURNOI.inscriptionSec - s) + ' s).', 'ambre'))
      if (s < TOURNOI.inscriptionSec) return
      d.combattants = presents.filter(p => tournoiDans(p)).map(p => p.username)
      if (d.combattants.length < 2) {
        ctx.radio('Pas assez de combattants dans l\'arène (' + d.combattants.length + '). Angellow range son couteau : « six-seven ». À la prochaine.', 'Zaida :')
        ctx.terminer()
        return
      }
      d.restants = tournoiMelanger(d.combattants.slice())
      ctx.radio(d.combattants.length + ' combattants : ' + d.combattants.join(', ') + '. Le tirage est fait. Tout le monde passe en spectateur : /suivre <joueur> pour voir avec ses yeux.', 'Zaida :')
      presents.forEach(p => tournoiEnSpectateur(ctx, p))
      d.phase = 'attente'; d.reprise = s + 4
      return
    }
    // tous les présents qui ne combattent pas regardent ; les spectateurs restent près de l'arène
    var m = d.m, enJeu = m && d.phase == 'match' ? m.a.concat(m.b).filter(n => m.ko.indexOf(n) < 0) : []
    presents.forEach(p => { if (enJeu.indexOf(p.username) < 0 && !d.sortis[p.username]) tournoiEnSpectateur(ctx, p) })
    ctx.joueurs().forEach(p => {
      if (atheriaLiveFaux(p) || !p.persistentData.contains('atheria_tournoi_spec') || !p.getCamera().equals(p)) return
      if (tournoiDist(p) > TOURNOI.rayonPublic - 4) tournoiVue(ctx.server, p)
    })
    if (d.phase == 'attente') {
      if (s < d.reprise) return
      var suivant = tournoiSuivant(ctx)
      if (!suivant) {
        ctx.radio('Le tournoi est fini. Merci à tous. Angellow salue le public : « six-seven ».', 'Zaida :')
        ctx.terminer()
        return
      }
      tournoiAnnoncer(ctx, suivant, s)
      return
    }
    if (d.phase == 'paris') {
      if (s >= m.debut) tournoiCommencer(ctx, s)
      return
    }
    if (d.phase != 'match') return
    // forfait en cours de duel (déconnecté, sorti du tournoi)
    var partis = enJeu.filter(n => { var p = ctx.trouver(n); return !p || d.sortis[n] })
    if (partis.length) {
      partis.forEach(n => { if (ctx.d.m) tournoiKOctx(ctx, n, null) })
      return
    }
    // les combattants restent dans l'arène
    enJeu.forEach(n => {
      var p = ctx.trouver(n)
      if (!tournoiDans(p, 0.5)) {
        var a = TOURNOI.arene, x = Math.min(Math.max(p.x, a[0] + 1.5), a[2] - 0.5), z = Math.min(Math.max(p.z, a[1] + 1.5), a[3] - 0.5)
        tournoiTp(ctx.server, p, x, tournoiSol(level, x, z), z, tournoiCentre())
      }
    })
    if (s >= m.fin) {
      if (!m.mort) {
        m.mort = true; m.fin = s + TOURNOI.mortSubiteSec
        enJeu.forEach(n => ctx.server.runCommandSilent('effect give ' + n + ' minecraft:glowing ' + TOURNOI.mortSubiteSec + ' 0 true'))
        ctx.radio('Le temps est écoulé : 30 s de mort subite. Ils brillent, plus moyen de se cacher.', 'Zaida :')
      } else {
        var forme = k => { var l = m[k].filter(n => m.ko.indexOf(n) < 0).map(n => ctx.trouver(n)).filter(p => p); return l.reduce((t, p) => t + p.health / p.maxHealth, 0) }
        var fa = forme('a'), fb = forme('b')
        tournoiFinir(ctx, s, fa == fb ? (Math.random() < 0.5 ? 'a' : 'b') : fa > fb ? 'a' : 'b', fa == fb ? 'Égalité parfaite : Angellow tranche à pile ou face, en disant « six-seven ».' : 'Au temps : le plus en forme l\'emporte.')
        return
      }
    }
    if (s % 5 == 0) {
      var reste = m.fin - s
      enJeu.forEach(n => { var p = ctx.trouver(n); ctx.action(p, 'tacz:modern_kinetic_gun', (m.mort ? 'Mort subite : ' : 'Temps restant : ') + reste + ' s', m.mort ? 'rouge' : 'ambre', reste / (m.mort ? TOURNOI.mortSubiteSec : TOURNOI.matchSec)) })
    }
  },
  fin: ctx => {
    var d = ctx.d
    if (d.paris && Object.keys(d.paris).length) tournoiPayerParis(ctx, '')
    ctx.server.players.forEach(p => { tournoiRendre(ctx.server, p); tournoiRetour(ctx.server, p) })
    tournoiNettoyer(ctx.server)
    ctx.server.getAllLevels().forEach(level => level.getEntities().forEach(m => { if (m.tags.contains('atheria_live')) m.discard() }))
  }
})

// /parier, /suivre, /tournoi quitter ; et pour les ops : /live tournoi duel <j1> <j2> (impose le prochain duel)
ServerEvents.commandRegistry(event => {
  var { commands: Commands, arguments: Arg } = event
  var etat = src => {
    var e = atheriaLiveEtat(src.server)
    return e && e.nom == 'tournoi' && e.phase == 'encours' ? e : null
  }
  var parier = (cx, qui, bons) => {
    var p = cx.source.player
    if (!p) return 0
    var non = t => { atheriaHudAction(p, 'atheria:bon_caf', t, 'rouge'); return 0 }
    var e = etat(cx.source)
    if (!e || !e.data.m || e.data.phase != 'paris') return non('Pas de paris ouverts en ce moment.')
    var d = e.data, m = d.m, camp = ''
    ;['a', 'b'].forEach(k => m[k].forEach(n => { if (n.toLowerCase() == String(qui).toLowerCase()) camp = k }))
    if (!camp) return non('Sur ce duel : ' + tournoiNoms(m.a) + ' ou ' + tournoiNoms(m.b) + '.')
    if (tournoiCampDe(m, p.username)) return non('Tu combats dans ce duel : pas de pari.')
    var deja = d.paris[p.username]
    if (deja && deja.camp != camp) return non('Tu as déjà parié sur l\'autre camp.')
    var total = (deja ? deja.bons : 0) + bons
    if (bons < 1 || total > TOURNOI.pariMax) return non('De 1 à ' + TOURNOI.pariMax + ' bons par duel (déjà misés : ' + (deja ? deja.bons : 0) + ').')
    if (marcheCompter(p, ['atheria:bon_caf']) < bons) return non('Tu n\'as pas ' + bons + ' bons sur toi.')
    marcheRetirer(p, ['atheria:bon_caf'], bons)
    d.paris[p.username] = { camp: camp, bons: total }
    atheriaLiveEcrire(p.server, e)
    atheriaHudAction(p, 'atheria:bon_caf', 'Pari : ' + total + ' bons sur ' + tournoiNoms(m[camp]) + '.', 'vert')
    return 1
  }
  var suivre = (cx, qui) => {
    var p = cx.source.player
    if (!p) return 0
    if (!etat(cx.source) || !p.persistentData.contains('atheria_tournoi_spec')) { atheriaHudAction(p, 'minecraft:ender_eye', 'Seulement pour les spectateurs du tournoi.', 'rouge'); return 0 }
    if (qui == null) { tournoiVue(p.server, p); return 1 }
    var c = null
    p.server.players.forEach(q => { if (q.username.toLowerCase() == String(qui).toLowerCase()) c = q })
    if (!c || c.persistentData.contains('atheria_tournoi_spec')) { atheriaHudAction(p, 'minecraft:ender_eye', 'Ce joueur ne combat pas en ce moment.', 'rouge'); return 0 }
    p.server.runCommandSilent('spectate ' + c.username + ' ' + p.username)
    atheriaHudAction(p, 'minecraft:ender_eye', 'Tu vois avec les yeux de ' + c.username + '. /suivre pour revenir.', 'vert')
    return 1
  }
  event.register(Commands.literal('parier')
    .then(Commands.argument('joueur', Arg.WORD.create(event))
      .then(Commands.argument('bons', Arg.INTEGER.create(event)).executes(cx => parier(cx, Arg.WORD.getResult(cx, 'joueur'), Arg.INTEGER.getResult(cx, 'bons'))))))
  event.register(Commands.literal('suivre').executes(cx => suivre(cx, null))
    .then(Commands.argument('joueur', Arg.WORD.create(event)).executes(cx => suivre(cx, Arg.WORD.getResult(cx, 'joueur')))))
  event.register(Commands.literal('tournoi').then(Commands.literal('quitter').executes(cx => {
    var p = cx.source.player, e = etat(cx.source)
    if (!p || !e) return 0
    e.data.sortis[p.username] = true
    atheriaLiveEcrire(p.server, e)
    tournoiRetour(p.server, p)
    atheriaHudAction(p, 'minecraft:ender_eye', 'Tu as quitté le tournoi. Bonne route.', 'ambre')
    return 1
  })))
  // « /live tournoi … » : le nœud littéral passe avant l'argument <nom> de /live, il reprend donc aussi « start »
  var lancer = (cx, mn) => { cx.source.sendSystemMessage(Text.of(atheriaLiveLancer(cx.source.server, 'tournoi', mn))); return 1 }
  event.register(Commands.literal('live').requires(src => src.hasPermission(2))
    .then(Commands.literal('tournoi')
      .then(Commands.literal('start').executes(cx => lancer(cx, null))
        .then(Commands.argument('minutes', Arg.INTEGER.create(event)).executes(cx => lancer(cx, Arg.INTEGER.getResult(cx, 'minutes')))))
      .then(Commands.literal('duel').then(Commands.argument('joueur1', Arg.WORD.create(event)).then(Commands.argument('joueur2', Arg.WORD.create(event)).executes(cx => {
        var e = etat(cx.source)
        var dire = t => { cx.source.sendSystemMessage(Text.of(t)); return 1 }
        if (!e || !e.data.combattants || !e.data.combattants.length) return dire('Le tournoi n\'a pas encore ses combattants.')
        var tr = n => e.data.combattants.filter(c => c.toLowerCase() == String(n).toLowerCase())[0]
        var j1 = tr(Arg.WORD.getResult(cx, 'joueur1')), j2 = tr(Arg.WORD.getResult(cx, 'joueur2'))
        if (!j1 || !j2 || j1 == j2) return dire('Deux combattants inscrits différents : ' + e.data.combattants.join(', '))
        e.data.impose = [j1, j2]
        atheriaLiveEcrire(cx.source.server, e)
        return dire('Prochain duel : ' + j1 + ' contre ' + j2 + '.')
      }))))))
})

// reconnexion : qui était combattant ou spectateur retrouve son sac et sa place si son duel est fini
PlayerEvents.loggedIn(event => {
  var p = event.player, pd = p.persistentData
  if (!pd.contains('atheria_tournoi_sac') && !pd.contains('atheria_tournoi_spec') && !pd.contains('atheria_tournoi_origine')) return
  var e = atheriaLiveEtat(p.server)
  var enCours = e && e.nom == 'tournoi' && e.phase == 'encours'
  if (pd.contains('atheria_tournoi_sac') && !(enCours && e.data.m && tournoiCampDe(e.data.m, p.username))) tournoiRendre(p.server, p)
  if (!enCours) tournoiRetour(p.server, p)
})
