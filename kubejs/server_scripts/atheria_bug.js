// Atheria - commande /bug pour les testeurs (retours bêta du 25/11, lot 2) : « /bug <ce qui ne va pas> ».
// Chaque signalement est ajouté à la fin de /atheria-bugs/rapports.tsv à la racine du serveur, une ligne par bug :
// date et heure (La Réunion), joueur, dimension, x y z, direction du regard, jour de jeu, description.
// Une attente de 30 s entre deux signalements d'un même joueur évite les doublons. Aucun message dans le chat :
// la confirmation s'affiche au-dessus de la barre d'objets.
var BUG = { fichier: 'atheria-bugs/rapports.tsv', attenteMs: 30000, longueurMax: 400, dernier: {} }

function atheriaBugDate() {
  var d = new Date(Date.now() + 4 * 3600 * 1000) // heure de La Réunion (UTC+4)
  var z = n => (n < 10 ? '0' : '') + n
  return d.getUTCFullYear() + '-' + z(d.getUTCMonth() + 1) + '-' + z(d.getUTCDate()) + ' ' + z(d.getUTCHours()) + ':' + z(d.getUTCMinutes())
}

function atheriaBugEnregistrer(p, texte) {
  var FU = Java.loadClass('org.apache.commons.io.FileUtils')
  var propre = ('' + texte).replace(/[\t\r\n]+/g, ' ').trim().substring(0, BUG.longueurMax)
  var regard = ['sud', 'ouest', 'nord', 'est'][Math.floor(((p.yRot % 360) + 360 + 45) % 360 / 90)]
  var ligne = [atheriaBugDate(), p.username, '' + p.level.dimension,
    Math.floor(p.x) + ' ' + Math.floor(p.y) + ' ' + Math.floor(p.z), regard,
    'jour ' + (Math.floor(p.level.getDayTime() / 24000) + 1), propre].join('\t')
  var fichier = FU['getFile(java.lang.String[])'](BUG.fichier.split('/'))
  FU['writeStringToFile(java.io.File,java.lang.String,java.lang.String,boolean)'](fichier, ligne + '\n', 'UTF-8', true)
  console.info('[Atheria bug] ' + ligne)
}

ServerEvents.commandRegistry(event => {
  var Commands = event.commands
  var Str = Java.loadClass('com.mojang.brigadier.arguments.StringArgumentType')
  var usage = ctx => {
    var p = ctx.source.player
    if (p) p.setStatusMessage(Text.yellow('Écris : /bug suivi de ce qui ne va pas (ex. /bug le portail ne s\'ouvre pas)'))
    return 1
  }
  event.register(Commands.literal('bug').executes(usage)
    .then(Commands.argument('description', Str.greedyString()).executes(ctx => {
      var p = ctx.source.player
      if (!p) return 0
      var now = Date.now(), avant = BUG.dernier[p.username] || 0
      if (now - avant < BUG.attenteMs) {
        p.setStatusMessage(Text.yellow('Signalement déjà envoyé, réessaie dans ' + Math.ceil((BUG.attenteMs - (now - avant)) / 1000) + ' s'))
        return 0
      }
      try {
        atheriaBugEnregistrer(p, Str.getString(ctx, 'description'))
        BUG.dernier[p.username] = now
        p.setStatusMessage(Text.green('Merci ! Bug enregistré avec ta position.'))
        return 1
      } catch (err) {
        console.error('[Atheria bug] ' + err)
        p.setStatusMessage(Text.red('Le bug n\'a pas pu être enregistré, préviens un admin.'))
        return 0
      }
    })))
})
