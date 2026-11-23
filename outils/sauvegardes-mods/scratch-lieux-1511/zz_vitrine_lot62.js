// ================= VOITURES MTS STYLE MINECRAFT (lot62, 11/11) : moteur cache, passages de roue, calandre chromee =================
var MTS_VO = [{ id: 'atheriavh.berline_rouge', x: 6, z: 8, yaw: 0 }, { id: 'atheriavh.berline_bleu', x: 13, z: 8, yaw: 0 }, { id: 'atheriavh.berline_blanc', x: 20, z: 8, yaw: 0 }, { id: 'atheriavh.berline_rouille', x: 27, z: 8, yaw: 0 }, { id: 'atheriavh.berline_brulee', x: 34, z: 8, yaw: 0 }, { id: 'atheriavh.pickup_vert', x: 6, z: 2, yaw: 0 }, { id: 'atheriavh.pickup_rouille', x: 13, z: 2, yaw: 0 }, { id: 'atheriavh.fourgon_blanc', x: 20, z: 2, yaw: 0 }, { id: 'atheriavh.fourgon_jaune', x: 27, z: 2, yaw: 0 }, { id: 'atheriavh.fourgon_brulee', x: 34, z: 2, yaw: 0 }]
function vhBancVO() {
  OX = VB.X0; OY = VB.Y0; OZ = VB.Z0; CUT = 999; GRAINE = 6201
  for (var x = -10; x <= 60; x++) for (var z = -6; z <= 24; z++) { var r = R(); S(x, -1, z, z == 14 ? 'minecraft:white_concrete' : r < 0.9 ? 'minecraft:black_concrete' : 'minecraft:gray_concrete') }
  F(-10, 0, -6, 60, 30, 24, 'minecraft:air')
  for (var x = -10; x <= 60; x++) for (var z = 16; z <= 24; z++) S(x, -1, z, 'minecraft:smooth_stone')
  F(0, 0, 20, 12, 5, 23, 'minecraft:bricks'); F(1, 1, 20, 11, 4, 20, 'minecraft:glass_pane')
}
BANC_MTS = function (server, lvl) {
  var FPF = Java.loadClass('net.neoforged.neoforge.common.util.FakePlayerFactory'), REG = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
  var RL = Java.loadClass('net.minecraft.resources.ResourceLocation'), IS = Java.loadClass('net.minecraft.world.item.ItemStack'), H = Java.loadClass('net.minecraft.world.InteractionHand')
  var BHR = Java.loadClass('net.minecraft.world.phys.BlockHitResult'), V3 = Java.loadClass('net.minecraft.world.phys.Vec3'), DIR = Java.loadClass('net.minecraft.core.Direction')
  var BP = Java.loadClass('net.minecraft.core.BlockPos'), UOC = Java.loadClass('net.minecraft.world.item.context.UseOnContext')
  var fp = FPF.getMinecraft(lvl)
  MTS_VO.forEach(m => {
    try {
      var st = new IS(REG.ITEM.get(RL.parse('mts:' + m.id))); fp.setItemInHand(H.MAIN_HAND, st)
      var x = VB.X0 + m.x, y = VB.Y0, z = VB.Z0 + m.z
      fp.absMoveTo(x + 0.5, y, z + 0.5, m.yaw, 0)
      vlog('MTS ' + m.id + ' -> ' + st.useOn(new UOC(fp, H.MAIN_HAND, new BHR(new V3(x + 0.5, y, z + 0.5), DIR.UP, new BP(x, y - 1, z), false))))
    } catch (e) { vlog('MTS ECHEC ' + m.id + ' : ' + e) }
  })
}
var QFIN_VO = function () { HM = {}; lot(vhBancVO, 0, 0, 999, 6201, 60, 20) }
function vuesVO() {
  vue('c_berlines_34', 0, 0, 38, 3, 13, 22, 0, 8)
  vue('c_berline_rouge', 0, 0, 10, 2, 11, 6, 0, 8)
  vue('c_berline_flanc', 0, 0, 13, 2, 12, 13, 0, 8)
  vue('c_rouille_brulee', 0, 0, 37, 2, 12, 31, 0, 8)
  vue('c_pickup', 0, 0, 10, 2, -3, 6, 0, 2)
  vue('c_fourgons', 0, 0, 30, 2, -4, 24, 0, 2)
  vue('c_arriere', 0, 0, -2, 2, 5, 8, 0, 5)
  vue('c_ensemble', 0, 0, 20, 8, 18, 20, 0, 5)
}
