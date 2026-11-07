# Atheria Zombie Edition - telechargement des mods (Minecraft 1.21.1 / NeoForge)
# Source : API Modrinth. Les dependances obligatoires sont ajoutees automatiquement.
# Resultat :
#   client\mods  = mods communs + mods client (dossier "mods" de l'instance joueur)
#   serveur\mods = mods communs + mods serveur (dossier "mods" du serveur)

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$GameVersion = '1.21.1'
$Loader      = 'neoforge'
$Root        = Split-Path -Parent $MyInvocation.MyCommand.Path
$Api         = 'https://api.modrinth.com/v2'
$Headers     = @{ 'User-Agent' = 'Atheria-Zombie-Edition/1.0 (modpack prive)' }

# En cas d'erreur imprevue, on affiche le message et on garde la fenetre ouverte
trap {
    Write-Host "ERREUR : $($_.Exception.Message)" -ForegroundColor Red
    Read-Host 'Appuie sur Entree pour fermer'
    exit 1
}

# Appel Modrinth avec nouvel essai : Modrinth limite a 300 requetes par minute,
# au-dela il refuse (erreur 429) et des mods ou dependances manquaient.
function Invoke-Modrinth([string]$Uri, [string]$OutFile) {
    for ($try = 1; $try -le 6; $try++) {
        try {
            Start-Sleep -Milliseconds 250
            if ($OutFile) {
                # Telechargement dans un fichier temporaire puis copie en .NET : certains noms
                # contiennent des crochets [ ] que PowerShell prend pour des jokers.
                $tmp = Join-Path $env:TEMP ('atheria-' + [guid]::NewGuid() + '.tmp')
                Invoke-WebRequest -Headers $Headers -Uri $Uri -OutFile $tmp -UseBasicParsing
                [IO.File]::Copy($tmp, $OutFile, $true)
                [IO.File]::Delete($tmp)
                return
            }
            return Invoke-RestMethod -Headers $Headers -Uri $Uri
        } catch {
            # On ne reessaie que les erreurs reseau ou de Modrinth (trop de requetes, serveur occupe)
            if ($_.Exception -isnot [System.Net.WebException]) { throw }
            $code = 0
            if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode }
            if ($code -ge 400 -and $code -lt 500 -and $code -ne 429) { throw }
            $wait = 15 * $try
            Write-Host "    Modrinth ne repond pas (code $code), nouvel essai dans $wait s" -ForegroundColor DarkYellow
            Start-Sleep -Seconds $wait
        }
    }
    throw "Echec apres 6 essais : $Uri"
}

# slug Modrinth -> cote
$Mods = [ordered]@{
    # Client + serveur
    'fungal-infectionspore'   = 'commun'
    'the-hordes'              = 'commun'
    'enhanced-celestials-2-core' = 'commun'   # Enhanced Celestials 2 (remplace EC1, incompatible)
    'enhanced-celestials-2-default-lunar-events' = 'commun'
    'immersive-vehicles'      = 'commun'   # moteur seul, un pack de vehicules sera ajoute
    'easy-npc'                = 'commun'
    'guard-villagers'         = 'commun'
    'macaws-furniture'        = 'commun'
    'jade'                    = 'commun'
    'appleskin'               = 'commun'
    'kubejs'                  = 'commun'   # scripts du pack (recettes, butin)
    'curios'                  = 'commun'
    'lootjs'                  = 'commun'   # butin scripte pour la campagne de quetes
    'subtle-effects'          = 'commun'
    'abandoned-city-buildings' = 'commun'   # generation : avant de creer le monde
    'create-fallout'          = 'commun'   # generation : avant de creer le monde
    'yungs-cave-biomes'       = 'commun'   # generation : avant de creer le monde
    # Dependances que certains mods ne declarent pas sur Modrinth (vu au premier lancement)
    'yungs-api'               = 'commun'   # YUNG's Cave Biomes + tous les YUNG's
    'terrablender'            = 'commun'   # YUNG's Cave Biomes
    'geckolib'                = 'commun'   # YUNG's Cave Biomes
    'explorers-compass'       = 'commun'
    'natures-compass'         = 'commun'
    'sophisticated-storage'   = 'commun'
    'macaws-doors'            = 'commun'
    'emotecraft'              = 'commun'
    'tacz-1.21.1'             = 'commun'
    'first-aid-new'           = 'commun'
    'the-lost-cities'         = 'commun'
    'lootr'                   = 'commun'
    'create'                  = 'commun'
    'farmers-delight'         = 'commun'
    'serene-seasons'          = 'commun'
    'better-combat'           = 'commun'
    'carry-on'                = 'commun'
    'corpse'                  = 'commun'
    'jei'                     = 'commun'
    'architectury-api'        = 'commun'   # requis par FTB Quests (a prendre sur CurseForge)
    'open-parties-and-claims' = 'commun'
    'simple-voice-chat'       = 'commun'
    'sophisticated-backpacks' = 'commun'
    'structory'               = 'commun'
    'supplementaries'         = 'commun'
    'modernfix'               = 'commun'
    'ferrite-core'            = 'commun'
    'lithium'                 = 'commun'
    # Confort (QoL)
    'comforts'                = 'commun'   # sacs de couchage et hamacs
    'polymorph'               = 'commun'   # choix quand deux recettes se chevauchent
    'ping-wheel'              = 'commun'   # marquer un point pour son groupe
    'fastworkbench'           = 'commun'
    'pick-up-notifier'        = 'commun'
    'xaeros-world-map'        = 'commun'   # carte du monde, fair-play comme la minimap
    'dynamic-flashlight'      = 'commun'   # lampe torche a piles, sans mod de lumiere dynamique (remplace En-V)
    'spoiled'                 = 'commun'   # nourriture perissable (remplace Food Spoilage, bloque sur CurseForge)
    # Survie (ajouts valides par Mika le 28/10)
    'trydeas-meleez'          = 'commun'   # armes de melee improvisees (requiert GeckoLib, deja present)
    'simple-burnout-torch'    = 'commun'   # torches qui s'eteignent, rallumables au briquet
    'naturalist'              = 'commun'   # animaux sauvages
    # 'naturallith' retire : son jar (1.0.3) est une copie de Naturalist (meme modId "naturalist")
    # -> doublon au demarrage ; la compat Terralith est deja integree a Naturalist 2.0.7.
    # Jar mis de cote dans mods-desactives.
    'thirst-was-taken'        = 'commun'   # soif, eau sale a purifier
    'thirst-canteen'          = 'commun'   # gourdes pour Thirst Was Taken
    # Construction et deco (schematics des lieux)
    'worldedit'               = 'commun'
    'create-deco'             = 'commun'
    'macaws-roofs'            = 'commun'
    'macaws-lights-and-lamps' = 'commun'
    'macaws-fences-and-walls' = 'commun'
    'chipped'                 = 'commun'
    # Client uniquement
    'sodium'                    = 'client'
    'sodium-extra'              = 'client'
    'iris'                      = 'client'
    'immediatelyfast'           = 'client'
    'entityculling'             = 'client'
    'moreculling'               = 'client'
    'badoptimizations'          = 'client'
    'dynamic-fps'               = 'client'
    # 'sodium-dynamic-lights' et 'reeses-sodium-options' retires : sodiumoptionsapi (requis par
    # Dynamic Lights) exige Reese's, mais Reese's 2.2.4 se declare incompatible avec lui -> crash au demarrage
    'lambdynamiclights'         = 'client'   # lumieres dynamiques (torche tenue en main)
    'shoulder-surfing-reloaded' = 'client'
    'sound-physics-remastered'  = 'client'
    'xaeros-minimap'            = 'client'
    'ambientsounds'             = 'client'
    'fancymenu'                 = 'client'
    'inventory-profiles-next'   = 'client'
    'controlling'               = 'client'   # recherche de touches + affichage des conflits
    'particle-rain'             = 'client'
    'entity-model-features'     = 'client'
    'entitytexturefeatures'     = 'client'
    'cameraoverhaul'            = 'client'
    'not-enough-animations'     = 'client'
    'first-person-model'        = 'client'
    '3dskinlayers'              = 'client'
    'itemphysic-lite'           = 'client'
    'drippy-loading-screen'     = 'client'
    'sound'                     = 'client'   # mod "Sounds" : 170 effets sonores retravailles
    'mouse-tweaks'              = 'client'
    'chat-heads'                = 'client'
    'true-darkness-biomes'      = 'client'   # nuits vraiment noires (remplace Truly Dark, bloque sur CurseForge)
    'pf-neoforge'               = 'client'   # Presence Footsteps : bruits de pas selon la surface
    'enhanced-celestials-2-shader-support' = 'client'   # lunes EC2 avec les shaders (Iris)
    # Serveur uniquement
    'spark'                  = 'serveur'
    'chunky'                 = 'serveur'
    'immersive-optimization' = 'serveur'
    'improved-mobs'          = 'serveur'
    # Generation du monde (a installer AVANT de creer le monde)
    'terralith'               = 'serveur'
    'tectonic'                = 'serveur'
    'geophilic'               = 'serveur'
    'yungs-better-dungeons'   = 'serveur'
    'yungs-better-mineshafts' = 'serveur'
    'explorify'               = 'serveur'
    'repurposed-structures-forge' = 'serveur'
    'structory-towers'        = 'serveur'
    'sparsestructures'        = 'serveur'
    'yungs-bridges'           = 'serveur'
    'yungs-better-strongholds' = 'serveur'
    'clumps'                   = 'serveur'   # regroupe les orbes d'XP
    'leaves-be-gone'           = 'serveur'   # feuilles qui disparaissent vite
}

# Versions imposees (memes que dans pack\mods) : slug Modrinth -> numero de version
$Pinned = @{
    'spoiled'              = '6.2.3'
    'true-darkness-biomes' = '1.2.1'
    'pf-neoforge'          = '1.21.1-1.12.0-beta.1'   # seule version NeoForge 1.21.1 (beta)
}

# Packs de ressources et shaders (cote joueurs) : slug Modrinth -> loader, dossier
$Assets = [ordered]@{
    'fresh-animations'         = @('minecraft', 'resourcepacks')
    'complementary-reimagined' = @('iris', 'shaderpacks')
    'hysteria-shaders'         = @('iris', 'shaderpacks')
}

$ClientDir = Join-Path $Root 'client\mods'
$ServerDir = Join-Path $Root 'serveur\mods'
New-Item -ItemType Directory -Force -Path $ClientDir, $ServerDir | Out-Null

# Fichiers du passage precedent : ceux qui ne sont plus dans la liste (mods retires ou anciennes
# versions) seront supprimes a la fin. Les mods ajoutes a la main (CurseForge) ne sont pas touches.
$PreviousCsv = Join-Path $Root 'liste-des-mods.csv'
$PreviousFiles = @()
if (Test-Path $PreviousCsv) { $PreviousFiles = @(Import-Csv -Path $PreviousCsv -Delimiter ';' | ForEach-Object { $_.Fichier }) }

# Fichiers a retirer explicitement (mods CurseForge ajoutes a la main qui posent probleme)
#  - FTB XMod Compat 21.1.14 : FTB Library 2101.1.38 exige 2101.1.14 ou plus et refuse de demarrer
#  - Truly Dark et Food Spoilage : bloques par CurseForge, remplaces par True Darkness Biomes et Spoiled
$Retires = @('ftb-xmod-compat-*.jar', 'trulydark-*.jar', 'foodspoil-*.jar')
foreach ($dir in $ClientDir, $ServerDir, (Join-Path $Root 'instances\Atheria\minecraft\mods')) {
    foreach ($pattern in $Retires) {
        if (Test-Path $dir) { Get-ChildItem -Path $dir -Filter $pattern | Remove-Item -Force }
    }
}

$Done    = @{}   # project_id -> fichier deja telecharge
$Report  = New-Object System.Collections.Generic.List[object]
$Missing = New-Object System.Collections.Generic.List[string]

function Get-BestVersion([string]$Project, [string]$LoaderName = $Loader) {
    $loaders = [uri]::EscapeDataString("[`"$LoaderName`"]")
    $games   = [uri]::EscapeDataString("[`"$GameVersion`"]")
    $list = Invoke-Modrinth "$Api/project/$Project/version?loaders=$loaders&game_versions=$games"
    if (-not $list) { return $null }
    if ($Pinned.ContainsKey($Project)) {
        return $list | Where-Object { $_.version_number -eq $Pinned[$Project] } | Select-Object -First 1
    }
    $release = $list | Where-Object { $_.version_type -eq 'release' } | Select-Object -First 1
    if ($release) { return $release }
    return $list | Select-Object -First 1
}

function Install-Mod([string]$Project, [string]$Side, [string]$RequiredBy, $Version) {
    if (-not $Version) {
        try { $Version = Get-BestVersion $Project } catch { $Version = $null }
    }
    if (-not $Version) {
        $Missing.Add("$Project (pas de version $Loader $GameVersion)")
        return
    }
    $id = $Version.project_id
    if ($Done.ContainsKey($id)) {
        # Deja present : on le copie seulement s'il manque de l'autre cote
        $entry = $Done[$id]
        if ($Side -ne $entry.Side -and $entry.Side -ne 'commun') {
            $other = if ($entry.Side -eq 'serveur') { $ClientDir } else { $ServerDir }
            [IO.File]::Copy($entry.Path, (Join-Path $other $entry.File), $true)
            $entry.Side = 'commun'
        }
        return
    }
    $file = $Version.files | Where-Object { $_.primary } | Select-Object -First 1
    if (-not $file) { $file = $Version.files | Select-Object -First 1 }

    $target = if ($Side -eq 'serveur') { $ServerDir } else { $ClientDir }
    $path = Join-Path $target $file.filename
    if ((Test-Path -LiteralPath $path) -and ((Get-Item -LiteralPath $path).Length -eq $file.size)) {
        Write-Host "  = $($file.filename) (deja present)"
    } else {
        Write-Host "  + $($file.filename)"
        Invoke-Modrinth $file.url $path
    }
    if ($Side -eq 'commun') { [IO.File]::Copy($path, (Join-Path $ServerDir $file.filename), $true) }

    $Done[$id] = @{ Path = $path; File = $file.filename; Side = $Side }
    $Report.Add([pscustomobject]@{
        Mod = $Project; Fichier = $file.filename; Version = $Version.version_number
        Cote = $Side; RequisPar = $RequiredBy
    })

    foreach ($dep in $Version.dependencies) {
        if ($dep.dependency_type -ne 'required' -or -not $dep.project_id) { continue }
        $depVersion = $null
        if ($dep.version_id) {
            try { $depVersion = Invoke-Modrinth "$Api/version/$($dep.version_id)" } catch { }
            # Certains auteurs pointent vers une version d'une autre version de Minecraft : on l'ignore
            if ($depVersion -and -not (($depVersion.game_versions -contains $GameVersion) -and ($depVersion.loaders -contains $Loader))) {
                $depVersion = $null
            }
        }
        try { Install-Mod $dep.project_id $Side $Project $depVersion }
        catch { $Missing.Add("$($dep.project_id) (dependance de $Project) : $($_.Exception.Message)") }
    }
}

Write-Host "Atheria Zombie Edition - $($Mods.Count) mods a telecharger ($Loader $GameVersion)"
foreach ($slug in $Mods.Keys) {
    Write-Host "$slug"
    try { Install-Mod $slug $Mods[$slug] '' $null }
    catch { $Missing.Add("$slug : $($_.Exception.Message)") }
}

foreach ($slug in $Assets.Keys) {
    $loaderName, $folder = $Assets[$slug]
    Write-Host "$slug"
    try { $v = Get-BestVersion $slug $loaderName } catch { $v = $null }
    if (-not $v) { $Missing.Add("$slug (pas de version $GameVersion)"); continue }
    $file = $v.files | Where-Object { $_.primary } | Select-Object -First 1
    if (-not $file) { $file = $v.files | Select-Object -First 1 }
    $dir = Join-Path $Root "client\$folder"
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    $assetPath = Join-Path $dir $file.filename
    if (-not ((Test-Path -LiteralPath $assetPath) -and ((Get-Item -LiteralPath $assetPath).Length -eq $file.size))) {
        Write-Host "  + $($file.filename)"
        try { Invoke-Modrinth $file.url $assetPath } catch { $Missing.Add("$slug : $($_.Exception.Message)"); continue }
    }
    $Report.Add([pscustomobject]@{
        Mod = $slug; Fichier = $file.filename; Version = $v.version_number
        Cote = "client ($folder)"; RequisPar = ''
    })
}

# Suppression des fichiers du passage precedent qui ne sont plus utilises
$Keep = @{}
foreach ($r in $Report) { $Keep[$r.Fichier] = $true }
foreach ($old in $PreviousFiles) {
    if (-not $old -or $Keep.ContainsKey($old)) { continue }
    foreach ($dir in $ClientDir, $ServerDir, (Join-Path $Root 'client\resourcepacks'), (Join-Path $Root 'client\shaderpacks'),
                     (Join-Path $Root 'instances\Atheria\minecraft\mods'), (Join-Path $Root 'instances\Atheria\minecraft\resourcepacks'), (Join-Path $Root 'instances\Atheria\minecraft\shaderpacks')) {
        $f = Join-Path $dir $old
        if (Test-Path -LiteralPath $f) { Write-Host "  - $old (retire)"; [IO.File]::Delete($f) }
    }
}

# Instance Prism Launcher prete a jouer : instances\Atheria
# (dans Prism : Parametres > Launcher > Dossiers > Instances = ce dossier "instances")
$NeoForgeVersion = '21.1.265'
$Instance = Join-Path $Root 'instances\Atheria'
$Game = Join-Path $Instance 'minecraft'
New-Item -ItemType Directory -Force -Path (Join-Path $Game 'mods'), (Join-Path $Game 'resourcepacks'), (Join-Path $Game 'shaderpacks') | Out-Null
$utf8 = New-Object System.Text.UTF8Encoding($false)
$packJson = @"
{
    "components": [
        { "important": true, "uid": "net.minecraft", "version": "$GameVersion" },
        { "uid": "net.neoforged", "version": "$NeoForgeVersion" }
    ],
    "formatVersion": 1
}
"@
[IO.File]::WriteAllText((Join-Path $Instance 'mmc-pack.json'), $packJson, $utf8)
$cfg = Join-Path $Instance 'instance.cfg'
if (-not (Test-Path $cfg)) {
    # Cree une seule fois : les reglages que tu changes ensuite dans Prism sont conserves
    $cfgText = "[General]`r`nConfigVersion=1.2`r`nInstanceType=OneSix`r`nname=Atheria Zombie Edition`r`niconKey=default`r`nOverrideMemory=true`r`nMinMemAlloc=2048`r`nMaxMemAlloc=8192`r`n"
    [IO.File]::WriteAllText($cfg, $cfgText, $utf8)
}
function Copy-Folder([string]$From, [string]$To) {
    if (-not (Test-Path -LiteralPath $From)) { return }
    Get-ChildItem -LiteralPath $From -File | ForEach-Object {
        [IO.File]::Copy($_.FullName, (Join-Path $To $_.Name), $true)
    }
}
Copy-Folder $ClientDir (Join-Path $Game 'mods')
foreach ($folder in 'resourcepacks', 'shaderpacks') {
    Copy-Folder (Join-Path $Root "client\$folder") (Join-Path $Game $folder)
}
# Reglages Atheria pour Complementary : le fichier doit porter le nom exact du zip + ".txt"
$shaderSettings = Join-Path $Root 'client\reglages-shaders\Atheria - reglages Complementary.txt'
if (Test-Path -LiteralPath $shaderSettings) {
    Get-ChildItem (Join-Path $Game 'shaderpacks') -Filter 'ComplementaryReimagined*.zip' | ForEach-Object {
        $target = "$($_.FullName).txt"
        # On ne l'ecrase pas si le joueur a deja change ses reglages
        if (-not (Test-Path -LiteralPath $target)) { [IO.File]::Copy($shaderSettings, $target) }
    }
}
Write-Host "Instance Prism mise a jour : $Instance"

$csv = Join-Path $Root 'liste-des-mods.csv'
$Report | Export-Csv -Path $csv -NoTypeInformation -Encoding UTF8 -Delimiter ';'

Write-Host ''
Write-Host "Termine : $($Report.Count) fichiers (dependances comprises). Liste : $csv"
if ($Missing.Count) {
    Write-Host 'Introuvables sur Modrinth pour cette version :' -ForegroundColor Yellow
    $Missing | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
}
Read-Host 'Appuie sur Entree pour fermer'
