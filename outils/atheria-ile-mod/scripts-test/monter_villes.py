import os, sys, shutil, hashlib
ST, S = sys.argv[1], sys.argv[2]   # scripts-test, destination
BR = os.path.join(ST, '..', 'branche-relief'); V = os.path.join(ST, '..', 'pour-villes-v3j'); SC = os.path.join(ST, '..', 'sculpture')
if os.path.exists(S): shutil.rmtree(S)
os.makedirs(S)
for a, b in ((os.path.join(BR, 'atheria-ile-0.9.6d-ilots-chauds.jar'), 'atheria-ile.jar'), (os.path.join(BR, 'regions-v3o.json'), 'regions.json'),
             (os.path.join(BR, 'plateaux-v3o.json'), 'plateaux.json'), (os.path.join(V, 'atheria_ile_datapack.zip'), 'atheria_ile_datapack.zip'),
             (os.path.join(ST, 'relief_base.bin'), 'relief_base.bin'), (os.path.join(ST, 'relief_delta_c2.bin'), 'relief_delta.bin')):
    shutil.copy2(a, os.path.join(S, b))
for s in ('ileA', 'phare', 'z002', 'hum', 'z003', 'z006', 'z001', 'z008', 'z010', 'z013', 'z004', 'z009', 'z011'):
    os.makedirs(os.path.join(S, 'sculptures', s))
    for f in ('hauteur.png', 'masque.png'): shutil.copy2(os.path.join(SC, s, f), os.path.join(S, 'sculptures', s, f))
for f in sorted(os.listdir(S)):
    p = os.path.join(S, f)
    if os.path.isfile(p): print(f, hashlib.md5(open(p, 'rb').read()).hexdigest()[:8], os.path.getsize(p))
print('sculptures', len(os.listdir(os.path.join(S, 'sculptures'))), sum(len(os.listdir(os.path.join(S, 'sculptures', d))) for d in os.listdir(os.path.join(S, 'sculptures'))), 'fichiers')
