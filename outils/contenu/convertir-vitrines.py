# Convertit les batiments vitrine exportes du jeu (lignes [EXP] du journal) en batiments Lost Cities multi-chunks.
# Chaque chunk du lot devient un batiment d'un seul etage : etage 0 = les 6 premieres tranches (sol compris), toit = tout le reste.
# Entree : les journaux d'export (un par quartier). Sorties :
# pack/kubejs/data/lostcities/lostcities/{parts,buildings,multibuildings}/ath_v_*.json, plus vitrines/index.json pour generer-villes.ps1.
import json, os, re, sys, glob, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vehicules_maquettes as VM

RACINE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SORTIE = os.environ.get('VITRINE_SORTIE')   # dossier d'essai a la place du pack (meme arborescence kubejs/data)
LC = os.path.join(SORTIE or os.path.join(RACINE, 'pack'), 'kubejs', 'data', 'lostcities', 'lostcities')
VIT = os.path.join(os.path.dirname(__file__), 'vitrines')

# graine du lot -> (nom, architecture Lost Cities)
QUARTIERS = {
    'bois': (131, 201), 'terracotta': (211, 281), 'gothique': (311, 381), 'haussmann': (411, 481),
    'beton': (611, 681), 'verre': (711, 781), 'moderne': (811, 881), 'rouille': (911, 981),
    'bidonville': (1011, 1081), 'garnison': (1111, 1181), 'hopital': (1211, 1231), 'prison': (1311, 1331), 'base': (1411, 1431),
    'reel_haussmann': (6501, 6581),   # refonte a l'echelle reelle (13/11) : quartiers entiers, rues comprises
}
NOMS_HAUSSMANN = {6501: 'hrRueHaussmann', 411: 'grand_magasin', 421: 'immeubles', 431: 'gare', 441: 'theatre', 451: 'halles', 461: 'hbm', 471: 'square', 481: 'banque'}
COFFRES = {'hopital': 'atheria_hopital', 'prison': 'atheria_prison', 'base': 'atheria_militaire', 'garnison': 'atheria_militaire'}


def noms_depuis_sources(dossier):
    noms = dict(NOMS_HAUSSMANN)
    for f in glob.glob(os.path.join(dossier, 'zz_vitrine_lot*.js')):
        if 'avant' in f:
            continue
        for m in re.finditer(r'lot\(QF(?:64)?\((\w+)[^;]*?,\s*-?\d+,\s*-?\d+,\s*999,\s*(\d+)', open(f, encoding='utf-8').read()):
            noms.setdefault(int(m.group(2)), m.group(1))
    return noms


def quartier(graine):
    # series 2 et 3 : memes plages decalees de 2000 et 4000 (ex. verre 2711-2791 et 4711-4781)
    for decalage in (0, 2000, 4000):
        for q, (a, b) in QUARTIERS.items():
            if a <= graine - decalage <= b + (10 if decalage else 0):  # series 2 et 3 : jusqu'a 9 lots (x91)
                return q
    return None


def lire_journal(chemin):
    lots = {}
    for ligne in open(chemin, encoding='utf-8', errors='replace'):
        i = ligne.find('[EXP] ')
        if i < 0:
            continue
        p = ligne[i + 6:].rstrip('\r\n').split(' ', 3)
        if p[0] == 'L':
            v = [int(x) for x in ligne[i + 8:].split()]
            lots[v[0]] = {'graine': v[1], 'w': v[4], 'd': v[5], 'h': v[6], 'pal': {}, 'tr': {}}
        elif p[0] == 'P':
            lots[int(p[1])]['pal'][int(p[2])] = p[3]
        elif p[0] == 'S':
            val = []
            for t in p[3].split(','):
                if '*' in t:
                    a, b = t.split('*'); val += [int(a)] * int(b)
                else:
                    val.append(int(t))
            lots[int(p[1])]['tr'][int(p[2])] = val
    return lots


# caracteres de palette : uniquement hors ASCII pour ne jamais croiser les palettes des styles
CARS = [chr(c) for c in list(range(0xC0, 0x250)) + list(range(0x391, 0x3CA)) + list(range(0x410, 0x450))]


def ecrire(chemin, obj):
    os.makedirs(os.path.dirname(chemin), exist_ok=True)
    with open(chemin, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)


# Retouches du 10/11 (retour de Mika) :
# - rideaux, tringles et volets retires de tous les builds (orientation jamais fiable) ;
# - une demi-dalle basse qui porte un bloc devient une dalle double, sinon le bloc du dessus flotte d'un demi-bloc.
RETIRES = re.compile(r'^mcwwindows:[a-z_]*(curtain|shutter)')
FLUIDES = ('minecraft:water', 'minecraft:lava', 'minecraft:bubble_column')
STATS = {'retires': 0, 'dalles': 0, 'vehicules': 0}
AVEC_VH = os.environ.get('VITRINE_VEHICULES') == '1'   # maquettes remplacees par des vehicules MTS (en essai)
VEHICULES = {}   # nom de batiment (chunk) -> [{id, x, y, z, yaw}] ; y = tranche depuis le sol de la ville
FICHIER_VH = os.path.join(SORTIE or os.path.join(RACINE, 'pack'), 'kubejs', 'data', 'atheria_monde', 'vehicules_vitrines.json')


def nettoyer(lot):
    pal, w, d = lot['pal'], lot['w'], lot['d']
    def indice(etat):
        for k, v in pal.items():
            if v == etat:
                return k
        k = max(pal) + 1
        pal[k] = etat
        return k
    air = indice('minecraft:air')
    retirer = {k for k, v in pal.items() if RETIRES.match(v)}
    hs = sorted(lot['tr'])
    for y in hs:
        v = lot['tr'][y]
        for i, k in enumerate(v):
            if k in retirer:
                v[i] = air; STATS['retires'] += 1
    basses = {k: v.replace('type=bottom', 'type=double').replace('waterlogged=true', 'waterlogged=false')
              for k, v in list(pal.items()) if '_slab[' in v and 'type=bottom' in v}
    if not basses:
        return
    doubles = {k: indice(e) for k, e in basses.items()}
    porteur = {k for k, v in pal.items() if v != 'minecraft:air' and not v.startswith(FLUIDES)}
    for a, b in zip(hs, hs[1:]):
        if b != a + 1:
            continue
        bas, haut = lot['tr'][a], lot['tr'][b]
        for i, k in enumerate(bas):
            if k in doubles and haut[i] in porteur:
                bas[i] = doubles[k]; STATS['dalles'] += 1


def convertir(nom, q, lot, vh=()):
    w, d, pal = lot['w'], lot['d'], lot['pal']
    hs = sorted(lot['tr'])
    air = [k for k, v in pal.items() if v == 'minecraft:air']
    air = air[0] if air else -1
    # tranches vides retirees en haut
    while hs and all(v == air for v in lot['tr'][hs[-1]]):
        hs.pop()
    base = 'ath_v_' + re.sub(r'([A-Z])', r'_\1', nom).lower()
    grille = []
    for cx in range(w // 16):
        col = []
        for cz in range(d // 16):
            b = '%s_%d%d' % (base, cx, cz)
            cars, palette = {}, []
            tranches = []
            for y in hs:
                v = lot['tr'][y]
                lignes = []
                for z in range(16):
                    s = ''
                    for x in range(16):
                        k = v[(cz * 16 + z) * w + cx * 16 + x]
                        etat = pal[k]
                        if etat == 'minecraft:air':
                            s += ' '; continue
                        if etat not in cars:
                            c = CARS[len(cars)]
                            cars[etat] = c
                            e = {'char': c, 'block': etat}
                            if etat.startswith('minecraft:chest[') or etat == 'minecraft:chest':
                                e['loot'] = COFFRES.get(q, 'chestloot')
                            palette.append(e)
                        s += cars[etat]
                    lignes.append(s)
                tranches.append(lignes)
            while len(tranches) < 7:
                tranches.append([' ' * 16] * 16)
            pp = {'palette': palette}
            ecrire(os.path.join(LC, 'parts', b + '_f.json'), {'xsize': 16, 'zsize': 16, 'palette': pp, 'slices': tranches[:6]})
            ecrire(os.path.join(LC, 'parts', b + '_t.json'), {'xsize': 16, 'zsize': 16, 'palette': pp, 'slices': tranches[6:]})
            ecrire(os.path.join(LC, 'buildings', b + '.json'), {'filler': '#', 'rubble': '}', 'minfloors': 1, 'maxfloors': 1, 'mincellars': 0, 'maxcellars': 0, 'overrideFloors': True, 'allowDoors': False, 'allowFillers': False,
                                                              'parts': [{'floor': 0, 'part': b + '_f'}, {'top': True, 'part': b + '_t'}]})
            for r in vh:
                if int(r['x']) // 16 == cx and int(r['z']) // 16 == cz and r['y'] in hs:
                    vx, vz = r['dir']
                    VEHICULES.setdefault(b, []).append({'id': VM.variante(r, q), 'x': round(r['x'] - cx * 16, 2), 'y': hs.index(r['y']),
                                                        'z': round(r['z'] - cz * 16, 2), 'cap': round(math.degrees(math.atan2(-vx, vz)) % 360)})
                    STATS['vehicules'] += 1
            col.append(b)
        grille.append(col)
    ecrire(os.path.join(LC, 'multibuildings', base + '.json'), {'dimx': w // 16, 'dimz': d // 16, 'buildings': grille})
    return base, len(hs)


def main():
    journaux = sys.argv[1:]
    sources = os.environ.get('VITRINE_SOURCES', '')
    noms = noms_depuis_sources(sources) if sources else {}
    index = json.load(open(os.path.join(VIT, 'index.json'), encoding='utf-8')) if os.path.exists(os.path.join(VIT, 'index.json')) else {}
    for j in journaux:
        for i, lot in sorted(lire_journal(j).items()):
            g = lot['graine']; q = quartier(g); nom = noms.get(g, 'lot%d' % g)
            if not q:
                print('graine inconnue', g); continue
            nettoyer(lot)
            vh = VM.chercher(lot, g) if AVEC_VH else ()
            base, h = convertir(nom, q, lot, vh)
            index.setdefault(q, {})[base] = {'graine': g, 'dimx': lot['w'] // 16, 'dimz': lot['d'] // 16, 'hauteur': h}
            print('%-12s %-32s %dx%d chunks, %d tranches, %d etats' % (q, base, lot['w'] // 16, lot['d'] // 16, h, len(lot['pal'])))
    if not SORTIE:
        ecrire(os.path.join(VIT, 'index.json'), index)
    if AVEC_VH:
        ecrire(FICHIER_VH, VEHICULES)
    print('rideaux et volets retires : %d blocs ; dalles basses rendues pleines sous un bloc : %d ; vehicules MTS a poser : %d' % (STATS['retires'], STATS['dalles'], STATS['vehicules']))


if __name__ == '__main__':
    main()
