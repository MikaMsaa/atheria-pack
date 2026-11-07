# Shaders d'Atheria Zombie Edition

Les shaders sont côté client : chaque joueur les installe dans son dossier `shaderpacks` (Iris est déjà dans le pack).

## Les deux shaders

- **Complementary Reimagined** (principal) : https://modrinth.com/shader/complementary-reimagined
  Rendu réaliste, profils de qualité de Potato à Ultra, il tourne sur tous les PC.
- **Hysteria Shaders** (option sombre) : https://modrinth.com/shader/hysteria-shaders
  Brouillard volumétrique, ciel gris, pensé pour les packs zombie. Pour ceux qui veulent plus de tension.

## Profil Atheria pour Complementary

Le fichier `Atheria - reglages Complementary.txt` applique l'ambiance du serveur :

| Réglage | Valeur | Effet |
| --- | --- | --- |
| Saturation / vibrance | 0,80 / 0,85 | Couleurs ternies, monde fatigué |
| Contraste | 1,10 | Image plus dure |
| Désaturation dans le noir | 0,50 | Les zones sombres deviennent grises |
| Distance du brouillard | 50 | On voit moins loin, les villes se devinent |
| Lumière la nuit | 0,50 | Nuits sombres, la lampe torche devient vitale |
| Phases de lune | activées | Nuit sans lune encore plus noire |
| Aurores, arc-en-ciel | coupés | Rien de féerique |

**Installation** : copier le fichier dans `shaderpacks`, à côté du zip, et le renommer comme le zip suivi de `.txt` (par exemple `ComplementaryReimagined_r5.5.zip.txt`). Lancer le jeu, puis activer le shader.

## Avec Truly Dark

Truly Dark assombrit déjà les nuits. Avec ce profil, prendre le preset **Darker**. Avec Hysteria, prendre **Dark Caves Only**, sinon la nuit devient injouable.

## Avec Particle Rain

La pluie peut s'afficher deux fois (shader + Particle Rain). Si c'est le cas, baisser l'opacité de la pluie du shader (Atmosphere > Weather) ou couper la pluie dans Particle Rain.

## À valider en jeu

Ces valeurs viennent du code source du shader. Rien n'a encore été testé à l'écran : il faudra les ajuster sur le monde test (de jour, de nuit et sous la pluie).
