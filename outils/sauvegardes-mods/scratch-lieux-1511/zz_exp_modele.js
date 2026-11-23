
// export du lot en modeles de structure (StructureTemplate), apres usure, raccords et audit : ce que Mika a valide
// EXPS : liste de boites {nom, x, y, z, w, h, l} relatives a (VB.X0, VB.Y0, VB.Z0) ; EXP_AVANT(lvl, BP) optionnel (retouches avant export)
var EXP_FAIT = false
BANC_MTS = function (server, lvl) {
  if (EXP_FAIT) return; EXP_FAIT = true
  var BP = Java.loadClass('net.minecraft.core.BlockPos'), RL = Java.loadClass('net.minecraft.resources.ResourceLocation')
  try { if (typeof EXP_AVANT == 'function') EXP_AVANT(lvl, BP) } catch (e) { vlog('[EXPT] ERREUR retouche ' + e) }
  EXPS.forEach(function (E) {
    try {
      var tm = lvl.getStructureManager(), id = RL.fromNamespaceAndPath('atheria_monde', E.nom)
      var t = tm.getOrCreate(id)
      t.fillFromWorld(lvl, new BP(VB.X0 + E.x, VB.Y0 + E.y, VB.Z0 + E.z), new BP(E.w, E.h, E.l), false, null)
      var ok = tm.save(id)
      vlog('[EXPT] ' + E.nom + ' sauve=' + ok + ' taille=' + t.getSize() + ' origine=' + (VB.X0 + E.x) + ',' + (VB.Y0 + E.y) + ',' + (VB.Z0 + E.z) + ' sol=' + VB.Y0)
    } catch (e) { vlog('[EXPT] ERREUR ' + E.nom + ' ' + e) }
  })
}
