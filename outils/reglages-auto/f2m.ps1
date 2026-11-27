param([int]$ProcId,[string]$Nom,[string]$Dossier="$env:APPDATA\ModrinthApp\profiles\Atheria-test-reglages")
# Comme f2.ps1, mais pour le profil Modrinth (ou un autre dossier de jeu)
& "$PSScriptRoot\touches.ps1" -ProcId $ProcId -Touches "71"; Start-Sleep 2
$s=Get-ChildItem "$Dossier\screenshots" | Sort LastWriteTime | Select -Last 1
Add-Type -AssemblyName System.Drawing; $i=[System.Drawing.Image]::FromFile($s.FullName); $b=New-Object System.Drawing.Bitmap $i,1280,720; $b.Save("$PSScriptRoot\captures\$Nom.png"); $b.Dispose(); $i.Dispose(); "$($s.Name) -> captures\$Nom.png"
