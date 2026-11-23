$Lock = 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition\outils\pause-file.lock'
$Ici = Split-Path -Parent $MyInvocation.MyCommand.Path
$vu = $false; $t0 = Get-Date
while ($true) {
  $e = Test-Path $Lock
  if ($e -and -not $vu) { $vu = $true; Write-Host "$(Get-Date -Format HH:mm:ss) verrou tiers vu : $(Get-Content $Lock -Raw)" }
  $go = (Test-Path "$Ici\reprends.flag")
  if ((($vu -and -not $e) -or ($go -and -not $e))) {
    try { $fs = [IO.File]::Open($Lock, 'CreateNew', 'Write'); $b = [Text.Encoding]::UTF8.GetBytes("thread ile (reprise apres Trailer : relief v2 puis essai 3 pilote) PID $PID $(Get-Date -Format s)"); $fs.Write($b, 0, $b.Length); $fs.Close(); Write-Host "$(Get-Date -Format HH:mm:ss) VERROU_REPRIS"; exit 0 } catch { Write-Host 'course perdue, on attend' ; $vu = $true }
  }
  if (((Get-Date) - $t0).TotalMinutes -gt 60) { Write-Host 'ATTENTE 60 min sans retour'; exit 1 }
  Start-Sleep 2
}
