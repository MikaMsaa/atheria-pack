param([int]$ProcId,[int]$Secondes=330,[int]$Pas=15,[string]$Sortie)
# Mesure PC normal : RAM libre Windows, fichier d'échange, jstat Old/FGC, RSS du jeu et des autres applis
$jb="C:\Users\El-Afdal\AppData\Roaming\PrismLauncher\java\java-runtime-delta\bin"
"heure;libre_Mo;engage_Mo;limite_engage_Mo;pagefile_utilise_Mo;jeu_Mo;chrome_Mo;discord_Mo;spotify_Mo;modrinth_Mo;old_pct;fgc;ygc" | Out-File -Encoding utf8 $Sortie
$fin=(Get-Date).AddSeconds($Secondes)
while((Get-Date) -lt $fin){
  $os=Get-CimInstance Win32_OperatingSystem
  $pf=(Get-CimInstance Win32_PageFileUsage | Measure CurrentUsage -Sum).Sum
  $perf=Get-CimInstance Win32_PerfFormattedData_PerfOS_Memory
  $rss={ param($n) [int]((Get-Process $n -EA 0 | Measure WorkingSet64 -Sum).Sum/1MB) }
  $jeu=[int]((Get-Process -Id $ProcId -EA 0).WorkingSet64/1MB)
  $g=(& "$jb\jstat.exe" -gcutil $ProcId 2>$null | Select -Last 1) -split '\s+' | ? { $_ }
  $old=$g[3]; $ygc=$g[6]; $fgc=$g[8]
  "{0};{1};{2};{3};{4};{5};{6};{7};{8};{9};{10};{11};{12}" -f (Get-Date -Format HH:mm:ss),[int]($os.FreePhysicalMemory/1KB),[int]($perf.CommittedBytes/1MB),[int]($perf.CommitLimit/1MB),$pf,$jeu,(& $rss chrome),(& $rss Discord),(& $rss Spotify),(& $rss 'Modrinth App'),$old,$fgc,$ygc | Out-File -Append -Encoding utf8 $Sortie
  if(-not (Get-Process -Id $ProcId -EA 0)){ break }
  Start-Sleep $Pas
}
