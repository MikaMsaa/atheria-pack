# Bande du tram (mission 3 de Villes) : x 2000..2560, z -3040..-2700, sur la copie jetable serveur-pilote-essai,
# 0.9.6d + regions-v3o (tram, ligne par le portail ouest, FB3436A4) + plateaux-v3o + delta v3 + datapack 1.4 C1. Monde : pilote-tram-v3o.
# Attend 2 min de verrou libre (abandon apres $AttenteMax min), 6,5 Go libres, aucun java de plus de 1 Go ; prise atomique (CreateNew).
# Le verrou n'est supprime qu'au nettoyage final. Ensuite : couverture_tram.py (hors verrou, sans java) -> couverture-tram-v2.txt.
param([int]$AttenteMax = 120)
$ErrorActionPreference = 'Stop'
$Racine = 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition'
$Ess = "$Racine\outils\serveur-pilote-essai"; $Srv = "$Racine\outils\serveur-ile-test"
$Lock = "$Racine\outils\pause-file.lock"
$Ici = Split-Path -Parent $MyInvocation.MyCommand.Path
$C1 = "$Ici\c1"; $F = "$Ici\facteur"
$BR = "$Racine\outils\atheria-ile-mod\branche-relief"
$Journal = "$Ici\journal-tram.txt"
$Reg = "$Ess\config\atheria_ile\regions.json"
$Monde = 'pilote-tram-v3o'
function J($t) { $l = "$(Get-Date -Format HH:mm:ss) $t"; [IO.File]::AppendAllText($Journal, "$l`r`n"); Write-Host $l }
function Libre { [int]((Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory / 1024) }
function GrosJava { @(Get-Process java, javaw -ErrorAction SilentlyContinue | Where-Object { $_.WorkingSet64 -gt 1GB }).Count }
function LireLog { try { $fs = [IO.File]::Open("$Ess\logs\latest.log", 'Open', 'Read', 'ReadWrite'); $sr = New-Object IO.StreamReader($fs); $t = $sr.ReadToEnd(); $sr.Close(); $t } catch { '' } }
function Contenu { if (Test-Path $Lock) { try { Get-Content $Lock -Raw } catch { '?' } } else { $null } }

J 'debut bande tram'
if (Test-Path "$Ess\$Monde") { J "ABANDON : $Monde existe deja"; exit 1 }
$t0 = Get-Date; $libDep = $null; $dern = Get-Date '2000-01-01'
while ($true) {
  $c = Contenu
  if ($c) { $libDep = $null } elseif (-not $libDep) { $libDep = Get-Date }
  if ($libDep -and ((Get-Date) - $libDep).TotalSeconds -ge 120 -and (GrosJava) -eq 0 -and (Libre) -ge 6500) {
    $pris = $false
    try { $fs = [IO.File]::Open($Lock, 'CreateNew', 'Write'); $b = [Text.Encoding]::UTF8.GetBytes("thread ile bande tram (copie jetable serveur-pilote-essai) PID $PID $(Get-Date -Format s)"); $fs.Write($b, 0, $b.Length); $fs.Close(); $pris = $true } catch { $libDep = $null }
    if ($pris) { break }
  }
  if (((Get-Date) - $dern).TotalSeconds -ge 60) { J "ATTENTE verrou=$(if ($c) { $c } else { 'libre' }) java=$(GrosJava) libre=$(Libre)"; $dern = Get-Date }
  if (((Get-Date) - $t0).TotalMinutes -gt $AttenteMax) { J 'ABANDON attente'; exit 1 }
  Start-Sleep 5
}
J "LOCK_PRIS PID $PID libre=$(Libre)"
$p = $null
try {
  foreach ($fb in "$Reg", "$Ess\mods\atheria-ile.jar", "$Ess\mods\atheria-monde.jar", "$Ess\user_jvm_args.txt") { if (Test-Path "$fb.bak-tram") { throw "$fb.bak-tram existe" }; Copy-Item $fb "$fb.bak-tram" }
  $Xmx = if ((Libre) -ge 7000) { '5G' } else { '4G' }
  [IO.File]::WriteAllText("$Ess\user_jvm_args.txt", "-Xmx$Xmx`r`n"); J "Xmx $Xmx"
  Remove-Item "$Ess\mods\atheria-monde.jar" -Force; Copy-Item "$F\atheria-monde-ile-test-facteur.jar" "$Ess\mods\atheria-monde.jar"
  [IO.File]::WriteAllText("$Ess\config\atheria-facteur.txt", 'rapide')
  Remove-Item "$Ess\mods\atheria-ile.jar" -Force; Copy-Item "$BR\atheria-ile-0.9.6d-ilots-chauds.jar" "$Ess\mods\atheria-ile.jar"
  Copy-Item "$BR\regions-v3o.json" $Reg -Force
  Remove-Item "$Ess\config\atheria_ile\sculptures" -Recurse -Force -ErrorAction SilentlyContinue
  foreach ($s in @('ileA', 'phare', 'z002', 'hum', 'z003', 'z006', 'z001', 'z008', 'z010', 'z013', 'z004', 'z009', 'z011')) { New-Item -ItemType Directory -Force "$Ess\config\atheria_ile\sculptures\$s" | Out-Null; Copy-Item "$Racine\outils\atheria-ile-mod\sculpture\$s\hauteur.png", "$Racine\outils\atheria-ile-mod\sculpture\$s\masque.png" "$Ess\config\atheria_ile\sculptures\$s" }
  Copy-Item "$BR\plateaux-v3o.json" "$Ess\config\atheria_ile\plateaux.json" -Force
  Copy-Item "$Ici\relief_delta_c2.bin" "$Ess\config\atheria_ile\relief_delta.bin" -Force; Copy-Item "$Ici\relief_base.bin" "$Ess\config\atheria_ile\relief_base.bin" -Force
  if (Test-Path "$Ess\pilote") { if (@(Get-ChildItem "$Ess\pilote" -Force).Count -gt 0) { throw 'pilote non vide' }; Remove-Item "$Ess\pilote" }
  New-Item -ItemType Directory "$Ess\pilote" | Out-Null
  Copy-Item "$Srv\sauvegardes\avant-audit-carte\level.dat" "$Ess\pilote\level.dat"
  robocopy "$Srv\ile_test_1\datapacks" "$Ess\pilote\datapacks" /E /NFL /NDL /NJH /NJS /NP | Out-Null
  if (Test-Path "$Srv\ile_test_1\serverconfig") { robocopy "$Srv\ile_test_1\serverconfig" "$Ess\pilote\serverconfig" /E /NFL /NDL /NJH /NJS /NP | Out-Null }
  Remove-Item "$Ess\pilote\datapacks\atheria_ile_datapack.zip" -Force; Copy-Item "$BR\atheria_ile_datapack-1.4-relief-v3-plateau.zip" "$Ess\pilote\datapacks\atheria_ile_datapack.zip"
  & python -I "$C1\appliquer_dp.py" "$Ess\pilote\datapacks\atheria_ile_datapack.zip" "$Racine\outils\atheria-ile-mod\audit-carte\c1-sans-lave\datapack" | Out-Null
  J "tram : ile $((Get-FileHash "$Ess\mods\atheria-ile.jar" -Algorithm MD5).Hash.Substring(0,8)) regions $((Get-FileHash $Reg -Algorithm MD5).Hash.Substring(0,8)) plateaux $((Get-FileHash "$Ess\config\atheria_ile\plateaux.json" -Algorithm MD5).Hash.Substring(0,8)) dp $((Get-FileHash "$Ess\pilote\datapacks\atheria_ile_datapack.zip" -Algorithm MD5).Hash.Substring(0,8))"
  $psi = New-Object Diagnostics.ProcessStartInfo
  $psi.FileName = 'java'; $psi.WorkingDirectory = $Ess
  $psi.Arguments = '@user_jvm_args.txt @libraries/net/neoforged/neoforge/21.1.265/win_args.txt nogui'
  $psi.UseShellExecute = $false; $psi.RedirectStandardInput = $true; $psi.RedirectStandardOutput = $true; $psi.RedirectStandardError = $true
  $p = New-Object Diagnostics.Process; $p.StartInfo = $psi
  $null = $p.Start(); $p.BeginOutputReadLine(); $p.BeginErrorReadLine()
  $ts = Get-Date; J "serveur java=$($p.Id)"; Start-Sleep 25
  while (-not ((LireLog) -match 'Done \(')) { Start-Sleep 5; if ($p.HasExited) { throw 'java sorti au demarrage' }; if (((Get-Date) - $ts).TotalMinutes -gt 10) { throw 'demarrage trop long' } }
  $fin0 = ([regex]::Matches((LireLog), 'Task finished')).Count
  foreach ($c in 'chunky world minecraft:overworld', 'chunky shape rectangle', 'chunky center 2280 -2870', 'chunky radius 280 170', 'chunky start', 'chunky confirm') { $p.StandardInput.WriteLine($c); Start-Sleep 1 }
  $t1 = Get-Date; $minLib = 99999
  while (([regex]::Matches((LireLog), 'Task finished')).Count -le $fin0) {
    Start-Sleep 5
    if ($p.HasExited) { throw 'java sorti' }
    $l = Libre; if ($l -lt $minLib) { $minLib = $l }
    if ($l -lt 400) { throw "RAM $l" }
    if (((Get-Date) - $t1).TotalMinutes -gt 15) { throw 'generation trop longue' }
  }
  J "generation bande tram $([math]::Round(((Get-Date)-$t1).TotalSeconds)) s, RAM libre min $minLib Mo"
  $s0 = ([regex]::Matches((LireLog), 'All chunks are saved')).Count
  $p.StandardInput.WriteLine('save-all flush'); Start-Sleep 10
  $t2 = Get-Date
  while (([regex]::Matches((LireLog), 'All chunks are saved')).Count -le $s0) { Start-Sleep 2; if (((Get-Date) - $t2).TotalSeconds -gt 120) { J 'save-all sans confirmation'; break } }
  J 'save-all flush fait'
  $p.StandardInput.WriteLine('stop'); if (-not $p.WaitForExit(240000)) { J "TUE mon java $($p.Id) (stop bloque apres le save-all)"; $p.Kill() }
  J "arrete code=$($p.ExitCode)"; $p = $null
  Copy-Item "$Ess\logs\latest.log" "$Ici\latest-tram.log" -Force -ErrorAction SilentlyContinue
  Start-Sleep 5
  Move-Item "$Ess\pilote" "$Ess\$Monde"
} catch { J "ERREUR $_" } finally {
  if ($p -and -not $p.HasExited) { $p.StandardInput.WriteLine('stop'); if (-not $p.WaitForExit(240000)) { J "TUE mon java $($p.Id)"; $p.Kill(); Start-Sleep 5 } }
  if (Test-Path "$Ess\pilote\level.dat") { Start-Sleep 3; try { Move-Item "$Ess\pilote" "$Ess\pilote-tram-echec-$(Get-Date -Format HHmmss)" } catch { J 'monde laisse dans pilote' } }
  if (-not (Test-Path "$Ess\pilote")) { New-Item -ItemType Directory "$Ess\pilote" | Out-Null }
  foreach ($fb in "$Reg", "$Ess\mods\atheria-ile.jar", "$Ess\mods\atheria-monde.jar", "$Ess\user_jvm_args.txt") { if (Test-Path "$fb.bak-tram") { Remove-Item $fb -Force -ErrorAction SilentlyContinue; Copy-Item "$fb.bak-tram" $fb; Remove-Item "$fb.bak-tram" } }
  Remove-Item "$Ess\config\atheria_ile\relief_delta.bin", "$Ess\config\atheria_ile\relief_base.bin", "$Ess\config\atheria_ile\plateaux.json" -ErrorAction SilentlyContinue
  Remove-Item "$Ess\config\atheria_ile\sculptures" -Recurse -Force -ErrorAction SilentlyContinue
  J "copie remise : regions $((Get-FileHash $Reg -Algorithm MD5).Hash.Substring(0,8)) ile $((Get-FileHash "$Ess\mods\atheria-ile.jar" -Algorithm MD5).Hash.Substring(0,8)) jvm $((Get-Content "$Ess\user_jvm_args.txt") -join ' ')"
  # nettoyage final : seule etape qui supprime le verrou (et seulement s'il est a moi)
  $c = Contenu
  if ($c -match "bande tram .*PID $PID") { Remove-Item $Lock -Force } else { J "verrou pas a moi ($c) : laisse" }
  J "LOCK_SUPPRIME=$(-not (Test-Path $Lock))"
}
if (Test-Path "$Ess\$Monde\region") {
  $W = "$Ess\$Monde;$Ess\pilote-bis-c22m;$Ess\pilote-v3-colline2;$Srv\ile_test_1"
  & python -I "$Ici\couverture_tram.py" $W '' > "$Ici\couverture-tram-v2.txt" 2>&1
  J "COUVERTURE faite (code $LASTEXITCODE) : couverture-tram-v2.txt"
}
J "FIN_TRAM java=$(GrosJava)"
