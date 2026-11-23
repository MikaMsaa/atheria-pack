# Prepare un run de mesure dans la COPIE JETABLE (instance AtheriaPilote + outils\serveur-pilote-essai).
# -Mode verif|rapide|off  -Rayon 448|304  -Garde nom-du-monde-precedent  [-Centre "x z"] [-Sapling true|false]
param([string]$Mode = 'verif', [int]$Rayon = 448, [string]$Garde, [string]$Centre = '2960 -904', [string]$Sapling = 'false', [switch]$IgnorerVerrou)
$ErrorActionPreference = 'Stop'
$Ici = Split-Path -Parent $MyInvocation.MyCommand.Path
$Racine = 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition'
$M = "$Racine\instances\AtheriaPilote\minecraft"
$Ess = "$Racine\outils\serveur-pilote-essai"
if (-not $IgnorerVerrou -and (Test-Path "$Racine\outils\pause-file.lock")) { $l = Get-Content "$Racine\outils\pause-file.lock" -Raw; if ($l -match 'pilote') { throw "verrou encore a moi ?" } }
# 1. jar atheria-monde : celui du patch (off = jar d'origine)
$jar = if ($Mode -eq 'off') { "$Racine\pack\mods\atheria-monde.jar" } else { "$Ici\atheria-monde-facteur.jar" }
foreach ($d in "$M\mods", "$Ess\mods") { Remove-Item "$d\atheria-monde.jar" -Force; Copy-Item $jar "$d\atheria-monde.jar" }
# 2. mode du patch
[IO.File]::WriteAllText("$M\config\atheria-facteur.txt", $Mode); [IO.File]::WriteAllText("$Ess\config\atheria-facteur.txt", $Mode)
# 3. rayon du profil (copies jetables)
foreach ($f in "$M\config\lostcities\profiles\atheria.json", "$Ess\config\lostcities\profiles\atheria.json") {
  $t = [IO.File]::ReadAllText($f); $t = [regex]::Replace($t, '"cityMaxRadius": \d+,', "`"cityMaxRadius`": $Rayon,"); [IO.File]::WriteAllText($f, $t, (New-Object Text.UTF8Encoding $false)) }
# 4. forceSaplingGrowth
foreach ($f in "$M\config\lostcities-server.toml", "$Ess\config\lostcities-server.toml") {
  if (Test-Path $f) { $t = [IO.File]::ReadAllText($f); $t = [regex]::Replace($t, 'forceSaplingGrowth = (true|false)', "forceSaplingGrowth = $Sapling"); [IO.File]::WriteAllText($f, $t, (New-Object Text.UTF8Encoding $false)) } }
# 5. centre Chunky dans le script de mesure
$js = "$Racine\instances\AtheriaPilote\minecraft\kubejs\client_scripts\zz_perf_client.js"
$t = [IO.File]::ReadAllText($js); $t = [regex]::Replace($t, "center -?\d+ -?\d+", "center $Centre"); [IO.File]::WriteAllText($js, $t, (New-Object Text.UTF8Encoding $false))
# 6. monde neuf
& "C:\Users\El-Afdal\AppData\Local\Temp\claude\d75113947d74750a\1ff2e7b0-dd47-4f7f-9c0c-971e80afc755\scratchpad\pilote3\creer-perf.ps1" -Mode sans -Garde $Garde
Remove-Item "$M\kubejs\audit\arret.json" -ErrorAction SilentlyContinue
$jl = 'C:\Users\El-Afdal\AppData\Local\Temp\claude\d75113947d74750a\1ff2e7b0-dd47-4f7f-9c0c-971e80afc755\scratchpad\pilote\journal-pilote.txt'
if (Test-Path $jl) { Move-Item $jl "$jl.$Garde.txt" -Force }
Write-Host "PRET mode=$Mode rayon=$Rayon sapling=$Sapling centre=$Centre"
Select-String -Path "$M\config\lostcities\profiles\atheria.json" -Pattern cityMaxRadius
Select-String -Path "$M\config\lostcities-server.toml" -Pattern forceSaplingGrowth
Select-String -Path $js -Pattern 'center'
