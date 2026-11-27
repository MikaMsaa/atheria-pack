// Atheria - OUTIL (jamais dans le pack) : passe 3b, reprise des etapes overdraw de zz_dh_essais3.js
// (java.lang.Float n'est pas visible depuis KubeJS : Java.loadClass a la place). Captures screenshots/dh3b-*.png
var E3B_ETAT = 'kubejs/config/dh_essais3b_etat.json'
var e3bTicks = 0, e3bEtape = 0, e3bProchain = -1, e3bFini = false
function e3bLog(m) { console.info('[DH3B] ' + m) }
function e3bCfg() { return Java.loadClass('com.seibel.distanthorizons.api.DhApi$Delayed').configs }
function e3bCmd(c) {
  var srv = Client.getSingleplayerServer()
  srv.execute(function () { srv.getCommands().performPrefixedCommand(srv.createCommandSourceStack(), c) })
  e3bLog('commande ' + c)
}
function e3bCap(nom) {
  Java.loadClass('net.minecraft.client.Screenshot').grab(Client.gameDirectory, 'dh3b-' + nom + '.png', Client.getMainRenderTarget(), function (m) {})
  e3bLog('capture dh3b-' + nom + '.png')
}
function e3bOver(v) {
  var F = Java.loadClass('java.lang.Float')
  var o = e3bCfg().graphics().overdrawPreventionRadius()
  o.setValue(F.valueOf(v))
  e3bLog('overdraw ' + v + ' -> lu : ' + o.getValue())
}
var E3B_ETAPES = [
  [45, function () { if (Client.player.isDeadOrDying()) Client.player.respawn(); e3bCmd('gamemode spectator @a'); e3bCmd('time set 6000'); e3bCmd('kill @e[type=!player]') }],
  [5, function () { Java.loadClass('net.irisshaders.iris.api.v0.IrisApi').getInstance().getConfig().setShadersEnabledAndApply(false); e3bCmd('tp @a 4246 -51 -784 -90 -20') }],
  [60, function () { e3bLog('overdraw initial lu : ' + e3bCfg().graphics().overdrawPreventionRadius().getValue()); e3bCap('B-grotte-overdraw-auto') }],
  [2, function () { e3bOver(0.5) }],
  [40, function () { e3bCap('C-grotte-overdraw-0.5') }],
  [2, function () { e3bOver(0.8) }],
  [40, function () { e3bCap('D-grotte-overdraw-0.8') }],
  [2, function () { e3bOver(1.0) }],
  [40, function () { e3bCap('E-grotte-overdraw-1.0') }],
  [2, function () { e3bCmd('tp @a 2800 140 -950 0 10') }],
  [60, function () { e3bCap('F-surface-overdraw-1.0') }],
  [2, function () { e3bOver(-1.0) }],
  [40, function () { e3bCap('G-surface-overdraw-auto') }],
  [5, function () { e3bLog('FIN'); JsonIO.write(E3B_ETAT, { etat: 'fini' }); e3bFini = true }]
]
ClientEvents.tick(function (event) {
  e3bTicks++
  if (e3bFini || Client.player == null || Client.getSingleplayerServer() == null) return
  if (e3bProchain < 0) e3bProchain = e3bTicks + E3B_ETAPES[0][0] * 20
  if (e3bTicks < e3bProchain) return
  try { E3B_ETAPES[e3bEtape][1]() } catch (e) { e3bLog('ERREUR etape ' + e3bEtape + ' : ' + e) }
  e3bEtape++
  if (e3bEtape >= E3B_ETAPES.length) { e3bFini = true; return }
  e3bProchain = e3bTicks + E3B_ETAPES[e3bEtape][0] * 20
  JsonIO.write(E3B_ETAT, { etat: 'en_cours', etape: e3bEtape })
})
