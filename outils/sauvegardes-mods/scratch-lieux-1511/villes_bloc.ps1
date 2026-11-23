# ===== Batiments vitrine : produits par convertir-vitrines.py, lots de 2x2 chunks, hopital, prison et base sur 4x2 =====
$vitIdx = $null; $fv = "$PSScriptRoot\vitrines\index.json"
if (Test-Path $fv) { $vitIdx = Get-Content $fv -Raw -Encoding UTF8 | ConvertFrom-Json }
function Vit($q) { if ($vitIdx -and $vitIdx.$q) { @($vitIdx.$q.PSObject.Properties.Name) } else { @() } }
function Existe($nom) { if (-not $vitIdx) { return $false }; foreach ($p in $vitIdx.PSObject.Properties) { if ($p.Value.PSObject.Properties.Name -contains $nom) { return $true } }; $false }
# les anciens grands batiments sont remplaces par leur version vitrine quand elle existe
$GRANDS = @{ ath_hopital = 'ath_v_hp_hopital'; ath_prison = 'ath_v_pr_prison'; ath_base = 'ath_v_ba_base' }
function Multi($vitrines, $autres) {
    $h = [ordered]@{}
    for ($i = 0; $i -lt $vitrines.Count; $i += 2) { foreach ($n in (Vit $vitrines[$i])) { if (-not $GRANDS.ContainsValue($n)) { $h[$n] = $vitrines[$i + 1] } } }
    foreach ($k in $autres.Keys) { $n = $k; if ($GRANDS[$k] -and (Existe $GRANDS[$k])) { $n = $GRANDS[$k] }; $h[$n] = $autres[$k] }
    $h
}
$od = [ordered]@{}
Ville 'ath_brique' 0.45 2 5 1 ([ordered]@{ ath_maison = 2; building1 = 0.5; building5 = 0.4; ath_marche = 0.3; ath_eglise = 0.1; ath_entrepot = 0.2 }) (Multi @('bois', 0.5, 'haussmann', 0.3) ([ordered]@{ ath_hopital = 0.4; multi1 = 0.2; shopping = 0.2 }))
Ville 'ath_beton' 0.6 4 12 2 ([ordered]@{ ath_barre = 2.5; building2 = 0.6; building6 = 0.4; ath_entrepot = 0.2 }) (Multi @('beton', 1) ([ordered]@{ ath_hopital = 0.5; ath_prison = 0.3; multi2 = 0.3; library = 0.1 }))
Ville 'ath_verre' 0.7 8 22 3 ([ordered]@{ ath_tour = 3; building3 = 0.5; building4 = 0.5 }) (Multi @('verre', 1) ([ordered]@{ huge1 = 0.3; huge2 = 0.3; ath_hopital = 0.4; shopping_open = 0.2 }))
Ville 'ath_terracotta' 0.4 1 3 0 ([ordered]@{ ath_villa = 3; ath_marche = 0.6; ath_maison = 0.5; ath_eglise = 0.12 }) (Multi @('terracotta', 1) ([ordered]@{ ath_hopital = 0.15 }))
Ville 'ath_bois' 0.25 1 2 0 ([ordered]@{ ath_maison = 3; cabin = 0.6; ath_entrepot = 0.4; ath_eglise = 0.15; ath_marche = 0.3 }) (Multi @('bois', 1) ([ordered]@{ ath_prison = 0.1 }))
Ville 'ath_rouille' 0.55 1 4 1 ([ordered]@{ ath_entrepot = 3; building8 = 0.4; ath_barre = 0.4; ath_marche = 0.2 }) (Multi @('rouille', 1, 'base', 0.3) ([ordered]@{ ath_base = 0.5; ath_prison = 0.2 }))
Ville 'ath_gothique' 0.5 3 9 2 ([ordered]@{ ath_eglise = 0.7; ath_maison = 1.2; building1 = 0.4; building7 = 0.5 }) (Multi @('gothique', 1, 'prison', 0.3) ([ordered]@{ ath_prison = 0.5; center = 0.2; library = 0.3 }))
Ville 'ath_moderne' 0.35 2 5 1 ([ordered]@{ ath_villa = 1.5; ath_tour = 0.3; building2 = 0.4 }) (Multi @('moderne', 1, 'hopital', 0.3) ([ordered]@{ ath_hopital = 0.5; shopping = 0.4; shopping_open = 0.4 }))
Ville 'ath_haussmann' 0.7 5 8 2 ([ordered]@{ ath_maison = 2.5; building4 = 0.6; building1 = 0.6; ath_eglise = 0.08 }) (Multi @('haussmann', 1, 'hopital', 0.2) ([ordered]@{ center = 0.4; ath_hopital = 0.4; library = 0.2; shopping = 0.2 }))
Ville 'ath_bidonville' 0.75 1 2 0 ([ordered]@{ ath_maison = 2; cabin = 1; ath_marche = 0.5 }) (Multi @('bidonville', 1) $od)
Ville 'ath_garnison' 0.4 1 4 2 ([ordered]@{ ath_entrepot = 1.5; ath_barre = 0.6 }) (Multi @('garnison', 1, 'base', 0.5, 'prison', 0.3) ([ordered]@{ ath_base = 1.2; ath_prison = 0.4 }))
