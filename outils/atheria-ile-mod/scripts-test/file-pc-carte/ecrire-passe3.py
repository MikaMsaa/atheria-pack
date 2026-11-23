# 3e passe courte des captures c22 (15/11). python -I ecrire-passe3.py
# - z011 (la vue haut manquait ; la vue sol refaite sert de controle), majicavo_bord, majicavo_est : vues normales sol + haut ;
# - z004, lot68_bord, z008 : vue sol refaite en camera fixe (y/cx/cz), 4 blocs au-dessus du sol, rayon degage (cameras-passe3.json,
#   calcule sur carte-c22 : aucun bloc, herbe comprise, entre l'oeil et le sujet) ; places apres les autres (vision nocturne) ;
# - poissons au lagon en dernier ;
# - interface : hideGui deja mis par la file ; Jade (infobulles) et ParCool (figurine verte) coupes ; titres d'entree coupes
#   (regions.json client avec titres_regions.actif = false : ne touche pas la generation -> accepter_autre_version).
import os, json, copy
ICI = os.path.dirname(os.path.abspath(__file__)); ST = os.path.dirname(ICI)
job = json.load(open(os.path.join(ICI, 'captures-c22.captures.json'), encoding='utf-8'))
pts = {p['id'] + ('_f' if p.get('f') else ''): p for p in json.load(open(os.path.join(ST, 'points-c22.json'), encoding='utf-8-sig'))}
cams = json.load(open(os.path.join(ST, 'cameras-passe3.json'), encoding='utf-8'))
liste = [pts['z011'], pts['majicavo_bord'], pts['majicavo_est']]
for pid in ('z004', 'lot68_bord', 'z008'):
    sc, cx, cz, cy = cams[pid][:4]
    q = dict(pts[pid]); q.update(y=cy, cx=cx, cz=cz); liste.append(q)
liste.append(pts['lagon_f'])
for p in liste: assert all(isinstance(p[k], (int, float)) for k in ('sx', 'sz', 'dx', 'dz') + (('y', 'cx', 'cz') if 'y' in p else ()))
open(os.path.join(ST, 'points-c22-passe3.json'), 'w', encoding='utf-8').write(json.dumps(liste, indent=1) + '\n')
# regions.json client sans titres d'entree
RC = os.path.join(ST, 'regions-client-v3n2.json'); RT = os.path.join(ST, 'regions-client-v3n2-sans-titres.json')
d = json.load(open(RC, encoding='utf-8')); d.setdefault('titres_regions', {})['actif'] = False
open(RT, 'w', encoding='utf-8').write(json.dumps(d, indent=1, ensure_ascii=False) + '\n')
job.pop('apres', None)
for f in job['fichiers']:
    if f['cible'].endswith('regions.json'): f['source'] = RT
job.update(nom='captures-c22-passe3', priorite=4, memoire_mo=4608, ram_mo=7000, ram_relance_mo=7000, duree_max_min=60, points_par_lancement=0,
           couper_mods=job['couper_mods'] + ['Jade', 'ParCool'], accepter_autre_version=True,
           points_fichier=os.path.join(ST, 'points-c22-passe3.json'), sortie=os.path.join(ST, 'captures-c22', 'passe3'),
           note='3e passe courte : z011, majicavo_bord, majicavo_est (sol + haut) ; z004, lot68_bord, z008 vue sol en camera fixe +4 degagee ; poissons au lagon ; '
                'Xmx 4608 (OOM serveur integre a 4096), distance 8, simulation 4, garde 400, 1920x1080 ; copie de carte-c22 ; Jade + ParCool coupes, titres coupes '
                '(regions.json client = v3n2 + titres_regions.actif false, sans effet sur la generation)')
os.makedirs(job['sortie'], exist_ok=True)
p = os.path.join(ICI, 'captures-c22-passe3.captures.json'); open(p, 'w', encoding='utf-8').write(json.dumps(job, indent=1, ensure_ascii=False) + '\n'); print('ecrit', p)
