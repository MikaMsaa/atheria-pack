param([string]$Etiquette)
# Dessine la carte d'un scan et compte les villes (taches contigues) reliees par une route.
Add-Type -AssemblyName System.Drawing
$sp = $PSScriptRoot
$lignes = [IO.File]::ReadAllLines((Join-Path $sp "scan-$Etiquette.txt"))
$rangs = @($lignes | Where-Object { $_.StartsWith('L') } | ForEach-Object { $_.Substring(1) })
$centres = @($lignes | Where-Object { $_.StartsWith('centre ') })
$H = $rangs.Count; $W = $rangs[0].Length
$bmp = New-Object Drawing.Bitmap $W, $H
$ville = New-Object 'int[,]' $W, $H
$routeSeule = New-Object 'bool[,]' $W, $H
for ($y = 0; $y -lt $H; $y++) {
    $l = $rangs[$y]
    for ($x = 0; $x -lt $W; $x++) {
        $c = $l[$x]
        if ($c -eq 'v' -or $c -eq 'X') { $ville[$x, $y] = -1 }
        if ($c -eq 'H' -or $c -eq 'X') { $routeSeule[$x, $y] = $true }
        $couleur = switch ($c) { 'v' { [Drawing.Color]::FromArgb(70, 110, 190) } 'H' { [Drawing.Color]::FromArgb(255, 200, 40) } 'X' { [Drawing.Color]::FromArgb(255, 120, 30) } default { [Drawing.Color]::FromArgb(28, 34, 30) } }
        $bmp.SetPixel($x, $y, $couleur)
    }
}
# Taches contigues de ville
$tailles = New-Object System.Collections.Generic.List[int]
$reliees = 0
$pile = New-Object System.Collections.Generic.Stack[int]
$num = 0
for ($y = 0; $y -lt $H; $y++) {
    for ($x = 0; $x -lt $W; $x++) {
        if ($ville[$x, $y] -ne -1) { continue }
        $num++
        $n = 0; $route = $false
        $pile.Push($x + $y * $W); $ville[$x, $y] = $num
        while ($pile.Count -gt 0) {
            $v = $pile.Pop(); $cx = $v % $W; $cy = [Math]::Floor($v / $W); $n++
            if ($routeSeule[$cx, $cy]) { $route = $true }
            foreach ($d in @(@(1, 0), @(-1, 0), @(0, 1), @(0, -1))) {
                $nx = $cx + $d[0]; $ny = $cy + $d[1]
                if ($nx -ge 0 -and $ny -ge 0 -and $nx -lt $W -and $ny -lt $H -and $ville[$nx, $ny] -eq -1) { $ville[$nx, $ny] = $num; $pile.Push($nx + $ny * $W) }
            }
        }
        $tailles.Add($n)
        if ($route) { $reliees++ }
    }
}
$bmp.Save((Join-Path $sp "carte-$Etiquette.png"), [Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
$t = $tailles | Sort-Object
$lignes | Where-Object { $_ -match '^(bilan|profil|ERREUR)' }
"centres de ville : $($centres.Count)"
"taches de ville : $($tailles.Count), reliees a une route : $reliees"
if ($t.Count) {
    "taille des taches en chunks : min $($t[0]), mediane $($t[[int]($t.Count / 2)]), max $($t[-1])"
    "bourgs (<150) : $(@($t | Where-Object { $_ -lt 150 }).Count), villes (150-1000) : $(@($t | Where-Object { $_ -ge 150 -and $_ -lt 1000 }).Count), grandes (>=1000) : $(@($t | Where-Object { $_ -ge 1000 }).Count)"
}
$centres | ForEach-Object { ($_ -split ' ')[4] } | Group-Object | ForEach-Object { "style $($_.Name) : $($_.Count)" }
