// TEMPORAIRE : nuit avec et sans shader, ville puis grotte
var ZD = { n: 0, stable: 0, x: 0, z: 0, lieu: 0 }
ClientEvents.tick(event => {
  var mc = Client
  if (!mc.player) return
  mc.options.pauseOnLostFocus = false
  ZD.n++
  if (ZD.n == 20) mc.getWindow().setWindowed(1600, 900)
  var cap = nom => Java.loadClass('net.minecraft.client.Screenshot').grab(mc.gameDirectory, 'nt-' + ZD.lieu + nom + '.png', mc.getMainRenderTarget(), c => {})
  var Iris = Java.loadClass('net.irisshaders.iris.api.v0.IrisApi')
  try {
    if (ZD.lieu < 2 && mc.level.getDayTime() % 24000 < 13000) return
    var dx = Math.abs(mc.player.getX() - ZD.x) + Math.abs(mc.player.getZ() - ZD.z) + Math.abs(mc.player.getY() - (ZD.y || 0))
    if (dx > 2) { ZD.stable = 0; ZD.x = mc.player.getX(); ZD.z = mc.player.getZ(); ZD.y = mc.player.getY(); return }
    ZD.stable++
    var t = ZD.stable
    if (t == 600) { console.info('[T35] sans, actif=' + Iris.getInstance().isShaderPackInUse() + ' y=' + mc.player.getY()); cap('a-sans') }
    if (t == 620) Iris.getInstance().getConfig().setShadersEnabledAndApply(true)
    if (t == 1200) { console.info('[T35] avec, actif=' + Iris.getInstance().isShaderPackInUse()); cap('b-avec') }
    if (t == 1220) { Iris.getInstance().getConfig().setShadersEnabledAndApply(false); ZD.lieu++ }
    if (t == 1260 && ZD.lieu >= 4) console.info('[TEST BUGS] fin')
  } catch (e) { console.error('[T35] ' + e); console.info('[TEST BUGS] fin') }
})