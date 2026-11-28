// Atheria - le danger suit le palier du lieu (Mika 28/11, en validant les paliers du butin : « faudra faire en sorte que
// les zones soient vraiment très à risque de s'y balader, par exemple à Mamoudzou on peut faire en sorte qu'il faut
// porter un masque à gaz permanent et que le nombre de mobs hostiles avec les variantes les plus dangereuses est décuplé »).
// Même grille que le butin (atheria_butin_distance.js, atheriaPalierLieu), prise en surface (sans le +1 sous terre) :
//  - palier 5 (zone rouge : Mamoudzou centre et CHM, et les autres lieux les plus durs) : l'air est toxique comme dans la
//    zone contaminée (masque et filtre obligatoires, voir atheria_air.js) et les infectés y sont environ dix fois plus
//    nombreux, avec les formes évoluées et les plus dangereuses ;
//  - palier 4 : environ trois fois plus d'infectés, avec des formes évoluées.
// Les zones sûres ne sont pas touchées. Un message à l'entrée prévient le joueur, une seule fois par passage.
var ZONES_ROUGES = {
  rayon: 48, distMin: 22, distMax: 40,
  // [palier, toutes les n ticks, plafond d'infectés autour du joueur, par apparition (min, max), liste pondérée]
  paliers: {
    5: { periode: 100, max: 30, groupe: [2, 3], liste: [
      ['spore:inf_human', 14], ['spore:inf_husk', 6], ['spore:inf_villager', 4], ['spore:inf_hazmat', 6], ['spore:inf_player', 4],
      ['spore:knight', 8], ['spore:griefer', 6], ['spore:leaper', 8], ['spore:slasher', 8], ['spore:spitter', 6], ['spore:howler', 5],
      ['spore:stalker', 5], ['spore:brute', 5], ['spore:volatile', 4], ['spore:bloater', 3],
      ['spore:wendigo', 2], ['spore:inquisitor', 2], ['spore:brot', 2], ['spore:ogre', 2]] },
    4: { periode: 200, max: 14, groupe: [1, 2], liste: [
      ['spore:inf_human', 20], ['spore:inf_husk', 8], ['spore:inf_villager', 6], ['spore:inf_wanderer', 6], ['spore:inf_hazmat', 3],
      ['spore:knight', 5], ['spore:griefer', 4], ['spore:leaper', 4], ['spore:slasher', 4], ['spore:spitter', 3], ['spore:howler', 2]] }
  },
  textes: {
    5: 'Zone rouge : l\'air y est toxique et les infectés grouillent. Masque et filtres obligatoires.',
    4: 'Zone dangereuse : les infectés y sont bien plus nombreux, et plus forts.'
  }
}
var ZONES_ROUGES_TICK = { n: 0 }

// palier du lieu en surface, 1 à 5 (null si la grille n'est pas là)
function atheriaPalierSurface(x, z) {
  if (typeof atheriaPalierLieu !== 'function') return null
  return atheriaPalierLieu(Math.floor(x), 200, Math.floor(z))
}

// pour atheria_air.js : l'air est toxique en zone rouge, hors des zones sûres
function atheriaZoneRougeAir(joueur) {
  if (String(joueur.level.dimension) != 'minecraft:overworld') return false
  if (typeof atheriaZoneSure === 'function' && atheriaZoneSure(joueur.level, joueur.x, joueur.z) != null) return false
  return atheriaPalierSurface(joueur.x, joueur.z) == 5
}

function zonesRougesTirer(liste) {
  var total = 0
  liste.forEach(l => { total += l[1] })
  var r = Math.random() * total
  for (var i = 0; i < liste.length; i++) { r -= liste[i][1]; if (r < 0) return liste[i][0] }
  return liste[0][0]
}

function zonesRougesPeupler(joueur, cfg) {
  var level = joueur.level, R = ZONES_ROUGES.rayon
  var AABB = Java.loadClass('net.minecraft.world.phys.AABB'), Mob = Java.loadClass('net.minecraft.world.entity.Mob')
  var mobs = level['getEntitiesOfClass(java.lang.Class,net.minecraft.world.phys.AABB)'](Mob, new AABB(joueur.x - R, joueur.y - 24, joueur.z - R, joueur.x + R, joueur.y + 24, joueur.z + R))
  var n = 0
  for (var i = 0; i < mobs.size(); i++) if (String(mobs.get(i).type).indexOf('spore:') == 0) n++
  if (n >= cfg.max) return 0
  var faits = 0, voulu = cfg.groupe[0] + Math.floor(Math.random() * (cfg.groupe[1] - cfg.groupe[0] + 1))
  for (var essai = 0; essai < voulu * 3 && faits < voulu && n + faits < cfg.max; essai++) {
    var a = Math.random() * 2 * Math.PI, d = ZONES_ROUGES.distMin + Math.random() * (ZONES_ROUGES.distMax - ZONES_ROUGES.distMin)
    var x = Math.floor(joueur.x + Math.cos(a) * d), z = Math.floor(joueur.z + Math.sin(a) * d)
    if (!level.hasChunk(x >> 4, z >> 4)) continue
    if (typeof atheriaZoneSure === 'function' && atheriaZoneSure(level, x, z) != null) continue
    var y = atheriaHauteur(level, x, z)
    if (Math.abs(y - joueur.y) > 16) continue
    var sol = level.getBlockState(ATHERIA_BP.containing(x, y - 1, z))
    if (!sol.isSolid() || !sol.getFluidState().isEmpty()) continue
    var m = level.createEntity(zonesRougesTirer(cfg.liste))
    if (!m) continue
    m.setPosition(x + 0.5, y, z + 0.5)
    m.addTag('atheria_zone_rouge')
    m.spawn()
    faits++
  }
  return faits
}

ServerEvents.tick(event => {
  var t = ++ZONES_ROUGES_TICK.n
  if (t % 100 != 37) return
  var server = event.server, level = server.overworld()
  var peupler = String(level.getDifficulty()).toLowerCase() != 'peaceful' && level.getGameRules().getBoolean(Java.loadClass('net.minecraft.world.level.GameRules').RULE_DOMOBSPAWNING)
  server.players.forEach(joueur => {
    if (!joueur.isAlive() || joueur.isSpectator() || String(joueur.level.dimension) != 'minecraft:overworld') return
    var pd = joueur.persistentData
    var sure = typeof atheriaZoneSure === 'function' && atheriaZoneSure(joueur.level, joueur.x, joueur.z) != null
    var palier = sure ? 1 : (atheriaPalierSurface(joueur.x, joueur.z) || 1)
    // message d'entrée, une fois par passage (et en montant de 4 à 5)
    var avant = pd.getInt('atheria_zone_palier')
    if (palier != avant) {
      pd.putInt('atheria_zone_palier', palier)
      if (palier >= 4 && palier > avant && ZONES_ROUGES.textes[palier]) atheriaHudAction(joueur, palier == 5 ? 'tacz_tactical_breaching:gas_mask' : 'minecraft:zombie_head', ZONES_ROUGES.textes[palier], palier == 5 ? 'rouge' : 'ambre')
    }
    var cfg = ZONES_ROUGES.paliers[palier]
    if (!cfg || !peupler || joueur.isCreative() || t % cfg.periode != 37) return
    zonesRougesPeupler(joueur, cfg)
  })
})
