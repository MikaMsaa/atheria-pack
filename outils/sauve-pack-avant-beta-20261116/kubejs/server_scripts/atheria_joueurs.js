// Atheria - le haut de la liste TAB affiche le nombre de joueurs connectés.
function atheriaListeJoueurs(server) {
  var Paquet = Java.loadClass('net.minecraft.network.protocol.game.ClientboundTabListPacket')
  var Texte = Java.loadClass('net.minecraft.network.chat.Component')
  var nombre = server.players.size()
  var entete = Texte.literal(nombre + (nombre > 1 ? ' joueurs connectés' : ' joueur connecté'))
  server.players.forEach(joueur => joueur.connection.send(new Paquet(entete, Texte.empty())))
}

PlayerEvents.loggedIn(event => atheriaListeJoueurs(event.server))
PlayerEvents.loggedOut(event => event.server.scheduleInTicks(1, () => atheriaListeJoueurs(event.server)))
