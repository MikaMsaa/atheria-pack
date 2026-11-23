import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
t = open('lancer-bis-c16.ps1', encoding='utf-8-sig', newline='').read().replace('\r\n', '\n')
def rep(a, b):
    global t
    assert t.count(a) == 1, a
    t = t.replace(a, b)
rep('journal-bis-c16', 'journal-bis-c18')
i = t.index('$V = @('); j = t.index('\n)', i) + 2
Z = r"zones = @(@('2530 -2016', 128, 'lot70'), @('2930 -952', 112, 'lot68'), @('2520 -3013', 96, 'lot69'), @('2620 -3024', 160, 'lot67'))"
V = r'''$V = @(
  @{ n = 'c18ref'; jar = "$BR\atheria-ile-0.9.4g-nature.jar"; reg = "$BR\regions-v3i.json"; pl = $null; delta = $true; c1 = $true; dp = "$BR\atheria_ile_datapack-1.3-relief-v3.zip"; ZZ },
  @{ n = 'c18j'; jar = "$BR\atheria-ile-0.9.4i-port.jar"; reg = "$BR\regions-v3j.json"; pl = "$BR\plateaux-v3j.json"; delta = $true; c1 = $true; dp = "$BR\atheria_ile_datapack-1.3-relief-v3.zip"; ZZ }
)'''.replace('ZZ', Z)
t = t[:i] + V + t[j:]
rep('    Copy-Item $v.reg $Reg -Force\n',
    '    Copy-Item $v.reg $Reg -Force\n    Remove-Item "$Ess\\config\\atheria_ile\\plateaux.json" -ErrorAction SilentlyContinue\n    if ($v.pl) { Copy-Item $v.pl "$Ess\\config\\atheria_ile\\plateaux.json" -Force }\n')
a = '  Remove-Item "$Ess\\config\\atheria_ile\\relief_delta.bin", "$Ess\\config\\atheria_ile\\relief_base.bin" -ErrorAction SilentlyContinue\n  J "copie'
rep(a, a.replace('relief_base.bin" -Error', 'relief_base.bin", "$Ess\\config\\atheria_ile\\plateaux.json" -Error'))
rep('TotalMinutes -gt 4) { throw "generation', 'TotalMinutes -gt 6) { throw "generation')
open('lancer-bis-c18.ps1', 'w', encoding='utf-8-sig', newline='').write(t.replace('\n', '\r\n'))

c = open('lancer-c16.ps1', encoding='utf-8-sig', newline='').read().replace('\r\n', '\n')
for a, b in (('journal-bis-c16', 'journal-bis-c18'), ('lancer-bis-c16', 'lancer-bis-c18'), ('journal-c16', 'journal-c18'), ('creneau 16', 'creneau 18'), ('CRENEAU16', 'CRENEAU18'),
             ('0.9.4g v3i riv hum (berges douces), 15 min', 'lieux du trailer v3j (lot67 a lot70, port 0.9.4i) contre v3i, 2 mondes, 4 zones, 25 min'),
             ('nature 0.9.4g berges douces (riv hum)', 'lieux du trailer v3j')):
    assert a in c, a
    c = c.replace(a, b)
k = c.index('  J "nature : ')
k2 = c.index('\n', k) + 1
c = c[:k2] + '  & python -I "$Ici\\qc_c18.py" "$Ess\\pilote-bis-c18ref" "$Ess\\pilote-bis-c18j" 2>&1 | Out-File "$Ici\\qc-c18.txt" -Encoding utf8\n  J "QC c18 : $((Get-Content "$Ici\\qc-c18.txt") -join \' || \')"\n' + c[k2:]
open('lancer-c18.ps1', 'w', encoding='utf-8-sig', newline='').write(c.replace('\n', '\r\n'))
print('ok')
