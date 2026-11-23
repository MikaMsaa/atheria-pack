# Compare bloc par bloc deux mondes sur une zone (x1 z1 x2 z2), chunks complets seulement.
# usage: python -I comparer_blocs.py mondeA mondeB x1 z1 x2 z2 [sortie.md]
import sys, os, struct, zlib, gzip, io, collections

def nbt(buf):
    f = io.BytesIO(buf)
    def rd(n): return f.read(n)
    def payload(t):
        if t == 1: return struct.unpack('>b', rd(1))[0]
        if t == 2: return struct.unpack('>h', rd(2))[0]
        if t == 3: return struct.unpack('>i', rd(4))[0]
        if t == 4: return struct.unpack('>q', rd(8))[0]
        if t == 5: return struct.unpack('>f', rd(4))[0]
        if t == 6: return struct.unpack('>d', rd(8))[0]
        if t == 7: n = struct.unpack('>i', rd(4))[0]; return rd(n)
        if t == 8: n = struct.unpack('>H', rd(2))[0]; return rd(n).decode('utf-8', 'replace')
        if t == 9:
            et = rd(1)[0]; n = struct.unpack('>i', rd(4))[0]
            return [payload(et) for _ in range(n)]
        if t == 10:
            d = {}
            while True:
                et = rd(1)[0]
                if et == 0: return d
                n = struct.unpack('>H', rd(2))[0]; k = rd(n).decode('utf-8', 'replace')
                d[k] = payload(et)
        if t == 11: n = struct.unpack('>i', rd(4))[0]; return struct.unpack('>%di' % n, rd(4 * n))
        if t == 12: n = struct.unpack('>i', rd(4))[0]; return struct.unpack('>%dq' % n, rd(8 * n))
        raise ValueError(t)
    t = rd(1)[0]; n = struct.unpack('>H', rd(2))[0]; rd(n)
    return payload(t)

def chunk(monde, cx, cz):
    p = os.path.join(monde, 'region', 'r.%d.%d.mca' % (cx >> 5, cz >> 5))
    if not os.path.exists(p): return None
    with open(p, 'rb') as f:
        i = 4 * ((cx & 31) + (cz & 31) * 32)
        f.seek(i); o = f.read(4)
        if len(o) < 4: return None
        off = (o[0] << 16 | o[1] << 8 | o[2]) * 4096
        if off == 0: return None
        f.seek(off); ln, comp = struct.unpack('>iB', f.read(5)); data = f.read(ln - 1)
    raw = zlib.decompress(data) if comp == 2 else gzip.decompress(data) if comp == 1 else data
    return nbt(raw)

def nom(e):
    s = e.get('Name', '?'); pr = e.get('Properties')
    if pr: s += '[' + ','.join('%s=%s' % (k, pr[k]) for k in sorted(pr)) + ']'
    return s

def blocs(c):
    """dict y_section -> liste de 4096 noms (index y*256+z*16+x)"""
    out = {}
    for s in c.get('sections', []):
        bs = s.get('block_states')
        if not bs: continue
        pal = [nom(e) for e in bs['palette']]
        if len(pal) == 1 or 'data' not in bs:
            out[s['Y']] = [pal[0]] * 4096; continue
        bits = max(4, (len(pal) - 1).bit_length()); per = 64 // bits; mask = (1 << bits) - 1
        v = []
        for L in bs['data']:
            L &= (1 << 64) - 1
            for k in range(per):
                if len(v) == 4096: break
                v.append(pal[(L >> (k * bits)) & mask])
        out[s['Y']] = v
    return out

def base(n): return n.split('[')[0]

import re
NATUREL = re.compile(r'minecraft:(air|cave_air|stone|andesite|diorite|granite|tuff|calcite|deepslate|dirt|coarse_dirt|rooted_dirt|grass_block|podzol|mycelium|gravel|sand|red_sand|sandstone|clay|water|lava|bedrock|moss_block|moss_carpet|.*_ore|raw_.*|.*_leaves|.*_log|.*_wood|short_grass|tall_grass|fern|large_fern|.*_flower|dandelion|poppy|.*tulip|oxeye_daisy|cornflower|azure_bluet|allium|blue_orchid|lily_of_the_valley|sunflower|lilac|rose_bush|peony|.*_sapling|vine|glow_lichen|dripstone_block|pointed_dripstone|smooth_basalt|amethyst.*|budding_amethyst|seagrass|tall_seagrass|kelp|kelp_plant|snow|snow_block|ice|packed_ice|powder_snow|sweet_berry_bush|pumpkin|melon|sugar_cane|cactus|dead_bush|bamboo|cocoa|mushroom.*|brown_mushroom|red_mushroom|.*_mushroom_block|hanging_roots|spore_blossom|azalea|flowering_azalea|big_dripleaf.*|small_dripleaf|cobweb|bee_nest|copper_ore|infested_.*|magma_block|obsidian|terracotta|.*_terracotta|mud|packed_mud|mangrove_roots|muddy_mangrove_roots|lily_pad|bubble_column|pink_petals|.*_vines.*|.*_plant)$')
def naturel(n): return bool(NATUREL.match(n)) or not n.startswith('minecraft:') and False

def main():
    A, B = sys.argv[1], sys.argv[2]
    x1, z1, x2, z2 = map(int, sys.argv[3:7])
    sortie = sys.argv[7] if len(sys.argv) > 7 else None
    tot = ident = manq = 0; diffs = collections.Counter(); chunks_diff = []
    for cx in range(x1 >> 4, (x2 >> 4) + 1):
        for cz in range(z1 >> 4, (z2 >> 4) + 1):
            a = chunk(A, cx, cz); b = chunk(B, cx, cz)
            if a is None or b is None or a.get('Status') != 'minecraft:full' or b.get('Status') != 'minecraft:full':
                manq += 1; continue
            tot += 1
            ba, bb = blocs(a), blocs(b); nd = 0
            for y in set(ba) | set(bb):
                la = ba.get(y, ['minecraft:air'] * 4096); lb = bb.get(y, ['minecraft:air'] * 4096)
                if la == lb: continue
                for i in range(4096):
                    if la[i] != lb[i]:
                        nd += 1; diffs[(base(la[i]), base(lb[i]))] += 1
            if nd == 0: ident += 1
            else: chunks_diff.append((cx, cz, nd))
    lignes = ['# Comparaison bloc par bloc', '', 'A = %s' % A, 'B = %s' % B, 'zone %d %d .. %d %d' % (x1, z1, x2, z2), '',
              'chunks complets comparés : %d ; identiques : %d ; différents : %d ; absents/incomplets : %d' % (tot, ident, len(chunks_diff), manq),
              'blocs différents au total : %d' % sum(diffs.values()), '', '## Paires (A -> B) les plus fréquentes', '']
    nat = sum(n for (p, q), n in diffs.items() if naturel(p) and naturel(q))
    lignes.insert(8, 'dont paires 100 %% naturelles (filons, sol, arbres, eau) : %d ; paires avec un bloc construit ou de mod : %d' % (nat, sum(diffs.values()) - nat))
    for (p, q), n in diffs.most_common(40): lignes.append('- %s -> %s : %d' % (p, q, n))
    lignes += ['', '## Paires avec un bloc construit ou de mod', '']
    for (p, q), n in [t for t in diffs.most_common() if not (naturel(t[0][0]) and naturel(t[0][1]))][:40]: lignes.append('- %s -> %s : %d' % (p, q, n))
    lignes += ['', '## Chunks différents (cx cz nb)', '']
    for cx, cz, nd in sorted(chunks_diff, key=lambda t: -t[2])[:60]: lignes.append('- %d %d : %d (bloc %d %d)' % (cx, cz, nd, cx * 16, cz * 16))
    txt = '\n'.join(lignes) + '\n'
    print(txt)
    if sortie:
        with open(sortie, 'w', encoding='utf-8') as f: f.write(txt)

main()
