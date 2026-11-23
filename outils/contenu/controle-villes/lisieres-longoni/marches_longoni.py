# Detection des marches (sauts de hauteur du sol >= 3 entre voisins) autour de la ville close de Longoni, au pas de 1, carte finale en lecture seule
import os, sys
src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'releve_site.py'), encoding='utf-8').read().split('nom, x1, z1')[0]
exec(src)
def sol(x, z):
    c = chunk(x >> 4, z >> 4)
    if c is None or 'MOTION_BLOCKING_NO_LEAVES' not in c[1]: return None
    y = hauteur(c[1]['MOTION_BLOCKING_NO_LEAVES'], x, z) - 1
    b = bloc(c, x, y, z)
    return y, b.split(':')[-1]
X1, Z1, X2, Z2 = 2230, -3200, 2600, -2830
H = {}
for z in range(Z1, Z2 + 1):
    for x in range(X1, X2 + 1):
        H[(x, z)] = sol(x, z)
bandes = {'ouest': (2230, 2330, -3200, -2830), 'nord': (2230, 2600, -3200, -3095), 'est': (2440, 2600, -3200, -2830), 'sud': (2230, 2600, -2970, -2830)}
out = open('marches_longoni.csv', 'w', encoding='utf-8'); out.write('x,z,dy,y,y_voisin,bloc,bloc_voisin\n')
res = {}
for (x, z), v in H.items():
    if v is None: continue
    for dx, dz in ((1, 0), (0, 1)):
        w = H.get((x + dx, z + dz))
        if w is None: continue
        dy = abs(v[0] - w[0])
        if dy >= 3:
            nat_ = nat('minecraft:' + v[1]) and nat('minecraft:' + w[1])
            out.write(f'{x},{z},{dy},{v[0]},{w[0]},{v[1]},{w[1]}\n')
            for nb, (a, b, c_, d) in bandes.items():
                if a <= x <= b and c_ <= z <= d:
                    res.setdefault(nb, []).append((x, z, dy, v[1], w[1], nat_))
for nb, L in res.items():
    n_nat = [r for r in L if r[5]]
    print(nb, 'sauts>=3 :', len(L), 'dont sol naturel des deux cotes :', len(n_nat))
    for r in sorted(n_nat, key=lambda r: -r[2])[:8]: print('   ', r)
