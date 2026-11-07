# Phase de developpement : les devs recoivent les reglages de Mika a chaque mise a jour (touches, video, shaders, carte).
# A lancer avant chaque publication. Copie les reglages de l'instance vers le pack et enleve la protection "preserve" de ces fichiers.
# Pack finalise : relancer avec -Final, chaque joueur garde alors ses touches et ses parametres. Les fichiers de base restent ceux du dernier alignement.
param([switch]$Final)
$r = Split-Path $PSScriptRoot
$p = Join-Path $r 'pack'
$g = Join-Path $r 'instances\Atheria\minecraft'
$sansBom = New-Object Text.UTF8Encoding($false)
$fichiers = 'config/iris.properties', 'config/DistantHorizons.toml', 'config/sodium-options.json', 'config/xaero/minimap/client.cfg', 'config/xaero/minimap/profiles/default.cfg', 'config/xaero/world-map/client.cfg', 'config/xaero/world-map/profiles/default.cfg', 'essential/config.toml'
# Les marqueurs evitent que les anciennes tables de touches ecrasent ces reglages au premier lancement d'un dev
$marqueurs = 'atheria_reglages_v1.json', 'atheria_reglages_v2.json', 'atheria_reglages_v3.json', 'atheria_touches.json', 'atheria_touches_v2.json', 'atheria_touches_v3.json'

function Preserver($actif) {
    $index = Join-Path $p 'index.toml'
    $texte = [IO.File]::ReadAllText($index)
    foreach ($f in @('options.txt') + $fichiers) {
        $motif = '(?m)(^file = "' + [regex]::Escape($f) + '"\r?\n(?:(?!\[\[files\]\])[^\n]*\n)*?)(preserve = (?:true|false)\r?\n)'
        if ($actif) { $texte = [regex]::Replace($texte, $motif, '$1preserve = true' + "`n") }
        else { $texte = [regex]::Replace($texte, $motif, '$1') }
    }
    [IO.File]::WriteAllText($index, $texte, $sansBom)
}

if ($Final) {
    foreach ($m in $marqueurs) { Remove-Item (Join-Path $p "kubejs\config\$m") -ErrorAction SilentlyContinue }
} else {
    # Le micro et la sortie son sont propres a chaque PC, et config\hordes est un chemin absolu que le jeu recree lui-meme
    $lignes = [IO.File]::ReadAllLines((Join-Path $g 'options.txt')) | ForEach-Object {
        if ($_ -match '^soundDevice:') { 'soundDevice:""' }
        elseif ($_ -match '^(resourcePacks|incompatibleResourcePacks):') { $_ -replace ',?"C:\\\\[^"]*"', '' -replace '\[,', '[' }
        else { $_ }
    }
    [IO.File]::WriteAllLines((Join-Path $p 'options.txt'), [string[]]$lignes, $sansBom)
    foreach ($f in $fichiers) {
        $src = Join-Path $g $f
        if (Test-Path $src) { Copy-Item $src (Join-Path $p $f) -Force }
    }
    Copy-Item (Join-Path $g 'shaderpacks\ComplementaryUnbound_r5.9.3.zip.txt') (Join-Path $p 'shaderpacks\ComplementaryUnbound_r5.9.3.zip.txt') -Force
    New-Item -ItemType Directory -Force (Join-Path $p 'kubejs\config') | Out-Null
    foreach ($m in $marqueurs) { Copy-Item (Join-Path $g "kubejs\config\$m") (Join-Path $p "kubejs\config\$m") -Force }
}
Set-Location $p
& (Join-Path $r 'outils\packwiz.exe') refresh | Select-Object -Last 1
Preserver ([bool]$Final)
& (Join-Path $r 'outils\packwiz.exe') refresh | Select-Object -Last 1
if ($Final) { 'Pack en mode final : les joueurs gardent leurs reglages.' } else { 'Pack en mode developpement : reglages de Mika alignes.' }
