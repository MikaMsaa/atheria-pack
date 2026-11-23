param([string]$JarPat, [string]$Ns, [string[]]$Noms, [string]$Sortie)
$ErrorActionPreference = 'Stop'
$mods = 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition\instances\Atheria\minecraft\mods'
Add-Type -AssemblyName System.IO.Compression.FileSystem; Add-Type -AssemblyName System.Drawing
$j = Get-ChildItem $mods -Filter $JarPat | Select -First 1; $z = [IO.Compression.ZipFile]::OpenRead($j.FullName)
$all = @($z.Entries | ? { $_.FullName -like "assets/$Ns/textures/block/*.png" })
$n = $Noms.Count; $col = 8; $rows = [int][Math]::Ceiling($n / $col); $T = 96; $CW = 150
$bmp = New-Object System.Drawing.Bitmap ([int]($col * $CW)), ([int]($rows * ($T + 18)))
$g = [System.Drawing.Graphics]::FromImage($bmp); $g.Clear([System.Drawing.Color]::DimGray); $g.InterpolationMode = 'NearestNeighbor'
$font = New-Object System.Drawing.Font 'Arial', 7
for ($i = 0; $i -lt $n; $i++) {
  $nm = $Noms[$i]
  $e = $all | ? { $_.Name -eq "$nm.png" } | Select -First 1
  if (!$e) { $e = $all | ? { $_.FullName -match "/$nm[_/]" } | Select -First 1 }
  $x = ($i % $col) * $CW; $y = [Math]::Floor($i / $col) * ($T + 18)
  if ($e) {
    $ms = New-Object IO.MemoryStream; $s = $e.Open(); $s.CopyTo($ms); $s.Close(); $im = [System.Drawing.Image]::FromStream($ms)
    $g.DrawImage($im, (New-Object System.Drawing.Rectangle ([int]$x), ([int]$y), $T, $T), (New-Object System.Drawing.Rectangle 0, 0, ([Math]::Min(16, $im.Width)), ([Math]::Min(16, $im.Height))), 'Pixel')
    $lab = $e.FullName.Replace("assets/$Ns/textures/block/", '')
  } else { $lab = "?? $nm" }
  $g.DrawString($lab, $font, [System.Drawing.Brushes]::White, [float]$x, [float]($y + $T + 2))
}
$bmp.Save($Sortie); $z.Dispose(); 'ok'
