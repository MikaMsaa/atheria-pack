// TEMPORAIRE : capture a chaque teleportation et clics reels pour les essais d'objets
var ZK = { n: 0, dx: 0, dy: 0, dz: 0, attente: -1, num: 0, clicAttente: 0, essai: 0, nomBrume: 0 }
function zkLog(m) { console.info('[TCLI] ' + m) }
ClientEvents.tick(event => {
  var mc = Client
  if (!mc.player) return
  mc.options.pauseOnLostFocus = false
  ZK.n++
  if (ZK.n == 20) { mc.getWindow().setWindowed(1600, 900); mc.options.hideGui = true }
  var p = mc.player
  if (p.isCreative() && !p.getAbilities().flying) { p.getAbilities().flying = true; p.onUpdateAbilities() }
  var d = Math.abs(p.getX() - ZK.dx) + Math.abs(p.getZ() - ZK.dz) + Math.abs(p.getY() - ZK.dy)
  if (d > 40) { ZK.attente = 680; ZK.dx = p.getX(); ZK.dy = p.getY(); ZK.dz = p.getZ() }
  if (ZK.attente > 0) {
    ZK.attente--
    if (ZK.attente == 0) {
      ZK.num++
      var cle = mc.level.getBiome(p.blockPosition()).unwrapKey()
      zkLog('capture ' + ZK.num + ' biome=' + (cle.isPresent() ? cle.get().location() : '?') + ' fps=' + mc.getFps() + ' pos=' + Math.floor(p.getX()) + ' ' + Math.floor(p.getY()) + ' ' + Math.floor(p.getZ()) + ' brume=' + (typeof ATHERIA_BRUME != 'undefined' ? ATHERIA_BRUME.valeur.toFixed(2) : '?'))
      Java.loadClass('net.minecraft.client.Screenshot').grab(mc.gameDirectory, 'ct-' + (ZK.num < 10 ? '0' : '') + ZK.num + '.png', mc.getMainRenderTarget(), c => {})
    }
  }
  // Essais d'objets : declenches quand l'objet attendu arrive dans la main
  var main = '' + p.getMainHandItem().getItem()
  var BP = Java.loadClass('net.minecraft.core.BlockPos'), Hit = Java.loadClass('net.minecraft.world.phys.BlockHitResult'), Vec3 = Java.loadClass('net.minecraft.world.phys.Vec3'), Dir = Java.loadClass('net.minecraft.core.Direction'), Hand = Java.loadClass('net.minecraft.world.InteractionHand')
  if (ZK.clicAttente > 0) { ZK.clicAttente--; return }
  try {
    var X = Math.floor(p.getX()), Y = Math.floor(p.getY()), Z = Math.floor(p.getZ())
    if (main.indexOf('kit_siphon') >= 0 && ZK.essai == 0) {
      ZK.essai = 1; ZK.clicAttente = 20
      var r = mc.gameMode.useItemOn(p, Hand.MAIN_HAND, new Hit(new Vec3(X + 0.5, Y + 0.5, Z - 1), Dir.SOUTH, new BP(X, Y, Z - 2), false))
      zkLog('clic siphon -> ' + r)
    } else if (main.indexOf('quad') >= 0 && ZK.essai == 1) {
      ZK.essai = 2; ZK.clicAttente = 20
      var r2 = mc.gameMode.useItemOn(p, Hand.MAIN_HAND, new Hit(new Vec3(X + 0.5, Y, Z + 3.5), Dir.UP, new BP(X, Y - 1, Z + 3), false))
      zkLog('pose quad ' + main + ' -> ' + r2)
    } else if (main.indexOf('bidon_essence') >= 0 && ZK.essai == 2) {
      ZK.essai = 3; ZK.clicAttente = 20
      zkLog('clic bidon -> ' + mc.gameMode.useItem(p, Hand.MAIN_HAND))
    } else if (main.indexOf('pieces_vehicule') >= 0 && ZK.essai == 3) {
      ZK.essai = 4; ZK.clicAttente = 20
      zkLog('clic pieces -> ' + mc.gameMode.useItem(p, Hand.MAIN_HAND))
    } else if (main.indexOf('carte_routiere') >= 0 && ZK.essai == 4) {
      ZK.essai = 5; ZK.clicAttente = 30
      zkLog('clic carte -> ' + mc.gameMode.useItem(p, Hand.MAIN_HAND))
    } else if (main.indexOf('radio_portative') >= 0 && ZK.essai == 5) {
      ZK.essai = 6; ZK.clicAttente = 15
      mc.options.keyShift.setDown(true)
    } else if (ZK.essai == 6) {
      ZK.essai = 7; ZK.clicAttente = 40
      zkLog('crouch client ' + p.isCrouching() + ' clic radio -> ' + mc.gameMode.useItem(p, Hand.MAIN_HAND))
    } else if (ZK.essai == 7) {
      ZK.essai = 8
      mc.options.keyShift.setDown(false)
      var km = mc.options.keyMappings, cl = []
      for (var ki = 0; ki < km.length; ki++) if (('' + km[ki].saveString()) == 'key.keyboard.k') cl.push('' + km[ki].getName())
      zkLog('touche K : ' + cl.join(', '))
    }
  } catch (e) { zkLog('erreur ' + e) }
})
