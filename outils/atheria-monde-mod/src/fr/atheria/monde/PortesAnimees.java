package fr.atheria.monde;

import com.mojang.blaze3d.vertex.PoseStack;
import com.mojang.math.Axis;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import net.minecraft.client.Minecraft;
import net.minecraft.client.renderer.LevelRenderer;
import net.minecraft.client.renderer.MultiBufferSource;
import net.minecraft.client.renderer.texture.OverlayTexture;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.DoorBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.properties.DoorHingeSide;
import net.minecraft.world.phys.Vec3;
import net.neoforged.neoforge.client.event.RenderLevelStageEvent;
import net.neoforged.neoforge.client.model.data.ModelData;
import net.neoforged.neoforge.common.NeoForge;

// Anime l'ouverture des portes, cote client uniquement : aucune entite, rien sur le serveur.
// La porte du decor est cachee au moment de la construction du chunk, et une copie tourne autour de ses gonds.
public final class PortesAnimees {
    private static final long DUREE_NS = 280_000_000L;
    // La copie reste un instant apres la fin : la vraie porte met une ou deux images a reapparaitre
    private static final long RELAIS_NS = 160_000_000L;
    private static final double PORTEE_CARRE = 48 * 48;
    private static final double RETRAIT = 6.5 / 16.0;
    private static final int MAX_ANIMATIONS = 32;

    private static final Map<Long, Animation> ACTIVES = new ConcurrentHashMap<>();
    private static final Set<Long> CACHEES = ConcurrentHashMap.newKeySet();
    private static boolean enregistre;

    private static final class Animation {
        final BlockPos pos;
        final BlockState fermee;
        final double pivotX;
        final double pivotZ;
        final float angleDebut;
        final float angleFin;
        final long debut;
        boolean terminee;

        Animation(BlockPos pos, BlockState fermee, double pivotX, double pivotZ, float angleDebut, float angleFin, long debut) {
            this.pos = pos;
            this.fermee = fermee;
            this.pivotX = pivotX;
            this.pivotZ = pivotZ;
            this.angleDebut = angleDebut;
            this.angleFin = angleFin;
            this.debut = debut;
        }
    }

    private PortesAnimees() {
    }

    public static void changement(Level level, BlockPos pos, BlockState avant, BlockState apres) {
        if (!(apres.getBlock() instanceof DoorBlock) || avant.getBlock() != apres.getBlock()) return;
        boolean ouverte = apres.getValue(DoorBlock.OPEN);
        if (avant.getValue(DoorBlock.OPEN) == ouverte) return;
        Minecraft mc = Minecraft.getInstance();
        if (mc.gameRenderer == null || ACTIVES.size() >= MAX_ANIMATIONS) return;
        if (mc.gameRenderer.getMainCamera().getPosition().distanceToSqr(pos.getX(), pos.getY(), pos.getZ()) > PORTEE_CARRE) return;
        if (!enregistre) {
            enregistre = true;
            NeoForge.EVENT_BUS.addListener(PortesAnimees::rendu);
        }
        Direction face = apres.getValue(DoorBlock.FACING);
        // Meme logique que DoorBlock : gonds a droite, la porte ouverte se range a la droite horaire de "face"
        Direction cote = apres.getValue(DoorBlock.HINGE) == DoorHingeSide.RIGHT ? face.getClockWise() : face.getCounterClockWise();
        double pivotX = 0.5 + (cote.getStepX() - face.getStepX()) * RETRAIT;
        double pivotZ = 0.5 + (cote.getStepZ() - face.getStepZ()) * RETRAIT;
        // Fermee, la porte s'etend a l'oppose de "cote" ; ouverte, elle s'etend vers "face"
        int dx = -cote.getStepX();
        int dz = -cote.getStepZ();
        float angle = dz == face.getStepX() && -dx == face.getStepZ() ? 90f : -90f;
        BlockPos fixe = pos.immutable();
        long cle = fixe.asLong();
        // Une porte actionnee en pleine animation repart de sa position actuelle
        float depart = ouverte ? 0f : angle;
        Animation encours = ACTIVES.get(cle);
        long maintenant = System.nanoTime();
        if (encours != null && !encours.terminee) depart = angleCourant(encours, maintenant);
        CACHEES.add(cle);
        ACTIVES.put(cle, new Animation(fixe, apres.setValue(DoorBlock.OPEN, false), pivotX, pivotZ, depart, ouverte ? angle : 0f, maintenant));
    }

    public static boolean cachee(BlockPos pos) {
        return !CACHEES.isEmpty() && CACHEES.contains(pos.asLong());
    }

    private static float angleCourant(Animation a, long maintenant) {
        float t = Math.min(1f, (maintenant - a.debut) / (float) DUREE_NS);
        float doux = t * t * (3f - 2f * t);
        return a.angleDebut + (a.angleFin - a.angleDebut) * doux;
    }

    private static void rendu(RenderLevelStageEvent event) {
        if (event.getStage() != RenderLevelStageEvent.Stage.AFTER_ENTITIES || ACTIVES.isEmpty()) return;
        Minecraft mc = Minecraft.getInstance();
        if (mc.level == null) {
            ACTIVES.clear();
            CACHEES.clear();
            return;
        }
        Vec3 camera = event.getCamera().getPosition();
        PoseStack pile = new PoseStack();
        MultiBufferSource.BufferSource tampon = mc.renderBuffers().bufferSource();
        long maintenant = System.nanoTime();
        for (Animation a : ACTIVES.values()) {
            long ecoule = maintenant - a.debut;
            BlockState reel = mc.level.getBlockState(a.pos);
            if (!(reel.getBlock() == a.fermee.getBlock()) || ecoule > DUREE_NS + RELAIS_NS) {
                liberer(mc, a);
                ACTIVES.remove(a.pos.asLong(), a);
                continue;
            }
            if (ecoule > DUREE_NS) liberer(mc, a);
            pile.pushPose();
            pile.translate(a.pos.getX() - camera.x + a.pivotX, a.pos.getY() - camera.y, a.pos.getZ() - camera.z + a.pivotZ);
            pile.mulPose(Axis.YP.rotationDegrees(angleCourant(a, maintenant)));
            pile.translate(-a.pivotX, 0.0, -a.pivotZ);
            int lumiere = LevelRenderer.getLightColor(mc.level, a.pos);
            mc.getBlockRenderer().renderSingleBlock(a.fermee, pile, tampon, lumiere, OverlayTexture.NO_OVERLAY, ModelData.EMPTY, null);
            pile.popPose();
        }
        tampon.endBatch();
    }

    private static void liberer(Minecraft mc, Animation a) {
        if (a.terminee) return;
        a.terminee = true;
        CACHEES.remove(a.pos.asLong());
        mc.levelRenderer.setBlocksDirty(a.pos.getX(), a.pos.getY(), a.pos.getZ(), a.pos.getX(), a.pos.getY(), a.pos.getZ());
    }
}
