"""Titres d'entree dessines (atheria_ile 0.7.4) : une image par lieu, lettres en blocs en relief facon logo Minecraft,
matiere et decor propres au lieu. Sortie : ressources/assets/atheria_ile/textures/titres/<id>.png + planche.png.
Usage : python generer-titres.py  (aucune dependance hors Pillow)
"""
import math, os, random, unicodedata, json
from PIL import Image, ImageDraw, ImageFilter

ICI = os.path.dirname(os.path.abspath(__file__))
SORTIE = os.path.join(ICI, '..', 'ressources', 'assets', 'atheria_ile', 'textures', 'titres')
B = 4  # taille d'un "bloc" (pixel de lettre) en pixels d'image

# ------------------------------------------------------------------ police en blocs 5x7 (+2 lignes d'accent)
G = {
 'A': ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
 'B': ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
 'C': ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
 'D': ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
 'E': ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
 'F': ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
 'G': ["01111", "10000", "10000", "10011", "10001", "10001", "01111"],
 'H': ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
 'I': ["111", "010", "010", "010", "010", "010", "111"],
 'J': ["00111", "00001", "00001", "00001", "10001", "10001", "01110"],
 'K': ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
 'L': ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
 'M': ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
 'N': ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
 'O': ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
 'P': ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
 'Q': ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
 'R': ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
 'S': ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
 'T': ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
 'U': ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
 'V': ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
 'W': ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
 'X': ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
 'Y': ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
 'Z': ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
 "'": ["1", "1", "0", "0", "0", "0", "0"],
 '-': ["000", "000", "000", "111", "000", "000", "000"],
 ' ': ["00", "00", "00", "00", "00", "00", "00"],
 ',': ["0", "0", "0", "0", "0", "1", "1"],
}
ACC = {'́': ["00010", "00100"], '̀': ["01000", "00100"], '̂': ["00100", "01010"], '̈': ["01010", "00000"]}


def glyphe(ch):
    """renvoie (lignes de 9 : 2 d'accent + 7, largeur, cedille)"""
    d = unicodedata.normalize('NFD', ch.upper())
    base, marques = d[0], d[1:]
    g = G.get(base, G[' '])
    w = len(g[0])
    acc = ["0" * w, "0" * w]
    for mk in marques:
        if mk in ACC:
            a = ACC[mk]
            if w == 3: a = [r[1:4] for r in a]
            acc = a
    ced = '̧' in marques
    return acc + g, w, ced


# ------------------------------------------------------------------ matieres (texture d'un bloc, B x B)
def bruit(rng, a, b):
    return rng.randint(a, b)


def mat_couleur(mat, rng, x, y, i, j):
    """couleur de la face d'un bloc en (i, j) a l'interieur du bloc ; x, y = position du bloc"""
    c = mat['c']
    v = mat.get('var', 18)
    k = mat.get('motif')
    r, g, b = c
    d = rng.randint(-v, v)
    if k == 'brique':
        if j == B - 1 or (i == 0 and (y % 2 == 0)) or (i == B // 2 and y % 2 == 1): d -= 45
    elif k == 'fissure':
        if (i + j + x * 3 + y * 5) % 11 == 0: return mat.get('c2', (255, 120, 20))
    elif k == 'mousse':
        if rng.random() < 0.35: return mat.get('c2', (70, 120, 40))
    elif k == 'neige':
        if j == 0 or rng.random() < 0.15: return (240, 246, 252)
    elif k == 'rouille':
        if rng.random() < 0.3: return mat.get('c2', (150, 70, 30))
    elif k == 'planche':
        if j == 0: d -= 30
        if (i + x * 2) % 5 == 0: d -= 12
    elif k == 'veines':
        if (i * 2 + j + x) % 7 == 0: d -= 28
    elif k == 'cendre':
        if rng.random() < 0.12: return (60, 58, 56)
        if rng.random() < 0.04: return (255, 140, 40)
    elif k == 'vitre':
        if i == j: return (220, 240, 255)
    return (max(0, min(255, r + d)), max(0, min(255, g + d)), max(0, min(255, b + d)))


def assombrir(c, f):
    return tuple(max(0, min(255, int(v * f))) for v in c)


# ------------------------------------------------------------------ rendu d'une ligne en blocs 3D
def ligne_blocs(texte, mat, rng, echelle=1, prof=3):
    """image RGBA d'une ligne : faces texturees, extrusion vers le bas-droite, contour sombre"""
    cols = []
    for ch in texte:
        g, w, ced = glyphe(ch)
        cols.append((g, w, ced))
    larg = sum(w + 1 for _, w, _ in cols) - 1
    bs = B * echelle
    W = larg * bs + prof * bs + 8
    H = 10 * bs + prof * bs + 8
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    px = im.load()
    grille = set()
    x0 = 0
    for g, w, ced in cols:
        for yy, row in enumerate(g):
            for xx, v in enumerate(row):
                if v == '1': grille.add((x0 + xx, yy))
        if ced: grille.add((x0 + w // 2, 9))
        x0 += w + 1
    cote = assombrir(mat['c'], mat.get('ombre', 0.45))
    # extrusion
    for p in range(prof * bs, 0, -1):
        for (gx, gy) in grille:
            for i in range(bs):
                for j in range(bs):
                    X, Y = 4 + gx * bs + i + p // 2, 4 + gy * bs + j + p
                    if 0 <= X < W and 0 <= Y < H:
                        f = 0.75 + 0.25 * (1 - p / (prof * bs))
                        px[X, Y] = assombrir(cote, f) + (255,)
    # faces
    for (gx, gy) in grille:
        for i in range(bs):
            for j in range(bs):
                c = mat_couleur(mat, rng, gx, gy, i // echelle, j // echelle)
                # biseau : haut/gauche clairs, bas/droite sombres
                if j < echelle and (gx, gy - 1) not in grille: c = assombrir(c, 1.25)
                elif i < echelle and (gx - 1, gy) not in grille: c = assombrir(c, 1.12)
                elif j >= bs - echelle and (gx, gy + 1) not in grille: c = assombrir(c, 0.8)
                px[4 + gx * bs + i, 4 + gy * bs + j] = c + (255,)
    # contour sombre d'un pixel
    a = im.split()[3]
    contour = a.filter(ImageFilter.MaxFilter(3))
    fond = Image.new('RGBA', (W, H), mat.get('contour', (20, 16, 14)) + (255,))
    res = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    res.paste(fond, (0, 0), contour)
    res.alpha_composite(im)
    return res.crop(res.getbbox())


def petit_texte(texte, couleur, rng, ombre=(0, 0, 0)):
    """sous-titre : police en blocs plate, 2 px par pixel, espacement large"""
    s = 2
    cols = [glyphe(ch) for ch in texte]
    larg = sum(w + 2 for _, w, _ in cols)
    im = Image.new('RGBA', (larg * s + 4, 10 * s + 4), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    x0 = 0
    for g, w, ced in cols:
        for yy, row in enumerate(g):
            for xx, v in enumerate(row):
                if v == '1':
                    X, Y = 1 + (x0 + xx) * s, 1 + yy * s
                    d.rectangle([X + 1, Y + 1, X + s, Y + s], fill=ombre + (200,))
                    d.rectangle([X, Y, X + s - 1, Y + s - 1], fill=couleur + (255,))
        x0 += w + 2
    return im.crop(im.getbbox())


# ------------------------------------------------------------------ decors (pixel art, propres a chaque lieu)
def decor(nom, W, H, rng, acc):
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    def bloc(x, y, c, t=3):
        d.rectangle([x, y, x + t - 1, y + t - 1], fill=c + (255,))
    if nom == 'vagues':
        for x in range(0, W, 3):
            y = H - 8 + int(3 * math.sin(x / 9.0))
            bloc(x, y, (90, 170, 210)); bloc(x, y + 3, (40, 100, 160))
            if x % 18 == 0: bloc(x, y - 3, (230, 245, 250))
    elif nom == 'braises':
        for _ in range(70):
            x, y = rng.randrange(W), rng.randrange(H)
            c = rng.choice([(255, 90, 20), (255, 160, 40), (200, 40, 10)])
            bloc(x, y, c, rng.choice([2, 3]))
    elif nom == 'flocons':
        for _ in range(40):
            x, y = rng.randrange(W), rng.randrange(H // 2)
            bloc(x, y, (235, 245, 255), 2)
    elif nom == 'lianes':
        for k in range(6):
            x = int(W * (k + 0.5) / 6) + rng.randint(-10, 10)
            L = rng.randint(10, 26)
            for y in range(0, L, 3):
                bloc(x + int(2 * math.sin(y / 4.0)), y, (50, 120, 40))
                if y % 9 == 0: bloc(x + 3, y, (90, 160, 60))
    elif nom == 'spores':
        for _ in range(55):
            x, y = rng.randrange(W), rng.randrange(H)
            bloc(x, y, rng.choice([(150, 200, 90), (190, 230, 120), (110, 160, 70)]), 2)
    elif nom == 'epis':
        for k in range(0, W, 14):
            for y in range(H - 14, H, 3): bloc(k, y, (180, 150, 60))
            bloc(k - 2, H - 16, (220, 190, 80)); bloc(k + 2, H - 16, (220, 190, 80)); bloc(k, H - 19, (230, 200, 90))
    elif nom == 'baobabs':
        for cx in (12, W - 18):
            for y in range(H - 18, H, 3): bloc(cx, y, (110, 80, 50), 4)
            for dx in range(-9, 10, 3): bloc(cx + dx, H - 21 - abs(dx) // 3, (90, 110, 50))
    elif nom == 'pins':
        for cx in (10, W - 14):
            for k in range(5):
                for dx in range(-k * 2, k * 2 + 1, 3): bloc(cx + dx, H - 24 + k * 4, (40, 80, 50))
            bloc(cx, H - 4, (90, 60, 40))
    elif nom == 'racines':
        for k in range(8):
            x = rng.randrange(W)
            for y in range(H - 12, H, 3): bloc(x + (y % 2), y, (80, 60, 40))
        for x in range(0, W, 3): bloc(x, H - 3, (60, 90, 70))
    elif nom == 'grue':
        x = W - 22
        for y in range(4, H, 3): bloc(x, y, (220, 170, 40))
        for dx in range(-24, 14, 3): bloc(x + dx, 4, (220, 170, 40))
        for y in range(7, 19, 3): bloc(x - 20, y, (60, 60, 60), 1)
    elif nom == 'antennes':
        for x in (10, W - 12):
            for y in range(4, H, 3): bloc(x, y, (150, 150, 155), 2)
            bloc(x - 2, 2, (220, 40, 40), 3)
    elif nom == 'rails':
        for x in range(0, W, 3): bloc(x, H - 6, (120, 120, 125), 2)
        for x in range(0, W, 9): bloc(x, H - 4, (100, 70, 40), 3)
    elif nom == 'cendres':
        for _ in range(60):
            x, y = rng.randrange(W), rng.randrange(H)
            bloc(x, y, rng.choice([(120, 118, 115), (90, 88, 85), (160, 158, 150)]), 2)
    elif nom == 'filet':
        for x in range(0, W, 6):
            for y in range(H - 14, H, 6): d.line([x, y, x + 6, y + 6], fill=(170, 150, 110, 255)); d.line([x + 6, y, x, y + 6], fill=(170, 150, 110, 255))
    elif nom == 'barbeles':
        for x in range(0, W, 4):
            y = H - 6 + (2 if (x // 4) % 2 else 0)
            bloc(x, y, (130, 130, 130), 2)
            if x % 16 == 0: bloc(x, y - 3, (160, 160, 160), 2); bloc(x, y + 3, (160, 160, 160), 2)
    elif nom == 'fumees':
        for k in range(4):
            x = int(W * (k + 0.5) / 4)
            for y in range(H, 0, -4): bloc(x + int(4 * math.sin(y / 6.0 + k)), y, (110, 110, 110) if y > H // 2 else (150, 150, 150), 3)
    elif nom == 'feuilles':
        for _ in range(26):
            x, y = rng.randrange(W), rng.randrange(H)
            bloc(x, y, rng.choice([(60, 130, 50), (90, 160, 60), (40, 100, 40)]), 3)
    elif nom == 'eclats':
        for _ in range(30):
            x, y = rng.randrange(W), rng.randrange(H)
            bloc(x, y, (200, 230, 255), 2)
    return im


# ------------------------------------------------------------------ cadres
def cadre(style, W, H, acc, fond):
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if style == 'plaque':
        d.rectangle([0, 0, W - 1, H - 1], fill=fond + (150,), outline=acc + (255,), width=2)
        for x, y in ((3, 3), (W - 6, 3), (3, H - 6), (W - 6, H - 6)): d.rectangle([x, y, x + 2, y + 2], fill=acc + (255,))
    elif style == 'banniere':
        d.polygon([(10, 0), (W - 10, 0), (W - 1, H // 2), (W - 10, H - 1), (10, H - 1), (0, H // 2)], fill=fond + (140,), outline=acc + (255,))
    elif style == 'traits':
        y = H - 2
        d.rectangle([W // 6, y, W - W // 6, y + 1], fill=acc + (220,))
        d.rectangle([W // 2 - 3, y - 2, W // 2 + 3, y + 3], fill=acc + (255,))
    elif style == 'dechire':
        rng = random.Random(W * 7 + H)
        pts = [(x, rng.randint(0, 4)) for x in range(0, W, 6)] + [(W - 1, 2)]
        pts += [(x, H - 1 - rng.randint(0, 4)) for x in range(W - 1, -1, -6)] + [(0, H - 3)]
        d.polygon(pts, fill=fond + (150,))
    elif style == 'arche':
        d.arc([4, 0, W - 5, H * 2], 190, 350, fill=acc + (255,), width=3)
    return im


# ------------------------------------------------------------------ fiches des lieux
M = {
 'calcaire': {'c': (225, 222, 205), 'motif': 'veines', 'var': 10, 'ombre': 0.55, 'contour': (60, 55, 45)},
 'savane': {'c': (205, 165, 90), 'var': 16, 'motif': 'planche'},
 'beton': {'c': (150, 150, 150), 'var': 14, 'motif': 'fissure', 'c2': (90, 90, 90)},
 'champ': {'c': (190, 160, 70), 'motif': 'planche'},
 'jungle': {'c': (80, 130, 60), 'motif': 'mousse', 'c2': (50, 95, 40)},
 'pin': {'c': (120, 100, 70), 'motif': 'planche', 'var': 12},
 'glace': {'c': (170, 210, 235), 'motif': 'neige', 'var': 10, 'contour': (30, 50, 80)},
 'marais': {'c': (100, 115, 80), 'motif': 'mousse', 'c2': (160, 200, 100)},
 'laterite': {'c': (175, 80, 45), 'motif': 'veines', 'var': 16},
 'cendre': {'c': (110, 108, 104), 'motif': 'cendre'},
 'mangrove': {'c': (95, 80, 55), 'motif': 'mousse', 'c2': (70, 110, 70)},
 'volcan': {'c': (55, 45, 45), 'motif': 'fissure', 'c2': (255, 110, 20), 'contour': (10, 6, 6)},
 'pierre_pt': {'c': (190, 175, 130), 'motif': 'veines'},
 'militaire': {'c': (110, 120, 85), 'motif': 'rouille', 'c2': (85, 90, 60)},
 'brique': {'c': (165, 75, 60), 'motif': 'brique', 'var': 14},
 'verre': {'c': (120, 160, 180), 'motif': 'vitre', 'var': 8},
 'rouille': {'c': (120, 110, 105), 'motif': 'rouille'},
 'bois': {'c': (150, 110, 70), 'motif': 'planche'},
 'or': {'c': (215, 180, 80), 'motif': 'veines', 'var': 12},
 'mine': {'c': (95, 85, 80), 'motif': 'fissure', 'c2': (200, 170, 90)},
 'gris_mort': {'c': (135, 130, 125), 'motif': 'fissure', 'c2': (70, 60, 55)},
 'cite_cendre': {'c': (90, 85, 80), 'motif': 'cendre'},
 'peche': {'c': (60, 110, 140), 'motif': 'planche', 'var': 12},
 'parc': {'c': (110, 150, 90), 'motif': 'mousse', 'c2': (80, 120, 60)},
 'toxique': {'c': (120, 160, 70), 'motif': 'fissure', 'c2': (200, 255, 80), 'contour': (20, 40, 10)},
 'ice': {'c': (200, 200, 190), 'motif': 'rouille', 'c2': (150, 140, 120)},
}
# id, titre, sous-titre, matiere, decor, cadre, couleur d'accent, couleur du sous-titre
LIEUX = [
 ('region_cote_calcaire', "Côte calcaire", "Falaises du Nord", 'calcaire', 'vagues', 'traits', (180, 210, 230), (200, 220, 230)),
 ('region_savane', "Savane sèche", "", 'savane', 'baobabs', 'dechire', (230, 190, 110), (230, 210, 170)),
 ('region_friches', "Friches urbaines", "", 'beton', 'fumees', 'plaque', (200, 200, 200), (210, 210, 210)),
 ('region_coconi', "Plaines de Coconi", "Terres agricoles", 'champ', 'epis', 'banniere', (230, 200, 90), (240, 225, 170)),
 ('region_jungle', "Jungle de l'Ouest", "", 'jungle', 'lianes', 'dechire', (120, 190, 80), (190, 220, 170)),
 ('region_hauts_plateaux', "Hauts plateaux", "Et pins", 'pin', 'pins', 'traits', (170, 200, 160), (200, 220, 200)),
 ('region_sommet_benara', "Sommet gelé du Bénara", "Hiver volcanique", 'glace', 'flocons', 'arche', (210, 235, 255), (220, 235, 250)),
 ('region_marais', "Marais aux spores", "", 'marais', 'spores', 'dechire', (170, 220, 110), (200, 230, 170)),
 ('region_canyons', "Canyons de latérite", "Terre rouge", 'laterite', 'cendres', 'plaque', (240, 140, 80), (240, 200, 170)),
 ('region_plaine_cendres', "Plaine de cendres", "", 'cendre', 'cendres', 'traits', (230, 120, 50), (200, 195, 190)),
 ('region_mangroves', "Mangroves du Sud", "", 'mangrove', 'racines', 'dechire', (120, 170, 120), (190, 210, 190)),
 ('region_petite_terre', "Petite-Terre", "", 'pierre_pt', 'vagues', 'arche', (230, 210, 150), (230, 220, 190)),
 ('region_ile_volcan', "Île du volcan", "", 'volcan', 'braises', 'traits', (255, 120, 30), (255, 190, 140)),
 ('region_ilot_ice', "Îlot de la ICE", "Zone militaire", 'militaire', 'barbeles', 'plaque', (200, 200, 120), (210, 210, 180)),
 ('ville_mamoudzou', "Mamoudzou", "", 'brique', 'grue', 'banniere', (230, 200, 160), (230, 215, 200)),
 ('ville_majicavo', "Majicavo", "", 'verre', 'rails', 'traits', (170, 210, 230), (200, 225, 235)),
 ('ville_longoni', "Longoni", "Port", 'rouille', 'grue', 'plaque', (220, 140, 60), (220, 200, 180)),
 ('lieu_coconi', "Coconi", "Refuge, champs, granges, marché", 'bois', 'epis', 'banniere', (230, 190, 110), (240, 225, 190)),
 ('lieu_mont_benara', "Mont Bénara", "Émetteur et antennes", 'glace', 'antennes', 'arche', (230, 80, 70), (220, 235, 250)),
 ('lieu_choungui', "Choungui", "Station de ski fantôme", 'glace', 'eclats', 'traits', (200, 220, 255), (220, 230, 245)),
 ('lieu_vahibe', "Vahibé", "Ville minière", 'mine', 'rails', 'plaque', (220, 180, 90), (230, 210, 170)),
 ('lieu_handrema', "Handrema", "Cité des cendres", 'cite_cendre', 'braises', 'dechire', (240, 110, 40), (220, 200, 190)),
 ('lieu_mtsamboro', "Mtsamboro", "Ville morte", 'gris_mort', 'feuilles', 'dechire', (150, 170, 140), (200, 200, 195)),
 ('lieu_kaweni', "Kawéni", "Ville morte", 'gris_mort', 'fumees', 'plaque', (170, 170, 170), (200, 200, 195)),
 ('lieu_sada', "Sada", "Ville morte", 'gris_mort', 'vagues', 'traits', (140, 180, 200), (200, 200, 195)),
 ('lieu_dembeni', "Dembéni", "Ville morte", 'gris_mort', 'racines', 'arche', (150, 130, 100), (200, 200, 195)),
 ('lieu_chirongui', "Chirongui", "Ville morte", 'gris_mort', 'lianes', 'banniere', (130, 170, 110), (200, 200, 195)),
 ('lieu_pecheurs', "Village des pêcheurs", "Sud", 'peche', 'filet', 'dechire', (200, 180, 130), (210, 225, 235)),
 ('lieu_zamani', "Parc de Zamani", "", 'parc', 'feuilles', 'arche', (150, 200, 120), (210, 230, 200)),
 ('lieu_somaco', "Campus Somaco", "Zone contaminée", 'toxique', 'spores', 'plaque', (200, 255, 90), (210, 240, 170)),
]


def couper(t, n=14):
    if len(t) <= n: return [t]
    mots, l, cur = t.split(' '), [], ''
    for m in mots:
        if cur and len(cur) + 1 + len(m) > n: l.append(cur); cur = m
        else: cur = (cur + ' ' + m).strip()
    l.append(cur)
    return l[:2]


def titre(fiche):
    ident, t, st, mk, dk, ck, acc, cs = fiche
    rng = random.Random(ident)
    mat = M[mk]
    lignes = [ligne_blocs(l, mat, rng) for l in couper(t)]
    sous = petit_texte(st.upper(), cs, rng) if st else None
    W = max(im.width for im in lignes) + 40
    if sous: W = max(W, sous.width + 40)
    H = sum(im.height for im in lignes) + 2 * (len(lignes) - 1) + 24 + (sous.height + 8 if sous else 0)
    fond = assombrir(mat['c'], 0.25)
    out = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    out.alpha_composite(cadre(ck, W, H, acc, fond))
    dec = decor(dk, W, H, rng, acc)
    dec.putalpha(dec.split()[3].point(lambda a: int(a * 0.85)))
    out.alpha_composite(dec)
    y = 10
    for im in lignes:
        out.alpha_composite(im, ((W - im.width) // 2, y)); y += im.height + 2
    if sous:
        y += 4
        out.alpha_composite(sous, ((W - sous.width) // 2, y))
    return out


def main():
    os.makedirs(SORTIE, exist_ok=True)
    imgs, index = [], {}
    for f in LIEUX:
        im = titre(f)
        im.save(os.path.join(SORTIE, f[0] + '.png'))
        imgs.append((f, im))
        index[f[1]] = f[0]
    json.dump(index, open(os.path.join(SORTIE, 'index.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    # planche de revue : fonds clair et sombre alternes (lisibilite en jour et en nuit)
    colw = max(im.width for _, im in imgs) + 20
    rows = (len(imgs) + 2) // 3
    rh = max(im.height for _, im in imgs) + 20
    pl = Image.new('RGBA', (colw * 3, rh * rows), (0, 0, 0, 255))
    for k, (f, im) in enumerate(imgs):
        cx, cy = (k % 3) * colw, (k // 3) * rh
        fondc = (135, 175, 225) if (k // 3 + k % 3) % 2 == 0 else (40, 50, 40)
        ImageDraw.Draw(pl).rectangle([cx, cy, cx + colw - 1, cy + rh - 1], fill=fondc + (255,))
        pl.alpha_composite(im, (cx + (colw - im.width) // 2, cy + (rh - im.height) // 2))
    pl.convert('RGB').save(os.path.join(ICI, 'planche-titres.png'))
    print(len(imgs), 'titres ; planche', pl.size)


if __name__ == '__main__':
    main()
