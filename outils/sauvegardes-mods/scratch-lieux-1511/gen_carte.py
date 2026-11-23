SP0 = r"C:/Users/El-Afdal/AppData/Local/Temp/claude/d75113947d74750a/3b6158cc-eefc-4df2-8769-4b2d767c856c/scratchpad/"
src = open(SP0 + "gen_pages.py", encoding="utf-8").read()
exec(src.split('\npage(')[0])
import os
os.makedirs(SP + "carte-page", exist_ok=True)
P = SP + "pose/captures/lieux_%s.png"

def page_carte(fn, title, h1, span, lede, qc, shots, pref):
    rows = "".join(f'<tr><td>{html.escape(a)}</td><td><span class="pill {s.replace(" ","-")}">{s}</span></td><td>{html.escape(c)}</td></tr>' for a, s, c in qc)
    figs = ""
    for i, (code, cap) in enumerate(shots, 1):
        im = Image.open(P % code).convert("RGB"); im.thumbnail((1280, 1280))
        b = io.BytesIO(); im.save(b, "JPEG", quality=80); im.save(DOC + f"{pref}-{i:02d}-{code}.jpg", "JPEG", quality=85)
        figs += f'<figure><img src="data:image/jpeg;base64,{base64.b64encode(b.getvalue()).decode()}" alt="{code}"><figcaption><code>{code}</code> {html.escape(cap)}</figcaption></figure>'
    h = re.sub("<title>.*?</title>", f"<title>{title}</title>", head)
    out = h + f'<main>\n<header><h1>{h1} <span>{span}</span></h1>\n<p class="lede">{html.escape(lede)}</p></header>\n<section><h2>Contrôle qualité</h2><div class="tw"><table>{rows}</table></div></section>\n<section><h2>Captures en jeu</h2>{figs}</section>\n</main></body></html>'
    open(SP + fn, "w", encoding="utf-8").write(out)

page_carte("carte-page/lieux-sur-la-carte.html", "Lieux sur la carte", "Les lieux du trailer", "sur la vraie carte",
 "Premier essai sur une copie neuve du serveur de test, avec le relief de Carte (réglages v3j). Les cinq modèles validés se posent tout seuls au chargement des chunks, en 3 minutes. Rien n'est encore dans le pack ni sur le serveur.",
 [("Pose des 5 modèles (rue, Majicavo, port, station, bouche)", "OK", "Posés en 3 min, 0 erreur, 0 blocage du serveur"),
  ("Ordre port puis station", "OK", "La station se creuse sous le parc à conteneurs, la bouche s'ouvre sur le bitume"),
  ("Raccord de la RN1 avec Majicavo", "OK", "La route de Carte continue au nord et au sud dans l'axe"),
  ("Bassin du port", "OK", "La mer de Carte arrive au quai, le cargo flotte, eau à Y 62"),
  ("Bords de Majicavo", "KO", "Marche d'un bloc et sol nu autour du lot : à adoucir avec Carte"),
  ("Rue du jour 1", "KO", "Posée seule au milieu d'un grand pré plat : il faut des voisins (ville) autour, à voir avec Carte"),
  ("Lave près de la rue", "KO", "Petit lac de lave au bord du lot : corrigé par Carte dans sa version suivante, à revérifier"),
  ("Intérieur de la station", "non testable", "Pas de vue souterraine dans ce passage, à faire au prochain"),
  ("Pack et serveur", "non testable", "Rien copié : attend ton accord")],
 [("maj_nord_sol", "Majicavo depuis l'entrée nord, sur la RN1."),
  ("maj_centre_haut", "Majicavo vu d'en haut, au milieu du village."),
  ("maj_sud_haut", "Sortie sud : la route de Carte prend le relais."),
  ("port_quai_haut", "Le quai, les portiques et le cargo dans le bassin."),
  ("port_nord_haut", "Le port depuis le nord, avec la jungle autour."),
  ("bouche_haut", "Le parc à conteneurs au-dessus de la station."),
  ("rue_nord_haut", "La rue du jour 1, encore seule dans son pré."),
  ("rue_est_haut", "La rue vue de l'est.")], "carte-v1")
print("ok")
