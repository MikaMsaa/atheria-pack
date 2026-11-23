param([string]$Series, [int]$RamMinMo = 9000, [int]$AttenteMin = 2160)
# File d'export : un seul jeu a la fois, verrou partage, et attente d'assez de RAM disponible avant chaque lancement.
$sp = $PSScriptRoot
$old = 'C:\Users\El-Afdal\AppData\Local\Temp\claude\C--Users-El-Afdal-Desktop-Atheria-Zombie-Edition\3b6158cc-eefc-4df2-8769-4b2d767c856c\scratchpad'
$root = 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition'
$lock = "$root\outils\pause-file.lock"
$bilan = "$sp\export\bilan.txt"
$utf8 = New-Object Text.UTF8Encoding($false)
New-Item -ItemType Directory -Force "$sp\export" | Out-Null
function Dispo { [int](Get-CimInstance Win32_PerfFormattedData_PerfOS_Memory).AvailableMBytes }
function Attendre {
  $t0 = Get-Date; $note = $false
  while (((Get-Date) - $t0).TotalMinutes -lt $AttenteMin) {
    if (Test-Path "$sp\suspendre-series.flag") { return $false }
    $pris = $false
    try { New-Item -ItemType File -Path $lock -Value "thread batiments export $PID $(Get-Date -Format s)" -ErrorAction Stop | Out-Null; $pris = $true } catch {}
    if ($pris) {
      $j = Get-Process java, javaw -ErrorAction SilentlyContinue | ? { $_.WS -gt 1GB }
      $d = Dispo
      if (-not $j -and $d -ge $RamMinMo) { $script:tenu = $true; return $true }
      Remove-Item $lock -Force -ErrorAction SilentlyContinue
      if (-not $note -and -not $j) { "attente RAM : $d Mo disponibles (minimum $RamMinMo) $(Get-Date -Format HH:mm)" | Out-File -Append -Encoding utf8 $bilan; $note = $true }
    }
    Start-Sleep 30
  }
  return $false
}
$script:tenu = $false
try {
  foreach ($q in $Series.Split(',')) {
    if (-not (Attendre)) { "$q : abandon (RAM insuffisante ou suspendu) $(Get-Date -Format HH:mm)" | Out-File -Append -Encoding utf8 $bilan; break }
    $t = New-Object Text.StringBuilder
    [void]$t.Append([IO.File]::ReadAllText("$sp\zz_vitrine.js")); [void]$t.Append("`n")
    for ($i = 8; $i -le 65; $i++) { $f = "$sp\zz_vitrine_lot$i.js"; if (Test-Path $f) { [void]$t.Append([IO.File]::ReadAllText($f)); [void]$t.Append("`n") } }
    [void]$t.Append([IO.File]::ReadAllText("$sp\zz_exp_$q.js"))
    [IO.File]::WriteAllText("$old\zz_vitrine.js", $t.ToString(), $utf8)
    $d0 = Dispo; $t0 = Get-Date
    $r = & "$old\run-test.ps1" -Root $root -World 'ZZ Bancs Vitrine' -Script 'zz_vitrine.js' -TimeoutSec 2400
    Remove-Item $lock -Force -ErrorAction SilentlyContinue; $script:tenu = $false
    $log = Get-ChildItem "$old\latest-*.log" | Sort-Object LastWriteTime | Select-Object -Last 1
    Copy-Item $log.FullName "$sp\export\$q.log" -Force
    $nL = (Select-String -Path "$sp\export\$q.log" -Pattern '\[EXP\] L ' -SimpleMatch:$false).Count
    "$q : $(($r | Select-String 'FIN|TIMEOUT|BLOQUE') -join ' ') ; $nL lots exportes ; $([int]((Get-Date) - $t0).TotalSeconds)s ; RAM dispo avant $d0 Mo" | Out-File -Append -Encoding utf8 $bilan
    Start-Sleep 60
  }
} finally { if ($script:tenu) { Remove-Item $lock -Force -ErrorAction SilentlyContinue } }
