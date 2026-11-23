# JPEG pour le telephone (15/11) : 1600 px de large, qualite 85 (baissee si > 400 Ko). python -I vers_jpg.py [dossier_png ...]
import os, sys, re
from PIL import Image
ICI = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(ICI, 'jpg'); os.makedirs(OUT, exist_ok=True)
for d in (sys.argv[1:] or [ICI]):
    for f in sorted(os.listdir(d)):
        if not f.endswith('.png'): continue
        nom = re.sub(r'^relief_c22_+', '', f)[:-4] + '.jpg'
        im = Image.open(os.path.join(d, f)).convert('RGB')
        im = im.resize((1600, round(im.height * 1600 / im.width)), Image.LANCZOS)
        p = os.path.join(OUT, nom)
        for q in (85, 80, 75, 70):
            im.save(p, 'JPEG', quality=q, optimize=True, progressive=True)
            if os.path.getsize(p) <= 400 * 1024: break
        print('%-24s q%d %4d Ko' % (nom, q, os.path.getsize(p) // 1024))
