# Falaises 3D de la Cote calcaire (champ relief sur tectonic:base_terrain) : 0 = inactif (identique au bit pres)
import sys
ile = sys.argv[1]
p = ile + '/IleChamp.java'; s = open(p, encoding='utf-8').read()
a = "    private double relief3d(CarteIle c, int x, int y, int z, double deja) {"
assert s.count(a) == 1
s = s.replace(a, '''    private double relief3d(CarteIle c, int x, int y, int z, double deja) {
        double r = relief3dBase(c, x, y, z, deja);
        return (c != null && c.rnFalaise3d > 0) ? cote3d(c, x, y, z, r) : r;
    }

    // ---- 0.9.1 : falaises et aiguilles de la Cote calcaire en 3D (max avec la densite : n'ajoute que de la roche)
    // memo par colonne : x, z, mode (0 rien, 1 falaise, 2 aiguille), sommet T, distance a la cote d, force a
    private static final ThreadLocal<double[]> MEMO_C = ThreadLocal.withInitial(() -> new double[]{Double.NaN, Double.NaN, 0, 0, 0, 0});

    private static double lisseC(double a, double b, double x) {
        double t = Math.max(0, Math.min(1, (x - a) / (b - a)));
        return t * t * (3 - 2 * t);
    }

    static double cote3d(CarteIle c, int x, int y, int z, double o) {
        double[] m = MEMO_C.get();
        if (m[0] != x || m[1] != z) {
            m[0] = x; m[1] = z; m[2] = 0;
            double d = c.distanceBlocs(x, z);
            if (d > -45 && d < 95) {
                double f = c.forceNaturel(x, z);
                if (f > 0 && c.estCalcaire(x, z)) {
                    double hc = c.rnFalHMin + (c.rnFalHMax - c.rnFalHMin) * (0.5 + 0.5 * c.bruit(x / 170.0, z / 170.0, 431));
                    if (d >= -8) { m[2] = 1; m[3] = c.niveauMer + f * c.rnFalaise3d * hc * (1 - lisseC(35, 95, d)); m[4] = d; }
                    else {
                        double n = c.bruit(x / 9.0, z / 9.0, 432) + 0.3 * c.bruit(x / 3.5, z / 3.5, 433);
                        double a = Math.max(0, (n - 0.80) / 0.20) * lisseC(-45, -14, d) * (1 - lisseC(-14, -10, d));
                        if (a > 0) { m[2] = 2; m[3] = c.niveauMer + f * c.rnFalaise3d * hc * (0.55 + 0.45 * Math.sqrt(a)); m[5] = a; }
                    }
                }
            }
        }
        if (m[2] == 0) return o;
        double T = m[3];
        if (y > T + 1) return o;
        double haut = (T - 0.5 - y) * 0.25;
        double dens;
        if (m[2] == 1) {
            // face a 2,5 blocs du trait de cote ; eboulis au pied (le bas avance vers la mer), leger surplomb en haut, face irreguliere
            double face = 2.5 - 6.0 * (1 - lisseC(c.niveauMer - 4, c.niveauMer + 6, y)) - 1.2 * lisseC(T - 7, T - 1, y)
                    + 1.4 * c.bruit(x / 6.0 + y / 9.0, z / 6.0 - y / 13.0, 434);
            dens = Math.min((m[4] - face) * 0.5, haut);
        } else dens = Math.min((m[5] - 0.12) * 3.0, haut);
        if (dens > 1.5) dens = 1.5;
        return dens > o ? dens : o;
    }

    private double relief3dBase(CarteIle c, int x, int y, int z, double deja) {''')
open(p, 'w', encoding='utf-8').write(s)

p = ile + '/CarteIle.java'; s = open(p, encoding='utf-8').read()
a = "    private int regionCalcaire = -2;"
assert s.count(a) == 1
s = s.replace(a, a + "\n    public final double rnFalaise3d, rnFalHMin, rnFalHMax;\n    public final double niveauMer = 63;")
a = '        rnPassesMeandre = rnActif ? nombre(rn, "passes_meandres_blocs", 0) : 0;'
assert s.count(a) == 1
s = s.replace(a, a + '\n        rnFalaise3d = rnActif ? nombre(rn, "falaises_3d", 0) : 0;\n'
              '        rnFalHMin = rn != null ? nombre(rn, "falaises_hauteur_min_blocs", 8) : 8;\n'
              '        rnFalHMax = rn != null ? nombre(rn, "falaises_hauteur_max_blocs", 25) : 25;')
a = '                rnWarpLarge, rnCoteFine, rnCriques, rnFalaise, rnAiguilles, rnLagonPente, rnPassesMeandre);'
assert s.count(a) == 1
s = s.replace(a, a + '\n        LOG.info("[atheria_ile] falaises 3D de la Cote calcaire : {} (hauteur {} a {} blocs)", rnFalaise3d, rnFalHMin, rnFalHMax);')
open(p, 'w', encoding='utf-8').write(s)
print('ok')
