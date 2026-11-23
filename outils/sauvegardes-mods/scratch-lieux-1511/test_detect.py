import sys, os, glob, importlib.util, collections
d = sys.argv[1]; sys.path.insert(0, d)
spec = importlib.util.spec_from_file_location('cv', os.path.join(d, 'convertir-vitrines.py')); cv = importlib.util.module_from_spec(spec); spec.loader.exec_module(cv)
import vehicules_maquettes as VM
tot = collections.Counter(); par = collections.Counter(); nlots = 0
for j in sorted(glob.glob(os.path.join(sys.argv[2], '*.log'))):
    for i, lot in lire.items() if False else cv.lire_journal(j).items():
        nlots += 1
        r = VM.chercher(lot, lot['graine'])
        for v in r:
            tot[v['modele']] += 1; par[VM.variante(v)] += 1
        if r: print(os.path.basename(j), lot['graine'], [(v['modele'], v.get('couleur'), v['etat'], round(v['x'],1), v['y'], round(v['z'],1), v['dir'], len(v['blocs'])) for v in r])
print(nlots, 'lots', dict(tot)); print(par.most_common())
