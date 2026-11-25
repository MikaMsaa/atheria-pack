// Atheria - zone sûre du spawn (Mika 24/11 : « le spawn n'est pas du tout protégé, les mobs hostiles y spawnent,
// on peut prendre des dégâts »). Hameau d'arrivée autour du point d'apparition 2407 66 -2759, toute hauteur, surface seulement.
// Dans la zone : 1) aucun monstre n'apparaît (naturel, hordes, infectés Spore, cages, œufs, commandes) ;
// 2) un monstre qui y entre est retiré sans butin ; 3) les joueurs n'y prennent aucun dégât (chute, mobs, PvP, gaz,
// éboulements, First Aid compris). /kill et le vide restent actifs (outils d'admin).
// Retours des testeurs du 25/11 (Mika : « les zones safes doivent être vraiment safe », Longoni « aucun mob ne doit y
// spawn, même les mobs passifs ») : même règle dans l'enceinte de Longoni, sans aucune créature (animaux compris), et
// aucun dégât venu d'un monstre. Les habitants, PNJ, villageois, véhicules et objets ne sont jamais touchés.
var SPAWN_SUR = { x1: 2384, x2: 2444, z1: -2786, z2: -2726, compteur: 0 }
var ZONES_SURES = [
  // hameau d'arrivée : joueurs invulnérables, aucune créature
  { nom: 'hameau', rects: [[2384, -2786, 2444, -2726]], invulnerable: true },
  // Longoni, dans les murs (mêmes rectangles que ses habitants, atheria_habitants_longoni.js)
  { nom: 'longoni', rects: [[2316, -3145, 2630, -2936], [2316, -2936, 2440, -2912]], invulnerable: false }
]

function atheriaZoneSure(level, x, z) {
  if (('' + level.dimension) !== 'minecraft:overworld') return null
  for (var i = 0; i < ZONES_SURES.length; i++) {
    var zs = ZONES_SURES[i]
    for (var j = 0; j < zs.rects.length; j++) {
      var r = zs.rects[j]
      if (x >= r[0] && x < r[2] + 1 && z >= r[1] && z < r[3] + 1) return zs
    }
  }
  return null
}

function atheriaDansSpawnSur(level, x, z) {
  var zs = atheriaZoneSure(level, x, z)
  return zs != null && zs.invulnerable
}

// Créature retirée des zones sûres : tout être vivant non joueur (monstres, animaux, poissons, chauves-souris…),
// sauf les PNJ (Easy NPC, villageois, gardes) et les entités marquées par Atheria
var ZONES_SURES_GARDES = /^(easy_npc|guardvillagers):|^minecraft:(villager|wandering_trader|armor_stand)$/
function atheriaCreatureInterdite(e) {
  try {
    if (e == null || e.isPlayer() || !e.isLiving()) return false
    if (ZONES_SURES_GARDES.test('' + e.type)) return false
    if (e.tags.contains('ahab') || e.tags.contains('atheria_pnj')) return false
    return true
  } catch (err) {
    return false
  }
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
  if (atheriaZoneSure(level, e.x, e.z) == null) return
  if (atheriaCreatureInterdite(e)) event.setCanceled(true)
})

// aucun dégât venu d'un monstre (flèche tirée de dehors comprise) pour un joueur dans une zone sûre
NativeEvents.onEvent('net.neoforged.neoforge.event.entity.living.LivingIncomingDamageEvent', event => {
  var v = event.getEntity()
  if (!v.isPlayer() || v.level.isClientSide() || atheriaZoneSure(v.level, v.x, v.z) == null) return
  var src = event.getSource(), a = src.actual
  if (a != null && atheriaEstMonstre(a)) event.setCanceled(true)
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
  var level = server.overworld()
  ZONES_SURES.forEach(zs => zs.rects.forEach(r => {
    proche = false
    server.players.forEach(p => {
      if (('' + p.level.dimension) === 'minecraft:overworld' && p.x > r[0] - 96 && p.x < r[2] + 96 && p.z > r[1] - 96 && p.z < r[3] + 96) proche = true
    })
    if (!proche) return
    try {
      level.getEntities(null, new AtheriaAABB(r[0], level.getMinBuildHeight(), r[1], r[2] + 1, level.getMaxBuildHeight(), r[3] + 1)).forEach(e => {
        if (atheriaCreatureInterdite(e) && e.isAlive()) e.discard()
      })
    } catch (err) {
      console.error('[Atheria zones sûres] ' + zs.nom + ' : ' + err)
    }
  }))
})
