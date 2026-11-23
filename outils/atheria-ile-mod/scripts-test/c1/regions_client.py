import sys, json
d = json.load(open(sys.argv[1], encoding='utf-8'))
for k in ['valider_routes', 'valider_routes_troncon', 'valider_routes_troncons', 'valider_routes_releves', 'arret_apres_tests']: d.pop(k, None)
if len(sys.argv) > 3 and sys.argv[3] == 'c1':
    c = d['classes']['#c4b278']; c['biomes'] = [{"biome": "terralith:hot_shrubland", "poids": 1}]; c['montagne'] = 'terralith:hot_shrubland'; c['taches'] = []
json.dump(d, open(sys.argv[2], 'w', encoding='utf-8'), ensure_ascii=False, indent=1); print('regions client ok')
