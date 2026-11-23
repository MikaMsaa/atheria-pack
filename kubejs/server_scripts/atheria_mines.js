// Atheria - la mine vit : poches de gaz, filons riches et vieux casiers de mineur.
// Tout se joue au moment où un joueur casse un bloc : rien ne tourne quand personne ne mine.
// Poches de gaz (Mika 23/11 : bien plus fréquentes, le mineur doit rester sur ses gardes toute la session, et
// l'explosion tue sur le coup). Partout sous terre (sous le niveau 40, sans ciel), deux fois plus en profondeur.
var MINE_NIVEAU_GAZ = 40
var MINE_CHANCE_GAZ = 1 / 90        // roche cassée entre les niveaux 40 et 0
var MINE_CHANCE_GAZ_PROFOND = 1 / 45 // sous le niveau 0
var MINE_CHANCE_FILON = 1 / 40
var MINE_CHANCE_CASIER = 1 / 600
var MINE_RAYON_GAZ = 6              // rayon du nuage une fois étendu (il grossit pendant 6 s)
var MINE_DUREE_GAZ = 30             // secondes avant que le gaz se dissipe
var MINE_RAYON_MORTEL = 5           // dans ce rayon, l'explosion tue sur le coup
var MINE_RAYON_SOUFFLE = 10         // au-delà, le souffle blesse encore
var MINE_REPIT_TICKS = 2400 // 2 minutes entre deux poches pour un même joueur
var MINE_FLAMME = /torch|lantern|campfire|flint_and_steel|fire_charge|lava_bucket|blaze/
var MINE_SANS_FLAMME = /flashlight|redstone/
var MINE_MASQUE = /mask|masque/
var MINE_ROCHE = /^minecraft:(stone|deepslate|tuff|andesite|diorite|granite|calcite|basalt|smooth_basalt|blackstone|dripstone_block)$/
// Blocs qui enflamment le gaz s'ils sont dans le nuage : torches et lanternes posées, feux, lave, fours allumés
// Toutes les flammes posées, y compris celles des mods (torches qui se consument de simple_burnout_torch, lanternes, etc.)
var MINE_BLOC_FLAMME = /(torch|lantern|campfire|fire)$|^minecraft:(lava|magma_block)$/
var MINE_BLOC_SANS_FLAMME = /redstone/
var mineRepit = {}

function mineTientFlamme(joueur) {
  var a = '' + joueur.getMainHandItem().getId()
  var b = '' + joueur.getOffhandItem().getId()
  return (MINE_FLAMME.test(a) && !MINE_SANS_FLAMME.test(a)) || (MINE_FLAMME.test(b) && !MINE_SANS_FLAMME.test(b))
}

function minePorteMasque(joueur) {
  // Le masque artisanal ne se porte pas : l'avoir sur soi suffit
  return MINE_MASQUE.test('' + joueur.getHeadArmorItem().getId()) || joueur.inventory.count('atheria:masque_artisanal') > 0
}

// Une flamme posée dans le nuage ? (cube autour du centre, rayon actuel du nuage)
function mineBlocFlamme(niveau, x, y, z, r) {
  var cx = Math.floor(x), cy = Math.floor(y), cz = Math.floor(z)
  for (var dx = -r; dx <= r; dx++) for (var dy = -r; dy <= r; dy++) for (var dz = -r; dz <= r; dz++) {
    if (dx * dx + dy * dy + dz * dz > r * r) continue
    var b = niveau.getBlock(cx + dx, cy + dy, cz + dz)
    var id = '' + b.id
    if (!MINE_BLOC_FLAMME.test(id) || MINE_BLOC_SANS_FLAMME.test(id)) continue
    // Feu de camp éteint, torche consumée : sans danger
    var pr = null
    try { pr = b.properties } catch (e) { }
    if (pr) {
      if (('' + pr.get('lit')) == 'false') continue
      if (('' + pr.get('litstate')) == '0') continue
    }
    return true
  }
  return false
}

function mineExplosion(serveur, niveau, x, y, z) {
  // Le souffle ne creuse pas (bases et galeries intactes), mais il tue : personne ne survit au cœur de la poche.
  // Les dégâts passent d'abord, par commande : ils ne dépendent pas de l'explosion du jeu.
  var dim = niveau.dimension
  niveau.getPlayers().forEach(p => {
    var d2 = p.distanceToSqr(x, y, z)
    if (d2 > MINE_RAYON_SOUFFLE * MINE_RAYON_SOUFFLE || p.isCreative() || p.isSpectator()) return
    if (d2 <= MINE_RAYON_MORTEL * MINE_RAYON_MORTEL) {
      serveur.runCommandSilent('damage ' + p.username + ' 1000 minecraft:explosion')
    } else {
      // Entre 5 et 10 blocs : blessé, sonné, mais vivant (de 14 à 6 points selon la distance)
      var deg = Math.round(14 - (Math.sqrt(d2) - MINE_RAYON_MORTEL) * 1.6)
      serveur.runCommandSilent('damage ' + p.username + ' ' + deg + ' minecraft:explosion')
      serveur.runCommandSilent('effect give ' + p.username + ' minecraft:darkness 6 0 true')
      serveur.runCommandSilent('effect give ' + p.username + ' minecraft:slowness 6 1 true')
      p.tell(Text.red('Le gaz s\'enflamme ! Le souffle te projette contre la roche.'))
    }
  })
  serveur.runCommandSilent('execute in ' + dim + ' run particle minecraft:explosion_emitter ' + x + ' ' + y + ' ' + z + ' 0 0 0 0 1 force')
  serveur.runCommandSilent('execute in ' + dim + ' run particle minecraft:flame ' + x + ' ' + y + ' ' + z + ' 3 2 3 0.15 200 force')
  serveur.runCommandSilent('execute in ' + dim + ' run playsound minecraft:entity.generic.explode block @a ' + x + ' ' + y + ' ' + z + ' 4 0.6')
  // Recul et dégâts aux mobs : explosion du jeu, sans casser de bloc
  try {
    niveau['explode(net.minecraft.world.entity.Entity,double,double,double,float,net.minecraft.world.level.Level$ExplosionInteraction)'](null, x, y, z, 4.0, Java.loadClass('net.minecraft.world.level.Level$ExplosionInteraction').NONE)
  } catch (e) {
    console.warn('[Atheria] poche de gaz : explosion du jeu impossible (' + e + '), dégâts déjà appliqués')
  }
}

function minePocheGaz(joueur, x, y, z) {
  var serveur = joueur.server
  var niveau = joueur.level
  var dim = niveau.dimension
  joueur.tell(Text.gold('Une odeur âcre s\'échappe de la roche : poche de gaz ! Recule et éteins toute flamme, vite.'))
  serveur.runCommandSilent('execute in ' + dim + ' run playsound minecraft:block.lava.extinguish block @a ' + x + ' ' + y + ' ' + z + ' 1.2 0.5')
  var restant = MINE_DUREE_GAZ
  var tour = () => {
    // Le nuage s'étend de 3 à 6 blocs pendant les 6 premières secondes
    var r = Math.min(MINE_RAYON_GAZ, 3 + Math.floor((MINE_DUREE_GAZ - restant) / 2))
    serveur.runCommandSilent('execute in ' + dim + ' run particle minecraft:campfire_cosy_smoke ' + x + ' ' + y + ' ' + z + ' ' + (r * 0.5) + ' ' + (r * 0.35) + ' ' + (r * 0.5) + ' 0.004 ' + (10 + r * 6) + ' force')
    if (restant % 3 == 0) serveur.runCommandSilent('execute in ' + dim + ' run playsound minecraft:block.fire.extinguish block @a ' + x + ' ' + y + ' ' + z + ' 0.5 0.4')
    var explose = mineBlocFlamme(niveau, x, y, z, r)
    niveau.getPlayers().forEach(p => {
      if (p.distanceToSqr(x, y, z) > r * r) return
      if (mineTientFlamme(p)) explose = true
      else if (!minePorteMasque(p)) {
        serveur.runCommandSilent('effect give ' + p.username + ' minecraft:poison 3 1 true')
        serveur.runCommandSilent('effect give ' + p.username + ' minecraft:nausea 6 0 true')
        serveur.runCommandSilent('effect give ' + p.username + ' minecraft:mining_fatigue 4 1 true')
      }
    })
    if (explose) {
      mineExplosion(serveur, niveau, x, y, z)
      return
    }
    restant--
    if (restant > 0) serveur.scheduleInTicks(20, tour)
  }
  serveur.scheduleInTicks(30, tour)
}

// Essai sur une copie : /atheria_gaz ouvre une poche à 2 blocs devant soi (opérateurs seulement)
ServerEvents.commandRegistry(event => {
  event.register(event.commands.literal('atheria_gaz').requires(s => s.hasPermission(2)).executes(ctx => {
    var p = ctx.source.player
    if (!p) return 0
    var v = p.getLookAngle()
    minePocheGaz(p, Math.floor(p.x + v.x() * 2) + 0.5, Math.floor(p.y + 1) + 0.5, Math.floor(p.z + v.z() * 2) + 0.5)
    return 1
  }))
})

BlockEvents.broken(event => {
  var joueur = event.player
  if (joueur == null || joueur.isCreative()) return
  var bloc = event.block
  var id = '' + bloc.id
  var y = bloc.y
  if (y > 40 || joueur.level.canSeeSky(bloc.pos)) return
  var hasard = Math.random()
  if (/_ore$/.test(id)) {
    if (hasard < MINE_CHANCE_FILON) {
      var taille = 2 + Math.floor(Math.random() * 3)
      for (var i = 0; i < taille; i++) bloc.popItem(bloc.getDrops(joueur, joueur.getMainHandItem()).get(0))
      joueur.level.server.runCommandSilent('xp add ' + joueur.username + ' ' + (4 + taille * 2))
      joueur.tell(Text.green('Filon riche !'))
    }
    return
  }
  if (!MINE_ROCHE.test(id)) return
  if (hasard < MINE_CHANCE_CASIER) {
    var x = bloc.x, z = bloc.z
    event.server.scheduleInTicks(1, () => {
      event.server.runCommandSilent('execute in ' + joueur.level.dimension + ' run setblock ' + x + ' ' + y + ' ' + z + ' minecraft:barrel[facing=up]{LootTable:"minecraft:chests/abandoned_mineshaft"}')
    })
    joueur.tell(Text.yellow('Ta pioche heurte du métal : un vieux casier de mineur.'))
    return
  }
  var chanceGaz = y < 0 ? MINE_CHANCE_GAZ_PROFOND : MINE_CHANCE_GAZ
  if (y < MINE_NIVEAU_GAZ && hasard < MINE_CHANCE_CASIER + chanceGaz) {
    var temps = Number(joueur.level.getLevelData().getGameTime())
    if (mineRepit[joueur.username] && temps < mineRepit[joueur.username]) return
    mineRepit[joueur.username] = temps + MINE_REPIT_TICKS
    minePocheGaz(joueur, bloc.x + 0.5, y + 0.5, bloc.z + 0.5)
  }
})
