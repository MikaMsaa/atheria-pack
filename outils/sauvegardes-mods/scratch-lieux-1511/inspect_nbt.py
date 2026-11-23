# Inspecte un modele : hauteur max occupee, et eau sur le pourtour (par niveau). usage: inspect_nbt.py fichier.nbt
import sys, gzip, io, struct, collections
sys.path.insert(0, __file__.rsplit('\\', 1)[0].rsplit('/', 1)[0])
import importlib.util
spec = importlib.util.spec_from_file_location('r', __file__.replace('inspect_nbt.py', 'recadrer_nbt.py'))
src = open(__file__.replace('inspect_nbt.py', 'recadrer_nbt.py'), encoding='utf-8').read().split('src, dst, x0')[0]
exec(src)
f = io.BytesIO(gzip.open(sys.argv[1]).read()); f.read(1); f.read(struct.unpack('>H', f.read(2))[0]); d = lire(f, 10)[1]
pal = [p[1]['Name'][1] for p in d['palette'][1][2]]
W, H, L = d['size'][1][2]
ymax = 0; bord = collections.Counter(); eau_tot = collections.Counter()
for b in d['blocks'][1][2]:
    x, y, z = b[1]['pos'][1][2]; n = pal[b[1]['state'][1]]
    if n != 'minecraft:air' and n != 'minecraft:structure_void': ymax = max(ymax, y)
    if n == 'minecraft:water' or 'waterlogged=true' in n:
        eau_tot[y] += 1
        if x in (0, W - 1) or z in (0, L - 1): bord[y] += 1
print('taille', W, H, L, 'y max occupe', ymax)
print('eau par niveau', dict(sorted(eau_tot.items())))
print('eau sur le pourtour', dict(sorted(bord.items())))
