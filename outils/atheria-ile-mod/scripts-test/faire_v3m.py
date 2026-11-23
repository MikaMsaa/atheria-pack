# regions-v3m = v3l + toutes les sculptures (ilot A, ilot du Phare, 11 lieux cubiques) pour le mod 0.9.6b. Hors ligne, n'ecrit que regions-v3m.json.
# Les PNG sont a copier dans config\atheria_ile\sculptures\<cle>\ (copie jetable seulement).
import json, os
ICI = os.path.dirname(os.path.abspath(__file__)); BR = os.path.join(ICI, '..', 'branche-relief'); SC = os.path.join(ICI, '..', 'sculpture')
d = json.load(open(os.path.join(BR, 'regions-v3l.json'), encoding='utf-8'))
rn = d['relief_naturel']
k = json.load(open(os.path.join(BR, 'regions-v3k.json'), encoding='utf-8'))['relief_naturel']
for c in ('lagon_biome_force', 'lagon_plafond_strict', 'lagon_vie', 'debris_grands', 'debris_par_chunk', 'sols_taches', 'ilots_sable', '_aide_v3k'):
    if c in k: rn[c] = k[c]
rn['ilots_sable'] = list(rn.get('ilots_sable', [])) + [[-2640, -5744, 56]]   # ilot du Phare garde (plafond strict du lagon)
S = [{'nom': 'ilot de sable A (lagon)', 'x0': -2582, 'z0': -5892, 'hauteur': 'sculptures/ileA/hauteur.png', 'masque': 'sculptures/ileA/masque.png',
      'palmiers': 6, 'arbre': 'ecologics:coconut_tree'}]
for cle in ('phare', 'z002', 'hum', 'z003', 'z006', 'z001', 'z008', 'z010', 'z013', 'z004', 'z009', 'z011'):
    me = json.load(open(os.path.join(SC, cle, 'mesure.json'), encoding='utf-8'))
    e = {'nom': me['nom'], 'x0': me['x0'], 'z0': me['z0'], 'hauteur': 'sculptures/%s/hauteur.png' % cle, 'masque': 'sculptures/%s/masque.png' % cle}
    if cle == 'phare': e.update({'ilot': True, 'biome_terre': 'minecraft:stony_shore', 'palmiers': 0})
    else: e['ilot'] = False
    S.append(e)
rn['sculptures'] = S
rn['_aide_v3m'] = ("0.9.6b : sculptures 'ilot' true = biome force (plage, ou biome_terre au-dessus de Y 64), coraux tout autour ; "
                   "'ilot' false = lieu cotier ou terrestre, biome garde. Le lot du Phare n'est jamais sculpte.")
json.dump(d, open(os.path.join(BR, 'regions-v3m.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('regions-v3m :', len(S), 'sculptures ; ilots_sable', rn['ilots_sable'])
