param([string]$Series = "vh", [int]$RamMinMo = 6500, [int]$AttenteMin = 720)
# Banc d'essai des vehicules : verrou partage, un seul jeu, attente de RAM, son coupe par run-test.
$sp = $PSScriptRoot
$root = 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition'
$lock = "$root\outils\pause-file.lock"
$t0 = Get-Date; $tenu = $false
function Dispo { [int](Get-CimInstance Win32_PerfFormattedData_PerfOS_Memory).AvailableMBytes }
try {
  while (((Get-Date) - $t0).TotalMinutes -lt $AttenteMin) {
    try { New-Item -ItemType File -Path $lock -Value "thread batiments banc-vh $PID $(Get-Date -Format s)" -ErrorAction Stop | Out-Null; $tenu = $true } catch {}
    if ($tenu) {
      $j = Get-Process java, javaw -ErrorAction SilentlyContinue | ? { $_.WS -gt 1GB }
      if (-not $j -and (Dispo) -ge $RamMinMo) { break }
      Remove-Item $lock -Force; $tenu = $false
    }
    Start-Sleep 30
  }
  if (-not $tenu) { "ABANDON attente $(Dispo) Mo $(Get-Date -Format s)"; exit }
  "LANCE $(Get-Date -Format s) RAM $(Dispo) Mo"
  # monde de banc dedie (on ne touche jamais aux mondes proteges)
  if (-not (Test-Path -LiteralPath "$root\instances\Atheria\minecraft\saves\ZZ Bancs Vitrine")) { & powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Users\El-Afdal\AppData\Local\Temp\claude\C--Users-El-Afdal-Desktop-Atheria-Zombie-Edition\3b6158cc-eefc-4df2-8769-4b2d767c856c\scratchpad\monde-neuf.ps1" -Root $root -Nom "ZZ Bancs Vitrine" -Seed 6301 }
  & powershell -NoProfile -ExecutionPolicy Bypass -File "$sp\recontrole.ps1" -Series $Series
  "FINI $(Get-Date -Format s)"
} finally {
  # fermer la fenetre Prism laissee par CE banc (lancee apres notre debut, sur le monde du banc) ; jamais celles des autres
  if ($tenu) { Get-CimInstance Win32_Process -Filter "Name='prismlauncher.exe'" | ? { $_.CommandLine -match 'ZZ Bancs Vitrine' -and $_.CreationDate -gt $t0 } | % { Stop-Process -Id $_.ProcessId -Confirm:$false -ErrorAction SilentlyContinue; "prism ferme : $($_.ProcessId)" } }
  if ($tenu -and (Test-Path $lock) -and ((Get-Content $lock -Raw) -match " $PID ")) { Remove-Item $lock -Force }
}
