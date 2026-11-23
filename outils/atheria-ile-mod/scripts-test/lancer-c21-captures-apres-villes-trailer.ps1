# 15/11 09:51 : file Villes (~25 min) puis Trailer C25 (~15 min), chacun 5 min pour prendre ; puis 2 min de verrou libre, c21, son QC, et les captures si la GRILLE n'a aucun KO.
$Ici = Split-Path -Parent $MyInvocation.MyCommand.Path
& powershell -NoProfile -ExecutionPolicy Bypass -File "$Ici\lancer-c21-puis-captures.ps1" -File 'villes,trailer'
exit $LASTEXITCODE
