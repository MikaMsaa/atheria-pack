package fr.atheria.ile;

import java.io.DataOutputStream;
import java.io.FileOutputStream;
import java.lang.reflect.Constructor;
import java.nio.file.Path;

/**
 * Sonde hors jeu : charge le vrai CarteIle (carte.png + regions.json d'un dossier) et ecrit, pour un carre de colonnes,
 * un octet par colonne : bit0 terre attendue (distance a la cote deformee > 0), bit1 roche calcaire permise en mer
 * (aiguilles et eboulis : Cote calcaire, -45 < d <= 0), bit2 pixel lagon ou recif, bit3 zone protegee (fN < 0,999), bit4 lit de riviere (<= 10 blocs).
 * usage : java fr.atheria.ile.Sonde <dossier> <x> <z> <rayon> <sortie.bin> [x:z ...]
 */
public final class Sonde {
    public static void main(String[] a) throws Exception {
        Constructor<CarteIle> k = CarteIle.class.getDeclaredConstructor(Path.class);
        k.setAccessible(true);
        CarteIle c = k.newInstance(Path.of(a[0]));
        int cx = Integer.parseInt(a[1]), cz = Integer.parseInt(a[2]), r = Integer.parseInt(a[3]);
        try (DataOutputStream o = new DataOutputStream(new java.io.BufferedOutputStream(new FileOutputStream(a[4])))) {
            o.writeInt(cx - r); o.writeInt(cz - r); o.writeInt(2 * r);
            for (int z = cz - r; z < cz + r; z++)
                for (int x = cx - r; x < cx + r; x++) {
                    double d = c.distanceBlocs(x, z);
                    int cl = c.classeA(x, z);
                    int v = (d > 0 ? 1 : 0);
                    if (d > -45 && d <= 0 && c.forceNaturel(x, z) > 0 && c.estCalcaire(x, z)) v |= 2;
                    if (cl == CarteIle.LAGON || cl == CarteIle.RECIF) v |= 4;
                    if (c.forceNaturel(x, z) < 0.999) v |= 8;
                    if (c.distanceRiviere(x, z) <= 10) v |= 16;
                    o.writeByte(v);
                }
        }
        for (int i = 5; i < a.length; i++) {
            String[] p = a[i].split(":"); int x = Integer.parseInt(p[0]), z = Integer.parseInt(p[1]);
            System.out.println("point " + x + "," + z + " : distance " + Math.round(c.distanceBlocs(x, z)) + " classe " + c.classeA(x, z)
                    + " fN " + c.forceNaturel(x, z) + " continents " + c.continents(x, z, 0));
        }
        System.out.println("ok " + a[4]);
    }
}
