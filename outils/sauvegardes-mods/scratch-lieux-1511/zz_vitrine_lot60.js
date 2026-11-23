// ================= AMBULANCE MTS v2 (lot60, 11/11) : moteur cache, passages de roue, calandre chromee =================
var MTS_AMB = [{ id: 'atheriavh.ambulance_blanc', x: 10, z: 8, yaw: 0 }, { id: 'atheriavh.ambulance_blanc', x: 26, z: 8, yaw: 180 }]
function vhBancAmb() {
  OX = VB.X0; OY = VB.Y0; OZ = VB.Z0; CUT = 999; GRAINE = 6001
  for (var x = -10; x <= 45; x++) for (var z = -6; z <= 24; z++) { var r = R(); S(x, -1, z, z == 14 ? 'minecraft:white_concrete' : r < 0.9 ? 'minecraft:black_concrete' : 'minecraft:gray_concrete') }
  F(-10, 0, -6, 45, 30, 24, 'minecraft:air')
  for (var x = -10; x <= 45; x++) for (var z = 16; z <= 24; z++) S(x, -1, z, 'minecraft:smooth_stone')
  F(0, 0, 20, 12, 5, 23, 'minecraft:bricks'); F(1, 1, 20, 11, 4, 20, 'minecraft:glass_pane')
}
BANC_MTS = function (server, lvl) {
  var FPF = Java.loadClass('net.neoforged.neoforge.common.util.FakePlayerFactory'), REG = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
  var RL = Java.loadClass('net.minecraft.resources.ResourceLocation'), IS = Java.loadClass('net.minecraft.world.item.ItemStack'), H = Java.loadClass('net.minecraft.world.InteractionHand')
  var BHR = Java.loadClass('net.minecraft.world.phys.BlockHitResult'), V3 = Java.loadClass('net.minecraft.world.phys.Vec3'), DIR = Java.loadClass('net.minecraft.core.Direction')
  var BP = Java.loadClass('net.minecraft.core.BlockPos'), UOC = Java.loadClass('net.minecraft.world.item.context.UseOnContext')
  var fp = FPF.getMinecraft(lvl)
  MTS_AMB.forEach(m => {
    try {
      var st = new IS(REG.ITEM.get(RL.parse('mts:' + m.id))); fp.setItemInHand(H.MAIN_HAND, st)
      var x = VB.X0 + m.x, y = VB.Y0, z = VB.Z0 + m.z
      fp.absMoveTo(x + 0.5, y, z + 0.5, m.yaw, 0)
      vlog('MTS ' + m.id + ' -> ' + st.useOn(new UOC(fp, H.MAIN_HAND, new BHR(new V3(x + 0.5, y, z + 0.5), DIR.UP, new BP(x, y - 1, z), false))))
    } catch (e) { vlog('MTS ECHEC ' + m.id + ' : ' + e) }
  })
}
var QFIN_AMB = function () { HM = {}; lot(vhBancAmb, 0, 0, 999, 6001, 45, 20) }
function vuesAmb() {
  vue('a_avant34', 0, 0, 15, 2, 5, 11, 1, 8)
  vue('a_capot', 0, 0, 16, 3, 9, 12, 1, 8)
  vue('a_flanc_g', 0, 0, 10, 2, 3, 10, 1, 8)
  vue('a_arriere34', 0, 0, 4, 2, 11, 9, 1, 8)
  vue('a_flanc_d', 0, 0, 26, 2, 13, 26, 1, 8)
  vue('a_rue', 0, 0, 34, 2, 12, 16, 1, 8)
}
