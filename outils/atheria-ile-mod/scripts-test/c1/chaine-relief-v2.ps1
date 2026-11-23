$Ici = Split-Path -Parent $MyInvocation.MyCommand.Path
& powershell -NoProfile -ExecutionPolicy Bypass -File "$Ici\lancer-relief-v2.ps1" -GarderVerrou
if (Select-String -Path "$Ici\journal-relief-v2.txt" -Pattern 'ERREUR|REFUS' -Quiet) { Write-Host 'v2 en erreur : pas de captures'; exit 1 }
& powershell -NoProfile -ExecutionPolicy Bypass -File "$Ici\lancer-relief-captures2.ps1" -ReprendreVerrou -GarderVerrou
