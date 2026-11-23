# Mesure Chunky sur serveur DEDIE jetable (outils\serveur-pilote-essai, monde 'pilote', port 25581, Xmx4G).
# Verrou partage pris atomiquement, RAM verifiee, arret propre, ne tue que son propre java.
param([string]$Centre = '2960 -904', [int]$Rayon = 160, [string]$Nom = 'mesure', [int]$MaxMin = 90, [int]$AttenteMaxMin = 1440, [int]$DelaiMin = 0, [int]$LibreMin = 3500, [switch]$SansVerrou)
$ErrorActionPreference = 'Stop'
$Racine = 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition'
$Ess = "$Racine\outils\serveur-pilote-essai"
$Lock = "$Racine\outils\pause-file.lock"
$Ici = Split-Path -Parent $MyInvocation.MyCommand.Path
$Journal = Join-Path $Ici "journal-$Nom.txt"
function J($t) { $l = "$(Get-Date -Format HH:mm:ss) $t"; [IO.File]::AppendAllText($Journal, "$l`r`n"); Write-Host $l }
function Libre { [int]((Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory / 1024) }
function GrosJava { @(Get-Process java, javaw -ErrorAction SilentlyContinue | Where-Object { $_.WorkingSet64 -gt 1GB }).Count }
J "debut $Nom centre=$Centre rayon=$Rayon"
if ($DelaiMin -gt 0) { J "DELAI $DelaiMin min (laisser le verrou aux autres)"; Start-Sleep ($DelaiMin * 60) }
$t0 = Get-Date
while (-not $SansVerrou) {
  $pris = $false
  if (-not (Test-Path $Lock) -and (GrosJava) -eq 0 -and (Libre) -ge $LibreMin) {
    try { $fs = [IO.File]::Open($Lock, 'CreateNew', 'Write'); $b = [Text.Encoding]::UTF8.GetBytes("thread ile (generation pilote serveur jetable) $Nom PID $PID $(Get-Date -Format s)"); $fs.Write($b, 0, $b.Length); $fs.Close(); $pris = $true } catch { $pris = $false }
  }
  if ($pris) { break }
  $v = if (Test-Path $Lock) { (Get-Content $Lock -Raw -ErrorAction SilentlyContinue) } else { 'libre' }
  J "ATTENTE verrou=$v java>1Go=$(GrosJava) libre=$(Libre) Mo"
  if (((Get-Date) - $t0).TotalMinutes -gt $AttenteMaxMin) { J 'ABANDON attente'; exit 1 }
  Start-Sleep 120
}
J $(if ($SansVerrou) { "VERROU tenu par la chaine: $(Get-Content $Lock -Raw)" } else { 'LOCK_PRIS' })
$proc = $null
try {
  if ((GrosJava) -ne 0 -or (Libre) -lt 3500) { J "DEPART_REFUSE libre=$(Libre)"; throw 'depart refuse' }
  Remove-Item "$Ess\config\chunky\tasks" -Recurse -Force -ErrorAction SilentlyContinue
  $log = "$Ess\logs\latest.log"
  $psi = New-Object Diagnostics.ProcessStartInfo
  $psi.FileName = 'java'; $psi.WorkingDirectory = $Ess
  $psi.Arguments = '@user_jvm_args.txt @libraries/net/neoforged/neoforge/21.1.265/win_args.txt nogui'
  $psi.UseShellExecute = $false; $psi.RedirectStandardInput = $true; $psi.RedirectStandardOutput = $true; $psi.RedirectStandardError = $true
  $proc = New-Object Diagnostics.Process; $proc.StartInfo = $psi
  $sortie = Join-Path $Ici "console-$Nom.txt"
  $null = Register-ObjectEvent $proc OutputDataReceived -Action { if ($EventArgs.Data) { [IO.File]::AppendAllText($Event.MessageData, $EventArgs.Data + "`r`n") } } -MessageData $sortie
  $null = Register-ObjectEvent $proc ErrorDataReceived -Action { if ($EventArgs.Data) { [IO.File]::AppendAllText($Event.MessageData, $EventArgs.Data + "`r`n") } } -MessageData $sortie
  $null = $proc.Start(); $proc.BeginOutputReadLine(); $proc.BeginErrorReadLine()
  J "LANCE java=$($proc.Id)"
  $tl = Get-Date; $etat = 'demarrage'; $tc = $null; $raison = ''
  while (-not $proc.HasExited) {
    Start-Sleep 15
    $txt = ''; try { $fs2 = [IO.File]::Open($sortie, 'Open', 'Read', 'ReadWrite'); $sr = New-Object IO.StreamReader($fs2); $txt = $sr.ReadToEnd(); $sr.Close() } catch { $txt = '' }
    if ($etat -eq 'demarrage') {
      J 'COMMANDES_ENVOYEES (la console les execute des que le serveur est pret)'
      foreach ($c in 'chunky world minecraft:overworld', 'chunky shape square', "chunky center $Centre", "chunky radius $Rayon", 'chunky start', 'chunky confirm') { $proc.StandardInput.WriteLine($c); Start-Sleep 1 }
      $etat = 'chunky'; $tc = Get-Date; J 'CHUNKY_LANCE'
    }
    $fin = $false; try { $fs3 = [IO.File]::Open($log, 'Open', 'Read', 'ReadWrite'); $sr3 = New-Object IO.StreamReader($fs3); $lt = $sr3.ReadToEnd(); $sr3.Close(); foreach ($m in [regex]::Matches($lt, '\d{4} (\d\d:\d\d:\d\d)\.\d+\][^
]*Task finished')) { if ($m.Groups[1].Value -ge $tl.ToString('HH:mm:ss')) { $fin = $true } } } catch { }
    if ($etat -eq 'chunky' -and ($fin -or $txt -match 'Task finished')) { J "CHUNKY_FINI en $([math]::Round(((Get-Date)-$tc).TotalMinutes,1)) min"; $raison = 'fini' }
    if ($txt -match 'OutOfMemoryError') { $raison = 'OOM' }
    if ((Libre) -lt 300) { $raison = "RAM $(Libre) Mo" }
    if (((Get-Date) - $tl).TotalMinutes -gt $MaxMin) { $raison = 'duree max' }
    if (Test-Path (Join-Path $Ici "arret-$Nom.json")) { $raison = 'arret demande' }
    if ($raison) {
      J "ARRET ($raison)"; $proc.StandardInput.WriteLine('stop')
      if (-not $proc.WaitForExit(180000)) { J "TUE mon java $($proc.Id) (pas d'arret en 180 s)"; $proc.Kill() }
      break
    }
    if ($etat -eq 'chunky' -and (((Get-Date) - $tl).TotalSeconds % 300) -lt 15) { J "libre=$(Libre) Mo" }
  }
  J "JAVA_TERMINE code=$(try { $proc.ExitCode } catch { '?' })"
} finally {
  if ($proc -and -not $proc.HasExited) { J "TUE mon java $($proc.Id)"; $proc.Kill() }
  if (-not $SansVerrou) { Remove-Item $Lock -Force -ErrorAction SilentlyContinue; J "LOCK_SUPPRIME=$(-not (Test-Path $Lock))" }
}
