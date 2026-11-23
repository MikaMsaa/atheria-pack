# c21 : 0.9.6c + regions-v3n (= v3m + fondu_doux 1 + vegetation_marges 1) : 12 lieux sculptes, lagon + ilot A, Phare, Majicavo (lot70).
# Ecrit regions-v3n.json, lancer-bis-c21.ps1, lancer-c21.ps1 (serveur seul, QC hors verrou). Ne lance rien.
import os, json
os.chdir(os.path.dirname(os.path.abspath(__file__)))
BR = os.path.join('..', 'branche-relief'); SC = os.path.join('..', 'sculpture')
def lire(f): return open(f, encoding='utf-8-sig', newline='').read().replace('\r\n', '\n')
def ecrire(f, t): open(f, 'w', encoding='utf-8-sig', newline='').write(t.replace('\n', '\r\n'))
def rep(t, a, b):
    assert t.count(a) >= 1, a
    return t.replace(a, b)
d = json.load(open(os.path.join(BR, 'regions-v3m.json'), encoding='utf-8'))
d['relief_naturel'].update({'fondu_doux': 1, 'vegetation_marges': 1})
d['relief_naturel']['_aide_v3n'] = '0.9.6c : fondu_doux (raccord exact sur 6 blocs, distance bruitee, smootherstep), vegetation_marges (herbes et arbres du pays dans marges et fondus, jamais dans un lot)'
json.dump(d, open(os.path.join(BR, 'regions-v3n.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
CLES = ['ileA', 'phare', 'z002', 'hum', 'z003', 'z006', 'z001', 'z008', 'z010', 'z013', 'z004', 'z009', 'z011']
Z = []
for c in CLES[1:]:
    m = json.load(open(os.path.join(SC, c, 'mesure.json'), encoding='utf-8')); Z.append((m['x0'] + 80, m['z0'] + 80, 96, c))
Z += [(-2514, -5850, 96, 'lagon'), (2530, -2016, 128, 'majicavo'), (2941, -952, 112, 'lot68')]   # lot68 a Y 67 (15/11)
ZS = 'zones = @(' + ', '.join("@('%d %d', %d, '%s')" % z for z in Z) + ')'
DP = r'"$BR\atheria_ile_datapack-1.4-relief-v3-plateau.zip"'
t = lire('lancer-bis-c20.ps1')
t = rep(t, 'journal-bis-c20', 'journal-bis-c21')
i = t.index('$V = @('); j = t.index('\n)', i) + 2
t = t[:i] + ('$V = @(\n'
    "  @{ n = 'c21m'; jar = \"$BR\\atheria-ile-0.9.6c-raccords.jar\"; reg = \"$BR\\regions-v3n.json\"; pl = \"$BR\\plateaux-v3l.json\"; delta = $true; c1 = $true; dp = " + DP + '; ' + ZS + ' }\n'
    ')') + t[j:]
a = t.index("    if ($v.n -eq 'c19k') {"); b = t.index('\n', a)
t = t[:a] + ("    foreach ($s in @(" + ', '.join("'%s'" % c for c in CLES) + ")) { New-Item -ItemType Directory -Force \"$Ess\\config\\atheria_ile\\sculptures\\$s\" | Out-Null; "
             "Copy-Item \"$Racine\\outils\\atheria-ile-mod\\sculpture\\$s\\hauteur.png\", \"$Racine\\outils\\atheria-ile-mod\\sculpture\\$s\\masque.png\" \"$Ess\\config\\atheria_ile\\sculptures\\$s\" }") + t[b:]
t = t.replace("if (((Get-Date) - $t1).TotalMinutes -gt 6) { throw \"generation $($zone[2]) trop longue\" }", "if (((Get-Date) - $t1).TotalMinutes -gt 8) { throw \"generation $($zone[2]) trop longue\" }")
ecrire('lancer-bis-c21.ps1', t)
c = lire('lancer-c20.ps1')
for a_, b_ in (('journal-bis-c20', 'journal-bis-c21'), ('lancer-bis-c20', 'lancer-bis-c21'), ('journal-c20', 'journal-c21'), ('creneau 20', 'creneau 21'), ('CRENEAU20', 'CRENEAU21'),
               ('lacs hors lots et lave hors volcan 0.9.6 (v3l) et non-regression (v3j), 2 mondes, 4 zones, 15 min', '0.9.6c v3n : 12 lieux sculptes, lagon, Phare, Majicavo, 1 monde, 16 zones, 40 min'),
               ('pilote-bis-c20z\\region', 'pilote-bis-c21m\\region'),
               ('"$Ici\\qc_c20.py" "$Ess\\pilote-bis-c20j" "$Ess\\pilote-bis-c20z" 2>&1 | Out-File "$Ici\\qc-c20.txt"', '"$Ici\\qc_c21.py" "$Ess\\pilote-bis-c21m" 2>&1 | Out-File "$Ici\\qc-c21.txt"'),
               ('QC c20 : $((Get-Content "$Ici\\qc-c20.txt")', 'QC c21 : $((Get-Content "$Ici\\qc-c21.txt")'),
               ('[int]$BudgetMin = 15', '[int]$BudgetMin = 40')):
    c = rep(c, a_, b_)
assert 'c20' not in c, [l for l in c.split('\n') if 'c20' in l]
ecrire('lancer-c21.ps1', c)
print('ok', len(Z), 'zones')
