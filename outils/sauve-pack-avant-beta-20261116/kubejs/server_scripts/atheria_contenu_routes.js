// Atheria : la route. Bruit du moteur, carburant (bidons, siphonnage), pièces détachées, cartes et radio qui révèlent
// une ville, et la très rare meute de dinosaures qui barre la route.
var ROUTE = {
  rayonVehicule: 6,
  bidonMb: 3000,            // ce qu'un bidon verse dans le réservoir
  siphonMb: 3000,           // ce qu'il faut dans un réservoir pour remplir un bidon
  siphonChance: 0.7,        // un réservoir d'épave n'a pas toujours gardé son contenu
  siphonBruit: 18,
  reparation: 50,
  moteurPeriode: 60,        // ticks entre deux appels du bruit de moteur
  moteurPortee: 40,
  scanBudgetMs: 6,          // recherche de ville étalée sur plusieurs ticks : le serveur ne saute pas
  scanRayonMax: 500,        // en chunks : 8 km
  radioDelai: 24000,        // la radio ne répond qu'une fois par jour de jeu
  meutePeriode: 1200,       // tirage une fois par minute, seulement pour un joueur sur une route
  meuteChance: 0.006,
  meuteDelai: 72000,        // au moins trois jours de jeu entre deux meutes
  meuteDistance: 56,
  meuteVie: 12000
}
var ROUTE_MEUTES = [
  ['triceratops', 3, 5], ['stegosaurus', 3, 4], ['parasaurolophus', 4, 6], ['edmontosaurus', 4, 6],
  ['ankylosaurus', 2, 4], ['styracosaurus', 3, 5], ['sinoceratops', 3, 4], ['diplodocus', 2, 3], ['brachiosaurus', 2, 3]
]
var routeEtat = { tick: 0, meutes: [] }

function routeVehiculeProche(joueur, rayon) {
  var WW = Java.loadClass('mcinterface1211.WrapperWorld')
  var Phys = Java.loadClass('minecrafttransportsimulator.entities.instances.EntityVehicleF_Physics')
  var liste = WW.getWrapperFor(joueur.level).getEntitiesExtendingType(Phys)
  var meilleur = null, dMin = rayon * rayon
  for (var i = 0; i < liste.size(); i++) {
    var v = liste.get(i)
    var dx = v.position.x - joueur.x, dy = v.position.y - joueur.y, dz = v.position.z - joueur.z
    var d = dx * dx + dy * dy + dz * dz
    if (d < dMin) { dMin = d; meilleur = v }
  }
  return meilleur
}

function routeXp(joueur, n) {
  joueur.server.runCommandSilent('puffish_skills experience add ' + joueur.username + ' puffish_skills:survivant ' + n)
}

// event.cancel() arrete le gestionnaire sur place : il vient toujours en dernier
function routeTraiter(event, fn) {
  try { fn() } catch (e) { console.error('[Atheria route] ' + e) }
  event.cancel()
}

function routeSon(joueur, son, hauteur) {
  joueur.server.runCommandSilent('execute in ' + joueur.level.dimension + ' run playsound ' + son + ' player @a ' + joueur.x + ' ' + joueur.y + ' ' + joueur.z + ' 1 ' + (hauteur || 1))
}

function routeFluide(v) {
  if (v.engines.size() == 0) return null
  var type = '' + v.engines.get(0).definition.engine.fuelType
  if (type == 'diesel') return 'diesel'
  if (type == 'gasoline' || type == 'avgas') return 'gasoline'
  return null
}

// ---------- bidon d'essence : remplit le réservoir ----------
ItemEvents.rightClicked('atheria:bidon_essence', event => {
  routeTraiter(event, () => {
  var joueur = event.player
  var v = routeVehiculeProche(joueur, ROUTE.rayonVehicule)
  if (v == null) { joueur.setStatusMessage(Text.gray('Approche-toi d\'un véhicule pour vider le bidon.')); return }
  var fluide = routeFluide(v)
  if (fluide == null) { joueur.setStatusMessage(Text.gray('Ce véhicule n\'a pas de moteur à carburant.')); return }
  var reservoir = v.fuelTank
  var present = '' + reservoir.getFluid()
  if (reservoir.getFluidLevel() > 1 && present != fluide) {
    joueur.setStatusMessage(Text.gold('Le réservoir contient autre chose (' + present + ') : impossible de mélanger.'))
    return
  }
  var Tank = Java.loadClass('minecrafttransportsimulator.entities.instances.EntityFluidTank')
  if (reservoir.getMaxLevel() - reservoir.getFluidLevel() < 100) { joueur.setStatusMessage(Text.gray('Le réservoir est plein.')); return }
  var verse = reservoir.fill(fluide, Tank.WILDCARD_FLUID_MOD, ROUTE.bidonMb, true)
  if (verse <= 0) { joueur.setStatusMessage(Text.gold('Le carburant refuse de passer.')); return }
  event.item.shrink(1)
  routeSon(joueur, 'minecraft:item.bucket.empty', 0.8)
  joueur.setStatusMessage(Text.green('Réservoir : ' + Math.round(reservoir.getFluidLevel()) + ' / ' + reservoir.getMaxLevel() + ' mB'))
  })
})

// ---------- kit de siphonnage : sur le réservoir d'une épave, ou sur un véhicule ----------
function routeUserKit(joueur, kit) {
  kit.setDamageValue(kit.getDamageValue() + 1)
  if (kit.getDamageValue() >= kit.getMaxDamage()) { kit.shrink(1); routeSon(joueur, 'minecraft:entity.item.break', 1) }
}

BlockEvents.rightClicked('atheria:reservoir_epave', event => {
  var joueur = event.player
  var main = event.item
  if ('' + main.id != 'atheria:kit_siphon') {
    if (event.hand == 'MAIN_HAND' || '' + event.hand == 'MAIN_HAND') joueur.setStatusMessage(Text.gray('Il reste peut-être de l\'essence. Il faudrait un kit de siphonnage.'))
    return
  }

  var b = event.block
  routeUserKit(joueur, main)
  b.set('atheria:carrosserie')
  bruitAttirer(joueur.level, b.x, b.y, b.z, ROUTE.siphonBruit)
  routeSon(joueur, 'minecraft:item.bucket.fill', 0.7)
  routeXp(joueur, 8)
  if (Math.random() < (joueur.tags.contains('skill_bricolage_2') ? 0.95 : ROUTE.siphonChance)) {
    joueur.give('atheria:bidon_essence')
    joueur.setStatusMessage(Text.green('Tu récupères un bidon d\'essence.'))
  } else {
    joueur.setStatusMessage(Text.gray('Réservoir sec. Quelqu\'un est passé avant toi.'))
  }
  event.cancel()
})

ItemEvents.rightClicked('atheria:kit_siphon', event => {
  routeTraiter(event, () => {
  var joueur = event.player
  var v = routeVehiculeProche(joueur, ROUTE.rayonVehicule)
  if (v == null) { joueur.setStatusMessage(Text.gray('Clic droit sur le réservoir d\'une épave, ou près d\'un véhicule.')); return }
  if (v.fuelTank.getFluidLevel() < 1000) { joueur.setStatusMessage(Text.gray('Pas assez de carburant à prendre dans ce véhicule.')); return }
  if (('' + v.fuelTank.getFluid()) == 'lava') { joueur.setStatusMessage(Text.gold('Ce réservoir contient de la lave : le tuyau n\'y survivrait pas.')); return }
  v.fuelTank.drain(ROUTE.siphonMb, true)
  routeUserKit(joueur, event.item)
  joueur.give('atheria:bidon_essence')
  routeSon(joueur, 'minecraft:item.bucket.fill', 0.7)
  joueur.setStatusMessage(Text.green('Tu remplis un bidon d\'essence.'))
  })
})

// ---------- pièces détachées : réparer sur place ----------
ItemEvents.rightClicked('atheria:pieces_vehicule', event => {
  routeTraiter(event, () => {
  var joueur = event.player
  var v = routeVehiculeProche(joueur, ROUTE.rayonVehicule)
  if (v == null) { joueur.setStatusMessage(Text.gray('Approche-toi d\'un véhicule à réparer.')); return }
  var repare = 0
  var soigner = e => {
    var d = e.damageVar.currentValue
    if (d <= 0) return
    var n = Math.max(0, d - ROUTE.reparation * (joueur.tags.contains('skill_bricolage_1') ? 2 : 1))
    e.damageVar.setTo(n, true)
    e.outOfHealth = false
    repare += d - n
  }
  soigner(v)
  for (var i = 0; i < v.allParts.size(); i++) soigner(v.allParts.get(i))
  if (repare <= 0) { joueur.setStatusMessage(Text.gray('Ce véhicule n\'a rien à réparer.')); return }
  event.item.shrink(1)
  routeSon(joueur, 'minecraft:block.anvil.use', 1.3)
  routeXp(joueur, 10)
  joueur.setStatusMessage(Text.green('Réparations faites : ' + Math.round(repare) + ' points de dégâts en moins.'))
  })
})

// ---------- carte routière et radio : révéler une ville ----------
function routeDirection(dx, dz) {
  var noms = ['l\'est', 'le sud-est', 'le sud', 'le sud-ouest', 'l\'ouest', 'le nord-ouest', 'le nord', 'le nord-est']
  var a = Math.atan2(dz, dx)
  return noms[(Math.round(a / (Math.PI / 4)) + 8) % 8]
}

// Parcourt des anneaux de chunks autour du joueur, un peu à chaque tick. Ignore les villes déjà révélées à ce joueur.
function routeChercherVille(joueur, fin) {
  var Reg = Java.loadClass('mcjty.lostcities.setup.Registration')
  var City = Java.loadClass('mcjty.lostcities.worldgen.lost.City')
  var Coord = Java.loadClass('mcjty.lostcities.varia.ChunkCoord')
  var BI = Java.loadClass('mcjty.lostcities.worldgen.lost.BuildingInfo')
  var level = joueur.level
  var info = Reg.LOSTCITY_FEATURE.get().getDimensionInfo(level)
  if (info == null) { fin(null); return }
  var connues = ('' + joueur.persistentData.getString('atheria_villes_vues')).split(';')
  var cx = Math.floor(joueur.x) >> 4, cz = Math.floor(joueur.z) >> 4
  var dim = level.dimension
  var etat = { r: 1, i: 0 }
  var pas = () => {
    var debut = Date.now()
    while (Date.now() - debut < ROUTE.scanBudgetMs) {
      if (etat.r > ROUTE.scanRayonMax) { fin(null); return }
      var r = etat.r, cote = 2 * r
      var total = 4 * cote
      for (var n = 0; n < 400 && etat.i < total; n++, etat.i++) {
        var k = etat.i, f = Math.floor(k / cote), o = k % cote, x, z
        if (f == 0) { x = cx - r + o; z = cz - r }
        else if (f == 1) { x = cx + r; z = cz - r + o }
        else if (f == 2) { x = cx + r - o; z = cz + r }
        else { x = cx - r; z = cz + r - o }
        var c = new Coord(dim, x, z)
        if (City.isCityCenter(c, info) && BI.isCity(c, info) && connues.indexOf(x + ',' + z) < 0) {
          fin({ x: x, z: z, rayon: City.getCityRadius(c, info), cle: x + ',' + z })
          return
        }
      }
      if (etat.i >= total) { etat.r++; etat.i = 0 }
    }
    joueur.server.scheduleInTicks(1, pas)
  }
  pas()
}

function routeNomTaille(rayon) {
  if (rayon >= 120) return 'une grande ville'
  if (rayon >= 70) return 'une ville'
  return 'un bourg'
}

function routeAnnoncer(joueur, ville, prefixe) {
  var x = (ville.x << 4) + 8, z = (ville.z << 4) + 8
  var dx = x - joueur.x, dz = z - joueur.z
  var d = Math.round(Math.sqrt(dx * dx + dz * dz) / 50) * 50
  joueur.tell(prefixe.append(Text.white(routeNomTaille(ville.rayon) + ' vers ' + routeDirection(dx, dz) + ', à environ ' + d + ' blocs.')))
  var vues = '' + joueur.persistentData.getString('atheria_villes_vues')
  joueur.persistentData.putString('atheria_villes_vues', vues + ville.cle + ';')
}

ItemEvents.rightClicked('atheria:carte_routiere', event => {
  routeTraiter(event, () => {
  var joueur = event.player
  var item = event.item
  if (joueur.level.dimension != 'minecraft:overworld') { joueur.setStatusMessage(Text.gray('Cette carte ne montre rien d\'ici.')); return }
  if (joueur.persistentData.getBoolean('atheria_carte_lecture')) return
  joueur.persistentData.putBoolean('atheria_carte_lecture', true)
  joueur.setStatusMessage(Text.gray('Tu déplies la carte...'))
  routeChercherVille(joueur, ville => {
    joueur.persistentData.putBoolean('atheria_carte_lecture', false)
    if (ville == null) { joueur.setStatusMessage(Text.gray('Rien que tu ne connaisses déjà sur cette carte.')); return }
    item.shrink(1)
    routeAnnoncer(joueur, ville, Text.gold('[Carte] '))
  })
  })
})

// Appelée par atheria_campagne.js : accroupi, la radio écoute les balises au lieu de la voix
function routeRadioVille(joueur) {
  if (joueur.level.dimension != 'minecraft:overworld') { joueur.setStatusMessage(Text.gray('Aucun signal ici.')); return }
  var maintenant = joueur.level.getLevelData().getGameTime()
  var derniere = joueur.persistentData.getLong('atheria_radio_ville')
  if (derniere > 0 && maintenant - derniere < ROUTE.radioDelai) {
    joueur.setStatusMessage(Text.gray('Rien de nouveau sur les ondes. Réessaie demain.'))
    return
  }
  joueur.persistentData.putLong('atheria_radio_ville', maintenant)
  joueur.setStatusMessage(Text.gray('Tu balayes les fréquences...'))
  routeChercherVille(joueur, ville => {
    if (ville == null) { joueur.setStatusMessage(Text.gray('Du bruit blanc. Aucune balise à portée.')); return }
    joueur.addTag('radio_ville')
    routeSon(joueur, 'minecraft:block.note_block.bit', 0.6)
    routeAnnoncer(joueur, ville, Text.darkAqua('[Balise] '))
  })
}

// ---------- tick : bruit du moteur et meute ----------
function routeSurRoute(joueur) {
  var Reg = Java.loadClass('mcjty.lostcities.setup.Registration')
  var Highway = Java.loadClass('mcjty.lostcities.worldgen.lost.Highway')
  var Coord = Java.loadClass('mcjty.lostcities.varia.ChunkCoord')
  var BI = Java.loadClass('mcjty.lostcities.worldgen.lost.BuildingInfo')
  var level = joueur.level
  var info = Reg.LOSTCITY_FEATURE.get().getDimensionInfo(level)
  if (info == null) return false
  var c = new Coord(level.dimension, Math.floor(joueur.x) >> 4, Math.floor(joueur.z) >> 4)
  return Highway.getHighwayInfo(c, info, info.getProfile()).hasHighway() && !BI.isCity(c, info)
}

function routeLancerMeute(joueur) {
  var server = joueur.server, level = joueur.level
  var regard = joueur.getLookAngle()
  var norme = Math.max(0.01, Math.sqrt(regard.x() * regard.x() + regard.z() * regard.z()))
  var cx = joueur.x + regard.x() / norme * ROUTE.meuteDistance
  var cz = joueur.z + regard.z() / norme * ROUTE.meuteDistance
  var choix = ROUTE_MEUTES[Math.floor(Math.random() * ROUTE_MEUTES.length)]
  var nombre = choix[1] + Math.floor(Math.random() * (choix[2] - choix[1] + 1))
  var HM = Java.loadClass('net.minecraft.world.level.levelgen.Heightmap$Types')
  var crees = 0
  for (var i = 0; i < nombre; i++) {
    var x = Math.floor(cx + (Math.random() - 0.5) * 16), z = Math.floor(cz + (Math.random() - 0.5) * 16)
    if (!level.hasChunk(x >> 4, z >> 4)) continue
    var y = level.getHeight(HM.MOTION_BLOCKING_NO_LEAVES, x, z)
    var mob = level.createEntity('jurassicreborn:' + choix[0])
    if (mob == null) continue
    mob.setPosition(x + 0.5, y, z + 0.5)
    mob.addTag('atheria_meute')
    mob.spawn()
    routeEtat.meutes.push({ mob: mob, fin: level.getLevelData().getGameTime() + ROUTE.meuteVie })
    crees++
  }
  if (crees == 0) return false
  server.persistentData.putLong('atheria_meute_derniere', level.getLevelData().getGameTime())
  joueur.setStatusMessage(Text.gold('Le sol tremble sur la route, devant toi.'))
  console.info('[Atheria route] meute de ' + crees + ' ' + choix[0] + ' devant ' + joueur.username + ' en ' + Math.floor(cx) + ' ' + Math.floor(cz))
  return true
}

function routeNettoyerMeutes(server) {
  var reste = []
  routeEtat.meutes.forEach(m => {
    var mob = m.mob
    if (!mob.isAlive()) return
    if (mob.level.getLevelData().getGameTime() < m.fin) { reste.push(m); return }
    var proche = false
    server.players.forEach(p => { if (p.level == mob.level && p.distanceToEntity(mob) < 72) proche = true })
    if (proche) { reste.push(m); return }
    mob.discard()
  })
  routeEtat.meutes = reste
}

ServerEvents.tick(event => {
  routeEtat.tick++
  var server = event.server
  if (routeEtat.tick % ROUTE.moteurPeriode == 0) {
    server.players.forEach(joueur => {
      var siege = joueur.getVehicle()
      if (siege == null || ('' + siege.getType()).indexOf('mts') < 0) return
      var v = routeVehiculeProche(joueur, 12)
      if (v != null && v.enginesRunning) bruitAttirer(joueur.level, joueur.x, joueur.y, joueur.z, joueur.tags.contains('skill_bricolage_3') ? ROUTE.moteurPortee * 0.65 : ROUTE.moteurPortee)
    })
  }
  if (routeEtat.tick % ROUTE.meutePeriode == 0) {
    routeNettoyerMeutes(server)
    var derniere = server.persistentData.getLong('atheria_meute_derniere')
    server.players.forEach(joueur => {
      var level = joueur.level
      if (level.dimension != 'minecraft:overworld' || joueur.isCreative() || joueur.isSpectator()) return
      if (derniere > 0 && level.getLevelData().getGameTime() - derniere < ROUTE.meuteDelai) return
      if (Math.random() >= ROUTE.meuteChance) return
      if (routeSurRoute(joueur)) routeLancerMeute(joueur)
    })
  }
})

// ---------- épaves et barrages posés sur les routes des chunks neufs ----------
var ROUTE_EPAVES = { bouchon: 0.05, barrage: 0.01 }
var routeEpavesFile = []

NativeEvents.onEvent('net.neoforged.neoforge.event.level.ChunkEvent$Load', event => {
  if (!event.isNewChunk()) return
  var level = event.getLevel()
  if (level.isClientSide() || !/minecraft:overworld/.test(String(level.dimension))) return
  if (routeEpavesFile.length > 256) return
  var pos = event.getChunk().getPos()
  routeEpavesFile.push([pos.x, pos.z])
})

function routeFill(s, x1, y1, z1, x2, y2, z2, bloc) {
  s.runCommandSilent('execute in minecraft:overworld run fill ' + x1 + ' ' + y1 + ' ' + z1 + ' ' + x2 + ' ' + y2 + ' ' + z2 + ' ' + bloc + ' keep')
}

// axeX : la route suit l'axe X. d est l'avance le long de la route, v le décalage latéral
function routeVoiture(s, axeX, ox, y, oz, d, v) {
  var pt = (a, b) => axeX ? [ox + a, oz + b] : [ox + b, oz + a]
  var a = pt(d, v), b = pt(d + 4, v + 1), c = pt(d + 1, v), e = pt(d + 3, v + 1)
  routeFill(s, a[0], y, a[1], b[0], y, b[1], 'atheria:carrosserie')
  routeFill(s, c[0], y + 1, c[1], e[0], y + 1, e[1], 'minecraft:gray_stained_glass')
  var r = pt(d, v)
  s.runCommandSilent('execute in minecraft:overworld run setblock ' + r[0] + ' ' + y + ' ' + r[1] + ' atheria:reservoir_epave')
}

function routeEpavesChunk(server, level, cx, cz) {
  var tirage = Math.random()
  if (tirage >= ROUTE_EPAVES.bouchon + ROUTE_EPAVES.barrage) return
  var Reg = Java.loadClass('mcjty.lostcities.setup.Registration')
  var Highway = Java.loadClass('mcjty.lostcities.worldgen.lost.Highway')
  var Coord = Java.loadClass('mcjty.lostcities.varia.ChunkCoord')
  var BI = Java.loadClass('mcjty.lostcities.worldgen.lost.BuildingInfo')
  var HM = Java.loadClass('net.minecraft.world.level.levelgen.Heightmap$Types')
  var info = Reg.LOSTCITY_FEATURE.get().getDimensionInfo(level)
  if (info == null) return
  var coord = new Coord(level.dimension, cx, cz)
  var profil = info.getProfile()
  var nx = Highway.getXHighwayLevel(coord, info, profil), nz = Highway.getZHighwayLevel(coord, info, profil)
  if ((nx < 0 && nz < 0) || BI.isCity(coord, info)) return
  var axeX = nx >= 0
  if (nx >= 0 && nz >= 0) return // un croisement reste dégagé
  var ox = cx * 16 + 8, oz = cz * 16 + 8
  var y = level.getHeight(HM.MOTION_BLOCKING_NO_LEAVES, ox, oz)
  if (tirage < ROUTE_EPAVES.bouchon) {
    routeVoiture(server, axeX, ox, y, oz, -7, -3)
    routeVoiture(server, axeX, ox, y, oz, -1, 1)
    if (Math.random() < 0.6) routeVoiture(server, axeX, ox, y, oz, 3, -3)
    return
  }
  // Barrage : sacs de sable en travers de la route, une chicane reste ouverte au centre
  var pt = (d, v) => axeX ? [ox + d, oz + v] : [ox + v, oz + d]
  var a = pt(0, -5), b = pt(0, -2), c = pt(0, 2), e = pt(0, 5)
  routeFill(server, a[0], y, a[1], b[0], y, b[1], 'minecraft:smooth_sandstone')
  routeFill(server, c[0], y, c[1], e[0], y, e[1], 'minecraft:smooth_sandstone')
  routeFill(server, a[0], y + 1, a[1], b[0], y + 1, b[1], 'simply_traps:circular_barbed_wire_iron')
  routeFill(server, c[0], y + 1, c[1], e[0], y + 1, e[1], 'simply_traps:circular_barbed_wire_iron')
  routeVoiture(server, axeX, ox, y, oz, 3, -5)
  var k = pt(2, 4)
  server.runCommandSilent('execute in minecraft:overworld run setblock ' + k[0] + ' ' + y + ' ' + k[1] + ' minecraft:chest{LootTable:"atheria:chests/militaire"} keep')
}

ServerEvents.tick(event => {
  if (routeEpavesFile.length == 0 || routeEtat.tick % 2 != 0) return
  var server = event.server, level = server.overworld()
  var c = routeEpavesFile.shift()
  try {
    if (level.hasChunk(c[0], c[1])) routeEpavesChunk(server, level, c[0], c[1])
  } catch (e) {
    routeEpavesFile = []
    console.error('[Atheria route] ' + e)
  }
})

// ---------- compétence de tir ----------
NativeEvents.onEvent('net.neoforged.neoforge.event.entity.living.LivingIncomingDamageEvent', event => {
  try {
    var source = event.getSource()
    var cause = source.actual
    if (cause == null || !cause.isPlayer()) return
    if (!/tacz|bullet/.test('' + source)) return
    var bonus = 0
    if (cause.tags.contains('skill_tir_1')) bonus += 0.05
    if (cause.tags.contains('skill_tir_2')) bonus += 0.05
    if (cause.tags.contains('skill_tir_3')) bonus += 0.05
    if (bonus > 0) event.setAmount(event.getAmount() * (1 + bonus))
  } catch (e) {
    console.error('[Atheria tir] ' + e)
  }
})

ServerEvents.recipes(event => {
  event.shaped('atheria:kit_siphon', ['IK', 'KB'], { I: 'minecraft:iron_ingot', K: 'minecraft:dried_kelp', B: 'minecraft:bucket' }).id('atheria:kit_siphon')
})

LootJS.modifiers(event => {
  event.addTableModifier(LootType.CHEST).randomChance(0.015).addLoot('atheria:kit_siphon')
  event.addTableModifier(LootType.CHEST).randomChance(0.035).addLoot('atheria:pieces_vehicule')
  event.addTableModifier(LootType.CHEST).randomChance(0.03).addLoot('atheria:carte_routiere')
})