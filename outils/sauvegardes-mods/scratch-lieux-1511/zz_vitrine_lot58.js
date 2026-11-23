// ================= ESSAI 2 MTS + TRAM A L'ECHELLE (lot58, 11/11) =================
// Retour de Mika : garder seulement les livrees sans ecriture (conteneur CMA CGM permis) ; reduire le tram seulement si ca rend mieux.
// Tram v4 : 3 de large (echelle des modeles MTS, taille reelle), toles de locomotive Steam 'n' Rails, portes coulissantes, pantographe Modern Train Parts.

// ---------------- TRAMWAY v4 (3 caisses, 31 x 3) ----------------
function vhTram4(x, z, dir, coul, y) {
  vhDebut(x, y, z, dir, 31, 3)
  var c = coul || 'light_blue', P = 'railways:' + c + '_plated_locometal', B = 'railways:white_plated_locometal', S = 'railways:white_flat_slashed_locometal'
  var FEN = 'railways:white_two_pane_locometal_window[axis=' + VH.o.AU + ']', A = 'minecraft:air'
  for (var u = -3; u <= 33; u++) vS(u, -1, 1, 'create:track[shape=' + (VH.o.AU == 'x' ? 'xo' : 'zo') + ',turn=false,waterlogged=false]')
  ;[3, 15, 27].forEach(u => vS(u, 0, 1, 'create:small_bogey[axis=' + VH.o.AU + ',waterlogged=false]'))
  var souf = [10, 20], portes = [[4, 'left'], [5, 'right'], [14, 'left'], [15, 'right'], [24, 'left'], [25, 'right']]
  var estPorte = u => portes.some(p => p[0] == u)
  for (var u = 0; u <= 30; u++) {
    if (souf.indexOf(u) >= 0) { vF(u, 1, 0, u, 4, 2, 'minecraft:black_wool'); vF(u, 2, 1, u, 3, 1, A); continue }
    // jupe sombre, bande de couleur, baies vitrees, bandeau blanc, toit
    vF(u, 1, 0, u, 1, 2, 'railways:black_plated_locometal')
    vS2(u, 2, 0, P); vS2(u, 3, 0, FEN); vS2(u, 4, 0, B); vS(u, 4, 1, B)
    vF(u, 2, 1, u, 3, 1, A)
  }
  // portes coulissantes vitrees, des deux cotes
  portes.forEach(p => {
    ;[[0, '{G}'], [2, '{D}']].forEach(f => {
      vS(p[0], 2, f[0], 'railways:' + c + '_sliding_locometal_door[facing=' + f[1] + ',half=lower,hinge=' + p[1] + ',open=false,visible=true,windowed=true]')
      vS(p[0], 3, f[0], 'railways:' + c + '_sliding_locometal_door[facing=' + f[1] + ',half=upper,hinge=' + p[1] + ',open=false,visible=true,windowed=true]')
    })
  })
  // sieges dans chaque caisse
  for (var u = 1; u <= 29; u++) if (!estPorte(u) && souf.indexOf(u) < 0 && u % 2 == 1) vS(u, 2, 1, 'minecraft:warped_stairs[facing={B},half=bottom,shape=straight]')
  // nez avant et arriere : pare-brise sombre sur deux rangs, feux, attelage cache
  ;[[0, 'B', -1], [30, 'F', 31]].forEach(n => {
    var u = n[0]
    vF(u, 2, 0, u, 3, 2, 'minecraft:black_stained_glass'); vS(u, 2, 0, VH3PH); vS(u, 2, 2, VH3PH)
    vF(u, 4, 0, u, 4, 2, 'minecraft:smooth_quartz_stairs[facing={' + n[1] + '},half=bottom,shape=straight]')
    vS(n[2], 1, 1, 'minecraft:polished_blackstone_slab[type=top]')
  })
  // toit : coffres techniques en tole, ventilation, pantographe au centre
  ;[[2, 8], [12, 18], [22, 28]].forEach(t => vF(t[0], 5, 1, t[1], 5, 1, 'railways:white_locometal_vent'))
  vS(15, 6, 1, 'moderntrainparts:pantograph')
}

var MTS_LISTE2 = [
  // orientation : meme bus, quatre angles
  { id: 'svmp.260blank', x: 8, z: 44, yaw: 0 }, { id: 'svmp.260blank', x: 28, z: 44, yaw: 90 }, { id: 'svmp.260blank', x: 48, z: 44, yaw: 180 }, { id: 'svmp.260blank', x: 68, z: 44, yaw: -90 },
  // a cote des deux trams
  { id: 'svmp.260blank', x: 20, z: 22, yaw: -90 },
  // livrees sans ecriture
  { id: 'svmp.transportercwhite', x: 6, z: 60, yaw: -90 }, { id: 'svmp.m939green', x: 20, z: 60, yaw: -90 }, { id: 'svmp.m939tan', x: 36, z: 60, yaw: -90 },
  { id: 'truckpack.volvo', x: 52, z: 60, yaw: -90 }, { id: 'truckpack.scania_4', x: 68, z: 60, yaw: -90 }, { id: 'truckpack.wpricep_conter', x: 86, z: 60, yaw: -90 },
  { id: 'blue_seoul_vehicles.hyundai_megatruck', x: 6, z: 74, yaw: -90 }, { id: 'blue_seoul_vehicles.hyundai_new_county_white', x: 24, z: 74, yaw: -90 },
  { id: 'blue_seoul_vehicles.hyundai_grand_starex_cargo_silver', x: 42, z: 74, yaw: -90 }, { id: 'svmp.transporterpgrey', x: 56, z: 74, yaw: -90 },
  { id: 'svmp.m939white', x: 70, z: 74, yaw: -90 }
]
function vhBancMTS2() {
  OX = VB.X0; OY = VB.Y0; OZ = VB.Z0; CUT = 999; GRAINE = 5801
  for (var x = -10; x <= 110; x++) for (var z = -4; z <= 84; z++) { var r = R(); S(x, -1, z, (z >= 3 && z <= 6) || z == 13 ? 'minecraft:gravel' : r < 0.9 ? 'minecraft:black_concrete' : 'minecraft:gray_concrete') }
  F(-10, 0, -4, 110, 30, 84, 'minecraft:air')
  vhTram3(10, 3, 'x'); vhTram4(12, 12, 'x')
}
BANC_MTS = function (server, lvl) {
  var FPF = Java.loadClass('net.neoforged.neoforge.common.util.FakePlayerFactory'), REG = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
  var RL = Java.loadClass('net.minecraft.resources.ResourceLocation'), IS = Java.loadClass('net.minecraft.world.item.ItemStack'), H = Java.loadClass('net.minecraft.world.InteractionHand')
  var BHR = Java.loadClass('net.minecraft.world.phys.BlockHitResult'), V3 = Java.loadClass('net.minecraft.world.phys.Vec3'), DIR = Java.loadClass('net.minecraft.core.Direction')
  var BP = Java.loadClass('net.minecraft.core.BlockPos'), UOC = Java.loadClass('net.minecraft.world.item.context.UseOnContext')
  var fp = FPF.getMinecraft(lvl)
  MTS_LISTE2.forEach(m => {
    try {
      var rl = RL.parse('mts:' + m.id)
      if (!REG.ITEM.containsKey(rl)) { vlog('MTS ABSENT ' + m.id); return }
      var st = new IS(REG.ITEM.get(rl)); fp.setItemInHand(H.MAIN_HAND, st)
      var x = VB.X0 + m.x, y = VB.Y0, z = VB.Z0 + m.z
      fp.absMoveTo(x + 0.5, y, z + 0.5, m.yaw, 0)
      var lu = 'x'; try { lu = fp.getYRot() } catch (e1) { try { lu = fp.YRot } catch (e2) { } }
      var r = st.useOn(new UOC(fp, H.MAIN_HAND, new BHR(new V3(x + 0.5, y, z + 0.5), DIR.UP, new BP(x, y - 1, z), false)))
      vlog('MTS ' + m.id + ' yaw ' + m.yaw + ' lu ' + lu + ' -> ' + r)
    } catch (e) { vlog('MTS ECHEC ' + m.id + ' : ' + e) }
  })
  server.scheduleInTicks(100, () => server.runCommandSilent('save-all flush'))
}
var QFIN_MTS2 = function () { HM = {}; lot(vhBancMTS2, 0, 0, 999, 5801, 110, 20) }
function vuesMTS2() {
  vue('m2_trams_flanc', 0, 0, 26, 4, 30, 26, 2, 8)
  vue('m2_trams_avant', 0, 0, 52, 5, 22, 40, 2, 8)
  vue('m2_tram4_detail', 0, 0, 22, 4, 17, 18, 2, 12)
  vue('m2_tram_bus_haut', 0, 0, 30, 16, 34, 30, 0, 12)
  vue('m2_orientation', 0, 0, 38, 30, 30, 38, 0, 45)
  vue('m2_livrees_1', 0, 0, 46, 6, 52, 40, 1, 60)
  vue('m2_livrees_1b', 0, 0, 90, 6, 52, 80, 1, 60)
  vue('m2_livrees_2', 0, 0, 40, 6, 66, 36, 1, 74)
  vue('m2_livrees_2b', 0, 0, 82, 6, 66, 66, 1, 74)
}
