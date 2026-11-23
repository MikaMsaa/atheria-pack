# Analyse hors ligne (python seul, pas de java ni de verrou) du monde n094h (0.9.4f berges douces) apres lancer-c16.ps1.
# Reference : n094g (0.9.4e v3h, memes zones) ; bruit e/g deja mesure : bit3 0, EMERGE 0 (riv) / 2 (hum), INONDE 47 / 37.
$Ici = Split-Path -Parent $MyInvocation.MyCommand.Path; $SP = $Ici
$E = 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition\outils\serveur-pilote-essai'
$Sortie = "$Ici\analyse-c16.txt"
if (-not (Test-Path "$E\pilote-bis-n094h\region")) { "n094h absent : lancer-c16.ps1 n'a pas tourne" | Tee-Object $Sortie; exit 1 }
$j = @()
foreach ($z in @(@('riv', '-2150', '3990'), @('hum', '3330', '860'))) {
  $j += Start-Job { param($Ici, $SP, $E, $z)
    & python -I "$Ici\verif_berges.py" "$E\pilote-bis-n094g" "$E\pilote-bis-n094h" $z[1] $z[2] 150 "$($z[0]) berges g/h" "$SP\sonde\$($z[0]).bin" 2>&1
    & python -I "$Ici\verif_berges.py" "$E\pilote-bis-n094g" "$E\pilote-bis-n094i" $z[1] $z[2] 150 "$($z[0]) parametre a 0 g/i (doit rester dans le bruit)" "$SP\sonde\$($z[0]).bin" 2>&1
    & python -I "$Ici\compte_bancs.py" "$E\pilote-bis-n094a" "$E\pilote-bis-n094h" $z[1] $z[2] 150 "$SP\sonde\$($z[0]).bin" 2>&1
    & python -I "$Ici\profil_berges.py" "$E\pilote-bis-n094g" "$SP\sonde\$($z[0]).bin" 2>&1
    & python -I "$Ici\profil_berges.py" "$E\pilote-bis-n094h" "$SP\sonde\$($z[0]).bin" 2>&1
  } -ArgumentList $Ici, $SP, $E, $z
}
$j | Wait-Job -Timeout 3000 | Receive-Job | Tee-Object $Sortie
