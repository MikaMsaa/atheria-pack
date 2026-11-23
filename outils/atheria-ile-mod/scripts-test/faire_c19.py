# c19 : 0.9.5 (lagon vivant, ile parasite, ilot sculpte, debris grands) : ref = 0.9.4i + v3j, k = 0.9.5 + v3k ; zones lagon, ile A, sec, hum
import os, json
os.chdir(os.path.dirname(os.path.abspath(__file__)))
BR = os.path.join('..', 'branche-relief')
# regions-v3k = v3j + parametres 0.9.5
d = json.load(open(os.path.join(BR, 'regions-v3j.json'), encoding='utf-8'))
rn = d['relief_naturel']
rn.update({'lagon_biome_force': 1, 'lagon_plafond_strict': 1, 'lagon_vie': 1, 'debris_grands': 1, 'debris_par_chunk': 0.08, 'sols_taches': 0.8,
           'ilots_sable': [[-2534, -5864, 52]],
           'sculptures': [{'nom': 'ilot de sable A (lagon)', 'x0': -2582, 'z0': -5892, 'hauteur': 'sculptures/ileA/hauteur.png',
                           'masque': 'sculptures/ileA/masque.png', 'palmiers': 6, 'arbre': 'ecologics:coconut_tree'}]})
rn['_aide_v3k'] = ("0.9.5 : lagon_biome_force (biome du lagon sur toute la classe lagon/recif a plus de 48 blocs de la terre de la carte, "
                   "corrige la glace), lagon_plafond_strict (plus aucun ilot hors ilots_sable [[x,z,r],...]), lagon_vie 0..1 (fond 54..60, "
                   "patates de corail, herbiers, concombres de mer, pas de varech), debris_grands (epave 5-6, poteau 6-9, cloture 6-12), "
                   "debris 0.08 par chunk, sols en taches 0.8 ; sculptures : carte de hauteur PNG 16 bits (Y x 256) + masque, cocotiers")
open(os.path.join(BR, 'regions-v3k.json'), 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=2))

def lire(f): return open(f, encoding='utf-8-sig', newline='').read().replace('\r\n', '\n')
def ecrire(f, t): open(f, 'w', encoding='utf-8-sig', newline='').write(t.replace('\n', '\r\n'))
def rep(t, a, b):
    assert t.count(a) >= 1, a
    return t.replace(a, b)

CFG = r'$Ess\config\atheria_ile'
SCU = r'$Racine\outils\atheria-ile-mod\sculpture\ileA'
Z = r"zones = @(@('-2514 -5850', 160, 'lagon'), @('-2560 -5864', 64, 'ileA'), @('-288 -3504', 128, 'sec'), @('3330 860', 128, 'hum'))"
# c19k seul : remesure du top 10 a sculpter dans la generation actuelle (rayon 72, mesure sur 64)
ZK = Z[:-1] + ''.join(", @('%d %d', 72, '%s')" % q for q in ((-5136, -672, 'z002'), (240, -5712, 'z003'), (-1392, 5760, 'z006'), (3312, -1248, 'z001'), (-3936, 4416, 'z008'), (-1296, 2144, 'z013'), (-3216, 3264, 'z004'), (1680, -384, 'z011'))) + ')'
t = lire('lancer-bis-c18.ps1')
t = rep(t, 'journal-bis-c18', 'journal-bis-c19')
i = t.index('$V = @('); j = t.index('\n)', i) + 2
t = t[:i] + r'''$V = @(
  @{ n = 'c19ref'; jar = "$BR\atheria-ile-0.9.4i-port.jar"; reg = "$BR\regions-v3j.json"; pl = $null; delta = $true; c1 = $true; dp = "$BR\atheria_ile_datapack-1.4-relief-v3-plateau.zip"; ZZ },
  @{ n = 'c19k'; jar = "$BR\atheria-ile-0.9.5-lagon.jar"; reg = "$BR\regions-v3k.json"; pl = $null; delta = $true; c1 = $true; dp = "$BR\atheria_ile_datapack-1.4-relief-v3-plateau.zip"; KK }
)'''.replace('ZZ', Z).replace('KK', ZK) + t[j:]
A1 = '    Copy-Item $v.reg $Reg -Force\n'
B1 = (A1 + '    Remove-Item "' + CFG + '\\sculptures" -Recurse -Force -ErrorAction SilentlyContinue\n'
      + "    if ($v.n -eq 'c19k') { New-Item -ItemType Directory -Force \"" + CFG + "\\sculptures\\ileA\" | Out-Null; Copy-Item \""
      + SCU + "\\hauteur.png\", \"" + SCU + "\\masque.png\" \"" + CFG + "\\sculptures\\ileA\" }\n")
t = rep(t, A1, B1)
A2 = '"' + CFG + '\\plateaux.json" -ErrorAction SilentlyContinue\n  J "copie'
B2 = '"' + CFG + '\\plateaux.json" -ErrorAction SilentlyContinue\n  Remove-Item "' + CFG + '\\sculptures" -Recurse -Force -ErrorAction SilentlyContinue\n  J "copie'
t = rep(t, A2, B2)
t = rep(t, "if ($v.n -eq 'c18ref') { J \"c18ref deja genere (v3i, 0.9.4g) : garde\"; continue }", "if ($v.n -eq 'c19ref') { J \"c19ref deja genere : garde\"; continue }")
ecrire('lancer-bis-c19.ps1', t)

c = lire('lancer-c18.ps1')
for a, b in (('journal-bis-c18', 'journal-bis-c19'), ('lancer-bis-c18', 'lancer-bis-c19'), ('journal-c18', 'journal-c19'), ('creneau 18', 'creneau 19'), ('CRENEAU18', 'CRENEAU19'),
             ('lieux du trailer v3j (lot67 a lot70, port 0.9.4i) contre v3i, monde j seul (ref garde), 4 zones, 25 min', 'lagon vivant, ilot sculpte, debris 0.9.5 (v3k) contre 0.9.4i (v3j), 2 mondes, 4 zones, 15 min'),
             ('lieux du trailer v3j', 'lagon 0.9.5'),
             ('pilote-bis-c18j\\region', 'pilote-bis-c19k\\region'),
             ('"$Ici\\qc_c18.py" "$Ess\\pilote-bis-c18ref" "$Ess\\pilote-bis-c18j" 2>&1 | Out-File "$Ici\\qc-c18.txt"', '"$Ici\\qc_c19.py" "$Ess\\pilote-bis-c19ref" "$Ess\\pilote-bis-c19k" 2>&1 | Out-File "$Ici\\qc-c19.txt"'),
             ('QC c18 : $((Get-Content "$Ici\\qc-c18.txt")', 'QC c19 : $((Get-Content "$Ici\\qc-c19.txt")')):
    c = rep(c, a, b)
assert 'c18' not in c.replace('c18ref', '').replace('c18j', ''), [l for l in c.split('\n') if 'c18' in l]
ecrire('lancer-c19.ps1', c)
print('ok')
