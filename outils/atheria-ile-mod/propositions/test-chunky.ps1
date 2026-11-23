$R = 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition'
$T = "$R\outils\serveur-ile-test"
$lock = "$R\outils\pause-file.lock"
$mem = "$T\memoire-chunky.txt"
$log = "$T\logs\latest.log"
$java = 'C:\Program Files\Eclipse Adoptium\jdk-21.0.13.9-hotspot\bin\java.exe'
function Note($m) { Write-Output "$(Get-Date -f HH:mm:ss) $m" }
function Lourds($sauf) { @(Get-Process java,javaw -ErrorAction SilentlyContinue | Where-Object { $_.WorkingSet64 -gt 1GB -and $_.Id -ne $sauf }) }
function Libre { [int]((Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory / 1KB) }

# Pre-generation Chunky : carre de 2000 x 2000 blocs centre sur la zone de test, mesure de vitesse et de RAM
$centreX = -4640; $centreZ = -3000; $rayon = 1000
if (-not (Get-ChildItem "$T\mods" -Filter 'Chunky*.jar' -ErrorAction SilentlyContinue)) { Note 'CHUNKY_ABSENT (mods de la copie de test)'; exit 11 }
# 0) attendre au moins 4500 Mo libres AVANT de prendre le lock (60 min au plus)
$fin0 = (Get-Date).AddMinutes(60)
while ($true) {
  $l0 = Libre
  if ($l0 -ge 4500) { Note "RAM_DEPART_OK ${l0}Mo"; break }
  Note "RAM_DEPART_INSUFFISANTE ${l0}Mo"
  if ((Get-Date) -gt $fin0) { Note 'STOP_RAM_DEPART_60MIN'; exit 10 }
  Start-Sleep 120
}
# 1) lock atomique
$fin = (Get-Date).AddMinutes(90)
while ($true) {
  try { New-Item -ItemType File -Path $lock -Value 'atheria_ile chunky' -ErrorAction Stop | Out-Null; Note 'LOCK_PRIS'; break }
  catch { Note "lock deja present, attente"; if ((Get-Date) -gt $fin) { Note 'STOP_LOCK_90MIN'; exit 6 }; Start-Sleep 120 }
}
$cmd = $null; $javaId = 0
try {
  # 2) aucun java lourd
  $fin = (Get-Date).AddMinutes(90)
  while ($true) {
    $l = Lourds 0
    if ($l.Count -eq 0) { Note 'LIBRE'; break }
    Note "attente : $(($l | % { "$($_.Name)$($_.Id):$([int]($_.WorkingSet64/1MB))MB" }) -join ',')"
    if ((Get-Date) -gt $fin) { Note 'STOP_RAM_90MIN'; exit 7 }
    Start-Sleep 120
  }
  # 2b) au moins 2 Go libres, 30 min au plus
  $fin = (Get-Date).AddMinutes(30)
  while ($true) {
    $libre = Libre
    if ($libre -ge 4000) { Note "RAM_LIBRE ${libre}Mo"; break }
    Note "RAM_INSUFFISANTE ${libre}Mo"
    if ((Get-Date) -gt $fin) { Note 'STOP_RAM_LIBRE_30MIN'; exit 8 }
    Start-Sleep 120
  }
  # 3) lancement via cmd (sorties vers fichiers), entree standard gardee pour pouvoir taper "stop"
  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = "$env:SystemRoot\System32\cmd.exe"
  $psi.Arguments = "/c `"`"$java`" @user_jvm_args.txt @libraries/net/neoforged/neoforge/21.1.265/win_args.txt --world ile_test_1 --nogui > sortie-serveur-chunky.txt 2> sortie-serveur-chunky.err`""
  $psi.WorkingDirectory = $T
  $psi.UseShellExecute = $false
  $psi.RedirectStandardInput = $true
  $psi.CreateNoWindow = $true
  $cmd = [System.Diagnostics.Process]::Start($psi)
  $debut = Get-Date
  for ($k = 0; $k -lt 30 -and $javaId -eq 0; $k++) {
    Start-Sleep 1
    $f = Get-CimInstance Win32_Process -Filter "ParentProcessId=$($cmd.Id)" | Where-Object { $_.Name -eq 'java.exe' } | Select-Object -First 1
    if ($f) { $javaId = [int]$f.ProcessId }
  }
  Note "LANCE cmd=$($cmd.Id) java=$javaId"
  if ($javaId -eq 0) { Note 'JAVA_INTROUVABLE'; if (-not $cmd.HasExited) { $cmd.Kill() }; exit 9 }
  "debut $(Get-Date -f 'yyyy-MM-dd HH:mm:ss') java=$javaId" | Set-Content $mem -Encoding utf8
  $dernierChangement = Get-Date; $derniereTaille = -1; $autresVus = @{}
  $envoye = $false; $fini = $false
  function Ecrire($c) { try { $cmd.StandardInput.WriteLine($c); $cmd.StandardInput.Flush(); Note "CMD $c" } catch { Note "commande impossible : $_" } }
  while ($true) {
    Start-Sleep 15
    $libre = Libre
    $pp = Get-Process -Id $javaId -ErrorAction SilentlyContinue
    $ram = if ($pp) { [int]($pp.WorkingSet64 / 1MB) } else { -1 }
    $autres = Lourds $javaId
    $ligne = "$(Get-Date -f HH:mm:ss) libre=${libre}Mo serveur=${ram}Mo autres=$(($autres | % { "$($_.Name)$($_.Id):$([int]($_.WorkingSet64/1MB))MB" }) -join ',')"
    Add-Content $mem $ligne -Encoding utf8
    foreach ($a in $autres) { if (-not $autresVus.ContainsKey($a.Id)) { $autresVus[$a.Id] = 1; Note "AUTRE_JEU_LOURD $($a.Name) $($a.Id)"; Add-Content $mem "AUTRE_JEU_LOURD $($a.Name) $($a.Id)" -Encoding utf8 } }
    if (-not $pp) { Note "PROCESSUS_TERMINE ($ligne)"; break }
    if ($libre -lt 300) {
      Note "RAM_SOUS_300MO ($ligne) : arret propre demande"; Add-Content $mem "RAM_SOUS_300MO arret propre" -Encoding utf8
      Ecrire 'chunky pause'; Start-Sleep 5; Ecrire 'stop'
      $p2 = Get-Process -Id $javaId -ErrorAction SilentlyContinue
      if ($p2 -and -not $p2.WaitForExit(180000)) { Stop-Process -Id $javaId -Force; Note 'ARRETE_DE_FORCE_APRES_3MIN' } else { Note 'ARRET_PROPRE_OK' }
      break
    }
    $taille = if (Test-Path $log) { (Get-Item $log).Length } else { 0 }
    if (-not $envoye -and (Select-String -Path $log -Pattern 'Done \(' -Quiet -ErrorAction SilentlyContinue)) {
      $envoye = $true
      Ecrire 'chunky world minecraft:overworld'; Ecrire 'chunky shape square'; Ecrire "chunky center $centreX $centreZ"; Ecrire "chunky radius $rayon"; Ecrire 'chunky start'
      Add-Content $mem "CHUNKY_DEMARRE $(Get-Date -f HH:mm:ss)" -Encoding utf8
    }
    if ($envoye -and -not $fini) {
      $prog = Select-String -Path $log -Pattern '\[Chunky\].*(Processed|Task)' -ErrorAction SilentlyContinue | Select-Object -Last 1
      if ($prog) { Add-Content $mem "  $($prog.Line)" -Encoding utf8 }
      if (Select-String -Path $log -Pattern 'Task finished' -Quiet -ErrorAction SilentlyContinue) { $fini = $true; Note 'CHUNKY_FINI'; Ecrire 'stop' }
    }
    if ($taille -ne $derniereTaille) { $derniereTaille = $taille; $dernierChangement = Get-Date }
    $crash = Get-ChildItem "$T\crash-reports" -File -ErrorAction SilentlyContinue | Where-Object { $_.LastWriteTime -gt $debut }
    if ($crash) { Note "CRASH $($crash.Name)"; Start-Sleep 20; if (Get-Process -Id $javaId -ErrorAction SilentlyContinue) { Stop-Process -Id $javaId -Force; Note 'ARRETE_PAR_MOI' }; break }
    if (((Get-Date) - $dernierChangement).TotalMinutes -ge 10) { Note 'LOG_FIGE'; Stop-Process -Id $javaId -Force; break }
    if (((Get-Date) - $debut).TotalMinutes -ge 50 -and -not $fini) { Note 'DELAI_50MIN : pause et arret propre'; $fini = $true; Ecrire 'chunky pause'; Start-Sleep 5; Ecrire 'stop' }
    if (((Get-Date) - $debut).TotalMinutes -ge 55) { Note 'DELAI_55MIN'; Stop-Process -Id $javaId -Force; break }
  }
}
finally {
  if ($javaId -gt 0 -and (Get-Process -Id $javaId -ErrorAction SilentlyContinue)) { Stop-Process -Id $javaId -Force; Note 'JAVA_ARRETE_EN_SORTIE' }
  Remove-Item $lock -Force -ErrorAction SilentlyContinue
  Note "LOCK_SUPPRIME=$(-not (Test-Path $lock))"
}
