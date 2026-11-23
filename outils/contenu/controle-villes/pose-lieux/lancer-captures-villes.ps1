# Captures en jeu des lieux poses (monde lieux_1 de la copie jetable serveur-lieux-essai), instance de test AtheriaAudit.
# Fichiers de l'instance mis de cote en .bak-lieux puis remis a l'identique a la fin. Verrou commun ; on ne ferme que nos processus.
param([int]$LibreMin = 6500, [string]$Monde = "lieux_2", [string]$Points = "points-villes.json")
$ErrorActionPreference = 'Stop'
$R = 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition'
$Lock = "$R\outils\pause-file.lock"
$M = "$R\instances\AtheriaAudit\minecraft"
$Ess = "$R\outils\serveur-lieux-essai"
$Ici = $PSScriptRoot
$Jn = "$Ici\journal-villes.txt"
$Prism = 'C:\Users\El-Afdal\AppData\Local\Programs\PrismLauncher\prismlauncher.exe'
function J($t) { $l = "$(Get-Date -Format HH:mm:ss) $t"; [IO.File]::AppendAllText($Jn, "$l`r`n"); Write-Host $l }
function Libre { [int]((Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory / 1024) }
function GrosJava { @(Get-Process java, javaw -ErrorAction SilentlyContinue | Where-Object { $_.WorkingSet64 -gt 1GB }).Count }
function Empreinte { $l = @(Get-ChildItem "$M\mods" -Filter 'atheria-ile*.jar') + @(Get-ChildItem "$M\mods" -Filter 'atheria-monde*.jar') + @(Get-ChildItem "$M\config\atheria_ile" -File) + @(Get-ChildItem "$M\kubejs" -Recurse -Filter 'atheria_brume.js') + @(Get-Item "$M\options.txt", "$M\..\instance.cfg"); ($l | Sort-Object FullName | ForEach-Object { "$($_.FullName.Replace($M, '')) $((Get-FileHash $_.FullName -Algorithm MD5).Hash.Substring(0, 8))" }) -join "`r`n" }
$tenu = $false
try { $fs = [IO.File]::Open($Lock, 'CreateNew', 'Write'); $b = [Text.Encoding]::UTF8.GetBytes("thread batiments captures-villes (AtheriaAudit, monde jetable) PID $PID $(Get-Date -Format s)"); $fs.Write($b, 0, $b.Length); $fs.Close(); $tenu = $true } catch { J "VERROU DEJA PRIS : $(Get-Content $Lock -Raw)"; exit 3 }
J "LOCK_PRIS libre=$(Libre)"
$E0 = Empreinte; [IO.File]::WriteAllText("$Ici\md5-avant-villes.txt", $E0); J "MD5 AVANT`r`n$E0"
$rn = @("$M\mods\atheria-ile.jar", "$M\mods\atheria-monde.jar", "$M\config\atheria_ile\regions.json", "$M\kubejs\client_scripts\zz_audit_client.js")
$ajoutes = @("$M\config\atheria_ile\exclusions.json", "$M\config\atheria_ile\plateaux.json", "$M\config\atheria_ile\relief_base.bin", "$M\config\atheria_ile\relief_delta.bin")
$monJava = $null; $monPrism = $null; $sculptMis = $false
try {
  $t1 = Get-Date
  while ((Libre) -lt $LibreMin -or (GrosJava) -gt 0) { if (((Get-Date) - $t1).TotalMinutes -gt 3) { J "RAM_INSUFFISANTE libre=$(Libre) java=$(GrosJava)"; throw 'ram' }; Start-Sleep 10 }
  foreach ($f in $rn + $ajoutes) { if (Test-Path "$f.bak-lieux") { throw "$f.bak-lieux existe" } }
  foreach ($f in $rn) { Rename-Item $f "$f.bak-lieux" }
  foreach ($f in $ajoutes) { if (Test-Path $f) { Rename-Item $f "$f.bak-lieux" } }
  Move-Item "$M\kubejs\client_scripts\zz_audit_client.js.bak-lieux" "$M\kubejs\audit\zz_audit_client.js.bak-lieux"
  Copy-Item "$Ess\mods\atheria-ile.jar" "$M\mods\atheria-ile.jar"
  Copy-Item "$Ess\mods\atheria-monde.jar" "$M\mods\atheria-monde.jar"
  foreach ($f in 'regions.json', 'plateaux.json', 'relief_base.bin', 'relief_delta.bin') { Copy-Item "$Ess\config\atheria_ile\$f" "$M\config\atheria_ile\$f" }
  if (Test-Path "$Ess\config\atheria_ile\sculptures") { if (Test-Path "$M\config\atheria_ile\sculptures") { throw 'sculptures existe deja' }; Copy-Item "$Ess\config\atheria_ile\sculptures" "$M\config\atheria_ile\sculptures" -Recurse; $sculptMis = $true }
  cmd /c mklink /J "$M\saves\villes_carte" "$Ess\$Monde" | Out-Null
  $js = (Get-Content "$Ici\$Points" -Raw)
  [IO.File]::WriteAllText("$M\kubejs\client_scripts\zz_villes_client.js", ([IO.File]::ReadAllText("$Ici\zz_villes_client.modele.js")).Replace('__PTS__', $js))
  $avant = @(Get-Process javaw, java -ErrorAction SilentlyContinue | ForEach-Object { $_.Id }); $debut = Get-Date
  $pp = Start-Process $Prism -ArgumentList @('--launch', 'AtheriaAudit', '--world', 'villes_carte') -PassThru; $monPrism = $pp.Id
  for ($k = 0; $k -lt 40 -and -not $monJava; $k++) { Start-Sleep 3; $monJava = (Get-CimInstance Win32_Process -Filter "Name='javaw.exe' OR Name='java.exe'" | Where-Object { $avant -notcontains $_.ProcessId -and $_.CommandLine -like '*AtheriaAudit*' } | Select-Object -First 1).ProcessId }
  if (-not $monJava) { throw 'java client introuvable' }
  J "LANCE java=$monJava"
  $arret = $null; $dern = Get-Date
  while ($true) {
    Start-Sleep 10
    $pj = Get-Process -Id $monJava -ErrorAction SilentlyContinue
    if (-not $pj) { J 'JAVA_TERMINE'; break }
    $lib = Libre; $n = @(Get-ChildItem "$M\screenshots" -Filter 'villes_*.png' -ErrorAction SilentlyContinue | Where-Object { $_.LastWriteTime -gt $debut }).Count
    if (((Get-Date) - $dern).TotalSeconds -ge 60) { J "libre=$lib jeu=$([int]($pj.WorkingSet64/1MB)) captures=$n"; $dern = Get-Date }
    $crash = Get-ChildItem "$M\crash-reports" -Filter '*.txt' -ErrorAction SilentlyContinue | Where-Object { $_.LastWriteTime -gt $debut }
    $oom = $false; try { $oom = [bool](Select-String -Path "$M\logs\latest.log" -Pattern 'OutOfMemoryError' -SimpleMatch -Quiet) } catch {}
    if ($oom -and -not $arret -and ((Get-Date) - $debut).TotalSeconds -gt 90) { J 'INCIDENT OOM : mon java est arrete'; Stop-Process -Id $monJava -Force; break }
    $inc = if ($crash) { "CRASH $($crash[0].Name)" } elseif ($lib -lt 300) { "MEMOIRE $lib" } elseif (((Get-Date) - $debut).TotalMinutes -gt 25) { 'DUREE 25 min' } else { $null }
    if ($inc -and -not $arret) { J "INCIDENT $inc : arret propre demande"; Set-Content "$M\kubejs\audit\arret.json" '{"arret":true}' -Encoding ASCII; $arret = Get-Date }
    if ($arret -and ((Get-Date) - $arret).TotalSeconds -gt 120) { Stop-Process -Id $monJava -Force; J "TUE mon java $monJava"; break }
  }
  $monJava = $null
  New-Item -ItemType Directory -Force "$Ici\captures-villes" | Out-Null
  Get-ChildItem "$M\screenshots" -Filter 'villes_*.png' | Where-Object { $_.LastWriteTime -gt $debut } | ForEach-Object { Move-Item $_.FullName "$Ici\captures-villes\$($_.Name)" -Force }
  J "captures=$(@(Get-ChildItem "$Ici\captures-villes" -Filter 'villes_*.png').Count)"
} catch { J "ERREUR $_" } finally {
  if ($monJava -and (Get-Process -Id $monJava -ErrorAction SilentlyContinue)) { Stop-Process -Id $monJava -Force; J 'JAVA_ARRETE_EN_SORTIE' }
  Start-Sleep 3
  if ($monPrism) { Get-Process -Id $monPrism -ErrorAction SilentlyContinue | Stop-Process -ErrorAction SilentlyContinue }
  Remove-Item "$M\kubejs\audit\arret.json" -ErrorAction SilentlyContinue
  Remove-Item "$M\kubejs\client_scripts\zz_villes_client.js" -ErrorAction SilentlyContinue
  if (Test-Path "$M\saves\villes_carte") { cmd /c rmdir "$M\saves\villes_carte" }
  if (Test-Path "$M\kubejs\audit\zz_audit_client.js.bak-lieux") { Move-Item "$M\kubejs\audit\zz_audit_client.js.bak-lieux" "$M\kubejs\client_scripts\zz_audit_client.js.bak-lieux" }
  foreach ($f in $rn) { if (Test-Path "$f.bak-lieux") { Remove-Item $f -Force -ErrorAction SilentlyContinue; Rename-Item "$f.bak-lieux" (Split-Path $f -Leaf) } }
  foreach ($f in $ajoutes) { Remove-Item $f -Force -ErrorAction SilentlyContinue; if (Test-Path "$f.bak-lieux") { Rename-Item "$f.bak-lieux" (Split-Path $f -Leaf) } }
  if ($sculptMis -and (Test-Path "$M\config\atheria_ile\sculptures")) { Remove-Item "$M\config\atheria_ile\sculptures" -Recurse -Force }
  J "instance remise : $((Get-ChildItem "$M\mods" -Filter 'atheria-*.jar' | ForEach-Object { "$($_.Name)=$($_.Length)" }) -join ' ') ; config : $((Get-ChildItem "$M\config\atheria_ile" | ForEach-Object Name) -join ',')"
  $E1 = Empreinte; [IO.File]::WriteAllText("$Ici\md5-apres-villes.txt", $E1); J "MD5 APRES identiques=$($E0 -eq $E1)`r`n$E1"
  if ($tenu -and (Test-Path $Lock) -and ((Get-Content $Lock -Raw) -match " $PID ")) { Remove-Item $Lock -Force; J 'LOCK_RENDU' }
}
