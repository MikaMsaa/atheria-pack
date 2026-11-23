param([string[]]$Series)
$sp = $PSScriptRoot
$shots = 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition\instances\Atheria\minecraft\screenshots'
foreach ($q in ($Series -join ',').Split(',')) {
  $t0 = Get-Date
  & powershell -NoProfile -ExecutionPolicy Bypass -File "$sp\lancer-serie.ps1" -Quartiers $q | Out-Null
  $dst = "$sp\recontrole\$q"
  New-Item -ItemType Directory -Force $dst | Out-Null
  Get-ChildItem "$shots\vit-*.png" | Where-Object { $_.LastWriteTime -gt $t0 } | ForEach-Object { Copy-Item $_.FullName "$dst\$($_.Name)" -Force }
  "$q : $((Get-ChildItem "$dst\*.png").Count) captures, $([int]((Get-Date) - $t0).TotalSeconds)s" | Tee-Object -Append "$sp\recontrole\bilan.txt"
}
