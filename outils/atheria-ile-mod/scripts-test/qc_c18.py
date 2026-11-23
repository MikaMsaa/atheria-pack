# QC hors ligne du test c18 (lieux du trailer) : monde ref (v3i) contre monde j (v3j + plateaux-v3j).
# usage : python -I qc_c18.py <monde_ref> <monde_j>
import sys, os, statistics, collections
REF, J = sys.argv[1], sys.argv[2]
ICI = os.path.dirname(os.path.abspath(sys.argv[0]))
src = open(os.path.join(ICI, 'comparer_chunks.py')).read().split('mondes=args')[0]
src = src.replace("sys.argv,args=[sys.argv[0],'x'],sys.argv[1:]", "args=[]").replace("os.path.dirname(os.path.abspath(__file__))", repr(ICI))
_a = sys.argv; exec(src); sys.argv = _a
caches = {REF: {}, J: {}}
def bl(w, x, y, z):
    k = (x >> 4, z >> 4); c = caches[w]
    if k not in c:
        try: r = lire(w, *k); c[k] = r[1] if r else None
        except Exception: c[k] = None
    b = c[k]
    if b is None: return None
    Y = y >> 4; L = b.get(Y + 256 if Y < 0 else Y)
    if L is None: return 'air'
    return L[((y & 15) << 8) | ((z & 15) << 4) | (x & 15)].split('[')[0].split(':')[-1]
VEG = ('air', 'cave_air', 'short_grass', 'tall_grass', 'fern', 'large_fern', 'snow', 'dead_bush', 'seagrass', 'tall_seagrass', 'kelp', 'kelp_plant', 'vine')
def col(w, x, z):
    if bl(w, x, 64, z) is None: return None
    eau = None
    for y in range(200, 0, -1):
        n = bl(w, x, y, z)
        if n == 'water':
            if eau is None: eau = y
            continue
        if n in VEG or 'flower' in n or n.endswith('_leaves') or n.endswith('_log') or 'sapling' in n: continue
        return y, n, eau
# emprises (x2, z2 exclus) et fondus
LOT70 = (2466, -2080, 2594, -1952); LOT68 = (2880, -1000, 2981, -904)
PLAT = {'lot70': (LOT70, 65, 96 + 16), 'lot68': (LOT68, 65, 32 + 16)}
ZONES = {'lot70': (2530, -2016, 128), 'lot68': (2930, -952, 112), 'lot69': (2520, -3013, 96), 'lot67': (2620, -3024, 160)}
def dans(r, x, z, m=0): return r[0] - m <= x < r[2] + m and r[1] - m <= z < r[3] + m
print('1. Plateaux (monde j) : dessus du sol dans l emprise')
for nom, (r, y, f) in PLAT.items():
    h = collections.Counter(); manq = 0
    for x in range(r[0], r[2]):
        for z in range(r[1], r[3]):
            c = col(J, x, z)
            if c is None: manq += 1; continue
            h[c[0]] += 1
    n = sum(h.values())
    print('  %s : %d colonnes, Y le plus frequent %s, part a Y %d : %.1f %%, min %s max %s, non generees %d' % (
        nom, n, h.most_common(1)[0][0] if n else '-', y, 100.0 * h[y] / max(1, n), min(h) if h else '-', max(h) if h else '-', manq))
print('2. Changements de surface ref -> j hors emprises, fondus et marges (bruit habituel : ~400 colonnes par zone de 256x256)')
for nom, (cx, cz, R) in ZONES.items():
    ch = hors = 0; ex = []
    for x in range(cx - R, cx + R):
        for z in range(cz - R, cz + R):
            a, b = col(REF, x, z), col(J, x, z)
            if a is None or b is None: continue
            if a[:2] == b[:2]: continue
            ch += 1
            if any(dans(r, x, z, f) for (r, y, f) in PLAT.values()): continue
            hors += 1
            if len(ex) < 5: ex.append((x, z, a[:2], b[:2]))
    print('  %s : %d colonnes changees, dont %d hors emprises/fondus ; ex %s' % (nom, ch, hors, ex))
print('3. RN1 : chaussee (black_concrete_powder) sur l axe x 2522..2523, z -2144..-1888')
for w, nm in ((REF, 'ref'), (J, 'j')):
    dedans = dehors = 0; ys = []
    for z in range(-2144, -1888):
        c = col(w, 2522, z)
        if c is None or c[1] != 'black_concrete_powder': continue
        ys.append(c[0])
        if dans(LOT70, 2522, z): dedans += 1
        else: dehors += 1
    print('  %s : chaussee dans lot70 %d, hors lot70 %d, Y %s' % (nm, dedans, dehors, sorted(set(ys))))
print('4. Sol au-dessus de la bouche des Passeurs (2512..2515, -3024..-3019)')
for w, nm in ((REF, 'ref'), (J, 'j')):
    v = [col(w, x, z) for x in range(2512, 2516) for z in range(-3024, -3018)]
    v = [c[0] for c in v if c]
    print('  %s : %s' % (nm, ('min %d max %d mediane %d' % (min(v), max(v), statistics.median(v))) if v else 'non genere'))
print('5. Cote est de l enceinte (monde j) : premiere colonne d eau et profondeur a +16 / +48')
for z in range(-3088, -2959, 16):
    x0 = None
    for x in range(2560, 2781):
        c = col(J, x, z)
        if c and c[2] is not None: x0 = x; break
    if x0 is None: print('  z %d : pas d eau jusqu a x 2780 (ou non genere)' % z); continue
    def p(x):
        c = col(J, x, z)
        return '-' if c is None else ('prof %d (fond Y %d)' % (c[2] - c[0], c[0]) if c[2] else 'terre Y %d' % c[0])
    print('  z %d : eau a x %d, %s ; +16 %s ; +48 %s' % (z, x0, p(x0), p(x0 + 16), p(x0 + 48)))
print('6. Port 0.9.4h (monde j) : bassin x 2576..2623 z -3088..-2961 (fond 55 -> 57 le long de x), chenal x 2592..2623 z -3132..-3089 (fond 58 -> 57 le long de z), eau jusqu a Y 62')
def brut(w, x, y, z):
    k = (x >> 4, z >> 4); b = caches[w].get(k)
    if b is None: bl(w, x, y, z); b = caches[w].get(k)
    if b is None: return None
    Y = y >> 4; L = b.get(Y + 256 if Y < 0 else Y)
    return 'air' if L is None else L[((y & 15) << 8) | ((z & 15) << 4) | (x & 15)]
BAS = [((2576, -3088, 2624, -2960), 'x', 55, 57), ((2592, -3132, 2624, -3088), 'z', 58, 57)]
def fond_att(r, ax, a, b, x, z):
    t = (z - r[1]) / max(1, r[3] - 1 - r[1]) if ax == 'z' else (x - r[0]) / max(1, r[2] - 1 - r[0])
    return int(__import__('math').floor(a + (b - a) * max(0, min(1, t)) + 0.5))  # comme Math.round en Java
def dansb(x, z): return any(dans(r, x, z) for r, *_ in BAS)
tot = seche = surf_ko = fond_ko = fond_ecart = coul = ng = 0; hf = collections.Counter(); ex = []
for r, ax, a, b in BAS:
    for x in range(r[0], r[2]):
        for z in range(r[1], r[3]):
            c = col(J, x, z)
            if c is None: ng += 1; continue
            tot += 1; hf[c[0]] += 1
            if c[2] is None: seche += 1; len(ex) < 6 and ex.append(('seche', x, z, c[:2])); continue
            if c[2] != 62: surf_ko += 1; len(ex) < 6 and ex.append(('surface', x, z, c[2]))
            if not 55 <= c[0] <= 58: fond_ko += 1
            if c[0] != fond_att(r, ax, a, b, x, z): fond_ecart += 1
            for y in range(c[0] + 1, c[2] + 1):
                s = brut(J, x, y, z)
                if s and 'water' in s and not ('level=0' in s or "'level', '0'" in s): coul += 1; break
print('  colonnes %d (non generees %d) : seches %d, surface != 62 : %d, fond hors 55..58 : %d, fond different du profil : %d, colonnes avec eau courante : %d' % (tot, ng, seche, surf_ko, fond_ko, fond_ecart, coul))
print('  fonds : %s ; ex %s' % (sorted(hf.items()), ex))
# murs d eau : colonnes hors bassins, a 1..3 blocs du bord, dont l eau depasse Y 62 ou dont le sol est sous 62 sans eau (l eau du bassin coulerait)
mur = trou = bord = villes = 0; exm = []
for r, *_ in BAS:
    for x in range(r[0] - 3, r[2] + 3):
        for z in range(r[1] - 3, r[3] + 3):
            if dansb(x, z): continue
            c = col(J, x, z)
            if c is None: continue
            bord += 1
            if c[2] is not None and c[2] > 62: mur += 1; len(exm) < 5 and exm.append(('eau haute', x, z, c[2]))
            if c[2] is None and c[0] < 62:
                if x < 2576 and -3088 <= z < -2960: villes += 1; continue  # lot67 : eau posee par Villes
                trou += 1; len(exm) < 5 and exm.append(('sol bas sans eau', x, z, c[0]))
print('  pourtour (3 blocs, %d colonnes) : eau au-dessus de 62 : %d, sol sous 62 sans eau : %d (plus %d dans lot67, cote quai, ou Villes pose son eau) ; ex %s' % (bord, mur, trou, villes, exm))
# eau du quai cote Villes (x 2549..2575) : informative (Villes la pose)
q = [col(J, x, z) for x in range(2549, 2576) for z in range(-3088, -2960, 8)]
q = [c for c in q if c]
print('  cote quai x 2549..2575 : %d colonnes lues, avec eau %d, sols %s' % (len(q), sum(1 for c in q if c[2] is not None), sorted(collections.Counter(c[0] for c in q).items())[:8]))
# raccord au lagon : parcours des colonnes en eau a Y 62 depuis le bassin
from collections import deque
vu = set(); f = deque([(2600, -3024)]); hors = 0; zmin = 0
while f and len(vu) < 60000:
    x, z = f.popleft()
    if (x, z) in vu: continue
    vu.add((x, z))
    c = col(J, x, z)
    if c is None or c[2] is None or c[2] < 62: continue
    if not dansb(x, z): hors += 1; zmin = min(zmin, z)
    for dx, dz in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        n = (x + dx, z + dz)
        if n not in vu and 2420 <= n[0] < 2780 and -3184 <= n[1] < -2864: f.append(n)
print('  raccord : %d colonnes d eau reliees au bassin hors bassin/chenal (z le plus au nord %s) ; %s' % (hors, zmin if hors else '-', 'OK (lagon atteint)' if hors > 2000 else 'KO ou lagon hors zone'))
print('  lot 0 (enceinte de Longoni, fN 0) recouvre tout le bassin : la pose est faite quand meme si les colonnes ne sont pas seches ci-dessus')
ok = tot > 0 and ng == 0 and seche == 0 and surf_ko == 0 and fond_ko == 0 and coul == 0 and mur == 0 and trou == 0 and hors > 2000
print('  VERDICT port : %s' % ('OK' if ok else ('non testable (zone non generee)' if tot == 0 else 'KO')))
print('7. Toit naturel au-dessus des volumes de Longoni (monde j) : le mod ne creuse rien, le build creuse jusqu a y_max ; toit = sol - y_max')
for nom, (x1, z1, x2, z2, ym) in {'Bancoul 43..63 (x 2480..2548)': (2480, -3040, 2549, -2986, 63), 'Station des Enfants 48..63': (2496, -3027, 2544, -2986, 63), 'Puits des Passeurs 38..47': (2518, -3018, 2523, -3013, 47)}.items():
    h = collections.Counter(); eau = 0
    for x in range(x1, x2):
        for z in range(z1, z2):
            c = col(J, x, z)
            if c is None: continue
            h[c[0] - ym] += 1; eau += c[2] is not None
    n = sum(h.values())
    print('  %s : %d colonnes, toit perce (<=0) %d, 1 bloc %d, 2 blocs %d, >=3 %d, sous l eau %d' % (nom, n, sum(v for k, v in h.items() if k <= 0), h[1], h[2], sum(v for k, v in h.items() if k >= 3), eau))
