param([string]$Js, [string]$Etiquette = 'x', [string]$Graine = '12345', [int]$TimeoutSec = 600)
# Lance le serveur sur un monde jetable avec un script de test (marqueur [SCAN] fin), puis retire le monde.
$racine = 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition'
$srv = Join-Path $racine 'serveur'
$sp = $PSScriptRoot
$dossier = 'zz-scan-' + [Guid]::NewGuid().ToString('N').Substring(0, 8)
$props = Join-Path $srv 'server.properties'
$sauve = [IO.File]::ReadAllText($props)
$sortie = Join-Path $sp "st-$Etiquette.txt"
$script = Join-Path $srv 'kubejs\server_scripts\zz_serveur_test.js'
$p = $null
$start = Get-Date
try {
    Copy-Item $Js $script -Force
    [IO.File]::WriteAllText($props, $sauve.Replace('level-name=world', "level-name=$dossier").Replace("level-seed=`r`n", "level-seed=$Graine`r`n").Replace("level-seed=`n", "level-seed=$Graine`n").Replace('max-tick-time=60000', 'max-tick-time=-1'))
    $p = Start-Process 'C:\Program Files\Java\jdk-21\bin\java.exe' -WorkingDirectory $srv -WindowStyle Hidden -PassThru -RedirectStandardInput (Join-Path $sp 'stop.txt') -RedirectStandardOutput (Join-Path $sp 'srv-out.txt') -RedirectStandardError (Join-Path $sp 'srv-err.txt') -ArgumentList '-Xmx6G', '@libraries/net/neoforged/neoforge/21.1.265/win_args.txt', 'nogui'
    $log = Join-Path $srv 'logs\latest.log'
    $res = 'TIMEOUT'
    while (((Get-Date) - $start).TotalSeconds -lt $TimeoutSec) {
        Start-Sleep 5
        if ($p.HasExited) { $res = 'SERVEUR ARRETE'; break }
        if ((Test-Path $log) -and ((Get-Item $log).LastWriteTime -gt $start) -and (Select-String -Path $log -Pattern 'Failed to load datapacks|Crash report' -Quiet)) { $res = 'ECHEC DONNEES'; break }
        if ((Test-Path $log) -and ((Get-Item $log).LastWriteTime -gt $start) -and (Select-String -Path $log -Pattern '\[SCAN\] fin' -Quiet)) { $res = 'FIN'; break }
    }
    "$res en $([int]((Get-Date) - $start).TotalSeconds) s"
}
finally {
    if ($p -and -not $p.HasExited) { Stop-Process -Id $p.Id -Force; Start-Sleep 3 }
    [IO.File]::WriteAllText($props, $sauve)
    Remove-Item $script -ErrorAction SilentlyContinue
}
$out = Select-String -Path $log -Pattern '\[SCAN\](.*)$' | ForEach-Object { $_.Matches[0].Groups[1].Value.TrimStart() }
if ($out) { [IO.File]::WriteAllLines($sortie, [string[]]$out) }
Copy-Item $log (Join-Path $sp "st-$Etiquette.log") -Force
$out
"--- erreurs"
Select-String -Path $log -Pattern 'atheria|Feature order|Failed to|lithostitched' -CaseSensitive:$false | Where-Object { $_.Line -match 'ERROR|WARN|Exception|Failed' } | Select-Object -First 25 | ForEach-Object { $_.Line.Substring(0, [Math]::Min(300, $_.Line.Length)) }
$monde = Join-Path $srv $dossier
Remove-Item -LiteralPath $monde -Recurse -Force
"monde jetable retire : $(-not (Test-Path -LiteralPath $monde))"
