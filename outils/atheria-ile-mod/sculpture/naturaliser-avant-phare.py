# 0.9.5e : sculpture « naturelle et realiste » d'une zone jugee cubique, hors ligne (Python pur + Pillow).
# Part du relief reel du monde de test le plus recent qui couvre la zone (lecture seule), puis :
#   lissage des marches, micro-relief, ravines d'erosion, strates en banquettes aux bords irreguliers sur les pentes fortes,
#   eboulis au pied des falaises, plage en pente douce (cote plage), vasieres et chenaux (cote vase), blocs epars (roche).
# Garde la classe de la carte (terre reste terre, mer reste mer, sauf chenaux de vasiere), aucun effet dans les lots ni pres des routes.
# Sorties dans sculpture/<zone>/ : hauteur.png (16 bits, Y x 256), masque.png, rendu.png (avant/apres + 3 coupes), mesure.json
# usage : python -I naturaliser.py <zone> [<zone> ...]
import os, sys, json, math
from PIL import Image, ImageDraw
ICI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ICI)
from sculpter import bruit, fbm
# lecteur de chunks, mondes et mesure du classement (sans lancer le classement)
_src = open(os.path.join(ICI, 'classement_cubique.py'), encoding='utf-8').read().split('res = []')[0]
_a = sys.argv; G = {'__name__': 'classement', '__file__': os.path.join(ICI, 'classement_cubique.py')}; exec(_src, G); sys.argv = _a
MER = 62
ZONES = {   # type : plage, vase, falaise, roche, plateau ; centre de la zone du classement
    'z002': dict(nom='002 cote plage Jungle Ouest', x=-5136, z=-672, type='plage', graine=6002),
    'hum':  dict(nom='zone humide (hum)', x=3330, z=860, type='vase', graine=6100),
    'z003': dict(nom='003 cote falaise calcaire Nord', x=240, z=-5712, type='falaise', graine=6003),
    'z006': dict(nom='006 cote vase Mangroves Sud', x=-1392, z=5760, type='vase', graine=6006),
    'z001': dict(nom='001 cote plage Petite-Terre', x=3312, z=-1248, type='plage', graine=6001),
    'z008': dict(nom='008 cote roche Ile du volcan', x=-3936, z=4416, type='roche', graine=6008),
    'z010': dict(nom='010 Cote calcaire / Savane seche', x=-288, z=-3504, type='falaise', graine=6010),
    'z013': dict(nom='013 Hauts plateaux / Canyons', x=-1296, z=2144, type='plateau', graine=6013),
    'z004': dict(nom='004 cote falaise Canyons laterite', x=-3216, z=3264, type='falaise', graine=6004),
    'z009': dict(nom='009 Hauts plateaux / Benara', x=-416, z=1616, type='plateau', graine=6009),
    'z011': dict(nom='011 Friches / Marais aux spores', x=1680, z=-384, type='vase', graine=6011),
}
S0, S1, BORD = 64, 80, 8          # plein effet sur +-64, fondu jusqu'a +-80, marge de lecture 8
def ss(a, b, v):
    if a == b: return 1.0 if v >= b else 0.0
    t = max(0.0, min(1.0, (v - a) / (b - a))); return t * t * (3 - 2 * t)
def flou(H, r, n):
    h, w = len(H), len(H[0])
    for _ in range(n):
        A = [[0.0] * w for _ in range(h)]
        for z in range(h):
            L = H[z]; s = sum(L[max(0, min(w - 1, k))] for k in range(-r, r + 1))
            for x in range(w):
                A[z][x] = s / (2 * r + 1)
                s += L[min(w - 1, x + r + 1)] - L[max(0, x - r)]
        B = [[0.0] * w for _ in range(h)]
        for x in range(w):
            s = sum(A[max(0, min(h - 1, k))][x] for k in range(-r, r + 1))
            for z in range(h):
                B[z][x] = s / (2 * r + 1)
                s += A[min(h - 1, z + r + 1)][x] - A[max(0, z - r)][x]
        H = B
    return H
def distance(src, w, h):
    """distance de chanfrein (blocs) a la cellule source la plus proche"""
    INF = 1e9; D = [[0.0 if src[z][x] else INF for x in range(w)] for z in range(h)]
    for z in range(h):
        for x in range(w):
            v = D[z][x]
            if x: v = min(v, D[z][x - 1] + 1)
            if z: v = min(v, D[z - 1][x] + 1)
            if x and z: v = min(v, D[z - 1][x - 1] + 1.414)
            if z and x < w - 1: v = min(v, D[z - 1][x + 1] + 1.414)
            D[z][x] = v
    for z in range(h - 1, -1, -1):
        for x in range(w - 1, -1, -1):
            v = D[z][x]
            if x < w - 1: v = min(v, D[z][x + 1] + 1)
            if z < h - 1: v = min(v, D[z + 1][x] + 1)
            if x < w - 1 and z < h - 1: v = min(v, D[z + 1][x + 1] + 1.414)
            if z < h - 1 and x: v = min(v, D[z + 1][x - 1] + 1.414)
            D[z][x] = v
    return D
def protege(regions, x, z):
    for l in regions['lots']:
        m = l.get('marge_blocs', 0) + 8
        if l['x1'] - m <= x < l['x2'] + m and l['z1'] - m <= z < l['z2'] + m: return True
    for r in regions['routes']:
        lim = r.get('largeur_blocs', 14) / 2 + r.get('bas_cotes_blocs', 10) + r.get('talus_blocs', 20) + 16
        P = r['points']
        for (ax, az), (bx, bz) in zip(P, P[1:]):
            dx, dz = bx - ax, bz - az; L2 = dx * dx + dz * dz or 1
            t = max(0, min(1, ((x - ax) * dx + (z - az) * dz) / L2))
            if math.hypot(x - ax - t * dx, z - az - t * dz) < lim: return True
    return False
def lire_zone(cx0, cz0, R):
    for m in G['MONDES']:
        G['R'] = R; r = G['carte'](m, cx0, cz0)
        if r: return m, r
    return None, None
def sculpter(cle):
    Z = ZONES[cle]; cx0, cz0, typ, gr = Z['x'], Z['z'], Z['type'], Z['graine']
    RR = S1 + BORD
    monde, r = lire_zone(cx0, cz0, RR)
    if not monde: raise SystemExit('%s : aucun monde ne couvre +-%d blocs' % (cle, RR))
    Hd, Ed = r; N = 2 * RR; X0, Z0 = cx0 - RR, cz0 - RR
    H = [[float(Hd[(X0 + i, Z0 + k)]) for i in range(N)] for k in range(N)]
    E = [[Ed[(X0 + i, Z0 + k)] for i in range(N)] for k in range(N)]
    terre0 = [[not E[k][i] for i in range(N)] for k in range(N)]
    Hs = flou(H, 2, 3)
    # trait de cote rendu irregulier (+-6 blocs au plus) : distance signee a la cote + bruit ; la classe de la carte reste la meme a l'echelle du pixel
    dl0 = distance(E, N, N); dw0 = distance(terre0, N, N)
    cw = fbm(N, N, 19, gr + 50, 3); cw2 = bruit(N, N, 5, gr + 60)
    # petites mares (< 400 colonnes) : laissees telles quelles, seul le trait de cote de la mer est decoupe
    comp = [[0] * N for _ in range(N)]; petit = set(); nc = 0
    for k in range(N):
        for i in range(N):
            if E[k][i] and not comp[k][i]:
                nc += 1; pile = [(k, i)]; comp[k][i] = nc; cel = []
                while pile:
                    a_, b_ = pile.pop(); cel.append((a_, b_))
                    for da, db in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        u, v = a_ + da, b_ + db
                        if 0 <= u < N and 0 <= v < N and E[u][v] and not comp[u][v]: comp[u][v] = nc; pile.append((u, v))
                if len(cel) < 400: petit.add(nc)
    loinmer = distance([[E[k][i] and comp[k][i] not in petit for i in range(N)] for k in range(N)], N, N)
    terre = [[(terre0[k][i] if (loinmer[k][i] > 9 or (E[k][i] and comp[k][i] in petit)) else
               (min(dl0[k][i], 7) if terre0[k][i] else -min(dw0[k][i], 7)) + 5.5 * cw[k][i] + 1.5 * cw2[k][i] > 0.5) for i in range(N)] for k in range(N)]
    E = [[not v for v in l] for l in terre]
    for k in range(N):
        for i in range(N):
            if terre[k][i] and not terre0[k][i]: Hs[k][i] = max(Hs[k][i], MER + 0.6)
            if not terre[k][i] and terre0[k][i]: Hs[k][i] = min(Hs[k][i], MER - 2.0)
    if typ in ('falaise', 'roche', 'plateau'):   # falaises gardees raides : flou leger la ou la pente est forte, pour garder la hauteur du mur
        Hl = flou(H, 1, 1)
        S0_ = [[0.5 * math.hypot(Hs[k][min(N - 1, i + 1)] - Hs[k][max(0, i - 1)], Hs[min(N - 1, k + 1)][i] - Hs[max(0, k - 1)][i]) for i in range(N)] for k in range(N)]
        for k in range(N):
            for i in range(N):
                if terre[k][i] and terre0[k][i]:
                    w_ = ss(0.45, 1.0, S0_[k][i]); Hs[k][i] += (Hl[k][i] - Hs[k][i]) * w_
    # deformation de domaine : les lignes de niveau ne suivent plus les axes ni les pixels de 12 blocs de la carte
    wx = fbm(N, N, 22, gr + 70, 3); wz = fbm(N, N, 22, gr + 71, 3)
    def bil(A, x, z):
        x = max(0.0, min(N - 1.001, x)); z = max(0.0, min(N - 1.001, z)); i0, k0 = int(x), int(z); fx, fz = x - i0, z - k0
        return (A[k0][i0] * (1 - fx) + A[k0][i0 + 1] * fx) * (1 - fz) + (A[k0 + 1][i0] * (1 - fx) + A[k0 + 1][i0 + 1] * fx) * fz
    Hs = [[bil(Hs, i + 6 * wx[k][i], k + 6 * wz[k][i]) for i in range(N)] for k in range(N)]
    S = [[0.5 * math.hypot(Hs[k][min(N - 1, i + 1)] - Hs[k][max(0, i - 1)], Hs[min(N - 1, k + 1)][i] - Hs[max(0, k - 1)][i]) for i in range(N)] for k in range(N)]
    f64 = fbm(N, N, 64, gr + 80, 2); f16 = fbm(N, N, 16, gr + 81, 2); f6 = bruit(N, N, 6, gr + 82); f4 = bruit(N, N, 4, gr + 83)
    dl = distance(E, N, N); dw = distance(terre, N, N)
    n1 = fbm(N, N, 26, gr); n2 = fbm(N, N, 7, gr + 10, 3); n3 = bruit(N, N, 2.6, gr + 20)
    rav = fbm(N, N, 13, gr + 30, 3); chn = fbm(N, N, 21, gr + 40, 3)
    fal = {'falaise': 1.0, 'roche': 0.9, 'plateau': 1.0, 'plage': 0.5, 'vase': 0.4}[typ]
    T = [[0.0] * N for _ in range(N)]
    WC = [[fal * ss(0.55, 1.3, S[k][i]) if terre[k][i] else 0.0 for i in range(N)] for k in range(N)]
    for k in range(N):
        for i in range(N):
            h, s = Hs[k][i], S[k][i]
            if terre[k][i]:
                mo = 1.8 * f64[k][i] + 1.0 * f16[k][i] + 0.85 * f6[k][i] + 0.55 * f4[k][i]        # bruit de 4 a 64 blocs
                t = h + (1 - 0.7 * WC[k][i]) * mo * ss(0, 6, dl[k][i]) + (0.3 + 0.9 * WC[k][i]) * n3[k][i]   # falaises : rebord dechiquete
                t -= 1.8 * max(0.0, 1 - abs(rav[k][i]) * 7) ** 2 * ss(0.12, 0.6, s)              # ravines sur les pentes
                wc = WC[k][i]
                if wc > 0:                                                                       # strates : banquettes de 3-4 blocs, bords irreguliers
                    ep = 3.6; u = (h + 2.4 * n1[k][i]) / ep; f = u - math.floor(u)
                    st = (math.floor(u) + ss(0.3, 0.7, f)) * ep - 2.4 * n1[k][i] + 0.4 * n3[k][i]
                    t += (st - t) * 0.85 * wc
                if typ == 'roche': t += 6 * max(0.0, n3[k][i] - 0.62) * ss(0.1, 0.5, s + 0.2)    # blocs epars
                if typ == 'plage' and dl[k][i] < 16 and h < 72:                                  # plage en pente douce
                    cible = MER + 0.5 + 0.22 * dl[k][i] + 0.3 * n2[k][i] + 0.45 * n3[k][i] + 0.4 * f4[k][i]
                    t += (min(cible, t + 2.5) - t) * ss(16, 4, dl[k][i])
                if typ == 'vase' and h < 66.5:                                                   # vasiere : buttes, chenaux en eau
                    cible = MER + 1.3 + 0.8 * f16[k][i] + 0.75 * f6[k][i] + 0.7 * f4[k][i] + 0.6 * n3[k][i]
                    q = ss(0.13, 0.03, abs(chn[k][i])) if dl[k][i] > 3 else 0.0                 # chenal a berges douces
                    cible += (MER - 1.4 - cible) * q
                    t += (cible - t) * ss(66.5, 63.5, h)
                T[k][i] = t
            else:
                t = h + 0.4 * n2[k][i]
                if typ in ('plage', 'vase') and dw[k][i] < 18:                                   # avant-cote douce (plage) / vasiere immergee
                    pente = 0.32 if typ == 'plage' else 0.15
                    cible = MER - 0.7 - pente * dw[k][i] + 0.4 * n2[k][i]
                    t += (max(cible, h - 6) - t) * 0.9 * ss(18, 0, dw[k][i])
                T[k][i] = min(MER - 1.0, t)
    # eboulis au pied des pentes strates
    T2 = [l[:] for l in T]
    for k in range(N):
        for i in range(N):
            if not terre[k][i] or S[k][i] > 0.6: continue
            D = 0.0
            for dk in range(-5, 6):
                for di in range(-5, 6):
                    kk, ii = k + dk, i + di
                    if 0 <= kk < N and 0 <= ii < N and WC[kk][ii] > 0.3:
                        d = math.hypot(di, dk)
                        if d <= 6: D = max(D, (Hs[kk][ii] - Hs[k][i]) * WC[kk][ii] * (1 - d / 6.5))
            if D > 0: T2[k][i] += min(3.5, 0.3 * D * (0.6 + 0.4 * n3[k][i]))
    T = T2
    # classe de la carte gardee : terre >= 62 (sauf chenaux de vasiere), mer <= 61
    for k in range(N):
        for i in range(N):
            if terre[k][i] and not (typ == 'vase' and T[k][i] < MER - 0.9): T[k][i] = max(MER + 0.0, T[k][i])
    # marches de 2 blocs ou plus adoucies hors falaises voulues (les murs de 4 blocs et plus sont gardes)
    def classe():
        for k in range(N):
            for i in range(N):
                if terre[k][i] and not (typ == 'vase' and T[k][i] < MER - 0.9): T[k][i] = max(MER + 0.0, T[k][i])
                elif not terre[k][i]: T[k][i] = min(MER - 1.0, T[k][i])
    for _ in range(30):
        for k in range(N):
            for i in range(N):
                for kk, ii in ((k, i + 1), (k + 1, i), (k + 1, i + 1), (k + 1, i - 1)):
                    if kk >= N or ii >= N or ii < 0 or WC[k][i] > 0.25 or WC[kk][ii] > 0.25: continue
                    d = T[kk][ii] - T[k][i]; lim = 0.85 if kk == k or ii == i else 1.2
                    if lim < abs(d) < 4.5:
                        e = (abs(d) - lim) / 2 * (1 if d > 0 else -1); T[k][i] += e; T[kk][ii] -= e
        classe()
    # masque : plein sur +-64, fondu cosinus jusqu'a +-80, nul dans les lots et pres des routes
    regions = json.load(open(os.path.join(ICI, '..', 'branche-relief', 'regions-v3k.json'), encoding='utf-8'))
    W = 2 * S1; SX0, SZ0 = cx0 - S1, cz0 - S1
    Hout = [[0.0] * W for _ in range(W)]; M = [[0.0] * W for _ in range(W)]; npro = 0
    for k in range(W):
        for i in range(W):
            x, z = SX0 + i, SZ0 + k; d = max(abs(x - cx0 + 0.5), abs(z - cz0 + 0.5))
            m = 1.0 if d <= S0 else 0.5 + 0.5 * math.cos(math.pi * min(1.0, (d - S0) / (S1 - S0)))
            if m > 0 and protege(regions, x, z): m = 0.0; npro += 1
            Hout[k][i] = T[k + BORD][i + BORD]; M[k][i] = m
    # mesure avant/apres sur la fenetre du classement (+-64), au bloc pres
    G['R'] = 64
    av = G['mesure'](Hd, Ed, cx0, cz0)
    Hn = dict(Hd); En = dict(Ed)
    for k in range(W):
        for i in range(W):
            x, z = SX0 + i, SZ0 + k; v = round(Hout[k][i] * M[k][i] + Hd[(x, z)] * (1 - M[k][i]))
            Hn[(x, z)] = v; En[(x, z)] = v <= MER - 1 or (Ed[(x, z)] and v <= MER)
    ap = G['mesure'](Hn, En, cx0, cz0)
    out = os.path.join(ICI, cle); os.makedirs(out, exist_ok=True)
    img = Image.new('I;16', (W, W)); img.putdata([int(max(0, v) * 256) for l in Hout for v in l]); img.save(os.path.join(out, 'hauteur.png'))
    mi = Image.new('L', (W, W)); mi.putdata([int(v * 255) for l in M for v in l]); mi.save(os.path.join(out, 'masque.png'))
    rendu(Z, Hd, Ed, Hn, En, cx0, cz0, os.path.join(out, 'rendu.png'), monde)
    res = dict(zone=cle, nom=Z['nom'], type=typ, x0=SX0, z0=SZ0, taille=W, monde=os.path.basename(monde) + (' (ancienne generation 0.7.3)' if 'ile_test_1' in monde else ''),
               colonnes_protegees=npro, avant=av, apres=ap)
    json.dump(res, open(os.path.join(out, 'mesure.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(cle, res['monde'], 'avant', av and av['score'], 'apres', ap and ap['score'], 'protegees', npro, flush=True)
    return res
def teinte(y, eau, o):
    if eau: c = (40, 110 + min(60, max(0, (y - 50) * 8)), 170)
    else:
        t = max(0, min(1, (y - 60) / 60)); c = (int(110 + 120 * t), int(150 + 40 * t), int(80 + 120 * t))
    return tuple(int(min(255, max(0, v * o))) for v in c)
def dessus(H, E, cx0, cz0, s):
    R = S1; im = Image.new('RGB', (2 * R * s, 2 * R * s)); dr = ImageDraw.Draw(im)
    for x in range(cx0 - R, cx0 + R):
        for z in range(cz0 - R, cz0 + R):
            y = H[(x, z)]
            gx = H.get((x + 1, z), y) - H.get((x - 1, z), y); gz = H.get((x, z + 1), y) - H.get((x, z - 1), y)
            o = max(0.35, min(1.25, 0.85 - 0.12 * gx + 0.1 * gz))
            dr.rectangle([(x - cx0 + R) * s, (z - cz0 + R) * s, (x - cx0 + R) * s + s - 1, (z - cz0 + R) * s + s - 1], fill=teinte(y, E[(x, z)], o))
    for k in (S1 - S0, S1 + S0): dr.rectangle([(S1 - S0) * s, (S1 - S0) * s, (S1 + S0) * s, (S1 + S0) * s], outline=(255, 255, 255))
    return im
def rendu(Z, Hd, Ed, Hn, En, cx0, cz0, f, monde):
    s = 3; A = dessus(Hd, Ed, cx0, cz0, s); B = dessus(Hn, En, cx0, cz0, s); w = A.width
    rows = (-S0 // 2, 0, S0 // 2); ch = 150
    out = Image.new('RGB', (2 * w + 12, 22 + w + 20 + len(rows) * (ch + 8)), (250, 250, 250)); d = ImageDraw.Draw(out)
    d.text((4, 4), '%s (x %d, z %d) : AVANT (monde %s) | APRES sculpture. Cadre blanc = plein effet, au-dela fondu.' % (Z['nom'], cx0, cz0, os.path.basename(monde)), fill=(0, 0, 0))
    out.paste(A, (0, 22)); out.paste(B, (w + 12, 22))
    y0 = 22 + w + 20
    for j, dz in enumerate(rows):
        z = cz0 + dz
        for img_x in (0, w + 12): d.line([(img_x, 22 + (dz + S1) * s + 1), (img_x + w, 22 + (dz + S1) * s + 1)], fill=(220, 30, 30), width=2)
        xs = range(cx0 - S1, cx0 + S1)
        ys = [Hd[(x, z)] for x in xs] + [Hn[(x, z)] for x in xs]
        lo, hi = min(min(ys), MER) - 2, max(max(ys), MER + 1) + 2; k = (ch - 16) / max(12, hi - lo)
        yb = y0 + j * (ch + 8)
        d.rectangle([0, yb, 2 * w + 12, yb + ch], fill=(255, 255, 255))
        d.text((4, yb + 2), 'coupe z %d (Y %d..%d) : gris = avant, couleur = apres, bleu = eau' % (z, lo, hi), fill=(0, 0, 0))
        sx = (2 * w + 12) / (2 * S1)
        for n, x in enumerate(xs):
            px = int(n * sx); py = lambda y: yb + ch - 2 - (y - lo) * k
            a, b = Hd[(x, z)], Hn[(x, z)]
            if b < MER: d.rectangle([px, py(MER + 1), px + int(sx), py(b + 1)], fill=(120, 180, 225))
            d.rectangle([px, py(b + 1), px + int(sx), yb + ch - 2], fill=teinte(b, False, 0.9))
            d.line([(px, py(a + 1)), (px + int(sx), py(a + 1))], fill=(60, 60, 60), width=2)
    out.save(f)
if __name__ == '__main__':
    for c in sys.argv[1:]: sculpter(c)
