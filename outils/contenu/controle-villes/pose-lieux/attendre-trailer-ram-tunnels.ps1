# Attend verrou libre + RAM libre >= 7600 Mo pendant 30 s, puis lance la passe villes sur lieux_4. Ne tient jamais le verrou lui-meme. Abandon apres 2 h.
$Lock = 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition\outils\pause-file.lock'
function Libre { [int]((Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory / 1024) }
$t0 = Get-Date; $ok = $null; $dern = Get-Date; $vuTrailer = $false
while (((Get-Date) - $t0).TotalHours -lt 3) {
  $l = Libre; $pris = Test-Path $Lock
  if ($pris) { try { if ((Get-Content $Lock -Raw) -match '(?i)trailer') { if (-not $vuTrailer) { "$(Get-Date -Format HH:mm:ss) TRAILER_VU" }; $vuTrailer = $true } } catch {} }
  if ($vuTrailer -and -not $pris -and $l -ge 7600) { if (-not $ok) { $ok = Get-Date } } else { $ok = $null }
  if (((Get-Date) - $dern).TotalMinutes -ge 5) { "$(Get-Date -Format HH:mm:ss) ATTENTE libre=$l verrou=$pris"; $dern = Get-Date }
  if ($ok -and ((Get-Date) - $ok).TotalSeconds -ge 30) {
    "$(Get-Date -Format HH:mm:ss) DEPART libre=$l"
    & "$PSScriptRoot\lancer-captures-villes.ps1" -Monde lieux_6 -Points points-galeries.json
    if ($LASTEXITCODE -ne 3) { 'PASSE_FINIE'; exit 0 }
    $ok = $null
  }
  Start-Sleep 10
}
'ABANDON attente 2 h'
