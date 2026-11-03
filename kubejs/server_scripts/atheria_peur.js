// Atheria Zombie Edition : la peur s'estompe à force de croiser un même type de mob.
// La peur est l'effet Madness de Spore (hallucinations, sons, impression d'être observé).
// Chaque joueur retient, par type de mob, ses rencontres et son temps d'exposition.
// Une frayeur ne dure que quelques secondes, et plus du tout une fois le type devenu familier.
var PEUR_PORTEE = 24
var PEUR_HAUTEUR = 16
// Sans voir ce type pendant 3 minutes, le revoir compte comme une nouvelle rencontre
var PEUR_NOUVELLE_RENCONTRE = 3600
// 60 secondes face à un type habituent autant qu'une rencontre de plus
var PEUR_EXPOSITION = 60
var PEUR_DUREE_MINI = 2
var PEUR_RARE = { duree: 20, rencontres: 12 }
var PEUR_EVOLUE = { duree: 15, rencontres: 8 }
var PEUR_COMMUN = { duree: 10, rencontres: 5 }
var PEUR_AUTRE = { duree: 5, rencontres: 2 }
var PEUR_LISTE_RARES = ['spore:proto', 'spore:brot', 'spore:grober', 'spore:hollen', 'spore:reaper', 'spore:saugling', 'spore:inquisitor', 'spore:hevoker', 'spore:gastgaber', 'spore:hvendicator', 'spore:biobloob', 'spore:wendigo', 'spore:ogre', 'spore:specter', 'spore:plagued', 'spore:lacerator', 'spore:inf_construct', 'infnexus:nexus']
// Source d'une folie donnée sans mob en vue (nourriture de Spore, cri lointain)
var PEUR_SANS_SOURCE = 'atheria:sans_source'

function peurCategorie(id) {
  if (PEUR_LISTE_RARES.indexOf(id) >= 0) return PEUR_RARE
  if (id.indexOf('spore:inf_') == 0 || id.indexOf('hordes:') == 0) return PEUR_COMMUN
  if (id.indexOf('spore:') == 0 || id.indexOf('jurassicreborn:') == 0 || id == PEUR_SANS_SOURCE) return PEUR_EVOLUE
  return PEUR_AUTRE
}

// Durée en secondes pour ce type, selon l'habitude déjà prise
function peurDuree(id, habitude) {
  var categorie = peurCategorie(id)
  var duree = Math.round(categorie.duree * (1 - habitude / categorie.rencontres))
  return duree < PEUR_DUREE_MINI ? 0 : duree
}

// Note que le joueur fait face à ce type. Rend la durée d'une nouvelle frayeur, 0 s'il la connaît déjà
function peurNoter(memoire, id, maintenant) {
  var trace = memoire.getCompound(id)
  var nouvelle = !trace.contains('vu') || maintenant - trace.getLong('vu') > PEUR_NOUVELLE_RENCONTRE
  var habitude = trace.getDouble('habitude')
  var duree = nouvelle ? peurDuree(id, habitude) : 0
  trace.putDouble('habitude', habitude + (nouvelle ? 1 : 1 / PEUR_EXPOSITION))
  trace.putLong('vu', maintenant)
  memoire.put(id, trace)
  return duree
}

function peurMobsAutour(joueur, portee) {
  var Mob = Java.loadClass('net.minecraft.world.entity.Mob')
  var AABB = Java.loadClass('net.minecraft.world.phys.AABB')
  var zone = new AABB(joueur.x - portee, joueur.y - PEUR_HAUTEUR, joueur.z - portee, joueur.x + portee, joueur.y + PEUR_HAUTEUR, joueur.z + portee)
  return joueur.level['getEntitiesOfClass(java.lang.Class,net.minecraft.world.phys.AABB)'](Mob, zone)
}

function peurEstMenace(joueur, mob) {
  var id = '' + mob.type
  if (id == 'spore:illusion' || !mob.isAlive()) return false
  return bruitEstHostile(mob) || mob.getTarget() == joueur
}

function peurFolie(joueur) {
  var effets = joueur.getActiveEffects().iterator()
  while (effets.hasNext()) {
    var effet = effets.next()
    if (effet.getEffect().getRegisteredName() == 'spore:madness') return effet
  }
  return null
}

function peurJoueur(serveur, joueur) {
  var maintenant = joueur.level.getLevelData().getGameTime()
  var nom = joueur.username
  var memoire = joueur.persistentData.getCompound('atheria_peur')
  var frayeur = 0
  var vus = {}
  var mobs = peurMobsAutour(joueur, PEUR_PORTEE)
  for (var i = 0; i < mobs.size(); i++) {
    var mob = mobs.get(i)
    var id = '' + mob.type
    if (vus[id] || !peurEstMenace(joueur, mob) || !joueur.hasLineOfSight(mob)) continue
    vus[id] = true
    frayeur = Math.max(frayeur, peurNoter(memoire, id, maintenant))
  }
  var fin = memoire.getLong('fin')
  var folie = peurFolie(joueur)
  var remplacee = false
  // Une folie venue de Spore (cri, tumeur, nourriture) n'échappe pas à la règle : pas de 10 minutes ni de relance
  if (folie != null && (folie.getAmplifier() > 0 || folie.getDuration() > fin - maintenant + 40)) {
    var source = PEUR_SANS_SOURCE
    var proches = peurMobsAutour(joueur, PEUR_PORTEE * 2)
    for (var j = 0; j < proches.size(); j++) {
      var proche = proches.get(j)
      if (('' + proche.type).indexOf('spore:') == 0 && peurEstMenace(joueur, proche)) { source = '' + proche.type; break }
    }
    frayeur = Math.max(frayeur, peurNoter(memoire, source, maintenant))
    serveur.runCommandSilent('effect clear ' + nom + ' spore:madness')
    remplacee = true
  }
  if (frayeur > 0) {
    fin = Math.max(fin, maintenant + frayeur * 20)
    memoire.putLong('fin', fin)
    var volume = Math.min(1, frayeur / PEUR_COMMUN.duree)
    serveur.runCommandSilent('execute as ' + nom + ' at @s run playsound minecraft:entity.warden.heartbeat player @s ~ ~ ~ ' + volume + ' 1')
  }
  if ((frayeur > 0 || remplacee) && fin > maintenant) {
    serveur.runCommandSilent('effect give ' + nom + ' spore:madness ' + Math.ceil((fin - maintenant) / 20) + ' 0 true')
  }
  joueur.persistentData.put('atheria_peur', memoire)
}

ServerEvents.tick(event => {
  var serveur = event.server
  if (serveur.getTickCount() % 20 != 0) return
  serveur.players.forEach(joueur => {
    if (joueur.isCreative() || joueur.isSpectator() || !joueur.isAlive()) return
    try {
      peurJoueur(serveur, joueur)
    } catch (erreur) {
      console.error('[Atheria] peur : ' + erreur)
    }
  })
})
