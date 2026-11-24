// Atheria - envoi des affichages à l'écran (mod client atheria_hud, voir kubejs/client_scripts/atheria_hud.js).
// Remplace les simples messages du chat des mécaniques (Mika 24/11) : poche de gaz, explosion, tempête de cendres.
function atheriaHud(joueur, donnees) {
  try {
    joueur.sendData('atheria_hud', donnees)
  } catch (e) {
    console.warn('[Atheria HUD] envoi impossible à ' + joueur.username + ' : ' + e)
  }
}

// Message radio à l'écran (mod atheria_hud) : src = contrebandiers, primes, eniy, contrats, avantpostes, balise, semaine, honneur.
// accent : début du message mis en valeur (nom, lieu...), facultatif.
function atheriaHudRadio(joueur, src, texte, accent) {
  atheriaHud(joueur, { t: 'radio', src: src, texte: texte, accent: accent || '' })
}

function atheriaHudRadioTous(server, src, texte, accent) {
  server.players.forEach(p => atheriaHudRadio(p, src, texte, accent))
}

// Tous les joueurs de la dimension à moins de « rayon » blocs du point
function atheriaHudAutour(niveau, x, y, z, rayon, donnees) {
  niveau.getPlayers().forEach(p => {
    if (p.distanceToSqr(x, y, z) <= rayon * rayon) atheriaHud(p, donnees)
  })
}
