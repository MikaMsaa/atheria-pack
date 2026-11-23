param([string]$Root)
cmd /c "$PSScriptRoot\construire-mod.cmd"
Get-Content "$PSScriptRoot\build.txt" | Where-Object { $_ -match 'error:|Mod pret|echoue|symbol|location' } | Select-Object -First 25
foreach($d in "$Root\instances\Atheria\minecraft","$Root\pack","$Root\serveur"){ Copy-Item "$Root\outils\atheria-monde-mod\atheria-monde.jar" "$d\mods\atheria-monde.jar" -Force }
(Get-Item "$Root\outils\atheria-monde-mod\atheria-monde.jar").Length
