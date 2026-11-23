# bancs de sable poses : colonnes ou du sable de B remplace l'eau de A (emerges = sable au niveau de la surface d'eau de A, haut-fonds = encore sous l'eau)
# et colonnes du chenal (bit4) toujours en eau ; usage : mondeA mondeB x z rayon masque
import sys, os, struct, collections
A, B, cx, cz, R, masque = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5]), sys.argv[6]
ICI = os.path.dirname(os.path.abspath(sys.argv[0]))
src = open(os.path.join(ICI, 'comparer_chunks.py')).read().split('mondes=args')[0]
src = src.replace("sys.argv,args=[sys.argv[0],'x'],sys.argv[1:]", "args=[]").replace("os.path.dirname(os.path.abspath(__file__))", repr(ICI))
_a = sys.argv; exec(src); sys.argv = _a
d = open(masque, 'rb').read(); x0, z0, n = struct.unpack('>iii', d[:12]); M = d[12:]
cache = {}
def ch(w, x, z):
    k = (w, x >> 4, z >> 4)
    if k not in cache:
        try: r = lire(w, x >> 4, z >> 4)
        except Exception: r = None
        cache[k] = r[1] if r else None
    return cache[k]
def bl(w, x, y, z):
    b = ch(w, x, z); Y = y >> 4
    L = b.get(Y + 256 if Y < 0 else Y) if b else None
    return L[((y & 15) << 8) | ((z & 15) << 4) | (x & 15)].split('[')[0].split(':')[-1] if L else 'air'
em = sub = canal = 0; prof = collections.Counter(); exemples = []
for z in range(cz - R, cz + R):
    for x in range(cx - R, cx + R):
        if ch(A, x, z) is None or ch(B, x, z) is None: continue
        m = M[(z - z0) * n + (x - x0)] if 0 <= x - x0 < n and 0 <= z - z0 < n else 0
        ys = None
        for y in range(120, 40, -1):
            if bl(A, x, y, z) == 'water': ys = y; break
            if bl(A, x, y, z) not in ('air', 'short_grass', 'tall_grass'): break
        if ys is None: continue
        chg = [y for y in range(ys - 4, ys + 1) if bl(A, x, y, z) in ('water', 'seagrass', 'tall_seagrass') and bl(B, x, y, z) == 'sand']
        if not chg: continue
        if m & 16: canal += 1
        if max(chg) == ys: em += 1
        else: sub += 1
        prof[len(chg)] += 1
        if len(exemples) < 4: exemples.append((x, ys, z, len(chg)))
print('bancs : colonnes emergees', em, 'haut-fonds', sub, 'dans le chenal (bit4)', canal, 'epaisseur', sorted(prof.items()), 'exemples', exemples)
