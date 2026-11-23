# Atheria Zombie Edition - compile le mod prototype de l'ile dessinee (atheria_ile)
# Resultat : outils\atheria-ile-mod\atheria-ile.jar
# Le mod ne fait RIEN tant que le datapack atheria_ile n'est pas dans le monde (world\datapacks).

$ErrorActionPreference = 'Stop'
$Ici  = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Split-Path -Parent (Split-Path -Parent $Ici)
$Jdk  = 'C:\Program Files\Java\jdk-21\bin'
$Lib  = Join-Path $Root 'serveur\libraries'
$Tmp  = Join-Path $env:TEMP "atheria-ile-$([guid]::NewGuid())"

$cp = @()
# Exclure les jars vanilla obfusques (server-1.21.1.jar, -slim, -extra) : ils masquent les vrais noms (isRunning, halt...)
$cp += (Get-ChildItem $Lib -Recurse -Filter '*.jar' | Where-Object { $_.Name -ne 'server-1.21.1.jar' -and $_.Name -notlike '*-slim.jar' -and $_.Name -notlike '*-extra.jar' }).FullName
# MixinExtras est embarque dans NeoForge
Add-Type -AssemblyName System.IO.Compression.FileSystem
$Mx = Join-Path $env:TEMP 'mixinextras-atheria.jar'
$neo = (Get-ChildItem $Lib -Recurse -Filter 'neoforge-*-universal.jar')[0].FullName
$zip = [IO.Compression.ZipFile]::OpenRead($neo)
[IO.Compression.ZipFileExtensions]::ExtractToFile(($zip.Entries | Where-Object { $_.Name -like 'mixinextras-neoforge-*.jar' })[0], $Mx, $true)
$zip.Dispose()
$cp += $Mx
$sources = (Get-ChildItem (Join-Path $Ici 'src') -Recurse -Filter *.java).FullName

New-Item -ItemType Directory -Force $Tmp | Out-Null
& "$Jdk\javac.exe" --release 21 -encoding UTF-8 -proc:none -nowarn -cp ($cp -join ';') -d $Tmp $sources
if ($LASTEXITCODE -ne 0) { throw "javac a echoue (code $LASTEXITCODE)" }
Copy-Item (Join-Path $Ici 'ressources\*') $Tmp -Recurse -Force

$manifest = Join-Path $env:TEMP "atheria-ile-manifest-$([guid]::NewGuid()).txt"
[IO.File]::WriteAllText($manifest, "Implementation-Version: 0.3.0`nFMLModType: MOD`n")
$Out = Join-Path $Ici 'atheria-ile.jar'
& "$Jdk\jar.exe" --create --file $Out --manifest $manifest -C $Tmp .
if ($LASTEXITCODE -ne 0) { throw "jar a echoue (code $LASTEXITCODE)" }
Remove-Item $Tmp -Recurse -Force; Remove-Item $manifest -Force
Write-Host "Mod pret : $Out ($((Get-Item $Out).Length) octets)"
