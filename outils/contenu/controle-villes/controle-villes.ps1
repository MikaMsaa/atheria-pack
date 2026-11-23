param([string]$Monde = 'ZZ Villes 38', [int]$RamMinMo = 5000, [switch]$SansCreation, [switch]$ToutesVilles)
# Cree un monde neuf (serveur dedie) puis lance le controle bloc par bloc des villes ; verrou partage, un seul jeu a la fois.
$sp = $PSScriptRoot
$old = 'C:\Users\El-Afdal\AppData\Local\Temp\claude\C--Users-El-Afdal-Desktop-Atheria-Zombie-Edition\3b6158cc-eefc-4df2-8769-4b2d767c856c\scratchpad'
$root = 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition'
$lock = "$root\outils\pause-file.lock"
$dst = "$sp\controle\$($Monde -replace ' ','-')"
New-Item -ItemType Directory -Force $dst | Out-Null
$bilan = "$dst\bilan.txt"
function Dispo { [int](Get-CimInstance Win32_PerfFormattedData_PerfOS_Memory).AvailableMBytes }
$tenu = $false
$t0 = Get-Date
while (((Get-Date) - $t0).TotalHours -lt 12) {
  try { New-Item -ItemType File -Path $lock -Value "thread batiments controle $PID $(Get-Date -Format s)" -ErrorAction Stop | Out-Null; $tenu = $true } catch {}
  if ($tenu) {
    $j = Get-Process java, javaw -ErrorAction SilentlyContinue | ? { $_.WS -gt 1GB }
    if (-not $j -and (Dispo) -ge $RamMinMo) { break }
    Remove-Item $lock -Force -ErrorAction SilentlyContinue; $tenu = $false
  }
  Start-Sleep 30
}
if (-not $tenu) { "abandon : verrou ou RAM" | Out-File -Append -Encoding utf8 $bilan; exit }
$ws = 'kubejs\data\lostcities\lostcities\worldstyles\atheria.json'
try {
  # variante de test : villes dans tous les biomes, pour voir toutes les architectures (le pack garde le reglage de l'ile)
  if ($ToutesVilles) { foreach ($d in "$root\serveur", "$root\instances\Atheria\minecraft") { Copy-Item "$sp\worldstyle-test-toutes-villes.json" "$d\$ws" -Force } }
  if (-not $SansCreation) {
    if (-not (Test-Path "$old\stop.txt")) { [IO.File]::WriteAllText("$old\stop.txt", '') }
    $m = & "$old\monde-neuf.ps1" -Root $root -Nom $Monde -Seed '12345' -Attente 20
    "creation : $($m -join ' | ')" | Out-File -Append -Encoding utf8 $bilan
    if (-not (Test-Path -LiteralPath "$root\instances\Atheria\minecraft\saves\$Monde\level.dat")) { "monde absent, arret" | Out-File -Append -Encoding utf8 $bilan; exit }
    Start-Sleep 20
  }
  $t1 = Get-Date
  $r = & "$old\run-test.ps1" -Root $root -World $Monde -Script 'zz_villes_controle.js' -TimeoutSec 5400
  $log = Get-ChildItem "$old\latest-*.log" | Sort-Object LastWriteTime | Select-Object -Last 1
  Copy-Item $log.FullName "$dst\journal.log" -Force
  Get-ChildItem "$root\instances\Atheria\minecraft\screenshots\*.png" | ? { $_.LastWriteTime -gt $t1 } | % { Copy-Item $_.FullName "$dst\$($_.Name)" -Force }
  "controle : $($r -join ' ') ; $((Get-ChildItem "$dst\*.png").Count) captures ; $([int]((Get-Date) - $t1).TotalMinutes) min" | Out-File -Append -Encoding utf8 $bilan
} finally { foreach ($d in "$root\serveur", "$root\instances\Atheria\minecraft") { Copy-Item "$root\pack\$ws" "$d\$ws" -Force }; if ($tenu) { Remove-Item $lock -Force -ErrorAction SilentlyContinue } }
