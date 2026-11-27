param([int]$ProcId,[string]$Nom)
& "$PSScriptRoot\touches.ps1" -ProcId $ProcId -Touches "71"; Start-Sleep 2
$s=Get-ChildItem "C:\Users\El-Afdal\Desktop\Atheria Zombie Edition\instances\Atheria-test-reglages\minecraft\screenshots" | Sort LastWriteTime | Select -Last 1
Add-Type -AssemblyName System.Drawing; $i=[System.Drawing.Image]::FromFile($s.FullName); $b=New-Object System.Drawing.Bitmap $i,1280,720; $b.Save("$PSScriptRoot\captures\$Nom.png"); $b.Dispose(); $i.Dispose(); "$($s.Name) -> captures\$Nom.png"
