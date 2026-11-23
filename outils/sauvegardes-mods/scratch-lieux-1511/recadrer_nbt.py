# Recadre un modele de structure (.nbt gzip) : garde les blocs dans [x0,x0+w) x [z0,z0+l), decale a l'origine, met a jour size.
# usage : recadrer_nbt.py entree.nbt sortie.nbt x0 z0 w l
import gzip, struct, sys, io

def lire(f, t):
    if t == 1: return struct.unpack('>b', f.read(1))[0]
    if t == 2: return struct.unpack('>h', f.read(2))[0]
    if t == 3: return struct.unpack('>i', f.read(4))[0]
    if t == 4: return struct.unpack('>q', f.read(8))[0]
    if t == 5: return struct.unpack('>f', f.read(4))[0]
    if t == 6: return struct.unpack('>d', f.read(8))[0]
    if t == 7: n = lire(f, 3); return ('B', f.read(n))
    if t == 8: n = struct.unpack('>H', f.read(2))[0]; return f.read(n).decode('utf-8')
    if t == 9:
        et = f.read(1)[0]; n = lire(f, 3); return ('L', et, [lire(f, et) for _ in range(n)])
    if t == 10:
        d = {}
        while True:
            tt = f.read(1)[0]
            if tt == 0: return ('C', d)
            k = f.read(struct.unpack('>H', f.read(2))[0]).decode('utf-8'); d[k] = (tt, lire(f, tt))
    if t == 11: n = lire(f, 3); return ('I', [lire(f, 3) for _ in range(n)])
    if t == 12: n = lire(f, 3); return ('J', [lire(f, 4) for _ in range(n)])
    raise ValueError(t)

def ecrire(f, t, v):
    if t == 1: f.write(struct.pack('>b', v))
    elif t == 2: f.write(struct.pack('>h', v))
    elif t == 3: f.write(struct.pack('>i', v))
    elif t == 4: f.write(struct.pack('>q', v))
    elif t == 5: f.write(struct.pack('>f', v))
    elif t == 6: f.write(struct.pack('>d', v))
    elif t == 7: ecrire(f, 3, len(v[1])); f.write(v[1])
    elif t == 8: b = v.encode('utf-8'); f.write(struct.pack('>H', len(b))); f.write(b)
    elif t == 9:
        f.write(bytes([v[1]])); ecrire(f, 3, len(v[2]))
        for e in v[2]: ecrire(f, v[1], e)
    elif t == 10:
        for k, (tt, vv) in v[1].items():
            f.write(bytes([tt])); b = k.encode('utf-8'); f.write(struct.pack('>H', len(b))); f.write(b); ecrire(f, tt, vv)
        f.write(b'\x00')
    elif t == 11: ecrire(f, 3, len(v[1])); [ecrire(f, 3, e) for e in v[1]]
    elif t == 12: ecrire(f, 3, len(v[1])); [ecrire(f, 4, e) for e in v[1]]

src, dst, x0, z0, w, l = sys.argv[1], sys.argv[2], *map(int, sys.argv[3:7])
f = io.BytesIO(gzip.open(src).read())
assert f.read(1)[0] == 10; nom = f.read(struct.unpack('>H', f.read(2))[0]).decode(); racine = lire(f, 10)
d = racine[1]
blocs = d['blocks'][1][2]; garde = []
for b in blocs:
    pos = b[1]['pos'][1][2]
    x, y, z = pos
    if x0 <= x < x0 + w and z0 <= z < z0 + l:
        b[1]['pos'] = (9, ('L', 3, [x - x0, y, z - z0])); garde.append(b)
d['blocks'] = (9, ('L', 10, garde))
if 'entities' in d: d['entities'] = (9, ('L', 10, []))
taille = d['size'][1][2]; d['size'] = (9, ('L', 3, [w, taille[1], l]))
o = io.BytesIO(); o.write(b'\x0a'); b = nom.encode(); o.write(struct.pack('>H', len(b))); o.write(b); ecrire(o, 10, racine)
gzip.open(dst, 'wb').write(o.getvalue())
print('blocs', len(blocs), '->', len(garde), 'taille', taille, '->', [w, taille[1], l])
