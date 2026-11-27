// Atheria - coffre-fort personnel (Mika 27/11, lot gameplay 1 : « un moyen de sécuriser ses coffres, pour que les premiers
// du classement n'aient pas peur d'être pillés »). C'est le coffre de l'Ender de Minecraft, renommé : 27 places à toi
// seul, que personne d'autre ne peut ouvrir ni vider, même en te tuant.
//  - un seul coffre-fort posé par joueur : pour le déplacer, on casse l'ancien (son contenu ne se perd pas) ;
//  - seul son propriétaire peut l'ouvrir ou le casser (les admins aussi) ;
//  - pas de recette : Eniy le vend (rayon Outils) ; cassé, il se ramasse toujours (kubejs/data/minecraft/loot_table/blocks/ender_chest.json).
// Les coffres de l'Ender posés par l'équipe (sans propriétaire) s'ouvrent normalement. Les explosions ne l'entament pas
// (résistance 3 000 du coffre de l'Ender).
var COFFRE_FORT = 'minecraft:ender_chest'

function atheriaCoffresLire(server) {
  var brut = String(server.persistentData.getString('atheria_coffres_forts') || '')
  try { return brut ? JSON.parse(brut) : {} } catch (e) { return {} }
}

function atheriaCoffresEcrire(server, c) {
  server.persistentData.putString('atheria_coffres_forts', JSON.stringify(c))
}

function atheriaCoffreCle(b) {
  return String(b.level.dimension) + '|' + b.x + ',' + b.y + ',' + b.z
}

function atheriaCoffreAdmin(p) {
  return p.hasPermissions(2) && p.isCreative()
}

ServerEvents.recipes(event => {
  event.remove({ output: COFFRE_FORT })
})

BlockEvents.placed(COFFRE_FORT, event => {
  var p = event.player
  if (!p || !p.isPlayer()) { event.cancel(); return }
  if (atheriaCoffreAdmin(p)) return
  var server = event.server, c = atheriaCoffresLire(server), moi = String(p.uuid)
  var deja = Object.keys(c).filter(k => c[k] == moi)
  if (deja.length) {
    atheriaHudAction(p, COFFRE_FORT, 'Tu as déjà un coffre-fort posé. Casse l\'ancien pour le déplacer : rien ne se perd.', 'rouge')
    event.cancel()
    return
  }
  c[atheriaCoffreCle(event.block)] = moi
  atheriaCoffresEcrire(server, c)
  atheriaHudAction(p, COFFRE_FORT, 'Coffre-fort posé : toi seul peux l\'ouvrir.', 'vert')
})

BlockEvents.rightClicked(COFFRE_FORT, event => {
  var p = event.player, c = atheriaCoffresLire(event.server), proprio = c[atheriaCoffreCle(event.block)]
  if (!proprio || proprio == String(p.uuid) || atheriaCoffreAdmin(p)) return
  atheriaHudAction(p, COFFRE_FORT, 'Ce coffre-fort ne s\'ouvre qu\'avec la combinaison de son propriétaire.', 'rouge')
  event.cancel()
})

BlockEvents.broken(COFFRE_FORT, event => {
  var p = event.player, server = event.server, c = atheriaCoffresLire(server), cle = atheriaCoffreCle(event.block), proprio = c[cle]
  if (!proprio) return
  if (proprio != String(p.uuid) && !atheriaCoffreAdmin(p)) {
    atheriaHudAction(p, COFFRE_FORT, 'Impossible de forcer ce coffre-fort.', 'rouge')
    event.cancel()
    return
  }
  delete c[cle]
  atheriaCoffresEcrire(server, c)
})
