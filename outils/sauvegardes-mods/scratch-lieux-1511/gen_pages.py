import base64, io, html, re
from PIL import Image
SP=r"C:/Users/El-Afdal/AppData/Local/Temp/claude/d75113947d74750a/3b6158cc-eefc-4df2-8769-4b2d767c856c/scratchpad/"
DOC=r"C:/Users/El-Afdal/Desktop/Atheria Zombie Edition/docs/vitrine-batiments/"
tpl=open(SP+"rue-page/rue-mamoudzou.html",encoding="utf-8").read()
head=tpl[:tpl.index("<main>")]
def page(fn,title,h1,span,lede,qc,shots,serie,pref):
    rows="".join(f'<tr><td>{html.escape(a)}</td><td><span class="pill {s.replace(" ","-")}">{s}</span></td><td>{html.escape(c)}</td></tr>' for a,s,c in qc)
    figs=""
    for i,(code,vit,cap) in enumerate(shots,1):
        im=Image.open(SP+f"recontrole/{serie}/vit-{vit:02d}.png").convert("RGB"); im.thumbnail((1280,1280))
        b=io.BytesIO(); im.save(b,"JPEG",quality=80); im.save(DOC+f"{pref}-v1-{i:02d}-{code}.jpg","JPEG",quality=85)
        figs+=f'<figure><img src="data:image/jpeg;base64,{base64.b64encode(b.getvalue()).decode()}" alt="{code}"><figcaption><code>{code}</code> {html.escape(cap)}</figcaption></figure>'
    h=re.sub("<title>.*?</title>",f"<title>{title}</title>",head)
    out=h+f'<main>\n<header><h1>{h1} <span>{span}</span></h1>\n<p class="lede">{html.escape(lede)}</p></header>\n<section><h2>Contrôle qualité</h2><div class="tw"><table>{rows}</table></div></section>\n<section><h2>Captures in-game</h2><div class="g">{figs}</div></section>\n</main>\n'
    open(SP+fn,"w",encoding="utf-8").write(out)
page("station-page/station-longoni.html","Station des Enfants","La station inondée","sous Longoni",
 "Lieu 6 du trailer : la bouche des Passeurs et l'ancienne station de tram où vivent les Enfants. Banc final du 14/11 à 18:15.",
 [("Blocs invalides","OK","0 au banc final"),("Blocs qui tombent, trous non voulus","OK","0"),
  ("Bouche de 3 x 3 ou plus","OK","4 de large sur 3 de haut, tête de tunnel en béton et murs de soutènement"),
  ("Station au moins 24 x 12 x 5","OK","36 x 20 x 5 (hall x20..55, z19..38)"),
  ("Eau au sol, quais, rails","OK","voie inondée sur 6 de large, rails noyés, deux quais"),
  ("Rame à demi engloutie","OK","rame de 20 blocs, couchée à moitié dans l'eau"),
  ("Pénombre","OK","un seul puits de jour, lanternes rares sur le camp"),
  ("Visible du ciel (survol 85-120 m)","non testable","la capture d'en haut est voilée par le brouillard du banc ; à vérifier avec les shaders du trailer"),
  ("Emplacement réel sous Longoni","non testable","dépend du placement des lots avec Carte")],
 [("s_bouche_ciel",3,"La bouche des Passeurs vue d'en haut, au milieu des herbes folles."),
  ("s_bouche",4,"La bouche à hauteur d'homme : tranchée, garde-corps, tête de tunnel en béton."),
  ("s_escalier",5,"L'escalier qui descend vers la station."),
  ("s_quai",6,"Le hall depuis le quai nord : voûte de pierre, voie sous l'eau."),
  ("s_rame",7,"La rame à demi engloutie."),
  ("s_eau",8,"Au ras de l'eau, dans l'axe de la voie."),
  ("s_camp",9,"Le camp des Enfants sur le quai sud : matelas, caisses, lanternes."),
  ("s_puits",10,"Le puits de jour, seule lumière naturelle.")],"station","station")
page("rn1-page/rn1-majicavo.html","RN1 et Majicavo","La RN1","à Majicavo",
 "Lieux 4 et 5 du trailer : la RN1 en ligne droite et la pièce noire des Dakouane, dans une maison abandonnée. Banc final du 14/11 à 18:21.",
 [("Blocs invalides","OK","0 au banc final"),("Trous signalés","OK","15, ce sont les carreaux cassés voulus (35 % des vitres retirées)"),
  ("Ligne droite de 120 m ou plus","OK","128 m"),("Chaussée de 12 à 15","OK","14 m, lignes de rive et axe en pointillés"),
  ("Bas-côtés libres sur 10","OK","10 m de chaque côté, aucun obstacle"),("Dénivelé sous 3","OK","0, route plate"),
  ("Pièce de 9 x 9 x 4 ou plus","OK","10 x 10 x 4"),("Baie de 1 à 2 blocs","OK","2 blocs de large, 3 de haut"),
  ("Aucune lumière dans la pièce","OK","aucune fenêtre au rez-de-chaussée, aucune lanterne"),
  ("Vue de l'intérieur vers la baie","KO","la caméra était dans le mur ; corrigée dans le script, la capture viendra au prochain banc"),
  ("Emplacement réel entre Longoni et Mamoudzou","non testable","dépend du placement des lots avec Carte")],
 [("n_rn1",3,"La RN1 à hauteur d'homme, 128 m en ligne droite."),
  ("n_rn1_haut",4,"La RN1 vue d'en haut : chaussée de 14 m et bas-côtés libres."),
  ("n_bas_cote",5,"Le bas-côté ouest, dégagé sur 10 m."),
  ("n_piece_dehors",6,"La maison de la pièce, depuis la route : baie noire de 2 blocs."),
  ("n_piece_seuil",8,"La pièce depuis le seuil : noire, matelas, armoire, gravats, toiles."),
  ("n_majicavo",9,"Majicavo abandonné : carreaux cassés, auvents arrachés."),
  ("n_dessus",10,"Vue d'ensemble du lot.")],"rn1","rn1")
