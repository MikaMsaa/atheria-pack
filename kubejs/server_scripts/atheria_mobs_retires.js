// Atheria (Mika 22/11) : les mobs vanilla fantastiques n'existent pas sur l'île.
// L'apparition naturelle est coupée par data/atheria/neoforge/biome_modifier/sans_mobs_fantastiques.json.
// Ici on refuse tout le reste : cages de donjons, structures (manoirs, monuments, huttes, chambres d'épreuves),
// raids, œufs et commandes, et ceux déjà enregistrés sur la carte (ils disparaissent au chargement, la carte gelée n'est pas modifiée).
// Araignées, pillards, vindicateurs, zombies, husks, noyés et villageois zombies restent : ils ne sont pas fantastiques.
// Leurs objets s'obtiennent autrement : drops des infectés (config/spore-common.toml) et recettes de atheria_recettes.js.
var MOBS_RETIRES = {
  'minecraft:creeper': 1, 'minecraft:enderman': 1, 'minecraft:endermite': 1,
  'minecraft:skeleton': 1, 'minecraft:stray': 1, 'minecraft:bogged': 1, 'minecraft:skeleton_horse': 1,
  'minecraft:witch': 1, 'minecraft:slime': 1, 'minecraft:phantom': 1,
  'minecraft:evoker': 1, 'minecraft:vex': 1, 'minecraft:illusioner': 1, 'minecraft:ravager': 1,
  'minecraft:guardian': 1, 'minecraft:elder_guardian': 1, 'minecraft:warden': 1,
  'minecraft:silverfish': 1, 'minecraft:breeze': 1
}

NativeEvents.onEvent('net.neoforged.neoforge.event.entity.EntityJoinLevelEvent', event => {
  var level = event.getLevel()
  if (level.isClientSide()) return
  // getEncodeId() = l'identifiant enregistré (« minecraft:creeper ») ; null pour les joueurs
  var id = event.getEntity().getEncodeId()
  if (id == null) return
  id = '' + id
  if (MOBS_RETIRES[id]) event.setCanceled(true)
})
