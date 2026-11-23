# Defauts vus sur les captures c22 (15/11), lecture seule du monde : arbres flottants, neige/gravier dans l'eau, trous carres.
# usage : python -I defauts_c22.py <monde> [zones separees par ,]
import sys, os, json, collections
ICI = os.path.dirname(os.path.abspath(sys.argv[0])); SC = os.path.join(os.path.dirname(ICI), 'sculpture')
W = sys.argv[1]; ZONES = sys.argv[2].split(',') if len(sys.argv) > 2 else ['ileA', 'phare', 'z002', 'hum', 'z003', 'z006', 'z001', 'z008', 'z010', 'z013', 'z004', 'z009', 'z011']
src = open(os.path.join(ICI, 'comparer_chunks.py')).read().split('mondes=args')[0]
src = src.replace("sys.argv,args=[sys.argv[0],'x'],sys.argv[1:]", "args=[]").replace("os.path.dirname(os.path.abspath(__file__))", repr(ICI))
_a = sys.argv; exec(src); sys.argv = _a
cache = {}
def chunk(x, z):
    k = (x >> 4, z >> 4)
    if k not in cache:
        try: r = lire(W, *k)
        except Exception: r = None
        cache[k] = r[1] if r else None
    return cache[k]
def bloc(x, y, z):
    b = chunk(x, z)
    if b is None: return None
    Y = y >> 4; Ys = Y + 256 if Y < 0 else Y
    L = b.get(Ys)
    if L is None: return 'air'
    return L[((y & 15) << 8) | ((z & 15) << 4) | (x & 15)].split('[')[0].split(':')[-1]
def bp(x, y, z):  # avec proprietes
    b = chunk(x, z)
    if b is None: return None
    Y = y >> 4; Ys = Y + 256 if Y < 0 else Y; L = b.get(Ys)
    return 'air' if L is None else L[((y & 15) << 8) | ((z & 15) << 4) | (x & 15)]
AIR = {'air', 'cave_air', 'void_air'}
def bois(n): return n.endswith('_log') or n.endswith('_wood') or n.endswith('_stem')
def feuille(n): return n.endswith('_leaves')
def veg(n): return n in AIR or feuille(n) or bois(n) or any(t in n for t in ('grass', 'fern', 'flower', 'bush', 'sapling', 'vine', 'petals', 'snow', 'kelp', 'seagrass', 'carpet', 'mushroom', 'sugar_cane', 'dandelion', 'poppy', 'tulip', 'propagule', 'roots', 'leaf_litter', 'pebble', 'twig'))
def surface(x, z, y0=160, y1=30):
    for y in range(y0, y1, -1):
        n = bloc(x, y, z)
        if n is None: return None, None
        if not veg(n) and n != 'water': return y, n
    return None, None
def eau_haut(x, z, y0=160):
    for y in range(y0, 30, -1):
        n = bloc(x, y, z)
        if n is None: return None
        if n == 'water': return y
        if not veg(n): return None
    return None
res = {}
for zn in ZONES:
    from PIL import Image
    sx = [s for s in json.load(open(os.path.join(os.path.dirname(SC), 'branche-relief', 'regions-v3n2.json'), encoding='utf-8'))['relief_naturel']['sculptures'] if s['hauteur'].split('/')[1] == zn][0]
    x0, z0 = sx['x0'], sx['z0']; T = Image.open(os.path.join(SC, zn, 'hauteur.png')).size[0]
    flott = []; neige = collections.Counter(); neige_ex = []; trous = []
    surf = {}
    for x in range(x0, x0 + T):
        for z in range(z0, z0 + T):
            surf[(x, z)] = surface(x, z)
    # 1. arbres flottants : bas de tronc (bois dont le dessous n'est pas du bois) pose sur air/eau/feuilles
    vus = set()
    for x in range(x0, x0 + T):
        for z in range(z0, z0 + T):
            for y in range(50, 200):
                n = bloc(x, y, z)
                if n is None: break
                if bois(n):
                    d = bloc(x, y - 1, z)
                    if d is not None and not bois(d) and (d in AIR or d == 'water' or feuille(d)):
                        # sol sous le vide
                        yy = y - 1
                        while yy > 30 and (bloc(x, yy, z) in AIR or bloc(x, yy, z) == 'water' or feuille(bloc(x, yy, z) or '')): yy -= 1
                        flott.append((x, y, z, n, d, y - 1 - yy, bloc(x, yy, z)))
    # feuilles isolees : feuilles sans bois a 4 blocs (approx : grappe au-dessus du vide loin de tout tronc)
    # 2. neige / glace / gravier dans ou au-dessus de l'eau
    for x in range(x0, x0 + T):
        for z in range(z0, z0 + T):
            for y in range(55, 80):
                n = bloc(x, y, z)
                if n in ('snow', 'snow_block', 'powder_snow', 'ice', 'packed_ice', 'blue_ice', 'gravel', 'suspicious_gravel'):
                    vois = [bloc(x + a, y + b, z + c) for a, b, c in ((1, 0, 0), (-1, 0, 0), (0, 0, 1), (0, 0, -1), (0, -1, 0))]
                    if 'water' in vois:
                        neige[(n, y)] += 1
                        if len(neige_ex) < 12: neige_ex.append((x, y, z, bp(x, y, z)[:60], bp(x, y - 1, z)[:40]))
    # 3. trous : colonne dont la surface est >= 2 sous ses 4 voisines (puis grappes)
    cand = set()
    for (x, z), (y, n) in surf.items():
        if y is None: continue
        v = [surf.get((x + a, z + c), (None, None))[0] for a, c in ((1, 0), (-1, 0), (0, 1), (0, -1))]
        if all(w is not None and w >= y + 2 for w in v): cand.add((x, z))
    # grappes de trous voisins (taille 1x1, 2x2...)
    ok = set()
    for (x, z) in sorted(cand):
        if (x, z) in ok: continue
        g = [(x, z)]; ok.add((x, z)); i = 0
        while i < len(g):
            a, c = g[i]; i += 1
            for d in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                q = (a + d[0], c + d[1])
                if q not in ok and q in surf and surf[q][0] is not None and surf[q][0] <= surf[(x, z)][0] + 1 and q[0] - x < 6 and q[1] - z < 6 and q[0] >= x - 5 and q[1] >= z - 5:
                    ok.add(q); g.append(q)
        ys = [surf[q][0] for q in g]; bord = max(surf.get((x - 1, z), (0, 0))[0] or 0, 0)
        xs = [q[0] for q in g]; zs = [q[1] for q in g]
        fond = surf[(x, z)]
        # contenu : blocs entre le fond et le bord
        cont = [bp(x, yy, z).split(':')[-1][:30] for yy in range(fond[0], bord + 1)]
        sous = [bloc(x, fond[0] - k, z) for k in range(0, 4)]
        trous.append(dict(xz=(x, z), taille='%dx%d' % (max(xs) - min(xs) + 1, max(zs) - min(zs) + 1), n=len(g), fond=fond[0], bord=bord, prof=bord - fond[0], contenu=cont, sous=sous,
                          autour=surf.get((x - 1, z))[1]))
    res[zn] = dict(flottants=len(flott), flott_ex=flott[:15], flott_bois=collections.Counter(f[3] for f in flott).most_common(), flott_dessous=collections.Counter(f[4] for f in flott).most_common(),
                   neige=sorted(neige.items()), neige_ex=neige_ex, trous=len(trous), trous_ex=trous[:12],
                   trous_tailles=collections.Counter(t['taille'] for t in trous).most_common(), trous_autour=collections.Counter(t['autour'] for t in trous).most_common(6))
    print('== %s (%d,%d) %d : %d bas de tronc flottants, %d neige/gravier contre l eau, %d trous' % (zn, x0, z0, T, len(flott), sum(neige.values()), len(trous)), flush=True)
json.dump(res, open(os.path.join(ICI, 'defauts-c22.json'), 'w', encoding='utf-8'), indent=1, default=str)
