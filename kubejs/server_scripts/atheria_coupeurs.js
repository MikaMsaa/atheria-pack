// Atheria - les Coupeurs de route tendent des embuscades (Mika 22/11, « pillards humains » validé).
// Lore : les Coupeurs « facturent l'immobilité » (Bacar B., Kavelia). Ils ne tuent pas d'abord : ils demandent un péage.
//  - de jour, au stade 2 et plus, loin du spawn et à découvert, un joueur peut être arrêté par une voix :
//    « Frais de route : N bons CAF. » Deux choix cliquables dans le chat : payer, ou refuser ;
//  - payer : les Coupeurs le laissent passer pendant 2 heures (laissez-passer) ;
//  - refuser, ne pas répondre en 20 s, ou ne pas avoir les bons : 2 à 4 Coupeurs sortent des fourrés et attaquent ;
//  - ils lâchent des bons, parfois des munitions ou des soins ; ils repartent après 4 minutes ou si le joueur s'éloigne.
// Fréquence : au plus une fois par heure de jeu et par joueur, une chance par minute ensuite (environ toutes les 1 h 30).
var COUPEURS = {
  stadeMini: 2,
  ecartMin: 60,             // minutes de temps réel entre deux arrêts pour un joueur
  chanceParMinute: 1 / 30,
  distanceSpawnMin: 600,    // pas d'embuscade près de Longoni et du point d'arrivée
  delaiReponse: 20,         // secondes pour payer
  laissezPasserMin: 120,
  peage: [0, 0, 8, 12, 16, 20],
  nombre: [0, 0, 2, 3, 3, 4],
  vieMin: 4,                // minutes avant qu'ils repartent
  skins: ['coupeur_1', 'coupeur_2', 'coupeur_3', 'coupeur_4']
}

function atheriaCoupeursStade(p) {
  var sb = p.server.scoreboard, o = sb.getObjective('atheria_stade')
  if (!o) return 1
  var SH = Java.loadClass('net.minecraft.world.scores.ScoreHolder')
  return Math.max(1, sb.getOrCreatePlayerScore(SH.forNameOnly(p.username), o).get())
}

function atheriaCoupeursArme(stade, i) {
  // un tireur au stade 3 et plus (pistolet : l'arme reste sur lui, elle n'est pas lâchée), les autres au corps à corps
  if (i == 0 && stade >= 3) return '{id:"tacz:modern_kinetic_gun",count:1,components:{"minecraft:custom_data":{GunId:"tacz:glock_17",GunCurrentAmmoCount:17}}}'
  return ['{id:"minecraft:iron_axe",count:1}', '{id:"minecraft:stone_axe",count:1}', '{id:"minecraft:iron_sword",count:1}'][i % 3]
}

function atheriaCoupeursSnbt(stade, i, cible) {
  var tireur = i == 0 && stade >= 3
  var obj = tireur
    ? '{Type:"GUN_ATTACK",Prio:2,SpeedModifier:1.0d,AttackInterval:30,AttackRadius:16.0f}'
    : '{Type:"MELEE_ATTACK",Prio:2,SpeedModifier:1.15d}'
  var skin = COUPEURS.skins[Math.floor(Math.random() * COUPEURS.skins.length)]
  var vie = 18 + stade * 3
  return '{CustomName:\'{"text":"Coupeur de route","color":"#C84A3A"}\',EasyNPCVersion:3,PersistenceRequired:1b,EntityAttribute:{IsAttackableByPlayers:1b,IsAttackableByMonsters:1b,IsAttackableByFactions:1b,IsInvulnerable:0b,IsKnockbackResistant:0b,IsExplosionResistant:0b,HealthRegeneration:0.0d},Tags:["atheria_coupeur","atheria_coupeur_' + cible + '"],' +
    'VariantType:"STEVE",SkinData:{Type:"RESOURCE_LOCATION",Texture:"atheria:textures/entity/coupeurs/' + skin + '.png"},' +
    'HandItems:[' + atheriaCoupeursArme(stade, i) + ',{}],HandDropChances:[0.0f,0.0f],' +
    'ArmorItems:[{},{},' + (stade >= 4 ? '{id:"militaristic_armor:light_camo_chestplate",count:1}' : '{id:"minecraft:leather_chestplate",count:1,components:{"minecraft:dyed_color":{rgb:4210752}}}') + ',{}],ArmorDropChances:[0.0f,0.0f,0.0f,0.0f],' +
    'attributes:[{id:"minecraft:generic.max_health",base:' + vie + '.0d},{id:"minecraft:generic.movement_speed",base:0.3d},{id:"minecraft:generic.attack_damage",base:' + (2 + stade) + '.0d}],Health:' + vie + '.0f,' +
    'ObjectiveData:{ObjectiveDataSet:[{Type:"FLOAT",Prio:0},' + obj + ',{Type:"ATTACK_PLAYER",Prio:2},{Type:"HURT_BY_TARGET",Prio:1},{Type:"RANDOM_STROLL",Prio:6},{Type:"LOOK_AT_PLAYER",Prio:7}]}}'
}

function atheriaCoupeursSol(level, x, z) {
  var BP = Java.loadClass('net.minecraft.core.BlockPos')
  var HM = Java.loadClass('net.minecraft.world.level.levelgen.Heightmap$Types')
  var y = level.getHeight(HM.MOTION_BLOCKING_NO_LEAVES, x, z)
  var sol = level.getBlockState(new BP(x, y - 1, z))
  if (!sol.getFluidState().isEmpty()) return null
  return y
}

function atheriaCoupeursSortir(p) {
  var stade = atheriaCoupeursStade(p), n = COUPEURS.nombre[Math.min(5, stade)]
  var level = p.level, faits = 0
  // ils sortent derrière et sur les côtés du joueur, à 14-22 blocs
  var yaw = (p.yRot + 180) * Math.PI / 180
  for (var essai = 0; essai < 24 && faits < n; essai++) {
    var a = yaw + (Math.random() - 0.5) * 2.2, d = 14 + Math.random() * 8
    var x = Math.floor(p.x - Math.sin(a) * d), z = Math.floor(p.z + Math.cos(a) * d)
    var y = atheriaCoupeursSol(level, x, z)
    if (y == null || Math.abs(y - p.y) > 8) continue
    // « execute summon … data merge » : Easy NPC ne lit ses attributs (attaquable par les joueurs) qu'au chargement après l'apparition
    p.server.runCommandSilent('execute in ' + level.dimension + ' positioned ' + (x + 0.5) + ' ' + y + ' ' + (z + 0.5) + ' summon easy_npc:humanoid run data merge entity @s ' + atheriaCoupeursSnbt(stade, faits, p.username))
    faits++
  }
  if (faits == 0) return
  p.persistentData.putLong('atheria_coupeurs_fin', Date.now() + COUPEURS.vieMin * 60 * 1000)
  p.tell(Text.red('« Mauvaise réponse. » Des silhouettes sortent des fourrés.'))
  p.server.runCommandSilent('playsound minecraft:entity.pillager.celebrate hostile ' + p.username + ' ~ ~ ~ 1 0.8')
}

function atheriaCoupeursArreter(p) {
  var stade = atheriaCoupeursStade(p), prix = COUPEURS.peage[Math.min(5, stade)]
  var d = p.persistentData
  d.putLong('atheria_peage_fin', Date.now() + COUPEURS.delaiReponse * 1000)
  d.putInt('atheria_peage_prix', prix)
  d.putLong('atheria_coupeurs_dernier', Date.now())
  p.server.runCommandSilent('playsound minecraft:block.note_block.bell hostile ' + p.username + ' ~ ~ ~ 0.6 0.6')
  p.tell(Text.gray('Une voix, quelque part dans les fourrés : ').append(Text.white('« Frais de route, chef. ' + prix + ' bons CAF et tu passes. Sinon on se sert. »')))
  p.tell(Text.of('   ')
    .append(Text.green('[Payer ' + prix + ' bons]').clickRunCommand('/peage payer').hover(Text.gray('Les Coupeurs te laissent tranquille pendant 2 heures.')))
    .append(Text.of('   '))
    .append(Text.red('[Refuser]').clickRunCommand('/peage refuser').hover(Text.gray('Ils sont plusieurs, et armés.'))))
  p.setStatusMessage(Text.yellow('Tu as ' + COUPEURS.delaiReponse + ' secondes pour répondre.'))
}

function atheriaCoupeursRepondre(p, payer) {
  var d = p.persistentData
  if (!d.getLong('atheria_peage_fin')) { p.tell(Text.gray('Personne ne te demande rien.')); return 0 }
  var prix = d.getInt('atheria_peage_prix')
  d.remove('atheria_peage_fin')
  if (payer) {
    if (atheriaCompter(p, 'atheria:bon_caf') >= prix && atheriaRetirer(p, 'atheria:bon_caf', prix) === prix) {
      d.putLong('atheria_laissez_passer', Date.now() + COUPEURS.laissezPasserMin * 60 * 1000)
      p.tell(Text.gray('« Merci pour ta contribution au réseau routier. On fait passer le mot : tu es en règle pour deux heures. »'))
      return 1
    }
    p.tell(Text.gray('« Il en manque. Bacar n\'accepte pas les paiements partiels. »'))
  }
  atheriaCoupeursSortir(p)
  return 1
}

function atheriaCoupeursPeutArreter(p) {
  if (p.isSpectator() || p.isCreative() || String(p.level.dimension) != 'minecraft:overworld') return false
  if (atheriaCoupeursStade(p) < COUPEURS.stadeMini) return false
  var t = p.level.getDayTime() % 24000
  if (t < 1000 || t > 11500) return false   // la nuit appartient aux infectés
  var d = p.persistentData, now = Date.now()
  if (d.getLong('atheria_laissez_passer') > now || d.getLong('atheria_coupeurs_fin') > now) return false
  var dernier = d.getLong('atheria_coupeurs_dernier')
  if (dernier && now - dernier < COUPEURS.ecartMin * 60 * 1000) return false
  var sp = p.level.getSharedSpawnPos(), dx = p.x - sp.x, dz = p.z - sp.z
  if (dx * dx + dz * dz < COUPEURS.distanceSpawnMin * COUPEURS.distanceSpawnMin) return false
  var BP = Java.loadClass('net.minecraft.core.BlockPos')
  if (!p.level.canSeeSky(new BP(Math.floor(p.x), Math.floor(p.y + 1.7), Math.floor(p.z)))) return false
  var sb = p.server.scoreboard, o = sb.getObjective('atheria')
  if (o) {
    var SH = Java.loadClass('net.minecraft.world.scores.ScoreHolder')
    if (sb.getOrCreatePlayerScore(SH.forNameOnly('#horde'), o).get() > 0 || sb.getOrCreatePlayerScore(SH.forNameOnly('#tempete'), o).get() > 0) return false
  }
  return true
}

ServerEvents.tick(event => {
  var server = event.server
  if (server.tickCount % 20 != 7) return
  var now = Date.now()
  server.players.forEach(p => {
    var d = p.persistentData
    // pas de réponse à temps
    var fin = d.getLong('atheria_peage_fin')
    if (fin && now >= fin) { d.remove('atheria_peage_fin'); p.tell(Text.gray('« Le silence, c\'est un non. »')); atheriaCoupeursSortir(p) }
    // départ des Coupeurs : après 4 min, ou si le joueur est loin
    var fc = d.getLong('atheria_coupeurs_fin')
    if (fc && server.tickCount % 100 == 7) {
      var restants = p.level.getEntities().filter(e => e.tags.contains('atheria_coupeur_' + p.username))
      restants.forEach(e => { if (now >= fc || e.distanceTo(p) > 80) e.discard() })
      if (now >= fc || restants.every(e => !e.isAlive() || e.distanceTo(p) > 80)) d.remove('atheria_coupeurs_fin')
    }
  })
  if (server.tickCount % 1200 != 307) return
  server.players.forEach(p => {
    if (atheriaCoupeursPeutArreter(p) && Math.random() < COUPEURS.chanceParMinute * (atheriaSemaine() == 'coupeurs' ? 2 : 1)) atheriaCoupeursArreter(p)
  })
})

// butin : de quoi rendre le combat rentable, sans fusil ni blindage (ils ne lâchent pas leur équipement)
EntityEvents.death('easy_npc:humanoid', event => {
  var e = event.entity
  if (!e.tags.contains('atheria_coupeur')) return
  var lvl = e.level, x = e.x, y = e.y + 0.5, z = e.z
  function lacher(id, n, extra) { e.server.runCommandSilent('execute in ' + lvl.dimension + ' run summon item ' + x + ' ' + y + ' ' + z + ' {Item:{id:"' + id + '",count:' + n + (extra || '') + '}}') }
  lacher('atheria:bon_caf', (1 + Math.floor(Math.random() * 3)) * (atheriaSemaine() == 'coupeurs' ? 2 : 1))
  if (Math.random() < 0.4) lacher('tacz:ammo', 6 + Math.floor(Math.random() * 7), ',components:{"minecraft:custom_data":{AmmoId:"tacz:9mm"}}')
  if (Math.random() < 0.25) lacher('firstaid:bandage', 1 + Math.floor(Math.random() * 2))
  if (Math.random() < 0.1) lacher('atheria:bidon_essence', 1)
  var src = event.source, p = src ? src.player : null
  if (p && p.isPlayer()) {
    p.addXP(15)
    routeXp(p, 8)
    if (typeof atheriaCarnetNoter === 'function' && atheriaCarnetNoter(p, 'atheria_carnet_familles_humains', 'Coupeurs de route'))
      atheriaHud(p, { t: 'note', titre: 'Coupeurs de route', texte: 'ils demandent avant de tirer. Payer coûte moins cher que se soigner, mais leurs poches valent le détour.' })
  }
})

ServerEvents.commandRegistry(event => {
  var Commands = event.commands
  event.register(Commands.literal('peage')
    .then(Commands.literal('payer').executes(ctx => { var p = ctx.source.player; return p ? atheriaCoupeursRepondre(p, true) : 0 }))
    .then(Commands.literal('refuser').executes(ctx => { var p = ctx.source.player; return p ? atheriaCoupeursRepondre(p, false) : 0 })))
  // test et réglage : /atheria_coupeurs <joueur>
  event.register(Commands.literal('atheria_coupeurs').requires(src => src.hasPermission(2))
    .then(Commands.argument('joueur', event.arguments.PLAYER.create(event)).executes(ctx => { atheriaCoupeursArreter(event.arguments.PLAYER.getResult(ctx, 'joueur')); return 1 })))
})
