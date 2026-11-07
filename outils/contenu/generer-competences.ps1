# Genere l'arbre de competences de survivant (Pufferfish's Skills) : bricolage, medecine, tir.
param([string]$Root = (Resolve-Path "$PSScriptRoot\..\..").Path)
$ErrorActionPreference = 'Stop'
$b = "$Root\pack\kubejs\data\puffish_skills\puffish_skills"
$c = "$b\categories\survivant"
$utf8 = New-Object Text.UTF8Encoding($false)
function Ecrire($p, $o) { $d = Split-Path $p; if (-not (Test-Path $d)) { New-Item -ItemType Directory $d -Force | Out-Null }; [IO.File]::WriteAllText($p, ($o | ConvertTo-Json -Depth 20), $utf8) }
Ecrire "$b\config.json" @{ version = 3; categories = @('survivant') }
Ecrire "$c\category.json" ([ordered]@{
        title               = 'Survivant'
        description         = "Ce que le monde d'apres t'a appris."
        icon                = @{ type = 'item'; data = @{ item = 'minecraft:compass' } }
        background          = 'textures/gui/advancements/backgrounds/stone.png'
        unlocked_by_default = $true
        exclusive_root      = $false
        starting_points     = 0
    })
function Tag($t) { @{ type = 'puffish_skills:tag'; data = @{ tag = $t } } }
function Attr($a, $v, $op = 'addition') { @{ type = 'puffish_skills:attribute'; data = @{ attribute = $a; value = $v; operation = $op } } }
function Def($titre, $desc, $item, $recompenses) { [ordered]@{ title = $titre; description = $desc; icon = @{ type = 'item'; data = @{ item = $item } }; rewards = @($recompenses) } }
$defs = [ordered]@{
    bricolage_1 = Def 'Mains habiles' 'Les pieces detachees reparent deux fois plus.' 'atheria:pieces_vehicule' @((Tag 'skill_bricolage_1'))
    bricolage_2 = Def 'Tuyau patient' 'Un reservoir d''epave donne presque toujours quelque chose.' 'atheria:kit_siphon' @((Tag 'skill_bricolage_2'))
    bricolage_3 = Def 'Moteur regle' 'Ton moteur porte moins loin : il attire moins d''infectes.' 'minecraft:redstone' @((Tag 'skill_bricolage_3'))
    medecine_1  = Def 'Filtres bien visses' 'Un filtre dure moitie plus longtemps.' 'atheria:filtre' @((Tag 'skill_medecine_1'))
    medecine_2  = Def 'Poumons solides' 'Tu tiens plus longtemps sans masque dans l''air contamine.' 'minecraft:honey_bottle' @((Tag 'skill_medecine_2'))
    medecine_3  = Def 'Peau tannee' 'Un peu d''armure naturelle.' 'minecraft:leather' @((Attr 'minecraft:generic.armor' 1))
    tir_1       = Def 'Oeil froid' 'Tes tirs font 5 % de degats en plus.' 'minecraft:arrow' @((Tag 'skill_tir_1'))
    tir_2       = Def 'Main ferme' 'Tes tirs font encore 5 % de degats en plus.' 'minecraft:spectral_arrow' @((Tag 'skill_tir_2'))
    tir_3       = Def 'Tireur sur' 'Tes tirs font encore 5 % de degats en plus.' 'minecraft:crossbow' @((Tag 'skill_tir_3'))
}
Ecrire "$c\definitions.json" $defs
$skills = [ordered]@{}
$connexions = @()
$col = @{ bricolage = -80; medecine = 0; tir = 80 }
foreach ($n in 'bricolage', 'medecine', 'tir') {
    foreach ($i in 1..3) {
        $s = [ordered]@{ x = $col[$n]; y = -48 + 48 * ($i - 1); definition = "${n}_$i" }
        if ($i -eq 1) { $s.root = $true }
        $skills["${n}_$i"] = $s
        if ($i -gt 1) { $connexions += , @("${n}_$($i - 1)", "${n}_$i") }
    }
}
Ecrire "$c\skills.json" $skills
$lignes = @(); foreach ($p in $connexions) { $lignes += '["' + $p[0] + '","' + $p[1] + '"]' }
[IO.File]::WriteAllText("$c\connections.json", '[' + ($lignes -join ",`n") + ']', $utf8)
Ecrire "$c\experience.json" ([ordered]@{
        experience_per_level = @{ type = 'expression'; data = @{ expression = 'min(40 + level * 30, 400)' } }
        level_limit          = 9
        sources              = @(@{
                type = 'puffish_skills:kill_entity'
                data = @{
                    variables    = @{
                        dropped_xp = @{ operations = @(@{ type = 'get_dropped_experience' }) }
                        max_health = @{ operations = @(@{ type = 'get_killed_living_entity' }, @{ type = 'get_max_health' }) }
                    }
                    experience   = 'dropped_xp + max_health / 20'
                    anti_farming = @{ limit_per_chunk = 15; reset_after_seconds = 300 }
                }
            })
    })
"competences generees"
