# Atheria Zombie Edition - compile le mod de cinematiques et de dialogues
# Resultat : outils\atheria-recit-mod\atheria-recit.jar (a copier dans pack\mods, l'instance et le serveur)
# Pas de Gradle : javac compile directement contre les jars de Minecraft et NeoForge deja presents sur le PC.

$ErrorActionPreference = 'Stop'
$Ici  = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Split-Path -Parent (Split-Path -Parent $Ici)
$Jdk  = 'C:\Program Files\Java\jdk-21\bin'
$Lib  = Join-Path $Root 'serveur\libraries'
$Prism = Join-Path $env:APPDATA 'PrismLauncher\libraries'
$Tmp  = Join-Path $env:TEMP "atheria-recit-$([guid]::NewGuid())"

$cp = @()
$cp += Join-Path $Prism 'net\neoforged\neoforge\21.1.265\neoforge-21.1.265-client.jar'
$cp += Join-Path $Prism 'net\minecraft\client\1.21.1-20240808.144430\client-1.21.1-20240808.144430-srg.jar'
$cp += Join-Path $Lib 'net\neoforged\neoforge\21.1.265\neoforge-21.1.265-universal.jar'
# toutes les bibliotheques du serveur (FML, bus, brigadier, netty, gson, mixin...), sauf Minecraft et NeoForge cote serveur
$cp += (Get-ChildItem $Lib -Recurse -Filter *.jar | Where-Object { $_.FullName -notmatch '\\net\\minecraft\\|\\net\\neoforged\\neoforge\\' }).FullName
$cp += (Get-ChildItem (Join-Path $Prism 'org\lwjgl'),(Join-Path $Prism 'org\joml') -Recurse -Include 'lwjgl-3*.jar','lwjgl-glfw-3*.jar','joml-*.jar' | Where-Object { $_.Name -notmatch 'natives|sources' }).FullName
$sources = (Get-ChildItem (Join-Path $Ici 'src') -Recurse -Filter *.java).FullName

New-Item -ItemType Directory -Force $Tmp | Out-Null
$ErrorActionPreference = 'Continue'
& "$Jdk\javac.exe" --release 21 -encoding UTF-8 -proc:none -nowarn -Xmaxerrs 30 -cp ($cp -join ';') -d $Tmp $sources 2>&1 | ForEach-Object { "$_" }
$code = $LASTEXITCODE
$ErrorActionPreference = 'Stop'
if ($code -ne 0) { throw "javac a echoue (code $code)" }
Copy-Item (Join-Path $Ici 'ressources\*') $Tmp -Recurse -Force

$manifest = Join-Path $env:TEMP "atheria-recit-manifest-$([guid]::NewGuid()).txt"
[IO.File]::WriteAllText($manifest, "Implementation-Version: 1.0.0`nFMLModType: MOD`n")
$Out = Join-Path $Ici 'atheria-recit.jar'
& "$Jdk\jar.exe" --create --file $Out --manifest $manifest -C $Tmp .
if ($LASTEXITCODE -ne 0) { throw "jar a echoue (code $LASTEXITCODE)" }
Remove-Item $Tmp -Recurse -Force; Remove-Item $manifest -Force
Write-Host "Mod pret : $Out ($((Get-Item $Out).Length) octets)"
