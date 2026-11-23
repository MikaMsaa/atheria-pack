
// ---- export vers Lost Cities : chaque lot final (cut 999) est relu bloc par bloc et ecrit dans le journal ----
// lignes : [EXP] L id graine x z w d h / [EXP] P id n etat / [EXP] S id y donnees (indices separes par des virgules, n*k = k fois n)
var EXPORT = false, EXP_SRV = null
ServerEvents.tick(function (e) { EXP_SRV = e.server })
lot = function (fn, dx, dz, cut, graine, w, h) {
  if (EXPORT && cut != 999) return
  VB.lots.push({ x: VB.X0 + dx, z: VB.Z0 + dz, w: w || 16, h: h || 23, cut: cut, graine: graine })
  OX = VB.X0 + dx; OY = VB.Y0; OZ = VB.Z0 + dz; CUT = cut; GRAINE = graine; fn()
}
function expEtat(st) {
  var s = '' + st, m = s.match(/^Block\{([^}]+)\}(\[.*\])?$/)
  return m ? m[1] + (m[2] || '') : s
}
function exporterLots() {
  var lvl = EXP_SRV.overworld(), BP = Java.loadClass('net.minecraft.core.BlockPos')
  for (var i = 0; i < VB.lots.length; i++) {
    var L = VB.lots[i]; if (L.cut != 999) continue
    var W = L.w, D = L.d || (L.w == 64 ? 32 : L.w), H = L.h + 8, pal = {}, np = 0, y0 = VB.Y0 - 1
    var hors = 0
    if (L.w == 64) for (var x = L.x; x < L.x + 64; x++) for (var z = L.z + 32; z < L.z + 48; z++) for (var y = VB.Y0; y < VB.Y0 + 20; y++) if (!lvl.getBlockState(new BP(x, y, z)).isAir()) hors++
    vlog('EXP lot ' + i + ' graine ' + L.graine + ' hors emprise ' + hors)
    console.info('[EXP] L ' + i + ' ' + L.graine + ' ' + L.x + ' ' + L.z + ' ' + W + ' ' + D + ' ' + H)
    for (var y = y0; y < y0 + H; y++) {
      var out = [], prev = -1, run = 0
      for (var z = L.z; z < L.z + D; z++) for (var x = L.x; x < L.x + W; x++) {
        var e = expEtat(lvl.getBlockState(new BP(x, y, z)))
        if (pal[e] === undefined) { pal[e] = np; console.info('[EXP] P ' + i + ' ' + np + ' ' + e); np++ }
        var k = pal[e]
        if (k == prev) run++; else { if (prev >= 0) out.push(run > 1 ? prev + '*' + run : '' + prev); prev = k; run = 1 }
      }
      out.push(run > 1 ? prev + '*' + run : '' + prev)
      console.info('[EXP] S ' + i + ' ' + (y - y0) + ' ' + out.join(','))
    }
    vlog('EXP lot ' + i + ' fini, ' + np + ' etats')
  }
  vlog('EXP termine')
}
