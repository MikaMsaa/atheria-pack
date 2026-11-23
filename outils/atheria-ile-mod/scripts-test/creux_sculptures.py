# Creux carres des lieux sculptes (15/11) : monde c22m contre carte de hauteur, avant/apres le comblement 0.9.6e.
# Un creux = groupe 4-connexe de colonnes de meme Y (<= 9 colonnes) dont tout le tour (8 voisins) est plus haut, au sec (Y >= 62).
# usage : python -I creux_sculptures.py <monde> [zones]
import sys, os, json, collections
from PIL import Image
ICI = os.path.dirname(os.path.abspath(sys.argv[0])); SC = os.path.join(os.path.dirname(ICI), 'sculpture')
W = sys.argv[1]; ZONES = sys.argv[2].split(',') if len(sys.argv) > 2 else ['ileA', 'phare', 'z002', 'hum', 'z003', 'z006', 'z001', 'z008', 'z010', 'z013', 'z004', 'z009', 'z011']
src = open(os.path.join(ICI, 'defauts_c22.py')).read().split('res = {}')[0]
_a = sys.argv; sys.argv = [_a[0], W]; exec(src); sys.argv = _a
SCU = json.load(open(os.path.join(os.path.dirname(SC), 'branche-relief', 'regions-v3n2.json'), encoding='utf-8'))['relief_naturel']['sculptures']
MAXC = 9
def creux(Y, w, h, ok):
    """Y[(i,j)] -> liste de groupes creux"""
    vus = set(); res = []
    for p in Y:
        if p in vus or not ok(p): continue
        y = Y[p]; g = [p]; vus.add(p); k = 0; trop = False
        while k < len(g):
            a, b = g[k]; k += 1
            for d in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                q = (a + d[0], b + d[1])
                if q in Y and q not in vus and Y[q] == y: vus.add(q); g.append(q)
            if len(g) > MAXC: trop = True; break
        if trop: continue
        gs = set(g); tour = set()
        for a, b in g:
            for da in (-1, 0, 1):
                for db in (-1, 0, 1):
                    q = (a + da, b + db)
                    if q not in gs: tour.add(q)
        if all(q in Y and Y[q] > y for q in tour): res.append((g, min(Y[q] for q in tour) - y))
    return res
def combler(H, w, h, M):
    """0.9.6e : meme regle sur la carte arrondie ; chaque creux est remonte au plus bas de son tour (valeur flottante = Y + 0.5 - 1e-3 -> arrondi = Y du tour)"""
    H = list(H)
    for _ in range(3):
        Y = {(i, j): int(H[j * w + i] + 0.5) for j in range(h) for i in range(w)}
        cs = creux(Y, w, h, lambda p: M[p[1] * w + p[0]] > 0 and Y[p] >= 62)
        if not cs: break
        for g, dz in cs:
            for i, j in g: H[j * w + i] = float(Y[g[0]] + dz)
    return H
tot = collections.Counter()
for zn in ZONES:
    sx = [s for s in SCU if s['hauteur'].split('/')[1] == zn][0]; x0, z0 = sx['x0'], sx['z0']
    HI = Image.open(os.path.join(SC, zn, 'hauteur.png')); MI = Image.open(os.path.join(SC, zn, 'masque.png')); w, h = HI.size
    H = [v / 256.0 for v in HI.getdata()]; M = list(MI.getdata()); M = [m[0] if isinstance(m, tuple) else m for m in M]
    # monde : surface seche (sans eau au-dessus)
    Ym = {}
    for j in range(h):
        for i in range(w):
            y, n = surface(x0 + i, z0 + j)
            if y is not None and bloc(x0 + i, y + 1, z0 + j) != 'water': Ym[(i, j)] = y
    cm = creux(Ym, w, h, lambda p: M[p[1] * w + p[0]] > 0 and Ym[p] >= 62)
    # carte : arrondi de la carte de hauteur sous le masque plein
    Yc = {(i, j): int(H[j * w + i] + 0.5) for j in range(h) for i in range(w)}
    cc = creux(Yc, w, h, lambda p: M[p[1] * w + p[0]] >= 255 and Yc[p] >= 62)
    accord = sum(1 for p, y in Ym.items() if M[p[1] * w + p[0]] >= 255 and Yc[p] == y); plein = sum(1 for p in Ym if M[p[1] * w + p[0]] >= 255)
    # creux du monde expliques par la carte (au moins une colonne commune)
    cset = set(q for g, _ in cc for q in g)
    expl = sum(1 for g, _ in cm if any(q in cset for q in g))
    H2 = combler(H, w, h, M); Y2 = {(i, j): int(H2[j * w + i] + 0.5) for j in range(h) for i in range(w)}
    cc2 = creux(Y2, w, h, lambda p: M[p[1] * w + p[0]] >= 255 and Y2[p] >= 62)
    modif = sum(1 for k in range(w * h) if H2[k] != H[k])
    tc = collections.Counter('%dx%d' % (max(q[0] for q in g) - min(q[0] for q in g) + 1, max(q[1] for q in g) - min(q[1] for q in g) + 1) for g, _ in cm)
    print('%-5s monde : %3d creux secs %s (profondeur %s) ; carte arrondie : %3d creux, %d/%d creux du monde expliques ; accord monde/carte %.0f %% ; apres comblement : %d creux (%d colonnes remontees)' % (
        zn, len(cm), dict(tc.most_common(4)), dict(collections.Counter(d for _, d in cm).most_common(3)), len(cc), expl, len(cm), 100 * accord / max(1, plein), len(cc2), modif), flush=True)
    for g, d in cm[:3]:
        i, j = g[0]; print('      ex. %d,%d Y %d, %d colonnes, profondeur %d, bloc %s, carte %.2f' % (x0 + i, z0 + j, Ym[(i, j)], len(g), d, surface(x0 + i, z0 + j)[1], H[j * w + i]))
    tot['monde'] += len(cm); tot['carte'] += len(cc); tot['apres'] += len(cc2); tot['expl'] += expl
print('TOTAL', dict(tot))
