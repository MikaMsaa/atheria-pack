# Reecrit les structures de Cinch et d'Abandoned Watchtowers pour le monde Atheria :
# biomes adaptes aux biomes remplaces, hauteur fiable, tour neuve retiree (rien de neuf apres l'effondrement).
param([string]$Root = (Resolve-Path "$PSScriptRoot\..\..").Path)
$ErrorActionPreference = 'Stop'
$d = "$Root\pack\kubejs\data"
$u = New-Object Text.UTF8Encoding $false
function E($chemin, $texte) { New-Item -ItemType Directory (Split-Path $chemin) -Force | Out-Null; [IO.File]::WriteAllText($chemin, $texte, $u) }
foreach ($n in 'abandoned_house', 'abandoned_birch_forest_house', 'abandoned_taiga_house') {
    $liquide = if ($n -ne 'abandoned_taiga_house') { '"liquid_settings":"ignore_waterlogging",' } else { '' }
    E "$d\cinchsabandonedhouses\worldgen\structure\$n.json" ('{"type":"minecraft:jigsaw","start_pool":"cinchsabandonedhouses:' + $n + '/start_pool","size":3,"max_distance_from_center":80,"biomes":"#cinchsabandonedhouses:has_structure/' + $n + '",' + $liquide + '"step":"surface_structures","terrain_adaptation":"beard_thin","start_height":{"absolute":0},"project_start_to_heightmap":"WORLD_SURFACE_WG","use_expansion_hack":false,"spawn_overrides":{}}')
}
E "$d\cinchsabandonedhouses\tags\worldgen\biome\has_structure\abandoned_house.json" '{"replace":false,"values":["atheria:terres_agricoles","atheria:foret_calcinee","atheria:plaine_cendres"]}'
$tour = '"size":7,"max_distance_from_center":64,"spawn_overrides":{},"step":"surface_structures","terrain_adaptation":"beard_box","start_height":{"absolute":0},"project_start_to_heightmap":"WORLD_SURFACE_WG","use_expansion_hack":false}'
E "$d\watchtower_building\worldgen\structure\abandoned_watchtower.json" ('{"type":"minecraft:jigsaw","start_pool":"watchtower_building:abandoned_watchtower","biomes":["minecraft:birch_forest","minecraft:flower_forest","minecraft:taiga","atheria:terres_agricoles","atheria:foret_calcinee","atheria:plaine_cendres","biomesoplenty:woodland","biomesoplenty:prairie","biomesoplenty:grassland"],' + $tour)
E "$d\watchtower_building\worldgen\structure\fresh_watchtower.json" ('{"type":"minecraft:jigsaw","start_pool":"watchtower_building:fresh_watchtower","biomes":[],' + $tour)
"structures des mods ecrites"