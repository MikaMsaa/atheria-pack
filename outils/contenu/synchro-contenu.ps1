# Copie le contenu genere depuis pack\kubejs vers l'instance et le serveur (seulement les dossiers de ce chantier).
param([string]$Root = (Resolve-Path "$PSScriptRoot\..\..").Path)
$ErrorActionPreference = 'Stop'
$src = "$Root\pack\kubejs"
foreach ($cible in "$Root\instances\Atheria\minecraft\kubejs", "$Root\serveur\kubejs") {
    foreach ($rel in 'data\atheria', 'data\c', 'data\fields', 'data\minecraft\tags\worldgen\biome', 'data\minecraft\worldgen\multi_noise_biome_source_parameter_list', 'data\lostcities', 'data\puffish_skills', 'data\cinchsabandonedhouses', 'data\watchtower_building', 'assets\atheria\textures\block', 'assets\atheria\lang', 'assets\atheria\models\block') {
        if (-not (Test-Path "$src\$rel")) { continue }
        New-Item -ItemType Directory "$cible\$rel" -Force | Out-Null
        Copy-Item "$src\$rel\*" "$cible\$rel" -Recurse -Force
    }
    foreach ($f in 'startup_scripts\atheria_contenu.js', 'server_scripts\atheria_contenu_routes.js', 'server_scripts\atheria_air.js', 'client_scripts\atheria_brume.js', 'client_scripts\atheria_contenu_bulles.js', 'client_scripts\atheria_touches_contenu.js', 'assets\atheria\guide\guide.json') {
        if (Test-Path "$src\$f") {
            New-Item -ItemType Directory (Split-Path "$cible\$f") -Force | Out-Null
            Copy-Item "$src\$f" "$cible\$f" -Force
        }
    }
}
"contenu synchronise"
