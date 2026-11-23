# Variantes de Dakouane (zombie vanilla) pour Atheria : textures aleatoires ETF dessinees sur le gabarit
# zombie.png de Fresh Animations (64x64, seule la moitie haute sert). Chaque variante garde le visage, les yeux et
# l'ombrage de Fresh Animations ; on change la peau (teints varies, gagnes par l'infection), les cheveux et les habits
# (civils, dockers, soignants...), uses par vingt ans : decolores, taches, accrocs. Ni texte, ni symbole, ni sang.
# Usage : python -I generer.py  -> sortie\Atheria-Infectes-variantes.zip + apercus\
import colorsys, json, os, random, sys, zipfile
from PIL import Image, ImageDraw

ICI = os.path.dirname(os.path.abspath(__file__))
BASE = Image.open(os.path.join(ICI, 'base', 'zombie_fa.png')).convert('RGBA')
W, H = BASE.size

# ---------- classes de pixels du gabarit (peau, haut, bas, chaussures, intouchable) ----------
def classe(x, y):
    r, g, b, a = BASE.getpixel((x, y))
    if a == 0: return None
    if 12 <= x < 20 and 16 <= y < 20: return 'fixe'          # yeux de Fresh Animations : jamais touches
    if y >= 32: return 'fixe'
    h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
    if s < 0.15:
        return 'chaussure' if y >= 29 or (8 <= x < 12 and y < 20) else 'fixe'
    if 0.17 < h < 0.42: return 'peau'
    if 0.42 <= h < 0.56: return 'haut'
    if 0.56 <= h < 0.8: return 'bas'
    return 'fixe'

CLASSE = {(x, y): classe(x, y) for y in range(H) for x in range(W)}

def lum(p):
    r, g, b = p[:3]
    return 0.299 * r + 0.587 * g + 0.114 * b

MOY = {}
for c in ('peau', 'haut', 'bas', 'chaussure'):
    v = [lum(BASE.getpixel(k)) for k, cc in CLASSE.items() if cc == c]
    MOY[c] = sum(v) / len(v)

# zones du modele (disposition 64x32 du zombie)
def bras(x, y): return 40 <= x < 56 and 16 <= y < 32
def jambe(x, y): return 0 <= x < 16 and 16 <= y < 32 and not (12 <= x < 20 and y < 20)
def corps(x, y): return 16 <= x < 40 and 16 <= y < 32
def tete(x, y): return x < 32 and y < 16
def face_corps(x, y):  # face avant / arriere du torse (y 20-31)
    if 20 <= x < 28: return 'avant'
    if 32 <= x < 40: return 'arriere'
    if 16 <= x < 20 or 28 <= x < 32: return 'cote'
    return None

def melange(a, b, t):
    return tuple(int(round(a[i] * (1 - t) + b[i] * t)) for i in range(3))

def teinte(base, l, moy, rng, bruit=0.06, contraste=1.0):
    f = (l / moy) ** contraste if moy else 1
    f *= 1 + rng.uniform(-bruit, bruit)
    return tuple(max(0, min(255, int(c * f))) for c in base)

# peau infectee : teint humain + gris-vert de l'infection (jamais le vert vif d'origine)
INFECTION = (112, 124, 104)
TEINTS = {
    'clair': (214, 178, 150), 'rose': (206, 160, 138), 'olive': (176, 140, 100), 'mate': (160, 118, 84),
    'brun': (122, 86, 60), 'fonce': (88, 62, 46), 'tres_fonce': (66, 48, 38),
}
CHEVEUX = {
    'noir': (30, 28, 28), 'brun': (62, 44, 32), 'chatain': (96, 70, 48), 'roux_terne': (124, 70, 42),
    'blond_sale': (150, 128, 84), 'gris': (128, 126, 122), 'poivre_sel': (92, 90, 88), 'blanc_sale': (180, 176, 166),
}

def couleur_peau(nom, infection):
    # l'infection ternit le teint (gris), le verdit un peu et l'assombrit, sans effacer les differences de teint
    r, g, b = TEINTS[nom]
    gris = 0.3 * r + 0.59 * g + 0.11 * b
    r, g, b = (c * (1 - infection) + gris * infection for c in (r, g, b))
    r, g, b = r * 0.9, g * 1.0, b * 0.86
    f = 0.86
    return tuple(max(0, min(255, int(c * f))) for c in (r, g, b))

# ---------- les variantes : (nom, teint, infection, cheveux, coupe, haut, couleur haut, bas, couleur bas, pieds, usure) ----------
V = [
    dict(n='docker_gilet', teint='brun', inf=0.45, chev='noir', coupe='ras', haut='gilet', c_haut=(70, 78, 92), gilet=(196, 120, 40), bas='cargo', c_bas=(60, 62, 56), pieds='bottes', usure=0.5, visage=('epais', 'large', 'fermee', 'normal', 'courte', 'cicatrice_joue')),
    dict(n='docker_salopette', teint='fonce', inf=0.4, chev='noir', coupe='crepu', haut='tshirt', c_haut=(150, 140, 120), bas='salopette', c_bas=(46, 66, 104), pieds='bottes', usure=0.6, visage=('fronces', 'large', 'dents', 'creuses', 'aucune', 'aucune')),
    dict(n='docker_bonnet', teint='olive', inf=0.5, chev='brun', coupe='bonnet', bonnet=(40, 52, 70), haut='manches', c_haut=(86, 44, 40), bas='cargo', c_bas=(78, 72, 58), pieds='bottes', usure=0.55, visage=('tristes', 'casse', 'travers', 'cernes', 'pleine', 'aucune')),
    dict(n='infirmiere', teint='mate', inf=0.45, chev='noir', coupe='longs', haut='blouse_soin', c_haut=(96, 150, 156), bas='pyjama', c_bas=(96, 150, 156), pieds='baskets', c_pieds=(200, 200, 196), usure=0.45, visage=('fins', 'fin', 'pincee', 'cernes', 'aucune', 'aucune')),
    dict(n='aide_soignant', teint='clair', inf=0.5, chev='chatain', coupe='court', haut='blouse_soin', c_haut=(120, 156, 120), bas='pyjama', c_bas=(120, 156, 120), pieds='baskets', c_pieds=(190, 190, 186), usure=0.5, visage=('releves', 'retrousse', 'entrouverte', 'normal', 'courte', 'lunettes')),
    dict(n='medecin', teint='brun', inf=0.45, chev='poivre_sel', coupe='court', haut='veste_ouverte', c_haut=(196, 194, 184), c_dessous=(90, 110, 140), bas='toile', c_bas=(64, 64, 70), pieds='chaussures', c_pieds=(40, 32, 28), usure=0.5, visage=('epais', 'long', 'fermee', 'gonflees', 'grise', 'rides')),
    dict(n='civil_jean', teint='rose', inf=0.5, chev='blond_sale', coupe='court', haut='tshirt', c_haut=(150, 46, 44), bas='jean', c_bas=(58, 78, 120), pieds='baskets', c_pieds=(120, 120, 118), usure=0.6, visage=('fins', 'retrousse', 'beante', 'creuses', 'aucune', 'egratignures')),
    dict(n='civile_robe_chemise', teint='tres_fonce', inf=0.35, chev='noir', coupe='tresses', haut='manches', c_haut=(196, 150, 60), bas='jean', c_bas=(44, 56, 84), pieds='sandales', usure=0.55, visage=('releves', 'large', 'entrouverte', 'normal', 'aucune', 'boucle_oreille')),
    dict(n='lyceen_capuche', teint='olive', inf=0.5, chev='noir', coupe='court', haut='sweat', c_haut=(70, 74, 80), bas='jogging', c_bas=(38, 40, 46), pieds='baskets', c_pieds=(170, 60, 50), usure=0.55, visage=('fronces', 'fin', 'dents', 'cernes', 'aucune', 'tache')),
    dict(n='pecheur', teint='fonce', inf=0.45, chev='gris', coupe='ras', haut='debardeur', c_haut=(196, 190, 170), bas='short', c_bas=(64, 88, 70), pieds='pieds_nus', usure=0.7, visage=('epais', 'casse', 'edentee', 'creuses', 'grise', 'rides')),
    dict(n='vendeuse_marche', teint='mate', inf=0.4, chev='brun', coupe='chignon', haut='manches', c_haut=(128, 60, 96), bas='jupe', c_bas=(60, 90, 70), pieds='sandales', usure=0.55, visage=('tristes', 'long', 'pincee', 'gonflees', 'aucune', 'boucle_oreille')),
    dict(n='employe_bureau', teint='clair', inf=0.55, chev='brun', coupe='raie', haut='chemise', c_haut=(168, 186, 204), cravate=(70, 40, 44), bas='toile', c_bas=(46, 48, 58), pieds='chaussures', c_pieds=(34, 26, 22), usure=0.5, visage=('fins', 'long', 'travers', 'cernes', 'aucune', 'lunettes')),
    dict(n='mecanicien', teint='brun', inf=0.5, chev='noir', coupe='court', haut='combinaison', c_haut=(52, 70, 96), bas='combinaison', c_bas=(52, 70, 96), pieds='bottes', usure=0.65, visage=('fronces', 'casse', 'fermee', 'normal', 'moustache', 'egratignures')),
    dict(n='cuisinier', teint='rose', inf=0.55, chev='roux_terne', coupe='court', haut='veste_cuisine', c_haut=(196, 192, 182), bas='carreaux', c_bas=(60, 60, 60), pieds='chaussures', c_pieds=(30, 30, 30), usure=0.55, visage=('releves', 'large', 'beante', 'gonflees', 'courte', 'aucune')),
    dict(n='vieux_gilet_laine', teint='olive', inf=0.5, chev='blanc_sale', coupe='degarni', haut='manches', c_haut=(110, 92, 70), bas='toile', c_bas=(90, 84, 70), pieds='chaussures', c_pieds=(50, 38, 30), usure=0.6, visage=('tristes', 'long', 'edentee', 'creuses', 'grise', 'rides')),
    dict(n='coureuse', teint='fonce', inf=0.4, chev='noir', coupe='queue', haut='debardeur', c_haut=(60, 120, 150), bas='short', c_bas=(36, 36, 40), pieds='baskets', c_pieds=(200, 196, 190), usure=0.5, visage=('fins', 'fin', 'entrouverte', 'creuses', 'aucune', 'cicatrice_front')),
    dict(n='agent_securite', teint='tres_fonce', inf=0.4, chev='noir', coupe='ras', haut='polo', c_haut=(36, 40, 52), bas='cargo', c_bas=(36, 40, 52), pieds='bottes', usure=0.5, visage=('epais', 'large', 'pincee', 'normal', 'favoris', 'cicatrice_levre')),
    dict(n='ouvrier_chantier', teint='mate', inf=0.5, chev='brun', coupe='court', haut='gilet', c_haut=(150, 140, 120), gilet=(200, 170, 50), bas='jean', c_bas=(70, 86, 110), pieds='bottes', usure=0.65, visage=('un_seul', 'casse', 'dents', 'normal', 'courte', 'casque')),
    dict(n='etudiante_veste', teint='clair', inf=0.45, chev='chatain', coupe='longs', haut='veste_ouverte', c_haut=(110, 86, 60), c_dessous=(200, 196, 186), bas='jean', c_bas=(40, 46, 64), pieds='baskets', c_pieds=(150, 150, 150), usure=0.5, visage=('releves', 'retrousse', 'travers', 'cernes', 'aucune', 'tache')),
    dict(n='chauffeur_bus', teint='brun', inf=0.5, chev='poivre_sel', coupe='degarni', haut='chemise', c_haut=(150, 170, 196), bas='toile', c_bas=(40, 50, 76), pieds='chaussures', c_pieds=(30, 26, 24), usure=0.55, visage=('epais', 'long', 'fermee', 'gonflees', 'moustache', 'aucune')),
    # ---- 14/11 : 20 nouveaux personnages, visages tous differents ----
    dict(n='livreur', teint='mate', inf=0.5, chev='noir', coupe='court', haut='polo', c_haut=(60, 110, 150), bas='cargo', c_bas=(52, 54, 58), pieds='baskets', c_pieds=(60, 60, 64), usure=0.55, visage=('fronces', 'retrousse', 'fermee', 'cernes', 'courte', 'casquette'), c_casquette=(60, 110, 150)),
    dict(n='serveuse_tablier', teint='clair', inf=0.45, chev='roux_terne', coupe='queue', haut='chemise', c_haut=(30, 30, 34), tablier=(150, 140, 120), bas='toile', c_bas=(30, 30, 34), pieds='chaussures', c_pieds=(28, 24, 22), usure=0.5, visage=('fins', 'retrousse', 'travers', 'normal', 'aucune', 'tache')),
    dict(n='retraite_cardigan', teint='rose', inf=0.5, chev='blanc_sale', coupe='degarni', haut='manches', c_haut=(90, 100, 84), bas='toile', c_bas=(110, 100, 84), pieds='chaussures', c_pieds=(60, 44, 34), usure=0.55, visage=('epais', 'long', 'edentee', 'creuses', 'grise', 'lunettes')),
    dict(n='retraitee_robe', teint='brun', inf=0.45, chev='gris', coupe='chignon', haut='manches', c_haut=(92, 70, 110), bas='jupe', c_bas=(92, 70, 110), pieds='sandales', usure=0.5, visage=('tristes', 'fin', 'pincee', 'creuses', 'aucune', 'rides')),
    dict(n='marin_pull', teint='olive', inf=0.5, chev='poivre_sel', coupe='bonnet', bonnet=(110, 40, 36), haut='sweat', c_haut=(40, 50, 76), bas='toile', c_bas=(60, 58, 52), pieds='bottes', usure=0.6, visage=('epais', 'casse', 'fermee', 'normal', 'pleine', 'cicatrice_joue')),
    dict(n='agriculteur', teint='brun', inf=0.5, chev='chatain', coupe='court', haut='manches', c_haut=(120, 104, 70), bas='salopette', c_bas=(64, 80, 60), pieds='bottes', usure=0.7, visage=('releves', 'large', 'dents', 'gonflees', 'courte', 'casquette'), c_casquette=(160, 150, 120)),
    dict(n='touriste_chemise', teint='clair', inf=0.55, chev='blond_sale', coupe='degarni', haut='chemise', c_haut=(70, 140, 150), motif=(210, 190, 120), bas='short', c_bas=(170, 150, 110), pieds='sandales', usure=0.5, visage=('fins', 'large', 'beante', 'gonflees', 'aucune', 'lunettes')),
    dict(n='pharmacienne', teint='fonce', inf=0.4, chev='noir', coupe='crepu', haut='veste_ouverte', c_haut=(200, 198, 192), c_dessous=(110, 60, 70), bas='toile', c_bas=(50, 50, 56), pieds='chaussures', c_pieds=(40, 32, 30), usure=0.45, visage=('releves', 'fin', 'fermee', 'normal', 'aucune', 'boucle_oreille')),
    dict(n='macon', teint='tres_fonce', inf=0.45, chev='noir', coupe='ras', haut='debardeur', c_haut=(150, 146, 136), bas='cargo', c_bas=(110, 100, 86), pieds='bottes', usure=0.75, visage=('fronces', 'large', 'edentee', 'creuses', 'bouc', 'egratignures')),
    dict(n='randonneuse', teint='rose', inf=0.5, chev='chatain', coupe='tresses', haut='sweat', c_haut=(70, 100, 60), bas='cargo', c_bas=(80, 74, 60), pieds='bottes', usure=0.6, visage=('epais', 'retrousse', 'entrouverte', 'cernes', 'aucune', 'cicatrice_front')),
    dict(n='poissonnier', teint='olive', inf=0.55, chev='roux_terne', coupe='court', haut='tshirt', c_haut=(190, 186, 176), tablier=(60, 90, 120), bas='toile', c_bas=(50, 52, 56), pieds='bottes', usure=0.65, visage=('un_seul', 'long', 'travers', 'gonflees', 'favoris', 'aucune')),
    dict(n='garagiste_debardeur', teint='mate', inf=0.5, chev='noir', coupe='raie', haut='debardeur', c_haut=(110, 106, 98), bas='cargo', c_bas=(80, 70, 50), pieds='bottes', usure=0.7, visage=('epais', 'fin', 'dents', 'normal', 'moustache', 'cicatrice_levre')),
    dict(n='secretaire_tailleur', teint='brun', inf=0.45, chev='brun', coupe='longs', haut='veste_ouverte', c_haut=(56, 60, 80), c_dessous=(196, 190, 180), bas='jupe', c_bas=(56, 60, 80), pieds='chaussures', c_pieds=(30, 26, 24), usure=0.45, visage=('fins', 'long', 'pincee', 'cernes', 'aucune', 'lunettes')),
    dict(n='etudiant_tshirt', teint='fonce', inf=0.5, chev='noir', coupe='crepu', haut='tshirt', c_haut=(150, 140, 70), bas='jean', c_bas=(50, 64, 96), pieds='baskets', c_pieds=(40, 40, 44), usure=0.5, visage=('releves', 'large', 'entrouverte', 'gonflees', 'courte', 'aucune')),
    dict(n='veilleur_nuit', teint='clair', inf=0.6, chev='gris', coupe='ras', haut='polo', c_haut=(46, 46, 50), bas='toile', c_bas=(46, 46, 50), pieds='chaussures', c_pieds=(26, 24, 22), usure=0.55, visage=('fronces', 'casse', 'fermee', 'creuses', 'grise', 'cicatrice_joue')),
    dict(n='vendeur_journaux', teint='olive', inf=0.5, chev='brun', coupe='bonnet', bonnet=(110, 96, 70), haut='manches', c_haut=(70, 64, 80), bas='jean', c_bas=(60, 70, 90), pieds='baskets', c_pieds=(110, 104, 96), usure=0.6, visage=('tristes', 'retrousse', 'dents', 'cernes', 'courte', 'egratignures')),
    dict(n='couturiere', teint='mate', inf=0.45, chev='poivre_sel', coupe='chignon', haut='manches', c_haut=(160, 110, 90), bas='jupe', c_bas=(70, 66, 60), pieds='sandales', usure=0.5, visage=('fins', 'long', 'fermee', 'gonflees', 'aucune', 'rides')),
    dict(n='docker_casque', teint='fonce', inf=0.5, chev='noir', coupe='ras', haut='gilet', c_haut=(90, 70, 50), gilet=(60, 150, 70), bas='cargo', c_bas=(56, 60, 64), pieds='bottes', usure=0.65, visage=('epais', 'large', 'beante', 'normal', 'pleine', 'casque')),
    dict(n='sportif_survetement', teint='brun', inf=0.5, chev='noir', coupe='court', haut='sweat', c_haut=(120, 40, 40), bas='jogging', c_bas=(120, 40, 40), pieds='baskets', c_pieds=(210, 206, 200), usure=0.5, visage=('un_seul', 'fin', 'travers', 'creuses', 'aucune', 'tache')),
    dict(n='peintre_combinaison', teint='rose', inf=0.5, chev='blond_sale', coupe='raie', haut='combinaison', c_haut=(196, 192, 182), bas='combinaison', c_bas=(196, 192, 182), pieds='bottes', usure=0.7, peinture=True, visage=('releves', 'casse', 'edentee', 'cernes', 'bouc', 'egratignures')),
]

def generer(v, graine):
    rng = random.Random(graine)
    im = BASE.copy()
    px = im.load()
    peau = couleur_peau(v['teint'], v['inf'])
    peau_sombre = tuple(int(c * 0.72) for c in peau)
    c_haut = v['c_haut']; c_bas = v.get('c_bas', (60, 60, 60))
    # vingt ans d'usure : couleurs passees vers le gris-brun
    passe = (118, 112, 100)
    c_haut = melange(c_haut, passe, 0.25 * v['usure'])
    c_bas = melange(c_bas, passe, 0.25 * v['usure'])
    c_pieds = v.get('c_pieds', (70, 56, 44))
    if v['pieds'] == 'bottes': c_pieds = (52, 44, 36)

    ROLE = {}
    v['_role'] = ROLE
    def p_peau(x, y):
        ROLE[(x, y)] = 'peau'
        return teinte(peau, lum(BASE.getpixel((x, y))) if CLASSE[(x, y)] == 'peau' else MOY['peau'], MOY['peau'], rng, 0.05, 1.1)

    def p_tissu(c, x, y, cl):
        ROLE[(x, y)] = 'tissu'
        l = lum(BASE.getpixel((x, y))) if CLASSE[(x, y)] in ('haut', 'bas', 'chaussure') else MOY[cl]
        return teinte(c, l, MOY[CLASSE[(x, y)]] if CLASSE[(x, y)] in MOY else MOY[cl], rng, 0.07, 0.8)

    nouv = {}
    for (x, y), cl in CLASSE.items():
        if cl is None or cl == 'fixe': continue
        if cl == 'peau': nouv[(x, y)] = p_peau(x, y)
        elif cl == 'haut': nouv[(x, y)] = p_tissu(c_haut, x, y, 'haut')
        elif cl == 'bas': nouv[(x, y)] = p_tissu(c_bas, x, y, 'bas')
        elif cl == 'chaussure': nouv[(x, y)] = p_tissu(c_pieds, x, y, 'chaussure')

    def met(x, y, c):
        if CLASSE.get((x, y)) not in (None, 'fixe'): nouv[(x, y)] = c

    haut = v['haut']
    # ---- manches ----
    longues = haut in ('manches', 'sweat', 'chemise', 'combinaison', 'veste_ouverte', 'veste_cuisine')
    for x in range(40, 56):
        for y in range(16, 32):
            if (x, y) not in nouv: continue
            if 20 <= y < 24 or (44 <= x < 48 and y < 20):
                if haut == 'debardeur': nouv[(x, y)] = p_peau(x, y)
                else: nouv[(x, y)] = p_tissu(c_haut, x, y, 'haut')
            elif 24 <= y < 29 and longues:
                nouv[(x, y)] = p_tissu(c_haut, x, y, 'haut')
                if y == 28 and haut in ('chemise', 'sweat'): nouv[(x, y)] = tuple(int(c * 0.8) for c in c_haut)
    # ---- torse ----
    for x in range(16, 40):
        for y in range(20, 30):
            if (x, y) not in nouv: continue
            f = face_corps(x, y)
            if haut == 'debardeur' and f == 'avant' and y < 22 and (x in (20, 21, 26, 27)) is False: nouv[(x, y)] = p_peau(x, y)
            if haut == 'debardeur' and f == 'cote' and y < 23: nouv[(x, y)] = p_peau(x, y)
    # col / encolure
    for x in range(20, 28):
        for y in range(20, 22):
            if haut in ('chemise', 'polo', 'veste_cuisine', 'combinaison'):
                if y == 20 and x not in (23, 24): met(x, y, tuple(min(255, int(c * 1.12)) for c in c_haut))
                elif y == 20: met(x, y, p_peau(x, y))
            if haut == 'blouse_soin' and y == 21 and x in (22, 25): met(x, y, p_peau(x, y))
    if haut == 'chemise':
        for y in range(21, 29): met(23 + (y % 2 == 0), y, tuple(int(c * 0.86) for c in c_haut))  # boutonnage
        if v.get('cravate'):
            for y in range(21, 27): met(23, y, v['cravate']); met(24, y, v['cravate'])
    if haut == 'polo':
        for y in range(21, 23): met(24, y, tuple(int(c * 0.7) for c in c_haut))
    if haut in ('veste_ouverte',):
        for y in range(20, 30):
            met(23, y, teinte(v['c_dessous'], MOY['haut'], MOY['haut'], rng)); met(24, y, teinte(v['c_dessous'], MOY['haut'], MOY['haut'], rng))
            met(22, y, tuple(int(c * 0.8) for c in c_haut)); met(25, y, tuple(int(c * 0.8) for c in c_haut))
    if haut == 'veste_cuisine':
        for y in range(21, 29, 2): met(22, y, (150, 146, 136)); met(25, y, (150, 146, 136))
    if haut == 'sweat':
        for x in range(21, 27): met(x, 26, tuple(int(c * 0.82) for c in c_haut)); met(x, 27, tuple(int(c * 0.88) for c in c_haut))
        for x in range(32, 40): met(x, 20, tuple(int(c * 0.8) for c in c_haut)); met(x, 21, tuple(int(c * 0.85) for c in c_haut))  # capuche dans le dos
    if haut == 'gilet':
        g = melange(v['gilet'], passe, 0.35 * v['usure'])
        for x in range(16, 40):
            f = face_corps(x, 20)
            if f is None: continue
            for y in range(20, 30):
                if f == 'avant' and x in (23, 24): continue  # gilet ouvert
                c = teinte(g, MOY['haut'], MOY['haut'], rng, 0.08)
                if y in (24, 27): c = melange((176, 176, 170), (110, 108, 100), rng.uniform(0.2, 0.6))  # bandes reflechissantes ternies
                met(x, y, c)
    if v['bas'] == 'salopette':
        for y in range(21, 30):
            for x in range(21, 27): met(x, y, p_tissu(c_bas, x, y, 'bas'))
            for x in range(33, 39): met(x, y, p_tissu(c_bas, x, y, 'bas'))
        for y in range(20, 22): met(21, y, c_bas); met(26, y, c_bas); met(33, y, c_bas); met(38, y, c_bas)
    if haut == 'combinaison':
        for y in range(20, 30):
            for x in range(16, 40):
                if (x, y) in nouv and CLASSE[(x, y)] != 'peau': nouv[(x, y)] = p_tissu(c_haut, x, y, 'haut')
        for y in range(21, 29): met(24, y, tuple(int(c * 0.75) for c in c_haut))  # fermeture
    if v.get('motif'):  # chemise a motifs passee
        m = melange(v['motif'], passe, 0.3 * v['usure'])
        for (x, y) in list(nouv):
            if corps(x, y) and y >= 20 and CLASSE[(x, y)] != 'peau' and (x * 3 + y) % 5 == 0 and not (haut == 'chemise' and x in (23, 24)):
                nouv[(x, y)] = melange(nouv[(x, y)], m, 0.7)
            if bras(x, y) and 20 <= y < 24 and (x * 3 + y) % 5 == 0: nouv[(x, y)] = melange(nouv[(x, y)], m, 0.7)
    if v.get('tablier'):  # tablier noue a la taille, sur le devant
        t = melange(v['tablier'], passe, 0.3 * v['usure'])
        for x in range(21, 27):
            for y in range(23 if v['n'] == 'serveuse_tablier' else 21, 30): met(x, y, teinte(t, MOY['haut'], MOY['haut'], rng, 0.06))
        for x in range(4, 8):
            for y in range(20, 25): met(x, y, teinte(t, MOY['haut'], MOY['haut'], rng, 0.06))
        if v['n'] != 'serveuse_tablier':
            for y in range(20, 22): met(21, y, t); met(26, y, t)
    # ---- bas ----
    for x in range(0, 16):
        for y in range(20, 32):
            if (x, y) not in nouv or CLASSE[(x, y)] == 'fixe': continue
            if v['bas'] in ('short',) and 25 <= y < 29: nouv[(x, y)] = p_peau(x, y)
            if v['bas'] == 'jupe' and 24 <= y < 29: nouv[(x, y)] = p_peau(x, y)
            if v['bas'] == 'jean' and y == 28: nouv[(x, y)] = tuple(int(c * 0.82) for c in c_bas)
            if v['bas'] == 'cargo' and 23 <= y < 26 and x % 4 in (0, 3): nouv[(x, y)] = tuple(int(c * 0.8) for c in c_bas)
            if v['bas'] == 'carreaux' and y < 29:
                nouv[(x, y)] = (132, 128, 122) if (x + y) % 2 == 0 else (66, 66, 68)
            if v['bas'] == 'jogging' and x % 4 == 0 and y < 29: nouv[(x, y)] = (150, 150, 150)
            if y >= 29:
                if v['pieds'] == 'pieds_nus': nouv[(x, y)] = p_peau(x, y)
                elif v['pieds'] == 'sandales': nouv[(x, y)] = (60, 44, 34) if y == 31 else p_peau(x, y)
                elif v['pieds'] == 'baskets' and y == 31: nouv[(x, y)] = (200, 198, 192)
    if v['bas'] == 'jupe':
        for x in range(28, 36):
            for y in range(16, 20): met(x, y, p_tissu(c_bas, x, y, 'bas'))
    if v['pieds'] in ('pieds_nus', 'sandales'):
        for x in range(8, 12):
            for y in range(16, 20): met(x, y, peau_sombre)

    # ---- usure : taches brun-gris, accrocs (la peau apparait), effilochage ; jamais de rouge ----
    tissus = [k for k in nouv if CLASSE[k] in ('haut', 'bas') or (bras(*k) and k[1] < 29) or (corps(*k) and k[1] >= 20)]
    for _ in range(int(14 * v['usure'])):
        x, y = rng.choice(tissus)
        c0 = (64, 54, 44) if rng.random() < 0.6 else (88, 92, 70)
        for dx, dy in ((0, 0), (1, 0), (0, 1)):
            if (x + dx, y + dy) in nouv and rng.random() < 0.8 and CLASSE[(x + dx, y + dy)] != 'peau':
                nouv[(x + dx, y + dy)] = melange(nouv[(x + dx, y + dy)], c0, rng.uniform(0.35, 0.6))
    if v.get('peinture'):  # vieilles taches de peinture, couleurs passees
        for _ in range(16):
            x, y = rng.choice(tissus)
            if CLASSE[(x, y)] != 'peau':
                nouv[(x, y)] = melange(rng.choice([(150, 160, 170), (180, 170, 120), (120, 150, 130), (170, 150, 150)]), passe, 0.3)
    for _ in range(int(6 * v['usure'])):
        x, y = rng.choice(tissus)
        if CLASSE[(x, y)] != 'peau' and not (12 <= x < 20 and y < 20):
            nouv[(x, y)] = peau_sombre

    # ---- plaques d'infection sur la peau : vert-gris sombre, jamais rouge ----
    peaux = [k for k, c in CLASSE.items() if c == 'peau' and k in nouv and not (8 <= k[0] < 16 and 8 <= k[1] < 16 and 10 <= k[0] <= 13 and 10 <= k[1] <= 12)]
    for _ in range(9):
        x, y = rng.choice(peaux)
        for dx, dy in ((0, 0), (1, 0), (0, 1), (1, 1)):
            k = (x + dx, y + dy)
            if k in nouv and CLASSE[k] == 'peau' and rng.random() < 0.75:
                nouv[k] = melange(nouv[k], (70, 84, 62), rng.uniform(0.35, 0.55))

    # ---- cheveux sur la tete (le modele de Fresh Animations n'a pas de calque chapeau) ----
    ch = CHEVEUX[v['chev']]
    coupe = v['coupe']
    def poil(x, y, densite=1.0):
        if rng.random() <= densite:
            nouv[(x, y)] = teinte(ch, 100, 100, rng, 0.14); ROLE[(x, y)] = 'cheveux'
    if coupe != 'chauve':
        dens_dessus = {'degarni': 0.9, 'ras': 0.75}.get(coupe, 1.0)
        for x in range(8, 16):
            for y in range(0, 8):
                # degarni : couronne de cheveux a l'arriere et sur les cotes, crane nu au milieu (plus de damier)
                if coupe == 'degarni' and not (y <= 2 or x in (8, 15) or (y == 3 and x in (9, 14))): continue
                poil(x, y, dens_dessus)
        rangs = {'ras': (1, 1, 1), 'court': (1, 2, 2), 'raie': (1, 2, 3), 'degarni': (0, 2, 3), 'crepu': (2, 2, 3),
                 'longs': (2, 6, 8), 'tresses': (1, 5, 8), 'chignon': (1, 3, 4), 'queue': (1, 3, 6), 'bonnet': (2, 2, 3)}[coupe]
        avant, cote, arriere = rangs
        for x in range(8, 16):
            for y in range(8, 8 + avant): poil(x, y, 0.9 if y == 8 else 0.55)
        if coupe == 'raie':
            for y in range(8, 10): nouv[(13, y)] = p_peau(13, y)
        for x in list(range(0, 8)) + list(range(16, 24)):
            haut_c = cote + (1 if (x in (0, 1, 22, 23)) else 0)  # plus long vers l'arriere
            for y in range(8, 8 + haut_c): poil(x, y, 0.95 if coupe not in ('ras',) else 0.7)
        for x in range(24, 32):
            for y in range(8, 8 + arriere):
                d = 0.95
                if coupe == 'tresses' and x % 2 == 1 and y > 9: d = 0.0
                if coupe == 'queue' and not (27 <= x <= 28) and y > 11: d = 0.0
                poil(x, y, d)
        if coupe == 'chignon':
            for x in range(26, 30):
                for y in range(9, 12): nouv[(x, y)] = teinte(ch, 80, 100, rng, 0.1); ROLE[(x, y)] = 'cheveux'
        if coupe == 'crepu':
            for (x, y) in list(nouv):
                if tete(x, y) and nouv[(x, y)] and rng.random() < 0.25 and lum(nouv[(x, y)] + (255,)) < lum(ch + (255,)) + 30 and y < 11:
                    nouv[(x, y)] = tuple(int(c * 0.8) for c in nouv[(x, y)])
        if coupe == 'bonnet':
            b = melange(v['bonnet'], passe, 0.3)
            for x in range(8, 16):
                for y in range(0, 8): nouv[(x, y)] = teinte(b, 100, 100, rng, 0.08); ROLE[(x, y)] = 'bonnet'
            for x in range(0, 32):
                for y in range(8, 10): nouv[(x, y)] = teinte(b, 90 if y == 9 else 100, 100, rng, 0.08); ROLE[(x, y)] = 'bonnet'

    for k, c in nouv.items():
        px[k] = c + (255,)
    return im

# ---------- visages : face avant de la tete = x 8-15, y 8-15 ----------
# Gabarit FA : orbites en y12 (x 9-10 et 13-14, le calque des yeux s'y pose), arete du nez x 11-12 en y11-12,
# narines y13, bouche y14 (x 10-13), menton y15. Le calque des yeux (x12-19, y16-19) n'est jamais touche :
# la couleur des yeux reste celle de Fresh Animations. Ni sang, ni plaie ouverte, ni symbole.
DENTS = (176, 168, 140)

def visage(v, nouv, rng, ch):
    f = v.get('visage')
    if not f: return
    sourcils, nez, bouche, orbites, barbe, marque = f
    def ok(x, y): return (x, y) in nouv
    def ton(x, y, k):  # assombrit (k<1) ou eclaircit (k>1) le pixel de peau actuel
        if ok(x, y): nouv[(x, y)] = tuple(max(0, min(255, int(c * k))) for c in nouv[(x, y)])
    def met(x, y, c):
        if ok(x, y): nouv[(x, y)] = c
    poil = lambda: teinte(ch, 100, 100, rng, 0.12)
    poil_sombre = lambda: teinte(ch, 82, 100, rng, 0.12)
    # orbites (sous le calque des yeux : seulement la teinte autour)
    for x in (9, 10, 13, 14):
        ton(x, 12, {'creuses': 0.62, 'cernes': 0.72, 'gonflees': 0.92}.get(orbites, 0.85))
    if orbites == 'cernes':
        for x in (9, 10, 13, 14): met(x, 13, melange(nouv[(x, 13)], (70, 62, 76), 0.4))
    if orbites == 'creuses':  # pommettes saillantes, joues creusees
        for x in (9, 14): ton(x, 11, 1.12)
        for x in (8, 9, 14, 15): ton(x, 13, 0.8)
    if orbites == 'gonflees':
        for x in (9, 10, 13, 14): ton(x, 11, 1.1)
    # sourcils (y11, au-dessus des orbites)
    if sourcils == 'epais':
        for x in (9, 10, 13, 14): met(x, 11, poil_sombre())
    elif sourcils == 'fronces':  # interieur plus bas : air dur
        met(9, 10, poil()); met(10, 11, poil_sombre()); met(14, 10, poil()); met(13, 11, poil_sombre())
    elif sourcils == 'tristes':  # interieur plus haut : air perdu
        met(9, 11, poil()); met(10, 10, poil_sombre()); met(14, 11, poil()); met(13, 10, poil_sombre())
    elif sourcils == 'fins':
        for x in (9, 10, 13, 14): met(x, 11, melange(nouv[(x, 11)], ch, 0.5))
    elif sourcils == 'releves':
        for x in (9, 10, 13, 14): met(x, 10, melange(nouv[(x, 10)], ch, 0.7))
    elif sourcils == 'un_seul':  # l'autre efface par une vieille cicatrice
        met(9, 11, poil_sombre()); met(10, 11, poil_sombre())
    # nez
    if nez == 'large':
        ton(11, 12, 1.08); ton(12, 12, 1.08); ton(10, 13, 0.75); ton(13, 13, 0.75); ton(11, 13, 0.7); ton(12, 13, 0.7)
    elif nez == 'fin':
        ton(11, 12, 1.12); ton(12, 12, 0.95); ton(11, 13, 0.82); ton(12, 13, 0.9)
    elif nez == 'casse':  # devie vers la gauche
        ton(11, 11, 1.12); ton(12, 12, 1.12); ton(11, 12, 0.9); ton(12, 13, 0.7)
    elif nez == 'long':
        ton(11, 11, 1.1); ton(12, 11, 1.1); ton(11, 12, 1.12); ton(12, 12, 1.12); ton(11, 13, 0.68); ton(12, 13, 0.68)
    elif nez == 'retrousse':
        ton(11, 12, 1.05); ton(12, 12, 1.05); ton(11, 13, 0.6); ton(12, 13, 0.6)
    # bouche
    sombre = lambda x, y, k=0.45: ton(x, y, k)
    if bouche == 'fermee':
        for x in range(10, 14): sombre(x, 14, 0.7)
    elif bouche == 'pincee':
        for x in (11, 12): sombre(x, 14, 0.6)
        ton(10, 14, 1.05); ton(13, 14, 1.05)
    elif bouche == 'beante':
        for x in range(10, 14): met(x, 14, melange(DENTS, nouv[(x, 14)], 0.35) if x in (11, 12) else tuple(int(c * 0.35) for c in nouv[(x, 14)]))
        for x in range(10, 14): sombre(x, 15, 0.32)
    elif bouche == 'dents':
        for x in range(10, 14): met(x, 14, DENTS if x % 2 == 0 else melange(DENTS, (40, 34, 30), 0.55))
        sombre(9, 14, 0.6); sombre(14, 14, 0.6)
    elif bouche == 'travers':
        for x in range(11, 15): sombre(x, 14, 0.5)
        sombre(14, 15, 0.55); ton(10, 14, 1.05)
    elif bouche == 'entrouverte':
        for x in range(10, 14): sombre(x, 14, 0.5)
        sombre(11, 15, 0.5); sombre(12, 15, 0.5)
    elif bouche == 'edentee':
        for x in range(10, 14): met(x, 14, DENTS if x == 13 else tuple(int(c * 0.35) for c in nouv[(x, 14)]))
    # barbe et moustache (face + bord avant des cotes de la tete)
    cotes = [(x, y) for y in range(13, 16) for x in (5, 6, 7, 16, 17, 18)]
    if barbe in ('pleine', 'courte', 'grise'):
        d = {'pleine': 0.92, 'courte': 0.55, 'grise': 0.85}[barbe]
        c0 = (150, 148, 142) if barbe == 'grise' else None
        zone = [(x, y) for y in range(13, 16) for x in range(8, 16) if not (10 <= x <= 13 and y == 14)] + cotes
        if barbe == 'pleine': zone += [(x, 12) for x in (8, 15)] + [(x, y) for y in (11, 12) for x in (6, 7, 16, 17)]
        for (x, y) in zone:
            if rng.random() < d:
                met(x, y, teinte(c0, 100, 100, rng, 0.1) if c0 else (poil_sombre() if barbe == 'pleine' else melange(nouv.get((x, y), ch), ch, 0.55)))
    if barbe in ('moustache', 'pleine'):
        for x in range(10, 14): met(x, 13, poil_sombre())
    if barbe == 'bouc':
        for x in (11, 12): met(x, 15, poil_sombre())
        met(10, 15, poil()); met(13, 15, poil())
    if barbe == 'favoris':
        for y in range(10, 14):
            for x in (8, 15, 7, 16): met(x, y, poil())
    # marques (jamais de rouge vif : cicatrices pales, egratignures brun-gris)
    if marque == 'cicatrice_joue':
        for (x, y) in ((14, 11), (14, 12), (15, 13), (15, 14)): met(x, y, melange(nouv[(x, y)], (190, 170, 160), 0.45))
    elif marque == 'cicatrice_front':
        for (x, y) in ((9, 9), (10, 10), (11, 10), (12, 9)): met(x, y, melange(nouv[(x, y)], (190, 170, 160), 0.4))
    elif marque == 'cicatrice_levre':
        for (x, y) in ((12, 13), (12, 14), (12, 15)): met(x, y, melange(nouv[(x, y)], (185, 168, 158), 0.5))
    elif marque == 'rides':
        for x in range(9, 15, 2): ton(x, 9, 0.82)
        ton(9, 13, 0.85); ton(14, 13, 0.85); ton(10, 15, 0.88); ton(13, 15, 0.88)
    elif marque == 'egratignures':
        for (x, y) in ((8, 10), (9, 10), (13, 14), (14, 15)): met(x, y, melange(nouv[(x, y)], (78, 62, 50), 0.5))
    elif marque == 'bandeau':  # vieux bandage sale autour du front
        for x in range(0, 32):
            met(x, 9, teinte((176, 168, 150), 96, 100, rng, 0.06)); met(x, 10 if x % 7 == 0 else 9, teinte((158, 150, 134), 96, 100, rng, 0.06))
    elif marque == 'lunettes':  # monture cassee, un verre manquant
        fr = (118, 116, 108)  # monture metal terni : se distingue des orbites sombres
        for x in (8, 9, 10, 13, 14, 15): met(x, 11, fr)
        met(11, 11, tuple(int(c * 0.8) for c in fr)); met(12, 11, tuple(int(c * 0.8) for c in fr))
        met(8, 12, fr); met(15, 12, fr); met(7, 11, fr); met(16, 11, fr)
        met(9, 12, melange(nouv[(9, 12)], (150, 160, 158), 0.3))
    elif marque == 'tache':  # tache de naissance, plus claire
        for (x, y) in ((9, 13), (9, 14), (8, 14), (10, 13)): ton(x, y, 1.18)
    elif marque == 'boucle_oreille':
        met(7, 13, (160, 150, 120)); met(16, 13, (160, 150, 120))
    elif marque == 'casque':  # casque de chantier terni
        c = (190, 160, 50)
        for x in range(0, 32):
            for y in range(8, 10): met(x, y, teinte(c, 96 if y == 9 else 100, 100, rng, 0.06))
        for x in range(8, 16):
            for y in range(0, 8): met(x, y, teinte(c, 100, 100, rng, 0.06))
            met(x, 10, tuple(int(cc * 0.7) for cc in c))
    elif marque == 'casquette':
        c = v.get('c_casquette', (50, 60, 80))
        for x in range(0, 32): met(x, 8, teinte(c, 96, 100, rng, 0.06))
        for x in range(8, 16):
            for y in range(0, 8): met(x, y, teinte(c, 100, 100, rng, 0.06))
            met(x, 9, tuple(int(cc * 0.6) for cc in c))


# ================= double resolution (128 x 128) : traits, oreilles, meches, coutures =================
# Le modele de Fresh Animations declare textureSize 64x64 : ETF/EMF reportent les UV, une texture 128x128 tombe
# au meme endroit avec deux fois plus de pixels. Le calque des yeux (x24-39, y32-39 en HD) est recopie tel quel
# depuis le gabarit agrandi : la couleur et la place des yeux restent celles de Fresh Animations.
BASE2 = BASE.resize((W * 2, H * 2), Image.NEAREST)
JAMBE_BAS = ('jean', 'toile', 'cargo', 'short')

def hd(v, im, graine):
    rng = random.Random(graine * 7 + 3)
    role = v['_role']
    big = im.resize((W * 2, H * 2), Image.NEAREST)
    px = big.load()
    ch = CHEVEUX[v['chev']]

    def r_bas(X, Y):  # role du pixel basse resolution sous un pixel HD
        return role.get((X // 2, Y // 2))
    def get(X, Y): return px[X, Y][:3]
    def put(X, Y, c):
        if 0 <= X < W * 2 and 0 <= Y < H * 2 and px[X, Y][3]: px[X, Y] = tuple(max(0, min(255, int(k))) for k in c) + (255,)
    def ton(X, Y, k): put(X, Y, tuple(c * k for c in get(X, Y)))
    def mix(X, Y, c, t): put(X, Y, melange(get(X, Y), c, t))

    # ---- grain de peau, meches, trame des tissus ----
    haut, bas = v['haut'], v['bas']
    for Y in range(0, 64):
        for X in range(0, 128):
            if not px[X, Y][3]: continue
            r = r_bas(X, Y)
            if r == 'peau':
                ton(X, Y, 1 + rng.uniform(-0.05, 0.05))
            elif r == 'cheveux':
                k = 0.84 if (X + (Y // 3)) % 2 else 1.07
                ton(X, Y, k * (1 + rng.uniform(-0.05, 0.05)))
            elif r == 'bonnet':
                ton(X, Y, 0.92 if X % 2 else 1.04)  # maille
            elif r == 'tissu':
                jambe_ = jambe(X // 2, Y // 2)
                g = bas if jambe_ else haut
                if g in ('jean', 'toile', 'cargo', 'salopette', 'combinaison') and (X + Y) % 3 == 0: ton(X, Y, 0.92)  # serge
                elif g in ('manches', 'sweat') and X % 2: ton(X, Y, 0.94)  # cotes du tricot
                else: ton(X, Y, 1 + rng.uniform(-0.03, 0.03))
    # ourlets : un pixel plus sombre la ou le tissu touche la peau
    for Y in range(0, 64):
        for X in range(0, 128):
            if r_bas(X, Y) != 'tissu': continue
            for dX, dY in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                if r_bas(X + dX, Y + dY) == 'peau':
                    ton(X, Y, 0.8); break

    # ---- veines et salissures de l'infection (gris-vert, jamais rouge) ----
    peaux = [(X, Y) for Y in range(16, 64) for X in range(0, 128) if r_bas(X, Y) == 'peau' and not (16 <= X < 32 and 16 <= Y < 32)]
    for _ in range(5):
        if not peaux: break
        X, Y = rng.choice(peaux)
        for _ in range(rng.randint(3, 6)):
            if r_bas(X, Y) == 'peau': mix(X, Y, (58, 70, 58), 0.35)
            X += rng.choice((-1, 0, 1)); Y += 1

    # ---- details de vetements ----
    if haut == 'chemise' or haut == 'polo':
        for Y in (44, 48, 52, 56) if haut == 'chemise' else (42, 45):
            put(47, Y, melange(get(47, Y), (210, 206, 196), 0.6))  # boutons
    if haut in ('veste_ouverte',):
        for Y in (46, 52): put(43, Y, (60, 56, 50)); put(52, Y, (60, 56, 50))  # boutons de veste
    if haut == 'sweat':
        for X in range(44, 52): ton(X, 52, 0.85)  # poche ventrale
        for Y in range(52, 58): ton(44, Y, 0.85); ton(51, Y, 0.85)
        put(46, 42, (190, 186, 178)); put(49, 42, (190, 186, 178))  # cordons
    if bas == 'cargo':
        for X in range(1, 7): ton(X, 46, 0.8); ton(X, 47, 0.9)  # poche laterale a rabat
        for Y in range(46, 53): ton(1, Y, 0.85); ton(6, Y, 0.85)
    if bas == 'jean':
        for Y in range(41, 56): ton(14, Y, 0.88)  # couture exterieure
    if bas in JAMBE_BAS and haut in ('tshirt', 'polo', 'debardeur', 'chemise'):
        ceinture = (66, 48, 36)
        for X in range(32, 80):
            if r_bas(X, 62) == 'tissu': put(X, 62, ceinture); put(X, 63, tuple(c * 0.85 for c in ceinture))
        put(47, 62, (150, 146, 136)); put(48, 62, (150, 146, 136))  # boucle ternie
    if v['pieds'] == 'baskets':
        for X in (10, 13): put(X, 58, (200, 196, 188)); put(X, 60, (200, 196, 188))  # lacets
        for X in range(8, 16): ton(X, 63, 0.9)
    if v['pieds'] == 'bottes':
        for X in range(0, 32):
            if r_bas(X, 57) == 'tissu' or jambe(X // 2, 28): ton(X, 57, 0.75)  # tige de la botte
    if v['pieds'] == 'chaussures':
        for X in range(9, 15): put(X, 59, melange(get(X, 59), (20, 18, 16), 0.5))  # lacets sombres

    # ---- visage : face avant de la tete en HD = x 16-31, y 16-31 (coordonnees locales 0-15) ----
    def L(x, y): return 16 + x, 16 + y
    def lton(x, y, k): ton(*L(x, y), k)
    def lput(x, y, c): put(*L(x, y), c)
    def lmix(x, y, c, t): mix(*L(x, y), c, t)
    def peau_l(x, y): return r_bas(*L(x, y)) == 'peau'
    poil = lambda k=1.0: teinte(ch, 100 * k, 100, rng, 0.12)
    f = v.get('visage') or ('normal',) * 6
    sombre_teint = lum(TEINTS[v['teint']] + (255,)) < 110
    if sombre_teint:  # sur peau foncee, les reliefs se lisent par la lumiere : arete du nez, pommettes, front
        for x in range(6, 10):
            for y in range(1, 4): lton(x, y, 1.12)
        for x in (2, 3, 12, 13): lton(x, 11, 1.15)
    sourcils, nez, bouche, orbites, barbe, marque = f
    # orbites (x2-5 et x10-13, y8-9) : le calque des yeux s'y pose ; paupieres au-dessus et au-dessous
    k_orb = {'creuses': 0.6, 'cernes': 0.72, 'gonflees': 0.94}.get(orbites, 0.84)
    for x in list(range(2, 6)) + list(range(10, 14)):
        for y in (8, 9): lton(x, y, k_orb)
        lton(x, 7, 0.9)  # pli de la paupiere
        lton(x, 10, 0.92 if orbites != 'cernes' else 0.8)
        if orbites == 'cernes': lmix(x, 10, (72, 64, 80), 0.3); lmix(x, 11, (72, 64, 80), 0.15)
        if orbites == 'gonflees': lton(x, 10, 1.1)
    if orbites == 'creuses':
        for y in (11, 12, 13): lton(1, y, 0.8); lton(14, y, 0.8); lton(2, y, 0.88); lton(13, y, 0.88)
        lton(2, 10, 1.1); lton(13, 10, 1.1)  # pommettes
    # nez : arete eclairee, ailes, narines
    nc = {'casse': (7, 6), 'fin': (7, 7)}.get(nez, (7, 7))
    for y in range(5, 10):
        xb = nc[1] if (nez == 'casse' and y >= 8) else 7
        lton(xb, y, 1.2 if sombre_teint else 1.08); lton(xb + 1, y, 1.1 if sombre_teint else 1.04)
    bout = {'long': 11, 'retrousse': 9}.get(nez, 10)
    lton(7, bout, 1.12); lton(8, bout, 1.1)
    nar = {'large': (5, 10), 'fin': (7, 8)}.get(nez, (6, 9))
    kn = {'retrousse': 0.45, 'fin': 0.75}.get(nez, 0.58)
    for x in nar: lton(x, bout + 1 if bout < 11 else 11, kn)
    if nez == 'large':
        lton(6, bout, 0.9); lton(9, bout, 0.9)
    lton(5, 9, 0.93); lton(10, 9, 0.93)  # ombre des ailes
    # bouche (y12-13, x4-11) et levres desaturees
    levre = (150, 118, 116)
    def dents(x, y): lput(x, y, melange(DENTS, (60, 52, 44), rng.uniform(0, 0.3)))
    if bouche in ('fermee', 'normal'):
        for x in range(5, 11): lton(x, 12, 0.62)
        lton(4, 12, 0.78); lton(11, 12, 0.78)
        for x in range(6, 10): lmix(x, 13, levre, 0.18); lton(x, 13, 1.04)
    elif bouche == 'pincee':
        for x in range(6, 10): lton(x, 12, 0.55)
        lton(5, 12, 0.85); lton(10, 12, 0.85)
    elif bouche == 'entrouverte':
        for x in range(5, 11): lton(x, 12, 0.55)
        for x in range(6, 10): lton(x, 13, 0.35)
        for x in range(6, 10): lmix(x, 14, levre, 0.2)
    elif bouche == 'beante':
        for x in range(5, 11):
            for y in (12, 13, 14): lton(x, y, 0.3)
        for x in range(6, 10): dents(x, 12)
        dents(7, 14); dents(8, 14)
    elif bouche == 'dents':
        for x in range(5, 11): dents(x, 12)
        lput(*((7, 12)), (46, 40, 36))  # dent manquante
        for x in range(5, 11): lton(x, 13, 0.45)
        lton(4, 12, 0.6); lton(11, 12, 0.6)
    elif bouche == 'travers':
        for x in range(6, 12): lton(x, 12, 0.5)
        lton(11, 13, 0.55); lton(12, 13, 0.6); lton(5, 11, 0.85)
    elif bouche == 'edentee':
        for x in range(5, 11):
            for y in (12, 13): lton(x, y, 0.32)
        dents(9, 12)
    for x in range(5, 11): lton(x, 15, 0.94)  # ombre sous le menton
    # sourcils (y5-7)
    def sc(x, y, k=0.82):
        if peau_l(x, y): lput(x, y, poil(k))
    if sourcils == 'epais':
        for x in list(range(1, 6)) + list(range(10, 15)): sc(x, 6); sc(x, 7 if x in (2, 3, 4, 11, 12, 13) else 6)
    elif sourcils == 'fins':
        for x in list(range(2, 6)) + list(range(10, 14)): lmix(x, 6, ch, 0.55)
    elif sourcils == 'fronces':
        for x, y in ((1, 5), (2, 5), (3, 6), (4, 6), (5, 7), (14, 5), (13, 5), (12, 6), (11, 6), (10, 7)): sc(x, y)
    elif sourcils == 'tristes':
        for x, y in ((1, 7), (2, 7), (3, 6), (4, 6), (5, 5), (14, 7), (13, 7), (12, 6), (11, 6), (10, 5)): sc(x, y)
    elif sourcils == 'releves':
        for x in list(range(2, 6)) + list(range(10, 14)): sc(x, 5, 0.9)
        sc(1, 6, 0.9); sc(14, 6, 0.9)
    elif sourcils == 'un_seul':
        for x in range(1, 6): sc(x, 6); sc(x, 7) if x in (2, 3, 4) else None
        for y in (4, 5, 6, 7): lmix(12, y, (196, 178, 166), 0.4)  # vieille cicatrice qui a coupe le sourcil
    # barbes (seulement sur la peau)
    if barbe in ('pleine', 'courte', 'grise'):
        dens = {'pleine': 0.95, 'courte': 0.5, 'grise': 0.9}[barbe]
        cb = (152, 150, 144) if barbe == 'grise' else ch
        zone = [(x, y) for y in range(10, 16) for x in range(0, 16) if not (5 <= x <= 10 and 12 <= y <= 13) and not (5 <= x <= 10 and y <= 11 and barbe != 'pleine')]
        for x, y in zone:
            if peau_l(x, y) and rng.random() < dens:
                lput(x, y, teinte(cb, (100 if x % 2 else 90) * rng.uniform(0.9, 1.05), 100, rng, 0.06) if barbe != 'courte' else melange(get(*L(x, y)), cb, 0.55))
        # sur les cotes de la tete, bord avant (cote droit x 12-15, cote gauche x 32-35 en HD)
        for Y in range(26, 32):
            for X in list(range(11, 16)) + list(range(32, 37)):
                if r_bas(X, Y) == 'peau' and rng.random() < dens * (0.9 if barbe != 'courte' else 0.6):
                    put(X, Y, teinte(cb, 92, 100, rng, 0.1) if barbe != 'courte' else melange(get(X, Y), cb, 0.5))
    if barbe in ('moustache', 'pleine'):
        for x in range(4, 12):
            if peau_l(x, 11): lput(x, 11, poil(0.85))
        lput(4, 12, poil(0.85)); lput(11, 12, poil(0.85))
    if barbe == 'bouc':
        for x in range(6, 10):
            for y in (14, 15): lput(x, y, poil(0.85))
        lput(5, 14, poil()); lput(10, 14, poil())
    if barbe == 'favoris':
        for Y in range(20, 30):
            for X in (14, 15, 32, 33):
                if r_bas(X, Y) in ('peau', 'cheveux'): put(X, Y, teinte(ch, 90, 100, rng, 0.1))
    # oreilles sur les cotes de la tete, si la coupe les laisse voir
    if v['coupe'] in ('ras', 'court', 'raie', 'degarni', 'chignon', 'queue', 'bonnet', 'crepu') and marque != 'casque':
        for (x0, sens) in ((6, 1), (37, -1)):
            for Y in range(22, 29):
                for X in range(x0, x0 + 4):
                    if r_bas(X, Y) != 'peau': continue
                    bord = Y in (22, 28) or X in (x0, x0 + 3)
                    ton(X, Y, 0.8 if bord else 1.06)
            for Y in range(24, 27): ton(x0 + (1 if sens == 1 else 2), Y, 0.62)  # creux de l'oreille
        if marque == 'boucle_oreille':
            put(8, 29, (176, 164, 126)); put(39, 29, (176, 164, 126))
    # marques (cicatrices pales, egratignures brun-gris, rides) : ni sang ni plaie ouverte
    pale = (196, 178, 166)
    if marque == 'cicatrice_joue':
        for x, y in ((12, 9), (12, 10), (13, 11), (13, 12), (14, 13)): lmix(x, y, pale, 0.45)
    elif marque == 'cicatrice_front':
        for x, y in ((3, 1), (4, 2), (5, 2), (6, 3), (7, 3), (8, 4)): lmix(x, y, pale, 0.4)
    elif marque == 'cicatrice_levre':
        for y in range(11, 15): lmix(9, y, pale, 0.45)
    elif marque == 'rides':
        for y in (2, 4):
            for x in range(3, 13):
                if (x + y) % 3: lton(x, y, 0.88)
        for x, y in ((0, 8), (1, 9), (15, 8), (14, 9), (4, 11), (11, 11), (3, 12), (12, 12)): lton(x, y, 0.84)
    elif marque == 'egratignures':
        for x, y in ((1, 3), (2, 4), (3, 5), (12, 13), (13, 14), (13, 2), (14, 3)): lmix(x, y, (82, 66, 52), 0.5)
    elif marque == 'tache':
        for x, y in ((1, 11), (2, 11), (1, 12), (2, 12), (3, 13), (2, 13)): lton(x, y, 1.15)
    elif marque == 'lunettes':  # monture metal ternie, verre gauche fendu
        fr = (120, 118, 110)
        for x in list(range(1, 7)) + list(range(9, 15)):
            lput(x, 7, fr); lput(x, 10, fr)
        for y in (8, 9): lput(1, y, fr); lput(6, y, fr); lput(9, y, fr); lput(14, y, fr)
        lput(7, 8, fr); lput(8, 8, fr)
        for X in range(12, 16): put(X, 23, fr)   # branches sur les cotes
        for X in range(32, 36): put(X, 23, fr)
        lmix(3, 8, (170, 180, 178), 0.25); lmix(4, 9, (170, 180, 178), 0.25)
    elif marque in ('casque', 'casquette', 'bandeau'):
        c = {'casque': (190, 160, 50), 'casquette': v.get('c_casquette', (50, 60, 80)), 'bandeau': (176, 168, 150)}[marque]
        c = melange(c, (118, 112, 100), 0.25 * v['usure'])
        rangs = {'casque': range(16, 20), 'casquette': range(16, 18), 'bandeau': range(18, 21)}[marque]
        for X in range(0, 64):
            for Y in rangs: put(X, Y, teinte(c, 100 - (Y - 16) * 3, 100, rng, 0.05))
        if marque != 'bandeau':
            for X in range(16, 32):
                for Y in range(0, 16): put(X, Y, teinte(c, 100, 100, rng, 0.05))
            for X in range(16, 32): put(X, rangs.stop, tuple(k * 0.6 for k in c)); put(X, rangs.stop + 1, tuple(k * 0.8 for k in get(X, rangs.stop + 1)))  # ombre de la visiere
        if marque == 'casque':
            for X in range(16, 32): put(X, 7, tuple(k * 0.85 for k in c))  # nervure
        if marque == 'bandeau':
            for X in range(0, 64, 5): put(X, 21, teinte(c, 88, 100, rng, 0.05))
            for X in (10, 30, 50): mix(X, 19, (120, 104, 84), 0.4)  # taches
    # ---- yeux : recopies tels quels depuis le gabarit Fresh Animations ----
    for Y in range(32, 40):
        for X in range(24, 40):
            px[X, Y] = BASE2.getpixel((X, Y))
    return big

# ---------- apercu a plat : face avant assemblee (tete, torse, bras, jambes) ----------
def face(im):
    k = im.size[0] // 64
    def c(a, b, cc, d): return im.crop((a * k, b * k, cc * k, d * k))
    s = Image.new('RGBA', (16 * k, 32 * k), (0, 0, 0, 0))
    s.paste(c(8, 8, 16, 16), (4 * k, 0))
    s.paste(c(20, 20, 28, 32), (4 * k, 8 * k))
    s.paste(c(44, 20, 48, 32), (0, 8 * k)); s.paste(c(44, 20, 48, 32).transpose(Image.FLIP_LEFT_RIGHT), (12 * k, 8 * k))
    s.paste(c(4, 20, 8, 32), (4 * k, 20 * k)); s.paste(c(4, 20, 8, 32).transpose(Image.FLIP_LEFT_RIGHT), (8 * k, 20 * k))
    return s

def main():
    sortie = os.path.join(ICI, 'sortie'); apercus = os.path.join(ICI, 'apercus')
    os.makedirs(sortie, exist_ok=True); os.makedirs(apercus, exist_ok=True)
    images = []
    for i, v in enumerate(V):
        im = hd(v, generer(v, 1000 + i), 1000 + i)
        images.append((v['n'], im))
    # planche : original + variantes, face avant x8 + texture brute
    cols = 7
    cw, chh = 16 * 8 + 16, 32 * 8 + 24
    tout = [('original_FA', BASE2)] + images
    rows = (len(tout) + cols - 1) // cols
    pl = Image.new('RGB', (cols * cw, rows * chh), (40, 40, 44))
    d = ImageDraw.Draw(pl)
    for i, (n, im) in enumerate(tout):
        f = face(im).resize((128, 256), Image.NEAREST)
        x0, y0 = (i % cols) * cw + 8, (i // cols) * chh + 4
        pl.paste(f, (x0, y0), f)
        d.text((x0, y0 + 258), f'{i + 1} {n}'[:22], fill=(230, 230, 230))
    pl.save(os.path.join(apercus, 'planche-faces.png'))
    brut = Image.new('RGBA', (cols * 64 * 3, rows * 34 * 3), (40, 40, 44, 255))
    for i, (n, im) in enumerate(tout):
        t = im.crop((0, 0, im.size[0], im.size[1] // 2)).resize((192, 96), Image.NEAREST)
        brut.paste(t, ((i % cols) * 192, (i // cols) * 102), t)
    brut.save(os.path.join(apercus, 'planche-textures.png'))
    # pack de ressources ETF
    z = os.path.join(sortie, 'Atheria-Infectes-variantes.zip')
    with zipfile.ZipFile(z, 'w', zipfile.ZIP_DEFLATED) as zf:
        zf.writestr('pack.mcmeta', json.dumps({'pack': {'pack_format': 34, 'supported_formats': [15, 99],
            'description': 'Atheria : variantes des Dakouane (textures aleatoires ETF, gabarit Fresh Animations)'}}, ensure_ascii=False, indent=1))
        n = len(images) + 1
        zf.writestr('assets/minecraft/optifine/random/entity/zombie/zombie.properties',
                    '# Atheria : %d apparences de Dakouane, tirees au hasard par ETF selon l\'UUID (identiques pour tous les joueurs).\n# Le zombie vert d\'origine (1) est exclu : il jure avec le lore.\ntextures.1=2-%d\n' % (n - 1, n))
        for i, (nom, im) in enumerate(images):
            tmp = os.path.join(sortie, f'zombie{i + 2}.png'); im.save(tmp)
            zf.write(tmp, f'assets/minecraft/optifine/random/entity/zombie/zombie{i + 2}.png'); os.remove(tmp)
        zf.writestr('LISEZ-MOI.txt', 'Atheria Zombie Edition : %d variantes de zombie (Dakouane) pour Entity Texture Features.\n'
                    'Dessinees en 128x128 sur le zombie.png de Fresh Animations (memes yeux, meme ombrage) : visages, oreilles, meches, coutures.\n'
                    'A placer AU-DESSUS de Fresh Animations. Genere par outils/atheria-variantes-infectes/generer.py.\n' % len(images)
                    + '\n'.join(f'zombie{i + 2}.png : {n}' for i, (n, _) in enumerate(images)) + '\n')
    print('ok', len(images), 'variantes ->', z)

if __name__ == '__main__':
    main()
