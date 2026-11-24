// Atheria - carnet du survivant (Mika 22/11, idée validée) : découvrir le pack en jouant, sans lire de guide.
//  - la première fois qu'un joueur obtient un objet clé d'un mod, une phrase lui dit à quoi il sert ;
//  - la première fois qu'il abat un infecté d'une famille, le carnet note la famille et sa faiblesse ;
//  - /carnet montre ce qui est découvert (objets et familles), avec ce qui reste à trouver.
var CARNET_OBJETS = [
  // [motif d'identifiant, nom, conseil]
  [/^tacz:modern_kinetic_gun$/, 'Arme à feu', 'R pour recharger. Chaque tir sans silencieux s\'entend de loin : les infectés viennent au bruit.'],
  [/^tacz:ammo$/, 'Munitions', 'Rares. Les munitions se fabriquent aussi à l\'établi d\'armurier (TaCZ) avec de la poudre et du métal.'],
  [/^tacz:gun_smith_table$/, 'Établi d\'armurier', 'Fabrique armes, munitions et accessoires (silencieux, viseurs). Pose-le dans ta base.'],
  [/^tacz:attachment$/, 'Accessoire d\'arme', 'Se monte sur une arme depuis l\'inventaire. Un silencieux évite d\'attirer la horde.'],
  [/gas_mask$/, 'Masque à gaz', 'Avec un filtre, il protège dans la zone contaminée et pendant les tempêtes de cendres.'],
  [/^atheria:filtre$/, 'Filtre', 'Se visse tout seul sur ton masque quand l\'air devient toxique. Il s\'use.'],
  [/^atheria:bidon_essence$/, 'Bidon d\'essence', 'Remplit le réservoir d\'un véhicule. Un bidon vide se remplit en siphonnant une épave.'],
  [/^firstaid:/, 'Soins (First Aid)', 'Chaque partie du corps a sa vie. Appuie sur H pour ouvrir le menu de santé et soigner la bonne partie.'],
  [/^atheria:trousse_soins$/, 'Trousse de soins', 'Soigne plus que des bandages. À garder pour les gros combats.'],
  [/^farmersdelight:cooking_pot$/, 'Marmite', 'Posée sur un feu de camp, elle cuisine des repas qui nourrissent bien plus que la viande seule.'],
  [/^farmersdelight:.*knife$/, 'Couteau de cuisine', 'Sur une planche à découper, il tire plus de nourriture des récoltes et des animaux.'],
  [/^sophisticatedbackpacks:.*backpack$/, 'Sac à dos', 'B pour l\'ouvrir sans le poser. Il s\'améliore (aimant, tri, nourriture automatique).'],
  [/^comforts:sleeping_bag_/, 'Sac de couchage', 'Pour dormir dehors sans changer ton point de réapparition.'],
  [/^comforts:hammock_/, 'Hamac', 'Pour passer le jour en sécurité : on y dort de jour.'],
  [/^create:(cogwheel|shaft|hand_crank|andesite_alloy)$/, 'Mécanique Create', 'Une manivelle fait tourner un engrenage, qui fait tourner une machine. Moulins, scies, presses : tout se construit.'],
  [/^landmines:/, 'Mine', 'Se pose au sol et explose au passage. Elle ne fait pas la différence entre un infecté et un allié.'],
  [/^lrtactical:throwable$/, 'Projectile', 'Clic droit pour lancer. Le cocktail Molotov met le feu à un groupe d\'infectés.'],
  [/^atheria:bon_caf$/, 'Bons CAF', 'La monnaie de Longoni. Eniy vend presque tout contre des bons, et rachète tes fragments Spore.'],
  [/^spore:(claw_fragment|armor_fragment|mutated_fiber|mutated_heart)$/, 'Butin Spore', 'Ce que les infectés laissent. Eniy le rachète, et il sert à fabriquer l\'équipement Spore.'],
  [/^atheria:echantillon_spore$/, 'Échantillon de spores', 'Utile aux chercheurs et vendu cher à Eniy.']
]
var CARNET_FAMILLES = [
  // [nom, ids, faiblesse]
  ['Contaminés', ['spore:inf_human', 'spore:inf_villager', 'spore:inf_wanderer', 'spore:inf_player', 'spore:inf_diseased_villager'], 'lents mais nombreux : ne te laisse pas encercler.'],
  ['Dakouane', ['minecraft:zombie', 'minecraft:husk', 'minecraft:zombie_villager'], 'ils vont en groupe : recule dans un couloir.'],
  ['Cendreux', ['spore:inf_husk', 'spore:thorn', 'spore:scavenger', 'spore:jagd', 'spore:hollen'], 'ils sortent des cendres : surveille le sol gris.'],
  ['Noyés', ['spore:inf_drowned', 'minecraft:drowned', 'spore:naiad', 'spore:bloater', 'spore:nuclea'], 'ne te bats pas dans l\'eau.'],
  ['Rôdeurs', ['spore:stalker'], 'ils frappent dans le dos : garde un mur derrière toi.'],
  ['Chimiks', ['spore:braiomil'], 'ils entendent tout : marche accroupi.'],
  ['Sirènes', ['spore:howler'], 'leur cri appelle la horde : abats-les en premier.'],
  ['Pleureuses', ['spore:inf_witch', 'spore:inebriater'], 'elles empoisonnent : garde du lait ou un antidote.'],
  ['Cracheurs', ['spore:spitter', 'spore:mephitic', 'spore:gorgon'], 'ils crachent de loin : approche à couvert.'],
  ['Gonflés', ['spore:volatile', 'spore:busser', 'spore:griefer'], 'ils explosent : tire de loin.'],
  ['Sauteurs', ['spore:leaper', 'spore:slasher', 'spore:scamper'], 'ils bondissent : une arme à dispersion les arrête.'],
  ['Blouses', ['spore:inf_hazmat', 'spore:chemist', 'spore:conductor', 'spore:lacerator', 'spore:plagued'], 'ils sortent des labos : un masque aide.'],
  ['Soldats de la ICE', ['spore:inf_pillager', 'spore:inf_vindicator', 'spore:knight', 'spore:hvindicator', 'spore:inquisitor', 'spore:hevoker'], 'blindés : vise la tête et prends des munitions perforantes.'],
  ['Koro', ['spore:brute', 'spore:gargoyle', 'spore:ogre', 'spore:protector', 'spore:brot'], 'très résistants : à plusieurs, ou pas du tout.'],
  ['Hyper du froid', ['spore:wendigo', 'spore:grober'], 'au sommet du Bénara : prépare-toi au froid et au combat.']
]

function atheriaCarnetListe(p, cle) {
  var s = String(p.persistentData.getString(cle) || '')
  return s ? s.split('|') : []
}

function atheriaCarnetNoter(p, cle, nom) {
  var l = atheriaCarnetListe(p, cle)
  if (l.indexOf(nom) >= 0) return false
  l.push(nom)
  p.persistentData.putString(cle, l.join('|'))
  return true
}

PlayerEvents.inventoryChanged(event => {
  var p = event.player
  if (!p || event.item.isEmpty()) return
  var id = String(event.item.id)
  for (var i = 0; i < CARNET_OBJETS.length; i++) {
    var o = CARNET_OBJETS[i]
    if (!o[0].test(id)) continue
    if (atheriaCarnetNoter(p, 'atheria_carnet_objets', o[1])) {
      routeXp(p, 10)
      atheriaHud(p, { t: 'note', titre: o[1], texte: o[2] })
      p.server.runCommandSilent('playsound minecraft:item.book.page_turn player ' + p.username + ' ~ ~ ~ 0.8 1')
    }
    return
  }
})

EntityEvents.death(event => {
  var src = event.source
  var p = src ? src.player : null
  if (!p || !p.isPlayer()) return
  var id = '' + event.entity.getEncodeId()
  for (var i = 0; i < CARNET_FAMILLES.length; i++) {
    var f = CARNET_FAMILLES[i]
    if (f[1].indexOf(id) < 0) continue
    if (atheriaCarnetNoter(p, 'atheria_carnet_familles', f[0])) {
      routeXp(p, 20)
      var n = atheriaCarnetListe(p, 'atheria_carnet_familles').length
      atheriaHud(p, { t: 'note', titre: f[0], compte: n + '/' + CARNET_FAMILLES.length, texte: f[2] })
      p.server.runCommandSilent('playsound minecraft:item.book.page_turn player ' + p.username + ' ~ ~ ~ 0.8 1')
    }
    return
  }
})

ServerEvents.commandRegistry(event => {
  event.register(event.commands.literal('carnet').executes(ctx => {
    var p = ctx.source.player
    if (!p) return 0
    var objets = atheriaCarnetListe(p, 'atheria_carnet_objets'), familles = atheriaCarnetListe(p, 'atheria_carnet_familles')
    // Le carnet animé du mod atheria_hud s'ouvre à l'écran ; le chat ne sert plus qu'en secours
    if (typeof atheriaHud === 'function') {
      atheriaHud(p, { t: 'carnet', json: JSON.stringify({
        familles: CARNET_FAMILLES.map(f => [f[0], familles.indexOf(f[0]) >= 0 ? f[2] : null]),
        objets: CARNET_OBJETS.filter(o => objets.indexOf(o[1]) >= 0).map(o => [o[1], o[2]]),
        totalObjets: CARNET_OBJETS.length
      }) })
      return 1
    }
    p.tell(Text.gold('— Carnet du survivant —'))
    p.tell(Text.yellow('Familles d\'infectés : ' + familles.length + '/' + CARNET_FAMILLES.length))
    CARNET_FAMILLES.forEach(f => p.tell(familles.indexOf(f[0]) >= 0 ? Text.gray('  ' + f[0] + ' : ' + f[2]) : Text.darkGray('  ???')))
    p.tell(Text.yellow('Matériel découvert : ' + objets.length + '/' + CARNET_OBJETS.length))
    CARNET_OBJETS.forEach(o => { if (objets.indexOf(o[1]) >= 0) p.tell(Text.gray('  ' + o[1] + ' : ' + o[2])) })
    return 1
  }))
})
