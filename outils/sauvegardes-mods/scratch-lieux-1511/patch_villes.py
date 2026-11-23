p = r'C:\Users\El-Afdal\Desktop\Atheria Zombie Edition\outils\contenu\generer-villes.ps1'
s = open(p, encoding='utf-8-sig').read()
a = s.index('$od = [ordered]@{}\n')
b = s.index('Copy-Item "$lc\\palettes\\ath_beton.json"')
nouveau = open(r'C:\Users\El-Afdal\AppData\Local\Temp\claude\d75113947d74750a\3b6158cc-eefc-4df2-8769-4b2d767c856c\scratchpad\villes_bloc.ps1', encoding='utf-8').read()
s = s[:a] + nouveau + s[b:]
open(p, 'w', encoding='utf-8-sig', newline='\n').write(s)
print('ok', a, b)
