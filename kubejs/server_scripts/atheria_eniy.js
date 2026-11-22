// Atheria - la boutique d'Eniy en bons CAF (Mika 22/11, mécanique validée : « Eniy achète le butin et vend du matériel ; les prix changent chaque semaine »).
// Le dialogue d'Eniy (kubejs/data/atheria/atheria_dialogues/eniy.json) lance : /atheria_eniy <joueur> tarifs | acheter <article> | vendre
//  - les prix varient chaque lundi (heure de La Réunion) de -25 % à +25 %, et un article de la semaine est à -40 % ;
//  - chaque semaine, Eniy recherche une marchandise : il la rachète deux fois plus cher ;
//  - les articles s'ouvrent selon le stade du joueur (atheria-bestiaire, tableau atheria_stade) : un débutant ne peut pas acheter un fusil ;
//  - le rayon « Outils » fait découvrir des mods du pack (cuisine, Create, sacs, couchage).
var ENIY_ARTICLES = [
  // [clé, nom, objet à donner (syntaxe /give), nombre, prix de base, stade mini, rayon]
  ['ration', 'Ration de la PAF', 'atheria:ration', 2, 5, 1, 'survie'],
  ['filtre', 'Filtre à charbon', 'atheria:filtre', 2, 6, 1, 'survie'],
  ['essence', 'Bidon d\'essence', 'atheria:bidon_essence', 1, 8, 1, 'survie'],
  ['fusee', 'Fusée éclairante', 'atheria:fusee_eclairante', 2, 6, 1, 'survie'],
  ['chocolat', 'Chocolat de Dubaï « artisanal »', 'atheria:chocolat_dubai', 1, 40, 1, 'survie'],
  ['bandage', 'Bandages', 'firstaid:bandage', 3, 4, 1, 'soins'],
  ['trousse', 'Trousse de soins', 'atheria:trousse_soins', 1, 10, 1, 'soins'],
  ['antifongique', 'Antifongique', 'atheria:antifongique', 1, 12, 2, 'soins'],
  ['morphine', 'Morphine', 'firstaid:morphine', 1, 15, 3, 'soins'],
  ['stimpack', 'Stimpack militaire', 'militaristic_armor:stimpack', 1, 25, 4, 'soins'],
  ['9mm', 'Munitions 9 mm (x20)', 'tacz:ammo[minecraft:custom_data={AmmoId:"tacz:9mm"}]', 20, 12, 2, 'armes'],
  ['12g', 'Cartouches calibre 12 (x10)', 'tacz:ammo[minecraft:custom_data={AmmoId:"tacz:12g"}]', 10, 14, 2, 'armes'],
  ['556', 'Munitions 5,56 mm (x20)', 'tacz:ammo[minecraft:custom_data={AmmoId:"tacz:556x45"}]', 20, 22, 3, 'armes'],
  ['308', 'Munitions .308 (x10)', 'tacz:ammo[minecraft:custom_data={AmmoId:"tacz:308"}]', 10, 26, 4, 'armes'],
  ['grenade', 'Grenade à fragmentation', 'tacz_tactical_breaching:frag_grenade', 1, 30, 4, 'armes'],
  ['masque', 'Masque à gaz', 'tacz_tactical_breaching:gas_mask', 1, 35, 2, 'equipement'],
  ['casque', 'Casque camouflé léger', 'militaristic_armor:light_camo_helmet', 1, 30, 2, 'equipement'],
  ['gilet', 'Gilet camouflé léger', 'militaristic_armor:light_camo_chestplate', 1, 45, 3, 'equipement'],
  ['plaque', 'Plaque de blindage légère', 'militaristic_armor:light_armor_plate', 1, 40, 3, 'equipement'],
  ['vision', 'Lunettes de vision nocturne', 'militaristic_armor:night_vision_goggles', 1, 120, 4, 'equipement'],
  ['marmite', 'Marmite (Farmer\'s Delight)', 'farmersdelight:cooking_pot', 1, 15, 1, 'outils'],
  ['sac', 'Sac à dos', 'sophisticatedbackpacks:backpack', 1, 20, 1, 'outils'],
  ['couchage', 'Sac de couchage', 'comforts:sleeping_bag_brown', 1, 10, 1, 'outils'],
  ['manivelle', 'Manivelle (Create)', 'create:hand_crank', 1, 12, 2, 'outils'],
  ['engrenage', 'Engrenages (Create, x4)', 'create:cogwheel', 4, 12, 2, 'outils']
]
var ENIY_RAYONS = { survie: 'Survie', soins: 'Soins', armes: 'Armes et munitions', equipement: 'Équipement', outils: 'Outils' }
// Ce qu'Eniy rachète : [objet, nom, prix pour un lot, taille du lot]
var ENIY_RACHAT = [
  ['atheria:echantillon_spore', 'échantillons de spores', 3, 1],
  ['spore:mutated_heart', 'cœurs mutés', 6, 1],
  ['spore:claw_fragment', 'fragments de griffe', 1, 4],
  ['spore:armor_fragment', 'fragments de carapace', 1, 4],
  ['spore:mutated_fiber', 'fibres mutées', 1, 8],
  ['minecraft:rotten_flesh', 'chair avariée', 1, 32]
]

function atheriaEniySemaine() {
  // semaines commençant le lundi à minuit, heure de La Réunion (UTC+4) ; le 1er janvier 1970 est un jeudi
  return Math.floor((Date.now() + 4 * 3600 * 1000 + 3 * 86400 * 1000) / (7 * 86400 * 1000))
}

function atheriaEniyHash(s) {
  var h = 2166136261
  for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0 }
  return h / 4294967296
}

function atheriaEniyPromo() {
  var w = atheriaEniySemaine()
  return ENIY_ARTICLES[Math.floor(atheriaEniyHash('promo' + w) * ENIY_ARTICLES.length)][0]
}

function atheriaEniyRecherche() {
  var w = atheriaEniySemaine()
  return ENIY_RACHAT[Math.floor(atheriaEniyHash('rachat' + w) * ENIY_RACHAT.length)][0]
}

function atheriaEniyPrix(a) {
  var f = 0.75 + atheriaEniyHash(a[0] + atheriaEniySemaine()) * 0.5
  if (a[0] == atheriaEniyPromo()) f *= 0.6
  return Math.max(1, Math.round(a[4] * f))
}

function atheriaEniyStade(p) {
  var sb = p.server.scoreboard, o = sb.getObjective('atheria_stade')
  if (!o) return 1
  var SH = Java.loadClass('net.minecraft.world.scores.ScoreHolder')
  return Math.max(1, sb.getOrCreatePlayerScore(SH.forNameOnly(p.username), o).get())
}

function atheriaEniyTarifs(p, rayon) {
  var stade = atheriaEniyStade(p), promo = atheriaEniyPromo()
  p.tell(Text.gold('— Eniy, ' + (rayon ? ENIY_RAYONS[rayon] : 'tarifs de la semaine') + ' —'))
  ENIY_ARTICLES.forEach(a => {
    if (rayon && a[6] != rayon) return
    var ligne = a[1] + ' : ' + atheriaEniyPrix(a) + ' bons'
    if (a[0] == promo) p.tell(Text.green(ligne + '  (promo de la semaine)'))
    else if (a[5] > stade) p.tell(Text.darkGray(ligne + '  (« Reviens quand tu seras plus solide. »)'))
    else p.tell(Text.gray(ligne))
  })
  if (!rayon) {
    var r = ENIY_RACHAT.filter(x => x[0] == atheriaEniyRecherche())[0]
    p.tell(Text.yellow('Eniy recherche cette semaine : ' + r[1] + ' (' + (r[2] * 2) + ' bons les ' + r[3] + ').'))
  }
  return 1
}

function atheriaEniyAcheter(p, cle) {
  var a = ENIY_ARTICLES.filter(x => x[0] == cle)[0]
  if (!a) return 0
  if (a[5] > atheriaEniyStade(p)) { p.tell(Text.gray('Eniy : « Ça, c\'est pour les clients qui ont survécu un peu plus longtemps. Reviens plus tard. »')); return 0 }
  var prix = atheriaEniyPrix(a)
  var dispo = atheriaCompter(p, 'atheria:bon_caf')
  if (dispo < prix) { p.tell(Text.red(a[1] + ' : ' + prix + ' bons. Il t\'en manque ' + (prix - dispo) + '. Eniy ne fait pas crédit.')); return 0 }
  if (atheriaRetirer(p, 'atheria:bon_caf', prix) !== prix) { p.tell(Text.red('Paiement refusé.')); return 0 }
  p.server.runCommandSilent('give ' + p.username + ' ' + a[2] + ' ' + a[3])
  p.tell(Text.yellow('Eniy encaisse ' + prix + ' bons pour : ' + a[1] + '. « Satisfait ou satisfait. »'))
  return 1
}

function atheriaEniyVendre(p) {
  var recherche = atheriaEniyRecherche(), total = 0, lignes = []
  ENIY_RACHAT.forEach(r => {
    var lots = Math.floor(atheriaCompter(p, r[0]) / r[3])
    if (lots <= 0) return
    var retire = atheriaRetirer(p, r[0], lots * r[3])
    lots = Math.floor(retire / r[3])
    var gain = lots * r[2] * (r[0] == recherche ? 2 : 1)
    total += gain
    lignes.push(lots * r[3] + ' ' + r[1] + ' : ' + gain + ' bons')
  })
  if (total == 0) { p.tell(Text.gray('Eniy : « Tu n\'as rien que je veuille. Des spores, des fragments, de la chair : voilà ce qui se vend. »')); return 0 }
  p.server.runCommandSilent('give ' + p.username + ' atheria:bon_caf ' + total)
  lignes.forEach(l => p.tell(Text.gray(l)))
  p.tell(Text.yellow('Eniy te tend ' + total + ' bons. « Le marché te remercie. »'))
  return 1
}

ServerEvents.commandRegistry(event => {
  var { commands: Commands, arguments: Arg } = event
  event.register(Commands.literal('atheria_eniy').requires(src => src.hasPermission(2))
    .then(Commands.argument('joueur', Arg.PLAYER.create(event))
      .then(Commands.literal('tarifs').executes(ctx => atheriaEniyTarifs(Arg.PLAYER.getResult(ctx, 'joueur'), null))
        .then(Commands.argument('rayon', Arg.STRING.create(event)).executes(ctx => atheriaEniyTarifs(Arg.PLAYER.getResult(ctx, 'joueur'), String(Arg.STRING.getResult(ctx, 'rayon'))))))
      .then(Commands.literal('acheter').then(Commands.argument('article', Arg.STRING.create(event))
        .executes(ctx => atheriaEniyAcheter(Arg.PLAYER.getResult(ctx, 'joueur'), String(Arg.STRING.getResult(ctx, 'article'))))))
      .then(Commands.literal('vendre').executes(ctx => atheriaEniyVendre(Arg.PLAYER.getResult(ctx, 'joueur'))))))
})
