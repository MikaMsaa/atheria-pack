# Travail "script" de la file PC (verrou tenu par la file) : passe de captures en profil JVM leger.
# Ecrit un groupe.json a un seul travail, puis profil-leger.ps1 (Xmx 4096, sans -Vue) lance capturer.ps1 via passe3c-adaptateur.ps1.
# profil-leger remet instance.cfg et options.txt octet pour octet ; capturer remet le reste (MD5 avant/apres).
param([Parameter(Mandatory = $true)][string]$Interne, [int]$Xmx = 4096)
$ErrorActionPreference = 'Stop'
$FP = 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition\outils\file-pc'
. "$FP\commun.ps1"
if (-not (FP-VerrouTenuParFile)) { throw 'le verrou doit etre tenu par la file (verrou: file)' }
$j = FP-LireJson $Interne
$jid = if ($env:FILE_PC_JOB) { "$($env:FILE_PC_JOB)-interne" } else { "manuel-$(Get-Date -Format yyyyMMdd-HHmmss)" }
$j | Add-Member -NotePropertyName id -NotePropertyValue $jid -Force
$gid = "leger-$(Get-Date -Format yyyyMMdd-HHmmss)"; $W = "$FP_Dir\travail\$gid"; New-Item -ItemType Directory -Force $W | Out-Null
FP-EcrireJson "$W\groupe.json" ([ordered]@{ gid = $gid; lanceur_pid = $env:FILE_PC_VERROU; jobs = @($j) })
"$(Get-Date -Format HH:mm:ss) groupe $gid ecrit ($jid), libre=$(FP-Libre)"
# arret demande par la file -> arret propre de capturer (fichier $W\arret)
$veille = $null
if ($env:FILE_PC_ARRET) { $veille = Start-Job -ArgumentList $env:FILE_PC_ARRET, "$W\arret" -ScriptBlock { param($a, $b) while (-not (Test-Path $a)) { Start-Sleep 5 }; Set-Content $b 'arret' } }
try {
  & "$FP\profil-leger.ps1" -Instance AtheriaAudit -Xmx $Xmx -Script "$PSScriptRoot\passe3c-adaptateur.ps1" -Points "$W\groupe.json"
} finally { if ($veille) { Stop-Job $veille -ErrorAction SilentlyContinue; Remove-Job $veille -Force -ErrorAction SilentlyContinue } }
$rf = "$W\resultats.json"
if (-not (Test-Path $rf)) { "pas de resultats.json (voir $W\journal.txt)"; exit 1 }
$r = (FP-LireJson $rf).$jid
Copy-Item $rf "$($j.sortie)\resultats-$gid.json" -Force; Copy-Item "$W\journal.txt" "$($j.sortie)\journal-$gid.txt" -Force -ErrorAction SilentlyContinue
"RESULTAT $($r.statut) : $($r.obtenues)/$($r.attendues) images ; manquantes : $($r.manquantes -join ', ') ; poissons : $($r.poissons -join ' | ') ; incidents : $($r.incidents -join ' | ')"
if ($r.statut -eq 'ok') { exit 0 } else { exit 1 }
