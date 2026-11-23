# Reprise du fil île (carte) — 15/11, vers 09:25 heure du PC

**En cours :** la chaîne `lancer-apres-ext3-c21-captures.ps1` (lancée à 08:40, acceptée sans demande).
- L'extension 3 est finie et le verrou rendu à 09:22:15.
- Suite de la chaîne : pause de 150 s, puis c21 laisse passer le Trailer (~25 min), puis la bande sud de colline2 (~8 min), puis Villes (~25 min), chacun ayant au plus 5 min pour prendre le verrou ; ensuite 2 min de verrou libre, c21, son QC, et les captures seulement si la GRILLE du QC n'a aucun KO.
- Ces processus sont des enfants de cette session : si on la ferme, ils meurent. Les journaux à suivre : `journal-enchainement-c21.txt`, `journal-c21.txt`, `qc-c21.txt`.
- Le coordinateur veut le QC de c21 : scores cubiques en jeu contre les scores prévus, glace ou neige sur les îlots, marches de Majicavo, végétation des marges, lot68 à Y 67, lave, et le Y médian des Goblini.

## c21 FAIT (10:10 → 10:21, 12 min, verrou rendu à 10:21:56) : QC KO, captures NON lancées
- Lancé par `lancer-c21-captures-apres-villes-trailer.ps1` : file Villes puis Trailer (`lancer-c21.ps1 -File 'villes,trailer'`). Monde : `pilote-bis-c21m`. QC : `qc-c21.txt`.
- GRILLE : phare OK | z002 KO (8,2 contre 7,4 prévu) | hum KO (8,6 contre 7,6) | z006 KO (23,5 contre 6,7) | autres sculptures OK | îlot A KO (57 colonnes de glace) | Phare KO (1 colonne) | Majicavo marche et végétation OK | lot68 Y 67 OK | lave hors volcan OK | lave sud lot68 OK.
- **Goblini : Y médian 111** (min 109, max 118, 94 % à ±1 ; point le plus haut Y 115 ; 34 colonnes en surplomb). Plateau prévu à Y 111, avec 40 blocs libres au-dessus.
- La mare de lave de Villes dans lieux_2 vient de 0.9.4i + v3j (sans lave_hors_volcan) : c'est attendu. En 0.9.6 : 0 lave (section 8 du QC).
- En attente d'une décision : corriger la glace des îlots et z006, puis refaire c21 ; ou lancer les captures quand même. Après nous : Villes (15 min), puis le Trailer (C24 copie pilote-v3-colline2).

## Règles toujours valables
- Ne jamais toucher serveur\, pack\, GitHub, ni serveur-ile-test (lecture seule). Tests sur copies jetables uniquement.
- Verrou `outils\pause-file.lock` :
  - prise atomique (CreateNew) avec le PID ; suppression seulement au nettoyage final ;
  - aucun java étranger de plus de 1 Go ;
  - au moins 6,5 Go libres pour un serveur, 7,5 Go pour des captures ;
  - ne tuer que ses propres PID ;
  - attendre 2 min de verrou libre et laisser passer la file que donne le coordinateur.
- Tout rapport final se termine par une grille QC : OK / KO / non testable.
- Lanceurs : toujours dans scripts-test, sous le nom `lancer-*.ps1`, lancés exactement par `powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Users\El-Afdal\Desktop\Atheria Zombie Edition\outils\atheria-ile-mod\scripts-test\lancer-....ps1"` (guillemets doubles, sans `&`).

## La règle du PC (corrigée à 08:39 sur demande directe de Mika, message de 04:34 UTC)
- Cause des refus : le PC est en mode auto, et ce mode **suspend** les règles allow larges sur un interpréteur. La ligne de `.claude\settings.local.json` (`PowerShell(powershell -NoProfile -ExecutionPolicy Bypass -File \"…\scripts-test\lancer-*)`) ne sert donc pas : c'est le classifieur qui décidait. Il a accepté l'ext3 et refusé la chaîne (« [Destructive or Unwanted Actions] ») parce que l'accord ne venait que d'une note relayée.
- Correction : un bloc `autoMode` dans `C:\Users\El-Afdal\.claude\settings.json`. C'est le seul endroit lu, avec les réglages gérés ; il n'est pas lu dans les settings du projet.
  - `allow` : `$defaults` + l'autorisation des `scripts-test\lancer-*.ps1` (copies jetables, sous verrou ; jamais serveur\, pack\, instances\Atheria*, GitHub ni suppression de fichiers du projet) ;
  - `environment` : `$defaults` + ces mêmes lanceurs, déclarés comme lanceurs de test de confiance.
- Copie de l'ancien fichier : `settings.json.bak-20261115`. Vérifié avec `claude auto-mode config` (la règle y apparaît). La ligne de settings.local.json n'a pas changé.
- Test : `lancer-apres-ext3-c21-captures.ps1` a été accepté sans demande à 08:40, après la correction. L'ext3 relancée à 08:53 l'a été aussi.

## Extension 3 de colline2 (09:06 → 09:22) : nord fait, sud KO (manque de mémoire)
- Verrou pris à 09:06:02 (PID 18072, 5 min de verrou libre, 8,3 Go libres) et rendu à 09:22:15.
- Sommet sondé : Y 132.
- Nord ouest : 148 s ; nord est : 118 s.
- Sud ouest : `OutOfMemoryError: Java heap space` (Xmx 4G) à 09:15:35, puis blocage et arrêt par le watchdog à 09:17:36. Rapports : `serveur-pilote-essai\crash-reports\crash-2026-11-15_09.15.35-server.txt` et `09.17.36`.
- QC :

| Contrôle | Résultat |
|---|---|
| 0 chunk existant modifié | OK (7 741 chunks complets avant, 0 modifié) |
| Sommet à Y 132 | OK |
| Bande nord x 2330..3900, z -2750..-1800 | OK (5 938 chunks complets sur 5 940 ; 1 absent en 205,-165, 1 inachevé en 235,-114) |
| Bande sud z -760..200 | KO (198 chunks complets sur 6 039) |
| Arbre toujours absent | OK |

- La copie a été remise en place (regions 04158CBC, -Xmx4G) et le monde rangé dans `pilote-v3-colline2`.
- **Bande sud relancée à 09:24** (sous le même accord) : `lancer-sud-colline2.ps1`, qui appelle `serveur-sud-colline2.ps1`. 8 rectangles d'environ 394 × 480 (rayons 197 × 240), avec un save-all entre chaque. Xmx 5G si au moins 7 Go sont libres à la prise, sinon 4G. Prise 20 s après le passage du Trailer, avant Villes et c21. Journal : `journal-sud-colline2.txt` ; empreintes : `empreinte4-*`. c21 attend le LOCK_RENDU de ce journal (`lancer-c21.ps1`, ancienne version `.avant-sud`).

- **Bande sud FAITE** de 09:26:59 à 09:45:35 (PID 2216, Xmx 5G, 8 rectangles en 381 s, RAM libre au moins 1,7 Go). QC : 0 chunk existant modifié (13 740 avant) OK | sommet Y 132 OK | nord 5 938/5 940 OK | sud 6 039/6 039 OK | arbre absent OK. **L'extension 3 est complète.**

## Lanceurs dans scripts-test (MD5, 8 premiers caractères)
- `lancer-ext3-colline2.ps1` DE46C8FE : attente du verrou, prise après le passage du Trailer + 2 min, ou après 5 min de verrou libre ; appelle `serveur-ext3-colline2.ps1` 5C8EEF83, qui dépend de empreinte2.py, integrite.py, arbre.py, relief_delta_c2.bin et relief_base.bin, copiés dans scripts-test. Ancienne version : `.v1`.
- `lancer-c21.ps1` A65583EE : après l'ext3, file Trailer puis Villes, abandon au bout de 3 h. Anciennes versions : `.avant-direct`, `.avant-villes`.
- `lancer-bis-c21.ps1` 8CBE42C5 : + zone de mesure Goblini, carré de rayon 64 centré en -2128,-112. Ancienne version : `.avant-goblini`.
- `lancer-c21-puis-captures.ps1` FF2E590C (paramètre -ApresExt3) et `lancer-apres-ext3-c21-captures.ps1` EE625577 : captures seulement si c21 est fini et que la GRILLE n'a aucun KO.
- `lancer-captures-c21.ps1` : inchangé.
- `enchainer-c20-c21-captures.ps1` : périmé, ne pas le relancer.
- `qc_c21.py` 91A82E0C :
  - lave des portails en ruine ignorée, comme qc_c20 ; testé sur c20j, le portail en 2562,-2116 est bien ignoré ;
  - section 7 Goblini : `GOBLINI_Y_MEDIAN`, min, max, p10, p90, plus haut bloc de terrain sur lot + marge 8, et colonnes en surplomb. Ancienne version : `.avant-portail`.

## Partie B : emprises pour Villes (choix de Villes, 08:40)
Détail dans `emprises-villes.md`. Script `emprises.py` 2BB397D9 : relief_base seul, qui colle au monde à 1 bloc près ; le delta ne change rien hors zones.
Fichiers v3o (dans branche-relief ; v3n 286bed09 et plateaux-v3l 126a9b84 inchangés, pour c21) :
- `regions-v3o.json` 582B43E8 : v3n + 3 lots avec marge 8 ; le camp Goblini 80×80 remplace l'ancien 64×64 marge 16 ;
- `plateaux-v3o.json` 18C82E00 : plateaux-v3l + la rue et le centre.

Les 3 emprises :
1. **Rue pilote** : x 2912..3023, z -768..-641 (112 en x × 128 en z, quart de tour).
   - Le 128 en x ne rentre pas : il touche la marge 16 du lot « Barge, quai Grande-Terre » (x 3040..3104, z -704..-672), et le décaler l'amènerait à moins de 54 blocs de l'axe de la RN1 (x 2856).
   - Axe de la RN1 à 56 blocs. Terrain Y 64..68, pente 3 %. Plateau à Y 67 avec un **fondu de 16** : il s'arrête à 40 blocs de l'axe, donc hors du talus (axe + 37), au bord du lot du quai.
   - Villes a déjà fait sa pose (sol Y 67, jusqu'à Y 104).
2. **Centre commercial inondé** : x 2968..3095, z -1252..-1125. Plateau plein à Y 65, fondu 32.
   - Terrain : Y 48 côté mer à Y 68, moyenne 63. Remblai jusqu'à 17 blocs à l'est : c'est le fondu qui fait le talus.
   - Eau de crue à Y 66-67, posée par Villes (notre plateau ne pose pas d'eau) et retenue par ses murs.
3. **Camp des Goblini** : x -2168..-2089, z -152..-73, marge 8. Pas encore de plateau.
   - Le plateau prendra le Y médian mesuré par c21 (section 7).
   - Les arbres montent à 37 blocs au-dessus du sol : il faut **au moins 40 blocs libres** au-dessus du plateau, sans surplomb, sans falaise au-dessus du lot, et sans relief sculpté qui pend.
   - Ensuite, ajouter ce plateau dans plateaux-v3o.
- **Ancien pilote** : c'est le bâtiment Lost Cities `ath_v_hr_rue_haussmann` (multi, chunk -1,-7 de la ville `ath_mamoudzou_haussmann`, centre 182,-53). Il n'est pas dans regions. C'est la config de Villes, à lui de le retirer. `branche-relief\lostcities-v3o\ath_mamoudzou_haussmann.json` (bâtiments vides) n'est qu'une proposition. Ne toucher ni à pack\, ni à serveur\.

## Historique (avant 09:00)
## c20 (fait, 08:11 → 08:19)
- Mondes `serveur-pilote-essai\pilote-bis-c20j` (0.9.6, v3l, plateaux-v3l) et `pilote-bis-c20z` (0.9.6, v3j, plateaux-v3j).
- qc_c20 d'origine KO → l'enchaînement a été arrêté avant c21.
- qc_c20 corrigé (`qc_c20.py`, sortie `qc-c20-v2.txt`) :
  - la lave des portails en ruine est ignorée ;
  - la non-régression ne compare que les chunks complets dont les 8 voisins sont complets dans les deux mondes.
- Résultat du QC corrigé :
  - lave hors volcan : OK ;
  - lot68 à Y 67 : OK (97 %) ;
  - 4 mares autour de lot68 ;
  - non-régression : lagon 1 différence ; lot68 312 pour environ 264 attendues ; zone lave 69 pour environ 23, surtout de la végétation.

## Analyse A (hors ligne, conclue)
1. Lave près de 2562,-2116 (11 colonnes) : un portail en ruine du jeu, sous des briques de pierre fendues à Y 70, identique dans c18j, c20z et c20j. Ce n'est pas un lac ; LacsMixin n'est pas en cause.
2. Les 4 mares de c20j :
   - 2848,-983 (eau Y 62, 10 blocs de profondeur) et 2911,-934 : de l'eau d'aquifère ou de creusement au niveau de la mer ;
   - 2880,-941 : de l'eau d'aquifère dans une ruine Lost Cities ;
   - 2862,-922 : un bassin de structure (grès, pots décorés).
   - Aucune ne passe par ConfiguredFeature.place. Le coordinateur ne veut PAS de 0.9.6d aquifère pour l'instant.
3. Non-régression :
   - le sable qui devient de la terre vers 2514,-2164 : dans c18j, ces chunks étaient incomplets, en bordure de génération. C'est un artefact, pas du code ;
   - lot68 : 188 des différences touchent le sol, presque tout dans les décombres Lost Cities vers z -1056 ;
   - zone lave : 66 des 69 différences sont de la végétation seule.
   - Une vraie preuve au bit près demanderait 0.9.4i contre 0.9.6 à config et zones égales (~6 min de java). Gardée pour plus tard.
- Scripts d'analyse dans mes fichiers temporaires (scratchpad) : ana_c20.py, ana_c20b.py, ana_c20c.py, ana_mares.py.

## Partie B (emprises pour Villes) : commencée, rien de conclu
Données réunies :

**Lost Cities** (kubejs\data\lostcities\lostcities\predefinedcities ; centre = chunk*16+8) :

| Ville | Chunk | Rayon |
|---|---|---|
| mamoudzou_haussmann | 182,-53 → 2920,-840 | 200 |
| mamoudzou_verre | 180,-69 → 2888,-1096 | 180 |
| mamoudzou_beton | 172,-75 → 2760,-1192 | 200 |
| majicavo | 150,-126 | 120 |
| longoni_port | 178,-185 | 300 |
| longoni_bidonville | 163,-179 | 260 |

**RN1** (regions-v3n `routes[0]`) :
- largeur 14, bas-côtés 10, talus 20, marge des structures 17. Distance minimale conseillée de l'axe : 7+10+20+17 = 54.
- Points près de Mamoudzou : (2632,-1192) → (2760,-840) → (2856,-728) → (2856,-536) → (2776,-376).

**Lots** :
- lot68 : x 2895..2987, z -1006..-899, marge 8.
- CHM : x 2864..2912, z -1232..-1184.
- Station Total : x 2768..2816, z -576..-528.
- Camp des Goblini : x -2160..-2096, z -144..-80, marge 16.

**Ancien pilote** (chunks 181..188 × -60..-54 = x 2896..3023, z -960..-849) : il CHEVAUCHE lot68 sur x 2896..2987, z -960..-899. À signaler à Villes.

**Mondes de test** couvrant Mamoudzou (régions r.5/6.-2/-3) : pilote-v3-colline2, pilote-bis-c20j, pilote-bis-c18j et d'autres. Aucun monde de test ne couvre les Goblini (r.-5.-1 / r.-5.0).

Reste à calculer, pour chaque emprise : coordonnées, Y moyen / minimum / maximum, pente, biomes, distance à la RN1, et chevauchements avec les lots, les volumes, les sculptures, zones_villes et les rayons Lost Cities.
- Idée pour la rue haussmannienne : à l'est ou au sud de lot68, dans le rayon haussmann, à plus de 54 blocs de l'axe de la RN1 (à vérifier).

## Extension 3 de colline2 (prête, PAS lancée, attend un message direct de Mika)
- Scripts dans mes fichiers temporaires, dossier v3 :
  - `C:\Users\El-Afdal\AppData\Local\Temp\claude\d75113947d74750a\1ff2e7b0-dd47-4f7f-9c0c-971e80afc755\scratchpad\v3\lancer-ext3-verrou.ps1` : attend 3 min de verrou libre, 6,5 Go, abandon au bout de 150 min ;
  - qui appelle `lancer-v3-ext3.ps1` (serveur seul).
- Ils dépendent de empreinte2.py, integrite.py, arbre.py, relief_delta_c2.bin et relief_base.bin, tous dans ce dossier v3.
- Pour un lancement sans demande : en faire une copie dans scripts-test sous le nom `lancer-ext3-colline2.ps1`, avec ces dépendances. Remplacer `$SP = Split-Path -Parent $Ici` par `$SP = $Ici`. Le facteur et c1 de scripts-test sont identiques à ceux des fichiers temporaires (même MD5 08a6ea75 pour le jar facteur).
- Contenu :
  - x 2330..3900 en 4 rectangles : z -2750..-1800 et z -760..200 ;
  - 11 781 chunks à générer, environ 11 à 13 min de génération (15 à 18 chunks/s mesurés à l'extension 2), environ 25 min en tout ;
  - même config que l'extension 2 : jar 0.9.0-relief-v3c (CE786716), regions-v3c (03886893), delta c3e2414a, datapack du monde gardé, Xmx 4G ;
  - sonde du sommet redemandée toutes les 20 s, avec arrêt si le sommet n'est pas entre 128 et 140 (objectif Y 132) ;
  - empreinte avant et après : 0 chunk complet modifié exigé ; intégrité des bandes nord et sud ; l'arbre retiré doit rester absent.
- Variante plus courte : arc de ±75° autour de l'est depuis 2384,-1282, jusqu'à 1 200 blocs : 2 866 chunks, environ 3 min.

## c21, captures et enchaînement (prêts, en attente : à relancer après accord de Mika)
- `lancer-c21.ps1` (MD5 048C3918) :
  - file d'attente intégrée : Mods, puis le Trailer avec ses 2 passages, puis 2 min de verrou libre et 6,5 Go ;
  - appelle `lancer-bis-c21.ps1` : 0.9.6c, regions-v3n, plateaux-v3l, 13 sculptures copiées, 15 zones dont lot68 (2941,-952) ;
  - QC `qc_c21.py`, hors verrou ; essayé sur c19k, il retrouve les scores « avant ».
- Captures : `lancer-captures-c21.ps1` avec le modèle client `c1\zz_c21_client.modele.js` :
  - 1920×1080, distance 10, 6 Go, 32 images en 4 sessions client ;
  - poissons comptés au lagon, en créatif, apparition autorisée 120 s ;
  - l'écran principal fait 1536×864 : vérifier la taille réelle des images dans le journal.
- `enchainer-c20-c21-captures.ps1` contient encore c20, à ne pas relancer tel quel. Pour la suite, écrire `lancer-c21-puis-captures.ps1` dans scripts-test.

## Fichiers modifiés aujourd'hui (MD5, 8 premiers caractères)
- regions-v3l dd0ec541 | regions-v3m 422395be | regions-v3n 286bed09 | plateaux-v3l 126a9b84 (nouveau) | plateaux-v3j a6511cc1 (inchangé, Y 65, pour la non-régression)
- lancer-bis-c20 4aaa4510 | qc_c20 (corrigé après c20, MD5 à recalculer)
- Sauvegardes des versions d'avant lot68 Y 67 dans le scratchpad, dossier `avant-lot68-y67`.

## pour-villes-v3j (refait, marqué « PAS ENCORE PRÊT »)
- Contenu :
  - atheria-ile.jar = 0.9.6c ffadd28c ;
  - regions.json = v3m 422395be ;
  - plateaux.json = plateaux-v3l 126a9b84 ;
  - datapack 1.4 avec C1 2e84a11d ;
  - relief_base b70618b3, relief_delta c3e2414a ;
  - sculptures\ (13 dossiers) ;
  - LISEZ-MOI.txt.
- Ancienne version gardée dans le scratchpad, dossier `pour-villes-v3j-ancien`.
- À livrer seulement après c20/c21. Question ouverte : v3m ou v3n pour Villes.

## Réponse déjà envoyée au coordinateur sur serveur\ (lu sans rien modifier)
- level-name=world : 52 Ko, 0 fichier région, aucun datapack, dernière modification le 28/10 à 03:48.
- atheria-ile ne se trouve ni dans serveur\mods ni dans pack\mods.

## c22 (15/11, apres le diagnostic de c21)
- Mesure cubique : la mesure A comptait les trous sous les racines de paletuvier et les angles de rive (fond releve). qc_c22.py mesure en B+C (pieds d'arbre et colonnes d'eau neutres, plats stricts). Sur c21m : z006 4,2, hum 4,4, z002 6,1, tous les lieux < 8. Pas de lissage.
- Glace ilot A / neige Phare : ileA sans "ilot": true dans v3n (correctif 0.9.6b saute), biome de base terralith:rocky_shrubland dans ilots_sable. Jar 0.9.6d-ilots-chauds (5B7AFD96) : relief_naturel.ilots_chauds (defaut 0) = plage/lagon forces dans ilots_sable + anneau. regions-v3n2.json (A8C3BE12) = v3n + ilot ileA + ilots_chauds 16. Meme ajout dans regions-v3o (01FF538B).
- 2 colonnes d'eau > Y 63 : bassins construits du lot70 Majicavo (2424,-2024 et 2440,-2040), pas un defaut.
- qc_c22 : balayage depuis Y 319 et lave de grotte fermee (cave_air au-dessus) ignoree (faux KO pres de z013, poche a Y 145).
- Goblini : plateau x -2168..-2088 z -152..-72 Y 111 fondu 16 dans plateaux-v3o (BAB0375B).
- Lanceurs : lancer-bis-c22, lancer-c22, lancer-captures-c22, lancer-c22-puis-captures, lancer-c22-captures-apres-villes-trailer (file Villes puis Trailer). Monde pilote-bis-c22m, QC qc-c22.txt, journaux journal-*c22*.txt. Lance le 15/11 vers 10:50.
### Etat au redemarrage du PC (15/11 11:17)
- c22 FINI : les 16 zones sont generees (phare ... goblini, 11:05-11:12). save-all flush confirme a 11:12:18 (All chunks are saved). Ensuite, le stop est reste bloque sur Saving worlds et mon java 15156 a ete tue au bout de 240 s : le monde est complet. Monde : outils\serveur-pilote-essai\pilote-bis-c22m (65 fichiers de region). La copie jetable est remise et le verrou rendu a 11:16:34.
- QC de c22 PAS fait (arrete a la demande, avant le redemarrage), donc qc-c22.txt est absent. Captures NON lancees : chaine coupee a 11:16:39.
- A faire apres le redemarrage :
  1. QC hors verrou, sans java : python -I scripts-test\qc_c22.py outils\serveur-pilote-essai\pilote-bis-c22m > scripts-test\qc-c22.txt (attendu : ilots Phare et ilot A OK).
  2. Si la GRILLE n'a aucun KO : captures avec lancer-captures-c22.ps1 (il attend lui-meme le verrou, 7,5 Go libres), forme exacte :
     powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Users\El-Afdal\Desktop\Atheria Zombie Edition\outils\atheria-ile-mod\scripts-test\lancer-captures-c22.ps1"
     Ne PAS relancer lancer-c22 ni la chaine : pilote-bis-c22m existe, et lancer-bis-c22 s'arreterait sur "existe".
  3. Dossier pour Villes : il est pret dans outils\atheria-ile-mod\pour-villes-v3j-preparation (jar 0.9.6d, v3o, plateaux-v3o, dp 1.4, base + delta, 13 sculptures, LISEZ-MOI avec MD5 ; refait par scripts-test\monter_villes.py). Il remplace pour-villes-v3j seulement si le QC c22 est bon. L'ancien pour-villes-v3j (0.9.6c, "PAS ENCORE PRET") n'a pas ete touche.
### Apres le redemarrage (15/11 11:25-12:00)
- QC c22 fait : GRILLE sans KO (qc-c22.txt). Monde c22m intact (level.dat + 19 931 chunks lisibles).
- pour-villes-v3j = l'ancien dossier preparation (0.9.6d, v3o) ; l'ancien est garde sous pour-villes-v3j-ancien-096c.
- Captures : RAM libre trop basse apres le redemarrage (4,6 a 6,5 Go). Essai en 5G (lancer-captures-c22-5g.ps1 AE453F64, parametres -LibreClient -MemClient -Garde -MinEssai) : verrou pris de 11:56:12 a 11:59:39. java a 6,95 Go, il est tombe a 55 Mo libres, garde declenchee, ESSAI_KO, 0 capture, audit remis a l'identique.
- Regle : il faut a peu pres Xmx + 2 Go + 0,4 Go libres. Attendre la decision du coordinateur (5G avec 7,5 Go libres, ou 4G avec distance 8).
### Captures 5G (12:16-12:36) et tram (15/11)
- Captures : verrou de 12:16:30 a 12:36:35, 0 image. Lots 1-3 coupes par la garde des 400 Mo : client en Xmx 5G a 7,2-7,5 Go de memoire de travail et 9,1 Go de memoire privee. Lot 4 : bug toFixed dans auditTp, corrige dans c1\zz_c22_client.modele.js ; lancer-captures-c22-5g.ps1 est maintenant AA1F7852. Proposition : Xmx 4G et distance 8, ou fermer des sessions Claude.
- Tram, mission 3 : couverture_tram.py (mondes c22m, puis colline2, puis ile_test_1 ; le bake vaut -32767 a Longoni). Ligne min 5, embranchement min 6, pas d'eau. Environ 40 % du trace n'est pas genere (non testable). Sous lot67, le fond du port doit rester a Y 63 ou plus.
- Integre : regions-v3o B4253720 (avant : regions-v3o.avant-tram.json 01FF538B), via tram_v3o.py. pour-villes-v3j mis a jour (LISEZ-MOI) ; l'ancien est garde sous pour-villes-v3j-avant-tram.### Etat au 15/11 15:50 (passes 2 et 3 des captures, defauts, 0.9.6e, file PC)
- Captures c22 : passe 2 (4G) 29 images dans captures-c22\ ; passe 3 par la file PC (travail 4-20261115-153558-carte-captures-c22-passe3, depose par Mika a 15:35, prio 4, MD5 du json CCB75218, ecrit par file-pc-carte\ecrire-passe3.py) : 9/9 images dans captures-c22\passe3 (z011 sol+haut, majicavo_bord sol+haut, majicavo_est sol+haut, z004/lot68_bord/z008 sol en camera fixe +4, positions dans cameras-passe3.json). Interface propre (Jade + ParCool coupes, titres coupes via regions-client-v3n2-sans-titres.json, accepter_autre_version).
- POISSONS NON COMPTES : le jeu a plante au point poissons (15:42:28) : atheria-monde FiguresPov.active appelle com.alrex.parcool.common.Parkourability -> NoClassDefFoundError des que la main est rendue (mode creatif). NE PLUS COUPER ParCool. Le resultat de la file dit "ok" (9/9) sans signaler le plantage ni les poissons vides.
- JPEG telephone : captures-c22\jpg\ (34 fichiers, 1600 px, <= 400 Ko, noms lieu_vue.jpg), refaits par captures-c22\vers_jpg.py <dossiers png...> (le dernier dossier ecrase : passer captures-c22 puis captures-c22\passe3).
- Correctif de la file : zz_file_captures.modele.js ligne poissons (id = '' + e.getType()) ; copie .bak-carte-1515 ; MD5 DDA0DA5F -> C311897C (depuis, un commentaire a ete ajoute par un autre fil).
- Defauts (sur la copie carte-c22, outils defauts_c22.py, creux_sculptures.py -> creux-sculptures.txt, neige-sculptures.txt, arbres-flottants-c22.json) :
  - arbres flottants de z010 : PAS dans le monde (0 grappe flottante dans le couloir camera ; 1 a z010 sur la zone ; z009/z013 = branches de sapins de mod) -> artefact de rendu au cliche ;
  - neige/glace hum : terralith:gravel_desert (temperature 0.14, frozen) en x 3328..3359 z 848..879 ; gravier = ce biome + nos galets de DetailsFeature ;
  - trous carres : 432 creux secs (surtout 1 bloc de profondeur) ; origine NON trouvee (ni debris, ni taches, ni arrondi de la carte : 26/432 seulement).
- 0.9.6e compile, jamais lance : branche-relief\atheria-ile-0.9.6e-sculptures-chaudes.jar (567A575D), src modifie (CarteIle + TableBiomes), copie src-avant-096e. Cle relief_naturel.sculptures_chaudes = 1 (defaut 0) : sculpture cotiere (ilot false), biome < 0.15 -> plage si carte 62.5..66, lagon sous 62.5. Hors ligne : hum 37 -> 0 neige/glace ; z009 91491 -> 91444 ; z010 inchange. Monde neuf obligatoire pour le verifier.
- Regle de la file PC (demandee par Mika a 15:22) : refusee a la session (elle ne peut pas modifier ses propres permissions). Texte pret a ajouter dans C:\Users\El-Afdal\.claude\settings.json, autoMode.allow :
  "Using the PC queue for the Atheria map tests is allowed without asking: powershell -NoProfile -ExecutionPolicy Bypass -File \"C:\\Users\\El-Afdal\\Desktop\\Atheria Zombie Edition\\outils\\file-pc\\deposer.ps1\" -Job <a job JSON under outils\\atheria-ile-mod\\scripts-test\\file-pc-carte\\> (with or without -Verifier), and the read-only status script outils\\file-pc\\etat.ps1. The queue runs these jobs on disposable world copies and the AtheriaAudit test instance under the outils\\pause-file.lock lock and restores the instance afterwards. This does not cover jobs from other folders, cancelling or editing other threads' jobs, anything that touches serveur\\, pack\\, the real instances\\Atheria* game instances, GitHub, or deletes project files."
  et, facultatif, dans .claude\settings.local.json permissions.allow :
  "PowerShell(powershell -NoProfile -ExecutionPolicy Bypass -File \"C:\\Users\\El-Afdal\\Desktop\\Atheria Zombie Edition\\outils\\file-pc\\deposer.ps1\" -Job \"C:\\Users\\El-Afdal\\Desktop\\Atheria Zombie Edition\\outils\\atheria-ile-mod\\scripts-test\\file-pc-carte\\*)"
- Lanceur de la file (PID 16720) : detache (cree par WMI, parent conhost sous WmiPrvSE), il survit a la fin des sessions.
- Reste : comptage des poissons (petit travail : lagon f seul, SANS couper ParCool) ; vues sol encore genees : majicavo_est (tronc et feuilles a gauche), z008 (colonne de basalte sur le tiers droit) ; interface propre des 29 images de la passe 2 = passe complete.