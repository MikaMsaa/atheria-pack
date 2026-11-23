# empreinte des chunks (blocs des sections + statut) ; avec un 3e argument : compare, en separant les chunks COMPLETS (full) avant
import sys, os, json, hashlib, glob, struct
monde, sortie = sys.argv[1], sys.argv[2]
ICI = os.path.dirname(os.path.abspath(sys.argv[0]))
src = open(os.path.join(ICI, 'comparer_chunks.py')).read().split('mondes=args')[0]
src = src.replace("sys.argv,args=[sys.argv[0],'x'],sys.argv[1:]", "args=[]").replace("os.path.dirname(os.path.abspath(__file__))", repr(ICI))
_a = sys.argv; exec(src); sys.argv = _a
E = {}
for rf in glob.glob(os.path.join(monde, 'region', 'r.*.mca')):
    rx, rz = map(int, os.path.basename(rf).split('.')[1:3])
    with open(rf, 'rb') as f: tete = f.read(4096)
    for i in range(1024):
        if not struct.unpack('>I', tete[4 * i:4 * i + 4])[0] >> 8: continue
        cx, cz = rx * 32 + (i & 31), rz * 32 + (i >> 5)
        st, b = lire(monde, cx, cz)
        h = hashlib.sha1(repr(sorted(b.items())).encode()).hexdigest()[:16]
        E['%d,%d' % (cx, cz)] = [h, str(st)]
json.dump(E, open(sortie, 'w'))
if len(sys.argv) > 3:
    A = json.load(open(sys.argv[3]))
    full = [k for k in A if A[k][1].endswith('full')]
    chg = [k for k in full if E.get(k, [None])[0] != A[k][0]]
    autres = [k for k in A if k not in full]
    chg_autres = [k for k in autres if E.get(k, [None])[0] != A[k][0]]
    neufs = [k for k in E if k not in A]
    print('complets avant %d ; complets MODIFIES %d %s' % (len(full), len(chg), chg[:10]))
    print('incomplets avant %d (bordure, completes par la generation) ; changes %d' % (len(autres), len(chg_autres)))
    print('nouveaux %d ; statuts des nouveaux %s' % (len(neufs), sorted({E[k][1] for k in neufs})))
else:
    print('%d chunks, dont %d complets' % (len(E), sum(1 for v in E.values() if v[1].endswith('full'))))
