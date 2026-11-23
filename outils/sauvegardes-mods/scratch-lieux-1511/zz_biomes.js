var ZB = { t: 0, i: 0, fini: false, pos: null }
var ZB_L = ['foret_calcinee', 'zone_contaminee', 'terres_agricoles', 'marecage_pollue', 'plaine_cendres']
ServerEvents.tick(event => {
  if (ZB.fini) return
  ZB.t++
  if (ZB.t < 60 || ZB.t % 10 != 0) return
  var s = event.server, level = s.overworld()
  try {
    var BP = Java.loadClass('net.minecraft.core.BlockPos')
    var RK = Java.loadClass('net.minecraft.resources.ResourceKey'), RL = Java.loadClass('net.minecraft.resources.ResourceLocation'), Reg = Java.loadClass('net.minecraft.core.registries.Registries')
    var HM = Java.loadClass('net.minecraft.world.level.levelgen.Heightmap$Types')
    if (ZB.i >= ZB_L.length) { console.info('[SCAN] fin'); ZB.fini = true; return }
    var nom = ZB_L[ZB.i]
    var cle = RK.create(Reg.BIOME, RL.parse('atheria:' + nom))
    var depart = new BP(0, 80, 0)
    var deb = Date.now()
    var res = level.findClosestBiome3d(h => h.is(cle), depart, 12000, 32, 64)
    if (res == null) { console.info('[SCAN]' + nom + ' introuvable en ' + (Date.now() - deb) + ' ms'); ZB.i++; return }
    var p = res.getFirst()
    console.info('[SCAN]' + nom + ' a ' + p.getX() + ' ' + p.getZ() + ' dist=' + Math.round(Math.sqrt(p.getX()*p.getX()+p.getZ()*p.getZ())) + ' en ' + (Date.now() - deb) + ' ms')
    var comptes = {}, hauts = {}
    for (var dx = -24; dx <= 24; dx++) for (var dz = -24; dz <= 24; dz++) {
      var x = p.getX() + dx, z = p.getZ() + dz
      level.getChunk(x >> 4, z >> 4)
      var y = level.getHeight(HM.WORLD_SURFACE, x, z)
      var haut = '' + level.getBlockState(new BP(x, y - 1, z)).getBlock().getId()
      hauts[haut] = (hauts[haut] || 0) + 1
      var sol = '' + level.getBlockState(new BP(x, level.getHeight(HM.OCEAN_FLOOR, x, z) - 1, z)).getBlock().getId()
      comptes[sol] = (comptes[sol] || 0) + 1
    }
    console.info('[SCAN]  haut ' + JSON.stringify(hauts))
    console.info('[SCAN]  sol  ' + JSON.stringify(comptes))
    ZB.i++
  } catch (e) { console.error('[SCAN]ERREUR ' + e); console.info('[SCAN] fin'); ZB.fini = true }
})
