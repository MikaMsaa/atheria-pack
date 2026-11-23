// TEMPORAIRE : essai des vehicules MTS dans de vrais batiments vitrine (version sans maquettes).
// Les villes n'apparaissent qu'aux lieux nommes de l'ile : on pose donc nous-memes les parts Lost Cities de quelques
// batiments a vehicules sur un plateau a x/z 24000, puis on appelle FinitionVitrines.poser comme le fait la passe 2.
var VP = { t: 0, etape: 0, i: 0, vues: [], vi: 0, att: 0, SOL: 100, X0: 24000, Z0: 24000,
  BATS: ['ath_v_vr_parking', 'ath_v_ru_depot_bus', 'ath_v_hp_parking', 'ath_v_ga_hangar', 'ath_v_bt_station', 'ath_v_ds_station'] }
function vplog(m) { console.info('[VVP] ' + m) }
ServerEvents.tick(event => {
  try { tickVP(event) } catch (e) { vplog('ERREUR ' + e); console.info('[TEST BUGS] fin'); VP.etape = 9 }
})
function vpEtat(s) {
  if (!VP.cache[s]) {
    var BSP = Java.loadClass('net.minecraft.commands.arguments.blocks.BlockStateParser'), REG = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
    try { VP.cache[s] = BSP.parseForBlock(REG.BLOCK.asLookup(), s, false).blockState() } catch (e) { vplog('BLOC INVALIDE ' + s); VP.cache[s] = REG.BLOCK.get(Java.loadClass('net.minecraft.resources.ResourceLocation').parse('minecraft:air')).defaultBlockState() }
  }
  return VP.cache[s]
}
function vpPart(lvl, nom, x0, y0, z0) {
  var p = JsonIO.read('kubejs/data/lostcities/lostcities/parts/' + nom + '.json'), BP = Java.loadClass('net.minecraft.core.BlockPos')
  if (!p) { vplog('PART ABSENTE ' + nom); return }
  var pal = {}; p.palette.palette.forEach(e => { pal['' + e.char] = '' + e.block })
  var ns = p.slices.length || p.slices.size()
  for (var k = 0; k < ns; k++) {
    var sl = p.slices[k]
    for (var z = 0; z < 16; z++) for (var x = 0; x < 16; x++) {
      var c = ('' + sl[z]).charAt(x)
      lvl.setBlock(new BP(x0 + x, y0 + k, z0 + z), c == ' ' ? vpEtat('minecraft:air') : vpEtat(pal[c]), 2 | 16)
    }
  }
}
function tickVP(event) {
  var server = event.server
  if (server.players.size() == 0) return
  VP.t++
  var lvl = server.overworld()
  var FV = Java.loadClass('fr.atheria.monde.FinitionVitrines')
  if (VP.etape == 0 && VP.t == 200) {
    ['gamerule doMobSpawning false', 'gamerule doDaylightCycle false', 'gamerule doWeatherCycle false', 'weather clear', 'time set 3000', 'gamemode spectator @a', 'kill @e[type=!minecraft:player]'].forEach(c => server.runCommandSilent(c))
    VP.cache = {}
    VP.liste = JsonIO.read('kubejs/data/atheria_monde/vehicules_vitrines.json')
    server.runCommandSilent('tp @a ' + VP.X0 + ' ' + (VP.SOL + 30) + ' ' + VP.Z0)
    VP.etape = 1; VP.att = VP.t + 200
  }
  // un batiment par passage : plateau de pierre, parts f et t de chaque chunk, puis les vehicules
  if (VP.etape == 1 && VP.t >= VP.att) {
    if (VP.i >= VP.BATS.length) { VP.etape = 2; VP.att = VP.t + 60; return }
    var b = VP.BATS[VP.i], mb = JsonIO.read('kubejs/data/lostcities/lostcities/multibuildings/' + b + '.json')
    var bx = VP.X0 + (VP.i % 3) * 96, bz = VP.Z0 + Math.floor(VP.i / 3) * 96
    for (var cx = -1; cx <= mb.dimx; cx++) for (var cz = -1; cz <= mb.dimz; cz++) lvl.getChunk((bx >> 4) + cx, (bz >> 4) + cz)
    server.runCommandSilent('fill ' + (bx - 8) + ' ' + (VP.SOL - 4) + ' ' + (bz - 8) + ' ' + (bx + mb.dimx * 16 + 7) + ' ' + (VP.SOL - 1) + ' ' + (bz + mb.dimz * 16 + 7) + ' minecraft:stone')
    for (var y = VP.SOL; y < VP.SOL + 40; y += 8) server.runCommandSilent('fill ' + (bx - 8) + ' ' + y + ' ' + (bz - 8) + ' ' + (bx + mb.dimx * 16 + 7) + ' ' + (y + 7) + ' ' + (bz + mb.dimz * 16 + 7) + ' minecraft:air')
    var n = 0, prevus = 0
    for (var cx = 0; cx < mb.dimx; cx++) for (var cz = 0; cz < mb.dimz; cz++) {
      var nom = '' + mb.buildings[cx][cz], x0 = bx + cx * 16, z0 = bz + cz * 16
      vpPart(lvl, nom + '_f', x0, VP.SOL, z0); vpPart(lvl, nom + '_t', x0, VP.SOL + 6, z0)
      if (VP.liste[nom]) prevus += VP.liste[nom].length
      n += FV.poser(lvl, nom, x0 >> 4, z0 >> 4, VP.SOL)
      if (VP.liste[nom]) VP.liste[nom].forEach(v => VP.vues.push({ b: b, id: '' + v.id, x: x0 + v.x, y: VP.SOL + v.y, z: z0 + v.z, cap: v.cap }))
    }
    vplog('BAT ' + b + ' a ' + bx + ' ' + bz + ' : vehicules prevus ' + prevus + ' poses ' + n + ' (total poses ' + FV.VEHICULES.get() + ' rates ' + FV.VEHICULES_RATES.get() + ')')
    VP.vues.push({ b: b, ensemble: true, x: bx + mb.dimx * 8, z: bz + mb.dimz * 8, y: VP.SOL })
    VP.i++; VP.att = VP.t + 40
  }
  if (VP.etape == 2 && VP.t >= VP.att) {
    var AABB = Java.loadClass('net.minecraft.world.phys.AABB'), REG = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
    var l = lvl.getEntities(null, new AABB(VP.X0 - 50, VP.SOL - 5, VP.Z0 - 50, VP.X0 + 400, VP.SOL + 30, VP.Z0 + 300)), it = l.iterator(), types = {}
    while (it.hasNext()) { var e = it.next(), k = '' + REG.ENTITY_TYPE.getKey(e.getType()); types[k] = (types[k] || 0) + 1 }
    vplog('entites dans la zone : ' + JSON.stringify(types))
    // vues : vue d'ensemble de chaque batiment, puis un vehicule de chaque modele de trois quarts
    var vus = {}, choix = []
    VP.vues.forEach(v => { if (v.ensemble) { choix.push(v); return } var m = v.id.replace(/_[a-z]+$/, ''); if (!vus[m] || (/brulee|rouille/.test(v.id) && vus[m] < 2)) { vus[m] = (vus[m] || 0) + 1; choix.push(v) } })
    VP.vues = choix.slice(0, 22); vplog('VUES ' + VP.vues.length)
    VP.etape = 3; VP.att = VP.t + 20
  }
  if (VP.etape == 3 && VP.t >= VP.att) {
    if (VP.vi >= VP.vues.length) { vplog('fin des vues'); console.info('[TEST BUGS] fin'); VP.etape = 5; return }
    var v = VP.vues[VP.vi], ex, ey, ez
    if (v.ensemble) { ex = v.x - 30; ez = v.z + 34; ey = v.y + 26 }
    else { var a = (v.cap + 40) * Math.PI / 180, d = 7.5; ex = v.x - Math.sin(a) * d; ez = v.z + Math.cos(a) * d; ey = v.y + 3.2 }
    var dx = v.x - ex, dy = v.y + 0.8 - ey, dz = v.z - ez
    var yaw = Math.atan2(-dx, dz) * 180 / Math.PI, pitch = -Math.atan2(dy, Math.sqrt(dx * dx + dz * dz)) * 180 / Math.PI
    server.runCommandSilent('tp @a ' + ex.toFixed(2) + ' ' + (ey - 1.62).toFixed(2) + ' ' + ez.toFixed(2) + ' ' + yaw.toFixed(1) + ' ' + pitch.toFixed(1))
    vplog('vue ' + (VP.vi + 1) + ' ' + v.b + ' ' + (v.ensemble ? 'ensemble' : v.id))
    VP.vi++; VP.att = VP.t + (VP.vi == 1 ? 600 : 260)
  }
}
