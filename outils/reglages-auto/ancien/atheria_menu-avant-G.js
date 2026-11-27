// Atheria - menu principal épuré : FancyMenu ne peut pas masquer ces boutons, on les retire ici.
var ATHERIA_BOUTONS_RETIRES = /SpriteIconButton|supplementaries\..*ConfigButton|OpenCreateMenuButton/
var ATHERIA_ECRAN_TITRE = /\.TitleScreen@/
var ATHERIA_ECRAN_PAUSE = /\.PauseScreen@/
var ATHERIA_FOND = 'atheria:textures/gui/fond_menu.png'
var ATHERIA_VOILE = -1728053248 // noir à 60 %

// APPARENCE : ouvre la garde-robe Essential (skins et cosmétiques), placée entre MULTIJOUEUR et OPTIONS
function atheriaAjouterApparence(event, ecran, x, y) {
  var ImageButton = Java.loadClass('net.minecraft.client.gui.components.ImageButton')
  var WidgetSprites = Java.loadClass('net.minecraft.client.gui.components.WidgetSprites')
  var images = new WidgetSprites('atheria:menu_apparence', 'atheria:menu_apparence_survol')
  event.addListener(new ImageButton(x, y, 120, 16, images, b => {
    Client.setScreen(new (Java.loadClass('gg.essential.gui.wardrobe.Wardrobe'))())
  }))
}

// Priorité la plus basse : Create ajoute son bouton pendant ce même événement
NativeEvents.onEvent('LOWEST', 'net.neoforged.neoforge.client.event.ScreenEvent$Init$Post', event => {
  try {
    // KubeJS interdit getClass() : le nom de la classe se lit dans le texte de l'objet
    if (ATHERIA_ECRAN_PAUSE.test('' + event.getScreen())) {
      // En partie : centre, sous le dernier bouton du menu
      atheriaAjouterApparence(event, event.getScreen(), Math.floor(event.getScreen().width / 2) - 31, Math.floor(event.getScreen().height / 4) + 150)
      return
    }
    if (!ATHERIA_ECRAN_TITRE.test('' + event.getScreen())) return
    var retires = []
    event.getListenersList().forEach(w => {
      if (ATHERIA_BOUTONS_RETIRES.test('' + w)) retires.push(w)
    })
    retires.forEach(w => event.removeListener(w))
    atheriaAjouterApparence(event, event.getScreen(), 44, Math.floor(event.getScreen().height / 2) + 10)
  } catch (e) {
    console.error('[Atheria menu] ' + e)
  }
})

// Simple Blood ajoute le sien après cet événement : on le rend invisible et inactif une fois l'écran ouvert
NativeEvents.onEvent('net.neoforged.neoforge.client.event.ClientTickEvent$Post', event => {
  var ecran = Client.screen
  if (!ecran || !ATHERIA_ECRAN_TITRE.test('' + ecran)) return
  try {
    ecran.children().forEach(w => {
      if (/BloodButton@/.test('' + w) && w.visible) {
        w.visible = false
        w.active = false
      }
    })
  } catch (e) {
    console.error('[Atheria menu] ' + e)
  }
})

// Tous les menus hors partie (options, multijoueur...) reprennent le fond de l'accueil, assombri pour la lecture.
// L'accueil a son propre fond dans FancyMenu, et les menus en partie gardent le jeu visible derrière.
var atheriaFondErreur = false
NativeEvents.onEvent('net.neoforged.neoforge.client.event.ScreenEvent$BackgroundRendered', event => {
  if (atheriaFondErreur || Client.level) return
  var ecran = event.getScreen()
  if (ATHERIA_ECRAN_TITRE.test('' + ecran)) return
  try {
    var g = event.getGuiGraphics()
    var l = ecran.width
    var h = ecran.height
    g['blit(net.minecraft.resources.ResourceLocation,int,int,float,float,int,int,int,int)'](ATHERIA_FOND, 0, 0, 0.0, 0.0, l, h, l, h)
    g.fill(0, 0, l, h, ATHERIA_VOILE)
  } catch (e) {
    atheriaFondErreur = true
    console.error('[Atheria menu] ' + e)
  }
})
