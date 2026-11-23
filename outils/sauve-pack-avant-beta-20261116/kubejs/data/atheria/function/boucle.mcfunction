# Atheria : synchronisation toutes les 2 secondes (généré)
execute as @a if score @s aura_paf matches 1.. run tag @s add rep_paf_1
execute as @a unless score @s aura_paf matches 1.. run tag @s remove rep_paf_1
execute as @a if score @s aura_paf matches 2.. run tag @s add rep_paf_2
execute as @a unless score @s aura_paf matches 2.. run tag @s remove rep_paf_2
execute as @a if score @s aura_paf matches 3.. run tag @s add rep_paf_3
execute as @a unless score @s aura_paf matches 3.. run tag @s remove rep_paf_3
execute as @a if score @s aura_passeurs matches 1.. run tag @s add rep_passeurs_1
execute as @a unless score @s aura_passeurs matches 1.. run tag @s remove rep_passeurs_1
execute as @a if score @s aura_passeurs matches 2.. run tag @s add rep_passeurs_2
execute as @a unless score @s aura_passeurs matches 2.. run tag @s remove rep_passeurs_2
execute as @a if score @s aura_passeurs matches 3.. run tag @s add rep_passeurs_3
execute as @a unless score @s aura_passeurs matches 3.. run tag @s remove rep_passeurs_3
execute as @a if score @s aura_goblini matches 1.. run tag @s add rep_goblini_1
execute as @a unless score @s aura_goblini matches 1.. run tag @s remove rep_goblini_1
execute as @a if score @s aura_goblini matches 2.. run tag @s add rep_goblini_2
execute as @a unless score @s aura_goblini matches 2.. run tag @s remove rep_goblini_2
execute as @a if score @s aura_goblini matches 3.. run tag @s add rep_goblini_3
execute as @a unless score @s aura_goblini matches 3.. run tag @s remove rep_goblini_3
execute as @a if score @s aura_coconi matches 1.. run tag @s add rep_coconi_1
execute as @a unless score @s aura_coconi matches 1.. run tag @s remove rep_coconi_1
execute as @a if score @s aura_coconi matches 2.. run tag @s add rep_coconi_2
execute as @a unless score @s aura_coconi matches 2.. run tag @s remove rep_coconi_2
execute as @a if score @s aura_coconi matches 3.. run tag @s add rep_coconi_3
execute as @a unless score @s aura_coconi matches 3.. run tag @s remove rep_coconi_3
execute as @a if score @s aura_enfants matches 1.. run tag @s add rep_enfants_1
execute as @a unless score @s aura_enfants matches 1.. run tag @s remove rep_enfants_1
execute as @a if score @s aura_enfants matches 2.. run tag @s add rep_enfants_2
execute as @a unless score @s aura_enfants matches 2.. run tag @s remove rep_enfants_2
execute as @a if score @s aura_enfants matches 3.. run tag @s add rep_enfants_3
execute as @a unless score @s aura_enfants matches 3.. run tag @s remove rep_enfants_3
execute as @a if score @s aura_sud matches 1.. run tag @s add rep_sud_1
execute as @a unless score @s aura_sud matches 1.. run tag @s remove rep_sud_1
execute as @a if score @s aura_sud matches 2.. run tag @s add rep_sud_2
execute as @a unless score @s aura_sud matches 2.. run tag @s remove rep_sud_2
execute as @a if score @s aura_sud matches 3.. run tag @s add rep_sud_3
execute as @a unless score @s aura_sud matches 3.. run tag @s remove rep_sud_3
execute if score #acte atheria matches 2.. run tag @a add acte_2
execute if score #acte atheria matches 3.. run tag @a add acte_3
execute if score #acte atheria matches 4.. run tag @a add acte_4
execute if score #acte atheria matches 5.. run tag @a add acte_5
execute if score #final atheria matches 1.. run tag @a[tag=camp_final_remede] add final_termine
execute if score #final atheria matches 1.. run tag @a[tag=camp_final_graine] add final_termine
execute if score #final atheria matches 1.. run tag @a[tag=camp_final_ordre] add final_termine
execute if score #final atheria matches 1.. run tag @a[tag=camp_final_mer] add final_termine
tag @a[tag=rep_goblini_2] add camp_ok_remede
tag @a[tag=rep_coconi_2] add camp_ok_graine
tag @a[tag=rep_enfants_1] add camp_ok_graine
tag @a[tag=rep_paf_2] add camp_ok_ordre
tag @a[tag=rep_passeurs_2] add kwassa_ok
execute as @a if items entity @s container.* atheria:montre_kamel run tag @s add kwassa_ok
tag @a[tag=traversee_sud] add traversee_ok
execute as @a[tag=titre_presque_perso,tag=!annonce_presque_perso] run tellraw @a ["", {"text": "★ ", "color": "gold"}, {"selector": "@s", "color": "yellow"}, {"text": " obtient le titre ", "color": "gray"}, {"text": "« Presque un personnage »", "color": "gold", "bold": true}]
tag @a[tag=titre_presque_perso,tag=!annonce_presque_perso] add annonce_presque_perso
execute as @a[tag=titre_dossier_complet,tag=!annonce_dossier_complet] run tellraw @a ["", {"text": "★ ", "color": "gold"}, {"selector": "@s", "color": "yellow"}, {"text": " obtient le titre ", "color": "gray"}, {"text": "« Dossier complet - créature mythique »", "color": "gold", "bold": true}]
tag @a[tag=titre_dossier_complet,tag=!annonce_dossier_complet] add annonce_dossier_complet
execute as @a[tag=titre_citoyen_modele,tag=!annonce_citoyen_modele] run tellraw @a ["", {"text": "★ ", "color": "gold"}, {"selector": "@s", "color": "yellow"}, {"text": " obtient le titre ", "color": "gray"}, {"text": "« Citoyen modèle »", "color": "gold", "bold": true}]
tag @a[tag=titre_citoyen_modele,tag=!annonce_citoyen_modele] add annonce_citoyen_modele
execute as @a[tag=titre_pas_les_codes,tag=!annonce_pas_les_codes] run tellraw @a ["", {"text": "★ ", "color": "gold"}, {"selector": "@s", "color": "yellow"}, {"text": " obtient le titre ", "color": "gray"}, {"text": "« Il n'a pas les codes »", "color": "gold", "bold": true}]
tag @a[tag=titre_pas_les_codes,tag=!annonce_pas_les_codes] add annonce_pas_les_codes
execute as @a[tag=titre_ballon_or,tag=!annonce_ballon_or] run tellraw @a ["", {"text": "★ ", "color": "gold"}, {"selector": "@s", "color": "yellow"}, {"text": " obtient le titre ", "color": "gray"}, {"text": "« Ballon d'Or »", "color": "gold", "bold": true}]
tag @a[tag=titre_ballon_or,tag=!annonce_ballon_or] add annonce_ballon_or
execute as @a[tag=titre_fossoyeur,tag=!annonce_fossoyeur] run tellraw @a ["", {"text": "★ ", "color": "gold"}, {"selector": "@s", "color": "yellow"}, {"text": " obtient le titre ", "color": "gray"}, {"text": "« Fossoyeur »", "color": "gold", "bold": true}]
tag @a[tag=titre_fossoyeur,tag=!annonce_fossoyeur] add annonce_fossoyeur
execute as @a[tag=titre_aura_1000,tag=!annonce_aura_1000] run tellraw @a ["", {"text": "★ ", "color": "gold"}, {"selector": "@s", "color": "yellow"}, {"text": " obtient le titre ", "color": "gray"}, {"text": "« Aura +1000 »", "color": "gold", "bold": true}]
tag @a[tag=titre_aura_1000,tag=!annonce_aura_1000] add annonce_aura_1000
execute as @a[tag=titre_main_character,tag=!annonce_main_character] run tellraw @a ["", {"text": "★ ", "color": "gold"}, {"selector": "@s", "color": "yellow"}, {"text": " obtient le titre ", "color": "gray"}, {"text": "« Main character »", "color": "gold", "bold": true}]
tag @a[tag=titre_main_character,tag=!annonce_main_character] add annonce_main_character
execute as @a[tag=titre_kaizen,tag=!annonce_kaizen] run tellraw @a ["", {"text": "★ ", "color": "gold"}, {"selector": "@s", "color": "yellow"}, {"text": " obtient le titre ", "color": "gray"}, {"text": "« Kaizen »", "color": "gold", "bold": true}]
tag @a[tag=titre_kaizen,tag=!annonce_kaizen] add annonce_kaizen
execute as @a[tag=titre_goblin,tag=!annonce_goblin] run tellraw @a ["", {"text": "★ ", "color": "gold"}, {"selector": "@s", "color": "yellow"}, {"text": " obtient le titre ", "color": "gray"}, {"text": "« Goblin »", "color": "gold", "bold": true}]
tag @a[tag=titre_goblin,tag=!annonce_goblin] add annonce_goblin
execute as @a[tag=titre_sigma_galeries,tag=!annonce_sigma_galeries] run tellraw @a ["", {"text": "★ ", "color": "gold"}, {"selector": "@s", "color": "yellow"}, {"text": " obtient le titre ", "color": "gray"}, {"text": "« Sigma des galeries »", "color": "gold", "bold": true}]
tag @a[tag=titre_sigma_galeries,tag=!annonce_sigma_galeries] add annonce_sigma_galeries
execute as @a[tag=titre_main_verte,tag=!annonce_main_verte] run tellraw @a ["", {"text": "★ ", "color": "gold"}, {"selector": "@s", "color": "yellow"}, {"text": " obtient le titre ", "color": "gray"}, {"text": "« Blouse rouge »", "color": "gold", "bold": true}]
tag @a[tag=titre_main_verte,tag=!annonce_main_verte] add annonce_main_verte
execute as @a[tag=titre_visage_gris,tag=!annonce_visage_gris] run tellraw @a ["", {"text": "★ ", "color": "gold"}, {"selector": "@s", "color": "yellow"}, {"text": " obtient le titre ", "color": "gray"}, {"text": "« Visage gris »", "color": "gold", "bold": true}]
tag @a[tag=titre_visage_gris,tag=!annonce_visage_gris] add annonce_visage_gris
execute as @a[tag=titre_officier,tag=!annonce_officier] run tellraw @a ["", {"text": "★ ", "color": "gold"}, {"selector": "@s", "color": "yellow"}, {"text": " obtient le titre ", "color": "gray"}, {"text": "« Officier »", "color": "gold", "bold": true}]
tag @a[tag=titre_officier,tag=!annonce_officier] add annonce_officier
execute as @a[tag=titre_porte_ouverte,tag=!annonce_porte_ouverte] run tellraw @a ["", {"text": "★ ", "color": "gold"}, {"selector": "@s", "color": "yellow"}, {"text": " obtient le titre ", "color": "gray"}, {"text": "« Porte ouverte »", "color": "gold", "bold": true}]
tag @a[tag=titre_porte_ouverte,tag=!annonce_porte_ouverte] add annonce_porte_ouverte
execute as @a[tag=titre_leon_marchand,tag=!annonce_leon_marchand] run tellraw @a ["", {"text": "★ ", "color": "gold"}, {"selector": "@s", "color": "yellow"}, {"text": " obtient le titre ", "color": "gray"}, {"text": "« Léon Marchand »", "color": "gold", "bold": true}]
tag @a[tag=titre_leon_marchand,tag=!annonce_leon_marchand] add annonce_leon_marchand
execute as @a[tag=titre_la_salto,tag=!annonce_la_salto] run tellraw @a ["", {"text": "★ ", "color": "gold"}, {"selector": "@s", "color": "yellow"}, {"text": " obtient le titre ", "color": "gray"}, {"text": "« Porteur de La Salto »", "color": "gold", "bold": true}]
tag @a[tag=titre_la_salto,tag=!annonce_la_salto] add annonce_la_salto
execute as @a[tag=titre_verite_sortie,tag=!annonce_verite_sortie] run tellraw @a ["", {"text": "★ ", "color": "gold"}, {"selector": "@s", "color": "yellow"}, {"text": " obtient le titre ", "color": "gray"}, {"text": "« La vérité est sortie »", "color": "gold", "bold": true}]
tag @a[tag=titre_verite_sortie,tag=!annonce_verite_sortie] add annonce_verite_sortie
execute as @a[tag=titre_survivant_s1,tag=!annonce_survivant_s1] run tellraw @a ["", {"text": "★ ", "color": "gold"}, {"selector": "@s", "color": "yellow"}, {"text": " obtient le titre ", "color": "gray"}, {"text": "« Survivant d'Atheria - saison 1 »", "color": "gold", "bold": true}]
tag @a[tag=titre_survivant_s1,tag=!annonce_survivant_s1] add annonce_survivant_s1
execute as @a[tag=titre_flopman,tag=!annonce_flopman] run tellraw @a ["", {"text": "★ ", "color": "gold"}, {"selector": "@s", "color": "yellow"}, {"text": " obtient le titre ", "color": "gray"}, {"text": "« FlopMan »", "color": "gold", "bold": true}]
tag @a[tag=titre_flopman,tag=!annonce_flopman] add annonce_flopman
execute as @a[tag=titre_aura_infinie,tag=!annonce_aura_infinie] run tellraw @a ["", {"text": "★ ", "color": "gold"}, {"selector": "@s", "color": "yellow"}, {"text": " obtient le titre ", "color": "gray"}, {"text": "« Aura infinie »", "color": "gold", "bold": true}]
tag @a[tag=titre_aura_infinie,tag=!annonce_aura_infinie] add annonce_aura_infinie
execute as @a[tag=titre_rodri,tag=!annonce_rodri] run tellraw @a ["", {"text": "★ ", "color": "gold"}, {"selector": "@s", "color": "yellow"}, {"text": " obtient le titre ", "color": "gray"}, {"text": "« Rodri »", "color": "gold", "bold": true}]
tag @a[tag=titre_rodri,tag=!annonce_rodri] add annonce_rodri
execute as @a[tag=titre_j_ai_essaye,tag=!annonce_j_ai_essaye] run tellraw @a ["", {"text": "★ ", "color": "gold"}, {"selector": "@s", "color": "yellow"}, {"text": " obtient le titre ", "color": "gray"}, {"text": "« J'ai essayé »", "color": "gold", "bold": true}]
tag @a[tag=titre_j_ai_essaye,tag=!annonce_j_ai_essaye] add annonce_j_ai_essaye
execute as @a[tag=titre_protagoniste,tag=!annonce_protagoniste] run tellraw @a ["", {"text": "★ ", "color": "gold"}, {"selector": "@s", "color": "yellow"}, {"text": " obtient le titre ", "color": "gray"}, {"text": "« Protagoniste (autoproclamé) »", "color": "gold", "bold": true}]
tag @a[tag=titre_protagoniste,tag=!annonce_protagoniste] add annonce_protagoniste
execute as @a[tag=titre_victime_eniy,tag=!annonce_victime_eniy] run tellraw @a ["", {"text": "★ ", "color": "gold"}, {"selector": "@s", "color": "yellow"}, {"text": " obtient le titre ", "color": "gray"}, {"text": "« Victime d'Eniy »", "color": "gold", "bold": true}]
tag @a[tag=titre_victime_eniy,tag=!annonce_victime_eniy] add annonce_victime_eniy
execute as @a[tag=titre_collectionneur,tag=!annonce_collectionneur] run tellraw @a ["", {"text": "★ ", "color": "gold"}, {"selector": "@s", "color": "yellow"}, {"text": " obtient le titre ", "color": "gray"}, {"text": "« Collectionneur »", "color": "gold", "bold": true}]
tag @a[tag=titre_collectionneur,tag=!annonce_collectionneur] add annonce_collectionneur
execute as @a[tag=titre_boss_de_fin,tag=!annonce_boss_de_fin] run tellraw @a ["", {"text": "★ ", "color": "gold"}, {"selector": "@s", "color": "yellow"}, {"text": " obtient le titre ", "color": "gray"}, {"text": "« Vrai boss de fin »", "color": "gold", "bold": true}]
tag @a[tag=titre_boss_de_fin,tag=!annonce_boss_de_fin] add annonce_boss_de_fin
execute as @a[tag=titre_historien,tag=!annonce_historien] run tellraw @a ["", {"text": "★ ", "color": "gold"}, {"selector": "@s", "color": "yellow"}, {"text": " obtient le titre ", "color": "gray"}, {"text": "« Historien d'Atheria »", "color": "gold", "bold": true}]
tag @a[tag=titre_historien,tag=!annonce_historien] add annonce_historien
execute as @a[tag=titre_valide_chef,tag=!annonce_valide_chef] run tellraw @a ["", {"text": "★ ", "color": "gold"}, {"selector": "@s", "color": "yellow"}, {"text": " obtient le titre ", "color": "gray"}, {"text": "« Validé par le chef »", "color": "gold", "bold": true}]
tag @a[tag=titre_valide_chef,tag=!annonce_valide_chef] add annonce_valide_chef
execute as @a[tag=titre_podcasteur,tag=!annonce_podcasteur] run tellraw @a ["", {"text": "★ ", "color": "gold"}, {"selector": "@s", "color": "yellow"}, {"text": " obtient le titre ", "color": "gray"}, {"text": "« Podcasteur de l'apocalypse »", "color": "gold", "bold": true}]
tag @a[tag=titre_podcasteur,tag=!annonce_podcasteur] add annonce_podcasteur
execute as @a[tag=titre_cartographe,tag=!annonce_cartographe] run tellraw @a ["", {"text": "★ ", "color": "gold"}, {"selector": "@s", "color": "yellow"}, {"text": " obtient le titre ", "color": "gray"}, {"text": "« Cartographe »", "color": "gold", "bold": true}]
tag @a[tag=titre_cartographe,tag=!annonce_cartographe] add annonce_cartographe
schedule function atheria:boucle 40t replace
