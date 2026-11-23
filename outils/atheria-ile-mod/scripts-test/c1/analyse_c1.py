"""Analyse C1 : lave/magma sur Petite-Terre (#c4b278) et biomes 9x9 avant/apres."""
import sys, os, glob, collections
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'audit'))
src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'audit', 'comparer_blocs.py'), encoding='utf-8').read().replace('\nmain()', '\n'); m = {}; exec(src, m)
from PIL import Image
CARTE = Image.open(r'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition\outils\serveur-ile-test\config\atheria_ile\carte.png').convert('RGB')
def classe(bx, bz):
    return '#%02x%02x%02x' % CARTE.getpixel((bx // 12 + 500, bz // 12 + 500))
def hm(c, cle):
    v = []
    for l in c['Heightmaps'][cle]:
        l &= (1 << 64) - 1
        for k in range(7):
            if len(v) < 256: v.append(((l >> (k * 9)) & 511) - 64)
    return v
def biomes(c):
    out = {}
    for s in c.get('sections', []):
        b = s.get('biomes')
        if not b: continue
        pal = b['palette']
        if len(pal) == 1 or 'data' not in b: out[s['Y']] = [pal[0]] * 64; continue
        bits = (len(pal) - 1).bit_length(); per = 64 // bits; mask = (1 << bits) - 1; v = []
        for L in b['data']:
            L &= (1 << 64) - 1
            for k in range(per):
                if len(v) == 64: break
                v.append(pal[(L >> (k * bits)) & mask])
        out[s['Y']] = v
    return out
def biome_at(bi, x, y, z):
    s = bi.get(y >> 4)
    if not s: return None
    return s[((y & 15) >> 2) * 16 + ((z & 15) >> 2) * 4 + ((x & 15) >> 2)]
LAVE = ('minecraft:lava', 'minecraft:magma_block')
def scan(W):
    lave = collections.Counter(); biomes_pt = collections.Counter(); n = 0; ex = []
    for f in glob.glob(os.path.join(W, 'region', 'r.*.mca')):
        rx, rz = map(int, os.path.basename(f).split('.')[1:3])
        for i in range(1024):
            cx, cz = rx * 32 + (i & 31), rz * 32 + (i >> 5)
            c = m['chunk'](W, cx, cz)
            if not c or c.get('Status') != 'minecraft:full': continue
            n += 1; B = m['blocs'](c); S = hm(c, 'WORLD_SURFACE'); bi = biomes(c)
            for j in range(256):
                x, z = cx * 16 + (j & 15), cz * 16 + (j >> 4); cl = classe(x, z); top = S[j]
                if cl == '#c4b278': biomes_pt[biome_at(bi, x, top, z)] += 1
                for y in range(max(top - 12, -64), top + 1):
                    sec = B.get(y >> 4)
                    if not sec: continue
                    b = m['base'](sec[(y & 15) * 256 + (j >> 4) * 16 + (j & 15)])
                    if b in LAVE:
                        lave[(cl, b)] += 1
                        if len(ex) < 8: ex.append((x, y, z, cl, b))
    return n, lave, biomes_pt, ex
def carre(W, x0, z0):
    out = []
    for dz in range(-4, 5):
        row = []
        for dx in range(-4, 5):
            x, z = x0 + dx * 4, z0 + dz * 4; c = m['chunk'](W, x >> 4, z >> 4)
            if not c or c.get('Status') != 'minecraft:full': row.append(None); continue
            top = hm(c, 'WORLD_SURFACE')[(z & 15) * 16 + (x & 15)]; row.append(biome_at(biomes(c), x, top, z))
        out.append(row)
    return out
if __name__ == '__main__':
    av, ap = sys.argv[1], sys.argv[2]
    for nomw, W in (('AVANT', av), ('APRES', ap)):
        n, lave, bp, ex = scan(W)
        print('==', nomw, W, 'chunks full', n)
        print(' lave/magma surface (12 blocs sous la surface) par classe :', dict(lave) or 0)
        print(' exemples', ex)
        print(' biomes en surface sur #c4b278 :', bp.most_common(8))
    for p in ((4224, -640), (3296, -704), (3096, -120)):
        a, b = carre(av, *p), carre(ap, *p)
        diff = sum(1 for r1, r2 in zip(a, b) for u, v in zip(r1, r2) if u != v)
        print('point', p, 'cellules differentes', diff, '/ 81 ; avant', collections.Counter(u for r in a for u in r).most_common(3), 'apres', collections.Counter(u for r in b for u in r).most_common(3))
