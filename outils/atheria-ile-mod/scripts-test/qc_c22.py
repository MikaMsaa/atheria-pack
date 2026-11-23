# QC hors ligne c22 : 0.9.6d + regions-v3n2 (ileA ilot, ilots_chauds 16). usage : python -I qc_c22.py <monde_c22m> [regions.json]
# 15/11 : score cubique mesure B+C (pieds d arbre et colonnes d eau neutres, plats stricts) : la mesure A comptait les trous sous les racines de paletuvier et les angles de rive
# 1. lieux sculptes : score cubique en jeu (meme mesure que le classement, +-64) contre le score prevu hors jeu, et fidelite au relief sculpte ;
# 2. ilots (Phare, ilot A) : sol de surface, ni glace ni neige ; 3. Majicavo (lot70) : marche au bord du lot, vegetation par bande ;
# 4. lot68 : plateau a Y 67 ; 5. lave de surface hors volcan et mares dans les lots, marges et fondus ; 6. troncs dans les lots (attendu : aucun nouveau).
import sys, os, json, math, collections
from PIL import Image
W = sys.argv[1]
ICI = os.path.dirname(os.path.abspath(sys.argv[0])); SC = os.path.join(ICI, '..', 'sculpture'); BR = os.path.join(ICI, '..', 'branche-relief')
G = {'__file__': os.path.join(SC, 'classement_cubique.py')}
src = open(os.path.join(SC, 'classement_cubique.py'), encoding='utf-8').read().split('def vignette')[0]
_a = sys.argv; sys.argv = [sys.argv[0]]; exec(src, G); sys.argv = _a
lire, carte, mesure = G['lire'], G['carte'], G['mesure']; G['R'] = 64
reg = json.load(open(sys.argv[2] if len(sys.argv) > 2 else os.path.join(BR, 'regions-v3n2.json'), encoding='utf-8'))
pl = json.load(open(os.path.join(BR, 'plateaux-v3l.json'), encoding='utf-8'))['plateaux']
im = Image.open(os.path.join(ICI, '..', '..', 'serveur-ile-test', 'config', 'atheria_ile', 'carte.png')).convert('RGB')
bpp = reg['blocs_par_pixel']; ox, oz = -im.width * bpp / 2.0, -im.height * bpp / 2.0
def volcan(x, z):
    px, pz = int((x + 0.5 - ox) / bpp), int((z + 0.5 - oz) / bpp)
    return 0 <= px < im.width and 0 <= pz < im.height and im.getpixel((px, pz)) == (0x46, 0x38, 0x34)
CACHE = {}
def ch(x, z):
    k = (x >> 4, z >> 4)
    if k not in CACHE:
        try: r = lire(W, *k); CACHE[k] = r[1] if r else None
        except Exception: CACHE[k] = None
    return CACHE[k]
def bl(x, y, z):
    b = ch(x, z)
    if b is None: return None
    Y = y >> 4; L = b.get(Y + 256 if Y < 0 else Y)
    return 'air' if L is None else L[((y & 15) << 8) | ((z & 15) << 4) | (x & 15)].split('[')[0].split(':')[-1]
def surface(x, z):
    """(y du sol, nom du sol, noms de la vegetation au-dessus)"""
    if ch(x, z) is None: return None
    veg = set()
    for y in range(160, 30, -1):
        n = bl(x, y, z)
        if n in ('air', 'cave_air', 'water'): continue
        if not G['sol'](n): veg.add(n); continue
        return y, n, veg
    return None
def dlot(l, x, z): return math.hypot(max(l['x1'] - x, 0, x - l['x2'] + 1), max(l['z1'] - z, 0, z - l['z2'] + 1))
def mesure_bc(H, E, cx0, cz0, ex=None):
    # B+C : colonnes a pied d arbre (tronc, racines, propagule dans les 8 blocs au-dessus du sol) et colonnes d eau neutres ; plats stricts
    arbre = set()
    for (x, z), y in H.items():
        if y is None or y < -60: continue
        if any(any(t in (bl(x, yy, z) or '') for t in ('_log', '_wood', 'roots', 'stem', 'propagule')) for yy in range(y + 1, y + 9)): arbre.add((x, z))
    neu = arbre | {k for k in E if E[k]} | ({k for k in E if ex(*k)} if ex else set())
    H2 = {k: (None if k in neu else v) for k, v in H.items()}
    R = G['R']; xs = range(cx0 - R + 2, cx0 + R - 2); zs = range(cz0 - R + 2, cz0 + R - 2)
    terre = [(x, z) for x in xs for z in zs if H2.get((x, z)) is not None]
    if not terre: return None
    g = lambda k, d: d if H2.get(k) is None else H2[k]
    plats = sum(1 for (x, z) in terre if all(H2.get((x + a, z + c)) == H2[(x, z)] for a in (-2, -1, 0, 1, 2) for c in (-2, -1, 0, 1, 2)))
    marches = droites = 0
    for (x, z) in terre:
        for (a, c, pa, pb) in ((1, 0, 0, 1), (0, 1, 1, 0)):
            d = g((x + a, z + c), H2[(x, z)]) - H2[(x, z)]
            if abs(d) < 2: continue
            marches += 1
            if all(g((x + pa * k, z + pb * k), 0) - g((x + pa * k + a, z + pb * k + c), 0) == -d for k in (-2, -1, 1, 2)): droites += 1
    angles = 0
    for (x, z) in terre:
        h0 = H2[(x, z)]; dx = g((x + 1, z), h0) - h0; dz = g((x, z + 1), h0) - h0; d11 = g((x + 1, z + 1), None)
        if abs(dx) >= 2 and abs(dz) >= 2 and d11 == h0 + dx and d11 == h0 + dz: angles += 1
    n = len(terre); p, m, dr, an = plats / n, marches / n, droites / max(1, marches), angles / n
    return dict(terre=n, plats=round(100 * p, 1), angles_pour_mille=round(1000 * an, 2), marches_droites=round(100 * dr, 1), score=round(100 * (0.45 * p + 0.35 * dr * min(1, m * 8) + 0.20 * min(1, an * 50)), 1))
LOTS = reg['lots']; V = collections.OrderedDict()
print('1. Lieux sculptes : score cubique en jeu (+-64, prevu < 8) et fidelite au relief sculpte (colonnes masque >= 99 %)')
for s in reg['relief_naturel']['sculptures']:
    cle = s['hauteur'].split('/')[1]
    if cle == 'ileA': continue
    me = json.load(open(os.path.join(SC, cle, 'mesure.json'), encoding='utf-8')); cx0, cz0 = me['x0'] + 80, me['z0'] + 80
    r = carte(W, cx0, cz0)
    if not r: print('  %-5s non genere en entier' % cle); V[cle] = 'non testable'; continue
    H, E = r
    ex = None
    if cle == 'phare':
        lp = [l for l in LOTS if l['nom'] == 'Phare'][0]; ex = lambda x, z: dlot(lp, x, z) == 0
    m = mesure_bc(H, E, cx0, cz0, ex)
    hi = Image.open(os.path.join(SC, cle, 'hauteur.png')); mi = Image.open(os.path.join(SC, cle, 'masque.png')).convert('L')
    dif = []
    for (x, z), y in H.items():
        px, pz = x - me['x0'], z - me['z0']
        if not (0 <= px < hi.width and 0 <= pz < hi.height) or mi.getpixel((px, pz)) < 252 or y < 0: continue
        if ex and ex(x, z): continue
        dif.append(y - hi.getpixel((px, pz)) / 256.0)
    dif.sort(); n = len(dif)
    med = dif[n // 2] if n else 0; pres = 100.0 * sum(1 for d in dif if abs(d) <= 1.5) / max(1, n)
    sc = m['score'] if m else None
    ok = sc is not None and sc < 8 and abs(med) <= 1   # la fidelite est indicative : sur un monde non sculpte elle vaut deja 55 a 90 %
    V[cle] = 'OK' if ok else 'KO'
    print('  %-5s score en jeu %s (prevu %.1f, avant %.1f) plats %s %% marches droites %s %% ; relief : %d colonnes, ecart median %+.1f, a 1,5 bloc pres %.0f %% -> %s' % (
        cle, sc, me['apres']['score'], me['avant']['score'], m and m['plats'], m and m['marches_droites'], n, med, pres, V[cle]))
print('2. Ilots : sol de surface (ni glace ni neige)')
for nm, (cx, cz, R) in (('Phare', (-2640, -5744, 40)), ('ilot A', (-2534, -5864, 40))):
    c = collections.Counter(); gl = 0
    for x in range(cx - R, cx + R, 2):
        for z in range(cz - R, cz + R, 2):
            r = surface(x, z)
            if not r or r[0] < 62: continue
            c[r[1]] += 1
            if r[1] in ('ice', 'packed_ice', 'snow_block', 'powder_snow') or 'snow' in r[2]: gl += 1
    n = sum(c.values()); V['ilots ' + nm] = 'OK' if n and gl == 0 else ('non testable' if not n else 'KO')
    print('  %-6s %d colonnes emergees ; sol %s ; glace ou neige %d -> %s' % (nm, n, [(k, round(100 * v / n)) for k, v in c.most_common(5)] if n else '-', gl, V['ilots ' + nm]))
print('3. Majicavo (lot70) : marche au bord du lot et vegetation par bande')
L70 = [l for l in LOTS if l['nom'].startswith('lot70')][0]; P70 = [p for p in pl if p['nom'].startswith('lot70')][0]
marches = 0; nb = 0
for x in range(L70['x1'] - 2, L70['x2'] + 2):
    for z in range(L70['z1'] - 2, L70['z2'] + 2):
        if dlot(L70, x, z) > 0 or not (x in (L70['x1'], L70['x2'] - 1) or z in (L70['z1'], L70['z2'] - 1)): continue
        a = surface(x, z)
        for dx, dz in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            if dlot(L70, x + dx, z + dz) == 0: continue
            b = surface(x + dx, z + dz)
            if a and b: nb += 1; marches += abs(a[0] - b[0]) >= 2
V['majicavo marche'] = 'OK' if nb and marches <= 0.02 * nb else ('non testable' if not nb else 'KO')
print('  bord du lot : %d paires, %d marches de 2 blocs ou plus (attendu <= 2 %%) -> %s' % (nb, marches, V['majicavo marche']))
B = [(0, 16), (16, 48), (48, 96), (96, 160)]; nv = collections.Counter(); veg = collections.Counter(); tr = collections.Counter(); nc = collections.Counter()
for x in range(L70['x1'] - 160, L70['x2'] + 160, 2):
    for z in range(L70['z1'] - 160, L70['z2'] + 160, 2):
        d = dlot(L70, x, z); bb = [b for b in B if b[0] <= d < b[1]]
        if d <= 0 or not bb: continue
        r = surface(x, z)
        if not r: continue
        b = bb[0]; nc[b] += 1; veg[b] += bool(r[2]); tr[b] += any(v.endswith('_log') for v in r[2])
for b in B:
    print('  bande %3d-%3d : %5d colonnes, avec vegetation %4.1f %%, avec tronc %4.1f %%' % (b[0], b[1], nc[b], 100.0 * veg[b] / max(1, nc[b]), 100.0 * tr[b] / max(1, nc[b])))
v0, v3 = veg[B[0]] / max(1, nc[B[0]]), veg[B[3]] / max(1, nc[B[3]])
V['majicavo vegetation'] = 'non testable' if not nc[B[0]] else ('OK' if v0 >= 0.5 * v3 else 'KO')
print('  marge et fondu vegetalises (bande 0-16 >= moitie de la bande 96-160) -> %s' % V['majicavo vegetation'])
print('4. Plateau lot68 : dessus du sol attendu a Y 67')
P68 = [p for p in pl if p['nom'].startswith('lot68')][0]; h = collections.Counter(); manq = 0
for x in range(P68['x1'], P68['x2']):
    for z in range(P68['z1'], P68['z2']):
        r = surface(x, z)
        if r is None: manq += 1
        else: h[r[0]] += 1
n = sum(h.values()); V['lot68 Y 67'] = 'non testable' if not n else ('OK' if h.most_common(1)[0][0] == P68['y'] else 'KO')
print('  lot68 : %d colonnes, Y le plus frequent %s, part a Y %d : %.1f %%, non generees %d -> %s' % (n, h.most_common(1)[0][0] if n else '-', P68['y'], 100.0 * h[P68['y']] / max(1, n), manq, V['lot68 Y 67']))
print('5. Lave de surface hors volcan (12 blocs) et mares dans lots + marges + fondus, sur toutes les zones generees')
lave = 0; mares = 0; vus = 0; LV = {}; MARES = []
PORTAIL = ('stone_bricks', 'cracked_stone_bricks', 'mossy_stone_bricks', 'netherrack', 'magma_block', 'obsidian', 'crying_obsidian', 'gold_block', 'stone_brick_stairs', 'stone_brick_slab', 'stone_brick_wall')
def sans_lac(x, z):
    for l in LOTS:
        m = l.get('marge_blocs', 0) + 16
        if l['x1'] - m <= x < l['x2'] + m and l['z1'] - m <= z < l['z2'] + m: return True
    for p in pl:
        f = (p.get('fondu_max', 96) if p.get('fondu_adaptatif') else p.get('fondu', 32)) + 16
        if p['x1'] - f <= x < p['x2'] + f and p['z1'] - f <= z < p['z2'] + f: return True
    return False
for (cx, cz) in list(CACHE):
    b = CACHE[(cx, cz)]
    if b is None: continue
    for dx in range(0, 16, 2):
        for dz in range(0, 16, 2):
            x, z = cx * 16 + dx, cz * 16 + dz; vus += 1
            top = None
            for y in range(319, 30, -1):   # 15/11 : 160 coupait les montagnes (poche de lave de grotte a Y 145 sous un sommet au-dela de Y 160, prise pour de la surface)
                n_ = bl(x, y, z)
                if n_ not in ('air', 'cave_air'): top = (y, n_); break
            if not top: continue
            # 15/11 : lave de grotte fermee ignoree (cave_air entre la surface et la lave : poche a Y 145 sous un sommet a Y 157 vers z013)
            ly = next((yy for yy in range(top[0], top[0] - 13, -1) if 'lava' in (bl(x, yy, z) or '')), None)
            if ly is not None and not volcan(x, z) and not any(bl(x, yy, z) == 'cave_air' for yy in range(ly + 1, top[0])): LV[(x, z)] = top[1]
            if top[1] in ('water', 'lava') and top[0] >= 63 and sans_lac(x, z):
                mares += 1; MARES.append((x, z, top[0], top[1], [bl(x, yy, z) for yy in range(top[0] - 1, top[0] - 5, -1)],
                    [l['nom'][:30] for l in LOTS if dlot(l, x, z) <= l.get('marge_blocs', 0) + 16] + [p['nom'][:30] for p in pl if dlot(p, x, z) <= p.get('fondu', 32) + 16]))
# lave des portails en ruine ignoree (comme qc_c20 corrige) : groupes connexes (pas de 2) dont la moitie au moins des colonnes ont un bloc de portail en surface
S = set(LV); gr = []
while S:
    p = S.pop(); g = [p]; pile = [p]
    while pile:
        x, z = pile.pop()
        for a in (-2, 0, 2):
            for c in (-2, 0, 2):
                q = (x + a, z + c)
                if q in S: S.remove(q); pile.append(q); g.append(q)
    gr.append(g)
gp = [g for g in gr if sum(1 for q in g if LV[q] in PORTAIL) * 2 >= len(g)]
lave = sum(len(g) for g in gr) - sum(len(g) for g in gp)
print('  lave hors volcan : %d groupe(s), dont %d portail(s) en ruine ignore(s) (%s) ; hors portails : %s' % (len(gr), len(gp), ', '.join('%d,%d' % g[0] for g in gp) or '-',
      ', '.join('%d colonnes vers %d,%d (surface %s)' % (len(g), g[0][0], g[0][1], sorted(set(LV[q] for q in g))) for g in gr if g not in gp) or '0'))
V['lave hors volcan'] = 'OK' if lave == 0 else 'KO'
print('  %d colonnes lues (1 sur 4) : lave hors volcan %d -> %s ; eau ou lave au-dessus de Y 63 dans lots, marges, fondus : %d colonnes (a regarder si > 0)' % (vus, lave, V['lave hors volcan'], mares))
for mm in MARES: print('    mare', mm)
print('6. Troncs dans les lots (vegetation_marges ne doit jamais planter dans un lot)')
for l in LOTS:
    if not any(abs((l['x1'] + l['x2']) / 2 - cx * 16) < 200 and abs((l['z1'] + l['z2']) / 2 - cz * 16) < 200 for (cx, cz) in CACHE if CACHE[(cx, cz)]): continue
    t = n = 0
    for x in range(l['x1'], l['x2'], 2):
        for z in range(l['z1'], l['z2'], 2):
            r = surface(x, z)
            if r: n += 1; t += any(v.endswith('_log') for v in r[2])
    if n: print('  %-34s %5d colonnes, avec tronc %d (dont batiments et arbres d origine)' % (l['nom'][:34], n, t))
print('7. Camp des Goblini (x -2168..-2089, z -152..-73) : sol sous les arbres, pour le Y du plateau')
gh = collections.Counter(); gm = 0; gv = 0
for x in range(-2168, -2088):
    for z in range(-152, -72):
        r = surface(x, z)
        if r is None: gm += 1; continue
        gh[r[0]] += 1; gv += bool(r[2])
n = sum(gh.values())
if n:
    ys = sorted(gh.elements()); med = ys[n // 2]
    print('  %d colonnes (non generees %d) : Y median %d, min %d, max %d, p10 %d, p90 %d ; colonnes avec vegetation %.0f %% ; ecart au median : |d|<=1 %.0f %%, |d|<=3 %.0f %%' % (
        n, gm, med, ys[0], ys[-1], ys[n // 10], ys[9 * n // 10], 100.0 * gv / n, 100.0 * sum(v for k, v in gh.items() if abs(k - med) <= 1) / n, 100.0 * sum(v for k, v in gh.items() if abs(k - med) <= 3) / n))
    print('  GOBLINI_Y_MEDIAN %d' % med)
    # hauteur libre (arbres jusqu'a +37) : plus haut bloc de terrain au-dessus du lot (marge 8) et surplombs (air sous le sol de surface)
    hmax = (-999, 0, 0); surpl = 0
    for x in range(-2176, -2080, 2):
        for z in range(-160, -64, 2):
            r = surface(x, z)
            if not r: continue
            if r[0] > hmax[0]: hmax = (r[0], x, z)
            if any(bl(x, y, z) in ('air', 'cave_air') for y in range(r[0] - 6, r[0])): surpl += 1
    print('  plus haut bloc de terrain sur lot + marge 8 : Y %d en %d,%d (%+d sur le median) ; colonnes en surplomb (air dans les 6 blocs sous le sol) : %d ; hauteur libre voulue : 40 blocs au-dessus du plateau' % (hmax[0], hmax[1], hmax[2], hmax[0] - med, surpl))
else: print('  non genere (non testable)')
print('8. Lave au sud de lot68 (mare vue par Villes dans lieux_2 en 0.9.4i, vers z -1029, pre a l est de l avenue) : toutes les colonnes, x 2852..3040, z -1077..-981')
L8 = {}; n8 = 0; ng8 = 0
for x in range(2852, 3041):
    for z in range(-1077, -980):
        if ch(x, z) is None: ng8 += 1; continue
        n8 += 1; top = None
        for y in range(160, 30, -1):
            nn = bl(x, y, z)
            if nn not in ('air', 'cave_air'): top = (y, nn); break
        if top and any('lava' in (bl(x, yy, z) or '') for yy in range(top[0], top[0] - 13, -1)): L8[(x, z)] = top[1]
S8 = set(L8); g8 = []
while S8:
    p = S8.pop(); g = [p]; pile = [p]
    while pile:
        x, z = pile.pop()
        for a_ in (-1, 0, 1):
            for c_ in (-1, 0, 1):
                q = (x + a_, z + c_)
                if q in S8: S8.remove(q); pile.append(q); g.append(q)
    g8.append(g)
gp8 = [g for g in g8 if sum(1 for q in g if L8[q] in PORTAIL) * 2 >= len(g)]
hors8 = [g for g in g8 if g not in gp8]
V['lave sud lot68'] = 'non testable' if not n8 else ('OK' if not hors8 else 'KO')
print('  %d colonnes lues (non generees %d) ; groupes de lave %d dont portails en ruine %d ; hors portails : %s -> %s' % (n8, ng8, len(g8), len(gp8),
      ', '.join('%d colonnes vers %d,%d' % (len(g), g[0][0], g[0][1]) for g in hors8) or '0', V['lave sud lot68']))
print('GRILLE : ' + ' | '.join('%s %s' % kv for kv in V.items()))
