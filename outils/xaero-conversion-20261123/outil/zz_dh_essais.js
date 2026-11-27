// Atheria - OUTIL (jamais dans le pack) : essais Distant Horizons + Iris sur une copie solo du monde.
// 1) traînées dans la grotte de la capture bêta (4246, -51, -784), avec et sans textures DH, cave culling, DH coupé ;
// 2) reproduction de l'erreur « dh_terrain.vsh ... undefined variable dhProjection » ;
// 3) essai du contournement (shaders allumés pendant que DH est coupé, puis DH rallumé).
// Captures : screenshots/dh-<nom>.png. Journal : logs/kubejs/client.log (lignes [DH-ESSAI]) + logs/latest.log (Iris).
var DE_ETAT = 'kubejs/config/dh_essais_etat.json'
var DE_POINT = 'tp @a 4246 -51 -784 -90 -20'
var deTicks = 0
var deEtape = 0
var deProchain = -1
var deFini = false

function deLog(m) { console.info('[DH-ESSAI] ' + m) }
function deCfg() { return Java.loadClass('com.seibel.distanthorizons.api.DhApi$Delayed').configs }
function deIris(oui) {
  var api = Java.loadClass('net.irisshaders.iris.api.v0.IrisApi').getInstance()
  api.getConfig().setShadersEnabledAndApply(oui)
  deLog('shaders ' + oui + ' -> en usage : ' + api.isShaderPackInUse())
}
function deCmd(c) {
  var srv = Client.getSingleplayerServer()
  srv.execute(function () { srv.getCommands().performPrefixedCommand(srv.createCommandSourceStack(), c) })
  deLog('commande ' + c)
}
function deCapture(nom) {
  Java.loadClass('net.minecraft.client.Screenshot').grab(Client.gameDirectory, 'dh-' + nom + '.png', Client.getMainRenderTarget(), function (msg) {})
  deLog('capture dh-' + nom + '.png')
}

// [secondes à attendre AVANT l'action, action]
var DE_ETAPES = [
  // 24/11 : le joueur était mort à la fin de la passe 1 (tué par les mobs pendant la conversion) -> réapparaître d'abord
  [45, function () { if (Client.player.isDeadOrDying()) { Client.player.respawn(); deLog('reapparition demandee') } else { deLog('joueur vivant') } }],
  [10, function () { Client.setScreen(null); deLog('ecran ferme, vivant=' + !Client.player.isDeadOrDying()) }],
  [10, function () { deCmd('gamemode spectator @a'); deCmd('time set 6000'); deCmd('gamerule doDaylightCycle false'); deCmd('weather clear 99999'); deIris(false) }],
  [5, function () { deCmd(DE_POINT) }],
  [150, function () { deCapture('A-grotte-dh-defaut') }],
  [2, function () { deCfg().graphics().texture().texturesEnabled().setValue(false); deLog('textures DH coupees') }],
  [90, function () { deCapture('B-grotte-sans-textures-dh') }],
  [2, function () { deCfg().graphics().texture().texturesEnabled().setValue(true); deCfg().graphics().caveCullingEnabled().setValue(false); deLog('textures DH remises, cave culling coupe') }],
  [90, function () { deCapture('C-grotte-sans-cave-culling') }],
  [2, function () { deCfg().graphics().caveCullingEnabled().setValue(true); deCfg().graphics().renderingEnabled().setValue(false); deLog('cave culling remis, DH coupe') }],
  [20, function () { deCapture('D-grotte-dh-coupe') }],
  // Reproduction : shaders ON, DH OFF, shaders OFF, DH ON, shaders ON
  [2, function () { deCfg().graphics().renderingEnabled().setValue(true); deLog('DH rallume') }],
  [30, function () { deLog('REPRO debut'); deIris(true) }],
  [40, function () { deCfg().graphics().renderingEnabled().setValue(false); deLog('REPRO DH coupe shaders allumes') }],
  [30, function () { deIris(false) }],
  [20, function () { deCfg().graphics().renderingEnabled().setValue(true); deLog('REPRO DH rallume shaders eteints') }],
  [20, function () { deIris(true); deLog('REPRO shaders rallumes : chercher dhProjection dans latest.log') }],
  [40, function () { deCapture('E-repro-shader') }],
  // Contournement : allumer les shaders pendant que DH est coupé, puis rallumer DH (Iris se recharge avec DH)
  [2, function () { deIris(false) }],
  [15, function () { deCfg().graphics().renderingEnabled().setValue(false); deLog('CONTOURNEMENT DH coupe') }],
  [15, function () { deIris(true) }],
  [40, function () { deCfg().graphics().renderingEnabled().setValue(true); deLog('CONTOURNEMENT DH rallume shaders allumes') }],
  [60, function () { deCapture('F-contournement-shader-dh') }],
  [2, function () { deCmd('tp @a 4246 120 -784 -90 20') }],
  [90, function () { deCapture('G-surface-shader-dh') }],
  [2, function () { deCmd(DE_POINT) }],
  [60, function () { deCapture('H-grotte-shader-dh') }],
  [2, function () { deIris(false); deCmd('time set 13000'); deCmd('tp @a 2800 140 -950 0 -25') }],
  [90, function () { deCapture('I-ciel-nuages-dh-actifs') }],
  [2, function () { deCfg().graphics().genericRendering().cloudRenderingEnabled().setValue(false); deLog('nuages DH coupes') }],
  [30, function () { deCapture('J-ciel-nuages-dh-coupes') }],
  [2, function () { deCmd('time set 6000') }],
  [20, function () { deCapture('K-ciel-jour-nuages-dh-coupes') }],
  [2, function () { deCfg().graphics().genericRendering().cloudRenderingEnabled().setValue(true); deLog('nuages DH remis') }],
  [20, function () { deCapture('L-ciel-jour-nuages-dh-actifs') }],
  [5, function () { deLog('FIN'); JsonIO.write(DE_ETAT, { etat: 'fini' }); deFini = true }]
]

ClientEvents.tick(function (event) {
  deTicks++
  if (deFini || Client.player == null || Client.getSingleplayerServer() == null) return
  if (deProchain < 0) deProchain = deTicks + DE_ETAPES[0][0] * 20
  if (deTicks < deProchain) return
  try {
    DE_ETAPES[deEtape][1]()
  } catch (e) {
    deLog('ERREUR etape ' + deEtape + ' : ' + e)
  }
  deEtape++
  if (deEtape >= DE_ETAPES.length) { deFini = true; return }
  deProchain = deTicks + DE_ETAPES[deEtape][0] * 20
  JsonIO.write(DE_ETAT, { etat: 'en_cours', etape: deEtape })
})
