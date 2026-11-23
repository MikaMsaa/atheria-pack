param([string]$Motif, [string]$Sortie, [int]$Colonnes = 3, [int]$L = 533, [int]$H = 300)
$g = "C:\Users\El-Afdal\Desktop\Atheria Zombie Edition\docs\vitrine-batiments\grands-8"
Add-Type -A System.Drawing
$liste = @(Get-ChildItem "$g\$Motif" | Sort-Object Name)
$lignes = [math]::Ceiling($liste.Count / $Colonnes)
$b = New-Object Drawing.Bitmap(($Colonnes * $L), ($lignes * $H))
$d = [Drawing.Graphics]::FromImage($b)
$i = 0
foreach ($f in $liste) {
    $im = [Drawing.Image]::FromFile($f.FullName)
    $x = ($i % $Colonnes) * $L; $y = [math]::Floor($i / $Colonnes) * $H
    $d.DrawImage($im, $x, $y, $L, $H)
    $d.DrawString($f.BaseName, (New-Object Drawing.Font('Arial', 11)), [Drawing.Brushes]::Yellow, $x + 4, $y + 2)
    $im.Dispose(); $i++
}
$b.Save($Sortie); $d.Dispose(); $b.Dispose()
"$($liste.Count) images"


