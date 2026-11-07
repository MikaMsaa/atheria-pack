// Atheria : l'air de la zone contaminée. Sans masque et filtre, il empoisonne. Les infectés y sont aussi plus nombreux.
var AIR = {
  biome: 'atheria:zone_contaminee',
  periode: 40,
  graceSec: 8,
  filtreSec: 240,         // un filtre sur un vrai masque
  filtreArtisanalSec: 90, // sur le masque artisanal
  infectesPeriode: 400,
  infectesMax: 10,
  infectesRayon: 48
}
var AIR_INFECTES = ['spore:inf_human', 'spore:inf_human', 'spore:inf_human', 'spore:inf_wanderer', 'spore:inf_wanderer', 'spore:inf_villager', 'spore:inf_husk', 'spore:knight']
var AIR_MASQUE = /mask|masque|respirator/
var airTick = { n: 0 }

function airBiome(joueur) {
  var BP = Java.loadClass('net.minecraft.core.BlockPos')
  var cle = joueur.level.getBiome(new BP(Math.floor(joueur.x), Math.floor(joueur.y), Math.floor(joueur.z))).unwrapKey()
  return cle.isPresent() && ('' + cle.get().location()) == AIR.biome
}

function airRespirer(joueur) {
  var data = joueur.persistentData
  var surTete = AIR_MASQUE.test('' + joueur.getHeadArmorItem().getId())
  var artisanal = !surTete && joueur.inventory.count('atheria:masque_artisanal') > 0
  if (surTete || artisanal) {
    var reste = data.getInt('atheria_filtre_reste')
    if (reste <= 0 && joueur.inventory.count('atheria:filtre') > 0) {
      joueur.server.runCommandSilent('clear ' + joueur.username + ' atheria:filtre 1')
      reste = (artisanal ? AIR.filtreArtisanalSec : AIR.filtreSec) * (joueur.tags.contains('skill_medecine_1') ? 1.5 : 1)
      joueur.setStatusMessage(Text.gray('Tu visses un filtre neuf sur ton masque.'))
    }
    if (reste > 0) {
      data.putInt('atheria_filtre_reste', reste - AIR.periode / 20)
      data.putInt('atheria_air_expo', 0)
      if (reste - AIR.periode / 20 <= 0) joueur.setStatusMessage(Text.gold('Ton filtre est saturé.'))
      return
    }
  }
  var expo = data.getInt('atheria_air_expo') + AIR.periode / 20
  data.putInt('atheria_air_expo', expo)
  if (expo < AIR.graceSec * (joueur.tags.contains('skill_medecine_2') ? 3 : 1)) {
    joueur.setStatusMessage(Text.gold(surTete || artisanal ? 'Ton masque n\'a plus de filtre. L\'air pique déjà.' : 'L\'air te brûle la gorge. Il te faut un masque et un filtre.'))
    return
  }
  joueur.potionEffects.add('minecraft:poison', 80, 0, false, false)
}

function airInfectes(joueur) {
  var level = joueur.level
  var AABB = Java.loadClass('net.minecraft.world.phys.AABB')
  var Mob = Java.loadClass('net.minecraft.world.entity.Mob')
  var r = AIR.infectesRayon
  var mobs = level['getEntitiesOfClass(java.lang.Class,net.minecraft.world.phys.AABB)'](Mob, new AABB(joueur.x - r, joueur.y - 24, joueur.z - r, joueur.x + r, joueur.y + 24, joueur.z + r))
  var n = 0
  for (var i = 0; i < mobs.size(); i++) if (('' + mobs.get(i).type).indexOf('spore:') == 0) n++
  if (n >= AIR.infectesMax) return
  var angle = Math.random() * 2 * Math.PI, d = 24 + Math.random() * 14
  var x = Math.floor(joueur.x + Math.cos(angle) * d), z = Math.floor(joueur.z + Math.sin(angle) * d)
  if (!level.hasChunk(x >> 4, z >> 4)) return
  var HM = Java.loadClass('net.minecraft.world.level.levelgen.Heightmap$Types')
  var y = level.getHeight(HM.MOTION_BLOCKING_NO_LEAVES, x, z)
  if (Math.abs(y - joueur.y) > 20) return
  var mob = level.createEntity(AIR_INFECTES[Math.floor(Math.random() * AIR_INFECTES.length)])
  if (mob == null) return
  mob.setPosition(x + 0.5, y, z + 0.5)
  mob.spawn()
}

ServerEvents.tick(event => {
  airTick.n++
  if (airTick.n % AIR.periode != 0) return
  var serveur = event.server
  var infectes = airTick.n % AIR.infectesPeriode == 0
  serveur.players.forEach(joueur => {
    if (joueur.isCreative() || joueur.isSpectator() || !joueur.isAlive()) return
    if (joueur.level.dimension != 'minecraft:overworld' || !airBiome(joueur)) return
    airRespirer(joueur)
    if (infectes && ('' + joueur.level.getDifficulty()).toLowerCase() != 'peaceful' && joueur.level.getGameRules().getBoolean(Java.loadClass('net.minecraft.world.level.GameRules').RULE_DOMOBSPAWNING)) airInfectes(joueur)
  })
})
