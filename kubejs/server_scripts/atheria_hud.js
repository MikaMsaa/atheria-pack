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

// Bannière en haut de l'écran (mod atheria_hud, étape 5) : genre = quete, evenement, danger, fin, signal, info.
// sur : petit surtitre espacé ; titre : grand titre (facultatif) ; texte : une ou deux phrases.
function atheriaHudBanniere(joueur, genre, sur, titre, texte) {
  atheriaHud(joueur, { t: 'banniere', genre: genre, sur: sur || '', titre: titre || '', texte: texte || '' })
}

function atheriaHudBanniereTous(server, genre, sur, titre, texte) {
  server.players.forEach(p => atheriaHudBanniere(p, genre, sur, titre, texte))
}

// Petite icône d'action au-dessus de la barre d'objets, à la place du texte gris de la barre d'action.
// icone : identifiant d'objet ; couleur : vert, rouge, ambre ou rien ; progres : 0 à 1 pour une barre, facultatif.
function atheriaHudAction(joueur, icone, texte, couleur, progres) {
  var d = { t: 'action', icone: icone || '', texte: texte, couleur: couleur || '' }
  if (progres != null && progres >= 0) d.progres = progres
  atheriaHud(joueur, d)
}

// Nouvelle note du carnet (bout de papier à gauche de l'écran)
function atheriaHudNote(joueur, titre, texte, compte) {
  atheriaHud(joueur, { t: 'note', titre: titre, texte: texte, compte: compte || '' })
}
