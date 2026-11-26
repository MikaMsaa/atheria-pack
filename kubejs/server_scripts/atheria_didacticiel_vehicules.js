// Atheria - didacticiel des véhicules (retours bêta du 25/11, lot 2 : « mod véhicules pas assez intuitif »).
// Même principe que le didacticiel de survie : une bannière à l'écran, une seule fois par joueur, au moment où
// le joueur en a besoin, jamais deux à la fois (même file et même pause de 20 s que atheria_didacticiel.js).
//  proche   : premier véhicule à moins de 6 blocs ;
//  epave    : premier véhicule sans moteur ou sans roues approché ;
//  monte    : première fois au volant ;
//  vide     : au volant d'un véhicule au réservoir vide ;
//  tableau  : après 1 min de conduite ;
//  abime    : véhicule abîmé au tiers ;
//  cle      : après 3 min de conduite ;
//  outils   : clé à molette ou pistolet de peinture en main ;
//  plein    : bidon, jerrycan ou pompe en main.
// Le chapitre complet reste dans le guide (F4 > Véhicules).
var DIDA_VH = {
  periode: 40,
  rayon: 6,
  tableauSec: 60,
  cleSec: 180,
  textes: {
    proche: ['Les véhicules', 'Clic droit sur un siège pour monter. Il manque une pièce ? Prends-la en main : l\'hologramme vert montre où elle va. Tout est dans F4 > Véhicules.'],
    epave: ['Une épave', 'Moteur ou roues manquants : trouve-les dans les ruines ou fabrique-les aux établis, puis clic droit sur le véhicule avec la pièce en main.'],
    monte: ['Au volant', 'Z avancer, S freiner, Q D tourner, N frein à main, G phares. Les touches restent en bas de l\'écran tant que tu conduis. Maj pour descendre.'],
    vide: ['Réservoir vide', 'Essence : essence trouvée ou essence artisanale (bioéthanol). Diesel : gazole, huile ou créosote. Bidon ou jerrycan : clic droit sur le véhicule.'],
    tableau: ['Le tableau de bord', 'U ouvre le tableau de bord complet : moteur, phares, clignotants, radio. Avec la clé à molette, clic droit sur le véhicule pour choisir les cadrans.'],
    abime: ['Véhicule abîmé', 'Répare-le à l\'établi de véhicules ou avec un kit de réparation. Trop abîmé, il s\'arrête et peut prendre feu.'],
    cle: ['Protège ton véhicule', 'Clé de contact : clic droit sur le véhicule pour le verrouiller. Personne ne monte sans la clé, et toi seul peux le modifier.'],
    outils: ['Personnaliser', 'Clé à molette : clic droit pour les cadrans, clic gauche pour retirer une pièce. Pistolet de peinture : clic droit pour changer la couleur du véhicule ou d\'une pièce.'],
    plein: ['Faire le plein', 'Bidon ou jerrycan plein : clic droit sur le véhicule. Pompe : remplis-la, puis clic droit main vide, elle se branche au véhicule le plus proche.']
  },
  outils: ['mts:mts.wrench', 'mts:mts.paintgun'],
  plein: ['mts:mts.jerrycan', 'mts:mts.fuelpump'],
  dernier: {}
}

function atheriaDidaVh(p, id) {
  var cle = 'atheria_dida_vh_' + id
  if (p.persistentData.getBoolean(cle)) return true
  if (typeof atheriaDidaPret === 'function' && !atheriaDidaPret(p)) return false
  var partage = typeof DIDA !== 'undefined' ? DIDA.dernier : DIDA_VH.dernier
  var d = partage[p.username]
  if (d && Date.now() - d < 20000) return false
  partage[p.username] = Date.now()
  p.persistentData.putBoolean(cle, true)
  atheriaHudBanniere(p, 'info', 'Véhicules', DIDA_VH.textes[id][0], DIDA_VH.textes[id][1])
  console.info('[Atheria didacticiel véhicules] ' + p.username + ' : ' + id)
  return true
}

function atheriaDidaVhVu(p, id) { return p.persistentData.getBoolean('atheria_dida_vh_' + id) }

// Véhicule MTS sur lequel le joueur est assis, ou null
function atheriaDidaVhMonte(p) {
  var b = p.getVehicle()
  if (b == null || ('' + b.getType()).indexOf('mts') < 0) return null
  try { var s = b.entity; return s != null && s.vehicleOn != null ? s.vehicleOn : null } catch (e) { return null }
}

function atheriaDidaVhIncomplet(v) {
  var Roue = Java.loadClass('minecrafttransportsimulator.entities.instances.PartGroundDevice')
  var roues = 0
  v.parts.forEach(pt => { if (pt instanceof Roue) roues++ })
  return v.engines.size() == 0 || roues < 3
}

ServerEvents.tick(event => {
  var server = event.server
  if (server.tickCount % DIDA_VH.periode) return
  var WW = Java.loadClass('mcinterface1211.WrapperWorld')
  var Phys = Java.loadClass('minecrafttransportsimulator.entities.instances.EntityVehicleF_Physics')
  server.players.forEach(p => {
    try {
      if (p.isSpectator() || p.isCreative()) return
      var data = p.persistentData
      if (data.getBoolean('atheria_dida_vh_fini')) return
      var objet = '' + p.getMainHandItem().getId()
      if (DIDA_VH.outils.indexOf(objet) >= 0) atheriaDidaVh(p, 'outils')
      if (DIDA_VH.plein.indexOf(objet) >= 0) atheriaDidaVh(p, 'plein')
      var v = atheriaDidaVhMonte(p)
      if (v != null) {
        var sec = data.getInt('atheria_dida_vh_sec') + DIDA_VH.periode / 20
        data.putInt('atheria_dida_vh_sec', sec)
        atheriaDidaVh(p, 'monte')
        if (v.engines.size() > 0 && v.fuelTank != null && v.fuelTank.getFluidLevel() < 1) atheriaDidaVh(p, 'vide')
        if (sec >= DIDA_VH.tableauSec) atheriaDidaVh(p, 'tableau')
        if (sec >= DIDA_VH.cleSec) atheriaDidaVh(p, 'cle')
        var vie = v.definition.general.health
        if (vie > 0 && v.damageVar.currentValue >= vie / 3) atheriaDidaVh(p, 'abime')
      } else if (!atheriaDidaVhVu(p, 'proche') || !atheriaDidaVhVu(p, 'epave')) {
        var liste = WW.getWrapperFor(p.level).getEntitiesExtendingType(Phys)
        var r2 = DIDA_VH.rayon * DIDA_VH.rayon
        for (var i = 0; i < liste.size(); i++) {
          var w = liste.get(i)
          var dx = w.position.x - p.x, dy = w.position.y - p.y, dz = w.position.z - p.z
          if (dx * dx + dy * dy + dz * dz > r2) continue
          if (!atheriaDidaVhVu(p, 'proche')) atheriaDidaVh(p, 'proche')
          else if (atheriaDidaVhIncomplet(w)) atheriaDidaVh(p, 'epave')
          break
        }
      }
      var tous = true
      Object.keys(DIDA_VH.textes).forEach(id => { if (!atheriaDidaVhVu(p, id)) tous = false })
      if (tous) data.putBoolean('atheria_dida_vh_fini', true)
    } catch (e) {
      console.error('[Atheria didacticiel véhicules] ' + e)
    }
  })
})
