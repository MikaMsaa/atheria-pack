package fr.atheria.monde;

import java.awt.Color;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import net.minecraft.client.Minecraft;
import sun.misc.Unsafe;

// Le menu Apparence est l'ecran d'Essential : on repeint sa palette aux couleurs d'Atheria, sans toucher a ses classes.
public final class ThemeApparence {
    private static final float TEINTE_FOND = 34.0F / 360.0F;
    private static final float TEINTE_ACCENT = 42.0F / 360.0F;
    private static boolean fait;

    private ThemeApparence() {
    }

    public static void appliquer() {
        if (fait) return;
        fait = true;
        try {
            Class<?> palette = Class.forName("gg.essential.gui.EssentialPalette", true, Minecraft.class.getClassLoader());
            Field acces = Unsafe.class.getDeclaredField("theUnsafe");
            acces.setAccessible(true);
            Unsafe unsafe = (Unsafe) acces.get(null);
            int repeintes = 0;
            for (Field champ : palette.getDeclaredFields()) {
                if (!Modifier.isStatic(champ.getModifiers()) || champ.getType() != Color.class) continue;
                Object base = unsafe.staticFieldBase(champ);
                long position = unsafe.staticFieldOffset(champ);
                Color avant = (Color) unsafe.getObject(base, position);
                if (avant == null) continue;
                unsafe.putObject(base, position, repeindre(avant));
                repeintes++;
            }
            ProfilRelance.LOG.info("Palette Essential repeinte : {} couleurs", repeintes);
        } catch (Throwable erreur) {
            ProfilRelance.LOG.warn("Palette Essential laissee telle quelle : {}", erreur.toString());
        }
    }

    private static Color repeindre(Color couleur) {
        float[] hsb = Color.RGBtoHSB(couleur.getRed(), couleur.getGreen(), couleur.getBlue(), null);
        float teinte = hsb[0] * 360.0F;
        float nouvelle;
        float saturation;
        float luminosite = hsb[2];
        if (hsb[1] < 0.25F) {
            // Gris et fonds : un brun sombre un peu desature, le texte clair reste lisible
            nouvelle = TEINTE_FOND;
            saturation = luminosite < 0.6F ? 0.22F : 0.08F;
            if (luminosite < 0.6F) luminosite *= 0.85F;
        } else if (teinte > 170.0F && teinte < 290.0F) {
            // Accents bleus et violets : l'ocre des menus
            nouvelle = TEINTE_ACCENT;
            saturation = Math.min(hsb[1], 0.62F);
            luminosite *= 0.82F;
        } else {
            return couleur;
        }
        int rgb = Color.HSBtoRGB(nouvelle, saturation, luminosite) & 0xFFFFFF;
        return new Color(rgb >> 16 & 255, rgb >> 8 & 255, rgb & 255, couleur.getAlpha());
    }
}
