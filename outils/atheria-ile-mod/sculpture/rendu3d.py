# Rendu 3D facon jeu (voxels isometriques, blocs visibles, lumiere) d'une sculpture : AVANT (monde de test) et APRES (hauteur.png x masque.png).
# Couleurs deduites du relief (memes regles avant et apres) : herbe, sable pres de l'eau et bas, pierre sur les pentes fortes, vase (type vase),
# eau translucide au niveau 62 sur un fond de sable / gravier. Lecture seule. usage : python -I rendu3d.py <zone> [<zone> ...]
import os, sys, json, math
from PIL import Image, ImageDraw, ImageFont
ICI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ICI)
_a = sys.argv; sys.argv = [sys.argv[0]]
import naturaliser as N
sys.argv = _a
MER = N.MER; R = N.S1
A = 4            # demi-largeur du losange d'un bloc (px)
def h01(x, z, s):
    v = (x * 374761393 + z * 668265263 + s * 2147483647) & 0xffffffff
    v = (v ^ (v >> 13)) * 1274126177 & 0xffffffff
    return (v & 0xffff) / 65535.0
PAL = {'herbe': (98, 152, 58), 'herbe2': (120, 160, 62), 'sable': (219, 205, 150), 'pierre': (125, 125, 125), 'terre': (134, 96, 67),
       'vase': (92, 78, 62), 'gravier': (136, 126, 120), 'fond': (196, 182, 128)}
def surface(H, E, x, z, typ, dlm):
    y = H[(x, z)]
    if E[(x, z)]: return 'gravier' if y < MER - 7 else 'fond'
    g = max(abs(H.get((x + a, z + b), y) - y) for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1)))
    if g >= 3: return 'pierre'
    if g == 2 and h01(x, z, 3) < 0.5: return 'pierre' if typ in ('falaise', 'roche', 'ilot', 'plateau') else 'terre'
    d = dlm.get((x, z), 99)
    if typ == 'ilot': return 'pierre' if (PIERRE_ILOT and y >= MER + 3) else 'sable'   # biome force : plage (sable) ; Phare : rivage pierreux au-dessus de 64
    if typ == 'vase' and y <= MER + 2 and d <= 10: return 'vase'
    if y <= MER + 2 and d <= (5 if typ != 'falaise' else 2): return 'sable'
    return 'herbe2' if h01(x, z, 7) < 0.3 else 'herbe'
PIERRE_ILOT = False
def ton(c, o, x, z):
    j = 0.92 + 0.16 * h01(x, z, 11)
    return tuple(int(max(0, min(255, v * o * j))) for v in c)
def vue(H, E, cx0, cz0, typ, titre):
    xs = range(cx0 - R, cx0 + R); zs = range(cz0 - R, cz0 + R)
    # distance a l'eau (approx. Chebyshev, 12 au plus) pour le sable
    dlm = {}
    eau = [(x, z) for x in xs for z in zs if E[(x, z)]]
    front = set(eau); d = 0
    for p in eau: dlm[p] = 0
    while front and d < 12:
        d += 1; nf = set()
        for (x, z) in front:
            for a in (-1, 0, 1):
                for b in (-1, 0, 1):
                    q = (x + a, z + b)
                    if q in H and q not in dlm: dlm[q] = d; nf.add(q)
        front = nf
    ys = [H[(x, z)] for x in xs for z in zs]; ylo = max(min(ys), MER - 14) - 1; yhi = max(max(ys), MER + 2); VZ = A * 1.2
    W = 2 * R * 2 * A + 40; oy = 34 + R * A + (yhi - ylo) * VZ; Hh = int(oy + R * A + 24)
    im = Image.new('RGB', (W, Hh)); dr = ImageDraw.Draw(im, 'RGBA')
    for j in range(Hh):   # ciel
        t = j / Hh; dr.line([(0, j), (W, j)], fill=(int(150 + 70 * t), int(190 + 45 * t), int(235 + 15 * t)))
    ox = W // 2
    def P(x, z, y):   # point du coin (x, z) a la hauteur y ; vue depuis le sud-est
        u, v = x - cx0, z - cz0
        return (ox + (u - v) * A, oy + (u + v) * A / 2 - (max(y, ylo) - ylo) * VZ)
    def colonne(x, z, y, c, lumx, lumz):
        top = [P(x, z, y + 1), P(x + 1, z, y + 1), P(x + 1, z + 1, y + 1), P(x, z + 1, y + 1)]
        # ombre portee douce : voisin nord-ouest plus haut
        ao = 1.0 - 0.07 * max(0, min(3, H.get((x - 1, z, ), y) - y)) - 0.07 * max(0, min(3, H.get((x, z - 1), y) - y))
        dr.polygon(top, fill=ton(c, 1.0 * ao, x, z))
        for (nx, nz, a, b, lum) in ((x + 1, z, (x + 1, z), (x + 1, z + 1), lumx), (x, z + 1, (x, z + 1), (x + 1, z + 1), lumz)):
            yn = H.get((nx, nz), ylo - 1)
            if (nx, nz) not in H: yn = ylo - 1
            if yn >= y: continue
            yb = max(yn, ylo - 1) + 1
            cf = PAL['terre'] if c in (PAL['herbe'], PAL['herbe2']) else c
            face = [P(*a, y + 1), P(*b, y + 1), P(*b, yb), P(*a, yb)]
            dr.polygon(face, fill=ton(cf, lum, x, z))
            if c in (PAL['herbe'], PAL['herbe2']):   # liseré d'herbe en haut de la face
                dr.polygon([P(*a, y + 1), P(*b, y + 1), P(*b, y + 0.8), P(*a, y + 0.8)], fill=ton(c, lum, x, z))
            for yy in range(yb + 1, y + 1):           # joints des blocs
                dr.line([P(*a, yy), P(*b, yy)], fill=(0, 0, 0, 40))
        dr.line([top[0], top[1], top[2], top[3], top[0]], fill=(0, 0, 0, 28))
    for s in range(0, 4 * R - 1):                    # du fond (nord-ouest) vers l'avant
        for x in range(cx0 - R, cx0 + R):
            z = cz0 - R + s - (x - (cx0 - R))
            if not (cz0 - R <= z < cz0 + R): continue
            y = max(H[(x, z)], ylo); c = PAL[surface(H, E, x, z, typ, dlm)]
            colonne(x, z, y, c, 0.78, 0.62)
            if E[(x, z)] or y < MER:                 # eau translucide
                top = [P(x, z, MER), P(x + 1, z, MER), P(x + 1, z + 1, MER), P(x, z + 1, MER)]
                prof = MER - y
                dr.polygon(top, fill=(40, 95, 200, int(min(215, 105 + prof * 14))))
                if (x + 1, z) in H and not (E[(x + 1, z)] or H[(x + 1, z)] < MER) and h01(x, z, 5) < 0.6:
                    dr.line([P(x + 1, z, MER), P(x + 1, z + 1, MER)], fill=(235, 245, 255, 150))
    f = ImageFont.load_default()
    dr.rectangle([0, 0, W, 22], fill=(0, 0, 0, 120)); dr.text((8, 5), titre, fill=(255, 255, 255), font=f)
    return im
def faire(cle):
    global PIERRE_ILOT
    Z = N.ZONES[cle]; cx0, cz0 = Z['x'], Z['z']; out = os.path.join(ICI, cle); PIERRE_ILOT = False
    mes = json.load(open(os.path.join(out, 'mesure.json'), encoding='utf-8'))
    monde, r = N.lire_zone(cx0, cz0, R)
    Hd, Ed = r
    for k in list(Hd):
        if Hd[k] < 0: Hd[k] = MER - 5; Ed[k] = True
    hi = Image.open(os.path.join(out, 'hauteur.png')); mi = Image.open(os.path.join(out, 'masque.png'))
    hv = list(hi.getdata()); mv = list(mi.getdata()); Wd = hi.width; SX0, SZ0 = mes['x0'], mes['z0']
    Hn = dict(Hd); En = dict(Ed)
    for k in range(Wd):
        for i in range(Wd):
            x, z = SX0 + i, SZ0 + k; m = mv[k * Wd + i] / 255.0
            v = round(hv[k * Wd + i] / 256.0 * m + Hd[(x, z)] * (1 - m)); Hn[(x, z)] = v; En[(x, z)] = v <= MER - 1 or (Ed[(x, z)] and v <= MER)
    sa = mes['avant']['score'] if mes.get('avant') else None; sp = mes['apres']['score'] if mes.get('apres') else None
    a = vue(Hd, Ed, cx0, cz0, Z['type'], 'AVANT  %s  (x %d, z %d)  score cubique %s' % (Z['nom'], cx0, cz0, sa))
    PIERRE_ILOT = bool(Z.get('biome_terre'))
    b = vue(Hn, En, cx0, cz0, Z['type'], 'APRES sculpture  %s  score cubique %s   (vue 3D facon jeu, depuis le sud-est, 160 x 160 blocs)' % (Z['nom'], sp))
    im = Image.new('RGB', (a.width, a.height + b.height + 6), (20, 20, 20)); im.paste(a, (0, 0)); im.paste(b, (0, a.height + 6))
    im.save(os.path.join(out, 'rendu3d.png')); b.save(os.path.join(out, 'rendu3d-apres.png'))
    print(cle, 'rendu3d', im.size, flush=True)
if __name__ == '__main__':
    for c in sys.argv[1:]: faire(c)
