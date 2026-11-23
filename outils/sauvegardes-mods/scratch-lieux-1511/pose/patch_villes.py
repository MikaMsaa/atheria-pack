import os
D = os.path.dirname(os.path.abspath(__file__))
p = os.path.join(D, "lancer-captures-villes.ps1")
t = open(p, encoding="utf-8").read()
B = "\\"
for a, b in [('"$Ess' + B + 'lieux_1"', '"$Ess' + B + '$Monde"'),
             ('"$Ici' + B + 'points.json"', '"$Ici' + B + '$Points"'),
             ("'lieux_*.png'", "'villes_*.png'"),
             ("lieux_carte", "villes_carte"),
             ("captures-lieux", "captures-villes"),
             ("journal-captures.txt", "journal-villes.txt"),
             ('"$Ici' + B + 'captures"', '"$Ici' + B + 'captures-villes"'),
             ('"$Ici' + B + 'captures' + B, '"$Ici' + B + 'captures-villes' + B),
             ("zz_lieux_client", "zz_villes_client"),
             ("md5-avant.txt", "md5-avant-villes.txt"), ("md5-apres.txt", "md5-apres-villes.txt")]:
    print(repr(a), t.count(a))
    t = t.replace(a, b)
open(p, "w", encoding="utf-8").write(t)
m = open(os.path.join(D, "zz_lieux_client.modele.js"), encoding="utf-8").read().replace("'lieux_'", "'villes_'")
open(os.path.join(D, "zz_villes_client.modele.js"), "w", encoding="utf-8").write(m)
