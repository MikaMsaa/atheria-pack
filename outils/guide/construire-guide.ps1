# Atheria Zombie Edition - traduction francaise de ParCool
# Source : parcool-fr.json ; produit : pack\kubejs\assets\parcool
# Le Guide du survivant lui-meme est pack\kubejs\assets\atheria\guide\guide.json, lu en jeu tel quel.

$ErrorActionPreference = 'Stop'
$Ici  = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Split-Path -Parent (Split-Path -Parent $Ici)
$u    = New-Object Text.UTF8Encoding($false)

function Ecrire($Chemin, $Texte) {
    New-Item -ItemType Directory -Force (Split-Path $Chemin) | Out-Null
    [IO.File]::WriteAllText($Chemin, $Texte, $u)
}

$Fr = [IO.File]::ReadAllText((Join-Path $Ici 'parcool-fr.json'), $u) | ConvertFrom-Json
$Dest = Join-Path $Root 'pack\kubejs\assets\parcool'
$nb = 0
foreach ($prop in $Fr.PSObject.Properties) {
    if ($prop.Name -eq 'lang') { Ecrire (Join-Path $Dest 'lang\fr_fr.json') ($prop.Value | ConvertTo-Json -Depth 3); continue }
    Ecrire (Join-Path $Dest "parcool_guide\fr_fr\$($prop.Name)") $prop.Value; $nb++
}
"ParCool : $nb pages"
