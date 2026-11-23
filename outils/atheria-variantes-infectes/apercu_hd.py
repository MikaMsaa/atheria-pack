# Planche d'apercu HD : face avant assemblee (tete + corps) avec les pupilles de Fresh Animations posees sur les orbites
import io, os, sys, zipfile
from PIL import Image, ImageDraw
ICI = os.path.dirname(os.path.abspath(__file__))
z = zipfile.ZipFile(os.path.join(ICI, 'sortie', 'Atheria-Infectes-variantes.zip'))
noms = sorted([n for n in z.namelist() if n.endswith('.png')], key=lambda s: int(s.split('zombie')[-1][:-4]))
lis = {l.split(' : ')[0]: l.split(' : ')[1] for l in z.read('LISEZ-MOI.txt').decode().splitlines() if ' : ' in l}
def front(im):
    k = im.size[0] // 64
    c = lambda a, b, cc, d: im.crop((a * k, b * k, cc * k, d * k))
    s = Image.new('RGBA', (16 * k, 32 * k), (0, 0, 0, 0))
    t = c(8, 8, 16, 16).copy()
    for x in (2, 3, 10, 11):  # pupilles (approximation de l'apercu ; en jeu c'est le calque FA)
        for y in (8, 9): t.putpixel((x + (1 if x in (2, 10) else 0), y), (26, 26, 26, 255))
    s.paste(t, (4 * k, 0))
    s.paste(c(20, 20, 28, 32), (4 * k, 8 * k))
    s.paste(c(44, 20, 48, 32), (0, 8 * k)); s.paste(c(44, 20, 48, 32).transpose(Image.FLIP_LEFT_RIGHT), (12 * k, 8 * k))
    s.paste(c(4, 20, 8, 32), (4 * k, 20 * k)); s.paste(c(4, 20, 8, 32).transpose(Image.FLIP_LEFT_RIGHT), (8 * k, 20 * k))
    return s
cols = 8; Z = 5
cw, chh = 32 * Z + 12, 64 * Z + 20
pl = Image.new('RGB', (cols * cw, ((len(noms) + cols - 1) // cols) * chh), (40, 40, 44)); d = ImageDraw.Draw(pl)
for i, n in enumerate(noms):
    im = Image.open(io.BytesIO(z.read(n))).convert('RGBA')
    f = front(im).resize((32 * Z, 64 * Z), Image.NEAREST)
    x0, y0 = (i % cols) * cw + 6, (i // cols) * chh + 2
    pl.paste(f, (x0, y0), f)
    nom = n.split('/')[-1]
    d.text((x0, y0 + 64 * Z + 2), (nom[:-4].replace('zombie', '') + ' ' + lis.get(nom, ''))[:26], fill=(230, 230, 230))
pl.save(sys.argv[1] if len(sys.argv) > 1 else os.path.join(ICI, 'apercus', 'planche-hd.png'))
