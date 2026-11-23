import zipfile, os
P = os.path.dirname(os.path.abspath(__file__))
R = r'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition'
for base, out in [(R + r'\pack\mods\atheria-monde.jar', 'atheria-monde-facteur.jar'),
                  (R + r'\outils\serveur-ile-test\mods\atheria-monde.jar', 'atheria-monde-ile-test-facteur.jar')]:
    a = zipfile.ZipFile(base); b = zipfile.ZipFile(os.path.join(P, out))
    na, nb = set(a.namelist()), set(b.namelist())
    diff = sorted(n for n in na & nb if a.read(n) != b.read(n))
    print(out, '| ajoutes', sorted(nb - na), '| retires', sorted(na - nb), '| modifies', diff)
    print('   mixins:', b.read('atheria_monde.mixins.json').decode().split('"client"')[0].split('"mixins"')[1].strip())
