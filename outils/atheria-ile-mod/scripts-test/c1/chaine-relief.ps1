$Ici = Split-Path -Parent $MyInvocation.MyCommand.Path
& powershell -NoProfile -ExecutionPolicy Bypass -File "$Ici\lancer-relief.ps1" -GarderVerrou
if (Select-String -Path "$Ici\journal-relief.txt" -Pattern 'ERREUR' -Quiet) { Write-Host 'banc en erreur : pas de captures'; exit 1 }
& powershell -NoProfile -ExecutionPolicy Bypass -File "$Ici\lancer-relief-captures.ps1" -ReprendreVerrou -GarderVerrou
