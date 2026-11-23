# Test de pose des lieux du trailer (PoseLieux, atheria-monde 1.1.0) sur une COPIE FRAICHE de serveur-ile-test, serveur seul.
# Verrou partage pris ici et rendu a la fin ; on ne ferme que nos propres processus.
param([int]$BudgetMin = 25)
$ErrorActionPreference = 'Stop'
$R = 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition'
$Src = "$R\outils\serveur-ile-test"
$Ess = "$R\outils\serveur-lieux-essai"
$Pk = "$R\outils\atheria-ile-mod\pour-villes-v3j"
$Lock = "$R\outils\pause-file.lock"
$sp = $PSScriptRoot
$Jn = "$sp\journal-lieux.txt"
function J($t) { $l = "$(Get-Date -Format HH:mm:ss) $t"; [IO.File]::AppendAllText($Jn, "$l`r`n"); Write-Host $l }
function Libre { [int]((Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory / 1024) }
$tenu = $false; $p = $null
try {
  try { New-Item -ItemType File -Path $Lock -Value "thread batiments test-lieux $PID $(Get-Date -Format s)" -ErrorAction Stop | Out-Null; $tenu = $true } catch { J "VERROU DEJA PRIS : $(Get-Content $Lock -Raw)"; exit 3 }
  J "LOCK_PRIS libre=$(Libre)"
  # ---- copie fraiche (sans les mondes, journaux et sauvegardes) ----
  if (Test-Path $Ess) { Remove-Item $Ess -Recurse -Force }
  $rc = robocopy $Src $Ess /E /NFL /NDL /NJH /NJS /NP /XD ile_test_1 'ile_test_1-chunks-*' world sauvegardes crash-reports logs mods-desactives 'rendus*' /XF 'sortie-*' 'memoire-*' '*.bak'
  J "robocopy code $LASTEXITCODE"; if ($LASTEXITCODE -ge 8) { throw "robocopy $($rc -join ' ')" }
  # mod de l'ile v3j (un seul jar atheria-ile), reglages v3j
  Get-ChildItem "$Ess\mods" -Filter 'atheria-ile*.jar' | Remove-Item -Force
  Copy-Item "$Pk\atheria-ile.jar" "$Ess\mods\atheria-ile.jar"
  foreach ($f in 'regions.json', 'plateaux.json', 'relief_base.bin', 'relief_delta.bin') { Copy-Item "$Pk\$f" "$Ess\config\atheria_ile\$f" -Force }
  # atheria-monde 1.1.0 avec PoseLieux et les modeles
  Copy-Item "$R\outils\atheria-monde-mod\atheria-monde.jar" "$Ess\mods\atheria-monde.jar" -Force
  # monde neuf : level.dat de reference + datapacks (celui de l'ile remplace) + serverconfig
  $W = "$Ess\lieux_1"; New-Item -ItemType Directory -Force "$W\datapacks" | Out-Null
  Copy-Item "$Src\sauvegardes\avant-audit-carte\level.dat" "$W\level.dat"
  Get-ChildItem "$Src\ile_test_1\datapacks" | Where-Object { $_.Name -ne 'atheria_ile_datapack.zip' } | Copy-Item -Destination "$W\datapacks" -Recurse
  Copy-Item "$Pk\atheria_ile_datapack.zip" "$W\datapacks\atheria_ile_datapack.zip"
  if (Test-Path "$Src\ile_test_1\serverconfig") { Copy-Item "$Src\ile_test_1\serverconfig" "$W\serverconfig" -Recurse }
  $pr = Get-Content "$Ess\server.properties" | ForEach-Object { $_ -replace '^level-name=.*', 'level-name=lieux_1' -replace '^server-port=.*', 'server-port=25573' }
  Set-Content "$Ess\server.properties" $pr -Encoding ASCII
  Set-Content "$Ess\user_jvm_args.txt" '-Xmx5G' -Encoding ASCII
  $h = @{}; foreach ($f in "mods\atheria-ile.jar", "lieux_1\datapacks\atheria_ile_datapack.zip", "config\atheria_ile\regions.json", "config\atheria_ile\plateaux.json") { $h[$f] = (Get-FileHash "$Ess\$f" -Algorithm MD5).Hash.Substring(0, 8).ToLower() }
  J "COPIE_PRETE md5 $(($h.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join ' ')"
  # ---- serveur ----
  $psi = New-Object Diagnostics.ProcessStartInfo 'java', '@user_jvm_args.txt @libraries/net/neoforged/neoforge/21.1.265/win_args.txt nogui'
  $psi.WorkingDirectory = $Ess; $psi.UseShellExecute = $false; $psi.RedirectStandardInput = $true; $psi.RedirectStandardOutput = $false; $psi.CreateNoWindow = $true
  $p = [Diagnostics.Process]::Start($psi); J "SERVEUR pid=$($p.Id)"
  $T0 = Get-Date; $log = "$Ess\logs\latest.log"
  function Lire { try { $fs = [IO.File]::Open($log, 'Open', 'Read', 'ReadWrite'); $sr = New-Object IO.StreamReader($fs); $t = $sr.ReadToEnd(); $sr.Close(); $t } catch { '' } }
  $etape = 0; $envoi = $null
  while ($true) {
    Start-Sleep 10
    if ($p.HasExited) { J "SERVEUR ARRETE code $($p.ExitCode)"; break }
    $tx = Lire; $min = ((Get-Date) - $T0).TotalMinutes
    if ($etape -eq 0 -and $tx -match 'Done \(') {
      J "DEMARRE en $([int]$min) min libre=$(Libre)"
      Start-Sleep 5
      # un chunk par emprise : PoseLieux force alors toute l'emprise et pose le modele
      foreach ($c in 'forceload add 2530 -2016', 'forceload add 2930 -950', 'forceload add 2500 -3020') { $p.StandardInput.WriteLine($c); Start-Sleep 2 }
      $etape = 1; $envoi = Get-Date
    }
    $n = ([regex]::Matches($tx, 'PoseLieux : \S+ pose en')).Count
    if ($etape -eq 1 -and ((Get-Date) - $envoi).TotalSeconds -gt 40 -and ($tx -notmatch 'emprise forcee')) { $p.StandardInput.WriteLine('forceload add 2530 -2016'); $p.StandardInput.WriteLine('forceload add 2930 -950'); $p.StandardInput.WriteLine('forceload add 2500 -3020'); $envoi = Get-Date; J 'RELANCE des forceload' }
    if ($etape -eq 1 -and $n -ge 5) { J "5 LIEUX POSES en $([int]$min) min"; Start-Sleep 20; $p.StandardInput.WriteLine('forceload remove all'); $p.StandardInput.WriteLine('save-all flush'); Start-Sleep 25; $p.StandardInput.WriteLine('stop'); $etape = 2 }
    if ($min -gt $BudgetMin -and $etape -lt 2) { J "BUDGET depasse ($n poses) : arret"; $p.StandardInput.WriteLine('save-all flush'); Start-Sleep 15; $p.StandardInput.WriteLine('stop'); $etape = 2 }
    if ($etape -eq 2 -and ((Get-Date) - $T0).TotalMinutes -gt $BudgetMin + 4) { J 'ARRET force de mon serveur'; $p.Kill(); break }
    if ((Libre) -lt 300) { J "MEMOIRE $(Libre) : arret"; $p.StandardInput.WriteLine('stop'); $etape = 2 }
  }
  $tx = Lire
  ($tx -split "`n") | Where-Object { $_ -match 'PoseLieux|plateau de raccord|delta d.erosion|exclusions\.json|\[atheria_ile\].*(ERROR|illisible)|Exception' } | Select-Object -First 60 | ForEach-Object { J "LOG $($_.Trim())" }
} catch { J "ERREUR $_" } finally {
  if ($p -and -not $p.HasExited) { $p.Kill(); J 'mon serveur tue en sortie' }
  if ($tenu -and (Test-Path $Lock) -and ((Get-Content $Lock -Raw) -match " $PID ")) { Remove-Item $Lock -Force; J 'LOCK_RENDU' }
}
