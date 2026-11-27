// Atheria - soirée live « La barge fantôme » (samedi 9/1, 21 h Paris ; Acte IV, doc « Soirées live d'Atheria »).
// Une barge partie de Petite-Terre dérive dans le lagon, entre Grande-Terre et Petite-Terre, envahie d'infectés.
// Sa cale fermée garde une cargaison rare. Exploration en groupe, sans PvP imposé.
// Déroulé (/live barge start) :
//  1. annonce radio 30 min avant ; à l'heure, la barge apparaît (modèle du fil de la carte, posé bloc par bloc),
//     un repère s'ajoute aux cartes et chaque joueur reçoit une barque ;
//  2. quand un joueur approche, la barge se remplit : infectés sur le pont garage, dans la cale ouverte et sur la
//     passerelle, gardiens dans la cale fermée (porte de fer à bouton), noyés autour de la coque ;
//     15 minutes plus tard, une seconde vague remonte de la cale ;
//  3. atteindre le fond de la cale fermée (trois coffres militaires Lootr, chacun les siens) rapporte 100 points ;
//  4. à 42 minutes, la barge prend l'eau ; à 47 minutes elle coule : qui a atteint la cale et s'en est éloigné
//     d'au moins 30 blocs gagne 50 points de plus. La barge est alors retirée et le lagon rendu à l'eau.
// Score : 10 par infecté de la barge abattu, 100 pour la cale, 50 pour la sortie.
// Pour une copie de la barge ailleurs : changer BARGE.origine (coin nord-ouest du bas ; mer au niveau 62 = y 59).
var BARGE = {
  origine: [3121, 59, -933],
  taille: [48, 20, 17],
  niveauEau: 62,          // surface du lagon : au retrait, eau jusque-là, air au-dessus
  palette: ["minecraft:black_concrete", "minecraft:blue_concrete", "minecraft:iron_block", "minecraft:air", "minecraft:polished_andesite_stairs[facing=east,half=bottom,shape=straight,waterlogged=false]", "minecraft:white_concrete", "minecraft:brown_terracotta", "minecraft:iron_bars[east=true,west=true,north=false,south=false,waterlogged=false]", "minecraft:gray_concrete", "minecraft:gray_concrete_powder", "minecraft:terracotta", "minecraft:polished_andesite", "minecraft:orange_terracotta", "minecraft:coal_block", "minecraft:light_gray_concrete", "minecraft:chain", "minecraft:ladder[facing=south,waterlogged=false]", "minecraft:iron_trapdoor[facing=south,half=top,open=false,powered=false,waterlogged=false]", "minecraft:blackstone", "minecraft:cobweb", "minecraft:iron_trapdoor[facing=north,half=bottom,open=false,powered=false,waterlogged=false]", "minecraft:spruce_planks", "minecraft:stripped_spruce_wood", "minecraft:polished_blackstone", "minecraft:tinted_glass", "lootr:lootr_barrel[facing=up,open=false]", "minecraft:gravel", "minecraft:ladder[facing=north,waterlogged=true]", "minecraft:ladder[facing=north,waterlogged=false]", "minecraft:lantern[hanging=true,waterlogged=false]", "minecraft:barrel", "minecraft:ladder[facing=west,waterlogged=false]", "minecraft:smooth_stone", "minecraft:iron_bars[east=false,west=false,north=true,south=true,waterlogged=false]", "minecraft:glass_pane[east=true,west=true,north=false,south=false,waterlogged=false]", "minecraft:chain[axis=y,waterlogged=false]", "minecraft:quartz_stairs[facing=east,half=bottom,shape=straight,waterlogged=false]", "minecraft:quartz_slab[type=bottom,waterlogged=false]", "minecraft:iron_trapdoor", "minecraft:ladder[facing=south,waterlogged=true]", "minecraft:quartz_stairs[facing=west,half=bottom,shape=straight,waterlogged=false]", "minecraft:glass_pane[east=false,west=false,north=true,south=true,waterlogged=false]", "minecraft:smooth_stone_slab[type=bottom,waterlogged=false]", "minecraft:polished_andesite_slab[type=top,waterlogged=false]", "minecraft:gray_terracotta", "minecraft:lever[face=floor,facing=north,powered=true]", "minecraft:spruce_stairs[facing=south,half=bottom,shape=straight,waterlogged=false]", "minecraft:lever[face=floor,facing=north,powered=false]", "minecraft:iron_bars[east=false,west=false,north=false,south=false,waterlogged=false]", "minecraft:lantern[hanging=false,waterlogged=false]", "minecraft:barrel[facing=up,open=false]", "minecraft:white_terracotta", "minecraft:stone_button[face=wall,facing=west,powered=false]", "minecraft:iron_door[facing=east,half=lower,hinge=left,open=false,powered=false]", "minecraft:iron_door[facing=east,half=upper,hinge=left,open=false,powered=false]", "minecraft:ladder[facing=east,waterlogged=false]", "minecraft:stone_button[face=wall,facing=east,powered=false]", "minecraft:stripped_dark_oak_wood", "minecraft:dark_oak_planks", "lootr:lootr_chest[facing=west,type=single,waterlogged=false]"],
  lettres: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#$%&*+-',
  rangees: (
    '.48; .3;A42;.3; ..A44;.. .A46;. A48; A48; A48; A48; A48; A48; A48; A48; A48; .A46;. ..A44;.. .3;A42;.3; .48; .12;b.22;b.12; .3;B42;.3; ..BC42;B.. .BDCLC3;LCLLC19;LLC3;L3;' +
    'C3;LCCDB. BDDC16;LC9;LCLC5;LC7;DDB BDDC9;L4;CLC6;LLCCLLCLCCLC5;LC4;DDB BDDCCLLCCLC6;LC15;LCLCCLC7;DDB BDDCLCLC5;LC4;LLCCLC3;LC4;LCLC7;L4;CDDB BDDC4;LLCLCCLLCCLCLC7;LLCCLC' +
    'LC3;LC7;DDB BDDC5;LCCLCCLC11;LCCLC4;LCCLCCLC4;DDB BDDC6;LLCCLCLC9;LC8;LCLLC3;LLCCDDB BDDC3;L3;CLC3;LC3;LC3;LLC5;LCCLC10;LCDDB BDDC3;LC7;LCLLC9;LC4;LC6;LC5;DDB .BDCLC5;LCL' +
    'C4;LCCLC8;LC3;L3;C4;L3;CCDB. ..BC42;B.. .3;B42;.3; .20;n.27; .12;b.22;b.12; .3;B42;.3; ..BC42;B.. .BDCDDQD11;jD8;jD4;CD11;CDB. CCDCD16;eeD10;CD3;+*D3;-DDCDDB CCDCD5;VVD21' +
    ';CD11;CDDB CCDCD5;WD22;CD11;CDDB CCDCD28;CD6;*D4;CDDB CCDCD28;#DD*D6;-DCDDB CCDCD28;CD6;*D4;CDDB CCDCD28;CD11;CDDB CCDCD10;eWD16;CD11;CDDB CCDCD7;ZDDWD7;ZDWeD6;CD3;+*D3;-' +
    'DDCDDB .BDCD14;jD8;jD4;CD11;CDB. ..BC42;B.. .3;B42;.3; .20;n.27; .12;b.22;b.12; .3;BBGBGB5;GBGB4;GB8;GB6;GB5;GBB.3; ..BC42;B.. .BDCDDQD11;jD8;jD4;CD11;CDB. DECCD16;VD11;C' +
    'D3;*+D6;CDDB DECCD5;WD22;CD11;CDDB DECCD22;TD5;CD11;CDDB DECCD28;CD11;CDDB DECCD9;dD3;TD14;$D5;dD5;CDDB DECCD4;TD22;!C&D10;CDDB DECCD25;TDDCD11;CDDB DECCD10;VeD16;CD11;CD' +
    'DB DECCD20;eD7;CD3;*D7;CDDB .BDCD14;jD8;jD4;CD11;CDG. ..BC42;B.. .3;B4;GBGB11;GB7;GB11;GGBB.3; .20;n.27; .12;c.22;c.12; .3;FMF11;GF4;MFFGMF4;MF7;KF3;MFF.3; ..FI20;SI11;XI' +
    '9;M.. .FIGIIRIJI14;NI12;XI9;F. DDEI6;XI8;NI12;XI6;JI8;F DDEJIOIO7;IO10;IIOI4;OI3;OXOIO3;I4;F DDEI19;GIGIIXI3;JXIIGIGIIJIIXI3;G DDEI16;NJIINI23;F DDEI13;NI15;SI10;XI3;F DD' +
    'EINOIOOSO6;IOOI4;OOIIOOIOOIOIO4;IO3;I4;F DDEI6;GI3;GI5;JI8;NI3;XI3;XIISI3;SI3;F DDEIIJSI18;NI21;F DDEI15;JI3;NGI5;SI11;SI5;F .FI5;JI3;SGXI5;NI19;XI6;F. ..GIGI8;XI4;XI8;GI' +
    'XI8;GIINI3;F.. .3;KF4;GFKFGMF4;GF7;GF6;GF11;.3; .20;Q.27; .12;c.22;c.12; .3;F5;MF6;MF13;MF7;GFFMF4;.3; ..F.42;F.. .F.9;a.10;s6;.6;O4;.8;F. D3;.19;s6;.6;O4;.8;DC D3;.19;s6' +
    ';.13;FG.3;DG D3;.38;GF.3;DC D3;.5;FGFG.19;a.9;FG.3;DC D3;.5;FGFG.7;m.21;FF.3;DC D3;.43;DG D3;.13;F4;DF6;DF4;.5;GB3;.5;DC D3;.10;GGfFD14;F.5;GGBG.5;DC D3;..P.7;GO.D16;.14;' +
    'DC .G.11;OO.FDkD12;F.7;a.6;M. ..F.10;GO.F16;.13;F.. .3;F6;GF18;GF3;MF12;.3; .20;Q.27; .48; .6;H.H.HHDH5;.H4;.HH.H3;.HH..D.HH.HH.HH.3; ..H.42;H.. .22;H4;zz.6;UYYU.8;H. .23' +
    ';W..Yz.6;UYYU.9;H .24;y.zz.13;UU.4;h .41;DY.4;h .8;UDYU.29;YY.4;h .8;UYYU.29;UU.4;C .47;h .16;F4;DF6;DF4;.5;UDYU.6;h .13;UUfFD14;F.5;UYDU.6;h .13;YD.D16;.15;H .H.11;DY.FD' +
    'DkD11;F.14;H. ..H.10;UU.F16;.13;H.. .3;H.H7;.H7;DH9;.HH.H3;..H..H.5; .48; .48; .48; .48; .26;zz.20; .26;Yz.19;C .26;zz.19;C .47;C .47;C .47;C .47;C .16;F16;.15;C .15;fFD1' +
    '4;F.15;C .16;FD14;F.15;C .16;FD3;kD10;F.16; .16;F16;.16; .48; .48; .48; .48; .48; .48; .47;C .47;C .48; .48; .47;C .47;C .16;F16;.15;C .15;fFD14;F.15;C .16;FD14;F.15;C .1' +
    '6;FD4;kD9;F.16; .16;F16;.16; .48; .48; .48; .48; .48; .48; .48; .48; .48; .48; .48; .15;g18;.15; .15;g18;.15; .15;fg17;.15; .15;g18;.15; .15;g3;D4;kg10;.15; .15;g18;.15; ' +
    '.48; .48; .48; .48; .48; .48; .48; .48; .48; .48; .48; .15;hH7;.H..H3;.Hh.15; .16;FFKF5;DF7;h.15; .15;DF.l.o.o.l.o.T..Fh.15; .16;F.6;T.7;Fh.15; .15;hF.7;l.o.o..Fh.15; .15' +
    ';hFGMF9;GF3;%.15; .48; .48; .48; .48; .48; .48; .48; .48; .48; .48; .48; .48; .16;FiiDiiDiDi4;DiF.16; .16;D.14;p.16; .16;D.14;p.16; .16;D.14;p.16; .16;Fi4;DiDiDDiDiiF%.15' +
    '; .48; .48; .48; .48; .48; .48; .48; .48; .48; .48; .48; .48; .16;FGMFMF6;GKF3;.16; .16;F.14;F.16; .16;F.8;d..D..F.16; .16;F.14;F.16; .16;F7;MF8;%.15; .48; .48; .48; .48;' +
    ' .48; .48; .48; .48; .48; .48; .48; .48; .16;g16;.16; .16;g11;D3;gg.16; .16;g11;D3;gg.16; .16;g16;.16; .16;g16;%.15; .48; .48; .48; .48; .48; .48; .48; .48; .48; .48; .48' +
    '; .48; .20;F7;.21; .20;Fr5;F.21; .20;D3;uDDF.21; .20;FD5;F..GG.17; .20;F7;..GG.17; .48; .48; .48; .48; .48; .48; .48; .48; .48; .48; .48; .48; .20;FiiDDiF.21; .20;pDtvDDp' +
    '.21; .20;D7;.21; .20;pD6;..GG.17; .20;F7;..GG.17; .48; .48; .48; .48; .48; .48; .48; .48; .48; .48; .48; .48; .20;F7;.21; .20;FD5;F.21; .20;FD5;F.21; .20;FD5;F..SG.17; .2' +
    '0;F7;..GN.17; .48; .48; .48; .48; .48; .48; .48; .48; .48; .48; .48; .48; .20;q7;.21; .20;q7;.21; .20;q7;.21; .20;q7;.21; .20;q7;.21; .48; .48; .48; .48; .48; .48; .48; .' +
    '48; .48; .48; .48; .48; .48; .48; .23;w.24; .48; .48; .48; .48; .48; .48; .48; .48; .48; .48; .48; .48; .48; .48; .48; .48; .23;x.24; .48; .48; .48; .48;'),
  coffres: {"11,2,12": "atheria:chests/refugies", "22,2,12": "atheria:chests/garage", "41,2,4": "atheria:chests/militaire", "41,2,12": "atheria:chests/militaire", "42,2,8": "atheria:chests/militaire"},
  // repères relatifs à l'origine (fil de la carte, barge_reperes.json)
  cale: [40, 2, 8], porteCale: 32, pont: [24, 5, 7], rampe: [0, 3, 8],
  rayonApproche: 72, rayonCale: 2.5, rayonSortie: 30, rayonPublic: 160,
  infectes: ['spore:inf_human', 'spore:inf_wanderer', 'spore:inf_husk', 'minecraft:zombie'],
  gardiens: ['spore:inf_vindicator', 'spore:inf_pillager'],
  noyes: ['spore:inf_drowned', 'minecraft:drowned'],
  vague2Sec: 900, alerteSec: 42 * 60, naufrageSec: 47 * 60,
  points: { infecte: 10, cale: 100, sortie: 50 }
}

var BARGE_BSP = Java.loadClass('net.minecraft.commands.arguments.blocks.BlockStateParser')
var BARGE_REG = Java.loadClass('net.minecraft.core.registries.Registries')
var BARGE_GRILLE = null

// cases du modèle : [x, y, z, n° de la palette], et les cases où l'on tient debout, par étage
function bargeGrille() {
  if (BARGE_GRILLE) return BARGE_GRILLE
  var T = BARGE.taille, rangs = BARGE.rangees.split(' '), cases = [], plein = {}, air = BARGE.palette.indexOf('minecraft:air')
  for (var y = 0; y < T[1]; y++) for (var z = 0; z < T[2]; z++) {
    var r = rangs[y * T[2] + z], x = 0, i = 0
    while (i < r.length) {
      var c = r.charAt(i++), n = 1
      if (i < r.length && r.charAt(i) >= '0' && r.charAt(i) <= '9') { var j = r.indexOf(';', i); n = parseInt(r.substring(i, j)); i = j + 1 }
      for (var k = 0; k < n; k++, x++) {
        if (c == '.') continue
        var v = BARGE.lettres.indexOf(c)
        cases.push([x, y, z, v])
        plein[x + ',' + y + ',' + z] = v
      }
    }
  }
  var mince = /ladder|lantern|chain|button|lever|cobweb|trapdoor|glass_pane|iron_bars|door/
  var dur = (x, y, z) => { var v = plein[x + ',' + y + ',' + z]; return v != null && v != air && !mince.test(BARGE.palette[v]) }
  var libre = (x, y, z) => plein[x + ',' + y + ',' + z] === air
  var debout = {}
  cases.forEach(c => {
    if (c[3] != air || !libre(c[0], c[1] + 1, c[2]) || !dur(c[0], c[1] - 1, c[2])) return
    ;(debout[c[1]] = debout[c[1]] || []).push([c[0], c[1], c[2]])
  })
  BARGE_GRILLE = { cases: cases, debout: debout }
  return BARGE_GRILLE
}

function bargeCentre() { var o = BARGE.origine, T = BARGE.taille; return [o[0] + T[0] / 2, o[1] + 4, o[2] + T[2] / 2] }
function bargeDist(p) { var c = bargeCentre(), dx = p.x - c[0], dz = p.z - c[2]; return Math.sqrt(dx * dx + dz * dz) }
function bargeAbord(p) {
  var o = BARGE.origine, T = BARGE.taille
  return p.x >= o[0] - 1 && p.x <= o[0] + T[0] + 1 && p.z >= o[2] - 1 && p.z <= o[2] + T[2] + 1 && p.y >= o[1] && p.y <= o[1] + T[1]
}
function bargeTroncons() {
  var o = BARGE.origine, T = BARGE.taille, l = []
  for (var cx = o[0] >> 4; cx <= (o[0] + T[0] - 1) >> 4; cx++) for (var cz = o[2] >> 4; cz <= (o[2] + T[2] - 1) >> 4; cz++) l.push([cx, cz])
  return l
}

// pose bloc par bloc, sans mise à jour des voisins (l'eau n'entre pas pendant la pose) ; les coffres Lootr avec leur butin
function bargePoser(server) {
  var level = server.overworld(), o = BARGE.origine, g = bargeGrille(), etats = {}, n = 0
  var blocs = level.holderLookup(BARGE_REG.BLOCK)
  g.cases.forEach(c => {
    var cle = c[0] + ',' + c[1] + ',' + c[2], x = o[0] + c[0], y = o[1] + c[1], z = o[2] + c[2]
    if (BARGE.coffres[cle]) {
      server.runCommandSilent('execute in minecraft:overworld run setblock ' + x + ' ' + y + ' ' + z + ' ' + BARGE.palette[c[3]] + '{LootTable:"' + BARGE.coffres[cle] + '"} replace')
      n++
      return
    }
    var st = etats[c[3]]
    if (!st) st = etats[c[3]] = BARGE_BSP.parseForBlock(blocs, BARGE.palette[c[3]], false).blockState()
    level.setBlock(ATHERIA_BP.containing(x, y, z), st, 2)
    n++
  })
  return n
}

// la barge coule : l'emprise redevient lagon (eau jusqu'à BARGE.niveauEau, air au-dessus)
function bargeRetirer(server) {
  var o = BARGE.origine, T = BARGE.taille, x2 = o[0] + T[0] - 1, z2 = o[2] + T[2] - 1
  if (BARGE.niveauEau >= o[1]) server.runCommandSilent('execute in minecraft:overworld run fill ' + o[0] + ' ' + o[1] + ' ' + o[2] + ' ' + x2 + ' ' + BARGE.niveauEau + ' ' + z2 + ' minecraft:water')
  server.runCommandSilent('execute in minecraft:overworld run fill ' + o[0] + ' ' + Math.max(o[1], BARGE.niveauEau + 1) + ' ' + o[2] + ' ' + x2 + ' ' + (o[1] + T[1] - 1) + ' ' + z2 + ' minecraft:air')
  server.runCommandSilent('execute in minecraft:overworld run kill @e[type=item,x=' + o[0] + ',y=' + o[1] + ',z=' + o[2] + ',dx=' + T[0] + ',dy=' + T[1] + ',dz=' + T[2] + ']')
}

function bargeFaire(ctx, ids, pts, n, tags, dy) {
  var level = ctx.server.overworld(), o = BARGE.origine, faits = 0
  if (!pts || !pts.length) return 0
  for (var i = 0; i < n; i++) {
    var pt = pts[Math.floor(Math.random() * pts.length)]
    var m = level.createEntity(ids[Math.floor(Math.random() * ids.length)])
    if (!m) continue
    m.setPos(o[0] + pt[0] + 0.5, o[1] + pt[1] + (dy || 0), o[2] + pt[2] + 0.5)
    m.addTag('atheria_live'); m.addTag(ctx.marque); m.addTag('atheria_barge')
    ;(tags || []).forEach(t => m.addTag(t))
    m.setPersistenceRequired()
    m.spawn()
    faits++
  }
  return faits
}

function bargeVague(ctx, grande) {
  var g = bargeGrille(), d = bargeGrille().debout, joueurs = ctx.joueurs().filter(p => bargeDist(p) <= BARGE.rayonPublic).length
  var cale = (d[2] || []).filter(p => p[0] < BARGE.porteCale), fermee = (d[2] || []).filter(p => p[0] > BARGE.porteCale)
  var pont = d[5] || [], passerelle = (d[14] || []).concat(d[15] || [])
  var n = 0
  n += bargeFaire(ctx, BARGE.infectes, pont, Math.min(16, (grande ? 6 : 4) + 2 * joueurs))
  n += bargeFaire(ctx, BARGE.infectes, cale, Math.min(12, (grande ? 5 : 4) + joueurs))
  if (grande) {
    n += bargeFaire(ctx, BARGE.infectes, passerelle, 2)
    n += bargeFaire(ctx, BARGE.gardiens, fermee, Math.min(6, 2 + Math.floor(joueurs / 2)))
    // noyés autour de la coque, dans l'eau
    var T = BARGE.taille, eau = []
    for (var x = -3; x <= T[0] + 2; x += 5) { eau.push([x, 1, -3]); eau.push([x, 1, T[2] + 2]) }
    n += bargeFaire(ctx, BARGE.noyes, eau, Math.min(8, 3 + joueurs))
  }
  return n
}

atheriaLiveDeclarer('barge', {
  titre: 'La barge fantôme',
  radio: 'semaine',
  annonce: 'Une barge partie de Petite-Terre a été vue à la dérive dans le lagon. Personne ne répond à bord.',
  rappel: 'La barge dérive toujours entre Grande-Terre et Petite-Terre. Venez en groupe, la cale est fermée.',
  consigne: 'Une barge dérive entre Grande-Terre et Petite-Terre. Montez à bord, atteignez sa cale fermée, et quittez-la avant qu\'elle coule.',
  dureeMin: 48,
  objets: [['atheria:trousse_soins', 1], ['atheria:ration', 2]],
  titreGagnant: ['pilleur_epave', 'Pilleur d\'épave'],
  surPlace: (ctx, p) => bargeDist(p) <= BARGE.rayonPublic,
  debut: ctx => {
    var d = ctx.d
    d.phase = 'pose'; d.troncons = 0; d.posee = false; d.peuple = 0; d.vague2 = false; d.alerte = false
    d.cale = {}; d.premier = ''; d.blocs = 0
    var c = bargeCentre()
    if (typeof REPERES !== 'undefined') REPERES['barge'] = { nom: 'La barge fantôme', ini: 'B', x: Math.floor(c[0]), y: 64, z: Math.floor(c[2]), couleur: 3 }
    ctx.joueurs().forEach(p => {
      if (atheriaLiveFaux(p)) return
      if (typeof atheriaRepere === 'function') atheriaRepere(p, 'barge')
      ctx.server.runCommandSilent('give ' + p.username + ' minecraft:oak_boat 1')
    })
    ctx.radio('La barge est là, entre Grande-Terre et Petite-Terre. Sa position est sur vos cartes. La PAF vous prête des barques.', 'PAF :')
  },
  seconde: (ctx, s) => {
    var d = ctx.d, level = ctx.server.overworld(), joueurs = ctx.joueurs(), o = BARGE.origine
    if (d.phase == 'pose') {
      // un tronçon forcé par seconde (plusieurs d'un coup figent le serveur), puis la pose, puis on relâche
      var tr = bargeTroncons()
      if (d.troncons < tr.length) { ctx.server.runCommandSilent('forceload add ' + (tr[d.troncons][0] * 16) + ' ' + (tr[d.troncons][1] * 16)); d.troncons++; return }
      if (!tr.every(t => level.isLoaded(ATHERIA_BP.containing(t[0] * 16 + 8, 64, t[1] * 16 + 8)))) return
      d.blocs = bargePoser(ctx.server)
      d.posee = true
      tr.forEach(t => ctx.server.runCommandSilent('forceload remove ' + (t[0] * 16) + ' ' + (t[1] * 16)))
      d.phase = 'derive'
      console.info('[Atheria barge] posée : ' + d.blocs + ' blocs')
      return
    }
    // la barge se remplit à l'approche du premier joueur, puis une seconde vague 15 min plus tard
    var proches = joueurs.filter(p => bargeDist(p) <= BARGE.rayonApproche)
    if (!d.peuple && proches.length) {
      d.peuple = s
      var n = bargeVague(ctx, true)
      ctx.server.runCommandSilent('playsound minecraft:entity.zombie.ambient hostile @a ' + (o[0] + 24) + ' ' + (o[1] + 5) + ' ' + (o[2] + 8) + ' 4 0.6')
      ctx.radio('Ça bouge sur la barge. ' + n + ' silhouettes, au moins. La cale du fond est fermée par une porte de fer.', 'PAF :')
    }
    if (d.peuple && !d.vague2 && s - d.peuple >= BARGE.vague2Sec && proches.length) {
      d.vague2 = true
      var n2 = bargeVague(ctx, false)
      ctx.radio('Ils remontent de la cale : ' + n2 + ' de plus.', 'PAF :')
    }
    joueurs.forEach(p => {
      if (bargeDist(p) <= 64) ctx.inscrire(p)
      var k = String(p.username)
      if (d.cale[k]) return
      var cx = o[0] + BARGE.cale[0] + 0.5, cy = o[1] + BARGE.cale[1], cz = o[2] + BARGE.cale[2] + 0.5
      if (Math.abs(p.y - cy) > 1.5 || (p.x - cx) * (p.x - cx) + (p.z - cz) * (p.z - cz) > BARGE.rayonCale * BARGE.rayonCale) return
      d.cale[k] = true
      ctx.inscrire(p)
      ctx.score(p, BARGE.points.cale)
      ctx.action(p, 'minecraft:chest', 'La cargaison de Petite-Terre. Prends ce que tu peux, et sors avant qu\'elle coule.', 'vert')
      if (!d.premier) { d.premier = k; ctx.radio(k + ' a forcé la cale. La cargaison venait de Petite-Terre.', 'PAF :') }
    })
    if (!d.alerte && s >= BARGE.alerteSec) {
      d.alerte = true
      ctx.server.runCommandSilent('playsound minecraft:block.bell.use master @a ' + (o[0] + 24) + ' ' + (o[1] + 5) + ' ' + (o[2] + 8) + ' 6 0.5')
      ctx.radio('La barge prend l\'eau. Elle coule dans cinq minutes. Sortez de la cale !', 'PAF :')
    }
    if (s >= BARGE.naufrageSec) {
      var sortis = []
      Object.keys(d.cale).forEach(k => {
        var p = ctx.trouver(k)
        if (p && bargeDist(p) >= BARGE.rayonSortie && !bargeAbord(p)) { ctx.score(k, BARGE.points.sortie); sortis.push(k) }
      })
      console.info('[Atheria barge] naufrage ; sortis avec la cargaison : ' + sortis.join(', ') + ' ; scores ' + JSON.stringify(ctx.etat.scores))
      ctx.radio('La barge s\'enfonce dans le lagon. ' + (sortis.length ? 'Sortis à temps avec la cargaison : ' + sortis.join(', ') + '.' : 'Personne n\'est sorti avec la cargaison.'), 'PAF :')
      ctx.terminer()
    }
  },
  fin: ctx => {
    ctx.server.getAllLevels().forEach(level => level.getEntities().forEach(m => { if (m.tags.contains('atheria_live')) m.discard() }))
    // le retrait se fait tronçon par tronçon (voir plus bas), même si personne n'est près de la barge
    if (ctx.d.posee || ctx.d.phase == 'pose') ctx.server.persistentData.putInt('atheria_barge_retrait', 1)
  }
})

// retrait de la barge : un tronçon forcé par seconde, puis l'emprise rendue au lagon, puis on relâche.
// Gardé dans les données du serveur : un redémarrage au milieu reprend le retrait.
ServerEvents.tick(event => {
  var server = event.server
  if (server.tickCount % 20 != 7) return
  var pd = server.persistentData, etape = pd.getInt('atheria_barge_retrait')
  if (!etape) return
  var tr = bargeTroncons(), level = server.overworld()
  if (etape <= tr.length) {
    server.runCommandSilent('forceload add ' + (tr[etape - 1][0] * 16) + ' ' + (tr[etape - 1][1] * 16))
    pd.putInt('atheria_barge_retrait', etape + 1)
    return
  }
  if (!tr.every(t => level.isLoaded(ATHERIA_BP.containing(t[0] * 16 + 8, 64, t[1] * 16 + 8)))) {
    pd.putInt('atheria_barge_retrait', etape + 1)
    if (etape < tr.length + 30) return
  }
  level.getEntities().forEach(m => { if (m.tags.contains('atheria_barge')) m.discard() })
  bargeRetirer(server)
  tr.forEach(t => server.runCommandSilent('forceload remove ' + (t[0] * 16) + ' ' + (t[1] * 16)))
  pd.remove('atheria_barge_retrait')
  console.info('[Atheria barge] retirée')
})

// infecté de la barge abattu par un joueur : 10 points
EntityEvents.death(event => {
  var m = event.entity
  if (!m.tags.contains('atheria_barge')) return
  var src = event.source, p = src ? src.actual : null
  if (!p || !p.isPlayer()) return
  var server = m.server, e = atheriaLiveEtat(server)
  if (!e || e.nom != 'barge' || e.phase != 'encours') return
  var ctx = atheriaLiveCtx(server, e)
  ctx.score(p, BARGE.points.infecte)
  ctx.inscrire(p)
  atheriaLiveEcrire(server, e)
})
