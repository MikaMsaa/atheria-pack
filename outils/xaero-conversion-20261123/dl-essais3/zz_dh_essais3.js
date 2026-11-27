// Atheria - OUTIL (jamais dans le pack) : passe 3 des essais DH/Iris, avec atheria_reglages 1.0.11.
// Captures screenshots/dh3-<nom>.png, journal [DH3] dans logs/kubejs/client.log, fin : kubejs/config/dh_essais3_etat.json
var E3_ETAT = 'kubejs/config/dh_essais3_etat.json'
var E3_GROTTE = 'tp @a 4246 -51 -784 -90 -20'
var e3Ticks = 0, e3Etape = 0, e3Prochain = -1, e3Fini = false
function e3Log(m) { console.info('[DH3] ' + m) }
function e3Cfg() { return Java.loadClass('com.seibel.distanthorizons.api.DhApi$Delayed').configs }
function e3Iris(oui) {
  var api = Java.loadClass('net.irisshaders.iris.api.v0.IrisApi').getInstance()
  api.getConfig().setShadersEnabledAndApply(oui)
  e3Log('shaders ' + oui + ' -> en usage : ' + api.isShaderPackInUse())
}
function e3Cmd(c) {
  var srv = Client.getSingleplayerServer()
  srv.execute(function () { srv.getCommands().performPrefixedCommand(srv.createCommandSourceStack(), c) })
  e3Log('commande ' + c)
}
function e3Cap(nom) {
  Java.loadClass('net.minecraft.client.Screenshot').grab(Client.gameDirectory, 'dh3-' + nom + '.png', Client.getMainRenderTarget(), function (m) {})
  e3Log('capture dh3-' + nom + '.png')
}
function e3Over(v) { e3Cfg().graphics().overdrawPreventionRadius().setValue(java.lang.Float.valueOf(v)); e3Log('overdraw ' + v) }
function e3Nuages(n) {
  var CS = Java.loadClass('net.minecraft.client.CloudStatus')
  Client.options.cloudStatus().set(n == 0 ? CS.OFF : n == 1 ? CS.FAST : CS.FANCY)
  e3Log('nuages vanilla ' + n)
}
var E3_ETAPES = [
  [45, function () { if (Client.player.isDeadOrDying()) Client.player.respawn(); e3Cmd('gamemode spectator @a'); e3Cmd('time set 6000'); e3Cmd('gamerule doDaylightCycle false'); e3Cmd('gamerule doMobSpawning false'); e3Cmd('kill @e[type=!player]') }],
  [10, function () { e3Iris(false); e3Cmd(E3_GROTTE) }],
  // 1) séquence fautive avec le correctif 1.0.11
  [60, function () { e3Log('REPRO-1011 debut'); e3Iris(true) }],
  [40, function () { e3Cfg().graphics().renderingEnabled().setValue(false); e3Log('REPRO-1011 DH coupe') }],
  [30, function () { e3Iris(false) }],
  [20, function () { e3Cfg().graphics().renderingEnabled().setValue(true); e3Log('REPRO-1011 DH rallume shaders eteints') }],
  [20, function () { e3Iris(true); e3Log('REPRO-1011 shaders rallumes : chercher dhProjection apres cette ligne') }],
  [40, function () { e3Cap('A-1011-shader-apres-sequence') }],
  // 2) grotte : distance de non-recouvrement DH, shaders éteints
  [2, function () { e3Iris(false) }],
  [60, function () { e3Cap('B-grotte-overdraw-auto') }],
  [2, function () { e3Over(0.5) }],
  [40, function () { e3Cap('C-grotte-overdraw-0.5') }],
  [2, function () { e3Over(0.8) }],
  [40, function () { e3Cap('D-grotte-overdraw-0.8') }],
  [2, function () { e3Over(1.0) }],
  [40, function () { e3Cap('E-grotte-overdraw-1.0') }],
  [2, function () { e3Cmd('tp @a 2800 140 -950 0 10') }],
  [60, function () { e3Cap('F-surface-overdraw-1.0') }],
  [2, function () { e3Over(-1.0) }],
  [40, function () { e3Cap('G-surface-overdraw-auto') }],
  // 3) ciel de nuit : nuages vanilla FANCY / FAST / OFF (DH et ses nuages actifs)
  [2, function () { e3Cmd('time set 14000'); e3Cmd('tp @a 2800 140 -950 0 -25') }],
  [60, function () { e3Nuages(2) }],
  [10, function () { e3Cap('H-nuit-nuages-fancy') }],
  [2, function () { e3Nuages(1) }],
  [10, function () { e3Cap('I-nuit-nuages-fast') }],
  [2, function () { e3Nuages(0) }],
  [10, function () { e3Cap('J-nuit-nuages-off') }],
  [2, function () { e3Cfg().graphics().renderingEnabled().setValue(false); e3Nuages(2) }],
  [20, function () { e3Cap('K-nuit-nuages-fancy-sans-dh') }],
  [2, function () { e3Cfg().graphics().renderingEnabled().setValue(true) }],
  [5, function () { e3Log('FIN'); JsonIO.write(E3_ETAT, { etat: 'fini' }); e3Fini = true }]
]
ClientEvents.tick(function (event) {
  e3Ticks++
  if (e3Fini || Client.player == null || Client.getSingleplayerServer() == null) return
  if (e3Prochain < 0) e3Prochain = e3Ticks + E3_ETAPES[0][0] * 20
  if (e3Ticks < e3Prochain) return
  try { E3_ETAPES[e3Etape][1]() } catch (e) { e3Log('ERREUR etape ' + e3Etape + ' : ' + e) }
  e3Etape++
  if (e3Etape >= E3_ETAPES.length) { e3Fini = true; return }
  e3Prochain = e3Ticks + E3_ETAPES[e3Etape][0] * 20
  JsonIO.write(E3_ETAT, { etat: 'en_cours', etape: e3Etape })
})
