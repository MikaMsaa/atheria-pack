import os
from PIL import Image, ImageDraw
src = open('releve_site.py', encoding='utf-8').read().split('nom, x1, z1')[0]; exec(src)
X1, Z1, X2, Z2 = 2230, -3200, 2600, -2830
H = {}
for z in range(Z1, Z2 + 1):
    for x in range(X1, X2 + 1):
        c = chunk(x >> 4, z >> 4)
        if c is None or 'MOTION_BLOCKING_NO_LEAVES' not in c[1]: continue
        y = hauteur(c[1]['MOTION_BLOCKING_NO_LEAVES'], x, z) - 1
        H[(x, z)] = (y, bloc(c, x, y, z))
S = 2; im = Image.new('RGB', ((X2 - X1 + 1) * S, (Z2 - Z1 + 1) * S)); d = ImageDraw.Draw(im)
for (x, z), (y, b) in H.items():
    yw = H.get((x - 1, z - 1), (y, b))[0]
    sh = max(-1, min(1, (y - yw) / 3))
    g = max(0, min(255, int(110 + (y - 55) * 3 + sh * 50)))
    if 'water' in b: c = (40, 80, 170)
    elif not nat(b): c = (150, 110, 160)
    else: c = (g, g, int(g * .9))
    d.rectangle([(x - X1) * S, (z - Z1) * S, (x - X1) * S + S - 1, (z - Z1) * S + S - 1], fill=c)
for (x, z), (y, b) in H.items():
    for dx, dz in ((1, 0), (0, 1)):
        w = H.get((x + dx, z + dz))
        if w and abs(y - w[0]) >= 3 and nat(b) and nat(w[1]):
            col = (255, 40, 40) if abs(y - w[0]) >= 6 else (255, 170, 0)
            d.rectangle([(x - X1) * S, (z - Z1) * S, (x - X1) * S + S - 1, (z - Z1) * S + S - 1], fill=col)
P = lambda x, z: ((x - X1) * S, (z - Z1) * S)
d.rectangle([P(2320, -3104), P(2447, -2961)], outline=(0, 255, 255), width=2)
d.rectangle([P(2272, -3104), P(2320, -2961)], outline=(0, 160, 255), width=1)
d.line([P(2576, Z1), P(2576, Z2)], fill=(255, 0, 255), width=1)
for g in range(2300, 2600, 50): d.line([P(g, Z1), P(g, Z1 + 6)], fill=(255, 255, 0))
for g in range(-3150, -2830, 50): d.line([P(X1, g), P(X1 + 6, g)], fill=(255, 255, 0))
im.save('marches_longoni.png'); print('ok', len(H))
