param([int]$ProcId,[string[]]$Cmds)
Add-Type -AssemblyName System.Windows.Forms
Add-Type -TypeDefinition (Get-Content "$PSScriptRoot\touche.cs" -Raw)
$h=(Get-Process -Id $ProcId).MainWindowHandle; [K4]::SetForegroundWindow($h)|Out-Null; Start-Sleep -Milliseconds 400
foreach($c in $Cmds){ [K4]::Tape(0x54); Start-Sleep -Milliseconds 500; $e=($c -replace '([+^%(){}\[\]])','{$1}') -replace '~','{~} '; [System.Windows.Forms.SendKeys]::SendWait($e); Start-Sleep -Milliseconds 300; [K4]::Tape(0x0D); Start-Sleep -Milliseconds 900 }
