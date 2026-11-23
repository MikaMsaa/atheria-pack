param([string]$Xmx = '4G')
# Extension 3 de pilote-v3-colline2 (x 2330..3900 : bande nord z -2750..-1800 et bande sud z -760..200, 4 rectangles), exactement la meme config que colline2 ; rien de l'existant modifie ; l'arbre retire doit rester absent.
# S'execute SOUS le verrou deja tenu par le thread ile (fichier tenu ouvert) : ce script ne prend ni ne supprime le verrou.
$ErrorActionPreference = 'Stop'
$Racine = 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition'
$Ess = "$Racine\outils\serveur-pilote-essai"; $Srv = "$Racine\outils\serveur-ile-test"
$Lock = "$Racine\outils\pause-file.lock"
$Ici = Split-Path -Parent $MyInvocation.MyCommand.Path
$SP = $Ici; $C1 = "$SP\c1"; $F = "$SP\facteur"
$BR = "$Racine\outils\atheria-ile-mod\branche-relief"
$Journal = "$Ici\journal-sud-colline2.txt"
$Reg = "$Ess\config\atheria_ile\regions.json"
$Monde = 'pilote-v3-colline2'
function J($t) { $l = "$(Get-Date -Format HH:mm:ss) $t"; [IO.File]::AppendAllText($Journal, "$l`r`n"); Write-Host $l }
function Libre { [int]((Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory / 1024) }
function GrosJava { @(Get-Process java, javaw -ErrorAction SilentlyContinue | Where-Object { $_.WorkingSet64 -gt 1GB }).Count }
function LireLog { try { $fs = [IO.File]::Open("$Ess\logs\latest.log", 'Open', 'Read', 'ReadWrite'); $sr = New-Object IO.StreamReader($fs); $t = $sr.ReadToEnd(); $sr.Close(); $t } catch { '' } }

J "debut bande sud (8 rectangles, Xmx $Xmx)"
$c = if (Test-Path $Lock) { Get-Content $Lock -Raw } else { '' }
if ($c -notmatch '^thread ile') { J "VERROU pas a moi : '$c' ; arret"; exit 1 }
$t0 = Get-Date
while ((GrosJava) -gt 0) { if (((Get-Date) - $t0).TotalMinutes -gt 3) { J 'java etranger encore la ; arret'; exit 1 }; Start-Sleep 5 }
$lib0 = Libre
$t6 = Get-Date; while ($lib0 -lt 6500 -and ((Get-Date) - $t6).TotalSeconds -lt 60) { Start-Sleep 5; $lib0 = Libre }
if ($lib0 -lt 6500) { J "RAM $lib0 < 6500 ; arret"; exit 1 }
J "verrou tenu ($($c.Trim())) libre=$lib0"
$p = $null
try {
  foreach ($fb in "$Reg", "$Ess\mods\atheria-ile.jar", "$Ess\mods\atheria-monde.jar", "$Ess\user_jvm_args.txt") { Copy-Item $fb "$fb.bak-v3c" -Force }
  [IO.File]::WriteAllText("$Ess\user_jvm_args.txt", "-Xmx$Xmx`r`n"); J "Xmx $Xmx"
  Remove-Item "$Ess\mods\atheria-monde.jar" -Force; Copy-Item "$F\atheria-monde-ile-test-facteur.jar" "$Ess\mods\atheria-monde.jar"
  [IO.File]::WriteAllText("$Ess\config\atheria-facteur.txt", 'rapide')
  Remove-Item "$Ess\config\atheria_ile\plateaux.json" -ErrorAction SilentlyContinue
  Remove-Item "$Ess\mods\atheria-ile.jar" -Force; Copy-Item "$BR\atheria-ile-0.9.0-relief-v3c.jar" "$Ess\mods\atheria-ile.jar"
  Copy-Item "$BR\regions-v3c.json" $Reg -Force
  Copy-Item "$Ici\relief_delta_c2.bin" "$Ess\config\atheria_ile\relief_delta.bin" -Force
  Copy-Item "$Ici\relief_base.bin" "$Ess\config\atheria_ile\relief_base.bin" -Force
  if (-not (Test-Path "$Ess\$Monde\level.dat")) { throw "$Monde absent" }
  if (Test-Path "$Ess\pilote") { if (@(Get-ChildItem "$Ess\pilote" -Force).Count -gt 0) { throw 'pilote non vide' }; Remove-Item "$Ess\pilote" }
  & python -I "$Ici\empreinte2.py" "$Ess\$Monde" "$Ici\empreinte4-avant.json" | ForEach-Object { J "EMPREINTE avant $_" }
  Move-Item "$Ess\$Monde" "$Ess\pilote"
  $dpH = (Get-FileHash "$Ess\pilote\datapacks\atheria_ile_datapack.zip" -Algorithm MD5).Hash.Substring(0,8); J "datapack du monde (celui de colline2, garde) $dpH"
  J "copie : ile $((Get-FileHash "$Ess\mods\atheria-ile.jar" -Algorithm MD5).Hash.Substring(0,8)) regions $((Get-FileHash $Reg -Algorithm MD5).Hash.Substring(0,8)) delta $((Get-FileHash "$Ess\config\atheria_ile\relief_delta.bin" -Algorithm MD5).Hash.Substring(0,8))"

  $psi = New-Object Diagnostics.ProcessStartInfo
  $psi.FileName = 'java'; $psi.WorkingDirectory = $Ess
  $psi.Arguments = '@user_jvm_args.txt @libraries/net/neoforged/neoforge/21.1.265/win_args.txt nogui'
  $psi.UseShellExecute = $false; $psi.RedirectStandardInput = $true; $psi.RedirectStandardOutput = $true; $psi.RedirectStandardError = $true
  $p = New-Object Diagnostics.Process; $p.StartInfo = $psi
  $null = $p.Start(); $p.BeginOutputReadLine(); $p.BeginErrorReadLine()
  $ts = Get-Date; J "serveur java=$($p.Id)"; Start-Sleep 25
  while (-not ((LireLog) -match 'Done \(')) { Start-Sleep 5; if ($p.HasExited) { throw 'java sorti au demarrage' }; if (((Get-Date) - $ts).TotalMinutes -gt 10) { throw 'demarrage trop long' } }
  J 'serveur pret'
  foreach ($c in 'ile sonde_relief 2374 -1282', 'ile sonde_relief 3400 -1250', 'ile sonde_relief 2200 -1500') { $p.StandardInput.WriteLine($c); Start-Sleep 3 }
  $t3 = Get-Date
  while (-not ((LireLog) -match '\[SONDE_RELIEF\] 2200,-1500')) { Start-Sleep 3; if ($p.HasExited) { throw 'java sorti pendant la sonde' }; if (((Get-Date) - $t3).TotalSeconds -gt 240) { J 'sonde sans reponse en 240 s'; break } }
  # la 1re commande peut etre avalee juste apres le demarrage : on redemande le sommet toutes les 20 s (2 min au plus)
  $t4 = Get-Date
  while (-not ((LireLog) -match '\[SONDE_RELIEF\] 2374,-1282')) {
    if (((Get-Date) - $t4).TotalSeconds -gt 120) { J 'sommet sans reponse en 120 s'; break }
    J 'sommet : sonde redemandee'; $p.StandardInput.WriteLine('ile sonde_relief 2374 -1282')
    $t5 = Get-Date; while (-not ((LireLog) -match '\[SONDE_RELIEF\] 2374,-1282') -and ((Get-Date) - $t5).TotalSeconds -lt 20) { Start-Sleep 2; if ($p.HasExited) { throw 'java sorti pendant la sonde' } }
  }
  Start-Sleep 2
  $sondes = @([regex]::Matches((LireLog), '\[SONDE_RELIEF\][^\r\n]*') | ForEach-Object { $_.Value } | Select-Object -Unique)
  $sondes | ForEach-Object { J $_ }
  $h = [regex]::Match(($sondes -join "`n"), '2374,-1282[^\n]*hauteur=(\d+)')
  $hs = if ($h.Success) { [int]$h.Groups[1].Value } else { -1 }
  J "SOMMET hauteur=$hs (vise 132)"
  if ($hs -lt 128 -or $hs -gt 140) { J 'COLLINE_ABSENTE : arret sans generation'; throw 'colline absente' }
  # 4 rectangles successifs (nord ouest, nord est, sud ouest, sud est) avec save-all entre chaque pour limiter le pic memoire
  $tg = Get-Date
  foreach ($rect in @(@('2526 -520', '197 240', 'sud 1 x 2329..2723 z -760..-280'), @('2919 -520', '197 240', 'sud 2 x 2722..3116 z -760..-280'), @('3312 -520', '197 240', 'sud 3 x 3115..3509 z -760..-280'), @('3705 -520', '197 240', 'sud 4 x 3508..3902 z -760..-280'), @('2526 -40', '197 240', 'sud 5 x 2329..2723 z -280..200'), @('2919 -40', '197 240', 'sud 6 x 2722..3116 z -280..200'), @('3312 -40', '197 240', 'sud 7 x 3115..3509 z -280..200'), @('3705 -40', '197 240', 'sud 8 x 3508..3902 z -280..200'))) {
    $fin0 = ([regex]::Matches((LireLog), 'Task finished')).Count
    foreach ($c in 'chunky world minecraft:overworld', 'chunky shape rectangle', "chunky center $($rect[0])", "chunky radius $($rect[1])", 'chunky start', 'chunky confirm') { $p.StandardInput.WriteLine($c); Start-Sleep 1 }
    $t1 = Get-Date
    while (([regex]::Matches((LireLog), 'Task finished')).Count -le $fin0) {
      Start-Sleep 5
      if ($p.HasExited) { throw 'java sorti' }
      if ((Libre) -lt 400) { throw "garde RAM $(Libre) Mo" }
      if (((Get-Date) - $t1).TotalMinutes -gt 9) { throw "rectangle $($rect[2]) trop long (9 min)" }
    }
    J "RECTANGLE $($rect[2]) fini en $([math]::Round(((Get-Date)-$t1).TotalSeconds)) s libre=$(Libre)"
    $s0 = ([regex]::Matches((LireLog), 'All chunks are saved')).Count
    $p.StandardInput.WriteLine('save-all flush'); Start-Sleep 5
    $t2 = Get-Date
    while (([regex]::Matches((LireLog), 'All chunks are saved')).Count -le $s0) { Start-Sleep 2; if (((Get-Date) - $t2).TotalSeconds -gt 120) { J 'save-all sans confirmation en 120 s'; break } }
  }
  J "GENERATION finie en $([math]::Round(((Get-Date)-$tg).TotalSeconds)) s (bande sud x 2330..3900, z -760..200, 8 rectangles)"
  # arbre deja retire : aucune commande ici, controle hors ligne apres
  $s0 = ([regex]::Matches((LireLog), 'All chunks are saved')).Count
  $p.StandardInput.WriteLine('save-all flush'); Start-Sleep 10
  $t2 = Get-Date
  while (([regex]::Matches((LireLog), 'All chunks are saved')).Count -le $s0) { Start-Sleep 2; if (((Get-Date) - $t2).TotalSeconds -gt 120) { J 'save-all sans confirmation en 120 s'; break } }
  Start-Sleep 10
  J 'save-all fait'
} catch { J "ERREUR $_" } finally {
  if ($p -and -not $p.HasExited) { $p.StandardInput.WriteLine('stop'); if (-not $p.WaitForExit(240000)) { J "TUE mon java $($p.Id)"; $p.Kill(); Start-Sleep 5 } }
  if ($p) { J "serveur arrete code=$($p.ExitCode)" }
  Copy-Item "$Ess\logs\latest.log" "$Ici\latest-sud.log" -Force -ErrorAction SilentlyContinue
  Start-Sleep 3
  if (Test-Path "$Ess\pilote\level.dat") {
    $ok = $false
    for ($k = 0; $k -lt 6 -and -not $ok; $k++) { try { Move-Item "$Ess\pilote" "$Ess\$Monde"; $ok = $true } catch { Start-Sleep 5 } }
    if ($ok) {
      New-Item -ItemType Directory "$Ess\pilote" | Out-Null; J "monde -> $Monde"
      & python -I "$Ici\integrite.py" "$Ess\$Monde" 2330 -2750 3900 -1800 2>&1 | ForEach-Object { J "INTEGRITE nord $_" }
      & python -I "$Ici\integrite.py" "$Ess\$Monde" 2330 -760 3900 200 2>&1 | ForEach-Object { J "INTEGRITE sud $_" }
      & python -I "$Ici\empreinte2.py" "$Ess\$Monde" "$Ici\empreinte4-apres.json" "$Ici\empreinte4-avant.json" 2>&1 | ForEach-Object { J "EMPREINTE $_" }
      & python -I "$Ici\arbre.py" "$Ess\$Monde" 2439 2451 107 125 -1277 -1265 2>&1 | ForEach-Object { J "ARBRE apres $_" }
    } else { J 'DEPLACEMENT_RATE (monde laisse dans pilote)' }
  }
  foreach ($fb in "$Reg", "$Ess\mods\atheria-ile.jar", "$Ess\mods\atheria-monde.jar", "$Ess\user_jvm_args.txt") { if (Test-Path "$fb.bak-v3c") { Remove-Item $fb -Force -ErrorAction SilentlyContinue; Copy-Item "$fb.bak-v3c" $fb } }
  Remove-Item "$Ess\config\atheria_ile\relief_delta.bin", "$Ess\config\atheria_ile\relief_base.bin" -ErrorAction SilentlyContinue
  J "copie remise : regions $((Get-FileHash $Reg -Algorithm MD5).Hash.Substring(0,8)) jvm $((Get-Content "$Ess\user_jvm_args.txt" | Where-Object { $_ -notmatch '^#' }) -join ' ')"
  J "FIN_SUD java=$(GrosJava) (verrou NON supprime par ce script)"
}
