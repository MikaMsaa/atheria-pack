// Atheria - calendrier des armes lourdes (Mika 27/11, lot gameplay 1) : les armes trop fortes pour le début de la saison
// sont cachées de JEI, retirées du butin et de l'établi d'armurier, et ne tirent pas, jusqu'à leur date d'arrivée.
// Ouverture du serveur : samedi 19/12/2026. Une vague arrive chaque lundi à 0 h, heure de La Réunion (dimanche 21 h à Paris),
// en même temps que l'événement de la semaine. Lu par server_scripts/atheria_armes_lourdes.js et client_scripts/atheria_armes_lourdes.js.
// Le retrait de l'établi s'applique au redémarrage quotidien du serveur (4 h), le reste immédiatement.
global.ATHERIA_ARMES_LOURDES = [
  // [date d'arrivée (heure de La Réunion), armes, nom de la vague annoncé à la radio]
  ['2026-12-28T00:00:00+04:00', ['tacz:m249', 'tacz:rpk', 'tacz:fn_evolys', 'tacz:aa12'], 'mitrailleuses légères et fusil à pompe automatique'],
  ['2027-01-04T00:00:00+04:00', ['tacz:ai_awp', 'tacz:m95', 'tacz:m107'], 'fusils de précision lourds'],
  ['2027-01-11T00:00:00+04:00', ['tacz:rpg7', 'tacz:m320', 'tacz:minigun'], 'lance-roquettes, lance-grenades et minigun']
]

// armes encore verrouillées à l'instant « ms » (Date.now() par défaut)
global.atheriaArmesVerrouillees = function (ms) {
  var t = ms == null ? Date.now() : ms, liste = []
  global.ATHERIA_ARMES_LOURDES.forEach(v => { if (t < Date.parse(v[0])) v[1].forEach(id => liste.push(id)) })
  return liste
}
