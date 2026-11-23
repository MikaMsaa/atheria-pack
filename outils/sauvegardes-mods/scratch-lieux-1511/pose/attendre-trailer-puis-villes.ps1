# Attend que le Trailer ait pris puis rendu le verrou (libre depuis 90 s), puis lance les captures des villes. Abandon apres 3 h.
$Lock = 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition\outils\pause-file.lock'
$t0 = Get-Date; $vuTrailer = $false; $libreDepuis = $null
while (((Get-Date) - $t0).TotalHours -lt 3) {
  $c = if (Test-Path $Lock) { try { Get-Content $Lock -Raw } catch { '?' } } else { $null }
  if ($c -and $c -match '(?i)trailer') { if (-not $vuTrailer) { "TRAILER_VU $(Get-Date -Format s) : $c" }; $vuTrailer = $true }
  if ($vuTrailer -and -not $c) { if (-not $libreDepuis) { $libreDepuis = Get-Date } } else { $libreDepuis = $null }
  if ($libreDepuis -and ((Get-Date) - $libreDepuis).TotalSeconds -ge 90) { "TRAILER_A_RENDU $(Get-Date -Format s)"; & "$PSScriptRoot\lancer-captures-villes.ps1"; exit }
  Start-Sleep 5
}
"ABANDON attente 3 h"
