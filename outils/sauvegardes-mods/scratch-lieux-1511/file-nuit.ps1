param([string[]]$Series)
# File d'attente de nuit : attend que le PC soit libre (aucun autre java > 1 Go) avant CHAQUE lancement.
$sp = $PSScriptRoot
$old = 'C:\Users\El-Afdal\AppData\Local\Temp\claude\C--Users-El-Afdal-Desktop-Atheria-Zombie-Edition\3b6158cc-eefc-4df2-8769-4b2d767c856c\scratchpad'
$root = 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition'
$bilan = "$sp\recontrole\bilan-nuit.txt"
$lock = "$root\outils\pause-file.lock"
function Attendre {
  # regle partagee : creer le verrou de facon atomique (echoue s'il existe), puis verifier la RAM
  $t0 = Get-Date
  while (((Get-Date) - $t0).TotalMinutes -lt 240) {
    $pris = $false
    try { New-Item -ItemType File -Path $lock -Value "thread batiments $PID $(Get-Date -Format s)" -ErrorAction Stop | Out-Null; $pris = $true } catch {}
    if ($pris) {
      $j = Get-Process java, javaw -ErrorAction SilentlyContinue | ? { $_.WS -gt 1GB }
      if (-not $j) { return $true }
      Remove-Item $lock -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep 30
  }
  return $false
}
function Liberer { Remove-Item $lock -Force -ErrorAction SilentlyContinue }
try {
foreach ($q in ($Series -join ',').Split(',')) {
  if (-not (Attendre)) { "$q : PC occupe depuis 4 h, abandon" | Tee-Object -Append $bilan; break }
  if ($q -eq 'style') {
    Copy-Item "$root\outils\atheria-monde-mod\atheria-monde.jar" "$root\instances\Atheria\minecraft\mods\atheria-monde.jar" -Force
    $t0 = Get-Date
    $r = & "$old\run-test.ps1" -Root $root -World 'ZZ Villes 37' -Script 'zz_villes_test.js' -TimeoutSec 2400
    $log = Get-ChildItem "$old\latest-*.log" | Sort-Object LastWriteTime | Select-Object -Last 1
    $dst = "$sp\recontrole\style"; New-Item -ItemType Directory -Force $dst | Out-Null
    Copy-Item $log.FullName "$dst\journal.log" -Force
    Get-ChildItem "$root\instances\Atheria\minecraft\screenshots\*.png" | ? { $_.LastWriteTime -gt $t0 } | % { Copy-Item $_.FullName "$dst\$($_.Name)" -Force }
    "style : $r ; $((Get-ChildItem "$dst\*.png").Count) captures" | Tee-Object -Append $bilan
    Liberer; continue
  }
  $t0 = Get-Date
  $r = & powershell -NoProfile -ExecutionPolicy Bypass -File "$sp\lancer-serie.ps1" -Quartiers $q
  Liberer
  $dst = "$sp\recontrole\$q"
  New-Item -ItemType Directory -Force $dst | Out-Null
  Get-ChildItem "$root\instances\Atheria\minecraft\screenshots\vit-*.png" | ? { $_.LastWriteTime -gt $t0 } | % { Copy-Item $_.FullName "$dst\$($_.Name)" -Force }
  "$q : $((Get-ChildItem "$dst\*.png").Count) captures, $([int]((Get-Date) - $t0).TotalSeconds)s ; $(($r | Select-String 'OCCUPE|FIN|TIMEOUT|EXITED') -join ' ')" | Tee-Object -Append $bilan
}
} finally { Liberer }
