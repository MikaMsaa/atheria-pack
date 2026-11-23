import sys, zipfile, os
dpzip, c1dir = sys.argv[1], sys.argv[2]; tmp = dpzip + '.tmp'
zi = zipfile.ZipFile(dpzip); zo = zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED); noms = set()
add = {}
for r, _, fs in os.walk(c1dir):
    for f in fs: p = os.path.join(r, f); add[os.path.relpath(p, c1dir).replace(os.sep, '/')] = p
for it in zi.infolist():
    if it.filename not in add: zo.writestr(it, zi.read(it.filename))
for n, p in add.items(): zo.write(p, n)
zo.close(); zi.close(); os.replace(tmp, dpzip); print('dp ok', len(add))
