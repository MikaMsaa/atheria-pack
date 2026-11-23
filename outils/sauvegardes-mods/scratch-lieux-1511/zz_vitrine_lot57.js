// ================= ESSAI DE VEHICULES MTS (lot57, 11/11) =================
// Retour de Mika : bus, ambulance et camion en blocs plus grands que le tram et sans blocs moddes. Carte blanche pour chercher en ligne.
// Packs essayes (instance de test seulement) : Blue Seoul Vehicles 6.1, SVMP 3.7.3, Truckers Pack 0.5.
// Les vehicules sont poses comme par un joueur : un faux joueur utilise l'objet du vehicule sur le sol (pieces par defaut comprises).
var MTS_LISTE = [
  // rang 1 : a cote du tram pour comparer les echelles
  { id: 'blue_seoul_vehicles.hyundai_nsac_blue', x: 12, z: 10, yaw: -90 },
  { id: 'svmp.260blank', x: 50, z: 10, yaw: -90 },
  // rang 2 : bus et minibus
  { id: 'blue_seoul_vehicles.hyundai_eleccity_green', x: 8, z: 20, yaw: -90 },
  { id: 'blue_seoul_vehicles.hyundai_universe_prime', x: 34, z: 20, yaw: -90 },
  { id: 'blue_seoul_vehicles.hyundai_new_county_white', x: 60, z: 20, yaw: -90 },
  { id: 'blue_seoul_vehicles.hyundai_new_county_transit', x: 80, z: 20, yaw: -90 },
  // rang 3 : ambulance, fourgons, camions
  { id: 'blue_seoul_vehicles.hyundai_grand_starex_119', x: 8, z: 32, yaw: -90 },
  { id: 'blue_seoul_vehicles.hyundai_grand_starex_cargo_silver', x: 24, z: 32, yaw: -90 },
  { id: 'blue_seoul_vehicles.hyundai_megatruck', x: 40, z: 32, yaw: -90 },
  { id: 'blue_seoul_vehicles.hyundai_megatruck_hightop', x: 60, z: 32, yaw: -90 },
  { id: 'svmp.m939green', x: 80, z: 32, yaw: -90 },
  { id: 'svmp.m939tan', x: 100, z: 32, yaw: -90 },
  // rang 4 : tracteurs routiers et remorque
  { id: 'truckpack.volvo', x: 8, z: 44, yaw: -90 },
  { id: 'truckpack.scania_2', x: 30, z: 44, yaw: -90 },
  { id: 'truckpack.daf105xfobj_4', x: 52, z: 44, yaw: -90 },
  { id: 'truckpack.wpricep_conter', x: 76, z: 44, yaw: -90 },
  { id: 'svmp.transporterpcreekwoodambulance', x: 100, z: 44, yaw: -90 }
]
function vhBancMTS() {
  OX = VB.X0; OY = VB.Y0; OZ = VB.Z0; CUT = 999; GRAINE = 5701
  for (var x = -10; x <= 125; x++) for (var z = -4; z <= 56; z++) { var r = R(); S(x, -1, z, (z >= 3 && z <= 6) ? 'minecraft:gravel' : r < 0.9 ? 'minecraft:black_concrete' : 'minecraft:gray_concrete') }
  F(-10, 0, -4, 125, 30, 56, 'minecraft:air')
  vhTram3(10, 3, 'x')
}
var BANC_MTS = function (server, lvl) {
  var FPF = Java.loadClass('net.neoforged.neoforge.common.util.FakePlayerFactory'), REG = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
  var RL = Java.loadClass('net.minecraft.resources.ResourceLocation'), IS = Java.loadClass('net.minecraft.world.item.ItemStack'), H = Java.loadClass('net.minecraft.world.InteractionHand')
  var BHR = Java.loadClass('net.minecraft.world.phys.BlockHitResult'), V3 = Java.loadClass('net.minecraft.world.phys.Vec3'), DIR = Java.loadClass('net.minecraft.core.Direction')
  var BP = Java.loadClass('net.minecraft.core.BlockPos'), UOC = Java.loadClass('net.minecraft.world.item.context.UseOnContext')
  var fp = FPF.getMinecraft(lvl)
  MTS_LISTE.forEach(m => {
    try {
      var rl = RL.parse('mts:' + m.id)
      if (!REG.ITEM.containsKey(rl)) { vlog('MTS ABSENT ' + m.id); return }
      var st = new IS(REG.ITEM.get(rl)); fp.setItemInHand(H.MAIN_HAND, st)
      var x = VB.X0 + m.x, y = VB.Y0, z = VB.Z0 + m.z
      fp.setPos(x + 0.5, y, z + 0.5)
      var ok = []
      try { fp.yRot = m.yaw; ok.push('prop') } catch (e1) { }
      try { fp.absMoveTo(x + 0.5, y, z + 0.5, m.yaw, 0); ok.push('abs') } catch (e2) { }
      try { var JF = Java.loadClass('java.lang.Float'); fp.moveTo(x + 0.5, y, z + 0.5, JF.valueOf(m.yaw), JF.valueOf(0)); ok.push('moveF') } catch (e3) { }
      try { fp.getYRot(); ok.push('yaw=' + fp.getYRot()) } catch (e4) { try { ok.push('yaw2=' + fp.yRot) } catch (e5) { } }
      vlog('MTS rotation ' + ok.join(','))
      var r = st.useOn(new UOC(fp, H.MAIN_HAND, new BHR(new V3(x + 0.5, y, z + 0.5), DIR.UP, new BP(x, y - 1, z), false)))
      vlog('MTS ' + m.id + ' -> ' + r)
    } catch (e) { vlog('MTS ECHEC ' + m.id + ' : ' + e) }
  })
  server.scheduleInTicks(100, () => {
    vlog('MTS entites : ' + server.runCommandSilent('execute if entity @e[type=mts:builder_existing]'))
    server.runCommandSilent('save-all flush')
  })
}
var QFIN_MTS = function () { HM = {}; lot(vhBancMTS, 0, 0, 999, 5701, 125, 20) }
function vuesMTS() {
  vue('mts_tram_bus', 0, 0, 30, 4, -8, 30, 2, 8)
  vue('mts_tram_bus_haut', 0, 0, 2, 14, -10, 30, 0, 10)
  vue('mts_bus_avant', 0, 0, 52, 4, 26, 30, 2, 20)
  vue('mts_bus_flanc', 0, 0, 40, 5, 12, 40, 2, 22)
  vue('mts_ambulance', 0, 0, 2, 4, 26, 10, 2, 32)
  vue('mts_ambulance_flanc', 0, 0, 12, 4, 25, 12, 2, 32)
  vue('mts_camions', 0, 0, 34, 5, 26, 50, 2, 33)
  vue('mts_m939', 0, 0, 100, 5, 25, 86, 2, 33)
  vue('mts_tracteurs', 0, 0, 40, 6, 36, 25, 2, 45)
  vue('mts_remorque', 0, 0, 95, 6, 38, 80, 2, 45)
  vue('mts_ambulance_vw', 0, 0, 112, 4, 40, 100, 2, 44)
  vue('mts_ensemble', 0, 0, 55, 30, -14, 55, 0, 30)
}
