# QC hors ligne c19 : 0.9.5 (v3k) contre 0.9.4i (v3j). usage : python -I qc_c19.py <monde_ref> <monde_k>
import sys, os, struct, zlib, collections
REF, K = sys.argv[1], sys.argv[2]
ICI = os.path.dirname(os.path.abspath(sys.argv[0]))
src = open(os.path.join(ICI, 'comparer_chunks.py')).read().split('mondes=args')[0]
src = src.replace("sys.argv,args=[sys.argv[0],'x'],sys.argv[1:]", "args=[]").replace("os.path.dirname(os.path.abspath(__file__))", repr(ICI))
_a = sys.argv; exec(src); sys.argv = _a
ZONES = {'lagon': (-2514, -5850, 160), 'ileA': (-2560, -5864, 64), 'sec': (-288, -3504, 128), 'hum': (3330, 860, 128)}
def chunks(cx0, cz0, R):
    for cx in range((cx0 - R) >> 4, (cx0 + R) >> 4):
        for cz in range((cz0 - R) >> 4, (cz0 + R) >> 4):
            yield cx, cz
def biomes(w, cx, cz):
    rf = os.path.join(w, 'region', 'r.%d.%d.mca' % (cx >> 5, cz >> 5))
    if not os.path.exists(rf): return None
    with open(rf, 'rb') as f:
        f.seek(4 * ((cx & 31) + 32 * (cz & 31))); e = struct.unpack('>I', f.read(4))[0]
        if not e >> 8: return None
        f.seek((e >> 8) * 4096); ln, ct = struct.unpack('>IB', f.read(5)); raw = zlib.decompress(f.read(ln - 1))
    d, _ = nbt(raw, 3 + struct.unpack('>H', raw[1:3])[0], 10)
    for s in d.get('sections', []):
        if s['Y'] == 3: return s.get('biomes', {}).get('palette')
VEG = ('air', 'cave_air', 'short_grass', 'tall_grass', 'fern', 'large_fern', 'snow', 'dead_bush', 'seagrass', 'tall_seagrass', 'kelp', 'kelp_plant', 'vine', 'sea_pickle')
CORAUX = ('tube', 'brain', 'bubble', 'fire', 'horn')
def analyse(w, zone):
    cx0, cz0, R = ZONES[zone]
    n = collections.Counter(); prof = collections.Counter(); emerg = 0; cols = 0; nonoc = 0; nch = 0; ng = 0
    for cx, cz in chunks(cx0, cz0, R):
        try: r = lire(w, cx, cz)
        except Exception: r = None
        if not r: ng += 1; continue
        nch += 1
        b = r[1]
        for Y in (3, 4):
            L = b.get(Y)
            if L is None: continue
            for s in L:
                nm = s.split('[')[0].split(':')[-1]
                if 'coral' in nm or nm in ('seagrass', 'tall_seagrass', 'kelp', 'kelp_plant', 'sea_pickle', 'ice', 'packed_ice', 'stripped_spruce_log', 'spruce_fence', 'dark_oak_fence', 'chain',
                                           'weathered_cut_copper', 'oxidized_cut_copper', 'weathered_cut_copper_slab', 'exposed_cut_copper_slab', 'weathered_cut_copper_stairs', 'coal_block',
                                           'coarse_dirt', 'rooted_dirt', 'gravel', 'podzol', 'moss_block'):
                    n[nm] += 1
                    if 'coral' in nm and not nm.endswith('_block') and "'waterlogged', 'false'" in s: n['corail HORS EAU'] += 1
        pal = biomes(w, cx, cz)
        if zone in ('lagon', 'ileA') and pal and any(not ('ocean' in p or 'beach' in p) for p in pal): nonoc += 1
        if zone in ('lagon', 'ileA'):
            for dx in range(0, 16, 2):
                for dz in range(0, 16, 2):
                    eau = None; top = None
                    for y in range(79, 40, -1):
                        Ls = b.get(y >> 4)
                        nm = 'air' if Ls is None else Ls[((y & 15) << 8) | (dz << 4) | dx].split('[')[0].split(':')[-1]
                        if nm == 'water':
                            if eau is None: eau = y
                            continue
                        if nm in VEG or ('coral' in nm and not nm.endswith('_block')): continue
                        top = (y, nm); break
                    if top is None: continue
                    cols += 1
                    if eau is None and top[0] >= 62: emerg += 1
                    elif eau is not None: prof[min(10, eau - top[0])] += 1
    return dict(chunks=nch, non_generes=ng, compte=n, emergees=emerg, colonnes=cols, profondeurs=sorted(prof.items()), chunks_biome_terre=nonoc)
for zone in ZONES:
    print('== %s' % zone)
    for w, nm in ((REF, 'ref 0.9.4i'), (K, 'k 0.9.5')):
        a = analyse(w, zone)
        c = a['compte']
        cor_b = sum(v for k, v in c.items() if k.endswith('coral_block') and not k.startswith('dead'))
        cor_p = sum(v for k, v in c.items() if 'coral' in k and not k.endswith('_block') and not k.startswith('dead') and k != 'corail HORS EAU')
        mort = sum(v for k, v in c.items() if k.startswith('dead'))
        deb = sum(c[k] for k in ('weathered_cut_copper', 'oxidized_cut_copper', 'weathered_cut_copper_slab', 'exposed_cut_copper_slab', 'weathered_cut_copper_stairs'))
        print('  %-10s chunks %d (non generes %d) | glace %d, colonnes emergees %d / %d (pas 2), chunks a biome de terre %d | profondeur %s' % (
            nm, a['chunks'], a['non_generes'], c['ice'] + c['packed_ice'], a['emergees'], a['colonnes'], a['chunks_biome_terre'], a['profondeurs']))
        print('             corail blocs %d, coraux+eventails %d, morts %d, hors eau %d, herbiers %d/%d, concombres %d, varech %d' % (
            cor_b, cor_p, mort, c['corail HORS EAU'], c['seagrass'], c['tall_seagrass'], c['sea_pickle'], c['kelp'] + c['kelp_plant']))
        print('             debris : epave (cuivre) %d, poteaux %d, clotures %d, chaines %d | sols : terre grossiere %d, racinee %d, gravier %d, podzol %d, mousse %d' % (
            deb, c['stripped_spruce_log'], c['spruce_fence'] + c['dark_oak_fence'], c['chain'], c['coarse_dirt'], c['rooted_dirt'], c['gravel'], c['podzol'], c['moss_block']))
# ---- ilots du lagon : A sculpte (attendu = carte de hauteur), B disparu, cocotiers, glace
from PIL import Image
SC = os.path.join(ICI, '..', 'sculpture', 'ileA')
hi = Image.open(os.path.join(SC, 'hauteur.png')); mi = Image.open(os.path.join(SC, 'masque.png'))
X0, Z0, SW, SH = -2582, -5892, hi.width, hi.height
att = sum(1 for k in range(SH) for i in range(SW) if mi.getpixel((i, k)) >= 252 and round(hi.getpixel((i, k)) / 256) >= 62)
def colonnes(w, x1, z1, x2, z2):
    em = 0; logs = 0; feuilles = 0; glace = 0; tops = collections.Counter(); cache = {}
    for x in range(x1, x2):
        for z in range(z1, z2):
            ch = (x >> 4, z >> 4)
            if ch not in cache:
                try: cache[ch] = lire(w, *ch)
                except Exception: cache[ch] = None
            r = cache[ch]
            if not r: continue
            b = r[1]; eau = False
            for y in range(90, 40, -1):
                L = b.get(y >> 4)
                nm = 'air' if L is None else L[((y & 15) << 8) | ((z & 15) << 4) | (x & 15)].split('[')[0].split(':')[-1]
                if 'coconut' in nm and ('log' in nm or 'wood' in nm): logs += 1; continue
                if nm.endswith('_leaves'): feuilles += 1; continue
                if nm in ('ice', 'packed_ice'): glace += 1
                if nm == 'water': eau = True; continue
                if nm in VEG or ('coral' in nm and not nm.endswith('_block')): continue
                if not eau and y >= 62: em += 1; tops[(y, nm)] += 1
                break
    return em, logs, feuilles, glace, tops.most_common(5)
print('== ilots du lagon (attendu A : %d colonnes emergees d\'apres la sculpture)' % att)
for w, nm in ((REF, 'ref 0.9.4i'), (K, 'k 0.9.5')):
    ea = colonnes(w, X0, Z0, X0 + SW, Z0 + SH); eb = colonnes(w, -2640, -5772, -2608, -5716)
    print('  %-10s A : emergees %d, cocotier (troncs) %d, feuilles %d, glace %d, dessus %s' % (nm, *ea))
    print('             B : emergees %d, glace %d' % (eb[0], eb[3]))
