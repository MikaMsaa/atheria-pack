# Atheria Zombie Edition - export du pack pour le Modrinth App (.mrpack)
# 1. packwiz mr export dans pack\ (les mods CurseForge sont mis dans overrides/mods)
#    (la mise a jour automatique vient du mod atheria-maj.jar, dans pack\mods)
# 2. verifie que chaque mod CurseForge est bien dans overrides/mods, sinon le prend
#    dans instances\Atheria\minecraft\mods
# Resultat : Atheria-Zombie-Edition-<version>.mrpack a la racine du dossier

$ErrorActionPreference = 'Stop'
$Root    = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Pack    = Join-Path $Root 'pack'
$Packwiz = Join-Path $Root 'outils\packwiz.exe'
$InstMods = Join-Path $Root 'instances\Atheria\minecraft\mods'

$version = (Select-String -Path (Join-Path $Pack 'pack.toml') -Pattern '^version\s*=\s*"(.+)"').Matches[0].Groups[1].Value
$Out = Join-Path $Root "Atheria-Zombie-Edition-$version.mrpack"
$Raw = Join-Path $env:TEMP "atheria-export-$([guid]::NewGuid()).mrpack"

Push-Location $Pack
try {
    & $Packwiz refresh
    & $Packwiz mr export -o $Raw
    if ($LASTEXITCODE -ne 0) { throw "packwiz mr export a echoue (code $LASTEXITCODE)" }
} finally { Pop-Location }

# On recopie l'export dans un zip neuf : le mode 'Update' de .NET Framework laisse des CRC
# faux dans le repertoire central, et le Modrinth App refuse alors le fichier.
Add-Type -AssemblyName System.IO.Compression, System.IO.Compression.FileSystem
if (Test-Path -LiteralPath $Out) { [IO.File]::Delete($Out) }
$src = [IO.Compression.ZipFile]::OpenRead($Raw)
$zip = [IO.Compression.ZipFile]::Open($Out, 'Create')
try {
    $names = @{}
    foreach ($e in $src.Entries) {
        $names[$e.FullName] = $true
        $n = $zip.CreateEntry($e.FullName, [IO.Compression.CompressionLevel]::Optimal)
        $n.LastWriteTime = $e.LastWriteTime
        if ($e.FullName.EndsWith('/')) { continue }
        $in = $e.Open(); $outStream = $n.Open()
        try { $in.CopyTo($outStream) } finally { $outStream.Dispose(); $in.Dispose() }
    }
    function Add-Entry([string]$Name, [string]$Source) {
        if ($names.ContainsKey($Name)) { return }
        [void][IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $Source, $Name)
        $names[$Name] = $true
        Write-Host "  + $Name"
    }
    # Mods CurseForge : interdits au telechargement dans un .mrpack, ils doivent etre dans le zip
    Get-ChildItem (Join-Path $Pack 'mods') -Filter '*.pw.toml' | ForEach-Object {
        $toml = Get-Content -LiteralPath $_.FullName -Raw
        if ($toml -notmatch 'metadata:curseforge') { return }
        $jar = [regex]::Match($toml, 'filename\s*=\s*"(.+?)"').Groups[1].Value
        $jarPath = Join-Path $InstMods $jar
        if (-not $names.ContainsKey("overrides/mods/$jar") -and -not (Test-Path -LiteralPath $jarPath)) {
            throw "Mod CurseForge introuvable : $jarPath"
        }
        Add-Entry "overrides/mods/$jar" $jarPath
    }
} finally { $zip.Dispose(); $src.Dispose(); [IO.File]::Delete($Raw) }

Write-Host "Pack Modrinth pret : $Out ($([math]::Round((Get-Item $Out).Length / 1MB, 1)) Mo)"
