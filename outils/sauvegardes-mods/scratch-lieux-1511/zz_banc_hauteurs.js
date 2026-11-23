
// ================= BANC : hauteur reelle de chaque bloc Macaw's Paths (forme de rendu et de collision) =================
function bancH() {
  var RG = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries'), EG = Java.loadClass('net.minecraft.world.level.EmptyBlockGetter'), BP = Java.loadClass('net.minecraft.core.BlockPos'), AX = Java.loadClass('net.minecraft.core.Direction$Axis')
  var out = []
  RG.BLOCK.keySet().forEach(k => {
    var id = '' + k; if (id.indexOf('mcwpaths:') != 0) return
    var st = RG.BLOCK.get(k).defaultBlockState(), sh = st.getShape(EG.INSTANCE, BP.ZERO), co = st.getCollisionShape(EG.INSTANCE, BP.ZERO)
    var h = sh.isEmpty() ? 0 : sh.max(AX.Y), hc = co.isEmpty() ? 0 : co.max(AX.Y)
    out.push(id.substring(9) + '=' + Math.round(h * 16) + '/' + Math.round(hc * 16))
  })
  for (var i = 0; i < out.length; i += 40) vlog('HAUTEURS ' + out.slice(i, i + 40).join(' '))
  F(0, -1, 0, 3, -1, 3, 'minecraft:stone')
}
var BANC_FN = function () { lot(bancH, 0, 0, 999, 7, 32, 4) }
var BANC_VUES = function () { vue('bh', 0, 0, 2, 3, 6, 2, 0, 2) }
