# 2e passe des captures c22 (15/11) : attend que Villes (passe tunnels), puis le Trailer, aient chacun pris et rendu le verrou
# (au plus 10 min d'attente pour que chacun le prenne), puis 2 min de verrou libre, puis lance lancer-captures-c22-4g.ps1
# (Xmx 4G, distance 8, simulation 4, seuil 7,0 Go, garde 400 Mo, 20 min par lot, images du phare gardees).
# Ne prend jamais le verrou lui-meme : c'est le lanceur des captures qui le prend (CreateNew) et le rend.
$ErrorActionPreference = 'Stop'
$Racine = 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition'
$Lock = "$Racine\outils\pause-file.lock"
$Ici = Split-Path -Parent $MyInvocation.MyCommand.Path
$Journal = "$Ici\journal-captures-c22.txt"
function J($t) { $l = "$(Get-Date -Format HH:mm:ss) [guetteur passe2] $t"; [IO.File]::AppendAllText($Journal, "$l`r`n"); Write-Host $l }
function Contenu { if (Test-Path $Lock) { try { Get-Content $Lock -Raw } catch { '?' } } else { $null } }
$Seuls = 'ileA,lagon,z002,hum,z003,z006,z001,z008,z010,z013,z004,z009,z011,majicavo_bord,majicavo_est,lot68_bord,poissons'
J "debut : file Villes (passe tunnels) puis Trailer, puis captures ; points $Seuls"
foreach ($f in @(@('Villes', 'villes|batiments'), @('Trailer', 'trailer'))) {
  $nom, $motif = $f; $t0 = Get-Date; $pris = $false; $dern = Get-Date '2000-01-01'
  while ($true) {
    $c = Contenu
    if ($c -and $c -match $motif -and $c -notmatch '^thread ile') { if (-not $pris) { J "$nom A PRIS : $($c.Trim())" }; $pris = $true }
    if ($pris -and -not $c) { J "$nom A RENDU"; break }
    if (-not $pris -and ((Get-Date) - $t0).TotalMinutes -gt 10) { J "$nom n'a pas pris le verrou en 10 min : on passe"; break }
    if (((Get-Date) - $dern).TotalSeconds -ge 300) { J "attente $nom : verrou=$(if ($c) { $c.Trim() } else { 'libre' })"; $dern = Get-Date }
    if (((Get-Date) - $t0).TotalMinutes -gt 150) { J "ABANDON : $nom garde le verrou depuis plus de 150 min"; exit 1 }
    Start-Sleep 5
  }
}
# 2 min de verrou libre d'affilee
$libDep = $null
while ($true) {
  $c = Contenu
  if ($c) { $libDep = $null } elseif (-not $libDep) { $libDep = Get-Date }
  if ($libDep -and ((Get-Date) - $libDep).TotalSeconds -ge 120) { break }
  Start-Sleep 5
}
J '2 min de verrou libre : lancement des captures'
& powershell -NoProfile -ExecutionPolicy Bypass -File "$Ici\lancer-captures-c22-4g.ps1" -LibreClient 7000 -MemClient 4096 -Garde 400 -MaxLot 20 -BudgetMin 120 -GarderCaptures -Seuls $Seuls
J "fin du lanceur des captures (code $LASTEXITCODE)"
