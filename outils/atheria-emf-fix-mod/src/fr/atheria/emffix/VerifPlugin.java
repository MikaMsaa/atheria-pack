package fr.atheria.emffix;

import java.util.List;
import java.util.Set;

import org.objectweb.asm.tree.ClassNode;
import org.objectweb.asm.tree.MethodNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.spongepowered.asm.mixin.extensibility.IMixinConfigPlugin;
import org.spongepowered.asm.mixin.extensibility.IMixinInfo;

/**
 * Signale clairement dans le journal si une mise a jour d'EMF Compat a change la methode visee :
 * le correctif est alors inactif (sans planter le jeu), et il faut l'adapter.
 */
public class VerifPlugin implements IMixinConfigPlugin {
    private static final Logger LOG = LoggerFactory.getLogger("Atheria EMF Fix");

    @Override public void onLoad(String mixinPackage) {}
    @Override public String getRefMapperConfig() { return null; }
    @Override public boolean shouldApplyMixin(String targetClassName, String mixinClassName) { return true; }
    @Override public void acceptTargets(Set<String> myTargets, Set<String> otherTargets) {}
    @Override public List<String> getMixins() { return null; }

    @Override
    public void preApply(String targetClassName, ClassNode targetClass, String mixinClassName, IMixinInfo mixinInfo) {
        boolean trouve = false;
        for (MethodNode m : targetClass.methods) {
            if ("lerpAngle".equals(m.name) && "(FFF)F".equals(m.desc)) { trouve = true; break; }
        }
        if (trouve) LOG.info("Correctif actif sur {}.lerpAngle (melange continu des poses)", targetClassName);
        else LOG.warn("ATTENTION : {}.lerpAngle(FFF)F introuvable (EMF Compat a change) : correctif INACTIF, a adapter", targetClassName);
    }

    @Override public void postApply(String targetClassName, ClassNode targetClass, String mixinClassName, IMixinInfo mixinInfo) {}
}
