param([int]$ProcId,[int]$Secondes=1500,[double]$Pas=2,[string]$Sortie)
# Releve toutes les $Pas s pendant le banc : GPU (nvidia-smi), CPU total et du jeu, RAM libre, memoire du jeu, tas (jstat)
$jb="C:\Users\El-Afdal\AppData\Roaming\PrismLauncher\java\java-runtime-delta\bin"
$nc=[Environment]::ProcessorCount
"heure;gpu_pct;gpu_temp_C;vram_Mo;gpu_W;cpu_total_pct;cpu_jeu_pct;libre_Mo;engage_Mo;pagefile_Mo;jeu_Mo;chrome_Mo;discord_Mo;spotify_Mo;old_pct;fgc;ygc" | Out-File -Encoding utf8 $Sortie
$fin=(Get-Date).AddSeconds($Secondes)
$p0=Get-Process -Id $ProcId -EA 0; $t0=Get-Date; $c0=$p0.TotalProcessorTime
while((Get-Date) -lt $fin){
  $deb=Get-Date
  $g=(& nvidia-smi --query-gpu=utilization.gpu,temperature.gpu,memory.used,power.draw --format=csv,noheader,nounits 2>$null) -split ',\s*'
  $cpu=[int](Get-CimInstance Win32_PerfFormattedData_PerfOS_Processor -Filter "Name='_Total'").PercentProcessorTime
  $p=Get-Process -Id $ProcId -EA 0
  if(-not $p){ break }
  $t1=Get-Date; $c1=$p.TotalProcessorTime
  $cj=[int](100*($c1-$c0).TotalSeconds/(($t1-$t0).TotalSeconds*$nc)); $t0=$t1; $c0=$c1
  $os=Get-CimInstance Win32_OperatingSystem
  $perf=Get-CimInstance Win32_PerfFormattedData_PerfOS_Memory
  $pf=(Get-CimInstance Win32_PageFileUsage | Measure CurrentUsage -Sum).Sum
  $rss={ param($n) [int]((Get-Process $n -EA 0 | Measure WorkingSet64 -Sum).Sum/1MB) }
  $j=(& "$jb\jstat.exe" -gcutil $ProcId 2>$null | Select -Last 1) -split '\s+' | ? { $_ }
  "{0};{1};{2};{3};{4};{5};{6};{7};{8};{9};{10};{11};{12};{13};{14};{15};{16}" -f (Get-Date -Format HH:mm:ss),$g[0],$g[1],$g[2],$g[3],$cpu,$cj,[int]($os.FreePhysicalMemory/1KB),[int]($perf.CommittedBytes/1MB),$pf,[int]($p.WorkingSet64/1MB),(& $rss chrome),(& $rss Discord),(& $rss Spotify),$j[3],$j[8],$j[6] | Out-File -Append -Encoding utf8 $Sortie
  $reste=$Pas-((Get-Date)-$deb).TotalSeconds; if($reste -gt 0){ Start-Sleep -Milliseconds ([int]($reste*1000)) }
}
