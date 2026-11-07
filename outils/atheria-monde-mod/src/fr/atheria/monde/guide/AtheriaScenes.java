package fr.atheria.monde.guide;

import com.tacz.guns.api.item.builder.GunItemBuilder;
import fr.atheria.monde.ProfilRelance;
import net.createmod.catnip.math.Pointing;
import net.createmod.ponder.api.PonderPalette;
import net.createmod.ponder.api.element.ElementLink;
import net.createmod.ponder.api.element.EntityElement;
import net.createmod.ponder.api.scene.SceneBuilder;
import net.createmod.ponder.api.scene.SceneBuildingUtil;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.core.particles.ParticleTypes;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.Mob;
import net.minecraft.world.entity.monster.Zombie;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.phys.Vec3;

// Scenes des tutoriels : un survivant sur un plateau, du texte et les touches a l'ecran.
// Les vehicules, les etablis et la pompe sont les vrais modeles d'Immersive Vehicles, le survivant porte le skin du joueur.
public final class AtheriaScenes {
    private static final String PACK = "MTS Official Pack";
    private static final String BASE = "Immersive Vehicles";
    private static final String PIECES = "assets/mtsofficialpack/objmodels/parts/";
    private static final String TEX_PIECES = "assets/mtsofficialpack/textures/parts/";

    private AtheriaScenes() {
    }

    // --- Outils ---

    private static ItemStack objet(String id) {
        return new ItemStack(BuiltInRegistries.ITEM.get(ResourceLocation.parse(id)));
    }

    private static void debut(SceneBuilder scene, String id, String titre) {
        scene.title(id, titre);
        scene.configureBasePlate(0, 0, 9);
        scene.showBasePlate();
        // Vue de profil : le joueur et les vehicules se deplacent le long de Z et rien ne les cache
        scene.rotateCameraY(-90);
        scene.idle(10);
    }

    // Un joueur distant n'a aucune physique : il reste la ou la scene le place, et ses jambes suivent ses deplacements.
    private static ElementLink<EntityElement> survivant(SceneBuilder scene, Vec3 pos, float regard) {
        return scene.world().createEntity(level -> {
            Figurant joueur = new Figurant();
            joueur.setPos(pos);
            joueur.setYRot(regard);
            joueur.setYHeadRot(regard);
            joueur.setYBodyRot(regard);
            return joueur;
        });
    }

    private static void geste(SceneBuilder scene, ElementLink<EntityElement> lien, Figurant.Geste geste, int ticks) {
        scene.world().modifyEntity(lien, e -> {
            if (e instanceof Figurant f) f.geste(geste, ticks);
        });
    }

    private static void tenir(SceneBuilder scene, ElementLink<EntityElement> lien, ItemStack objet) {
        scene.world().modifyEntity(lien, e -> {
            if (e instanceof Figurant f) f.setItemInHand(net.minecraft.world.InteractionHand.MAIN_HAND, objet);
        });
    }

    // Les vrais modeles entrent dans la scene par une instruction : la scene peut etre rejouee depuis le debut.
    private static ModeleScene entrer(SceneBuilder scene, ModeleScene modele) {
        scene.addInstruction(s -> {
            modele.montrer();
            s.addElement(modele);
        });
        return modele;
    }

    private static void action(SceneBuilder scene, Runnable faire) {
        scene.addInstruction(s -> faire.run());
    }

    private static void piloter(SceneBuilder scene, ModeleScene modele, Vec3 vers, float tangage, float roulis, int ticks) {
        for (int i = 1; i <= ticks; i++) {
            double t = (double) i / ticks;
            action(scene, () -> {
                Vec3 ici = modele.position();
                double reste = 1.0 / Math.max(1.0, ticks - t * ticks + 1.0);
                modele.placer(ici.lerp(vers, reste), modele.tangage() + (tangage - modele.tangage()) * (float) reste, modele.roulis() + (roulis - modele.roulis()) * (float) reste);
            });
            scene.idle(1);
        }
    }

    private static ModeleScene decor(Vec3 pos, String nom) {
        return new ModeleScene(pos, 0.0F, 1.0F).piece(BASE, "assets/mts/objmodels/decors/" + nom + ".obj", "assets/mts/textures/decors/" + nom + ".png", 0.0F, 0.0F, 0.0F, 0.0F);
    }

    // La Mustang du pack : ses coordonnees viennent de son fichier, recentrees et posees au sol.
    private static final float MUSTANG_Y = 0.27F, MUSTANG_Z = -1.65F;
    private static final float[][] MUSTANG_ROUES = {{-1.125F, 0.0625F, -0.1875F}, {1.125F, 0.0625F, -0.1875F}, {-1.125F, 0.0625F, 3.5F}, {1.125F, 0.0625F, 3.5F}};
    private static final float[][] MUSTANG_SIEGES = {{-0.5635F, 0.37F, 1.25F}, {0.5635F, 0.37F, 1.25F}};

    private static final String MUSTANG_OBJ = "assets/mtsofficialpack/objmodels/vehicles/fordmustang69.obj", MUSTANG_TEX = "assets/mtsofficialpack/textures/vehicles/fordmustang69_redstripe.png";

    private static ModeleScene carrosserie(Vec3 pos) {
        return new ModeleScene(pos, 0.0F, 1.0F).piece(PACK, MUSTANG_OBJ, MUSTANG_TEX, 0.0F, MUSTANG_Y, MUSTANG_Z, 0.0F);
    }

    private static ModeleScene mustang(Vec3 pos) {
        ModeleScene voiture = carrosserie(pos);
        for (float[] r : MUSTANG_ROUES) voiture.roue(PACK, PIECES + "wheelmedium.obj", TEX_PIECES + "wheelmedium.png", r[0], r[1] + MUSTANG_Y, r[2] + MUSTANG_Z, r[0] < 0.0F ? 180.0F : 0.0F);
        for (float[] s : MUSTANG_SIEGES) voiture.piece(PACK, PIECES + "carseat.obj", TEX_PIECES + "carseat_black.png", s[0], s[1] + MUSTANG_Y, s[2] + MUSTANG_Z, 0.0F);
        return voiture;
    }

    private static ModeleScene skyhawk(Vec3 pos) {
        float y = 1.72F;
        ModeleScene avion = new ModeleScene(pos, 0.0F, 0.6F).piece(PACK, "assets/mtsofficialpack/objmodels/vehicles/skyhawk.obj", "assets/mtsofficialpack/textures/vehicles/skyhawk_bluered.png", 0.0F, y, 0.0F, 0.0F);
        for (float[] r : new float[][]{{0.0F, -1.50391F, 2.0625F}, {1.8125F, -1.46875F, -0.5F}, {-1.8125F, -1.46875F, -0.5F}}) avion.roue(PACK, PIECES + "wheelsmall.obj", TEX_PIECES + "wheelsmall.png", r[0], r[1] + y, r[2], 0.0F);
        return avion.tournante(PACK, PIECES + "propellersmall2blade.obj", TEX_PIECES + "propellersmall2blade.png", 0.0F, y, 3.3F, 0.0F, 0);
    }

    private static ModeleScene bell206(Vec3 pos) {
        float y = 1.92F;
        return new ModeleScene(pos, 0.0F, 0.6F).piece(PACK, "assets/mtsofficialpack/objmodels/vehicles/bell206.obj", "assets/mtsofficialpack/textures/vehicles/bell206_olive.png", 0.0F, y, 0.0F, 0.0F)
            .tournante(PACK, PIECES + "propellerrotor206.obj", "assets/mtsofficialpack/textures/vehicles/bell206_olive.png", 0.0F, y + 2.375F, 0.0F, -90.0F, 0);
    }

    // Les infectes du pack quand ils s'affichent, un zombie sinon
    private static ElementLink<EntityElement> infecte(SceneBuilder scene, Vec3 pos, float regard) {
        return scene.world().createEntity(level -> {
            Entity e = null;
            try {
                e = BuiltInRegistries.ENTITY_TYPE.getOptional(ResourceLocation.parse("spore:inf_human")).map(type -> type.create(level)).orElse(null);
            } catch (RuntimeException | LinkageError erreur) {
                ProfilRelance.LOG.warn("Infecte du guide indisponible : {}", erreur.toString());
            }
            if (!(e instanceof Mob)) {
                ProfilRelance.LOG.warn("Infecte du guide remplace : {}", e);
                e = new Zombie(EntityType.ZOMBIE, level);
            }
            ((Mob) e).setNoAi(true);
            e.setPos(pos);
            e.setYRot(regard);
            e.setYHeadRot(regard);
            ((Mob) e).setYBodyRot(regard);
            return e;
        });
    }

    // Un pas de marche : le corps se tourne vers ou il va et les jambes suivent la vitesse, comme le calcul du jeu pour un vrai joueur.
    private static void pas(Entity e, Vec3 pos) {
        double dx = pos.x - e.getX(), dz = pos.z - e.getZ();
        double distance = Math.sqrt(dx * dx + dz * dz);
        if (distance > 0.001) {
            float cap = (float) (Math.atan2(-dx, dz) * (180.0 / Math.PI));
            float regard = net.minecraft.util.Mth.approachDegrees(e.getYRot(), cap, 35.0F);
            e.setYRot(regard);
            e.setYHeadRot(regard);
            if (e instanceof LivingEntity vivant) vivant.setYBodyRot(regard);
        }
        e.setPos(pos);
        if (e instanceof LivingEntity vivant) vivant.walkAnimation.update(Math.min((float) distance * 4.0F, 1.0F), 0.4F);
    }

    private static void freiner(SceneBuilder scene, ElementLink<EntityElement> lien) {
        for (int i = 0; i < 4; i++) {
            scene.world().modifyEntity(lien, e -> {
                if (e instanceof LivingEntity vivant) vivant.walkAnimation.update(0.0F, 0.4F);
            });
            scene.idle(1);
        }
    }

    // Deplace une entite tick par tick : la duree de la scene compte ces ticks.
    private static void deplacer(SceneBuilder scene, ElementLink<EntityElement> lien, Vec3 de, Vec3 vers, int ticks) {
        for (int i = 1; i <= ticks; i++) {
            Vec3 pos = de.lerp(vers, (double) i / ticks);
            scene.world().modifyEntity(lien, e -> pas(e, pos));
            scene.idle(1);
        }
        freiner(scene, lien);
    }

    // Le geste de la main : clic droit, coup de pioche, coup d'un infecte.
    private static void frapper(SceneBuilder scene, ElementLink<EntityElement> lien) {
        scene.world().modifyEntity(lien, e -> {
            if (e instanceof LivingEntity vivant) vivant.swing(InteractionHand.MAIN_HAND);
        });
    }

    // Trajet en cloche : saut par-dessus un obstacle, chute, etc.
    private static void sauter(SceneBuilder scene, ElementLink<EntityElement> lien, Vec3 de, Vec3 vers, double hauteur, int ticks) {
        for (int i = 1; i <= ticks; i++) {
            double t = (double) i / ticks;
            Vec3 pos = de.lerp(vers, t).add(0, 4 * hauteur * t * (1 - t), 0);
            scene.world().modifyEntity(lien, e -> e.setPos(pos));
            scene.idle(1);
        }
    }

    private static void regarder(SceneBuilder scene, ElementLink<EntityElement> lien, float regard) {
        scene.world().modifyEntity(lien, e -> {
            e.setYRot(regard);
            e.setYHeadRot(regard);
            e.setYBodyRot(regard);
        });
    }

    private static void bulle(SceneBuilder scene, int ticks, String texte, Vec3 vise) {
        scene.overlay().showText(ticks).text(texte).pointAt(vise).placeNearTarget().attachKeyFrame();
    }

    private static ItemStack arme() {
        try {
            return GunItemBuilder.create().setId(ResourceLocation.parse("tacz:ak47")).build(net.minecraft.client.Minecraft.getInstance().level.registryAccess());
        } catch (RuntimeException | LinkageError e) {
            return ItemStack.EMPTY;
        }
    }

    private static void bulleVerte(SceneBuilder scene, int ticks, String texte, Vec3 vise) {
        scene.overlay().showText(ticks).colored(PonderPalette.GREEN).text(texte).pointAt(vise).placeNearTarget().attachKeyFrame();
    }

    private static void bulleRouge(SceneBuilder scene, int ticks, String texte, Vec3 vise) {
        scene.overlay().showText(ticks).colored(PonderPalette.RED).text(texte).pointAt(vise).placeNearTarget().attachKeyFrame();
    }

    private static void clicAvec(SceneBuilder scene, Vec3 ou, ItemStack objet, int ticks) {
        scene.overlay().showControls(ou, Pointing.DOWN, ticks).rightClick().withItem(objet);
    }

    private static void remplir(SceneBuilder scene, SceneBuildingUtil util, int x1, int y1, int z1, int x2, int y2, int z2) {
        scene.world().showSection(util.select().fromTo(x1, y1, z1, x2, y2, z2), Direction.DOWN);
    }

    // --- Parkour ---

    public static void parkourCourse(SceneBuilder scene, SceneBuildingUtil util) {
        debut(scene, "parkour_course", "Courir, glisser, ramper");
        Vec3 a = new Vec3(4.5, 1, 0.5), b = new Vec3(4.5, 1, 4.5), c = new Vec3(4.5, 1, 7.5);
        ElementLink<EntityElement> joueur = survivant(scene, a, 0);
        scene.idle(10);
        geste(scene, joueur, Figurant.Geste.COURSE, 1);
        bulle(scene, 50, "Maintiens CTRL en avançant : tu cours bien plus vite qu'un sprint normal.", a.add(0, 1, 2));
        deplacer(scene, joueur, a, b, 13);
        remplir(scene, util, 3, 2, 6, 5, 2, 6);
        remplir(scene, util, 3, 1, 6, 3, 1, 6);
        remplir(scene, util, 5, 1, 6, 5, 1, 6);
        scene.idle(6);
        bulleVerte(scene, 70, "En pleine course, appuie sur Alt : tu glisses au ras du sol et tu passes sous les obstacles.", new Vec3(4.5, 1.5, 6));
        geste(scene, joueur, Figurant.Geste.GLISSE, 1);
        deplacer(scene, joueur, b, c, 14);
        scene.idle(50);
        geste(scene, joueur, Figurant.Geste.RAMPE, 1);
        bulle(scene, 60, "Sans courir, maintiens Alt pour ramper à ton rythme dans un passage d'un bloc de haut.", c.add(0, 0.5, 0));
        deplacer(scene, joueur, c, c.add(0, 0, 0.9), 50);
        scene.idle(20);
        geste(scene, joueur, Figurant.Geste.LIBRE, 1);
        scene.idle(10);
        scene.markAsFinished();
    }

    public static void parkourObstacle(SceneBuilder scene, SceneBuildingUtil util) {
        debut(scene, "parkour_obstacle", "Franchir un obstacle");
        remplir(scene, util, 2, 1, 4, 6, 1, 4);
        scene.idle(10);
        Vec3 a = new Vec3(4.5, 1, 0.5), b = new Vec3(4.5, 1, 3.1), c = new Vec3(4.5, 1, 5.9);
        ElementLink<EntityElement> joueur = survivant(scene, a, 0);
        geste(scene, joueur, Figurant.Geste.COURSE, 1);
        bulle(scene, 60, "Fonce sur un obstacle en course rapide (CTRL) : tu passes par-dessus tout seul, sans sauter.", new Vec3(4.5, 1.5, 4));
        deplacer(scene, joueur, a, b, 10);
        geste(scene, joueur, Figurant.Geste.MURET, 11);
        sauter(scene, joueur, b, c, 1.15, 11);
        geste(scene, joueur, Figurant.Geste.LIBRE, 1);
        deplacer(scene, joueur, c, c.add(0, 0, 1), 8);
        scene.idle(30);
        bulle(scene, 60, "Saute droit dans un obstacle pour le franchir en l'air : ça marche jusqu'à 2 blocs de haut.", c.add(0, 1, 0));
        scene.idle(70);
        scene.markAsFinished();
    }

    public static void parkourGrimper(SceneBuilder scene, SceneBuildingUtil util) {
        debut(scene, "parkour_grimper", "S'accrocher et grimper");
        // Le mur au fond : on voit la face ou le joueur s'accroche
        scene.rotateCameraY(180);
        remplir(scene, util, 2, 1, 6, 6, 3, 8);
        scene.idle(10);
        Vec3 a = new Vec3(4.5, 1, 1.5), b = new Vec3(4.5, 1, 5.3), h = new Vec3(4.5, 2.05, 5.68), t = new Vec3(4.5, 4, 6.5);
        ElementLink<EntityElement> joueur = survivant(scene, a, 0);
        scene.idle(10);
        deplacer(scene, joueur, a, b, 26);
        bulle(scene, 60, "Saute vers le rebord et appuie sur V : tu t'y accroches et tu peux te décaler sur les côtés.", new Vec3(4.5, 3.9, 6));
        geste(scene, joueur, Figurant.Geste.ACCROCHE, 1);
        sauter(scene, joueur, b, h, 0.3, 8);
        scene.idle(60);
        bulleVerte(scene, 50, "Accroché, appuie sur Espace pour te hisser dessus.", new Vec3(4.5, 4, 6.2));
        scene.idle(20);
        geste(scene, joueur, Figurant.Geste.HISSE, 12);
        deplacer(scene, joueur, h, t, 12);
        geste(scene, joueur, Figurant.Geste.LIBRE, 1);
        scene.idle(40);
        bulle(scene, 60, "Contre un mur, en l'air : Espace pour rebondir. En chute : V pour freiner en frottant le mur.", t.add(0, 1, 0));
        scene.idle(70);
        scene.markAsFinished();
    }

    public static void parkourChute(SceneBuilder scene, SceneBuildingUtil util) {
        debut(scene, "parkour_chute", "Rouler et amortir une chute");
        remplir(scene, util, 3, 1, 0, 5, 4, 2);
        scene.idle(10);
        Vec3 a = new Vec3(4.5, 5, 1), b = new Vec3(4.5, 1, 4.5), c = new Vec3(4.5, 1, 7.2);
        ElementLink<EntityElement> joueur = survivant(scene, a, 0);
        scene.idle(10);
        bulle(scene, 70, "Tu tombes de haut ? Appuie sur F juste avant de toucher le sol : la roulade retire presque tous les dégâts.", b.add(0, 1, 0));
        geste(scene, joueur, Figurant.Geste.CHUTE, 1);
        sauter(scene, joueur, a, b, 0.5, 14);
        geste(scene, joueur, Figurant.Geste.ROULADE, 12);
        deplacer(scene, joueur, b, c, 12);
        geste(scene, joueur, Figurant.Geste.LIBRE, 1);
        scene.idle(50);
        bulleVerte(scene, 70, "Au sol, F sert aussi à esquiver : une roulade rapide dans la direction où tu marches. Elle a un court temps de recharge.", c.add(0, 1, 0));
        scene.idle(80);
        scene.markAsFinished();
    }

    // --- Vehicules ---

    public static void vehiculeAtelier(SceneBuilder scene, SceneBuildingUtil util) {
        debut(scene, "vehicule_atelier", "Monter son garage");
        String[] etablis = {"itembench", "enginebench", "seatbench", "wheelbench", "vehiclebench"};
        String[] textes = {
            "Établi d'objets : vis, tôles, tubes, bougies, pistons. C'est le premier à fabriquer.",
            "Établi de moteurs : tous les moteurs.",
            "Établi de sièges : sièges, caisses et rangements.",
            "Établi de roues : roues, chenilles et flotteurs.",
            "Établi de véhicules : le véhicule lui-même, dans la couleur de ton choix."
        };
        for (int i = 0; i < etablis.length; i++) {
            Vec3 pos = new Vec3[]{new Vec3(1.5, 1, 2), new Vec3(4.5, 1, 2), new Vec3(7.5, 1, 2), new Vec3(2.5, 1, 6.5), new Vec3(6.5, 1, 6.5)}[i];
            entrer(scene, decor(pos, etablis[i]));
            scene.idle(6);
            scene.overlay().showControls(pos.add(0, 1.2, 0), Pointing.DOWN, 56).withItem(objet("mts:mts." + etablis[i]));
            bulle(scene, 56, textes[i], pos.add(0, 0.6, 0));
            scene.idle(62);
        }
        bulleVerte(scene, 80, "Chaque établi se fabrique sur une table de craft classique. Ouvre le chapitre Véhicules du guide pour les recettes.", new Vec3(4.5, 2.5, 4.5));
        scene.idle(90);
        scene.markAsFinished();
    }

    public static void vehiculeMontage(SceneBuilder scene, SceneBuildingUtil util) {
        debut(scene, "vehicule_montage", "Moteur, sièges et roues");
        Vec3 centre = new Vec3(4.5, 1, 4.5);
        ModeleScene voiture = new ModeleScene(centre, 0.0F, 1.0F).pieceSans(PACK, MUSTANG_OBJ, MUSTANG_TEX, 0.0F, MUSTANG_Y, MUSTANG_Z, "\\$hood");
        int capot = voiture.ouvrant(PACK, MUSTANG_OBJ, MUSTANG_TEX, 0.0F, MUSTANG_Y, MUSTANG_Z, "\\$hood", 0.875F, 2.375F);
        int moteur = voiture.pieceCachee(PACK, PIECES + "enginefordfe428.obj", TEX_PIECES + "enginefordfe428.png", 0.0F, 0.178125F + MUSTANG_Y, 2.69F + MUSTANG_Z, 0.0F, 0.85F);
        int[] roues = new int[MUSTANG_ROUES.length], sieges = new int[MUSTANG_SIEGES.length];
        for (int i = 0; i < roues.length; i++) {
            float[] r = MUSTANG_ROUES[i];
            roues[i] = voiture.pieceCachee(PACK, PIECES + "wheelmedium.obj", TEX_PIECES + "wheelmedium.png", r[0], r[1] + MUSTANG_Y, r[2] + MUSTANG_Z, r[0] < 0.0F ? 180.0F : 0.0F);
        }
        for (int i = 0; i < sieges.length; i++) {
            float[] s = MUSTANG_SIEGES[i];
            sieges[i] = voiture.pieceCachee(PACK, PIECES + "carseat.obj", TEX_PIECES + "carseat_black.png", s[0], s[1] + MUSTANG_Y, s[2] + MUSTANG_Z, 0.0F);
        }
        entrer(scene, voiture);
        scene.idle(10);
        // Le joueur reste du cote visible de la voiture
        Vec3 cote = new Vec3(2.4, 1, 4.1), coin = new Vec3(2.4, 1, 7.7), devant = new Vec3(4.5, 1, 7.7), arriere = new Vec3(2.4, 1, 2.6), avantGauche = new Vec3(2.4, 1, 6.2);
        ElementLink<EntityElement> joueur = survivant(scene, new Vec3(0.7, 1, 1.2), 0);
        bulle(scene, 70, "Un véhicule fabriqué arrive incomplet, sauf le quad. Il se monte en faisant un clic droit dessus avec chaque pièce.", centre.add(0, 1.4, 0));
        scene.idle(30);
        tenir(scene, joueur, objet("mts:mtsofficialpack.carseat_black"));
        deplacer(scene, joueur, new Vec3(0.7, 1, 1.2), cote, 18);
        regarder(scene, joueur, -90);
        scene.idle(10);

        // Les sieges : hologramme vert, clic droit, la piece est posee
        Vec3 posSiege = centre.add(-0.56, 1.2, -0.4);
        action(scene, () -> {
            for (int s : sieges) voiture.hologramme(s, true);
        });
        bulleVerte(scene, 60, "Une pièce en main, un hologramme VERT montre où elle se pose. Clic droit dessus.", posSiege);
        clicAvec(scene, posSiege.add(0, 0.8, 0), objet("mts:mtsofficialpack.carseat_black"), 50);
        scene.idle(50);
        frapper(scene, joueur);
        action(scene, () -> {
            for (int s : sieges) voiture.allumer(s);
        });
        scene.idle(16);

        // Le moteur : capot ouvert, l'emplacement est visible
        Vec3 posMoteur = centre.add(0, 1.0, 1.04);
        tenir(scene, joueur, objet("mts:mtsofficialpack.enginefordfe428"));
        deplacer(scene, joueur, cote, coin, 18);
        deplacer(scene, joueur, coin, devant, 10);
        regarder(scene, joueur, 180);
        scene.idle(6);
        frapper(scene, joueur);
        action(scene, () -> voiture.ouvrir(capot, 60.0F));
        scene.idle(14);
        action(scene, () -> voiture.hologramme(moteur, true));
        bulle(scene, 70, "Même geste pour le moteur : il vient de l'établi de moteurs et se loge sous le capot. Certains véhicules ont déjà le leur.", posMoteur);
        clicAvec(scene, posMoteur.add(0, 1.0, 0), objet("mts:mtsofficialpack.enginefordfe428"), 56);
        scene.idle(60);
        frapper(scene, joueur);
        action(scene, () -> voiture.allumer(moteur));
        scene.idle(24);
        frapper(scene, joueur);
        action(scene, () -> voiture.ouvrir(capot, 0.0F));
        scene.idle(16);

        // Les roues, une par une, en faisant le tour de la voiture
        tenir(scene, joueur, objet("mts:mtsofficialpack.wheelmedium"));
        deplacer(scene, joueur, devant, coin, 10);
        deplacer(scene, joueur, coin, avantGauche, 8);
        regarder(scene, joueur, -90);
        action(scene, () -> voiture.hologramme(roues[2], true));
        bulleVerte(scene, 50, "Les roues aussi : chaque emplacement libre s'affiche en vert quand la roue est en main.", centre.add(-1.1, 0.6, 1.85));
        scene.idle(36);
        frapper(scene, joueur);
        action(scene, () -> voiture.allumer(roues[2]));
        scene.idle(10);
        deplacer(scene, joueur, avantGauche, arriere, 16);
        regarder(scene, joueur, -90);
        action(scene, () -> voiture.hologramme(roues[0], false));
        bulleRouge(scene, 70, "Hologramme ROUGE : le type de pièce est bon, mais pas la taille. Essaie une autre roue ou un autre moteur.", centre.add(-1.1, 0.6, -1.85));
        scene.idle(76);
        action(scene, () -> voiture.hologramme(roues[0], true));
        scene.idle(14);
        frapper(scene, joueur);
        action(scene, () -> {
            voiture.allumer(roues[1]);
            voiture.allumer(roues[0]);
            voiture.allumer(roues[2]);
        });
        scene.idle(14);

        tenir(scene, joueur, objet("mts:mts.wrench"));
        clicAvec(scene, centre.add(-1.4, 1.2, -1.85), objet("mts:mts.wrench"), 60);
        bulle(scene, 60, "Pour retirer une pièce : clic gauche dessus avec la clé. Accroupi, la clé range le véhicule entier.", centre.add(-1.1, 0.8, -1.85));
        scene.idle(30);
        frapper(scene, joueur);
        scene.idle(40);
        scene.markAsFinished();
    }

    public static void vehiculePlein(SceneBuilder scene, SceneBuildingUtil util) {
        debut(scene, "vehicule_plein", "Faire le plein");
        Vec3 centre = new Vec3(5.2, 1, 4.5);
        entrer(scene, mustang(centre));
        Vec3 pompe = new Vec3(1.5, 1, 3.5);
        entrer(scene, decor(pompe, "fuelpump"));
        scene.idle(20);
        ElementLink<EntityElement> joueur = survivant(scene, new Vec3(1.5, 1, 0.8), 0);
        scene.overlay().showControls(pompe.add(0, 2.2, 0), Pointing.DOWN, 60).withItem(objet("mts:mts.fuelpump"));
        bulle(scene, 60, "Pose une pompe à carburant à côté du véhicule.", pompe.add(0, 1, 0));
        deplacer(scene, joueur, new Vec3(1.5, 1, 0.8), new Vec3(1.5, 1, 2.1), 14);
        scene.idle(48);
        tenir(scene, joueur, objet("minecraft:lava_bucket"));
        frapper(scene, joueur);
        clicAvec(scene, pompe.add(0, 2.2, 0), objet("minecraft:lava_bucket"), 60);
        bulleVerte(scene, 60, "Clic droit sur la pompe avec un seau de lave : pour l'instant, c'est le carburant disponible dans le monde.", pompe.add(0, 1, 0));
        scene.idle(66);
        scene.overlay().showLine(PonderPalette.GREEN, pompe.add(0, 1.2, 0), centre.add(-1.15, 0.9, -1.3), 60);
        tenir(scene, joueur, ItemStack.EMPTY);
        frapper(scene, joueur);
        clicAvec(scene, pompe.add(0, 2.2, 0), ItemStack.EMPTY, 60);
        bulle(scene, 60, "Clic droit main vide : la pompe se branche toute seule au véhicule le plus proche et le remplit.", centre.add(-1.15, 0.9, -1.3));
        scene.idle(70);
        bulle(scene, 70, "Loin de la base, garde un jerrycan plein : il se fabrique sur une table de craft et se vide dans le réservoir.", centre.add(0, 1.4, 0));
        scene.idle(80);
        scene.markAsFinished();
    }

    public static void vehiculeConduite(SceneBuilder scene, SceneBuildingUtil util) {
        debut(scene, "vehicule_conduite", "Démarrer et conduire");
        Vec3 depart = new Vec3(4.5, 1, 3.5);
        ModeleScene voiture = entrer(scene, mustang(depart));
        scene.idle(10);
        ElementLink<EntityElement> joueur = survivant(scene, new Vec3(7.6, 1, 3.1), 90);
        scene.idle(6);
        deplacer(scene, joueur, new Vec3(7.6, 1, 3.1), new Vec3(6.3, 1, 3.1), 14);
        frapper(scene, joueur);
        clicAvec(scene, depart.add(0.56, 1.5, -0.4), ItemStack.EMPTY, 50);
        bulle(scene, 50, "Clic droit sur un siège pour monter. Pas de siège, pas de conduite.", depart.add(0.56, 1, -0.4));
        scene.idle(56);
        Vec3 dedans = depart.add(0.5635, -0.33, -0.4);
        geste(scene, joueur, Figurant.Geste.ASSIS, 1);
        regarder(scene, joueur, 0);
        scene.world().modifyEntity(joueur, e -> e.setPos(dedans));
        scene.idle(10);
        bulleVerte(scene, 60, "Z : avancer. S : freiner, puis reculer une fois à l'arrêt. Q et D : tourner.", depart.add(0, 2, 2));
        Vec3 arrivee = depart.add(0, 0, 2);
        Vec3 sieges = dedans.add(0, 0, 2);
        for (int i = 1; i <= 34; i++) {
            double t = i / 34.0;
            double doux = t * t * (3 - 2 * t);
            Vec3 ici = depart.lerp(arrivee, doux), lui = dedans.lerp(sieges, doux);
            action(scene, () -> voiture.placer(ici, 0.0F, 0.0F));
            scene.world().modifyEntity(joueur, e -> e.setPos(lui));
            scene.idle(1);
        }
        scene.idle(4);
        bulle(scene, 60, "N : frein à main. G : phares. H : klaxon. X : changer de vue. U : tableau de bord complet.", arrivee.add(0, 2, 0));
        scene.idle(70);
        bulle(scene, 60, "Maj pour descendre. Le frein à main se met tout seul.", sieges.add(0, 1.2, 0));
        scene.idle(70);
        scene.markAsFinished();
    }

    public static void avionDecollage(SceneBuilder scene, SceneBuildingUtil util) {
        debut(scene, "avion_decollage", "Décoller et atterrir");
        Vec3 sol = new Vec3(4.5, 1, 2.6);
        ModeleScene avion = entrer(scene, skyhawk(sol));
        scene.idle(20);
        bulle(scene, 70, "Tirer sur le manche ne fait PAS monter un avion. C'est la vitesse qui le porte.", sol.add(0, 1.3, 0));
        scene.idle(80);
        action(scene, () -> avion.regime(60.0F));
        bulleVerte(scene, 60, "Flèche du haut à fond pour mettre les gaz, et roule tout droit, loin des arbres.", sol.add(0, 1, 2.5));
        Vec3 piste = sol.add(0, 0, 2.2);
        piloter(scene, avion, piste, 0.0F, 0.0F, 50);
        scene.idle(10);
        bulle(scene, 60, "Une fois lancé, tire doucement sur S : l'avion quitte le sol. H sort les volets pour décoller plus court.", piste.add(0, 2, 0));
        Vec3 ciel = piste.add(0, 3, 1);
        piloter(scene, avion, ciel, 14.0F, 0.0F, 50);
        scene.idle(10);
        bulle(scene, 60, "En vol : Q et D inclinent, c'est ainsi qu'on tourne. Les flèches gauche et droite font pivoter le nez.", ciel.add(0, 1, 0));
        piloter(scene, avion, ciel.add(0.5, 0, 0), 0.0F, 22.0F, 25);
        piloter(scene, avion, ciel, 0.0F, 0.0F, 25);
        scene.idle(10);
        bulleRouge(scene, 70, "Pour descendre, ralentis : la flèche du bas réduit les gaz, Z baisse le nez. Sans vitesse, l'avion décroche.", ciel.add(0, 1, 0));
        action(scene, () -> avion.regime(25.0F));
        piloter(scene, avion, sol, -6.0F, 0.0F, 66);
        piloter(scene, avion, sol, 0.0F, 0.0F, 8);
        action(scene, () -> avion.regime(0.0F));
        bulle(scene, 50, "Au sol, G freine et N serre le frein à main.", sol.add(0, 1.3, 0));
        scene.idle(60);
        scene.markAsFinished();
    }

    public static void helicoVol(SceneBuilder scene, SceneBuildingUtil util) {
        debut(scene, "helico_vol", "Piloter un hélicoptère");
        Vec3 sol = new Vec3(4.5, 1, 4.2);
        ModeleScene helico = entrer(scene, bell206(sol));
        scene.idle(20);
        action(scene, () -> helico.regime(10.0F));
        bulle(scene, 60, "Attends que le rotor tourne à plein régime avant de décoller.", sol.add(0, 2.2, 0));
        scene.idle(30);
        action(scene, () -> helico.regime(50.0F));
        scene.idle(40);
        bulleVerte(scene, 60, "Flèche du haut : monter. Flèche du bas : descendre. Maintiens-la jusqu'à l'altitude voulue.", sol.add(0, 3, 0));
        Vec3 haut = sol.add(0, 2.5, 0);
        piloter(scene, helico, haut, 0.0F, 0.0F, 50);
        scene.idle(16);
        bulle(scene, 60, "Z et S : avancer et reculer. Q et D : glisser sur le côté. Flèches gauche et droite : tourner.", haut.add(0, 2, 0));
        piloter(scene, helico, haut.add(0, 0, 1.5), 12.0F, 0.0F, 24);
        piloter(scene, helico, haut.add(0, 0, 1.5), 0.0F, 0.0F, 16);
        scene.idle(26);
        bulleVerte(scene, 60, "Lâche tout : il se remet à plat tout seul. Il ne faut pas lutter.", haut.add(0, 2, 1.5));
        scene.idle(70);
        bulle(scene, 60, "Pour te poser, relâche la flèche du haut et donne de petits coups sur celle du bas.", haut.add(0, 1, 1.5));
        piloter(scene, helico, sol, 0.0F, 0.0F, 60);
        action(scene, () -> helico.regime(15.0F));
        scene.idle(10);
        scene.markAsFinished();
    }

    // --- Soins ---

    public static void soinsBandage(SceneBuilder scene, SceneBuildingUtil util) {
        debut(scene, "soins_bandage", "Soigner une blessure");
        Vec3 pos = new Vec3(4.5, 1, 4.5);
        ElementLink<EntityElement> joueur = survivant(scene, pos, 0);
        ElementLink<EntityElement> z = infecte(scene, new Vec3(4.5, 1, 7.5), 180);
        scene.idle(10);
        bulleRouge(scene, 60, "Chaque partie du corps encaisse à part : jambe touchée, tu ralentis. Tête ou torse à zéro, tu tombes.", pos.add(0, 1.5, 0));
        deplacer(scene, z, new Vec3(4.5, 1, 7.5), new Vec3(4.5, 1, 5.5), 30);
        frapper(scene, z);
        scene.idle(5);
        scene.world().modifyEntity(joueur, e -> e.setPos(pos.add(0, 0, -0.3)));
        scene.effects().emitParticles(pos.add(0, 1, 0), scene.effects().simpleParticleEmitter(ParticleTypes.DAMAGE_INDICATOR, Vec3.ZERO), 8, 2);
        scene.idle(36);
        geste(scene, joueur, Figurant.Geste.SOIN, 1);
        scene.world().modifyEntity(z, Entity::discard);
        bulle(scene, 60, "J affiche tes blessures partie par partie.", pos.add(0, 2, 0));
        scene.idle(70);
        tenir(scene, joueur, objet("firstaid:bandage"));
        frapper(scene, joueur);
        clicAvec(scene, pos.add(0, 2, 0), objet("firstaid:bandage"), 70);
        bulleVerte(scene, 70, "Bandage en main, clic droit, puis choisis la partie à soigner dans le menu.", pos.add(0, 1, 0));
        scene.idle(80);
        tenir(scene, joueur, objet("firstaid:morphine"));
        frapper(scene, joueur);
        clicAvec(scene, pos.add(0, 2, 0), objet("firstaid:morphine"), 60);
        bulle(scene, 60, "La morphine et les antidouleurs calment la douleur, mais ne soignent rien.", pos.add(0, 1, 0));
        scene.idle(70);
        scene.markAsFinished();
    }

    public static void soinsTerre(SceneBuilder scene, SceneBuildingUtil util) {
        debut(scene, "soins_a_terre", "À terre : se relever");
        Vec3 sol = new Vec3(4.5, 1, 4.5);
        ElementLink<EntityElement> joueur = survivant(scene, sol, 0);
        geste(scene, joueur, Figurant.Geste.A_TERRE, 1);
        scene.idle(20);
        bulleRouge(scene, 70, "À zéro, tu ne meurs pas tout de suite : tu tombes à terre et le compte à rebours démarre.", sol.add(0, 1, 0));
        scene.idle(80);
        ElementLink<EntityElement> allie = survivant(scene, new Vec3(1.5, 1, 4.5), 270);
        scene.idle(10);
        deplacer(scene, allie, new Vec3(1.5, 1, 4.5), new Vec3(3.3, 1, 4.5), 24);
        geste(scene, allie, Figurant.Geste.SOIN, 1);
        tenir(scene, allie, objet("firstaid:bandage"));
        frapper(scene, allie);
        clicAvec(scene, sol.add(0, 1, 0), ItemStack.EMPTY, 70);
        bulleVerte(scene, 70, "Un allié peut te relever : bandage, pansement ou défibrillateur en main, il maintient le clic droit sur toi.", sol.add(0, 1, 0));
        scene.idle(76);
        geste(scene, joueur, Figurant.Geste.LIBRE, 1);
        scene.idle(10);
        clicAvec(scene, sol.add(0, 2, 0), objet("firstaid:defibrillator"), 70);
        bulle(scene, 70, "Seul ? Avec un défibrillateur sur toi : maintiens le clic droit 3 secondes pour te relever.", sol.add(0, 1, 0));
        scene.idle(80);
        bulleRouge(scene, 70, "Maintenir G pendant 3 secondes abandonne et te fait mourir. Ton corps garde tes affaires : reviens les chercher.", sol.add(0, 1, 0));
        scene.idle(80);
        scene.markAsFinished();
    }

    // --- Armes ---

    public static void armesBruit(SceneBuilder scene, SceneBuildingUtil util) {
        debut(scene, "armes_bruit", "Le bruit attire");
        Vec3 pos = new Vec3(4.5, 1, 4.5);
        ElementLink<EntityElement> tireur = survivant(scene, pos, 0);
        tenir(scene, tireur, arme());
        geste(scene, tireur, Figurant.Geste.VISEE, 1);
        scene.idle(20);
        bulle(scene, 60, "Clic gauche pour tirer, clic droit pour viser, R pour recharger, G pour le mode de tir.", pos.add(0, 2, 0));
        scene.idle(70);
        scene.effects().emitParticles(pos.add(0, 1.5, 0.6), scene.effects().simpleParticleEmitter(ParticleTypes.SMOKE, Vec3.ZERO), 8, 2);
        bulleRouge(scene, 60, "Chaque coup de feu s'entend de loin : les infectés et les zombies alentour viennent vers toi. Les autres monstres, non.", pos.add(0, 2, 0));
        ElementLink<EntityElement> a = infecte(scene, new Vec3(0.5, 1, 8.5), 135);
        ElementLink<EntityElement> b = infecte(scene, new Vec3(8.5, 1, 8.5), 225);
        ElementLink<EntityElement> c = infecte(scene, new Vec3(0.5, 1, 0.5), 45);
        for (int i = 1; i <= 50; i++) {
            double t = i / 50.0;
            scene.world().modifyEntity(a, e -> pas(e, new Vec3(0.5 + 2.5 * t, 1, 8.5 - 2.5 * t)));
            scene.world().modifyEntity(b, e -> pas(e, new Vec3(8.5 - 2.5 * t, 1, 8.5 - 2.5 * t)));
            scene.world().modifyEntity(c, e -> pas(e, new Vec3(0.5 + 2.5 * t, 1, 0.5 + 2.5 * t)));
            scene.idle(1);
        }
        freiner(scene, a);
        freiner(scene, b);
        freiner(scene, c);
        bulleVerte(scene, 70, "Un silencieux réduit fortement la portée du bruit. Il s'ajoute avec W, l'arme en main.", pos.add(0, 2, 0));
        scene.idle(80);
        bulle(scene, 60, "X donne un coup de crosse, et H sert à ouvrir une porte l'arme en main.", pos.add(0, 2, 0));
        scene.idle(70);
        scene.markAsFinished();
    }

    // --- Mines ---

    public static void minesGaz(SceneBuilder scene, SceneBuildingUtil util) {
        debut(scene, "mines_gaz", "Poche de gaz");
        // La paroi au fond : on voit le joueur et le trou par-devant
        scene.rotateCameraY(180);
        remplir(scene, util, 0, 1, 6, 8, 4, 8);
        scene.idle(10);
        Vec3 pos = new Vec3(4.5, 1, 5.1);
        ElementLink<EntityElement> joueur = survivant(scene, new Vec3(4.5, 1, 2.2), 0);
        tenir(scene, joueur, objet("minecraft:iron_pickaxe"));
        deplacer(scene, joueur, new Vec3(4.5, 1, 2.2), pos, 18);
        bulle(scene, 60, "Sous le niveau 0, un bloc cassé peut percer une poche de gaz. Un message et une fumée te préviennent.", new Vec3(4.5, 2, 6));
        for (int i = 0; i < 3; i++) {
            frapper(scene, joueur);
            scene.idle(7);
        }
        scene.world().destroyBlock(util.grid().at(4, 2, 6));
        scene.effects().emitParticles(new Vec3(4.5, 2.5, 6.5), scene.effects().simpleParticleEmitter(ParticleTypes.CAMPFIRE_COSY_SMOKE, new Vec3(0, 0.02, -0.02)), 2, 60);
        scene.idle(70);
        bulleRouge(scene, 60, "Une torche ou une lanterne en main fait tout exploser. La lampe torche, elle, ne risque rien.", pos.add(0, 2, 0));
        scene.idle(70);
        bulleVerte(scene, 60, "Recule tout de suite : le gaz empoisonne, sauf si tu as un masque sur toi.", pos.add(0, 2, 0));
        regarder(scene, joueur, 180);
        deplacer(scene, joueur, pos, new Vec3(4.5, 1, 0.8), 24);
        scene.idle(40);
        scene.markAsFinished();
    }
}
