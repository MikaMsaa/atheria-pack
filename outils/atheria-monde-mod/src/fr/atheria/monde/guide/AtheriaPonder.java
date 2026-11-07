package fr.atheria.monde.guide;

import net.createmod.ponder.api.registration.PonderPlugin;
import net.createmod.ponder.api.registration.PonderSceneRegistrationHelper;
import net.minecraft.resources.ResourceLocation;

// Les tutoriels animes du guide passent par le moteur de Create : chaque groupe de scenes est attache a un objet du jeu.
public class AtheriaPonder implements PonderPlugin {
    public static final String MOD = "atheria_monde";
    public static final AtheriaPonder INSTANCE = new AtheriaPonder();

    @Override
    public String getModId() {
        return MOD;
    }

    @Override
    public void registerScenes(PonderSceneRegistrationHelper<ResourceLocation> helper) {
        ResourceLocation parkour = ResourceLocation.parse("minecraft:leather_boots");
        helper.addStoryBoard(parkour, "course", AtheriaScenes::parkourCourse);
        helper.addStoryBoard(parkour, "obstacle", AtheriaScenes::parkourObstacle);
        helper.addStoryBoard(parkour, "grimper", AtheriaScenes::parkourGrimper);
        helper.addStoryBoard(parkour, "chute", AtheriaScenes::parkourChute);

        ResourceLocation vehicule = ResourceLocation.parse("mts:mts.handbook_car");
        helper.addStoryBoard(vehicule, "atelier", AtheriaScenes::vehiculeAtelier);
        helper.addStoryBoard(vehicule, "montage", AtheriaScenes::vehiculeMontage);
        helper.addStoryBoard(vehicule, "pompe", AtheriaScenes::vehiculePlein);
        helper.addStoryBoard(vehicule, "voiture", AtheriaScenes::vehiculeConduite);

        ResourceLocation avion = ResourceLocation.parse("mts:mts.handbook_plane");
        helper.addStoryBoard(avion, "avion", AtheriaScenes::avionDecollage);
        helper.addStoryBoard(avion, "helico", AtheriaScenes::helicoVol);

        ResourceLocation soins = ResourceLocation.parse("firstaid:bandage");
        helper.addStoryBoard(soins, "plateau", AtheriaScenes::soinsBandage);
        helper.addStoryBoard(soins, "plateau", AtheriaScenes::soinsTerre);

        helper.addStoryBoard(ResourceLocation.parse("minecraft:crossbow"), "plateau", AtheriaScenes::armesBruit);
        helper.addStoryBoard(ResourceLocation.parse("minecraft:iron_pickaxe"), "gaz", AtheriaScenes::minesGaz);
    }
}
