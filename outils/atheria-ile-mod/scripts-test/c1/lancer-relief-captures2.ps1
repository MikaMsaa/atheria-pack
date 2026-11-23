# Captures en jeu du banc relief : instance AtheriaAudit (solo), mondes de la copie jetable (A = mod actuel + C1, B = relief 0.8.0). Verrou commun.
param([int]$LibreMin = 6500, [switch]$ReprendreVerrou, [switch]$GarderVerrou, [string[]]$Lancements = @('C:001,003', 'C:004,005', 'C:009,010', 'C:ville', 'B:010', 'B:ville'))
$ErrorActionPreference = 'Stop'
$Racine = 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition'
$Lock = "$Racine\outils\pause-file.lock"
$I = "$Racine\instances\AtheriaAudit"; $M = "$I\minecraft"
$Ess = "$Racine\outils\serveur-pilote-essai"; $Srv = "$Racine\outils\serveur-ile-test"; $BR = "$Racine\outils\atheria-ile-mod\branche-relief"
$Ici = Split-Path -Parent $MyInvocation.MyCommand.Path
$Journal = "$Ici\journal-relief-captures2.txt"
$Prism = 'C:\Users\El-Afdal\AppData\Local\Programs\PrismLauncher\prismlauncher.exe'
function J($t) { $l = "$(Get-Date -Format HH:mm:ss) $t"; [IO.File]::AppendAllText($Journal, "$l`r`n"); Write-Host $l }
function Libre { [int]((Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory / 1024) }
function GrosJava { @(Get-Process java, javaw -ErrorAction SilentlyContinue | Where-Object { $_.WorkingSet64 -gt 1GB }).Count }
function Prisms { @(Get-Process prismlauncher -ErrorAction SilentlyContinue).Count }
J 'debut captures relief'
if ($ReprendreVerrou) {
  $c = if (Test-Path $Lock) { Get-Content $Lock -Raw } else { '' }
  if ($c -notlike 'thread ile (*') { J "REPRISE_REFUSEE verrou=$c"; exit 2 }
  [IO.File]::WriteAllText($Lock, "thread ile (captures banc relief, instance AtheriaAudit, mondes jetables) PID $PID $(Get-Date -Format s)")
  $t0 = Get-Date
  while ((Libre) -lt $LibreMin -or (GrosJava) -gt 0 -or (Prisms) -gt 0) {
    if (((Get-Date) - $t0).TotalMinutes -gt 3) { J "RAM_INSUFFISANTE libre=$(Libre) java=$(GrosJava) prism=$(Prisms) : 2e essai a faire"; if (-not $GarderVerrou) { Remove-Item $Lock -Force }; exit 3 }
    Start-Sleep 10
  }
} else {
while ($true) {
  $pris = $false
  if (-not (Test-Path $Lock) -and (GrosJava) -eq 0 -and (Prisms) -eq 0 -and (Libre) -ge $LibreMin) {
    try { $fs = [IO.File]::Open($Lock, 'CreateNew', 'Write'); $b = [Text.Encoding]::UTF8.GetBytes("thread ile (captures banc relief, instance AtheriaAudit, mondes jetables) PID $PID $(Get-Date -Format s)"); $fs.Write($b, 0, $b.Length); $fs.Close(); $pris = $true } catch { }
  }
  if ($pris) { break }
  J "ATTENTE verrou=$(if (Test-Path $Lock) { Get-Content $Lock -Raw } else { 'libre' }) java=$(GrosJava) prism=$(Prisms) libre=$(Libre)"
  Start-Sleep 30
}
}
J "LOCK_PRIS PID $PID libre=$(Libre)"
$rn = @("$M\mods\atheria-ile.jar", "$M\mods\atheria-monde.jar", "$M\config\atheria_ile\regions.json", "$M\kubejs\client_scripts\zz_audit_client.js")
$monJava = $null; $monPrism = $null
try {
  foreach ($f in $rn) { if (Test-Path "$f.bak-relief") { throw "$f.bak-relief existe" }; Rename-Item $f "$f.bak-relief" }
  Move-Item "$M\kubejs\client_scripts\zz_audit_client.js.bak-relief" "$M\kubejs\audit\zz_audit_client.js.bak-relief"
  Copy-Item "$Ici\..\facteur\atheria-monde-ile-test-facteur.jar" "$M\mods\atheria-monde.jar"
  cmd /c mklink /J "$M\saves\relief_A" "$Ess\pilote-relief-ref" | Out-Null
  cmd /c mklink /J "$M\saves\relief_B" "$Ess\pilote-relief-v1" | Out-Null
  cmd /c mklink /J "$M\saves\relief_C" "$Ess\pilote" | Out-Null
  $Pts = (Get-Content "$Ici\points-relief.json" -Raw | ConvertFrom-Json)
  foreach ($L in $Lancements) {
    $V, $ids = $L -split ':'; $ids = $ids -split ','
    $t1 = Get-Date
    while ((Libre) -lt $LibreMin -or (GrosJava) -gt 0) { if (((Get-Date) - $t1).TotalMinutes -gt 3) { J "DEPART_REFUSE $L libre=$(Libre) java=$(GrosJava)"; throw 'etat' }; Start-Sleep 10 }
    Remove-Item "$M\mods\atheria-ile.jar" -Force -ErrorAction SilentlyContinue
    if ($V -eq 'A') { Copy-Item "$Srv\mods\atheria-ile.jar" "$M\mods\atheria-ile.jar"; $src = "$Srv\config\atheria_ile\regions.json" }
    elseif ($V -eq 'B') { Copy-Item "$BR\atheria-ile-0.8.0-relief-essai1.jar" "$M\mods\atheria-ile.jar"; $src = "$BR\regions-relief-test-essai1.json" }
    else { Copy-Item "$BR\atheria-ile-0.8.0-relief.jar" "$M\mods\atheria-ile.jar"; $src = "$BR\regions-relief-test.json" }
    & python -I "$Ici\regions_client.py" $src "$M\config\atheria_ile\regions.json" $(if ($V -eq 'A') { 'c1' } else { '' })
    $sel = @($Pts | Where-Object { $ids -contains $_.id }) ; $js = ConvertTo-Json -InputObject $sel -Compress -Depth 3
    [IO.File]::WriteAllText("$M\kubejs\client_scripts\zz_relief_client.js", ([IO.File]::ReadAllText("$Ici\zz_relief_client.modele.js")).Replace('__VARIANTE__', $V + '_').Replace('__PTS__', $js))
    $avant = @(Get-Process javaw, java -ErrorAction SilentlyContinue | ForEach-Object { $_.Id }); $debut = Get-Date
    $pp = Start-Process $Prism -ArgumentList @('--launch', 'AtheriaAudit', '--world', "relief_$V") -PassThru; $monPrism = $pp.Id
    for ($k = 0; $k -lt 30 -and -not $monJava; $k++) { Start-Sleep 3; $monJava = (Get-CimInstance Win32_Process -Filter "Name='javaw.exe' OR Name='java.exe'" | Where-Object { $avant -notcontains $_.ProcessId -and $_.CommandLine -like '*AtheriaAudit*' } | Select-Object -First 1).ProcessId }
    if (-not $monJava) { throw 'java client introuvable' }
    J "$L LANCE java=$monJava"
    $arret = $null; $dern = Get-Date
    while ($true) {
      Start-Sleep 10
      $pj = Get-Process -Id $monJava -ErrorAction SilentlyContinue
      if (-not $pj) { J "$V JAVA_TERMINE"; break }
      $lib = Libre; $n = @(Get-ChildItem "$M\screenshots" -Filter "relief_$($V)_*.png" -ErrorAction SilentlyContinue).Count
      if (((Get-Date) - $dern).TotalSeconds -ge 60) { J "$V libre=$lib jeu=$([int]($pj.WorkingSet64/1MB)) captures=$n"; $dern = Get-Date }
      $crash = Get-ChildItem "$M\crash-reports" -Filter '*.txt' -ErrorAction SilentlyContinue | Where-Object { $_.LastWriteTime -gt $debut }
      $inc = if ($crash) { "CRASH $($crash[0].Name)" } elseif ($lib -lt 300) { "MEMOIRE $lib" } elseif (((Get-Date) - $debut).TotalMinutes -gt 25) { 'DUREE 25 min' } else { $null }
      if ($inc -and -not $arret) { J "$V INCIDENT $inc : arret propre demande"; Set-Content "$M\kubejs\audit\arret.json" '{"arret":true}' -Encoding ASCII; $arret = Get-Date }
      if ($arret -and ((Get-Date) - $arret).TotalSeconds -gt 120) { Stop-Process -Id $monJava -Force; J "$V TUE mon java $monJava"; break }
    }
    $monJava = $null; Remove-Item "$M\kubejs\audit\arret.json" -ErrorAction SilentlyContinue
    Start-Sleep 5; if ($monPrism) { Get-Process -Id $monPrism -ErrorAction SilentlyContinue | Stop-Process -ErrorAction SilentlyContinue; $monPrism = $null }
    J "$V captures=$(@(Get-ChildItem "$M\screenshots" -Filter "relief_$($V)_*.png").Count)"
    Start-Sleep 10
  }
  J 'fini'
} catch { J "ERREUR $_" } finally {
  if ($monJava -and (Get-Process -Id $monJava -ErrorAction SilentlyContinue)) { Stop-Process -Id $monJava -Force; J 'JAVA_ARRETE_EN_SORTIE' }
  Start-Sleep 3
  if ($monPrism) { Get-Process -Id $monPrism -ErrorAction SilentlyContinue | Stop-Process -ErrorAction SilentlyContinue }
  Remove-Item "$M\kubejs\client_scripts\zz_relief_client.js" -ErrorAction SilentlyContinue
  foreach ($j in 'relief_A', 'relief_B', 'relief_C') { if (Test-Path "$M\saves\$j") { cmd /c rmdir "$M\saves\$j" } }
  if (Test-Path "$M\kubejs\audit\zz_audit_client.js.bak-relief") { Move-Item "$M\kubejs\audit\zz_audit_client.js.bak-relief" "$M\kubejs\client_scripts\zz_audit_client.js.bak-relief" }
  foreach ($f in $rn) { if (Test-Path "$f.bak-relief") { Remove-Item $f -Force -ErrorAction SilentlyContinue; Rename-Item "$f.bak-relief" (Split-Path $f -Leaf) } }
  J "instance remise : $((Get-ChildItem "$M\mods" -Filter 'atheria-*.jar' | ForEach-Object { "$($_.Name)=$($_.Length)" }) -join ' ')"
  if ($GarderVerrou) { [IO.File]::WriteAllText($Lock, "thread ile (garde le PC : attente go essai 3 du coordinateur, aucun java lance) PID $PID $(Get-Date -Format s)"); J "VERROU_GARDE (attente go essai 3)" }
  else {
  Remove-Item $Lock -Force -ErrorAction SilentlyContinue
  J "LOCK_SUPPRIME=$(-not (Test-Path $Lock))"
  }
}
