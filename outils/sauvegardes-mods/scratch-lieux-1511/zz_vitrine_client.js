// TEMPORAIRE : capture apres chaque teleportation de la camera (batiments temoins)
var ZV = { n: 0, dx: 0, dy: 0, dz: 0, att: -1, num: 0 }
ClientEvents.tick(event => {
  var mc = Client
  if (!mc.player) return
  mc.options.pauseOnLostFocus = false
  ZV.n++
  if (ZV.n == 20) { mc.getWindow().setWindowed(1600, 900); mc.options.hideGui = true; mc.options.fov().set(80) }
  var p = mc.player
  var d = Math.abs(p.getX() - ZV.dx) + Math.abs(p.getY() - ZV.dy) + Math.abs(p.getZ() - ZV.dz)
  if (d > 0.3) { ZV.att = 160; ZV.dx = p.getX(); ZV.dy = p.getY(); ZV.dz = p.getZ() }
  if (ZV.att > 0) {
    ZV.att--
    if (ZV.att == 0) {
      ZV.num++
      console.info('[VCLI] capture ' + ZV.num + ' pos=' + Math.floor(p.getX()) + ' ' + Math.floor(p.getY() + 1.62) + ' ' + Math.floor(p.getZ()) + ' fps=' + mc.getFps())
      Java.loadClass('net.minecraft.client.Screenshot').grab(mc.gameDirectory, 'vit-' + (ZV.num < 10 ? '0' : '') + ZV.num + '.png', mc.getMainRenderTarget(), c => {})
    }
  }
})
