# Remplace atheria-vehicules-3 par -4 (carcasse brulee refaite) dans l'instance au moment du banc, puis banc des voitures
$sp = $PSScriptRoot
$mods = 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition\instances\Atheria\minecraft\mods'
$root = 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition'
$lock = "$root\outils\pause-file.lock"
while ((Test-Path $lock) -or (Get-Process java, javaw -ErrorAction SilentlyContinue | ? { $_.WS -gt 1GB })) { Start-Sleep 30 }
Remove-Item "$mods\atheria-vehicules-3.jar" -Force -ErrorAction SilentlyContinue
Copy-Item "$sp\ambu\atheria-vehicules-4.jar" "$mods\" -Force
Remove-Item "$sp\recontrole\vo" -Recurse -Force -ErrorAction SilentlyContinue
& "$sp\banc-vh.ps1" -Series vo -RamMinMo 5500
