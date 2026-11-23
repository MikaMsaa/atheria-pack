param([string]$Monde = 'ZZ Pilote Reel 1', [string]$Graine = '6501', [int]$RamMinMo = 5500, [int]$AttenteMin = 900)
# Essai du pilote a l'echelle reelle dans Lost Cities : fichiers d'essai poses le temps du test (instance + serveur de test),
# ville predefinie d'essai a la chunk 1500,1500, monde ZZ neuf, captures, puis retrait de tout ce qui a ete pose.
$sp = $PSScriptRoot
$old = 'C:\Users\El-Afdal\AppData\Local\Temp\claude\C--Users-El-Afdal-Desktop-Atheria-Zombie-Edition\3b6158cc-eefc-4df2-8769-4b2d767c856c\scratchpad'
$root = 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition'
$lock = "$root\outils\pause-file.lock"
$inst = "$root\instances\Atheria\minecraft"
$srv = "$root\serveur"
$essai = "$env:TEMP\pilote-essai\kubejs\data\lostcities\lostcities"
$t0 = Get-Date; $tenu = $false; $poses = @(); $script:remis = @()
function Dispo { [int](Get-CimInstance Win32_PerfFormattedData_PerfOS_Memory).AvailableMBytes }
try {
  while (((Get-Date) - $t0).TotalMinutes -lt $AttenteMin) {
    try { New-Item -ItemType File -Path $lock -Value "thread batiments essai-pilote $PID $(Get-Date -Format s)" -ErrorAction Stop | Out-Null; $tenu = $true } catch {}
    if ($tenu) {
      $j = Get-Process java, javaw -ErrorAction SilentlyContinue | ? { $_.WS -gt 1GB }
      if (-not $j -and (Dispo) -ge $RamMinMo) { break }
      Remove-Item $lock -Force; $tenu = $false
    }
    Start-Sleep 30
  }
  if (-not $tenu) { "ABANDON attente $(Dispo) Mo"; exit }
  "LANCE $(Get-Date -Format s) RAM $(Dispo) Mo"
  foreach ($d in $inst, $srv) {
    $lc = "$d\kubejs\data\lostcities\lostcities"
    foreach ($sous in 'parts', 'buildings', 'multibuildings', 'predefinedcities') {
      New-Item -ItemType Directory -Force "$lc\$sous" | Out-Null
      Get-ChildItem "$essai\$sous" -Filter '*.json' -ErrorAction SilentlyContinue | ? { $_.Name -like 'ath_v_hr_*' -or $_.Name -like 'ath_zz_*' -or $_.Name -eq 'ath_mamoudzou_haussmann.json' } | % {
        $cible = "$lc\$sous\$($_.Name)"
        if (Test-Path $cible) {
          if ($_.Name -ne 'ath_mamoudzou_haussmann.json') { throw "existe deja : $cible" }
          $sv = "$env:TEMP\pilote-essai-sauve\$($d.Length)-$($_.Name)"; New-Item -ItemType Directory -Force (Split-Path $sv) | Out-Null
          Copy-Item $cible $sv -Force; $script:remis += , @($sv, $cible)
        } else { $poses += $cible }
        Copy-Item $_.FullName $cible -Force
      }
    }
  }
  "fichiers poses : $($poses.Count)"
  & powershell -NoProfile -ExecutionPolicy Bypass -File "$old\monde-neuf.ps1" -Root $root -Nom $Monde -Seed $Graine
  Copy-Item "$sp\zz_pilote_lc.js" "$old\zz_pilote_lc.js" -Force
  $debut = Get-Date
  & powershell -NoProfile -ExecutionPolicy Bypass -File "$old\run-test-vit.ps1" -Root $root -World $Monde -TimeoutSec 2400 -Script 'zz_pilote_lc.js'
  $dest = "$sp\recontrole\pilote-lc"; New-Item -ItemType Directory -Force $dest | Out-Null
  Get-ChildItem "$inst\screenshots" -Filter 'vit-*.png' | ? { $_.LastWriteTime -gt $debut } | Move-Item -Destination $dest -Force
  $log = Get-ChildItem "$old\latest-*.log" | Sort-Object LastWriteTime | Select-Object -Last 1
  if ($log) { Copy-Item -LiteralPath $log.FullName -Destination "$sp\pilote-lc.log" -Force }
  "FINI $(Get-Date -Format s)"
} finally {
  foreach ($f in $poses) { Remove-Item -LiteralPath $f -Force -ErrorAction SilentlyContinue }
  foreach ($r in $script:remis) { Copy-Item -LiteralPath $r[0] -Destination $r[1] -Force; "remis : $($r[1])" }
  if ($poses.Count) { "fichiers d'essai retires : $($poses.Count)" }
  if ($tenu -and (Test-Path $lock) -and ((Get-Content $lock -Raw) -match " $PID ")) { Remove-Item $lock -Force }
}
