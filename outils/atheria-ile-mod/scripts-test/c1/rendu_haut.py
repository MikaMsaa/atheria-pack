"""Vue de dessus (bloc de surface, ombrage) d'une zone, depuis les .mca. usage: monde x1 z1 x2 z2 sortie.png titre"""
import sys, os, hashlib
here = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, here)
import analyse_c1 as A
from PIL import Image, ImageDraw
COUL = {'grass_block': (110, 150, 70), 'sand': (219, 207, 160), 'red_sand': (190, 103, 33), 'water': (50, 90, 190), 'lava': (255, 90, 0), 'magma_block': (150, 50, 20),
 'stone': (125, 125, 125), 'andesite': (136, 136, 136), 'basalt': (80, 80, 85), 'smooth_basalt': (70, 70, 75), 'blackstone': (40, 36, 40), 'tuff': (108, 109, 102), 'gravel': (130, 124, 120),
 'dirt': (134, 96, 67), 'coarse_dirt': (119, 85, 59), 'podzol': (91, 63, 24), 'terracotta': (152, 94, 67), 'sandstone': (216, 203, 155), 'snow': (240, 240, 245), 'calcite': (223, 224, 220),
 'oak_leaves': (60, 110, 40), 'jungle_leaves': (50, 120, 30), 'acacia_leaves': (90, 120, 40), 'mangrove_leaves': (60, 110, 40), 'short_grass': (110, 150, 70), 'mud': (60, 55, 60), 'deepslate': (80, 80, 82), 'obsidian': (20, 15, 30)}
def coul(n):
    b = n.split(':')[-1]
    if b in COUL: return COUL[b]
    for k, v in COUL.items():
        if k in b: return v
    h = hashlib.md5(b.encode()).digest(); return (80 + h[0] % 120, 80 + h[1] % 120, 80 + h[2] % 120)
W, x1, z1, x2, z2, out, titre = sys.argv[1], *map(int, sys.argv[2:6]), sys.argv[6], sys.argv[7]
w, h = x2 - x1 + 1, z2 - z1 + 1
im = Image.new('RGB', (w, h), (0, 0, 0)); H = {}; px = im.load()
for cx in range(x1 >> 4, (x2 >> 4) + 1):
    for cz in range(z1 >> 4, (z2 >> 4) + 1):
        c = A.m['chunk'](W, cx, cz)
        if not c or c.get('Status') != 'minecraft:full': continue
        B = A.m['blocs'](c); S = A.hm(c, 'WORLD_SURFACE')
        for j in range(256):
            x, z = cx * 16 + (j & 15), cz * 16 + (j >> 4)
            if not (x1 <= x <= x2 and z1 <= z <= z2): continue
            y = S[j] - 1; n = 'minecraft:air'
            while y > -64:
                sec = B.get(y >> 4); n = sec[(y & 15) * 256 + (j >> 4) * 16 + (j & 15)] if sec else 'minecraft:air'
                if not n.split('[')[0].endswith(('air', 'short_grass', 'tall_grass', 'fern', 'dead_bush')): break
                y -= 1
            H[(x, z)] = y; px[x - x1, z - z1] = coul(n.split('[')[0])
for (x, z), y in H.items():
    yn = H.get((x - 1, z - 1))
    if yn is None: continue
    f = max(0.6, min(1.4, 1 + 0.12 * (y - yn)))
    r, g, b = px[x - x1, z - z1]; px[x - x1, z - z1] = (min(255, int(r * f)), min(255, int(g * f)), min(255, int(b * f)))
s = max(1, 900 // max(w, h)); im = im.resize((w * s, h * s), Image.NEAREST)
d = ImageDraw.Draw(im); d.rectangle((0, 0, im.width, 22), fill=(0, 0, 0)); d.text((6, 5), titre, fill=(255, 255, 255))
im.save(out); print(out, im.size)
