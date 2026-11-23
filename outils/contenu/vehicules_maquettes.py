# Reperage des vehicules maquettes (en blocs) dans les lots vitrine exportes, pour les remplacer par les vrais
# vehicules MTS du pack atheriavh (12/11, accord de Mika : "garder les maquettes comme simples emplacements").
# Chaque modele de maquette des constructeurs (bgVoiture, auto, dsPickup, v2Car, ruBus, gaCamion, prFourgon) a une
# signature de blocs exacte ; une maquette reconnue est effacee du lot et remplacee par une entree de placement.
import re, zlib

COUL = {'red': '_rouge', 'blue': '_bleu', 'light_blue': '_bleu', 'cyan': '_bleu', 'white': '_blanc', 'green': '_vert', 'lime': '_vert',
        'yellow': '_jaune', 'orange': '_jaune', 'gray': '_gris', 'light_gray': '_gris', 'black': '_noir', 'brown': '_beige',
        'pink': '_rouge', 'purple': '_bleu', 'magenta': '_rouge'}
VERRES = ('minecraft:tinted_glass', 'minecraft:gray_stained_glass', 'minecraft:coal_block')


def _h(*a):
    return zlib.crc32(','.join(str(x) for x in a).encode()) / 4294967295.0


class Grille:
    def __init__(self, lot):
        self.pal, self.w, self.d, self.tr = lot['pal'], lot['w'], lot['d'], lot['tr']
        self.air = next((k for k, v in self.pal.items() if v == 'minecraft:air'), None)

    def get(self, x, y, z):
        if x < 0 or z < 0 or x >= self.w or z >= self.d or y not in self.tr:
            return 'minecraft:air'
        return self.pal[self.tr[y][z * self.w + x]]

    def vider(self, x, y, z):
        if 0 <= x < self.w and 0 <= z < self.d and y in self.tr and self.air is not None:
            self.tr[y][z * self.w + x] = self.air


def _beton(e):
    m = re.match(r'^minecraft:([a-z_]+)_concrete$', e)
    return m.group(1) if m else None


def _tapis(e):
    m = re.match(r'^minecraft:([a-z_]+)_carpet$', e)
    return m.group(1) if m else None


def _axes():
    # (nom, vecteur longueur, vecteur largeur)
    return [('x', (1, 0), (0, 1)), ('z', (0, 1), (1, 0))]


def _p(x, z, a, u, v):
    (du, dv) = (a[1], a[2])
    return x + du[0] * u + dv[0] * v, z + du[1] * u + dv[1] * v


def chercher(lot, graine):
    """Renvoie la liste des vehicules reperes et efface leurs blocs du lot."""
    g = Grille(lot)
    ys = sorted(g.tr)
    trouves, pris = [], set()

    def libre(cases):
        return not any(c in pris for c in cases)

    for y in ys:
        for z in range(g.d):
            for x in range(g.w):
                e = g.get(x, y, z)
                if e == 'minecraft:air':
                    continue
                for a in _axes():
                    for f in (_voiture, _pickup, _car, _bus, _camion, _fourgon):
                        r = f(g, x, y, z, a)
                        if not r:
                            continue
                        cases = {(cx, cy, cz) for (cx, cy, cz) in r['blocs']}
                        if not libre(cases):
                            continue
                        pris.update(cases)
                        r['graine'] = graine
                        trouves.append(r)
    for r in trouves:
        for (cx, cy, cz) in r['blocs']:
            g.vider(cx, cy, cz)
    return trouves


def _resultat(g, x, y, z, a, L, W, H, modele, etat, cap, extra=()):
    blocs = []
    for u in range(L):
        for v in range(W):
            px, pz = _p(x, z, a, u, v)
            for k in range(H):
                if g.get(px, y + k, pz) != 'minecraft:air':
                    blocs.append((px, y + k, pz))
    blocs += list(extra)
    cu, cv = (L - 1) / 2.0, (W - 1) / 2.0
    du, dv = a[1], a[2]
    cx = x + du[0] * cu + dv[0] * cv + 0.5
    cz = z + du[1] * cu + dv[1] * cv + 0.5
    # cap : +1 = vers les u croissants, -1 = vers les u decroissants, 0 = au hasard (stable)
    if cap == 0:
        cap = 1 if _h(x, y, z, L) < 0.5 else -1
    vx, vz = du[0] * cap, du[1] * cap
    return {'modele': modele, 'etat': etat, 'x': cx, 'y': y, 'z': cz, 'dir': (vx, vz), 'L': L, 'W': W, 'blocs': blocs}


def _boutons(g, x, y, z, a, L, W):
    out = []
    for u in range(-1, L + 1):
        for v in (-1, W):
            px, pz = _p(x, z, a, u, v)
            if g.get(px, y, pz).startswith('minecraft:polished_blackstone_button'):
                out.append((px, y, pz))
    return out


def _voiture(g, x, y, z, a):
    # bgVoiture / auto : 4 x 2, couche y beton, couche y+1 [tapis, verre, verre, tapis], tapis au toit (sauf brulee)
    c0 = _beton(g.get(x, y, z))
    if not c0:
        return None
    t = None
    for v in range(2):
        for u in range(4):
            px, pz = _p(x, z, a, u, v)
            if _beton(g.get(px, y, pz)) != c0:
                return None
            haut = g.get(px, y + 1, pz)
            if u in (0, 3):
                tc = _tapis(haut)
                if not tc or (t and tc != t):
                    return None
                t = tc
            elif haut not in VERRES:
                return None
        # pas de beton au-dela des bouts (sinon c'est un sol)
    for u in (-1, 4):
        for v in range(2):
            px, pz = _p(x, z, a, u, v)
            if _beton(g.get(px, y, pz)) == c0 and g.get(px, y + 1, pz) != 'minecraft:air':
                return None
    brule = any(g.get(*_p(x, z, a, u, v)[:1], y + 1, _p(x, z, a, u, v)[1]) == 'minecraft:coal_block' for u in (1, 2) for v in range(2)) or c0 == 'black' and t == 'black'
    brise = any(g.get(_p(x, z, a, u, v)[0], y + 1, _p(x, z, a, u, v)[1]) == 'minecraft:gray_stained_glass' for u in (1, 2) for v in range(2))
    etat = 2 if brule else 1 if brise else 0
    coul = t if brule is False else 'black'
    r = _resultat(g, x, y, z, a, 4, 2, 3, 'berline', etat, 0, _boutons(g, x, y, z, a, 4, 2))
    r['couleur'] = coul
    return r


def _pickup(g, x, y, z, a):
    # dsPickup : 5 x 2 le long de x ; y+1 : verre teinte (u0), beton (u1), tapis/caisse/sac (u2-4) ; tapis au toit u0-1
    if a[0] != 'x':
        return None
    c0 = _beton(g.get(x, y, z))
    if not c0:
        return None
    for v in range(2):
        for u in range(5):
            px, pz = _p(x, z, a, u, v)
            if _beton(g.get(px, y, pz)) != c0:
                return None
        px, pz = _p(x, z, a, 0, v)
        if g.get(px, y + 1, pz) != 'minecraft:tinted_glass' or _tapis(g.get(px, y + 2, pz)) != c0:
            return None
        px, pz = _p(x, z, a, 1, v)
        if _beton(g.get(px, y + 1, pz)) != c0:
            return None
    r = _resultat(g, x, y, z, a, 5, 2, 3, 'pickup', 0, -1, _boutons(g, x, y, z, a, 5, 2))
    r['couleur'] = c0
    return r


def _car(g, x, y, z, a):
    # v2Car : 10 x 3 le long de x, beton, deux rangs de vitres noires (ou charbon), toit blanc
    if a[0] != 'x':
        return None
    c0 = _beton(g.get(x, y, z))
    if not c0:
        return None
    for u in range(10):
        for v in range(3):
            px, pz = _p(x, z, a, u, v)
            if _beton(g.get(px, y, pz)) != c0:
                return None
        for v in (0, 2):
            px, pz = _p(x, z, a, u, v)
            if u % 3 and g.get(px, y + 1, pz) not in ('minecraft:black_stained_glass', 'minecraft:coal_block'):
                return None
    toit = g.get(x + 4, y + 3, z + 1)
    if _beton(toit) is None:
        return None
    brule = g.get(x + 1, y + 1, z) == 'minecraft:coal_block'
    r = _resultat(g, x, y, z, a, 10, 3, 4, 'bus', 2 if brule else 0, 0, _boutons(g, x, y, z, a, 10, 3))
    r['couleur'] = c0
    return r


def _bus(g, x, y, z, a):
    # ruBus : 12 x 3 le long de x, chassis beton noir, caisse de couleur, vitres noires a y+2
    if a[0] != 'x' or g.get(x, y, z) != 'minecraft:black_concrete':
        return None
    for u in range(12):
        for v in range(3):
            if g.get(x + u, y, z + v) != 'minecraft:black_concrete':
                return None
    c0 = _beton(g.get(x, y + 1, z))
    if not c0 or c0 == 'black':
        return None
    for u in range(12):
        if g.get(x + u, y + 2, z) != 'minecraft:black_stained_glass' or g.get(x + u, y + 2, z + 2) != 'minecraft:black_stained_glass':
            return None
    r = _resultat(g, x, y, z, a, 12, 3, 4, 'bus', 0, 1)
    r['couleur'] = c0
    return r


def _camion(g, x, y, z, a):
    # gaCamion : 7 x 3 le long de x, cabine en u0-1 (pare-brise en u0, y+2), bache de laine u2-6 sur 3 de haut
    if a[0] != 'x':
        return None
    c0 = _beton(g.get(x, y, z + 1))
    if not c0 or g.get(x, y + 2, z + 1) != 'minecraft:tinted_glass':
        return None
    for u in (1, 5):
        if g.get(x + u, y, z) != 'minecraft:black_concrete' or g.get(x + u, y, z + 2) != 'minecraft:black_concrete':
            return None
    for u in range(2, 7):
        for k in range(1, 4):
            if not g.get(x + u, y + k, z + 1).endswith('_wool'):
                return None
    r = _resultat(g, x, y, z, a, 7, 3, 4, 'camion' if c0 != 'white' else 'ambulance', 0, -1)
    r['couleur'] = c0
    return r


def _fourgon(g, x, y, z, a):
    # prFourgon : 7 x 3 le long de x, beton blanc, bande bleue a y+1 sur les flancs, pare-brise en u0
    if a[0] != 'x' or g.get(x, y + 2, z + 1) != 'minecraft:tinted_glass':
        return None
    if g.get(x + 3, y + 1, z) != 'minecraft:blue_concrete' or g.get(x + 3, y + 1, z + 2) != 'minecraft:blue_concrete':
        return None
    for u in (1, 5):
        if g.get(x + u, y, z) != 'minecraft:black_concrete':
            return None
    if g.get(x + 3, y, z + 1) != 'minecraft:white_concrete':
        return None
    r = _resultat(g, x, y, z, a, 7, 3, 3, 'fourgon', 0, -1)
    r['couleur'] = 'white'
    return r


RURAUX = ('bidonville', 'bois', 'terracotta', 'garnison', 'base', 'rouille')


def variante(r, quartier=None):
    """Choisit l'objet MTS du pack atheriavh selon le modele, la couleur et l'etat de la maquette."""
    m, etat = r['modele'], r['etat']
    sub = COUL.get(r.get('couleur'), '_gris')
    alea = _h(r['graine'], r['x'], r['y'], r['z'])
    if m in ('berline', 'pickup', 'fourgon'):
        if m == 'berline' and alea < 0.18:
            m = 'fourgon'            # un peu de variete dans les files de voitures
        elif m == 'berline' and quartier in RURAUX and alea < 0.45:
            m = 'pickup'             # les maquettes de pick-up n'etaient que dans les rues : on en met ou ils sont vraisemblables
        if etat == 2:
            sub = '_brulee'
        elif etat == 1 and alea > 0.55 or etat == 0 and alea > 0.8:
            sub = '_rouille'
        return 'atheriavh.%s%s' % (m, sub)
    if m == 'bus':
        return 'atheriavh.bus%s' % ({'_rouge': '_rouge', '_bleu': '_bleu', '_vert': '_vert', '_jaune': '_jaune'}.get(sub, '_bleu' if alea < 0.5 else '_jaune'))
    if m == 'camion':
        return 'atheriavh.camion%s' % ({'_vert': '_vert', '_bleu': '_bleu', '_gris': '_gris'}.get(sub, '_sable'))
    if m == 'ambulance':
        return 'atheriavh.ambulance_blanc'
    return 'atheriavh.%s%s' % (m, sub)
