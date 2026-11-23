# Adaptateur : profil-leger.ps1 appelle "& Script -Monde -Points -LibreMin" ; ici -Points = groupe.json de capturer.ps1.
param([string]$Monde, [string]$Points, [int]$LibreMin)
& 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition\outils\file-pc\capturer.ps1' -Groupe $Points
exit 0
