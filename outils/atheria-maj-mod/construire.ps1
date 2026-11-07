# Atheria Zombie Edition - compile le mod de mise a jour automatique
# Resultat : outils\atheria-maj-mod\atheria-maj.jar (a copier dans pack\mods)

$ErrorActionPreference = 'Stop'
$Ici  = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Split-Path -Parent (Split-Path -Parent $Ici)
$Jdk  = 'C:\Program Files\Java\jdk-21\bin'
$Lib  = Join-Path $Root 'serveur\libraries'
$Tmp  = Join-Path $env:TEMP "atheria-maj-$([guid]::NewGuid())"

$cp = @(
    (Join-Path $Lib 'cpw\mods\modlauncher\11.0.5\modlauncher-11.0.5.jar'),
    (Join-Path $Lib 'net\sf\jopt-simple\jopt-simple\5.0.4\jopt-simple-5.0.4.jar')
) -join ';'
$sources = (Get-ChildItem (Join-Path $Ici 'src') -Recurse -Filter *.java).FullName

New-Item -ItemType Directory -Force (Join-Path $Tmp 'META-INF\services') | Out-Null
& "$Jdk\javac.exe" --release 21 -encoding UTF-8 -cp $cp -d $Tmp $sources
if ($LASTEXITCODE -ne 0) { throw "javac a echoue (code $LASTEXITCODE)" }

[IO.File]::WriteAllText((Join-Path $Tmp 'META-INF\services\cpw.mods.modlauncher.api.ITransformationService'), "fr.atheria.maj.AtheriaMajService`n")
Copy-Item (Join-Path $Root 'outils\modrinth\packwiz-installer-bootstrap.jar') $Tmp
$manifest = Join-Path $env:TEMP "atheria-maj-manifest-$([guid]::NewGuid()).txt"
[IO.File]::WriteAllText($manifest, "Automatic-Module-Name: atheria.maj`nImplementation-Version: 1.0.0`n")

$Out = Join-Path $Ici 'atheria-maj.jar'
& "$Jdk\jar.exe" --create --file $Out --manifest $manifest -C $Tmp .
if ($LASTEXITCODE -ne 0) { throw "jar a echoue (code $LASTEXITCODE)" }
Remove-Item $Tmp -Recurse -Force; Remove-Item $manifest -Force
Write-Host "Mod pret : $Out ($((Get-Item $Out).Length) octets)"
