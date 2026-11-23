# Extension 3 de pilote-v3-colline2 (copie jetable serveur-pilote-essai) : attente de son tour puis serveur seul (serveur-ext3-colline2.ps1).
# File du 15/11 : Mods, puis le Trailer (2 passages), puis Villes/batiments ; on prend apres 2 min de verrou libre une fois
# Trailer et Villes passes, ou apres 5 min de verrou libre d'affilee (personne n'attend). Toujours : aucun java > 1 Go, aucun Prism, 6,5 Go libres.
# Prise atomique (CreateNew). Le verrou n'est supprime qu'a la fin, et seulement s'il porte notre PID. Abandon apres 150 min d'attente.
$ErrorActionPreference = 'Stop'
$Racine = 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition'
$Lock = "$Racine\outils\pause-file.lock"
$Ici = Split-Path -Parent $MyInvocation.MyCommand.Path
$Journal = "$Ici\journal-ext3-colline2.txt"
function J($t) { $l = "$(Get-Date -Format HH:mm:ss) $t"; [IO.File]::AppendAllText($Journal, "$l`r`n"); Write-Host $l }
function Libre { [int]((Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory / 1024) }
function GrosJava { @(Get-Process java, javaw -ErrorAction SilentlyContinue | Where-Object { $_.WorkingSet64 -gt 1GB }).Count }
function Prisms { @(Get-Process prismlauncher -ErrorAction SilentlyContinue).Count }
function Contenu { if (Test-Path $Lock) { try { Get-Content $Lock -Raw } catch { '?' } } else { $null } }
J 'ATTENTE_VERROU extension 3 colline2'
$t0 = Get-Date; $tLibre = Get-Date; $prec = $null; $dern = Get-Date '2000-01-01'
$rendusTrailer = 0; $villesPasse = $false
while ($true) {
  $c = Contenu
  if ($c) {
    if ($c -ne $prec) { J "PRIS_PAR : $($c.Trim())" }
  } else {
    if ($prec) {
      J "VERROU_RENDU par : $($prec.Trim())"; $tLibre = Get-Date
      if ($prec -match '(?i)trailer|blender') { $rendusTrailer++ }
      if ($prec -match '(?i)ville|batiment') { $villesPasse = $true }
    }
    $libreS = ((Get-Date) - $tLibre).TotalSeconds
    $tour = ($rendusTrailer -ge 1 -and $libreS -ge 120) -or $libreS -ge 300   # 15/11 09:00 : Villes puis le Trailer (~15 min) passent avant ; 5 min libres = personne n'attend
    if ($tour -and (GrosJava) -eq 0 -and (Prisms) -eq 0 -and (Libre) -ge 6500) {
      $pris = $false
      try { $fs = [IO.File]::Open($Lock, 'CreateNew', 'Write'); $b = [Text.Encoding]::UTF8.GetBytes("thread ile (extension 3 colline2 : serveur seul, 35 min) PID $PID $(Get-Date -Format s)"); $fs.Write($b, 0, $b.Length); $fs.Close(); $pris = $true } catch { }
      if ($pris) { J "LOCK_PRIS PID $PID libre=$(Libre) trailer_rendus=$rendusTrailer villes=$villesPasse libre_depuis=$([int]$libreS) s"; break }
    }
  }
  $prec = $c
  if (((Get-Date) - $dern).TotalSeconds -ge 120) { J "ATTENTE verrou=$c java=$(GrosJava) prism=$(Prisms) libre=$(Libre) trailer_rendus=$rendusTrailer villes=$villesPasse"; $dern = Get-Date }
  if (((Get-Date) - $t0).TotalMinutes -gt 150) { J 'ABANDON attente 150 min'; exit 1 }
  Start-Sleep 3
}
try { & powershell -NoProfile -ExecutionPolicy Bypass -File "$Ici\serveur-ext3-colline2.ps1" | Out-Null } catch { J "ERREUR $_" } finally {
  $c = Contenu; if ($c -match "extension 3 colline2 .* PID $PID") { Remove-Item $Lock -Force -ErrorAction SilentlyContinue } else { J "verrou pas a moi ($c) : laisse" }
  J "LOCK_RENDU=$(-not (Test-Path $Lock)) java=$(GrosJava)"
}
