package fr.atheria.ile;

import net.minecraft.world.level.Level;

import java.lang.reflect.Method;

/**
 * 0.5.4 : lien optionnel avec Lost Cities, par reflexion (le mod de l'ile marche sans Lost Cities).
 * API publique de Lost Cities 1.21-8.4.x : LostCities.lostCitiesImp.getLostInfo(level).getChunkInfo(cx, cz)
 * -> isCity(), getCityLevel() ; getRealHeight(niveau) = groundLevel + 6 x niveau = Y du bloc de rue.
 */
final class LienLostCities {
    private final Object info;
    private final Method chunkInfo, estVille, niveauVille, hauteurReelle;

    private LienLostCities(Object info, Method chunkInfo, Method estVille, Method niveauVille, Method hauteurReelle) {
        this.info = info; this.chunkInfo = chunkInfo; this.estVille = estVille; this.niveauVille = niveauVille; this.hauteurReelle = hauteurReelle;
    }

    /** null si Lost Cities est absent ou ne gere pas ce monde */
    static LienLostCities pour(Level niveau) {
        if (niveau == null) return null;
        try {
            ClassLoader cl = LienLostCities.class.getClassLoader();
            Class<?> lc = Class.forName("mcjty.lostcities.LostCities", true, cl);
            Object imp = lc.getField("lostCitiesImp").get(null);
            Class<?> api = Class.forName("mcjty.lostcities.api.ILostCities", false, cl);
            Object info = api.getMethod("getLostInfo", Level.class).invoke(imp, niveau);
            if (info == null) { CarteIle.LOG.info("[atheria_ile] Lost Cities present mais ne gere pas ce monde : profil de route sans rues"); return null; }
            Class<?> ci = Class.forName("mcjty.lostcities.api.ILostCityInformation", false, cl);
            Class<?> ch = Class.forName("mcjty.lostcities.api.ILostChunkInfo", false, cl);
            return new LienLostCities(info, ci.getMethod("getChunkInfo", int.class, int.class), ch.getMethod("isCity"),
                    ch.getMethod("getCityLevel"), ci.getMethod("getRealHeight", int.class));
        } catch (ClassNotFoundException e) {
            return null;
        } catch (Throwable t) {
            CarteIle.LOG.warn("[atheria_ile] lien Lost Cities impossible ({}) : profil de route sans rues", t.toString());
            return null;
        }
    }

    /** Y du bloc de rue si le chunk est une ville Lost Cities, Integer.MIN_VALUE sinon (ou en cas d'erreur) */
    int rue(int cx, int cz) {
        try {
            Object c = chunkInfo.invoke(info, cx, cz);
            if (c == null || !(Boolean) estVille.invoke(c)) return Integer.MIN_VALUE;
            return (Integer) hauteurReelle.invoke(info, (Integer) niveauVille.invoke(c));
        } catch (Throwable t) {
            erreurs++;
            if (erreurs <= 3) {
                Throwable cause = t instanceof java.lang.reflect.InvocationTargetException ite && ite.getCause() != null ? ite.getCause() : t;
                CarteIle.LOG.warn("[atheria_ile] Lost Cities getChunkInfo({}, {}) a echoue : {}", cx, cz, cause.toString());
            }
            return Integer.MIN_VALUE;
        }
    }

    int erreurs;

    /** diagnostic : classe de l'info Lost Cities */
    String quoi() { return info.getClass().getName(); }
}
