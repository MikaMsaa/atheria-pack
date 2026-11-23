// TEMPORAIRE : controle bloc par bloc des batiments vitrine places par Lost Cities, puis une capture par type
// Pour chaque chunk vitrine retenu : compare chaque bloc du monde au bloc attendu de ses parts (BuildingPart.get),
// note la lave et l'eau qui coule, et verifie que tous les chunks d'un meme multibatiment sont au meme niveau.
var VK = { SANS_VUES: false, t: 0, etape: 0, cx: 0, cz: 0, R: 180, ville: 0, orig: {}, nbType: {}, file: [], fi: 0, res: [], vues: [], vi: 0, att: 0, lave: 0, laveCh: 0, tot: { ok: 0, diff: 0, deco: 0 } }
function vklog(m) { console.info('[VIT] ' + m) }
ServerEvents.tick(event => {
  try { tickVK(event) } catch (e) { vklog('ERREUR ' + e); console.info('[TEST BUGS] fin'); VK.etape = 9 }
})
function vkNom(id) { var m = ('' + id).match(/ath_v_(.+)_(\d)(\d)$/); return m ? { base: m[1], x: +m[2], z: +m[3] } : null }
function vkC(v) { return typeof v == 'number' ? String.fromCharCode(v) : (/^\d{2,5}$/.test('' + v) ? String.fromCharCode(+('' + v)) : '' + v) }
function vkBloc(st) { return '' + VK.REG.BLOCK.getKey(st.getBlock()) }
function vkDeco(n) { return /leaves|vine|moss_carpet|glow_lichen|grass$|grass_plant|fern|cobweb|sprout|clover|flower|tulip|daisy|dandelion|poppy|bluet|allium|orchid|daffodil|heliconia|bush|dripleaf|snow$|petal|azalea$|mushroom$|growths|lily|rose|peony|lilac|violet|lavender|cattail|reed|barley|moss$/.test(n) }
function vkPareil(a, b) {
  if (a == b) return true
  var c = s => s.replace('lootr:lootr_', 'minecraft:').replace('_wall_', '_')
  return c(a) == c(b)
}
function vkControler(lvl, ch) {
  var info = VK.BI.getBuildingInfo(new VK.CC(VK.OW, ch.cx, ch.cz), VK.di)
  var G = info.getCityGroundLevel(), nf = info.getNumFloors(), r = { nom: ch.nom, cx: ch.cx, cz: ch.cz, G: G, diff: 0, deco: 0, ok: 0, lave: 0, ex: [], off: 0 }
  var parts = []
  for (var f = 0; f <= nf + 1; f++) { var p = null; try { p = info.getFloor(f) } catch (e) { p = null } if (p) parts.push({ p: p, y0: G + f * 6 }) }
  r.parts = parts.map(q => ('' + q.p.getName()).replace('ath_v_', '') + '@' + q.y0).join(',')
  parts.forEach(q => { q.map = {}; try { var it = q.p.getLocalPalette(lvl).getPalette().entrySet().iterator(); while (it.hasNext()) { var en = it.next(); q.map[vkC(en.getKey())] = vkBloc(en.getValue().blocks()) } } catch (e) { if (!VK.cpErr) { VK.cpErr = 1; vklog('PALETTE erreur ' + e) } } })
  var x0 = ch.cx * 16, z0 = ch.cz * 16
  parts.forEach(q => {
    var n = q.p.getSliceCount()
    for (var k = 0; k < n; k++) for (var x = 0; x < 16; x++) for (var z = 0; z < 16; z++) {
      var cc = vkC(q.p.getC(x, k, z)), att = cc == ' ' ? 'minecraft:air' : (q.map[cc] || ('?' + cc))
      var vu = vkBloc(lvl.getBlockState(new VK.BP(x0 + x, q.y0 + k, z0 + z)))
      if (vkPareil(att, vu)) { r.ok++; continue }
      if (att == 'minecraft:air' && vkDeco(vu)) { r.deco++; continue }
      r.diff++
      var pk = att.replace('minecraft:', '') + '>' + vu.replace('minecraft:', ''); VK.pairs = VK.pairs || {}; VK.ppos = VK.ppos || {}
      VK.pairs[pk] = (VK.pairs[pk] || 0) + 1; if (!VK.ppos[pk]) VK.ppos[pk] = []; if (VK.ppos[pk].length < 4) VK.ppos[pk].push(ch.nom + ' ' + (x0 + x) + ',' + (q.y0 + k) + ',' + (z0 + z) + ' k' + k)
      if (r.ex.length < 6) r.ex.push((x0 + x) + ',' + (q.y0 + k) + ',' + (z0 + z) + ' ' + att.replace('minecraft:', '') + '>' + vu.replace('minecraft:', ''))
    }
  })
  // lave et eau qui coule dans la colonne du chunk, du sol jusqu'a 80 blocs au-dessus
  for (var x = 0; x < 16; x++) for (var z = 0; z < 16; z++) for (var y = G - 4; y < G + 80; y++) {
    var b = vkBloc(lvl.getBlockState(new VK.BP(x0 + x, y, z0 + z)))
    if (b == 'minecraft:lava' && y >= G) { r.lave++; if (!r.lpos) { r.lpos = (x0 + x) + ',' + y + ',' + (z0 + z); try { r.lpos += ' biome ' + lvl.getBiome(new VK.BP(x0 + x, y, z0 + z)).unwrapKey().get().location() } catch (e) {} } }
  }
  return r
}
function tickVK(event) {
  var server = event.server
  if (server.players.size() == 0) return
  VK.t++
  var lvl = server.overworld()
  if (VK.etape == 0 && VK.t == 200) {
    server.runCommandSilent('gamerule doMobSpawning false'); server.runCommandSilent('gamerule doDaylightCycle false'); server.runCommandSilent('gamerule doWeatherCycle false')
    server.runCommandSilent('weather clear'); server.runCommandSilent('time set 3000'); server.runCommandSilent('gamemode spectator @a')
    var Reg = Java.loadClass('mcjty.lostcities.setup.Registration')
    VK.di = Reg.LOSTCITY_FEATURE.get().getDimensionInfo(lvl)
    VK.BI = Java.loadClass('mcjty.lostcities.worldgen.lost.BuildingInfo'); VK.CC = Java.loadClass('mcjty.lostcities.varia.ChunkCoord'); VK.OW = Java.loadClass('net.minecraft.world.level.Level').OVERWORLD
    VK.CP = Java.loadClass('mcjty.lostcities.worldgen.lost.cityassets.CompiledPalette'); VK.BP = Java.loadClass('net.minecraft.core.BlockPos'); VK.REG = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
    var p = VK.di.getProfile()
    vklog('PROFIL ruines ' + p.RUIN_CHANCE + ' explosions ' + p.EXPLOSION_CHANCE + ' mini ' + p.MINI_EXPLOSION_CHANCE)
    VK.cx = -VK.R; VK.cz = -VK.R; VK.etape = 1
  }
  if (VK.etape == 1) {
    for (var k = 0; k < 1500 && VK.etape == 1; k++) {
      var info = VK.BI.getBuildingInfo(new VK.CC(VK.OW, VK.cx, VK.cz), VK.di)
      if (VK.BI.isCity(new VK.CC(VK.OW, VK.cx, VK.cz), VK.di)) { VK.ville++; var st = '?'; try { st = ('' + info.getCityStyle().getName()).replace('citystyle_', '') } catch (e) {} VK.sc = VK.sc || {}; VK.sc[st] = VK.sc[st] || [0, 0, 0]; VK.sc[st][0]++; if (info.hasBuilding) { var idb = '' + info.getBuilding().getId(); if (idb.indexOf('ath_v_') >= 0) VK.sc[st][1]++; else { VK.sc[st][2]++; VK.aut = VK.aut || {}; VK.aut[idb] = (VK.aut[idb] || 0) + 1 } } }
      if (info.hasBuilding) {
        var n = vkNom(info.getBuilding().getId())
        if (n && n.x == 0 && n.z == 0) {
          VK.nbType[n.base] = (VK.nbType[n.base] || 0) + 1
          var d = Math.hypot(VK.cx, VK.cz); VK.orig[n.base] = VK.orig[n.base] || []
          VK.orig[n.base].push({ cx: VK.cx, cz: VK.cz, d: d })
        }
      }
      VK.cz++; if (VK.cz > VK.R) { VK.cz = -VK.R; VK.cx++; if (VK.cx > VK.R) VK.etape = 2 }
    }
  }
  if (VK.etape == 2) {
    var noms = Object.keys(VK.orig).sort(), total = 0
    noms.forEach(n => { total += VK.nbType[n] })
    Object.keys(VK.sc || {}).sort().forEach(n => vklog('STYLE ' + n + ' chunks ' + VK.sc[n][0] + ' vitrines ' + VK.sc[n][1] + ' autres ' + VK.sc[n][2]))
    Object.keys(VK.aut || {}).sort((a, b) => VK.aut[b] - VK.aut[a]).slice(0, 15).forEach(n => vklog('AUTRE ' + n + ' ' + VK.aut[n]))
    try { var SV = Java.loadClass('fr.atheria.monde.StyleVilles'); vklog('STYLE mixin choix ' + SV.CHOIX.get() + ' replis ' + SV.REPLIS.get()) } catch (e) { vklog('STYLE mixin absent ' + e) }
    vklog('RELEVE total vitrines ' + total + ' types ' + noms.length + ' chunks de ville ' + VK.ville)
    // deux exemplaires par type au plus, les plus proches ; on controle tous les chunks de chaque exemplaire
    noms.forEach(n => {
      VK.orig[n].sort((a, b) => a.d - b.d).slice(0, 2).forEach(o => {
        var mb = []
        for (var dx = 0; dx < 4; dx++) for (var dz = 0; dz < 4; dz++) {
          var i2 = VK.BI.getBuildingInfo(new VK.CC(VK.OW, o.cx + dx, o.cz + dz), VK.di), m2 = i2.hasBuilding ? vkNom(i2.getBuilding().getId()) : null
          if (m2 && m2.base == n && m2.x == dx && m2.z == dz) mb.push({ nom: n + '_' + dx + dz, cx: o.cx + dx, cz: o.cz + dz, G: i2.getCityGroundLevel() })
        }
        var niv = {}; mb.forEach(c => niv[c.G] = 1)
        if (Object.keys(niv).length > 1) vklog('MULTI NIVEAUX ' + n + ' a ' + o.cx * 16 + ',' + o.cz * 16 + ' : ' + mb.map(c => c.nom.slice(-2) + '=' + c.G).join(' '))
        mb.forEach(c => VK.file.push(c))
        VK.vues.push({ nom: n, x: o.cx * 16, z: o.cz * 16, g: mb.length ? mb[0].G : 64, L: /(hp_hopital|pr_prison|ba_base)$/.test(n) ? 64 : 32 })
      })
    })
    vklog('CONTROLE de ' + VK.file.length + ' chunks')
    VK.etape = 3
  }
  if (VK.etape == 3) {
    // on charge le chunk suivant (et ses voisins) un tick avant de le controler : la passe 2 de la finition a lieu en fin de tick
    VK.fl = VK.fl || 0
    if (VK.fl < VK.file.length) { var cl = VK.file[VK.fl++]; for (var a = -1; a <= 1; a++) for (var b = -1; b <= 1; b++) lvl.getChunk(cl.cx + a, cl.cz + b) }
    for (var j = 0; j < 1 && VK.fi < VK.file.length && (VK.fi < VK.fl - 2 || VK.fl >= VK.file.length); j++, VK.fi++) {
      var ch = VK.file[VK.fi]
      var r = vkControler(lvl, ch)
      VK.tot.ok += r.ok; VK.tot.diff += r.diff; VK.tot.deco += r.deco; if (r.lave) { VK.lave += r.lave; VK.laveCh++ }
      if (r.diff > 0 || r.lave > 0) vklog('CHK ' + r.nom + ' ' + r.cx * 16 + ',' + r.cz * 16 + ' G=' + r.G + ' parts=' + r.parts + ' diff=' + r.diff + ' deco=' + r.deco + ' lave=' + r.lave + (r.lpos ? '@' + r.lpos : '') + ' ok=' + r.ok + ' ex: ' + r.ex.join(' | '))
    }
    if (VK.fi % 40 == 0 && VK.fi > 0) vklog('avance ' + VK.fi + '/' + VK.file.length)
    if (VK.fi >= VK.file.length) {
      vklog('CHK BILAN chunks ' + VK.file.length + ' blocs conformes ' + VK.tot.ok + ' differents ' + VK.tot.diff + ' vegetation ajoutee ' + VK.tot.deco + ' lave ' + VK.lave + ' dans ' + VK.laveCh + ' chunks')
      Object.keys(VK.pairs || {}).sort((a, b) => VK.pairs[b] - VK.pairs[a]).slice(0, 140).forEach(k => vklog('PAIRE ' + VK.pairs[k] + ' ' + k + ' :: ' + VK.ppos[k].join(' ; ')))
      try { var FV = Java.loadClass('fr.atheria.monde.FinitionVitrines'); vklog('FINITION chunks ' + FV.CHUNKS.get() + ' blocs remis ' + FV.BLOCS.get() + ' passe 2 chunks ' + FV.CHUNKS2.get() + ' blocs ' + FV.BLOCS2.get() + ' erreurs ' + FV.ERREURS.get()) } catch (e) { vklog('FINITION absente ' + e) }
      if (VK.SANS_VUES) VK.vues = []
      VK.vues = VK.vues.filter((v, i) => VK.vues.findIndex(w => w.nom == v.nom) == i).slice(0, 40)
      VK.etape = 4; VK.att = VK.t + 40
    }
  }
  if (VK.etape == 4 && VK.t >= VK.att) {
    if (VK.vi >= VK.vues.length) { vklog('fin des vues'); console.info('[TEST BUGS] fin'); VK.etape = 5; return }
    var v = VK.vues[VK.vi]
    for (var x = v.x - 32; x <= v.x + v.L + 32; x += 16) for (var z = v.z - 32; z <= v.z + 64; z += 16) lvl.getChunk(x >> 4, z >> 4)
    var HT = Java.loadClass('net.minecraft.world.level.levelgen.Heightmap$Types'), ex = v.x - 8, ez = v.z + 44, hmax = v.g
    for (var sx = ex - 3; sx <= v.x + v.L / 2; sx += 2) for (var sz = v.z + 20; sz <= ez + 3; sz += 2) hmax = Math.max(hmax, lvl.getHeight(HT.MOTION_BLOCKING, sx, sz))
    var ey = Math.max(v.g + 22, hmax + 6), tx = v.x + v.L / 2, ty = v.g + 5, tz = v.z + 12
    var dx = tx - ex, dy = ty - ey, dz = tz - ez
    var yaw = Math.atan2(-dx, dz) * 180 / Math.PI, pitch = -Math.atan2(dy, Math.sqrt(dx * dx + dz * dz)) * 180 / Math.PI
    server.runCommandSilent('kill @e[type=!minecraft:player]')
    server.runCommandSilent('tp @a ' + ex.toFixed(2) + ' ' + (ey - 1.62).toFixed(2) + ' ' + ez.toFixed(2) + ' ' + yaw.toFixed(1) + ' ' + pitch.toFixed(1))
    vklog('vue ' + (VK.vi + 1) + ' ' + v.nom + ' pos=' + Math.floor(ex) + ' ' + Math.floor(ey) + ' ' + Math.floor(ez))
    VK.vi++; VK.att = VK.t + (VK.vi == 1 ? 700 : 500)
  }
}
