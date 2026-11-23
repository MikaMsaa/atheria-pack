import sys, json, zipfile, shutil, os
reg, dpzip, c1dir = sys.argv[1], sys.argv[2], sys.argv[3]
t = open(reg, encoding='utf-8').read()
d = json.loads(t)
c = d['classes']['#c4b278']
assert c['montagne'] == 'terralith:volcanic_crater'
c['biomes'] = [{"biome": "terralith:hot_shrubland", "poids": 1}]
c['montagne'] = 'terralith:hot_shrubland'
c['taches'] = []
open(reg, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=1))
tmp = dpzip + '.tmp'
zi = zipfile.ZipFile(dpzip); zo = zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED)
for it in zi.infolist(): zo.writestr(it, zi.read(it.filename))
for r, _, fs in os.walk(c1dir):
    for f in fs:
        p = os.path.join(r, f); zo.write(p, os.path.relpath(p, c1dir).replace(os.sep, '/'))
zo.close(); zi.close(); os.replace(tmp, dpzip)
print('C1 applique', reg, dpzip)
