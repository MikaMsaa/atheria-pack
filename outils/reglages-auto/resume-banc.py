# Resume du releve mesure-banc.ps1 par combinaison du banc (fenetres prises dans les lignes [Banc] combinaison du journal)
import sys, re, csv
mesure, journal = sys.argv[1], sys.argv[2]
debuts = []
for l in open(journal, encoding='utf-8', errors='replace'):
    m = re.search(r'(\d\d:\d\d:\d\d)\.\d+\].*\[Banc\] combinaison (\S+) :', l)
    if m: debuts.append((m.group(1), m.group(2)))
    m = re.search(r'(\d\d:\d\d:\d\d)\.\d+\].*\[Banc\] (fin|termin)', l, re.I)
    if m: debuts.append((m.group(1), '__fin__'))
rows = list(csv.DictReader(open(mesure, encoding='utf-8-sig'), delimiter=';'))
def num(v):
    try: return float(v.replace(',', '.'))
    except: return None
def stats(rs, k):
    v = [num(r[k]) for r in rs if num(r[k]) is not None]
    if not v: return '-'
    return f"{sum(v)/len(v):.0f} ({min(v):.0f}-{max(v):.0f})"
cles = ['gpu_pct','gpu_temp_C','vram_Mo','gpu_W','cpu_total_pct','cpu_jeu_pct','libre_Mo','jeu_Mo','old_pct']
print('combinaison;n;' + ';'.join(cles) + ';fgc_debut-fin')
for i,(h,nom) in enumerate(debuts):
    if nom == '__fin__': continue
    fin = debuts[i+1][0] if i+1 < len(debuts) else '99:99:99'
    rs = [r for r in rows if h <= r['heure'] < fin]
    if not rs: continue
    print(f"{nom};{len(rs)};" + ';'.join(stats(rs,k) for k in cles) + f";{rs[0]['fgc']}-{rs[-1]['fgc']}")
tout = [r for r in rows if debuts and debuts[0][0] <= r['heure']]
print(f"TOUT LE BANC;{len(tout)};" + ';'.join(stats(tout,k) for k in cles) + (f";{tout[0]['fgc']}-{tout[-1]['fgc']}" if tout else ''))
