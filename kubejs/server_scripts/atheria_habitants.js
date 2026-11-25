// Atheria - habitants d'ambiance des villes (Mika 25/11 : « peupler les villes, avec des pnj qui ont leurs routines,
// qui circulent » ; une modification de la ville ne doit pas casser leur fonctionnement).
// Chaque ville est décrite dans un fichier atheria_habitants_<ville>.js (atheriaHabitantsVille) :
//  - repères nommés (jamais de coordonnées dans les routines), métiers avec quatre moments (matin, journée, soir, nuit),
//    habitants (prénom, skin unique, métier) ;
//  - les habitants ne sont pas enregistrés dans le monde : ils apparaissent quand un joueur approche et disparaissent
//    30 s après le départ du dernier joueur ; la nuit, les dormeurs rentrent puis disparaissent ;
//  - tempête de cendres : tout le monde à l'abri sauf les sentinelles ; horde : civils aux abris, gardes sur le mur ;
//  - invulnérables dans les murs, tuables dehors (Mika 25/11) ; un habitant tué revient le matin suivant ;
//  - aucun clic droit (Mika 25/11 : pas d'interaction pour l'instant), pas de nom au-dessus de la tête.
// Repères vérifiés à chaque activation de la ville : un repère muré ou dans le vide est déplacé vers la place libre la
// plus proche (6 blocs au plus), sinon mis de côté et signalé (/atheria_habitants verifier <ville>).
var HAB = { villes: {}, etat: {}, horloge: 0, pres: 72, loin: 96 }
var HabBP = Java.loadClass('net.minecraft.core.BlockPos')
var HabAABB = Java.loadClass('net.minecraft.world.phys.AABB')

function atheriaHabitantsVille(nom, d) {
  d.nom = nom
  HAB.villes[nom] = d
  HAB.etat[nom] = { actif: false, vide: 0, ents: {}, ronde: {}, jeu: {}, suivi: {}, morts: {}, verifie: false, ecartes: {} }
}

function atheriaHabMoment(t) {
  t = t % 24000
  if (t >= 23000 || t < 3000) return 'matin'
  if (t < 10000) return 'journee'
  if (t < 13000) return 'soir'
  return 'nuit'
}

function atheriaHabScore(server, nom) {
  var sb = server.scoreboard, o = sb.getObjective('atheria')
  if (!o) return 0
  var SH = Java.loadClass('net.minecraft.world.scores.ScoreHolder')
  return sb.getOrCreatePlayerScore(SH.forNameOnly(nom), o).get()
}

// ce que fait l'habitant maintenant : « sorte:groupe »
function atheriaHabConsigne(v, h, moment, alerte) {
  var m = v.metiers[h[3]]
  if (alerte.horde) return m.garde ? 'ronde:r_mur' : 'abri:abri'
  if (alerte.tempete && !m.tempete) return 'abri:abri'
  return m[moment]
}

function atheriaHabRepere(v, nom) {
  var r = v.reperes[nom]
  if (!r || HAB.etat[v.nom].ecartes[nom]) return null
  return r
}

function atheriaHabGroupe(v, groupe) {
  return Object.keys(v.reperes).filter(k => k.indexOf(groupe + '_') == 0 && !HAB.etat[v.nom].ecartes[k]).sort()
}

function atheriaHabDansMurs(v, x, z) {
  return v.murs.some(m => x >= m[0] && x <= m[2] && z >= m[1] && z <= m[3])
}

function atheriaHabSnbt(v, h) {
  var m = v.metiers[h[3]]
  var obj = m.garde
    ? '{Type:"FLOAT",Prio:0},{Type:"OPEN_DOOR",Prio:1},{Type:"CLOSE_DOOR",Prio:1},{Type:"MELEE_ATTACK",Prio:2,SpeedModifier:1.1d},{Type:"ATTACK_MONSTER",Prio:2},{Type:"LOOK_AT_PLAYER",Prio:7}'
    : '{Type:"FLOAT",Prio:0},{Type:"OPEN_DOOR",Prio:1},{Type:"CLOSE_DOOR",Prio:1},{Type:"FLEE_MONSTER",Prio:1},{Type:"LOOK_AT_PLAYER",Prio:7},{Type:"LOOK_RANDOM_AROUND",Prio:8}'
  var main = m.garde ? '{id:"minecraft:iron_sword",count:1}' : '{}'
  var attr = '{id:"minecraft:generic.follow_range",base:64.0d},{id:"minecraft:generic.movement_speed",base:0.3d}' +
    (m.enfant ? ',{id:"minecraft:generic.scale",base:0.72d}' : '') + (m.garde ? ',{id:"minecraft:generic.attack_damage",base:5.0d}' : '')
  return '{EasyNPCVersion:3,PersistenceRequired:1b,Tags:["ahab","ahab.' + v.nom + '","ahab.' + h[0] + '"],' +
    'EntityAttribute:{IsAttackableByPlayers:1b,IsAttackableByMonsters:1b,IsAttackableByFactions:1b,IsInvulnerable:0b,IsKnockbackResistant:0b,IsExplosionResistant:0b,HealthRegeneration:0.0d},' +
    'VariantType:"STEVE",SkinData:{Type:"RESOURCE_LOCATION",Texture:"atheria:textures/entity/habitants/' + h[2] + '.png"},' +
    'HandItems:[' + main + ',{}],HandDropChances:[0.0f,0.0f],ArmorDropChances:[0.0f,0.0f,0.0f,0.0f],' +
    'attributes:[' + attr + '],ObjectiveData:{ObjectiveDataSet:[' + obj + ']}}'
}

// place libre : sol solide, deux blocs traversables au-dessus
function atheriaHabLibre(level, x, y, z) {
  var sol = level.getBlockState(new HabBP(x, y - 1, z)), a = level.getBlockState(new HabBP(x, y, z)), b = level.getBlockState(new HabBP(x, y + 1, z))
  return sol.isSolid() && !a.isSolid() && !b.isSolid() && a.getFluidState().isEmpty()
}

// contrôle des repères (chunks chargés seulement) : déplacement de 6 blocs au plus, sinon écarté et signalé
function atheriaHabVerifier(v, level, forcer) {
  var e = HAB.etat[v.nom], rapport = []
  Object.keys(v.reperes).forEach(k => {
    var r = v.reperes[k], x = r[0], y = r[1], z = r[2]
    if (!level.isLoaded(new HabBP(x, y, z))) return
    if (atheriaHabLibre(level, x, y, z)) { delete e.ecartes[k]; return }
    for (var d = 1; d <= 6; d++) for (var dy = -2; dy <= 2; dy++) for (var dx = -d; dx <= d; dx++) for (var dz = -d; dz <= d; dz++) {
      if (Math.max(Math.abs(dx), Math.abs(dz)) != d) continue
      if (atheriaHabLibre(level, x + dx, y + dy, z + dz)) {
        rapport.push(k + ' déplacé de ' + x + ' ' + y + ' ' + z + ' vers ' + (x + dx) + ' ' + (y + dy) + ' ' + (z + dz))
        v.reperes[k] = [x + dx, y + dy, z + dz, r[3]]
        delete e.ecartes[k]
        return
      }
    }
    e.ecartes[k] = true
    rapport.push(k + ' ÉCARTÉ (aucune place libre à 6 blocs de ' + x + ' ' + y + ' ' + z + ')')
  })
  rapport.forEach(l => console.warn('[Atheria habitants] ' + v.nom + ' : ' + l))
  return rapport
}

function atheriaHabActif(v, server) {
  var z = v.zone, r = v.rayon, ok = false
  server.players.forEach(p => {
    if (('' + p.level.dimension) !== 'minecraft:overworld' || p.isSpectator()) return
    if (p.x > z[0] - r && p.x < z[2] + r && p.z > z[1] - r && p.z < z[3] + r) ok = true
  })
  return ok
}

function atheriaHabRetirerTous(v, level) {
  var z = v.zone
  level.getEntities(null, new HabAABB(z[0] - 64, level.getMinBuildHeight(), z[1] - 64, z[2] + 64, level.getMaxBuildHeight(), z[3] + 64)).forEach(e => {
    if (e.tags.contains('ahab.' + v.nom)) e.discard()
  })
  HAB.etat[v.nom].ents = {}
}

// recense les habitants présents (tag ahab.<id>), retire les doublons
function atheriaHabRecenser(v, level) {
  var z = v.zone, ents = {}
  level.getEntities(null, new HabAABB(z[0] - 64, level.getMinBuildHeight(), z[1] - 64, z[2] + 64, level.getMaxBuildHeight(), z[3] + 64)).forEach(e => {
    if (!e.tags.contains('ahab.' + v.nom) || !e.isAlive()) return
    var id = null
    e.tags.forEach(t => { t = '' + t; if (t.indexOf('ahab.' + v.nom.charAt(0)) == 0 && t != 'ahab.' + v.nom) id = t.substring(5) })
    if (!id) return
    if (ents[id]) { e.discard(); return }
    ents[id] = e
  })
  HAB.etat[v.nom].ents = ents
  return ents
}

function atheriaHabProche(level, x, y, z, d) {
  var p = level.getNearestPlayer(x, y, z, d, false)
  return p != null
}

function atheriaHabTick(v, server) {
  var level = server.overworld(), e = HAB.etat[v.nom], now = Date.now()
  if (!atheriaHabActif(v, server)) {
    if (e.actif && now - e.vide > 30000) { atheriaHabRetirerTous(v, level); e.actif = false; e.verifie = false }
    return
  }
  e.vide = now
  if (!e.actif) { e.actif = true; console.info('[Atheria habitants] ' + v.nom + ' : ville active') }
  if (!e.verifie && level.isLoaded(new HabBP(Math.floor((v.zone[0] + v.zone[2]) / 2), 64, Math.floor((v.zone[1] + v.zone[3]) / 2)))) {
    atheriaHabVerifier(v, level); e.verifie = true
  }
  var jour = Math.floor(level.getDayTime() / 24000), moment = atheriaHabMoment(level.getDayTime())
  var alerte = { tempete: server.persistentData.getLong('atheria_tempete_fin') > now, horde: atheriaHabScore(server, '#horde') > 0 }
  var ents = atheriaHabRecenser(v, level)
  // rang de chaque habitant parmi ceux qui ont la même consigne (répartit les gens sur les repères du groupe)
  var rangs = {}, compte = {}
  v.habitants.forEach(h => {
    var c = atheriaHabConsigne(v, h, moment, alerte)
    rangs[h[0]] = compte[c] || 0
    compte[c] = (compte[c] || 0) + 1
  })
  v.habitants.forEach((h, i) => {
    try {
      var c = atheriaHabConsigne(v, h, moment, alerte), sorte = c.split(':')[0], groupe = c.split(':')[1]
      var ent = ents[h[0]]
      if (e.morts[h[0]] != null && e.morts[h[0]] >= jour) return
      var liste = atheriaHabGroupe(v, groupe)
      if (!liste.length) { if (ent) ent.discard(); return }
      var rang = rangs[h[0]]
      // ronde : points dans l'ordre, chacun part d'un point différent
      var cle
      if (sorte == 'ronde') {
        var idx = e.ronde[h[0]]
        if (idx == null || idx >= liste.length) idx = e.ronde[h[0]] = (rang * Math.max(1, Math.floor(liste.length / Math.max(1, compte[c])))) % liste.length
        cle = liste[idx]
      } else cle = liste[rang % liste.length]
      var r = v.reperes[cle]
      var tx = r[0] + 0.5, ty = r[1], tz = r[2] + 0.5
      if (sorte == 'jeu') {
        var j = e.jeu[h[0]]
        if (!j || now - j.t > 10000) j = e.jeu[h[0]] = { x: tx + Math.floor(Math.random() * 9) - 4, z: tz + Math.floor(Math.random() * 9) - 4, t: now }
        tx = j.x; tz = j.z
      }
      // FPS des joueurs (Mika 25/11) : un habitant n'existe que près d'un joueur (apparaît à 72 blocs, disparaît au-delà
      // de 96) ; le reste de la ville n'est pas rendu ni animé par les clients
      if (ent && !atheriaHabProche(level, ent.x, ent.y, ent.z, HAB.loin)) { ent.discard(); return }
      if (!ent) {
        // les dormeurs ne reviennent qu'au matin ; on n'apparaît que dans un chunk chargé, près d'un joueur
        if (sorte == 'dormir') return
        if (!atheriaHabProche(level, tx, ty, tz, HAB.pres)) return
        if (!level.isLoaded(new HabBP(r[0], r[1], r[2]))) return
        var dir = v.metiers[h[3]]
        server.runCommandSilent('execute in minecraft:overworld positioned ' + tx + ' ' + ty + ' ' + tz + ' rotated ' + (r[3] || 0) + ' 0 summon easy_npc:humanoid run data merge entity @s ' + atheriaHabSnbt(v, h))
        e.suivi[h[0]] = { x: tx, z: tz, t: now }
        return
      }
      // invulnérable dans les murs, tuable dehors
      var dedans = atheriaHabDansMurs(v, ent.x, ent.z)
      if (ent.isInvulnerable() != dedans) ent.setInvulnerable(dedans)
      // un ordre de marche toutes les 5 s, jamais tous ensemble
      if ((HAB.horloge + i) % 5) return
      if (ent.getTarget && ent.getTarget() != null) return
      var dx = ent.x - tx, dz = ent.z - tz, dist = Math.sqrt(dx * dx + dz * dz)
      if (dist < 1.8) {
        if (sorte == 'ronde') e.ronde[h[0]] = (e.ronde[h[0]] + 1) % liste.length
        else if (sorte == 'dormir') { ent.discard(); return }
        else if (r[3] != null && sorte != 'jeu') { ent.setYRot(r[3]); ent.setYHeadRot(r[3]) }
        e.suivi[h[0]] = { x: ent.x, z: ent.z, t: now }
        return
      }
      ent.getNavigation().moveTo(tx, ty, tz, sorte == 'abri' ? 1.15 : 0.75)
      // coincé (moins d'un bloc en 30 s) et personne pour le voir : il rejoint son repère directement
      var s = e.suivi[h[0]]
      if (!s || Math.abs(s.x - ent.x) + Math.abs(s.z - ent.z) > 1) e.suivi[h[0]] = { x: ent.x, z: ent.z, t: now }
      else if (now - s.t > 30000 && !atheriaHabProche(level, ent.x, ent.y, ent.z, 32) && !atheriaHabProche(level, tx, ty, tz, 32)) {
        if (sorte == 'dormir') ent.discard()
        else ent.teleportTo(tx, ty, tz)
        e.suivi[h[0]] = { x: tx, z: tz, t: now }
      }
    } catch (err) {
      console.error('[Atheria habitants] ' + v.nom + ' ' + h[0] + ' : ' + err)
    }
  })
}

ServerEvents.tick(event => {
  var server = event.server
  if (server.tickCount % 20 != 11) return
  HAB.horloge++
  Object.keys(HAB.villes).forEach(n => {
    try { atheriaHabTick(HAB.villes[n], server) } catch (err) { console.error('[Atheria habitants] ' + n + ' : ' + err) }
  })
})

// un habitant tué (dehors) revient le matin suivant
EntityEvents.death(event => {
  var e = event.entity
  if (!e.tags.contains('ahab')) return
  Object.keys(HAB.villes).forEach(n => {
    if (!e.tags.contains('ahab.' + n)) return
    e.tags.forEach(t => {
      t = '' + t
      if (t.indexOf('ahab.') == 0 && t != 'ahab' && t != 'ahab.' + n) HAB.etat[n].morts[t.substring(5)] = Math.floor(e.level.getDayTime() / 24000)
    })
  })
})

ServerEvents.commandRegistry(event => {
  var { commands: Commands, arguments: Arg } = event
  event.register(Commands.literal('atheria_habitants').requires(src => src.hasPermission(2))
    .then(Commands.literal('etat').executes(ctx => {
      Object.keys(HAB.villes).forEach(n => {
        var e = HAB.etat[n], v = HAB.villes[n]
        ctx.source.sendSystemMessage(Text.of(n + ' : ' + (e.actif ? 'active' : 'endormie') + ', ' + Object.keys(e.ents).length + '/' + v.habitants.length +
          ' habitants, ' + Object.keys(v.reperes).length + ' repères, ' + Object.keys(e.ecartes).length + ' écartés'))
      })
      return 1
    }))
    .then(Commands.literal('verifier').then(Commands.argument('ville', Arg.STRING.create(event)).executes(ctx => {
      var v = HAB.villes[String(Arg.STRING.getResult(ctx, 'ville'))]
      if (!v) return 0
      var r = atheriaHabVerifier(v, ctx.source.server.overworld())
      ctx.source.sendSystemMessage(Text.of(r.length ? r.length + ' repères à revoir (détail dans la console)' : 'Tous les repères chargés sont libres.'))
      return 1
    })))
    .then(Commands.literal('retirer').then(Commands.argument('ville', Arg.STRING.create(event)).executes(ctx => {
      var v = HAB.villes[String(Arg.STRING.getResult(ctx, 'ville'))]
      if (!v) return 0
      atheriaHabRetirerTous(v, ctx.source.server.overworld())
      return 1
    }))))
})
