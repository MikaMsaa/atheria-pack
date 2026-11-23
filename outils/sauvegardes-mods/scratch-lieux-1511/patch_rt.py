import sys
src, dst, sp = sys.argv[1:4]
B = chr(92)
t = open(src, encoding='utf-8-sig').read().replace('\r\n', '\n')
a = "Copy-Item (Join-Path $sp $Script) (Join-Path $game 'kubejs" + B + "server_scripts" + B + "') -Force\n"
assert a in t, 'a'
t = t.replace(a, a +
    "# Script client de capture : pose seulement pendant le banc, retire a la fin ; pauseOnLostFocus remis comme avant\n"
    "$cli = Join-Path $game 'kubejs" + B + "client_scripts" + B + "zz_vitrine_client.js'\n"
    "Copy-Item '" + sp + B + "zz_vitrine_client.js' $cli -Force\n"
    "$pauseOrig = $null; if (Test-Path $opt) { $m2 = [regex]::Match([IO.File]::ReadAllText($opt), 'pauseOnLostFocus:(true|false)'); if ($m2.Success) { $pauseOrig = $m2.Groups[1].Value } }\n")
b = "New-Item -ItemType File $stopFen -Force | Out-Null\n"
assert b in t, 'b'
t = t.replace(b, b + "Remove-Item $cli -ErrorAction SilentlyContinue\n"
    "if ($pauseOrig -ne $null) { $l = [IO.File]::ReadAllText($opt); [IO.File]::WriteAllText($opt, [regex]::Replace($l, 'pauseOnLostFocus:(true|false)', \"pauseOnLostFocus:$pauseOrig\"), (New-Object Text.UTF8Encoding($false))) }\n")
open(dst, 'w', encoding='utf-8-sig', newline='\r\n').write(t)
print('ok')
