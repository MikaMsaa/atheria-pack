# Integre les 3 changements des volumes du tram (mission 3 de Villes) dans regions-v3o.json. usage : python -I tram_v3o.py <regions-v3o.json>
import sys, json, shutil, os, hashlib
F = sys.argv[1]
raw = open(F, encoding='utf-8').read()
d = json.loads(raw)
for ea in (False, True):
    if json.dumps(d, indent=1, ensure_ascii=ea) + '\n' == raw or json.dumps(d, indent=1, ensure_ascii=ea) == raw: break
else:
    ea = None
print('format d origine retrouve :', ea is not None, '(ensure_ascii=%s)' % ea)
B = F.replace('.json', '.avant-tram.json')
if os.path.exists(B): sys.exit('copie %s existe deja : rien fait' % B)
shutil.copy2(F, B)
n = 0
for v in d['volumes_souterrains']['elements']:
    if v['nom'] == 'Ligne principale':
        v.update(points=[[2543, -3000], [2556, -3000], [2556, -2980], [2488, -2932], [2456, -2872], [2456, -2688], [2520, -2600], [2520, -2200], [2546, -2104], [2568, -2032]], largeur_blocs=10, y_min=51, y_max=58); n += 1
    elif v['nom'] == 'Embranchement':
        v.update(points=[[2496, -3000], [2400, -3000], [2300, -2916], [2200, -2816], [2136, -2752]], largeur_blocs=10, y_min=51, y_max=58); n += 1
    elif v['nom'] in ('Station de Majicavo', 'Petite station 1', 'Petite station 2', 'Petite station 3', 'Station des veilleurs', 'Grand Nid'):
        v['y_min'] = 48; n += 1
assert n == 8, n
d['_aide_v3o'] = d.get('_aide_v3o', '') + ' | 15/11 tram (mission 3 Villes) : Ligne principale et Embranchement y 51..58 largeur 10 (gabarit Bancoul : 8 de large, rails Y 53, voute Y 57, portails x 2496 et x 2543 sur z -3003..-2998), nouveaux points ; stations Majicavo, petites 1-3, veilleurs, Grand Nid y_min 48 (quais Y 53). Ancienne version : regions-v3o.avant-tram.json'
out = json.dumps(d, indent=1, ensure_ascii=bool(ea)) + ('\n' if raw.endswith('\n') else '')
open(F, 'w', encoding='utf-8', newline='\n').write(out)
print('ecrit', F, hashlib.md5(out.encode('utf-8')).hexdigest()[:8], '; copie', B, hashlib.md5(open(B, 'rb').read()).hexdigest()[:8])
