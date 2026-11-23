# Comparaison par categorie

A = C:/Users/El-Afdal/Desktop/Atheria Zombie Edition/outils/serveur-pilote-essai/pilote-relief-ref
B = C:/Users/El-Afdal/Desktop/Atheria Zombie Edition/outils/serveur-pilote-essai/pilote
zone 2864 -1000 .. 3055 -809 ; chunks complets compares 152 ; absents/incomplets 4

| categorie | blocs differents | exigence | verdict |
|---|---|---|---|
| RN1 (emprise route) | 0 | 0 (identique) | OK |
| lots | 4 | 0 (identique) | KO |
| villes / bati / mods | 651 | 0 (identique) | KO |
| terrain : forme (plein <-> vide) | 955 | 0 (identique) | KO |
| contenants (coffres aleatoires atheria_coffres / lootr) | 175 | signale a part | - |
| etat de bloc seulement (connexions vitres, orientations) | 129 | signale a part | - |
| naturel de surface, bord de chunk (limite vanilla) | 2077 | signale a part | - |
| naturel de surface, interieur | 856 | signale a part | - |
| poches et filons souterrains (features, ordre de generation) | 34322 | signale a part | - |
| variantes de palette Lost Cities (connues) | 185 | signale a part | - |

## poches et filons souterrains (features, ordre de generation)

- minecraft:deepslate -> minecraft:tuff : 6468
- minecraft:stone -> minecraft:andesite : 6264
- minecraft:andesite -> minecraft:stone : 3873
- minecraft:stone -> minecraft:dirt : 2426
- minecraft:coal_ore -> minecraft:stone : 1291
- minecraft:tuff -> minecraft:deepslate : 1238
- minecraft:deepslate -> minecraft:gravel : 1220
- minecraft:stone -> minecraft:coal_ore : 1041
- minecraft:deepslate -> minecraft:stone : 1036
- minecraft:stone -> minecraft:gravel : 803
- minecraft:stone -> minecraft:tuff : 791
- minecraft:dirt -> minecraft:stone : 671
- minecraft:stone -> create:veridium : 527
- minecraft:stone -> minecraft:deepslate : 459
- minecraft:gravel -> minecraft:stone : 376
- exemples : 2873 1 -1008 minecraft:andesite->minecraft:stone; 2874 1 -1008 minecraft:andesite->minecraft:stone; 2868 1 -1007 minecraft:andesite->minecraft:stone; 2870 1 -1006 minecraft:andesite->minecraft:stone; 2872 2 -1008 minecraft:andesite->minecraft:stone; 2868 2 -1007 minecraft:andesite->minecraft:stone; 2869 2 -1007 minecraft:andesite->minecraft:stone; 2870 2 -1007 minecraft:andesite->minecraft:stone

## naturel de surface, bord de chunk (limite vanilla)

- minecraft:dirt -> minecraft:grass_block : 374
- minecraft:air -> minecraft:short_grass : 323
- minecraft:air -> minecraft:tall_grass : 194
- minecraft:grass_block -> minecraft:dirt : 102
- minecraft:deepslate -> minecraft:amethyst_block : 95
- minecraft:stone -> minecraft:grass_block : 87
- minecraft:short_grass -> minecraft:tall_grass : 72
- minecraft:tall_grass -> minecraft:air : 69
- minecraft:tall_grass -> minecraft:short_grass : 63
- minecraft:oak_leaves -> minecraft:air : 63
- minecraft:air -> minecraft:water : 60
- minecraft:stone -> minecraft:amethyst_block : 57
- minecraft:dirt -> minecraft:short_grass : 40
- minecraft:water -> minecraft:air : 37
- minecraft:deepslate -> minecraft:grass_block : 32
- exemples : 2868 65 -1007 minecraft:tall_grass->minecraft:short_grass; 2870 65 -1006 minecraft:tall_grass->minecraft:short_grass; 2875 65 -1006 minecraft:short_grass->minecraft:tall_grass; 2868 66 -1007 minecraft:tall_grass->minecraft:air; 2870 66 -1006 minecraft:tall_grass->minecraft:air; 2875 66 -1006 minecraft:air->minecraft:tall_grass; 2864 64 -897 minecraft:stone->minecraft:grass_block; 2866 65 -910 minecraft:short_grass->minecraft:tall_grass

## naturel de surface, interieur

- minecraft:dirt -> minecraft:grass_block : 312
- minecraft:air -> minecraft:short_grass : 60
- minecraft:coarse_dirt -> minecraft:grass_block : 51
- minecraft:oak_leaves -> minecraft:air : 39
- minecraft:air -> minecraft:tall_grass : 33
- minecraft:air -> minecraft:oak_leaves : 32
- minecraft:grass_block -> minecraft:dirt : 31
- minecraft:dirt -> minecraft:short_grass : 30
- minecraft:water -> minecraft:air : 27
- minecraft:grass_block -> minecraft:stone : 23
- minecraft:stone -> minecraft:grass_block : 23
- minecraft:short_grass -> minecraft:air : 20
- minecraft:tall_grass -> minecraft:air : 18
- minecraft:deepslate -> minecraft:grass_block : 18
- minecraft:deepslate -> minecraft:amethyst_block : 16
- exemples : 2876 65 -1005 minecraft:tall_grass->minecraft:short_grass; 2876 66 -1005 minecraft:tall_grass->minecraft:air; 2869 66 -886 minecraft:grass_block->minecraft:dirt; 2867 66 -884 minecraft:grass_block->minecraft:dirt; 2867 66 -820 minecraft:grass_block->minecraft:dirt; 2867 65 -809 minecraft:grass_block->minecraft:dirt; 2867 65 -806 minecraft:grass_block->minecraft:dirt; 2867 65 -804 minecraft:grass_block->minecraft:dirt

## terrain : forme (plein <-> vide)

- minecraft:deepslate -> minecraft:air : 178
- minecraft:air -> minecraft:gravel : 107
- minecraft:air -> minecraft:smooth_basalt : 102
- minecraft:stone -> minecraft:water : 99
- minecraft:water -> minecraft:stone : 95
- minecraft:dirt -> minecraft:air : 64
- minecraft:air -> minecraft:calcite : 59
- minecraft:andesite -> minecraft:air : 45
- minecraft:deepslate -> minecraft:water : 42
- minecraft:deepslate -> minecraft:cave_air : 28
- minecraft:stone -> minecraft:air : 26
- minecraft:stone -> minecraft:cave_air : 20
- minecraft:grass_block -> minecraft:air : 17
- minecraft:air -> minecraft:grass_block : 15
- minecraft:water -> minecraft:deepslate : 9
- exemples : 2867 6 -894 minecraft:water->minecraft:deepslate; 2864 8 -884 minecraft:water->minecraft:andesite; 2867 10 -894 minecraft:andesite->minecraft:water; 2864 10 -884 minecraft:andesite->minecraft:water; 2866 37 -881 minecraft:water->minecraft:stone; 2866 40 -881 minecraft:stone->minecraft:water; 2867 48 -894 minecraft:water->minecraft:stone; 2867 50 -894 minecraft:stone->minecraft:water

## variantes de palette Lost Cities (connues)

- minecraft:moss_block -> minecraft:mossy_cobblestone : 43
- minecraft:mossy_cobblestone -> minecraft:moss_block : 40
- minecraft:mossy_stone_bricks -> minecraft:moss_block : 27
- minecraft:moss_block -> minecraft:mossy_stone_bricks : 23
- minecraft:iron_block -> minecraft:light_gray_concrete : 17
- minecraft:light_gray_concrete -> minecraft:iron_block : 16
- minecraft:mossy_cobblestone -> minecraft:mossy_stone_bricks : 13
- minecraft:mossy_stone_bricks -> minecraft:mossy_cobblestone : 6
- exemples : 2867 67 -896 minecraft:mossy_cobblestone->minecraft:mossy_stone_bricks; 2865 67 -894 minecraft:mossy_cobblestone->minecraft:moss_block; 2865 68 -894 minecraft:mossy_cobblestone->minecraft:moss_block; 2866 68 -893 minecraft:moss_block->minecraft:mossy_stone_bricks; 2864 68 -892 minecraft:mossy_cobblestone->minecraft:moss_block; 2865 68 -892 minecraft:moss_block->minecraft:mossy_cobblestone; 2866 68 -892 minecraft:mossy_cobblestone->minecraft:moss_block; 2866 68 -891 minecraft:mossy_stone_bricks->minecraft:moss_block

## villes / bati / mods

- minecraft:iron_block -> minecraft:dirt : 229
- minecraft:iron_block -> minecraft:grass_block : 161
- minecraft:deepslate -> minecraft:cobbled_deepslate : 48
- minecraft:iron_block -> minecraft:stone : 40
- minecraft:iron_block -> minecraft:air : 28
- minecraft:iron_block -> minecraft:short_grass : 25
- minecraft:stone -> minecraft:cobblestone : 21
- minecraft:tuff -> minecraft:cobbled_deepslate : 19
- minecraft:light_gray_concrete -> minecraft:dirt : 13
- minecraft:stone -> minecraft:mossy_cobblestone : 11
- minecraft:mossy_cobblestone -> minecraft:grass_block : 10
- minecraft:light_gray_concrete -> minecraft:grass_block : 7
- minecraft:light_gray_concrete -> minecraft:stone : 7
- minecraft:iron_block -> minecraft:copper_ore : 5
- minecraft:mossy_stone_bricks -> minecraft:grass_block : 4
- exemples : 2864 67 -893 minecraft:mossy_cobblestone->minecraft:grass_block; 2867 67 -884 minecraft:mossy_cobblestone->minecraft:grass_block; 2866 67 -881 minecraft:mossy_cobblestone->minecraft:grass_block; 2900 0 -995 minecraft:deepslate->minecraft:cobbled_deepslate; 2897 2 -993 minecraft:deepslate->minecraft:cobbled_deepslate; 2896 5 -994 minecraft:deepslate->minecraft:cobbled_deepslate; 2896 64 -1008 minecraft:iron_block->minecraft:dirt; 2897 64 -1008 minecraft:iron_block->minecraft:dirt

## contenants (coffres aleatoires atheria_coffres / lootr)

- minecraft:air -> minecraft:chest : 34
- minecraft:air -> minecraft:barrel : 24
- minecraft:chest -> minecraft:air : 24
- minecraft:barrel -> minecraft:air : 22
- lootr:lootr_chest -> minecraft:air : 22
- minecraft:air -> lootr:lootr_chest : 17
- lootr:lootr_barrel -> minecraft:air : 13
- minecraft:air -> lootr:lootr_barrel : 9
- lootr:lootr_chest -> minecraft:chest : 9
- lootr:lootr_barrel -> minecraft:barrel : 1
- exemples : 2876 69 -846 minecraft:air->minecraft:chest; 2893 63 -974 minecraft:air->minecraft:barrel; 2887 59 -835 minecraft:air->minecraft:chest; 2886 69 -840 minecraft:barrel->minecraft:air; 2889 69 -839 minecraft:air->minecraft:barrel; 2892 75 -844 minecraft:chest->minecraft:air; 2885 75 -842 minecraft:barrel->minecraft:air; 2887 75 -840 minecraft:air->minecraft:chest

## etat de bloc seulement (connexions vitres, orientations)

- minecraft:light_blue_stained_glass_pane -> minecraft:light_blue_stained_glass_pane : 50
- minecraft:glass_pane -> minecraft:glass_pane : 20
- minecraft:birch_leaves -> minecraft:birch_leaves : 13
- minecraft:oak_leaves -> minecraft:oak_leaves : 11
- minecraft:iron_bars -> minecraft:iron_bars : 9
- minecraft:water -> minecraft:water : 7
- minecraft:azalea_leaves -> minecraft:azalea_leaves : 5
- handcrafted:dark_oak_couch -> handcrafted:dark_oak_couch : 3
- minecraft:cobblestone_wall -> minecraft:cobblestone_wall : 3
- handcrafted:birch_couch -> handcrafted:birch_couch : 2
- mcwfences:iron_cheval_de_frise -> mcwfences:iron_cheval_de_frise : 1
- jurassicreborn:spinosaurus_fossil -> jurassicreborn:spinosaurus_fossil : 1
- jurassicreborn:crassigyrinus_fossil -> jurassicreborn:crassigyrinus_fossil : 1
- minecraft:light_gray_stained_glass_pane -> minecraft:light_gray_stained_glass_pane : 1
- handcrafted:birch_table -> handcrafted:birch_table : 1
- exemples : 2864 68 -817 mcwfences:iron_cheval_de_frise->mcwfences:iron_cheval_de_frise; 2885 -24 -807 minecraft:oak_leaves->minecraft:oak_leaves; 2888 -24 -807 minecraft:oak_leaves->minecraft:oak_leaves; 2885 -24 -806 minecraft:oak_leaves->minecraft:oak_leaves; 2886 -24 -806 minecraft:oak_leaves->minecraft:oak_leaves; 2887 -24 -806 minecraft:oak_leaves->minecraft:oak_leaves; 2888 -24 -806 minecraft:oak_leaves->minecraft:oak_leaves; 2887 -24 -805 minecraft:oak_leaves->minecraft:oak_leaves

## lots

- minecraft:deepslate -> minecraft:medium_amethyst_bud : 3
- minecraft:andesite -> minecraft:small_amethyst_bud : 1
- exemples : 2927 -26 -911 minecraft:deepslate->minecraft:medium_amethyst_bud; 3009 1 -849 minecraft:deepslate->minecraft:medium_amethyst_bud; 3009 3 -849 minecraft:deepslate->minecraft:medium_amethyst_bud; 3010 6 -851 minecraft:andesite->minecraft:small_amethyst_bud
