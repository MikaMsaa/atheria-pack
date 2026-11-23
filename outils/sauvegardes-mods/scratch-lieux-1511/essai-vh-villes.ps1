param([string]$Monde = 'ZZ Vehicules 1', [string]$Graine = '7301', [string]$Script = 'zz_vh_villes.js', [int]$RamMinMo = 6500, [int]$AttenteMin = 900)
# Essai de la pose des vehicules MTS dans une ville neuve. Verrou partage, un seul jeu, attente de RAM.
# Les versions d'essai (mod atheria-monde, batiments sans maquettes, liste des vehicules) ne sont posees dans
# l'instance que le temps de l'essai ; ensuite l'instance est remise exactement comme avant, et le serveur de test comme le pack.
$sp = $PSScriptRoot
$old = 'C:\Users\El-Afdal\AppData\Local\Temp\claude\C--Users-El-Afdal-Desktop-Atheria-Zombie-Edition\3b6158cc-eefc-4df2-8769-4b2d767c856c\scratchpad'
$root = 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition'
$lock = "$root\outils\pause-file.lock"
$inst = "$root\instances\Atheria\minecraft"
$srv = "$root\serveur"
$essai = "$env:TEMP\vh-essai"
$sauv = "$essai\instance-avant"
$t0 = Get-Date; $tenu = $false; $pose = $false
function Dispo { [int](Get-CimInstance Win32_PerfFormattedData_PerfOS_Memory).AvailableMBytes }
function Parts($vers, $de) { Copy-Item "$de\kubejs\data\lostcities\lostcities\parts\ath_v_*" "$vers\kubejs\data\lostcities\lostcities\parts\" -Force }
try {
  while (((Get-Date) - $t0).TotalMinutes -lt $AttenteMin) {
    try { New-Item -ItemType File -Path $lock -Value "thread batiments essai-vh $PID $(Get-Date -Format s)" -ErrorAction Stop | Out-Null; $tenu = $true } catch {}
    if ($tenu) {
      $j = Get-Process java, javaw -ErrorAction SilentlyContinue | ? { $_.WS -gt 1GB }
      if (-not $j -and (Dispo) -ge $RamMinMo) { break }
      Remove-Item $lock -Force; $tenu = $false
    }
    Start-Sleep 30
  }
  if (-not $tenu) { "ABANDON attente $(Dispo) Mo $(Get-Date -Format s)"; exit }
  "LANCE $(Get-Date -Format s) RAM $(Dispo) Mo"
  # sauvegarde de l'instance telle qu'elle est (son mod n'est pas celui du pack)
  New-Item -ItemType Directory -Force "$sauv\kubejs\data\lostcities\lostcities\parts" | Out-Null
  Copy-Item "$inst\mods\atheria-monde.jar" "$sauv\atheria-monde.jar" -Force
  Parts $sauv $inst
  $pose = $true
  # le jar de l'instance est un lien dur avec AtheriaRecit : on le supprime avant de copier, l'autre instance garde le sien
  Remove-Item "$inst\mods\atheria-monde.jar" -Force
  foreach ($d in $inst, $srv) {
    Copy-Item "$root\outils\atheria-monde-mod\atheria-monde.jar" "$d\mods\atheria-monde.jar" -Force
    Parts $d "$essai\essai"
    New-Item -ItemType Directory -Force "$d\kubejs\data\atheria_monde" | Out-Null
    Copy-Item "$essai\essai\kubejs\data\atheria_monde\vehicules_vitrines.json" "$d\kubejs\data\atheria_monde\" -Force
  }
  Copy-Item "$sp\ambu\atheria-vehicules-4.jar" "$srv\mods\" -Force
  & powershell -NoProfile -ExecutionPolicy Bypass -File "$old\monde-neuf.ps1" -Root $root -Nom $Monde -Seed $Graine
  $debut = Get-Date
  & powershell -NoProfile -ExecutionPolicy Bypass -File "$old\run-test-vit.ps1" -Root $root -World $Monde -TimeoutSec 2400 -Script $Script
  $dest = "$sp\recontrole\vh-villes"; New-Item -ItemType Directory -Force $dest | Out-Null
  Get-ChildItem "$inst\screenshots" -Filter 'vit-*.png' | ? { $_.LastWriteTime -gt $debut } | Move-Item -Destination $dest -Force
  "FINI $(Get-Date -Format s)"
} finally {
  if ($pose) {
    Remove-Item "$inst\mods\atheria-monde.jar" -Force -ErrorAction SilentlyContinue
    Copy-Item "$sauv\atheria-monde.jar" "$inst\mods\atheria-monde.jar" -Force
    Parts $inst $sauv
    Remove-Item "$inst\kubejs\data\atheria_monde" -Recurse -Force -ErrorAction SilentlyContinue
    Copy-Item "$root\pack\mods\atheria-monde.jar" "$srv\mods\atheria-monde.jar" -Force
    Parts $srv "$root\pack"
    Remove-Item "$srv\kubejs\data\atheria_monde" -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item "$srv\mods\atheria-vehicules-*.jar" -Force -ErrorAction SilentlyContinue
    "instance remise comme avant, serveur de test comme le pack"
  }
  if ($tenu -and (Test-Path $lock) -and ((Get-Content $lock -Raw) -match " $PID ")) { Remove-Item $lock -Force }
}
