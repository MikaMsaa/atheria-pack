# -*- coding: utf-8 -*-
# Construit la page des plans d'urbanisme (Mamoudzou, Longoni) a partir des donnees de la carte.
import array, json, html
from PIL import Image

OUT = r'C:\Users\El-Afdal\AppData\Local\Temp\claude\d75113947d74750a\3b6158cc-eefc-4df2-8769-4b2d767c856c\scratchpad\plans\plans-urbanisme.html'
BASE = r'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition\outils\serveur-lieux-essai\config\atheria_ile'

b = open(BASE + r'\relief_base.bin', 'rb').read()
A = array.array('h', b[24:]); A.byteswap()
carte = Image.open(BASE + r'\carte.png').convert('RGB')
EAU = {(18, 52, 98), (70, 175, 185), (150, 225, 215), (61, 126, 224), (43, 95, 217)}
reg = json.load(open(BASE + r'\regions.json', encoding='utf-8'))
RN1 = [r for r in reg['routes'] if r['nom'] == 'RN1'][0]['points']


RELEVES = {}
def charger_releve(nom, dossier='releves-lot1'):
    import csv
    f = 'C:/Users/El-Afdal/Desktop/Atheria Zombie Edition/outils/mondes-cloud/%s/%s-grille-pas4.csv' % (dossier, nom)
    g = {}
    for r in csv.DictReader(open(f, encoding='utf-8')):
        g[(int(r['x']), int(r['z']))] = (int(r['sol_y']), int(r['eau_profondeur']))
    xs = sorted({k[0] for k in g}); zs = sorted({k[1] for k in g})
    RELEVES[nom] = (g, xs[0], zs[0], xs[-1], zs[-1])
for _n in ('majicavo', 'coconi', 'ville-gothique-marais'): charger_releve(_n)
for _n in ('kaweni', 'dembeni', 'vahibe', 'handrema'): charger_releve(_n, 'releves-lot2')
for _n in ('mtsamboro', 'sada', 'chirongui', 'choungui'): charger_releve(_n, 'releves-lot3')
for _n in ('pecheurs', 'zamani', 'ice', 'somaco'): charger_releve(_n, 'releves-lot4')

def releve(x, z):
    for g, a, b, c, d in RELEVES.values():
        if a <= x <= c and b <= z <= d:
            return g.get((x - (x - a) % 4, z - (z - b) % 4))
    return None

def courbes(x1, z1, x2, z2, pas_y=5):
    d = []
    for z in range(z1, z2, 4):
        for x in range(x1, x2, 4):
            a = releve(x, z)
            if not a or a[1] > 0: continue
            for dx, dz in ((4, 0), (0, 4)):
                b = releve(x + dx, z + dz)
                if not b or b[1] > 0: continue
                if a[0] // pas_y != b[0] // pas_y:
                    d.append(f'M{x + dx} {z}v4' if dx else f'M{x} {z + dz}h4')
    return ''.join(d)

def terre(x, z):
    r = releve(x, z)
    if r is not None:
        return r[1] == 0
    v = A[((z + 6000) // 4) * 3001 + (x + 6000) // 4]
    if v > -30000:
        return v >= 62
    return carte.getpixel((int(500 + x / 12), int(500 + z / 12))) not in EAU


def masque(x1, z1, x2, z2, pas=4, extra=()):
    """chemin SVG des terres (rangees de cellules), en coordonnees monde"""
    d = []
    for z in range(z1 - 40, z2 + 40, pas):
        x = x1 - 40; debut = None
        while x < x2 + 40:
            t = terre(x, z) and not any(a <= x <= c and bb <= z <= dd for a, bb, c, dd in extra)
            if t and debut is None: debut = x
            if not t and debut is not None:
                d.append(f'M{debut} {z}h{x - debut}v{pas}h{debut - x}z'); debut = None
            x += pas
        if debut is not None: d.append(f'M{debut} {z}h{x - debut}v{pas}h{debut - x}z')
    return ''.join(d)


def e(s): return html.escape(s, quote=True)


# ---------------------------------------------------------------- donnees des villes
# zone : (numero, code PLU, nom, couleur, polygone, fonction, pourquoi, batiments[(nom, etat)])
# etat : 'existant' (deja construit, garde), 'amenager' (dans un existant), 'construire', 'proposer'
MAM = {
    'id': 'mamoudzou', 'nom': 'Mamoudzou',
    'vue': (2600, -1500, 3160, -500),
    'role': "Chef-lieu d'avant l'An 0 : services publics, CHM, quartiers d'Atheria 2030. Tombée au mois 1, c'est aujourd'hui une ville morte où se joue le final au CHM.",
    'faits': [('Emprise', '450 × 700 blocs'), ('Quartiers', '12'), ('Lots déjà construits', '6 (CHM, centre inondé, rue du jour, C28-C33, avenue pilote, C17)'), ('Accès RN1', '4 échangeurs')],
    'zones': [
        (1, 'UH', 'Pôle hospitalier du CHM', 'sante', [(2856, -1300), (2960, -1300), (2960, -1162), (2856, -1162)],
         "Soigner toute l'île : urgences, bloc, archives, logements du personnel.",
         "Au nord, sur le sol le plus sûr (Y 64) hors de la zone inondable, à 230 blocs de l'échangeur nord : les ambulances de toute l'île y arrivent sans traverser le centre. L'avenue de la Mer le relie au rivage, ce qui sert le final (la PAF arrive par le front de mer, la Mer prépare une pirogue).",
         [('CHM : urgences, bloc, salles d\'attente, archives', 'existant'), ('Parvis des urgences et quai des ambulances', 'construire'), ('Hélisurface au sol et centrale de secours (groupes du CHM)', 'construire'), ('Pharmacie centrale', 'construire'), ('Internat et logements du personnel', 'construire'), ('Morgue et blanchisserie (annexe nord)', 'construire'), ('Parking visiteurs', 'construire')]),
        (2, 'UC', 'Front de mer commercial', 'commerce', [(2965, -1300), (3084, -1300), (3096, -1125), (2965, -1125)],
         "Le centre commercial du plan Atheria 2030 et son parking.",
         "Construit sur l'ancienne mangrove remblayée, au point bas où débouche la ravine canalisée : c'est pour ça qu'il est inondé (eau de crue Y 66-67). Il borde le CHM, ce qui en fait une réserve de pillage logique pour les assiégés.",
         [('Centre commercial inondé (C35)', 'existant'), ('Parking inondé, caddies, voitures noyées', 'construire'), ('Gare de bus nord', 'construire')]),
        (3, 'UX', "Zone d'activités nord", 'activite', [(2672, -1300), (2846, -1300), (2846, -1172), (2672, -1172)],
         "Entrepôts, garages, dépôt de bus, poste électrique, pompiers.",
         "Le long de la RN1, côté nord : les camions qui viennent du port de Longoni livrent sans entrer en ville. Les pompiers sont à 2 minutes du CHM et de l'échangeur.",
         [('Poste source électrique (arrivée de la ligne HT de Longoni)', 'construire'), ('Caserne des pompiers', 'construire'), ('Dépôt de bus et garage', 'construire'), ('Entrepôts et concession auto', 'construire'), ('Station de lavage, casse', 'construire')]),
        (4, 'UE', 'Cité administrative', 'admin', [(2856, -1150), (2952, -1150), (2952, -1024), (2856, -1024)],
         "Les services publics qui faisaient de Mamoudzou le chef-lieu.",
         "Au centre géométrique, entre l'hôpital (nord), les affaires (est) et le centre commerçant (sud), sur le boulevard des Services qui relie tout. Une place publique devant la préfecture sert de point de repère.",
         [('Préfecture et sa place', 'construire'), ('Hôtel de ville', 'construire'), ('Palais de justice', 'construire'), ('Commissariat', 'construire'), ('Hôtel des finances et poste', 'construire')]),
        (5, 'UV', "Quartier d'affaires (verre)", 'verre', [(2958, -1118), (3100, -1118), (3084, -1024), (2958, -1024)],
         "Tours de bureaux du plan Atheria 2030, banque, hôtel.",
         "Face au lagon pour la vue, juste au sud du centre commercial. La tour C17 (toit plat, hélicoptère) en est le signal.",
         [('Tour C17 à toit plat et hélicoptère', 'existant'), ('Deux tours de bureaux', 'construire'), ('Banque', 'construire'), ("Hôtel d'affaires", 'construire')]),
        (6, 'UA', 'Centre commerçant', 'centre', [(2866, -1004), (3046, -1004), (3046, -896), (2866, -896)],
         "Rue commerçante : boutiques au rez-de-chaussée, logements au-dessus.",
         "Entre la cité administrative et Petit-Paris : c'est la rue qu'on traverse pour aller de l'un à l'autre.",
         [('Rue du jour 1 (lot68)', 'existant'), ('Boutiques, pharmacie, cafés de part et d\'autre', 'construire')]),
        (7, 'UB', 'Grands ensembles (béton)', 'habitat', [(2696, -1144), (2846, -1144), (2846, -866), (2794, -866)],
         "Logements ouvriers, écoles, stade, marché de quartier.",
         "Le foncier le moins cher, entre la RN1 et le centre : les ouvriers prennent la route du port de Longoni sans traverser la ville. Le château d'eau est ici, sur le point le plus haut (Y 68).",
         [('Barres et tours de logements', 'construire'), ('Groupe scolaire et collège', 'construire'), ('Gymnase et stade', 'construire'), ('Centre social et marché de quartier', 'construire'), ("Château d'eau", 'construire')]),
        (8, 'UH2', 'Petit-Paris (haussmann)', 'hauss', [(2866, -892), (3046, -892), (3046, -642), (2898, -642), (2898, -760), (2866, -800)],
         "Le quartier des cadres et des touristes : immeubles haussmanniens, halles, gare.",
         "Le lore le place avec sa gare et ses halles. Les touristes atterrissaient à Petite-Terre et arrivaient par la barge : Petit-Paris est donc collé au quai de la barge et à la gare.",
         [('C28-C33, îlots haussmanniens', 'existant'), ('Avenue pilote (C25) et toit du Nid (C44)', 'existant'), ('Halles (marché couvert)', 'construire'), ('Square et kiosque', 'construire'), ('Cafés, théâtre', 'construire')]),
        (9, 'UP', 'Gare et quai de la barge', 'port', [(2900, -640), (3040, -640), (3040, -706), (3108, -706), (3108, -600), (2900, -600)],
         "Pôle d'échanges : barge, terminus du tram, gare routière, taxis.",
         "Au bout de l'avenue de la Gare, là où la barge accoste : on passe du bateau au tram ou au taxi sans détour. Les taxis abandonnés de la RN1 viennent d'ici.",
         [('Quai de la barge, Grande-Terre (lot)', 'construire'), ('Gare maritime', 'construire'), ('Terminus du tram (jamais ouvert)', 'construire'), ('Gare routière et station de taxis', 'construire')]),
        (10, 'UZ', 'Entrée sud', 'activite', [(2730, -620), (2818, -620), (2818, -520), (2730, -520)],
         "Services de la route vers Coconi.",
         "Dernier arrêt avant la sortie de ville sur la RN1.",
         [('Station Total (lot)', 'construire'), ('Garage et motel', 'construire')]),
        (11, 'N', 'Coulée verte et ravine', 'vert', [(2696, -1164), (2962, -1164), (2962, -1152), (2696, -1152)],
         "La ravine canalisée qui draine la ville vers le lagon, bordée d'un parc.",
         "Elle suit la pente naturelle jusqu'au point bas du centre commercial : bouchée après l'An 0, elle a noyé le parking et les sous-sols.",
         [('Canal à ciel ouvert et petits ponts', 'construire'), ('Parc linéaire', 'construire')]),
        (12, 'NL', 'Jetée nord et station d\'épuration', 'vert', [(2960, -1480), (3090, -1480), (3090, -1330), (2960, -1330)],
         "Jetée sur le lagon, épuration, plage.",
         "En aval de la ville et des courants : l'épuration rejette loin des quartiers. La jetée C18-C19 est sur ce rivage.",
         [('Jetée sur le lagon (C18-C19)', 'construire'), ("Station d'épuration", 'construire')]),
    ],
    'lots': [('CHM', 2864, -1232, 2911, -1185), ('Centre inondé', 2968, -1252, 3095, -1125), ('C17', 2960, -1104, 2991, -1073),
             ('Rue du jour', 2895, -1006, 2986, -900), ('C28-C33', 2896, -880, 2991, -785), ('Avenue pilote', 2912, -768, 3023, -641),
             ('Barge', 3040, -704, 3103, -673), ('Jetée', 3056, -1472, 3119, -1441), ('Total', 2768, -576, 2815, -529)],
    'voies': [  # lettre, nom, rang, largeur, points
        ('A', 'Avenue de la Mer', 2, 12, [(2632, -1312), (3084, -1312)]),
        ('B', 'Avenue de la Préfecture', 2, 12, [(2706, -1014), (3080, -1014)]),
        ('C', 'Avenue de la Barge', 2, 12, [(2811, -776), (3048, -776)]),
        ('D', 'Avenue de la Gare', 2, 12, [(2856, -620), (3120, -620)]),
        ('E', 'Boulevard des Services', 2, 12, [(2850, -1312), (2850, -776)]),
        ('F', 'Boulevard du Front de mer', 2, 10, [(3036, -1120), (3036, -620)]),
        ('', '', 3, 6, [(2672, -1240), (2846, -1240)]), ('', '', 3, 6, [(2760, -1300), (2760, -1172)]),
        ('', '', 3, 6, [(2756, -1144), (2756, -1014)]), ('', '', 3, 6, [(2800, -1144), (2800, -866)]), ('', '', 3, 6, [(2730, -1080), (2846, -1080)]),
        ('', '', 3, 6, [(2752, -940), (2846, -940)]), ('', '', 3, 6, [(2956, -1300), (2956, -1164)]),   # 17/11 option B de Mika : rues internes x 2904 et z -1086 de la cite administrative retirees (prefecture F1)
        ('', '', 3, 6, [(2994, -1118), (2994, -1024)]), ('', '', 3, 6, [(2866, -892), (3036, -892)]),
        ('', '', 3, 6, [(3006, -892), (3006, -642)]),
    ],
    'voies_txt': [
        ('RN1', 'Voie express (rang 1)', '14 + bas-côtés 10 + talus 20', "Contourne la ville par l'ouest, de Longoni vers Coconi. Quatre échangeurs : nord (A), centre (B), sud (C) et gare (D)."),
        ('A, B, C, D', 'Avenues est-ouest (rang 2)', '12', "Chaque avenue part d'un échangeur et descend jusqu'au lagon. Elles séparent les quartiers au lieu de les traverser."),
        ('E', 'Boulevard des Services (rang 2)', '12', "Colonne vertébrale nord-sud : CHM, cité administrative, centre commerçant, Petit-Paris."),
        ('F', 'Boulevard du Front de mer (rang 2)', '10', "Le long du lagon, du centre commercial à la gare. C'est par lui que la PAF arrive au final."),
        ('Rues', 'Rues de desserte (rang 3)', '6', "Grille d'îlots de 48 à 96 blocs dans chaque quartier, multiples de 16 pour tomber sur les chunks."),
        ('Ruelles', 'Ruelles et cours (rang 4)', '3', "Accès arrière, livraisons, passages entre bâtiments. Tracées avec les bâtiments."),
    ],
    'reseaux': [
        ('eau', "Eau potable", "Château d'eau sur le point haut des grands ensembles (Y 68), conduite principale sous le boulevard des Services, bornes à incendie aux carrefours.", [(2760, -1100), (2850, -1100), (2850, -800)]),
        ('elec', "Électricité", "La ligne haute tension vient de la centrale de Longoni le long de la RN1 (pylônes morts) jusqu'au poste source de la zone d'activités nord, puis dessert le CHM en premier.", [(2620, -1500), (2620, -1300), (2700, -1290), (2856, -1240)]),
        ('tram', "Tram jamais ouvert", "Ligne Longoni, Majicavo, Mamoudzou sous la RN1, puis stations Hôpital et Préfecture, terminus à la gare de la barge.", [(2640, -1500), (2650, -1330), (2836, -1270), (2836, -1030), (2900, -880), (2960, -640), (2990, -612)]),
        ('pluie', "Eaux de pluie", "Ravine canalisée de l'ouest vers le point bas du centre commercial, puis le lagon. Bouchée après l'An 0, d'où l'inondation.", [(2696, -1158), (2970, -1158), (3000, -1180)]),
        ('egout', "Eaux usées", "Collecteur le long de l'avenue de la Mer jusqu'à la station d'épuration nord.", [(2850, -1312), (3000, -1312), (3010, -1360)]),
    ],
    'points': [('tram', 'Station Hôpital', 2836, -1270), ('tram', 'Station Préfecture', 2836, -1030), ('tram', 'Terminus Gare', 2990, -612),
               ('eau', "Château d'eau", 2760, -1100), ('elec', 'Poste source', 2700, -1290), ('egout', 'Épuration', 3010, -1360)],
}

LON = {
    'id': 'longoni', 'nom': 'Longoni',
    'vue': (2280, -3300, 3000, -2620),
    'role': "Le seul port fortifié de l'île : la PAF s'y est retranchée derrière des murs de conteneurs. Hub des joueurs (CAF, infirmerie, marché gris) et entrée des galeries des Passeurs.",
    'faits': [('Enceinte actuelle', '176 × 128 blocs (port seul)'), ('Ville close proposée', '+ 128 × 140 blocs à l\'ouest'), ('Lots déjà construits', '4 (port, porte RN1, station, bouche)'), ('Une seule porte', 'Porte RN1, au sud')],
    'zones': [
        (1, 'P', 'Quais et grues', 'port', [(2536, -3120), (2623, -3120), (2623, -2961), (2536, -2961)],
         "Le port en eau profonde : bassin, navire à quai, deux portiques.",
         "C'est la raison d'être de Longoni. La PAF tient le seul accès à la mer qui fonctionne encore.",
         [('Bassin, quais et navire (lot67)', 'existant'), ('Deux portiques à conteneurs', 'existant'), ('Entrepôt de la PAF (au pied des portiques)', 'amenager'), ('Quai des exécutions, au bout du môle nord', 'amenager'), ('Panneau du quai (archive de Rayade)', 'amenager')]),
        (2, 'H', 'Camp des conteneurs', 'camp', [(2480, -3088), (2536, -3088), (2536, -2996), (2480, -2996)],
         "Là où vivent les habitants : conteneurs-dortoirs, tentes entre les piles, coursives.",
         "Au centre de l'enceinte, protégé de tous les côtés. Le marché gris s'est installé dans les allées, au-dessus de la bouche des Passeurs : c'est le seul endroit où on peut entrer et sortir sans passer par la porte.",
         [('Conteneurs-dortoirs empilés', 'amenager'), ('Tentes et bâches entre les piles', 'amenager'), ('Marché gris d\'Eniy', 'amenager'), ('Bouche des Passeurs', 'existant'), ('Station souterraine et puits', 'existant')]),
        (3, 'A', "Cour d'entrée et CAF", 'admin', [(2448, -2996), (2536, -2996), (2536, -2961), (2448, -2961)],
         "Le filtre : contrôle des papiers, guichet CAF, distribution d'eau et de bons.",
         "Juste derrière la porte : on fait la queue avant d'entrer plus loin. La tour du point haut sud-ouest surveille à la fois la cour et la route.",
         [('Sas de contrôle et bureau des papiers (Rayek)', 'construire'), ('Guichet CAF et planning affiché', 'construire'), ("Distribution d'eau rationnée", 'construire'), ('Tour de guet et sirène (point haut SO)', 'construire')]),
        (4, 'E', 'Entrepôts du port', 'activite', [(2448, -3088), (2480, -3088), (2480, -2996), (2448, -2996)],
         "La rangée de hangars de l'ouest du port.",
         "Les hangars existent déjà : on leur donne un usage plutôt que d'en construire d'autres.",
         [('Hangar 1 : infirmerie (si la ville close est refusée)', 'amenager'), ('Hangars 2 à 4 : stocks de la PAF', 'amenager'), ('Hangar 5 : cantine', 'amenager')]),
        (5, 'G', 'Garnison de la PAF', 'garnison', [(2320, -3104), (2447, -3104), (2447, -3036), (2320, -3036)],
         "Le pouvoir militaire : QG de Pax, armurerie, caserne, groupes électrogènes.",
         "Au nord-ouest, le coin le plus éloigné de la porte et de la RN1 : un assaillant doit traverser toute la ville pour l'atteindre. Vue sur la mer pour le QG.",
         [('QG et bureau de Pax', 'proposer'), ('Armurerie', 'proposer'), ('Caserne et réfectoire', 'proposer'), ('Parc des groupes électrogènes et réserve d\'essence (bunker)', 'proposer'), ('Mirador nord-ouest', 'proposer')]),
        (6, 'V', 'Ville close (civils)', 'habitat', [(2320, -3032), (2447, -3032), (2447, -2961), (2320, -2961)],
         "Les services aux habitants : infirmerie, cantine, citerne, dortoirs, ateliers.",
         "Entre la garnison et la cour d'entrée. Kamel « sait qui dort sans ration derrière les tentes » : les tentes du fond sont ici, contre le mur ouest.",
         [('Infirmerie', 'proposer'), ('Cantine collective', 'proposer'), ("Citerne et collecte d'eau de pluie", 'proposer'), ('Ateliers (réparation, fiches métier)', 'proposer'), ('Tentes du fond, contre le mur ouest', 'proposer')]),
        (7, 'Gl', 'Glacis', 'vert', [(2280, -3104), (2320, -3104), (2320, -2961), (2623, -2961), (2623, -2913), (2280, -2913)],
         "Bande dégagée de 48 blocs autour des murs : fossé, barbelés, pièges.",
         "Défense de base : rien ne doit cacher un assaillant. Déjà prévu au sud de la porte (aucun bâtiment généré).",
         [('Fossé et barbelés', 'construire'), ('Chicanes de béton sur la bretelle', 'existant')]),
        (8, 'R', 'Camp des réfugiés', 'camp', [(2380, -2900), (2590, -2900), (2560, -2790), (2380, -2790)],
         "Bidonville de ceux qui attendent qu'on les laisse entrer.",
         "Le long de la RN1, juste après le glacis. Le lore : « Devant, ils font la queue avec leurs papiers ». Une sortie secrète des Passeurs y débouche.",
         [('Cabanes de tôle et de bâches', 'construire'), ('File d\'attente balisée vers la porte', 'construire'), ('Sortie des Passeurs (proposée)', 'proposer')]),
        (9, 'I', 'Docks et dépôt pétrolier', 'ruine', [(2640, -3080), (2760, -3046), (2860, -3002), (2860, -2896), (2740, -2880), (2640, -2860)],
         "Le port industriel d'avant (style rouille) : cuves, centrale électrique, entrepôts, cimetière de conteneurs.",
         "Sur la presqu'île, à l'est du bassin, comme le vrai port pétrolier. La PAF y envoie des convois chercher l'essence de ses groupes. Les infectés y rôdent : c'est par là que la horde frappe le mur est.",
         [("Dépôt d'hydrocarbures (cuves)", 'construire'), ('Centrale électrique en ruine', 'construire'), ('Entrepôts rouillés et grue', 'construire'), ('Cimetière de conteneurs', 'construire')]),
        (10, 'Ph', 'Pointe du phare', 'vert', [(2900, -2960), (2990, -2900), (2990, -2850), (2900, -2850)],
         "Phare et point côtier.",
         "Au bout de la presqu'île, là où il servait aux navires. Une des caches à Puff du lore.",
         [('Phare', 'construire')]),
        (11, 'B', 'Ancien bourg de Longoni', 'habitat2', [(2280, -2880), (2380, -2880), (2380, -2740), (2280, -2740)],
         "Les maisons des dockers d'avant l'An 0, abandonnées.",
         "À l'ouest du fond de la baie, de l'autre côté de la RN1 : le village existait avant le port moderne.",
         [('Maisons en ruine', 'construire'), ('Ancienne école, épicerie', 'construire')]),
    ],
    'lots': [('Enceinte', 2448, -3088, 2623, -2961), ('Porte RN1', 2440, -2960, 2535, -2913),
             ('Point haut SO', 2448, -2992, 2479, -2961), ('Bouche', 2512, -3024, 2527, -3009)],
    'eau_extra': [(2550, -3130, 2622, -2962)],
    'voies': [
        ('A', 'Bretelle de la Porte', 2, 10, [(2520, -2870), (2490, -2913), (2490, -2961)]),
        ('B', 'Route du port de commerce', 2, 8, [(2624, -2960), (2700, -2905), (2860, -2915), (2960, -2875)]),
        ('C', 'Allée centrale', 3, 6, [(2490, -2961), (2490, -3088)]),
        ('D', 'Rue de la Distribution', 3, 6, [(2330, -2990), (2536, -2990)]),
        ('', '', 3, 5, [(2536, -3088), (2536, -2961)]),
        ('', '', 3, 5, [(2384, -3104), (2384, -2961)]),
        ('', '', 3, 4, [(2320, -3036), (2447, -3036)]),
        ('', '', 3, 4, [(2300, -2860), (2370, -2770)]),
    ],
    'voies_txt': [
        ('RN1', 'Voie express (rang 1)', '14 + bas-côtés 10 + talus 20', "Arrive de Majicavo par le sud-ouest, contourne le fond de la baie et finit au coin sud-est de l'enceinte, devant les docks."),
        ('A', 'Bretelle de la Porte (rang 2)', '10', "Seule entrée de la ville : quitte la RN1, traverse le glacis en chicanes et aboutit à la Porte RN1. Les convois d'essence passent par là."),
        ('B', 'Route du port de commerce (rang 2)', '8', "Prolonge la RN1 vers l'est sur la presqu'île : dépôt pétrolier, centrale, phare."),
        ('C, D', 'Allées intérieures (rang 3)', '6', "La croix qui organise l'intérieur : C de la porte au quai nord, D de la ville close aux quais."),
        ('Coursives', 'Allées entre conteneurs (rang 4)', '3', "Entre les piles du camp, et chemin de ronde sur les murs."),
    ],
    'reseaux': [
        ('elec', "Électricité", "Groupes électrogènes à essence dans le bunker de la garnison. Câbles sur le chemin de ronde vers les projecteurs, la CAF et l'infirmerie. L'essence vient du dépôt par convoi. La centrale d'avant est en ruine, sa ligne vers Mamoudzou est morte.", [(2360, -3070), (2400, -3000), (2500, -2975), (2600, -2970)]),
        ('eau', "Eau", "Citerne de la ville close, collecte de pluie sur les toits des hangars, distribution rationnée au guichet CAF.", [(2400, -3000), (2500, -2980)]),
        ('tram', "Galeries des Passeurs", "Bouche des Passeurs dans le camp, station souterraine, puis la ligne de tram jamais ouverte vers Majicavo sous la RN1. Une sortie secrète dans le camp des réfugiés.", [(2520, -3016), (2505, -3027), (2470, -2900), (2450, -2830), (2424, -2744), (2440, -2640)]),
        ('egout', "Eaux usées", "Rejet dans le bassin du port, ce qui explique son eau noire.", [(2490, -3040), (2550, -3040)]),
    ],
    'points': [('elec', 'Groupes', 2360, -3070), ('eau', 'Citerne', 2400, -3000), ('tram', 'Bouche', 2520, -3016), ('tram', 'Sortie secrète', 2470, -2850)],
}

exec(open(__file__.replace('construire_plans.py', 'villes_lot1.py'), encoding='utf-8').read())
exec(open(__file__.replace('construire_plans.py', 'villes_lot2.py'), encoding='utf-8').read())
exec(open(__file__.replace('construire_plans.py', 'villes_lot3.py'), encoding='utf-8').read())
exec(open(__file__.replace('construire_plans.py', 'villes_lot4.py'), encoding='utf-8').read())
COUL = {'sante': '--z-sante', 'commerce': '--z-commerce', 'activite': '--z-activite', 'admin': '--z-admin', 'verre': '--z-verre',
        'centre': '--z-centre', 'habitat': '--z-habitat', 'habitat2': '--z-habitat', 'hauss': '--z-hauss', 'port': '--z-port', 'vert': '--z-vert',
        'garnison': '--z-garnison', 'camp': '--z-camp', 'ruine': '--z-ruine'}
RES = {'eau': ('--r-eau', '6 4'), 'elec': ('--r-elec', '10 4 2 4'), 'tram': ('--r-tram', '8 5'), 'pluie': ('--r-eau', '2 3'), 'egout': ('--r-egout', '4 4')}
ETAT = {'existant': ('Déjà construit', 'ex'), 'amenager': ('À aménager', 'am'), 'construire': ('À construire', 'co'), 'proposer': ('Proposé, à valider', 'pr')}


def centre(poly):
    xs = [p[0] for p in poly]; zs = [p[1] for p in poly]
    return sum(xs) / len(xs), sum(zs) / len(zs)


def svg_ville(V):
    x1, z1, x2, z2 = V['vue']; w, h = x2 - x1, z2 - z1
    o = [f'<svg class="plan" viewBox="{x1} {z1} {w} {h}" role="img" aria-label="Plan de masse de {e(V["nom"])}">']
    o.append(f'<defs><filter id="lisse-{V["id"]}" filterUnits="userSpaceOnUse" x="{x1-60}" y="{z1-60}" width="{w+120}" height="{h+120}">'
             '<feGaussianBlur stdDeviation="7"/><feComponentTransfer><feFuncA type="discrete" tableValues="0 1"/></feComponentTransfer></filter>'
             f'<pattern id="hach-{V["id"]}" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" class="hach"/></pattern></defs>')
    o.append(f'<rect x="{x1}" y="{z1}" width="{w}" height="{h}" class="mer"/>')
    o.append(f'<path d="{masque(x1, z1, x2, z2, 4, V.get("eau_extra", ()))}" class="terre" filter="url(#lisse-{V["id"]})"/>')
    if V.get('courbes'): o.append(f'<path d="{courbes(x1, z1, x2, z2, V["courbes"])}" class="courbe"/>')
    # quadrillage 100 blocs
    for gx in range((x1 // 100 + 1) * 100, x2, 100): o.append(f'<line x1="{gx}" y1="{z1}" x2="{gx}" y2="{z2}" class="grille"/>')
    for gz in range((z1 // 100 + 1) * 100, z2, 100): o.append(f'<line x1="{x1}" y1="{gz}" x2="{x2}" y2="{gz}" class="grille"/>')
    # zones
    for n, code, nom, c, poly, *_ in V['zones']:
        pts = ' '.join(f'{x},{z}' for x, z in poly)
        o.append(f'<polygon points="{pts}" class="zone" style="fill:var({COUL[c]});stroke:var({COUL[c]})"/>')
    # lots existants
    for nom, a, bb, cc, dd in V['lots']:
        o.append(f'<rect x="{a}" y="{bb}" width="{cc-a+1}" height="{dd-bb+1}" class="lot" fill="url(#hach-{V["id"]})"/>')
    # RN1 : emprise puis chaussee
    rn = ' '.join(f'{x},{z}' for x, z in RN1)
    o.append(f'<polyline points="{rn}" class="rn1-emprise"/><polyline points="{rn}" class="rn1"/>')
    for L, nom, rang, larg, pts in V['voies']:
        p = ' '.join(f'{x},{z}' for x, z in pts)
        o.append(f'<polyline points="{p}" class="voie r{rang}" style="stroke-width:{larg}"/>')
    # reseaux
    for k, nom, txt, pts in V['reseaux']:
        col, da = RES[k]
        p = ' '.join(f'{x},{z}' for x, z in pts)
        o.append(f'<polyline points="{p}" class="reseau" style="stroke:var({col});stroke-dasharray:{da}"/>')
    for k, nom, x, z in V['points']:
        col = RES[k][0]
        o.append(f'<rect x="{x-6}" y="{z-6}" width="12" height="12" class="pt" style="fill:var({col})"><title>{e(nom)}</title></rect>')
    # lettres des voies
    for L, nom, rang, larg, pts in V['voies']:
        if not L: continue
        (ax, az), (bx, bz) = pts[0], pts[1]
        mx, mz = (ax + bx) / 2, (az + bz) / 2
        o.append(f'<g class="lettre"><rect x="{mx-11}" y="{mz-11}" width="22" height="22" rx="3"/><text x="{mx}" y="{mz+1}">{L}</text></g>')
    # numeros des zones
    for n, code, nom, c, poly, *_ in V['zones']:
        cx, cz = centre(poly)
        if V['id'] == 'mamoudzou' and n == 11: cx, cz = 2760, -1158
        if V['id'] == 'mamoudzou' and n == 6: cx, cz = 2880, -950
        if V['id'] == 'mamoudzou' and n == 8: cx, cz = 2882, -840
        if V['id'] == 'longoni' and n == 7: cx, cz = 2300, -3000
        if V['id'] == 'gothique' and n == 5: cx, cz = 2162, 760
        if V['id'] == 'majicavo' and n == 5: cx, cz = 2338, -1985
        if V['id'] == 'kaweni' and n == 2: cx, cz = 1630, -2405
        if V['id'] == 'vahibe' and n == 1: cx, cz = -2060, 2030
        if V['id'] == 'vahibe' and n == 2: cx, cz = -1905, 2120
        if V['id'] == 'handrema' and n == 1: cx, cz = 1635, 2775
        if V['id'] == 'sada' and n == 2: cx, cz = -3812, 525
        if V['id'] == 'chirongui' and n == 4: cx, cz = 845, 3905
        if V['id'] == 'gothique' and n in (1, 2, 3, 4): cx = 2330
        if V['id'] == 'gothique' and n == 6: cx, cz = 2163, 740
        o.append(f'<g class="num" style="--c:var({COUL[c]})"><circle cx="{cx}" cy="{cz}" r="15"/><text x="{cx}" y="{cz+1}">{n}</text></g>')
    # echelle et nord
    sx, sz = x1 + 20, z2 - 24
    o.append(f'<g class="echelle"><rect x="{sx}" y="{sz}" width="100" height="6"/><rect x="{sx+50}" y="{sz}" width="50" height="6" class="b"/>'
             f'<text x="{sx}" y="{sz-8}">0</text><text x="{sx+100}" y="{sz-8}">100 blocs</text></g>')
    o.append(f'<g class="nord"><path d="M{x2-30} {z1+52} l10 -32 l10 32 l-10 -8z"/><text x="{x2-20}" y="{z1+70}">N</text></g>')
    o.append('</svg>')
    return ''.join(o)


def legende(V):
    items = []
    vus = []
    for n, code, nom, c, *_ in sorted(V['zones']):
        items.append(f'<li><span class="pastille" style="--c:var({COUL[c]})">{n}</span>{e(nom)}</li>')
    autres = ['<li><span class="trait rn"></span>RN1</li>', '<li><span class="trait av"></span>Avenue, boulevard</li>',
              '<li><span class="trait rue"></span>Rue de desserte</li>', '<li><span class="hachure"></span>Lot déjà réservé ou construit</li>']
    for k, nom, *_ in V['reseaux']:
        col, da = RES[k]
        autres.append(f'<li><svg width="34" height="10" aria-hidden="true"><line x1="0" y1="5" x2="34" y2="5" style="stroke:var({col});stroke-width:3;stroke-dasharray:{da.replace(" ", ",")}"/></svg>{e(nom)}</li>')
    return f'<ul class="legende">{"".join(items)}</ul><ul class="legende petite">{"".join(autres)}</ul>'


def section(V, decision=''):
    o = [f'<section id="{V["id"]}" class="ville"><header class="ville-tete"><p class="surtitre">Plan de masse</p><h2>{e(V["nom"])}</h2><p class="role">{e(V["role"])}</p></header>']
    o.append('<dl class="faits">' + ''.join(f'<div><dt>{e(a)}</dt><dd>{e(b)}</dd></div>' for a, b in V['faits']) + '</dl>')
    if decision: o.append(decision)
    o.append(f'<figure class="carte"><div class="defile" id="defile-{V["id"]}">{svg_ville(V)}</div>'
             f'<figcaption><button type="button" class="zoom" data-cible="defile-{V["id"]}" id="zoom-{V["id"]}" aria-pressed="false">Agrandir le plan</button>'
             f'<span>Quadrillage de 100 blocs. Les numéros renvoient aux quartiers, les lettres aux voies.</span></figcaption></figure>')
    o.append(legende(V))
    o.append('<h3>Quartiers</h3><div class="quartiers">')
    for n, code, nom, c, poly, fonc, pourquoi, bats in sorted(V['zones'], key=lambda t: t[0]):
        lis = ''.join(f'<li><span class="etat {ETAT[s][1]}">{ETAT[s][0]}</span>{e(bn)}</li>' for bn, s in bats)
        o.append(f'<article class="quartier" style="--c:var({COUL[c]})"><header><span class="pastille">{n}</span><div><h4>{e(nom)}</h4><p class="code">Zone {e(code)}</p></div></header>'
                 f'<p class="fonction">{e(fonc)}</p><p class="pourquoi"><b>Pourquoi ici.</b> {e(pourquoi)}</p><ul class="bats">{lis}</ul></article>')
    o.append('</div>')
    o.append('<h3>Hiérarchie des voies</h3><div class="tableau"><table><thead><tr><th>Voie</th><th>Rang</th><th>Largeur (blocs)</th><th>Rôle</th></tr></thead><tbody>')
    for a, b2, c, d in V['voies_txt']:
        o.append(f'<tr><td class="v">{e(a)}</td><td>{e(b2)}</td><td class="n">{e(c)}</td><td>{e(d)}</td></tr>')
    o.append('</tbody></table></div>')
    o.append('<h3>Réseaux</h3><ul class="reseaux">')
    for k, nom, txt, _ in V['reseaux']:
        col, da = RES[k]
        o.append(f'<li><svg width="34" height="10" aria-hidden="true"><line x1="0" y1="5" x2="34" y2="5" style="stroke:var({col});stroke-width:3;stroke-dasharray:{da.replace(" ", ",")}"/></svg><div><b>{e(nom)}.</b> {e(txt)}</div></li>')
    o.append('</ul></section>')
    return ''.join(o)


DECISION_LON = '''<aside class="decision"><p class="surtitre">Validé par Mika le 16/11</p><h3>La ville close est agrandie vers l'ouest</h3>
<p>L'enceinte réservée sur la carte (176 × 128) est entièrement occupée par le port déjà construit pour le trailer : quais, bassin, conteneurs, hangars. Il n'y reste pas la place pour la CAF, l'infirmerie, la cantine, la garnison et les tentes que le lore y met.</p>
<p><b>Ma recommandation :</b> ajouter une ville close de 128 × 140 blocs collée à l'ouest du port (zones 5 et 6), entourée du même mur de conteneurs. Le terrain y est plat et sec. Le port reste tel quel, on ne fait qu'y aménager le camp, le marché et la cour d'entrée.</p>
<p><b>Sinon :</b> tout loger dans le port actuel, en transformant les hangars et en remplissant les allées de tentes. Plus serré, et on retouche le décor du trailer.</p></aside>'''

PROGRAMME = open(__file__.replace('construire_plans.py', 'programme.html'), encoding='utf-8').read()
METHODE = '''<section id="methode" class="ville"><header class="ville-tete"><p class="surtitre">Après validation</p><h2>Comment ces plans seront posés</h2></header>
<ol class="etapes">
<li><b>Découpage en îlots.</b> Chaque quartier est découpé en îlots numérotés, alignés sur les chunks (multiples de 16). Chaque îlot reçoit un bâtiment précis de la liste de son quartier, jamais un tirage au hasard.</li>
<li><b>Les lots déjà construits restent.</b> CHM, centre inondé, rue du jour, C28-C33, avenue pilote, C17, port, porte RN1, station et bouche ne bougent pas. Les nouveaux plans s'organisent autour d'eux.</li>
<li><b>Voies d'abord.</b> On trace les avenues et les rues, puis les réseaux (bornes, poteaux, regards, pylônes), puis les bâtiments. Comme sur un vrai chantier.</li>
<li><b>Le générateur de villes ne sert plus qu'au remplissage.</b> Dans ces deux villes, il ne pourra garnir que les îlots marqués « remplissage », avec le style du quartier (béton aux grands ensembles, haussmann à Petit-Paris, rouille aux docks). Je règle ça avec la Carte avant toute pose.</li>
<li><b>Intégration au relief, sans cassure.</b> Pas de ville plane : chaque îlot est posé à la hauteur de son terrain, en terrasses avec murets, escaliers et rampes là où ça monte. Au bord des quartiers, la Carte fond le terrain dans la nature (pente adaptée au relief voisin, 32 à 96 blocs). Les rues deviennent des chemins, puis viennent jardins, haies et friches, et la végétation de l'après An 0 entre dans la ville. Chaque lisière est vérifiée en capture, vue du sol et vue du ciel.</li>
<li><b>Chaque bâtiment passe par le banc d'essai</b> et une capture avant d'aller sur la carte, comme pour la ville gothique.</li>
</ol>
<p class="suite">Tous les sites habités ou bâtis de l'île ont maintenant un plan. Rien ne sera posé avant la validation de chaque lot, la fin de la génération et des contrôles.</p></section>'''

CSS = open(r'C:\Users\El-Afdal\AppData\Local\Temp\claude\d75113947d74750a\3b6158cc-eefc-4df2-8769-4b2d767c856c\scratchpad\plans\style.css', encoding='utf-8').read()

page = f'''<title>Plans d'urbanisme d'Atheria</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Condensed:wght@500;600;700&family=IBM+Plex+Sans:ital,wght@0,400;0,600;1,400&family=IBM+Plex+Mono:wght@500&display=swap">
<style>{CSS}</style>
<div class="page">
<header class="tete">
<p class="surtitre">Atheria Zombie Edition · 16/11/2026</p>
<h1>Plans d'urbanisme</h1>
<p class="chapo">Validés par Mika le 16/11 : Mamoudzou, Longoni, Majicavo, Coconi, la ville gothique, Kawéni, Dembéni, Vahibé, Handrema, Mtsamboro, Sada, Chirongui, Choungui, le village des pêcheurs du Sud, le parc de Zamani, la base de la ICE et le campus Somaco. Tous les plans sont validés. Chaque quartier a une fonction, chaque bâtiment a une raison d'être là. <b>Rien n'est posé sur la carte tant que tu n'as pas validé.</b></p>
<nav class="sommaire"><a href="#mamoudzou">Mamoudzou</a><a href="#longoni">Longoni</a><a href="#majicavo">Majicavo</a><a href="#coconi">Coconi</a><a href="#gothique">Ville gothique</a><a href="#kaweni">Kawéni</a><a href="#dembeni">Dembéni</a><a href="#vahibe">Vahibé</a><a href="#handrema">Handrema</a><a href="#mtsamboro">Mtsamboro</a><a href="#sada">Sada</a><a href="#chirongui">Chirongui</a><a href="#choungui">Choungui</a><a href="#pecheurs">Pêcheurs du Sud</a><a href="#zamani">Zamani</a><a href="#ice">Base de la ICE</a><a href="#somaco">Campus Somaco</a><a href="#programme">Programme</a><a href="#methode">Méthode de pose</a></nav>
<p class="lecture">Les zones suivent les codes d'un plan local d'urbanisme (UA centre, UB habitat, UX activités, UE équipements, N naturel). Les plans sont à l'échelle, tracés sur le vrai relief et la vraie côte de la carte finale, avec les 54 lots réservés.</p>
</header>
{section(MAM)}
{section(LON, DECISION_LON)}
{section(MAJ)}
{section(COC)}
{section(GOT)}
{section(KAW)}
{section(DEM)}
{section(VAH)}
{section(HAN)}
{section(MTS)}
{section(SAD)}
{section(CHI)}
{section(CHO)}
{section(PEC)}
{section(ZAM)}
{section(ICE)}
{section(SOM)}
{PROGRAMME}
{METHODE}
</div>
<script>
document.querySelectorAll('.zoom').forEach(function (b) {{
  b.addEventListener('click', function () {{
    var d = document.getElementById(b.dataset.cible);
    var on = d.classList.toggle('grand');
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
    b.textContent = on ? 'Réduire le plan' : 'Agrandir le plan';
  }});
}});
</script>'''
open(OUT, 'w', encoding='utf-8').write(page)
print('ok', len(page))
