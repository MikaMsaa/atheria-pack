# Comparaison par categorie

A = C:/Users/El-Afdal/Desktop/Atheria Zombie Edition/outils/serveur-pilote-essai/pilote-ville-origine
B = C:/Users/El-Afdal/Desktop/Atheria Zombie Edition/outils/serveur-pilote-essai/pilote-ville-rapide
zone 2800 -1064 .. 3119 -745 ; chunks complets compares 420 ; absents/incomplets 0

| categorie | blocs differents | exigence | verdict |
|---|---|---|---|
| RN1 (emprise route) | 4 | 0 (identique) | KO |
| lots | 0 | 0 (identique) | OK |
| villes / bati / mods | 301 | 0 (identique) | KO |
| terrain : forme (plein <-> vide) | 567 | 0 (identique) | KO |
| contenants (coffres aleatoires atheria_coffres / lootr) | 722 | signale a part | - |
| etat de bloc seulement (connexions vitres, orientations) | 552 | signale a part | - |
| naturel de surface, bord de chunk (limite vanilla) | 5202 | signale a part | - |
| naturel de surface, interieur | 2611 | signale a part | - |
| poches et filons souterrains (features, ordre de generation) | 40597 | signale a part | - |
| variantes de palette Lost Cities (connues) | 1632 | signale a part | - |

## poches et filons souterrains (features, ordre de generation)

- minecraft:andesite -> minecraft:stone : 9194
- minecraft:stone -> minecraft:andesite : 6958
- minecraft:stone -> minecraft:dirt : 2611
- minecraft:dirt -> minecraft:stone : 2500
- minecraft:stone -> minecraft:coal_ore : 1892
- minecraft:coal_ore -> minecraft:stone : 1847
- minecraft:deepslate -> minecraft:dirt : 1012
- minecraft:dirt -> minecraft:deepslate : 939
- minecraft:deepslate -> minecraft:stone : 913
- minecraft:stone -> minecraft:deepslate : 880
- minecraft:dirt -> minecraft:coarse_dirt : 721
- minecraft:deepslate -> minecraft:andesite : 590
- minecraft:gravel -> minecraft:stone : 550
- minecraft:andesite -> minecraft:deepslate : 548
- minecraft:coarse_dirt -> minecraft:dirt : 495
- exemples : 2800 7 -1060 minecraft:stone->minecraft:andesite; 2800 8 -1062 minecraft:stone->minecraft:andesite; 2800 8 -1061 minecraft:stone->minecraft:andesite; 2801 8 -1061 minecraft:stone->minecraft:andesite; 2800 8 -1060 minecraft:stone->minecraft:andesite; 2801 8 -1060 minecraft:stone->minecraft:andesite; 2802 8 -1060 minecraft:stone->minecraft:andesite; 2801 8 -1059 minecraft:stone->minecraft:andesite

## naturel de surface, bord de chunk (limite vanilla)

- minecraft:grass_block -> minecraft:dirt : 610
- minecraft:dirt -> minecraft:grass_block : 576
- minecraft:air -> minecraft:oak_leaves : 538
- minecraft:oak_leaves -> minecraft:air : 373
- minecraft:deepslate -> minecraft:grass_block : 319
- minecraft:grass_block -> minecraft:coarse_dirt : 257
- minecraft:grass_block -> minecraft:deepslate : 231
- minecraft:coarse_dirt -> minecraft:grass_block : 172
- minecraft:stone -> minecraft:grass_block : 162
- minecraft:grass_block -> minecraft:stone : 145
- minecraft:air -> minecraft:short_grass : 111
- minecraft:jungle_leaves -> minecraft:oak_leaves : 92
- minecraft:short_grass -> minecraft:air : 92
- minecraft:oak_leaves -> minecraft:spruce_leaves : 72
- minecraft:oak_leaves -> minecraft:jungle_leaves : 71
- exemples : 2813 66 -1060 minecraft:tall_grass->minecraft:dirt; 2814 66 -1060 minecraft:tall_grass->minecraft:dirt; 2814 66 -1058 minecraft:tall_grass->minecraft:dirt; 2814 66 -891 minecraft:dirt->minecraft:grass_block; 2802 65 -841 minecraft:grass_block->minecraft:dirt; 2803 65 -835 minecraft:grass_block->minecraft:dirt; 2801 66 -848 minecraft:grass_block->minecraft:dirt; 2804 66 -848 minecraft:grass_block->minecraft:dirt

## variantes de palette Lost Cities (connues)

- minecraft:mossy_cobblestone -> minecraft:moss_block : 388
- minecraft:moss_block -> minecraft:mossy_cobblestone : 373
- minecraft:mossy_stone_bricks -> minecraft:moss_block : 196
- minecraft:moss_block -> minecraft:mossy_stone_bricks : 189
- minecraft:mossy_cobblestone -> minecraft:mossy_stone_bricks : 129
- minecraft:iron_block -> minecraft:light_gray_concrete : 123
- minecraft:light_gray_concrete -> minecraft:iron_block : 121
- minecraft:mossy_stone_bricks -> minecraft:mossy_cobblestone : 113
- exemples : 2813 66 -1057 minecraft:iron_block->minecraft:light_gray_concrete; 2808 67 -848 minecraft:moss_block->minecraft:mossy_stone_bricks; 2811 67 -848 minecraft:moss_block->minecraft:mossy_cobblestone; 2812 67 -848 minecraft:mossy_cobblestone->minecraft:moss_block; 2813 67 -848 minecraft:moss_block->minecraft:mossy_stone_bricks; 2815 67 -848 minecraft:mossy_stone_bricks->minecraft:moss_block; 2813 67 -847 minecraft:mossy_cobblestone->minecraft:mossy_stone_bricks; 2808 68 -848 minecraft:mossy_cobblestone->minecraft:mossy_stone_bricks

## contenants (coffres aleatoires atheria_coffres / lootr)

- minecraft:air -> lootr:lootr_chest : 131
- lootr:lootr_chest -> minecraft:air : 122
- minecraft:air -> lootr:lootr_barrel : 111
- lootr:lootr_barrel -> minecraft:air : 107
- minecraft:chest -> minecraft:air : 65
- minecraft:air -> minecraft:chest : 53
- minecraft:air -> minecraft:barrel : 50
- minecraft:barrel -> minecraft:air : 43
- lootr:lootr_chest -> minecraft:chest : 26
- minecraft:chest -> lootr:lootr_chest : 10
- lootr:lootr_barrel -> lootr:lootr_chest : 2
- minecraft:barrel -> minecraft:chest : 1
- lootr:lootr_chest -> lootr:lootr_barrel : 1
- exemples : 2808 69 -1070 minecraft:chest->minecraft:air; 2804 69 -1069 minecraft:air->minecraft:barrel; 2813 69 -1062 minecraft:chest->minecraft:air; 2811 75 -1066 minecraft:chest->minecraft:air; 2809 75 -1064 minecraft:air->minecraft:barrel; 2804 75 -1063 minecraft:chest->minecraft:air; 2810 76 -1067 minecraft:air->minecraft:barrel; 2813 82 -1068 minecraft:air->minecraft:chest

## terrain : forme (plein <-> vide)

- minecraft:stone -> minecraft:water : 154
- minecraft:water -> minecraft:stone : 111
- minecraft:grass_block -> minecraft:air : 76
- minecraft:air -> minecraft:grass_block : 64
- minecraft:water -> minecraft:andesite : 35
- minecraft:dirt -> minecraft:air : 28
- minecraft:air -> minecraft:dirt : 26
- minecraft:andesite -> minecraft:water : 21
- minecraft:water -> minecraft:dirt : 18
- minecraft:air -> minecraft:smooth_basalt : 8
- minecraft:air -> minecraft:stone : 6
- minecraft:dirt -> minecraft:water : 5
- minecraft:deepslate -> minecraft:water : 4
- minecraft:air -> minecraft:sand : 4
- minecraft:water -> minecraft:grass_block : 3
- exemples : 2814 11 -891 minecraft:water->minecraft:andesite; 2830 66 -1070 minecraft:air->minecraft:dirt; 2832 67 -1050 minecraft:air->minecraft:grass_block; 2835 66 -862 minecraft:air->minecraft:grass_block; 2854 9 -868 minecraft:andesite->minecraft:water; 2861 67 -866 minecraft:grass_block->minecraft:air; 2863 67 -866 minecraft:grass_block->minecraft:air; 2860 67 -865 minecraft:grass_block->minecraft:air

## naturel de surface, interieur

- minecraft:air -> minecraft:oak_leaves : 344
- minecraft:oak_leaves -> minecraft:air : 327
- minecraft:deepslate -> minecraft:grass_block : 223
- minecraft:grass_block -> minecraft:deepslate : 215
- minecraft:dirt -> minecraft:grass_block : 170
- minecraft:grass_block -> minecraft:dirt : 161
- minecraft:grass_block -> minecraft:coarse_dirt : 124
- minecraft:coarse_dirt -> minecraft:grass_block : 92
- minecraft:tuff -> minecraft:grass_block : 68
- minecraft:air -> minecraft:short_grass : 61
- minecraft:short_grass -> minecraft:air : 58
- minecraft:stone -> minecraft:grass_block : 58
- minecraft:oak_leaves -> minecraft:spruce_leaves : 54
- minecraft:oak_leaves -> minecraft:jungle_leaves : 54
- minecraft:jungle_leaves -> minecraft:oak_leaves : 50
- exemples : 2803 65 -845 minecraft:grass_block->minecraft:dirt; 2803 65 -838 minecraft:grass_block->minecraft:dirt; 2803 65 -837 minecraft:grass_block->minecraft:dirt; 2804 66 -842 minecraft:grass_block->minecraft:dirt; 2805 66 -842 minecraft:grass_block->minecraft:dirt; 2803 66 -841 minecraft:grass_block->minecraft:dirt; 2803 67 -845 minecraft:moss_block->minecraft:grass_block; 2803 67 -838 minecraft:moss_block->minecraft:grass_block

## RN1 (emprise route)

- minecraft:mossy_stone_bricks -> minecraft:grass_block : 2
- minecraft:mossy_cobblestone -> minecraft:grass_block : 2
- exemples : 2801 67 -842 minecraft:mossy_stone_bricks->minecraft:grass_block; 2802 67 -841 minecraft:mossy_cobblestone->minecraft:grass_block; 2803 67 -841 minecraft:mossy_stone_bricks->minecraft:grass_block; 2803 67 -835 minecraft:mossy_cobblestone->minecraft:grass_block

## etat de bloc seulement (connexions vitres, orientations)

- minecraft:glass_pane -> minecraft:glass_pane : 185
- minecraft:oak_leaves -> minecraft:oak_leaves : 129
- minecraft:light_blue_stained_glass_pane -> minecraft:light_blue_stained_glass_pane : 90
- minecraft:gray_stained_glass_pane -> minecraft:gray_stained_glass_pane : 22
- minecraft:light_gray_stained_glass_pane -> minecraft:light_gray_stained_glass_pane : 21
- handcrafted:dark_oak_couch -> handcrafted:dark_oak_couch : 21
- minecraft:iron_bars -> minecraft:iron_bars : 17
- mcwfences:iron_cheval_de_frise -> mcwfences:iron_cheval_de_frise : 16
- handcrafted:birch_couch -> handcrafted:birch_couch : 6
- handcrafted:birch_shelf -> handcrafted:birch_shelf : 6
- minecraft:tall_grass -> minecraft:tall_grass : 4
- minecraft:glow_lichen -> minecraft:glow_lichen : 3
- jurassicreborn:protoceratops_fossil -> jurassicreborn:protoceratops_fossil : 2
- jurassicreborn:pachycephalosaurus_fossil -> jurassicreborn:pachycephalosaurus_fossil : 2
- minecraft:deepslate_tile_stairs -> minecraft:deepslate_tile_stairs : 2
- exemples : 2820 70 -1061 minecraft:light_blue_stained_glass_pane->minecraft:light_blue_stained_glass_pane; 2819 35 -808 minecraft:oak_leaves->minecraft:oak_leaves; 2821 35 -808 minecraft:oak_leaves->minecraft:oak_leaves; 2822 35 -807 minecraft:oak_leaves->minecraft:oak_leaves; 2823 35 -807 minecraft:oak_leaves->minecraft:oak_leaves; 2821 36 -810 minecraft:oak_leaves->minecraft:oak_leaves; 2820 36 -809 minecraft:oak_leaves->minecraft:oak_leaves; 2822 36 -809 minecraft:oak_leaves->minecraft:oak_leaves

## villes / bati / mods

- minecraft:cut_sandstone -> minecraft:stone : 138
- minecraft:mossy_cobblestone -> minecraft:grass_block : 23
- minecraft:grass_block -> minecraft:mossy_cobblestone : 21
- minecraft:mossy_stone_bricks -> minecraft:grass_block : 16
- minecraft:grass_block -> minecraft:mossy_stone_bricks : 16
- minecraft:cut_sandstone -> minecraft:dirt : 16
- supplementaries:barnacles -> minecraft:water : 6
- minecraft:tall_grass -> minecraft:mossy_cobblestone : 5
- minecraft:short_grass -> minecraft:mossy_cobblestone : 5
- minecraft:deepslate -> minecraft:cobbled_deepslate : 5
- minecraft:mossy_cobblestone -> minecraft:short_grass : 4
- minecraft:cobbled_deepslate -> minecraft:deepslate : 4
- minecraft:polished_deepslate -> minecraft:smooth_basalt : 4
- minecraft:stone_bricks -> minecraft:smooth_basalt : 4
- minecraft:water -> supplementaries:barnacles : 4
- exemples : 2826 67 -848 minecraft:mossy_cobblestone->minecraft:grass_block; 2827 67 -847 minecraft:mossy_stone_bricks->minecraft:grass_block; 2831 67 -845 minecraft:mossy_cobblestone->minecraft:grass_block; 2834 67 -1059 minecraft:mossy_cobblestone->minecraft:grass_block; 2838 68 -1072 minecraft:tall_grass->minecraft:mossy_stone_bricks; 2845 68 -1071 minecraft:tall_grass->minecraft:mossy_cobblestone; 2844 68 -1070 minecraft:tall_grass->minecraft:mossy_cobblestone; 2833 68 -1067 minecraft:short_grass->minecraft:mossy_stone_bricks
