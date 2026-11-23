"""Comparaison bloc a bloc PAR CATEGORIE entre deux mondes de meme graine (lecture seule).
Categories (exigence « 100 % identique ») : RN1, lots, villes/bati, terrain.
A part (limite vanilla) : elements naturels (filons, arbres, plantes) en bord de chunk ; signales aussi s'ils sont a l'interieur.
Usage : python -I comparer_categories.py <mondeA> <mondeB> x1 z1 x2 z2 <regions.json> [sortie.md]
"""
import sys, os, json, math, re, collections

ICI = os.path.dirname(os.path.abspath(__file__))
_src = open(os.path.join(ICI, 'comparer_blocs.py'), encoding='utf-8').read().replace('\nmain()', '\n')
_m = {}; exec(_src, _m)
chunk, blocs, base, naturel = _m['chunk'], _m['blocs'], _m['base'], _m['naturel']

# matiere du terrain (sol, roche, eau) : tout ecart = KO
TERRAIN = re.compile(r'minecraft:(air|cave_air|stone|andesite|diorite|granite|tuff|calcite|deepslate|dirt|coarse_dirt|rooted_dirt|grass_block|podzol|mycelium|gravel|sand|red_sand|sandstone|clay|water|lava|bedrock|mud|packed_mud|terracotta|.*_terracotta|snow_block|ice|packed_ice|powder_snow|smooth_basalt|dripstone_block|obsidian|magma_block)$')
# roches et sols massifs : un echange solide <-> solide entre eux = poche/filon (feature placee), pas la forme du terrain
ROCHE = re.compile(r'(minecraft:(stone|andesite|diorite|granite|tuff|calcite|deepslate|dirt|coarse_dirt|rooted_dirt|gravel|clay|sand|sandstone|.*_ore|raw_.*|dripstone_block|smooth_basalt|magma_block|obsidian|infested_.*)|create:(.*_ore|asurine|crimsite|ochrum|veridium|limestone|scorchia|scoria)|jurassicreborn:.*)$')
VIDE = re.compile(r'minecraft:(air|cave_air|void_air|water|lava)$')
# variantes de palette Lost Cities connues (GenerationContext.nextPaletteIndex) : signalees a part
VARIANTES_LC = [{'minecraft:moss_block', 'minecraft:mossy_cobblestone', 'minecraft:mossy_stone_bricks'},
                {'minecraft:iron_block', 'minecraft:light_gray_concrete'}, {'minecraft:andesite', 'minecraft:polished_andesite'}]
def variante_lc(p, q):
    if p.endswith('stained_glass') and q.endswith('stained_glass') or p.endswith('stained_glass_pane') and q.endswith('stained_glass_pane'): return True
    return any(p in v and q in v for v in VARIANTES_LC)
BORD = 3  # blocs depuis le bord du chunk consideres « bord » pour les elements naturels


def segments(points):
    return [(points[i], points[i + 1]) for i in range(len(points) - 1)]


def dist_seg(px, pz, a, b):
    ax, az = a; bx, bz = b; dx, dz = bx - ax, bz - az
    l2 = dx * dx + dz * dz
    t = 0 if l2 == 0 else max(0.0, min(1.0, ((px - ax) * dx + (pz - az) * dz) / l2))
    return math.hypot(px - (ax + t * dx), pz - (az + t * dz))


def main():
    A, B = sys.argv[1], sys.argv[2]
    x1, z1, x2, z2 = map(int, sys.argv[3:7])
    reg = json.load(open(sys.argv[7], encoding='utf-8'))
    sortie = sys.argv[8] if len(sys.argv) > 8 else None
    routes = []
    for r in reg.get('routes', []):
        emprise = r['largeur_blocs'] / 2 + r.get('bas_cotes_blocs', 0) + r.get('talus_blocs', 0)
        routes.append((r['nom'], segments(r['points']), emprise))
    lots = [(l['nom'], l['x1'] - l.get('marge_blocs', 0), l['z1'] - l.get('marge_blocs', 0), l['x2'] + l.get('marge_blocs', 0), l['z2'] + l.get('marge_blocs', 0)) for l in reg.get('lots', [])]

    cpt = collections.Counter(); paires = collections.defaultdict(collections.Counter); ex = collections.defaultdict(list)
    nb_chunks = manq = 0
    for cx in range(x1 >> 4, (x2 >> 4) + 1):
        for cz in range(z1 >> 4, (z2 >> 4) + 1):
            a = chunk(A, cx, cz); b = chunk(B, cx, cz)
            if a is None or b is None or a.get('Status') != 'minecraft:full' or b.get('Status') != 'minecraft:full':
                manq += 1; continue
            nb_chunks += 1
            # zones du chunk (calculees une fois par colonne)
            col_route, col_lot = {}, {}
            ba, bb = blocs(a), blocs(b)
            for y in set(ba) | set(bb):
                la = ba.get(y, ['minecraft:air'] * 4096); lb = bb.get(y, ['minecraft:air'] * 4096)
                if la == lb: continue
                for i in range(4096):
                    if la[i] == lb[i]: continue
                    lx, lz, ly = i & 15, (i >> 4) & 15, i >> 8
                    x, z = cx * 16 + lx, cz * 16 + lz
                    k = (lx, lz)
                    if k not in col_route:
                        col_route[k] = next((n for n, segs, e in routes if any(dist_seg(x, z, s0, s1) <= e for s0, s1 in segs)), None)
                        col_lot[k] = next((n for n, ax, az, bx, bz in lots if ax <= x < bx and az <= z < bz), None)
                    p, q = base(la[i]), base(lb[i])
                    CONT = re.compile(r'(minecraft:(air|chest|barrel|trapped_chest)|lootr:.*)$')
                    nat = (naturel(p) or ROCHE.match(p)) and (naturel(q) or ROCHE.match(q))
                    if p == q: cat = 'etat de bloc seulement (connexions vitres, orientations)'
                    elif ROCHE.match(p) and ROCHE.match(q): cat = 'poches et filons souterrains (features, ordre de generation)'
                    elif nat and TERRAIN.match(p) and TERRAIN.match(q) and bool(VIDE.match(p)) != bool(VIDE.match(q)): cat = 'terrain : forme (plein <-> vide)'
                    elif CONT.match(p) and CONT.match(q): cat = 'contenants (coffres aleatoires atheria_coffres / lootr)'
                    elif variante_lc(p, q): cat = 'variantes de palette Lost Cities (connues)'
                    elif not nat:
                        cat = ('RN1 (emprise route)' if col_route[k] == 'RN1' else 'route ' + col_route[k]) if col_route[k] else 'lots' if col_lot[k] else 'villes / bati / mods'
                    else:
                        bord = min(lx, 15 - lx, lz, 15 - lz) < BORD
                        cat = 'naturel de surface, bord de chunk (limite vanilla)' if bord else 'naturel de surface, interieur'
                    cpt[cat] += 1; paires[cat][(p, q)] += 1
                    if len(ex[cat]) < 8: ex[cat].append((x, y * 16 + ly, z, p, q))
    STRICT = ['RN1 (emprise route)', 'lots', 'villes / bati / mods', 'terrain : forme (plein <-> vide)']
    L = ['# Comparaison par categorie', '', 'A = %s' % A, 'B = %s' % B, 'zone %d %d .. %d %d ; chunks complets compares %d ; absents/incomplets %d' % (x1, z1, x2, z2, nb_chunks, manq), '',
         '| categorie | blocs differents | exigence | verdict |', '|---|---|---|---|']
    for c in STRICT + sorted(set(cpt) - set(STRICT)):
        exig = '0 (identique)' if c in STRICT or c.startswith('route ') else 'signale a part'
        verdict = ('OK' if cpt[c] == 0 else 'KO') if exig.startswith('0') else '-'
        L.append('| %s | %d | %s | %s |' % (c, cpt[c], exig, verdict))
    for c in cpt:
        L += ['', '## %s' % c, '']
        for (p, q), n in paires[c].most_common(15): L.append('- %s -> %s : %d' % (p, q, n))
        L.append('- exemples : ' + '; '.join('%d %d %d %s->%s' % e for e in ex[c]))
    txt = '\n'.join(L) + '\n'
    print(txt)
    if sortie: open(sortie, 'w', encoding='utf-8').write(txt)


if __name__ == '__main__':
    main()
