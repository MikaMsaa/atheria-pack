# Attend la fin de l'extension 3 de colline2, puis c21, puis (si la GRILLE du QC c21 n'a aucun KO) les captures c21.
$Ici = Split-Path -Parent $MyInvocation.MyCommand.Path
& powershell -NoProfile -ExecutionPolicy Bypass -File "$Ici\lancer-c21-puis-captures.ps1" -ApresExt3
exit $LASTEXITCODE
