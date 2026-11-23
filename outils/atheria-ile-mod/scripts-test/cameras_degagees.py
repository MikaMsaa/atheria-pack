# Cherche une camera fixe degagee (lecture seule du monde) pour un point de capture.
# usage : python -I cameras_degagees.py <monde> <id> <sx> <sz> [dmin dmax hmin hmax]
# Camera tp en (cx, y, cz), oeil a y+1.62, regard vers (sx, y, sz) (convention y/cx/cz du client de la file).
# Critere : aucun bloc non-air (herbe, feuilles, troncs compris) sur les rayons de l'oeil vers la cible,
# vers le sol du sujet et vers 4 points du sol a +-8 blocs du sujet ; et rien dans une boule de 3 blocs autour de l'oeil.
import sys, os, math, json
ICI = os.path.dirname(os.path.abspath(sys.argv[0]))
W, PID, SX, SZ = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
DMIN, DMAX, HMIN, HMAX = (int(v) for v in (sys.argv[5:9] if len(sys.argv) > 8 else (16, 30, 6, 12)))
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
    Y = y >> 4; Ys = Y + 256 if Y < 0 else Y; L = b.get(Ys)
    if L is None: return 'air'
    return L[((y & 15) << 8) | ((z & 15) << 4) | (x & 15)].split('[')[0].split(':')[-1]
AIR = {'air', 'cave_air', 'void_air'}
def sol(x, z):  # premier bloc solide ou eau, feuillage et plantes ignores (comme le client)
    for y in range(200, 30, -1):
        n = bloc(x, y, z)
        if n is None: return None
        if n in AIR: continue
        if n == 'water': return y
        if n.endswith('_block'): return y
        if n.endswith('_leaves') or any(t in n for t in ('grass', 'fern', 'flower', 'bush', 'sapling', 'vine', 'petals', 'snow', 'kelp', 'seagrass', 'carpet', 'mushroom', 'propagule', 'leaf_litter', 'pebble', 'twig')): continue
        return y
    return None
def libre(a, b):
    d = math.dist(a, b); n = int(d * 4) + 1
    for i in range(1, n):
        t = i / n
        if t * d > d - 1.2: break  # le bloc vise lui-meme
        p = [a[k] + (b[k] - a[k]) * t for k in range(3)]
        bl = bloc(math.floor(p[0]), math.floor(p[1]), math.floor(p[2]))
        if bl is None or (bl not in AIR and bl != 'water'): return False
    return True
ys = sol(SX, SZ)
res = []
for ang in range(0, 360, 10):
    ux, uz = math.cos(math.radians(ang)), math.sin(math.radians(ang))
    for d in range(DMIN, DMAX + 1, 2):
        cx, cz = round(SX + ux * d), round(SZ + uz * d)
        g = sol(cx, cz)
        if g is None: continue
        for h in range(HMIN, HMAX + 1, 2):
            y = g + h; oeil = (cx + .5, y + 1.62, cz + .5)
            if any(bloc(cx + i, y + j, cz + k) not in AIR for i in (-2, 0, 2) for j in (-1, 0, 2, 3) for k in (-2, 0, 2)): continue
            px, pz = -uz, ux
            cibles = [(SX + .5, y, SZ + .5), (SX + .5, ys + 1.0, SZ + .5)]
            for e in (-14, -8, 8, 14):
                gx, gz = round(SX + px * e), round(SZ + pz * e); gg = sol(gx, gz)
                if gg is not None: cibles.append((gx + .5, gg + 1.0, gz + .5))
            for e in (-6, 6):  # milieu du champ, a mi-distance
                gx, gz = round(SX + ux * d / 2 + px * e), round(SZ + uz * d / 2 + pz * e); gg = sol(gx, gz)
                if gg is not None: cibles.append((gx + .5, gg + 1.0, gz + .5))
            if all(libre(oeil, c) for c in cibles):
                res.append((h, d, ang, cx, cz, y, g))
                break
res.sort(key=lambda r: (abs(r[0] - 8), abs(r[1] - 22)))
print(PID, 'sol sujet', ys, 'candidats', len(res))
for r in res[:12]: print('h=%d d=%d ang=%d cam=%d,%d y=%d sol=%d' % r)
