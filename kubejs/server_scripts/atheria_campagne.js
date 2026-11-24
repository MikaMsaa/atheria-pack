// Atheria saison 1 « La Grande Chiasse » : mécaniques de campagne.
// Les étapes de quête sont des tags joueur (lus par FTB Quests comme des stages).
// Toutes les variables sont en var : le Rhino de KubeJS plante (« redeclaration of var ») sur des const déclarés dans plusieurs blocs.
// L'aura, les actes et les annonces de titres sont gérés par la fonction atheria:boucle (datapack).

var ATHERIA_INFECTES = /^(spore:|hordes:)|^minecraft:(zombie|husk|drowned|zombie_villager)$/

function atheriaCmd(server, cmd) {
  server.runCommandSilent(cmd)
}

function atheriaNuit(level) {
  // level.dayTime renvoie undefined avec KubeJS 7 (NaN : la radio ne marchait jamais) : on passe par getDayTime()
  var t = Number(level.getDayTime()) % 24000
  return t >= 13000 && t < 23000
}

// Lecture du carnet et des archives : ouvre un vrai livre (écran de livre vanilla) au lieu d'écrire dans le tchat.
// Astuce : on fait croire au client que l'objet en main est un livre écrit (paquet d'emplacement), on ouvre le livre,
// puis on lui renvoie l'objet réel. Rien ne change côté serveur. En cas d'échec, repli sur le tchat.
var ATHERIA_J = null
function atheriaClasses() {
  // chargées à la première lecture seulement : si une classe est refusée, le reste du script continue de marcher
  if (!ATHERIA_J) ATHERIA_J = {
    WrittenBook: Java.loadClass('net.minecraft.world.item.component.WrittenBookContent'),
    Filterable: Java.loadClass('net.minecraft.server.network.Filterable'),
    DataComponents: Java.loadClass('net.minecraft.core.component.DataComponents'),
    SetSlot: Java.loadClass('net.minecraft.network.protocol.game.ClientboundContainerSetSlotPacket'),
    OpenBook: Java.loadClass('net.minecraft.network.protocol.game.ClientboundOpenBookPacket'),
    ItemStack: Java.loadClass('net.minecraft.world.item.ItemStack'),
    Items: Java.loadClass('net.minecraft.world.item.Items'),
    ArrayList: Java.loadClass('java.util.ArrayList'),
    Component: Java.loadClass('net.minecraft.network.chat.Component'),
    Fmt: Java.loadClass('net.minecraft.ChatFormatting')
  }
  return ATHERIA_J
}

// largeur approximative des caractères de la police Minecraft (page de livre : 114 px, 14 lignes)
function atheriaLargeur(ch) {
  if ('il.,;:!|\''.indexOf(ch) >= 0) return 2
  if ('It[]'.indexOf(ch) >= 0) return 4
  if (ch === ' ' || ch === 'f' || ch === 'k' || ch === '«' || ch === '»') return ch === ' ' ? 4 : 5
  return 6
}

function atheriaCouper(texte, largeurMax, gras) {
  var lignes = [], cur = '', w = 0
  String(texte).split(' ').forEach(mot => {
    var mw = 0
    for (var i = 0; i < mot.length; i++) mw += atheriaLargeur(mot.charAt(i)) + (gras ? 1 : 0)
    if (cur.length && w + 4 + mw > largeurMax) { lignes.push(cur); cur = mot; w = mw }
    else if (cur.length) { cur = cur + ' ' + mot; w += 4 + mw }
    else { cur = mot; w = mw }
  })
  if (cur.length) lignes.push(cur)
  return lignes
}

function atheriaPages(J, titre, paragraphes) {
  // « Archive 07 - Le titre » : petit en-tête gris + titre en gras rouge
  var m = /^(Archive \d+)\s*-\s*(.+)$/.exec(titre)
  var entete = m ? m[1].toUpperCase() : null
  var t = m ? m[2] : titre
  var tl = atheriaCouper(t, 110, true)
  var lignes = []
  paragraphes.forEach((p, ip) => {
    if (ip > 0) lignes.push('')
    atheriaCouper(p, 112, false).forEach(l => lignes.push(l))
  })
  var pages = [], page = [], max = 14 - tl.length - 1 - (entete ? 1 : 0)
  lignes.forEach(l => {
    if (page.length >= max) { pages.push(page); page = []; max = 14 }
    if (page.length === 0 && l === '') return
    page.push(l)
  })
  if (page.length) pages.push(page)
  var out = new J.ArrayList()
  pages.forEach((pg, i) => {
    var c = J.Component.literal('')
    if (i === 0) {
      if (entete) c.append(J.Component.literal(entete + '\n').withStyle(J.Fmt.DARK_GRAY))
      c.append(J.Component.literal(tl.join('\n')).withStyle(J.Fmt.DARK_RED).withStyle(J.Fmt.BOLD))
      c.append(J.Component.literal('\n\n'))
    }
    c.append(J.Component.literal(pg.join('\n')).withStyle(J.Fmt.BLACK))
    out.add(J.Filterable.passThrough(c))
  })
  if (out.size() > 100) out = new J.ArrayList(out.subList(0, 100))
  return out
}

function atheriaLivre(player, hand, titre, paragraphes) {
  var J = atheriaClasses()
  var livre = new J.ItemStack(J.Items.WRITTEN_BOOK)
  livre.set(J.DataComponents.WRITTEN_BOOK_CONTENT, new J.WrittenBook(J.Filterable.passThrough(titre.substring(0, Math.min(32, titre.length))), 'Atheria', 0, atheriaPages(J, titre, paragraphes), true))
  var slot = String(hand) === 'MAIN_HAND' ? player.getInventory().selected : 40
  var reel = player.getItemInHand(hand).copy()
  player.connection.send(new J.SetSlot(-2, 0, slot, livre))
  player.connection.send(new J.OpenBook(hand))
  player.connection.send(new J.SetSlot(-2, 0, slot, reel))
  atheriaCmd(player.server, `playsound minecraft:item.book.page_turn player ${player.username} ~ ~ ~ 1 1`)
}

function atheriaLire(player, id, hand) {
  var txt = global.ATHERIA_TEXTES ? global.ATHERIA_TEXTES[id] : null
  if (!txt) return false
  // Carnet animé du mod atheria_hud (couverture qui s'ouvre, pages qui tournent) ; livre vanilla en secours
  if (typeof atheriaHud === 'function') {
    atheriaHud(player, { t: 'livre', titre: String(txt.titre), texte: txt.lignes.map(l => String(l)).join('\n') })
    return true
  }
  var lignes = txt.lignes.map(l => String(l).replace(/&[0-9a-fklmnor]/g, ''))
  try {
    atheriaLivre(player, hand, String(txt.titre), lignes)
  } catch (e) {
    console.warn('Atheria : livre impossible, repli sur le tchat (' + e + ')')
    player.tell(Text.gold('— ' + txt.titre + ' —'))
    lignes.forEach(l => player.tell(Text.gray(l)))
  }
  return true
}

// ---------- premier réveil : le kit de départ ----------
PlayerEvents.loggedIn(event => {
  var player = event.player
  if (player.persistentData.getBoolean('atheria_kit')) return
  player.persistentData.putBoolean('atheria_kit', true)
  // le reste du kit de départ est la récompense de la première quête du prologue
  player.give('atheria:carnet_survivant')
  player.give('ftbquests:book')
  // après l'arrivée protégée et l'introduction : la bannière attend qu'aucun écran ne soit ouvert
  atheriaHudBanniere(player, 'info', 'Prologue', 'Le réveil', 'Tu te réveilles dans une case en tôle. Un carnet signé « R. » : clic droit pour le lire, puis ouvre ton livre de quêtes.')
})

// ---------- cendre grise : 10 minutes, retirée à l'expiration, à la mort ou au premier infecté tué ----------
var ATHERIA_CENDRE_MS = 600000
function atheriaCendreRetire(player, msg) {
  player.persistentData.remove('atheria_cendre_fin')
  if (!player.tags.contains('cendre_grise')) return
  player.removeTag('cendre_grise')
  if (msg) atheriaHudAction(player, 'atheria:cendre_grise', msg, '')
}
// l'expiration est un horodatage réel : elle tient aussi après une déconnexion ou un redémarrage
function atheriaCendreVerifie(player) {
  if (!player.tags.contains('cendre_grise')) return
  var fin = player.persistentData.getLong('atheria_cendre_fin')
  if (!fin || Date.now() >= fin - 1000) atheriaCendreRetire(player, 'La cendre grise s\'effrite. Les infectés te voient de nouveau.')
}
PlayerEvents.loggedIn(event => {
  atheriaCendreVerifie(event.player)
})
EntityEvents.death('minecraft:player', event => {
  atheriaCendreRetire(event.entity, null)
})

// ---------- objets utilisables ----------
ItemEvents.rightClicked(event => {
  var player = event.player
  var id = String(event.item.id)
  var server = player.server
  var name = player.username

  if (id.startsWith('atheria:archive_') || id === 'atheria:carnet_survivant') {
    if (atheriaLire(player, id, event.hand)) event.cancel()
    return
  }

  if (id === 'atheria:radio_portative') {
    if (player.isCrouching()) {
      routeRadioVille(player)
      event.cancel()
      return
    }
    if (!atheriaNuit(event.level)) {
      atheriaHudAction(player, 'atheria:radio_portative', 'Grésillements. La voix ne parle que la nuit.', '')
      event.cancel()
      return
    }
    atheriaHudBanniere(player, 'signal', '104.0 MHz', '', '« ...si vous entendez ce message, venez au Bénara. Nous avons un remède. Nous avons de l\'eau. Venez au Bénara... »')
    player.addTag('radio_voix')
    // énigme du chapitre 3 : trois points hauts éloignés d'au moins 300 blocs
    if (player.tags.contains('acte_3') && player.y >= 120) {
      var data = player.persistentData
      var pts = data.getString('atheria_radio').split(';').filter(s => s.length > 0)
      var x = Math.floor(player.x), z = Math.floor(player.z)
      var loin = pts.every(p => {
        var c = p.split(',')
        return Math.hypot(x - Number(c[0]), z - Number(c[1])) >= 300
      })
      if (loin) {
        pts.push(x + ',' + z)
        data.putString('atheria_radio', pts.join(';'))
        atheriaHudBanniere(player, 'quete', 'Point d\'écoute ' + pts.length + ' / 3', '', 'Le signal vient de plus loin que le Bénara.')
      }
      if (pts.length >= 3) player.addTag('radio_3_points')
    }
    event.cancel()
    return
  }

  if (id === 'atheria:boitier_ecoute') {
    if (player.y < 120) {
      atheriaHudAction(player, 'atheria:boitier_ecoute', 'Trop bas. Il faut l\'installer au sommet d\'une tour (altitude 120 ou plus).', 'ambre')
    } else {
      event.item.shrink(1)
      player.addTag('boitier_installe')
      atheriaHudBanniere(player, 'quete', 'Relais', 'Boîtier installé', 'Le relais écoute maintenant pour les Goblini.')
      atheriaCmd(server, `playsound minecraft:block.beacon.power_select master ${name} ~ ~ ~ 1 1.4`)
    }
    event.cancel()
    return
  }

  if (id === 'atheria:carte_caf') {
    var jour = Math.floor(Date.now() / 86400000)
    var data = player.persistentData
    if (data.getInt('atheria_caf_jour') === jour) {
      atheriaHudAction(player, 'atheria:carte_caf', 'Votre demande a déjà été traitée aujourd\'hui. Merci de votre patience.', '')
    } else {
      data.putInt('atheria_caf_jour', jour)
      player.give('4x atheria:bon_caf')
      atheriaHudAction(player, 'atheria:bon_caf', 'Versement CAF : 4 bons. Votre dossier reste incomplet.', 'vert')
    }
    event.cancel()
    return
  }

  if (id === 'atheria:cendre_grise') {
    event.item.shrink(1)
    // 10/11 : plus d'invisibilité (elle cachait aussi le joueur aux autres joueurs en PvP).
    // Le tag cendre_grise est lu par le bestiaire (Dakouane et Contaminés ignorent le joueur).
    var fin = Date.now() + ATHERIA_CENDRE_MS
    player.persistentData.putLong('atheria_cendre_fin', fin)
    player.addTag('cendre_grise')
    atheriaHudAction(player, 'atheria:cendre_grise', 'Cendre grise : 10 minutes. Les infectés faibles ne te voient plus. La PAF, si.', 'ambre')
    server.scheduleInTicks(12000, () => {
      var p2 = server.getPlayer(name)
      if (p2) atheriaCendreVerifie(p2)
    })
    event.cancel()
  }
})

// ---------- constructions (porte, lit, coffre, feu, panneau) ----------
BlockEvents.placed(event => {
  var p = event.entity
  if (!p || !p.isPlayer()) return
  var id = String(event.block.id)
  if (id.endsWith('_door')) p.addTag('pose_porte')
  else if (id.endsWith('_bed') || id.startsWith('comforts:')) p.addTag('pose_lit')
  else if (id.endsWith('chest') || id.endsWith('barrel')) p.addTag('pose_coffre')
  else if (id.endsWith('campfire')) p.addTag('pose_feu')
  else if (id.endsWith('_sign') || id.includes('sign_post')) p.addTag('pose_panneau')
})

// ---------- « Ne réveille personne » : les plaques tombent en poussière si on tue un infecté ----------
EntityEvents.death(event => {
  // event.source.entity / getEntity() n'existent pas côté KubeJS 7 : l'attaquant est event.source.actual
  var killer = event.source.actual
  if (!killer || !killer.isPlayer()) return
  if (!ATHERIA_INFECTES.test(String(event.entity.type))) return
  var server = killer.server
  if (atheriaRetirer(killer, 'atheria:plaque_station', 9999) > 0) {
    atheriaHudBanniere(killer, 'danger', 'Station', '', 'Le bruit a réveillé la station. Tes plaques tombent en poussière.')
  }
  if (killer.tags.contains('cendre_grise')) {
    atheriaCendreRetire(killer, 'Le sang de l\'infecté a lavé ta cendre. Ils te voient de nouveau.')
  }
})

// ---------- recettes de campagne ----------
ServerEvents.recipes(event => {
  event.shapeless('atheria:antifongique', ['minecraft:brown_mushroom', 'minecraft:red_mushroom', 'minecraft:potion', 'minecraft:sugar']).id('atheria:antifongique')
  event.shaped('atheria:masque_artisanal', ['WCW', ' S '], { W: 'minecraft:white_wool', C: 'minecraft:charcoal', S: 'minecraft:string' }).id('atheria:masque_artisanal')
  event.shapeless('2x atheria:filtre', ['minecraft:charcoal', 'minecraft:charcoal', 'minecraft:paper']).id('atheria:filtre')
  event.shaped('atheria:radio_portative', [' A ', 'CRC', 'III'], { A: 'minecraft:lightning_rod', C: 'minecraft:copper_ingot', R: 'minecraft:redstone', I: 'minecraft:iron_ingot' }).id('atheria:radio_portative')
  event.shapeless('atheria:kit_analyse', ['minecraft:brewing_stand', 'minecraft:glass_bottle', 'minecraft:glass_bottle', 'minecraft:glass_bottle', 'atheria:echantillon_spore', 'minecraft:redstone']).id('atheria:kit_analyse')
  event.shapeless('4x atheria:fusee_eclairante', ['minecraft:gunpowder', 'minecraft:paper', 'minecraft:glowstone_dust']).id('atheria:fusee_eclairante')
  event.shapeless('atheria:trousse_soins', ['firstaid:bandage', 'firstaid:bandage', 'firstaid:plaster', 'minecraft:potion']).id('atheria:trousse_soins')
  event.shapeless('atheria:decoction_fundi', ['minecraft:brown_mushroom', 'minecraft:brown_mushroom', 'atheria:echantillon_spore', 'minecraft:potion']).id('atheria:decoction_fundi')
  event.shaped('atheria:filet', ['S S', ' S ', 'S S'], { S: 'minecraft:string' }).id('atheria:filet')
  event.smoking('atheria:poisson_seche', 'minecraft:cooked_cod').id('atheria:poisson_seche')
  event.shapeless('atheria:cendre_grise', ['minecraft:gunpowder', 'minecraft:bone_meal', 'atheria:echantillon_spore']).id('atheria:cendre_grise')
})

// ---------- /titres : liste de tes titres ----------
// ---------- 10/11 (Mika) : Vinicius revient un jour de jeu après sa mort ----------
// Le PNJ est sauvegardé à sa mort (sans UUID ni vie), puis recréé au même endroit 24 000 ticks plus tard.
// L'échéance est dans les données du serveur : elle tient un redémarrage.
var ATHERIA_CT = null
function atheriaTag() {
  if (!ATHERIA_CT) ATHERIA_CT = Java.loadClass('net.minecraft.nbt.CompoundTag')
  return new ATHERIA_CT()
}
// horloge propre à Atheria, en ticks, gardée dans les données du serveur (getGameTime() est refusé par KubeJS)
// elle avance de 100 toutes les 100 ticks (voir ServerEvents.tick) : précision de 5 s, suffisante pour nos délais
// identifiant stable d'un joueur (validé en test le 10/11 ; la méthode vanilla de l'UUID en texte est refusée par KubeJS)
function atheriaUuid(p) {
  return String(p.getGameProfile().getId())
}
function atheriaTemps(server) {
  return Number(server.persistentData.getLong('atheria_horloge'))
}
// inventaire : runCommandSilent ne renvoie pas le nombre d'objets, on parcourt donc les emplacements
function atheriaCompter(p, id) {
  var inv = p.inventory, n = 0
  for (var i = 0; i < inv.getContainerSize(); i++) {
    var st = inv.getItem(i)
    if (!st.isEmpty() && String(st.id) === id) n += st.getCount()
  }
  return n
}
function atheriaRetirer(p, id, combien) {
  // retire jusqu'à « combien » objets et renvoie le nombre réellement retiré
  var inv = p.inventory, reste = combien
  for (var i = 0; i < inv.getContainerSize() && reste > 0; i++) {
    var st = inv.getItem(i)
    if (st.isEmpty() || String(st.id) !== id) continue
    var k = Math.min(reste, st.getCount())
    st.shrink(k)
    reste -= k
  }
  if (reste < combien) inv.setChanged()
  return combien - reste
}
EntityEvents.death('easy_npc:humanoid', event => {
  var npc = event.entity
  if (String(npc.getName().getString()) !== 'Vinicius') return
  var server = npc.server
  var data = server.persistentData
  if (data.contains('atheria_vinicius')) return   // déjà en attente
  var t = npc.saveWithoutId(atheriaTag())
  var garde = ['UUID', 'Health', 'DeathTime', 'HurtTime', 'HurtByTimestamp', 'Pos', 'Motion', 'Fire', 'FallDistance', 'active_effects', 'Passengers']
  for (var i = 0; i < garde.length; i++) t.remove(garde[i])
  var v = atheriaTag()
  v.put('npc', t)
  v.putDouble('x', npc.x); v.putDouble('y', npc.y); v.putDouble('z', npc.z)
  v.putLong('retour', atheriaTemps(server) + 24000)
  data.put('atheria_vinicius', v)
})
function atheriaViniciusRetour(server) {
  var data = server.persistentData
  if (!data.contains('atheria_vinicius')) return
  var v = data.getCompound('atheria_vinicius')
  if (atheriaTemps(server) < Number(v.getLong('retour'))) return
  var level = server.overworld()
  var ent = level.createEntity('easy_npc:humanoid')
  if (!ent) return
  ent.load(v.getCompound('npc'))
  ent.setPos(v.getDouble('x'), v.getDouble('y'), v.getDouble('z'))
  ent.setHealth(ent.getMaxHealth())
  ent.spawn()
  data.remove('atheria_vinicius')
  atheriaHudRadioTous(server, 'balise', 'la barrière du péage est de nouveau gardée. Vinicius a repris son poste.', 'Sur la RN1,')
}

// ---------- 10/11 (Mika) : événements du serveur (sirène du ch1, lune de sang du ch2) ----------
// Un seul événement pour tout le serveur, lancé par l'équipe. Est présent celui qui est dans le rayon du lieu ;
// un mort compte encore 2 min ; créatif et spectateur ne comptent pas ; une déconnexion garde le temps acquis.
// À la fin, chaque joueur présent au moins la moitié du temps reçoit le tag de la quête (même hors ligne : à sa reconnexion).
// Ensuite, la quête de rattrapage s'ouvre (tag « passée ») : 5 min de présence de nuit dans le rayon.
// Tout l'état est dans les données du serveur (persistentData) et tient un redémarrage.
var ATHERIA_EVT = {
  sirene: {
    nom: 'La sirène de Longoni', tenue: 'sirene_tenue', passee: 'sirene_passee', ratt: 'sirene_rattrapage', duree: 25,
    debut: 'Une sirène hurle sur Longoni. Haut-parleur : « Horde au mur est. Tous les citoyens valides au mur. Les non-valides aussi, on manque de monde. »',
    fin: 'La sirène se tait. Longoni a encore ses murs. Haut-parleur : « Merci de votre participation. Un formulaire de satisfaction vous sera remis. »'
  },
  lune_de_sang: {
    nom: 'Lune de sang sur Coconi', tenue: 'lune_de_sang_tenue', passee: 'lune_passee', ratt: 'lune_rattrapage', duree: 25,
    debut: 'La lune rougit au-dessus de Coconi. Zaida, au porte-voix : « Tout le monde au barrage. Ceux qui savent tirer devant, ceux qui savent soigner derrière. Les autres, vous portez. »',
    fin: 'Le jour se lève sur le Refuge. Zaida : « On compte les vivants d\'abord. Les morts attendront, ils ont le temps. »'
  }
}
function atheriaEvt(server, id) {
  var data = server.persistentData
  var k = 'atheria_evt_' + id
  if (!data.contains(k)) {
    var e = atheriaTag()
    e.put('presence', atheriaTag()); e.put('morts', atheriaTag()); e.put('valides', atheriaTag())
    data.put(k, e)
  }
  return data.getCompound(k)
}
function atheriaCles(tag) {
  var out = []
  var arr = tag.getAllKeys().toArray()
  for (var i = 0; i < arr.length; i++) out.push(String(arr[i]))
  return out
}
function atheriaCompte(p) {
  return !p.isCreative() && !p.isSpectator()
}
function atheriaDansLieu(e, p) {
  if (String(p.level.dimension) !== e.getString('dim')) return false
  var dx = p.x - e.getDouble('x'), dz = p.z - e.getDouble('z')
  var r = e.getInt('r')
  return dx * dx + dz * dz <= r * r && Math.abs(p.y - e.getDouble('y')) <= 64
}
function atheriaEvtFin(server, id) {
  var d = ATHERIA_EVT[id]
  var e = atheriaEvt(server, id)
  if (!e.getBoolean('actif')) return 0
  e.putBoolean('actif', false)
  e.putBoolean('fini', true)
  atheriaHordeNettoie(server, id)
  var seuil = Math.max(10, e.getInt('ecoule') * 0.5)
  var pres = e.getCompound('presence'), val = e.getCompound('valides')
  var cles = atheriaCles(pres), n = 0
  for (var i = 0; i < cles.length; i++) if (pres.getInt(cles[i]) >= seuil) { val.putBoolean(cles[i], true); n++ }
  atheriaHudBanniereTous(server, 'fin', 'Fin de l\'événement', d.nom, d.fin)
  server.players.forEach(p => atheriaEvtConnexion(server, p))
  return n
}
// à la fin de l'événement et à chaque connexion : tag « passée » pour tous, tag de la quête pour les présents
function atheriaEvtConnexion(server, p) {
  for (var id in ATHERIA_EVT) {
    var d = ATHERIA_EVT[id]
    var k = 'atheria_evt_' + id
    if (!server.persistentData.contains(k)) continue
    var e = server.persistentData.getCompound(k)
    if (!e.getBoolean('fini')) continue
    p.addTag(d.passee)
    var val = e.getCompound('valides'), u = atheriaUuid(p)
    if (val.contains(u)) {
      val.remove(u)
      if (!p.tags.contains(d.tenue)) {
        p.addTag(d.tenue)
        atheriaHudBanniere(p, 'quete', 'Quête validée', d.nom, 'Tu as tenu jusqu\'au bout.')
      }
    }
  }
}
PlayerEvents.loggedIn(event => {
  atheriaEvtConnexion(event.server, event.player)
})
EntityEvents.death('minecraft:player', event => {
  var p = event.entity, server = p.server
  for (var id in ATHERIA_EVT) {
    var k = 'atheria_evt_' + id
    if (!server.persistentData.contains(k)) continue
    var e = server.persistentData.getCompound(k)
    if (e.getBoolean('actif')) e.getCompound('morts').putLong(atheriaUuid(p), atheriaTemps(server))
  }
})
function atheriaEvtTick(server) {
  var maintenant = atheriaTemps(server)
  for (var id in ATHERIA_EVT) {
    var d = ATHERIA_EVT[id]
    var k = 'atheria_evt_' + id
    if (!server.persistentData.contains(k)) continue
    var e = server.persistentData.getCompound(k)
    if (!e.contains('dim')) continue
    if (e.getBoolean('actif')) {
      e.putInt('ecoule', e.getInt('ecoule') + 10)
      var pres = e.getCompound('presence'), morts = e.getCompound('morts')
      server.players.forEach(p => {
        if (!atheriaCompte(p)) return
        var u = atheriaUuid(p)
        var mortRecent = morts.contains(u) && maintenant - Number(morts.getLong(u)) <= 2400
        if ((p.isAlive() && atheriaDansLieu(e, p)) || mortRecent) pres.putInt(u, pres.getInt(u) + 10)
      })
      if (e.getInt('ecoule') % 60 === 0) {
        var presents = 0
        server.players.forEach(p => { if (atheriaCompte(p) && p.isAlive() && atheriaDansLieu(e, p)) presents++ })
        if (presents > 0) atheriaHordeVague(server, id, e, presents)
      }
      if (e.getInt('ecoule') >= e.getInt('duree')) atheriaEvtFin(server, id)
    } else if (e.getBoolean('fini')) {
      server.players.forEach(p => {
        if (!p.tags.contains(d.passee) || p.tags.contains(d.tenue) || p.tags.contains(d.ratt)) return
        if (!atheriaCompte(p) || !p.isAlive() || !atheriaNuit(p.level) || !atheriaDansLieu(e, p)) return
        var cle = 'atheria_ratt_' + id
        var s = p.persistentData.getInt(cle) + 10
        p.persistentData.putInt(cle, s)
        if (s >= 300) {
          p.addTag(d.ratt)
          atheriaHudBanniere(p, 'quete', 'Rattrapage', 'Tu as tenu ta nuit', 'Il reste à repousser les infectés qui traînent.')
        }
      })
    }
  }
}
// ---------- 10/11 (Mika) : la horde des événements marche vers le lieu ----------
// Pendant la sirène ou la lune de sang, des vagues apparaissent au bord du rayon, hors de vue des joueurs,
// jamais dans une base protégée (claim Open Parties and Claims), puis marchent vers le centre.
// Composition du bestiaire : surtout des Dakouane (zombies, en groupes de 4 à 10), quelques Chimiks (spore:braiomil).
// Plafond selon le nombre de joueurs présents. Nettoyage à la fin (et au rechargement d'un tronçon après la fin).
var ATHERIA_HORDE = { dakouane: ['minecraft:zombie', 'minecraft:zombie', 'minecraft:zombie', 'minecraft:husk', 'minecraft:zombie_villager'], chimik: 'spore:braiomil' }
var ATHERIA_HM = null
function atheriaHauteur(level, x, z) {
  if (!ATHERIA_HM) ATHERIA_HM = Java.loadClass('net.minecraft.world.level.levelgen.Heightmap$Types')
  return level.getHeight(ATHERIA_HM.MOTION_BLOCKING_NO_LEAVES, x, z)
}
var ATHERIA_OPAC = undefined
var ATHERIA_OPAC_AVERTI = false   // pas d'écriture dans global : refusée par les scripts serveur
var ATHERIA_BP = Java.loadClass('net.minecraft.core.BlockPos')
function atheriaClaim(server, level, x, z) {
  // vrai si le tronçon est revendiqué ; en cas de doute (API absente), on considère qu'il l'est : on ne fait rien apparaître
  try {
    if (ATHERIA_OPAC === undefined) ATHERIA_OPAC = Java.loadClass('xaero.pac.common.server.api.OpenPACServerAPI')
    var claims = ATHERIA_OPAC.get(server).getServerClaimsManager()
    return claims.get(level.dimension, x >> 4, z >> 4) != null   // level.dimension est déjà le ResourceLocation (pas de ChunkPos : surcharge ambiguë)
  } catch (err) {
    if (!ATHERIA_OPAC_AVERTI) { ATHERIA_OPAC_AVERTI = true; console.warn('[Atheria] API Open Parties and Claims indisponible : aucune horde d\'événement ne sera créée. ' + err) }
    return true
  }
}
function atheriaHordeVivants(level, id) {
  var n = 0
  level.getEntities().forEach(e => { if (e.tags.contains('atheria_horde_' + id) && e.isAlive()) n++ })
  return n
}
function atheriaHordePoint(server, level, e) {
  var cx = e.getDouble('x'), cz = e.getDouble('z'), r = e.getInt('r')
  for (var essai = 0; essai < 12; essai++) {
    var ang = Math.random() * Math.PI * 2, dist = r + 4 + Math.random() * 16
    var x = Math.floor(cx + Math.cos(ang) * dist), z = Math.floor(cz + Math.sin(ang) * dist)
    if (!level.isLoaded(ATHERIA_BP.containing(x, 64, z))) continue   // jamais de chargement forcé de tronçon
    var y = atheriaHauteur(level, x, z)
    var sol = String(level.getBlock(x, y - 1, z).id)
    if (sol.indexOf('water') >= 0 || sol.indexOf('lava') >= 0) continue
    var proche = false
    server.players.forEach(p => { if (String(p.level.dimension) === e.getString('dim') && (p.x - x) * (p.x - x) + (p.z - z) * (p.z - z) < 40 * 40) proche = true })
    if (proche || atheriaClaim(server, level, x, z)) continue
    return [x + 0.5, y, z + 0.5]
  }
  return null
}
function atheriaHordeVague(server, id, e, presents) {
  var level = server.getLevel(e.getString('dim'))
  if (!level) return
  var plafond = Math.min(60, 10 + 6 * presents)
  var vivants = atheriaHordeVivants(level, id)
  if (vivants >= plafond) return
  var pt = atheriaHordePoint(server, level, e)
  if (!pt) return
  var taille = Math.min(plafond - vivants, 4 + Math.floor(Math.random() * Math.min(7, 2 + presents)))
  var types = []
  for (var i = 0; i < taille; i++) types.push(ATHERIA_HORDE.dakouane[Math.floor(Math.random() * ATHERIA_HORDE.dakouane.length)])
  if (Math.random() < 0.35 && types.length > 1) types[types.length - 1] = ATHERIA_HORDE.chimik   // un Chimik de temps en temps
  types.forEach(t => {
    var m = level.createEntity(t)
    if (!m) return
    m.setPos(pt[0] + Math.random() * 3 - 1.5, pt[1], pt[2] + Math.random() * 3 - 1.5)
    m.addTag('atheria_horde'); m.addTag('atheria_horde_' + id)
    m.setPersistenceRequired()
    m.spawn()
    // hors de vue : si un joueur proche le voit déjà, on le retire aussitôt
    var vu = false
    server.players.forEach(p => { if (String(p.level.dimension) === e.getString('dim') && p.distanceTo(m) < 64 && p.hasLineOfSight(m)) vu = true })
    if (vu) m.discard()
  })
}
function atheriaHordeGuide(server, id, e) {
  var level = server.getLevel(e.getString('dim'))
  if (!level) return
  var cx = e.getDouble('x'), cy = e.getDouble('y'), cz = e.getDouble('z')
  level.getEntities().forEach(m => {
    if (!m.tags.contains('atheria_horde_' + id) || !m.isAlive()) return
    if (m.getTarget() != null) return   // il a trouvé une proie (vue, lumière, son) : on le laisse faire
    m.getNavigation().moveTo(cx, cy, cz, 1.0)
  })
}
function atheriaHordeNettoie(server, id) {
  server.getAllLevels().forEach(level => level.getEntities().forEach(m => { if (m.tags.contains('atheria_horde_' + id)) m.discard() }))
}
// un infecté d'événement rechargé depuis le disque alors que l'événement est fini : il ne revient pas
EntityEvents.spawned(event => {
  var m = event.entity
  if (!m.tags.contains('atheria_horde')) return
  var server = m.server
  for (var id in ATHERIA_EVT) {
    if (!m.tags.contains('atheria_horde_' + id)) continue
    var k = 'atheria_evt_' + id
    if (!server.persistentData.contains(k) || !server.persistentData.getCompound(k).getBoolean('actif')) event.cancel()
  }
})

ServerEvents.tick(event => {
  var server = event.server
  if (server.tickCount % 100 === 0) {   // toutes les 5 s : horloge Atheria, puis la horde marche vers le lieu
    server.persistentData.putLong('atheria_horloge', atheriaTemps(server) + 100)
    for (var id in ATHERIA_EVT) {
      var k = 'atheria_evt_' + id
      if (server.persistentData.contains(k) && server.persistentData.getCompound(k).getBoolean('actif')) atheriaHordeGuide(server, id, server.persistentData.getCompound(k))
    }
  }
  if (server.tickCount % 200 !== 0) return
  atheriaEvtTick(server)
  atheriaViniciusRetour(server)
})

// commandes de l'équipe (op niveau 2) : /atheria_evenement <sirene|lune_de_sang> lieu <rayon> | debut [minutes] | fin | etat | donner <joueur> | retirer <joueur>
function atheriaEvtCommandes(event) {
  var Commands = event.commands, Arguments = event.arguments
  var racine = Commands.literal('atheria_evenement').requires(s => s.hasPermission(2))
  Object.keys(ATHERIA_EVT).forEach(id => {
    var d = ATHERIA_EVT[id]
    var b = Commands.literal(id)
    b.then(Commands.literal('lieu').then(Commands.argument('rayon', Arguments.INTEGER.create(event)).executes(ctx => {
      var p = ctx.source.player
      if (!p) return 0
      var e = atheriaEvt(ctx.source.server, id)
      e.putDouble('x', p.x); e.putDouble('y', p.y); e.putDouble('z', p.z)
      e.putString('dim', String(p.level.dimension))
      e.putInt('r', Math.max(16, Number(Arguments.INTEGER.getResult(ctx, 'rayon'))))
      p.tell(Text.yellow('Lieu de « ' + id + ' » fixé ici, rayon ' + e.getInt('r') + ' blocs.'))
      return 1
    })))
    var debut = (ctx, minutes) => {
      var server = ctx.source.server
      var e = atheriaEvt(server, id)
      if (!e.contains('dim')) { ctx.source.sendFailure(Text.red('Fixe d\'abord le lieu : /atheria_evenement ' + id + ' lieu <rayon>')); return 0 }
      if (e.getBoolean('actif')) { ctx.source.sendFailure(Text.red('Déjà en cours.')); return 0 }
      e.putBoolean('actif', true)
      e.putInt('ecoule', 0)
      e.putInt('duree', Math.max(1, minutes) * 60)
      e.put('presence', atheriaTag()); e.put('morts', atheriaTag())
      atheriaHudBanniereTous(server, 'evenement', 'Événement', d.nom, d.debut)
      return 1
    }
    b.then(Commands.literal('debut').executes(ctx => debut(ctx, d.duree))
      .then(Commands.argument('minutes', Arguments.INTEGER.create(event)).executes(ctx => debut(ctx, Number(Arguments.INTEGER.getResult(ctx, 'minutes'))))))
    b.then(Commands.literal('fin').executes(ctx => {
      var n = atheriaEvtFin(ctx.source.server, id)
      ctx.source.sendSuccess(Text.yellow('Événement terminé : ' + n + ' joueur(s) validé(s).'), true)
      return 1
    }))
    b.then(Commands.literal('etat').executes(ctx => {
      var e = atheriaEvt(ctx.source.server, id)
      var pres = e.getCompound('presence'), cles = atheriaCles(pres)
      ctx.source.sendSuccess(Text.yellow(id + ' : ' + (e.getBoolean('actif') ? 'en cours, ' + e.getInt('ecoule') + ' / ' + e.getInt('duree') + ' s' : (e.getBoolean('fini') ? 'terminé' : 'pas commencé'))
        + (e.contains('dim') ? ', lieu ' + Math.round(e.getDouble('x')) + ' ' + Math.round(e.getDouble('z')) + ' r' + e.getInt('r') : ', lieu non fixé') + ', ' + cles.length + ' joueur(s) comptés'), false)
      return 1
    }))
    b.then(Commands.literal('donner').then(Commands.argument('joueur', Arguments.PLAYER.create(event)).executes(ctx => {
      var p = Arguments.PLAYER.getResult(ctx, 'joueur')
      p.addTag(d.tenue); p.addTag(d.passee)
      atheriaHudBanniere(p, 'quete', 'Quête validée', d.nom, 'L\'équipe a validé ta présence.')
      return 1
    })))
    b.then(Commands.literal('retirer').then(Commands.argument('joueur', Arguments.PLAYER.create(event)).executes(ctx => {
      var p = Arguments.PLAYER.getResult(ctx, 'joueur')
      p.removeTag(d.tenue); p.removeTag(d.ratt)
      p.persistentData.remove('atheria_ratt_' + id)
      return 1
    })))
    racine.then(b)
  })
  event.register(racine)
}

// ---------- 10/11 : rachat des Puffs (prix en une seule constante, à confirmer par Mika) ----------
var ATHERIA_PRIX_PUFF = 5   // validé par Mika le 10/11 ; la vraie récompense est la collection complète
function atheriaVendrePuff(server, p) {
  var nom = p.username
  var vendues = p.persistentData.getInt('atheria_puffs_vendues')   // un bit par numéro de Puff déjà vendu
  var proposee = false, pasNotee = 0
  for (var n = 1; n <= 10; n++) {
    if (atheriaCompter(p, 'atheria:puff_' + n) < 1) continue
    proposee = true
    if (vendues & (1 << n)) continue
    // la quête de cette Puff doit être validée (récompense récupérée) avant la revente : la collection reste atteignable
    if (!p.tags.contains('puff_validee_' + n)) { pasNotee = n; continue }
    if (atheriaRetirer(p, 'atheria:puff_' + n, 1) !== 1) continue   // retirée d'abord : rien n'est payé sans Puff
    p.persistentData.putInt('atheria_puffs_vendues', vendues | (1 << n))
    server.runCommandSilent('give ' + nom + ' atheria:bon_caf ' + ATHERIA_PRIX_PUFF)
    atheriaHudBanniere(p, 'quete', 'Eniy', 'Puff n° ' + n + ' vendue, + ' + ATHERIA_PRIX_PUFF + ' bons', '« Je la revendrai dix fois plus cher. À quelqu\'un d\'autre. »')
    return 1
  }
  if (pasNotee) { atheriaHudBanniere(p, 'info', 'Eniy', '', '« La Puff n° ' + pasNotee + ', note-la d\'abord dans ta collection (récupère la récompense de sa quête). Après, on parle affaires. »'); return 0 }
  atheriaHudBanniere(p, 'info', 'Eniy', '', proposee ? '« Celle-là, tu me l\'as déjà vendue. Je ne rachète pas deux fois la même légende. »' : '« Pas de Puff, pas de bons. Le marché est impitoyable. »')
  return 0
}

ServerEvents.commandRegistry(event => {
  var { commands: Commands } = event
  atheriaEvtCommandes(event)
  // rachat des Puffs par Eniy : la Puff est retirée AVANT le paiement ; chaque numéro ne se vend qu'une fois par joueur
  event.register(Commands.literal('atheria_vendre_puff').requires(src => src.hasPermission(2))
    .then(Commands.argument('joueur', event.arguments.PLAYER.create(event)).executes(ctx => {
      var p = event.arguments.PLAYER.getResult(ctx, 'joueur')
      return atheriaVendrePuff(ctx.source.server, p)
    })))
  // achat chez un PNJ : /atheria_payer <joueur> <prix> <objet> (bons CAF comptés sur tout l'inventaire)
  var Arg = event.arguments
  event.register(Commands.literal('atheria_payer').requires(src => src.hasPermission(2))
    .then(Commands.argument('joueur', Arg.PLAYER.create(event))
      .then(Commands.argument('prix', Arg.INTEGER.create(event))
        .then(Commands.argument('objet', Arg.GREEDY_STRING.create(event)).executes(ctx => {
          var p = Arg.PLAYER.getResult(ctx, 'joueur')
          var prix = Number(Arg.INTEGER.getResult(ctx, 'prix'))   // java.lang.Integer : sans Number(), !== est toujours vrai
          var objet = String(Arg.GREEDY_STRING.getResult(ctx, 'objet')).trim()
          var server = ctx.source.server, nom = p.username
          var a = atheriaCompter(p, 'atheria:bon_caf')
          if (a < prix) { atheriaHudAction(p, 'atheria:bon_caf', 'Il te manque ' + (prix - a) + ' bons. Eniy ne fait pas crédit.', 'rouge'); return 0 }
          if (atheriaRetirer(p, 'atheria:bon_caf', prix) !== prix) { atheriaHudAction(p, 'atheria:bon_caf', 'Paiement refusé.', 'rouge'); return 0 }   // ne devrait pas arriver : compté juste avant
          server.runCommandSilent('give ' + nom + ' ' + objet + ' 1')
          atheriaHudBanniere(p, 'quete', 'Eniy', 'Achat conclu, - ' + prix + ' bons', '« Pas de remboursement, pas de garantie, pas de questions. »')
          return 1
        })))))
  event.register(Commands.literal('titres').executes(ctx => {
    var player = ctx.source.player
    var titres = []
    player.tags.forEach(t => { if (String(t).startsWith('titre_')) titres.push((global.ATHERIA_TITRES || {})[String(t).substring(6)] || String(t).substring(6)) })
    // dans le carnet, sur un bout de papier à gauche de l'écran (mod atheria_hud)
    atheriaHudNote(player, 'Tes titres', titres.length ? titres.join(', ') : 'Aucun pour l\'instant. Ils se gagnent sur le terrain.', titres.length + (titres.length > 1 ? ' titres' : ' titre'))
    return 1
  }))
})
