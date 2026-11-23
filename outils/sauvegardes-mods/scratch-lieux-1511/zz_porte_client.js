// TEMPORAIRE : ouvre une porte en vrai et capture image par image
var ZQ = { n: 0 }
ClientEvents.tick(event => {
  var mc = Client
  if (!mc.player) return
  mc.options.pauseOnLostFocus = false
  ZQ.n++
  if (ZQ.n == 20) mc.getWindow().setWindowed(1600, 900)
  var Iris = Java.loadClass('net.irisshaders.iris.api.v0.IrisApi')
  if (ZQ.n < 500) return
  var phase = ZQ.n - 500
  var cap = nom => Java.loadClass('net.minecraft.client.Screenshot').grab(mc.gameDirectory, 'pt-' + nom + '.png', mc.getMainRenderTarget(), c => {})
  var BlockPos = Java.loadClass('net.minecraft.core.BlockPos'), Hit = Java.loadClass('net.minecraft.world.phys.BlockHitResult'), Vec3 = Java.loadClass('net.minecraft.world.phys.Vec3'), Dir = Java.loadClass('net.minecraft.core.Direction'), Hand = Java.loadClass('net.minecraft.world.InteractionHand')
  var clic = (x, y, z) => { mc.gameMode.useItemOn(mc.player, Hand.MAIN_HAND, new Hit(new Vec3(x + 0.5, y + 0.5, z + 0.5), Dir.SOUTH, new BlockPos(x, y, z), false)) }
  try {
    if (phase == 0) { ZQ.px = Math.floor(mc.player.getX()); ZQ.py = Math.floor(mc.player.getY()); ZQ.pz = Math.floor(mc.player.getZ()); console.info('[TPORTE] joueur ' + ZQ.px + ' ' + ZQ.py + ' ' + ZQ.pz); cap('a0') }
    // Porte double droite : Double Doors doit ouvrir aussi la gauche
    if (phase == 10) clic(ZQ.px, ZQ.py, ZQ.pz - 3)
    if (phase >= 11 && phase <= 18) cap('b' + (phase - 11))
    if (phase == 60) cap('c-ouverte')
    if (phase == 70) clic(ZQ.px, ZQ.py, ZQ.pz - 3)
    if (phase >= 72 && phase <= 76) cap('d' + (phase - 72))
    if (phase == 120) { cap('e-fermee'); var liste = ''; mc.level.entitiesForRendering().forEach(e => { if (e != mc.player && e.distanceToSqr(mc.player) < 100) liste += ' ' + e.getType() + '@' + e.blockPosition() }); console.info('[TPORTE] entites client:' + liste + ' | particules ' + mc.particleEngine.countParticles()) }
    if (phase == 125) Iris.getInstance().getConfig().setShadersEnabledAndApply(true)
    if (phase == 700) clic(ZQ.px + 2, ZQ.py, ZQ.pz - 3)
    if (phase >= 702 && phase <= 706) cap('f' + (phase - 702))
    if (phase == 760) { cap('g-shader-ouverte'); Iris.getInstance().getConfig().setShadersEnabledAndApply(false) }
    if (phase == 800) console.info('[TEST BUGS] fin')
  } catch (e) { console.error('[TPORTE] ' + e); console.info('[TEST BUGS] fin') }
})
