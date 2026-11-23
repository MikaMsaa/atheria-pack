SP = r"C:/Users/El-Afdal/AppData/Local/Temp/claude/d75113947d74750a/3b6158cc-eefc-4df2-8769-4b2d767c856c/scratchpad/"
p = SP + "zz_vitrine_lot70.js"
L = open(p, encoding="utf-8").read().split("\n")
i = [k for k, l in enumerate(L) if l.startswith("function mjRoute")][0]
head = "\n".join(L[:i])
for a, b in [("if (x >= 40 && x <= 73) return", "if (x >= 44 && x <= 69) return"),
             ("if (x >= 38 && x <= 75) continue", "if (x >= 42 && x <= 71) continue"),
             ("else if (/mcwdoors:/.test(b) && (x * 7 + z * 13) % 10 < 4) S(x, y, z, AIR)",
              "else if (/mcwdoors:/.test(b)) { var h = (x * 7 + z * 13) % 10; if (h < 4) S(x, y, z, AIR); else if (h < 6) S(x, y, z, 'minecraft:spruce_planks') }   // portes arrachees ou condamnees")]:
    assert a in head, a
    head = head.replace(a, b)
open(p, "w", encoding="utf-8").write(head + "\n" + open(SP + "nouveau_route.js", encoding="utf-8").read())
print("ok")
