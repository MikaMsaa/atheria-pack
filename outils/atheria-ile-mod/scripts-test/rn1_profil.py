import sys, os
monde = sys.argv[1]
ICI = os.path.dirname(os.path.abspath(sys.argv[0]))
src = open(os.path.join(ICI, 'comparer_chunks.py')).read().split('mondes=args')[0]
src = src.replace("sys.argv,args=[sys.argv[0],'x'],sys.argv[1:]", "args=[]").replace("os.path.dirname(os.path.abspath(__file__))", repr(ICI))
_a = sys.argv; exec(src); sys.argv = _a
cache = {}
def bl(x, y, z):
    k = (x >> 4, z >> 4)
    if k not in cache:
        try: r = lire(monde, *k); cache[k] = r[1] if r else None
        except Exception: cache[k] = None
    b = cache[k]
    if b is None: return None
    Y = y >> 4; L = b.get(Y + 256 if Y < 0 else Y)
    if L is None: return 'air'
    return L[((y & 15) << 8) | ((z & 15) << 4) | (x & 15)].split('[')[0].split(':')[-1]
VEG = ('air','short_grass','tall_grass','fern','snow','dead_bush')
def top(x, z):
    if bl(x, 64, z) is None: return None
    for y in range(140, 30, -1):
        n = bl(x, y, z)
        if n not in VEG and 'flower' not in n and not n.endswith('_leaves'): return y, n
def xl(z): return 2536 + (z + 2408) * (2520 - 2536) / (-1944 + 2408)
zs = sorted(set(list(range(-2408, -1943, 32)) + [-2016, -2048, -1984, -1944]))
for z in zs:
    x = round(xl(z)); t = top(x, z)
    if t is None: print(z, x, 'non genere'); continue
    # largeur : colonnes de meme bloc de chaussee de part et d'autre (perpendiculaire ~ axe x)
    g = d = 0
    while g < 20 and top(x - g - 1, z) and top(x - g - 1, z)[1] == t[1]: g += 1
    while d < 20 and top(x + d + 1, z) and top(x + d + 1, z)[1] == t[1]: d += 1
    print('z=%5d x=%4d Y=%3d bloc=%s largeur meme bloc=%d' % (z, x, t[0], t[1], g + d + 1))
