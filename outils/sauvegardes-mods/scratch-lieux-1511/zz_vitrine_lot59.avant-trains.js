// ================= RAILS EN 3 BLOCS + VEHICULES STYLE MINECRAFT (lot59, 11/11) =================
// Retour de Mika : tram de 3 blocs valide, refaire train et metro pareil ; chercher des vehicules au style du pack MTS officiel.
// voie : rail Create au niveau du sol, ballast en demi-dalles de part et d'autre (sinon le rail est dans une tranchee
// d'un bloc et les roues des bogies semblent flotter), gravier sous le rail
function vhVoie(L) {
  for (var u = -3; u <= L + 2; u++) {
    vS(u, -2, 1, 'minecraft:gravel')
    vS(u, -1, 1, 'create:track[shape=' + (VH.o.AU == 'x' ? 'xo' : 'zo') + ',turn=false,waterlogged=false]')
    ;[-1, 0, 2, 3].forEach(v => { vS(u, -2, v, 'minecraft:gravel'); vS(u, -1, v, 'minecraft:andesite_slab[type=bottom,waterlogged=false]') })
  }
}
function vhBogie4(u, gros) { vS(u, 0, 1, 'create:' + (gros ? 'large' : 'small') + '_bogey[axis=' + VH.o.AU + ',waterlogged=false]') }
function vhPorteLoco(u, v, coul, type, hinge) {
  var f = v == 0 ? '{G}' : '{D}', ext = type == 'sliding' || type == 'folding' ? ',visible=true' : ''
  vS(u, 2, v, 'railways:' + coul + '_' + type + '_locometal_door[facing=' + f + ',half=lower,hinge=' + hinge + ',open=false' + ext + ',windowed=true]')
  vS(u, 3, v, 'railways:' + coul + '_' + type + '_locometal_door[facing=' + f + ',half=upper,hinge=' + hinge + ',open=false' + ext + ',windowed=true]')
}

// ---------------- METRO v4 (voiture 20 x 3) : caisse inox, bandeau bleu, trois portes doubles par face ----------------
function vhMetro4(x, z, dir, y) {
  vhDebut(x, y, z, dir, 20, 3); vhVoie(20); vhBogie4(3); vhBogie4(16)
  var I = 'railways:light_gray_plated_locometal', BD = 'railways:blue_plated_locometal', FEN = 'railways:light_gray_four_pane_locometal_window[axis=' + VH.o.AU + ']', A = 'minecraft:air'
  var portes = [[3, 'left'], [4, 'right'], [9, 'left'], [10, 'right'], [15, 'left'], [16, 'right']], estP = u => portes.some(p => p[0] == u)
  for (var u = 0; u <= 19; u++) {
    vF(u, 1, 0, u, 1, 2, 'railways:black_plated_locometal')
    vS2(u, 2, 0, BD); vS2(u, 3, 0, FEN); vS2(u, 4, 0, I); vS(u, 4, 1, I)
    vF(u, 2, 1, u, 3, 1, A)
    if (!estP(u) && u > 0 && u < 19) vS(u, 2, 1, 'minecraft:blue_terracotta')
  }
  portes.forEach(p => { vhPorteLoco(p[0], 0, 'light_gray', 'sliding', p[1]); vhPorteLoco(p[0], 2, 'light_gray', 'sliding', p[1]) })
  // faces d'extremite : porte d'intercirculation, vitres frontales, feux
  ;[0, 19].forEach(u => {
    vS(u, 2, 0, VH3PH); vS(u, 2, 2, VH3PH); vS(u, 3, 0, 'minecraft:black_stained_glass'); vS(u, 3, 2, 'minecraft:black_stained_glass')
    vS(u, 2, 1, 'railways:light_gray_hinged_locometal_door[facing=' + (u == 0 ? '{F}' : '{B}') + ',half=lower,hinge=left,open=false,windowed=true]')
    vS(u, 3, 1, 'railways:light_gray_hinged_locometal_door[facing=' + (u == 0 ? '{F}' : '{B}') + ',half=upper,hinge=left,open=false,windowed=true]')
  })
  ;[[2, 7], [12, 17]].forEach(t => vF(t[0], 5, 1, t[1], 5, 1, 'railways:light_gray_locometal_vent'))
}

// ---------------- VOITURE VOYAGEURS v4 (22 x 3) : grandes baies, portes battantes aux bouts, tampons ----------------
function vhVoyageurs4(x, z, dir, coul, y) {
  var c = coul || 'green'
  vhDebut(x, y, z, dir, 22, 3); vhVoie(22); vhBogie4(3, true); vhBogie4(18, true)
  var C = 'railways:' + c + '_plated_locometal', FEN = 'railways:' + c + '_two_pane_locometal_window[axis=' + VH.o.AU + ']', A = 'minecraft:air'
  for (var u = 0; u <= 21; u++) {
    vF(u, 1, 0, u, 1, 2, 'railways:black_riveted_locometal')
    var porte = u == 1 || u == 20
    vS2(u, 2, 0, C); vS2(u, 3, 0, porte ? C : FEN); vS2(u, 4, 0, C); vS(u, 4, 1, C)
    vF(u, 5, 0, u, 5, 2, 'minecraft:smooth_stone_slab[type=bottom]')
    vF(u, 2, 1, u, 3, 1, A)
    if (!porte && u > 1 && u < 20 && u % 2) vS(u, 2, 1, 'minecraft:red_terracotta')
  }
  ;[1, 20].forEach(u => { vhPorteLoco(u, 0, c, 'hinged', 'left'); vhPorteLoco(u, 2, c, 'hinged', 'left') })
  ;[0, 21].forEach(u => { vF(u, 2, 0, u, 4, 2, C); vS(u, 2, 1, 'minecraft:black_wool'); vS(u, 3, 1, 'minecraft:black_wool') })
  ;[[-1, 'F'], [22, 'B']].forEach(t => { vS(t[0], 1, 1, 'railways:headstock[facing={' + t[1] + '},style=buffer,upside_down=false]') })
}

// ---------------- WAGON COUVERT v4 (14 x 3) : caisse rivetee, porte coulissante, echelles ----------------
function vhWagonCouvert4(x, z, dir, coul, y) {
  var c = coul || 'brown'
  vhDebut(x, y, z, dir, 14, 3); vhVoie(14); vhBogie4(2, true); vhBogie4(11, true)
  vF(0, 1, 0, 13, 1, 2, 'railways:black_riveted_locometal')
  vF(0, 2, 0, 13, 4, 2, 'railways:' + c + '_riveted_locometal'); vF(1, 2, 1, 12, 3, 1, 'minecraft:air')
  vF(0, 5, 0, 13, 5, 2, 'railways:' + c + '_flat_slashed_locometal')
  ;[6, 7].forEach((u, i) => { vhPorteLoco(u, 0, c, 'sliding', i ? 'right' : 'left'); vhPorteLoco(u, 2, c, 'sliding', i ? 'right' : 'left') })
  vS(0, 3, -1, 'railways:black_locometal_rung_ladder[facing={G},waterlogged=false]'.replace('{G}', VH.o.G == 'north' ? 'north' : VH.o.G))
  ;[[-1, 'F'], [14, 'B']].forEach(t => vS(t[0], 1, 1, 'railways:headstock[facing={' + t[1] + '},style=buffer,upside_down=false]'))
}

// ---------------- WAGON-CITERNE v4 (14 x 3) : reservoir arrondi, passerelle, echelle ----------------
function vhCiterne4(x, z, dir, y) {
  vhDebut(x, y, z, dir, 14, 3); vhVoie(14); vhBogie4(2); vhBogie4(11)
  vF(0, 1, 0, 13, 1, 2, 'railways:black_riveted_locometal')
  vF(1, 2, 0, 12, 3, 2, 'createdeco:industrial_iron_hull[facing={F}]')
  vF(1, 2, 0, 12, 2, 0, 'minecraft:polished_blackstone_stairs[facing={D},half=top,shape=straight]'); vF(1, 2, 2, 12, 2, 2, 'minecraft:polished_blackstone_stairs[facing={G},half=top,shape=straight]')
  vF(1, 3, 0, 12, 3, 0, 'minecraft:polished_blackstone_stairs[facing={D},half=bottom,shape=straight]'); vF(1, 3, 2, 12, 3, 2, 'minecraft:polished_blackstone_stairs[facing={G},half=bottom,shape=straight]')
  vF(1, 4, 1, 12, 4, 1, 'minecraft:polished_blackstone_slab[type=bottom]'); vS(6, 4, 1, 'minecraft:iron_block'); vS(6, 5, 1, 'minecraft:iron_trapdoor[facing={F},half=bottom,open=false]')
  ;[[-1, 'F'], [14, 'B']].forEach(t => vS(t[0], 1, 1, 'railways:headstock[facing={' + t[1] + '},style=buffer,upside_down=false]'))
}

// vehicules MTS : yaw du faux joueur = cap voulu + 90 (mesure lot58). Cap -90 = vers l'est.
var MTS_LISTE3 = [
  { id: 'mtsofficialpack.firetruck', x: 6, z: 30 }, { id: 'mtsofficialpack.gmcbrig_white', x: 22, z: 30 }, { id: 'mtsofficialpack.scout_white', x: 36, z: 30 },
  { id: 'oamp.highwayman_white', x: 50, z: 30 }, { id: 'oamp.vwbus_red', x: 66, z: 30 }, { id: 'oamp.ecoline_white', x: 80, z: 30 },
  { id: 'svmp.260blank', x: 10, z: 44 }, { id: 'truckpack.volvo', x: 34, z: 44 }, { id: 'svmp.transportercwhite', x: 52, z: 44 }, { id: 'svmp.m939green', x: 68, z: 44 },
  { id: 'atheriavh.ambulance_blanc', x: 96, z: 30 }, { id: 'atheriavh.ambulance_blanc', x: 86, z: 44 }
]
function vhBancRail4() {
  OX = VB.X0; OY = VB.Y0; OZ = VB.Z0; CUT = 999; GRAINE = 5901
  for (var x = -10; x <= 110; x++) for (var z = -4; z <= 54; z++) { var r = R(); S(x, -1, z, z == 4 || z == 11 || z == 18 ? 'minecraft:gravel' : r < 0.9 ? 'minecraft:black_concrete' : 'minecraft:gray_concrete') }
  F(-10, 0, -4, 110, 30, 54, 'minecraft:air')
  vhTram4(6, 3, 'x'); vhMetro4(44, 3, 'x'); vhMetro4(66, 3, 'x')
  vhVoyageurs4(6, 10, 'x', 'green'); vhVoyageurs4(32, 10, 'x', 'red')
  vhWagonCouvert4(6, 17, 'x', 'brown'); vhCiterne4(24, 17, 'x'); vhWagonCouvert4(42, 17, 'x', 'gray')
}
BANC_MTS = function (server, lvl) {
  var FPF = Java.loadClass('net.neoforged.neoforge.common.util.FakePlayerFactory'), REG = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
  var RL = Java.loadClass('net.minecraft.resources.ResourceLocation'), IS = Java.loadClass('net.minecraft.world.item.ItemStack'), H = Java.loadClass('net.minecraft.world.InteractionHand')
  var BHR = Java.loadClass('net.minecraft.world.phys.BlockHitResult'), V3 = Java.loadClass('net.minecraft.world.phys.Vec3'), DIR = Java.loadClass('net.minecraft.core.Direction')
  var BP = Java.loadClass('net.minecraft.core.BlockPos'), UOC = Java.loadClass('net.minecraft.world.item.context.UseOnContext')
  var fp = FPF.getMinecraft(lvl)
  MTS_LISTE3.forEach(m => {
    try {
      var rl = RL.parse('mts:' + m.id)
      if (!REG.ITEM.containsKey(rl)) { vlog('MTS ABSENT ' + m.id); return }
      var st = new IS(REG.ITEM.get(rl)); fp.setItemInHand(H.MAIN_HAND, st)
      var x = VB.X0 + m.x, y = VB.Y0, z = VB.Z0 + m.z
      fp.absMoveTo(x + 0.5, y, z + 0.5, -90 + 90, 0)
      var r = st.useOn(new UOC(fp, H.MAIN_HAND, new BHR(new V3(x + 0.5, y, z + 0.5), DIR.UP, new BP(x, y - 1, z), false)))
      vlog('MTS ' + m.id + ' -> ' + r)
    } catch (e) { vlog('MTS ECHEC ' + m.id + ' : ' + e) }
  })
}
var QFIN_RAIL4 = function () { HM = {}; lot(vhBancRail4, 0, 0, 999, 5901, 110, 20) }
function vuesRail4() {
  vue('r4_tram_metro', 0, 0, 50, 5, -6, 50, 2, 4)
  vue('r4_metro_bout', 0, 0, 92, 4, 0, 82, 2, 4)
  vue('r4_metro_porte', 0, 0, 52, 3, 0, 53, 2, 4)
  vue('r4_voyageurs', 0, 0, 30, 5, 24, 30, 2, 11)
  vue('r4_voyageurs_bout', 0, 0, 60, 4, 13, 50, 2, 11)
  vue('r4_wagons', 0, 0, 30, 5, 26, 30, 2, 18)
  vue('r4_wagons_bout', 0, 0, 62, 4, 21, 52, 2, 18)
  vue('r4_style_mc', 0, 0, 44, 5, 22, 44, 1, 30)
  vue('r4_style_mc2', 0, 0, 90, 5, 24, 76, 1, 30)
  vue('r4_style_mc_flanc', 0, 0, 44, 4, 38, 44, 1, 30)
  vue('r4_realistes', 0, 0, 40, 5, 36, 40, 1, 44)
  vue('r4_ambu_avant', 0, 0, 105, 4, 25, 96, 1, 30)
  vue('r4_ambu_arriere', 0, 0, 87, 4, 36, 96, 1, 30)
  vue('r4_ambu_flanc', 0, 0, 86, 3, 36, 86, 1, 44)
  vue('r4_ambu_vs_ocp', 0, 0, 80, 5, 22, 70, 1, 37)
}
