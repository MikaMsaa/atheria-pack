// Atheria - lieux marqués sur la carte du joueur (didacticiel, temps 3 : Bakoutoubo au hameau, Mika 24/11).
// /atheria_repere <joueur> <lieu> : le client ajoute un repère dans Xaero (client_scripts/atheria_reperes.js),
// sans doublon (le client ne recrée pas un repère du même nom), et une petite icône le confirme au-dessus de la barre d'objets.
var REPERES = {
  porte_rn1: { nom: 'Porte RN1 de Longoni', ini: 'L', x: 2487, y: 66, z: -2940, couleur: 14 },
  infirmerie: { nom: 'Infirmerie de Longoni', ini: '+', x: 2359, y: 67, z: -3013, couleur: 12 },
  eniy: { nom: 'Eniy, camp des conteneurs', ini: 'E', x: 2525, y: 66, z: -3115, couleur: 6 }
}

function atheriaRepere(p, id) {
  var r = REPERES[id]
  if (!r) return 0
  p.sendData('atheria_repere', { id: id, nom: r.nom, ini: r.ini, x: r.x, y: r.y, z: r.z, couleur: r.couleur })
  atheriaHudAction(p, 'minecraft:map', r.nom + ' : marqué sur ta carte (M)', 'vert')
  return 1
}

ServerEvents.commandRegistry(event => {
  var { commands: Commands, arguments: Arg } = event
  event.register(Commands.literal('atheria_repere').requires(src => src.hasPermission(2))
    .then(Commands.argument('joueur', Arg.PLAYER.create(event))
      .then(Commands.argument('lieu', Arg.STRING.create(event))
        .executes(ctx => atheriaRepere(Arg.PLAYER.getResult(ctx, 'joueur'), String(Arg.STRING.getResult(ctx, 'lieu')))))))
})
