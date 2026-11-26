// Atheria - état d'un véhicule d'un coup d'œil (Mika 26/11 : « savoir si une voiture est réparable et utilisable,
// et le siphonnage, ce n'était pas évident »). Quand un joueur à pied s'approche à moins de 4 blocs d'un véhicule,
// une carte d'action (HUD Atheria, sans chat) dit ce qu'il en est :
//  - carcasse brûlée : irréparable, seul son réservoir peut encore servir ;
//  - prête à rouler, ou ce qu'il manque pour rouler (moteur, roues, siège) ;
//  - carrosserie abîmée (pièces détachées) ;
//  - ce que contient le réservoir, en bidons que le kit de siphonnage peut en tirer.
// Même chose pour le réservoir d'une épave de décor (bloc atheria:reservoir_epave) regardé de près.
// Une carte par véhicule, puis plus rien tant que le joueur ne s'en est pas éloigné une minute.
var ETAT_VH = { periode: 20, rayon: 4, oubliMs: 60000, vus: {} }

function atheriaEtatCompter(v) {
  var attendu = { moteur: 0, roue: 0, siege: 0 }, monte = { moteur: 0, roue: 0, siege: 0 }
  var genre = t => t.indexOf('engine') == 0 ? 'moteur' : (t == 'ground_wheel' ? 'roue' : (t == 'seat' ? 'siege' : null))
  v.definition.parts.forEach(slot => {
    var g = null
    slot.types.forEach(t => { if (!g) g = genre('' + t) })
    if (g) attendu[g]++
  })
  v.parts.forEach(pt => {
    var g = genre('' + pt.placementDefinition.types.get(0))
    if (g) monte[g]++
  })
  return { attendu: attendu, monte: monte }
}

function atheriaEtatTexte(v) {
  var brulee = ('' + v.subDefinition.subName).indexOf('brulee') >= 0
  var bidons = Math.floor(v.fuelTank.getFluidLevel() / ROUTE.siphonMb)
  var reservoir = bidons > 0 ? 'Réservoir : de quoi remplir ' + bidons + (bidons > 1 ? ' bidons' : ' bidon') + ' au kit de siphonnage.' : 'Réservoir vide.'
  if (brulee) return { couleur: 'rouge', texte: 'Carcasse brûlée : irréparable. ' + reservoir }
  var c = atheriaEtatCompter(v), manque = []
  if (c.attendu.moteur > 0 && c.monte.moteur == 0) manque.push('le moteur')
  var roues = c.attendu.roue - c.monte.roue
  if (roues > 0) manque.push(roues + (roues > 1 ? ' roues' : ' roue'))
  if (c.attendu.siege > 0 && c.monte.siege == 0) manque.push('un siège')
  var vie = v.definition.general.health
  var abime = vie > 0 && v.damageVar.currentValue >= vie / 4 ? ' Carrosserie abîmée : pièces détachées.' : ''
  if (manque.length == 0) {
    var plein = v.fuelTank.getFluidLevel() >= 1 ? 'Prête à rouler.' : 'Prête à rouler dès le plein fait.'
    return { couleur: 'vert', texte: plein + abime + ' ' + reservoir }
  }
  var liste = manque.length == 1 ? manque[0] : manque.slice(0, -1).join(', ') + ' et ' + manque[manque.length - 1]
  return { couleur: 'ambre', texte: 'Réparable : il manque ' + liste + '.' + abime + ' ' + reservoir }
}

ServerEvents.tick(event => {
  var server = event.server
  if (server.tickCount % ETAT_VH.periode) return
  var maintenant = Date.now()
  server.players.forEach(p => {
    try {
      if (p.isSpectator() || p.getVehicle() != null) return
      var memoire = ETAT_VH.vus[p.username] || (ETAT_VH.vus[p.username] = {})
      var v = routeVehiculeProche(p, ETAT_VH.rayon)
      if (v != null) {
        var cle = '' + v.uniqueUUID
        var avant = memoire[cle]
        memoire[cle] = maintenant
        if (avant && maintenant - avant < ETAT_VH.oubliMs) return
        var e = atheriaEtatTexte(v)
        atheriaHudAction(p, 'mts:mts.wrench', e.texte, e.couleur)
        return
      }
      // réservoir d'une épave de décor, regardé à moins de 5 blocs
      var vise = p.rayTrace(5)
      var b = vise && vise.block
      if (b && ('' + b.id) == 'atheria:reservoir_epave') {
        var cleB = b.x + ' ' + b.y + ' ' + b.z, avantB = memoire[cleB]
        memoire[cleB] = maintenant
        if (avantB && maintenant - avantB < ETAT_VH.oubliMs) return
        atheriaHudAction(p, 'atheria:kit_siphon', 'Réservoir d\'épave : un kit de siphonnage peut encore en tirer un bidon.', 'ambre')
      }
    } catch (err) {
      console.error('[Atheria état véhicule] ' + err)
    }
  })
})
