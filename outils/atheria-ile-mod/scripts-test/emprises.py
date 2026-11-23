# Partie B : emprises pour Villes (hors ligne, lecture seule).
# usage : python -I emprises.py <racine_projet>
import sys, os, json, math, struct, zlib, collections
R = sys.argv[1]
BR = os.path.join(R, 'outils', 'atheria-ile-mod', 'branche-relief'); ST = os.path.join(R, 'outils', 'atheria-ile-mod', 'scripts-test')
SC = os.path.join(R, 'outils', 'atheria-ile-mod', 'sculpture'); ESS = os.path.join(R, 'outils', 'serveur-pilote-essai')
reg = json.load(open(os.path.join(BR, 'regions-v3n.json'), encoding='utf-8'))
pl = json.load(open(os.path.join(BR, 'plateaux-v3l.json'), encoding='utf-8'))['plateaux']

def atrb(f):
    b = open(f, 'rb').read(); mg, x0, z0, pas, w, h = struct.unpack('>6i', b[:24])
    return x0, z0, pas, w, h, struct.unpack('>%dh' % (w * h), b[24:24 + 2 * w * h])
BASE = atrb(os.path.join(ST, 'relief_base.bin')); DEL = atrb(os.path.join(ST, 'relief_delta_c2.bin'))
def grille(G, x, z):
    x0, z0, pas, w, h, t = G; i = (x - x0) / pas; j = (z - z0) / pas
    i0, j0 = int(math.floor(i)), int(math.floor(j))
    if not (0 <= i0 < w - 1 and 0 <= j0 < h - 1): return None
    v = [t[(j0 + a) * w + i0 + b] for a in (0, 1) for b in (0, 1)]
    if min(v) <= -32767: return None
    fi, fj = i - i0, j - j0
    return v[0] * (1 - fi) * (1 - fj) + v[1] * fi * (1 - fj) + v[2] * (1 - fi) * fj + v[3] * fi * fj
DSC = None
def terrain(x, z, avec_delta=True):
    b = grille(BASE, x, z)
    if b is None: return None
    if not avec_delta: return b
    d = grille(DEL, x, z)
    return b + (d * DSC if d is not None and d > -32767 else 0)

# --- monde de test (OCEAN_FLOOR) pour etalonner
MINY = -64
def nbt(b, i, t):
    if t == 1: return b[i], i + 1
    if t == 2: return None, i + 2
    if t == 3: return struct.unpack('>i', b[i:i + 4])[0], i + 4
    if t == 4: return None, i + 8
    if t == 5: return None, i + 4
    if t == 6: return None, i + 8
    if t == 7: n = struct.unpack('>i', b[i:i + 4])[0]; return None, i + 4 + n
    if t == 8: n = struct.unpack('>H', b[i:i + 2])[0]; return b[i + 2:i + 2 + n].decode('utf-8', 'replace'), i + 2 + n
    if t == 9:
        et = b[i]; n = struct.unpack('>i', b[i + 1:i + 5])[0]; i += 5; L = []
        for _ in range(n): v, i = nbt(b, i, et); L.append(v)
        return L, i
    if t == 10:
        d = {}
        while True:
            tt = b[i]; i += 1
            if tt == 0: return d, i
            n = struct.unpack('>H', b[i:i + 2])[0]; k = b[i + 2:i + 2 + n].decode('utf-8', 'replace'); i += 2 + n
            v, i = nbt(b, i, tt); d[k] = v
    if t == 11: n = struct.unpack('>i', b[i:i + 4])[0]; return None, i + 4 + 4 * n
    if t == 12: n = struct.unpack('>i', b[i:i + 4])[0]; return list(struct.unpack('>%dq' % n, b[i + 4:i + 4 + 8 * n])), i + 4 + 8 * n
CACHE = {}
def chunk(W, cx, cz):
    k = (W, cx, cz)
    if k in CACHE: return CACHE[k]
    rf = os.path.join(W, 'region', 'r.%d.%d.mca' % (cx >> 5, cz >> 5)); r = None
    if os.path.exists(rf) and os.path.getsize(rf) >= 8192:
        with open(rf, 'rb') as f:
            f.seek(4 * ((cx & 31) + 32 * (cz & 31))); e = struct.unpack('>I', f.read(4))[0]
            if e >> 8:
                f.seek((e >> 8) * 4096); ln, ct = struct.unpack('>IB', f.read(5)); raw = zlib.decompress(f.read(ln - 1))
                d, _ = nbt(raw, 3 + struct.unpack('>H', raw[1:3])[0], 10)
                if d.get('Status', '').endswith('full'):
                    hm = {}
                    for kk, v in d.get('Heightmaps', {}).items():
                        vals = []
                        for L in v:
                            L &= (1 << 64) - 1
                            for j in range(7): vals.append((L >> (9 * j)) & 511)
                        hm[kk] = vals[:256]
                    bi = collections.Counter()
                    for s in d.get('sections', []):
                        p = (s.get('biomes') or {}).get('palette') or []
                        if s.get('Y', -99) in (3, 4) and len(p) == 1: bi[p[0]] += 1
                    r = (hm, bi)
    CACHE[k] = r; return r
def sol_monde(W, x, z):
    c = chunk(W, x >> 4, z >> 4)
    if not c or 'OCEAN_FLOOR' not in c[0]: return None
    return c[0]['OCEAN_FLOOR'][(x & 15) + 16 * (z & 15)] + MINY - 1

def dseg(px, pz, a, b):
    ax, az = a; bx, bz = b; vx, vz = bx - ax, bz - az; L = vx * vx + vz * vz
    t = 0 if L == 0 else max(0, min(1, ((px - ax) * vx + (pz - az) * vz) / L))
    return math.hypot(px - ax - t * vx, pz - az - t * vz)
RN = reg['routes'][0]['points']
def drn(x, z): return min(dseg(x, z, RN[i], RN[i + 1]) for i in range(len(RN) - 1))
def drect_rn(x1, z1, x2, z2):
    m = 1e9
    for x in range(x1, x2 + 1, 8):
        for z in (z1, z2): m = min(m, drn(x, z))
    for z in range(z1, z2 + 1, 8):
        for x in (x1, x2): m = min(m, drn(x, z))
    # axe qui traverserait le rectangle
    for i in range(len(RN) - 1):
        for t in range(0, 101, 2):
            x = RN[i][0] + (RN[i + 1][0] - RN[i][0]) * t / 100; z = RN[i][1] + (RN[i + 1][1] - RN[i][1]) * t / 100
            if x1 <= x < x2 and z1 <= z < z2: return 0
    return m

LC = {'mamoudzou_haussmann': (2920, -840, 200), 'mamoudzou_verre': (2888, -1096, 180), 'mamoudzou_beton': (2760, -1192, 200),
      'majicavo': (150 * 16 + 8, -126 * 16 + 8, 120), 'longoni_port': (178 * 16 + 8, -185 * 16 + 8, 300), 'longoni_bidonville': (163 * 16 + 8, -179 * 16 + 8, 260)}
def inter(a, b): return a[0] < b[2] and b[0] < a[2] and a[1] < b[3] and b[1] < a[3]
SCU = []
for s in reg['relief_naturel']['sculptures']:
    cle = s['hauteur'].split('/')[1]; me = os.path.join(SC, cle, 'mesure.json')
    if os.path.exists(me):
        m = json.load(open(me, encoding='utf-8')); SCU.append((cle, m['x0'], m['z0'], m['x0'] + 160, m['z0'] + 160))
VOL = []
for e in reg['volumes_souterrains']['elements']:
    mg = reg['volumes_souterrains'].get('marge_blocs', 8)
    if e['forme'] == 'boite': VOL.append((e['nom'], e['x1'] - mg, e['z1'] - mg, e['x2'] + mg, e['z2'] + mg))
    else:
        xs = [p[0] for p in e['points']]; zs = [p[1] for p in e['points']]; w = e.get('largeur_blocs', 9) / 2 + mg
        VOL.append((e['nom'] + ' (couloir, boite englobante)', min(xs) - w, min(zs) - w, max(xs) + w, max(zs) + w, e['points'], w))
def conflits(r, ville_voulue):
    x1, z1, x2, z2 = r; out = []
    for l in reg['lots']:
        m = l.get('marge_blocs', 0)
        if inter(r, (l['x1'] - m, l['z1'] - m, l['x2'] + m, l['z2'] + m)): out.append('lot ' + l['nom'] + (' (marge %d)' % m if not inter(r, (l['x1'], l['z1'], l['x2'], l['z2'])) else ''))
    for p in pl:
        f = p.get('fondu_max', p.get('fondu', 32))
        if inter(r, (p['x1'] - f, p['z1'] - f, p['x2'] + f, p['z2'] + f)) and not any(p['nom'][:5] in o for o in out): out.append('plateau+fondu ' + p['nom'][:20])
    for v in VOL:
        if inter(r, v[1:5]):
            if len(v) > 5:
                if not any(dseg(x, z, v[5][i], v[5][i + 1]) <= v[6] for i in range(len(v[5]) - 1) for x in range(x1, x2, 4) for z in range(z1, z2, 4)): continue
            out.append('volume ' + v[0])
    if inter(r, (2896, -960, 3024, -848)): out.append('ANCIEN PILOTE chunks 181..188 x -60..-54')
    for s in SCU:
        if inter(r, s[1:]): out.append('sculpture ' + s[0])
    for q in reg['relief_naturel']['zones_relief_libres']:
        if inter(r, q): out.append('zone_relief_libre %s' % q)
    for (fx, fz, rp, rf) in reg['relief_naturel']['zones_forme']:
        if dist_rect(fx, fz, r) < rf: out.append('zone_forme colline C24')
    for zb in reg['zones_biome']:
        if zb.get('forme') == 'rectangle':
            if inter(r, (zb['x1'], zb['z1'], zb['x2'], zb['z2'])): out.append('zone_biome %s (%s%s)' % (zb['nom'], zb['biome'], ', zone_ville' if zb.get('zone_ville') else ''))
        elif dist_rect(zb['x'], zb['z'], r) < zb['rayon_blocs']: out.append('zone_biome %s (%s)' % (zb['nom'], zb['biome']))
    for n, (cx, cz, rr) in LC.items():
        d = dist_rect(cx, cz, r)
        if d < rr: out.append('LC %s %s' % (n, 'centre dedans' if d == 0 else 'rayon (%d du centre)' % d) + (' [voulu]' if n == ville_voulue else ''))
    return out
def dist_rect(x, z, r): return math.hypot(max(r[0] - x, 0, x - r[2]), max(r[1] - z, 0, z - r[3]))

NUL = [0]
def stats(r, src='relief'):
    x1, z1, x2, z2 = r; H = []
    for x in range(x1, x2 + 1, 4):
        for z in range(z1, z2 + 1, 4):
            y = terrain(x, z)
            if y is None: NUL[0] += 1; continue
            H.append((x, z, y))
    if len(H) < 20: return None
    ys = [h[2] for h in H]; n = len(ys); moy = sum(ys) / n
    # plan moyen (moindres carres) : pente generale
    mx = sum(h[0] for h in H) / n; mz = sum(h[1] for h in H) / n
    sxx = sum((h[0] - mx) ** 2 for h in H); szz = sum((h[1] - mz) ** 2 for h in H)
    a = sum((h[0] - mx) * (h[2] - moy) for h in H) / sxx; b = sum((h[1] - mz) * (h[2] - moy) for h in H) / szz
    eau = sum(1 for y in ys if y < 63)
    ys.sort()
    return dict(moy=moy, mn=ys[0], mx=ys[-1], p10=ys[n // 10], p90=ys[9 * n // 10], pente=100 * math.hypot(a, b), dir=math.degrees(math.atan2(a, -b)) % 360, eau=100.0 * eau / n)

def biomes(W, r):
    c = collections.Counter()
    for cx in range(r[0] >> 4, (r[2] >> 4) + 1):
        for cz in range(r[1] >> 4, (r[3] >> 4) + 1):
            k = chunk(W, cx, cz)
            if k: c.update(k[1])
    return c

if __name__ == '__main__':
    # 1. etalonnage du delta : base + s * delta contre un monde de test (hors villes LC, lots et plateaux)
    W = os.path.join(ESS, sys.argv[2] if len(sys.argv) > 2 else 'pilote-v3-audit3')
    pts = []
    for x in range(2000, 3100, 24):
        for z in range(-2400, -400, 24):
            if any(math.hypot(x - cx, z - cz) < rr + 32 for (cx, cz, rr) in LC.values()): continue
            if conflits((x, z, x + 1, z + 1), None): continue
            y = sol_monde(W, x, z)
            if y is None or y < 63: continue
            b = grille(BASE, x, z); d = grille(DEL, x, z)
            if b is None or d is None: continue
            pts.append((y, b, d))
    best = None
    for s in [i / 128.0 for i in range(-4, 260, 4)] + [0.5, 1.0]:
        e = sorted(abs(y - b - s * d) for y, b, d in pts)
        if e and (best is None or e[len(e) // 2] < best[1]): best = (s, e[len(e) // 2], e[9 * len(e) // 10])
    DSC = best[0] if best else 0
    print('ETALONNAGE sur %s : %d points ; delta x %.3f -> ecart median %.1f, 90e centile %.1f (base seule : median %.1f)' % (
        os.path.basename(W), len(pts), DSC, best[1], best[2], sorted(abs(y - b) for y, b, d in pts)[len(pts) // 2] if pts else -1))
    print('delta : plage', min(v for v in DEL[5] if v > -32767), max(DEL[5]))

    DSC = 0  # base seule = monde a 1 bloc pres (median et 90e centile) sur audit3 et colline2
    def cherche(nom, w, h, zone, ycible, filtre, ville, n=4):
        res = []
        for (ww, hh) in {(w, h), (h, w)}:
            for x1 in range(zone[0], zone[2] - ww + 1, 8):
                for z1 in range(zone[1], zone[3] - hh + 1, 8):
                    r = (x1, z1, x1 + ww, z1 + hh)
                    c = [k for k in conflits(r, ville) if not k.startswith('LC ' + ville) and not k.startswith('zone_biome Mamoudzou')]
                    if any(k.startswith(('lot', 'plateau', 'volume', 'sculpture', 'zone_relief', 'zone_forme')) for k in c): continue
                    d = drect_rn(*r)
                    if d < 54: continue
                    s = stats(r)
                    if not s or not filtre(s, r): continue
                    cout = abs(s['moy'] - ycible) + 0.5 * (s['p90'] - s['p10']) + (0 if ycible is None else 0)
                    res.append((cout, r, s, d, c))
        res.sort(key=lambda t: t[0]); out = []
        for t in res:
            if all(not inter(t[1], o[1]) for o in out): out.append(t)
            if len(out) >= n: break
        print('== %s %dx%d' % (nom, w, h))
        for cout, r, s, d, c in out:
            print('  x %d..%d z %d..%d | Y moy %.1f min %d max %d (p10 %d p90 %d) | pente %.1f %% vers %d deg | sous Y 63 %.0f %% | RN1 a %d (axe) | autres : %s' % (
                r[0], r[2], r[1], r[3], s['moy'], s['mn'], s['mx'], s['p10'], s['p90'], s['pente'], s['dir'], s['eau'], d, '; '.join(c) or 'aucun'))
        return out
    LH = LC['mamoudzou_haussmann']
    zoneH = (LH[0] - LH[2], LH[1] - LH[2], LH[0] + LH[2], LH[1] + LH[2])
    def dansH(s, r): return sum(1 for x in range(r[0], r[2], 8) for z in range(r[1], r[3], 8) if math.hypot(x - LH[0], z - LH[1]) <= LH[2]) >= 0.6 * ((r[2] - r[0]) // 8) * ((r[3] - r[1]) // 8)
    rue = cherche('rue haussmannienne (Y 67, dans le rayon haussmann)', 128, 112, zoneH, 67, lambda s, r: dansH(s, r) and s['eau'] < 5, 'mamoudzou_haussmann')
    zoneM = (2560, -1420, 3200, -600)
    cc = cherche('centre commercial inonde (bas, pres de l eau)', 128, 128, zoneM, 63, lambda s, r: s['mn'] <= 64 and s['eau'] < 60 and not any(inter(r, q[1]) for q in rue), 'mamoudzou_beton')
    g = (-2168, -152, -2088, -72); s = stats(g); d = drect_rn(*g)
    print('== camp des Goblini 80x80 centre sur le lot actuel')
    print('  x %d..%d z %d..%d | Y moy %.1f min %d max %d (p10 %d p90 %d) | pente %.1f %% vers %d deg | sous Y 63 %.0f %% | RN1 a %d | conflits : %s' % (
        g[0], g[2], g[1], g[3], s['moy'], s['mn'], s['mx'], s['p10'], s['p90'], s['pente'], s['dir'], s['eau'], d, '; '.join(conflits(g, None)) or 'aucun'))
    W2 = os.path.join(ESS, 'pilote-v3-colline2')
    for nm, L in (('rue', rue), ('centre', cc)):
        for t in L[:2]: print('  biomes (colline2, chunks)', nm, t[1], biomes(W2, t[1]).most_common(4))
