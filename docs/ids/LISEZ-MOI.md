# Identifiants des objets et entités (pour les quêtes et le butin)

1. Un fichier `<namespace>.tsv` par mod (tabulations, UTF-8, s'ouvre dans Excel). Colonnes : `type` (item, block, entity), `id` (à copier tel quel, ex. `firstaid:bandage`), nom anglais, nom français (vide si le mod n'a pas de traduction). Tiré des fichiers de langue des jars, le 28/10/2026.
2. `tacz-armes.tsv` liste les 54 armes, 24 munitions et 99 accessoires TaCZ, avec une commande `/give` prête à l'emploi. Une arme est toujours l'objet `tacz:modern_kinetic_gun` avec un composant, par ex. `/give @p tacz:modern_kinetic_gun[custom_data={GunId:"tacz:glock_17",GunFireMode:"SEMI"}]` ; munitions : `tacz:ammo[custom_data={AmmoId:"tacz:9mm"}] 30` ; accessoires : `tacz:attachment[custom_data={AttachmentId:"tacz:..."}]`.
3. `mts.tsv` (véhicules et pièces du MTS Official Pack) : ces objets sont créés par le pack, les identifiants `mts:mtsofficialpack.<nom>` sont déduits et **à vérifier en jeu** (F3+H puis survol, ou JEI).
4. `hordes.tsv` ne contient que les 3 entités réellement enregistrées par The Hordes (zombie, momie et noyé « joueur »). Underground Bunkers n'ajoute aucun objet (structures seulement). Les ID vanilla (`minecraft:...`) ne sont pas listés.
5. Fichiers générés automatiquement : après une mise à jour de mod, des ID peuvent changer. En cas de doute, `/give` avec la touche Tab propose les ID existants.
