# Jar atheria-monde de TEST (copie jetable) = jar de base (lu seulement) + FacteurVilleMixin. Ne touche ni pack ni serveur.
param([string]$Base, [string]$Sortie)
$ErrorActionPreference = 'Stop'
$Ici  = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition'
$Jdk  = 'C:\Program Files\Java\jdk-21\bin'
$Lib  = Join-Path $Root 'serveur\libraries'
$Mods = Join-Path $Root 'instances\AtheriaPilote\minecraft\mods'
$Prism = Join-Path $env:APPDATA 'PrismLauncher\libraries'
$cp = @()
$cp += Join-Path $Prism 'net\neoforged\neoforge\21.1.265\neoforge-21.1.265-client.jar'
$cp += Join-Path $Prism 'net\minecraft\client\1.21.1-20240808.144430\client-1.21.1-20240808.144430-srg.jar'
$cp += Join-Path $Lib 'net\neoforged\neoforge\21.1.265\neoforge-21.1.265-universal.jar'
$cp += (Get-ChildItem $Lib -Recurse -Filter 'sponge-mixin-*.jar').FullName
$cp += (Get-ChildItem $Lib -Recurse -Include 'datafixerupper-*.jar','asm-9*.jar','asm-tree-*.jar','guava-*.jar','logging-*.jar').FullName
$cp += (Get-ChildItem $Mods -Filter 'lostcities-*.jar').FullName
$Tmp = Join-Path $Ici 'classes'
if (Test-Path $Tmp) { Remove-Item $Tmp -Recurse -Force }
New-Item -ItemType Directory $Tmp | Out-Null
& "$Jdk\javac.exe" --release 21 -encoding UTF-8 -proc:none -nowarn -cp ($cp -join ';') -d $Tmp (Join-Path $Ici 'src\fr\atheria\monde\mixin\FacteurVilleMixin.java')
if ($LASTEXITCODE -ne 0) { throw "javac code $LASTEXITCODE" }
# mixins.json : celui du jar actuel + FacteurVilleMixin
if (-not $Base) { $Base = Join-Path $Root 'pack\mods\atheria-monde.jar' }
if (-not $Sortie) { $Sortie = 'atheria-monde-facteur.jar' }
$Out = Join-Path $Ici $Sortie
if ((Test-Path $Out) -and ((Resolve-Path $Out).Path -eq (Resolve-Path $Base).Path)) { throw 'sortie = base' }
Copy-Item $Base $Out -Force
Add-Type -AssemblyName System.IO.Compression.FileSystem
$z = [IO.Compression.ZipFile]::OpenRead($Base); $e = $z.GetEntry('atheria_monde.mixins.json'); $r = New-Object IO.StreamReader($e.Open()); $json = $r.ReadToEnd(); $r.Close(); $z.Dispose()
if ($json -notmatch 'FacteurVilleMixin') { $json = $json -replace '"mixins": \["GenerationStructuresMixin",', '"mixins": ["GenerationStructuresMixin", "FacteurVilleMixin",' }
if ($json -notmatch 'FacteurVilleMixin') { throw 'mixins.json non modifie' }
[IO.File]::WriteAllText((Join-Path $Tmp 'atheria_monde.mixins.json'), $json, (New-Object Text.UTF8Encoding $false))
& "$Jdk\jar.exe" --update --file $Out -C $Tmp .
if ($LASTEXITCODE -ne 0) { throw "jar code $LASTEXITCODE" }
Write-Host "OK $Out $((Get-Item $Out).Length) octets"
