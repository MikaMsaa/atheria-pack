
// ================= BANC D'ESSAI des mods ajoutes (Windows, Paths, Handcrafted) : orientations et proprietes =================
function bancProps() {
  var RG = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries'), RL = Java.loadClass('net.minecraft.resources.ResourceLocation')
  ;['mcwwindows:oak_shutter', 'mcwwindows:oak_louvered_shutter', 'mcwwindows:oak_window', 'mcwwindows:oak_window2', 'mcwwindows:oak_four_window', 'mcwwindows:oak_plank_pane_window', 'mcwwindows:red_curtain', 'mcwwindows:oak_curtain_rod', 'mcwwindows:spruce_blinds', 'mcwwindows:stone_brick_arrow_slit', 'mcwwindows:blackstone_parapet', 'mcwwindows:blackstone_brick_gothic', 'mcwpaths:dirt_path_block', 'handcrafted:oak_counter', 'handcrafted:oak_cupboard', 'handcrafted:oak_drawer', 'handcrafted:oak_shelf', 'handcrafted:oak_fancy_bed', 'handcrafted:oak_table', 'handcrafted:oak_couch', 'handcrafted:oak_pillar_trim', 'handcrafted:oak_corner_trim', 'handcrafted:witch_trophy'].forEach(id => {
    var b = RG.BLOCK.get(RL.parse(id)), t = []
    b.getStateDefinition().getProperties().forEach(p => t.push(p.getName() + '=' + p.getPossibleValues()))
    vlog('PROPS ' + id + ' ' + t.join(' ; '))
  })
}
function banc() {
  F(0, -1, 0, 31, -1, 20, 'minecraft:smooth_stone'); F(0, 0, 0, 31, 0, 12, 'minecraft:spruce_planks')
  // chaque meuble facing=south en z = 4, tapis rouge en z = 5 (le cote "sud") ; camera au sud
  var M = ['handcrafted:oak_chair[color=none,facing=south,waterlogged=false]', 'handcrafted:oak_couch[color=white,facing=south,shape=single,waterlogged=false]', 'handcrafted:oak_counter[counter=calcite,facing=south,type=1]', 'handcrafted:oak_cupboard[facing=south,type=1]', 'handcrafted:oak_drawer[facing=south,shape=single,type=1]', 'handcrafted:oak_desk[color=none,facing=south,waterlogged=false]', 'handcrafted:oak_nightstand[color=none,facing=south,waterlogged=false]', 'handcrafted:oak_bench[color=none,facing=south,shape=single,waterlogged=false]', 'handcrafted:oak_dining_bench[facing=south,shape=single,waterlogged=false]', 'handcrafted:oak_shelf[facing=south,shape=single,type=1]']
  for (var i = 0; i < M.length; i++) { S(1 + i * 3, 1, 4, M[i]); S(1 + i * 3, 1, 5, 'minecraft:red_carpet') }
  // rangee 2 : canapes en L (left, middle, right), lit a baldaquin facing=south (tete au sud ?), trophee en deux moities, fenetre Macaw sans part
  S(2, 1, 9, 'handcrafted:oak_couch[color=red,facing=south,shape=left,waterlogged=false]'); S(3, 1, 9, 'handcrafted:oak_couch[color=red,facing=south,shape=middle,waterlogged=false]'); S(4, 1, 9, 'handcrafted:oak_couch[color=red,facing=south,shape=right,waterlogged=false]')
  S(8, 1, 9, 'handcrafted:oak_fancy_bed[color=blue,facing=south,occupied=false,part=foot,shape=single]'); S(8, 1, 10, 'handcrafted:oak_fancy_bed[color=blue,facing=south,occupied=false,part=head,shape=single]')
  S(12, 1, 9, 'handcrafted:witch_trophy[facing=south,half=lower,waterlogged=false]'); S(12, 2, 9, 'handcrafted:witch_trophy[facing=south,half=upper,waterlogged=false]')
  F(15, 1, 11, 19, 4, 11, 'minecraft:stone_bricks'); S(16, 2, 11, 'mcwwindows:oak_window[facing=north]'); S(16, 3, 11, 'mcwwindows:oak_window[facing=north]'); S(18, 2, 11, 'mcwwindows:oak_window[facing=east]'); S(18, 3, 11, 'mcwwindows:oak_window[facing=east]')
  S(22, 1, 9, 'handcrafted:oak_table[color=red,shape=single,waterlogged=false]'); S(22, 2, 9, 'handcrafted:wood_crockery_combo[facing=south,waterlogged=false]'); S(23, 1, 9, 'handcrafted:oak_chair[color=red,facing=west,waterlogged=false]')
  S(26, 1, 9, 'handcrafted:oak_corner_trim[facing=south,half=bottom,trim=normal,waterlogged=false]'); S(28, 1, 9, 'handcrafted:oak_pillar_trim[face=floor,facing=south,trim=normal,type=1,waterlogged=false]')
}
var BANC_FN = function () { lot(banc, 0, 0, 999, 7, 32, 12) }
var BANC_VUES = function () {
  vue('banc_m1', 0, 0, 4, 3.5, 9, 4, 1, 4)
  vue('banc_m2', 0, 0, 13, 3.5, 9, 13, 1, 4)
  vue('banc_m3', 0, 0, 22, 3.5, 9, 22, 1, 4)
  vue('banc_m4', 0, 0, 27, 3.5, 9, 27, 1, 4)
  vue('banc_r2a', 0, 0, 6, 4, 15, 6, 1, 9)
  vue('banc_r2b', 0, 0, 20, 4, 16, 20, 1, 9)
  vue('banc_r2c', 0, 0, 26, 4, 15, 26, 1, 9)
  vue('banc_m1_haut', 0, 0, 7, 9, 7, 7, 0, 4.5)
}