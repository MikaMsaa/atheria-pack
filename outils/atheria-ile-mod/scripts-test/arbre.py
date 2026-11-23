import sys, os, collections
monde = sys.argv[1]; X1,X2,Y1,Y2,Z1,Z2 = map(int, sys.argv[2:8]); M = int(sys.argv[8]) if len(sys.argv) > 8 else 4
ICI = os.path.dirname(os.path.abspath(sys.argv[0]))
src = open(os.path.join(ICI, 'comparer_chunks.py')).read().split('mondes=args')[0]
src = src.replace("sys.argv,args=[sys.argv[0],'x'],sys.argv[1:]", "args=[]").replace("os.path.dirname(os.path.abspath(__file__))", repr(ICI))
exec(src)
cache = {}; NOMS = set()
def bloc(x, y, z):
    k = (x >> 4, z >> 4)
    if k not in cache: cache[k] = lire(monde, *k)[1]
    s = cache[k].get(y >> 4)
    if not s: return 'air'
    n = s[((y & 15) << 8) | ((z & 15) << 4) | (x & 15)].split("[")[0]; NOMS.add(n)
    return n.split(':', 1)[1] if ':' in n else n
def arb(n): return n.endswith('_log') or n.endswith('_wood') or 'leaves' in n
# composantes connexes (26-voisins) des logs/feuilles dans la boite elargie de M
pts = {}
for x in range(X1 - M, X2 + M + 1):
    for y in range(Y1 - M, Y2 + M + 1):
        for z in range(Z1 - M, Z2 + M + 1):
            n = bloc(x, y, z)
            if arb(n): pts[(x, y, z)] = n
vu = set(); comps = []
for p in pts:
    if p in vu: continue
    pile = [p]; vu.add(p); c = []
    while pile:
        q = pile.pop(); c.append(q)
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                for dz in (-1, 0, 1):
                    r = (q[0] + dx, q[1] + dy, q[2] + dz)
                    if r in pts and r not in vu: vu.add(r); pile.append(r)
    comps.append(c)
dans = lambda q: X1 <= q[0] <= X2 and Y1 <= q[1] <= Y2 and Z1 <= q[2] <= Z2
for c in comps:
    troncs = sorted(set((q[0], q[2]) for q in c if pts[q].endswith('_log')))
    nin = sum(dans(q) for q in c)
    if nin == 0: continue
    print('composante %d blocs (%d dans la boite, %d hors) troncs %s types %s' % (len(c), nin, len(c) - nin, troncs[:8], dict(collections.Counter(pts[q] for q in c))))
    print('   bornes x %d..%d y %d..%d z %d..%d' % (min(q[0] for q in c), max(q[0] for q in c), min(q[1] for q in c), max(q[1] for q in c), min(q[2] for q in c), max(q[2] for q in c)))
# sol dans la boite : blocs non air non arbre (ne doivent pas etre touches)
print('blocs non arbre dans la boite :', dict(collections.Counter(bloc(x, y, z) for x in range(X1, X2 + 1) for y in range(Y1, Y2 + 1) for z in range(Z1, Z2 + 1) if not arb(bloc(x, y, z)))))
print("noms complets :", sorted(n for n in NOMS if "pine" in n))
