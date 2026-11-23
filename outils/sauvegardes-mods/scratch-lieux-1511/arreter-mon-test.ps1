param([int]$Chaine)
# Arrete UNIQUEMENT mon test : la chaine PowerShell donnee, ses processus enfants (serveur de creation de monde lance par
# monde-neuf.ps1) et le jeu dont le PID est dans jeu-test.pid. Jamais un java d'un autre fil, jamais le verrou d'un autre fil.
$old = 'C:\Users\El-Afdal\AppData\Local\Temp\claude\C--Users-El-Afdal-Desktop-Atheria-Zombie-Edition\3b6158cc-eefc-4df2-8769-4b2d767c856c\scratchpad'
$root = 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition'
$lock = "$root\outils\pause-file.lock"
$enfants = @(Get-CimInstance Win32_Process -Filter "ParentProcessId=$Chaine" | ? { $_.Name -like 'java*' } | % { $_.ProcessId })
if (Get-Process -Id $Chaine -ErrorAction SilentlyContinue) { Stop-Process -Id $Chaine -Force; "chaine $Chaine arretee" }
foreach ($e in $enfants) { Stop-Process -Id $e -Force -ErrorAction SilentlyContinue; "serveur de creation $e arrete" }
$pf = "$old\jeu-test.pid"
if (Test-Path $pf) { $j = [int](Get-Content $pf); Get-Process -Id $j -ErrorAction SilentlyContinue | ? { $_.ProcessName -like 'java*' } | Stop-Process -Force; Remove-Item $pf; "jeu $j arrete" }
New-Item -ItemType File "$old\stop-ecran.flag" -Force | Out-Null
# le verrou n'est retire que s'il porte mon PID de chaine
if ((Test-Path $lock) -and ((Get-Content $lock -Raw) -match "thread batiments \w+ $Chaine ")) { Remove-Item $lock -Force; "verrou libere" }
# son remis si le test l'avait coupe
$opt = "$root\instances\Atheria\minecraft\options.txt"; $l = [IO.File]::ReadAllText($opt)
if ($l -match 'soundCategory_master:0\.0\b') { [IO.File]::WriteAllText($opt, ($l -replace 'soundCategory_master:0\.0\b', 'soundCategory_master:0.33651697019867555'), (New-Object Text.UTF8Encoding($false))); "son remis" }
# style de monde du pack remis dans le serveur et l'instance, proprietes du serveur remises
$ws = 'kubejs\data\lostcities\lostcities\worldstyles\atheria.json'
foreach ($d in "$root\serveur", "$root\instances\Atheria\minecraft") { Copy-Item "$root\pack\$ws" "$d\$ws" -Force }
$sp2 = "$root\serveur\server.properties"; $t = [IO.File]::ReadAllText($sp2)
$t2 = [regex]::Replace($t, '(?m)^level-name=zz-monde-\w+', 'level-name=world'); $t2 = [regex]::Replace($t2, '(?m)^level-seed=12345', 'level-seed=')
if ($t2 -ne $t) { [IO.File]::WriteAllText($sp2, $t2); "server.properties remis" }
