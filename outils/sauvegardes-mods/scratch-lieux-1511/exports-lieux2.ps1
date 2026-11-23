$sp = $PSScriptRoot
$root = 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition'
$gen = "$root\instances\Atheria\minecraft\saves\ZZ Bancs Vitrine\generated\atheria_monde\structures"
$dest = "$sp\modeles-mission2"
New-Item -ItemType Directory -Force $dest | Out-Null
& "$sp\banc-vh.ps1" -Series lieux
"lieux code $LASTEXITCODE $(Get-Date -Format s)"
Select-String -Path "$root\instances\Atheria\minecraft\logs\kubejs\server.log" -Pattern '\[EXPT\]' | % { $_.Line }
Get-ChildItem $gen -Filter 'lieu_*.nbt' | ? { $_.Name -match 'pilote|centre|camp' } | % { Copy-Item $_.FullName $dest -Force; "copie $($_.Name) $($_.Length) $($_.LastWriteTime)" }
Copy-Item "$sp\zz_choix_lieux.orig.js" "$sp\zz_choix_lieux.js" -Force
"FIN $(Get-Date -Format s)"
