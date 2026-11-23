# Glace sur les ilots de c21 : position, biome reel (palette des biomes de la section), lien avec sculpture/ilots_sable. usage : python -I diag_glace.py <monde>
import sys, os, json, struct, zlib, math, collections
W = sys.argv[1]; ICI = os.path.dirname(os.path.abspath(sys.argv[0]))
SC = os.path.join(ICI, '..', 'sculpture'); BR = os.path.join(ICI, '..', 'branche-relief')
G = {'__file__': os.path.join(SC, 'classement_cubique.py')}
src = open(os.path.join(SC, 'classement_cubique.py'), encoding='utf-8').read().split('def vignette')[0]
_a = sys.argv; sys.argv = [sys.argv[0]]; exec(src, G); sys.argv = _a
lire = G['lire']
exec(open(os.path.join(ICI, 'emprises.py'), encoding='utf-8').read().split('CACHE = {}')[0].split('# --- monde de test')[1].split('\n',1)[1])  # nbt()
def biomes_chunk(cx, cz):
    rf = os.path.join(W, 'region', 'r.%d.%d.mca' % (cx >> 5, cz >> 5))
    with open(rf, 'rb') as f:
        f.seek(4 * ((cx & 31) + 32 * (cz & 31))); e = struct.unpack('>I', f.read(4))[0]
        f.seek((e >> 8) * 4096); ln, ct = struct.unpack('>IB', f.read(5)); raw = zlib.decompress(f.read(ln - 1))
    d, _ = nbt2(raw, 3 + struct.unpack('>H', raw[1:3])[0], 10)
    out = {}
    for s in d.get('sections', []):
        b = s.get('biomes') or {}; p = b.get('palette') or []; dat = b.get('data')
        if not p: continue
        if len(p) == 1: out[s['Y']] = [p[0]] * 64; continue
        bits = max(1, (len(p) - 1).bit_length()); per = 64 // bits; vals = []
        for L in dat:
            L &= (1 << 64) - 1
            for j in range(per): vals.append((L >> (bits * j)) & ((1 << bits) - 1))
        out[s['Y']] = [p[v] for v in vals[:64]]
    return out
def nbt2(b, i, t):
    if t == 12:
        n = struct.unpack('>i', b[i:i + 4])[0]; return list(struct.unpack('>%dq' % n, b[i + 4:i + 4 + 8 * n])), i + 4 + 8 * n
    if t == 1: return struct.unpack('>b', b[i:i + 1])[0], i + 1
    if t == 9:
        et = b[i]; n = struct.unpack('>i', b[i + 1:i + 5])[0]; i += 5; L = []
        for _ in range(n): v, i = nbt2(b, i, et); L.append(v)
        return L, i
    if t == 10:
        d = {}
        while True:
            tt = b[i]; i += 1
            if tt == 0: return d, i
            n = struct.unpack('>H', b[i:i + 2])[0]; k = b[i + 2:i + 2 + n].decode('utf-8', 'replace'); i += 2 + n
            v, i = nbt2(b, i, tt); d[k] = v
    return nbt(b, i, t)
CB = {}; CL = {}
def biome(x, y, z):
    k = (x >> 4, z >> 4)
    if k not in CB: CB[k] = biomes_chunk(*k)
    s = CB[k].get(y >> 4)
    return s[(((y & 15) >> 2) << 4) | (((z & 15) >> 2) << 2) | ((x & 15) >> 2)] if s else None
def bl(x, y, z):
    k = (x >> 4, z >> 4)
    if k not in CL: CL[k] = lire(W, *k)[1]
    L = CL[k].get((y >> 4) + 256 if y < 0 else y >> 4)
    return 'air' if L is None else L[((y & 15) << 8) | ((z & 15) << 4) | (x & 15)].split('[')[0].split(':')[-1]
reg = json.load(open(os.path.join(BR, 'regions-v3n.json'), encoding='utf-8')); rn = reg['relief_naturel']
print('ilots_sable', rn.get('ilots_sable'))
from PIL import Image
for cle in ('ileA', 'phare'):
    me = [s for s in rn['sculptures'] if '/' + cle + '/' in s['hauteur']][0]; hi = Image.open(os.path.join(SC, cle, 'hauteur.png')); mi = Image.open(os.path.join(SC, cle, 'masque.png')).convert('L')
    print(cle, 'rect', me['x0'], me['z0'], hi.size, 'ilot' in json.dumps(me), {k: me[k] for k in me if k not in ('avant', 'apres')})
for nm, (cx, cz, R) in (('Phare', (-2640, -5744, 40)), ('ilot A', (-2534, -5864, 40))):
    gl = []; bio = collections.Counter(); bioG = collections.Counter()
    for x in range(cx - R, cx + R):
        for z in range(cz - R, cz + R):
            for y in range(90, 55, -1):
                n = bl(x, y, z)
                if n in ('air', 'cave_air'): continue
                b = biome(x, y, z); bio[b] += 1
                if n in ('ice', 'packed_ice', 'snow_block', 'powder_snow', 'snow'): gl.append((x, z, y, n, b)); bioG[b] += 1
                break
    print(nm, 'biomes en surface', bio.most_common(6))
    print('  glace/neige', len(gl), 'biomes', bioG.most_common(5))
    for g in gl[:6]:
        x, z = g[0], g[1]; out = []
        for cle in ('ileA', 'phare'):
            me = [s for s in rn['sculptures'] if '/' + cle + '/' in s['hauteur']][0]; hi = Image.open(os.path.join(SC, cle, 'hauteur.png')); mi = Image.open(os.path.join(SC, cle, 'masque.png')).convert('L')
            px, pz = x - me['x0'], z - me['z0']
            if 0 <= px < hi.width and 0 <= pz < hi.height: out.append('%s haut %.1f masque %d' % (cle, hi.getpixel((px, pz)) / 256.0, mi.getpixel((px, pz))))
        ils = [round(math.hypot(x - q[0], z - q[1]) - q[2], 1) for q in rn.get('ilots_sable', [])]
        print('   ', g, out or 'HORS sculpture', 'dist bord ilots_sable', ils, 'dessous', [bl(x, yy, z) for yy in range(g[2] - 1, g[2] - 4, -1)])
    if gl:
        xs = [g[0] for g in gl]; zs = [g[1] for g in gl]; print('  boite glace x %d..%d z %d..%d' % (min(xs), max(xs), min(zs), max(zs)))
