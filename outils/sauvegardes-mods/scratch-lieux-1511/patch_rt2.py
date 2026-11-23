import sys
p = sys.argv[1]
t = open(p, encoding='utf-8-sig').read()
cle = "-Pattern '\\[TEST BUGS\\] fin' -Quiet"
i = t.index(cle)
deb = t.rfind('\n', 0, i) + 1
ajout = "    if ($fresh -and (Select-String -Path $log -Pattern 'EvaluatorException' -Quiet)) { $res = 'ERREUR SCRIPT KubeJS (voir logs/kubejs/server.log)'; break }\r\n"
if 'EvaluatorException' not in t:
    t = t[:deb] + ajout + t[deb:]
open(p, 'w', encoding='utf-8-sig').write(t)
print('ok')
