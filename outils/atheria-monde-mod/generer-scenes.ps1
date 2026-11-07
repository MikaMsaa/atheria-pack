# Atheria Zombie Edition - structures des tutoriels animes (decor de chaque scene)
# Resultat : ressources\assets\atheria_monde\ponder\*.nbt, a relancer si un decor change.

$ErrorActionPreference = 'Stop'
$Ici = Split-Path -Parent $MyInvocation.MyCommand.Path
$Dest = Join-Path $Ici 'ressources\assets\atheria_monde\ponder'
New-Item -ItemType Directory -Force $Dest | Out-Null

function Ecrire-Structure([string]$Nom, $Blocs) {
    $ms = New-Object IO.MemoryStream
    $gz = New-Object IO.Compression.GZipStream($ms, [IO.Compression.CompressionMode]::Compress)
    $fOct = { param([byte[]]$x) $gz.Write($x, 0, $x.Length) }
    $fEnt = { param([int]$v) $o = [BitConverter]::GetBytes($v); [Array]::Reverse($o); & $fOct $o }
    $fTxt = { param([string]$v) $o = [Text.Encoding]::UTF8.GetBytes($v); $l = [BitConverter]::GetBytes([int16]$o.Length); [Array]::Reverse($l); & $fOct $l; & $fOct $o }
    $fTag = { param([byte]$t, [string]$n) & $fOct ([byte[]]@($t)); & $fTxt $n }
    $fListe = { param([string]$n, [int[]]$v) & $fTag 9 $n; & $fOct ([byte[]]@(3)); & $fEnt $v.Length; foreach ($x in $v) { & $fEnt $x } }

    # Le plateau de pierre, toujours en couche 0, et les blocs de la scene au-dessus
    $tous = New-Object Collections.ArrayList
    $hasard = New-Object Random 7
    for ($x = 0; $x -lt 9; $x++) { for ($z = 0; $z -lt 9; $z++) {
        $c = $hasard.Next(10)
        $bloc = if ($c -lt 6) { 'stone_bricks' } elseif ($c -lt 8) { 'cracked_stone_bricks' } else { 'mossy_stone_bricks' }
        [void]$tous.Add(@($x, 0, $z, "minecraft:$bloc"))
    } }
    foreach ($b in $Blocs) { [void]$tous.Add($b) }
    $palette = @($tous | ForEach-Object { $_[3] } | Sort-Object -Unique)

    & $fTag 10 ''
    & $fTag 3 'DataVersion'; & $fEnt 3955
    & $fListe 'size' @(9, 9, 9)
    & $fTag 9 'palette'; & $fOct ([byte[]]@(10)); & $fEnt $palette.Count
    foreach ($p in $palette) { & $fTag 8 'Name'; & $fTxt $p; & $fOct ([byte[]]@(0)) }
    & $fTag 9 'blocks'; & $fOct ([byte[]]@(10)); & $fEnt $tous.Count
    foreach ($b in $tous) {
        & $fListe 'pos' @($b[0], $b[1], $b[2])
        & $fTag 3 'state'; & $fEnt ([Array]::IndexOf($palette, $b[3]))
        & $fOct ([byte[]]@(0))
    }
    & $fTag 9 'entities'; & $fOct ([byte[]]@(10)); & $fEnt 0
    & $fOct ([byte[]]@(0))
    $gz.Close()
    [IO.File]::WriteAllBytes((Join-Path $Dest "$Nom.nbt"), $ms.ToArray())
}

function Zone($x1, $y1, $z1, $x2, $y2, $z2, $bloc) {
    $res = New-Object Collections.ArrayList
    for ($x = $x1; $x -le $x2; $x++) { for ($y = $y1; $y -le $y2; $y++) { for ($z = $z1; $z -le $z2; $z++) {
        [void]$res.Add(@($x, $y, $z, "minecraft:$bloc"))
    } } }
    , $res
}

$voiture = (Zone 3 2 1 5 2 6 'gray_concrete') + (Zone 3 3 3 5 3 4 'gray_stained_glass') + (Zone 3 1 2 3 1 2 'black_concrete') + (Zone 5 1 2 5 1 2 'black_concrete') + (Zone 3 1 5 3 1 5 'black_concrete') + (Zone 5 1 5 5 1 5 'black_concrete')

Ecrire-Structure 'plateau' @()
Ecrire-Structure 'course' ((Zone 3 2 6 5 2 6 'cobblestone') + (Zone 3 1 6 3 1 6 'cobblestone') + (Zone 5 1 6 5 1 6 'cobblestone'))
Ecrire-Structure 'obstacle' (Zone 2 1 4 6 1 4 'stone_bricks')
Ecrire-Structure 'grimper' (Zone 2 1 6 6 3 8 'stone_bricks')
Ecrire-Structure 'chute' (Zone 3 1 0 5 4 2 'stone_bricks')
Ecrire-Structure 'atelier' ((Zone 1 1 4 1 1 4 'smithing_table') + (Zone 3 1 4 3 1 4 'smithing_table') + (Zone 5 1 4 5 1 4 'smithing_table') + (Zone 7 1 4 7 1 4 'smithing_table') + (Zone 4 1 7 4 1 7 'smithing_table'))
Ecrire-Structure 'voiture' $voiture
Ecrire-Structure 'montage' ($voiture + (Zone 4 3 6 4 3 6 'iron_block'))
Ecrire-Structure 'pompe' ($voiture + (Zone 1 1 3 1 1 3 'cauldron') + (Zone 1 2 3 1 2 3 'iron_bars'))
Ecrire-Structure 'avion' ((Zone 4 2 1 4 2 4 'white_concrete') + (Zone 2 2 3 6 2 3 'white_concrete') + (Zone 4 3 3 4 3 3 'light_blue_stained_glass') + (Zone 4 3 1 4 3 1 'white_concrete') + (Zone 4 1 3 4 1 3 'black_concrete') + (Zone 4 2 5 4 2 5 'iron_block'))
Ecrire-Structure 'helico' ((Zone 4 2 2 4 2 5 'gray_concrete') + (Zone 2 3 4 6 3 4 'black_concrete') + (Zone 4 1 3 4 1 3 'iron_bars') + (Zone 4 1 5 4 1 5 'iron_bars'))
Ecrire-Structure 'gaz' (Zone 0 1 6 8 4 8 'deepslate')
"Structures ecrites : $((Get-ChildItem $Dest -Filter *.nbt).Count)"
