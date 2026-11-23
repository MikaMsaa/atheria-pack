// Atheria - la mine vit : poches de gaz, filons riches et vieux casiers de mineur.
// Tout se joue au moment où un joueur casse un bloc : rien ne tourne quand personne ne mine.
var MINE_NIVEAU_GAZ = 0
var MINE_CHANCE_GAZ = 1 / 250
var MINE_CHANCE_FILON = 1 / 40
var MINE_CHANCE_CASIER = 1 / 600
var MINE_RAYON_GAZ = 5
var MINE_DUREE_GAZ = 12
var MINE_REPIT_TICKS = 6000 // 5 minutes entre deux poches pour un même joueur
var MINE_FLAMME = /torch|lantern|campfire|flint_and_steel/
var MINE_SANS_FLAMME = /flashlight/
var MINE_MASQUE = /mask|masque/
var MINE_ROCHE = /^minecraft:(stone|deepslate|tuff|andesite|diorite|granite)$/
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

function minePocheGaz(joueur, x, y, z) {
  var serveur = joueur.server
  var niveau = joueur.level
  joueur.tell(Text.gold('Une odeur âcre s\'échappe de la roche : poche de gaz ! Recule et range toute flamme.'))
  serveur.runCommandSilent('execute in ' + niveau.dimension + ' run playsound minecraft:block.lava.extinguish block @a ' + x + ' ' + y + ' ' + z + ' 1 0.6')
  var restant = MINE_DUREE_GAZ
  var tour = () => {
    serveur.runCommandSilent('execute in ' + niveau.dimension + ' run particle minecraft:campfire_cosy_smoke ' + x + ' ' + y + ' ' + z + ' 2 1.5 2 0.005 25 force')
    var explose = false
    niveau.getPlayers().forEach(p => {
      if (p.distanceToSqr(x, y, z) > MINE_RAYON_GAZ * MINE_RAYON_GAZ) return
      if (mineTientFlamme(p)) explose = true
      else if (!minePorteMasque(p)) {
        serveur.runCommandSilent('effect give ' + p.username + ' minecraft:poison 3 0 true')
        serveur.runCommandSilent('effect give ' + p.username + ' minecraft:nausea 5 0 true')
      }
    })
    if (explose) {
      // Le souffle blesse sans creuser : le gaz est dangereux, pas destructeur pour les bases
      niveau['explode(net.minecraft.world.entity.Entity,double,double,double,float,net.minecraft.world.level.Level$ExplosionInteraction)'](null, x, y, z, 2.0, Java.loadClass('net.minecraft.world.level.Level$ExplosionInteraction').NONE)
      niveau.getPlayers().forEach(p => {
        if (p.distanceToSqr(x, y, z) < 64) p.tell(Text.red('Le gaz s\'enflamme !'))
      })
      return
    }
    restant--
    if (restant > 0) serveur.scheduleInTicks(20, tour)
  }
  serveur.scheduleInTicks(40, tour)
}

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
  if (y < MINE_NIVEAU_GAZ && hasard < MINE_CHANCE_CASIER + MINE_CHANCE_GAZ) {
    var temps = Number(joueur.level.getLevelData().getGameTime())
    if (mineRepit[joueur.username] && temps < mineRepit[joueur.username]) return
    mineRepit[joueur.username] = temps + MINE_REPIT_TICKS
    minePocheGaz(joueur, bloc.x + 0.5, y + 0.5, bloc.z + 0.5)
  }
})
