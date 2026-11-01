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

function atheriaLire(player, id) {
  var txt = global.ATHERIA_TEXTES ? global.ATHERIA_TEXTES[id] : null
  if (!txt) return false
  player.tell(Text.gold('— ' + txt.titre + ' —'))
  txt.lignes.forEach(l => player.tell(Text.gray(l.replace(/&[0-9a-fklmnor]/g, ''))))
  return true
}

// ---------- premier réveil : le kit de départ ----------
PlayerEvents.loggedIn(event => {
  var player = event.player
  if (player.persistentData.getBoolean('atheria_kit')) return
  player.persistentData.putBoolean('atheria_kit', true)
  player.give('atheria:carnet_survivant')
  player.give('trydeas_meleez:knife')
  player.give('ftbquests:book')
  player.tell(Text.gray('Tu te réveilles dans une case en tôle. Un couteau, un carnet signé « R. ». Clic droit sur le carnet pour le lire.'))
})

// ---------- objets utilisables ----------
ItemEvents.rightClicked(event => {
  var player = event.player
  var id = String(event.item.id)
  var server = player.server
  var name = player.username

  if (id.startsWith('atheria:archive_') || id === 'atheria:carnet_survivant') {
    if (atheriaLire(player, id)) event.cancel()
    return
  }

  if (id === 'atheria:radio_portative') {
    if (!atheriaNuit(event.level)) {
      player.tell(Text.gray('Grésillements. La voix ne parle que la nuit.'))
      event.cancel()
      return
    }
    player.tell(Text.darkRed('[104.0 MHz] ').append(Text.gray('« ...si vous entendez ce message, venez au Bénara. Nous avons un remède. Nous avons de l\'eau. Venez au Bénara... »')))
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
        player.tell(Text.yellow('Point d\'écoute noté (' + pts.length + '/3). Le signal vient de plus loin que le Bénara.'))
      }
      if (pts.length >= 3) player.addTag('radio_3_points')
    }
    event.cancel()
    return
  }

  if (id === 'atheria:boitier_ecoute') {
    if (player.y < 120) {
      player.tell(Text.gray('Trop bas. Il faut l\'installer au sommet d\'une tour (altitude 120 ou plus).'))
    } else {
      event.item.shrink(1)
      player.addTag('boitier_installe')
      player.tell(Text.yellow('Boîtier installé. Le relais écoute maintenant pour les Goblini.'))
      atheriaCmd(server, `playsound minecraft:block.beacon.power_select master ${name} ~ ~ ~ 1 1.4`)
    }
    event.cancel()
    return
  }

  if (id === 'atheria:carte_caf') {
    var jour = Math.floor(Date.now() / 86400000)
    var data = player.persistentData
    if (data.getInt('atheria_caf_jour') === jour) {
      player.tell(Text.gray('Votre demande a déjà été traitée aujourd\'hui. Merci de votre patience.'))
    } else {
      data.putInt('atheria_caf_jour', jour)
      player.give('4x atheria:bon_caf')
      player.tell(Text.yellow('Versement CAF : 4 bons. Votre dossier reste incomplet.'))
    }
    event.cancel()
    return
  }

  if (id === 'atheria:cendre_grise') {
    event.item.shrink(1)
    atheriaCmd(server, `effect give ${name} minecraft:invisibility 600 0 true`)
    player.addTag('cendre_grise')
    player.tell(Text.gray('Tu te couvres de cendre grise. Les infectés faibles ne te voient plus. La PAF, si.'))
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
  if (server.runCommandSilent(`clear ${killer.username} atheria:plaque_station`) > 0) {
    killer.tell(Text.red('Le bruit a réveillé la station. Tes plaques tombent en poussière.'))
  }
  if (killer.tags.contains('cendre_grise')) {
    killer.removeTag('cendre_grise')
    atheriaCmd(server, `effect clear ${killer.username} minecraft:invisibility`)
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
ServerEvents.commandRegistry(event => {
  var { commands: Commands } = event
  event.register(Commands.literal('titres').executes(ctx => {
    var player = ctx.source.player
    var titres = []
    player.tags.forEach(t => { if (String(t).startsWith('titre_')) titres.push((global.ATHERIA_TITRES || {})[String(t).substring(6)] || String(t).substring(6)) })
    player.tell(Text.gold('Tes titres (' + titres.length + ') : ').append(Text.yellow(titres.length ? titres.join(', ') : 'aucun pour l\'instant')))
    return 1
  }))
})
