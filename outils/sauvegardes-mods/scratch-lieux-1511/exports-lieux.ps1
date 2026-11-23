$sp = $PSScriptRoot
$root = 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition'
$gen = "$root\instances\Atheria\minecraft\saves\ZZ Bancs Vitrine\generated\atheria_monde\structures"
$dest = "$root\outils\atheria-monde-mod\ressources\data\atheria_monde\structure"
New-Item -ItemType Directory -Force $dest | Out-Null
foreach ($q in 'rue', 'rn1', 'port', 'station') {
  & "$sp\banc-vh.ps1" -Series $q
  "$q code $LASTEXITCODE $(Get-Date -Format s)"
  Select-String -Path "$sp\exportue-$q.log" -Pattern '\[EXPT\]' | Select-Object -First 4 | % { $_.Line }
}
Get-ChildItem $gen -Filter 'lieu_*.nbt' | % { Copy-Item $_.FullName $dest -Force; "copie $($_.Name) $($_.Length) $($_.LastWriteTime)" }
foreach ($q in 'rue', 'rn1', 'port', 'station') { Copy-Item "$sp\zz_choix_$q.orig.js" "$sp\zz_choix_$q.js" -Force }
"FIN EXPORTS $(Get-Date -Format s)"
