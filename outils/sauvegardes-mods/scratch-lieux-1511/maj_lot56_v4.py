import shutil
p = 'zz_vitrine_lot56.js'
shutil.copy(p, 'zz_vitrine_lot56.v3a.js')
s = open(p, encoding='utf-8').read()
a = s.index('// ---------------- AMBULANCE v3'); b = s.index('// ---------------- AUTOBUS v3')
c = s.index('// ---------------- CAMION BACHE v3'); d = s.index('// ---------------- TRAMWAY v3')
amb = open('amb_v4.js', encoding='utf-8').read()
cam = open('cam_v4.js', encoding='utf-8').read()
s = s[:a] + amb + '\n' + s[b:c] + cam + '\n' + s[d:]
open(p, 'w', encoding='utf-8').write(s)
print('ok')
