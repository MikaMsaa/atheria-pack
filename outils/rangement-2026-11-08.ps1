# Rangement du dossier Atheria valide par Mika le 08/11/2026. -Essai = affiche seulement.
param([switch]$Essai)
$R = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path "$R\pack\pack.toml")) { $R = (Resolve-Path "$PSScriptRoot\..").Path }
if (-not (Test-Path "$R\pack\pack.toml")) { throw "Racine Atheria introuvable" }
Set-Location $R
$log = New-Object System.Collections.Generic.List[string]
function Taille($p){ if(Test-Path -LiteralPath $p){ (Get-ChildItem -LiteralPath $p -Recurse -Force -File -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum } else {0} }
$total = 0
function Suppr($p){
  if (-not (Test-Path -LiteralPath $p)) { $log.Add("absent : $p"); return }
  $t = Taille $p; $script:total += $t
  if ($Essai) { $log.Add(("[essai] suppr {0:N0} Mo : {1}" -f ($t/1MB), $p)); return }
  try { Remove-Item -LiteralPath $p -Recurse -Force -ErrorAction Stop; $log.Add(("suppr {0:N0} Mo : {1}" -f ($t/1MB), $p)) }
  catch { $log.Add("ECHEC suppr $p : $($_.Exception.Message)") }
}
function Depl($a,$b){
  if (-not (Test-Path -LiteralPath $a)) { $log.Add("absent : $a"); return }
  if (Test-Path -LiteralPath $b) { $log.Add("ECHEC deja present : $b"); return }
  if ($Essai) { $log.Add("[essai] $a -> $b"); return }
  New-Item -ItemType Directory -Force (Split-Path $b) | Out-Null
  try { Move-Item -LiteralPath $a -Destination $b -ErrorAction Stop; $log.Add("depl $a -> $b") } catch { $log.Add("ECHEC depl $a : $($_.Exception.Message)") }
}
# Deplacements
Depl 'ffmpeg-master-latest-win64-gpl-shared' 'outils\ffmpeg'
foreach($f in 'telecharger-mods.ps1','Telecharger les mods.bat','liste-des-mods.csv'){ Depl $f "outils\ancien-telechargement\$f" }
Depl 'schematics\00_planche_complete.png' 'docs\captures\schematics-apercu.png'
Depl 'schematics\LISEZ-MOI.md' 'docs\captures\schematics-LISEZ-MOI.md'
if (-not $Essai -and (Test-Path schematics) -and -not (Get-ChildItem schematics -Force)) { Remove-Item schematics }
Depl 'docs\pl-nuit38.png' 'docs\captures\nuit-shader-38.png'
Depl 'docs\coffre-ajoute-ville.png' 'docs\captures\coffre-ajoute-ville.png'
Depl 'docs\logs-bugs-serveur' 'docs\archives\logs\logs-bugs-serveur'
Depl 'docs\logs-test-quetes' 'docs\archives\logs\logs-test-quetes'
# Suppressions
foreach($v in '1.0.0','1.0.4','1.0.5','1.0.6','1.0.7'){ Suppr "Atheria-Zombie-Edition-$v.mrpack" }
Suppr 'pack.zip'; Suppr 'config-backup'; Suppr 'outils\mods-retires'; Suppr 'outils\shaders-retires'; Suppr 'client\mods-desactives'
$V='docs\vitrine-batiments'
foreach($d in (1..15 | % {"grands-$_"}) + 'architectures-1','architectures-2','lot2','integration-villes-35','integration-villes-35b','integration-villes-36'){ Suppr "$V\$d" }
Get-ChildItem $V -File -Filter *.png -ErrorAction SilentlyContinue | % { Suppr $_.FullName }
$S='instances\Atheria\minecraft\saves'
foreach($w in 'ZZ Villes 34','ZZ Villes 35','ZZ Villes 36','ZZ Contenu 10','Nouveau monde','Nouveau monde (1)','Nouveau monde (2)'){ Suppr "$S\$w" }
foreach($w in 'zz-monde-38eeed10','zz-monde-4c9dc20a','zz-monde-5c3f2db3','zz-monde-781f72d8'){ Suppr "serveur\$w" }
$lim=(Get-Date).AddDays(-7)
foreach($d in 'instances\Atheria\minecraft\crash-reports','instances\Atheria\minecraft\logs','serveur\crash-reports','serveur\logs'){
  Get-ChildItem $d -File -ErrorAction SilentlyContinue | ? { $_.LastWriteTime -lt $lim } | % { Suppr $_.FullName } }
$log.Add(("TOTAL {0:N0} Mo" -f ($total/1MB)))
$log | Out-File -Encoding utf8 "$R\docs\archives\rangement-2026-11-08.log" -ErrorAction SilentlyContinue
$log
