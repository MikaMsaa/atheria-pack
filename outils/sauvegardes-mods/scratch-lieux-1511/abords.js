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
