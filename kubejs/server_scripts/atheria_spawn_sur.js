// Atheria - zone sûre du spawn (Mika 24/11 : « le spawn n'est pas du tout protégé, les mobs hostiles y spawnent,
// on peut prendre des dégâts »). Hameau d'arrivée autour du point d'apparition 2407 66 -2759, toute hauteur, surface seulement.
// Dans la zone : 1) aucun monstre n'apparaît (naturel, hordes, infectés Spore, cages, œufs, commandes) ;
// 2) un monstre qui y entre est retiré sans butin ; 3) les joueurs n'y prennent aucun dégât (chute, mobs, PvP, gaz,
// éboulements, First Aid compris). /kill et le vide restent actifs (outils d'admin).
var SPAWN_SUR = { x1: 2384, x2: 2444, z1: -2786, z2: -2726, compteur: 0 }

function atheriaDansSpawnSur(level, x, z) {
  return x >= SPAWN_SUR.x1 && x < SPAWN_SUR.x2 + 1 && z >= SPAWN_SUR.z1 && z < SPAWN_SUR.z2 + 1 &&
    ('' + level.dimension) === 'minecraft:overworld'
}

// Monstre = catégorie MONSTER (vanilla, Spore, hordes) ; joueurs, PNJ, animaux et véhicules ne sont jamais touchés
function atheriaEstMonstre(e) {
  try {
    if (e == null || e.isPlayer()) return false
    return e.isMonster() // KubeJS : catégorie non amicale = MONSTER
  } catch (err) {
    return false
  }
}

NativeEvents.onEvent('net.neoforged.neoforge.event.entity.EntityJoinLevelEvent', event => {
  var level = event.getLevel()
  if (level.isClientSide()) return
  var e = event.getEntity()
  if (!atheriaDansSpawnSur(level, e.x, e.z)) return
  if (atheriaEstMonstre(e)) event.setCanceled(true)
})

// Joueurs : invulnérables tant qu'ils sont dans la zone (bloque aussi First Aid, qui répartit les dégâts avant les
// événements de dégâts). Le drapeau n'est retiré qu'aux joueurs à qui la zone l'a donné (marque atheria_spawn_sur).
ServerEvents.tick(event => {
  event.server.players.forEach(p => {
    if (p.isSpectator() || p.isCreative()) return
    var dedans = atheriaDansSpawnSur(p.level, p.x, p.z)
    var marque = p.persistentData.getBoolean('atheria_spawn_sur')
    if (dedans) {
      if (!p.isInvulnerable()) p.setInvulnerable(true)
      if (!marque) p.persistentData.putBoolean('atheria_spawn_sur', true)
    } else if (marque) {
      p.persistentData.remove('atheria_spawn_sur')
      if (!ARRIVEE.attente[p.username]) p.setInvulnerable(false)
    }
  })
})

// Chaque seconde, si un joueur est près du hameau : retrait sans butin des monstres entrés dans la zone
var AtheriaAABB = Java.loadClass('net.minecraft.world.phys.AABB')
ServerEvents.tick(event => {
  if (++SPAWN_SUR.compteur < 20) return
  SPAWN_SUR.compteur = 0
  var server = event.server, proche = false
  server.players.forEach(p => {
    if (('' + p.level.dimension) === 'minecraft:overworld' &&
      p.x > SPAWN_SUR.x1 - 96 && p.x < SPAWN_SUR.x2 + 96 && p.z > SPAWN_SUR.z1 - 96 && p.z < SPAWN_SUR.z2 + 96) proche = true
  })
  if (!proche) return
  try {
    var level = server.overworld()
    var boite = new AtheriaAABB(SPAWN_SUR.x1, level.getMinBuildHeight(), SPAWN_SUR.z1, SPAWN_SUR.x2 + 1, level.getMaxBuildHeight(), SPAWN_SUR.z2 + 1)
    level.getEntities(null, boite).forEach(e => {
      if (atheriaEstMonstre(e) && e.isAlive()) e.discard()
    })
  } catch (err) {
    console.error('[Atheria spawn sûr] ' + err)
  }
})
