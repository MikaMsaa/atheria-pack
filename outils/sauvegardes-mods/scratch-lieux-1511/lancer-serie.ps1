param([string[]]$Quartiers)
if (Test-Path (Join-Path $PSScriptRoot "suspendre-series.flag")) { "SUSPENDU"; exit }
$sp = $PSScriptRoot
$old = 'C:\Users\El-Afdal\AppData\Local\Temp\claude\C--Users-El-Afdal-Desktop-Atheria-Zombie-Edition\3b6158cc-eefc-4df2-8769-4b2d767c856c\scratchpad'
$utf8 = New-Object Text.UTF8Encoding($false)
New-Item -ItemType Directory -Force "$sp\export" | Out-Null
foreach ($q in $Quartiers) {
  $t = New-Object Text.StringBuilder
  [void]$t.Append([IO.File]::ReadAllText("$sp\zz_vitrine.js")); [void]$t.Append("`n")
  $fin = 48; if ($q -eq "bt2") { $fin = 49 }; if ($q -eq "bt3") { $fin = 50 }; if ($q -eq "vr2") { $fin = 51 }; if ($q -eq "vr3") { $fin = 52 }; if ($q -eq "vh") { $fin = 53 }; if ($q -eq "vh2") { $fin = 54 }; if ($q -eq "vh3") { $fin = 55 }; if ($q -eq "vh4") { $fin = 56 }; if ($q -eq "mts") { $fin = 57 }; if ($q -eq "mts2") { $fin = 58 }; if ($q -eq "rail4") { $fin = 59 }; if ($q -eq "amb") { $fin = 60 }; if ($q -eq "bc") { $fin = 61 }; if ($q -eq "vo") { $fin = 62 }; if ($q -eq "rail5") { $fin = 63 }; if ($q -eq "gares") { $fin = 64 }; if ($q -eq "pilote") { $fin = 65 }; if ($q -eq "lieux") { $fin = 66 }; if ($q -eq "port") { $fin = 67 }; if ($q -eq "rue") { $fin = 68 }; if ($q -eq "station") { $fin = 69 }; if ($q -eq "rn1") { $fin = 70 }; for ($i = 8; $i -le $fin; $i++) { $f = "$sp\zz_vitrine_lot$i.js"; if (Test-Path $f) { [void]$t.Append([IO.File]::ReadAllText($f)); [void]$t.Append("`n") } }
  [void]$t.Append([IO.File]::ReadAllText("$sp\zz_choix_$q.js"))
  [IO.File]::WriteAllText("$old\zz_vitrine.js", $t.ToString(), $utf8)
  $r = & "$old\run-test-vit.ps1" -Root 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition' -World 'ZZ Bancs Vitrine' -Script 'zz_vitrine.js' -TimeoutSec 1800
  $log = Get-ChildItem "$old\latest-*.log" | Sort-Object LastWriteTime | Select-Object -Last 1
  if ($log) { Copy-Item -LiteralPath $log.FullName -Destination (Join-Path $sp "exportue-$q.log") -Force }
  "$q : $r" | Tee-Object -Append "$sp\export\bilan.txt"
}
