p = r"C:/Users/El-Afdal/Desktop/Atheria Zombie Edition/outils/atheria-monde-mod/src/fr/atheria/monde/PoseLieux.java"
t = open(p, encoding="utf-8").read()
R = [
 ("record Lieu(String nom, ResourceLocation modele, BlockPos origine, boolean souterrain, String apres) {}",
  "// origine = coin bas nord-ouest de l'emprise APRES rotation ; rotation 0, 90, 180 ou 270 (sens horaire vu du dessus)\n    record Lieu(String nom, ResourceLocation modele, BlockPos origine, boolean souterrain, String apres, int rotation) {}"),
 ("o.has(\"apres\") ? o.get(\"apres\").getAsString() : null));",
  "o.has(\"apres\") ? o.get(\"apres\").getAsString() : null, o.has(\"rotation\") ? o.get(\"rotation\").getAsInt() : 0));"),
 ("        Vec3i s = e.modele.getSize();\n",
  "        Vec3i s = e.modele.getSize(rotation(li));\n"),
 ("                StructurePlaceSettings r = new StructurePlaceSettings().setIgnoreEntities(true);\n                e.modele.placeInWorld(niveau, li.origine(), li.origine(), r, niveau.getRandom(), Block.UPDATE_CLIENTS | Block.UPDATE_KNOWN_SHAPE);",
  "                StructurePlaceSettings r = new StructurePlaceSettings().setIgnoreEntities(true).setRotation(rotation(li));\n                // la rotation tourne autour du coin d'origine : on recale pour que l'emprise commence a l'origine voulue\n                net.minecraft.world.level.levelgen.structure.BoundingBox bb = e.modele.getBoundingBox(r, BlockPos.ZERO);\n                BlockPos pos = li.origine().offset(-bb.minX(), 0, -bb.minZ());\n                e.modele.placeInWorld(niveau, pos, pos, r, niveau.getRandom(), Block.UPDATE_CLIENTS | Block.UPDATE_KNOWN_SHAPE);"),
 ("    private static Etat etat(ServerLevel niveau, Lieu li) {",
  "    private static net.minecraft.world.level.block.Rotation rotation(Lieu li) {\n        return switch (((li.rotation() % 360) + 360) % 360) {\n            case 90 -> net.minecraft.world.level.block.Rotation.CLOCKWISE_90;\n            case 180 -> net.minecraft.world.level.block.Rotation.CLOCKWISE_180;\n            case 270 -> net.minecraft.world.level.block.Rotation.COUNTERCLOCKWISE_90;\n            default -> net.minecraft.world.level.block.Rotation.NONE;\n        };\n    }\n\n    private static Etat etat(ServerLevel niveau, Lieu li) {"),
 ("li.origine().toShortString() + \" (\" + e.modele.getSize().toShortString() + \")\");",
  "li.origine().toShortString() + \" (\" + e.modele.getSize(rotation(li)).toShortString() + \", rotation \" + li.rotation() + \")\");"),
]
for a, b in R:
    assert t.count(a) == 1, a
    t = t.replace(a, b)
open(p, "w", encoding="utf-8").write(t)
print("ok")
