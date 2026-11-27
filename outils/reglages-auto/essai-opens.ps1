# Rejoue la commande de relance du mod en ajoutant seulement --add-opens java.lang.invoke, pour savoir si c'est le seul manque.
$r = $PSScriptRoot
$t = Get-Content "$r\cmdlines.txt" -Raw
$bloc = ($t -split "=== " | Where-Object { $_ -match "BootstrapLauncher" } | Select-Object -Last 1)
$ligne = ($bloc -split "`r?`n")[1]
$exe = $ligne.Substring(0, $ligne.IndexOf(' '))
$args1 = $ligne.Substring($ligne.IndexOf(' ') + 1)
$args1 = $args1.Replace("-Datheria.relance=true", "-Datheria.relance=true --add-opens java.base/java.lang.invoke=ALL-UNNAMED")
$psi = New-Object Diagnostics.ProcessStartInfo $exe, $args1
$psi.UseShellExecute = $false
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError = $true
$psi.WorkingDirectory = "C:\Users\El-Afdal\Desktop\Atheria Zombie Edition\instances\Atheria-test-reglages\minecraft"
$p = [Diagnostics.Process]::Start($psi)
$p.Id | Set-Content "$r\essai-opens.pid"
$sortie = $p.StandardError.ReadToEndAsync()
$out = $p.StandardOutput.ReadToEndAsync()
$p.WaitForExit()
$sortie.Result | Set-Content "$r\essai-opens.err.txt"
($out.Result -split "`n" | Select-Object -Last 200) | Set-Content "$r\essai-opens.out.txt"
