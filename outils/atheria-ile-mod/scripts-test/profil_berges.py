# profil des berges autour du lit (bit4 = distance au lit dessine <= 10 blocs) : par distance au bord du masque bit4,
# part d'eau, profondeur moyenne, hauteur du sol. usage : monde masque.bin
import sys, os, struct, collections
from collections import deque
monde, masque = sys.argv[1], sys.argv[2]
ICI = os.path.dirname(os.path.abspath(sys.argv[0]))
src = open(os.path.join(ICI, 'comparer_chunks.py')).read().split('mondes=args')[0]
src = src.replace("sys.argv,args=[sys.argv[0],'x'],sys.argv[1:]", "args=[]").replace("os.path.dirname(os.path.abspath(__file__))", repr(ICI))
_a = sys.argv; exec(src); sys.argv = _a
d = open(masque, 'rb').read(); x0, z0, n = struct.unpack('>iii', d[:12]); M = d[12:]
# distance (4-voisins, en blocs) au masque bit4, signee : negative dedans
INF = 10 ** 6
dist = [INF] * (n * n); q = deque()
for i in range(n * n):
    if M[i] & 16: dist[i] = 0; q.append(i)
while q:
    i = q.popleft(); x, z = i % n, i // n
    for dx, dz in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        a, b = x + dx, z + dz
        if 0 <= a < n and 0 <= b < n and dist[b * n + a] > dist[i] + 1: dist[b * n + a] = dist[i] + 1; q.append(b * n + a)
din = [INF] * (n * n); q = deque()
for i in range(n * n):
    if not M[i] & 16: din[i] = 0; q.append(i)
while q:
    i = q.popleft(); x, z = i % n, i // n
    for dx, dz in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        a, b = x + dx, z + dz
        if 0 <= a < n and 0 <= b < n and din[b * n + a] > din[i] + 1: din[b * n + a] = din[i] + 1; q.append(b * n + a)
cache = {}
def bl(x, y, z):
    k = (x >> 4, z >> 4)
    if k not in cache:
        try: r = lire(monde, *k); cache[k] = r[1] if r else None
        except Exception: cache[k] = None
    b = cache[k]; Y = y >> 4
    L = b.get(Y + 256 if Y < 0 else Y) if b else None
    return L[((y & 15) << 8) | ((z & 15) << 4) | (x & 15)].split('[')[0].split(':')[-1] if L else None
VEG = ('air', 'short_grass', 'tall_grass', 'fern', 'seagrass', 'tall_seagrass', 'kelp', 'kelp_plant', 'dead_bush')
S = collections.defaultdict(lambda: [0, 0, 0, 0])   # n, eau, somme prof, somme sol
for i in range(n * n):
    if not (M[i] & 1): continue                          # terre de la carte seulement (pas la mer)
    k = dist[i] if dist[i] > 0 else -din[i] + 1          # 1.. dehors ; 0, -1, ... dedans
    if k > 30 or k < -12: continue
    x, z = x0 + i % n, z0 + i // n
    if bl(x, 64, z) is None: continue
    ys = None; y = 140
    while y > 30:
        b = bl(x, y, z)
        if b == 'water': ys = y; break
        if b not in VEG: break
        y -= 1
    if ys is not None:
        f = ys
        while bl(x, f, z) in ('water', 'seagrass', 'tall_seagrass', 'kelp', 'kelp_plant'): f -= 1
        s = S[k]; s[0] += 1; s[1] += 1; s[2] += ys - f; s[3] += f
    else:
        s = S[k]; s[0] += 1; s[3] += y
print(os.path.basename(monde), os.path.basename(masque), ': k = distance au bord du lit dessine (<=0 dedans)')
for k in sorted(S):
    nn, e, p, h = S[k]
    print('k=%4d  n=%6d  eau=%5.1f%%  prof=%4.1f  sol=%5.1f' % (k, nn, 100.0 * e / nn, p / e if e else 0, h / nn))
