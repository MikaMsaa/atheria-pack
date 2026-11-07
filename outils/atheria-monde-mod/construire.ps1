# Atheria Zombie Edition - compile le mod d'ajustements (structures, figure de sante)
# Resultat : outils\atheria-monde-mod\atheria-monde.jar (a copier dans pack\mods, l'instance et le serveur)

$ErrorActionPreference = 'Stop'
$Ici  = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Split-Path -Parent (Split-Path -Parent $Ici)
$Jdk  = 'C:\Program Files\Java\jdk-21\bin'
$Lib  = Join-Path $Root 'serveur\libraries'
$Mods = Join-Path $Root 'instances\Atheria\minecraft\mods'
$Tmp  = Join-Path $env:TEMP "atheria-monde-$([guid]::NewGuid())"

$cp = @()
$Prism = Join-Path $env:APPDATA 'PrismLauncher\libraries'
$cp += Join-Path $Prism 'net\neoforged\neoforge\21.1.265\neoforge-21.1.265-client.jar'
$cp += Join-Path $Prism 'net\minecraft\client\1.21.1-20240808.144430\client-1.21.1-20240808.144430-srg.jar'
$cp += Join-Path $Lib 'net\neoforged\neoforge\21.1.265\neoforge-21.1.265-universal.jar'
$cp += (Get-ChildItem $Lib -Recurse -Filter 'sponge-mixin-*.jar').FullName
$cp += (Get-ChildItem $Lib -Recurse -Include 'datafixerupper-*.jar','brigadier-*.jar','authlib-*.jar','bus-*.jar','logging-*.jar','log4j-api-*.jar','guava-*.jar').FullName
$cp += (Get-ChildItem $Mods -Filter 'lostcities-*.jar').FullName
$cp += (Get-ChildItem $Mods -Filter 'firstaid-*.jar').FullName
$cp += (Get-ChildItem $Mods -Filter 'spore_*.jar').FullName
foreach ($motif in 'entity_model_features*.jar','entity_texture_features*.jar','tacz-*.jar','ParCool-*.jar','player-animation-lib-forge-*.jar','Jade-*.jar','firstperson-*.jar') { $cp += (Get-ChildItem $Mods -Filter $motif).FullName }
$cp += (Get-ChildItem (Join-Path $Prism 'com\google\code\gson'),(Join-Path $Prism 'org\lwjgl'),(Join-Path $Prism 'org\joml'),(Join-Path $Prism 'com\mojang\authlib') -Recurse -Include 'gson-*.jar','lwjgl-3*.jar','lwjgl-glfw-3*.jar','authlib-*.jar','joml-*.jar' | Where-Object { $_.Name -notmatch 'natives|sources' }).FullName
# Moteur de tutoriels : le jar interne de Create
Add-Type -AssemblyName System.IO.Compression.FileSystem
$Ponder = Join-Path $env:TEMP 'ponder-atheria.jar'
$zipCreate = [IO.Compression.ZipFile]::OpenRead((Get-ChildItem $Mods -Filter 'create-*.jar')[0].FullName)
[IO.Compression.ZipFileExtensions]::ExtractToFile(($zipCreate.Entries | Where-Object { $_.Name -like 'ponder-*.jar' })[0], $Ponder, $true)
$zipCreate.Dispose()
$cp += $Ponder
$sources = (Get-ChildItem (Join-Path $Ici 'src') -Recurse -Filter *.java).FullName

New-Item -ItemType Directory -Force $Tmp | Out-Null
& "$Jdk\javac.exe" --release 21 -encoding UTF-8 -proc:none -nowarn -cp ($cp -join ';') -d $Tmp $sources
if ($LASTEXITCODE -ne 0) { throw "javac a echoue (code $LASTEXITCODE)" }
Copy-Item (Join-Path $Ici 'ressources\*') $Tmp -Recurse -Force

$manifest = Join-Path $env:TEMP "atheria-monde-manifest-$([guid]::NewGuid()).txt"
[IO.File]::WriteAllText($manifest, "Implementation-Version: 1.0.0`nFMLModType: MOD`n")
$Out = Join-Path $Ici 'atheria-monde.jar'
& "$Jdk\jar.exe" --create --file $Out --manifest $manifest -C $Tmp .
if ($LASTEXITCODE -ne 0) { throw "jar a echoue (code $LASTEXITCODE)" }
Remove-Item $Tmp -Recurse -Force; Remove-Item $manifest -Force
Write-Host "Mod pret : $Out ($((Get-Item $Out).Length) octets)"
