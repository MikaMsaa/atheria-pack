# c20 : 0.9.6 (lacs hors lots, C1b lave hors volcan). c20j = 0.9.6 + v3l ; c20z = 0.9.6 + v3j (parametres a 0, non-regression contre c18j / c19ref)
import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
def lire(f): return open(f, encoding='utf-8-sig', newline='').read().replace('\r\n', '\n')
def ecrire(f, t): open(f, 'w', encoding='utf-8-sig', newline='').write(t.replace('\n', '\r\n'))
def rep(t, a, b):
    assert t.count(a) >= 1, a
    return t.replace(a, b)
Z = r"zones = @(@('2930 -952', 112, 'lot68'), @('2562 -2116', 48, 'lave'), @('-3018 4410', 96, 'volcan'), @('-2514 -5850', 96, 'lagon'))"
DP = r'"$BR\atheria_ile_datapack-1.4-relief-v3-plateau.zip"'
t = lire('lancer-bis-c19.ps1')
t = rep(t, 'journal-bis-c19', 'journal-bis-c20')
i = t.index('$V = @('); j = t.index('\n)', i) + 2
t = t[:i] + ('$V = @(\n'
    "  @{ n = 'c20j'; jar = \"$BR\\atheria-ile-0.9.6-lacs.jar\"; reg = \"$BR\\regions-v3l.json\"; pl = \"$BR\\plateaux-v3j.json\"; delta = $true; c1 = $true; dp = " + DP + '; ' + Z + ' },\n'
    "  @{ n = 'c20z'; jar = \"$BR\\atheria-ile-0.9.6-lacs.jar\"; reg = \"$BR\\regions-v3j.json\"; pl = \"$BR\\plateaux-v3j.json\"; delta = $true; c1 = $true; dp = " + DP + '; ' + Z + ' }\n'
    ')') + t[j:]
t = rep(t, "if ($v.n -eq 'c19ref') { J \"c19ref deja genere : garde\"; continue }; ", '')
ecrire('lancer-bis-c20.ps1', t)
c = lire('lancer-c19.ps1')
for a, b in (('journal-bis-c19', 'journal-bis-c20'), ('lancer-bis-c19', 'lancer-bis-c20'), ('journal-c19', 'journal-c20'), ('creneau 19', 'creneau 20'), ('CRENEAU19', 'CRENEAU20'),
             ('lagon vivant, ilot sculpte, debris 0.9.5 (v3k) contre 0.9.4i (v3j), 2 mondes, 4 zones, 15 min', 'lacs hors lots et lave hors volcan 0.9.6 (v3l) et non-regression (v3j), 2 mondes, 4 zones, 15 min'),
             ('pilote-bis-c19k\\region', 'pilote-bis-c20z\\region'),
             ('"$Ici\\qc_c19.py" "$Ess\\pilote-bis-c19ref" "$Ess\\pilote-bis-c19k" 2>&1 | Out-File "$Ici\\qc-c19.txt"', '"$Ici\\qc_c20.py" "$Ess\\pilote-bis-c20j" "$Ess\\pilote-bis-c20z" 2>&1 | Out-File "$Ici\\qc-c20.txt"'),
             ('QC c19 : $((Get-Content "$Ici\\qc-c19.txt")', 'QC c20 : $((Get-Content "$Ici\\qc-c20.txt")')):
    c = rep(c, a, b)
assert 'c19' not in c, [l for l in c.split('\n') if 'c19' in l]
ecrire('lancer-c20.ps1', c)
print('ok')
