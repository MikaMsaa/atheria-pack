
// passage de controle : rejoue toutes les series finales en memoire (HM) sans poser les blocs, journalise vitres inversees et bannieres
var DIAG_L = [['beton1', QFIN], ['bdg', QFIN_BDG], ['ba', QFIN_BA], ['bd', QFIN_BD], ['bd2', QFIN_BD2], ['bd3', QFIN_BD3], ['ga', QFIN_GA], ['hp', QFIN_HP], ['md', QFIN_MD], ['mh2', QFIN_MH2], ['mh3', QFIN_MH3], ['pr', QFIN_PR], ['rp', QFIN_RP], ['ru', QFIN_RU], ['ru3', QFIN_RU3], ['vr', QFIN_VR]]
var DIAG_SERIE = ''
QFIN = function () {
  DIAG_L.forEach(p => {
    var n0 = VB.q.length; DIAG_SERIE = p[0]
    try { p[1](); vlog('DIAG fin ' + p[0]) } catch (e) { vlog('DIAG erreur ' + p[0] + ' ' + e) }
    VB.q.length = n0
  })
  vlog('DIAG termine')
}
QFIN_VUES = function () { }
