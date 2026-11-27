# Note les lignes de commande des java/javaw de l'instance de test (diagnostic de la relance automatique).
param([int]$Secondes = 150, [string]$Sortie = "$PSScriptRoot\cmdlines.txt")
$vus = @{}
$fin = (Get-Date).AddSeconds($Secondes)
while ((Get-Date) -lt $fin) {
  Get-CimInstance Win32_Process -Filter "Name='java.exe' OR Name='javaw.exe'" -ErrorAction SilentlyContinue | ForEach-Object {
    if (-not $vus.ContainsKey($_.ProcessId) -and $_.CommandLine) {
      $vus[$_.ProcessId] = 1
      Add-Content -Path $Sortie -Encoding UTF8 -Value ("=== {0} PID {1} parent {2}`r`n{3}`r`n" -f (Get-Date -Format o), $_.ProcessId, $_.ParentProcessId, $_.CommandLine)
    }
  }
  Start-Sleep -Milliseconds 200
}
