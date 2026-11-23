# Controles hors ligne de la 0.9.4f (berges douces) : monde A (0.9.4e) contre monde B (0.9.4f), zone carree.
# usage : python -I verif_berges.py <mondeA> <mondeB> <x> <z> <rayon> <nom> <masque.bin>
# Sort : colonnes dont le dessus change (abaisse / remblaye), dont en zone non pleinement naturelle (bit3),
# emersions (eau dans A, terre dans B), inondations (terre dans A, eau dans B), lit (bit4) en eau dans B, hors carte (mer).
import sys, os, struct, collections
A, B, cx, cz, R, nom, masque = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5]), sys.argv[6], sys.argv[7]
ICI = os.path.dirname(os.path.abspath(sys.argv[0]))
src = open(os.path.join(ICI, 'comparer_chunks.py')).read().split('mondes=args')[0]
src = src.replace("sys.argv,args=[sys.argv[0],'x'],sys.argv[1:]", "args=[]").replace("os.path.dirname(os.path.abspath(__file__))", repr(ICI))
_a = sys.argv; exec(src); sys.argv = _a
d = open(masque, 'rb').read(); mx0, mz0, mn = struct.unpack('>iii', d[:12]); M = d[12:]
def bits(x, z):
    i, j = x - mx0, z - mz0
    return M[j * mn + i] if 0 <= i < mn and 0 <= j < mn else None
caches = {A: {}, B: {}}
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
VEG = ('air', 'cave_air', 'short_grass', 'tall_grass', 'fern', 'large_fern', 'dead_bush', 'snow', 'seagrass', 'tall_seagrass', 'kelp', 'kelp_plant')
def vide(n): return n in VEG or 'flower' in n or 'petals' in n or n.endswith('_leaves') or n.endswith('_log') or n.endswith('sapling')
def colonne(w, x, z):
    # (y du dessus solide, eau au-dessus ?) sans vegetation ni arbres
    if bl(w, x, 64, z) is None: return None
    eau = False
    for y in range(200, 30, -1):
        n = bl(w, x, y, z)
        if n == 'water': eau = True; continue
        if vide(n): continue
        return y, eau
    return 30, eau
S = collections.Counter(); ex = collections.defaultdict(list)
for z in range(cz - R, cz + R):
    for x in range(cx - R, cx + R):
        a, b = colonne(A, x, z), colonne(B, x, z)
        if a is None or b is None: S['absent'] += 1; continue
        m = bits(x, z)
        if m is None: S['hors_masque'] += 1; continue
        if m & 16: S['lit'] += 1; S['lit_eauB'] += b[1]
        if a == b: continue
        dy = b[0] - a[0]
        S['change'] += 1
        S['abaisse' if dy < 0 else 'remblaye' if dy > 0 else 'eau_seule'] += 1
        if m & 8: S['change_bit3'] += 1; ex['bit3'].append((x, z, dy))
        if not m & 1: S['change_mer'] += 1; ex['mer'].append((x, z, dy))
        if a[1] and not b[1]: S['EMERGE'] += 1; ex['EMERGE'].append((x, z, a, b))
        if b[1] and not a[1]: S['INONDE'] += 1; ex['INONDE'].append((x, z, a, b))
        if abs(dy) > 6: S['ecart_sup_6'] += 1; ex['ecart'].append((x, z, a, b))
print('%s (%s vs %s)' % (nom, os.path.basename(A), os.path.basename(B)))
print('  colonnes changees %d (abaissees %d, remblayees %d, eau seule %d), dont bit3 (zone non pleinement naturelle) %d, en mer %d, ecart > 6 blocs %d'
      % (S['change'], S['abaisse'], S['remblaye'], S['eau_seule'], S['change_bit3'], S['change_mer'], S['ecart_sup_6']))
print('  EMERGE %d  INONDE %d' % (S['EMERGE'], S['INONDE']))
print('  lit (bit4) en eau dans B : %d / %d = %.1f %%' % (S['lit_eauB'], S['lit'], 100.0 * S['lit_eauB'] / max(1, S['lit'])))
for k in ('EMERGE', 'INONDE', 'bit3', 'mer', 'ecart'):
    if ex[k]: print('  ex', k, ex[k][:6])
