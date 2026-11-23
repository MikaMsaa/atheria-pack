# Couverture des volumes du tram (mission 3 de Villes), hors ligne, sans java.
# usage : python -I couverture_tram.py <monde_c22m> [regions.json]
# surface = sol reel du monde (vegetation et eau ignorees) quand le chunk est genere, sinon relief_base (colle au monde a 1 bloc pres).
# couverture = surface - y_max (meme definition que ValidationVolumes). Eau : colonne d eau au-dessus du sol (monde) ou base < 63 (bake).
import sys, os, json, math, collections
WS = sys.argv[1].split(';'); W = WS[0]
ICI = os.path.dirname(os.path.abspath(sys.argv[0])); SC = os.path.join(ICI, '..', 'sculpture'); BR = os.path.join(ICI, '..', 'branche-relief')
G = {'__file__': os.path.join(SC, 'classement_cubique.py')}
src = open(os.path.join(SC, 'classement_cubique.py'), encoding='utf-8').read().split('def vignette')[0]
_a = sys.argv; sys.argv = [sys.argv[0]]; exec(src, G); sys.argv = _a
lire = G['lire']
REG = sys.argv[2] if len(sys.argv) > 2 and sys.argv[2] else os.path.join(BR, 'regions-v3o.json')
reg = json.load(open(REG, encoding='utf-8'))
pl = json.load(open(os.path.join(BR, 'plateaux-v3o.json'), encoding='utf-8'))['plateaux']
E = {'__file__': os.path.join(ICI, 'emprises.py')}
esrc = open(os.path.join(ICI, 'emprises.py'), encoding='utf-8').read().split('# --- monde de test')[0]
_a = sys.argv; sys.argv = [sys.argv[0], os.path.join(ICI, '..', '..', '..')]; exec(esrc, E); sys.argv = _a
E['DSC'] = 0
CACHE = {}
def ch(w, x, z):
    k = (w, x >> 4, z >> 4)
    if k not in CACHE:
        try: r = lire(w, x >> 4, z >> 4)
        except Exception: r = None
        CACHE[k] = r[1] if r and r[1] else None
    return CACHE[k]
def bl(b, x, y, z):
    Y = y >> 4; L = b.get(Y + 256 if Y < 0 else Y)
    return 'air' if L is None else L[((y & 15) << 8) | ((z & 15) << 4) | (x & 15)].split('[')[0].split(':')[-1]
FLU = ('water', 'lava', 'bubble_column', 'kelp', 'kelp_plant', 'seagrass', 'tall_seagrass')
def colonne(x, z):
    """(sol, source, eau_au_dessus) : premier monde dont la colonne a un vrai sol (chunk complet), sinon le bake"""
    for w in WS:
        b = ch(w, x, z)
        if b is None: continue
        eau = False; trouve = None
        for y in range(200, 0, -1):
            n = bl(b, x, y, z)
            if n in ('air', 'cave_air', 'void_air'): continue
            if n in FLU or 'coral' in n or 'sea_pickle' in n: eau = True; continue
            if not G['sol'](n): continue
            trouve = y; break
        if trouve is not None and trouve >= 40: return trouve, os.path.basename(os.path.normpath(w)), eau
    b = E['terrain'](x, z, False)
    if b is None: return None, 'aucun', False
    return b, 'bake', b < 62.5
def dseg(px, pz, a, b):
    ax, az = a; bx, bz = b; vx, vz = bx - ax, bz - az; L2 = vx * vx + vz * vz
    t = 0 if L2 == 0 else max(0, min(1, ((px - ax) * vx + (pz - az) * vz) / L2))
    return math.hypot(px - ax - t * vx, pz - az - t * vz), t
def couloir_cols(pts, larg):
    xs = [p[0] for p in pts]; zs = [p[1] for p in pts]; h = larg / 2.0
    out = {}
    for x in range(int(min(xs) - h) - 1, int(max(xs) + h) + 2):
        for z in range(int(min(zs) - h) - 1, int(max(zs) + h) + 2):
            best = None
            for i in range(len(pts) - 1):
                d, t = dseg(x + 0.5, z + 0.5, pts[i], pts[i + 1])
                if best is None or d < best[0]: best = (d, i, t)
            if best[0] <= h: out[(x, z)] = best
    return out
def boite_cols(v): return {(x, z): None for x in range(v['x1'], v['x2']) for z in range(v['z1'], v['z2'])}
def dlot(l, x, z): return math.hypot(max(l['x1'] - x, 0, x - l['x2'] + 1), max(l['z1'] - z, 0, z - l['z2'] + 1))

vols = reg['volumes_souterrains']['elements']; V = {v['nom']: v for v in vols}
NOUV = json.loads(json.dumps(vols))
for v in NOUV:
    if v['nom'] == 'Ligne principale':
        v.update(points=[[2496, -3000], [2484, -3000], [2484, -2984], [2456, -2872], [2456, -2688], [2520, -2600], [2520, -2200], [2546, -2104], [2568, -2032]], largeur_blocs=10, y_min=51, y_max=58)
    if v['nom'] == 'Embranchement':
        v.update(points=[[2496, -3000], [2400, -3000], [2300, -2916], [2200, -2816], [2136, -2752]], largeur_blocs=10, y_min=51, y_max=58)
    if v['nom'] in ('Station de Majicavo', 'Petite station 1', 'Petite station 2', 'Petite station 3', 'Station des veilleurs', 'Grand Nid'):
        v['y_min'] = 48
NV = {v['nom']: v for v in NOUV}
print('regions lu :', os.path.basename(REG))
for n in ('Ligne principale', 'Embranchement', 'Station de Majicavo', 'Petite station 1', 'Petite station 2', 'Petite station 3', 'Station des veilleurs', 'Grand Nid'):
    a, b = V[n], NV[n]
    print('  %-22s avant y %s..%s larg %s -> apres y %s..%s larg %s' % (n, a['y_min'], a['y_max'], a.get('largeur_blocs', '-'), b['y_min'], b['y_max'], b.get('largeur_blocs', '-')))

def cumul(pts):
    c = [0.0]
    for i in range(len(pts) - 1): c.append(c[-1] + math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]))
    return c
lots = reg['lots']
GR = {}
print()
print('1. Couverture au-dessus de la voute (surface - y_max), toutes les colonnes du volume')
for n in ('Ligne principale', 'Embranchement', 'Station de Majicavo', 'Petite station 1', 'Petite station 2', 'Petite station 3', 'Station des veilleurs', 'Grand Nid'):
    v = NV[n]; cols = couloir_cols(v['points'], v['largeur_blocs']) if v['forme'] == 'couloir' else boite_cols(v)
    src = collections.Counter(); res = []
    for (x, z), info in cols.items():
        s, so, eau = colonne(x, z); src[so] += 1
        if s is None: continue
        res.append((s - v['y_max'], x, z, so, eau, info))
    if not res: print('  %s : aucune donnee' % n); continue
    res.sort()
    cv = [r[0] for r in res]
    print('  %s : %d colonnes (%s) ; couverture min %.1f, p5 %.1f, mediane %.1f' % (n, len(res), ', '.join('%s %d' % kv for kv in src.items()), cv[0], cv[len(cv) // 20], cv[len(cv) // 2]))
    if v['forme'] == 'couloir':
        cu = cumul(v['points'])
        # profil le long de l axe, par tranche de 8 blocs : min sur la largeur
        prof = collections.defaultdict(list)
        for c, x, z, so, eau, (d, i, t) in res:
            s = cu[i] + t * (cu[i + 1] - cu[i]); prof[int(s // 8)].append((c, x, z, so, eau))
        pires = sorted((min(L), k) for k, L in prof.items())
        vus = []
        print('    points les plus faibles (min sur la largeur, tranches de 8 blocs, ecartes de 32 blocs au moins) :')
        for m, k in pires:
            if any(abs(k - j) < 4 for j in vus): continue
            vus.append(k); c, x, z, so, eau = m
            print('      km %5d : couverture %5.1f en %d,%d (%s%s)' % (k * 8, c, x, z, so, ', EAU au-dessus' if eau else ''))
            if len(vus) >= 6: break
        # moyenne de l axe (ce que Villes appelle peut-etre la couverture : min de la moyenne par tranche)
        moy = sorted((sum(c for c, *_ in L) / len(L), k) for k, L in prof.items())
        print('    min de la couverture MOYENNE par tranche de 8 : %.1f (km %d)' % (moy[0][0], moy[0][1] * 8))
        tout = collections.defaultdict(lambda: [0, 0])
        for (x, z), (d, i, t) in cols.items():
            s = cu[i] + t * (cu[i + 1] - cu[i]); tout[int(s // 8)][0] += 1
        for k, L in prof.items(): tout[k][1] = len(L)
        trous = sorted(k for k, (n_, m_) in tout.items() if m_ < n_ * 0.5)
        plages = []
        for k in trous:
            if plages and k == plages[-1][1] + 1: plages[-1][1] = k
            else: plages.append([k, k])
        print('    tranches sans donnees (moins de la moitie des colonnes lues) : %s' % (', '.join('km %d..%d' % (p[0] * 8, p[1] * 8 + 8) for p in plages) or 'aucune'))
    else:
        c, x, z, so, eau, _ = res[0]; print('    point le plus faible : %.1f en %d,%d (%s)' % (c, x, z, so))
    GR[n] = (cv[0], res)

# etalonnage : ile_test_1 (0.7.3) contre pilote-v3-colline2 (v3) sur les colonnes des deux lignes lues dans les deux mondes
def sol_w(w, x, z):
    b = ch(w, x, z)
    if b is None: return None
    for y in range(200, 0, -1):
        n = bl(b, x, y, z)
        if n in ('air', 'cave_air', 'void_air') or n in FLU or 'coral' in n or 'sea_pickle' in n or not G['sol'](n): continue
        return y if y >= 40 else None
    return None
if len(WS) >= 3:
    dif = []
    for n in ('Ligne principale', 'Embranchement'):
        v = NV[n]
        for (x, z) in couloir_cols(v['points'], v['largeur_blocs']):
            a_, b_ = sol_w(WS[1], x, z), sol_w(WS[2], x, z)
            if a_ is not None and b_ is not None: dif.append(b_ - a_)
    if dif:
        dif.sort(); print('Etalonnage %s - %s sur %d colonnes communes : mediane %+d, p5 %+d, p95 %+d, |d|<=1 %d %%' % (os.path.basename(WS[2]), os.path.basename(WS[1]), len(dif), dif[len(dif) // 2], dif[len(dif) // 20], dif[len(dif) * 19 // 20], 100 * sum(1 for d in dif if abs(d) <= 1) // len(dif)))
    else: print('Etalonnage : aucune colonne commune')
print()
print('2. Passages sous l eau (mer, lagon, bassins, rivieres) : roche entre fond d eau et voute, visee >= 4')
ko_eau = []
for n, (m, res) in GR.items():
    e = [r for r in res if r[4]]
    if not e: print('  %s : aucune colonne sous l eau' % n); continue
    e.sort(); print('  %s : %d colonnes sous l eau, roche min %.1f en %d,%d (%s)' % (n, len(e), e[0][0], e[0][1], e[0][2], e[0][3]))
    if e[0][0] < 4: ko_eau.append(n)
# lot67 : bassin et chenal poses par Villes (absents du monde) -> profondeur max autorisee du bassin
print('  lot67 Port de Longoni (bassin et chenal poses par Villes, absents du monde) :')
l67 = [l for l in lots if l['nom'].startswith('lot67')][0]
for n, (m, res) in GR.items():
    r = [x for x in res if l67['x1'] <= x[1] < l67['x2'] and l67['z1'] <= x[2] < l67['z2']]
    if r: print('    %s : %d colonnes sous lot67, y_max %d -> fond de bassin ou de chenal a Y %d au plus bas (4 blocs de roche) ; sol actuel min %.0f' % (n, len(r), NV[n]['y_max'], NV[n]['y_max'] + 4 + 1, min(x[0] for x in r) + NV[n]['y_max']))

print()
print('3. Conflits')
def emprise(v):
    if v['forme'] == 'boite': return set(boite_cols(v))
    return set(couloir_cols(v['points'], v['largeur_blocs']))
EMP = {v['nom']: emprise(v) for v in NOUV if v['nom'] not in ('Puits de Majicavo', 'Bouche des veilleurs')}
EMP['Puits de Majicavo'] = emprise(NV['Puits de Majicavo']); EMP['Bouche des veilleurs'] = emprise(NV['Bouche des veilleurs'])
def ymax(v, x, z):
    if v['y_max'] == 'surface': s = colonne(x, z)[0]; return s if s is not None else 999
    return v['y_max']
for n in ('Ligne principale', 'Embranchement', 'Station de Majicavo', 'Petite station 1', 'Petite station 2', 'Petite station 3', 'Station des veilleurs', 'Grand Nid'):
    v = NV[n]; A = EMP[n]
    print('  %s (y %d..%d) :' % (n, v['y_min'], v['y_max']))
    for w in NOUV:
        if w['nom'] == n: continue
        B = EMP[w['nom']]; inter = A & B
        if inter:
            yo = (v['y_min'] <= (w['y_max'] if w['y_max'] != 'surface' else 999) and w['y_min'] <= v['y_max'])
            print('     touche le volume %-22s (y %s..%s) : %4d colonnes, %s' % (w['nom'], w['y_min'], w['y_max'], len(inter), 'Y communs (jonction voulue ?)' if yo else 'pas de Y commun (separe en hauteur de %d blocs)' % (max(v['y_min'] - (w['y_max'] if w['y_max'] != 'surface' else 999), w['y_min'] - v['y_max']) - 1)))
        else:
            dm = min(math.hypot(a[0] - b[0], a[1] - b[1]) for a in list(A)[::7] for b in list(B)[::7]) if len(A) * len(B) < 4e7 else None
            if dm is not None and dm <= reg['volumes_souterrains']['marge_blocs'] + 2:
                print('     a %.0f blocs du volume %s (y %s..%s), dans la marge de %d' % (dm, w['nom'], w['y_min'], w['y_max'], reg['volumes_souterrains']['marge_blocs']))
    for l in lots:
        k = sum(1 for (x, z) in A if l['x1'] <= x < l['x2'] and l['z1'] <= z < l['z2'])
        km = sum(1 for (x, z) in A if dlot(l, x, z) <= l.get('marge_blocs', 0)) - k
        if k or km: print('     sous le lot %-50s : %4d colonnes dedans, %4d dans sa marge' % (l['nom'][:50], k, km))
    for p in pl:
        f = p.get('fondu', p.get('fondu_max', 0))
        k = sum(1 for (x, z) in A if dlot(p, x, z) <= f)
        if k: print('     sous le plateau %s (Y %d, fondu %d) : %d colonnes ; couverture au plateau %d' % (p['nom'], p['y'], f, k, p['y'] - v['y_max']))
    for sname in os.listdir(SC):
        mj = os.path.join(SC, sname, 'mesure.json')
        if os.path.isfile(mj):
            me = json.load(open(mj, encoding='utf-8')); sx, sz = me['x0'], me['z0']
            if any(sx - 16 <= x < sx + 176 and sz - 16 <= z < sz + 176 for (x, z) in list(A)[::5]): print('     sous la sculpture %s' % sname)

print()
print('4. chunks_volumes (exclusions.json) : chunks des volumes + marge %d' % reg['volumes_souterrains']['marge_blocs'])
mg = reg['volumes_souterrains']['marge_blocs']
def chunks(vs):
    S = set()
    for v in vs:
        for (x, z) in EMP2(v):
            for dx in (-mg, 0, mg):
                for dz in (-mg, 0, mg): S.add(((x + dx) >> 4, (z + dz) >> 4))
    return S
def EMP2(v):
    if v['forme'] == 'boite': return set(boite_cols(v))
    return set(couloir_cols(v['points'], v['largeur_blocs']))
avant = chunks(vols); apres = chunks(NOUV)
print('  avant %d chunks, apres %d chunks : %d nouveaux, %d qui sortent' % (len(avant), len(apres), len(apres - avant), len(avant - apres)))
ex = os.path.join(ICI, '..', '..', 'serveur-ile-test', 'config', 'atheria_ile', 'exclusions.json')
if os.path.isfile(ex):
    J = json.load(open(ex, encoding='utf-8')); cv = J.get('chunks_volumes')
    if cv is not None:
        S = set(tuple(c) if isinstance(c, list) else tuple(int(t) for t in str(c).split(',')) for c in cv)
        print('  exclusions.json de serveur-ile-test (lecture seule) : %d chunks_volumes ; nouveaux chunks absents : %d' % (len(S), len(apres - S)))
print('  -> exclusions.json est regenere par le mod au demarrage a partir de regions.json : il sera a jour si regions.json l est.')
print()
print('GRILLE_EAU_KO :', ko_eau)
print('GRILLE_COUV :', ' | '.join('%s %.1f' % (n, m) for n, (m, r) in GR.items()))
