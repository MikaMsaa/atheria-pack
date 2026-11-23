# Relief v3, creneau 2b (jar 0.9.0 base_terrain, fondu adaptatif par decalage de colonne) :
# (e) pilote de Mamoudzou avec fondu adaptatif (instance AtheriaPilote, monde pilote-3tp-pret recopie),
# (f) captures v3 des 7 points + colline (instance AtheriaAudit, copie de pilote-v3-colline).
# Copie jetable + instances de test seulement. Le verrou n'est supprime qu'au nettoyage final.
param([int]$LibreClient = 6500, [int]$BudgetMin = 15)
$ErrorActionPreference = 'Stop'
$Racine = 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition'
$Ess = "$Racine\outils\serveur-pilote-essai"
$Lock = "$Racine\outils\pause-file.lock"
$Ici = Split-Path -Parent $MyInvocation.MyCommand.Path
$SP = $Ici; $C1 = "$SP\c1"; $Fac = "$SP\facteur"
$BR = "$Racine\outils\atheria-ile-mod\branche-relief"
$Journal = "$Ici\journal-c16.txt"
$Libere = (Get-Date).AddMinutes(-5)
$Prism = 'C:\Users\El-Afdal\AppData\Local\Programs\PrismLauncher\prismlauncher.exe'
$MP = "$Racine\instances\AtheriaPilote\minecraft"; $MA = "$Racine\instances\AtheriaAudit\minecraft"
function J($t) { $l = "$(Get-Date -Format HH:mm:ss) $t"; [IO.File]::AppendAllText($Journal, "$l`r`n"); Write-Host $l }
function Libre { [int]((Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory / 1024) }
function GrosJava { @(Get-Process java, javaw -ErrorAction SilentlyContinue | Where-Object { $_.WorkingSet64 -gt 1GB }).Count }
function Prisms { @(Get-Process prismlauncher -ErrorAction SilentlyContinue).Count }
function Contenu { if (Test-Path $Lock) { try { Get-Content $Lock -Raw } catch { '?' } } else { $null } }
function Client($inst, $M, $monde, $motifFin, $filtre, $maxMin) {
  $t1 = Get-Date
  while ((Libre) -lt $LibreClient -or (GrosJava) -gt 0) { if (((Get-Date) - $t1).TotalMinutes -gt 3) { J "CLIENT_REFUSE libre=$(Libre) java=$(GrosJava)"; throw 'ram client' }; Start-Sleep 10 }
  $avant = @(Get-Process javaw, java -ErrorAction SilentlyContinue | ForEach-Object { $_.Id }); $debut = Get-Date
  $pp = Start-Process $Prism -ArgumentList @('--launch', $inst, '--world', $monde) -PassThru; $script:monPrism = $pp.Id
  $mj = $null
  for ($k = 0; $k -lt 30 -and -not $mj; $k++) { Start-Sleep 3; $mj = (Get-CimInstance Win32_Process -Filter "Name='javaw.exe' OR Name='java.exe'" | Where-Object { $avant -notcontains $_.ProcessId -and $_.CommandLine -like "*$inst*" } | Select-Object -First 1).ProcessId }
  if (-not $mj) { throw 'java client introuvable' }
  $script:monJava = $mj; J "$inst java=$mj"
  $arret = $null; $dern = Get-Date; $finVue = $null
  while ($true) {
    Start-Sleep 10
    $pj = Get-Process -Id $mj -ErrorAction SilentlyContinue
    if (-not $pj) { J "$inst termine"; break }
    $lib = Libre; $n = @(Get-ChildItem "$M\screenshots" -Filter $filtre -ErrorAction SilentlyContinue).Count
    if (((Get-Date) - $dern).TotalSeconds -ge 120) { J "$inst libre=$lib jeu=$([int]($pj.WorkingSet64/1MB)) captures=$n"; $dern = Get-Date }
    if (-not $finVue) { try { $fs = [IO.File]::Open("$M\logs\latest.log", 'Open', 'Read', 'ReadWrite'); $sr = New-Object IO.StreamReader($fs); $tx = $sr.ReadToEnd(); $sr.Close(); if ($tx -match $motifFin) { $finVue = Get-Date; J 'FIN_SCRIPT_VUE' } } catch { } }
    if ($finVue -and ((Get-Date) - $finVue).TotalSeconds -gt 90) { Stop-Process -Id $mj -Force; J "TUE mon java client $mj (bloque apres la fin)"; break }
    $crash = Get-ChildItem "$M\crash-reports" -Filter '*.txt' -ErrorAction SilentlyContinue | Where-Object { $_.LastWriteTime -gt $debut }
    $inc = if ($crash) { "CRASH $($crash[0].Name)" } elseif ($lib -lt 300) { "MEMOIRE $lib" } elseif (((Get-Date) - $debut).TotalMinutes -gt $maxMin) { "DUREE $maxMin min" } else { $null }
    if ($inc -and -not $arret) { J "INCIDENT $inc : arret propre demande"; Set-Content "$M\kubejs\audit\arret.json" '{"arret":true}' -Encoding ASCII; $arret = Get-Date }
    if ($arret -and ((Get-Date) - $arret).TotalSeconds -gt 120) { Stop-Process -Id $mj -Force; J "TUE mon java client $mj"; break }
  }
  $script:monJava = $null
  Remove-Item "$M\kubejs\audit\arret.json" -ErrorAction SilentlyContinue
  Start-Sleep 5; if ($script:monPrism) { Get-Process -Id $script:monPrism -ErrorAction SilentlyContinue | Stop-Process -ErrorAction SilentlyContinue; $script:monPrism = $null }
  J "$inst captures=$(@(Get-ChildItem "$M\screenshots" -Filter $filtre).Count)"
  Start-Sleep 10
}

J 'debut creneau 16 : serveur seul, 0.9.4g v3i riv hum (berges douces), 15 min'
$vuAutre = $false; $finAutre = $null; $dernAtt = Get-Date '2000-01-01'
while ($true) {
  $c = Contenu
  if ($c -and $c -notmatch '^thread ile') { if (-not $vuAutre) { J "AUTRE_A_PRIS : $c" }; $vuAutre = $true }
  if (-not $c -and $vuAutre -and -not $finAutre) { $finAutre = Get-Date; J 'AUTRE_FIL_A_RENDU' }
  $tour = (-not $c) -and ($finAutre -or ((-not $vuAutre) -and ((Get-Date) - $Libere).TotalSeconds -ge 180))
  $pris = $false
  if ($tour -and (GrosJava) -eq 0 -and (Prisms) -eq 0 -and (Libre) -ge 6000) {
    try { $fs = [IO.File]::Open($Lock, 'CreateNew', 'Write'); $b = [Text.Encoding]::UTF8.GetBytes("thread ile (creneau 16 : serveur seul, nature 0.9.4g berges douces (riv hum), copie jetable, copie jetable + AtheriaAudit) PID $PID $(Get-Date -Format s)"); $fs.Write($b, 0, $b.Length); $fs.Close(); $pris = $true } catch { $pris = $false }
  }
  if ($pris) { break }
  if (((Get-Date) - $dernAtt).TotalSeconds -ge 60) { J "ATTENTE verrou=$c vuAutre=$vuAutre java=$(GrosJava) prism=$(Prisms) libre=$(Libre)"; $dernAtt = Get-Date }
  if (((Get-Date) - $Libere).TotalMinutes -gt 120) { J 'ABANDON attente 2 h'; exit 1 }
  Start-Sleep 3
}
$T0 = Get-Date
J "LOCK_PRIS PID $PID libre=$(Libre)"
$script:monJava = $null; $script:monPrism = $null
$rnP = @()
$rnA = @("$MA\mods\atheria-ile.jar", "$MA\mods\atheria-monde.jar", "$MA\config\atheria_ile\regions.json", "$MA\kubejs\client_scripts\zz_audit_client.js")
try {
  function Reste { $BudgetMin - ((Get-Date) - $T0).TotalMinutes }
  # serveur seul (pas de client) : 1 monde neuf n094h (0.9.4g v3i, riv + hum)
  & powershell -NoProfile -ExecutionPolicy Bypass -File "$Ici\lancer-bis-c16.ps1" -SousVerrou | Out-Null
  J "nature : $((Get-Content "$Ici\journal-bis-c16.txt" | Select-String 'generation|COMPARE .* vs pilote-bis-b073|ERREUR|arrete' | ForEach-Object { $_.Line }) -join ' || ')"
  J "CRENEAU16_FINI $([int]((Get-Date) - $T0).TotalMinutes) min"
} catch { J "ERREUR $_" } finally {
  if ($script:monJava -and (Get-Process -Id $script:monJava -ErrorAction SilentlyContinue)) { Stop-Process -Id $script:monJava -Force; J 'JAVA_CLIENT_ARRETE_EN_SORTIE' }
  Start-Sleep 5
  if ($script:monPrism) { Get-Process -Id $script:monPrism -ErrorAction SilentlyContinue | Stop-Process -ErrorAction SilentlyContinue; J 'PRISM_FERME' }
  foreach ($f in $rnP) { if (Test-Path "$f.bak-c9") { Remove-Item $f -Force -ErrorAction SilentlyContinue; Rename-Item "$f.bak-c9" (Split-Path $f -Leaf) } }
  Remove-Item "$MP\config\atheria_ile\relief_base.bin" -ErrorAction SilentlyContinue
  Remove-Item "$MA\kubejs\client_scripts\zz_relief_client.js", "$MA\kubejs\audit\arret.json", "$MA\config\atheria_ile\relief_delta.bin", "$MA\config\atheria_ile\relief_base.bin" -ErrorAction SilentlyContinue
  foreach ($jn in "relief_E", "relief_F", "relief_G", "relief_H") { if (Test-Path "$MA\saves\$jn") { cmd /c rmdir "$MA\saves\$jn" } }
  if (Test-Path "$MA\kubejs\audit\atheria_brume.js.bak-c9") { Move-Item "$MA\kubejs\audit\atheria_brume.js.bak-c9" "$MA\kubejs\client_scripts\atheria_brume.js"; J "brume remise" }
  if (Test-Path "$MA\kubejs\audit\zz_audit_client.js.bak-c9") { Move-Item "$MA\kubejs\audit\zz_audit_client.js.bak-c9" "$MA\kubejs\client_scripts\zz_audit_client.js.bak-c9" }
  foreach ($f in $rnA) { if (Test-Path "$f.bak-c9") { Remove-Item $f -Force -ErrorAction SilentlyContinue; Rename-Item "$f.bak-c9" (Split-Path $f -Leaf) } }
  if (Test-Path "$Ess\pilote\level.dat") { try { Move-Item "$Ess\pilote" "$Ess\pilote-v3-fondu-incomplet"; New-Item -ItemType Directory "$Ess\pilote" | Out-Null; J 'monde pilote range : pilote-v3-fondu-incomplet' } catch { J "monde pilote RESTE dans pilote : $_" } }
  J "instances remises : pilote $((Get-ChildItem "$MP\mods" -Filter 'atheria-ile*.jar' | ForEach-Object { "$($_.Name)=$($_.Length)" }) -join ' ') ; audit $((Get-ChildItem "$MA\mods" -Filter 'atheria-*.jar' | ForEach-Object { "$($_.Name)=$($_.Length)" }) -join ' ')"
  foreach ($fb in "$Racine\instances\AtheriaPilote\instance.cfg", "$MP\options.txt") { if (Test-Path "$fb.bak-c9c") { Copy-Item "$fb.bak-c9c" $fb -Force; Remove-Item "$fb.bak-c9c" } }
  J "pilote remis : $(Select-String -Path "$Racine\instances\AtheriaPilote\instance.cfg" -Pattern 'MaxMemAlloc=\d+' | ForEach-Object { $_.Matches[0].Value })"
  foreach ($fb in "$Racine\instances\AtheriaAudit\instance.cfg", "$MA\options.txt") { if (Test-Path "$fb.bak-c9r") { Copy-Item "$fb.bak-c9r" $fb -Force; Remove-Item "$fb.bak-c9r" } }
  J "audit remis : $(Select-String -Path "$Racine\instances\AtheriaAudit\instance.cfg" -Pattern 'MaxMemAlloc=\d+' | ForEach-Object { $_.Matches[0].Value }) $(Select-String -Path "$MA\options.txt" -Pattern '^renderDistance:\d+' | ForEach-Object { $_.Matches[0].Value })"
  foreach ($m in Get-ChildItem "$MA\mods" -Filter '*.disabled-c9') { Rename-Item $m.FullName ($m.Name -replace '\.disabled-c9$', '') }
  if (Test-Path "$C1\zz_relief_client.modele.js.bak-c9") { Copy-Item "$C1\zz_relief_client.modele.js.bak-c9" "$C1\zz_relief_client.modele.js" -Force; Remove-Item "$C1\zz_relief_client.modele.js.bak-c9" }
  if ($script:HashMods) { $h2 = (Get-ChildItem "$MA\mods" -Filter *.jar | Where-Object { $_.Name -match '^(xaeroworldmap|emotecraft|appleskin)' } | Sort-Object Name | ForEach-Object { "$($_.Name)=$($_.Length)" }) -join ';'; J "mods remis identiques : $($h2 -eq $script:HashMods)" }
  # nettoyage final : seule etape qui supprime le verrou
  $c = Contenu; if ($c -match "creneau 16 .* PID $PID") { Remove-Item $Lock -Force -ErrorAction SilentlyContinue } else { J "verrou pas a moi ($c) : laisse" }
  J "LOCK_SUPPRIME=$(-not (Test-Path $Lock))"
}
