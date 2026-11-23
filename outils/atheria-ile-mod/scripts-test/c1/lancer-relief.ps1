# Validation C1 (Petite-Terre sans lave) sur la copie jetable outils\serveur-pilote-essai. Verrou tenu tout du long.
param([int]$LibreMin = 6000, [switch]$GarderVerrou)
$ErrorActionPreference = 'Stop'
$Racine = 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition'
$Ess = "$Racine\outils\serveur-pilote-essai"; $Srv = "$Racine\outils\serveur-ile-test"
$Lock = "$Racine\outils\pause-file.lock"
$Ici = Split-Path -Parent $MyInvocation.MyCommand.Path
$F = Join-Path (Split-Path -Parent $Ici) 'facteur'
$Journal = Join-Path $Ici 'journal-relief.txt'
$BR = "$Racine\outils\atheria-ile-mod\branche-relief"
function J($t) { $l = "$(Get-Date -Format HH:mm:ss) $t"; [IO.File]::AppendAllText($Journal, "$l`r`n"); Write-Host $l }
function Libre { [int]((Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory / 1024) }
function GrosJava { @(Get-Process java, javaw -ErrorAction SilentlyContinue | Where-Object { $_.WorkingSet64 -gt 1GB }).Count }
function LireLog { try { $fs = [IO.File]::Open("$Ess\logs\latest.log", 'Open', 'Read', 'ReadWrite'); $sr = New-Object IO.StreamReader($fs); $t = $sr.ReadToEnd(); $sr.Close(); $t } catch { '' } }
function NouveauMonde($garde) {
  if (Test-Path "$Ess\$garde") { throw "$garde existe" }
  Move-Item "$Ess\pilote" "$Ess\$garde"; New-Item -ItemType Directory "$Ess\pilote" | Out-Null
  Copy-Item "$Srv\sauvegardes\avant-audit-carte\level.dat" "$Ess\pilote\level.dat"
  robocopy "$Srv\ile_test_1\datapacks" "$Ess\pilote\datapacks" /E /NFL /NDL /NJH /NJS /NP | Out-Null
  if (Test-Path "$Srv\ile_test_1\serverconfig") { robocopy "$Srv\ile_test_1\serverconfig" "$Ess\pilote\serverconfig" /E /NFL /NDL /NJH /NJS /NP | Out-Null }
}
function Serveur($nom, $taches) {
  $psi = New-Object Diagnostics.ProcessStartInfo
  $psi.FileName = 'java'; $psi.WorkingDirectory = $Ess
  $psi.Arguments = '@user_jvm_args.txt @libraries/net/neoforged/neoforge/21.1.265/win_args.txt nogui'
  $psi.UseShellExecute = $false; $psi.RedirectStandardInput = $true; $psi.RedirectStandardOutput = $true; $psi.RedirectStandardError = $true
  $p = New-Object Diagnostics.Process; $p.StartInfo = $psi
  $null = $p.Start(); $p.BeginOutputReadLine(); $p.BeginErrorReadLine()
  $ts = Get-Date; J "$nom java=$($p.Id)"; Start-Sleep 25
  try {
    while (-not ((LireLog) -match 'Done \(')) { Start-Sleep 5; if ($p.HasExited) { throw 'java sorti au demarrage' }; if (((Get-Date) - $ts).TotalMinutes -gt 10) { throw 'demarrage trop long' } }
    J "$nom pret"
    $fin0 = ([regex]::Matches((LireLog), 'Task finished')).Count
    foreach ($t in $taches) {
      $x, $z, $r = $t -split ' '
      foreach ($c in 'chunky world minecraft:overworld', 'chunky shape square', "chunky center $x $z", "chunky radius $r", 'chunky start', 'chunky confirm') { $p.StandardInput.WriteLine($c); Start-Sleep 1 }
      $t1 = Get-Date
      while (([regex]::Matches((LireLog), 'Task finished')).Count -le $fin0) {
        Start-Sleep 5
        if ($p.HasExited) { throw 'java sorti' }
        if ((Libre) -lt 300) { throw "RAM $(Libre)" }
        if (((Get-Date) - $t1).TotalMinutes -gt 12) { throw "tache $t trop longue" }
      }
      $fin0++; J "$nom tache $t finie en $([math]::Round(((Get-Date)-$t1).TotalSeconds)) s"
    }
  } finally {
    if (-not $p.HasExited) { $p.StandardInput.WriteLine('stop'); if (-not $p.WaitForExit(180000)) { J "TUE $($p.Id)"; $p.Kill() } }
    J "$nom arrete code=$($p.ExitCode)"
  }
}
J 'debut C1'
while ($true) {
  $pris = $false
  if (-not (Test-Path $Lock) -and (GrosJava) -eq 0 -and (Libre) -ge $LibreMin) {
    try { $fs = [IO.File]::Open($Lock, 'CreateNew', 'Write'); $b = [Text.Encoding]::UTF8.GetBytes("thread ile (banc relief avant/apres, copie jetable) PID $PID $(Get-Date -Format s)"); $fs.Write($b, 0, $b.Length); $fs.Close(); $pris = $true } catch { }
  }
  if ($pris) { break }
  J "ATTENTE verrou=$(if (Test-Path $Lock) { Get-Content $Lock -Raw } else { 'libre' }) java=$(GrosJava) libre=$(Libre)"
  Start-Sleep 30
}
J "LOCK_PRIS PID $PID"
$Reg = "$Ess\config\atheria_ile\regions.json"
$sauve = @{}
try {
  # copie jetable alignee sur serveur-ile-test (jar ile, regions) + correctif FacteurVille rapide ; sauvegardes pour retour
  foreach ($fb in "$Reg", "$Ess\mods\atheria-ile.jar", "$Ess\mods\atheria-monde.jar") { if (-not (Test-Path "$fb.bak-c1")) { Copy-Item $fb "$fb.bak-c1" } }
  Remove-Item "$Ess\mods\atheria-ile.jar" -Force -ErrorAction SilentlyContinue; Copy-Item "$Srv\mods\atheria-ile.jar" "$Ess\mods\atheria-ile.jar"
  Remove-Item "$Ess\mods\atheria-monde.jar" -Force -ErrorAction SilentlyContinue; Copy-Item "$F\atheria-monde-ile-test-facteur.jar" "$Ess\mods\atheria-monde.jar"
  [IO.File]::WriteAllText("$Ess\config\atheria-facteur.txt", 'rapide')
  Copy-Item "$Srv\config\atheria_ile\regions.json" $Reg -Force
  J "copie : ile $((Get-FileHash "$Ess\mods\atheria-ile.jar" -Algorithm MD5).Hash) regions $((Get-FileHash $Reg -Algorithm MD5).Hash)"
  $points = '3312 -1248 96', '240 -5712 96', '-3216 3264 96', '3408 480 96', '-288 -3504 96', '-416 1616 96', '2960 -904 96'
  # A : mod actuel + C1 (reference)
  NouveauMonde 'pilote-garde-relief'
  & python -I "$Ici\regions_c1.py" $Reg
  & python -I "$Ici\appliquer_dp.py" "$Ess\pilote\datapacks\atheria_ile_datapack.zip" "$Racine\outils\atheria-ile-mod\audit-carte\c1-sans-lave\datapack"
  Serveur 'REF' $points
  # B : branche relief 0.8.0
  NouveauMonde 'pilote-relief-ref'
  Copy-Item "$BR\regions-relief-test.json" $Reg -Force
  Remove-Item "$Ess\mods\atheria-ile.jar" -Force; Copy-Item "$BR\atheria-ile-0.8.0-relief.jar" "$Ess\mods\atheria-ile.jar"
  Remove-Item "$Ess\pilote\datapacks\atheria_ile_datapack.zip" -Force; Copy-Item "$BR\atheria_ile_datapack-1.1-relief.zip" "$Ess\pilote\datapacks\atheria_ile_datapack.zip"
  & python -I "$Ici\appliquer_dp.py" "$Ess\pilote\datapacks\atheria_ile_datapack.zip" "$Racine\outils\atheria-ile-mod\audit-carte\c1-sans-lave\datapack"
  J "B : ile $((Get-FileHash "$Ess\mods\atheria-ile.jar" -Algorithm MD5).Hash) regions $((Get-FileHash $Reg -Algorithm MD5).Hash)"
  Serveur 'RELIEF' $points
  J 'fini'
} catch { J "ERREUR $_" } finally {
  Copy-Item "$Reg.bak-c1" $Reg -Force
  Remove-Item "$Ess\mods\atheria-ile.jar" -Force -ErrorAction SilentlyContinue; Copy-Item "$Ess\mods\atheria-ile.jar.bak-c1" "$Ess\mods\atheria-ile.jar"
  Remove-Item "$Ess\mods\atheria-monde.jar" -Force -ErrorAction SilentlyContinue; Copy-Item "$Ess\mods\atheria-monde.jar.bak-c1" "$Ess\mods\atheria-monde.jar"
  J "copie remise : regions $((Get-FileHash $Reg -Algorithm MD5).Hash)"
  if ($GarderVerrou -and -not (Select-String -Path $Journal -Pattern "ERREUR" -Quiet)) { J "VERROU_GARDE pour les captures" }
  else {
  Remove-Item $Lock -Force -ErrorAction SilentlyContinue
  J "LOCK_SUPPRIME=$(-not (Test-Path $Lock))"
  }
}
