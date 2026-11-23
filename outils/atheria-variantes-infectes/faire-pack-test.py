# Pack de TEST : meme contenu, mais la variante est forcee par le nom (v2..v41) pour les captures en jeu
import sys, zipfile, os
ICI = os.path.dirname(os.path.abspath(__file__))
src = zipfile.ZipFile(os.path.join(ICI, 'sortie', 'Atheria-Infectes-variantes.zip'))
out = zipfile.ZipFile(sys.argv[1], 'w', zipfile.ZIP_DEFLATED)
P = 'assets/minecraft/optifine/random/entity/zombie/zombie.properties'
for n in src.namelist():
    if n != P: out.writestr(n, src.read(n))
out.writestr(P, '# TEST : variante forcee par le nom v2..v41\n' + ''.join(f'textures.{i-1}={i}\nname.{i-1}=v{i}\n' for i in range(2, 42)) + 'textures.41=2-41\n')
out.close(); print('ok')
