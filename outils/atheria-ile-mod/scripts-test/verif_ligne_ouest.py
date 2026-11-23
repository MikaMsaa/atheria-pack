# Verifs de la ligne principale par le portail ouest (15/11) : troncon 2496,-3000 -> 2456,-2872, bassin du port lot67, recouvrement au portail ouest.
# usage : python -I verif_ligne_ouest.py "<monde1;monde2;...>"
import sys, os, runpy, io, contextlib, math, collections
ICI = os.path.dirname(os.path.abspath(sys.argv[0]))
W = sys.argv[1]
sys.argv = [os.path.join(ICI, 'couverture_tram.py'), W, '']
buf = io.StringIO()
with contextlib.redirect_stdout(buf):
    g = runpy.run_path(os.path.join(ICI, 'couverture_tram.py'), run_name='x')
NV, cc, colonne, dseg, reg = g['NV'], g['couloir_cols'], g['colonne'], g['dseg'], g['reg']
L = NV['Ligne principale']; Em = NV['Embranchement']
print('Ligne principale lue dans', os.path.basename(g['REG']), ':', L['points'][:4], '... y', L['y_min'], '..', L['y_max'], 'largeur', L['largeur_blocs'])
# 1. troncon neuf : 3 premiers segments (2496,-3000 -> 2484,-3000 -> 2484,-2984 -> 2456,-2872)
T = L['points'][:4]
cols = cc(T, L['largeur_blocs'])
res = []; src = collections.Counter()
for (x, z) in cols:
    s, so, eau = colonne(x, z); src[so] += 1
    if s is not None: res.append((s - L['y_max'], x, z, so, eau))
res.sort()
print('1. Troncon neuf 2496,-3000 -> 2456,-2872 : %d colonnes, lues %d (%s)' % (len(cols), len(res), ', '.join('%s %d' % kv for kv in src.items())))
if res:
    cv = [r[0] for r in res]
    print('   couverture min %.1f, p5 %.1f, mediane %.1f ; eau au-dessus : %d colonnes' % (cv[0], cv[len(cv) // 20], cv[len(cv) // 2], sum(1 for r in res if r[4])))
    vus = []
    for c, x, z, so, eau in res:
        if any(math.hypot(x - a, z - b) < 12 for a, b in vus): continue
        vus.append((x, z)); print('     %.1f en %d,%d (%s)' % (c, x, z, so))
        if len(vus) >= 5: break
# 2. bassin du port : x 2549..2575 (z du lot67 -3088..-2960), eau Y 57..62, fond Y 56 -> aucune colonne du tunnel + demi-largeur 5 + marge 4 dessous
l67 = [l for l in reg['lots'] if l['nom'].startswith('lot67')][0]
bx1, bx2, bz1, bz2 = 2549, 2575, l67['z1'], l67['z2'] - 1
pire = None
for v in (L, Em):
    for x in range(bx1, bx2 + 1):
        for z in range(bz1, bz2 + 1):
            d = min(dseg(x + 0.5, z + 0.5, v['points'][i], v['points'][i + 1])[0] for i in range(len(v['points']) - 1))
            if pire is None or d < pire[0]: pire = (d, v['nom'], x, z)
print('2. Bassin x %d..%d, z %d..%d : distance mini a un axe de tunnel %.1f blocs (%s, en %d,%d) ; il faut > 5 + 4 = 9 -> %s' % (bx1, bx2, bz1, bz2, pire[0], pire[1], pire[2], pire[3], 'OK' if pire[0] > 9 else 'KO'))
print('   en hauteur : voute y_max %d, fond du bassin Y 56 : le tunnel est sous le bassin seulement s il passe dessous ; hors trace -> %s' % (L['y_max'], 'OK' if pire[0] > 9 else 'a voir'))
print('   reste du sous-sol du port (rien sous Y 59) : y_max %d -> %d blocs libres au-dessus de la voute, %s' % (L['y_max'], 59 - L['y_max'] - 1, 'OK (>= 0)' if L['y_max'] < 59 else 'KO'))
# 3. recouvrement au portail ouest avec l embranchement, x 2484..2496
A = set(cc(L['points'], L['largeur_blocs'])); B = set(cc(Em['points'], Em['largeur_blocs']))
I = A & B
xs = sorted({x for x, z in I}); zs = sorted({z for x, z in I})
print('3. Recouvrement ligne / embranchement : %d colonnes, x %s..%s, z %s..%s (attendu x 2484..2496)' % (len(I), xs[0] if xs else '-', xs[-1] if xs else '-', zs[0] if zs else '-', zs[-1] if zs else '-'))
hors = [c for c in I if not (2479 <= c[0] <= 2501)]
print('   colonnes communes hors x 2479..2501 (axe +-5) : %d -> %s' % (len(hors), 'OK' if not hors else 'KO'))
print('   portail ouest x 2496, z -3003..-2998 : ligne %s, embranchement %s' % ('dedans' if all((2496, z) in A or (2495, z) in A for z in range(-3003, -2997)) else 'PAS dedans', 'dedans' if all((2496, z) in B or (2495, z) in B for z in range(-3003, -2997)) else 'PAS dedans'))
# ancien portail est x 2543 : la ligne n y passe plus
print('   ancien portail est x 2543 : ligne %s' % ('encore dedans' if any((x, z) in A for x in range(2538, 2549) for z in range(-3003, -2997)) else 'n y passe plus'))
