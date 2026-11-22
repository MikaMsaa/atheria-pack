// Atheria - cargaisons des contrebandiers (« largages radio », mécanique validée par Mika le 22/11).
// Deux soirs par semaine à heure fixe, la radio des contrebandiers annonce une caisse cachée dans un lieu de l'île.
//  - 15 min avant : le nom du lieu ;
//  - à l'heure : la caisse apparaît (tonneau rempli avec la table atheria:chests/militaire, sans Lootr :
//    le premier arrivé prend tout) avec un feu de camp de signal dont la fumée se voit de loin ;
//  - 45 min après, la caisse et le feu sont retirés, vides ou non.
// Horaires en heure de La Réunion (UTC+4). Jours : 0 dimanche ... 6 samedi.
var LARGAGE_JOURS = [3, 6]
var LARGAGE_HEURE = 20
var LARGAGE_FUSEAU = 4
var LARGAGE_DUREE_MIN = 45
var LARGAGE_TABLE = 'atheria:chests/militaire'
// [nom, x, z] : lieux ouverts, loin de Longoni (l'enceinte n'en reçoit jamais)
var LARGAGE_LIEUX = [
  ['les champs de Coconi', -1010, -820],
  ['la station Total de la RN1', 2770, -575],
  ['Dembeni', 2047, 280],
  ['le péage de la RN1', 1615, -20],
  ['les ruines du camp de la RN1', 1047, -40],
  ['le campus de Somaco', 4180, -680],
  ['Handrema', 1600, 2700],
  ['Chirongui', 800, 3740],
  ['Sada', -3937, 540],
  ['la station de ski de Choungui', -289, 1490],
  ['Vahibe', -2033, 2090],
  ['le village des pêcheurs du Sud', 2479, 5040]
]

function atheriaContrebande(server, texte) {
  server.players.forEach(p => p.tell(Text.gold('[Radio des contrebandiers] ').append(Text.gray(texte))))
}

// minutes depuis minuit et jour de la semaine, heure de La Réunion
function atheriaLargageHeure() {
  var d = new Date(Date.now() + LARGAGE_FUSEAU * 3600 * 1000)
  return { jour: d.getUTCDay(), minutes: d.getUTCHours() * 60 + d.getUTCMinutes(), cle: d.toISOString().substring(0, 10) }
}

function atheriaLargagePose(server, lieu) {
  var x = lieu[1] + Math.floor(Math.random() * 41) - 20
  var z = lieu[2] + Math.floor(Math.random() * 41) - 20
  server.runCommandSilent('forceload add ' + x + ' ' + z)
  server.scheduleInTicks(60, () => {
    var Heightmap = Java.loadClass('net.minecraft.world.level.levelgen.Heightmap$Types')
    var level = server.overworld()
    var y = level.getHeight(Heightmap.MOTION_BLOCKING_NO_LEAVES, x, z)
    server.runCommandSilent('setblock ' + x + ' ' + y + ' ' + z + ' minecraft:hay_block')
    server.runCommandSilent('setblock ' + x + ' ' + (y + 1) + ' ' + z + ' minecraft:campfire[lit=true,signal_fire=true]')
    server.runCommandSilent('setblock ' + (x + 1) + ' ' + y + ' ' + z + ' minecraft:barrel[facing=up]')
    server.runCommandSilent('loot insert ' + (x + 1) + ' ' + y + ' ' + z + ' loot ' + LARGAGE_TABLE)
    server.runCommandSilent('loot insert ' + (x + 1) + ' ' + y + ' ' + z + ' loot ' + LARGAGE_TABLE)
    server.runCommandSilent('forceload remove ' + x + ' ' + z)
    server.persistentData.putString('atheria_largage_pos', x + ',' + y + ',' + z)
    server.persistentData.putLong('atheria_largage_fin', Date.now() + LARGAGE_DUREE_MIN * 60 * 1000)
    atheriaContrebande(server, '« La cargaison est posée vers ' + lieu[0] + ', X ' + Math.round(x / 10) * 10 + ', Z ' + Math.round(z / 10) * 10 + '. Cherchez la fumée. Premier arrivé, premier servi. »')
  })
}

function atheriaLargageRetire(server) {
  var pos = String(server.persistentData.getString('atheria_largage_pos') || '')
  if (!pos) return
  var p = pos.split(',').map(Number)
  server.runCommandSilent('forceload add ' + p[0] + ' ' + p[2])
  server.scheduleInTicks(60, () => {
    server.runCommandSilent('setblock ' + (p[0] + 1) + ' ' + p[1] + ' ' + p[2] + ' minecraft:air')
    server.runCommandSilent('setblock ' + p[0] + ' ' + (p[1] + 1) + ' ' + p[2] + ' minecraft:air')
    server.runCommandSilent('setblock ' + p[0] + ' ' + p[1] + ' ' + p[2] + ' minecraft:air')
    server.runCommandSilent('forceload remove ' + p[0] + ' ' + p[2])
  })
  server.persistentData.remove('atheria_largage_pos')
  server.persistentData.remove('atheria_largage_fin')
}

ServerEvents.tick(event => {
  var server = event.server
  if (server.tickCount % 400 != 200) return
  var data = server.persistentData
  var fin = data.getLong('atheria_largage_fin')
  if (fin && Date.now() > fin) atheriaLargageRetire(server)

  var h = atheriaLargageHeure()
  if (LARGAGE_JOURS.indexOf(h.jour) < 0 && !(h.jour == 0 && atheriaSemaine() == 'cargaison')) return   // dimanche en plus : atheria_semaine.js
  var debut = LARGAGE_HEURE * 60
  // annonce 15 min avant
  if (h.minutes >= debut - 15 && h.minutes < debut && data.getString('atheria_largage_annonce') != h.cle) {
    var lieu = LARGAGE_LIEUX[Math.floor(Math.random() * LARGAGE_LIEUX.length)]
    data.putString('atheria_largage_annonce', h.cle)
    data.putString('atheria_largage_lieu', lieu[0])
    atheriaContrebande(server, '« Cargaison ce soir vers ' + lieu[0] + ', dans un quart d\'heure. On ne la gardera pas longtemps. »')
  }
  // la caisse, à l'heure (ou dans les 30 min si le serveur redémarre)
  if (h.minutes >= debut && h.minutes < debut + 30 && data.getString('atheria_largage_fait') != h.cle) {
    data.putString('atheria_largage_fait', h.cle)
    var nom = String(data.getString('atheria_largage_lieu') || '')
    var choisi = LARGAGE_LIEUX.filter(l => l[0] == nom)[0] || LARGAGE_LIEUX[Math.floor(Math.random() * LARGAGE_LIEUX.length)]
    atheriaLargagePose(server, choisi)
  }
})
