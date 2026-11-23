# QC hors ligne c20 : 0.9.6. usage : python -I qc_c20.py <monde_c20j> <monde_c20z>
# 1. lave de surface (12 blocs sous la surface) par zone, hors volcan / volcan ; 2. lacs et mares naturels dans lot68 + marge + fondu ;
# 3. non-regression c20z (0.9.6, parametres a 0) contre c18j (lot68, lave) et c19ref (lagon) : sol et bloc du dessus colonne par colonne.
import sys, os, json, collections
from PIL import Image
J, Zm = sys.argv[1], sys.argv[2]
ICI = os.path.dirname(os.path.abspath(sys.argv[0]))
ESS = os.path.dirname(J)
src = open(os.path.join(ICI, 'comparer_chunks.py')).read().split('mondes=args')[0]
src = src.replace("sys.argv,args=[sys.argv[0],'x'],sys.argv[1:]", "args=[]").replace("os.path.dirname(os.path.abspath(__file__))", repr(ICI))
_a = sys.argv; sys.argv = [sys.argv[0], 'a', 'b']; exec(src); sys.argv = _a
reg = json.load(open(os.path.join(ICI, '..', 'branche-relief', 'regions-v3l.json'), encoding='utf-8'))
pl = json.load(open(os.path.join(ICI, '..', 'branche-relief', 'plateaux-v3l.json'), encoding='utf-8'))['plateaux']   # lot68 a Y 67 (15/11)
carte = Image.open(os.path.join(ICI, '..', '..', 'serveur-ile-test', 'config', 'atheria_ile', 'carte.png')).convert('RGB')
bpp = reg['blocs_par_pixel']; ox, oz = -carte.width * bpp / 2.0, -carte.height * bpp / 2.0
def volcan(x, z):
    px, pz = int((x + 0.5 - ox) / bpp), int((z + 0.5 - oz) / bpp)
    return 0 <= px < carte.width and 0 <= pz < carte.height and carte.getpixel((px, pz)) == (0x46, 0x38, 0x34)
def sans_lac(x, z):
    for l in reg['lots']:
        m = l.get('marge_blocs', 0) + 16
        if l['x1'] - m <= x < l['x2'] + m and l['z1'] - m <= z < l['z2'] + m: return True
    for p in pl:
        f = (p.get('fondu_max', 96) if p.get('fondu_adaptatif') else p.get('fondu', 32)) + 16
        if p['x1'] - f <= x < p['x2'] + f and p['z1'] - f <= z < p['z2'] + f: return True
    return False
ZONES = {'lot68': (2941, -952, 112), 'lave': (2562, -2116, 48), 'volcan': (-3018, 4410, 96), 'lagon': (-2514, -5850, 96)}
CACHE = {}
def chunk(w, cx, cz):
    k = (w, cx, cz)
    if k not in CACHE:
        try: CACHE[k] = lire(w, cx, cz)
        except Exception: CACHE[k] = None
    return CACHE[k]
def nom(s): return s.split('[')[0].split(':')[-1]
def colonne(w, x, z):
    """(y du premier bloc non air, son nom, y du premier sol solide sous les fluides et la vegetation, lave dans les 12 blocs)"""
    r = chunk(w, x >> 4, z >> 4)
    if not r or not r[1]: return None
    b = r[1]; top = None
    for y in range(200, -60, -1):
        L = b.get(y >> 4 if y >= 0 else (y >> 4) + 256)
        if L is None: continue
        n = nom(L[((y & 15) << 8) | ((z & 15) << 4) | (x & 15)])
        if n in ('air', 'cave_air', 'void_air'): continue
        if top is None: top = (y, n)
        lave = False
        for yy in range(y, y - 13, -1):
            L2 = b.get(yy >> 4 if yy >= 0 else (yy >> 4) + 256)
            if L2 and 'lava' in L2[((yy & 15) << 8) | ((z & 15) << 4) | (x & 15)]: lave = True; break
        return top[0], top[1], lave
    return None
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
PORTAIL = ('stone_bricks', 'cracked_stone_bricks', 'mossy_stone_bricks', 'netherrack', 'magma_block', 'obsidian', 'crying_obsidian', 'gold_block', 'stone_brick_stairs', 'stone_brick_slab', 'stone_brick_wall')
def portail(w, g):
    """lave d'un portail en ruine (structure du jeu, pas un lac) : la moitie au moins des colonnes ont en surface un bloc de portail"""
    n = sum(1 for (x, z) in g if (colonne(w, x, z) or (0, ''))[1] in PORTAIL)
    return n * 2 >= len(g)
print('1. Lave de surface (12 blocs sous la surface ; lave des portails en ruine ignoree)')
lv = {}
for w, nm in ((J, 'c20j (v3l)'), (Zm, 'c20z (v3j)')):
    for zn, (cx, cz, R) in ZONES.items():
        L = set(); ng = 0
        for x in range(cx - R, cx + R):
            for z in range(cz - R, cz + R):
                c = colonne(w, x, z)
                if c is None: ng += 1; continue
                if c[2]: L.add((x, z))
        G = [g for g in groupes(L) if not portail(w, g)]; hv = [g for g in G if not volcan(*g[0])]; vo = [g for g in G if volcan(*g[0])]
        lv[(nm, zn)] = (len(hv), sum(len(g) for g in hv), len(vo), sum(len(g) for g in vo))
        print('  %-11s %-7s lacs hors volcan %d (%d colonnes), lacs sur le volcan %d (%d colonnes), colonnes non generees %d' % (nm, zn, len(hv), sum(len(g) for g in hv), len(vo), sum(len(g) for g in vo), ng))
hj = sum(v[0] for k, v in lv.items() if k[0].startswith('c20j')); vj = sum(v[3] for k, v in lv.items() if k[0].startswith('c20j')); vz = sum(v[3] for k, v in lv.items() if k[0].startswith('c20z'))
print('  VERDICT lave : hors volcan c20j = %d lac(s) (attendu 0) ; volcan c20j %d colonnes contre c20z %d (attendu egal) -> %s' % (hj, vj, vz, 'OK' if hj == 0 and vj == vz else ('KO' if hj else 'A VOIR (volcan)')))
print('2. Lacs et mares naturels dans lot68 + marge + fondu (+16)')
cx, cz, R = ZONES['lot68']
for w, nm in ((J, 'c20j (v3l)'), (Zm, 'c20z (v3j)')):
    F = set()
    for x in range(cx - R, cx + R):
        for z in range(cz - R, cz + R):
            if not sans_lac(x, z): continue
            c = colonne(w, x, z)
            if c and c[1] in ('water', 'lava') and c[0] >= 60: F.add((x, z))
    G = [g for g in groupes(F) if len(g) < 400]
    print('  %-11s %d mares ou lacs (< 400 colonnes), %d colonnes ; ex %s' % (nm, len(G), sum(len(g) for g in G), [(min(p[0] for p in g), min(p[1] for p in g), len(g)) for g in G[:5]]))
print('2b. Plateau lot68 (c20j, plateaux-v3l) : dessus du sol attendu a Y 67')
VEGP = ('short_grass', 'tall_grass', 'fern', 'large_fern', 'snow', 'dead_bush', 'vine', 'water')
def sol(w, x, z):
    r = chunk(w, x >> 4, z >> 4)
    if not r or not r[1]: return None
    b = r[1]
    for y in range(200, 0, -1):
        L = b.get(y >> 4)
        if L is None: continue
        n = nom(L[((y & 15) << 8) | ((z & 15) << 4) | (x & 15)])
        if n in ('air', 'cave_air') or n in VEGP or 'flower' in n or n.endswith('_leaves') or n.endswith('_log') or 'sapling' in n: continue
        return y
    return None
P68 = [p for p in pl if p['nom'].startswith('lot68')][0]
h = collections.Counter(); manq = 0
for x in range(P68['x1'], P68['x2']):
    for z in range(P68['z1'], P68['z2']):
        y = sol(J, x, z)
        if y is None: manq += 1
        else: h[y] += 1
n = sum(h.values()); part = 100.0 * h[P68['y']] / max(1, n)
print('  lot68 : %d colonnes, Y le plus frequent %s, part a Y %d : %.1f %%, min %s max %s, non generees %d -> %s' % (n, h.most_common(1)[0][0] if n else '-', P68['y'], part, min(h) if h else '-', max(h) if h else '-', manq, 'OK' if n and h.most_common(1)[0][0] == P68['y'] else 'KO'))
def complet(w, cx, cz):
    r = chunk(w, cx, cz); return bool(r) and r[0] == 'minecraft:full'
def interieur(w, cx, cz): return all(complet(w, cx + i, cz + k) for i in (-1, 0, 1) for k in (-1, 0, 1))
print('3. Non-regression c20z (0.9.6, parametres a 0) : sol et bloc du dessus, colonne par colonne (bruit habituel ~400 colonnes par 256 x 256)')
for zn, ref in (('lot68', 'pilote-bis-c18j'), ('lave', 'pilote-bis-c18j'), ('lagon', 'pilote-bis-c19ref')):
    cx, cz, R = ZONES[zn]; Rw = os.path.join(ESS, ref); d = h = n = ng = 0; ex = []
    for x in range(cx - R, cx + R):
        for z in range(cz - R, cz + R):
            if not (interieur(Rw, x >> 4, z >> 4) and interieur(Zm, x >> 4, z >> 4)): ng += 1; continue   # chunk et ses 8 voisins complets dans les deux mondes
            a, b = colonne(Rw, x, z), colonne(Zm, x, z)
            if a is None or b is None: ng += 1; continue
            n += 1
            if a[0] != b[0]: h += 1
            if a[:2] != b[:2]: d += 1; len(ex) < 4 and ex.append((x, z, a[:2], b[:2]))
    att = round(400 * n / 65536)
    print('  %-6s contre %s : %d colonnes comparees, %d differentes (dont hauteur %d), attendu <= ~%d ; hors interieur complet ou non generees %d ; ex %s' % (zn, ref, n, d, h, att, ng, ex))
