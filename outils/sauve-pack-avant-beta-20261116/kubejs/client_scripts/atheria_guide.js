// Atheria - Guide du survivant : ouvert avec F4, depuis le menu pause et l'inventaire, à tout moment.
// Les livrets de MTS mènent ici, et un rappel apparaît la première fois qu'on touche à une mécanique.
var ATHERIA_GUIDE_TOUCHE = 293 // F4, libre dans le jeu de base et dans le pack
var ATHERIA_LIVRETS = { 'mts:mts.handbook_car': 'vehicules', 'mts:mts.handbook_plane': 'aeronefs' }
var ATHERIA_AIDES_FICHIER = 'kubejs/config/atheria_aides.json'
var ATHERIA_AIDES = [
  { id: 'arme', objet: /^tacz:modern_kinetic_gun/, texte: 'Arme : R recharger, G mode de tir, clic droit viser. Chaque tir attire les infectés.' },
  { id: 'soin', objet: /^firstaid:/, texte: 'Soins : clic droit avec l\'objet, puis choisis la partie du corps. J montre tes blessures.' },
  { id: 'create', objet: /^create:/, texte: 'Create : survole un objet dans l\'inventaire et maintiens Z pour voir comment il marche.' },
  { id: 'parkour', objet: /^parcool:/, texte: 'Parkour : CTRL pour courir vite, V pour t\'accrocher, Alt pour glisser, F pour amortir une chute.' }
]
var atheriaGuideAppuye = false
var atheriaAides = null
var atheriaAidesTemps = 0

function atheriaOuvrirGuide(chapitre) {
  Java.loadClass('fr.atheria.monde.guide.GuideEcran').ouvrir(chapitre || null, null)
}

function atheriaAider(joueur, id, texte) {
  if (atheriaAides == null) atheriaAides = JsonIO.read(ATHERIA_AIDES_FICHIER) || {}
  if (atheriaAides[id]) return
  atheriaAides[id] = true
  JsonIO.write(ATHERIA_AIDES_FICHIER, atheriaAides)
  joueur.displayClientMessage(Component.string(texte + ' Plus de détails : F4.').gray(), false)
}

ClientEvents.tick(event => {
  var mc = Client
  try {
    var bas = Java.loadClass('com.mojang.blaze3d.platform.InputConstants').isKeyDown(mc.getWindow().getWindow(), ATHERIA_GUIDE_TOUCHE)
    if (bas && !atheriaGuideAppuye && mc.screen == null && mc.player != null) atheriaOuvrirGuide(null)
    atheriaGuideAppuye = bas
    var joueur = mc.player
    if (joueur == null) return
    atheriaAidesTemps++
    if (atheriaAidesTemps % 20 != 0) return
    var objet = '' + joueur.getMainHandItem().getId()
    ATHERIA_AIDES.forEach(a => { if (a.objet.test(objet)) atheriaAider(joueur, a.id, a.texte) })
    if (joueur.getY() < 20 && !joueur.level.canSeeSky(joueur.blockPosition())) atheriaAider(joueur, 'mine', 'Mine : un plafond trop large s\'écroule, et sous le niveau 0, une flamme peut faire exploser une poche de gaz.')
  } catch (e) {
    console.error('[Atheria guide] ' + e)
  }
})

// Clic droit sur un livret MTS : le guide s'ouvre au bon chapitre
Object.keys(ATHERIA_LIVRETS).forEach(id => {
  ItemEvents.rightClicked(id, event => {
    atheriaOuvrirGuide(ATHERIA_LIVRETS[id])
    event.cancel()
  })
})

// Boutons : menu pause et inventaire. Priorité la plus basse, sinon FancyMenu les retire.
NativeEvents.onEvent('LOWEST', 'net.neoforged.neoforge.client.event.ScreenEvent$Init$Post', event => {
  try {
    var ecran = event.getScreen()
    var nom = '' + ecran
    var Button = Java.loadClass('net.minecraft.client.gui.components.Button')
    var Texte = Java.loadClass('net.minecraft.network.chat.Component')
    if (/\.PauseScreen@/.test(nom)) {
      event.addListener(Button.builder(Texte.literal('GUIDE'), b => atheriaOuvrirGuide(null)).bounds(Math.floor(ecran.width / 2) - 37, Math.floor(ecran.height / 4) + 170, 74, 16).build())
    } else if (/\.InventoryScreen@/.test(nom)) {
      event.addListener(Button.builder(Texte.literal('?'), b => atheriaOuvrirGuide(null)).bounds(ecran.getGuiLeft() + 156, ecran.getGuiTop() - 16, 16, 14).build())
    }
  } catch (e) {
    console.error('[Atheria guide] ' + e)
  }
})
