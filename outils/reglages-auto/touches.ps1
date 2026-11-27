param([int]$ProcId,[string]$Touches)
Add-Type -TypeDefinition (Get-Content "$PSScriptRoot\touche.cs" -Raw)
$h=(Get-Process -Id $ProcId).MainWindowHandle; [K4]::SetForegroundWindow($h)|Out-Null; Start-Sleep -Milliseconds 400
foreach($t in $Touches.Split(',')){ if($t -eq 'pause'){Start-Sleep -Milliseconds 700} else {[K4]::Tape([byte][Convert]::ToInt32($t,16))} }
