// Banc relief avant/apres (copie de zz_audit_client) (temporaire, instance AtheriaAudit) : 2 captures par point (sol, ~60 blocs au-dessus), puis arret propre.
var AUDIT_POINTS = __PTS__
var AUDIT = { i: 0, etat: 'debut', t: 0, attente: 0, cam: null, sol: 0, solS: 0, prets: 0, tick: 0, init: false, fini: false }
var AUDIT_RECUL_SOL = 24, AUDIT_RECUL_HAUT = 40, AUDIT_HAUT = 60, AUDIT_RAYON = 3

function auditCmd(cmd) {
  var srv = Client.getSingleplayerServer()
  if (!srv) return
  srv.execute(() => { srv.getCommands().performPrefixedCommand(srv.createCommandSourceStack().withSuppressedOutput(), cmd) })
}

function auditPret(x, z) {
  var R = AUDIT_POINTS[AUDIT.i] && AUDIT_POINTS[AUDIT.i].g ? 5 : AUDIT_RAYON
  var cs = Client.level.getChunkSource(), cx = Math.floor(x) >> 4, cz = Math.floor(z) >> 4
  for (var dx = -R; dx <= R; dx++) for (var dz = -R; dz <= R; dz++) if (!cs.hasChunk(cx + dx, cz + dz)) return false
  return true
}

// sol : premier bloc qui bloque le mouvement ou de l'eau, en ignorant feuillage et plantes
function auditSol(x, z) {
  var BlockPos = Java.loadClass('net.minecraft.core.BlockPos')
  var lvl = Client.level
  for (var y = 319; y > -60; y--) {
    var st = lvl.getBlockState(new BlockPos(Math.floor(x), y, Math.floor(z)))
    if (st.isAir()) continue
    if (!st.getFluidState().isEmpty()) return y
    var id = '' + st.getBlock().getDescriptionId()
    if (id.indexOf('leaves') >= 0) continue
    if (st.blocksMotion()) return y
  }
  return 63
}

function auditTp(x, y, z, vx, vy, vz) {
  var dx = vx - x, dy = vy - (y + 1.62), dz = vz - z
  var yaw = Math.atan2(-dx, dz) * 180 / Math.PI
  var pitch = -Math.atan2(dy, Math.sqrt(dx * dx + dz * dz)) * 180 / Math.PI
  auditCmd('tp ' + Client.player.getGameProfile().getName() + ' ' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + z.toFixed(2) + ' ' + yaw.toFixed(1) + ' ' + pitch.toFixed(1))
  return [yaw, pitch]
}

function auditCapture(nom) {
  var Ecran = Java.loadClass('net.minecraft.client.Screenshot')
  Ecran.grab(Client.gameDirectory, nom, Client.getMainRenderTarget(), msg => {})
}

ClientEvents.tick(event => {
  if (AUDIT.fini || !Client.player || !Client.level || !Client.getSingleplayerServer()) return
  AUDIT.tick++
  // arret demande de l'exterieur (garde RAM) : fichier kubejs/audit/arret.json
  if (AUDIT.tick % 100 == 0) {
    var ctrl = null
    try { ctrl = JsonIO.read('kubejs/audit/arret.json') } catch (e) { ctrl = null }
    if (ctrl != null) { console.info('[AUDIT] arret demande'); AUDIT.fini = true; Client.stop(); return }
  }
  if (!AUDIT.init) {
    if (AUDIT.tick < 200) return
    var nom = Client.player.getGameProfile().getName()
    ;['gamemode spectator ' + nom, 'gamerule doDaylightCycle false', 'gamerule doWeatherCycle false', 'weather clear', 'gamerule doMobSpawning false'].forEach(c => auditCmd(c))
    var srv = Client.getSingleplayerServer()
    srv.execute(() => { srv.overworld().setDayTime(6000) })
    Client.options.pauseOnLostFocus = false
    AUDIT.init = true; AUDIT.etat = 'go'; AUDIT.t = 0
    try { var rep = null; if (false) rep = JsonIO.read('kubejs/audit/reprise.json'); if (rep != null && rep.get('id') != null) { var rid = '' + rep.get('id'); for (var k = 0; k < AUDIT_POINTS.length; k++) if (AUDIT_POINTS[k].id == rid) AUDIT.i = k } } catch (e) { }
    console.info('[AUDIT] depart au point ' + AUDIT.i)
    console.info('[AUDIT] debut, ' + AUDIT_POINTS.length + ' points')
    return
  }
  var p = AUDIT_POINTS[AUDIT.i]
  if (!p) {
    console.info('[AUDIT] fin')
    AUDIT.fini = true
    Client.options.hideGui = false
    Client.stop()
    return
  }
  AUDIT.t++
  if (AUDIT.etat == 'go') {
    AUDIT.cam = p.g ? [p.sx, p.sz] : [p.sx + p.dx * AUDIT_RECUL_SOL, p.sz + p.dz * AUDIT_RECUL_SOL]
    auditTp(AUDIT.cam[0], 200, AUDIT.cam[1], p.sx, 100, p.sz)
    AUDIT.etat = 'attente'; AUDIT.t = 0
  } else if (AUDIT.etat == 'attente') {
    if (AUDIT.t % 10 != 0) return
    var ok = auditPret(AUDIT.cam[0], AUDIT.cam[1]) && auditPret(p.sx, p.sz)
    if (!ok && AUDIT.t < 2400) return
    if (p.g) {
      console.info('[AUDIT] generation ' + p.id + ' ' + p.sx + ',' + p.sz + ' en ' + (AUDIT.t / 20).toFixed(0) + ' s' + (ok ? '' : ' (INCOMPLET)'))
      AUDIT.i++; AUDIT.etat = 'go'; AUDIT.t = 0
      return
    }
    AUDIT.sol = auditSol(AUDIT.cam[0], AUDIT.cam[1]); AUDIT.solS = auditSol(p.sx, p.sz)
    var v = auditTp(AUDIT.cam[0], AUDIT.sol + 1, AUDIT.cam[1], p.sx, AUDIT.solS + 1.5, p.sz)
    console.info('[AUDIT] point ' + p.id + ' charge en ' + (AUDIT.t / 20).toFixed(0) + ' s' + (ok ? '' : ' (INCOMPLET)') + ' ; sol camera Y ' + AUDIT.sol + ' ; sol sujet Y ' + AUDIT.solS)
    // vue haute seule (profil capture legere)
    var hx0 = p.sx + p.dx * AUDIT_RECUL_HAUT, hz0 = p.sz + p.dz * AUDIT_RECUL_HAUT, hy0 = AUDIT.solS + AUDIT_HAUT
    var v0 = auditTp(hx0, hy0, hz0, p.sx, AUDIT.solS, p.sz)
    AUDIT.vue = 'haut'; AUDIT.pos = [hx0, hy0, hz0, v0[0], v0[1]]
    AUDIT.etat = 'pose'; AUDIT.t = 0
  } else if (AUDIT.etat == 'pose') {
    if (AUDIT.t < (AUDIT.vue == 'sol' ? 200 : 160)) return
    Client.options.hideGui = true
    AUDIT.etat = 'cliche'; AUDIT.t = 0
  } else if (AUDIT.etat == 'cliche') {
    if (AUDIT.t < 3) return
    var nom = 'relief___VARIANTE___' + p.id + '_' + AUDIT.vue + '.png'
    auditCapture(nom)
    var q = AUDIT.pos
    console.info('[AUDIT] cliche ' + nom + ' x=' + q[0].toFixed(1) + ' y=' + q[1].toFixed(1) + ' z=' + q[2].toFixed(1) + ' yaw=' + q[3].toFixed(1) + ' pitch=' + q[4].toFixed(1) + ' sujet=' + p.sx + ',' + AUDIT.solS + ',' + p.sz)
    AUDIT.etat = 'apres'; AUDIT.t = 0
  } else if (AUDIT.etat == 'apres') {
    if (AUDIT.t < 3) return
    Client.options.hideGui = false
    if (AUDIT.vue == 'sol') {
      var hx = p.sx + p.dx * AUDIT_RECUL_HAUT, hz = p.sz + p.dz * AUDIT_RECUL_HAUT, hy = AUDIT.solS + AUDIT_HAUT
      var v2 = auditTp(hx, hy, hz, p.sx, AUDIT.solS, p.sz)
      AUDIT.vue = 'haut'; AUDIT.pos = [hx, hy, hz, v2[0], v2[1]]
      AUDIT.etat = 'pose'; AUDIT.t = 0
    } else {
      AUDIT.i++; AUDIT.etat = 'go'; AUDIT.t = 0
    }
  }
})
