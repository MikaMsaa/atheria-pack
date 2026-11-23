# -*- coding: utf-8 -*-
# Programme des constructions : chaque batiment des plans valides, rapproche d'un modele vitrine existant ou marque "nouveau modele".
import csv, json, unicodedata, os
ICI = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(ICI, 'construire_plans.py'), encoding='utf-8').read().split('def svg_ville')[0]
ns = {'__file__': os.path.join(ICI, 'construire_plans.py')}
exec(compile(src, 'plans', 'exec'), ns)
for f in ('villes_lot1.py', 'villes_lot2.py', 'villes_lot3.py', 'villes_lot4.py'):
    exec(open(os.path.join(ICI, f), encoding='utf-8').read(), ns)
VILLES = [ns[k] for k in ('MAM', 'LON', 'MAJ', 'COC', 'GOT', 'KAW', 'DEM', 'VAH', 'HAN', 'MTS', 'SAD', 'CHI', 'CHO', 'PEC', 'ZAM', 'ICE', 'SOM')]

def sa(t): return ''.join(c for c in unicodedata.normalize('NFD', t.lower()) if unicodedata.category(c) != 'Mn')

# (mots du batiment, modele vitrine, famille). Ordre = priorite.
REGLES = [
    (('pharmacie',), 'bt_dispensaire', 'Santé'),
    (('hotel des finances',), 'hm_poste / bt_poste', 'Équipements'),
    (('tour de guet',), 'ga_poste', 'Défense'),
    (('salle des turbines',), 'ru_centrale', 'Réseaux'),
    (('case commune',), 'bg_salle_communale', 'Équipements'),
    (('parkings souterrains',), 'bt_parking', 'Transport'),
    (('vegetation', 'dunes', 'sentiers', 'foret', 'tranchees', 'toits qui depassent', 'front de taille', 'canal a ciel', 'panneaux', 'grand-rue', "file d'attente", 'epouvantail', 'clotures', 'ruches', 'couloirs de pistes'), None, 'Terrain et décor (pas de modèle)'),
    (('tir', 'parcours du combattant', 'cible'), 'ga_camp', 'Militaire'),
    (('palais de justice', 'tribunal'), 'hm_tribunal', 'Sécurité'),
    (('prison', 'cellules'), 'pr_prison / pr_cour', 'Sécurité'),
    (('poste de garde', 'poste de guet', 'poste de securite', 'poste de controle'), 'ga_poste', 'Défense'),
    (('banque',), 'banque / vr_banque', 'Commerce'),
    (('beffroi',), 'gt_beffroi', 'Équipements'),
    (('hospice',), 'gt_hospice', 'Santé'),
    (('auberge',), 'bg_auberge', 'Hébergement'),
    (('conteneur',), 'ru_conteneurs / bd_conteneurs', 'Logement collectif'),
    (('cantine', 'cuisine collective'), 'bd_cantine', 'Équipements'),
    (('dortoir', 'internat', 'residence etudiante', 'logements'), 'bd_dortoir / bt_foyer / md_residence', 'Logement collectif'),
    (('piscine', 'gymnase'), 'bt_piscine / bt_gymnase', 'Équipements'),
    (('centre commercial',), 'bt_centre', 'Commerce'),
    (('station total', 'station de lavage'), 'bt_station / ru_garage', 'Commerce'),
    (('poste source', 'poste electrique'), 'ru_centrale2', 'Réseaux'),
    (('epuration',), 'ru_dechets', 'Réseaux'),
    (('terrain de foot',), 'bd_foot', 'Espaces publics'),
    (('grenier',), 'ru_silos', 'Industrie'),
    (('emetteur',), None, 'Émetteur de ville morte'),
    (('mairie', 'hotel de ville'), 'bt_mairie_annexe / bg_mairie / ds_mairie / hm_mairie', 'Mairie'),
    (('prefecture',), 'hm_mairie', 'Mairie'),
    (('ecole', 'college', 'lycee'), 'bt_college / bg_ecole / hm_ecole / bd_ecole', 'École'),
    (('dispensaire', 'infirmerie', 'clinique'), 'bt_dispensaire / ga_infirmerie / vr_clinique', 'Santé'),
    (('hopital',), 'hp_hopital', 'Santé'),
    (('gendarmerie', 'commissariat'), 'bt_commissariat / hm_commissariat', 'Sécurité'),
    (('pompiers',), 'bt_pompiers / ru_pompiers', 'Sécurité'),
    (('caserne', 'mess', 'poste de commandement'), 'ga_caserne / ga_mess / ga_poste', 'Militaire'),
    (('armurerie', 'soute a munitions', 'munitions'), 'ga_armurerie / ba_depot', 'Militaire'),
    (('helisurface', 'heliport'), 'ga_heliport', 'Militaire'),
    (('bunker',), 'ba_base', 'Militaire'),
    (('mirador', 'barbeles', 'chevaux de frise', 'enceinte', 'palissade', 'barricade'), 'bd_barricade / ga_camp', 'Défense'),
    (('marche', 'halle'), 'bt_marche / gt_halle_draps / bd_marche / halles', 'Commerce'),
    (('boutique', 'commerce', 'cafe', 'comptoir', 'rue commercante', 'restaurant', 'bar '), 'bt_boutiques / bg_commerces / ru_cafe', 'Commerce'),
    (('supermarche',), 'bt_supermarche', 'Commerce'),
    (('station-service', 'pompe a essence'), 'bt_station / ds_station / ru_station', 'Commerce'),
    (('hotel',), 'hm_hotel / vr_hotel / ds_motel', 'Hébergement'),
    (('chalet',), None, 'Station de ski'),
    (('telesiege', 'forfaits', 'location de skis', 'pistes', 'canons a neige', "table d'orientation", "gare d'arrivee"), None, 'Station de ski'),
    (('tour', 'immeuble', 'barre'), 'bt_tour / grand_h_l_m / immeubles', 'Logement collectif'),
    (('villa',), 'md_villa', 'Logement individuel'),
    (('maison', 'lotissement', 'pavillon'), 'md_maisons / bg_maisons / gt_maisons', 'Logement individuel'),
    (('case', 'banga', 'cabane'), 'bd_bangas / bd_cabanes', 'Logement individuel'),
    (('coron',), 'ru_corons', 'Logement collectif'),
    (('chateau d\'eau',), 'bt_chateau_eau', 'Réseaux'),
    (('reservoir', 'citerne', 'cuve', 'kerosene', 'forage', 'puits', 'pompage', 'pompe', 'retenue'), 'ru_citernes', 'Réseaux'),
    (('centrale', 'barrage', 'groupe electrogene', 'poste du parc'), 'ru_centrale / ru_centrale2', 'Réseaux'),
    (('jetee', 'cale', 'ponton', 'quai', 'debarcadere'), 'gt_quai / ru_barge', 'Port'),
    (('capitainerie',), 'ru_capitainerie', 'Port'),
    (('criee', 'poisson', 'conserverie', 'fumoir', 'sechoir', 'chambre froide', 'glaciere'), 'ru_criee / ru_frigo', 'Pêche'),
    (('barque', 'pirogue', 'filet', 'nasse', 'chantier de barques'), 'ru_chantier', 'Pêche'),
    (('distillerie', 'alambic'), 'ru_distillerie', 'Industrie'),
    (('scierie',), 'bg_scierie', 'Industrie'),
    (('usine', 'atelier', 'garage', 'hangar', 'entrepot', 'silo', 'depot'), 'ru_usine / ru_ateliers / ru_garage / ru_entrepot / ru_silos / ga_hangar', 'Industrie'),
    (('mine', 'carriere', 'chevalement', 'poudriere', 'concasseur', 'terril'), None, 'Mine et carrière'),
    (('labo', 'laboratoire', 'sas', 'serre'), 'vr_labo', 'Laboratoire Somaco'),
    (('batiment a',), 'vr_siege', 'Laboratoire Somaco'),
    (('gare routiere',), 'vr_gare_routiere', 'Transport'),
    (('gare', 'rail'), 'ru_gare / gare', 'Transport'),
    (('parking', 'navette', 'abri de bus', 'voitures'), 'bt_parking / hp_parking / vr_parking', 'Transport'),
    (('place', 'square', 'parc', 'jardin', 'belvedere', 'terrain de sport', 'stade', 'kiosque'), 'bt_square / bg_place / gt_jardin / md_parc / bd_foot', 'Espaces publics'),
    (('lavoir',), 'bd_lavoir', 'Espaces publics'),
    (('salle', 'foyer', 'case commune', 'conseil'), 'bg_salle_communale / bt_maison_quartier / bd_foyer_jeunes', 'Équipements'),
    (('universite', 'campus', 'bibliotheque', 'mediatheque'), 'bt_bibliotheque / md_mediatheque / gt_bibliotheque', 'Équipements'),
        (('champ', 'verger', 'riziere', 'rizi', 'potager', 'maraich', 'plantation', 'arbres', 'manioc', 'poulailler', 'carres', 'grange', 'etable', 'cooperative', 'bascule'), 'bd_jardins', 'Agriculture'),
    (('tir', 'parcours', 'cible'), 'ga_camp', 'Militaire'),
]

ZAM_MOTS = ('enclos', 'grilles', 'passerelle', 'abris', 'mangeoire', 'veterinaire', 'grue', 'portail', 'guichet', 'accueil', 'maquette', 'reserves', 'belvedere')
def classer(b, ville=''):
    s = sa(b)
    if ville == 'Parc de Zamani' and any(m in s for m in ZAM_MOTS): return None, 'Parc de Zamani'
    for mots, modele, fam in REGLES:
        if any(sa(m) in s for m in mots): return modele, fam
    return None, 'Divers (décor, à concevoir sur place)'

LIGNES = []
for V in VILLES:
    for z in V['zones']:
        for (b, etat) in z[7]:
            if etat == 'existant': continue
            modele, fam = classer(b, V['nom'])
            LIGNES.append({'ville': V['nom'], 'zone': f"{z[0]}. {z[2]}", 'batiment': b, 'etat': etat, 'famille': fam, 'modele': modele or 'nouveau modèle'})

out = os.path.join(ICI, 'programme-constructions.csv')
with open(out, 'w', newline='', encoding='utf-8-sig') as f:
    w = csv.DictWriter(f, fieldnames=list(LIGNES[0]), delimiter=';'); w.writeheader(); w.writerows(LIGNES)

from collections import Counter, defaultdict
fam = Counter(l['famille'] for l in LIGNES)
neuf = Counter(l['famille'] for l in LIGNES if l['modele'] == 'nouveau modèle')
print(len(LIGNES), 'lignes ->', out)
for k, n in fam.most_common(): print(f'{n:4d} {k}  (nouveaux modeles {neuf[k]})')
json.dump(LIGNES, open(os.path.join(ICI, 'programme-constructions.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)

# Fragment HTML pour la page des plans
import html as H
mod_par_fam = defaultdict(set)
for l in LIGNES:
    if l['modele'] != 'nouveau modèle':
        for m in l['modele'].split(' / '): mod_par_fam[l['famille']].add(m)
o = ['<section id="programme" class="ville"><header class="ville-tete"><p class="surtitre">Préparation, rien n\'est posé</p><h2>Programme des constructions</h2></header>',
     f'<p>Les plans validés comptent <b>{len(LIGNES)} bâtiments ou aménagements</b> à faire (les bâtiments déjà en place ne sont pas comptés). '
     'Chacun est rapproché d\'un modèle de la vitrine quand il en existe un. Le modèle sert de base : il sera adapté à la ville (matériaux, usure, relief), jamais posé tel quel deux fois de suite. '
     'La liste complète, ville par ville, est dans <code>outils/contenu/plans-urbanisme/programme-constructions.csv</code>.</p>',
     '<h3>Par famille</h3><div class="tableau"><table><thead><tr><th>Famille</th><th>Nombre</th><th>Modèles de la vitrine à reprendre</th></tr></thead><tbody>']
for k, n in fam.most_common():
    m = ', '.join(sorted(mod_par_fam[k])) or '<i>aucun, à créer</i>'
    o.append(f'<tr><td>{H.escape(k)}</td><td>{n}</td><td>{m}</td></tr>')
o.append('</tbody></table></div>')
o.append('<h3>Modèles nouveaux à concevoir</h3><ul>'
         '<li><b>Émetteur de ville morte</b> (8 villes) : un seul modèle, mât, coffret, panneau solaire, haut-parleur, décliné par ville.</li>'
         '<li><b>Station de ski</b> (Choungui) : gares du télésiège, pylônes, chalets, location, guichet, table d\'orientation.</li>'
         '<li><b>Mine et carrière</b> (Vahibé, Handrema) : chevalement, laverie, concasseur, poudrière, terrils.</li>'
         '<li><b>Parc de Zamani</b> : hall vitré, grilles et fossés, passerelle, portail, infirmerie vétérinaire.</li>'
         '<li><b>Pièces uniques</b> : ' + H.escape(', '.join(sorted({l['batiment'] for l in LIGNES if l['famille'].startswith('Divers')}))) + '.</li>'
         '<li><b>Terrain et décor</b> : ' + str(fam['Terrain et décor (pas de modèle)']) + ' aménagements faits au moment de la pose (sentiers, tranchées dans la cendre, végétation qui reprend, panneaux), sans modèle.</li></ul>')
o.append('<h3>Ordre de travail proposé</h3><ol>'
         '<li>Attendre la fin de la génération et des contrôles de la carte (règle de Mika).</li>'
         '<li>Concevoir d\'abord les modèles qui servent le plus : émetteur, mairie, école, maisons, marché. Chaque modèle passe au banc et en capture avant d\'être utilisé.</li>'
         '<li>Poser Mamoudzou et Longoni, les villes du trailer, puis Majicavo, Coconi et la ville gothique (déjà codée, banc en cours).</li>'
         '<li>Poser les villes mortes avec le même jeu de modèles, chacune avec son histoire.</li>'
         '<li>Finir par les sites isolés, qui ont le plus de pièces uniques.</li>'
         '<li>Pour chaque ville : terrasses et fondus de lisière, puis captures des bords avant de dire « fini », avec le tableau OK, KO ou non testable.</li></ol></section>')
open(os.path.join(ICI, 'programme.html'), 'w', encoding='utf-8').write('\n'.join(o))
print('programme.html ok')
