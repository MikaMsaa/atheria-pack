# Captures c22 (une seule session, verrou pris une fois) : monde pilote-bis-c22m (0.9.6d + regions-v3n2 + plateaux-v3l), AtheriaAudit,
# fenetre 1920 x 1080, distance de rendu 10, 2 vues par point (sol, haut) sur les 12 lieux sculptes, l'ilot A, le lagon, Majicavo et lot68,
# puis comptage des poissons au lagon (creatif, apparition autorisee 120 s). Copie jetable + instance de test seulement.
# Brume coupee dans AtheriaAudit seulement, remise en sortie. Tout est remis a l'identique dans le finally. Le verrou n'est supprime qu'au nettoyage final.
param([int]$LibreClient = 7500, [int]$BudgetMin = 45, [int]$MemClient = 6144)
$ErrorActionPreference = 'Stop'
$Racine = 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition'
$Ess = "$Racine\outils\serveur-pilote-essai"
$Lock = "$Racine\outils\pause-file.lock"
$Ici = Split-Path -Parent $MyInvocation.MyCommand.Path
$C1 = "$Ici\c1"; $Fac = "$Ici\facteur"
$BR = "$Racine\outils\atheria-ile-mod\branche-relief"; $SC = "$Racine\outils\atheria-ile-mod\sculpture"
$Monde = 'pilote-bis-c22m'
$Journal = "$Ici\journal-captures-c22.txt"
$Libere = (Get-Date).AddMinutes(-5)
$Prism = 'C:\Users\El-Afdal\AppData\Local\Programs\PrismLauncher\prismlauncher.exe'
$MA = "$Racine\instances\AtheriaAudit\minecraft"; $I7 = "$Racine\instances\AtheriaAudit"
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

if (-not (Test-Path "$Ess\$Monde\region")) { J "ABANDON : $Monde absent (lancer c22 d'abord)"; exit 1 }
J "debut captures c22 : $Monde, 1920 x 1080, distance 10, client $MemClient Mo, poissons au lagon ; budget $BudgetMin min"
$vuAutre = $false; $finAutre = $null; $dernAtt = Get-Date '2000-01-01'
while ($true) {
  $c = Contenu
  if ($c -and $c -notmatch '^thread ile') { if (-not $vuAutre) { J "AUTRE_A_PRIS : $c" }; $vuAutre = $true }
  if (-not $c -and $vuAutre -and -not $finAutre) { $finAutre = Get-Date; J 'AUTRE_FIL_A_RENDU' }
  $tour = (-not $c) -and ($finAutre -or ((-not $vuAutre) -and ((Get-Date) - $Libere).TotalSeconds -ge 180))
  $pris = $false
  if ($tour -and (GrosJava) -eq 0 -and (Prisms) -eq 0 -and (Libre) -ge 7500) {
    try { $fs = [IO.File]::Open($Lock, 'CreateNew', 'Write'); $b = [Text.Encoding]::UTF8.GetBytes("thread ile (captures c22 : lieux sculptes, lagon, Phare, Majicavo, lot68, poissons ; AtheriaAudit, copie jetable) PID $PID $(Get-Date -Format s)"); $fs.Write($b, 0, $b.Length); $fs.Close(); $pris = $true } catch { $pris = $false }
  }
  if ($pris) { break }
  if (((Get-Date) - $dernAtt).TotalSeconds -ge 60) { J "ATTENTE verrou=$c vuAutre=$vuAutre java=$(GrosJava) prism=$(Prisms) libre=$(Libre)"; $dernAtt = Get-Date }
  if (((Get-Date) - $Libere).TotalMinutes -gt 120) { J 'ABANDON attente 2 h'; exit 1 }
  Start-Sleep 3
}
$T0 = Get-Date
J "LOCK_PRIS PID $PID libre=$(Libre)"
$script:monJava = $null; $script:monPrism = $null
$CA = "$MA\config\atheria_ile"
$rnA = @("$MA\mods\atheria-ile.jar", "$MA\mods\atheria-monde.jar", "$CA\regions.json", "$MA\kubejs\client_scripts\zz_audit_client.js")
try {
  function Reste { $BudgetMin - ((Get-Date) - $T0).TotalMinutes }
  function P($id, $sx, $sz, $dx = 0.707, $dz = 0.707, $f = $false) { $o = [ordered]@{ id = $id; sx = $sx; sz = $sz; dx = $dx; dz = $dz }; if ($f) { $o.f = $true }; [pscustomobject]$o }
  $pts = @{}
  foreach ($cle in 'phare', 'z002', 'hum', 'z003', 'z006', 'z001', 'z008', 'z010', 'z013', 'z004', 'z009', 'z011') {
    $me = Get-Content "$SC\$cle\mesure.json" -Raw -Encoding UTF8 | ConvertFrom-Json; $pts[$cle] = P $cle ($me.x0 + 80) ($me.z0 + 80)
  }
  $pts['ileA'] = P 'ileA' -2534 -5864; $pts['lagon'] = P 'lagon' -2514 -5850 0.0 1.0
  $pts['majicavo_bord'] = P 'majicavo_bord' 2530 -1952 0.0 1.0; $pts['majicavo_est'] = P 'majicavo_est' 2594 -2016 1.0 0.0
  $pts['lot68_bord'] = P 'lot68_bord' 2941 -899 0.0 1.0
  $pts['poissons'] = P 'lagon' -2514 -5850 0.0 1.0 $true
  $Lots = @(@('phare', 'ileA', 'lagon', 'z002', 'hum'), @('z003', 'z006', 'z001', 'z008', 'z010'), @('z013', 'z004', 'z009', 'z011'), @('majicavo_bord', 'majicavo_est', 'lot68_bord', 'poissons'))
  if ((Libre) -lt 7500) { throw "libre $(Libre) Mo (il faut 7 500 pour les captures)" }
  # brume coupee dans l'instance de test seulement (remise dans le finally)
  if (Test-Path "$MA\kubejs\client_scripts\atheria_brume.js") { Move-Item "$MA\kubejs\client_scripts\atheria_brume.js" "$MA\kubejs\audit\atheria_brume.js.bak-c22"; J 'brume coupee (AtheriaAudit)' }
  foreach ($f in $rnA) { if (Test-Path "$f.bak-c22") { throw "$f.bak-c22 existe" }; if (Test-Path $f) { Rename-Item $f "$f.bak-c22" } }
  foreach ($f in "$CA\plateaux.json", "$CA\relief_delta.bin", "$CA\relief_base.bin", "$CA\sculptures") { if (Test-Path $f) { throw "$f existe deja dans AtheriaAudit" } }
  Copy-Item "$Fac\atheria-monde-ile-test-facteur.jar" "$MA\mods\atheria-monde.jar"
  Copy-Item "$BR\atheria-ile-0.9.6d-ilots-chauds.jar" "$MA\mods\atheria-ile.jar"
  & python -I "$C1\regions_client.py" "$BR\regions-v3n2.json" "$CA\regions.json" | Out-Null
  Copy-Item "$BR\plateaux-v3l.json" "$CA\plateaux.json"
  Copy-Item "$Ici\relief_delta_c2.bin" "$CA\relief_delta.bin"; Copy-Item "$Ici\relief_base.bin" "$CA\relief_base.bin"
  foreach ($s in 'ileA', 'phare', 'z002', 'hum', 'z003', 'z006', 'z001', 'z008', 'z010', 'z013', 'z004', 'z009', 'z011') { New-Item -ItemType Directory -Force "$CA\sculptures\$s" | Out-Null; Copy-Item "$SC\$s\hauteur.png", "$SC\$s\masque.png" "$CA\sculptures\$s" }
  J "AtheriaAudit : ile $((Get-FileHash "$MA\mods\atheria-ile.jar" -Algorithm MD5).Hash.Substring(0,8)) regions $((Get-FileHash "$CA\regions.json" -Algorithm MD5).Hash.Substring(0,8)) plateaux $((Get-FileHash "$CA\plateaux.json" -Algorithm MD5).Hash.Substring(0,8)), 13 sculptures"
  Copy-Item "$I7\instance.cfg" "$I7\instance.cfg.bak-c22" -Force; Copy-Item "$MA\options.txt" "$MA\options.txt.bak-c22" -Force
  (Get-Content "$I7\instance.cfg") -replace '^MaxMemAlloc=\d+', "MaxMemAlloc=$MemClient" -replace '^MinecraftWinWidth=\d+', 'MinecraftWinWidth=1920' -replace '^MinecraftWinHeight=\d+', 'MinecraftWinHeight=1080' -replace '^LaunchMaximized=.*', 'LaunchMaximized=false' | Set-Content "$I7\instance.cfg" -Encoding ASCII
  (Get-Content "$MA\options.txt") -replace '^renderDistance:\d+', 'renderDistance:10' -replace '^simulationDistance:\d+', 'simulationDistance:8' | Set-Content "$MA\options.txt" -Encoding ASCII
  $script:HashMods = (Get-ChildItem "$MA\mods" -Filter *.jar | Where-Object { $_.Name -match '^(xaeroworldmap|emotecraft|appleskin)' } | Sort-Object Name | ForEach-Object { "$($_.Name)=$($_.Length)" }) -join ';'
  foreach ($m in Get-ChildItem "$MA\mods" -Filter *.jar | Where-Object { $_.Name -match '^(xaeroworldmap|emotecraft|appleskin)' }) { Rename-Item $m.FullName "$($m.FullName).disabled-c22"; J "mod client coupe : $($m.Name)" }
  $old = "$MA\screenshots\avant-c22"; New-Item -ItemType Directory $old -Force | Out-Null
  Get-ChildItem "$MA\screenshots" -Filter 'relief_c22_*.png' | Move-Item -Destination $old -Force
  if (Test-Path "$MA\saves\relief_H") { cmd /c rmdir "$MA\saves\relief_H" }
  cmd /c mklink /J "$MA\saves\relief_H" "$Ess\$Monde" | Out-Null
  foreach ($lot in $Lots) {
    $r = Reste
    if ($r -lt 6) { J "BUDGET : lot $($lot -join ',') saute (reste $([int]$r) min)"; continue }
    $js = ConvertTo-Json -InputObject @($lot | ForEach-Object { $pts[$_] }) -Compress -Depth 3
    [IO.File]::WriteAllText("$MA\kubejs\client_scripts\zz_relief_client.js", ([IO.File]::ReadAllText("$C1\zz_c21_client.modele.js")).Replace('__VARIANTE__', 'c22_').Replace('__PTS__', $js))
    J "LOT $($lot -join ',') (reste $([int]$r) min)"
    Client 'AtheriaAudit' $MA 'relief_H' '\[AUDIT\] fin' 'relief_c22_*.png' ([math]::Min(12, [int]$r - 1))
    Copy-Item "$MA\logs\latest.log" "$Ici\latest-client-c22-$($lot[0]).log" -Force -ErrorAction SilentlyContinue
  }
  cmd /c rmdir "$MA\saves\relief_H"
  Add-Type -AssemblyName System.Drawing
  $tailles = Get-ChildItem "$MA\screenshots" -Filter 'relief_c22_*.png' | ForEach-Object { $im = [Drawing.Image]::FromFile($_.FullName); "$($im.Width)x$($im.Height)"; $im.Dispose() } | Group-Object | ForEach-Object { "$($_.Name) : $($_.Count)" }
  J "tailles des captures : $($tailles -join ' ; ') (attendu 1920x1080)"
  $poi = Select-String -Path "$Ici\latest-client-c22-majicavo_bord.log" -Pattern '\[AUDIT\] poissons' -ErrorAction SilentlyContinue | ForEach-Object { $_.Line -replace '^.*\[AUDIT\] ', '' }
  J "POISSONS : $($poi -join ' | ')"
  J "CAPTURES_C22_FINI $([int]((Get-Date) - $T0).TotalMinutes) min, captures=$(@(Get-ChildItem "$MA\screenshots" -Filter 'relief_c22_*.png').Count) (attendu 32)"
} catch { J "ERREUR $_" } finally {
  if ($script:monJava -and (Get-Process -Id $script:monJava -ErrorAction SilentlyContinue)) { Stop-Process -Id $script:monJava -Force; J 'JAVA_CLIENT_ARRETE_EN_SORTIE' }
  Start-Sleep 5
  if ($script:monPrism) { Get-Process -Id $script:monPrism -ErrorAction SilentlyContinue | Stop-Process -ErrorAction SilentlyContinue; J 'PRISM_FERME' }
  Remove-Item "$MA\kubejs\client_scripts\zz_relief_client.js", "$MA\kubejs\audit\arret.json", "$CA\relief_delta.bin", "$CA\relief_base.bin", "$CA\plateaux.json" -ErrorAction SilentlyContinue
  Remove-Item "$CA\sculptures" -Recurse -Force -ErrorAction SilentlyContinue
  if (Test-Path "$MA\saves\relief_H") { cmd /c rmdir "$MA\saves\relief_H" }
  if (Test-Path "$MA\kubejs\audit\atheria_brume.js.bak-c22") { Move-Item "$MA\kubejs\audit\atheria_brume.js.bak-c22" "$MA\kubejs\client_scripts\atheria_brume.js"; J 'brume remise' }
  foreach ($f in $rnA) { if (Test-Path "$f.bak-c22") { Remove-Item $f -Force -ErrorAction SilentlyContinue; Rename-Item "$f.bak-c22" (Split-Path $f -Leaf) } }
  foreach ($fb in "$I7\instance.cfg", "$MA\options.txt") { if (Test-Path "$fb.bak-c22") { Copy-Item "$fb.bak-c22" $fb -Force; Remove-Item "$fb.bak-c22" } }
  J "audit remis : $(Select-String -Path "$I7\instance.cfg" -Pattern 'MaxMemAlloc=\d+|MinecraftWinWidth=\d+' | ForEach-Object { $_.Matches[0].Value }) $(Select-String -Path "$MA\options.txt" -Pattern '^renderDistance:\d+' | ForEach-Object { $_.Matches[0].Value }) ; mods $((Get-ChildItem "$MA\mods" -Filter 'atheria-*.jar' | ForEach-Object { "$($_.Name)=$($_.Length)" }) -join ' ')"
  foreach ($m in Get-ChildItem "$MA\mods" -Filter '*.disabled-c22') { Rename-Item $m.FullName ($m.Name -replace '\.disabled-c22$', '') }
  if ($script:HashMods) { $h2 = (Get-ChildItem "$MA\mods" -Filter *.jar | Where-Object { $_.Name -match '^(xaeroworldmap|emotecraft|appleskin)' } | Sort-Object Name | ForEach-Object { "$($_.Name)=$($_.Length)" }) -join ';'; J "mods remis identiques : $($h2 -eq $script:HashMods)" }
  # nettoyage final : seule etape qui supprime le verrou
  $c = Contenu; if ($c -match "captures c22 .* PID $PID") { Remove-Item $Lock -Force -ErrorAction SilentlyContinue } else { J "verrou pas a moi ($c) : laisse" }
  J "LOCK_SUPPRIME=$(-not (Test-Path $Lock))"
}
