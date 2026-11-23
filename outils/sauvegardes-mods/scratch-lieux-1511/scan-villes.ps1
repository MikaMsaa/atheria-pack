param(
    [string]$Etiquette,
    [string]$Graine = '12345',
    [int]$Rayon = 400,
    [int]$TimeoutSec = 900
)
# Mesure sans joueur, sur le serveur et un monde jetable, la carte des villes et des routes.
# Le profil doit deja etre en place dans serveur\config\lostcities\profiles\atheria.json.
$racine = 'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition'
$srv = Join-Path $racine 'serveur'
$sp = $PSScriptRoot
$dossier = 'zz-scan-' + [Guid]::NewGuid().ToString('N').Substring(0, 8)
$props = Join-Path $srv 'server.properties'
$sauve = [IO.File]::ReadAllText($props)
$sortie = Join-Path $sp "scan-$Etiquette.txt"
$script = Join-Path $srv 'kubejs\server_scripts\zz_scan_villes.js'
$js = @"
var ZS = { prevu: 0, t: 0, z: null, routes: 0, ville: 0, duree: 0, fini: false }
ServerEvents.tick(event => {
  if (ZS.fini) return
  ZS.t++
  if (ZS.t < 40) return
  var level = event.server.overworld()
  try {
    var Reg = Java.loadClass('mcjty.lostcities.setup.Registration')
    var City = Java.loadClass('mcjty.lostcities.worldgen.lost.City')
    var Highway = Java.loadClass('mcjty.lostcities.worldgen.lost.Highway')
    var Coord = Java.loadClass('mcjty.lostcities.varia.ChunkCoord'); var BI = Java.loadClass('mcjty.lostcities.worldgen.lost.BuildingInfo')
    var info = Reg.LOSTCITY_FEATURE.get().getDimensionInfo(level)
    var profil = info.getProfile()
    var dim = level.dimension
    var R = $Rayon
    if (ZS.z == null) { ZS.z = -R; console.info('[SCAN]profil ' + profil.getName()) }
    var debut = Date.now()
    for (; ZS.z < R && Date.now() - debut < 1500; ZS.z++) {
      var ligne = ''
      for (var x = -R; x < R; x++) {
        var c = new Coord(dim, x, ZS.z)
        var f = City.getCityFactor(c, info, profil) > 0.2; var v = f && BI.isCity(c, info); if (f) ZS.prevu++
        var h = Highway.getHighwayInfo(c, info, profil).hasHighway()
        if (v) ZS.ville++
        if (h) ZS.routes++
        ligne += h ? (v ? 'X' : 'H') : (v ? 'v' : '.')
        if (City.isCityCenter(c, info)) console.info('[SCAN]centre ' + x + ' ' + ZS.z + ' ' + City.getCityRadius(c, info) + ' ' + City.getCityStyleForCityCenter(c, info) + ' reel=' + BI.isCity(c, info))
      }
      console.info('[SCAN]L' + ligne)
    }
    ZS.duree += Date.now() - debut
    if (ZS.z >= R) {
      var n = 4 * R * R
      console.info('[SCAN]bilan chunks=' + n + ' prevu=' + (100 * ZS.prevu / n).toFixed(1) + '% ville=' + (100 * ZS.ville / n).toFixed(1) + '% route=' + (100 * ZS.routes / n).toFixed(1) + '% duree=' + ZS.duree + 'ms')
      console.info('[SCAN] fin')
      ZS.fini = true
    }
  } catch (e) { console.error('[SCAN]ERREUR ' + e); console.info('[SCAN] fin'); ZS.fini = true }
})
"@
$p = $null
$start = Get-Date
try {
    [IO.File]::WriteAllText($script, $js, (New-Object Text.UTF8Encoding($false)))
    [IO.File]::WriteAllText($props, $sauve.Replace('level-name=world', "level-name=$dossier").Replace("level-seed=`r`n", "level-seed=$Graine`r`n").Replace("level-seed=`n", "level-seed=$Graine`n").Replace('max-tick-time=60000','max-tick-time=-1'))
    $p = Start-Process 'C:\Program Files\Java\jdk-21\bin\java.exe' -WorkingDirectory $srv -WindowStyle Hidden -PassThru -RedirectStandardInput (Join-Path $sp 'stop.txt') -RedirectStandardOutput (Join-Path $sp 'srv-out.txt') -RedirectStandardError (Join-Path $sp 'srv-err.txt') -ArgumentList '-Xmx6G', '@libraries/net/neoforged/neoforge/21.1.265/win_args.txt', 'nogui'
    $log = Join-Path $srv 'logs\latest.log'
    $res = 'TIMEOUT'
    while (((Get-Date) - $start).TotalSeconds -lt $TimeoutSec) {
        Start-Sleep 5
        if ($p.HasExited) { $res = 'SERVEUR ARRETE'; break }
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
[IO.File]::WriteAllLines($sortie, [string[]]$out)
$monde = Join-Path $srv $dossier
Remove-Item -LiteralPath $monde -Recurse -Force
"monde jetable retire : $(-not (Test-Path -LiteralPath $monde))"
