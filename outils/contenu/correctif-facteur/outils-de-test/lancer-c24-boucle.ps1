# C24 option (2) : rien n'est modifie dans serveur-ile-test (jar d'origine, regions.json intact).
# Relances successives de serveur-ile-test (--world ile_test_1) avec "chunky continue" jusqu'a "Task finished".
# Verrou tenu tout du long, arret propre a chaque passage (le mod atheria_ile arrete lui-meme le serveur apres ses tests).
param([int]$MaxPassages = 30, [int]$LibreMin = 6000, [string]$ReprendrePid = '')
$ErrorActionPreference = 'Stop'
$Racine = 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition'
$Ess = "$Racine\outils\serveur-ile-test"
$Lock = "$Racine\outils\pause-file.lock"
$Ici = Split-Path -Parent $MyInvocation.MyCommand.Path
$JarOrig = Join-Path $Ici 'atheria-monde-ile-test-ORIGINAL.jar'
$Journal = Join-Path $Ici 'journal-c24-boucle.txt'
function J($t) { $l = "$(Get-Date -Format HH:mm:ss) $t"; [IO.File]::AppendAllText($Journal, "$l`r`n"); Write-Host $l }
function Libre { [int]((Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory / 1024) }
function GrosJava { @(Get-Process java, javaw -ErrorAction SilentlyContinue | Where-Object { $_.WorkingSet64 -gt 1GB }).Count }
function LireLog { try { $fs = [IO.File]::Open("$Ess\logs\latest.log", 'Open', 'Read', 'ReadWrite'); $sr = New-Object IO.StreamReader($fs); $t = $sr.ReadToEnd(); $sr.Close(); $t } catch { '' } }
J 'debut boucle C24'
$t0 = Get-Date
while ($true) {
  $pris = $false
  if ($ReprendrePid -and (Test-Path $Lock) -and ((Get-Content $Lock -Raw) -match "thread ile Carte \(C24.*PID $ReprendrePid ")) { [IO.File]::WriteAllText($Lock, "thread ile Carte (C24 ile_test_1, relances sans modif) PID $PID (repris de $ReprendrePid) $(Get-Date -Format s)"); J "VERROU repris de mon PID $ReprendrePid"; break }
  if (-not (Test-Path $Lock) -and (GrosJava) -eq 0 -and (Libre) -ge $LibreMin) {
    try { $fs = [IO.File]::Open($Lock, 'CreateNew', 'Write'); $b = [Text.Encoding]::UTF8.GetBytes("thread ile Carte (C24 ile_test_1, relances sans modif) PID $PID $(Get-Date -Format s)"); $fs.Write($b, 0, $b.Length); $fs.Close(); $pris = $true } catch { $pris = $false }
  }
  if ($pris) { break }
  J "ATTENTE verrou=$(if (Test-Path $Lock) { Get-Content $Lock -Raw } else { 'libre' }) java>1Go=$(GrosJava) libre=$(Libre)"
  if (((Get-Date) - $t0).TotalMinutes -gt 600) { J 'ABANDON attente'; exit 1 }
  Start-Sleep 60
}
J "LOCK_PRIS PID $PID"
$hReg0 = (Get-FileHash "$Ess\config\atheria_ile\regions.json" -Algorithm MD5).Hash
J "regions.json $hReg0 ; jar $((Get-FileHash "$Ess\mods\atheria-monde.jar" -Algorithm MD5).Hash)"
$proc = $null; $fini = $false
try {
  if ((Get-FileHash "$Ess\mods\atheria-monde.jar" -Algorithm MD5).Hash -ne (Get-FileHash $JarOrig -Algorithm MD5).Hash) { throw 'jar inattendu' }
  for ($p = 1; $p -le $MaxPassages -and -not $fini; $p++) {
    if ((GrosJava) -ne 0 -or (Libre) -lt 3500) { J "DEPART_REFUSE libre=$(Libre)"; break }
    $psi = New-Object Diagnostics.ProcessStartInfo
    $psi.FileName = 'java'; $psi.WorkingDirectory = $Ess
    $psi.Arguments = '@user_jvm_args.txt @libraries/net/neoforged/neoforge/21.1.265/win_args.txt nogui --world ile_test_1'
    $psi.UseShellExecute = $false; $psi.RedirectStandardInput = $true; $psi.RedirectStandardOutput = $true; $psi.RedirectStandardError = $true
    $proc = New-Object Diagnostics.Process; $proc.StartInfo = $psi
    $null = $proc.Start(); $proc.BeginOutputReadLine(); $proc.BeginErrorReadLine()
    $ts = Get-Date; J "PASSAGE $p java=$($proc.Id)"
    Start-Sleep 15
    $tp = [IO.File]::ReadAllText("$Ess\config\chunky\tasks\minecraft\overworld.properties")
    if ($tp -match 'cancelled=true') { J 'tache Chunky annulee (crash watchdog) : relance complete, chunks existants sautes'; foreach ($c in 'chunky world minecraft:overworld', 'chunky shape rectangle', 'chunky center 2514 -1294', 'chunky radius 450 350', 'chunky start', 'chunky confirm') { $proc.StandardInput.WriteLine($c); Start-Sleep 1 } }
    else { $proc.StandardInput.WriteLine('chunky continue') }
    while (-not $proc.HasExited) {
      Start-Sleep 10
      $lt = LireLog
      foreach ($m in [regex]::Matches($lt, '\d{4} (\d\d:\d\d:\d\d)\.\d+\][^\n]*Task finished')) { if ($m.Groups[1].Value -ge $ts.ToString('HH:mm:ss')) { $fini = $true } }
      $raison = ''
      if ($fini) { $raison = 'Task finished' }
      if ($lt -match 'OutOfMemoryError') { $raison = 'OOM' }
      if ((Libre) -lt 300) { $raison = "RAM $(Libre) Mo" }
      if (((Get-Date) - $ts).TotalMinutes -gt 20) { $raison = 'passage trop long' }
      if ($raison) {
        J "ARRET ($raison)"; try { $proc.StandardInput.WriteLine('stop') } catch {}
        if (-not $proc.WaitForExit(180000)) { J "TUE mon java $($proc.Id)"; $proc.Kill() }
        if ($raison -ne 'Task finished') { $p = $MaxPassages + 1 }
        break
      }
    }
    $proc.WaitForExit()
    $lt = LireLog; $mm = [regex]::Matches($lt, 'Processed: (\d+) chunks \(([\d,]+)%\)'); $der = if ($mm.Count) { "$($mm[$mm.Count-1].Groups[1].Value) chunks ($($mm[$mm.Count-1].Groups[2].Value) %)" } else { '?' }
    J "FIN PASSAGE $p code=$($proc.ExitCode) dernier=$der fini=$fini"
    if (-not $fini) { Start-Sleep 10 }
  }
} catch { J "ERREUR $_" } finally {
  if ($proc -and -not $proc.HasExited) { J "TUE mon java $($proc.Id)"; $proc.Kill() }
  $h1 = (Get-FileHash "$Ess\config\atheria_ile\regions.json" -Algorithm MD5).Hash
  J "regions.json $h1 identique=$($h1 -eq $hReg0) ; jar $((Get-FileHash "$Ess\mods\atheria-monde.jar" -Algorithm MD5).Hash) ; fini=$fini"
  Remove-Item $Lock -Force -ErrorAction SilentlyContinue
  J "LOCK_SUPPRIME=$(-not (Test-Path $Lock))"
}
