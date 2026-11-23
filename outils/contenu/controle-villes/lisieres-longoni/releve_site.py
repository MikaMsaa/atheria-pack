# Releve au pas de 4 sur la carte finale (lecture seule) : x,z,sol_y,surface_y,eau_profondeur,construit,bloc_surface
import sys, struct, zlib, io, csv, os
exec(open(os.path.join(os.path.dirname(__file__), 'recadrer_nbt.py'), encoding='utf-8').read().split('src, dst, x0')[0])
REG = r'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition\outils\mondes-cloud\carte-finale\monde\region'
cache = {}
def chunk(cx, cz):
    if (cx, cz) in cache: return cache[(cx, cz)]
    rx, rz = cx >> 5, cz >> 5
    try: f = open(f'{REG}/r.{rx}.{rz}.mca', 'rb')
    except FileNotFoundError: cache[(cx, cz)] = None; return None
    h = f.read(4096); i = 4 * ((cx & 31) + (cz & 31) * 32); off = int.from_bytes(h[i:i+3], 'big')
    if off == 0: cache[(cx, cz)] = None; return None
    f.seek(off * 4096); ln, ty = struct.unpack('>IB', f.read(5)); d = zlib.decompress(f.read(ln - 1))
    g = io.BytesIO(d); g.read(1); g.read(struct.unpack('>H', g.read(2))[0]); t = lire(g, 10)[1]
    secs = {}
    for s in t['sections'][1][2]:
        s = s[1]
        if 'block_states' not in s: continue
        bs = s['block_states'][1][1]; pal = [p[1]['Name'][1] for p in bs['palette'][1][2]]
        data = bs['data'][1] if 'data' in bs else None
        if isinstance(data, tuple): data = data[-1]
        secs[s['Y'][1]] = (pal, data)
    H = t['Heightmaps'][1][1] if 'Heightmaps' in t else {}
    hm = {k: H[k][1][1] for k in ('WORLD_SURFACE', 'OCEAN_FLOOR', 'MOTION_BLOCKING_NO_LEAVES') if k in H}
    cache[(cx, cz)] = (secs, hm); return cache[(cx, cz)]
def bloc(c, x, y, z):
    s = c[0].get(y >> 4)
    if s is None: return 'minecraft:air'
    pal, data = s
    if data is None: return pal[0]
    bits = max(4, (len(pal) - 1).bit_length()); per = 64 // bits
    idx = ((y & 15) * 256 + (z & 15) * 16 + (x & 15)); v = data[idx // per]
    if v < 0: v += 1 << 64
    return pal[(v >> ((idx % per) * bits)) & ((1 << bits) - 1)]
def hauteur(arr, x, z):
    i = (z & 15) * 16 + (x & 15); v = arr[i // 7]
    if v < 0: v += 1 << 64
    return ((v >> ((i % 7) * 9)) & 511) - 64
NAT = ('grass_block', 'dirt', 'sand', 'stone', 'gravel', 'clay', 'mud', 'podzol', 'coarse_dirt', 'rooted_dirt', 'sandstone', 'terracotta', 'deepslate', 'tuff', 'andesite', 'diorite', 'granite', 'calcite', 'moss_block', 'snow', 'basalt', 'blackstone', 'mycelium', 'farmland', 'dirt_path', 'red_sand', 'packed_mud', 'dried_salt')
def nat(b):
    n = b.split(':')[-1]
    return any(n == k or n.endswith('_' + k) or n.startswith(k) for k in NAT) and 'concrete' not in n and 'brick' not in n and 'polished' not in n
nom, x1, z1, x2, z2 = sys.argv[1], *map(int, sys.argv[2:6])
out = sys.argv[6]
w = csv.writer(open(out, 'w', newline='', encoding='utf-8')); w.writerow(['x', 'z', 'sol_y', 'surface_y', 'eau_profondeur', 'construit', 'bloc_surface'])
n = 0
for z in range(z1, z2 + 1, 4):
    for x in range(x1, x2 + 1, 4):
        c = chunk(x >> 4, z >> 4)
        if c is None or 'WORLD_SURFACE' not in c[1]: continue
        ys = hauteur(c[1]['WORLD_SURFACE'], x, z) - 1
        yf = hauteur(c[1]['OCEAN_FLOOR'], x, z) - 1 if 'OCEAN_FLOOR' in c[1] else ys
        top = bloc(c, x, ys, z)
        eau = 0
        if 'water' in top or 'kelp' in top or 'seagrass' in top: eau = max(1, ys - yf)
        # sol naturel : descendre sous le bati et la vegetation
        y = yf; b = bloc(c, x, y, z); k = 0
        while y > -60 and not nat(b) and k < 60:
            y -= 1; k += 1; b = bloc(c, x, y, z)
        construit = 1 if (k > 2 and eau == 0) else 0
        w.writerow([x, z, y, ys, eau, construit, top.split(':')[-1]]); n += 1
print(nom, n, 'points')
