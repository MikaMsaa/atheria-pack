# Genere les 5 biomes d'Atheria dans pack\kubejs (donnees, sols, table de climat, textures).
# A relancer apres toute modification : le fichier de climat repart toujours de overworld.base.json.
param([string]$Root = (Resolve-Path "$PSScriptRoot\..\..").Path)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$k = "$Root\pack\kubejs"
$dat = "$k\data\atheria\worldgen"
$utf8 = New-Object Text.UTF8Encoding($false)

function Ecrire($chemin, $objet) {
    $dossier = Split-Path $chemin
    if (-not (Test-Path $dossier)) { New-Item -ItemType Directory $dossier -Force | Out-Null }
    $texte = if ($objet -is [string]) { $objet } else { $objet | ConvertTo-Json -Depth 40 -Compress }
    [IO.File]::WriteAllText($chemin, $texte, $utf8)
}
function Simple($bloc) { @{ type = 'minecraft:simple_state_provider'; state = (Etat $bloc) } }
function Etat($bloc) {
    if ($bloc -match '^(.+)\[(.+)\]$') {
        $p = @{}
        foreach ($kv in $Matches[2].Split(',')) { $a = $kv.Split('='); $p[$a[0]] = $a[1] }
        return @{ Name = $Matches[1]; Properties = $p }
    }
    @{ Name = $bloc }
}
function Pondere($liste) {
    # liste : bloc, poids, bloc, poids...
    $e = @()
    for ($i = 0; $i -lt $liste.Count; $i += 2) { $e += @{ data = (Etat $liste[$i]); weight = [int]$liste[$i + 1] } }
    @{ type = 'minecraft:weighted_state_provider'; entries = $e }
}
function Arbre($tronc, $sol, $placeur) {
    @{
        type   = 'minecraft:tree'
        config = @{
            ignore_vines     = $true
            force_dirt       = $false
            minimum_size     = @{ type = 'minecraft:two_layers_feature_size'; limit = 1; lower_size = 0; upper_size = 1 }
            dirt_provider    = (Simple $sol)
            trunk_provider   = (Simple $tronc)
            trunk_placer     = $placeur
            foliage_provider = (Simple 'minecraft:air')
            foliage_placer   = @{ type = 'minecraft:blob_foliage_placer'; radius = 0; offset = 0; height = 1 }
            decorators       = @()
        }
    }
}
function Tapis($fournisseur, $essais, $etalement) {
    @{
        type   = 'minecraft:random_patch'
        config = @{
            tries     = $essais
            xz_spread = $etalement
            y_spread  = 2
            feature   = @{
                feature   = @{ type = 'minecraft:simple_block'; config = @{ to_place = $fournisseur } }
                placement = @(@{
                        type      = 'minecraft:block_predicate_filter'
                        predicate = @{
                            type       = 'minecraft:all_of'
                            predicates = @(
                                @{ type = 'minecraft:matching_blocks'; blocks = 'minecraft:air' },
                                @{ type = 'minecraft:solid'; offset = @(0, -1, 0) }
                            )
                        }
                    })
            }
        }
    }
}
function Disque($bloc, $cibles, $min, $max) {
    @{
        type   = 'minecraft:disk'
        config = @{
            state_provider = @{ fallback = (Simple $bloc); rules = @() }
            target         = @{ type = 'minecraft:matching_blocks'; blocks = $cibles }
            radius         = @{ type = 'minecraft:uniform'; min_inclusive = $min; max_inclusive = $max }
            half_height    = 2
        }
    }
}
function Place($nom, $feature, $frequence, $arbre = $false, $carte = 'MOTION_BLOCKING') {
    $p = @()
    if ($frequence -ge 1) { $p += @{ type = 'minecraft:count'; count = [int]$frequence } }
    else { $p += @{ type = 'minecraft:rarity_filter'; chance = [int][Math]::Round(1 / $frequence) } }
    $p += @{ type = 'minecraft:in_square' }
    if ($arbre) { $p += @{ type = 'minecraft:surface_water_depth_filter'; max_water_depth = 0 } }
    $p += @{ type = 'minecraft:heightmap'; heightmap = $carte }
    $p += @{ type = 'minecraft:biome' }
    Ecrire "$dat\placed_feature\$nom.json" @{ feature = $feature; placement = $p }
}

# --- Formes configurees ---
$cf = "$dat\configured_feature"
Ecrire "$cf\arbre_calcine.json" (Arbre 'atheria:tronc_calcine' 'atheria:terre_calcinee' @{ type = 'minecraft:forking_trunk_placer'; base_height = 5; height_rand_a = 3; height_rand_b = 2 })
Ecrire "$cf\souche_calcinee.json" (Arbre 'atheria:tronc_calcine' 'atheria:terre_calcinee' @{ type = 'minecraft:straight_trunk_placer'; base_height = 1; height_rand_a = 2; height_rand_b = 0 })
Ecrire "$cf\arbre_mort.json" (Arbre 'biomesoplenty:dead_log' 'minecraft:mud' @{ type = 'minecraft:forking_trunk_placer'; base_height = 4; height_rand_a = 3; height_rand_b = 1 })
Ecrire "$cf\arbre_pourri.json" (Arbre 'spore:rotten_log' 'minecraft:dirt' @{ type = 'minecraft:forking_trunk_placer'; base_height = 4; height_rand_a = 4; height_rand_b = 1 })
Ecrire "$cf\cendres_au_sol.json" (Tapis (Simple 'supplementaries:ash[layers=1]') 24 6)
Ecrire "$cf\vegetation_spore.json" (Tapis (Pondere @('spore:growths_big', 4, 'spore:growths_small', 6, 'spore:blomfung', 4, 'spore:bloomfung2', 4, 'spore:remains', 1)) 32 6)
Ecrire "$cf\plantes_pourries.json" (Tapis (Pondere @('spore:rotten_bush', 3, 'spore:rotten_fern', 3)) 20 6)
Ecrire "$cf\plaque_mycelium.json" (Disque 'spore:mycelium_block' @('minecraft:mycelium', 'minecraft:dirt') 3 6)
Ecrire "$cf\vase.json" (Disque 'minecraft:mud' @('minecraft:dirt', 'minecraft:sand', 'minecraft:gravel', 'minecraft:clay') 2 5)
Ecrire "$cf\poteaux_cloture.json" (Tapis (Simple 'minecraft:oak_fence') 6 5)

# --- Placements (noms propres a Atheria : aucun risque de conflit d'ordre avec les autres biomes) ---
Place 'foret_arbres' 'atheria:arbre_calcine' 4 $true
Place 'foret_souches' 'atheria:souche_calcinee' 2 $true
Place 'foret_cendres' 'atheria:cendres_au_sol' 2
Place 'foret_buissons' 'minecraft:patch_dead_bush' 2
Place 'zone_plaques' 'atheria:plaque_mycelium' 0.34 $false 'OCEAN_FLOOR_WG'
Place 'zone_arbres' 'atheria:arbre_pourri' 2 $true
Place 'zone_vegetation' 'atheria:vegetation_spore' 3
Place 'zone_plantes' 'atheria:plantes_pourries' 2
Place 'agri_herbes_hautes' 'minecraft:patch_tall_grass' 5
Place 'agri_herbes' 'minecraft:patch_grass' 12
Place 'agri_clotures' 'atheria:poteaux_cloture' 0.2
Place 'agri_foin' 'minecraft:pile_hay' 0.04
Place 'agri_citrouilles' 'minecraft:patch_pumpkin' 0.05
Place 'agri_arbres' 'minecraft:oak' 0.07 $true
Place 'marais_vase' 'atheria:vase' 2 $false 'OCEAN_FLOOR_WG'
Place 'marais_arbres' 'atheria:arbre_mort' 2 $true
Place 'marais_nenuphars' 'minecraft:patch_waterlily' 3 $false 'WORLD_SURFACE_WG'
Place 'marais_buissons' 'minecraft:patch_dead_bush' 2
Place 'marais_herbes' 'minecraft:patch_grass' 3
Place 'plaine_cendres' 'atheria:cendres_au_sol' 3
Place 'plaine_souches' 'atheria:souche_calcinee' 0.2 $true
Place 'plaine_buissons' 'minecraft:patch_dead_bush' 0.5

# Le prix du risque : la zone contaminee cache plus de minerais
function Minerai($nom, $forme, $nombre, $bas, $haut) {
    Ecrire "$dat\placed_feature\$nom.json" @{ feature = $forme; placement = @(
            @{ type = 'minecraft:count'; count = $nombre },
            @{ type = 'minecraft:in_square' },
            @{ type = 'minecraft:height_range'; height = @{ type = 'minecraft:uniform'; min_inclusive = @{ absolute = [int]$bas }; max_inclusive = @{ absolute = [int]$haut } } },
            @{ type = 'minecraft:biome' }
        ) }
}
Minerai 'zone_fer' 'minecraft:ore_iron' 12 -24 72
Minerai 'zone_or' 'minecraft:ore_gold' 5 -48 40
Minerai 'zone_redstone' 'minecraft:ore_redstone' 5 -48 16
Minerai 'zone_diamant' 'minecraft:ore_diamond_small' 3 -60 8

# --- Biomes : on part de la liste de BoP wasteland (minerais et lacs vanilla), sans ses decors ---
$base = Get-Content "$PSScriptRoot\wasteland.base.json" -Raw -Encoding UTF8 | ConvertFrom-Json
function Etapes($vegetal, $surface = @(), $minerais = @()) {
    $sortie = @()
    for ($i = 0; $i -lt 11; $i++) {
        $liste = @($base.features[$i] | Where-Object { $_ -and $_ -notmatch '^biomesoplenty:' })
        if ($i -eq 9) { $liste += @($vegetal | ForEach-Object { "atheria:$_" }) }
        if ($i -eq 6) { $liste += @($minerais | ForEach-Object { "atheria:$_" }) }
        if ($i -eq 10) { $liste += @($surface | ForEach-Object { "atheria:$_" }) }
        $sortie += , @($liste)
    }
    , $sortie
}
function Biome($nom, $temp, $pluie, $brouillard, $ciel, $herbe, $feuilles, $eau, $eauFond, $particule, $proba, $vegetal, $surface, $animaux, $minerais = @()) {
    $o = [ordered]@{
        has_precipitation = ($pluie -gt 0)
        temperature       = $temp
        downfall          = $pluie
        effects           = @{
            fog_color       = $brouillard
            sky_color       = $ciel
            grass_color     = $herbe
            foliage_color   = $feuilles
            water_color     = $eau
            water_fog_color = $eauFond
            particle        = @{ options = @{ type = $particule }; probability = $proba }
            mood_sound      = @{ block_search_extent = 8; offset = 2.0; sound = 'minecraft:ambient.cave'; tick_delay = 6000 }
        }
        carvers           = @{ air = @('minecraft:cave', 'minecraft:cave_extra_underground', 'minecraft:canyon') }
        features          = (Etapes $vegetal $surface $minerais)
        spawners          = @{
            monster                    = @($base.spawners.monster)
            creature                   = $animaux
            ambient                    = @($base.spawners.ambient)
            axolotls                   = @()
            underground_water_creature = @($base.spawners.underground_water_creature)
            water_creature             = @()
            water_ambient              = @()
            misc                       = @()
        }
        spawn_costs       = @{}
    }
    Ecrire "$dat\biome\$nom.json" $o
}
$bestiaux = @(
    @{ type = 'minecraft:sheep'; weight = 8; minCount = 2; maxCount = 4 },
    @{ type = 'minecraft:cow'; weight = 8; minCount = 2; maxCount = 4 },
    @{ type = 'minecraft:pig'; weight = 6; minCount = 2; maxCount = 4 },
    @{ type = 'minecraft:chicken'; weight = 6; minCount = 2; maxCount = 4 }
)
$lapins = @(@{ type = 'minecraft:rabbit'; weight = 4; minCount = 1; maxCount = 3 })
Biome 'foret_calcinee' 0.9 0.0 0x5E5A55 0x6E6A65 0x3D3A34 0x302D28 0x3A3D38 0x101210 'minecraft:white_ash' 0.01 @('foret_arbres', 'foret_souches', 'foret_cendres', 'foret_buissons') @() @()
Biome 'zone_contaminee' 0.6 0.7 0x6B7650 0x7A855E 0x5A6A38 0x4A5A30 0x4A5A30 0x1B2410 'minecraft:mycelium' 0.03 @('zone_arbres', 'zone_vegetation', 'zone_plantes') @() @() @('zone_fer', 'zone_or', 'zone_redstone', 'zone_diamant')
Biome 'terres_agricoles' 0.8 0.5 0xB9BFA8 0x9CAFC0 0x8E9B4A 0x7A8A3C 0x3F76E4 0x050533 'minecraft:ash' 0.0005 @('agri_herbes_hautes', 'agri_herbes', 'agri_clotures', 'agri_foin', 'agri_citrouilles', 'agri_arbres') @() $bestiaux
Biome 'marecage_pollue' 0.8 0.9 0x50553C 0x5F6650 0x4E5730 0x3F4728 0x2F3A1C 0x0E1408 'minecraft:mycelium' 0.004 @('marais_vase', 'marais_arbres', 'marais_nenuphars', 'marais_buissons', 'marais_herbes') @() @()
Biome 'plaine_cendres' 0.9 0.0 0x8A8783 0x96938F 0x6A6864 0x5A5854 0x4A4D4A 0x151715 'minecraft:white_ash' 0.02 @('plaine_cendres', 'plaine_souches', 'plaine_buissons') @() $lapins

# --- Sols ---
function Cond($si, $alors) { @{ type = 'minecraft:condition'; if_true = $si; then_run = $alors } }
function Bloc($b) { @{ type = 'minecraft:block'; result_state = (Etat $b) } }
function Suite($l) { @{ type = 'minecraft:sequence'; sequence = @($l) } }
function Tache($seuil) { @{ type = 'minecraft:noise_threshold'; noise = 'minecraft:surface'; min_threshold = $seuil; max_threshold = 99 } }
$dessus = @{ type = 'minecraft:stone_depth'; offset = 0; add_surface_depth = $false; secondary_depth_range = 0; surface_type = 'floor' }
$dessous = @{ type = 'minecraft:stone_depth'; offset = 0; add_surface_depth = $true; secondary_depth_range = 0; surface_type = 'floor' }
$horsEau = @{ type = 'minecraft:water'; offset = -1; surface_depth_multiplier = 0; add_stone_depth = $false }
function Sol($biome, $haut, $hautTache, $seuil, $bas, $sousEau, $extra = @()) {
    $h = @()
    if ($hautTache) { $h += (Cond (Tache $seuil) (Bloc $hautTache)) }
    $h += (Bloc $haut)
    Cond @{ type = 'minecraft:biome'; biome_is = @("atheria:$biome") } (Cond @{ type = 'minecraft:above_preliminary_surface' } (Suite (@($extra) + @(
                    (Cond $dessus (Suite @((Cond $horsEau (Suite $h)), (Bloc $sousEau)))),
                    (Cond $dessous (Bloc $bas))
                ))))
}
# Mares du marecage : meme bruit que le marais vanilla, au ras du niveau de la mer
$mares = Cond $dessus (Cond @{ type = 'minecraft:y_above'; anchor = @{ absolute = 62 }; surface_depth_multiplier = 0; add_stone_depth = $false } (Cond @{ type = 'minecraft:not'; invert = @{ type = 'minecraft:y_above'; anchor = @{ absolute = 63 }; surface_depth_multiplier = 0; add_stone_depth = $false } } (Cond @{ type = 'minecraft:noise_threshold'; noise = 'minecraft:surface_swamp'; min_threshold = 0.0; max_threshold = 99 } (Bloc 'minecraft:water[level=0]'))))
$regle = Suite @(
    (Sol 'foret_calcinee' 'atheria:terre_calcinee' 'atheria:sol_cendre' 0.55 'atheria:terre_calcinee' 'minecraft:gravel'),
    (Sol 'zone_contaminee' 'minecraft:mycelium' 'spore:mycelium_block' 0.7 'minecraft:dirt' 'minecraft:mud'),
    (Sol 'terres_agricoles' 'minecraft:grass_block' 'minecraft:coarse_dirt' 0.5 'minecraft:dirt' 'minecraft:dirt'),
    (Sol 'marecage_pollue' 'minecraft:mud' 'minecraft:coarse_dirt' 0.4 'minecraft:mud' 'minecraft:mud' @($mares)),
    (Sol 'plaine_cendres' 'atheria:sol_cendre' 'minecraft:tuff' 0.6 'minecraft:tuff' 'minecraft:gravel')
)
Ecrire "$k\data\atheria\lithostitched\worldgen_modifier\sols_biomes.json" @{ type = 'lithostitched:add_surface_rule'; levels = @('minecraft:overworld'); surface_rule = $regle }

# --- Tags ---
function Tag($chemin, $liste) { Ecrire "$k\data\$chemin.json" @{ replace = $false; values = @($liste | ForEach-Object { "atheria:$_" }) } }
$tous = 'foret_calcinee', 'zone_contaminee', 'terres_agricoles', 'marecage_pollue', 'plaine_cendres'
Tag 'c\tags\worldgen\biome\is_overworld' $tous
Tag 'minecraft\tags\worldgen\biome\is_forest' @('foret_calcinee', 'zone_contaminee')
Tag 'c\tags\worldgen\biome\is_forest' @('foret_calcinee', 'zone_contaminee')
Tag 'c\tags\worldgen\biome\is_plains' @('terres_agricoles', 'plaine_cendres')
Tag 'c\tags\worldgen\biome\is_swamp' @('marecage_pollue')
Tag 'c\tags\worldgen\biome\is_wasteland' @('foret_calcinee', 'plaine_cendres', 'zone_contaminee')
Tag 'c\tags\worldgen\biome\is_dead' @('foret_calcinee', 'plaine_cendres')
Tag 'minecraft\tags\worldgen\biome\has_structure\mineshaft' $tous
Tag 'minecraft\tags\worldgen\biome\has_structure\ruined_portal_standard' $tous
Tag 'fields\tags\worldgen\biome\field_biomes' @('terres_agricoles')

# --- Table de climat : chaque entree garde ses parametres, seul le biome change ---
$cheminClimat = "$k\data\minecraft\worldgen\multi_noise_biome_source_parameter_list\overworld.json"
$sauvegarde = "$PSScriptRoot\overworld.base.json"
if (-not (Test-Path $sauvegarde)) { Copy-Item $cheminClimat $sauvegarde }
$texte = [IO.File]::ReadAllText($sauvegarde)
$remplacements = @{
    'minecraft:forest'           = 'atheria:foret_calcinee'
    'terralith:steppe'           = 'atheria:plaine_cendres'
    'terralith:ashen_savanna'    = 'atheria:plaine_cendres'
    'minecraft:plains'           = 'atheria:terres_agricoles'
    'minecraft:sunflower_plains' = 'atheria:terres_agricoles'
    'terralith:shrubland'        = 'atheria:terres_agricoles'
    'terralith:orchid_swamp'     = 'atheria:marecage_pollue'
    'minecraft:swamp'            = 'atheria:marecage_pollue'
    'minecraft:mangrove_swamp'   = 'atheria:marecage_pollue'
    'minecraft:dark_forest'      = 'atheria:zone_contaminee'
    'terralith:lavender_forest'  = 'atheria:zone_contaminee'
    'terralith:lavender_valley'  = 'atheria:zone_contaminee'
}
$compte = @{}
foreach ($c in $remplacements.Keys) {
    $motif = '"biome"\s*:\s*"' + [regex]::Escape($c) + '"'
    $compte[$c] = ([regex]::Matches($texte, $motif)).Count
    $texte = [regex]::Replace($texte, $motif, '"biome":"' + $remplacements[$c] + '"')
}
# Le marais n'occupe presque rien dans la table : les basses terres tres erodees des biomes tempérés deviennent marecage
$table = $texte | ConvertFrom-Json
$sources = 'atheria:foret_calcinee', 'atheria:terres_agricoles', 'atheria:zone_contaminee', 'terralith:brushland'
$versMarais = 0
foreach ($e in $table.'lithostitched:biomes') {
    $bas = @($e.parameters.erosion)[0]
    $hum = @($e.parameters.humidity)[0]; if (($sources -contains $e.biome) -and ($bas -ge 0.45 -or ($bas -ge 0.05 -and $hum -ge -0.1))) { $e.biome = 'atheria:marecage_pollue'; $versMarais++ }
}
"entrees basculees en marecage : $versMarais"
$texte = $table | ConvertTo-Json -Depth 10 -Compress
[IO.File]::WriteAllText($cheminClimat, $texte, $utf8)
$compte.GetEnumerator() | ForEach-Object { "$($_.Key) : $($_.Value) entrees" }

# --- Textures ---
function Texture($nom, $couleurs, $graine, $veines = $false) {
    $b = New-Object Drawing.Bitmap 16, 16
    $r = New-Object Random $graine
    for ($y = 0; $y -lt 16; $y++) {
        for ($x = 0; $x -lt 16; $x++) {
            $c = $couleurs[$r.Next($couleurs.Count)]
            if ($veines -and (($x + ($y -shr 2)) % 5) -eq 0) { $c = $couleurs[0] }
            $b.SetPixel($x, $y, [Drawing.ColorTranslator]::FromHtml($c))
        }
    }
    $d = "$k\assets\atheria\textures\block"
    if (-not (Test-Path $d)) { New-Item -ItemType Directory $d -Force | Out-Null }
    $b.Save("$d\$nom.png", [Drawing.Imaging.ImageFormat]::Png)
    $b.Dispose()
}
Texture 'tronc_calcine' @('#141210', '#1E1B18', '#26221E', '#1A1715', '#3A2A20') 11 $true
Texture 'terre_calcinee' @('#2B2724', '#332E2A', '#241F1C', '#3B3631', '#2E2A26') 12
Texture 'sol_cendre' @('#77746F', '#807D78', '#6C6964', '#8A8782', '#75726D') 13
Texture 'carrosserie' @('#6B4A33', '#7A5238', '#5C3F2C', '#83603F', '#54392A', '#4F5A60') 14
Texture 'reservoir_epave' @('#2E2A26', '#3B342D', '#6B4A33', '#4A3E30', '#262320') 15 $true
"biomes generes"
