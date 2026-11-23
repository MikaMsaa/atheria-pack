# Analyse statique en lecture seule : quelles structures peuvent apparaitre sur l'ile (atheria_ile).
import json, os, re, zipfile, io, glob
from collections import defaultdict, OrderedDict
R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MC = os.path.join(R, 'instances', 'Atheria', 'minecraft')
ILE = os.path.join(R, 'outils', 'atheria-ile-mod')


def lj(b):
    if isinstance(b, bytes):
        b = b.decode('utf-8-sig', 'replace')
    try:
        return json.loads(b)
    except Exception:
        try:
            return json.loads(re.sub(r'(?m)^\s*//.*$', '', b))
        except Exception:
            return None


sources = []  # (nom, {chemin: ref}) dans l'ordre de chargement


def src_zip(nom, z, prof=0):
    files = {}
    for n in z.namelist():
        if n.startswith('data/') and n.endswith('.json'):
            files[n] = (z, n)
        elif prof < 2 and n.endswith('.jar') and 'META-INF/jarjar' in n:
            try:
                src_zip(nom + '!' + os.path.basename(n), zipfile.ZipFile(io.BytesIO(z.read(n))), prof + 1)
            except Exception:
                pass
    if files:
        sources.append((nom, files))


def src_dir(nom, d):
    files = {}
    for root, _, fs in os.walk(d):
        for f in fs:
            if f.endswith('.json'):
                p = os.path.join(root, f)
                files['data/' + os.path.relpath(p, d).replace('\\', '/')] = (None, p)
    sources.append((nom, files))


def lire(ref):
    z, n = ref
    if z is None:
        with open(n, 'rb') as f:
            return lj(f.read())
    return lj(z.read(n))


vanilla = os.path.join(R, 'serveur', 'libraries', 'net', 'minecraft', 'server', '1.21.1-20240808.144430', 'server-1.21.1-20240808.144430-extra.jar')
if os.path.exists(vanilla):
    src_zip('vanilla 1.21.1', zipfile.ZipFile(vanilla))
else:
    vanilla = None
neo = sorted(glob.glob(os.path.join(R, 'serveur', 'libraries', 'net', 'neoforged', 'neoforge', '*', 'neoforge-*-universal.jar')))
if neo:
    src_zip('neoforge (tags c:)', zipfile.ZipFile(neo[-1]))
jars =sorted(glob.glob(os.path.join(MC, 'mods', '*.jar')))
for j in jars:
    try:
        src_zip(os.path.basename(j), zipfile.ZipFile(j))
    except Exception as e:
        print('jar illisible', j, e)
zp = os.path.join(ILE, 'atheria_ile_datapack.zip')
if os.path.exists(zp):
    src_zip('atheria_ile_datapack.zip', zipfile.ZipFile(zp))
if os.path.isdir(os.path.join(ILE, 'datapack', 'data')):
    src_dir('atheria-ile-mod/datapack', os.path.join(ILE, 'datapack', 'data'))
src_dir('kubejs/data', os.path.join(MC, 'kubejs', 'data'))


def rid(path, kind):
    m = re.match(r'data/([^/]+)/' + re.escape(kind) + r'/(.+)\.json$', path)
    return (m.group(1) + ':' + m.group(2)) if m else None


biome_tags = defaultdict(list)
struct_tags = defaultdict(list)
structures = OrderedDict()
struct_src = defaultdict(list)
biomes_def = set()
sets = {}
litho = []
for nom, files in sources:
    for p, ref in files.items():
        if '/tags/worldgen/biome/' in p:
            t = rid(p, 'tags/worldgen/biome')
            d = lire(ref) if t else None
            if isinstance(d, dict):
                if d.get('replace'):
                    biome_tags[t] = []
                biome_tags[t].append((nom, d.get('values', [])))
        elif '/tags/worldgen/structure/' in p:
            t = rid(p, 'tags/worldgen/structure')
            d = lire(ref) if t else None
            if isinstance(d, dict):
                if d.get('replace'):
                    struct_tags[t] = []
                struct_tags[t].append((nom, d.get('values', [])))
        elif '/worldgen/structure_set/' in p:
            s = rid(p, 'worldgen/structure_set')
            d = lire(ref) if s else None
            if isinstance(d, dict):
                sets[s] = d
        elif '/worldgen/structure/' in p:
            s = rid(p, 'worldgen/structure')
            d = lire(ref) if s else None
            if isinstance(d, dict):
                structures[s] = d
                struct_src[s].append(nom)
        elif '/worldgen/biome/' in p and '/tags/' not in p:
            b = rid(p, 'worldgen/biome')
            if b:
                biomes_def.add(b)
        elif p.startswith('data/yungsbridges/neoforge/biome_modifier/'):
            structures['yungsbridges:bridge_addition (feature)'] = lire(ref) or {}
            struct_src['yungsbridges:bridge_addition (feature)'].append(nom)
        elif '/lithostitched/worldgen_modifier/' in p:
            litho.append((nom, p, lire(ref)))


def vid(v):
    return v.get('id') if isinstance(v, dict) else v


non_resolus = set()


def resoudre_tag(t, tags, vu=None):
    vu = vu if vu is not None else set()
    if t in vu:
        return set()
    vu.add(t)
    if t not in tags:
        non_resolus.add(t)
        return set()
    out = set()
    for _, vals in tags[t]:
        for v in vals:
            v = vid(v)
            if not v:
                continue
            out |= resoudre_tag(v[1:], tags, vu) if v.startswith('#') else {v}
    return out


def biomes_de(champ):
    if champ is None:
        return set(), []
    lst = champ if isinstance(champ, list) else [champ]
    out, tl = set(), []
    for v in lst:
        if isinstance(v, str) and v.startswith('#'):
            tl.append(v)
            out |= resoudre_tag(v[1:], biome_tags)
        elif isinstance(v, str):
            out.add(v)
    return out, tl


# ---- biomes de l'ile
cfg = lj(open(os.path.join(ILE, 'regions.json'), 'rb').read())
ile = defaultdict(set)
regions = []
for cl, v in cfg['classes'].items():
    if v.get('type') != 'region':
        continue
    n = v['nom']
    regions.append(n)
    for b in v.get('biomes', []):
        ile[b['biome']].add(n)
    for b in v.get('taches', []):
        ile[b['biome']].add(n + ' (tache)')
    for b in v.get('grottes', []):
        ile[b['biome']].add(n + ' (grotte)')
    if v.get('montagne'):
        ile[v['montagne']].add(n + ' (montagne)')
    if 'plage' in v:
        if v['plage']:
            ile[v['plage']].add(n + ' (plage)')
    else:
        ile['minecraft:beach'].add(n + ' (plage par defaut)')


def nom_court(s):
    for n in regions:
        if n.startswith(s):
            return n
    return s


for p in cfg.get('passages', []):
    a, b = [nom_court(x) for x in p['regions']]
    ile[p['biome']].add('passage ' + a + ' / ' + b)
lg = cfg.get('lagon') or {}
for k in ('biome', 'recif', 'passes'):
    if lg.get(k):
        ile[lg[k]].add('Lagon' + ('' if k == 'biome' else ' (' + k + ')'))
for z in cfg.get('zones_biome', []):
    ile[z['biome']].add('zone ' + z['nom'])
pl = None
for nom, files in reversed(sources):
    k = 'data/minecraft/worldgen/multi_noise_biome_source_parameter_list/overworld.json'
    if k in files:
        pl = lire(files[k])
        break
gardes = set()
for t in ('minecraft:is_ocean', 'minecraft:is_deep_ocean', 'minecraft:is_river', 'minecraft:is_beach'):
    gardes |= resoudre_tag(t, biome_tags)
if pl:
    base = {e['biome'] for e in pl.get('lithostitched:biomes', pl.get('biomes', []))}
    for b in sorted(base & gardes):
        ile[b].add("Mer/rivieres/plages (biome d'origine garde)")
    if 'minecraft:deep_dark' in base:
        ile['minecraft:deep_dark'].add('Sous terre (deep_dark garde)')
absents = sorted(b for b in ile if b not in biomes_def)
GARDE = "Mer/rivieres/plages (biome d'origine garde)"


def reg_principales(rs):
    out = set()
    for r in rs:
        if r.startswith('passage '):
            for x in r[8:].split(' / '):
                out.add(x)
        elif r == GARDE:
            out.add('Mer/rivieres')
        else:
            out.add(next((n for n in regions if r == n or r.startswith(n + ' (')), r))
    return out


# ---- structures demandees
demandes = OrderedDict()
tagdir = os.path.join(MC, 'kubejs', 'data', 'atheria', 'tags', 'worldgen', 'structure')
manquants_tags = []
for f in sorted(os.listdir(tagdir)):
    t = 'atheria:' + f[:-5]
    for v in lj(open(os.path.join(tagdir, f), 'rb').read()).get('values', []):
        v = vid(v)
        if v.startswith('#'):
            ids = resoudre_tag(v[1:], struct_tags)
            if not ids:
                manquants_tags.append((t, v))
            for i in sorted(ids):
                demandes.setdefault(i, set()).add(f[:-5] + ' (via ' + v + ')')
        else:
            demandes.setdefault(v, set()).add(f[:-5])
            if v not in structures:
                manquants_tags.append((t, v))
for s in ['create_fallout:broadcast_station', 'create_fallout:red_rocket_station', 'spore:military_camp', 'spore:lab', 'spore:hospital', 'spore:prison']:
    demandes.setdefault(s, set()).add('demande')
par_mod = defaultdict(list)
MODS = (('cinchsabandonedhouses', 'cinchsabandonedhouses'), ('abandoned_city_buildings', 'abandoned_city_buildings'),
        ('Abandoned Watchtowers', 'Abandoned Watchtowers'), ("YUNG's Bridges", 'YungsBridges'))
for s in structures:
    for m, cle in MODS:
        if any(x.startswith(cle) for x in struct_src[s]):
            par_mod[m].append(s)
            demandes.setdefault(s, set()).add(m)
    if s.startswith('yungsbridges:'):
        demandes.setdefault(s, set()).add("YUNG's Bridges : pas une structure, feature ajoutee par biome_modifier NeoForge")
    if s.startswith('minecraft:village_'):
        demandes.setdefault(s, set()).add('village vanilla')

# ---- sparsestructures
sp = open(os.path.join(MC, 'config', 'sparsestructures.json5'), encoding='utf-8').read()
spread = float(re.search(r'"spreadFactor"\s*:\s*([0-9.]+)', sp).group(1))
custom = {m.group(1): float(m.group(2)) for m in re.finditer(r'\{\s*"structure"\s*:\s*"([^"]+)"\s*,\s*"factor"\s*:\s*([0-9.]+)', sp)}
set_de = defaultdict(list)
for sid, d in sets.items():
    for e in d.get('structures', []):
        set_de[e.get('structure')].append(sid)
    if 'structure' in d:
        set_de[d['structure']].append(sid)
litho_struct = [(n, p, d) for n, p, d in litho if d and 'structure' in json.dumps(d)]

# ---- rapport
L = ["# Structures des quetes sur l'ile (atheria_ile)\n",
     'Analyse statique, lecture seule. Script : `outils/conformite/structures_ile.py`.\n',
     'Sources fusionnees (ordre de chargement) : vanilla `%s`, %d jars de `instances/Atheria/minecraft/mods` (jarjar compris), `outils/atheria-ile-mod/atheria_ile_datapack.zip`, `instances/Atheria/minecraft/kubejs/data` (en dernier, gagne).\n'
     % (os.path.relpath(vanilla, R) if vanilla else 'ABSENT : tags vanilla non resolus', len(jars)),
     "Biomes de l'ile : `outils/atheria-ile-mod/regions.json` (biomes, taches, grottes, montagne, plage, passages, lagon/recif/passes, zones_biome) + biomes d'origine que le mod garde (mer, rivieres, plages, deep_dark) pris dans la table de climat `kubejs/data/minecraft/worldgen/multi_noise_biome_source_parameter_list/overworld.json`. Seuls les biomes de grotte des regions remplacent les grottes d'origine.\n",
     "\n## Biomes de l'ile (%d)\n" % len(ile), '| biome | regions |', '|---|---|']
for b in sorted(ile):
    L.append('| `%s`%s | %s |' % (b, ' **(non defini dans les sources)**' if b in absents else '', ', '.join(sorted(ile[b]))))
L.append('\n## Structures\n')
L.append("Facteur sparsestructures global : %s (les facteurs custom qui touchent la structure ou son set sont dans les remarques). Regles atheria-monde (`VillesEtStructures.refuser`) en plus : aucune structure `surface_structures` dans une ville Lost Cities (facteur > 0.2, rayon 2 chunks), aucun village a moins de 14 chunks d'une ville.\n" % spread)
L.append("| structure | existe | biomes de l'ile autorises | regions | remarques |")
L.append('|---|---|---|---|---|')
zero, une, manq = [], [], []
for s in demandes:
    d = structures.get(s)
    if d is None:
        manq.append(s)
        L.append('| `%s` | non | - | - | %s ; ID absent de tous les jars |' % (s, ', '.join(sorted(demandes[s]))))
        continue
    bs, tl = biomes_de(d.get('biomes'))
    inter = sorted(set(bs) & set(ile))
    regs = set()
    for b in inter:
        regs |= reg_principales(ile[b])
    rem = [', '.join(sorted(demandes[s]))]
    rem.append('def: ' + struct_src[s][-1] + (' (surcharge ' + struct_src[s][0] + ')' if len(struct_src[s]) > 1 else ''))
    if tl:
        rem.append('tags ' + ', '.join(tl))
    nr = [t for t in tl if t[1:] in non_resolus]
    if nr:
        rem.append('**tag non resolu ' + ', '.join(nr) + '**')
    rem.append('%d biomes au total' % len(bs))
    if d.get('step'):
        rem.append('step ' + d['step'])
    sts = set_de.get(s, [])
    if sts:
        rem.append('set ' + ', '.join(sts))
    else:
        rem.append('**aucun structure_set : ne se place jamais seule**')
    for k in [s] + sts:
        if k in custom:
            rem.append('**sparse %s = %s%s**' % (k, custom[k], ' (BLOQUE)' if custom[k] == 0 else ''))
    regs_txt = ', '.join(sorted(regs)) or '-'
    if not inter:
        zero.append(s)
    elif len(regs) == 1:
        une.append((s, regs_txt))
    L.append('| `%s` | oui | %s | %s | %s |' % (s, ', '.join('`%s`' % b for b in inter) or '**aucun**', regs_txt, ' ; '.join(rem)))
L.append('\n## Tags atheria : entrees sans structure\n')
L += ['- `%s` : `%s`' % x for x in manquants_tags] or ['- aucune']
L.append('\n## Tags de biome non resolus (absents de toutes les sources)\n')
L += ['- `#%s`' % t for t in sorted(non_resolus)] or ['- aucun']
L.append('\n## Modificateurs lithostitched qui touchent les structures\n')
L += ['- %s `%s` : `%s`' % (n, p, json.dumps(d)[:300]) for n, p, d in litho_struct] or ['- aucun']
L.append('\n## Structures par mod\n')
for m in par_mod:
    L.append('- **%s** : %s' % (m, ', '.join('`%s`' % x for x in sorted(par_mod[m]))))
L.append('\n## Resume\n')
L.append("- 0 biome sur l'ile : " + (', '.join('`%s`' % x for x in zero) or 'aucune'))
L.append('- 1 seule region : ' + (', '.join('`%s` (%s)' % x for x in une) or 'aucune'))
L.append('- ID manquants : ' + (', '.join('`%s`' % x for x in manq) or 'aucun'))
L.append('- biomes de regions.json absents des sources : ' + (', '.join('`%s`' % x for x in absents) or 'aucun'))
open(os.path.join(R, 'outils', 'conformite', 'structures-ile.md'), 'w', encoding='utf-8').write('\n'.join(L) + '\n')
print('\n'.join(L[-5:]))
for m in par_mod:
    print(m, sorted(par_mod[m]))
print('tags manquants', manquants_tags)
print('non resolus', sorted(non_resolus))
print('litho', [(n, p) for n, p, d in litho_struct])
