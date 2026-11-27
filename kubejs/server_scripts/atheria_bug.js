// Atheria - commande /bug pour les testeurs (Mika 27/11 : « très précise, t'envoyer directement les retours et m'informer ;
// même si ce n'est pas un bug, ça peut être un retour : les zombies font trop de dégâts, le butin progressif ne marche pas,
// tel objet est trop fort... »).
//   /bug <catégorie> <ce qui ne va pas>   (Tab propose les catégories ; sans catégorie, le retour est classé « autre »)
// Chaque retour est ajouté à /atheria-bugs/rapports.jsonl à la racine du serveur (un objet JSON par ligne, numéroté),
// avec tout ce qu'il faut pour le reproduire : date, joueur, catégorie, texte, position, dimension, lieu, biome, regard,
// jour et heure de jeu, météo, vie, faim, temps de jeu, objets en main, ce que le joueur vise (créature ou bloc),
// créatures hostiles autour, véhicule, dernier coup reçu, soirée en cours. Une ligne courte va aussi dans rapports.tsv.
// Claude relève le fichier régulièrement et prévient Mika ; les admins en ligne voient chaque retour arriver,
// et ceux qui étaient absents voient à la connexion combien de retours sont arrivés depuis.
// Une attente de 20 s entre deux retours d'un même joueur évite les doublons. Rien dans le chat pour les joueurs.
var BUG = {
  dossier: 'atheria-bugs', jsonl: 'rapports.jsonl', tsv: 'rapports.tsv',
  attenteMs: 20000, longueurMin: 8, longueurMax: 600, rayonHostiles: 24, portee: 24, dernier: {},
  // [catégorie, libellé, exemple]
  categories: [
    ['bug', 'Bug', 'un portail ne s\'ouvre pas, un objet disparaît'],
    ['equilibrage', 'Équilibrage', 'les zombies font trop de dégâts, la nuit est trop dure'],
    ['butin', 'Butin', 'le butin progressif ne marche pas, trop de munitions dans les coffres'],
    ['objet', 'Objet', 'tel objet est trop fort, telle arme ne sert à rien'],
    ['carte', 'Carte', 'bâtiment coupé, trou, pilier, route qui mène nulle part'],
    ['quete', 'Quête', 'une quête ne se valide pas, un PNJ ne répond pas'],
    ['vehicule', 'Véhicule', 'impossible de démarrer, essence, pièces'],
    ['interface', 'Interface', 'un écran se superpose, un texte en anglais'],
    ['pnj', 'PNJ', 'un habitant coincé, un Coupeur qui n\'attaque pas'],
    ['performance', 'Performance', 'lag, chute de FPS à tel endroit'],
    ['idee', 'Idée', 'ce qui rendrait le jeu meilleur'],
    ['autre', 'Autre', 'tout le reste']
  ]
}

var BUG_FU = Java.loadClass('org.apache.commons.io.FileUtils')

function atheriaBugFichier(nom) {
  return BUG_FU['getFile(java.lang.String[])']([BUG.dossier, nom])
}

function atheriaBugHeure(decalageH) {
  var d = new Date(Date.now() + decalageH * 3600 * 1000), z = n => (n < 10 ? '0' : '') + n
  return d.getUTCFullYear() + '-' + z(d.getUTCMonth() + 1) + '-' + z(d.getUTCDate()) + ' ' + z(d.getUTCHours()) + ':' + z(d.getUTCMinutes())
}

function atheriaBugEssai(f, defaut) {
  try { var v = f(); return v == null ? defaut : v } catch (e) { return defaut }
}

function atheriaBugObjet(st) {
  if (!st || st.isEmpty()) return ''
  var t = st.getCount() + ' ' + st.getId()
  var nom = atheriaBugEssai(() => '' + st.getHoverName().getString(), '')
  return nom ? t + ' (' + nom + ')' : t
}

// tout ce qui aide à reproduire le problème, là où se trouve le joueur
function atheriaBugContexte(p) {
  var level = p.level, server = p.server, x = Math.floor(p.x), y = Math.floor(p.y), z = Math.floor(p.z)
  var jour = level.getDayTime(), h = Math.floor((jour % 24000) / 1000 + 6) % 24, mn = Math.floor((jour % 1000) * 60 / 1000)
  var c = {
    dimension: '' + level.dimension,
    position: [x, y, z],
    regard: ['sud', 'ouest', 'nord', 'est'][Math.floor(((p.yRot % 360) + 360 + 45) % 360 / 90)] + ', ' + (p.xRot < -30 ? 'vers le haut' : p.xRot > 30 ? 'vers le bas' : 'à l\'horizontale'),
    jour_de_jeu: Math.floor(jour / 24000) + 1,
    heure_de_jeu: (h < 10 ? '0' : '') + h + ':' + (mn < 10 ? '0' : '') + mn,
    meteo: level.isThundering() ? 'orage' : level.isRaining() ? 'pluie' : 'clair',
    vie: Math.round(p.health * 10) / 10 + '/' + Math.round(p.maxHealth),
    faim: atheriaBugEssai(() => p.foodData.getFoodLevel(), -1),
    temps_de_jeu_h: Math.round(atheriaBugEssai(() => p.stats.getPlayTime(), 0) / 72000 * 10) / 10,
    mode: atheriaBugEssai(() => '' + p.gameMode.getGameModeForPlayer().getName(), '')
  }
  c.biome = atheriaBugEssai(() => '' + level.getBiome(ATHERIA_BP.containing(x, y, z)).unwrapKey().get().location(), '')
  c.lieu = atheriaBugEssai(() => { var l = atheriaLieuA(x, z); return l ? (l.nom || l[1] || '' + l) : '' }, '')
  c.zone_sure = atheriaBugEssai(() => { var zs = atheriaZoneSure(level, x, z); return zs ? zs.nom : '' }, '')
  c.main = atheriaBugObjet(p.mainHandItem)
  c.main_gauche = atheriaBugObjet(p.offHandItem)
  // ce que le joueur vise
  atheriaBugEssai(() => {
    var r = p.rayTrace(BUG.portee, false)
    if (r && r.entity) {
      var en = r.entity
      c.vise = 'créature ' + en.type + (en.customName ? ' « ' + en.customName.getString() + ' »' : '') +
        (en.isLiving && en.isLiving() ? ', vie ' + Math.round(en.health) + '/' + Math.round(en.maxHealth) : '') +
        ' à ' + Math.round(en.distanceTo(p)) + ' blocs'
    } else if (r && r.block) {
      var b = r.block
      c.vise = 'bloc ' + b.id + ' en ' + b.x + ' ' + b.y + ' ' + b.z
    }
  }, null)
  // créatures hostiles proches, par espèce
  atheriaBugEssai(() => {
    var compte = {}, n = 0, R = BUG.rayonHostiles
    level.getEntities().forEach(m => {
      if (m == p || !m.isAlive() || Math.abs(m.x - p.x) > R || Math.abs(m.z - p.z) > R || Math.abs(m.y - p.y) > R) return
      var hostile = (m.isMonster && m.isMonster()) || m.tags.contains('atheria_coupeur')
      if (!hostile) return
      var t = '' + m.type
      compte[t] = (compte[t] || 0) + 1
      n++
    })
    c.hostiles_24_blocs = n
    if (n) c.hostiles_detail = Object.keys(compte).sort((a, b) => compte[b] - compte[a]).slice(0, 6).map(k => compte[k] + ' ' + k).join(', ')
  }, null)
  c.vehicule = atheriaBugEssai(() => {
    if (typeof atheriaDidaVhMonte === 'function' && atheriaDidaVhMonte(p) != null) return 'véhicule MTS'
    return p.vehicle ? '' + p.vehicle.type : ''
  }, '')
  c.dernier_coup = atheriaBugEssai(() => {
    var s = p.getLastDamageSource()
    if (!s) return ''
    var auteur = s.actual
    return '' + s.getType() + (auteur ? ' par ' + auteur.type : '')
  }, '')
  c.soiree = atheriaBugEssai(() => { var e = atheriaLiveEtat(server); return e ? e.nom + ' (' + e.phase + ')' : '' }, '')
  c.joueurs_en_ligne = server.players.size()
  return c
}

function atheriaBugEnregistrer(p, categorie, texte) {
  var server = p.server, pd = server.persistentData
  var numero = pd.getInt('atheria_bug_numero') + 1
  pd.putInt('atheria_bug_numero', numero)
  var propre = ('' + texte).replace(/[\t\r\n]+/g, ' ').trim().substring(0, BUG.longueurMax)
  var r = { n: numero, date_reunion: atheriaBugHeure(4), date_paris: atheriaBugHeure(1), joueur: p.username, categorie: categorie, texte: propre }
  var c = atheriaBugContexte(p)
  for (var k in c) r[k] = c[k]
  BUG_FU['writeStringToFile(java.io.File,java.lang.String,java.lang.String,boolean)'](atheriaBugFichier(BUG.jsonl), JSON.stringify(r) + '\n', 'UTF-8', true)
  var ligne = [r.date_reunion, p.username, categorie, r.dimension, r.position.join(' '), r.lieu || r.biome, propre].join('\t')
  BUG_FU['writeStringToFile(java.io.File,java.lang.String,java.lang.String,boolean)'](atheriaBugFichier(BUG.tsv), ligne + '\n', 'UTF-8', true)
  console.info('[Atheria bug] n°' + numero + ' ' + ligne)
  // les admins en ligne le voient arriver
  var lib = (BUG.categories.find(x => x[0] == categorie) || ['', categorie])[1]
  server.players.forEach(q => {
    if (q == p || !q.hasPermissions(2)) return
    atheriaHudAction(q, 'minecraft:writable_book', 'Retour n°' + numero + ' de ' + p.username + ' (' + lib + ') : ' + (propre.length > 90 ? propre.substring(0, 88) + '…' : propre), 'ambre')
    q.persistentData.putInt('atheria_bug_vu', numero)
  })
  return numero
}

function atheriaBugEnvoyer(ctx, categorie, texte) {
  var p = ctx.source.player
  if (!p) return 0
  var now = Date.now(), avant = BUG.dernier[p.username] || 0
  if (now - avant < BUG.attenteMs) {
    atheriaHudAction(p, 'minecraft:writable_book', 'Retour déjà envoyé, réessaie dans ' + Math.ceil((BUG.attenteMs - (now - avant)) / 1000) + ' s.', 'ambre')
    return 0
  }
  if (('' + texte).trim().length < BUG.longueurMin) {
    atheriaHudAction(p, 'minecraft:writable_book', 'Décris un peu plus : ce que tu faisais, ce qui s\'est passé, ce que tu attendais.', 'ambre')
    return 0
  }
  try {
    var n = atheriaBugEnregistrer(p, categorie, texte)
    BUG.dernier[p.username] = now
    atheriaHudAction(p, 'minecraft:writable_book', 'Merci ! Retour n°' + n + ' enregistré, avec ta position et ce que tu tiens.', 'vert')
    return 1
  } catch (err) {
    console.error('[Atheria bug] ' + err)
    atheriaHudAction(p, 'minecraft:writable_book', 'Le retour n\'a pas pu être enregistré, préviens un admin.', 'rouge')
    return 0
  }
}

ServerEvents.commandRegistry(event => {
  var Commands = event.commands
  var Str = Java.loadClass('com.mojang.brigadier.arguments.StringArgumentType')
  var aide = ctx => {
    var p = ctx.source.player
    if (p) atheriaHudAction(p, 'minecraft:writable_book', 'Écris /bug, une catégorie (Tab les propose), puis ce qui ne va pas. Ex. : /bug equilibrage les zombies tuent en 3 coups', 'ambre')
    return 1
  }
  var racine = Commands.literal('bug').executes(aide)
  BUG.categories.forEach(cat => {
    racine = racine.then(Commands.literal(cat[0]).executes(ctx => {
      var p = ctx.source.player
      if (p) atheriaHudAction(p, 'minecraft:writable_book', cat[1] + ' : écris aussi ce qui ne va pas (ex. ' + cat[2] + ').', 'ambre')
      return 1
    }).then(Commands.argument('description', Str.greedyString()).executes(ctx => atheriaBugEnvoyer(ctx, cat[0], Str.getString(ctx, 'description')))))
  })
  // sans catégorie : classé « autre »
  racine = racine.then(Commands.argument('description', Str.greedyString()).executes(ctx => atheriaBugEnvoyer(ctx, 'autre', Str.getString(ctx, 'description'))))
  event.register(racine)
  // admins : les 5 derniers retours (lecture du fichier)
  event.register(Commands.literal('bugs').requires(src => src.hasPermission(2)).executes(ctx => {
    var p = ctx.source.player
    var f = atheriaBugFichier(BUG.jsonl)
    if (!f.exists()) { ctx.source.sendSystemMessage(Text.gray('Aucun retour pour l\'instant.')); return 1 }
    var lignes = BUG_FU.readLines(f, 'UTF-8'), dep = Math.max(0, lignes.size() - 5)
    for (var i = dep; i < lignes.size(); i++) {
      var r = JSON.parse('' + lignes.get(i))
      ctx.source.sendSystemMessage(Text.gold('n°' + r.n + ' ').append(Text.white(r.date_paris + ' ' + r.joueur + ' [' + r.categorie + '] ')).append(Text.gray(r.position.join(' ') + ' : ')).append(Text.white(r.texte)))
    }
    if (p) p.persistentData.putInt('atheria_bug_vu', p.server.persistentData.getInt('atheria_bug_numero'))
    return 1
  }))
})

// un admin qui se connecte voit combien de retours sont arrivés pendant son absence
PlayerEvents.loggedIn(event => {
  var p = event.player
  if (!p.hasPermissions(2)) return
  var total = event.server.persistentData.getInt('atheria_bug_numero'), vu = p.persistentData.getInt('atheria_bug_vu')
  if (total <= vu) return
  event.server.scheduleInTicks(400, () => {
    if (!p.isAlive()) return
    atheriaHudAction(p, 'minecraft:writable_book', (total - vu) + ' nouveau' + (total - vu > 1 ? 'x retours' : ' retour') + ' des testeurs depuis ta dernière venue. /bugs pour les 5 derniers.', 'ambre')
  })
})
