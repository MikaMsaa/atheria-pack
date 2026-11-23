import sys, json
reg = sys.argv[1]; d = json.load(open(reg, encoding='utf-8'))
c = d['classes']['#c4b278']
c['biomes'] = [{"biome": "terralith:hot_shrubland", "poids": 1}]; c['montagne'] = 'terralith:hot_shrubland'; c['taches'] = []
d['arret_apres_tests'] = False
open(reg, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=1)); print('ok')
