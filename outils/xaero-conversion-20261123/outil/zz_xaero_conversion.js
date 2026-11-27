// Atheria - OUTIL (jamais dans le pack) : conversion complète de la World Map Xaero depuis la sauvegarde d'un monde solo.
// Utilise la fonction intégrée de Xaero « Convert All Regions » (MapDimension.startFullMapReload(couche, resave=true, ...)).
// Le résultat est écrit par Xaero dans xaero/world-map/<monde>/null/cm$converted/ : des données « normales »,
// les mêmes qu'en multijoueur, à copier dans Multiplayer_91.197.6.18/null/mw$-1269157683/.
// Suivi : logs/kubejs/client.log (lignes [XAERO-CONV]) et kubejs/config/xaero_conversion_etat.json.
var XC_ETAT = 'kubejs/config/xaero_conversion_etat.json'
var XC_SURFACE = 2147483647 // Integer.MAX_VALUE = couche de surface (pas les grottes)
var xcTicks = 0
var xcDebut = 0
var xcFinTick = -1
var xcLance = false
var xcFini = false

function xcEcrire(etat) {
  try { JsonIO.write(XC_ETAT, etat) } catch (e) { console.info('[XAERO-CONV] ecriture etat impossible ' + e) }
}

ClientEvents.tick(function (event) {
  xcTicks++
  if (xcTicks % 40 != 0) return
  if (xcFini) return
  try {
    var WMS = Java.loadClass('xaero.map.WorldMapSession')
    var s = WMS.getCurrentSession()
    if (s == null) return
    var mp = s.getMapProcessor()
    if (mp == null || mp.getMapWorld() == null) return
    var dim = mp.getMapWorld().getCurrentDimension()
    if (dim == null) return
    if (!xcLance) {
      if (xcTicks < 600) return // laisser Xaero finir de détecter les régions (~30 s)
      if (!dim.isUsingWorldSave()) {
        console.info('[XAERO-CONV] ERREUR : la carte n utilise pas la sauvegarde du monde (solo attendu)')
        xcEcrire({ etat: 'erreur', raison: 'pas en mode sauvegarde' })
        xcFini = true
        return
      }
      dim.startFullMapReload(XC_SURFACE, true, mp)
      xcLance = true
      xcDebut = Date.now()
      console.info('[XAERO-CONV] DEBUT conversion de toutes les regions')
      xcEcrire({ etat: 'en_cours', debut: xcDebut })
      return
    }
    if (xcFinTick < 0) {
      if (dim.getFullReloader() == null) {
        xcFinTick = xcTicks
        console.info('[XAERO-CONV] FIN conversion en ' + Math.round((Date.now() - xcDebut) / 1000) + ' s, attente ecriture des caches')
        xcEcrire({ etat: 'conversion_finie', debut: xcDebut, fin: Date.now() })
      } else if (xcTicks % 1200 == 0) {
        console.info('[XAERO-CONV] en cours depuis ' + Math.round((Date.now() - xcDebut) / 1000) + ' s')
      }
      return
    }
    // Après la conversion : vue d'ensemble de la carte (capture), puis 5 min de marge pour l'écriture, puis arrêt.
    var apres = xcTicks - xcFinTick
    if (apres == 200) {
      var srv = Client.getSingleplayerServer()
      srv.execute(function () { srv.getCommands().performPrefixedCommand(srv.createCommandSourceStack(), 'tp @a 0 200 0') })
    }
    if (apres == 600) {
      var GuiMap = Java.loadClass('xaero.map.gui.GuiMap')
      Client.setScreen(new GuiMap(null, null, mp, Client.getCameraEntity()))
      console.info('[XAERO-CONV] carte ouverte, dezoom')
    }
    if (apres > 600 && apres < 1400 && Client.screen != null) {
      Client.screen.mouseScrolled(960, 540, 0, -1)
    }
    if (apres == 2400 || apres == 4800) {
      Java.loadClass('net.minecraft.client.Screenshot').grab(Client.gameDirectory, 'xaero-conversion-vue-' + apres + '.png', Client.getMainRenderTarget(), function (m) {})
      console.info('[XAERO-CONV] capture vue d ensemble ' + apres)
    }
    if (apres > 6000) {
      xcFini = true
      console.info('[XAERO-CONV] ARRET du jeu')
      xcEcrire({ etat: 'fini', debut: xcDebut, fin: Date.now() })
      Client.stop()
    }
  } catch (e) {
    console.info('[XAERO-CONV] ERREUR ' + e)
    xcEcrire({ etat: 'erreur', raison: String(e) })
    xcFini = true
  }
})
