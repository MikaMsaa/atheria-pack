# Lave de surface (C1b) et lacs dans les lots, hors ligne, lecture seule. usage : python -I lave_surface.py <monde> [regions.json]
# Pour chaque chunk genere : blocs de lave dans les 12 blocs sous la surface (premier bloc non air depuis le haut), groupes en lacs (8-connexite en x, z).
# Classe de la carte au centre du lac (carte.png, couleur) : Ile du volcan #463834 autorisee. Lacs et mares d'eau de surface dans les lots + marges + 16.
import sys, os, collections, json
from PIL import Image
W = sys.argv[1]
ICI = os.path.dirname(os.path.abspath(sys.argv[0]))
REG = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ICI, '..', 'branche-relief', 'regions-v3j.json')
src = open(os.path.join(ICI, 'comparer_chunks.py')).read().split('mondes=args')[0]
src = src.replace("sys.argv,args=[sys.argv[0],'x'],sys.argv[1:]", "args=[]").replace("os.path.dirname(os.path.abspath(__file__))", repr(ICI))
_a = sys.argv; sys.argv = [sys.argv[0], 'a', 'b']; exec(src); sys.argv = _a
reg = json.load(open(REG, encoding='utf-8'))
carte = Image.open(os.path.join(ICI, '..', '..', 'serveur-ile-test', 'config', 'atheria_ile', 'carte.png')).convert('RGB')
bpp = reg['blocs_par_pixel']; ox, oz = -carte.width * bpp / 2.0, -carte.height * bpp / 2.0
def classe(x, z):
    px, pz = int((x + 0.5 - ox) / bpp), int((z + 0.5 - oz) / bpp)
    if 0 <= px < carte.width and 0 <= pz < carte.height: return '#%02x%02x%02x' % carte.getpixel((px, pz))
    return '?'
NOMS = {k: v.get('nom', k) for k, v in reg['classes'].items()}
def dans_lot(x, z, extra=16):
    for l in reg['lots']:
        m = l.get('marge_blocs', 0) + extra
        if l['x1'] - m <= x < l['x2'] + m and l['z1'] - m <= z < l['z2'] + m: return l['nom']
    return None
lave = set(); eau_lot = set(); nch = 0
for f in sorted(os.listdir(os.path.join(W, 'region'))):
    _, rx, rz, _ = f.split('.'); rx, rz = int(rx), int(rz)
    for cx in range(rx * 32, rx * 32 + 32):
        for cz in range(rz * 32, rz * 32 + 32):
            try: r = lire(W, cx, cz)
            except Exception: r = None
            if not r or not r[1] or 'full' not in str(r[0]): continue
            nch += 1; b = r[1]; ys = sorted(((Y if Y < 128 else Y - 256) for Y in b), reverse=True)
            for dx in range(16):
                for dz in range(16):
                    top = None
                    for Y in ys:
                        L = b[Y + 256 if Y < 0 else Y]
                        for yy in range(15, -1, -1):
                            nm = L[(yy << 8) | (dz << 4) | dx]
                            if nm.split('[')[0].split(':')[-1] not in ('air', 'cave_air', 'void_air'): top = Y * 16 + yy; break
                        if top is not None: break
                    if top is None: continue
                    x, z = cx * 16 + dx, cz * 16 + dz
                    for y in range(top, top - 13, -1):
                        Ls = b.get(y >> 4 if y >= 0 else (y >> 4) + 256)
                        if Ls is None: continue
                        nm = Ls[((y & 15) << 8) | (dz << 4) | dx]
                        if 'lava' in nm: lave.add((x, z)); break
                    if dans_lot(x, z):
                        Ls = b.get(top >> 4); nm = Ls[((top & 15) << 8) | (dz << 4) | dx] if Ls else ''
                        if 'water' in nm and top >= 62: eau_lot.add((x, z))
def groupes(S):
    S = set(S); out = []
    while S:
        p = S.pop(); pile = [p]; g = [p]
        while pile:
            x, z = pile.pop()
            for a in (-1, 0, 1):
                for c in (-1, 0, 1):
                    q = (x + a, z + c)
                    if q in S: S.remove(q); pile.append(q); g.append(q)
        out.append(g)
    return out
print('monde %s : %d chunks generes (full)' % (os.path.basename(W), nch))
G = groupes(lave); hors = [g for g in G if classe(*g[0]) != '#463834']
print('lave de surface (12 blocs sous la surface) : %d colonnes en %d lacs ; hors Ile du volcan : %d lacs, %d colonnes' % (len(lave), len(G), len(hors), sum(len(g) for g in hors)))
for g in sorted(G, key=len, reverse=True)[:20]:
    xs = [p[0] for p in g]; zs = [p[1] for p in g]; c = classe(xs[0], zs[0])
    print('  lac %d colonnes, x %d..%d z %d..%d, classe %s %s%s' % (len(g), min(xs), max(xs), min(zs), max(zs), c, NOMS.get(c, '?'), (', lot ' + dans_lot(xs[0], zs[0])) if dans_lot(xs[0], zs[0]) else ''))
# eau de surface dans les lots : on ne garde que les petites flaques isolees (mares), pas la mer
GE = [g for g in groupes(eau_lot) if len(g) < 400]
print('mares d eau (< 400 colonnes, surface >= 62) dans les lots + marges + 16 : %d' % len(GE))
for g in sorted(GE, key=len, reverse=True)[:10]:
    xs = [p[0] for p in g]; zs = [p[1] for p in g]
    print('  mare %d colonnes, x %d..%d z %d..%d, lot %s' % (len(g), min(xs), max(xs), min(zs), max(zs), dans_lot(xs[0], zs[0])))
