# Passe 3c des captures c22 (15/11) : refait z008 (vue sol) et le comptage des poissons au lagon, manques en passe3b
# (incident memoire 16:56). Meme profil que la passe3b, mais en PROFIL JVM LEGER (profil-leger.ps1 : instance de test,
# images identiques), Xmx 4096, ram_mo 6300 (pic mesure + 500 Mo). Pas de -Vue : vues de surface deja comparees.
# Le type "captures" n'a pas de champ JVM : travail "script" (verrou tenu par la file) qui enveloppe capturer.ps1 avec
# profil-leger.ps1 (passe3c-leger.ps1). Aucun script partage de la file n'est modifie.  python -I ecrire-passe3c.py
import os, json
ICI = os.path.dirname(os.path.abspath(__file__)); ST = os.path.dirname(ICI)
pts = {p['id'] + ('_f' if p.get('f') else ''): p for p in json.load(open(os.path.join(ST, 'points-c22-passe3b.json'), encoding='utf-8'))}
liste = [pts['z008'], pts['lagon_f']]   # copies telles quelles
open(os.path.join(ST, 'points-c22-passe3c.json'), 'w', encoding='utf-8').write(json.dumps(liste, indent=1) + '\n')
job = json.load(open(os.path.join(ICI, 'captures-c22-passe3b.captures.json'), encoding='utf-8'))
assert 'ParCool' not in job['couper_mods']
job.update(nom='captures-c22-passe3c', points_fichier=os.path.join(ST, 'points-c22-passe3c.json'),
           sortie=os.path.join(ST, 'captures-c22', 'passe3c'), duree_max_min=30, memoire_mo=4096,
           ram_mo=6300, ram_relance_mo=6300, garde_mo=400, priorite=4,
           note='passe3c : z008 vue sol + poissons au lagon (ParCool actif), memes fichiers que la passe3b, profil JVM leger Xmx 4096')
os.makedirs(job['sortie'], exist_ok=True)
pi = os.path.join(ICI, 'captures-c22-passe3c.interne.json')
open(pi, 'w', encoding='utf-8').write(json.dumps(job, indent=1, ensure_ascii=False) + '\n')
sj = dict(nom='captures-c22-passe3c-leger', fil='carte', type='script', priorite=4, verrou='file', client=True,
          ram_mo=6300, duree_max_min=40,
          script=os.path.join(ICI, 'passe3c-leger.ps1'), arguments=['-Interne', pi],
          note='passe3c (z008 + poissons lagon) en profil JVM leger : profil-leger.ps1 Xmx 4096 autour de capturer.ps1 ; '
               'capturer coupe a 29 min (budget 30), avant la limite de 40 min de la file')
ps = os.path.join(ICI, 'captures-c22-passe3c-leger.script.json')
open(ps, 'w', encoding='utf-8').write(json.dumps(sj, indent=1, ensure_ascii=False) + '\n'); print('ecrit', ps, pi)
