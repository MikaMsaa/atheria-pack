# Enchaine c20, c21 et les captures c21, chacun avec son propre verrou (pris puis rendu par le script lui-meme).
# Entre deux etapes : 3 min de pause verrou libre, pour qu'un autre fil qui attend puisse le prendre ; chaque etape attend ensuite son tour.
# Ne lance rien d'autre. Un echec n'empeche pas l'etape suivante, sauf les captures qui demandent le monde c21m.
$Ici = Split-Path -Parent $MyInvocation.MyCommand.Path
$Journal = "$Ici\journal-enchainement-c21.txt"
function J($t) { $l = "$(Get-Date -Format HH:mm:ss) $t"; [IO.File]::AppendAllText($Journal, "$l`r`n"); Write-Host $l }
$etapes = @('lancer-c20.ps1', 'lancer-c21.ps1', 'lancer-captures-c21.ps1')
for ($i = 0; $i -lt $etapes.Count; $i++) {
  if ($i -gt 0) { J "pause de 3 min, verrou libre ($(Test-Path 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition\outils\pause-file.lock'))"; Start-Sleep 180 }
  J "ETAPE $($etapes[$i])"
  & powershell -NoProfile -ExecutionPolicy Bypass -File "$Ici\$($etapes[$i])"
  J "FIN $($etapes[$i]) code $LASTEXITCODE"
}
J 'ENCHAINEMENT_FINI'
