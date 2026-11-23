# 0.9.4 : rivieres (bancs de sable, delta), sols en taches par region, debris post-apo rares. Tout a 0 = 0.9.3 au bit pres.
import sys, os
ile = sys.argv[1]
def lire(n): return open(os.path.join(ile, n), encoding='utf-8').read()
def ecrire(n, s): open(os.path.join(ile, n), 'w', encoding='utf-8').write(s)
def rep(s, a, b):
    assert s.count(a) == 1, (a[:90], s.count(a))
    return s.replace(a, b)

# ---------------- CarteIle : parametres
s = lire('CarteIle.java')
s = rep(s, "public final double rnFalaise3d, rnFalHMin, rnFalHMax, rnRecif, rnRecifPlafond;",
        "public final double rnFalaise3d, rnFalHMin, rnFalHMax, rnRecif, rnRecifPlafond;\n"
        "    /** 0.9.4 : bancs de sable des rivieres (0..1), delta aux embouchures (blocs), sols en taches (0..1), debris post-apo (par chunk) */\n"
        "    public final double rnBancs, rnDelta, rnSols, rnDebris;")
s = rep(s, '        rnRecifPlafond = rnActif ? nombre(rn, "recif_plafond_y", 0) : 0;',
        '        rnRecifPlafond = rnActif ? nombre(rn, "recif_plafond_y", 0) : 0;\n'
        '        rnBancs = rnActif ? Math.max(0, Math.min(1, nombre(rn, "riviere_bancs", 0))) : 0;\n'
        '        rnDelta = rnActif ? Math.max(0, nombre(rn, "riviere_delta_blocs", 0)) : 0;\n'
        '        rnSols = rnActif ? Math.max(0, Math.min(1, nombre(rn, "sols_taches", 0))) : 0;\n'
        '        rnDebris = rnActif ? Math.max(0, Math.min(0.2, nombre(rn, "debris_par_chunk", 0))) : 0;')
s = rep(s, 'plafond du recif et du lagon Y {}", rnFalaise3d, rnFalHMin, rnFalHMax, rnRecif, rnRecifPlafond);',
        'plafond du recif et du lagon Y {}", rnFalaise3d, rnFalHMin, rnFalHMax, rnRecif, rnRecifPlafond);\n'
        '        LOG.info("[atheria_ile] nature 0.9.4 : bancs de sable {}, delta {} blocs, sols en taches {}, debris {} par chunk", rnBancs, rnDelta, rnSols, rnDebris);')
s = rep(s, "    long graineDetails(int cx, int cz) {",
        "    /** graine separee pour les sols et les debris (ne change pas le tirage des details) */\n"
        "    long graineNature(int cx, int cz, long canal) { return melange(graineDetails(cx, cz) ^ (canal * 0xD1B54A32D192ED03L)); }\n"
        "    long graineDetails(int cx, int cz) {")
s = rep(s, "    private static double lisse(double a, double b, double x) {", "    static double lisse(double a, double b, double x) {")
ecrire('CarteIle.java', s)

# ---------------- Rivieres : bancs et delta
s = lire('Rivieres.java')
s = rep(s, "        if (proche > ANNEAU + 12) return false;",
        "        if (proche > (c.rnDelta > 0 ? ANNEAU * 2.5 : ANNEAU) + 12) return false;")
s = rep(s, "            double dr = c.distanceRiviere(bx, bz), dl = c.distanceLac(bx, bz);\n            if (dr > ANNEAU && dl > 3) continue;",
        "            double dr = c.distanceRiviere(bx, bz), dl = c.distanceLac(bx, bz);\n"
        "            double fN = (c.rnDelta > 0 || c.rnBancs > 0) && dr <= ANNEAU * 2.5 ? c.forceNaturel(bx, bz) : 0;\n"
        "            double ouv = 0;\n"
        "            if (fN > 0 && c.rnDelta > 0) {\n"
        "                // 0.9.4 delta : le lit s'elargit (jusqu'a x2,5) en approchant de la mer\n"
        "                double dc = c.distanceBlocs(bx, bz);\n"
        "                if (dc < c.rnDelta) { ouv = fN * CarteIle.lisse(c.rnDelta, 0, dc); dr /= 1 + 1.5 * ouv; }\n"
        "            }\n"
        "            if (dr > ANNEAU && dl > 3) continue;")
s = rep(s, "            int cible;\n            if (lac) cible = Math.min(top, L - 1);",
        "            boolean banc = false;\n"
        "            if (!lac && fN > 0 && c.rnBancs > 0 && dr <= LIT + 4) {\n"
        "                // 0.9.4 bancs de sable : taches dans le lit, a fleur d'eau, plus nombreuses au delta\n"
        "                double q = c.bruit(bx / 21.0, bz / 21.0, 451) + 0.35 * c.bruit(bx / 8.0, bz / 8.0, 452);\n"
        "                banc = q > 0.95 - 0.45 * fN * c.rnBancs - 0.25 * ouv;\n"
        "            }\n"
        "            int cible;\n"
        "            if (banc) cible = L;\n"
        "            else if (lac) cible = Math.min(top, L - 1);")
s = rep(s, "                n.setBlock(p.set(bx, cible, bz), cible < L ? (dr <= LIT ? GRAVIER : SABLE) : HERBE, 2);",
        "                n.setBlock(p.set(bx, cible, bz), banc ? SABLE : cible < L ? (dr <= LIT ? GRAVIER : SABLE) : HERBE, 2);")
s = rep(s, "            } else if (!lac && dr > BERGE - 3 && top < L + 1 && L + 1 - top <= REMBLAI_MAX) {",
        "            } else if (banc && top < L && L - top <= REMBLAI_MAX) {\n"
        "                for (int y = top + 1; y <= L; y++) n.setBlock(p.set(bx, y, bz), SABLE, 2);\n"
        "                nouveau = L;\n"
        "                pose = true;\n"
        "            } else if (!lac && dr > BERGE - 3 && top < L + 1 && L + 1 - top <= REMBLAI_MAX) {")
ecrire('Rivieres.java', s)

# ---------------- DetailsFeature : sols et debris
s = lire('DetailsFeature.java')
s = rep(s, "        if (c == null || c.detailsDensite <= 0) return false;",
        "        if (c == null || (c.detailsDensite <= 0 && c.rnSols <= 0 && c.rnDebris <= 0)) return false;")
s = rep(s, "        RandomSource r = RandomSource.create(c.graineDetails(x0 >> 4, z0 >> 4));\n        boolean pose = false;",
        "        boolean pose = false;\n"
        "        if (c.rnSols > 0) pose |= Nature.sols(c, ctx.level(), x0, z0, ctx.chunkGenerator().getSeaLevel());\n"
        "        if (c.rnDebris > 0) pose |= Nature.debris(c, ctx.level(), x0, z0, ctx.chunkGenerator().getSeaLevel());\n"
        "        if (c.detailsDensite <= 0) return pose;\n"
        "        RandomSource r = RandomSource.create(c.graineDetails(x0 >> 4, z0 >> 4));")
ecrire('DetailsFeature.java', s)
print('ok')
