// Atheria Zombie Edition : le bruit attire les infectés et les zombies (tirs et explosions), pas les autres mobs hostiles.
// Un infecté sans cible marche vers la source du bruit. Un silencieux réduit fortement la portée.
var BRUIT_PORTEE_TIR = 48
var BRUIT_PORTEE_SILENCIEUX = 12
var BRUIT_PORTEE_EXPLOSION = 64
var BRUIT_HAUTEUR = 24
var BRUIT_MAX_MOBS = 40
var BRUIT_VITESSE = 1.15
var BRUIT_DELAI_TICKS = 20
var BRUIT_RELANCES = 4
var BRUIT_PAS_RELANCE = 50
var bruitDernier = {}

// Spore, les joueurs zombifiés de The Hordes et les zombies vanilla
var BRUIT_ZOMBIES = ['minecraft:zombie', 'minecraft:husk', 'minecraft:drowned', 'minecraft:zombie_villager']
function bruitEstInfecte(mob) {
  var id = '' + mob.type
  return id.indexOf('spore:') == 0 || id.indexOf('hordes:') == 0 || BRUIT_ZOMBIES.indexOf(id) >= 0
}

function bruitAttirer(level, x, y, z, portee) {
  var Mob = Java.loadClass('net.minecraft.world.entity.Mob')
  var AABB = Java.loadClass('net.minecraft.world.phys.AABB')
  var zone = new AABB(x - portee, y - BRUIT_HAUTEUR, z - portee, x + portee, y + BRUIT_HAUTEUR, z + portee)
  var attires = []
  var mobs = level['getEntitiesOfClass(java.lang.Class,net.minecraft.world.phys.AABB)'](Mob, zone)
  for (var i = 0; i < mobs.size() && attires.length < BRUIT_MAX_MOBS; i++) {
    var mob = mobs.get(i)
    if (!bruitEstInfecte(mob)) continue
    if (mob.isNoAi() || mob.getTarget() != null) continue
    mob.getNavigation().moveTo(x, y, z, BRUIT_VITESSE)
    attires.push(mob)
  }
  // Les errances du mob reprennent vite le dessus : la marche est relancée quelques fois
  if (attires.length > 0) bruitRelancer(level, attires, x, y, z, BRUIT_RELANCES)
  return attires.length
}

function bruitRelancer(level, mobs, x, y, z, reste) {
  level.getServer().scheduleInTicks(BRUIT_PAS_RELANCE, () => {
    mobs.forEach(mob => {
      if (mob.isAlive() && mob.getTarget() == null && mob.distanceToSqr(x, y, z) > 16) mob.getNavigation().moveTo(x, y, z, BRUIT_VITESSE)
    })
    if (reste > 1) bruitRelancer(level, mobs, x, y, z, reste - 1)
  })
}

NativeEvents.onEvent('com.tacz.guns.api.event.common.GunFireEvent', event => {
  try {
    var tireur = event.getShooter()
    if (tireur == null || tireur.level.isClientSide() || !tireur.isPlayer()) return
    var cle = '' + tireur.username
    var maintenant = tireur.level.getLevelData().getGameTime()
    if (bruitDernier[cle] != null && maintenant - bruitDernier[cle] < BRUIT_DELAI_TICKS) return
    bruitDernier[cle] = maintenant
    var silencieux = ('' + event.getGunItemStack().getComponentsPatch()).indexOf('silencer') >= 0
    bruitAttirer(tireur.level, tireur.getX(), tireur.getY(), tireur.getZ(), silencieux ? BRUIT_PORTEE_SILENCIEUX : BRUIT_PORTEE_TIR)
  } catch (e) {
    console.error('[Atheria bruit] ' + e)
  }
})

NativeEvents.onEvent('net.neoforged.neoforge.event.level.ExplosionEvent$Detonate', event => {
  try {
    var level = event.getLevel()
    if (level.isClientSide()) return
    var centre = event.getExplosion().center()
    bruitAttirer(level, centre.x(), centre.y(), centre.z(), BRUIT_PORTEE_EXPLOSION)
  } catch (e) {
    console.error('[Atheria bruit] ' + e)
  }
})
