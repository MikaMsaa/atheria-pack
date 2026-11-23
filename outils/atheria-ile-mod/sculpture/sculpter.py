# 0.9.5d : sculpture de relief par lieu, hors ligne (Python pur + Pillow, sans numpy).
# Produit pour un lieu : une carte de hauteur au bloc pres (PNG 16 bits, valeur = Y * 256), un masque de fondu,
# et un rendu de controle (dessus ombre + 3 coupes) a montrer AVANT tout essai en jeu.
# usage : python -I sculpter.py <lieu>
import sys, os, math, random
from PIL import Image, ImageDraw

ICI = os.path.dirname(os.path.abspath(__file__))
MER = 62  # derniere couche d'eau

def grille(w, h, v=0.0): return [[v] * w for _ in range(h)]

def bruit(w, h, echelle, graine):
    """bruit de valeur lisse (interpolation smoothstep) dans [-1, 1]"""
    rnd = random.Random(graine)
    gw, gh = int(w / echelle) + 3, int(h / echelle) + 3
    g = [[rnd.uniform(-1, 1) for _ in range(gw)] for _ in range(gh)]
    out = grille(w, h)
    for z in range(h):
        fz = z / echelle; iz = int(fz); tz = fz - iz; tz = tz * tz * (3 - 2 * tz)
        for x in range(w):
            fx = x / echelle; ix = int(fx); tx = fx - ix; tx = tx * tx * (3 - 2 * tx)
            a = g[iz][ix] * (1 - tx) + g[iz][ix + 1] * tx
            b = g[iz + 1][ix] * (1 - tx) + g[iz + 1][ix + 1] * tx
            out[z][x] = a * (1 - tz) + b * tz
    return out

def fbm(w, h, echelle, graine, octaves=4):
    s = grille(w, h); a = 1.0; t = 0
    for o in range(octaves):
        b = bruit(w, h, max(1.5, echelle / 2 ** o), graine + o)
        for z in range(h):
            for x in range(w): s[z][x] += a * b[z][x]
        t += a; a *= 0.5
    return [[v / t for v in l] for l in s]

def lisser(H, n=2, mer=MER):
    """adoucit les marches (moyenne 3x3 ponderee), en gardant les bords"""
    h, w = len(H), len(H[0])
    for _ in range(n):
        N = grille(w, h)
        for z in range(h):
            for x in range(w):
                s = 0; k = 0
                for dz in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        zz, xx = min(h - 1, max(0, z + dz)), min(w - 1, max(0, x + dx))
                        p = 2 if dx == 0 and dz == 0 else 1
                        s += p * H[zz][xx]; k += p
                N[z][x] = s / k
        H = N
    return H

def ilot_sable(w=96, h=56, graine=5301):
    """ilot de sable blanc en croissant (facon ilots de sable de Mayotte) : banc qui affleure, plage tres douce, pied dans le lagon"""
    f1, f2 = fbm(w, h, 18, graine), fbm(w, h, 5, graine + 10)
    cx, cz = w / 2, h / 2
    H = grille(w, h); M = grille(w, h)
    for z in range(h):
        for x in range(w):
            # corps du banc (ellipse inclinee), fleche de sable qui s'effile vers l'est, echancrure cote lagon
            u = (x - cx) * 0.94 + (z - cz) * 0.34; v = -(x - cx) * 0.34 + (z - cz) * 0.94
            e1 = (u / (w * 0.30)) ** 2 + (v / (h * 0.20)) ** 2
            fl = max(0.0, u - w * 0.12) / (w * 0.30)
            e3 = (fl * 1.0) ** 2 + ((v + fl * h * 0.10) / (h * 0.08 * (1.2 - fl))) ** 2 if u > w * 0.12 else 9
            e2 = ((u + w * 0.05) / (w * 0.16)) ** 2 + ((v - h * 0.20) / (h * 0.12)) ** 2
            d = max(1 - e1, 0.7 * (1 - e3)) - 0.35 * max(0.0, 1 - e2) + 0.30 * f1[z][x] + 0.08 * f2[z][x]
            # dessus bas (Y 63, crete 64), plage tres douce, pied a 4-6 blocs sous l'eau
            y = MER + 0.6 + 1.6 * min(d, 0.5) / 0.5 if d > 0 else MER + 0.6 + 5 * d
            H[z][x] = max(56.0, min(64.4, y))
            M[z][x] = max(0.0, min(1.0, (d + 0.55) / 0.35))
    return lisser(H, 2), M

LIEUX = {'ileA': dict(fn=ilot_sable, x0=-2582, z0=-5892, nom="Ilot de sable A (lagon, centre -2534 -5864)")}

def couleur(y, ombre):
    if y <= MER:
        p = min(1.0, (MER + 0.5 - y) / 7)
        c = (120 * (1 - p) + 30 * p, 215 * (1 - p) + 120 * p, 205 * (1 - p) + 150 * p)
    elif y <= MER + 2: c = (235, 228, 200)
    else: c = (215, 210, 175)
    return tuple(int(max(0, min(255, v * ombre))) for v in c)

def rendus(nom, H, M, sortie, s=6):
    h, w = len(H), len(H[0])
    B = [[round(v) for v in l] for l in H]   # au bloc pres : ce que le jeu posera
    dessus = Image.new('RGB', (w * s, h * s)); dr = ImageDraw.Draw(dessus)
    for z in range(h):
        for x in range(w):
            gx = B[z][min(w - 1, x + 1)] - B[z][max(0, x - 1)]; gz = B[min(h - 1, z + 1)][x] - B[max(0, z - 1)][x]
            dr.rectangle([x * s, z * s, x * s + s - 1, z * s + s - 1], fill=couleur(B[z][x], max(0.4, min(1.2, 0.85 - 0.25 * gx + 0.2 * gz))))
    for k in range(0, w, 16): dr.line([(k * s, 0), (k * s, h * s)], fill=(0, 0, 0))
    for k in range(0, h, 16): dr.line([(0, k * s), (w * s, k * s)], fill=(0, 0, 0))
    ch = 130
    coupes = Image.new('RGB', (w * s, ch * 3 + 10), (245, 245, 245)); dc = ImageDraw.Draw(coupes)
    for i, zz in enumerate((h // 4, h // 2, 3 * h // 4)):
        y0 = 4 + i * ch
        for x in range(w):
            top = B[zz][x]
            for yy in range(50, 70):
                py = y0 + (70 - yy) * 6
                if yy <= top: c = (220, 210, 170) if yy >= top - 1 else (150, 140, 120)
                elif yy <= MER: c = (90, 170, 200)
                else: continue
                dc.rectangle([x * s, py, x * s + s - 1, py + 5], fill=c)
        dc.text((4, y0), 'coupe z+%d  (Y 50..70, eau jusqu a Y %d)' % (zz, MER), fill=(0, 0, 0))
        dr.line([(0, zz * s + s // 2), (w * s, zz * s + s // 2)], fill=(200, 30, 30), width=2)
    out = Image.new('RGB', (w * s, h * s + coupes.height + 20), (255, 255, 255))
    ImageDraw.Draw(out).text((4, 4), nom + '  (1 case = 1 bloc, quadrillage 16 blocs)', fill=(0, 0, 0))
    out.paste(dessus, (0, 20)); out.paste(coupes, (0, 20 + h * s))
    out.save(os.path.join(sortie, 'rendu.png'))
    img = Image.new('I;16', (w, h)); img.putdata([int(v * 256) for l in H for v in l]); img.save(os.path.join(sortie, 'hauteur.png'))
    m = Image.new('L', (w, h)); m.putdata([int(v * 255) for l in M for v in l]); m.save(os.path.join(sortie, 'masque.png'))
    marches = sum(1 for z in range(h) for x in range(w - 1) if abs(B[z][x + 1] - B[z][x]) >= 2) + sum(1 for z in range(h - 1) for x in range(w) if abs(B[z + 1][x] - B[z][x]) >= 2)
    return dict(min=min(map(min, B)), max=max(map(max, B)), emerge=sum(1 for l in B for v in l if v > MER), colonnes=w * h, marches_2plus=marches)

if __name__ == '__main__':
    lieu = sys.argv[1] if len(sys.argv) > 1 else 'ileA'
    L = LIEUX[lieu]
    H, M = L['fn']()
    sortie = os.path.join(ICI, lieu); os.makedirs(sortie, exist_ok=True)
    st = rendus(L['nom'], H, M, sortie)
    open(os.path.join(sortie, 'lieu.txt'), 'w', encoding='utf-8').write('%s\nx0 %d z0 %d taille %dx%d\n%s\n' % (L['nom'], L['x0'], L['z0'], len(H[0]), len(H), st))
    print(lieu, st)
