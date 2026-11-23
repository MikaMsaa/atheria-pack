// ================= BANC DES GARES (lot64, 13/11) : trains valides integres a la gare haussmannienne et a la gare de fret rouille =================
var QFIN_GARES = function () {
  HB2 = true; FIN = true; THM = THM_HF
  lot(function () { HM = {}; FIN_VOLET = null; FIN_RID = null; hb2Gare(); finAncrage() }, 0, 0, 999, 431, 32, 26)
  THM = THM_RU
  lot(QF(ruGare, null, ['white', 'light_gray', 'brown']), 48, 0, 999, 961, 32, 18)
  HB2 = false; FIN = false; THM = null; HM = {}
}
function vuesGares() {
  // gare haussmannienne : voies B (z10) et C (z18), quais P1 z4..7, P2 z13..16, P3 z20..21
  vue('g_hb_quai_p2', 0, 0, 30, 2.6, 14.5, 4, 2, 11)
  vue('g_hb_quai_p2_c', 0, 0, 2, 2.6, 14.5, 28, 2, 18)
  vue('g_hb_quai_p3', 0, 0, 30, 2.6, 20.5, 6, 2, 18)
  vue('g_hb_dessus', 0, 0, 16, 24, 40, 16, 2, 12)
  vue('g_hb_bogie', 0, 0, 12, 1.4, 14.2, 15, 0.5, 18)
  // gare de fret : voies z18 et z23, quai z13..15
  vue('g_ru_quai', 48, 0, 30, 2.6, 14.5, 6, 2, 19)
  vue('g_ru_voies', 48, 0, 34, 6, 27, 14, 1.5, 20)
  vue('g_ru_citerne', 48, 0, 10, 3, 25.5, 24, 2, 23)
  vue('g_ru_dessus', 48, 0, 16, 26, 38, 16, 2, 18)
}
