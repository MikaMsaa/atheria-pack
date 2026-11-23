# Fin de la passe 3 des captures c22 (15/11). python -I ecrire-passe3b.py
# - poissons au lagon (point f), ParCool LAISSE ACTIF (atheria-monde FiguresPov appelle ParCool : le couper fait planter le jeu) ; Jade coupe ;
# - majicavo_est et z008 : vue sol refaite en camera fixe haute, degagee (cameras_degagees.py sur carte-c22 : aucun bloc, herbe et
#   feuilles comprises, entre l'oeil et le sujet ni vers 4 points du sol a +-8 et +-14 blocs) ; ty = hauteur visee au sujet.
import os, json
ICI = os.path.dirname(os.path.abspath(__file__)); ST = os.path.dirname(ICI)
job = json.load(open(os.path.join(ICI, 'captures-c22-passe3.captures.json'), encoding='utf-8'))
pts = {p['id'] + ('_f' if p.get('f') else ''): p for p in json.load(open(os.path.join(ST, 'points-c22-passe3.json'), encoding='utf-8'))}
liste = [
    dict(pts['majicavo_est'], cx=2589, cz=-2029, y=77, ty=66),   # h=12 au-dessus du sol, d=14, plongee ~42 deg
    dict(pts['z008'], cx=-3957, cz=4408, y=71, ty=67),           # h=8, d=22, colonne de basalte hors champ
    pts['lagon_f'],
]
open(os.path.join(ST, 'points-c22-passe3b.json'), 'w', encoding='utf-8').write(json.dumps(liste, indent=1) + '\n')
job['couper_mods'] = [m for m in job['couper_mods'] if m != 'ParCool']
assert 'ParCool' not in job['couper_mods']
job.update(nom='captures-c22-passe3b', points_fichier=os.path.join(ST, 'points-c22-passe3b.json'),
           sortie=os.path.join(ST, 'captures-c22', 'passe3b'), duree_max_min=40,
           note='fin de la passe 3 : poissons au lagon (ParCool actif), majicavo_est et z008 vue sol en camera fixe haute degagee (ty) ; '
                'memes fichiers que la passe 3 ; Jade coupe, titres coupes')
os.makedirs(job['sortie'], exist_ok=True)
p = os.path.join(ICI, 'captures-c22-passe3b.captures.json'); open(p, 'w', encoding='utf-8').write(json.dumps(job, indent=1, ensure_ascii=False) + '\n'); print('ecrit', p)
