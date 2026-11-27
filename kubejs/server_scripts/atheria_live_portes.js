// Atheria - soirée live « La fermeture des portes » (samedi 2/1, 21 h Paris ; Acte III, doc « Soirées live d'Atheria »).
// Lore (script, chapitre 3) : une sirène à Longoni, un officier annonce que les frontières sont fermées « jusqu'à nouvel ordre »,
// puis qu'il n'y a pas de formulaire de recours. La porte se ferme.
// Déroulé (/live portes start) :
//  1. décret à la radio : les portes de Longoni ferment dans 20 minutes ; cinq groupes de réfugiés attendent autour de Longoni
//     (repères sur la carte), chacun avec un sac de vivres ; quelques infectés rôdent autour d'eux ;
//  2. un groupe suit le premier joueur qui l'approche à moins de 6 blocs (il le perd s'il s'éloigne de plus de 40 blocs
//     pendant 15 s) ; un réfugié est sauvé quand il passe la Porte RN1 ou entre dans les murs ; un sac de vivres compte
//     quand son porteur entre dans les murs ;
//  3. à 20 minutes, la porte ferme : ceux qui sont dehors y restent ; puis 15 minutes de défense : six vagues d'infectés
//     montent vers la Porte RN1 ; chaque infecté qui touche la porte l'abîme ; si elle tient, tous les défenseurs ont un bonus.
// Score : 60 par réfugié ramené, 40 par sac de vivres, 10 par infecté de la horde abattu, 100 de bonus si la porte tient.
var PORTES = {
  porte: [2487, 66, -2958],             // la Porte RN1 côté intérieur (le mur sud de Longoni)
  rayonPorte: 8,
  ouvertureSec: 20 * 60,
  defenseSec: 15 * 60,
  vagues: 6,
  groupes: 5, distMin: 220, distMax: 520, // groupes de réfugiés autour de la porte, côté sud (hors des murs)
  rayonApproche: 6, rayonPerdu: 40, perduSec: 15,
  pointsRefugie: 60, pointsVivres: 40, pointsInfecte: 10, bonusPorte: 100,
  integrite: 100, degatInfecte: 4,
  infectes: ['spore:inf_human', 'spore:inf_wanderer', 'minecraft:zombie', 'minecraft:zombie', 'minecraft:husk'],
  skins: ['habitant_45_grainetiere', 'habitant_46_soudeur', 'habitant_47_bergere', 'habitant_48_colporteur', 'habitant_50_fileuse',
    'habitant_52_vieille_marchande', 'habitant_54_cueilleuse', 'habitant_58_charretier', 'habitant_60_ramasseuse_bois',
    'habitant_62_lingere', 'enfant_pa_01_gamin_casquette', 'enfant_pa_02_petite_tresses', 'enfant_pa_05_petite_capuche']
}

function portesDansMurs(level, x, z) {
  var zs = typeof atheriaZoneSure === 'function' ? atheriaZoneSure(level, x, z) : null
  if (zs != null && zs.nom == 'longoni') return true
  var dx = x - PORTES.porte[0], dz = z - PORTES.porte[2]
  return dx * dx + dz * dz <= PORTES.rayonPorte * PORTES.rayonPorte
}

// sol praticable : bloc solide, pas d'eau, deux blocs libres au-dessus ; null si le tronçon n'est pas chargé
function portesSol(level, x, z) {
  if (!level.isLoaded(ATHERIA_BP.containing(x, 64, z))) return null
  var y = atheriaHauteur(level, x, z)
  var sol = level.getBlockState(ATHERIA_BP.containing(x, y - 1, z)), a = level.getBlockState(ATHERIA_BP.containing(x, y, z))
  if (!sol.isSolid() || !a.getFluidState().isEmpty() || !sol.getFluidState().isEmpty()) return null
  return y
}

function portesRefugieSnbt(ctx, g, i) {
  var skin = PORTES.skins[(g * 3 + i) % PORTES.skins.length], enfant = skin.indexOf('enfant') == 0
  return '{EasyNPCVersion:3,PersistenceRequired:1b,CustomName:\'{"text":"Réfugié","color":"#E0C68A"}\',CustomNameVisible:0b,' +
    'Tags:["atheria_live","' + ctx.marque + '","atheria_refugie","atheria_refugie_' + g + '"],' +
    'EntityAttribute:{IsAttackableByPlayers:1b,IsAttackableByMonsters:1b,IsAttackableByFactions:1b,IsInvulnerable:0b,IsKnockbackResistant:0b,IsExplosionResistant:0b,HealthRegeneration:0.0d},' +
    'VariantType:"STEVE",SkinData:{Type:"RESOURCE_LOCATION",Texture:"atheria:textures/entity/habitants/' + skin + '.png"},' +
    'attributes:[{id:"minecraft:generic.max_health",base:16.0d},{id:"minecraft:generic.movement_speed",base:0.32d},{id:"minecraft:generic.follow_range",base:48.0d}' +
    (enfant ? ',{id:"minecraft:generic.scale",base:0.72d}' : '') + '],Health:16.0f,' +
    'ObjectiveData:{ObjectiveDataSet:[{Type:"FLOAT",Prio:0},{Type:"OPEN_DOOR",Prio:1},{Type:"LOOK_AT_PLAYER",Prio:7}]}}'
}

// tableau JavaScript (pas une liste Java : map, some et Math.min s'en servent)
function portesEntites(ctx, tag) {
  var l = []
  ctx.server.overworld().getEntities().forEach(m => { if (m.tags.contains(tag) && m.tags.contains(ctx.marque) && m.isAlive()) l.push(m) })
  return l
}

// un groupe apparaît quand un joueur approche de son repère (rien ne se charge à vide)
function portesFaireGroupe(ctx, g) {
  var level = ctx.server.overworld(), pt = ctx.d.groupes[g]
  var y = null, x = pt.x, z = pt.z
  for (var essai = 0; essai < 12 && y == null; essai++) {
    x = pt.x + Math.floor(Math.random() * 9) - 4; z = pt.z + Math.floor(Math.random() * 9) - 4
    y = portesSol(level, x, z)
  }
  if (y == null) return false
  var n = 2 + (g % 2)
  for (var i = 0; i < n; i++)
    ctx.server.runCommandSilent('execute in minecraft:overworld positioned ' + (x + 0.5 + i) + ' ' + y + ' ' + (z + 0.5) + ' summon easy_npc:humanoid run data merge entity @s ' + portesRefugieSnbt(ctx, g, i))
  ctx.server.runCommandSilent('execute in minecraft:overworld run summon item ' + (x + 0.5) + ' ' + (y + 0.5) + ' ' + (z - 1.5) +
    ' {Item:{id:"atheria:sac_vivres",count:1},Age:-32768,PickupDelay:10,Glowing:1b,Invulnerable:1b,Tags:["atheria_live","' + ctx.marque + '","atheria_vivres"]}')
  for (var k = 0; k < 3; k++) {
    var a = Math.random() * Math.PI * 2, dx = Math.floor(Math.cos(a) * 14), dz = Math.floor(Math.sin(a) * 14)
    var y2 = portesSol(level, x + dx, z + dz)
    if (y2 == null) continue
    var m = level.createEntity(PORTES.infectes[Math.floor(Math.random() * PORTES.infectes.length)])
    if (!m) continue
    m.setPos(x + dx + 0.5, y2, z + dz + 0.5)
    m.addTag('atheria_live'); m.addTag(ctx.marque)
    m.setPersistenceRequired()
    m.spawn()
  }
  pt.fait = true
  pt.y = y
  pt.n = n
  return true
}

function portesVague(ctx, v) {
  var level = ctx.server.overworld(), presents = ctx.joueurs().filter(p => (p.x - PORTES.porte[0]) * (p.x - PORTES.porte[0]) + (p.z - PORTES.porte[2]) * (p.z - PORTES.porte[2]) < 200 * 200).length
  var total = Math.min(40, 6 + 3 * v + 2 * presents), faits = 0
  for (var essai = 0; essai < total * 4 && faits < total; essai++) {
    // au sud de la porte, entre 60 et 100 blocs, jamais dans les murs
    var a = Math.PI * (0.1 + Math.random() * 0.8), d = 60 + Math.random() * 40
    var x = Math.floor(PORTES.porte[0] + Math.cos(a) * d), z = Math.floor(PORTES.porte[2] + Math.sin(a) * d)
    var zs = typeof atheriaZoneSure === 'function' ? atheriaZoneSure(level, x, z) : null
    if (zs != null && !zs.monstresSeulement) continue
    var y = portesSol(level, x, z)
    if (y == null) continue
    var m = level.createEntity(PORTES.infectes[Math.floor(Math.random() * PORTES.infectes.length)])
    if (!m) continue
    m.setPos(x + 0.5, y, z + 0.5)
    m.addTag('atheria_live'); m.addTag(ctx.marque); m.addTag('atheria_horde_porte')
    m.setPersistenceRequired()
    m.spawn()
    faits++
  }
  return faits
}

atheriaLiveDeclarer('portes', {
  titre: 'La fermeture des portes',
  radio: 'semaine',
  annonce: 'Communiqué de la PAF : un décret sera lu ce soir à la Porte RN1 de Longoni. Présence conseillée.',
  rappel: 'Les survivants hors des murs de Longoni sont invités à se rapprocher de la Porte RN1.',
  consigne: 'Les portes de Longoni ferment dans 20 minutes. Ramenez les réfugiés et leurs vivres, puis tenez la Porte RN1.',
  dureeMin: 40,
  objets: [['atheria:ration', 3], ['atheria:trousse_soins', 1]],
  titreGagnant: ['gardien_porte', 'Gardien de la Porte'],
  surPlace: (ctx, p) => ctx.inscrit(p),
  debut: ctx => {
    var d = ctx.d, level = ctx.server.overworld()
    d.phase = 'ouverture'
    d.integrite = PORTES.integrite
    d.sauves = 0; d.vivres = 0; d.abattus = 0; d.vagues = 0; d.fermee = false
    d.groupes = []
    d.suit = {}       // groupe -> joueur suivi
    d.loin = {}       // groupe -> secondes passées trop loin
    for (var g = 0; g < PORTES.groupes; g++) {
      // répartis en éventail au sud (sud-est, sud, sud-ouest), à distance variable, jamais le long du mur
      var a = Math.PI * (0.15 + 0.7 * g / Math.max(1, PORTES.groupes - 1)) + (Math.random() - 0.5) * 0.2
      var dist = PORTES.distMin + Math.random() * (PORTES.distMax - PORTES.distMin)
      d.groupes.push({ x: Math.floor(PORTES.porte[0] + Math.cos(a) * dist), z: Math.floor(PORTES.porte[2] + Math.sin(a) * dist), fait: false })
      if (typeof REPERES !== 'undefined') REPERES['portes_' + g] = { nom: 'Réfugiés ' + (g + 1), ini: 'R', x: d.groupes[g].x, y: 70, z: d.groupes[g].z, couleur: 14 }
    }
    ctx.joueurs().forEach(p => { if (!atheriaLiveFaux(p) && typeof atheriaRepere === 'function') for (var i = 0; i < PORTES.groupes; i++) atheriaRepere(p, 'portes_' + i) })
    ctx.server.runCommandSilent('execute as @a at @s run playsound minecraft:event.raid.horn master @s ~ ~ ~ 0.8 0.7')
    ctx.radio('Décret d\'urgence : les portes de Longoni fermeront dans 20 minutes, jusqu\'à nouvel ordre. Cinq groupes de réfugiés attendent dehors. Leurs positions sont sur vos cartes.', 'PAF, haut-parleur :')
  },
  seconde: (ctx, s) => {
    var d = ctx.d, level = ctx.server.overworld(), joueurs = ctx.joueurs()
    if (d.phase == 'ouverture') {
      // groupes : apparition à l'approche, puis suivi
      d.groupes.forEach((pt, g) => {
        if (!pt.fait) {
          var proche = joueurs.some(p => !atheriaLiveFaux(p) && (p.x - pt.x) * (p.x - pt.x) + (p.z - pt.z) * (p.z - pt.z) < 64 * 64)
          if (proche && !portesFaireGroupe(ctx, g)) {
            // pas de sol praticable (eau, falaise) : le groupe se rapproche de la porte et son repère est remis à jour
            pt.x = Math.floor(pt.x + (PORTES.porte[0] - pt.x) * 0.15); pt.z = Math.floor(pt.z + (PORTES.porte[2] - pt.z) * 0.15)
            if (typeof REPERES !== 'undefined') { REPERES['portes_' + g].x = pt.x; REPERES['portes_' + g].z = pt.z }
            joueurs.forEach(p => { if (!atheriaLiveFaux(p) && typeof atheriaRepere === 'function') atheriaRepere(p, 'portes_' + g) })
          }
          return
        }
        var refs = portesEntites(ctx, 'atheria_refugie_' + g)
        if (!refs.length) return
        var chef = d.suit[g] ? ctx.trouver(d.suit[g]) : null
        if (!chef) {
          delete d.suit[g]
          joueurs.forEach(p => {
            if (d.suit[g] || atheriaLiveFaux(p)) return
            if (refs.some(r => r.distanceTo(p) <= PORTES.rayonApproche)) {
              d.suit[g] = p.username; d.loin[g] = 0
              ctx.inscrire(p)
              ctx.action(p, 'minecraft:lead', refs.length + ' réfugiés te suivent. Ramène-les à la Porte RN1 avant la fermeture.', 'vert')
            }
          })
          return
        }
        var dist = Math.min.apply(null, refs.map(r => r.distanceTo(chef)))
        if (dist > PORTES.rayonPerdu) {
          d.loin[g] = (d.loin[g] || 0) + 1
          if (d.loin[g] >= PORTES.perduSec) {
            ctx.action(chef, 'minecraft:lead', 'Tu as perdu tes réfugiés. Ils attendent là où tu les as laissés.', 'rouge')
            delete d.suit[g]
          }
          return
        }
        d.loin[g] = 0
        refs.forEach(r => {
          if (portesDansMurs(level, r.x, r.z)) {
            r.discard()
            d.sauves++
            ctx.score(chef, PORTES.pointsRefugie)
            ctx.action(chef, 'minecraft:lead', 'Un réfugié est à l\'abri. ' + d.sauves + ' sauvés en tout.', 'vert')
            return
          }
          if (r.distanceTo(chef) > 3) r.getNavigation().moveTo(chef, 1.25)
        })
        if (!portesEntites(ctx, 'atheria_refugie_' + g).length) ctx.radio(chef.username + ' a ramené un groupe de réfugiés. ' + d.sauves + ' personnes à l\'abri.', 'PAF, haut-parleur :')
      })
      // sacs de vivres
      joueurs.forEach(p => {
        if (atheriaLiveFaux(p) || !portesDansMurs(level, p.x, p.z)) return
        var n = p.inventory.count('atheria:sac_vivres')
        if (!n) return
        p.inventory.clear('atheria:sac_vivres')
        d.vivres += n
        ctx.inscrire(p)
        ctx.score(p, PORTES.pointsVivres * n)
        ctx.action(p, 'atheria:sac_vivres', 'Vivres remis à la PAF : ' + d.vivres + ' sac(s) en tout.', 'vert')
      })
      var reste = PORTES.ouvertureSec - s
      if (reste == 600 || reste == 300) ctx.radio('Fermeture des portes dans ' + (reste / 60) + ' minutes.', 'PAF, haut-parleur :')
      if (reste == 60) ctx.radio('Fermeture des portes dans une minute. Il n\'y aura pas de seconde annonce.', 'PAF, haut-parleur :')
      if (reste > 0) return
      // fermeture
      d.phase = 'defense'; d.fermeture = s; d.fermee = true
      var dehors = 0
      level.getEntities().forEach(m => { if (m.tags.contains('atheria_refugie') && m.tags.contains(ctx.marque)) { dehors++; m.discard() } })
      // groupes que personne n'est allé chercher : ils restent dehors aussi
      d.groupes.forEach((pt, g) => { if (!pt.fait) dehors += 2 + (g % 2) })
      ctx.server.runCommandSilent('execute as @a at @s run playsound minecraft:event.raid.horn master @s ~ ~ ~ 1 0.6')
      ctx.radio('Les frontières sont fermées jusqu\'à nouvel ordre. Il n\'y a pas de formulaire de recours.' + (dehors ? ' ' + dehors + ' réfugiés restent dehors.' : ''), 'PAF, haut-parleur :')
      ctx.banniere('danger', 'La fermeture des portes', 'Porte fermée', 'Une horde monte de la RN1. Tenez la Porte RN1 pendant 15 minutes.')
      return
    }
    // défense : six vagues, la porte s'abîme à chaque infecté qui la touche
    var t = s - d.fermeture, pas = Math.floor(PORTES.defenseSec / PORTES.vagues)
    if (d.vagues < PORTES.vagues && t >= d.vagues * pas + 10) {
      d.vagues++
      var n = portesVague(ctx, d.vagues)
      ctx.radio('Vague ' + d.vagues + ' sur ' + PORTES.vagues + ' : ' + n + ' infectés sur la RN1. Porte à ' + d.integrite + ' %.', 'PAF, haut-parleur :')
    }
    joueurs.forEach(p => {
      if ((p.x - PORTES.porte[0]) * (p.x - PORTES.porte[0]) + (p.z - PORTES.porte[2]) * (p.z - PORTES.porte[2]) < 120 * 120) ctx.inscrire(p)
    })
    var horde = portesEntites(ctx, 'atheria_horde_porte')
    horde.forEach(m => {
      var dx = m.x - PORTES.porte[0], dz = m.z - PORTES.porte[2]
      if (dx * dx + dz * dz <= PORTES.rayonPorte * PORTES.rayonPorte) {
        m.discard()
        d.integrite = Math.max(0, d.integrite - PORTES.degatInfecte)
        if (d.integrite % 20 == 0) ctx.radio('La porte cède : ' + d.integrite + ' %.', 'PAF, haut-parleur :')
        return
      }
      if (m.getTarget() == null) m.getNavigation().moveTo(PORTES.porte[0] + 0.5, PORTES.porte[1], PORTES.porte[2] + 3.5, 1.0)
    })
    if (d.integrite <= 0) {
      d.tenue = false
      ctx.radio('La Porte RN1 a cédé. La PAF recule derrière le second mur.', 'PAF, haut-parleur :')
      ctx.terminer()
      return
    }
    if (t >= PORTES.defenseSec || (d.vagues >= PORTES.vagues && t > (PORTES.vagues - 1) * pas + 60 && !horde.length)) {
      d.tenue = true
      ctx.etat.inscrits.forEach(k => ctx.score(k, PORTES.bonusPorte))
      ctx.radio('La porte a tenu, à ' + d.integrite + ' %. ' + d.sauves + ' réfugiés et ' + d.vivres + ' sacs de vivres sont passés avant la fermeture.', 'PAF, haut-parleur :')
      ctx.terminer()
    }
  },
  fin: ctx => {
    ctx.server.players.forEach(p => { if (p.inventory.count('atheria:sac_vivres')) p.inventory.clear('atheria:sac_vivres') })
    ctx.server.getAllLevels().forEach(level => level.getEntities().forEach(m => { if (m.tags.contains('atheria_live')) m.discard() }))
  }
})

// infecté de la horde abattu par un joueur : 10 points
EntityEvents.death(event => {
  var m = event.entity
  if (!m.tags.contains('atheria_horde_porte')) return
  var src = event.source, p = src ? src.actual : null
  if (!p || !p.isPlayer()) return
  var server = m.server, e = atheriaLiveEtat(server)
  if (!e || e.nom != 'portes' || e.phase != 'encours') return
  var ctx = atheriaLiveCtx(server, e)
  ctx.d.abattus++
  ctx.score(p, PORTES.pointsInfecte)
  ctx.inscrire(p)
  atheriaLiveEcrire(server, e)
})

// hors soirée, un sac de vivres de la soirée n'existe pas
ServerEvents.tick(event => {
  var server = event.server
  if (server.tickCount % 100 != 53) return
  var e = atheriaLiveEtat(server)
  if (e && e.nom == 'portes') return
  server.players.forEach(p => { if (p.inventory.count('atheria:sac_vivres')) p.inventory.clear('atheria:sac_vivres') })
})
