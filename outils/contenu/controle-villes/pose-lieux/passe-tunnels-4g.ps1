# Passe tunnels avec la memoire du jeu ramenee a 4 Go (instance.cfg remis a l'identique apres) : demarre des que
# le verrou est libre et qu'il y a 6,7 Go libres pendant 30 s. Ne tient jamais le verrou lui-meme. Abandon apres 1 h.
$Lock = 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition\outils\pause-file.lock'
$Cfg = 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition\instances\AtheriaAudit\instance.cfg'
function Libre { [int]((Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory / 1024) }
$t0 = Get-Date; $ok = $null; $dern = Get-Date
while (((Get-Date) - $t0).TotalHours -lt 1) {
  $l = Libre; $pris = Test-Path $Lock
  if (-not $pris -and $l -ge 6700) { if (-not $ok) { $ok = Get-Date } } else { $ok = $null }
  if (((Get-Date) - $dern).TotalMinutes -ge 5) { "$(Get-Date -Format HH:mm:ss) ATTENTE libre=$l verrou=$pris"; $dern = Get-Date }
  if ($ok -and ((Get-Date) - $ok).TotalSeconds -ge 30) {
    "$(Get-Date -Format HH:mm:ss) DEPART libre=$l"
    $orig = [IO.File]::ReadAllBytes($Cfg)
    $txt = [Text.Encoding]::UTF8.GetString($orig) -replace 'MaxMemAlloc=\d+', 'MaxMemAlloc=4096'
    [IO.File]::WriteAllBytes($Cfg, [Text.Encoding]::UTF8.GetBytes($txt))
    try { & "$PSScriptRoot\lancer-captures-villes.ps1" -Monde lieux_5 -Points points-galeries.json -LibreMin 6000; $code = $LASTEXITCODE }
    finally { [IO.File]::WriteAllBytes($Cfg, $orig); "instance.cfg remis a l'original" }
    if ($code -ne 3) { 'PASSE_FINIE'; exit 0 }
    $ok = $null
  }
  Start-Sleep 10
}
'ABANDON attente 1 h'
