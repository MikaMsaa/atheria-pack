param([string]$Atm,[string]$Light,[string]$Etiq)
$sp=$PSScriptRoot
$old='C:\Users\El-Afdal\AppData\Local\Temp\claude\C--Users-El-Afdal-Desktop-Atheria-Zombie-Edition\3b6158cc-eefc-4df2-8769-4b2d767c856c\scratchpad'
$root='C:\Users\El-Afdal\Desktop\Atheria Zombie Edition'; $g="$root\instances\Atheria\minecraft"
if(Get-Process javaw -ErrorAction SilentlyContinue){ "JEU OUVERT, test annule"; return }
$tx="$g\shaderpacks\ComplementaryUnbound_r5.9.3.zip.txt"
$l=@(Get-Content $tx | Where-Object { $_ -notmatch '^(ATM_NIGHT_I|LIGHT_NIGHT_I|LIGHT_COLOR_MULTS|ATM_COLOR_MULTS)=' })
$l+="ATM_COLOR_MULTS=true","LIGHT_COLOR_MULTS=true","ATM_NIGHT_I=$Atm","LIGHT_NIGHT_I=$Light"
$l | Set-Content $tx -Encoding ascii
Copy-Item "$sp\zz_nuit_client.js" "$g\kubejs\client_scripts\zz_nuit_client.js" -Force
& "$old\run-test.ps1" -Root $root -World 'ZZ Bancs Vitrine' -TimeoutSec 570 -Script 'zz_t35.js'
Remove-Item "$g\kubejs\client_scripts\zz_nuit_client.js" -ErrorAction SilentlyContinue
Copy-Item "$sp\iris-avant.properties" "$g\config\iris.properties" -Force
Select-String -Path "$g\logs\latest.log" -Pattern '\[T35\]' | ForEach-Object { $_.Line -replace '^.*\[T35','[T35' }
New-Item -ItemType Directory -Force "$sp\film$Etiq" | Out-Null; Move-Item "$g\screenshots\nt-*" "$sp\film$Etiq\" -Force
$c=[IO.File]::ReadAllText("$sp\planche.ps1").Replace("$sp\film","$sp\film$Etiq"); [IO.File]::WriteAllText("$sp\planche$Etiq.ps1",$c,(New-Object Text.UTF8Encoding($true)))
& "$sp\planche$Etiq.ps1" -Motif "nt-*" -Sortie "$sp\pl-nuit$Etiq.png" -Colonnes 2 -L 800 -H 450
Add-Type -A System.Drawing; Get-ChildItem "$sp\film$Etiq\nt-*" | ForEach-Object { $b=[Drawing.Bitmap]::FromFile($_.FullName); $t=0;$n=0; for($y=200;$y -lt $b.Height;$y+=10){for($x=0;$x -lt $b.Width;$x+=10){$k=$b.GetPixel($x,$y);$t+=0.2126*$k.R+0.7152*$k.G+0.0722*$k.B;$n++}}; $b.Dispose(); "$($_.Name) luminance $([Math]::Round($t/$n,1))" }