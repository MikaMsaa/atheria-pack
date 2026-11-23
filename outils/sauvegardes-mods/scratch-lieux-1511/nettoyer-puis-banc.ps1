# Attend la fin de la capture du Trailer (verrou libre, aucun gros java), retire le script client de capture et remet pauseOnLostFocus, puis relance le banc rail4.
$root = 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition'
$lock = "$root\outils\pause-file.lock"
$game = "$root\instances\Atheria\minecraft"
$t0 = Get-Date
while (((Get-Date) - $t0).TotalHours -lt 12) {
  $j = Get-Process java, javaw -ErrorAction SilentlyContinue | ? { $_.WS -gt 1GB }
  if (-not (Test-Path $lock) -and -not $j) { break }
  Start-Sleep 30
}
Remove-Item "$game\kubejs\client_scripts\zz_vitrine_client.js" -ErrorAction SilentlyContinue
$opt = "$game\options.txt"
$l = [IO.File]::ReadAllText($opt)
[IO.File]::WriteAllText($opt, $l.Replace('pauseOnLostFocus:false', 'pauseOnLostFocus:true'), (New-Object Text.UTF8Encoding($false)))
"NETTOYE $(Get-Date -Format s) script client present : $(Test-Path "$game\kubejs\client_scripts\zz_vitrine_client.js") ; $((Select-String -Path $opt -Pattern 'pauseOnLostFocus').Line)"
& "$PSScriptRoot\banc-vh.ps1" -Series rail4 -RamMinMo 5500
