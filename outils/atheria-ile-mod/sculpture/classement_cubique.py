# Classement hors jeu des zones les plus « cubiques » : plats parfaits, marches droites, angles a 90 degres.
# Lit les .mca des mondes de test (lecture seule) ; pour chaque zone, prend le monde le plus recent qui la couvre.
# usage : python -I classement_cubique.py
import os, sys, json
from PIL import Image, ImageDraw
ICI = os.path.dirname(os.path.abspath(__file__))
ST = os.path.join(ICI, '..', 'scripts-test')
ESS = os.path.join(ICI, '..', '..', 'serveur-pilote-essai')
src = open(os.path.join(ST, 'comparer_chunks.py')).read().split('mondes=args')[0]
src = src.replace("sys.argv,args=[sys.argv[0],'x'],sys.argv[1:]", "args=[]").replace("os.path.dirname(os.path.abspath(__file__))", repr(ST))
_a = sys.argv; sys.argv = [sys.argv[0], ESS, ESS]; exec(src); sys.argv = _a
R = 64
ZONES = {
 '001 cote plage Petite-Terre': (3312, -1248), '002 cote plage Jungle Ouest': (-5136, -672), '003 cote falaise calcaire Nord': (240, -5712),
 '004 cote falaise Canyons laterite': (-3216, 3264), '005 cote vase Marais aux spores': (3408, 480), '006 cote vase Mangroves Sud': (-1392, 5760),
 '007 cote roche Plaine de cendres': (3696, 3888), '008 cote roche Ile du volcan': (-3936, 4416), '009 Hauts plateaux / Benara': (-416, 1616),
 '010 Cote calcaire / Savane seche': (-288, -3504), '011 Friches / Marais aux spores': (1680, -384), '012 Savane / Canyons': (-768, 3792),
 '013 Hauts plateaux / Canyons': (-1296, 2144), 'colline C24': (2374, -1282), 'estuaire (riv)': (-2150, 3990), 'zone humide (hum)': (3330, 860),
 'ilot de sable A (lagon)': (-2534, -5864), 'ilot de sable B (lagon)': (-2624, -5744),
}
MONDES = sorted([d for d in os.listdir(ESS) if d.startswith('pilote') and os.path.isdir(os.path.join(ESS, d, 'region'))],
                key=lambda d: -os.path.getmtime(os.path.join(ESS, d, 'region')))
MONDES = [os.path.join(ESS, m) for m in MONDES] + [os.path.join(ICI, '..', '..', 'serveur-ile-test', 'ile_test_1')]   # dernier recours, lecture seule : monde de l'audit (ancienne generation 0.7.3)
NONSOL = ('air', 'cave_air', 'water', 'short_grass', 'tall_grass', 'fern', 'large_fern', 'snow', 'dead_bush', 'seagrass', 'tall_seagrass', 'kelp', 'kelp_plant', 'vine', 'sea_pickle', 'bush')
STRUCT = ('roots', 'propagule', 'moss_carpet', 'oats', 'lily', 'reed', 'cattail', 'sprout', '_plant', 'petals', 'bush', 'shrub', 'clover', 'lichen', 'dune_grass', 'heliconia', 'poppy', 'tulip', 'orchid', 'daisy', 'lilac', 'peony', 'rose', 'allium', 'bluet', 'dandelion', 'cornflower', 'lily_of', 'concrete', 'planks', 'brick', 'fence', 'panel', 'stripes', 'glass', 'wool', 'slab', 'stairs', '_wall', 'door', 'ventilation', 'iron', 'metal', 'lantern', 'torch', 'chest', 'barrel', 'chain', 'ladder', 'bars', 'scaffold', 'carpet', 'bed', 'cobweb', 'smooth_stone', 'polished', 'cut_', 'copper', 'hay', 'crafting', 'furnace', 'table', 'hanging_', 'coconut')
def sol(nm):
    if any(s in nm for s in STRUCT): return False   # blocs de structures (bunkers, ruines...) : on cherche le terrain dessous
    return not (nm in NONSOL or nm.endswith('_leaves') or nm.endswith('_log') or nm.endswith('_wood') or 'flower' in nm or 'sapling' in nm or 'coral' in nm and not nm.endswith('_block')
                or 'grass' in nm and nm != 'grass_block' or nm.endswith('_carpet') or 'mushroom' in nm and 'block' not in nm or 'bamboo' in nm or 'cactus' in nm or 'vine' in nm)
def carte(monde, cx0, cz0):
    H = {}; E = {}
    for cx in range((cx0 - R) >> 4, ((cx0 + R - 1) >> 4) + 1):
        for cz in range((cz0 - R) >> 4, ((cz0 + R - 1) >> 4) + 1):
            try: r = lire(monde, cx, cz)
            except Exception: r = None
            if not r or not r[1]: return None
            b = r[1]; ys = sorted((Y if Y < 128 else Y - 256) for Y in b)
            for dx in range(16):
                for dz in range(16):
                    eau = False
                    for Y in reversed(ys):
                        L = b[Y + 256 if Y < 0 else Y]; trouve = None
                        for yy in range(15, -1, -1):
                            nm = L[(yy << 8) | (dz << 4) | dx].split('[')[0].split(':')[-1]
                            if nm == 'water': eau = True; continue
                            if sol(nm): trouve = Y * 16 + yy; break
                        if trouve is not None: break
                    H[(cx * 16 + dx, cz * 16 + dz)] = trouve if trouve is not None else -64; E[(cx * 16 + dx, cz * 16 + dz)] = eau
    return H, E
def mesure(H, E, cx0, cz0, exclu=None):
    xs = range(cx0 - R + 2, cx0 + R - 2); zs = range(cz0 - R + 2, cz0 + R - 2)
    terre = [(x, z) for x in xs for z in zs if not E[(x, z)] and not (exclu and exclu(x, z))]
    if len(terre) < 200: return None
    plats = sum(1 for (x, z) in terre if all(H.get((x + a, z + b)) == H[(x, z)] for a in (-2, -1, 0, 1, 2) for b in (-2, -1, 0, 1, 2)))
    marches = droites = 0
    for (x, z) in terre:
        for (a, b, pa, pb) in ((1, 0, 0, 1), (0, 1, 1, 0)):
            d = H.get((x + a, z + b), H[(x, z)]) - H[(x, z)]
            if abs(d) < 2: continue
            marches += 1
            # meme marche sur 4 voisins alignes perpendiculairement : marche droite (mur rectiligne)
            if all(H.get((x + pa * k, z + pb * k), 0) - H.get((x + pa * k + a, z + pb * k + b), 0) == -d for k in (-2, -1, 1, 2)): droites += 1
    angles = 0
    for (x, z) in terre:
        dx = H.get((x + 1, z), H[(x, z)]) - H[(x, z)]; dz = H.get((x, z + 1), H[(x, z)]) - H[(x, z)]
        if abs(dx) >= 2 and abs(dz) >= 2 and H.get((x + 1, z + 1)) == H[(x, z)] + dx and H.get((x + 1, z + 1)) == H[(x, z)] + dz: angles += 1
    n = len(terre)
    p, m, dr, an = plats / n, marches / n, droites / max(1, marches), angles / n
    score = 100 * (0.45 * p + 0.35 * dr * min(1, m * 8) + 0.20 * min(1, an * 50))
    return dict(terre=n, plats=round(100 * p, 1), marches_pour_mille=round(1000 * m, 1), marches_droites=round(100 * dr, 1), angles_pour_mille=round(1000 * an, 2), score=round(score, 1))
def vignette(H, E, cx0, cz0, f):
    s = 2; im = Image.new('RGB', (2 * R * s, 2 * R * s)); dr = ImageDraw.Draw(im)
    for x in range(cx0 - R, cx0 + R):
        for z in range(cz0 - R, cz0 + R):
            y = H[(x, z)]
            gx = H.get((x + 1, z), y) - H.get((x - 1, z), y); gz = H.get((x, z + 1), y) - H.get((x, z - 1), y)
            o = max(0.35, min(1.25, 0.85 - 0.12 * gx + 0.1 * gz))
            if E[(x, z)]: c = (40, 110 + min(60, max(0, (y - 50) * 8)), 170)
            else:
                t = max(0, min(1, (y - 60) / 60)); c = (int(110 + 120 * t), int(150 + 40 * t), int(80 + 120 * t))
            dr.rectangle([(x - cx0 + R) * s, (z - cz0 + R) * s, (x - cx0 + R) * s + s - 1, (z - cz0 + R) * s + s - 1], fill=tuple(int(min(255, v * o)) for v in c))
    im.save(f)
res = []
os.makedirs(os.path.join(ICI, 'classement'), exist_ok=True)
for nom, (x, z) in ZONES.items():
    for m in MONDES:
        cz_ = carte(m, x, z)
        if cz_ is None: continue
        H, E = cz_
        me = mesure(H, E, x, z)
        f = os.path.join(ICI, 'classement', ''.join(ch if ch.isalnum() else '_' for ch in nom) + '.png')
        vignette(H, E, x, z, f)
        res.append(dict(nom=nom, x=x, z=z, monde=os.path.basename(m) + (' (ancienne generation 0.7.3)' if 'ile_test_1' in m else ''), vignette=os.path.basename(f), **(me or dict(score=-1, terre=0))))
        print(nom, os.path.basename(m), me, flush=True)
        break
    else:
        print(nom, 'aucun monde ne couvre la zone', flush=True)
res.sort(key=lambda d: -d['score'])
json.dump(res, open(os.path.join(ICI, 'classement', 'classement.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
for i, d in enumerate(res): print(i + 1, d['nom'], d['score'], d.get('plats'), d.get('marches_droites'), d.get('angles_pour_mille'), d['monde'])
