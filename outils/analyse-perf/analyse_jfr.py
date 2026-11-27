# Regroupe un enregistrement JFR par paquet de mod (lecture en flux du texte de « jfr print »).
# Usage : python -I analyse_jfr.py <jfr.exe> <fichier.jfr> <sortie.txt>
import subprocess, sys, collections, re

jfr, fichier, sortie = sys.argv[1:4]
IGNORE = ('java.', 'jdk.', 'sun.', 'com.sun.', 'javax.')
CADRE = re.compile(r'^\s+([\w$.]+)\.([\w$<>]+)\(')


def paquet(nom, n=3):
    return '.'.join(nom.split('.')[:n])


def evenements(evt, depth):
    p = subprocess.Popen([jfr, 'print', '--stack-depth', str(depth), '--events', evt, fichier],
                         stdout=subprocess.PIPE, text=True, encoding='utf-8', errors='replace', bufsize=1 << 20)
    cur = None
    for l in p.stdout:
        if l.startswith(evt):
            cur = {'cadres': []}
        elif cur is None:
            continue
        elif l.startswith('}'):
            yield cur; cur = None
        else:
            s = l.strip()
            if s.startswith('sampledThread') or s.startswith('eventThread'):
                m = re.search(r'"(.*)"', s); cur.setdefault('fil', m.group(1) if m else '?')
            elif s.startswith('weight'):
                m = re.search(r'=\s*([\d.,]+)\s*(bytes|kB|MB|GB)', s)
                if m:
                    v = float(m.group(1).replace(',', '.')); u = {'bytes': 1, 'kB': 1e3, 'MB': 1e6, 'GB': 1e9}[m.group(2)]
                    cur['poids'] = v * u
            elif s.startswith('objectClass'):
                m = re.search(r'=\s*([\w$.\[\]]+)', s); cur['classe'] = m.group(1) if m else '?'
            else:
                m = CADRE.match(l)
                if m: cur['cadres'].append((m.group(1), m.group(2)))
    p.wait()


def premier(cadres):
    for t, m in cadres:
        if not t.startswith(IGNORE): return t, m
    return cadres[0] if cadres else ('?', '?')


L = []
par_fil = collections.defaultdict(collections.Counter); meth = collections.defaultdict(collections.Counter); tot = collections.Counter()
for e in evenements('jdk.ExecutionSample', 12):
    fil = e.get('fil', '?')
    if fil.startswith('Worker-'): fil = 'Worker-*'
    t, m = premier(e['cadres'])
    par_fil[fil][paquet(t)] += 1; meth[fil][t + '.' + m] += 1; tot[fil] += 1
L.append('Echantillons CPU par fil : ' + ', '.join('%s=%d' % kv for kv in tot.most_common(15)))
for fil in ('Render thread', 'Server thread'):
    n = tot[fil] or 1
    L.append(''); L.append('== %s : %d echantillons, par paquet (3 segments)' % (fil, tot[fil]))
    for p_, c in par_fil[fil].most_common(25): L.append('%6.1f %%  %5d  %s' % (100 * c / n, c, p_))
    L.append('-- %s : 40 methodes les plus vues (premier cadre hors java/jdk/sun)' % fil)
    for p_, c in meth[fil].most_common(40): L.append('%6.1f %%  %5d  %s' % (100 * c / n, c, p_))

poids = collections.Counter(); pc = collections.Counter(); T = 0
for e in evenements('jdk.ObjectAllocationSample', 12):
    w = e.get('poids', 0); T += w
    t, m = premier(e['cadres']); poids[paquet(t)] += w; pc[e.get('classe', '?')] += w
L.append(''); L.append("== Allocation (poids) : %.1f Go sur l'enregistrement, 30 premiers paquets" % (T / 1e9))
for p_, w in poids.most_common(30): L.append('%6.1f %%  %8.0f Mo  %s' % (100 * w / (T or 1), w / 1e6, p_))
L.append('-- classes allouees')
for p_, w in pc.most_common(15): L.append('%6.1f %%  %8.0f Mo  %s' % (100 * w / (T or 1), w / 1e6, p_))
open(sortie, 'w', encoding='utf-8').write('\n'.join(L) + '\n')
print('\n'.join(L))
