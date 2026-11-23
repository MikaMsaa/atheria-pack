param([string[]]$Quartiers)
$sp = $PSScriptRoot
$old = 'C:\Users\El-Afdal\AppData\Local\Temp\claude\C--Users-El-Afdal-Desktop-Atheria-Zombie-Edition\3b6158cc-eefc-4df2-8769-4b2d767c856c\scratchpad'
$utf8 = New-Object Text.UTF8Encoding($false)
New-Item -ItemType Directory -Force "$sp\export" | Out-Null
foreach ($q in $Quartiers) {
  $t = New-Object Text.StringBuilder
  [void]$t.Append([IO.File]::ReadAllText("$sp\zz_vitrine.js")); [void]$t.Append("`n")
  for ($i = 8; $i -le 42; $i++) { $f = "$sp\zz_vitrine_lot$i.js"; if (Test-Path $f) { [void]$t.Append([IO.File]::ReadAllText($f)); [void]$t.Append("`n") } }
  [void]$t.Append([IO.File]::ReadAllText("$sp\zz_exp_$q.js"))
  [IO.File]::WriteAllText("$old\zz_vitrine.js", $t.ToString(), $utf8)
  $r = & "$old\run-test.ps1" -Root 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition' -World 'ZZ Bancs Vitrine' -Script 'zz_vitrine.js' -TimeoutSec 1800
  $log = Get-ChildItem "$old\latest-*.log" | Sort-Object LastWriteTime | Select-Object -Last 1
  Copy-Item $log.FullName "$sp\export\$q.log" -Force
  "$q : $r" | Tee-Object -Append "$sp\export\bilan.txt"
}
