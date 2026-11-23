# Ecrit les travaux de la file PC pour la Carte (15/11) : figer c22m -> carte-c22, captures c22 (profil 4G), et prepare points + sculptures.
# usage : python -I ecrire-travaux-carte.py
import os, json, shutil
R = r'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition'
ST = os.path.join(R, 'outils', 'atheria-ile-mod', 'scripts-test'); BR = os.path.join(R, 'outils', 'atheria-ile-mod', 'branche-relief')
SC = os.path.join(R, 'outils', 'atheria-ile-mod', 'sculpture'); FP = os.path.join(R, 'outils', 'file-pc'); ICI = os.path.dirname(os.path.abspath(__file__))
ESS = os.path.join(R, 'outils', 'serveur-pilote-essai')
def ecrire(nom, d):
    p = os.path.join(ICI, nom); open(p, 'w', encoding='utf-8').write(json.dumps(d, indent=1, ensure_ascii=False) + '\n'); print('ecrit', p)
# 1. sculptures-c22 : hauteur.png + masque.png des 13 lieux (comme les lanceurs)
SD = os.path.join(ST, 'sculptures-c22')
if not os.path.exists(SD):
    for s in ('ileA', 'phare', 'z002', 'hum', 'z003', 'z006', 'z001', 'z008', 'z010', 'z013', 'z004', 'z009', 'z011'):
        os.makedirs(os.path.join(SD, s))
        for f in ('hauteur.png', 'masque.png'): shutil.copy2(os.path.join(SC, s, f), os.path.join(SD, s, f))
    print('sculptures-c22 cree')
# 2. points en NOMBRES (le bug du 15/11 venait de points en texte)
pts = []
for cle in ('phare', 'z002', 'hum', 'z003', 'z006', 'z001', 'z008', 'z010', 'z013', 'z004', 'z009', 'z011'):
    me = json.load(open(os.path.join(SC, cle, 'mesure.json'), encoding='utf-8'))
    pts.append(dict(id=cle, sx=int(me['x0']) + 80, sz=int(me['z0']) + 80, dx=0.707, dz=0.707))
pts += [dict(id='ileA', sx=-2534, sz=-5864, dx=0.707, dz=0.707), dict(id='lagon', sx=-2514, sz=-5850, dx=0.0, dz=1.0),
        dict(id='majicavo_bord', sx=2530, sz=-1952, dx=0.0, dz=1.0), dict(id='majicavo_est', sx=2594, sz=-2016, dx=1.0, dz=0.0),
        dict(id='lot68_bord', sx=2941, sz=-899, dx=0.0, dz=1.0), dict(id='lagon', sx=-2514, sz=-5850, dx=0.0, dz=1.0, f=True)]
for p in pts: assert all(isinstance(p[k], (int, float)) for k in ('sx', 'sz', 'dx', 'dz'))
ecrire(os.path.join('..', 'points-c22.json'), pts)
# 3. regions client v3n2 : meme sortie que les lanceurs (regions_client.py)
RC = os.path.join(ST, 'regions-client-v3n2.json')
V = {'atheria-ile.jar': os.path.join(BR, 'atheria-ile-0.9.6d-ilots-chauds.jar'), 'atheria-monde.jar': os.path.join(ST, 'facteur', 'atheria-monde-ile-test-facteur.jar'),
     'regions.json': RC, 'plateaux.json': os.path.join(BR, 'plateaux-v3l.json'),
     'relief_delta.bin': os.path.join(ST, 'relief_delta_c2.bin'), 'relief_base.bin': os.path.join(ST, 'relief_base.bin')}
ecrire('regions-client-v3n2.calcul.json', dict(nom='regions-client-v3n2', fil='carte', type='calcul', ram_mo=300, duree_max_min=5,
       script=os.path.join(ST, 'c1', 'regions_client.py'), arguments=[os.path.join(BR, 'regions-v3n2.json'), RC],
       note='regions.json client (sans les cles de test serveur), identique a celui pose par lancer-captures-c22-*.ps1 (D88D3CDF)'))
# 4. figer c22m -> carte-c22 (copie, aucun jeu, aucun verrou)
ecrire('figer-carte-c22.calcul.json', dict(nom='figer-carte-c22', fil='carte', type='calcul', priorite=4, ram_mo=500, duree_max_min=20, apres='regions-client-v3n2',
       script=os.path.join(FP, 'figer-monde.ps1'),
       arguments=['-Source', os.path.join(ESS, 'pilote-bis-c22m'), '-Nom', 'carte-c22', '-Fil', 'carte',
                  '-Note', 'c22m genere le 15/11 10:50-11:12 : 0.9.6d + regions-v3n2 (serveur ; regions.json note = version client de v3n2) + plateaux-v3l + delta c2 + base + datapack 1.4 C1 + 13 sculptures ; 16 zones (12 lieux, lagon, Majicavo 128, lot68 112, Goblini 64). QC c22 sans KO.',
                  '-Version', ';'.join('%s=%s' % kv for kv in V.items())],
       note='fige pilote-bis-c22m en reference carte-c22 (la source n est pas touchee)'))
# 5. captures c22, profil 4G (remplace lancer-captures-c22-4g.ps1)
ecrire('captures-c22.captures.json', dict(nom='captures-c22', fil='carte', type='captures', priorite=4, apres='figer-carte-c22',
       ram_mo=7000, ram_relance_mo=7000, attente_relance_min=8, garde_mo=400, duree_max_min=120, instance='AtheriaAudit',
       monde={'ref': 'carte-c22'},
       fichiers=[{'source': V['atheria-monde.jar'], 'cible': 'mods\\atheria-monde.jar'}, {'source': V['atheria-ile.jar'], 'cible': 'mods\\atheria-ile.jar'},
                 {'source': RC, 'cible': 'config\\atheria_ile\\regions.json'}, {'source': V['plateaux.json'], 'cible': 'config\\atheria_ile\\plateaux.json'},
                 {'source': V['relief_delta.bin'], 'cible': 'config\\atheria_ile\\relief_delta.bin'}, {'source': V['relief_base.bin'], 'cible': 'config\\atheria_ile\\relief_base.bin'},
                 {'source': SD, 'cible': 'config\\atheria_ile\\sculptures'}],
       brume=False, couper_mods=['xaeroworldmap', 'emotecraft', 'appleskin'], options={'renderDistance': 8, 'simulationDistance': 4},
       memoire_mo=4096, fenetre='1920x1080', points_par_lancement=5, prefixe='relief_c22_',
       camera={'recul_sol': 24, 'recul_haut': 40, 'haut': 60, 'rayon': 3},
       points_fichier=os.path.join(ST, 'points-c22.json'), sortie=os.path.join(ST, 'captures-c22'),
       note='meme profil que lancer-captures-c22-4g.ps1 (Xmx 4G, distance 8, simulation 4, 1920x1080, garde 400) ; 17 points + poissons ; monde = copie de la reference carte-c22'))
