# Atheria : objectifs de campagne (généré)
scoreboard objectives add aura_paf dummy {"text": "Aura PAF"}
scoreboard objectives add aura_passeurs dummy {"text": "Aura Passeurs"}
scoreboard objectives add aura_goblini dummy {"text": "Aura Goblini"}
scoreboard objectives add aura_coconi dummy {"text": "Aura Coconi"}
scoreboard objectives add aura_enfants dummy {"text": "Aura Enfants du Choléra"}
scoreboard objectives add aura_sud dummy {"text": "Aura Pêcheurs du Sud"}
scoreboard objectives add atheria dummy
execute unless score #acte atheria matches 1.. run scoreboard players set #acte atheria 1
schedule function atheria:boucle 40t replace
