# c22 seul dans la file apres le Trailer (C24 colline3 ; Villes deja passe a 10:28, repassera apres nous), 2 min de verrou libre,
# puis captures c22 seulement si la GRILLE de qc-c22.txt n'a aucun KO (150 s de verrou libre entre les deux pour qui attend).
$Ici = Split-Path -Parent $MyInvocation.MyCommand.Path
& powershell -NoProfile -ExecutionPolicy Bypass -File "$Ici\lancer-c22-puis-captures.ps1" -File 'trailer'
exit $LASTEXITCODE
