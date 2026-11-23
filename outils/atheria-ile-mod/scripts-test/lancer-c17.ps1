# Creneau 17 (captures du matin, une seule session, verrou pris une fois) :
# (A) 003 + lagon, monde pilote-bis-b093 (0.9.3), (B) points nature riv + hum (bancs, epave, poteaux), monde n094h si present sinon n094g,
# (C) debris de la zone seche, monde n094e, (D) fondu du pilote (AtheriaPilote, monde pilote-3tp-pret recopie, client 5 Go distance 5,
# 8 vues du fondu seulement ; le 14/11 il avait ete arrete pour memoire a 6 Go).
# Copie jetable + instances de test seulement. Brume coupee dans AtheriaAudit seulement, remise en sortie. Le verrou n'est supprime qu'au nettoyage final.
param([int]$LibreClient = 6500, [int]$BudgetMin = 50, [string]$JarPilote = 'atheria-ile-0.9.4e-nature.jar')
$ErrorActionPreference = 'Stop'
$Racine = 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition'
$Ess = "$Racine\outils\serveur-pilote-essai"
$Lock = "$Racine\outils\pause-file.lock"
$Ici = Split-Path -Parent $MyInvocation.MyCommand.Path
$SP = $Ici; $C1 = "$SP\c1"; $Fac = "$SP\facteur"
$BR = "$Racine\outils\atheria-ile-mod\branche-relief"
$Journal = "$Ici\journal-c17.txt"
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

J "debut creneau 17 : captures 003 + lagon, nature riv hum sec, fondu du pilote ; client 5 Go distance 5 ; budget $BudgetMin min"
$vuAutre = $false; $finAutre = $null; $dernAtt = Get-Date '2000-01-01'
while ($true) {
  $c = Contenu
  if ($c -and $c -notmatch '^thread ile') { if (-not $vuAutre) { J "AUTRE_A_PRIS : $c" }; $vuAutre = $true }
  if (-not $c -and $vuAutre -and -not $finAutre) { $finAutre = Get-Date; J 'AUTRE_FIL_A_RENDU' }
  $tour = (-not $c) -and ($finAutre -or ((-not $vuAutre) -and ((Get-Date) - $Libere).TotalSeconds -ge 180))
  $pris = $false
  if ($tour -and (GrosJava) -eq 0 -and (Prisms) -eq 0 -and (Libre) -ge 7500) {
    try { $fs = [IO.File]::Open($Lock, 'CreateNew', 'Write'); $b = [Text.Encoding]::UTF8.GetBytes("thread ile (creneau 17 : captures du matin 003 lagon nature fondu pilote, AtheriaAudit + AtheriaPilote, copie jetable) PID $PID $(Get-Date -Format s)"); $fs.Write($b, 0, $b.Length); $fs.Close(); $pris = $true } catch { $pris = $false }
  }
  if ($pris) { break }
  if (((Get-Date) - $dernAtt).TotalSeconds -ge 60) { J "ATTENTE verrou=$c vuAutre=$vuAutre java=$(GrosJava) prism=$(Prisms) libre=$(Libre)"; $dernAtt = Get-Date }
  if (((Get-Date) - $Libere).TotalMinutes -gt 120) { J 'ABANDON attente 2 h'; exit 1 }
  Start-Sleep 3
}
$T0 = Get-Date
J "LOCK_PRIS PID $PID libre=$(Libre)"
$script:monJava = $null; $script:monPrism = $null
$rnP = @("$MP\mods\atheria-ile.jar", "$MP\config\atheria_ile\plateaux.json")
$rnA = @("$MA\mods\atheria-ile.jar", "$MA\mods\atheria-monde.jar", "$MA\config\atheria_ile\regions.json", "$MA\kubejs\client_scripts\zz_audit_client.js")
try {
  function Reste { $BudgetMin - ((Get-Date) - $T0).TotalMinutes }
  $tous = @{}; foreach ($q in (Get-Content "$C1\points-relief.json" -Raw | ConvertFrom-Json)) { $tous[$q.id] = $q }
  $tous['lagon'] = [pscustomobject]@{ id = 'lagon'; sx = -2514; sz = -5850; dx = 0.0; dz = 1.0 }
  # points nature : sujet (sx, sz), camera du cote (dx, dz), a 24 blocs au sol et 40 blocs pour la vue haute
  $tous['riv_bancs'] = [pscustomobject]@{ id = 'riv_bancs'; sx = -2239; sz = 3975; dx = 0.0; dz = 1.0 }
  $tous['riv_epave'] = [pscustomobject]@{ id = 'riv_epave'; sx = -2071; sz = 3849; dx = 0.0; dz = 1.0 }
  $tous['hum_bancs'] = [pscustomobject]@{ id = 'hum_bancs'; sx = 3346; sz = 762; dx = 0.0; dz = 1.0 }
  $tous['hum_poteau'] = [pscustomobject]@{ id = 'hum_poteau'; sx = 3206; sz = 807; dx = 0.707; dz = 0.707 }
  $tous['sec_debris1'] = [pscustomobject]@{ id = 'sec_debris1'; sx = -331; sz = -3450; dx = 0.707; dz = 0.707 }
  $tous['sec_debris2'] = [pscustomobject]@{ id = 'sec_debris2'; sx = -232; sz = -3627; dx = 0.0; dz = 1.0 }
  # brume coupee dans l'instance de test seulement (remise dans le finally)
  if (Test-Path "$MA\kubejs\client_scripts\atheria_brume.js") { Move-Item "$MA\kubejs\client_scripts\atheria_brume.js" "$MA\kubejs\audit\atheria_brume.js.bak-c9"; J 'brume coupee (AtheriaAudit)' }
  foreach ($f in $rnA) { if (Test-Path "$f.bak-c9") { throw "$f.bak-c9 existe" }; Rename-Item $f "$f.bak-c9" }
  Move-Item "$MA\kubejs\client_scripts\zz_audit_client.js.bak-c9" "$MA\kubejs\audit\zz_audit_client.js.bak-c9"
  Copy-Item "$Fac\atheria-monde-ile-test-facteur.jar" "$MA\mods\atheria-monde.jar"
  Copy-Item "$Ici\relief_delta_c2.bin" "$MA\config\atheria_ile\relief_delta.bin" -Force
  Copy-Item "$Ici\relief_base.bin" "$MA\config\atheria_ile\relief_base.bin" -Force
  function Lots($variante, $jonction, $lots) {
    $old = "$MA\screenshots\avant-c9"; New-Item -ItemType Directory $old -Force | Out-Null
    Get-ChildItem "$MA\screenshots" -Filter "relief_$($variante)__*.png" | Move-Item -Destination $old -Force
    foreach ($lot in $lots) {
      $r = Reste
      if ($r -lt 5) { J "BUDGET : lot $($lot -join ',') saute (reste $([int]$r) min)"; continue }
      $js = ConvertTo-Json -InputObject @($lot | ForEach-Object { $tous[$_] }) -Compress -Depth 3
      [IO.File]::WriteAllText("$MA\kubejs\client_scripts\zz_relief_client.js", ([IO.File]::ReadAllText("$C1\zz_relief_client.modele.js")).Replace('__VARIANTE__', "$($variante)_").Replace('__PTS__', $js))
      J "LOT $variante $($lot -join ',') (reste $([int]$r) min)"
      Client 'AtheriaAudit' $MA $jonction '\[AUDIT\] fin' "relief_$($variante)_*.png" ([math]::Min(7, [int]$r - 1))
      Copy-Item "$MA\logs\latest.log" "$Ici\latest-client-c9-$variante-$($lot[0]).log" -Force -ErrorAction SilentlyContinue
    }
    J "captures $variante = $(@(Get-ChildItem "$MA\screenshots" -Filter "relief_$($variante)_*.png").Count)"
  }
  if ((Libre) -lt 7500) { throw "libre $(Libre) Mo (il faut 7 500 pour les captures)" }
  $I7 = "$Racine\instances\AtheriaAudit"
  Copy-Item "$I7\instance.cfg" "$I7\instance.cfg.bak-c9r" -Force; Copy-Item "$MA\options.txt" "$MA\options.txt.bak-c9r" -Force
  (Get-Content "$I7\instance.cfg") -replace '^MaxMemAlloc=\d+', 'MaxMemAlloc=5120' | Set-Content "$I7\instance.cfg" -Encoding ASCII
  (Get-Content "$MA\options.txt") -replace '^renderDistance:\d+', 'renderDistance:5' -replace '^simulationDistance:\d+', 'simulationDistance:4' | Set-Content "$MA\options.txt" -Encoding ASCII
  $script:HashMods = (Get-ChildItem "$MA\mods" -Filter *.jar | Where-Object { $_.Name -match '^(xaeroworldmap|emotecraft|appleskin)' } | Sort-Object Name | ForEach-Object { "$($_.Name)=$($_.Length)" }) -join ';'
  foreach ($m in Get-ChildItem "$MA\mods" -Filter *.jar | Where-Object { $_.Name -match '^(xaeroworldmap|emotecraft|appleskin)' }) { Rename-Item $m.FullName "$($m.FullName).disabled-c9"; J "mod client coupe : $($m.Name)" }
  $tpl = "$C1\zz_relief_client.modele.js"; Copy-Item $tpl "$tpl.bak-c9" -Force
  # passes : variante, monde, jar, regions, lots ; chaque monde est relie par une jonction temporaire (relief_H)
  $natRiv = if (Test-Path "$Ess\pilote-bis-n094j\region") { @('pilote-bis-n094j', 'atheria-ile-0.9.4g-nature.jar', 'regions-v3i.json') } elseif (Test-Path "$Ess\pilote-bis-n094h\region") { @('pilote-bis-n094h', 'atheria-ile-0.9.4f-nature.jar', 'regions-v3i.json') } else { @('pilote-bis-n094g', 'atheria-ile-0.9.4e-nature.jar', 'regions-v3h.json') }
  $Passes = @(
    @('A', 'pilote-bis-b093', 'atheria-ile-0.9.3-plafond.jar', 'regions-v3f.json', @(, @('003', 'lagon'))),
    @('N', $natRiv[0], $natRiv[1], $natRiv[2], @(, @('riv_bancs', 'riv_epave', 'hum_bancs', 'hum_poteau'))),
    @('S', 'pilote-bis-n094e', 'atheria-ile-0.9.4c-nature.jar', 'regions-v3h.json', @(, @('sec_debris1', 'sec_debris2')))
  )
  foreach ($ps in $Passes) {
    if (-not (Test-Path "$Ess\$($ps[1])\region")) { J "PASSE $($ps[0]) SAUTEE : $($ps[1]) absent"; continue }
    if ((Reste) -lt 6) { J "PASSE $($ps[0]) SAUTEE : budget (reste $([int](Reste)) min)"; continue }
    Copy-Item "$BR\$($ps[2])" "$MA\mods\atheria-ile.jar" -Force
    & python -I "$C1\regions_client.py" "$BR\$($ps[3])" "$MA\config\atheria_ile\regions.json" | Out-Null
    J "PASSE $($ps[0]) : monde $($ps[1]) ile $($ps[2]) regions $($ps[3])"
    if (Test-Path "$MA\saves\relief_H") { cmd /c rmdir "$MA\saves\relief_H" }
    cmd /c mklink /J "$MA\saves\relief_H" "$Ess\$($ps[1])" | Out-Null
    Lots $ps[0] 'relief_H' $ps[4]
    cmd /c rmdir "$MA\saves\relief_H"
  }
  Copy-Item "$tpl.bak-c9" $tpl -Force; Remove-Item "$tpl.bak-c9"
  # (D) fondu du pilote : AtheriaPilote, client 5 Go, distances 5 / 4, 8 vues du fondu (4 hautes, 4 au sol)
  if ((Reste) -ge 12 -and (Test-Path "$Ess\pilote-3tp-pret\level.dat") -and -not (Test-Path "$Ess\pilote-v3-fondu2")) {
    $cfgP = "$Racine\instances\AtheriaPilote\instance.cfg"; $optP = "$MP\options.txt"
    Copy-Item $cfgP "$cfgP.bak-c9c" -Force; Copy-Item $optP "$optP.bak-c9c" -Force
    [IO.File]::WriteAllText($cfgP, ([IO.File]::ReadAllText($cfgP) -replace 'MaxMemAlloc=\d+', 'MaxMemAlloc=5120'))
    (Get-Content $optP) -replace '^renderDistance:\d+', 'renderDistance:5' -replace '^simulationDistance:\d+', 'simulationDistance:4' | Set-Content $optP -Encoding ASCII
    $pjs = "$MP\kubejs\client_scripts\zz_pilote_client.js"
    if (Test-Path "$Ici\zz_pilote_client.js.bak-c17") { throw 'zz_pilote_client.js.bak-c17 existe' }
    Copy-Item $pjs "$Ici\zz_pilote_client.js.bak-c17"
    $src = [IO.File]::ReadAllText($pjs)
    $a = $src.IndexOf('var PIL_VUES = ['); $b = $src.IndexOf("`n]", $src.IndexOf('fondu_sud_haut', $a)) + 2
    if ($a -lt 0 -or $b -le $a) { throw 'PIL_VUES introuvable' }
    $vues = @'
var PIL_VUES = [
  { n: 'fondu_est_haut', c: [3130, 110, -904.5], v: [3050, 64, -904.5] },
  { n: 'fondu_ouest_haut', c: [2790, 110, -904.5], v: [2870, 64, -904.5] },
  { n: 'fondu_nord_haut', c: [2960, 110, -1050], v: [2960, 64, -985] },
  { n: 'fondu_sud_haut', c: [2960, 110, -760], v: [2960, 64, -825] },
  { n: 'fondu_est_sol', c: [3110, null, -904.5], v: [3050, null, -904.5] },
  { n: 'fondu_ouest_sol', c: [2810, null, -904.5], v: [2870, null, -904.5] },
  { n: 'fondu_nord_sol', c: [2960, null, -1040], v: [2960, null, -985] },
  { n: 'fondu_sud_sol', c: [2960, null, -770], v: [2960, null, -825] }
]
'@
    [IO.File]::WriteAllText($pjs, $src.Substring(0, $a) + $vues.Trim() + $src.Substring($b))
    if (Test-Path "$Ess\pilote") { if (@(Get-ChildItem "$Ess\pilote" -Force).Count -gt 0) { throw 'pilote non vide' }; Remove-Item "$Ess\pilote" }
    robocopy "$Ess\pilote-3tp-pret" "$Ess\pilote" /E /NFL /NDL /NJH /NJS /NP | Out-Null
    if (-not (Test-Path "$MP\saves\pilote\level.dat")) { throw 'jonction pilote' }
    foreach ($f in $rnP) { if (Test-Path "$f.bak-c9") { throw "$f.bak-c9 existe" }; Rename-Item $f "$f.bak-c9" }
    Copy-Item "$BR\$JarPilote" "$MP\mods\atheria-ile.jar"
    Copy-Item "$Ici\plateaux-adaptatif.json" "$MP\config\atheria_ile\plateaux.json"
    if (Test-Path "$MP\config\atheria_ile\relief_base.bin") { throw 'relief_base.bin deja dans AtheriaPilote' }
    Copy-Item "$Ici\relief_base.bin" "$MP\config\atheria_ile\relief_base.bin"
    $old = "$MP\screenshots\avant-c17"; New-Item -ItemType Directory $old -Force | Out-Null
    Get-ChildItem "$MP\screenshots" -Filter 'pilote_*.png' | Move-Item -Destination $old -Force
    J "PASSE D (fondu du pilote) : ile $JarPilote, client 5 Go distances 5 / 4, 8 vues (reste $([int](Reste)) min)"
    Client 'AtheriaPilote' $MP 'pilote' '\[PILOTE\] fin' 'pilote_*.png' ([math]::Min(25, [int](Reste) - 1))
    Copy-Item "$MP\logs\latest.log" "$Ici\latest-pilote-c17.log" -Force -ErrorAction SilentlyContinue
    Start-Sleep 3
    Move-Item "$Ess\pilote" "$Ess\pilote-v3-fondu2"; New-Item -ItemType Directory "$Ess\pilote" | Out-Null
    J "PILOTE_FINI captures=$(@(Get-ChildItem "$MP\screenshots" -Filter 'pilote_*.png').Count) (monde range : pilote-v3-fondu2)"
  } else { J "PASSE D SAUTEE : reste $([int](Reste)) min, pret=$(Test-Path "$Ess\pilote-3tp-pret\level.dat"), fondu2 existe=$(Test-Path "$Ess\pilote-v3-fondu2")" }
  J "CRENEAU17_FINI $([int]((Get-Date) - $T0).TotalMinutes) min"
} catch { J "ERREUR $_" } finally {
  if ($script:monJava -and (Get-Process -Id $script:monJava -ErrorAction SilentlyContinue)) { Stop-Process -Id $script:monJava -Force; J 'JAVA_CLIENT_ARRETE_EN_SORTIE' }
  Start-Sleep 5
  if ($script:monPrism) { Get-Process -Id $script:monPrism -ErrorAction SilentlyContinue | Stop-Process -ErrorAction SilentlyContinue; J 'PRISM_FERME' }
  foreach ($f in $rnP) { if (Test-Path "$f.bak-c9") { Remove-Item $f -Force -ErrorAction SilentlyContinue; Rename-Item "$f.bak-c9" (Split-Path $f -Leaf) } }
  Remove-Item "$MP\config\atheria_ile\relief_base.bin" -ErrorAction SilentlyContinue
  if (Test-Path "$Ici\zz_pilote_client.js.bak-c17") { Copy-Item "$Ici\zz_pilote_client.js.bak-c17" "$MP\kubejs\client_scripts\zz_pilote_client.js" -Force; Remove-Item "$Ici\zz_pilote_client.js.bak-c17"; J 'script du pilote remis' }
  Remove-Item "$MA\kubejs\client_scripts\zz_relief_client.js", "$MA\kubejs\audit\arret.json", "$MA\config\atheria_ile\relief_delta.bin", "$MA\config\atheria_ile\relief_base.bin" -ErrorAction SilentlyContinue
  foreach ($jn in "relief_E", "relief_F", "relief_G", "relief_H") { if (Test-Path "$MA\saves\$jn") { cmd /c rmdir "$MA\saves\$jn" } }
  if (Test-Path "$MA\kubejs\audit\atheria_brume.js.bak-c9") { Move-Item "$MA\kubejs\audit\atheria_brume.js.bak-c9" "$MA\kubejs\client_scripts\atheria_brume.js"; J "brume remise" }
  if (Test-Path "$MA\kubejs\audit\zz_audit_client.js.bak-c9") { Move-Item "$MA\kubejs\audit\zz_audit_client.js.bak-c9" "$MA\kubejs\client_scripts\zz_audit_client.js.bak-c9" }
  foreach ($f in $rnA) { if (Test-Path "$f.bak-c9") { Remove-Item $f -Force -ErrorAction SilentlyContinue; Rename-Item "$f.bak-c9" (Split-Path $f -Leaf) } }
  if (Test-Path "$Ess\pilote\level.dat") { try { Move-Item "$Ess\pilote" "$Ess\pilote-v3-fondu2-incomplet-$(Get-Date -Format HHmmss)"; New-Item -ItemType Directory "$Ess\pilote" | Out-Null; J 'monde pilote range : pilote-v3-fondu2-incomplet' } catch { J "monde pilote RESTE dans pilote : $_" } }
  J "instances remises : pilote $((Get-ChildItem "$MP\mods" -Filter 'atheria-ile*.jar' | ForEach-Object { "$($_.Name)=$($_.Length)" }) -join ' ') ; audit $((Get-ChildItem "$MA\mods" -Filter 'atheria-*.jar' | ForEach-Object { "$($_.Name)=$($_.Length)" }) -join ' ')"
  foreach ($fb in "$Racine\instances\AtheriaPilote\instance.cfg", "$MP\options.txt") { if (Test-Path "$fb.bak-c9c") { Copy-Item "$fb.bak-c9c" $fb -Force; Remove-Item "$fb.bak-c9c" } }
  J "pilote remis : $(Select-String -Path "$Racine\instances\AtheriaPilote\instance.cfg" -Pattern 'MaxMemAlloc=\d+' | ForEach-Object { $_.Matches[0].Value })"
  foreach ($fb in "$Racine\instances\AtheriaAudit\instance.cfg", "$MA\options.txt") { if (Test-Path "$fb.bak-c9r") { Copy-Item "$fb.bak-c9r" $fb -Force; Remove-Item "$fb.bak-c9r" } }
  J "audit remis : $(Select-String -Path "$Racine\instances\AtheriaAudit\instance.cfg" -Pattern 'MaxMemAlloc=\d+' | ForEach-Object { $_.Matches[0].Value }) $(Select-String -Path "$MA\options.txt" -Pattern '^renderDistance:\d+' | ForEach-Object { $_.Matches[0].Value })"
  foreach ($m in Get-ChildItem "$MA\mods" -Filter '*.disabled-c9') { Rename-Item $m.FullName ($m.Name -replace '\.disabled-c9$', '') }
  if (Test-Path "$C1\zz_relief_client.modele.js.bak-c9") { Copy-Item "$C1\zz_relief_client.modele.js.bak-c9" "$C1\zz_relief_client.modele.js" -Force; Remove-Item "$C1\zz_relief_client.modele.js.bak-c9" }
  if ($script:HashMods) { $h2 = (Get-ChildItem "$MA\mods" -Filter *.jar | Where-Object { $_.Name -match '^(xaeroworldmap|emotecraft|appleskin)' } | Sort-Object Name | ForEach-Object { "$($_.Name)=$($_.Length)" }) -join ';'; J "mods remis identiques : $($h2 -eq $script:HashMods)" }
  # nettoyage final : seule etape qui supprime le verrou
  $c = Contenu; if ($c -match "creneau 17 .* PID $PID") { Remove-Item $Lock -Force -ErrorAction SilentlyContinue } else { J "verrou pas a moi ($c) : laisse" }
  J "LOCK_SUPPRIME=$(-not (Test-Path $Lock))"
}
