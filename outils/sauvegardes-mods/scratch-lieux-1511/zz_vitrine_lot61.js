// ================= BUS ET CAMION MTS STYLE MINECRAFT (lot61, 11/11) : moteur cache, passages de roue, calandre chromee =================
var MTS_BC = [{ id: 'atheriavh.bus_bleu', x: 10, z: 8, yaw: 0 }, { id: 'atheriavh.camion_vert', x: 30, z: 8, yaw: 0 }, { id: 'atheriavh.ambulance_blanc', x: 44, z: 8, yaw: 0 },
  { id: 'atheriavh.bus_jaune', x: 12, z: 2, yaw: 180 }, { id: 'atheriavh.camion_gris', x: 32, z: 2, yaw: 180 }]
function vhBancBC() {
  OX = VB.X0; OY = VB.Y0; OZ = VB.Z0; CUT = 999; GRAINE = 6101
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
  MTS_BC.forEach(m => {
    try {
      var st = new IS(REG.ITEM.get(RL.parse('mts:' + m.id))); fp.setItemInHand(H.MAIN_HAND, st)
      var x = VB.X0 + m.x, y = VB.Y0, z = VB.Z0 + m.z
      fp.absMoveTo(x + 0.5, y, z + 0.5, m.yaw, 0)
      vlog('MTS ' + m.id + ' -> ' + st.useOn(new UOC(fp, H.MAIN_HAND, new BHR(new V3(x + 0.5, y, z + 0.5), DIR.UP, new BP(x, y - 1, z), false))))
    } catch (e) { vlog('MTS ECHEC ' + m.id + ' : ' + e) }
  })
}
var QFIN_BC = function () { HM = {}; lot(vhBancBC, 0, 0, 999, 6101, 60, 20) }
function vuesBC() {
  vue('b_bus_avant34', 0, 0, 20, 3, 13, 11, 1, 8)
  vue('b_bus_flanc', 0, 0, 10, 3, 15, 10, 1, 8)
  vue('b_bus_arriere34', 0, 0, -2, 3, 11, 6, 1, 8)
  vue('b_bus_porte', 0, 0, 12, 2, -3, 10, 1, 2)
  vue('b_cam_avant34', 0, 0, 37, 3, 13, 31, 1, 8)
  vue('b_cam_flanc', 0, 0, 30, 3, 15, 30, 1, 8)
  vue('b_cam_arriere34', 0, 0, 23, 3, 12, 27, 1, 8)
  vue('b_cam_gris', 0, 0, 30, 3, -4, 32, 1, 2)
  vue('b_ensemble', 0, 0, 52, 6, 16, 28, 0, 6)
}
