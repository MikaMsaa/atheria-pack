# Controles hors ligne de la 0.9.4 (nature) : monde A (parametres a 0) contre monde B (v3g), sur une zone carree.
# usage : python -I verif_nature.py <mondeA> <mondeB> <x> <z> <rayon> <nom> [masque.bin]
# Sort : sols changes (hors zone protegee / sous la mer), debris (zone protegee, eau, air, croix), lit des rivieres en eau.
import sys, os, struct
A, B, cx, cz, R, nom = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5]), sys.argv[6]
masque = sys.argv[7] if len(sys.argv) > 7 else None
ICI = os.path.dirname(os.path.abspath(sys.argv[0]))
src = open(os.path.join(ICI, 'comparer_chunks.py')).read().split('mondes=args')[0]
src = src.replace("sys.argv,args=[sys.argv[0],'x'],sys.argv[1:]", "args=[]").replace("os.path.dirname(os.path.abspath(__file__))", repr(ICI))
_argv = sys.argv; exec(src); sys.argv = _argv

M = None
if masque:
    d = open(masque, 'rb').read(); mx0, mz0, mn = struct.unpack('>iii', d[:12]); M = d[12:]
def bits(x, z):
    if M is None: return None
    i, j = x - mx0, z - mz0
    if 0 <= i < mn and 0 <= j < mn: return M[j * mn + i]
    return None

caches = {A: {}, B: {}}
def chunk(w, x, z):
    k = (x >> 4, z >> 4); c = caches[w]
    if k not in c:
        try: r = lire(w, *k)
        except Exception: r = None
        c[k] = r[1] if r else None
    return c[k]
def bloc(w, x, y, z):
    b = chunk(w, x, z)
    if b is None: return None
    Y = y >> 4; Ys = Y + 256 if Y < 0 else Y
    L = b.get(Ys)
    if L is None: return 'minecraft:air[]'
    return L[((y & 15) << 8) | ((z & 15) << 4) | (x & 15)]
def nomb(s): return s.split('[')[0].split(':')[-1] if s else None
def props(s): return s.split('[', 1)[1] if s and '[' in s else ''

SOLS = {'coarse_dirt', 'rooted_dirt', 'gravel', 'moss_block', 'podzol', 'dead_bush'}
DEB = {'spruce_fence', 'dark_oak_fence', 'spruce_slab', 'stripped_spruce_log', 'chain', 'weathered_cut_copper', 'oxidized_cut_copper',
       'weathered_cut_copper_slab', 'exposed_cut_copper_slab', 'weathered_cut_copper_stairs', 'coal_block', 'moss_carpet'}
LEGER = ('air', 'cave_air', 'short_grass', 'tall_grass', 'fern', 'large_fern', 'dead_bush', 'snow', 'water', 'seagrass', 'tall_seagrass')
def vide(n): return n is None or n in LEGER or 'flower' in n or 'petals' in n
Y0, Y1 = 40, 200
sols = {'total': 0, 'protege': 0, 'sous_mer': 0, 'inconnu': 0}
deb = []          # (x, y, z, nom, etat B, bit3)
nchunks_absents = 0
lit = {'cols': 0, 'eauA': 0, 'eauB': 0, 'sableB': 0}
for z in range(cz - R, cz + R):
    for x in range(cx - R, cx + R):
        if chunk(A, x, z) is None or chunk(B, x, z) is None: nchunks_absents += 1; continue
        m = bits(x, z)
        prot = None if m is None else bool(m & 8)
        topA = topB = None
        for y in range(Y1, Y0 - 1, -1):
            a, b = bloc(A, x, y, z), bloc(B, x, y, z)
            na, nb = nomb(a), nomb(b)
            if topA is None and not vide(na) or topA is None and na == 'water': topA = (y, na)
            if topB is None and not vide(nb) or topB is None and nb == 'water': topB = (y, nb)
            if a == b: continue
            if nb in SOLS and na != nb:
                sols['total'] += 1
                if prot is None: sols['inconnu'] += 1
                elif prot: sols['protege'] += 1
                if y <= 63: sols['sous_mer'] += 1
            elif nb in DEB and na != nb:
                deb.append((x, y, z, nb, b, prot, na))
        if m is not None and m & 16 and topA and topA[1] == 'water':
            lit['cols'] += 1; lit['eauA'] += 1
            if topB and topB[1] == 'water': lit['eauB'] += 1
            elif topB and topB[1] == 'sand': lit['sableB'] += 1

D = {(x, y, z): (n, s) for x, y, z, n, s, p, na in deb}
def nB(x, y, z): return nomb(bloc(B, x, y, z))
eau = [d for d in deb if d[6] == 'water' or 'waterlogged\', \'true' in d[4] or nB(d[0], d[1] + 1, d[2]) == 'water']
air = []
for x, y, z, n, s, p, na in deb:
    dessous = nB(x, y - 1, z); sd = bloc(B, x, y - 1, z)
    if n == 'chain':
        if nB(x, y + 1, z) != 'stripped_spruce_log': air.append((x, y, z, n, 'chaine sans bras'))
        continue
    if n == 'stripped_spruce_log' and "'axis', 'y'" not in s:
        # bras : accroche a un poteau vertical voisin ; sinon poteau tombe : doit reposer au sol
        acc = any(nB(x + dx, y, z + dz) == 'stripped_spruce_log' and "'axis', 'y'" in (bloc(B, x + dx, y, z + dz) or '') for dx, dz in ((1, 0), (-1, 0), (0, 1), (0, -1)))
        if not acc and vide(dessous): air.append((x, y, z, n, 'rondin tombe en l air'))
        continue
    if n == 'moss_carpet' and (vide(dessous) or ('_slab' in (dessous or '') and "'type', 'bottom'" in (sd or ''))):
        air.append((x, y, z, n, 'tapis au-dessus du vide ou d une dalle basse')); continue
    if vide(dessous): air.append((x, y, z, n, 'au-dessus du vide (' + str(dessous) + ')'))

# croix : un poteau vertical avec des bras sur 2 cotes ou plus
poteaux = {}
for x, y, z, n, s, p, na in deb:
    if n == 'stripped_spruce_log' and "'axis', 'y'" in s: poteaux.setdefault((x, z), []).append(y)
croix = []
for (x, z), ys in poteaux.items():
    cotes = set()
    for y in range(min(ys) + 1, max(ys) + 1):
        for dx, dz in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            q = bloc(B, x + dx, y, z + dz)
            if nomb(q) == 'stripped_spruce_log' and "'axis', 'y'" not in q: cotes.add((dx, dz))
    if len(cotes) >= 2: croix.append((x, z, sorted(cotes)))

print('ZONE', nom, 'centre', cx, cz, 'rayon', R, 'colonnes sans chunk', nchunks_absents)
print('SOLS', sols)
groupes = {}
for x, y, z, n, s, p, na in deb: groupes.setdefault((x >> 4, z >> 4), []).append((x, y, z, n, p))
print('DEBRIS blocs', len(deb), 'chunks', len(groupes), 'par type', {k: sum(1 for d in deb if d[3] == k) for k in sorted({d[3] for d in deb})})
print('DEBRIS en zone protegee (bit3)', sum(1 for d in deb if d[5]), 'masque inconnu', sum(1 for d in deb if d[5] is None))
for k, v in sorted(groupes.items()):
    print('  chunk', k, 'blocs', len(v), 'premier', v[0][:4], 'protege', any(q[4] for q in v))
print('DEBRIS dans l eau', len(eau), eau[:5])
print('DEBRIS en l air', len(air), air[:12])
print('POTEAUX', len(poteaux), 'EN CROIX', len(croix), croix[:5])
if lit['cols']:
    print('LIT (bit4, eau en A)', lit, 'en eau en B %.2f %%' % (100.0 * lit['eauB'] / lit['cols']))
