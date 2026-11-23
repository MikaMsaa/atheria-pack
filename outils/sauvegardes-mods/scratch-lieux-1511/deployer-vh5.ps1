# Attend le verrou, deploie atheria-vehicules-5 et la liste (pick-up), puis banc des voitures
$sp = $PSScriptRoot
$root = 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition'
$lock = "$root\outils\pause-file.lock"
while ($true) {
  try { New-Item -ItemType File -Path $lock -Value "thread batiments deploiement-vh5 $PID $(Get-Date -Format s)" -ErrorAction Stop | Out-Null; break } catch { Start-Sleep 30 }
}
try {
  if (Get-Process java, javaw -ErrorAction SilentlyContinue | ? { $_.WS -gt 1GB }) { "jeu en cours, on attend"; while (Get-Process java, javaw -ErrorAction SilentlyContinue | ? { $_.WS -gt 1GB }) { Start-Sleep 30 } }
  foreach ($d in "$root\pack", "$root\serveur", "$root\instances\Atheria\minecraft") {
    Remove-Item "$d\mods\atheria-vehicules-4.jar" -Force -ErrorAction SilentlyContinue
    Copy-Item "$sp\ambu\atheria-vehicules-5.jar" "$d\mods\" -Force
    if ($d -notlike '*\pack') { Copy-Item "$root\pack\kubejs\data\atheria_monde\vehicules_vitrines.json" "$d\kubejs\data\atheria_monde\" -Force }
  }
  Push-Location "$root\pack"; & "$root\outils\packwiz.exe" refresh | Select-Object -Last 1; Pop-Location
  "DEPLOYE $(Get-Date -Format s)"
} finally { if ((Get-Content $lock -Raw) -match " $PID ") { Remove-Item $lock -Force } }
Remove-Item "$sp\recontrole\vo" -Recurse -Force -ErrorAction SilentlyContinue
& "$sp\banc-vh.ps1" -Series vo -RamMinMo 5500
