# Genere les batiments, les architectures de villes et les structures de bord de route (donnees Lost Cities).
# Les fichiers citystyle et worldstyle partent des copies .base.json gardees dans ce dossier.
param([string]$Root = (Resolve-Path "$PSScriptRoot\..\..").Path)
$ErrorActionPreference = 'Stop'
$lc = "$Root\pack\kubejs\data\lostcities\lostcities"
$utf8 = New-Object Text.UTF8Encoding($false)
function Ecrire($chemin, $objet) {
    $d = Split-Path $chemin
    if (-not (Test-Path $d)) { New-Item -ItemType Directory $d -Force | Out-Null }
    [IO.File]::WriteAllText($chemin, ($objet | ConvertTo-Json -Depth 30), $utf8)
}

# --- Petit langage de plan : une grille 16x16 de caracteres ---
function Grille($c = ' ') { $g = New-Object 'char[,]' 16, 16; for ($z = 0; $z -lt 16; $z++) { for ($x = 0; $x -lt 16; $x++) { $g[$z, $x] = $c } }; , $g }
function Plein($g, $x1, $z1, $x2, $z2, $c) { for ($z = $z1; $z -le $z2; $z++) { for ($x = $x1; $x -le $x2; $x++) { $g[$z, $x] = $c } } }
function Bord($g, $x1, $z1, $x2, $z2, $c) { for ($x = $x1; $x -le $x2; $x++) { $g[$z1, $x] = $c; $g[$z2, $x] = $c }; for ($z = $z1; $z -le $z2; $z++) { $g[$z, $x1] = $c; $g[$z, $x2] = $c } }
function Fenetres($g, $x1, $z1, $x2, $z2, $c, $periode = 3, $debut = 1) {
    for ($x = $x1 + 1; $x -lt $x2; $x++) { if ((($x - $x1) % $periode) -ne 0) { $g[$z1, $x] = $c; $g[$z2, $x] = $c } }
    for ($z = $z1 + 1; $z -lt $z2; $z++) { if ((($z - $z1) % $periode) -ne 0) { $g[$z, $x1] = $c; $g[$z, $x2] = $c } }
}
function Lignes($g) { $l = @(); for ($z = 0; $z -lt 16; $z++) { $s = ''; for ($x = 0; $x -lt 16; $x++) { $s += $g[$z, $x] }; $l += $s }; , $l }
function Part($nom, $tranches, $palette = @()) {
    $o = [ordered]@{ xsize = 16; zsize = 16 }
    if ($palette.Count -gt 0) { $o.palette = @{ palette = $palette } }
    $o.slices = @($tranches)
    Ecrire "$lc\parts\$nom.json" $o
}
function B($c, $bloc) { @{ char = "$c"; block = $bloc } }
function Coffre($c, $condition, $sens = 'north') { @{ char = "$c"; block = "minecraft:chest[facing=$sens]"; loot = $condition } }
function Batiment($nom, $min, $max, $etages, $toits, $remplissage = '#', $gravats = '}') {
    $p = @()
    foreach ($e in $etages) { $p += [ordered]@{ top = $false; part = $e } }
    foreach ($t in $toits) { $p += [ordered]@{ top = $true; part = $t } }
    Ecrire "$lc\buildings\$nom.json" ([ordered]@{ filler = $remplissage; rubble = $gravats; minfloors = $min; maxfloors = $max; parts = $p })
}
function Echelle($g, $x, $z) { $g[$z, $x] = 'l' }
function SolAvecEchelle($c, $x = 7, $z = 9) { $g = Grille $c; Echelle $g $x $z; (Lignes $g) }
# Un etage standard : sol, 3 niveaux de piece, plafond
function Etage($mur, $vitre, $periode, $decor = $null, $ouvert = @()) {
    $sol = Grille '#'; Echelle $sol 7 9
    $bas = Grille ' '; Bord $bas 0 0 15 15 $mur; Echelle $bas 7 9; Plein $bas 6 10 8 10 '#'
    $fen = Grille ' '; Bord $fen 0 0 15 15 $mur; Fenetres $fen 0 0 15 15 $vitre $periode; Echelle $fen 7 9; Plein $fen 6 10 8 10 '#'
    $haut = Grille ' '; Bord $haut 0 0 15 15 $mur; Echelle $haut 7 9; Plein $haut 6 10 8 10 '#'
    $plafond = Grille '#'; Echelle $plafond 7 9
    if ($decor) { & $decor $bas }
    foreach ($o in $ouvert) {
        foreach ($t in @($bas, $fen)) {
            switch ($o) {
                'N' { Plein $t 7 0 8 0 ' ' } 'S' { Plein $t 7 15 8 15 ' ' } 'O' { Plein $t 0 7 0 8 ' ' } 'E' { Plein $t 15 7 15 8 ' ' }
            }
        }
    }
    , @((Lignes $sol), (Lignes $bas), (Lignes $fen), (Lignes $fen), (Lignes $haut), (Lignes $plafond))
}
function ToitParapet($mur, $decor = $null) {
    $g = Grille ' '; Bord $g 0 0 15 15 $mur
    $vide = Grille ' '
    if ($decor) { & $decor $g }
    , @((Lignes $g), (Lignes $vide))
}

# ===== Immeubles et maisons =====
$pieces = { param($g) Plein $g 4 1 4 6 '#'; Plein $g 11 8 11 14 '#'; $g[2, 2] = 'C'; $g[13, 13] = 'C' }
Part 'ath_maison_rdc' (Etage '$' 'a' 4 $pieces)
Part 'ath_maison_etage' (Etage '#' 'a' 3)
$pente = @((B 'n' 'minecraft:spruce_stairs[facing=north,half=bottom,shape=straight]'), (B 'o' 'minecraft:spruce_stairs[facing=south,half=bottom,shape=straight]'), (B 'p' 'minecraft:spruce_planks'))
$toitPente = @()
for ($i = 0; $i -lt 6; $i++) {
    $g = Grille ' '
    if ($i -lt 6) { Plein $g 0 $i 15 $i 'o'; Plein $g 0 (15 - $i) 15 (15 - $i) 'n'; if ($i -ge 1) { Bord $g 0 ($i) 15 (15 - $i) 'p'; Plein $g 0 $i 15 $i 'o'; Plein $g 0 (15 - $i) 15 (15 - $i) 'n' } }
    $toitPente += , (Lignes $g)
}
Part 'ath_toit_pente' $toitPente $pente
Batiment 'ath_maison' 1 3 @('ath_maison_rdc', 'ath_maison_etage') @('ath_toit_pente')

# Barre d'habitation : coursive ouverte d'un cote, rambardes en barreaux
$bc = @(); $sol = Grille '#'; Echelle $sol 2 4; $bc += , (Lignes $sol)
$a = Grille ' '; Plein $a 0 3 15 3 '#'; Bord $a 0 3 15 15 '#'; Plein $a 0 0 15 0 ':'; Plein $a 0 0 0 2 ':'; Plein $a 15 0 15 2 ':'; Plein $a 5 4 5 15 '#'; Plein $a 10 4 10 15 '#'; Plein $a 2 3 3 3 ' '; Plein $a 7 3 8 3 ' '; Plein $a 12 3 13 3 ' '; Plein $a 1 4 3 4 ' '; Echelle $a 2 4; $a[5, 2] = '#'; $a[13, 7] = 'C'; $bc += , (Lignes $a)
$a2 = Grille ' '; Plein $a2 0 3 15 3 '#'; Bord $a2 0 3 15 15 '#'; Plein $a2 5 4 5 15 '#'; Plein $a2 10 4 10 15 '#'; Plein $a2 2 3 3 3 ' '; Plein $a2 7 3 8 3 ' '; Plein $a2 12 3 13 3 ' '; Fenetres $a2 0 3 15 15 'a' 3; Plein $a2 0 3 15 3 '#'; Plein $a2 2 3 3 3 ' '; Plein $a2 7 3 8 3 ' '; Plein $a2 12 3 13 3 ' '; Echelle $a2 2 4; $a2[5, 2] = '#'; $bc += , (Lignes $a2)
$bc += , (Lignes $a2)
$h3 = Grille ' '; Plein $h3 0 3 15 3 '#'; Bord $h3 0 3 15 15 '#'; Plein $h3 5 4 5 15 '#'; Plein $h3 10 4 10 15 '#'; Echelle $h3 2 4; $h3[5, 2] = '#'; $bc += , (Lignes $h3)
$pl = Grille '#'; Echelle $pl 2 4; $bc += , (Lignes $pl)
Part 'ath_barre_etage' $bc
$tb = ToitParapet '#' { param($g) $g[4, 4] = ':'; $g[11, 9] = ':'; $g[11, 4] = ':' }
Part 'ath_toit_plat' $tb
Batiment 'ath_barre' 3 8 @('ath_barre_etage') @('ath_toit_plat')

# Tour de verre : facade pleine, noyau central
$tv = @()
$s = Grille '#'; Echelle $s 7 7; $tv += , (Lignes $s)
$m = Grille ' '; Plein $m 0 0 15 15 ' '; Bord $m 0 0 15 15 '+'; foreach ($c in 0, 5, 10, 15) { $m[0, $c] = '#'; $m[15, $c] = '#'; $m[$c, 0] = '#'; $m[$c, 15] = '#' }; Bord $m 5 5 10 10 '#'; Plein $m 6 6 9 9 ' '; Echelle $m 7 7; $m[8, 7] = '#'; $m[5, 7] = ' '; $m[6, 3] = 'C'
foreach ($r in 1..4) { $tv += , (Lignes $m) }
$s2 = Grille '#'; Echelle $s2 7 7; $tv += , (Lignes $s2)
Part 'ath_tour_verre' $tv
Part 'ath_toit_antennes' (ToitParapet '#' { param($g) foreach ($p in @(3, 3), @(12, 12), @(3, 12)) { $g[$p[0], $p[1]] = ':' } })
Batiment 'ath_tour' 6 16 @('ath_tour_verre') @('ath_toit_antennes')

# Villa a patio : etage ouvert sur une cour plantee
$vp = @()
$s = Grille '#'; Plein $s 6 6 9 9 'G'; Echelle $s 2 2; $vp += , (Lignes $s)
$m = Grille ' '; Bord $m 0 0 15 15 '#'; Fenetres $m 0 0 15 15 'a' 4; Bord $m 5 5 10 10 '$'; Plein $m 7 5 8 5 ' '; Plein $m 6 6 9 9 ' '; $m[7, 7] = 'o'; Echelle $m 2 2; $m[3, 2] = '#'; $m[13, 13] = 'C'
foreach ($r in 1..3) { $vp += , (Lignes $m) }
$h = Grille '$'; Plein $h 1 1 14 14 ' '; Plein $h 6 6 9 9 ' '; $vp += , (Lignes $h)
$pl = Grille '#'; Plein $pl 6 6 9 9 ' '; $vp += , (Lignes $pl)
Part 'ath_villa' $vp @((B 'o' 'minecraft:oak_sapling'))
Batiment 'ath_villa' 1 2 @('ath_villa') @('ath_toit_plat')

# Entrepot : un grand volume avec rayonnages
$en = @()
$s = Grille '$'; $en += , (Lignes $s)
$m = Grille ' '; Bord $m 0 0 15 15 '#'; Plein $m 3 3 3 12 'r'; Plein $m 7 3 7 12 'r'; Plein $m 12 3 12 12 'r'; $m[3, 3] = 'C'; $m[10, 7] = 'C'; $m[12, 12] = 'C'
$en += , (Lignes $m); $en += , (Lignes $m)
$m2 = Grille ' '; Bord $m2 0 0 15 15 '#'; Fenetres $m2 0 0 15 15 'a' 5; $en += , (Lignes $m2); $en += , (Lignes $m2)
$t = Grille 'u'; $en += , (Lignes $t)
Part 'ath_entrepot' $en @((B 'r' 'minecraft:spruce_slab[type=double]'), (B 'u' 'minecraft:smooth_stone_slab[type=double]'))
Part 'ath_toit_vide' @(, (Lignes (Grille ' ')))
Batiment 'ath_entrepot' 1 1 @('ath_entrepot') @('ath_toit_vide') '$'

# Marche couvert : piliers, etals et grand toit, aucun mur
$mc = @()
$s = Grille '$'; $mc += , (Lignes $s)
$m = Grille ' '; foreach ($c in @(1, 1), @(1, 7), @(1, 14), @(8, 1), @(8, 14), @(14, 1), @(14, 7), @(14, 14)) { $m[$c[0], $c[1]] = '#' }; Plein $m 4 4 11 4 'e'; Plein $m 4 11 11 11 'e'; $m[4, 4] = 'C'; $m[11, 11] = 'C'
$mc += , (Lignes $m)
$m3 = Grille ' '; foreach ($c in @(1, 1), @(1, 7), @(1, 14), @(8, 1), @(8, 14), @(14, 1), @(14, 7), @(14, 14)) { $m3[$c[0], $c[1]] = '#' }
$mc += , (Lignes $m3); $mc += , (Lignes $m3)
$mc += , (Lignes (Grille 't'))
$mc += , (Lignes (Grille ' '))
Part 'ath_marche' $mc @((B 'e' 'minecraft:spruce_slab[type=bottom]'), (B 't' 'minecraft:red_terracotta'))
Batiment 'ath_marche' 1 1 @('ath_marche') @('ath_toit_vide') '$'

# Eglise : nef haute et clocher
$eg = @()
$s = Grille '$'; $eg += , (Lignes $s)
foreach ($n in 1..7) {
    $m = Grille ' '; Bord $m 2 0 13 15 '#'; if ($n -ge 2 -and $n -le 5) { foreach ($z in 3, 7, 11) { $m[$z, 2] = 'v'; $m[$z, 13] = 'v' } }
    if ($n -le 2) { Plein $m 7 15 8 15 ' ' }; if ($n -eq 1) { foreach ($z in 3, 5, 7, 9) { Plein $m 4 $z 6 $z 'e'; Plein $m 9 $z 11 $z 'e' } ; $m[1, 7] = 'C' }
    $eg += , (Lignes $m)
}
foreach ($n in 8..12) { $m = Grille ' '; $i = $n - 8; if ((2 + $i) -le (13 - $i)) { Plein $m (2 + $i) 0 (13 - $i) 15 '$'; if ((3 + $i) -lt (12 - $i)) { Plein $m (3 + $i) 1 (12 - $i) 14 ' ' } }; $eg += , (Lignes $m) }
Part 'ath_eglise' $eg @((B 'v' 'minecraft:red_stained_glass_pane'), (B 'e' 'minecraft:spruce_slab[type=bottom]'))
Batiment 'ath_eglise' 1 1 @('ath_eglise') @('ath_toit_vide') '$'

# Toit d'un grand batiment : seul le pourtour exterieur a un rebord. Coin 'xz' d'apres les captures : 00 nord-ouest, 01 sud-ouest, 10 nord-est, 11 sud-est.
function RebordExterieur($g, $coin, $car, $pas = 1) {
    $ix = [int]"$($coin[0])"; $iz = [int]"$($coin[1])"
    for ($i = 0; $i -lt 16; $i += $pas) {
        $g[$(if ($iz -eq 0) { 0 } else { 15 }), $i] = $car
        $g[$i, $(if ($ix -eq 0) { 0 } else { 15 })] = $car
    }
}
# ===== Grands lieux : bati multi-chunks (sols et facades reconnaissables, quel que soit le style de la ville) =====
function Grand($prefixe, $mur, $vitre, $decor, $palette, $coffre) {
    foreach ($coin in @(@('00', @('E', 'S')), @('01', @('E', 'N')), @('10', @('O', 'S')), @('11', @('O', 'N')))) {
        $d = $decor
        $tr = Etage $mur $vitre 3 $d $coin[1]
        Part "${prefixe}_$($coin[0])" $tr ($palette + @($coffre))
    }
}
$palH = @((B 'H' 'minecraft:white_concrete'), (B 'I' 'minecraft:white_bed[facing=north,part=head]'), (B 'J' 'minecraft:white_bed[facing=north,part=foot]'), (B 'K' 'minecraft:iron_bars'))
$litsH = { param($g) foreach ($x in 2, 5, 10, 13) { $g[2, $x] = 'I'; $g[3, $x] = 'J'; }; foreach ($x in 2, 13) { $g[12, $x] = 'I'; $g[13, $x] = 'J' }; $g[5, 2] = 'c' }
Grand 'ath_hopital' 'H' 'a' $litsH $palH (Coffre 'c' 'atheria_hopital')
foreach ($c in '00', '01', '10', '11') {
    # Une seule grande croix rouge, centree sur les quatre chunks
    $rouge = Grille ' '; RebordExterieur $rouge $c 'H'
    $ix = [int]"$($c[0])"; $iz = [int]"$($c[1])"
    for ($z = 0; $z -lt 16; $z++) { for ($x = 0; $x -lt 16; $x++) {
        $dx = [math]::Abs($ix * 16 + $x - 15.5); $dz = [math]::Abs($iz * 16 + $z - 15.5)
        if (($dx -le 3 -and $dz -le 10) -or ($dx -le 10 -and $dz -le 3)) { $rouge[$z, $x] = 'R' }
    } }
    Part "ath_hopital_toit_$c" @((Lignes $rouge), (Lignes (Grille ' '))) @((B 'H' 'minecraft:white_concrete'), (B 'R' 'minecraft:red_concrete'))
    Batiment "ath_hopital_$c" 3 5 @("ath_hopital_$c") @("ath_hopital_toit_$c")
}
Ecrire "$lc\multibuildings\ath_hopital.json" ([ordered]@{ dimx = 2; dimz = 2; buildings = @(, @('ath_hopital_00', 'ath_hopital_01')) + , @('ath_hopital_10', 'ath_hopital_11') })

$palP = @((B 'P' 'minecraft:gray_concrete'), (B 'K' 'minecraft:iron_bars'), (B 'E' 'minecraft:gray_bed[facing=north,part=head]'), (B 'F' 'minecraft:gray_bed[facing=north,part=foot]'))
$cellules = { param($g) foreach ($x in 2, 5, 8, 11) { Plein $g $x 1 $x 5 'K' ; $g[1, ($x + 1)] = 'E'; $g[2, ($x + 1)] = 'F' }; Plein $g 2 5 13 5 'K'; foreach ($x in 3, 6, 9, 12) { $g[5, $x] = ' ' }; foreach ($x in 2, 5, 8, 11) { Plein $g $x 11 $x 14 'K' }; Plein $g 2 11 13 11 'K'; $g[14, 3] = 'c' }
Grand 'ath_prison' 'P' 'K' $cellules $palP (Coffre 'c' 'atheria_prison')
foreach ($c in '00', '01', '10', '11') {
    $cren2 = Grille ' '; RebordExterieur $cren2 $c 'P'
    $cren = Grille ' '; RebordExterieur $cren $c 'P' 2
    $fil = Grille ' '; RebordExterieur $fil $c 'W'
    Part "ath_prison_toit_$c" @((Lignes $cren2), (Lignes $cren), (Lignes $fil)) @((B 'P' 'minecraft:gray_concrete'), (B 'W' 'simply_traps:circular_barbed_wire_iron'))
    Batiment "ath_prison_$c" 2 3 @("ath_prison_$c") @("ath_prison_toit_$c")
}
Ecrire "$lc\multibuildings\ath_prison.json" ([ordered]@{ dimx = 2; dimz = 2; buildings = @(, @('ath_prison_00', 'ath_prison_01')) + , @('ath_prison_10', 'ath_prison_11') })

$palM = @((B 'M' 'minecraft:green_terracotta'), (B 'K' 'minecraft:iron_bars'), (B 'E' 'minecraft:green_bed[facing=north,part=head]'), (B 'F' 'minecraft:green_bed[facing=north,part=foot]'))
$dortoir = { param($g) foreach ($x in 2, 5, 10, 13) { $g[1, $x] = 'E'; $g[2, $x] = 'F'; $g[13, $x] = 'F'; $g[14, $x] = 'E' }; $g[7, 2] = 'c' }
Grand 'ath_base' 'M' 'K' $dortoir $palM (Coffre 'c' 'atheria_militaire')
foreach ($c in '00', '01', '10', '11') {
    $sable = Grille ' '; RebordExterieur $sable $c 'B'
    $sable2 = Grille ' '; RebordExterieur $sable2 $c 'B' 3
    Part "ath_base_toit_$c" @((Lignes $sable), (Lignes $sable2)) @((B 'B' 'minecraft:smooth_sandstone'))
    Batiment "ath_base_$c" 2 3 @("ath_base_$c") @("ath_base_toit_$c")
}
Ecrire "$lc\multibuildings\ath_base.json" ([ordered]@{ dimx = 2; dimz = 2; buildings = @(, @('ath_base_00', 'ath_base_01')) + , @('ath_base_10', 'ath_base_11') })

# ===== Bord de route et campagne =====
$palB = @((B 'p' 'minecraft:gray_concrete'), (B 'k' 'minecraft:black_concrete'), (B 'i' 'minecraft:iron_block'), (B 'n' 'minecraft:iron_bars'), (B 'y' 'minecraft:yellow_concrete'), (B 'R' 'atheria:reservoir_epave'), (B 'q' 'atheria:carrosserie'), (B 'v' 'minecraft:gray_stained_glass_pane'), (B 'w' 'minecraft:spruce_slab[type=double]'))
# Garage : atelier ouvert avec une voiture sur le pont, dalle devant
$gr = @()
$s = Grille 'p'; Plein $s 0 8 15 8 'y'; $gr += , (Lignes $s)
$m = Grille ' '; Bord $m 1 1 14 8 'k'; Plein $m 4 8 10 8 ' '; $m[2, 2] = 'c'; $m[2, 12] = 'c'; Plein $m 2 7 3 7 'w'; Plein $m 6 2 7 6 'q'; $m[6, 6] = 'R'; $gr += , (Lignes $m)
$m2 = Grille ' '; Bord $m2 1 1 14 8 'k'; Plein $m2 4 8 10 8 ' '; Plein $m2 6 3 7 4 'v'; $gr += , (Lignes $m2)
$m3 = Grille ' '; Bord $m3 1 1 14 8 'k'; $gr += , (Lignes $m3)
$m4 = Grille ' '; Plein $m4 1 1 14 8 'i'; $gr += , (Lignes $m4)
Part 'ath_garage' $gr ($palB + @((Coffre 'c' 'atheria_garage')))
Batiment 'ath_garage' 1 1 @('ath_garage') @('ath_toit_vide')
Ecrire "$lc\scattered\ath_garage.json" ([ordered]@{ buildings = @('ath_garage'); rotatable = $true; clearhighwayrailing = $true; supportpart = 'roadside_supports'; terrainheight = 'highest'; terrainfix = 'repeatslice' })

# Poste militaire de bord de route
$pm = @()
$s = Grille 'p'; $pm += , (Lignes $s)
$m = Grille ' '; Bord $m 1 1 14 14 'B'; Plein $m 6 14 9 14 ' '; Bord $m 4 3 11 9 'M'; Plein $m 7 9 8 9 ' '; $m[5, 5] = 'c'; $m[5, 10] = 'c'; Plein $m 3 11 5 13 'q'; $m[12, 5] = 'R'; $pm += , (Lignes $m)
$m2 = Grille ' '; Bord $m2 1 1 14 14 'B'; Plein $m2 6 14 9 14 ' '; Bord $m2 4 3 11 9 'M'; Plein $m2 7 9 8 9 ' '; $pm += , (Lignes $m2)
$m3 = Grille ' '; Bord $m3 1 1 14 14 'W'; Plein $m3 6 14 9 14 ' '; Bord $m3 4 3 11 9 'n'; $pm += , (Lignes $m3)
$m4 = Grille ' '; Plein $m4 4 3 11 9 'M'; $pm += , (Lignes $m4)
Part 'ath_poste' $pm ($palB + @((B 'B' 'minecraft:smooth_sandstone'), (B 'M' 'minecraft:green_terracotta'), (B 'W' 'simply_traps:circular_barbed_wire_iron'), (Coffre 'c' 'atheria_militaire')))
Batiment 'ath_poste' 1 1 @('ath_poste') @('ath_toit_vide')
Ecrire "$lc\scattered\ath_poste.json" ([ordered]@{ buildings = @('ath_poste'); rotatable = $true; clearhighwayrailing = $true; supportpart = 'roadside_supports'; terrainheight = 'highest'; terrainfix = 'repeatslice' })

# Camp de refugies : tentes de laine, foyer eteint, notes et soins dans les caisses
$cr = @()
$s = Grille 'd'; Plein $s 6 6 9 9 'g'; $cr += , (Lignes $s)
$m = Grille ' '; foreach ($t in @(1, 1), @(10, 1), @(1, 10), @(10, 10)) { Bord $m $t[0] $t[1] ($t[0] + 4) ($t[1] + 4) 'W'; $m[($t[1] + 4), ($t[0] + 2)] = ' ' }; $m[7, 7] = 'f'; $m[2, 2] = 'c'; $m[2, 11] = 'c'; $m[11, 3] = 'c'; $m[12, 12] = 'b'; $m[8, 5] = 'b'; $cr += , (Lignes $m)
$m2 = Grille ' '; foreach ($t in @(1, 1), @(10, 1), @(1, 10), @(10, 10)) { Bord $m2 $t[0] $t[1] ($t[0] + 4) ($t[1] + 4) 'W'; $m2[($t[1] + 4), ($t[0] + 2)] = ' ' }; $cr += , (Lignes $m2)
$m3 = Grille ' '; foreach ($t in @(1, 1), @(10, 1), @(1, 10), @(10, 10)) { Plein $m3 $t[0] $t[1] ($t[0] + 4) ($t[1] + 4) 'W' }; $cr += , (Lignes $m3)
Part 'ath_camp' $cr @((B 'd' 'minecraft:coarse_dirt'), (B 'g' 'minecraft:gravel'), (B 'W' 'minecraft:light_gray_wool'), (B 'f' 'minecraft:campfire[lit=false]'), (B 'b' 'minecraft:barrel[facing=up]'), (Coffre 'c' 'atheria_refugies'))
Batiment 'ath_camp' 1 1 @('ath_camp') @('ath_toit_vide')
Ecrire "$lc\scattered\ath_camp.json" ([ordered]@{ buildings = @('ath_camp'); rotatable = $true; terrainheight = 'highest'; terrainfix = 'repeatslice' })

# Grange des terres agricoles
$gn = @()
$s = Grille 'd'; Plein $s 1 2 14 13 'p'; $gn += , (Lignes $s)
foreach ($n in 1..3) { $m = Grille ' '; Bord $m 2 2 13 13 'r'; if ($n -le 2) { Plein $m 6 13 9 13 ' ' }; if ($n -eq 1) { foreach ($h in @(4, 4), @(5, 4), @(4, 5), @(10, 10), @(11, 10)) { $m[$h[1], $h[0]] = 'h' }; $m[3, 11] = 'c' }; $gn += , (Lignes $m) }
foreach ($i in 0..4) { $m = Grille ' '; if ((2 + $i) -le (13 - $i)) { Plein $m (2 + $i) 2 (13 - $i) 13 't'; if ((3 + $i) -lt (12 - $i)) { Plein $m (3 + $i) 3 (12 - $i) 12 ' ' } }; $gn += , (Lignes $m) }
Part 'ath_grange' $gn @((B 'd' 'minecraft:coarse_dirt'), (B 'p' 'minecraft:spruce_planks'), (B 'r' 'minecraft:stripped_spruce_log'), (B 't' 'minecraft:dark_oak_planks'), (B 'h' 'minecraft:hay_block'), (Coffre 'c' 'atheria_refugies'))
Batiment 'ath_grange' 1 1 @('ath_grange') @('ath_toit_vide')
Ecrire "$lc\scattered\ath_grange.json" ([ordered]@{ buildings = @('ath_grange'); rotatable = $true; terrainheight = 'highest'; terrainfix = 'repeatslice' })

# ===== Coffres propres a ces lieux =====
function Condition($nom, $table) { Ecrire "$lc\conditions\$nom.json" @{ values = @(@{ factor = 1; value = $table }) } }
Condition 'atheria_garage' 'atheria:chests/garage'
Condition 'atheria_hopital' 'atheria:chests/hopital'
Condition 'atheria_prison' 'atheria:chests/prison'
Condition 'atheria_militaire' 'atheria:chests/militaire'
Condition 'atheria_refugies' 'atheria:chests/refugies'
function Butin($nom, $rolls, $entrees) {
    $e = @(); foreach ($x in $entrees) { $o = @{ type = 'minecraft:item'; name = $x[0]; weight = $x[1] }; if ($x.Count -gt 2) { $o.functions = @(@{ function = 'minecraft:set_count'; count = @{ type = 'minecraft:uniform'; min = 1; max = $x[2] } }) }; $e += $o }
    Ecrire "$Root\pack\kubejs\data\atheria\loot_table\chests\$nom.json" @{ type = 'minecraft:chest'; pools = @(@{ rolls = @{ type = 'minecraft:uniform'; min = $rolls[0]; max = $rolls[1] }; entries = $e }) }
}
Butin 'garage' @(3, 6) @(@('atheria:pieces_vehicule', 10, 3), @('atheria:bidon_essence', 6), @('atheria:kit_siphon', 3), @('atheria:carte_routiere', 4), @('minecraft:iron_ingot', 8, 4), @('minecraft:copper_ingot', 8, 5), @('minecraft:chain', 6, 4), @('create:andesite_alloy', 5, 3), @('create:cogwheel', 4, 2), @('minecraft:bucket', 3))
Butin 'hopital' @(3, 6) @(@('firstaid:bandage', 10, 3), @('firstaid:plaster', 10, 4), @('firstaid:morphine', 4), @('atheria:antifongique', 5), @('atheria:filtre', 5, 2), @('spore:respirator', 1), @('minecraft:paper', 6, 4), @('minecraft:glass_bottle', 6, 3), @('minecraft:white_wool', 4, 3))
Butin 'prison' @(2, 5) @(@('minecraft:iron_nugget', 10, 6), @('minecraft:bone', 8, 3), @('minecraft:rotten_flesh', 8, 3), @('atheria:ration', 4), @('atheria:cle_cellule', 1), @('minecraft:iron_bars', 5, 3), @('atheria:carte_routiere', 2), @('minecraft:paper', 6, 3))
Butin 'militaire' @(3, 6) @(@('atheria:ration', 8, 2), @('atheria:filtre', 6, 2), @('spore:gas_mask', 2), @('atheria:carte_routiere', 5), @('atheria:bidon_essence', 5), @('atheria:batterie', 3), @('minecraft:iron_ingot', 8, 4), @('minecraft:gunpowder', 8, 4), @('trapperpelts:beartrapitem', 3), @('minecraft:copper_ingot', 6, 4))
Butin 'refugies' @(2, 5) @(@('atheria:ration', 8, 2), @('atheria:antifongique', 3), @('minecraft:paper', 8, 3), @('minecraft:bread', 6, 2), @('minecraft:leather', 5, 2), @('minecraft:string', 5, 3), @('atheria:carte_routiere', 3), @('firstaid:bandage', 6, 2), @('atheria:filtre', 3), @('atheria:photo_famille', 1))

# ===== Architectures =====
function Mat($c, $liste, $abime = 'minecraft:air') {
    $b = @(); for ($i = 0; $i -lt $liste.Count; $i += 2) { $b += [ordered]@{ random = [int]$liste[$i + 1] * 2; block = $liste[$i] } }
    [ordered]@{ char = $c; blocks = $b; damaged = $abime }
}
function Architecture($nom, $mur, $bordure, $rue, $vitre, $vitrePleine) {
    $p = @(
        (Mat '#' $mur), (Mat 'X' $mur), (Mat '}' $mur),
        (Mat '$' $bordure), (Mat '@' $bordure), (Mat 'x' $bordure), (Mat 'y' $bordure), (Mat 'v' $bordure),
        (Mat 'S' $rue), (Mat 'u' $rue),
        [ordered]@{ char = 'a'; block = $vitre }, [ordered]@{ char = '`'; block = $vitre }, [ordered]@{ char = '+'; block = $vitrePleine }
    )
    Ecrire "$lc\palettes\$nom.json" @{ palette = $p }
    Ecrire "$lc\styles\$nom.json" @{ randompalettes = @(
            , @(@{ palette = 'common'; factor = 1 })
            , @(@{ palette = 'default'; factor = 1 })
            , @(@{ palette = 'bricks_standard'; factor = 1 })
            , @(@{ palette = 'glass_pane'; factor = 1 })
            , @(@{ palette = $nom; factor = 1 })
        ) }
}
Architecture 'ath_brique' @('minecraft:bricks', 90, 'minecraft:mud_bricks', 8, 'minecraft:packed_mud', 2) @('minecraft:stone_bricks', 90, 'minecraft:cracked_stone_bricks', 10) @('minecraft:cobblestone', 70, 'minecraft:gravel', 30) 'minecraft:glass_pane' 'minecraft:glass'
Architecture 'ath_beton' @('minecraft:light_gray_concrete', 70, 'minecraft:gray_concrete', 25, 'minecraft:cyan_terracotta', 5) @('minecraft:gray_concrete', 100) @('minecraft:gray_concrete_powder', 20, 'minecraft:gray_concrete', 80) 'minecraft:gray_stained_glass_pane' 'minecraft:gray_stained_glass'
Architecture 'ath_verre' @('minecraft:quartz_block', 70, 'minecraft:smooth_quartz', 30) @('minecraft:iron_block', 60, 'minecraft:light_gray_concrete', 40) @('minecraft:light_gray_concrete', 100) 'minecraft:light_blue_stained_glass_pane' 'minecraft:light_blue_stained_glass'
Architecture 'ath_terracotta' @('minecraft:terracotta', 50, 'minecraft:orange_terracotta', 30, 'minecraft:white_terracotta', 20) @('minecraft:smooth_sandstone', 100) @('minecraft:smooth_red_sandstone', 60, 'minecraft:red_sand', 40) 'minecraft:orange_stained_glass_pane' 'minecraft:orange_stained_glass'
Architecture 'ath_bois' @('minecraft:spruce_planks', 70, 'minecraft:stripped_spruce_log', 30) @('minecraft:spruce_log', 100) @('minecraft:coarse_dirt', 60, 'minecraft:gravel', 40) 'minecraft:glass_pane' 'minecraft:glass'
Architecture 'ath_rouille' @('minecraft:weathered_copper', 40, 'minecraft:oxidized_copper', 30, 'atheria:carrosserie', 30) @('minecraft:iron_block', 100) @('minecraft:gravel', 50, 'minecraft:gray_concrete', 50) 'minecraft:iron_bars' 'minecraft:tinted_glass'
Architecture 'ath_gothique' @('minecraft:deepslate_bricks', 60, 'minecraft:polished_blackstone_bricks', 30, 'minecraft:cracked_deepslate_bricks', 10) @('minecraft:polished_deepslate', 100) @('minecraft:cobbled_deepslate', 100) 'minecraft:purple_stained_glass_pane' 'minecraft:black_stained_glass'
Architecture 'ath_moderne' @('minecraft:white_concrete', 90, 'minecraft:light_gray_concrete', 10) @('minecraft:cyan_terracotta', 100) @('minecraft:light_gray_concrete', 100) 'minecraft:cyan_stained_glass_pane' 'minecraft:cyan_stained_glass'
Architecture 'ath_haussmann' @('minecraft:smooth_sandstone', 80, 'minecraft:sandstone', 20) @('minecraft:cut_sandstone', 100) @('minecraft:andesite', 60, 'minecraft:polished_andesite', 40) 'minecraft:black_stained_glass_pane' 'minecraft:gray_stained_glass'
Architecture 'ath_bidonville' @('minecraft:spruce_planks', 20, 'minecraft:weathered_copper', 20, 'minecraft:terracotta', 15, 'minecraft:blue_terracotta', 15, 'minecraft:yellow_terracotta', 15, 'atheria:carrosserie', 15) @('minecraft:oak_planks', 100) @('minecraft:mud', 30, 'minecraft:coarse_dirt', 70) 'minecraft:iron_bars' 'minecraft:glass'

$base = Get-Content "$PSScriptRoot\citystyle.base.json" -Raw -Encoding UTF8 | ConvertFrom-Json
function Choix($h) { $l = @(); foreach ($k in $h.Keys) { $l += [ordered]@{ factor = $h[$k]; value = $k } }; , $l }
function Ville($nom, $chance, $min, $max, $caves, $batiments, $multi, $parcs = 0.3) {
    $o = $base | ConvertTo-Json -Depth 30 | ConvertFrom-Json
    $o.style = $nom
    $o.buildingsettings = [ordered]@{ buildingchance = $chance; minfloors = $min; maxfloors = $max; maxcellars = $caves }
    $o.selectors.buildings = (Choix $batiments)
    $o.selectors.multibuildings = (Choix $multi)
    Ecrire "$lc\citystyles\citystyle_$nom.json" $o
}
# Les architectures Atheria n'utilisent plus les batiments generiques de Lost Cities (tours grises au milieu du bourg, etc.)
# ===== Batiments vitrine : produits par convertir-vitrines.py, lots de 2x2 chunks, hopital, prison et base sur 4x2 =====
$vitIdx = $null; $fv = "$PSScriptRoot\vitrines\index.json"
if (Test-Path $fv) { $vitIdx = Get-Content $fv -Raw -Encoding UTF8 | ConvertFrom-Json }
function Vit($q) { if ($vitIdx -and $vitIdx.$q) { @($vitIdx.$q.PSObject.Properties.Name) } else { @() } }
function Existe($nom) { if (-not $vitIdx) { return $false }; foreach ($p in $vitIdx.PSObject.Properties) { if ($p.Value.PSObject.Properties.Name -contains $nom) { return $true } }; $false }
# les anciens grands batiments sont remplaces par leur version vitrine quand elle existe
$GRANDS = @{ ath_hopital = 'ath_v_hp_hopital'; ath_prison = 'ath_v_pr_prison'; ath_base = 'ath_v_ba_base' }
function Multi($vitrines, $autres) {
    $h = [ordered]@{}
    for ($i = 0; $i -lt $vitrines.Count; $i += 2) { foreach ($n in (Vit $vitrines[$i])) { if (-not $GRANDS.ContainsValue($n)) { $h[$n] = $vitrines[$i + 1] } } }
    foreach ($k in $autres.Keys) { $n = $k; if ($GRANDS[$k] -and (Existe $GRANDS[$k])) { $n = $GRANDS[$k] }; $h[$n] = $autres[$k] }
    $h
}
$od = [ordered]@{}
Ville 'ath_brique' 0.45 2 5 1 ([ordered]@{ ath_maison = 2; ath_marche = 0.3; ath_eglise = 0.1; ath_entrepot = 0.2 }) (Multi @('bois', 0.5, 'haussmann', 0.3) ([ordered]@{ ath_hopital = 0.4 }))
Ville 'ath_beton' 0.6 4 12 2 ([ordered]@{ ath_barre = 2.5; ath_entrepot = 0.2 }) (Multi @('beton', 1) ([ordered]@{ ath_hopital = 0.5; ath_prison = 0.3 }))
Ville 'ath_verre' 0.7 8 22 3 ([ordered]@{ ath_tour = 3 }) (Multi @('verre', 1) ([ordered]@{ ath_hopital = 0.4 }))
Ville 'ath_terracotta' 0.4 1 3 0 ([ordered]@{ ath_villa = 3; ath_marche = 0.6; ath_maison = 0.5; ath_eglise = 0.12 }) (Multi @('terracotta', 1) ([ordered]@{ ath_hopital = 0.15 }))
Ville 'ath_bois' 0.25 1 2 0 ([ordered]@{ ath_maison = 3; ath_entrepot = 0.4; ath_eglise = 0.15; ath_marche = 0.3 }) (Multi @('bois', 1) ([ordered]@{ ath_prison = 0.1 }))
Ville 'ath_rouille' 0.55 1 4 1 ([ordered]@{ ath_entrepot = 3; ath_barre = 0.4; ath_marche = 0.2 }) (Multi @('rouille', 1, 'base', 0.3) ([ordered]@{ ath_base = 0.5; ath_prison = 0.2 }))
Ville 'ath_gothique' 0.5 3 9 2 ([ordered]@{ ath_eglise = 0.7; ath_maison = 1.2 }) (Multi @('gothique', 1, 'prison', 0.3) ([ordered]@{ ath_prison = 0.5 }))
Ville 'ath_moderne' 0.35 2 5 1 ([ordered]@{ ath_villa = 1.5; ath_tour = 0.3 }) (Multi @('moderne', 1, 'hopital', 0.3) ([ordered]@{ ath_hopital = 0.5 }))
Ville 'ath_haussmann' 0.7 5 8 2 ([ordered]@{ ath_maison = 2.5; ath_eglise = 0.08 }) (Multi @('haussmann', 1, 'hopital', 0.2) ([ordered]@{ ath_hopital = 0.4 }))
Ville 'ath_bidonville' 0.75 1 2 0 ([ordered]@{ ath_maison = 2; ath_marche = 0.5 }) (Multi @('bidonville', 1) $od)
Ville 'ath_garnison' 0.4 1 4 2 ([ordered]@{ ath_entrepot = 1.5; ath_barre = 0.6 }) (Multi @('garnison', 1, 'base', 0.5, 'prison', 0.3) ([ordered]@{ ath_base = 1.2; ath_prison = 0.4 }))
Copy-Item "$lc\palettes\ath_beton.json" "$lc\palettes\ath_garnison.json" -Force
Copy-Item "$lc\styles\ath_beton.json" "$lc\styles\ath_garnison.json" -Force

# ===== Monde : poids des architectures et structures isolees =====
$monde = Get-Content "$PSScriptRoot\worldstyle.base.json" -Raw -Encoding UTF8 | ConvertFrom-Json
$hors = @{ excluding = @('#minecraft:is_ocean', '#minecraft:is_river', '#minecraft:is_beach') }
function Epars($nom, $poids, $route, $diff, $biomes) { $o = [ordered]@{ name = $nom; weight = $poids; maxheightdiff = $diff; biomes = $biomes }; if ($route) { $o.nearhighway = $true }; $o }
$monde.scattered.list = @($monde.scattered.list) + @(
    (Epars 'ath_garage' 11 $true 10 $hors),
    (Epars 'ath_camp' 6 $true 6 $hors),
    (Epars 'ath_poste' 4 $true 10 $hors),
    (Epars 'ath_grange' 22 $false 4 @{ if_any = @('atheria:terres_agricoles') })
)
function Style($nom, $f, $biomes = $null) { $o = [ordered]@{ citystyle = "citystyle_$nom"; factor = $f }; if ($biomes) { $o.biomes = @{ if_any = $biomes } }; $o }
# Architecture par biome (plan des villes) : chaque centre de ville tire son style selon le biome de son centre.
# Dans son biome, l'architecture du biome pese environ 80 %, le reste vient des poids de fond (voisins logiques, beton en peripherie).
# Les anciens styles (standard, atheria_*) ne gardent qu'un poids de fond faible.
$fond = @{ citystyle_standard = 0.04; citystyle_atheria_metropole = 0.03; citystyle_atheria_banlieue = 0.03; citystyle_atheria_bourg = 0.03; citystyle_atheria_industrie = 0.02; citystyle_desert = 0.3 }
foreach ($s in $monde.citystyles) { if ($fond.ContainsKey($s.citystyle)) { $s.factor = $fond[$s.citystyle] } }
$PLAINES = @('#c:is_plains', 'minecraft:plains', 'minecraft:sunflower_plains', 'minecraft:meadow')
$FORETS = @('#minecraft:is_forest', '#c:is_forest')
$monde.citystyles = @($monde.citystyles) + @(
    # fond : partout, faible
    (Style 'ath_beton' 0.15), (Style 'ath_brique' 0.04), (Style 'ath_haussmann' 0.03), (Style 'ath_verre' 0.02), (Style 'ath_terracotta' 0.02),
    (Style 'ath_bois' 0.03), (Style 'ath_rouille' 0.03), (Style 'ath_gothique' 0.03), (Style 'ath_moderne' 0.03), (Style 'ath_bidonville' 0.03), (Style 'ath_garnison' 0.03),
    # biomes
    (Style 'ath_bois' 2.4 @('#minecraft:is_taiga', '#c:is_snowy', '#c:is_icy', '#c:is_coniferous_tree')),
    (Style 'ath_terracotta' 2.4 @('#minecraft:is_badlands', '#minecraft:is_savanna', '#c:is_savanna', '#c:is_desert', '#c:is_badlands', 'minecraft:desert')),
    (Style 'ath_gothique' 3.6 @('minecraft:dark_forest', '#c:is_spooky', '#c:is_swamp', 'minecraft:swamp')),
    (Style 'ath_haussmann' 1.2 ($PLAINES + $FORETS)), (Style 'ath_brique' 1.2 ($PLAINES + $FORETS)), (Style 'ath_verre' 0.5 $PLAINES),
    (Style 'ath_moderne' 3.6 @('#minecraft:is_beach', '#c:is_beach', '#c:is_birch_forest', 'minecraft:birch_forest', 'minecraft:old_growth_birch_forest')),
    (Style 'ath_rouille' 2.4 @('#minecraft:is_river', '#c:is_river', '#minecraft:is_beach', '#c:is_stony_shores')),
    (Style 'ath_bidonville' 2.4 @('#minecraft:is_jungle', '#c:is_jungle', 'minecraft:mangrove_swamp')),
    (Style 'ath_garnison' 2.4 @('#minecraft:is_mountain', '#c:is_mountain', '#minecraft:is_hill', '#c:is_hill'))
)
# Les styles varient d'un quartier a l'autre : a 0,8 il fallait 4 chunks sur 4 du meme style et les grands batiments ne sortaient presque jamais
$monde.multisettings.correctstylefactor = 0.5
# Batiments vitrine (2x2 et 4x2 chunks) : plus de grands lots par zone de 10x10 chunks pour qu'ils forment l'essentiel des villes
$monde.multisettings.minimum = 6; $monde.multisettings.maximum = 16; $monde.multisettings.attempts = 200
Ecrire "$lc\worldstyles\atheria.json" $monde
"villes generees : $((Get-ChildItem "$lc\parts").Count) parties, $((Get-ChildItem "$lc\citystyles").Count) architectures"
