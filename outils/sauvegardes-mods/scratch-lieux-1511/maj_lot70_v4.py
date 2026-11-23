SP = r"C:/Users/El-Afdal/AppData/Local/Temp/claude/d75113947d74750a/3b6158cc-eefc-4df2-8769-4b2d767c856c/scratchpad/"
p = SP + "zz_vitrine_lot70.js"
t = open(p, encoding="utf-8").read()
open(SP + "zz_vitrine_lot70.v3.js", "w", encoding="utf-8").write(t)
ab = open(SP + "abords.js", encoding="utf-8").read()
a = "function mjRoute() {"
assert t.count(a) == 1
t = t.replace(a, ab + "\n" + a)
old_grass = [l for l in t.split("\n") if l.strip().startswith("for (var i = 0; i < 1800; i++)")]
assert len(old_grass) == 1, old_grass
new_grass = "  mjAbords()\n  for (var i = 0; i < 5200; i++) { var x = Math.floor(R() * 128), z = Math.floor(R() * 128); if (x >= 48 && x <= 65) continue; if (lbBruit(Math.floor(x / 4), Math.floor(z / 4), 12.7) < -0.6 && R() < 0.7) continue; mjPlante(x, z) }"
t = t.replace(old_grass[0], new_grass)
b = "  vue('n_brulee',"
assert t.count(b) == 1
t = t.replace(b, "  vue('n_abords_ouest', 0, 0, 47, 1.7, 52, 45, 1.2, 75)\n  vue('n_abords_est', 0, 0, 66, 1.7, 40, 68, 1.2, 15)\n" + b)
open(p, "w", encoding="utf-8").write(t)
print("ok")
