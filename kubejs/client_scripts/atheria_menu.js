// Atheria - menu principal épuré : FancyMenu ne peut pas masquer ces boutons, on les retire ici.
var ATHERIA_BOUTONS_RETIRES = /SpriteIconButton|supplementaries\..*ConfigButton|OpenCreateMenuButton/
var ATHERIA_ECRAN_TITRE = /\.TitleScreen@/

// Priorité la plus basse : Create ajoute son bouton pendant ce même événement
NativeEvents.onEvent('LOWEST', 'net.neoforged.neoforge.client.event.ScreenEvent$Init$Post', event => {
  try {
    // KubeJS interdit getClass() : le nom de la classe se lit dans le texte de l'objet
    if (!ATHERIA_ECRAN_TITRE.test('' + event.getScreen())) return
    var retires = []
    event.getListenersList().forEach(w => {
      if (ATHERIA_BOUTONS_RETIRES.test('' + w)) retires.push(w)
    })
    retires.forEach(w => event.removeListener(w))
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
