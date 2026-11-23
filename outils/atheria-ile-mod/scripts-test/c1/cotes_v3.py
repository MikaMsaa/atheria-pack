# Cotes et lagon v3 dans CarteIle.java : parametres a 0 par defaut (identique au bit pres), tout multiplie par fN > 0.
import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (a[:80], s.count(a))
    s = s.replace(a, b)

# 1) champs
rep("    public final double rnWarp, rnCote, rnMicro, rnMeandre, rnLargeurVar, rnTransition;",
    "    public final double rnWarp, rnCote, rnMicro, rnMeandre, rnLargeurVar, rnTransition;\n"
    "    /** 0.9.1 cotes et lagon v3 (0 = inactif, identique au bit pres) */\n"
    "    public final double rnWarpLarge, rnCoteFine, rnCriques, rnFalaise, rnAiguilles, rnLagonPente, rnPassesMeandre;\n"
    "    private int regionCalcaire = -2;")

# 2) lecture
rep('        rnTransition = rnActif ? nombre(rn, "transition_regions_blocs", 0) : 0;',
    '        rnTransition = rnActif ? nombre(rn, "transition_regions_blocs", 0) : 0;\n'
    '        rnWarpLarge = rnActif ? nombre(rn, "deformation_cote_large_blocs", 0) : 0;\n'
    '        rnCoteFine = rnActif ? nombre(rn, "cote_fractale_fine_blocs", 0) : 0;\n'
    '        rnCriques = rnActif ? nombre(rn, "criques_blocs", 0) : 0;\n'
    '        rnFalaise = rnActif ? nombre(rn, "falaises_calcaire", 0) : 0;\n'
    '        rnAiguilles = rnActif ? nombre(rn, "aiguilles_calcaire", 0) : 0;\n'
    '        rnLagonPente = rnActif ? nombre(rn, "lagon_pente", 0) : 0;\n'
    '        rnPassesMeandre = rnActif ? nombre(rn, "passes_meandres_blocs", 0) : 0;')

# 3) warp multi-echelle : octaves larges ajoutees seulement si actives
rep("        return (0.55 * bruit(bx / 230.0, bz / 230.0, c) + 0.30 * bruit(bx / 88.0, bz / 88.0, c + 1) + 0.15 * bruit(bx / 31.0, bz / 31.0, c + 2)) * rnWarp;",
    "        double w = (0.55 * bruit(bx / 230.0, bz / 230.0, c) + 0.30 * bruit(bx / 88.0, bz / 88.0, c + 1) + 0.15 * bruit(bx / 31.0, bz / 31.0, c + 2)) * rnWarp;\n"
    "        if (rnWarpLarge > 0) w += (0.65 * bruit(bx / 700.0, bz / 700.0, c + 3) + 0.35 * bruit(bx / 1600.0, bz / 1600.0, c + 4)) * rnWarpLarge;\n"
    "        return w;")

# 4) cote fractale fine + criques
rep("            if (rnCote <= 0 || Math.abs(d0) > rnCote * 6) return d0;",
    "            if ((rnCote <= 0 && rnCriques <= 0) || Math.abs(d0) > Math.max(rnCote * 6, rnCriques * 4)) return d0;")
rep("            return d0 + f * rnCote * fr * (1 - lisse(rnCote * 3, rnCote * 6, Math.abs(d0)));",
    "            double r = d0;\n"
    "            if (rnCote > 0 && Math.abs(d0) <= rnCote * 6) {\n"
    "                if (rnCoteFine > 0) fr += rnCoteFine / rnCote * bruit(ox / 3.3, oz / 3.3, 324);\n"
    "                r += f * rnCote * fr * (1 - lisse(rnCote * 3, rnCote * 6, Math.abs(d0)));\n"
    "            }\n"
    "            if (rnCriques > 0) {\n"
    "                // criques : poches arrondies de 20 a 50 blocs ou la mer entre dans la terre (cellules de bruit au-dessus d'un seuil)\n"
    "                double q = bruit(ox / 47.0, oz / 47.0, 325) + 0.35 * bruit(ox / 17.0, oz / 17.0, 326);\n"
    "                double cr = Math.max(0, (q - 0.42) / 0.58);\n"
    "                r -= f * rnCriques * cr * cr * (1 - lisse(rnCriques * 2, rnCriques * 4, Math.abs(d0)));\n"
    "            }\n"
    "            return r;")

# 5) continents : lagon en pente, falaises et aiguilles de la Cote calcaire
rep("            v = Math.min(v, cl == LAGON ? -0.19 : -0.17);   // le lagon reste sous la mer (cote Tectonic -0.155)",
    "            v = Math.min(v, cl == LAGON ? -0.19 : -0.17);   // le lagon reste sous la mer (cote Tectonic -0.155)\n"
    "            // 0.9.1 : le lagon s'approfondit en s'eloignant de la plage (degrade turquoise -> bleu)\n"
    "            if (cl == LAGON && fN > 0 && rnLagonPente > 0) v = Math.min(v, -0.19 - fN * rnLagonPente * lisse(-6, -280, d) * (0.85 + 0.15 * bruit(bx / 90.0, bz / 90.0, 411)));")
rep("            if (chenauxPx != null) {",
    "            // 0.9.1 : falaises de la Cote calcaire (la terre monte vite derriere le trait de cote)\n"
    "            if (fN > 0 && rnFalaise > 0 && d < 90 && estCalcaire(bx, bz))\n"
    "                v += fN * rnFalaise * lisse(0, 10, d) * (1 - lisse(55, 90, d)) * (0.7 + 0.3 * bruit(bx / 60.0, bz / 60.0, 401));\n"
    "            if (chenauxPx != null) {")
# aiguilles : mer ouverte proche de la cote calcaire
rep("        return v;\n    }\n\n    /** Force (0..1) d'une passe du lagon",
    "        else if (fN > 0 && rnAiguilles > 0 && d > -50 && d < -5 && estCalcaire(bx, bz)) {\n"
    "            // 0.9.1 : aiguilles (stacks) isolees devant les falaises calcaires\n"
    "            double n = bruit(bx / 11.0, bz / 11.0, 402) + 0.25 * bruit(bx / 4.0, bz / 4.0, 403);\n"
    "            double a = Math.max(0, (n - 0.78) / 0.22) * lisse(-50, -15, d);\n"
    "            if (a > 0) v = Math.max(v, v + (-0.10 - v) * Math.min(1, fN * rnAiguilles * a));\n"
    "        }\n"
    "        return v;\n    }\n\n"
    "    /** vrai si le bloc est dans la region de la Cote calcaire (frontiere de region deformee comme le biome) */\n"
    "    boolean estCalcaire(int bx, int bz) {\n"
    "        if (regionCalcaire == -2) regionCalcaire = regionNommee(\"Côte calcaire\");\n"
    "        return regionCalcaire >= 0 && (regionPassage(bx, bz) & 0xFF) == regionCalcaire;\n"
    "    }\n\n"
    "    /** Force (0..1) d'une passe du lagon")

# 6) passes : meandres et largeur variable hors zones protegees
rep("        double nz = Math.abs(bruit(bx / 1400.0, bz / 1400.0, 71) + 0.3 * bruit(bx / 380.0, bz / 380.0, 72));\n        double eps = passesLargeur / 1400.0;",
    "        double qx = bx, qz = bz, lv = 1;\n"
    "        if (rnPassesMeandre > 0) {\n"
    "            double f = forceNaturel(bx, bz);\n"
    "            if (f > 0) {\n"
    "                qx += f * rnPassesMeandre * (0.7 * bruit(bx / 260.0, bz / 260.0, 421) + 0.3 * bruit(bx / 90.0, bz / 90.0, 422));\n"
    "                qz += f * rnPassesMeandre * (0.7 * bruit(bx / 260.0, bz / 260.0, 423) + 0.3 * bruit(bx / 90.0, bz / 90.0, 424));\n"
    "                lv = 1 + 0.4 * f * bruit(bx / 200.0, bz / 200.0, 425);\n"
    "            }\n"
    "        }\n"
    "        double nz = Math.abs(bruit(qx / 1400.0, qz / 1400.0, 71) + 0.3 * bruit(qx / 380.0, qz / 380.0, 72));\n"
    "        double eps = passesLargeur * lv / 1400.0;")

# 7) journal
rep('        LOG.info("[atheria_ile] relief naturel {} : deformation {} blocs, cote fractale {} blocs, micro-relief {}, meandres {} blocs, largeur rivieres +-{}, transitions {} blocs",\n'
    '                rnActif ? "ACTIF" : "inactif", rnWarp, rnCote, rnMicro, rnMeandre, rnLargeurVar, rnTransition);',
    '        LOG.info("[atheria_ile] relief naturel {} : deformation {} blocs, cote fractale {} blocs, micro-relief {}, meandres {} blocs, largeur rivieres +-{}, transitions {} blocs",\n'
    '                rnActif ? "ACTIF" : "inactif", rnWarp, rnCote, rnMicro, rnMeandre, rnLargeurVar, rnTransition);\n'
    '        LOG.info("[atheria_ile] cotes v3 : warp large {} blocs, cote fine {} blocs, criques {} blocs, falaises {}, aiguilles {}, pente du lagon {}, meandres des passes {} blocs",\n'
    '                rnWarpLarge, rnCoteFine, rnCriques, rnFalaise, rnAiguilles, rnLagonPente, rnPassesMeandre);')
open(p, 'w', encoding='utf-8').write(s)
print('ok')
