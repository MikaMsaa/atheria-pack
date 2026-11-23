// ================= RN1 A MAJICAVO ET LA PIECE AUX DAKOUANE (lot70, 14/11, v2) : lieux 4 et 5 du trailer =================
// Fiche RN1 : ligne droite de 120 blocs ou plus, chaussee de 12 a 15, bas-cotes libres sur 10, denivele < 3.
// Fiche Majicavo : piece de 9 x 9 ou plus sur 4 de haut, une baie de 1 a 2, aucune lumiere (8 a 10 Dakouane poses par le trailer).
// v2 (retour de Mika : quelques maisons posees) : un vrai quartier mort des deux cotes de la RN1.
//   1re rangee sur la RN1 (facades x39 / x74) presque continue, coupee de passages ; ruelles arriere x20..24 et x88..91 ;
//   2e rangee tournee vers les ruelles (facades x19 / x92) ; au-dela, bangas, cours, clotures de tole, manguiers.
//   Abandon : carreaux casses, portes arrachees, fenetres condamnees, maisons brulees, toit effondre, epaves, poteaux tombes, gravats, vegetation.
// La piece : rez-de-chaussee de la maison ouest z30..41 (interieur 10 x 10 x 4), baie de 2 sur la RN1, aucune fenetre. Bas-cotes x40..49 et x64..73 laisses libres.
function mjAbandon(x1, z1, x2, z2) {
  for (var k in HM) {
    var p = k.split(','), x = p[0] - OX, y = p[1] - OY, z = p[2] - OZ, b = HM[k]
    if (x < x1 || x > x2 || z < z1 || z > z2) continue
    if (/glass_pane/.test(b)) { var r = R(); if (r < 0.35) S(x, y, z, AIR); else if (r < 0.43 && y >= 5) S(x, y, z, 'minecraft:spruce_planks') }
    else if (/awning/.test(b) && R() < 0.45) S(x, y, z, AIR)
    else if (/mcwdoors:/.test(b)) { var h = (x * 7 + z * 13) % 10; if (h < 4) S(x, y, z, AIR); else if (h < 6) S(x, y, z, 'minecraft:spruce_planks') }   // portes arrachees ou condamnees
  }
}
// ruine : toit effondre sur un disque (gravats au sol), rien ne reste sur le toit ; si brule : murs noircis, bois et mobilier partis, cendre au sol
function mjRuine(x1, z1, x2, z2, yR, cx, cz, rr, brule) {
  for (var k in HM) {
    var p = k.split(','), x = p[0] - OX, y = p[1] - OY, z = p[2] - OZ, b = HM[k]
    if (x < x1 || x > x2 || z < z1 || z > z2 || b == AIR) continue
    var bord = x == x1 || x == x2 || z == z1 || z == z2, dedans = (x - cx) * (x - cx) + (z - cz) * (z - cz) <= rr * rr
    if (y > yR + 1) { S(x, y, z, AIR); continue }
    if (y == yR + 1 && (dedans || R() < 0.35)) { S(x, y, z, AIR); continue }
    if (y == yR && !bord && dedans) { S(x, y, z, AIR); continue }
    if (!brule) continue
    if (/(glass_pane|mcwdoors|awning|handcrafted|mcwfurnitures|barrel|_bed|wool|carpet|sack|_crate|rice_bag|jar|planks|encased_fan|_slab\[type=top)/.test(b)) { S(x, y, z, AIR); continue }
    // suie par plaques (cellules de 2), plus noire en montant : les flammes sortaient par le haut
    if (bord && y >= 0 && y < yR && /(terracotta|_concrete)/.test(b)) { var n = lbBruit(Math.floor((x + z) / 2), Math.floor(y / 2), 5.7) + y * 0.3; S(x, y, z, n > 0.7 ? 'minecraft:black_concrete' : n > -0.1 ? 'minecraft:gray_concrete' : b) }
    else if (bord && y == yR) S(x, y, z, R() < 0.5 ? 'minecraft:black_concrete' : 'minecraft:gray_concrete')
  }
  for (var x = x1 + 1; x < x2; x++) for (var z = z1 + 1; z < z2; z++) {
    var dedans = (x - cx) * (x - cx) + (z - cz) * (z - cz) <= rr * rr
    if (brule) S(x, -1, z, R() < 0.45 ? 'minecraft:black_concrete_powder' : R() < 0.5 ? 'minecraft:coal_block' : 'minecraft:gray_concrete')
    if (dedans && libreH(x, 0, z)) { var r = R(); if (r < 0.35) S(x, 0, z, 'minecraft:gravel'); else if (r < 0.6) S(x, 0, z, 'minecraft:cobblestone_slab[type=bottom,waterlogged=false]'); else if (r < 0.72) S(x, 0, z, 'minecraft:smooth_stone_slab[type=bottom,waterlogged=false]') }
  }
}
// usure de tout le quartier (hors RN1) : coulures sous les nez de dalle et les toits, algues en pied de mur,
// cuves d'eau tombees ou volees, toits moussus, marchandises pourries ou pillees
var MJ_SALE = { 'minecraft:white_concrete': 'minecraft:light_gray_concrete', 'minecraft:light_gray_concrete': 'minecraft:gray_concrete' }
function mjSale(b) { if (MJ_SALE[b]) return MJ_SALE[b]; if (/(yellow|orange|pink|white|red|brown)_terracotta/.test(b)) return 'minecraft:brown_terracotta'; if (/_terracotta/.test(b)) return 'minecraft:gray_terracotta'; return 'minecraft:gray_concrete' }
function mjUsure() {
  var cuves = {}, L = []
  for (var k in HM) { var p = k.split(','); L.push([p[0] - OX, p[1] - OY, p[2] - OZ, HM[k]]) }
  L.forEach(e => {
    var x = e[0], y = e[1], z = e[2], b = e[3]
    if (x >= 44 && x <= 69) return
    var dessus = HM[hk(x, y + 1, z)] || AIR
    // coulure : sous une dalle, une colonne sur trois environ descend de 1 a 3 blocs
    if (y >= 1 && /(terracotta|_concrete)$/.test(b) && /(smooth_stone|white_concrete)/.test(dessus) && lbBruit(x * 3 + z, y, 4.1) > 0.9 && R() < 0.6) {
      var l = 1 + Math.floor(R() * 2)
      for (var i = 0; i < l; i++) { var bb = HM[hk(x, y - i, z)]; if (bb != b || y - i < 1) break; S(x, y - i, z, mjSale(b)) }
    }
    // algues et salissures en pied de mur (soubassement pose sur la dalle de la maison)
    if (y == 0 && b == 'minecraft:light_gray_concrete' && HM[hk(x, -1, z)] == 'minecraft:smooth_stone') { var n = lbBruit(Math.floor((x + z) / 2), 0, 6.3); if (n > 0.5) S(x, 0, z, 'minecraft:green_terracotta'); else if (n > -0.2) S(x, 0, z, 'minecraft:gray_concrete') }
    // cuves : une sur deux a disparu (2 x 2 x 3, decision par cuve)
    if (b == 'minecraft:black_carpet' && y >= 7) {
      var cx = /black_carpet/.test(HM[hk(x - 1, y, z)] || '') ? x - 1 : x, cz = /black_carpet/.test(HM[hk(x, y, z - 1)] || '') ? z - 1 : z, c = cx + ',' + cz
      if (cuves[c] === undefined) cuves[c] = R() < 0.5
      if (cuves[c]) for (var i = 0; i <= 2; i++) S(x, y - i, z, AIR)
    }
    // toit : mousse et feuilles mortes par plaques, la ou rien n'est au-dessus
    if (y >= 4 && b == 'minecraft:smooth_stone' && dessus == AIR && libreH(x, y + 2, z) && libreH(x, y + 3, z) && libreH(x, y + 4, z) && lbBruit(Math.floor(x / 2), Math.floor(z / 2), 8.8) > 0.6 && R() < 0.8) S(x, y + 1, z, R() < 0.75 ? 'minecraft:moss_carpet' : 'minecraft:brown_carpet')
    // etals pilles : cagettes et sacs en partie partis
    if (/(_crate|rice_bag)/.test(b) && R() < 0.6) S(x, y, z, AIR)
    if (/(supplementaries:jar|terracotta_wide_pot)/.test(b) && R() < 0.5) S(x, y, z, AIR)
  })
  // buissons au pied des murs
  var n = 0
  for (var i = 0; i < 900 && n < 40; i++) {
    var x = Math.floor(R() * 128), z = Math.floor(R() * 128)
    if (x >= 42 && x <= 71) continue
    if (!libreH(x, 0, z) || libreH(x, -1, z)) continue
    var mur = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(o => /(terracotta|light_gray_concrete|gray_concrete)/.test(HM[hk(x + o[0], 1, z + o[1])] || ''))
    if (mur) { mjBuisson(x, z, 1); n++ }
  }
}
function mjSolRuelle(x1, x2, z1, z2) { for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) { var n = lbBruit(x, z, 2.3); S(x, -1, z, n > 0.9 ? 'minecraft:gravel' : n < -1.0 ? 'minecraft:mud' : R() < 0.5 ? 'minecraft:packed_mud' : 'minecraft:coarse_dirt') } }
function mjTole(x1, z1, x2, z2) { for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) { if (!libreH(x, 0, z) || R() < 0.12) continue; S(x, 0, z, R() < 0.5 ? 'createdeco:iron_sheet_metal' : 'createdeco:zinc_sheet_metal'); if (R() < 0.8 && libreH(x, 1, z)) S(x, 1, z, R() < 0.5 ? 'createdeco:iron_sheet_metal' : 'createdeco:zinc_sheet_metal') } }
function mjMuret(x1, z1, x2, z2) { for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) if (libreH(x, 0, z) && R() > 0.1) S(x, 0, z, 'minecraft:light_gray_concrete') }
// poteau electrique tombe : moignon de 3, fut couche au sol vers +z, cable par terre
function mjPoteauTombe(x, z, l) {
  F(x, 0, z, x, 2, z, 'minecraft:stone_brick_wall')
  for (var i = 1; i <= l; i++) if (libreH(x, 0, z + i)) S(x, 0, z + i, i == l ? 'minecraft:smooth_stone' : 'minecraft:smooth_stone_slab[type=bottom,waterlogged=false]')
  for (var i = l + 1; i <= l + 6; i++) if (libreH(x, 0, z + i)) S(x, 0, z + i, 'minecraft:chain[axis=z,waterlogged=false]')
}
function mjDechets(n, x1, z1, x2, z2) {
  var L = ['minecraft:gravel', 'minecraft:cobblestone_slab[type=bottom,waterlogged=false]', 'supplementaries:sack', 'minecraft:barrel[facing=up,open=true]', 'minecraft:smooth_stone_slab[type=bottom,waterlogged=false]', 'minecraft:dead_bush']
  for (var i = 0; i < n; i++) {
    var x = x1 + Math.floor(R() * (x2 - x1 + 1)), z = z1 + Math.floor(R() * (z2 - z1 + 1)), b = choix(L)
    if (!libreH(x, 0, z) || libreH(x, -1, z)) continue
    if (b == 'minecraft:dead_bush' && !/(dirt|mud|grass)/.test(HM[hk(x, -1, z)] || '')) continue
    S(x, 0, z, b)
  }
}
function mjBuisson(x, z, r) { for (var dx = -r; dx <= r; dx++) for (var dz = -r; dz <= r; dz++) for (var dy = 0; dy <= 1; dy++) if (dx * dx + dz * dz + dy * dy * 3 <= r * r + 1 && R() < 0.85 && libreH(x + dx, dy, z + dz) && !libreH(x + dx, dy - 1, z + dz)) S(x + dx, dy, z + dz, R() < 0.6 ? 'minecraft:jungle_leaves[distance=1,persistent=true,waterlogged=false]' : 'minecraft:azalea_leaves[distance=1,persistent=true,waterlogged=false]') }

// mur demoli : les murs tombent a une hauteur irreguliere (1 a 5), plus de toit ni d'etage, gravats en tas dedans et au pied
function mjDemolie(x1, z1, x2, z2) {
  for (var k in HM) {
    var p = k.split(','), x = p[0] - OX, y = p[1] - OY, z = p[2] - OZ, b = HM[k]
    if (x < x1 || x > x2 || z < z1 || z > z2 || b == AIR || y < 1) continue
    var h = 1 + Math.floor((lbBruit(Math.floor((x + z) / 2), 0, 3.3) + 1.5) * 0.8)
    if (y > h) S(x, y, z, AIR)
    else if (/(glass_pane|mcwdoors|awning|handcrafted|mcwfurnitures|_bed|wool|carpet|_crate|rice_bag|jar|encased_fan)/.test(b)) S(x, y, z, AIR)
  }
  for (var x = x1 - 2; x <= x2 + 2; x++) for (var z = z1 - 2; z <= z2 + 2; z++) {
    var dedans = x > x1 && x < x2 && z > z1 && z < z2, n = lbBruit(x, z, 4.4)
    if (!libreH(x, 0, z) || libreH(x, -1, z)) continue
    if (dedans ? n > -0.4 : n > 0.5) { var r = R(); S(x, 0, z, r < 0.4 ? 'minecraft:gravel' : r < 0.7 ? 'minecraft:cobblestone' : 'minecraft:smooth_stone'); if (dedans && n > 0.8 && libreH(x, 1, z)) S(x, 1, z, R() < 0.5 ? 'minecraft:cobblestone_slab[type=bottom,waterlogged=false]' : 'minecraft:gravel') }
  }
}
// barricade de survivants : futs, sacs empiles, planches, toles, palettes, le long d'une ligne
function mjBarricade(x1, z1, x2, z2) {
  for (var x = x1; x <= x2; x++) for (var z = z1; z <= z2; z++) {
    if (!libreH(x, 0, z)) continue
    var r = R()
    if (r < 0.25) { S(x, 0, z, 'minecraft:barrel[facing=up,open=false]'); if (R() < 0.6) S(x, 1, z, 'supplementaries:sack') }
    else if (r < 0.5) { S(x, 0, z, 'minecraft:spruce_planks'); S(x, 1, z, R() < 0.7 ? 'minecraft:spruce_planks' : 'minecraft:spruce_slab[type=bottom,waterlogged=false]') }
    else if (r < 0.72) { S(x, 0, z, 'createdeco:iron_sheet_metal'); S(x, 1, z, 'createdeco:zinc_sheet_metal') }
    else if (r < 0.9) S(x, 0, z, 'supplementaries:sack')
    else S(x, 0, z, 'minecraft:spruce_slab[type=bottom,waterlogged=false]')
  }
}

// vegetation au sol variee : herbes courtes et hautes, fougeres, buissons secs, petales, azalees, baies, fleurs rares, mousse
var MJ_SOL_PLANTE = /(grass_block|coarse_dirt|rooted_dirt|podzol|moss_block|minecraft:mud$)/
function mjPlante(x, z) {
  if (!libreH(x, 0, z) || !MJ_SOL_PLANTE.test(HM[hk(x, -1, z)] || '')) return
  var r = R()
  if (r < 0.40) S(x, 0, z, 'minecraft:short_grass')
  else if (r < 0.56) { if (libreH(x, 1, z)) { S(x, 0, z, 'minecraft:tall_grass[half=lower]'); S(x, 1, z, 'minecraft:tall_grass[half=upper]') } }
  else if (r < 0.68) S(x, 0, z, 'minecraft:fern')
  else if (r < 0.74) { if (libreH(x, 1, z)) { S(x, 0, z, 'minecraft:large_fern[half=lower]'); S(x, 1, z, 'minecraft:large_fern[half=upper]') } }
  else if (r < 0.80) S(x, 0, z, 'minecraft:dead_bush')
  else if (r < 0.85) S(x, 0, z, 'minecraft:pink_petals[facing=' + choix(['north', 'south', 'east', 'west']) + ',flower_amount=' + (1 + Math.floor(R() * 4)) + ']')
  else if (r < 0.89) S(x, 0, z, 'minecraft:azalea')
  else if (r < 0.92) S(x, 0, z, 'minecraft:sweet_berry_bush[age=1]')
  else if (r < 0.95) S(x, 0, z, choix(['minecraft:dandelion', 'minecraft:poppy', 'minecraft:oxeye_daisy', 'minecraft:azure_bluet']))
  else S(x, 0, z, 'minecraft:moss_carpet')
}
// bouquet de bambous (3 a 5 tiges, 5 a 8 de haut)
function mjBambou(x, z) {
  ;[[0, 0], [1, 0], [0, 1], [1, 1], [-1, 0]].slice(0, 3 + Math.floor(R() * 3)).forEach(o => {
    var bx = x + o[0], bz = z + o[1], h = 5 + Math.floor(R() * 4)
    if (!libreH(bx, 0, bz)) return
    for (var y = 0; y < h; y++) if (!libreH(bx, y, bz)) return
    S(bx, -1, bz, 'minecraft:grass_block[snowy=false]')
    for (var y = 0; y < h; y++) S(bx, y, bz, 'minecraft:bamboo[age=1,leaves=' + (y >= h - 2 ? 'large' : y >= h - 3 ? 'small' : 'none') + ',stage=0]')
  })
}
// bords de la RN1 : sol en mosaique, caniveau beton, poteaux et fils (un fil casse), abribus, borne, bacs, epaves, bambous, gravats
function mjAbords() {
  var N = 127
  for (var z = 0; z <= N; z++) [44, 45, 46, 47, 66, 67, 68, 69].forEach(x => {
    var n = lbBruit(x, z, 2.7), m = lbBruit(Math.floor(x / 2), Math.floor(z / 3), 6.1)
    if (!libreH(x, 0, z) && !/(grass|fern|petal)/.test(HM[hk(x, 0, z)] || '')) return
    S(x, -1, z, m > 1.0 ? 'minecraft:coarse_dirt' : n > 1.2 ? 'minecraft:rooted_dirt' : n < -1.3 ? 'minecraft:mud' : m < -1.1 ? 'minecraft:moss_block' : n > 0.6 ? 'minecraft:podzol' : 'minecraft:grass_block[snowy=false]')
  })
  // caniveau : rigole d'un bloc, fond en beton couvert de boue et de feuilles, dalles de passage tous les 13 blocs
  for (var z = 0; z <= N; z++) [48, 65].forEach(x => {
    S(x, -2, z, 'minecraft:smooth_stone')
    if (z % 13 == 6) { S(x, -1, z, 'minecraft:smooth_stone_slab[type=top,waterlogged=false]'); return }
    S(x, -1, z, AIR)
    var r = R(); if (r < 0.25) S(x, -2, z, 'minecraft:mud'); else if (r < 0.4) S(x, -1, z, 'minecraft:brown_carpet'); else if (r < 0.48) S(x, -1, z, 'minecraft:moss_carpet')
  })
  // poteaux electriques en bord de route, fils tendus a y8, une portee cassee de chaque cote (le fil pend)
  ;[45, 68].forEach((x, c) => {
    var Z = [6, 30, 54, 78, 102, 126]
    Z.forEach(z => { if (libreH(x, 0, z) && libreH(x, 3, z)) rmPoteau(x, z, 'z') })
    for (var i = 0; i + 1 < Z.length; i++) {
      var casse = i == (c == 0 ? 2 : 3)
      for (var z = Z[i] + 2; z <= Z[i + 1] - 2; z++) {
        if (casse && z > Z[i] + 5) continue
        SA(x, 8, z, 'minecraft:chain[axis=z,waterlogged=false]')
        if (casse && z == Z[i] + 5) for (var y = 4; y <= 7; y++) SA(x, y, z, 'minecraft:chain[axis=y,waterlogged=false]')   // le bout du fil casse pend
      }
    }
  })
  // abribus (ouest, z60..63) : poteaux, paroi a barreaux, toit en dalles, banc
  if (libreH(44, 0, 61)) {
    ;[[44, 60], [45, 60], [44, 63], [45, 63]].forEach(p => F(p[0], 0, p[1], p[0], 2, p[1], 'minecraft:spruce_fence'))
    F(44, 0, 61, 44, 2, 62, 'minecraft:iron_bars'); F(44, 3, 60, 45, 3, 63, 'minecraft:smooth_stone_slab[type=bottom,waterlogged=false]')
    S(45, 0, 61, 'minecraft:spruce_slab[type=bottom,waterlogged=false]'); S(45, 0, 62, 'minecraft:spruce_slab[type=bottom,waterlogged=false]')
    F(44, -1, 60, 45, -1, 63, 'minecraft:gray_concrete')
  }
  // borne kilometrique (sans texte) et bacs a ordures verts, l'un renverse
  S(68, 0, 90, 'minecraft:smooth_quartz'); S(68, 1, 90, 'minecraft:red_concrete')
  ;[[45, 20, 'up'], [68, 74, 'up'], [45, 110, 'east'], [69, 18, 'up']].forEach(p => { if (libreH(p[0], 0, p[1])) S(p[0], 0, p[1], 'minecraft:green_shulker_box[facing=' + p[2] + ']') })
  // epaves sur le bas-cote, contre les facades (roues volees)
  bgVoiture(44, 98, 'z', 'light_gray', 1, true); bgVoiture(68, 30, 'z', 'white', 2, true)
  // bambous devant les passages, parpaings empiles, sacs, fut couche
  ;[[44, 17], [68, 62], [44, 78], [68, 120]].forEach(p => mjBambou(p[0], p[1]))
  ;[[69, 82], [44, 44]].forEach(p => { if (libreH(p[0], 0, p[1])) { S(p[0], 0, p[1], 'minecraft:light_gray_concrete'); if (libreH(p[0], 0, p[1] + 1)) S(p[0], 0, p[1] + 1, 'minecraft:smooth_stone_slab[type=bottom,waterlogged=false]') } })
  for (var i = 0; i < 26; i++) { var x = R() < 0.5 ? 44 + Math.floor(R() * 4) : 66 + Math.floor(R() * 4), z = Math.floor(R() * 128); if (libreH(x, 0, z) && !libreH(x, -1, z)) S(x, 0, z, choix(['supplementaries:sack', 'minecraft:barrel[facing=east,open=false]', 'minecraft:cobblestone_slab[type=bottom,waterlogged=false]', 'minecraft:gravel', 'minecraft:brown_carpet', 'minecraft:moss_carpet'])) }
  // nids-de-poule et terre sur la chaussee (a plat, sans obstacle)
  for (var x = 50; x <= 63; x++) for (var z = 0; z <= N; z++) { var n = lbBruit(x, z, 11.3); if (n > 1.75) S(x, -1, z, R() < 0.5 ? 'minecraft:coarse_dirt' : 'minecraft:mud') }
}

function mjRoute() {
  var N = 127, OX0 = OX
  // sol : chaussee x50..63, bas-cotes x44..49 et x64..69 (les maisons sont a 6 blocs de la route)
  for (var x = 0; x <= 127; x++) for (var z = 0; z <= N; z++) {
    var b
    if (x >= 50 && x <= 63) { var n = lbBruit(Math.floor(x / 3), Math.floor(z / 3), 7.3), m = lbBruit(x, z, 3.9); b = (x == 51 || x == 62) ? 'minecraft:white_concrete' : (x == 56 && z % 8 < 4) ? 'minecraft:white_concrete' : m > 1.6 ? 'minecraft:cyan_terracotta' : n > 1.0 ? 'minecraft:black_concrete' : n < -1.25 ? 'minecraft:light_gray_concrete' : 'minecraft:gray_concrete' }
    else if (x == 49 || x == 64) b = 'minecraft:gravel'
    else if (x >= 44 && x <= 69) { var n = lbBruit(x, z, 1.9); b = n > 1.1 ? 'minecraft:coarse_dirt' : 'minecraft:grass_block[snowy=false]' }
    else { var n = lbBruit(x, z, 1.9); b = n > 0.6 ? 'minecraft:coarse_dirt' : n < -0.9 ? 'minecraft:packed_mud' : 'minecraft:grass_block[snowy=false]' }
    S(x, -1, z, b)
  }
  for (var z = 0; z <= N; z++) { [50, 63].forEach(x => { if (R() < 0.18) S(x, -1, z, 'minecraft:moss_block') }) }
  var P = RM_PEINT
  // ===== cote ouest, decale de 4 vers la route (facades a x43) =====
  OX = OX0 + 4
  mjSolRuelle(20, 24, 0, N)
  rmBat(-1, 39, 6, 10, 13, 2, P[1], 'ouvert', { attente: true, pignons: [6, 15] })
  rmBat(-1, 39, 19, 9, 11, 1, P[3], 'maison', { attente: true, pignons: [19] })
  rmBat(-1, 39, 30, 12, 12, 2, P[5], 'piece', { attente: true, pignons: [30, 41] })
  rmBat(-1, 39, 44, 8, 10, 1, P[2], 'maison', { attente: true })
  rmBat(-1, 39, 54, 8, 12, 1, P[4], 'maison', { attente: true, pignons: [54, 61] })
  rmBat(-1, 39, 64, 13, 12, 2, P[6], 'vitrine', { pignons: [76] })
  rmBat(-1, 39, 80, 12, 14, 3, P[0], 'vitrine', { balcons: true, pignons: [80, 91] })
  rmBat(-1, 39, 94, 10, 11, 1, P[8], 'maison', { attente: true, pignons: [94, 103] })
  rmBat(-1, 39, 106, 10, 13, 2, P[3], 'maison', { linge: true, pignons: [106, 115] })
  rmBat(-1, 39, 118, 9, 12, 2, P[7], 'ouvert', { attente: true, pignons: [118] })
  ;[[2, 10, 2, 'maison', 1], [14, 12, 3, 'maison', 2], [30, 8, 4, 'ouvert', 1], [40, 12, 0, 'maison', 2], [56, 10, 6, 'maison', 1], [70, 12, 8, 'maison', 2], [86, 10, 1, 'ouvert', 1], [100, 12, 5, 'maison', 2], [116, 10, 2, 'maison', 1]]
    .forEach(h => rmBat(-1, 19, h[0], h[1], 9, h[4], P[h[2]], h[3], { attente: true, pignons: [h[0], h[0] + h[1] - 1] }))
  mjAbandon(0, 0, 40, N)
  mjRuine(30, 44, 39, 51, 4, 34, 48, 3, true); rmManguier(34, 48)          // maison brulee de la RN1, un manguier pousse dedans
  mjRuine(11, 56, 19, 65, 4, 14, 61, 3, false)                              // toit effondre
  mjRuine(29, 94, 39, 103, 4, 34, 98, 3, false)                             // toit effondre sur la RN1
  mjDemolie(11, 86, 19, 95)                                                 // maison demolie, murs a mi-hauteur
  ;[[2, 4, 7, 8, 6], [3, 30, 8, 35, 32], [1, 72, 6, 77, 74], [3, 104, 8, 109, 106]].forEach(b => rmBanga(b[0], b[1], b[2], b[3], b[4]))
  ;[[0, 13, 10, 13], [0, 27, 10, 27], [0, 53, 10, 53], [0, 84, 10, 84], [0, 113, 10, 113]].forEach(m => mjTole(m[0], m[1], m[2], m[3]))
  ;[[0, 0, 0, 127], [25, 16, 28, 16], [25, 28, 28, 28], [25, 52, 28, 52], [25, 78, 28, 78]].forEach(m => mjMuret(m[0], m[1], m[2], m[3]))
  // barricades : bouches des passages sur la RN1, bouts de la ruelle
  ;[[39, 16, 39, 18], [39, 42, 39, 43], [39, 77, 39, 79], [39, 104, 39, 105], [20, 1, 24, 1], [20, 126, 24, 126]].forEach(m => mjBarricade(m[0], m[1], m[2], m[3]))
  bgVoiture(21, 36, 'z', 'white', 1); bgVoiture(22, 82, 'z', 'red', 2); bgVoiture(30, 77, 'x', 'white', 1, true)
  ;[[24, 10], [24, 58], [24, 110]].forEach(p => rmPoteau(p[0], p[1], 'z')); mjPoteauTombe(23, 86, 6)
  ;[[5, 20], [6, 62], [4, 94]].forEach(p => rmManguier(p[0], p[1]))
  ;[[7, 40], [8, 48], [2, 88], [6, 122], [25, 18]].forEach((p, i) => rmBananier(p[0], p[1], 4 + (i % 2)))
  ;[[26, 46], [26, 70], [12, 26], [20, 64]].forEach(p => mjBuisson(p[0], p[1], 2))
  ;[[40, 6, 8, 'west'], [40, 6, 33, 'west'], [40, 3, 58, 'west'], [27, 6, 70, 'east'], [26, 6, 110, 'east'], [20, 6, 18, 'west']].forEach(v => lxLiane(v[0], v[1], v[2], v[3], 4))
  // ===== cote est, decale de 4 vers la route (facades a x70) =====
  OX = OX0 - 4
  mjSolRuelle(88, 91, 0, N)
  rmBat(1, 74, 0, 8, 10, 1, P[5], 'maison', { attente: true, pignons: [7] })
  rmBat(1, 74, 10, 12, 13, 2, P[2], 'maison', { attente: true, pignons: [10, 21] })
  rmBat(1, 74, 24, 13, 12, 2, P[1], 'ouvert', { pignons: [24, 36] })
  rmBat(1, 74, 40, 8, 12, 1, P[6], 'ouvert', { pignons: [40, 47] })
  rmBat(1, 74, 50, 11, 11, 1, P[0], 'maison', { attente: true, pignons: [50, 60] })
  rmBat(1, 74, 64, 12, 14, 2, P[8], 'vitrine', { balcons: true, pignons: [64, 75] })
  rmBat(1, 74, 78, 15, 13, 3, P[4], 'vitrine', { pignons: [78, 92] })
  rmBat(1, 74, 96, 10, 13, 3, P[7], 'maison', { attente: true, pignons: [96, 105] })
  rmBat(1, 74, 108, 11, 12, 2, P[3], 'maison', { attente: true, linge: true, pignons: [108, 118] })
  ;[[4, 10, 7, 'maison', 1], [18, 12, 0, 'maison', 2], [34, 10, 3, 'ouvert', 1], [48, 12, 6, 'maison', 2], [66, 10, 2, 'maison', 1], [80, 12, 5, 'maison', 2], [96, 12, 8, 'maison', 1], [112, 12, 1, 'maison', 2]]
    .forEach(h => rmBat(1, 92, h[0], h[1], 9, h[4], P[h[2]], h[3], { attente: true, pignons: [h[0], h[0] + h[1] - 1] }))
  mjAbandon(73, 0, 127, N)
  mjRuine(92, 34, 100, 43, 4, 97, 38, 2, true)                              // maison brulee, 2e rangee
  mjRuine(92, 80, 100, 91, 7, 96, 85, 3, true)                              // R+1 brule, toit perce
  mjDemolie(74, 50, 84, 60)                                                 // maison demolie sur la RN1
  ;[[106, 8, 111, 12, 10], [112, 40, 117, 45, 42], [105, 70, 110, 75, 72], [114, 100, 119, 105, 102]].forEach(b => rmBanga(b[0], b[1], b[2], b[3], b[4]))
  ;[[101, 16, 127, 16], [101, 31, 127, 31], [101, 62, 127, 62], [101, 93, 127, 93], [101, 125, 127, 125]].forEach(m => mjTole(m[0], m[1], m[2], m[3]))
  mjMuret(127, 0, 127, 127)
  ;[[74, 37, 74, 39], [74, 61, 74, 63], [74, 93, 74, 95], [74, 119, 74, 124], [88, 126, 91, 126], [88, 1, 91, 1]].forEach(m => mjBarricade(m[0], m[1], m[2], m[3]))
  bgVoiture(89, 46, 'z', 'light_gray', 1); bgVoiture(89, 104, 'z', 'blue', 0); bgVoiture(104, 52, 'x', 'black', 2)
  ;[[88, 14], [88, 72], [88, 120]].forEach(p => rmPoteau(p[0], p[1], 'z')); mjPoteauTombe(90, 26, 7)
  ;[[116, 24], [118, 56], [110, 84], [120, 116]].forEach(p => rmManguier(p[0], p[1]))
  ;[[104, 4], [107, 28], [102, 60], [106, 90], [103, 110], [104, 40]].forEach((p, i) => rmBananier(p[0], p[1], 4 + (i % 2)))
  ;[[87, 38], [87, 86], [101, 22], [91, 64]].forEach(p => mjBuisson(p[0], p[1], 2))
  ;[[73, 6, 13, 'east'], [73, 6, 67, 'east'], [73, 9, 100, 'east'], [86, 6, 30, 'west'], [86, 6, 112, 'west'], [91, 6, 52, 'east']].forEach(v => lxLiane(v[0], v[1], v[2], v[3], 4))
  // ===== passes communes =====
  OX = OX0
  mjUsure()
  mjDechets(80, 0, 0, 42, N); mjDechets(80, 71, 0, 127, N)
  mjAbords()
  for (var i = 0; i < 5200; i++) { var x = Math.floor(R() * 128), z = Math.floor(R() * 128); if (x >= 48 && x <= 65) continue; if (lbBruit(Math.floor(x / 4), Math.floor(z / 4), 12.7) < -0.6 && R() < 0.7) continue; mjPlante(x, z) }
  lxNettoyer(/(pane|_bars|fence|chain|_slab|leaves|carpet|_wool|lantern|cocoa|vine|grass|fern|dead_bush|button|sack)/)
}

var QFIN_RN1 = function () {
  HB2 = true; FIN = true; THM = null
  lot(function () { HM = {}; FIN_VOLET = null; FIN_RID = null; mjRoute(); finAncrage() }, 0, 0, 999, 7001, 128, 30)
  HB2 = false; FIN = false; THM = null; HM = {}
}
function vuesRN1() {
  vue('n_rn1', 0, 0, 56.5, 1.6, 1, 56.5, 2, 127)
  vue('n_rn1_haut', 0, 0, 56.5, 22, -12, 56.5, 0, 70)
  vue('n_bas_cote', 0, 0, 47, 1.6, 4, 47, 2, 70)
  vue('n_piece_dehors', 0, 0, 54, 1.7, 36, 43, 2, 36)
  vue('n_piece_seuil', 0, 0, 41, 1.7, 36, 32, 1.2, 33)
  vue('n_barricade', 0, 0, 55, 1.7, 36, 43, 1, 42.5)
  vue('n_abords_ouest', 0, 0, 47, 1.7, 52, 45, 1.2, 75)
  vue('n_abords_est', 0, 0, 66, 1.7, 40, 68, 1.2, 15)
  vue('n_brulee', 0, 0, 52, 3, 54, 39, 2, 47)
  vue('n_demolie', 0, 0, 58, 4, 46, 74, 1, 55)
  vue('n_ruelle_ouest', 0, 0, 26.5, 1.7, 3, 26.5, 1.2, 60)
  vue('n_ruelle_est', 0, 0, 85.5, 1.7, 124, 85.5, 1.2, 70)
  vue('n_cours', 0, 0, 121, 9, 4, 96, 0, 40)
  vue('n_majicavo', 0, 0, 56.5, 14, 128, 56.5, 0, 60)
  vue('n_dessus', 0, 0, 64, 75, -25, 64, 0, 64)
}
