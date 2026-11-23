# Diagnostic hors ligne des KO de c21 (lecture seule). usage : python -I diag_c21.py <monde>
import sys, os, json, collections
W = sys.argv[1]
ICI = os.path.dirname(os.path.abspath(sys.argv[0])); SC = os.path.join(ICI, '..', 'sculpture')
G = {'__file__': os.path.join(SC, 'classement_cubique.py')}
src = open(os.path.join(SC, 'classement_cubique.py'), encoding='utf-8').read().split('def vignette')[0]
_a = sys.argv; sys.argv = [sys.argv[0]]; exec(src, G); sys.argv = _a
lire, carte, mesure = G['lire'], G['carte'], G['mesure']; G['R'] = 64
for cle in ([] if os.environ.get('VAR') else (sys.argv[2:] or ['z006', 'hum', 'z002'])):
    me = json.load(open(os.path.join(SC, cle, 'mesure.json'), encoding='utf-8')); cx0, cz0 = me['x0'] + 80, me['z0'] + 80
    H, E = carte(W, cx0, cz0)
    m = mesure(H, E, cx0, cz0)
    print(cle, 'centre', cx0, cz0, m)
    # blocs de surface reels (premier non air) et sol retenu
    top = collections.Counter(); retenu = collections.Counter(); bas = 0
    CH = {}
    def b(x, y, z):
        k = (x >> 4, z >> 4)
        if k not in CH: CH[k] = lire(W, *k)[1]
        L = CH[k].get((y >> 4) + 256 if y < 0 else y >> 4)
        return 'air' if L is None else L[((y & 15) << 8) | ((z & 15) << 4) | (x & 15)].split('[')[0].split(':')[-1]
    xs = range(cx0 - 62, cx0 + 62); zs = range(cz0 - 62, cz0 + 62)
    for x in xs[::3]:
        for z in zs[::3]:
            for y in range(140, 20, -1):
                n = b(x, y, z)
                if n not in ('air', 'cave_air'): top[n] += 1; break
            y = H[(x, z)]
            retenu[b(x, y, z) if y > -64 else 'AUCUN'] += 1
            if y < 50: bas += 1
    print('  surface vue (1er bloc) :', top.most_common(10))
    print('  sol retenu par la mesure :', retenu.most_common(10), '; sol sous Y 50 :', bas)
    # angles : ou sont-ils, et quel ecart
    ang = []
    for x in xs:
        for z in zs:
            if E[(x, z)]: continue
            dx = H.get((x + 1, z), H[(x, z)]) - H[(x, z)]; dz = H.get((x, z + 1), H[(x, z)]) - H[(x, z)]
            if abs(dx) >= 2 and abs(dz) >= 2 and H.get((x + 1, z + 1)) == H[(x, z)] + dx and H.get((x + 1, z + 1)) == H[(x, z)] + dz: ang.append((x, z, dx, dz, H[(x, z)]))
    print('  angles :', len(ang), 'exemples', ang[:8])
    if ang:
        x, z = ang[0][:2]
        for zz in range(z - 2, z + 4):
            print('   ', ' '.join('%4d' % H[(xx, zz)] for xx in range(x - 3, x + 5)), '|', ' '.join(b(xx, H[(xx, zz)], zz)[:6] for xx in range(x - 3, x + 5)))
        # au-dessus du sol retenu sur la colonne d'angle
        x, z = ang[0][0] + 1, ang[0][1] + 1
        print('    colonne', x, z, [(y, b(x, y, z)) for y in range(H[(x, z)], H[(x, z)] + 12)])

def variantes(W, cle):
    me = json.load(open(os.path.join(SC, cle, 'mesure.json'), encoding='utf-8')); cx0, cz0 = me['x0'] + 80, me['z0'] + 80
    H, E = carte(W, cx0, cz0); CH = {}
    def b(x, y, z):
        k = (x >> 4, z >> 4)
        if k not in CH: CH[k] = lire(W, *k)[1]
        L = CH[k].get((y >> 4) + 256 if y < 0 else y >> 4)
        return 'air' if L is None else L[((y & 15) << 8) | ((z & 15) << 4) | (x & 15)].split('[')[0].split(':')[-1]
    arbre = set()
    for (x, z), y in H.items():
        if any(any(t in b(x, yy, z) for t in ('_log', '_wood', 'roots', 'stem', 'propagule')) for yy in range(y + 1, y + 9)): arbre.add((x, z))
    out = {'A actuel': mesure(H, E, cx0, cz0)}
    HB = {k: v for k, v in H.items() if k not in arbre}; EB = {k: E[k] for k in HB}
    def mes(H2, E2):
        # mesure() indexe E et H sur toute la grille : on remet les absents comme eau (exclus) et H = voisin neutre
        E3 = {k: E2.get(k, True) for k in E}; return mesure({**{k: None for k in H}, **H2} if False else H2 | {k: v for k, v in H.items() if k not in H2 and False}, E3, cx0, cz0)
    out['B sans pieds d arbre'] = mesure(HB | {}, {k: (E[k] or k in arbre) for k in E}, cx0, cz0) if False else None
    # B : colonnes d'arbre retirees de la terre et neutres comme voisines
    def neutre(Hs, ex):
        H2 = dict(Hs)
        for k in ex: H2.pop(k, None)
        E2 = {k: (E[k] or k in ex) for k in E}
        for k in ex: H2[k] = None
        return H2, E2
    def mesure2(H2, E2):
        # copie de mesure() qui ignore les voisins None
        R = G['R']; xs = range(cx0 - R + 2, cx0 + R - 2); zs = range(cz0 - R + 2, cz0 + R - 2)
        terre = [(x, z) for x in xs for z in zs if not E2[(x, z)] and H2.get((x, z)) is not None]
        g = lambda k, d: d if H2.get(k) is None else H2[k]
        plats = sum(1 for (x, z) in terre if all(H2.get((x + a, z + c)) == H2[(x, z)] for a in (-2, -1, 0, 1, 2) for c in (-2, -1, 0, 1, 2)))
        marches = droites = 0
        for (x, z) in terre:
            for (a, c, pa, pb) in ((1, 0, 0, 1), (0, 1, 1, 0)):
                d = g((x + a, z + c), H2[(x, z)]) - H2[(x, z)]
                if abs(d) < 2: continue
                marches += 1
                if all(g((x + pa * k, z + pb * k), 0) - g((x + pa * k + a, z + pb * k + c), 0) == -d for k in (-2, -1, 1, 2)): droites += 1
        angles = 0
        for (x, z) in terre:
            h0 = H2[(x, z)]; dx = g((x + 1, z), h0) - h0; dz = g((x, z + 1), h0) - h0; d11 = g((x + 1, z + 1), None)
            if abs(dx) >= 2 and abs(dz) >= 2 and d11 == h0 + dx and d11 == h0 + dz: angles += 1
        n = len(terre); p, m, dr, an = plats / n, marches / n, droites / max(1, marches), angles / n
        return dict(terre=n, plats=round(100 * p, 1), angles_pour_mille=round(1000 * an, 2), marches_droites=round(100 * dr, 1), score=round(100 * (0.45 * p + 0.35 * dr * min(1, m * 8) + 0.20 * min(1, an * 50)), 1))
    H2, E2 = neutre(H, arbre); out['B pieds d arbre neutres'] = mesure2(H2, E2)
    eau = {k for k in E if E[k]}
    H3, E3 = neutre(H, arbre | eau); out['C + colonnes d eau neutres'] = mesure2(H3, E3)
    E4 = {k: (k in arbre) for k in E}; H4 = dict(H2); out['D + fond sous l eau compte'] = mesure2(H4, E4)
    print(cle, 'prevu', me['apres']['score'], 'colonnes arbre', len(arbre))
    for k, v in out.items(): print('   ', k, v)
if __name__ == '__main__' and os.environ.get('VAR'):
    for c in (os.environ.get('ZONES') or 'z006,hum,z002,z001,z008').split(','): variantes(W, c)
