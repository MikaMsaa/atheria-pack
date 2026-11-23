# Comparaison par categorie

A = C:/Users/El-Afdal/Desktop/Atheria Zombie Edition/outils/serveur-pilote-essai/pilote-relief-ref
B = C:/Users/El-Afdal/Desktop/Atheria Zombie Edition/outils/serveur-pilote-essai/pilote
zone 2864 -1000 .. 3055 -809 ; chunks complets compares 113 ; absents/incomplets 43

| categorie | blocs differents | exigence | verdict |
|---|---|---|---|
| RN1 (emprise route) | 0 | 0 (identique) | OK |
| lots | 0 | 0 (identique) | OK |
| villes / bati / mods | 28 | 0 (identique) | KO |
| terrain : forme (plein <-> vide) | 35 | 0 (identique) | KO |
| contenants (coffres aleatoires atheria_coffres / lootr) | 129 | signale a part | - |
| etat de bloc seulement (connexions vitres, orientations) | 15 | signale a part | - |
| naturel de surface, bord de chunk (limite vanilla) | 517 | signale a part | - |
| naturel de surface, interieur | 141 | signale a part | - |
| poches et filons souterrains (features, ordre de generation) | 4222 | signale a part | - |
| variantes de palette Lost Cities (connues) | 274 | signale a part | - |

## poches et filons souterrains (features, ordre de generation)

- minecraft:andesite -> minecraft:stone : 1325
- minecraft:stone -> minecraft:andesite : 499
- minecraft:coal_ore -> minecraft:stone : 469
- minecraft:dirt -> minecraft:stone : 347
- minecraft:stone -> minecraft:dirt : 332
- minecraft:stone -> minecraft:coal_ore : 188
- minecraft:deepslate -> minecraft:stone : 122
- minecraft:stone -> minecraft:deepslate : 120
- minecraft:gravel -> minecraft:stone : 101
- minecraft:andesite -> minecraft:deepslate : 72
- minecraft:deepslate -> minecraft:andesite : 50
- minecraft:gravel -> minecraft:dirt : 50
- minecraft:stone -> minecraft:gravel : 49
- minecraft:stone -> jurassicreborn:gypsum_stone : 38
- jurassicreborn:gypsum_stone -> minecraft:stone : 34
- exemples : 2865 3 -869 minecraft:deepslate->minecraft:andesite; 2866 4 -877 minecraft:deepslate->minecraft:stone; 2867 4 -875 minecraft:deepslate->minecraft:stone; 2865 4 -872 minecraft:deepslate->minecraft:andesite; 2865 4 -870 minecraft:deepslate->minecraft:andesite; 2865 4 -869 minecraft:deepslate->minecraft:andesite; 2869 4 -869 minecraft:deepslate->minecraft:andesite; 2864 4 -865 minecraft:deepslate->minecraft:andesite

## terrain : forme (plein <-> vide)

- minecraft:stone -> minecraft:water : 10
- minecraft:water -> minecraft:stone : 8
- minecraft:air -> minecraft:grass_block : 7
- minecraft:water -> minecraft:deepslate : 3
- minecraft:dirt -> minecraft:air : 2
- minecraft:air -> minecraft:dirt : 2
- minecraft:deepslate -> minecraft:water : 2
- minecraft:grass_block -> minecraft:air : 1
- exemples : 2866 37 -880 minecraft:water->minecraft:stone; 2866 39 -880 minecraft:stone->minecraft:water; 2864 39 -877 minecraft:water->minecraft:stone; 2864 39 -876 minecraft:water->minecraft:stone; 2864 40 -877 minecraft:stone->minecraft:water; 2864 40 -876 minecraft:stone->minecraft:water; 2864 67 -865 minecraft:air->minecraft:grass_block; 2964 66 -821 minecraft:dirt->minecraft:air

## naturel de surface, bord de chunk (limite vanilla)

- minecraft:grass_block -> minecraft:dirt : 113
- minecraft:dirt -> minecraft:grass_block : 72
- minecraft:grass_block -> minecraft:stone : 32
- minecraft:tall_grass -> minecraft:short_grass : 28
- minecraft:tall_grass -> minecraft:air : 27
- minecraft:stone -> minecraft:grass_block : 26
- minecraft:air -> minecraft:tall_grass : 22
- minecraft:short_grass -> minecraft:tall_grass : 21
- minecraft:oak_leaves -> minecraft:spruce_leaves : 18
- minecraft:moss_block -> minecraft:grass_block : 16
- minecraft:spruce_leaves -> minecraft:oak_leaves : 15
- minecraft:oak_leaves -> minecraft:air : 15
- minecraft:oak_leaves -> minecraft:jungle_leaves : 14
- minecraft:grass_block -> minecraft:moss_block : 12
- minecraft:air -> minecraft:oak_leaves : 11
- exemples : 2865 65 -869 minecraft:grass_block->minecraft:dirt; 2864 66 -880 minecraft:grass_block->minecraft:stone; 2866 66 -880 minecraft:grass_block->minecraft:stone; 2864 66 -877 minecraft:grass_block->minecraft:dirt; 2866 66 -877 minecraft:grass_block->minecraft:dirt; 2864 66 -876 minecraft:grass_block->minecraft:dirt; 2866 66 -876 minecraft:grass_block->minecraft:dirt; 2864 66 -875 minecraft:grass_block->minecraft:dirt

## naturel de surface, interieur

- minecraft:grass_block -> minecraft:dirt : 31
- minecraft:dirt -> minecraft:grass_block : 24
- minecraft:jungle_leaves -> minecraft:oak_leaves : 14
- minecraft:spruce_leaves -> minecraft:oak_leaves : 12
- minecraft:oak_leaves -> minecraft:jungle_leaves : 9
- minecraft:tall_grass -> minecraft:short_grass : 8
- minecraft:tall_grass -> minecraft:air : 8
- minecraft:oak_leaves -> minecraft:spruce_leaves : 8
- minecraft:jungle_leaves -> minecraft:spruce_leaves : 4
- minecraft:spruce_leaves -> minecraft:jungle_leaves : 4
- minecraft:short_grass -> minecraft:tall_grass : 3
- minecraft:air -> minecraft:tall_grass : 3
- minecraft:air -> minecraft:oak_leaves : 3
- minecraft:short_grass -> minecraft:air : 2
- minecraft:oak_leaves -> minecraft:air : 2
- exemples : 2867 66 -877 minecraft:grass_block->minecraft:dirt; 2867 66 -876 minecraft:grass_block->minecraft:dirt; 2867 66 -875 minecraft:grass_block->minecraft:dirt; 2869 66 -869 minecraft:grass_block->minecraft:dirt; 2867 68 -877 minecraft:jungle_leaves->minecraft:air; 2867 66 -845 minecraft:grass_block->minecraft:dirt; 2867 66 -841 minecraft:grass_block->minecraft:dirt; 2867 66 -820 minecraft:grass_block->minecraft:dirt

## villes / bati / mods

- minecraft:mossy_stone_bricks -> minecraft:grass_block : 10
- minecraft:mossy_cobblestone -> minecraft:grass_block : 7
- minecraft:grass_block -> minecraft:mossy_cobblestone : 6
- minecraft:grass_block -> minecraft:mossy_stone_bricks : 3
- minecraft:mossy_cobblestone -> minecraft:stone : 1
- minecraft:mossy_cobblestone -> minecraft:oak_leaves : 1
- exemples : 2864 67 -880 minecraft:mossy_cobblestone->minecraft:stone; 2864 67 -877 minecraft:mossy_stone_bricks->minecraft:grass_block; 2867 67 -877 minecraft:mossy_cobblestone->minecraft:grass_block; 2866 67 -867 minecraft:mossy_stone_bricks->minecraft:grass_block; 2995 67 -992 minecraft:mossy_stone_bricks->minecraft:grass_block; 2994 67 -991 minecraft:mossy_stone_bricks->minecraft:grass_block; 2993 67 -989 minecraft:mossy_stone_bricks->minecraft:grass_block; 3001 67 -989 minecraft:mossy_stone_bricks->minecraft:grass_block

## etat de bloc seulement (connexions vitres, orientations)

- minecraft:cobblestone_wall -> minecraft:cobblestone_wall : 6
- handcrafted:dark_oak_couch -> handcrafted:dark_oak_couch : 3
- mcwfences:iron_cheval_de_frise -> mcwfences:iron_cheval_de_frise : 1
- minecraft:iron_bars -> minecraft:iron_bars : 1
- minecraft:glass_pane -> minecraft:glass_pane : 1
- handcrafted:birch_table -> handcrafted:birch_table : 1
- jurassicreborn:microraptor_fossil -> jurassicreborn:microraptor_fossil : 1
- minecraft:polished_blackstone_wall -> minecraft:polished_blackstone_wall : 1
- exemples : 2864 68 -817 mcwfences:iron_cheval_de_frise->mcwfences:iron_cheval_de_frise; 2901 75 -844 minecraft:iron_bars->minecraft:iron_bars; 2917 87 -828 handcrafted:dark_oak_couch->handcrafted:dark_oak_couch; 2918 87 -828 handcrafted:dark_oak_couch->handcrafted:dark_oak_couch; 2919 87 -828 handcrafted:dark_oak_couch->handcrafted:dark_oak_couch; 2931 107 -822 minecraft:glass_pane->minecraft:glass_pane; 2982 75 -1007 handcrafted:birch_table->handcrafted:birch_table; 3007 68 -977 minecraft:cobblestone_wall->minecraft:cobblestone_wall

## contenants (coffres aleatoires atheria_coffres / lootr)

- minecraft:air -> minecraft:chest : 29
- minecraft:chest -> minecraft:air : 22
- minecraft:air -> minecraft:barrel : 19
- minecraft:barrel -> minecraft:air : 18
- minecraft:air -> lootr:lootr_chest : 15
- lootr:lootr_chest -> minecraft:air : 12
- lootr:lootr_barrel -> minecraft:air : 7
- minecraft:air -> lootr:lootr_barrel : 5
- lootr:lootr_chest -> lootr:lootr_barrel : 1
- minecraft:chest -> minecraft:barrel : 1
- exemples : 2890 59 -836 minecraft:air->minecraft:barrel; 2885 69 -842 minecraft:air->minecraft:chest; 2886 69 -840 minecraft:barrel->minecraft:air; 2892 69 -840 minecraft:air->minecraft:chest; 2892 75 -844 minecraft:chest->minecraft:air; 2885 75 -842 minecraft:barrel->minecraft:air; 2890 75 -840 minecraft:barrel->minecraft:air; 2891 75 -840 minecraft:air->minecraft:barrel

## variantes de palette Lost Cities (connues)

- minecraft:moss_block -> minecraft:mossy_cobblestone : 77
- minecraft:mossy_cobblestone -> minecraft:moss_block : 75
- minecraft:moss_block -> minecraft:mossy_stone_bricks : 35
- minecraft:mossy_stone_bricks -> minecraft:moss_block : 33
- minecraft:mossy_cobblestone -> minecraft:mossy_stone_bricks : 24
- minecraft:mossy_stone_bricks -> minecraft:mossy_cobblestone : 21
- minecraft:iron_block -> minecraft:light_gray_concrete : 5
- minecraft:light_gray_concrete -> minecraft:iron_block : 4
- exemples : 2979 64 -1008 minecraft:light_gray_concrete->minecraft:iron_block; 2987 64 -1008 minecraft:light_gray_concrete->minecraft:iron_block; 2979 64 -993 minecraft:iron_block->minecraft:light_gray_concrete; 2979 65 -1008 minecraft:iron_block->minecraft:light_gray_concrete; 2991 65 -995 minecraft:light_gray_concrete->minecraft:iron_block; 2987 65 -993 minecraft:iron_block->minecraft:light_gray_concrete; 2985 66 -1008 minecraft:light_gray_concrete->minecraft:iron_block; 2991 66 -994 minecraft:iron_block->minecraft:light_gray_concrete
