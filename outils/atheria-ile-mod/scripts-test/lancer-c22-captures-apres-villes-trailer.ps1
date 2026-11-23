# c22 seul dans la file apres Villes puis le Trailer (5 min a chacun pour prendre le verrou, puis on attend qu'il le rende), 2 min de verrou libre,
# puis captures c22 seulement si la GRILLE de qc-c22.txt n'a aucun KO (150 s de verrou libre entre les deux pour qui attend).
$Ici = Split-Path -Parent $MyInvocation.MyCommand.Path
& powershell -NoProfile -ExecutionPolicy Bypass -File "$Ici\lancer-c22-puis-captures.ps1" -File 'villes,trailer'
exit $LASTEXITCODE
